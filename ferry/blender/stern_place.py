"""
The stern ramp and everything that works it, in one plain file: the leaf, its hinges, its two cylinders, its end flaps and
its ten cleats; the power pack, its valves and pipes; the control stand, the starter panel and their cables; and where the
feeds end in the machinery spaces.

The owner, 12 November 2026, of the ramp as first built (a slab on two long cylinders from posts on the deck): "make the
ramp more realistic its a simple system that could be animated much better, and hydraulics and a local control panel that
is wired up, with component list and proper wiring , as a place holder now, draw all feed to the engine room, but all ends
need to be marked so we know where to instal the Generators and electrical cabinets".

One source for four readers (the owner's rule: a measure used by two builders lives in one plain file): the builder
(stern_gear.py), the yard's drawing (yard/drawings/stern_drawing.py: JS3-304), the register (systems/stern.py) and the page
checks. No Blender here: plain Python. `python3 ferry/blender/stern_place.py` prints the mechanism and says what is wrong.

Measures. x: metres to port of the centreline. `inn`: metres inside the transom's outer plating (negative: abaft it).
h: metres over the main deck. `ship()` gives the ship's own axes. A place in a machinery space is given as the machinery's
design basis gives it: (x, metres from the transom, metres above the keel), and `keel()` gives the ship's axes.

What was wrong with the first ramp, and what is done about it:
  - Its cylinders ran nearly level from posts 6 m inside the stern to lugs 2.2 m up the leaf. With the leaf down their
    line passed 0.66 m from the hinge: to hold 55 t there each would have to pull 2,200 kN, twice what a 300 mm cylinder
    gives at 210 bar. And they crossed the after mooring stations' doors at breast height. Each is hung now from a
    bracket under the upper deck's web beam at 3.6 m, beside the station's wall, and comes down to the leaf like a stay:
    1.6 m from the hinge with the leaf level: 906 kN a cylinder there, 952 kN at its lowest, 198 bar on a 300 mm cylinder's
    rod side (`wrong()` works it out).
  - It went 10 degrees under the level, which put its end 0.9 m under water at her draught: 4 degrees now.
  - It had no hinges but a pin at each side, no flaps, no cleats, no seal, no pump, no pipe, no control.
"""
from math import atan2, cos, degrees, hypot, pi, radians, sin
import lines as L
import spec as S

MAIN = S.MAIN_DECK                     # the main deck, over the waterline (the model's y)
UPPER_H = S.UPPER_DECK - S.MAIN_DECK   # the upper deck's top, over the main deck: 6.6 m
WEB_H = UPPER_H - 0.012 - S.DECK_WEB   # the lower edge of the upper deck's web beams (steel.py: PLATE)
WATER_H = -MAIN                        # her design waterline, over the main deck: -1.0 m


def ship(x, inn, h):
    """A place at the stern → the ship's axes (x to port, y up from the waterline, z forward from amidships)."""
    return (x, MAIN + h, -L.HALF + inn)


def keel(x, yard, above):
    """A place in the machinery spaces (x, metres from the transom, metres above the keel) → the ship's axes."""
    return (x, L.Y(above), L.Z(yard))


# =====================================================================================================================
# The door, the leaf, the hinges
# =====================================================================================================================
DOOR = dict(half=S.STERN_DOOR['half'], height=S.STERN_DOOR['height'])
R = S.STERN_RAMP
# The leaf: a box girder. `road` and `skin` are its roadway and its outer skin, inside the transom when it is raised;
# `foot` its lower end. From `taper` along it the outer skin comes in, to `tip` deep at its end: the end lies low on a quay.
# `drive` is half the clear driveway, between the two cylinders: marked by a yellow line each side. The part of the
# roadway that lies against the transom and the stern bulwark when it is raised (`flat`: metres along it; and everything
# outside the door's opening) is the door's sealing face and carries nothing proud of it.
LEAF = dict(id=R['id'], half=R['half'], length=R['length'], road=R['thick'][1], skin=R['thick'][0], foot=R['foot'],
            taper=9.4, tip=0.16, drive=4.0, flat=(5.02, 7.95), bars=(0.30, 0.024, 0.012), mass=55.0)
DEPTH = LEAF['road'] - LEAF['skin']
# The hinge line (`h`, `inn`), and the six hinges along it (`at`, each side of the centreline): at each a lug of the ship
# stands out of the transom under the sill into a slot in the leaf's foot (`slot` wide, `strip` deep along the leaf), and
# one pin goes through the six lugs and the leaf's foot between them.
HINGE = dict(h=R['hinge'][0] - MAIN, inn=R['hinge'][1], at=(0.75, 2.35, 3.95), pin=0.045, lug=0.05, slot=0.07, strip=0.16, boss=0.075)

