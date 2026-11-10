"""
The shell: her plating outside in her paint, the same plating's inner face in primer, and the thruster tunnel through
the forefoot.

The shell is drawn from the lines (lines.py) at every half frame. Each paint zone is its own sheet, so a paint line is
a line and not a blur, and each plate (a strake between two butts) takes the light a little differently from its
neighbour. Every vertex carries the normal the lines give it, so the plating is fair however it is cut into triangles.
"""
from math import pi, sin, cos
from mathutils import Vector
from mathutils.geometry import tessellate_polygon
import lines as L
import spec as S
from shipyard import Part, srgb, tint, plate_shade

ZS = [-L.HALF + S.STATION * i for i in range(int(round(L.LENGTH / S.STATION)) + 1)]
# Rows of plating in each paint zone, keel to deck edge, and where the strakes' seams fall among them. With these rows
# (set closer round the turn of the bilge: lines.girth_psis) the plating keeps within 3.4 mm of her lines everywhere;
# the frames and floors stand 12 mm inside the lines, so they stay behind it.
ZONES = (
    dict(id='bottom', rows=26, strakes=(0, 4, 9, 14, 18, 22, 26), colour=S.ANTIFOULING, spread=0.04),
    dict(id='topside', rows=12, strakes=(0, 6, 12), colour=S.WHITE, spread=0.02),
    dict(id='band', rows=2, strakes=(0, 2), colour=S.TEAL, spread=0.03),
    dict(id='sheer', rows=1, strakes=(0, 1), colour=S.WHITE, spread=0.02),
)
PSI_SCALE = 4.0     # psi is stretched by this beside z when a hole is cut, so its triangles are well shaped


def zone_bounds(z):
    top = L.deck_edge(z)
    return (0.0, L.psi_at(S.BOOT, z), L.psi_at(top - S.BAND, z), L.psi_at(top - S.BAND_TOP, z), pi / 2)


