#!/usr/bin/env python3
"""Pocket Camera's Johansson World wordmark and brand type, from the World's own typeface.

The World's title screen (johansson-town/title-screen.css) sets JOHANSSON and WORLD in LINE Seed JP ExtraBold: 28 px
with .035em between the letters, in the title's ink, over 24 px with .18em, in its green, 4 px apart. The camera's title
card draws exactly that, as outlines (no font to load, the same on every device), and the camera's own brand words
(the lockup, "Pocket Camera", the Game Room's heading) are set in the same face, cut down to the Latin they need.

    python3 tools/draw-camera-wordmark.py <fontsource line-seed-jp package dir>

where the directory is `@fontsource/line-seed-jp` unpacked (`npm pack @fontsource/line-seed-jp`, then its `package/`).
Needs fontTools, brotli and uharfbuzz (asset preparation only; nothing here ships to the browser). Writes:

  camera/brand/world-wordmark.svg      the wordmark alone, for the share card, the docs and a look
  camera/brand/wordmark.json           the outlines and their boxes, which tools/apply-camera-wordmark.mjs sets into
                                       camera/index.html between its wordmark markers
  camera/fonts/line-seed-jp-latin-700.woff2, -800.woff2   Basic Latin and the few marks the brand words use
  camera/fonts/OFL-LINESeedJP.txt      the typeface's licence (SIL OFL 1.1)

History: on 9 November 2026 the first title card drew a yellow, red and green toy wordmark from landing.css rules that
title-screen.css had long overridden, and the owner said the landing page "doesn't look quite right". Read the World's
drawn title, not one of its stylesheets, before copying its look.
"""
import io
import json
import shutil
import sys
from pathlib import Path

import uharfbuzz as hb
from fontTools import subset
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
CAMERA = ROOT / 'camera'
# The World's title, in its own numbers (title-screen.css on a phone).
MAIN = {'text': 'JOHANSSON', 'size': 28, 'spacing': .035, 'line': 1.12}
TOWN = {'text': 'WORLD', 'size': 24, 'spacing': .18, 'line': 1.1}
GAP = 4
KANA = {'text': 'ポケットカメラ', 'spacing': .14}
# What the brand's own words are written with: Basic Latin, the middle dot, the arrow of "Visit the World ›", quotes.
LATIN = ''.join(chr(c) for c in range(0x20, 0x7f)) + ' ·–’“”›…'


def sfnt(path):
    """A font file as plain OpenType bytes (HarfBuzz does not read WOFF2) and as a fontTools font."""
    font = TTFont(path)
    font.flavor = None
    data = io.BytesIO()
    font.save(data)
    return data.getvalue(), TTFont(io.BytesIO(data.getvalue()))


def run(path, text, size, spacing):
    """One line of text shaped (kerning as a browser applies it) at `size` units to the em: its glyphs with their
    pen positions, its advance width, its ink bounds (baseline at y = 0, y growing downwards) and the font."""
    data, font = sfnt(path)
    shaper = hb.Font(hb.Face(data))
    buffer = hb.Buffer()
    buffer.add_str(text)
    buffer.guess_segment_properties()
    hb.shape(shaper, buffer, {'kern': True, 'liga': False})
    glyphs = font.getGlyphSet()
    scale = size / font['head'].unitsPerEm
    placed, bounds, x = [], BoundsPen(glyphs), 0.0
    for index, (info, pos) in enumerate(zip(buffer.glyph_infos, buffer.glyph_positions)):
        name = font.getGlyphName(info.codepoint)
        at = (x + pos.x_offset * scale, -pos.y_offset * scale)
        placed.append((name, at))
        glyphs[name].draw(TransformPen(bounds, (scale, 0, 0, -scale, at[0], at[1])))
        x += pos.x_advance * scale
        if index < len(text) - 1:
            x += spacing * size
    return {'glyphs': glyphs, 'placed': placed, 'scale': scale, 'width': x, 'bounds': bounds.bounds, 'font': font}


