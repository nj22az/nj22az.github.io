#!/usr/bin/env python3
"""
JS1-102, the general arrangement: drawn from the arrangement's own numbers (ferry/blender/ga.py).

    python3 ferry/yard/drawings/ga_drawing.py          writes JS1-102-general-arrangement.svg beside this file

A profile and five plans at one scale, bow to the right, port up; every space carries a number, named beside its plan.
Nothing is drawn that ga.py does not say: change the arrangement there and draw again.
"""
import os
import sys
from html import escape

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'blender'))
import ga as G

K = 13.0                         # pixels to a metre
LEFT, KEYS, WIDTH = 64, 64 + G.LENGTH * K + 150, 1640
INK, PAPER, FAINT, WATER = '#22303a', '#fbfaf5', '#8b959b', '#2f6f74'
FILL = dict(machinery='#e9d9c3', tank='#d5e3ea', vehicle='#e6e6df', passenger='#f6e7b8', crew='#dcebd3', service='#e8dcec', safety='#f3cfc8',
            open='#f4f3ee', bridge='#cfe3df')
out = []


def X(yard):
    return LEFT + yard * K


def add(s):
    out.append(s)


def text(x, y, s, size=11, anchor='start', weight='400', fill=INK, extra=''):
    add(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}" fill="{fill}" {extra}>{escape(s)}</text>')


def wrap(s, n):
    words, lines, line = s.split(), [], ''
    for w in words:
        if len(line) + len(w) + 1 > n and line:
            lines.append(line)
            line = w
        else:
            line = (line + ' ' + w).strip()
    return lines + ([line] if line else [])


def outline(level, a, b, cy, step=0.6):
    """The deck's edge from a to b, port side out and starboard side back: SVG points."""
    ys = [a + i * step for i in range(int(round((b - a) / step)) + 1)]
    port = [(X(y), cy - G.half_breadth(y, level) * K) for y in ys]
    star = [(X(y), cy + G.half_breadth(y, level) * K) for y in reversed(ys)]
    return ' '.join(f'{x:.1f},{y:.1f}' for x, y in port + star)


# ---------------------------------------------------------------------------------------------------------------------
y = 34
text(LEFT, y, 'CHISUM', 26, weight='700')
text(LEFT + 138, y, f'General arrangement  ·  JS1-102  ·  revision {G.REVISION}  ·  11 November 2026', 15, weight='600')
text(LEFT, y + 20, 'Johansson Shipyard, newbuilding No. 1, rebuilt at 68 m for Johansson Line.  As her bare ship is built from it. Still a proposal for the owner\'s approval: nothing is calculated beyond the volume under her lines.', 11.5, fill=FAINT)
text(WIDTH - 24, y, 'Bow to the right, port up.  Metres.', 11.5, 'end', fill=FAINT)

# ---- the profile
top = 86
base = top + max(G.MAST_TOP, G.FUNNEL_TOP + 1.0) * K + 6


def H(h):
    return base - h * K


