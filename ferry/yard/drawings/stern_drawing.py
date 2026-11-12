#!/usr/bin/env python3
"""
JS3-304, the stern ramp: its arrangement, its hydraulics and its electrical installation, drawn from the numbers her
model is built from.

    python3 ferry/yard/drawings/stern_drawing.py     writes three sheets beside this file:
        JS3-304-stern-ramp-and-after-end.svg         sheet 1: the arrangement and the motion
        JS3-304-2-stern-ramp-hydraulics.svg          sheet 2: the hydraulic diagram and its parts
        JS3-304-3-stern-ramp-electrical.svg          sheet 3: the supply, the control circuit, the cables, the marked ends

The owner, 11 November 2026: "And lights , draw the aft in cad". And 12 November, of the ramp as first built: "make the
ramp more realistic its a simple system that could be animated much better, and hydraulics and a local control panel that
is wired up, with component list and proper wiring , as a place holder now, draw all feed to the engine room, but all ends
need to be marked so we know where to instal the Generators and electrical cabinets". And the owner's rule of the same
day: the drawing before the steel.

Revision 1 redraws the sheet for the 124.8 m ship (revision D of her arrangement); revision 0 drew the 68.4 m ship.
Every measure is read from ferry/blender/stern_place.py (the ramp and what works it), spec.py, lines.py and ga.py, and
every list from ferry/systems/stern.py: the same numbers the model and the register are built from. Nothing is measured
off the model and nothing is typed in here that the model does not also read. It stops if the mechanism does not hold.
"""
import os
import sys
from html import escape
from math import atan2, cos, degrees, hypot, radians, sin

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'blender'))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'systems'))
import ga as G
import lines as L
import spec as S
import stern_place as P
import stern as REG

bad = P.wrong()
if bad:
    raise SystemExit('JS3-304 is not drawn: the mechanism does not hold: ' + '; '.join(bad))

NUMBER, REVISION, DATE = 'JS3-304', '1', '12 November 2026'
K = 30.0                         # pixels to a metre, in every view of sheet 1
WIDTH = 1640
INK, PAPER, FAINT, WATER, DIM, AMBER, RED, GREEN, BLUE = '#22303a', '#fbfaf5', '#8b959b', '#2f6f74', '#5d6a72', '#b7791f', '#c2412f', '#2f9e5a', '#2f6fb7'
OIL = {'A': '#c2412f', 'B': '#2f6fb7', 'C': '#b7791f', 'D': '#2f9e5a', 'E': '#7a5aa6', 'P': '#c2412f', 'T': '#2f6fb7'}
out = []


def add(s):
    out.append(s)


def text(x, y, s, size=10.5, anchor='start', weight='400', fill=INK, extra=''):
    add(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}" fill="{fill}" {extra}>{escape(str(s))}</text>')


def line(x1, y1, x2, y2, w=1.0, c=INK, dash=''):
    add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="{w}" stroke-linecap="round"' + (f' stroke-dasharray="{dash}"' if dash else '') + '/>')


def poly(pts, fill='none', c=INK, w=1.0, dash='', close=True, opacity=None):
    tag = 'polygon' if close else 'polyline'
    add(f'<{tag} points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{fill}" stroke="{c}" stroke-width="{w}" stroke-linejoin="round"'
        + (f' stroke-dasharray="{dash}"' if dash else '') + (f' fill-opacity="{opacity}"' if opacity is not None else '') + '/>')


def rect(x0, y0, x1, y1, fill='none', c=INK, w=1.0, dash='', opacity=None):
    poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], fill, c, w, dash, opacity=opacity)


def circle(cx, cy, r, fill='none', c=INK, w=1.0, dash=''):
    add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" stroke="{c}" stroke-width="{w}"' + (f' stroke-dasharray="{dash}"' if dash else '') + '/>')


def wrap(s, n):
    words, lines, cur = str(s).split(), [], ''
    for w in words:
        if len(cur) + len(w) + 1 > n and cur:
            lines.append(cur)
            cur = w
        else:
            cur = (cur + ' ' + w).strip()
    return lines + ([cur] if cur else [])


def head(x, y, dx, dy, c=DIM):
    m = hypot(dx, dy) or 1
    dx, dy = dx / m, dy / m
    poly([(x, y), (x - 7 * dx + 2.2 * dy, y - 7 * dy - 2.2 * dx), (x - 7 * dx - 2.2 * dy, y - 7 * dy + 2.2 * dx)], c, c, 0.3)


def dim(x1, y1, x2, y2, label, off=-4, size=9.5, anchor='middle', at=0.5):
    line(x1, y1, x2, y2, 0.6, DIM)
    head(x1, y1, x1 - x2, y1 - y2)
    head(x2, y2, x2 - x1, y2 - y1)
    mx, my = x1 + (x2 - x1) * at, y1 + (y2 - y1) * at
    ang = degrees(atan2(y2 - y1, x2 - x1))
    if ang > 90 or ang < -90:
        ang += 180
    add(f'<text x="{mx:.1f}" y="{my + off:.1f}" font-size="{size}" text-anchor="{anchor}" fill="{DIM}" transform="rotate({ang:.1f} {mx:.1f} {my:.1f})">{escape(label)}</text>')


def balloon(n, x, y, tx, ty):
    m = hypot(tx - x, ty - y) or 1
    line(x + (tx - x) * 8.5 / m, y + (ty - y) * 8.5 / m, tx, ty, 0.6, DIM)
    circle(tx, ty, 1.5, DIM, DIM, 0.3)
    circle(x, y, 8.5, PAPER, INK, 0.9)
    text(x, y + 3.4, str(n), 9.5, 'middle', '700')


def table(x, y, cols, rows, widths, size=9.5, lead=14, head_fill='#e9e6dc'):
    """A table: its heads and rows, each column `widths` wide. Returns the y under it."""
    w = sum(widths)
    rect(x, y, x + w, y + lead + 3, head_fill, INK, 0.7)
    cx = x
    for c, cw in zip(cols, widths):
        text(cx + 4, y + lead - 1, c, size, weight='700')
        cx += cw
    y += lead + 3
    for row in rows:
        cells = [wrap(v, max(4, int(cw / (size * 0.56)))) for v, cw in zip(row, widths)]
        hgt = max(len(c) for c in cells) * (lead - 2) + 5
        cx = x
        for c, cw in zip(cells, widths):
            for i, s in enumerate(c):
                text(cx + 4, y + lead - 3 + i * (lead - 2), s, size)
            cx += cw
        line(x, y + hgt, x + w, y + hgt, 0.4, FAINT)
        y += hgt
    cx = x
    return y


def sheet(name, title, height):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {height:.0f}" width="{WIDTH}" height="{height:.0f}" font-family="DejaVu Sans, Helvetica, Arial, sans-serif">'
           f'<title>{escape(S.NAME)}: {escape(title)}, {NUMBER} revision {REVISION}</title>'
           f'<rect width="{WIDTH}" height="{height:.0f}" fill="{PAPER}"/>' + ''.join(out) + '</svg>')
    path = os.path.join(HERE, name)
    open(path, 'w').write(svg)
    print(f'{path}: {WIDTH} x {height:.0f}, {len(svg)} bytes')
    out.clear()


def heading(title, sub, note='Metres. Heights over the main deck; the design waterline is 1.0 m under it.'):
    text(64, 34, S.NAME, 26, weight='700')
    text(202, 34, f'{title}  ·  {NUMBER}  ·  revision {REVISION}  ·  {DATE}', 15, weight='600')
    text(64, 54, sub, 11.5, fill=FAINT)
    text(WIDTH - 24, 34, note, 11.5, 'end', fill=FAINT)


def foot(y, made='ferry/blender/stern_place.py, spec.py, lines.py, ga.py and ferry/systems/stern.py'):
    text(64, y, f'Made by ferry/yard/drawings/stern_drawing.py from {made} (arrangement revision {G.REVISION}): the numbers the model and the register are built from.', 10, fill=FAINT)
    text(WIDTH - 24, y, 'Not class-approved; not construction information.', 10, 'end', fill=FAINT)


LEAF, RAM, HINGE, FLAP, BOLT, HOOK, DOOR, LATCH = P.LEAF, P.RAM, P.HINGE, P.FLAP, P.BOLT, P.HOOK, P.DOOR, P.LATCH
CLOSED, LEVELLED, LOWEST = P.ram_length(0), P.ram_length(P.LEVEL), P.ram_length(P.LOWEST)

# =====================================================================================================================
# SHEET 1: the arrangement
# =====================================================================================================================
heading('Stern ramp: arrangement and motion, sheet 1 of 3',
        'Johansson Shipyard, newbuilding No. 1, the 124.8 m ro-ro freight ferry. Drawn before the steel, from the numbers her model is built from. '
        'Revision 0 drew the 68.4 m ship and is superseded.')
AX, AY = 64 + 13.4 * K, 108 + 11.5 * K            # view A: where the transom and the main deck are on the sheet
A = lambda inn, h: (AX + inn * K, AY - h * K)


