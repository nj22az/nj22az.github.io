#!/usr/bin/env python3
"""Cuts a picture of a sticker sheet into Pocket Camera stickers (the owner, 12 November 2026: "You can make stickers of my
Johansson Assets too", "Here are more sticker sheets, can you make a function to add stickers easily?").

A sheet is many drawings on one plain ground: the owner's sailor in his poses, inked on white; a festival's things, each
already with its white edge, on cream. This finds every drawing, cuts it out and writes the sheet the camera loads:

    camera/stickers/<id>/<key>.webp        the sticker, up to 512 px on its longer side
    camera/stickers/<id>/<key>.thumb.webp  256 px
    camera/stickers/<id>.json              the sheet (id, name, tab, stickers)
    camera/stickers/sheets.json            the camera's list of its own sheets: the new one is added to it

Adding a sheet is two commands and no code:

    python3 tools/cut-sticker-sheet.py --new picture.png --id harbour --name Harbour --tab Harbour
        copies the picture to tools/sources/sticker-sheets/, writes the recipe harbour.json beside it (every piece
        numbered) and cuts it; --sheet out.png lays the pieces out with their numbers
    python3 tools/cut-sticker-sheet.py tools/sources/sticker-sheets/harbour.json
        cuts it again after the recipe was given names: per source, "stickers" is the pieces in reading order, each
        {"key": "wave", "gloss": "Waving"} or null to leave that piece out

A recipe: {id, name, tab, who?, kind?, when?: [months], deck?: true, sources: [{file, mode, join?, tolerance?, stickers}]}.
  mode "ink"   black line art on the ground with no edge of its own: the paper inside a closed outline is kept, the
               line is made firm again, and the piece is given the white die-cut edge every sticker has
  mode "edge"  coloured drawings with no edge worth keeping: their colours as they are, and the same white edge
  mode "cut"   drawings that already have their edge: cut where the ground begins
  ground       "border" (the colour of the picture's border), "border+white" (that and white: stickers whose own
               white edges touch are cut apart at their outlines; use it with mode "edge") or "pale" (anything
               light and grey: a chequered or shaded ground, white edges included; with mode "edge")
  whole        true: the whole picture is one sticker (a badge with lettering round it)
  join         how near two strokes must be to hang together, in thousandths of the picture's width (3; 0 for
               stickers that sit close on their sheet)
  marks        how near a small mark must be to a drawing to be cut with it (motion lines, a "zzz", a note, a puff
               of dust), in thousandths of the width (45; 0: every piece on its own)
  main         how large a piece must be to be a drawing and not a mark, as a share of the sheet's usual piece (.4)
  tolerance    how far a colour may be from the ground and still be ground (0-255; 14)

How it finds them: the ground is the colour of the picture's border; it is flooded in from the edges through everything
near that colour, after closing gaps a pen left open so the flood does not leak into a figure; what the flood cannot
reach is drawing. Enclosed paper (a white shirt inside a black outline) therefore stays.
"""
import argparse
import hashlib
import io
import json
import math
import multiprocessing
import os
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'camera' / 'stickers'
SOURCES = ROOT / 'tools' / 'sources' / 'sticker-sheets'
REGISTRY = OUT / 'sheets.json'
BASE = ['marks.json', 'halloween.json', 'pocket-faces.json']          # the sheets the camera had before the registry
LONG, THUMB = 512, 256


def webp(im, quality=82):
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=quality, method=6)
    return buf.getvalue()


def register(name):
    """Adds a sheet's file to the camera's list of its own sheets, once."""
    data = json.loads(REGISTRY.read_text()) if REGISTRY.exists() else {'sheets': list(BASE)}
    if name not in data['sheets']:
        data['sheets'].append(name)
    REGISTRY.write_text(json.dumps(data, indent=1) + '\n')


def grow(mask, r):
    """Everything within r pixels of the mask."""
    return ndimage.distance_transform_edt(~mask) <= r


def shrink(mask, r):
    return ndimage.distance_transform_edt(mask) > r


def closed(mask, r):
    """Gaps and creeks narrower than 2r filled in."""
    pad = int(r) + 2
    wide = np.pad(mask, pad)
    return shrink(grow(wide, r), r)[pad:-pad, pad:-pad]


