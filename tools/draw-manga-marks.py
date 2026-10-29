#!/usr/bin/env python3
"""Pocket Camera's manga marks, drawn in code (the owner, 29 October 2026: "Can make the pictures look like they are from
a manga", then "Yes proceed" to focus lines, sound effects and emotion marks): the signs a manga draws on a face to say
what is felt. A sweat drop, an anger vein, sparkles, a heart, the exclamation and question marks, the gloom lines of a
shock, a blush and a music note. Our own drawing, nothing traced.

Each is drawn four times larger than kept and made smaller (smooth edges), inked, given a thin white edge so it reads
on any picture, and written as a 512 px WebP to place and a 256 px one for the sheet, with camera/stickers/marks.json,
which stickers.js loads beside the studio's sheets (under the Manga tab, never a deck for Memory).

    python3 tools/draw-manga-marks.py            # from the repository root
"""
import hashlib
import io
import json
import math
from pathlib import Path

from fontTools.ttLib import TTFont

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'camera' / 'stickers'
# The camera's own cut of Rounded Mplus 1c Black (camera/fonts/OFL-MPLUSRounded1c.txt), unpacked for Pillow.
FONT_WOFF2 = ROOT / 'camera' / 'fonts' / 'mplus-rounded-black-kana.woff2'
S = 2048                      # drawn at this size, kept at a quarter
INK, WHITE = (22, 19, 15, 255), (255, 255, 255, 255)
LINE = 44                     # the ink line, at the drawing's size


def canvas():
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def polygon_outline(d, points, fill, line=LINE):
    d.polygon(points, fill=fill)
    d.line(points + [points[0]], fill=INK, width=line, joint='curve')
    for p in points:
        d.ellipse([p[0] - line / 2, p[1] - line / 2, p[0] + line / 2, p[1] + line / 2], fill=INK)


def bezier(p0, p1, p2, p3, n=60):
    """Points along a cubic Bézier curve, its end left out (the next piece starts there)."""
    out = []
    for i in range(n):
        t = i / n
        u = 1 - t
        out.append((u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0],
                    u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1]))
    return out


def brush_shape(d, outline, width, fill):
    """An ink line drawn as a brush pen draws it: the shape filled with ink, then filled again with `fill` inside an
    edge `width(i)` thick at point i, so the line swells and thins as it goes round."""
    n = len(outline)
    area = sum(outline[i][0] * outline[(i + 1) % n][1] - outline[(i + 1) % n][0] * outline[i][1] for i in range(n))
    side = 1 if area > 0 else -1          # which normal points in, whichever way round the outline was drawn
    inner = []
    for i, (x, y) in enumerate(outline):
        (ax, ay), (bx, by) = outline[i - 1], outline[(i + 1) % n]
        tx, ty = bx - ax, by - ay
        length = math.hypot(tx, ty) or 1
        w = width(i)
        inner.append((x - ty / length * w * side, y + tx / length * w * side))
    d.polygon(outline, fill=INK)
    d.polygon(inner, fill=fill)


