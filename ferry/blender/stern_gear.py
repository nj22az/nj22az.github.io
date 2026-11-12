"""
The stern ramp and everything that works it, built from stern_place.py: the leaf on its six hinges, the two cylinders
hung from their brackets under the upper deck, the eight end flaps, the ten cleats, the two safety latches and the seal that
make the raised ramp the stern door, the power pack in the hydraulic pump room with its valve stand and starter panel, the pipes from there to
the stern, the control stand beside the door, and the places marked in the machinery spaces where her main switchboard,
its transformers and her three generating sets are to stand.

The owner, 12 November 2026: "make the ramp more realistic its a simple system that could be animated much better, and
hydraulics and a local control panel that is wired up, with component list and proper wiring , as a place holder now, draw
all feed to the engine room, but all ends need to be marked so we know where to instal the Generators and electrical
cabinets".

Drawn first: JS3-304 (yard/drawings/stern_drawing.py), from the same numbers. Every component is drawn inside
`with component(tag)`, so the register (systems/stern.py) knows where it is.

How it is kept from flickering (JSY-STD-403): what stands on a wall, a deck or the transom meets it face to face; a lug
welded to the transom's outer face is let 3 mm into the plating; what moves is clear of what it passes (the bolts 10 mm
in their keepers, the hook's tooth 10 mm from its pin, the rod's eye 5 mm between its lug's cheeks, the leaf's foot
10 mm each side of a hinge lug); no pipe lies in another's plane (stern_place.routes).

What is carried how (JSY-STD-402): every pipe is clamped to the wall it follows, a clamp at each end of a straight length
and no more than a metre apart; the feeder lies on a ladder up the wall; the motors' cables lie in a tray on two posts
over the power pack and come down to each motor in a conduit; the cylinders and the cleats are fed by hoses.

Drawn in the ship's axes (lines.py): x to port, y up from the waterline, z forward from amidships.
"""
import os
import sys
from math import atan2, cos, degrees, hypot, pi, radians, sin
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'systems'))
import lines as L
import spec as S
import stern_place as P
from shipyard import Part, srgb, tint, component, lettering, RUNS

MAIN, Z0 = S.MAIN_DECK, -L.HALF
LEAF, RAM, HINGE, FLAP, BOLT, HOOK, DOOR, HPU = P.LEAF, P.RAM, P.HINGE, P.FLAP, P.BOLT, P.HOOK, P.DOOR, P.HPU
ROAD, SKIN, FOOT = LEAF['road'], LEAF['skin'], LEAF['foot']
TEAL = srgb(S.HULL)
GREEN, PRIMER = srgb(S.DECK_GREEN), srgb(S.PRIMER)
DARK, STEEL, YELLOW, LIGHT = srgb(S.DARK_GREY), srgb(S.STEEL), srgb(S.RAIL_YELLOW), srgb(S.LIGHT_GREY)
BLACK, WHITE, RED = srgb(0x1c2022), srgb(0xeeeae0), srgb(0xb8372b)
OIL = srgb(0xc9772f)             # hydraulic oil lines: orange, as her pipes are colour-coded
GALV = srgb(0xa9b0b2)            # galvanised conduit, ladder and tray
CABLE = srgb(0x23272a)
PANEL_GREY = srgb(0xb9c0bd)      # cabinets: light grey enamel
MACHINE = srgb(0x5d7f86)         # the power pack: the line's machinery green-grey
CHROME = srgb(0xd9dcdd)
ID, RAMP_PART = LEAF['id'], 'main'

_parts = {}


def part(name, look, group='main', **kw):
    if name not in _parts:
        p = Part(name, look, **kw)
        p.group = group
        _parts[name] = p
    return _parts[name]


def Q(x, inn, h):
    return (x, MAIN + h, Z0 + inn)


def box(p, x0, x1, i0, i1, h0, h1, colour, soft=True):
    lo = (min(x0, x1), MAIN + min(h0, h1), Z0 + min(i0, i1))
    hi = (max(x0, x1), MAIN + max(h0, h1), Z0 + max(i0, i1))
    (p.block if soft else p.box)(lo, hi, colour)


def tube(p, a, b, r, colour, sides=12, r2=None, caps=(True, True)):
    p.tube(Q(*a), Q(*b), r, r2, colour=colour, sides=sides, caps=caps)


def rod(p, pts, r, colour):
    p.rod([Q(*q) for q in pts], r, colour)


def prism(p, profile, x0, x1, colour):
    """A closed solid: an outline in (inn, h) carried across the ship from x0 to x1."""
    x0, x1 = min(x0, x1), max(x0, x1)
    area = sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(profile, profile[1:] + profile[:1]))
    pts = list(profile) if area > 0 else list(profile)[::-1]              # counter-clockwise, seen with inn to the right and h up
    for x, way in ((x0, -1), (x1, 1)):
        start = len(p.f)
        p.polygon([Q(x, i, h) for i, h in pts], colour)
        p.orient(start, (way, 0, 0))
    for a, b in zip(pts, pts[1:] + pts[:1]):
        start = len(p.f)
        p.face([p.vert(Q(x0, *a)), p.vert(Q(x1, *a)), p.vert(Q(x1, *b)), p.vert(Q(x0, *b))], colour)
        p.orient(start, (0.0, -(b[0] - a[0]), b[1] - a[1]))               # outward of a counter-clockwise outline


def arc(ci, ch, r, a0, a1, n=10):
    """Points of an arc in (inn, h): angles in degrees from the forward direction, counter-clockwise."""
    return [(ci + r * cos(radians(a0 + (a1 - a0) * k / n)), ch + r * sin(radians(a0 + (a1 - a0) * k / n))) for k in range(n + 1)]


def letter(p, text, height, origin, right, up, colour, centre=True):
    """A line of lettering as paint: `origin` the middle (or the start) of its foot, in the ship's axes."""
    pts, tris, width = lettering(text, height)
    off = width / 2 if centre else 0.0
    base = len(p.v)
    for u, v in pts:
        p.vert(tuple(origin[i] + right[i] * (u - off) + up[i] * v for i in range(3)))
    first = len(p.f)
    for a, b, c in tris:
        p.face((base + a, base + b, base + c), colour)
    p.orient(first, (right[1] * up[2] - right[2] * up[1], right[2] * up[0] - right[0] * up[2], right[0] * up[1] - right[1] * up[0]))


def hexagon(p, x, inn, h0, h1, across, colour, turn=0.0):
    """A hexagon on an upright axis (a nut, the flats of a nipple): `across` its flats."""
    R = across / (2 * cos(pi / 6))
    ring = [(x + R * cos(turn + k * pi / 3), inn + R * sin(turn + k * pi / 3)) for k in range(6)]
    lo = [p.vert(Q(a, b, h0)) for a, b in ring]
    hi = [p.vert(Q(a, b, h1)) for a, b in ring]
    for k in range(6):
        j = (k + 1) % 6
        start = len(p.f)
        p.face((lo[k], lo[j], hi[j], hi[k]), colour, smooth=False)
        p.orient(start, ((ring[k][0] + ring[j][0]) / 2 - x, 0.0, (ring[k][1] + ring[j][1]) / 2 - inn))
    for ids, way in ((lo, -1.0), (hi, 1.0)):
        start = len(p.f)
        p.face(tuple(ids), colour, smooth=False)
        p.orient(start, (0.0, way, 0.0))


def hexnut_i(p, x, i0, i1, h, across, colour=None):
    """A union nut on a pipe that runs fore and aft: a hexagon about that axis, from i0 to i1."""
    colour = STEEL if colour is None else colour
    R = across / (2 * cos(pi / 6))
    ring = [(x + R * cos(k * pi / 3), h + R * sin(k * pi / 3)) for k in range(6)]
    lo = [p.vert(Q(a, i0, b)) for a, b in ring]
    hi = [p.vert(Q(a, i1, b)) for a, b in ring]
    for k in range(6):
        j = (k + 1) % 6
        start = len(p.f)
        p.face((lo[k], lo[j], hi[j], hi[k]), colour, smooth=False)
        p.orient(start, ((ring[k][0] + ring[j][0]) / 2 - x, (ring[k][1] + ring[j][1]) / 2 - h, 0.0))
    for ids, way in ((lo, -1.0), (hi, 1.0)):
        start = len(p.f)
        p.face(tuple(ids), colour, smooth=False)
        p.orient(start, (0.0, 0.0, way))


def gauge_mount(key):
    """How a pressure gauge of the pump room stands on what it reads from (stern_place.ROOM_GAUGES; the owner, of the first
    one, on a bare bar: "Is this a floating gauge ?"). From the port in the block's top upward: a hexagon nipple screwed into
    it, the gauge cock (a brass body, its spindle and red tee handle toward whoever reads the gauge), a union nut, and the
    gauge's own square socket, which enters the underside of its case. All of it is fine work, as the gauge is."""
    steel = part('Stern ramp gauges, nipples and nuts', 'Shaft steel', smooth=True, angle=40, fine=True)
    brass = part('Stern ramp gauges, cocks and sockets', 'Bronze', smooth=True, angle=40, fine=True)
    handle = part('Stern ramp gauges, cock handles', 'Plastic', smooth=True, angle=40, fine=True)
    g = P.ROOM_GAUGES[key]
    (x, at, h), k = g['port'], g['look']
    bronze = srgb(0xb08a4a)
    hexagon(steel, x, at, h - 0.002, h + 0.010, 0.022, STEEL)                                           # the nipple, let 2 mm into the block
    tube(steel, (x, at, h + 0.010), (x, at, h + 0.018), 0.007, STEEL, 10)
    box(brass, x - 0.014, x + 0.014, at - 0.014, at + 0.014, h + 0.018, h + 0.052, bronze)              # the gauge cock
    tube(steel, (x + k * 0.014, at, h + 0.035), (x + k * 0.027, at, h + 0.035), 0.004, STEEL, 10)       # its spindle
    tube(handle, (x + k * 0.030, at - 0.020, h + 0.035), (x + k * 0.030, at + 0.020, h + 0.035), 0.005, RED, 12)   # and its tee handle
    tube(steel, (x, at, h + 0.052), (x, at, h + 0.060), 0.007, STEEL, 10)
    hexagon(steel, x, at, h + 0.060, h + 0.074, 0.024, STEEL, turn=pi / 6)                              # the union nut
    box(brass, x - 0.007, x + 0.007, at - 0.007, at + 0.007, h + 0.074, h + P.GAUGE_MOUNT['stack'] + 0.006, bronze, soft=False)   # the gauge's socket, into its case


def room_gauge(key, needle=None):
    """A pressure gauge of the pump room on its mount: its case (with the body a real gauge has behind its dial), its dial,
    its needle (a part of its own where it turns) and its glass."""
    g = P.room_gauge(key)
    G = Face((g['x'], g['h']), (g['x'], g['h'] + 1.0), g['at'], flip=g['look'] > 0)
    case = part('Stern ramp gauges, cases', 'Machinery paint', smooth=True, angle=40, fine=True)
    gauge_mount(key)
    dial(G, 0.0, 0.0, g['r'], g['tag'], case, part('Stern ramp gauges, dial faces', 'Plastic', smooth=True, angle=40, fine=True),
         part('Stern ramp gauges, lettering', 'Marking', fine=True), part('Stern ramp gauges, glasses', 'Dial glass', smooth=True, angle=50, fine=True),
         needle or case, title=g['title'], back=P.GAUGE_MOUNT['depth'])


def laid(p, pts, r, colour):
    """A pipe, a conduit or a cable along a line of points, written with the part file so that spans.py can follow it."""
    RUNS.append(dict(part=p.name, r=r, points=[[round(float(v), 4) for v in Q(*c)] for c in pts]))
    rod(p, pts, r, colour)


# =====================================================================================================================
# The leaf, its hinges, its flaps
# =====================================================================================================================
def leaf():
    h = LEAF['half']
    body = part('Stern ramp', 'Topside paint', mover=ID)
    road = part('Stern ramp, roadway', 'Deck paint', mover=ID)
    lugs = part('Stern ramp, lugs and keepers', 'Machinery paint', mover=ID)
    pins = part('Stern ramp, pins', 'Shaft steel', smooth=True, angle=40, mover=ID)
    paint = part('Stern ramp, driveway lines', 'Marking', mover=ID)
    strip = HINGE['strip']
    with component('RMP-01'):
        # ---- the box girder: from the foot strip to its end, its outer skin coming in over the last metres
        prism(body, [(ROAD, FOOT + strip), (ROAD, FOOT + LEAF['length']), (ROAD - LEAF['tip'], FOOT + LEAF['length']),
                     (SKIN, FOOT + LEAF['taper']), (SKIN, FOOT + strip)], -h, h, tint(TEAL, 1.0))
        # its foot, in seven lengths: between them the six slots the ship's hinge lugs stand in
        cuts = sorted(sgn * x for sgn in (-1, 1) for x in HINGE['at'])
        at = -h
        for c in cuts + [None]:
            end = h if c is None else c - HINGE['slot'] / 2
            body.block(Q(at, SKIN, FOOT), Q(end, ROAD, FOOT + strip), tint(TEAL, 0.96), 0.004)
            at = None if c is None else c + HINGE['slot'] / 2
        # a rubbing bar down each side of its outer skin and one across, where the taper begins: what meets a fender first
        for x in (-h + 0.25, h - 0.37):
            box(body, x, x + 0.12, SKIN - 0.05, SKIN + 0.01, 0.6, FOOT + LEAF['taper'] - 0.15, tint(TEAL, 0.9))
        box(body, -h + 0.25, h - 0.25, SKIN - 0.05, SKIN + 0.01, FOOT + LEAF['taper'] - 0.15, FOOT + LEAF['taper'] - 0.03, tint(TEAL, 0.9))
        # ---- the roadway: a plate, and non-slip bars across the driveway where nothing has to lie flat against the ship
        top = ROAD + 0.010
        box(road, -h + 0.05, h - 0.05, ROAD, top, FOOT + strip + 0.02, FOOT + LEAF['length'] - 0.04, tint(GREEN, 0.95), soft=False)
        pitch, wide, high = LEAF['bars']
        k = 1
        while pitch * k < LEAF['length'] - 0.25:
            s = pitch * k
            k += 1
            if LEAF['flat'][0] <= s <= LEAF['flat'][1]:
                continue
            box(road, -LEAF['drive'] - 0.05, LEAF['drive'] + 0.05, top, top + high, FOOT + s - wide / 2, FOOT + s + wide / 2, tint(GREEN, 0.8), soft=False)
        # the driveway's two yellow lines: between them is clear of the cylinders
        for sgn in (1, -1):
            x0, x1 = sorted((sgn * (LEAF['drive'] + 0.06), sgn * (LEAF['drive'] + 0.16)))
            for s0_, s1_ in ((0.3, LEAF['flat'][0] - 0.05), (LEAF['flat'][1] + 0.05, 10.9)):          # (not across the sealing face)
                start = len(paint.f)
                paint.grid([[Q(x0, top + 0.0008, FOOT + s0_), Q(x1, top + 0.0008, FOOT + s0_)], [Q(x0, top + 0.0008, FOOT + s1_), Q(x1, top + 0.0008, FOOT + s1_)]], YELLOW)
                paint.orient(start, (0, 0, 1))
        # ---- what stands in from the roadway through the door's opening when it is raised
        r0 = top - 0.002
        (pi_, ph) = RAM['pin']
        for sgn in (1, -1):
            # the cylinder's lug: two cheeks with the rod's eye between them, and the pin through all three
            for a, b in ((RAM['lug'][0], RAM['lug'][1]), (-RAM['lug'][1], -RAM['lug'][0])):
                prism(lugs, [(r0, ph - 0.26), (pi_ - 0.02, ph - 0.125), (pi_ + 0.115, ph - 0.065), (pi_ + 0.115, ph + 0.065), (pi_ - 0.02, ph + 0.125), (r0, ph + 0.26)],
                      sgn * RAM['x'] + a, sgn * RAM['x'] + b, DARK)
            tube(pins, (sgn * RAM['x'] - RAM['lug'][1] - 0.012, pi_, ph), (sgn * RAM['x'] + RAM['lug'][1] + 0.012, pi_, ph), 0.055, STEEL, 20)
            # the four keepers of the bolt cleats
            for hk in BOLT['h']:
                box(lugs, sgn * BOLT['keeper'][0], sgn * BOLT['keeper'][1], r0, BOLT['keeper_in'], hk - 0.09, hk + 0.09, DARK)
            # the safety latch's lug, with the striker pin the latch's tooth falls behind
            LT = P.LATCH
            box(lugs, sgn * LT['lug'][0], sgn * LT['lug'][1], r0, LT['lug_in'], LT['h'] - 0.08, LT['h'] + 0.08, DARK)
            tube(pins, (sgn * (LT['x'][0] - 0.02), LT['pin'][0], LT['pin'][1]), (sgn * (LT['lug'][0] + 0.012), LT['pin'][0], LT['pin'][1]), 0.018, STEEL, 14)
            # the hook cleat's lug: two cheeks and the pin the hook's tooth stands behind
            hx = sgn * HOOK['x']
            for a, b in ((HOOK['lug'][0], HOOK['lug'][1]), (-HOOK['lug'][1], -HOOK['lug'][0])):
                box(lugs, hx + a, hx + b, r0, 0.20, HOOK['pin'][1] - 0.10, HOOK['pin'][1] + 0.10, DARK)
            tube(pins, (hx - HOOK['lug'][1] - 0.008, HOOK['pin'][0], HOOK['pin'][1]), (hx + HOOK['lug'][1] + 0.008, HOOK['pin'][0], HOOK['pin'][1]), 0.025, STEEL, 16)
    # ---- the hinges: the ship's six lugs under the sill, each in its slot of the leaf's foot, and one pin through them all
    with component('RMP-02'):
        ship_lugs = part('Stern ramp, hinge lugs', 'Machinery paint')
        pin = part('Stern ramp, hinge pin', 'Shaft steel', smooth=True, angle=40)
        hi, hh, r = HINGE['inn'], HINGE['h'], HINGE['boss']
        meet = degrees(atan2((r * r - hi * hi) ** 0.5, -hi))            # where the lug's round meets the transom's plane
        outline = [(0.003, hh - 0.21), (0.003, hh + r * sin(radians(meet)))] + arc(hi, hh, r, meet, 232, 14)
        for x in sorted(sgn * hx for sgn in (-1, 1) for hx in HINGE['at']):
            prism(ship_lugs, outline, x - HINGE['lug'] / 2, x + HINGE['lug'] / 2, DARK)
        tube(pin, (-HINGE['at'][-1] - 0.22, hi, hh), (HINGE['at'][-1] + 0.22, hi, hh), HINGE['pin'], STEEL, 24)
    # ---- the end flaps, stowed: folded back over the roadway; one hinge rod across the leaf's end carries all eight
    with component('RMP-05'):
        flaps = part('Stern ramp, end flaps', 'Deck paint', mover=f'{ID}-flaps')
        eyes = part('Stern ramp, end flap hinges', 'Machinery paint', smooth=True, angle=40, mover=f'{ID}-flaps')
        s0, t0 = FLAP['axis']
        ai, ah = ROAD + t0, FOOT + s0
        tube(pins, (-h + 0.06, ai, ah), (h - 0.06, ai, ah), 0.014, STEEL, 14)
        for x0, x1 in P.flap_xs():
            # (its driving face looks at the roadway while it is stowed, twice the hinge's height over it)
            prism(flaps, [(ROAD + 2 * t0, ah), (ROAD + 2 * t0, ah - FLAP['length']), (ROAD + 2 * t0 + FLAP['tip'], ah - FLAP['length']), (ROAD + 2 * t0 + FLAP['root'], ah)],
                  x0, x1, tint(GREEN, 0.86))
            for a, b in ((x0 + 0.06, x0 + 0.20), (x1 - 0.20, x1 - 0.06)):
                tube(eyes, (a, ai, ah), (b, ai, ah), 0.037, DARK, 16)                # the flap's own eyes round the rod
            for xm in (x0 - 0.018, x1 + 0.018):                                       # and the leaf's, between the flaps
                box(lugs, xm - 0.010, xm + 0.010, ROAD - 0.006, ai + 0.03, ah - 0.07, ah + 0.03, DARK)


