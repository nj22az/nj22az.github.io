#!/usr/bin/env python3
"""
Puts the Chisum together for the viewer: the parts built in Blender into ferry/data/ferry.bin.gz.

    python3 ferry/blender/assemble.py --part chisum.npz [--out ferry/data/ferry.bin.gz]

She is the 68 m ship of the general arrangement (ga.py), and everything in the file is her own: the tool starts from
nothing. (Until 11 November 2026 it started from the Minato Maru's drawing and replaced it section by section; that ship
went when the owner chose "Rebuild the Chisum at 68 m".)

  - every mesh of the part file goes into the viewer's part it was built for (hull, machinery, car, passenger, bridge, top);
  - the rooms the page lists are the spaces of ga.py, each with its place, what it is for, and where a walk begun there
    starts when the room itself is not entered (a tank, a funnel, a stair);
  - her register is written beside the model with the places of the same build (systems.json), and her stairs as the
    yard's standard has them.

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

DEFAULT = os.path.join(HERE, '..', 'data', 'ferry.bin.gz')
BUILT = '11 November 2026'

# ---- The viewer's parts, bottom to top: what each is called, what the page says of its level, how far it lifts when she is
# taken apart (each clear of the one under it).
GROUPS = [
    dict(id='hull', name='Hull', lift=0.0,
         level=f'{L.LENGTH:.1f} m long, {L.BEAM:.1f} m beam, {L.DEPTH:.1f} m to the car deck, {L.DRAFT:.1f} m draught'),
    dict(id='machinery', name='Machinery spaces', lift=10.0, level=f"Tank top {ga.DECKS['tank_top']:.1f} m above the keel, the flat at {ga.DECKS['flat']:.1f} m"),
    dict(id='car', name='Car deck', lift=13.5, level=f"{ga.DECKS['car']:.1f} m above the keel"),
    dict(id='passenger', name='Passenger deck', lift=17.0, level=f"{ga.DECKS['passenger']:.1f} m above the keel"),
    dict(id='bridge', name='Bridge deck', lift=20.5, level=f"{ga.DECKS['bridge']:.1f} m above the keel"),
    dict(id='top', name='Top deck and compass deck', lift=24.0,
         level=f"{ga.DECKS['top']:.1f} m above the keel, masthead light at {L.above_keel(BP.Y(S.MAST['masthead'])):.1f} m"),
]
PLAN_GROUP = dict(hold='machinery', car='car', passenger='passenger', bridge='bridge', top='top')
# The floor and the head of a plan's rooms, over the waterline.
PLAN_LEVELS = dict(hold=(S.TANK_TOP, S.CAR_DECK - 0.03), car=(S.CAR_DECK, S.PASSENGER_DECK - 0.012), passenger=(S.PASSENGER_DECK, S.BRIDGE_DECK - 0.012),
                   bridge=(S.BRIDGE_DECK, S.TOP_DECK - 0.012), top=(S.TOP_DECK, S.TOP_HOUSE))
# Rooms whose floor is not their plan's: the flats aft and forward below the car deck.
FLOORS = {'steering-gear': S.STEERING_FLAT, 'shaft-space': S.STEERING_FLAT, 'chain-lockers': S.FORE_STORE_FLAT}
# Spaces that are not rooms one goes into (a tank, a funnel, a stair's own length): a walk begun there starts at `stand`,
# beside it or at its landing, where one can walk on: (x, height over the waterline, metres from the transom).
STAND = {
    'fw-tank-p': (0.0, S.STEERING_FLAT, 7.2), 'fw-tank-s': (0.0, S.STEERING_FLAT, 6.4),
    'fuel-tank-p': (0.6, S.TANK_TOP, 37.5), 'fuel-tank-s': (-0.6, S.TANK_TOP, 37.5),
    'ballast-tank-p': (0.6, S.TANK_TOP, 46.5), 'ballast-tank-s': (-0.6, S.TANK_TOP, 46.5),
    'fore-peak': (0.0, S.FORE_STORE_FLAT, 61.3),
    'stair-aft-p': (6.0, S.CAR_DECK, 31.6), 'stair-aft-s': (-6.0, S.CAR_DECK, 31.6),
    'stair-fwd-p': (6.0, S.CAR_DECK, 38.3), 'stair-fwd-s': (-6.0, S.CAR_DECK, 38.3),
    'crew-stair': (6.0, S.CAR_DECK, 23.6), 'crew-stair-pax': (6.0, S.PASSENGER_DECK, 23.6), 'crew-stair-head': (5.6, S.BRIDGE_DECK, 23.6),
    'stair-aft-head-p': (6.0, S.PASSENGER_DECK, 24.6), 'stair-aft-head-s': (-6.0, S.PASSENGER_DECK, 24.6),
    'stair-fwd-head-p': (6.0, S.PASSENGER_DECK, 45.4), 'stair-fwd-head-s': (-6.0, S.PASSENGER_DECK, 45.4),
    'funnel-p': (4.4, S.PASSENGER_DECK, 20.5), 'funnel-s': (-4.4, S.PASSENGER_DECK, 20.5),
    'funnel-top-p': (2.4, S.BRIDGE_DECK, 16.6), 'funnel-top-s': (-2.4, S.BRIDGE_DECK, 16.6),
}
# The funnels stand on the bridge deck and are listed with it (the arrangement draws them on the top deck's plan, where
# they are seen from above).
REGROUP = {'funnel-top-p': 'bridge', 'funnel-top-s': 'bridge'}
# What stands in a room today, where it is more than bare steel.
FITTED = {
    'steering-gear': 'Fitted: the flat, both rudder stocks in their carriers, the tillers and their tie bar, a ram on each, two hydraulic power units, the hand pump, the emergency fire pump. The Rudder control works them.',
    'shaft-space': 'Fitted: the stern tubes and their seals, the couplings, the flat and its steps from the engine room\'s door to the steering gear\'s.',
    'engine-room': 'Bare, but for the intermediate shafts from the flanges that wait for the gearboxes, their plummer blocks and the bulkhead glands, the after flat and its steps, and the port platform with the crew stair.',
    'thruster-room': 'Bare, but for the tunnel and the thruster\'s motor standing on it.',
    'chain-lockers': 'The flat, the two chain lockers, and the ladder up to the flush hatch in the car deck.',
    'wheelhouse': 'Fitted complete: her navigation bridge, designed aboard the first Chisum and landed whole: console, instruments, boards, both wings, every one a component of her register. Tap a fitting, or open Systems.',
    'compass-deck': 'Fitted: the mast with radar, lights and horns, the antennas, the searchlight and floodlights, the binnacle.',
    'eg-room': "Fitted complete, to the owner's drawing: the generator set on its skid, the exhaust, two air ducts with fire dampers, the day tank, the starting batteries, the control panel, the emergency switchboard, the weathertight door.",
    'saloon': "Bare steel, but for the owner's drinks machine, which stands in the nook at its after end to port, against the toilets' wall.",
    'stern-ramp': 'Fitted: the ramp, which raised is the stern door, on its two hydraulic cylinders (the Stern ramp control lowers it to the quay). '
                  'Over it on the bulwark the sternlight and two floodlights that look down on the ramp; beside the door, to starboard, the red and green signal for those who drive aboard. '
                  'The hydraulic power unit, the securing and the seal are not built (drawing JS3-304).',
    'aft-mooring-deck': 'Bare steel and its bulwark. At the stern, on the bulwark\'s rail, the sternlight and the two floodlights of the ramp.',
}
BARE = 'Bare steel: decks, walls, doorways and windows. Her outfit comes section by section.'
SECTIONS = [
    dict(part='hull', section='Hull', date=BUILT, what='her hull at 68.4 m from her own lines: plating, frames, floors, eight watertight bulkheads, the tank top, keel, skeg and bilge keels, two shafts with their screws and rudders, the bow thruster, anchors, marks'),
    dict(part='machinery', section='The spaces below the car deck', date=BUILT, what='the steering gear, the shafting inboard, six watertight doors, the flats and the ways between them'),
    dict(part='car', section='Decks, casings and houses', date=BUILT, what='every deck, the side casings, the passenger house, the accommodation and the top deck\'s houses as bare steel, from the general arrangement'),
    dict(part='car', section='Stern ramp', date=BUILT, what='the stern door, which lowers as the ramp on two hydraulic cylinders; the sternlight, two floodlights and the drive-on signal over it (drawing JS3-304)'),
    dict(part='car', section='Stairs', date=BUILT, what='sixteen stairs to the yard\'s standard: four main stairs, the crew\'s stair trunk from the machinery flat to the bridge deck, the stair into the wheelhouse, the ladders outside and in the machinery spaces'),
    dict(part='bridge', section='Navigation bridge', date=BUILT, what='the wheelhouse, its wings carried to her side, the compass deck and mast, landed whole from the first Chisum'),
    dict(part='top', section='Emergency generator room', date=BUILT, what="built to the owner's drawing, on the top deck"),
]
NOTE = ("{name}, {length} m long: the ship of her general arrangement (revision {rev}), rebuilt at this size on {date} at the owner's word. "
        "Her hull, every deck and every room's walls are built, in bare steel, and can be walked. Her navigation bridge, the emergency generator room and "
        "the drinks machine are fitted; the rest of her outfit, the machinery first, comes section by section. Nothing of the first, 34.5 m Chisum's "
        "borrowed interiors is left.")
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


def spaces():
    """The rooms the page lists, by the viewer's part: each space of the general arrangement with its box in the ship's axes."""
    out = {g['id']: [] for g in GROUPS}
    for s in ga.SPACES:
        gid = REGROUP.get(s['id'], PLAN_GROUP[s['plan']])
        floor, head = PLAN_LEVELS[s['plan']]
        if s['level'] == 'flat':
            floor = S.FLAT
        floor = FLOORS.get(s['id'], floor)
        if s['id'].startswith('funnel-top'):
            floor, head = S.BRIDGE_DECK, L.Y(ga.FUNNEL_TOP)
        if s['id'] == 'eg-room':
            lo, hi = eg_place.BOX
        else:
            (a, b), (x0, x1) = s['yard'], s['x']
            # a room is no wider than she is there
            hb = max(L.hull_x(min(max(floor + 0.5, L.keel_y(L.Z(v)) + 0.3), L.UPPER), L.Z(v)) for v in (a, (a + b) / 2, b))
            x0, x1 = max(x0, -hb), min(x1, hb)
            lo, hi = [round(x0, 4), round(floor, 4), round(L.Z(a), 4)], [round(x1, 4), round(head, 4), round(L.Z(b), 4)]
        text = FITTED.get(s['id'], BARE)
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
    a = ap.parse_args()

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
        for key in ('transparent', 'opacity', 'depthWrite', 'shading', 'textured', 'atlas', 'emissive', 'emissiveIntensity', 'clear'):
            if key in look:
                rec[key] = look[key]
        key = json.dumps(rec, sort_keys=True)
        if key not in look_index:
            materials.append(rec)
            look_index[key] = len(materials) - 1
        return look_index[key]

    fresh = []
    for meta, z in parts:
        for m in sorted(meta['meshes'], key=lambda m: m['key']):
            if m['group'] not in ids:
                raise SystemExit(f'the part file brings "{m["group"]}", which is not one of the viewer\'s parts')
            fresh.append(dict(group=m['group'], material=material_of(m['look']), name=m['material'], objects=m['objects'], mover=m.get('mover') or None,
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

    def record(material, pos_q, nor, col, idx, uv=None, mover=None):
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
        rec['from'] = 'blender'
        return rec

    report = dict(added=[])
    rooms = spaces()
    groups = []
    for g in GROUPS:
        out = []
        for m in (f for f in fresh if f['group'] == g['id']):
            q, n, c, tri, uv = weld(m['pos'], m['nor'], m['col'], lo, hi, m['uv'])
            out.append(record(m['material'], q, n, c, tri, uv, mover=m['mover']))
            report['added'].append(dict(part=g['id'], material=m['name'], vertices=int(len(q)), triangles=int(len(tri)), objects=m['objects']))
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
                  displacement=ga.DISPLACEMENT, arrangement=ga.REVISION, built=SECTIONS,
                  note=NOTE.format(name=S.SHIP_NAME, length=L.LENGTH, rev=ga.REVISION, date=BUILT)),
        axes='x to port, y up from the design waterline, z forward from amidships; metres',
        bounds=dict(min=[float(v) for v in lo], max=[float(v) for v in hi]),
        atlas=atlas, atlases=[atlas],
        materials=materials,
        views=[dict(id='ship', name=S.SHIP_NAME, groups=groups)],
        source=dict(generator=parts[0][0]['generator'], blender=parts[0][0]['blender'], arrangement=f'ferry/blender/ga.py, revision {ga.REVISION}'),
        inputs=[dict(x, **{'from': 'blender'}) for meta, _ in parts for x in meta.get('inputs', [])],
        movers=[dict(x, **{'from': 'blender'}) for meta, _ in parts for x in meta.get('movers', [])],
        ways=[dict(x, **{'from': 'blender'}) for meta, _ in parts for x in meta.get('ways', [])],
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
    print(f"{a.out}: {report['bytes']} bytes, {sum(report['triangles'].values())} triangles, {sum(len(g['spaces']) for g in groups)} rooms, "
          f"{len(header['stairs'])} stairs, {len(systems['components'])} components")
    for gid, n in report['triangles'].items():
        print(f'  {n:7d}  {gid}')
    sys.stdout.flush()


if __name__ == '__main__':
    main()