def leaf_outline(angle):
    """The leaf's section along its length: roadway, tapered end, outer skin, foot."""
    pts = [(0, 0), (LEAF['length'], 0), (LEAF['length'], -LEAF['tip']), (LEAF['taper'], -P.DEPTH), (0, -P.DEPTH)]
    return [A(*P.on_leaf(s, t, angle)) for s, t in pts]


def flap_outline(angle, folded):
    """A flap's section: folded back over the roadway, or let down."""
    s0, t0 = FLAP['axis']
    if folded:
        pts = [(s0, 2 * t0), (s0 - FLAP['length'], 2 * t0), (s0 - FLAP['length'], 2 * t0 + FLAP['tip']), (s0, 2 * t0 + FLAP['root'])]
        return [A(*P.on_leaf(s, t, angle)) for s, t in pts]
    ai, ah = P.on_leaf(s0, t0, angle)
    a = radians(angle + FLAP['droop'])
    def at(d, t):                    # d along the flap from its hinge, t off its driving face (downward)
        return A(ai - d * sin(a) - (t0 + t) * cos(a), ah + d * cos(a) - (t0 + t) * sin(a))
    return [at(0, 0), at(FLAP['length'], 0), at(FLAP['length'], FLAP['tip']), at(0, FLAP['root'])]


def cylinder(angle, w=1.0, c=INK, dash='', fill=None):
    (pi_, ph), (ti, th) = P.ram_pin(angle), RAM['trunnion']
    n = hypot(pi_ - ti, ph - th)
    ux, uy = (pi_ - ti) / n, (ph - th) / n
    along = lambda d, off=0.0: A(ti + ux * d - uy * off, th + uy * d + ux * off)
    r = RAM['od'] / 2
    poly([along(RAM['cap'], r), along(RAM['barrel'], r), along(RAM['barrel'], -r), along(RAM['cap'], -r)], fill or 'none', c, w, dash)
    rr = RAM['rod'] / 2
    poly([along(RAM['barrel'], rr), along(n - RAM['eye'], rr), along(n - RAM['eye'], -rr), along(RAM['barrel'], -rr)], 'none', c, w * 0.8, dash)
    circle(*A(pi_, ph), RAM['eye'] * K * 0.6, 'none', c, w * 0.8, dash)
    return n


text(64, 96, 'A   PROFILE ON THE PORT CYLINDER, 4.25 m off the centreline, looking to port', 12, weight='700')
# the sea, the hull, the decks
line(A(-13.4, 0)[0], A(0, P.WATER_H)[1], A(0, 0)[0], A(0, P.WATER_H)[1], 0.9, WATER)
text(A(-13.2, 0)[0], A(0, P.WATER_H)[1] - 4, 'design waterline', 9, fill=WATER)
poly([A(0, -1.8), A(0, 0), A(8.6, 0)], close=False, w=1.6)                          # the transom under the sill, the main deck
poly([A(0, DOOR['height']), A(0, P.UPPER_H + L.BULWARK), A(0.05, P.UPPER_H + L.BULWARK)], close=False, w=1.6)      # the transom over the door, the stern bulwark
poly([A(0, P.UPPER_H), A(8.6, P.UPPER_H)], close=False, w=1.6)                      # the upper deck
line(*A(0, 0), *A(0, DOOR['height']), 0.7, FAINT, '5 4')                            # the door's opening
text(A(0.15, DOOR['height'] - 0.25)[0], A(0, DOOR['height'] - 0.25)[1], f'opening {DOOR["height"]:g} high', 8.5, fill=FAINT)
for yard in (1.2, 2.4, 4.8, 6.0):                                                   # the upper deck's beams
    rect(*A(yard - 0.02, P.UPPER_H - 0.012), *A(yard + 0.02, P.UPPER_H - 0.26), '#d7d3c6', FAINT, 0.4)
rect(*A(3.6 - 0.03, P.UPPER_H - 0.012), *A(3.6 + 0.03, P.WEB_H), '#c9c5b7', INK, 0.8)   # the web beam
text(A(3.75, P.WEB_H + 0.45)[0], A(0, P.WEB_H + 0.45)[1], 'web beam at 3.6 m', 8.5, fill=DIM)
# the mooring station's wall behind the cylinder, with its door
rect(*A(0.012, 0), *A(7.2, P.UPPER_H - 0.012), '#f1eee4', FAINT, 0.5, '2 3')
rect(*A(2.4, 0), *A(3.3, 2.05), PAPER, DIM, 0.7)
text(A(2.85, 2.2)[0], A(0, 2.2)[1], "mooring station's door", 8.5, 'middle', fill=DIM)
text(A(5.6, 3.2)[0], A(0, 3.2)[1], "port mooring station's wall", 8.5, 'middle', fill=FAINT)
# the leaf: raised, level, lowest
poly(leaf_outline(P.LOWEST), 'none', FAINT, 0.8, '5 3')
poly(flap_outline(P.LOWEST, False), 'none', FAINT, 0.8, '5 3')
poly(leaf_outline(P.LEVEL), '#e6efe9', INK, 1.0)
poly(flap_outline(P.LEVEL, False), '#d9e8df', INK, 0.9)
poly(leaf_outline(45), 'none', FAINT, 0.7, '2 3')
poly(leaf_outline(0), '#dde6ea', INK, 1.3)
poly(flap_outline(0, True), '#d9e8df', INK, 0.9)
text(A(-0.75, 9.2)[0], A(0, 9.2)[1], 'RAISED: the stern door', 9.5, 'end', '700')
text(A(-6.2, 0.55)[0], A(0, 0.55)[1], f'LEVEL ({P.LEVEL:g}°)', 9.5, 'middle', '700')
text(A(-9.6, -1.55)[0], A(0, -1.55)[1], f'lowest ({P.LOWEST:g}°): the flaps\' ends {P.flap_tip(P.LOWEST)[1] - P.WATER_H:+.2f} m from the water', 9, 'middle', fill=FAINT)
# the hinge
circle(*A(HINGE['inn'], HINGE['h']), 4, PAPER, INK, 1.0)
# the bracket, the lug, the cylinders
bx0, bx1 = P.BRACKET['long']
poly([A(bx0, P.WEB_H), A(bx1, P.WEB_H), A(bx1, P.BRACKET['foot'] + 0.12), A(RAM['trunnion'][0], P.BRACKET['foot']), A(bx0, P.BRACKET['foot'] + 0.12)], '#c9c5b7', INK, 0.9)
circle(*A(*RAM['trunnion']), 3.2, PAPER, INK, 1.0)
cylinder(P.LOWEST, 0.7, FAINT, '5 3')
cylinder(P.LEVEL, 1.0, INK, fill='#eef1ee')
cylinder(0, 1.2, INK, fill='#e3e8ea')
for a in (0, P.LEVEL):                                                              # the lug on the leaf
    (pi_, ph) = P.ram_pin(a)
    b0, b1 = P.on_leaf(RAM['pin'][1] - LEAF['foot'] - 0.2, 0, a), P.on_leaf(RAM['pin'][1] - LEAF['foot'] + 0.2, 0, a)
    poly([A(*b0), A(*b1), A(pi_, ph)], '#c9c5b7', INK, 0.8)
# the cleats: four bolts on the post, a hook at the head
for h in BOLT['h']:
    circle(*A(BOLT['inn'], h), 3.0, AMBER, INK, 0.6)
hp = HOOK['pivot']
poly([A(0.012, HOOK['hanger']), A(0.62, HOOK['hanger']), A(0.62, 4.88), A(0.40, 4.88), A(0.40, 5.22), A(0.012, 5.22)], '#c9c5b7', INK, 0.7)
poly([A(hp[0], hp[1] - 0.07), A(0.045, 4.90), A(0.045, 5.07), A(0.095, 5.07), A(0.095, 4.975), A(hp[0], hp[1] + 0.03)], AMBER, INK, 0.7)
circle(*A(*HOOK['pin']), 2.0, PAPER, INK, 0.8)
# the safety latch on the door post: its bracket, its arm with the tooth behind the striker, its handle
lb = LATCH['bracket']
rect(*A(lb[1], lb[3]), *A(lb[2], lb[4]), '#c9c5b7', INK, 0.6)
lp, lpin = LATCH['pivot'], LATCH['pin']
poly([A(LATCH['handle'], lp[1] - 0.015), A(LATCH['handle'], lp[1] + 0.015), A(lp[0] + 0.05, lp[1] + 0.03), A(0.12, lp[1] + 0.03), A(0.12, lpin[1] - 0.01), A(0.172, lpin[1] - 0.05),
      A(0.172, lp[1] - 0.03), A(lp[0] + 0.05, lp[1] - 0.03)], RED, INK, 0.6)
circle(*A(*lpin), 1.6, PAPER, INK, 0.7)
# the control stand
st = P.STAND
poly([A(st['inn'][0], 0), A(st['inn'][0], st['top'] + 0.14), A(st['inn'][1], st['top'] - 0.06), A(st['inn'][1], 0)], '#f0e2b8', INK, 0.9)
# the lines that go up the wall beside the door and cross over its head
for name in 'CDAB':
    line(*A(P.UP[name], P.line(name)[4]), *A(P.UP[name], P.CROSS[name]), 1.0, OIL[name])
    line(*A(P.UP[name], P.CROSS[name]), *A(S.SHELL + P.BANK_OFF, P.CROSS[name]), 1.0, OIL[name])