def pieces(im, mode='ink', join=None, tolerance=14, ground='border', marks=45, main=.4, whole=False):
    """The drawings on a sheet, in reading order: [(box, number)], the picture numbered by drawing, and the ground."""
    rgba = np.asarray(im.convert('RGBA')).astype(np.int16)
    h, w = rgba.shape[:2]
    if (rgba[..., 3] < 8).mean() > .05:                                # a transparent sheet: the ground is what is clear
        near = rgba[..., 3] < 128
    elif ground == 'pale':                                             # a chequered or shaded pale ground: anything light and grey
        near = (rgba[..., :3].min(axis=2) >= 255 - tolerance * 4) & (rgba[..., :3].max(axis=2) - rgba[..., :3].min(axis=2) <= 14)
    else:
        border = np.concatenate([rgba[:3].reshape(-1, 4), rgba[-3:].reshape(-1, 4), rgba[:, :3].reshape(-1, 4), rgba[:, -3:].reshape(-1, 4)])
        near = np.abs(rgba[..., :3] - np.median(border[:, :3], axis=0)).max(axis=2) <= tolerance
        if ground == 'border+white':                                   # and the sheet's own white edges go with it
            near |= (rgba[..., :3].min(axis=2) >= 232) & (rgba[..., :3].max(axis=2) - rgba[..., :3].min(axis=2) <= 16)
    # Flood from the edges through the ground, with small gaps in an outline closed first.
    gap = 2
    tight = ndimage.binary_erosion(near, iterations=gap, border_value=1)
    labels, _ = ndimage.label(tight)
    edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    outside = np.isin(labels, edge[edge > 0])
    outside = ndimage.binary_dilation(outside, iterations=gap + 1, mask=near)
    drawing = ~outside
    # Each drawing is what hangs together. A small mark near a drawing (motion lines, a "zzz", a note, a puff of dust)
    # belongs to it: marks are handed out nearest first, so a row of z's follows its sleeper and not the neighbour.
    reach = w * (join if join is not None else 3) / 1000
    parts, count = ndimage.label(np.ones_like(drawing) if whole else grow(drawing, reach) if reach >= 1 else drawing)
    parts[~drawing] = 0
    areas = ndimage.sum_labels(drawing, parts, index=np.arange(1, count + 1))
    boxes = ndimage.find_objects(parts)
    large = areas[areas >= w * h * .0012]
    whole = (np.median(large) if len(large) else 0) * main
    owner = {n: n for n in range(1, count + 1) if areas[n - 1] >= max(whole, w * h * .0003)}
    loose = [n for n in range(1, count + 1) if n not in owner and areas[n - 1] >= w * h * .00004]
    for limit in (w * marks * .4 / 1000, w * marks / 1000):
        moved = bool(owner) and marks > 0
        while moved and loose:
            moved = False
            lookup = np.zeros(count + 1, np.int32)
            for n, o in owner.items():
                lookup[n] = o
            taken = lookup[parts]
            far, index = ndimage.distance_transform_edt(taken == 0, return_indices=True)
            for n in list(loose):
                box = boxes[n - 1]
                dist = np.where(parts[box] == n, far[box], np.inf)
                at = np.unravel_index(np.argmin(dist), dist.shape)
                if dist[at] <= limit:
                    owner[n] = taken[index[0][box][at], index[1][box][at]]
                    loose.remove(n)
                    moved = True
    for n in loose:                                                     # far from everything: a small drawing of its own
        if areas[n - 1] >= w * h * .0003:
            owner[n] = n
    lookup = np.zeros(count + 1, np.int32)
    for n, o in owner.items():
        lookup[n] = o
    groups = lookup[parts]
    found = []
    for n in sorted(set(owner.values())):
        ys, xs = np.nonzero(groups == n)
        found.append(((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1), n))
    # Reading order: rows from the top, each from the left.
    found.sort(key=lambda f: (f[0][1] + f[0][3]) / 2)
    rows, tall = [], np.median([f[0][3] - f[0][1] for f in found]) if found else 0
    for f in found:
        mid = (f[0][1] + f[0][3]) / 2
        if rows and abs(mid - np.mean([(g[0][1] + g[0][3]) / 2 for g in rows[-1]])) < tall * .5:
            rows[-1].append(f)
        else:
            rows.append([f])
    ordered = [f for row in rows for f in sorted(row, key=lambda f: f[0][0])]
    return ordered, groups, outside


