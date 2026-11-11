#!/usr/bin/env python3
"""
Puts the Chisum together for the viewer: the parts built in Blender into ferry/data/ferry.bin.gz.

    python3 ferry/blender/assemble.py --part chisum-hull.npz [--base <a ferry.bin.gz>] [--out ferry/data/ferry.bin.gz]

The base is a JMF1 file: the Town's export of the Minato Maru (tools/ferry-viewer-export.mjs), or the viewer's own file
as this tool last wrote it (the default). What Blender has built replaces what stood there before:

  - every mesh a part file brings is marked `from: "blender"`; meshes so marked in the base are dropped first, so the
    tool can be run again on its own output;
  - a part named in SUPERSEDES replaces the base's own meshes of that part (the Minato Maru's hull goes when the
    Chisum's hull comes); the rule says what is kept and where it goes;
  - what the base keeps under the car deck is fitted inside the Chisum's shell (FIT), because the Minato Maru's
    machinery spaces are square rooms and their corners stand through her plating where the hull rises aft;
  - where the base lays a floor over a stairwell, the well is opened (OPENINGS), so the stair can be seen from the deck
    it leads to and gone down as well as up; where a door of the Chisum's stands in a wall of the base, the wall is
    opened for it.

Needs numpy; no Blender.
"""
import argparse, gzip, json, os, struct, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lines as L
import spec as S

DEFAULT = os.path.join(HERE, '..', 'data', 'ferry.bin.gz')

# The parts Blender has built, and what becomes of the base's own meshes there.
SUPERSEDES = {
    'hull': dict(
        section='Hull', built='10 November 2026',
        # The base sorts the engine control booth's window into the hull (it stands below the car deck and is not part
        # of the engine room's model): glass is not hull, so it goes with the machinery spaces it belongs to.
        keep=lambda m: m['transparent'] and m['opacity'] < 1, keep_in='machinery',
        why='her own hull, built in Blender from her lines',
        what='the hull, from her lines (plating, frames, floors and bulkheads, the gear of her spaces, screws and rudders)'),
    # The Minato Maru's roof, mast and fittings (1,164 triangles) go; hers take their place, the same size and in the same
    # places, so the ladder that comes up to it and the rooms under it still fit.
    'top': dict(
        section='Compass deck and mast', built='10 November 2026',
        keep=lambda m: False, keep_in=None,
        why="her own compass deck, mast and fittings, built in Blender",
        what='the compass deck, mast and what they carry (radar, lights, antennas, searchlight, vents)'),
}
# A slice of a part, not the whole of it (section 5, the bridge deck, is built a room at a time): what Blender has built
# there takes the place of the base's own pieces inside `box` (x, y and z in the ship's axes). A piece is a connected set
# of triangles (the base draws each box, bar and plate of its interiors as one); it goes when its whole extent lies in the
# box, unless `keep` says it is not furniture (glass, window frames). Pieces that run out of the box (walls, the deck)
# stay. A slice is replaced when a part brings an object whose name begins with `prefix`.
# `clear` is a second box, emptied whatever is in it: the base's walls there are one piece with the rest of the house, so they
# cannot go as pieces; every triangle of the base inside the box goes, and one that crosses its faces is cut there.
REPLACES = {
    'wheelhouse': dict(
        part='bridge', prefix='Wheelhouse', section='Navigation bridge', built='11 November 2026',
        # From the forward face of the wheelhouse's aft wall (19.54 m from the transom) to the front, both wings with it.
        box=dict(x=(-4.35, 4.35), y=(9.09, 11.45), z=(L.Z(19.495), L.Z(23.10))),
        keep=lambda mat, col: False,
        # The walls, windows and linings of the wheelhouse itself: from just off the aft wall's face to the front, from just
        # over the deck's plating to the roof.
        clear=dict(x=(-3.02, 3.02), y=(9.102, 11.36), z=(L.Z(19.545), L.Z(23.12))),
        why='her own navigation bridge, built in Blender',
        what='the navigation bridge (the wheelhouse plated, lined and glazed, its console and every instrument, the boards and their wiring, both wings)'),
}
def _box(x, y, yard):
    return dict(x=x, y=y, z=(L.Z(yard[0]), L.Z(yard[1])))


def _side(s, a, b):
    """A range off the centreline on the port side (s = 1) or its mirror image to starboard (s = -1)."""
    return tuple(sorted((s * a, s * b)))


