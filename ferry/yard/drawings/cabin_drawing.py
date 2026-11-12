#!/usr/bin/env python3
"""
JS5-511, the chief engineer's day room with the maintenance computer: drawn from the numbers it is built from.

    python3 ferry/yard/drawings/cabin_drawing.py     writes, beside this file:
        JS5-511-chief-engineers-day-room.svg           the room from above; her side as one sits at the desk; the after
                                                       wall; how it is fed and worked; its parts

The owner, 12 November 2026: "Build a functional Maintenance PC and add it to the chief engineers cabin".

Every number is read from ferry/blender/cabin_place.py: the builder (blender/cabin_ce.py) and the register
(systems/accommodation.py) read the same file. Change the room there and draw again.

Where things stand is the owner's own package's for a chief engineer's suite (blender/assets/ce-suite/: CE-SUITE-GA-001,
MS-CE-001): the desk at the ship's side beside a window, its sockets 0.30 m up in skirting trunking from the suite's own
board by the door. (The sheet was first drawn with the desk against the after wall; cabin_place.py says why it moved.)
"""
import os
import sys
from html import escape

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'blender'))
import cabin_place as P

bad = P.wrong()
if bad:
    raise SystemExit('JS5-511 is not drawn: the room does not hold: ' + '; '.join(bad))

NUMBER, REVISION, DATE = 'JS5-511', '0', '12 November 2026'
WIDTH, HEIGHT = 1640, 1850
INK, PAPER, FAINT, DIM, RED, BLUE, WOOD, GLASS, STEEL = '#22303a', '#fbfaf5', '#8b959b', '#5d6a72', '#c2412f', '#2f6fb7', '#c9a57c', '#cfe2f3', '#d8dcdd'
PANEL, TRUNK, YELLOW, ROOM, DARK = '#e2ccae', '#e9e4d6', '#e3b341', '#f5f2ea', '#3a3f41'
out = []


def t(x, y, s, size=12, fill=INK, anchor='start', weight='normal', italic=False):
    style = ' font-style="italic"' if italic else ''
    out.append(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}"{style}>{escape(s)}</text>')


def line(x1, y1, x2, y2, stroke=INK, w=1.2, dash=None):
    dashed = f' stroke-dasharray="{dash}"' if dash else ''
    out.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="{w}"{dashed}/>')


def rect(x, y, w, h, fill='none', stroke=INK, sw=1.2, dash=None, rx=0):
    dashed = f' stroke-dasharray="{dash}"' if dash else ''
    out.append(f'<rect x="{min(x, x + w):.1f}" y="{min(y, y + h):.1f}" width="{abs(w):.1f}" height="{abs(h):.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" rx="{rx}"{dashed}/>')


def circle(x, y, r, fill='none', stroke=INK, sw=1.2):
    out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')


def mark(x, y, n, to=None):
    """A part's number in a ring; `to` is the place it points at, when it does not stand on the part itself."""
    if to:
        line(x, y, to[0], to[1], DIM, 0.8)
    circle(x, y, 10, PAPER, INK, 1.2)
    t(x, y + 4, str(n), 11, INK, 'middle', 'bold')


def dim(x1, y1, x2, y2, s, off=14, side=1):
    """A measure between two points on one line, with its figure beside it."""
    line(x1, y1, x2, y2, DIM, 0.8)
    for x, y in ((x1, y1), (x2, y2)):
        if abs(y2 - y1) < 1e-6:
            line(x, y - 5, x, y + 5, DIM, 0.8)
        else:
            line(x - 5, y, x + 5, y, DIM, 0.8)
    if abs(y2 - y1) < 1e-6:
        t((x1 + x2) / 2, y1 - 6 * side + (10 if side < 0 else 0), s, 11, DIM, 'middle')
    else:
        t(x1 + off * side, (y1 + y2) / 2 + 4, s, 11, DIM, 'start' if side > 0 else 'end')


def wrapped(x, y, text, width=98, size=11, step=16):
    """A paragraph, broken at spaces; gives back the y under it."""
    words, row = text.split(), ''
    for word in words:
        if row and len(row) + 1 + len(word) > width:
            t(x, y, row, size, INK)
            y, row = y + step, '  ' + word
        else:
            row = f'{row} {word}' if row else word
    t(x, y, row, size, INK)
    return y + step


