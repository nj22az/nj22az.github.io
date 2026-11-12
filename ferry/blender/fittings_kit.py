"""
The yard's library of deck fittings (12 November 2026): what stands on the Chisum's open decks, each drawn as it is
(JSY-STD-404), standing on what carries it (JSY-STD-402), with no two faces in one plane (JSY-STD-403).

The owner: "it needs life boats"; "there needs to be walkways on deck, helipad, etc"; "I dont want any part of the ship non
functional, I want every mechanical part to work"; "I am an old marine engineer and a ship-o- file, I want to be able to
explore the ship when we are done and feel happy and nostalgic".

This file knows nothing of the ship's arrangement. A fitting is a function that draws one thing about its own origin; `build`
places it aboard. The ship's own files say WHERE (spec.OUTFIT); this one says WHAT.

    Every fitting is drawn about its own origin, standing on the deck at y = 0:
    x to port, y up, z forward (the ship's axes); metres. Its FRONT faces +z unless said.

    build(kind, at, heading=0.0, group='passenger', name=None, **options) -> dict(parts, inputs, movers, cuts, clear, parts_known_by)

How a fitting is drawn (the rules it keeps by design):
  - its foot is a solid whose underside lies at y = 0 and meets the deck's top face to face; nothing else of it lies in that plane;
  - a bolt stands on what it fastens; a pipe ends in a flange; a cable ends in a gland; everything touches something of its own;
  - what goes through the deck (a hawse pipe, a spurling pipe, a lashing pot's cup) says so in `cuts`, and is drawn below the
    deck as far as it is seen through the hole;
  - a moving part is a Part of its own with `mover`; its motion is written in the fitting's own axes and carried aboard with it;
  - lettering is flat paint 2 mm off its surface in the look `Marking`; a mirrored fitting's lettering still reads from the left.

Sizes are real sizes. Where each comes from is said at the fitting: [R] the yard's reference files (ferry/yard/reference/),
[M] a maker's data sheet or a standard as the yard recalls it (not read tonight), [Y] the yard's own estimate.
"""
import math
from math import pi, sin, cos, tan, atan2, radians, degrees, hypot, sqrt
from mathutils import Vector, Matrix
import shipyard
from shipyard import Part, srgb, tint, lettering, round_sides

# ---------------------------------------------------------------------------------------------------------------------
# Looks. The yard's sheet of materials is shipyard.LOOKS; the deck fittings add these to it (added here, at import, so that
# shipyard.py itself is not edited by two sessions at once). None changes a look that was there.
for _name, _look, _surface in (
        ('Galvanised steel', dict(metalness=0.72, roughness=0.56), 'metal'),          # hot-dip zinc: dull, a little mottled
        ('Wire rope', dict(metalness=0.65, roughness=0.6), 'metal'),                  # galvanised wire, greased
        ('Chain', dict(metalness=0.35, roughness=0.72), 'matt'),                      # black-tarred stud-link cable, rust at the wearing places
        ('Rope', dict(metalness=0.0, roughness=0.95), 'matt'),                        # manila, polypropylene: the colour says which
        ('Canvas', dict(metalness=0.0, roughness=0.92), 'matt'),
        ('Rubber', dict(metalness=0.0, roughness=0.8), 'matt'),
        ('GRP gelcoat', dict(metalness=0.0, roughness=0.3), 'paint'),                 # a glass-fibre moulding's glossy skin
        ('Bare teak', dict(metalness=0.0, roughness=0.78), 'wood'),                   # scrubbed, unvarnished
        ('Cast iron', dict(metalness=0.3, roughness=0.66), 'paint'),                  # painted castings: bollards, chocks, bench ends
):
    shipyard.LOOKS.setdefault(_name, _look)
    shipyard.SURFACES.setdefault(_name, _surface)

LOOK_OF = dict(
    paint='Machinery paint', deck='Deck paint', white='Topside paint', steel='Shaft steel', galv='Galvanised steel', bronze='Bronze',
    wire='Wire rope', chain='Chain', rope='Rope', canvas='Canvas', rubber='Rubber', grp='GRP gelcoat', wood='Varnished wood', teak='Bare teak',
    cast='Cast iron', plastic='Plastic', lens='Lens', mark='Marking', pipes='Machinery paint', cables='Rubber', zinc='Zinc',
)

