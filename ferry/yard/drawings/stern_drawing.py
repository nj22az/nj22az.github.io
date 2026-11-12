#!/usr/bin/env python3
"""
JS3-304, the stern ramp and the after end: drawn from the numbers her model is built from.

    python3 ferry/yard/drawings/stern_drawing.py     writes JS3-304-stern-ramp-and-after-end.svg beside this file

The owner, 11 November 2026: "And lights , draw the aft in cad".

Three views at one scale, set out as a draughtsman sets them: the transom seen from astern, the profile on the centreline
beside it at the same heights, and the plan at the car deck under the profile at the same lengths. Then the ramp's motion
as a table, the lights, the parts and what is not settled.

Every measure is read from ferry/blender/lines.py (her form), spec.py (STERN_DOOR, STERN_RAMP, STERN_LIGHTS, her gear) and
ga.py (her spaces): the same numbers steel.py builds the model from. Nothing is measured off the model and nothing is
typed in here that the model does not also read. Change the ship there and draw again.
"""
import os
import sys
from html import escape
from math import atan2, cos, degrees, hypot, radians, sin, tan

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'blender'))
import ga as G
import lines as L
import spec as S

# SUPERSEDED, 12 November 2026. Revision 0 of this sheet draws the after end of the 68.4 m ship (revision C of her general
# arrangement). She is a ro-ro freight ferry of 124.8 m now (revision D): her stern ramp is a box girder 9.4 m wide and 11 m
# long with its hinge line at the sill, her decks have other names and heights, and what follows reads figures that are no
# longer in spec.py (CAR_DECK, PASSENGER_DECK, BAND). The sheet is to be redrawn for revision D; until then this stops
# here, so that nobody takes a drawing of the old ship for the new one.
raise SystemExit('JS3-304 is superseded: it draws the 68.4 m ship. Not yet redrawn for revision D (ferry/yard/document-register.csv).')

NUMBER, TITLE, REVISION, DATE = 'JS3-304', 'Stern ramp and after end', '0', '11 November 2026'
K = 32.0                         # pixels to a metre, in every view
WIDTH = 1640
INK, PAPER, FAINT, WATER, DIM, AMBER, RED, GREEN = '#22303a', '#fbfaf5', '#8b959b', '#2f6f74', '#5d6a72', '#b7791f', '#c2412f', '#2f9e5a'
out = []

# ---- the ship's numbers
Z0 = -L.HALF                                         # the transom, in the model's z
CAR, UP = S.CAR_DECK, S.PASSENGER_DECK
RAIL = UP + L.BULWARK
D, R, Q = S.STERN_DOOR, S.STERN_RAMP, S.STERN_LIGHTS
HY, HZ = R['hinge']                                  # the hinge: over the waterline, and inside the transom
TY, TZ = R['trunnion']                               # the cylinder's foot pin
LEN = CAR + R['head'] - HY                           # from the hinge to the ramp's end
MID = (R['thick'][0] + R['thick'][1]) / 2            # the middle of the ramp's depth, inside the transom when raised
DEEP = R['thick'][1] - R['thick'][0]
ROAD = HY + DEEP / 2                                 # the roadway of the ramp when it lies level
SPACE = {sp['id']: sp for sp in G.SPACES}               # the arrangement's spaces, by their names there
CLEAR = 2 * (R['ram_x'] - R['column'] / 2)             # the roadway between the two cylinders' pedestals
QUAY_FACE = -(LEN - HZ) + 0.60                       # the ramp's end lies 0.6 m in on the quay (an assumption: no quay is given)


def turned(h, inside, angle):
    """A point of the ramp (height over the waterline, metres inside the transom) with the ramp lowered `angle` degrees."""
    a = radians(angle)
    u, w = h - HY, HZ - inside                       # up from the hinge, and aft of it
    return HY + u * cos(a) - w * sin(a), HZ - (u * sin(a) + w * cos(a))


def pins(angle):
    """The cylinder between its pins with the ramp lowered `angle` degrees: its length, and where the rod's pin is."""
    py, pz = turned(R['pin'][0], R['pin'][1], angle)
    return hypot(py - TY, pz - TZ), (py, pz)


def lever(angle):
    """How far the cylinder's line passes from the hinge: the arm its force turns the ramp by."""
    length, (py, pz) = pins(angle)
    return abs((py - HY) * (TZ - pz) - (pz - HZ) * (TY - py)) / length


def frange(a, b, step):
    n = int(round((b - a) / step))
    return [a + (b - a) * i / n for i in range(n + 1)]


# ---- the sheet
def add(s):
    out.append(s)


def text(x, y, s, size=10.5, anchor='start', weight='400', fill=INK, extra=''):
    add(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}" fill="{fill}" {extra}>{escape(s)}</text>')


def line(x1, y1, x2, y2, w=1.0, c=INK, dash=''):
    add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="{w}"' + (f' stroke-dasharray="{dash}"' if dash else '') + '/>')


def poly(pts, fill='none', c=INK, w=1.0, dash='', close=True, opacity=None):
    tag = 'polygon' if close else 'polyline'
    add(f'<{tag} points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{fill}" stroke="{c}" stroke-width="{w}" stroke-linejoin="round"'
        + (f' stroke-dasharray="{dash}"' if dash else '') + (f' fill-opacity="{opacity}"' if opacity is not None else '') + '/>')


def rect(x0, y0, x1, y1, fill='none', c=INK, w=1.0, dash=''):
    poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], fill, c, w, dash)


def circle(cx, cy, r, fill='none', c=INK, w=1.0, dash=''):
    add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" stroke="{c}" stroke-width="{w}"' + (f' stroke-dasharray="{dash}"' if dash else '') + '/>')


def wrap(s, n):
    words, lines, cur = s.split(), [], ''
    for w in words:
        if len(cur) + len(w) + 1 > n and cur:
            lines.append(cur)
            cur = w
        else:
            cur = (cur + ' ' + w).strip()
    return lines + ([cur] if cur else [])


def head(x, y, dx, dy):
    """An arrowhead with its point at (x, y), looking along (dx, dy)."""
    m = hypot(dx, dy)
    dx, dy = dx / m, dy / m
    poly([(x, y), (x - 7 * dx + 2.2 * dy, y - 7 * dy - 2.2 * dx), (x - 7 * dx - 2.2 * dy, y - 7 * dy + 2.2 * dx)], DIM, DIM, 0.3)


