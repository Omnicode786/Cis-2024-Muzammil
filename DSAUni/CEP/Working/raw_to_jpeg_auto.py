#!/usr/bin/env python3
"""
raw_to_jpeg_auto.py
Educational end-to-end RAW -> JPEG compressor.

Features:
- Accepts camera RAWs via rawpy (DNG/CR2/NEF/ARW...) or plain .raw (rgb24 or gray8)
- Optional downscale (resolution compression)
- Explicit pipeline: RGB -> YCbCr, optional chroma subsampling (4:2:0),
  8x8 blocking, DCT, quantization (quality-controlled), dequantize + IDCT
  to reconstruct a lossy image
- Saves the reconstructed image as a standard JPEG (Pillow)

This script is written for clarity/exploration, not performance.
"""

import os
import sys
import math
import argparse
import numpy as np
from PIL import Image
import rawpy

# ----------------------------
# Utilities / DCT matrix
# ----------------------------
def make_dct_matrix(n=8):
    """Return NxN orthonormal DCT-II matrix used for fast DCT via matrix multiply."""
    D = np.zeros((n, n), dtype=np.float64)
    for u in range(n):
        for v in range(n):
            alpha = math.sqrt(1.0 / n) if u == 0 else math.sqrt(2.0 / n)
            D[u, v] = alpha * math.cos(((2 * v + 1) * u * math.pi) / (2.0 * n))
    return D

D8 = make_dct_matrix(8)
ID8 = D8.T  # inverse is transpose with the chosen normalization

def dct_block(block):
    """2D DCT via matrix multiplication. block must be 8x8 float64."""
    return D8 @ block @ ID8

def idct_block(coeffs):
    """Inverse 2D DCT."""
    return ID8 @ coeffs @ D8

# ----------------------------
# Standard quantization tables (baseline JPEG)
# ----------------------------
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
    """
    Scale quant table using IJG style scaling with quality 1..100.
    Lower quality = more aggressive quantization (larger values).
    """
    q = quality
    if q < 1:
        q = 1
    if q > 100:
        q = 100
    if q < 50:
        scale = 5000 / q
    else:
        scale = 200 - 2 * q
    scaled = np.floor((qtable * scale + 50) / 100)
    scaled[scaled < 1] = 1
    scaled[scaled > 255] = 255
    return scaled

# ----------------------------
# Color conversions
# ----------------------------
def rgb_to_ycbcr(rgb):
    """
    Convert float RGB in [0,255] -> Y, Cb, Cr each in [0,255] range.
    Uses ITU-R BT.601 coefficients common for JPEG.
    """
    R = rgb[..., 0].astype(np.float64)
    G = rgb[..., 1].astype(np.float64)
    B = rgb[..., 2].astype(np.float64)
    Y  =  0.59900 * R + 0.88700 * G + 0.41400 * B
    Cb = -0.168736 * R - 0.331264 * G + 0.5 * B + 128.0
    Cr =  0.5 * R - 0.418688 * G - 0.081312 * B + 128.0
    return Y, Cb, Cr

def ycbcr_to_rgb(Y, Cb, Cr):
    """
    Convert YCbCr arrays (0..255) back to RGB (0..255).
    """
    R = Y + 1.40200 * (Cr - 128.0)
    G = Y - 0.344136 * (Cb - 128.0) - 0.714136 * (Cr - 128.0)
    B = Y + 1.77200 * (Cb - 128.0)
    rgb = np.stack([R, G, B], axis=-1)
    return np.clip(rgb, 0, 255)

# ----------------------------
# Block helpers
# ----------------------------
def pad_to_multiple(img_channel, block=8):
    """Pad 2D array so that both dims are multiples of block using edge padding."""
    h, w = img_channel.shape
    pad_h = (block - (h % block)) % block
    pad_w = (block - (w % block)) % block
    if pad_h == 0 and pad_w == 0:
        return img_channel, (0,0)
    padded = np.pad(img_channel, ((0, pad_h), (0, pad_w)), mode='edge')
    return padded, (pad_h, pad_w)

