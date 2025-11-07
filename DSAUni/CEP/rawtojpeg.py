# [BEGIN: raw2jpeg.py]
# Educational RAW -> JPEG encoder
# - Implements RAW reading (simple plain .raw), bilinear demosaicing, white balance + gamma,
#   RGB -> YCbCr, 8x8 blocking, DCT/IDCT via matrix multiplication, quantization (standard tables scaled),
#   zig-zag ordering, run-length encoding, and a minimal JPEG writer with bitstream output.
#
# - Uses numpy for array math. Core algorithms are implemented explicitly (DCT matrix, zigzag, RLE, etc.)
#
# Usage (example):
#   python3 raw2jpeg.py input.raw output.jpg --width 512 --height 512 --bitdepth 12 --quality 75

import numpy as np
import math
import struct
from dataclasses import dataclass

# ---------- Utility helpers ----------
def clamp(arr, low=0, high=255):
    a = np.round(arr).astype(np.int32)
    a = np.clip(a, low, high)
    return a.astype(np.uint8)

def read_raw(filename, width, height, bit_depth=12, byteorder='little'):
    """
    Read a plain .raw file with known width, height, and bit depth.
    Returns a 2D NumPy array of dtype np.uint16 (for safety).
    """
    count = width * height
    if bit_depth <= 8:
        bytes_per_sample = 1
    elif bit_depth <= 16:
        bytes_per_sample = 2
    else:
        raise ValueError("Unsupported bit depth")
    with open(filename, 'rb') as f:
        raw = f.read(count * bytes_per_sample)
    if bytes_per_sample == 1:
        arr = np.frombuffer(raw, dtype=np.uint8).astype(np.uint16)
    else:
        if byteorder == 'little':
            arr = np.frombuffer(raw, dtype='<u2').astype(np.uint16)
        else:
            arr = np.frombuffer(raw, dtype='>u2').astype(np.uint16)
    arr = arr.reshape((height, width))
    return arr

# ---------- Demosaicing (bilinear interpolation) ----------
def demosaic_bilinear(raw, pattern='RGGB'):
    """
    Simple bilinear demosaicing for RGGB Bayer pattern.
    Returns an RGB float64 array (H x W x 3).
    """
    h, w = raw.shape
    rgb = np.zeros((h, w, 3), dtype=np.float64)

    rows = np.arange(h)[:, None]
    cols = np.arange(w)[None, :]
    mask_R = ((rows % 2 == 0) & (cols % 2 == 0))
    mask_G1 = ((rows % 2 == 0) & (cols % 2 == 1))
    mask_G2 = ((rows % 2 == 1) & (cols % 2 == 0))
    mask_G = mask_G1 | mask_G2
    mask_B = ((rows % 2 == 1) & (cols % 2 == 1))

    rgb[..., 0][mask_R] = raw[mask_R]   # R
    rgb[..., 1][mask_G] = raw[mask_G]   # G
    rgb[..., 2][mask_B] = raw[mask_B]   # B

    padded = np.pad(raw, ((1,1),(1,1)), mode='reflect').astype(np.float64)
    def get_patch(i, j, di, dj):
        return padded[i+1+di, j+1+dj]

    for i in range(h):
        for j in range(w):
            if mask_R[i,j]:
                g_vals = []
                b_vals = []
                for di, dj in [(-1,0),(1,0),(0,-1),(0,1)]:
                    g_vals.append(get_patch(i, j, di, dj))
                for di, dj in [(-1,-1),(-1,1),(1,-1),(1,1)]:
                    b_vals.append(get_patch(i, j, di, dj))
                rgb[i,j,1] = np.mean(g_vals)
                rgb[i,j,2] = np.mean(b_vals)
            elif mask_B[i,j]:
                g_vals = []
                r_vals = []
                for di, dj in [(-1,0),(1,0),(0,-1),(0,1)]:
                    g_vals.append(get_patch(i, j, di, dj))
                for di, dj in [(-1,-1),(-1,1),(1,-1),(1,1)]:
                    r_vals.append(get_patch(i, j, di, dj))
                rgb[i,j,1] = np.mean(g_vals)
                rgb[i,j,0] = np.mean(r_vals)
            else:
                rgb[i,j,1] = raw[i,j]
                if ((i % 2) == 0):
                    r_vals = []
                    b_vals = []
                    for di, dj in [(0,-1),(0,1)]:
                        r_vals.append(get_patch(i, j, di, dj))
                    for di, dj in [(-1,0),(1,0)]:
                        b_vals.append(get_patch(i, j, di, dj))
                    rgb[i,j,0] = np.mean(r_vals)
                    rgb[i,j,2] = np.mean(b_vals)
                else:
                    r_vals = []
                    b_vals = []
                    for di, dj in [(-1,0),(1,0)]:
                        r_vals.append(get_patch(i, j, di, dj))
                    for di, dj in [(0,-1),(0,1)]:
                        b_vals.append(get_patch(i, j, di, dj))
                    rgb[i,j,0] = np.mean(r_vals)
                    rgb[i,j,2] = np.mean(b_vals)
    return rgb

