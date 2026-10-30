#!/usr/bin/env python3
"""Recut the studio's baked paper surround into a thin silhouette contour.

Requires Pillow, NumPy and SciPy (asset preparation only, never shipped to the browser).
python3 tools/camera_sticker_contours.py --baseline-ref 87f47e8f
The pinned baseline prevents repeated runs from accumulating a new border or WebP loss.
"""
import argparse
import io
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import binary_propagation, distance_transform_edt, label

STYLE_ID = '20261031-contour1'
ROOT = Path(__file__).resolve().parent.parent


def save_webp(image, path):
    """Encode and validate before replacing a served asset; never expose a partly written WebP."""
    buffer = io.BytesIO()
    image.save(buffer, 'WEBP', lossless=True, method=4)
    data = buffer.getvalue()
    with Image.open(io.BytesIO(data)) as check:
        check.load()
        if check.size != image.size:
            raise ValueError('encoded sticker dimensions changed')
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_bytes(data)
    temporary.replace(path)


def contour(image):
    """Remove only background-connected paper/cut/shadow; enclosed whites remain part of the subject.

    The studio ink around the figure is the barrier. Do not globally key white pixels: shirts, teeth and shoes
    must survive. Euclidean distance gives rounded contours instead of the old square maximum-filter shoulders.
    Keep the canvas and figure position unchanged so an existing placed sticker does not move or change size.
    """
    rgba = np.array(image.convert('RGBA'))
    rgb, alpha = rgba[:, :, :3].astype(np.int16), rgba[:, :, 3]
    lo, hi = rgb.min(axis=2), rgb.max(axis=2)
    # WebP ringing at the old white/grey join is warm cream, not pure white. Include that paper edge in the flood.
    paper = (lo >= 200) & (hi - lo < 45)
    # The studio cut line has this fixed colour. A broad grey key would also remove pale shoe soles and open the
    # flood into white shoes, so match the cut stock specifically and discard its detached compression fragments.
    cut = np.max(np.abs(rgb - [178, 170, 160]), axis=2) < 12
    air = (alpha < 240) | paper | cut
    seed = alpha < 16
    seed[0, :] |= air[0, :]; seed[-1, :] |= air[-1, :]
    seed[:, 0] |= air[:, 0]; seed[:, -1] |= air[:, -1]
    outside = binary_propagation(seed, mask=air)
    subject_alpha = np.where(outside, 0, alpha).astype(np.uint8)
    solid = subject_alpha >= 128
    if not solid.any():
        raise ValueError('no enclosed subject found; refusing to replace the sticker')
    components, _ = label(solid)
    areas = np.bincount(components.ravel())
    identity = solid & ((hi < 110) | (hi - lo > 55))
    pigment = np.bincount(components.ravel(), weights=identity.ravel(), minlength=len(areas))
    keep = pigment >= np.maximum(2, areas * .015)
    keep[0] = False
    keep[1 + np.argmax(areas[1:])] = True
    subject_alpha[~keep[components]] = 0
    solid = subject_alpha >= 128
    radius = max(1.0, max(image.size) * .0045)
    distance = distance_transform_edt(~solid)
    rim = np.clip(radius + .5 - distance, 0, 1)
    rim_alpha = Image.fromarray(np.uint8(rim * 255))
    paper_layer = Image.new('RGBA', image.size, (255, 255, 255, 255)); paper_layer.putalpha(rim_alpha)
    body = Image.fromarray(rgba); body.putalpha(Image.fromarray(subject_alpha))
    result = Image.new('RGBA', image.size)
    # A quiet contact shadow, with no second grey cut line or broad shadow slab.
    shadow = Image.new('RGBA', image.size, (0, 0, 0, 255))
    shadow.putalpha(rim_alpha.filter(ImageFilter.GaussianBlur(max(1, radius * .35))).point(lambda v: round(v * .14)))
    result.alpha_composite(shadow); result.alpha_composite(paper_layer); result.alpha_composite(body)
    return result, {'radius': radius, 'removed': int(outside.sum()), 'subject_pixels': int(solid.sum())}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--baseline-ref', required=True)
    args = parser.parse_args()
    read = lambda path: subprocess.check_output(['git', 'show', f'{args.baseline_ref}:{path}'], cwd=ROOT)
    manifest_path = 'camera/stickers/stickers.json'
    manifest = json.loads(read(manifest_path))
    manifest['contour'] = STYLE_ID
    def recut_sticker(sticker):
        src = sticker['src'].split('?')[0]
        image = Image.open(io.BytesIO(read('camera/stickers/' + src))).convert('RGBA')
        recut, metrics = contour(image)
        out = ROOT / 'camera/stickers' / src
        save_webp(recut, out)
        thumb = recut.copy(); thumb.thumbnail((256, 256), Image.Resampling.LANCZOS)
        thumb_path = sticker['thumb'].split('?')[0]
        save_webp(thumb, ROOT / 'camera/stickers' / thumb_path)
        for key in ['src', 'thumb']:
            sticker[key] = sticker[key].split('?')[0] + '?v=' + STYLE_ID
        assert list(image.size) == [sticker['width'], sticker['height']]
        return {'id': sticker['id'], **metrics}
    stickers = [sticker for sheet in manifest['sets'] for sticker in sheet['stickers']]
    report = [recut_sticker(sticker) for sticker in stickers]
    (ROOT / manifest_path).write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n')
    out = ROOT / 'camera/qa/2026-10-31-contours'; out.mkdir(parents=True, exist_ok=True)
    (out / 'recut.json').write_text(json.dumps(report, indent=2) + '\n')
    print(f'{len(report)} resident stickers and thumbnails recut; figure/canvas dimensions retained')


if __name__ == '__main__':
    main()