# =====================================================================================================================
# The two cylinders and their brackets
# =====================================================================================================================
def rams():
    (ti, th), (pi_, ph) = RAM['trunnion'], RAM['pin']
    n = hypot(pi_ - ti, ph - th)
    ui, uh = (pi_ - ti) / n, (ph - th) / n
    ni, nh = uh, -ui                                           # square to it, on its upper side (aft and up)
    at = lambda x, d, off=0.0: (x, ti + ui * d + ni * off, th + uh * d + nh * off)
    bracket = part('Stern ramp, cylinder brackets', 'Machinery paint')
    bright = part('Stern ramp, trunnion pins', 'Shaft steel', smooth=True, angle=40)
    B = P.BRACKET
    for sgn, tag, label, comp in ((1, 'p', 'port', 'RMP-03'), (-1, 's', 'starboard', 'RMP-04')):
        x = sgn * RAM['x']
        with component(comp):
            # ---- the bracket: two cheeks down from the web beam's edge, a plate across their top under it, a doubler each side of
            # the beam; the outboard cheek stands against the mooring station's wall
            outline = [(B['long'][0], P.WEB_H - 0.03), (B['long'][1], P.WEB_H - 0.03), (B['long'][1], B['foot'] + 0.14), (ti + 0.10, B['foot']), (ti - 0.10, B['foot']), (B['long'][0], B['foot'] + 0.14)]
            inner = sorted((x - sgn * B['cheek'][1], x - sgn * B['cheek'][0]))
            outer = sorted((x + sgn * B['cheek'][0], sgn * (P.WALL - P.T)))
            for a, b in (inner, outer):
                prism(bracket, outline, a, b, YELLOW)
            box(bracket, inner[0] if sgn > 0 else outer[0], outer[1] if sgn > 0 else inner[1], B['long'][0], B['long'][1], P.WEB_H - 0.03, P.WEB_H, YELLOW)
            for i0, i1 in ((3.6 - 0.040, 3.6 - 0.012), (3.6 + 0.012, 3.6 + 0.040)):
                box(bracket, min(inner[0], outer[0]), max(inner[1], outer[1]), i0, i1, P.WEB_H, P.WEB_H + 0.45, YELLOW)
            tube(bright, (x - sgn * (B['cheek'][1] + 0.02), ti, th), (sgn * (P.WALL - P.T), ti, th), B['pin'], STEEL, 20)
            # ---- the cylinder: its head's eye on the trunnion pin, the barrel, the gland; the rod and its eye in the leaf's lug
            barrel = part(f'Stern ramp cylinder, {label}', 'Machinery paint', smooth=True, angle=40, mover=f'{ID}-ram-{tag}')
            fit = part(f'Stern ramp cylinder fittings, {label}', 'Machinery paint', smooth=True, angle=40, mover=f'{ID}-ram-{tag}')
            hose = part(f'Stern ramp cylinder hoses, {label}', 'Rubber', smooth=True, angle=50, mover=f'{ID}-ram-{tag}')
            rod_ = part(f'Stern ramp cylinder rod, {label}', 'Shaft steel', smooth=True, angle=40, mover=f"{ID}-ram-{tag}-rod")
            r = RAM['od'] / 2
            tube(barrel, (x - 0.11, ti, th), (x + 0.11, ti, th), 0.135, LIGHT, 24)                              # the head's eye
            barrel.tube(Q(*at(x, 0.08)), Q(*at(x, RAM['cap'] + 0.02)), 0.13, r, colour=LIGHT, sides=24)         # the head
            barrel.tube(Q(*at(x, RAM['cap'])), Q(*at(x, RAM['barrel'])), r, colour=LIGHT, sides=28)
            for d0, d1, rr in ((RAM['cap'], RAM['cap'] + 0.06, r + 0.022), (RAM['gland'][0], RAM['gland'][1], r + 0.022)):     # the head's flange, the gland
                barrel.tube(Q(*at(x, d0)), Q(*at(x, d1)), rr, colour=DARK, sides=28)
            # on its upper side: the load-holding valve at the rod's end (the oil that carries the ramp is there), a steel pipe from it
            # back along the barrel to the head, and a port at the head for the piston's side: so both hoses are short and near the trunnion
            fit.tube(Q(*at(x, 3.50, r + 0.05)), Q(*at(x, 3.86, r + 0.05)), 0.055, colour=DARK, sides=16)
            fit.tube(Q(*at(x, 3.74, r - 0.01)), Q(*at(x, 3.74, r + 0.05)), 0.03, colour=DARK, sides=12)
            fit.tube(Q(*at(x, 0.62, r + 0.05)), Q(*at(x, 3.52, r + 0.05)), 0.015, colour=OIL, sides=12)
            for d in (1.2, 2.2, 3.1):                                                                           # its three clips on the barrel
                fit.tube(Q(*at(x, d, r - 0.01)), Q(*at(x, d, r + 0.07)), 0.022, colour=DARK, sides=10)
            for d in (0.62, 0.40):                                                                              # the two ports at the head
                fit.tube(Q(*at(x, d, r - 0.01)), Q(*at(x, d, r + 0.075)), 0.028, colour=DARK, sides=12)
            xf = sgn * P.RAM_FEED['x']
            for name, d, bend in (('A', 0.62, 0.0), ('B', 0.40, 0.06)):
                fi = P.RAM_FEED['inn'][name]
                port = at(x + sgn * bend * 0.0, d, r + 0.075)
                hose.rod([Q(xf - sgn * 0.02, fi, P.RAM_FEED['h']), Q(xf - sgn * 0.07, fi + 0.07, P.RAM_FEED['h'] - 0.16), Q(x + sgn * 0.11, fi - 0.10 - bend, 4.96 - bend),
                          Q(x + sgn * 0.03, port[1] + 0.10, port[2] - 0.22 - bend), Q(*port)], 0.019, BLACK)
            rr = RAM['rod'] / 2
            rod_.tube(Q(*at(x, RAM['rod_from'])), Q(*at(x, n - RAM['eye'] + 0.02)), rr, colour=CHROME, sides=24)
            tube(rod_, (x - 0.030, pi_, ph), (x + 0.030, pi_, ph), RAM['eye'], DARK, 24)                        # the rod's eye, between the lug's cheeks