def process_channel_blocks(channel, qtable):
    """
    Process an entire channel with 8x8 DCT -> quantize -> dequantize -> IDCT.
    Returns reconstructed channel clipped to [0,255] and same padded shape.
    """
    padded, (pad_h, pad_w) = pad_to_multiple(channel, 8)
    H, W = padded.shape
    out = np.zeros_like(padded, dtype=np.float64)

    # iterate blocks
    for i in range(0, H, 8):
        for j in range(0, W, 8):
            block = padded[i:i+8, j:j+8].astype(np.float64)
            # level shift for DCT (JPEG uses -128 offset)
            block_shifted = block - 128.0
            # DCT
            coeffs = dct_block(block_shifted)
            # Quantize
            q = np.round(coeffs / qtable)
            # Dequantize (for reconstruction)
            deq = q * qtable
            # IDCT
            rec = idct_block(deq) + 128.0
            out[i:i+8, j:j+8] = rec

    # crop back to original size
    H0, W0 = channel.shape
    out_cropped = out[:H0, :W0]
    return np.clip(out_cropped, 0, 255).astype(np.uint8)

# ----------------------------
# RAW reading helpers
# ----------------------------
def read_with_rawpy(path, output_bps=8):
    """
    Read any RAW supported by LibRaw via rawpy and return an RGB uint8 array.
    output_bps: bits per sample in output (8 recommended).
    raw.postprocess() returns HxWx3 ndarray uint8 if output_bps==8.
    """
    with rawpy.imread(path) as raw:
        # We ask rawpy to apply camera white balance and disable auto brightness to preserve dynamic range
        rgb = raw.postprocess(use_camera_wb=True, no_auto_bright=True, output_bps=output_bps)
    return rgb  # dtype uint8

def read_plain_raw(path, width, height, fmt='rgb24'):
    """
    Read a plain raw binary file.
    fmt: 'rgb24' (3 bytes per pixel) or 'gray8' (1 byte per pixel).
    If width/height are None, attempt inference (very crude).
    """
    fsize = os.path.getsize(path)
    if fmt == 'rgb24':
        expected = width * height * 3 if (width and height) else None
        if expected and expected != fsize:
            raise ValueError(f"File size ({fsize}) != width*height*3 ({expected}).")
        data = np.fromfile(path, dtype=np.uint8)
        # If width/height not provided, try to infer a square-ish resolution
        if width is None or height is None:
            total_pixels = data.size // 3
            side = int(math.isqrt(total_pixels))
            width = side
            height = total_pixels // side
            if width * height != total_pixels:
                raise ValueError("Cannot infer raw dimensions; please provide width and height.")
        img = data.reshape((height, width, 3))
        return img
    elif fmt == 'gray8':
        if width is None or height is None:
            # infer square
            side = int(math.isqrt(fsize))
            width = height = side
        data = np.fromfile(path, dtype=np.uint8).reshape((height, width))
        # convert to 3-channel gray
        return np.stack([data, data, data], axis=-1)
    else:
        raise ValueError("Unsupported fmt; use 'rgb24' or 'gray8'.")

