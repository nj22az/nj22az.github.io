#!/usr/bin/env python3
"""
Her name on the other ship's plates. The sheet of pictures that comes with the base (ferry-atlas.webp, the Town's export)
carries the ship's name in three places: the bow lettering, the transom lettering over the port of registry, and the name
board on the wheelhouse front. The export painted them CHRISTINA (9 November 2026); the owner renamed her on 11 November.
This paints the name of spec.py there instead, in the same ink, height and letter spacing, and the first word of the two
fire plans' small print with it.

    python3 ferry/blender/name_plates.py [--sheet ferry/data/ferry-atlas.webp]

Run it when her name changes, not at every build: it writes the sheet again, and a lossy picture loses a little each time.
A fresh export from the Town should paint the right name by itself (the name is a constant of the export page); then this
is not needed. Needs Pillow; no Blender.
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import spec as S

FONTS = ('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
INK = (35, 89, 93)
PAPER = (244, 241, 233)
WAS = 'CHRISTINA'
# Each plate: the box that is wiped, the middle the name is set about, the foot of its letters, the height of a capital,
# and how wide the old name stood (its letter spacing is worked out from that and kept).
PLATES = dict(
    bow=dict(wipe=(440, 20, 912, 100), middle=674.5, foot=87, cap=53, was=441, clear=True),
    transom=dict(wipe=(1010, 10, 1365, 70), middle=1186.5, foot=59, cap=39, was=321, clear=True),
    # the name board, 680 to 1180 across with a border 10 px in: its lettering stands 172 to 218, without letter spacing
    board=dict(wipe=(700, 162, 1160, 230), middle=930.0, foot=218, cap=46, was=None, clear=False),
)
SMALL = ((1461, 21, 1490, 27), (17, 617, 46, 623))            # the name in the small print of the two fire plans


def font_for(cap):
    path = next(p for p in FONTS if os.path.exists(p))
    size = cap / 0.72
    for _ in range(12):
        f = ImageFont.truetype(path, round(size))
        top, bottom = f.getbbox('H')[1], f.getbbox('H')[3]
        size *= cap / (bottom - top)
    return ImageFont.truetype(path, round(size))


def width(f, text, track):
    return sum(f.getlength(c) for c in text) + track * (len(text) - 1)


def write(d, f, text, middle, foot, track, ink):
    x = middle - width(f, text, track) / 2
    top = f.getbbox('H')[1]
    cap = f.getbbox('H')[3] - top
    for c in text:
        d.text((x, foot - cap - top), c, font=f, fill=ink)
        x += f.getlength(c) + track


def main():
    args = sys.argv[1:]
    sheet = args[args.index('--sheet') + 1] if '--sheet' in args else os.path.join(HERE, '..', 'data', 'ferry-atlas.webp')
    im = Image.open(sheet).convert('RGBA')
    px = im.load()
    d = ImageDraw.Draw(im)
    for name, p in PLATES.items():
        x0, y0, x1, y1 = p['wipe']
        f = font_for(p['cap'])
        # the letter spacing the first name was painted with, kept
        track = max(0.0, min((p['was'] - width(f, WAS, 0)) / (len(WAS) - 1), 0.14 * p['cap'])) if p['was'] else 0.0
        if p['clear']:
            for y in range(y0, y1):
                for x in range(x0, x1):
                    px[x, y] = INK + (0,)
        else:
            d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=PAPER + (255,))
        write(d, f, S.NAME, p['middle'], p['foot'], track, INK + (255,))
        print(f"{name}: {S.NAME}, capitals {p['cap']} px, letter spacing {track:.1f} px")
    small = ImageFont.truetype(next(p for p in FONTS if os.path.exists(p)).replace('-Bold', '-Regular').replace('Sans-Regular.ttf', 'Sans-Regular.ttf'), 5)
    for x0, y0, x1, y1 in SMALL:
        d.rectangle((x0, y0, x1, y1), fill=px[x0, y0 - 2])
        d.text((x0 + 5, y0), S.NAME, font=small, fill=(96, 96, 96, 255))
    im.save(sheet, 'WEBP', quality=92, method=6)
    print(f'{sheet}: {os.path.getsize(sheet)} bytes')


if __name__ == '__main__':
    main()
