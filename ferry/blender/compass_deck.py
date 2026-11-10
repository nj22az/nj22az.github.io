"""
The compass deck: the roof of the bridge house, her mast and what the mast carries.

Section 2 of her own build, first slice. The roof is the viewer's part `top`; it takes the place of the Minato Maru's
(1,164 triangles: a slab, a rail, a mast, a few boxes) as the hull took the place of hers. Its positions are the other
ship's, so the ladder that comes up to it (hull_fittings.ladders), the bridge deck's rooms under it and the walker on it
still fit; what is on it follows M/V Ranger III's pilot-house roof (HAER MI-432): radar, searchlight, masthead and anchor
lights, VHF antennas and vent heads over the spaces below.

Drawn in the ship's axes (lines.py). The roof's top is at spec.COMPASS_DECK['deck'], and is the floor the walker stands on.
"""
from math import pi, cos, sin, ceil, hypot, radians
from mathutils import Vector
import lines as L
import spec as S
from shipyard import Part, srgb, tint
from hull_fittings import _cyl, _revolve

C, M = S.COMPASS_DECK, S.MAST
Z = L.Z
DECK = C['deck']
WHITE, GREY, DARK = srgb(S.WHITE), srgb(S.LIGHT_GREY), srgb(S.DARK_GREY)
STEEL, BRONZE, ZINC = srgb(S.STEEL), srgb(S.BRONZE), srgb(S.ZINC)
ROOF = srgb(S.ROOF_DECK)
LENS = srgb(0xdfe6e1)


def _loop(x0, x1, z0, z1, r, n=6):
    """A rounded rectangle in plan, as (x, z) points counter-clockwise (x to port, z forward), beginning on the port side."""
    pts = []
    for cx, cz, a0 in ((x1 - r, z1 - r, 0), (x0 + r, z1 - r, 90), (x0 + r, z0 + r, 180), (x1 - r, z0 + r, 270)):
        for i in range(n + 1):
            a = radians(a0 + 90 * i / n)
            pts.append((cx + r * cos(a), cz + r * sin(a)))
    return pts


def _slab():
    """The roof: a slab 0.32 m deep with a rounded plan, painted white at the edge and under; its plating on top."""
    x = C['half']
    z0, z1 = Z(C['yards'][0]), Z(C['yards'][1])
    loop = _loop(-x, x, z0, z1, C['corner'])
    top = DECK - 0.006                                     # the plating lies 6 mm over the slab's top: its seams show it
    bottom = DECK - C['slab']
    slab = Part('Compass deck, slab', 'Topside paint')
    # The fascia, all round, looking out.
    rows = [[(px, bottom, pz) for px, pz in loop], [(px, top, pz) for px, pz in loop]]
    start = len(slab.f)
    slab.grid(rows, WHITE, close=True)
    zc = (z0 + z1) / 2
    slab.orient(start, lambda c: (c[0], 0.0, c[2] - zc))                   # away from the middle of the roof
    # Its underside, the deckhead of the bridge house, looking down; its top, looking up (the plating covers it).
    start = len(slab.f)
    slab.polygon([(px, bottom, pz) for px, pz in loop], tint(WHITE, 0.93))
    slab.orient(start, (0, -1, 0))
    start = len(slab.f)
    slab.polygon([(px, top, pz) for px, pz in loop], tint(WHITE, 0.6))
    slab.orient(start, (0, 1, 0))

    plating = Part('Compass deck, plating', 'Deck paint')
    start = len(plating.f)
    plating.polygon([(px, DECK, pz) for px, pz in _loop(-x + 0.03, x - 0.03, z0 + 0.03, z1 - 0.03, C['corner'] - 0.03)], ROOF)
    plating.orient(start, (0, 1, 0))
    # Plate seams: shallow dark lines, a plate 2.4 m by 1.2 m. Marks, so that they lie a hair in front of the plating.
    seams = Part('Compass deck, seams', 'Marking')
    seam = tint(ROOF, 0.55)
    span = z1 - z0 - 0.5
    for i in range(1, 6):
        sx = -x + 0.03 + i * (2 * x - 0.06) / 6
        seams.box((sx - 0.0015, DECK + 0.0005, z0 + C['corner']), (sx + 0.0015, DECK + 0.0035, z1 - C['corner']), seam)
    nz = int(span / 2.4)
    for j in range(1, nz + 1):
        sz = z0 + 0.25 + j * span / (nz + 1)
        seams.box((-x + C['corner'], DECK + 0.0005, sz - 0.0015), (x - C['corner'], DECK + 0.0035, sz + 0.0015), seam)
    return [slab, plating, seams]


