"""
The console block of the navigation bridge, and every instrument set into it.

The owner's photographs of a ferry's wheelhouse (reference F3, F4): "the consoles in one block on the centreline, painted
blue", with sloped desks carrying dark instrument fields, flush panels of push buttons and lamps, small displays,
telephones, a handset on a curly cord, control levers, a grab rail of stainless tube along the desk's edge. What stood here
was a table 5.5 m wide from wall to wall with instrument boxes standing on it.

The block is 3.70 m wide on the centreline, against the forward bulkhead, and leaves a way 1.07 m wide to the forward
corner windows on each side. From aft forward: a grab rail on brackets; the desk's nose; a desk that slopes up 11 degrees
with two rows of flush panels on a dark field, and the three control heads in its after edge; a level strip; an upstand that
leans back 20 degrees with the displays set into it under glass, lower in the middle so that the sea is seen over it ahead of
the wheel (nothing ahead of the wheel over 1.225 m, nothing else over 1.315 m: yard/calc JS4-402 asked 1.22 and 1.33).

What is worked is nearest the hand and lowest; what is read is beyond it and higher (the owner, 12 November 2026: "some
levers are blocking some panels": the control heads stood on the level strip, 0.19 m high, straight in front of the engine
instruments and the rudder angle indicator). A control head now stands in the desk's after edge (REG.HAND), sunk until its
plate is a few millimetres over the desk at its forward end; the desk behind it is clear; its panel lies on the level strip
(REG.STRIP) and its instruments stand in the upstand, in line ahead of it. From an eye 1.6 m up anywhere abaft the block
the line over a grip's top meets the level strip, never an instrument. Below the desk
a cabinet of five bays: each has two doors on hinges with a quarter-turn lock and pressed louvres, and behind them the
units of the register that are not seen, standing on shelves. Every door opens to a tap.

Each instrument is drawn in a frame of its own on the face it is set in (bridge_kit.Frame): a gasket, a plate or a bezel,
its picture, and each key, lamp, knob and screw as a shape.
"""
from bridge_kit import *
import bridge_kit as K

BX, NOSE, FACE = 1.85, 22.12, 22.20           # the block's half breadth; the desk's after edge; the cabinet's after face
S0, S1 = (22.14, 0.932), (22.50, 1.000)       # the sloping desk, from its after edge to the level strip: (yard, h)
SLOPE = atan2(S1[1] - S0[1], S1[0] - S0[0])
SADDLE = 0.78                                 # half the breadth of the upstand's low middle
UP_FOOT, UP_TOP = 22.52, 1.315                # the upstand's foot and top, outboard of the middle
MID_FOOT, MID_TOP = 22.72, 1.225              # and in the middle, ahead of the wheel
T20, C20, S20 = tan(radians(20)), cos(radians(20)), sin(radians(20))
FIELD = 0.005                                 # the dark instrument fields stand this far proud of the enamel
APRON = 0.60                                  # the cabinet's doors end here; over them the apron under the desk
BAYS = [(1.11, 1.85), (0.37, 1.11), (-0.37, 0.37), (-1.11, -0.37), (-1.85, -1.11)]
BAY_NAMES = ['PA  CCTV', 'NAVIGATION', 'PROPULSION', 'COMPASS  DATA', 'RADAR']
DOOR = (0.135, 0.585)                         # a cabinet door, from and to
# The places in the desk's two rows that no panel takes: (the row, x from, x to), each closed by a blanking plate. The
# forward row is left bare between -0.44 and 0.58: that is the clear desk behind the three control heads.
BLANKS = [(REG.ROW1, -1.77, -1.37), (REG.ROW1, -0.035, 0.15), (REG.ROW2, 0.60, 0.87), (REG.ROW2, -1.77, -1.33)]


def desk_h(yard):
    """The desk's own surface at a place fore and aft (the enamel, under the field)."""
    return S0[1] + (min(max(yard, S0[0]), S1[0]) - S0[0]) * (S1[1] - S0[1]) / (S1[0] - S0[0])


def desk_frame(x, yard, lift=FIELD):
    """A frame on the sloping desk at (x, yard): across to starboard, up the slope, out of the desk."""
    n = Vector((0.0, cos(SLOPE), -sin(SLOPE)))
    return Frame(tuple(Vector(P(x, yard, desk_h(yard))) + n * lift), STBD, (0.0, sin(SLOPE), cos(SLOPE)), local=True)


def upstand(x):
    """The upstand's face at x: its foot, its top, and how long the leaning face is."""
    foot, top = (MID_FOOT, MID_TOP) if abs(x) < SADDLE else (UP_FOOT, UP_TOP)
    return foot, top, (top - 1.0) / C20


def upstand_frame(x, s=None, lift=FIELD):
    """A frame on the upstand's leaning face at x, s metres up the face from its foot (its middle when not said)."""
    foot, top, length = upstand(x)
    s = length / 2 if s is None else s
    return Frame(tuple(Vector(P(x, foot + s * S20, 1.0 + s * C20)) + Vector(TILT_N) * lift), STBD, TILT, local=True)


