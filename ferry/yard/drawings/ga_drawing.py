#!/usr/bin/env python3
"""
JS1-102, the general arrangement: drawn from the arrangement's own numbers (ferry/blender/ga.py), her lines
(ferry/blender/lines.py) and her specification (ferry/blender/spec.py).

    python3 ferry/yard/drawings/ga_drawing.py          writes JS1-102-general-arrangement.svg beside this file

A profile and seven plans at one scale, bow to the right, port up; every space carries a number, named beside its plan;
the places of her deck fittings (spec.OUTFIT) are marked on the plans. Nothing is drawn that those three files do not
say: change the arrangement there and draw again.
"""
import os
import sys
from html import escape
from math import sqrt

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'blender'))
import ga as G
import lines as L
import spec as S

K = 9.4                          # pixels to a metre
LEFT = 64
KEYS = LEFT + G.LENGTH * K + 150
WIDTH = int(KEYS + 2 * 244 + 16)
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


def poly(points, fill='none', stroke=INK, width=1.0, extra=''):
    add(f'<polygon points="{" ".join(f"{a:.1f},{b:.1f}" for a, b in points)}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" {extra}/>')


def path(d, stroke=INK, width=1.0, dash='', fill='none'):
    add(f'<path d="{d}" stroke="{stroke}" stroke-width="{width}" fill="{fill}"' + (f' stroke-dasharray="{dash}"' if dash else '') + '/>')


def outline(level, a, b, cy, step=0.6):
    """The deck's edge from a to b, port side out and starboard side back: SVG points."""
    ys = [a + i * step for i in range(int(round((b - a) / step)) + 1)]
    port = [(X(y), cy - G.half_breadth(y, level) * K) for y in ys]
    star = [(X(y), cy + G.half_breadth(y, level) * K) for y in reversed(ys)]
    return ' '.join(f'{x:.1f},{y:.1f}' for x, y in port + star)


D = G.DECKS
H0, H1 = G.HOUSE
# ---------------------------------------------------------------------------------------------------------------------
y = 34
text(LEFT, y, 'CHISUM', 26, weight='700')
text(LEFT + 138, y, f'General arrangement  ·  JS1-102  ·  revision {G.REVISION}  ·  12 November 2026', 15, weight='600')
text(LEFT, y + 20, 'Johansson Shipyard, newbuilding No. 1, rebuilt as a ro-ro freight ferry of 124.8 m for Johansson Line. As her bare ship is built from it. '
     'A proposal for the owner\'s approval: nothing is calculated beyond the volume under her lines.', 11.5, fill=FAINT)
text(WIDTH - 24, y, 'Bow to the right, port up.  Metres.', 11.5, 'end', fill=FAINT)

# ---- the profile
top = 86
base = top + (G.MAST_TOP + 0.6) * K + 6


def H(h):
    return base - h * K


text(LEFT, top - 8, 'PROFILE', 12, weight='700')
path(f'M{X(-3):.1f},{H(G.DRAFT):.1f} H{X(G.LENGTH + 3):.1f}', WATER, 1)
text(X(G.LENGTH + 3) + 4, H(G.DRAFT) + 4, f'waterline {G.DRAFT} m', 10, fill=WATER)
# her hull: the transom, the keel with the run aft and the forefoot, the raked stem to its head, the rail and the sheer back aft
ys = [i * 0.3 for i in range(int(G.LENGTH / 0.3) + 1)] + [G.LENGTH]
rail = lambda v: L.above_keel(L.rail_y(L.Z(v)))
deck = lambda v: L.above_keel(L.deck_y(L.Z(v)))
bulwarked = lambda v: any(a - 1e-6 <= v <= b + 1e-6 for a, b in S.BULWARKS)
head = [(X(v), H(rail(v) if bulwarked(v) else deck(v))) for v in reversed(ys)]
poly([(X(v), H(G.keel(v))) for v in ys] + head, '#ffffff', INK, 1.6)
# the upper deck's edge under the bulwark, and the bulb
path('M' + ' L'.join(f'{X(v):.1f},{H(deck(v)):.1f}' for v in ys if v <= L.deck_end()), INK, 0.8)
B = L.BULB
bulb = []
for i in range(41):
    t = -1 + 2 * i / 40                                                  # from its underside round its nose to its top
    yard = B['yard'] + B['nose'] * (1 - t * t) ** 0.5 if abs(t) < 1 else B['yard']
    bulb.append((X(yard), H(B['axis'] + B['rise'] * t)))
