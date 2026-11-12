"""
The Chisum's lines: her hull form, as numbers.

She is a ro-ro freight ferry of 124.8 m (ga.py, revision D, has her particulars and says why): 19.6 m in beam, 6.6 m deep
to the main (trailer) deck and 13.2 m to the upper (weather) deck, drawing 5.6 m. Her pattern is the Mashala class of 1977
(Rickmers Werft; 116.30 x 17.40 m, 5.70 m and 12.20 m deep), stretched and widened toward the Bison class (125.0 x 19.05 m);
`ferry/yard/reference/roro-freight-ships.md` has both. The pattern's own lines were not seen: only its profile and deck
outlines on a general arrangement at 1:200. So this is a form of the yard's own that answers that profile and those
outlines, and nothing of it is traced:

  - a transom stern that sits about 1.1 m in the water, as the pattern's does, over a flat run that rises from 0.37 of her
    length to clear two screws of 3.0 m, its sections rounder toward the transom;
  - a parallel middle body with a round bilge (her main deck's edge is parallel from 18 m to 72 m from the transom);
  - a fine entrance under a stem raked 33 degrees, the sections V-shaped and hollow toward it: the waterline's half angle
    is 15 to 19 degrees;
  - a bulbous bow: a body of its own, 3.5 m broad and 4.8 m deep, that stands out 2.6 m beyond the forward perpendicular
    under the water and runs back into the forefoot;
  - topsides that are straight in section from the main deck's edge (the knuckle, where her rubbing strake lies) to the
    rail: upright amidships and aft, flared forward, and the flare is carried on into the forecastle's bulwark;
  - sheer forward: the upper deck's edge rises 1.5 m from the front of the house to the stem head.

**One departure from the design basis, and why.** The basis asks for the sheer over the forward quarter of her length
(from 93.6 m). Her house stands on the upper deck from 80 to 104 m and its decks are level, so the sheer begins at the
house's front (104 m, 0.17 of her length from the stem) and is a little steeper for it.

Her shell has three parts, and every builder reads all of them from here:
  - the lower body, from the keel to the main deck's edge: a section is a curve from the centreline (psi = 0) to the deck
    edge (psi = pi/2), full amidships, V-shaped and hollow toward the stem;
  - the topsides, from the main deck's edge to the rail: straight in section. Forward of where the stem passes the main
    deck they stand on the stem itself. The upper deck's edge is a point on that straight line;
  - the bulb: an ellipsoid-like body about a level axis 2.55 m above the keel. Where it is broader than the lower body it
    is her shell (hull_x gives the broader of the two); hull_shell.py draws it as a sheet of its own and leaves out of
    each sheet what lies inside the other.

Frame, metres, as the viewer's: x to port, y up from the design waterline, z forward from amidships.
A shipyard position (metres from the transom, metres above the keel) is yard(z) and above_keel(y).

No Blender here: plain Python, so the lines can be read and tested anywhere.
"""
from math import sin, cos, acos, pi, sqrt, atan

LENGTH = 124.8         # over all: 208 frame spaces of 0.6 m, frame 0 at the transom, the stem head at the rail
BEAM = 19.6
DEPTH = 6.6            # keel to the main (trailer) deck at side, amidships: the bulkhead deck
DEPTH_UPPER = 13.2     # keel to the upper (weather) deck at side, amidships
DRAFT = 5.6            # design
LPP = 114.0            # the after perpendicular at the rudder stocks (4.2 m from the transom), the forward one at 118.2 m
AP = 4.2
FP = AP + LPP
HALF = LENGTH / 2
HB = BEAM / 2
KEEL = -DRAFT          # the base line
MAIN = DEPTH - DRAFT   # the main deck's plating: the head of the lower body
CAR = MAIN             # (the builders' older name for the vehicle deck, kept where they read it)
UPPER = DEPTH_UPPER - DRAFT        # the upper deck, where it is level: from the transom to the house's front
BULWARK = 1.20         # the bulwark's height above the upper deck's edge, where there is one
FRAME_SPACING = 0.6    # frame 0 at the transom, frame 208 at the stem head
FRAMES = int(round(LENGTH / FRAME_SPACING))
SHEER_FROM = 104.0     # where the sheer begins: the front of the house (ga.py)
SHEER = 1.5            # how much the upper deck's edge has risen at the stem head


def Z(yard):
    """Metres from the transom → the model's z."""
    return yard - HALF