def sweat():
    """The sweat drop, as Akira Toriyama draws one (the owner: "Make the water drop look like an Akira Toriyama water
    drop"): a plump round bulb and a sharp tip that leans and curls a little to one side; one bold brush line, heavy
    round the bottom and thinning to the tip; a pale inside with a short curved stroke along the inside of the bulb, the
    shine on the water. Our own drawing of the way he draws them, nothing traced."""
    im, d = canvas()
    r, cx, cy = S * .29, S * .45, S * .64
    at = lambda deg: (cx + r * math.cos(math.radians(deg)), cy - r * math.sin(math.radians(deg)))
    heading = lambda deg: (-math.sin(math.radians(deg)), -math.cos(math.radians(deg)))   # along the bulb, angle rising
    L, R = 150, 388                                    # the bulb's shoulders, left and right, round under the bottom
    bulb = [at(L + (R - L) * i / 140) for i in range(141)]
    tip = (cx + r * .74, cy - r * 1.7)                 # short, and leaning: the drop has just flown off
    r0, hr = at(R), heading(R)
    l0, hl = at(L), heading(L)
    # The right side comes in under the tip (the hook); the left swings out full, so the tip flicks to one side.
    up = bezier(r0, (r0[0] + hr[0] * r * .45, r0[1] + hr[1] * r * .45), (tip[0] - r * .08, tip[1] + r * .38), tip)
    down = bezier(tip, (tip[0] - r * .36, tip[1] + r * .08), (l0[0] - hl[0] * r * .95, l0[1] - hl[1] * r * .95), l0)
    outline = bulb[:-1] + up + down
    nb, nu, nd = len(bulb) - 1, len(up), len(down)

    def width(i):
        if i < nb:                                     # round the bulb: heaviest at the bottom
            return r * (.085 + .065 * math.sin(math.pi * i / nb))
        if i < nb + nu:                                # up the right side, thinning to the tip
            return r * (.085 - .06 * ((i - nb) / nu) ** 1.4)
        return r * (.025 + .06 * ((i - nb - nu) / nd) ** .8)   # down the left, swelling again
    brush_shape(d, outline, width, (236, 248, 255, 255))
    # The shine: a short stroke along the inside of the bulb, low on the right, thick in its middle and pointed at its ends.
    out, back = [], []
    for i in range(41):
        deg, k = -62 + 50 * i / 40, math.sin(math.pi * i / 40)
        ux, uy = math.cos(math.radians(deg)), -math.sin(math.radians(deg))
        px, py = cx + r * .66 * ux, cy + r * .66 * uy
        out.append((px + ux * r * .05 * k, py + uy * r * .05 * k))
        back.append((px - ux * r * .05 * k, py - uy * r * .05 * k))
    d.polygon(out + back[::-1], fill=INK)
    return im


def anger():
    """The anger vein (as 💢 draws it): four red bars round a cross of gaps, each bowed in towards the middle, thick in
    its middle and pointed at its ends, with an ink line."""
    im, d = canvas()
    c, red = S / 2, (226, 48, 44, 255)
    half, out, bow, thick = S * .24, S * .31, S * .1, S * .1
    for q in range(4):
        rot = q * math.pi / 2
        edge = []
        for side in (1, -1):
            for i in range(41):
                t = i / 40 if side == 1 else 1 - i / 40
                x = -half + 2 * half * t
                # Bowed in: the middle of the bar is nearer the centre than its ends.
                y = -out + bow * (1 - (x / half) ** 2) + side * math.sin(math.pi * t) * thick / 2
                edge.append((c + x * math.cos(rot) - y * math.sin(rot), c + x * math.sin(rot) + y * math.cos(rot)))
        polygon_outline(d, edge, red)
    return im


def star(cx, cy, r, thin=.22):
    pts = []
    for i in range(8):
        a = math.pi / 4 * i - math.pi / 2
        rr = r if i % 2 == 0 else r * thin
        pts.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
    # Curve the sides in a little: more points along each edge pulled to the middle.
    out = []
    for i in range(8):
        p, q = pts[i], pts[(i + 1) % 8]
        for k in range(8):
            t = k / 8
            x, y = p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t
            pull = math.sin(math.pi * t) * .12
            out.append((x + (cx - x) * pull, y + (cy - y) * pull))
    return out


def sparkles():
    im, d = canvas()
    for cx, cy, r in ((S * .45, S * .52, S * .34), (S * .8, S * .24, S * .14), (S * .18, S * .2, S * .1)):
        polygon_outline(d, star(cx, cy, r), (255, 243, 166, 255), line=int(LINE * (r / (S * .34)) ** .5))
    return im


def heart():
    im, d = canvas()
    pts = []
    for i in range(160):
        t = math.pi * 2 * i / 160
        x = 16 * math.sin(t) ** 3
        y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
        pts.append((S / 2 + x * S * .026, S * .5 + y * S * .026))
    polygon_outline(d, pts, (236, 64, 92, 255))
    d.ellipse([S * .3, S * .32, S * .42, S * .44], fill=(255, 214, 222, 255))
    return im


_font = None


def font(size):
    global _font
    if _font is None:
        tt = TTFont(str(FONT_WOFF2))
        tt.flavor = None
        _font = io.BytesIO()
        tt.save(_font)
    _font.seek(0)
    return ImageFont.truetype(io.BytesIO(_font.getvalue()), size)