# =====================================================================================================================
# The block itself
# =====================================================================================================================
def console(g, tag, *where):
    head = [(FACE, APRON), (FACE, 0.885), (NOSE + 0.010, 0.885), (NOSE, 0.895), (NOSE, 0.922), S0, S1]
    outer = head + [(UP_FOOT, 1.0), (UP_FOOT + (UP_TOP - 1.0) * T20, UP_TOP), (FRONT_IN, UP_TOP), (FRONT_IN, APRON)]
    middle = head + [(MID_FOOT, 1.0), (MID_FOOT + (MID_TOP - 1.0) * T20, MID_TOP), (FRONT_IN, MID_TOP), (FRONT_IN, APRON)]
    prism('console', SADDLE, BX, outer, BLUEC)
    prism('console', -BX, -SADDLE, outer, BLUEC)
    prism('console', -SADDLE, SADDLE, middle, BLUEC)
    # ---- the dark instrument fields: on the sloping desk, on the level strip, on each face of the upstand
    with desk_frame(0.0, S0[0], lift=0.0) as F:
        F.block('desk', (-BX + 0.03, 0.010, 0.0), (BX - 0.03, hypot(S1[0] - S0[0], S1[1] - S0[1]) - 0.012, FIELD), DESK, r=0.002)
    box('desk', -SADDLE + 0.03, SADDLE - 0.03, S1[0] + 0.004, MID_FOOT - 0.012, 1.0, 1.0 + FIELD, DESK, r=0.002)
    for x0, x1 in ((SADDLE + 0.025, BX - 0.03), (-BX + 0.03, -SADDLE - 0.025), (-SADDLE + 0.03, SADDLE - 0.03)):
        length = upstand((x0 + x1) / 2)[2]
        with upstand_frame((x0 + x1) / 2, s=0.0, lift=0.0) as F:
            F.block('desk', (-(x1 - x0) / 2, 0.008, 0.0), ((x1 - x0) / 2, length - 0.008, FIELD), DESK, r=0.002)
    # ---- the cabinet: a plinth set back for the feet, a bottom, a back, two ends, a partition and a stile between bays
    box('dark', -BX + 0.03, BX - 0.03, FACE + 0.08, FRONT_IN - 0.02, 0.012, 0.10, DARK)
    box('console', -BX, BX, FACE, FRONT_IN, 0.10, 0.12, BLUEC)
    box('console', -BX, BX, FRONT_IN - 0.02, FRONT_IN, 0.12, APRON, BLUEC)
    for sx in (-1, 1):
        box('console', sx * (BX - 0.02), sx * BX, FACE, FRONT_IN - 0.02, 0.12, APRON, BLUEC)
    for x in (1.11, 0.37, -0.37, -1.11):
        box('console', x - 0.01, x + 0.01, FACE + 0.02, FRONT_IN - 0.02, 0.12, APRON, tint(BLUEC, 0.9))
        box('console', x - 0.02, x + 0.02, FACE, FACE + 0.02, 0.12, APRON, BLUEC)
    for i, (lo, hi) in enumerate(BAYS):
        a, b = lo + (0.02 if lo < -BX + 0.001 else 0.01), hi - (0.02 if hi > BX - 0.001 else 0.01)
        box('console', a, b, FACE + 0.03, FRONT_IN - 0.02, 0.285, 0.30, tint(BLUEC, 0.86))               # a shelf for the heavier units
        if i in (0, 1, 3):
            box('console', a, b, FACE + 0.10, FRONT_IN - 0.02, 0.475, 0.49, tint(BLUEC, 0.86))           # and one over it for the small ones
        # a slotted cable duct across the back of the bay, under the desk
        box('plastic', a, b, FRONT_IN - 0.065, FRONT_IN - 0.02, 0.535, 0.585, srgb(0x9aa0a2), r=0.002)
        for k in range(int((b - a) / 0.03) - 1):
            box('dark', a + 0.02 + k * 0.03, a + 0.028 + k * 0.03, FRONT_IN - 0.067, FRONT_IN - 0.064, 0.542, 0.578, srgb(0x2a2d2f), r=0.0)
        doors(i, lo, hi)
    # ---- a blanking plate where a place in a row is not taken
    for row, x0, x1 in BLANKS:
        with desk_frame((x0 + x1) / 2, row) as F:
            blank(F, -(x1 - x0) / 2, -0.06, (x1 - x0) / 2, 0.06)
    # ---- the grab rail along the desk's edge: stainless tube on six brackets from the nose
    yr, hr = NOSE - 0.046, 0.936
    tube('steel', (-1.79, yr, hr), (1.79, yr, hr), 0.014, STAINLESS)
    for sx in (-1, 1):
        part('steel').ball(P(sx * 1.79, yr, hr), 0.014, STAINLESS)
    for x in (-1.70, -1.02, -0.34, 0.34, 1.02, 1.70):
        lathe('steel', (x, NOSE, 0.909), AFTWARD, [(0.0, 0.0125), (0.003, 0.0125), (0.003, 0.007)], STAINLESS)
        sweep('steel', [(x, NOSE + 0.004, 0.909), (x, NOSE - 0.022, 0.911), (x, NOSE - 0.040, 0.922), (x, yr, hr)], 0.0065, STAINLESS)
    # ---- on the apron: the builder's plate, and the trunk's gland where the cables go down to the steering stand
    with Frame((0.22, FACE, 0.76), STBD, UP) as F:
        F.block('brass', (-0.085, -0.016, 0.0), (0.085, 0.016, 0.002), BRASS, r=0.0)
        F.pic('nameplate', -0.081, -0.0135, 0.081, 0.0135, 0.0024)
        for sx in (-1, 1):
            screw(F, sx * 0.0795, 0.0, 0.002, r=0.0016, key='brass', colour=BRASS)
    box('console', -0.05, 0.05, 21.98, FACE + 0.08, 0.012, 0.03, FRAME)                 # the floor trunk from the console to the stand


