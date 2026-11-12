"""
Deck fittings: the mooring and anchoring gear (fittings.py is the door; fittings_kit.py the tools).

Windlass, chain stopper with the hawse pipe's mouth, the cable itself in stud links, mooring winch, capstan, bitts, panama
chock, roller fairlead, rope reel, and a mooring rope coiled down on a grating.

Sizes are real sizes: [R] the yard's reference files, [M] a maker's sheet or a standard as recalled (not read tonight),
[Y] the yard's own estimate. For a ro-ro ship of about 125 m: anchors of about 4 t on 48 mm stud-link cable [Y, from the
equipment-number tables as recalled]; mooring ropes of 64 mm polypropylene; winches of 10 t pull at 15 m a minute [M].

What works. A chain cannot run in a file whose parts are rigid, so the windlass is drawn as it stands in port: the cable
lifter declutched and held by its brake, the cable in the stopper, and the shaft with the mooring drum and the warping end
turning (<name>-run, in metres of rope). The mooring winch's drum and the capstan's barrel turn the same way.
"""
from math import pi, sin, cos, tan, atan2, acos, radians, degrees, hypot, sqrt
from mathutils import Vector
from shipyard import tint, srgb
from fittings_kit import *          # noqa: F401,F403
from fittings_kit import fitting

CHAIN_D = 0.048                     # the cable's bar: 48 mm
CABLE_Y = 0.30                      # the cable's line over the deck where it runs through the stopper
HAWSER = 0.032                      # a 64 mm mooring rope, to its middle
WINCH_GREEN = srgb(0x4f7a6a)
ROPE_BLUE, ROPE_BUFF = srgb(0x4a78b0), srgb(0xcdb67a)


# ---------------------------------------------------------------------------------------------------------------------
def chain(p, path, d, colour, phase=0.0, first_flat=True, across=PORT, count=None):
    """Stud-link cable along a line of points: every link a closed bar of round section with its stud, one lying flat (its
    width along `across`), the next on edge. Links are 6 d long and 3.6 d wide, so the cable's pitch is 4 d."""
    pts = [Vector(q) for q in path]
    seg = [(b - a).length for a, b in zip(pts, pts[1:])]
    total = sum(seg)
    pitch, a_, rc = 4 * d, (6 - 3.6) * d / 2, (3.6 - 1) * d / 2
    n = int((total - phase) / pitch) + 1 if count is None else count
    w0 = Vector(across).normalized()
    made = 0
    for i in range(n):
        s = phase + i * pitch
        if s > total:
            break
        k, acc = 0, 0.0
        while k < len(seg) - 1 and acc + seg[k] < s:
            acc += seg[k]
            k += 1
        f = (s - acc) / max(seg[k], 1e-9)
        c = pts[k] + (pts[k + 1] - pts[k]) * f
        # the link's own run: from half a pitch behind to half a pitch ahead along the path
        s0, s1 = max(0.0, s - pitch / 2), min(total, s + pitch / 2)

        def at(sq):
            kk, ac = 0, 0.0
            while kk < len(seg) - 1 and ac + seg[kk] < sq:
                ac += seg[kk]
                kk += 1
            return pts[kk] + (pts[kk + 1] - pts[kk]) * ((sq - ac) / max(seg[kk], 1e-9))
        t = (at(s1) - at(s0)).normalized()
        w = (w0 - t * w0.dot(t)).normalized()
        if (i % 2 == 0) != first_flat:
            w = t.cross(w)
        col = tint(colour, 0.9 + 0.2 * ((i * 37) % 7) / 7)
        sweep(p, [tuple(c + t * u + w * v) for u, v in stadium(a_, 0, rc, n=6)], d / 2, col, closed=True)
        p.tube(tuple(c - w * rc), tuple(c + w * rc), 0.36 * d, colour=col, caps=(False, False))
        made += 1
    return made


def handwheel(p, c, axis, R, colour, spokes=4, rim=0.012):
    """A handwheel: rim, spokes, hub with its nut."""
    a, e1, e2 = frame_of(axis)
    c = Vector(c)
    p.ring(tuple(c), tuple(a), R, rim, colour)
    lathe(p, tuple(c - a * 0.022), tuple(a), [(0.0, 0.0), (0.0, 0.034), (0.044, 0.034), (0.044, 0.0)], colour)
    for k in range(spokes):
        q = 2 * pi * k / spokes + pi / spokes
        d = e1 * cos(q) + e2 * sin(q)
        p.tube(tuple(c + d * 0.03), tuple(c + d * (R - 0.004)), rim * 0.8, colour=colour, caps=(False, False))


def pedestal(kit, x, ys, y0, colour, half=0.15, t=0.07, r=0.085):
    """A plummer block on a stand: two legs up from the bedplate to a bearing housing split on the shaft's line, its cap held
    by two bolts, a grease nipple on top."""
    paint, steel, galv = kit.p('paint'), kit.p('steel'), kit.p('galv')
    prism(paint, [(x - t / 2, y0, -half), (x - t / 2, y0, half), (x - t / 2, ys - 0.02, r + 0.035), (x - t / 2, ys - 0.02, -r - 0.035)], (t, 0, 0), colour)
    paint.block((x - t / 2 - 0.02, y0, -half - 0.03), (x + t / 2 + 0.02, y0 + 0.025, half + 0.03), colour, r=0.004)
    lathe(paint, (x - t / 2 - 0.005, ys, 0.0), PORT, [(0.0, 0.0), (0.0, r), (t + 0.01, r), (t + 0.01, 0.0)], tint(colour, 0.95))
    for sz in (-1, 1):
        paint.block((x - t / 2, ys - 0.02, sz * (r + 0.035) - 0.03), (x + t / 2, ys + 0.02, sz * (r + 0.035) + 0.03), colour, r=0.004)
        bolt(steel, (x, ys + 0.02, sz * (r + 0.035)), UP, 0.016)
        bolt(steel, (x, y0 + 0.025, sz * (half - 0.01)), UP, 0.016)
    galv.tube((x, ys + r, 0.0), (x, ys + r + 0.018, 0.0), 0.007, colour=BRASS)