def Y(above_keel):
    """Metres above the keel → the model's y."""
    return above_keel - DRAFT


def yard(z):
    return z + HALF


def above_keel(y):
    return y + DRAFT


def _smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


# ---- The sheer: the upper deck is level as far as the house's front and rises from there to the stem head.
def sheer(z):
    """How much the upper deck's edge stands over its level part at z."""
    yd = yard(z)
    if yd <= SHEER_FROM:
        return 0.0
    return SHEER * ((min(yd, LENGTH) - SHEER_FROM) / (LENGTH - SHEER_FROM)) ** 2


def deck_y(z):
    """The upper deck's height at z (the forecastle rises with the sheer)."""
    return UPPER + sheer(z)


def rail_y(z):
    """The head of the side plating where it is carried up as a bulwark: the rail."""
    return deck_y(z) + BULWARK


# ---- The profile: the keel line, the run aft and the stem.
# Aft the bottom rises from 46 m (0.37 of her length), gently at first, to 3.75 m above the keel at 6 m from the transom,
# and 0.75 m more to the transom, whose foot is 1.1 m in the water (the pattern's is about 1.1 m: read off its profile).
# Over the screws (8 m from the transom, 3.0 m in diameter, their tips 0.2 m over the base line) it is 3.68 m above the
# keel: 0.48 m clear of the tips. Under the engines' seatings (25 m and forward) it is no more than 1.06 m above the keel,
# so the tank top can lie at 1.6 m from there. The slope is nowhere steeper than 12 degrees.
RUN_FROM, RUN_TOP, RUN_RISE, TRANSOM_RISE, RUN_WARP = 46.0, 6.0, 3.75, 0.75, 1.6
# Forward the keel ends in a forefoot of 3.0 m radius; the stem is straight from there, raked 32.7 degrees, through the
# forward perpendicular at the waterline to the stem head at the rail (124.8 m, 15.9 m above the keel). Under the water
# the bulb stands before it.
STEM_HEAD = DEPTH_UPPER + SHEER + BULWARK          # above the keel
STEM_RAKE = (LENGTH - FP) / (STEM_HEAD - DRAFT)    # metres forward for each metre up
FOREFOOT_R = 3.0
_THETA = atan(1 / STEM_RAKE)                       # the stem's angle from the keel line
_FOOT_H = FOREFOOT_R * (1 - cos(_THETA))           # where the forefoot's arc meets the straight stem: its height above the keel
_FOOT_END = FP - STEM_RAKE * (DRAFT - _FOOT_H)     # and how far from the transom
FOREFOOT = _FOOT_END - FOREFOOT_R * sin(_THETA)    # where the keel ends and the forefoot begins


def stem_yard(height):
    """How far from the transom the stem is at a height above the keel (on its straight part and its forefoot)."""
    if height >= _FOOT_H:
        return _FOOT_END + STEM_RAKE * (height - _FOOT_H)
    return FOREFOOT + sqrt(max(0.0, FOREFOOT_R ** 2 - (FOREFOOT_R - max(0.0, height)) ** 2))


STEM_AT_MAIN = stem_yard(DEPTH)       # where the stem passes the main deck: the lower body ends here
STEM_AT_CAR = STEM_AT_MAIN
BODY_END = Z(STEM_AT_MAIN)
# The plating of the two sides does not meet in a knife's edge: it lands on a keel plate and, up the stem, on the stem bar.
# Half their breadth: no section is narrower than this at any height.
STEM_HALF = 0.09


def keel_y(z):
    """The profile on the centreline: the keel, the run rising aft to the transom, the forefoot and the stem."""
    yd = yard(z)
    if yd > FOREFOOT:
        if yd >= _FOOT_END:
            return KEEL + _FOOT_H + (yd - _FOOT_END) / STEM_RAKE
        return KEEL + FOREFOOT_R - sqrt(max(0.0, FOREFOOT_R ** 2 - (yd - FOREFOOT) ** 2))
    if yd < RUN_FROM:
        y = KEEL + RUN_RISE * _smooth(min(1.0, (RUN_FROM - yd) / (RUN_FROM - RUN_TOP)) ** RUN_WARP)
        if yd < RUN_TOP:
            y += TRANSOM_RISE * (RUN_TOP - yd) / RUN_TOP
        return y
    return KEEL


def deck_edge(z):
    """The head of the lower body: the main deck's edge."""
    return MAIN


