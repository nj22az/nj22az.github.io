#!/usr/bin/env python3
"""
Puts the Chisum together for the viewer: the parts built in Blender into ferry/data/ferry.bin.gz.

    python3 ferry/blender/assemble.py --part chisum.npz [--out ferry/data/ferry.bin.gz]

She is the 124.8 m ro-ro freight ferry of the general arrangement (ga.py, revision D), and everything in the file is her
own: the tool starts from nothing.

  - every mesh of the part file goes into the viewer's part it was built for (spec.PARTS: hull, machinery, main, upper,
    boat, officers, bridge, top);
  - the rooms the page lists are the spaces of ga.py, each with its place, what it is for, and where a walk begun there
    starts when the room itself is not entered (a tank, a funnel, a stair);
  - her register is written beside the model with the places of the same build (systems.json), and her stairs as the
    yard's standard has them;
  - every corner is kept as three whole numbers, 65,535 steps across her bounds: 0.3 mm across her breadth, 0.4 mm in
    height, 1.9 mm along her length. Fine work (a part built `fine`: engraved lettering, a dial's scale and needle) is
    kept in a box of its own instead (`box` in its record), so that a 7 mm letter on a face that runs fore and aft
    keeps its uprights.

The same parts give the same file, byte for byte. Needs numpy; no Blender.
"""
import argparse, gzip, json, os, struct, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lines as L
import spec as S
import ga
import eg_place
import bridge_place as BP
import mark as M

DEFAULT = os.path.join(HERE, '..', 'data', 'ferry.bin.gz')
BUILT = '12 November 2026'
D = ga.DECKS

# ---- The viewer's parts, bottom to top: what each is called, what the page says of its level, how far it lifts when she is
# taken apart (each clear of the one under it).
GROUPS = [
    dict(id='hull', name='Hull', lift=0.0,
         level=f'{L.LENGTH:.1f} m long, {L.BEAM:.1f} m beam, {L.DEPTH:.1f} m to the main deck, {L.DRAFT:.1f} m draught'),
    dict(id='machinery', name='Below the main deck', lift=15.0, level=f"Tank top {D['tank_top']:.1f} m above the keel, the engine room platform at {D['platform']:.1f} m"),
    dict(id='main', name='Main deck', lift=22.0, level=f"{D['main']:.1f} m above the keel"),
    dict(id='upper', name='Upper deck', lift=31.0, level=f"{D['upper']:.1f} m above the keel"),
    dict(id='boat', name='Boat deck', lift=39.0, level=f"{D['boat']:.1f} m above the keel"),
    dict(id='officers', name="Officers' deck", lift=44.0, level=f"{D['officers']:.1f} m above the keel"),
    dict(id='bridge', name='Bridge deck', lift=49.0, level=f"{D['bridge']:.1f} m above the keel"),
    dict(id='top', name='Compass deck', lift=54.0,
         level=f"{D['compass']:.1f} m above the keel, masthead light at {L.above_keel(BP.Y(S.MAST['masthead'])):.1f} m"),
]
assert tuple(g['id'] for g in GROUPS) == S.PARTS
PLAN_GROUP = dict(hold='machinery', main='main', upper='upper', boat='boat', officers='officers', bridge='bridge', top='top')
# The floor and the head of a plan's rooms, over the waterline.
PLAN_LEVELS = dict(hold=(S.TANK_TOP, S.MAIN_DECK - 0.03), main=(S.MAIN_DECK, S.UPPER_DECK - 0.012), upper=(S.UPPER_DECK, S.BOAT_DECK - 0.012),
                   boat=(S.BOAT_DECK, S.OFFICERS_DECK - 0.012), officers=(S.OFFICERS_DECK, S.BRIDGE_DECK - 0.012), bridge=(S.BRIDGE_DECK, S.COMPASS_DECK - 0.012),
                   top=(S.COMPASS_DECK, S.COMPASS_DECK + 2.2))