def _plate_colour(zone, zone_index, side):
    base = srgb(zone['colour'])
    strakes = zone['strakes']

    def colour(i, j):
        strake = max(k for k, s in enumerate(strakes) if s <= j)
        key = zone_index * 10 + strake
        butt = int((L.yard(ZS[i]) + 0.01 + 2.0 * (key % 3)) // S.STRAKE_BUTT)
        return tint(base, plate_shade(key + (50 if side < 0 else 0), butt, zone['spread']))
    return colour


def _sheet(part, zs, psi_rows, colour, point, normal, side, hole=None, twin=None):
    """
    One sheet of plating on one side. With `twin`, the plating's inner face is made with it: the same triangles, each
    corner moved the plate's thickness inward square to the plating, so the two faces lie parallel everywhere and one
    can never come through the other (two faces cut into triangles of their own do, where she twists).
    Returns the points round the hole when one is cut: on the outer face, and on the inner face.
    """
    ids = []
    for z, psis in zip(zs, psi_rows):
        row = []
        for p in psis:
            q, n = point(z, p), normal(z, p)
            row.append(part.vert((side * q[0], q[1], q[2]), (side * n[0], n[1], n[2])))
        ids.append(row)
    skip, block = set(), None
    if hole:
        z0, y0, r, margin = hole['z'], hole['y'], hole['r'], 0.08
        i0 = max(i for i, z in enumerate(zs) if z <= z0 - r - margin)
        i1 = min(i for i, z in enumerate(zs) if z >= z0 + r + margin)
        height = lambda i, j: point(zs[i], psi_rows[i][j])[1]
        cols = range(len(psi_rows[0]))
        low = [j for j in cols if all(height(i, j) <= y0 - r - margin for i in range(i0, i1 + 1))]
        high = [j for j in cols if all(height(i, j) >= y0 + r + margin for i in range(i0, i1 + 1))]
        j0, j1 = (max(low) if low else 0), min(high)
        block = (i0, i1, j0, j1)
        skip = {(i, j) for i in range(i0, i1) for j in range(j0, j1)}
    start = len(part.f)
    for i in range(len(zs) - 1):
        for j in range(len(psi_rows[0]) - 1):
            if (i, j) in skip:
                continue
            a, b, c, d = ids[i][j], ids[i + 1][j], ids[i + 1][j + 1], ids[i][j + 1]
            part.face((a, d, c, b) if side > 0 else (a, b, c, d), colour(i, j))
    ring = None
    if hole:
        i0, i1, j0, j1 = block
        outer = ([(i, j0) for i in range(i0, i1)] + [(i1, j) for j in range(j0, j1)] +
                 [(i, j1) for i in range(i1, i0, -1)] + [(i0, j) for j in range(j1, j0, -1)])
        outer_ids = [ids[i][j] for i, j in outer]
        outer_2d = [Vector((zs[i], psi_rows[i][j] * PSI_SCALE, 0)) for i, j in outer]
        ring, ring_2d, count = [], [], hole.get('count', 40)
        for k in range(count):
            a = 2 * pi * k / count
            z, y = hole['z'] + hole['r'] * cos(a), hole['y'] + hole['r'] * sin(a)
            p = L.psi_at(y, z)
            q, n = point(z, p), normal(z, p)
            ring.append(part.vert((side * q[0], q[1], q[2]), (side * n[0], n[1], n[2])))
            ring_2d.append(Vector((z, p * PSI_SCALE, 0)))
        every = outer_ids + ring
        cell = colour(i0, j0)
        for a, b, c in tessellate_polygon([outer_2d, ring_2d]):
            part.face((every[a], every[b], every[c]), cell)
    part.orient(start, None)
    inner_of = {}
    if twin is not None:
        primer = srgb(S.PRIMER)
        for f in part.f[start:]:
            for i in f:
                if i not in inner_of:
                    p, n = part.v[i], part.n[i]
                    inner_of[i] = twin.vert(tuple(p[a] - n[a] * S.SHELL for a in range(3)), tuple(-c for c in n))
            twin.face(tuple(inner_of[i] for i in reversed(f)), primer)
    if ring is None:
        return None, None
    return [part.v[i] for i in ring], ([twin.v[inner_of[i]] for i in ring] if twin is not None else None)


def _end_plate(parts, z, facing, y_max=None, inner=False):
    """The flat plate that closes an end: the transom whole, the bow up to the car deck, where the ramp closes her."""
    bounds = zone_bounds(z)
    for k, zone in enumerate(ZONES):
        lo, hi = bounds[k], bounds[k + 1]
        if y_max is not None:
            top = L.psi_at(y_max, z)
            if lo >= top:
                continue
            hi = min(hi, top)
        # The same points round the section as the plating that meets this plate, so the two share one edge.
        psis = L.girth_psis(z, zone['rows'], bounds[k], bounds[k + 1])
        psis = [p for p in psis if p < hi - 1e-9] + [hi] if hi < bounds[k + 1] else psis
        pts = [L.inside(z, p, S.SHELL) if inner else L.section_psi(z, p) for p in psis]
        part = parts['inner'] if inner else parts[zone['id']]
        start = len(part.f)
        zz = z - facing * S.SHELL if inner else z
        colour = srgb(S.PRIMER) if inner else tint(srgb(zone['colour']), plate_shade(90 + k, int(facing), zone['spread']))
        part.grid([[(q[0], q[1], zz), (-q[0], q[1], zz)] for q in pts], colour)
        part.orient(start, (0, 0, -facing if inner else facing))


def build():
    bottom = Part('Shell plating, bottom', 'Antifouling', smooth=True)
    top = Part('Shell plating, topsides', 'Topside paint', smooth=True)
    inner = Part('Shell plating, inner face', 'Primer', smooth=True)
    tunnel = Part('Thruster tunnel', 'Antifouling', smooth=True, angle=50)
    tunnel_out = Part('Thruster tunnel, in the thruster room', 'Primer', smooth=True, angle=50)
    bulwark = Part('Bulwarks', 'Topside plate', smooth=True)
    parts = dict(bottom=bottom, topside=top, band=top, sheer=top, inner=inner)

    hole = dict(z=L.Z(S.THRUSTER['yard']), y=S.THRUSTER['y'], r=S.THRUSTER['radius'])
    bounds = [zone_bounds(z) for z in ZS]
    rings, inner_rings = {}, {}
    for side in (1, -1):
        for k, zone in enumerate(ZONES):
            psi_rows = [L.girth_psis(z, zone['rows'], b[k], b[k + 1]) for z, b in zip(ZS, bounds)]
            ring, inner_ring = _sheet(parts[zone['id']], ZS, psi_rows, _plate_colour(zone, k, side), L.shell_point, L.shell_normal,
                                      side, hole=hole if k == 0 else None, twin=inner)
            if ring:
                rings[side], inner_rings[side] = ring, inner_ring
        # The bulwark stands upright over the deck edge; the port one is open at the gangway gate.
        white = _plate_colour(dict(colour=S.WHITE, strakes=(0, 1), spread=0.02), 5, side)
        runs = [ZS] if side < 0 else [[z for z in ZS if z <= S.GATE[0] + 1e-6], [z for z in ZS if z >= S.GATE[1] - 1e-6]]
        for zs in runs:
            start = len(bulwark.f)
            rows, normals = [], []
            for z in zs:
                hb, n = L.half_breadth(z), L.bulwark_normal(z)
                rows.append([(side * hb, L.deck_edge(z), z), (side * hb, L.bulwark_top(z), z)])
                normals.append([(side * n[0], n[1], n[2])] * 2)
            offset = ZS.index(zs[0])
            bulwark.grid(rows, lambda i, j: white(i + offset, 0), normals=normals)
            bulwark.orient(start, None)

    # The ends: the transom whole and its bulwark, the bow plated up to the car deck.
    _end_plate(parts, -L.HALF, -1)
    z = -L.HALF
    start = len(bulwark.f)
    hb = L.half_breadth(z)
    bulwark.grid([[(hb, L.deck_edge(z), z), (-hb, L.deck_edge(z), z)], [(hb, L.bulwark_top(z), z), (-hb, L.bulwark_top(z), z)]],
                 tint(srgb(S.WHITE), 0.99))
    bulwark.orient(start, (0, 0, -1))
    _end_plate(parts, L.HALF, 1, y_max=L.CAR - 0.02)

    # The inner faces of the two end plates (the inner face of the shell itself was made with each sheet).
    primer = srgb(S.PRIMER)
    _end_plate(parts, -L.HALF, -1, inner=True)
    _end_plate(parts, L.HALF, 1, y_max=L.CAR - 0.02, inner=True)

    # The tunnel: a tube from one opening to the other, antifouled inside, primed where it crosses the thruster room.
    axis = lambda c: (0, hole['y'] - c[1], hole['z'] - c[2])
    start = len(tunnel.f)
    red = tint(srgb(S.ANTIFOULING), 0.82)
    mid = [(0.0, p[1], p[2]) for p in rings[1]]
    tunnel.grid([rings[1], mid, rings[-1]], red, close=True)
    tunnel.orient(start, axis)
    start = len(tunnel_out.f)
    mid = [(0.0, p[1], p[2]) for p in inner_rings[1]]
    tunnel_out.grid([inner_rings[1], mid, inner_rings[-1]], primer, close=True)
    tunnel_out.orient(start, lambda c: tuple(-a for a in axis(c)))
    return [bottom, top, bulwark, inner, tunnel, tunnel_out]
