import tkinter as tk
from tkinter import filedialog, messagebox
import customtkinter as ctk
import threading
import os
import math
import time
from .core import ImageConverter
from .theme import Theme

# --- 60 FPS Animation Engine ---
# all math done by ai 
class Animator:
    @staticmethod
    def animate_place(widget, target_kwargs, duration=500, delay=0, easing='out_expo', callback=None):
        def start():
            start_time = time.time()
            # Capture Start State
            info = widget.place_info()
            start_props = {}
            for k in target_kwargs:
                val = info.get(k)
                start_props[k] = float(val) if val is not None else 0.0
            
            def _step():
                now = time.time()
                elapsed = (now - start_time) * 1000
                progress = min(1.0, elapsed / duration)
                
                # High-Fidelity Easing
                if easing == 'out_expo':
                    val = 1 if progress == 1 else 1 - pow(2, -10 * progress)
                elif easing == 'out_back':
                    c1 = 1.70158; c3 = c1 + 1
                    val = 1 + c3 * pow(progress - 1, 3) + c1 * pow(progress - 1, 2)
                elif easing == 'in_out_quart': # Smooth S-Curve
                    val = 8 * progress**4 if progress < 0.5 else 1 - pow(-2 * progress + 2, 4) / 2
                else:
                    val = progress

                # Interpolate
                new_kwargs = {}
                for k, end_v in target_kwargs.items():
                    start_v = start_props[k]
                    new_kwargs[k] = start_v + (end_v - start_v) * val
                
                widget.place(**new_kwargs)
                
                if progress < 1.0:
                    widget.after(16, _step) # ~60 FPS
                else:
                    if callback: callback()
            
            _step()

        if delay > 0: widget.after(delay, start)
        else: start()

# main transiton effect
class ThemeTransition:
    def __init__(self, master, target_mode):
        self.master = master
        self.target_mode = target_mode
        self.overlay = None
        
    def animate(self):
        self.overlay = ctk.CTkToplevel(self.master)
        # gemetry dekhlo screen pr monitor me us din kuke change ho skta
        self.overlay.geometry(self.master.geometry())
        self.overlay.overrideredirect(True)
        self.overlay.attributes('-alpha', 0.0)
        
        col = "#000000" if self.target_mode == "Dark" else "#ffffff"
        self.overlay.configure(fg_color=col)
        
        x = self.master.winfo_x(); y = self.master.winfo_y()
        self.overlay.geometry(f"+{x}+{y}")
        self.overlay.lift()
        
        self._fade(0.0, 1.0, 0.05, self._switch)
        
    def _switch(self):
        ctk.set_appearance_mode(self.target_mode)
        self.master.update()
        self._fade(1.0, 0.0, -0.05, self._finish)
        
    def _fade(self, start, end, step, callback):
        current = start
        def _step():
            nonlocal current
            current += step
            self.overlay.attributes('-alpha', current)
            if (step > 0 and current < end) or (step < 0 and current > end):
                self.overlay.after(16, _step)
            else:
                callback()
        _step()
        
    def _finish(self):
        self.overlay.destroy()

# component for animation
class CircularProgress(ctk.CTkCanvas):
    def __init__(self, master, width=60, height=60, color=None, **kwargs):
        super().__init__(master, width=width, height=height, bg=master._apply_appearance_mode(Theme.BG_CARD[1]), highlightthickness=0, **kwargs)
        self.width = width; self.height = height
        self.prog_color = Theme.ACCENT_PRIMARY[1] if color is None else color
        self.progress = 0.0
        self.center_x = width//2; self.center_y = height//2
        self._draw()

    def set_progress(self, val):
        self.progress = val
        self._draw()

    def _draw(self):
        self.delete("all")
        self.create_oval(4, 4, self.width-4, self.height-4, outline="#333", width=4)
        if self.progress > 0:
            angle = 360 * self.progress
            self.create_arc(4, 4, self.width-4, self.height-4, start=90, extent=-angle, style="arc", outline=self.prog_color, width=4)
        pct = int(self.progress * 100)
        self.create_text(self.center_x, self.center_y, text=f"{pct}%", fill="gray", font=("Consolas", 10, "bold"))