def outline(line, dx, dy):
    """The line's path data with its origin moved to (dx, dy)."""
    pen = SVGPathPen(line['glyphs'], ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
    for name, (x, y) in line['placed']:
        line['glyphs'][name].draw(TransformPen(pen, (line['scale'], 0, 0, -line['scale'], x + dx, y + dy)))
    return pen.getCommands()


def fmt(value):
    return ('%.2f' % value).rstrip('0').rstrip('.')


def wordmark(package):
    source = package / 'files' / 'line-seed-jp-latin-800-normal.woff2'
    main, town = run(source, MAIN['text'], MAIN['size'], MAIN['spacing']), run(source, TOWN['text'], TOWN['size'], TOWN['spacing'])
    font = main['font']
    ascent = font['hhea'].ascent / font['head'].unitsPerEm
    content = (font['hhea'].ascent - font['hhea'].descent) / font['head'].unitsPerEm
    # The two line boxes as CSS lays them: half the leading above each line's content area, then the ascent.
    base1 = ((MAIN['line'] - content) / 2 + ascent) * MAIN['size']
    base2 = MAIN['line'] * MAIN['size'] + GAP + ((TOWN['line'] - content) / 2 + ascent) * TOWN['size']
    width = max(main['width'], town['width'])
    top = base1 + main['bounds'][1]      # the ink's top; bounds are [x0, y0, x1, y1] with y growing downwards
    bottom = base2 + town['bounds'][3]
    pad = 1
    box = (width + 2 * pad, bottom - top + 2 * pad)
    return {'viewBox': f'0 0 {fmt(box[0])} {fmt(box[1])}', 'width': round(box[0], 2), 'height': round(box[1], 2),
            'main': outline(main, (width - main['width']) / 2 + pad, base1 - top + pad),
            'town': outline(town, (width - town['width']) / 2 + pad, base2 - top + pad),
            'mainWidth': round(main['width'], 2), 'townWidth': round(town['width'], 2)}


def kana(package):
    line = run(package / 'files' / 'line-seed-jp-119-700-normal.woff2', KANA['text'], 100, KANA['spacing'])
    b, pad = line['bounds'], 2
    box = (b[2] - b[0] + 2 * pad, b[3] - b[1] + 2 * pad)
    return {'viewBox': f'0 0 {fmt(box[0])} {fmt(box[1])}', 'width': round(box[0], 2), 'height': round(box[1], 2), 'd': outline(line, -b[0] + pad, -b[1] + pad)}


def latin(package, weight):
    source = package / 'files' / f'line-seed-jp-latin-{weight}-normal.woff2'
    font = TTFont(source)
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['kern']
    options.hinting = False
    options.desubroutinize = True
    options.name_IDs = [1, 2, 4, 6]
    cutter = subset.Subsetter(options)
    cutter.populate(text=LATIN)
    cutter.subset(font)
    out = CAMERA / 'fonts' / f'line-seed-jp-latin-{weight}.woff2'
    font.flavor = 'woff2'
    font.save(out)
    return out


def main(package):
    package = Path(package)
    if not (package / 'files' / 'line-seed-jp-latin-800-normal.woff2').exists():
        sys.exit(f'{package} is not the unpacked @fontsource/line-seed-jp package')
    (CAMERA / 'brand').mkdir(exist_ok=True)
    mark, stamp = wordmark(package), kana(package)
    data = {'source': 'LINE Seed JP ExtraBold and Bold (SIL OFL 1.1), from @fontsource/line-seed-jp ' + json.loads((package / 'package.json').read_text())['version'],
            'setting': {'main': MAIN, 'town': TOWN, 'gap': GAP, 'kana': KANA}, 'wordmark': mark, 'kana': stamp}
    (CAMERA / 'brand' / 'wordmark.json').write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{mark["viewBox"]}" role="img" aria-label="Johansson World">'
           f'<path fill="#263d39" d="{mark["main"]}"/><path fill="#16815e" d="{mark["town"]}"/></svg>\n')
    (CAMERA / 'brand' / 'world-wordmark.svg').write_text(svg, encoding='utf-8')
    for weight in (700, 800):
        out = latin(package, weight)
        print(out.relative_to(ROOT), out.stat().st_size, 'bytes')
    shutil.copyfile(package / 'LICENSE', CAMERA / 'fonts' / 'OFL-LINESeedJP.txt')
    print('wordmark', mark['viewBox'], len(mark['main']) + len(mark['town']), 'bytes of outline; kana', stamp['viewBox'], len(stamp['d']), 'bytes')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
