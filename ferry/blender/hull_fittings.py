"""
What stands in the spaces the hull gives a floor and bulkheads to, and what she carries at the bow:

  - the steering gear: a flat, the two rudder stocks in their carriers, a tiller on each joined by a tie bar, a ram on
    each tiller, two hydraulic power units, the hand pump, the stern tubes' oil header tanks, the emergency fire pump;
  - the shafting inside her: each intermediate shaft from its gearbox's flange through the engine room's aft bulkhead,
    over a plummer block, to the coupling on the tail shaft;
  - the two fresh-water tanks;
  - the bow thruster's motor on the crown of the tunnel, its platform and its starter;
  - the two chain lockers in the fore peak;
  - the two anchors, housed in their hawse pipes.

All but the anchors are fittings of rooms, so they lift with the machinery spaces (`group = 'machinery'`), where the
viewer lists those rooms; the anchors are part of the hull.
"""
from math import pi, cos, sin
from mathutils import Vector
import lines as L
import spec as S
from shipyard import Part, srgb, tint
from hull_appendages import shaft_y, _revolve, _frame

X = S.SHAFT_X
UP = (0, 1, 0)


def _cyl(part, a, b, r, colour, sides=16, r2=None):
    part.tube(a, b, r, r2, colour=colour, sides=sides)


def _plates(part, yard0, yard1, y, colour, breadth, gap=0.008, length=0.75, width=0.9, opening=None):
    """Floor plates laid in panels between two frames: each panel its own plate, a shade apart from its neighbours."""
    n = max(1, round((yard1 - yard0) / length))
    for i in range(n):
        za, zb = L.Z(yard0 + (yard1 - yard0) * i / n) + gap, L.Z(yard0 + (yard1 - yard0) * (i + 1) / n) - gap
        half = min(breadth(za), breadth(zb))
        m = max(1, round(2 * half / width))
        for j in range(m):
            xa, xb = -half + 2 * half * j / m + gap, -half + 2 * half * (j + 1) / m - gap
            if opening and opening(xa, xb, za, zb):
                continue
            shade = 1 + 0.035 * (((i * 7 + j * 13) % 5) - 2) / 2
            start = len(part.f)
            part.grid([[(xa, y, za), (xb, y, za)], [(xa, y, zb), (xb, y, zb)]], tint(colour, shade))
            part.orient(start, UP)


