#!/usr/bin/env python3
"""Pocket Camera's icons, drawn in code (the owner, 12 November 2026: "I don't like the sliders or the icons … use python
and draw the assets, draw the icons, make it really fun to use").

Until then the camera's icons were thin outlines, 1.8 px lines of the kind every app has. These are chunky and filled,
in two tones: a solid part in the colour of the text around it, and a soft part at a third of it (so a camera's body is
soft and its lens solid, a calendar's page soft and its header solid). Corners are round, a line is 2.4 px thick with
round ends, and nothing is thinner than 2 px on the 24 px grid, so an icon still reads at 20 px on a phone.

Both tones follow `currentColor`, so an icon is the ink of its button in the dark and in the light, and the World's
green when its button is chosen, with no second drawing.

Everything is geometry computed here: rounded rectangles and polygons, circles, arcs and thick strokes, written as SVG
path data. No font is used (the consoles' 16, 32 and 64 are drawn as strokes), so no device decides how an icon looks.

    python3 tools/draw-camera-icons.py            writes camera/icons/ui-icons.json and camera/icons/ui-icons.svg
    node tools/apply-camera-icons.mjs             sets them into camera/index.html and camera/look-icons.js

The JSON has four sets: `sprite` (the symbols the page uses by `<use href="#i-…">`), `kinds` (the Look kinds' row),
`looks` (one for each Look, shown until its live thumbnail is drawn and on the mix's chips) and `games` (the Game
Room's signs).
"""
import json
import math
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'camera' / 'icons'
SOFT = '.34'      # the soft tone, as a share of the solid one
W = 2.4           # a line


def n(v):
    """A number as SVG wants it: two decimals at most, no trailing zeros."""
    s = f'{v:.2f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def pt(x, y):
    return f'{n(x)} {n(y)}'


# ---------- shapes, as path data ----------
def rrect(x, y, w, h, r=2.0):
    r = min(r, w / 2, h / 2)
    return (f'M{pt(x + r, y)}H{n(x + w - r)}A{n(r)} {n(r)} 0 0 1 {pt(x + w, y + r)}V{n(y + h - r)}'
            f'A{n(r)} {n(r)} 0 0 1 {pt(x + w - r, y + h)}H{n(x + r)}A{n(r)} {n(r)} 0 0 1 {pt(x, y + h - r)}V{n(y + r)}'
            f'A{n(r)} {n(r)} 0 0 1 {pt(x + r, y)}Z')


def circle(cx, cy, r):
    return f'M{pt(cx - r, cy)}A{n(r)} {n(r)} 0 1 0 {pt(cx + r, cy)}A{n(r)} {n(r)} 0 1 0 {pt(cx - r, cy)}Z'


def ellipse(cx, cy, rx, ry):
    return f'M{pt(cx - rx, cy)}A{n(rx)} {n(ry)} 0 1 0 {pt(cx + rx, cy)}A{n(rx)} {n(ry)} 0 1 0 {pt(cx - rx, cy)}Z'


def poly(points, r=1.2):
    """A closed polygon with every corner rounded to radius r (less where an edge is too short for it)."""
    count, out = len(points), []
    for i, (px, py) in enumerate(points):
        ax, ay = points[i - 1]
        bx, by = points[(i + 1) % count]
        ux, uy, vx, vy = ax - px, ay - py, bx - px, by - py
        lu, lv = math.hypot(ux, uy), math.hypot(vx, vy)
        ux, uy, vx, vy = ux / lu, uy / lu, vx / lv, vy / lv
        angle = math.acos(max(-1, min(1, ux * vx + uy * vy)))
        if r <= 0 or angle > math.pi - 1e-3:
            out.append(('L', px, py))
            continue
        d = min(r / math.tan(angle / 2), lu / 2, lv / 2)
        rr = d * math.tan(angle / 2)
        turn = (px - ax) * (by - py) - (py - ay) * (bx - px)
        out.append(('A', px + ux * d, py + uy * d, rr, 1 if turn > 0 else 0, px + vx * d, py + vy * d))
    d = ''
    for i, seg in enumerate(out):
        if seg[0] == 'L':
            d += ('M' if i == 0 else 'L') + pt(seg[1], seg[2])
        else:
            _, sx, sy, rr, sweep, ex, ey = seg
            d += ('M' if i == 0 else 'L') + pt(sx, sy) + f'A{n(rr)} {n(rr)} 0 0 {sweep} {pt(ex, ey)}'
    return d + 'Z'


def polyline(points):
    return 'M' + 'L'.join(pt(x, y) for x, y in points)


def arc(cx, cy, r, a0, a1):
    """An open arc, angles in degrees clockwise from twelve o'clock."""
    def at(a):
        t = math.radians(a - 90)
        return cx + r * math.cos(t), cy + r * math.sin(t)
    (x0, y0), (x1, y1) = at(a0), at(a1)
    large = 1 if abs(a1 - a0) % 360 > 180 else 0
    return f'M{pt(x0, y0)}A{n(r)} {n(r)} 0 {large} {1 if a1 > a0 else 0} {pt(x1, y1)}'


def on(cx, cy, r, a):
    t = math.radians(a - 90)
    return cx + r * math.cos(t), cy + r * math.sin(t)