# Rooms whose floor is not their plan's (ga.py: a space's `level`).
LEVEL_FLOOR = dict(platform=S.PLATFORM, aft=S.AFT_FLAT, helideck=S.HELIDECK, forecastle=S.UPPER_DECK)
# Spaces that are not rooms one goes into (a tank, a trunk, a funnel, a stair's own length), or whose middle is no place to
# stand: a walk begun there starts at `stand`, beside it or at its landing, where one can walk on:
# (x, height over the waterline, metres from the transom).
_ramp = lambda yd: S.MAIN_DECK + (yd - ga.FIXED_RAMP['yard'][0]) / ga.FIXED_RAMP['slope']       # the fixed ramp's roadway
TT, MD, UD = S.TANK_TOP, S.MAIN_DECK, S.UPPER_DECK
STAND = {
    'fw-tank-p': (0.0, S.AFT_FLAT, 12.4), 'fw-tank-s': (0.0, S.AFT_FLAT, 11.4),
    'heeling-tank-p': (5.0, TT, 57.4), 'heeling-tank-s': (-5.0, TT, 53.4),
    'fuel-tank-p': (5.0, TT, 66.6), 'fuel-tank-s': (-5.0, TT, 66.6), 'ballast-tank-p': (5.0, TT, 79.8), 'ballast-tank-s': (-5.0, TT, 79.8),
    'deep-tank-p': (1.0, TT, 92.4), 'deep-tank-s': (-1.0, TT, 92.4), 'fore-peak': (0.0, TT, 103.0), 'thruster-room': (0.0, TT, 99.4),
    'hold-stair': (7.0, TT, 47.6), 'er-platform': (0.0, S.PLATFORM, 22.0),
    'uptake-s': (-6.4, _ramp(19.7), 19.7), 'er-vent': (-6.4, _ramp(30.8), 30.8), 'aux-vent': (-6.4, _ramp(42.6), 42.6),
    'hold-vent': (-6.4, _ramp(56.4), 56.4), 'fixed-ramp': (-5.7, _ramp(39.0), 39.0),
    'main-stair-p': (8.4, MD, 73.2), 'main-stair-s': (-8.4, MD, 73.2), 'er-entrance': (8.9, MD, 25.0), 'hold-stair-head': (8.9, MD, 49.0),
    'fore-store': (0.0, MD, 112.0),
    'aft-deck': (0.0, UD, 21.8), 'funnel-p': (6.6, UD, 19.7), 'funnel-s': (-6.6, UD, 19.7), 'ramp-cover': (-3.0, UD, 45.0),
    'stair-head-p': (8.2, UD, 84.8), 'stair-head-s': (-8.2, UD, 84.8), 'forecastle': (0.0, UD + 0.05, 107.0),
    'house-stair': (0.6, UD, 94.4), 'house-stair-boat': (0.6, S.BOAT_DECK, 94.4), 'house-stair-officers': (0.6, S.OFFICERS_DECK, 94.4),
    'officers-deck-aft': (4.4, S.OFFICERS_DECK, 85.0), 'wheelhouse-stair': (-2.5, S.OFFICERS_DECK, 97.55),
    'bridge-deck-open': (5.0, S.BRIDGE_DECK, 95.0),
}
# What stands in a room today, where it is more than bare steel.
FITTED = {
    'steering-gear': 'Fitted: the flat, both rudder stocks in their carriers, the tillers and their tie bar, a ram on each, two hydraulic power units, the hand pump, the emergency fire pump. The Rudder control works them.',
    'aft-passage': 'Fitted: the platform inside the engine room\'s door, the steps and the flat to the steering gear\'s door.',
    'engine-room': 'Bare, but for the intermediate shafts from the flanges that wait for the gearboxes, their plummer blocks and the stern tubes\' seals under the platform.',
    'er-platform': 'Fitted: floor plates on bearers and pillars, rails, the stairs down to the tank top. The rooms on it are bare.',
    'thruster-room': 'Bare, but for the tunnel and the thruster\'s motor standing on it.',
    'lower-hold': 'Bare steel. The stair in the port wing tank and a ladder to a flush hatch forward are its two ways on foot; the cargo lift\'s platform is its hatch cover.',
    'cargo-lift': 'The platform is built, raised: it is the hatch cover, flush with the deck. Its hoisting gear is not built, and it does not work yet.',
    'fixed-ramp': 'Built: the roadway on its girder and pillars, the guard along its open side. One walks up it to the upper deck. Its cover is not built: the opening stands open.',
    'ramp-cover': 'The opening and its rail. The hinged weathertight cover is not built yet.',
    'stern-ramp': 'Fitted (drawing JS3-304): the ramp, which raised is the stern door, on six hinges and two hydraulic cylinders hung from under the upper deck; eight end flaps; '
                  'a safety latch on each door post that needs no oil to hold it, ten hydraulic cleats and a seal. It is worked from the control stand beside the door, port side '
                  '(start a pump, then the lever), or by the Stern ramp control: the latches lift, the cleats let go, the leaf lowers, its flaps fold out. '
                  'Beside it on the bulwark the sternlight and two floodlights; beside the door, to starboard, the red and green signal for those who drive aboard.',
    'hydraulic-room': 'Fitted forward of its door: the stern ramp\'s power pack (a tank of 1,500 litres, two pumps of 37 kW, the cleats\' pump, cooler, filters, hand pump), its valve stand '
                      'on the inboard wall and its starter panel on the forward wall, whose two leaves open. The after half is kept for the cargo lift\'s power pack.',
    'switchboard-room': 'Bare, with the places marked where the main switchboard, its 440 V section and the two transformers are to stand: an outline on the floor, a sign, and the tagged '
                        'ends of the cables that are to be landed there. Nothing of them is installed.',
    'aux-engine-room': 'Bare, with the places of the three generating sets marked on the tank top: an outline, a sign, and the tagged end of each set\'s feeder. Nothing of them is installed.',
    'pilot-lobby-p': 'Fitted: the pilot door, a real door in her shell: frame, leaf, dogs, hinges. A tap opens it.',
    'pilot-lobby-s': 'Fitted: the pilot door, a real door in her shell: frame, leaf, dogs, hinges. A tap opens it.',
    'helideck': 'The deck on its girders and pillars, and its two stairs. Its marks, net, lights and foam monitors are not built yet.',
    'funnel-p': 'The casing, raked, in the line\'s teal with her J, and the heads of its three uptakes: the port main engine and two generators. The uptakes below, the louvres and the platform are not built yet.',
    'funnel-s': 'The casing, raked, in the line\'s teal with her J, and the heads of its three uptakes: the starboard main engine, a generator and the boiler. The uptakes below, the louvres and the platform are not built yet.',
    'drivers-lounge': "Bare steel, but for the owner's drinks machine, which stands against the front wall.",
    'boat-deck-p': 'Bare deck and its rail, with the gap where the boat is swung out. The lifeboat, its davits and the liferafts are not aboard yet.',
    'boat-deck-s': 'Bare deck and its rail, with the gap where the boat is swung out. The lifeboat, its davits and the liferafts are not aboard yet.',
    'wheelhouse': 'Fitted complete: her navigation bridge, designed aboard the first Chisum and landed whole: console, instruments, boards, both wings, every one a component of her register. Tap a fitting, or open Systems.',
    'compass-deck': 'Fitted: the mast with radar, lights and horns, the antennas, the searchlight and floodlights, the binnacle.',
    'eg-room': "Fitted complete, to the owner's drawing: the generator set on its skid, the exhaust, two air ducts with fire dampers, the day tank, the starting batteries, the control panel, the emergency switchboard, the weathertight door.",
    'forecastle': 'Bare deck within its bulwark, rising to the stem. The windlasses, the mooring gear and the foremast are not aboard yet; the anchors are, on her bows.',
}
BARE = 'Bare steel: decks, walls, doorways and windows, and a light fitting overhead. Her outfit comes section by section.'
OPEN_DECK = 'Open deck.'
SECTIONS = [
    dict(part='hull', section='Hull', date=BUILT, what='her hull at 124.8 m from her own lines: a raked, flared bow over a bulb, sheer forward, a transom stern; plating, frames, floors, seven watertight bulkheads, the tank top, keel, skeg and bilge keels, two shafts with their screws and rudders, the bow thruster, anchors, marks'),
    dict(part='machinery', section='The spaces below the main deck', date=BUILT, what='the steering gear, the shafting inboard, five watertight doors, the engine room platform, the ways between them, the lower hold'),
    dict(part='main', section='Decks, casings and houses', date=BUILT, what='every deck, the side casings, the fixed ramp, the cargo lift\'s platform, the house in four tiers, the helicopter deck, the funnels, as bare steel, from the general arrangement'),
    dict(part='main', section='Stern ramp and pilot doors', date=BUILT, what='the stern door, which lowers as a ramp of 11 m on six hinges and two hydraulic cylinders, with its end flaps, its two safety latches, its ten cleats and its seal; its power pack, valve stand and starter panel in the hydraulic pump room, the pipes from there to the stern, and its control stand beside the door (drawing JS3-304); the places of the main switchboard, the transformers and the three generating sets marked in the machinery spaces; a pilot door in her shell each side, with its working leaf'),
    dict(part='main', section='Stairs', date=BUILT, what=f'{len(S.STAIRS)} stairs to the yard\'s standard: two main stairs from the trailers to the house, the house\'s stair trunk, the stair into the wheelhouse, the engine room\'s and the lower hold\'s, the ladders outside'),
    dict(part='upper', section='Light fittings', date=BUILT, what='a marine fluorescent fitting on two hangers for every 9 to 12 m² of every enclosed space: her rooms light themselves'),
    dict(part='bridge', section='Navigation bridge', date=BUILT, what='the wheelhouse, its wings carried to her full breadth, the compass deck and mast, landed whole from the first Chisum'),
    dict(part='officers', section='Emergency generator room', date=BUILT, what="built to the owner's drawing, on the officers' deck abaft the house"),
]
NOTE = ("{name}, {length} m long: a ro-ro freight ferry, the ship of her general arrangement (revision {rev}), rebuilt at this size on {date} at the owner's word. "
        "Her hull, every deck and every room's walls are built, in bare steel, lit, and can be walked: the main trailer deck, the lower hold, the weather deck, "
        "the house in four tiers. Her stern ramp, her pilot doors, her navigation bridge, the emergency generator room and the drinks machine are fitted; "
        "the rest of her outfit, on deck first, comes section by section.")