def dim(x1, y1, x2, y2, label, off=-4, size=9.5, anchor='middle', at=0.5):
    """A measure between two points of the sheet, with its figure beside the line."""
    line(x1, y1, x2, y2, 0.6, DIM)
    head(x1, y1, x1 - x2, y1 - y2)
    head(x2, y2, x2 - x1, y2 - y1)
    mx, my = x1 + (x2 - x1) * at, y1 + (y2 - y1) * at
    if abs(x2 - x1) >= abs(y2 - y1):
        text(mx, my + off, label, size, anchor, fill=DIM)
    else:
        add(f'<text x="{mx + off:.1f}" y="{my:.1f}" font-size="{size}" text-anchor="{anchor}" fill="{DIM}" transform="rotate(-90 {mx + off:.1f} {my:.1f})">{escape(label)}</text>')


def witness(x1, y1, x2, y2):
    line(x1, y1, x2, y2, 0.4, DIM)


def balloon(n, x, y, tx, ty):
    """A part's number in a ring at (x, y), with a leader to the part at (tx, ty)."""
    m = hypot(tx - x, ty - y)
    line(x + (tx - x) * 8.5 / m, y + (ty - y) * 8.5 / m, tx, ty, 0.6, DIM)
    circle(tx, ty, 1.5, DIM, DIM, 0.3)
    circle(x, y, 8.5, PAPER, INK, 0.9)
    text(x, y + 3.4, str(n), 9.5, 'middle', '700')


add('<defs><pattern id="quay" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#a9b1b5" stroke-width="0.8"/></pattern></defs>')

# ---------------------------------------------------------------------------------------------------------------------
# the heading
# ---------------------------------------------------------------------------------------------------------------------
LEFT = 64
text(LEFT, 34, S.NAME, 26, weight='700')
text(LEFT + 138, 34, f'{TITLE}: arrangement, hydraulics, lights  ·  {NUMBER}  ·  revision {REVISION}  ·  {DATE}', 15, weight='600')
text(LEFT, 54, 'Johansson Shipyard, newbuilding No. 1, rebuilt at 68 m for Johansson Line.  Drawn from the numbers her model is built from. A working drawing of what is built; no force, weight or rule is calculated here.', 11.5, fill=FAINT)
text(WIDTH - 24, 34, 'Metres. Heights over the design waterline.', 11.5, 'end', fill=FAINT)

TOP = 134
BASE = TOP + 9.3 * K                                 # the waterline on the sheet, in views A and B
AX = 166 + 7.3 * K                                   # the centreline of view A
Y0, Y1 = -6.6, 9.0                                   # view B and C: metres from the transom, aft negative
BX0 = AX + 7.3 * K + 46
LIST = BX0 + (Y1 - Y0) * K + 36


def H(h):
    return BASE - h * K


def XA(x):
    return AX - x * K                                # seen from astern, port is to the left


def XB(yard):
    return BX0 + (yard - Y0) * K                     # the stern to the left, the bow to the right


KEEL0 = L.keel_y(Z0)
HB0 = L.upper_breadth(Z0)
FLOOD, STERNLIGHT, SIGNAL = Q['floods'], Q['sternlight'], Q['signal']
T = radians(FLOOD['tilt'])
LENS = (STERNLIGHT['y'] + 0.04, STERNLIGHT['y'] + 0.17)          # the sternlight's glass, as steel.py draws it
BEAM_AT = FLOOD['aft'] + (FLOOD['y'] - ROAD) / tan(T)            # where the middle of a floodlight's beam meets the level of the ramp, aft of the transom

# ---------------------------------------------------------------------------------------------------------------------
# A: the transom, seen from astern
# ---------------------------------------------------------------------------------------------------------------------
text(XA(7.3), TOP - 26, 'A   THE TRANSOM, SEEN FROM ASTERN', 12, weight='700')
text(XA(7.3), TOP - 12, 'Port to the left. What stands on the upper deck forward of the stern is left out.', 9.5, fill=FAINT)
# the levels, named once at the left: views A and B stand on the same heights
for h, name in ((RAIL, "bulwark's rail"), (UP, 'upper deck'), (CAR + D['height'], "door's head"), (CAR, 'car deck'), (0.0, 'waterline'), (L.KEEL, 'base line')):
    line(XA(7.3) - 12, H(h), XA(7.3) + 2, H(h), 0.6, FAINT)
    text(XA(7.3) - 16, H(h) + 3, f"{name}  {h:+.2f}" if h else f'{name}  0.00', 9, 'end', fill=DIM)
    line(XA(7.3) + 2, H(h), XA(-7.3), H(h), 0.3, '#c9cfd2', '2 5')
# her greatest section, beyond: the body widens and deepens forward of the transom
ys = frange(L.KEEL, CAR, 0.05)
half = [(L.hull_x(y, 0.0), y) for y in ys] + [(L.HB, UP)]
poly([(XA(x), H(y)) for x, y in half] + [(XA(-x), H(y)) for x, y in reversed(half)], '#ffffff', FAINT, 0.7)
# the transom: the lower body's end, the topsides, the bulwark across the stern
ys = frange(KEEL0, CAR, 0.03)
half = [(L.hull_x(y, Z0), y) for y in ys] + [(HB0, RAIL)]
poly([(XA(x), H(y)) for x, y in half] + [(XA(-x), H(y)) for x, y in reversed(half)], '#ffffff', INK, 1.6)
below = [(L.hull_x(y, Z0), y) for y in frange(KEEL0, S.BOOT, 0.03)]
poly([(XA(x), H(y)) for x, y in below] + [(XA(-x), H(y)) for x, y in reversed(below)], '#ead9d2', 'none', 0)                    # the antifouling, to the boot top
rect(XA(HB0), H(UP - S.BAND_TOP), XA(-HB0), H(UP - S.BAND), '#9fc1c1', 'none', 0)                                                 # the teal band
poly([(XA(x), H(y)) for x, y in half] + [(XA(-x), H(y)) for x, y in reversed(half)], 'none', INK, 1.6)
line(XA(HB0), H(UP), XA(-HB0), H(UP), 0.8)                                                                                          # the upper deck's edge: the bulwark's foot
line(XA(7.25), H(0), XA(-8.2), H(0), 0.9, WATER)
# her name and port of registry, as they are painted under the door
text(AX, H(1.04), S.NAME, 0.44 * K * 1.32, 'middle', '700', extra='letter-spacing="2"')
text(AX, H(0.53), S.PORT_OF_REGISTRY, 0.26 * K * 1.32, 'middle', '600', extra='letter-spacing="1.5"')
# the stern door's opening and the ramp raised in it
rect(XA(D['half']), H(CAR + D['height']), XA(-D['half']), H(CAR), '#dfe5e2', INK, 1.4)
rect(XA(R['half']), H(CAR + R['head']), XA(-R['half']), H(CAR + R['foot']), '#ffffff', INK, 1.0)
line(XA(D['half'] + 0.35), H(HY), XA(-D['half'] - 0.35), H(HY), 0.6, INK, '9 3 2 3')                                              # the hinge's axis
# behind the ramp: the two cylinders on their pedestals
for sgn in (1, -1):
    x = sgn * R['ram_x']
    rect(XA(x + R['column'] / 2), H(TY + R['column_over']), XA(x - R['column'] / 2), H(CAR), 'none', INK, 0.7, '4 3')
    line(XA(x), H(TY), XA(x), H(R['pin'][0]), 2.2, INK, '4 3')