class FullscreenOverlay(ctk.CTkFrame):
    def __init__(self, master):
        super().__init__(master, fg_color=Theme.BG_MAIN, corner_radius=0)
        top = ctk.CTkFrame(self, height=60, fg_color="transparent")
        top.pack(fill="x", padx=30, pady=30)
        ctk.CTkButton(top, text="CLOSE", width=80, border_width=1, fg_color="transparent", command=self.hide).pack(side="right")
        ctk.CTkLabel(top, text="DETAILED ANALYTICS", font=Theme.FONT_HEADER).pack(side="left")
        self.histo_canvas = tk.Canvas(self, height=350, bg="#111", highlightthickness=0)
        self.histo_canvas.pack(fill="x", padx=30, pady=20)
        self.stats_box = ctk.CTkFrame(self, fg_color="transparent")
        self.stats_box.pack(fill="x", padx=30, pady=10)

    def set_data(self, meta, rgb_hist):
        self.histo_canvas.delete("all"); rh, gh, bh = rgb_hist; w = self.winfo_width(); h = 350
        max_h = max(max(rh), max(gh), max(bh))
        if max_h > 0 and w > 0:
            step = w / 256; sy = h / max_h
            for hist, col in [(rh, "#ff4444"), (gh, "#44ff44"), (bh, "#4444ff")]:
                pts = [0,h] + [val for i, v in enumerate(hist) for val in (i*step, h - (v*sy))] + [w, h]
                self.histo_canvas.create_polygon(pts, fill=col, outline="", stipple="gray25")
        for c in self.stats_box.winfo_children(): c.destroy()
        for k, v in [("ISO", meta.get("ISO")), ("SHUTTER", meta.get("Shutter")), ("APERTURE", meta.get("Aperture"))]:
            f = ctk.CTkFrame(self.stats_box, fg_color=Theme.BG_CARD, height=120)
            f.pack(side="left", fill="x", expand=True, padx=5)
            ctk.CTkLabel(f, text=k, text_color="gray", font=("Segoe UI", 12)).pack(pady=(20, 5))
            ctk.CTkLabel(f, text=str(v), font=("Segoe UI", 26)).pack(pady=5)

    def show(self): self.place(relx=0, rely=1.0, relwidth=1, relheight=1); self.lift(); Animator.animate_place(self, {'rely': 0.0}, duration=500, easing='out_expo')
    def hide(self): Animator.animate_place(self, {'rely': 1.0}, duration=500, easing='out_expo', callback=self.place_forget)