(RX0, RX1), (RY0, RY1) = P.ROOM['x'], P.ROOM['yard']
d, dr, ch, sc, kb, ms, un, sk, dt, tr, bd, cal = P.DESK, P.DRAWERS, P.CHAIR, P.SCREEN, P.KEYS, P.MOUSE, P.UNIT, P.SOCKET, P.DATA, P.TRUNK, P.BOARD, P.CALENDAR
(u0, u1), (v0, v1), top, th, pn = d['u'], d['v'], d['top'], d['thick'], d['panel']
w, hg, ft, bz, face = sc['wide'], sc['high'], sc['foot'], sc['bezel'], sc['face']
win = P.WINDOWS
first = win['side'][0]                      # the side window the desk's forward end stands under
box = bd['box']
trunk_m = (tr['to'] - P.AFT) + (P.SIDE - tr['up']) + (box[2] - tr['h'][1])

# ---------------------------------------------------------------------------------------------------------------------
# The sheet's head
# ---------------------------------------------------------------------------------------------------------------------
t(64, 46, 'CHISUM', 28, INK, weight='bold')
t(202, 46, f"Chief engineer's day room: the desk and the maintenance computer · {NUMBER} · revision {REVISION} · {DATE}", 15, INK, weight='bold')
t(64, 66, "Officers' deck, port side, under the wheelhouse. Drawn before it is built. Nothing else stands in the suite yet: its bedroom and wet unit are not partitioned off. "
          "The arrangement is the owner's package's (CE-SUITE-GA-001, MS-CE-001); the measures are this room's.", 11, FAINT)

# ---------------------------------------------------------------------------------------------------------------------
# The room from above: forward is up, port is to the left
# ---------------------------------------------------------------------------------------------------------------------
S1, PX, PY = 104.0, 110, 176
X = lambda x: PX + (RX1 - x) * S1
Y = lambda yard: PY + (RY1 - yard) * S1


def on_side(ua, ub, va, vb, fill='none', stroke=INK, sw=1.2, dash=None, rx=0):
    """What stands along her side, from above: ua to ub from the transom, va to vb out from the wall's face."""
    rect(X(P.SIDE - va), Y(ub), (vb - va) * S1, (ub - ua) * S1, fill, stroke, sw, dash, rx)


t(64, 108, 'THE ROOM, FROM ABOVE', 12, INK, weight='bold')
t(64, 124, 'Forward is up; port is to the left. ' + f"{P.ROOM['name']}: {RX1 - RX0:.2f} m across, {RY1 - RY0:.2f} m fore and aft, {P.HEIGHT:.1f} m deck to deck", 11, FAINT)
rect(X(RX1), Y(RY1), (RX1 - RX0) * S1, (RY1 - RY0) * S1, ROOM, INK, 2.4)
# the doorway in the after wall; the windows in her side and in the house front
line(X(P.DOOR[1]), Y(RY0), X(P.DOOR[0]), Y(RY0), ROOM, 5)
line(X(P.DOOR[1]), Y(RY0) - 6, X(P.DOOR[1]), Y(RY0) + 6, INK, 2)
line(X(P.DOOR[0]), Y(RY0) - 6, X(P.DOOR[0]), Y(RY0) + 6, INK, 2)
t(X((P.DOOR[0] + P.DOOR[1]) / 2), Y(RY0) + 20, 'door, to the cross passage', 10, DIM, 'middle')
for a, b in win['side']:
    line(X(RX1), Y(a), X(RX1), Y(b), BLUE, 6)
    t(X(RX1) - 8, Y((a + b) / 2) + 4, 'window', 10, BLUE, 'end')
for a, b in win['front']:
    line(X(a), Y(RY1), X(b), Y(RY1), BLUE, 6)
    t(X((a + b) / 2), Y(RY1) + 18, 'window', 10, BLUE, 'middle')
