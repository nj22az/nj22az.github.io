"""
The Chisum's main switchboard, 690 V: nine cubicles on the place marked for it in the main switchboard room, built from
msb_place.py.

The owner, 12 November 2026: "start building the MSB , with all the right connections , so we can start hooking up the
electrical wiring to every single component onboard , including for the lights and all equipment on the bridge and
forecastle".

Drawn first: JS8-865 (yard/drawings/msb_drawing.py), from the same numbers.

What a cubicle is. A steel cabinet 0.5 m wide, 0.8 m deep and 2.0 m high on a plinth, in a row of nine that looks aft into
the aisle. From the top down on its front: its engraved name; the mimic of the bars it is on, painted across the row; its
instruments and lamps on a door; its air circuit breaker, drawn out to the front, with its rating on a plate; and the
door of its cable compartment, which opens to a tap. Behind that door are the right connections: the three bars the
breaker's circuit ends on, and each cable of the schedule coming up through its gland in the floor, cleated, its three
cores landed on the bars, with its number on a tag. The cables come up through the platform (a switchboard on a platform
is entered from below); what is under the platform is not drawn yet, so each cable ends at its gland, as her other
cables end at a transit.

How it is kept from flickering (JSY-STD-403) and fine (JSY-STD-404, rule 6): everything lettered, every instrument, lamp
and core is fine work (shipyard.Part), and stands on the cubicle's steel by 2 mm or is let 1 mm into it, more than the
steel's own place can be out by along her length (0.95 mm).

Drawn in the ship's axes (lines.py): x to port, y up from the waterline, z forward from amidships.
"""
import os
import sys
from math import cos, pi, radians, sin

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'systems'))
import lines as L
import spec as S
import msb_place as M
import stern_gear as G
from shipyard import Part, srgb, tint, component, lettering

TAG = 'ELD-61'                                   # her register's tag for the board
# her register's number for each panel's set of cables (systems/stern.py: CABLES); a cable of a set is /1, /2 ...
CABLE_NO = {'DG1': 'W-GEN-01', 'DG2': 'W-GEN-02', 'DG3': 'W-GEN-03', 'T1': 'W-TX-01', 'T2': 'W-TX-03', 'SG1': 'W-SG-01', 'SG2': 'W-SG-02', 'BT': 'W-BT-01'}
FLOOR = M.PLATFORM - 6.6                         # the platform, as stern_gear measures heights: over the main deck
GREY, DARK, STEEL, BLACK, WHITE, RED = srgb(0xb9c0bd), srgb(S.DARK_GREY), srgb(S.STEEL), srgb(0x1c2022), srgb(0xeeeae0), srgb(0xb8372b)
COPPER, GREEN, AMBER, CABLE = srgb(0xb87333), srgb(0x2f9e5a), srgb(0xe3b341), srgb(0x23272a)
BUS = {'A': srgb(0xc2412f), 'B': srgb(0x2f6fb7), 'T': srgb(0xb7791f)}
CORE = (srgb(0x7a4a26), srgb(0x1c2022), srgb(0x8f9896))        # the three cores of a cable: brown, black, grey
C = M.CUBICLE
X0, X1, FRONT, BACK = M.MSB_BOX                  # the row: across the ship; its front (toward the aisle, aft) and its back
_parts = {}


def part(name, look, **kw):
    if name not in _parts:
        p = Part(name, look, **kw)
        p.group = 'machinery'
        _parts[name] = p
    return _parts[name]


def box(p, x0, x1, i0, i1, h0, h1, colour, soft=True):
    G.box(p, x0, x1, i0, i1, FLOOR + h0, FLOOR + h1, colour, soft)


def tube(p, a, b, r, colour, sides=12):
    G.tube(p, (a[0], a[1], FLOOR + a[2]), (b[0], b[1], FLOOR + b[2]), r, colour, sides)


def words(p, text, height, x, proud, h, colour, room=None, what='a plate of the main switchboard'):
    """A line of lettering on the row's front, its middle at x, its foot at h over the floor, `proud` of the front. Read from the aisle."""
    if room is not None:
        G.fits(text, height, room, what)
    G.letter(p, text, height, G.Q(x, FRONT - proud, FLOOR + h), (-1, 0, 0), (0, 1, 0), colour)