# =====================================================================================================================
# The cleats, the seal, the door switches
# =====================================================================================================================
def cleats():
    fixed = part('Stern ramp cleats', 'Machinery paint', smooth=True, angle=40)
    grey = srgb(S.DOOR_GREY)
    hoses = part('Stern ramp hydraulics, hoses', 'Rubber', smooth=True, angle=50)
    x2 = P.WALL + P.T + P.BANK_OFF + P.LAYER
    n = 11
    for sgn, tag in ((1, 'p'), (-1, 's')):
        bolts = part(f"Stern ramp cleat bolts, {'port' if sgn > 0 else 'starboard'}", 'Shaft steel', smooth=True, angle=40, mover=f'{ID}-bolts-{tag}')
        for hk in BOLT['h']:
            with component(f'RMP-{n}'):
                # a foot on the transom, the bolt's housing against the door post, its cylinder, and a bush round the bolt on the deck's side of the post
                box(fixed, sgn * BOLT['base'][0], sgn * BOLT['base'][1], S.SHELL, 0.03, hk - 0.10, hk + 0.10, DARK)
                box(fixed, sgn * BOLT['house'][0], sgn * BOLT['house'][1], 0.03, 0.19, hk - 0.08, hk + 0.08, YELLOW)
                tube(fixed, (sgn * BOLT['cyl'][0], BOLT['inn'], hk), (sgn * BOLT['cyl'][1], BOLT['inn'], hk), BOLT['cyl_d'] / 2, grey, 18)
                tube(fixed, (sgn * BOLT['cyl'][1], BOLT['inn'], hk), (sgn * (BOLT['cyl'][1] + 0.03), BOLT['inn'], hk), BOLT['cyl_d'] / 2 + 0.012, DARK, 18)
                tube(fixed, (sgn * (P.WALL - P.T - 0.04), BOLT['inn'], hk), (sgn * (P.WALL - P.T), BOLT['inn'], hk), BOLT['d'] / 2 + 0.03, DARK, 18)
                # its switch, on the housing: home when the bolt is through the keeper
                box(fixed, sgn * 4.56, sgn * 4.64, 0.07, 0.15, hk + 0.08, hk + 0.13, grey)
                tube(fixed, (sgn * 4.64, 0.11, hk + 0.105), (sgn * 4.67, 0.11, hk + 0.105), 0.010, BLACK, 10)
                tube(bolts, (sgn * BOLT['tip'], BOLT['inn'], hk), (sgn * (BOLT['tip'] + BOLT['length']), BOLT['inn'], hk), BOLT['d'] / 2, CHROME, 20)
                # two hoses from the cleats' headers on the station's wall
                for name, dh, xe in (('C', 0.045, 4.80), ('D', -0.045, 4.98)):
                    hoses.rod([Q(sgn * x2, P.UP[name], hk + dh), Q(sgn * 4.71, P.UP[name] - 0.05, hk + dh * 1.4), Q(sgn * xe, BOLT['inn'] + BOLT['cyl_d'] / 2 + 0.004, hk + dh * 0.5)], 0.008, BLACK)
            n += 1
    # ---- the two hook cleats at the door's head
    arms = part('Stern ramp hook cleats', 'Machinery paint', mover=f'{ID}-hooks')
    rams_ = part('Stern ramp hook cleat cylinders', 'Machinery paint', smooth=True, angle=40, mover=f'{ID}-hook-rams')
    rods = part('Stern ramp hook cleat rods', 'Shaft steel', smooth=True, angle=40, mover=f'{ID}-hook-rods')
    bright = part('Stern ramp, trunnion pins', 'Shaft steel', smooth=True, angle=40)
    (vi, vh), (ai, ah), (qi, qh) = HOOK['pivot'], HOOK['ram_anchor'], HOOK['ram_pin']
    m = hypot(qi - ai, qh - ah)
    wi, wh = (qi - ai) / m, (qh - ah) / m
    it = S.SHELL + P.BANK_OFF
    for sgn in (1, -1):
        x = sgn * HOOK['x']
        with component(f'RMP-{n}'):
            # the hanger: two cheeks against the transom over the door's head, coming down inside it to the pivot
            for a, b in ((HOOK['cheek'][0], HOOK['cheek'][1]), (-HOOK['cheek'][1], -HOOK['cheek'][0])):
                prism(fixed, [(S.SHELL, 5.22), (S.SHELL, HOOK['hanger']), (0.62, HOOK['hanger']), (0.62, 4.88), (0.40, 4.88), (0.40, 5.22)], x + a, x + b, YELLOW)
            tube(bright, (x - HOOK['cheek'][1] - 0.006, vi, vh), (x + HOOK['cheek'][1] + 0.006, vi, vh), 0.028, STEEL, 16)
            tube(bright, (x - HOOK['cheek'][1] - 0.006, ai, ah), (x + HOOK['cheek'][1] + 0.006, ai, ah), 0.014, STEEL, 12)
            # the arm: its boss on the pivot, under the leaf's pin, and the tooth that stands up abaft it
            prism(arms, [(vi + 0.06, vh - 0.065), (vi + 0.06, vh + 0.065), (vi - 0.06, vh + 0.065), (vi - 0.10, vh + 0.025), (0.095, vh + 0.025), (0.095, 5.07), (0.045, 5.07),
                         (0.045, vh - 0.05), (vi - 0.10, vh - 0.065)], x - HOOK['arm'], x + HOOK['arm'], RED)
            tube(arms, (x - HOOK['arm'] - 0.01, qi, qh), (x + HOOK['arm'] + 0.01, qi, qh), 0.016, DARK, 12)                 # the pin its cylinder pushes on
            # its cylinder, between the cheeks
            rams_.tube(Q(x, ai + wi * 0.02, ah + wh * 0.02), Q(x, ai + wi * 0.33, ah + wh * 0.33), 0.032, colour=grey, sides=16)
            tube(rams_, (x - 0.02, ai, ah), (x + 0.02, ai, ah), 0.03, grey, 14)
            rods.tube(Q(x, ai + wi * 0.10, ah + wh * 0.10), Q(x, qi, qh), 0.0125, colour=CHROME, sides=14)
            tube(rods, (x - 0.014, qi, qh), (x + 0.014, qi, qh), 0.024, DARK, 12)
            # its switch on the hanger, and two hoses down from the cleats' lines over the door's head
            box(fixed, x + sgn * (HOOK['cheek'][1]), x + sgn * (HOOK['cheek'][1] + 0.05), 0.44, 0.54, 5.02, 5.10, grey)
            for name, dx in (('C', 0.038), ('D', -0.038)):
                hoses.rod([Q(x + dx, it, P.CROSS[name]), Q(x + dx, 0.22, P.CROSS[name] - 0.02), Q(x + dx, ai - 0.06, ah + 0.07), Q(x + dx * 0.6, ai + wi * 0.06, ah + wh * 0.06 + 0.03)], 0.007, BLACK)
        n += 1
    # ---- the two safety latches, one on each door post: held by their own weight, lifted to let the ramp go
    LT = P.LATCH
    arm = part('Stern ramp safety latches', 'Machinery paint', mover=f'{ID}-latches')
    grip = part('Stern ramp safety latch handles', 'Rubber', smooth=True, angle=40, mover=f'{ID}-latches')
    lram = part('Stern ramp safety latch cylinders', 'Machinery paint', smooth=True, angle=40, mover=f'{ID}-latch-rams')
    lrod = part('Stern ramp safety latch rods', 'Shaft steel', smooth=True, angle=40, mover=f'{ID}-latch-rods')
    (li, lh), (ai, ah), (qi, qh) = LT['pivot'], LT['ram_anchor'], LT['ram_pin']
    m = hypot(qi - ai, qh - ah)
    wi, wh = (qi - ai) / m, (qh - ah) / m
    bx, b0, b1, bh0, bh1 = LT['bracket']
    for sgn, comp in ((1, 'RMP-34'), (-1, 'RMP-35')):
        xa, xb = sgn * LT['x'][0], sgn * LT['x'][1]
        xc = sgn * (LT['x'][0] - 0.025)                                    # the lifting cylinder, inboard of the arm
        with component(comp):
            box(fixed, sgn * bx, sgn * (P.WALL - P.T), b0, b1, bh0, bh1, YELLOW)                                           # the bracket, on the door post
            tube(bright, (sgn * (LT['x'][0] - 0.012), li, lh), (sgn * (bx + 0.03), li, lh), 0.02, STEEL, 14)               # the pivot pin
            tube(bright, (sgn * (LT['x'][0] - 0.05), ai, ah), (sgn * (bx + 0.02), ai, ah), 0.011, STEEL, 10)               # the cylinder's foot pin
            tube(fixed, (sgn * (LT['x'][0] - 0.012), li + 0.06, lh + 0.045), (sgn * (bx + 0.02), li + 0.06, lh + 0.045), 0.012, DARK, 10)   # the stop its handle end lies under when it is home
            box(fixed, sgn * (bx + 0.03), sgn * (bx + 0.10), b0 + 0.04, b0 + 0.12, bh1, bh1 + 0.05, grey)                  # its switch
            tube(bright, (sgn * (bx + 0.01), b1 - 0.03, bh1 - 0.05), (sgn * (bx - 0.07), b1 - 0.03, bh1 - 0.05), 0.007, STEEL, 8)   # the pin for the sea passage, in its clip
            # the arm: handle forward, pivot, and the tooth at its after end with its sloped foot
            prism(arm, [(LT['handle'], lh - 0.015), (LT['handle'], lh + 0.015), (li + 0.05, lh + 0.03), (0.12, lh + 0.03), (0.12, LT['pin'][1] - 0.01), (0.172, LT['pin'][1] - 0.05),
                        (0.172, lh - 0.03), (li + 0.05, lh - 0.03)], xa, xb, RED)
            tube(arm, (sgn * (LT['x'][0] - 0.05), qi, qh), (xa, qi, qh), 0.011, DARK, 10)                                  # the pin its cylinder lifts it by
            tube(grip, ((xa + xb) / 2, LT['handle'] - 0.07, lh), ((xa + xb) / 2, LT['handle'] + 0.005, lh), 0.03, BLACK, 16)
            # its lifting cylinder, single-acting: oil lifts the latch, its own weight brings it back
            lram.tube(Q(xc, ai + wi * 0.015, ah + wh * 0.015), Q(xc, ai + wi * 0.17, ah + wh * 0.17), 0.022, colour=grey, sides=14)
            tube(lram, (xc - 0.014, ai, ah), (xc + 0.014, ai, ah), 0.02, grey, 12)
            lrod.tube(Q(xc, ai + wi * 0.06, ah + wh * 0.06), Q(xc, qi, qh), 0.009, colour=CHROME, sides=12)
            tube(lrod, (xc - 0.012, qi, qh), (xc + 0.012, qi, qh), 0.018, DARK, 12)
            # its one hose: from the cleats' let-go line in the mooring station, through the door post under the bracket
            tube(fixed, (sgn * (P.WALL - P.T - 0.035), ai, bh0 - 0.06), (sgn * (P.WALL - P.T), ai, bh0 - 0.06), 0.012, DARK, 10)
            tube(fixed, (sgn * (P.WALL + P.T), ai, bh0 - 0.06), (sgn * (P.WALL + P.T + 0.035), ai, bh0 - 0.06), 0.012, DARK, 10)
            hoses.rod([Q(sgn * x2, P.UP['D'], bh0 - 0.06), Q(sgn * (P.WALL + P.T + 0.10), P.UP['D'] + 0.06, bh0 - 0.08), Q(sgn * (P.WALL + P.T + 0.03), ai, bh0 - 0.06)], 0.007, BLACK)
            hoses.rod([Q(sgn * (P.WALL - P.T - 0.03), ai, bh0 - 0.06), Q(xc + sgn * 0.03, ai + 0.03, bh0 - 0.03), Q(xc, ai + wi * 0.03, ah + wh * 0.03)], 0.007, BLACK)
    # ---- the seal: rubber on the transom round the opening's sides and head (let 2 mm into the plating)
    with component('RMP-06'):
        seal = part('Stern door seal', 'Rubber')
        o, w = P.SEAL['out'], P.SEAL['wide']
        for sgn in (1, -1):
            box(seal, sgn * (DOOR['half'] + o), sgn * (DOOR['half'] + o + w), -P.SEAL['proud'], 0.002, 0.02, DOOR['height'] + o, BLACK, soft=False)
        box(seal, -(DOOR['half'] + o + w), DOOR['half'] + o + w, -P.SEAL['proud'], 0.002, DOOR['height'] + o, DOOR['height'] + o + w, BLACK, soft=False)
        # and under the sill: a strip that closes the gap between the deck's edge and the leaf's foot. It lies under the hinge line and
        # forward of it, where the turning leaf never comes (what of the leaf is abaft its hinge goes down abaft it)
        box(seal, -(DOOR['half'] + o + w), DOOR['half'] + o + w, HINGE['inn'] + 0.005, 0.002, HINGE['h'] - 0.19, HINGE['h'] - 0.020, BLACK, soft=False)
    # ---- a switch on each door post, closed by the leaf when it is home against the seal
    for sgn, comp in ((1, 'RMP-32'), (-1, 'RMP-33')):
        with component(comp):
            box(fixed, sgn * (P.WALL - P.T - 0.06), sgn * (P.WALL - P.T), 0.03, 0.11, 2.80, 2.90, grey)
            tube(fixed, (sgn * (P.WALL - P.T - 0.03), 0.032, 2.85), (sgn * (P.WALL - P.T - 0.03), -0.012, 2.85), 0.009, DARK, 10)


# =====================================================================================================================
# The hydraulic pump room: the power pack, the valve stand, the starter panel
# =====================================================================================================================
LID = HPU['tank'][5] + 0.015


