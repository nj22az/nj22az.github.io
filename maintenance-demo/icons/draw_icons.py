#!/usr/bin/env python3
"""
The maintenance program's own icons: one for each of the ship's systems and for some kinds of gear, drawn here from numbers.

    python3 maintenance-demo/icons/draw_icons.py      writes, beside the program:
        maintenance-demo/ship-icons.mjs                 the drawings, for the program (vessel.mjs)
        maintenance-demo/icons/ship-icons-preview.svg   every one on a sheet, to look at

The owner, 12 November 2026: "Use Python to draw icons make the ui look less generic".

Each icon is drawn in a square of 24, as lines of one weight with round ends (the program gives them their colour and
weight), so they sit beside its other icons. A wheel's spokes, a propeller's blades, a fan's vanes and a lamp's rays are
worked out by angle, not placed by hand. Change a drawing here and run this again; nothing is edited in the files it writes.
"""
import os
from math import cos, radians, sin

HERE = os.path.dirname(os.path.abspath(__file__))
C = 12.0                                   # the middle of the square


def n(v):
    return ('%.2f' % v).rstrip('0').rstrip('.') or '0'


def P(x, y):
    return f'{n(x)} {n(y)}'


def at(r, deg, cx=C, cy=C):
    """A point r from the middle, deg clockwise from straight up."""
    a = radians(deg - 90)
    return cx + r * cos(a), cy + r * sin(a)


def line(*pts):
    return 'M' + 'L'.join(P(*p) for p in pts)


def shape(*pts):
    return line(*pts) + 'Z'


def circle(r, cx=C, cy=C):
    return f'M{P(cx - r, cy)}a{n(r)} {n(r)} 0 1 0 {n(2 * r)} 0a{n(r)} {n(r)} 0 1 0 {n(-2 * r)} 0'


def arc(r, a0, a1, cx=C, cy=C):
    """Part of a circle, from a0 to a1 degrees clockwise from straight up."""
    (x0, y0), (x1, y1) = at(r, a0, cx, cy), at(r, a1, cx, cy)
    return f'M{P(x0, y0)}A{n(r)} {n(r)} 0 {1 if abs(a1 - a0) > 180 else 0} {1 if a1 > a0 else 0} {P(x1, y1)}'


def box(x, y, w, h, r=0.0):
    if not r:
        return shape((x, y), (x + w, y), (x + w, y + h), (x, y + h))
    return (f'M{P(x + r, y)}h{n(w - 2 * r)}a{n(r)} {n(r)} 0 0 1 {n(r)} {n(r)}v{n(h - 2 * r)}a{n(r)} {n(r)} 0 0 1 {n(-r)} {n(r)}'
            f'h{n(-(w - 2 * r))}a{n(r)} {n(r)} 0 0 1 {n(-r)} {n(-r)}v{n(-(h - 2 * r))}a{n(r)} {n(r)} 0 0 1 {n(r)} {n(-r)}Z')


def curve(a, c, b):
    return f'M{P(*a)}Q{P(*c)} {P(*b)}'


def blade(deg, root, tip, lead, trail, cx=C, cy=C):
    """A blade or vane on a hub: out along its leading edge to the tip and back along its trailing one."""
    a, b, t = at(root, deg - 34, cx, cy), at(root, deg + 34, cx, cy), at(tip, deg, cx, cy)
    return f'M{P(*a)}Q{P(*at(tip * lead[0], deg - lead[1], cx, cy))} {P(*t)}Q{P(*at(tip * trail[0], deg + trail[1], cx, cy))} {P(*b)}'


def rays(r0, r1, degs, cx=C, cy=C):
    return [line(at(r0, d, cx, cy), at(r1, d, cx, cy)) for d in degs]


def waves(cx, cy, side, radii=(3.2, 6.2), spread=42):
    """What a set sends out: arcs to one side (90 to starboard, 270 to port)."""
    return [arc(r, side - spread, side + spread, cx, cy) for r in radii]


# ---- The ship's systems, by the register's own letters, and the deck fittings' ----
def NAV():       # a compass card: a ring, its four marks, a needle
    return [circle(9), *rays(7.2, 9, (0, 90, 180, 270)), shape(at(6.2, 0), at(1.9, 90), at(6.2, 180), at(1.9, 270)), line(at(1.9, 90), at(1.9, 270))]