# ---------- Color correction and gamma ----------
def apply_white_balance_and_gamma(rgb, gains=(1.0,1.0,1.0), gamma=2.2):
    """
    Apply per-channel gains and gamma correction. Input rgb in [0,1].
    Returns rgb in [0,1].
    """
    corrected = np.empty_like(rgb, dtype=np.float64)
    corrected[...,0] = rgb[...,0] * gains[0]
    corrected[...,1] = rgb[...,1] * gains[1]
    corrected[...,2] = rgb[...,2] * gains[2]
    corrected = np.clip(corrected, 0.0, None)
    corrected = np.power(corrected, 1.0 / gamma)
    corrected = np.clip(corrected, 0.0, 1.0)
    return corrected

# ---------- RGB -> YCbCr ----------
def rgb_to_ycbcr(rgb):
    R = rgb[...,0]; G = rgb[...,1]; B = rgb[...,2]
    Y =  0.29900 * R + 0.58700 * G + 0.11400 * B
    Cb = -0.168736 * R - 0.331264 * G + 0.5 * B
    Cr =  0.5 * R - 0.418688 * G - 0.081312 * B
    Y_255 = (Y * 255.0).astype(np.float64)
    Cb_255 = (Cb * 255.0 + 128.0).astype(np.float64)
    Cr_255 = (Cr * 255.0 + 128.0).astype(np.float64)
    return Y_255, Cb_255, Cr_255

# ---------- DCT (8x8) ----------
def make_dct_matrix(n=8):
    D = np.zeros((n,n), dtype=np.float64)
    for u in range(n):
        for v in range(n):
            alpha = math.sqrt(1.0/n) if u == 0 else math.sqrt(2.0/n)
            D[u,v] = alpha * math.cos(((2*v+1) * u * math.pi) / (2.0 * n))
    return D
D8 = make_dct_matrix(8)
ID8 = D8.T
def dct_2d(block):
    return D8 @ block @ ID8
def idct_2d(coeffs):
    return ID8 @ coeffs @ D8

# ---------- Quantization tables ----------
STD_LUMINANCE_Q = np.array([
 [16,11,10,16,24,40,51,61],
 [12,12,14,19,26,58,60,55],
 [14,13,16,24,40,57,69,56],
 [14,17,22,29,51,87,80,62],
 [18,22,37,56,68,109,103,77],
 [24,35,55,64,81,104,113,92],
 [49,64,78,87,103,121,120,101],
 [72,92,95,98,112,100,103,99]
], dtype=np.int32)
STD_CHROMINANCE_Q = np.array([
 [17,18,24,47,99,99,99,99],
 [18,21,26,66,99,99,99,99],
 [24,26,56,99,99,99,99,99],
 [47,66,99,99,99,99,99,99],
 [99,99,99,99,99,99,99,99],
 [99,99,99,99,99,99,99,99],
 [99,99,99,99,99,99,99,99],
 [99,99,99,99,99,99,99,99]
], dtype=np.int32)
def scale_quant_table(qtable, quality=75):
    if quality < 1:
        quality = 1
    if quality > 100:
        quality = 100
    if quality < 50:
        scale = 5000 / quality
    else:
        scale = 200 - quality*2
    scaled = ((qtable * scale) + 50) // 100
    scaled[scaled < 1] = 1
    scaled[scaled > 255] = 255
    return scaled.astype(np.int32)