# ---- its motion. The control runs from 0 (raised and locked) to LOWEST. Over its first degrees nothing of the leaf
# moves: the cleats let go (CLEAT_RUN). Then the leaf turns, so placed that it is level at exactly LEVEL and at its lowest
# at LOWEST; the flaps at its end fold out on the way down (FLAP_RUN). Raising is the same backwards: the flaps fold, the
# leaf comes home against its seal, the cleats lock.
LEVEL, LOWEST = 90.0, float(R['lowered'])
RATE = 1.5                              # of the control, a second: a minute and a little from locked to level
CLEAT_RUN = (0.0, 5.0)
LEAF_FROM = 6.0
FLAP_RUN = (38.0, 78.0)
LEAF_MAP = [(0.0, 0.0), (LEAF_FROM, 0.0), (LEVEL, LEVEL), (LOWEST, LOWEST)]


def mapped(table, v):
    """A piecewise straight table [(control, value), ...] read at v (the page reads a mover's `map` the same way)."""
    if v <= table[0][0]:
        return table[0][1]
    for (a, fa), (b, fb) in zip(table, table[1:]):
        if v <= b:
            return fa + (fb - fa) * (v - a) / (b - a) if b > a else fb
    return table[-1][1]


def leaf_angle(control):
    return mapped(LEAF_MAP, control)


def turned(inn, h, angle):
    """A point that goes with the leaf (given with the leaf raised), with the leaf lowered `angle` degrees: (inn, h)."""
    a = radians(angle)
    dh, di = h - HINGE['h'], inn - HINGE['inn']
    return HINGE['inn'] + di * cos(a) - dh * sin(a), HINGE['h'] + dh * cos(a) + di * sin(a)


def on_leaf(s, t, angle=0.0):
    """A point of the leaf by its own measures: s metres along it from its foot, t metres off its roadway (toward the
    ship when it is raised, upward when it is down) → (inn, h) with the leaf lowered `angle` degrees."""
    return turned(LEAF['road'] + t, LEAF['foot'] + s, angle)


# =====================================================================================================================
# The two cylinders
# =====================================================================================================================
# One each side, inside the opening's width (`x`). `trunnion`: its head pin (inn, h), in a bracket under the upper deck's
# web beam at 3.6 m, tied to the mooring station's wall. `pin`: its rod's pin in a lug on the leaf (inn, h, the leaf
# raised). Double-acting, `bore` and `rod`; it PULLS to hold and raise the leaf (the oil is on the rod's side), so its
# load-holding valve is on that side. Along it from the trunnion: `cap` the head's eye, `barrel` the tube's end, `gland`,
# `rod_from` the rod's inner end with the leaf raised.
RAM = dict(x=4.25, trunnion=(3.60, 5.45), pin=(0.17, 2.20), bore=0.30, rod=0.17, od=0.35, stroke=3.40,
           cap=0.20, barrel=3.98, gland=(3.94, 4.10), rod_from=0.42, eye=0.15, lug=(0.035, 0.085), pressure=210.0)
# Its bracket: two cheeks (`cheek`: off the cylinder's line, from and to) from the web beam's lower edge down past the
# pin, `long` fore and aft; a plate across their top under the beam; a gusset from the outboard cheek to the wall.
BRACKET = dict(cheek=(0.20, 0.24), long=(3.34, 3.86), foot=5.22, pin=0.055)


def ram_pin(angle):
    return turned(RAM['pin'][0], RAM['pin'][1], angle)


def ram_length(angle):
    (pi_, ph), (ti, th) = ram_pin(angle), RAM['trunnion']
    return hypot(pi_ - ti, ph - th)


def ram_arm(angle):
    """How far the cylinder's line passes from the hinge with the leaf at `angle`: the arm its force turns the leaf by."""
    (pi_, ph), (ti, th) = ram_pin(angle), RAM['trunnion']
    hi, hh = HINGE['inn'], HINGE['h']
    return abs((pi_ - hi) * (th - hh) - (ph - hh) * (ti - hi)) / hypot(pi_ - ti, ph - th)


def leaf_moment(angle):
    """The leaf's weight about the hinge, kN m: its middle is half its length along it and half its depth behind its roadway."""
    ci, ch = on_leaf(LEAF['length'] / 2, -DEPTH / 2, angle)
    return LEAF['mass'] * 9.81 * abs(ci - HINGE['inn'])


def ram_force(angle):
    """What each cylinder carries with the leaf at `angle`, kN (two share it)."""
    return leaf_moment(angle) / ram_arm(angle) / 2


