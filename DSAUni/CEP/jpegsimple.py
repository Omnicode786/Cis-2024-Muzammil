import numpy as np
import math
from collections import Counter
import rawpy


# ===============================================================
# STEP 1: READ A SIMPLE RAW COLOR IMAGE
# ===============================================================
# We'll assume your .raw file stores RGB pixels as bytes in sequence:
# R, G, B, R, G, B, ... for width*height pixels.

def read_raw_color(filename, width, height):
    with open(filename, "rb") as f:
        data = np.frombuffer(f.read(), dtype=np.uint8)
    # reshape into (height, width, 3)
    img = data.reshape((height, width, 3))
    return img.astype(float)

# ===============================================================
# STEP 2: COLOR SPACE CONVERSION (RGB → YCbCr)
# ===============================================================
# JPEG doesn't compress RGB directly; it uses YCbCr to separate
# brightness (Y) from color information (Cb, Cr).

def rgb_to_ycbcr(image):
    R = image[..., 0]
    G = image[..., 1]
    B = image[..., 2]
    Y  = 0.299 * R + 0.587 * G + 0.114 * B
    Cb = -0.1687 * R - 0.3313 * G + 0.5 * B + 128
    Cr = 0.5 * R - 0.4187 * G - 0.0813 * B + 128
    return Y, Cb, Cr

# ===============================================================
# STEP 3: DEFINE JPEG UTILITY FUNCTIONS (DCT, QUANTIZATION, ETC.)
# ===============================================================

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

def quantize(block, qtable):
    return np.round(block / qtable)

def dequantize(block, qtable):
    return block * qtable

def zigzag(block):
    h, w = block.shape
    result = []
    for s in range(h + w - 1):
        if s % 2 == 0:
            for y in range(min(s, w-1), max(-1, s-h), -1):
                x = s - y
                result.append(block[x, y])
        else:
            for x in range(min(s, h-1), max(-1, s-w), -1):
                y = s - x
                result.append(block[x, y])
    return np.array(result)

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

def rle_encode(arr):
    encoded = []
    zeros = 0
    for val in arr[1:]:
        if val == 0:
            zeros += 1
        else:
            encoded.append((zeros, int(val)))
            zeros = 0
    encoded.append((0, 0))
    return encoded

def rle_decode(encoded):
    out = [0]  # start with DC term
    for zeros, val in encoded:
        if (zeros, val) == (0, 0):
            break
        out.extend([0]*zeros)
        out.append(val)
    while len(out) < 64:
        out.append(0)
    return np.array(out)

def build_huffman_table(data):
    symbols = [v for (_, v) in data]
    freq = Counter(symbols)
    sorted_symbols = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    table = {}
    code = 0
    bits_len = max(1, math.ceil(math.log2(len(sorted_symbols)))) if sorted_symbols else 1
    for sym, _ in sorted_symbols:
        table[sym] = format(code, f'0{bits_len}b')
        code += 1
    return table

# ===============================================================
# STEP 4: PROCESS ONE 8×8 BLOCK (core JPEG logic)
# ===============================================================
def process_block(block, qtable):
    shifted = block - 128
    dct_block = dct_2d(shifted)
    quant = quantize(dct_block, qtable)
    zig = zigzag(quant)
    rle = rle_encode(zig)
    huff = build_huffman_table(rle)
    return {
        "dct": dct_block,
        "quant": quant,
        "zigzag": zig,
        "rle": rle,
        "huff": huff
    }

# ===============================================================
# STEP 5: FULL IMAGE PIPELINE
# ===============================================================
def compress_color_image(raw_filename, width, height):
    img = read_raw_color(raw_filename, width, height)
    Y, Cb, Cr = rgb_to_ycbcr(img)

    QY = np.array([
        [16,11,10,16,24,40,51,61],
        [12,12,14,19,26,58,60,55],
        [14,13,16,24,40,57,69,56],
        [14,17,22,29,51,87,80,62],
        [18,22,37,56,68,109,103,77],
        [24,35,55,64,81,104,113,92],
        [49,64,78,87,103,121,120,101],
        [72,92,95,98,112,100,103,99]
    ], dtype=float)

    QC = np.ones((8,8)) * 99  # coarser for color channels

    # Take just the first 8x8 block of each channel for demonstration
    blockY = Y[:8, :8]
    blockCb = Cb[:8, :8]
    blockCr = Cr[:8, :8]

    print("Compressing Y channel...")
    resultY = process_block(blockY, QY)
    print("Compressing Cb channel...")
    resultCb = process_block(blockCb, QC)
    print("Compressing Cr channel...")
    resultCr = process_block(blockCr, QC)

    print("\n--- Y Channel DCT ---\n", np.round(resultY["dct"], 2))
    print("\n--- Y Quantized ---\n", resultY["quant"])
    print("\n--- Zigzag Y ---\n", resultY["zigzag"])
    print("\n--- RLE Y ---\n", resultY["rle"])
    print("\n--- Huffman table Y ---\n", resultY["huff"])

    # For simplicity, we stop here — this demonstrates all algorithms.
    # A real encoder would do this for every block and write them to a file.

    print("\nSimplified JPEG-like compression complete for first 8x8 block.")

# ===============================================================
# STEP 6: RUN EXAMPLE
# ===============================================================
if __name__ == "__main__":
    # Example usage
    import math, os

    file_size = os.path.getsize("CEP/color_input.raw")
    total_pixels = file_size // 3
    # approximate square dimensions
    side = int(math.sqrt(total_pixels))
    width = side
    height = total_pixels // side
    print(f"Detected approx resolution: {width}x{height}")

    raw_filename = "CEP\color_input.raw"

    print("Starting color JPEG-like compression...")
    compress_color_image(raw_filename, width, height)
