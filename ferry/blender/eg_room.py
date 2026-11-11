"""
The emergency generator room: built whole, as a block, to the owner's drawing.

The owner, 11 November 2026, twice, with a drawing ("Ship emergency generator room, general arrangement": plan, side
elevation, cutaway, key dimensions) and a picture of the room: "Build the ships emergency generator room".

The drawing is the brief and its measures are kept: a room 7.80 m long, 4.50 m wide and 3.20 m high; from forward to aft
1.00 m clear, the generator set of 4.20 m, 1.20 m clear before the switchboard, and an escape route of 1.00 m to the
weathertight door; 2.40 m of headroom under the ducts. Looking to starboard as its elevation does: the starting battery
bank in the forward corner to port, the day tank on its stand to starboard of it, the set along the middle with its
radiator forward and its alternator aft, the supply air duct with fire damper FD-01 and the exhaust air duct with FD-02
along the starboard wall under the deckhead, the lagged exhaust riser between them, the control panel and the emergency
switchboard against the starboard wall, the door at the after end of that wall, gratings beside and abaft the set, a
yellow guard rail round the alternator, the escape route marked on the deck.

Where it stands. She is to be rebuilt at 68 m (ga.py), and there this room is on the top deck. That hull is not built,
so the block is landed on the present ship's house top, abaft the wheelhouse, where it can be walked today: PLACE below
is the only thing that says where. On the present ship it stands as high as her mast's lower lights and would shade her
radar aft: it is on her for looking at, not as her arrangement.

What is the yard's and not the drawing's: the set's rating is the drawing's (440 V, three-phase, 60 Hz, 500 kW), which is
more than her arrangement gives her main generators and is one of the questions put to the owner with it; the exhaust
goes up through the roof to a silencer of its own (the drawing leads it to the funnel); the tank's quick-closing valve
has a pull outside the door; the tank's vent goes out through the wall; the ducts end in louvres on the walls.
The battery bank in the room is the set's starting battery, as the drawing says; her transitional and radio batteries
are not here (ga.py gives them a room of their own).

Drawn in the room's own measures: p from the forward wall aft (0 to 7.80), q from the port wall to starboard (0 to 4.50),
h up from its deck.
"""
from math import pi, cos, sin
from mathutils import Vector
import lines as L
from shipyard import Part, srgb, tint, component, RUNS

from eg_place import LENGTH, WIDTH, HEIGHT, PLACE, R          # where the block stands: eg_place.py

WALL = 0.08
QC = 2.05                                   # the set's centreline
SET = (1.05, 5.25)                          # the set, from its radiator to its alternator's end
DOOR = dict(p=(6.80, 7.60), sill=0.18, head=2.03)
ROUTE = (6.65, 7.80)                        # the escape route
DUCT = dict(q=(3.86, 4.40), h=(2.46, 2.94))
SUPPLY, EXTRACT = (0.0, 2.20, 2.70), (4.30, 6.15, 6.65)      # each duct: its open or wall end, where its damper begins and ends
RISER = dict(foot=(3.30, QC + 0.30), top=(3.50, 3.90), r=0.16)
TANK = dict(p=(0.80, 1.55), q=(3.78, 4.33), h=(1.75, 2.20))  # 0.75 x 0.55 x 0.45 m: 186 litres
RACK = dict(p=(0.10, 1.00), q=(0.10, 1.00))
PANEL = dict(p=(4.55, 5.15), q=(3.98, 4.40), h=1.70)
BOARD = dict(p=(5.25, 6.55), q=(3.80, 4.40), h=2.00)
GRATINGS = ((1.05, 5.25, 0.10, 1.15), (5.25, 6.65, 0.10, 3.70))
RATING = '440 V, three-phase, 60 Hz, 500 kW'

WHITE, CREAM, GREEN, DKGREEN = srgb(0xe9e7df), srgb(0xdedbd0), srgb(0x8ea897), srgb(0x6f8a78)
DECKGREEN, YELLOW, RED, BLACK = srgb(0x2f6b4f), srgb(0xe8c020), srgb(0xc2312a), srgb(0x1c1e20)
GREY, STEEL, GALV, LAG, DARK = srgb(0x8d9496), srgb(0xa9aeb0), srgb(0xb9bfc2), srgb(0xc8ccce), srgb(0x3a4042)
CABINET, BRASS, BLUE, LAMP = srgb(0xcfd2cd), srgb(0xb08d57), srgb(0x2f66b0), srgb(0xfff6e2)
MOTIONS = []
Z = L.Z


def way(dp, dq, dh):
    """A direction in the room, in the ship."""
    return Vector((-dq, dh, -dp))


class Shop:
    def __init__(self):
        self.parts = {}

    def __call__(self, key, look='Machinery paint', mover=None, **kw):
        slot = (key, mover)
        if slot not in self.parts:
            p = Part(f'Emergency generator room, {key}', look, mover=mover, **kw)
            p.group = 'top'
            self.parts[slot] = p
        return self.parts[slot]


def box(part, p0, p1, q0, q1, h0, h1, colour):
    a, b = R(p0, q0, h0), R(p1, q1, h1)
    part.box(tuple(map(min, a, b)), tuple(map(max, a, b)), colour)


def tube(part, a, b, r, colour, sides=12, r2=None):
    part.tube(R(*a), R(*b), r, r2, colour=colour, sides=sides)


def run(part, points, r, colour, sides=10):
    """A pipe or a cable along a line of points: a length between each two, and a ball of its own width at each bend."""
    RUNS.append(dict(part=part.name, r=r, points=[[round(float(v), 4) for v in R(*c)] for c in points]))
    for a, b in zip(points, points[1:]):
        tube(part, a, b, r, colour, sides)
    for c in points[1:-1]:
        for d in ((1, 0, 0), (0, 1, 0), (0, 0, 1)):
            tube(part, tuple(u - v * r * 0.6 for u, v in zip(c, d)), tuple(u + v * r * 0.6 for u, v in zip(c, d)), r, colour, sides)


def sign(part, centre, facing, w, h, tile, up=(0, 0, 1), proud=0.0015):
    """A picture upright on a face that looks along `facing` (a direction in the room); `up` is the top of the picture."""
    c, n, u = Vector(R(*centre)), way(*facing).normalized(), way(*up).normalized()
    r = u.cross(n)
    c = c + n * proud
    part.picture([tuple(c - r * (w / 2) - u * (h / 2)), tuple(c + r * (w / 2) - u * (h / 2)),
                  tuple(c + r * (w / 2) + u * (h / 2)), tuple(c - r * (w / 2) + u * (h / 2))], tile)


def trapeze(S, p, q0, q1, under):
    """A hanger for a duct: an angle bar down from the deckhead on each side of it and an angle across under it, 40 mm
    sections, so that it is seen to hang on steel and not on a thread."""
    steel = S('supports', 'Machinery paint')
    for q in (q0 - 0.05, q1 + 0.01):
        box(steel, p - 0.02, p + 0.02, q, q + 0.04, under - 0.04, HEIGHT, GREY)
    box(steel, p - 0.02, p + 0.02, q0 - 0.05, q1 + 0.05, under - 0.04, under, GREY)


