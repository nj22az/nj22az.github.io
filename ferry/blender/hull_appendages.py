"""
What she carries under the water: the keel bar and the centreline skeg, the bilge keels, two shafts with their stern
tubes and brackets, two four-bladed screws turning outward, a rudder behind each, the bow thruster in its tunnel, the
sea chests and the zinc anodes.

The starboard shaft line is built and the port one is its mirror, which also makes the port screw left-handed.
"""
from math import pi, sin, cos, atan, sqrt
from mathutils import Vector
import lines as L
import spec as S
from shipyard import Part, srgb, tint

RED = srgb(S.ANTIFOULING)
DARK_RED = tint(RED, 0.9)


def shaft_y(yard):
    return S.SCREW['y'] + S.SHAFT_RISE * (yard - S.SCREW['yard'])


def shaft_exit():
    """Where the shaft line passes out through the shell, metres from the transom."""
    a, b = S.SCREW['yard'] + 1.0, S.GEARBOX_FLANGE['yard']
    for _ in range(40):
        m = (a + b) / 2
        if shaft_y(m) < L.hull_y(S.SHAFT_X, L.Z(m)):
            a = m
        else:
            b = m
    return (a + b) / 2


def _outside_only(part, start):
    """Take away the faces made since `start` that lie wholly inside her plating: what is left ends at the shell."""
    def inside(i):
        x, y, z = part.v[i]
        under = L.hull_y(x, z)
        return under is not None and y > under + S.SHELL + 0.004
    kept = [(f, c) for f, c in zip(part.f[start:], part.c[start:]) if not all(inside(i) for i in f)]
    part.f[start:] = [f for f, _ in kept]
    part.c[start:] = [c for _, c in kept]


def _frame(axis):
    """Two unit vectors square to `axis`, with e1 × e2 = axis: e1 as near to port as the axis allows."""
    axis = Vector(axis).normalized()
    e1 = Vector((1, 0, 0)) - axis * axis.x
    if e1.length < 1e-6:
        e1 = Vector((0, 1, 0)) - axis * axis.y
    e1.normalize()
    return axis, e1, axis.cross(e1)


def _beam(part, a, b, chord_dir, chord, thickness, colour, sides=14):
    """A streamlined bar from a to b: an ellipse of `chord` along chord_dir and `thickness` across it."""
    a, b = Vector(a), Vector(b)
    axis = (b - a).normalized()
    u = Vector(chord_dir) - axis * axis.dot(Vector(chord_dir))
    u.normalize()
    w = axis.cross(u)
    ring = lambda c: [tuple(c + u * (chord / 2 * cos(2 * pi * k / sides)) + w * (thickness / 2 * sin(2 * pi * k / sides))) for k in range(sides)]
    start = len(part.f)
    part.grid([ring(a), ring(b)], colour, close=True)
    mid = (a + b) / 2
    part.orient(start, lambda c: (c - mid) - axis * (c - mid).dot(axis))


def _revolve(part, origin, axis, profile, colour, sides=20):
    """A body turned about an axis: profile is a list of (distance along the axis, radius)."""
    axis, e1, e2 = _frame(axis)
    origin = Vector(origin)
    rows = [[tuple(origin + axis * x + (e1 * cos(2 * pi * k / sides) + e2 * sin(2 * pi * k / sides)) * max(r, 1e-4)) for k in range(sides)]
            for x, r in profile]
    start = len(part.f)
    part.grid(rows, colour, close=True)
    part.orient(start, lambda c: (c - origin) - axis * (c - origin).dot(axis) + axis * 1e-3 * ((c - origin).dot(axis) - (profile[0][0] + profile[-1][0]) / 2))


# Blade outline: chord over radius at each fraction of the radius (a moderately wide four-bladed screw).
_CHORD = ((0.17, 0.40), (0.25, 0.47), (0.35, 0.55), (0.45, 0.61), (0.55, 0.65), (0.65, 0.66), (0.75, 0.63), (0.85, 0.55),
          (0.92, 0.44), (0.97, 0.30), (1.0, 0.12))