# ---- the yard's deck colours (the ship's own files name the same paints; a library carries its own tin of each)
BLACK, WHITE, CREAM = srgb(0x1b1e1f), srgb(0xf1efe7), srgb(0xe6e1d0)
GREY, DARK, LIGHT = srgb(0x7d8586), srgb(0x3a3f41), srgb(0xa9b0b0)
STEEL, GALV, ZINC = srgb(0x8a9092), srgb(0xa7adaf), srgb(0x9aa3a5)
RED, YELLOW, ORANGE, GREEN, BLUE = srgb(0xb8342a), srgb(0xe3c341), srgb(0xe2681f), srgb(0x3f6b52), srgb(0x2f5d8a)
BRASS, RUST, TAR = srgb(0xb08a4a), srgb(0x7a4a32), srgb(0x26282a)
MANILA, POLYPROP, WIREC = srgb(0xb89a62), srgb(0x2c62a8), srgb(0x6c7274)
TEAK, MAHOGANY, CANVAS = srgb(0xa98d68), srgb(0x6e3f26), srgb(0xd9d2bd)
DECK_GREEN, MACHINE_GREEN, BUFF = srgb(0x55705c), srgb(0x4f7a6a), srgb(0xd3b17a)
UP, FWD, PORT = (0.0, 1.0, 0.0), (0.0, 0.0, 1.0), (1.0, 0.0, 0.0)


# ---------------------------------------------------------------------------------------------------------------------
# The tools a fitting is drawn with, beside the yard's own (Part.block, tube, ball, ring, rod).
def V(p):
    return Vector(p)


def frame_of(axis, near=None):
    """Three directions at right angles: `axis`, and two across it (the first as near to `near` as it can be)."""
    a = Vector(axis).normalized()
    if near is not None:
        e1 = Vector(near) - a * Vector(near).dot(a)
        if e1.length > 1e-6:
            e1.normalize()
            return a, e1, a.cross(e1)
    e1 = a.orthogonal().normalized()
    return a, e1, a.cross(e1)


def lathe(p, origin, axis, profile, colour, sides=None, caps=(True, True)):
    """A turned thing: `profile` is (distance along the axis, radius) from one end to the other, the metal lying between it
    and the axis (it may turn back on itself: the underside of a mushroom, a bore). Its side is lit smooth and keeps a
    sharp edge where the profile turns a corner; its ends are flat. `colour` is one colour or a function of the step."""
    a, e1, e2 = frame_of(axis)
    o = Vector(origin)
    n = sides or round_sides(max(r for _, r in profile))
    s = 1.0 if profile[-1][0] >= profile[0][0] else -1.0
    spoke = [e1 * cos(2 * pi * k / n) + e2 * sin(2 * pi * k / n) for k in range(n)]
    base = len(p.v)
    for d, r in profile:
        for k in range(n):
            p.vert(tuple(o + a * d + spoke[k] * max(r, 1e-5)))
    for i in range(len(profile) - 1):
        (d0, r0), (d1, r1) = profile[i], profile[i + 1]
        if max(r0, r1) < 2e-5 or (abs(d1 - d0) < 1e-9 and abs(r1 - r0) < 1e-9):
            continue
        col = colour(i) if callable(colour) else colour
        for k in range(n):
            j = (k + 1) % n
            f = (base + i * n + k, base + i * n + j, base + (i + 1) * n + j, base + (i + 1) * n + k)
            # which way this step of the profile looks: to the left of the way the profile runs, the metal being on its right
            mid = (spoke[k] + spoke[j]).normalized()
            want = mid * (s * (d1 - d0)) - a * (s * (r1 - r0))
            pts = [Vector(p.v[v]) for v in f]
            nrm = Vector((0, 0, 0))
            for u, w in zip(pts, pts[1:] + pts[:1]):
                nrm += u.cross(w)
            p.face(f if nrm.dot(want) >= 0 else tuple(reversed(f)), col, smooth=True)
    for wanted, (d, r), way, i in ((caps[0], profile[0], -s, 0), (caps[1], profile[-1], s, len(profile) - 2)):
        if wanted and r > 1e-4:
            st = len(p.f)
            c = p.vert(tuple(o + a * d))
            ring = [p.vert(tuple(o + a * d + spoke[k] * r)) for k in range(n)]
            for k in range(n):
                p.face((c, ring[k], ring[(k + 1) % n]), colour(i) if callable(colour) else colour, smooth=False)
            p.orient(st, tuple(a * way))