def _path(x0, x1, z0, z1, r, gap_z, gap_w):
    """The rail's path round the roof as an open path: it starts at the forward end of the gap in the port side, goes
    forward, round the front, down the starboard side, round the aft end and up the port side to the gap's aft end."""
    loop = _loop(x0, x1, z0, z1, r)
    gf, ga = gap_z + gap_w / 2, gap_z - gap_w / 2
    path = [(x1, gf)] + loop + [(x1, ga)]
    return path


def _rails():
    rails = Part('Compass deck, rails', 'Topside paint', smooth=True, angle=40)
    x = C['half'] - C['rail_in']
    z0, z1 = Z(C['yards'][0]) + C['rail_in'], Z(C['yards'][1]) - C['rail_in']
    gate_z, gate_w = Z(C['gate'][0]), C['gate'][1]
    path = _path(-x, x, z0, z1, C['corner'] - C['rail_in'] + 0.12, gate_z, gate_w)
    # Three courses of tube along the path, and a stanchion about every 1.45 m with a foot plate.
    heights = (C['rail'], 0.62, 0.30)
    radii = (0.019, 0.012, 0.012)
    for h, r in zip(heights, radii):
        for (ax, az), (bx, bz) in zip(path, path[1:]):
            if hypot(bx - ax, bz - az) > 1e-4:
                _cyl(rails, (ax, DECK + h, az), (bx, DECK + h, bz), r, WHITE, sides=8)
    # Posts at even intervals along the path (arc length), the ends included.
    seg = [hypot(bx - ax, bz - az) for (ax, az), (bx, bz) in zip(path, path[1:])]
    total = sum(seg)
    n = int(ceil(total / C['post_every']))
    for i in range(n + 1):
        s = total * i / n
        k, run = 0, 0.0
        while k < len(seg) - 1 and run + seg[k] < s - 1e-9:
            run += seg[k]
            k += 1
        f = (s - run) / seg[k] if seg[k] else 0.0
        (ax, az), (bx, bz) = path[k], path[k + 1]
        px, pz = ax + (bx - ax) * f, az + (bz - az) * f
        _cyl(rails, (px, DECK + 0.012, pz), (px, DECK + C['rail'], pz), 0.0135, WHITE, sides=8)
        _cyl(rails, (px, DECK, pz), (px, DECK + 0.012, pz), 0.045, tint(WHITE, 0.9), sides=10)
    return [rails]


