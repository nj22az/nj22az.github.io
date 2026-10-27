#!/usr/bin/env python3
"""Print a full-colour render as a rubber stamp, in the manner of World's Rubber stamp Look (solid inked darks with
grain, a speckle in the mid-tones, inked outlines, cream paper), for pictures that do not come from World, such as a
Pixar render of a resident from Blender.

  python3 tools/stamp-filter.py <render> <out.png> [--crop x0,y0,x1,y1] [--size 2400x1200]

--crop is in fractions of the render (as in minato-stamps.json). The output is burgundy on cream, the input that
tools/build-blog-stamps.py expects as <name>--stamp.png.
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

PAPER = np.array((252, 247, 231), float)
INK = np.array((125, 36, 51), float)


def stamp(img, size):
    img = ImageOps.fit(img.convert('RGB'), size, Image.LANCZOS)
    # Flatten the soft render shading first, as a stamp has no gradients: the median keeps the edges.
    flat = img.filter(ImageFilter.MedianFilter(7)).convert('L')
    g = np.asarray(flat, float) / 255
    rng = np.random.default_rng(88)
    # The rubber's grain: a fine speckle, slightly clumped, the same for every pixel of solid ink.
    grain = np.asarray(Image.fromarray((rng.random(g.shape[::-1][::-1]) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.7)), float) / 255
    solid = np.clip((0.36 - g) / 0.10, 0, 1)                       # the darks: hair, the shirt, the eyes
    mid = np.clip((0.62 - g) / 0.26, 0, 1) * (1 - solid)            # the mid-tones: a thin speckle, more where darker
    ink = solid * (0.80 + 0.20 * grain) + mid * (grain > 0.62) * 0.75
    # Outlines from the flattened picture: where its lightness changes sharply.
    sx = np.abs(np.diff(g, axis=1, prepend=g[:, :1]))
    sy = np.abs(np.diff(g, axis=0, prepend=g[:1, :]))
    edges = np.clip((np.hypot(sx, sy) - 0.024) / 0.045, 0, 1)
    edges = np.asarray(Image.fromarray((edges * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(.6)), float) / 255
    ink = np.clip(np.maximum(ink, edges * (0.75 + 0.25 * grain)), 0, 1)
    out = PAPER * (1 - ink[..., None]) + INK * ink[..., None]
    return Image.fromarray(out.astype(np.uint8))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('render', type=Path)
    parser.add_argument('out', type=Path)
    parser.add_argument('--crop')
    parser.add_argument('--size', default='2400x1200')
    args = parser.parse_args()
    img = Image.open(args.render)
    if args.crop:
        x0, y0, x1, y1 = (float(v) for v in args.crop.split(','))
        img = img.crop((round(x0 * img.width), round(y0 * img.height), round(x1 * img.width), round(y1 * img.height)))
    w, h = (int(v) for v in args.size.split('x'))
    stamp(img, (w, h)).save(args.out)
    print('stamped', args.out)
