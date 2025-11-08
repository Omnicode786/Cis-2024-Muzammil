import os
import threading
import customtkinter as ctk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
from raw_to_jpeg_auto import compress_raw_auto



ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

class RawCompressorApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("📸 RAW to JPEG Compressor")
        self.geometry("900x600")
        self.resizable(False, False)

        # Variables
        self.input_path = ctk.StringVar()
        self.output_path = ctk.StringVar()
        self.scale = ctk.DoubleVar(value=1.0)
        self.quality = ctk.IntVar(value=75)
        self.chroma_subsample = ctk.BooleanVar(value=True)
        self.width = ctk.StringVar()
        self.height = ctk.StringVar()

        # Layout
        self.create_ui()

    def create_ui(self):
        # Title label
        ctk.CTkLabel(self, text="RAW → JPEG Compressor", font=("Segoe UI", 28, "bold")).pack(pady=20)

        # Frame for file inputs
        frame_files = ctk.CTkFrame(self)
        frame_files.pack(pady=10, padx=20, fill="x")

        ctk.CTkLabel(frame_files, text="Input RAW File:").grid(row=0, column=0, padx=10, pady=10, sticky="e")
        ctk.CTkEntry(frame_files, textvariable=self.input_path, width=400).grid(row=0, column=1, padx=10, pady=10)
        ctk.CTkButton(frame_files, text="Browse", command=self.browse_input).grid(row=0, column=2, padx=10)

        ctk.CTkLabel(frame_files, text="Output File:").grid(row=1, column=0, padx=10, pady=10, sticky="e")
        ctk.CTkEntry(frame_files, textvariable=self.output_path, width=400).grid(row=1, column=1, padx=10, pady=10)
        ctk.CTkButton(frame_files, text="Browse", command=self.browse_output).grid(row=1, column=2, padx=10)

        # Frame for parameters
        frame_params = ctk.CTkFrame(self)
        frame_params.pack(pady=15, padx=20, fill="x")

        # Quality
        ctk.CTkLabel(frame_params, text=f"JPEG Quality ({self.quality.get()})").grid(row=0, column=0, padx=10, pady=10, sticky="w")
        self.quality_slider = ctk.CTkSlider(frame_params, from_=10, to=100, number_of_steps=90,
                                            variable=self.quality, command=lambda v: self.update_label(frame_params))
        self.quality_slider.grid(row=0, column=1, padx=10, pady=10, sticky="we")

        # Scale
        ctk.CTkLabel(frame_params, text=f"Resolution Scale ({self.scale.get():.2f})").grid(row=1, column=0, padx=10, pady=10, sticky="w")
        self.scale_slider = ctk.CTkSlider(frame_params, from_=0.1, to=1.0, number_of_steps=90,
                                          variable=self.scale, command=lambda v: self.update_label(frame_params))
        self.scale_slider.grid(row=1, column=1, padx=10, pady=10, sticky="we")

        # Chroma toggle
        ctk.CTkCheckBox(frame_params, text="Enable Chroma Subsampling (smaller file, less color detail)",
                        variable=self.chroma_subsample).grid(row=2, column=0, columnspan=2, pady=10)

        # Width/Height (optional for plain .raw)
        ctk.CTkLabel(frame_params, text="Width (if .raw):").grid(row=3, column=0, padx=10, pady=5, sticky="e")
        ctk.CTkEntry(frame_params, textvariable=self.width, width=100).grid(row=3, column=1, sticky="w", pady=5)

        ctk.CTkLabel(frame_params, text="Height (if .raw):").grid(row=4, column=0, padx=10, pady=5, sticky="e")
        ctk.CTkEntry(frame_params, textvariable=self.height, width=100).grid(row=4, column=1, sticky="w", pady=5)

        # Compress button
        ctk.CTkButton(self, text="🚀 Compress Now", font=("Segoe UI", 16, "bold"),
                      fg_color="#0078D7", hover_color="#005A9E",
                      command=self.start_compression).pack(pady=20)

        # Progress + Status
        self.progress = ctk.CTkProgressBar(self, width=600)
        self.progress.set(0)
        self.progress.pack(pady=10)

        self.status_label = ctk.CTkLabel(self, text="Status: Waiting...", font=("Segoe UI", 14))
        self.status_label.pack(pady=10)

    def update_label(self, frame):
        frame.grid_slaves(row=0, column=0)[0].configure(text=f"JPEG Quality ({self.quality.get()})")
        frame.grid_slaves(row=1, column=0)[0].configure(text=f"Resolution Scale ({self.scale.get():.2f})")

    def browse_input(self):
        path = filedialog.askopenfilename(filetypes=[
            ("RAW images", "*.dng *.cr2 *.nef *.arw *.raw"),
            ("All files", "*.*")
        ])
        if path:
            self.input_path.set(path)

    def browse_output(self):
        path = filedialog.asksaveasfilename(defaultextension=".jpg",
                                            filetypes=[("JPEG image", "*.jpg")])
        if path:
            self.output_path.set(path)

    def start_compression(self):
        if not self.input_path.get() or not self.output_path.get():
            messagebox.showwarning("Missing Information", "Please select both input and output files.")
            return

        self.status_label.configure(text="Status: Compressing...")
        self.progress.set(0.2)
        threading.Thread(target=self.compress_task, daemon=True).start()

    def compress_task(self):
        try:
            compress_raw_auto(
                input_path=self.input_path.get(),
                output_path=self.output_path.get(),
                scale=self.scale.get(),
                quality=self.quality.get(),
                chroma_subsample=self.chroma_subsample.get(),
                raw_width=int(self.width.get()) if self.width.get() else None,
                raw_height=int(self.height.get()) if self.height.get() else None
            )
            self.progress.set(1.0)
            self.status_label.configure(text="✅ Compression Completed Successfully!")
            messagebox.showinfo("Done", f"Saved compressed JPEG:\n{self.output_path.get()}")
        except Exception as e:
            self.progress.set(0)
            self.status_label.configure(text="❌ Error occurred.")
            messagebox.showerror("Error", str(e))

if __name__ == "__main__":
    app = RawCompressorApp()
    app.mainloop()