# Her stairs (blender/stairs.py, spec.STAIRS) take the place of the other ship's, stair by stair: its steps, the two bars
# they lie on and its slanted handrail bars are pieces wholly inside each box. A rule with `boxes` has several.
REPLACES.update({
    'stairs-passenger-deck': dict(
        part='passenger', prefix='Stair,', section='Stairs', built='11 November 2026',
        boxes=[_box((3.42, 4.09), (6.45, 10.05), (17.50, 19.60)), _box((-4.09, -3.42), (6.45, 10.05), (17.50, 19.60)),      # to the wings
               _box((0.80, 1.50), (6.45, 10.05), (3.20, 4.90)), _box((-1.50, -0.80), (6.45, 10.05), (3.20, 4.90)),           # to the after landing
               _box((-2.93, -2.12), (6.45, 10.05), (17.60, 20.40))],                                                          # the crew stair
        keep=lambda mat, col: False,
        why='her own stairs, built in Blender to the yard\'s standard',
        what='the stairs, each to the yard\'s standard (steps, stringers, handrails)'),
    # The bridge deck abaft the wheelhouse (blender/bridge_deck.py): the corridor's handrail bars, which hung 2 cm off the
    # walls; the box under its deckhead (hers is panelled, with the lights in it); the nine windows' flat frames and glass
    # inside the plating. The walls stay: the cabins behind them are not rebuilt yet.
    'bridge-deck': dict(
        part='bridge', prefix='Bridge deck', section='Bridge deck: the corridor and the house outside', built='11 November 2026',
        boxes=[_box((-0.445, -0.39), (10.0, 10.1), (9.85, 19.25)), _box((0.39, 0.445), (10.0, 10.1), (9.85, 19.25)),
               _box((-0.56, 0.56), (11.09, 11.23), (9.35, 17.25)),
               _box((2.93, 3.0), (10.2, 10.9), (9.8, 19.2)), _box((-3.0, -2.93), (10.2, 10.9), (9.8, 19.2))],
        keep=lambda mat, col: False,
        why='her own bridge deck, built in Blender',
        what='the bridge deck abaft the wheelhouse: the corridor (eight cabin doors, storm rails, a panelled deckhead with its lights and '
             'detectors, the fire point) and the house outside (three weathertight doors, nine framed windows, the fire station on the platform)'),
    # The lobby's vending corner: the other ship's two plain boxes go; the owner's own drinks machine stands there (vending.py).
    'vending': dict(
        part='passenger', prefix='Drinks machine', section='Passenger deck fittings', built='11 November 2026', listed=False,
        boxes=[_box((1.70, 2.75), (6.45, 8.35), (8.70, 9.47))],
        keep=lambda mat, col: False,
        why="the owner's drinks machine, read from its own file", what=''),
    # The other ship's mark on each funnel (a flat picture of an anchor standing off the plating): the line's own is painted there.
    'livery': dict(
        part='passenger', prefix='Funnel emblem', section='Livery', built='11 November 2026', listed=False,
        boxes=[_box((3.79, 3.83), (9.4, 10.2), (4.5, 5.3)), _box((-3.83, -3.79), (9.4, 10.2), (4.5, 5.3))],
        keep=lambda mat, col: False,
        why="the line's own mark, built in Blender", what=''),
    # The main stairs' top landing plate and first step, and the guard along each well, which hers takes the place of
    # 5 cm further out (in line with the casing's wall below).
    'stairs-main-top': dict(
        part='passenger', prefix='Stair, main stair', section='Stairs', built='11 November 2026', listed=False,
        boxes=[b for s in (1, -1) for b in (_box(_side(s, 2.79, 4.13), (6.20, 6.52), (7.35, 7.80)), _box(_side(s, 2.68, 2.78), (6.45, 7.65), (7.30, 9.50)))],
        keep=lambda mat, col: False,
        why='her own stairs, built in Blender to the yard\'s standard', what=''),
    # In the casings on the car deck: the other ship's flight (steps, the bars under them, its handrail bars, the plate at its
    # foot, and the bulwark stanchions that stood inside the casing behind it); its doorway's frame, sign and parked leaf;
    # to port the box on the wall where her door now runs, and the foyer's deckhead panel, which lay across her lower flight
    # and in one plane with the casing's own deckhead.
    'stairs-main': dict(
        part='car', prefix='Stair, main stair', section='Stairs', built='11 November 2026', listed=False,
        boxes=[b for s in (1, -1) for b in (_box(_side(s, 2.79, 4.13), (2.05, 7.45), (7.30, 11.45)), _box(_side(s, 2.68, 2.78), (2.05, 4.56), (10.40, 12.62)))]
        + [_box((2.80, 3.06), (3.25, 3.95), (12.65, 13.25)), _box((2.76, 4.16), (4.295, 4.305), (11.25, 14.75))],
        keep=lambda mat, col: False,
        why='her own stairs, built in Blender to the yard\'s standard', what=''),
    # The after stairs' top steps are sorted into the bridge deck in the base.
    'stairs-bridge-deck': dict(
        part='bridge', prefix='Stair,', section='Stairs', built='11 November 2026', listed=False,
        boxes=[_box((0.80, 1.50), (8.80, 8.90), (4.50, 4.79)), _box((-1.50, -0.80), (8.80, 8.90), (4.50, 4.79)),
               _box((-2.93, -2.12), (8.80, 8.95), (19.90, 20.20))],
        keep=lambda mat, col: False,
        why='her own stairs, built in Blender to the yard\'s standard', what=''),
    # The engine room's: its steps, the two bars and the handrails, in the well under the port casing.
    'stairs-machinery': dict(
        part='machinery', prefix='Stair,', section='Stairs', built='11 November 2026', listed=False,
        boxes=[_box((3.05, 4.05), (-1.05, 3.05), (6.30, 8.70))],
        keep=lambda mat, col: False,
        why='her own stairs, built in Blender to the yard\'s standard', what=''),
})
# Pieces of the base moved as they are, where two of them lie in one plane and flicker, or one stands in the way of
# something of hers: every piece wholly inside the box goes by `move` (x, y, metres along the ship).
NUDGES = (
    dict(part='car', what="the threshold's stripes at the lower lobby's port door: they lay in the floor covering's own plane",
         box=_box((2.24, 2.74), (2.09, 2.12), (5.27, 6.43)), move=(0.0, 0.004, 0.0)),
    dict(part='car', what="the inboard baggage cart in the lower lobby: its wheels lay through the other cart's",
         box=_box((1.50, 2.16), (2.09, 3.10), (2.58, 4.25)), move=(-0.16, 0.0, 0.0)),
    dict(part='passenger', what='the bench at the foot of the port after stair, which is 0.6 m longer than the other ship\'s',
         box=_box((0.50, 2.70), (6.45, 7.60), (2.30, 2.90)), move=(0.0, 0.0, -0.45)),
    dict(part='bridge', what="the rail on the corridor wall in the crew cabin, which hung across its doorway: half a metre forward, beside the door",
         box=_box((0.57, 0.59), (10.55, 10.85), (9.40, 10.20)), move=(0.0, 0.0, 0.50)),
    dict(part='bridge', what="the wardrobe in the chief engineer's cabin, which stood in the after half of its doorway: forward of the door",
         box=_box((0.52, 1.12), (9.09, 11.05), (16.55, 17.08)), move=(0.0, 0.0, 0.89)),
    dict(part='passenger', what='the bench at the foot of the starboard after stair',
         box=_box((-2.70, -0.50), (6.45, 7.60), (2.30, 2.90)), move=(0.0, 0.0, -0.45)),
)
# Parts of the base that must lie inside the shell.
FIT = ('machinery',)
# Openings the base's drawing lacks, each cut through one thin plate of it. `across` names the axis the plate is thin
# along (y: a floor, yard: a wall across the ship); the range given for that axis is the plate's own thickness, kept
# narrow so nothing beside it is cut; the other two ranges are the opening.
#  - The Minato Maru's lobby floor (a 5 mm covering, x -4.02 to 4.02, 6.04 to 9.46 m from the transom) is one slab from
#    side to side, over both stairs up from the car deck; the deck plating under it is cut correctly (1.43 m wide to
#    2.75 m off the centreline, 7.40 to 9.40 m from the transom, a kerb along the inboard edge). The covering lies
#    between 6.503 and 6.508: the stair's top step, the kerb and the feet of the walls round the well lie at 6.500 and
#    must stay.
#  - Her engine room's after wall (6 cm, 8.44 to 8.50 m from the transom) has no way aft through it: it is opened where
#    the Chisum's watertight door to the shaft space stands (spec.WT_DOORS), whose frame lines the opening.
#  - Her main stairs are longer than the other ship's (spec.MAIN_STAIR): each well in the passenger deck is lengthened aft
#    from 7.40 m to the top step, through the deck's two faces, the panel under it and the old edge between them; the
#    casing's inboard wall is opened for her doorway from the car deck. To starboard the casing is drawn solid aft of
#    7.40 m and forward of 12.60 m: the pocket for the top steps and the foot lobby are cut out of those blocks.
_MS = S.MAIN_STAIR
_door, _void = S.door_opening(S.WT_DOORS[0]), S.door_opening(S.WT_DOORS[3])


