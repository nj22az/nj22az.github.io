"""
Her bare steel above the tank top, built from the general arrangement (ga.py): every deck's plating with the wells cut in
it and the beams under it, the walls of every space with its doorways and windows, the side casings on the car deck, the
passenger house, the accommodation, the top deck's houses, the funnels, the stern ramp and the inner bow door (both shut),
the flats in the machinery spaces, the crew stair trunk's landings, and the rails of the open decks.

It is the ship before her outfit: steel walls in primer inside and white outside, door openings without doors, windows
with their glass. Nothing here is furniture. Each room of ga.py is a room one can walk into.

**No two faces in one plane** (the owner, 11 November 2026: "Z fighting is not allowed", "Design with anti z fighting
measures"). The rules this file is built on:
  1. A wall is drawn once. Every room gives its four edges; edges that fall on one line are merged before anything is
     built, so the wall two rooms share is one wall.
  2. At a corner one wall takes the corner and the other butts against its face: the wall across the ship is carried to
     the outer face of the wall along her, which begins half a thickness short. Where a wall ends against the middle of
     another it ends inside it.
  3. A deck is one plate with its openings cut out of it: no second plate is laid over a well, and nothing lies flush on
     a deck. What stands on a deck meets it face to face.
  4. A beam is left out where a wall or a bulkhead stands in its plane.
  5. Faces that look the same way are never nearer than 10 mm: a wall's two faces, a deck's two faces, the house's side
     and the bulwark beside it.
zfight.py holds the whole ship to it after every build.

Drawn in the ship's axes (lines.py): x to port, y up from the waterline, z forward from amidships.
"""
from math import pi, cos, sin, ceil, hypot, radians
import lines as L
import spec as S
import ga
import bridge_place as BP
import hull_structure
from shipyard import Part, srgb, tint

Z = L.Z
T = 0.010                      # a wall's thickness as drawn
PLATE = 0.012                  # a deck's plating as drawn
HB = L.HB
WHITE, PRIMER, GREEN, GREY = srgb(S.WHITE), srgb(S.PRIMER), srgb(S.DECK_GREEN), srgb(S.DECK_GREY)
GLASS = srgb(0x2d4a55)
RAIL = srgb(0xe9e7df)
TEAL = srgb(S.TEAL)

_parts = {}


def part(group, name, look, **kw):
    key = (group, name)
    if key not in _parts:
        p = Part(name, look, **kw)
        p.group = group
        _parts[key] = p
    return _parts[key]


# =====================================================================================================================
# The plans: what a wall of each stands on, what it reaches up to, and how wide she is there
# =====================================================================================================================
PLANS = dict(
    car=dict(group='car', name='Car deck', floor=S.CAR_DECK, top=S.PASSENGER_DECK - PLATE, side='shell', breadth=lambda z: L.half_breadth(z) - 0.014),
    passenger=dict(group='passenger', name='Passenger deck', floor=S.PASSENGER_DECK, top=S.BRIDGE_DECK - PLATE, side='wall', breadth=lambda z: L.upper_breadth(z) - 0.004),
    bridge=dict(group='bridge', name='Bridge deck', floor=S.BRIDGE_DECK, top=S.TOP_DECK - PLATE, side='wall', breadth=lambda z: L.upper_breadth(z) - 0.004),
    top=dict(group='top', name='Top deck', floor=S.TOP_DECK, top=S.TOP_HOUSE - PLATE, side='wall', breadth=lambda z: HB),
    flat=dict(group='machinery', name='Machinery flat', floor=S.FLAT, top=S.CAR_DECK - PLATE, side='shell', breadth=lambda z: L.hull_x(S.FLAT + 0.4, z) - 0.33),
)
# Spaces of ga.py that have no walls of their own: open decks, and the open-plan spaces bounded by the rooms round them.
OPEN = dict(
    car={'stern-ramp', 'vehicle-deck', 'bow-ramp'},
    passenger={'aft-mooring-deck', 'sun-deck', 'aft-lobby', 'lobby', 'saloon', 'lounge', 'mooring-deck'},
    bridge={'aft-deck', 'aft-deck-s', 'side-deck-p', 'side-deck-s', 'corridor', 'wheelhouse'},
    top={'top-open', 'compass-deck', 'funnel-top-p', 'funnel-top-s', 'eg-room'},          # the generator room builds its own walls (eg_room.py)
)
HOUSE = ga.HOUSE
# The outlines of the houses, where no room's edge gives them: (plan, 'x' or 'yard', where, from, to).
OUTLINES = [
    # the passenger house: its after wall, the nook each side between the funnel casing and the house's full breadth, its
    # sides (they follow her side forward), the lounge's front
    ('passenger', 'yard', 13.0, -5.8, 5.8), ('passenger', 'x', 5.8, 13.0, 20.0), ('passenger', 'yard', 20.0, 5.8, HB), ('passenger', 'x', HB, 20.0, 54.0),
    ('passenger', 'x', -5.8, 13.0, 21.0), ('passenger', 'yard', 21.0, -HB, -5.8), ('passenger', 'x', -HB, 21.0, 54.0), ('passenger', 'yard', 54.0, -HB, HB),
    # the accommodation: the corridor's after end, and the house's front each side of the wheelhouse
    ('bridge', 'yard', 22.0, -0.6, 0.6),
    # the casing in the ship's office over the crew stair that comes up into the wheelhouse
    ('bridge', 'x', -2.955, 48.35, 50.0), ('bridge', 'x', -2.085, 48.35, 50.0), ('bridge', 'yard', 48.35, -2.955, -2.085),
    # the enclosure in the forward lounge round the same stair, with the crew's door at its foot
    ('passenger', 'x', -2.955, 47.5, 50.75), ('passenger', 'x', -2.085, 47.5, 50.75), ('passenger', 'yard', 47.5, -2.955, -2.085), ('passenger', 'yard', 50.75, -2.955, -2.085),
    # the collision bulkhead carried up through the car deck: the frame of the inner bow door
    ('car', 'yard', S.COLLISION, -HB, HB),
]
# Where an edge of a room is not a wall: the after main stair's foot is in the shell door lobby; the engine control room
# and the workshop stand against a watertight bulkhead; the wheelhouse's own after wall is built with it (below).
NO_WALL = [
    ('car', 'yard', 30.0, 5.2, HB), ('car', 'yard', 30.0, -HB, -5.2), ('car', 'yard', 0.0, -HB, HB),
    ('flat', 'yard', S.fr(55), -HB, HB), ('flat', 'x', 6.2, 0.0, 99.0), ('flat', 'x', -6.2, 0.0, 99.0),
    ('bridge', 'yard', 50.0, -3.0, 3.0),
]
# Walls that look on the weather are white; the others are in primer.
EXTERIOR = [
    ('passenger', 'yard', 13.0, -5.8, 5.8), ('passenger', 'x', 5.8, 13.0, 20.0), ('passenger', 'x', -5.8, 13.0, 21.0), ('passenger', 'yard', 20.0, 5.8, HB),
    ('passenger', 'yard', 21.0, -HB, -5.8), ('passenger', 'x', HB, 20.0, 54.0), ('passenger', 'x', -HB, 21.0, 54.0), ('passenger', 'yard', 54.0, -HB, HB),
    ('passenger', 'x', 3.2, 13.0, 20.0), ('passenger', 'x', -3.2, 13.0, 20.0), ('passenger', 'yard', 20.0, -5.8, -3.2), ('passenger', 'yard', 20.0, 3.2, 5.8),
    ('bridge', 'yard', 22.0, -HOUSE, 5.2), ('bridge', 'x', 5.2, 20.0, 22.0), ('bridge', 'yard', 20.0, 5.2, HB), ('bridge', 'x', HB, 20.0, 24.0), ('bridge', 'yard', 24.0, 5.2, HB),
    ('bridge', 'x', 5.2, 24.0, 27.0), ('bridge', 'yard', 27.0, 5.2, HOUSE), ('bridge', 'x', HOUSE, 27.0, 50.0), ('bridge', 'x', -HOUSE, 22.0, 50.0),
    ('bridge', 'yard', 50.0, 3.0, HOUSE), ('bridge', 'yard', 50.0, -HOUSE, -3.0),
]

