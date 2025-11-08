import os
import threading
import customtkinter as ctk
from tkinter import filedialog, messagebox
from raw_to_jpeg import compress_raw_auto  # <-- Your provided script

# Theme setup
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")


class RawToJPEGApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        # --- Window setup ---
        self.title("📸 RAW → JPEG Converter")
        self.geometry("900x600")
        self.resizable(False, False)

        # --- Tkinter variables (dynamic values) ---
        self.input_path = ctk.StringVar()
        self.output_path = ctk.StringVar()
        self.scale = ctk.DoubleVar(value=1.0)
        self.quality = ctk.IntVar(value=75)
        self.raw_format = ctk.StringVar(value="rgb24")
        self.width = ctk.StringVar()
        self.height = ctk.StringVar()

        # --- UI construction ---
        self.create_ui()

    # ---------------------------------------------------------------------
    # UI SETUP
    # ---------------------------------------------------------------------
    def create_ui(self):
        # Title
        ctk.CTkLabel(
            self,
            text="RAW → JPEG Converter",
            font=("Segoe UI", 28, "bold")
        ).pack(pady=20)

        # --- Input/Output Frame ---
        frame_files = ctk.CTkFrame(self)
        frame_files.pack(pady=10, padx=20, fill="x")

        # Input
        ctk.CTkLabel(frame_files, text="Input RAW File:").grid(row=0, column=0, padx=10, pady=10, sticky="e")
        ctk.CTkEntry(frame_files, textvariable=self.input_path, width=400).grid(row=0, column=1, padx=10, pady=10)
        ctk.CTkButton(frame_files, text="Browse", command=self.browse_input).grid(row=0, column=2, padx=10)

        # Output
        ctk.CTkLabel(frame_files, text="Output JPEG File:").grid(row=1, column=0, padx=10, pady=10, sticky="e")
        ctk.CTkEntry(frame_files, textvariable=self.output_path, width=400).grid(row=1, column=1, padx=10, pady=10)
        ctk.CTkButton(frame_files, text="Browse", command=self.browse_output).grid(row=1, column=2, padx=10)

        # --- Compression Options ---
        frame_opts = ctk.CTkFrame(self)
        frame_opts.pack(pady=15, padx=20, fill="x")

        # Quality Slider
        self.lbl_quality = ctk.CTkLabel(frame_opts, text=f"JPEG Quality ({self.quality.get()})")
        self.lbl_quality.grid(row=0, column=0, padx=10, pady=10, sticky="w")

        self.slider_quality = ctk.CTkSlider(
            frame_opts, from_=10, to=100, number_of_steps=90,
            variable=self.quality,
            command=lambda v: self.update_labels()
        )
        self.slider_quality.grid(row=0, column=1, padx=10, pady=10, sticky="we")

        # Scale Slider
        self.lbl_scale = ctk.CTkLabel(frame_opts, text=f"Scale ({self.scale.get():.2f})")
        self.lbl_scale.grid(row=1, column=0, padx=10, pady=10, sticky="w")

        self.slider_scale = ctk.CTkSlider(
            frame_opts, from_=0.1, to=1.0, number_of_steps=90,
            variable=self.scale,
            command=lambda v: self.update_labels()
        )
        self.slider_scale.grid(row=1, column=1, padx=10, pady=10, sticky="we")

        # RAW format (for .raw only)
        ctk.CTkLabel(frame_opts, text="Plain .raw Format:").grid(row=2, column=0, padx=10, pady=10, sticky="e")
        ctk.CTkOptionMenu(frame_opts, values=["rgb24", "gray8"], variable=self.raw_format).grid(row=2, column=1, sticky="w", pady=10)

        # Width and height fields
        ctk.CTkLabel(frame_opts, text="Width (if .raw):").grid(row=3, column=0, padx=10, pady=5, sticky="e")
        ctk.CTkEntry(frame_opts, textvariable=self.width, width=100).grid(row=3, column=1, sticky="w", pady=5)

        ctk.CTkLabel(frame_opts, text="Height (if .raw):").grid(row=4, column=0, padx=10, pady=5, sticky="e")
        ctk.CTkEntry(frame_opts, textvariable=self.height, width=100).grid(row=4, column=1, sticky="w", pady=5)

        # --- Convert Button ---
        ctk.CTkButton(
            self,
            text="🚀 Convert Now",
            font=("Segoe UI", 16, "bold"),
            fg_color="#0078D7", hover_color="#005A9E",
            command=self.start_conversion
        ).pack(pady=20)

        # --- Progress and Status ---
        self.progress = ctk.CTkProgressBar(self, width=600)
        self.progress.set(0)
        self.progress.pack(pady=10)

        self.status_label = ctk.CTkLabel(self, text="Status: Waiting...", font=("Segoe UI", 14))
        self.status_label.pack(pady=10)

    # ---------------------------------------------------------------------
    # LABEL UPDATE
    # ---------------------------------------------------------------------
    def update_labels(self):
        """Update text labels when sliders move."""
        self.lbl_quality.configure(text=f"JPEG Quality ({int(self.quality.get())})")
        self.lbl_scale.configure(text=f"Scale ({self.scale.get():.2f})")

    # ---------------------------------------------------------------------
    # FILE PICKERS
    # ---------------------------------------------------------------------
    def browse_input(self):
        path = filedialog.askopenfilename(
            title="Select RAW File",
            filetypes=[("RAW Images", "*.dng *.cr2 *.nef *.arw *.raw"), ("All Files", "*.*")]
        )
        if path:
            self.input_path.set(path)

    def browse_output(self):
        path = filedialog.asksaveasfilename(
            title="Save JPEG As",
            defaultextension=".jpg",
            filetypes=[("JPEG Files", "*.jpg")]
        )
        if path:
            self.output_path.set(path)

    # ---------------------------------------------------------------------
    # CONVERSION LOGIC
    # ---------------------------------------------------------------------
    def start_conversion(self):
        """Start conversion in a new thread."""
        if not self.input_path.get() or not self.output_path.get():
            messagebox.showwarning("Missing Info", "Please select both input and output paths.")
            return

        self.status_label.configure(text="Status: Converting...")
        self.progress.set(0.2)

        threading.Thread(target=self.run_conversion, daemon=True).start()

    def run_conversion(self):
        """Worker thread for compression."""
        try:
            compress_raw_auto(
                input_path=self.input_path.get(),
                output_path=self.output_path.get(),
                scale=self.scale.get(),
                quality=self.quality.get(),
                raw_format=self.raw_format.get(),
                raw_width=int(self.width.get()) if self.width.get() else None,
                raw_height=int(self.height.get()) if self.height.get() else None,
            )
            self.progress.set(1.0)
            self.status_label.configure(text="✅ Conversion Complete!")
            messagebox.showinfo("Done", f"JPEG saved at:\n{self.output_path.get()}")
        except Exception as e:
            self.progress.set(0)
            self.status_label.configure(text="❌ Error during conversion.")
            messagebox.showerror("Error", str(e))


if __name__ == "__main__":
    app = RawToJPEGApp()
    app.mainloop()