# the lights
rail_clip = lambda x, w: rect(XA(x + w / 2), H(RAIL + 0.02), XA(x - w / 2), H(RAIL - 0.10), INK, INK, 0.5)
rail_clip(0.0, 0.12)
rect(XA(0.13), H(STERNLIGHT['y'] + 0.25), XA(-0.13), H(STERNLIGHT['y']), '#ffffff', INK, 0.8)                                     # the screen forward of it
rect(XA(0.07), H(STERNLIGHT['y'] + 0.21), XA(-0.07), H(STERNLIGHT['y']), INK, INK, 0.5)
rect(XA(0.062), H(LENS[1]), XA(-0.062), H(LENS[0]), '#fff6d6', INK, 0.5)
w, h, d = FLOOD['head']
tall = (h * cos(T) + d * sin(T)) / 2                                                                                                # half the tilted head's height, seen from astern
for sgn in (1, -1):
    x = sgn * FLOOD['x']
    rail_clip(x, 0.10)
    line(XA(x), H(RAIL + 0.02), XA(x), H(FLOOD['y'] - tall), 1.6)
    rect(XA(x + w / 2), H(FLOOD['y'] + tall), XA(x - w / 2), H(FLOOD['y'] - tall), '#d9dedc', INK, 0.9)
    rect(XA(x + w / 2 - 0.02), H(FLOOD['y'] + tall - 0.05), XA(x - w / 2 + 0.02), H(FLOOD['y'] - tall + 0.02), '#fff6d6', INK, 0.5)
w, h, d = SIGNAL['size']
x = SIGNAL['x']
rect(XA(x + w / 2), H(SIGNAL['y'] + h), XA(x - w / 2), H(SIGNAL['y']), INK, INK, 0.6)
rect(XA(x + w / 2 + 0.04), H(SIGNAL['y'] + h + 0.02), XA(x - w / 2 - 0.04), H(SIGNAL['y'] + h), INK, INK, 0.6)
circle(XA(x), H(SIGNAL['y'] + 0.42), 0.09 * K, RED, INK, 0.4)
circle(XA(x), H(SIGNAL['y'] + 0.16), 0.09 * K, GREEN, INK, 0.4)
# under water: the two rudders, and the screws' discs before them
for sgn in (1, -1):
    x = sgn * S.SHAFT_X
    circle(XA(x), H(S.SCREW['y']), S.SCREW['diameter'] / 2 * K, 'none', INK, 0.7, '5 3')
    rect(XA(x + S.RUDDER['thickness'] / 2), H(S.RUDDER['top']), XA(x - S.RUDDER['thickness'] / 2), H(S.RUDDER['bottom']), '#ffffff', INK, 1.0)
    line(XA(x), H(S.RUDDER['top']), XA(x), H(L.hull_y(abs(x), Z0)), 1.4)
line(AX, H(RAIL + 0.75), AX, H(L.KEEL - 0.25), 0.5, INK, '14 3 2 3')                                                                # the centreline
text(AX + 4, H(L.KEEL - 0.25) + 2, 'CL', 8.5, fill=DIM)
# measures
dim(XA(D['half']), H(CAR + 3.62), XA(-D['half']), H(CAR + 3.62), f"{2 * D['half']:.2f} clear")
dim(XA(1.75), H(CAR), XA(1.75), H(CAR + D['height']), f"{D['height']:.2f} clear", at=0.42)
dim(XA(HB0), H(RAIL + 1.12), XA(-HB0), H(RAIL + 1.12), f'{2 * HB0:.2f} at the transom')
for sgn in (1, -1):
    witness(XA(sgn * HB0), H(RAIL + 0.1), XA(sgn * HB0), H(RAIL + 1.2))
    witness(XA(sgn * L.HB), H(L.KEEL + 0.6), XA(sgn * L.HB), H(L.KEEL - 0.62))
dim(XA(L.HB), H(L.KEEL - 0.52), XA(-L.HB), H(L.KEEL - 0.52), f'{L.BEAM:.2f} at her greatest section, beyond', off=12)
dim(XA(0), H(RAIL + 0.62), XA(FLOOD['x']), H(RAIL + 0.62), f"{FLOOD['x']:.2f}")
dim(XA(0), H(RAIL + 0.62), XA(-FLOOD['x']), H(RAIL + 0.62), f"{FLOOD['x']:.2f}")
text(XA(-8.2), H(0) - 4, 'design waterline', 9, 'end', fill=WATER)
# the parts' numbers
balloon(1, XA(-4.55), H(5.55), XA(-D['half']), H(CAR + D['height'] - 0.35))
balloon(2, XA(-0.9), H(3.2), XA(-1.6), H(2.75))
balloon(3, XA(4.5), H(1.25), XA(D['half'] + 0.3), H(HY))
balloon(4, XA(4.6), H(3.05), XA(R['ram_x']), H((TY + R['pin'][0]) / 2))
balloon(5, XA(4.6), H(2.2), XA(R['ram_x'] + R['column'] / 2), H(CAR + 0.35))
balloon(6, XA(-1.05), H(RAIL - 0.55), XA(-0.07), H(STERNLIGHT['y'] + 0.06))
balloon(7, XA(5.0), H(RAIL - 0.55), XA(FLOOD['x'] + 0.16), H(FLOOD['y'] - 0.05))
balloon(8, XA(-5.0), H(3.6), XA(SIGNAL['x'] - 0.15), H(SIGNAL['y'] + 0.2))
balloon(9, XA(4.2), H(-1.35), XA(S.SHAFT_X + 0.09), H(-1.6))
balloon(10, XA(4.6), H(-2.5), XA(S.SHAFT_X + 0.72), H(-2.7))