t(X(RX1) - 8, Y((win['side'][0][1] + win['side'][1][0]) / 2) - 3, 'HER SIDE,', 10, FAINT, 'end')
t(X(RX1) - 8, Y((win['side'][0][1] + win['side'][1][0]) / 2) + 11, 'PORT', 10, FAINT, 'end')
t(X((RX0 + RX1) / 2), Y(RY1) - 10, 'THE HOUSE FRONT · FORWARD', 10, FAINT, 'middle')
t(X(RX0) + 10, Y((RY0 + RY1) / 2) - 30, "the pilot's", 10, FAINT)
t(X(RX0) + 10, Y((RY0 + RY1) / 2) - 16, 'cabin', 10, FAINT)
# the skirting trunking, along her side and the after wall; the place of DB-CE; the calendar
line(X(P.SIDE) + 3, Y(P.AFT), X(P.SIDE) + 3, Y(tr['to']), '#a59f8a', 3)
line(X(P.SIDE), Y(P.AFT) - 3, X(tr['up']), Y(P.AFT) - 3, '#a59f8a', 3)
line(X(bd['x'][1]), Y(P.AFT) - 6, X(bd['x'][0]), Y(P.AFT) - 6, YELLOW, 5)
line(X(cal['x'][1]), Y(P.AFT) - 5, X(cal['x'][0]), Y(P.AFT) - 5, INK, 2.4)
# the desk, its pedestal and the unit under it (dashed), the screen on its foot, the keyboard, the mouse, the chair, the outlets
on_side(u0, u1, v0, v1, WOOD, INK, 1.4)
on_side(dr['u'][0], dr['u'][1], dr['v'][0], dr['v'][1], 'none', DIM, 0.9, '4 3')
on_side(un['u'][0], un['u'][1], un['v'][0], un['v'][1], 'none', DIM, 0.9, '4 3')
on_side(sc['u'] - 0.12, sc['u'] + 0.12, face - 0.19, face - 0.03, 'none', INK, 0.8)
on_side(sc['u'] - w / 2 - bz, sc['u'] + w / 2 + bz, face - sc['thick'], face, INK, INK, 1)
on_side(kb['u'][0], kb['u'][1], kb['v'][0], kb['v'][1], DARK, INK, 1)
on_side(ms['u'][0], ms['u'][1], ms['v'][0], ms['v'][1], DARK, INK, 1)
circle(X(P.SIDE - ch['v']), Y(ch['u']), ch['base'] * S1, 'none', DIM, 0.9)
on_side(ch['u'] - ch['wide'] / 2, ch['u'] + ch['wide'] / 2, ch['v'] - ch['deep'] / 2, ch['v'] + ch['deep'] / 2, '#3b4d66', INK, 1.2, rx=6)
for o in (sk, dt):
    on_side(o['u'][0], o['u'][1], 0.0, 0.035, RED, RED, 1)
# its numbers
mid = lambda pair: (pair[0] + pair[1]) / 2
mark(X(P.SIDE - mid(d['v'])), Y(u1) - 22, 1, (X(P.SIDE - mid(d['v'])), Y(u1) + 3))
mark(X(P.SIDE - ch['v']) + 52, Y(ch['u']), 2, (X(P.SIDE - ch['v']) + ch['wide'] / 2 * S1, Y(ch['u'])))
mark(X(RX1) - 38, Y(sc['u']) - 26, 3, (X(P.SIDE - face + sc['thick'] / 2), Y(sc['u'] + 0.10)))
mark(X(P.SIDE - v1) + 20, Y(kb['u'][1]) - 6, 4, (X(P.SIDE - kb['v'][1]) + 1, Y(mid(kb['u']) + 0.08)))
mark(X(P.SIDE - v1) + 20, Y(ms['u'][1]) - 16, 5, (X(P.SIDE - ms['v'][1]) + 1, Y(mid(ms['u']))))
mark(X(P.SIDE - v1) + 24, Y(un['u'][0]) - 4, 6, (X(P.SIDE - un['v'][1]) + 1, Y(mid(un['u']))))
mark(X(RX1) - 38, Y(mid(sk['u'])) + 22, 7, (X(P.SIDE) + 2, Y(mid(sk['u']))))
mark(X(RX1) - 38, Y(mid(dt['u'])) - 2, 8, (X(P.SIDE) + 2, Y(mid(dt['u']))))
mark(X(5.45), Y(P.AFT) - 26, 9, (X(5.45), Y(P.AFT) - 4))
mark(X(mid(bd['x'])), Y(P.AFT) - 28, 10, (X(mid(bd['x'])), Y(P.AFT) - 9))
mark(X(mid(cal['x'])), Y(P.AFT) - 26, 11, (X(mid(cal['x'])), Y(P.AFT) - 7))
# its measures
DX = X(P.SIDE - v1) + 150
for uu in (u0, u1):
    line(X(P.SIDE - v1) + 4, Y(uu), DX + 6, Y(uu), DIM, 0.6, '2 3')
dim(DX, Y(u0), DX, Y(u1), f'{u1 - u0:.2f} m', off=10)
dim(X(P.SIDE - v0), Y(RY0) + 40, X(P.SIDE - v1), Y(RY0) + 40, f'{v1 - v0:.2f}', side=-1)
dim(X(P.SIDE - v1), Y(RY0) + 40, X(P.DOOR[1]), Y(RY0) + 40, f'{P.SIDE - v1 - P.DOOR[1]:.2f} m to the doorway', side=-1)
dim(X(P.SIDE - mid(d['v'])) + 26, Y(u1), X(P.SIDE - mid(d['v'])) + 26, Y(RY1), f'{RY1 - u1:.2f} m forward of the desk', off=10)
t(X((RX0 + RX1) / 2) + 40, Y(102.2), 'kept for the settee and the bedroom\'s partition', 11, FAINT, 'middle', italic=True)
t(X((RX0 + RX1) / 2) + 40, Y(102.2) + 16, 'not built', 11, FAINT, 'middle', italic=True)