def _mast():
    """The mast, its platform, the radar and the lights."""
    mz = Z(M['yard'])
    mast = Part('Compass deck, mast and fittings', 'Topside paint', smooth=True, angle=40)
    steel = Part('Compass deck, mast, steel fittings', 'Shaft steel', smooth=True, angle=40)
    lens = Part('Compass deck, lamp glasses', 'Lens', smooth=True, angle=50)
    dark = Part('Compass deck, dark fittings', 'Machinery paint', smooth=True, angle=40)
    top = M['top']

    # ---- The mast: a tube 0.22 m through at the foot, 0.12 m at the head, on a foot plate with six gussets.
    _cyl(mast, (0, DECK, mz), (0, top - 0.14, mz), 0.11, WHITE, sides=18, r2=0.06)
    _cyl(mast, (0, DECK, mz), (0, DECK + 0.014, mz), 0.26, tint(WHITE, 0.9), sides=24)
    for k in range(6):
        a = 2 * pi * k / 6
        base = (0.11 * cos(a), DECK + 0.014, mz + 0.11 * sin(a))
        tip = (0.2 * cos(a), DECK + 0.014, mz + 0.2 * sin(a))
        up = (0.11 * cos(a), DECK + 0.34, mz + 0.11 * sin(a))
        _cyl(mast, base, up, 0.012, WHITE, sides=6)
        _cyl(mast, tip, up, 0.009, WHITE, sides=6)
    for h in (DECK + 1.3, M['platform'] - 0.2):                         # collars where the mast's lengths meet
        _cyl(mast, (0, h, mz), (0, h + 0.05, mz), 0.125 if h < 12.8 else 0.1, tint(WHITE, 0.92), sides=18)

    # ---- The yardarm for flags, 2.8 m, on a collar, with a halyard block at each end.
    _cyl(steel, (-1.4, M['yardarm'], mz), (1.4, M['yardarm'], mz), 0.02, ZINC, sides=8)
    for sx in (-1, 1):
        _cyl(steel, (sx * 1.4, M['yardarm'] - 0.05, mz), (sx * 1.4, M['yardarm'] + 0.05, mz), 0.03, ZINC, sides=8)
    # ---- The radar platform: a grating 1.3 m by 1.0 m on two brackets, with a toe plate and four posts.
    pf = Part('Compass deck, mast platform', 'Floor plate')
    y = M['platform']
    x0, x1, z0, z1 = -0.65, 0.65, mz - 0.5, mz + 0.5
    start = len(pf.f)
    pf.grid([[(x0, y, z0), (x1, y, z0)], [(x0, y, z1), (x1, y, z1)]], tint(srgb(S.FLOOR_PLATE), 1.0))
    pf.orient(start, (0, 1, 0))
    for sx in (-1, 1):
        mast.box((sx * 0.62 - 0.012, y - 0.09, z0 + 0.1), (sx * 0.62 + 0.012, y - 0.004, z1 - 0.1), tint(WHITE, 0.9))
        _cyl(mast, (sx * 0.1, y - 0.01, mz), (sx * 0.62, y - 0.06, mz), 0.012, WHITE, sides=6)      # a bracket from the mast
    mast.box((x0, y, z0 - 0.002), (x1, y + 0.09, z0 + 0.008), tint(WHITE, 0.95))                     # toe plates
    mast.box((x0, y, z1 - 0.008), (x1, y + 0.09, z1 + 0.002), tint(WHITE, 0.95))
    for px, pz in ((x0 + 0.02, z0 + 0.02), (x1 - 0.02, z0 + 0.02), (x0 + 0.02, z1 - 0.02), (x1 - 0.02, z1 - 0.02)):
        _cyl(mast, (px, y, pz), (px, y + 0.6, pz), 0.01, WHITE, sides=6)

    # ---- The radar: a turning unit on the platform and a 1.8 m slotted-waveguide array.
    ry = M['radar']
    _cyl(dark, (0, y, mz + 0.0), (0, ry - 0.02, mz), 0.12, tint(DARK, 1.1), sides=14, r2=0.09)         # the pedestal
    dark.box((-0.2, ry - 0.06, mz - 0.14), (0.2, ry + 0.07, mz + 0.14), tint(GREY, 0.8))             # the turning unit
    mast.box((-0.9, ry + 0.07, mz - 0.045), (0.9, ry + 0.17, mz + 0.045), tint(WHITE, 1.0))         # the array
    for sx in (-1, 1):
        mast.box((sx * 0.9 - (0.06 if sx < 0 else 0), ry + 0.065, mz - 0.06), (sx * 0.9 + (0.06 if sx > 0 else 0), ry + 0.175, mz + 0.06), tint(WHITE, 0.88))
    dark.box((-0.9, ry + 0.17, mz - 0.03), (0.9, ry + 0.185, mz + 0.03), DARK)                          # the radiating slot's cover

    # ---- Lights. The masthead light (white, 225° forward) stands on a bracket at the mast's front, above the radar;
    # the anchor light (white, all round) crowns the mast.
    my = M['masthead']
    _cyl(steel, (0, my - 0.02, mz + 0.06), (0, my - 0.02, mz + 0.17), 0.012, ZINC, sides=6)
    _cyl(dark, (0, my - 0.12, mz + 0.18), (0, my - 0.06, mz + 0.18), 0.085, tint(DARK, 1.3), sides=14)   # the housing
    _cyl(lens, (0, my - 0.06, mz + 0.18), (0, my + 0.05, mz + 0.18), 0.078, LENS, sides=14)              # the glass
    _cyl(dark, (0, my + 0.05, mz + 0.18), (0, my + 0.09, mz + 0.18), 0.088, tint(DARK, 1.3), sides=14)   # its cap
    dark.box((-0.12, my - 0.12, mz + 0.115), (0.12, my + 0.1, mz + 0.125), DARK)                       # the screen behind it
    _cyl(steel, (0, top - 0.14, mz), (0, top - 0.04, mz), 0.025, ZINC, sides=8)
    _cyl(lens, (0, top - 0.1, mz), (0, top, mz), 0.055, LENS, sides=12)                                # the anchor light
    # ---- Two air horns on a bracket at the front, a loudhailer and the signal lamp.
    hy = M['horns']
    _cyl(steel, (0, hy - 0.03, mz + 0.04), (0, hy - 0.03, mz + 0.22), 0.015, ZINC, sides=6)
    for sx in (-1, 1):
        _cyl(steel, (sx * 0.09, hy, mz + 0.16), (sx * 0.09, hy + 0.04, mz + 0.62), 0.022, ZINC, sides=10, r2=0.085)
    mast.box((-0.14, hy - 0.06, mz + 0.14), (0.14, hy + 0.02, mz + 0.2), tint(WHITE, 0.9))
    _cyl(steel, (0.5, y, mz + 0.3), (0.5, y + 0.14, mz + 0.34), 0.02, ZINC, sides=8)                       # its post
    _cyl(steel, (0.5, y + 0.14, mz + 0.3), (0.5, y + 0.3, mz + 0.56), 0.045, ZINC, sides=10, r2=0.13)      # the loudhailer
    return [mast, steel, lens, dark, pf]