def doors(i, lo, hi):
    """The two doors of a bay: each a pressed leaf on two hinges, with louvres low in it and a quarter-turn lock at the
    edge where the two meet; the bay's name on the port one. A tap opens a leaf, and shuts it again."""
    oa, ob = lo + 0.02, hi - 0.02
    half = (ob - oa) / 2
    for k, (da, db) in enumerate(((oa + 0.003, oa + half - 0.002), (oa + half + 0.002, ob - 0.003))):
        side = 'port' if k else 'starboard'
        mover = f'console-door-{i + 1}{side[0]}'
        M = moving(f'Console, bay {i + 1}, {side} door', mover, leaf='Marine enamel', fit='Stainless', mark='Marking')
        box(M['leaf'], da, db, FACE - 0.004, FACE + 0.014, DOOR[0], DOOR[1], BLUEC, r=0.003)
        wd, mid = db - da, (da + db) / 2
        edge = 1 if k == 0 else -1                           # in the frame (x to starboard) the hinge is at this side of the leaf
        with Frame((mid, FACE - 0.004, (DOOR[0] + DOOR[1]) / 2), STBD, UP) as F:
            F.into = dict(console=M['leaf'], steel=M['fit'], seam=M['mark'], anod=M['leaf'])
            louvres(F, -wd / 2 + 0.045, -0.195, wd / 2 - 0.045, -0.10, 0.0, n=4)
            quarter_turn(F, -edge * (wd / 2 - 0.028), 0.03, 0.0)
            for yy in (-0.15, 0.15):
                hinge(F, edge * (wd / 2 - 0.004), yy - 0.03, yy + 0.03, 0.0)
            if k:
                nameplate(F, BAY_NAMES[i], 0.0, 0.185, 0.0, height=0.008)
        hinge_x = da if k == 0 else db
        hinged(mover, f'Console door, bay {i + 1} ({BAY_NAMES[i].lower()}), {side} leaf', (hinge_x, FACE - 0.004, 0.0), ratio=1.0 if k == 0 else -1.0, opens=105,
               at=(mid, FACE, 0.36), reach=1.9)


# =====================================================================================================================
# Instruments
# =====================================================================================================================
# What stands on a panel's face and is not a key, a lamp or a knob (those the picture's own marks give: atlas-marks.json):
# (kind, across from the left, down from the top, size in picture points)
DETAILS = {
    'steer_mode': [('tiller', 0.5, 198 / 256, 0)],
    'whistle_panel': [('button', 62 / 208, 74 / 160, 30)],
    'sl_panel': [('stick', 104 / 208, 80 / 160, 0)],
    'pa_panel': [('mic', 404 / 464, 70 / 160, 0)],
    'radar_kbd': [('ball', (512 - 62) / 512, 0.5, 34)],
    'ecdis_kbd': [('ball', (384 - 62) / 384, 0.5, 34)],
    'navlight_panel': [('toggle', (424 + i * 58) / 848, 92 / 208, 0) for i in range(7)],
}


def details(F, name, x0, y0, x1, y1, z):
    px = (x1 - x0) / tile(name)['px'][0]
    for kind, fx, fy, size in DETAILS.get(name, ()):
        X, Y = x0 + fx * (x1 - x0), y1 - fy * (y1 - y0)
        r = size * px
        if kind == 'button':
            # the whistle's push: a mushroom head on a steel collar
            F.lathe('steel', (X, Y, z), [(0.0, r * 0.95), (0.004, r * 0.95), (0.004, r * 0.6)], STAINLESS)
            F.lathe('plastic', (X, Y, z + 0.004), [(0.0, r * 0.55), (0.010, r * 0.55), (0.012, r), (0.020, r), (0.026, r * 0.72), (0.026, 0.0)], RED)
        elif kind == 'ball':
            # a trackball: the ball in its ring
            F.lathe('anod', (X, Y, z), [(0.0, r * 1.12), (0.003, r * 1.12), (0.0045, r * 0.98), (0.0045, r * 0.9)], ANOD)
            F.lathe('plastic', (X, Y, z + 0.001), [(0.0, r * 0.93), (r * 0.28, r * 0.86), (r * 0.52, r * 0.66), (r * 0.66, r * 0.36), (r * 0.7, 0.0)], srgb(0x8a1f1a))
        elif kind == 'stick':
            # a joystick: a rubber gaiter, the shaft, the knob
            F.lathe('rubber', (X, Y, z), [(0.0, 0.019), (0.004, 0.019), (0.008, 0.014), (0.012, 0.016), (0.016, 0.011), (0.020, 0.013), (0.026, 0.006)], RUBBER)
            F.tube('steel', (X, Y, z + 0.024), (X, Y, z + 0.056), 0.0042, STAINLESS)
            F.lathe('plastic', (X, Y, z + 0.052), [(0.0, 0.006), (0.006, 0.013), (0.020, 0.0145), (0.028, 0.009), (0.030, 0.0)], BLACK)
        elif kind == 'toggle':
            # a toggle switch: its nut, and the bat thrown up for on
            bolt(F, X, Y, z, r=0.0058, h=0.0028)
            F.tube('steel', (X, Y, z + 0.004), (X, Y + 0.0085, z + 0.024), 0.0026, CHROME, r2=0.0036)
        elif kind == 'mic':
            # the microphone: a base, a flexible neck, the head with its grille
            F.lathe('anod', (X, Y, z), [(0.0, 0.021), (0.006, 0.021), (0.012, 0.012), (0.016, 0.008)], ANOD)
            neck = [(X, Y, z + 0.014), (X, Y, z + 0.09), (X, Y - 0.012, z + 0.15), (X, Y - 0.05, z + 0.20), (X, Y - 0.085, z + 0.215)]
            F.sweep('steel', neck, 0.0042, srgb(0x4a4f52))
            F.lathe('plastic', (X, Y - 0.08, z + 0.213), [(0.0, 0.007), (0.01, 0.0125), (0.04, 0.0135), (0.05, 0.009), (0.052, 0.0)], BLACK, axis=(0.0, -0.94, 0.34))
        elif kind == 'tiller':
            tiller(F, X, Y, z)