def _main_stair_openings():
    out = []
    T = _MS['well'][0]
    (da, db), dh = _MS['door']['yard'], _MS['door']['height']
    for s, side in ((1, 'port'), (-1, 'starboard')):
        x = _side(s, 2.75, _MS['wall'][1])
        out += [
            dict(part='passenger', name=f'the passenger deck over the {side} stair, lengthened aft: its top', across='y', y=(6.4995, 6.5005), x=x, yard=(T, 7.40)),
            dict(part='passenger', name=f'the passenger deck over the {side} stair, lengthened aft: its underside and the panel under it', across='y',
                 y=(6.244, 6.251), x=x, yard=(T, 7.41)),
            dict(part='passenger', name=f'the old after edge of the well over the {side} stair', across='yard', yard=(7.36, 7.41), x=x, y=(6.24, 6.51)),
        ]
    out.append(dict(part='car', name='the port casing wall at the door to the main stair', across='x', x=(2.745, 2.815), yard=(da, db), y=(2.0, 2.10 + dh)))
    out.append(dict(part='car', name='the starboard casing wall at the door to the main stair', across='x', x=(-2.755, -2.745), yard=(da, db), y=(2.0, 2.10 + dh)))
    inner = _side(-1, _MS['wall'][0], _MS['plate'])
    (pa, pb), (py0, py1) = _MS['pocket']['yard'], _MS['pocket']['y']
    (la, lb), head = _MS['lobby']['yard'], _MS['lobby']['head']
    out += [
        dict(part='car', name="the starboard casing's after block at the main stair's top steps: its forward face", across='yard', yard=(7.395, 7.405), x=inner, y=(py0, py1 + 0.01)),
        dict(part='car', name="the starboard casing's after block at the main stair's top steps: its top", across='y', y=(6.249, 6.251), x=inner, yard=(pa, 7.41)),
        dict(part='car', name="the starboard casing's forward block at the main stair's foot lobby", across='yard', yard=(la - 0.005, la + 0.005), x=inner, y=(2.0, head)),
    ]
    return tuple(out)


#  - Over the engine room the other ship draws that room's deckhead panel as a box 12 mm under the car deck's surface
#    (x -3.98 to 3.98, 14.00 to 26.06 m, 2.070 to 2.088 m above the waterline), in the material its coverings are drawn in,
#    which the page pulls toward the eye. Seen low across the deck, the panel's top came through the deck's paint in
#    patches (the owner, 11 November 2026: "Cargo deck has lots of Z fighting"). Its top face, which nothing should see,
#    is cut away; its underside is still the engine room's deckhead.
OPENINGS = _main_stair_openings() + (
    dict(part='car', name="the top of the engine room's deckhead panel, under the car deck's surface", across='y', y=(2.0875, 2.0887),
         x=(-4.1, 4.1), yard=(13.9, 26.2)),
) + (
    dict(part='passenger', name='the lobby floor over the starboard stair', across='y', y=(6.5015, 6.5095), x=(-4.3, -2.76), yard=(_MS['well'][0], 9.40)),
    dict(part='passenger', name='the lobby floor over the port stair', across='y', y=(6.5015, 6.5095), x=(2.76, 4.3), yard=(_MS['well'][0], 9.40)),
    dict(part='machinery', name="the engine room's after wall at the door to the shaft space", across='yard', yard=(8.435, 8.505),
         x=(_door[0], _door[2]), y=(_door[1], _door[3])),
    #  - The electrical workshop's forward wall (6 cm, 26.00 to 26.06 m) likewise, for the door to the void.
    dict(part='machinery', name="the electrical workshop's forward wall at the door to the void", across='yard', yard=(25.995, 26.065),
         x=(_void[0], _void[2]), y=(_void[1], _void[3])),
) + tuple(
    #  - The car deck has no hatch: its plating, and whatever is laid on it there (the lobby's floor covering), is
    #    opened over each ladder of hers that comes down through it (spec.LADDERS).
    dict(part='car', name=f"the car deck at the {l['hatch_name'].lower()}", across='y', y=(2.05, 2.13),
         x=S.hatch_opening(l)[:2], yard=S.hatch_opening(l)[2:])
    for l in S.LADDERS if l.get('hatch')
) + tuple(
    #  - On the bridge deck a handrail runs along each side of the crew's corridor, 0.94 m up, in one length from 9.30
    #    to 19.20 m: across the four doorways of the cabins on that side. It is cut away at each doorway.
    dict(part='bridge', name=f"the corridor's {'port' if side > 0 else 'starboard'} handrail across the doorway at {a:.2f} m",
         across='x', x=tuple(sorted((side * 0.40, side * 0.44))), y=(10.02, 10.08), yard=(a, b))
    for side in (1, -1) for a, b in ((9.20, 9.90), (11.70, 12.40), (14.20, 14.90), (16.70, 17.40))
) + (
    #  - The wheelhouse's starboard wall has a solid panel (21.25 to 22.15 m, 8 cm thick, floor to head) where the port wall
    #    has a window: cut for the window she is given (0.80 m wide, 0.97 to 1.83 m above the deck), so the helm sees there.
    dict(part='bridge', name='the starboard wall panel at the new window', across='x', x=(-3.005, -2.915), y=(10.07, 10.93), yard=(21.30, 22.10)),
)
# The wheelhouse stands 0.30 m taller than the base's (spec.COMPASS_DECK: `rise`): the room's own box and the compass
# deck's over it follow, and so does what the page says of the part's level.
_TOP = S.COMPASS_DECK['deck'] + S.COMPASS_DECK['rise']
ROOMS = {'wheelhouse': dict(max_y=_TOP), 'compass-deck': dict(min_y=_TOP, max_y=S.MAST['top'])}
LEVELS = {'top': f"{_TOP + 1.9:.1f} m above the keel, masthead light at {S.MAST['masthead'] + 1.9:.1f} m"}