def sweep(p, pts, r, colour, closed=False, sides=None, caps=(True, True), lay=0):
    """A rope, a wire, a hose or a bent bar: a round section carried along a line of points, mitred at each bend and lit
    smooth. Lighter than a ball at every bend, and it follows a curve of many points. With `lay` the colour is laid on in
    that many strands that wind round it, a little darker in the grooves: a three-strand rope."""
    pts = [Vector(q) for q in pts]
    if closed and (pts[0] - pts[-1]).length < 1e-6:
        pts = pts[:-1]
    n = sides or round_sides(r)
    m = len(pts)
    tang = []
    for i in range(m):
        a = pts[i - 1] if (i > 0 or closed) else pts[i]
        b = pts[(i + 1) % m] if (i < m - 1 or closed) else pts[i]
        t = (b - a)
        tang.append(t.normalized() if t.length > 1e-9 else Vector((0, 1, 0)))
    e1 = tang[0].orthogonal().normalized()
    rings, base = [], len(p.v)
    turn = 0.0
    seglen = 0.0
    for i in range(m):
        if i > 0:
            rot = tang[i - 1].rotation_difference(tang[i])
            e1 = rot @ e1
            seglen += (pts[i] - pts[i - 1]).length
        e1 = (e1 - tang[i] * e1.dot(tang[i])).normalized()
        e2 = tang[i].cross(e1)
        row = []
        for k in range(n):
            q = 2 * pi * k / n
            d = e1 * cos(q) + e2 * sin(q)
            row.append(p.vert(tuple(pts[i] + d * r), tuple(d)))
        rings.append((row, seglen))
    start = len(p.f)
    count = m if closed else m - 1
    shift = 0
    if closed:
        # the last ring meets the first: joined to the corner nearest each of its own
        first, last = rings[0][0], rings[-1][0]
        v0 = Vector(p.v[last[0]])
        shift = min(range(n), key=lambda k: (Vector(p.v[first[k]]) - v0 - (pts[0] - pts[-1])).length)
    for i in range(count):
        (ra, sa), (rb, sb) = rings[i], rings[(i + 1) % m]
        off = shift if (closed and i == m - 1) else 0
        for k in range(n):
            j = (k + 1) % n
            if lay:
                strand = (k * lay / n + sa / (r * 7.0)) % 1.0
                col = tint(colour, 0.80 + 0.28 * abs(sin(pi * strand)))
            else:
                col = colour
            p.face((ra[k], ra[j], rb[(j + off) % n], rb[(k + off) % n]), col, smooth=True)
    p.orient(start, None)
    if not closed:
        for wanted, i, way in ((caps[0], 0, -1), (caps[1], m - 1, 1)):
            if wanted:
                st = len(p.f)
                c = p.vert(tuple(pts[i]))
                ring = [p.vert(p.v[v]) for v in rings[i][0]]
                for k in range(n):
                    p.face((c, ring[k], ring[(k + 1) % n]), colour, smooth=False)
                p.orient(st, tuple(tang[i] * way))


def prism(p, outline, depth, colour, smooth=False, caps=(True, True), walls=True):
    """A plate or a bar of any outline: the flat outline (points in one plane) pushed along the vector `depth`. Its sides are
    flat, or lit round where the outline is a curve of many points (`smooth`)."""
    pts = [Vector(q) for q in outline]
    d = Vector(depth)
    n = Vector((0, 0, 0))
    for a, b in zip(pts, pts[1:] + pts[:1]):
        n += a.cross(b)
    if n.dot(d) < 0:                                              # counted counter-clockwise as seen from where it is pushed to
        pts.reverse()
        n = -n
    k = len(pts)
    base = len(p.v)
    for q in pts:
        p.vert(tuple(q))
    for q in pts:
        p.vert(tuple(q + d))
    for i in range(k if walls else 0):
        j = (i + 1) % k
        p.face((base + i, base + j, base + k + j, base + k + i), colour, smooth=smooth)
    for wanted, shift, way in ((caps[0], Vector((0, 0, 0)), -1), (caps[1], d, 1)):
        if wanted:
            st = len(p.f)
            p.polygon([tuple(q + shift) for q in pts], colour)
            p.orient(st, tuple(d * way))