def power_pack():
    pack = part('Stern ramp power pack', 'Machinery paint', smooth=True, angle=40)
    dark = part('Stern ramp power pack, dark fittings', 'Machinery paint', smooth=True, angle=40)
    bright = part('Stern ramp power pack, bright fittings', 'Shaft steel', smooth=True, angle=40)
    glass = part('Stern ramp power pack, glasses', 'Lens', smooth=True, angle=50)
    paint = part('Stern ramp power pack, lettering', 'Marking', fine=True)
    x0, x1, a, b, h0, h1 = HPU['tank']
    with component('HYD-01'):
        tx0, tx1, ta, tb, rim = HPU['tray']
        box(pack, tx0, tx1, ta, tb, 0.0, 0.012, DARK, soft=False)                                   # the drip tray: its floor and its rim
        for q in ((tx0, tx0 + 0.006, ta, tb), (tx1 - 0.006, tx1, ta, tb), (tx0, tx1, ta, ta + 0.006), (tx0, tx1, tb - 0.006, tb)):
            box(pack, q[0], q[1], q[2], q[3], 0.012, rim, DARK, soft=False)
        for lx in (x0 + 0.05, x1 - 0.13):
            for ly in (a + 0.05, b - 0.13):
                box(pack, lx, lx + 0.08, ly, ly + 0.08, 0.012, h0, DARK)
        pack.block(Q(x0, a, h0), Q(x1, b, h1), MACHINE, 0.012)
        pack.block(Q(x0 - 0.015, a - 0.015, h1), Q(x1 + 0.015, b + 0.015, LID), tint(MACHINE, 0.9), 0.004)       # its lid, bolted down
        for k in range(8):
            for xx in (x0 + 0.0, x1 + 0.0):
                tube(bright, (xx, a + 0.08 + k * (b - a - 0.16) / 7, LID), (xx, a + 0.08 + k * (b - a - 0.16) / 7, LID + 0.008), 0.009, STEEL, 8)
        # the level glass on its inboard side, the breather and filler, the drain cock
        # (The owner, 12 November 2026: "Also specify the oil and the level of oil etc , it needs to be fully functional". The glass
        # stands between a cock at its foot and one at its head on a back plate; the oil in it is a part of its own, drawn in from
        # its foot as the ramp is lowered, because the cylinders' rods take their own volume out of the tank (stern_place.oil_level);
        # beside it an engraved scale with the four marks of the instruction JS3-304-M1; and a dial thermometer.)
        G_, T_ = P.GLASS, P.THERMO
        gx, ga = x0 - 0.035, G_['at']
        box(dark, x0 - 0.03, x0, ga - 0.05, ga + 0.05, G_['foot'] - 0.07, G_['head'] + 0.07, DARK)
        for hh in (G_['foot'] - 0.022, G_['head'] + 0.022):
            box(dark, x0 - 0.056, x0 - 0.03, ga - 0.022, ga + 0.022, hh - 0.022, hh + 0.022, srgb(0xb08a4a))
        oil = part('Stern ramp power pack, oil in the level glass', 'Lens', smooth=True, angle=50, mover=f'{ID}-oil-level', fine=True)
        tube(oil, (gx, ga, G_['foot'] + 0.001), (gx, ga, P.glass_height(0.0)), 0.0085, srgb(0xc98a2b), 12)
        sight = part('Stern ramp power pack, level glass', 'Dial glass', smooth=True, angle=50, fine=True)
        tube(sight, (gx, ga, G_['foot']), (gx, ga, G_['head']), G_['r'], srgb(0xdfe8ea), 14)
        plate = part('Stern ramp power pack, engraved plates', 'Plastic', fine=True)
        TS = Face((x0, 0.0), (x0, 1.0), ga)                         # the tank's inboard side, looked at from the way: u forward of the glass, v over the deck
        bottom = HPU['tank'][4] + 0.01
        marks = [('FILL', bottom + P.TANK['fill'], BLACK), ('RAMP DOWN', P.glass_height(P.LEVEL), BLACK), ('LOW', bottom + P.TANK['low'], RED), ('STOP', bottom + P.TANK['stop'], RED)]
        slab(plate, TS, -0.215, -0.058, marks[-1][1] - 0.055, marks[0][1] + 0.045, 0.0, 0.002, WHITE)
        for word, hv, colour in marks:
            patch(paint, TS, [(-0.090, hv - 0.0013), (-0.058, hv - 0.0013), (-0.058, hv + 0.0013), (-0.090, hv + 0.0013)], 0.0026, colour)
            fits(word, 0.010, 0.105, 'the level glass\'s scale')
            words(paint, TS, word, 0.010, -0.152, hv + 0.003, 0.0026, colour)
            words(paint, TS, f'{round(P.tank_litres(hv - bottom) / 10) * 10:,} L', 0.0065, -0.152, hv - 0.011, 0.0026, BLACK)
        cases = part('Stern ramp power pack, instrument cases', 'Machinery paint', smooth=True, angle=40, fine=True)
        tu = T_['at'] - ga
        dial(TS, tu, T_['h'], T_['r'], 'TI1', cases, part('Stern ramp gauges, dial faces', 'Plastic', smooth=True, angle=40, fine=True), paint,
             part('Stern ramp gauges, glasses', 'Dial glass', smooth=True, angle=50, fine=True),
             part('Stern ramp power pack, thermometer needle', 'Plastic', mover=f'{ID}-thermo', fine=True),
             scale=dict(full=T_['full'], red=float(P.FLUID['hot']), sweep=T_['sweep'], major=20, unit='C'))
        legend(plate, paint, TS, ('OIL TEMP',), tu, T_['h'] - T_['r'] - 0.024, 0.0068)
        tube(dark, (HPU['breather'][0], HPU['breather'][1], LID), (HPU['breather'][0], HPU['breather'][1], LID + 0.10), 0.04, DARK, 16)
        tube(dark, (HPU['breather'][0], HPU['breather'][1], LID + 0.10), (HPU['breather'][0], HPU['breather'][1], LID + 0.15), 0.055, YELLOW, 16)
        tube(bright, (x0, a + 0.12, h0 + 0.06), (x0 - 0.07, a + 0.12, h0 + 0.06), 0.014, STEEL, 10)
        tube(dark, (x0 - 0.05, a + 0.12, h0 + 0.06), (x0 - 0.05, a + 0.12, h0 + 0.12), 0.006, RED, 8)
        # the level and temperature switches, on the lid
        box(dark, x1 - 0.20, x1 - 0.10, 11.52, 11.62, LID, LID + 0.09, srgb(S.DOOR_GREY))
        letter(paint, 'HPU-R', 0.09, Q(x0 - 0.0008, (a + b) / 2 + 0.25, 0.60), (0, 0, 1), (0, 1, 0), WHITE)
        letter(paint, 'STERN RAMP', 0.045, Q(x0 - 0.0008, (a + b) / 2 + 0.25, 0.50), (0, 0, 1), (0, 1, 0), WHITE)
        letter(paint, '1500 L', 0.035, Q(x0 - 0.0008, (a + b) / 2 + 0.25, 0.42), (0, 0, 1), (0, 1, 0), WHITE)
    mr, mh = HPU['motor']
    br, bh = HPU['bell']
    for comp, (px, py), no in (('HYD-02', HPU['pumps'][0], 1), ('HYD-03', HPU['pumps'][1], 2)):
        with component(comp):
            tube(pack, (px, py, LID), (px, py, LID + bh), br, tint(MACHINE, 0.85), 28)
            tube(pack, (px, py, LID + bh), (px, py, LID + bh + mh), mr, LIGHT, 32)
            for k in range(5):                                                                       # the motor's ribs
                tube(pack, (px, py, LID + bh + 0.10 + k * 0.10), (px, py, LID + bh + 0.13 + k * 0.10), mr + 0.012, tint(LIGHT, 0.9), 32)
            tube(dark, (px, py, LID + bh + mh), (px, py, LID + bh + mh + 0.09), mr + 0.005, DARK, 32)   # the fan's cowl
            box(dark, px - mr - 0.11, px - mr + 0.03, py - 0.09, py + 0.09, LID + bh + 0.315, LID + bh + 0.48, DARK)   # its terminal box, inboard
            # Its delivery pipe to the pressure block: inboard off the pump, along the lid, and into the block's outboard face, with
            # its non-return valve on the way. (It ran straight inboard and ended in the air beside the block, 0.15 m short of it
            # each end: the block is 0.44 m long and the pumps stand 0.75 m apart. Found on 12 November 2026 when the owner asked
            # of the gauge "Is this a floating gauge ?" and everything round it was looked at. It lies 40 mm over the cleat
            # pump's pipe where they cross.)
            bx1, ba_, bb_ = HPU['block'][1], HPU['block'][2], HPU['block'][3]
            into = ba_ + 0.10 if py < (ba_ + bb_) / 2 else bb_ - 0.10
            hp = LID + 0.09
            rod(bright, [(px - br + 0.02, py, hp), (bx1 + 0.05, py, hp), (bx1 + 0.05, into, hp), (bx1 - 0.01, into, hp)], 0.015, STEEL)
            mid = (py + into) / 2
            tube(dark, (bx1 + 0.05, mid - 0.035, hp), (bx1 + 0.05, mid + 0.035, hp), 0.026, DARK, 16)                   # the non-return valve
            hexnut_i(bright, bx1 + 0.05, mid - 0.047, mid - 0.035, hp, 0.040)
            hexnut_i(bright, bx1 + 0.05, mid + 0.035, mid + 0.047, hp, 0.040)
            letter(paint, f'P{no}', 0.05, Q(px - mr - 0.1108, py, LID + bh + 0.365), (0, 0, 1), (0, 1, 0), WHITE)
    with component('HYD-04'):
        px, py = HPU['cleat_pump']
        cr, ch = HPU['cleat_motor']
        tube(pack, (px, py, LID), (px, py, LID + 0.12), cr - 0.02, tint(MACHINE, 0.85), 20)
        tube(pack, (px, py, LID + 0.12), (px, py, LID + 0.12 + ch), cr, LIGHT, 24)
        tube(dark, (px, py, LID + 0.12 + ch), (px, py, LID + 0.17 + ch), cr + 0.004, DARK, 24)
        box(dark, px - cr - 0.07, px - cr + 0.02, py - 0.05, py + 0.05, LID + 0.22, LID + 0.34, DARK)
        tube(bright, (px - cr + 0.03, py, LID + 0.05), (HPU['block'][1] + 0.10, py, LID + 0.05), 0.009, STEEL, 10)
        # It delivers into a block of its own on the lid, abaft the pressure block, as the diagram has it (it went into the pressure
        # block until 12 November 2026): on the block the cleats' relief valve RV2, 160 bar, under its red cap; from its top line S
        # to the cleat valve V2 (stern_place.CLEAT_BLOCK, routes).
        kb = P.CLEAT_BLOCK
        kx0, kx1, ka, kc = kb['box']
        ki = (ka + kc) / 2
        tube(bright, (HPU['block'][1] + 0.10, py, LID + 0.05), (HPU['block'][1] + 0.10, ki, LID + 0.05), 0.009, STEEL, 10)
        tube(bright, (HPU['block'][1] + 0.10, ki, LID + 0.05), (kx1 - 0.01, ki, LID + 0.05), 0.009, STEEL, 10)
        pack.block(Q(kx0, ka, LID), Q(kx1, kc, LID + kb['high']), srgb(0x6f7778), 0.005)
        rvx, rvi = kb['relief']
        tube(bright, (rvx, rvi, LID + kb['high']), (rvx, rvi, LID + kb['high'] + 0.05), 0.014, STEEL, 12)
        tube(dark, (rvx, rvi, LID + kb['high'] + 0.05), (rvx, rvi, LID + kb['high'] + 0.075), 0.020, RED, 12)
    with component('HYD-05'):
        cx0, cx1, ca, cb, ch0, ch1 = HPU['cooler']
        pack.block(Q(cx0, ca, ch0), Q(cx1, cb, ch1), DARK, 0.01)                                       # the matrix in its frame, against the tank's end
        for k in range(9):                                                                             # its tubes, seen from aft
            box(bright, cx0 + 0.05, cx1 - 0.05, ca - 0.006, ca, ch0 + 0.06 + k * 0.062, ch0 + 0.085 + k * 0.062, STEEL, soft=False)
        mx, mz = (cx0 + cx1) / 2, (ch0 + ch1) / 2
        # the fan: a shroud ring on two arms from the cooler's frame, five blades on a hub on the motor's shaft. It turns while the oil
        # is over 45 degrees (motion: the fan follows the oil's temperature), or to a tap.
        dark.ring(Q(mx, ca - 0.028, mz), (0, 0, 1), 0.20, 0.014, DARK)
        for sgn, edge in ((-1, cx0), (1, cx1)):
            box(dark, mx + sgn * 0.19, edge - sgn * 0.005, ca - 0.036, ca - 0.020, mz - 0.012, mz + 0.012, DARK)
            box(dark, edge - sgn * 0.045, edge - sgn * 0.005, ca - 0.020, ca, mz - 0.012, mz + 0.012, DARK)
        for k in range(4):                                                                              # four struts carry the motor in the shroud
            ak = radians(45 + 90 * k)
            tube(dark, (mx + 0.080 * cos(ak), ca - 0.075, mz + 0.080 * sin(ak)), (mx + 0.198 * cos(ak), ca - 0.034, mz + 0.198 * sin(ak)), 0.006, DARK, 8)
        blades = part('Stern ramp power pack, cooler fan', 'Machinery paint', smooth=True, angle=40, mover=f'{ID}-fan')
        tube(blades, (mx, ca - 0.012, mz), (mx, ca - 0.05, mz), 0.05, DARK, 20)
        for k in range(5):
            a0 = radians(72 * k)
            prism_i(blades, [(mx + r_ * cos(a0 + da), mz + r_ * sin(a0 + da)) for r_, da in ((0.045, -0.36), (0.182, -0.20), (0.182, 0.15), (0.045, 0.30))], ca - 0.036, ca - 0.022, srgb(0x9aa3a5))
        tube(pack, (mx, ca - 0.05, mz), (mx, ca - 0.20, mz), 0.085, LIGHT, 20)                          # and its motor
        box(dark, mx - 0.05, mx + 0.05, ca - 0.17, ca - 0.08, mz + 0.085, mz + 0.15, DARK)
        for sx in (cx0 + 0.02, cx1 - 0.06):                                                             # two feet to the drip tray
            box(pack, sx, sx + 0.04, ca + 0.02, ca + 0.06, 0.012, ch0, DARK)
    with component('HYD-06'):
        bx0, bx1, ba, bb, _, _ = HPU['block']
        pack.block(Q(bx0, ba, LID), Q(bx1, bb, HPU['block'][5]), srgb(0x6f7778), 0.006)
        tube(dark, (bx0 + 0.09, bb - 0.09, HPU['block'][5]), (bx0 + 0.09, bb - 0.09, HPU['block'][5] + 0.20), 0.045, DARK, 18)      # the pressure filter's bowl
        tube(bright, (bx0 + 0.09, bb - 0.20, HPU['block'][5]), (bx0 + 0.09, bb - 0.20, HPU['block'][5] + 0.07), 0.02, STEEL, 12)    # the relief valve
        tube(dark, (bx0 + 0.09, bb - 0.20, HPU['block'][5] + 0.07), (bx0 + 0.09, bb - 0.20, HPU['block'][5] + 0.10), 0.028, RED, 12)
        # the system's pressure gauge, on its gauge cock on the block's top at its inboard edge, looking into the way: its needle
        # rises when a pump is started. (A gauge is fine work, shipyard.Part: its face runs fore and aft, where the file's own
        # step is 1.9 mm.)
        room_gauge('pg1', part('Stern ramp gauges, system needle', 'Plastic', mover=f'{ID}-gauge-pg1', fine=True))
    with component('HYD-07'):
        fx, fy = HPU['return_filter']
        tube(dark, (fx, fy, LID), (fx, fy, LID + 0.26), 0.07, DARK, 20)
        tube(dark, (fx, fy, LID + 0.26), (fx, fy, LID + 0.30), 0.08, srgb(0x6f7778), 20)
        tube(bright, (fx, fy, LID + 0.30), (fx, fy, LID + 0.34), 0.015, RED, 10)
    with component('HYD-08'):
        hx, hy = HPU['hand_pump']
        box(dark, hx - 0.07, hx, hy - 0.06, hy + 0.06, 0.60, 0.80, DARK)
        tube(bright, (hx - 0.035, hy, 0.80), (hx - 0.035, hy, 0.86), 0.016, STEEL, 12)
        rod(bright, [(hx - 0.035, hy, 0.86), (hx - 0.06, hy - 0.02, 1.10), (hx - 0.09, hy - 0.05, 1.36)], 0.011, STEEL)
        tube(dark, (hx - 0.083, hy - 0.043, 1.30), (hx - 0.094, hy - 0.055, 1.42), 0.018, BLACK, 12)


def valve_stand():
    stand = part('Stern ramp valve stand', 'Machinery paint', smooth=True, angle=40)
    bright = part('Stern ramp valve stand, bright fittings', 'Shaft steel', smooth=True, angle=40)
    glass = part('Stern ramp valve stand, glasses', 'Lens', smooth=True, angle=50)
    paint = part('Stern ramp valve stand, lettering', 'Marking', fine=True)
    x0, x1, a, b, h0, h1 = HPU['manifold']
    with component('HYD-10'):
        stand.block(Q(x0, a, h0), Q(x1, b, h1), srgb(0x6f7778), 0.006)
        for yy in (a + 0.06, b - 0.10):                                                               # two brackets to the wall under it
            box(stand, x0, x1 - 0.03, yy, yy + 0.04, h0 - 0.22, h0, DARK)
        for yy, name in ((a + 0.11, 'RAMP'), (a + 0.31, 'CLEATS'), (a + 0.51, 'SPARE')):
            stand.block(Q(x1, yy - 0.055, h0 + 0.07), Q(x1 + 0.085, yy + 0.055, h0 + 0.22), DARK, 0.004)                   # the valve
            for d in (-1, 1):                                                                         # a solenoid each end
                tube(stand, (x1 + 0.045, yy + d * 0.055, h0 + 0.145), (x1 + 0.045, yy + d * 0.105, h0 + 0.145), 0.026, BLACK, 14)
            # its hand lever: the ramp's and the cleats' are worked here as at the control stand (motion); the spare's is not
            key = {'RAMP': 'v1', 'CLEATS': 'v2'}.get(name)
            lever = part(f'Stern ramp valve stand, {name.lower()} lever', 'Shaft steel', smooth=True, angle=40, mover=f'{ID}-{key}-lever') if key else bright
            knob = part(f'Stern ramp valve stand, {name.lower()} lever knob', 'Plastic', smooth=True, angle=40, mover=f'{ID}-{key}-lever') if key else stand
            rod(lever, [(x1 + 0.06, yy, h0 + 0.22), (x1 + 0.075, yy, h0 + 0.34), (x1 + 0.10, yy, h0 + 0.47)], 0.008, STEEL)
            knob.ball(Q(x1 + 0.10, yy, h0 + 0.48), 0.02, BLACK)
            letter(paint, name, 0.022, Q(x1 + 0.0008, yy, h0 + 0.02), (0, 0, -1), (0, 1, 0), WHITE)
        # a gauge for each of the ramp's two lines, each on its gauge cock on the stand's top, looking into the way: A (its needle
        # shows what carries the leaf) and B
        room_gauge('pg2', part('Stern ramp gauges, line A needle', 'Plastic', mover=f'{ID}-gauge-pg2', fine=True))
        room_gauge('pg3')
        # a marker on each line where it leaves the stand, over the gauges: its letter, and a word for what it does (the owner: "I
        # don't know what I'm looking at and how it's connected and what each pipe does"). A plate on a strap round the line.
        tags = part('Stern ramp hydraulics, line markers', 'Plastic', fine=True)
        straps = part('Stern ramp hydraulics, marker straps', 'Stainless', smooth=True, angle=40, fine=True)
        xr = P.CASING + P.T + P.BANK_OFF
        for name, word in P.MARKERS.items():
            at_, r_ = P.MANIFOLD_AT[name], P.line(name)[3]
            tube(straps, (xr, at_, P.MARKER_H - 0.02), (xr, at_, P.MARKER_H + 0.02), r_ + 0.003, STEEL, 14)
            MF = Face((xr + r_ + 0.003, P.MARKER_H - 0.03), (xr + r_ + 0.003, P.MARKER_H + 0.97), at_ + 0.03, flip=True)
            slab(tags, MF, 0.0, 0.06, 0.0, 0.06, 0.0, 0.002, WHITE)
            fits(word, 0.0062, 0.052, f'the marker of line {name}')
            words(paint, MF, name, 0.022, 0.03, 0.028, 0.0026, RED if name == 'P' else BLACK)
            words(paint, MF, word, 0.0062, 0.03, 0.009, 0.0026, BLACK)
        # the solenoids' junction box, where the conduit's branch comes down
        at = P.MANIFOLD_AT['E']
        box(stand, x0 + 0.01, x0 + 0.115, at - 0.045, at + 0.045, h1, h1 + 0.25, srgb(S.DOOR_GREY))