def tiller(F, X, Y, z):
    """The tiller in its gate: a raised steel plate with a slot across the ship, and the stick standing in it on its ball. The
    stick is a moving part: a tap holds it over to one side or lets it go."""
    for lo, hi in (((-0.04, 0.006), (0.04, 0.018)), ((-0.04, -0.018), (0.04, -0.006)), ((0.03, -0.006), (0.04, 0.006)), ((-0.04, -0.006), (-0.03, 0.006))):
        F.box('steel', (X + lo[0], Y + lo[1], z), (X + hi[0], Y + hi[1], z + 0.004), GREY)
    for sx in (-1, 1):
        for sy in (-1, 1):
            screw(F, X + sx * 0.035, Y + sy * 0.012, z + 0.004, r=0.0018)
    mv = moving('Wheelhouse, tiller', 'tiller', steel='Stainless', grip='Plastic')
    F.into = dict(steel=mv['steel'], plastic=mv['grip'])
    F.lathe('steel', (X, Y, z - 0.004), [(0.0, 0.0), (0.0, 0.0105), (0.006, 0.0105), (0.012, 0.007), (0.014, 0.0)], srgb(0x9aa2a3))
    F.tube('steel', (X, Y, z + 0.008), (X, Y, z + 0.125), 0.0055, GREY)
    F.lathe('plastic', (X, Y, z + 0.115), [(0.0, 0.0), (0.0, 0.007), (0.01, 0.019), (0.035, 0.02), (0.05, 0.0)], BLACK)
    F.into = None
    LEVERS.append(dict(id='tiller', input='tiller', axis=[0, 0, 1], pivot=[float(v) for v in F.at((X, Y, z))]))


def flush(g, tag, x, yard, h):
    """A panel set flush in a desk: in the console's sloping desk, or (where the register says `on`) in the steering stand's
    level top or in the console's level strip, on its dark field."""
    w, l = g['w'], g['l']
    on = g.get('on')
    F = Frame((x, yard, h + g.get('rise', 0.0) + (FIELD if on == 'strip' else 0.0)), STBD, FWD) if on in ('stand', 'strip') else desk_frame(x, yard)
    with F:
        skip = ('knob',) if g.get('works') else ()
        if g.get('rise', 0.0) > 0.01:                               # a set raised on a pedestal of its own
            F.block('anod', (-w / 2, -l / 2, -g['rise']), (w / 2, l / 2, 0.0), ANOD, r=0.003)
        panel(F, g['tile'], -w / 2, -l / 2, w / 2, l / 2, skip=skip)
        details(F, g['tile'], -w / 2 + 0.003, -l / 2 + 0.003, w / 2 - 0.003, l / 2 - 0.003, 0.004)
        for k, (key, name, steps, home, start) in enumerate(g.get('works', ())):   # its rotary switches, each worked a step for a tap
            m = [q for q in marks(g['tile']) if q[0] == 'knob'][k]
            pw, ph = tile(g['tile'])['px']
            X, Y = -w / 2 + 0.003 + m[1] / pw * (w - 0.006), l / 2 - 0.003 - m[2] / ph * (l - 0.006)
            switch_knob(F, X, Y, 0.004, m[3] / pw * (w - 0.006) * 0.82, key, name, tag, steps, home, start)
        if g.get('handset'):
            hs = g['handset']
            hx, hy = hs if isinstance(hs, tuple) else (hs * (w / 2 + 0.05), 0.0)
            handset(F, hx, hy, 0.0, title=g.get('handset_name', 'Telephone handset'), mover=g.get('handset_id'), fitting=tag)
    return F


def stand_off(x, yard, w, d, h):
    """What a set stands on where it is raised above a level top: a pedestal of its own."""
    box('anod', x - w / 2, x + w / 2, yard - d / 2, yard + d / 2, REG.TOP if h is None else h[0], h[1], ANOD, r=0.003)


def display(g, tag, x, yard, h):
    """A display or a set in the upstand: its bezel and glass (a screen, a panel of dials), or its plate with every key as a
    shape (a set whose picture carries its keys)."""
    w, H = g['w'], g['H']
    foot, top, length = upstand(x)
    face = min(H / C20, length - 0.012)
    name = g['tile']
    with upstand_frame(x) as F:
        if marks(name):
            panel(F, name, -w / 2, -face / 2, w / 2, face / 2, thick=0.010, margin=0.004)
        else:
            K.display(F, name, w, face, keys=6 if tile(name)['kind'] == 'screen' else 0, hood=0.075 if g.get('hood') else 0.0,
                      dims=60.0 if tile(name)['kind'] == 'screen' else None)
    if g.get('keys'):
        kname, kw = g['keys']
        flush(dict(w=kw, l=0.12, tile=kname), tag, x, REG.ROW2, REG.TOP)