# ---------------------------------------------------------------------------------------------------------------------
# Her side, as one sits at the desk: looking to port, forward is to the right
# ---------------------------------------------------------------------------------------------------------------------
S2, EX, EY = 238.0, 780, 176
U0, U1 = P.AFT, first[1] + 0.20
XS = lambda u: EX + (u - U0) * S2
YS = lambda h: EY + (P.HEIGHT - h) * S2
t(EX - 40, 108, 'HER SIDE, AS ONE SITS AT THE DESK', 12, INK, weight='bold')
t(EX - 40, 124, 'Looking to port: forward is to the right, the after wall to the left. Heights over the deck.', 11, FAINT)
rect(XS(U0), YS(P.HEIGHT), (U1 - U0) * S2, P.HEIGHT * S2, ROOM, FAINT, 1)
line(XS(U0), YS(0), XS(U1), YS(0), INK, 2.4)
line(XS(U0), YS(P.HEIGHT), XS(U1), YS(P.HEIGHT), INK, 2.4)
line(XS(U0), YS(0), XS(U0), YS(P.HEIGHT), INK, 2.4)
t(XS(U0) + 8, YS(P.HEIGHT) + 16, 'the after wall', 10, FAINT)
t(XS(U1) - 6, YS(P.HEIGHT) + 16, f'the bridge deck, {P.HEIGHT:.1f} m', 10, FAINT, 'end')
rect(XS(first[0]), YS(win['head']), (first[1] - first[0]) * S2, (win['head'] - win['sill']) * S2, GLASS, BLUE, 1.6, rx=16)
t(XS(mid(first)), YS(mid((win['sill'], win['head']))) + 4, 'window', 11, BLUE, 'middle')
# the skirting trunking and its two risers; the outlets
rect(XS(P.AFT), YS(tr['h'][1]), (tr['to'] - P.AFT) * S2, (tr['h'][1] - tr['h'][0]) * S2, TRUNK, DIM, 1)
for o in (sk, dt):
    rect(XS(mid(o['u']) - 0.02), YS(o['h'][0]), 0.04 * S2, (o['h'][0] - tr['h'][1]) * S2, TRUNK, DIM, 1)
# the desk: its back panel behind everything, its top, its two end panels, its pedestal of drawers
rect(XS(u0 + pn), YS(top - th), (u1 - u0 - 2 * pn) * S2, (top - th - d['back']) * S2, PANEL, DIM, 0.8)
rect(XS(u0), YS(top), (u1 - u0) * S2, th * S2, WOOD, INK, 1.4)
for ua in (u0, u1 - pn):
    rect(XS(ua), YS(top - th), pn * S2, (top - th) * S2, WOOD, INK, 1.2)
rect(XS(dr['u'][0]), YS(top - th), (u1 - pn - dr['u'][0]) * S2, (top - th - dr['h'][0]) * S2, '#b99368', INK, 1.2)
each = (dr['h'][1] - dr['h'][0]) / dr['count']
for k in range(1, dr['count']):
    line(XS(dr['u'][0]), YS(dr['h'][0] + k * each), XS(u1 - pn), YS(dr['h'][0] + k * each), INK, 1)
for k in range(dr['count']):
    line(XS(dr['u'][0] + 0.12), YS(dr['h'][0] + (k + 0.5) * each + 0.03), XS(dr['u'][1] - 0.12), YS(dr['h'][0] + (k + 0.5) * each + 0.03), STEEL, 3)
rect(XS(un['u'][0]), YS(un['foot'] + un['high']), (un['u'][1] - un['u'][0]) * S2, un['high'] * S2, '#4a5053', INK, 1.2)
rect(XS(sk['u'][0]), YS(sk['h'][1]), (sk['u'][1] - sk['u'][0]) * S2, (sk['h'][1] - sk['h'][0]) * S2, '#ffffff', RED, 1.4)
for cu in (sk['u'][0] + 0.038, sk['u'][1] - 0.038):
    circle(XS(cu), YS(mid(sk['h'])), 0.019 * S2, '#c9cdcf', DIM, 0.8)