# ---- The main deck's outline: parallel from 18 m to 72 m, drawn in 0.4 m to the transom, and forward to the stem.
_PAR_AFT, _PAR_FWD = 18.0, 72.0


def half_breadth(z):
    """Half-breadth at the main deck's edge: the knuckle."""
    yd = yard(z)
    if yd >= STEM_AT_MAIN:
        return STEM_HALF
    if yd > _PAR_FWD:
        return max(STEM_HALF, HB * (1 - ((yd - _PAR_FWD) / (STEM_AT_MAIN - _PAR_FWD)) ** 2.0))
    if yd < _PAR_AFT:
        return HB - 0.4 * ((_PAR_AFT - yd) / _PAR_AFT) ** 2
    return HB


# ---- The rail's outline: the main deck's aft and amidships (her sides are upright there); forward it keeps her full
# breadth to 96 m while the main deck narrows under it from 72 m (she flares), and from there closes to the stem head.
_RAIL_FWD = 96.0


def rail_breadth(z):
    """Half-breadth at the rail: the head of the topsides' straight section, 1.2 m over the upper deck's edge."""
    yd = yard(z)
    if yd >= LENGTH:
        return STEM_HALF
    if yd > _RAIL_FWD:
        return max(STEM_HALF, HB * (1 - ((yd - _RAIL_FWD) / (LENGTH - _RAIL_FWD)) ** 2.4))
    if yd < _PAR_AFT:
        return half_breadth(z)
    return HB


def fullness(z):
    """How full the section is: boxy amidships with a round bilge, rounder aft, a V at the stem."""
    yd = yard(z)
    if yd > 50.0:
        return max(1.0, 6.0 - 5.0 * _smooth((yd - 50.0) / (STEM_AT_MAIN - 50.0)) ** 0.8)
    if yd < RUN_FROM:
        return 6.0 - 4.0 * ((RUN_FROM - yd) / RUN_FROM) ** 0.8
    return 6.0


def hollow(z):
    """
    How hollow the section is forward: 1 is none. Toward the stem the breadth at each height is raised to this power, which
    keeps the main deck wide over a fine waterline: the flare under her forecastle.
    """
    yd = yard(z)
    if yd > 60.0:
        return 1.0 + 1.8 * _smooth((yd - 60.0) / (STEM_AT_MAIN - 60.0))
    return 1.0


def section_sc(z, psi):
    """
    The section's own shape, before it is scaled: s is the breadth (0 on the centreline, 1 at the deck edge) and c the
    depth below the deck edge (1 at the keel, 0 at the deck edge). psi runs evenly round the turn of the bilge, from 0 at
    the keel to pi/2 at the deck edge.
    """
    n = fullness(z)
    sn, cs = sin(psi), cos(psi)
    r = (abs(sn) ** n + abs(cs) ** n) ** (-1 / n)
    s, c = sn * r, abs(cs) * r
    p = hollow(z)
    if p != 1.0:
        s = (1 if s >= 0 else -1) * abs(s) ** p
    return s, c


def section_psi(z, psi):
    """A point (x, y) on the lower body's section at z, from the keel plate's edge (psi = 0) to the main deck's edge. A
    negative psi gives the starboard side."""
    s, c = section_sc(z, psi)
    k, top, hb = min(keel_y(z), MAIN), deck_edge(z), half_breadth(z)
    w = STEM_HALF if s >= 0 else -STEM_HALF
    return w + (hb - STEM_HALF) * s, k + (top - k) * (1 - c)


def psi_at(y, z):
    """The section's psi at a height y."""
    a, b = 0.0, pi / 2
    for _ in range(50):
        m = (a + b) / 2
        if section_psi(z, m)[1] < y:
            a = m
        else:
            b = m
    return (a + b) / 2


def psi_at_x(x, z):
    """The section's psi at a half-breadth x (0 when x is on the centreline, pi/2 at or beyond the deck edge)."""
    a, b = 0.0, pi / 2
    for _ in range(50):
        m = (a + b) / 2
        if section_psi(z, m)[0] < x:
            a = m
        else:
            b = m
    return (a + b) / 2


# ---- The topsides: straight in section from their foot to the rail.
def topside_foot(z):
    """Where the topsides begin at z: (half-breadth, height). The main deck's edge, or the stem forward of where it passes that deck."""
    if z >= BODY_END:
        return STEM_HALF, min(rail_y(z), keel_y(z))
    return half_breadth(z), MAIN


