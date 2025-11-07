import numpy as np
import struct
import matplotlib.pyplot as plt

# ----------------------------
# Step 1: Read the RAW file
# ----------------------------
# We'll assume a very simple RAW file:
# - Grayscale only
# - Each pixel = 1 byte (0–255)
# - Known width and height

def read_raw(filename, width, height):
    """
    Reads a simple .raw file and returns a 2D NumPy array.
    """
    with open(filename, "rb") as f:
        data = np.frombuffer(f.read(), dtype=np.uint8)
    image = data.reshape((height, width))
    return image


# ----------------------------
# Step 2: Simple Compression (Run-Length Encoding)
# ----------------------------
# If a pixel value repeats, we store:
# [pixel_value, repetition_count]
# instead of storing each pixel individually.

def compress_rle(image):
    """
    Compress image using basic run-length encoding (RLE).
    Returns a list of (value, count) pairs.
    """
    flat = image.flatten()
    compressed = []
    prev = flat[0]
    count = 1

    for pixel in flat[1:]:
        if pixel == prev and count < 255:  # Limit count to one byte
            count += 1
        else:
            compressed.append((prev, count))
            prev = pixel
            count = 1

    compressed.append((prev, count))  # append the last run
    return compressed


# ----------------------------
# Step 3: Save compressed data
# ----------------------------
def save_compressed(filename, compressed_data, width, height):
    """
    Save compressed RLE data to file.
    We also store width and height at the start for decompression.
    """
    with open(filename, "wb") as f:
        # Write width and height (4 bytes each)
        f.write(struct.pack("II", width, height))

        # Write RLE pairs: (pixel_value, count)
        for value, count in compressed_data:
            f.write(struct.pack("BB", value, count))


# ----------------------------
# Step 4: Decompress RLE file
# ----------------------------
def decompress_rle(filename):
    """
    Decompress an RLE file back to an image.
    """
    with open(filename, "rb") as f:
        width, height = struct.unpack("II", f.read(8))
        bytes_data = f.read()

    # Each pair is 2 bytes (value, count)
    pairs = [(bytes_data[i], bytes_data[i+1]) for i in range(0, len(bytes_data), 2)]

    pixels = []
    for value, count in pairs:
        pixels.extend([value] * count)

    image = np.array(pixels, dtype=np.uint8).reshape((height, width))
    return image


# ----------------------------
# Step 5: Main program logic
# ----------------------------
if __name__ == "__main__":
    # Example usage:
    width = 512
    height = 512
    input_file = "input.raw"
    compressed_file = "compressed.rle"
    output_file = "output.png"

    print("Reading raw image...")
    img = read_raw(input_file, width, height)

    print("Compressing...")
    compressed = compress_rle(img)
    save_compressed(compressed_file, compressed, width, height)
    print(f"Saved compressed file: {compressed_file}")

    print("Decompressing for test...")
    decompressed = decompress_rle(compressed_file)

    # Show original vs decompressed
    plt.subplot(1, 2, 1)
    plt.title("Original RAW")
    plt.imshow(img, cmap="gray")
    plt.axis("off")

    plt.subplot(1, 2, 2)
    plt.title("Decompressed")
    plt.imshow(decompressed, cmap="gray")
    plt.axis("off")

    plt.show()