rect(XS(dt['u'][0]), YS(dt['h'][1]), (dt['u'][1] - dt['u'][0]) * S2, (dt['h'][1] - dt['h'][0]) * S2, '#ffffff', RED, 1.4)
rect(XS(mid(dt['u']) - 0.009), YS(mid(dt['h']) + 0.008), 0.018 * S2, 0.016 * S2, DARK, DARK, 0.6)
# the screen and what it shows; the keyboard; the mouse
rect(XS(sc['u'] - 0.12), YS(top + 0.012), 0.24 * S2, 0.012 * S2, INK, INK, 1)
rect(XS(sc['u'] - 0.025), YS(ft), 0.05 * S2, (ft - top) * S2, INK, INK, 1)
rect(XS(sc['u'] - w / 2 - bz), YS(ft + hg + bz), (w + 2 * bz) * S2, (hg + 2 * bz) * S2, INK, INK, 1)
rect(XS(sc['u'] - w / 2), YS(ft + hg), w * S2, hg * S2, '#f4f6ff', INK, 0.6)
rect(XS(sc['u'] - w / 2), YS(ft + hg), w * S2, 0.04 * S2, '#0017c1', '#0017c1', 0.6)
t(XS(sc['u'] - w / 2) + 5, YS(ft + hg - 0.027), 'MAINTENANCE DESK', 6, '#ffffff', weight='bold')
t(XS(sc['u']), YS(ft + hg - 0.095), 'M/V CHISUM', 9, INK, 'middle', 'bold')
rect(XS(sc['u'] - 0.085), YS(ft + 0.046), 0.17 * S2, 0.034 * S2, '#0017c1', '#0017c1', 0.6)
t(XS(sc['u']), YS(ft + 0.022), 'TAP TO OPEN', 4.6, '#ffffff', 'middle', 'bold')
rect(XS(kb['u'][0]), YS(top + kb['high']), (kb['u'][1] - kb['u'][0]) * S2, kb['high'] * S2, DARK, INK, 1)
rect(XS(ms['u'][0]), YS(top + ms['high']), (ms['u'][1] - ms['u'][0]) * S2, ms['high'] * S2, DARK, INK, 1)
# its numbers
knee = (un['u'][1], dr['u'][0])
mark(XS(dr['u'][0]) - 60, YS(0.50), 1)
mark(XS(sc['u'] + w / 2 + bz) + 22, YS(ft + hg / 2), 3)
mark(XS(kb['u'][0]) - 26, YS(top + 0.075), 4, (XS(kb['u'][0]) + 2, YS(top + kb['high'] / 2)))
mark(XS(ms['u'][1]) + 28, YS(top + 0.085), 5, (XS(ms['u'][1]) - 2, YS(top + ms['high'] / 2)))
mark(XS(mid(un['u'])), YS(un['foot'] + un['high'] / 2 - 0.06), 6)
mark(XS(mid(sk['u'])), YS(sk['h'][1]) - 20, 7)
mark(XS(mid(dt['u'])), YS(dt['h'][1]) - 20, 8)
mark(XS(P.AFT + 0.11), YS(tr['h'][1]) - 24, 9, (XS(P.AFT + 0.11), YS(tr['h'][1]) - 1))
# its measures
dim(XS(P.AFT), YS(0) + 28, XS(u0), YS(0) + 28, f'{u0 - P.AFT:.2f}', side=-1)
dim(XS(u0), YS(0) + 28, XS(u1), YS(0) + 28, f'{u1 - u0:.2f} m', side=-1)
dim(XS(knee[0]), YS(0.60), XS(knee[1]), YS(0.60), f'{knee[1] - knee[0]:.2f} for the knees')
gap = (sc['u'] + w / 2 + bz, first[0])
dim(XS(gap[0]), YS(1.36), XS(gap[1]), YS(1.36), f'{gap[1] - gap[0]:.2f}')
dim(XS(u1) + 20, YS(0), XS(u1) + 20, YS(top), f'{top:.2f}', off=8)
dim(XS(first[1]) + 16, YS(0), XS(first[1]) + 16, YS(win['sill']), f"{win['sill']:.2f} to the sill", off=8)
dim(XS(P.AFT) - 16, YS(0), XS(P.AFT) - 16, YS(mid(sk['h'])), f"{mid(sk['h']):.2f}", off=8, side=-1)
line(XS(P.AFT) - 21, YS(mid(sk['h'])), XS(sk['u'][0]) - 3, YS(mid(sk['h'])), DIM, 0.6, '2 3')
line(XS(sc['u'] - w / 2 - bz) - 26, YS(P.screen_centre()[2]), XS(sc['u'] - w / 2 - bz) - 2, YS(P.screen_centre()[2]), DIM, 0.6, '2 3')
t(XS(sc['u'] - w / 2 - bz) - 30, YS(P.screen_centre()[2]) + 4, f"the screen's middle, {P.screen_centre()[2]:.2f}", 10, DIM, 'end')