def navtex(g, tag, x, yard, h):
    """The NAVTEX receiver on its bracket on the after wall over the chart table: a cased set with its picture and keys, and
    the printed paper coming out of its top."""
    w, d, H = g['w'], g['d'], g['H']
    box('case', x - w / 2, x + w / 2, yard + 0.02, yard + d, h, h + H, CASE, r=0.006)
    for sx in (-1, 1):                                                              # the bracket's two arms from the wall
        box('steel', x + sx * (w / 2 - 0.02) - 0.004, x + sx * (w / 2 - 0.02) + 0.004, yard + 0.001, yard + d - 0.03, h - 0.012, h, STAINLESS, r=0.001)
        box('steel', x + sx * (w / 2 - 0.02) - 0.004, x + sx * (w / 2 - 0.02) + 0.004, yard + 0.001, yard + 0.006, h - 0.07, h - 0.012, STAINLESS, r=0.001)
    with Frame((x, yard + d, h + H / 2), PORT, UP) as F:
        panel(F, g['tile'], -w / 2 + 0.008, -H / 2 + 0.008, w / 2 - 0.008, H / 2 - 0.008, thick=0.004)
    box('paint', x - 0.09, x + 0.09, yard + 0.07, yard + d - 0.03, h + H, h + H + 0.003, WHITE, r=0.0)       # the printed paper, coming out of the top
    box('paint', x - 0.09, x + 0.09, yard + d - 0.034, yard + d - 0.030, h + H, h + H + 0.05, WHITE, r=0.0)


def hidden(g, tag, x, yard, h):
    """A unit inside the console or the stand: a hammer-finish case on its shelf, with a connector strip, a lamp that says
    it is alive, its lugs bolted down, and its cable led back to the duct."""
    w, d, H = g['size']
    box('case', x - w / 2, x + w / 2, yard - d / 2, yard + d / 2, h, h + H, CASE, r=0.004)
    with Frame((x, yard - d / 2, h + H / 2), STBD, UP) as F:
        F.block('anod', (-w / 2 + 0.012, -H * 0.36, 0.0), (w / 2 - 0.012, -H * 0.02, 0.003), ANOD, r=0.0)
        n = max(2, int((w - 0.04) / 0.035))
        for k in range(n):
            F.lathe('steel', (-w / 2 + 0.03 + k * (w - 0.06) / max(n - 1, 1), -H * 0.19, 0.003), [(0.0, min(0.007, H * 0.12)), (0.006, min(0.007, H * 0.12)), (0.006, 0.0)], srgb(0x9aa2a3))
        lamp(F, w / 2 - 0.018, H * 0.24, 0.0, 0.003, srgb(0x3cf058))
    if abs(x) < BX and yard > FACE:                                                  # in the console: lugs on the shelf, a cable to the duct
        for sx in (-1, 1):
            box('case', x + sx * (w / 2 + 0.012) - 0.012, x + sx * (w / 2 + 0.012) + 0.012, yard - 0.02, yard + 0.02, h, h + 0.004, CASE, r=0.0)
            with Frame((x + sx * (w / 2 + 0.014), yard, h + 0.004), STBD, FWD) as F:
                bolt(F, 0.0, 0.0, 0.0, r=0.004, h=0.003)


# ---------------------------------------------------------------------------------------------------------------------
# Handsets
# ---------------------------------------------------------------------------------------------------------------------
def handset(F, x, y, z, title='Telephone handset', mover=None, fitting=None, cord=True):
    """A telephone handset lying in its cradle, drawn in a frame with the cradle along the face's upward measure: a base
    plate and two forks; the handset itself (mouthpiece low, a grip, earpiece high); a coiled cord from its low end to a
    gland in the desk. With `mover` the handset is a part that lifts: it turns up on its low end, where the cord holds it."""
    F.block('anod', (x - 0.032, y - 0.108, z), (x + 0.032, y + 0.108, z + 0.006), ANOD, r=0.002)
    for yy in (y - 0.066, y + 0.066):
        for sx in (-1, 1):
            F.block('plastic', (x + sx * 0.0285 - 0.0035, yy - 0.013, z + 0.006), (x + sx * 0.0285 + 0.0035, yy + 0.013, z + 0.032), BLACK, r=0.0015)
    corner_screws(F, x - 0.032, y - 0.108, x + 0.032, y + 0.108, z + 0.006, inset=0.006, r=0.0018)
    if mover:
        M = moving(title, mover, body='Plastic')
        F.into = dict(plastic=M['body'])
    F.pillow('plastic', (x - 0.0165, y - 0.075, z + 0.017), (x + 0.0165, y + 0.075, z + 0.037), srgb(0x232629), r=0.008)
    for yy, thick in ((y - 0.084, 0.034), (y + 0.084, 0.031)):
        F.pillow('plastic', (x - 0.0245, yy - 0.026, z + 0.0075), (x + 0.0245, yy + 0.026, z + 0.0075 + thick), srgb(0x1c1f21), r=0.011)
    F.into = None
    if mover:
        pivot, axis = F.at((x, y - 0.10, z + 0.012)), F.way((1.0, 0.0, 0.0))
        MOTIONS.append(dict(id=mover, name=title, kind='turn', pivot=[float(v) for v in pivot], axis=[float(v) for v in axis], ratio=1.0, max=38, at=[float(v) for v in F.at((x, y, z))],
                            auto='tap', reach=1.9, rest='in its cradle', above='lifted', fitting=fitting))
    if cord:
        a, b = Vector((x - 0.006, y - 0.118, z + 0.0085)), Vector((x - 0.062, y - 0.045, z + 0.0085))
        F.sweep('rubber', [(x, y - 0.108, z + 0.016)] + helix(a, b, 0.0058, 11, lead=0.006), 0.0021, RUBBER)
        gland(F, x - 0.066, y - 0.040, z, r=0.0065, cable=0.0021)
        F.sweep('rubber', [tuple(b), (x - 0.066, y - 0.040, z + 0.010)], 0.0021, RUBBER)