def STR():       # the wheel: a rim, a hub, eight spokes that pass the rim as handles
    return [circle(5.6), circle(1.5), *[line(at(1.5, d), at(9.4, d)) for d in range(0, 360, 45)]]


def PRP():       # a screw of three blades on its boss
    return [circle(1.7), *[blade(d, 1.7, 9.6, (0.78, 30), (0.62, 44)) for d in (0, 120, 240)]]


def COM():       # an aerial that sends both ways
    return [line((C, 21), (C, 9.4)), circle(1.2, C, 8.2), *waves(C, 8.2, 90), *waves(C, 8.2, 270), line((8.5, 21), (15.5, 21))]


def INT():       # a loudspeaker
    return [shape((3.5, 9.6), (7.4, 9.6), (12.4, 5.4), (12.4, 18.6), (7.4, 14.4), (3.5, 14.4)), *waves(12.6, C, 90, (3.0, 6.0), 40)]


def ALM():       # a bell
    return [f'M5.6 17.2h12.8l-1.7-2.9V10.3a4.7 4.7 0 0 0-9.4 0v4Z', arc(1.7, 100, 260, C, 18.6), line((C, 3.6), (C, 5.6))]


def FIR():       # a flame, and the smaller one inside it
    return ['M12 2.8C12.2 7 17.4 9.2 17.4 14.4a5.4 5.4 0 0 1-10.8 0C6.6 11.6 9.4 10.4 12 2.8Z', 'M12 12.2c0 2 2.2 2.6 2.2 4.6a2.2 2.2 0 0 1-4.4 0c0-1.4 1.6-2 2.2-4.6Z']


def NLT():       # a lantern showing a light
    return [box(8.6, 8.2, 6.8, 8.6, 1.4), line((7.4, 8.2), (16.6, 8.2)), line((7.4, 16.8), (16.6, 16.8)), arc(2.4, 270, 450, C, 8.2), line((C, 16.8), (C, 20.6)),
            *rays(5.6, 8.2, (60, 90, 120), C, 12.5), *rays(5.6, 8.2, (240, 270, 300), C, 12.5)]


def LGT():       # a bulkhead fitting behind its guard
    return [box(4.6, 7.6, 14.8, 8.8, 4.4), *[line((x, 7.9), (x, 16.1)) for x in (9.2, C, 14.8)], line((2.6, C), (4.6, C)), line((19.4, C), (21.4, C))]


def DLT():       # a floodlight on its bracket
    return [shape((5.6, 6.4), (15.4, 3.8), (17.6, 11.6), (7.8, 13.2)), line((11.6, 12.6), (11.6, 17.6)), line((7.6, 20.4), (15.6, 20.4)), line((11.6, 17.6), (11.6, 20.4)),
            *[line((x0, y0), (x1, y1)) for x0, y0, x1, y1 in ((18.6, 6.4, 21.2, 5.2), (19.4, 9.4, 22, 9.6), (18.8, 12.6, 21.2, 14.2))]]


def ELD():       # a row of three cubicles, each with its instrument and its breaker's handle
    out = [box(3.4, 4, 17.2, 16, 1.2), line((9.13, 4), (9.13, 20)), line((14.87, 4), (14.87, 20))]
    for x in (6.27, C, 17.73):
        out += [circle(1.05, x, 7.6), line((x, 11.4), (x, 14.6)), line((x - 1.1, 14.6), (x + 1.1, 14.6))]
    return out


def EMG():       # a battery
    return [box(3.6, 8.4, 16.8, 10.8, 1.4), line((7, 8.4), (7, 6.2)), line((5.6, 6.2), (8.4, 6.2)), line((17, 8.4), (17, 6.2)), line((15.6, 6.2), (18.4, 6.2)),
            line((6.4, 13.8), (9.6, 13.8)), line((8, 12.2), (8, 15.4)), line((14.4, 13.8), (17.6, 13.8))]


def GEN():       # an engine and its alternator on one bedplate
    return [box(2.8, 9, 9.6, 8.4, 0.8), circle(4, 17.2, 13.2), circle(1.1, 17.2, 13.2), line((2, 19.6), (22, 19.6)), line((5.4, 17.4), (5.4, 19.6)), line((17.2, 17.2), (17.2, 19.6)),
            line((5.6, 9), (5.6, 5.2), (9, 5.2)), line((12.4, 13.2), (13.2, 13.2))]


