"""
The navigation bridge (section 5 of her own build): the wheelhouse, its two wings, and what the bridge adds to the compass
deck. Everything in it is a component of her register (ferry/systems/bridge.py): this module draws each one where the
register puts it, and what it draws between `with component(tag):` and its end is that component in the model.

What was here before was the Minato Maru's house with her own fittings set into it (11 November). It is redrawn whole:

  - the house: plated outside, lined inside, five forward windows raked 10 degrees under a visor, windows and a weathertight
    door down each side, a lined deckhead with its lights, loudspeaker and smoke detector, a sheet deck covering;
  - the console in five bays with every instrument of the register on it: displays that show their pictures (her own sheet,
    atlas.py), flush panels with their knobs, levers, a microphone, handsets; the equipment inside it as plain units;
  - the steering stand, two chairs, the overhead console, the compass periscope under the binnacle;
  - on the aft wall the fire detection panel, the two distribution boards and the two 24 V panels, a locker, the flag locker,
    the chart table with its chart, clock, barometer and clinometer, the portable radios, the room air conditioner;
  - both wings: bulwark with a wooden rail, wing control station, sidelight on the rail (it stood behind the bulwark, where
    no ship abeam could see it), bearing repeater, lifebuoy, and to port the hydrant and hose box;
  - on the compass deck: two not-under-command lights, the NAVTEX and AIS position antennas, a wind sensor, the air
    conditioner's condensing unit.

The after wall below 2.08 m and the deck under it are the ship's (steel.py).

Drawn in the ship's axes (lines.py): x to port, y up from the waterline, z forward from amidships. Places below are as the
register gives them, in the bridge's own measures: x, `yard` (metres from the first Chisum's transom, where the bridge was
designed) and h (metres over the bridge deck). bridge_place.py carries them aboard the 68 m ship.
"""
import os, sys
from bridge_kit import *
import bridge_kit as K
from hull_appendages import _revolve
import bridge_console as BC
import bridge_outfit as BO
import bridge_fittings as BF

# What hangs from the deckhead is fastened to the compass deck, and lifts away with it when she is taken apart (as the
# deckhead over the machinery spaces goes with the car deck): the strips, the lights, the overhead consoles and
# instruments, the periscope. So a room is looked down into with nothing over it.
HUNG = ('ceiling', 'ceil', 'grabrails', 'overhead', 'ovh_dial', 'ovh_screen', 'ovh_set', 'periscope', 'whistle_valve')


# =====================================================================================================================
# The house
# =====================================================================================================================

def view_from_helm(limit=112.5, mullion=6.0, eye=None):
    """
    How much of the horizon the glass shows a person standing at the wheel, doors shut, by the survey's own measure
    (ferry/design/bridge/findings.py): each pane's two edges as bearings from right ahead, gaps under 6 degrees taken as
    mullions the view goes on round, counted to 22.5 degrees abaft the beam on each side. Returns the degrees seen of 225
    and the blind sectors on one side (the two sides are alike).
    """
    from math import atan2, degrees
    ex, ey, eh = HELM
    eh = eye if eye is not None else eh
    front = FRONT_IN + 0.045 + fwd(eh)
    spans = [(degrees(atan2(a + FRAME_T - 0.005, front - ey)), degrees(atan2(b - FRAME_T + 0.005, front - ey))) for a, b in PANES if b > 0]
    spans[0] = (0.0, spans[0][1])
    for yd0, yd1, h0, h1, what in SIDES[1]:
        if what == 'window' and h0 + FRAME_T < eh < h1 - FRAME_T:
            a, b = yd0 + FRAME_T, yd1 - FRAME_T
        elif what == 'door' and DOOR_GLASS[0] < eh < DOOR_GLASS[1]:
            a, b = yd0 + 0.04 + STILE, yd1 - 0.04 - STILE
        else:
            continue
        spans.append(tuple(sorted((degrees(atan2(2.965, b - ey)), degrees(atan2(2.965, a - ey))))))
    spans.sort()
    merged = [list(spans[0])]
    for a, b in spans[1:]:
        if a - merged[-1][1] < mullion:
            merged[-1][1] = max(merged[-1][1], b)
        else:
            merged.append([a, b])
    seen = 2 * sum(max(0.0, min(b, limit) - min(a, limit)) for a, b in merged)
    blind = [(round(merged[i][1], 1), round(merged[i + 1][0], 1)) for i in range(len(merged) - 1)]
    return seen, blind, round(merged[-1][1], 1)


def _wall(side, yd0, yd1, h0, h1):
    """A length of the side wall: plating outside, lining inside."""
    if yd1 - yd0 < 1e-6 or h1 - h0 < 1e-6:
        return
    box('plating', side * (X_IN + 0.04), side * X_OUT, yd0, yd1, h0, h1, HOUSE)
    box('lining', side * X_IN, side * (X_IN + 0.04), yd0, yd1, h0, h1, LINING)


def _raked(key, x0, x1, t0, t1, h0, h1, colour):
    """A member of the raked forward wall between heights h0 and h1: t0 and t1 are how far through the wall it lies (0 inside, 1 outside)."""
    th = FRONT_OUT - FRONT_IN
    prof = [(FRONT_IN + th * t0 + fwd(h0), h0), (FRONT_IN + th * t1 + fwd(h0), h0), (FRONT_IN + th * t1 + fwd(h1), h1), (FRONT_IN + th * t0 + fwd(h1), h1)]
    prism(key, x0, x1, prof, colour)


def _side_window(side, yd0, yd1, h0, h1):
    """A side window: the glass in black rubber; outside it a painted steel frame standing a little proud of the plating;
    inside a casing of light varnished wood, proud of the lining, and under it a wooden sill board."""
    t = FRAME_T
    bars = [(yd0, yd1, h0, h0 + t, 'low'), (yd0, yd1, h1 - t, h1, 'high'), (yd0, yd0 + t, h0 + t, h1 - t, 'aft'), (yd1 - t, yd1, h0 + t, h1 - t, 'fore')]
    for a, b, c, e, where in bars:
        # the part of the bar's breadth that is wood and steel (toward the wall) and the part that is rubber (toward the glass)
        if where in ('low', 'high'):
            wood = (a, b, c, c + 0.034) if where == 'low' else (a, b, e - 0.034, e)
            rub = (a + 0.034, b - 0.034, c + 0.034, e) if where == 'low' else (a + 0.034, b - 0.034, c, e - 0.034)
        else:
            wood = (a, a + 0.034, c, e) if where == 'aft' else (b - 0.034, b, c, e)
            rub = (a + 0.034, b, c, e) if where == 'aft' else (a, b - 0.034, c, e)
        box('lwood', side * 2.908, side * 2.952, wood[0], wood[1], wood[2], wood[3], WOODL, r=0.004)
        box('plating', side * 2.952, side * 3.008, wood[0], wood[1], wood[2], wood[3], tint(HOUSE, 0.97))
        box('rubber', side * 2.950, side * 2.980, rub[0], rub[1], rub[2], rub[3], RUBBER, r=0.004)
    x = side * 2.965
    part('glass').polygon([P(x, yd0 + t - 0.006, h0 + t - 0.006), P(x, yd1 - t + 0.006, h0 + t - 0.006), P(x, yd1 - t + 0.006, h1 - t + 0.006), P(x, yd0 + t - 0.006, h1 - t + 0.006)], GLASS)
    box('lwood', side * 2.862, side * 2.921, yd0 - 0.012, yd1 + 0.012, h0 - 0.030, h0, WOODL, r=0.006)             # the sill board


def _skirting(a, b, wall, inward, along='x'):
    """The vinyl of the deck turned up the wall as a coved skirting, 0.10 m high, between a and b along a wall: `wall` is
    where the lining's face stands, `inward` the way into the room (+1 or -1) across it."""
    arc = [(0.045 - 0.039 * cos(radians(q)), 0.051 - 0.039 * sin(radians(q))) for q in (90, 72, 54, 36, 18, 0)]
    prof = [(0.0, 0.012), (0.045, 0.012)] + arc + [(0.006, 0.100), (0.0, 0.100)]
    if along == 'x':
        ring = lambda x: [P(x, wall + inward * d, h) for d, h in prof]
        out = lambda d: (0.0, d[1], inward * d[0])
    else:
        ring = lambda yd: [P(wall + inward * d, yd, h) for d, h in prof]
        out = lambda d: (inward * d[0], d[1], 0.0)
    extrude(part('skirt'), prof, ring(a), ring(b), out, SKIRT)


def _joint(a, b, normal, width=0.003):
    """A joint between two lining panels: a dark line from a to b on a face that looks along `normal`."""
    p = part('seam')
    A, B, n = Vector(P(*a)), Vector(P(*b)), Vector(normal)
    side = (B - A).cross(n).normalized() * (width / 2)
    start = len(p.f)
    p.polygon([tuple(A - side + n * 0.0008), tuple(B - side + n * 0.0008), tuple(B + side + n * 0.0008), tuple(A + side + n * 0.0008)], tint(LINING, 0.62))
    p.orient(start, tuple(n))


