import numpy as np
import math

# ===============================================================
# STEP 1: CREATE A SIMPLE TEST IMAGE
# ===============================================================
# For simplicity, we'll use a small 8x8 grayscale block.
# In a real image, you'd read from a file. Each pixel has intensity [0–255].

image = np.array([
    [52, 55, 61, 66, 70, 61, 64, 73],
    [63, 59, 55, 90, 109, 85, 69, 72],
    [62, 59, 68, 113, 144, 104, 66, 73],
    [63, 58, 71, 122, 154, 106, 70, 69],
    [67, 61, 68, 104, 126, 88, 68, 70],
    [79, 65, 60, 70, 77, 68, 58, 75],
    [85, 71, 64, 59, 55, 61, 65, 83],
    [87, 79, 69, 68, 65, 76, 78, 94]
], dtype=float)

print("Original 8x8 block:")
print(image)

# ===============================================================
# STEP 2: DCT (Discrete Cosine Transform)
# ===============================================================
# DCT converts the image from the "spatial" domain (pixel brightness)
# to the "frequency" domain (how brightness changes).
# Low frequencies represent smooth areas; high frequencies represent edges and details.

def dct_2d(block):
    N = block.shape[0]
    dct = np.zeros((N, N))
    for u in range(N):
        for v in range(N):
            sum_val = 0
            for x in range(N):
                for y in range(N):
                    sum_val += block[x, y] * math.cos((2*x+1)*u*math.pi/(2*N)) * math.cos((2*y+1)*v*math.pi/(2*N))
            Cu = 1 / math.sqrt(2) if u == 0 else 1
            Cv = 1 / math.sqrt(2) if v == 0 else 1
            dct[u, v] = 0.25 * Cu * Cv * sum_val
    return dct

# Before applying DCT, we shift pixel values by 128 so they are centered around 0.
shifted = image - 128
dct_block = dct_2d(shifted)

print("\nDCT coefficients (frequency domain):")
print(np.round(dct_block, 2))

# ===============================================================
# STEP 3: QUANTIZATION
# ===============================================================
# Quantization reduces the precision of less important high-frequency components.
# JPEG uses different quantization matrices for luminance and chrominance.
# We’ll use a standard luminance quantization table (simplified).

Q = np.array([
 [16,11,10,16,24,40,51,61],
 [12,12,14,19,26,58,60,55],
 [14,13,16,24,40,57,69,56],
 [14,17,22,29,51,87,80,62],
 [18,22,37,56,68,109,103,77],
 [24,35,55,64,81,104,113,92],
 [49,64,78,87,103,121,120,101],
 [72,92,95,98,112,100,103,99]
], dtype=float)

quantized = np.round(dct_block / Q)

print("\nAfter quantization:")
print(quantized)

# ===============================================================
# STEP 4: ZIG-ZAG ORDERING
# ===============================================================
# JPEG reads the 8x8 block in a "zig-zag" pattern that groups
# low frequencies first and high frequencies later.

def zigzag(block):
    h, w = block.shape
    result = []
    for s in range(h + w - 1):
        if s % 2 == 0:
            # even diagonals: go bottom-left to top-right
            for y in range(min(s, w-1), max(-1, s-h), -1):
                x = s - y
                result.append(block[x, y])
        else:
            # odd diagonals: go top-right to bottom-left
            for x in range(min(s, h-1), max(-1, s-w), -1):
                y = s - x
                result.append(block[x, y])
    return np.array(result)

zigzagged = zigzag(quantized)

print("\nZig-Zag order:")
print(zigzagged)

# ===============================================================
# STEP 5: RUN-LENGTH ENCODING (RLE)
# ===============================================================
# After zig-zagging, many of the trailing values are zeros.
# Instead of storing each zero, we store pairs of (value, count_of_zeros_before_it).

def rle_encode(arr):
    encoded = []
    zeros = 0
    for val in arr[1:]:  # skip DC term
        if val == 0:
            zeros += 1
        else:
            encoded.append((zeros, int(val)))
            zeros = 0
    encoded.append((0, 0))  # End of Block marker
    return encoded

rle = rle_encode(zigzagged)

print("\nRun-Length Encoded data (zeros, value):")
print(rle)

# ===============================================================
# STEP 6: HUFFMAN ENCODING (Simplified)
# ===============================================================
# Huffman coding assigns shorter bit patterns to frequent symbols.
# We'll build a *very simple* version: use frequency counts to make codes.

from collections import Counter

def build_huffman_table(data):
    """
    Create a basic Huffman table.
    In real JPEG, Huffman tables are predefined, but here we generate one.
    """
    # Flatten all values (just use second values from RLE)
    symbols = [v for (_, v) in data]
    freq = Counter(symbols)
    # Sort by frequency
    sorted_symbols = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    # Assign shorter codes to frequent symbols
    table = {}
    code = 0
    for i, (sym, _) in enumerate(sorted_symbols):
        bits = format(code, f'0{max(1, math.ceil(math.log2(len(sorted_symbols))))}b')
        table[sym] = bits
        code += 1
    return table

huffman_table = build_huffman_table(rle)
print("\nSimplified Huffman table (value -> bit pattern):")
print(huffman_table)

# Encode using Huffman codes
encoded_bits = ""
for zeros, val in rle:
    if val in huffman_table:
        encoded_bits += huffman_table[val] + " "
    else:
        encoded_bits += "000 "  # fallback code
print("\nEncoded bitstream:")
print(encoded_bits)

# ===============================================================
# STEP 7: DECOMPRESSION (reverse steps)
# ===============================================================
# We'll just do a rough reverse to show that we can reconstruct the image.

def rle_decode(encoded):
    out = []
    out.append(zigzagged[0])  # DC term remains same for simplicity
    for zeros, val in encoded:
        if (zeros, val) == (0, 0):
            break
        out.extend([0]*zeros)
        out.append(val)
    # Pad with zeros if needed
    while len(out) < 64:
        out.append(0)
    return np.array(out)

decoded_zigzag = rle_decode(rle)

# Reverse zig-zag
def inverse_zigzag(arr):
    h = w = 8
    block = np.zeros((h, w))
    idx = 0
    for s in range(h + w - 1):
        if s % 2 == 0:
            for y in range(min(s, w-1), max(-1, s-h), -1):
                x = s - y
                block[x, y] = arr[idx]; idx += 1
        else:
            for x in range(min(s, h-1), max(-1, s-w), -1):
                y = s - x
                block[x, y] = arr[idx]; idx += 1
    return block

decoded_block = inverse_zigzag(decoded_zigzag)

# Dequantize
dequantized = decoded_block * Q

# Inverse DCT
def idct_2d(block):
    N = block.shape[0]
    idct = np.zeros((N, N))
    for x in range(N):
        for y in range(N):
            sum_val = 0
            for u in range(N):
                for v in range(N):
                    Cu = 1 / math.sqrt(2) if u == 0 else 1
                    Cv = 1 / math.sqrt(2) if v == 0 else 1
                    sum_val += Cu * Cv * block[u, v] * math.cos((2*x+1)*u*math.pi/(2*N)) * math.cos((2*y+1)*v*math.pi/(2*N))
            idct[x, y] = 0.25 * sum_val
    return idct

reconstructed = idct_2d(dequantized) + 128

print("\nReconstructed 8x8 block after inverse DCT:")
print(np.round(reconstructed))

# Compare original and reconstructed difference
print("\nDifference between original and reconstructed:")
print(np.round(image - reconstructed))