MATERIAL_DEFAULTS = dict(shading='standard', metalness=0, roughness=1, transparent=False, opacity=1, emissive='#000000',
                         emissiveIntensity=1, side='front', textured=False, depthWrite=True, alphaTest=0, offset=None, atlas=0, clear=False, surface=None)


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


def weld(pos, nor, col, lo, hi, uv=None, key=None):
    """Triangle corners → shared vertices and indices, quantised as the file keeps them. With a key, each corner carries her
    maker's mark (mark.py): the last bit of its place across her breadth, 0.3 mm, is the bit the key gives for that place."""
    q = np.rint((pos - lo) / (hi - lo) * 65535).astype(np.uint16)
    if key:
        q = M.embed(q, key)
    n = np.clip(np.rint(nor * 127), -127, 127).astype(np.int8)
    cols = [q.astype(np.int32), n.astype(np.int32), col.astype(np.int32)]
    if uv is not None:
        cols.append(np.clip(np.rint(uv * 65535), 0, 65535).astype(np.int32))
    rows = np.concatenate(cols, axis=1)
    uniq, inverse = np.unique(rows, axis=0, return_inverse=True)
    tri = inverse.reshape(-1, 3).astype(np.uint32)
    tri = tri[(tri[:, 0] != tri[:, 1]) & (tri[:, 1] != tri[:, 2]) & (tri[:, 0] != tri[:, 2])]
    return uniq[:, :3].astype(np.uint16), uniq[:, 3:6].astype(np.int8), uniq[:, 6:9].astype(np.uint8), tri, (uniq[:, 9:11].astype(np.uint16) if uv is not None else None)


