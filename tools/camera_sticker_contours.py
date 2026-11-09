#!/usr/bin/env python3
"""Recut the studio's baked paper surround into a thin silhouette contour.

Requires Pillow, NumPy and SciPy (asset preparation only, never shipped to the browser).
    python3 tools/camera_sticker_contours.py                      # every set, from the files as they are on disk
    python3 tools/camera_sticker_contours.py --sets thuan-pixar,thuan-nils
    python3 tools/camera_sticker_contours.py --baseline-ref <ref>   # from the files at a git ref instead
A sticker that already carries the camera's contour and shadow recuts to the same contour (its rim is paper, its shadow
is air, both flooded from outside before the rim is drawn again at the same radius), so a run does not accumulate a
border; WebP is lossless. build-camera-stickers.py uses `contour` and `shrink` on the studio's plain cuts.
"""
import argparse
import io
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import binary_dilation, binary_propagation, distance_transform_edt, label

STYLE_ID = '20261109-contour2'
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


def shrink(image, side):
    """The image within `side` pixels, resampled with its alpha premultiplied, so the colour of see-through pixels
    (grey or white in the file) does not bleed into the edge: Pillow resamples straight RGBA and leaves a fringe."""
    image = image.convert('RGBA')
    k = min(1, side / max(image.size))
    if k >= 1:
        return image.copy()
    size = (max(1, round(image.width * k)), max(1, round(image.height * k)))
    rgba = np.array(image).astype(np.float32) / 255
    pre = rgba.copy(); pre[:, :, :3] *= rgba[:, :, 3:4]
    small = np.array(Image.fromarray(np.uint8(np.round(pre * 255)), 'RGBA').resize(size, Image.LANCZOS)).astype(np.float32) / 255
    alpha = small[:, :, 3:4]
    colour = np.where(alpha > 0, small[:, :, :3] / np.maximum(alpha, 1e-6), 0)
    out = np.concatenate([np.clip(colour, 0, 1), alpha], axis=2)
    return Image.fromarray(np.uint8(np.round(out * 255)), 'RGBA')


def enclosed_paper(rgb, alpha, outside, lo, hi):
    """Paper the rim flood cannot reach: between two legs, under an arm akimbo, inside a crooked elbow (the owner,
    9 November 2026: "Johansson's legs are not cut out right", "big patches are white"). The studio's paper is pure
    white and lies against the figure's ink all round; a shirt's white flowers, an undershirt, teeth and shoes are
    shaded and lie against cloth and skin. A patch is paper when nearly all of it is pure white and most of its
    boundary is ink."""
    white = (lo >= 200) & (hi - lo < 45) & (alpha >= 240) & ~outside
    components, count = label(white)
    if not count:
        return np.zeros_like(outside)
    pure = (lo >= 252) & (hi - lo <= 3)
    ink = hi < 110
    areas = np.bincount(components.ravel(), minlength=count + 1)
    pure_share = np.bincount(components.ravel(), weights=pure.ravel(), minlength=count + 1) / np.maximum(areas, 1)
    paper = np.zeros_like(outside)
    for index in np.nonzero((areas >= 60) & (pure_share >= .9))[0]:
        if index == 0:
            continue
        patch = components == index
        boundary = binary_dilation(patch, iterations=2) & ~patch
        if boundary.any() and ink[boundary].mean() >= .5:
            paper |= patch
    return paper


def contour(image):
    """Remove background-connected paper/cut/shadow and the pure paper the figure encloses; the figure's own whites
    remain part of the subject.

    The studio ink around the figure is the barrier. Do not globally key white pixels: shirts, teeth and shoes
    must survive (enclosed_paper tells the studio's flat paper from them). Euclidean distance gives rounded contours
    instead of the old square maximum-filter shoulders. Keep the canvas and figure position unchanged so an existing
    placed sticker does not move or change size.
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
    enclosed = enclosed_paper(rgb, alpha, outside, lo, hi)
    outside |= enclosed
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
    return result, {'radius': radius, 'removed': int(outside.sum()), 'enclosed_paper': int(enclosed.sum()), 'subject_pixels': int(solid.sum())}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--baseline-ref', help='read the stickers at this git ref instead of the working tree')
    parser.add_argument('--sets', help='comma-separated set ids to recut (default: every set)')
    parser.add_argument('--report', default='camera/qa/2026-11-09-stickers/recut.json')
    args = parser.parse_args()
    if args.baseline_ref:
        read = lambda path: subprocess.check_output(['git', 'show', f'{args.baseline_ref}:{path}'], cwd=ROOT)
    else:
        read = lambda path: (ROOT / path).read_bytes()
    manifest_path = 'camera/stickers/stickers.json'
    manifest = json.loads(read(manifest_path))
    manifest['contour'] = STYLE_ID
    wanted = set(args.sets.split(',')) if args.sets else None
    def recut_sticker(sticker):
        src = sticker['src'].split('?')[0]
        image = Image.open(io.BytesIO(read('camera/stickers/' + src))).convert('RGBA')
        recut, metrics = contour(image)
        out = ROOT / 'camera/stickers' / src
        save_webp(recut, out)
        thumb_path = sticker['thumb'].split('?')[0]
        save_webp(shrink(recut, 256), ROOT / 'camera/stickers' / thumb_path)
        for key in ['src', 'thumb']:
            stamp = sticker[key].split('?')[1] if '?' in sticker[key] else ''
            commit = stamp.split('v=')[1].split('-')[0] if '-' in stamp else ''
            sticker[key] = sticker[key].split('?')[0] + '?v=' + (f'{commit}-{STYLE_ID}' if commit and not commit.startswith('2026') else STYLE_ID)
        assert list(image.size) == [sticker['width'], sticker['height']]
        return {'id': sticker['id'], **metrics}
    stickers = [sticker for sheet in manifest['sets'] if wanted is None or sheet['id'] in wanted for sticker in sheet['stickers']]
    report = [recut_sticker(sticker) for sticker in stickers]
    (ROOT / manifest_path).write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n')
    out = ROOT / args.report; out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, indent=2) + '\n')
    print(f'{len(report)} resident stickers and thumbnails recut; figure/canvas dimensions retained')


if __name__ == '__main__':
    main()