def sparkle(cx, cy, r, pinch=.22):
    """A four-pointed star with hollowed sides, its points a little blunt."""
    k = r * pinch
    p = [(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)]
    c = [(cx + k, cy - k), (cx + k, cy + k), (cx - k, cy + k), (cx - k, cy - k)]
    d = f'M{pt(*p[0])}'
    for i in range(4):
        d += f'Q{pt(*c[i])} {pt(*p[(i + 1) % 4])}'
    return d + 'Z'


def star(cx, cy, r, points=5, inner=.5, round_=1.0, turn=0):
    pts = []
    for i in range(points * 2):
        rr = r if i % 2 == 0 else r * inner
        pts.append(on(cx, cy, rr, turn + i * 180 / points))
    return poly(pts, round_)


def burst(cx, cy, r, points=8, inner=.74, round_=.5, turn=0):
    return star(cx, cy, r, points, inner, round_, turn)


def drop(cx, cy, r):
    """A drop: a circle of radius r centred on (cx, cy) drawn up to a point above it."""
    top = cy - r * 2.05
    return (f'M{pt(cx, top)}C{pt(cx + r * .55, cy - r * 1.3)} {pt(cx + r, cy - r * .55)} {pt(cx + r, cy)}'
            f'A{n(r)} {n(r)} 0 1 1 {pt(cx - r, cy)}C{pt(cx - r, cy - r * .55)} {pt(cx - r * .55, cy - r * 1.3)} {pt(cx, top)}Z')


# ---------- elements ----------
def solid(d, rule=None):
    return f'<path d="{d}" fill="currentColor"' + (f' fill-rule="{rule}"' if rule else '') + '/>'


def soft(d, rule=None):
    return f'<path d="{d}" fill="currentColor" opacity="{SOFT}"' + (f' fill-rule="{rule}"' if rule else '') + '/>'


def line(d, w=W, tone=None):
    return (f'<path d="{d}" fill="none" stroke="currentColor" stroke-width="{n(w)}" stroke-linecap="round" stroke-linejoin="round"'
            + (f' opacity="{tone}"' if tone else '') + '/>')


def dot(cx, cy, r=1.3):
    return solid(circle(cx, cy, r))


def ink(d, colour):
    """A part in a colour of its own: the Riso looks' inks."""
    return f'<path d="{d}" fill="{colour}"/>'


# Digits as strokes on a 3 x 5 cell, for the consoles' 16, 32 and 64.
DIGITS = {
    '1': [[(1, 0), (2, 0), (2, 5)]],
    '2': [[(0, .6), (1, 0), (2.4, 0), (3, .9), (0, 5), (3, 5)]],
    '3': [[(0, 0), (3, 0), (1.4, 2.1), (3, 3.4), (2.2, 5), (0, 5)]],
    '4': [[(2.2, 5), (2.2, 0), (0, 3.4), (3, 3.4)]],
    '6': [[(2.7, 0), (.9, 0), (0, 2.4), (0, 4.2), (.9, 5), (2.2, 5), (3, 4.2), (3, 3.2), (2.2, 2.4), (.2, 2.4)]],
    '8': [[(1.5, 2.3), (.4, 1.5), (.4, .7), (1.1, 0), (1.9, 0), (2.6, .7), (2.6, 1.5), (1.5, 2.3), (.2, 3.2), (.2, 4.2), (1, 5), (2, 5), (2.8, 4.2), (2.8, 3.2), (1.5, 2.3)]],
}


def number(text, x, y, h=6.0, w=1.7):
    """A number drawn in strokes, its top left at (x, y), h tall."""
    k, out, cx = h / 5, '', x
    for ch in text:
        for stroke in DIGITS[ch]:
            out += line(polyline([(cx + px * k, y + py * k) for px, py in stroke]), w)
        cx += 3 * k + k * 1.25
    return out