def topside_x(y, z):
    """The moulded half-breadth of the topsides at a height y between their foot and the rail."""
    x0, y0 = topside_foot(z)
    if y <= y0:
        return x0
    x1, y1 = rail_breadth(z), rail_y(z)
    if y >= y1 or y1 - y0 < 1e-9:
        return x1
    return x0 + (x1 - x0) * (y - y0) / (y1 - y0)


def upper_breadth(z):
    """Half-breadth at the upper deck's edge: where the topsides' straight section passes the deck."""
    return topside_x(deck_y(z), z)


def deck_end():
    """How far from the transom the upper deck reaches: where the stem passes it."""
    a, b = SHEER_FROM, LENGTH
    for _ in range(50):
        m = (a + b) / 2
        if keel_y(Z(m)) < deck_y(Z(m)):
            a = m
        else:
            b = m
    return a


def topside_normal(z, d=1e-3):
    """The outward unit normal of the port topsides at z (they are straight in section, so it is one for the whole height)."""
    za, zb = max(-HALF, z - d), min(HALF, z + d)
    x0, y0 = topside_foot(z)
    x1, y1 = rail_breadth(z), rail_y(z)
    tu = (x1 - x0, y1 - y0, 0.0)                                  # up the section
    tv = (rail_breadth(zb) - rail_breadth(za), rail_y(zb) - rail_y(za), zb - za)    # along her, at the rail
    if y1 - y0 < 0.05:
        tu = (0.0, 1.0, 0.0)
    n = (tu[1] * tv[2] - tu[2] * tv[1], tu[2] * tv[0] - tu[0] * tv[2], tu[0] * tv[1] - tu[1] * tv[0])
    m = (n[0] ** 2 + n[1] ** 2 + n[2] ** 2) ** 0.5 or 1.0
    return (n[0] / m, n[1] / m, n[2] / m)


# ---- The bulb. A body about a level axis: elliptical in section, an elliptical nose forward of its greatest section and a
# tail aft of it that dies into the forefoot. Its greatest section is 3.5 m broad (0.18 of her beam) and 4.8 m deep,
# from 0.15 m over the base line to 0.65 m under the waterline; its nose is 2.6 m beyond the forward perpendicular.
BULB = dict(yard=116.3, nose=4.5, tail=5.6, half=1.75, rise=2.40, axis=2.55)      # `axis`: above the keel. Its tail ends in the fore peak, before the collision bulkhead
BULB_NOSE, BULB_TAIL = BULB['yard'] + BULB['nose'], BULB['yard'] - BULB['tail']


def bulb_scale(z):
    """How large the bulb's section is at z, as a share of its greatest: 0 beyond its nose and abaft its tail."""
    d = yard(z) - BULB['yard']
    t = d / BULB['nose'] if d >= 0 else -d / BULB['tail']
    return sqrt(1 - t * t) if t < 1 else 0.0


def bulb_x(y, z):
    """The bulb's half-breadth at a height y and a station z (0 outside it)."""
    k = bulb_scale(z)
    if k <= 0:
        return 0.0
    v = (y - Y(BULB['axis'])) / (BULB['rise'] * k)
    return BULB['half'] * k * sqrt(1 - v * v) if abs(v) < 1 else 0.0


def bulb_point(z, phi):
    """A point (x, y) on the port half of the bulb's section at z: phi 0 at its foot, pi at its crown."""
    k = bulb_scale(z)
    return BULB['half'] * k * sin(phi), Y(BULB['axis']) - BULB['rise'] * k * cos(phi)


def bulb_normal(z, phi):
    """The outward unit normal of the port half of the bulb at (z, phi)."""
    k = max(bulb_scale(z), 1e-4)
    d = yard(z) - BULB['yard']
    a = BULB['nose'] if d >= 0 else BULB['tail']
    # the body is x²/(half k)² + (y - axis)²/(rise k)² = 1 with k² = 1 - d²/a²: its gradient
    x, y = BULB['half'] * k * sin(phi), -BULB['rise'] * k * cos(phi)
    n = (x / BULB['half'] ** 2, y / BULB['rise'] ** 2, d / a ** 2)
    m = (n[0] ** 2 + n[1] ** 2 + n[2] ** 2) ** 0.5 or 1.0
    return (n[0] / m, n[1] / m, n[2] / m)