def glyph(text, size=.8, tilt=0):
    im, d = canvas()
    f = font(int(S * size))
    l, t, r, b = d.textbbox((0, 0), text, font=f)
    d.text(((S - (r - l)) / 2 - l, (S - (b - t)) / 2 - t), text, font=f, fill=INK)
    return im.rotate(tilt, resample=Image.BICUBIC, center=(S / 2, S / 2))


def gloom():
    """The gloom lines of a shock: parallel strokes hanging down, darker and longer in the middle."""
    im, d = canvas()
    for i, (x, top, bottom, w) in enumerate(((.24, .12, .62, .045), (.38, .06, .86, .06), (.52, .04, .94, .07),
                                              (.66, .08, .8, .06), (.8, .14, .6, .045))):
        x, w = S * x, S * w
        d.polygon([(x - w / 2, S * top), (x + w / 2, S * top), (x + w * .15, S * bottom), (x - w * .15, S * bottom)], fill=INK)
    return im


def blush():
    im, d = canvas()
    pink = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(pink).ellipse([S * .14, S * .32, S * .86, S * .7], fill=(250, 128, 150, 210))
    im.alpha_composite(pink.filter(ImageFilter.GaussianBlur(S * .03)))
    for k in range(4):
        x = S * (.3 + .14 * k)
        d.line([(x + S * .06, S * .4), (x - S * .06, S * .62)], fill=INK, width=int(S * .028))
    return im


def note():
    return glyph('♪', .86, -8)


MARKS = [  # (id, what it says, drawing)
    ('sweat', 'Sweat drop: nervous', sweat),
    ('anger', 'Anger vein: cross', anger),
    ('sparkles', 'Sparkles: shining', sparkles),
    ('heart', 'Heart: in love', heart),
    ('exclaim', 'Exclamation: surprise', lambda: glyph('!', .9, -6)),
    ('question', 'Question: puzzled', lambda: glyph('?', .86, 6)),
    ('surprise', 'Exclamation and question: what!?', lambda: glyph('!?', .74, -6)),
    ('gloom', 'Gloom lines: shocked', gloom),
    ('blush', 'Blush: embarrassed', blush),
    ('note', 'Music note: happy', note),
]


def finish(im):
    """A thin white edge round the ink, as a sticker's cut, then made small with smooth edges."""
    alpha = im.getchannel('A').point(lambda a: 255 if a > 40 else 0)
    grow = alpha.resize((S // 8, S // 8), Image.BILINEAR).filter(ImageFilter.MaxFilter(5)).resize((S, S), Image.BILINEAR)
    grow = grow.point(lambda a: 255 if a > 90 else 0).filter(ImageFilter.GaussianBlur(6))
    edge = Image.new('RGBA', (S, S), WHITE)
    edge.putalpha(grow)
    out = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    out.alpha_composite(edge)
    out.alpha_composite(im)
    out = out.crop(out.getchannel('A').getbbox())
    return out


def build():
    (OUT / 'marks').mkdir(parents=True, exist_ok=True)
    entries = []
    for key, gloss, draw in MARKS:
        im = finish(draw())
        big, small = im.copy(), im.copy()
        big.thumbnail((512, 512), Image.LANCZOS)
        small.thumbnail((256, 256), Image.LANCZOS)
        big.save(OUT / 'marks' / f'{key}.webp', 'WEBP', quality=88, method=6)
        small.save(OUT / 'marks' / f'{key}.thumb.webp', 'WEBP', quality=88, method=6)
        stamp = hashlib.sha1(big.tobytes()).hexdigest()[:8]
        entries.append({'id': f'marks/{key}', 'src': f'marks/{key}.webp?v={stamp}', 'thumb': f'marks/{key}.thumb.webp?v={stamp}',
                        'width': big.width, 'height': big.height, 'line': '', 'gloss': gloss})
    manifest = {'id': 'marks', 'name': 'Marks', 'tab': 'Manga', 'who': '', 'kind': 'marks',
                'source': 'tools/draw-manga-marks.py', 'stickers': entries}
    (OUT / 'marks.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'{len(entries)} marks')


if __name__ == '__main__':
    build()
