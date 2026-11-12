"""
Deck fittings: the lifeboat itself (the station it hangs in is in fittings_boats.py).

An open glass-fibre lifeboat of the 1970s, double-ended, 7.30 x 2.60 x 1.10 m, with a small diesel. Drawn about its own
origin: the underside of its keel amidships, x to port, y up, z toward its bow.

Sizes: 7.3 m is the least length the rules of her time allowed a ship's lifeboat [R classic-ferries-1958-1978, section 4];
breadth and depth are those of the 7.3 m glass-fibre boats of the period as the yard recalls them [M]. By the rule of
that time (cubic capacity 0.6 x L x B x D, 0.283 cubic metres a person) such a boat is certified for 44 persons, and that is
what is lettered on her: not 60, which asks for a boat of about 8.0 x 2.9 x 1.22 m.
"""
from math import pi, sin, cos, radians, hypot, atan2
from mathutils import Vector
from shipyard import tint, srgb
from fittings_kit import *          # noqa: F401,F403

LOA, BEAM, DEPTH, SHEER = 7.30, 2.60, 1.10, 0.28
HALF = LOA / 2
SKIN = 0.012
PERSONS = int(0.6 * LOA * BEAM * DEPTH / 0.283)            # 44
HOOK_Z = 2.60                                               # the lifting hooks, from amidships
HOOK_Y = 1.25                                               # where the floating block's link bears in the hook
BLOCK_Y = 1.75                                              # the floating block's sheave, over the cover's ridge
THWART = 0.62                                               # the side benches' tops and the thwarts' undersides
FLOOR = 0.20                                                # the bottom boards' tops
ENDDECK = 0.86
END_T = 16 / 24                                             # where the end decks begin (a station of the skin)
KEEL_T = 0.745                                              # how far her straight keel runs
SPAR_T = 0.644                                              # the ridge spar's ends, short of the lifting hooks
INSIDE = srgb(0xdc6a24)
NI, NJ = 48, 14


def hb(t):
    """Half her breadth at the gunwale, t = -1 at the sternpost to +1 at the stem."""
    return max(0.035, BEAM / 2 * (1 - abs(t) ** 2.6) ** 0.55)


def keel_y(t):
    """Her keel line: straight amidships, rising in a curve to the stem and the sternpost."""
    a = max(0.0, (abs(t) - 0.70) / 0.30)
    return 1.02 * a ** 2.4


def gun_y(t):
    return DEPTH + SHEER * t * t


def fullness(t):
    return 2.9 - 1.5 * abs(t) ** 1.5


def section(t, s):
    """A point of her outer skin: s = 0 at the keel to 1 at the gunwale. (half breadth, height)"""
    b, y0, n = hb(t), keel_y(t), fullness(t)
    d = gun_y(t) - y0
    th = (1 - s) * pi / 2
    return b * cos(th) ** (2 / n), y0 + d * (1 - sin(th) ** (2 / n))


def half_at(t, y, inner=True):
    """Half her breadth at the height y (inside her skin, or outside)."""
    b, y0, n = hb(t), keel_y(t), fullness(t)
    d = gun_y(t) - y0
    f = min(1.0, max(0.0, 1 - (y - y0) / d))
    x = b * max(0.0, 1 - f ** n) ** (1 / n)
    return max(0.0, x - (SKIN if inner else 0.0))


def bottom_at(t, x):
    """The height of her inner skin over the keel at the half breadth x."""
    b, y0, n = hb(t), keel_y(t), fullness(t)
    d = gun_y(t) - y0
    f = max(0.0, 1 - min(1.0, abs(x) / b) ** n) ** (1 / n)
    return y0 + d * (1 - f) + SKIN


def out_normal(t, y, side):
    """The way her outer skin looks at the height y on one side."""
    e = 0.01
    x0, x1 = half_at(t, y - e, False), half_at(t, y + e, False)
    z0, z1 = half_at(t - e / HALF, y, False), half_at(t + e / HALF, y, False)
    n = Vector((1.0, -(x1 - x0) / (2 * e), -(z1 - z0) / (2 * e)))
    n.normalize()
    return Vector((side * n.x, n.y, n.z))


def ridge(t):
    """The cover's ridge: level along the spar, then down to the stem head and the sternpost's."""
    if abs(t) <= SPAR_T:
        return 1.66
    return 1.66 - 0.26 * (abs(t) - SPAR_T) / (1 - SPAR_T)


def _skin(p, rows, colour, want, smooth=True, close=False):
    st = len(p.f)
    p.grid(rows, colour, close=close)
    for k in range(st, len(p.f)):
        p.s[k] = smooth
    p.orient(st, want)