poly(bulb, '#ffffff', INK, 1.4)
# what stands on her: the houses' tiers, the funnel, the helicopter deck
for name, a, b, lo, hi in G.PROFILE[1:]:
    if name == 'funnel':
        rake = 0.9                                                         # its fore and after edges rake aft (steel.FUNNEL)
        pts = [(X(a), H(lo)), (X(a - rake), H(hi)), (X(b - rake - 0.6), H(hi)), (X(b), H(lo))]
        poly(pts, '#ffffff', INK, 1.4)
        poly([(X(a - rake * (hi - 1.3 - lo) / (hi - lo)), H(hi - 1.3)), (X(a - rake), H(hi)), (X(b - rake - 0.6), H(hi)), (X(b - (rake + 0.6) * (hi - 1.3 - lo) / (hi - lo)), H(hi - 1.3))], INK, INK, 0.8)
        cx, ch = X((a + b) / 2 - 0.6), H(lo + (hi - lo) * 0.5)
        add(f'<circle cx="{cx:.1f}" cy="{ch:.1f}" r="{1.5 * K:.1f}" fill="none" stroke="{WATER}" stroke-width="2"/>')
        text(cx, ch + 7, 'J', 20, 'middle', '700', WATER)
    elif name == 'helicopter deck':
        add(f'<rect x="{X(a):.1f}" y="{H(hi):.1f}" width="{(b - a) * K:.1f}" height="{(hi - lo) * K:.1f}" fill="#ffffff" stroke="{INK}" stroke-width="1.2"/>')
        for v in (a + 1.5, (a + b) / 2, b - 1.5):
            path(f'M{X(v):.1f},{H(lo):.1f} V{H(D["upper"]):.1f}', INK, 0.9)
    else:
        add(f'<rect x="{X(a):.1f}" y="{H(hi):.1f}" width="{(b - a) * K:.1f}" height="{(hi - lo) * K:.1f}" fill="#ffffff" stroke="{INK}" stroke-width="1.4"/>')
# windows: a row to each tier of the house, the wheelhouse's along its front
for a, b, lo, n in ((H0 + 1.0, H1 - 0.6, D['upper'], 15), (G.OFF + 0.8, H1 - 0.6, D['boat'], 8), (G.OFF + 0.8, H1 - 0.6, D['officers'], 8)):
    for i in range(n):
        add(f'<rect x="{X(a + (b - a) * i / n):.1f}" y="{H(lo + 1.75):.1f}" width="{0.9 * K:.1f}" height="{0.7 * K:.1f}" rx="1.5" fill="#cfe0e6" stroke="{INK}" stroke-width="0.5"/>')
add(f'<rect x="{X(100.2):.1f}" y="{H(D["bridge"] + 2.1):.1f}" width="{3.2 * K:.1f}" height="{1.0 * K:.1f}" fill="#cfe0e6" stroke="{INK}" stroke-width="0.5"/>')
# rails: the open decks abaft each tier, the compass deck, the wings
for a, b, h in ((H0, G.OFF, D['officers']), (G.OFF, 94.0, D['bridge']), (94.0, 103.6, D['compass']), (H0, H0 + 0.2, D['boat'])):
    path(f'M{X(a):.1f},{H(h + 1.0):.1f} H{X(b):.1f}', INK, 0.6)
    for v in [a + i * 1.5 for i in range(int((b - a) / 1.5) + 1)]:
        path(f'M{X(v):.1f},{H(h):.1f} V{H(h + 1.0):.1f}', INK, 0.4)