# --- Main Application ---
class ModernApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("RAW Studio Ultimate")
        self.geometry("900x600")
        ctk.set_appearance_mode("System")
        self.configure(fg_color=Theme.BG_MAIN)
        
        # State
        self.input_file = ctk.StringVar()
        self.input_folder = ctk.StringVar()
        self.output_folder = ctk.StringVar()
        self.exposure = ctk.DoubleVar(value=0)
        self.contrast = ctk.DoubleVar(value=1)
        self.saturation = ctk.DoubleVar(value=1) 
        self.temp = ctk.DoubleVar(value=0)
        self.tint = ctk.DoubleVar(value=0)
        self.quality = ctk.IntVar(value=90)
        self.scale = ctk.DoubleVar(value=1.0)
        self.chroma = ctk.BooleanVar(value=True)
        self.format = ctk.StringVar(value=".jpg")
        
        self.converter = ImageConverter()
        self.current_image = None
        self._preview_job = None
        self.active_view = "develop"
        self.is_drawer_open = True # Track state
        
        self._setup_ui()
        self.overlay = FullscreenOverlay(self)
        
        # Entrance
        self.after(100, self._animate_entrance)

    def _setup_ui(self):
        # 1. Header (Dynamic)
        self.header = ctk.CTkFrame(self, height=60, fg_color="transparent")
        self.header.place(relx=0, rely=-0.1, relwidth=1)
        
        ctk.CTkLabel(self.header, text="RAW Studio", font=Theme.FONT_HEADER).pack(side="left", padx=30)
        
        # Mode Switcher
        self.seg_mode = ctk.CTkSegmentedButton(self.header, values=["BEAST DEVELOP", "BEAST BATCH"], 
                                               command=self.switch_mode, width=200)
        self.seg_mode.set("BEAST DEVELOP")
        self.seg_mode.pack(side="left", padx=50)
        
        # Right Controls
        ctk.CTkSwitch(self.header, text="Dark Mode", command=self.toggle_theme).pack(side="right", padx=20)
        self.btn_drawer = ctk.CTkButton(self.header, text="Toggle Tools", width=100, fg_color=Theme.BG_CARD, command=self.toggle_drawer)
        self.btn_drawer.pack(side="right", padx=10)

        # 2. Main Container
        self.container = ctk.CTkFrame(self, fg_color="transparent")
        self.container.place(relx=0, rely=0.08, relwidth=1, relheight=0.92)
        
        # Views
        self.view_develop = ctk.CTkFrame(self.container, fg_color="transparent")
        self.view_batch = ctk.CTkFrame(self.container, fg_color="transparent")
        
        self._setup_develop_view()
        self._setup_batch_view()
        
        # Initial State
        self.view_develop.place(relx=0, rely=0, relwidth=1, relheight=1)
        self.view_batch.place(relx=1.0, rely=0, relwidth=1, relheight=1) 

        # 3. Terminal 
        self.terminal = ctk.CTkFrame(self, height=200, fg_color="#111", corner_radius=0)
        self.terminal.place(relx=0, rely=1.0, relwidth=1) 
        self.is_terminal_open = False
        
        # Terminal c9ontent
        top = ctk.CTkFrame(self.terminal, height=30, fg_color="#222")
        top.pack(fill="x")
        ctk.CTkLabel(top, text="SYSTEM LOG", font=("Consolas", 10)).pack(side="left", padx=10)
        ctk.CTkButton(top, text="\u25BC", width=30, height=20, fg_color="transparent", command=self.toggle_terminal).pack(side="right")
        
        self.log_box = ctk.CTkTextbox(self.terminal, fg_color="#111", text_color="#0f0", font=("Consolas", 11))
        self.log_box.pack(fill="both", expand=True, padx=10, pady=5)

    def _setup_develop_view(self):
        # Viewport (Left)
        self.viewport = ctk.CTkFrame(self.view_develop, fg_color="transparent")
        self.viewport.place(relx=0, rely=0, relwidth=0.75, relheight=1)
        
        self.preview_frame = ctk.CTkFrame(self.viewport, fg_color="#181818", corner_radius=15)
        self.preview_frame.pack(fill="both", expand=True, padx=20, pady=20)
        self.lbl_preview = ctk.CTkLabel(self.preview_frame, text="[ NO IMAGE ]", text_color="#555")
        self.lbl_preview.pack(expand=True)
        
        # Info Bar
        self.info_bar = ctk.CTkFrame(self.preview_frame, height=50, fg_color="#000000", bg_color="transparent", corner_radius=10)
        self.info_bar.place(relx=0.02, rely=0.9, relwidth=0.96)
        self.lbl_info = ctk.CTkLabel(self.info_bar, text="Open RAW Image to begin", text_color="white")
        self.lbl_info.pack(side="left", padx=20)
        
        ctk.CTkButton(self.info_bar, text="LOGS >_", width=80, fg_color="#222", command=self.toggle_terminal).pack(side="right", padx=5)
        ctk.CTkButton(self.info_bar, text="DETAILS \u2191", width=80, fg_color="#333", command=self.show_details).pack(side="right", padx=5)
        ctk.CTkButton(self.info_bar, text="OPEN", width=80, fg_color=Theme.ACCENT_PRIMARY, command=self.browse).pack(side="right", padx=10)

        # Drawer (Right)
        self.drawer = ctk.CTkFrame(self.view_develop, fg_color=Theme.BG_CARD, corner_radius=0)
        self.drawer.place(relx=0.75, rely=0, relwidth=0.25, relheight=1)
        
        scroll = ctk.CTkScrollableFrame(self.drawer, fg_color="transparent")
        scroll.pack(fill="both", expand=True, padx=10, pady=10)
        
        ctk.CTkLabel(scroll, text="BEAST DEVELOP", font=Theme.FONT_SUBHEADER).pack(anchor="w", pady=(10,5))
        self._make_rich_slider(scroll, "Exposure", self.exposure, -2, 2, "EV")
        self._make_rich_slider(scroll, "Contrast", self.contrast, 0.5, 1.5, "x")
        self._make_rich_slider(scroll, "Saturation", self.saturation, 0, 2, "%", 100)
        self._make_rich_slider(scroll, "Temp", self.temp, -1, 1, "")
        self._make_rich_slider(scroll, "Tint", self.tint, -1, 1, "")
        
        ctk.CTkLabel(scroll, text="EXPORT", font=Theme.FONT_SUBHEADER).pack(anchor="w", pady=(20,5))
        
        # Format Selector
        f_fmt = ctk.CTkFrame(scroll, fg_color="transparent")
        f_fmt.pack(fill="x", pady=5)
        ctk.CTkLabel(f_fmt, text="Format", text_color="gray", font=("Segoe UI", 11)).pack(anchor="w")
        ctk.CTkOptionMenu(f_fmt, variable=self.format, values=[".jpg", ".png", ".tiff"], height=24,
                          fg_color=Theme.BG_CARD[1], button_color=Theme.ACCENT_PRIMARY,
                          dropdown_fg_color=Theme.BG_MAIN).pack(fill="x", pady=(2,0))

        self._make_rich_slider(scroll, "Quality", self.quality, 10, 100, "%", is_int=True)
        self._make_rich_slider(scroll, "Scale", self.scale, 0.1, 1.0, "%", 100)
        
        action = ctk.CTkFrame(self.drawer, height=100, fg_color="transparent")
        action.pack(fill="x", side="bottom", padx=20, pady=20)
        self.prog = CircularProgress(action, width=50, height=50)
        self.prog.pack(side="left", padx=(0,10))
        self.btn_export = ctk.CTkButton(action, text="EXPORT NOW", height=50, corner_radius=25,
                                        font=("Segoe UI", 11, "bold"), fg_color=Theme.ACCENT_PRIMARY, command=self.export)
        self.btn_export.pack(side="left", fill="x", expand=True)

    def _setup_batch_view(self):
        # Centered Card Layout for Batch
        card = ctk.CTkFrame(self.view_batch, fg_color=Theme.BG_CARD, corner_radius=20)
        card.place(relx=0.5, rely=0.5, relwidth=0.6, relheight=0.7, anchor="center")
        
        ctk.CTkLabel(card, text="BEAST BATCH PROCESSOR", font=Theme.FONT_HEADER).pack(pady=30)
        
        f = ctk.CTkFrame(card, fg_color="transparent")
        f.pack(fill="x", padx=40)
        self._make_folder_picker(f, "Source Folder", self.input_folder)
        self._make_folder_picker(f, "Output Folder", self.output_folder)
        
        ctk.CTkLabel(f, text="Format", text_color="gray").pack(anchor="w", pady=(20,5))
        ctk.CTkOptionMenu(f, variable=self.format, values=[".jpg", ".png", ".tiff"]).pack(fill="x")
        
        self.batch_prog = CircularProgress(card, width=80, height=80)
        self.batch_prog.pack(pady=30)
        
        ctk.CTkButton(card, text="START BATCH", height=50, corner_radius=25, 
                      fg_color=Theme.ACCENT_PRIMARY, font=("Segoe UI", 12, "bold"),
                      command=self.run_batch).pack(fill="x", padx=100, pady=0)

    # helpers 
    def _make_rich_slider(self, parent, label, var, vmin, vmax, suffix, scale=1, is_int=False):
        f = ctk.CTkFrame(parent, fg_color="transparent")
        f.pack(fill="x", pady=5)
        top = ctk.CTkFrame(f, fg_color="transparent"); top.pack(fill="x")
        ctk.CTkLabel(top, text=label, text_color="gray", font=("Segoe UI", 11)).pack(side="left")
        val_lbl = ctk.CTkLabel(top, text="--", font=("Consolas", 11, "bold")); val_lbl.pack(side="right")
        def up(*a): v = var.get() * scale; fmt = f"{int(v)}" if is_int or scale>1 else f"{v:+.1f}"; val_lbl.configure(text=f"{fmt}{suffix}")
        var.trace_add("write", up); up()
        ctk.CTkSlider(f, variable=var, from_=vmin, to=vmax, height=18, command=self.update_preview_throttled if not is_int else None).pack(fill="x", pady=(5,0))

    def _make_folder_picker(self, parent, label, var):
        ctk.CTkLabel(parent, text=label, text_color="gray").pack(anchor="w", pady=(10,5))
        b = ctk.CTkFrame(parent, fg_color="transparent"); b.pack(fill="x")
        ctk.CTkEntry(b, textvariable=var).pack(side="left", fill="x", expand=True)
        ctk.CTkButton(b, text="...", width=40, command=lambda: var.set(filedialog.askdirectory())).pack(side="left", padx=5)

    def log(self, msg):
        self.log_box.configure(state="normal"); self.log_box.insert("end", f"> {msg}\n"); self.log_box.see("end"); self.log_box.configure(state="disabled")

    # --- Actions & Animations ---
    # ai carying your boy
    def _animate_entrance(self):
        Animator.animate_place(self.header, {'rely': 0.0}, duration=600, easing='out_back')
        Animator.animate_place(self.view_develop, {'relx': 0.0}, duration=800, delay=100, easing='out_expo')

    def switch_mode(self, mode):
        self.active_view = mode.lower()
        if mode == "BEAST DEVELOP":
            Animator.animate_place(self.view_develop, {'relx': 0.0}, duration=500, easing='in_out_quart')
            Animator.animate_place(self.view_batch, {'relx': 1.0}, duration=500, easing='in_out_quart')
        else:
            Animator.animate_place(self.view_develop, {'relx': -1.0}, duration=500, easing='in_out_quart')
            Animator.animate_place(self.view_batch, {'relx': 0.0}, duration=500, easing='in_out_quart')

    def toggle_drawer(self):
        target_viewport = 1.0 if self.is_drawer_open else 0.75
        target_drawer = 1.0 if self.is_drawer_open else 0.75
        
        Animator.animate_place(self.viewport, {'relwidth': target_viewport}, duration=500, easing='out_expo')
        Animator.animate_place(self.drawer, {'relx': target_drawer}, duration=500, easing='out_expo')
        
        self.is_drawer_open = not self.is_drawer_open

    def toggle_terminal(self):
        h = self.winfo_height()
        target_y = 1.0 - (200/h) if not self.is_terminal_open else 1.0
        Animator.animate_place(self.terminal, {'rely': target_y}, duration=400, easing='out_expo')
        self.is_terminal_open = not self.is_terminal_open

    def toggle_theme(self):
        m = ctk.get_appearance_mode()
        new_mode = "Light" if m == "Dark" else "Dark"
        ThemeTransition(self, new_mode).animate()

    def show_details(self):
        if not self.input_file.get(): return
        rh, gh, bh = self.converter.get_histogram(self.current_image)
        meta = self.converter.get_metadata(self.input_file.get())
        self.overlay.set_data(meta, (rh,gh,bh)); self.overlay.show()

    def browse(self):
        f = filedialog.askopenfilename()
        if f: self.input_file.set(f); threading.Thread(target=self._load, args=(f,), daemon=True).start()

    def _load(self, path):
        img = self.converter.get_preview_image(path); meta = self.converter.get_metadata(path)
        self.after(0, lambda: self._post_load(img, meta, path))

    def _post_load(self, img, meta, path):
        self.lbl_info.configure(text=f"{os.path.basename(path)} | {meta.get('ISO')} | {meta.get('Shutter')}")
        if img: img.thumbnail((1000, 1000)); self.current_image = img; self.update_preview()

    def update_preview_throttled(self, _=None):
        if self._preview_job: self.after_cancel(self._preview_job)
        self._preview_job = self.after(30, self.update_preview)

    def update_preview(self):
        if not self.current_image: return
        p = self.converter._apply_grading(self.current_image.copy(), exposure=self.exposure.get(), contrast=self.contrast.get(), 
                                          saturation=self.saturation.get(), temperature=self.temp.get(), tint=self.tint.get())
        tk_img = ctk.CTkImage(p, size=p.size); self.lbl_preview.configure(image=tk_img, text="")

    def export(self):
        if not self.input_file.get(): return
        path = self.input_file.get(); base, _ = os.path.splitext(path); out = base + "_v6" + self.format.get()
        self.btn_export.configure(state="disabled", text="BUSY"); self.prog.set_progress(0.1)
        threading.Thread(target=self._run_export, args=(path, out), daemon=True).start()

    def _run_export(self, inp, out):
        params = {"exposure": self.exposure.get(), "contrast": self.contrast.get(), "saturation": self.saturation.get(), 
                  "temperature": self.temp.get(), "tint": self.tint.get()}
        def cb(msg, p): 
            self.after(0, lambda: self.log(msg)); self.after(0, lambda: self.prog.set_progress(p))
        res, msg = self.converter.convert(inp, out, quality=self.quality.get(), scale=self.scale.get(), grading_params=params, progress_callback=cb)
        self.after(0, lambda: self._finish(res, self.btn_export, self.prog))

    def run_batch(self):
        src = self.input_folder.get(); dst = self.output_folder.get()
        if not src or not dst: return
        threading.Thread(target=self._exec_batch, args=(src, dst), daemon=True).start()

    def _exec_batch(self, src, dst):
        files = [os.path.join(src, f) for f in os.listdir(src) if f.lower().endswith(('.dng','.cr2','.nef'))]
        for i, f in enumerate(files):
            self.after(0, lambda idx=i: self.batch_prog.set_progress((idx)/len(files)))
            self.after(0, lambda f=f: self.log(f"Processing {os.path.basename(f)}"))
            out = os.path.join(dst, os.path.splitext(os.path.basename(f))[0] + self.format.get())
            self.converter.convert(f, out, quality=80)
        self.after(0, lambda: self.batch_prog.set_progress(1.0))
        self.after(0, lambda: messagebox.showinfo("Batch", "Complete"))

    def _finish(self, res, btn, prog):
        btn.configure(state="normal", text="EXPORT NOW"); prog.set_progress(1.0 if res else 0.0)
        if res: messagebox.showinfo("Success", "Exported!")