def band_brake(kit, x0, x1, ys, r, y0, colour, mover=None, post_z=-0.60, top=1.32):
    """A band brake: the drum on the shaft (it turns with the shaft when `mover` says so), the steel band round it with its
    lining, the band's two ends brought to a screw spindle that a handwheel on a post tightens."""
    paint, steel = kit.p('paint'), kit.p('steel')
    lathe(kit.p('paint', mover), (x0, ys, 0.0), PORT, [(0.0, 0.06), (0.0, r), (x1 - x0, r), (x1 - x0, 0.06)], tint(DARK, 1.1))
    xm = (x0 + x1) / 2
    lathe(steel, (x0 + 0.012, ys, 0.0), PORT, [(0.0, r + 0.004), (0.0, r + 0.012), (x1 - x0 - 0.024, r + 0.012), (x1 - x0 - 0.024, r + 0.004)], tint(STEEL, 0.8), caps=(False, False))
    # the band's eye abaft the drum, the spindle up from it through a nut in the post's head, the handwheel on the spindle
    eye = (xm, ys + 0.10, -(r + 0.012))
    steel.block((xm - 0.03, ys + 0.06, -(r + 0.055)), (xm + 0.03, ys + 0.14, -(r + 0.004)), STEEL, r=0.004)
    paint.block((xm - 0.045, 0.0, post_z - 0.045), (xm + 0.045, top - 0.10, post_z + 0.045), colour, r=0.006)     # the post stands on the deck abaft the seat
    paint.block((xm - 0.07, 0.0, post_z - 0.08), (xm + 0.07, 0.016, post_z + 0.08), colour, r=0.004)
    paint.block((xm - 0.05, top - 0.10, post_z - 0.05), (xm + 0.05, top - 0.02, -(r + 0.012) + 0.05), colour, r=0.006)      # the head, reaching over the band's eye
    zs = -(r + 0.030)
    steel.tube((xm, ys + 0.14, zs), (xm, top + 0.05, zs), 0.016, colour=STEEL)
    handwheel(steel, (xm, top + 0.03, zs), UP, 0.17, RED)
    return eye