# ---------------------------------------------------------------------------------------------------------------------
# B: the profile on the centreline
# ---------------------------------------------------------------------------------------------------------------------
text(XB(Y0), TOP - 26, 'B   PROFILE ON THE CENTRELINE', 12, weight='700')
text(XB(Y0), TOP - 12, 'The stern to the left. The ramp raised, level, and at its lowest (dashed); the cylinder raised and level.', 9.5, fill=FAINT)
QUAY_TOP = ROAD - DEEP                               # the quay drawn level with the underside of the level ramp
# the hull, cut off at the drawing's edge
yards = frange(0.0, Y1, 0.1)
poly([(XB(0), H(RAIL))] + [(XB(v), H(L.keel_y(L.Z(v)))) for v in yards] + [(XB(Y1), H(RAIL))], '#ffffff', 'none', 0)
poly([(XB(v), H(L.keel_y(L.Z(v)))) for v in yards], 'none', INK, 1.6, close=False)
line(XB(0), H(KEEL0), XB(0), H(CAR), 1.6)                                                                                          # the transom under the sill
line(XB(0), H(CAR + D['height']), XB(0), H(RAIL), 1.6)                                                                             # the door's head, and the bulwark across the stern
line(XB(0), H(RAIL), XB(Y1), H(RAIL), 0.7)                                                                                         # the bulwark along her side, beyond
line(XB(0), H(UP), XB(Y1), H(UP), 1.2)
line(XB(R['thick'][1]), H(CAR), XB(Y1), H(CAR), 1.2)
line(XB(0), H(CAR + D['height']), XB(Y1), H(CAR + D['height']), 0.5, INK, '6 4')                                                   # the underside of the deck's beams: the clear height
line(XB(0.3), H(S.STEERING_FLAT), XB(G.fr(8)), H(S.STEERING_FLAT), 0.8)
line(XB(G.fr(8)), H(L.keel_y(L.Z(G.fr(8)))), XB(G.fr(8)), H(CAR), 1.2)
line(XB(Y1), H(L.keel_y(L.Z(Y1)) - 0.3), XB(Y1), H(RAIL + 0.3), 0.5, INK, '14 3 2 3')
# the quay and the water
rect(XB(Y0), H(QUAY_TOP), XB(QUAY_FACE), H(L.KEEL - 0.4), 'url(#quay)', INK, 1.0)
line(XB(QUAY_FACE), H(0), XB(Y1) + 14, H(0), 0.9, WATER)
# rudder, screw, shaft and its brackets
RD = S.RUDDER
st = RD['yard_stock']
poly([(XB(st - (1 - RD['balance']) * RD['chord_top']), H(RD['top'])), (XB(st + RD['balance'] * RD['chord_top']), H(RD['top'])),
      (XB(st + RD['balance'] * RD['chord_bottom']), H(RD['bottom'])), (XB(st - (1 - RD['balance']) * RD['chord_bottom']), H(RD['bottom']))], '#ffffff', INK, 1.1)
line(XB(st), H(RD['top']), XB(st), H(S.TILLER['level']), 1.6)
line(XB(st), H(S.TILLER['level']), XB(st + S.TILLER['reach']), H(S.TILLER['level']), 2.2)
sy = lambda v: S.SCREW['y'] + S.SHAFT_RISE * (v - S.SCREW['yard'])
enters = next(v for v in frange(S.SCREW['yard'], 14.0, 0.05) if sy(v) >= L.hull_y(S.SHAFT_X, L.Z(v)))      # where the shaft's middle meets the plating
# (her bottom at the shafts lies within 4 cm of the keel's line here: aft she is flat, and one line stands for both)
line(XB(S.SCREW['yard']), H(sy(S.SCREW['yard'])), XB(min(enters, Y1)), H(sy(min(enters, Y1))), 1.8)
for b in S.BRACKETS:
    line(XB(b), H(sy(b)), XB(b), H(L.hull_y(S.SHAFT_X, L.Z(b))), 1.2)
add(f'<ellipse cx="{XB(S.SCREW["yard"]):.1f}" cy="{H(S.SCREW["y"]):.1f}" rx="{0.13 * K:.1f}" ry="{S.SCREW["diameter"] / 2 * K:.1f}" fill="#ffffff" stroke="{INK}" stroke-width="1.1"/>')
# the ramp: raised, level, at its lowest; the path of its end
slab = [(CAR + R['foot'], R['thick'][0]), (CAR + R['head'], R['thick'][0]), (CAR + R['head'], R['thick'][1]), (CAR + R['foot'], R['thick'][1])]
for angle, fill, dash, w in ((R['lowered'], 'none', '5 3', 0.8), (90, '#f3efdf', '', 1.2), (0, '#ffffff', '', 1.2)):
    poly([(XB(z), H(y)) for y, z in (turned(h, i, angle) for h, i in slab)], fill, INK, w, dash)
r = LEN * K
ey, ez = turned(CAR + R['head'], HZ, R['lowered'])
add(f'<path d="M{XB(HZ):.1f},{H(HY + LEN):.1f} A{r:.1f},{r:.1f} 0 0 0 {XB(ez):.1f},{H(ey):.1f}" fill="none" stroke="{DIM}" stroke-width="0.6" stroke-dasharray="9 3 2 3"/>')
circle(XB(HZ), H(HY), 2.6, INK, INK, 0.5)
# the cylinder, at the two ends of its work, and its pedestal
rect(XB(TZ - R['footplate'][1] / 2), H(CAR + 0.02), XB(TZ + R['footplate'][1] / 2), H(CAR), INK, INK, 0.5)
rect(XB(TZ - R['column'] / 2), H(TY + R['column_over']), XB(TZ + R['column'] / 2), H(CAR + 0.02), '#f0dc8c', INK, 0.9)
for angle in (90, 0):
    length, (py, pz) = pins(angle)
    at = lambda m: (XB(TZ + (pz - TZ) * m / length), H(TY + (py - TY) * m / length))
    line(*at(R['barrel']), *at(length), R['rod_d'] * K, '#7d8a90')
    line(*at(0), *at(R['barrel']), R['barrel_d'] * K, INK)
    circle(*at(length), 3.0, PAPER, INK, 1.0)
    ly, lz = turned(R['pin'][0], R['thick'][1], angle)
    line(XB(lz), H(ly), *at(length), 3.0, INK)                                                                                       # the lug on the roadway