text(LEFT, top - 8, 'PROFILE', 12, weight='700')
add(f'<line x1="{X(-3):.1f}" y1="{H(G.DRAFT):.1f}" x2="{X(G.LENGTH + 3):.1f}" y2="{H(G.DRAFT):.1f}" stroke="{WATER}" stroke-width="1"/>')
text(X(G.LENGTH + 3) + 4, H(G.DRAFT) + 4, f'waterline {G.DRAFT} m', 10, fill=WATER)
ys = [i * 0.3 for i in range(int(G.LENGTH / 0.3) + 1)] + [G.LENGTH]
hull = [(X(0), H(G.DECKS['passenger']))] + [(X(v), H(G.keel(v))) for v in ys] + [(X(G.LENGTH), H(G.DECKS['passenger']))]
add(f'<polygon points="{" ".join(f"{a:.1f},{b:.1f}" for a, b in hull)}" fill="#ffffff" stroke="{INK}" stroke-width="1.6"/>')
for name, a, b, lo, hi in G.PROFILE[1:]:
    if name == 'funnel':
        pts = [(X(a), H(lo)), (X(a + 0.5), H(hi - 0.9)), (X(b), H(hi)), (X(b), H(lo))]
        add(f'<polygon points="{" ".join(f"{p:.1f},{q:.1f}" for p, q in pts)}" fill="#ffffff" stroke="{INK}" stroke-width="1.4"/>')
        add(f'<rect x="{X(a + 0.35):.1f}" y="{H(hi - 1.2):.1f}" width="{(b - a - 0.35) * K:.1f}" height="{1.1 * K:.1f}" fill="{WATER}" opacity="0.85"/>')
        cx, ch = X((a + b) / 2 + 0.1), H(lo + (hi - lo) * 0.45)
        add(f'<circle cx="{cx:.1f}" cy="{ch:.1f}" r="{1.5 * K:.1f}" fill="none" stroke="{WATER}" stroke-width="2.2"/>')
        text(cx, ch + 9, 'J', 26, 'middle', '700', WATER)
    else:
        add(f'<rect x="{X(a):.1f}" y="{H(hi):.1f}" width="{(b - a) * K:.1f}" height="{(hi - lo) * K:.1f}" fill="#ffffff" stroke="{INK}" stroke-width="1.4"/>')
for name, a, b, lo, n in (('passenger house', 15.0, 53.0, G.DECKS['passenger'] + 1.1, 24), ('accommodation', 23.5, 49.0, G.DECKS['bridge'] + 1.2, 13)):
    for i in range(n):
        add(f'<rect x="{X(a + (b - a) * i / n):.1f}" y="{H(lo + 0.9):.1f}" width="{(b - a) / n * 0.62 * K:.1f}" height="{0.9 * K:.1f}" fill="#cfe0e6" stroke="{INK}" stroke-width="0.5"/>')
add(f'<rect x="{X(50.4):.1f}" y="{H(G.DECKS["bridge"] + 2.1):.1f}" width="{3.0 * K:.1f}" height="{1.0 * K:.1f}" fill="#cfe0e6" stroke="{INK}" stroke-width="0.5"/>')
for a, b, h in ((0.0, 13.0, G.DECKS['passenger']), (13.0, 22.0, G.DECKS['bridge']), (22.0, 27.0, G.DECKS['top']), (46.2, 50.0, G.DECKS['top']), (54.0, G.LENGTH - 0.4, G.DECKS['mooring'])):
    add(f'<path d="M{X(a):.1f},{H(h + 1.05):.1f} H{X(b):.1f}" stroke="{INK}" stroke-width="0.7" fill="none"/>')
    for v in [a + i * 1.5 for i in range(int((b - a) / 1.5) + 1)]:
        add(f'<path d="M{X(v):.1f},{H(h):.1f} V{H(h + 1.05):.1f}" stroke="{INK}" stroke-width="0.5"/>')
# the mast, the radar, the decks inside her, the bulkheads
add(f'<path d="M{X(51.3):.1f},{H(G.DECKS["top"]):.1f} V{H(G.MAST_TOP):.1f} M{X(49.9):.1f},{H(17.0):.1f} H{X(52.7):.1f} M{X(50.6):.1f},{H(17.4):.1f} H{X(52.0):.1f}" stroke="{INK}" stroke-width="1.6" fill="none"/>')
for key, a, b, dash in (('car', 0.0, G.fr(103), ''), ('tank_top', G.fr(24), G.fr(90), ''), ('flat', G.fr(46), G.fr(55), '4 3'), ('mooring', 54.0, G.LENGTH - 0.3, '')):
    add(f'<path d="M{X(a):.1f},{H(G.DECKS[key]):.1f} H{X(b):.1f}" stroke="{INK}" stroke-width="1" fill="none" stroke-dasharray="{dash}"/>')