def band(p, outer, inner, depth, colour, smooth=True):
    """A flange round a web: the band between two outlines of as many points (the outer and the inner edge of a girder's
    flange, a rim), pushed along `depth`."""
    d = Vector(depth)
    k = len(outer)
    o = [Vector(q) for q in outer]
    i_ = [Vector(q) for q in inner]
    mid = sum(o, Vector((0, 0, 0))) / k + d / 2
    for loop, inward in ((o, False), (i_, True)):
        st = len(p.f)
        base = len(p.v)
        for q in loop:
            p.vert(tuple(q))
        for q in loop:
            p.vert(tuple(q + d))
        for a in range(k):
            b = (a + 1) % k
            p.face((base + a, base + b, base + k + b, base + k + a), colour, smooth=smooth)
        # each wall looks away from the band's own metal: the outer wall outward, the inner wall into the hollow
        other = i_ if not inward else o
        for f in range(st, len(p.f)):
            a = f - st
            here = (loop[a] + loop[(a + 1) % k]) / 2
            there = (other[a] + other[(a + 1) % k]) / 2
            want = here - there
            pts = [Vector(p.v[v]) for v in p.f[f]]
            nrm = Vector((0, 0, 0))
            for u, w in zip(pts, pts[1:] + pts[:1]):
                nrm += u.cross(w)
            if nrm.dot(want) < 0:
                p.f[f] = tuple(reversed(p.f[f]))
    for shift, way in ((Vector((0, 0, 0)), -1), (d, 1)):
        st = len(p.f)
        base = len(p.v)
        for q in o:
            p.vert(tuple(q + shift))
        for q in i_:
            p.vert(tuple(q + shift))
        for a in range(k):
            b = (a + 1) % k
            p.face((base + a, base + b, base + k + b, base + k + a), colour, smooth=False)
        p.orient(st, tuple(d * way))


def rounded_path(pts, radii, step=0.05):
    """A line through points (in one plane) with each inner corner rounded to its radius: the points of the fair line."""
    P3 = [Vector(q) for q in pts]
    out = [P3[0]]
    for i in range(1, len(P3) - 1):
        a, b, c = P3[i - 1], P3[i], P3[i + 1]
        u, v = (a - b).normalized(), (c - b).normalized()
        ang = u.angle(v)
        r = radii[i - 1]
        if r <= 0 or ang > pi - 1e-4:
            out.append(b)
            continue
        centre = b + (u + v).normalized() * (r / sin(ang / 2))
        a0, a1 = b + u * (r / tan(ang / 2)) - centre, b + v * (r / tan(ang / 2)) - centre
        n = max(3, int((pi - ang) * r / step))
        for k in range(n + 1):
            out.append(centre + a0.slerp(a1, k / n).normalized() * r)       # (slerp gives the direction; the radius is ours)
    out.append(P3[-1])
    return out


def ribbon(path, half, cap0=True, cap1=True, n=10):
    """The outline of a limb: a line of points (in the plane square to z) made `half` wide each side (a number, or a
    function of how far along it is, 0 to 1), with a round end at each end that asks for one."""
    z = Vector((0, 0, 1))
    total = sum((b - a).length for a, b in zip(path, path[1:])) or 1.0
    left, right, s = [], [], 0.0
    for i, q in enumerate(path):
        t = (path[min(i + 1, len(path) - 1)] - path[max(i - 1, 0)]).normalized()
        if i:
            s += (q - path[i - 1]).length
        w = half(s / total) if callable(half) else half
        nrm = z.cross(t)
        left.append(q + nrm * w)
        right.append(q - nrm * w)
    out = list(left)
    if cap1:
        t = (path[-1] - path[-2]).normalized()
        w = half(1.0) if callable(half) else half
        for k in range(1, n):
            a = pi * k / n
            out.append(path[-1] + (z.cross(t) * cos(a) + t * sin(a)) * w)
    out += reversed(right)
    if cap0:
        t = (path[1] - path[0]).normalized()
        w = half(0.0) if callable(half) else half
        for k in range(1, n):
            a = pi * k / n
            out.append(path[0] + (-z.cross(t) * cos(a) - t * sin(a)) * w)
    return out


def bar(p, a, b, w, h, colour, up=UP, r=0.003):
    """A flat or square bar from a to b: `w` wide across, `h` deep along `up` (as near as that can be square to its run)."""
    a, b = Vector(a), Vector(b)
    ax, e1, e2 = frame_of(b - a, up)                              # e1 is `up` made square to the run, e2 lies across
    n0 = len(p.v)
    p.block((-w / 2, -h / 2, 0.0), (w / 2, h / 2, (b - a).length), colour, r)
    M = Matrix((-e2, e1, ax)).transposed()                        # across, up, along: a right-handed three
    _turn(p, n0, M, a)


def _turn(p, n0, M, origin, flip=False):
    """Turn and move what was drawn in a part since vertex n0 (drawn about the origin) into its place."""
    o = Vector(origin)
    for i in range(n0, len(p.v)):
        p.v[i] = tuple(M @ Vector(p.v[i]) + o)
        if p.n[i] is not None:
            p.n[i] = tuple(M @ Vector(p.n[i]))