# ---------------------------------------------------------------------------------------------------------------------
def shell(S):
    """The room itself: its deck, four walls with the door's opening, the deckhead; stiffeners inside; the deck's paint."""
    plate, bars = S('plating', 'Topside paint'), S('stiffeners', 'Topside paint')
    u, (da, db) = PLACE['under'], DOOR['p']
    box(plate, -WALL, 0.0, -WALL, WIDTH + WALL, -u, HEIGHT, WHITE)                          # the forward wall
    box(plate, LENGTH, LENGTH + WALL, -WALL, WIDTH + WALL, -u, HEIGHT, WHITE)               # the after wall
    box(plate, 0.0, LENGTH, -WALL, 0.0, -u, HEIGHT, WHITE)                                  # the port wall
    box(plate, 0.0, da, WIDTH, WIDTH + WALL, -u, HEIGHT, WHITE)                             # the starboard wall, round the door
    box(plate, db, LENGTH, WIDTH, WIDTH + WALL, -u, HEIGHT, WHITE)
    box(plate, da, db, WIDTH, WIDTH + WALL, DOOR['head'], HEIGHT, WHITE)
    box(plate, da, db, WIDTH - 0.012, WIDTH + WALL + 0.012, -u, DOOR['sill'], WHITE)        # the sill, through the wall
    box(plate, -WALL, LENGTH + WALL, -WALL, WIDTH + WALL, HEIGHT, HEIGHT + 0.01, tint(WHITE, 0.96))   # the deckhead
    floor = S('deck', 'Deck paint')
    box(floor, 0.0, LENGTH, 0.0, WIDTH, -u, 0.0, DECKGREEN)
    # stiffeners: flat bars on the walls every 0.65 m, beams under the deckhead; none where a duct or the door goes through
    k = 1
    while k * 0.65 < LENGTH - 0.2:
        p = k * 0.65
        box(bars, p - 0.005, p + 0.005, 0.0, 0.08, 0.0, HEIGHT, WHITE)
        if not (da - 0.06 < p < db + 0.06):
            top = 2.40 if EXTRACT[1] - 0.1 < p < EXTRACT[2] + 0.1 else HEIGHT
            box(bars, p - 0.005, p + 0.005, WIDTH - 0.08, WIDTH, 0.0, top, WHITE)
        box(bars, p - 0.005, p + 0.005, 0.08, WIDTH - 0.08, HEIGHT - 0.15, HEIGHT, WHITE)   # a beam
        k += 1
    k = 1
    while k * 0.65 < WIDTH - 0.2:
        q = k * 0.65
        if not (DUCT['q'][0] - 0.08 < q < DUCT['q'][1] + 0.08):
            box(bars, 0.0, 0.08, q - 0.005, q + 0.005, 0.0, HEIGHT - 0.15, WHITE)
        box(bars, LENGTH - 0.08, LENGTH, q - 0.005, q + 0.005, 0.0, HEIGHT - 0.15, WHITE)
        k += 1
    # the escape route on the deck: two yellow lines and its arrow; a yellow edge to the machinery's side
    lines, words = S('deck markings', 'Marking'), S('signs', 'Panel face')
    for p in (ROUTE[0] + 0.08, LENGTH - 0.10):
        box(lines, p, p + 0.05, 0.25, WIDTH - 0.05, 0.0, 0.003, YELLOW)
    box(lines, ROUTE[0] + 0.08, LENGTH - 0.05, 0.20, 0.25, 0.0, 0.003, YELLOW)
    sign(words, (ROUTE[0] + 0.62, 2.35, 0.003), (0, 0, 1), 0.78, 0.78, 'eg_escape_floor', up=(0, 1, 0), proud=0.0)


def gratings(S):
    """Gratings beside the set and before the switchboard, 40 mm over the deck; the rubber mat before the board."""
    steel, face = S('gratings', 'Machinery paint'), S('grating faces', 'Panel face')
    mat_q = BOARD['q'][0] - 0.85                                 # the rubber mat before the board lies on the grating's bars
    for p0, p1, q0, q1 in GRATINGS:
        box(steel, p0, p1, q0, q1, 0.0, 0.04, srgb(0x6f7678))
        if q1 > mat_q:
            q1 = mat_q - 0.01                                     # no pattern under the mat: it would come through it
        np_, nq = max(1, round((p1 - p0) / 0.7)), max(1, round((q1 - q0) / 0.7))
        dp, dq = (p1 - p0) / np_, (q1 - q0) / nq
        for i in range(np_):
            for j in range(nq):
                sign(face, (p0 + (i + 0.5) * dp, q0 + (j + 0.5) * dq, 0.04), (0, 0, 1), dq, dp, 'eg_grating', up=(1, 0, 0), proud=0.0)
    mat = S('rubber', 'Upholstery')
    (a, b), q0 = BOARD['p'], BOARD['q'][0]
    box(mat, a, b, q0 - 0.85, q0 - 0.05, 0.04, 0.048, srgb(0x2a2d2f))


