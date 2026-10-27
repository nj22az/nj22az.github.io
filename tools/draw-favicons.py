#!/usr/bin/env python3
"""Draw the site's favicons as 16×16 pixel icons and write their SVG and PNG files.

Three icons, one grid each, so they stay crisp at tab size:
  office  The Office of Nils Johansson: NJ on the seal's teal.
  hotels  Hotels & Parking: a bed on free-parking green.
  world   Johansson World: house, sun and sea on the island's navy.

Run: python3 tools/draw-favicons.py [--preview out.png]
"""
import argparse
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
GRID = 16

# Letters are palette keys; '.' is the background.
ICONS = {
    'office': {
        'background': '#3ea88c',
        'palette': {'w': '#ffffff'},
        'rows': [
            '................',
            '................',
            '................',
            '..w...w..wwwww..',
            '..ww..w....w....',
            '..ww..w....w....',
            '..w.w.w....w....',
            '..w.w.w....w....',
            '..w..ww....w....',
            '..w..ww....w....',
            '..w...w.w..w....',
            '..w...w.w..w....',
            '..w...w..ww.....',
            '................',
            '................',
            '................',
        ],
    },
    'hotels': {
        'background': '#15803d',
        'palette': {'w': '#ffffff', 'p': '#dcfce7'},
        'rows': [
            '................',
            '................',
            '................',
            '..w.............',
            '..w.............',
            '..w..ppp........',
            '..w..ppp........',
            '..w.............',
            '..wwwwwwwwwwww..',
            '..wwwwwwwwwwww..',
            '..wwwwwwwwwwww..',
            '..w..........w..',
            '..w..........w..',
            '................',
            '................',
            '................',
        ],
    },
    'world': {
        'background': '#294b60',
        'palette': {'r': '#b4523d', 'c': '#fcf0d0', 'd': '#294b60', 'y': '#f3c34c', 's': '#63929a', 'l': '#afcbbd'},
        'rows': [
            '................',
            '............yy..',
            '.......r....yy..',
            '......rrr.......',
            '.....rrrrr......',
            '....rrrrrrr.....',
            '...rrrrrrrrr....',
            '....ccccccc.....',
            '....cddcdcc.....',
            '....cddcccc.....',
            '....ccccccc.....',
            '................',
            'ssssssssssssssss',
            'lssllssllssllssl',
            'ssssssssssssssss',
            'ssssssssssssssss',
        ],
    },
}

# Where each icon is published. PNG sizes: the 180 is Apple's touch icon; 192/512 are the app manifest's.
OUTPUTS = {
    'office': {'svg': 'assets/images/favicon.svg', 'png': {180: 'assets/images/apple-touch-icon.png'}, 'rounded_png': True},
    'hotels': {'svg': 'assets/images/favicon-hotels.svg', 'png': {180: 'assets/images/apple-touch-icon-hotels.png'}, 'rounded_png': True},
    # The manifest marks these "maskable": the system cuts its own shape, so the PNGs bleed to the edge.
    'world': {'svg': 'johansson-town/assets/icons/town.svg', 'png': {192: 'johansson-town/assets/icons/town-192.png', 512: 'johansson-town/assets/icons/town-512.png'}, 'rounded_png': False},
}


def pixels(icon):
    rows = icon['rows']
    assert len(rows) == GRID and all(len(row) == GRID for row in rows), 'every icon is a 16×16 grid'
    for y, row in enumerate(rows):
        for x, key in enumerate(row):
            if key != '.':
                yield x, y, icon['palette'][key]


def svg(icon):
    # Horizontal runs of one colour become one rect each; crispEdges keeps the pixels square.
    body = []
    for y, row in enumerate(icon['rows']):
        x = 0
        while x < GRID:
            key = row[x]
            if key == '.':
                x += 1
                continue
            run = x
            while run < GRID and row[run] == key:
                run += 1
            body.append(f'<rect x="{x}" y="{y}" width="{run - x}" height="1" fill="{icon["palette"][key]}"/>')
            x = run
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {GRID} {GRID}" shape-rendering="crispEdges">'
            f'<rect width="{GRID}" height="{GRID}" rx="3" fill="{icon["background"]}"/>' + ''.join(body) + '</svg>\n')


def png(icon, size, rounded):
    small = Image.new('RGBA', (GRID, GRID), icon['background'])
    for x, y, colour in pixels(icon):
        small.putpixel((x, y), Image.new('RGB', (1, 1), colour).getpixel((0, 0)) + (255,))
    image = small.resize((size, size), Image.NEAREST)
    if rounded:
        mask = Image.new('L', (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=round(size * 3 / GRID), fill=255)
        image.putalpha(mask)
    return image


def preview(path):
    """One sheet with every icon at tab, bookmark and home-screen sizes, for looking at before publishing."""
    sizes = (16, 32, 64, 180)
    sheet = Image.new('RGBA', (sum(sizes) + 20 * (len(sizes) + 1), len(ICONS) * 200 + 20), '#f5f8fa')
    for row, (name, icon) in enumerate(ICONS.items()):
        x = 20
        for size in sizes:
            sheet.alpha_composite(png(icon, size, True), (x, 20 + row * 200 + (180 - size) // 2))
            x += size + 20
    sheet.save(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--preview', help='Also write a contact sheet PNG to this path')
    args = parser.parse_args()
    for name, out in OUTPUTS.items():
        icon = ICONS[name]
        (ROOT / out['svg']).write_text(svg(icon), encoding='utf-8')
        for size, rel in out['png'].items():
            png(icon, size, out['rounded_png']).save(ROOT / rel, optimize=True)
        print(name, '→', out['svg'], *out['png'].values())
    if args.preview:
        preview(args.preview)
        print('preview →', args.preview)


if __name__ == '__main__':
    main()