class turned:
    """What a fitting draws inside `with turned(kit, origin, x=…, y=…, z=…):` is drawn about (0, 0, 0) in its own axes and then
    stood where it belongs: a winch on a slope, a davit arm at its angle, the second of a pair."""

    def __init__(self, kit, origin=(0, 0, 0), x=None, y=None, z=None, about=None, angle=0.0):
        self.kit, self.o = kit, Vector(origin)
        if about is not None:
            self.M = Matrix.Rotation(radians(angle), 3, Vector(about))
            return
        g = {k: Vector(v).normalized() for k, v in (('x', x), ('y', y), ('z', z)) if v is not None}
        square = lambda v, to: (Vector(v) - to * Vector(v).dot(to)).normalized()
        if 'x' in g and 'y' in g:
            ex = g['x']; ez = ex.cross(g['y']).normalized(); ey = ez.cross(ex)
        elif 'y' in g and 'z' in g:
            ey = g['y']; ex = ey.cross(g['z']).normalized(); ez = ex.cross(ey)
        elif 'x' in g and 'z' in g:
            ez = g['z']; ey = ez.cross(g['x']).normalized(); ex = ey.cross(ez)
        elif 'x' in g:
            ex = g['x']; ey = square(UP if abs(ex.y) < 0.99 else FWD, ex); ez = ex.cross(ey)
        elif 'y' in g:
            ey = g['y']; ez = square(FWD if abs(ey.z) < 0.99 else PORT, ey); ex = ey.cross(ez)
        elif 'z' in g:
            ez = g['z']; ey = square(UP if abs(ez.y) < 0.99 else PORT, ez); ex = ey.cross(ez)
        else:
            ex, ey, ez = Vector(PORT), Vector(UP), Vector(FWD)
        self.M = Matrix((ex, ey, ez)).transposed()

    def __enter__(self):
        self.marks = {slot: len(p.v) for slot, p in self.kit.parts.items()}
        self.runs = len(self.kit.runs)
        return self

    def __exit__(self, *exc):
        for slot, p in self.kit.parts.items():
            _turn(p, self.marks.get(slot, 0), self.M, self.o)
        for run in self.kit.runs[self.runs:]:
            run['points'] = [tuple(self.M @ Vector(q) + self.o) for q in run['points']]
        return False

    def at(self, q):
        """Where a point of the turned thing comes to stand."""
        return tuple(self.M @ Vector(q) + self.o)

    def way(self, d):
        return tuple(self.M @ Vector(d))


def hexagon(p, a, b, across, colour):
    """A hexagon bar from a to b, `across` its flats: a bolt's head, a nut."""
    a, b = Vector(a), Vector(b)
    ax, e1, e2 = frame_of(b - a)
    r = across / 2 / cos(pi / 6)
    prism(p, [tuple(a + (e1 * cos(pi / 3 * k) + e2 * sin(pi / 3 * k)) * r) for k in range(6)], b - a, colour)


def bolt(p, at, axis, d, colour=STEEL, washer=True, nut=False, proud=0.0):
    """A bolt's head on the face it holds: washer, hexagon head (or a nut on the bolt's end, with the thread standing out
    of it). `at` is on the face, `axis` looks out of it, `d` is the bolt's diameter (M20: 0.020)."""
    a = Vector(axis).normalized()
    o = Vector(at) + a * proud
    t = 0.0
    if washer:
        p.tube(tuple(o), tuple(o + a * 0.15 * d), 1.05 * d, colour=tint(colour, 0.92))
        t = 0.15 * d
    hexagon(p, o + a * t, o + a * (t + (0.8 if nut else 0.65) * d), 1.5 * d, colour)
    if nut:
        p.tube(tuple(o + a * (t + 0.8 * d)), tuple(o + a * (t + 1.25 * d)), d / 2, colour=tint(colour, 0.85))


def bolt_circle(p, centre, axis, radius, count, d, colour=STEEL, phase=0.0, nut=False):
    a, e1, e2 = frame_of(axis)
    for k in range(count):
        q = phase + 2 * pi * k / count
        bolt(p, Vector(centre) + (e1 * cos(q) + e2 * sin(q)) * radius, a, d, colour, nut=nut)


def plate_disc(p, centre, axis, r, t, colour):
    """A round plate (a flange, a pad) lying on a face: from `centre` on the face, `t` thick along `axis`."""
    c, a = Vector(centre), Vector(axis).normalized()
    p.tube(tuple(c), tuple(c + a * t), r, colour=colour)