# ---- Doorways and windows. Each: plan, room, which of its sides ('a' its after end, 'f' its forward end, 'p' its port
# side, 's' its starboard side), from and to along that wall (off the centreline for 'a' and 'f', metres from the transom
# for 'p' and 's'), and for a window its sill and head over the deck. A doorway is 2.05 m high.
DOOR_HEAD = 2.05
OPENINGS = []


def door(plan, room, side, a, b, head=DOOR_HEAD, sill=0.0, glass=False):
    OPENINGS.append(dict(plan=plan, room=room, side=side, lo=min(a, b), hi=max(a, b), bottom=sill, top=head, glass=glass))


def window(plan, room, side, a, b, sill=0.95, head=1.90):
    door(plan, room, side, a, b, head=head, sill=sill, glass=True)


# The car deck: each casing room is entered from the lanes.
for _sfx, _in in (('-p', 's'), ('-s', 'p')):
    for _room, _a, _b in (('aft-mooring', 4.6, 5.5), ('deck-store', 7.5, 8.4), ('uptake', 18.6, 19.5), ('shell-door', 31.7, 32.6), ('fan-trunk-a', 35.0, 35.9),
                          ('stair-fwd', 37.92, 38.72), ('bosun', 48.5, 49.4), ('fan-trunk-f', 54.2, 55.1), ('bow-gear', 59.2, 60.1)):
        door('car', _room + _sfx, _in, _a, _b)
door('car', 'crew-stair', 's', 23.25, 23.95)
door('car', 'er-escape', 'p', 21.5, 22.4)
# The inner bow door's opening in the collision bulkhead: the two middle lanes' width and the lanes' height. Its ramp stands in it, shut.
BOW_DOOR = dict(half=2.6, height=4.3)
# The passenger deck.
door('passenger', 'kiosk', 'p', 24.6, 25.5)
window('passenger', 'kiosk', 'p', 21.8, 24.0, sill=1.0, head=2.0)                 # the kiosk's counter, open to the lobby (no glass: below)
door('passenger', 'kiosk-store', 'p', 22.2, 23.0)
door('passenger', 'crew-stair-pax', 's', 23.25, 23.95)
door('passenger', 'stair-aft-head-p', 's', 24.1, 25.1)
door('passenger', 'stair-aft-head-s', 'p', 24.1, 25.1)
door('passenger', 'toilets-p', 's', 31.5, 32.4)
door('passenger', 'toilets-s', 'p', 32.5, 33.4)
door('passenger', 'stair-fwd-head-p', 's', 44.9, 45.9)
door('passenger', 'stair-fwd-head-s', 'p', 44.9, 45.9)
# The accommodation: every room opens on the corridor.
for _room, _side, _a in (('mess', 's', 24.0), ('cabin-p1', 's', 27.4), ('cabin-p2', 's', 30.4), ('cabin-p3', 's', 33.4), ('second-engineer', 's', 36.4),
                         ('chief-engineer', 's', 40.0), ('master', 's', 44.6), ('galley', 'p', 22.6), ('provisions', 'p', 26.5), ('laundry', 'p', 28.45),
                         ('wash', 'p', 30.2), ('cabin-s4', 'p', 32.8), ('cabin-s5', 'p', 35.8), ('second-officer', 'p', 38.8), ('chief-officer', 'p', 42.4),
                         ('office', 'p', 46.8)):
    door('bridge', _room, _side, _a, _a + 0.75)
door('bridge', 'crew-stair-head', 's', 22.35, 23.10)                              # from the head of the crew stair into the mess
door('bridge', 'crew-stair-head', 'f', 5.75, 6.55)                                # and forward onto the side deck
for _room, _a, _b in (('cabin-p1', 28.1, 28.9), ('cabin-p2', 31.1, 31.9), ('cabin-p3', 34.1, 34.9), ('second-engineer', 37.4, 38.2), ('chief-engineer', 41.5, 42.3),
                      ('master', 46.7, 47.5)):
    window('bridge', _room, 'p', _a, _b, sill=1.0, head=1.7)
for _room, _a, _b in (('galley', 23.7, 24.5), ('wash', 30.7, 31.5), ('cabin-s4', 33.5, 34.3), ('cabin-s5', 36.5, 37.3), ('second-officer', 39.8, 40.6),
                      ('chief-officer', 43.8, 44.6), ('office', 47.8, 48.6)):
    window('bridge', _room, 's', _a, _b, sill=1.0, head=1.7)
window('bridge', 'mess', 'a', 2.2, 3.4, sill=1.0, head=1.7)
# The top deck's houses, each entered from the open deck.
door('top', 'co2-room', 'a', -0.4, 0.4)
door('top', 'battery-room', 'p', 38.9, 39.7)
door('top', 'ac-room', 's', 38.9, 39.7)
door('top', 'ventilation-room', 's', 41.0, 41.9)
# On the machinery flat: the control room and the workshop, each entered where its ladder arrives.
door('flat', 'ecr', 'a', 2.66, 3.44)
door('flat', 'workshop', 'a', -3.44, -2.66)
# Openings in the houses' outlines, which are no room's own wall: (plan, 'x' or 'yard', where, from, to, sill, head, glass).
OUTLINE_OPENINGS = [
    ('passenger', 'yard', 13.0, -0.7, 0.7, 0.0, DOOR_HEAD, False),                 # from the open deck into the after lobby
    ('passenger', 'yard', 54.0, -0.45, 0.45, 0.0, DOOR_HEAD, False),               # the crew's door from the lounge to the forecastle
    ('passenger', 'yard', 47.5, -2.90, -2.14, 0.0, DOOR_HEAD, False),              # the crew's door to the wheelhouse stair
    ('bridge', 'yard', 22.0, -0.4, 0.4, 0.0, DOOR_HEAD, False),                    # the corridor's after door, onto the open deck
    ('car', 'yard', S.COLLISION, -BOW_DOOR['half'], BOW_DOOR['half'], 0.0, BOW_DOOR['height'], False),
]
# The lounge's windows over the bow, and the windows down both sides of the passenger house, 1.2 m wide and 2.4 m apart.
for _a, _b in ((1.1, 2.3), (2.9, 4.1), (4.7, 5.9)):
    OUTLINE_OPENINGS += [('passenger', 'yard', 54.0, _a, _b, 0.95, 1.90, True), ('passenger', 'yard', 54.0, -_b, -_a, 0.95, 1.90, True)]
SIDE_WINDOWS = [25.4 + 2.4 * k for k in range(12)]                                 # where each begins; one that a cross wall would land in is left out


# =====================================================================================================================
# Intervals
# =====================================================================================================================
def _union(iv):
    out = []
    for a, b in sorted(iv):
        if out and a <= out[-1][1] + 1e-6:
            out[-1][1] = max(out[-1][1], b)
        else:
            out.append([a, b])
    return [(a, b) for a, b in out if b - a > 1e-6]


def _subtract(iv, cuts):
    out = []
    for a, b in iv:
        pieces = [(a, b)]
        for c, d in cuts:
            nxt = []
            for p, q in pieces:
                if d <= p + 1e-9 or c >= q - 1e-9:
                    nxt.append((p, q))
                    continue
                if c > p + 1e-9:
                    nxt.append((p, c))
                if d < q - 1e-9:
                    nxt.append((d, q))
            pieces = nxt
        out += pieces
    return [(a, b) for a, b in out if b - a > 1e-6]