def generator_set(S):
    """The set: a skid on six mounts, the radiator in its cowl, a six-cylinder engine with its turbocharger and filters, the alternator."""
    green, dark = S('set, enamel', smooth=True, angle=40), S('set, dark parts', 'Plastic', smooth=True, angle=40)
    bright, rubber = S('set, bright steel', 'Shaft steel', smooth=True, angle=40), S('rubber', 'Upholstery')
    face = S('signs', 'Panel face')
    a, b = SET
    with component('EMG-01'):
        for p in (a + 0.30, (a + b) / 2, b - 0.35):                                         # pads on the deck, mounts on the pads
            for s in (-1, 1):
                q = QC + s * 0.56
                box(bright, p - 0.12, p + 0.12, q - 0.12, q + 0.12, 0.0, 0.03, STEEL)
                tube(rubber, (p, q, 0.03), (p, q, 0.10), 0.075, BLACK, 14)
                box(bright, p - 0.10, p + 0.10, q - 0.10, q + 0.10, 0.10, 0.12, STEEL)
        for s in (-1, 1):                                                                   # the skid's two rails
            box(green, a, b, QC + s * 0.56 - 0.08, QC + s * 0.56 + 0.08, 0.12, 0.34, DKGREEN)
        for p in (a + 0.06, 2.20, 3.30, 4.40, b - 0.06):
            box(green, p - 0.06, p + 0.06, QC - 0.48, QC + 0.48, 0.15, 0.34, DKGREEN)
        box(green, a + 0.12, b - 0.12, QC - 0.48, QC + 0.48, 0.125, 0.14, tint(DKGREEN, 0.8))  # the drip tray between them
        # the radiator in its cowl, its core behind a grille at the forward end
        # (as high as the drawing's elevation shows it: lower than the engine's air filter, so the engine is seen over it)
        box(green, a, 2.00, QC - 0.72, QC + 0.72, 0.34, 1.50, GREEN)
        box(dark, a - 0.02, a, QC - 0.62, QC + 0.62, 0.50, 1.42, DARK)
        for k in range(6):
            box(green, a - 0.035, a - 0.02, QC - 0.64, QC + 0.64, 0.56 + k * 0.15, 0.585 + k * 0.15, DKGREEN)
        tube(dark, (a + 0.45, QC + 0.25, 1.50), (a + 0.45, QC + 0.25, 1.58), 0.06, DARK, 12)   # the filler cap
        sign(face, ((a + 2.00) / 2, QC - 0.72, 0.95), (0, -1, 0), 0.70, 0.55, 'eg_plate')
        # the engine: crankcase, head, six covers; the manifold and turbocharger to starboard, the fuel side to port
        box(green, 2.00, 3.95, QC - 0.36, QC + 0.36, 0.34, 1.20, GREEN)
        box(green, 2.08, 3.87, QC - 0.31, QC + 0.31, 1.20, 1.42, tint(GREEN, 0.94))
        for k in range(6):
            box(green, 2.12 + k * 0.29, 2.36 + k * 0.29, QC - 0.17, QC + 0.17, 1.42, 1.52, tint(GREEN, 1.04))
        tube(bright, (2.25, QC + 0.44, 1.32), (3.25, QC + 0.44, 1.32), 0.08, LAG, 12)       # the lagged exhaust manifold
        for k in range(6):
            box(bright, 2.20 + k * 0.29, 2.28 + k * 0.29, QC + 0.30, QC + 0.44, 1.26, 1.38, LAG)
        tx, tq = RISER['foot']
        tube(dark, (tx - 0.20, tq, 1.62), (tx + 0.02, tq, 1.62), 0.17, BLACK, 18)           # the compressor
        tube(bright, (tx + 0.02, tq, 1.62), (tx + 0.24, tq, 1.62), 0.15, LAG, 18)           # the turbine, lagged
        tube(bright, (tx + 0.13, tq, 1.36), (tx + 0.13, tq, 1.50), 0.07, LAG, 12)           # from the manifold up into it
        tube(dark, (tx - 0.20, tq, 1.62), (tx - 0.36, tq - 0.25, 1.70), 0.07, BLACK, 12)    # to the air filter
        tube(dark, (tx - 0.36, tq - 0.25, 1.52), (tx - 0.36, tq - 0.25, 1.92), 0.20, BLACK, 18)
        tube(dark, (tx - 0.36, tq - 0.25, 1.92), (tx - 0.36, tq - 0.25, 1.96), 0.22, DARK, 18)
        tube(dark, (2.00, QC - 0.12, 1.34), (2.12, QC - 0.12, 1.34), 0.045, BLACK, 10)      # the coolant hoses to the radiator
        tube(dark, (2.00, QC + 0.14, 0.52), (2.10, QC + 0.14, 0.52), 0.045, BLACK, 10)
        tube(green, (2.14, QC - 0.42, 1.22), (3.80, QC - 0.42, 1.22), 0.055, GREEN, 12)     # the inlet manifold
        box(green, 2.20, 2.78, QC - 0.54, QC - 0.36, 0.84, 1.10, DKGREEN)                   # the injection pump
        box(bright, 2.92, 3.24, QC - 0.50, QC - 0.36, 0.98, 1.04, STEEL)                    # the filter head, two fuel filters
        for p in (3.00, 3.16):
            tube(S('set, filters', 'Plastic', smooth=True, angle=40), (p, QC - 0.43, 0.78), (p, QC - 0.43, 0.98), 0.055, srgb(0xe8e6e0), 14)
        tube(dark, (3.48, QC - 0.43, 0.58), (3.48, QC - 0.43, 0.82), 0.06, BLACK, 14)       # the oil filter
        box(bright, 3.40, 3.56, QC - 0.50, QC - 0.36, 0.82, 0.86, STEEL)
        tube(bright, (2.84, QC - 0.37, 0.80), (2.84, QC - 0.42, 1.26), 0.008, STEEL, 6)     # the dipstick, its yellow grip
        tube(S('yellow', 'Machinery paint', smooth=True, angle=40), (2.84, QC - 0.42, 1.26), (2.84, QC - 0.425, 1.31), 0.018, YELLOW, 10)
        tube(dark, (3.58, QC - 0.46, 0.56), (3.95, QC - 0.46, 0.56), 0.075, DARK, 12)       # the starter
        for p in (2.30, 3.60):                                                              # two lifting eyes
            box(bright, p - 0.03, p + 0.03, QC - 0.012, QC + 0.012, 1.52, 1.62, STEEL)
        tube(green, (3.95, QC, 0.84), (4.20, QC, 0.84), 0.50, GREEN, 28)                    # the flywheel housing
        # the alternator: its frame, its end cover, its feet on the skid, its terminal box
        tube(green, (4.20, QC, 0.84), (5.10, QC, 0.84), 0.46, GREEN, 28)
        tube(green, (5.10, QC, 0.84), (b - 0.03, QC, 0.84), 0.40, DKGREEN, 28)
        for k in range(7):
            ang = pi * (0.15 + 0.10 * k)
            for s in (-1, 1):
                tube(dark, (4.42 + k * 0.07, QC + s * 0.455 * sin(ang), 0.84 + 0.455 * cos(ang)), (4.42 + k * 0.07, QC + s * 0.47 * sin(ang), 0.84 + 0.47 * cos(ang)), 0.02, DARK, 6)
        for s in (-1, 1):
            box(green, 4.30, 5.00, QC + s * 0.50 - 0.10, QC + s * 0.50 + 0.10, 0.34, 0.66, DKGREEN)
        box(green, 4.36, 4.86, QC - 0.24, QC + 0.24, 1.26, 1.56, GREEN)                     # the regulator's housing, on top
        box(green, 4.50, 4.70, QC + 0.44, QC + 0.60, 0.74, 0.94, DKGREEN)                   # the neck to the terminal box
        box(green, 4.40, 4.80, QC + 0.59, QC + 0.79, 0.62, 1.02, GREEN)                     # the terminal box, on the starboard side


def exhaust(S):
    """The exhaust: a bellows on the turbine, the lagged riser with its bands, up through the deckhead to a silencer on the roof."""
    lag, steel = S('lagging', 'Zinc', smooth=True, angle=40), S('exhaust, steel', 'Shaft steel', smooth=True, angle=40)
    face = S('signs', 'Panel face')
    (fp, fq), (tp, tq), r = RISER['foot'], RISER['top'], RISER['r']
    fp += 0.13
    with component('EMG-08'):
        tube(steel, (fp, fq, 1.76), (fp, fq, 1.80), 0.13, STEEL, 16)                        # the flange on the turbine
        for k in range(5):                                                                  # the bellows
            tube(steel, (fp, fq, 1.80 + k * 0.06), (fp, fq, 1.83 + k * 0.06), 0.125, DARK, 16)
            tube(steel, (fp, fq, 1.83 + k * 0.06), (fp, fq, 1.86 + k * 0.06), 0.10, DARK, 16)
        pts = [(fp, fq, 2.08), (fp, fq, 2.30), (tp, tq, 2.72), (tp, tq, HEIGHT + 0.02)]
        for a, b in zip(pts, pts[1:]):
            tube(lag, a, b, r, LAG, 18)
            n = max(1, int((Vector(b) - Vector(a)).length / 0.16))
            for k in range(1, n):                                                           # the lagging's bands
                c = Vector(a) + (Vector(b) - Vector(a)) * (k / n)
                d = (Vector(b) - Vector(a)).normalized() * 0.012
                tube(lag, tuple(c - d), tuple(c + d), r + 0.008, tint(LAG, 0.85), 18)
        for c in pts[1:-1]:
            tube(lag, (c[0], c[1], c[2] - 0.1), (c[0], c[1], c[2] + 0.1), r, LAG, 18)
        box(steel, tp - 0.19, tp + 0.19, tq - r - 0.012, tq - r + 0.004, 2.84, 3.06, GALV)  # the label's plate, on the riser's side
        box(steel, tp - 0.24, tp + 0.24, tq - 0.24, tq + 0.24, HEIGHT - 0.012, HEIGHT, STEEL)   # the collar under the deckhead
        tube(steel, (tp, tq, 2.83), (tp, tq, 2.87), r + 0.014, GREY, 18)                    # a band round it, and two stays to the wall
        for dp in (-0.15, 0.15):
            box(S('supports', 'Machinery paint'), tp + dp - 0.015, tp + dp + 0.015, tq + 0.08, WIDTH, 2.836, 2.864, GREY)
        # on the roof: the collar, the silencer, the tail pipe and its flap
        top = HEIGHT + 0.01
        box(steel, tp - 0.26, tp + 0.26, tq - 0.26, tq + 0.26, top, top + 0.02, STEEL)
        tube(lag, (tp, tq, top + 0.02), (tp, tq, top + 0.30), 0.14, tint(LAG, 0.8), 18)
        tube(steel, (tp, tq, top + 0.30), (tp, tq, top + 1.50), 0.24, srgb(0x5c6266), 20)
        tube(steel, (tp, tq, top + 1.50), (tp, tq, top + 1.95), 0.11, srgb(0x5c6266), 16)
        tube(steel, (tp - 0.12, tq, top + 1.96), (tp + 0.12, tq, top + 2.00), 0.125, DARK, 16)
        for s in (-1, 1):                                                                   # two stays to the roof
            tube(steel, (tp + s * 0.22, tq, top + 1.30), (tp + s * 0.75, tq, top + 0.0), 0.012, STEEL, 6)
    sign(face, (tp, tq - r - 0.012, 2.95), (0, -1, 0), 0.34, 0.20, 'eg_exhaust')