def gusset(p, corner, along, up, length, height, t, colour):
    """A welded bracket: a triangle of plate in the corner between two faces, `t` thick, standing on `corner`."""
    c, a, u = Vector(corner), Vector(along).normalized(), Vector(up).normalized()
    w = a.cross(u).normalized()
    prism(p, [tuple(c - w * (t / 2)), tuple(c + a * length - w * (t / 2)), tuple(c + a * (length * 0.18) + u * height - w * (t / 2)),
              tuple(c + u * height - w * (t / 2))], w * t, colour)


def letter(kit, p, text, height, origin, right, up, colour, align='centre', proud=0.002, onto=None, piece=None):
    """Lettering as flat paint: `origin` is the foot of the line's middle (or its left end), `right` and `up` the way it reads
    and stands; it looks along right x up and stands `proud` of its surface. `onto(u, v)` carries a point of the line (u
    along it from its middle or left, v up) onto a curved surface instead; `piece` is then the longest edge of a piece of
    a letter. A mirrored fitting (kit.mirror) is lettered from the other end, so that it still reads from the left."""
    pts, tris, width = lettering(text, height)
    r, u = Vector(right).normalized(), Vector(up).normalized()
    n = r.cross(u)
    o = Vector(origin) + n * proud if origin is not None else None
    off = -width / 2 if align == 'centre' else 0.0 if align == 'left' else -width
    st = len(p.f)
    for tri in tris:
        tri2 = [(pts[i][0] + off, pts[i][1]) for i in tri]
        if kit.mirror:
            # A mirror turns a line of lettering back to front. Laid the other way along the same length here, it is turned
            # by the mirror to read from the left again (seen from outside, the mirrored line reads against `right`).
            tri2 = [(2 * off + width - a, b) for a, b in tri2]
        for sub in (_pieces(tri2, piece) if piece else [tri2]):
            if onto:
                # onto() is written for the fitting as drawn (port-handed): give it the place, it gives the point
                p.face(tuple(p.vert(tuple(onto(a, b))) for a, b in sub), colour)
            else:
                p.face(tuple(p.vert(tuple(o + r * a + u * b)) for a, b in sub), colour)
    if onto is None:
        p.orient(st, tuple(n))
    return width


def _pieces(tri, longest):
    out, todo = [], [tuple(tri)]
    while todo:
        a, b, c = todo.pop()
        if max(hypot(a[0] - b[0], a[1] - b[1]), hypot(b[0] - c[0], b[1] - c[1]), hypot(c[0] - a[0], c[1] - a[1])) <= longest:
            out.append((a, b, c))
            continue
        ab, bc, ca = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), ((b[0] + c[0]) / 2, (b[1] + c[1]) / 2), ((c[0] + a[0]) / 2, (c[1] + a[1]) / 2)
        todo += [(a, ab, ca), (ab, b, bc), (ca, bc, c), (ab, bc, ca)]
    return out


def label(kit, p, centre, right, up, w, h, colour, lines=(), ink=BLACK, proud=0.002, text_h=None, border=None):
    """A plate, a placard or a label: a flat panel of paint with lines of lettering on it, each a hair further out."""
    r, u = Vector(right).normalized(), Vector(up).normalized()
    n = r.cross(u)
    c = Vector(centre) + n * proud
    st = len(p.f)
    p.face(tuple(p.vert(tuple(c + r * a + u * b)) for a, b in ((-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2))), colour)
    p.orient(st, tuple(n))
    if border:
        for (a0, b0, a1, b1) in ((-w / 2, -h / 2, w / 2, -h / 2 + border), (-w / 2, h / 2 - border, w / 2, h / 2),
                                 (-w / 2, -h / 2 + border, -w / 2 + border, h / 2 - border), (w / 2 - border, -h / 2 + border, w / 2, h / 2 - border)):
            s2 = len(p.f)
            p.face(tuple(p.vert(tuple(c + n * 0.0006 + r * a + u * b)) for a, b in ((a0, b0), (a1, b0), (a1, b1), (a0, b1))), ink)
            p.orient(s2, tuple(n))
    if lines:
        th = text_h or min(h / (len(lines) * 1.7), (w - 2 * (border or 0.0) - 0.02 * w) / (max(len(s) for s in lines) * 0.80))
        gap = h / (len(lines) + 0.4)
        for i, s in enumerate(lines):
            if s:
                y = h / 2 - gap * (i + 0.7) - th / 2
                letter(kit, p, s, th, c + u * y, r, u, ink, proud=0.0009)