# ---------- the symbols the page uses ----------
def sprite():
    s = {}
    # Looks: a sparkle and its small companion.
    s['look'] = solid(sparkle(10.2, 13, 8.2)) + soft(sparkle(18.6, 5.6, 3.6))
    # Crop: two corners laid over the picture.
    s['crop'] = soft(rrect(7.5, 7.5, 9, 9, 1.5)) + line(polyline([(6, 2.5), (6, 18), (21.5, 18)])) + line(polyline([(2.5, 6), (18, 6), (18, 21.5)]))
    # Erase: a rubber, its band soft, on the line it rubs.
    tip = [(13.6, 3.4), (20.6, 10.4), (16.4, 14.6), (9.4, 7.6)]
    sleeve = [(8.4, 8.6), (15.4, 15.6), (11.6, 19.4), (4.6, 12.4)]
    s['erase'] = solid(poly(tip, 1.8)) + soft(poly(sleeve, 1.8)) + line(polyline([(13.4, 21), (21, 21)]), tone=SOFT)
    s['offline-ready'] = soft(circle(12, 12, 9.5)) + line(polyline([(7.6, 12.4), (10.8, 15.4), (16.6, 9)]))
    s['update'] = line(arc(12, 12, 8, 40, 330)) + solid(poly([(12.2, 1.2), (17.4, 4.2), (12.2, 7.6)], .8))
    # Settings: two tracks, each with its knob.
    s['settings'] = (line(polyline([(3.5, 8), (20.5, 8)]), 2.6, SOFT) + line(polyline([(3.5, 16), (20.5, 16)]), 2.6, SOFT)
                     + solid(circle(15, 8, 3.4)) + solid(circle(9, 16, 3.4)))
    s['face'] = soft(circle(12, 12, 9.5)) + dot(8.7, 10, 1.5) + dot(15.3, 10, 1.5) + line(arc(12, 11.2, 5.2, 122, 238))
    s['backup'] = (soft(rrect(3, 9.5, 18, 11.5, 2.8)) + line(polyline([(12, 2.8), (12, 14.6)])) + line(polyline([(8, 11), (12, 15), (16, 11)])))
    s['back'] = line(polyline([(14.5, 5), (7.5, 12), (14.5, 19)]), 2.8)
    s['timer'] = soft(circle(12, 13.5, 8)) + line(polyline([(12, 13.5), (15.2, 10.3)])) + solid(rrect(9.6, 1.6, 4.8, 2.8, 1.2)) + dot(12, 13.5, 1.5)
    # Photo shape: a wide picture and a tall one, one over the other.
    s['ratio'] = soft(rrect(2.5, 6.5, 19, 11, 2.6)) + line(rrect(7.2, 3.2, 9.6, 17.6, 2.4), 2.4)
    # Date: a calendar leaf with its header and the day marked.
    s['date'] = soft(rrect(3, 5, 18, 16, 3)) + solid(rrect(3, 5, 18, 5.6, 2.6)) + line(polyline([(8, 2.6), (8, 6)])) + line(polyline([(16, 2.6), (16, 6)])) + solid(rrect(13.4, 13.6, 4.2, 4.2, 1.2))
    # Photo: a picture of two hills and a sun.
    s['photo'] = soft(rrect(2.5, 4, 19, 16, 3.2)) + solid(poly([(4.6, 18.2), (9.6, 11), (13, 15.2), (15.4, 12.6), (19.4, 18.2)], 1.3)) + solid(circle(16, 8.4, 2))
    s['flip'] = (line(arc(12, 12, 7.6, 300, 420)) + line(arc(12, 12, 7.6, 120, 240))
                 + solid(poly([(17.2, 2.4), (20.6, 8.6), (13.6, 8.2)], .8)) + solid(poly([(6.8, 21.6), (3.4, 15.4), (10.4, 15.8)], .8)))
    s['dice'] = soft(rrect(3, 3, 18, 18, 4.5)) + dot(8, 8, 1.7) + dot(16, 8, 1.7) + dot(12, 12, 1.7) + dot(8, 16, 1.7) + dot(16, 16, 1.7)
    s['plus'] = line(polyline([(12, 4.5), (12, 19.5)]), 3) + line(polyline([(4.5, 12), (19.5, 12)]), 3)
    s['minus'] = line(polyline([(4.5, 12), (19.5, 12)]), 3)
    s['x'] = line(polyline([(6, 6), (18, 18)]), 3) + line(polyline([(18, 6), (6, 18)]), 3)
    s['share'] = soft(rrect(4, 10, 16, 11.5, 2.8)) + line(polyline([(12, 15), (12, 3.2)])) + line(polyline([(8, 7), (12, 3), (16, 7)]))
    s['download'] = line(polyline([(12, 3), (12, 14.4)])) + line(polyline([(7.6, 10.4), (12, 14.8), (16.4, 10.4)])) + solid(rrect(3.5, 17.6, 17, 3.6, 1.8))
    s['trash'] = soft(poly([(5.4, 8), (18.6, 8), (17.4, 21.4), (6.6, 21.4)], 2)) + solid(rrect(3.2, 4.8, 17.6, 3.4, 1.6)) + solid(rrect(9, 2.2, 6, 3.6, 1.4))
    # Adjust: a dial with its pointer.
    s['edit'] = soft(circle(12, 12, 9.5)) + solid(circle(12, 12, 3.2)) + line(polyline([(12, 12), (17, 7)]), 3)
    rays = ''.join(line(polyline([on(12, 12, 8.2, a), on(12, 12, 10.2, a)]), 2.6) for a in range(0, 360, 45))
    s['light'] = solid(circle(12, 12, 4.8)) + rays
    s['contrast'] = soft(circle(12, 12, 9.5)) + solid(f'M{pt(12, 2.5)}A9.5 9.5 0 0 1 {pt(12, 21.5)}Z')
    s['colour'] = soft(drop(12, 14, 6.8)) + solid(f'M{pt(5.2, 14)}A6.8 6.8 0 0 0 {pt(18.8, 14)}Z')
    s['warmth'] = soft(rrect(9.4, 2.4, 5.2, 13, 2.6)) + solid(circle(12, 17, 4.6)) + solid(rrect(10.9, 8.4, 2.2, 8, 1.1))
    s['pattern'] = ''.join((solid if (i + j) % 2 == 0 else soft)(circle(5.5 + i * 6.5, 5.5 + j * 6.5, 2.4)) for i in range(3) for j in range(3))
    # Sticker: a sheet with its corner peeling, smiling.
    s['sticker'] = (soft(f'M{pt(7, 3)}H{n(17)}A4 4 0 0 1 {pt(21, 7)}V{n(13)}L{pt(13, 21)}H{n(7)}A4 4 0 0 1 {pt(3, 17)}V{n(7)}A4 4 0 0 1 {pt(7, 3)}Z')
                    + solid(poly([(21, 13), (13, 21), (13, 16.4), (16.4, 13)], 1.6)) + dot(8.6, 9.4, 1.5) + dot(14.6, 9.4, 1.5) + line(arc(11.6, 10.6, 3.8, 128, 232), 2.2))
    s['flip-h'] = solid(poly([(9.6, 5), (9.6, 19), (2.6, 12)], 1.4)) + soft(poly([(14.4, 5), (14.4, 19), (21.4, 12)], 1.4)) + line(polyline([(12, 3), (12, 21)]), 1.8, SOFT)
    s['resize'] = line(polyline([(6, 18), (18, 6)]), 2.8) + solid(poly([(13, 4), (20, 4), (20, 11)], 1.2)) + solid(poly([(4, 13), (11, 20), (4, 20)], 1.2))
    s['chevron'] = line(polyline([(6, 9), (12, 15), (18, 9)]), 2.8)
    s['frame'] = soft(rrect(2.5, 2.5, 19, 19, 3.6)) + solid(rrect(2.5, 2.5, 19, 19, 3.6) + rrect(6.4, 6.4, 11.2, 11.2, 1.6), 'evenodd')
    s['paper'] = soft(poly([(5, 2.5), (14.5, 2.5), (19.5, 7.5), (19.5, 21.5), (5, 21.5)], 2.4)) + solid(poly([(14.2, 2.5), (19.5, 7.8), (14.2, 7.8)], 1)) + line(polyline([(8.6, 12.6), (15.6, 12.6)]), 2) + line(polyline([(8.6, 16.6), (13.4, 16.6)]), 2)
    s['undo'] = line(f'M{pt(7, 9)}H{n(14.5)}A5.2 5.2 0 0 1 {pt(14.5, 19.4)}H{n(9)}') + solid(poly([(8.4, 4), (8.4, 14), (2.6, 9)], 1.2))
    s['mirror'] = solid(f'M{pt(10, 4)}V{n(20)}H{n(7)}A4.5 4.5 0 0 1 {pt(2.5, 15.5)}V{n(8.5)}A4.5 4.5 0 0 1 {pt(7, 4)}Z') + soft(f'M{pt(14, 4)}V{n(20)}H{n(17)}A4.5 4.5 0 0 0 {pt(21.5, 15.5)}V{n(8.5)}A4.5 4.5 0 0 0 {pt(17, 4)}Z')
    speaker = solid(poly([(2.6, 9.2), (6.8, 9.2), (12, 4.6), (12, 19.4), (6.8, 14.8), (2.6, 14.8)], 1.5))
    s['sound'] = speaker + line(arc(11.4, 12, 4.4, 40, 140), 2.3) + line(arc(11.4, 12, 8.2, 44, 136), 2.3, SOFT)
    s['sound-off'] = speaker + line(polyline([(15.4, 9.2), (21, 14.8)]), 2.4) + line(polyline([(21, 9.2), (15.4, 14.8)]), 2.4)
    s['text'] = solid(rrect(4, 4, 16, 4.2, 1.6)) + solid(rrect(9.9, 4, 4.2, 16.5, 1.6))
    # Detail: a cut stone, its crown solid.
    s['detail'] = soft(poly([(6.4, 3.6), (17.6, 3.6), (22, 9.4), (12, 21.4), (2, 9.4)], 1.6)) + solid(poly([(6.4, 3.6), (17.6, 3.6), (22, 9.4), (2, 9.4)], 1.4))
    s['paste'] = soft(rrect(4.5, 4.5, 15, 17, 3)) + solid(rrect(8.2, 2.4, 7.6, 5, 1.8)) + line(polyline([(8.6, 12.4), (15.4, 12.4)]), 2) + line(polyline([(8.6, 16.4), (13, 16.4)]), 2)
    # Games: a pad, its cross and two buttons.
    s['game'] = (soft(rrect(1.8, 6.5, 20.4, 11.4, 5.6)) + line(polyline([(7.4, 9.8), (7.4, 14.6)]), 2.4) + line(polyline([(5, 12.2), (9.8, 12.2)]), 2.4)
                 + dot(15.2, 13.8, 1.5) + dot(18, 10.6, 1.5))
    s['printer'] = soft(rrect(2.5, 8.4, 19, 10, 2.8)) + solid(rrect(6.6, 2.6, 10.8, 7, 1.6)) + solid(rrect(6.6, 14.4, 10.8, 7, 1.6)) + dot(17.6, 11.6, 1.1)
    s['say'] = (soft(f'M{pt(6.5, 3.5)}H{n(17.5)}A4 4 0 0 1 {pt(21.5, 7.5)}V{n(13)}A4 4 0 0 1 {pt(17.5, 17)}H{n(12.4)}L{pt(7.6, 21)}V{n(17)}H{n(6.5)}A4 4 0 0 1 {pt(2.5, 13)}V{n(7.5)}A4 4 0 0 1 {pt(6.5, 3.5)}Z')
                + dot(8, 10.2, 1.5) + dot(12, 10.2, 1.5) + dot(16, 10.2, 1.5))
    # Camera: the toy camera of the Home Screen icon, its body soft and its lens solid.
    s['camera'] = camera()
    s['moon'] = solid(f'M{pt(13.4, 2.8)}A9.3 9.3 0 1 0 {pt(21.2, 13.6)}A7.3 7.3 0 0 1 {pt(13.4, 2.8)}Z')
    s['check'] = line(polyline([(5, 12.6), (10, 17.4), (19, 7)]), 3)
    s['lock'] = soft(rrect(4, 10, 16, 11.5, 3)) + line(f'M{pt(7.8, 10)}V{n(7.4)}A4.2 4.2 0 0 1 {pt(16.2, 7.4)}V{n(10)}') + solid(circle(12, 14.8, 1.8)) + solid(rrect(11, 15, 2, 3.8, 1))
    # Cut out: scissors.
    s['cutout'] = (line(polyline([(8.2, 15.4), (19.6, 4.6)]), 2.4) + line(polyline([(8.2, 8.6), (19.6, 19.4)]), 2.4)
                   + solid(circle(5.8, 6.4, 3.4) + circle(5.8, 6.4, 1.3), 'evenodd') + solid(circle(5.8, 17.6, 3.4) + circle(5.8, 17.6, 1.3), 'evenodd'))
    s['makeup'] = soft(rrect(7.6, 11, 8.8, 10.5, 1.8)) + solid(poly([(9.4, 11), (9.4, 5.4), (14.6, 2.8), (14.6, 11)], 1.3)) + solid(rrect(7.6, 11, 8.8, 3, 1.2))
    return s


