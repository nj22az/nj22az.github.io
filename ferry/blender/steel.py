"""
Her bare steel above the tank top, built from the general arrangement (ga.py, revision D): every deck's plating with the
wells cut in it and the beams under it, the walls of every space with its doorways and windows, the side casings on the
main deck, the fixed ramp to the upper deck, the cargo lift's platform, the house in its four tiers, the helicopter deck,
the two funnels, the stern ramp on its hydraulic cylinders, the pilot doors, the engine room platform, the stair trunk's
landings, and the rails of the open decks.

It is the ship before her outfit: steel walls in primer inside and white outside, door openings without doors, windows
with their glass. Nothing here is furniture. Each room of ga.py is a room one can walk into.

**No two faces in one plane** (the owner, 11 November 2026: "Z fighting is not allowed", "Design with anti z fighting
measures"; JSY-STD-403). The rules this file is built on:
  1. A wall is drawn once. Every room gives its four edges; edges that fall on one line are merged before anything is
     built, so the wall two rooms share is one wall.
  2. At a corner one wall takes the corner and the other butts against its face: the wall across the ship is carried to
     the outer face of the wall along her, which begins half a thickness short. Where a wall ends against the middle of
     another it ends inside it.
  3. A deck is one plate with its openings cut out of it: no second plate is laid over a well, and nothing lies flush on
     a deck. What stands on a deck meets it face to face. A window's rounded corners are pieces of the wall's own
     thickness set in the corners of its opening: beside the wall's faces, never on them.
  4. A beam is left out where a wall or a bulkhead stands in its plane.
  5. Faces that look the same way are never nearer than 10 mm: a wall's two faces, a deck's two faces, the house's side
     and the bulwark beside it.
  9. What follows her side follows her lines: a wall across the vehicle deck ends on the topsides' own straight section
     (lines.topside_x), and the forecastle deck rises with lines.deck_y at the frames.
 10. What moves is clear of what it passes: the stern ramp lies 20 mm abaft the transom's plating, a pilot door's leaf
     4 mm off its frame.
zfight.py holds the whole ship to it after every build.

Drawn in the ship's axes (lines.py): x to port, y up from the waterline, z forward from amidships.
"""
from math import pi, cos, sin, ceil, hypot, radians, tan
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
HH = ga.HOUSE_HALF             # the half breadth of the house's upper tiers
HR = ga.BOAT_RECESS            # and of the boat deck's house where the lifeboats stand beside it
C = ga.CASING
WHITE, PRIMER, GREEN, GREY = srgb(S.WHITE), srgb(S.PRIMER), srgb(S.DECK_GREEN), srgb(S.DECK_GREY)
GLASS = srgb(0x2d4a55)
RAIL = srgb(0xe9e7df)
TEAL = srgb(S.TEAL)
DARK, STEEL, YELLOW, LIGHT = srgb(S.DARK_GREY), srgb(S.STEEL), srgb(S.RAIL_YELLOW), srgb(S.LIGHT_GREY)

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
FAR = 99.0                     # no hull to fit a wall to: the upper tiers stand inside their own outlines
PLANS = dict(
    main=dict(group='main', name='Main deck', floor=S.MAIN_DECK, top=S.UPPER_DECK - PLATE, side='shell', breadth=lambda z: L.half_breadth(z) - 0.014),
    upper=dict(group='upper', name='Upper deck', floor=S.UPPER_DECK, top=S.BOAT_DECK - PLATE, side='wall', breadth=lambda z: L.upper_breadth(z) - 0.004),
    boat=dict(group='boat', name='Boat deck', floor=S.BOAT_DECK, top=S.OFFICERS_DECK - PLATE, side='wall', breadth=lambda z: FAR),
    officers=dict(group='officers', name="Officers' deck", floor=S.OFFICERS_DECK, top=S.BRIDGE_DECK - PLATE, side='wall', breadth=lambda z: FAR),
    bridge=dict(group='bridge', name='Bridge deck', floor=S.BRIDGE_DECK, top=S.COMPASS_DECK - PLATE, side='wall', breadth=lambda z: FAR),
    platform=dict(group='machinery', name='Engine room platform', floor=S.PLATFORM, top=S.MAIN_DECK - PLATE, side='shell', breadth=lambda z: L.hull_x(S.PLATFORM + 0.4, z) - 0.33),
)
# Spaces of ga.py that have no walls of their own: open decks, and the open-plan spaces bounded by the rooms round them.
OPEN = dict(
    main={'stern-ramp', 'vehicle-deck', 'fixed-ramp', 'cargo-lift'},
    upper={'aft-deck', 'helideck', 'funnel-p', 'funnel-s', 'trailer-deck', 'ramp-cover', 'walkway-p', 'walkway-s', 'forecastle',
           'after-lobby', 'stair-lobby-p', 'stair-lobby-s', 'corridor-p', 'corridor-s', 'corridor-fwd'},
    boat={'boat-deck-p', 'boat-deck-s', 'boat-lobby-aft', 'boat-lobby-fwd', 'boat-corridor-p', 'boat-corridor-s'},
    officers={'officers-deck-aft', 'eg-room', 'officers-corridor-p', 'officers-corridor-s', 'officers-lobby'},     # the generator room builds its own walls (eg_room.py)
    bridge={'bridge-deck-open', 'wheelhouse'},
    platform={'er-platform'},
)
H0, H1 = ga.HOUSE
TR = ga.TRUNK
REC = ga.BOAT_RECESS_TO        # where the boat deck's house widens from its recess to its full breadth
OFF = ga.OFF                   # where the officers' house begins
BH = ga.BH
# The outlines of the houses, where no room's edge gives them: (plan, 'x' or 'yard', where, from, to).
OUTLINES = [
    # the boat deck's house: its after wall and its sides beside the two cross passages; the step where it widens
    ('boat', 'yard', H0, -HR, HR), ('boat', 'x', HR, H0, 81.3), ('boat', 'x', -HR, H0, 81.3),
    ('boat', 'x', HH, 98.5, 99.8), ('boat', 'x', -HH, 98.5, 99.8),
    # the officers' house: its after wall beside the stair trunk, its sides beside the cross passage
    ('officers', 'yard', OFF, TR['half'], BH), ('officers', 'yard', OFF, -BH, -TR['half']),
    ('officers', 'x', HH, 97.0, 98.05), ('officers', 'x', -HH, 97.0, 98.05),
    # the house abaft the wheelhouse: its starboard side beside the well of the stair that comes up into the wheelhouse
    ('bridge', 'x', -BH, 98.35, 100.0),
]
# Where an edge of a room is not a wall: the after mooring stations stand against the transom; the rooms on the engine
# room platform stand against a watertight bulkhead; the wheelhouse's own after wall is built with it (below); the stair
# lobbies are open to the after lobby.
NO_WALL = [
    ('main', 'yard', 0.0, -HB, HB),
    ('platform', 'yard', S.fr(28), -HB, HB),
    ('bridge', 'yard', 100.0, -3.0, 3.0),
]
# Walls that look on the weather are white; the others are in primer.
EXTERIOR = [
    ('upper', 'yard', H0, -HB, HB), ('upper', 'yard', H1, -HB, HB), ('upper', 'x', HB, H0, H1), ('upper', 'x', -HB, H0, H1),
    ('boat', 'yard', H0, -HR, HR), ('boat', 'x', HR, H0, REC), ('boat', 'x', -HR, H0, REC), ('boat', 'yard', REC, HR, HH), ('boat', 'yard', REC, -HH, -HR),
    ('boat', 'x', HH, REC, H1), ('boat', 'x', -HH, REC, H1), ('boat', 'yard', H1, -HH, HH),
    ('officers', 'yard', OFF, -HH, HH), ('officers', 'x', HH, OFF, H1), ('officers', 'x', -HH, OFF, H1), ('officers', 'yard', H1, -HH, HH),
    ('bridge', 'yard', 94.0, -BH, BH), ('bridge', 'x', BH, 94.0, 100.0), ('bridge', 'x', -BH, 94.0, 100.0),
]

# ---- Doorways and windows. Each: plan, room, which of its sides ('a' its after end, 'f' its forward end, 'p' its port
# side, 's' its starboard side), from and to along that wall (off the centreline for 'a' and 'f', metres from the transom
# for 'p' and 's'), and for a window its sill and head over the deck. A doorway is 2.05 m high.
DOOR_HEAD = 2.05
OPENINGS = []


def door(plan, room, side, a, b, head=DOOR_HEAD, sill=0.0, glass=False):
    OPENINGS.append(dict(plan=plan, room=room, side=side, lo=min(a, b), hi=max(a, b), bottom=sill, top=head, glass=glass))


def window(plan, room, side, a, b, sill=0.95, head=1.75):
    door(plan, room, side, a, b, head=head, sill=sill, glass=True)


def windows(plan, room, side, starts, width=1.1, sill=0.95, head=1.75):
    """Windows of one size along a wall: `starts` are where each begins. Sizes are ISO 3903's as the yard's reference has
    them: 1100 x 800 in the public rooms, 900 x 630 in the cabins."""
    for a in starts:
        window(plan, room, side, a, a + width, sill, head)


