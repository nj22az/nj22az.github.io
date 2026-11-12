"""
Deck fittings: the lifeboat station (fittings.py is the door; fittings_kit.py the tools; the boat is fittings_lifeboat.py).

A classic one, as a ship of the middle 1970s carried it: an open lifeboat under a pair of PIVOT GRAVITY DAVITS of the Schat
and Welin kind. Each davit is an arm of box section, hinged on a pin in a frame on the deck; the boat hangs from the arms'
heads by wire falls and sits with her keel on a horn of each arm. The falls come from one winch between the frames. Lift the
winch's brake and the boat's own weight carries the arms outboard about their pins until they land on their stops, the wire
paying out; then the boat goes down on the falls to the water. Nothing but gravity launches her: that is the rule's reason
for the type [R classic-ferries-1958-1978, section 4: "gravity type above 2,300 kg"].

    origin   on the deck at the ship's side (the deck's edge), abreast the middle of the boat
    x        outboard (to port for side=+1; a starboard station is the mirror image, lettered to read)
    z        toward the boat's bow, which looks forward
    it takes 3.85 m of deck inboard of the edge and 8.8 m of the side; turned out, the boat hangs 0.26 m off the side

How it is drawn to work (the file format's movers, ferry/README.md):
    <name>-davit  0 to 46 degrees: the arms turn about their pins (`turn`); the boat, the falls, the span's lifelines and the
                  fall's becket keep upright and go with the arms' heads (`carry`); the standing part of each fall, from the
                  lead sheave on the frame up into the arm's heel, swings to follow the heel (`aim`) while its end runs out
                  of the arm, inside which it is drawn longer than is seen; the gripes' deck ends fall flat as the boat leaves.
    <name>-falls  0 to the water, in metres: the boat goes down (`slide`, riding on the head's `carry`); each fall is drawn
                  in lengths that lie inside one another, each a hair thinner than the one above, and draw out like a
                  telescope's (`slide` at a share of the boat's run): the only way a wire can lengthen in a file whose
                  parts are rigid; the winch's drum turns as the wire leaves it.
Both have keys on the page's desk (Raise, Stop, Lower): `keys`, `stops`, `rate`.

Sizes: the boat [see fittings_lifeboat.py]; davit reach, footprint and height against the table of gravity davits for boats
of 6.5 to 7.0 m [R comparable-ferries-2026-11-11, section 3: reach 2.2 m, footprint 3.1 m, height 6.0 m]: hers reach
1.60 m beyond the side with the pins 2.15 m inboard, stand 5.6 m high and take 3.85 m with the winch. Falls of 16 mm wire,
two parts; winch drum 360 mm; lowering at 0.6 m a second [M, as recalled for boats of this weight; not read tonight].
"""
from math import pi, sin, cos, tan, atan2, radians, degrees, hypot, sqrt, ceil
from mathutils import Vector
from shipyard import tint, srgb
from fittings_kit import *          # noqa: F401,F403
from fittings_kit import fitting
import fittings_lifeboat as LBT

PX, PY = -2.15, 0.55                # the arms' pins: inboard of the deck's edge, over the deck
ZA = LBT.HOOK_Z                     # the arms stand in line with the boat's lifting hooks
CL0, YK0 = -1.70, 1.40              # the boat stowed: her centreline, the underside of her keel over the deck
RS = 0.12                           # the head sheave, to the wire's middle
S0 = (CL0 - 0.06, 5.30)             # its axle, arm stowed
TURN = 46.0                         # degrees from stowed to turned out
K1, K2 = (-3.00, 1.75), (-3.00, 4.25)
SP = (-3.00, 1.62)                  # where the fall goes into the arm's heel
FX, FY, RF = -3.12, 0.412, 0.12     # the lead sheave on the frame under it
WIRE = 0.008                        # 16 mm wire
DRAUGHT = 0.45                      # the boat afloat, light
DAVIT_WHITE = srgb(0xe9e7df)


def rot(q, deg=TURN):
    """Where a point of an arm comes to when the arm has turned out by `deg`."""
    a = radians(deg)
    x, y = q[0] - PX, q[1] - PY
    return (PX + x * cos(a) + y * sin(a), PY - x * sin(a) + y * cos(a))