# ---------- Zig-zag ----------
def zigzag_scan(block):
    flat = np.zeros(64, dtype=np.int32)
    idx = 0
    n = 8
    for s in range(0, 2*n - 1):
        if s % 2 == 0:
            r_start = min(s, n-1)
            c_start = s - r_start
            r = r_start; c = c_start
            while r >= 0 and c < n:
                flat[idx] = int(block[r,c]); idx += 1; r -= 1; c += 1
        else:
            c_start = min(s, n-1)
            r_start = s - c_start
            r = r_start; c = c_start
            while r < n and c >= 0:
                flat[idx] = int(block[r,c]); idx += 1; r += 1; c -= 1
    return flat

# ---------- RLE for AC ----------
def rle_ac(coeffs):
    dc = coeffs[0]
    ac = coeffs[1:]
    tokens = []
    run = 0
    for a in ac:
        if a == 0:
            run += 1
            if run == 16:
                tokens.append(('ZRL', None))
                run = 0
        else:
            mag = abs(a)
            size = int(math.floor(math.log2(mag))) + 1 if mag != 0 else 0
            tokens.append((run, size, a))
            run = 0
    if run > 0:
        tokens.append(('EOB', None))
    return dc, tokens

# ---------- Basic Huffman building (canonical) ----------
def build_huffman_table(bits, vals):
    huff = {}
    code = 0
    idx = 0
    for k in range(1, len(bits)):
        for i in range(bits[k]):
            symbol = vals[idx]
            huff[symbol] = (code, k)
            code += 1
            idx += 1
        code <<= 1
    return huff

# Standard small tables for DC (educational)
STD_LUMA_DC_BITS = [0,1,5,1,1,1,1,1,1,1,1,0,0,0,0,0]
STD_LUMA_DC_VALS = [0,1,2,3,4,5,6,7,8,9,10,11]
STD_CHROMA_DC_BITS = [0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0]
STD_CHROMA_DC_VALS = [0,1,2,3,4,5,6,7,8,9,10,11]
LUMA_DC_HUFF = build_huffman_table(STD_LUMA_DC_BITS, STD_LUMA_DC_VALS)
CHROMA_DC_HUFF = build_huffman_table(STD_CHROMA_DC_BITS, STD_CHROMA_DC_VALS)

# ---------- BitWriter ----------
class BitWriter:
    def __init__(self):
        self.buffer = bytearray()
        self.accumulator = 0
        self.bits_filled = 0
    def write_bits(self, bits, length):
        while length > 0:
            remaining = 8 - self.bits_filled
            to_write = min(remaining, length)
            shift = length - to_write
            chunk = (bits >> shift) & ((1 << to_write) - 1)
            self.accumulator = (self.accumulator << to_write) | chunk
            self.bits_filled += to_write
            length -= to_write
            if self.bits_filled == 8:
                byte = self.accumulator & 0xFF
                self.buffer.append(byte)
                if byte == 0xFF:
                    self.buffer.append(0x00)
                self.accumulator = 0
                self.bits_filled = 0
    def flush(self):
        if self.bits_filled > 0:
            padding = 8 - self.bits_filled
            self.accumulator <<= padding
            byte = self.accumulator & 0xFF
            self.buffer.append(byte)
            if byte == 0xFF:
                self.buffer.append(0x00)
            self.accumulator = 0
            self.bits_filled = 0
    def get_bytes(self):
        return bytes(self.buffer)

