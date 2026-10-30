#!/usr/bin/env python3
"""Our own 32³ creative RGB grades. PNG strips: x=blue*32+red, y=green; no third-party film/LUT data."""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image

SIZE = 32


def grade(rgb, name):
    c = rgb.copy()
    l = np.sum(c * np.array([.2126, .7152, .0722]), axis=-1, keepdims=True)
    if name == 'warm-slide':
        c = c * .72 + (c * c * (3 - 2 * c)) * .28
        c = l + (c - l) * 1.08
        c += c * (1 - c) * np.concatenate([.10 * l, .015 * l, -.07 * l + .025 * (1 - l)], axis=-1)
    elif name == 'soft-negative':
        c = .025 + .945 * np.power(c, .96)
        c = np.sum(c * np.array([.2126, .7152, .0722]), axis=-1, keepdims=True) * .07 + c * .93
        c += c * (1 - c) * np.array([.025, .012, -.025])
    elif name != 'identity':
        raise ValueError(name)
    return np.clip(c, 0, 1)


def build(out):
    out.mkdir(parents=True, exist_ok=True)
    b, g, r = np.meshgrid(*(np.linspace(0, 1, SIZE),) * 3, indexing='ij')
    rgb = np.stack([r, g, b], axis=-1)
    for name in ('warm-slide', 'soft-negative', 'identity'):
        pixels = np.round(grade(rgb, name) * 255).astype('uint8')
        strip = pixels.transpose(1, 0, 2, 3).reshape(SIZE, SIZE * SIZE, 3)
        Image.fromarray(strip).save(out / f'{name}.png', optimize=True)
    (out / 'manifest.json').write_text(json.dumps({'size': SIZE, 'layout': 'x=blue*32+red,y=green',
        'space': 'creative display RGB; not a measured film-stock emulation',
        'grades': ['warm-slide', 'soft-negative'], 'identity': 'test reference'}, indent=2) + '\n')


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out', type=Path, default=Path(__file__).resolve().parent.parent / 'camera/luts')
    build(p.parse_args().out)