for n, what in G.BULKHEADS:
    add(f'<path d="M{X(G.fr(n)):.1f},{H(max(G.keel(G.fr(n)), 0)):.1f} V{H(G.DECKS["car"]):.1f}" stroke="{INK}" stroke-width="1.3"/>')
    text(X(G.fr(n)), H(-0.9) + 2, f'fr {n}', 9, 'middle', fill=FAINT)
add(f'<path d="M{X(0):.1f},{H(G.DECKS["car"]):.1f} V{H(G.DECKS["passenger"]):.1f}" stroke="{INK}" stroke-width="3.2"/>')                      # the stern ramp, stowed
add(f'<path d="M{X(G.fr(103) + 0.1):.1f},{H(G.DECKS["car"]):.1f} V{H(G.DECKS["car"] + 4.3):.1f}" stroke="{INK}" stroke-width="2.6"/>')        # the inner bow door, shut in the collision bulkhead's line
add(f'<path d="M{X(62.0):.1f},{H(G.DECKS["passenger"]):.1f} L{X(63.3):.1f},{H(3.9):.1f}" stroke="{INK}" stroke-width="0.9" stroke-dasharray="5 3" fill="none"/>')   # the visor's seam
add(f'<circle cx="{X(G.fr(92)):.1f}" cy="{H(1.4):.1f}" r="{0.6 * K:.1f}" fill="none" stroke="{INK}" stroke-width="1"/>')                             # the thruster tunnel
add(f'<path d="M{X(1.4):.1f},{H(2.68):.1f} L{X(1.55):.1f},{H(0.25):.1f} H{X(2.75):.1f} L{X(2.85):.1f},{H(2.68):.1f} Z" fill="#ffffff" stroke="{INK}" stroke-width="1.2"/>')   # a rudder
add(f'<path d="M{X(3.8):.1f},{H(2.2):.1f} V{H(0.2):.1f}" stroke="{INK}" stroke-width="2.4"/><path d="M{X(3.8):.1f},{H(1.2):.1f} L{X(12.6):.1f},{H(2.44):.1f}" stroke="{INK}" stroke-width="1"/>')     # a screw, and its shaft to the gearbox's flange
for label, a, b, h in (('Steering', 0.3, 4.8, 4.1), ('Shafts', 4.8, 10.8, 3.4), ('Engine room', 10.8, 24.6, 2.4), ('Auxiliary engine room', 24.6, 33.0, 2.0), ('Fuel', 33.0, 42.0, 2.4),
                       ('Ballast', 42.0, 51.0, 2.4), ('Thruster', 51.0, 57.6, 3.0), ('Vehicle deck: 4.3 m clear', 4.0, 58.0, 7.2), ('Saloon', 21.0, 54.0, 10.4),
                       ('Crew', 22.0, 50.0, 13.2), ('Bridge', 50.0, 54.0, 13.0), ('CO₂', 27.0, 29.2, 16.6), ('Emergency generator', 29.8, 37.8, 16.6),
                       ('Ventilation room', 40.0, 46.2, 16.6)):
    text(X((a + b) / 2), H(h), label, 9.5 if b - a > 6 else 8.5, 'middle', fill=INK)
for a in (29.2, 29.8, 37.8, 38.6, 40.0):
    add(f'<path d="M{X(a):.1f},{H(G.DECKS["top"]):.1f} V{H(G.DECKS["top_house"]):.1f}" stroke="{INK}" stroke-width="0.9"/>')
for key, label in (('car', 'Car deck'), ('passenger', 'Passenger deck'), ('bridge', 'Bridge deck'), ('top', 'Top deck'), ('top_house', '')):
    if label:
        text(X(G.LENGTH + 3) + 4, H(G.DECKS[key]) + 4, f'{label} {G.DECKS[key]} m', 10, fill=FAINT)
        add(f'<path d="M{X(G.LENGTH) + 6:.1f},{H(G.DECKS[key]):.1f} H{X(G.LENGTH + 3):.1f}" stroke="{FAINT}" stroke-width="0.6"/>')