ANNULUS = pi / 4 * (RAM['bore'] ** 2 - RAM['rod'] ** 2)          # m²: the side the oil pulls on
FULL = pi / 4 * RAM['bore'] ** 2


# =====================================================================================================================
# The end flaps
# =====================================================================================================================
# Eight across the leaf's end, each on its own hinge: they lie on a quay that is not level with her and take up her
# list. `axis` is their hinge line by the leaf's own measures (s along it, t off its roadway). Stowed, each lies folded
# back over the roadway, its driving face `axis[1]` twice over the roadway; let down, it carries the roadway on and
# hangs `droop` degrees under it until it finds the quay.
FLAP = dict(n=8, width=1.10, gap=0.06, length=1.20, root=0.07, tip=0.025, axis=(11.03, 0.035), droop=5.0)
FLAP_MAP = [(0.0, 0.0), (FLAP_RUN[0], 0.0), (FLAP_RUN[1], 180.0 + FLAP['droop']), (LOWEST, 180.0 + FLAP['droop'])]


def flap_xs():
    """Each flap's two edges across the leaf, port to starboard."""
    w, g, n = FLAP['width'], FLAP['gap'], FLAP['n']
    left = (n * w + (n - 1) * g) / 2
    return [(left - k * (w + g) - w, left - k * (w + g)) for k in range(n)]


def flap_tip(angle):
    """The flaps' free edge (inn, h) with the leaf at `angle` and the flaps let down."""
    s, t = FLAP['axis']
    ai, ah = on_leaf(s, t, angle)
    a = radians(angle + FLAP['droop'])            # the flap's own line, turned as the leaf is and a little more
    return ai - (FLAP['length']) * sin(a) - t * cos(a), ah + FLAP['length'] * cos(a) - t * sin(a)


# =====================================================================================================================
# The cleats, the seal
# =====================================================================================================================
# Raised, the leaf is the stern door: it is drawn against a rubber seal round the opening and held there by ten cleats,
# each worked by a small cylinder and each with a switch that tells the stand and the bridge it is home.
#   Eight bolt cleats, four a side (`h`): a bolt of `d` in a housing on the mooring station's side of the door post, shot
#   inboard through the post into a keeper that stands in from the leaf through the opening (`keeper`: off the
#   centreline, from and to). `tip` is where the bolt's end lies when locked; it draws back `travel`.
#   (And, beside them, the two safety latches: below.)
#   Two hook cleats at the door's head (`x`): an arm on a pivot under a hanger, with a tooth that stands up abaft a pin
#   carried by the leaf; to let go, the arm drops `swing` degrees.
BOLT = dict(h=(0.70, 1.50, 3.30, 4.40), inn=0.11, d=0.07, travel=0.20, tip=4.34, keeper=(4.385, 4.445), keeper_in=0.21,
            house=(4.505, 4.72), cyl=(4.72, 5.06), cyl_d=0.10, base=(4.505, 5.10), length=0.50)
HOOK = dict(x=2.20, pin=(0.13, 5.03), pivot=(0.50, 4.95), swing=35.0, arm=0.02, lug=(0.035, 0.060), cheek=(0.065, 0.090),
            hanger=5.44, ram_anchor=(0.56, 5.38), ram_pin=(0.26, 4.955))
# Two safety latches, one on each door post at breast height (the owner, 12 November 2026: "There needs to be a latch for
# the ramp too, so it doesnt become dangerous"). Nothing of them needs oil to hold: an arm on a pivot (`pivot`), heavy at
# its after end, whose tooth falls by its own weight behind a striker pin (`pin`) that a lug of the leaf carries in through
# the opening; the tooth's foot is sloped, so the striker lifts it as the leaf comes home and it drops behind. It is
# lifted `swing` degrees to let the leaf go: by a small single-acting cylinder on the cleats' let-go line, or, with no oil,
# by pressing down the handle at its forward end. It is the first thing to let go and the last to fall in. `x`: the arm,
# off the centreline, from and to; `lug`: the leaf's lug that carries the striker; a hole through arm and bracket takes a
# pin for the sea passage.
LATCH = dict(h=1.10, pin=(0.20, 1.10), pivot=(0.52, 1.20), swing=30.0, x=(4.32, 4.36), lug=(4.385, 4.445), lug_in=0.26, bracket=(4.37, 0.44, 0.60, 0.88, 1.30),
             handle=0.72, ram_anchor=(0.47, 0.96), ram_pin=(0.33, 1.185))