# What the page says of a space, where her own build has changed what the other ship's words describe (the main stairs:
# spec.MAIN_STAIR). The other ship's words named a crew changing room under the port stair; it was never drawn.
SAYS = {
    'casing-p': "1.3 m wide: the engine uptake and engine-room supply-fan trunk, the engine-room entrance (a 1.1 m door) and ladder, main stair P in "
                "its enclosure (22 steps of 200 mm in two flights at 42° with a landing, 1.18 m between the stringers, a handrail each side), the foyer "
                "at its foot with the sliding fire door from the car deck, the gangway passage (1.4 m) with the gangway door and the shore-power box, "
                "a fan and a hydrant",
    'casing-s': "1.3 m wide: uptake trunk, the engine-room escape trunk, main stair S in its enclosure (the same as P; the bosun’s store under it: "
                "lashings, chocks, ropes, fenders), its foot lobby with the sliding fire door from the car deck, a fan and a hydrant",
    'foyer': "1.4 m wide the whole way: the gangway, the gate, the passage through casing P and the foyer aft of it, 2.2 m under its deckhead, which is "
             "also the foot of main stair P; the sliding fire door from the car deck opens into it",
    'lower-lobby': "The car deck’s level aft of the lanes, between the casings under a 2.5 m deckhead: the drivers’ waiting benches along the casings, the "
                   "bicycle rack and the baggage shelf either side of the crew door in the aft bulkhead, a drink machine and the safety plan on the forward "
                   "bulkhead, lifejacket lockers; the engine-room door (casing P), its escape and the bosun’s store (casing S), the crew door aft to the "
                   "mooring station, and two 1.1 m sliding fire doors forward onto the lanes, where the door to each main stair stands just outside in "
                   "the casing’s wall, a zone kept clear before it",
}

# Spaces that are not rooms one goes into: the bow ramp is stowed upright and the two funnels are uptake casings with no
# door. A walk begun there (the room chosen in the panel) starts at `stand`, beside it, where one can walk on:
# (x, y, metres from the transom). The page reads it from the space's record.
STAND = {
    'ramp': (0.0, 2.1, 33.6),
    'funnel-p': (2.55, 6.5, 4.35),
    'funnel-s': (-2.55, 6.5, 4.35),
}
MATERIAL_DEFAULTS = dict(shading='standard', metalness=0, roughness=1, transparent=False, opacity=1, emissive='#000000',
                         emissiveIntensity=1, side='front', textured=False, depthWrite=True, alphaTest=0, offset=None, atlas=0, clear=False)


def read_jmf(path):
    raw = gzip.open(path, 'rb').read()
    if raw[:4] != b'JMF1':
        raise SystemExit(f'{path} is not a JMF1 file')
    n = struct.unpack('<I', raw[4:8])[0]
    return json.loads(raw[8:8 + n].decode()), raw[8 + n:]


def decode(header, block, rec):
    lo, hi = np.array(header['bounds']['min']), np.array(header['bounds']['max'])
    nv, nt = rec['vertices'], rec['triangles']
    out = dict(material=rec['material'], origin=rec.get('from', 'town'), mover=rec.get('mover'))
    out['pos'] = np.frombuffer(block, '<u2', nv * 3, rec['pos']).reshape(-1, 3).astype(np.float64) / 65535 * (hi - lo) + lo
    out['nor'] = np.frombuffer(block, 'i1', nv * 3, rec['nor']).reshape(-1, 3).copy()
    out['col'] = np.frombuffer(block, 'u1', nv * 3, rec['col']).reshape(-1, 3).copy()
    out['uv'] = np.frombuffer(block, '<u2', nv * 2, rec['uv']).reshape(-1, 2).copy() if 'uv' in rec else None
    out['idx'] = np.frombuffer(block, '<u4' if rec.get('wide') else '<u2', nt * 3, rec['idx']).reshape(-1, 3).astype(np.uint32)
    return out


def fit_inside(pos, clear=0.03):
    """Move every point that stands outside the shell (below the car deck) just inside it, by the shorter way: in toward
    the centreline, or up. Returns how many were moved and the furthest move."""
    moved, furthest = 0, 0.0
    low = np.nonzero((pos[:, 1] < L.CAR - 0.05) & (np.abs(pos[:, 2]) < L.HALF))[0]
    # Amidships the section is the same from frame to frame and nothing below 3.5 m off the centreline can be outside.
    yards = pos[low, 2] + L.HALF
    maybe = low[(np.abs(pos[low, 0]) > 3.5) | (yards < 10.7) | (yards > 25.4)]
    for i in maybe:
        x, y, z = pos[i]
        ax = abs(x)
        hx = L.hull_x(y, z)
        hy = L.hull_y(ax, z)
        # Inside by either measure is inside: clear of the plating beside it, or clear of the plating under it. 5 mm of
        # grace, so a point this tool has already fitted is left where it is and a second run changes nothing.
        if ax <= hx - clear + 0.005 or (hy is not None and ax <= hx and y >= hy + clear - 0.005):
            continue
        ways = []
        if hx > 0.3:
            ways.append((ax - (hx - clear), (np.sign(x) * (hx - clear), y)))
        # Up is only a way in when the shell is over the point (a point under her bottom).
        if hy is not None and hy + clear > y:
            ways.append((hy + clear - y, (x, hy + clear)))
        if not ways:
            continue
        d, (nx, ny) = min(ways, key=lambda w: w[0])
        pos[i, 0], pos[i, 1] = nx, ny
        moved += 1
        furthest = max(furthest, d)
    return moved, furthest