CABIN = dict(width=0.9, sill=1.05, head=1.68)
# ---- The main deck: each casing room is entered from the lanes; the stairs' rooms at their landings.
for _room, _side, _a, _b in (
        ('aft-mooring-p', 's', 5.6, 6.5), ('hydraulic-room', 's', 9.4, 10.3), ('deck-store-p', 's', 13.9, 14.8), ('uptake-p', 's', 21.9, 22.8),
        ('er-entrance', 's', 29.85, 30.55), ('deck-workshop', 's', 33.9, 34.8), ('lashing-store', 's', 42.0, 42.9), ('hold-stair-head', 's', 53.65, 54.45),
        ('fan-room', 's', 59.7, 60.6), ('pilot-lobby-p', 's', 70.3, 71.2), ('main-stair-p', 's', 72.6, 73.6), ('bosun-store', 's', 86.9, 87.8),
        ('aft-mooring-s', 'p', 5.6, 6.5), ('deck-store-s', 'p', 9.4, 10.3), ('pilot-lobby-s', 'p', 70.3, 71.2), ('main-stair-s', 'p', 72.6, 73.6),
        ('paint-store', 'p', 86.9, 87.8), ('fore-store', 'a', -0.45, 0.45)):
    door('main', _room, _side, _a, _b)
# ---- The upper deck: the house.
for _room, _side, _a, _b in (
        ('stair-head-p', 's', 83.5, 84.5), ('stair-head-s', 'p', 83.5, 84.5), ('changing-room', 'a', 4.4, 5.3), ('laundry', 'a', -5.3, -4.4),
        ('provisions', 'p', 84.0, 84.9), ('cold-rooms', 's', 88.9, 89.7), ('house-stair', 'p', 93.85, 94.8), ('house-stair', 's', 93.85, 94.8),
        ('linen-store', 'p', 91.9, 92.7), ('cleaning-locker', 's', 91.9, 92.7), ('galley', 'p', 96.4, 97.3), ('galley', 's', 96.4, 97.3),
        ('pantry', 'a', -0.4, 0.4), ('hospital', 's', 87.6, 88.5), ('ship-office', 's', 91.5, 92.4), ('drivers-lounge', 's', 95.2, 96.2),
        ('drivers-lounge', 's', 99.6, 100.6), ('crew-lounge', 'p', 88.0, 89.0), ('crew-mess', 'p', 96.3, 97.2), ('officers-mess', 'p', 100.4, 101.3)):
    door('upper', _room, _side, _a, _b)
windows('upper', 'hospital', 'p', (86.9, 88.8))
windows('upper', 'ship-office', 'p', (91.4,))
windows('upper', 'drivers-lounge', 'p', (94.5, 96.5, 98.5, 100.5, 102.4))
windows('upper', 'drivers-lounge', 'f', (5.6, 7.2))
windows('upper', 'pantry', 'f', (-0.55,))
windows('upper', 'officers-mess', 'f', (-8.3, -6.7, -5.1))
windows('upper', 'officers-mess', 's', (100.3, 102.2))
windows('upper', 'crew-mess', 's', (94.6, 96.5, 98.2))
windows('upper', 'crew-lounge', 's', (86.7, 88.6, 90.5, 92.4))
# ---- The boat deck: every cabin opens on a corridor and has a window.
for _n in range(4):
    _room = f'drivers-cabin-{_n + 1}'
    _a = next(s for s in ga.SPACES if s['id'] == _room)['yard'][0]
    door('boat', _room, 's' if _n < 2 else 'p', _a + 0.35, _a + 1.15)
    windows('boat', _room, 'p' if _n < 2 else 's', (_a + 1.7,), **CABIN)
for _s in ga.SPACES:
    if _s['plan'] == 'boat' and _s['id'].startswith('crew-cabin-'):
        (_a, _b), (_x0, _x1) = _s['yard'], _s['x']
        if _s['id'].startswith('crew-cabin-f'):                                   # the row across the front
            door('boat', _s['id'], 'a', _x0 + 0.35, _x0 + 1.15)
            windows('boat', _s['id'], 'f', (_x0 + 0.8,), **CABIN)
        else:
            door('boat', _s['id'], 's' if _x0 > 0 else 'p', _a + 0.35, _a + 1.15)
            windows('boat', _s['id'], 'p' if _x0 > 0 else 's', (_a + 0.8,), **CABIN)
for _room, _side, _a, _b in (('boat-locker', 'p', 85.0, 85.8), ('house-stair-boat', 'p', 93.85, 94.8), ('house-stair-boat', 's', 93.85, 94.8),
                             ('crew-pantry', 'p', 96.2, 97.0)):
    door('boat', _room, _side, _a, _b)
# ---- The officers' deck.
for _room, _side, _a, _b in (
        ('house-stair-officers', 'p', 93.85, 94.8), ('house-stair-officers', 's', 93.85, 94.8), ('radio-room', 'p', 95.6, 96.4),
        ('second-engineer', 's', 92.0, 92.8), ('third-engineer', 's', 95.4, 96.2), ('chief-officer', 'p', 92.0, 92.8), ('second-officer', 'p', 95.4, 96.2),
        ('chief-engineer', 'a', 3.6, 4.4), ('pilot-cabin', 'a', 1.2, 2.0), ('office', 'a', -1.2, -0.4), ('wheelhouse-stair', 'a', -2.93, -2.11),
        ('master', 'a', -4.4, -3.6)):
    door('officers', _room, _side, _a, _b)
for _room, _side, _starts in (('second-engineer', 'p', (92.1,)), ('third-engineer', 'p', (95.1,)), ('chief-officer', 's', (92.1,)), ('second-officer', 's', (95.1,)),
                              ('chief-engineer', 'p', (99.4, 101.6)), ('master', 's', (99.4, 101.6)), ('chief-engineer', 'f', (3.6, 5.6)), ('pilot-cabin', 'f', (1.2,)),
                              ('office', 'f', (-1.3,)), ('master', 'f', (-6.5, -4.5))):
    windows('officers', _room, _side, _starts, **CABIN)
# ---- The bridge deck: the rooms abaft the wheelhouse.
for _room, _side, _a, _b in (('bridge-lobby', 'a', -0.7, 0.1), ('bridge-lobby', 'f', -0.7, 0.1), ('battery-room', 's', 94.9, 95.6), ('bridge-wc', 'p', 94.9, 95.6),
                             ('bridge-locker', 'p', 97.1, 97.8)):
    door('bridge', _room, _side, _a, _b)
windows('bridge', 'chart-room', 'p', (97.6,), **CABIN)
# ---- On the engine room platform: each room is entered from the passage on the centreline; the control room looks
# forward over the engines.
for _room, _side, _a, _b in (('switchboard-room', 's', 18.4, 19.2), ('ecr', 's', 22.6, 23.4), ('workshop', 'p', 18.4, 19.2), ('engine-store', 'p', 22.6, 23.4)):
    door('platform', _room, _side, _a, _b)
window('platform', 'ecr', 'f', 1.6, 3.4, sill=1.0, head=1.9)
window('platform', 'ecr', 'f', 4.2, 6.0, sill=1.0, head=1.9)
# Openings in the houses' outlines, which are no room's own wall: (plan, 'x' or 'yard', where, from, to, sill, head, glass).
OUTLINE_OPENINGS = [
    ('upper', 'yard', H0, -0.45, 0.45, 0.0, DOOR_HEAD, False),                     # from the open deck into the after lobby
    ('boat', 'x', HR, 80.25, 81.05, 0.0, DOOR_HEAD, False), ('boat', 'x', -HR, 80.25, 81.05, 0.0, DOOR_HEAD, False),      # the after cross passage's doors to the boat deck
    ('boat', 'x', HH, 98.75, 99.55, 0.0, DOOR_HEAD, False), ('boat', 'x', -HH, 98.75, 99.55, 0.0, DOOR_HEAD, False),      # and the forward one's
    ('officers', 'yard', OFF, 1.65, 2.45, 0.0, DOOR_HEAD, False), ('officers', 'yard', OFF, -2.45, -1.65, 0.0, DOOR_HEAD, False),   # the corridors' after doors
]


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
        key = 'platform' if s['level'] == 'platform' else s['plan']
        if key == 'hold' or key not in PLANS:
            continue
        if key != plan or s['id'] in OPEN.get(plan, ()):
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
        openings.setdefault((axis, round(c, 4)), []).append((o['lo'], o['hi'], o['bottom'], o['top'], o['glass']))
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
    if plan == 'main':
        return True
    return any(p == plan and ax == axis and abs(cc - c) < 1e-6 and a - 1e-6 <= mid <= b + 1e-6 for p, ax, cc, a, b in EXTERIOR)


def _prism(p, ring, z0, z1, colour, axis='z'):
    """A solid from an outline pushed between two planes: `ring` is (u, y) points; along z (a wall across her) u is x, along
    x (a wall along her) u is z."""
    at = (lambda u, y, w: (u, y, w)) if axis == 'z' else (lambda u, y, w: (w, y, u))
    start = len(p.f)
    p.grid([[at(u, y, z0) for u, y in ring], [at(u, y, z1) for u, y in ring]], colour, close=True)
    for w in (z0, z1):
        p.polygon([at(u, y, w) for u, y in ring], colour)
    mu, my, mw = sum(u for u, _ in ring) / len(ring), sum(y for _, y in ring) / len(ring), (z0 + z1) / 2
    m = at(mu, my, mw)
    p.orient(start, lambda q: (q[0] - m[0], q[1] - m[1], q[2] - m[2]))