LATCH_MAP = [(0.0, 0.0), (CLEAT_RUN[1] * 0.6, LATCH['swing'])]
BOLT_MAP = [(0.0, 0.0), (CLEAT_RUN[1], BOLT['travel'])]
HOOK_MAP = [(0.0, 0.0), (CLEAT_RUN[1], HOOK['swing'])]
# The seal: a rubber strip on the transom round the opening's sides and head, `out` beyond its edge, `wide`, `proud`.
SEAL = dict(out=0.03, wide=0.07, proud=0.018)

# =====================================================================================================================
# The power pack, its valves and the pipes (the hydraulic pump room: main deck, port casing, 7.2 to 12.6 m)
# =====================================================================================================================
# Places here are (x, metres from the transom, h over the main deck). The room's inboard wall is the casing's, at 7.5 m;
# its door is in that wall at 9.4 to 10.3 m. HPU-R stands forward of the door against her side, with a way 0.7 m wide
# between it and the inboard wall; the after half of the room is kept for the cargo lift's power pack (HPU-L).
WALL = S.STERN_DOOR['half']             # the mooring stations' inboard walls, and the door's posts: 4.5 m
CASING = 7.5                            # the hydraulic room's inboard wall
T = 0.005                               # half a wall's thickness as drawn
HPU = dict(
    tank=(8.25, 9.20, 10.55, 12.35, 0.12, 1.02),          # x from, to; from the transom from, to; h from, to: about 1,500 litres
    tray=(8.19, 9.26, 10.49, 12.41, 0.05),                # the drip tray under it, and its rim's height
    pumps=((8.72, 11.20), (8.72, 11.95)),                 # the two main pumps' motors, on the tank's lid: 37 kW each
    motor=(0.22, 0.72), bell=(0.18, 0.18),                # a motor's radius and height; its bell housing's
    cleat_pump=(8.72, 10.80), cleat_motor=(0.12, 0.36),   # the cleats' pump: 4 kW
    cooler=(8.40, 9.05, 10.30, 10.55, 0.30, 0.95),        # the oil cooler on the tank's after end, with its fan
    block=(8.27, 8.45, 11.36, 11.80, 1.02, 1.20),         # the pressure block on the lid: filter, relief valve, gauge
    return_filter=(9.02, 10.78), breather=(9.04, 12.18), hand_pump=(8.25, 10.80),
    manifold=(7.505, 7.66, 11.00, 11.62, 1.00, 1.30),     # the valve stand on the inboard wall: three lever valves
)
# The starter panel, on the room's forward wall, at the end of the way: 0.58 m wide, with two leaves of 0.29 m, so that each
# opens square in the 0.75 m between the wall and the tank (one leaf of the whole width would not).
PANEL = dict(box=(7.62, 8.20, 12.29, 12.595, 0.35, 2.05))
# The pipes from the valve stand to the stern, as a bank on the walls: (name, what, bore mm, radius as drawn, its height in
# the bank, its colour). A and B work the two cylinders; C and D the ten cleats. The fifth line of the bank is the
# conduit of the control stand's cables.
LINES = [
    ('A', 'cylinders, rod side: oil here raises the ramp', 25, 0.0150, 2.30),
    ('B', 'cylinders, piston side: oil here lowers it', 25, 0.0150, 2.37),
    ('C', 'cleats: lock', 12, 0.0090, 2.44),
    ('D', 'cleats: let go', 12, 0.0090, 2.50),
    ('E', 'conduit: the control stand\'s cables', 0, 0.0130, 2.59),
]
# How the bank is laid, so that no two lines ever cross in one plane: what runs level along a wall lies in a first layer,
# BANK_OFF from it; what goes up or down a wall lies in a second layer, LAYER further out, and a line steps from one to the
# other where it turns. On the port station's wall each line turns up at its own place (`UP`: metres inside the transom,
# the cleats' two nearest the cleats), and they cross to starboard above the door's head on the transom, each at its own
# height (`CROSS`), under the web beam's edge and over the hook cleats' hangers: the later a line turns up, the higher it
# crosses, so each passes over the bend of the one before.
BANK_OFF, LAYER = 0.060, 0.050
UP = dict(C=0.30, D=0.37, A=0.44, B=0.51)
CROSS = dict(C=5.500, D=5.545, A=5.600, B=5.655)
HEADER_FOOT = 0.55                                  # the cleats' two lines go down the wall to here: every bolt cleat is fed from them by a hose
RAM_FEED = dict(inn=dict(A=3.93, B=4.00), h=5.30, x=WALL - T - 0.075)      # where A and B come through the wall beside each bracket, to the hoses
MANIFOLD_AT = dict(A=11.06, B=11.13, C=11.20, D=11.27, P=11.40, T=11.47, E=11.57)   # where each line leaves the valve stand's top, from the transom
SUPPLY = [('P', 'pressure, from the pumps to the valve stand', 25, 0.0150, 2.10), ('T', 'return, from the valve stand to the tank', 32, 0.0175, 2.19)]
JB = dict(box=(4.505, 4.66, 0.84, 1.12, 1.45, 1.85))                       # the junction box of the cleats' switches, on the station's wall