def cut(im, box, number, groups, outside, mode):
    """One sticker: the drawing with its edge, clear outside it."""
    x0, y0, x1, y1 = (int(v) for v in box)
    size = max(x1 - x0, y1 - y0)
    pad = round(size * .09) + 4
    w, h = im.size
    k = 3 if size * 3 <= 1500 else 2 if size * 2 <= 1500 else 1                      # worked on larger, so edges stay smooth
    # The piece with room round it for its edge, even at the picture's side.
    rgb = Image.new('RGB', (x1 - x0 + 2 * pad, y1 - y0 + 2 * pad), (255, 255, 255))
    sx0, sy0, sx1, sy1 = max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)
    ox, oy = sx0 - (x0 - pad), sy0 - (y0 - pad)
    rgb.paste(im.convert('RGB').crop((sx0, sy0, sx1, sy1)), (ox, oy))
    part = np.zeros((rgb.height, rgb.width), bool)
    part[oy:oy + sy1 - sy0, ox:ox + sx1 - sx0] = groups[sy0:sy1, sx0:sx1] == number
    ground = np.ones((rgb.height, rgb.width), bool)
    ground[oy:oy + sy1 - sy0, ox:ox + sx1 - sx0] = outside[sy0:sy1, sx0:sx1]
    big = rgb.resize((rgb.width * k, rgb.height * k), Image.LANCZOS)
    up = lambda m: np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize(big.size, Image.BILINEAR).filter(ImageFilter.GaussianBlur(k * .6))) > 127
    part_k, ground_k = up(part), up(ground)
    art = np.asarray(big).astype(np.float32)
    if mode == 'ink':
        # Black line on white paper: the picture's soft edge made firm again.
        grey = np.asarray(big.convert('L')).astype(np.float32) / 255
        firm = np.clip((grey - .36) / .3, 0, 1)
        firm = firm * firm * (3 - 2 * firm)
        art = np.repeat((firm * 255)[..., None], 3, axis=2)
    if mode in ('ink', 'edge'):
        # Its own die-cut edge: clean paper round the drawing and between its marks.
        art[~part_k] = 255
        edge = max(2, round(size * k * .028))
        paper = ndimage.binary_fill_holes(closed(grow(part_k, edge), edge))
    else:
        paper = ndimage.binary_fill_holes(part_k)
    alpha = Image.fromarray((paper * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(k * .75))
    out = Image.fromarray(art.clip(0, 255).astype(np.uint8)).convert('RGBA')
    out.putalpha(alpha)
    out = out.crop(alpha.point(lambda v: 255 if v > 8 else 0).getbbox())
    if mode != 'ink':
        out = out.filter(ImageFilter.UnsharpMask(radius=k * 1.2, percent=60, threshold=2))
    limit = min(LONG, round(size * 2.6))                                          # a small drawing is not blown up past its detail
    if max(out.size) > limit:
        out.thumbnail((limit, limit), Image.LANCZOS)
    return out


SHEET = None


def cut_one(piece):
    im, groups, outside, mode = SHEET
    return cut(im, piece[0], piece[1], groups, outside, mode)


def build(recipe_path, preview=None):
    recipe = json.loads(Path(recipe_path).read_text())
    sid = recipe['id']
    (OUT / sid).mkdir(parents=True, exist_ok=True)
    wanted, entries, shown = set(), [], []
    for source in recipe['sources']:
        im = Image.open(Path(recipe_path).parent / source['file'])
        mode = source.get('mode', 'ink')
        found, groups, outside = pieces(im, mode, source.get('join'), source.get('tolerance', 14), source.get('ground', 'border'),
                                        source.get('marks', 45), source.get('main', .4), source.get('whole', False))
        global SHEET
        SHEET = (im, groups, outside, mode)
        with multiprocessing.get_context('fork').Pool(min(8, os.cpu_count() or 2)) as pool:      # each piece on its own core
            stickers = pool.map(cut_one, found)
        names = source.get('stickers') or []
        if names and len(names) != len(found):
            print(f"  {source['file']}: the recipe names {len(names)} pieces, the picture has {len(found)}", file=sys.stderr)
        for n, sticker in enumerate(stickers):
            named = names[n] if n < len(names) else {'key': f"{Path(source['file']).stem}-{n + 1:02d}", 'gloss': ''}
            shown.append((sticker, '' if not names else (named or {}).get('key', '—'), named is None))
            if named is None:
                continue
            key = named['key']
            small = sticker.copy()
            small.thumbnail((THUMB, THUMB), Image.LANCZOS)
            data = webp(sticker)
            (OUT / sid / f'{key}.webp').write_bytes(data)
            (OUT / sid / f'{key}.thumb.webp').write_bytes(webp(small))
            wanted |= {f'{key}.webp', f'{key}.thumb.webp'}
            stamp = hashlib.sha256(data).hexdigest()[:8]
            entries.append({'id': f'{sid}/{key}', 'src': f'{sid}/{key}.webp?v={stamp}', 'thumb': f'{sid}/{key}.thumb.webp?v={stamp}',
                            'width': sticker.width, 'height': sticker.height, 'line': named.get('line', ''), 'gloss': named.get('gloss', '')})
    for old in (OUT / sid).glob('*.webp'):                                        # a piece renamed or left out
        if old.name not in wanted:
            old.unlink()
    sheet = {'id': sid, 'name': recipe['name'], 'tab': recipe.get('tab', recipe['name']), 'who': recipe.get('who', '')}
    for field in ('kind', 'when', 'deck', 'note'):
        if field in recipe:
            sheet[field] = recipe[field]
    sheet['source'] = f"tools/cut-sticker-sheet.py {Path(recipe_path).resolve().relative_to(ROOT)}"
    sheet['stickers'] = entries
    (OUT / f'{sid}.json').write_text(json.dumps(sheet, indent=1, ensure_ascii=False) + '\n')
    register(f'{sid}.json')
    print(f'{len(entries)} stickers → camera/stickers/{sid}/ and {sid}.json')
    if preview:
        cols, cell = 8, 170
        rows = math.ceil(len(shown) / cols)
        page = Image.new('RGB', (cols * cell, rows * cell), (92, 128, 150))
        draw = ImageDraw.Draw(page)
        for n, (im, label, skipped) in enumerate(shown):
            t = im.copy()
            t.thumbnail((cell - 26, cell - 34), Image.LANCZOS)
            x, y = (n % cols) * cell, (n // cols) * cell
            page.paste(t, (x + (cell - t.width) // 2, y + 6 + (cell - 34 - t.height) // 2), t)
            draw.text((x + 6, y + cell - 16), f'{n + 1} {label}' + (' (left out)' if skipped else ''), fill=(255, 255, 255))
        page.save(preview)


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('recipe', nargs='?', help='a recipe in tools/sources/sticker-sheets/')
    ap.add_argument('--new', nargs='+', metavar='PICTURE', help='start a recipe from one or more pictures of sheets')
    ap.add_argument('--id')
    ap.add_argument('--name')
    ap.add_argument('--tab')
    ap.add_argument('--who', default='')
    ap.add_argument('--mode', default='ink', choices=['ink', 'edge', 'cut'])
    ap.add_argument('--sheet', help='write a numbered picture of the pieces here')
    args = ap.parse_args()
    if args.new:
        if not (args.id and args.name):
            ap.error('--new needs --id and --name')
        SOURCES.mkdir(parents=True, exist_ok=True)
        sources = []
        for n, picture in enumerate(args.new, 1):
            kept = SOURCES / f"{args.id}{'-' + str(n) if len(args.new) > 1 else ''}{Path(picture).suffix.lower()}"
            if Path(picture).resolve() != kept.resolve():
                shutil.copyfile(picture, kept)
            sources.append({'file': kept.name, 'mode': args.mode})
        args.recipe = SOURCES / f'{args.id}.json'
        Path(args.recipe).write_text(json.dumps({'id': args.id, 'name': args.name, 'tab': args.tab or args.name, 'who': args.who, 'sources': sources}, indent=1, ensure_ascii=False) + '\n')
    if not args.recipe:
        ap.error('give a recipe, or --new with pictures')
    build(args.recipe, args.sheet)