def duct(S, tag, ends, tile, label, mover, name, outside, hung):
    """One air duct along the starboard wall: from the wall (or its open end) to its fire damper, the damper with its lever.
    It hangs on trapezes at `hung` (clear of its label, its joints, the wall's stiffeners and the deckhead's beams); the damper
    has one of its own."""
    galv, red = S('ducts', 'Zinc'), S('fire dampers', 'Machinery paint')
    face, spindle = S('signs', 'Panel face'), S('spindles', 'Shaft steel', smooth=True, angle=40)
    (q0, q1), (h0, h1) = DUCT['q'], DUCT['h']
    a, d0, d1 = ends
    lo, hi = min(a, d0), max(a, d0)
    with component(tag):
        box(galv, lo, hi, q0, q1, h0, h1, GALV)
        mid, half = (lo + hi) / 2 + (0.0 if outside == 'forward' else 0.1), min(1.25, hi - lo - 0.3) / 2
        for p in (lo + 0.02, mid - half - 0.10, mid + half + 0.10):                         # the joints' flanges, clear of the label
            if lo + 0.015 <= p <= hi - 0.015:
                box(galv, p - 0.015, p + 0.015, q0 - 0.02, q1 + 0.02, h0 - 0.02, h1 + 0.02, tint(GALV, 0.9))
        for p in hung:
            trapeze(S, p, q0, q1, h0)
        box(red, d0, d1, q0 - 0.04, q1 + 0.04, h0 - 0.04, h1 + 0.04, RED)                   # the damper's casing
        trapeze(S, d0 + 0.03, q0 - 0.04, q1 + 0.04, h0 - 0.04)
        sign(face, ((d0 + d1) / 2, q0 - 0.04, (h0 + h1) / 2 + 0.06), (0, -1, 0), 0.36, 0.28, label)
        # its lever: a spindle through the casing, an arm that hangs down while it is open and lies along the duct when shut
        px, ph = (d0 + d1) / 2, h0 + 0.02
        tube(spindle, (px, q0 - 0.04, ph), (px, q0 - 0.075, ph), 0.014, STEEL, 8)
        arm = S(f'damper lever, {name}', 'Machinery paint', mover=mover, smooth=True, angle=40)
        tube(arm, (px, q0 - 0.085, ph), (px, q0 - 0.085, ph - 0.24), 0.011, YELLOW, 8)
        tube(arm, (px, q0 - 0.075, ph), (px, q0 - 0.095, ph), 0.022, YELLOW, 10)
        tube(arm, (px, q0 - 0.085, ph - 0.24), (px, q0 - 0.085, ph - 0.30), 0.018, BLACK, 10)
        MOTIONS.append(dict(id=mover, name=f'Fire damper {name}', kind='lever', pivot=R(px, q0 - 0.085, ph)))
        if outside == 'forward':                                                            # in through the forward wall: its louvre outside
            box(galv, -0.06, 0.0, q0, q1, h0, h1, GALV)
            louvre(S, 'p', -WALL, (q0, q1), (h0, h1))
        else:                                                                               # out through the starboard wall beside the damper
            box(galv, d0 + 0.06, d1 - 0.06, q1 + 0.04, WIDTH + 0.06, h0 + 0.03, h1 - 0.03, GALV)
            louvre(S, 'q', WIDTH + WALL, (d0, d1), (h0, h1))
            box(S('dark fittings', 'Plastic'), lo - 0.012, lo, q0 + 0.03, q1 - 0.03, h0 + 0.03, h1 - 0.03, DARK)   # the open end's grille
            for k in range(6):
                box(galv, lo - 0.018, lo - 0.012, q0 + 0.02, q1 - 0.02, h0 + 0.05 + k * 0.07, h0 + 0.075 + k * 0.07, tint(GALV, 0.9))
    if outside == 'forward':                                                                # the supply's open end, past its damper
        box(S('dark fittings', 'Plastic'), d1, d1 + 0.012, q0 + 0.03, q1 - 0.03, h0 + 0.03, h1 - 0.03, DARK)
        for k in range(6):
            box(galv, d1 + 0.012, d1 + 0.018, q0 + 0.02, q1 - 0.02, h0 + 0.05 + k * 0.07, h0 + 0.075 + k * 0.07, tint(GALV, 0.9))
    sign(face, (mid, q0, (h0 + h1) / 2), (0, -1, 0), 2 * half, 0.36, tile)


def louvre(S, across, face, span, heights):
    """A weather louvre on the outside of a wall: a frame and six blades. `across` names the axis the wall is thin along."""
    steel = S('louvres', 'Topside paint')
    (a, b), (h0, h1) = span, heights
    out = -1 if face < 0 else 1
    f0, f1 = sorted((face, face + out * 0.05))

    def put(u0, u1, w0, w1, g0, g1, colour):
        if across == 'p':
            box(steel, w0, w1, u0, u1, g0, g1, colour)
        else:
            box(steel, u0, u1, w0, w1, g0, g1, colour)

    put(a - 0.04, a, f0, f1, h0 - 0.04, h1 + 0.04, WHITE)
    put(b, b + 0.04, f0, f1, h0 - 0.04, h1 + 0.04, WHITE)
    put(a, b, f0, f1, h1, h1 + 0.04, WHITE)
    put(a, b, f0, f1, h0 - 0.04, h0, WHITE)
    put(a, b, *sorted((face, face + out * 0.006)), h0, h1, DARK)                             # the dark of the opening behind the blades
    n = 6
    for k in range(n):
        g = h0 + (h1 - h0) * k / n
        put(a, b, *sorted((face + out * 0.01, face + out * 0.045)), g + 0.01, g + 0.035, tint(WHITE, 0.92))


# The pipe rack on the forward wall: channels that stand 100 mm off the plating, each with what is clamped to it.
RACK_P = 0.10
UPRIGHTS = ((1.50, 0.02, 0.20, 1.10), (2.30, 0.02, 0.20, 1.10), (3.10, 0.02, 0.20, 1.10), (3.75, 0.02, 0.20, 1.10), (4.34, 0.07, 0.20, 2.44))
DROPS = (1.25, 1.35, 0.0, 1.02)             # a plate on the stiffener at 1.30 m, for the two lines that go down to the deck there
SUPPLY_Q, RETURN_Q, CONDUIT_Q = 1.33, 1.27, 1.21     # the three lines along the deck between the grating and the skid


def clamp(S, q, h, r, upright=True):
    """A clamp round a pipe that runs along the forward wall's rack, at an upright."""
    box(S('supports', 'Machinery paint'), RACK_P, RACK_P + 2 * r + 0.008, q - 0.014, q + 0.014, h - r - 0.008, h + r + 0.008, tint(GREY, 0.8))