def rope_on_drum(p, x0, x1, ys, r0, dia, colour, layers=2):
    """Rope wound on a drum: coil beside coil, a second layer part of the way across."""
    n = int((x1 - x0) / dia)
    step = (x1 - x0) / n
    # one turned shape cannot fold back on itself along the axis, so each layer is turned by itself
    for layer in range(layers):
        m = n - layer if layer == 0 else int(n * (0.75 - 0.15 * layer))
        rb = r0 + layer * dia * 0.82
        off = layer * step / 2                                       # half a coil along: it lies in the grooves of the layer under it
        pr = [(off, rb + dia * 0.18)]
        for k in range(m):
            xa, xb = off + k * step, off + (k + 1) * step
            pr += [(xa + step * 0.12, rb + dia * 0.62), (xa + step * 0.5, rb + dia), (xa + step * 0.88, rb + dia * 0.62), (xb, rb + dia * 0.18)]
        if layer == 0:
            pr = [(0.0, rb)] + pr + [(m * step, rb)]
        lathe(p, (x0, ys, 0.0), PORT, pr, lambda i, c=colour: tint(c, 0.86 + 0.14 * ((i // 2) % 2)), caps=(False, False))


def warping_end(p, x0, ys, colour, length=0.36, way=1):
    """A warping end: a waisted barrel with a flange each side, six low whelps for the rope to bite on."""
    L = length
    lathe(p, (x0, ys, 0.0), (way, 0, 0), [(0.0, 0.06), (0.0, 0.275), (0.025, 0.275), (0.07, 0.225), (0.16, 0.20), (0.25, 0.215), (L - 0.04, 0.265), (L - 0.02, 0.28),
                                         (L, 0.28), (L, 0.0)], colour, caps=(False, False))
    for k in range(6):
        a = 2 * pi * k / 6
        d = Vector((0.0, cos(a), sin(a)))
        bar(p, tuple(Vector((x0 + way * 0.06, ys, 0.0)) + d * 0.222), tuple(Vector((x0 + way * (L - 0.05), ys, 0.0)) + d * 0.262), 0.035, 0.016, tint(colour, 0.92), up=tuple(d))


def bedplate(kit, x0, x1, half, colour, h=0.12, t=0.03, hole=None):
    """A winch's seat: two bearers welded to the deck along the shaft's line, a bedplate bolted down on them. `hole` = (from,
    to) along the shaft where the plate and the after bearer are left open for the spurling pipe."""
    paint, steel = kit.p('paint'), kit.p('steel')
    lengths = [(x0, x1)] if not hole else [(x0, hole[0]), (hole[1], x1)]
    for sz in (-1, 1):
        for a, b in (lengths if sz < 0 else [(x0, x1)]):
            paint.block((a, 0.0, sz * (half - 0.09) - 0.06), (b, h, sz * (half - 0.09) + 0.06), tint(colour, 0.8), r=0.006)
            n = max(1, int((b - a) / 0.55))
            for k in range(n + 1):
                bolt(steel, (a + 0.06 + (b - a - 0.12) * k / n, h + t, sz * (half - 0.09)), UP, 0.020)
    for a, b in lengths:
        paint.block((a - (0.01 if a == x0 else 0.0), h, -half), (b + (0.01 if b == x1 else 0.0), h + t, half), tint(colour, 0.9), r=0.005)
    if hole:
        paint.block((hole[0], h, -0.07), (hole[1], h + t, half), tint(colour, 0.9), r=0.005)
    return h + t


def gear_case(kit, x0, x1, ys, y0, colour, motor_z=0.50, motor_y=None):
    """The enclosed gearing and the low-pressure hydraulic motor that drives it: the wheel's case round the shaft, the
    pinion's case forward and below it with the motor on its end, the case's inspection cover, the motor's control valve
    with its lever, two large pipes from the motor down through flanges on the deck."""
    paint, steel, galv, plastic = kit.p('paint'), kit.p('steel'), kit.p('galv'), kit.p('plastic')
    my = motor_y or (y0 + 0.30)
    w = x1 - x0
    lathe(paint, (x0, ys, 0.0), PORT, [(0.0, 0.0), (0.0, 0.50), (0.03, 0.53), (w - 0.03, 0.53), (w, 0.50), (w, 0.0)], colour)
    paint.block((x0, y0, -0.42), (x1, ys - 0.20, 0.42), colour, r=0.01)
    lathe(paint, (x0 - 0.02, my, motor_z), PORT, [(0.0, 0.0), (0.0, 0.21), (w + 0.04, 0.21), (w + 0.04, 0.0)], colour)
    paint.block((x0 - 0.02, y0, motor_z - 0.21), (x1 + 0.02, my, motor_z + 0.21), colour, r=0.008)
    # the inspection cover on the wheel's case, with its bolts; the oil filler; the level glass
    lathe(paint, (x0 - 0.012, ys, 0.0), PORT, [(0.0, 0.0), (0.0, 0.30), (0.012, 0.30)], tint(colour, 0.93), caps=(True, False))
    bolt_circle(steel, (x0 - 0.012, ys, 0.0), (-1, 0, 0), 0.265, 10, 0.014)
    galv.tube((x0 + w / 2, ys + 0.53, 0.0), (x0 + w / 2, ys + 0.59, 0.0), 0.022, colour=BRASS)
    plastic.tube((x0 - 0.02, y0 + 0.16, motor_z - 0.10), (x0 - 0.03, y0 + 0.16, motor_z - 0.10), 0.024, colour=srgb(0xd8c27a))
    # the motor: a short fat barrel, flanged to the pinion's case, finished in the maker's grey
    grey = srgb(0x8d9aa0)
    mx = x0 - 0.02
    lathe(paint, (mx, my, motor_z), (-1, 0, 0), [(0.0, 0.0), (0.0, 0.25), (0.03, 0.25), (0.03, 0.22), (0.30, 0.22), (0.33, 0.19), (0.33, 0.0)], grey)
    bolt_circle(steel, (mx - 0.03, my, motor_z), (-1, 0, 0), 0.235, 8, 0.014)
    # the control valve on the motor, its lever
    paint.block((mx - 0.27, my + 0.20, motor_z - 0.10), (mx - 0.07, my + 0.36, motor_z + 0.10), grey, r=0.01)
    steel.tube((mx - 0.17, my + 0.36, motor_z), (mx - 0.17, my + 0.40, motor_z), 0.02, colour=STEEL)
    sweep(steel, [(mx - 0.17, my + 0.40, motor_z), (mx - 0.17, my + 0.62, motor_z - 0.10), (mx - 0.17, my + 0.86, motor_z - 0.30)], 0.011, STEEL)
    plastic.ball((mx - 0.17, my + 0.875, motor_z - 0.312), 0.028, BLACK)
    # two pipes: from the valve's sides down to flanges bolted on the deck
    for sz in (-1, 1):
        zp = motor_z + sz * 0.17
        pts = [(mx - 0.17, my + 0.28, motor_z + sz * 0.10), (mx - 0.17, my + 0.28, zp + sz * 0.10), (mx - 0.17, 0.035, zp + sz * 0.10)]
        kit.run('pipes', pts, 0.042, tint(colour, 0.85))
        plate_disc(galv, (mx - 0.17, 0.0, zp + sz * 0.10), UP, 0.095, 0.035, tint(colour, 0.8))
        bolt_circle(steel, (mx - 0.17, 0.035, zp + sz * 0.10), UP, 0.072, 6, 0.012)
        plate_disc(galv, (mx - 0.17, my + 0.28, motor_z + sz * 0.10), (0, 0, sz), 0.06, 0.014, grey)
    return mx - 0.33


def _run_input(kit, what, turns_m, max_m=12.0):
    """The keys for a drum that heaves and veers: metres of rope, at 15 m a minute."""
    kit.inputs.append(dict(id=kit.mid('run'), name=what, min=0, max=max_m, step=1, unit='m', below='', above='veered', rest='hove in',
                           keys=['Heave', 'Stop', 'Veer'], stops=[dict(v=max_m, say=f'{max_m:.0f} m veered')], rate=0.25))
    return round(turns_m, 1)


# =====================================================================================================================
@fitting('windlass', size=(2.95, 1.5, 1.45), front='+z (toward the hawse pipe)', title='Windlass',
         note='combined anchor windlass and mooring winch; shaft along x; origin on the deck under the cable lifter; the cable leaves it toward +z; options lead (m to the chain stopper)')
def windlass(kit, lead=1.9, **_):
    """
    A combined anchor windlass and mooring winch of the low-pressure hydraulic kind fitted in the 1970s: bedplate on two
    bearers; the cable lifter (five snugs) on the shaft with its band brake and handwheel; the dog clutch and its lever; gear
    case and hydraulic motor with control valve, lever and pipes; a mooring drum with rope on it and its own band brake; a
    warping end; three pedestal bearings; the spurling pipe abaft the cable lifter with the cable going down it, and the
    cable itself in stud links over the lifter and forward toward the stopper.
    """
    paint, steel, galv, chn = kit.p('paint'), kit.p('steel'), kit.p('galv'), kit.p('chain')
    g = WINCH_GREEN
    ys = 0.74
    y0 = bedplate(kit, -1.02, 1.95, 0.52, g, hole=(-0.26, 0.26))
    RP = 10 * 4 * CHAIN_D / (2 * pi)                                 # five snugs take ten links a turn: the cable's line round the lifter
    # ---- the cable lifter: two cheeks with five snugs each, a groove between for the links that stand on edge; its brake
    lathe(paint, (-0.17, ys, 0.0), PORT, [(0.0, 0.06), (0.0, 0.44), (0.025, 0.44), (0.085, 0.27), (0.132, 0.235), (0.132, 0.20), (0.208, 0.20), (0.208, 0.235),
                                         (0.255, 0.27), (0.315, 0.44), (0.34, 0.44), (0.34, 0.06)], tint(DARK, 1.15), caps=(False, False))
    for k in range(5):
        with turned(kit, (0.0, ys, 0.0), about=PORT, angle=72 * k + 18):
            for sx in (-1, 1):
                prism(paint, [(sx * 0.050, 0.25, -0.045), (sx * 0.050, 0.25, 0.045), (sx * 0.050, 0.345, 0.030), (sx * 0.050, 0.345, -0.030)], (sx * 0.075, 0, 0), tint(DARK, 1.0))
    band_brake(kit, 0.17, 0.30, ys, 0.44, y0, g)
    # ---- the clutch between gearing and lifter: a sliding dog on the shaft, its fork and lever
    lathe(paint, (-0.30, ys, 0.0), PORT, [(0.0, 0.07), (0.0, 0.15), (0.035, 0.15), (0.035, 0.11), (0.075, 0.11), (0.075, 0.17), (0.13, 0.17), (0.13, 0.07)], tint(DARK, 1.3), caps=(False, False))
    sweep(steel, [(-0.245, ys, 0.10), (-0.245, ys + 0.10, 0.20), (-0.245, ys + 0.56, 0.26)], 0.014, STEEL)
    kit.p('plastic').ball((-0.245, ys + 0.585, 0.263), 0.03, RED)
    paint.block((-0.275, y0, 0.17), (-0.215, ys + 0.09, 0.23), g, r=0.006)                                           # the fork's fulcrum on the bedplate
    # ---- gearing and motor at the shaft's port end
    gear_case(kit, -0.92, -0.42, ys, y0, g)
    # ---- bearings; the shaft; mooring drum, its brake; warping end
    for x in (-0.36, 0.39, 1.49):
        pedestal(kit, x, ys, y0, g)
    M = lambda key: kit.p(key, 'run')
    M('steel').tube((0.31, ys, 0.0), (1.56, ys, 0.0), 0.06, colour=STEEL)
    steel.tube((-0.42, ys, 0.0), (0.31, ys, 0.0), 0.058, colour=tint(STEEL, 0.9), caps=(False, False))
    lathe(M('paint'), (0.46, ys, 0.0), PORT, [(0.0, 0.06), (0.0, 0.52), (0.03, 0.52), (0.03, 0.26), (0.77, 0.26), (0.77, 0.52), (0.80, 0.52), (0.80, 0.06)], g, caps=(False, False))
    for k in range(6):
        bolt(M('steel'), (0.46, ys + 0.42 * sin(2 * pi * k / 6), 0.42 * cos(2 * pi * k / 6)), (-1, 0, 0), 0.018)
    rope_on_drum(M('rope'), 0.492, 1.228, ys, 0.26, 2 * HAWSER, ROPE_BLUE)
    band_brake(kit, 1.26, 1.38, ys, 0.40, y0, g, mover='run')
    warping_end(M('paint'), 1.56, ys, tint(DARK, 1.2))
    lathe(M('steel'), (1.92, ys, 0.0), PORT, [(0.0, 0.0), (0.0, 0.09), (0.02, 0.09), (0.02, 0.0)], STEEL)
    # ---- the spurling pipe abaft the lifter: a pipe up through the deck with a bell mouth; the cable down it
    sz = -RP
    lathe(galv, (0.0, -0.45, sz), UP, [(0.0, 0.125), (0.0, 0.14), (0.62, 0.14), (0.70, 0.175), (0.72, 0.19), (0.72, 0.175), (0.69, 0.16), (0.62, 0.125), (0.0, 0.125)], tint(g, 0.8), caps=(False, False))
    lathe(galv, (0.0, 0.0, sz), UP, [(0.0, 0.14), (0.0, 0.20), (0.016, 0.20), (0.016, 0.14)], tint(g, 0.8), caps=(False, False))   # its collar, welded to the deck
    kit.cut('deck', (-0.14, -0.012, sz - 0.14), (0.14, 0.0, sz + 0.14), round_=((0.0, 0.0, sz), 0.14, UP))
    # ---- the cable: up the spurling pipe, over the lifter, forward to where the stopper takes it
    qy, qz = CABLE_Y, lead - 0.45
    dq = hypot(qy - ys, qz)
    phi_t = atan2(qy - ys, qz) + acos(RP / dq)
    path = [(0.0, -0.40, -RP), (0.0, ys, -RP)]
    steps = 14
    for k in range(1, steps + 1):
        a = pi + (phi_t - pi) * k / steps
        path.append((0.0, ys + RP * sin(a), RP * cos(a)))
    path.append((0.0, qy, qz))
    chain(chn, path, CHAIN_D, TAR, phase=0.07)
    # ---- how it works: the shaft with the mooring drum and the warping end turns; the lifter is out of clutch
    ratio = _run_input(kit, 'Windlass: mooring drum', 360 / (2 * pi * 0.32))
    kit.movers.append(dict(id=kit.mid('run'), kind='turn', input=kit.mid('run'), axis=[1, 0, 0], pivot=[0.0, ys, 0.0], ratio=ratio))
    label(kit, kit.p('mark'), (-0.932, ys, 0.0), (0, 0, 1), UP, 0.22, 0.10, srgb(0x1f3d5c), ('JSY 10 T', 'CABLE 48 MM'), ink=WHITE, proud=0.001)
    kit.clear = ((-1.5, 0.0, -1.2), (2.3, 1.7, lead - 0.4))
    kit.known_by = ('Bedplate on two bearers with holding-down bolts; cable lifter with five snugs a side and a groove, its band brake (drum, band, '
                    'eye, spindle, handwheel on a post); dog clutch with fork and lever; gear case with inspection cover and bolts, filler, level '
                    'glass; hydraulic motor with flange bolts, control valve and lever, two pipes to bolted deck flanges; three pedestal bearings '
                    'with caps, bolts and grease nipples; shaft; mooring drum with rope and its own band brake; warping end with six whelps; '
                    'spurling pipe with bell mouth and collar; stud-link cable over the lifter and down the pipe. The shaft, drum and warping '
                    'end turn')


@fitting('chain-stopper', size=(1.0, 0.62, 0.55), front='+z (toward the hawse pipe)', title='Chain stopper',
         note='roller stopper with a locking bar; the cable runs through it along z; origin on the deck under the roller; options hawse (m forward to the hawse pipe mouth), aft (m of cable drawn toward the windlass)')
def chain_stopper(kit, hawse=1.5, aft=0.45, **_):
    """
    A roller chain stopper: two cheeks on a bedplate bolted to a seat, a roller between them that the cable runs over, a
    locking bar hinged on one cheek that drops across a flat link and is pinned to the other; and forward of it the hawse
    pipe's mouth in the deck with its chafing lip, the cable going down it.
    """
    paint, steel, galv, chn = kit.p('paint'), kit.p('steel'), kit.p('galv'), kit.p('chain')
    g = WINCH_GREEN
    paint.block((-0.34, 0.0, -0.46), (0.34, 0.06, 0.46), tint(g, 0.8), r=0.006)
    paint.block((-0.36, 0.06, -0.48), (0.36, 0.085, 0.48), tint(g, 0.9), r=0.005)
    for sx in (-1, 1):
        for z in (-0.40, 0.0, 0.40):
            bolt(steel, (sx * 0.31, 0.085, z), UP, 0.020)
        prism(paint, [(sx * 0.14, 0.085, -0.42), (sx * 0.14, 0.085, 0.42), (sx * 0.14, 0.30, 0.42), (sx * 0.14, 0.48, 0.16), (sx * 0.14, 0.48, -0.20), (sx * 0.14, 0.30, -0.42)],
              (sx * 0.035, 0, 0), g)
        for z in (-0.30, 0.30):
            gusset(paint, (sx * 0.175, 0.085, z), (sx, 0, 0), UP, 0.11, 0.20, 0.014, g)
    ay = CABLE_Y - CHAIN_D / 2 - 0.085                              # the roller's axle: the flat links ride on its flanks, the others in its groove
    lathe(paint, (-0.14, ay, -0.10), PORT, [(0.0, 0.03), (0.0, 0.085), (0.05, 0.085), (0.10, 0.040), (0.18, 0.040), (0.23, 0.085), (0.28, 0.085), (0.28, 0.03)],
          tint(DARK, 1.2), caps=(False, False))
    steel.tube((-0.20, ay, -0.10), (0.20, ay, -0.10), 0.032, colour=STEEL)
    # the locking bar: hinged on the port cheek, dropped across a flat link between two that stand on edge, pinned to the starboard cheek
    bz, by_ = 0.146, CABLE_Y + CHAIN_D / 2 + 0.008
    steel.tube((0.205, by_ + 0.025, bz - 0.07), (0.205, by_ + 0.025, bz + 0.07), 0.022, colour=STEEL)                  # its hinge pin
    steel.block((-0.215, by_, bz - 0.035), (0.215, by_ + 0.05, bz + 0.035), RED, r=0.006)
    steel.tube((-0.215, by_ - 0.015, bz), (-0.215, by_ + 0.125, bz), 0.012, colour=STEEL)                              # the locking pin through the bar's end
    steel.ring((-0.215, by_ + 0.14, bz), PORT, 0.022, 0.005, STEEL)
    sweep(galv, [(-0.215, by_ + 0.125, bz), (-0.235, by_ + 0.05, bz + 0.08), (-0.21, by_ - 0.04, bz + 0.16), (-0.177, by_ - 0.07, bz + 0.18)], 0.003, GALV)   # its chain to the cheek
    # ---- the hawse pipe's mouth: a pipe sloping down and forward under the deck, a chafing lip round it on the deck
    hz = hawse
    sweep(galv, [(0.30 * cos(2 * pi * k / 40), 0.035, hz + 0.42 * sin(2 * pi * k / 40)) for k in range(40)], 0.05, tint(g, 0.8), closed=True)
    inner = [(0.25 * cos(2 * pi * k / 40), 0.0, hz + 0.37 * sin(2 * pi * k / 40)) for k in range(40)]
    slope = Vector((0.0, -0.70, 0.71))
    st = len(galv.f)
    galv.grid([[tuple(Vector(q) + slope * s) for q in inner] for s in (0.0, 0.9)], tint(DARK, 0.9), close=True)
    galv.orient(st, lambda c: Vector((0.0, 0.0, hz)) + slope * 0.45 - c)
    kit.cut('deck', (-0.25, -0.012, hz - 0.37), (0.25, 0.0, hz + 0.37), outline=inner)
    # ---- the cable: from toward the windlass over the roller, through under the bar, forward and down the hawse pipe
    path = [(0.0, CABLE_Y, -aft), (0.0, CABLE_Y, 0.30), (0.0, CABLE_Y - 0.04, hz - 0.34), (0.0, 0.14, hz - 0.08), (0.0, -0.05, hz + 0.12), (0.0, -0.55, hz + 0.62)]
    chain(chn, path, CHAIN_D, TAR, phase=0.02, first_flat=False)
    kit.clear = ((-0.8, 0.0, -0.7), (0.8, 0.9, hz + 0.9))
    kit.known_by = ('Bedplate on a seat with holding-down bolts; two cheeks with brackets; grooved roller on its axle; locking bar on a hinge pin, '
                    'its locking pin on a chain; the hawse pipe\'s mouth with a chafing lip, the pipe going down and forward; stud-link cable through it')


@fitting('mooring-winch', size=(2.4, 1.3, 1.45), front='+z (the rope leads off that way)', title='Mooring winch',
         note='shaft along x; origin on the deck under the drum; its drum and warping end turn')
def mooring_winch(kit, **_):
    """
    A hydraulic mooring winch: bedplate on two bearers; gear case and motor with control valve, lever and pipes; a drum with
    its rope and a band brake with handwheel; a warping end; two pedestal bearings.
    """
    paint, steel = kit.p('paint'), kit.p('steel')
    g = WINCH_GREEN
    ys = 0.72
    y0 = bedplate(kit, -1.28, 1.12, 0.50, g)
    gear_case(kit, -1.12, -0.62, ys, y0, g)
    for x in (-0.555, 0.665):
        pedestal(kit, x, ys, y0, g)
    M = lambda key: kit.p(key, 'run')
    M('steel').tube((-0.62, ys, 0.0), (0.74, ys, 0.0), 0.06, colour=STEEL)
    lathe(M('paint'), (-0.46, ys, 0.0), PORT, [(0.0, 0.06), (0.0, 0.54), (0.03, 0.54), (0.03, 0.27), (0.87, 0.27), (0.87, 0.54), (0.90, 0.54), (0.90, 0.06)], g, caps=(False, False))
    for k in range(6):
        bolt(M('steel'), (-0.46, ys + 0.44 * sin(2 * pi * k / 6), 0.44 * cos(2 * pi * k / 6)), (-1, 0, 0), 0.018)
    rope_on_drum(M('rope'), -0.428, 0.408, ys, 0.27, 2 * HAWSER, ROPE_BUFF)
    band_brake(kit, 0.46, 0.58, ys, 0.40, y0, g, mover='run')
    warping_end(M('paint'), 0.74, ys, tint(DARK, 1.2))
    lathe(M('steel'), (1.10, ys, 0.0), PORT, [(0.0, 0.0), (0.0, 0.09), (0.02, 0.09), (0.02, 0.0)], STEEL)
    ratio = _run_input(kit, 'Mooring winch', 360 / (2 * pi * 0.33))
    kit.movers.append(dict(id=kit.mid('run'), kind='turn', input=kit.mid('run'), axis=[1, 0, 0], pivot=[0.0, ys, 0.0], ratio=ratio))
    label(kit, kit.p('mark'), (-1.132, ys, 0.0), (0, 0, 1), UP, 0.22, 0.10, srgb(0x1f3d5c), ('JSY 10 T', '15 M MIN'), ink=WHITE, proud=0.001)
    kit.clear = ((-1.8, 0.0, -1.2), (1.5, 1.7, 1.4))
    kit.known_by = ('Bedplate on two bearers with holding-down bolts; gear case with inspection cover, filler, level glass; hydraulic motor, control '
                    'valve and lever, two pipes to bolted deck flanges; two pedestal bearings; drum with rope; band brake with spindle and '
                    'handwheel on a post; warping end with six whelps. The drum and warping end turn')


@fitting('capstan', size=(0.9, 0.9, 1.05), front='either', title='Capstan',
         note='vertical barrel on a base; its control pedestal stands 1.1 m toward -x; the barrel turns')
def capstan(kit, **_):
    """
    A capstan: a waisted barrel with six whelps on a base bolted to a seat on the deck, its drive under the deck; a cap with
    the maker's plate; pawls round its foot; a control pedestal beside it with the valve's lever.
    """
    paint, steel, galv, mark = kit.p('paint'), kit.p('steel'), kit.p('galv'), kit.p('mark')
    g = WINCH_GREEN
    lathe(paint, (0, 0, 0), UP, [(0.0, 0.0), (0.0, 0.46), (0.05, 0.46), (0.05, 0.40), (0.12, 0.36), (0.12, 0.0)], tint(g, 0.85))
    bolt_circle(steel, (0, 0.05, 0), UP, 0.43, 8, 0.020)
    B = lambda key: kit.p(key, 'run')
    lathe(B('paint'), (0, 0.123, 0), UP, [(0.0, 0.10), (0.0, 0.34), (0.05, 0.34), (0.08, 0.27), (0.30, 0.205), (0.52, 0.215), (0.66, 0.27), (0.69, 0.30), (0.74, 0.30),
                                         (0.78, 0.26), (0.80, 0.0)], tint(DARK, 1.2), caps=(False, False))
    for k in range(6):
        a = 2 * pi * k / 6
        d = Vector((cos(a), 0.0, sin(a)))
        bar(B('paint'), tuple(Vector((0, 0.22, 0)) + d * 0.262), tuple(Vector((0, 0.70, 0)) + d * 0.236), 0.04, 0.018, tint(DARK, 1.05), up=tuple(d))
    lathe(B('bronze'), (0, 0.923, 0), UP, [(0.0, 0.0), (0.0, 0.11), (0.006, 0.11), (0.006, 0.0)], BRASS)
    for k in range(4):                                             # the pawls round the barrel's foot, each on its pin in the base
        a = 2 * pi * k / 4 + 0.4
        d = Vector((cos(a), 0.0, sin(a)))
        w = Vector((-sin(a), 0.0, cos(a)))
        bar(galv, tuple(d * 0.34 + Vector((0, 0.131, 0))), tuple(d * 0.34 + w * 0.10 + Vector((0, 0.131, 0))), 0.035, 0.022, GALV, up=UP)
        steel.tube(tuple(d * 0.34 + Vector((0, 0.12, 0))), tuple(d * 0.34 + Vector((0, 0.155, 0))), 0.012, colour=STEEL)
    # ---- the control pedestal
    px = -1.10
    paint.block((px - 0.12, 0.0, -0.12), (px + 0.12, 0.015, 0.12), tint(g, 0.85), r=0.004)
    for sx in (-1, 1):
        for sz in (-1, 1):
            bolt(steel, (px + sx * 0.09, 0.015, sz * 0.09), UP, 0.012)
    paint.block((px - 0.07, 0.015, -0.07), (px + 0.07, 0.86, 0.07), g, r=0.008)
    paint.block((px - 0.10, 0.86, -0.10), (px + 0.10, 1.00, 0.10), g, r=0.012)
    steel.tube((px, 1.00, 0.0), (px, 1.03, 0.0), 0.022, colour=STEEL)
    sweep(steel, [(px, 1.03, 0.0), (px, 1.12, 0.0), (px, 1.26, 0.06)], 0.011, STEEL)
    kit.p('plastic').ball((px, 1.275, 0.066), 0.028, BLACK)
    label(kit, mark, (px, 0.93, 0.10), PORT, UP, 0.16, 0.08, WHITE, ('HEAVE', 'STOP  VEER'), proud=0.0012)
    for z in (-0.04, 0.04):                                        # its two pipes go down through the deck beside it
        kit.run('pipes', [(px + 0.07, 0.30, z), (px + 0.13, 0.30, z), (px + 0.13, 0.03, z)], 0.016, tint(g, 0.85))
        plate_disc(galv, (px + 0.13, 0.0, z), UP, 0.034, 0.03, tint(g, 0.8))
    ratio = _run_input(kit, 'Capstan', 360 / (2 * pi * 0.24))
    kit.movers.append(dict(id=kit.mid('run'), kind='turn', input=kit.mid('run'), axis=[0, 1, 0], pivot=[0.0, 0.0, 0.0], ratio=ratio))
    kit.clear = ((-1.5, 0.0, -1.0), (1.0, 1.4, 1.0))
    kit.known_by = ('Base with holding-down bolts; waisted barrel with six whelps and a flange at foot and head; brass cap plate; four pawls on pins '
                    'round its foot; control pedestal on a bolted foot with the valve\'s lever, its notice and two pipes down to deck flanges. '
                    'The barrel turns')


@fitting('bitts', size=(1.25, 0.48, 0.60), front='either', title='Bitts',
         note='double bollard; its two posts stand in a line along z; origin under the middle of its bedplate; option nominal (the post\'s diameter)')
def bitts(kit, nominal=0.324, **_):
    """
    A pair of bitts (a double bollard), welded: two tube posts on a bedplate, each closed by a head plate with a lip that
    keeps a rope's turns from riding up, four brackets at each post's foot, and a fillet of weld round the bedplate where it
    is welded to the deck. Painted black; the head and a band under it yellow, as the owner's photograph of a ro-ro ship's
    after deck shows them (reference E6).

    Sizes [M]: DIN 82607 double bollard, nominal size 315 as recalled: post 324 mm, 510 mm high, 800 mm between centres,
    bedplate 1250 x 480 mm. For a ship of 125 m with ropes of 56 to 64 mm.
    """
    k = nominal / 0.324
    cast = kit.p('cast')
    L, B, t = 1.25 * k, 0.48 * k, 0.030 * k
    r, h, c = nominal / 2, 0.51 * k, 0.40 * k
    cast.block((-B / 2, 0.0, -L / 2), (B / 2, t, L / 2), BLACK, r=0.006)
    w = 0.010
    for (x0, x1, z0, z1) in ((-B / 2 - w, -B / 2 + 0.004, -L / 2 + 0.01, L / 2 - 0.01), (B / 2 - 0.004, B / 2 + w, -L / 2 + 0.01, L / 2 - 0.01),
                             (-B / 2 + 0.01, B / 2 - 0.01, -L / 2 - w, -L / 2 + 0.004), (-B / 2 + 0.01, B / 2 - 0.01, L / 2 - 0.004, L / 2 + w)):
        kit.p('steel').block((x0, 0.0, z0), (x1, 0.009, z1), tint(STEEL, 0.75), r=0.004)
    for s in (-1, 1):
        o = (0.0, t, s * c)
        band_ = lambda i: YELLOW if i in (2, 4, 5, 6, 7) else BLACK
        lathe(cast, o, UP, [(0.0, r + 0.014), (0.016, r), (h - 0.185, r), (h - 0.105, r), (h - 0.060, r),
                            (h - 0.045, r + 0.032), (h - 0.012, r + 0.032), (h, r + 0.018), (h + 0.012, 0.0)], band_, caps=(False, False))
        for q in range(4):
            a = pi / 4 + q * pi / 2
            d = Vector((cos(a), 0.0, sin(a)))
            gusset(cast, Vector(o) + d * (r - 0.004), tuple(d), UP, 0.07 * k, 0.13 * k, 0.014, BLACK)
    kit.clear = ((-B / 2 - 0.35, 0.0, -L / 2 - 0.35), (B / 2 + 0.35, h + 0.25, L / 2 + 0.35))
    kit.known_by = ('Bedplate with its fillet weld to the deck; two tube posts; at each a weld collar, four foot brackets, a head '
                    'plate with a rope lip; black, the head and one band yellow')


@fitting('panama-chock', size=(0.90, 0.30, 0.95), front='+z (inboard)', title='Panama chock',
         note='a closed chock cast in the bulwark: origin on the deck at the bulwark\'s inboard face (z = 0), the bulwark behind it; needs its cut in the bulwark; option t (the bulwark\'s thickness)')
def panama_chock(kit, t=0.012, **_):
    """
    A panama chock: one casting, an oval ring with fat rounded lips standing proud of the bulwark on both sides, welded into
    an opening in the bulwark's plate; a doubler round it inboard; the safe working load cast on it.
    """
    cast, mark = kit.p('cast'), kit.p('mark')
    cy, zc = 0.52, -t / 2
    a_, rc, rt = 0.035, 0.265, 0.135
    path = [(u, cy + v, zc) for u, v in stadium(a_, 0, rc, n=14)]
    sweep(cast, path, rt, BLACK, closed=True)
    # the doubler welded round it on the bulwark's inboard face
    outer = [(u, cy + v, 0.0) for u, v in stadium(a_, 0, rc + rt + 0.07, n=14)]
    inner = [(u, cy + v, 0.0) for u, v in stadium(a_, 0, rc + rt * 0.72, n=14)]
    band(cast, outer, inner, (0, 0, 0.012), tint(WHITE, 0.95))
    cutline = [(u, cy + v, 0.0) for u, v in stadium(a_, 0, rc + rt * 0.85, n=14)]
    kit.cut('bulwark', (-(a_ + rc + rt), cy - rc - rt, -t), (a_ + rc + rt, cy + rc + rt, 0.0), outline=cutline)
    letter(kit, mark, 'SWL 64 T', 0.035, (0.0, cy + rc + rt + 0.018, 0.012), PORT, UP, BLACK)
    kit.clear = ((-0.75, 0.0, -0.5), (0.75, 1.1, 0.6))
    kit.known_by = 'One casting: an oval ring with rounded lips through the bulwark; a doubler round it; its safe working load lettered over it'


@fitting('roller-fairlead', size=(0.95, 0.55, 1.0), front='+z (inboard); the rope passes through along z', title='Roller fairlead',
         note='four rollers in a frame on a pedestal; origin under its middle; the rope passes through it along z')
def roller_fairlead(kit, **_):
    """
    A four-roller fairlead on a pedestal: a frame of two cheeks and two bars carrying two upright rollers and two level
    ones round a square opening, each roller on its pin with a grease nipple; the pedestal on a bedplate bolted to the deck.
    """
    paint, steel, galv = kit.p('paint'), kit.p('steel'), kit.p('galv')
    g = BLACK
    paint.block((-0.42, 0.0, -0.26), (0.42, 0.025, 0.26), g, r=0.006)
    for sx in (-1, 1):
        for sz in (-1, 1):
            bolt(steel, (sx * 0.36, 0.025, sz * 0.20), UP, 0.020)
    paint.block((-0.30, 0.025, -0.16), (0.30, 0.36, 0.16), g, r=0.008)                                                # the pedestal
    for sx in (-1, 1):
        gusset(paint, (sx * 0.30, 0.025, 0.0), (sx, 0, 0), UP, 0.10, 0.22, 0.016, g)
    # the frame: a bottom bar, two cheeks, a top bar
    y0, y1, w, hw = 0.36, 0.96, 0.44, 0.30
    paint.block((-w, y0, -0.10), (w, y0 + 0.05, 0.10), g, r=0.006)
    paint.block((-w, y1 - 0.05, -0.10), (w, y1, 0.10), g, r=0.006)
    for sx in (-1, 1):
        paint.block((sx * w - (0.04 if sx > 0 else 0.0), y0 + 0.05, -0.10), (sx * w + (0.04 if sx < 0 else 0.0), y1 - 0.05, 0.10), g, r=0.006)
    roll = tint(STEEL, 0.9)
    for sx in (-1, 1):                                             # two upright rollers
        x = sx * 0.265
        lathe(galv, (x, y0 + 0.055, 0.0), UP, [(0.0, 0.03), (0.0, 0.085), (0.02, 0.085), (0.06, 0.07), (0.43, 0.07), (0.47, 0.085), (0.49, 0.085), (0.49, 0.03)], roll, caps=(False, False))
        steel.tube((x, y0 + 0.05, 0.0), (x, y1 + 0.012, 0.0), 0.032, colour=STEEL)
        galv.tube((x, y1 + 0.012, 0.0), (x, y1 + 0.03, 0.0), 0.008, colour=BRASS)
    for y, zz in ((y0 + 0.14, 0.175), (y1 - 0.14, -0.175)):
        lathe(galv, (-0.185, y, zz), PORT, [(0.0, 0.03), (0.0, 0.075), (0.02, 0.075), (0.05, 0.062), (0.32, 0.062), (0.35, 0.075), (0.37, 0.075), (0.37, 0.03)], roll, caps=(False, False))
        steel.tube((-w - 0.012, y, zz), (w + 0.012, y, zz), 0.028, colour=STEEL)
        for sx in (-1, 1):                                         # the lugs on the cheeks that carry its pin
            lug_z0, lug_z1 = (0.10, zz + 0.045) if zz > 0 else (zz - 0.045, -0.10)
            paint.block((sx * w - (0.04 if sx > 0 else 0.0), y - 0.05, lug_z0), (sx * w + (0.04 if sx < 0 else 0.0), y + 0.05, lug_z1), g, r=0.004)
            galv.tube((sx * (w + 0.012), y, zz), (sx * (w + 0.028), y, zz), 0.008, colour=BRASS)
    kit.clear = ((-0.8, 0.0, -0.7), (0.8, 1.2, 0.7))
    kit.known_by = ('Bedplate with holding-down bolts; pedestal with brackets; a frame of two cheeks and two bars; two upright and two level '
                    'rollers, each waisted, on its pin with a grease nipple; lugs for the level rollers\' pins')


@fitting('rope-reel', size=(1.35, 1.2, 1.35), front='+z', title='Rope reel',
         note='a stowage reel on two A-frames; its axle along x; origin under its middle; the reel turns by its handwheel')
def rope_reel(kit, **_):
    """
    A stowage reel for a mooring rope: a drum with two flanges of flat bar spokes on an axle in two A-frames bolted to the
    deck, a handwheel on the axle's end, the rope wound on it.
    """
    galv, steel, rope, paint = kit.p('galv'), kit.p('steel'), kit.p('rope'), kit.p('paint')
    ys, half = 0.74, 0.50
    for sx in (-1, 1):                                             # the two A-frames
        x = sx * (half + 0.09)
        for sz in (-1, 1):
            bar(galv, (x, 0.012, sz * 0.42), (x, ys, sz * 0.03), 0.06, 0.012, GALV, up=PORT)
            galv.block((x - 0.05, 0.0, sz * 0.42 - 0.07), (x + 0.05, 0.012, sz * 0.42 + 0.07), GALV, r=0.003)
            bolt(steel, (x, 0.012, sz * 0.42 + sz * 0.045), UP, 0.012)
        galv.block((x - 0.006, 0.28, -0.275), (x + 0.006, 0.34, 0.275), GALV, r=0.003)
        lathe(galv, (x - 0.03, ys, 0.0), PORT, [(0.0, 0.0), (0.0, 0.055), (0.06, 0.055), (0.06, 0.0)], GALV)
    R_ = lambda key: kit.p(key, 'turn')
    R_('steel').tube((-half - 0.16, ys, 0.0), (half + 0.20, ys, 0.0), 0.022, colour=STEEL)
    lathe(R_('galv'), (-half + 0.02, ys, 0.0), PORT, [(0.0, 0.16), (2 * half - 0.04, 0.16)], GALV, caps=(False, False))
    for sx in (-1, 1):                                             # each flange: a rim of round bar, eight spokes of flat bar, a hub
        x = sx * (half - 0.01)
        R_('galv').ring((x, ys, 0.0), PORT, 0.56, 0.012, GALV)
        lathe(R_('galv'), (x - 0.02, ys, 0.0), PORT, [(0.0, 0.022), (0.0, 0.17), (0.04, 0.17), (0.04, 0.022)], GALV, caps=(False, False))
        for k in range(8):
            a = 2 * pi * k / 8
            d = Vector((0.0, cos(a), sin(a)))
            bar(R_('galv'), tuple(Vector((x, ys, 0)) + d * 0.165), tuple(Vector((x, ys, 0)) + d * 0.555), 0.008, 0.035, GALV, up=tuple(d.cross(Vector(PORT))))
    rope_on_drum(R_('rope'), -half + 0.035, half - 0.035, ys, 0.16, 2 * HAWSER, ROPE_BUFF, layers=3)
    handwheel(R_('steel'), (half + 0.19, ys, 0.0), PORT, 0.20, tint(GALV, 0.9), spokes=4)
    kit.inputs.append(dict(id=kit.mid('turn'), name='Rope reel', min=0, max=360, step=1, unit='°', below='', above='turned', rest='stowed', auto='tap',
                           at=[half + 0.19, ys, 0.0], normal=[1, 0, 0], reach=1.6))
    kit.movers.append(dict(id=kit.mid('turn'), kind='turn', input=kit.mid('turn'), axis=[1, 0, 0], pivot=[0.0, ys, 0.0], ratio=1.0))
    kit.clear = ((-0.95, 0.0, -0.8), (1.0, 1.45, 0.8))
    kit.known_by = ('Two A-frames of flat bar on bolted feet with a tie; an axle in two bearings; the drum; two flanges, each a rim, eight spokes '
                    'and a hub; the rope wound on in three layers; a handwheel on the axle. It turns to a tap')


@fitting('rope-coil', size=(1.5, 1.5, 0.4), front='either', title='Mooring rope on a grating',
         note='a mooring rope coiled down on a wooden grating; origin under the grating\'s middle')
def rope_coil(kit, **_):
    """
    A 64 mm mooring rope coiled down clockwise on a grating: the grating of teak slats on two bearers, clear of the deck so
    the rope dries; the coil three layers deep; the rope's eye laid on top.
    """
    teak, rope = kit.p('teak'), kit.p('rope')
    for z in (-0.52, 0.52):
        teak.block((-0.72, 0.0, z - 0.04), (0.72, 0.06, z + 0.04), tint(TEAK, 0.8), r=0.004)
    for k in range(13):
        x = -0.66 + 0.11 * k
        teak.block((x - 0.04, 0.06, -0.70), (x + 0.04, 0.085, 0.70), tint(TEAK, 0.92 + 0.05 * (k % 3)), r=0.004)
    r = HAWSER
    pts = []
    turns_in_layer, layers = 5, 3
    n = 30
    j = 0
    for layer in range(layers):
        for i in range(turns_in_layer * n + 1):
            u = i / (turns_in_layer * n)
            rad = (0.58 - 0.064 * turns_in_layer * u) if layer % 2 == 0 else (0.58 - 0.064 * turns_in_layer * (1 - u))
            a = -2 * pi * (j / n)
            lift = 2 * r * 0.9 * min(1.0, i / (0.6 * n)) if layer else 0.0          # it climbs onto the layer below in the first part of a turn
            pts.append((rad * cos(a), 0.085 + r + (layer - 1) * 2 * r * 0.9 * (1 if layer else 0) + lift, rad * sin(a)))
            j += 1
    # the end comes up from the middle and is laid across the top with its eye
    top = 0.085 + r + (layers - 1) * 2 * r * 0.9
    last = pts[-1]
    tail = [(last[0] * 0.9, top + 0.03, last[2] * 0.9), (0.10, top + 2 * r * 0.9, 0.05), (0.30, top + 2 * r * 0.9, 0.12)]
    sweep(rope, pts + tail, r, ROPE_BLUE, lay=3, sides=20)
    eye = [(0.30 + 0.20 * (1 - cos(2 * pi * k / 16)) / 2 * 1.6, top + 2 * r * 0.9, 0.12 + 0.11 * sin(2 * pi * k / 16)) for k in range(17)]
    sweep(rope, eye, r * 0.85, ROPE_BLUE, lay=3, sides=20, closed=True)
    kit.clear = ((-0.9, 0.0, -0.9), (0.9, 0.6, 0.9))
    kit.known_by = 'A grating of thirteen teak slats on two bearers; a 64 mm three-strand rope coiled down on it in three layers, its eye laid on top'
