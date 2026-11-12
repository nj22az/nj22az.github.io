"""
The demonstration quay for the yard's deck fittings (fittings.py): a flat steel deck, 60 m by 14 m, with a bulwark along its
starboard side and rails along its port side, and every fitting of the library standing on it as it would be fitted aboard:
on its seat, through the deck where it goes through, against the bulwark where it belongs.

    blender -b -P ferry/blender/build.py -- --only fittings_demo --part /tmp/chisum-f.npz --blend /tmp/chisum-f.blend
    python3 ferry/blender/zfight.py --part /tmp/chisum-f.npz
    python3 ferry/blender/afloat.py --part /tmp/chisum-f.npz --allow ferry/blender/afloat-known.json
    python3 ferry/blender/spans.py  --part /tmp/chisum-f.npz

It is not part of the ship (build.py does not list it): it is the library's test bed, as a quay is a ship's.
The deck's openings are cut from what each fitting asks for (`cuts`), so a fitting that goes through the deck is tried with
its hole, and the rails are left out where a fitting asks for clear space (`clear`), as the ship's builder is to do.
"""
import math
from mathutils import Vector
import shipyard
from shipyard import Part, srgb, tint, round_sides
import fittings as F
import fittings_kit as K

DECK = 10.0                         # the quay's deck over the water (the ship's y): a boat deck's height
HALF_B, HALF_L = 7.0, 30.0
PLATE, BULWARK_T, BULWARK_H = 0.012, 0.012, 1.10
GREEN, WHITE = srgb(0x55705c), srgb(0xf1efe7)
RAIL = srgb(0xe9e7df)
GROUP = 'passenger'

# Where each fitting stands: kind, x (to port), z (forward), heading, its name, options. The starboard bulwark's inner face is
# at x = STB; the port side is the open deck edge with rails. A fitting against the bulwark has its back to it: heading 90.
STB = -HALF_B + BULWARK_T
WALL = -4.0                         # a house side stands here, looking to port, from z = -27 to -6.5: what belongs on a bulkhead hangs on it
BW_END = 13.0                       # the bulwark runs from the after end to here; forward of it the starboard side is open, with rails
ROWS = [
    # the boat deck, forward: a station each side (the port boat is the rescue boat and lies uncovered), rafts abaft the port one
    dict(kind='lifeboat-station', x=HALF_B, z=22.0, name='LB1', side=1, height=DECK, rescue=True, number=1),
    dict(kind='lifeboat-station', x=-HALF_B, z=22.0, name='LB2', side=-1, height=DECK, number=2),
    dict(kind='liferaft', x=HALF_B - 0.62, z=15.4, heading=270, name='LR1'),
    dict(kind='liferaft', x=HALF_B - 0.62, z=13.4, heading=270, name='LR3'),
    # the mooring deck, amidships along the bulwark
    dict(kind='windlass', x=-2.2, z=7.5, name='WL1'),
    dict(kind='chain-stopper', x=-2.2, z=9.4, name='CS1'),
    dict(kind='mooring-winch', x=-2.6, z=-0.6, name='MW1'),
    dict(kind='capstan', x=1.6, z=-2.6, name='CP1'),
    dict(kind='bitts', x=STB + 0.75, z=4.2, name='B1'),
    dict(kind='bitts', x=STB + 0.75, z=-4.4, name='B2'),
    dict(kind='panama-chock', x=STB, z=2.2, heading=90, name='PC1'),
    dict(kind='panama-chock', x=STB, z=-2.4, heading=90, name='PC2'),
    dict(kind='roller-fairlead', x=STB + 0.80, z=-0.6, heading=90, name='RF1'),
    dict(kind='rope-reel', x=2.8, z=6.6, heading=90, name='RR1'),
    dict(kind='rope-coil', x=4.4, z=2.8, name='RC1'),
    # the vehicle deck's gear
    dict(kind='lashing-rack', x=WALL, z=-8.2, heading=90, name='LK1'),
    dict(kind='trailer-trestle', x=3.6, z=-9.4, name='TT1'),
    dict(kind='wheel-chocks', x=WALL, z=-10.6, heading=90, name='WC1'),
    # ventilators and pipes
    dict(kind='ventilator-mushroom', x=-2.4, z=-18.0, name='VM1', dia=0.6),
    dict(kind='ventilator-mushroom', x=-0.9, z=-18.0, name='VM2', dia=0.4, serves='GALLEY EXHAUST'),
    dict(kind='ventilator-gooseneck', x=0.3, z=-18.0, name='VG1'),
    dict(kind='air-pipe', x=1.2, z=-18.0, name='AP1'),
    dict(kind='sounding-pipe', x=1.9, z=-18.0, name='SP1'),
    # deck furniture and lights
    dict(kind='bench', x=-1.0, z=-23.5, name='BN1'),
    dict(kind='floodlight', x=HALF_B - 0.06, z=-22.0, heading=270, name='FL1'),
    dict(kind='foam-monitor', x=3.4, z=-24.0, name='FM1'),
    dict(kind='bulkhead-light', x=WALL, z=-22.0, heading=90, name='BL1', h=1.9),
    dict(kind='loudspeaker', x=WALL, z=-23.5, heading=90, name='LS1', h=2.1),
    dict(kind='waste-bin', x=HALF_B - 0.06, z=-25.5, heading=270, name='WB1'),
]
GRIDS = [dict(x0=-2.6, z0=-14.6, nx=5, nz=4, dx=1.4, dz=1.25, name='LP')]