def day_tank(S):
    """The day tank on its stand: a tray under it, its gauge, its valve with the pull to outside, its vent out through the wall; and
    the fuel lines, each clamped to the rack on the forward wall, laid on the deck or fixed to the skid."""
    green, steel = S('tank and stand', smooth=False), S('pipes', 'Shaft steel', smooth=True, angle=40)
    yellow, face = S('yellow', 'Machinery paint', smooth=True, angle=40), S('signs', 'Panel face')
    sup = S('supports', 'Machinery paint')
    (p0, p1), (q0, q1), (h0, h1) = TANK['p'], TANK['q'], TANK['h']
    with component('EMG-06'):
        box(green, p0 - 0.05, p1 + 0.05, q0 - 0.05, q1 + 0.05, 0.0, 0.02, DKGREEN)          # the tray: a floor and a rim
        for a, b, c, d in ((p0 - 0.05, p1 + 0.05, q0 - 0.05, q0 - 0.03), (p0 - 0.05, p1 + 0.05, q1 + 0.03, q1 + 0.05),
                           (p0 - 0.05, p0 - 0.03, q0 - 0.03, q1 + 0.03), (p1 + 0.03, p1 + 0.05, q0 - 0.03, q1 + 0.03)):
            box(green, a, b, c, d, 0.02, 0.08, DKGREEN)
        for p in (p0, p1 - 0.05):                                                           # four legs, two frames
            for q in (q0, q1 - 0.05):
                box(green, p, p + 0.05, q, q + 0.05, 0.02, h0, GREEN)
        for h in (0.55, h0 - 0.05):
            box(green, p0, p1, q0, q0 + 0.05, h, h + 0.05, GREEN)
            box(green, p0, p1, q1 - 0.05, q1, h, h + 0.05, GREEN)
            box(green, p0, p0 + 0.05, q0, q1, h, h + 0.05, GREEN)
            box(green, p1 - 0.05, p1, q0, q1, h, h + 0.05, GREEN)
        box(green, p0, p1, q0, q1, h0, h1, CREAM)                                           # the tank
        box(green, (p0 + p1) / 2 - 0.12, (p0 + p1) / 2 + 0.12, q0 + 0.1, q0 + 0.34, h1, h1 + 0.015, tint(CREAM, 0.9))   # its manhole cover
        sign(face, ((p0 + p1) / 2, q0, (h0 + h1) / 2), (0, -1, 0), 0.60, 0.34, 'eg_daytank')
        gx = p1 - 0.06                                                                      # the level gauge on its face
        for h in (h0 + 0.05, h1 - 0.05):
            tube(steel, (gx, q0, h), (gx, q0 - 0.035, h), 0.012, BRASS, 8)
        tube(S('gauge glass', 'Lens', smooth=True, angle=40), (gx, q0 - 0.035, h0 + 0.03), (gx, q0 - 0.035, h1 - 0.03), 0.012, srgb(0xd9c98a), 8)
    vp, vq = p0 + 0.20, q1 - 0.12
    with component('EMG-07'):
        # The outlet: a quick-closing valve under the tank, shut by a wire from a pull outside the door (fire: one does not
        # go in to shut the fuel). The wire runs along the starboard wall through an eye on each stiffener.
        tube(steel, (vp, vq, h0), (vp, vq, h0 - 0.10), 0.02, STEEL, 10)
        red = S('red fittings', 'Machinery paint', smooth=True, angle=40)
        tube(red, (vp, vq, h0 - 0.10), (vp, vq, h0 - 0.20), 0.04, RED, 12)
        tube(yellow, (vp, vq, h0 - 0.15), (vp, vq + 0.10, h0 - 0.10), 0.01, YELLOW, 8)       # its trip lever
        wq = WIDTH - 0.085
        run(S('pull wire', 'Shaft steel'), [(vp, vq + 0.10, h0 - 0.10), (vp, wq, h0 - 0.10), (vp, wq, 2.34), (6.50, wq, 2.34), (6.50, wq, 1.42), (6.50, WIDTH, 1.42)], 0.004, STEEL, 6)
        box(sup, vp - 0.012, vp + 0.012, wq - 0.012, WIDTH, 1.98, 2.0, GREY)                # an eye on the plating where no stiffener is
        box(sup, vp - 0.012, vp + 0.012, wq - 0.012, WIDTH, 2.32, 2.34, GREY)
        box(red, 6.40, 6.60, WIDTH + WALL, WIDTH + WALL + 0.07, 1.28, 1.56, RED)             # the pull, in its box outside
        tube(yellow, (6.50, WIDTH + WALL + 0.07, 1.40), (6.50, WIDTH + WALL + 0.11, 1.40), 0.03, YELLOW, 12)
        sign(face, (6.50, WIDTH + WALL + 0.07, 1.50), (0, 1, 0), 0.18, 0.09, 'eg_fuel_shutoff')
    with component('EMG-11'):
        # ---- the rack on the forward wall
        for q, half, a, b in UPRIGHTS:
            box(sup, 0.0, RACK_P, q - half, q + half, a, b, GREY)
        box(sup, 0.08, RACK_P, DROPS[0], DROPS[1], DROPS[2], DROPS[3], GREY)
        rs, rr, rf = 0.014, 0.011, 0.017
        ps, pr, pf = RACK_P + rs, RACK_P + rr, RACK_P + rf
        # the supply: from the valve down, forward to the rack, along it at 0.95 m, down the plate to the deck, along the deck
        # beside the skid, and up to the filter head on a bracket from the skid's rail
        run(steel, [(vp, vq, h0 - 0.20), (vp, vq, 0.95), (ps, vq, 0.95), (ps, SUPPLY_Q, 0.95), (ps, SUPPLY_Q, rs), (2.96, SUPPLY_Q, rs), (2.96, SUPPLY_Q, 1.01), (2.96, QC - 0.50, 1.01)], rs, STEEL, 8)
        # the return: from the injection pump out and down, forward along the deck, up the plate, along the rack at 0.65 m, up the
        # wide channel at the starboard end and over into the tank's top
        run(steel, [(2.60, QC - 0.54, 0.90), (2.60, RETURN_Q, 0.90), (2.60, RETURN_Q, rr), (pr, RETURN_Q, rr), (pr, RETURN_Q, 0.65), (pr, 4.30, 0.65), (pr, 4.30, 2.30),
                    (1.20, 4.30, 2.30), (1.20, 4.30, h1)], rr, STEEL, 8)
        # the filling line from the service tank: up through the deck at the first upright, along the rack at 0.35 m with its
        # strainer and valve, up the wide channel and over into the tank's top
        run(steel, [(pf, 1.50, 0.0), (pf, 1.50, 0.35), (pf, 4.38, 0.35), (pf, 4.38, 2.38), (0.45, 4.38, 2.38), (0.45, 3.96, 2.38), (1.00, 3.96, 2.38), (1.00, 3.96, h1)], rf, STEEL, 8)
        for q, half, a, b in UPRIGHTS[:4]:
            for h, r in ((0.95, rs), (0.65, rr), (0.35, rf)):
                clamp(S, q, h, r)
        for h in (0.50, 1.20, 1.90):
            clamp(S, 4.30, max(h, 0.80), rr)
            clamp(S, 4.38, h, rf)
        for q, r in ((SUPPLY_Q, rs), (RETURN_Q, rr)):                                       # the two risers at the engine, each on a bracket from the rail
            pp = 2.96 if q == SUPPLY_Q else 2.60
            box(sup, pp - 0.015, pp + 0.015, q - r, QC - 0.64, 0.28, 0.31, GREY)
        box(sup, p0, p0 + 0.05, vq - 0.015, vq + 0.015, 0.60, 0.95 - rs, GREY)                # the supply's lead from the valve rests on a post from the stand's frame
        box(yellow, 0.20, 1.02, 1.17, 1.39, 0.0, 0.045, YELLOW)                             # a step-over plate over the lines where one walks
        tube(S('blue fittings', 'Machinery paint', smooth=True, angle=40), (pf, 2.58, 0.35), (pf, 2.82, 0.35), 0.045, BLUE, 12)   # the strainer
        tube(steel, (pf, 3.36, 0.35), (pf, 3.48, 0.35), 0.035, BRASS, 10)                   # the filling valve, its wheel
        tube(yellow, (pf, 3.42, 0.35), (pf + 0.09, 3.42, 0.35), 0.008, YELLOW, 6)
        tube(yellow, (pf + 0.09, 3.42, 0.35), (pf + 0.10, 3.42, 0.35), 0.045, YELLOW, 12)
        for h, r, q, tile in ((0.95, rs, 2.70, 'eg_tag_supply'), (0.65, rr, 2.70, 'eg_tag_return'), (0.35, rf, 1.96, 'eg_tag_service')):
            box(steel, RACK_P + 2 * r, RACK_P + 2 * r + 0.006, q - 0.13, q + 0.13, h - 0.03, h + 0.03, YELLOW)   # a tag on each line
            sign(face, (RACK_P + 2 * r + 0.006, q, h), (1, 0, 0), 0.25, 0.055, tile)
        # the vent: up from the tank's top and out through the starboard wall to a gooseneck with a gauze
        run(steel, [(p1 - 0.12, q1 - 0.10, h1), (p1 - 0.12, q1 - 0.10, 2.32), (p1 - 0.12, WIDTH + WALL + 0.10, 2.32), (p1 - 0.12, WIDTH + WALL + 0.10, 2.20)], 0.016, STEEL, 8)
        tube(steel, (p1 - 0.12, WIDTH + WALL + 0.10, 2.20), (p1 - 0.12, WIDTH + WALL + 0.10, 2.15), 0.028, BRASS, 10)