def plate(pl, paint, x, h0, h1, wide, lines, sizes, colour=BLACK):
    """An engraved plate on the front: let 1 mm into the steel, 2 mm proud, its lines of lettering one under the other."""
    box(pl, x - wide / 2, x + wide / 2, FRONT - 0.002, FRONT + 0.001, h0, h1, WHITE, soft=False)
    gap = (h1 - h0 - sum(sizes)) / (len(lines) + 1)
    h = h1
    for t, size in zip(lines, sizes):
        h -= gap + size
        words(paint, t, size, x, 0.0026, h, colour, wide - 0.012)


def meter(case, face, paint, x, h, label, at=0.55, size=0.096):
    """A square panel instrument: its bezel, its white scale plate with an arc of marks, its pointer, and the letter of what it reads."""
    box(case, x - size / 2, x + size / 2, FRONT - 0.010, FRONT + 0.001, h - size / 2, h + size / 2, BLACK)
    box(face, x - size * 0.42, x + size * 0.42, FRONT - 0.0112, FRONT - 0.010, h - size * 0.42, h + size * 0.42, WHITE, soft=False)
    cx, cy, r = x, h - size * 0.26, size * 0.56
    for k in range(11):                                              # the scale: an arc of marks over the pointer's foot
        a = radians(-45 + 9 * k)
        w = 0.0012 if k % 5 else 0.0020
        r0 = r * (0.86 if k % 5 else 0.80)
        pts = [(cx - (r0 * sin(a) + w * cos(a)), cy + r0 * cos(a) - w * sin(a)), (cx - (r0 * sin(a) - w * cos(a)), cy + r0 * cos(a) + w * sin(a)),
               (cx - (r * sin(a) - w * cos(a)), cy + r * cos(a) + w * sin(a)), (cx - (r * sin(a) + w * cos(a)), cy + r * cos(a) - w * sin(a))]
        start = len(paint.f)
        paint.face([paint.vert(G.Q(px, FRONT - 0.0118, FLOOR + py)) for px, py in pts], BLACK)
        paint.orient(start, (0, 0, -1))
    a = radians(-45 + 90 * at)                                       # the pointer
    w = 0.0016
    pts = [(cx - w * cos(a), cy - w * sin(a)), (cx + w * cos(a), cy + w * sin(a)), (cx - r * 0.84 * sin(a), cy + r * 0.84 * cos(a))]
    start = len(paint.f)
    paint.face([paint.vert(G.Q(px, FRONT - 0.0122, FLOOR + py)) for px, py in pts], RED)
    paint.orient(start, (0, 0, -1))
    words(paint, label, size * 0.13, x - size * 0.20, 0.0118, h - size * 0.30, BLACK)          # (beside the pointer's foot, clear of it at rest)


def lamp(case, lens, x, h, colour, r=0.013):
    tube(case, (x, FRONT + 0.001, h), (x, FRONT - 0.006, h), r + 0.004, STEEL, 16)
    tube(lens, (x, FRONT - 0.006, h), (x, FRONT - 0.014, h), r, colour, 16)


