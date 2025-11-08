import os
import threading
import customtkinter as ctk
from tkinter import filedialog, messagebox
from PIL import Image
import numpy as np
import rawpy

# ==================================================
# Utility functions for compression (same logic)
# ==================================================

def progress_log(callback, msg, progress=None):
    """Helper to report status messages to GUI."""
    if callback:
        callback(msg, progress)
    else:
        print(msg)

def make_dct_matrix(n=8):
    import math
    D = np.zeros((n, n), dtype=np.float64)
    for u in range(n):
        for v in range(n):
            alpha = math.sqrt(1.0 / n) if u == 0 else math.sqrt(2.0 / n)
            D[u, v] = alpha * math.cos(((2 * v + 1) * u * math.pi) / (2.0 * n))
    return D

D8 = make_dct_matrix(8)
ID8 = D8.T

STD_LUMA_Q = np.array([
 [16,11,10,16,24,40,51,61],
 [12,12,14,19,26,58,60,55],
 [14,13,16,24,40,57,69,56],
 [14,17,22,29,51,87,80,62],
 [18,22,37,56,68,109,103,77],
 [24,35,55,64,81,104,113,92],
 [49,64,78,87,103,121,120,101],
 [72,92,95,98,112,100,103,99]
], dtype=np.float64)

STD_CHROMA_Q = np.array([
 [17,18,24,47,99,99,99,99],
 [18,21,26,66,99,99,99,99],
 [24,26,56,99,99,99,99,99],
 [47,66,99,99,99,99,99,99],
 [99,99,99,99,99,99,99,99],
 [99,99,99,99,99,99,99,99],
 [99,99,99,99,99,99,99,99],
 [99,99,99,99,99,99,99,99]
], dtype=np.float64)

def scale_quant_table(qtable, quality):
    import math
    q = max(1, min(100, quality))
    scale = 5000 / q if q < 50 else 200 - 2 * q
    scaled = np.floor((qtable * scale + 50) / 100)
    scaled = np.clip(scaled, 1, 255)
    return scaled

def dct_block(block): return D8 @ block @ ID8
def idct_block(coeffs): return ID8 @ coeffs @ D8

def rgb_to_ycbcr(rgb):
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    Y  =  0.299*R + 0.587*G + 0.114*B
    Cb = -0.168736*R - 0.331264*G + 0.5*B + 128
    Cr =  0.5*R - 0.418688*G - 0.081312*B + 128
    return Y, Cb, Cr

def ycbcr_to_rgb(Y, Cb, Cr):
    R = Y + 1.402 * (Cr - 128)
    G = Y - 0.344136 * (Cb - 128) - 0.714136 * (Cr - 128)
    B = Y + 1.772 * (Cb - 128)
    return np.stack([R, G, B], axis=-1)

def pad_to_multiple(img_channel, block=8):
    h, w = img_channel.shape
    pad_h = (block - h % block) % block
    pad_w = (block - w % block) % block
    return np.pad(img_channel, ((0, pad_h), (0, pad_w)), mode='edge')

def process_channel_blocks(channel, qtable):
    padded = pad_to_multiple(channel, 8)
    H, W = padded.shape
    out = np.zeros_like(padded)
    for i in range(0, H, 8):
        for j in range(0, W, 8):
            block = padded[i:i+8, j:j+8].astype(np.float64) - 128
            coeffs = dct_block(block)
            q = np.round(coeffs / qtable)
            rec = idct_block(q * qtable) + 128
            out[i:i+8, j:j+8] = rec
    return np.clip(out[:channel.shape[0], :channel.shape[1]], 0, 255).astype(np.uint8)