def _is_side(c):
    return abs(abs(c) - HB) < 0.011


# =====================================================================================================================
# The walls
# =====================================================================================================================
def _spaces(plan):
    """The rooms of a plan that have walls: (id, yard from, yard to, x from, x to)."""
    out = []
    for s in ga.SPACES:
        key = 'flat' if s['level'] == 'flat' else s['plan']
        if s['plan'] == 'hold' and s['level'] != 'flat':
            continue
        if key != plan or s['id'] in OPEN.get(plan, ()) or s['id'] == 'er-platform':
            continue
        out.append((s['id'], s['yard'][0], s['yard'][1], s['x'][0], s['x'][1]))
    return out


def wall_lines(plan):
    """Every wall of a plan as merged lengths on its line: {('x' or 'yard', where): [(from, to), ...]}, and the openings on each."""
    lines, openings = {}, {}

    def add(axis, c, a, b):
        lines.setdefault((axis, round(c, 4)), []).append((min(a, b), max(a, b)))

    rooms = {r[0]: r for r in _spaces(plan)}
    for _, y0, y1, x0, x1 in rooms.values():
        add('yard', y0, x0, x1)
        add('yard', y1, x0, x1)
        add('x', x0, y0, y1)
        add('x', x1, y0, y1)
    for p, axis, c, a, b in OUTLINES:
        if p == plan:
            add(axis, c, a, b)
    for o in OPENINGS:
        if o['plan'] != plan:
            continue
        _, y0, y1, x0, x1 = rooms[o['room']]
        axis, c = {'a': ('yard', y0), 'f': ('yard', y1), 'p': ('x', x1), 's': ('x', x0)}[o['side']]
        openings.setdefault((axis, round(c, 4)), []).append((o['lo'], o['hi'], o['bottom'], o['top'], o['glass'] and o['room'] != 'kiosk'))
    for p, axis, c, a, b, sill, head, glass in OUTLINE_OPENINGS:
        if p == plan:
            openings.setdefault((axis, round(c, 4)), []).append((a, b, sill, head, glass))
    out = {}
    for key, iv in lines.items():
        axis, c = key
        iv = _union(iv)
        cuts = [(a, b) for p, ax, cc, a, b in NO_WALL if p == plan and ax == axis and abs(cc - c) < 1e-6]
        iv = _subtract(iv, cuts)
        if iv:
            out[key] = iv
    return out, openings


def _fit_to_hull(plan, lines):
    """Cut each wall to what stands inside her: a wall across her ends at her side, a wall along her where she narrows to it."""
    P = PLANS[plan]
    out = {}
    side_ends = {}                                       # where a side wall (one that follows her side) begins and ends
    for (axis, c), iv in lines.items():
        if axis == 'x' and _is_side(c):
            for a, b in iv:
                side_ends.setdefault(1 if c > 0 else -1, []).extend((a, b))
    for (axis, c), iv in lines.items():
        fitted = []
        if axis == 'yard':
            hb = P['breadth'](Z(c))
            for a, b in iv:
                for sgn in (1, -1):
                    # at her side the wall ends on the side wall's inner face; where the side wall begins or ends here, it takes the corner
                    corner = P['side'] == 'wall' and any(abs(e - c) < 1e-6 for e in side_ends.get(sgn, ()))
                    limit = hb - (0.0 if P['side'] == 'shell' or corner else T)
                    if sgn > 0:
                        b = min(b, limit)
                    else:
                        a = max(a, -limit)
                if b - a > 0.05:
                    fitted.append((a, b))
        elif _is_side(c):
            if P['side'] == 'wall':
                fitted = list(iv)
        else:
            for a, b in iv:
                if P['side'] == 'shell':
                    a = max(a, S.SHELL + 0.003)            # it begins on the transom's inner face, not in the transom's own plane
                run, yd = None, a
                while yd <= b + 1e-9:
                    inside = P['breadth'](Z(yd)) - abs(c) > 0.08
                    if inside and run is None:
                        run = yd
                    if not inside and run is not None:
                        fitted.append((run, yd - 0.05))
                        run = None
                    yd = round(yd + 0.05, 4)
                if run is not None:
                    fitted.append((run, b))
            fitted = [(a, b) for a, b in fitted if b - a > 0.05]
        if fitted:
            out[(axis, c)] = fitted
    return out


def _corners(lines):
    """Rule 2: at a corner the wall across the ship takes the corner and the wall along her butts against it."""
    out = {}
    along = {k: v for k, v in lines.items() if k[0] == 'x'}
    across = {k: v for k, v in lines.items() if k[0] == 'yard'}
    for (axis, c), iv in lines.items():
        fixed = []
        for a, b in iv:
            if axis == 'x':
                for (_, yd), spans in across.items():
                    if any(lo - T <= c <= hi + T for lo, hi in spans):
                        if abs(yd - a) < 1e-6:
                            a += T / 2
                        if abs(yd - b) < 1e-6:
                            b -= T / 2
            else:
                for (_, x), spans in along.items():
                    if _is_side(x):
                        continue
                    ends_here = any(abs(p - c) < 1e-6 or abs(q - c) < 1e-6 for p, q in spans)
                    passes = any(p + 1e-6 < c < q - 1e-6 for p, q in spans)
                    if ends_here and not passes:
                        if abs(x - a) < 1e-6:
                            a -= T / 2
                        if abs(x - b) < 1e-6:
                            b += T / 2
            fixed.append((a, b))
        out[(axis, c)] = fixed
    return out


def _is_exterior(plan, axis, c, mid):
    if plan == 'car' or plan == 'top':
        return True
    return any(p == plan and ax == axis and abs(cc - c) < 1e-6 and a - 1e-6 <= mid <= b + 1e-6 for p, ax, cc, a, b in EXTERIOR)


def _piece(walls, glass, plan, axis, c, a, b, y0, y1, colour):
    """A length of wall from a to b along its line, between two heights."""
    P = PLANS[plan]
    if b - a < 1e-6 or y1 - y0 < 1e-6:
        return
    if axis == 'yard':
        walls.box((a, y0, Z(c) - T / 2), (b, y1, Z(c) + T / 2), colour)
    elif not _is_side(c):
        walls.box((c - T / 2, y0, Z(a)), (c + T / 2, y1, Z(b)), colour)
    else:
        # along her side: its outer face follows the deck's edge, in lengths of a frame space where she narrows
        sgn = 1 if c > 0 else -1
        n = max(1, int(ceil((b - a) / 0.6))) if max(a, b) > 43.0 else 1
        for i in range(n):
            ya, yb = a + (b - a) * i / n, a + (b - a) * (i + 1) / n
            xa, xb = P['breadth'](Z(ya)), P['breadth'](Z(yb))
            ring = [(sgn * xa, Z(ya)), (sgn * xb, Z(yb)), (sgn * (xb - T), Z(yb)), (sgn * (xa - T), Z(ya))]
            start = len(walls.f)
            walls.grid([[(x, y0, z) for x, z in ring], [(x, y1, z) for x, z in ring]], colour, close=True)
            for y in (y0, y1):
                walls.polygon([(x, y, z) for x, z in ring], colour)
            mx, mz, my = sum(p[0] for p in ring) / 4, sum(p[1] for p in ring) / 4, (y0 + y1) / 2
            walls.orient(start, lambda q: (q[0] - mx, (q[1] - my) * 1e-3, q[2] - mz) if abs(q[1] - my) < (y1 - y0) / 2 - 1e-6 else (0, q[1] - my, 0))