def envelope():
    # ---- the aft wall above the ship's own, which ends at the old deckhead: plating outside (the riser of the step in
    # the roof, where the lower house top meets it), lining inside up to the deckhead
    # (below 2.20 m the other ship's side walls stand at its ends: it stops 3 mm inside their faces, not in them)
    box('plating', -X_OUT + 0.003, X_OUT - 0.003, AFT - 0.05, AFT - 0.025, OLD_HEAD, 2.20, HOUSE)
    box('plating', -X_OUT, X_OUT, AFT - 0.05, AFT - 0.025, 2.20, HEAD_ROOM, HOUSE)
    box('lining', -X_IN, X_IN, AFT - 0.025, AFT_FACE, OLD_HEAD, HEAD_ROOM, LINING)
    # Below it the wall is the ship's (steel.py), lined in her own cream. The refit lays the bridge's laminate over that
    # lining, 10 mm thick (its face stands 10 mm before the ship's: JSY-STD-403, rule 5), round the corridor's doorway and
    # the crew stair's opening.
    for x0, x1, h0, h1 in ((0.40, X_IN, 0.012, OLD_HEAD), (-0.40, 0.40, 1.92, OLD_HEAD), (-2.12, -0.40, 0.012, OLD_HEAD), (-X_IN, -2.12, 1.50, OLD_HEAD)):
        box('lining', x0, x1, 19.54, AFT_FACE, h0, h1, LINING)
    for x in (-1.80, -1.20, -0.60, 0.60, 1.20, 1.80, 2.40):
        _joint((x, AFT_FACE, 0.11), (x, AFT_FACE, CEIL), FWD)
    # ---- the two sides
    for side, openings in SIDES.items():
        at = AFT
        for yd0, yd1, h0, h1, what in openings:
            _wall(side, at, yd0, 0.0, HEAD_ROOM)
            if what == 'window':
                _wall(side, yd0, yd1, 0.0, h0)
                _wall(side, yd0, yd1, h1, HEAD_ROOM)
                _side_window(side, yd0, yd1, h0, h1)
            else:
                _wall(side, yd0, yd1, h1, HEAD_ROOM)
            at = yd1
        # the forward corner: the side wall carried into the rake of the front
        cheek = [(CORNER, 0.0), (FRONT_OUT, 0.0), (FRONT_OUT, SILL), (FRONT_OUT + fwd(HEAD), HEAD), (FRONT_OUT + fwd(HEAD), HEAD_ROOM - 0.05), (CORNER, HEAD_ROOM - 0.05)]
        prism('plating', side * (X_IN + 0.04), side * X_OUT, cheek, HOUSE)
        prism('lining', side * X_IN, side * (X_IN + 0.04), cheek, LINING)
        box('plating', side * X_IN, side * X_OUT, CORNER, 23.10, HEAD_ROOM - 0.05, HEAD_ROOM, HOUSE)
        # the mullion between the two forward side windows, and the post between the door and the window forward of it,
        # faced in the casings' wood; the panel joints below the sills
        for a, b in ((22.10, 22.15), (21.25, 21.30)):
            box('lwood', side * 2.908, side * 2.921, a, b, 0.97, 2.05, WOODL, r=0.0)
        for yd in (19.60, 21.275, 21.70, 22.125, 22.55):
            _joint((side * X_IN, yd, 0.11), (side * X_IN, yd, 0.94 if yd > 21.26 else 1.07), (-side, 0, 0))
        # the skirting: from the after wall to the door, and from the door to the front (to starboard the crew stair's well
        # takes the after corner)
        _skirting(AFT_FACE if side > 0 else 20.16, 20.45, side * X_IN, -side, along='yard')
        _skirting(21.25, FRONT_IN, side * X_IN, -side, along='yard')
    _skirting(-X_IN, X_IN, FRONT_IN, -1)
    _skirting(0.40, X_IN, AFT_FACE, 1)
    _skirting(-2.07, -0.40, AFT_FACE, 1)
    # ---- the front: plating below the sill, then posts, mullions, frames and glass raked forward, then the head
    box('plating', -X_IN, X_IN, FRONT_IN + 0.04, FRONT_OUT, 0.0, SILL, HOUSE)
    box('lining', -X_IN, X_IN, FRONT_IN, FRONT_IN + 0.04, 0.0, SILL, LINING)
    posts = [(-X_IN, PANES[0][0])] + [(a[1], b[0]) for a, b in zip(PANES, PANES[1:])] + [(PANES[-1][1], X_IN)]
    w = 0.031                                                   # how far a mullion's wood (and the frame's steel) reaches into the opening; then rubber
    for x0, x1 in posts:
        _raked('plating', x0, x1, 0.5, 1.0, SILL, HEAD, HOUSE)
        # the inner half of every post and mullion is light varnished wood, and stands 12 mm proud of the lining below it
        _raked('lwood', max(x0 - w, -X_IN), min(x1 + w, X_IN), -0.15, 0.5, SILL, HEAD, WOODL)
        _joint(((x0 + x1) / 2, FRONT_IN, 0.11), ((x0 + x1) / 2, FRONT_IN, SILL - 0.04), AFTWARD)
    head = [(FRONT_IN + fwd(HEAD), HEAD), (FRONT_OUT + fwd(HEAD), HEAD), (FRONT_OUT + fwd(HEAD), HEAD_ROOM - 0.05), (FRONT_IN + fwd(HEAD), HEAD_ROOM - 0.05)]
    prism('plating', -X_IN, X_IN, [(y + 0.04 if i in (0, 3) else y, h) for i, (y, h) in enumerate(head)], HOUSE)
    prism('lining', -X_IN, X_IN, [(y if i in (0, 3) else y - 0.04, h) for i, (y, h) in enumerate(head)], LINING)
    t = 0.045
    for x0, x1 in PANES:
        # the wooden rails under and over the glass, between the mullions; the steel frame outside; the rubber the glass sits in
        _raked('lwood', x0 + w, x1 - w, -0.15, 0.5, SILL, SILL + w, WOODL)
        _raked('lwood', x0 + w, x1 - w, -0.15, 0.5, HEAD - w, HEAD, WOODL)
        _raked('plating', x0, x1, 0.62, 1.10, SILL, SILL + w + 0.002, tint(HOUSE, 0.97))
        _raked('plating', x0, x1, 0.62, 1.10, HEAD - w - 0.002, HEAD, tint(HOUSE, 0.97))
        for a, b in ((x0, x0 + w + 0.002), (x1 - w - 0.002, x1)):
            _raked('plating', a, b, 0.62, 1.10, SILL + w + 0.002, HEAD - w - 0.002, tint(HOUSE, 0.97))
        _raked('rubber', x0 + w - 0.002, x1 - w + 0.002, 0.42, 0.70, SILL + w - 0.002, SILL + t, RUBBER)
        _raked('rubber', x0 + w - 0.002, x1 - w + 0.002, 0.42, 0.70, HEAD - t, HEAD - w + 0.002, RUBBER)
        for a, b in ((x0 + w - 0.002, x0 + t), (x1 - t, x1 - w + 0.002)):
            _raked('rubber', a, b, 0.42, 0.70, SILL + t, HEAD - t, RUBBER)
        yg = lambda h: FRONT_IN + 0.045 + fwd(h)
        g = 0.006                                               # the glass goes this far into its rubber
        holes = []
        for cx, hc, rr in BF.cvs_holes():                       # a clear-view screen's ring stands in a round hole in the pane
            if x0 < cx < x1:
                rise = lambda k: hc + rr * sin(2 * pi * k / 48) * cos(radians(10.0))
                holes.append([P(cx + rr * cos(2 * pi * k / 48), yg(rise(k)), rise(k)) for k in range(48)])
        part('glass').polygon([P(x0 + t - g, yg(SILL + t - g), SILL + t - g), P(x1 - t + g, yg(SILL + t - g), SILL + t - g),
                               P(x1 - t + g, yg(HEAD - t + g), HEAD - t + g), P(x0 + t - g, yg(HEAD - t + g), HEAD - t + g)], GLASS, holes=holes)
    # the sill board along the front, under the wooden rails: light wood, 60 mm into the room
    box('lwood', -X_IN, X_IN, FRONT_IN - 0.060, FRONT_IN + 0.001, SILL - 0.032, SILL, WOODL, r=0.006)
    # the visor: the roof's eave carried forward over the glass
    box('plating', -3.08, 3.08, 23.09, 23.46, HEAD_ROOM - 0.05, HEAD_ROOM, HOUSE)
    prism('plating', -3.08, 3.08, [(23.40, HEAD_ROOM - 0.05), (23.46, HEAD_ROOM - 0.05), (23.46, HEAD_ROOM - 0.11), (23.44, HEAD_ROOM - 0.11)], tint(HOUSE, 0.94))


STRIP, STRIP_GAP = 0.185, 0.015         # the deckhead's strips: their breadth fore and aft, and the shadow gap between two


def ceiling():
    """The deckhead: long narrow strips of off-white panel running athwartships, 2.30 m over the deck, a shadow gap between
    each two; over them a dark backing, and over that the void the cable trays lie in. (It was one slab with seams painted
    on it.)"""
    end = FRONT_IN + fwd(HEAD)
    box('lining', -X_IN, X_IN, AFT, end, CEIL + 0.012, CEIL + LINING_T, srgb(0x2a2c2e))
    yd = AFT_FACE
    while yd < end - 0.02:
        box('strip', -X_IN, X_IN, yd, min(yd + STRIP, end), CEIL, CEIL + 0.012, CEILING, r=0.004)
        yd += STRIP + STRIP_GAP


def _covering(x0, x1, yd0, yd1, slots):
    """A length of the deck covering, cut round the slots let into it (JSY-STD-403, rule 3: an opening is cut, not covered)."""
    cuts = sorted({yd0, yd1} | {v for s in slots for v in (s[2], s[3]) if yd0 < v < yd1})
    for a, b in zip(cuts, cuts[1:]):
        at = x0
        for sa, sb in sorted((s[0], s[1]) for s in slots if s[2] < (a + b) / 2 < s[3] and s[1] > x0 and s[0] < x1):
            if sa > at:
                box('floor', at, sa, a, b, 0.0, 0.012, VINYL)
            at = max(at, sb)
        if at < x1:
            box('floor', at, x1, a, b, 0.0, 0.012, VINYL)


def floor():
    """The deck covering: blue sheet vinyl, its sheets welded along two seams, cut for the two tracks the pilot chairs run on;
    rubber mats where one stands to conn her."""
    slots = BO.chair_slots()
    _covering(-2.12, X_IN, AFT, FRONT_IN, slots)
    _covering(-X_IN, -2.12, 20.15, FRONT_IN, slots)
    p = part('seam')
    start = len(p.f)
    for x in (-1.45, 1.45):                                                   # the welds between the sheets
        p.polygon([P(x - 0.002, AFT + 0.05, 0.0128), P(x + 0.002, AFT + 0.05, 0.0128), P(x + 0.002, BC.FACE + 0.06, 0.0128), P(x - 0.002, BC.FACE + 0.06, 0.0128)], tint(VINYL, 0.8))
    p.orient(start, UP)
    for x0, x1, a, b in ((-0.55, 0.55, 20.55, 21.40), (0.38, 0.90, 21.55, 22.08), (-0.90, -0.38, 21.55, 22.08)):
        box('rubber', x0, x1, a, b, 0.012, 0.020, MAT, r=0.003)
        n = int((b - a - 0.06) / 0.035)
        for k in range(n):                                                    # the mat's ribs, athwartships
            box('rubber', x0 + 0.02, x1 - 0.02, a + 0.03 + k * 0.035, a + 0.048 + k * 0.035, 0.020, 0.0235, tint(MAT, 1.25), r=0.0012)


WING_SILL = 1.15                      # the top of the outboard bulwark's rail: the sill of the glass over it
WING_HEAD = HEAD_ROOM - 0.05          # the underside of the wing's roof: the wheelhouse's own eave, carried out to her side
WALL_IN = 22.94                       # the inner face of the wing's forward wall: its bulwark was 60 mm thick, and so is the wall over it
WING_POST = 0.10                      # a post between two panes
WING_FRONT = 6                        # panes in the wing's forward wall, and in its outboard one
WING_SIDE = 3
WING_DOOR = (4.30, 5.10)              # the door in the wing's after wall, x from and to: it opens aft, onto the open bridge deck


def _wraked(key, x0, x1, t0, t1, h0, h1, colour):
    """A member of the wing's forward wall, which leans with the wheelhouse's glass: t0 and t1 are how far through the wall
    it lies (0 inside, 1 outside), as _raked has them."""
    th = FRONT_OUT - WALL_IN
    prism(key, x0, x1, [(WALL_IN + th * t0 + fwd(h0), h0), (WALL_IN + th * t1 + fwd(h0), h0), (WALL_IN + th * t1 + fwd(h1), h1), (WALL_IN + th * t0 + fwd(h1), h1)], colour)


def _wing_pane_fore(x0, x1):
    """A pane of the wing's forward wall, between two posts: a steel rail under and over it, the glass in black rubber."""
    a, b = sorted((x0, x1))
    t, g = 0.04, 0.012
    _wraked('wing', a, b, 0.0, 1.0, SILL, SILL + t, HOUSE)
    _wraked('wing', a, b, 0.0, 1.0, HEAD - t, HEAD, HOUSE)
    _wraked('rubber', a, b, 0.30, 0.70, SILL + t, SILL + t + g, RUBBER)
    _wraked('rubber', a, b, 0.30, 0.70, HEAD - t - g, HEAD - t, RUBBER)
    for c, e in ((a, a + g), (b - g, b)):
        _wraked('rubber', c, e, 0.30, 0.70, SILL + t + g, HEAD - t - g, RUBBER)
    yg = lambda h: WALL_IN + 0.03 + fwd(h)
    lo, hi = SILL + t + g - 0.006, HEAD - t - g + 0.006
    part('glass').polygon([P(a + g - 0.006, yg(lo), lo), P(b - g + 0.006, yg(lo), lo), P(b - g + 0.006, yg(hi), hi), P(a + g - 0.006, yg(hi), hi)], GLASS)


def _wing_pane(key_x, yd0, yd1, h0, h1, along):
    """A pane in an upright wall of the wing: `along` is 'yard' for the outboard wall (which stands from key_x[0] to
    key_x[1] across her) or 'x' for the after wall (which stands from key_x[0] to key_x[1] along her; yd0 and yd1 are then
    its x from and to)."""
    t, g = 0.04, 0.012
    u0, u1 = key_x                                                # the wall's two faces
    w = u1 - u0
    def bar(key, a, b, c, e, f0, f1, colour):                      # from a to b along the wall, c to e in height, f0 to f1 through it
        if along == 'yard':
            box(key, u0 + w * f0, u0 + w * f1, a, b, c, e, colour)
        else:
            box(key, a, b, u0 + w * f0, u0 + w * f1, c, e, colour)
    bar('wing', yd0, yd1, h0, h0 + t, 0.0, 1.0, HOUSE)
    bar('wing', yd0, yd1, h1 - t, h1, 0.0, 1.0, HOUSE)
    bar('rubber', yd0, yd1, h0 + t, h0 + t + g, 0.30, 0.70, RUBBER)
    bar('rubber', yd0, yd1, h1 - t - g, h1 - t, 0.30, 0.70, RUBBER)
    for c, e in ((yd0, yd0 + g), (yd1 - g, yd1)):
        bar('rubber', c, e, h0 + t + g, h1 - t - g, 0.30, 0.70, RUBBER)
    m, lo, hi, c, e = u0 + w / 2, h0 + t + g - 0.006, h1 - t - g + 0.006, yd0 + g - 0.006, yd1 - g + 0.006
    ring = [P(m, c, lo), P(m, e, lo), P(m, e, hi), P(m, c, hi)] if along == 'yard' else [P(c, m, lo), P(e, m, lo), P(e, m, hi), P(c, m, hi)]
    part('glass').polygon(ring, GLASS)