for n in range(0, 115, 10):
    add(f'<path d="M{X(G.fr(n)):.1f},{H(-0.25):.1f} V{H(-0.55):.1f}" stroke="{FAINT}" stroke-width="0.7"/>')
add(f'<path d="M{X(0):.1f},{H(-0.25):.1f} H{X(G.LENGTH):.1f}" stroke="{FAINT}" stroke-width="0.7"/>')
text(X(0), H(-1.9), f'Watertight bulkheads at the frames named; frame spacing {G.FRAME_SPACING} m, frame 0 at the transom.  Scale: the ticks are ten frames (6 m) apart.', 10, fill=FAINT)
# the particulars, beside the profile
ty = top + 4
text(KEYS, ty, 'PRINCIPAL PARTICULARS', 12, weight='700')
ty += 6
for name, value in G.PARTICULARS:
    lines = wrap(value, 44)
    ty += 15
    text(KEYS, ty, name, 10.5, weight='600')
    for i, line in enumerate(lines):
        text(KEYS + 196, ty + i * 12.5, line, 10.5)
    ty += (len(lines) - 1) * 12.5

# ---- the plans
y = max(base + 46, ty + 34)
EXTENT = dict(top=(13.0, 54.0), bridge=(13.0, 54.0), passenger=(0.0, G.LENGTH), car=(0.0, G.LENGTH), hold=(0.0, G.LENGTH - 2.2))
for plan, title, level in G.PLANS:
    spaces = [s for s in G.SPACES if s['plan'] == plan]
    cy = y + 22 + G.HB * K
    lvl = 'hold' if plan == 'hold' else 'car' if plan == 'car' else 'upper'
    text(LEFT, y + 6, title.upper() if plan != 'hold' else 'BELOW THE CAR DECK', 12, weight='700')
    text(LEFT + (152 if plan != 'hold' else 190), y + 6, f'{level} m above the keel' + ('' if plan != 'hold' else ': at the tank top, and where her bottom rises over it 0.6 m over her bottom; what stands on the flat at 2.9 m is dashed'), 10.5, fill=FAINT)
    a, b = EXTENT[plan]
    add(f'<polygon points="{outline(lvl, 0.0, G.LENGTH - (2.2 if plan == "hold" else 0.0), cy)}" fill="none" stroke="{FAINT}" stroke-width="0.7" stroke-dasharray="3 3"/>')
    add(f'<clipPath id="clip-{plan}"><polygon points="{outline(lvl, a, b, cy)}"/></clipPath>')
    add(f'<polygon points="{outline(lvl, a, b, cy)}" fill="#ffffff" stroke="none"/>')
    numbers, keys = {}, []
    for s in sorted(spaces, key=lambda s: (s['level'] is not None, s['yard'][0], -s['x'][1])):
        base_name = s['name'].replace(', port', '').replace(', starboard', '')
        twin = s['id'][:-2] if s['id'].endswith(('-p', '-s')) else None
        key = (twin, base_name) if twin and base_name != s['name'] else (s['id'], s['name'])
        if key not in numbers:
            numbers[key] = len(numbers) + 1
            keys.append((numbers[key], base_name if key[0] == twin else s['name'], s['kind']))
        s['_n'] = numbers[key]
    add(f'<g clip-path="url(#clip-{plan})">')
    for s in sorted(spaces, key=lambda s: -(s['yard'][1] - s['yard'][0]) * (s['x'][1] - s['x'][0])):
        (ya, yb), (x0, x1) = s['yard'], s['x']
        dash = ' stroke-dasharray="5 3" fill-opacity="0.55"' if s['level'] else ''
        add(f'<rect x="{X(ya):.1f}" y="{cy - x1 * K:.1f}" width="{(yb - ya) * K:.1f}" height="{(x1 - x0) * K:.1f}" fill="{FILL[s["kind"]]}" stroke="{INK}" stroke-width="0.9"{dash}/>')
    if plan == 'car':
        for lane in (-2.6, 0.0, 2.6):
            add(f'<path d="M{X(3.0):.1f},{cy - lane * K:.1f} H{X(57.5):.1f}" stroke="{FAINT}" stroke-width="0.8" stroke-dasharray="14 8"/>')
    add('</g>')
    add(f'<polygon points="{outline(lvl, a, b, cy)}" fill="none" stroke="{INK}" stroke-width="1.6"/>')
    if plan == 'hold':
        for n, what in G.BULKHEADS:
            hb = G.half_breadth(G.fr(n), 'hold') * K
            add(f'<path d="M{X(G.fr(n)):.1f},{cy - hb:.1f} V{cy + hb:.1f}" stroke="{INK}" stroke-width="1.8"/>')
    for s in spaces:
        (ya, yb), (x0, x1) = s['yard'], s['x']
        mid = (ya + yb) / 2
        hb = G.half_breadth(mid, lvl)
        xa, xb = max(x0, -hb), min(x1, hb)
        if xb - xa < 0.4:
            continue
        px, py = X(mid), cy - (xa + xb) / 2 * K
        if s.get('label'):
            px, py = X(s['label'][0]), cy - s['label'][1] * K
        small = min(yb - ya, xb - xa) < 1.9
        add(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{6.5 if small else 8.5}" fill="#ffffff" stroke="{INK}" stroke-width="0.8"/>')
        text(px, py + (3.2 if small else 3.8), str(s['_n']), 8.5 if small else 10.5, 'middle', '600')
    cols = 2 if len(keys) > 12 else 1
    rows = -(-len(keys) // cols)
    for i, (n, name, kind) in enumerate(keys):
        kx, ky = KEYS + (i // rows) * 236, y + 24 + (i % rows) * 13.4
        add(f'<rect x="{kx:.1f}" y="{ky - 9:.1f}" width="10" height="10" fill="{FILL[kind]}" stroke="{INK}" stroke-width="0.6"/>')
        text(kx + 15, ky, f'{n}', 10, weight='700')
        text(kx + 32, ky, name if len(name) <= (36 if cols == 2 else 70) else name[:(35 if cols == 2 else 69)] + '…', 10)
    y = max(cy + G.HB * K + 34, y + 24 + rows * 13.4 + 20)

# ---- what the colours mean, and what the yard asks
text(LEFT, y + 6, 'WHAT THE COLOURS MEAN', 12, weight='700')
x = LEFT
for kind, label in G.KINDS.items():
    add(f'<rect x="{x:.1f}" y="{y + 16:.1f}" width="12" height="12" fill="{FILL[kind]}" stroke="{INK}" stroke-width="0.6"/>')
    text(x + 17, y + 26, label, 10.5)
    x += 30 + len(label) * 6.4
y += 54
text(LEFT, y, 'FOR THE OWNER TO SETTLE', 12, weight='700')
for i, q in enumerate(G.QUESTIONS):
    for j, line in enumerate(wrap(f'{i + 1}.  {q}', 190)):
        y += 15
        text(LEFT + (0 if j == 0 else 18), y, line, 11)
y += 26
text(LEFT, y, 'Made from ferry/blender/ga.py by ferry/yard/drawings/ga_drawing.py. Proportions as the yard recalls small coastal car and passenger ferries of this length; no ship was copied and no rule text was read for this revision.', 10, fill=FAINT)
height = y + 24
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {height:.0f}" width="{WIDTH}" height="{height:.0f}" font-family="DejaVu Sans, Helvetica, Arial, sans-serif">'
       f'<rect width="{WIDTH}" height="{height:.0f}" fill="{PAPER}"/>' + ''.join(out) + '</svg>')
path = os.path.join(HERE, 'JS1-102-general-arrangement.svg')
open(path, 'w').write(svg)
print(f'{path}: {WIDTH} x {height:.0f}, {len(G.SPACES)} spaces, {len(svg)} bytes')