def camera(lens=True):
    body = rrect(2.2, 6.4, 19.6, 14, 3.6)
    hump = rrect(8.2, 3.6, 7.6, 5, 1.8)
    out = soft(body) + soft(hump)
    return out + (solid(circle(12, 13.4, 4.4)) if lens else '')


# ---------- the Look kinds' row ----------
def kinds():
    k = {}
    k['presets'] = solid(star(12, 12.6, 10, 5, .52, 1.6))
    k['photo'] = camera()
    k['pop'] = solid(burst(12, 12, 10.4, 9, .68, .7) + circle(12, 12, 2.8), 'evenodd')
    k['games'] = sprite_game()
    # 80s: a television with its two aerials.
    k['80s'] = soft(rrect(2.5, 7.5, 19, 13.5, 3.2)) + solid(rrect(5.2, 10.2, 9.6, 8.1, 1.8)) + dot(17.6, 11.8, 1.1) + dot(17.6, 15.6, 1.1) + line(polyline([(8, 2.6), (12, 7), (16, 2.6)]), 2.2)
    k['drawn'] = pencil()
    k['comic'] = (soft(f'M{pt(6.5, 3)}H{n(17.5)}A4 4 0 0 1 {pt(21.5, 7)}V{n(12.6)}A4 4 0 0 1 {pt(17.5, 16.6)}H{n(12.6)}L{pt(7.4, 21)}V{n(16.6)}H{n(6.5)}A4 4 0 0 1 {pt(2.5, 12.6)}V{n(7)}A4 4 0 0 1 {pt(6.5, 3)}Z')
                  + line(polyline([(7.4, 8), (16.6, 8)]), 2.2) + line(polyline([(7.4, 11.8), (13.4, 11.8)]), 2.2))
    k['painted'] = brush()
    # Print: a sheet coming off the block.
    k['print'] = roller()
    k['riso'] = soft(circle(8.6, 9.2, 6.4)) + soft(circle(15.4, 9.2, 6.4)) + solid(circle(12, 15, 6.4))
    k['more'] = dot(5, 12, 2.1) + dot(12, 12, 2.1) + dot(19, 12, 2.1)
    return k