def wing(g):
    """
    A bridge wing, closed in. The owner, 12 November 2026, with a photograph of a ferry whose bridge reaches across her
    whole breadth behind one band of windows: "I want the bridge to look like this". The wings were open decks behind a
    bulwark 1.1 m high. They are closed in as a ship's open wings are when she is refitted: the bulwark stays, glass stands
    on it between steel posts, and a roof is carried out over it from the wheelhouse's eave to her side.

      - forward, the bulwark ends at the height of the wheelhouse's own sill, and the wall over it leans forward with the
        wheelhouse's glass: six panes a side, so that one band of windows runs from one side of her to the other;
      - outboard, three panes stand on the bulwark's rail, and the corner is a steel cheek carried into the rake;
      - aft, a wall with a window and a weathertight door, which opens aft onto the open bridge deck;
      - over it a roof at the height of the wheelhouse's eave, whose forward edge is that eave's own line.

    The wheelhouse inside keeps its side walls and its two doors, which now open into the wings.
    """
    side = g['side']
    name = 'port' if side > 0 else 'starboard'
    xo = W + 0.06                                                                                 # the outer face of the outboard bulwark
    box('wingdeck', side * X_OUT, side * W, 19.56, 22.94, 0.0, 0.012, WINGDECK)
    box('wing', side * W, side * xo, 19.56, FRONT_OUT, 0.0, 1.10, HOUSE)                         # the bulwark outboard, from the after wall (which takes the corner)
    box('wing', side * X_OUT, side * W, 22.94, FRONT_OUT, 0.0, SILL, HOUSE)                      # and across the forward end, to the sill
    for yd in (20.1, 20.7, 21.3, 21.9, 22.5):                                                     # its stays
        prism('wing', side * (W - 0.01), side * W, [(yd - 0.004, 0.012), (yd + 0.004, 0.012), (yd + 0.004, 1.10), (yd - 0.004, 1.10)], tint(HOUSE, 0.92))
        prism('wing', side * (W - 0.08), side * W, [(yd - 0.004, 0.012), (yd + 0.004, 0.012), (yd + 0.004, 0.30), (yd - 0.004, 0.30)], tint(HOUSE, 0.92))
    box('wood', side * (W - 0.06), side * (W + 0.09), 19.56, 22.80, 1.10, WING_SILL, WOOD)        # the rail: now the sill of the glass outboard
    box('wood', side * X_OUT, side * 8.96, 22.88, WALL_IN + 0.001, SILL - 0.032, SILL, WOOD, r=0.006)        # and a sill board under the forward glass, as far as the wing station

    # ---- the forward wall over the bulwark: posts and panes, leaning with the wheelhouse's glass; a head to the roof
    first, last = X_OUT + WING_POST, W - WING_POST                                                # the panes stand between these
    pane = (last - first - (WING_FRONT - 1) * WING_POST) / WING_FRONT
    at = X_OUT
    for k in range(WING_FRONT):
        x0 = first + k * (pane + WING_POST)
        _wraked('wing', side * at, side * x0, 0.0, 1.0, SILL, HEAD, HOUSE)                        # the post before this pane
        _wing_pane_fore(side * x0, side * (x0 + pane))
        at = x0 + pane
    _wraked('wing', side * at, side * W, 0.0, 1.0, SILL, HEAD, HOUSE)                             # the last post, against the corner
    head = [(WALL_IN + fwd(HEAD), HEAD), (FRONT_OUT + fwd(HEAD), HEAD), (FRONT_OUT + fwd(HEAD), WING_HEAD), (WALL_IN + fwd(HEAD), WING_HEAD)]
    prism('wing', side * X_OUT, side * W, head, HOUSE)

    # ---- the outboard wall over the rail: an after post, three panes, and the corner's cheek carried into the rake
    cheek = [(22.80, 1.10), (FRONT_OUT + fwd(1.10), 1.10), (FRONT_OUT + fwd(HEAD), HEAD), (FRONT_OUT + fwd(HEAD), WING_HEAD), (22.80, WING_HEAD)]
    prism('wing', side * W, side * xo, cheek, HOUSE)
    faces = tuple(sorted((side * W, side * xo)))
    span = (22.80 - 19.56 - WING_POST - (WING_SIDE - 1) * WING_POST) / WING_SIDE
    at = 19.56
    for k in range(WING_SIDE):
        yd0 = 19.56 + WING_POST + k * (span + WING_POST)
        box('wing', faces[0], faces[1], at, yd0, WING_SILL, HEAD, HOUSE)
        _wing_pane(faces, yd0, yd0 + span, WING_SILL, HEAD, 'yard')
        at = yd0 + span
    box('wing', faces[0], faces[1], 19.56, 22.80, HEAD, WING_HEAD, HOUSE)

    # ---- the after wall: from the house's side to her side, with a window, and a doorway with a coaming for its door
    d0, d1 = WING_DOOR
    aft = (19.50, 19.56)
    def wall(x0, x1, h0, h1):
        a_, b_ = sorted((side * x0, side * x1))
        box('wing', a_, b_, aft[0], aft[1], h0, h1, HOUSE)
    wall(X_OUT, d0, 0.0, WING_HEAD)
    wall(d0, d1, 2.01, WING_HEAD)                                                                 # over the doorway
    wall(d0, d1, 0.0, 0.15)                                                                       # its coaming
    wall(d1, 6.20, 0.0, WING_HEAD)
    wall(6.20, 7.40, 0.0, WING_SILL)                                                              # under and over the window
    wall(6.20, 7.40, HEAD, WING_HEAD)
    wall(7.40, xo, 0.0, WING_HEAD)
    _wing_pane(aft, *sorted((side * 6.20, side * 7.40)), WING_SILL, HEAD, 'x')

    # ---- an angle bar round the head of the walls inside, under the roof: it closes the joint, through which the light
    # traced for the room showed as a bright line where wall and roof meet
    c = 0.04
    for x0, x1, yd0, yd1 in ((W - c, W, 19.56, 22.80), (X_OUT, X_OUT + c, 19.56, 22.94), (X_OUT + c, W - c, 19.56, 19.56 + c),
                             (X_OUT + c, W - c, WALL_IN + fwd(HEAD) - c, WALL_IN + fwd(HEAD))):
        a_, b_ = sorted((side * x0, side * x1))
        box('wing', a_, b_, yd0, yd1, WING_HEAD - c, WING_HEAD, tint(HOUSE, 0.97))
    # ---- the roof, which lifts away with the compass deck: from the house's side to her side, its forward edge the eave's own
    HANGS[0] = True
    for x0, yd0, yd1 in ((X_OUT, 19.47, 23.09), (3.08, 23.09, 23.46)):
        a_, b_ = sorted((side * x0, side * (xo + 0.03)))
        box('wing', a_, b_, yd0, yd1, WING_HEAD, HEAD_ROOM, HOUSE)
    a_, b_ = sorted((side * 3.08, side * (xo + 0.03)))
    prism('wing', a_, b_, [(23.40, WING_HEAD), (23.46, WING_HEAD), (23.46, WING_HEAD - 0.06), (23.44, WING_HEAD - 0.06)], tint(HOUSE, 0.94))
    HANGS[0] = False

    # ---- the door in the after wall: a weathertight leaf hinged on its inboard edge, glazed in its upper half; it opens aft
    mover = f'door-wing-aft-{name[0]}'
    leaf = Part(f'Wheelhouse, wing after door, {name}', 'Deck paint', mover=mover)
    glass = Part(f'Wheelhouse, wing after door glass, {name}', 'Window glass', mover=mover)
    fit = Part(f'Wheelhouse, wing after door hardware, {name}', 'Bronze', mover=mover)
    def lbox(pt, x0, x1, yd0, yd1, h0, h1, colour):
        a_, b_ = sorted((side * x0, side * x1))
        box(pt, a_, b_, yd0, yd1, h0, h1, colour)
    for x0, x1 in ((d0, d0 + 0.04), (d1 - 0.04, d1)):                                             # the frame's two jambs and its head
        lbox('frame', x0, x1, aft[0], aft[1], 0.15, 2.01, FRAME)
    lbox('frame', d0 + 0.04, d1 - 0.04, aft[0], aft[1], 1.97, 2.01, FRAME)
    a, b = d0 + 0.04, d1 - 0.04
    ya, yb = 19.51, 19.55
    lbox(leaf, a, b, ya, yb, 0.15, 0.95, DOOR)
    lbox(leaf, a, b, ya, yb, DOOR_GLASS[1], 1.97, DOOR)
    lbox(leaf, a, a + STILE, ya, yb, DOOR_GLASS[0], DOOR_GLASS[1], DOOR)
    lbox(leaf, b - STILE, b, ya, yb, DOOR_GLASS[0], DOOR_GLASS[1], DOOR)
    glass.polygon([P(side * (a + STILE), 19.53, 0.95), P(side * (b - STILE), 19.53, 0.95), P(side * (b - STILE), 19.53, DOOR_GLASS[1]), P(side * (a + STILE), 19.53, DOOR_GLASS[1])], GLASS)
    for yd, d in ((yb, 1), (ya, -1)):                                                             # a lever handle on both faces, at the free edge
        lbox(fit, b - 0.07, b - 0.04, yd, yd + d * 0.045, 0.98, 1.08, BRASS)
        lbox(fit, b - 0.14, b - 0.04, yd + d * 0.03, yd + d * 0.045, 1.03, 1.06, BRASS)
    for hh in (0.35, 1.80):                                                                       # its hinges, on the inboard jamb
        tube(fit, (side * a, 19.505, hh - 0.06), (side * a, 19.505, hh + 0.06), 0.016, BRASS, 10)
    for q in (leaf, glass, fit):
        q.group = 'bridge'
        EXTRA.append(q)
    MOTIONS.append(dict(id=mover, name=f'Door from the open bridge deck to the {name} wing', pivot=[side * a, 0.0, BP.Z(19.505)], ratio=1.0 * side, max=100,
                        at=[side * (d0 + d1) / 2, DECK, BP.Z(19.53)], normal=[0, 0, 1]))


# =====================================================================================================================
# Doors
# =====================================================================================================================
def door_wing(g, tag):
    """A weathertight door in the house side: a lining, a 0.15 m coaming sill, a leaf hinged on its forward edge that opens outward.
    The opening is 2.01 m high and the leaf is glazed from 0.95 to 1.95 m: a tall helmsman sees abeam through it."""
    side, (yd0, yd1) = g['side'], g['yd']
    name = 'port' if side > 0 else 'starboard'
    mover = f'door-wing-{name[0]}'
    xi, xo = side * X_IN, side * X_OUT
    for a, b in ((yd0, yd0 + 0.04), (yd1 - 0.04, yd1)):
        box('frame', xi, xo, a, b, 0.15, 2.01, FRAME)
    box('frame', xi, xo, yd0, yd1, 2.01, 2.05, FRAME)
    box('paint', side * 2.88, side * 3.07, yd0, yd1, 0.004, 0.15, SILLC)       # its foot in the deck covering, not in one plane with the covering's underside
    leaf = Part(f'Wheelhouse, wing door, {name}', 'Deck paint', mover=mover)
    glass = Part(f'Wheelhouse, wing door glass, {name}', 'Window glass', mover=mover)
    fit = Part(f'Wheelhouse, wing door hardware, {name}', 'Bronze', mover=mover)
    a, b = yd0 + 0.04, yd1 - 0.04
    xa, xb = side * 2.95, side * 2.99
    box(leaf, xa, xb, a, b, 0.15, 0.95, DOOR)
    box(leaf, xa, xb, a, b, DOOR_GLASS[1], 2.01, DOOR)
    box(leaf, xa, xb, a, a + STILE, DOOR_GLASS[0], DOOR_GLASS[1], DOOR)
    box(leaf, xa, xb, b - STILE, b, DOOR_GLASS[0], DOOR_GLASS[1], DOOR)
    box(leaf, side * 2.99, side * 3.005, a + 0.01, b - 0.01, 0.15, 0.31, tint(DOOR, 0.55))
    glass.polygon([P(side * 2.97, a + STILE, 0.95), P(side * 2.97, b - STILE, 0.95), P(side * 2.97, b - STILE, DOOR_GLASS[1]), P(side * 2.97, a + STILE, DOOR_GLASS[1])], GLASS)
    for xs, d in ((side * 2.99, 1), (side * 2.95, -1)):
        box(fit, xs, xs + side * d * 0.045, a + 0.03, a + 0.06, 0.98, 1.08, BRASS)
        box(fit, xs + side * d * 0.03, xs + side * d * 0.05, a + 0.015, a + 0.12, 1.03, 1.06, BRASS)
    for hh in (0.35, 1.80):
        tube(fit, (side * 2.97, b, hh - 0.06), (side * 2.97, b, hh + 0.06), 0.016, BRASS, 10)
    for p in (leaf, glass, fit):
        p.group = 'bridge'
        EXTRA.append(p)
    MOTIONS.append(dict(id=mover, name=f'Door to the {name} wing', pivot=[side * 2.97, 0.0, BP.Z(b)], ratio=-1.0 * side, max=100,
                        at=[side * 3.0, DECK, BP.Z((yd0 + yd1) / 2)], normal=[side, 0, 0]))


