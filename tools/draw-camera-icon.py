#!/usr/bin/env python3
"""Pocket Camera's Home Screen icon, drawn in code (the owner, 29 October 2026: "It should be installable as iPhone app
web page too on the Home Screen draw a Camera icon with Python").

A chunky white toy camera on the camera app's graphite, its lens ringed in the camera's yellow (#ffd60a, the colour of
everything chosen in the app), and in the glass the little pixel house from the Pocket Look's tile, in the Pocket
Look's four greens: the picture the camera takes. Apple's grid: a full-bleed square (iOS rounds the corners itself),
one subject, centred, no words.

Drawn at 4096 px and reduced, so every curve is smooth. Writes camera/icons/:
  apple-touch-icon.png (180, the Home Screen on iPhone and iPad), icon-192.png and icon-512.png (the web manifest),
  icon-maskable-512.png (the same drawing inside the safe circle, for launchers that cut their own shape),
  icon-32.png (the browser tab).
Run from the repository root: python3 tools/draw-camera-icon.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops

OUT = Path(__file__).resolve().parent.parent / 'camera' / 'icons'
S = 4096          # drawing size
U = S / 1024      # one design unit (the design is laid out on 1024)

GRAPHITE_TOP, GRAPHITE_BOTTOM = (58, 58, 60), (13, 13, 15)
BODY_TOP, BODY_BOTTOM = (250, 250, 252), (214, 214, 220)
BEZEL, YELLOW = (28, 28, 30), (255, 214, 10)
# The Pocket Look's four greens, darkest first (looks.js, 'pocket').
GREENS = [(15, 56, 15), (48, 98, 48), (139, 172, 15), (155, 188, 15)]
# The Pocket tile's little house, as twelve by twelve pixels: 3 sky, 0 roof, window and door, 1 walls, 2 grass.
HOUSE = [
    '333333333333',
    '333333333333',
    '333330033333',
    '333300003333',
    '333000000333',
    '330000000033',
    '333111111333',
    '333101001333',
    '333111001333',
    '222111001222',
    '222222222222',
    '111111111111',
]


def u(v):
    return round(v * U)


def vertical(size, top, bottom):
    """A vertical gradient the size of `size`."""
    w, h = size
    column = Image.new('RGB', (1, h))
    for y in range(h):
        t = y / max(1, h - 1)
        column.putpixel((0, y), tuple(round(a + (b - a) * t) for a, b in zip(top, bottom)))
    return column.resize((w, h))


def rounded(box, radius):
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([u(v) for v in box], radius=u(radius), fill=255)
    return mask


def circle(cx, cy, r):
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).ellipse([u(cx - r), u(cy - r), u(cx + r), u(cy + r)], fill=255)
    return mask


def draw(scale=1.0):
    """The icon at S px. `scale` shrinks the camera about the centre (the maskable icon keeps it in the safe circle)."""
    # The ground: the app's graphite, lighter at the top left as the light falls on the camera.
    icon = vertical((S, S), GRAPHITE_TOP, GRAPHITE_BOTTOM)
    glow = Image.new('L', (S, S), 0)
    ImageDraw.Draw(glow).ellipse([u(-260), u(-320), u(760), u(560)], fill=46)
    glow = glow.filter(ImageFilter.GaussianBlur(u(140)))
    icon = Image.composite(Image.new('RGB', (S, S), (120, 120, 128)), icon, glow)

    camera = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    # The body and its viewfinder hump, one white shape.
    body = ImageChops.lighter(rounded((168, 336, 856, 776), 104), rounded((388, 262, 636, 380), 46))
    shadow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    shadow.putalpha(body.filter(ImageFilter.GaussianBlur(u(30))).point(lambda a: a * .55))
    camera.alpha_composite(shadow, (0, u(26)))
    white = vertical((S, S), BODY_TOP, BODY_BOTTOM).convert('RGBA')
    white.putalpha(body)
    camera.alpha_composite(white)
    # The shutter button on the hump's shoulder, and the flash: small, quiet, so the lens stays the one subject.
    ImageDraw.Draw(camera).rounded_rectangle([u(236), u(300), u(332), u(344)], radius=u(18), fill=(214, 214, 220))
    ImageDraw.Draw(camera).ellipse([u(724), u(392), u(784), u(452)], fill=YELLOW)

    # The lens: a dark bezel, the yellow ring, then the glass with the picture in it.
    cx, cy = 512, 560
    for r, colour in ((206, BEZEL), (176, YELLOW), (150, BEZEL)):
        layer = Image.new('RGBA', (S, S), colour + (255,))
        layer.putalpha(circle(cx, cy, r))
        camera.alpha_composite(layer)
    glass_r = 138
    side = 12
    cell = 2 * glass_r / side
    picture = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    paint = ImageDraw.Draw(picture)
    for row, line in enumerate(HOUSE):
        for col, ch in enumerate(line):
            x0, y0 = cx - glass_r + col * cell, cy - glass_r + row * cell
            paint.rectangle([u(x0), u(y0), u(x0 + cell) + 1, u(y0 + cell) + 1], fill=GREENS[int(ch)] + (255,))
    picture.putalpha(ImageChops.multiply(picture.getchannel('A'), circle(cx, cy, glass_r)))
    camera.alpha_composite(picture)
    # Glass: a soft sheen across the top left and a small bright glint.
    sheen = Image.new('L', (S, S), 0)
    ImageDraw.Draw(sheen).ellipse([u(cx - 128), u(cy - 132), u(cx + 60), u(cy - 20)], fill=92)
    sheen = ImageChops.multiply(sheen.filter(ImageFilter.GaussianBlur(u(16))), circle(cx, cy, glass_r))
    light = Image.new('RGBA', (S, S), (255, 255, 255, 0))
    light.putalpha(sheen)
    camera.alpha_composite(light)
    ImageDraw.Draw(camera).ellipse([u(cx - 84), u(cy - 92), u(cx - 52), u(cy - 60)], fill=(255, 255, 255, 230))

    if scale != 1.0:
        size = round(S * scale)
        camera = camera.resize((size, size), Image.LANCZOS)
        placed = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        placed.alpha_composite(camera, ((S - size) // 2, (S - size) // 2))
        camera = placed
    icon = icon.convert('RGBA')
    icon.alpha_composite(camera)
    return icon.convert('RGB')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    full, safe = draw(), draw(.8)
    for name, image, px in (('apple-touch-icon.png', full, 180), ('icon-192.png', full, 192), ('icon-512.png', full, 512),
                            ('icon-maskable-512.png', safe, 512), ('icon-32.png', full, 32)):
        image.resize((px, px), Image.LANCZOS).save(OUT / name, optimize=True)
        print(OUT / name, f'{px}×{px}')


if __name__ == '__main__':
    main()