def sprite_game():
    return (soft(rrect(1.8, 6.5, 20.4, 11.4, 5.6)) + line(polyline([(7.4, 9.8), (7.4, 14.6)]), 2.4) + line(polyline([(5, 12.2), (9.8, 12.2)]), 2.4)
            + dot(15.2, 13.8, 1.5) + dot(18, 10.6, 1.5))


def pencil():
    shaft = [(15.2, 3.2), (20.8, 8.8), (9.6, 20), (4, 14.4)]
    return soft(poly(shaft, 1.4)) + solid(poly([(4, 14.4), (9.6, 20), (3, 21)], 1)) + solid(poly([(15.2, 3.2), (20.8, 8.8), (18.4, 11.2), (12.8, 5.6)], 1.2))


def brush():
    return (solid(poly([(14.6, 3), (21, 9.4), (13.2, 15.4), (8.6, 10.8)], 1.6))
            + soft(f'M{pt(8.2, 12.4)}C{pt(4.4, 11.6)} {pt(2.6, 15.2)} {pt(3, 20.8)}C{pt(8.4, 21.4)} {pt(12.2, 19.6)} {pt(11.6, 15.8)}Z'))


def roller():
    """An ink roller on the track it has rolled."""
    return (solid(rrect(3, 3.4, 14.5, 6.6, 2.6)) + line(f'M{pt(17.5, 6.7)}H{n(20.4)}V{n(13)}H{n(12)}V{n(16)}', 2.2)
            + solid(rrect(10.2, 15.2, 3.6, 6.4, 1.4)) + line(polyline([(3.6, 14), (7, 14)]), 2.4, SOFT))


