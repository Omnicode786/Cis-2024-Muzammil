#!/usr/bin/env python3
"""
raw_to_jpeg_auto.py
Simplified educational RAW → JPEG converter.

- Accepts camera RAWs via rawpy (.DNG/.CR2/.NEF/.ARW...) or plain .raw (rgb24/gray8)
- Optional downscale (resolution compression)
- Explicit JPEG-like pipeline: RGB -> YCbCr -> DCT -> Quantization -> IDCT -> RGB -> JPEG
"""

import os
import math
import argparse
import numpy as np
from PIL import Image
import rawpy

# ----------------------------
# DCT (Discrete Cosine Transform)
# ----------------------------
def make_dct_matrix(n=8):
    """Create NxN orthonormal DCT-II matrix for fast DCT via matrix multiply."""
    D = np.zeros((n, n), dtype=np.float64)
    for u in range(n):
        for v in range(n):
            alpha = math.sqrt(1.0 / n) if u == 0 else math.sqrt(2.0 / n)
            D[u, v] = alpha * math.cos(((2 * v + 1) * u * math.pi) / (2.0 * n))
    return D

D8 = make_dct_matrix(8)
ID8 = D8.T  # inverse of orthonormal DCT is just its transpose

def dct_block(block):
    """Compute 2D DCT of an 8x8 block."""
    return D8 @ block @ ID8

def idct_block(coeffs):
    """Inverse 2D DCT."""
    return ID8 @ coeffs @ D8

# ----------------------------
# Quantization tables
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
    """Scale quantization table based on quality (1–100)."""
    q = min(max(quality, 1), 100)
    scale = 5000 / q if q < 50 else 200 - 2 * q
    scaled = np.floor((qtable * scale + 50) / 100)
    scaled = np.clip(scaled, 1, 255)
    return scaled

# ----------------------------
# Color conversions
# ----------------------------
def rgb_to_ycbcr(rgb):
    """Convert RGB -> YCbCr (used in JPEG compression)."""
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    Y  =  0.299 * R + 0.587 * G + 0.114 * B
    Cb = -0.169 * R - 0.331 * G + 0.5 * B + 128
    Cr =  0.5 * R - 0.419 * G - 0.081 * B + 128
    return Y, Cb, Cr

def ycbcr_to_rgb(Y, Cb, Cr):
    """Convert YCbCr -> RGB."""
    R = Y + 1.402 * (Cr - 128)
    G = Y - 0.344 * (Cb - 128) - 0.714 * (Cr - 128)
    B = Y + 1.772 * (Cb - 128)
    rgb = np.stack([R, G, B], axis=-1)
    return np.clip(rgb, 0, 255)

# ----------------------------
# Block processing
# ----------------------------
def pad_to_multiple(img_channel, block=8):
    """Pad 2D array so both dimensions are multiples of block size."""
    h, w = img_channel.shape
    pad_h = (block - (h % block)) % block
    pad_w = (block - (w % block)) % block
    if pad_h == 0 and pad_w == 0:
        return img_channel, (0, 0)
    padded = np.pad(img_channel, ((0, pad_h), (0, pad_w)), mode='edge')
    return padded, (pad_h, pad_w)

def process_channel_blocks(channel, qtable):
    """Apply DCT, quantization, dequantization, and IDCT to the entire channel."""
    padded, _ = pad_to_multiple(channel, 8)
    out = np.zeros_like(padded, dtype=np.float64)
    H, W = padded.shape

    for i in range(0, H, 8):
        for j in range(0, W, 8):
            block = padded[i:i+8, j:j+8] - 128.0
            coeffs = dct_block(block)
            q = np.round(coeffs / qtable)
            deq = q * qtable
            rec = idct_block(deq) + 128.0
            out[i:i+8, j:j+8] = rec

    return np.clip(out[:channel.shape[0], :channel.shape[1]], 0, 255).astype(np.uint8)