def routes():
    """Every line as it is laid: name → its runs, each a list of (x, inn, h). The builder lays them, the register and the
    drawing read them."""
    x_room = CASING + T + BANK_OFF                  # on the hydraulic room's inboard wall
    y_fwd = 7.2 - T - BANK_OFF                      # on the after face of the mooring station's forward wall
    x1, x2 = WALL + T + BANK_OFF, WALL + T + BANK_OFF + LAYER          # the two layers on the station's inboard wall
    it = S.SHELL + BANK_OFF                         # on the transom's inner face
    top = HPU['manifold'][5]
    out = {}
    for name, what, bore, r, h in LINES:
        at = MANIFOLD_AT[name]
        if name == 'E':
            pb = PANEL['box']
            jb = JB['box']
            mid = (STAND['inn'][0] + STAND['inn'][1]) / 2
            out[name] = [
                # from the starter panel's side to the wall, up, aft with the bank, and down to the junction box
                [(pb[0], 12.40, 1.80), (x_room, 12.40, 1.80), (x_room, 12.40, h), (x_room, y_fwd, h), (x1, y_fwd, h), (x1, mid, h), (x2, mid, h), (x2, mid, jb[5])],
                # from the junction box down and through the wall into the control stand's back
                [(x2, mid, jb[4]), (x2, mid, 0.60), (STAND['x'][1], mid, 0.60)],
                # the branch down to the solenoids' box on the valve stand
                [(x_room, at, h), (x_room, at, top + 0.25)],
            ]
            continue
        up, hc = UP[name], CROSS[name]
        trunk = [(x_room, at, top), (x_room, at, h), (x_room, y_fwd, h), (x1, y_fwd, h), (x1, up, h), (x2, up, h)]
        if name in 'AB':
            fi = RAM_FEED['inn'][name]
            out[name] = [
                # up the wall, aft to the transom, across over the door's head, forward along the starboard station's wall to its bracket
                trunk + [(x2, up, hc), (x2, it, hc), (-x1, it, hc), (-x1, fi, hc), (-x2, fi, hc), (-x2, fi, RAM_FEED['h']), (-RAM_FEED['x'], fi, RAM_FEED['h'])],
                # the branch to the port cylinder: out to the second layer, up, and through the wall beside the bracket
                [(x1, fi, h), (x2, fi, h), (x2, fi, RAM_FEED['h']), (RAM_FEED['x'], fi, RAM_FEED['h'])],
            ]
        else:
            out[name] = [
                trunk + [(x2, up, hc), (x2, it, hc), (-x2, it, hc), (-x2, up, hc), (-x2, up, HEADER_FOOT)],
                # the port header's lower half: from the tee down to the lowest cleats
                [(x2, up, h), (x2, up, HEADER_FOOT)],
            ]
    blk = HPU['block']
    for name, what, bore, r, h in SUPPLY:
        at = MANIFOLD_AT[name]
        xt = (blk[0] + blk[1]) / 2
        out[name] = [[(x_room, at, top), (x_room, at, h), (xt, at, h), (xt, at, blk[5])]]
    return out


def line(name):
    return next(l for l in LINES + SUPPLY if l[0] == name)


def wall_at(p):
    """The wall a point of a line is clamped to: (the axis it faces along, the wall's face there, the way from the wall to
    the line), or None where the line crosses open space or goes through a wall."""
    x, inn, h = p
    if inn < S.SHELL + BANK_OFF + 0.02:
        return (1, S.SHELL, 1)                                       # the transom's inner face
    if inn > 7.2 and abs(x - (CASING + T + BANK_OFF)) < 0.02:
        return (0, CASING + T, 1)                                    # the hydraulic room's inboard wall
    if abs(inn - (7.2 - T - BANK_OFF)) < 0.02 and WALL + 0.05 < x < CASING + 0.3:
        return (1, 7.2 - T, -1)                                      # the station's forward wall, its after face
    if inn < 7.1 and WALL + T + 0.02 < abs(x) < WALL + T + BANK_OFF + LAYER + 0.02:
        return (0, (WALL + T) * (1 if x > 0 else -1), 1 if x > 0 else -1)   # a station's inboard wall
    return None