# the mast on the compass deck; the lifeboat's station on the boat deck (the boat itself: the yard's library of fittings)
mast = S.BRIDGE_SHIFT + 20.8
path(f'M{X(mast):.1f},{H(D["compass"]):.1f} V{H(G.MAST_TOP):.1f} M{X(mast - 1.4):.1f},{H(G.MAST_TOP - 2.6):.1f} H{X(mast + 1.4):.1f} M{X(mast - 0.7):.1f},{H(G.MAST_TOP - 1.4):.1f} H{X(mast + 0.7):.1f}', INK, 1.5)
fm = S.FOREMAST                                                            # the foremast on the forecastle: the anchor light on its truck
path(f'M{X(fm["yard"]):.1f},{H(deck(fm["yard"])):.1f} V{H(deck(fm["yard"]) + fm["height"]):.1f}', INK, 1.3)
add(f'<circle cx="{X(fm["yard"]):.1f}" cy="{H(deck(fm["yard"]) + fm["height"] + 0.15):.1f}" r="1.6" fill="{INK}"/>')
a, b = G.LIFEBOAT
add(f'<rect x="{X(a):.1f}" y="{H(D["boat"] + 2.6):.1f}" width="{(b - a) * K:.1f}" height="{2.6 * K:.1f}" fill="none" stroke="{INK}" stroke-width="0.8" stroke-dasharray="4 3"/>')
text(X((a + b) / 2), H(D['boat'] + 0.45), 'lifeboat station', 8, 'middle', fill=FAINT)
# the decks inside her, the bulkheads, the ramps, the lift
for key, a, b, dash in (('main', 0.0, L.STEM_AT_MAIN, ''), ('tank_top', G.fr(42), G.fr(G.COLLISION), ''), ('platform', G.fr(28), G.fr(64), '4 3'), ('aft_flat', 0.3, G.fr(28), '')):
    path(f'M{X(a):.1f},{H(D[key]):.1f} H{X(b):.1f}', INK, 1, dash)
for n, what in G.BULKHEADS:
    path(f'M{X(G.fr(n)):.1f},{H(max(G.keel(G.fr(n)), 0)):.1f} V{H(D["main"]):.1f}', INK, 1.3)
    text(X(G.fr(n)), H(-0.9) + 2, f'fr {n}', 9, 'middle', fill=FAINT)
ramp = G.STERN_RAMP['length']
path(f'M{X(-0.25):.1f},{H(D["main"]):.1f} V{H(D["main"] + ramp):.1f}', INK, 3.4)                                  # the stern ramp, raised: it is the stern door
path(f'M{X(-0.25):.1f},{H(D["main"]):.1f} H{X(-0.25 - ramp):.1f}', INK, 1.0, '5 3')                               # ... and lowered
(fa, fb) = G.FIXED_RAMP['yard']
path(f'M{X(fa):.1f},{H(D["main"]):.1f} L{X(fb):.1f},{H(D["upper"]):.1f}', INK, 1.0, '7 3')                        # the fixed ramp, on her starboard side
(la, lb) = G.CARGO_LIFT['yard']
path(f'M{X(la):.1f},{H(D["main"]):.1f} H{X(lb):.1f}', INK, 3.0)                                                   # the cargo lift's platform, raised
path(f'M{X(la):.1f},{H(D["tank_top"] + 0.15):.1f} H{X(lb):.1f}', INK, 1.0, '5 3')                                 # ... and lowered
# her stern gear and the thruster's tunnel
sc = S.SCREW
path(f'M{X(sc["yard"]):.1f},{H(L.above_keel(sc["y"]) + sc["diameter"] / 2):.1f} V{H(L.above_keel(sc["y"]) - sc["diameter"] / 2):.1f}', INK, 2.4)
path(f'M{X(sc["yard"]):.1f},{H(L.above_keel(sc["y"])):.1f} L{X(S.GEARBOX_FLANGE["yard"] if isinstance(S.GEARBOX_FLANGE, dict) else 25.6):.1f},{H(L.above_keel(sc["y"]) + (25.6 - sc["yard"]) * S.SHAFT_RISE):.1f}', INK, 1.0)
rs = S.RUDDER['yard_stock']
poly([(X(rs - 1.1), H(G.keel(rs) - 0.1)), (X(rs - 1.0), H(0.35)), (X(rs + 1.3), H(0.35)), (X(rs + 1.4), H(G.keel(rs) - 0.1))], '#ffffff', INK, 1.2)
t = S.THRUSTER
add(f'<circle cx="{X(t["yard"]):.1f}" cy="{H(L.above_keel(t["y"])):.1f}" r="{t["radius"] * K:.1f}" fill="none" stroke="{INK}" stroke-width="1"/>')
for label, a, b, h in (('Steering gear', 0.3, 7.2, 5.4), ('After passage', 7.2, 16.8, 5.4), ('Engine room', 25.2, 38.4, 3.4), ('Control room', 16.8, 25.2, 5.0),
                       ('Auxiliary engine room', 38.4, 46.8, 3.6), ('Lower hold: cars and trailers', 46.8, 86.4, 3.8), ('Pump room, deep tanks', 86.4, 98.4, 3.6),
                       ('Thruster room', 98.4, 110.4, 4.4), ('Fore peak', 110.4, 117.0, 4.0), ('Main deck: trailers, five lanes, 5.0 m clear and more', 8.0, 104.0, 9.6),
                       ('Upper deck: trailers in the open', 26.0, 78.0, 14.0), ('Helicopter deck', 1.0, 20.0, 15.0), ('Galley, messes, lounges', H0, H1, 13.75),
                       ('Cabins', 92.0, H1, 16.55), ('Officers', G.OFF, H1, 19.35), ('Bridge', 94.0, 100.0, 22.6), ('Emergency generator', 80.1, 88.1, 20.3),
                       ('Forecastle: anchor and mooring gear', 105.0, 123.0, 15.6)):
    text(X((a + b) / 2), H(h), label, 9.5 if b - a > 12 else 8, 'middle', fill=INK)