def heart(cx, cy, r):
    return (f'M{pt(cx, cy + r)}C{pt(cx - r * 1.5, cy + r * .1)} {pt(cx - r * 1.25, cy - r * 1.05)} {pt(cx - r * .55, cy - r * 1.0)}'
            f'C{pt(cx - r * .25, cy - r * 1.0)} {pt(cx, cy - r * .75)} {pt(cx, cy - r * .5)}'
            f'C{pt(cx, cy - r * .75)} {pt(cx + r * .25, cy - r * 1.0)} {pt(cx + r * .55, cy - r * 1.0)}'
            f'C{pt(cx + r * 1.25, cy - r * 1.05)} {pt(cx + r * 1.5, cy + r * .1)} {pt(cx, cy + r)}Z')


def spade(cx, cy, r):
    """A spade: a heart on its head, with a foot."""
    top = (f'M{pt(cx, cy - r)}C{pt(cx + r * 1.5, cy - r * .1)} {pt(cx + r * 1.25, cy + r * 1.05)} {pt(cx + r * .55, cy + r * 1.0)}'
           f'C{pt(cx + r * .25, cy + r * 1.0)} {pt(cx, cy + r * .75)} {pt(cx, cy + r * .5)}'
           f'C{pt(cx, cy + r * .75)} {pt(cx - r * .25, cy + r * 1.0)} {pt(cx - r * .55, cy + r * 1.0)}'
           f'C{pt(cx - r * 1.25, cy + r * 1.05)} {pt(cx - r * 1.5, cy - r * .1)} {pt(cx, cy - r)}Z')
    return top + poly([(cx, cy + r * .3), (cx + r * .55, cy + r * 1.55), (cx - r * .55, cy + r * 1.55)], .5)


def handheld(screen):
    """A hand-held console: its body soft, the screen given, a cross and two buttons."""
    return (soft(rrect(5, 1.8, 14, 20.4, 3)) + screen + line(polyline([(9.2, 15.2), (9.2, 18.8)]), 1.9) + line(polyline([(7.4, 17), (11, 17)]), 1.9)
            + dot(14, 18, 1.1) + dot(16.6, 16.2, 1.1))


def cartridge(text):
    """A game cartridge with its number."""
    width = {1: 3.7, 2: 9.0}[len(text)]
    return soft(poly([(3, 4), (21, 4), (21, 20.5), (17, 20.5), (17, 18), (7, 18), (7, 20.5), (3, 20.5)], 1.8)) + number(text, 12 - width / 2, 7.2, 6.4, 1.9)


