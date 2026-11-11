"""
The shell: her plating outside in her paint, the same plating's inner face in primer, the thruster tunnel through the
forefoot, the transom with the stern door's opening, and the bulwarks of the open decks aft.

The shell is drawn from the lines (lines.py) in two parts, as they are: the lower body from the keel to the car deck's
edge, and the topsides from there to the upper deck. Each paint zone is its own sheet, so a paint line is a line and not
a blur, and each plate (a strake between two butts) takes the light a little differently from its neighbour. Every
vertex carries the normal the lines give it, so the plating is fair however it is cut into triangles.
"""
from math import pi, sin, cos
from mathutils import Vector
from mathutils.geometry import tessellate_polygon
import lines as L
import spec as S
from shipyard import Part, srgb, tint, plate_shade


def stations(end):
    """Where the shell is drawn, metres from the transom: every half frame at her ends, every frame where her section does not change."""
    out, yard = [], 0.0
    while yard < end - 1e-6:
        out.append(round(yard, 4))
        yard += S.STATION * (2 if S.STATION_MID[0] - 1e-6 <= yard < S.STATION_MID[1] - 1e-6 else 1)
    return out


# The lower body ends where the stem passes the car deck; its last station is a point. A station stands where the stem
# passes the boot top, so that the antifouling's edge runs level into the stem and ends on it.
BOOT_AT_STEM = round(L.stem_yard(L.above_keel(S.BOOT)), 4)
YARDS = sorted(set(stations(L.STEM_AT_CAR - 0.1) + [BOOT_AT_STEM])) + [L.STEM_AT_CAR - 0.08, L.STEM_AT_CAR]
ZS = [L.Z(y) for y in YARDS]
# The topsides run on to the stem head.
TOP_YARDS = YARDS[:-2] + [y for y in stations(L.LENGTH - 0.1) if y > L.STEM_AT_CAR - 0.25] + [L.LENGTH - 0.06, L.LENGTH]
TOP_ZS = [L.Z(y) for y in TOP_YARDS]
# Rows of plating in each paint zone of the lower body, keel to car deck, and where the strakes' seams fall among them.
# With these rows (set closer round the turn of the bilge: lines.girth_psis) the plating keeps within a few millimetres of
# her lines; the frames and floors stand 12 mm inside the lines, so they stay behind it (build.py measures it).
ZONES = (
    dict(id='bottom', rows=24, strakes=(0, 4, 8, 12, 16, 20, 24), colour=S.ANTIFOULING, spread=0.04),
    dict(id='topside', rows=8, strakes=(0, 4, 8), colour=S.WHITE, spread=0.02),
)
# The topsides' rows: the heights of spec.TOPSIDE_LEVELS, each in its paint.
TOP_ROWS = (S.WHITE, S.WHITE, S.WHITE, S.TEAL, S.WHITE)
PSI_SCALE = 4.0     # psi is stretched by this beside z when a hole is cut, so its triangles are well shaped


def zone_bounds(z):
    return (0.0, L.psi_at(S.BOOT, z), pi / 2)