def batteries(S):
    """The starting battery bank: eight blocks in a steel rack, their links; the cable to the starter in a conduit on the deck and
    on the skid's rail; the charger on the wall above, its cable in a conduit down to the rack."""
    steel, dark = S('rack', 'Machinery paint'), S('batteries', 'Plastic')
    red, face = S('red fittings', 'Machinery paint', smooth=True, angle=40), S('signs', 'Panel face')
    leads, conduit = S('cables, battery', 'Plastic', smooth=True, angle=40), S('conduit', 'Zinc', smooth=True, angle=40)
    (p0, p1), (q0, q1) = RACK['p'], RACK['q']
    with component('EMG-02'):
        for p in (p0, p1 - 0.04):
            for q in (q0, q1 - 0.04):
                box(steel, p, p + 0.04, q, q + 0.04, 0.0, 0.95, GREY)
        for h in (0.14, 0.91):
            box(steel, p0, p1, q0, q0 + 0.04, h, h + 0.04, GREY)
            box(steel, p0, p1, q1 - 0.04, q1, h, h + 0.04, GREY)
            box(steel, p0, p0 + 0.04, q0, q1, h, h + 0.04, GREY)
            box(steel, p1 - 0.04, p1, q0, q1, h, h + 0.04, GREY)
        box(steel, p0 + 0.04, p1 - 0.04, q0 + 0.04, q1 - 0.04, 0.16, 0.18, tint(GREY, 0.85))  # the shelf
        for i in range(4):
            for j in range(2):
                a, c = p0 + 0.06 + i * 0.198, q0 + 0.06 + j * 0.40
                box(dark, a, a + 0.18, c, c + 0.36, 0.18, 0.50, BLACK)
                for k, colour in ((0.07, RED), (0.29, srgb(0x2a2a2a))):
                    tube(red if colour == RED else S('set, dark parts', 'Plastic', smooth=True, angle=40), (a + 0.09, c + k, 0.50), (a + 0.09, c + k, 0.53), 0.018, colour, 8)
            if i < 3:                                                                       # the links between the blocks
                for j in range(2):
                    tube(red, (p0 + 0.15 + i * 0.198, q0 + 0.13 + j * 0.40, 0.535), (p0 + 0.15 + (i + 1) * 0.198, q0 + 0.13 + j * 0.40, 0.535), 0.009, RED, 6)
        box(steel, p1 - 0.004, p1 + 0.004, q0 + 0.03, q1 - 0.03, 0.56, 0.86, tint(GREY, 1.1))  # the name plate's plate, between the rack's after posts
        sign(face, (p1 + 0.004, (q0 + q1) / 2, 0.71), (1, 0, 0), 0.70, 0.28, 'eg_battery')
        # the lead from the last block down the rack's post; from its foot a conduit along the deck beside the fuel lines (under
        # the step-over plate where one walks), then up the skid's rail to the starter
        run(leads, [(p1 - 0.08, q1 - 0.12, 0.535), (p1 - 0.08, q1 + 0.012, 0.535), (p1 - 0.02, q1 + 0.012, 0.535), (p1 - 0.02, q1 + 0.012, 0.03)], 0.012, RED, 8)
        rail = QC - 0.64 - 0.016
        run(conduit, [(p1 - 0.02, q1 + 0.016, 0.016), (p1 - 0.02, CONDUIT_Q, 0.016), (3.76, CONDUIT_Q, 0.016), (3.76, rail, 0.016), (3.76, rail, 0.56), (3.76, QC - 0.50, 0.56)], 0.016, GALV, 8)
    with component('EMG-03'):
        cab = S('cabinets', 'Console paint')
        box(cab, 0.28, 0.82, 0.08, 0.26, 1.30, 1.80, CABINET)                               # the charger, on the stiffeners of the port wall
        sign(face, (0.55, 0.26, 1.55), (0, 1, 0), 0.46, 0.42, 'eg_charger')
        run(conduit, [(0.55, 0.12, 1.30), (0.55, 0.12, 0.95)], 0.014, GALV, 8)              # down into the rack's top frame