circle(XB(TZ), H(TY), 3.0, PAPER, INK, 1.0)
# the lights
rect(XB(-STERNLIGHT['aft'] - 0.07), H(RAIL + 0.02), XB(0.04), H(RAIL - 0.10), INK, INK, 0.5)
rect(XB(-STERNLIGHT['aft'] - 0.07), H(STERNLIGHT['y'] + 0.21), XB(-STERNLIGHT['aft'] + 0.07), H(STERNLIGHT['y']), INK, INK, 0.5)
rect(XB(-STERNLIGHT['aft'] - 0.062), H(LENS[1]), XB(-STERNLIGHT['aft'] + 0.062), H(LENS[0]), '#fff6d6', INK, 0.5)
line(XB(0.02), H(STERNLIGHT['y']), XB(0.02), H(STERNLIGHT['y'] + 0.25), 1.2)
FH, FD = FLOOD['head'][1], FLOOD['head'][2]
look, up = (-cos(T), -sin(T)), (-sin(T), cos(T))                                                                                     # along the ship (aft is less), and up
corner = lambda a, b: (XB(-FLOOD['aft'] + a * FH / 2 * up[0] + b * FD / 2 * look[0]), H(FLOOD['y'] + a * FH / 2 * up[1] + b * FD / 2 * look[1]))
line(XB(0), H(RAIL + 0.02), XB(0), H(FLOOD['y'] - 0.05), 1.6)
poly([corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)], '#d9dedc', INK, 0.9)
line(*corner(0, 1), XB(-BEAM_AT), H(ROAD), 0.8, AMBER, '7 4')
circle(XB(-BEAM_AT), H(ROAD), 2.2, AMBER, AMBER, 0.3)
w, h, d = SIGNAL['size']
rect(XB(-d), H(SIGNAL['y'] + h), XB(0), H(SIGNAL['y']), INK, INK, 0.5)
rect(XB(-d - 0.10), H(SIGNAL['y'] + h + 0.02), XB(0), H(SIGNAL['y'] + h), INK, INK, 0.5)
# names
for label, a, h in (('Steering gear room', 2.45, 1.02), ('Shaft space', 6.9, 0.55), ('Vehicle deck', 6.75, 4.75), ('After mooring deck', 2.5, UP + 0.32), ('Open passenger deck', 7.1, UP + 0.32)):
    text(XB(a), H(h), label, 9.5, 'middle')
text(XB(-0.25), H(KEEL0) + 11, f"transom's foot {KEEL0:+.2f}", 8.5, 'end', fill=DIM)
# measures
dim(XB(HZ), H(HY - 0.62), XB(HZ - LEN), H(HY - 0.62), f'{LEN:.2f}', off=12, at=0.6)
witness(XB(HZ - LEN), H(HY - 0.1), XB(HZ - LEN), H(HY - 0.72))
witness(XB(HZ), H(HY - 0.1), XB(HZ), H(HY - 0.72))
dim(XB(0), H(CAR + 2.62), XB(TZ), H(CAR + 2.62), f'{TZ:.2f}')
witness(XB(TZ), H(TY + R['column_over'] + 0.08), XB(TZ), H(CAR + 2.72))
dim(XB(5.3), H(CAR), XB(5.3), H(CAR + D['height']), f"{D['height']:.2f} clear", at=0.62)
dim(XB(8.2), H(CAR), XB(8.2), H(UP), f'{UP - CAR:.2f} deck to deck', at=0.3)
dim(XB(-BEAM_AT), H(RAIL + 1.12), XB(0), H(RAIL + 1.12), f'{BEAM_AT:.2f}')
witness(XB(-BEAM_AT), H(ROAD + 0.15), XB(-BEAM_AT), H(RAIL + 1.2))
witness(XB(0), H(RAIL + 0.55), XB(0), H(RAIL + 1.2))
l0, l90, l100 = pins(0)[0], pins(90)[0], pins(R['lowered'])[0]
text(XB(-BEAM_AT) + 14, H(ROAD) - 5, "beam's middle", 9, fill=AMBER)
text(XB(Y1) + 18, H(0) - 4, 'WL', 9, fill=WATER)
# the frames, under the keel
fy = H(L.KEEL - 0.52)
line(XB(0), fy, XB(Y1), fy, 0.6, FAINT)
for n in range(0, int(Y1 / L.FRAME_SPACING) + 1):
    v = n * L.FRAME_SPACING
    line(XB(v), fy, XB(v), fy + (6 if n % 5 == 0 or n == 8 else 3), 0.6, FAINT)
    if n % 5 == 0 or n == 8:
        text(XB(v), fy + 17, f'fr {n}', 8.5, 'middle', fill=FAINT)
# the parts' numbers
balloon(2, XB(-2.1), H(3.3), *[(XB(z), H(y)) for y, z in [turned(CAR + 2.6, R['thick'][0], 90)]][0])
balloon(2, XB(1.25), H(5.75), XB(R['thick'][1]), H(CAR + 3.55))
balloon(3, XB(-0.8), H(0.62), XB(HZ), H(HY))
balloon(4, XB(2.6), H(5.0), *[(XB(TZ + (pins(0)[1][1] - TZ) * 0.3), H(TY + (pins(0)[1][0] - TY) * 0.3))][0])
balloon(5, XB(4.3), H(2.6), XB(TZ + R['column'] / 2), H(CAR + 0.7))
balloon(6, XB(-1.25), H(RAIL - 0.2), XB(-STERNLIGHT['aft'] - 0.07), H(STERNLIGHT['y'] + 0.1))
balloon(7, XB(1.1), H(RAIL + 0.62), *corner(1, -1))
balloon(8, XB(-1.3), H(SIGNAL['y'] + 0.75), XB(-SIGNAL['size'][2]), H(SIGNAL['y'] + 0.4))
balloon(9, XB(0.55), H(-1.9), XB(st - 0.5), H(-1.7))
balloon(10, XB(5.1), H(-2.75), XB(S.SCREW['yard'] + 0.13), H(-2.5))
balloon(11, XB(-5.9), H(0.9), XB(-5.5), H(0.35))

# ---------------------------------------------------------------------------------------------------------------------
# C: the plan at the car deck, under the profile
# ---------------------------------------------------------------------------------------------------------------------
CT = H(L.KEEL - 0.52) + 76
CY = CT + 14 + 7.25 * K


def YC(x):
    return CY - x * K                                # port up, as on the general arrangement


