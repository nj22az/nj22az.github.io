#!/usr/bin/env python3
"""Guard white clothing and concave gaps when replacing the baked paper, plus the real pale-shoe regression."""
import io
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from camera_sticker_contours import contour

root = Path(__file__).resolve().parent.parent
im = Image.new('RGBA', (512, 512)); g = ImageDraw.Draw(im)
g.ellipse((210, 50, 302, 142), fill='#eab899', outline='#281e1e', width=5)
g.rounded_rectangle((180, 130, 332, 320), 20, fill='#526a94', outline='#281e1e', width=5)
g.rectangle((180, 285, 240, 460), fill='white', outline='#281e1e', width=5)
g.rectangle((272, 285, 332, 460), fill='white', outline='#281e1e', width=5)
paper = Image.new('RGBA', im.size, 'white'); paper.putalpha(im.getchannel('A').filter(ImageFilter.MaxFilter(65)))
paper.alpha_composite(im); out, _ = contour(paper); pixels = np.array(out)
assert pixels[400, 210].tolist() == [255, 255, 255, 255], 'white clothing survives'
assert pixels[400, 256, 3] < 32, 'concave leg gap stays open'
assert pixels[220, 350, 3] < 32, 'broad backing is gone'
assert pixels[220, 333, 3] > 200 and out.size == im.size, 'fine contour, unchanged canvas'

for file in ['thuan/stand.webp', 'thuan-blender/wave.webp']:
    raw = subprocess.check_output(['git', 'show', '87f47e8f:camera/stickers/' + file], cwd=root)
    original = Image.open(io.BytesIO(raw)).convert('RGBA'); recut, _ = contour(original)
    source, result = np.array(original), np.array(recut)
    # Shoes near the foot of each real sticker stay opaque and pale; paper elsewhere is not this assertion's target.
    foot = result[int(result.shape[0] * .86):]
    whites = (foot[:, :, :3].min(axis=2) > 220) & (foot[:, :, 3] > 240)
    assert whites.sum() > 3000, f'{file}: pale shoes were lost'
    assert original.size == recut.size
print('sticker contours: white clothing, real pale shoes, concave gaps and stable canvas pass')