FINE_CELL = 2.0            # metres: fine work is kept by the cell of this grid it lies in, each cell in a box of its own


def cells(pos):
    """The triangles of a fine mesh (corner rows, three to a triangle) by the cell their middle lies in: a list of arrays of
    triangle numbers. One fine look on one deck may be the lettering of a stand at her stern and of a panel a hundred
    metres forward: kept in one box they would be no finer than the ship is."""
    mid = pos.reshape(-1, 3, 3).mean(1)
    _, inverse = np.unique(np.floor(mid / FINE_CELL).astype(np.int64), axis=0, return_inverse=True)
    inverse = inverse.reshape(-1)
    return [np.nonzero(inverse == k)[0] for k in range(int(inverse.max()) + 1)] if len(inverse) else []


def waterline():
    """Her outline at the design waterline, port side, from the transom to the stem: (z, half breadth). The page lays the
    sea round it: inside her there is no sea, however far below the waterline a room lies."""
    end = L.stem_yard(L.above_keel(0.0))
    n = int(end / 0.4) + 1
    pts = [(L.Z(end * i / n), max(L.hull_x(0.0, L.Z(end * i / n)), 0.0)) for i in range(n)] + [(L.Z(end), 0.0)]
    return [[round(z, 3), round(x, 3)] for z, x in pts]