def cubicle(p_):
    """One cubicle of the row (msb_place.MSB_PANELS)."""
    no = p_['no']
    xa, xb = M.panel_x(no)
    xm = (xa + xb) / 2
    steel = part('Main switchboard, cubicles', 'Machinery paint')
    dark = part('Main switchboard, dark fittings', 'Machinery paint', smooth=True, angle=40)
    bright = part('Main switchboard, bright fittings', 'Stainless', smooth=True, angle=40, fine=True)
    case = part('Main switchboard, instrument cases', 'Plastic', smooth=True, angle=40, fine=True)
    face = part('Main switchboard, instrument faces', 'Plastic', fine=True)
    pl = part('Main switchboard, engraved plates', 'Plastic', fine=True)
    paint = part('Main switchboard, lettering', 'Marking', fine=True)
    lens = part('Main switchboard, lamp lenses', 'Lens', smooth=True, angle=40, fine=True)
    mimic = part('Main switchboard, mimic bars', 'Plastic', fine=True)
    copper = part('Main switchboard, bars', 'Bronze', fine=True)
    cables = part('Main switchboard, cables', 'Rubber', smooth=True, angle=50, fine=True)
    cores = part('Main switchboard, cable cores', 'Plastic', smooth=True, angle=50, fine=True)
    top, plinth, t = C['plinth'] + C['high'], C['plinth'], 0.02
    f = FRONT + t                                                     # the carcass's own front, behind its doors
    # ---- the plinth and the carcass: solid above the cable compartment; the compartment a box open to the front
    box(steel, xa + 0.004, xb - 0.004, FRONT + 0.03, BACK - 0.02, 0.0, plinth, DARK, soft=False)
    box(steel, xa, xb, f, BACK, 0.90, top, GREY, soft=False)
    box(steel, xa, xa + t, f, BACK, plinth, 0.90, GREY, soft=False)
    box(steel, xb - t, xb, f, BACK, plinth, 0.90, GREY, soft=False)
    box(steel, xa + t, xb - t, BACK - t, BACK, plinth, 0.90, GREY, soft=False)
    box(steel, xa + t, xb - t, f, BACK - t, plinth, plinth + 0.012, tint(GREY, 0.8), soft=False)       # the gland plate, on the platform
    # ---- the instrument door and the breaker's panel: fixed fronts
    box(steel, xa + 0.004, xb - 0.004, FRONT, f, 1.505, top - 0.03, tint(GREY, 1.04), soft=False)
    box(steel, xa + 0.004, xb - 0.004, FRONT, f, 0.905, 1.495, tint(GREY, 0.97), soft=False)
    # its name, and the mimic of its bars
    plate(pl, paint, xm, 1.975, 2.055, 0.44, (p_['tag'], p_['name']), (0.030, 0.011))
    if p_['kind'] != 'tie':
        box(mimic, xa + (0.0 if no not in (1, 6, 8) else 0.04), xb - (0.0 if no not in (4, 7, 9) else 0.04), FRONT - 0.002, FRONT + 0.001, 1.928, 1.942, BUS[p_['bus'][0]], soft=False)
        box(mimic, xm - 0.006, xm + 0.006, FRONT - 0.002, FRONT + 0.001, 1.865, 1.928, BUS[p_['bus'][0]], soft=False)     # the drop to its breaker
    else:
        box(mimic, xa + 0.02, xb - 0.02, FRONT - 0.002, FRONT + 0.001, 1.928, 1.942, BLACK, soft=False)
    # its instruments and lamps
    if p_['kind'] == 'gen':
        for k, (label, at) in enumerate((('A', 0.0), ('V', 0.0), ('kW', 0.0))):                    # (a dead board: no set is installed, every pointer at rest)
            meter(case, face, paint, xm + (1 - k) * 0.145, 1.775, label, at)
        plate(pl, paint, xm, 1.672, 1.700, 0.36, (f"{p_['kva']} kVA   {M.BARS['volts']} V   {p_['amps']} A",), (0.011,))
    elif p_['kind'] == 'feeder':
        meter(case, face, paint, xm, 1.775, 'A', 0.0)
        plate(pl, paint, xm, 1.672, 1.700, 0.36, (f"{p_.get('kva') or p_.get('kw')} {'kVA' if p_.get('kva') else 'kW'}   {p_['amps']} A",), (0.011,))
    else:
        # the synchronising gear: the synchroscope between a double voltmeter and a double frequency meter; three earth-fault lamps
        tube(case, (xm, FRONT + 0.001, 1.775), (xm, FRONT - 0.010, 1.775), 0.060, BLACK, 40)
        tube(face, (xm, FRONT - 0.010, 1.775), (xm, FRONT - 0.0112, 1.775), 0.052, WHITE, 40)
        for word, hh, size in (('SYNCHROSCOPE', 1.752, 0.0055), ('SLOW', 1.790, 0.0050)):
            words(paint, word, size, xm + (0.022 if word == 'SLOW' else 0.0), 0.0118, hh, BLACK)
        words(paint, 'FAST', 0.0050, xm - 0.022, 0.0118, 1.790, BLACK)
        start = len(paint.f)
        paint.face([paint.vert(G.Q(xm + px, FRONT - 0.0122, FLOOR + py)) for px, py in ((-0.002, 1.775), (0.002, 1.775), (0.0, 1.820))], RED)
        paint.orient(start, (0, 0, -1))
        for sgn, label in ((1, 'V'), (-1, 'Hz')):
            meter(case, face, paint, xm + sgn * 0.165, 1.775, label, 0.0, 0.086)
        for k in range(3):
            lamp(case, lens, xm + (1 - k) * 0.05, 1.625, AMBER, 0.011)
        plate(pl, paint, xm, 1.566, 1.590, 0.22, ('EARTH  L1  L2  L3',), (0.0085,))
    if p_['kind'] != 'tie':
        lamp(case, lens, xm + 0.045, 1.610, GREEN)
        lamp(case, lens, xm - 0.045, 1.610, RED)
        plate(pl, paint, xm, 1.560, 1.582, 0.22, ('OPEN       CLOSED',), (0.008,))
    # ---- the air circuit breaker, drawn out to the front: its face with its two buttons, its flag and its charging handle
    box(dark, xm - 0.17, xm + 0.17, FRONT - 0.035, FRONT + 0.001, 0.975, 1.405, BLACK)
    box(bright, xm - 0.15, xm + 0.15, FRONT - 0.0368, FRONT - 0.035, 1.30, 1.385, srgb(0xd9dcdd), soft=False)
    words(paint, f"ACB   {p_['breaker']} A", 0.022, xm, 0.0374, 1.342, BLACK, 0.28)
    words(paint, f"SET {p_['setting']} A" if p_['kind'] != 'tie' else 'BUS TIE', 0.011, xm, 0.0374, 1.312, BLACK, 0.28)
    for sgn, colour in ((1, GREEN), (-1, RED)):
        tube(case, (xm + sgn * 0.09, FRONT - 0.035, 1.215), (xm + sgn * 0.09, FRONT - 0.047, 1.215), 0.020, colour, 20)
    box(face, xm - 0.025, xm + 0.025, FRONT - 0.0362, FRONT - 0.035, 1.19, 1.24, WHITE, soft=False)                 # the flag: O, open
    words(paint, 'O', 0.030, xm, 0.0368, 1.200, GREEN)
    box(dark, xm - 0.11, xm + 0.11, FRONT - 0.060, FRONT - 0.035, 1.02, 1.07, srgb(0x3a3f41))                        # the charging handle
    box(dark, xm - 0.02, xm + 0.02, FRONT - 0.085, FRONT - 0.060, 1.02, 1.13, srgb(0x3a3f41))
    if p_.get('second'):
        plate(pl, paint, xm, 0.915, 0.965, 0.40, (p_['second']['name'], f"ACB {p_['second']['amps']} A  BEHIND THIS PANEL"), (0.011, 0.008))
    # ---- the cable compartment: its door (it opens to a tap), and behind it the bars, the cables, their cores and tags
    door = part(f'Main switchboard, cubicle {no} door', 'Machinery paint', mover=f'msb-door-{no}')
    fit = part(f'Main switchboard, cubicle {no} door fittings', 'Stainless', smooth=True, angle=40, mover=f'msb-door-{no}', fine=True)
    mark = part(f'Main switchboard, cubicle {no} door lettering', 'Marking', mover=f'msb-door-{no}', fine=True)
    box(door, xa + 0.004, xb - 0.004, FRONT, f - 0.002, plinth + 0.012, 0.895, tint(GREY, 1.02), soft=False)
    tube(fit, (xa + 0.045, FRONT - 0.03, 0.46), (xa + 0.045, FRONT - 0.03, 0.60), 0.008, STEEL, 12)                  # its handle, on the side away from its hinges
    for hh in (0.47, 0.59):
        tube(fit, (xa + 0.045, FRONT + 0.001, hh), (xa + 0.045, FRONT - 0.03, hh), 0.006, STEEL, 8)
    for k in range(5):                                                                                              # its louvres
        box(fit, xa + 0.07, xb - 0.07, FRONT - 0.004, FRONT + 0.001, 0.20 + k * 0.03, 0.212 + k * 0.03, tint(GREY, 0.8), soft=False)
    G.letter(mark, f"{p_['tag']}  CABLES", 0.020, G.Q(xm, FRONT - 0.0012, FLOOR + 0.78), (-1, 0, 0), (0, 1, 0), BLACK)
    # the three bars the circuit ends on, coming down from the breaker above
    bars_x = [xm + (1 - k) * 0.13 for k in range(3)]
    for k, bx in enumerate(bars_x):
        box(copper, bx - 0.022, bx + 0.022, f + 0.30, f + 0.306, 0.52, 0.90, COPPER, soft=False)
        words(paint, f'L{k + 1}', 0.018, bx, -(t + 0.2994), 0.84, BLACK)
    n = (p_['cable'][0] if p_['cable'] else 0) + (0 if p_['kind'] != 'tie' else 0)
    if n:
        # each cable: up through its gland in the floor, held in a cleat, its three cores to the three bars; its number on a tag
        box(dark, xa + t, xb - t, f + 0.335, f + 0.36, 0.30, 0.34, DARK)                                             # the cleat bar
        for k in range(n):
            cx = xm + (k - (n - 1) / 2) * min(0.085, (C['wide'] - 0.10) / n)
            ci = f + 0.31
            tube(dark, (cx, ci, plinth + 0.012), (cx, ci, plinth + 0.05), 0.032, STEEL, 16)                          # the gland
            tube(cables, (cx, ci, plinth + 0.05), (cx, ci, 0.40), 0.024, CABLE, 14)
            box(dark, cx - 0.03, cx + 0.03, f + 0.283, f + 0.335, 0.30, 0.34, DARK)                                  # its cleat
            for c3, bx in enumerate(bars_x):
                hl = 0.55 + 0.05 * k + 0.012 * c3                                                                    # where this core is landed on its bar
                G.rod(cores, [(cx + (c3 - 1) * 0.012, ci, FLOOR + 0.40), (cx + (c3 - 1) * 0.012, ci - 0.012, FLOOR + 0.46), (bx, f + 0.293, FLOOR + hl - 0.03), (bx, f + 0.293, FLOOR + hl)], 0.0075, CORE[c3])
                tube(bright, (bx, f + 0.286, hl), (bx, f + 0.300, hl), 0.011, STEEL, 6)                              # its lug's bolt
            box(pl, cx - 0.032, cx + 0.032, ci - 0.0262, ci - 0.0242, 0.17, 0.20, WHITE, soft=False)                 # its tag, on the cable
            G.letter(paint, f"{CABLE_NO[p_['tag']]}/{k + 1}", 0.0075, G.Q(cx, ci - 0.0268, FLOOR + 0.181), (-1, 0, 0), (0, 1, 0), BLACK)
    else:
        words(paint, 'NO CABLES: BARS A TO BARS B', 0.012, xm, -(t + 0.40), 0.60, BLACK)
    # the earth bar across the compartment's foot, bolted to the cubicle's two sides (afloat.py: it hung 20 mm short of them)
    box(copper, xa + t, xb - t, f + 0.05, f + 0.056, 0.16, 0.19, COPPER, soft=False)