# ---------------------------------------------------------------------------------------------------------------------
# The after wall, looking aft: port is to the right
# ---------------------------------------------------------------------------------------------------------------------
S3, AX, AY = 170.0, 110, 990
XA = lambda x: AX + (x - RX0) * S3
YA = lambda h: AY + (P.HEIGHT - h) * S3
t(64, AY - 68, 'THE AFTER WALL', 12, INK, weight='bold')
t(64, AY - 52, 'Looking aft: port is to the right. The desk, the screen and the chair are seen from their after end.', 11, FAINT)
rect(XA(RX0), YA(P.HEIGHT), (RX1 - RX0) * S3, P.HEIGHT * S3, ROOM, FAINT, 1)
line(XA(RX0), YA(0), XA(RX1), YA(0), INK, 2.4)
line(XA(RX0), YA(P.HEIGHT), XA(RX1), YA(P.HEIGHT), INK, 2.4)
line(XA(RX1), YA(0), XA(RX1), YA(P.HEIGHT), INK, 2.4)
line(XA(RX0), YA(0), XA(RX0), YA(P.HEIGHT), INK, 2.4)
t(XA(RX1) + 8, YA(1.9), 'her side', 10, FAINT)
rect(XA(P.DOOR[0]), YA(2.0), (P.DOOR[1] - P.DOOR[0]) * S3, 2.0 * S3, PAPER, INK, 1.4)
t(XA(mid(P.DOOR)), YA(1.0), 'door', 11, DIM, 'middle')
# the trunking: along the skirting from her side, and up to the box; the box; the place of DB-CE
rect(XA(tr['up'] - 0.02), YA(tr['h'][1]), (P.SIDE - tr['up'] + 0.02) * S3, (tr['h'][1] - tr['h'][0]) * S3, TRUNK, DIM, 1)
rect(XA(tr['up'] - 0.02), YA(box[2]), 0.04 * S3, (box[2] - tr['h'][1]) * S3, TRUNK, DIM, 1)
rect(XA(box[0]), YA(box[3]), (box[1] - box[0]) * S3, (box[3] - box[2]) * S3, STEEL, INK, 1.2)
(bx0, bx1), (bh0, bh1) = bd['x'], bd['h']
rect(XA(bx0), YA(bh1), (bx1 - bx0) * S3, (bh1 - bh0) * S3, '#ffffff', YELLOW, 3)
t(XA(mid(bd['x'])), YA(mid(bd['h'])) - 5, 'DB-CE', 8, INK, 'middle', 'bold')
t(XA(mid(bd['x'])), YA(mid(bd['h'])) + 6, 'NOT', 6, RED, 'middle', 'bold')
t(XA(mid(bd['x'])), YA(mid(bd['h'])) + 14, 'INSTALLED', 6, RED, 'middle', 'bold')
t(XA(box[1]) + 8, YA(mid(box[2:])) + 4, 'the two cables end in this box, marked', 10, RED)
# the calendar: the month's picture above, the month below
(cx0, cx1), (ch0, ch1) = cal['x'], cal['h']
rect(XA(cx0), YA(ch1), (cx1 - cx0) * S3, (ch1 - ch0) * S3, '#ffffff', INK, 1.2)
rect(XA(cx0 + 0.02), YA(ch1 - 0.02), (cx1 - cx0 - 0.04) * S3, (ch1 - ch0) / 2 * S3 - 0.05 * S3, '#dfe6ee', DIM, 0.6)
line(XA(cx0), YA(mid(cal['h'])), XA(cx1), YA(mid(cal['h'])), STEEL, 2.4)
for k in range(1, 5):
    hy = ch0 + 0.03 + k * ((ch1 - ch0) / 2 - 0.10) / 5
    line(XA(cx0 + 0.02), YA(hy), XA(cx1 - 0.02), YA(hy), '#d9d5c9', 0.6)
# the desk, the screen on its stand and the keyboard, from their after end; the chair before them
rect(XA(P.SIDE - v1 + 0.02), YA(top - th), (v1 - v0 - 0.04) * S3, (top - th) * S3, WOOD, INK, 1.2)
rect(XA(P.SIDE - v1), YA(top), (v1 - v0) * S3, th * S3, WOOD, INK, 1.4)
rect(XA(P.SIDE - face + 0.03), YA(top + 0.012), 0.16 * S3, 0.012 * S3, INK, INK, 1)
rect(XA(P.SIDE - face + 0.055), YA(ft + hg * 0.55), 0.03 * S3, (ft + hg * 0.55 - top) * S3, INK, INK, 1)
rect(XA(P.SIDE - face), YA(ft + hg + bz), sc['thick'] * S3, (hg + 2 * bz) * S3, INK, INK, 1)
rect(XA(P.SIDE - kb['v'][1]), YA(top + kb['high']), (kb['v'][1] - kb['v'][0]) * S3, kb['high'] * S3, DARK, INK, 1)
cv, seat = ch['v'], ch['seat']
line(XA(P.SIDE - cv - ch['base']), YA(0.07), XA(P.SIDE - cv + ch['base']), YA(0.07), INK, 3)
for e in (-1, 1):
    circle(XA(P.SIDE - cv + e * ch['base']), YA(0.03), 0.03 * S3, DARK, INK, 0.8)