def _side_x(plan, yd):
    """Where the outer face of a wall that follows her side stands at `yd`."""
    return PLANS[plan]['breadth'](Z(yd))


def _piece(walls, plan, axis, c, a, b, y0, y1, colour, hull_ends=(False, False)):
    """A length of wall from a to b along its line, between two heights. `hull_ends`: whether its starboard and its port
    end stand on her shell, whose topsides lean: such an end follows them (rule 9)."""
    P = PLANS[plan]
    if b - a < 1e-6 or y1 - y0 < 1e-6:
        return
    if axis == 'yard':
        z = Z(c)
        if plan == 'main' and any(hull_ends):
            end = lambda y: L.topside_x(y, z) - 0.014
            xa0, xa1 = (-end(y0), -end(y1)) if hull_ends[0] else (a, a)
            xb0, xb1 = (end(y0), end(y1)) if hull_ends[1] else (b, b)
            _prism(walls, [(xa0, y0), (xb0, y0), (xb1, y1), (xa1, y1)], z - T / 2, z + T / 2, colour)
        else:
            walls.box((a, y0, z - T / 2), (b, y1, z + T / 2), colour)
    elif not _is_side(c):
        walls.box((c - T / 2, y0, Z(a)), (c + T / 2, y1, Z(b)), colour)
    else:
        # along her side: its outer face follows the deck's edge, in lengths of a frame space where she narrows
        sgn = 1 if c > 0 else -1
        n = max(1, int(ceil((b - a) / 0.6))) if max(a, b) > 72.0 else 1
        for i in range(n):
            ya, yb = a + (b - a) * i / n, a + (b - a) * (i + 1) / n
            xa, xb = _side_x(plan, ya), _side_x(plan, yb)
            ring = [(sgn * xa, Z(ya)), (sgn * xb, Z(yb)), (sgn * (xb - T), Z(yb)), (sgn * (xa - T), Z(ya))]
            start = len(walls.f)
            walls.grid([[(x, y0, z) for x, z in ring], [(x, y1, z) for x, z in ring]], colour, close=True)
            for y in (y0, y1):
                walls.polygon([(x, y, z) for x, z in ring], colour)
            mx, mz, my = sum(p[0] for p in ring) / 4, sum(p[1] for p in ring) / 4, (y0 + y1) / 2
            walls.orient(start, lambda q: (q[0] - mx, (q[1] - my) * 1e-3, q[2] - mz) if abs(q[1] - my) < (y1 - y0) / 2 - 1e-6 else (0, q[1] - my, 0))


def _wall_point(plan, axis, c, lo, hi):
    """The two faces of a wall between lo and hi along it, as a function of (u along the wall, y): (the point on one
    face, the point on the other). A wall along her side is taken as straight between lo and hi, as its glass is."""
    if axis == 'yard':
        return lambda u, y: ((u, y, Z(c) - T / 2), (u, y, Z(c) + T / 2))
    if not _is_side(c):
        return lambda u, y: ((c - T / 2, y, Z(u)), (c + T / 2, y, Z(u)))
    sgn = 1 if c > 0 else -1
    xa, xb = _side_x(plan, lo), _side_x(plan, hi)
    x = lambda u: xa + (xb - xa) * (u - lo) / (hi - lo)
    return lambda u, y: ((sgn * x(u), y, Z(u)), (sgn * (x(u) - T), y, Z(u)))


CORNER = 0.10                  # the radius of a window's corners


def _corners_of_window(walls, plan, axis, c, lo, hi, y0, y1, colour, r=CORNER, n=5):
    """A window's rounded corners: in each corner of its opening a piece of the wall's own thickness, its inner edge a
    quarter circle. Its two faces lie beside the wall's faces, not on them (rule 3)."""
    at = _wall_point(plan, axis, c, lo, hi)
    for cu, cy, su, sy in ((lo, y0, 1, 1), (hi, y0, -1, 1), (hi, y1, -1, -1), (lo, y1, 1, -1)):
        ring = [(cu, cy), (cu + su * r, cy)]
        for i in range(1, n):
            t = pi / 2 * i / n
            ring.append((cu + su * r * (1 - sin(t)), cy + sy * r * (1 - cos(t))))
        ring.append((cu, cy + sy * r))
        start = len(walls.f)
        one = [at(u, y)[0] for u, y in ring]
        two = [at(u, y)[1] for u, y in ring]
        walls.grid([one, two], colour, close=True)
        walls.polygon(one, colour)
        walls.polygon(two, colour)
        m = [sum(v[k] for v in one + two) / (2 * len(ring)) for k in range(3)]
        walls.orient(start, lambda q: (q[0] - m[0], q[1] - m[1], q[2] - m[2]))


def _glass(glass, plan, axis, c, a, b, y0, y1):
    if axis == 'yard':
        pts = [(a, y0, Z(c)), (b, y0, Z(c)), (b, y1, Z(c)), (a, y1, Z(c))]
    elif not _is_side(c):
        pts = [(c, y0, Z(a)), (c, y0, Z(b)), (c, y1, Z(b)), (c, y1, Z(a))]
    else:
        sgn = 1 if c > 0 else -1
        xa, xb = sgn * (_side_x(plan, a) - T / 2), sgn * (_side_x(plan, b) - T / 2)
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
        for a, b in iv:
            # a wall across the vehicle deck stands on her shell where it reaches her side
            hb = P['breadth'](Z(c)) if axis == 'yard' else None
            at_hull = lambda u: plan == 'main' and axis == 'yard' and abs(abs(u) - hb) < 1e-6
            at = a
            for lo, hi, bottom, head, glazed in opens:
                if hi <= a + 1e-6 or lo >= b - 1e-6:
                    continue
                lo, hi = max(lo, a), min(hi, b)
                ext = _is_exterior(plan, axis, c, (at + lo) / 2)
                colour = WHITE if ext else PRIMER
                _piece(walls, plan, axis, c, at, lo, floor, top, colour, (at_hull(at) and at < 0, False))
                _piece(walls, plan, axis, c, lo, hi, floor, floor + bottom, colour)
                _piece(walls, plan, axis, c, lo, hi, floor + head, top, colour)
                if glazed:
                    _glass(glass, plan, axis, c, lo, hi, floor + bottom, floor + head)
                    _corners_of_window(walls, plan, axis, c, lo, hi, floor + bottom, floor + head, colour)
                at = hi
            ext = _is_exterior(plan, axis, c, (at + b) / 2)
            _piece(walls, plan, axis, c, at, b, floor, top, WHITE if ext else PRIMER, (at_hull(at) and at < 0, at_hull(b) and b > 0))


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


def _beams(group, name, y, a, b, breadth, holes, skip=(), inset=0.03, reach=None, depth=None, every=2, only=None):
    """The deck's beams under its plating, at every second frame: a flat bar from side to side, left out of the wells and
    where a bulkhead or a wall stands in its plane (rule 4). `depth` and `only` (a test of the frame's number) make the
    deeper web beams that carry a deck across the lanes."""
    beams = part(group, f'{name}, beams', 'Primer plate')
    colour = tint(PRIMER, 0.95)
    depth = depth or S.DECK_BEAM
    only = only or (lambda n: n % every == 0)
    k = int(ceil(a / L.FRAME_SPACING))
    while k * L.FRAME_SPACING <= b - 0.2:
        yard, n = k * L.FRAME_SPACING, k
        k += 1
        if not only(n) or yard < a + 0.2 or any(abs(yard - s) < 0.06 for s in skip):
            continue
        hb = breadth(Z(yard)) - inset
        if reach:
            hb = min(hb, reach(Z(yard)) - 0.03)        # it ends on the inner edge of the frame it is bracketed to
        if hb < 0.4:
            continue
        spans = _subtract([(-hb, hb)], [(x0 - 0.02, x1 + 0.02) for x0, x1, ya, yb in holes if ya - 0.05 < yard < yb + 0.05])
        for x0, x1 in spans:
            if x1 - x0 > 0.15:
                beams.grid([[(x0, y - PLATE, Z(yard)), (x1, y - PLATE, Z(yard))], [(x0, y - PLATE - depth, Z(yard)), (x1, y - PLATE - depth, Z(yard))]], colour)


def _wall_yards(plan):
    """Where a wall across the ship stands on a plan: the yards of its beams' planes to keep clear of."""
    lines, _ = wall_lines(plan)
    return sorted({c for (axis, c) in lines if axis == 'yard'})


def _box_of(st, more=0.012):
    """A stair's width over its stringers: (x from, x to)."""
    x0, x1 = sorted(st['x'])
    return x0 - more - 0.003, x1 + more + 0.003


def _stair(id):
    return next(st for st in S.STAIRS if st['id'] == id)