def main_x(y, z):
    """The moulded half-breadth of the hull without her bulb at a height y and a station z."""
    if abs(z) > HALF:
        return 0.0
    if y >= MAIN or z >= BODY_END:
        if y < topside_foot(z)[1] or y > rail_y(z) + 1e-9:
            return 0.0 if y < topside_foot(z)[1] else rail_breadth(z)
        return topside_x(y, z)
    if y < keel_y(z):
        return 0.0
    return section_psi(z, psi_at(y, z))[0]


def hull_x(y, z):
    """The moulded half-breadth at a height y and a station z: the lower body below the main deck, the topsides above it,
    or the bulb where that is the broader."""
    return max(main_x(y, z), bulb_x(y, z))


def hull_y(x, z):
    """The height of the shell over (or under) a point x off the centreline; None outboard of the hull. (Of the hull
    without her bulb: what is fitted under her stands abaft it.)"""
    x = abs(x)
    if x <= STEM_HALF:
        return keel_y(z)
    if z >= BODY_END:
        x0, y0 = topside_foot(z)
        x1, y1 = rail_breadth(z), rail_y(z)
        if x >= x1:
            return None
        return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    if x >= section_psi(z, pi / 2)[0]:
        x0 = half_breadth(z)
        x1, y1 = rail_breadth(z), rail_y(z)
        if x >= x1:
            return None
        return MAIN + (y1 - MAIN) * (x - x0) / (x1 - x0)
    return section_psi(z, psi_at_x(x, z))[1]


def shell_point(z, psi):
    """A point (x, y, z) on the port shell of the lower body."""
    x, y = section_psi(z, psi)
    return (x, y, z)


def shell_normal(z, psi, d=1e-4):
    """The outward unit normal of the port shell of the lower body at (z, psi)."""
    p0, p1 = max(0.0, psi - d), min(pi / 2, psi + d)
    x0, y0 = section_psi(z, p0)
    x1, y1 = section_psi(z, p1)
    za, zb = max(-HALF, z - d), min(BODY_END, z + d)
    xa, ya = section_psi(za, psi)
    xb, yb = section_psi(zb, psi)
    tu = (x1 - x0, y1 - y0, 0.0)                 # along the girth, keel to deck
    tv = (xb - xa, yb - ya, zb - za)             # along her length, toward the bow
    n = (tu[1] * tv[2] - tu[2] * tv[1], tu[2] * tv[0] - tu[0] * tv[2], tu[0] * tv[1] - tu[1] * tv[0])
    m = (n[0] ** 2 + n[1] ** 2 + n[2] ** 2) ** 0.5
    if m < 1e-12:
        return (1.0, 0.0, 0.0)
    return (n[0] / m, n[1] / m, n[2] / m)


def bulwark_normal(z, d=1e-4):
    """The outward unit normal of the bulwark at z: the topsides' own, for the bulwark is the topsides carried up."""
    return topside_normal(z)


def inside(z, psi, depth):
    """A point `depth` metres inside the port shell, square to it."""
    x, y = section_psi(z, psi)
    n = shell_normal(z, psi)
    return (x - n[0] * depth, y - n[1] * depth, z - n[2] * depth)


def inside_plane(z, psi, depth):
    """A point (x, y) `depth` metres inside the port shell, kept in the plane of the frame at z."""
    x, y = section_psi(z, psi)
    n = shell_normal(z, psi)
    m = (n[0] ** 2 + n[1] ** 2) ** 0.5 or 1.0
    return (x - n[0] / m * depth, y - n[1] / m * depth)


BEND = 4.0          # metres of girth that a turn of one radian counts for, when points are set round a section


def girth_psis(z, count, lo=0.0, hi=pi / 2, bend=BEND):
    """
    `count` + 1 values of psi from lo to hi, set round the section at z so that each step covers the same amount of
    girth and turning together: evenly along the flat of the bottom and the side, closer round the turn of the bilge.
    Plating drawn through them then keeps to her lines within a few millimetres however tight the turn.
    """
    if hi - lo < 1e-9:
        return [lo] * count + [hi]
    fine = 240
    ps = [lo + (hi - lo) * i / fine for i in range(fine + 1)]
    pts = [section_psi(z, p) for p in ps]
    seg = [(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) for i in range(fine)]
    run = [0.0]
    for i in range(fine):
        step = (seg[i][0] ** 2 + seg[i][1] ** 2) ** 0.5
        turn = 0.0
        if i > 0:
            a0, a1 = seg[i - 1], seg[i]
            la, lb = (a0[0] ** 2 + a0[1] ** 2) ** 0.5, step
            if la > 1e-12 and lb > 1e-12:
                c = max(-1.0, min(1.0, (a0[0] * a1[0] + a0[1] * a1[1]) / (la * lb)))
                turn = acos(c)
        run.append(run[-1] + step + bend * turn)
    if run[-1] < 1e-12:
        return [lo + (hi - lo) * i / count for i in range(count + 1)]
    out, j = [], 0
    for i in range(count + 1):
        want = run[-1] * i / count
        while j < fine - 1 and run[j + 1] < want:
            j += 1
        span = run[j + 1] - run[j]
        f = (want - run[j]) / span if span > 0 else 0.0
        out.append(ps[j] + (ps[j + 1] - ps[j]) * f)
    out[0], out[-1] = lo, hi
    return out