def sp_phone(g, tag, x, yard, h):
    """The sound-powered telephone, on the block's starboard end: a cased wall set with its handset hung on a hook, a calling
    crank at its side, its name, and the cable out of a gland below. The voice makes the current: it needs no supply."""
    with Frame((x, yard, h), FWD, UP) as F:                                          # on a face that looks to starboard
        F.pillow('case', (-0.085, -0.13, 0.0), (0.085, 0.13, 0.085), CASE, r=0.010)
        corner_screws(F, -0.085, -0.13, 0.085, 0.13, 0.085, inset=0.014, r=0.003)
        nameplate(F, 'SOUND POWERED', 0.022, 0.085, 0.085, height=0.006, screws=False)
        F.lathe('dark', (0.03, -0.02, 0.085), [(0.0, 0.030), (0.004, 0.030), (0.004, 0.0)], srgb(0x202326))      # the selector: engine room, steering gear
        knob(F, 0.03, -0.02, 0.089, 0.014, h=0.012)
        # the crank, on the forward side
        F.tube('steel', (0.085, 0.04, 0.045), (0.112, 0.04, 0.045), 0.0065, STAINLESS)
        F.sweep('steel', [(0.112, 0.04, 0.045), (0.112, 0.0, 0.045), (0.112, -0.012, 0.050), (0.138, -0.012, 0.050)], 0.004, STAINLESS)
        F.lathe('plastic', (0.126, -0.012, 0.050), [(0.0, 0.0075), (0.022, 0.009), (0.026, 0.005), (0.026, 0.0)], BLACK, axis=(1.0, 0.0, 0.0))
        # the handset, hung upright on its hook at the after side
        F.block('steel', (-0.062, 0.070, 0.085), (-0.030, 0.082, 0.118), STAINLESS, r=0.002)
        M = moving('Sound-powered telephone, handset', 'handset-sound-powered', body='Plastic')
        F.into = dict(plastic=M['body'])
        F.pillow('plastic', (-0.062, -0.075, 0.092), (-0.030, 0.075, 0.112), srgb(0x232629), r=0.008)
        for yy in (-0.084, 0.084):
            F.pillow('plastic', (-0.071, yy - 0.026, 0.088), (-0.021, yy + 0.026, 0.122), srgb(0x1c1f21), r=0.011)
        F.into = None
        MOTIONS.append(dict(id='handset-sound-powered', name='Sound-powered telephone handset', kind='slide', pivot=[float(v) for v in F.at((-0.046, 0.0, 0.1))],
                            axis=[float(v) for v in F.way((0.0, 0.55, 0.83))], ratio=0.01, max=9.0, at=[float(v) for v in F.at((-0.046, 0.0, 0.1))], auto='tap', reach=1.9,
                            rest='on its hook', above='lifted', unit='cm', fitting=tag))
        a, b = Vector((-0.046, -0.118, 0.102)), Vector((-0.046, -0.205, 0.045))
        F.sweep('rubber', [(-0.046, -0.108, 0.102)] + helix(a, b, 0.0058, 12, lead=0.006) + [(-0.046, -0.215, 0.012)], 0.0021, RUBBER)
        gland(F, -0.046, -0.215, 0.0, r=0.0065, cable=0.0021)
        F.sweep('rubber', [(0.03, -0.12, 0.04), (0.03, -0.19, 0.04), (0.03, -0.215, 0.022), (0.03, -0.215, 0.008)], 0.0035, RUBBER)     # its cable, into the console
        gland(F, 0.03, -0.215, 0.0, r=0.0075)


# ---------------------------------------------------------------------------------------------------------------------
# Levers. A lever is a moving part: it turns on its shaft, in its slot, when it is worked.
# ---------------------------------------------------------------------------------------------------------------------
PLATE = 0.065                       # a control head's slotted plate stands this far over the lever's shaft
NOTCH = 0.14 * 39 / 288             # the distance between the marks of the engine scale (its picture, 0.14 m long)
THRUST = 0.13 * 57 / 288            # and of the thruster scale
ORDERS = ('full astern', 'half astern', 'slow astern', 'stop', 'slow ahead', 'half ahead', 'full ahead')
THRUSTS = ('full thrust to port', 'half thrust to port', 'stopped', 'half thrust to starboard', 'full thrust to starboard')


def lever_notches(across=False):
    """The lever's angle in degrees at each mark of its scale: the arm crosses the slotted plate exactly at the mark."""
    marks_, pitch = ((-2, -1, 0, 1, 2), THRUST) if across else (range(-3, 4), NOTCH)
    return [round(degrees(atan(k * pitch / PLATE)), 2) for k in marks_]