def _glass(glass, plan, axis, c, a, b, y0, y1):
    P = PLANS[plan]
    m = 0.0
    if axis == 'yard':
        pts = [(a + m, y0, Z(c)), (b - m, y0, Z(c)), (b - m, y1, Z(c)), (a + m, y1, Z(c))]
    elif not _is_side(c):
        pts = [(c, y0, Z(a)), (c, y0, Z(b)), (c, y1, Z(b)), (c, y1, Z(a))]
    else:
        sgn = 1 if c > 0 else -1
        xa, xb = sgn * (P['breadth'](Z(a)) - T / 2), sgn * (P['breadth'](Z(b)) - T / 2)
        pts = [(xa, y0, Z(a)), (xb, y0, Z(b)), (xb, y1, Z(b)), (xa, y1, Z(a))]
    glass.polygon(pts, GLASS)


def walls(plan):
    P = PLANS[plan]
    lines, openings = wall_lines(plan)
    lines = _corners(_fit_to_hull(plan, lines))
    walls = part(P['group'], f"{P['name']}, walls", 'Bulkhead paint')
    glass = part(P['group'], f"{P['name']}, window glass", 'Window glass')
    floor, top = P['floor'], P['top']
    for (axis, c), iv in sorted(lines.items()):
        opens = sorted(openings.get((axis, c), []))
        if axis == 'x' and _is_side(c) and plan == 'passenger':
            # the windows down the passenger house's side: none where a wall across the ship lands on the side
            crossings = [yd for (ax, yd), spans in lines.items() if ax == 'yard' and any(max(abs(lo), abs(hi)) > HB - 0.4 and (hi if c > 0 else -lo) > HB - 0.4 for lo, hi in spans)]
            for w in SIDE_WINDOWS:
                if not any(w - 0.2 < yd < w + 1.4 for yd in crossings) and any(a + 0.2 < w and w + 1.2 < b - 0.2 for a, b in iv):
                    opens.append((w, w + 1.2, 0.95, 1.90, True))
            opens.sort()
        for a, b in iv:
            at = a
            for lo, hi, bottom, head, glazed in opens:
                if hi <= a + 1e-6 or lo >= b - 1e-6:
                    continue
                lo, hi = max(lo, a), min(hi, b)
                ext = _is_exterior(plan, axis, c, (at + lo) / 2)
                colour = WHITE if ext else PRIMER
                _piece(walls, glass, plan, axis, c, at, lo, floor, top, colour)
                _piece(walls, glass, plan, axis, c, lo, hi, floor, floor + bottom, colour)
                _piece(walls, glass, plan, axis, c, lo, hi, floor + head, top, colour)
                if glazed:
                    _glass(glass, plan, axis, c, lo, hi, floor + bottom, floor + head)
                at = hi
            ext = _is_exterior(plan, axis, c, (at + b) / 2)
            _piece(walls, glass, plan, axis, c, at, b, floor, top, WHITE if ext else PRIMER)


# =====================================================================================================================
# The decks
# =====================================================================================================================
def _outline(breadth, a, b, step=0.6):
    """A deck's outline between two yards, from its half-breadth: (x, yard) points, port side going forward, then starboard going aft."""
    n = max(1, int(round((b - a) / step)))
    yards = [a + (b - a) * i / n for i in range(n + 1)]
    port = [(breadth(Z(y)), y) for y in yards]
    return port + [(-x, y) for x, y in reversed(port)]


def _edge(part, loop, y0, y1, colour, out):
    """The edge of a plate along a loop of (x, yard) points, each length looking away from the plate: outward from an outline
    (out = 1), into the opening from a hole's (out = -1). By the loop's own winding, so that it holds for any outline."""
    pts = [(x, Z(yd)) for x, yd in loop]
    area = sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(pts, pts[1:] + pts[:1]))
    turn = out * (1 if area > 0 else -1)
    for (ax, az), (bx, bz) in zip(pts, pts[1:] + pts[:1]):
        if hypot(bx - ax, bz - az) < 1e-6:
            continue
        start = len(part.f)
        part.grid([[(ax, y0, az), (bx, y0, bz)], [(ax, y1, az), (bx, y1, bz)]], colour)
        part.orient(start, (turn * (bz - az), 0.0, -turn * (bx - ax)))


def _plate(group, name, outline, holes, y, paints, under=None):
    """
    One deck plate: its top in deck paint (in lengths of different paint: `paints` is [(yard from, yard to, colour)]), its
    underside in primer, and its edge all round and round every opening. `outline` is (x, yard) points; a hole is
    (x from, x to, yard from, yard to), or its own outline as (x, yard) points where it is not a rectangle. Two wells that
    touch are one hole: two holes with an edge in common cannot be cut from one plate.
    """
    top = part(group, f'{name}, plating', 'Deck paint')
    low = part(group, f'{name}, underside', 'Primer')
    under = under or tint(PRIMER, 1.02)
    P3 = lambda pts, yy: [(x, yy, Z(yd)) for x, yd in pts]
    loops = [list(h) if isinstance(h[0], tuple) else [(h[0], h[2]), (h[1], h[2]), (h[1], h[3]), (h[0], h[3])] for h in holes]
    holes = [(min(x for x, _ in l), max(x for x, _ in l), min(yd for _, yd in l), max(yd for _, yd in l)) for l in loops]
    if len(paints) == 1:
        start = len(top.f)
        top.polygon(P3(outline, y), paints[0][2], [P3(h, y) for h in loops])
        top.orient(start, (0, 1, 0))
    else:
        half = len(outline) // 2
        port, star = outline[:half], outline[half:][::-1]            # both going forward
        for a, b, colour in paints:
            def cut(side):
                pts = [(x, yd) for x, yd in side if a - 1e-6 <= yd <= b + 1e-6]
                for edge in (a, b):
                    if not any(abs(yd - edge) < 1e-6 for _, yd in pts):
                        for (x0, y0), (x1, y1) in zip(side, side[1:]):
                            if y0 < edge < y1:
                                pts.append((x0 + (x1 - x0) * (edge - y0) / (y1 - y0), edge))
                return sorted(pts, key=lambda p: p[1])
            region = cut(port) + cut(star)[::-1]
            mine = [h for h, (x0, x1, ya, yb) in zip(loops, holes) if a - 1e-6 <= ya and yb <= b + 1e-6]
            start = len(top.f)
            top.polygon(P3(region, y), colour, [P3(h, y) for h in mine])
            top.orient(start, (0, 1, 0))
    start = len(low.f)
    low.polygon(P3(outline, y - PLATE), under, [P3(h, y - PLATE) for h in loops])
    low.orient(start, (0, -1, 0))
    _edge(low, outline, y - PLATE, y, tint(WHITE, 0.92), 1)
    for loop in loops:
        _edge(low, loop, y - PLATE, y, tint(under, 0.9), -1)


def _beams(group, name, y, a, b, breadth, holes, skip=(), inset=0.03, reach=None):
    """The deck's beams under its plating, at every second frame: a flat bar from side to side, left out of the wells and
    where a bulkhead or a wall stands in its plane (rule 4)."""
    beams = part(group, f'{name}, beams', 'Primer plate')
    colour = tint(PRIMER, 0.95)
    k = int(ceil(a / L.FRAME_SPACING))
    while k * L.FRAME_SPACING <= b - 0.2:
        yard = k * L.FRAME_SPACING
        k += 1
        if (k - 1) % 2 or yard < a + 0.2 or any(abs(yard - s) < 0.06 for s in skip):
            continue
        hb = breadth(Z(yard)) - inset
        if reach:
            hb = min(hb, reach(Z(yard)) - 0.03)        # it ends on the inner edge of the frame it is bracketed to
        if hb < 0.4:
            continue
        spans = _subtract([(-hb, hb)], [(x0 - 0.02, x1 + 0.02) for x0, x1, ya, yb in holes if ya - 0.05 < yard < yb + 0.05])
        for x0, x1 in spans:
            if x1 - x0 > 0.15:
                beams.grid([[(x0, y - PLATE, Z(yard)), (x1, y - PLATE, Z(yard))], [(x0, y - PLATE - S.DECK_BEAM, Z(yard)), (x1, y - PLATE - S.DECK_BEAM, Z(yard))]], colour)