for name in 'ABCD':
    line(*A(7.2, P.line(name)[4]), *A(P.UP[name], P.line(name)[4]), 1.0, OIL[name])
for name in 'AB':
    line(*A(P.RAM_FEED['inn'][name], P.line(name)[4]), *A(P.RAM_FEED['inn'][name], P.RAM_FEED['h']), 1.0, OIL[name])
# measures
dim(*A(-11.0, -0.75), *A(-0.045, -0.75), f'{LEAF["length"]:g} m, hinge to end', off=12)
(pi_, ph) = P.ram_pin(0)
dim(*A(*RAM['trunnion']), *A(pi_, ph), f'{CLOSED:.2f} m raised', off=-22)
(pi_, ph) = P.ram_pin(P.LEVEL)
dim(*A(RAM['trunnion'][0] + 0.25, RAM['trunnion'][1] + 0.3), *A(pi_ + 0.25, ph + 0.3), f'{LEVELLED:.2f} m level: runs out {LEVELLED - CLOSED:.2f} m', off=-5, at=0.6)
line(*A(8.25, 0), *A(8.25, P.UPPER_H), 0.6, DIM)
dim(*A(8.25, 0), *A(8.25, P.UPPER_H), f'{P.UPPER_H:g} m', off=-5)
for n, (bx, by), (tx, ty) in ((1, (-2.6, 8.4), (-0.25, 7.6)), (2, (-1.6, -1.25), (HINGE['inn'], HINGE['h'])), (3, (2.6, 4.75), (1.9, 3.85)),
                             (4, (4.9, 6.15), (3.75, 5.5)), (5, (1.25, 1.55), (0.2, 2.2)), (6, (-2.4, 10.9), (0.07, 10.4)), (7, (1.35, 0.55), (BOLT['inn'], BOLT['h'][0])),
                             (8, (1.6, 5.9), (0.3, 5.0)), (10, (1.9, 0.9), (1.05, 0.8)), (14, (5.4, 2.85), (4.9, 2.4)), (16, (2.2, 1.75), (0.45, 1.2))):
    balloon(n, *A(bx, by), *A(tx, ty))

# ---- view B: from inside, looking aft
BX, BY = AX + 8.6 * K + 70 + 9.9 * K, AY
B = lambda x, h: (BX + x * K, BY - h * K)
text(BX - 9.9 * K, 96, 'B   THE DOOR FROM INSIDE, looking aft (port is to the right): the ramp raised and locked', 12, weight='700')
hb = L.half_breadth(L.Z(0.3))
poly([B(-hb, 0), B(hb, 0)], close=False, w=1.6)
poly([B(-hb, P.UPPER_H), B(hb, P.UPPER_H)], close=False, w=1.6)
for sgn in (1, -1):
    line(*B(sgn * hb, 0), *B(sgn * hb, P.UPPER_H), 1.6)
    rect(*B(sgn * P.WALL - 0.005, 0), *B(sgn * P.WALL + 0.005, P.UPPER_H - 0.012), INK, INK, 0.8)             # the stations' walls: the door posts
rect(*B(-DOOR['half'], 0), *B(DOOR['half'], DOOR['height']), '#dde6ea', INK, 1.2)                             # the raised leaf seen through the opening
rect(*B(-DOOR['half'] - P.SEAL['out'] - P.SEAL['wide'], 0), *B(DOOR['half'] + P.SEAL['out'] + P.SEAL['wide'], DOOR['height'] + P.SEAL['out'] + P.SEAL['wide']), 'none', FAINT, 0.7, '4 3')
k = 1
while LEAF['foot'] + LEAF['bars'][0] * k < LEAF['flat'][0]:                                                   # the non-slip bars
    yy = LEAF['foot'] + LEAF['bars'][0] * k
    line(*B(-LEAF['drive'] - 0.25, yy), *B(LEAF['drive'] + 0.25, yy), 0.35, FAINT)
    k += 1
for sgn in (1, -1):
    line(*B(sgn * LEAF['drive'], 0), *B(sgn * LEAF['drive'], LEAF['flat'][0]), 1.2, '#d1a51f')               # the driveway's line
    # the cylinder: from its bracket down to its lug
    x = sgn * RAM['x']
    rect(*B(x - P.BRACKET['cheek'][1], P.WEB_H), *B(x + P.BRACKET['cheek'][1], P.BRACKET['foot']), '#c9c5b7', INK, 0.8)
    rect(*B(x - RAM['od'] / 2, RAM['trunnion'][1] - 0.1), *B(x + RAM['od'] / 2, RAM['pin'][1] + 0.9), '#e3e8ea', INK, 1.0)
    rect(*B(x - RAM['rod'] / 2, RAM['pin'][1] + 0.9), *B(x + RAM['rod'] / 2, RAM['pin'][1]), 'none', INK, 0.8)
    rect(*B(x - RAM['lug'][1], RAM['pin'][1] - 0.22), *B(x + RAM['lug'][1], RAM['pin'][1] + 0.22), '#c9c5b7', INK, 0.8)
    for h in BOLT['h']:                                                                                       # the bolt cleats
        rect(*B(sgn * BOLT['keeper'][0], h - 0.09), *B(sgn * BOLT['keeper'][1], h + 0.09), '#c9c5b7', INK, 0.6)
        rect(*B(sgn * BOLT['tip'], h - 0.035), *B(sgn * BOLT['cyl'][0], h + 0.035), AMBER, INK, 0.6)
        rect(*B(sgn * BOLT['cyl'][0], h - 0.05), *B(sgn * BOLT['cyl'][1], h + 0.05), '#eadfc6', INK, 0.6)
    rect(*B(sgn * LATCH['lug'][0], LATCH['h'] - 0.08), *B(sgn * LATCH['lug'][1], LATCH['h'] + 0.08), '#c9c5b7', INK, 0.6)        # the safety latch: the leaf's lug, the arm, the bracket
    rect(*B(sgn * LATCH['x'][0], LATCH['h'] - 0.05), *B(sgn * LATCH['x'][1], LATCH['pivot'][1] + 0.03), RED, INK, 0.6)
    rect(*B(sgn * LATCH['bracket'][0], LATCH['bracket'][3]), *B(sgn * (P.WALL - 0.005), LATCH['bracket'][4]), '#c9c5b7', INK, 0.6)
    hx = sgn * HOOK['x']                                                                                      # the hook cleats
    rect(*B(hx - HOOK['cheek'][1], 4.88), *B(hx + HOOK['cheek'][1], HOOK['hanger']), '#c9c5b7', INK, 0.7)
    rect(*B(hx - HOOK['arm'], 4.90), *B(hx + HOOK['arm'], 5.07), AMBER, INK, 0.6)
    # the cleats' headers on the station's wall (behind it: dashed), and the two cylinder lines to the bracket
    for name in 'CD':
        line(*B(sgn * (P.WALL + 0.115 + (0.05 if name == 'D' else 0)), P.HEADER_FOOT), *B(sgn * (P.WALL + 0.115 + (0.05 if name == 'D' else 0)), P.CROSS[name]), 0.9, OIL[name], '4 2')
for name in 'ABCD':                                                                                           # the four lines over the door's head
    line(*B(-P.WALL - 0.115, P.CROSS[name]), *B(P.WALL + 0.115, P.CROSS[name]), 1.0, OIL[name])
for name, what, bore, r, h in P.LINES:                                                                        # the bank on the port station's wall
    line(*B(P.WALL + 0.065, h), *B(P.CASING, h), 0.9, OIL[name], '4 2')
rect(*B(st['x'][0], 0), *B(st['x'][1], st['top']), '#f0e2b8', INK, 0.9)
jb = P.JB['box']
rect(*B(jb[0], jb[4]), *B(jb[1], jb[5]), '#e8e8e2', INK, 0.7, '3 2')
dim(*B(-DOOR['half'], -0.45), *B(DOOR['half'], -0.45), f'opening {2 * DOOR["half"]:g} m', off=12)
dim(*B(-LEAF['drive'], 0.35), *B(LEAF['drive'], 0.35), f'clear driveway {2 * LEAF["drive"]:g} m, between the cylinders', off=-5)
for n, (bx, by), (tx, ty) in ((3, (3.2, 4.0), (RAM['x'] - 0.15, 3.7)), (4, (3.3, 6.05), (RAM['x'] - 0.2, 5.5)), (7, (-3.4, 1.5), (-BOLT['keeper'][0], 1.5)), (8, (1.3, 4.35), (2.15, 4.95)),
                             (9, (-5.5, 5.9), (-DOOR['half'] - 0.07, 5.3)), (10, (3.2, 1.3), (st['x'][0], 0.9)), (14, (6.4, 3.1), (6.0, 2.45)), (15, (5.5, 1.1), (jb[1], 1.6)), (16, (-3.3, 0.75), (-LATCH['x'][0], 1.12))):
    balloon(n, *B(bx, by), *B(tx, ty))
text(*B(0, 2.6), 'roadway', 10, 'middle', fill=FAINT)
text(*B(0, 5.42), 'A B C D cross to starboard over the door\'s head', 8.5, 'middle', fill=DIM)