def control_head(title, mover, works, x, yard, base, colour, across=False, s=1.0, sink=0.0):
    """
    A control head: a housing with a slot in its top plate, a scale beside the slot, and the lever that travels in it.

    The lever turns on a shaft inside the housing, 65 mm under the plate. A drum on the shaft closes the slot from below,
    the arm comes up through the slot to its grip, and where the arm crosses the plate is its reading: the scale's marks
    are spaced for exactly that (lever_notches). An engine's lever travels fore and aft, forward for ahead; the thruster's
    travels across, to port for thrust to port. Drum, arm and grip are one moving part.

    `base` is the height the head stands on, `s` its size (the wing stations' are three quarters), `sink` how far the
    housing goes down into a sloping top.
    """
    top, piv = base + (PLATE + 0.010) * s, base + 0.010 * s
    half_l, half_w = (0.085 if across else 0.09) * s, 0.07 * s
    run = PLATE * s * tan(radians(lever_notches(across)[-1])) + 0.010 * s      # half the slot's length
    v0, v1 = 0.0, 0.016 * s                                                     # the slot, across the lever's travel
    vs = (v0 + v1) / 2

    def at(u, v):                                                               # u along the travel, v across it
        return (x + u, yard + v) if across else (x + v, yard + u)

    def block(key, u0, u1, va, vb, h0, h1, col, r=0.003):
        (xa, ya), (xb, yb) = at(u0, va), at(u1, vb)
        box(key, xa, xb, ya, yb, h0, h1, col, r)

    lo = base - sink
    block('anod', -half_l, half_l, -half_w, v0, lo, top, ANOD)                  # the housing: four blocks round the slot
    block('anod', -half_l, half_l, v1, half_w, lo, top, ANOD)
    block('anod', run, half_l, v0, v1, lo, top, ANOD)
    block('anod', -half_l, -run, v0, v1, lo, top, ANOD)
    if not sink:                                                                # its foot: a flange on a gasket, a screw in each corner
        block('rubber', -half_l - 0.008 * s, half_l + 0.008 * s, -half_w - 0.008 * s, half_w + 0.008 * s, base, base + 0.0015, RUBBER, r=0.0)
        block('anod', -half_l - 0.006 * s, half_l + 0.006 * s, -half_w - 0.006 * s, half_w + 0.006 * s, base, base + 0.004, ANOD, r=0.001)
        for su in (-1, 1):
            for sv in (-1, 1):
                cx, cy = at(su * (half_l + 0.0015 * s), sv * (half_w + 0.0015 * s))
                with Frame((cx, cy, base + 0.004), STBD, FWD) as F:
                    screw(F, 0.0, 0.0, 0.0, r=0.0022)
    for va, vb in ((v0 - 0.003 * s, v0), (v1, v1 + 0.003 * s)):                 # the slot's steel lips
        block('steel', -run - 0.003 * s, run + 0.003 * s, va, vb, top, top + 0.0015, GREY, r=0.0)
    for u0, u1 in ((run, run + 0.003 * s), (-run - 0.003 * s, -run)):
        block('steel', u0, u1, v0, v1, top, top + 0.0015, GREY, r=0.0)
    long, wide = ((0.13, 0.05) if across else (0.14, 0.055))                    # the scale, its marks against the slot
    cx, cy = at(0.0, v0 - (0.005 + wide / 2) * s)
    pic((cx, cy, top), UP, FWD, (long if across else wide) * s, (wide if across else long) * s, 'thr_scale' if across else 'lever_scale')

    mv = moving(title, mover, steel='Stainless', grip='Plastic', drum='Matt black')
    (ax0, ay0), (ax1, ay1) = at(0.0, v0 + 0.001 * s), at(0.0, v1 - 0.001 * s)
    tube(mv['drum'], (ax0, ay0, piv), (ax1, ay1, piv), (PLATE - 0.007) * s, srgb(0x2b3032), 24)
    px, py = at(0.0, vs)
    tube(mv['steel'], (px, py, piv + (PLATE - 0.010) * s), (px, py, piv + (PLATE + 0.014) * s), 0.0075 * s, srgb(0x9aa2a3), 10)      # the arm's boss on the drum
    tube(mv['steel'], (px, py, piv + 0.05 * s), (px, py, piv + 0.16 * s), 0.0055 * s, STAINLESS, 10)
    (gx0, gy0), (gx1, gy1) = at(0.0, vs - 0.045 * s), at(0.0, vs + 0.045 * s)
    tube(mv['grip'], (gx0, gy0, piv + 0.16 * s), (gx1, gy1, piv + 0.16 * s), 0.022 * s, colour, 14)
    for (ex, ey) in ((gx0, gy0), (gx1, gy1)):                                    # the grip's rounded ends
        mv['grip'].ball(P(ex, ey, piv + 0.16 * s), 0.022 * s, colour)
    LEVERS.append(dict(id=mover, input=works, axis=[0, 0, 1] if across else [1, 0, 0], pivot=list(P(px, py, piv))))


LEVER_OF = {'PRP-01': ('Wheelhouse, port engine lever', 'lever-engine-p'), 'PRP-02': ('Wheelhouse, starboard engine lever', 'lever-engine-s'),
            'PRP-03': ('Wheelhouse, bow thruster lever', 'lever-thruster')}


SUNK = 0.012                        # how far a head's housing goes down into the desk under it