def _arm(kit, zc, end):
    """One davit arm, stowed: a box girder from its pin up round the boat to its head, the head sheave between two cheeks,
    the keel horn and its pad, the belly pad, the fairlead in its heel, rungs up its back, its load plate."""
    A = lambda key: kit.p(key, 'arm')
    white, steel, galv, wire, rubber, mark = A('white'), A('steel'), A('galv'), A('wire'), A('rubber'), A('mark')
    u = (Vector((S0[0], S0[1], 0)) - Vector((K2[0], K2[1], 0))).normalized()
    nrm = Vector((-u.y, u.x, 0))
    E = Vector((S0[0], S0[1], 0)) - u * 0.30
    path = rounded_path([(PX, PY, 0), (K1[0], K1[1], 0), (K2[0], K2[1], 0), tuple(E)], [0.36, 0.60])
    half = lambda s: 0.175 - 0.025 * s
    outer = ribbon(path, half, cap0=True, cap1=False)
    short = path[:-1] + [path[-1] - u * 0.018]
    inner = ribbon(short, lambda s: half(s) - 0.018, cap0=True, cap1=False)
    lift = lambda loop, dz: [(q.x, q.y, zc + dz) for q in loop]
    band(white, lift(outer, -0.105), lift(inner, -0.105), (0, 0, 0.21), DAVIT_WHITE)
    prism(white, lift(inner, -0.085), (0, 0, 0.17), tint(DAVIT_WHITE, 0.97), walls=False)
    # the boss it turns on (the pin is the frame's)
    A('paint').tube((PX, PY, zc - 0.113), (PX, PY, zc + 0.113), 0.105, colour=DARK)
    # the head: two cheeks bolted over the girder's end, the sheave between them on its axle, the wire over it
    S = Vector((S0[0], S0[1], 0))
    cheek = ribbon([S - u * 0.55, S + u * 0.07], 0.185, cap0=False, cap1=True, n=12)
    for sz in (-1, 1):
        prism(white, lift(cheek, sz * 0.105), (0, 0, sz * 0.022), DAVIT_WHITE)
        for d, w in ((0.50, 0.11), (0.50, -0.11), (0.36, 0.11), (0.36, -0.11)):
            q = S - u * d + nrm * w
            bolt(steel, (q.x, q.y, zc + sz * 0.127), (0, 0, sz), 0.016)
        hexagon(steel, (S.x, S.y, zc + sz * 0.127), (S.x, S.y, zc + sz * 0.150), 0.060, STEEL)                         # the axle's nut
    steel.tube((S.x, S.y, zc - 0.127), (S.x, S.y, zc + 0.127), 0.026, colour=STEEL, caps=(False, False))
    lathe(A('paint'), (S.x, S.y, zc), FWD, [(-0.105, 0.045), (-0.030, 0.045), (-0.030, RS + 0.022), (-0.013, RS + 0.022), (-0.004, RS - WIRE),
                                           (0.004, RS - WIRE), (0.013, RS + 0.022), (0.030, RS + 0.022), (0.030, 0.045), (0.105, 0.045)], DARK, caps=(False, False))
    wire.ring((S.x, S.y, zc), FWD, RS, WIRE, WIREC)
    T1 = S + nrm * RS
    wire.tube(tuple(T1 - u * 0.36 + Vector((0, 0, zc))), tuple(T1 + Vector((0, 0, zc))), WIRE, colour=WIREC)
    # the keel horn: a bracket of plate from the arm's foot, the boat's keel on its pad, a cleat on the pad's inboard side
    hx, hy = CL0, YK0 - 0.078
    horn = [(PX + 0.02, PY + 0.20), (PX + 0.20, PY - 0.05), (PX + 0.60, PY + 0.70), (hx + 0.12, hy - 0.05), (hx - 0.12, hy - 0.05), (hx - 0.12, PY + 0.62)]
    prism(white, [(x, y, zc - 0.085) for x, y in horn], (0, 0, 0.17), DAVIT_WHITE)
    A('wood').block((hx - 0.13, hy - 0.05, zc - 0.11), (hx + 0.13, hy - 0.012, zc + 0.11), tint(TEAK, 0.9), r=0.005)
    rubber.block((hx - 0.13, hy - 0.012, zc - 0.11), (hx + 0.13, hy, zc + 0.11), BLACK, r=0.003)
    A('wood').block((hx - 0.13, hy, zc - 0.11), (hx - 0.06, hy + 0.06, zc + 0.11), tint(TEAK, 0.9), r=0.008)
    # the belly pad: the boat's rubbing strake bears on it
    by = YK0 + LBT.gun_y(ZA / LBT.HALF) - 0.105
    bx = CL0 - LBT.half_at(ZA / LBT.HALF, LBT.gun_y(ZA / LBT.HALF) - 0.105, False) - 0.040
    white.block((K1[0] + 0.14, by - 0.11, zc - 0.075), (bx - 0.035, by + 0.11, zc + 0.075), DAVIT_WHITE, r=0.004)
    rubber.block((bx - 0.035, by - 0.10, zc - 0.07), (bx - 0.002, by + 0.10, zc + 0.07), BLACK, r=0.008)
    # the fairlead in the heel where the fall goes in
    d = (Vector((SP[0], SP[1], 0)) - Vector((FX, FY, 0))).normalized()
    lathe(galv, (SP[0] - d.x * 0.10, SP[1] - d.y * 0.10, zc), tuple(d), [(0.0, 0.055), (0.03, 0.036), (0.10, 0.030)], GALV, caps=(True, False))
    # rungs up the arm's back, for whoever greases the head sheave
    for k in range(8):
        y = K1[1] + 0.35 + 0.26 * k
        x = K1[0] - 0.150
        sweep(galv, [(x, y, zc - 0.08), (x - 0.11, y, zc - 0.08), (x - 0.11, y, zc + 0.08), (x, y, zc + 0.08)], 0.009, GALV)
    # its load plate, and the lug the harbour pin goes through
    label(kit, mark, (K1[0], 2.35, zc + end * 0.085), (end, 0, 0), UP, 0.20, 0.10, srgb(0x2f5d8a), ('SWL 2250 KG', 'TESTED 2475 KG'), ink=WHITE, proud=0.0015)
    steel.block((K1[0] - 0.235, 1.42, zc - 0.012), (K1[0] - 0.150, 1.50, zc + 0.012), STEEL, r=0.004)
    # the span between the two heads is made fast to an eye on each axle's inner end
    galv.ring((S.x, S.y, zc - end * 0.172), PORT, 0.022, 0.006, GALV)
    return S