# ---- view C: the plan at the main deck
CX, CY = AX, AY + 3.6 * K + 10.4 * K
C = lambda inn, x: (CX + inn * K, CY - x * K)
text(64, CY - 10.4 * K - 12, 'C   PLAN AT THE MAIN DECK (bow to the right, port up): the ramp level, the flaps down', 12, weight='700')
side = [C(yd, L.half_breadth(L.Z(yd))) for yd in [i * 0.6 for i in range(0, 24)]]
poly(side, close=False, w=1.6)
poly([(x, 2 * CY - y) for x, y in side], close=False, w=1.6)
for sgn in (1, -1):
    line(*C(0, sgn * DOOR["half"]), *C(0, sgn * L.half_breadth(L.Z(0))), 1.6)                                           # the transom each side of the door
    rect(*C(0, sgn * P.WALL - 0.005), *C(7.2, sgn * P.WALL + 0.005), INK, INK, 0.7)                                    # the stations' inboard walls
    line(*C(7.2, sgn * P.WALL), *C(7.2, sgn * L.half_breadth(L.Z(7.2))), 1.0)
    rect(*C(2.4, sgn * P.WALL - 0.03), *C(3.3, sgn * P.WALL + 0.03), PAPER, PAPER, 0.3)                                # their doors
    line(*C(7.2, sgn * P.CASING), *C(13.4, sgn * P.CASING), 1.0)
    # the cylinder, level
    (pi_, ph) = P.ram_pin(P.LEVEL)
    x = sgn * RAM['x']
    rect(*C(pi_, x - RAM['rod'] / 2), *C(RAM['trunnion'][0], x + RAM['rod'] / 2), 'none', INK, 0.7)
    rect(*C(RAM['trunnion'][0] - 2.9, x - RAM['od'] / 2), *C(RAM['trunnion'][0], x + RAM['od'] / 2), '#e3e8ea', INK, 0.9)
    rect(*C(P.BRACKET['long'][0], x - P.BRACKET['cheek'][1]), *C(P.BRACKET['long'][1], x + P.BRACKET['cheek'][1]), 'none', INK, 0.8)
line(*C(12.6, P.CASING), *C(12.6, L.half_breadth(L.Z(12.6))), 1.0)
rect(*C(9.4, P.CASING - 0.03), *C(10.3, P.CASING + 0.03), PAPER, PAPER, 0.3)
text(*C(3.6, 7.3), 'AFTER MOORING STATION, PORT', 9, 'middle', fill=FAINT)
text(*C(3.6, -7.3), 'AFTER MOORING STATION, STARBOARD', 9, 'middle', fill=FAINT)
text(*C(9.9, 9.95), 'HYDRAULIC PUMP ROOM', 9, 'middle', fill=FAINT)
text(*C(8.3, 5.9), 'room kept for the', 8, 'middle', fill=FAINT)
text(*C(8.3, 5.55), "cargo lift's power pack", 8, 'middle', fill=FAINT)
text(*C(6.0, 0.2), 'MAIN DECK: five lanes', 9, 'middle', fill=FAINT)
# the leaf level, its flaps, the driveway's lines
e0 = P.on_leaf(0, 0, P.LEVEL)[0]
e1 = P.on_leaf(LEAF['length'], 0, P.LEVEL)[0]
rect(*C(e1, -LEAF['half']), *C(e0, LEAF['half']), '#e6efe9', INK, 1.1)
ft = P.flap_tip(P.LEVEL)[0]
for x0, x1 in P.flap_xs():
    rect(*C(ft, x0), *C(e1 - 0.03, x1), '#d9e8df', INK, 0.7)
for sgn in (1, -1):
    line(*C(e1, sgn * LEAF['drive']), *C(e0, sgn * LEAF['drive']), 1.2, '#d1a51f')
    for hx in HINGE['at']:
        rect(*C(HINGE['inn'] - 0.06, sgn * hx - 0.05), *C(HINGE['inn'] + 0.06, sgn * hx + 0.05), INK, INK, 0.4)
# the power pack, the valve stand, the starter panel, the control stand
H = P.HPU
t = H['tank']
rect(*C(H['tray'][2], H['tray'][0]), *C(H['tray'][3], H['tray'][1]), 'none', FAINT, 0.6, '3 2')
rect(*C(t[2], t[0]), *C(t[3], t[1]), '#e8e8e2', INK, 1.0)
for px, py in H['pumps']:
    circle(*C(py, px), H['motor'][0] * K, '#d7dde0', INK, 0.9)
circle(*C(H['cleat_pump'][1], H['cleat_pump'][0]), H['cleat_motor'][0] * K, '#d7dde0', INK, 0.8)
c = H['cooler']
rect(*C(c[2], c[0]), *C(c[3], c[1]), '#d7dde0', INK, 0.8)
m = H['manifold']
rect(*C(m[2], m[0]), *C(m[3], m[1]), '#f0e2b8', INK, 0.9)
pb = P.PANEL['box']
rect(*C(pb[2], pb[0]), *C(pb[3], pb[1]), '#cfd8e6', INK, 0.9)
rect(*C(st['inn'][0], st['x'][0]), *C(st['inn'][1], st['x'][1]), '#f0e2b8', INK, 0.9)
rect(*C(jb[2], jb[0]), *C(jb[3], jb[1]), '#e8e8e2', INK, 0.7)
# every line as it is laid
for name, runs in P.routes().items():
    for run in runs:
        poly([C(q[1], q[0]) for q in run], close=False, c=OIL[name], w=1.0)
for n, (bi, bx), (ti, tx) in ((1, (-5.0, 2.6), (-5.0, 1.2)), (2, (-1.2, 6.0), (HINGE['inn'], HINGE['at'][2])), (6, (-12.6, 5.9), (-11.7, 4.2)), (10, (1.4, 2.9), (0.98, 4.1)),
                             (11, (11.5, 11.0), (11.5, 9.0)), (12, (10.4, 6.5), (11.3, 7.58)), (13, (13.2, 6.6), (12.44, 7.9)), (14, (5.3, 6.1), (5.3, 4.57)), (3, (2.0, 3.2), (1.9, 4.25)), (15, (1.6, 5.9), (1.0, 4.6))):
    balloon(n, *C(bi, bx), *C(ti, tx))
dim(*C(e1, -5.6), *C(e0, -5.6), f'{LEAF["length"]:g} m', off=12)
C_BOTTOM = CY + 10.4 * K

# ---- the motion, as a table
TX = AX + 13.6 * K + 30
ty = CY - 10.4 * K - 12
text(TX, ty, 'THE MOTION, by the control (0: raised and locked)', 12, weight='700')
rows = []
for v, what in ((0, 'raised, latched, cleats locked'), (P.CLEAT_RUN[1] * 0.6, 'latches lifted'), (P.CLEAT_RUN[1], 'cleats free'), (P.LEAF_FROM, 'the leaf starts'), (30, ''), (P.FLAP_RUN[0], 'the flaps start to fold out'),
                (60, ''), (P.FLAP_RUN[1], 'the flaps are down'), (P.LEVEL, 'level'), (P.LOWEST, 'lowest')):
    a = P.leaf_angle(v)
    f = P.ram_force(a)
    rows.append((f'{v:g}', f'{P.mapped(P.LATCH_MAP, v):.0f}°', f'{P.mapped(P.BOLT_MAP, v) * 1000:.0f} mm, {P.mapped(P.HOOK_MAP, v):.0f}°', f'{a:.1f}°', f'{P.mapped(P.FLAP_MAP, v):.0f}°', f'{P.ram_length(a):.3f}',
                 f'{P.ram_length(a) - CLOSED:.3f}', f'{P.ram_arm(a):.2f}', f'{f:.0f}', f'{f / P.ANNULUS / 100:.0f}', what))
ty = table(TX, ty + 8, ('control', 'latches', 'bolts, hooks', 'leaf', 'flaps', 'pin to pin m', 'run out m', 'arm m', 'kN each', 'bar', ''),
           rows, (48, 46, 80, 44, 40, 72, 60, 44, 52, 34, 170))
ty += 14
for s in wrap(f'The cylinders pull: the oil that carries the ramp is on their rod sides ({P.ANNULUS * 1e4:.0f} cm² each), where the load-holding valves are. '
              f'Weight taken as {LEAF["mass"]:g} t at half the leaf\'s length; no wind, no vehicle on it, no friction. Stroke {RAM["stroke"]:.2f} m, of which {LOWEST - CLOSED:.2f} m is used. '
              f'To raise it from its lowest takes {P.ANNULUS * (LOWEST - CLOSED) * 2000:.0f} litres: {P.ANNULUS * (LOWEST - CLOSED) * 2000 / 200 * 60:.0f} s with both pumps, '
              f'{P.ANNULUS * (LOWEST - CLOSED) * 2000 / 100 * 60:.0f} s with one. On the page it is worked at {P.RATE:g} of the control a second.', 118):
    text(TX, ty, s, 9.5, fill=DIM)
    ty += 12.5