def lever(g, tag, x, yard, h):
    """An engine or thruster control lever in the desk's after edge, at the hand. `h` is the height of its slotted plate: the
    head is sunk in the sloping desk until the plate is a few millimetres over the desk at the head's forward end, so its
    grip's top is 0.12 m over the plate and 0.10 m over the level strip. What is behind it is read over it: from an eye
    1.6 m up anywhere abaft the block the line over the grip's top meets the level strip (JS4-402: the sea is seen over
    it too). The drum on the lever's shaft is wholly inside the block: forward of the cabinet's after face where it goes
    below the desk's lip."""
    title, works = LEVER_OF[tag]
    across = bool(g.get('across'))
    reach = 0.07 if across else 0.09                                   # half the head's length fore and aft
    if h < desk_h(yard + reach) + FIELD + 0.004:
        raise SystemExit(f'{tag}: the control head\'s plate at {h:.3f} m is under the desk at its forward end ({desk_h(yard + reach) + FIELD:.3f} m)')
    if not across and yard - max((PLATE - 0.007) ** 2 - (h - PLATE - 0.885) ** 2, 0.0) ** 0.5 < FACE:      # 0.885: the underside of the desk's lip
        raise SystemExit(f'{tag}: the lever\'s drum would come out under the desk\'s lip, abaft the cabinet\'s face')
    control_head(title, works, works, x, yard, h - PLATE - 0.010, srgb(g['colour']), across=across, sink=SUNK)


def facepanel(g, tag, x, yard, h):
    """A panel on an upright face that looks aft: the console's apron, or the steering stand's."""
    w, H = g['w'], g['H']
    with Frame((x, yard, h + H / 2), STBD, UP) as F:
        panel(F, g['tile'], -w / 2, -H / 2, w / 2, H / 2, thick=0.006)
        details(F, g['tile'], -w / 2 + 0.003, -H / 2 + 0.003, w / 2 - 0.003, H / 2 - 0.003, 0.006)


def sockets(g, tag, x, yard, h):
    """A 230 V socket outlet in a face: the console's apron (it looks aft), or the lining below a sill."""
    way = g.get('looks', 'aft')
    right = STBD if way == 'aft' else PORT if way == 'forward' else AFTWARD if way == 'port' else FWD
    with Frame((x, yard, h), right, UP) as F:
        socket(F, 0.0, 0.0, 0.0, double=bool(g.get('double')))


def binoculars(g, tag, x, yard, h):
    """The binocular box on the block's port end: a varnished box with a hinged lid, and in it two 7 x 50 glasses standing on
    their objectives, each in its own compartment. The lid lifts to a tap."""
    w, d, H, t = 0.34, 0.125, 0.20, 0.012
    with Frame((x, yard, h), AFTWARD, UP) as F:                                      # on a face that looks to port
        F.block('wood', (-w / 2, 0.0, 0.0), (w / 2, H, t), WOOD, r=0.002)            # back, bottom, two ends, a front, a division
        F.block('wood', (-w / 2, 0.0, t), (w / 2, t, d), WOOD, r=0.002)
        for xx in (-w / 2, w / 2 - t, -t / 2):
            F.block('wood', (xx, t, t), (xx + t, H - (0.03 if abs(xx + t / 2) < 0.01 else 0.0), d - t), WOOD, r=0.002)
        F.block('wood', (-w / 2, t, d - t), (w / 2, H, d), WOOD, r=0.002)
        for sx in (-1, 1):                                                           # two brass screws through the back into the console
            screw(F, sx * (w / 2 - 0.03), H - 0.03, t, r=0.003, key='brass', colour=BRASS)
        for sx in (-1, 1):                                                           # the glasses
            cx = sx * (w / 4 - t / 4)
            for bx in (-0.033, 0.033):
                F.lathe('plastic', (cx + bx, t, d / 2), [(0.0, 0.0), (0.0, 0.029), (0.012, 0.031), (0.07, 0.027), (0.105, 0.019), (0.135, 0.019), (0.150, 0.0165), (0.150, 0.0)], srgb(0x1b1d1f), axis=(0.0, 1.0, 0.0))
                F.lathe('rubber', (cx + bx, t + 0.150, d / 2), [(0.0, 0.0165), (0.012, 0.0185), (0.016, 0.0185), (0.016, 0.011)], RUBBER, axis=(0.0, 1.0, 0.0))
            F.block('plastic', (cx - 0.016, t + 0.075, d / 2 - 0.010), (cx + 0.016, t + 0.118, d / 2 + 0.010), srgb(0x1b1d1f), r=0.004)
            F.tube('plastic', (cx, t + 0.118, d / 2), (cx, t + 0.130, d / 2), 0.011, srgb(0x2a2d30))
        M = moving('Binocular box, lid', 'binocular-box-lid', wood='Varnished wood', brass='Bronze')
        F.into = dict(wood=M['wood'], brass=M['brass'])
        F.block('wood', (-w / 2 - 0.004, H + 0.003, 0.0), (w / 2 + 0.004, H + 0.017, d + 0.008), tint(WOOD, 1.06), r=0.003)
        F.block('wood', (-w / 2 - 0.004, H - 0.018, d + 0.003), (w / 2 + 0.004, H + 0.003, d + 0.008), tint(WOOD, 1.06), r=0.002)
        F.lathe('brass', (0.0, H - 0.008, d + 0.006), [(0.0, 0.007), (0.004, 0.007), (0.008, 0.0045), (0.012, 0.006), (0.014, 0.0)], BRASS)
        for sx in (-1, 1):
            F.tube('brass', (sx * 0.10 - 0.02, H + 0.004, 0.0), (sx * 0.10 + 0.02, H + 0.004, 0.0), 0.0042, BRASS)
        F.into = None
        MOTIONS.append(dict(id='binocular-box-lid', name='Binocular box', kind='turn', pivot=[float(v) for v in F.at((0.0, H + 0.004, 0.0))], axis=[float(v) for v in F.way((1.0, 0.0, 0.0))],
                            ratio=-1.0, max=100, at=[float(v) for v in F.at((0.0, H, d / 2))], auto='tap', reach=1.9, rest='shut', above='open', fitting=tag))