def _downsample_simple(channel):
    h, w = channel.shape
    padded = np.pad(channel, ((0, h % 2), (0, w % 2)), mode='edge')
    return padded.reshape((padded.shape[0]//2, 2, padded.shape[1]//2, 2)).mean(axis=(1,3))

def read_with_rawpy(path, output_bps=8):
    with rawpy.imread(path) as raw:
        return raw.postprocess(use_camera_wb=True, no_auto_bright=True, output_bps=output_bps)

# ==================================================
# Enhanced compressor with progress callback
# ==================================================
def compress_raw_auto(input_path, output_path, scale=1.0, quality=75,
                      raw_width=None, raw_height=None,
                      chroma_subsample=True, progress_callback=None):

    progress_log(progress_callback, f"[info] Input file: {input_path} (ext={os.path.splitext(input_path)[1].lower()})", 0.05)

    img = read_with_rawpy(input_path, output_bps=8)
    progress_log(progress_callback, "[info] Using rawpy to decode camera RAW (DNG/CR2/NEF/ARW...)", 0.15)

    img = img.astype(np.float64)
    if scale != 1.0:
        pil = Image.fromarray(np.uint8(img))
        new_w, new_h = int(pil.width * scale), int(pil.height * scale)
        img = np.array(pil.resize((new_w, new_h), resample=Image.LANCZOS))
        progress_log(progress_callback, f"[info] Downscaled to {new_w}x{new_h}", 0.25)

    H, W, _ = img.shape
    progress_log(progress_callback, f"[info] Working resolution: {W}x{H}", 0.3)

    Y, Cb, Cr = rgb_to_ycbcr(img)
    if chroma_subsample:
        Cb_ds, Cr_ds = _downsample_simple(Cb), _downsample_simple(Cr)
        Cb, Cr = np.repeat(np.repeat(Cb_ds, 2, 0), 2, 1), np.repeat(np.repeat(Cr_ds, 2, 0), 2, 1)
        progress_log(progress_callback, "[info] Performed simple 4:2:0-style subsampling (conceptually).", 0.4)

    qY, qC = scale_quant_table(STD_LUMA_Q, quality), scale_quant_table(STD_CHROMA_Q, quality)
    progress_log(progress_callback, "[info] Compressing Y channel (DCT+quant)...", 0.5)
    Y_rec = process_channel_blocks(Y, qY)

    progress_log(progress_callback, "[info] Compressing Cb channel (DCT+quant)...", 0.65)
    Cb_rec = process_channel_blocks(Cb, qC)

    progress_log(progress_callback, "[info] Compressing Cr channel (DCT+quant)...", 0.8)
    Cr_rec = process_channel_blocks(Cr, qC)

    rgb_rec = ycbcr_to_rgb(Y_rec, Cb_rec, Cr_rec)
    Image.fromarray(np.clip(rgb_rec, 0, 255).astype(np.uint8)).save(output_path, "JPEG", quality=int(quality))

    progress_log(progress_callback, f"[done] Saved compressed JPEG to: {output_path}", 1.0)

# ==================================================
# GUI with live progress log
# ==================================================
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

class RawCompressorApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("📸 RAW to JPEG Compressor")
        self.geometry("950x650")
        self.resizable(False, False)
        self.build_ui()

    def build_ui(self):
        self.input_path = ctk.StringVar()
        self.output_path = ctk.StringVar()
        self.scale = ctk.DoubleVar(value=1.0)
        self.quality = ctk.IntVar(value=75)
        self.chroma_subsample = ctk.BooleanVar(value=True)

        ctk.CTkLabel(self, text="RAW → JPEG Compressor", font=("Segoe UI", 28, "bold")).pack(pady=20)

        # File selection
        frame = ctk.CTkFrame(self)
        frame.pack(pady=10, padx=20, fill="x")
        ctk.CTkLabel(frame, text="Input RAW File:").grid(row=0, column=0, padx=10, pady=10, sticky="e")
        ctk.CTkEntry(frame, textvariable=self.input_path, width=400).grid(row=0, column=1, padx=10)
        ctk.CTkButton(frame, text="Browse", command=self.browse_input).grid(row=0, column=2, padx=10)
        ctk.CTkLabel(frame, text="Output JPEG File:").grid(row=1, column=0, padx=10, pady=10, sticky="e")
        ctk.CTkEntry(frame, textvariable=self.output_path, width=400).grid(row=1, column=1, padx=10)
        ctk.CTkButton(frame, text="Browse", command=self.browse_output).grid(row=1, column=2, padx=10)

        # Sliders
        frame2 = ctk.CTkFrame(self)
        frame2.pack(pady=10, padx=20, fill="x")
        ctk.CTkLabel(frame2, text="Quality").grid(row=0, column=0, padx=10)
        ctk.CTkSlider(frame2, from_=10, to=100, variable=self.quality).grid(row=0, column=1, padx=10, pady=5)
        ctk.CTkLabel(frame2, text="Scale").grid(row=1, column=0, padx=10)
        ctk.CTkSlider(frame2, from_=0.1, to=1.0, variable=self.scale).grid(row=1, column=1, padx=10, pady=5)
        ctk.CTkCheckBox(frame2, text="Enable Chroma Subsampling", variable=self.chroma_subsample).grid(row=2, column=0, columnspan=2, pady=10)

        # Log box
        self.log_console = ctk.CTkTextbox(self, width=800, height=200)
        self.log_console.pack(pady=10)
        self.log_console.insert("end", "Status log will appear here...\n")

        # Progress
        self.progress = ctk.CTkProgressBar(self, width=800)
        self.progress.pack(pady=10)
        self.progress.set(0)

        ctk.CTkButton(self, text="🚀 Start Compression", fg_color="#0078D7", hover_color="#005A9E",
                      command=self.start_compression).pack(pady=20)

    def browse_input(self):
        path = filedialog.askopenfilename(filetypes=[("RAW files", "*.dng *.cr2 *.nef *.arw *.raw"), ("All files", "*.*")])
        if path: self.input_path.set(path)

    def browse_output(self):
        path = filedialog.asksaveasfilename(defaultextension=".jpg", filetypes=[("JPEG", "*.jpg")])
        if path: self.output_path.set(path)

    def start_compression(self):
        if not self.input_path.get() or not self.output_path.get():
            messagebox.showwarning("Missing Info", "Please select both input and output files.")
            return
        self.log_console.delete("1.0", "end")
        self.progress.set(0)
        threading.Thread(target=self.compress_task, daemon=True).start()

    def compress_task(self):
        def gui_log(msg, prog):
            self.log_console.insert("end", msg + "\n")
            self.log_console.see("end")
            if prog is not None: self.progress.set(prog)

        try:
            compress_raw_auto(self.input_path.get(), self.output_path.get(),
                              scale=self.scale.get(), quality=self.quality.get(),
                              chroma_subsample=self.chroma_subsample.get(),
                              progress_callback=gui_log)
            messagebox.showinfo("Done", "Compression completed successfully!")
        except Exception as e:
            messagebox.showerror("Error", str(e))

if __name__ == "__main__":
    RawCompressorApp().mainloop()