def _clip(poly, axis, bound, below):
    """A polygon (a list of (point, weights)) cut by the plane `axis` = bound; the side kept is the one below it, or above."""
    out = []
    for (p, w), (q, v) in zip(poly, poly[1:] + poly[:1]):
        dp, dq = (bound - p[axis]) if below else (p[axis] - bound), (bound - q[axis]) if below else (q[axis] - bound)
        if dp >= 0:
            out.append((p, w))
        if (dp > 0 and dq < 0) or (dp < 0 and dq > 0):
            t = dp / (dp - dq)
            m = p + (q - p) * t
            m[axis] = bound
            out.append((m, w + (v - w) * t))
    return out


def open_plate(m, thin, level, a, a_range, b, b_range, grace=0.002):
    """
    Cut a rectangle out of every face of the mesh that lies within `level` along the axis `thin` (the plate's own
    thickness): the rectangle is a_range by b_range along the axes a and b. What is left of each face is drawn again in
    pieces that meet corner to corner. Returns how many triangles were cut; a mesh already cut is left as it is, so a
    second run changes nothing. The plate's edge round the opening is not drawn.
    """
    pos, idx = m['pos'], m['idx']
    T = pos[idx]
    lo, hi = T.min(1), T.max(1)
    hit = ((lo[:, thin] >= level[0]) & (hi[:, thin] <= level[1]) & (hi[:, a] > a_range[0] + grace) & (lo[:, a] < a_range[1] - grace)
           & (hi[:, b] > b_range[0] + grace) & (lo[:, b] < b_range[1] - grace))
    if not hit.any():
        return 0
    # Round the opening: the two sides beyond it along a, and the two ends between them.
    regions = (((a, a_range[0], True),), ((a, a_range[1], False),),
               ((a, a_range[0], False), (a, a_range[1], True), (b, b_range[0], True)), ((a, a_range[0], False), (a, a_range[1], True), (b, b_range[1], False)))
    new_pos, new_w, new_from = [], [], []
    for t in np.nonzero(hit)[0]:
        tri = [(pos[idx[t, k]].copy(), np.eye(3)[k]) for k in range(3)]
        for r, region in enumerate(regions):
            poly = tri
            for axis, bound, below in region:
                poly = _clip(poly, axis, bound, below)
                if len(poly) < 3:
                    break
            if len(poly) < 3:
                continue
            if r < 2:
                # A side piece meets the two end pieces along its edge at the opening: it takes their corners too.
                edge, more = region[0][1], []
                for (p, w), (q, v) in zip(poly, poly[1:] + poly[:1]):
                    more.append((p, w))
                    if abs(p[a] - edge) < 1e-9 and abs(q[a] - edge) < 1e-9:
                        cuts = sorted((c for c in b_range if min(p[b], q[b]) + 1e-9 < c < max(p[b], q[b]) - 1e-9), reverse=p[b] > q[b])
                        for c in cuts:
                            f = (c - p[b]) / (q[b] - p[b])
                            more.append((p + (q - p) * f, w + (v - w) * f))
                poly = more
                # Fanned from the corner furthest from that edge, so no piece is a sliver along it.
                k = max(range(len(poly)), key=lambda i: abs(poly[i][0][a] - edge))
                poly = poly[k:] + poly[:k]
            for u, v in zip(poly[1:], poly[2:]):
                if np.linalg.norm(np.cross(u[0] - poly[0][0], v[0] - poly[0][0])) < 1e-9:
                    continue
                for p, w in (poly[0], u, v):
                    new_pos.append(p); new_w.append(w); new_from.append(t)
    new_w, corners = np.array(new_w).reshape(-1, 3), idx[np.array(new_from, dtype=np.int64).reshape(-1)]
    first = len(pos)
    m['pos'] = np.concatenate([pos, np.array(new_pos).reshape(-1, 3)])
    for key in ('nor', 'col', 'uv'):
        if m[key] is None:
            continue
        mixed = np.einsum('nk,nkc->nc', new_w, m[key][corners].astype(np.float64))
        m[key] = np.concatenate([m[key], np.rint(mixed).astype(m[key].dtype)])
    added = np.arange(first, first + len(new_pos), dtype=np.uint32).reshape(-1, 3)
    m['idx'] = np.concatenate([idx[~hit], added])
    return int(hit.sum())


def pieces_of(m):
    """The connected pieces of a mesh: a list of triangle-index arrays. Two triangles are one piece where they share a corner."""
    pos, idx = m['pos'], m['idx']
    _, inv = np.unique(np.round(pos * 1e4).astype(np.int64), axis=0, return_inverse=True)
    inv = inv.reshape(-1)
    parent = np.arange(inv.max() + 1)

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a
    for t in idx:
        a, b, c = (find(inv[i]) for i in t)
        parent[b] = a
        parent[find(c)] = find(a)
    root = np.array([find(inv[t[0]]) for t in idx])
    order = np.argsort(root, kind='stable')
    cuts = np.nonzero(np.diff(root[order]))[0] + 1
    return np.split(order, cuts)