def lifeboat(kit, mv, ship='CHISUM', port='MINATO', number=1, rescue=False, cover=True):
    """
    The boat, with all that is in her: skin and inner skin, gunwale and rubbing strake, keel with its shoe, stem bands, bilge
    grab rails, grab lines in bights with their floats; side benches over the buoyancy tanks, end decks, thwarts with knees and
    pillars, bottom boards on bearers; the engine in its casing with starting handle, gear lever, throttle, lagged exhaust
    through her side, fuel tank, shaft, three-bladed screw in a guard on a shoe, rudder with its tiller unshipped; lifting
    hooks fore and aft on keel plates with the release gear's handle aft; mast, oars and boat hook lashed along the thwarts,
    crutches on their chains, water breakers, bucket, the painter coiled forward; her ship's name and port, her number, her
    size and her persons lettered on each side, reflective tape along her. Under a cover of orange canvas laced down over a
    ridge spar when `cover` says so.
    """
    P = lambda key: kit.p(key, mv)
    grp, wood, galv, rope, mark, teak = P('grp'), P('wood'), P('galv'), P('rope'), P('mark'), P('teak')
    paint, steel, bronze, plastic = P('paint'), P('steel'), P('bronze'), P('plastic')
    hull_c = ORANGE if rescue else WHITE
    ts = [-1 + 2 * i / NI for i in range(NI + 1)]
    ss = [j / NJ for j in range(NJ + 1)]
    centre = lambda c: Vector((0.0, 0.8, c.z * 0.9))

    # ---- the outer skin and the inner skin, closed at stem and sternpost
    def row(t, inner):
        pts = [section(t, ss[j]) for j in range(NJ, -1, -1)]          # from the gunwale down to the keel
        if inner:                                                    # 12 mm inside, square to the skin
            moved = []
            for k, (x, y) in enumerate(pts):
                if k == len(pts) - 1:
                    moved.append((0.0, y + SKIN))
                    continue
                a, b = pts[max(k - 1, 0)], pts[k + 1]
                tx, ty = b[0] - a[0], b[1] - a[1]
                ln = hypot(tx, ty) or 1.0
                moved.append((max(0.0, x + ty / ln * SKIN), y - tx / ln * SKIN))
            pts = moved
        z = t * HALF
        return [(x, y, z) for x, y in pts] + [(-x, y, z) for x, y in reversed(pts[:-1])]

    outer = [row(t, False) for t in ts]
    inner = [row(t, True) for t in ts]
    _skin(grp, outer, hull_c, lambda c: c - centre(c))
    _skin(grp, inner, INSIDE, lambda c: centre(c) - c)
    for r, way in ((outer[0], -1), (outer[-1], 1)):
        st = len(grp.f)
        grp.polygon(r, hull_c)
        grp.orient(st, (0, 0, way))

    def along(part, fn, colour, t0=-1.0, t1=1.0):
        """A moulding or a strake the length of her, each side: its section at each station, closed at its ends."""
        for side in (1, -1):
            # (a hair longer than her skin, so that its ends do not lie in the plane of her stem's)
            rows = [[(side * x, y, t * (HALF + 0.007)) for x, y in fn(t)] for t in ts if t0 - 1e-9 <= t <= t1 + 1e-9]
            mids = [(r[0][2], sum(q[0] for q in r) / len(r), sum(q[1] for q in r) / len(r)) for r in rows]

            def want(c, mids=mids):
                _, mx, my = min(mids, key=lambda m: abs(m[0] - c.z))
                return Vector((c.x - mx, c.y - my, 0.0))
            _skin(part, rows, colour, want, close=True)
            for r, way in ((rows[0], -1), (rows[-1], 1)):
                st = len(part.f)
                part.polygon(r, colour)
                part.orient(st, (0, 0, way))

    # ---- the gunwale: a moulded capping on the skin's edge, and the rubbing strake under it outside
    along(grp, lambda t: [(hb(t) + 0.012, gun_y(t) - 0.035), (hb(t) + 0.012, gun_y(t) + 0.012), (max(0.004, hb(t) - 0.075), gun_y(t) + 0.012),
                          (max(0.004, hb(t) - 0.075), gun_y(t) - 0.035)], tint(hull_c, 0.95))

    def strake(t):
        y = gun_y(t) - 0.105
        x = half_at(t, y, False)
        return [(x - 0.004, y - 0.030), (x + 0.030, y - 0.020), (x + 0.040, y), (x + 0.030, y + 0.020), (x - 0.004, y + 0.030)]
    along(P('rubber'), strake, BLACK)

    # ---- the keel: moulded under her the length of her straight keel, a galvanised strip under it, a band up each end
    kz = KEEL_T * HALF
    grp.block((-0.045, -0.070, -kz), (0.045, 0.012, kz), tint(hull_c, 0.93), r=0.012)
    galv.block((-0.022, -0.078, -kz + 0.01), (0.022, -0.068, kz - 0.01), GALV, r=0.002)
    for end in (1, -1):
        pts = []
        for k in range(15):
            t = KEEL_T + (1 - KEEL_T) * k / 14
            pts.append((0.0, keel_y(t) - 0.010 - 0.058 * (1 - k / 14) ** 2, end * (t * HALF + 0.006 * k / 14)))
        pts.append((0.0, gun_y(1.0) + 0.02, end * (HALF + 0.006)))
        sweep(galv, pts, 0.013, GALV)

    # ---- bilge grab rails: a wooden rail standing off the turn of the bilge on blocks, each side
    for side in (1, -1):
        pts, blocks = [], []
        for k in range(21):
            t = -0.5 + k / 20
            x, y = section(t, 0.42)
            n = out_normal(t, y, side)
            base = Vector((side * x, y, t * HALF))
            pts.append(tuple(base + n * 0.062))
            if k % 4 == 0:
                blocks.append((base, n))
        sweep(wood, pts, 0.018, MAHOGANY)
        for base, n in blocks:
            bar(wood, tuple(base - n * 0.004), tuple(base + n * 0.062), 0.045, 0.09, MAHOGANY, up=FWD)

    # ---- grab lines: a rope round her under the rubbing strake, made fast every 0.6 m and hanging in bights, a float in each
    for side in (1, -1):
        n_b = 10
        for k in range(n_b + 1):
            ta = -0.80 + 1.6 * k / n_b
            y = gun_y(ta) - 0.142
            galv.ring((side * (half_at(ta, y, False) + 0.010), y, ta * HALF), PORT, 0.014, 0.004, GALV)        # the becket: an eye under the strake
            if k == n_b:
                break
            tb = -0.80 + 1.6 * (k + 1) / n_b
            pts = []
            for i in range(13):
                u = i / 12
                t = ta + (tb - ta) * u
                y = gun_y(t) - 0.150 - 0.22 * sin(pi * u) ** 0.85
                pts.append((side * (half_at(t, y, False) + 0.016), y, t * HALF))
            sweep(rope, pts, 0.008, CREAM, lay=3)
            mid = pts[6]
            lathe(wood, (mid[0], mid[1], mid[2] - 0.055), FWD, [(0.0, 0.012), (0.02, 0.026), (0.09, 0.026), (0.11, 0.012)], tint(MAHOGANY, 1.3))

    # ---- her insides: side benches over the buoyancy tanks, the end decks over the end tanks and their bulkheads
    for side in (1, -1):
        top, front = [], []
        for t in ts:
            if abs(t) > END_T + 1e-9:
                continue
            xo = half_at(t, THWART) + 0.003
            xi = max(0.10, xo - 0.42)
            z = t * HALF
            top.append([(side * xo, THWART, z), (side * xi, THWART, z)])
            front.append([(side * xi, THWART, z), (side * xi, bottom_at(t, xi) - 0.003, z)])
        _skin(grp, top, tint(INSIDE, 1.05), UP, smooth=False)
        _skin(grp, front, tint(INSIDE, 0.90), lambda c, s=side: Vector((-s, 0.0, 0.0)), smooth=False)
    for end in (1, -1):
        rows = []
        for t in ts:
            if abs(t) >= END_T - 1e-9 and t * end > 0:
                x = half_at(t, ENDDECK) + 0.003
                rows.append([(x, ENDDECK, t * HALF), (-x, ENDDECK, t * HALF)])
        _skin(grp, rows, tint(INSIDE, 1.05), UP, smooth=False)
        t = end * END_T
        half = [(x, y) for (x, y, _) in inner[ts.index(min(ts, key=lambda q: abs(q - t)))][:NJ + 1] if y < ENDDECK]
        half = [(half_at(t, ENDDECK) + 0.003, ENDDECK)] + half
        st = len(grp.f)
        grp.polygon([(x, y, t * HALF) for x, y in half] + [(-x, y, t * HALF) for x, y in reversed(half[:-1])], tint(INSIDE, 0.90))
        grp.orient(st, (0, 0, -end))

    # ---- bottom boards: eleven planks fore and aft on four bearers, each bearer on two chocks on her skin
    for k in range(-5, 6):
        x = 0.14 * k
        reach = END_T * HALF - 0.03
        while reach > 0.5 and (half_at(reach / HALF, THWART) - 0.42) < abs(x) + 0.075:
            reach -= 0.05
        teak.block((x - 0.062, FLOOR - 0.022, -reach), (x + 0.062, FLOOR, reach), tint(TEAK, 0.92 + 0.04 * (k % 3)), r=0.004)
    for z in (-2.0, -0.7, 0.7, 2.0):
        w = min(0.78, half_at(z / HALF, THWART) - 0.44)
        teak.block((-w, FLOOR - 0.060, z - 0.03), (w, FLOOR - 0.022, z + 0.03), tint(TEAK, 0.8), r=0.003)
        for sx in (-1, 1):
            xb = sx * 0.34
            teak.block((xb - 0.03, bottom_at(z / HALF, 0.37) - 0.008, z - 0.025), (xb + 0.03, FLOOR - 0.058, z + 0.025), tint(TEAK, 0.8), r=0.003)

    # ---- thwarts on the side benches, each with a knee to her side and a pillar under its middle
    top = THWART + 0.038
    for z in (2.05, 1.05, 0.05, -1.95):
        t = z / HALF
        w = half_at(t, THWART + 0.02) - 0.003
        wa, wf = half_at((z - 0.115) / HALF, THWART) - 0.002, half_at((z + 0.115) / HALF, THWART) - 0.002      # its ends cut to her side
        prism(wood, [(-wa, THWART, z - 0.115), (wa, THWART, z - 0.115), (wf, THWART, z + 0.115), (-wf, THWART, z + 0.115)], (0, top - THWART, 0), MAHOGANY)
        w = min(wa, wf)
        for side in (1, -1):
            xk = side * (half_at(t, THWART + 0.26) + 0.001)
            prism(galv, [(side * (w - 0.002), top, z - 0.02), (side * (w - 0.22), top, z - 0.02), (xk, THWART + 0.26, z - 0.02)], (0, 0, 0.04), GALV)
        if z != -1.95:
            galv.tube((0.0, FLOOR, z + 0.09), (0.0, THWART, z + 0.09), 0.020, colour=GALV)
            plate_disc(galv, (0.0, FLOOR, z + 0.09), UP, 0.05, 0.006, GALV)

    # ---- crutches (rowlocks) in their sockets on the gunwale, each on its chain: four a side
    for side in (1, -1):
        for z in (2.35, 1.35, 0.35, -0.65):
            t = z / HALF
            x, y = side * (hb(t) - 0.032), gun_y(t) + 0.012
            galv.tube((x, y, z), (x, y + 0.010, z), 0.024, colour=GALV)                       # the socket's plate, its bush through the capping
            galv.tube((x, y + 0.010, z), (x, y + 0.016, z), 0.013, colour=tint(GALV, 0.7))
            # the crutch itself, unshipped and hanging inside on its chain (shipped, it would stand through her cover)
            xc = side * (hb(t) - 0.098)
            sweep(galv, [(x, y + 0.012, z + 0.020), (x - side * 0.035, y + 0.016, z + 0.03), (xc, y + 0.004, z + 0.03), (xc, y - 0.060, z + 0.03)], 0.0025, tint(GALV, 0.8))
            galv.tube((xc, y - 0.055, z + 0.03), (xc, y - 0.150, z + 0.03), 0.009, colour=GALV)
            galv.ring((xc, y - 0.193, z + 0.03), PORT, 0.045, 0.007, GALV, sweep=(radians(125), radians(415)))

    # ---- the engine, aft of amidships: a small two-cylinder diesel in its casing; the exhaust; the gear lever; the fuel tank
    ex0, ex1, ez0, ez1, eh = -0.31, 0.31, -1.66, -0.78, 0.84
    green = MACHINE_GREEN
    paint.block((ex0, FLOOR, ez0), (ex1, eh - 0.03, ez1), green, r=0.010)
    paint.block((ex0 - 0.012, eh - 0.03, ez0 - 0.012), (ex1 + 0.012, eh, ez1 + 0.012), tint(green, 0.9), r=0.008)        # its lid, lifting off
    for z in (ez0 + 0.18, ez1 - 0.18):
        sweep(steel, [(-0.10, eh, z), (-0.10, eh + 0.045, z), (0.10, eh + 0.045, z), (0.10, eh, z)], 0.007, STEEL)        # the lid's two handles
    for sx, x in ((-1, ex0 - 0.012), (1, ex1 + 0.012)):                                                                   # four toggle clips hold it down
        for z in (ez0 + 0.10, ez1 - 0.10):
            steel.block((min(x, x + sx * 0.006), eh - 0.085, z - 0.014), (max(x, x + sx * 0.006), eh - 0.008, z + 0.014), STEEL, r=0.002)
    # forward end: the starting handle's shaft with its dog, the decompression lever; aft end: the gear lever and the throttle
    steel.tube((0.0, 0.48, ez1), (0.0, 0.48, ez1 + 0.06), 0.016, colour=STEEL)
    steel.tube((-0.022, 0.48, ez1 + 0.045), (0.022, 0.48, ez1 + 0.045), 0.005, colour=STEEL)
    paint.block((0.125, 0.685, ez1), (0.175, 0.715, ez1 + 0.012), RED, r=0.003)
    sweep(steel, [(0.15, 0.70, ez1 + 0.012), (0.15, 0.74, ez1 + 0.03), (0.15, 0.80, ez1 + 0.03)], 0.005, STEEL)
    lev = (0.18, 0.60, ez0)
    paint.block((lev[0] - 0.035, lev[1] - 0.06, lev[2] - 0.02), (lev[0] + 0.035, lev[1] + 0.06, lev[2]), tint(green, 0.8), r=0.004)
    sweep(steel, [(lev[0], lev[1], lev[2] - 0.02), (lev[0], lev[1] + 0.10, lev[2] - 0.06), (lev[0], lev[1] + 0.34, lev[2] - 0.10)], 0.008, STEEL)
    plastic.ball((lev[0], lev[1] + 0.36, lev[2] - 0.10), 0.022, BLACK)
    sweep(steel, [(-0.18, 0.66, ez0), (-0.18, 0.72, ez0 - 0.05), (-0.18, 0.86, ez0 - 0.07)], 0.005, STEEL)                # the throttle
    plastic.ball((-0.18, 0.875, ez0 - 0.07), 0.014, RED)
    # the exhaust: lagged, from the casing's side aft over the after thwart and out through her side under the gunwale
    te = -2.32 / HALF
    yo = gun_y(te) - 0.30
    xo = half_at(te, yo, False)
    lag = P('canvas')
    path = [(ex0, 0.62, -1.40), (ex0 - 0.14, 0.62, -1.40), (ex0 - 0.24, 0.70, -1.62), (-0.66, 0.76, -1.95), (-(xo - 0.22), yo - 0.02, -2.22), (-(xo - 0.012), yo, -2.32)]
    sweep(lag, path, 0.034, tint(CANVAS, 0.95))
    steel.tube((-(xo - 0.02), yo, -2.32), (-(xo + 0.040), yo, -2.32), 0.027, colour=tint(STEEL, 0.6))
    plate_disc(steel, (-(xo + 0.0), yo, -2.32), (-1, 0, 0), 0.052, 0.006, STEEL)
    galv.ring((-0.66, 0.76, -1.95), tuple((Vector(path[4]) - Vector(path[2])).normalized()), 0.036, 0.004, GALV)            # clipped to a post on the after thwart
    galv.tube((-0.66, top, -1.95), (-0.66, 0.728, -1.95), 0.008, colour=GALV)
    # the fuel tank under the after thwart on two feet, strapped up to it; its filler, its cock and the pipe to the engine
    paint.block((-0.36, FLOOR + 0.14, -2.12), (0.36, THWART - 0.06, -1.80), RED, r=0.012)
    for x in (-0.25, 0.25):
        galv.block((x - 0.02, FLOOR, -2.10), (x + 0.02, FLOOR + 0.14, -1.82), GALV, r=0.003)
        galv.block((x - 0.015, THWART - 0.06, -1.99), (x + 0.015, THWART, -1.96), GALV, r=0.002)
    bronze.tube((0.24, THWART - 0.06, -1.855), (0.24, THWART - 0.045, -1.855), 0.026, colour=BRASS)
    sweep(bronze, [(-0.30, FLOOR + 0.20, -1.80), (-0.30, FLOOR + 0.20, -1.72), (-0.26, FLOOR + 0.16, ez0)], 0.005, BRASS)

    # ---- shaft, three-bladed screw in its guard, the shoe under it, the rudder; the tiller unshipped and stowed
    pz, py = -3.20, 0.085
    sweep(steel, [(0.0, 0.30, ez0), (0.0, 0.205, -2.55), (0.0, py, pz + 0.06)], 0.016, STEEL)
    lathe(grp, (0.0, 0.205, -2.55), (0.0, py - 0.205, pz + 0.06 + 2.55), [(-0.06, 0.028), (0.40, 0.046), (0.50, 0.030)], tint(hull_c, 0.93))   # the stern tube's boss
    lathe(bronze, (0.0, py, pz + 0.06), (0, 0, -1), [(0.0, 0.035), (0.07, 0.035), (0.12, 0.004)], BRASS)
    for k in range(3):                                            # each blade a twisted plate, broadest at two thirds of its radius
        a0 = 2 * pi * k / 3
        rows = []
        for i in range(7):
            r = 0.030 + 0.150 * i / 6
            chord = 0.11 * sin(pi * (0.18 + 0.82 * i / 6) ** 0.8) + 0.02
            pitch = atan2(0.30, 2 * pi * r)
            pts = []
            for j in (-1, 0, 1):
                d = j * chord / 2
                ang = a0 + d * cos(pitch) / r
                pts.append((r * cos(ang), py + r * sin(ang), pz + 0.025 + d * sin(pitch)))
            rows.append(pts)
        st = len(bronze.f)
        bronze.grid(rows, BRASS)
        bronze.grid([[(x, y, z - 0.006) for x, y, z in r_] for r_ in rows], tint(BRASS, 0.85), flip=True)
        for q in range(st, len(bronze.f)):
            bronze.s[q] = True
    shoe_y = -0.160
    z_a = -2.78                                                   # the shoe: bolted under her where the keel begins to rise, down and aft under the screw
    bar(galv, (0.0, keel_y(abs(z_a + 0.10) / HALF) - 0.008, z_a + 0.10), (0.0, keel_y(abs(z_a - 0.02) / HALF) - 0.008, z_a - 0.02), 0.044, 0.016, GALV, up=UP)
    bar(galv, (0.0, keel_y(abs(z_a) / HALF) - 0.010, z_a), (0.0, shoe_y, -3.00), 0.044, 0.020, GALV, up=UP)
    bar(galv, (0.0, shoe_y, -2.99), (0.0, shoe_y, -3.50), 0.044, 0.020, GALV, up=UP)
    galv.ring((0.0, py, pz + 0.02), FWD, 0.225, 0.009, GALV)                                         # the guard: a hoop round the screw
    galv.tube((0.0, shoe_y + 0.008, pz + 0.02), (0.0, py - 0.222, pz + 0.02), 0.010, colour=GALV)
    for sx in (-1, 1):                                                                                 # and its two stays up to her bottom
        gx, gy = sx * 0.225 * cos(radians(40)), py + 0.225 * sin(radians(40))
        galv.tube((gx, gy, pz + 0.02), (gx, bottom_at(abs(pz + 0.02) / HALF, gx) - SKIN + 0.004, pz + 0.02), 0.008, colour=GALV)
    rz = -3.46
    post_top = 1.42
    steel.tube((0.0, shoe_y + 0.008, rz), (0.0, post_top, rz), 0.019, colour=GALV)                    # the rudder stock, from the shoe up through her stern
    plate_disc(galv, (0.0, shoe_y + 0.010, rz), UP, 0.035, 0.012, GALV)
    prism(paint, [(-0.012, shoe_y + 0.05, rz - 0.015), (-0.012, shoe_y + 0.08, rz - 0.25), (-0.012, 0.34, rz - 0.21), (-0.012, 0.46, rz - 0.015)], (0.024, 0, 0),
          tint(hull_c, 0.9))                                                                              # the blade, abaft the stock, under her stern
    galv.block((-0.028, post_top - 0.05, rz - 0.028), (0.028, post_top + 0.012, rz + 0.028), GALV, r=0.004)                              # the rudder head, squared for the tiller
    tz, tx = -1.70, half_at(-1.70 / HALF, THWART) - 0.10
    wood.block((-tx - 0.022, THWART, tz - 0.55), (-tx + 0.022, THWART + 0.040, tz + 0.50), tint(MAHOGANY, 1.15), r=0.008)                # the tiller, laid on the starboard bench
    galv.block((-tx - 0.030, THWART, tz + 0.50), (-tx + 0.030, THWART + 0.050, tz + 0.58), GALV, r=0.004)

    # ---- the lifting hooks, fore and aft: a keel plate up through the end deck, the hook between two cheeks, the release cable
    for end in (1, -1):
        z = end * HOOK_Z
        ky = keel_y(HOOK_Z / HALF) + SKIN
        galv.block((-0.045, ky - 0.004, z - 0.11), (0.045, ky + 0.012, z + 0.11), GALV, r=0.003)                  # bolted through the keel
        for dz in (-0.075, 0.075):
            bolt(galv, (0.0, ky + 0.012, z + dz), UP, 0.016, GALV)
        galv.block((-0.008, ky + 0.010, z - 0.05), (0.008, HOOK_Y - 0.10, z + 0.05), GALV, r=0.002)              # the lifting plate
        for a, b in ((0.008, 0.020), (-0.020, -0.008)):
            galv.block((a, HOOK_Y - 0.24, z - 0.075), (b, HOOK_Y - 0.040, z + 0.075), GALV, r=0.003)             # the hook's two cheeks
        # the hook between the cheeks, on its pin: a shank up to a bowl whose mouth looks up; the link's wire lies in the bowl at HOOK_Y
        hook = [(0.0, HOOK_Y - 0.14, z - end * 0.02), (0.0, HOOK_Y - 0.075, z - end * 0.040)]
        for k in range(9):
            a_ = radians(205 + 22 * k)
            hook.append((0.0, HOOK_Y + 0.0195 * sin(a_), z + end * 0.0195 * cos(a_)))
        hook.append((0.0, HOOK_Y + 0.045, z + end * 0.030))
        sweep(galv, hook, 0.0078, tint(GALV, 0.85))
        galv.tube((-0.024, HOOK_Y - 0.14, z - end * 0.02), (0.024, HOOK_Y - 0.14, z - end * 0.02), 0.012, colour=GALV)   # its pin
        galv.block((-0.04, ENDDECK, z - 0.085), (0.04, ENDDECK + 0.008, z + 0.085), GALV, r=0.002)               # the collar in the end deck
        sweep(steel, [(0.024, HOOK_Y - 0.19, z - end * 0.06), (0.03, ENDDECK + 0.06, z - end * 0.10), (0.03, ENDDECK + 0.004, z - end * 0.14)], 0.004, STEEL)
    hz = -2.26                                                    # the release handle, at the coxswain's feet: a red lever in a quadrant, a pin through it
    galv.block((-0.14, FLOOR, hz - 0.09), (-0.06, FLOOR + 0.012, hz + 0.09), GALV, r=0.003)
    for sx in (-0.125, -0.075):
        prism(galv, [(sx - 0.003, FLOOR + 0.012, hz - 0.07), (sx - 0.003, FLOOR + 0.012, hz + 0.07), (sx - 0.003, FLOOR + 0.13, hz + 0.03), (sx - 0.003, FLOOR + 0.13, hz - 0.03)], (0.006, 0, 0), GALV)
    bar(paint, (-0.10, FLOOR + 0.07, hz), (-0.10, FLOOR + 0.50, hz + 0.12), 0.022, 0.030, RED, up=FWD)
    plastic.tube((-0.10, FLOOR + 0.50, hz + 0.12), (-0.10, FLOOR + 0.60, hz + 0.148), 0.017, colour=RED)
    steel.tube((-0.16, FLOOR + 0.105, hz), (-0.04, FLOOR + 0.105, hz), 0.006, colour=STEEL)                        # the safety pin
    steel.ring((-0.170, FLOOR + 0.105, hz), FWD, 0.012, 0.003, STEEL)
    paint.block((-0.055, FLOOR, hz - 0.11), (-0.050, FLOOR + 0.40, hz + 0.11), tint(INSIDE, 0.9), r=0.001)        # the plate its notice is on
    label(kit, mark, (-0.050, FLOOR + 0.31, hz), (0, 0, -1), UP, 0.19, 0.075, RED, ('RELEASE',), ink=WHITE)

    # ---- her gear: mast, oars and boat hook lashed along the thwarts; two water breakers; a bucket; the painter
    sweep(wood, [(0.0, top + 0.045, -1.90), (0.0, top + 0.045, 2.10)], 0.045, tint(MAHOGANY, 1.3))                  # the mast, its heel aft
    oar_c = tint(TEAK, 1.15)
    for side in (1, -1):
        for k in range(4):
            x = side * (0.20 + 0.062 * k)
            y = top + 0.030
            lathe(wood, (x, y, -1.60), FWD, [(0.0, 0.019), (0.30, 0.021), (2.55, 0.026), (2.75, 0.030)], oar_c)
            wood.block((x - 0.028, y - 0.008, 1.14), (x + 0.028, y + 0.008, 2.14), tint(oar_c, 0.95 + 0.03 * k), r=0.006)      # its blade, laid flat
        for z in (2.05, 1.05, 0.05):                              # a lashing round each bundle at each thwart
            xa, xb = side * 0.165, side * (0.20 + 0.062 * 3 + 0.036)
            sweep(rope, [(xa, top, z - 0.06), (xa, top + 0.064, z - 0.06), (xb, top + 0.064, z - 0.06), (xb, top, z - 0.06)], 0.005, MANILA, lay=3)
    sweep(wood, [(0.56, top + 0.017, -0.2), (0.56, top + 0.017, 2.12)], 0.017, oar_c)                                # the boat hook
    sweep(galv, [(0.56, top + 0.017, 2.12), (0.56, top + 0.017, 2.22), (0.585, top + 0.017, 2.25), (0.60, top + 0.017, 2.21)], 0.006, GALV)
    for x in (-0.60, 0.60):                                       # water breakers: two galvanised kegs on chocks on the bottom boards
        lathe(galv, (x, FLOOR + 0.165, 1.30), FWD, [(0.0, 0.10), (0.05, 0.125), (0.33, 0.125), (0.38, 0.10)], GALV)
        for z in (1.36, 1.62):
            galv.ring((x, FLOOR + 0.165, z), FWD, 0.127, 0.004, tint(GALV, 0.8))
            teak.block((x - 0.11, FLOOR, z - 0.02), (x + 0.11, FLOOR + 0.045, z + 0.02), TEAK, r=0.003)
        bronze.tube((x, FLOOR + 0.288, 1.49), (x, FLOOR + 0.312, 1.49), 0.018, colour=BRASS)
    lathe(galv, (0.0, FLOOR, 1.52), UP, [(0.0, 0.10), (0.24, 0.125), (0.24, 0.119), (0.006, 0.094), (0.006, 0.0)], GALV, caps=(True, False))   # the bucket
    sweep(galv, [(-0.123, FLOOR + 0.235, 1.52), (-0.10, FLOOR + 0.31, 1.52), (0.10, FLOOR + 0.31, 1.52), (0.123, FLOOR + 0.235, 1.52)], 0.004, GALV)
    ring_y = ENDDECK + 0.22                                       # the painter: made fast to the ring bolt in her stem, coiled down on the forward end deck
    galv.ring((0.0, ring_y, 3.20), PORT, 0.035, 0.008, GALV)
    galv.tube((0.0, ring_y, 3.235), (0.0, ring_y, half_z(ring_y)), 0.008, colour=GALV)
    coil = []
    for k in range(64):
        a = 2 * pi * k / 16
        rr = 0.17 - 0.012 * (k // 16)
        coil.append((rr * cos(a), ENDDECK + 0.013 + 0.026 * (k / 16), 2.92 + rr * sin(a) * 0.85))
    sweep(rope, [(0.0, ring_y - 0.035, 3.20), (0.03, ENDDECK + 0.12, 3.14), (0.15, ENDDECK + 0.03, 3.02)] + coil, 0.012, MANILA, lay=3)

    # ---- lettering on each side: her ship and port and her number forward, her persons and her size aft; reflective tape
    def onto_hull(side, z0, y0):
        def f(u, v):
            z = z0 - side * u
            t = z / HALF
            y = y0 + v
            return Vector((side * half_at(t, y, False), y, z)) + out_normal(t, y, side) * 0.0025
        return f
    ink = WHITE if rescue else BLACK
    for side in (1, -1):
        st = len(mark.f)
        for text, h, z0, y0 in ((ship, 0.085, 2.20, 0.82), (port, 0.050, 2.20, 0.73), (f'No {number}', 0.085, 1.30, 0.82),
                                (f'{PERSONS} PERSONS', 0.055, -1.75, 0.83), (f'{LOA:.2f} x {BEAM:.2f} x {DEPTH:.2f} M', 0.038, -1.75, 0.75)) + \
                               ((('RESCUE BOAT', 0.085, -0.05, 0.82),) if rescue else ()):
            letter(kit, mark, text, h, None, PORT, UP, ink, onto=onto_hull(side, z0, y0), piece=0.03)
        for z in (-2.95, -1.05, 0.70, 1.78, 2.95):
            y = gun_y(z / HALF) - 0.36
            pts = []
            for dz, dy in ((-0.12, -0.022), (0.12, -0.022), (0.12, 0.022), (-0.12, 0.022)):
                tt = (z + dz) / HALF
                pts.append(tuple(Vector((side * half_at(tt, y + dy, False), y + dy, z + dz)) + out_normal(tt, y + dy, side) * 0.002))
            mark.face(tuple(mark.vert(q) for q in pts), srgb(0xdfe3e6))
        mark.orient(st, (side, 0, 0))

    # ---- her cover: orange canvas over a ridge spar on two crutches, laced down under the rubbing strake
    if cover:
        sz = SPAR_T * HALF
        sweep(wood, [(0.0, 1.66 - 0.034, -sz), (0.0, 1.66 - 0.034, sz)], 0.032, tint(MAHOGANY, 1.2))
        for z in (2.05, -1.95):                                   # the crutches the spar lies in, each standing on a thwart
            for sx in (-1, 1):
                bar(wood, (sx * 0.24, top, z + 0.15), (-sx * 0.045, 1.66 - 0.035, z + 0.15), 0.05, 0.022, tint(MAHOGANY, 1.1), up=FWD)
        canvas = P('canvas')
        rows = []
        for t in ts:
            b, yg, yr = hb(t), gun_y(t), ridge(t)
            xs = half_at(t, yg - 0.105, False) + 0.046
            half = [(xs - 0.004, yg - 0.20), (xs, yg - 0.105), (b + 0.022, yg + 0.022)]
            for q in (0.25, 0.5, 0.75):
                half.append(((b + 0.022) * (1 - q), yg + 0.022 + (yr - yg - 0.022) * q - 0.03 * sin(pi * q)))
            z = t * HALF * 1.012
            rows.append([(x, y, z) for x, y in half] + [(0.0, yr, z)] + [(-x, y, z) for x, y in reversed(half)])
        _skin(canvas, rows, ORANGE, lambda c: c - Vector((0.0, 0.9, c.z * 0.98)))
        for r, way in ((rows[0], -1), (rows[-1], 1)):
            st = len(canvas.f)
            canvas.polygon(r, ORANGE)
            canvas.orient(st, (0, 0, way))
        for side in (1, -1):                                      # the lacing: a line from eyelet to hook, zigzag, the length of her
            pts = []
            for k in range(45):
                t = -0.93 + 1.86 * k / 44
                yg = gun_y(t)
                if k % 2 == 0:
                    y = yg - 0.190
                    x = half_at(t, yg - 0.105, False) + 0.046 + 0.002
                else:
                    y = yg - 0.285
                    x = half_at(t, y, False) + 0.010
                    galv.ring((side * (x - 0.002), y, t * HALF), PORT, 0.011, 0.0035, GALV)                 # the hook it is led under
                pts.append((side * x, y, t * HALF))
            sweep(rope, pts, 0.0035, WHITE)
        for end in (1, -1):                                       # a sleeve of canvas where each hook's link comes up through the cover
            z = end * HOOK_Z
            lathe(canvas, (0.0, ridge(z / HALF) - 0.03, z), UP, [(0.0, 0.12), (0.10, 0.055), (0.15, 0.048)], tint(ORANGE, 0.92), caps=(False, False))


def half_z(y):
    """How far forward of amidships her stem's inner face is at the height y (for what is made fast in her stem)."""
    t = 1.0
    while t > 0.8 and half_at(t, y) < 0.02:
        t -= 0.002
    return t * HALF + 0.012