def spaces():
    """The rooms the page lists, by the viewer's part: each space of the general arrangement with its box in the ship's axes."""
    out = {g['id']: [] for g in GROUPS}
    for s in ga.SPACES:
        gid = PLAN_GROUP[s['plan']]
        floor, head = PLAN_LEVELS[s['plan']]
        floor = LEVEL_FLOOR.get(s['level'], floor)
        if s['level'] == 'helideck':
            head = floor + 2.2
        if s['id'].startswith('funnel-'):
            head = L.Y(ga.FUNNEL_TOP)
        if s['id'] == 'eg-room':
            lo, hi = eg_place.BOX
        else:
            (a, b), (x0, x1) = s['yard'], s['x']
            # a room is no wider than she is there
            hb = max(L.main_x(min(max(floor + 0.5, L.keel_y(L.Z(v)) + 0.3), L.UPPER), L.Z(v)) for v in (a, (a + b) / 2, b))
            x0, x1 = max(x0, -hb), min(x1, hb)
            lo, hi = [round(x0, 4), round(floor, 4), round(L.Z(a), 4)], [round(x1, 4), round(head, 4), round(L.Z(b), 4)]
        text = FITTED.get(s['id'], OPEN_DECK if s['kind'] == 'open' else BARE)
        if s['why']:
            text = s['why'] + '. ' + text
        rec = dict(id=s['id'], name=s['name'], text=text, why=ga.KINDS[s['kind']], min=lo, max=hi)
        if s['id'] in STAND:
            x, y, yard = STAND[s['id']]
            rec['stand'] = [x, round(y, 4), round(L.Z(yard), 4)]
        if s['id'] == 'eg-room':
            rec['stand'] = eg_place.STAND
        out[gid].append(rec)
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--part', action='append', required=True, help='a part file written by export_jmf.py (may be given more than once)')
    ap.add_argument('--out', default=DEFAULT)
    ap.add_argument('--report')
    ap.add_argument('--unmarked', action='store_true', help="without her maker's mark: for a machine that has no key. Not to be published (check.py refuses the file)")
    a = ap.parse_args()
    key = None if a.unmarked else M.key()

    parts = []
    for path in a.part:
        z = np.load(path)
        parts.append((json.loads(bytes(z['meta']).decode()), z))
    ids = [g['id'] for g in GROUPS]
    materials, look_index = [], {}

    def material_of(look):
        rec = dict(MATERIAL_DEFAULTS)
        rec.update(metalness=round(float(look['metalness']), 3), roughness=round(float(look['roughness']), 3), side=look.get('side', 'front'),
                   offset=[int(v) for v in look['offset']] if look.get('offset') else None)
        for name in ('transparent', 'opacity', 'depthWrite', 'shading', 'textured', 'atlas', 'emissive', 'emissiveIntensity', 'clear', 'surface', 'hidden'):
            if name in look:
                rec[name] = look[name]
        index = json.dumps(rec, sort_keys=True)
        if index not in look_index:
            materials.append(rec)
            look_index[index] = len(materials) - 1
        return look_index[index]

    fresh = []
    for meta, z in parts:
        for m in sorted(meta['meshes'], key=lambda m: m['key']):
            if m['group'] not in ids:
                raise SystemExit(f'the part file brings "{m["group"]}", which is not one of the viewer\'s parts')
            fresh.append(dict(group=m['group'], material=material_of(m['look']), name=m['material'], objects=m['objects'], mover=m.get('mover') or None, fine=bool(m.get('fine')),
                              pos=z[m['key'] + '|pos'].astype(np.float64), nor=z[m['key'] + '|nor'], col=z[m['key'] + '|col'],
                              uv=z[m['key'] + '|uv'].astype(np.float64) if m['key'] + '|uv' in z.files else None))
    lo = np.min([np.round(m['pos'].min(0) - 0.001, 4) for m in fresh], axis=0)
    hi = np.max([np.round(m['pos'].max(0) + 0.001, 4) for m in fresh], axis=0)

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

    def record(material, pos_q, nor, col, idx, uv=None, mover=None, box=None):
        wide = len(pos_q) > 65535
        rec = dict(material=material, vertices=int(len(pos_q)), triangles=int(len(idx)), wide=wide)
        if mover:
            rec['mover'] = mover
        if box is not None:             # fine work: its corners are numbers across this box, not across her bounds
            rec['box'] = dict(min=[float(v) for v in box[0]], max=[float(v) for v in box[1]])
        rec['pos'] = chunk(pos_q.astype('<u2'))
        rec['nor'] = chunk(nor.astype('i1'))
        rec['col'] = chunk(col.astype('u1'))
        if uv is not None:
            rec['uv'] = chunk(uv.astype('<u2'))
        rec['idx'] = chunk(idx.astype('<u4' if wide else '<u2'))
        rec['from'] = 'blender'
        return rec

    report = dict(added=[])
    rooms = spaces()
    groups = []
    for g in GROUPS:
        out = []
        for m in (f for f in fresh if f['group'] == g['id']):
            if not m['fine']:
                q, n, c, tri, uv = weld(m['pos'], m['nor'], m['col'], lo, hi, m['uv'], key)
                out.append(record(m['material'], q, n, c, tri, uv, mover=m['mover']))
                report['added'].append(dict(part=g['id'], material=m['name'], vertices=int(len(q)), triangles=int(len(tri)), objects=m['objects']))
                continue
            # Fine work: each cell's triangles in a box of their own, a little larger than they are (the mark is carried the same way:
            # the last bit of the number across the box's breadth, which is a few thousandths of a millimetre here).
            for which in cells(m['pos']):
                rows = (which[:, None] * 3 + np.arange(3)).reshape(-1)
                pos = m['pos'][rows]
                box = np.round(pos.min(0) - 0.0005, 4), np.round(pos.max(0) + 0.0005, 4)
                q, n, c, tri, uv = weld(pos, m['nor'][rows], m['col'][rows], box[0], box[1], m['uv'][rows] if m['uv'] is not None else None, key)
                out.append(record(m['material'], q, n, c, tri, uv, mover=m['mover'], box=box))
                report['added'].append(dict(part=g['id'], material=m['name'], vertices=int(len(q)), triangles=int(len(tri)), objects=m['objects'], fine=True))
        groups.append(dict(id=g['id'], name=g['name'], level=g['level'], explode=[0, g['lift'], 0], spaces=rooms[g['id']],
                           meshes=sorted(out, key=lambda r: (r['material'], r.get('mover', '')))))

    sheet = json.load(open(os.path.join(HERE, 'atlas.json')))
    atlas = dict(file=sheet['file'], size=sheet['size'])
    # The register: where each component of hers is, joined with what it is, what feeds it and what it talks to.
    boxes = {}
    for meta, _ in parts:
        boxes.update(meta.get('components', {}))
    sys.path.insert(0, os.path.join(HERE, '..', 'systems'))
    import register
    systems = register.write(boxes, quiet=True)
    import stair_rules
    limit = lambda c: dict(pitch=c['pitch'], going=c['going'], width=c['width'], rise=list(c['rise']), flight=c['flight'])
    names = [o['name'] for f in fresh for o in f['objects']]
    header = dict(
        format='JMF1',
        ship=dict(name=S.SHIP_NAME, type=dict(ga.PARTICULARS)['Type'], length=L.LENGTH, beam=L.BEAM, depth=L.DEPTH, draft=L.DRAFT,
                  # where the bridge stands (its own measures are the first Chisum's: bridge_place.py), and where a walk begins
                  bridge=dict(shift=BP.SHIFT, deck=round(BP.DECK, 4), top=round(S.COMPASS_DECK, 4), wing=BP.WING),
                  start=dict(deck='main', space='vehicle-deck'), decks={k: round(L.Y(v), 4) for k, v in ga.DECKS.items()},
                  displacement=ga.DISPLACEMENT, arrangement=ga.REVISION, built=SECTIONS, waterline=waterline(),
                  note=NOTE.format(name=S.SHIP_NAME, length=L.LENGTH, rev=ga.REVISION, date=BUILT)),
        axes='x to port, y up from the design waterline, z forward from amidships; metres',
        # Whose she is. The notice, and which mark her corners carry (mark.py; only the key's fingerprint is said). Her plating
        # also holds the studio's name and signs where the page never draws them (makers_mark.py).
        rights=dict(owner=M.OWNER, holder='Nils Johansson', year=2026, notice=M.NOTICE,
                    mark=dict(scheme=M.SCHEME, id=M.fingerprint(key)) if key else None),
        bounds=dict(min=[float(v) for v in lo], max=[float(v) for v in hi]),
        # (her own sheet, and the sheet of her cabins' pictures: cabin_pictures.py)
        atlas=atlas, atlases=[atlas] + [dict(file=c['file'], size=c['size']) for c in [json.load(open(os.path.join(HERE, 'cabin_pictures.json')))]],
        materials=materials,
        views=[dict(id='ship', name=S.SHIP_NAME, groups=groups)],
        source=dict(generator=parts[0][0]['generator'], blender=parts[0][0]['blender'], arrangement=f'ferry/blender/ga.py, revision {ga.REVISION}'),
        inputs=[dict(x, **{'from': 'blender'}) for meta, _ in parts for x in meta.get('inputs', [])],
        movers=[dict(x, **{'from': 'blender'}) for meta, _ in parts for x in meta.get('movers', [])],
        ways=[dict(x, **{'from': 'blender'}) for meta, _ in parts for x in meta.get('ways', [])],
        # Every doorway in her steel that has no leaf yet: where it is and which way one goes through it (the check that walks them)
        doorways=[x for meta, _ in parts for x in meta.get('doorways', [])],
        systems=dict(file='systems.json', components=len(systems['components'])),
        # Her stairs, as the yard's standard has them (spec.STAIRS): what each is, for the page and for the check that walks them.
        stairs=[dict(stair_rules.facts(st), className=S.STAIR_CLASS[st['cls']]['name'], limit=limit(S.STAIR_CLASS[st['cls']])) for st in S.STAIRS
                if any(n.startswith(f"Stair, {st['name']},") for n in names)],
    )
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
    print("her maker's mark: " + (f"every corner carries it (key fingerprint {M.fingerprint(key)})" if key else 'NONE: this file is not to be published'))
    print(f"{a.out}: {report['bytes']} bytes, {sum(report['triangles'].values())} triangles, {sum(len(g['spaces']) for g in groups)} rooms, "
          f"{len(header['stairs'])} stairs, {len(systems['components'])} components")
    for gid, n in report['triangles'].items():
        print(f'  {n:7d}  {gid}')
    sys.stdout.flush()


if __name__ == '__main__':
    main()