def replace_slice(m, rule, mat):
    """Drop the pieces of a base mesh that lie wholly in the slice's box, bar what `keep` spares; the vertices left unused go too.
    Returns how many triangles went."""
    bounds = [(np.array([b['x'][0], b['y'][0], b['z'][0]]), np.array([b['x'][1], b['y'][1], b['z'][1]])) for b in rule.get('boxes') or [rule['box']]]
    pos, idx = m['pos'], m['idx']
    drop = np.zeros(len(idx), bool)
    for tri in pieces_of(m):
        P = pos[idx[tri]].reshape(-1, 3)
        a, b = P.min(0), P.max(0)
        if any((a >= lo).all() and (b <= hi).all() for lo, hi in bounds) and not rule['keep'](mat, m['col'][idx[tri[0]][0]]):
            drop[tri] = True
    if not drop.any():
        return 0
    idx = idx[~drop]
    used, inverse = np.unique(idx, return_inverse=True)
    m['pos'], m['nor'], m['col'] = pos[used], m['nor'][used], m['col'][used]
    if m['uv'] is not None:
        m['uv'] = m['uv'][used]
    m['idx'] = inverse.reshape(-1, 3).astype(np.uint32)
    return int(drop.sum())


def clear_box(m, box, grace=0.002):
    """
    Empty a box of the mesh: a triangle wholly inside goes; one that crosses its faces is cut there and what lies outside is
    kept, drawn again in pieces. A triangle that only comes near is left as it is, and so is every piece this has made
    (each lies beyond one face of the box), so a second run changes nothing. Returns how many triangles went or were cut.
    """
    lo = np.array([box['x'][0], box['y'][0], box['z'][0]])
    hi = np.array([box['x'][1], box['y'][1], box['z'][1]])
    pos, idx = m['pos'], m['idx']
    T = pos[idx]
    tlo, thi = T.min(1), T.max(1)
    near = ((thi > lo + grace) & (tlo < hi - grace)).all(1)
    if not near.any():
        return 0
    drop = np.zeros(len(idx), bool)
    new_pos, new_w, new_from = [], [], []
    for t in np.nonzero(near)[0]:
        rest = [(pos[idx[t, k]].copy(), np.eye(3)[k]) for k in range(3)]
        kept = []
        for axis in range(3):
            for bound, below in ((lo[axis], True), (hi[axis], False)):
                out = _clip(rest, axis, bound, below)
                if len(out) >= 3:
                    kept.append(out)
                rest = _clip(rest, axis, bound, not below)
                if len(rest) < 3:
                    break
            if len(rest) < 3:
                break
        if len(rest) < 3:
            continue                                  # nothing of it is inside: left as it is
        area = 0.0
        for u, v in zip(rest[1:], rest[2:]):
            area += np.linalg.norm(np.cross(u[0] - rest[0][0], v[0] - rest[0][0]))
        if area < 1e-8:
            continue
        drop[t] = True
        for poly in kept:
            for u, v in zip(poly[1:], poly[2:]):
                if np.linalg.norm(np.cross(u[0] - poly[0][0], v[0] - poly[0][0])) < 1e-9:
                    continue
                for p, w in (poly[0], u, v):
                    new_pos.append(p); new_w.append(w); new_from.append(t)
    if not drop.any():
        return 0
    if new_pos:
        new_w, corners = np.array(new_w).reshape(-1, 3), idx[np.array(new_from, dtype=np.int64).reshape(-1)]
        first = len(pos)
        m['pos'] = np.concatenate([pos, np.array(new_pos).reshape(-1, 3)])
        for key in ('nor', 'col', 'uv'):
            if m[key] is None:
                continue
            mixed = np.einsum('nk,nkc->nc', new_w, m[key][corners].astype(np.float64))
            m[key] = np.concatenate([m[key], np.rint(mixed).astype(m[key].dtype)])
        added = np.arange(first, first + len(new_pos), dtype=np.uint32).reshape(-1, 3)
        idx = np.concatenate([idx[~drop], added])
    else:
        idx = idx[~drop]
    used, inverse = np.unique(idx, return_inverse=True)
    m['pos'], m['nor'], m['col'] = m['pos'][used], m['nor'][used], m['col'][used]
    if m['uv'] is not None:
        m['uv'] = m['uv'][used]
    m['idx'] = inverse.reshape(-1, 3).astype(np.uint32)
    return int(drop.sum())