# ---- The wells: (x from, x to, yard from, yard to).
_ER, _HOLD, _MAIN = _stair('er-entrance'), _stair('hold-stair'), _stair('main-p')
LIFT = ga.CARGO_LIFT
ER_WELL = _box_of(_ER) + (27.38, 29.8)                         # the whole flight: it goes down through the deck
HOLD_WELL = _box_of(_HOLD) + (51.15, 53.6)                     # its first flight, to the landing 2.6 m under the deck
LIFT_WELL = (-LIFT['half'], LIFT['half'], LIFT['yard'][0], LIFT['yard'][1])
MAIN_HOLES = [ER_WELL, HOLD_WELL, LIFT_WELL] + [S.hatch_opening(l) for l in S.LADDERS if l.get('hatch')]
RAMP = ga.FIXED_RAMP
RAMP_X = (RAMP['x'][0] + T / 2, RAMP['x'][1])                  # the ramp's roadway: from the casing's wall inboard
RAMP_WELL = (RAMP_X[0], RAMP_X[1], ga.RAMP_OPENING['yard'][0], ga.RAMP_OPENING['yard'][1])
_mx0, _mx1 = _box_of(_MAIN)
MAIN_STAIR_WELLS = [(_mx0, _mx1, 80.75, 83.0), (-_mx1, -_mx0, 80.75, 83.0)]       # the uppermost flight of each main stair
UPPER_HOLES = [RAMP_WELL] + MAIN_STAIR_WELLS
TRUNK_WELL = (-TR['half'] + 0.012, TR['half'] - 0.012, TR['yard'][0] + 0.012, S.TRUNK_FWD[0])
WHEELHOUSE_STAIR = (-2.92, -2.12, BP.yard(17.90), BP.yard(20.15))          # the well of the crew stair that comes up into the wheelhouse
WING = BP.WING + 0.06          # the outer face of the bridge wings' bulwarks: the bridge deck's plating reaches it
# The outlines of the house's upper decks, (x, yard): each is the roof of the tier under it, and caps its walls.
E = T / 2
OFFICERS_OUTLINE = [(HR + E, H0 - E), (HR + E, REC - E), (HH + E, REC - E), (HH + E, H1 + E), (-HH - E, H1 + E), (-HH - E, REC - E), (-HR - E, REC - E), (-HR - E, H0 - E)]
BRIDGE_OUTLINE = [(HH + E, OFF - E), (HH + E, 99.995), (WING, 99.995), (WING, 103.505), (HH + E, 103.505), (HH + E, H1 + E),
                  (-HH - E, H1 + E), (-HH - E, 103.505), (-WING, 103.505), (-WING, 99.995), (-HH - E, 99.995), (-HH - E, OFF - E)]
TOP_OUTLINE = [(3.10, 94.0 - E), (3.10, 100.0), (-3.10, 100.0), (-3.10, 94.0 - E)]


def decks():
    bulkheads = [b['yard'] for b in S.BULKHEADS]
    # ---- the main deck: from the transom to the stem, green; the hold's bulkheads stand under its beams' line
    main = PLANS['main']['breadth']
    a, b = 0.012, L.STEM_AT_MAIN - 0.5
    _plate('main', 'Main deck', _outline(lambda z: main(z) - 0.004, a, b), MAIN_HOLES, S.MAIN_DECK, [(a, b, GREEN)])
    # (a beam ends on the inner edge of the frame it is bracketed to: in the frame's own plane it would be a second plate there)
    _beams('main', 'Main deck', S.MAIN_DECK, a, b, main, MAIN_HOLES, skip=bulkheads + [S.TRUNK_END['yard']], reach=hull_structure.frame_reach)
    # ---- the upper deck, level as far as the house's front: open and green aft of the house, bare inside it
    up = lambda z: L.upper_breadth(z) - 0.016
    _plate('upper', 'Upper deck', _outline(up, a, H1), UPPER_HOLES, S.UPPER_DECK, [(a, H0, GREEN), (H0, H1, GREY)])
    skip = _wall_yards('main')
    web = lambda n: n % 6 == 0
    _beams('upper', 'Upper deck', S.UPPER_DECK, a, H1, up, UPPER_HOLES, skip=skip, reach=hull_structure.topside_frame_reach, only=lambda n: n % 2 == 0 and n % 6 != 0)
    # (every sixth frame a web beam, 0.9 m deep, on the web frame of her side: they carry the deck across the five lanes)
    _beams('upper', 'Upper deck', S.UPPER_DECK, a, H1, up, UPPER_HOLES, skip=skip, reach=lambda z: hull_structure.topside_frame_reach(z, S.DECK_WEB), depth=S.DECK_WEB, only=web)
    forecastle(up)
    # ---- the boat deck: the roof of the house's lowest tier, to her side
    roof = lambda z: L.upper_breadth(z) - 0.004
    _plate('boat', 'Boat deck', _outline(roof, H0 - E, H1 + E), [TRUNK_WELL], S.BOAT_DECK, [(H0 - E, H1 + E, GREEN)])
    _beams('boat', 'Boat deck', S.BOAT_DECK, H0, H1, roof, [TRUNK_WELL], skip=_wall_yards('upper'), inset=0.05)
    # ---- the officers' deck: the roof of the boat deck's house
    _plate('officers', "Officers' deck", OFFICERS_OUTLINE, [TRUNK_WELL], S.OFFICERS_DECK, [(H0, H1, GREEN)])
    _beams('officers', "Officers' deck", S.OFFICERS_DECK, H0, H1, lambda z: HR if L.yard(z) < REC else HH, [TRUNK_WELL], skip=_wall_yards('boat'), inset=0.05)
    # ---- the bridge deck: the roof of the officers' house, carried out under the wheelhouse's wings
    _plate('bridge', 'Bridge deck', BRIDGE_OUTLINE, [WHEELHOUSE_STAIR], S.BRIDGE_DECK, [(OFF, H1, GREEN)])
    _beams('bridge', 'Bridge deck', S.BRIDGE_DECK, OFF, H1, lambda z: HH, [WHEELHOUSE_STAIR], skip=_wall_yards('officers'), inset=0.05)
    # ---- the roof of the rooms abaft the wheelhouse, level with the compass deck
    _plate('top', 'House top', TOP_OUTLINE, [], S.COMPASS_DECK, [(94.0, 100.0, srgb(S.ROOF_DECK))])
    _beams('top', 'House top', S.COMPASS_DECK, 94.0, 100.0, lambda z: BH, [], skip=_wall_yards('bridge'), inset=0.05)


def forecastle(up):
    """The forecastle deck: the upper deck forward of the house, rising with her sheer to the stem (lines.deck_y). A sheet
    across her at every half frame, its beams under it at every second frame."""
    top = part('upper', 'Forecastle deck, plating', 'Deck paint')
    low = part('upper', 'Forecastle deck, underside', 'Primer')
    beams = part('upper', 'Forecastle deck, beams', 'Primer plate')
    end = L.deck_end() - 0.45
    n = int(round((end - H1) / 0.3))
    yards = [H1 + (end - H1) * i / n for i in range(n + 1)]
    rows, under = [], []
    for yd in yards:
        z = Z(yd)
        x, y = up(z), L.deck_y(z)
        rows.append([(x, y, z), (x * 0.5, y, z), (0.0, y, z), (-x * 0.5, y, z), (-x, y, z)])
        under.append([(q[0], y - PLATE, z) for q in rows[-1]])
    start = len(top.f)
    top.grid(rows, GREEN)
    top.orient(start, (0, 1, 0))
    start = len(low.f)
    low.grid(under, tint(PRIMER, 1.02))
    low.orient(start, (0, -1, 0))
    # its edge: along each side and across its forward end
    for side in (0, -1):
        start = len(low.f)
        low.grid([[r[side] for r in under], [r[side] for r in rows]], tint(WHITE, 0.92))
        low.orient(start, (1 if side == 0 else -1, 0, 0))
    start = len(low.f)
    low.grid([under[-1], rows[-1]], tint(WHITE, 0.92))
    low.orient(start, (0, 0, 1))
    k = int(ceil(H1 / L.FRAME_SPACING)) + 1
    while k * L.FRAME_SPACING < end - 0.3:
        yd = k * L.FRAME_SPACING
        k += 1
        if (k - 1) % 2:
            continue
        z = Z(yd)
        hb = min(up(z) - 0.03, hull_structure.topside_frame_reach(z) - 0.03)
        y = L.deck_y(z) - PLATE - 0.003                  # (3 mm under the plating: the sheet is flat between its frames, the deck's line is not)
        if hb > 0.4:
            beams.grid([[(-hb, y, z), (hb, y, z)], [(-hb, y - S.DECK_BEAM, z), (hb, y - S.DECK_BEAM, z)]], tint(PRIMER, 0.95))


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
    i = 0.08
    # ---- the upper deck: round the opening of the fixed ramp (its forward end is the way off the ramp)
    x0, x1, a, b = RAMP_WELL
    rails('upper', 'Upper deck, rails', [(x0 - i, b), (x0 - i, a - i), (x1 + i, a - i), (x1 + i, b)], S.UPPER_DECK)
    # ---- the boat deck: along her side, with a gap where each lifeboat is swung out and at each liferaft's cradle
    up = lambda yd: L.upper_breadth(Z(yd)) - 0.09
    for sgn in (1, -1):
        gaps = [ga.LIFEBOAT] + [(v - 0.55, v + 0.55) for v in ga.LIFERAFTS]
        at = H0 + i
        for ga_, gb in gaps + [(H1 - i, H1)]:
            if ga_ - at > 0.4:
                n = max(1, int(round((ga_ - at) / 2.0)))
                rails('boat', 'Boat deck, rails', [(sgn * up(at + (ga_ - at) * k / n), at + (ga_ - at) * k / n) for k in range(n + 1)], S.BOAT_DECK)
            at = gb
        # across each end of the side deck: aft beside the ladder's head, forward round to the house's front
        ladder = _stair('boat-p')['x']
        rails('boat', 'Boat deck, rails', [(sgn * up(H0 + i), H0 + i), (sgn * (ladder[1] + 0.08), H0 + i)], S.BOAT_DECK)
        rails('boat', 'Boat deck, rails', [(sgn * up(H1 - i), H1 - i), (sgn * (HH + i), H1 - i)], S.BOAT_DECK)
    # ---- the officers' deck abaft the house: round its edge
    y = S.OFFICERS_DECK
    rails('officers', "Officers' deck, rails", [(HR - i, REC - i), (HR - i, H0 + i), (-HR + i, H0 + i), (-HR + i, REC - i)], y)
    # ---- the bridge deck: across its after end between and outboard of the two ladders' heads, down each side to the
    # wings, and round the ledge before the wheelhouse
    y = S.BRIDGE_DECK
    lx = _stair('bridge-p')['x']
    rails('bridge', 'Bridge deck, rails', [(-lx[0] + i, OFF + i), (lx[0] - i, OFF + i)], y)
    for sgn in (1, -1):
        rails('bridge', 'Bridge deck, rails', [(sgn * (lx[1] + i), OFF + i), (sgn * (HH - i), OFF + i), (sgn * (HH - i), 99.9)], y)
    rails('bridge', 'Bridge deck, rails', [(HH - i, 103.6), (HH - i, H1 - i), (-HH + i, H1 - i), (-HH + i, 103.6)], y)
    # ---- the house top: round its after end from one side of the ladder's head to the other, to the compass deck's own rail
    y = S.COMPASS_DECK
    l = next(l for l in S.LADDERS if l['id'] == 'ladder-house-top')
    rails('top', 'House top, rails', [(l['x'] + 0.32, 94.0 + i), (2.97, 94.0 + i), (2.97, 100.0 - i)], y)
    rails('top', 'House top, rails', [(l['x'] - 0.32, 94.0 + i), (-2.97, 94.0 + i), (-2.97, 100.0 - i)], y)