text(XB(Y0), CT - 14, 'C   PLAN AT THE CAR DECK, THE RAMP LOWERED', 12, weight='700')
text(XB(Y0), CT, 'Port up. The lights stand above, on the bulwark and the transom; the ramp raised is dashed.', 9.5, fill=FAINT)
rect(XB(Y0), YC(7.0), XB(QUAY_FACE), YC(-7.0), 'url(#quay)', INK, 1.0)
yards = frange(0.0, Y1, 0.2)
edge = [(v, L.half_breadth(L.Z(v))) for v in yards]
poly([(XB(v), YC(x)) for v, x in edge] + [(XB(v), YC(-x)) for v, x in reversed(edge)], '#ffffff', 'none', 0)
# her sides, broken at the mooring ports; the transom, broken at the door
a, b = S.MOORING_PORT['yard']
for sgn in (1, -1):
    for lo, hi in ((0.0, a), (b, Y1)):
        poly([(XB(v), YC(sgn * L.half_breadth(L.Z(v)))) for v in frange(lo, hi, 0.2)], 'none', INK, 1.6, close=False)
    line(XB(0), YC(sgn * HB0), XB(0), YC(sgn * D['half']), 1.6)
    # the casing's wall along the lanes, and the wall between the mooring station and the store
    wall = SPACE['aft-mooring-p']['x'][0]
    ends = SPACE['aft-mooring-p']['yard'][1]
    line(XB(0), YC(sgn * wall), XB(Y1), YC(sgn * wall), 1.1)
    line(XB(ends), YC(sgn * wall), XB(ends), YC(sgn * L.half_breadth(L.Z(ends))), 1.1)
    text(XB((a + b) / 2), YC(sgn * (L.half_breadth(L.Z(3.0)) + 0.28)) + 3, 'mooring port', 8.5, 'middle', fill=DIM)
line(XB(Y1), YC(7.1), XB(Y1), YC(-7.1), 0.5, INK, '14 3 2 3')
# the lanes
first = SPACE['vehicle-deck']['yard'][0]
for x in (-2.6, 0.0, 2.6):
    line(XB(first), YC(x), XB(Y1), YC(x), 0.6, FAINT, '10 6')
# the ramp, lowered: its roadway with the bars across it; and where it stands raised
low = [turned(h, i, 90)[1] for h, i in slab]
rect(XB(min(low)), YC(R['half']), XB(max(low)), YC(-R['half']), '#f3efdf', INK, 1.2)
for k in range(1, 8):
    v = turned(CAR + R['foot'] + (R['head'] - R['foot']) * k / 8, MID, 90)[1]
    line(XB(v), YC(R['half'] - 0.2), XB(v), YC(-R['half'] + 0.2), 0.5, FAINT)
rect(XB(R['thick'][0]), YC(R['half']), XB(R['thick'][1]), YC(-R['half']), 'none', INK, 0.7, '4 3')
line(XB(HZ), YC(D['half'] + 0.45), XB(HZ), YC(-D['half'] - 0.45), 0.6, INK, '9 3 2 3')
# the cylinders, run out, on their pedestals
length, (py, pz) = pins(90)
for sgn in (1, -1):
    x = sgn * R['ram_x']
    rect(XB(TZ - R['footplate'][1] / 2), YC(x + R['footplate'][0] / 2), XB(TZ + R['footplate'][1] / 2), YC(x - R['footplate'][0] / 2), '#ffffff', INK, 0.8)
    rect(XB(TZ - R['column'] / 2), YC(x + R['column'] / 2), XB(TZ + R['column'] / 2), YC(x - R['column'] / 2), '#f0dc8c', INK, 0.8)
    line(XB(TZ + (pz - TZ) * R['barrel'] / length), YC(x), XB(pz), YC(x), R['rod_d'] * K, '#7d8a90')
    line(XB(TZ), YC(x), XB(TZ + (pz - TZ) * R['barrel'] / length), YC(x), R['barrel_d'] * K, INK)
    circle(XB(pz), YC(x), 2.6, PAPER, INK, 0.9)
# the lights, seen from above: the sternlight's arc, the floodlights and where their beams' middles fall, the signal
arc = 2.6 * K
sx, sy_ = XB(-STERNLIGHT['aft']), YC(STERNLIGHT['x'])
ends_ = [(sx - arc * cos(radians(67.5)), sy_ - s * arc * sin(radians(67.5))) for s in (1, -1)]
add(f'<path d="M{sx:.1f},{sy_:.1f} L{ends_[0][0]:.1f},{ends_[0][1]:.1f} A{arc:.1f},{arc:.1f} 0 0 0 {ends_[1][0]:.1f},{ends_[1][1]:.1f} Z" fill="{AMBER}" fill-opacity="0.10" stroke="{AMBER}" stroke-width="0.7" stroke-dasharray="7 4"/>')
circle(sx, sy_, 3.2, '#fff6d6', INK, 0.9)
text(sx - arc - 5, sy_ + 3, '135°', 9.5, 'end', fill=AMBER)
for sgn in (1, -1):
    fx, fy_ = XB(-FLOOD['aft']), YC(sgn * FLOOD['x'])
    rect(fx - 0.10 * K, fy_ - FLOOD['head'][0] / 2 * K, fx + 0.06 * K, fy_ + FLOOD['head'][0] / 2 * K, '#d9dedc', INK, 0.9)
    line(fx - 0.10 * K, fy_, XB(-BEAM_AT), fy_, 0.8, AMBER, '7 4')
    circle(XB(-BEAM_AT), fy_, 2.2, AMBER, AMBER, 0.3)
rect(XB(-SIGNAL['size'][2]), YC(SIGNAL['x'] + SIGNAL['size'][0] / 2), XB(0), YC(SIGNAL['x'] - SIGNAL['size'][0] / 2), INK, INK, 0.5)
line(XB(Y0) - 6, CY, XB(Y1) + 10, CY, 0.5, INK, '14 3 2 3')
text(XB(Y1) + 14, CY + 3, 'CL', 8.5, fill=DIM)
# names
for sp, where in (('aft-mooring-p', 0.55), ('aft-mooring-s', 0.55), ('deck-store-p', 0.5), ('deck-store-s', 0.5)):
    q = SPACE[sp]
    mid_x = (q['x'][0] + q['x'][1]) / 2 - (0.12 if q['x'][0] > 0 else -0.12)
    text(XB(q['yard'][0] + (min(q['yard'][1], Y1) - q['yard'][0]) * where), YC(mid_x) + 3, q['name'].split(',')[0], 8.5, 'middle')