# ---- the parts
ty += 16
text(TX, ty, 'PARTS', 12, weight='700')
PARTS = (
    (1, 'Leaf', f'A box girder {LEAF["length"]:g} x {2 * LEAF["half"]:g} m, {P.DEPTH:.2f} m deep, tapered over its last {LEAF["length"] - LEAF["taper"]:.1f} m; non-slip bars on the roadway inside the opening; flat where it meets the seal. RMP-01'),
    (2, 'Hinges', f'Six: a lug of the ship in a slot of the leaf\'s foot at {", ".join(f"{h:g}" for h in HINGE["at"])} m each side; one pin of {2000 * HINGE["pin"]:.0f} mm. RMP-02'),
    (3, 'Cylinders', f'Two, bore {1000 * RAM["bore"]:.0f}, rod {1000 * RAM["rod"]:.0f}, stroke {RAM["stroke"]:.2f} m, each with a load-holding valve and two hoses. RMP-03, RMP-04'),
    (4, 'Trunnion brackets', 'Two cheeks under the web beam at 3.6 m, tied to the mooring station\'s wall.'),
    (5, 'Lugs on the leaf', f'{RAM["pin"][1]:.1f} m from the hinge; they stand in through the opening when the ramp is raised.'),
    (6, 'End flaps', f'{FLAP["n"]} of {FLAP["width"]:g} x {FLAP["length"]:g} m, folded back over the roadway when stowed. RMP-05'),
    (7, 'Bolt cleats', f'Eight, four a side at {", ".join(f"{h:g}" for h in BOLT["h"])} m: a {1000 * BOLT["d"]:.0f} mm bolt through the door post into a keeper on the leaf. RMP-11 to RMP-18'),
    (8, 'Hook cleats', f'Two at the door\'s head, {HOOK["x"]:g} m each side. RMP-19, RMP-20'),
    (9, 'Seal', 'Rubber, on the transom round the opening\'s sides and head. RMP-06'),
    (10, 'Control stand', 'On the main deck beside the door, port: pump buttons, the lever, stop, lamps. RMP-30'),
    (11, 'Power pack HPU-R', 'Tank of 1,500 l, two pumps of 37 kW, the cleats\' pump, cooler, filters, hand pump. HYD-01 to HYD-08'),
    (12, 'Valve stand', 'Three lever valves with solenoids, on the hydraulic room\'s inboard wall. HYD-10'),
    (13, 'Starter panel RSP', 'On the hydraulic room\'s forward wall. ELD-51 (sheet 3)'),
    (14, 'Pipe bank', 'A, B (cylinders, 30 mm), C, D (cleats, 18 mm) and the control stand\'s conduit E: level runs in one layer, upright runs in a second.'),
    (15, 'Junction box', 'The fourteen position switches, behind the control stand. RMP-31'),
    (16, 'Safety latches', f'One on each door post at {LATCH["h"]:.1f} m: an arm whose tooth falls by its own weight behind a striker on the leaf; no oil holds it. Lifted {LATCH["swing"]:g}° by a small cylinder, or by its handle; a pin for the sea. RMP-34, RMP-35'),
)
for n, name, what in PARTS:
    ty += 19
    circle(TX + 9, ty - 3.5, 8.5, PAPER, INK, 0.9)
    text(TX + 9, ty, str(n), 9.5, 'middle', '700')
    text(TX + 26, ty, name, 10.5, weight='700')
    for i, s in enumerate(wrap(what, 96)):
        text(TX + 150, ty + i * 12.5, s, 9.5)
    ty += 12.5 * (len(wrap(what, 96)) - 1)
ty += 26
text(TX, ty, 'NOT SETTLED', 12, weight='700')
OPEN = (
    'The leaf\'s own scantlings, its pins and the seating of the brackets on the web beam are not calculated: 55 t is the design basis\'s estimate.',
    'The quays she lies at, their heights and the tide are not known. 4° under the level is all her freeboard at the stern allows at her design draught.',
    f'Clear driveway {2 * LEAF["drive"]:g} m in an opening of {2 * DOOR["half"]:g} m: the cylinders stand inside the opening. Two trailers abreast pass; three do not.',
    'The lights of the after end (the sternlight NLT-06, two floodlights, the red and green signal) are as revision 0 placed them (spec.STERN_LIGHTS); the floodlights and the signal have no circuit yet.',
    'The ramp cover over the fixed ramp, which the same power pack is to work, is not built.',
)
for i, s in enumerate(OPEN):
    ty += 5
    for j, part in enumerate(wrap(s, 122)):
        ty += 12.5
        if j == 0:
            text(TX, ty, f'{i + 1}', 9.5, weight='700', fill=DIM)
        text(TX + 16, ty, part, 9.5)
y = max(C_BOTTOM, ty) + 36
for i in range(5):
    rect(64 + i * K, y, 64 + (i + 1) * K, y + 5, INK if i % 2 == 0 else PAPER, INK, 0.7)
    text(64 + i * K, y + 17, str(i), 9, 'middle', fill=DIM)
text(64 + 5 * K, y + 17, '5 m', 9, 'middle', fill=DIM)
text(64 + 5 * K + 26, y + 7, 'All three views at this scale.', 10, fill=DIM)
foot(y + 34)
sheet(f'{NUMBER}-stern-ramp-and-after-end.svg', 'Stern ramp: arrangement and motion', y + 48)

# =====================================================================================================================
# SHEET 2: the hydraulic diagram
# =====================================================================================================================
heading('Stern ramp: hydraulic diagram, sheet 2 of 3',
        'How the oil goes. Drawn with every valve at rest and the ramp raised and locked. Line A (red) carries the ramp: it is the cylinders\' rod side.',
        'Pressures in bar. Pipe sizes: outside diameter x wall, mm.')


def pump(x, y, tag, r=15):
    circle(x, y, r, PAPER, INK, 1.2)
    poly([(x, y - r), (x - 5, y - r + 9), (x + 5, y - r + 9)], INK, INK, 0.5)
    text(x - r - 5, y + 4, tag, 9.5, 'end', '700')


def motor(x, y, tag, kw, r=13):
    circle(x, y, r, PAPER, INK, 1.2)
    text(x, y + 4, 'M', 10, 'middle', '700')
    text(x + r + 5, y - 1, tag, 9.5, weight='700')
    text(x + r + 5, y + 10, kw, 8.5, fill=DIM)


def check(x, y, up=True):
    """A non-return valve in an upright line: free upward."""
    circle(x, y, 4.5, PAPER, INK, 1.0)
    d = -1 if up else 1
    poly([(x - 6, y - d * 6.5), (x, y - d * 1.0), (x + 6, y - d * 6.5)], close=False, w=1.0)


def filt(x, y, tag):
    poly([(x, y - 12), (x + 12, y), (x, y + 12), (x - 12, y)], PAPER, INK, 1.1)
    line(x - 12, y, x + 12, y, 0.8, INK, '3 2')
    text(x + 16, y + 4, tag, 9.5, weight='700')


def cooler(x, y, tag):
    poly([(x, y - 13), (x + 13, y), (x, y + 13), (x - 13, y)], PAPER, INK, 1.1)
    head(x - 13, y, -1, 0, INK)
    head(x + 13, y, 1, 0, INK)
    line(x - 17, y, x + 17, y, 0.8)
    text(x + 22, y + 4, tag, 9.5, weight='700')


def relief(x, y, tag, bar):
    rect(x - 11, y - 11, x + 11, y + 11, PAPER, INK, 1.1)
    line(x - 5, y + 11, x - 5, y - 11, 0.9)
    head(x - 5, y - 11, 0, -1, INK)
    poly([(x + 11, y - 6), (x + 16, y - 3), (x + 11, y), (x + 16, y + 3), (x + 11, y + 6)], close=False, w=0.9)
    text(x + 21, y - 1, tag, 9.5, weight='700')
    text(x + 21, y + 10, bar, 8.5, fill=DIM)


def gauge(x, y, tag):
    circle(x, y, 8, PAPER, INK, 1.0)
    line(x - 4, y + 4, x + 4, y - 4, 0.9)
    head(x + 4, y - 4, 1, -1, INK)
    text(x + 12, y + 4, tag, 8.5, fill=DIM)


def tank(x, y, w=26):
    poly([(x - w / 2, y - 9), (x - w / 2, y), (x + w / 2, y), (x + w / 2, y - 9)], close=False, w=1.2)