def weld(pos, nor, col, lo, hi, uv=None):
    """Triangle corners → shared vertices and indices, quantised as the file keeps them."""
    q = np.rint((pos - lo) / (hi - lo) * 65535).astype(np.uint16)
    n = np.clip(np.rint(nor * 127), -127, 127).astype(np.int8)
    cols = [q.astype(np.int32), n.astype(np.int32), col.astype(np.int32)]
    if uv is not None:
        cols.append(np.clip(np.rint(uv * 65535), 0, 65535).astype(np.int32))
    rows = np.concatenate(cols, axis=1)
    uniq, inverse = np.unique(rows, axis=0, return_inverse=True)
    tri = inverse.reshape(-1, 3).astype(np.uint32)
    tri = tri[(tri[:, 0] != tri[:, 1]) & (tri[:, 1] != tri[:, 2]) & (tri[:, 0] != tri[:, 2])]
    return uniq[:, :3].astype(np.uint16), uniq[:, 3:6].astype(np.int8), uniq[:, 6:9].astype(np.uint8), tri, (uniq[:, 9:11].astype(np.uint16) if uv is not None else None)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--part', action='append', required=True, help='a part file written by export_jmf.py (may be given more than once)')
    ap.add_argument('--base', default=DEFAULT)
    ap.add_argument('--out', default=DEFAULT)
    ap.add_argument('--report')
    a = ap.parse_args()

    header, block = read_jmf(a.base)
    groups = header['views'][0]['groups']
    by_id = {g['id']: g for g in groups}
    materials = header['materials']
    meshes = {g['id']: [decode(header, block, rec) for rec in g['meshes']] for g in groups}
    report = dict(base=os.path.basename(a.base), dropped=[], moved=[], fitted=[], opened=[], added=[])

    parts = []
    for path in a.part:
        z = np.load(path)
        meta = json.loads(bytes(z['meta']).decode())
        parts.append((meta, z))
    built = {m['group'] for meta, _ in parts for m in meta['meshes']}

    # 1. What Blender built before goes; what it builds now takes the place of the base's own.
    for gid in list(meshes):
        keep = []
        for m in meshes[gid]:
            if m['origin'] == 'blender':
                report['dropped'].append(dict(part=gid, material=m['material'], triangles=len(m['idx']), why='built in Blender before'))
            elif gid in SUPERSEDES and gid in built:
                rule = SUPERSEDES[gid]
                if rule['keep'](materials[m['material']]):
                    meshes[rule['keep_in']].append(m)
                    report['moved'].append(dict(part=gid, to=rule['keep_in'], material=m['material'], triangles=len(m['idx'])))
                else:
                    report['dropped'].append(dict(part=gid, material=m['material'], triangles=len(m['idx']), why=rule['why']))
            else:
                keep.append(m)
        meshes[gid] = keep

    # 1b. A slice of a part: the base's pieces inside its box go where Blender has built them again.
    names = {o['name'] for meta, _ in parts for m in meta['meshes'] for o in m['objects']}
    for key, rule in REPLACES.items():
        if not any(n.startswith(rule['prefix']) for n in names):
            continue
        kept = []
        for m in meshes[rule['part']]:
            cut = replace_slice(m, rule, materials[m['material']]) if m['origin'] == 'town' else 0
            if m['origin'] == 'town' and rule.get('clear') and len(m['idx']):
                cut += clear_box(m, rule['clear'])
            if cut:
                report['dropped'].append(dict(part=rule['part'], material=m['material'], triangles=cut, why=rule['why']))
            if len(m['idx']):
                kept.append(m)
        meshes[rule['part']] = kept
        report.setdefault('replaced', []).append(key)

    # 1c. Pieces of the base moved as they are.
    for nudge in NUDGES:
        b = nudge['box']
        lo, hi = np.array([b['x'][0], b['y'][0], b['z'][0]]), np.array([b['x'][1], b['y'][1], b['z'][1]])
        moved = 0
        for m in meshes.get(nudge['part'], []):
            if m['origin'] != 'town':
                continue
            for tri in pieces_of(m):
                corners = np.unique(m['idx'][tri])
                P = m['pos'][corners]
                if (P.min(0) >= lo).all() and (P.max(0) <= hi).all():
                    m['pos'][corners] = P + np.array(nudge['move'], dtype=P.dtype)
                    moved += len(tri)
        report.setdefault('nudged', []).append(dict(part=nudge['part'], what=nudge['what'], triangles=moved))

    # 2. The base's rooms under the car deck are fitted inside her shell.
    for gid in FIT:
        for m in meshes.get(gid, []):
            if m['origin'] != 'town':
                continue
            moved, furthest = fit_inside(m['pos'])
            if moved:
                report['fitted'].append(dict(part=gid, material=m['material'], vertices=moved, furthest=round(float(furthest), 3)))

    # 2b. Openings the base's drawing lacks: stairwells it floors over, a wall where a door now stands.
    AXES = dict(x=0, y=1, yard=2)
    for o in OPENINGS:
        span = dict(x=o['x'], y=o['y'], yard=(L.Z(o['yard'][0]), L.Z(o['yard'][1])))
        thin = o['across']
        u, v = (k for k in ('x', 'y', 'yard') if k != thin)
        for m in meshes.get(o['part'], []):
            if m['origin'] != 'town':
                continue
            cut = open_plate(m, AXES[thin], span[thin], AXES[u], span[u], AXES[v], span[v])
            if cut:
                report['opened'].append(dict(part=o['part'], what=o['name'], material=m['material'], triangles=cut))

    # 2c. Where a walk begins at a space that is not entered; and the rooms whose height is hers, not the base's.
    for g in groups:
        if g['id'] in LEVELS:
            g['level'] = LEVELS[g['id']]
        for sp in g['spaces']:
            if sp['id'] in ROOMS:
                rule = ROOMS[sp['id']]
                if 'min_y' in rule:
                    sp['min'][1] = round(rule['min_y'], 4)
                if 'max_y' in rule:
                    sp['max'][1] = round(rule['max_y'], 4)
            if sp['id'] in SAYS:
                sp['text'] = SAYS[sp['id']]
            if sp['id'] in STAND:
                x, y, yard = STAND[sp['id']]
                sp['stand'] = [x, y, round(L.Z(yard), 4)]

    # 3. Bounds over everything, then the new parts.
    look_index = {}

    def material_of(look):
        rec = dict(MATERIAL_DEFAULTS)
        rec.update(metalness=round(float(look['metalness']), 3), roughness=round(float(look['roughness']), 3), side=look.get('side', 'front'),
                   offset=[int(v) for v in look['offset']] if look.get('offset') else None)
        for key in ('transparent', 'opacity', 'depthWrite', 'shading', 'textured', 'atlas', 'emissive', 'emissiveIntensity', 'clear'):
            if key in look:
                rec[key] = look[key]
        key = json.dumps(rec, sort_keys=True)
        if key not in look_index:
            for i, m in enumerate(materials):
                if json.dumps({k: m.get(k, MATERIAL_DEFAULTS[k]) for k in MATERIAL_DEFAULTS}, sort_keys=True) == key:
                    look_index[key] = i
                    break
            else:
                materials.append(rec)
                look_index[key] = len(materials) - 1
        return look_index[key]

    fresh = []
    for meta, z in parts:
        for m in meta['meshes']:
            if m['group'] not in by_id:
                raise SystemExit(f'the part file brings "{m["group"]}", which is not one of the viewer\'s parts')
            fresh.append(dict(group=m['group'], material=material_of(m['look']), name=m['material'], objects=m['objects'], mover=m.get('mover') or None,
                              pos=z[m['key'] + '|pos'].astype(np.float64), nor=z[m['key'] + '|nor'], col=z[m['key'] + '|col'],
                              uv=z[m['key'] + '|uv'].astype(np.float64) if m['key'] + '|uv' in z.files else None))
    # The box positions are kept over: the base's own, widened where a new part reaches further. It never shrinks, so
    # what the base keeps stays on the same grid and a second run gives the same file.
    lo, hi = np.array(header['bounds']['min'], dtype=np.float64), np.array(header['bounds']['max'], dtype=np.float64)
    for m in fresh:
        lo = np.minimum(lo, np.round(m['pos'].min(0) - 0.001, 4))
        hi = np.maximum(hi, np.round(m['pos'].max(0) + 0.001, 4))

    chunks, offset = [], 0

    def chunk(arr):
        nonlocal offset
        b = arr.tobytes()
        at = offset
        chunks.append(b)
        offset += len(b)
        pad = (4 - offset % 4) % 4
        if pad:
            chunks.append(b'\0' * pad)
            offset += pad
        return at

    def record(material, origin, pos_q, nor, col, idx, uv=None, mover=None):
        wide = len(pos_q) > 65535
        rec = dict(material=material, vertices=int(len(pos_q)), triangles=int(len(idx)), wide=wide)
        if mover:
            rec['mover'] = mover
        rec['pos'] = chunk(pos_q.astype('<u2'))
        rec['nor'] = chunk(nor.astype('i1'))
        rec['col'] = chunk(col.astype('u1'))
        if uv is not None:
            rec['uv'] = chunk(uv.astype('<u2'))
        rec['idx'] = chunk(idx.astype('<u4' if wide else '<u2'))
        if origin == 'blender':
            rec['from'] = 'blender'
        return rec

    for g in groups:
        out = []
        for m in meshes[g['id']]:
            q = np.rint((m['pos'] - lo) / (hi - lo) * 65535).astype(np.uint16)
            out.append(record(m['material'], m['origin'], q, m['nor'], m['col'], m['idx'], m['uv'], m['mover']))
        for m in (f for f in fresh if f['group'] == g['id']):
            q, n, c, tri, uv = weld(m['pos'], m['nor'], m['col'], lo, hi, m['uv'])
            out.append(record(m['material'], 'blender', q, n, c, tri, uv, mover=m['mover']))
            report['added'].append(dict(part=g['id'], material=m['name'], vertices=int(len(q)), triangles=int(len(tri)), objects=m['objects']))
        g['meshes'] = sorted(out, key=lambda r: (r['material'], r.get('mover', '')))

    header['bounds'] = dict(min=[float(v) for v in lo], max=[float(v) for v in hi])
    # What can be worked on the page (inputs) and how the moving parts answer (movers): Blender's replace Blender's.
    for key in ('inputs', 'movers', 'ways'):
        kept = [x for x in header.get(key, []) if x.get('from') != 'blender']
        brought = [dict(x, **{'from': 'blender'}) for meta, _ in parts for x in meta.get(key, [])]
        if kept or brought:
            header[key] = kept + brought
        else:
            header.pop(key, None)
    ship = header['ship']
    ship['name'] = S.SHIP_NAME            # her name is the yard's (spec.py), whatever the base was exported as
    ship['built'] = [dict(part=gid, section=SUPERSEDES[gid]['section'], date=SUPERSEDES[gid]['built'], what=SUPERSEDES[gid]['what']) for gid in SUPERSEDES
                     if any(f['group'] == gid for f in fresh) or any(b.get('part') == gid and b.get('section') == SUPERSEDES[gid]['section'] for b in ship.get('built', []))]
    for key, rule in REPLACES.items():
        if not rule.get('listed', True):
            continue
        if key in report.get('replaced', []) or any(b.get('section') == rule['section'] for b in ship.get('built', [])):
            ship['built'].append(dict(part=rule['part'], section=rule['section'], date=rule['built'], what=rule['what']))
    header['source']['blender'] = dict(generator=parts[0][0]['generator'], blender=parts[0][0]['blender'])
    # Her own sheet of pictures (atlas.py) beside the base's: a material's `atlas` says which of the two it is drawn from.
    sheet = json.load(open(os.path.join(HERE, 'atlas.json')))
    header['atlases'] = [dict(header['atlas']), dict(file=sheet['file'], size=sheet['size'])]
    # The register: where each component of hers is, joined with what it is, what feeds it and what it talks to.
    boxes = {}
    for meta, _ in parts:
        boxes.update(meta.get('components', {}))
    sys.path.insert(0, os.path.join(HERE, '..', 'systems'))
    import register
    systems = register.write(boxes, quiet=True)
    header['systems'] = dict(file='systems.json', components=len(systems['components']))
    # Her stairs, as the yard's standard has them (spec.STAIRS): what each is, for the page and for the check that walks them.
    import stair_rules
    limit = lambda c: dict(pitch=c['pitch'], going=c['going'], width=c['width'], rise=list(c['rise']), flight=c['flight'])
    header['stairs'] = [dict(stair_rules.facts(st), className=S.STAIR_CLASS[st['cls']]['name'], limit=limit(S.STAIR_CLASS[st['cls']])) for st in S.STAIRS
                        if any(o['name'].startswith(f"Stair, {st['name']},") for f in fresh for o in f['objects'])]
    text = json.dumps(header, ensure_ascii=False, separators=(',', ':')).encode()
    text += b' ' * ((4 - len(text) % 4) % 4)
    body = b'JMF1' + struct.pack('<I', len(text)) + text + b''.join(chunks)
    with open(a.out, 'wb') as f:
        # No time and no file name in the gzip header: the same ship gives the same file, byte for byte.
        with gzip.GzipFile(filename='', fileobj=f, mode='wb', compresslevel=9, mtime=0) as gz:
            gz.write(body)
    report['triangles'] = {g['id']: sum(r['triangles'] for r in g['meshes']) for g in groups}
    report['bytes'] = os.path.getsize(a.out)
    if a.report:
        json.dump(report, open(a.report, 'w'), indent=1)
    print(f"{a.out}: {report['bytes']} bytes, {sum(report['triangles'].values())} triangles")
    for r in report.get('nudged', []):
        print('  nudged', r['part'], r['triangles'], 'triangles:', r['what'])
    for k in ('dropped', 'moved', 'fitted', 'opened'):
        for r in report[k]:
            print(' ', k, r)
    for r in report['added']:
        print('  added', r['part'], r['material'], r['triangles'], 'triangles')
    sys.stdout.flush()


if __name__ == '__main__':
    main()