def boards(S):
    """The generator's control panel and the emergency switchboard, on plinths against the starboard wall; and the way the
    alternator's cables go to the board: down from its terminal box into a covered duct on the deck, across to the wall, up a
    cable ladder and along a ladder under the duct, down into the board's top. No cable crosses the room in the air."""
    cab, dark = S('cabinets', 'Console paint'), S('dark fittings', 'Plastic')
    face, red = S('signs', 'Panel face'), S('red fittings', 'Machinery paint', smooth=True, angle=40)
    cable, conduit = S('cables', 'Plastic', smooth=True, angle=40), S('conduit', 'Zinc', smooth=True, angle=40)
    ladder, sup = S('cable ladders', 'Zinc'), S('supports', 'Machinery paint')
    (a, b), (q0, q1), top = PANEL['p'], PANEL['q'], PANEL['h']
    with component('EMG-04'):
        box(dark, a, b, q0 + 0.02, q1, 0.0, 0.06, DARK)
        box(cab, a, b, q0, q1, 0.06, top, CABINET)
        sign(face, ((a + b) / 2, q0, 0.06 + (top - 0.06) / 2 + 0.05), (0, -1, 0), 0.54, 1.40, 'eg_control')
        tube(red, ((a + b) / 2 + 0.16, q0, 0.92), ((a + b) / 2 + 0.16, q0 - 0.035, 0.92), 0.028, RED, 12)   # the emergency stop
    (a, b), (q0, q1), top = BOARD['p'], BOARD['q'], BOARD['h']
    with component('EMG-05'):
        box(dark, a, b, q0 + 0.02, q1, 0.0, 0.06, DARK)
        box(cab, a, b, q0, q1, 0.06, top, CABINET)
        box(cab, a - 0.01, b + 0.01, q0 - 0.01, q1, top, top + 0.02, tint(CABINET, 0.9))    # the drip cover
        mid = (a + b) / 2
        for k, tile in enumerate(('eg_esb_1', 'eg_esb_2')):
            sign(face, (a + (k + 0.5) * (b - a) / 2, q0, 0.06 + (top - 0.06) / 2), (0, -1, 0), (b - a) / 2 - 0.02, top - 0.10, tile)
        box(dark, mid - 0.004, mid + 0.004, q0 - 0.004, q0, 0.08, top - 0.02, DARK)
        box(cab, a + 0.05, b - 0.05, q0 - 0.06, q0 - 0.03, 1.02, 1.05, srgb(0x2a2d2f))       # the insulated handrail along its front
        for p in (a + 0.10, b - 0.10):
            box(cab, p - 0.012, p + 0.012, q0 - 0.045, q0, 1.022, 1.048, srgb(0x2a2d2f))
    # ---- the cable way
    wall = WIDTH
    H1 = dict(p=(3.94, 6.30), q=(4.24, 4.48), h=(2.10, 2.16))                               # the ladder along the wall, under the duct
    V1 = dict(p=(3.96, 4.24), q=(4.44, wall), h=(0.0, 2.10))                                # the ladder up the wall
    (ha, hb), (hq0, hq1), (hh0, hh1) = H1['p'], H1['q'], H1['h']
    for q in (hq0, hq1 - 0.02):
        box(ladder, ha, hb, q, q + 0.02, hh0, hh1, GALV)
    k = 0
    while ha + 0.10 + k * 0.30 < hb:
        p = ha + 0.10 + k * 0.30
        box(ladder, p - 0.012, p + 0.012, hq0 + 0.02, hq1 - 0.02, hh0, hh0 + 0.02, GALV)
        k += 1
    for p in (4.55, 5.20, 5.85):                                                            # its brackets, on the wall's stiffeners
        box(sup, p - 0.02, p + 0.02, hq0 - 0.02, wall - 0.08, hh0 - 0.04, hh0, GREY)
        tube(sup, (p, wall - 0.08, hh0 - 0.22), (p, hq0 + 0.02, hh0 - 0.03), 0.012, GREY, 6)
    (va, vb), (vq0, vq1), (vh0, vh1) = V1['p'], V1['q'], V1['h']
    for p in (va, vb - 0.02):
        box(ladder, p, p + 0.02, vq0, vq1, vh0, vh1, GALV)
    k = 0
    while 0.25 + k * 0.30 < vh1:
        h = 0.25 + k * 0.30
        box(ladder, va + 0.02, vb - 0.02, vq0 + 0.02, vq0 + 0.04, h - 0.012, h + 0.012, GALV)
        k += 1
    # the covered duct on the deck, from beside the alternator to the foot of the ladder
    floor = S('floor duct', 'Zinc')
    box(floor, va + 0.02, vb - 0.02, 2.74, vq0, 0.0, 0.07, tint(GALV, 0.88))
    box(floor, vb - 0.02, 4.80, 2.74, 2.98, 0.0, 0.07, tint(GALV, 0.88))
    yellow = S('yellow', 'Machinery paint', smooth=True, angle=40)
    for q in (2.99, 3.60, 4.20):                                                            # its yellow bands, where one steps over it
        box(yellow, va + 0.015, vb - 0.015, q, q + 0.06, 0.07, 0.073, YELLOW)
    with component('EMG-05'):
        # three power cables: from the terminal box on the alternator's starboard side down into the floor duct (a free loop of half
        # a metre, for the set moves on its mounts); out of the duct up the ladder; along the ladder; down into the board
        r = 0.024
        for k in range(3):
            pc, qc = 4.02 + k * 0.055, 4.285 + k * 0.055
            run(cable, [(4.52 + k * 0.08, 2.80, 0.62), (4.52 + k * 0.08, 2.80, 0.07)], r, BLACK, 8)
            run(cable, [(pc, vq0 + 0.02 - r, 0.07), (pc, vq0 + 0.02 - r, hh0 + 0.02 + r), (pc, qc, hh0 + 0.02 + r), (5.55 + k * 0.07, qc, hh0 + 0.02 + r), (5.55 + k * 0.07, qc, top + 0.02)], r, BLACK, 8)
    with component('EMG-04'):
        # the control cable: from the panel's top up to the ladder, along it, down the ladder on the wall and into the floor duct
        r = 0.015
        (a, b), (q0, q1), top = PANEL['p'], PANEL['q'], PANEL['h']
        run(cable, [(4.72, 4.38, top), (4.72, 4.38, hh0 + 0.02 + r), (4.72, 4.44, hh0 + 0.02 + r), (4.195, 4.44, hh0 + 0.02 + r), (4.195, vq0 + 0.02 - r, hh0 + 0.02 + r), (4.195, vq0 + 0.02 - r, 0.07)], r, srgb(0x2a2a2a), 8)


def door(S):
    """The weathertight door at the after end of the starboard wall: it opens outward, hung on its after edge, for whoever comes to it."""
    steel, fit = S('door frame', 'Topside paint'), S('outside fittings', 'Machinery paint', smooth=True, angle=40)
    (a, b), sill, head = DOOR['p'], DOOR['sill'], DOOR['head']
    out = WIDTH + WALL
    with component('OUT-37'):
        box(steel, a - 0.05, a, out, out + 0.012, -PLACE['under'], head + 0.05, WHITE)      # the frame on the plating outside
        box(steel, b, b + 0.05, out, out + 0.012, -PLACE['under'], head + 0.05, WHITE)
        box(steel, a, b, out, out + 0.012, head, head + 0.05, WHITE)
        mover = 'door-eg-house'
        leaf = S('door', 'Topside paint', mover=mover)
        grip = S('door fittings', 'Shaft steel', mover=mover, smooth=True, angle=40)
        plate = S('door plates', 'Panel face', mover=mover)
        glass = S('door glass', 'Window glass', mover=mover)
        colour = srgb(0xe2e0d8)
        la, lb, q0, q1 = a - 0.03, b + 0.03, out + 0.012, out + 0.052
        lo, hi = sill - 0.03, head + 0.03
        cp, ch, r = (la + lb) / 2, 1.52, 0.11
        box(leaf, la, lb, q0, q1, lo, ch - r, colour)
        box(leaf, la, lb, q0, q1, ch + r, hi, colour)
        box(leaf, la, cp - r, q0, q1, ch - r, ch + r, colour)
        box(leaf, cp + r, lb, q0, q1, ch - r, ch + r, colour)
        box(glass, cp - r - 0.006, cp + r + 0.006, q0 + 0.014, q0 + 0.026, ch - r - 0.006, ch + r + 0.006, srgb(0x2d4a55))
        for q, n in ((q0, -1), (q1, 1)):                                                    # a ring each side of the glass
            ring = [R(cp + (r + 0.035) * cos(t), q + n * 0.004, ch + (r + 0.035) * sin(t)) for t in (2 * pi * k / 20 for k in range(20))]
            hole = [R(cp + (r - 0.012) * cos(t), q + n * 0.004, ch + (r - 0.012) * sin(t)) for t in (2 * pi * k / 20 for k in range(20))]
            start = len(grip.f)
            grip.polygon(ring, BRASS, [hole])
            grip.orient(start, tuple(way(0, n, 0)))
            edge = [R(cp + (r + 0.035) * cos(t), q, ch + (r + 0.035) * sin(t)) for t in (2 * pi * k / 20 for k in range(20))]
            start = len(grip.f)
            grip.grid([edge, ring], BRASS, close=True)
            mid = Vector(R(cp, q, ch))
            grip.orient(start, lambda c, mid=mid: tuple(Vector(c) - mid - way(0, 1, 0) * (Vector(c) - mid).dot(way(0, 1, 0))))
        hinge = lb + 0.03                                                                   # hung on its after edge
        for hh in (0.45, 1.65):
            box(leaf, lb - 0.10, lb + 0.02, q1, q1 + 0.012, hh - 0.03, hh + 0.03, tint(colour, 0.85))
            tube(grip, (hinge, q1 + 0.006, hh - 0.05), (hinge, q1 + 0.006, hh + 0.05), 0.012, STEEL, 8)
            for g in (hh + 0.05, hh - 0.075):
                box(steel, hinge - 0.018, hinge + 0.03, out, q1 + 0.02, g, g + 0.025, tint(WHITE, 0.85))
        for hh in (0.60, 1.80):                                                             # two dogs at the closing edge
            tube(grip, (la - 0.03, q1 + 0.03, hh), (la - 0.03, q0, hh), 0.014, STEEL, 8)
            box(grip, la - 0.045, la - 0.015, q1 + 0.018, q1 + 0.03, hh - 0.10, hh + 0.02, DARK)
        for q, n in ((q0, -1), (q1, 1)):                                                    # a lever handle each side
            tube(grip, (la + 0.10, q, 1.08), (la + 0.10, q + n * 0.05, 1.08), 0.012, STEEL, 8)
            tube(grip, (la + 0.10, q + n * 0.045, 1.08), (la + 0.22, q + n * 0.045, 1.08), 0.010, STEEL, 8)
        sign(plate, (cp, q0, 1.12), (0, -1, 0), 0.40, 0.17, 'eg_escape_plate')
        sign(plate, (cp, q1, 1.80), (0, 1, 0), 0.44, 0.11, 'np_eg')
        MOTIONS.append(dict(id=mover, name='Door to the emergency generator room, house top', kind='door', pivot=R(hinge, q1 + 0.006, 0.0),
                            at=R((a + b) / 2, WIDTH + 0.04, 0.0), normal=list(way(0, 1, 0))))
    # the light over it outside
    box(fit, (a + b) / 2 - 0.09, (a + b) / 2 + 0.09, out, out + 0.035, 2.20, 2.28, GREY)
    box(S('lamps', 'Lens'), (a + b) / 2 - 0.075, (a + b) / 2 + 0.075, out + 0.035, out + 0.075, 2.21, 2.27, LAMP)