def door_corridor(g, tag):
    """The door from the crew corridor, in the aft wall's opening: hinged to starboard, it opens into the wheelhouse."""
    mover = 'door-corridor'
    for sx in (-1, 1):
        box('frame', sx * 0.40, sx * 0.36, 19.46, 19.545, 0.0, 1.92, FRAME)
    box('frame', -0.40, 0.40, 19.46, 19.545, 1.88, 1.92, FRAME)
    leaf = Part('Wheelhouse, corridor door', 'Lining', mover=mover)
    fit = Part('Wheelhouse, corridor door hardware', 'Shaft steel', mover=mover)
    glass = Part('Wheelhouse, corridor door glass', 'Window glass', mover=mover)
    cream = JOINERY
    box(leaf, -0.355, 0.355, 19.50, 19.54, 0.02, 1.40, cream)
    box(leaf, -0.355, 0.355, 19.50, 19.54, 1.66, 1.875, cream)
    box(leaf, -0.355, -0.13, 19.50, 19.54, 1.40, 1.66, cream)
    box(leaf, 0.13, 0.355, 19.50, 19.54, 1.40, 1.66, cream)
    box(leaf, -0.35, 0.35, 19.54, 19.546, 0.02, 0.22, tint(STEEL, 0.9))                # a kick plate
    glass.polygon([P(-0.13, 19.52, 1.40), P(0.13, 19.52, 1.40), P(0.13, 19.52, 1.66), P(-0.13, 19.52, 1.66)], GLASS)
    for yd, d in ((19.54, 1), (19.50, -1)):                                           # a lever handle on both faces, at the free edge
        box(fit, 0.26, 0.30, yd, yd + d * 0.04, 0.98, 1.06, GREY)
        box(fit, 0.17, 0.30, yd + d * 0.03, yd + d * 0.045, 1.02, 1.04, GREY)
    for hh in (0.3, 1.6):
        tube(fit, (-0.365, 19.535, hh - 0.05), (-0.365, 19.535, hh + 0.05), 0.012, GREY, 8)
    for p in (leaf, fit, glass):
        p.group = 'bridge'
        EXTRA.append(p)
    MOTIONS.append(dict(id=mover, name='Door from the corridor to the wheelhouse', pivot=[-0.365, 0.0, BP.Z(19.535)], ratio=-1.0, max=92,
                        at=[0.0, DECK, BP.Z(19.50)], normal=[0, 0, 1]))


# =====================================================================================================================
# The wings
# =====================================================================================================================
def wing_console(g, tag, x, yard, h):
    """
    A wing control station: a pedestal 0.63 m wide against the wing's forward bulwark, at its outboard end. The levers are
    outboard, where the person berthing her stands: from there the eye is far enough out to see past the house's forward
    corner to 45 degrees on the opposite bow (SOLAS V/22.1.4; the yard's calculation JS4-402 found the first station,
    across the whole wing with its levers inboard, 13.5 degrees short). The levers stand in the order they have on the
    console, port engine to port, on both wings.

    What is worked is at the hand and low, what is read is beyond it and higher (the owner, 12 November 2026: "some levers
    are blocking some panels": the two dials lay in the sloping top behind the thruster's lever, whose grip stood before
    them). The three control heads stand in one row in the after part of the top, sunk until their plates are just over
    it; forward of them the top rises in an upright face that leans back 20 degrees to the eye, and the two dials are set
    in it, the rudder angle over the thruster's lever and the revolutions over the engines': each is read over the grips
    from anywhere abaft the station. (It had a low windscreen of its own on the face's top while the wing was open; the
    wing's own glass stands before it now.)
    """
    side = g['side']
    x0, x1, y0, y1 = abs(x) - 0.315, abs(x) + 0.315, yard - 0.17, yard + 0.17
    xa, xb = sorted((side * x0, side * x1))
    at = lambda u: side * (x0 + u)                                   # u metres from the pedestal's inboard edge
    slope = (0.98 - 0.88) / (y1 + 0.02 - (y0 + 0.14))                # the top rises this much a metre forward of the lip
    c20, s20 = cos(radians(20)), sin(radians(20))
    yf = y0 + 0.24                                                   # the face's foot on the sloping top
    hf = 0.88 + (yf - (y0 + 0.14)) * slope
    face = 0.215                                                     # the face's length up its lean
    ft = hf + face * c20                                             # its top
    box('console', xa, xb, y0 + 0.03, y1 - 0.03, 0.012, 0.10, FRAME)
    box('console', xa, xb, y0, y1, 0.10, 0.82, GREEN)
    prism('console', xa - 0.01, xb + 0.01, [(y0 - 0.02, 0.82), (y1 + 0.02, 0.82), (y1 + 0.02, ft), (yf + face * s20, ft), (yf, hf), (y0 + 0.14, 0.88)], tint(GREEN, 1.08))
    # Three control heads of three-quarter size in one row, sunk into the top: the two engines outboard, fore and aft, the
    # thruster inboard, across. Their plates stand at one height, 9 mm over the top at the engines' forward end. Each lever
    # moves with its fellow on the console and on the other wing.
    where = 'Port wing' if side > 0 else 'Starboard wing'
    tail = '-wp' if side > 0 else '-ws'
    row, base = y0 + 0.10, 0.844
    for u, col, name, works in zip((0.56, 0.44) if side > 0 else (0.44, 0.56), (RED, GREENLENS), ('port engine lever', 'starboard engine lever'), ('lever-engine-p', 'lever-engine-s')):
        BC.control_head(f'{where}, {name}', works + tail, works, at(u), row, base, col, s=0.77, sink=0.05)
    BC.control_head(f'{where}, bow thruster lever', 'lever-thruster' + tail, 'lever-thruster', at(0.20), row, base, BLUE, across=True, s=0.77, sink=0.05)
    # The two dials in the upright face, each in line ahead of the lever it answers: its brass bezel, its picture under it.
    nrm = Vector((0.0, s20, -c20))                                   # the face looks aft and a little up
    upv = Vector((0.0, c20, s20))
    for u, name in ((0.20, 'rai'), (0.50, 'rpm')):
        ys, hs = yf + 0.110 * s20, hf + 0.110 * c20
        c = Vector(P(at(u), ys, hs))
        part('brass').tube(tuple(c), tuple(c + nrm * 0.012), 0.072, colour=BRASS, sides=20)
        disc((at(u), ys, hs), tuple(nrm), tuple(upv), 0.062, name, proud=0.0135)
    # the watch alarm's reset and the whistle push on the lip, between the thruster's head and the engines'
    lip = Vector((0.0, 1.0, -0.375)).normalized()
    for dy, col in ((0.06, BLUE), (0.125, RED)):
        c = Vector(P(at(0.33), y0 + dy, 0.82 + (dy + 0.02) * 0.375))
        part('plastic').tube(tuple(c), tuple(c + lip * 0.022), 0.016, colour=col, sides=12)


def sidelight(g, tag, x, yard, h):
    """A sidelight on the wing's roof at its outer end (it stood on the bulwark's rail while the wing was open): the lantern
    on a short post, and inboard of it the screen that cuts its light off across the bow. `h` is the lantern's foot."""
    side = g['side']
    xo = side * (W + 0.03)
    foot = h - 0.05                                                    # the roof's top
    box('top_dark', xo - 0.035, xo + 0.035, yard - 0.035, yard + 0.035, foot, h + 0.02, STAND)
    tube('top_dark', (xo, yard, h + 0.02), (xo, yard, h + 0.06), 0.07, DARK, 16)
    tube('top_lens', (xo, yard, h + 0.06), (xo, yard, h + 0.19), 0.062, RED if side > 0 else GREENLENS, 16)
    tube('top_dark', (xo, yard, h + 0.19), (xo, yard, h + 0.23), 0.072, DARK, 16)
    # the screen: matt black, inboard of the lantern, 0.9 m long forward of it
    box('top_dark', xo - side * 0.085, xo - side * 0.10, yard - 0.10, yard + 0.72, foot, h + 0.26, BLACK)
    box('top_dark', xo - side * 0.10, xo + side * 0.03, yard - 0.10, yard - 0.085, foot, h + 0.26, BLACK)


def epirb(g, tag, x, yard, h):
    box('steel', -X_OUT, -X_OUT - 0.035, yard - 0.07, yard + 0.07, 1.42, 1.82, GREY)
    tube('plastic', (x, yard, 1.48), (x, yard, 1.74), 0.062, ORANGE, 16)
    tube('plastic', (x, yard, 1.74), (x, yard, 1.80), 0.04, srgb(0xdfe6e1), 14)
    for hh in (1.55, 1.68):
        tube('steel', (x - 0.07, yard, hh), (x, yard, hh), 0.012, GREY, 8)


def oval_ring(p, centre, side, R, a, b, colour, n=96, m=32):
    """A ring that lies against a wall which looks athwartships, its face toward whoever stands inboard of it: its section an
    oval, `a` across (along the ring's radius) and `b` thick. `colour` is one colour or a function of the length's number
    (0 to n - 1, counted anticlockwise from the right as it is looked at). Lit smooth."""
    c = Vector(P(*centre))
    e_a = Vector((-side, 0.0, 0.0))                                           # toward the eye
    rows = []
    for i in range(n):
        t = 2 * pi * i / n
        e_r = Vector((0.0, sin(t), side * cos(t)))                            # outward along the radius: right is forward to port, aft to starboard
        row = []
        for k in range(m):
            q = 2 * pi * k / m
            nrm = (e_r * (cos(q) / a) + e_a * (sin(q) / b)).normalized()
            row.append(p.vert(tuple(c + e_r * (R + a * cos(q)) + e_a * (b * sin(q))), tuple(nrm)))
        rows.append(row)
    start = len(p.f)
    for i in range(n):
        ra, rb = rows[i], rows[(i + 1) % n]
        col = colour(i) if callable(colour) else colour
        for k in range(m):
            j = (k + 1) % m
            p.face((ra[k], ra[j], rb[j], rb[k]), col, smooth=True)

    def away(q):
        v = Vector(q) - c
        v.x = 0.0
        v.normalize()
        return Vector(q) - (c + v * R)
    p.orient(start, away)


def in_pieces(tri, longest):
    """A flat triangle (three (u, v) points) as smaller ones, none with an edge longer than `longest`."""
    out, todo = [], [tuple(tri)]
    while todo:
        a_, b_, c_ = todo.pop()
        if max(hypot(a_[0] - b_[0], a_[1] - b_[1]), hypot(b_[0] - c_[0], b_[1] - c_[1]), hypot(c_[0] - a_[0], c_[1] - a_[1])) <= longest:
            out.append((a_, b_, c_))
            continue
        ab, bc, ca = ((a_[0] + b_[0]) / 2, (a_[1] + b_[1]) / 2), ((b_[0] + c_[0]) / 2, (b_[1] + c_[1]) / 2), ((c_[0] + a_[0]) / 2, (c_[1] + a_[1]) / 2)
        todo += [(a_, ab, ca), (ab, b_, bc), (ca, bc, c_), (ab, bc, ca)]
    return out


def at_ring(centre, side, r, t, lift=0.0):
    """A point on such a ring's middle plane: r from its centre, at the angle t (anticlockwise from the right as it is looked at)."""
    cx, cy, cz = P(*centre)
    return (cx - side * lift, cy + r * sin(t), cz + side * r * cos(t))