for key, label in (('main', 'Main deck'), ('upper', 'Upper deck'), ('boat', 'Boat deck'), ('officers', "Officers' deck"), ('bridge', 'Bridge deck'), ('compass', 'Compass deck')):
    text(X(G.LENGTH + 3) + 4, H(D[key]) + 4, f'{label} {D[key]} m', 10, fill=FAINT)
    path(f'M{X(G.LENGTH) + 6:.1f},{H(D[key]):.1f} H{X(G.LENGTH + 3):.1f}', FAINT, 0.6)
for n in range(0, round(G.LENGTH / G.FRAME_SPACING) + 1, 10):
    path(f'M{X(G.fr(n)):.1f},{H(-0.25):.1f} V{H(-0.55):.1f}', FAINT, 0.7)
path(f'M{X(0):.1f},{H(-0.25):.1f} H{X(G.LENGTH):.1f}', FAINT, 0.7)
text(X(0), H(-1.9), f'Watertight bulkheads at the frames named; frame spacing {G.FRAME_SPACING} m, frame 0 at the transom.  Scale: the ticks are ten frames (6 m) apart.', 10, fill=FAINT)
# the particulars, beside the profile
ty = top - 4
text(KEYS, ty, 'PRINCIPAL PARTICULARS', 12, weight='700')
ty += 4
for name, value in G.PARTICULARS:
    lines = wrap(value, 52)
    ty += 14
    text(KEYS, ty, name, 10, weight='600')
    for i, line in enumerate(lines):
        text(KEYS + 176, ty + i * 12, line, 10)
    ty += (len(lines) - 1) * 12

# ---- the plans
y = max(base + 46, ty + 34)
EXTENT = dict(top=(94.0, H1), bridge=(G.OFF, H1), officers=(H0, H1), boat=(H0, H1), upper=(0.0, G.LENGTH), main=(0.0, G.LENGTH), hold=(0.0, G.LENGTH - 2.2))
MARK = {'lifeboat-station': 'LB', 'liferaft': 'LR', 'windlass': 'W', 'mooring-winch': 'MW', 'capstan': 'C', 'bitts': 'B', 'panama-chock': '', 'roller-fairlead': '',
        'chain-stopper': '', 'ventilator-mushroom': 'V', 'ventilator-gooseneck': '', 'air-pipe': '', 'bench': '', 'floodlight': '', 'foam-monitor': 'F', 'rope-reel': 'R'}