def fittings(S):
    """What else the room carries: the guard rail, the lights, the trays on the port wall, the fire extinguisher, the call point, the
    telephone, the detector, the boards and signs."""
    yellow = S('yellow', 'Machinery paint', smooth=True, angle=40)
    face, lit = S('signs', 'Panel face'), S('lit signs', 'Screen picture')
    red = S('red fittings', 'Machinery paint', smooth=True, angle=40)
    dark, steel = S('dark fittings', 'Plastic'), S('pipes', 'Shaft steel', smooth=True, angle=40)
    # the guard rail round the alternator: three posts on the gratings, a top rail and a knee rail
    posts = ((4.25, 1.10), (5.33, 1.10), (5.33, 2.95))
    for p, q in posts:
        box(yellow, p - 0.04, p + 0.04, q - 0.04, q + 0.04, 0.04, 0.08, YELLOW)             # a socket on the grating
        tube(yellow, (p, q, 0.08), (p, q, 1.04), 0.022, YELLOW, 10)
    for a, b in zip(posts, posts[1:]):
        for h in (0.56, 1.04):
            tube(yellow, (a[0], a[1], h), (b[0], b[1], h), 0.022, YELLOW, 10)
    # four lights under the beams, lit; the one over the door's way on the emergency lighting
    lamps, frames = S('lights', 'Lit panel'), S('light frames', 'Topside paint')
    for k, (p, q, along) in enumerate(((2.00, 0.85, 'p'), (4.30, 0.85, 'p'), (5.90, 3.10, 'p'), (7.22, 2.20, 'q'))):
        with component(f'LGT-{25 + k}'):
            hp, hq = (0.60, 0.08) if along == 'p' else (0.08, 0.60)
            box(frames, p - hp, p + hp, q - hq, q + hq, HEIGHT - 0.23, HEIGHT - 0.15, WHITE)
            box(lamps, p - hp + 0.02, p + hp - 0.02, q - hq + 0.015, q + hq - 0.015, HEIGHT - 0.25, HEIGHT - 0.23, LAMP)
    # a cable tray along the port wall on brackets, two feeders in it, out through the forward wall
    tray, cable = S('cable trays', 'Zinc'), S('cables', 'Plastic', smooth=True, angle=40)
    box(tray, 0.0, 7.30, 0.20, 0.36, 2.60, 2.615, GALV)
    k = 1
    while k * 0.65 < 7.3:
        box(tray, k * 0.65 - 0.015, k * 0.65 + 0.015, 0.08, 0.36, 2.575, 2.60, GALV)
        k += 1
    box(S('dark fittings', 'Plastic'), 7.26, 7.50, 0.0, 0.14, 2.28, 2.50, srgb(0x5a6062))    # the junction box the two feeders end in, on the plating
    for q in (0.05, 0.09):
        run(cable, [(-0.04, q + 0.18, 2.637), (7.33 + (q - 0.05), q + 0.18, 2.637), (7.33 + (q - 0.05), q, 2.637), (7.33 + (q - 0.05), q, 2.50)], 0.022, BLACK, 8)
    # by the door: the extinguisher on the after wall under its sign, the call point, the telephone to the bridge
    with component('FIR-18'):
        ep, eq = LENGTH - 0.105, 3.55
        tube(red, (ep, eq, 0.28), (ep, eq, 0.82), 0.08, RED, 16)
        tube(red, (ep, eq, 0.82), (ep, eq, 0.90), 0.08, RED, 16, 0.035)
        tube(dark, (ep, eq, 0.90), (ep, eq, 0.97), 0.03, BLACK, 10)
        tube(dark, (ep, eq, 0.94), (ep - 0.02, eq - 0.11, 0.62), 0.012, BLACK, 6)
        box(steel, LENGTH - 0.03, LENGTH, eq - 0.09, eq + 0.09, 0.50, 0.54, STEEL)
        box(steel, LENGTH - 0.03, LENGTH, eq - 0.09, eq + 0.09, 0.26, 0.28, STEEL)
        sign(face, (LENGTH, eq, 1.22), (-1, 0, 0), 0.15, 0.15, 'ext_sign')
    with component('FIR-19'):
        box(red, LENGTH - 0.035, LENGTH, 4.06, 4.15, 1.36, 1.45, RED)
        sign(face, (LENGTH - 0.035, 4.105, 1.405), (-1, 0, 0), 0.08, 0.08, 'callpoint')
    with component('INT-14'):
        box(dark, LENGTH - 0.07, LENGTH, 2.80, 3.00, 1.32, 1.58, DARK)
        sign(face, (LENGTH - 0.07, 2.90, 1.45), (-1, 0, 0), 0.19, 0.25, 'phone')
    with component('FIR-20'):
        tube(S('plastics', 'Plastic', smooth=True, angle=40), (4.22, 1.25, HEIGHT - 0.035), (4.22, 1.25, HEIGHT), 0.05, srgb(0xf0eee8), 14)
    # the exit sign over the door, lit; the warning board on the forward wall's stiffeners
    sign(lit, (sum(DOOR['p']) / 2, WIDTH, 2.22), (0, -1, 0), 0.36, 0.16, 'eg_exit')
    box(dark, 0.08, 0.092, 1.70, 2.76, 1.28, 2.04, srgb(0xf2f0e8))
    sign(face, (0.092, 2.23, 1.66), (1, 0, 0), 1.02, 0.72, 'eg_warning')


def build():
    MOTIONS.clear()
    S = Shop()
    shell(S)
    gratings(S)
    generator_set(S)
    exhaust(S)
    duct(S, 'EMG-09', SUPPLY, 'eg_supply', 'eg_fd01', 'damper-fd01', 'FD-01', 'forward', hung=(0.20, 1.88))
    duct(S, 'EMG-10', EXTRACT, 'eg_extract', 'eg_fd02', 'damper-fd02', 'FD-02', 'starboard', hung=(4.47, 6.00))
    day_tank(S)
    batteries(S)
    boards(S)
    door(S)
    fittings(S)
    return list(S.parts.values())


def motion():
    """The door opens for whoever comes to it; each fire damper's lever is worked by a tap, a quarter turn from open to shut."""
    inputs, movers = [], []
    for m in MOTIONS:
        if m['kind'] == 'door':
            inputs.append(dict(id=m['id'], name=m['name'], min=0, max=95, step=1, unit='°', below='', above='open', rest='shut', auto='near',
                               at=list(m['at']), normal=m['normal'], reach=1.1))
            movers.append(dict(id=m['id'], kind='turn', input=m['id'], axis=[0, 1, 0], pivot=list(m['pivot']), ratio=-1.0))
        else:
            inputs.append(dict(id=m['id'], name=m['name'], min=0, max=90, step=1, unit='°', below='', above='shut', rest='open', auto='tap',
                               at=list(m['pivot']), reach=0.0))
            movers.append(dict(id=m['id'], kind='turn', input=m['id'], axis=[1, 0, 0], pivot=list(m['pivot']), ratio=1.0))
    return inputs, movers