def _hex_bar(part, a, b, wa, wb, h, colour):
    """A flat bar from a to b, `wa` wide at a and `wb` at b, `h` deep: a tiller arm."""
    a, b = Vector(a), Vector(b)
    along = (b - a).normalized()
    side = along.cross(Vector(UP)).normalized()
    up = Vector(UP)
    ring = lambda c, w: [tuple(c + side * (sx * w / 2) + up * (sy * h / 2)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    start = len(part.f)
    part.grid([ring(a, wa), ring(b, wb)], colour, close=True)
    mid = (a + b) / 2
    part.orient(start, lambda c: (c - mid) - along * (c - mid).dot(along))
    for c, w, d in ((a, wa, -along), (b, wb, along)):
        start = len(part.f)
        part.polygon(ring(c, w), colour)
        part.orient(start, tuple(d))


def steering_gear():
    flat = Part('Steering-gear room, flat', 'Floor plate')
    gear = Part('Steering gear', 'Machinery paint', smooth=True, angle=40)
    bright = Part('Steering gear, bright steel', 'Shaft steel', smooth=True, angle=40)
    for p in (flat, gear, bright):
        p.group = 'machinery'
    y0 = S.FLAT
    zs = L.Z(S.RUDDER['yard_stock'])
    dark, grey, steel = srgb(S.DARK_GREY), srgb(S.LIGHT_GREY), srgb(S.STEEL)
    blue, red, brown = srgb(S.MOTOR_BLUE), srgb(S.FIRE_RED), srgb(S.OIL_BROWN)

    # ---- The flat: chequer plates from the transom's frames to the bulkhead, cut round each rudder carrier.
    breadth = lambda z: L.hull_x(y0 + 0.02, z) - 0.16
    _plates(flat, 0.35, 2.55, y0, srgb(S.FLOOR_PLATE), breadth)

    arm_y = y0 + 0.33                      # the level of the tillers
    reach = 0.62                           # a tiller's length, stock to tie-bar pin
    for side in (1, -1):
        x = side * X
        # The rudder carrier on the flat, the head of the stock above it, the tiller keyed to the stock.
        _revolve(gear, (x, y0, zs), UP, [(0.0, 0.25), (0.035, 0.25), (0.035, 0.17), (0.15, 0.17), (0.16, 0.09)], dark, sides=20)
        _cyl(bright, (x, y0 + 0.15, zs), (x, arm_y + 0.13, zs), 0.06, steel)
        _revolve(gear, (x, arm_y - 0.085, zs), UP, [(0.0, 0.09), (0.0, 0.125), (0.17, 0.125), (0.17, 0.065)], dark, sides=20)
        _hex_bar(gear, (x, arm_y, zs + 0.09), (x, arm_y, zs + reach), 0.17, 0.10, 0.085, dark)
        _revolve(gear, (x, arm_y - 0.06, zs + reach), UP, [(0.0, 0.0), (0.0, 0.065), (0.12, 0.065), (0.12, 0.0)], dark, sides=14)
        _cyl(bright, (x, arm_y - 0.09, zs + reach), (x, arm_y + 0.11, zs + reach), 0.022, steel, sides=10)
        # The ram: a cylinder trunnioned on a stool outboard, its rod pinned to the tiller two thirds along it.
        pin = zs + 0.42
        out = side * (X + 1.16)
        gear.box((min(out, out + side * 0.14), y0, pin - 0.11), (max(out, out + side * 0.14), arm_y + 0.09, pin + 0.11), dark)
        _cyl(gear, (side * (X + 1.14), arm_y, pin), (side * (X + 0.52), arm_y, pin), 0.062, grey, sides=16)
        _cyl(gear, (side * (X + 0.53), arm_y, pin), (side * (X + 0.47), arm_y, pin), 0.075, dark, sides=16)
        _cyl(bright, (side * (X + 0.50), arm_y, pin), (side * (X + 0.11), arm_y, pin), 0.027, steel, sides=12)
        gear.box((min(x + side * 0.02, x + side * 0.13), arm_y - 0.065, pin - 0.05), (max(x + side * 0.02, x + side * 0.13), arm_y + 0.065, pin + 0.05), dark)
        # Two pipes from the power unit to the ram, along the flat and up to the cylinder's ends.
        for k, end in enumerate((X + 1.08, X + 0.58)):
            run = L.Z(2.18) + 0.05 * k
            pts = [(side * 0.62, y0 + 0.16, run), (side * end, y0 + 0.16, run), (side * end, y0 + 0.16, pin + 0.09), (side * end, arm_y - 0.05, pin + 0.09)]
            for a, b in zip(pts, pts[1:]):
                _cyl(bright, a, b, 0.012, srgb(S.FLANGE), sides=8)
        # A hydraulic power unit each side of the centreline against the forward bulkhead: a tank on feet, a motor and
        # its pump standing on the tank, a filter.
        ux = side * 0.62
        z0, z1 = L.Z(2.1), L.Z(2.5)
        gear.box((ux - 0.27, y0 + 0.1, z0), (ux + 0.27, y0 + 0.5, z1), grey)
        for fx in (-0.22, 0.22):
            for fz in (z0 + 0.05, z1 - 0.05):
                gear.box((ux + fx - 0.025, y0, fz - 0.025), (ux + fx + 0.025, y0 + 0.1, fz + 0.025), dark)
        _cyl(gear, (ux - 0.08, y0 + 0.5, (z0 + z1) / 2), (ux - 0.08, y0 + 0.58, (z0 + z1) / 2), 0.07, dark)
        _cyl(gear, (ux - 0.08, y0 + 0.58, (z0 + z1) / 2), (ux - 0.08, y0 + 0.9, (z0 + z1) / 2), 0.105, blue, sides=18)
        _cyl(gear, (ux - 0.08, y0 + 0.9, (z0 + z1) / 2), (ux - 0.08, y0 + 0.94, (z0 + z1) / 2), 0.11, dark, sides=18)
        _cyl(gear, (ux + 0.15, y0 + 0.5, z0 + 0.12), (ux + 0.15, y0 + 0.66, z0 + 0.12), 0.045, srgb(S.FLANGE), sides=12)
        gear.box((ux + 0.27, y0 + 0.2, z0 + 0.1), (ux + 0.285, y0 + 0.44, z0 + 0.15), srgb(0xd8d2b8))      # the sight glass
        # The stern tube's oil header tank, high on the forward bulkhead, its pipe led down through the flat.
        hx = side * 2.35
        hz = L.Z(2.6) - 0.04
        gear.box((hx - 0.16, 1.2, hz - 0.3), (hx + 0.16, 1.62, hz), brown)
        gear.box((hx - 0.2, 1.14, hz - 0.3), (hx + 0.2, 1.2, hz), dark)
        _cyl(bright, (hx, 1.2, hz - 0.15), (hx, y0, hz - 0.15), 0.012, srgb(S.FLANGE), sides=8)

    # The tie bar joins the two tillers, so the rudders turn together.
    _cyl(gear, (-X, arm_y + 0.085, zs + reach), (X, arm_y + 0.085, zs + reach), 0.032, dark, sides=14)
    for side in (1, -1):
        gear.box((side * X - 0.05, arm_y + 0.05, zs + reach - 0.05), (side * X + 0.05, arm_y + 0.12, zs + reach + 0.05), dark)

    # The emergency hand pump on its pedestal on the centreline, its lever up.
    hz = L.Z(2.3)
    gear.box((-0.09, y0, hz - 0.09), (0.09, y0 + 0.55, hz + 0.09), grey)
    _cyl(gear, (0.0, y0 + 0.55, hz), (0.0, y0 + 0.66, hz), 0.06, dark)
    _cyl(bright, (0.0, y0 + 0.62, hz), (0.0, y0 + 1.15, hz - 0.36), 0.014, steel, sides=10)
    _cyl(gear, (0.0, y0 + 1.15, hz - 0.36), (0.0, y0 + 1.27, hz - 0.44), 0.022, red, sides=10)

    # The rudder-angle transmitter on the port stock, and its link.
    gear.box((X - 0.32, arm_y + 0.02, zs - 0.34), (X - 0.2, arm_y + 0.16, zs - 0.22), grey)
    _cyl(bright, (X - 0.26, arm_y + 0.12, zs - 0.28), (X, arm_y + 0.12, zs), 0.008, steel, sides=6)

    # The emergency fire pump, outside the engine room: a pump and its motor on a bed to starboard aft, its own sea
    # suction with a valve, its delivery led up to the deck.
    px, pz = -2.55, L.Z(0.95)
    gear.box((px - 0.2, y0, pz - 0.42), (px + 0.2, y0 + 0.07, pz + 0.42), dark)
    _cyl(gear, (px, y0 + 0.24, pz - 0.36), (px, y0 + 0.24, pz + 0.02), 0.115, blue, sides=18)
    _cyl(gear, (px, y0 + 0.24, pz + 0.02), (px, y0 + 0.24, pz + 0.1), 0.06, dark, sides=12)
    _cyl(gear, (px, y0 + 0.24, pz + 0.1), (px, y0 + 0.24, pz + 0.3), 0.14, red, sides=18)
    _cyl(gear, (px, y0 + 0.24, pz + 0.3), (px, y0 + 0.24, pz + 0.4), 0.055, red, sides=12)
    _cyl(gear, (px, y0 + 0.24, pz + 0.4), (px, y0 - 0.02, pz + 0.4), 0.05, red, sides=12)
    _revolve(gear, (px, y0 + 0.12, pz + 0.4), (1, 0, 0), [(0.05, 0.0), (0.05, 0.09), (0.065, 0.09), (0.065, 0.0)], red, sides=12)
    _cyl(gear, (px, y0 + 0.36, pz + 0.2), (px, 1.95, pz + 0.2), 0.04, red, sides=12)
    return [flat, gear, bright]


def shafting():
    """The intermediate shafts and their fittings, in the engine room and the shaft space."""
    paint = Part('Shafting: couplings, bearings, seats', 'Machinery paint', smooth=True, angle=40)
    bright = Part('Intermediate shafts', 'Shaft steel', smooth=True, angle=40)
    for p in (paint, bright):
        p.group = 'machinery'
    steel, flange, green = srgb(S.STEEL), srgb(S.FLANGE), srgb(S.ENGINE_GREEN)
    g = S.GEARBOX_FLANGE
    for side in (1, -1):
        x = side * X
        at = lambda yard: Vector((x, shaft_y(yard), L.Z(yard)))
        fwd = (at(9.0) - at(8.0)).normalized()
        along = lambda yard: (at(yard) - at(0)).length
        ring = lambda profile, colour, part=paint: _revolve(part, at(0), fwd, [(along(yd), r) for yd, r in profile], colour, sides=18)
        # The shaft, from the half coupling bolted to the gearbox's flange to the coupling on the tail shaft.
        bright.tube(at(g['yard'] - 0.04), at(S.SHAFT_COUPLING), S.SHAFT_RADIUS, colour=steel, sides=14)
        ring([(g['yard'], 0.07), (g['yard'], g['radius']), (g['yard'] - 0.045, g['radius']), (g['yard'] - 0.05, 0.07)], flange)
        # The gland where it passes through the engine room's aft bulkhead.
        ring([(8.42, 0.075), (8.42, 0.15), (8.4, 0.15), (8.4, 0.11), (8.31, 0.11), (8.3, 0.07)], flange)
        # The plummer block: its housing round the shaft, its foot, and the seat that carries it down to the floor.
        pb = S.PLUMMER_BLOCK
        ring([(pb + 0.1, 0.07), (pb + 0.095, 0.13), (pb - 0.095, 0.13), (pb - 0.1, 0.07)], green)
        c = at(pb)
        foot = c.y - 0.2
        paint.box((x - 0.22, foot, c.z - 0.085), (x + 0.22, foot + 0.09, c.z + 0.085), green)
        floor = L.hull_y(X, c.z) + 0.2
        paint.box((x - 0.19, floor, c.z - 0.11), (x + 0.19, foot, c.z + 0.11), tint(srgb(S.PRIMER), 0.86))
        # The pair of flanges that couples it to the tail shaft.
        k = S.SHAFT_COUPLING
        ring([(k + 0.05, 0.07), (k + 0.045, 0.12), (k - 0.045, 0.12), (k - 0.05, 0.07)], flange)
    return [paint, bright]


def fresh_water_tanks():
    tanks = Part('Fresh-water tanks', 'Machinery paint')
    flat = Part('Fresh-water tanks, flat', 'Floor plate')
    pipes = Part('Fresh-water tanks, pipes', 'Shaft steel', smooth=True, angle=40)
    for p in (tanks, flat, pipes):
        p.group = 'machinery'
    blue, dark = srgb(S.WATER_BLUE), srgb(S.DARK_GREY)
    y0 = S.FLAT
    z0, z1 = L.Z(2.8), L.Z(4.85)
    # The gangway between the two tanks.
    _plates(flat, 2.66, 4.95, y0, srgb(S.FLOOR_PLATE), lambda z: 0.66)
    for side in (1, -1):
        xa, xb = sorted((side * 0.8, side * 3.2))
        # 6 m³ each: 2.4 × 2.05 × 1.22 m, standing on three bearers.
        tanks.box((xa, y0 + 0.08, z0), (xb, y0 + 1.3, z1), blue)
        for zz in (z0 + 0.2, (z0 + z1) / 2, z1 - 0.2):
            tanks.box((xa + 0.05, y0, zz - 0.05), (xb - 0.05, y0 + 0.08, zz + 0.05), dark)
        # Stiffening bands, the manhole on top, the level gauge on the gangway side.
        for zz in (z0 + 0.68, z1 - 0.68):
            tanks.box((xa - 0.015, y0 + 0.08, zz - 0.03), (xb + 0.015, y0 + 1.315, zz + 0.03), tint(blue, 0.9))
        _revolve(tanks, ((xa + xb) / 2, y0 + 1.3, z0 + 0.6), UP, [(0.0, 0.28), (0.03, 0.28), (0.03, 0.24), (0.045, 0.24), (0.045, 0.0)], tint(blue, 0.85), sides=20)
        inner = side * 0.8
        tanks.box((min(inner, inner - side * 0.02), y0 + 0.2, z1 - 0.34), (max(inner, inner - side * 0.02), y0 + 1.2, z1 - 0.3), srgb(0xd8e2e6))
        # Filling and air pipes up to the deck, the suction valve low on the gangway side.
        pipes.tube((side * 1.2, y0 + 1.3, z1 - 0.25), (side * 1.2, L.CAR - 0.05, z1 - 0.25), 0.03, colour=blue, sides=10)
        pipes.tube((side * 1.45, y0 + 1.3, z1 - 0.25), (side * 1.45, L.CAR - 0.05, z1 - 0.25), 0.02, colour=blue, sides=8)
        pipes.tube((inner, y0 + 0.22, z0 + 0.3), (inner - side * 0.14, y0 + 0.22, z0 + 0.3), 0.025, colour=blue, sides=10)
        _revolve(tanks, (inner - side * 0.14, y0 + 0.22, z0 + 0.3), UP, [(0.0, 0.035), (0.09, 0.035), (0.09, 0.012), (0.14, 0.012), (0.14, 0.06), (0.155, 0.06), (0.155, 0.0)], blue, sides=12)
    return [tanks, flat, pipes]


def thruster_room():
    flat = Part('Thruster room, platform', 'Floor plate')
    gear = Part('Bow thruster motor and starter', 'Machinery paint', smooth=True, angle=40)
    for p in (flat, gear):
        p.group = 'machinery'
    t = S.THRUSTER
    zc, crown = L.Z(t['yard']), t['y'] + t['radius']
    y0 = S.THRUSTER_PLATFORM
    blue, dark, grey = srgb(S.MOTOR_BLUE), srgb(S.DARK_GREY), srgb(S.LIGHT_GREY)
    # The platform lies just over the crown of the tunnel, open round the motor.
    breadth = lambda z: L.hull_x(y0 + 0.02, z) - 0.2
    near = lambda xa, xb, za, zb: xa < 0.5 and xb > -0.5 and za < zc + 0.5 and zb > zc - 0.5
    _plates(flat, 27.58, 30.42, y0, srgb(S.FLOOR_PLATE), breadth, opening=near)
    # The 75 kW motor stands upright on the tunnel: its seat on the crown, the lantern over the coupling, the motor with
    # its terminal box and its fan cowl.
    _revolve(gear, (0, crown - 0.02, zc), UP, [(0.0, 0.3), (0.07, 0.3), (0.07, 0.2), (0.4, 0.2), (0.4, 0.3), (0.44, 0.3)], dark, sides=22)
    _revolve(gear, (0, crown + 0.42, zc), UP, [(0.0, 0.3), (0.0, 0.27), (0.66, 0.27), (0.66, 0.28), (0.78, 0.28), (0.8, 0.2), (0.8, 0.0)], blue, sides=24)
    gear.box((0.26, crown + 0.62, zc - 0.1), (0.42, crown + 0.86, zc + 0.1), blue)
    for k in range(10):
        a = 2 * pi * k / 10 + 0.3
        if abs(cos(a)) > 0.9 and cos(a) > 0:
            continue
        gear.box((0.27 * cos(a) - 0.012, crown + 0.5, 0.27 * sin(a) + zc - 0.012), (0.27 * cos(a) + 0.012, crown + 1.04, 0.27 * sin(a) + zc + 0.012), tint(blue, 0.9))
    # The starter cabinet against the aft bulkhead, with its door, handle and two lamps.
    za = L.Z(27.5) + 0.1
    gear.box((1.3, y0, za), (2.1, y0 + 1.5, za + 0.38), grey)
    gear.box((1.34, y0 + 0.06, za + 0.38), (2.06, y0 + 1.44, za + 0.39), tint(grey, 0.93))
    gear.box((2.0, y0 + 0.7, za + 0.39), (2.03, y0 + 0.86, za + 0.42), dark)
    for k, c in enumerate((0x3f8a5a, 0xc2412f)):
        _cyl(gear, (1.5 + 0.12 * k, y0 + 1.3, za + 0.39), (1.5 + 0.12 * k, y0 + 1.3, za + 0.41), 0.025, srgb(c), sides=10)
    # Its cable, from the cabinet along the platform to the motor's terminal box.
    for a, b in (((1.7, y0 + 0.04, za + 0.38), (1.7, y0 + 0.04, zc)), ((1.7, y0 + 0.04, zc), (0.46, y0 + 0.04, zc)), ((0.46, y0 + 0.04, zc), (0.42, crown + 0.66, zc))):
        _cyl(gear, a, b, 0.022, dark, sides=8)
    return [flat, gear]


def chain_lockers():
    lockers = Part('Chain lockers', 'Primer')
    lockers.group = 'machinery'
    primer = srgb(S.PRIMER)
    za, zb = L.Z(31.3), L.Z(32.5)
    for side in (1, -1):
        xa, xb = sorted((side * 1.0, side * 2.2))
        lockers.box((xa, -0.25, za), (xb, L.CAR - 0.04, zb), primer)
        # The door in its after side, and the pipe that leads the cable down from the windlass.
        lockers.box((xa + 0.35, 0.2, za - 0.012), (xb - 0.35, 0.95, za), tint(primer, 0.84))
    return [lockers]


def anchors():
    """A 480 kg stockless anchor each side of the bow, hove up into its hawse pipe: the head and flukes against the plating."""
    part = Part('Anchors', 'Machinery paint', smooth=True, angle=35)
    mouth = Part('Hawse pipe mouths', 'Marking')
    black = srgb(S.BLACK)
    for side in (1, -1):
        z = L.Z(32.2)
        psi = L.psi_at(1.42, z)
        m = Vector(L.shell_point(z, psi))
        n = Vector(L.shell_normal(z, psi))
        fwd = (Vector((0, 0, 1)) - n * n.z).normalized()
        up = n.cross(fwd) * -1
        if up.y < 0:
            up = -up
        place = lambda a, b, c: tuple(Vector((side, 1, 1)) * (m + fwd * a + up * b + n * c))
        centre = Vector(place(0, 0, 0))
        out = Vector((side * n.x, n.y, n.z))
        # The bolster round the mouth of the pipe, and the dark of the pipe within it.
        _revolve(part, centre, out, [(0.0, 0.27), (0.045, 0.25), (0.07, 0.2), (0.06, 0.15), (0.0, 0.15)], srgb(S.WHITE), sides=22)
        start = len(mouth.f)
        mouth.polygon([place(0.15 * cos(2 * pi * k / 20), 0.15 * sin(2 * pi * k / 20), 0.004) for k in range(20)], tint(black, 0.6))
        mouth.orient(start, tuple(out))
        # The shank, up into the pipe; the head across its foot; the two flukes lying up the plating beside the pipe.
        def bar(points, colour=black):
            rows = [[place(*q) for q in ring] for ring in points]
            start = len(part.f)
            part.grid(rows, colour, close=True)
            mid = sum((Vector(q) for row in rows for q in row), Vector()) / sum(len(r) for r in rows)
            part.orient(start, lambda c: c - mid)
            for row, k in ((rows[0], 0), (rows[-1], -1)):
                start = len(part.f)
                part.polygon(row, colour)
                part.orient(start, lambda c: c - mid)
        sq = lambda a, b, c, w, h: [(a - w, b, c - h), (a + w, b, c - h), (a + w, b, c + h), (a - w, b, c + h)]
        bar([sq(0, -0.52, 0.12, 0.055, 0.05), sq(0, -0.05, 0.1, 0.05, 0.045), sq(0, 0.1, 0.03, 0.045, 0.04)])
        bar([[(-0.34, -0.66, 0.03), (0.34, -0.66, 0.03), (0.34, -0.66, 0.2), (-0.34, -0.66, 0.2)],
             [(-0.36, -0.46, 0.03), (0.36, -0.46, 0.03), (0.36, -0.46, 0.21), (-0.36, -0.46, 0.21)]])
        for k in (-1, 1):
            bar([[(k * 0.36, -0.5, 0.03), (k * 0.16, -0.5, 0.03), (k * 0.16, -0.5, 0.13), (k * 0.36, -0.5, 0.13)],
                 [(k * 0.4, -0.05, 0.03), (k * 0.2, -0.05, 0.03), (k * 0.2, -0.05, 0.1), (k * 0.4, -0.05, 0.1)],
                 [(k * 0.36, 0.3, 0.03), (k * 0.27, 0.3, 0.03), (k * 0.27, 0.3, 0.06), (k * 0.36, 0.3, 0.06)]])
    return [part, mouth]


def build():
    return steering_gear() + shafting() + fresh_water_tanks() + thruster_room() + chain_lockers() + anchors()