# =====================================================================================================================
# The house's stair trunk, the engine room platform
# =====================================================================================================================
def house_trunk():
    """The trunk's own floors between its walls: the half landing of each storey, and the guard at the head of the stair on
    the officers' deck."""
    grey = srgb(S.LIGHT_GREY)
    x = TR['half'] - T / 2
    a0, a1 = S.TRUNK_AFT[0] + T / 2, S.TRUNK_AFT[1]
    for (name, level), _ in zip(S.TRUNK_DECKS, S.TRUNK_DECKS[1:]):
        land = part(name, f'Stair trunk, half landing, {name} deck', 'Machinery paint')
        land.box((-x, level + 1.4 - 0.05, Z(a0)), (x, level + 1.4, Z(a1)), grey)
    # at the top the port lane has no flight: a guard across it, and back along the middle to the stair's own rail
    rails('officers', "Stair trunk head, guard rail", [(0.0, S.TRUNK_AFT[0] + 0.1), (0.0, S.TRUNK_FWD[0] + 0.04), (x - 0.03, S.TRUNK_FWD[0] + 0.04)], S.OFFICERS_DECK, post_every=1.2)


PLATFORM_AFT = (S.fr(28), S.fr(42))          # the platform across her, abaft the engines
GALLERY = (5.4, S.fr(42), S.fr(64))          # a gallery each side of them: from this far off the centreline to her side


def platform():
    """The engine room platform at 4.0 m: across her abaft the engines (the control room, the switchboard room, the
    workshop and the store stand on it), and a gallery each side of the engines. Floor plates on bearers, pillars down
    to the floors and the tank top, a rail where an edge is open."""
    plates = part('machinery', 'Engine room platform, plates', 'Floor plate')
    steel = part('machinery', 'Engine room platform, bearers and pillars', 'Machinery paint')
    dark, plate = srgb(S.DARK_GREY), srgb(S.FLOOR_PLATE)
    y = S.PLATFORM
    reach = lambda yd: L.hull_x(y - 0.2, Z(yd)) - 0.30          # as far as her frames, at the bearers' level
    wells = [(_box_of(st)[0] - 0.03, _box_of(st)[1] + 0.03, st['top'][0], st['top'][0] + st['down'] * 2.4) for st in (_stair('er-floor-p'), _stair('er-floor-s'))]

    def flat(x0, x1, a, b, pillar_x):
        x0, x1 = sorted((x0, x1))
        n, m = max(1, round((b - a) / 0.9)), max(1, round((x1 - x0) / 0.9))
        for i in range(n):
            ya, yb = a + (b - a) * i / n, a + (b - a) * (i + 1) / n
            for j in range(m):
                xa, xb = x0 + (x1 - x0) * j / m + 0.004, x0 + (x1 - x0) * (j + 1) / m - 0.004
                if any(wx0 < xb and xa < wx1 and min(wa, wb) < yb and ya < max(wa, wb) for wx0, wx1, wa, wb in wells):
                    continue
                plates.box((xa, y - 0.006, Z(ya) + 0.004), (xb, y, Z(yb) - 0.004), tint(plate, 1 + 0.03 * (((i * 7 + j * 13) % 5) - 2) / 2))      # 6 mm of plate
        # a bearer under the plates' seams across the ship, an edge bearer along each side, pillars under them
        for i in range(n + 1):
            yd = a + (b - a) * i / n
            steel.box((x0, y - 0.10, Z(yd) - 0.03), (x1, y - 0.006, Z(yd) + 0.03), dark)
        for x in (x0, x1):
            steel.box((x - 0.03, y - 0.16, Z(a)), (x + 0.03, y - 0.10, Z(b)), dark)
        for px in pillar_x:
            k = int(ceil(a / 2.4))
            while k * 2.4 < b:
                yd = max(a + 0.2, min(b - 0.2, k * 2.4))
                foot = hull_structure.floor_top(round(yd / 0.6) * 0.6) if not hull_structure.in_double_bottom(yd) else S.TANK_TOP
                foot = max(foot, L.hull_y(abs(px) + 0.08, Z(yd)) + 0.03)          # (at its outboard side: her bilge rises under it)
                steel.tube((px, foot - 0.01, Z(yd)), (px, y - 0.16, Z(yd)), 0.06, colour=dark, sides=10)
                k += 1

    a, b = PLATFORM_AFT
    half = min(reach(a + 0.05), reach(b))
    flat(-half, half, a + 0.02, b, [-half + 0.5, -3.4, 0.0, 3.4, half - 0.5])
    g, ga_, gb = GALLERY
    for sgn in (1, -1):
        out = min(reach(ga_), reach(gb))
        flat(sgn * g, sgn * out, ga_, gb - 0.02, [sgn * (g + 0.03)])
        # the gallery's rail along its inboard edge, with a gap at the stair's head
        st = _stair('er-floor-p')
        s0, s1 = st['top'][0] - 0.05, st['top'][0] + 2.4
        rails('machinery', 'Engine room platform, rails', [(sgn * (g + 0.04), ga_ + 0.04), (sgn * (g + 0.04), gb - 0.06)], y, post_every=1.3)
    # the platform's forward edge, between the two galleries: a rail across, before the control room's windows
    rails('machinery', 'Engine room platform, rails', [(-g + 0.04, b + 0.04), (g - 0.04, b + 0.04)], y, post_every=1.3)


# =====================================================================================================================
# The fixed ramp, the cargo lift's platform
# =====================================================================================================================
def fixed_ramp():
    """The fixed ramp from the main deck to the upper deck, along the starboard casing (ga.FIXED_RAMP): a stiffened deck
    3.6 m wide rising forward at 1 in 8, carried by the casing's wall outboard and by a girder on pillars inboard; a guard
    plate 1.1 m high along its open side, which above the upper deck is the coaming of its opening; bars across its roadway."""
    road = part('main', 'Fixed ramp, roadway', 'Deck paint')
    steel = part('main', 'Fixed ramp, structure', 'Topside paint')
    bars = part('main', 'Fixed ramp, non-slip bars', 'Deck paint')
    (a, b), (x0, x1) = RAMP['yard'], RAMP_X
    y0, y1 = S.MAIN_DECK, S.UPPER_DECK
    slope = (y1 - y0) / (b - a)
    at = lambda yd: y0 + (yd - a) * slope
    deep = 0.30                                   # the roadway's plating and the beams under it
    foot = a + deep / slope                       # where its underside meets the main deck
    # the roadway: a wedge at its foot, then a slab of one depth
    _prism(road, [(Z(a), y0), (Z(b), y1), (Z(b), y1 - deep), (Z(foot), y0)], x0, x1 - 0.012, tint(GREEN, 0.97), axis='x')
    # the guard along its open side: a plate from the main deck to 1.1 m over the roadway, closing the space under the
    # ramp from the lanes and standing over the upper deck as the opening's coaming
    guard = 1.10
    _prism(steel, [(Z(a), y0), (Z(a), y0 + guard), (Z(b), y1 + guard), (Z(b), y0)], x1 - 0.012, x1, tint(WHITE, 0.96), axis='x')
    # pillars under its inboard girder, every 4.8 m where there is height for one
    yd = a + 9.6
    while yd < b - 0.5:
        if at(yd) - deep - y0 > 0.6:
            steel.tube((x1 - 0.16, y0, Z(yd)), (x1 - 0.16, at(yd) - deep + 0.01, Z(yd)), 0.08, colour=tint(WHITE, 0.9), sides=12)
        yd += 4.8
    # bars across the roadway, every 0.4 m: chevrons are for later
    k = 1
    while a + 0.4 * k < b - 0.2:
        yd = a + 0.4 * k
        k += 1
        bars.grid([[(x0 + 0.15, at(yd - 0.02) + 0.012, Z(yd - 0.02)), (x1 - 0.20, at(yd - 0.02) + 0.012, Z(yd - 0.02))],
                   [(x0 + 0.15, at(yd + 0.02) + 0.012, Z(yd + 0.02)), (x1 - 0.20, at(yd + 0.02) + 0.012, Z(yd + 0.02))]], tint(GREEN, 0.78), flip=True)
        for dz in (-0.02, 0.02):
            bars.grid([[(x0 + 0.15, at(yd + dz), Z(yd + dz)), (x1 - 0.20, at(yd + dz), Z(yd + dz))],
                       [(x0 + 0.15, at(yd + dz) + 0.012, Z(yd + dz)), (x1 - 0.20, at(yd + dz) + 0.012, Z(yd + dz))]], tint(GREEN, 0.7), flip=dz > 0)


