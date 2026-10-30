#!/usr/bin/env python3
"""Sheets for judging Pocket Camera's Looks, from the PNGs tools/render-camera-looks.mjs writes (<photo>--<look>.png):
one row per Look, one column per photo, and with two folders a before|after pair in each cell.

    python3 tools/camera-look-sheet.py --out sheet.jpg --looks manga,lines --photos portrait-hat,night DIR [DIR_AFTER]
    [--height 240]  each picture's height on the sheet
    [--crop x0,y0,x1,y1]  a part of every render, in its own pixels (for judging at 1:1: faces, mouths, glasses)

Judge a sheet at phone size and the crops at 1:1 before calling a Look better (camera/README.md, "Who each Look is for").
"""
import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def font(size):
    for path in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/System/Library/Fonts/Supplemental/Arial Bold.ttf'):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('dirs', nargs='+', help='a folder of renders, or two: before and after')
    parser.add_argument('--out', required=True)
    parser.add_argument('--looks', required=True)
    parser.add_argument('--photos', required=True)
    parser.add_argument('--height', type=int, default=240)
    parser.add_argument('--crop')
    args = parser.parse_args()
    if len(args.dirs) > 2:
        parser.error('one folder, or two (before and after)')
    looks, photos, height = args.looks.split(','), args.photos.split(','), args.height
    crop = tuple(int(v) for v in args.crop.split(',')) if args.crop else None
    label, gap, pair_gap = font(18), 6, 18 if len(args.dirs) == 2 else 6
    title = ' (each pair: before | after)' if len(args.dirs) == 2 else ''

    rows = []
    for look in looks:
        cells = []
        for photo in photos:
            for folder in args.dirs:
                path = Path(folder) / f'{photo}--{look}.png'
                if not path.exists():
                    cells.append(None)
                    continue
                im = Image.open(path).convert('RGB')
                if crop:
                    im = im.crop(crop)
                cells.append(im.resize((round(im.width * height / im.height), height), Image.LANCZOS))
        rows.append((look, cells))

    def row_width(cells):
        return sum((c.width if c else height) + (gap if i % len(args.dirs) == 0 and len(args.dirs) == 2 else pair_gap)
                   for i, c in enumerate(cells))

    width = max(row_width(cells) for _, cells in rows) + 16
    sheet = Image.new('RGB', (width, len(rows) * (height + 34) + 8), (18, 18, 20))
    draw, y = ImageDraw.Draw(sheet), 4
    for look, cells in rows:
        draw.text((8, y + 4), look + title, font=label, fill=(245, 205, 90))
        y, x = y + 28, 8
        for i, cell in enumerate(cells):
            if cell:
                sheet.paste(cell, (x, y))
            else:
                draw.text((x + 10, y + height // 2), 'missing', font=label, fill=(150, 150, 150))
            x += (cell.width if cell else height) + (gap if i % len(args.dirs) == 0 and len(args.dirs) == 2 else pair_gap)
        y += height + 6
    sheet.save(args.out, quality=88)
    print(f'{args.out}: {len(looks)} Looks × {len(photos)} photos')


if __name__ == '__main__':
    main()