def section_area(z, draft_y=0.0, dy=0.02):
    """The area of the section at z under a waterline at y = draft_y, both sides."""
    y, area = min(keel_y(z), Y(BULB['axis']) - BULB['rise'] * bulb_scale(z)), 0.0
    while y < draft_y - 1e-9:
        step = min(dy, draft_y - y)
        area += 2 * hull_x(y + step / 2, z) * step
        y += step
    return area


def hydrostatics(draft_y=0.0, step=0.2):
    """Moulded volume (m³) under a waterline, its centre from the transom, the waterplane's area and the midship section's."""
    vol = moment = plane = 0.0
    z = -HALF
    while z < HALF - 1e-9:
        zm = z + step / 2
        a = section_area(zm, draft_y)
        vol += a * step
        moment += a * step * yard(zm)
        if keel_y(zm) < draft_y:
            plane += 2 * hull_x(draft_y - 1e-6, zm) * step
        z += step
    return dict(volume=vol, lcb=moment / vol if vol else 0.0, waterplane=plane, midship=section_area(0.0, draft_y))


def displacement(draft_y=0.0, step=0.2):
    """Moulded volume (m³) under a waterline at y = draft_y, by integrating the sections."""
    return hydrostatics(draft_y, step)['volume']


PARTICULARS = {
    'name': 'Chisum',
    'length': LENGTH, 'beam': BEAM, 'depth': DEPTH, 'draft': DRAFT, 'lpp': LPP,
    'frameSpacing': FRAME_SPACING,
    'mainDeck': DEPTH, 'upperDeck': DEPTH_UPPER, 'bulwark': BULWARK,
}

if __name__ == '__main__':
    h = hydrostatics()
    v = h['volume']
    print(f"moulded volume to the design waterline: {v:.0f} m3, {v * 1.025:.0f} t in sea water")
    print(f"block coefficient on the length between perpendiculars: {v / (LPP * BEAM * DRAFT):.3f}")
    print(f"midship section coefficient {h['midship'] / (BEAM * DRAFT):.3f}, waterplane coefficient {h['waterplane'] / (LPP * BEAM):.3f}")
    print(f"centre of buoyancy {h['lcb']:.2f} m from the transom ({(h['lcb'] - (AP + LPP / 2)) / LPP * 100:+.1f} % of her length from amidships)")
    print(f"the keel ends at {FOREFOOT:.2f} m, the stem passes the main deck at {STEM_AT_MAIN:.2f} m and the upper deck at {deck_end():.2f} m; rake {atan(STEM_RAKE) * 180 / pi:.1f} degrees")
    from math import degrees
    for a, b in ((100.0, 104.0), (106.0, 110.0), (110.0, 114.0), (114.0, 117.0)):
        print(f"  waterline's half angle between {a:.0f} and {b:.0f} m: {degrees(atan((hull_x(-1e-6, Z(a)) - hull_x(-1e-6, Z(b))) / (b - a))):.1f} degrees")
    for yd in (0, 4.2, 8, 12, 16.8, 25.2, 34, 62.4, 80, 88, 93.6, 96, 100.8, 104, 107, 110.4, 113, 116, 118.2, 120, 122, 124):
        z = Z(yd)
        print(f"yard {yd:6.1f}: keel {above_keel(keel_y(z)):.2f} m, main deck {half_breadth(z):.2f} m, upper deck {upper_breadth(z):.2f} m at {above_keel(deck_y(z)):.2f} m, "
              f"rail {rail_breadth(z):.2f} m, at the waterline {hull_x(-1e-6, z):.2f} m, at 4.0 m {hull_x(Y(4.0), z):.2f} m, at 1.6 m {hull_x(Y(1.6), z):.2f} m, section {section_area(z):.1f} m2")