def cargo_lift():
    """The cargo lift's platform, raised: it is the hatch cover of the lower hold, flush with the main deck, and lies on a
    ledge round the opening. A stiffened plate 16.0 m by 3.6 m; a coaming of girders under the deck round the opening.
    Its hoisting gear is not built: the platform does not work yet."""
    plat = part('main', 'Cargo lift platform', 'Deck paint')
    steel = part('main', 'Cargo lift, coaming and ledge', 'Primer')
    x0, x1, a, b = LIFT_WELL
    y = S.MAIN_DECK
    gap = 0.012
    plat.box((x0 + gap, y - 0.20, Z(a + gap)), (x1 - gap, y, Z(b - gap)), tint(GREEN, 0.93))
    # the coaming: a girder 0.5 m deep under the deck along each side of the opening and across each end; a ledge on its
    # inner face that the platform lies on
    for lo, hi in (((x0 - 0.02, y - 0.55, Z(a - 0.02)), (x0, y - 0.012, Z(b + 0.02))), ((x1, y - 0.55, Z(a - 0.02)), (x1 + 0.02, y - 0.012, Z(b + 0.02))),
                   ((x0, y - 0.55, Z(a - 0.02)), (x1, y - 0.012, Z(a))), ((x0, y - 0.55, Z(b)), (x1, y - 0.012, Z(b + 0.02)))):
        steel.box(lo, hi, tint(PRIMER, 0.95))
    for lo, hi in (((x0, y - 0.26, Z(a + 0.1)), (x0 + 0.10, y - 0.20, Z(b - 0.1))), ((x1 - 0.10, y - 0.26, Z(a + 0.1)), (x1, y - 0.20, Z(b - 0.1)))):
        steel.box(lo, hi, tint(PRIMER, 0.88))
    # the platform's own edge: a yellow line round it on the deck is for later; its lifting lugs at the four corners
    lugs = part('main', 'Cargo lift platform, corner plates', 'Machinery paint')
    for cx in (x0 + 0.25, x1 - 0.25):
        for cz in (Z(a + 0.3), Z(b - 0.3)):
            lugs.box((cx - 0.12, y, cz - 0.12), (cx + 0.12, y + 0.006, cz + 0.12), YELLOW)


# =====================================================================================================================
# The helicopter deck
# =====================================================================================================================
def helideck_outline(inset=0.0):
    """The helicopter deck's octagon, (x, yard) points."""
    H = ga.HELIDECK
    r = H['across'] / 2 - inset
    t = r * tan(pi / 8)
    c = H['yard']
    return [(t, c + r), (r, c + t), (r, c - t), (t, c - r), (-t, c - r), (-r, c - t), (-r, c + t), (-t, c + r)]


def helideck():
    """The helicopter deck (ga.HELIDECK): an octagon 19 m across, 1.0 m over the upper deck aft, on girders and pillars.
    Its marks, its net, its lights and its monitors are outfit: not here."""
    y = S.HELIDECK
    loop = helideck_outline()
    _plate('upper', 'Helicopter deck', loop, [], y, [(0.0, 99.0, tint(GREEN, 0.86))])
    steel = part('upper', 'Helicopter deck, girders and pillars', 'Topside paint')
    grey = tint(WHITE, 0.9)
    c, r = ga.HELIDECK['yard'], ga.HELIDECK['across'] / 2
    t = r * tan(pi / 8)
    half_at = lambda yd: r if abs(yd - c) <= t else r - (abs(yd - c) - t)          # how wide the deck is at a yard
    # girders across her every 2.4 m, 0.35 m deep; a pillar under each at the centre and each side
    k = 0
    for yd in [c + 2.4 * i for i in range(-3, 4)]:
        h = half_at(yd) - 0.15
        steel.box((-h, y - PLATE - 0.35, Z(yd) - 0.01), (h, y - PLATE, Z(yd) + 0.01), grey)
        for px in (-h + 0.25, -h / 2, 0.0, h / 2, h - 0.25) if h > 6 else (-h + 0.25, 0.0, h - 0.25):
            steel.tube((px, S.UPPER_DECK, Z(yd)), (px, y - PLATE - 0.35, Z(yd)), 0.09, colour=grey, sides=14)
    # an edge girder all round, under the plate
    pts = helideck_outline(0.05)
    for (xa, ya), (xb, yb) in zip(pts, pts[1:] + pts[:1]):
        n = hypot(xb - xa, yb - ya)
        ux, uz = (xb - xa) / n, (yb - ya) / n
        ring = [(xa, ya), (xb, yb), (xb - uz * 0.02, yb + ux * 0.02), (xa - uz * 0.02, ya + ux * 0.02)]
        cx, cz = sum(p[0] for p in pts) / 8, sum(p[1] for p in pts) / 8
        if (ring[2][0] - xb) * (cx - xb) + (ring[2][1] - yb) * (cz - yb) < 0:      # the bar's thickness lies inboard of the edge
            ring = [(xa, ya), (xb, yb), (xb + uz * 0.02, yb - ux * 0.02), (xa + uz * 0.02, ya - ux * 0.02)]
        start = len(steel.f)
        steel.grid([[(x, y - PLATE - 0.30, Z(yd)) for x, yd in ring], [(x, y - PLATE, Z(yd)) for x, yd in ring]], grey, close=True)
        for yy in (y - PLATE - 0.30,):
            steel.polygon([(x, yy, Z(yd)) for x, yd in ring], grey)
        mx, mz = sum(p[0] for p in ring) / 4, sum(Z(p[1]) for p in ring) / 4
        steel.orient(start, lambda q: (q[0] - mx, -1 if q[1] < y - PLATE - 0.29 else 0, q[2] - mz))


# =====================================================================================================================
# The stern ramp, the pilot doors, the funnels, the wheelhouse's after wall
# =====================================================================================================================
# The stern ramp, its two hydraulic cylinders and the lights of the after end are specified in spec.py (STERN_DOOR,
# STERN_RAMP, STERN_LIGHTS), where the yard's drawing of the after end reads them too. The model's z of a place given there
# as metres inside the transom:
STERN_RAMP = dict(S.STERN_RAMP)
_IN = lambda inside: -L.HALF + inside
STERN_RAMP['hinge3'] = (0.0, S.STERN_RAMP['hinge'][0], _IN(S.STERN_RAMP['hinge'][1]))
STERN_RAMP['trunnion3'] = (S.STERN_RAMP['trunnion'][0], _IN(S.STERN_RAMP['trunnion'][1]))
STERN_RAMP['pin3'] = (S.STERN_RAMP['pin'][0], _IN(S.STERN_RAMP['pin'][1]))
PILOT = dict(S.PILOT_DOOR, open=100, leaf=0.03, frame=0.06, lap=0.07)


def motion():
    """What of her steel can be worked on the page: the stern ramp, by a control in the bar as the rudder is, and the two
    pilot doors, each by a tap. The ramp turns on its hinges; each cylinder swings on its trunnion to follow its pin on the
    ramp, and its rod runs out as far as the pin has gone (the page's `aim`, as the steering gear's rams are worked)."""
    R = STERN_RAMP
    # On the page's desk: Raise, Stop, Lower. Lowering, it stops by itself level with the main deck (90 degrees); Lower again
    # takes it on to a low quay. Two degrees a second is the yard's figure for the page: three quarters of a minute to the
    # quay. A real ramp of this size takes a minute or two (recalled, not read).
    inputs = [dict(id=R['id'], name='Stern ramp', min=0, max=R['lowered'], step=1, unit='°', below='raised', above='lowered', rest='raised',
                   keys=['Raise', 'Stop', 'Lower'], stops=[dict(v=90, say='level'), dict(v=R['lowered'], say='low quay')], rate=2)]
    # about the athwartships axis through its hinges; its head goes aft and down
    movers = [dict(id=R['id'], kind='turn', input=R['id'], axis=[1, 0, 0], pivot=list(R['hinge3']), ratio=-1.0)]
    for sgn, tag in ((1, 'p'), (-1, 's')):
        x = sgn * R['ram_x']
        ram = dict(kind='aim', input=R['id'], axis=[1, 0, 0], pivot=list(R['hinge3']), ratio=-1.0,
                   anchor=[x, R['trunnion3'][0], R['trunnion3'][1]], pin=[x, R['pin3'][0], R['pin3'][1]])
        movers.append(dict(ram, id=f"{R['id']}-ram-{tag}"))
        movers.append(dict(ram, id=f"{R['id']}-ram-{tag}-rod", extend=True))
    # The pilot doors: each leaf turns inboard on its two hinges, on its forward edge. Shut at sea: a tap opens one, on
    # foot from within reach; nobody opens a door in her side by walking past it.
    (a, b), (y0, y1) = PILOT['yard'], PILOT['y']
    for sgn, tag, label in ((1, 'p', 'port'), (-1, 's', 'starboard')):
        hx, hz = pilot_hinge(sgn)
        inputs.append(dict(id=f'pilot-door-{tag}', name=f'Pilot door, {label}', min=0, max=PILOT['open'], step=1, unit='°', below='', above='open', rest='shut',
                           auto='tap', at=[sgn * (L.half_breadth(Z((a + b) / 2)) - 0.3), y0, Z((a + b) / 2)], normal=[sgn, 0, 0], reach=2.6))
        movers.append(dict(id=f'pilot-door-{tag}', kind='turn', input=f'pilot-door-{tag}', axis=[0, 1, 0], pivot=[hx, 0.0, hz], ratio=-1.0 * sgn))
    return inputs, movers