def looks():
    k = kinds()
    s = sprite()
    L = {}
    L['none'] = camera()
    L['mono'] = s['contrast']
    # Sepia: an old print held by its corner mounts.
    L['sepia'] = (soft(rrect(3, 4, 18, 16, 2)) + solid(poly([(5.6, 17.6), (10.2, 11.6), (13.2, 15), (15, 13.2), (18.4, 17.6)], 1.1))
                  + solid(poly([(2, 3), (8, 3), (2, 9)], .8)) + solid(poly([(22, 21), (16, 21), (22, 15)], .8)))
    # Negative: the square and its circle, each half the other's opposite.
    L['negative'] = soft(rrect(3, 3, 18, 18, 3.4)) + solid(poly([(3, 3), (21, 3), (3, 21)], 2.6) + circle(12, 12, 4.6), 'evenodd')
    L['instant'] = soft(rrect(4.5, 2.5, 15, 19, 2.4)) + solid(rrect(6.9, 4.9, 10.2, 10.2, 1.4))
    # Miniature: a little house, the near and the far out of focus.
    L['tilt'] = (solid(poly([(12, 6.6), (18, 11.4), (16.4, 11.4), (16.4, 16.8), (7.6, 16.8), (7.6, 11.4), (6, 11.4)], 1))
                 + line(polyline([(3, 3.6), (21, 3.6)]), 2.4, SOFT) + line(polyline([(3, 20.4), (21, 20.4)]), 2.4, SOFT))
    L['nightVision'] = (soft(circle(12, 12, 9.5)) + line(circle(12, 12, 4.6), 2.2) + line(polyline([(12, 2.8), (12, 6)]), 2.2) + line(polyline([(12, 18), (12, 21.2)]), 2.2)
                        + line(polyline([(2.8, 12), (6, 12)]), 2.2) + line(polyline([(18, 12), (21.2, 12)]), 2.2))
    L['popArt'] = soft(burst(13.4, 13.4, 9.4, 9, .68, .7)) + solid(burst(10.6, 10.6, 9.4, 9, .68, .7))
    L['poster'] = soft(rrect(4.5, 2.5, 15, 19, 2.2)) + solid(star(12, 10.6, 5.6, 5, .5, .7)) + line(polyline([(8.2, 18), (15.8, 18)]), 2)
    bolt = [(13.6, 2.6), (6.4, 13), (11.2, 13), (9.6, 21.4), (17.6, 10.4), (12.6, 10.4)]
    L['neon'] = line(poly(bolt, .8), 5.4, SOFT) + line(poly(bolt, .8), 2)
    L['thermal'] = (soft(f'M{pt(12.6, 2.2)}C{pt(13.6, 6.4)} {pt(19.6, 9)} {pt(19.6, 14.4)}A7.6 7.6 0 0 1 {pt(4.4, 14.4)}C{pt(4.4, 11.4)} {pt(6.2, 9.4)} {pt(8, 7.8)}C{pt(8.6, 9.8)} {pt(9.6, 10.6)} {pt(10.6, 10.6)}C{pt(10.4, 7.6)} {pt(10.8, 4.8)} {pt(12.6, 2.2)}Z')
                    + solid(drop(12, 16.6, 3.5)))
    # Funhouse mirror: a face pulled wide between two bowed sides.
    L['funhouse'] = (line(f'M{pt(4.2, 2.8)}Q{pt(7.6, 12)} {pt(4.2, 21.2)}', 2.2, SOFT) + line(f'M{pt(19.8, 2.8)}Q{pt(16.4, 12)} {pt(19.8, 21.2)}', 2.2, SOFT)
                     + dot(9.4, 9.2, 1.6) + dot(14.6, 9.2, 1.6) + line(f'M{pt(7.6, 13.4)}Q{pt(12, 19.4)} {pt(16.4, 13.4)}', 2.4))
    L['pocket'] = handheld(solid(rrect(7.6, 4.4, 8.8, 7.6, 1.4)))
    L['colourHandheld'] = handheld(solid(rrect(7.6, 4.4, 4.4, 3.8, 1)) + solid(rrect(12, 8.2, 4.4, 3.8, 1)) + soft(rrect(12, 4.4, 4.4, 3.8, 1)) + soft(rrect(7.6, 8.2, 4.4, 3.8, 1)))
    L['redVisor'] = (solid(rrect(2.4, 5.4, 19.2, 9.2, 3.2) + rrect(5, 7.8, 5.6, 4.4, 1.6) + rrect(13.4, 7.8, 5.6, 4.4, 1.6), 'evenodd')
                     + line(polyline([(12, 14.6), (12, 18.6)]), 2.2, SOFT) + line(polyline([(7.6, 20.2), (16.4, 20.2)]), 2.4, SOFT))
    L['eightBit'] = cartridge('8')
    L['snes'] = cartridge('16')
    L['thirtyTwoBit'] = cartridge('32')
    L['sixtyFourBit'] = cartridge('64')
    L['crt'] = k['80s']
    L['camcorder'] = soft(rrect(2.2, 6.4, 13.4, 11.6, 3)) + solid(poly([(15.6, 10.6), (21.4, 7), (21.4, 17.4), (15.6, 13.8)], 1.2)) + solid(circle(7.2, 10.6, 1.7))
    L['lines'] = line(polyline([(2.8, 17), (8.6, 7.4), (12.6, 14.2), (15.6, 10.2), (21.2, 17)]), 2.2) + line(polyline([(4, 20.8), (20, 20.8)]), 2, SOFT)
    L['sketchbook'] = (soft(rrect(5.4, 2.6, 15.6, 18.8, 2.4)) + dot(5.4, 6.6, 1.5) + dot(5.4, 12, 1.5) + dot(5.4, 17.4, 1.5)
                       + line(f'M{pt(9.6, 15.6)}Q{pt(11.4, 8)} {pt(13.2, 12.8)}T{pt(17, 9)}', 2))
    L['crayon'] = (soft(poly([(13.6, 4.8), (19.2, 10.4), (10, 19.6), (4.4, 14)], 1.4)) + solid(poly([(13.6, 4.8), (19.2, 10.4), (20.6, 5.2), (18.8, 3.4)], 1.1))
                   + solid(poly([(9.4, 9), (15, 14.6), (13.6, 16), (8, 10.4)], .5)))
    L['pencilManga'] = pencil() + dot(17, 17, 1.2) + dot(20.4, 14.6, 1.2) + dot(19.8, 19.6, 1.2)
    # Manga: a page of three panels.
    L['manga'] = (soft(rrect(3, 2.6, 18, 18.8, 2.2)) + solid(poly([(5.4, 5), (18.6, 5), (18.6, 9.4), (5.4, 12)], .8))
                  + solid(poly([(5.4, 14.2), (11, 13.1), (11, 19), (5.4, 19)], .8)) + solid(poly([(13.2, 12.7), (18.6, 11.6), (18.6, 19), (13.2, 19)], .8)))
    L['flat'] = soft(circle(9.4, 9.4, 6.8)) + solid(rrect(9.6, 9.6, 11.6, 11.6, 2.6))
    # Adventure Ink: a pen's nib.
    L['adventureInk'] = (solid(poly([(12, 2.4), (18, 11.4), (15, 17), (9, 17), (6, 11.4)], 1.3) + circle(12, 11.2, 1.6), 'evenodd')
                         + solid(rrect(8.6, 18.4, 6.8, 3.2, 1.2)))
    L['halftone'] = ''.join(solid(circle(4.6 + i * 7.4, 4.6 + j * 7.4, (1.1, 2.1, 3.2)[i])) for i in range(3) for j in range(3))
    L['goldenAge'] = soft(rrect(4, 2.6, 16, 18.8, 2.2)) + solid(rrect(6.4, 4.8, 11.2, 3, 1)) + solid(burst(12, 14.4, 4.8, 8, .62, .4))
    L['actionManga'] = (dot(5.6, 12, 2.6) + line(polyline([(10.4, 12), (21.4, 12)]), 2.2) + line(polyline([(9.6, 8.6), (20.6, 4.2)]), 2.2) + line(polyline([(9.6, 15.4), (20.6, 19.8)]), 2.2)
                        + line(polyline([(12.6, 5.2), (16.2, 2.8)]), 2, SOFT) + line(polyline([(12.6, 18.8), (16.2, 21.2)]), 2, SOFT))
    # Old cartoon: a reel of film.
    L['oldCartoon'] = (soft(circle(12, 12, 9.6)) + ''.join(solid(circle(*on(12, 12, 5.4, a), 2)) for a in (0, 90, 180, 270)) + dot(12, 12, 1.5))
    L['watercolour'] = solid(drop(12, 12.2, 5.6)) + soft(ellipse(12, 19.6, 8.6, 2.4))
    # Oil: a palette and three dabs.
    L['oil'] = (soft(f'M{pt(12, 3)}C{pt(18, 3)} {pt(21.6, 6.8)} {pt(21.6, 11.4)}C{pt(21.6, 14.6)} {pt(19.2, 15.6)} {pt(16.8, 15.2)}C{pt(14.6, 14.8)} {pt(13.6, 16.6)} {pt(14.6, 18.4)}C{pt(15.4, 20)} {pt(14, 21)} {pt(12, 21)}A9 9 0 0 1 {pt(12, 3)}Z')
                + dot(8, 8.4, 1.8) + dot(13.6, 7, 1.8) + dot(7, 14, 1.8))
    L['brushOil'] = brush()
    L['print'] = roller()
    # Stamp: a rubber stamp over its mark.
    L['stamp'] = solid(circle(12, 6, 3.6)) + solid(rrect(10.4, 7.6, 3.2, 6, .8)) + solid(rrect(4.4, 12.6, 15.2, 4.6, 1.8)) + line(polyline([(5.4, 20.6), (18.6, 20.6)]), 2.2, SOFT)
    # Blueprint: a sheet with a house drawn on it.
    L['cyanotype'] = soft(rrect(2.6, 3.6, 18.8, 16.8, 2.4)) + line(polyline([(7, 16.2), (7, 11.4), (12, 7.4), (17, 11.4), (17, 16.2), (7, 16.2)]), 1.9)
    # Riso: the two drums' inks, as they overprint.
    two = lambda a, b: ink(circle(9, 10, 6.4), a) + f'<path d="{circle(15, 14, 6.4)}" fill="{b}" opacity=".86"/>'
    L['riso'] = two('#ef6b65', '#5bb9b5')
    L['risoPinkBlue'] = two('#f46bb5', '#5f9fef')
    L['risoRedNavy'] = two('#e75b58', '#547199')
    L['risoBlackPink'] = two('#8d9096', '#ee7db8')
    L['risoThree'] = ink(circle(8.4, 8.6, 5.6), '#f4d66b') + f'<path d="{circle(15.6, 8.6, 5.6)}" fill="#e577b5" opacity=".86"/>' + f'<path d="{circle(12, 15.2, 5.6)}" fill="#6fa3e9" opacity=".86"/>'
    return L