def valve43(x, y, tag, name, centre='closed'):
    """A four-way, three-position valve, lever and two solenoids, drawn at its middle position. (x, y) is its middle box's centre."""
    s = 30
    for i in (-1, 0, 1):
        rect(x + i * s - s / 2, y - s / 2, x + i * s + s / 2, y + s / 2, PAPER, INK, 1.1)
    # left box: straight; right box: crossed; the middle: its centre
    for dx in (-8, 8):
        line(x - s + dx, y + s / 2, x - s + dx, y - s / 2, 0.8)
    head(x - s - 8, y - s / 2, 0, -1, INK)
    head(x - s + 8, y + s / 2, 0, 1, INK)
    line(x + s - 8, y + s / 2, x + s + 8, y - s / 2, 0.8)
    line(x + s + 8, y + s / 2, x + s - 8, y - s / 2, 0.8)
    if centre == 'closed':
        for dx in (-8, 8):
            for yy, d in ((y - s / 2, 1), (y + s / 2, -1)):
                line(x + dx, yy, x + dx, yy + d * 7, 0.9)
                line(x + dx - 3, yy + d * 7, x + dx + 3, yy + d * 7, 0.9)
    else:                                      # work ports open to the tank: the load-holding valves shut, the cleats' lines unloaded
        line(x - 8, y - s / 2, x - 8, y + 2, 0.9)
        line(x + 8, y - s / 2, x + 8, y + 2, 0.9)
        line(x - 8, y + 2, x + 8, y + 2, 0.9)
        line(x + 8, y + 2, x + 8, y + s / 2, 0.9)
        line(x - 8, y + s / 2, x - 8, y + s / 2 - 6, 0.9)
        line(x - 11, y + s / 2 - 6, x - 5, y + s / 2 - 6, 0.9)
    for sx in (-1, 1):                         # a solenoid each end, and the hand lever
        rect(x + sx * (1.5 * s), y - 8, x + sx * (1.5 * s + 14), y + 8, PAPER, INK, 1.0)
        line(x + sx * (1.5 * s), y + 8, x + sx * (1.5 * s + 14), y - 8, 0.8)
    line(x + 1.5 * s + 14, y - 2, x + 1.5 * s + 30, y - 16, 1.2)
    circle(x + 1.5 * s + 31, y - 17, 3, INK, INK, 0.5)
    text(x - 1.5 * s - 20, y - 2, tag, 10, 'end', '700')
    text(x - 1.5 * s - 20, y + 10, name, 8.5, 'end', fill=DIM)
    text(x - 1.5 * s - 3, y - 12, 'a', 8, 'end', fill=DIM)
    text(x + 1.5 * s + 3, y + 18, 'b', 8, fill=DIM)


def cyl(x, y, tag, w=120, h=26, rod_out=40, name=''):
    """A cylinder lying level, its rod to the left. Returns its two ports: (rod side, piston side)."""
    rect(x, y - h / 2, x + w, y + h / 2, PAPER, INK, 1.2)
    rect(x + w * 0.55, y - h / 2, x + w * 0.55 + 7, y + h / 2, INK, INK, 0.6)
    rect(x - rod_out, y - 3.5, x + w * 0.55, y + 3.5, '#d7dde0', INK, 0.9)
    circle(x - rod_out - 5, y, 5, PAPER, INK, 1.0)
    text(x + w + 8, y + 4, tag, 10, weight='700')
    text(x - rod_out, y - h / 2 - 22, name, 8.5, fill=DIM)
    return (x + w * 0.2, y + h / 2), (x + w * 0.85, y + h / 2)


def holding(x, y, tag):
    """A load-holding (over-centre) valve in the rod side's line, with its free-return non-return valve, piloted from the other line."""
    rect(x - 13, y - 11, x + 13, y + 11, PAPER, INK, 1.1)
    line(x - 6, y + 11, x - 6, y - 11, 0.9)
    head(x - 6, y + 11, 0, 1, INK)
    poly([(x - 13, y - 6), (x - 18, y - 3), (x - 13, y), (x - 18, y + 3), (x - 13, y + 6)], close=False, w=0.9)
    circle(x + 6, y, 3.5, PAPER, INK, 0.9)
    poly([(x + 1, y + 5), (x + 6, y + 1), (x + 11, y + 5)], close=False, w=0.9)
    text(x - 22, y + 4, tag, 9, 'end', '700')


# ---- the layout: the tank along the foot; pumps; the pressure line P across; the valves; the consumers at the top
Y_TANK, Y_PUMP, Y_P, Y_VALVE, Y_LINE, Y_CYL = 880, 790, 640, 500, 380, 200
XP1, XP2, XP3, XHP = 150, 300, 450, 600
RX, CXV, SX = 520, 940, 1300               # the ramp's valve, the cleats' valve, the spare
PC, TC = OIL['P'], OIL['T']
line(90, Y_TANK, 1560, Y_TANK, 1.4)
text(96, Y_TANK + 16, 'TANK  1,500 litres   ·   level glass   ·   LS1 level low   ·   TS1 temperature high   ·   breather and filler   ·   drain cock   ·   drip tray under', 9.5, fill=DIM)
for x, tag, mtag, kw, q in ((XP1, 'P1', 'M1', '37 kW', '100 l/min'), (XP2, 'P2', 'M2', '37 kW', '100 l/min'), (XP3, 'P3', 'M3', '4 kW', '8 l/min')):
    line(x, Y_TANK, x, Y_PUMP + 15, 1.2, TC)
    pump(x, Y_PUMP, tag)
    line(x + 15, Y_PUMP, x + 42, Y_PUMP, 1.0)
    motor(x + 55, Y_PUMP, mtag, kw)
    text(x - 20, Y_PUMP + 16, q, 8.5, 'end', fill=DIM)
    line(x, Y_PUMP - 15, x, Y_P if x != XP3 else Y_P + 60, 1.4, PC)
    check(x, Y_PUMP - 50)
line(XHP, Y_TANK, XHP, Y_PUMP + 15, 1.2, TC)
pump(XHP, Y_PUMP, 'HP1')
line(XHP + 15, Y_PUMP - 8, XHP + 44, Y_PUMP - 28, 1.4)
text(XHP + 48, Y_PUMP - 26, 'hand pump', 8.5, fill=DIM)
line(XHP, Y_PUMP - 15, XHP, Y_P + 60, 1.4, PC)
check(XHP, Y_PUMP - 50)
# the main pressure line P (the two main pumps) and the cleats' pressure line (the small pump and the hand pump)
line(XP1, Y_P, RX + 8, Y_P, 1.6, PC)
line(XP3, Y_P + 60, CXV + 8, Y_P + 60, 1.4, PC)
line(XHP, Y_P + 60, XHP, Y_P, 1.0, PC, '5 3')
text(XHP + 6, Y_P + 34, 'change-over cock: the hand pump to the ramp', 8, fill=DIM)
filt(380, Y_P, 'F1 pressure filter, 10 micron, clogging lamp')
gauge(210, Y_P - 26, 'PG1  0 to 400')
line(210, Y_P, 210, Y_P - 18, 0.8)
line(240, Y_P, 240, Y_P + 70, 1.0, PC)
relief(240, Y_P + 82, 'RV1', '210 bar')
line(240, Y_P + 93, 240, Y_TANK, 1.0, TC)
line(700, Y_P + 60, 700, Y_P + 110, 1.0, PC)
relief(700, Y_P + 122, 'RV2', '160 bar')
line(700, Y_P + 133, 700, Y_TANK, 1.0, TC)
text(100, Y_P - 8, 'P  30 x 4', 9, weight='700', fill=PC)
text(XP3 + 10, Y_P + 54, 'P cleats  18 x 2.5', 9, weight='700', fill=PC)
# the return line T, through the cooler and the return filter
Y_T = Y_VALVE + 110
line(RX - 8, Y_T, 1480, Y_T, 1.4, TC)
line(1480, Y_T, 1480, Y_TANK, 1.4, TC)
cooler(1480, Y_T + 70, 'C1 oil cooler, fan M4 1.1 kW')
filt(1480, Y_T + 150, 'F2 return filter, 25 micron')
text(1380, Y_T - 6, 'T  35 x 3', 9, weight='700', fill=TC)
# the three valves on the valve stand
for vx, tag, name, centre in ((RX, 'V1', 'ramp', 'float'), (CXV, 'V2', 'cleats', 'float'), (SX, 'V3', 'ramp cover (spare)', 'closed')):
    valve43(vx, Y_VALVE, tag, name, centre)
    line(vx + 8, Y_VALVE + 15, vx + 8, Y_P if vx == RX else Y_P + 60 if vx == CXV else Y_VALVE + 40, 1.4, PC)
    line(vx - 8, Y_VALVE + 15, vx - 8, Y_T, 1.4, TC)