def _frame(kit, zc, end):
    """One davit's frame on the deck: a doubler welded to the deck; two cheeks carrying the pin; the stop the arm lands on
    turned out; the stop it leans on stowed, with the harbour pin; the lead sheave the fall comes up from, and the flat
    sheave before it."""
    white, steel, galv, rubber, paint = kit.p('white'), kit.p('steel'), kit.p('galv'), kit.p('rubber'), kit.p('paint')
    c = DAVIT_WHITE
    white.block((-3.56, 0.0, zc - 0.38), (-1.20, 0.020, zc + 0.38), tint(c, 0.94), r=0.004)
    for sz in (-1, 1):
        z0 = zc + sz * 0.113
        prism(white, [(-2.80, 0.020, z0), (-1.60, 0.020, z0), (PX + 0.16, PY + 0.10, z0), (PX + 0.07, PY + 0.19, z0), (PX - 0.07, PY + 0.19, z0),
                      (PX - 0.16, PY + 0.10, z0)], (0, 0, sz * 0.025), c)
        for x in (-2.62, -1.78):                                    # a bracket outside each cheek, fore and aft of the pin
            gusset(white, (x, 0.020, zc + sz * 0.138), (0, 0, sz), UP, 0.17, 0.26, 0.014, c)
        steel.tube((PX, PY, zc + sz * 0.138), (PX, PY, zc + sz * 0.160), 0.085, colour=tint(STEEL, 0.9))                # the pin's keep plate
        bolt_circle(steel, (PX, PY, zc + sz * 0.160), (0, 0, sz), 0.062, 4, 0.012)
    steel.tube((PX, PY, zc - 0.138), (PX, PY, zc + 0.138), 0.052, colour=STEEL, caps=(False, False))                    # the pin
    galv.tube((PX, PY, zc + end * 0.160), (PX, PY, zc + end * 0.176), 0.008, colour=BRASS)                              # its grease nipple
    # the stop the arm's horn lands on, turned out: a post with a rubber head
    a, b = rot((PX + 0.20, PY - 0.05)), rot((PX + 0.60, PY + 0.70))
    sx = -1.45
    sy = a[1] + (b[1] - a[1]) * (sx - a[0]) / (b[0] - a[0]) - 0.003
    white.block((sx - 0.06, 0.020, zc - 0.06), (sx + 0.06, sy - 0.05, zc + 0.06), c, r=0.006)
    lathe(rubber, (sx, sy - 0.05, zc), UP, [(0.0, 0.055), (0.03, 0.055), (0.045, 0.035), (0.05, 0.0)], BLACK, caps=(True, False))
    # the stop it leans on, stowed: two posts with a cross bar behind the arm, a rubber pad on the bar; the harbour pin
    for sz in (-1, 1):
        white.block((-3.33, 0.020, zc + sz * 0.30 - 0.04), (-3.25, 1.62, zc + sz * 0.30 + 0.04), c, r=0.006)
        gusset(white, (-3.25, 0.020, zc + sz * 0.30), PORT, UP, 0.16, 0.22, 0.012, c)
    white.block((-3.33, 1.50, zc - 0.26), (-3.25, 1.60, zc + 0.26), c, r=0.006)
    rubber.block((-3.25, 1.51, zc - 0.07), (K1[0] - 0.168, 1.59, zc + 0.07), BLACK, r=0.006)
    for sz in (-1, 1):                                              # two lugs on the bar, either side of the arm's lug; the pin through all three
        steel.block((-3.25, 1.42, zc + sz * 0.028 - 0.008), (-3.155, 1.50, zc + sz * 0.028 + 0.008), STEEL, r=0.003)
    red = kit.p('paint')
    red.tube((-3.20, 1.46, zc - 0.075), (-3.20, 1.46, zc + 0.060), 0.011, colour=RED)
    red.ring((-3.20, 1.46, zc - 0.095), PORT, 0.022, 0.005, RED)
    sweep(galv, [(-3.20, 1.46, zc + 0.060), (-3.22, 1.38, zc + 0.12), (-3.25, 1.30, zc + 0.20), (-3.29, 1.36, zc + 0.262)], 0.0025, GALV)   # its lanyard to the post
    # the lead sheave under the arm's heel: the fall comes to it along the deck and goes up from it into the arm
    for sz in (-1, 1):
        prism(galv, [(FX - 0.17, 0.020, zc + sz * 0.035), (FX + 0.17, 0.020, zc + sz * 0.035), (FX + 0.09, FY + 0.15, zc + sz * 0.035), (FX - 0.09, FY + 0.15, zc + sz * 0.035)],
              (0, 0, sz * 0.012), GALV)
        hexagon(steel, (FX, FY, zc + sz * 0.047), (FX, FY, zc + sz * 0.062), 0.036, STEEL)
    lathe(paint, (FX, FY, zc), FWD, [(-0.035, 0.03), (-0.024, 0.03), (-0.024, RF + 0.020), (-0.012, RF + 0.020), (-0.004, RF - WIRE), (0.004, RF - WIRE),
                                    (0.012, RF + 0.020), (0.024, RF + 0.020), (0.024, 0.03), (0.035, 0.03)], DARK, caps=(False, False))
    steel.tube((FX, FY, zc - 0.047), (FX, FY, zc + 0.047), 0.014, colour=STEEL, caps=(False, False))
    kit.p('wire').ring((FX, FY, zc), FWD, RF, WIRE, WIREC, sweep=(radians(170), radians(370)))
    # the flat sheave on the frame's inboard end: it turns the fall from along the deck to across it
    gx = -3.50 if end > 0 else -3.36                                # the wire's line from the winch's drum
    gz = zc - end * 0.10
    yw = FY - RF
    galv.block((gx - 0.04, 0.020, gz - 0.14), (gx + 0.24, yw - 0.040, gz + 0.14), GALV, r=0.004)
    lathe(paint, (gx + 0.10, yw - 0.040, gz), UP, [(0.0, 0.03), (0.016, 0.03), (0.016, 0.118), (0.028, 0.118), (0.036, 0.092), (0.044, 0.092), (0.052, 0.118), (0.064, 0.118),
                                                   (0.064, 0.03), (0.080, 0.03)], DARK, caps=(False, True))
    steel.tube((gx + 0.10, yw - 0.040, gz), (gx + 0.10, yw + 0.060, gz), 0.014, colour=STEEL)
    kit.p('wire').ring((gx + 0.10, yw, gz), UP, 0.10, WIRE, WIREC, sweep=(radians(85), radians(190)) if end > 0 else (radians(170), radians(275)))
    kit.p('wire').tube((gx + 0.10, yw, zc), (FX, yw, zc), WIRE, colour=WIREC)
    return gx


