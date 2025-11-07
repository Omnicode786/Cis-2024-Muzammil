import rawpy
import numpy as np

with rawpy.imread(r'CEP\raw.dng') as raw:
    rgb = raw.postprocess()

# Make sure it's uint8
rgb = np.clip(rgb, 0, 255).astype(np.uint8)

# Write raw bytes (no headers)
rgb.tofile('color_input.raw')