def clamps():
    """Where each line is clamped: (name, the place on the line, the wall as `wall_at` gives it, which way the line runs
    there: 0 across her, 1 fore and aft, 2 upright). At 0.15 m from each end of a straight length and no more than 1.0 m
    apart between (a short length: once, in its middle); on a station's wall never in the height of the bank itself,
    where a clamp of an upright line would stand across the level ones."""
    out = []
    bank = (min(l[4] for l in LINES) - 0.07, max(l[4] for l in LINES) + 0.07)
    for name, runs in routes().items():
        for run in runs:
            for a, b in zip(run, run[1:]):
                length = sum((u - v) ** 2 for u, v in zip(a, b)) ** 0.5
                mid = tuple((u + v) / 2 for u, v in zip(a, b))
                wall = wall_at(mid)
                if length < 0.30 or wall is None or wall_at(a) != wall and wall_at(b) != wall:
                    continue
                along = max(range(3), key=lambda i: abs(b[i] - a[i]))
                n = max(1, int((length - 0.30) / 1.0 + 0.999))
                for k in range(n + 1) if length >= 0.55 else (0,):
                    d = 0.15 + (length - 0.30) * k / n if length >= 0.55 else length / 2
                    p = tuple(u + (v - u) * d / length for u, v in zip(a, b))
                    upright = abs(a[2] - b[2]) > 0.01
                    if upright and abs(p[0]) < CASING and bank[0] < p[2] < bank[1]:
                        p = (p[0], p[1], bank[0] - 0.03 if p[2] - bank[0] < bank[1] - p[2] else bank[1] + 0.03)
                        if not min(a[2], b[2]) + 0.05 < p[2] < max(a[2], b[2]) - 0.05:
                            continue
                    out.append((name, p, wall, along))
    return out


# =====================================================================================================================
# The control stand (CS-R), on the main deck beside the door, port side
# =====================================================================================================================
# A pedestal against the port mooring station's wall just inside the door, its sloping face looking forward: whoever
# works it stands forward of it and looks aft over it at the ramp's foot (the basis: "on the car deck, port side, just
# aft of the ramp", with sight of the ramp's foot). Its conduit comes through the wall behind it.
STAND = dict(x=(4.04, 4.48), inn=(0.80, 1.16), top=1.12, slope=0.30, hoop=4.00)
# What is on its face, by row and column (0, 0 is top left as the one who works it sees it):
STAND_FACE = [
    ('lamp', 'POWER', 0, 0, 'white'), ('lamp', 'LOCKED', 0, 1, 'green'), ('lamp', 'CLEATS FREE', 0, 2, 'amber'), ('lamp', 'OIL', 0, 3, 'red'),
    ('button', 'PUMP 1', 1, 0, 'green'), ('button', 'PUMP 2', 1, 1, 'green'), ('stop', 'STOP', 1, 3, 'red'),
    ('lever', 'RAMP', 2, 1.5, 'black'),
]

# =====================================================================================================================
# Where the feeds end: the places marked in the machinery spaces (the owner: "all ends need to be marked so we know
# where to instal the Generators and electrical cabinets")
# =====================================================================================================================
# From the machinery's design basis (yard/design/machinery-design-basis.md, sections 1.2, 2.3, 2.4), as (x, metres from
# the transom, metres above the keel). Each: its tag, what is to stand there, its outline on the floor (x from, to; from
# the transom from, to), the floor's height, where its sign stands, and which side of the outline the cables come to.
PLATFORM, TANK_TOP = 4.0, 1.6
ENDS = [
    dict(tag='MSB', name='MAIN SWITCHBOARD', line='690 V  60 Hz', box=(1.50, 6.00, 19.40, 20.20), floor=PLATFORM, room='switchboard-room',
         what='Main switchboard, 690 V: the three generating sets in parallel, the bus tie, the thruster feeder, the two transformer feeders.'),
    dict(tag='PSB', name='440 V SECTION', line='440 V  60 Hz', box=(1.50, 6.00, 17.40, 18.20), floor=PLATFORM, room='switchboard-room',
         what='Main switchboard, 440 V section: behind the two transformers; her motors other than the thruster. The stern ramp\'s feeder ends here.'),
    dict(tag='T1', name='TRANSFORMER 1', line='690/440 V  800 kVA', box=(6.25, 7.30, 17.15, 18.25), floor=PLATFORM, room='switchboard-room',
         what='Main transformer No. 1, 690/440 V, 800 kVA: either of the two carries the whole 440 V load.'),
    dict(tag='T2', name='TRANSFORMER 2', line='690/440 V  800 kVA', box=(6.25, 7.30, 19.35, 20.45), floor=PLATFORM, room='switchboard-room',
         what='Main transformer No. 2, 690/440 V, 800 kVA.'),
    dict(tag='DG1', name='GENERATING SET 1', line='320 kW  690 V', box=(0.95, 2.25, 39.40, 43.10), floor=TANK_TOP, room='aux-engine-room',
         what='Diesel generating set No. 1: 320 kW, 400 kVA, 690 V, 60 Hz, 1,800 rpm. Alternator forward.'),
    dict(tag='DG2', name='GENERATING SET 2', line='320 kW  690 V', box=(-2.65, -1.35, 39.40, 43.10), floor=TANK_TOP, room='aux-engine-room',
         what='Diesel generating set No. 2: 320 kW, 400 kVA, 690 V, 60 Hz, 1,800 rpm. Alternator forward.'),
    dict(tag='DG3', name='GENERATING SET 3', line='320 kW  690 V', box=(-6.25, -4.95, 39.40, 43.10), floor=TANK_TOP, room='aux-engine-room',
         what='Diesel generating set No. 3: 320 kW, 400 kVA, 690 V, 60 Hz, 1,800 rpm. Alternator forward.'),
]
END = {e['tag']: e for e in ENDS}