def _wall_yards(plan):
    """Where a wall across the ship stands on a plan: the yards of its beams' planes to keep clear of."""
    lines, _ = wall_lines(plan)
    return sorted({c for (axis, c) in lines if axis == 'yard'})


TR = S.CREW_TRUNK
# The wells: (x from, x to, yard from, yard to).
MAIN_WELLS = [(sx * 5.215 if sx > 0 else -6.70, sx * 6.70 if sx > 0 else -5.215, a, b) for sx in (1, -1) for a, b in ((25.2, 27.66), (42.34, 44.8))]
CAR_HOLES = [(S.LANE_IN[0] - 0.012, S.LANE_IN[1] + 0.012, 21.0, TR['fwd'][0])] + [S.hatch_opening(l) for l in S.LADDERS if l.get('hatch')]
PASSENGER_HOLES = MAIN_WELLS + [(5.215, 6.70, TR['yard'][0] + 0.012, TR['fwd'][0])]
WHEELHOUSE_STAIR = (-2.92, -2.12, BP.yard(17.90), BP.yard(20.15))          # the well of the crew stair that comes up into the wheelhouse
# At the bridge deck the trunk's well is one opening: the inner lane's as far as its landing, the outer lane's a metre further.
_T0 = TR['yard'][0] + 0.012
BRIDGE_TRUNK_WELL = [(5.215, _T0), (6.70, _T0), (6.70, TR['fwd'][0]), (5.95, TR['fwd'][0]), (5.95, 22.2), (5.215, 22.2)]
BRIDGE_HOLES = [BRIDGE_TRUNK_WELL, WHEELHOUSE_STAIR]
BRIDGE_BEAM_GAPS = [(5.215, 5.95, _T0, 22.2), (5.95, 6.70, _T0, TR['fwd'][0]), WHEELHOUSE_STAIR]
# The top deck is the roof of the accommodation and of the crew stair's head: its outline, (x, yard).
TOP_OUTLINE = [(5.2, 22.0), (5.2, 20.0), (HB, 20.0), (HB, 24.0), (5.2, 24.0), (5.2, 27.0), (HOUSE, 27.0), (HOUSE, 50.0), (-HOUSE, 50.0), (-HOUSE, 22.0)]


def decks():
    bulkheads = [b['yard'] for b in S.BULKHEADS]
    # ---- the car deck: from the transom to the stem, green; the hold's bulkheads stand under its beams' line
    car = PLANS['car']['breadth']
    a, b = 0.012, L.STEM_AT_CAR - 0.4
    _plate('car', 'Car deck', _outline(lambda z: car(z) - 0.004, a, b), CAR_HOLES, S.CAR_DECK, [(a, b, GREEN)])
    # (a beam ends on the inner edge of the frame it is bracketed to: in the frame's own plane it would be a second plate there)
    _beams('car', 'Car deck', S.CAR_DECK, a, b, car, CAR_HOLES, skip=bulkheads + [27.6], reach=hull_structure.frame_reach)
    # ---- the passenger deck (the upper deck): open and green aft and forward of the house, bare inside it
    up = lambda z: L.upper_breadth(z) - 0.016
    b = L.LENGTH - 0.5
    _plate('passenger', 'Passenger deck', _outline(up, a, b), PASSENGER_HOLES, S.PASSENGER_DECK, [(a, 13.0, GREEN), (13.0, 54.0, GREY), (54.0, b, GREEN)])
    _beams('passenger', 'Passenger deck', S.PASSENGER_DECK, a, b, up, PASSENGER_HOLES, skip=_wall_yards('car'), reach=hull_structure.topside_frame_reach)
    # ---- the bridge deck: from the funnels to the wheelhouse's front
    _plate('bridge', 'Bridge deck', _outline(up, 13.0, 54.0), BRIDGE_HOLES, S.BRIDGE_DECK, [(13.0, 54.0, GREEN)])
    _beams('bridge', 'Bridge deck', S.BRIDGE_DECK, 13.0, 54.0, up, BRIDGE_BEAM_GAPS, skip=_wall_yards('passenger'))
    # ---- the top deck
    _plate('top', 'Top deck', TOP_OUTLINE, [], S.TOP_DECK, [(20.0, 50.0, GREEN)])
    beams = part('top', 'Top deck, beams', 'Primer plate')
    skip = _wall_yards('bridge')
    for k in range(int(22.0 / 0.6) + 1, int(50.0 / 0.6) + 1):
        yard = k * 0.6
        if k % 2 or any(abs(yard - s) < 0.06 for s in skip):
            continue
        hb = (5.2 if yard < 27.0 else HOUSE) - 0.03
        y = S.TOP_DECK - PLATE
        beams.grid([[(-HOUSE + 0.03, y, Z(yard)), (hb, y, Z(yard))], [(-HOUSE + 0.03, y - S.DECK_BEAM, Z(yard)), (hb, y - S.DECK_BEAM, Z(yard))]], tint(PRIMER, 0.95))
    # ---- the roofs of the top deck's houses (the generator room has its own)
    roofs = part('top', 'Top deck houses, roofs', 'Topside paint')
    for (y0, y1, x0, x1) in ((27.0, 29.2, -ga.TOP_HOUSE, ga.TOP_HOUSE), (38.6, 40.0, -ga.TOP_HOUSE, ga.TOP_HOUSE), (40.0, 46.2, -ga.TOP_HOUSE, ga.TOP_HOUSE)):
        roofs.box((x0 - 0.04, S.TOP_HOUSE - PLATE, Z(y0) - (0.04 if y0 != 40.0 else 0.0)), (x1 + 0.04, S.TOP_HOUSE, Z(y1) + (0.04 if y1 != 40.0 else 0.0)), tint(WHITE, 0.97))


# =====================================================================================================================
# Rails
# =====================================================================================================================
def rails(group, name, path, y, post_every=1.5, courses=((1.0, 0.019), (0.62, 0.012), (0.30, 0.012))):
    """A three-course rail along a path of (x, yard) points, with a stanchion at each corner and about every 1.5 m between."""
    r = part(group, name, 'Topside paint', smooth=True, angle=40)
    for (xa, ya), (xb, yb) in zip(path, path[1:]):
        length = hypot(xb - xa, yb - ya)
        if length < 1e-4:
            continue
        for h, rad in courses:
            r.tube((xa, y + h, Z(ya)), (xb, y + h, Z(yb)), rad, colour=RAIL, sides=6, caps=(True, True))
        n = max(1, int(ceil(length / post_every)))
        for i in range(n + 1):
            f = i / n
            px, pz = xa + (xb - xa) * f, Z(ya + (yb - ya) * f)
            if i == 0 and (xa, ya) != path[0]:
                continue                                              # the corner's post was set by the length before
            r.tube((px, y, pz), (px, y + courses[0][0], pz), 0.0135, colour=RAIL, sides=6)


