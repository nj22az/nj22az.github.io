#!/usr/bin/env python3
"""
JS4-413, the folding guard at each lifeboat station's open deck edge: drawn from the numbers it is built from.

    python3 ferry/yard/drawings/guard_drawing.py     writes, beside this file:
        JS4-413-lifeboat-station-guard.svg             along the deck's edge; across it, with the boat's way out; its parts

The owner, 13 November 2026: "Need a chain here on both sides so we don't fall down it needs to be removable".

Every number is read from ferry/blender/guard_place.py: the station's builder (blender/fittings_boats.py) reads the same file,
and stops if the station is not as that file has it. Change the guard there and draw again.
"""
import os
import sys
from html import escape
from math import cos, radians, sin

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'blender'))
import guard_place as G

bad = G.wrong()
if bad:
    raise SystemExit('JS4-413 is not drawn: the guard does not hold: ' + '; '.join(bad))

NUMBER, REVISION, DATE = 'JS4-413', '0', '13 November 2026'
WIDTH, HEIGHT = 1640, 1540
INK, PAPER, FAINT, DIM, RED, BLUE, STEEL, BOAT, DECK, CHAIN = '#22303a', '#fbfaf5', '#8b959b', '#5d6a72', '#c2412f', '#2f6fb7', '#d8dcdd', '#e9843c', '#5c7f6b', '#6f7a80'
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