def end_point(tag):
    """Where a marked place's cables end: (x, from the transom, above the keel). A switchboard's at its outboard end, 2.1 m
    over the floor; a transformer's at its middle; a generating set's at its alternator, forward."""
    e = END[tag]
    x0, x1, a, b = e['box']
    if tag.startswith('DG'):
        return ((x0 + x1) / 2, b - 0.55, e['floor'] + 2.1)
    if tag.startswith('T'):
        return ((x0 + x1) / 2, b - 0.22, e['floor'] + 2.1)      # (each inside its outline, clear of the band and of the tag painted on the floor)
    return (x1 - 0.25, (a + b) / 2, e['floor'] + 2.1)


# =====================================================================================================================
# Does it work?
# =====================================================================================================================
def wrong():
    """What does not hold of the mechanism as it is specified here. An empty list: it can be built."""
    out = []
    closed, level, lowest = ram_length(0), ram_length(LEVEL), ram_length(LOWEST)
    if lowest - closed > RAM['stroke'] - 0.05:
        out.append(f"the cylinder runs out {lowest - closed:.2f} m and has a stroke of {RAM['stroke']:.2f} m")
    if closed < RAM['gland'][1] + RAM['eye'] + 0.10:
        out.append(f'closed, the cylinder is {closed:.2f} m between pins: its gland at {RAM["gland"][1]:.2f} m and its rod\'s eye do not fit')
    if RAM['rod_from'] + (lowest - closed) > RAM['barrel'] - 0.20:
        out.append('run out, the piston leaves the barrel')
    for a in range(0, int(LOWEST) + 1):
        if ram_arm(a) < 0.25:
            out.append(f'at {a} degrees the cylinder\'s line passes {ram_arm(a):.2f} m from the hinge')
            break
    worst = max(range(int(LEAF_FROM), int(LOWEST) + 1), key=ram_force)
    bar = ram_force(worst) / ANNULUS / 100
    if bar > RAM['pressure'] * 0.95:
        out.append(f'at {worst} degrees each cylinder must pull {ram_force(worst):.0f} kN: {bar:.0f} bar on its rod side, over {RAM["pressure"]:g} bar')
    # what stands in from the leaf goes through the opening
    lug_out = RAM['x'] + RAM['lug'][1]
    if lug_out > DOOR['half'] - 0.10 or RAM['pin'][1] + 0.25 > DOOR['height']:
        out.append('the cylinder\'s lug on the leaf does not pass through the opening')
    if BOLT['keeper'][1] > DOOR['half'] - 0.04 or max(BOLT['h']) + 0.15 > DOOR['height']:
        out.append('a bolt cleat\'s keeper does not pass through the opening')
    if RAM['x'] + RAM['lug'][1] > BOLT['keeper'][0] - 0.01 and any(abs(h - RAM['pin'][1]) < 0.35 for h in BOLT['h']):
        out.append('a bolt cleat\'s keeper stands where the cylinder\'s lug is')
    if LATCH['lug'][1] > DOOR['half'] - 0.04 or any(abs(h - LATCH['h']) < 0.22 for h in BOLT['h']) or abs(RAM['pin'][1] - LATCH['h']) < 0.45:
        out.append('a safety latch\'s striker lug stands where a keeper or the cylinder\'s lug is, or does not pass through the opening')
    if LATCH['handle'] > STAND['inn'][0] - 0.05:
        out.append('a safety latch\'s handle reaches the control stand')
    if HOOK['pin'][1] + 0.12 > DOOR['height']:
        out.append('the hook cleats\' lugs on the leaf do not pass under the door\'s head')
    # the flaps, stowed, stand over the stern bulwark; let down at her lowest, they are clear of the water
    stowed_low = FLAP['axis'][0] - FLAP['length'] + LEAF['foot']
    if stowed_low < UPPER_H + L.BULWARK + 0.10:
        out.append(f'the flaps, stowed, reach down to {stowed_low:.2f} m over the main deck: the stern bulwark\'s rail is at {UPPER_H + L.BULWARK:.2f} m')
    if LEAF['flat'][1] < UPPER_H + L.BULWARK + 0.10 - LEAF['foot'] or LEAF['flat'][0] > DOOR['height'] - 0.10:
        out.append('the roadway\'s flat sealing face does not cover the transom over the door and the stern bulwark')
    tip = flap_tip(LOWEST)[1]
    if tip < WATER_H:
        out.append(f'at her lowest the flaps\' ends are {WATER_H - tip:.2f} m under water')
    # the cylinder stands over the mooring station's door and over a head at the control stand
    for name, inn, need in (('the mooring station\'s door', 2.85, 2.25), ('the control stand', (STAND['inn'][0] + STAND['inn'][1]) / 2 + 0.5, 2.10)):
        for a in (0, LEVEL, LOWEST):
            (pi_, ph), (ti, th) = ram_pin(a), RAM['trunnion']
            if min(pi_, ti) < inn < max(pi_, ti):
                at = ph + (th - ph) * (inn - pi_) / (ti - pi_) - RAM['od'] / 2
                if at < need:
                    out.append(f'with the leaf at {a:g} degrees the cylinder is {at:.2f} m over the deck at {name}')
    if BRACKET['foot'] > RAM['trunnion'][1] - 0.12 or RAM['trunnion'][1] + 0.12 > WEB_H:
        out.append('the bracket does not hold the trunnion pin under the web beam')
    return out