# ---------- Minimal JPEG writer ----------
def write_jpeg(filename, width, height, y_blocks, cb_blocks, cr_blocks, qY, qC):
    outfile = open(filename, 'wb')
    def write_marker(marker):
        outfile.write(struct.pack('>H', marker))
    # SOI
    write_marker(0xFFD8)
    # APP0 JFIF
    app0 = bytearray(b'JFIF\0'); app0.extend(b'\x01\x02'); app0.extend(b'\x00'); app0.extend(struct.pack('>HH',1,1)); app0.extend(b'\x00\x00')
    write_marker(0xFFE0); outfile.write(struct.pack('>H', len(app0)+2)); outfile.write(app0)
    # DQT
    write_marker(0xFFDB)
    dqt_payload = bytearray()
    dqt_payload.append(0)
    dqt_payload.extend(qY.flatten().tolist())
    dqt_payload.append(1)
    dqt_payload.extend(qC.flatten().tolist())
    outfile.write(struct.pack('>H', len(dqt_payload)+2)); outfile.write(dqt_payload)
    # SOF0
    write_marker(0xFFC0)
    sof_payload = bytearray()
    sof_payload.append(8)
    sof_payload.extend(struct.pack('>H', height)); sof_payload.extend(struct.pack('>H', width))
    sof_payload.append(3)
    sof_payload.append(1); sof_payload.append((1<<4)|1); sof_payload.append(0)
    sof_payload.append(2); sof_payload.append((1<<4)|1); sof_payload.append(1)
    sof_payload.append(3); sof_payload.append((1<<4)|1); sof_payload.append(1)
    outfile.write(struct.pack('>H', len(sof_payload)+2)); outfile.write(sof_payload)
    # SOS
    write_marker(0xFFDA)
    sos_payload = bytearray()
    sos_payload.append(3)
    sos_payload.append(1); sos_payload.append((0<<4)|0)
    sos_payload.append(2); sos_payload.append((1<<4)|1)
    sos_payload.append(3); sos_payload.append((1<<4)|1)
    sos_payload.append(0); sos_payload.append(63); sos_payload.append(0)
    outfile.write(struct.pack('>H', len(sos_payload)+2)); outfile.write(sos_payload)
    # compressed stream (simplified)
    bw = BitWriter()
    prev_dc_y = 0; prev_dc_cb = 0; prev_dc_cr = 0
    num_blocks = len(y_blocks)
    for i_blk in range(num_blocks):
        y_z = zigzag_scan(y_blocks[i_blk])
        cb_z = zigzag_scan(cb_blocks[i_blk])
        cr_z = zigzag_scan(cr_blocks[i_blk])
        # Y DC
        dc_y = int(y_z[0]); diff = dc_y - prev_dc_y; prev_dc_y = dc_y
        if diff == 0:
            size = 0; valbits = 0
        else:
            size = int(math.floor(math.log2(abs(diff))) + 1)
            valbits = diff - 1 + (1 << size) if diff < 0 else diff
        symbol = size if size in LUMA_DC_HUFF else 0
        code, length = LUMA_DC_HUFF.get(symbol, (0,1))
        bw.write_bits(code, length)
        if size > 0:
            bw.write_bits(valbits, size)
        # Y AC (simplified RLE encoding)
        dc, tokens = rle_ac(y_z)
        for t in tokens:
            if t == ('EOB', None):
                bw.write_bits(0b1010, 4)
            elif t == ('ZRL', None):
                bw.write_bits(0b11111111001, 11)
            else:
                run, size, val = t
                rs_sym = (run << 4) | size
                bw.write_bits(rs_sym & 0xFF, 8)
                if size > 0:
                    if val < 0:
                        vbits = val - 1 + (1 << size)
                    else:
                        vbits = val
                    bw.write_bits(vbits, size)
        # Cb DC
        dc_cb = int(cb_z[0]); diff_cb = dc_cb - prev_dc_cb; prev_dc_cb = dc_cb
        if diff_cb == 0:
            size_cb = 0; vbits_cb = 0
        else:
            size_cb = int(math.floor(math.log2(abs(diff_cb))) + 1)
            vbits_cb = diff_cb - 1 + (1 << size_cb) if diff_cb < 0 else diff_cb
        sym_cb = size_cb if size_cb in CHROMA_DC_HUFF else 0
        code_cb, len_cb = CHROMA_DC_HUFF.get(sym_cb, (0,1))
        bw.write_bits(code_cb, len_cb)
        if size_cb > 0:
            bw.write_bits(vbits_cb, size_cb)
        dc2, tokens2 = rle_ac(cb_z)
        for t in tokens2:
            if t == ('EOB', None):
                bw.write_bits(0b1010, 4)
            elif t == ('ZRL', None):
                bw.write_bits(0b11111111001, 11)
            else:
                run, size, val = t
                bw.write_bits(((run << 4) | size) & 0xFF, 8)
                if size > 0:
                    vbits = val - 1 + (1 << size) if val < 0 else val
                    bw.write_bits(vbits, size)
        # Cr DC
        dc_cr = int(cr_z[0]); diff_cr = dc_cr - prev_dc_cr; prev_dc_cr = dc_cr
        if diff_cr == 0:
            size_cr = 0; vbits_cr = 0
        else:
            size_cr = int(math.floor(math.log2(abs(diff_cr))) + 1)
            vbits_cr = diff_cr - 1 + (1 << size_cr) if diff_cr < 0 else diff_cr
        sym_cr = size_cr if size_cr in CHROMA_DC_HUFF else 0
        code_cr, len_cr = CHROMA_DC_HUFF.get(sym_cr, (0,1))
        bw.write_bits(code_cr, len_cr)
        if size_cr > 0:
            bw.write_bits(vbits_cr, size_cr)
        dc3, tokens3 = rle_ac(cr_z)
        for t in tokens3:
            if t == ('EOB', None):
                bw.write_bits(0b1010, 4)
            elif t == ('ZRL', None):
                bw.write_bits(0b11111111001, 11)
            else:
                run, size, val = t
                bw.write_bits(((run << 4) | size) & 0xFF, 8)
                if size > 0:
                    vbits = val - 1 + (1 << size) if val < 0 else val
                    bw.write_bits(vbits, size)
    bw.flush()
    compressed = bw.get_bytes()
    outfile.write(compressed)
    write_marker(0xFFD9)
    outfile.close()