def HVC():       # a fan in its ring
    return [circle(9.2), circle(1.5), *[blade(d, 1.5, 7.6, (0.86, 34), (0.5, 40)) for d in (20, 110, 200, 290)]]


def PIP():       # a valve in a pipe, its handwheel over it
    return [line((2.6, 14.4), (7.6, 14.4)), shape((7.6, 10.4), (16.4, 18.4), (16.4, 10.4), (7.6, 18.4)), line((16.4, 14.4), (21.4, 14.4)), line((C, 14.4), (C, 7.6)), line((8.6, 7.6), (15.4, 7.6))]


def LSA():       # a lifebuoy
    return [circle(9), circle(4.2), *[line(at(4.2, d), at(9, d)) for d in (45, 135, 225, 315)]]


def RMP():       # her stern, the ramp lowered on its cylinder
    return [line((21.4, 5.6), (9.6, 5.6), (9.6, 16.2), (21.4, 16.2)), line((9.6, 16.2), (2.4, 19.2)), line((9.6, 8.6), (5.6, 17.8)), 'M2 21.4q2-1.4 4 0t4 0 4 0 4 0 4 0']


def HYD():       # a cylinder: its barrel, its rod and eye, its two ports
    return [box(2.8, 9.2, 11.4, 6, 1), line((14.2, 12.2), (19, 12.2)), circle(1.5, 20.4, 12.2), line((5.4, 9.2), (5.4, 6.2)), line((11.6, 9.2), (11.6, 6.2)), line((8.2, 9.2), (8.2, 15.2))]


def MOR():       # an anchor
    return [circle(1.7, C, 4.5), line((C, 6.2), (C, 20.4)), line((7.8, 9.4), (16.2, 9.4)), 'M4.8 13.2a7.2 7.2 0 0 0 14.4 0', line((3.2, 14.6), (4.8, 13.2), (6.6, 14.2)), line((17.4, 14.2), (19.2, 13.2), (20.8, 14.6))]


def VNT():       # a mushroom ventilator on its coaming
    return ['M4.8 9.6a7.2 4.4 0 0 1 14.4 0Z', line((10, 9.6), (10, 16.8)), line((14, 9.6), (14, 16.8)), line((7.8, 16.8), (16.2, 16.8)), line((8.8, 16.8), (8.8, 20.2)), line((15.2, 16.8), (15.2, 20.2)), line((4, 20.2), (20, 20.2))]


def CGO():       # a lashing ring on its plate
    return ['M7.2 15.8V11a4.8 4.8 0 0 1 9.6 0v4.8', box(4.8, 15.8, 14.4, 3.4, 1), line((C, 3.4), (C, 6.2))]


def DKO():       # a deck bench
    return [line((3.6, 12.4), (20.4, 12.4)), line((3.6, 8), (20.4, 8)), *[line((x, 8), (x, 18.6)) for x in (6, 18)], line((4.4, 18.6), (7.6, 18.6)), line((16.4, 18.6), (19.6, 18.6))]


def OUT():       # a desk with a screen on it
    return [line((2.8, 14.6), (21.2, 14.6)), line((5, 14.6), (5, 20.4)), line((19, 14.6), (19, 20.4)), box(7.8, 4.6, 8.4, 6.2, 1), line((C, 10.8), (C, 14.6)), line((9.8, 14.6), (14.2, 14.6))]


# ---- Kinds of gear that have a drawing of their own ----
def winch():     # a drum between its flanges, rope on it, on a bedplate
    return [line((7, 5.6), (7, 18)), line((17, 5.6), (17, 18)), box(7, 8, 10, 7.6), *[line((x, 8), (x, 15.6)) for x in (9.5, C, 14.5)], line((3.6, 20.2), (20.4, 20.2)), line((5.4, 18), (5.4, 20.2)), line((18.6, 18), (18.6, 20.2)),
            line((3.6, 18), (20.4, 18))]


def lifeboat():  # a boat under her canopy, hanging by her falls
    return ['M2.8 12.6h18.4c-1 4.4-4.4 6.4-9.2 6.4s-8.2-2-9.2-6.4Z', 'M6.2 12.6a5.8 4.2 0 0 1 11.6 0', line((7.4, 3.4), (7.4, 9)), line((16.6, 3.4), (16.6, 9)), line((5.4, 3.4), (18.6, 3.4))]