text(XB(6.9), YC(-1.3) + 3, 'Vehicle deck: four lanes of 2.60', 9.5, 'middle')
text(XB(Y0) + 8, YC(6.35), 'quay', 9, fill=DIM)
# measures
dim(XB(-4.75), YC(R['half']), XB(-4.75), YC(-R['half']), f"{2 * R['half']:.2f} ramp", at=0.3)
witness(XB(min(low)), YC(R['half']), XB(-4.85), YC(R['half']))
witness(XB(min(low)), YC(-R['half']), XB(-4.85), YC(-R['half']))
dim(XB(0.95), YC(D['half']), XB(0.95), YC(-D['half']), f"{2 * D['half']:.2f} door", at=0.3)
witness(XB(0), YC(D['half']), XB(1.05), YC(D['half']))
witness(XB(0), YC(-D['half']), XB(1.05), YC(-D['half']))
dim(XB(4.25), YC(R['ram_x']), XB(4.25), YC(-R['ram_x']), f"{2 * R['ram_x']:.2f} cylinders", at=0.3)
witness(XB(TZ + 0.35), YC(R['ram_x']), XB(4.35), YC(R['ram_x']))
witness(XB(TZ + 0.35), YC(-R['ram_x']), XB(4.35), YC(-R['ram_x']))
dim(XB(min(low)), YC(-4.25), XB(0), YC(-4.25), f'{-min(low):.2f} abaft the transom', off=12)
witness(XB(min(low)), YC(-R['half']), XB(min(low)), YC(-4.35))
witness(XB(0), YC(-HB0), XB(0), YC(-4.35 if HB0 < 4.35 else -HB0))
dim(XB(8.3), YC(0), XB(8.3), YC(2.6), '2.60', at=0.5)
balloon(2, XB(-2.2), YC(1.0), XB(-2.6), YC(0.45))
balloon(4, XB(1.75), YC(4.25), XB(1.6), YC(R['ram_x']))
balloon(5, XB(3.9), YC(4.3), XB(TZ + 0.2), YC(R['ram_x'] + 0.2))
balloon(6, XB(-1.5), YC(-1.35), sx, sy_)
balloon(7, XB(-1.2), YC(4.55), XB(-FLOOD['aft'] - 0.1), YC(FLOOD['x'] + 0.1))
balloon(8, XB(1.0), YC(-4.4), XB(-0.05), YC(SIGNAL['x'] - 0.1))
balloon(11, XB(-5.7), YC(-5.3), XB(-5.2), YC(-4.9))
C_BOTTOM = YC(-7.0)

# ---------------------------------------------------------------------------------------------------------------------
# under A: the ramp's motion and the lights, as tables
# ---------------------------------------------------------------------------------------------------------------------
tx = LEFT
ty = CT
text(tx, ty, "THE RAMP'S MOTION", 12, weight='700')
ty += 8
COLS = (0, 58, 232, 334, 432, 500)
for i, lines_ in enumerate((('lowered', 'by'), ('the ramp', ''), ('its end over', 'the waterline'), ('between the', "cylinder's pins"), ('rod', 'run out'), ("cylinder's arm", 'about the hinge'))):
    for j, s in enumerate(lines_):
        text(tx + COLS[i], ty + 14 + j * 11.5, s, 9.5, weight='600', fill=DIM)
ty += 34
line(tx, ty, tx + 590, ty, 0.6, FAINT)
for angle in (0, 30, 60, 80, 90, R['lowered']):
    ty += 16
    slope = 90 - angle
    lies = 'raised: the stern door' if angle == 0 else 'level' if slope == 0 else f'rises {slope}° to the quay' if 0 < slope <= 15 else f'falls {-slope}° to the quay' if slope < 0 else f'{slope}° from level'
    end = turned(CAR + R['head'], MID, angle)[0]
    row = (f'{angle}°', lies, f'{end:.2f}', f'{pins(angle)[0]:.2f}', f'{pins(angle)[0] - l0:.2f}', f'{lever(angle):.2f}')
    for i, s in enumerate(row):
        text(tx + COLS[i], ty, s, 10.5, weight='600' if angle in (0, 90) else '400')
ty += 8
line(tx, ty, tx + 590, ty, 0.6, FAINT)
low_end, high_end = turned(CAR + R['head'], MID, R['lowered'])[0], turned(CAR + R['head'], MID, 80)[0]
notes = (f"Two double-acting cylinders, one each side of the roadway: they push the ramp down and pull it up. Each is {R['barrel']:.2f} m of barrel from its foot pin; "
         f"its rod runs out {l100 - l0:.2f} m in all. With slopes kept within 10° the ramp's end meets a quay between {low_end:.2f} and {high_end:.2f} m over the water. "
         "Tide, trim and the quays she will use are not studied.")
for s in wrap(notes, 118):
    ty += 13.5
    text(tx, ty, s, 10, fill=DIM)

ty += 34
text(tx, ty, 'THE LIGHTS OF THE AFTER END', 12, weight='700')
ty += 6
rows = (
    ('6', 'Sternlight', f"white, unbroken over 135° astern: 67.5° each side of right aft; a screen forward of it",
     f"on the centreline, its glass {sum(LENS) / 2:.2f} m over the waterline and {STERNLIGHT['aft']:.2f} m abaft the transom, on the bulwark's rail",
     'component NLT-06 of the register: navigation light panel, circuit 4'),
    ('7', 'Floodlight, two', f"white, looking aft and {FLOOD['tilt']}° down: the middle of each beam meets the quay {BEAM_AT:.1f} m abaft the transom, at the ramp's end",
     f"on posts on the bulwark's rail, {FLOOD['x']:.2f} m each side of the centreline, {FLOOD['y']:.2f} m over the waterline",
     'not yet in the register: no circuit'),
    ('8', 'Signal', 'red over green, to those who wait on the quay to drive aboard: wait, or drive on',
     f"on the transom {-SIGNAL['x']:.2f} m to starboard of the centreline, its foot {SIGNAL['y'] - CAR:.2f} m over the car deck: beside the door, on the driver's side",
     'not yet in the register: no circuit'),
)
for n, name, shows, where, fed in rows:
    ty += 20
    circle(tx + 9, ty - 3.5, 8.5, PAPER, INK, 0.9)
    text(tx + 9, ty, n, 9.5, 'middle', '700')
    text(tx + 26, ty, name, 10.5, weight='700')
    for label, s in (('shows', shows), ('stands', where), ('fed', fed)):
        for j, part in enumerate(wrap(s, 92)):
            ty += 13.5
            if j == 0:
                text(tx + 26, ty, label, 9.5, fill=FAINT)
            text(tx + 74, ty, part, 10)