# ---------- High-level pipeline ----------
def raw_to_jpeg(raw_filename, out_jpeg, width, height, bit_depth=12, quality=75,
                wb_gains=(1.0,1.0,1.0), gamma=2.2):
    print("Reading raw file...")
    raw = read_raw(raw_filename, width, height, bit_depth)
    max_sample = (1 << bit_depth) - 1
    print("Demosaicing...")
    rgb = demosaic_bilinear(raw)
    print("Normalizing and applying white balance & gamma...")
    rgb_norm = rgb / float(max_sample)
    rgb_wb = apply_white_balance_and_gamma(rgb_norm, gains=wb_gains, gamma=gamma)
    print("Converting to YCbCr...")
    Y, Cb, Cr = rgb_to_ycbcr(rgb_wb)
    print("Preparing 8x8 blocks...")
    pad_h = (8 - (height % 8)) % 8
    pad_w = (8 - (width % 8)) % 8
    Y_p = np.pad(Y, ((0,pad_h),(0,pad_w)), mode='edge')
    Cb_p = np.pad(Cb, ((0,pad_h),(0,pad_w)), mode='edge')
    Cr_p = np.pad(Cr, ((0,pad_h),(0,pad_w)), mode='edge')
    H_p, W_p = Y_p.shape
    y_blocks = []; cb_blocks = []; cr_blocks = []
    qY = scale_quant_table(STD_LUMINANCE_Q, quality=quality)
    qC = scale_quant_table(STD_CHROMINANCE_Q, quality=quality)
    for i in range(0, H_p, 8):
        for j in range(0, W_p, 8):
            blockY = Y_p[i:i+8, j:j+8].astype(np.float64) - 128.0
            blockCb = Cb_p[i:i+8, j:j+8].astype(np.float64) - 128.0
            blockCr = Cr_p[i:i+8, j:j+8].astype(np.float64) - 128.0
            dctY = dct_2d(blockY)
            dctCb = dct_2d(blockCb)
            dctCr = dct_2d(blockCr)
            qY_block = np.round(dctY / qY).astype(np.int32)
            qC_block = np.round(dctCb / qC).astype(np.int32)
            qCr_block = np.round(dctCr / qC).astype(np.int32)
            y_blocks.append(qY_block); cb_blocks.append(qC_block); cr_blocks.append(qCr_block)
    print("Writing JPEG...")
    write_jpeg(out_jpeg, width, height, y_blocks, cb_blocks, cr_blocks, qY, qC)
    print("Done. Output written to", out_jpeg)

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description="Educational RAW -> JPEG encoder (baseline).")
    parser.add_argument('input_raw', help='Input raw filename (plain binary samples).')
    parser.add_argument('output_jpeg', help='Output JPEG filename.')
    parser.add_argument('--width', type=int, required=True, help='Image width in pixels.')
    parser.add_argument('--height', type=int, required=True, help='Image height in pixels.')
    parser.add_argument('--bitdepth', type=int, default=12, help='Samples bit depth (<=16).')
    parser.add_argument('--quality', type=int, default=75, help='JPEG compression quality (1..100).')
    parser.add_argument('--wb', nargs=3, type=float, default=[1.0,1.0,1.0], help='White balance gains R G B.')
    parser.add_argument('--gamma', type=float, default=2.2, help='Gamma value for correction.')
    args = parser.parse_args()
    raw_to_jpeg(args.input_raw, args.output_jpeg, args.width, args.height,
                bit_depth=args.bitdepth, quality=args.quality,
                wb_gains=tuple(args.wb), gamma=args.gamma)
# [END: raw2jpeg.py]
