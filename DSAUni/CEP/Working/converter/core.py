import os
import math
import numpy as np
import rawpy
from PIL import Image, ImageEnhance

class ImageConverter:
    """
    Advanced RAW Processor Engine.
    Features: Standard IJG JPEG, Digital Grading, Histogram, Metadata.
    """

    # --- Standard Quantization Tables (Annex K) ---
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

    def __init__(self):
        self.dct_matrix = self._make_dct_matrix(8)
        self.idct_matrix = self.dct_matrix.T

    # --- Analysis & Info ---

    def get_metadata(self, input_path):
        """Extracts EXIF data using PIL (works for DNG/TIFF-based RAWs) with rawpy fallback."""
        meta = {
            "Make": "Unknown", "Model": "Unknown", 
            "ISO": "---", "Shutter": "---", "Aperture": "---"
        }
        
        # 1. Try PIL (Best for standard EXIF)
        try:
            img = Image.open(input_path)
            exif = img.getexif()
            if exif:
                if 271 in exif: meta["Make"] = str(exif[271])
                if 272 in exif: meta["Model"] = str(exif[272])
                if 34855 in exif: meta["ISO"] = str(exif[34855])
                
                if 33434 in exif:
                    # Shutter
                    val = exif[33434]
                    if isinstance(val, tuple) and len(val)==2:
                        meta["Shutter"] = f"{val[0]}/{val[1]}s"
                    else:
                        meta["Shutter"] = f"{val}s"
                
                if 33437 in exif:
                    val = exif[33437]
                    if isinstance(val, tuple) and len(val)==2 and val[1]!=0:
                        meta["Aperture"] = f"f/{val[0]/val[1]:.1f}"
                    else:
                        meta["Aperture"] = f"f/{val}"
        except Exception:
            pass # PIL failed, proceed to fallback

        # 2. Rawpy Fallback (For Make/Model/ISO if missing)
        if meta["Model"] == "Unknown":
            try:
                with rawpy.imread(input_path) as raw:
                    if raw.model: meta["Model"] = raw.model.decode('utf-8')
                    if raw.camera_whitebalance: 
                         # Rawpy doesn't always have easy ISO/Shutter access without full decoding
                         pass
            except:
                pass

        return meta

    def get_preview_image(self, input_path):
        """
        Fast RAW decode for preview purposes. 
        Uses rawpy's embedded thumbnail if available, or fast half-size demosaic.
        """
        try:
            with rawpy.imread(input_path) as raw:
                try:
                    # Try to extract embedded thumbnail first (fastest)
                    thumb = raw.extract_thumb()
                    if thumb.format == rawpy.ThumbFormat.JPEG:
                        import io
                        return Image.open(io.BytesIO(thumb.data))
                    elif thumb.format == rawpy.ThumbFormat.BITMAP:
                         return Image.fromarray(thumb.data)
                except:
                    pass
                
                # Fallback: Fast postprocess (half, low quality)
                rgb = raw.postprocess(use_camera_wb=True, bright=1.0, user_sat=None, no_auto_bright=False, half_size=True)
                return Image.fromarray(rgb)
        except Exception as e:
            print(f"Error loading preview: {e}")
            return None

    def get_histogram(self, pil_image):
        """Returns normalized 256-bin histograms for R, G, B."""
        # Resize small for speed
        thumb = pil_image.resize((256, 256))
        r, g, b = thumb.split()
        return r.histogram(), g.histogram(), b.histogram()

    # --- Processing ---

    def _apply_grading(self, pil_img, exposure=0.0, contrast=1.0, saturation=1.0, 
                       temperature=0.0, tint=0.0, vignette=0.0):
        """
        Applies digital grading to a PIL image.
        """
        # 1. Exposure (Brightness)
        if exposure != 0.0:
            # Simple linear gain approximation
            enhancer = ImageEnhance.Brightness(pil_img)
            pil_img = enhancer.enhance(1.0 + exposure) # -1.0 to 1.0 range usually

        # 2. Contrast
        if contrast != 1.0:
            enhancer = ImageEnhance.Contrast(pil_img)
            pil_img = enhancer.enhance(contrast)

        # 3. Saturation
        if saturation != 1.0:
            enhancer = ImageEnhance.Color(pil_img)
            pil_img = enhancer.enhance(saturation)

        # 4. Temp/Tint (Simplified conceptual implementation via RGB balance)
        if temperature != 0.0 or tint != 0.0:
            r, g, b = pil_img.split()
            # Temp: Blue <-> Yellow (Red/Green mix)
            # Tint: Green <-> Magenta
            
            # This is a crude simulation using per-channel lookup
            # Temp > 0: Warm (More R, Less B)
            # Tint > 0: Magenta (More R/B, Less G)
            
            r = r.point(lambda i: i * (1 + temperature*0.1 + tint*0.1))
            g = g.point(lambda i: i * (1 - tint*0.1))
            b = b.point(lambda i: i * (1 - temperature*0.1 + tint*0.1))
            pil_img = Image.merge("RGB", (r,g,b))

        return pil_img

    def convert(self, input_path, output_path, quality=90, scale=1.0, 
                chroma_subsampling=True, 
                grading_params=None, # dict of exposure, contrast, etc
                progress_callback=None):
        """
        Main Pipeline: Load -> Grade -> IJG Compress -> Save
        """
        try:
            if progress_callback: progress_callback("Loading RAW...", 0.1)
            
            # 1. Load RAW
            ext = os.path.splitext(input_path)[1].lower()
            with rawpy.imread(input_path) as raw:
                rgb = raw.postprocess(
                    use_camera_wb=True, 
                    no_auto_bright=False, 
                    bright=1.0, 
                    user_sat=None, 
                    output_bps=8
                )
            
            # 2. To PIL for Grading & Resizing
            pil_img = Image.fromarray(rgb)
            
            # Resize
            if scale < 1.0:
                if progress_callback: progress_callback("Scaling...", 0.2)
                new_w = int(pil_img.width * scale)
                new_h = int(pil_img.height * scale)
                pil_img = pil_img.resize((new_w, new_h), resample=Image.LANCZOS)

            # 3. Apply Grading
            if grading_params:
                if progress_callback: progress_callback("Apply Grading...", 0.3)
                pil_img = self._apply_grading(pil_img, **grading_params)

            # 4. Save Logic
            # If PNG/TIFF, just save directly (Lossless / High Quality)
            # If JPEG, use our strict IJG pipeline
            
            out_ext = os.path.splitext(output_path)[1].lower()
            
            if out_ext in ['.png', '.tiff', '.tif']:
                if progress_callback: progress_callback("Saving...", 0.9)
                pil_img.save(output_path, quality=quality if out_ext != '.png' else None) # PNG ignores quality
            else:
                # Run IJG JPEG Pipeline
                rgb = np.array(pil_img).astype(np.float64)
                h, w, _ = rgb.shape
                
                if progress_callback: progress_callback("Color Transform...", 0.5)
                Y, Cb, Cr = self._rgb_to_ycbcr_rec601(rgb)

                if chroma_subsampling:
                    # Simulation
                    def subsample_simulate(channel):
                        pad_h_s = (2 - (h % 2)) % 2
                        pad_w_s = (2 - (w % 2)) % 2
                        c_padded = np.pad(channel, ((0, pad_h_s), (0, pad_w_s)), mode='edge')
                        small = c_padded.reshape(c_padded.shape[0]//2, 2, c_padded.shape[1]//2, 2).mean(axis=(1,3))
                        expanded = small.repeat(2, axis=0).repeat(2, axis=1)
                        return expanded[:h, :w]
                    Cb = subsample_simulate(Cb)
                    Cr = subsample_simulate(Cr)

                if progress_callback: progress_callback("DCT & Quant...", 0.7)
                q_luma = self._scale_qtable(self.STD_LUMA_Q, quality)
                q_chroma = self._scale_qtable(self.STD_CHROMA_Q, quality)
                
                Y_rec = self._process_channel(Y, q_luma)
                Cb_rec = self._process_channel(Cb, q_chroma)
                Cr_rec = self._process_channel(Cr, q_chroma)
                
                if progress_callback: progress_callback("Reconstructing...", 0.9)
                rgb_rec = self._ycbcr_to_rgb_rec601(Y_rec, Cb_rec, Cr_rec)
                rgb_final = np.clip(rgb_rec, 0, 255).astype(np.uint8)
                
                Image.fromarray(rgb_final).save(output_path, "JPEG", quality=quality)
            
            if progress_callback: progress_callback("Done!", 1.0)
            return True, f"Saved to {output_path}"

        except Exception as e:
            return False, str(e)

    # --- Helpers (Unchanged) ---
    def _make_dct_matrix(self, n=8):
        D = np.zeros((n, n), dtype=np.float64)
        for u in range(n):
            for v in range(n):
                alpha = math.sqrt(1.0 / n) if u == 0 else math.sqrt(2.0 / n)
                D[u, v] = alpha * math.cos(((2 * v + 1) * u * math.pi) / (2.0 * n))
        return D

    def _rgb_to_ycbcr_rec601(self, rgb):
        R = rgb[..., 0]; G = rgb[..., 1]; B = rgb[..., 2]
        Y  =  0.29900 * R + 0.58700 * G + 0.11400 * B
        Cb = -0.16874 * R - 0.33126 * G + 0.50000 * B + 128.0
        Cr =  0.50000 * R - 0.41869 * G - 0.08131 * B + 128.0
        return Y, Cb, Cr

    def _ycbcr_to_rgb_rec601(self, Y, Cb, Cr):
        Cb_c = Cb - 128.0; Cr_c = Cr - 128.0
        R = Y + 1.40200 * Cr_c
        G = Y - 0.34414 * Cb_c - 0.71414 * Cr_c
        B = Y + 1.77200 * Cb_c
        return np.stack([R, G, B], axis=-1)

    def _scale_qtable(self, qtable, quality):
        if quality <= 0: quality = 1
        if quality > 100: quality = 100
        scale = 5000 / quality if quality < 50 else 200 - 2 * quality
        scaled = np.floor((qtable * scale + 50) / 100)
        scaled[scaled < 1] = 1; scaled[scaled > 255] = 255
        return scaled

    def _process_channel(self, channel, qtable):
        h, w = channel.shape
        pad_h = (8 - (h % 8)) % 8; pad_w = (8 - (w % 8)) % 8
        padded = np.pad(channel, ((0, pad_h), (0, pad_w)), mode='edge')
        H_p, W_p = padded.shape
        out = np.zeros_like(padded, dtype=np.float64)
        for i in range(0, H_p, 8):
            for j in range(0, W_p, 8):
                block = padded[i:i+8, j:j+8].astype(np.float64)
                block_shifted = block - 128.0
                dct_coeffs = self.dct_matrix @ block_shifted @ self.idct_matrix
                quantized = np.round(dct_coeffs / qtable)
                dequantized = quantized * qtable
                rec = (self.idct_matrix @ dequantized @ self.dct_matrix) + 128.0
                out[i:i+8, j:j+8] = rec
        return np.clip(out[:h, :w], 0, 255)