def _winch(kit):
    """The boat winch, between the frames: bedplate on two bearers; a drum in two halves, one for each fall, its shaft in
    two pedestal bearings; worm gearbox and flange motor; a band brake with a weighted lever (lift it and the boat goes);
    a square on the shaft's end for the hand crank, which is stowed in clips on the seat; the push-button box."""
    paint, steel, galv, wire, plastic, mark = kit.p('paint'), kit.p('steel'), kit.p('galv'), kit.p('wire'), kit.p('plastic'), kit.p('mark')
    g = MACHINE_GREEN
    ax = 0.48                                                       # the shaft over the deck
    for z in (-0.24, 0.24):
        paint.block((-3.80, 0.0, z - 0.045), (-2.35, 0.10, z + 0.045), tint(g, 0.8), r=0.006)
    paint.block((-3.80, 0.10, -0.31), (-2.35, 0.122, 0.31), tint(g, 0.9), r=0.005)
    for x in (-3.74, -3.10, -2.41):
        for z in (-0.24, 0.24):
            bolt(steel, (x, 0.122, z), UP, 0.016)
    for x in (-3.622, -3.245):                                      # two pedestal bearings
        paint.block((x - 0.025, 0.122, -0.11), (x + 0.025, ax - 0.02, 0.11), g, r=0.006)
        paint.tube((x - 0.030, ax, 0.0), (x + 0.030, ax, 0.0), 0.075, colour=g)
        galv.tube((x, ax + 0.075, 0.0), (x, ax + 0.095, 0.0), 0.007, colour=BRASS)
    steel.tube((-3.84, ax, 0.0), (-3.20, ax, 0.0), 0.034, colour=STEEL)
    hexagon(steel, (-3.840, ax, 0.0), (-3.895, ax, 0.0), 0.040, tint(STEEL, 0.8))                                    # the square (drawn as a hexagon bar) for the crank
    # the gearbox and the motor, outboard of the drum
    paint.block((-3.20, 0.122, -0.22), (-2.86, 0.74, 0.22), g, r=0.016)
    paint.block((-3.14, 0.74, -0.14), (-2.92, 0.755, 0.14), tint(g, 0.92), r=0.004)                                   # its inspection cover
    for x in (-3.12, -2.94):
        for z in (-0.12, 0.12):
            bolt(steel, (x, 0.755, z), UP, 0.010)
    galv.tube((-3.03, 0.755, 0.0), (-3.03, 0.80, 0.0), 0.016, colour=BRASS)                                          # oil filler and breather
    plastic.tube((-3.03, 0.30, 0.22), (-3.03, 0.30, 0.228), 0.022, colour=srgb(0xd8c27a))                            # the oil level glass
    paint.tube((-2.86, ax, 0.0), (-2.80, ax, 0.0), 0.17, colour=tint(g, 0.9))                                        # the motor's flange
    lathe(paint, (-2.80, ax, 0.0), PORT, [(0.0, 0.135), (0.30, 0.135), (0.30, 0.145), (0.40, 0.145), (0.41, 0.12)], srgb(0x4a6a8a), caps=(False, True))
    for k in range(12):                                             # its cooling fins
        a = 2 * pi * k / 12
        if 0.25 < (a % (2 * pi)) / pi < 0.75:
            continue
        paint.block((-2.79, ax + 0.126 * sin(a) - 0.005, 0.126 * cos(a) - 0.005), (-2.51, ax + 0.150 * sin(a) + 0.005, 0.150 * cos(a) + 0.005), srgb(0x4a6a8a), r=0.002)
    paint.block((-2.72, ax + 0.125, -0.07), (-2.58, ax + 0.21, 0.07), srgb(0x4a6a8a), r=0.008)                        # its terminal box
    galv.tube((-2.65, ax + 0.165, 0.07), (-2.65, ax + 0.165, 0.10), 0.014, colour=BRASS)                             # the cable's gland
    kit.run('cables', [(-2.65, ax + 0.165, 0.10), (-2.65, ax + 0.14, 0.17), (-2.65, 0.30, 0.345), (-2.65, 0.035, 0.36)], 0.009, BLACK)
    galv.tube((-2.65, 0.0, 0.36), (-2.65, 0.04, 0.36), 0.018, colour=BRASS)                                          # and the deck gland it goes down through
    galv.block((-2.675, 0.122, 0.30), (-2.625, 0.30, 0.335), GALV, r=0.003)                                           # a cleat for it on the seat
    # the brake: a drum on the shaft's inboard end with its band, and the weighted lever that holds it on
    paint.tube((-3.80, ax, 0.0), (-3.66, ax, 0.0), 0.165, colour=DARK)
    steel.ring((-3.73, ax, 0.0), PORT, 0.171, 0.006, tint(STEEL, 0.8), sweep=(radians(20), radians(330)))
    pv = (-3.73, 0.26, 0.20)                                        # the lever's fulcrum, on a bracket on the seat
    paint.block((pv[0] - 0.03, 0.122, pv[2] - 0.03), (pv[0] + 0.03, pv[1] + 0.03, pv[2] + 0.03), g, r=0.004)
    steel.tube((pv[0] - 0.045, pv[1], pv[2]), (pv[0] + 0.045, pv[1], pv[2]), 0.012, colour=STEEL)
    bar(kit.p('paint'), (pv[0] + 0.04, pv[1], pv[2] + 0.10), (pv[0] + 0.04, pv[1] + 0.12, pv[2] - 1.02), 0.016, 0.045, RED, up=UP)
    lathe(paint, (pv[0] + 0.04, pv[1] + 0.085, pv[2] - 0.76), (0, -0.12, 1.12), [(0.0, 0.05), (0.02, 0.075), (0.16, 0.075), (0.18, 0.05)], DARK)   # the weight
    plastic.tube((pv[0] + 0.04, pv[1] + 0.12, pv[2] - 1.02), (pv[0] + 0.04, pv[1] + 0.133, pv[2] - 1.14), 0.017, colour=BLACK)                    # its grip
    steel.tube((pv[0] + 0.04, pv[1] + 0.012, pv[2] + 0.10), (pv[0] + 0.04, ax - 0.165, 0.185), 0.006, colour=STEEL)                             # the link to the band
    # the hand crank, stowed in two clips on the seat's after bearer
    sweep(steel, [(-3.60, 0.055, -0.315), (-3.05, 0.055, -0.315), (-3.05, 0.055, -0.56), (-2.86, 0.055, -0.56)], 0.011, tint(STEEL, 0.85))
    plastic.tube((-2.86, 0.055, -0.56), (-2.72, 0.055, -0.56), 0.017, colour=BLACK)
    for x in (-3.50, -3.15):
        galv.block((x - 0.012, 0.030, -0.335), (x + 0.012, 0.080, -0.285), GALV, r=0.003)
    # the push buttons for hoisting, on a post at the winch's forward side
    paint.block((-3.72, 0.0, 0.50), (-3.66, 1.05, 0.56), tint(g, 0.8), r=0.006)
    paint.block((-3.76, 1.05, 0.46), (-3.62, 1.27, 0.60), LIGHT, r=0.010)
    for k, col in enumerate((srgb(0x2f9e5a), RED)):
        plastic.tube((-3.76, 1.21 - 0.09 * k, 0.53), (-3.775, 1.21 - 0.09 * k, 0.53), 0.018, colour=col)
    label(kit, mark, (-3.76, 1.165, 0.53), (0, 0, 1), UP, 0.05, 0.022, WHITE, ('HOIST',), proud=0.0012)
    galv.tube((-3.69, 1.05, 0.53), (-3.69, 1.02, 0.53), 0.013, colour=BRASS)
    paint.block((-3.726, 0.70, 0.39), (-3.720, 0.92, 0.67), RED, r=0.001)                                             # the brake's notice, on the post
    label(kit, mark, (-3.726, 0.81, 0.53), (0, 0, 1), UP, 0.26, 0.20, RED, ('BRAKE', 'LIFT LEVER', 'TO LOWER'), ink=WHITE, proud=0.0015)
    return ax