def pelorus(g, tag, x, yard, h):
    """
    A bearing repeater on its pelorus stand, as one meets it on a bridge wing: a column bolted to the deck by a flange; a
    junction box on the column with the cable that comes up from the deck; a brass fork on the column's head; in the fork a
    gimbal ring, and in the ring the weighted bowl, so that the card lies level when she rolls; the card under glass in a
    bezel; and on the bezel the azimuth circle, turned by hand, with its two sight vanes (the far one a wire in a frame,
    the near one a slit) and two knobs to turn it by.
    """
    side = g['side']
    white, brass, steel, dark = part('wing'), part('brass'), part('steel'), part('dark')
    # ---- the foot and the column
    tube('wing', (x, yard, 0.012), (x, yard, 0.030), 0.170, tint(HOUSE, 0.88))
    for k in range(6):
        a = pi / 6 + k * pi / 3
        bx, by = x + 0.140 * cos(a), yard + 0.140 * sin(a)
        tube('steel', (bx, by, 0.030), (bx, by, 0.033), 0.017, GREY)                                  # a washer
        tube('steel', (bx, by, 0.033), (bx, by, 0.043), 0.011, STEEL)                                 # and its bolt's head
    tube('wing', (x, yard, 0.030), (x, yard, 0.080), 0.098, tint(HOUSE, 0.94), r2=0.077)              # the weld's taper
    tube('wing', (x, yard, 0.080), (x, yard, 1.020), 0.076, HOUSE, r2=0.056)
    tube('wing', (x, yard, 1.020), (x, yard, 1.050), 0.066, tint(HOUSE, 0.94))
    # ---- the junction box on the column's after side, its lid's four screws, its gland and the cable from the deck
    grey = srgb(0x8d9496)
    box('dark', x - 0.060, x + 0.060, yard - 0.128, yard - 0.060, 0.50, 0.66, grey, r=0.006)
    box('dark', x - 0.054, x + 0.054, yard - 0.134, yard - 0.128, 0.506, 0.654, tint(grey, 0.93), r=0.002)   # its lid
    for sx, hh in ((-0.046, 0.514), (0.046, 0.514), (-0.046, 0.646), (0.046, 0.646)):
        tube('steel', (x + sx, yard - 0.134, hh), (x + sx, yard - 0.137, hh), 0.0035, STEEL)
    tube('brass', (x, yard - 0.094, 0.50), (x, yard - 0.094, 0.470), 0.013, BRASS)                    # the gland under it
    tube('brass', (x, yard - 0.094, 0.470), (x, yard - 0.094, 0.462), 0.010, tint(BRASS, 0.8))
    part('plastic').rod([P(x, yard - 0.094, 0.465), P(x, yard - 0.094, 0.20), P(x, yard - 0.150, 0.06), P(x, yard - 0.190, 0.035), P(x, yard - 0.190, 0.012)], 0.0065, BLACK)
    tube('brass', (x, yard - 0.190, 0.012), (x, yard - 0.190, 0.040), 0.014, BRASS)                   # the deck gland the cable comes up through
    # the dimmer for the card's lamp, on the column's inboard side
    tube('dark', (x - side * 0.060, yard, 0.92), (x - side * 0.074, yard, 0.92), 0.020, BLACK)
    tube('dark', (x - side * 0.074, yard, 0.92), (x - side * 0.090, yard, 0.92), 0.013, srgb(0x3a4042))
    # ---- the fork, the gimbal ring and the bowl
    box('brass', x - 0.168, x + 0.168, yard - 0.020, yard + 0.020, 1.050, 1.068, BRASS, r=0.004)
    for sx in (-1, 1):
        box('brass', x + sx * 0.151, x + sx * 0.168, yard - 0.020, yard + 0.020, 1.064, 1.222, BRASS, r=0.004)
        tube('brass', (x + sx * 0.174, yard, 1.200), (x + sx * 0.136, yard, 1.200), 0.0065, tint(BRASS, 0.85))      # the ring's pivot through the arm
        brass.ball(P(x + sx * 0.176, yard, 1.200), 0.011, BRASS)
    brass.ring(P(x, yard, 1.200), UP, 0.137, 0.0075, BRASS)
    for sy in (-1, 1):
        tube('brass', (x, yard + sy * 0.138, 1.200), (x, yard + sy * 0.124, 1.200), 0.0065, tint(BRASS, 0.85))      # the bowl's pivots in the ring
    tube('brass', (x, yard, 1.072), (x, yard, 1.096), 0.046, tint(BRASS, 0.78))                                  # the weight that keeps it upright
    tube('brass', (x, yard, 1.096), (x, yard, 1.200), 0.062, BRASS, r2=0.126)
    disc((x, yard, 1.200), UP, FWD, 0.117, 'card', sides=56)
    tube('glass', (x, yard, 1.2050), (x, yard, 1.2080), 0.119, GLASS)
    brass.ring(P(x, yard, 1.2080), UP, 0.1225, 0.0065, BRASS)                                                     # the bezel
    # ---- the azimuth circle: a ring that turns on the bezel, with the far vane, the near vane and two knobs
    old = tint(BRASS, 0.86)
    brass.ring(P(x, yard, 1.2165), UP, 0.1290, 0.0045, old)
    f = yard + 0.129                                                                                              # the far vane: a wire in a frame
    for sx in (-1, 1):
        box('brass', x + sx * 0.0125 - 0.0022, x + sx * 0.0125 + 0.0022, f - 0.0022, f + 0.0022, 1.2165, 1.332, old)
    box('brass', x - 0.0147, x + 0.0147, f - 0.0022, f + 0.0022, 1.3276, 1.332, old)
    tube('steel', (x, f, 1.2165), (x, f, 1.3280), 0.0008, BLACK)
    n = yard - 0.129                                                                                              # the near vane: a slit to look through
    for sx in (-1, 1):
        box('brass', x + sx * 0.0075 - 0.0060, x + sx * 0.0075 + 0.0060, n - 0.0022, n + 0.0022, 1.2165, 1.300, old)
    box('brass', x - 0.0135, x + 0.0135, n - 0.0022, n + 0.0022, 1.2956, 1.300, old)
    box('dark', x - 0.016, x + 0.016, n - 0.011, n + 0.011, 1.2165, 1.238, BLACK, r=0.003)                          # the prism's housing at its foot
    for sx in (-1, 1):
        tube('brass', (x + sx * 0.129, yard, 1.2165), (x + sx * 0.129, yard, 1.2330), 0.0095, old)
        brass.ball(P(x + sx * 0.129, yard, 1.2335), 0.0105, old, squash=0.6)


def lifebuoy(g, tag, x, yard, h):
    """
    A lifebuoy as it hangs on a ship: an oval-sectioned ring in orange with four reflective bands, her name over its top
    and her port under it, a grab line round the outside in four bights, in a bracket of flat and round bar bolted to the
    bulwark (a clip over the top, a hook under each lower quarter). Beside it the man-overboard light and smoke float in its
    own clamps, made fast to the ring by a lanyard: thrown together from the wing.
    """
    side = g['side']
    R, a, b = 0.300, 0.080, 0.050
    xc = side * (W - 0.075)
    centre = (xc, yard, h)
    band = lambda i: abs(((i + 0.5) * 360.0 / 96 + 45.0) % 90.0 - 45.0) > 41.0
    oval_ring(part('plastic'), centre, side, R, a, b, lambda i: tint(WHITE, 0.98) if band(i) else ORANGE)
    # ---- her name and her port, painted on the ring's face and following it round
    for text, top in ((S.NAME, True), (S.PORT_OF_REGISTRY, False)):
        pts, tris, width = lettering(text, 0.052)
        paint = part('seam')

        def onto(u, v):
            r, t = (R - 0.026 + v, pi / 2 - (u - width / 2) / R) if top else (R + 0.026 - v, 3 * pi / 2 + (u - width / 2) / R)
            lift = b * max(0.0, 1.0 - ((r - R) / a) ** 2) ** 0.5 + 0.0006
            return paint.vert(at_ring(centre, side, r, t, lift))
        first = len(paint.f)
        for tri in tris:
            # A letter is paint on a curved face: a flat piece of it would cut under the curve, so each is laid on in
            # pieces no longer than 5 mm, every corner on the ring.
            for piece in in_pieces([pts[i] for i in tri], 0.005):
                paint.face(tuple(onto(*q) for q in piece), BLACK)
        paint.orient(first, (-side, 0, 0))
    # ---- the grab line: made fast under each band, hanging in a bight between
    rope = part('plastic')
    for k in range(4):
        t0, t1 = radians(45 + 90 * k + 5), radians(135 + 90 * k - 5)
        pts = []
        for i in range(15):
            u = i / 14
            pts.append(at_ring(centre, side, R + a + 0.0035 + 0.085 * sin(pi * u) ** 0.8, t0 + (t1 - t0) * u))
        rope.rod(pts, 0.0048, srgb(0xf4f1e6))
    # ---- its bracket: an upright of flat bar on the bulwark with a cross bar, a clip over the ring's top, a hook under each lower quarter
    box('steel', side * W, side * (W - 0.006), yard - 0.025, yard + 0.025, h - 0.44, h + 0.44, GREY, r=0.002)
    box('steel', side * W, side * (W - 0.006), yard - 0.24, yard + 0.24, h - 0.285, h - 0.245, GREY, r=0.002)
    for hh in (h - 0.40, h + 0.40):
        tube('steel', (side * (W - 0.006), yard, hh), (side * (W - 0.012), yard, hh), 0.009, STEEL)                 # the bolts through the bulwark
    out = xc - side * (b + 0.016)                                                                                   # just inboard of the ring's face
    top = h + R + a + 0.0045
    part('steel').rod([P(side * W, yard, top), P(out, yard, top), P(out, yard, top - 0.045)], 0.0055, STEEL)
    for sy in (-1, 1):
        low = h - (R + a) * cos(radians(30)) - 0.0045
        yq = yard + sy * (R + a) * sin(radians(30))
        part('steel').rod([P(side * W, yq, h - 0.265), P(side * W - side * 0.02, yq, low), P(out, yq, low), P(out, yq, low + 0.045)], 0.0055, STEEL)
    # ---- the light and smoke float, forward of it: its canister, its lamp, its two clamps, its lanyard to the ring
    yc = yard + 0.50
    tube('dark', (xc, yc, 0.285), (xc, yc, 0.315), 0.0585, BLACK)                                                   # its weighted foot
    tube('plastic', (xc, yc, 0.315), (xc, yc, 0.660), 0.055, ORANGE)
    tube('plastic', (xc, yc, 0.455), (xc, yc, 0.545), 0.0565, YELLOW)                                               # its instruction band
    tube('plastic', (xc, yc, 0.660), (xc, yc, 0.695), 0.055, ORANGE, r2=0.034)
    tube('dark', (xc, yc, 0.695), (xc, yc, 0.708), 0.036, BLACK)
    part('lens').ball(P(xc, yc, 0.708), 0.033, WHITE_LAMP, squash=0.85)
    for hh in (0.375, 0.605):
        part('steel').ring(P(xc, yc, hh), UP, 0.0585, 0.0045, STEEL)
        box('steel', side * W, side * (W - 0.024), yc - 0.020, yc + 0.020, hh - 0.012, hh + 0.012, GREY, r=0.002)
        box('steel', side * (W - 0.118), side * (W - 0.134), yc - 0.012, yc + 0.012, hh - 0.010, hh + 0.010, STEEL, r=0.002)   # the clamp's catch
    part('plastic').rod([P(xc - side * 0.030, yc, 0.700), P(xc - side * 0.040, yc - 0.030, 0.800), P(xc - side * 0.030, yc - 0.075, 0.740),
                         at_ring(centre, side, R + a + 0.002, 0.0)], 0.003, ORANGE)


def hydrant(g, tag, x, yard, h):
    """
    A fire hydrant on the wing: a riser up through the deck in a bolted flange, clamped to the house side; an angle valve
    with its bonnet, gland and handwheel; the outlet looking down and outboard with a brass hose coupling and its cap on a
    chain.
    """
    red = srgb(0xb8342a)
    px = x + 0.06
    paint, brass, steel = part('paint'), part('brass'), part('steel')
    tube('paint', (px, yard, 0.012), (px, yard, 0.030), 0.085, red)
    for k in range(4):
        a = pi / 4 + k * pi / 2
        tube('steel', (px + 0.066 * cos(a), yard + 0.066 * sin(a), 0.030), (px + 0.066 * cos(a), yard + 0.066 * sin(a), 0.040), 0.009, STEEL)
    tube('paint', (px, yard, 0.030), (px, yard, h - 0.045), 0.032, red)
    # the clamp that holds the riser to the house side
    box('steel', X_OUT, px - 0.030, yard - 0.020, yard + 0.020, 0.300, 0.318, GREY, r=0.003)
    steel.ring(P(px, yard, 0.309), UP, 0.0345, 0.0055, GREY)
    # the valve: body, bonnet, gland nut, stem, handwheel
    paint.ball(P(px, yard, h), 0.062, red)
    tube('paint', (px, yard, h + 0.045), (px, yard, h + 0.060), 0.058, red)                                         # the bonnet's flange
    tube('paint', (px, yard, h + 0.060), (px, yard, h + 0.130), 0.038, red, r2=0.030)
    tube('brass', (px, yard, h + 0.130), (px, yard, h + 0.156), 0.021, BRASS)
    tube('steel', (px, yard, h + 0.156), (px, yard, h + 0.262), 0.0075, STEEL)
    paint.ring(P(px, yard, h + 0.236), UP, 0.085, 0.0085, red)
    tube('paint', (px, yard, h + 0.224), (px, yard, h + 0.248), 0.021, red)
    for k in range(4):
        a = pi / 4 + k * pi / 2
        tube('paint', (px + 0.018 * cos(a), yard + 0.018 * sin(a), h + 0.236), (px + 0.084 * cos(a), yard + 0.084 * sin(a), h + 0.236), 0.0065, red)
    tube('brass', (px, yard, h + 0.248), (px, yard, h + 0.262), 0.013, BRASS)                                       # the nut on the stem
    # the outlet, 30 degrees down and outboard, its coupling and its cap on a chain
    ox, oh = cos(radians(30)), -sin(radians(30))
    along = lambda d: (px + ox * d, yard, h + oh * d)
    tube('paint', along(0.030), along(0.125), 0.036, red)
    tube('brass', along(0.125), along(0.137), 0.047, BRASS)
    tube('brass', along(0.137), along(0.170), 0.040, BRASS)
    tube('brass', along(0.170), along(0.192), 0.049, tint(BRASS, 0.9))                                              # the cap
    tube('brass', along(0.192), along(0.200), 0.020, tint(BRASS, 0.8))
    for sy in (-1, 1):                                                                                             # the coupling's two lugs
        box('brass', along(0.150)[0] - 0.008, along(0.150)[0] + 0.008, yard + sy * 0.038, yard + sy * 0.056, along(0.150)[2] - 0.008, along(0.150)[2] + 0.008, BRASS, r=0.002)
    cx, _, ch = along(0.196)
    steel.rod([P(cx, yard, ch), P(cx - 0.02, yard + 0.03, ch - 0.10), P(px + 0.04, yard + 0.04, ch - 0.16), P(px + 0.030, yard + 0.012, h - 0.20)], 0.0025, GREY)