def _antennas():
    """VHF, AIS and the satellite compass and GNSS domes aft of the mast."""
    mz = Z(M['yard'])
    ant = Part('Compass deck, antennas', 'Topside paint', smooth=True, angle=40)
    steel = Part('Compass deck, antenna mounts', 'Shaft steel', smooth=True, angle=40)
    dome = Part('Compass deck, domes', 'Lens', smooth=True, angle=60)
    for sx, h in ((-1.2, 3.0), (1.2, 3.0), (0.6, 1.4)):                                            # VHF, VHF, AIS
        px, pz = sx, mz - (1.2 if abs(sx) > 1 else 1.0)
        _cyl(steel, (px, DECK, pz), (px, DECK + 0.05, pz), 0.05, ZINC, sides=10)                   # the foot
        _cyl(ant, (px, DECK + 0.05, pz), (px, DECK + 0.4, pz), 0.032, WHITE, sides=10)             # the insulator
        _cyl(ant, (px, DECK + 0.4, pz), (px, DECK + h, pz), 0.012, WHITE, sides=6, r2=0.005)       # the whip
    for sx, r in ((0.8, 0.1), (-0.8, 0.17)):                                                       # GNSS, satellite compass
        pz = mz - 0.9
        _cyl(steel, (sx, DECK, pz), (sx, DECK + 0.18, pz), 0.04, ZINC, sides=10)
        _cyl(steel, (sx, DECK + 0.17, pz), (sx, DECK + 0.2, pz), r * 1.05, ZINC, sides=14)
        _revolve(dome, (sx, DECK + 0.2, pz), (0, 1, 0), [(0.0, r), (r * 0.4, r * 0.92), (r * 0.8, r * 0.6), (r * 1.0, 0.0)], LENS, sides=18)
    return [ant, steel, dome]


def _searchlight_and_floods():
    """The searchlight forward on the starboard side and a floodlight at each front corner, to light the bow."""
    sl = Part('Compass deck, searchlight and floodlights', 'Machinery paint', smooth=True, angle=40)
    lens = Part('Compass deck, light glasses', 'Lens', smooth=True, angle=50)
    steel = Part('Compass deck, light mounts', 'Shaft steel', smooth=True, angle=40)
    px, pz = -1.6, Z(22.0)
    _cyl(steel, (px, DECK, pz), (px, DECK + 0.52, pz), 0.07, ZINC, sides=12)
    _cyl(steel, (px, DECK, pz), (px, DECK + 0.02, pz), 0.14, ZINC, sides=14)
    for sx in (-1, 1):                                                                              # the yoke
        steel.box((px + sx * 0.19 - 0.012, DECK + 0.5, pz - 0.05), (px + sx * 0.19 + 0.012, DECK + 0.78, pz + 0.05), ZINC)
    steel.box((px - 0.2, DECK + 0.5, pz - 0.05), (px + 0.2, DECK + 0.54, pz + 0.05), ZINC)
    c0 = Vector((px, DECK + 0.72, pz - 0.15))
    d = Vector((0, sin(radians(8)), cos(radians(8))))
    c1 = c0 + d * 0.42
    _cyl(sl, tuple(c0), tuple(c1), 0.17, tint(GREY, 0.95), sides=20)                                # the drum
    _cyl(sl, tuple(c0 - d * 0.06), tuple(c0), 0.13, DARK, sides=16)                                 # the back
    _cyl(lens, tuple(c1 - d * 0.01), tuple(c1 + d * 0.025), 0.15, LENS, sides=20)                  # the glass
    _cyl(steel, tuple(c1 - d * 0.015), tuple(c1 + d * 0.015), 0.175, ZINC, sides=20)               # the rim
    for sx in (-1, 1):                                                                              # floodlights
        fx, fz = sx * 2.35, Z(C['yards'][1]) - 0.5
        _cyl(steel, (fx, DECK, fz), (fx, DECK + 0.42, fz), 0.03, ZINC, sides=8)
        a = Vector((fx, DECK + 0.46, fz))
        n = Vector((0, -sin(radians(22)), cos(radians(22))))
        sl.box((fx - 0.15, DECK + 0.42, fz - 0.07), (fx + 0.15, DECK + 0.62, fz + 0.1), tint(GREY, 0.8))
        _cyl(lens, tuple(a + Vector((0, 0.04, 0.1))), tuple(a + Vector((0, 0.04, 0.1)) + n * 0.02), 0.11, LENS, sides=14)
    return [sl, lens, steel]