def propeller(part, centre, axis, radius, hub, blades, pitch_ratio, colour, hand=1, boss=True):
    """
    A screw on `axis` (pointing the way it drives). Right-handed for hand = 1: seen from behind it turns clockwise going
    ahead. The blade's face is a true helicoid of constant pitch; its back carries the thickness; the tips are skewed.
    """
    axis, e1, e2 = _frame(axis)
    centre = Vector(centre)
    pitch = pitch_ratio * 2 * radius
    place = lambda x, r, t: tuple(centre + axis * x + (e1 * cos(t) + e2 * sin(t)) * r)
    for b in range(blades):
        turn = 2 * pi * b / blades + 0.3
        face, back = [], []
        for frac, chord in _CHORD:
            r, c = frac * radius, chord * radius
            phi = atan(pitch / (2 * pi * r))
            skew = 0.32 * max(0.0, frac - 0.2) ** 2 / 0.64
            thick = radius * (0.05 * (1 - frac) + 0.004)
            f_row, b_row = [], []
            for k in range(11):
                s = -0.5 + k / 10
                xi = s * c
                t = turn + hand * (xi * cos(phi) / r - skew)
                x = xi * sin(phi)
                th = thick * sqrt(max(0.0, 1 - (2 * s) ** 2)) * (1.0 if s < 0 else 0.8 + 0.2 * (1 - 2 * s))
                f_row.append(place(x, r, t))
                b_row.append(place(x + th * cos(phi), r, t - hand * th * sin(phi) / r))
            face.append(f_row)
            back.append(b_row)
        start = len(part.f)
        part.grid(face, colour)
        part.orient(start, tuple(-axis))
        start = len(part.f)
        part.grid(back, colour)
        part.orient(start, tuple(axis))
    if boss:
        # The boss, and the cone that fairs it aft.
        _revolve(part, centre, axis, [(0.17, hub * 0.62), (0.15, hub), (-0.17, hub), (-0.24, hub * 0.93), (-0.31, hub * 0.72),
                                      (-0.37, hub * 0.42), (-0.41, 0.0)], colour, sides=20)


def _naca(xc, t):
    """Half-thickness of a symmetrical NACA section at xc of the chord (0 at the nose), closed at the tail."""
    return 5 * t * (0.2969 * sqrt(xc) - 0.1260 * xc - 0.3516 * xc ** 2 + 0.2843 * xc ** 3 - 0.1036 * xc ** 4)


def _foil(part, x, sections, colour, t=0.18, count=12):
    """A fin standing up and down at breadth x: sections are (y, nose z, chord), top to bottom or bottom to top."""
    rows = []
    for y, nose, chord in sections:
        up = [(x + _naca(xc, t) * chord, y, nose - xc * chord) for xc in ((1 - cos(pi * k / count)) / 2 for k in range(count + 1))]
        down = [(2 * x - p[0], p[1], p[2]) for p in reversed(up[1:-1])]
        rows.append(up + down)
    start = len(part.f)
    part.grid(rows, colour, close=True)
    mid_z = sum(n - c / 2 for _, n, c in sections) / len(sections)
    part.orient(start, lambda c: (c.x - x, 0, (c.z - mid_z) * 0.05))
    for row, toward in ((rows[0], sections[0][0] - sections[-1][0]), (rows[-1], sections[-1][0] - sections[0][0])):
        start = len(part.f)
        part.polygon(row, colour)
        part.orient(start, (0, toward, 0))


def _conform(z, psi, side, lift):
    """A point on the shell at (z, psi), lifted `lift` metres off it, and the shell's normal there."""
    p, n = L.shell_point(z, psi), L.shell_normal(z, psi)
    return (side * (p[0] + n[0] * lift), p[1] + n[1] * lift, p[2] + n[2] * lift), (side * n[0], n[1], n[2])