T_BOTTOM = ty

# ---------------------------------------------------------------------------------------------------------------------
# beside the profile: the parts, and what is not settled
# ---------------------------------------------------------------------------------------------------------------------
py_ = TOP - 26
text(LIST, py_, 'PARTS', 12, weight='700')
PARTS = (
    (1, 'Stern door', f"The opening in the transom over the car deck, {2 * D['half']:.2f} m wide and {D['height']:.2f} m clear: two of her four lanes at a time."),
    (2, 'Ramp', f"One leaf, {2 * R['half']:.2f} m wide and {LEN:.2f} m from the hinge to its end, drawn {DEEP:.2f} m deep. Raised, it is the stern door. "
                f"It lowers {R['lowered']}°: level at 90°, and 10° further for a quay that lies lower. Its roadway has bars across it against slipping."),
    (3, 'Hinge', f"On the sill of the door, {HY - CAR:.2f} m over the car deck and {HZ:.2f} m inside the transom; a lug at each end of the sill stays when the ramp lowers."),
    (4, 'Hydraulic cylinder, two', f"Double-acting, {R['ram_x']:.2f} m each side of the centreline, inside the opening's width. Foot pin on the pedestal, rod pin on a lug on the ramp "
                                   f"{R['pin'][0] - HY:.2f} m from the hinge. {l0:.2f} m between the pins raised, {l90:.2f} m level. The roadway between the two is {CLEAR:.2f} m."),
    (5, 'Pedestal, two', f"A column on a footplate on the car deck, {TZ:.2f} m inside the transom, stayed forward and aft; the foot pin {TY - CAR:.2f} m over the deck. "
                         "In line with the door's jambs, so the lanes are clear of it."),
    (6, 'Sternlight', 'White, over 135° astern. See the table of the lights.'),
    (7, 'Floodlight, two', 'For the ramp and the quay at night. See the table.'),
    (8, 'Signal, red over green', 'For those who drive aboard. See the table.'),
    (9, 'Rudder, two', f"On stocks {RD['yard_stock']:.2f} m from the transom, {S.SHAFT_X:.2f} m each side of the centreline; the tillers in the steering gear room under the car deck."),
    (10, 'Screw, two', f"{S.SCREW['diameter']:.2f} m, {S.SCREW['yard']:.2f} m from the transom, on shafts that rise 8° forward and enter her about {enters:.1f} m from the transom."),
    (11, 'Quay', 'Not hers and not given: drawn level with the car deck, the ramp lying 0.6 m in on it.'),
)
for n, name, what in PARTS:
    py_ += 21
    circle(LIST + 9, py_ - 3.5, 8.5, PAPER, INK, 0.9)
    text(LIST + 9, py_, str(n), 9.5, 'middle', '700')
    text(LIST + 26, py_, name, 10.5, weight='700')
    for s in wrap(what, 66):
        py_ += 13
        text(LIST + 26, py_, s, 10)
py_ += 34
text(LIST, py_, 'NOT SETTLED', 12, weight='700')
OPEN = (
    'The hydraulic power unit, its pipes and the stand the ramp is worked from are not drawn or placed.',
    "No force is calculated: the ramp's weight, the cylinders' bore and pressure, the pins and the pedestals' seating on the deck's structure.",
    'How the raised ramp is held and made tight against the sea (cleats, a seal) is not drawn: a stern door of a passenger ship has to be both.',
    "The ramp has no lip or flaps to the quay, and its own structure is not designed: it is drawn as a slab.",
    'The floodlights and the signal have no place in the component register yet, so no cable, circuit or switch.',
    "The sternlight's arc is drawn as the rule asks; it is not yet measured in the model as the bridge's lanterns are (JS4-404).",
    'The quays she will lie at, their heights and the tide are not known: the 10° either way is an assumption.',
    f'The owner, 11 November 2026: "Does it need to be wider?" Not for what she carries: {2 * D["half"]:.2f} m serves two of her four lanes at a time, with {CLEAR:.2f} m '
    'between the cylinders: cars two abreast, lorries one at a time. Two lorries abreast would ask about 7.4 m (the yard\'s estimate, from no rule). Not decided.',
)
for i, s in enumerate(OPEN):
    py_ += 7
    for j, part in enumerate(wrap(s, 68)):
        py_ += 13
        if j == 0:
            text(LIST, py_, f'{i + 1}', 10, weight='700', fill=DIM)
        text(LIST + 18, py_, part, 10)
P_BOTTOM = py_

# ---------------------------------------------------------------------------------------------------------------------
# the foot of the sheet: a scale, where it comes from
# ---------------------------------------------------------------------------------------------------------------------
y = max(C_BOTTOM, T_BOTTOM, P_BOTTOM) + 40
for i in range(5):
    rect(LEFT + i * K, y, LEFT + (i + 1) * K, y + 5, INK if i % 2 == 0 else PAPER, INK, 0.7)
    text(LEFT + i * K, y + 17, str(i), 9, 'middle', fill=DIM)
text(LEFT + 5 * K, y + 17, '5 m', 9, 'middle', fill=DIM)
text(LEFT + 5 * K + 26, y + 7, 'All three views at this scale.', 10, fill=DIM)
text(WIDTH - 24, y + 7, f'Made by ferry/yard/drawings/stern_drawing.py from ferry/blender/lines.py, spec.py and ga.py (revision {G.REVISION}): the numbers the model is built from.', 10, 'end', fill=FAINT)
height = y + 34
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {height:.0f}" width="{WIDTH}" height="{height:.0f}" font-family="DejaVu Sans, Helvetica, Arial, sans-serif">'
       f'<title>{escape(S.NAME)}: {escape(TITLE)}, {NUMBER} revision {REVISION}</title>'
       f'<rect width="{WIDTH}" height="{height:.0f}" fill="{PAPER}"/>' + ''.join(out) + '</svg>')
path = os.path.join(HERE, f'{NUMBER}-stern-ramp-and-after-end.svg')
open(path, 'w').write(svg)
print(f'{path}: {WIDTH} x {height:.0f}, {len(svg)} bytes')
print(f"  the cylinder between its pins: {l0:.2f} m raised, {l90:.2f} m level, {l100:.2f} m at {R['lowered']}°; its rod runs out {l100 - l0:.2f} m; the barrel is {R['barrel']:.2f} m")
print(f"  the middle of the floodlights' beam meets the level of the ramp {BEAM_AT:.2f} m abaft the transom; the ramp ends {LEN - HZ:.2f} m abaft it")