def open_deck_rails():
    up = lambda yd: L.upper_breadth(Z(yd)) - 0.09
    y = S.BRIDGE_DECK
    # ---- the bridge deck: across its after end between the two ladders' heads, and down each side to the wings
    aft = 13.08
    rails('bridge', 'Bridge deck, rails', [(-5.88, aft), (5.88, aft)], y)
    for sgn in (1, -1):
        rails('bridge', 'Bridge deck, rails', [(sgn * 6.62, aft), (sgn * up(aft), aft)] + [(sgn * up(yd), yd) for yd in (15.0, 17.0, 19.0)] + ([(sgn * up(19.92), 19.92)] if sgn > 0 else []), y)
        start = 24.08 if sgn > 0 else 19.0
        side = [(sgn * up(yd), yd) for yd in [start] + [v for v in range(26, 50, 2) if v > start + 0.5] + [49.96]]
        rails('bridge', 'Bridge deck, rails', side + [(sgn * (BP.WING + 0.06), 49.96)], y)
    # ---- the top deck: round its edge, from one side of the ladder's head to the other, and to the compass deck's own rail
    y = S.TOP_DECK
    i = 0.08
    rails('top', 'Top deck, rails', [(-2.58, 22 + i), (5.2 - i, 22 + i), (5.2 - i, 20 + i), (HB - i, 20 + i), (HB - i, 24 - i), (5.2 - i, 24 - i), (5.2 - i, 27 + i), (HOUSE - i, 27 + i),
                                     (HOUSE - i, 50 - i), (2.97, 50 - i)], y)
    rails('top', 'Top deck, rails', [(-3.42, 22 + i), (-HOUSE + i, 22 + i), (-HOUSE + i, 50 - i), (-2.97, 50 - i)], y)


# =====================================================================================================================
# The crew stair trunk, the flats in the machinery spaces
# =====================================================================================================================
def crew_trunk():
    """The trunk's own floors between its walls: the half landing between the car deck and the passenger deck, the one
    between the passenger deck and the bridge deck, and the guards round the well at its head."""
    land = part('car', 'Crew stair trunk, landings', 'Machinery paint')
    upper = part('passenger', 'Crew stair trunk, upper landings', 'Machinery paint')
    grey = srgb(S.LIGHT_GREY)
    x0, split = TR['x'][0] + T / 2, (S.LANE_IN[1] + S.LANE_OUT[0]) / 2
    a0, a1 = TR['yard'][0] + T / 2, TR['aft'][1]
    # between the car deck and the passenger deck her frames stand inside the shell; above it the house's side is plain
    land.box((x0, TR['mid'] - 0.05, Z(a0)), (L.half_breadth(Z(20.4)) - 0.012, TR['mid'], Z(a1)), grey)
    out = L.upper_breadth(Z(20.4)) - 0.004 - T
    upper.box((x0, TR['upper'] - 0.05, Z(a0)), (split, TR['upper'], Z(a1)), grey)
    upper.box((split, TR['upper'] - 0.05, Z(a0)), (out, TR['upper'], Z(21.8)), tint(grey, 0.98))
    # the guards at the bridge deck: along the inner lane's landing beside the well, and across the outer lane's
    rails('bridge', 'Crew stair head, guard rails', [(split, 22.2), (split, TR['fwd'][0]), (out - 0.02, TR['fwd'][0])], S.BRIDGE_DECK, post_every=1.2)


def flats():
    """The flats at 2.9 m in the machinery spaces: the engine room's port platform at the foot of the crew stair, and the
    floors of the engine control room and the workshop. Floor plates on bearers, pillars down to the tank top, a rail where
    an edge is open."""
    plates = part('machinery', 'Machinery flats, plates', 'Floor plate')
    steel = part('machinery', 'Machinery flats, bearers and pillars', 'Machinery paint')
    dark, plate = srgb(S.DARK_GREY), srgb(S.FLOOR_PLATE)
    y = S.FLAT

    def flat(x0, x1, a, b, pillars):
        x0, x1 = sorted((x0, x1))
        n, m = max(1, round((b - a) / 0.9)), max(1, round((x1 - x0) / 0.9))
        for i in range(n):
            for j in range(m):
                xa, xb = x0 + (x1 - x0) * j / m + 0.004, x0 + (x1 - x0) * (j + 1) / m - 0.004
                za, zb = Z(a + (b - a) * i / n) + 0.004, Z(a + (b - a) * (i + 1) / n) - 0.004
                plates.box((xa, y - 0.006, za), (xb, y, zb), tint(plate, 1 + 0.03 * (((i * 7 + j * 13) % 5) - 2) / 2))      # 6 mm of plate
        # bearers under the plates' seams across the ship, an edge bearer along the open side, pillars under it
        for i in range(n + 1):
            yd = a + (b - a) * i / n
            steel.box((x0, y - 0.10, Z(yd) - 0.03), (x1, y - 0.006, Z(yd) + 0.03), dark)
        for x in (x0, x1):
            steel.box((x - 0.03, y - 0.16, Z(a)), (x + 0.03, y - 0.10, Z(b)), dark)
        for px, pyd in pillars:
            steel.tube((px, S.TANK_TOP, Z(pyd)), (px, y - 0.16, Z(pyd)), 0.05, colour=dark, sides=10)

    er = next(s for s in ga.SPACES if s['id'] == 'er-platform')
    (a, b), (x0, x1) = er['yard'], er['x']
    b -= 0.02
    flat(x0, x1, a, b, [(x0, a + 0.2), (x0, (a + b) / 2), (x0, b - 0.2), (x1 - 0.4, a + 0.2), (x1 - 0.4, (a + b) / 2), (x1 - 0.4, b - 0.2)])
    ladder = next(st for st in S.STAIRS if st['id'] == 'engine-room')
    lx0, lx1 = ladder['x']
    rails('machinery', 'Machinery flats, rails', [(x0 + 0.04, b), (x0 + 0.04, a + 0.04), (lx0 - 0.06, a + 0.04)], y, post_every=1.3)
    rails('machinery', 'Machinery flats, rails', [(lx1 + 0.06, a + 0.04), (x1 - 0.04, a + 0.04)], y, post_every=1.3)
    for room in ('ecr', 'workshop'):
        sp = next(s for s in ga.SPACES if s['id'] == room)
        (a, b), (x0, x1) = sp['yard'], sp['x']
        inner = x0 if x0 > 0 else x1
        outer = x1 if x0 > 0 else x0
        sgn = 1 if x0 > 0 else -1
        flat(inner, outer + sgn * 0.25, a, b - 0.02, [(inner, a + 0.2), (inner, (a + b) / 2), (inner, b - 0.25), (outer, a + 0.2), (outer, (a + b) / 2), (outer, b - 0.25)])


# =====================================================================================================================
# The stern ramp and the inner bow door, the funnels, the wheelhouse's after wall
# =====================================================================================================================
# The stern ramp, its two hydraulic cylinders and the lights of the after end are specified in spec.py (STERN_DOOR,
# STERN_RAMP, STERN_LIGHTS), where the yard's drawing of the after end reads them too. The model's z of a place given there
# as metres inside the transom:
STERN_RAMP = dict(S.STERN_RAMP)
_IN = lambda inside: -L.HALF + inside
STERN_RAMP['hinge3'] = (0.0, S.STERN_RAMP['hinge'][0], _IN(S.STERN_RAMP['hinge'][1]))
STERN_RAMP['trunnion3'] = (S.STERN_RAMP['trunnion'][0], _IN(S.STERN_RAMP['trunnion'][1]))
STERN_RAMP['pin3'] = (S.STERN_RAMP['pin'][0], _IN(S.STERN_RAMP['pin'][1]))


def motion():
    """What of her steel can be worked on the page: the stern ramp, by a control in the bar as the rudder is. The ramp turns on
    its hinges; each cylinder swings on its trunnion to follow its pin on the ramp, and its rod runs out as far as the pin has
    gone (the page's `aim`, as the steering gear's rams are worked)."""
    R = STERN_RAMP
    # On the page's desk: Raise, Stop, Lower. Lowering, it stops by itself level with the car deck (90 degrees); Lower again
    # takes it on to a low quay. Three degrees a second is the yard's figure for the page: half a minute to the quay. A real
    # ramp of this size takes about a minute (recalled, not read).
    inputs = [dict(id=R['id'], name='Stern ramp', min=0, max=R['lowered'], step=1, unit='°', below='raised', above='lowered', rest='raised',
                   keys=['Raise', 'Stop', 'Lower'], stops=[dict(v=90, say='level'), dict(v=R['lowered'], say='low quay')], rate=3)]
    # about the athwartships axis through its hinges; its head goes aft and down
    movers = [dict(id=R['id'], kind='turn', input=R['id'], axis=[1, 0, 0], pivot=list(R['hinge3']), ratio=-1.0)]
    for sgn, tag in ((1, 'p'), (-1, 's')):
        x = sgn * R['ram_x']
        ram = dict(kind='aim', input=R['id'], axis=[1, 0, 0], pivot=list(R['hinge3']), ratio=-1.0,
                   anchor=[x, R['trunnion3'][0], R['trunnion3'][1]], pin=[x, R['pin3'][0], R['pin3'][1]])
        movers.append(dict(ram, id=f"{R['id']}-ram-{tag}"))
        movers.append(dict(ram, id=f"{R['id']}-ram-{tag}-rod", extend=True))
    return inputs, movers