def _anode(part, z, psi, side, length=0.30, width=0.10, thick=0.035):
    """A zinc block welded to the plating, lying along her length."""
    c, n = _conform(z, psi, side, 0.0)
    c, n = Vector(c), Vector(n)
    t = Vector((0, 0, 1)) - n * n.z
    t.normalize()
    g = n.cross(t)
    corners = []
    for h, k in ((0.0, 1.0), (thick, 0.82)):
        for a, b in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
            corners.append(part.vert(tuple(c + t * (a * length / 2 * k) + g * (b * width / 2 * k) + n * h)))
    start = len(part.f)
    zinc = srgb(S.ZINC)
    part.face(corners[4:8], zinc)
    for i in range(4):
        part.face((corners[i], corners[(i + 1) % 4], corners[4 + (i + 1) % 4], corners[4 + i]), zinc)
    centre = c + n * (thick / 2)
    part.orient(start, lambda q: q - centre)


def build():
    keel = Part('Keel bar and skeg', 'Antifouling', smooth=True, angle=40)
    bilge = Part('Bilge keels', 'Antifouling', smooth=True, angle=30)
    gear = Part('Stern gear: bossings, brackets, headboxes', 'Antifouling', smooth=True, angle=40)
    inboard = Part('Stern tubes, inboard', 'Primer', smooth=True, angle=40)
    shafts = Part('Tail shafts', 'Shaft steel', smooth=True, angle=40)
    screws = Part('Screws', 'Bronze', smooth=True, angle=50)
    thruster = Part('Bow thruster', 'Antifouling', smooth=True, angle=40)
    thruster_screw = Part('Bow thruster screw', 'Bronze', smooth=True, angle=50)
    chests = Part('Sea chests', 'Antifouling')
    chest_dark = Part('Sea chest openings', 'Marking')
    anodes = Part('Zinc anodes', 'Zinc')

    # ---- The keel bar: a flat bar under the centreline from the skeg to the forefoot.
    w, d = S.KEEL_BAR['width'] / 2, S.KEEL_BAR['depth']
    y0, y1 = S.KEEL_BAR['yard']
    rows = []
    n = int((y1 - y0) / 0.25)
    for i in range(n + 1):
        yard = y0 + (y1 - y0) * i / n
        z = L.Z(yard)
        k = L.keel_y(z)
        fade = min(1.0, (y1 - yard) / 0.8)                 # it runs out into the stem
        rows.append([(w, k + 0.01, z), (w, k - d * fade, z), (w * 0.6, k - d * fade - 0.012 * fade, z),
                     (-w * 0.6, k - d * fade - 0.012 * fade, z), (-w, k - d * fade, z), (-w, k + 0.01, z)])
    start = len(keel.f)
    keel.grid(rows, DARK_RED)
    keel.orient(start, lambda c: (c.x * 4, -1, 0))

    # ---- The skeg: the deadwood on the centreline under the counter, down to the keel's level, fined away aft.
    a, b = S.SKEG['yard']
    foot = L.KEEL - d - 0.012
    rows = []
    n = 36
    for i in range(n + 1):
        yard = a + (b - a) * i / n
        z = L.Z(yard)
        top = L.keel_y(z) + 0.03
        run = min(1.0, (yard - a) / 0.9)                   # the aft edge rakes up to the hull
        bottom = top + (foot - top) * (run * run * (3 - 2 * run))
        bottom = min(bottom, top - 0.001)
        h = (S.SKEG['thickness'] / 2) * (0.18 + 0.82 * min(1.0, (yard - a) / 1.6))
        mid = top + (bottom - top) * 0.55
        rows.append([(h, top, z), (h, mid, z), (h * 0.7, bottom + (top - bottom) * 0.08, z), (0.0, bottom, z),
                     (-h * 0.7, bottom + (top - bottom) * 0.08, z), (-h, mid, z), (-h, top, z)])
    start = len(keel.f)
    keel.grid(rows, DARK_RED)
    keel.orient(start, lambda c: (c.x * 6, -0.5, 0))

    # ---- Bilge keels: a bulb plate standing square off the turn of the bilge, run out at both ends.
    spec = S.BILGE_KEEL
    psi = spec['psi']
    for side in (1, -1):
        rows = []
        n = int((spec['yard'][1] - spec['yard'][0]) / 0.25)
        for i in range(n + 1):
            yard = spec['yard'][0] + 0.25 * i
            z = L.Z(yard)
            p, nrm = Vector(L.shell_point(z, psi)), Vector(L.shell_normal(z, psi))
            girth = Vector((-nrm.y, nrm.x, 0)).normalized()
            depth = spec['depth'] * min(1.0, (yard - spec['yard'][0]) / 0.7, (spec['yard'][1] - yard) / 0.7)
            root = 0.035
            tip = p + nrm * max(depth, 0.004)
            pts = [p + girth * root - nrm * 0.004, tip + girth * 0.012, tip - girth * 0.012, p - girth * root - nrm * 0.004]
            rows.append([(side * q.x, q.y, q.z) for q in pts])
        start = len(bilge.f)
        bilge.grid(rows, DARK_RED)
        bilge.orient(start, lambda c, s=side: _bilge_out(c, s, psi))

    # ---- The starboard shaft line; the port one is its mirror.
    x = -S.SHAFT_X
    sc = S.SCREW
    at = lambda yard: Vector((x, shaft_y(yard), L.Z(yard)))
    fwd = (at(8.0) - at(3.0)).normalized()
    centre = at(sc['yard'])
    side_gear = Part('gear', 'Antifouling')
    side_inboard = Part('inboard', 'Primer')
    side_shafts = Part('shafts', 'Shaft steel')
    side_screw = Part('screw', 'Bronze')
    steel = srgb(S.STEEL)
    # The tail shaft, from its coupling inside her to the screw. (The intermediate shaft forward of the coupling stands
    # in the shaft space and is drawn with it: hull_fittings.py.)
    side_shafts.tube(at(S.SHAFT_COUPLING), at(sc['yard'] + 0.17), S.SHAFT_RADIUS, colour=steel, sides=14)
    # The stern tube: inside her, a tube from its seal to the shell; outside, the bossing that fairs it. The bossing is
    # set where the shaft line leaves the hull.
    leave = shaft_exit()
    side_inboard.tube(at(S.STERN_TUBE_SEAL), at(leave - 0.25), 0.085, colour=srgb(S.PRIMER), sides=14)
    _revolve(side_inboard, at(0), fwd, [((at(yd) - at(0)).length, r) for yd, r in
                                        ((S.STERN_TUBE_SEAL + 0.14, 0.06), (S.STERN_TUBE_SEAL + 0.12, 0.115), (S.STERN_TUBE_SEAL, 0.115), (S.STERN_TUBE_SEAL - 0.02, 0.085))],
             srgb(S.FLANGE), sides=18)
    # The bossing is turned about the shaft in short steps and only what is outside her is kept, so that inside the
    # shaft space the stern tube is seen running to the plating and not an antifouled casting.
    shape = ((leave + 0.6, 0.17), (leave + 0.2, 0.16), (leave - 0.25, 0.13), (leave - 0.5, 0.1), (leave - 0.56, 0.075))
    fine = []
    for (ya, ra), (yb, rb) in zip(shape, shape[1:]):
        steps = max(1, round((ya - yb) / 0.04))
        fine += [(ya + (yb - ya) * k / steps, ra + (rb - ra) * k / steps) for k in range(steps)]
    fine.append(shape[-1])
    start = len(side_gear.f)
    _revolve(side_gear, at(0), fwd, [((at(yd) - at(0)).length, r) for yd, r in fine], RED, sides=18)
    _outside_only(side_gear, start)
    # The bracket ahead of the screw: a barrel on the shaft and two arms up to the hull.
    by = S.BRACKET_YARD
    _revolve(side_gear, at(0), fwd, [((at(yd) - at(0)).length, r) for yd, r in ((by + 0.26, 0.07), (by + 0.2, 0.115), (by - 0.2, 0.115), (by - 0.26, 0.07))], RED, sides=18)
    for dx in (-0.6, 0.6):
        zz = L.Z(by + 0.05)
        hull = Vector((x + dx, L.hull_y(x + dx, zz) + 0.06, zz))
        _beam(side_gear, at(by), hull, (0, 0, 1), 0.24, 0.055, RED)
    # The screw: right-handed to starboard, so the pair turns outward.
    propeller(side_screw, centre, fwd, sc['diameter'] / 2, sc['hub'], sc['blades'], sc['pitch_ratio'], srgb(S.BRONZE), hand=1)
    # The rudder, its stock and the headbox that carries it under the counter.
    r = S.RUDDER
    zs = L.Z(r['yard_stock'])
    sections = []
    for i in range(7):
        f = i / 6
        y = r['top'] + (r['bottom'] - r['top']) * f
        chord = r['chord_top'] + (r['chord_bottom'] - r['chord_top']) * f
        if i == 6:
            chord *= 0.9
        sections.append((y, zs + r['balance'] * chord, chord))
    # The blade and its stock turn, so each rudder is a part of its own (`mover`); the headbox is fixed.
    side_rudder = Part('rudder', 'Antifouling')
    side_stock = Part('stock', 'Shaft steel')
    _foil(side_rudder, x, sections, RED, t=r['thickness'])
    hull_at = L.hull_y(x, zs)
    _foil(side_gear, x, [(hull_at + 0.05, zs + 0.24, 0.62), (r['top'] + 0.05, zs + 0.2, 0.52)], RED, t=0.22)
    side_stock.tube((x, r['top'] - 0.05, zs), (x, S.FLAT, zs), 0.06, colour=steel, sides=14)
    side_zinc = Part('rudder anodes', 'Zinc')
    for face in (1, -1):
        xr = x + face * 0.048
        side_zinc.box((xr - 0.016, -1.02, zs - 0.22), (xr + 0.016, -0.94, zs + 0.0), srgb(S.ZINC))
    for part, whole in ((side_gear, gear), (side_inboard, inboard), (side_shafts, shafts), (side_screw, screws)):
        whole.add(part)
        whole.add(part.mirrored())
    turning = []
    for name, part, look in (('Rudder', side_rudder, 'Antifouling'), ('Rudder stock', side_stock, 'Shaft steel'), ('Rudder anodes', side_zinc, 'Zinc')):
        for label, mover, half in (('starboard', 'rudder-s', part), ('port', 'rudder-p', part.mirrored())):
            piece = Part(f'{name}, {label}', look, smooth=look != 'Zinc', angle=40, mover=mover)
            piece.add(half)
            turning.append(piece)

    # ---- The bow thruster: the unit in the middle of the tunnel and the bars across each mouth.
    t = S.THRUSTER
    c = Vector((0.0, t['y'], L.Z(t['yard'])))
    dark = tint(RED, 0.8)
    _revolve(thruster, c, (1, 0, 0), [(-0.34, 0.0), (-0.28, 0.07), (-0.2, 0.1), (0.2, 0.1), (0.24, 0.085)], dark, sides=16)
    _beam(thruster, c + Vector((0, 0.06, 0)), c + Vector((0, t['radius'] + 0.01, 0)), (0, 0, 1), 0.26, 0.11, dark)
    propeller(thruster_screw, c + Vector((0.34, 0, 0)), (1, 0, 0), t['radius'] - 0.05, 0.085, 4, 0.75, srgb(S.BRONZE), hand=1, boss=False)
    _revolve(thruster_screw, c + Vector((0.34, 0, 0)), (1, 0, 0), [(-0.1, 0.085), (0.08, 0.085), (0.16, 0.0)], srgb(S.BRONZE), sides=16)
    for side in (1, -1):
        for dy in (-0.24, 0.0, 0.24):
            y = t['y'] + dy
            half = sqrt(t['radius'] ** 2 - dy ** 2) + 0.01
            ends = []
            for zz in (c.z - half, c.z + half):
                hx = L.hull_x(y, zz) - 0.03
                ends.append([(side * hx, y - 0.022, zz), (side * (hx - 0.02), y - 0.022, zz), (side * (hx - 0.02), y + 0.022, zz), (side * hx, y + 0.022, zz)])
            start = len(thruster.f)
            thruster.grid(ends, dark, close=True)
            thruster.orient(start, lambda q, yy=y: (0, q.y - yy, 0) if abs(q.y - yy) > 0.02 else (q.x, 0, 0))

    # ---- Sea chests: a grating let into the bilge each side of the engine room, where the cooling water comes in.
    for side in (1, -1):
        z0, z1 = L.Z(12.65), L.Z(13.35)
        mid = L.Z(13.0)
        pa, pb = L.psi_at(-1.62, mid), L.psi_at(-1.27, mid)
        rows = [[_conform(z0 + (z1 - z0) * i / 2, pa + (pb - pa) * j / 5, side, 0.004)[0] for j in range(6)] for i in range(3)]
        start = len(chest_dark.f)
        chest_dark.grid(rows, tint(RED, 0.32))
        chest_dark.orient(start, lambda q, s=side: (s, -0.6, 0))
        bars = [(z0 + (z1 - z0) * k / 8, 0.022) for k in range(9)]
        for zc, wide in bars:
            start = len(chests.f)
            rows = [[_conform(zz, pa + (pb - pa) * j / 5, side, 0.014)[0] for j in range(6)] for zz in (zc - wide / 2, zc + wide / 2)]
            chests.grid(rows, DARK_RED)
            chests.orient(start, lambda q, s=side: (s, -0.6, 0))
        for pp in (pa, pb):
            start = len(chests.f)
            dp = (pb - pa) * 0.07 * (1 if pp == pa else -1)
            rows = [[_conform(z0 + (z1 - z0) * i / 4, q, side, 0.014)[0] for q in (pp, pp + dp)] for i in range(5)]
            chests.grid(rows, DARK_RED)
            chests.orient(start, lambda q, s=side: (s, -0.6, 0))

    # ---- Zinc anodes: along the bottom and the side below the waterline, by the stern gear, on the rudders and skeg.
    for side in (1, -1):
        for yard in (10.5, 13.9, 17.0, 20.1, 23.5, 26.5):
            _anode(anodes, L.Z(yard), 0.5, side)
        for yard in (9.2, 12.0, 15.5, 19.0, 22.5, 25.8):
            _anode(anodes, L.Z(yard), L.psi_at(-0.55, L.Z(yard)), side)
        for yard, off in ((5.2, 2.5), (7.7, 2.6), (4.6, 0.8)):
            _anode(anodes, L.Z(yard), L.psi_at_x(off, L.Z(yard)), side)
    for yard in (5.6, 8.2):
        for face in (1, -1):
            xs = face * (S.SKEG['thickness'] / 2 + 0.012)
            anodes.box((xs - 0.016, L.KEEL + 0.5, L.Z(yard) - 0.15), (xs + 0.016, L.KEEL + 0.58, L.Z(yard) + 0.15), srgb(S.ZINC))
    return [keel, bilge, gear, inboard, shafts, screws, thruster, thruster_screw, chests, chest_dark, anodes] + turning


def _bilge_out(c, side, psi):
    """Which way a face of the bilge keel looks: away from the plate's middle surface, or outboard at the tip."""
    z = max(-L.HALF, min(L.HALF, c.z))
    p, n = Vector(L.shell_point(z, psi)), Vector(L.shell_normal(z, psi))
    girth = Vector((-n.y, n.x, 0)).normalized()
    rel = Vector((side * c.x, c.y, c.z)) - p
    g = rel.dot(girth)
    out = girth * (1 if g > 0 else -1) if abs(g) > 0.004 else n
    return (side * out.x, out.y, out.z)