_made = dict(inputs=[], movers=[])


def plate(part, outline, holes, depth, colour, colour2=None):
    """A plate of any outline with openings cut through it: its two faces and the edge of every opening, one solid. The
    outline lies in the plate's first face; `depth` carries it to the second."""
    d = Vector(depth)
    for shift, look in ((Vector((0, 0, 0)), -1), (d, 1)):
        st = len(part.f)
        part.polygon([tuple(Vector(q) + shift) for q in outline], colour if look < 0 else (colour2 or colour),
                     holes=[[tuple(Vector(q) + shift) for q in h] for h in holes])
        part.orient(st, tuple(d * look))
    for loop, inward in [(outline, False)] + [(h, True) for h in holes]:
        st = len(part.f)
        k = len(loop)
        base = len(part.v)
        for q in loop:
            part.vert(tuple(q))
        for q in loop:
            part.vert(tuple(Vector(q) + d))
        for i in range(k):
            j = (i + 1) % k
            part.face((base + i, base + j, base + k + j, base + k + i), colour2 or colour)
        mid = sum((Vector(q) for q in loop), Vector((0, 0, 0))) / k + d / 2
        part.orient(st, (lambda c, m=mid: m - c) if inward else (lambda c, m=mid: c - m))


def build():
    shipyard.RUNS.clear()
    _made['inputs'], _made['movers'], _made['rows'] = [], [], {}
    parts, cuts, clears = [], [], []
    missing = []
    for row in ROWS:
        row = dict(row)
        kind = row.pop('kind')
        if kind not in F.FITTINGS:
            missing.append(kind)
            continue
        at = (row.pop('x'), DECK + row.pop('y', 0.0), row.pop('z'))
        got = F.build(kind, at, heading=row.pop('heading', 0), group=GROUP, name=row.pop('name', None), **row)
        parts += got['parts']
        _made['inputs'] += got['inputs']
        _made['movers'] += got['movers']
        cuts += got['cuts']
        if got['clear']:
            clears.append(got['clear'])
        tris = sum(max(1, len(f) - 2) for p in got['parts'] for f in p.f)
        _made['rows'].setdefault(kind, dict(known_by=got['parts_known_by'], size=F.FITTINGS[kind]['size'], note=F.FITTINGS[kind]['note'], triangles=tris,
                                            inputs=[i['id'] for i in got['inputs']], movers=len(got['movers']), cuts=len(got['cuts'])))
        print(f"  {kind}: {len(got['parts'])} parts, {tris} triangles, {len(got['movers'])} motions, {len(got['cuts'])} cuts")
    if hasattr(F, 'lashing_grid'):
        for g in GRIDS:
            got = F.lashing_grid((g['x0'], DECK, g['z0']), g['nx'], g['nz'], g['dx'], g['dz'], group=GROUP, name=g['name'])
            parts += got['parts']
            cuts += got['cuts']
            print(f"  lashing grid: {len(got['parts'])} parts, {sum(len(p.f) for p in got['parts'])} faces, {len(got['cuts'])} cuts")
    if missing:
        print('  not in the library yet:', ', '.join(sorted(set(missing))))

    # ---- the deck: one plate, with every opening the fittings ask for cut through it
    deck = Part('Demonstration quay, deck', 'Deck paint')
    deck.group = GROUP
    holes = []
    for c in cuts:
        if c['kind'] != 'deck':
            continue
        if 'round' in c:
            (cx, _, cz), r = c['round']['centre'], c['round']['radius']
            n = round_sides(r)
            holes.append([(cx + r * math.cos(2 * math.pi * k / n), DECK, cz + r * math.sin(2 * math.pi * k / n)) for k in range(n)])
        else:
            holes.append([(q[0], DECK, q[2]) for q in c['outline']])
    plate(deck, [(-HALF_B, DECK, -HALF_L), (HALF_B, DECK, -HALF_L), (HALF_B, DECK, HALF_L), (-HALF_B, DECK, HALF_L)], holes, (0, -PLATE, 0), GREEN, tint(GREEN, 0.8))
    # ---- the starboard bulwark, from the after end to BW_END: a plate standing on the deck's edge with its rail bar and
    # stays, cut for each chock
    wall = Part('Demonstration quay, bulwark', 'Topside paint')
    stays = Part('Demonstration quay, bulwark stays', 'Topside paint')
    wall.group = stays.group = GROUP
    holes = [[(STB, q[1], q[2]) for q in c['outline']] for c in cuts if c['kind'] == 'bulwark']
    y0, y1 = DECK, DECK + BULWARK_H
    plate(wall, [(STB, y0, -HALF_L), (STB, y0, BW_END), (STB, y1, BW_END), (STB, y1, -HALF_L)], holes, (-BULWARK_T, 0, 0), WHITE)
    stays.block((-HALF_B - 0.03, y1, -HALF_L), (-HALF_B + 0.07, y1 + 0.03, BW_END), WHITE, r=0.008)          # the rail bar on its top
    busy = [(c['box'][0][2] - 0.25, c['box'][1][2] + 0.25) for c in cuts if c['kind'] == 'bulwark']
    z = -HALF_L + 0.75
    while z < BW_END:
        if not any(a < z < b for a, b in busy) and not any(lo[0] < STB + 0.3 and lo[2] - 0.1 < z < hi[2] + 0.1 and lo[1] < DECK + 0.9 for lo, hi in clears):
            K.prism(stays, [(STB, y0, z - 0.005), (STB + 0.28, y0, z - 0.005), (STB + 0.06, y1 - 0.04, z - 0.005), (STB, y1 - 0.04, z - 0.005)], (0, 0, 0.010), WHITE)
        z += 1.5
    # ---- a length of house side, for what is fastened to a bulkhead
    house = Part('Demonstration quay, house side', 'Topside paint')
    house.group = GROUP
    house.box((WALL - 0.012, DECK, -27.0), (WALL, DECK + 2.5, -6.5), WHITE)
    for zz in [-26.5 + 2.0 * i for i in range(11)]:
        house.box((WALL - 0.112, DECK, zz - 0.005), (WALL - 0.012, DECK + 2.5, zz + 0.005), tint(WHITE, 0.95))      # its stiffeners, on the far side
    # ---- three-course rails on stanchions along the open sides, left out where a fitting wants the side clear
    rails = Part('Demonstration quay, rails', 'Topside paint')
    rails.group = GROUP

    def rail(xr, za, zb):
        gaps = sorted((lo[2] - 0.02, hi[2] + 0.02) for lo, hi in clears if hi[0] > xr - 0.03 and lo[0] < xr + 0.03 and lo[1] < DECK + 1.0)
        runs, a = [], za
        for g0, g1 in gaps:
            if g0 > a + 0.4:
                runs.append((a, min(g0, zb)))
            a = max(a, g1)
        if zb > a + 0.4:
            runs.append((a, zb))
        for a, b in runs:
            n = max(1, int(round((b - a) / 1.5)))
            for h, rad in ((1.0, 0.019), (0.62, 0.012), (0.30, 0.012)):
                rails.tube((xr, DECK + h, a), (xr, DECK + h, b), rad, colour=RAIL)
            for i in range(n + 1):
                zz = a + (b - a) * i / n
                rails.tube((xr, DECK, zz), (xr, DECK + 1.0, zz), 0.0135, colour=RAIL)
    rail(HALF_B - 0.06, -HALF_L + 0.05, HALF_L - 0.05)
    rail(-HALF_B + 0.06, BW_END + 0.05, HALF_L - 0.05)
    out = parts + [deck, wall, stays, rails, house]
    named = {p.mover for p in out if p.mover}
    defined = {m['id'] for m in _made['movers']}
    if named != defined:
        raise SystemExit(f'moving parts and their motions do not agree: {sorted(named ^ defined)}')
    ids = [i['id'] for i in _made['inputs']]
    if len(ids) != len(set(ids)):
        raise SystemExit('two inputs share a name')
    import json
    json.dump(_made['rows'], open('/tmp/chisum-f-rows.json', 'w'), indent=1)
    print(f"  demonstration quay: {len(out)} parts, {len(_made['inputs'])} inputs, {len(_made['movers'])} motions, {len(cuts)} openings cut")
    return out


def motion():
    return _made['inputs'], _made['movers']