line(SX + 8, Y_VALVE + 40, SX + 8, Y_P, 1.0, PC, '5 3')
line(RX + 8, Y_P, SX + 8, Y_P, 1.0, PC, '5 3')
text(SX + 60, Y_VALVE + 46, 'plugged until the ramp cover is built', 8.5, fill=DIM)
rect(RX - 150, Y_VALVE - 46, SX + 110, Y_VALVE + 30, 'none', FAINT, 0.7, '6 4')
text(RX - 146, Y_VALVE - 52, 'VALVE STAND, on the hydraulic pump room\'s inboard wall (HYD-10): each valve by its solenoids from the control stand, or by its lever here', 9, fill=DIM)
# ---- the ramp: lines A and B to the two cylinders
AC, BC = OIL['A'], OIL['B']
line(RX - 8, Y_VALVE - 15, RX - 8, Y_LINE, 1.6, AC)
line(RX + 8, Y_VALVE - 15, RX + 8, Y_LINE + 40, 1.6, BC)
gauge(RX - 38, Y_VALVE - 70, '')
line(RX - 8, Y_VALVE - 70, RX - 30, Y_VALVE - 70, 0.8)
text(RX - 50, Y_VALVE - 66, 'PG2', 8.5, 'end', fill=DIM)
gauge(RX + 38, Y_VALVE - 70, 'PG3')
line(RX + 8, Y_VALVE - 70, RX + 30, Y_VALVE - 70, 0.8)
rect(RX + 2, Y_VALVE - 112, RX + 14, Y_VALVE - 96, PAPER, INK, 1.0)
line(RX + 2, Y_VALVE - 96, RX + 14, Y_VALVE - 112, 0.9)
text(RX + 20, Y_VALVE - 100, 'TV1 lowering speed: throttle with free return', 8.5, fill=DIM)
line(190, Y_LINE, 850, Y_LINE, 1.6, AC)
line(250, Y_LINE + 40, 910, Y_LINE + 40, 1.6, BC)
text(196, Y_LINE - 6, 'A  30 x 4   rod sides: raises and holds', 9, weight='700', fill=AC)
text(700, Y_LINE + 56, 'B  30 x 4   piston sides: lowers', 9, weight='700', fill=BC)
for cx, tag, hv, side in ((150, 'CYL-P', 'LH1', 'port cylinder, RMP-03'), (810, 'CYL-S', 'LH2', 'starboard cylinder, RMP-04')):
    rod, piston = cyl(cx, Y_CYL, tag, 150, 34, 60, f'{side}: bore {1000 * RAM["bore"]:.0f}, rod {1000 * RAM["rod"]:.0f}, stroke {RAM["stroke"]:.2f} m')
    line(rod[0], rod[1], rod[0], Y_LINE, 1.6, AC)
    holding(rod[0], Y_CYL + 70, hv)
    line(piston[0], piston[1], piston[0], Y_LINE + 40, 1.6, BC)
    line(rod[0] + 13, Y_CYL + 70, piston[0], Y_CYL + 70, 0.7, INK, '3 3')
    for px in (rod[0], piston[0]):                             # the hoses between the pipes and the cylinder, which swings
        poly([(px - 5, Y_CYL + 118), (px + 5, Y_CYL + 124), (px - 5, Y_CYL + 130), (px + 5, Y_CYL + 136)], close=False, w=1.0)
text(480, Y_CYL + 74, 'LH1, LH2: load-holding valves bolted to the cylinders, set 250 bar,', 8.5, fill=DIM)
text(480, Y_CYL + 86, 'opened by the pressure in line B: a burst hose or pipe does not drop the ramp', 8.5, fill=DIM)
text(480, Y_CYL + 128, 'hoses at each trunnion', 8.5, fill=DIM)
# ---- the cleats: lines C and D to ten small cylinders
CC, DC = OIL['C'], OIL['D']
line(CXV - 8, Y_VALVE - 15, CXV - 8, Y_LINE - 60, 1.4, CC)
line(CXV + 8, Y_VALVE - 15, CXV + 8, Y_LINE - 30, 1.4, DC)
line(CXV - 8, Y_LINE - 60, 1540, Y_LINE - 60, 1.4, CC)
line(CXV + 8, Y_LINE - 30, 1540, Y_LINE - 30, 1.4, DC)
text(1130, Y_LINE - 66, 'C  18 x 2.5   lock', 9, weight='700', fill=CC)
text(1130, Y_LINE - 16, 'D  18 x 2.5   let go', 9, weight='700', fill=DC)
for i, (cx, tag, name) in enumerate(((1040, 'BC1 to BC4', 'bolt cleats, port'), (1160, 'BC5 to BC8', 'bolt cleats, starboard'), (1280, 'HC1, HC2', 'hook cleats'), (1400, 'LC1, LC2', 'latches (line D only)'))):
    rect(cx, Y_CYL + 40, cx + 70, Y_CYL + 62, PAPER, INK, 1.1)
    rect(cx + 38, Y_CYL + 40, cx + 43, Y_CYL + 62, INK, INK, 0.5)
    rect(cx - 22, Y_CYL + 48, cx + 38, Y_CYL + 54, '#d7dde0', INK, 0.8)
    line(cx + 14, Y_CYL + 62, cx + 14, Y_LINE - 30, 1.2, DC)
    if not tag.startswith('LC'):
        line(cx + 58, Y_CYL + 62, cx + 58, Y_LINE - 60, 1.2, CC)
    text(cx + 24, Y_CYL + 30, tag, 9.5, 'middle', '700')
    text(cx + 24, Y_CYL + 18, name, 8.5, 'middle', fill=DIM)
    circle(cx - 26, Y_CYL + 51, 5, PAPER, INK, 0.9)
    text(cx - 26, Y_CYL + 54, 'S', 7, 'middle', fill=DIM)
text(1040, Y_CYL + 84, 'each fed by hoses from the headers; S: its position switch', 8.5, fill=DIM)
rect(RX - 30, Y_VALVE - 152, RX + 340, Y_VALVE - 126, '#f6efe0', AMBER, 0.8)
text(RX - 24, Y_VALVE - 135, 'INTERLOCK: V1 lowers only with both latches and all ten cleats away (S)', 8.5, weight='700', fill=AMBER)
# ---- the parts of the diagram
ty = Y_TANK + 46
text(64, ty, 'PARTS OF THE DIAGRAM', 12, weight='700')
HPARTS = [
    ('P1, P2', 'Main pumps', 'Axial piston, fixed, 100 l/min at 210 bar, under M1, M2 of 37 kW on the tank\'s lid', 'HYD-02, HYD-03'),
    ('P3', 'Cleat pump', 'Gear, 8 l/min at 160 bar, under M3 of 4 kW', 'HYD-04'),
    ('HP1', 'Hand pump', 'About 20 cm³ a stroke: the cleats; the ramp through the change-over cock', 'HYD-08'),
    ('RV1, RV2', 'Relief valves', '210 bar on the main line; 160 bar on the cleats\' line', 'HYD-06'),
    ('F1, F2', 'Filters', 'Pressure, 10 micron; return, 25 micron, each with a clogging switch', 'HYD-06, HYD-07'),
    ('C1', 'Oil cooler', 'Air-blast, fan M4 of 1.1 kW, in the return line', 'HYD-05'),
    ('PG1 to PG3', 'Gauges', 'Main pressure at the tank; lines A and B at the valve stand', 'HYD-06, HYD-10'),
    ('V1', 'Ramp valve', 'Four-way, three positions, spring-centred; middle: A and B to the tank (the load-holding valves shut)', 'HYD-10'),
    ('V2', 'Cleat valve', 'Four-way, three positions, detented: lock, middle, let go', 'HYD-10'),
    ('V3', 'Spare valve', 'For the ramp cover over the fixed ramp; its ports are plugged', 'HYD-10'),
    ('TV1', 'Throttle', 'In line B at the valve stand: sets the lowering speed', 'HYD-10'),
    ('LH1, LH2', 'Load-holding valves', 'Over-centre, bolted to each cylinder\'s rod-side port, set 250 bar, piloted from line B', 'RMP-03, RMP-04'),
    ('CYL-P, CYL-S', 'Ramp cylinders', f'Bore {1000 * RAM["bore"]:.0f}, rod {1000 * RAM["rod"]:.0f}, stroke {RAM["stroke"]:.2f} m; at most {P.ram_force(max(range(int(P.LEAF_FROM), int(P.LOWEST) + 1), key=P.ram_force)):.0f} kN each', 'RMP-03, RMP-04'),
    ('BC1 to BC8', 'Bolt cleat cylinders', f'Bore 80, stroke {1000 * BOLT["travel"]:.0f} mm, each with a position switch', 'RMP-11 to RMP-18'),
    ('HC1, HC2', 'Hook cleat cylinders', 'Bore 50, stroke 110 mm, each with a position switch', 'RMP-19, RMP-20'),
    ('LC1, LC2', 'Safety latch cylinders', 'Single-acting, bore 32, stroke 80 mm, on line D: oil lifts the latch, its own weight brings it back; no oil holds the ramp', 'RMP-34, RMP-35'),
    ('LS1, TS1', 'Tank switches', 'Level low; temperature high: to the alarm relay in the starter panel', 'HYD-01'),
]
ty = table(64, ty + 8, ('Tag', 'What', 'Size and setting', 'Register'), HPARTS[:8], (96, 130, 410, 120))
_right = table(64 + 786, Y_TANK + 54, ('Tag', 'What', 'Size and setting', 'Register'), HPARTS[8:], (96, 130, 400, 120))
ty = max(ty, _right)
ty += 20
text(64, ty, 'PIPES, as they are laid (sheet 1)', 12, weight='700')
routes = P.routes()
rows = []
for p in REG.PIPES:
    name = p['id'][-1]
    length = sum(hypot(hypot(a[0] - b[0], a[1] - b[1]), a[2] - b[2]) for run in routes[name] for a, b in zip(run, run[1:]))
    rows.append((p['id'], p['name'], p['material'], f'{length:.0f} m', f"{sum(1 for c in P.clamps() if c[0] == name)}"))
ty = table(64, ty + 8, ('Pipe', 'What', 'Material', 'Length', 'Clamps'), rows, (70, 300, 190, 70, 60))
foot(ty + 60 if ty + 60 > 1330 else 1330)
sheet(f'{NUMBER}-2-stern-ramp-hydraulics.svg', 'Stern ramp: hydraulic diagram', (ty + 60 if ty + 60 > 1330 else 1330) + 18)