def _binnacle():
    """The standard compass in its binnacle, forward on the centreline."""
    bz = Z(22.2)
    b = Part('Compass deck, binnacle', 'Topside paint', smooth=True, angle=40)
    brass = Part('Compass deck, binnacle brass', 'Bronze', smooth=True, angle=40)
    dome = Part('Compass deck, compass dome', 'Lens', smooth=True, angle=60)
    _cyl(b, (0, DECK, bz), (0, DECK + 0.9, bz), 0.22, WHITE, sides=20, r2=0.17)
    _cyl(b, (0, DECK, bz), (0, DECK + 0.04, bz), 0.3, tint(WHITE, 0.9), sides=20)
    _cyl(brass, (0, DECK + 0.9, bz), (0, DECK + 0.97, bz), 0.24, BRONZE, sides=20)
    _revolve(dome, (0, DECK + 0.97, bz), (0, 1, 0), [(0.0, 0.2), (0.07, 0.19), (0.14, 0.15), (0.2, 0.08), (0.23, 0.0)], LENS, sides=20)
    return [b, brass, dome]


def _vents():
    """Vent heads over the spaces below: the emergency generator room (an air intake and an exhaust), the galley's
    extract and the crew WC and shower's."""
    vents = Part('Compass deck, vent heads', 'Topside paint', smooth=True, angle=40)
    metal = Part('Compass deck, vent fittings', 'Shaft steel', smooth=True, angle=40)
    slats = Part('Compass deck, louvres', 'Machinery paint')
    # The generator room's air intake (a coaming 0.9 m by 0.5 m with a louvred front and a hood) at 7.7 m from the transom.
    ix, iz = 1.0, Z(7.7)
    vents.box((ix - 0.45, DECK, iz - 0.25), (ix + 0.45, DECK + 0.34, iz + 0.25), WHITE)
    vents.box((ix - 0.5, DECK + 0.34, iz - 0.3), (ix + 0.5, DECK + 0.4, iz + 0.3), tint(WHITE, 0.95))
    for k in range(7):
        y = DECK + 0.06 + k * 0.045
        slats.box((ix - 0.4, y, iz + 0.25), (ix + 0.4, y + 0.02, iz + 0.262), DARK)
        slats.box((ix - 0.4, y, iz - 0.262), (ix + 0.4, y + 0.02, iz - 0.25), DARK)
    # Its exhaust: a pipe 0.14 m through, 1.2 m high, with a flap on the top.
    ex, ez = 1.95, Z(7.45)
    _cyl(metal, (ex, DECK, ez), (ex, DECK + 1.2, ez), 0.07, STEEL, sides=14)
    _cyl(metal, (ex, DECK, ez), (ex, DECK + 0.015, ez), 0.12, STEEL, sides=14)
    _cyl(metal, (ex, DECK + 1.2, ez), (ex, DECK + 1.215, ez), 0.1, tint(STEEL, 0.8), sides=14)
    _cyl(metal, (ex, DECK + 1.1, ez), (ex, DECK + 1.2, ez), 0.075, tint(STEEL, 0.8), sides=14)
    # The galley's extract (to starboard, over the galley at 15.25 m): a cowl on a coaming.
    gx, gz = -1.73, Z(15.25)
    _cyl(vents, (gx, DECK, gz), (gx, DECK + 0.45, gz), 0.24, WHITE, sides=18)
    _cyl(vents, (gx, DECK + 0.45, gz), (gx, DECK + 0.62, gz), 0.36, tint(WHITE, 0.95), sides=18, r2=0.12)
    _cyl(metal, (gx, DECK + 0.62, gz), (gx, DECK + 0.7, gz), 0.12, STEEL, sides=14, r2=0.02)
    # The crew WC and shower's: a mushroom head (at 12.75 m).
    wx, wz = -1.73, Z(12.75)
    _cyl(vents, (wx, DECK, wz), (wx, DECK + 0.3, wz), 0.1, WHITE, sides=14)
    _cyl(vents, (wx, DECK + 0.3, wz), (wx, DECK + 0.4, wz), 0.2, tint(WHITE, 0.95), sides=16, r2=0.14)
    return [vents, metal, slats]


def build():
    parts = []
    for fn in (_slab, _rails, _mast, _antennas, _searchlight_and_floods, _binnacle, _vents):
        parts += fn()
    for p in parts:
        p.group = 'top'
    return parts