def panel():
    """The starter panel: a cabinet on the forward wall, on two legs; two leaves that open on what is in it; the feeder up a
    ladder to the transit in the wall; a tray on two posts over the power pack with the motors' cables."""
    x0, x1, a, b, h0, h1 = P.PANEL['box']
    grey = PANEL_GREY
    case = part('Stern ramp starter panel', 'Machinery paint')
    gear = part('Stern ramp starter panel, gear', 'Plastic')
    bright = part('Stern ramp starter panel, bright fittings', 'Shaft steel', smooth=True, angle=40)
    paint = part('Stern ramp starter panel, lettering', 'Marking')
    lamp = part('Stern ramp starter panel, lamps', 'Lens', smooth=True, angle=50)
    with component('ELD-51'):
        t = 0.018
        box(case, x0, x1, b - t, b, h0, h1, grey)                                 # its back, on the wall
        for xa, xb in ((x0, x0 + t), (x1 - t, x1)):
            box(case, xa, xb, a + 0.022, b - t, h0, h1, grey)
        box(case, x0 + t, x1 - t, a + 0.022, b - t, h1 - t, h1, grey)
        box(case, x0 + t, x1 - t, a + 0.022, b - t, h0, h0 + t, grey)
        for xa in (x0 + 0.02, x1 - 0.06):                                         # two legs to the deck
            box(case, xa, xa + 0.04, b - 0.06, b - 0.02, 0.0, h0, DARK)
        # ---- inside: a mounting plate, and on it what JS3-304 sheet 3 lists
        mp = b - t - 0.012
        box(gear, x0 + 0.04, x1 - 0.04, mp, b - t, h0 + 0.06, h1 - 0.06, srgb(0xd9d4c2), soft=False)
        duct = srgb(0x8f989a)
        rows = (h1 - 0.42, h1 - 0.78, h1 - 1.10, h1 - 1.38)
        for hh in rows:                                                           # wiring ducts between the rows
            box(gear, x0 + 0.06, x1 - 0.06, mp - 0.045, mp, hh - 0.02, hh + 0.02, duct)
        dark, cream, blue = srgb(0x2b3033), srgb(0xd8d2c0), srgb(0x3a5f8a)

        def unit(xa, xb, ha, hb, deep, colour, knob=None):
            box(gear, xa, xb, mp - deep, mp, ha, hb, colour)
            if knob:
                box(gear, (xa + xb) / 2 - 0.012, (xa + xb) / 2 + 0.012, mp - deep - 0.012, mp - deep, (ha + hb) / 2 - 0.02, (ha + hb) / 2 + 0.02, knob)

        unit(x0 + 0.20, x0 + 0.38, h1 - 0.36, h1 - 0.10, 0.11, dark, RED)                                  # Q0: the isolator
        for k in range(2):                                                                                 # F1, F2: the pumps' breakers
            unit(x0 + 0.08 + k * 0.30, x0 + 0.17 + k * 0.30, h1 - 0.34, h1 - 0.14, 0.085, cream, dark)
        for k in range(6):                                                                                 # K1M, K1D, K1S, K2M, K2D, K2S
            unit(x0 + 0.075 + k * 0.073, x0 + 0.14 + k * 0.073, h1 - 0.72, h1 - 0.48, 0.10, cream, blue)
        for k in range(4):                                                                                 # F3, K3, F4, K4
            unit(x0 + 0.075 + k * 0.058, x0 + 0.125 + k * 0.058, h1 - 1.04, h1 - 0.86, 0.085, cream, dark if k % 2 == 0 else blue)
        for k in range(6):                                                                                 # KT1, KT2, KA1 to KA4
            unit(x0 + 0.33 + k * 0.034, x0 + 0.36 + k * 0.034, h1 - 1.02, h1 - 0.88, 0.07, srgb(0x5c6f52) if k > 1 else srgb(0x7a6a3c))
        unit(x0 + 0.08, x0 + 0.26, h1 - 1.34, h1 - 1.16, 0.12, srgb(0x40484b))                              # T10: the control transformer
        for k in range(2):                                                                                 # F10, F11
            unit(x0 + 0.30 + k * 0.04, x0 + 0.33 + k * 0.04, h1 - 1.32, h1 - 1.20, 0.06, cream)
        # X0: the terminal strip, forty terminals on a rail
        box(gear, x0 + 0.07, x1 - 0.07, mp - 0.012, mp, h1 - 1.60, h1 - 1.565, STEEL, soft=False)
        for k in range(40):
            xa = x0 + 0.075 + k * 0.0107
            box(gear, xa, xa + 0.0092, mp - 0.05, mp - 0.012, h1 - 1.615, h1 - 1.55, srgb(0xb9b39f) if k % 8 else srgb(0x2f6fb7), soft=False)
        # the glands in its top (the feeder, the motors' cables) and in its inboard side (the control conduit)
        for xx in (x0 + 0.20, x0 + 0.34, x0 + 0.42, x0 + 0.49, x0 + 0.54):
            tube(bright, (xx, a + 0.16, h1), (xx, a + 0.16, h1 + 0.03), 0.026 if xx < x0 + 0.25 else 0.016, STEEL, 12)
    # ---- the two leaves: each on two hinges on its outer edge, a lock in its inner edge; lamps, ammeters and the isolator's handle on them
    mid = (x0 + x1) / 2
    for tag, xa, xb, hinge in (('l', x0, mid - 0.002, x0), ('r', mid + 0.002, x1, x1)):
        with component('ELD-51'):
            door = part(f"Stern ramp starter panel, {'inboard' if tag == 'l' else 'outboard'} leaf", 'Machinery paint', mover=f'stern-panel-door-{tag}')
            fit = part(f"Stern ramp starter panel, {'inboard' if tag == 'l' else 'outboard'} leaf fittings", 'Plastic', smooth=True, angle=40, mover=f'stern-panel-door-{tag}')
            mark = part(f"Stern ramp starter panel, {'inboard' if tag == 'l' else 'outboard'} leaf lettering", 'Marking', mover=f'stern-panel-door-{tag}')
            door.block(Q(xa, a, h0), Q(xb, a + 0.018, h1), grey, 0.004)
            for hh in (h0 + 0.20, h1 - 0.20):
                tube(fit, (hinge, a + 0.009, hh - 0.05), (hinge, a + 0.009, hh + 0.05), 0.012, DARK, 10)
            lock = xb - 0.03 if tag == 'l' else xa + 0.03
            tube(fit, (lock, a, (h0 + h1) / 2), (lock, a - 0.012, (h0 + h1) / 2), 0.016, BLACK, 12)
            if tag == 'l':
                for k, col in enumerate((0xf1ede0, 0x3ea85f, 0x3ea85f, 0x3ea85f, 0xc2412f)):                # H1 to H5
                    tube(fit, (xa + 0.045 + k * 0.045, a, h1 - 0.16), (xa + 0.045 + k * 0.045, a - 0.008, h1 - 0.16), 0.015, DARK, 14)
                    tube(fit, (xa + 0.045 + k * 0.045, a - 0.008, h1 - 0.16), (xa + 0.045 + k * 0.045, a - 0.016, h1 - 0.16), 0.011, tint(srgb(col), 0.75), 14)
                for k in range(2):                                                                         # P1, P2: the pumps' ammeters
                    cx = xa + 0.075 + k * 0.13
                    fit.block(Q(cx - 0.048, a - 0.010, h1 - 0.40), Q(cx + 0.048, a, h1 - 0.304), BLACK, 0.003)
                    start = len(mark.f)
                    mark.grid([[Q(cx + 0.04, a - 0.0108, h1 - 0.392), Q(cx - 0.04, a - 0.0108, h1 - 0.392)], [Q(cx + 0.04, a - 0.0108, h1 - 0.312), Q(cx - 0.04, a - 0.0108, h1 - 0.312)]], WHITE)
                    mark.orient(start, (0, 0, -1))
                letter(mark, 'RSP', 0.06, Q((xa + xb) / 2, a - 0.0008, h1 - 0.62), (-1, 0, 0), (0, 1, 0), BLACK)
                letter(mark, 'STERN RAMP', 0.026, Q((xa + xb) / 2, a - 0.0008, h1 - 0.70), (-1, 0, 0), (0, 1, 0), BLACK)
                letter(mark, '440 V', 0.026, Q((xa + xb) / 2, a - 0.0008, h1 - 0.76), (-1, 0, 0), (0, 1, 0), RED)
            else:
                cx = (xa + xb) / 2                                                                         # the isolator's handle
                fit.block(Q(cx - 0.05, a - 0.008, h1 - 0.32), Q(cx + 0.05, a, h1 - 0.20), YELLOW, 0.003)
                fit.block(Q(cx - 0.015, a - 0.04, h1 - 0.31), Q(cx + 0.015, a - 0.008, h1 - 0.21), RED, 0.004)
                letter(mark, 'Q0', 0.03, Q(cx, a - 0.0008, h1 - 0.38), (-1, 0, 0), (0, 1, 0), BLACK)
    # ---- the feeder: up a ladder on the wall from the panel's top to the transit, where it leaves the room
    ladder = part('Stern ramp starter panel, cable ladder and tray', 'Machinery paint')
    cables = part('Stern ramp starter panel, cables', 'Rubber', smooth=True, angle=50)
    conduit = part('Stern ramp starter panel, conduit', 'Machinery paint', smooth=True, angle=40)
    lx0, lx1 = x0 + 0.09, x0 + 0.31
    for xa in (lx0, lx1 - 0.02):
        box(ladder, xa, xa + 0.02, b - 0.05, b, h1, 3.34, GALV, soft=False)
    k = 0
    while h1 + 0.12 + k * 0.30 < 3.30:
        box(ladder, lx0 + 0.02, lx1 - 0.02, b - 0.04, b - 0.02, h1 + 0.12 + k * 0.30, h1 + 0.14 + k * 0.30, GALV, soft=False)
        k += 1
    box(ladder, lx0 - 0.03, lx1 + 0.03, b - 0.025, b, 3.10, 3.34, DARK)                                     # the transit's frame, on the wall
    laid(cables, [(x0 + 0.20, a + 0.16, h1 + 0.03), (x0 + 0.20, b - 0.064, h1 + 0.16), (x0 + 0.20, b - 0.064, 3.20), (x0 + 0.20, b - 0.026, 3.22)], 0.021, CABLE)
    # ---- the motors' cables: a tray along the wall from the panel, and aft over the power pack on two posts that stand on its lid
    px = HPU['pumps'][0][0]
    tw, th = 0.20, 2.08
    tk = HPU['tank']
    box(ladder, x1 - 0.06, px + tw / 2, b - tw, b, th, th + 0.012, GALV, soft=False)                         # along the wall, its back against it
    box(ladder, x1 - 0.06, px + tw / 2, b - tw, b - tw + 0.008, th + 0.012, th + 0.05, GALV, soft=False)
    box(ladder, px - tw / 2, px + tw / 2, 10.40, b - tw, th, th + 0.012, GALV, soft=False)                    # aft over the pack
    for xa in (px - tw / 2, px + tw / 2 - 0.008):
        box(ladder, xa, xa + 0.008, 10.40, b - tw, th + 0.012, th + 0.05, GALV, soft=False)
    for py in (tk[2] + 0.07, tk[3] - 0.07):                                                                 # the two posts: a leg each side on the lid, a bar across under the tray
        for xa in (tk[0] + 0.01, tk[1] - 0.05):
            box(ladder, xa, xa + 0.04, py - 0.02, py + 0.02, LID, th - 0.04, GALV)
        box(ladder, tk[0] + 0.01, tk[1] - 0.01, py - 0.02, py + 0.02, th - 0.04, th, GALV)
    drops = [('W-RMP-03', HPU['pumps'][1], LID + HPU['bell'][1] + 0.48, 0.016, -HPU['motor'][0] - 0.04), ('W-RMP-02', HPU['pumps'][0], LID + HPU['bell'][1] + 0.48, 0.016, -HPU['motor'][0] - 0.04),
             ('W-RMP-04', HPU['cleat_pump'], LID + 0.34, 0.011, -HPU['cleat_motor'][0] - 0.025)]
    for k, (name, (mx, my), box_top, r, dx) in enumerate(drops):
        xr = px - 0.07 + k * 0.045                                                                          # each cable's own place across the tray
        gx = x0 + 0.34 + k * 0.075
        laid(cables, [(gx, a + 0.16, h1 + 0.03), (gx, a + 0.16, th + 0.012 + r + 0.002), (x1 + 0.03, b - 0.10 - k * 0.03, th + 0.012 + r + 0.002),
                      (xr, b - 0.10 - k * 0.03, th + 0.012 + r + 0.002), (xr, my + 0.06, th + 0.012 + r + 0.002)], r, CABLE)
        # down to the motor's terminal box in a conduit, from the tray's inboard edge
        laid(conduit, [(px - tw / 2 - 0.028, my + 0.06, th + 0.03), (px - tw / 2 - 0.028, my + 0.06, th - 0.10), (mx + dx, my, box_top + 0.12), (mx + dx, my, box_top)], r + 0.004, GALV)
    # the cooler's fan: on along the tray to its after end, and down in a conduit behind the cooler
    c = HPU['cooler']
    fz = (c[4] + c[5]) / 2 + 0.15
    laid(cables, [(x0 + 0.54, a + 0.16, h1 + 0.03), (x0 + 0.54, a + 0.16, th + 0.025), (x1 + 0.03, b - 0.19, th + 0.025), (px + 0.065, b - 0.19, th + 0.025), (px + 0.065, 10.46, th + 0.025)], 0.011, CABLE)
    laid(conduit, [(px + 0.065, 10.41, th + 0.03), (px + 0.065, c[2] - 0.125, th + 0.03), (px + 0.065, c[2] - 0.125, fz - 0.03)], 0.015, GALV)
    box(ladder, px + 0.045, px + 0.085, c[2] - 0.145, c[2] + 0.03, c[5], c[5] + 0.02, GALV, soft=False)                 # its clip, a flat bar on the cooler's frame


# =====================================================================================================================
# The pipes from the valve stand to the stern, the conduit, their clamps, the junction box
# =====================================================================================================================
def pipes():
    pipe = part('Stern ramp hydraulics, pipes', 'Machinery paint', smooth=True, angle=40)
    conduit = part('Stern ramp control, conduit', 'Machinery paint', smooth=True, angle=40)
    clamp = part('Stern ramp hydraulics, clamps', 'Machinery paint')
    routes = P.routes()
    for name, runs in routes.items():
        r = P.line(name)[3]
        for run in runs:
            laid(conduit if name == 'E' else pipe, run, r, GALV if name == 'E' else OIL)
    for name, at, (axis, face, way), along in P.clamps():
        # a clamp: 60 mm along the line, 5 mm of rubber round it, and its foot on the wall
        g = P.line(name)[3] + 0.005
        lo, hi = [v - g for v in at], [v + g for v in at]
        lo[along], hi[along] = at[along] - 0.03, at[along] + 0.03
        if way > 0:
            lo[axis] = face
        else:
            hi[axis] = face
        box(clamp, lo[0], hi[0], lo[1], hi[1], lo[2], hi[2], DARK)
    # the pressure and return lines come down to the tank over the way: a flat bar on the pressure block, with both clipped to it
    blk = HPU['block']
    xt = (blk[0] + blk[1]) / 2
    box(clamp, xt + 0.024, xt + 0.038, P.MANIFOLD_AT['S'] - 0.04, P.MANIFOLD_AT['T'] + 0.04, blk[5], 1.86, DARK)
    # the return goes on aft over the lid to the cooler (stern_place.RETURN): two posts on the lid carry it
    rt, gt = P.RETURN, P.line('T')[3] + 0.005
    hr = blk[5] + rt['over']
    for ii in rt['posts']:
        box(clamp, rt['x'] - 0.0125, rt['x'] + 0.0125, ii - 0.0125, ii + 0.0125, LID, hr - gt, DARK)
        box(clamp, rt['x'] - gt, rt['x'] + gt, ii - 0.03, ii + 0.03, hr - gt, hr + gt, DARK)
    for name in 'SPT':
        g = P.line(name)[3] + 0.005
        for hh in (1.50, 1.80):
            box(clamp, xt - g, xt + 0.024, P.MANIFOLD_AT[name] - g, P.MANIFOLD_AT[name] + g, hh - 0.03, hh + 0.03, DARK)
    with component('RMP-31'):
        jb = P.JB['box']
        case = part('Stern ramp junction box', 'Machinery paint')
        case.block(Q(jb[0], jb[2], jb[4]), Q(jb[1], jb[3], jb[5]), PANEL_GREY, 0.006)
        box(case, jb[1], jb[1] + 0.006, jb[2] + 0.02, jb[3] - 0.02, jb[4] + 0.02, jb[5] - 0.02, tint(PANEL_GREY, 0.92), soft=False)       # its lid
        paint = part('Stern ramp junction box, lettering', 'Marking')
        letter(paint, 'JB-R', 0.035, Q(jb[1] + 0.0068, (jb[2] + jb[3]) / 2, (jb[4] + jb[5]) / 2 - 0.02), (0, 0, 1), (0, 1, 0), BLACK)


# =====================================================================================================================
# The control stand, and the dials
# =====================================================================================================================
class Face:
    """A flat face that runs fore and aft and leans: `a` and `b` are its near and far edge as (x, h), `i0` the edge its
    measures across begin at. Seen by whoever looks at it, u runs to the right and v up it. A face that looks to port
    (`flip`) has its u running aft."""

    def __init__(self, a, b, i0, flip=False):
        self.a, self.i0, self.flip = a, i0, flip
        self.len = hypot(b[0] - a[0], b[1] - a[1])
        self.t = ((b[0] - a[0]) / self.len, (b[1] - a[1]) / self.len)
        self.n = (self.t[1], -self.t[0]) if flip else (-self.t[1], self.t[0])
        self.right = (0.0, 0.0, -1.0 if flip else 1.0)          # the ship's axes: x, y up, z forward
        self.up = (self.t[0], self.t[1], 0.0)
        self.out = (self.n[0], self.n[1], 0.0)

    def at(self, u, v, d=0.0):
        return Q(self.a[0] + self.t[0] * v + self.n[0] * d, self.i0 + (-u if self.flip else u), self.a[1] + self.t[1] * v + self.n[1] * d)