line(XA(P.SIDE - cv), YA(0.08), XA(P.SIDE - cv), YA(seat - 0.06), STEEL, 5)
rect(XA(P.SIDE - cv - ch['deep'] / 2 - 0.02), YA(seat + 0.22), 0.05 * S3, 0.295 * S3, DARK, INK, 1)
rect(XA(P.SIDE - cv - ch['deep'] / 2), YA(seat), ch['deep'] * S3, 0.06 * S3, '#3b4d66', INK, 1.2, rx=3)
rect(XA(P.SIDE - cv - ch['deep'] / 2 - 0.075), YA(seat + ch['back']), 0.06 * S3, (ch['back'] - 0.10) * S3, '#3b4d66', INK, 1.2, rx=3)
# its numbers
mark(XA(P.SIDE - mid(d['v'])), YA(0.36), 1)
mark(XA(P.SIDE - cv) + 4, YA(seat) - 26, 2, (XA(P.SIDE - cv) + 4, YA(seat) - 2))
mark(XA(P.SIDE - face) - 30, YA(ft + hg) - 4, 3, (XA(P.SIDE - face) - 2, YA(ft + hg * 0.8)))
mark(XA(5.45), YA(tr['h'][1]) - 24, 9, (XA(5.45), YA(tr['h'][1]) - 1))
mark(XA(mid(bd['x'])), YA(bh1) - 22, 10)
mark(XA(mid(cal['x'])), YA(ch1) - 22, 11)
# its measures
dim(XA(bx1) + 26, YA(0), XA(bx1) + 26, YA(bh0), f'{bh0:.2f}', off=8)
line(XA(bx1) + 2, YA(bh0), XA(bx1) + 32, YA(bh0), DIM, 0.6, '2 3')
dim(XA(cx0) - 22, YA(0), XA(cx0) - 22, YA(ch0), f'{ch0:.2f}', off=8, side=-1)
line(XA(cx0) - 28, YA(ch0), XA(cx0) - 2, YA(ch0), DIM, 0.6, '2 3')
dim(XA(P.DOOR[1]), YA(0) + 28, XA(bx0), YA(0) + 28, f'{bx0 - P.DOOR[1]:.2f}', side=-1)
dim(XA(cx1), YA(0) + 28, XA(P.SIDE - v1), YA(0) + 28, f'{P.SIDE - v1 - cx1:.2f}', side=-1)

# ---------------------------------------------------------------------------------------------------------------------
# Beside the after wall: how it is fed, how it is worked, what is not built
# ---------------------------------------------------------------------------------------------------------------------
TX, y = 950, AY - 68
t(TX, y, 'HOW IT IS FED', 12, INK, weight='bold')
y += 20
for s in (
        f"· The owner's method statement for the suite (MS-CE-001) gives it a distribution board of its own, DB-CE, by the door, and the day room's sockets its circuit S1: a 16 A breaker, 3 x 2.5 mm², in skirting trunking, the back boxes {mid(sk['h']):.2f} m over the deck.",
        f"· Built so: the twin socket (7) and the data outlet (8) on her side under the desk; {trunk_m:.1f} m of skirting trunking (9) from them aft along her side, inboard along the after wall and up beside the door.",
        "· DB-CE IS NOT INSTALLED. Its place (10) is an outline and a sign; both cables end in the box under it and say so. The board that is to feed it does not exist aboard yet: the register enters its feeder from the lighting and small-power board.",
        f"· The computer draws {P.WATTS} W with its screen (typical for a desk computer; not a maker's figure). No network is built aboard: the maintenance program keeps its records on the computer and needs none."):
    y = wrapped(TX, y, s) + 3
y += 14
t(TX, y, 'HOW IT IS WORKED', 12, INK, weight='bold')
y += 20
for s in (
        "· A tap on the computer (3, 4, 5 or 6) sits one down at it: Maintenance Desk, a Johansson Co program, fills the page, inside the Chisum's own page.",
        '· One button, top left, always in sight: "Back to the Chisum". Escape does the same. One stands again where one stood.',
        "· The program holds every item aboard from the ship's own lists, with its jobs, its records, and the yard's drawings and instructions that are about it.",
        '· "Show on board" on an item puts the program away and brings the thing up aboard. A fitting\'s card aboard offers "Maintenance", which opens the program at that fitting.'):
    y = wrapped(TX, y, s) + 3
y += 14
t(TX, y, 'NOT BUILT, PLAINLY', 12, INK, weight='bold')
y += 20
for s in (
        "· The rest of the suite: the bedroom, the wet unit, the linings, the settee, a lamp over the desk. The chair does not turn. Nothing lies on the desk but the computer.",
        "· The distribution board DB-CE, the board that is to feed it, and any network: the cables end at the board's place.",
        "· The keys carry no letters. The calendar's picture was made with an image service from a description; its month is drawn from the calendar itself."):
    y = wrapped(TX, y, s) + 3