def build():
    bad = M.wrong()
    if bad:
        raise SystemExit('the main switchboard is not built: ' + '; '.join(bad))
    with component(TAG):
        for p_ in M.MSB_PANELS:
            cubicle(p_)
        steel = part('Main switchboard, cubicles', 'Machinery paint')
        mat = part('Main switchboard, rubber mats', 'Rubber')
        # the lifting eyes on its top, and the insulating mat before it in the aisle
        for no in (1, 3, 5, 7, 9):
            xa, xb = M.panel_x(no)
            steel.ring(G.Q((xa + xb) / 2, (FRONT + BACK) / 2, FLOOR + C['plinth'] + C['high'] + 0.02), (0, 0, 1), 0.03, 0.008, DARK)
        box(mat, X0, X1, FRONT - 0.95, FRONT - 0.05, 0.0, 0.006, srgb(0x2b3033), soft=False)
    return list(_parts.values())


def motion():
    """Each cubicle's cable compartment door opens to a tap, on its hinges at its outboard edge."""
    inputs, movers = [], []
    for p_ in M.MSB_PANELS:
        no = p_['no']
        xa, xb = M.panel_x(no)
        mid = f'msb-door-{no}'
        inputs.append(dict(id=mid, name=f"Main switchboard, cubicle {no} ({p_['tag']}): cable compartment", min=0, max=110, step=1, unit='°', below='', above='open', rest='shut', auto='tap',
                           fitting=TAG, at=list(G.Q((xa + xb) / 2, FRONT, FLOOR + 0.5)), reach=2.0))
        movers.append(dict(id=mid, kind='turn', input=mid, axis=[0, 1, 0], pivot=list(G.Q(xb - 0.004, FRONT + 0.009, FLOOR)), ratio=1.0))
    return inputs, movers