# ----------------------------
# RAW reading helpers
# ----------------------------
def read_with_rawpy(path):
    """Read camera RAW file using rawpy and return RGB array."""
    with rawpy.imread(path) as raw:
        rgb = raw.postprocess(use_camera_wb=True, no_auto_bright=True, output_bps=8)
    return rgb

def read_plain_raw(path, width, height, fmt='rgb24'):
    """Read a plain .raw file (rgb24 or gray8)."""
    data = np.fromfile(path, dtype=np.uint8)
    if fmt == 'rgb24':
        img = data.reshape((height, width, 3))
    elif fmt == 'gray8':
        gray = data.reshape((height, width))
        img = np.stack([gray, gray, gray], axis=-1)
    else:
        raise ValueError("Unsupported format (use 'rgb24' or 'gray8')")
    return img

# ----------------------------
# Main RAW → JPEG function
# ----------------------------
def compress_raw_auto(input_path, output_path, scale=1.0, quality=75,
                      raw_format=None, raw_width=None, raw_height=None):
    """Convert RAW (camera or plain) to JPEG."""
    ext = os.path.splitext(input_path)[1].lower()

    if ext not in ['.dng', '.cr2', '.nef', '.arw', '.raw']:
        raise ValueError("Unsupported input: only RAW formats allowed!")

    print(f"[info] Reading RAW file: {input_path}")
    if ext == '.raw' or raw_format is not None:
        img = read_plain_raw(input_path, raw_width, raw_height, fmt=raw_format or 'rgb24')
    else:
        img = read_with_rawpy(input_path)

    img = img.astype(np.float64)

    # Downscale if requested
    if 0 < scale < 1.0:
        pil = Image.fromarray(np.uint8(img))
        new_w = max(1, int(pil.width * scale))
        new_h = max(1, int(pil.height * scale))
        img = np.array(pil.resize((new_w, new_h), resample=Image.LANCZOS)).astype(np.float64)
        print(f"[info] Downscaled to {new_w}x{new_h}")

    print(f"[info] Compressing to JPEG (quality={quality})...")

    Y, Cb, Cr = rgb_to_ycbcr(img)
    qY = scale_quant_table(STD_LUMA_Q, quality)
    qC = scale_quant_table(STD_CHROMA_Q, quality)

    Y_rec = process_channel_blocks(Y, qY)
    Cb_rec = process_channel_blocks(Cb, qC)
    Cr_rec = process_channel_blocks(Cr, qC)

    rgb_rec = ycbcr_to_rgb(Y_rec, Cb_rec, Cr_rec)
    Image.fromarray(np.uint8(rgb_rec)).save(output_path, format='JPEG', quality=int(quality))

    print(f"[done] Saved JPEG: {output_path}")

# ----------------------------
# CLI
# ----------------------------
def parse_args():
    p = argparse.ArgumentParser(description="Simple RAW → JPEG converter.")
    p.add_argument("input", help="Input RAW file (.dng/.cr2/.raw etc.)")
    p.add_argument("output", help="Output JPEG file (e.g., out.jpg)")
    p.add_argument("--scale", type=float, default=1.0, help="Downscale factor (0.0 < s <= 1.0)")
    p.add_argument("--quality", type=int, default=75, help="JPEG quality (1–100)")
    p.add_argument("--raw-format", choices=['rgb24', 'gray8'], default=None,
                   help="For plain .raw input: specify its format")
    p.add_argument("--width", type=int, default=None, help="Width for plain .raw (if needed)")
    p.add_argument("--height", type=int, default=None, help="Height for plain .raw (if needed)")
    return p.parse_args()

if __name__ == "__main__":
    args = parse_args()
    compress_raw_auto(args.input, args.output,
                      scale=args.scale,
                      quality=args.quality,
                      raw_format=args.raw_format,
                      raw_width=args.width,
                      raw_height=args.height)