def stadium(a, b, r, n=8):
    """The outline of a slot or a link's centre line in the plane of two directions: (u, v) points, two straights of half
    length a along u joined by half circles of radius r."""
    out = []
    for i in range(n + 1):
        t = -pi / 2 + pi * i / n
        out.append((a + r * cos(t), r * sin(t)))
    for i in range(n + 1):
        t = pi / 2 + pi * i / n
        out.append((-a + r * cos(t), r * sin(t)))
    return out


# ---------------------------------------------------------------------------------------------------------------------
class Kit:
    """One fitting while it is drawn: its parts by their look (and by the motion they take part in), what can be worked, what
    it asks of the deck. Drawn in the fitting's own axes; `place` carries all of it aboard."""

    def __init__(self, kind, name, group, title):
        self.kind, self.name, self.group, self.title = kind, name, group, title
        self.parts = {}
        self.inputs, self.movers, self.cuts, self.runs = [], [], [], []
        self.clear = None
        self.mirror = False
        self.known_by = ''

    def p(self, key, mover=None, look=None):
        """The part of this fitting drawn in one look (and moved by one motion)."""
        slot = (key, mover)
        if slot not in self.parts:
            nm = f'{self.title}, {key}' if not mover else f'{self.title}, {mover} {key}'
            part = Part(nm, look or LOOK_OF[key], mover=self.mid(mover) if mover else None)
            part.group = self.group
            self.parts[slot] = part
        return self.parts[slot]

    def mid(self, local):
        """A motion's or an input's name aboard: the fitting's own name before it, so no two fittings share one."""
        return f'{self.name}-{local}'

    def run(self, key, points, r, colour, mover=None):
        """A pipe or a cable laid along a line of points: drawn, and recorded for the check that it is carried (JSY-STD-402).
        The part's name ends in what it is (`pipes`, `cables`)."""
        part = self.p(key, mover)
        sweep(part, points, r, colour)
        self.runs.append(dict(part=part.name, r=r, points=[tuple(q) for q in points]))

    def cut(self, kind, lo, hi, round_=None, outline=None):
        """An opening this fitting needs in what it stands on or against (the ship's builder cuts it; the fitting is drawn to
        stand in it). `round_` = (centre, radius, axis) for a round one; `outline` the opening's own outline, points on the
        face it is cut in (the deck's top, the bulwark's inboard face), for one that is neither round nor square."""
        c = dict(kind=kind, lo=tuple(lo), hi=tuple(hi))
        if round_:
            c['round'] = round_
        if outline:
            c['outline'] = [tuple(q) for q in outline]
        self.cuts.append(c)

    def place(self, at, heading, mirror=False):
        """Carry the fitting aboard: mirrored if asked (x to -x: a starboard fitting from a port one), turned by `heading`
        about the upright (0 its front forward, 90 to port, 180 aft, 270 to starboard), and stood on `at`."""
        h = radians(heading)
        R = Matrix(((cos(h), 0, sin(h)), (0, 1, 0), (-sin(h), 0, cos(h))))
        S = Matrix(((-1 if mirror else 1, 0, 0), (0, 1, 0), (0, 0, 1)))
        M = R @ S
        o = Vector(at)
        point = lambda q: [round(float(c), 5) for c in (M @ Vector(q) + o)]
        way = lambda d: [round(float(c), 6) for c in (M @ Vector(d))]
        for part in self.parts.values():
            part.v = [tuple(M @ Vector(q) + o) for q in part.v]
            part.n = [None if n is None else tuple(M @ Vector(n)) for n in part.n]
            if mirror:
                part.f = [tuple(reversed(f)) for f in part.f]
                part.t = [None if t is None else list(reversed(t)) for t in part.t]
        movers = []
        for m in self.movers:
            m = dict(m)
            for key in ('pivot', 'point', 'anchor', 'pin'):
                if key in m:
                    m[key] = point(m[key])
            if 'axis' in m:
                # a turn seen in a mirror runs the other way: its axis is turned over with it
                turning = m['kind'] in ('turn', 'carry', 'aim')
                m['axis'] = way(-Vector(m['axis']) if (mirror and turning) else Vector(m['axis']))
            movers.append(m)
        inputs = []
        for i in self.inputs:
            i = dict(i)
            if 'at' in i:
                i['at'] = point(i['at'])
            if 'normal' in i:
                i['normal'] = way(i['normal'])
            inputs.append(i)
        cuts = []
        for c in self.cuts:
            corners = [M @ Vector((x, y, z)) + o for x in (c['lo'][0], c['hi'][0]) for y in (c['lo'][1], c['hi'][1]) for z in (c['lo'][2], c['hi'][2])]
            lo = tuple(round(min(q[k] for q in corners), 5) for k in range(3))
            hi = tuple(round(max(q[k] for q in corners), 5) for k in range(3))
            out = dict(kind=c['kind'], box=(lo, hi))
            # the opening's own outline on the deck (or the bulwark), for a fitting that is not placed square to the ship
            x0, y0, z0 = c['lo']
            x1, y1, z1 = c['hi']
            if 'outline' in c:
                out['outline'] = [point(q) for q in c['outline']]
            elif 'round' in c:
                centre, radius, axis = c['round']
                a_, e1, e2 = frame_of(axis)
                n = round_sides(radius)
                out['outline'] = [point(Vector(centre) + (e1 * cos(2 * pi * i / n) + e2 * sin(2 * pi * i / n)) * radius) for i in range(n)]
            elif c['kind'] == 'deck':
                out['outline'] = [point(q) for q in ((x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1))]
            else:
                out['outline'] = [point(q) for q in ((x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1))]
            if 'round' in c:
                centre, radius, axis = c['round']
                out['round'] = dict(centre=point(centre), radius=radius, axis=way(axis))
            cuts.append(out)
        for run in self.runs:
            shipyard.RUNS.append(dict(part=run['part'], r=run['r'], points=[point(q) for q in run['points']]))
        clear = None
        if self.clear:
            lo, hi = self.clear
            corners = [M @ Vector((x, y, z)) + o for x in (lo[0], hi[0]) for y in (lo[1], hi[1]) for z in (lo[2], hi[2])]
            clear = (tuple(round(min(q[k] for q in corners), 4) for k in range(3)), tuple(round(max(q[k] for q in corners), 4) for k in range(3)))
        parts = [part for part in self.parts.values() if part.f]
        named = {part.mover for part in parts if part.mover}
        defined = {m['id'] for m in movers}
        if named != defined:
            raise SystemExit(f'{self.title}: moving parts and their motions do not agree: parts name {sorted(named - defined)} without a motion, '
                             f'motions {sorted(defined - named)} move nothing')
        return dict(parts=parts, inputs=inputs, movers=movers, cuts=cuts, clear=clear, parts_known_by=self.known_by)