def hosebox(g, tag, x, yard, h):
    """
    The fire hose box beside the hydrant, on the house side: a steel cabinet on two brackets, its door on two hinges with
    a quarter-turn catch (it opens to a tap), and in it what the sign says: the hose rolled on a peg with its coupling, the
    nozzle in its clips, the hydrant's spanner on a hook.
    """
    red, dark_red = srgb(0xb8342a), srgb(0x8f2a22)
    x0, x1, t = X_OUT, X_OUT + 0.22, 0.004
    ya, yb, h1 = yard - 0.26, yard + 0.26, h + 0.62
    box('paint', x0, x0 + t, ya, yb, h, h1, red, r=0.001)                                                           # its back, on the house side
    box('paint', x0, x1 - 0.008, ya, ya + t, h, h1, red, r=0.001)
    box('paint', x0, x1 - 0.008, yb - t, yb, h, h1, red, r=0.001)
    box('paint', x0, x1 - 0.008, ya, yb, h, h + t, red, r=0.001)
    box('paint', x0, x1 - 0.008, ya, yb, h1 - t, h1, red, r=0.001)
    for yq in (yard - 0.18, yard + 0.18):                                                                           # two brackets under it, on the house side
        box('steel', x0, x0 + 0.18, yq - 0.015, yq + 0.015, h - 0.012, h, GREY, r=0.002)
        box('steel', x0, x0 + 0.012, yq - 0.015, yq + 0.015, h - 0.13, h - 0.012, GREY, r=0.002)
    # ---- inside: the hose rolled flat on a peg, its coupling, the nozzle in two clips, the spanner on a hook
    canvas, inner = srgb(0xd9d2bd), part('plastic')
    xm = x0 + 0.090
    peg_h = h + 0.400
    tube('steel', (x0 + t, yard, peg_h), (x0 + 0.150, yard, peg_h), 0.020, GREY)
    tube('steel', (x0 + 0.150, yard, peg_h), (x0 + 0.156, yard, peg_h), 0.030, GREY)                                 # the peg's end plate keeps the roll on
    R0, turns, pitch, ha, hb = 0.070, 8, 0.0175, 0.0092, 0.033
    coil = (xm, yard, peg_h - (R0 - ha - 0.020) + 0.001)                                                            # the roll hangs on the peg by its innermost turn
    for k in range(turns):
        oval_ring(inner, coil, -1, R0 + k * pitch, ha, hb, tint(canvas, 0.94 + 0.02 * (k % 3)), n=72, m=20)
    ro = R0 + (turns - 1) * pitch
    tube('brass', (xm, yard + 0.02, coil[2] - ro - 0.006), (xm, yard + 0.085, coil[2] - ro - 0.006), 0.036, BRASS)   # the coupling on the roll's outer end
    tube('brass', (xm, yard + 0.085, coil[2] - ro - 0.006), (xm, yard + 0.097, coil[2] - ro - 0.006), 0.043, BRASS)
    ny = yb - 0.045                                                                                                # the nozzle, upright at the forward side
    tube('brass', (xm, ny, h + 0.105), (xm, ny, h + 0.150), 0.030, BRASS)
    tube('paint', (xm, ny, h + 0.150), (xm, ny, h + 0.300), 0.024, dark_red)
    tube('brass', (xm, ny, h + 0.300), (xm, ny, h + 0.420), 0.024, BRASS, r2=0.013)
    tube('brass', (xm, ny, h + 0.420), (xm, ny, h + 0.436), 0.017, tint(BRASS, 0.85))
    for hh in (h + 0.180, h + 0.340):
        box('steel', x0 + t, xm + 0.004, ny - 0.006, ny + 0.006, hh - 0.008, hh + 0.008, GREY, r=0.002)              # its clips, from the back
    box('steel', x0 + t, xm + 0.030, ny - 0.030, ny + 0.030, h + 0.094, h + 0.105, GREY, r=0.002)                    # and the shelf its foot stands on
    sy = ya + 0.040                                                                                                # the spanner, hung on a hook at the after side
    tube('steel', (x0 + t, sy, h + 0.500), (x0 + 0.050, sy, h + 0.500), 0.004, GREY)
    box('steel', x0 + 0.030, x0 + 0.038, sy - 0.014, sy + 0.014, h + 0.210, h + 0.515, STEEL, r=0.002)
    part('steel').ring(P(x0 + 0.034, sy, h + 0.200), PORT, 0.022, 0.0045, STEEL, sweep=(radians(200), radians(520)))
    # ---- the door: a pan with a rim, hinged at its after edge, the sign on it, a quarter-turn catch at its forward edge
    mover = 'hose-box-p' if x > 0 else 'hose-box-s'
    M = moving('Fire hose box, door', mover, leaf='Deck paint', fit='Shaft steel', sign='Panel face')
    leaf, fit = M['leaf'], M['fit']
    box(leaf, x1 - 0.008, x1 - 0.004, ya + 0.002, yb - 0.002, h + 0.002, h1 - 0.002, red, r=0.001)
    for (qa, qb, ha_, hb_) in ((ya + 0.002, yb - 0.002, h + 0.002, h + 0.022), (ya + 0.002, yb - 0.002, h1 - 0.022, h1 - 0.002),
                               (ya + 0.002, ya + 0.022, h + 0.022, h1 - 0.022), (yb - 0.022, yb - 0.002, h + 0.022, h1 - 0.022)):
        box(leaf, x1 - 0.004, x1, qa, qb, ha_, hb_, tint(red, 0.94), r=0.0015)                                      # the rim that stiffens it
    c, n, u = Vector(P(x1 - 0.004, yard, h + 0.44)) + Vector((0.0012, 0, 0)), Vector(PORT), Vector(UP)
    r = u.cross(n)
    M['sign'].picture([tuple(c - r * 0.20 - u * 0.075), tuple(c + r * 0.20 - u * 0.075), tuple(c + r * 0.20 + u * 0.075), tuple(c - r * 0.20 + u * 0.075)], 'hose')
    for hh in (h + 0.12, h + 0.50):                                                                                # two hinges
        tube(fit, (x1 + 0.0015, ya - 0.006, hh - 0.035), (x1 + 0.0015, ya - 0.006, hh + 0.035), 0.0065, STEEL)
        box(fit, x1, x1 + 0.003, ya - 0.004, ya + 0.040, hh - 0.030, hh + 0.030, STEEL, r=0.0)      # its leaf lies on the door's rim, not in it
    ky, kh = yb - 0.040, h + 0.31                                                                                  # the catch
    tube(fit, (x1, ky, kh), (x1 + 0.010, ky, kh), 0.018, STEEL)
    box(fit, x1 + 0.010, x1 + 0.018, ky - 0.008, ky + 0.008, kh - 0.045, kh + 0.012, STEEL, r=0.003)
    MOTIONS.append(dict(id=mover, name='Fire hose box', pivot=[x1 + 0.0015, 0.0, BP.Z(ya - 0.006)], ratio=1.0, max=105,
                        at=[x1, DECK + h + 0.31, BP.Z(yard)], normal=[1, 0, 0], auto='tap', reach=1.8))


# ---- The pantry. The owner, 11 November 2026: "we need a cooler and a coffee pot too". On the starboard side, forward of the
# wing door, under the side window and wholly below its sill (0.95 m), so nothing of it stands in the view abeam: a unit
# 0.80 m long and 0.46 m deep with two bays. In the after bay the cooler; in the forward bay a niche for the coffee maker,
# with a rail across its front for when she rolls, and under it a cupboard for the mugs.
PANTRY = dict(back=-X_IN, front=-X_IN + 0.46, y0=21.34, y1=22.14, top=0.90, t=0.018, split=0.44, shelf=0.45)


def _pantry():
    Q = PANTRY
    ys = Q['y0'] + Q['split']                                      # the divider's after face
    return Q['back'], Q['front'], Q['y0'], Q['y1'], ys, Q['top'], Q['t']


def _door_motion(mover, name, hinge_x, hinge_yard, ratio, at, reach=1.7, opens=100):
    MOTIONS.append(dict(id=mover, name=name, pivot=[hinge_x, 0.0, BP.Z(hinge_yard)], ratio=ratio, max=opens,
                        at=[at[0], DECK + at[2], BP.Z(at[1])], normal=[1, 0, 0], auto='tap', reach=reach))


def pantry(g, tag, x, yard, h):
    """The unit itself: a carcass of panels on a plinth set back for the feet, a wooden top, the niche's shelf and its rail, and
    the cupboard under the niche with its door (it opens to a tap), its shelf, four mugs, the coffee tin, the tea and the sugar."""
    xb, xf, y0, y1, ys, T, t = _pantry()
    cream = JOINERY
    sh = PANTRY['shelf']
    box('joinery', xb + 0.02, xf - 0.035, y0 + 0.02, y1 - 0.02, 0.012, 0.08, FRAME)
    box('joinery', xb, xb + t, y0, y1, 0.08, T - t, cream)
    for a in (y0, ys, y1 - t):
        box('joinery', xb + t, xf, a, a + t, 0.08, T - t, cream)
    box('joinery', xb + t, xf, y0 + t, ys, 0.08, 0.08 + t, cream)
    box('joinery', xb + t, xf, ys + t, y1 - t, 0.08, 0.08 + t, cream)
    box('joinery', xb, xf, y0, y1, T - t, T, cream)
    box('wood', xb, xf + 0.012, y0 - 0.008, y1 + 0.008, T, T + 0.022, WOOD, r=0.005)
    box('joinery', xb + t, xf, ys + t, y1 - t, sh, sh + t, cream)
    part('steel').rod([P(xf - 0.012, ys + t, sh + t + 0.055), P(xf - 0.012, y1 - t, sh + t + 0.055)], 0.0045, STEEL)        # the rail across the niche
    # ---- in the cupboard: a shelf; mugs on it; the tin, the tea and the sugar under it
    a, b = ys + t, y1 - t
    box('joinery', xb + t, xf - 0.03, a, b, 0.27, 0.27 + 0.012, cream)
    white, mugs = srgb(0xf4f2ea), part('plastic')
    for i, (mx, my) in enumerate(((xb + 0.10, a + 0.075), (xb + 0.10, a + 0.215), (xb + 0.22, a + 0.075), (xb + 0.22, a + 0.215))):
        tube('plastic', (mx, my, 0.282), (mx, my, 0.372), 0.040, white if i != 2 else srgb(0x2f6f74))
        tube('dark', (mx, my, 0.372), (mx, my, 0.3725), 0.0355, srgb(0x2a2420))                                          # the dark of the inside
        mugs.ring(P(mx + 0.052, my, 0.327), (0, 0, 1), 0.026, 0.0055, white if i != 2 else srgb(0x2f6f74), sweep=(radians(-110), radians(110)))
    tube('paint', (xb + 0.10, a + 0.08, 0.098), (xb + 0.10, a + 0.08, 0.235), 0.050, srgb(0xa8322a))                       # the coffee tin
    tube('steel', (xb + 0.10, a + 0.08, 0.235), (xb + 0.10, a + 0.08, 0.243), 0.051, STEEL)
    box('plastic', xb + 0.05, xb + 0.19, a + 0.17, a + 0.25, 0.098, 0.178, srgb(0x3f7a4a), r=0.004)                         # the tea
    vessel('glass', (xb + 0.27, a + 0.12, 0.098), (xb + 0.27, a + 0.12, 0.210), 0.042, GLASS)                               # the sugar, in a jar
    tube('plastic', (xb + 0.27, a + 0.12, 0.100), (xb + 0.27, a + 0.12, 0.175), 0.038, white)
    tube('steel', (xb + 0.27, a + 0.12, 0.210), (xb + 0.27, a + 0.12, 0.222), 0.044, STEEL)
    # ---- the cupboard's door: hinged on its forward edge, a knob at its after edge
    M = moving('Pantry, cupboard door', 'pantry-cupboard', leaf='Laminate', fit='Stainless')
    box(M['leaf'], xf - 0.018, xf, a + 0.003, b - 0.003, 0.101, sh - 0.003, tint(cream, 1.03), r=0.004)
    tube(M['fit'], (xf, a + 0.035, 0.36), (xf + 0.016, a + 0.035, 0.36), 0.006, STEEL)
    M['fit'].ball(P(xf + 0.020, a + 0.035, 0.36), 0.012, STEEL)
    for hh in (0.16, 0.39):
        tube(M['fit'], (xf - 0.004, b - 0.003, hh - 0.022), (xf - 0.004, b - 0.003, hh + 0.022), 0.006, STEEL)
    _door_motion('pantry-cupboard', 'Pantry cupboard', xf - 0.004, b - 0.003, -1.0, (xf, (a + b) / 2, 0.28))