def slab(p, F, u0, u1, v0, v1, d0, d1, colour):
    """A box that lies on a face: from u0 to u1 across it, v0 to v1 up it, d0 to d1 off it."""
    c = {(i, j, k): p.vert(F.at(u, v, d)) for i, u in enumerate((u0, u1)) for j, v in enumerate((v0, v1)) for k, d in enumerate((d0, d1))}
    neg = lambda w: tuple(-x for x in w)
    for ids, way in ((((0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1)), F.out), (((0, 0, 0), (0, 1, 0), (1, 1, 0), (1, 0, 0)), neg(F.out)),
                     (((1, 0, 0), (1, 1, 0), (1, 1, 1), (1, 0, 1)), F.right), (((0, 0, 0), (0, 0, 1), (0, 1, 1), (0, 1, 0)), neg(F.right)),
                     (((0, 1, 0), (0, 1, 1), (1, 1, 1), (1, 1, 0)), F.up), (((0, 0, 0), (1, 0, 0), (1, 0, 1), (0, 0, 1)), neg(F.up))):
        start = len(p.f)
        p.face([c[i] for i in ids], colour)
        p.orient(start, way)


def patch(p, F, pts, d, colour):
    """A flat shape painted on a face: its corners as (u, v), d off the face."""
    start = len(p.f)
    p.face([p.vert(F.at(u, v, d)) for u, v in pts], colour)
    p.orient(start, F.out)


def stud(p, F, u, v, d0, d1, r, colour, sides=16, r2=None):
    p.tube(F.at(u, v, d0), F.at(u, v, d1), r, r2, colour=colour, sides=sides)


def words(p, F, text, height, u, v, d, colour):
    letter(p, text, height, F.at(u, v, d), F.right, F.up, colour)


def fits(text, height, room, what):
    """A legend never runs over the edge of what it is engraved on (the owner, 12 November 2026: "Labels need to be wrapped ,
    it should behave like reality emergency stop can't have its text bleed like that"). The lettering's own width is
    measured, and the build stops if it is more than the room there is for it."""
    wide = lettering(text, height)[2]
    if wide > room:
        raise SystemExit(f'{what}: "{text}" is {wide * 1000:.1f} mm long in letters of {height * 1000:.1f} mm, and there are {room * 1000:.1f} mm for it')
    return wide


def ring_words(p, F, text, height, u, v, feet, d, colour, over=True, most=150.0):
    """Lettering round a ring, as on the legend plate of an emergency stop: each letter stands on the circle of radius `feet`
    about (u, v). `over`: across the top, feet toward the middle, read from left to right; otherwise across the bottom, feet
    outward, so that it is read upright there too. Each letter keeps the place the line gives it (its width and the gaps
    are the lettering's own). The build stops if the line would take more than `most` degrees of the ring."""
    upto = [lettering(text[:k + 1], height)[2] for k in range(len(text))]
    middle = feet + height / 2 if over else feet - height / 2
    if degrees(upto[-1] / middle) > most:
        raise SystemExit(f'"{text}" round a ring of {middle * 1000:.0f} mm takes {degrees(upto[-1] / middle):.0f} degrees of it: more than {most:.0f}')
    for k, ch in enumerate(text):
        if ch == ' ':
            continue
        w = lettering(ch, height)[2]
        along = upto[k] - w / 2 - upto[-1] / 2                    # the letter's middle along the line, from the line's middle
        a = along / middle if over else pi - along / middle      # clockwise from straight up, as it is looked at
        out, round_ = (sin(a), cos(a)), (cos(a), -sin(a))         # away from the middle; clockwise
        right, up = (round_, out) if over else ((-round_[0], -round_[1]), (-out[0], -out[1]))
        ou, ov = u + feet * out[0] - right[0] * w / 2, v + feet * out[1] - right[1] * w / 2
        letter(p, ch, height, F.at(ou, ov, d), tuple(right[0] * F.right[i] + right[1] * F.up[i] for i in range(3)),
               tuple(up[0] * F.right[i] + up[1] * F.up[i] for i in range(3)), colour, centre=False)


def legend(plate, paint, F, lines, u, v, size=0.0075):
    """An engraved plate: white letters' ground in black, as a ship's legend plates are (black letters on white here). The
    plate is as wide as its longest line as lettered, and 6 mm more each side: nothing runs over its edge."""
    wide = max(lettering(t, size)[2] for t in lines) + 0.012
    high = len(lines) * size * 1.6 + 0.006
    slab(plate, F, u - wide / 2, u + wide / 2, v - high / 2, v + high / 2, 0.0, 0.0012, WHITE)
    for k, t in enumerate(lines):
        words(paint, F, t, size, u, v + high / 2 - 0.004 - size - k * size * 1.6, 0.0018, BLACK)


def needle_angle(bar):
    """Where a dial's needle stands for a pressure: degrees clockwise from straight up."""
    return -P.GAUGE['sweep'] / 2 + P.GAUGE['sweep'] * bar / P.GAUGE['full']


def dial(F, u, v, r, name, case, face, paint, glass, needle, title=None, bar=0.0, back=0.0, scale=None):
    """A pressure indicator on a face: its case and bezel, a white dial from 0 to 250 bar with a mark at every ten, a figure
    at every fifty and a red mark from the working pressure up, its needle (a part of its own, so that it can turn) and its glass."""
    sc = dict(full=P.GAUGE['full'], red=P.GAUGE['red'], sweep=P.GAUGE['sweep'], major=50, unit='bar')        # (`scale`: a thermometer's is its own)
    sc.update(scale or {})
    full, red = sc['full'], sc['red']
    needle_angle = lambda val: -sc['sweep'] / 2 + sc['sweep'] * val / full
    stud(case, F, u, v, -back, 0.010, r + 0.007, BLACK, 40)                # (its case ends under the dial: the bezel stands round it; `back`: the body of a gauge that stands free)
    case.ring(F.at(u, v, 0.0125), F.out, r + 0.0035, 0.0040, CHROME)
    stud(face, F, u, v, 0.0105, 0.0115, r, WHITE, 40)
    d = 0.0119

    def at(a, rad):                     # a place on the dial: a degrees clockwise from up, rad from its middle
        return (u + rad * sin(radians(a)), v + rad * cos(radians(a)))

    def tick(a, r0, r1, w, colour):
        (x0, y0), (x1, y1) = at(a, r0), at(a, r1)
        px, py = cos(radians(a)) * w / 2, -sin(radians(a)) * w / 2
        patch(paint, F, [(x0 - px, y0 - py), (x0 + px, y0 + py), (x1 + px, y1 + py), (x1 - px, y1 - py)], d, colour)

    for b10 in range(0, int(full) + 1, 10):
        major = b10 % sc['major'] == 0
        tick(needle_angle(b10), r * (0.76 if major else 0.84), r * 0.95, r * (0.035 if major else 0.018), RED if b10 >= red else BLACK)
        if major:
            x, y = at(needle_angle(b10), r * 0.60)
            words(paint, F, str(b10), r * 0.17, x, y - r * 0.085, d, BLACK)
    for k in range(8):                                                      # the red mark: from the working pressure to the end of the scale
        tick(needle_angle(red + (full - red) * (k + 0.5) / 8), r * 0.955, r * 0.995, r * 0.085, RED)
    words(paint, F, sc['unit'], r * 0.16, u, v - r * 0.50, d, BLACK)
    if title:
        words(paint, F, title, r * 0.115, u, v + r * 0.26, d, BLACK)
    # the needle: at rest where `bar` says; a counterweight tail, a hub
    a0 = needle_angle(bar)
    (tx, ty), (bx, by) = at(a0, r * 0.82), at(a0 + 180, r * 0.22)
    px, py = cos(radians(a0)) * r * 0.035, -sin(radians(a0)) * r * 0.035
    patch(needle, F, [(bx - px, by - py), (bx + px, by + py), (tx + px * 0.2, ty + py * 0.2), (tx - px * 0.2, ty - py * 0.2)], 0.0142, BLACK)
    stud(needle, F, u, v, 0.0125, 0.0155, r * 0.10, BLACK, 16)
    stud(glass, F, u, v, 0.0165, 0.0172, r + 0.001, srgb(0xdfe8ea), 40)


ST = P.STAND
SX0, SX1 = ST['x']
SI0, SI1 = ST['inn']
DESK = Face(ST['desk'][0], ST['desk'][1], SI0)
UPST = Face(ST['upstand'][0], ST['upstand'][1], SI0)
FACES = {'desk': DESK, 'up': UPST}
ITEM = lambda kind, **want: next(q for q in P.STAND_PANEL if q['kind'] == kind and all(q.get(k) == v for k, v in want.items()))
LIT = {'white': ('Signal white', 0xfff6dc, 0xd9d4c2), 'green': ('Signal green', 0x7dff9b, 0x35553e), 'amber': ('Signal amber', 0xffc65a, 0x6d5a2c), 'red': ('Signal red', 0xff6a5a, 0x5f302b)}
WINDOW = (0.050, 0.040)                 # a lamp window: across, up


def prism_i(p, profile, i0, i1, colour):
    """A closed solid: an outline in (x, h) carried fore and aft from i0 to i1."""
    i0, i1 = min(i0, i1), max(i0, i1)
    area = sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(profile, profile[1:] + profile[:1]))
    pts = list(profile) if area > 0 else list(profile)[::-1]
    for inn, way in ((i0, -1), (i1, 1)):
        start = len(p.f)
        p.polygon([Q(x, inn, h) for x, h in pts], colour)
        p.orient(start, (0, 0, way))
    for a, b in zip(pts, pts[1:] + pts[:1]):
        start = len(p.f)
        p.face([p.vert(Q(a[0], i0, a[1])), p.vert(Q(a[0], i1, a[1])), p.vert(Q(b[0], i1, b[1])), p.vert(Q(b[0], i0, b[1]))], colour)
        p.orient(start, (b[1] - a[1], -(b[0] - a[0]), 0.0))