def path(pts, stroke=INK, w=1.2, fill='none', dash=None, close=False):
    dashed = f' stroke-dasharray="{dash}"' if dash else ''
    d = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + (' Z' if close else '')
    out.append(f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" stroke-linejoin="round"{dashed}/>')


def mark(x, y, n, to=None):
    if to:
        line(x, y, to[0], to[1], DIM, 0.8)
    circle(x, y, 10, PAPER, INK, 1.2)
    t(x, y + 4, str(n), 11, INK, 'middle', 'bold')


def dim(x1, y1, x2, y2, s, off=14, side=1):
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


def wrapped(x, y, text, width=100, size=11, step=16):
    row = ''
    for word in text.split():
        if row and len(row) + 1 + len(word) > width:
            t(x, y, row, size, INK)
            y, row = y + step, '  ' + word
        else:
            row = f'{row} {word}' if row else word
    t(x, y, row, size, INK)
    return y + step


st = G.STATION
EZ, X0 = st['end_posts'], G.X
keel, keel_deg = G.keel_over_guard()
supports = (-EZ,) + G.POSTS + (EZ,)
bay = G.POSTS[1] - G.POSTS[0]
chain_m = 2 * sum(b - a for a, b in zip(supports, supports[1:]))

# ---------------------------------------------------------------------------------------------------------------------
# The sheet's head
# ---------------------------------------------------------------------------------------------------------------------
t(64, 46, 'CHISUM', 28, INK, weight='bold')
t(202, 46, f"Lifeboat stations: the folding guard at the deck's open edge · {NUMBER} · revision {REVISION} · {DATE}", 15, INK, weight='bold')
t(64, 66, "Boat deck, port and starboard (the starboard station is the mirror image). Drawn before it is built. The station itself, its davits, boat and end rails are as built (blender/fittings_boats.py); "
          "the guard is new.", 11, FAINT)

# ---------------------------------------------------------------------------------------------------------------------
# Along the deck's edge, seen from inboard
# ---------------------------------------------------------------------------------------------------------------------
S1, AX, AY, TOP = 150.0, 110, 150, 3.0
ZX = lambda z: AX + (z + 4.7) * S1
HY = lambda h: AY + (TOP - h) * S1
t(64, 108, "ALONG THE DECK'S EDGE", 12, INK, weight='bold')
t(64, 124, f'Seen from inboard: the sea is behind the sheet. {2 * EZ:.1f} m of edge are open between the inner posts of the station\'s end rails, about 10 m over the water. Heights over the deck.', 11, FAINT)
rect(ZX(-4.7), HY(TOP), 9.4 * S1, TOP * S1, '#f1f4f6', FAINT, 1)
rect(ZX(-4.7), HY(0), 9.4 * S1, 14, DECK, DECK, 1)
rect(ZX(-4.35), HY(st['coaming'][2]), 8.7 * S1, st['coaming'][2] * S1, STEEL, DIM, 0.8)
# the boat stowed, behind the guard: her keel and the turn of her bilge, and the davit arms' places
hull = [(ZX(-3.65 + 7.3 * k / 40), HY(st['boat'][1] + 1.02 * max(0.0, (abs(-1 + 2 * k / 40) - 0.70) / 0.30) ** 2.4)) for k in range(41)]
path(hull + [(ZX(3.65), HY(TOP)), (ZX(-3.65), HY(TOP))], BOAT, 1.4, '#f6d9c2', close=True)
t(ZX(0), HY(2.2), 'the boat, stowed: her keel 1.40 m over the deck', 11, '#9a4d17', 'middle')
for z in (-2.6, 2.6):
    rect(ZX(z - 0.14), HY(1.40), 0.28 * S1, 1.40 * S1, 'none', FAINT, 0.9, '4 3')
    t(ZX(z), HY(1.47), 'davit', 9, FAINT, 'middle')
# the station's end rails
for end in (1, -1):
    for h, w in zip(st['rail_courses'], (4, 2.6, 2.6)):
        line(ZX(end * EZ), HY(h), ZX(end * 4.40), HY(h), INK, w)
    for z in (EZ, 4.40):
        line(ZX(end * z), HY(0), ZX(end * z), HY(st['rail_courses'][0]), INK, 3)
    t(ZX(end * 4.1), HY(1.12), 'end rail', 9, DIM, 'middle')
# the guard: stanchions on their hinges, the two chains in four bays, the pads behind
for z in G.POSTS:
    rect(ZX(z - G.BASE['half']), HY(G.BASE['thick']), 2 * G.BASE['half'] * S1, G.BASE['thick'] * S1, STEEL, INK, 0.8)
    for sz in (-1, 1):
        rect(ZX(z + sz * G.CHEEK['apart'] - G.CHEEK['thick'] / 2), HY(G.CHEEK['high']), G.CHEEK['thick'] * S1, (G.CHEEK['high'] - G.BASE['thick']) * S1, '#ffffff', INK, 0.8)
    rect(ZX(z - G.TUBE), HY(G.TALL), 2 * G.TUBE * S1, (G.TALL - G.HINGE + G.HEEL) * S1, '#ffffff', INK, 1.2)
    circle(ZX(z), HY(G.LOCK), 3, RED, RED, 0.8)
    circle(ZX(z), HY(G.HINGE), 2.4, INK, INK, 0.8)
for a, b in zip(supports, supports[1:]):
    for h in G.COURSES:
        ha, hb = h - (0.030 if a == -EZ else 0.0), h - (0.030 if b == EZ else 0.0)
        pts = [(ZX(a + (b - a) * k / 16), HY(ha + (hb - ha) * k / 16 - G.SAG * 4 * (k / 16) * (1 - k / 16))) for k in range(17)]
        path(pts, CHAIN, 2.6, dash='5 2')
for end in (1, -1):
    for h in G.COURSES:
        circle(ZX(end * (EZ - 0.03)), HY(h - 0.030), 3.4, 'none', INK, 1.2)
# numbers and measures
mark(ZX(G.POSTS[1]) + 26, HY(0.80), 1, (ZX(G.POSTS[1]) + 3, HY(0.80)))
mark(ZX(G.POSTS[2]) + 34, HY(0.22), 2, (ZX(G.POSTS[2]) + 9, HY(0.07)))
mark(ZX(G.POSTS[0]) - 30, HY(0.24), 3, (ZX(G.POSTS[0]) - 3, HY(G.LOCK)))
mark(ZX(-0.95), HY(1.16), 4, (ZX(-0.95), HY(0.985)))
mark(ZX(EZ) - 34, HY(0.44), 5, (ZX(EZ - 0.04), HY(0.60)))
dim(ZX(-EZ), HY(0) + 40, ZX(G.POSTS[0]), HY(0) + 40, f'{G.POSTS[0] + EZ:.2f}', side=-1)
dim(ZX(G.POSTS[0]), HY(0) + 40, ZX(G.POSTS[1]), HY(0) + 40, f'{bay:.2f}', side=-1)
dim(ZX(G.POSTS[1]), HY(0) + 40, ZX(G.POSTS[2]), HY(0) + 40, f'{bay:.2f}', side=-1)
dim(ZX(G.POSTS[2]), HY(0) + 40, ZX(EZ), HY(0) + 40, f'{EZ - G.POSTS[2]:.2f}', side=-1)
dim(ZX(-EZ), HY(0) + 70, ZX(EZ), HY(0) + 70, f'{2 * EZ:.1f} m open', side=-1)
dim(ZX(-4.7) - 16, HY(0), ZX(-4.7) - 16, HY(G.COURSES[0]), f'{G.COURSES[0]:.2f}', off=8, side=-1)
dim(ZX(-4.7) - 56, HY(0), ZX(-4.7) - 56, HY(G.COURSES[1]), f'{G.COURSES[1]:.2f}', off=8, side=-1)
t(ZX(-4.7) + 8, HY(TOP) + 16, 'aft', 10, FAINT)
t(ZX(4.7) - 8, HY(TOP) + 16, 'forward (port station)', 10, FAINT, 'end')

# ---------------------------------------------------------------------------------------------------------------------
# Across the deck's edge, looking forward: the guard up and folded; the boat's way out
# ---------------------------------------------------------------------------------------------------------------------
S2, BX, BY, TOP2 = 150.0, 110, 760, 3.0
XX = lambda x: BX + (x + 3.9) * S2
HY2 = lambda h: BY + (TOP2 - h) * S2
t(64, BY - 42, "ACROSS THE DECK'S EDGE", 12, INK, weight='bold')
t(64, BY - 26, 'Port station, looking forward: outboard is to the right. The guard up (full) and folded (dashed); the boat stowed, and her keel\'s way out.', 11, FAINT)
rect(XX(-3.9), HY2(TOP2), 5.5 * S2, TOP2 * S2, '#f1f4f6', FAINT, 1)
rect(XX(-3.9), HY2(0), 3.9 * S2, 14, DECK, DECK, 1)
line(XX(0), HY2(0), XX(0), HY2(0) + 60, INK, 2)
t(XX(0) + 8, HY2(0) + 34, 'her side', 10, FAINT)
t(XX(0.8), HY2(0.35), 'the sea, 10 m below', 10, BLUE, 'middle', italic=True)
rect(XX(st['coaming'][0]), HY2(st['coaming'][2]), (st['coaming'][1] - st['coaming'][0]) * S2, st['coaming'][2] * S2, STEEL, DIM, 0.8)
# the davit: its frame's doubler, its pin; the boat stowed (her section amidships)
rect(XX(-3.56), HY2(0.02), (3.56 - 1.20) * S2, 0.02 * S2, STEEL, DIM, 0.8)
circle(XX(st['pin'][0]), HY2(st['pin'][1]), 6, '#ffffff', INK, 1.2)
t(XX(st['pin'][0]), HY2(st['pin'][1]) + 22, "the davit's pin", 9, DIM, 'middle')
cx, ky = st['boat']
section = [(XX(cx + (1 if a >= 0 else -1) * 1.30 * abs(sin(radians(a))) ** 0.7), HY2(ky + 1.10 * (1 - cos(radians(a))))) for a in range(-90, 91, 6)]
path(section, BOAT, 1.4, '#f6d9c2', close=True)
t(XX(cx), HY2(ky + 0.70), 'the boat, stowed', 11, '#9a4d17', 'middle')
# her keel's way out, and where it passes the guard's line
(px, py), (hx, hy) = st['pin'], st['head']
way = []
for k in range(0, int(st['turn']) * 2 + 1):
    a = radians(k / 2)
    x, y = px + (hx - px) * cos(a) + (hy - py) * sin(a), py - (hx - px) * sin(a) + (hy - py) * cos(a)
    if ky + y - hy >= 0.0 and cx + x - hx <= 1.6:
        way.append((XX(cx + x - hx), HY2(ky + y - hy)))
path(way, RED, 1.4, dash='6 3')
circle(XX(X0), HY2(keel), 4, RED, RED, 1)
line(XX(X0) + 5, HY2(keel), XX(0.42), HY2(1.62), RED, 0.8)
t(XX(0.45), HY2(1.70), f"her keel passes the guard's line", 10, RED)
t(XX(0.45), HY2(1.70) + 13, f'{keel:.2f} m over the deck, {keel_deg:.0f} degrees', 10, RED)
t(XX(0.45), HY2(1.70) + 26, f'out of {st["turn"]:.0f}: the guard stands {G.TALL:.2f} m', 10, RED)
# the guard up, and folded
rect(XX(G.BASE['x'][0]), HY2(G.BASE['thick']), (G.BASE['x'][1] - G.BASE['x'][0]) * S2, G.BASE['thick'] * S2, STEEL, INK, 0.8)
rect(XX(G.CHEEK['x'][0]), HY2(G.CHEEK['high']), (G.CHEEK['x'][1] - G.CHEEK['x'][0]) * S2, (G.CHEEK['high'] - G.BASE['thick']) * S2, '#ffffff', INK, 0.8)
rect(XX(X0 - G.TUBE), HY2(G.TALL), 2 * G.TUBE * S2, (G.TALL - G.HINGE + G.HEEL) * S2, '#ffffff', INK, 1.4)
for h in G.COURSES:
    circle(XX(X0), HY2(h), 3.4, CHAIN, INK, 0.8)
circle(XX(X0), HY2(G.LOCK), 3, RED, RED, 0.8)
fx, fy = G.folded(X0, G.TALL)
rect(XX(fx), HY2(G.HINGE + G.TUBE), (X0 - fx) * S2, 2 * G.TUBE * S2, 'none', INK, 1.2, '5 3')
for h in G.COURSES:
    qx, qy = G.folded(X0, h)
    circle(XX(qx), HY2(qy), 3.4, 'none', INK, 0.9)
rect(XX(X0 - G.PAD['at'] - G.PAD['half']), HY2(G.PAD['high']), 2 * G.PAD['half'] * S2, G.PAD['high'] * S2, INK, INK, 0.8)
out.append(f'<path d="M{XX(X0 - 0.45):.1f} {HY2(0.86):.1f} A{0.9 * S2:.1f} {0.9 * S2:.1f} 0 0 0 {XX(X0 - 0.86):.1f} {HY2(0.45):.1f}" fill="none" stroke="{DIM}" stroke-width="0.9" stroke-dasharray="3 3"/>')
t(XX(X0 - 0.80), HY2(0.80), f'folds {G.FOLD:.0f}°', 10, DIM, 'middle')
t(XX(X0 - 0.80), HY2(0.80) + 13, 'inboard', 10, DIM, 'middle')
mark(XX(X0) - 34, HY2(1.16), 1, (XX(X0) - 4, HY2(1.02)))
mark(XX(G.BASE['x'][0]) - 30, HY2(0.26), 2, (XX(G.CHEEK['x'][0]), HY2(0.10)))
mark(XX(X0 - G.PAD['at']), HY2(0.30), 6, (XX(X0 - G.PAD['at']), HY2(G.PAD['high']) - 2))
dim(XX(fx), HY2(0) + 40, XX(0), HY2(0) + 40, f'{-fx:.2f} m, folded', side=-1)
dim(XX(-3.9) - 16, HY2(0), XX(-3.9) - 16, HY2(ky), f'{ky:.2f}', off=8, side=-1)

# ---------------------------------------------------------------------------------------------------------------------
# Beside it: how it is worked; what is not built
# ---------------------------------------------------------------------------------------------------------------------
TX, y = 980, BY - 42
t(TX, y, 'HOW IT IS WORKED', 12, INK, weight='bold')
y += 20
for s in (
        "· It stands, as drawn, whenever the boat is stowed: nobody walks off the open edge under her.",
        "· Before the boat is swung out: the four snap hooks off the end posts' eyes, the three locking pins out, and the stanchions fold inboard flat on the deck with their chains, each head on its pad. On the page: a tap on the guard, at either station.",
        f"· THE DAVITS ARE NOT TURNED OUT WHILE THE GUARD STANDS: her keel would strike it ({keel:.2f} m against {G.TALL:.2f} m). The page refuses the order and says why.",
        "· THE GUARD IS NOT RAISED WHILE THE DAVITS ARE OUT. When the boat is home and the davits are stowed, a tap raises it again: pins in, hooks on."):
    y = wrapped(TX, y, s, width=92) + 3
y += 14
t(TX, y, 'NOT BUILT, PLAINLY', 12, INK, weight='bold')
y += 20
for s in (
        "· The gaps in the rail at the liferafts' cradles (1.7 m each) have no guard: a raft in its cradle stands in each. Say if they are to have chains too.",
        "· No scantling is calculated. Chain, hooks and pins are the yard's choice; the rule behind a guard's height and openings is as the yard's reference has it, not read again.",
        "· Folded, the chains lie as stiff as they hung: the model's parts are rigid."):
    y = wrapped(TX, y, s, width=92) + 3

# ---------------------------------------------------------------------------------------------------------------------
# Its parts
# ---------------------------------------------------------------------------------------------------------------------
TY = HY2(0) + 96
t(64, TY, 'ITS PARTS, AT EACH STATION', 12, INK, weight='bold')
cols = (64, 104, 330, 520)
rect(64, TY + 10, WIDTH - 128, 20, '#e9e6dc', INK, 0.8)
for x, h in zip(cols, ('No.', 'What', 'How many', 'Note')):
    t(x + 4, TY + 24, h, 10, INK, weight='bold')
rows = [
    (1, 'Folding stanchion', f'{len(G.POSTS)}', f"{2 * G.TUBE * 1000:.0f} mm tube, {G.TALL:.2f} m high, a boss on its hinge pin, an eye for each chain toward each neighbour. They stand {bay:.2f} m apart on the end rails' own line"),
    (2, 'Hinge', f'{len(G.POSTS)}', f"A base plate {(G.BASE['x'][1] - G.BASE['x'][0]) * 1000:.0f} by {2 * G.BASE['half'] * 1000:.0f} mm welded to the deck, two cheeks {G.CHEEK['high'] * 1000:.0f} mm high, the hinge pin {G.HINGE * 1000:.0f} mm over the deck"),
    (3, 'Locking pin', f'{len(G.POSTS)}', f"Through both cheeks and the stanchion, {G.LOCK * 1000:.0f} mm over the deck: red, with a ring, on a lanyard to the base plate. It holds the stanchion upright"),
    (4, 'Chain', f'2 courses, {chain_m:.1f} m', f"{G.CHAIN * 1000:.0f} mm galvanised chain at {G.COURSES[0]:.2f} and {G.COURSES[1]:.2f} m, the heights of the rail's top and middle courses, in four bays; it hangs {G.SAG * 1000:.0f} mm in the middle of a bay"),
    (5, 'Snap hook and eye', '4', "Each chain ends in a snap hook, hooked into an eye welded to the end rail's inner post under its rail course"),
    (6, 'Pad', f'{len(G.POSTS)}', f"Rubber, {G.PAD['high'] * 1000:.0f} mm high, {G.PAD['at']:.2f} m inboard of the hinge: a folded stanchion's head lies on it, clear of the davit frames"),
]
y = TY + 30
for n, what, many, note in rows:
    y += 20
    line(64, y + 5, WIDTH - 64, y + 5, '#ddd9cd', 0.8)
    for x, s in zip(cols, (str(n), what, many, note)):
        t(x + 4, y, s, 10, INK)
t(64, HEIGHT - 22, 'Made by ferry/yard/drawings/guard_drawing.py from ferry/blender/guard_place.py: the numbers the guard is built from.', 10, FAINT)
t(WIDTH - 64, HEIGHT - 22, 'Not class-approved; not construction information.', 10, FAINT, 'end')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" width="{WIDTH}" height="{HEIGHT}" font-family="Verdana, Geneva, sans-serif">'
       f'<rect width="{WIDTH}" height="{HEIGHT}" fill="{PAPER}"/>' + ''.join(out) + '</svg>')
dest = os.path.join(HERE, 'JS4-413-lifeboat-station-guard.svg')
with open(dest, 'w') as f:
    f.write(svg)
print(f'{os.path.relpath(dest)}: {len(svg)} bytes')
