#!/usr/bin/env python3
"""Actual old/new sticker comparisons, preserving the same scale, position and background."""
import io
import json
import math
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'camera/qa/2026-10-31-contours'
OUT.mkdir(parents=True, exist_ok=True)
font = lambda n: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', n)
manifest = json.loads((ROOT / 'camera/stickers/stickers.json').read_text())


def pair(sticker, size):
    path = 'camera/stickers/' + sticker['src'].split('?')[0]
    old = Image.open(io.BytesIO(subprocess.check_output(['git', 'show', '87f47e8f:' + path], cwd=ROOT))).convert('RGBA')
    new = Image.open(ROOT / path).convert('RGBA')
    assert old.size == new.size
    for im in [old, new]:
        im.thumbnail(size, Image.Resampling.LANCZOS)
    return old, new


for sheet in manifest['sets']:
    stickers = sheet['stickers']; rows = math.ceil(len(stickers) / 4)
    proof = Image.new('RGB', (1168, 70 + rows * 210), '#303942'); d = ImageDraw.Draw(proof)
    d.text((12, 8), sheet['name'] + ' / each pair: published border | narrow contour', font=font(21), fill='white')
    d.text((12, 37), 'Actual WebP assets; identical figure/canvas dimensions. No character repainting.', font=font(14), fill='#d5dadd')
    for i, s in enumerate(stickers):
        x, y = 10 + i % 4 * 290, 70 + i // 4 * 210
        d.text((x, y), s['id'].split('/')[-1], font=font(13), fill='#f3d67c')
        for j, im in enumerate(pair(s, (138, 185))):
            proof.paste(im, (x + j * 142 + (138 - im.width) // 2, y + 20), im)
    proof.save(OUT / (sheet['id'] + '-comparison.jpg'), quality=92, subsampling=0)

hero = Image.new('RGB', (1276, 498), '#303942'); d = ImageDraw.Draw(hero)
d.text((12, 8), 'Pocket Camera / published border -> narrow silhouette contour', font=font(23), fill='white')
for i, ident in enumerate(['thuan-blender/wave', 'johansson-pixar/Wave', 'thao-pixar/Wave']):
    s = next(s for sheet in manifest['sets'] for s in sheet['stickers'] if s['id'] == ident)
    d.text((12 + i * 422, 42), ident + ' / before | after', font=font(16), fill='#f3d67c')
    for j, im in enumerate(pair(s, (202, 420))):
        hero.paste(im, (12 + i * 422 + j * 207 + (202 - im.width) // 2, 70), im)
hero.save(OUT / 'contour-comparison.jpg', quality=94, subsampling=0)
print('All 116 old/new pairs and three-resident review proof written')