def _plate_colour(zone, zone_index, side, yards=YARDS):
    base = srgb(zone['colour'])
    strakes = zone['strakes']

    def colour(i, j):
        strake = max(k for k, s in enumerate(strakes) if s <= j)
        key = zone_index * 10 + strake
        butt = int((yards[i] + 0.01 + 3.0 * (key % 3)) // S.STRAKE_BUTT)
        return tint(base, plate_shade(key + (50 if side < 0 else 0), butt, zone['spread']))
    return colour


def _area(part, f):
    p = [Vector(part.v[i]) for i in f]
    n = Vector((0, 0, 0))
    for a, b in zip(p, p[1:] + p[:1]):
        n += a.cross(b)
    return n.length / 2


def _emit(part, f, colour):
    """A face of the plating, where it is one: toward the stem a sheet's rows close on each other, and a four-cornered
    piece becomes three-cornered or nothing. No face without area is drawn."""
    kept = []
    for i in f:
        if not any((Vector(part.v[i]) - Vector(part.v[k])).length < 1e-6 for k in kept):
            kept.append(i)
    if len(kept) >= 3 and _area(part, kept) > 1e-9:
        part.face(tuple(kept), colour)
        return True
    return False


def _twin(part, twin, start, thickness=S.SHELL):
    """The inner face of the faces made since `start`: the same triangles, each corner moved the plate's thickness inward
    square to the plating, so the two faces lie parallel everywhere and one can never come through the other."""
    primer = srgb(S.PRIMER)
    inner_of = {}
    for f in part.f[start:]:
        for i in f:
            if i not in inner_of:
                p, n = part.v[i], part.n[i]
                inner_of[i] = twin.vert(tuple(p[a] - n[a] * thickness for a in range(3)), tuple(-c for c in n))
        twin.face(tuple(inner_of[i] for i in reversed(f)), primer)
    return inner_of


def _sheet(part, zs, psi_rows, colour, side, hole=None, twin=None):
    """
    One sheet of the lower body's plating on one side, with its inner face. Returns the points round the hole when one is
    cut: on the outer face, and on the inner face.
    """
    point, normal = L.shell_point, L.shell_normal
    ids = []
    for z, psis in zip(zs, psi_rows):
        row = []
        for p in psis:
            q, n = point(z, p), normal(z, p)
            row.append(part.vert((side * q[0], q[1], q[2]), (side * n[0], n[1], n[2])))
        ids.append(row)
    skip, block = set(), None
    if hole:
        z0, y0, r, margin = hole['z'], hole['y'], hole['r'], 0.10
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
            _emit(part, (a, d, c, b) if side > 0 else (a, b, c, d), colour(i, j))
    ring = None
    if hole:
        i0, i1, j0, j1 = block
        outer = ([(i, j0) for i in range(i0, i1)] + [(i1, j) for j in range(j0, j1)] +
                 [(i, j1) for i in range(i1, i0, -1)] + [(i0, j) for j in range(j1, j0, -1)])
        outer_ids = [ids[i][j] for i, j in outer]
        outer_2d = [Vector((zs[i], psi_rows[i][j] * PSI_SCALE, 0)) for i, j in outer]
        ring, ring_2d, count = [], [], hole.get('count', 44)
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
    inner_of = _twin(part, twin, start) if twin is not None else {}
    if ring is None:
        return None, None
    return [part.v[i] for i in ring], ([twin.v[inner_of[i]] for i in ring] if twin is not None else None)


def topside_rows(z):
    """The topsides' rows at z, foot to head: (x, y) on the port side. Each row keeps its height; forward of where the stem
    passes the car deck the rows below the stem end on it."""
    y0 = L.topside_foot(z)[1]
    return [(L.topside_x(max(y0, lv), z), max(y0, lv)) for lv in S.TOPSIDE_LEVELS]


def _open(yard_a, yard_b, row):
    """Whether the cell of the topsides between two stations, in a row, is one of her openings (spec)."""
    mid = (yard_a + yard_b) / 2
    m, d = S.MOORING_PORT, S.SHELL_DOOR
    if row == 1 and m['yard'][0] < mid < m['yard'][1]:
        return True
    return row in (0, 1) and d['yard'][0] < mid < d['yard'][1]


def _topsides(top, inner, side):
    """The topsides on one side, with their inner face and the plating's edge round each opening."""
    ids = []
    for z in TOP_ZS:
        n = L.topside_normal(z)
        ids.append([top.vert((side * x, y, z), (side * n[0], n[1], n[2])) for x, y in topside_rows(z)])
    start = len(top.f)
    cells = {}
    for i in range(len(TOP_ZS) - 1):
        for j, paint in enumerate(TOP_ROWS):
            if _open(TOP_YARDS[i], TOP_YARDS[i + 1], j):
                continue
            a, b, c, d = ids[i][j], ids[i + 1][j], ids[i + 1][j + 1], ids[i][j + 1]
            key = 20 + j + (50 if side < 0 else 0)
            butt = int((TOP_YARDS[i] + 0.01 + 3.0 * (j % 3)) // S.STRAKE_BUTT)
            if _emit(top, (a, d, c, b) if side > 0 else (a, b, c, d), tint(srgb(paint), plate_shade(key, butt, 0.02 if paint != S.TEAL else 0.03))):
                cells[(i, j)] = True
    top.orient(start, None)
    inner_of = _twin(top, inner, start)
    # The plating's own edge round each opening: between its two faces.
    edge = tint(srgb(S.WHITE), 0.9)
    for i in range(len(TOP_ZS) - 1):
        for j in range(len(TOP_ROWS)):
            if not _open(TOP_YARDS[i], TOP_YARDS[i + 1], j):
                continue
            for (a, b), (ni, nj) in (((ids[i][j], ids[i][j + 1]), (i - 1, j)), ((ids[i + 1][j + 1], ids[i + 1][j]), (i + 1, j)),
                                     ((ids[i + 1][j], ids[i][j]), (i, j - 1)), ((ids[i][j + 1], ids[i + 1][j + 1]), (i, j + 1))):
                if (ni, nj) in cells and a in inner_of and b in inner_of:
                    first = len(top.f)
                    top.face((a, b, inner_of_point(top, inner, inner_of[b]), inner_of_point(top, inner, inner_of[a])), edge)
                    mid = ((TOP_ZS[i] + TOP_ZS[i + 1]) / 2, (S.TOPSIDE_LEVELS[j] + S.TOPSIDE_LEVELS[j + 1]) / 2)
                    top.orient(first, lambda c, mid=mid: (0, mid[1] - c[1], mid[0] - c[2]))


def inner_of_point(top, inner, k):
    """A vertex of the outer part at the place of vertex k of the inner face (the edge of an opening joins the two)."""
    return top.vert(inner.v[k], None)


def _end_plate(parts, z, facing, inner=False):
    """The flat plate that closes the lower body at the transom, up to the car deck."""
    bounds = zone_bounds(z)
    for k, zone in enumerate(ZONES):
        psis = L.girth_psis(z, zone['rows'], bounds[k], bounds[k + 1])
        pts = [L.inside(z, p, S.SHELL) if inner else L.section_psi(z, p) for p in psis]
        part = parts['inner'] if inner else parts[zone['id']]
        start = len(part.f)
        zz = z - facing * S.SHELL if inner else z
        colour = srgb(S.PRIMER) if inner else tint(srgb(zone['colour']), plate_shade(90 + k, int(facing), zone['spread']))
        part.grid([[(q[0], q[1], zz), (-q[0], q[1], zz)] for q in pts], colour)
        part.orient(start, (0, 0, -facing if inner else facing))


# The stern door: its opening in the transom over the car deck (ga.py: 6.4 m wide, 4.3 m clear), which the ramp closes.
STERN_DOOR = dict(half=3.2, height=4.3)


def _transom_above(top, inner):
    """The transom over the car deck: plating each side of the stern door's opening and across its head, in the topsides' paint."""
    z = -L.HALF
    hb = L.upper_breadth(z)
    d = STERN_DOOR
    head = L.CAR + d['height']
    white, teal = srgb(S.WHITE), srgb(S.TEAL)

    def plate(x0, x1, y0, y1, colour):
        for part, zz, look in ((top, z, -1), (inner, z + S.SHELL, 1)):
            start = len(part.f)
            part.grid([[(x0, y0, zz), (x1, y0, zz)], [(x0, y1, zz), (x1, y1, zz)]], colour if part is top else srgb(S.PRIMER))
            part.orient(start, (0, 0, look))

    levels = S.TOPSIDE_LEVELS
    for side in (1, -1):
        for j, paint in enumerate(TOP_ROWS):
            x0, x1 = sorted((side * d['half'], side * hb))
            plate(x0, x1, levels[j], levels[j + 1], tint(srgb(paint), 0.985))
    # over the door: the band and the white above it
    plate(-d['half'], d['half'], head, max(head, levels[-2]), tint(teal, 0.985))
    plate(-d['half'], d['half'], max(head, levels[-2]), levels[-1], tint(white, 0.985))
    # the plating's edge round the opening
    edge = tint(white, 0.9)
    for x in (-d['half'], d['half']):
        start = len(top.f)
        top.grid([[(x, L.CAR, z), (x, L.CAR, z + S.SHELL)], [(x, head, z), (x, head, z + S.SHELL)]], edge)
        top.orient(start, (-x, 0, 0))
    start = len(top.f)
    top.grid([[(-d['half'], head, z), (d['half'], head, z)], [(-d['half'], head, z + S.SHELL), (d['half'], head, z + S.SHELL)]], edge)
    top.orient(start, (0, -1, 0))


def build():
    bottom = Part('Shell plating, bottom', 'Antifouling', smooth=True)
    top = Part('Shell plating, topsides', 'Topside paint', smooth=True)
    inner = Part('Shell plating, inner face', 'Primer', smooth=True)
    tunnel = Part('Thruster tunnel', 'Antifouling', smooth=True, angle=50)
    tunnel_out = Part('Thruster tunnel, in the thruster room', 'Primer', smooth=True, angle=50)
    bulwark = Part('Bulwarks', 'Topside plate', smooth=True)
    parts = dict(bottom=bottom, topside=top, inner=inner)

    hole = dict(z=L.Z(S.THRUSTER['yard']), y=S.THRUSTER['y'], r=S.THRUSTER['radius'])
    bounds = [zone_bounds(z) for z in ZS]
    rings, inner_rings = {}, {}
    for side in (1, -1):
        for k, zone in enumerate(ZONES):
            psi_rows = [L.girth_psis(z, zone['rows'], b[k], b[k + 1]) for z, b in zip(ZS, bounds)]
            ring, inner_ring = _sheet(parts[zone['id']], ZS, psi_rows, _plate_colour(zone, k, side), side, hole=hole if k == 0 else None, twin=inner)
            if ring:
                rings[side], inner_rings[side] = ring, inner_ring
        _topsides(top, inner, side)
        # The bulwark of the open decks aft stands upright over the upper deck's edge, from the transom to the passenger house.
        white = srgb(S.WHITE)
        for a, b in ((0.0, BULWARK_AFT[side]), (BULWARK_FWD, L.LENGTH)):
            yards = [yard for yard in TOP_YARDS if a - 1e-6 <= yard <= b + 1e-6]
            start = len(bulwark.f)
            rows, normals = [], []
            for yard in yards:
                z = L.Z(yard)
                hb, n = L.upper_breadth(z), L.bulwark_normal(z)
                rows.append([(side * hb, L.UPPER, z), (side * hb, L.UPPER + L.BULWARK, z)])
                normals.append([(side * n[0], n[1], n[2])] * 2)
            bulwark.grid(rows, lambda i, j: tint(white, plate_shade(31 + (50 if side < 0 else 0), int(yards[i] // S.STRAKE_BUTT), 0.02)), normals=normals)
            bulwark.orient(start, None)

    # The keel plate and, up the stem, the plate the stem bar is welded to: the strip between the two sides' plating, which
    # do not meet in a knife's edge (lines.STEM_HALF). Antifouled to the boot top, white above it.
    yards = sorted(set(stations(L.LENGTH - 0.1) + [BOOT_AT_STEM])) + [L.LENGTH]
    w = L.STEM_HALF
    rows, normals = [], []
    for i, yard in enumerate(yards):
        z = L.Z(yard)
        a, b = L.Z(max(0.0, yard - 0.05)), L.Z(min(L.LENGTH, yard + 0.05))
        dy, dz = min(L.UPPER, L.keel_y(b)) - min(L.UPPER, L.keel_y(a)), b - a
        m = (dy * dy + dz * dz) ** 0.5
        n = (0.0, -dz / m, dy / m)
        y = min(L.UPPER, L.keel_y(z))
        rows.append([(w, y, z), (-w, y, z)])
        normals.append([n, n])
    for part, test in ((bottom, lambda y: y < S.BOOT), (top, lambda y: y >= S.BOOT)):
        ids = [[part.vert(p, n) for p, n in zip(row, ns)] for row, ns in zip(rows, normals)]
        start = len(part.f)
        for i in range(len(rows) - 1):
            if test((rows[i][0][1] + rows[i + 1][0][1]) / 2):
                colour = srgb(S.ANTIFOULING) if part is bottom else srgb(S.WHITE)
                _emit(part, (ids[i][0], ids[i][1], ids[i + 1][1], ids[i + 1][0]), tint(colour, 0.97))
        part.orient(start, None)
        _twin(part, inner, start)

    # The transom: the lower body's end, the plating round the stern door over the car deck, the bulwark across the stern.
    _end_plate(parts, -L.HALF, -1)
    _end_plate(parts, -L.HALF, -1, inner=True)
    _transom_above(top, inner)
    z = -L.HALF
    hb = L.upper_breadth(z)
    start = len(bulwark.f)
    bulwark.grid([[(hb, L.UPPER, z), (-hb, L.UPPER, z)], [(hb, L.UPPER + L.BULWARK, z), (-hb, L.UPPER + L.BULWARK, z)]], tint(srgb(S.WHITE), 0.99))
    bulwark.orient(start, (0, 0, -1))

    # The tunnel: a tube from one opening to the other, antifouled inside, primed where it crosses the thruster room.
    axis = lambda c: (0, hole['y'] - c[1], hole['z'] - c[2])
    start = len(tunnel.f)
    red = tint(srgb(S.ANTIFOULING), 0.82)
    primer = srgb(S.PRIMER)
    mid = [(0.0, p[1], p[2]) for p in rings[1]]
    tunnel.grid([rings[1], mid, rings[-1]], red, close=True)
    tunnel.orient(start, axis)
    start = len(tunnel_out.f)
    mid = [(0.0, p[1], p[2]) for p in inner_rings[1]]
    tunnel_out.grid([inner_rings[1], mid, inner_rings[-1]], primer, close=True)
    tunnel_out.orient(start, lambda c: tuple(-a for a in axis(c)))
    return [bottom, top, bulwark, inner, tunnel, tunnel_out]


# The bulwarks: round the open decks aft, from the transom to where the passenger house stands at her side (the crew stair
# trunk at 20 m to port, the kiosk's store at 21 m to starboard: the house's side stands 4 mm inside the deck's edge, and
# the bulwark ends where it begins); and round the forecastle, from the lounge's front to the stem head.
BULWARK_AFT = {1: 20.0, -1: 21.0}
BULWARK_FWD = 54.0