def stand():
    """The ramp's control stand (stern_place.STAND, STAND_PANEL): a steel desk against the mooring station's wall. What is worked is on
    the sloping desk, what is read on the upstand behind it; a door in its front opens on its terminals; two guard posts stand
    inboard of it and a beacon on its top."""
    # Its desk and upstand run fore and aft, and along her length the file's own step is 1.9 mm: the uprights of its 6 to 8 mm
    # letters were lost on the page, and its dials' scales with them. So everything that is worked or read on it is fine work
    # (shipyard.Part: kept in a small box of its own, a step of a hundredth of a millimetre); its case, a plain steel desk, is not.
    # What is painted straight on the case stands 1 mm off it, more than the case's own place can be out by (0.45 mm).
    case = part('Ramp control stand', 'Machinery paint')
    steel = part('Ramp control stand, bright fittings', 'Stainless', smooth=True, angle=40, fine=True)
    dark = part('Ramp control stand, dark fittings', 'Plastic', smooth=True, angle=40, fine=True)
    plate = part('Ramp control stand, legend plates', 'Plastic', fine=True)
    paint = part('Ramp control stand, lettering', 'Marking', fine=True)
    face = part('Ramp control stand, dial faces', 'Plastic', smooth=True, angle=40, fine=True)
    glass = part('Ramp control stand, dial glasses', 'Dial glass', smooth=True, angle=50, fine=True)
    lens = part('Ramp control stand, lamp windows', 'Lens', fine=True)
    wires = part('Ramp control stand, wiring', 'Rubber', smooth=True, angle=50)
    gear = part('Ramp control stand, terminals', 'Plastic')
    grey = srgb(0xaeb6b4)                                   # the stand: light grey enamel, as her deck cabinets are
    t = 0.014
    (dx0, dh0), (dx1, dh1) = ST['desk']
    (ux1, uh1) = ST['upstand'][1]
    W = SI1 - SI0
    outline = [(SX0, 0.03), (SX0, dh0), (dx1, dh1), (ux1, uh1), (SX1, uh1), (SX1, 0.03)]
    with component('RMP-30'):
        box(case, SX0 - 0.03, SX1 + 0.005, SI0 - 0.03, SI1 + 0.03, 0.0, 0.03, DARK)                         # its foot, bolted to the deck
        for xb in (SX0 + 0.01, SX1 - 0.04):
            for ib in (SI0 - 0.012, SI1 + 0.012):
                tube(steel, (xb, ib, 0.03), (xb, ib, 0.042), 0.011, STEEL, 6)
        for ia, ib in ((SI0, SI0 + t), (SI1 - t, SI1)):                                                    # its two ends
            prism_i(case, outline, ia, ib, grey)
        slab(case, DESK, t, W - t, 0.0, DESK.len, -0.012, 0.0, srgb(0x8f9896))                              # the desk and the upstand: steel plate
        slab(case, UPST, t, W - t, 0.0, UPST.len, -0.012, 0.0, srgb(0x8f9896))
        box(case, ux1 + 0.004, SX1, SI0 + t, SI1 - t, uh1 - 0.012, uh1, grey)                               # its top
        box(case, SX1 - t, SX1, SI0 + t, SI1 - t, 0.03, uh1 - 0.012, grey)                                  # its back, against the wall
        box(case, SX0, SX1 - t, SI0 + t, SI1 - t, 0.03, 0.045, grey)                                        # its bottom
        for ia, ib in ((SI0 + t, SI0 + 0.032), (SI1 - 0.032, SI1 - t)):                                    # the door's frame, in its front
            box(case, SX0, SX0 + t, ia, ib, 0.045, dh0 - 0.016, grey)
        box(case, SX0, SX0 + t, SI0 + 0.032, SI1 - 0.032, 0.045, 0.085, grey)
        box(case, SX0, SX0 + t, SI0 + 0.032, SI1 - 0.032, 0.905, dh0 - 0.016, grey)
        # the two guard posts inboard of it: whoever works it stands between them
        px, pa, pb = ST['posts']
        for pi_ in (pa, pb):
            tube(case, (px, pi_, 0.0), (px, pi_, 0.95), 0.045, YELLOW, 20)
            tube(case, (px, pi_, 0.95), (px, pi_, 0.97), 0.05, BLACK, 20)
            for hb in (0.25, 0.55):
                tube(case, (px, pi_, hb), (px, pi_, hb + 0.10), 0.0462, BLACK, 20)
        # ---- the upstand: what is read
        fits('STERN RAMP   CONTROL STAND CS-R', 0.013, W - 2 * t - 0.04, "the control stand's title")
        words(paint, UPST, 'STERN RAMP   CONTROL STAND CS-R', 0.013, W / 2, UPST.len - 0.030, 0.0010, BLACK)
        for q in P.STAND_PANEL:
            F = FACES[q['on']]
            u, v = q['u'], q['v']
            if q['kind'] == 'gauge':
                needle = part(f"Ramp control stand, {q['id']} pressure needle", 'Plastic', mover=f"{ID}-gauge-{q['id']}", fine=True)
                dial(F, u, v, q['r'], q['id'], dark, face, paint, glass, needle)
                legend(plate, paint, F, (q['legend'],), u, v - q['r'] - 0.022)
            elif q['kind'] == 'window':
                ww, wh = WINDOW
                look, lit, dim = LIT[q['colour']]
                slab(dark, F, u - ww / 2 - 0.003, u + ww / 2 + 0.003, v - wh / 2 - 0.003, v + wh / 2 + 0.003, 0.0, 0.006, BLACK)
                slab(lens, F, u - ww / 2, u + ww / 2, v - wh / 2, v + wh / 2, 0.006, 0.0085, srgb(dim))
                glow = part(f"Ramp control stand, {q['id']} lamp", look, mover=None if q['id'] == 'power' else f"{ID}-lamp-{q['id']}", fine=True)
                slab(glow, F, u - ww / 2 + 0.001, u + ww / 2 - 0.001, v - wh / 2 + 0.001, v + wh / 2 - 0.001, 0.0087, 0.0092, srgb(lit))
                # (and lit by the lamp test, whatever it says otherwise: a second light before the first, shown while the test's button is in)
                test = part(f"Ramp control stand, lamp test, {q['colour']}", look, mover=f'{ID}-lamp-test', fine=True)
                slab(test, F, u - ww / 2 + 0.001, u + ww / 2 - 0.001, v - wh / 2 + 0.001, v + wh / 2 - 0.001, 0.00925, 0.00965, srgb(lit))
                for k, text in enumerate(q['legend']):
                    fits(text, 0.0062, ww - 0.006, f"the lamp window {q['id']}")
                    words(paint, F, text, 0.0062, u, v + 0.0035 - k * 0.0115, 0.0098, BLACK)
            elif q['kind'] == 'key':
                stud(steel, F, u, v, 0.0, 0.006, 0.017, CHROME, 20)
                stud(dark, F, u, v, 0.006, 0.016, 0.012, BLACK, 16)
                slab(steel, F, u - 0.002, u + 0.002, v - 0.004, v + 0.016, 0.016, 0.034, CHROME)              # the key, in it
                legend(plate, paint, F, q['legend'], u, v - 0.036, 0.0062)
            elif q['kind'] == 'push':
                stud(steel, F, u, v, 0.0, 0.006, 0.016, CHROME, 20)
                cap = part('Ramp control stand, lamp test button', 'Plastic', smooth=True, angle=40, mover=f'{ID}-lamp-test-button', fine=True) if q['legend'][0] == 'LAMP' else dark
                stud(cap, F, u, v, 0.004, 0.012, 0.0115, BLACK, 16)
                legend(plate, paint, F, q['legend'], u, v - 0.034, 0.0062)
            elif q['kind'] == 'plate':
                slab(plate, F, u, u + q['w'], v, v + q['h'], 0.0, 0.0012, WHITE)
                for cx, cy in ((u + 0.006, v + 0.006), (u + q['w'] - 0.006, v + 0.006), (u + 0.006, v + q['h'] - 0.006), (u + q['w'] - 0.006, v + q['h'] - 0.006)):
                    stud(steel, F, cx, cy, 0.0012, 0.0026, 0.0025, STEEL, 8)
                for k, text in enumerate(q['lines']):
                    head = not text[0].isdigit()
                    fits(text, 0.0085 if head else 0.0075, q['w'] - (0.014 if head else 0.022) - 0.010, 'the instruction plate')
                    letter(paint, text, 0.0085 if head else 0.0075, F.at(u + (0.014 if head else 0.022), v + q['h'] - 0.020 - k * 0.0168, 0.0018), F.right, F.up, RED if head else BLACK, centre=False)
            elif q['kind'] == 'estop':
                stud(plate, F, u, v, 0.0, 0.0015, 0.046, YELLOW, 32)                                         # its yellow ground
                stud(dark, F, u, v, 0.0015, 0.020, 0.019, BLACK, 20)
                cap = part('Ramp control stand, emergency stop', 'Plastic', smooth=True, angle=40, mover=f'{ID}-estop-button', fine=True)
                cap.tube(F.at(u, v, 0.020), F.at(u, v, 0.026), 0.022, 0.030, colour=RED, sides=28)
                cap.tube(F.at(u, v, 0.026), F.at(u, v, 0.040), 0.030, 0.026, colour=RED, sides=28)
                # its legend goes round the yellow ring, as on a real one, over the top and again under the bottom: between the
                # button (30 mm from the middle) and the ring's edge (46 mm), 4 mm and more from each. (It was two straight lines
                # across the ring's lower edge, which ran off the yellow and under the button; the owner: "emergency stop can't
                # have its text bleed like that".)
                words_ = ' '.join(q['legend'])
                ring_words(paint, F, words_, 0.0056, u, v, 0.0346, 0.0021, BLACK, over=True)
                ring_words(paint, F, words_, 0.0056, u, v, 0.0402, 0.0021, BLACK, over=False)
            elif q['kind'] in ('start', 'stop'):
                stud(steel, F, u, v, 0.0, 0.006, 0.017, CHROME, 20)
                if q['kind'] == 'start':
                    cap = part(f"Ramp control stand, pump {q['id']} start button", 'Plastic', smooth=True, angle=40, mover=f"{ID}-pump-{q['id']}-button", fine=True)
                    cap.tube(F.at(u, v, 0.004), F.at(u, v, 0.0105), 0.0125, colour=srgb(0x2f8f4f), sides=20)
                else:
                    stud(dark, F, u, v, 0.004, 0.015, 0.0125, RED, 20)
                legend(plate, paint, F, q['legend'], u, v - 0.031 if q['kind'] == 'stop' else v + 0.033, 0.0062)
            elif q['kind'] == 'lever':
                slab(steel, F, u - 0.028, u + 0.028, v - 0.060, v + 0.060, 0.0, 0.003, CHROME)                 # its gate
                slab(dark, F, u - 0.006, u + 0.006, v - 0.045, v + 0.045, 0.003, 0.0045, BLACK)                # the slot it moves in
                lever = part(f"Ramp control stand, {q['id']} lever", 'Plastic', smooth=True, angle=40, mover=f"{ID}-{q['id']}-lever", fine=True)
                lever.tube(F.at(u, v, 0.004), F.at(u, v, 0.030), 0.016, 0.008, colour=BLACK, sides=18)         # its gaiter
                lever.tube(F.at(u, v, 0.026), F.at(u, v, 0.150), 0.0065, colour=CHROME, sides=12)
                lever.ball(F.at(u, v, 0.165), 0.020, BLACK)
                legend(plate, paint, F, (q['far'],), u, v + 0.076, 0.0068)
                legend(plate, paint, F, (q['near'],), u, v - 0.076, 0.0068)
                fits(q['legend'][0], 0.0075, 0.050, f"the name of the {q['id']} lever")       # between its gate and the next thing on the desk
                words(paint, F, q['legend'][0], 0.0075, u + 0.062, v - 0.004, 0.0010, BLACK)
        # ---- the beacon and the horn, on a short pole on its after top corner: lit while the ramp is neither home nor landed
        bx, bi = ST['beacon']
        tube(steel, (bx, bi, uh1), (bx, bi, uh1 + 0.16), 0.016, CHROME, 12)
        tube(dark, (bx, bi, uh1 + 0.16), (bx, bi, uh1 + 0.185), 0.045, BLACK, 20)
        tube(lens, (bx, bi, uh1 + 0.185), (bx, bi, uh1 + 0.265), 0.040, srgb(0x8a6a22), 20)
        tube(dark, (bx, bi, uh1 + 0.265), (bx, bi, uh1 + 0.275), 0.042, BLACK, 20)
        beacon = part('Ramp control stand, beacon', 'Signal amber', smooth=True, angle=40, mover=f'{ID}-beacon', fine=True)
        beacon.tube(Q(bx, bi, uh1 + 0.187), Q(bx, bi, uh1 + 0.263), 0.0412, colour=srgb(0xffb428), sides=20)
        dark.tube(Q(bx - 0.016, bi, uh1 + 0.09), Q(bx - 0.075, bi, uh1 + 0.09), 0.014, 0.034, colour=srgb(0x9a2a22), sides=18)      # the horn, looking inboard
        # ---- inside, behind the door: the terminal strip X1 (as JS3-304 sheet 3 lists it), the cable from the conduit, the cores up to the desk
        back = SX1 - t
        box(gear, back - 0.008, back, SI0 + 0.05, SI1 - 0.05, 0.30, 0.92, srgb(0xd9d4c2), soft=False)          # a mounting plate on its back
        mp = back - 0.008
        box(gear, mp - 0.010, mp, SI0 + 0.08, SI1 - 0.08, 0.565, 0.60, STEEL, soft=False)                    # the rail
        import stern as REG                                     # (the register's own list: as many terminals as it names)
        n = len(REG.STAND_TERMINALS)
        for k in range(n):
            ia = SI0 + 0.09 + k * 0.0182
            box(gear, mp - 0.052, mp - 0.010, ia, ia + 0.0158, 0.55, 0.615, srgb(0x2f6fb7) if k < 2 else srgb(0xb9b39f), soft=False)
            wires.rod([Q(mp - 0.03, ia + 0.008, 0.615), Q(mp - 0.03, ia + 0.008, 0.70), Q(mp - 0.03, SI0 + 0.12 + k * 0.016, 0.84), Q(mp - 0.03, SI0 + 0.12 + k * 0.016, 0.89)], 0.0028,
                      srgb((0xb8372b, 0x23272a, 0x2f6fb7, 0xd1a51f)[k % 4]))
        box(gear, mp - 0.05, mp, SI0 + 0.10, SI1 - 0.10, 0.89, 0.93, srgb(0x8f989a))                          # the duct the cores go up in
        mid = (SI0 + SI1) / 2
        tube(steel, (back, mid, 0.60), (back - 0.03, mid, 0.60), 0.02, STEEL, 12)                            # the gland, where the conduit comes through the wall
        wires.rod([Q(back - 0.03, mid, 0.60), Q(back - 0.08, mid - 0.08, 0.52), Q(mp - 0.03, SI0 + 0.20, 0.50), Q(mp - 0.03, SI0 + 0.12, 0.55)], 0.011, CABLE)
        letter(paint, 'X1', 0.02, Q(mp - 0.0008, mid, 0.66), (0, 0, 1), (0, 1, 0), BLACK)
        tube(steel, (back, SI1 - 0.09, 0.14), (back - 0.03, SI1 - 0.09, 0.14), 0.006, srgb(0xb08a4a), 8)       # the earth stud
    with component('RMP-30'):
        door = part('Ramp control stand, door', 'Machinery paint', mover='stern-stand-door')
        fit = part('Ramp control stand, door fittings', 'Plastic', smooth=True, angle=40, mover='stern-stand-door')
        mark = part('Ramp control stand, door lettering', 'Marking', mover='stern-stand-door', fine=True)
        door.block(Q(SX0 - 0.004, SI0 + 0.034, 0.087), Q(SX0 + 0.012, SI1 - 0.034, 0.903), grey, 0.003)
        for hh in (0.20, 0.79):                                                                            # its hinges, on its after edge
            tube(fit, (SX0 + 0.004, SI0 + 0.034, hh - 0.04), (SX0 + 0.004, SI0 + 0.034, hh + 0.04), 0.010, DARK, 10)
        tube(fit, (SX0 - 0.004, SI1 - 0.075, 0.52), (SX0 - 0.022, SI1 - 0.075, 0.52), 0.016, BLACK, 12)      # its lock
        letter(mark, 'CS-R', 0.045, Q(SX0 - 0.0048, (SI0 + SI1) / 2, 0.70), (0, 0, 1), (0, 1, 0), BLACK)
        letter(mark, 'STERN RAMP CONTROL', 0.020, Q(SX0 - 0.0048, (SI0 + SI1) / 2, 0.64), (0, 0, 1), (0, 1, 0), BLACK)
        letter(mark, '24 V   FED FROM RSP', 0.014, Q(SX0 - 0.0048, (SI0 + SI1) / 2, 0.60), (0, 0, 1), (0, 1, 0), BLACK)


# =====================================================================================================================
# The places marked in the machinery spaces
# =====================================================================================================================
LANDS = {'MSB': ('W-GEN-01', 'W-GEN-02', 'W-GEN-03', 'W-TX-01', 'W-TX-03'), 'PSB': ('W-RMP-01', 'W-TX-02', 'W-TX-04'), 'T1': ('W-TX-01', 'W-TX-02'), 'T2': ('W-TX-03', 'W-TX-04'),
         'DG1': ('W-GEN-01',), 'DG2': ('W-GEN-02',), 'DG3': ('W-GEN-03',)}
TAGS = {'MSB': 'ELD-61', 'PSB': 'ELD-62', 'T1': 'ELD-63', 'T2': 'ELD-64', 'DG1': 'GEN-01', 'DG2': 'GEN-02', 'DG3': 'GEN-03'}


def marks():
    """Each place a switchboard, a transformer or a generating set is to stand: its outline painted on the floor with its tag,
    and a post at the point the cables are to be landed, with a sign and the tagged, coiled end of each cable."""
    post = part('Machinery places, posts and signs', 'Machinery paint', group='machinery')
    ends = part('Machinery places, cable ends', 'Rubber', group='machinery', smooth=True, angle=50)
    paint = part('Machinery places, outlines and lettering', 'Marking', group='machinery')
    amber, ink = srgb(0xe3b341), srgb(0x1c2022)
    for e in P.ENDS:
        if e['tag'] in P.BUILT:
            continue                                             # (the board itself stands there: switchboard.py)
        x0, x1, a, b = e['box']
        fy = L.Y(e['floor'])
        K = lambda x, yard, up: (x, fy + up, L.Z(yard))
        # which way the place is looked at from: a switchboard from the aisle between the two rows; the others from aft
        look = -1 if e['tag'] == 'PSB' else 1                    # 1: whoever reads it looks forward
        right = (-look, 0, 0)
        with component(TAGS[e['tag']]):
            # ---- the outline: a band round its footprint, and its tag inside it, painted on the floor
            w, lift = 0.07, 0.004
            for q in ((x0, x1, a, a + w), (x0, x1, b - w, b), (x0, x0 + w, a + w, b - w), (x1 - w, x1, a + w, b - w)):
                start = len(paint.f)
                paint.grid([[K(q[0], q[2], lift), K(q[1], q[2], lift)], [K(q[0], q[3], lift), K(q[1], q[3], lift)]], amber)
                paint.orient(start, (0, 1, 0))
            size = min(0.34, (b - a) * 0.42, (x1 - x0) * 0.2)
            letter(paint, e['tag'], size, K((x0 + x1) / 2, (a + b) / 2 - look * size / 2, lift), right, (0, 0, look), amber)
            # ---- the post, at the point the cables end; its foot on the floor
            px, py, pz = P.end_point(e['tag'])
            top = pz - e['floor']
            post.block(K(px - 0.07, py - 0.07, 0.0), K(px + 0.07, py + 0.07, 0.012), ink, 0.002)
            post.block(K(px - 0.025, py - 0.025, 0.012), K(px + 0.025, py + 0.025, top + 0.10), amber, 0.004)
            # the sign: on the side it is looked at from
            sy = py - look * 0.027
            sw, sh, sz = 0.52, 0.34, 1.30
            post.block(K(px - sw / 2, sy - 0.006, sz), K(px + sw / 2, sy + 0.006, sz + sh), WHITE, 0.003)
            face = sy - look * 0.0068
            for text, hgt, up, col in ((e['tag'], 0.085, sz + sh - 0.115, ink), (e['name'], 0.030, sz + sh - 0.170, ink), (e['line'], 0.026, sz + sh - 0.215, ink),
                                       ('NOT INSTALLED', 0.030, sz + 0.065, RED), ('PLACE MARKED  JS3-304', 0.017, sz + 0.025, ink)):
                letter(paint, text, hgt, K(px, face, up), right, (0, 1, 0), col)
            # the cables' ends: each a coil hung on a hook at the post's head, over the sign and behind the post from whoever reads it;
            # and under the sign a tag with each cable's number
            far = py + look * 0.055
            n = len(LANDS[e['tag']])
            hw = 0.026 * n + 0.02
            post.block(K(px - hw, min(py, far) - 0.012, top + 0.02), K(px + hw, max(py, far) + 0.012, top + 0.045), ink, 0.002)
            for k in range(n):
                ends.ring(K(px + (k - (n - 1) / 2) * 0.052, far, top - 0.115), (0, 0, 1), 0.16, 0.019, CABLE)
            tw_, tl = 0.20, 0.03 * n + 0.03
            post.block(K(px - tw_ / 2, sy - 0.004, sz - 0.04 - tl), K(px + tw_ / 2, sy + 0.004, sz - 0.04), amber, 0.002)
            for k, name in enumerate(LANDS[e['tag']]):
                letter(paint, name, 0.019, K(px, sy - look * 0.0048, sz - 0.075 - k * 0.03), right, (0, 1, 0), ink)