def games():
    """The Game Room's signs: the room, and its three games."""
    card = lambda x, y, w=11, h=15: rrect(x, y, w, h, 2.2)
    g = {}
    # The room: a spade and a heart.
    g['room'] = solid(spade(7.6, 10.6, 4.4)) + solid(heart(16.8, 12.6, 4.6))
    # Memory: two cards, one turned.
    g['memory'] = soft(card(2.6, 5.6)) + solid(card(10.4, 3.4) + star(15.9, 10.9, 3.6, 5, .5, .5), 'evenodd')
    g['blackjack'] = soft(rrect(2.5, 2.5, 19, 19, 3.6)) + number('21', 7.3, 8, 8, 2.3)
    g['solitaire'] = soft(rrect(4, 2.5, 16, 19, 3)) + solid(spade(12, 10.6, 4.6))
    return g


def main():
    data = {'sprite': sprite(), 'kinds': kinds(), 'looks': looks(), 'games': games()}
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'ui-icons.json').write_text(json.dumps(data, indent=1, ensure_ascii=False) + '\n')
    symbols = ''.join(f'<symbol id="i-{name}" viewBox="0 0 24 24">{body}</symbol>' for name, body in data['sprite'].items())
    symbols += ''.join(f'<symbol id="{prefix}-{name}" viewBox="0 0 24 24">{body}</symbol>' for prefix, group in (('k', 'kinds'), ('l', 'looks'), ('g', 'games')) for name, body in data[group].items())
    (OUT / 'ui-icons.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg">{symbols}</svg>\n')
    print(f"{len(data['sprite'])} symbols, {len(data['kinds'])} kinds, {len(data['looks'])} looks, {len(data['games'])} game signs")


if __name__ == '__main__':
    main()