def report():
    closed, level, lowest = ram_length(0), ram_length(LEVEL), ram_length(LOWEST)
    worst = max(range(int(LEAF_FROM), int(LOWEST) + 1), key=ram_force)
    litres = ANNULUS * (lowest - closed) * 1000 * 2
    rows = [
        f'leaf {LEAF["length"]:g} x {2 * LEAF["half"]:g} m, {DEPTH:.2f} m deep, about {LEAF["mass"]:g} t; hinge line {-HINGE["inn"] * 1000:.0f} mm abaft the transom, {-HINGE["h"] * 1000:.0f} mm under the main deck',
        f'cylinders: bore {RAM["bore"] * 1000:.0f}, rod {RAM["rod"] * 1000:.0f}, stroke {RAM["stroke"]:.2f} m; pin to pin {closed:.3f} m raised, {level:.3f} m level, {lowest:.3f} m at {LOWEST:g} degrees (runs out {lowest - closed:.3f} m)',
        f'arm about the hinge: {ram_arm(0):.2f} m raised, {ram_arm(45):.2f} m at 45 degrees, {ram_arm(LEVEL):.2f} m level',
        f'each cylinder carries at most {ram_force(worst):.0f} kN (at {worst} degrees): {ram_force(worst) / ANNULUS / 100:.0f} bar on its rod side; level {ram_force(int(LEVEL)):.0f} kN',
        f'to raise it from its lowest: {litres:.0f} litres into the two rod sides: {litres / 200 * 60:.0f} s with two pumps of 100 l/min, {litres / 100 * 60:.0f} s with one',
        f'at {LOWEST:g} degrees the leaf\'s end is {-on_leaf(LEAF["length"], 0, LOWEST)[1]:.2f} m under the main deck and the flaps\' ends {flap_tip(LOWEST)[1] - WATER_H:+.2f} m from the water',
        f'safety latches: one on each door post at {LATCH["h"]:.1f} m, held by their own weight; lifted {LATCH["swing"]:g} degrees to let the ramp go',
        f'the control: cleats let go over {CLEAT_RUN[1]:g} of it, the leaf turns from {LEAF_FROM:g}, flaps fold out from {FLAP_RUN[0]:g} to {FLAP_RUN[1]:g}; {RATE:g} a second: {LEVEL / RATE:.0f} s to level',
    ]
    return rows


if __name__ == '__main__':
    for row in report():
        print(row)
    bad = wrong()
    for b in bad:
        print('WRONG', b)
    print('the mechanism holds' if not bad else f'{len(bad)} things do not hold')
    raise SystemExit(1 if bad else 0)