@fitting('lifeboat-station', size=(8.8, 3.85 + 2.95, 5.65), front='+z (the boat\'s bow)', handed=True, title='Lifeboat station',
         note='origin on the deck at the ship\'s side abreast the middle of the boat; x outboard; side=+1 port, -1 starboard (mirrored); '
              '3.85 m inboard, 2.95 m outboard when turned out; options side, height (deck over the water), rescue, cover, number, ship, port, label, embark')
def lifeboat_station(kit, side=1, height=10.0, rescue=False, cover=None, number=None, ship=None, port=None, embark=None, **opts):
    """
    The whole station: two pivot gravity davits on their frames, the boat hanging in them on wire falls with floating blocks,
    the winch, the gripes, the span with its lifelines, bowsing tackles, the embarkation ladder in its rack, the station's
    light, its rails at each end, a coaming at the deck's edge, the instruction placard. It works (the module's own words
    say how).
    """
    try:
        import spec as _S
        ship, port = ship or _S.NAME, port or _S.PORT_OF_REGISTRY
    except Exception:
        ship, port = ship or 'CHISUM', port or 'MINATO'
    number = number or (1 if side > 0 else 2)
    cover = (not rescue) if cover is None else cover
    name = opts.get('label') or f'No {number} lifeboat'
    white, steel, galv, wire, rope, rubber, mark, paint = (kit.p(k) for k in ('white', 'steel', 'galv', 'wire', 'rope', 'rubber', 'mark', 'paint'))

    # ---- the boat, hanging; her floating blocks; the falls
    with turned(kit, (CL0, YK0, 0.0)):
        LBT.lifeboat(kit, 'boat', ship=ship, port=port, number=number, rescue=rescue, cover=cover)
    B = lambda key: kit.p(key, 'boat')
    by = YK0 + LBT.BLOCK_Y
    run = height + DRAUGHT + (YK0 - (S0[1] - rot(S0)[1]))           # how far she is lowered from turned out to afloat
    top_d, top_u = S0[1], S0[1] - 0.24                              # where each part of a fall begins: at the sheave, at the becket
    d0 = top_u - by
    n_seg = int(ceil(run / (d0 - 0.06))) + 1
    for end in (1, -1):
        zc = end * ZA
        _arm(kit, zc, end)
        # the floating block: two cheeks, a sheave, the long link down to the boat's hook
        cheek = ribbon([Vector((CL0, by + 0.01, 0)), Vector((CL0, by - 0.13, 0))], 0.085)
        for sz in (-1, 1):
            prism(B('galv'), [(q.x, q.y, zc + sz * 0.020) for q in cheek], (0, 0, sz * 0.008), GALV, smooth=True)
        lathe(B('paint'), (CL0, by, zc), FWD, [(-0.020, 0.02), (-0.016, 0.02), (-0.016, 0.075), (-0.010, 0.075), (-0.004, 0.06 - WIRE), (0.004, 0.06 - WIRE), (0.010, 0.075),
                                              (0.016, 0.075), (0.016, 0.02), (0.020, 0.02)], DARK, caps=(False, False))
        B('steel').tube((CL0, by, zc - 0.034), (CL0, by, zc + 0.034), 0.012, colour=STEEL)
        B('wire').ring((CL0, by, zc), FWD, 0.06, WIRE, WIREC, sweep=(radians(180), radians(360)))
        B('steel').tube((CL0, by - 0.13, zc - 0.034), (CL0, by - 0.13, zc + 0.034), 0.010, colour=STEEL)               # the pin the link hangs on
        hook_y = YK0 + LBT.HOOK_Y
        y_top = by - 0.13 + 0.021                                   # the link's wire lies over the block's pin and in the hook's bowl
        mid = (y_top + hook_y) / 2
        link = [(CL0 + x, mid + y, zc) for y, x in stadium((y_top - hook_y) / 2 - 0.030, 0, 0.030, n=8)]
        sweep(B('galv'), link, 0.011, GALV, closed=True)
        # the fall: its two parts, each in lengths that lie in one another (the top length is the head's own)
        for k in range(n_seg):
            mv = 'head' if k == 0 else f'fall-{k}'
            r = WIRE - 0.00045 * k
            w = kit.p('wire', mv)
            w.tube((S0[0] + RS, top_d, zc), (S0[0] + RS, by, zc), r, colour=WIREC, caps=(False, False))
            w.tube((S0[0], top_u, zc), (S0[0], by, zc), r, colour=WIREC, caps=(False, False))
        # the becket: two links from the axle down to a pin, the fall's end round a thimble on it; it hangs plumb as the arm turns
        H = lambda key: kit.p(key, 'head')
        for sz in (-1, 1):
            H('galv').block((S0[0] - 0.014, top_u - 0.035, zc + sz * 0.060 - 0.005), (S0[0] + 0.014, S0[1] + 0.03, zc + sz * 0.060 + 0.005), GALV, r=0.003)
        H('steel').tube((S0[0], top_u, zc - 0.070), (S0[0], top_u, zc + 0.070), 0.009, colour=STEEL)
        H('galv').ring((S0[0], top_u - 0.024, zc), FWD, 0.020, 0.007, GALV)
    # ---- the span between the heads, and two lifelines made up in hanks on it
    kit.p('wire', 'arm').tube((S0[0], S0[1], -ZA + 0.172), (S0[0], S0[1], ZA - 0.172), 0.006, colour=WIREC)
    for z in (-0.9, 0.9):
        H('galv').ring((S0[0], S0[1] - 0.030, z), PORT, 0.024, 0.006, GALV)
        pts = []
        for k in range(40):
            a = 2 * pi * k / 8
            pts.append((S0[0] + 0.045 * sin(a), S0[1] - 0.075 - 0.011 * k - 0.16 * (0.5 - 0.5 * cos(a)), z + 0.012 * cos(a)))
        sweep(H('rope'), [(S0[0], S0[1] - 0.052, z)] + pts, 0.010, MANILA, lay=3)
        sweep(H('rope'), [(S0[0] + 0.058, S0[1] - 0.30, z - 0.02), (S0[0] - 0.058, S0[1] - 0.31, z - 0.02), (S0[0] - 0.058, S0[1] - 0.32, z + 0.03), (S0[0] + 0.058, S0[1] - 0.33, z + 0.03)], 0.006, MANILA)

    # ---- the frames, the falls' standing parts, the winch
    lines = {}
    for end in (1, -1):
        lines[end] = _frame(kit, end * ZA, end)
        # the standing part from the lead sheave up into the arm: drawn as long as it is when the arm is out; the arm hides the rest
        F, sp_out = Vector((FX, FY, 0)), Vector(rot(SP) + (0.0,))
        d = (Vector((SP[0], SP[1], 0)) - F).normalized()
        length = (sp_out - F).length + 0.03
        kit.p('wire', 'lead').tube((FX + d.x * 0.07, FY + d.y * 0.07, end * ZA), (FX + d.x * length, FY + d.y * length, end * ZA), WIRE, colour=WIREC)
    ax = _winch(kit)
    D = lambda key: kit.p(key, 'drum')
    g = MACHINE_GREEN
    lathe(D('paint'), (-3.585, ax, 0.0), PORT, [(0.0, 0.05), (0.0, 0.26), (0.016, 0.26), (0.016, 0.172), (0.142, 0.172), (0.142, 0.26), (0.158, 0.26), (0.158, 0.172),
                                               (0.284, 0.172), (0.284, 0.26), (0.300, 0.26), (0.300, 0.05)], tint(g, 0.85), caps=(False, False))
    for x0 in (-3.569, -3.427):                                     # the wire on each half, two layers of it; its end clamped to the flange
        for k in range(7):
            D('wire').ring((x0 + 0.010 + 0.0175 * k, ax, 0.0), PORT, 0.180 + WIRE, WIRE, tint(WIREC, 0.92 + 0.04 * (k % 2)))
        D('steel').block((x0 - 0.020, ax + 0.20, -0.02), (x0 - 0.016 + 0.004, ax + 0.24, 0.02), STEEL, r=0.003)
    for k in range(6):                                              # lightening holes are not drawn; six bolts on the outer flange show it turn
        a = 2 * pi * k / 6
        bolt(D('steel'), (-3.585, ax + 0.215 * sin(a), 0.215 * cos(a)), (-1, 0, 0), 0.014)
    for end in (1, -1):                                             # each fall from the drum's underside along the deck to its frame
        gx = lines[end]
        wire.tube((gx, FY - RF, end * 0.02), (gx, FY - RF, end * (ZA - 0.10)), WIRE, colour=WIREC)
    # a guard bar inboard of the wires' runs, on posts: it marks the station's edge and keeps feet out of the wire
    for z0, z1 in ((-ZA + 0.42, -0.62), (0.70, ZA - 0.42)):
        paint.tube((-3.66, 0.42, z0), (-3.66, 0.42, z1), 0.021, colour=YELLOW)
        for z in (z0 + 0.05, (z0 + z1) / 2, z1 - 0.05):
            paint.tube((-3.66, 0.0, z), (-3.66, 0.42, z), 0.017, colour=YELLOW)

    # ---- the gripes: each a wire pendant from a hook on her inboard gunwale down to a slip and a bottle screw on a deck eye.
    # The pendant is the boat's and goes with her; the slip and screw fall flat on the deck as she leaves.
    for end in (1, -1):
        zg = end * 1.70
        t = zg / LBT.HALF
        gy = YK0 + LBT.gun_y(t)
        gxo = CL0 - LBT.hb(t)
        ex = -3.14
        white.block((ex - 0.07, 0.0, zg - 0.07), (ex + 0.07, 0.012, zg + 0.07), tint(DAVIT_WHITE, 0.94), r=0.003)       # the eye plate on the deck
        galv.ring((ex, 0.040, zg), FWD, 0.026, 0.008, GALV)
        G = lambda key, e=end: kit.p(key, 'gripe-f' if e > 0 else 'gripe-a')
        top = Vector((gxo - 0.030, gy - 0.02, zg))
        foot = Vector((ex, 0.060, zg))
        d = (top - foot).normalized()
        at = lambda s: tuple(foot + d * s)
        G('galv').ring(at(0.03), PORT, 0.022, 0.006, GALV)                                                              # a shackle in the eye
        lathe(G('galv'), at(0.06), tuple(d), [(0.0, 0.008), (0.06, 0.008), (0.07, 0.018), (0.33, 0.018), (0.34, 0.008), (0.40, 0.008)], GALV)   # the bottle screw
        sweep(G('galv'), [at(0.46), at(0.50), tuple(foot + d * 0.56 + Vector((0, 0, 0.03))), at(0.62), tuple(foot + d * 0.56 + Vector((0, 0, -0.03))), at(0.50)], 0.007, GALV)   # the slip
        B('wire').tube(at(0.66), tuple(top - d * 0.02), 0.005, colour=WIREC)                                            # the pendant
        B('galv').ring(at(0.645), PORT, 0.020, 0.005, GALV)
        # the gunwale hook: a flat bar bent over her capping
        sweep(B('galv'), [tuple(top - d * 0.03), (gxo - 0.030, gy + 0.030, zg), (gxo + 0.050, gy + 0.030, zg), (gxo + 0.050, gy - 0.02, zg)], 0.008, GALV)
        kit.movers.append(dict(id=kit.mid('gripe-f' if end > 0 else 'gripe-a'), kind='turn', input=kit.mid('davit'), axis=[-end, 0, 0], pivot=[ex, 0.040, zg], ratio=88.0 / TURN))

    # ---- the deck's edge: a coaming bar; a rail at each end of the station to meet the ship's; the embarkation ladder; the light
    white.block((-0.035, 0.0, -4.35), (-0.005, 0.10, 4.35), tint(DAVIT_WHITE, 0.94), r=0.004)
    for end in (1, -1):
        for h, r in ((1.0, 0.019), (0.62, 0.012), (0.30, 0.012)):
            white.tube((-0.06, h, end * 3.80), (-0.06, h, end * 4.40), r, colour=DAVIT_WHITE)
        for z in (3.80, 4.40):
            white.tube((-0.06, 0.0, end * z), (-0.06, 1.0, end * z), 0.0135, colour=DAVIT_WHITE)
    # the embarkation ladder, rolled in its cradle forward of the boat: rope sides, wooden steps, made fast to two deck eyes
    lz, lx = 4.05, -0.52
    for z in (lz - 0.26, lz + 0.26):
        prism(galv, [(lx - 0.30, 0.0, z - 0.004), (lx + 0.30, 0.0, z - 0.004), (lx + 0.30, 0.26, z - 0.004), (lx + 0.16, 0.10, z - 0.004), (lx - 0.16, 0.10, z - 0.004),
                     (lx - 0.30, 0.26, z - 0.004)], (0, 0, 0.008), GALV)
    galv.block((lx - 0.30, 0.0, lz - 0.264), (lx - 0.292, 0.10, lz + 0.264), GALV, r=0.002)
    galv.block((lx + 0.292, 0.0, lz - 0.264), (lx + 0.30, 0.10, lz + 0.264), GALV, r=0.002)
    wood = kit.p('wood')
    for k in range(11):                                             # the steps, wound round: each a batten along the roll
        a = 2 * pi * k / 11
        rr = 0.165
        c = Vector((lx + rr * cos(a), 0.10 + 0.225 + rr * sin(a), lz))
        with turned(kit, tuple(c), about=FWD, angle=degrees(a) + 90):
            wood.block((-0.055, -0.012, -0.24), (0.055, 0.012, 0.24), tint(TEAK, 0.95 + 0.03 * (k % 3)), r=0.004)
    for k in range(6):                                              # and the turn inside it
        a = 2 * pi * (k + 0.5) / 6
        c = Vector((lx + 0.118 * cos(a), 0.325 + 0.118 * sin(a), lz))
        with turned(kit, tuple(c), about=FWD, angle=degrees(a) + 90):
            wood.block((-0.050, -0.012, -0.24), (0.050, 0.012, 0.24), tint(TEAK, 0.9 + 0.03 * (k % 3)), r=0.004)
    for z in (lz - 0.19, lz + 0.19):
        sweep(rope, [(lx + 0.1415 * cos(2 * pi * k / 16), 0.325 + 0.1415 * sin(2 * pi * k / 16), z) for k in range(16)], 0.011, MANILA, closed=True, lay=3)
        pts = [(lx + 0.185 * cos(2 * pi * k / 24), 0.325 + 0.185 * sin(2 * pi * k / 24), z) for k in range(24)]
        sweep(rope, pts, 0.011, MANILA, closed=True, lay=3)
        sweep(rope, [(lx + 0.185 * cos(radians(200)), 0.325 + 0.185 * sin(radians(200)), z), (lx - 0.26, 0.10, z), (lx - 0.36, 0.03, z)], 0.011, MANILA, lay=3)
        galv.ring((lx - 0.38, 0.030, z), FWD, 0.022, 0.007, GALV)
        white.block((lx - 0.43, 0.0, z - 0.04), (lx - 0.33, 0.010, z + 0.04), tint(DAVIT_WHITE, 0.94), r=0.002)
    sweep(rope, [(lx - 0.296, 0.09, lz), (lx - 0.30, 0.20, lz), (lx - 0.20, 0.50, lz), (lx, 0.522, lz), (lx + 0.20, 0.50, lz), (lx + 0.30, 0.20, lz), (lx + 0.296, 0.09, lz)], 0.006, POLYPROP)     # its lashing
    # the station's light, on a post abaft the boat: it lights the water where she lands
    pz, px = -4.05, -0.45
    white.tube((px, 0.0, pz), (px, 0.012, pz), 0.07, colour=tint(DAVIT_WHITE, 0.94))
    bolt_circle(steel, (px, 0.012, pz), UP, 0.052, 4, 0.010)
    white.tube((px, 0.012, pz), (px, 2.45, pz), 0.030, colour=DAVIT_WHITE)
    sweep(white, [(px, 2.45, pz), (px + 0.02, 2.62, pz), (px + 0.14, 2.72, pz), (px + 0.30, 2.70, pz)], 0.021, DAVIT_WHITE)
    with turned(kit, (px + 0.32, 2.67, pz), x=(0.80, -0.60, 0.0), z=FWD):
        paint.block((-0.02, -0.12, -0.15), (0.14, 0.12, 0.15), LIGHT, r=0.012)
        kit.p('lens').block((0.14, -0.10, -0.13), (0.146, 0.10, 0.13), srgb(0xf6f1e2), r=0.002)
        galv.tube((0.02, 0.12, 0.0), (0.02, 0.15, 0.0), 0.012, colour=BRASS)
    cab = [(px + 0.325, 2.80, pz), (px + 0.20, 2.80, pz - 0.035), (px + 0.03, 2.60, pz - 0.035), (px, 2.30, pz - 0.038), (px, 0.10, pz - 0.038), (px, 0.04, pz - 0.075)]
    kit.run('cables', cab, 0.008, BLACK)
    for y in (0.35, 0.90, 1.45, 2.00, 2.42):
        galv.ring((px, y, pz - 0.019), UP, 0.034, 0.004, GALV)                                                          # a clip round post and cable
    galv.tube((px, 0.0, pz - 0.075), (px, 0.045, pz - 0.075), 0.016, colour=BRASS)
    galv.ring((px + 0.18, 2.745, pz - 0.018), (0.7, -0.5, 0), 0.034, 0.004, GALV)

    # ---- bowsing tackles, made up and hung on the forward and after frames; the placard on the forward frame
    for end in (1, -1):
        zp = end * (ZA + 0.34)                                      # the frame's outer post, its outer side
        zc = zp + end * 0.060
        hx_, hy_ = -3.29, 1.30
        galv.tube((hx_, hy_, zp), (hx_, hy_, zc), 0.007, colour=GALV)
        galv.tube((hx_, hy_, zc), (hx_, hy_ + 0.045, zc), 0.007, colour=GALV)
        galv.ring((hx_, hy_ - 0.016, zc), PORT, 0.020, 0.005, GALV)
        for y in (hy_ - 0.11, hy_ - 0.57):                          # its two blocks
            wood.block((hx_ - 0.035, y - 0.075, zc - 0.035), (hx_ + 0.035, y + 0.075, zc + 0.035), tint(MAHOGANY, 1.1), r=0.02)
        for k in range(4):
            xo = hx_ - 0.030 + 0.020 * k
            sweep(rope, [(xo, hy_ - 0.18, zc), (xo, hy_ - 0.50, zc)], 0.006, MANILA)
        pts = [(hx_ + 0.06 * sin(2 * pi * k / 6), hy_ - 0.65 - 0.016 * k, zc + 0.03 * cos(2 * pi * k / 6)) for k in range(22)]
        sweep(rope, [(hx_, hy_ - 0.61, zc)] + pts, 0.006, MANILA, lay=3)
    zc = ZA
    label(kit, mark, (-3.336, 1.05, zc), (0, 0, 1), UP, 0.56, 0.42, WHITE, (name.upper(), f'{LBT.PERSONS} PERSONS', '1 REMOVE HARBOUR PINS', '2 LET GO GRIPES', '3 LIFT BRAKE LEVER',
                                                                         '4 BOARD AT DECK LEVEL', '5 LOWER  RELEASE HOOKS'), ink=BLACK, proud=0.0015, border=0.008)
    white.block((-3.336, 0.82, zc - 0.345), (-3.330, 1.28, zc + 0.345), DAVIT_WHITE, r=0.001)

    # ---- how it works
    S_out = rot(S0)
    stops = [dict(v=round(run, 2), say='afloat')]
    if embark:
        stops.insert(0, dict(v=float(embark), say='at the embarkation deck'))
    kit.inputs += [
        dict(id=kit.mid('davit'), name=f'{name}: davits', min=0, max=TURN, step=1, unit='°', below='', above='turned out', rest='stowed',
             keys=['In', 'Stop', 'Out'], stops=[dict(v=TURN, say='turned out')], rate=3),
        dict(id=kit.mid('falls'), name=f'{name}: falls', min=0, max=round(run, 2), step=1, unit='m', below='', above='lowered', rest='hoisted',
             keys=['Hoist', 'Stop', 'Lower'], stops=stops, rate=0.6),
    ]
    pivot = [PX, PY, 0.0]
    kit.movers += [
        dict(id=kit.mid('arm'), kind='turn', input=kit.mid('davit'), axis=[0, 0, -1], pivot=pivot),
        dict(id=kit.mid('head'), kind='carry', input=kit.mid('davit'), axis=[0, 0, -1], pivot=pivot, point=[S0[0], S0[1], 0.0]),
        dict(id=kit.mid('lead'), kind='aim', input=kit.mid('davit'), axis=[0, 0, -1], pivot=pivot, anchor=[FX, FY, 0.0], pin=[SP[0], SP[1], 0.0]),
        dict(id=kit.mid('boat'), kind='slide', input=kit.mid('falls'), axis=[0, -1, 0], pivot=[0, 0, 0], ratio=1.0, on=kit.mid('head')),
        dict(id=kit.mid('drum'), kind='turn', input=kit.mid('falls'), axis=[1, 0, 0], pivot=[-3.5, ax, 0.0], ratio=round(360 * 2 / (2 * pi * (0.18 + WIRE)), 1)),
    ]
    for k in range(1, n_seg):
        kit.movers.append(dict(id=kit.mid(f'fall-{k}'), kind='slide', input=kit.mid('falls'), axis=[0, -1, 0], pivot=[0, 0, 0], ratio=round(k / (n_seg - 1), 5), on=kit.mid('head')))
    kit.clear = ((-3.95, -height - 1.0, -4.42), (S_out[0] + 0.06 + LBT.BEAM / 2 + 0.25, 5.75, 4.42))
    kit.known_by = (
        'Two pivot gravity davits: each a box-girder arm with flanges, a boss on a pin between two frame cheeks with keep plates and '
        'brackets on a doubler; head sheave on an axle between two bolted cheeks, a becket under it; keel horn with a wooden pad, '
        'rubber and a cleat; belly pad; fairlead in the heel; rungs; load plate; the stop post with a rubber head it lands on turned '
        'out, the stop bar with a rubber pad it leans on stowed, the red harbour pin on its lanyard; lead sheave and flat sheave on '
        'the frame. Falls of 16 mm wire in two parts to a floating block (cheeks, sheave, pin, long link) on each of the boat\'s '
        'hooks. Winch: bedplate on two bearers, split drum with the wire on it, two pedestal bearings, gearbox with cover, filler '
        'and level glass, flange motor with fins, terminal box, gland and cable to a deck gland, band brake with its band, link and '
        'weighted lever, the crank\'s square and the crank in its clips, push-button box on a post, guard bar. Gripes: eye plate, '
        'shackle, bottle screw, slip, pendant, gunwale hook. Span wire with two lifelines in hanks. Coaming bar, end rails, '
        'embarkation ladder rolled in a cradle and lashed, the station\'s light on a post with its cable clipped down to a deck '
        'gland, two bowsing tackles, the instruction placard. The boat: see the lifeboat\'s own row.')