def stern_ramp():
    """The stern ramp, drawn raised: it is the stern door, and it lowers (motion). A stiffened slab 11 m long that lies
    against the transom from outside: its roadway looks forward into the main deck, its plating aft. Two hydraulic
    cylinders work it, each from a pedestal on the main deck to a lug that stands in through the door's opening."""
    R = STERN_RAMP
    ramp = part('main', 'Stern ramp', 'Topside paint', mover=R['id'])
    road = part('main', 'Stern ramp, roadway', 'Deck paint', mover=R['id'])
    lugs = part('main', 'Stern ramp, hinge lugs', 'Machinery paint')
    z0 = -L.HALF
    h = R['half']
    y0, y1 = S.MAIN_DECK + R['foot'], S.MAIN_DECK + R['foot'] + R['length']
    za, zb = z0 + R['thick'][0], z0 + R['thick'][1]
    ramp.box((-h, y0, za), (h, y1, zb), tint(srgb(S.HULL), 1.05))
    # its side girders and cross girders, on its outer face: what a ramp of 11 m is stiffened with
    for x in (-h, -h / 3, h / 3, h - 0.12):
        ramp.box((x, y0 + 0.2, za - 0.16), (x + 0.12, y1 - 0.1, za), tint(srgb(S.HULL), 0.92))
    k = 1
    while y0 + 1.1 * k < y1 - 0.3:
        yy = y0 + 1.1 * k
        k += 1
        for xa, xb in ((-h + 0.12, -h / 3), (-h / 3 + 0.12, h / 3), (h / 3 + 0.12, h - 0.12)):
            ramp.box((xa, yy - 0.04, za - 0.10), (xb, yy + 0.04, za), tint(srgb(S.HULL), 0.88))
    road.box((-h + 0.05, y0 + 0.05, zb), (h - 0.05, y1 - 0.05, zb + 0.01), tint(GREEN, 0.95))
    k = 1
    while y0 + 0.4 * k < y1 - 0.3:                                               # the non-slip bars across its roadway
        yy = y0 + 0.4 * k
        k += 1
        road.box((-h + 0.2, yy - 0.02, zb + 0.01), (h - 0.2, yy + 0.02, zb + 0.022), tint(GREEN, 0.8))
    for x in (-h, h - R['lug']):                                                 # its hinge lugs on the transom at the sill: they stay when it lowers
        lugs.box((x, S.MAIN_DECK - 0.30, za), (x + R['lug'], y0, z0), DARK)
    # ---- its two hydraulic cylinders
    (ty, tz), (py, pz) = R['trunnion3'], R['pin3']
    length = hypot(py - ty, pz - tz)
    along = lambda d: (ty + (py - ty) * d / length, tz + (pz - tz) * d / length)           # a point d metres from the trunnion toward the pin
    for sgn, tag, label in ((1, 'p', 'port'), (-1, 's', 'starboard')):
        x = sgn * R['ram_x']
        # the lug on the ramp's roadway that the rod is pinned to: it goes with the ramp, and stands in through the opening
        lug = part('main', 'Stern ramp, cylinder lugs', 'Machinery paint', mover=R['id'])
        lug.box((x - 0.09, py - 0.14, zb + 0.01), (x + 0.09, py + 0.14, pz + 0.10), DARK)
        # the pedestal on the main deck that carries the trunnion: a column on a foot plate, stayed aft and forward, painted to be seen
        ped = part('main', 'Stern ramp, cylinder pedestals', 'Machinery paint')
        fw, fl, c = R['footplate'][0] / 2, R['footplate'][1] / 2, R['column'] / 2
        ped.box((x - fw, S.MAIN_DECK, tz - fl), (x + fw, S.MAIN_DECK + 0.03, tz + fl), DARK)
        ped.box((x - c, S.MAIN_DECK + 0.03, tz - c), (x + c, ty + R['column_over'], tz + c), YELLOW)
        for way in (-1, 1):                                                       # a stay each way, from the foot plate to the column's head
            ped.tube((x, S.MAIN_DECK + 0.03, tz + way * 0.40), (x, ty - 0.5, tz + way * 0.10), 0.04, colour=YELLOW, sides=8)
        # the cylinder: its barrel on the trunnion, and the rod that runs out of it to the lug
        barrel = part('main', f'Stern ramp cylinder, {label}', 'Machinery paint', smooth=True, angle=40, mover=f"{R['id']}-ram-{tag}")
        rod = part('main', f'Stern ramp cylinder rod, {label}', 'Shaft steel', smooth=True, angle=40, mover=f"{R['id']}-ram-{tag}-rod")
        (ay, az), (by, bz) = along(0.0), along(R['barrel'])
        barrel.tube((x, ay, az), (x, by, bz), R['barrel_d'] / 2, colour=LIGHT, sides=16)
        (cy, cz), (dy, dz) = along(R['barrel'] - 0.03), along(R['barrel'] + 0.10)
        barrel.tube((x, cy, cz), (x, dy, dz), R['barrel_d'] / 2 + 0.03, colour=DARK, sides=16)                  # its gland
        (ey, ez), (fy, fz) = along(R['rod_from']), along(length)
        rod.tube((x, ey, ez), (x, fy, fz), R['rod_d'] / 2, colour=STEEL, sides=12)


def pilot_hinge(sgn):
    """A pilot door's hinge line: (x, z). On its forward edge, in the middle of the leaf's thickness."""
    (a, b) = PILOT['yard']
    inner = L.half_breadth(Z(b)) - S.SHELL
    return (sgn * (inner - PILOT['frame'] - 0.004 - PILOT['leaf'] / 2), Z(b + PILOT['lap'] + 0.03))