# ----------------------------
# Main pipeline
# ----------------------------
def compress_raw_auto(input_path, output_path, scale=1.0, quality=75,
                      raw_format=None, raw_width=None, raw_height=None,
                      chroma_subsample=True):
    """
    End-to-end function:
    - Read input (rawpy for camera raw; or plain raw if raw_format specified)
    - Optionally downscale (scale < 1.0)
    - Convert RGB -> YCbCr
    - (Optionally) subsample chroma (4:2:0)
    - Per-channel DCT+quantize+IDCT reconstruction using scaled quant tables
    - Convert back to RGB and save as JPEG
    """

    # 1) Read input
    ext = os.path.splitext(input_path)[1].lower()
    print(f"[info] Input file: {input_path} (ext={ext})")
    if raw_format is not None or ext == '.raw':
        # treat as plain raw binary
        print("[info] Reading plain .raw with provided format.")
        img = read_plain_raw(input_path, raw_width, raw_height, fmt=raw_format or 'rgb24')
    else:
        # use rawpy for camera RAW formats
        print("[info] Using rawpy to decode camera RAW (this handles .dng, .cr2, .nef, .arw, ...).")
        img = read_with_rawpy(input_path, output_bps=8)  # returns HxWx3 uint8

    if img is None:
        raise RuntimeError("Failed to read input image.")

    # Convert to float [0,255] for processing
    img = img.astype(np.float64)

    # 2) Optional downscale
    if scale is None or scale <= 0 or scale > 1.0:
        scale = 1.0
    if scale != 1.0:
        # Use Pillow for resizing to avoid extra dependency
        pil = Image.fromarray(np.uint8(img))
        new_w = max(1, int(pil.width * scale))
        new_h = max(1, int(pil.height * scale))
        pil_small = pil.resize((new_w, new_h), resample=Image.LANCZOS)
        img = np.array(pil_small).astype(np.float64)
        print(f"[info] Downscaled to {new_w}x{new_h}")

    H, W, _ = img.shape
    print(f"[info] Working resolution: {W}x{H}")

    # 3) Convert to YCbCr
    Y, Cb, Cr = rgb_to_ycbcr(img)

    # 4) Optionally chroma-subsample (4:2:0)
    if chroma_subsample:
        # Downsample Cb/Cr by 2 in each dimension (simple average of 2x2 blocks)
        Cb_ds = Cb.reshape((H//2, 2, W//2, 2)).mean(axis=(1,3)) if (H%2==0 and W%2==0) else \
                _downsample_simple(Cb)
        Cr_ds = Cr.reshape((H//2, 2, W//2, 2)).mean(axis=(1,3)) if (H%2==0 and W%2==0) else \
                _downsample_simple(Cr)
        # For simplicity in this educational pipeline we'll process at full resolution without fancy up/down sampling
        # We'll keep Cb and Cr at full resolution by simple upsample back (nearest neighbor)
        # This keeps code simpler while still showing chroma treatment conceptually.
        Cb = np.repeat(np.repeat(Cb_ds, 2, axis=0), 2, axis=1)
        Cr = np.repeat(np.repeat(Cr_ds, 2, axis=0), 2, axis=1)
        print("[info] Performed simple 4:2:0-style subsampling (conceptually).")

    # 5) Prepare quantization tables scaled by quality
    qY = scale_quant_table(STD_LUMA_Q, quality).astype(np.float64)
    qC = scale_quant_table(STD_CHROMA_Q, quality).astype(np.float64)

    # 6) Process channels blockwise (DCT -> Quantize -> Dequantize -> IDCT)
    print("[info] Compressing Y channel (DCT+quant)...")
    Y_rec = process_channel_blocks(Y, qY)
    print("[info] Compressing Cb channel (DCT+quant)...")
    Cb_rec = process_channel_blocks(Cb, qC)
    print("[info] Compressing Cr channel (DCT+quant)...")
    Cr_rec = process_channel_blocks(Cr, qC)

    # 7) Merge back to RGB and save
    print("[info] Converting back to RGB and saving...")
    rgb_rec = ycbcr_to_rgb(Y_rec.astype(np.float64), Cb_rec.astype(np.float64), Cr_rec.astype(np.float64))
    rgb_uint8 = np.clip(rgb_rec, 0, 255).astype(np.uint8)
    Image.fromarray(rgb_uint8).save(output_path, format='JPEG', quality=int(quality))
    print(f"[done] Saved compressed JPEG to: {output_path}")

# Small helper used if image dims are odd for crude subsample
def _downsample_simple(channel):
    h, w = channel.shape
    # pad to even
    h_pad = h + (h % 2)
    w_pad = w + (w % 2)
    padded = np.pad(channel, ((0, h_pad - h), (0, w_pad - w)), mode='edge')
    ds = padded.reshape((h_pad//2, 2, w_pad//2, 2)).mean(axis=(1,3))
    return ds

# ----------------------------
# CLI
# ----------------------------
def parse_args():
    p = argparse.ArgumentParser(description="Educational universal RAW -> JPEG compressor.")
    p.add_argument("input", help="Input RAW file (.dng/.cr2/.raw etc.)")
    p.add_argument("output", help="Output JPEG filename (e.g., out.jpg)")
    p.add_argument("--scale", type=float, default=1.0, help="Downscale factor (0.0 < s <= 1.0).")
    p.add_argument("--quality", type=int, default=75, help="Quality 1..100 (higher = better).")
    p.add_argument("--raw-format", choices=['rgb24', 'gray8'], default=None,
                   help="If input is plain .raw, specify its format. If omitted and extension != .raw, rawpy is used.")
    p.add_argument("--width", type=int, default=None, help="Width for plain .raw (if needed).")
    p.add_argument("--height", type=int, default=None, help="Height for plain .raw (if needed).")
    p.add_argument("--no-chroma-subsample", action='store_true',
                   help="Disable chroma subsampling (keeps chroma full res).")
    return p.parse_args()

if __name__ == "__main__":
    args = parse_args()
    compress_raw_auto(args.input, args.output,
                      scale=args.scale, quality=args.quality,
                      raw_format=args.raw_format,
                      raw_width=args.width, raw_height=args.height,
                      chroma_subsample=(not args.no_chroma_subsample))