def cooler(g, tag, x, yard, h):
    """The cooler, in the after bay: a small refrigerator of its own, standing on four feet; an insulated cabinet with two wire
    shelves and what the watch keeps cold; a door with a gasket, a shelf of its own for bottles and a handle. It opens to a tap."""
    xb, xf, y0, y1, ys, T, t = _pantry()
    white, inner, wire = srgb(0xf2f0e8), srgb(0xe9edee), srgb(0xb9c0c2)
    a, b = y0 + t + 0.006, ys - 0.006
    x0, x1 = xb + t + 0.010, xf - 0.046                                # the cabinet, behind its door
    h0, h1, w = 0.100, 0.860, 0.030
    for (fx, fy) in ((x0 + 0.03, a + 0.03), (x0 + 0.03, b - 0.03), (x1 - 0.03, a + 0.03), (x1 - 0.03, b - 0.03)):
        tube('dark', (fx, fy, 0.098), (fx, fy, h0), 0.014, BLACK)
    box('plastic', x0, x0 + w, a, b, h0, h1, white)                                                                    # its back, sides, floor and top
    box('plastic', x0 + w, x1, a, a + w, h0, h1, white)
    box('plastic', x0 + w, x1, b - w, b, h0, h1, white)
    box('plastic', x0 + w, x1, a + w, b - w, h0, h0 + w, white)
    box('plastic', x0 + w, x1, a + w, b - w, h1 - w, h1, white)
    box('dark', x0 + w, x0 + w + 0.012, a + w + 0.02, b - w - 0.02, h1 - w - 0.12, h1 - w - 0.02, srgb(0xcfd6d8), r=0.003)   # the cold plate at the back
    ia, ib = a + w, b - w
    for sh in (0.360, 0.580):                                                                                           # two wire shelves, each a frame and its wires
        part('steel').rod([P(x0 + w + 0.004, ia, sh), P(x1 - 0.006, ia, sh), P(x1 - 0.006, ib, sh), P(x0 + w + 0.004, ib, sh), P(x0 + w + 0.004, ia, sh)], 0.003, wire)
        for k in range(1, 9):
            yy = ia + (ib - ia) * k / 9
            tube('steel', (x0 + w + 0.004, yy, sh), (x1 - 0.006, yy, sh), 0.0016, wire)
    # what is kept cold: bottles on the floor, cans on the first shelf, milk and the watch's box on the second
    green, brown, red, blue = srgb(0x2f6f4a), srgb(0x5a3a1e), srgb(0xb5332a), srgb(0x2d5f9a)
    for k, col in enumerate((green, brown, green, brown)):
        bx, by = x0 + w + 0.06 + 0.075 * (k // 2), ia + 0.06 + 0.085 * (k % 2)
        vessel('glass', (bx, by, h0 + w), (bx, by, h0 + w + 0.150), 0.031, col)
        vessel('glass', (bx, by, h0 + w + 0.150), (bx, by, h0 + w + 0.200), 0.031, col, r2=0.013)
        vessel('glass', (bx, by, h0 + w + 0.200), (bx, by, h0 + w + 0.222), 0.013, col)
        tube('steel', (bx, by, h0 + w + 0.222), (bx, by, h0 + w + 0.228), 0.0145, srgb(0xd8b23a))
    for k in range(6):
        cx, cy = x0 + w + 0.06 + 0.075 * (k // 3), ia + 0.05 + 0.075 * (k % 3)
        tube('steel', (cx, cy, 0.3632), (cx, cy, 0.478), 0.033, (red, blue, srgb(0xd9d9d4))[k % 3])
        tube('steel', (cx, cy, 0.478), (cx, cy, 0.481), 0.029, srgb(0xc9cdd0))
    box('plastic', x0 + w + 0.03, x0 + w + 0.10, ia + 0.03, ia + 0.10, 0.5806, 0.775, srgb(0xf7f5ee), r=0.004)             # milk: it beds a millimetre onto the wires it stands on
    box('plastic', x0 + w + 0.03, x0 + w + 0.21, ia + 0.14, ib - 0.02, 0.5806, 0.650, srgb(0x4a86a8), r=0.008)             # the watch's box
    # ---- the door: its leaf, the gasket round its inner face, its own shelf with a rail and two bottles, its handle
    M = moving('Cooler, door', 'cooler-door', leaf='Plastic', fit='Shaft steel', dark='Machinery paint', glass='Window glass')
    leaf = M['leaf']
    box(leaf, xf - 0.040, xf, a, b, h0, h1, white, r=0.006)
    for (qa, qb, ga, gb) in ((a + 0.012, b - 0.012, h0 + 0.012, h0 + 0.024), (a + 0.012, b - 0.012, h1 - 0.024, h1 - 0.012),
                             (a + 0.012, a + 0.024, h0 + 0.024, h1 - 0.024), (b - 0.024, b - 0.012, h0 + 0.024, h1 - 0.024)):
        box(M['dark'], xf - 0.046, xf - 0.040, qa, qb, ga, gb, srgb(0x3a4042), r=0.0)                                    # the gasket
    box(leaf, xf - 0.105, xf - 0.040, a + 0.03, b - 0.03, 0.230, 0.242, inner, r=0.003)                                   # the door's shelf
    M['fit'].rod([P(xf - 0.100, a + 0.03, 0.300), P(xf - 0.100, b - 0.03, 0.300)], 0.003, wire)
    for yy in (a + 0.03, b - 0.03):
        box(leaf, xf - 0.105, xf - 0.040, yy - 0.004, yy + 0.004, 0.242, 0.304, inner, r=0.0)
    for k, yy in enumerate((a + 0.11, b - 0.11)):
        vessel(M['glass'], (xf - 0.072, yy, 0.242), (xf - 0.072, yy, 0.400), 0.027, (srgb(0xe8e4d8), srgb(0x2f6f4a))[k])
        vessel(M['glass'], (xf - 0.072, yy, 0.400), (xf - 0.072, yy, 0.455), 0.027, (srgb(0xe8e4d8), srgb(0x2f6f4a))[k], r2=0.012)
        tube(M['fit'], (xf - 0.072, yy, 0.455), (xf - 0.072, yy, 0.470), 0.013, srgb(0xd8b23a))
    hy = b - 0.035                                                                                                     # the handle, at the free edge
    for hh in (0.52, 0.76):
        tube(M['fit'], (xf, hy, hh), (xf + 0.028, hy, hh), 0.005, STEEL)
    M['fit'].rod([P(xf + 0.028, hy, 0.50), P(xf + 0.028, hy, 0.78)], 0.007, STEEL)
    _door_motion('cooler-door', 'Cooler', xf - 0.004, a, 1.0, (xf, (a + b) / 2, 0.50))


def coffee_maker(g, tag, x, yard, h):
    """The coffee pot: a filter machine in the niche, on the shelf behind the rail: a base with the hot plate and the switch, a
    column that holds the water with a window to see its level, a head with the filter's basket over the jug, and the jug
    itself, of glass, with its collar, lid and handle, and coffee in it."""
    xb, xf, y0, y1, ys, T, t = _pantry()
    top = PANTRY['shelf'] + t                                           # the shelf's top
    c = (ys + t + y1 - t) / 2
    black, body = srgb(0x1c2022), srgb(0x2a3033)
    bx0, bx1 = xb + t + 0.045, xb + t + 0.045 + 0.27
    box('dark', bx0, bx1, c - 0.105, c + 0.105, top, top + 0.022, body, r=0.006)
    for (fx, fy) in ((bx0 + 0.02, c - 0.085), (bx0 + 0.02, c + 0.085), (bx1 - 0.02, c - 0.085), (bx1 - 0.02, c + 0.085)):
        tube('dark', (fx, fy, top), (fx, fy, top + 0.002), 0.010, black)
    jx = bx1 - 0.085                                                     # the jug's middle, on the hot plate
    tube('steel', (jx, c, top + 0.022), (jx, c, top + 0.026), 0.072, srgb(0x4a4f52))
    box('dark', bx0, bx0 + 0.085, c - 0.105, c + 0.105, top + 0.022, top + 0.300, body, r=0.008)                          # the column
    box('lens', bx0 + 0.085, bx0 + 0.088, c - 0.03, c + 0.03, top + 0.070, top + 0.250, srgb(0x6f8fa3), r=0.001)             # the water's window
    box('dark', bx0, bx1 - 0.015, c - 0.105, c + 0.105, top + 0.258, top + 0.300, body, r=0.008)                           # the head
    tube('dark', (jx, c, top + 0.258), (jx, c, top + 0.196), 0.062, black, r2=0.046)                                     # the filter's basket
    tube('dark', (jx, c, top + 0.196), (jx, c, top + 0.188), 0.012, black)
    # The switch: a rocker in the base's front that a tap throws over; a lamp beside it that is lit while the machine is on.
    sw = (bx1, c + 0.075, top + 0.011)
    R = moving('Coffee maker, switch', 'coffee-machine', rocker='Plastic')
    with Frame(sw, AFTWARD, UP) as F:                                            # the base's front looks inboard, to port
        F.box('dark', (-0.016, -0.009, 0.0), (0.016, 0.009, 0.002), black)
        F.into = dict(plastic=R['rocker'])
        F.prism('plastic', -0.012, 0.012, [(-0.007, 0.002), (0.007, 0.002), (0.007, 0.0075), (-0.007, 0.0035)], srgb(0xc2412f))
        F.into = None
        MOTIONS.append(dict(id='coffee-machine', name='Coffee maker', kind='turn', pivot=[float(v) for v in F.at((0.0, 0.0, 0.002))], axis=[float(v) for v in F.way((1.0, 0.0, 0.0))],
                            ratio=1.0, max=32, at=[float(v) for v in F.at((0.0, 0.0, 0.0))], auto='tap', reach=1.9, rest='off', above='on: it fills the jug', fitting=tag))
        F.lathe('lens', (0.03, 0.0, 0.0), [(0.0, 0.0), (0.0, 0.0038), (0.003, 0.0032), (0.004, 0.0)], srgb(0x5a1a14))
        F.into = dict(lit_red=shown('coffee-lamp-lit', 'coffee-machine', 'Coffee maker, lamp', 'Lit red'))
        F.lathe('lit_red', (0.03, 0.0, 0.0), [(0.0, 0.0), (0.0, 0.0044), (0.0035, 0.0037), (0.0046, 0.0)], srgb(0xff3a20))
        F.into = None
    # The jug: glass, with its collar, lid and handle. It is lifted and tipped by a tap, as when a cup is poured: it turns
    # about a line just inboard of the hot plate.
    J = moving('Coffee jug', 'coffee-jug', glass='Clear glass', dark='Plastic')
    vessel(J['glass'], (jx, c, top + 0.026), (jx, c, top + 0.130), 0.064, GLASS)
    vessel(J['glass'], (jx, c, top + 0.130), (jx, c, top + 0.158), 0.064, GLASS, r2=0.050)
    lathe(J['glass'], (jx, c, top + 0.026), UP, [(0.0, 0.0), (0.0, 0.064), (0.003, 0.064), (0.003, 0.0)], GLASS)        # its bottom
    J['dark'].ring(P(jx, c, top + 0.158), UP, 0.051, 0.006, black)                                                       # its collar
    lathe(J['dark'], (jx, c, top + 0.160), UP, [(0.0, 0.0), (0.0, 0.047), (0.008, 0.047), (0.010, 0.012), (0.018, 0.010), (0.020, 0.0)], black)   # its lid and knob
    sweep(J['dark'], [(jx + 0.050, c, top + 0.156), (jx + 0.096, c, top + 0.150), (jx + 0.100, c, top + 0.075), (jx + 0.063, c, top + 0.050)], 0.0075, black)
    MOTIONS.append(dict(id='coffee-jug', name='Coffee jug', kind='turn', pivot=list(P(jx + 0.105, c, top + 0.03)), axis=[0, 0, 1], ratio=-1.0, max=52,
                        at=list(P(jx, c, top + 0.09)), auto='tap', reach=1.9, rest='on its plate', above='lifted and poured: it empties', fitting=tag))
    # The coffee in it: it rises as the machine runs and falls as the jug is poured. It is drawn as the last of a pot, 4 mm
    # deep, and grows upward from the jug's bottom by what the level says (the file's levels: README).
    C = moving('Coffee in the jug', 'coffee', coffee='Coffee')
    lathe(C['coffee'], (jx, c, top + 0.0295), UP, [(0.0, 0.0), (0.0, 0.0605), (0.004, 0.0605), (0.004, 0.0)], srgb(0x2b1a10))
    LEVERS.append(dict(id='coffee', input='coffee', kind='stretch', axis=[0, 1, 0], pivot=list(P(jx, c, top + 0.0295)), ratio=(0.094 / 0.004 - 1.0) / 100.0, on='coffee-jug'))
    LEVELS.append(dict(id='coffee', name='Coffee in the jug', min=0, max=100, unit='%', start=55, fitting=tag,
                       level=dict(fill='coffee-machine', rate=7.0, drain='coffee-jug', drainRate=22.0), below='', above='full', rest='empty'))


def pantry_socket(g, tag, x, yard, h):
    """A double 230 V socket at the back of the niche, with the coffee maker's plug in one and the cooler's in the other; the
    cooler's lead goes through the divider to it."""
    xb, xf, y0, y1, ys, T, t = _pantry()
    white, cable = srgb(0xf2f0e8), srgb(0x25282a)
    c = (ys + t + y1 - t) / 2
    fx = xb + t
    box('plastic', fx, fx + 0.010, c - 0.075, c + 0.075, h - 0.042, h + 0.042, white, r=0.003)
    for k, yy in enumerate((c - 0.036, c + 0.036)):
        tube('dark', (fx + 0.010, yy, h), (fx + 0.012, yy, h), 0.019, srgb(0x2a2e30))
        box('plastic', fx + 0.012, fx + 0.040, yy - 0.018, yy + 0.018, h - 0.018, h + 0.018, white, r=0.005)                # a plug in each
    top = PANTRY['shelf'] + t
    part('plastic').rod([P(fx + 0.040, c + 0.036, h), P(fx + 0.050, c + 0.036, h - 0.06), P(fx + 0.050, c + 0.02, top + 0.16)], 0.0035, cable)   # to the coffee maker's column
    part('plastic').rod([P(fx + 0.040, c - 0.036, h), P(fx + 0.052, c - 0.036, h - 0.05), P(fx + 0.052, c - 0.10, h - 0.10), P(fx + 0.052, ys - 0.02, h - 0.10),
                         P(fx + 0.045, ys - 0.02, 0.86)], 0.0035, cable)                                                                    # through the divider to the cooler's back


def scupper(g, tag, x, yard, h):
    box('dark', x - 0.07, x + 0.07, yard - 0.07, yard + 0.07, 0.012, 0.016, BLACK)
    for k in range(5):
        box('steel', x - 0.06, x + 0.06, yard - 0.055 + k * 0.026, yard - 0.045 + k * 0.026, 0.016, 0.019, GREY)


def wing_light(g, tag, x, yard, h):
    side = g['side']
    xw = side * X_OUT
    box('dark', xw, xw + side * 0.03, yard - 0.06, yard + 0.06, h - 0.08, h + 0.08, DARK)
    box('lens', xw + side * 0.03, xw + side * 0.075, yard - 0.045, yard + 0.045, h - 0.065, h + 0.065, WHITE_LAMP)
    for hh in (h - 0.035, h, h + 0.035):
        box('steel', xw + side * 0.03, xw + side * 0.08, yard - 0.05, yard + 0.05, hh - 0.003, hh + 0.003, GREY)


def talkback_station(g, tag, x, yard, h):
    side = g['side']
    xw = side * X_OUT
    box('paint', xw, xw + side * 0.07, yard - 0.06, yard + 0.06, h, h + 0.17, YELLOW)
    pic((xw + side * 0.07, yard, h + 0.085), (side, 0, 0), UP, 0.11, 0.16, 'talkback')


# =====================================================================================================================
# What the bridge adds to the compass deck (the viewer's part `top`)
# =====================================================================================================================
ROOF = REG.DECK_H


def nuc(g, tag, x, yard, h):
    """A pair of all-round red lanterns on a cross arm, one either side of the mast: together they are seen all round, where
    one beside the mast would be hidden by it over 35 degrees (COLREG Annex I, 9(b): not more than 6)."""
    tube('top', (-0.30, yard, h + 0.04), (0.30, yard, h + 0.04), 0.012, HOUSE, 6)
    for sx in (-0.30, 0.30):
        tube('top_dark', (sx, yard, h), (sx, yard, h + 0.05), 0.06, DARK, 14)
        tube('top_lens', (sx, yard, h + 0.05), (sx, yard, h + 0.16), 0.052, RED, 14)
        tube('top_dark', (sx, yard, h + 0.16), (sx, yard, h + 0.19), 0.06, DARK, 14)


def navtex_ant(g, tag, x, yard, h):
    tube('top_steel', (x, yard, ROOF), (x, yard, ROOF + 0.45), 0.014, srgb(S.ZINC), 8)
    tube('top', (x, yard, ROOF + 0.45), (x, yard, ROOF + 0.62), 0.03, HOUSE, 12)
    tube('top', (x, yard, ROOF + 0.62), (x, yard, ROOF + 1.05), 0.006, HOUSE, 6, 0.003)


def gnss_small(g, tag, x, yard, h):
    tube('top_steel', (x, yard, ROOF), (x, yard, ROOF + 0.30), 0.012, GREY, 8)
    _revolve(part('top'), P(x, yard, ROOF + 0.30), (0, 1, 0), [(0.0, 0.0), (0.0, 0.045), (0.03, 0.042), (0.05, 0.025), (0.06, 0.0)], HOUSE, sides=14)


def wind_sensor(g, tag, x, yard, h):
    tube('top_steel', (x, yard, h), (x, yard, h + 0.32), 0.008, GREY, 6)
    for k in range(3):                                                          # the cups
        a = k * 2 * pi / 3
        tube('top_steel', (x, yard, h + 0.32), (x + 0.07 * cos(a), yard + 0.07 * sin(a), h + 0.32), 0.003, GREY, 5)
        _revolve(part('top_dark'), P(x + 0.07 * cos(a), yard + 0.07 * sin(a), h + 0.32), (-sin(a), 0, cos(a)), [(0.0, 0.0), (0.012, 0.02), (0.02, 0.022), (0.021, 0.0)], BLACK, sides=8)
    tube('top_steel', (x, yard - 0.10, h + 0.24), (x, yard + 0.06, h + 0.24), 0.004, GREY, 5)      # the vane
    box('top_dark', x - 0.002, x + 0.002, yard - 0.14, yard - 0.07, h + 0.21, h + 0.27, BLACK)


def ac_outdoor(g, tag, x, yard, h):
    w, d, H = g['w'], g['d'], g['H']
    for sx in (-1, 1):
        box('top_steel', x + sx * (w / 2 - 0.08) - 0.03, x + sx * (w / 2 - 0.08) + 0.03, yard - d / 2, yard + d / 2, ROOF, ROOF + 0.08, GREY)
    box('top', x - w / 2, x + w / 2, yard - d / 2, yard + d / 2, ROOF + 0.08, ROOF + 0.08 + H, HOUSE)
    c = (x - 0.10, yard + d / 2, ROOF + 0.08 + H / 2)
    tube('top_dark', c, (c[0], c[1] + 0.012, c[2]), 0.21, srgb(0x394144), 20)
    for k in range(6):
        a = k * pi / 6
        tube('top_steel', (c[0] - 0.2 * cos(a), c[1] + 0.016, c[2] - 0.2 * sin(a)), (c[0] + 0.2 * cos(a), c[1] + 0.016, c[2] + 0.2 * sin(a)), 0.003, GREY, 4)


# =====================================================================================================================
KINDS = dict(
    console=BC.console, display=BC.display, flush=BC.flush, facepanel=BC.facepanel, lever=BC.lever, sp_phone=BC.sp_phone, navtex=BC.navtex,
    box=BC.hidden, binoculars=BC.binoculars, sockets=BC.sockets,
    overhead=BF.overhead, ovh_dial=BF.ovh_dial, ovh_screen=BF.ovh_screen, ovh_set=BF.ovh_set, periscope=BF.periscope, ceil=BF.ceil, grabrails=BF.grabrails,
    blinds=BF.blinds, mullion_ducts=BF.mullion_ducts, wiper=BF.wiper, nozzles=BF.nozzles, whistle_valve=BF.whistle_valve, cvs=BF.cvs, handrail=BF.handrail,
    jbox=BF.jbox,
    stand=BO.stand, wallbox=BO.wallbox, dial=BO.dial, callpoint=BO.callpoint, chart_table=BO.chart_table, chart_lamp=BO.chart_lamp, bookshelf=BO.bookshelf,
    table=BO.table, locker=BO.locker, extinguisher=BO.extinguisher, sart=BO.sart, handhelds=BO.handhelds, aldis=BO.aldis, stairwell=BO.stairwell,
    ac_indoor=BO.ac_indoor, sofa=BO.sofa, hooks=BO.hooks,
    wing_console=wing_console, sidelight=sidelight, epirb=epirb, pelorus=pelorus, lifebuoy=lifebuoy, hydrant=hydrant, hosebox=hosebox, scupper=scupper,
    wing_light=wing_light, talkback=talkback_station,
    nuc=nuc, navtex_ant=navtex_ant, gnss_small=gnss_small, wind_sensor=wind_sensor, ac_outdoor=ac_outdoor,
    pantry=pantry, cooler=cooler, coffee=coffee_maker, pantry_socket=pantry_socket,
)
# What is worked a notch at a time: its name, the fitting of the register it belongs to, its positions and what each means.
LEVER_CONTROLS = [
    dict(id='lever-engine-p', name='Port engine lever', fitting='PRP-01', home=3, steps=[dict(v=a, say=o) for a, o in zip(BC.lever_notches(), BC.ORDERS)]),
    dict(id='lever-engine-s', name='Starboard engine lever', fitting='PRP-02', home=3, steps=[dict(v=a, say=o) for a, o in zip(BC.lever_notches(), BC.ORDERS)]),
    dict(id='lever-thruster', name='Bow thruster lever', fitting='PRP-03', home=2, steps=[dict(v=a, say=o) for a, o in zip(BC.lever_notches(True), BC.THRUSTS)]),
    dict(id='tiller', name='Tiller', fitting='STR-03', home=1,
         steps=[dict(v=-24.0, say='held to port: the rudders go to port until it is let go'), dict(v=0.0, say='let go: the rudders stay where they are'),
                dict(v=24.0, say='held to starboard: the rudders go to starboard until it is let go')]),
]


def build():
    MADE.clear()
    EXTRA.clear()
    MOTIONS.clear()
    LEVERS.clear()
    LEVELS.clear()
    SHARED.clear()
    CONTROLS[:] = LEVER_CONTROLS
    for c in REG.COMPONENTS:
        g, kind = c['g'], c['g']['kind']
        if kind == 'none':
            continue
        x, yard, h = c['at']
        HANGS[0] = kind in HUNG
        with component(c['id']):
            if kind == 'envelope':
                envelope()
                BO.trunk()
            elif kind == 'ceiling':
                ceiling()
            elif kind == 'floor':
                floor()
            elif kind == 'wing':
                wing(g)
            elif kind == 'door_wing':
                door_wing(g, c['id'])
            elif kind == 'door_corridor':
                door_corridor(g, c['id'])
            elif kind == 'chair':
                BO.chair(g, c['id'], x, yard)
            else:
                KINDS[kind](g, c['id'], x, yard, h)
    HANGS[0] = False
    for eye in EYES:
        seen, blind, to = view_from_helm(eye=eye)
        print(f'glass seen from the helm, eye {eye:.2f} m: {seen:.0f} of 225 degrees, to {to:.0f} degrees each side; blind sectors wider than a mullion: {blind or "none"}')
        if seen < 220:
            raise SystemExit(f'the glass shows an eye at {eye:.2f} m {seen:.0f} of 225 degrees: a blind sector has opened at {blind}')
    out = list(MADE.values()) + EXTRA
    for p in out:
        p.smooth = False
    return out


def motion():
    """
    What moves on the bridge, as the file carries it (README: the file format). A door turns on its hinge and opens for
    whoever comes near on foot. What is worked by a tap turns, slides or runs: a cabinet's door, a drawer, a lid, a
    handset, a chair on its rail and on its pedestal, a sun blind, a wiper, a clear-view screen. A lever turns on its
    shaft, a notch for a tap, and the same lever at the console and on both wings moves as one. The wheel turns with the
    rudder order.
    """
    inputs, movers = [], []
    for m in MOTIONS:
        auto = m.get('auto', 'near')
        rec = dict(id=m['id'], name=m['name'], min=0, max=m['max'], step=1, unit=m.get('unit', '°'), below='', above=m.get('above', 'open'), rest=m.get('rest', 'shut'),
                   auto=auto, at=[round(float(v), 4) for v in m['at']], reach=m.get('reach', 1.6))
        if auto == 'near':
            rec['normal'] = m['normal']
        for key in ('run', 'period', 'rate', 'fitting', 'with'):
            if m.get(key) is not None:
                rec[key] = m[key]
        inputs.append(rec)
        mv = dict(id=m['id'], kind=m.get('kind', 'turn'), input=m['id'], axis=[round(float(v), 5) for v in m.get('axis', [0, 1, 0])], pivot=[round(float(v), 4) for v in m['pivot']], ratio=m['ratio'])
        if m.get('on'):
            mv['on'] = m['on']
        movers.append(mv)
    for c in CONTROLS:
        rec = dict(id=c['id'], name=c['name'], fitting=c['fitting'], steps=c['steps'], home=c['home'], min=min(s['v'] for s in c['steps']), max=max(s['v'] for s in c['steps']), unit=c.get('unit', '°'))
        inputs.append(rec)
    for c in LEVELS:
        inputs.append(dict(c))
    for m in LEVERS:
        mv = dict(id=m['id'], kind=m.get('kind', 'turn'), input=m['input'], axis=[round(float(v), 5) for v in m['axis']], pivot=[round(float(v), 4) for v in m['pivot']], ratio=m.get('ratio', 1.0))
        for key in ('on', 'when', 'over'):
            if m.get(key) is not None:
                mv[key] = m[key]
        movers.append(mv)
    return inputs, movers