# ---------------------------------------------------------------------------------------------------------------------
# The fittings themselves are in the sections below; each adds itself to FITTINGS.
FITTINGS = {}
_count = {}


def fitting(kind, size, front='+z', note='', title=None, handed=False):
    """Put a fitting's builder on the yard's list. `size` = (along its length, across, height) in metres."""
    def wrap(fn):
        FITTINGS[kind] = dict(build=fn, size=size, front=front, note=note, title=title or kind.replace('-', ' ').capitalize(), handed=handed)
        return fn
    return wrap


def build(kind, at, heading=0.0, group='passenger', name=None, **options):
    """Build one fitting where it stands aboard. `at` = (x, y, z) in the ship's axes: the point of the deck under its origin.
    `heading` in degrees turns it about the upright axis: 0 its front looks forward (+z), 90 to port (+x), 180 aft, 270 to
    starboard. `group` is the viewer's part (deck) its parts belong to. Returns a dict:
        parts   [Part, ...]          each with .group set (and .mover for a moving part)
        inputs  [ ... ]              what the page can work (file format: inputs), ids made unique with `name`
        movers  [ ... ]              their motions (file format: movers), in the ship's axes after placing
        cuts    [ ... ]              openings the fitting needs in what it stands on or against: dict(kind='deck'|'bulwark',
                                     box=(lo, hi)) in ship's axes; a round one also carries round=dict(centre, radius, axis),
                                     a deck one its own four corners as `outline`
        clear   (lo, hi)             the box that must be kept clear of anything else, in ship's axes
        parts_known_by  str          the fitting's row for JSY-STD-404 section 3
    """
    if kind not in FITTINGS:
        raise SystemExit(f'the yard has no fitting called {kind!r}: it has {sorted(FITTINGS)}')
    spec = FITTINGS[kind]
    if name is None:
        _count[kind] = _count.get(kind, 0) + 1
        name = f'{kind}-{_count[kind]}'
    kit = Kit(kind, name, group, f"{spec['title']} {name}")
    kit.mirror = bool(options.get('side', 1) < 0) if spec.get('handed') else False
    spec['build'](kit, **options)
    return kit.place(at, heading, kit.mirror)