def doors_shut():
    """The stern ramp, drawn raised: it is the stern door, and it lowers (motion). And the inner bow door's ramp, raised in the
    collision bulkhead's opening, which does not move yet: the visor before it is not cut. Each is a stiffened slab: its
    roadway inside, its plating outside."""
    ramp = part('car', 'Stern ramp', 'Topside paint', mover=STERN_RAMP['id'])
    road = part('car', 'Stern ramp, roadway', 'Deck paint', mover=STERN_RAMP['id'])
    lugs = part('car', 'Stern ramp, hinge lugs', 'Machinery paint')
    z0 = -L.HALF
    R = STERN_RAMP
    h = R['half']
    y0, y1 = S.CAR_DECK + R['foot'], S.CAR_DECK + R['head']
    ramp.box((-h, y0, z0 + R['thick'][0]), (h, y1, z0 + R['thick'][1]), tint(WHITE, 0.97))
    road.box((-h + 0.05, y0 + 0.05, z0 + 0.14), (h - 0.05, y1 - 0.05, z0 + 0.15), tint(GREEN, 0.95))
    for k in range(1, 8):                                                        # the non-slip bars across its roadway
        yy = y0 + (y1 - y0) * k / 8
        road.box((-h + 0.2, yy - 0.02, z0 + 0.15), (h - 0.2, yy + 0.02, z0 + 0.165), tint(GREEN, 0.8))
    for x in (-h, h - R['lug']):                                                 # its hinge lugs on the sill: they stay when it lowers
        lugs.box((x, S.CAR_DECK, z0 + 0.05), (x + R['lug'], y0, z0 + 0.13), srgb(S.DARK_GREY))
    # ---- its two hydraulic cylinders
    dark, steel, yellow = srgb(S.DARK_GREY), srgb(S.STEEL), srgb(S.RAIL_YELLOW)
    (ty, tz), (py, pz) = R['trunnion3'], R['pin3']
    length = hypot(py - ty, pz - tz)
    along = lambda d: (ty + (py - ty) * d / length, tz + (pz - tz) * d / length)           # a point d metres from the trunnion toward the pin
    for sgn, tag, label in ((1, 'p', 'port'), (-1, 's', 'starboard')):
        x = sgn * R['ram_x']
        # the lug on the ramp's roadway that the rod is pinned to: it goes with the ramp
        lug = part('car', 'Stern ramp, cylinder lugs', 'Machinery paint', mover=R['id'])
        lug.box((x - 0.07, py - 0.10, z0 + 0.15), (x + 0.07, py + 0.10, pz + 0.07), dark)
        # the pedestal on the car deck that carries the trunnion: a column on a foot plate, stayed aft and forward, painted to be seen
        ped = part('car', 'Stern ramp, cylinder pedestals', 'Machinery paint')
        fw, fl, c = R['footplate'][0] / 2, R['footplate'][1] / 2, R['column'] / 2
        ped.box((x - fw, S.CAR_DECK, tz - fl), (x + fw, S.CAR_DECK + 0.02, tz + fl), dark)
        ped.box((x - c, S.CAR_DECK + 0.02, tz - c), (x + c, ty + R['column_over'], tz + c), yellow)
        for way in (-1, 1):                                                       # a stay each way, from the foot plate to the column's head
            ped.tube((x, S.CAR_DECK + 0.02, tz + way * 0.28), (x, ty - 0.35, tz + way * 0.07), 0.03, colour=yellow, sides=8)
        # the cylinder: its barrel on the trunnion, and the rod that runs out of it to the lug
        barrel = part('car', f'Stern ramp cylinder, {label}', 'Machinery paint', smooth=True, angle=40, mover=f"{R['id']}-ram-{tag}")
        rod = part('car', f'Stern ramp cylinder rod, {label}', 'Shaft steel', smooth=True, angle=40, mover=f"{R['id']}-ram-{tag}-rod")
        (ay, az), (by, bz) = along(0.0), along(R['barrel'])
        barrel.tube((x, ay, az), (x, by, bz), R['barrel_d'] / 2, colour=srgb(S.LIGHT_GREY), sides=16)
        (cy, cz), (dy, dz) = along(R['barrel'] - 0.02), along(R['barrel'] + 0.06)
        barrel.tube((x, cy, cz), (x, dy, dz), 0.10, colour=dark, sides=16)                  # its gland
        (ey, ez), (fy, fz) = along(R['rod_from']), along(length)
        rod.tube((x, ey, ez), (x, fy, fz), R['rod_d'] / 2, colour=steel, sides=12)
    bow = part('car', 'Inner bow door', 'Topside paint')
    bow_road = part('car', 'Inner bow door, roadway', 'Deck paint')
    zc = Z(S.COLLISION)
    h = BOW_DOOR['half'] - 0.02
    y0, y1 = S.CAR_DECK + 0.02, S.CAR_DECK + BOW_DOOR['height'] - 0.02
    bow.box((-h, y0, zc + 0.03), (h, y1, zc + 0.13), tint(WHITE, 0.97))
    bow_road.box((-h + 0.05, y0 + 0.05, zc + 0.02), (h - 0.05, y1 - 0.05, zc + 0.03), tint(GREEN, 0.95))
    for k in range(1, 8):
        yy = y0 + (y1 - y0) * k / 8
        bow_road.box((-h + 0.2, yy - 0.02, zc + 0.005), (h - 0.2, yy + 0.02, zc + 0.02), tint(GREEN, 0.8))
    for x in (-h, h - 0.12):
        bow.box((x, S.CAR_DECK, zc + 0.04), (x + 0.12, y0, zc + 0.12), srgb(S.DARK_GREY))


def _tilted(part, middle, half, tilt, colour):
    """A box that looks aft and `tilt` degrees down: `half` is half its width, its height and its depth (along its look)."""
    t = radians(tilt)
    look, up = (0.0, -sin(t), -cos(t)), (0.0, cos(t), -sin(t))
    hu, hv, hw = half
    at = lambda a, b, c: tuple(middle[i] + (a * hu if i == 0 else 0.0) + b * hv * up[i] + c * hw * look[i] for i in range(3))
    p = [part.vert(at(a, b, c)) for a, b, c in ((-1, -1, -1), (1, -1, -1), (1, 1, -1), (-1, 1, -1), (-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1))]
    start = len(part.f)
    for f in ((0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)):
        part.face(tuple(p[i] for i in f), colour)
    part.orient(start, lambda c: tuple(c[i] - middle[i] for i in range(3)))