# =====================================================================================================================
# SHEET 3: the electrical installation
# =====================================================================================================================
heading('Stern ramp: electrical installation, sheet 3 of 3',
        'From where the generating sets are to stand to the last terminal of the control stand. What is not installed is drawn broken and its place is marked in the model.',
        'Cable sizes in mm² of copper. Places: metres to port, from the transom, above the keel.')
import register as REGISTER
data, problems, notes = REGISTER.build()
if problems:
    raise SystemExit('JS3-304 sheet 3 is not drawn: the register does not hold: ' + '; '.join(problems[:4]))
rsp = next(b for b in data['boards'] if b['id'] == 'RSP')
fd = rsp['feeder']
# ---- the one-line diagram
text(64, 96, 'ONE-LINE DIAGRAM', 12, weight='700')
YB, YM, YT, YP, YR, YW, YL = 150, 240, 300, 380, 480, 560, 640       # generators, the 690 V bars, transformers, the 440 V bars, the panel's bars, its ways, the loads
BROKEN = '6 4'
for i, tag in enumerate(('DG1', 'DG2', 'DG3')):
    x = 170 + i * 150
    circle(x, YB, 20, PAPER, INK, 1.2, BROKEN)
    text(x, YB + 4, 'G', 12, 'middle', '700')
    text(x, YB - 28, tag, 10.5, 'middle', '700')
    text(x + 26, YB - 4, '320 kW', 8.5, fill=DIM)
    text(x + 26, YB + 8, '690 V', 8.5, fill=DIM)
    line(x, YB + 20, x, YM, 1.2, INK, BROKEN)
    rect(x - 5, YM - 34, x + 5, YM - 22, PAPER, INK, 1.0)
    text(x + 10, YM - 24, f'W-GEN-0{i + 1}', 8, fill=DIM)
line(110, YM, 560, YM, 3.0, INK, '10 4')
text(566, YM + 4, 'MSB  690 V  (place marked: main switchboard room)', 10, weight='700')
for i, tag in enumerate(('T1', 'T2')):
    x = 250 + i * 160
    line(x, YM, x, YT - 14, 1.2, INK, BROKEN)
    circle(x, YT - 5, 11, PAPER, INK, 1.1, BROKEN)
    circle(x, YT + 9, 11, 'none', INK, 1.1, BROKEN)
    text(x + 16, YT - 2, tag, 10, weight='700')
    text(x + 16, YT + 10, '690/440 V, 800 kVA', 8.5, fill=DIM)
    line(x, YT + 20, x, YP, 1.2, INK, BROKEN)
line(110, YP, 560, YP, 3.0, INK, '10 4')
text(566, YP + 4, 'PSB  440 V section  (place marked: main switchboard room)', 10, weight='700')
XF = 330
line(XF, YP, XF, YR, 1.6)
rect(XF - 6, YP + 16, XF + 6, YP + 30, PAPER, INK, 1.1)
text(XF + 12, YP + 28, f'{fd["breaker"]} A', 9, weight='700')
text(XF + 12, YP + 52, f'W-RMP-01   {fd["cable"]}   {fd["length"]:g} m   {fd["amps"]:.0f} A   {fd["drop"]:.1f} %', 9, fill=DIM)
text(XF + 12, YP + 64, 'the end at the PSB is tagged and left coiled at its place', 8.5, fill=AMBER)
line(110, YR, 900, YR, 3.0)
text(560, YR - 9, 'RSP  stern ramp starter panel, hydraulic pump room (ELD-51)', 10, weight='700')
rect(XF - 8, YR - 26, XF + 8, YR - 10, PAPER, INK, 1.1)
line(XF - 8, YR - 10, XF + 8, YR - 26, 1.0)
text(XF + 14, YR - 14, 'Q0 isolator 160 A', 9, fill=DIM)
for i, k in enumerate(rsp['circuits']):
    x = 170 + i * 165
    line(x, YR, x, YL - 22, 1.2)
    rect(x - 5, YR + 14, x + 5, YR + 26, PAPER, INK, 1.0)
    text(x + 10, YR + 24, f'{k["breaker"]} A', 8.5, weight='700')
    if k['no'] in (1, 2):
        rect(x - 16, YW - 14, x + 16, YW + 14, PAPER, INK, 1.0)
        text(x, YW + 4, 'Y / D', 9, 'middle', '700')
    elif k['no'] == 5:
        circle(x, YW - 6, 9, PAPER, INK, 1.0)
        circle(x, YW + 6, 9, 'none', INK, 1.0)
    else:
        rect(x - 8, YW - 8, x + 8, YW + 8, PAPER, INK, 1.0)
    if k['no'] < 5:
        circle(x, YL, 20, PAPER, INK, 1.2)
        text(x, YL + 4, 'M', 12, 'middle', '700')
    else:
        rect(x - 20, YL - 18, x + 20, YL + 18, PAPER, INK, 1.2)
        text(x, YL + 4, '24 V', 9, 'middle', '700')
    text(x, YL + 36, f'way {k["no"]}', 9, 'middle', '700')
    for j, s in enumerate(wrap(k['name'], 26)):
        text(x, YL + 48 + j * 11, s, 8.5, 'middle', fill=DIM)
    text(x, YL + 84, f'{k["watts"] / 1000:.1f} kW  {k["amps"]:.1f} A', 8.5, 'middle')
    text(x, YL + 95, f'{k["cable"].replace(" + earth", "")}  {k["length"]:g} m  {k["drop"]:.1f} %', 8.5, 'middle', fill=DIM)
ty = YL + 124
text(64, ty, f'Connected {rsp["load"]["connected"] / 1000:.1f} kW. A breaker is at least 1.25 times the full-load current; a cable is rated for its breaker; no cable loses more than 5 % (the register\'s rule, checked by ferry/systems/register.py).', 9.5, fill=DIM)

# ---- the starter panel's parts and the cables, beside the diagram
RXT = 1030
text(RXT, 96, 'IN THE STARTER PANEL (its door opens on them in the model)', 12, weight='700')
py = table(RXT, 104, ('Tag', 'What', 'Rating'), REG.PANEL_PARTS, (96, 310, 170))
py += 22
text(RXT, py, 'WHERE THE FEEDS END: the places marked in the machinery spaces', 12, weight='700')
rows = []
for e in P.ENDS:
    x0, x1, a, b = e['box']
    pt = P.end_point(e['tag'])
    rows.append((e['tag'], REG.MARK[e['tag']], f"{e['name'].title()}, {e['line']}", f"{x0:+.2f} to {x1:+.2f}", f"{a:.2f} to {b:.2f}", f"{e['floor']:.1f}", f"{pt[0]:+.2f}, {pt[1]:.2f}, {pt[2]:.2f}"))
py = table(RXT, py + 8, ('Tag', 'Register', 'What is to stand there', 'to port', 'from transom', 'floor', 'cables end at'), rows, (40, 56, 190, 86, 84, 36, 96))
py += 12
for s in wrap('Each place has a yellow outline on its floor, a sign with its tag, and the tagged ends of the cables that are to be landed on it. The places and sizes are the machinery design '
              'basis\'s (sections 1.2, 2.3, 2.4): a proposal. Nothing of the switchboards, transformers or generating sets is built.', 108):
    text(RXT, py, s, 9.5, fill=DIM)
    py += 12.5

# ---- the control circuit: the stand's terminal strip
ty += 30
text(64, ty, 'CONTROL CIRCUIT, 24 V: the control stand\'s terminal strip X1 (cable W-RMP-10, 16 x 1.5 mm², in conduit E with the pipes)', 12, weight='700')
ty = table(64, ty + 8, ('X1', 'What', 'Goes to', 'Core'), [(str(n), what, to, str(core)) for n, what, to, core in REG.STAND_TERMINALS], (36, 300, 300, 44))
ty += 16
for s in wrap('How it works. T10 in the starter panel makes 24 V. PUMP 1 and PUMP 2 at the stand each pull in a star-delta starter (K1, K2), which holds itself and lights the button; '
              'STOP opens the circuit of both starters and of both solenoids of V1. The lever is spring-centred: RAISE energises V1 a, LOWER energises V1 b, and only while a main pump\'s '
              'auxiliary contact is closed; LOWER also needs relay KA1 (both latches and all ten cleats away). The cleats\' valve V2 is worked with the ramp\'s sequence: let go before lowering, lock when '
              'the two door switches say the leaf is home. The safety latches need no circuit to hold: each falls in by its own weight. KA2 (all fourteen switches home) lights LOCKED and goes to the bridge.', 150):
    text(64, ty, s, 9.5, fill=DIM)
    ty += 12.5

# ---- the cable schedule
ty2 = max(py + 26, YL + 154)
text(RXT, ty2, 'CABLES', 12, weight='700')
ty2 = table(RXT, ty2 + 8, ('Cable', 'From', 'To', 'Cores and size', 'What'), REG.CABLES, (70, 110, 132, 130, 146), size=8.8)
y = max(ty, ty2) + 40
foot(y, 'ferry/systems/stern.py and the register (ferry/systems/register.py), ferry/blender/stern_place.py')
sheet(f'{NUMBER}-3-stern-ramp-electrical.svg', 'Stern ramp: electrical installation', y + 18)

print('  ' + '\n  '.join(P.report()))