def liferaft():  # a canister in its cradle, two bands round it
    return [box(3.6, 7.6, 16.8, 8.4, 4.2), line((9, 7.6), (9, 16)), line((15, 7.6), (15, 16)), line((7.2, 16), (6, 20.2)), line((16.8, 16), (18, 20.2)), line((4.4, 20.2), (19.6, 20.2))]


def ADM():       # a computer: its screen with lines on it, on its foot
    return [box(3.6, 4.6, 16.8, 11.4, 1.4), line((C, 16), (C, 19.2)), line((8.2, 19.2), (15.8, 19.2)), line((6.8, 8.4), (13.2, 8.4)), line((6.8, 11.6), (10.8, 11.6)), line((14.6, 11.6), (17.2, 11.6))]


def DOC():       # a sheet of the yard's: its turned corner, what is drawn on it, its title block
    return ['M5.6 2.8h8.6l4.2 4.2v14.2H5.6Z', line((14.2, 2.8), (14.2, 7), (18.4, 7)), line((8.2, 10.4), (15.8, 10.4)), line((8.2, 13.4), (13.2, 13.4)), box(12.2, 16, 4, 2.8)]


def ship():      # the ship herself, from ahead: her bow, her house, her mast
    return ['M4.4 12.4L12 9.6l7.6 2.8-1.8 6.6q-5.8 2.4-11.6 0Z', line((C, 9.6), (C, 19.9)), box(8.8, 5.2, 6.4, 4.2, 0.6), line((C, 2.4), (C, 5.2))]


SYSTEMS = dict(NAV=NAV, STR=STR, PRP=PRP, COM=COM, INT=INT, ALM=ALM, FIR=FIR, NLT=NLT, LGT=LGT, DLT=DLT, ELD=ELD, EMG=EMG, GEN=GEN, HVC=HVC, PIP=PIP,
               LSA=LSA, RMP=RMP, HYD=HYD, MOR=MOR, VNT=VNT, CGO=CGO, DKO=DKO, OUT=OUT, ADM=ADM)
KINDS = {'Mooring winch': winch, 'Anchor windlass and mooring winch': winch, 'Capstan': winch, 'Lifeboat and davits': lifeboat, 'Liferaft': liferaft}
OTHER = dict(ship=ship, DOC=DOC)


def paths(draw):
    return ''.join(f'<path d="{d}"/>' for d in draw())


def main():
    table = {k: paths(v) for k, v in {**SYSTEMS, **OTHER}.items()}
    kinds = {k: v.__name__ for k, v in KINDS.items()}
    table.update({v.__name__: paths(v) for v in KINDS.values()})
    out = os.path.join(HERE, '..', 'ship-icons.mjs')
    with open(out, 'w') as f:
        f.write('// Written by icons/draw_icons.py: do not edit; change the drawing there and run it again.\n')
        f.write('// Each is the inside of an <svg viewBox="0 0 24 24">, drawn in lines: the program gives the colour and the weight.\n')
        f.write('export const SHIP_ICONS = {\n' + ''.join(f"  {k!r}: '{v}',\n" for k, v in table.items()) + '};\n')
        f.write('// A kind of gear that has a drawing of its own; the rest are shown by their system\'s.\n')
        f.write('export const KIND_ICONS = {\n' + ''.join(f'  {k!r}: {v!r},\n' for k, v in kinds.items()) + '};\n')
    cols, cell = 6, 76
    names = list(table)
    rows = -(-len(names) // cols)
    sheet = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {cols * cell} {rows * (cell + 18)}" width="{cols * cell * 2}" font-family="sans-serif" font-size="9">',
             f'<rect width="100%" height="100%" fill="#ffffff"/>']
    for i, k in enumerate(names):
        x, y = (i % cols) * cell, (i // cols) * (cell + 18)
        sheet.append(f'<g transform="translate({x + 14} {y + 8}) scale(2)" fill="none" stroke="#1a1a1c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">{table[k]}</g>')
        sheet.append(f'<text x="{x + cell / 2}" y="{y + cell + 6}" text-anchor="middle" fill="#4d4d4d">{k}</text>')
    sheet.append('</svg>')
    with open(os.path.join(HERE, 'ship-icons-preview.svg'), 'w') as f:
        f.write('\n'.join(sheet))
    print(f'{len(table)} icons: {os.path.relpath(out)} and icons/ship-icons-preview.svg')


if __name__ == '__main__':
    main()