def stern_lights():
    """The lights of the after end (spec.STERN_LIGHTS): the sternlight on the bulwark's rail over the stern door, a
    floodlight over each corner of the door, and the red and green signal for those who drive aboard. Each stands on a
    bracket clipped over the bulwark's plate or fixed on the transom, where its cable comes through the plating behind it."""
    from shipyard import component
    Q = S.STERN_LIGHTS
    z0 = -L.HALF
    dark, black, grey = srgb(0x252e30), srgb(0x1a1f20), srgb(S.LIGHT_GREY)
    steel = part('passenger', 'Stern lights, brackets', 'Machinery paint')
    lamps = part('passenger', 'Stern lights, lanterns', 'Machinery paint', smooth=True, angle=40)
    glass = part('passenger', 'Stern lights, glasses', 'Lens', smooth=True, angle=50)
    rail = S.PASSENGER_DECK + L.BULWARK
    # ---- the sternlight (the register's NLT-06): its bracket clipped over the bulwark's head, the lantern abaft it, a screen forward of it
    q = Q['sternlight']
    with component('NLT-06'):
        zc = z0 - q['aft']
        steel.box((q['x'] - 0.06, rail - 0.10, zc - 0.07), (q['x'] + 0.06, q['y'], z0 + 0.04), dark)
        lamps.tube((q['x'], q['y'], zc), (q['x'], q['y'] + 0.04, zc), 0.070, colour=dark, sides=16)
        glass.tube((q['x'], q['y'] + 0.04, zc), (q['x'], q['y'] + 0.17, zc), 0.062, colour=srgb(0xf6f1e2), sides=16)
        lamps.tube((q['x'], q['y'] + 0.17, zc), (q['x'], q['y'] + 0.21, zc), 0.072, colour=dark, sides=16)
        steel.box((q['x'] - 0.13, q['y'], z0 + 0.012), (q['x'] + 0.13, q['y'] + 0.25, z0 + 0.027), black)      # the screen: no light forward of the beam
    # ---- a floodlight over each corner of the stern door, looking aft
    q = Q['floods']
    for sgn in (1, -1):
        x = sgn * q['x']
        steel.box((x - 0.05, rail - 0.10, z0 - 0.04), (x + 0.05, rail + 0.02, z0 + 0.04), dark)
        steel.tube((x, rail + 0.02, z0), (x, q['y'] - 0.05, z0), 0.025, colour=dark, sides=8)      # the post ends inside the head
        w, h, d = q['head']
        middle = (x, q['y'], z0 - q['aft'])
        _tilted(lamps, middle, (w / 2, h / 2, d / 2), q['tilt'], tint(grey, 0.8))
        face = (x, q['y'] - sin(radians(q['tilt'])) * (d / 2 + 0.006), z0 - q['aft'] - cos(radians(q['tilt'])) * (d / 2 + 0.006))
        _tilted(glass, face, (w / 2 - 0.02, h / 2 - 0.02, 0.006), q['tilt'], srgb(0xdfe6e1))
    # ---- the signal: red over green on the transom to starboard of the door, under a hood
    q = Q['signal']
    x = q['x']
    w, h, d = q['size']
    lamps.box((x - w / 2, q['y'], z0 - d), (x + w / 2, q['y'] + h, z0), black)
    lamps.box((x - w / 2 - 0.04, q['y'] + h, z0 - d - 0.10), (x + w / 2 + 0.04, q['y'] + h + 0.02, z0), black)      # its hood
    for dy, colour in ((0.42, 0xc2412f), (0.16, 0x2f9e5a)):
        glass.tube((x, q['y'] + dy, z0 - d), (x, q['y'] + dy, z0 - d - 0.02), 0.09, colour=srgb(colour), sides=18)


# A funnel: its casing's plan on the bridge deck (ga.py: 13 to 20 m, 3.2 to 5.8 m off the centreline), its top, and the band.
FUNNEL = dict(yard=(13.6, 19.6), x=(3.4, 5.6), foot=S.BRIDGE_DECK, top_aft=L.Y(20.6), top_fwd=L.Y(21.5), band=0.7, lean=0.9)


def funnels():
    """The two funnels, on the bridge deck over their casings: plated in the line's teal with a black head, the forward end
    raked, each closed by a plate set down in its top with the exhausts standing through it. The line's J is painted on
    their sides (livery.py)."""
    plating = part('bridge', 'Funnels', 'Topside paint')
    pipes = part('bridge', 'Funnels, exhausts', 'Machinery paint', smooth=True, angle=40)
    F = FUNNEL
    (a, b), (x0, x1), y0 = F['yard'], F['x'], F['foot']
    for sgn in (1, -1):
        xs = sorted((sgn * x0, sgn * x1))

        def ring(f):
            """The funnel's section at a share f of its height: its sides are upright and flat (the line's mark is painted on
            them), its after end is upright, its forward end rakes aft."""
            return [(xs[0], a), (xs[1], a), (xs[1], b - F['lean'] * f), (xs[0], b - F['lean'] * f)]

        def height(f, yd):
            top = F['top_aft'] + (F['top_fwd'] - F['top_aft']) * (yd - a) / (b - a)
            return y0 + (top - y0) * f

        band = 1 - F['band'] / (F['top_fwd'] - y0)
        rows = []
        for f in (0.0, band, 1.0):
            rows.append([(x, height(f, yd), Z(yd)) for x, yd in ring(f)])
        cx, cz = (xs[0] + xs[1]) / 2, Z((a + b) / 2)
        for i, colour in ((0, TEAL), (1, srgb(S.BLACK))):
            start = len(plating.f)
            plating.grid([rows[i], rows[i + 1]], colour, close=True)
            plating.orient(start, lambda c: (c[0] - cx, 0, c[2] - cz))
        # the plate that closes it, 0.25 m down inside the head, and the plating's inner face above it
        f = 1 - 0.25 / (F['top_fwd'] - y0)
        lid = [(x, height(f, yd), Z(yd)) for x, yd in ring(f)]
        start = len(plating.f)
        plating.polygon(lid, srgb(S.DARK_GREY))
        plating.orient(start, (0, 1, 0))
        inner = [[(x + (cx - x) * 0.012, yy, z + (cz - z) * 0.012) for x, yy, z in row] for row in (lid, rows[2])]
        start = len(plating.f)
        plating.grid(inner, tint(srgb(S.BLACK), 0.8), close=True)
        plating.orient(start, lambda c: (cx - c[0], 0, cz - c[2]))
        for yd, r in ((15.2, 0.22), (16.6, 0.22), (18.0, 0.14)):
            base = height(f, yd)
            pipes.tube((cx, base, Z(yd)), (cx, height(1.0, yd) + 0.35, Z(yd)), r, colour=srgb(S.BLACK), sides=14)


def wheelhouse_after_wall():
    """
    The wheelhouse's after wall below 2.08 m, which the bridge (wheelhouse.py) leaves to the ship: on the first Chisum it was
    the other ship's. Plating aft and lining forward, as the bridge has them above it; open for the corridor's door and for
    the crew stair that comes up through it.
    """
    plating = part('bridge', 'Wheelhouse after wall, plating', 'Topside paint')
    lining = part('bridge', 'Wheelhouse after wall, lining', 'Lining')
    y = BP.DECK
    # (the lining's face stands at 19.54 m in the bridge's measure, where the first Chisum's wall stood: what is fitted on
    # this wall was drawn a millimetre off that face)
    z0, z1, z2 = BP.Z(19.495), BP.Z(19.52), BP.Z(19.54)
    head = 2.08
    white, cream = srgb(0xeeeae0), srgb(0xe3dfd2)
    spans = [(-2.997, -2.92, 0.0, head), (-2.92, -2.12, 1.50, head), (-2.12, -0.40, 0.0, head), (-0.40, 0.40, 1.92, head), (0.40, 2.997, 0.0, head)]
    for x0, x1, h0, h1 in spans:
        plating.box((x0, y + h0, z0), (x1, y + h1, z1), white)
        lining.box((x0, y + h0, z1), (x1, y + h1, z2), cream)


def build():
    _parts.clear()
    decks()
    for plan in PLANS:
        walls(plan)
    crew_trunk()
    flats()
    doors_shut()
    stern_lights()
    funnels()
    wheelhouse_after_wall()
    open_deck_rails()
    return [p for p in _parts.values() if p.f]