# =====================================================================================================================
def motion():
    """What of it is worked on the page. The ramp's own control (Raise, Stop, Lower in the bar; or the lever at the stand,
    once a pump runs) drives everything in its order through each mover's `map`: the cleats first, then the leaf and its
    cylinders, the flaps on the way down. The stand's two pump buttons, its door and the starter panel's two leaves answer a tap."""
    hinge3 = list(Q(0.0, HINGE['inn'], HINGE['h']))
    inputs = [dict(id=ID, name='Stern ramp', min=0, max=P.LOWEST, step=1, unit='°', below='raised', above='lowered', rest='raised',
                   keys=['Raise', 'Stop', 'Lower'], stops=[dict(v=P.LEVEL, say='level'), dict(v=P.LOWEST, say='low quay')], rate=P.RATE)]
    # (`carries`: at rest the leaf and its flaps are stood on where they lie, as a deck is. The owner, 12 November 2026: "I want to be
    # able to walk out on the ramp , and look at the sea and the ship". The page does not move it while somebody stands on it.)
    movers = [dict(id=ID, kind='turn', input=ID, axis=[1, 0, 0], pivot=hinge3, ratio=-1.0, map=P.LEAF_MAP, carries=True)]
    for sgn, tag in ((1, 'p'), (-1, 's')):
        x = sgn * RAM['x']
        ram = dict(kind='aim', input=ID, axis=[1, 0, 0], pivot=hinge3, ratio=-1.0, map=P.LEAF_MAP,
                   anchor=list(Q(x, *RAM['trunnion'])), pin=list(Q(x, *RAM['pin'])))
        movers.append(dict(ram, id=f'{ID}-ram-{tag}'))
        movers.append(dict(ram, id=f'{ID}-ram-{tag}-rod', extend=True))
        movers.append(dict(id=f'{ID}-bolts-{tag}', kind='slide', input=ID, axis=[sgn, 0, 0], pivot=[0, 0, 0], ratio=1.0, map=P.BOLT_MAP))
    s0, t0 = FLAP['axis']
    movers.append(dict(id=f'{ID}-flaps', kind='turn', input=ID, axis=[1, 0, 0], pivot=list(Q(0.0, ROAD + t0, FOOT + s0)), ratio=-1.0, map=P.FLAP_MAP, on=ID, carries=True))
    pivot = list(Q(0.0, *HOOK['pivot']))
    movers.append(dict(id=f'{ID}-hooks', kind='turn', input=ID, axis=[1, 0, 0], pivot=pivot, ratio=-1.0, map=P.HOOK_MAP))
    hook_ram = dict(kind='aim', input=ID, axis=[1, 0, 0], pivot=pivot, ratio=-1.0, map=P.HOOK_MAP, anchor=list(Q(0.0, *HOOK['ram_anchor'])), pin=list(Q(0.0, *HOOK['ram_pin'])))
    movers.append(dict(hook_ram, id=f'{ID}-hook-rams'))
    movers.append(dict(hook_ram, id=f'{ID}-hook-rods', extend=True))
    # the two safety latches: lifted first of all, fallen in last; each by its small cylinder
    lpivot = list(Q(0.0, *P.LATCH['pivot']))
    movers.append(dict(id=f'{ID}-latches', kind='turn', input=ID, axis=[1, 0, 0], pivot=lpivot, ratio=1.0, map=P.LATCH_MAP))
    latch_ram = dict(kind='aim', input=ID, axis=[1, 0, 0], pivot=lpivot, ratio=1.0, map=P.LATCH_MAP, anchor=list(Q(0.0, *P.LATCH['ram_anchor'])), pin=list(Q(0.0, *P.LATCH['ram_pin'])))
    movers.append(dict(latch_ram, id=f'{ID}-latch-rams'))
    movers.append(dict(latch_ram, id=f'{ID}-latch-rods', extend=True))
    # ---- the control stand (stern_place.STAND_PANEL). A tap starts or stops a pump; the emergency stop trips both and holds the ramp;
    # each lever moves a notch to a tap and gives the ramp its orders, if a pump runs and what must be so is so; the lamps and the
    # two pressure indicators follow.
    neg = [-DESK.out[0], -DESK.out[1], -DESK.out[2]]
    pumps = [f'{ID}-pump-1', f'{ID}-pump-2']
    estop = f'{ID}-estop'
    for no in (1, 2):
        q, qs = ITEM('start', id=no), ITEM('stop', id=no)
        inputs.append(dict(id=pumps[no - 1], name=f'Ramp pump No. {no}', min=0, max=1, step=1, unit='', below='', above='running', rest='stopped', auto='tap',
                           fitting='RMP-30', at=list(DESK.at(q['u'], (q['v'] + qs['v']) / 2, 0.02)), reach=2.0,
                           unless=estop, refused='the emergency stop is pressed: release it first'))
        movers.append(dict(id=f'{pumps[no - 1]}-button', kind='slide', input=pumps[no - 1], axis=neg, pivot=[0, 0, 0], ratio=0.003))
        movers.append(dict(id=f'{ID}-lamp-pump-{no}', kind='show', input=pumps[no - 1], axis=[0, 1, 0], pivot=[0, 0, 0], ratio=1.0, over=0.5))
    q = ITEM('estop')
    inputs.append(dict(id=estop, name='Ramp emergency stop', min=0, max=1, step=1, unit='', below='', above='pressed: the pumps are tripped and the ramp is held', rest='released',
                       auto='tap', fitting='RMP-30', at=list(DESK.at(q['u'], q['v'], 0.03)), reach=2.0, trips=pumps, holds=ID))
    movers.append(dict(id=f'{estop}-button', kind='slide', input=estop, axis=neg, pivot=[0, 0, 0], ratio=0.008))
    # the pumps' pressure: it rises while either runs and falls when both are stopped; the system's two gauges read it
    press = f'{ID}-pressure'
    inputs.append(dict(id=press, name='Ramp hydraulic pressure', min=0, max=P.GAUGE['pump'], step=1, unit=' bar', below='', above='', rest='no pressure',
                       level=dict(fill=pumps, rate=130.0, fall=70.0)))
    per_bar = P.GAUGE['sweep'] / P.GAUGE['full']
    line_a = [[c, round(b * per_bar, 2)] for c, b in P.RAMP_BAR]
    q = ITEM('gauge', id='system')
    movers.append(dict(id=f'{ID}-gauge-system', kind='turn', input=press, axis=list(UPST.out), pivot=list(UPST.at(q['u'], q['v'])), ratio=-per_bar))
    q = ITEM('gauge', id='ramp')
    movers.append(dict(id=f'{ID}-gauge-ramp', kind='turn', input=ID, axis=list(UPST.out), pivot=list(UPST.at(q['u'], q['v'])), ratio=-1.0, map=line_a))
    # (and in the hydraulic pump room: the system's gauge on the pressure block, line A's on the valve stand)
    g = P.room_gauge('pg1')
    movers.append(dict(id=f'{ID}-gauge-pg1', kind='turn', input=press, axis=[g['look'], 0, 0], pivot=list(Q(g['x'], g['at'], g['h'])), ratio=-per_bar))
    g = P.room_gauge('pg2')
    movers.append(dict(id=f'{ID}-gauge-pg2', kind='turn', input=ID, axis=[g['look'], 0, 0], pivot=list(Q(g['x'], g['at'], g['h'])), ratio=-1.0, map=line_a))
    free, home = P.CLEAT_RUN[1], P.LEAF_FROM
    levers = (
        (ITEM('lever', id='cleats'), 'Ramp cleats lever',
         [dict(v=-22, say='lock', to=0.0, within=[0.0, home + 0.01], refused='the ramp is not home: raise it first'),
          dict(v=0, say='middle', order='hold'),
          dict(v=22, say='open', to=home, within=[0.0, home + 0.01], refused='the ramp is down: its cleats are open')]),
        (ITEM('lever', id='ramp'), 'Ramp lever',
         [dict(v=-22, say='raise', to=home, within=[home - 0.01, P.LOWEST], refused='the ramp is home: lock its cleats'),
          dict(v=0, say='stop', order='hold'),
          dict(v=22, say='lower', order='next', within=[free - 0.01, P.LOWEST], refused='the cleats are locked: open them first')]),
    )
    for q, name, steps in levers:
        lid = f"{ID}-{q['id']}-lever"
        inputs.append(dict(id=lid, name=name, min=-22, max=22, step=22, unit='°', below=q['far'].lower(), above=q['near'].lower(), rest='middle', steps=steps, home=1,
                           drives=dict(input=ID, needs=pumps, without='no pump is running: start one first', unless=estop, stopped='the emergency stop is pressed')))
        movers.append(dict(id=lid, kind='turn', input=lid, axis=[0, 0, 1], pivot=list(DESK.at(q['u'], q['v'], 0.006)), ratio=1.0))
    movers.append(dict(id=f'{ID}-lamp-closed', kind='show', input=ID, axis=[0, 1, 0], pivot=[0, 0, 0], ratio=1.0, when='off', over=home + 0.01))
    movers.append(dict(id=f'{ID}-lamp-locked', kind='show', input=ID, axis=[0, 1, 0], pivot=[0, 0, 0], ratio=1.0, when='off', over=0.01))
    movers.append(dict(id=f'{ID}-lamp-open', kind='show', input=ID, axis=[0, 1, 0], pivot=[0, 0, 0], ratio=1.0, over=free - 0.01))
    # ---- the oil (the owner: "Also specify the oil and the level of oil etc , it needs to be fully functional"). Its level in the
    # glass follows the ramp: the cylinders' rods take their own volume out of the tank on the way down. Its temperature rises
    # while a pump runs, to where the cooler holds it, and falls again; the thermometer shows it; the cooler's fan runs from 45
    # degrees until it is back at 40 (the temperature is `on` between them), or to a tap.
    x0t, G_, T_ = HPU['tank'][0], P.GLASS, P.THERMO
    base = G_['foot'] + 0.001
    movers.append(dict(id=f'{ID}-oil-level', kind='stretch', input=ID, axis=[0, 1, 0], pivot=list(Q(x0t - 0.035, G_['at'], base)), ratio=1.0, map=P.glass_map(base)))
    temp = f'{ID}-oil-temp'
    inputs.append(dict(id=temp, name='Ramp hydraulic oil temperature', min=P.TEMP['cold'], max=P.TEMP['warm'], step=1, unit=' °C', below='', above='', rest='cold', start=P.TEMP['cold'],
                       level=dict(fill=pumps, rate=P.TEMP['rise'], fall=P.TEMP['fall'], on=float(P.FLUID['fan'][0]), off=float(P.FLUID['fan'][1]))))
    movers.append(dict(id=f'{ID}-thermo', kind='turn', input=temp, axis=[-1, 0, 0], pivot=list(Q(x0t, T_['at'], T_['h'])), ratio=-T_['sweep'] / T_['full']))
    cx0, cx1, ca, _, ch0, ch1 = HPU['cooler']
    fan = f'{ID}-fan'
    inputs.append(dict(id=fan, name='Oil cooler fan', min=0, max=360, step=1, unit='°', below='', above='running', rest='stopped', auto='tap', run='spin', rate=1100,
                       fitting='HYD-05', at=list(Q((cx0 + cx1) / 2, ca - 0.10, (ch0 + ch1) / 2)), reach=2.0, **{'with': temp}))
    movers.append(dict(id=fan, kind='turn', input=fan, axis=[0, 0, 1], pivot=list(Q((cx0 + cx1) / 2, ca - 0.03, (ch0 + ch1) / 2)), ratio=1.0))
    # the two oil lamps. OIL TEMP is lit from 70 degrees, which the cooler does not let it reach. OIL LEVEL is lit under the LOW
    # mark; with the ramp at its lowest the oil stands 7 cm over it, and nothing aboard loses oil. So both are seen lit only by the
    # lamp test, as aboard: its button lights every lamp for as long as it is in, and comes out by itself.
    movers.append(dict(id=f'{ID}-lamp-oil-temp', kind='show', input=temp, axis=[0, 1, 0], pivot=[0, 0, 0], ratio=1.0, over=float(P.FLUID['hot']) - 0.01))
    low = HPU['tank'][4] + 0.01 + P.TANK['low']
    movers.append(dict(id=f'{ID}-lamp-oil-level', kind='show', input=ID, axis=[0, 1, 0], pivot=[0, 0, 0], ratio=1.0, over=0.5,
                       map=[[c, 1.0 if P.glass_height(c) < low else 0.0] for c in (0.0, P.LEVEL, P.LOWEST)]))
    test = f'{ID}-lamp-test'
    q = next(q for q in P.STAND_PANEL if q['kind'] == 'push' and q['legend'][0] == 'LAMP')
    inputs.append(dict(id=test, name='Ramp control stand, lamp test', min=0, max=1, step=1, unit='', below='', above='pressed: every lamp is lit', rest='released', auto='tap', spring=2.5,
                       fitting='RMP-30', at=list(UPST.at(q['u'], q['v'], 0.02)), reach=2.0))
    movers.append(dict(id=f'{test}-button', kind='slide', input=test, axis=[-UPST.out[0], -UPST.out[1], -UPST.out[2]], pivot=[0, 0, 0], ratio=0.003))
    movers.append(dict(id=test, kind='show', input=test, axis=[0, 1, 0], pivot=[0, 0, 0], ratio=1.0, over=0.5))
    # ---- the valve stand's two hand levers: the same orders as the control stand's, given by hand at the valve. A pump must run.
    m_ = HPU['manifold']
    for key, yy, name, words_, steps in (('v1', m_[2] + 0.11, 'Ramp valve V1, hand lever', ('raise', 'lower'), levers[1][2]), ('v2', m_[2] + 0.31, 'Cleat valve V2, hand lever', ('lock', 'open'), levers[0][2])):
        lid = f'{ID}-{key}-lever'
        inputs.append(dict(id=lid, name=name, min=-22, max=22, step=22, unit='°', below=words_[0], above=words_[1], rest='middle', steps=steps, home=1,
                           drives=dict(input=ID, needs=pumps, without='no pump is running: start one at the control stand first')))
        movers.append(dict(id=lid, kind='turn', input=lid, axis=[1, 0, 0], pivot=list(Q(m_[1] + 0.06, yy, m_[4] + 0.22)), ratio=1.0))
    # the beacon: lit while the ramp is neither locked, nor landed level, nor at its lowest
    movers.append(dict(id=f'{ID}-beacon', kind='show', input=ID, axis=[0, 1, 0], pivot=[0, 0, 0], ratio=1.0, over=0.5,
                       map=[[0.0, 0.0], [0.4, 1.0], [P.LEVEL - 0.4, 1.0], [P.LEVEL, 0.0], [P.LEVEL + 0.4, 1.0], [P.LOWEST - 0.4, 1.0], [P.LOWEST, 0.0]]))
    inputs.append(dict(id='stern-stand-door', name='Ramp control stand, door', min=0, max=105, step=1, unit='°', below='', above='open', rest='shut', auto='tap',
                       fitting='RMP-30', at=list(Q(SX0, (SI0 + SI1) / 2, 0.45)), reach=2.0))
    movers.append(dict(id='stern-stand-door', kind='turn', input='stern-stand-door', axis=[0, 1, 0], pivot=list(Q(SX0 + 0.004, SI0 + 0.034, 0.0)), ratio=-1.0))
    x0, x1, a, b, h0, h1 = P.PANEL['box']
    for tag, hinge, way, name in (('l', x0, 1.0, 'inboard'), ('r', x1, -1.0, 'outboard')):
        inputs.append(dict(id=f'stern-panel-door-{tag}', name=f'Stern ramp starter panel, {name} leaf', min=0, max=90, step=1, unit='°', below='', above='open', rest='shut', auto='tap',
                           fitting='ELD-51', at=list(Q(hinge + way * 0.15, a, (h0 + h1) / 2)), reach=2.0))
        movers.append(dict(id=f'stern-panel-door-{tag}', kind='turn', input=f'stern-panel-door-{tag}', axis=[0, 1, 0], pivot=list(Q(hinge, a + 0.009, 0.0)), ratio=way))
    return inputs, movers


def build():
    bad = P.wrong()
    if bad:
        raise SystemExit('the stern ramp is not built: its mechanism does not hold: ' + '; '.join(bad))
    leaf()
    rams()
    cleats()
    power_pack()
    valve_stand()
    panel()
    pipes()
    stand()
    marks()
    return list(_parts.values())