# ---------------------------------------------------------------------------------------------------------------------
# Its parts
# ---------------------------------------------------------------------------------------------------------------------
TY = YA(0) + 76
t(64, TY, 'ITS PARTS', 12, INK, weight='bold')
cols = (64, 104, 190, 400, 760)
rect(64, TY + 10, WIDTH - 128, 20, '#e9e6dc', INK, 0.8)
for x, h in zip(cols, ('No.', 'Tag', 'What', 'Where', 'Note')):
    t(x + 4, TY + 24, h, 10, INK, weight='bold')
T = P.TAGS
rows = [
    (1, T['desk'], 'Desk', f"Along her side at the room's after end, {u0 - P.AFT:.2f} m from the after wall", f"{u1 - u0:.2f} by {v1 - v0:.2f} m, {top:.2f} m high: two end panels, a back panel, {dr['count']} drawers at its forward end. Its forward {u1 - first[0]:.2f} m is under the window, {win['sill'] - top:.2f} m under the sill"),
    (2, T['chair'], 'Chair', 'Before the desk, inboard of it', 'On a five-star base with castors. Whoever sits in it faces her side: the window at the right hand, the calendar at the left'),
    (3, T['computer'], 'Screen', f"On the desk on its stand, {gap[1] - gap[0]:.2f} m clear of the window's edge", f"{w * 100:.0f} by {hg * 100:.0f} cm. While nobody sits at it, it shows the program's opening picture. Its two cables go down behind its stand and the desk"),
    (4, T['computer'], 'Keyboard', 'On the desk, before the screen', "Its cable goes along the back of the desk's top, over its edge and down her side to the system unit"),
    (5, T['computer'], 'Mouse', 'On its mat, at the right hand', 'Without a cable'),
    (6, T['computer'], 'System unit', "On the deck under the desk's after end", f"{P.WATTS} W with its screen (typical, not a maker's). {knee[1] - knee[0]:.2f} m for the knees. Its cables pass under the desk's back panel and are clipped to her side"),
    (7, T['socket'], 'Twin socket, 230 V', f"On her side under the desk, {mid(sk['h']):.2f} m up", 'Circuit S1 of DB-CE: 16 A, 3 x 2.5 mm², in the skirting trunking (MS-CE-001). The computer and its screen are plugged into it'),
    (8, T['data'], 'Data outlet', 'Beside the socket', 'Its cable goes in the same trunking to the same box. No network cabinet is installed. The program needs no network'),
    (9, '', 'Skirting trunking', 'Her side and the after wall, and up beside the door', f"{trunk_m:.1f} m, {(tr['h'][1] - tr['h'][0]) * 1000:.0f} by {tr['deep'] * 1000:.0f} mm, with a riser to each outlet. It carries the socket's cable and the data cable"),
    (10, T['board'], 'Place of DB-CE', f"On the after wall, {bx0 - P.DOOR[1]:.2f} m to port of the doorway, {bh0:.2f} m up", 'NOT INSTALLED: a yellow outline and a sign. THE TWO CABLES END IN THE BOX UNDER IT, and say so'),
    (11, T['calendar'], 'Calendar', f"On the after wall, {ch0:.2f} to {ch1:.2f} m up, left of whoever sits", f"{(cx1 - cx0) * 100:.0f} by {(ch1 - ch0) * 100:.0f} cm on a nail, wire-bound across its middle: the month's picture above, the month below, today ringed"),
]
y = TY + 30
for n, tag, what, where, note in rows:
    y += 20
    line(64, y + 5, WIDTH - 64, y + 5, '#ddd9cd', 0.8)
    for x, s in zip(cols, (str(n), tag, what, where, note)):
        t(x + 4, y, s, 10, INK)
t(64, HEIGHT - 22, 'Made by ferry/yard/drawings/cabin_drawing.py from ferry/blender/cabin_place.py: the numbers the room is built from.', 10, FAINT)
t(WIDTH - 64, HEIGHT - 22, 'Not class-approved; not construction information.', 10, FAINT, 'end')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" width="{WIDTH}" height="{HEIGHT}" font-family="Verdana, Geneva, sans-serif">'
       f'<rect width="{WIDTH}" height="{HEIGHT}" fill="{PAPER}"/>' + ''.join(out) + '</svg>')
path = os.path.join(HERE, 'JS5-511-chief-engineers-day-room.svg')
with open(path, 'w') as f:
    f.write(svg)
print(f'{os.path.relpath(path)}: {len(svg)} bytes')