def pilot_doors():
    """The pilot doors (the owner: "the pilot door should also be mechanical of course, not an open door , the ship needs
    to be seaworthy"): each a door in her shell at the main deck, 1.2 m by 2.2 m. A frame of flat bar round the opening
    on the plating's inner face; a leaf of 30 mm that laps it by 70 mm all round and shuts against it from inside, three
    stiffeners across it, six dogs, two hinges on its forward edge, a handle. The leaf turns inboard (motion)."""
    (a, b), (y0, y1) = PILOT['yard'], PILOT['y']
    grey, dark = srgb(S.DOOR_GREY), DARK
    lap, fr_ = PILOT['lap'], PILOT['frame']
    for sgn, tag, label in ((1, 'p', 'port'), (-1, 's', 'starboard')):
        inner = L.half_breadth(Z((a + b) / 2)) - S.SHELL                # the plating's inner face (her side is upright here)
        frame = part('main', 'Pilot doors, frames', 'Machinery paint')
        leaf = part('main', f'Pilot door, {label}', 'Machinery paint', mover=f'pilot-door-{tag}')
        gear = part('main', f'Pilot door, {label}, dogs and handle', 'Shaft steel', smooth=True, angle=40, mover=f'pilot-door-{tag}')
        X = lambda d: sgn * (inner - d)                                 # d metres inboard of the plating's inner face
        box = lambda p, d0, d1, ya, yb, za, zb, colour: p.box((min(X(d0), X(d1)), ya, Z(min(za, zb))), (max(X(d0), X(d1)), yb, Z(max(za, zb))), colour)
        # the frame: four bars round the opening, 60 mm deep (the sill is the lower one)
        box(frame, 0.0, fr_, y0, y1 + 0.05, a - 0.05, a, grey)
        box(frame, 0.0, fr_, y0, y1 + 0.05, b, b + 0.05, grey)
        box(frame, 0.0, fr_, y1, y1 + 0.05, a, b, grey)
        box(frame, 0.0, fr_, y0, y0 + 0.05, a, b, tint(grey, 0.9))
        # the leaf: against the frame's inboard face, lapping the opening
        d0, d1 = fr_ + 0.004, fr_ + 0.004 + PILOT['leaf']
        box(leaf, d0, d1, y0 + 0.02, y1 + lap, a - lap, b + lap, tint(srgb(S.WHITE), 0.97))
        for yy in (y0 + 0.45, y0 + 1.15, y0 + 1.85):                   # three stiffeners across it, inboard
            box(leaf, d1, d1 + 0.05, yy - 0.03, yy + 0.03, a - lap + 0.06, b + lap - 0.06, tint(srgb(S.WHITE), 0.9))
        # six dogs: a lever over the frame at each, on a boss through the leaf
        for zz, way in ((a - lap + 0.035, -1), (b + lap - 0.035, 1)):
            for yy in (y0 + 0.30, y0 + 1.10, y0 + 1.90):
                gear.tube((X(d1), yy, Z(zz)), (X(d1 + 0.04), yy, Z(zz)), 0.022, colour=STEEL, sides=10)
                box(gear, d1 + 0.015, d1 + 0.030, yy - 0.016, yy + 0.016, zz, zz + way * 0.09, STEEL)
        # two hinges on the forward edge: a blade from the leaf to the pin, the pin, and its lugs on the frame
        hx, hz = pilot_hinge(sgn)
        for yy in (y0 + 0.40, y1 - 0.40):
            box(leaf, d0 + 0.003, d1 - 0.003, yy - 0.04, yy + 0.04, b + lap - 0.02, b + lap + 0.03, tint(grey, 0.82))
            gear.tube((hx, yy - 0.06, hz), (hx, yy + 0.06, hz), 0.014, colour=STEEL, sides=10)
            for ly in (yy - 0.085, yy + 0.06):
                box(frame, 0.0, d1 + 0.02, ly, ly + 0.025, b + 0.04, b + lap + 0.05, tint(grey, 0.8))
        # the handle, inboard, by the after edge
        gear.rod([(X(d1), y0 + 1.05, Z(a + 0.12)), (X(d1 + 0.07), y0 + 1.05, Z(a + 0.12)), (X(d1 + 0.07), y0 + 1.25, Z(a + 0.12)), (X(d1), y0 + 1.25, Z(a + 0.12))], 0.011, STEEL)


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
    """The lights of the after end (spec.STERN_LIGHTS): the sternlight on the bulwark's rail beside the raised ramp, a
    floodlight beside each corner of the door, and the red and green signal for those who drive aboard. Each stands on a
    bracket clipped over the bulwark's plate or fixed on the transom, where its cable comes through the plating behind it."""
    from shipyard import component
    Q = S.STERN_LIGHTS
    z0 = -L.HALF
    dark, black, grey = srgb(0x252e30), srgb(0x1a1f20), LIGHT
    steel = part('upper', 'Stern lights, brackets', 'Machinery paint')
    lamps = part('upper', 'Stern lights, lanterns', 'Machinery paint', smooth=True, angle=40)
    glass = part('upper', 'Stern lights, glasses', 'Lens', smooth=True, angle=50)
    rail = S.RAIL_AFT
    # ---- the sternlight (the register's NLT-06): its bracket clipped over the bulwark's head, the lantern abaft it, a screen forward of it
    q = Q['sternlight']
    with component('NLT-06'):
        zc = z0 - q['aft']
        steel.box((q['x'] - 0.06, rail - 0.10, zc - 0.07), (q['x'] + 0.06, q['y'], z0 + 0.04), dark)
        lamps.tube((q['x'], q['y'], zc), (q['x'], q['y'] + 0.04, zc), 0.070, colour=dark, sides=16)
        glass.tube((q['x'], q['y'] + 0.04, zc), (q['x'], q['y'] + 0.17, zc), 0.062, colour=srgb(0xf6f1e2), sides=16)
        lamps.tube((q['x'], q['y'] + 0.17, zc), (q['x'], q['y'] + 0.21, zc), 0.072, colour=dark, sides=16)
        steel.box((q['x'] - 0.13, q['y'], z0 + 0.016), (q['x'] + 0.13, q['y'] + 0.25, z0 + 0.031), black)      # the screen: no light forward of the beam
    # ---- a floodlight beside each corner of the stern door, looking aft
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
    signal = part('main', 'Stern signal', 'Machinery paint', smooth=True, angle=40)
    lens = part('main', 'Stern signal, glasses', 'Lens', smooth=True, angle=50)
    q = Q['signal']
    x = q['x']
    w, h, d = q['size']
    signal.box((x - w / 2, q['y'], z0 - d), (x + w / 2, q['y'] + h, z0), black)
    signal.box((x - w / 2 - 0.04, q['y'] + h, z0 - d - 0.10), (x + w / 2 + 0.04, q['y'] + h + 0.02, z0), black)      # its hood
    for dy, colour in ((0.42, 0xc2412f), (0.16, 0x2f9e5a)):
        lens.tube((x, q['y'] + dy, z0 - d), (x, q['y'] + dy, z0 - d - 0.02), 0.09, colour=srgb(colour), sides=18)


# A funnel: its casing's plan on the upper deck (ga.FUNNEL), its top, how far its ends rake aft, and its black top.
FUNNEL = dict(yard=ga.FUNNEL['yard'], x=ga.FUNNEL['x'], foot=S.UPPER_DECK, top=L.Y(ga.FUNNEL['top']), rake_aft=1.2, rake_fwd=2.2, band=1.1)
# The uptakes that stand through each funnel's top: (share of its length from its after end, radius, what it is). One pipe
# for each main engine, each generating set and the boiler: the port funnel has the port engine and two sets, the
# starboard one the starboard engine, the third set and the boiler.
UPTAKES = {1: ((0.26, 0.34, 'main engine'), (0.55, 0.19, 'generator'), (0.78, 0.19, 'generator')),
           -1: ((0.26, 0.34, 'main engine'), (0.55, 0.19, 'generator'), (0.78, 0.15, 'boiler'))}


def funnels():
    """The two funnels, on the upper deck over their casings: plated in the line's teal with a black top, both ends raked
    aft, each closed by a plate set down in its top with its uptakes standing through it. The line's J is painted on their
    sides (livery.py). Their louvres, platforms and the uptakes below the top are outfit: not here yet."""
    plating = part('upper', 'Funnels', 'Topside paint')
    pipes = part('upper', 'Funnels, uptakes', 'Machinery paint', smooth=True, angle=40)
    F = FUNNEL
    (a, b), (x0, x1), y0, y1 = F['yard'], F['x'], F['foot'], F['top']
    for sgn in (1, -1):
        xs = sorted((sgn * x0, sgn * x1))

        def ring(f):
            """The funnel's section at a share f of its height: its sides are upright and flat (the line's mark is painted on
            them), both its ends rake aft."""
            return [(xs[0], a - F['rake_aft'] * f), (xs[1], a - F['rake_aft'] * f), (xs[1], b - F['rake_fwd'] * f), (xs[0], b - F['rake_fwd'] * f)]

        height = lambda f: y0 + (y1 - y0) * f
        band = 1 - F['band'] / (y1 - y0)
        rows = [[(x, height(f), Z(yd)) for x, yd in ring(f)] for f in (0.0, band, 1.0)]
        cx, cz = (xs[0] + xs[1]) / 2, Z((a + b) / 2 - 0.8)
        for i, colour in ((0, TEAL), (1, srgb(S.BLACK))):
            start = len(plating.f)
            plating.grid([rows[i], rows[i + 1]], colour, close=True)
            plating.orient(start, lambda c: (c[0] - cx, 0, c[2] - cz))
        # the plate that closes it, 0.30 m down inside the head, and the plating's inner face above it
        f = 1 - 0.30 / (y1 - y0)
        lid = [(x, height(f), Z(yd)) for x, yd in ring(f)]
        start = len(plating.f)
        plating.polygon(lid, DARK)
        plating.orient(start, (0, 1, 0))
        mz = sum(p[2] for p in lid) / 4
        inner = [[(x + (cx - x) * 0.012, yy, z + (mz - z) * 0.004) for x, yy, z in row] for row in (lid, rows[2])]
        start = len(plating.f)
        plating.grid(inner, tint(srgb(S.BLACK), 0.8), close=True)
        plating.orient(start, lambda c: (cx - c[0], 0, mz - c[2]))
        top_a, top_b = a - F['rake_aft'], b - F['rake_fwd']
        for share, r, _ in UPTAKES[sgn]:
            yd = top_a + (top_b - top_a) * share
            pipes.tube((cx, height(f), Z(yd)), (cx, y1 + 0.45, Z(yd - 0.06)), r, colour=srgb(S.BLACK), sides=18)


def wheelhouse_after_wall():
    """
    The wheelhouse's after wall below 2.08 m, which the bridge (wheelhouse.py) leaves to the ship: on the first Chisum it was
    the other ship's. Plating aft and lining forward, as the bridge has them above it; open for the chart room's door and for
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


def wing_brackets():
    """What carries the wheelhouse's wings, which stand out 2.3 m beyond the officers' house to her full breadth: three
    knees under each, from the house's side to the wing's edge."""
    knees = part('officers', 'Bridge wing knees', 'Topside paint')
    y = S.BRIDGE_DECK - PLATE
    for sgn in (1, -1):
        for yd in (100.6, 101.8, 103.0):
            ring = [(sgn * (HH + E), y), (sgn * (WING - 0.10), y), (sgn * (WING - 0.10), y - 0.12), (sgn * (HH + E), y - 1.5)]
            _prism(knees, ring, Z(yd) - 0.006, Z(yd) + 0.006, tint(WHITE, 0.95))


def build():
    _parts.clear()
    decks()
    for plan in PLANS:
        walls(plan)
    house_trunk()
    platform()
    fixed_ramp()
    cargo_lift()
    helideck()
    stern_ramp()
    pilot_doors()
    stern_lights()
    funnels()
    wheelhouse_after_wall()
    wing_brackets()
    open_deck_rails()
    return [p for p in _parts.values() if p.f]