DECK_PLAN = dict(tank_top='hold', main='main', upper='upper', boat='boat')
for plan, title, level in G.PLANS:
    spaces = [s for s in G.SPACES if s['plan'] == plan]
    cy = y + 22 + G.HB * K
    lvl = 'hold' if plan == 'hold' else 'main' if plan == 'main' else 'upper'
    text(LEFT, y + 6, title.split(' (')[0].upper(), 12, weight='700')
    text(LEFT + 12 + 8.2 * len(title.split(' (')[0]), y + 6, f'{level} m above the keel' + ('' if plan != 'hold' else ': at the tank top, and where her bottom rises over it 0.6 m over her bottom; what stands on the platform at 4.0 m and the flat at 4.7 m is dashed'), 10.5, fill=FAINT)
    a, b = EXTENT[plan]
    add(f'<polygon points="{outline(lvl, 0.0, G.LENGTH - (2.2 if plan == "hold" else 0.0), cy)}" fill="none" stroke="{FAINT}" stroke-width="0.7" stroke-dasharray="3 3"/>')
    add(f'<clipPath id="clip-{plan}"><polygon points="{outline(lvl, a, b, cy)}"/></clipPath>')
    tier = plan in ('top', 'bridge', 'officers')                       # a tier of the house: its deck is what its own spaces cover, not her whole breadth
    if not tier:
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
        dash = ' stroke-dasharray="5 3" fill-opacity="0.55"' if s['level'] in ('platform', 'aft') else ''
        add(f'<rect x="{X(ya):.1f}" y="{cy - x1 * K:.1f}" width="{(yb - ya) * K:.1f}" height="{(x1 - x0) * K:.1f}" fill="{FILL[s["kind"]]}" stroke="{INK}" stroke-width="0.9"{dash}/>')
    if plan in ('main', 'upper'):
        lanes = (8.0, 104.0) if plan == 'main' else (23.2, H0)
        for lane in (-4.5, -1.5, 1.5, 4.5):
            path(f'M{X(lanes[0]):.1f},{cy - lane * K:.1f} H{X(lanes[1]):.1f}', FAINT, 0.8, '14 8')
    if plan == 'upper':
        c, r = G.HELIDECK['yard'], G.HELIDECK['across'] / 2
        e = r * (sqrt(2) - 1)                                             # half an octagon's side
        poly([(X(c + u), cy - v * K) for u, v in ((-r, e), (-e, r), (e, r), (r, e), (r, -e), (e, -r), (-e, -r), (-r, -e))], 'none', INK, 1.1)
        add(f'<circle cx="{X(c):.1f}" cy="{cy:.1f}" r="{5.0 * K:.1f}" fill="none" stroke="{INK}" stroke-width="0.8"/>')
        text(X(c), cy + 9, 'H', 26, 'middle', '700')
    add('</g>')
    if not tier:
        add(f'<polygon points="{outline(lvl, a, b, cy)}" fill="none" stroke="{INK}" stroke-width="1.6"/>')
    if plan == 'hold':
        for n, what in G.BULKHEADS:
            hb = G.half_breadth(G.fr(n), 'hold') * K
            path(f'M{X(G.fr(n)):.1f},{cy - hb:.1f} V{cy + hb:.1f}', INK, 1.8)
    # the places of her deck fittings on this plan (spec.OUTFIT)
    for o in S.OUTFIT:
        if DECK_PLAN.get(o['deck']) != plan:
            continue
        if 'grid' in o:
            (ga_, gb, gp), (xa, xb, xp) = o['grid']['yard'], o['grid']['x']
            for i in range(int(round((xb - xa) / xp)) + 1):
                for j in range(int(round((gb - ga_) / gp)) + 1):
                    add(f'<circle cx="{X(ga_ + j * gp):.1f}" cy="{cy - (xa + i * xp) * K:.1f}" r="1.1" fill="{INK}"/>')
            continue
        along, across = S.OUTFIT_KINDS[o['kind']]
        if o['kind'] == 'ventilator-mushroom':
            along = across = o.get('dia', 1.0)
        fore_aft = abs(((o['heading'] + 45) % 180) - 45) < 45              # its front looks forward or aft
        dz, dx = (along, across) if fore_aft else (across, along)
        if along == across:
            add(f'<circle cx="{X(o["yard"]):.1f}" cy="{cy - o["x"] * K:.1f}" r="{max(along / 2 * K, 1.6):.1f}" fill="#ffffff" stroke="{INK}" stroke-width="0.7"/>')
        else:
            add(f'<rect x="{X(o["yard"] - dz / 2):.1f}" y="{cy - (o["x"] + dx / 2) * K:.1f}" width="{dz * K:.1f}" height="{dx * K:.1f}" fill="#ffffff" stroke="{INK}" stroke-width="0.7"'
                + (' stroke-dasharray="4 3"' if o['kind'] == 'lifeboat-station' else '') + '/>')
        if MARK.get(o['kind']):
            text(X(o['yard']), cy - o['x'] * K + 3, MARK[o['kind']], 7, 'middle', '600')
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
        if s['id'] == 'helideck':
            px = X(G.HELIDECK['yard'] - 7.0)                              # beside its H
        small = min(yb - ya, xb - xa) < 2.4
        add(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{5.6 if small else 7.6}" fill="#ffffff" stroke="{INK}" stroke-width="0.8"/>')
        text(px, py + (2.9 if small else 3.5), str(s['_n']), 7.6 if small else 9.6, 'middle', '600')
    cols = 2 if len(keys) > 14 else 1
    rows = -(-len(keys) // cols)
    for i, (n, name, kind) in enumerate(keys):
        kx, ky = KEYS + (i // rows) * 244, y + 24 + (i % rows) * 13.0
        add(f'<rect x="{kx:.1f}" y="{ky - 9:.1f}" width="10" height="10" fill="{FILL[kind]}" stroke="{INK}" stroke-width="0.6"/>')
        text(kx + 15, ky, f'{n}', 10, weight='700')
        text(kx + 34, ky, name if len(name) <= (38 if cols == 2 else 78) else name[:(37 if cols == 2 else 77)] + '…', 10)
    y = max(cy + G.HB * K + 34, y + 24 + rows * 13.0 + 20)

# ---- what the colours and the marks mean, her stations, and what the yard asks
text(LEFT, y + 6, 'WHAT THE COLOURS AND THE MARKS MEAN', 12, weight='700')
x = LEFT
for kind, label in G.KINDS.items():
    add(f'<rect x="{x:.1f}" y="{y + 16:.1f}" width="12" height="12" fill="{FILL[kind]}" stroke="{INK}" stroke-width="0.6"/>')
    text(x + 17, y + 26, label, 10.5)
    x += 30 + len(label) * 6.4
y += 46
text(LEFT, y, 'On the plans, in outline: the places of her deck fittings (ferry/blender/spec.py, OUTFIT). LB a lifeboat under its davits, LR a liferaft, W a windlass, MW a mooring winch, C a capstan, B bitts, '
     'V a ventilator, F a foam monitor, R a rope reel; dots are lashing pots.', 10.5, fill=FAINT)
y += 30
text(LEFT, y, 'HER STATIONS', 12, weight='700')
for name, where, what in G.STATIONS:
    y += 17
    text(LEFT, y, f'{name}: {where}.', 11, weight='600')
    for line in wrap(what, 210):
        y += 14
        text(LEFT + 18, y, line, 10.5)
y += 34
text(LEFT, y, 'FOR THE OWNER TO SETTLE', 12, weight='700')
for i, q in enumerate(G.QUESTIONS):
    for j, line in enumerate(wrap(f'{i + 1}.  {q}', 215)):
        y += 15
        text(LEFT + (0 if j == 0 else 18), y, line, 11)
y += 26
text(LEFT, y, 'Made from ferry/blender/ga.py, lines.py and spec.py by ferry/yard/drawings/ga_drawing.py. Her pattern is the Mashala class of 1977, whose arrangement was looked at and measured '
     '(ferry/yard/reference/roro-freight-ships.md); nothing is traced or copied.', 10, fill=FAINT)
height = y + 24
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {height:.0f}" width="{WIDTH}" height="{height:.0f}" font-family="DejaVu Sans, Helvetica, Arial, sans-serif">'
       f'<rect width="{WIDTH}" height="{height:.0f}" fill="{PAPER}"/>' + ''.join(out) + '</svg>')
out_path = os.path.join(HERE, 'JS1-102-general-arrangement.svg')
open(out_path, 'w').write(svg)
print(f'{out_path}: {WIDTH} x {height:.0f}, {len(G.SPACES)} spaces, {len(svg)} bytes')
