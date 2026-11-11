"""
The Chisum's lines: her hull form, as numbers.

She is 68.4 m long over all, 13.6 m in beam, 5.0 m deep to the car deck and draws 3.2 m (ga.py, the general arrangement,
has her particulars; the owner, 11 November 2026: "I think the ship needs to be longer maybe 65-70 meters", then "Rebuild
the Chisum at 68 m"). This is a new form, not the first Chisum's stretched: a ship's bow with a raked stem and flared
sections under a visor, a long parallel body with a round bilge, and a flat run rising aft over two screws to a wide
transom that is just in the water. Nothing of it is taken from a drawing of any ship; the proportions are those the yard
recalls of small Japanese coastal ferries. The hydrostatics printed below are sums over these sections and nothing more.

Her shell has two parts, and every builder reads both from here:
  - the lower body, from the keel to the car deck's edge: a section is a curve from the centreline (psi = 0) to the deck
    edge (psi = pi/2), full amidships, V-shaped and hollow toward the stem;
  - the topsides, from the car deck's edge to the upper deck's (the passenger deck, 9.7 m above the keel): straight in
    section, upright amidships and aft, flared forward. Forward of where the stem passes the car deck they stand on the
    stem itself.

Frame, metres, as the viewer's: x to port, y up from the design waterline, z forward from amidships.
A shipyard position (metres from the transom, metres above the keel) is yard(z) and above_keel(y).

No Blender here: plain Python, so the lines can be read and tested anywhere.
"""
from math import sin, cos, acos, pi, sqrt, atan

LENGTH = 68.4
BEAM = 13.6
DEPTH = 5.0            # keel to the car deck at side, amidships
DRAFT = 3.2            # design
LPP = 63.0             # the after perpendicular at the rudder stocks (2.4 m from the transom), the forward one at 65.4 m
HALF = LENGTH / 2
HB = BEAM / 2
KEEL = -DRAFT          # the base line
CAR = DEPTH - DRAFT    # the car deck's plating
UPPER = 9.7 - DRAFT    # the upper deck (the passenger deck): the head of the topsides
MOORING = 7.7 - DRAFT  # the forecastle deck, inside the bow
BULWARK = 1.10         # bulwark height above the upper deck, where there is one (the open decks aft)
FRAME_SPACING = 0.6    # frame 0 at the transom, frame 114 at the stem head
FRAMES = int(round(LENGTH / FRAME_SPACING))


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


# ---- The profile: the keel line, the run aft and the stem.
# Aft the bottom rises from 21 m to 2.75 m above the keel over the screws (2.0 m in diameter, their tips 0.45 m under it)
# and a little more to the transom, whose foot is 0.3 m in the water. The slope is nowhere steeper than 13 degrees.
RUN_FROM, RUN_TOP, RUN_RISE, TRANSOM_RISE = 21.0, 2.5, 2.75, 0.15
# Forward the keel ends at 62.4 m in a forefoot of 2.4 m radius; the stem is straight from there, raked 25 degrees, through
# the forward perpendicular at the waterline (65.4 m) to the stem head at the upper deck (68.4 m).
FP = 65.4
STEM_RAKE = (LENGTH - FP) / (9.7 - DRAFT)          # metres forward for each metre up
FOREFOOT_R = 2.4
_THETA = atan(1 / STEM_RAKE)                       # the stem's angle from the keel line
_FOOT_H = FOREFOOT_R * (1 - cos(_THETA))           # where the forefoot's arc meets the straight stem: its height above the keel
_FOOT_END = FP - STEM_RAKE * (DRAFT - _FOOT_H)     # and how far from the transom
FOREFOOT = _FOOT_END - FOREFOOT_R * sin(_THETA)    # where the keel ends and the forefoot begins


def stem_yard(height):
    """How far from the transom the stem is at a height above the keel (on its straight part and its forefoot)."""
    if height >= _FOOT_H:
        return _FOOT_END + STEM_RAKE * (height - _FOOT_H)
    return FOREFOOT + sqrt(max(0.0, FOREFOOT_R ** 2 - (FOREFOOT_R - max(0.0, height)) ** 2))


STEM_AT_CAR = stem_yard(DEPTH)        # where the stem passes the car deck: the lower body ends here
BODY_END = Z(STEM_AT_CAR)
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
        y = KEEL + RUN_RISE * _smooth((RUN_FROM - yd) / (RUN_FROM - RUN_TOP))
        if yd < RUN_TOP:
            y += TRANSOM_RISE * (RUN_TOP - yd) / RUN_TOP
        return y
    return KEEL


def sheer(z):
    """She has no sheer: her decks are level from end to end."""
    return 0.0


def deck_edge(z):
    """The head of the lower body: the car deck's edge."""
    return CAR


# ---- The car deck's outline: parallel from 12 m to 42 m, drawn in 0.5 m to the transom, and forward to the stem.
_PAR_AFT, _PAR_FWD = 12.0, 42.0


def half_breadth(z):
    """Half-breadth at the car deck's edge."""
    yd = yard(z)
    if yd >= STEM_AT_CAR:
        return STEM_HALF
    if yd > _PAR_FWD:
        return max(STEM_HALF, HB * (1 - ((yd - _PAR_FWD) / (STEM_AT_CAR - _PAR_FWD)) ** 3))
    if yd < _PAR_AFT:
        return HB - 0.5 * ((_PAR_AFT - yd) / _PAR_AFT) ** 2
    return HB


# ---- The upper deck's outline: the same aft and amidships, fuller forward (she flares), to the stem head.
_UP_FWD = 44.0


def upper_breadth(z):
    """Half-breadth at the upper deck's edge (the passenger deck, and forward of it the bulwark's head)."""
    yd = yard(z)
    if yd >= LENGTH:
        return STEM_HALF
    if yd > _UP_FWD:
        return max(STEM_HALF, HB * (1 - ((yd - _UP_FWD) / (LENGTH - _UP_FWD)) ** 3.5))
    return half_breadth(z)


def fullness(z):
    """How full the section is: boxy amidships with a round bilge, rounder aft, a V at the stem."""
    yd = yard(z)
    if yd > 29.0:
        return max(1.0, 6.0 - 5.0 * _smooth((yd - 29.0) / (STEM_AT_CAR - 29.0)) ** 0.75)
    if yd < RUN_FROM:
        return 6.0 - 3.0 * ((RUN_FROM - yd) / RUN_FROM) ** 1.2
    return 6.0


def hollow(z):
    """
    How hollow the section is forward: 1 is none. Toward the stem the breadth at each height is raised to this power, which
    keeps the car deck wide over a fine waterline: the flare under her visor.
    """
    yd = yard(z)
    if yd > 31.0:
        return 1.0 + 1.8 * _smooth((yd - 31.0) / (STEM_AT_CAR - 31.0))
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
    """A point (x, y) on the lower body's section at z, from the keel plate's edge (psi = 0) to the car deck's edge. A
    negative psi gives the starboard side."""
    s, c = section_sc(z, psi)
    k, top, hb = min(keel_y(z), CAR), deck_edge(z), half_breadth(z)
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


def topside_foot(z):
    """Where the topsides begin at z: (half-breadth, height). The car deck's edge, or the stem forward of where it passes that deck."""
    if z >= BODY_END:
        return STEM_HALF, min(UPPER, keel_y(z))
    return half_breadth(z), CAR


def topside_x(y, z):
    """The moulded half-breadth of the topsides at a height y between their foot and the upper deck."""
    x0, y0 = topside_foot(z)
    if y <= y0:
        return x0
    x1 = upper_breadth(z)
    if y >= UPPER or UPPER - y0 < 1e-9:
        return x1
    return x0 + (x1 - x0) * (y - y0) / (UPPER - y0)


def topside_normal(z, d=1e-3):
    """The outward unit normal of the port topsides at z (they are straight in section, so it is one for the whole height)."""
    za, zb = max(-HALF, z - d), min(HALF, z + d)
    (xa0, ya0), (xb0, yb0) = topside_foot(za), topside_foot(zb)
    x0, y0 = topside_foot(z)
    x1 = upper_breadth(z)
    tu = (x1 - x0, UPPER - y0, 0.0)                               # up the section
    tv = (upper_breadth(zb) - upper_breadth(za), 0.0, zb - za)    # along her, at the upper deck
    if UPPER - y0 < 0.05:
        tu = (0.0, 1.0, 0.0)
    n = (tu[1] * tv[2] - tu[2] * tv[1], tu[2] * tv[0] - tu[0] * tv[2], tu[0] * tv[1] - tu[1] * tv[0])
    m = (n[0] ** 2 + n[1] ** 2 + n[2] ** 2) ** 0.5 or 1.0
    return (n[0] / m, n[1] / m, n[2] / m)


def hull_x(y, z):
    """The moulded half-breadth at a height y and a station z: the lower body below the car deck, the topsides above it."""
    if abs(z) > HALF:
        return 0.0
    if y >= CAR or z >= BODY_END:
        if y < topside_foot(z)[1]:
            return 0.0
        return topside_x(min(y, UPPER), z)
    if y < keel_y(z):
        return 0.0
    return section_psi(z, psi_at(y, z))[0]


def hull_y(x, z):
    """The height of the shell over (or under) a point x off the centreline; None outboard of the hull."""
    x = abs(x)
    if x <= STEM_HALF:
        return keel_y(z)
    if z >= BODY_END:
        x0, y0 = topside_foot(z)
        x1 = upper_breadth(z)
        if x >= x1:
            return None
        return y0 + (UPPER - y0) * (x - x0) / (x1 - x0)
    if x >= section_psi(z, pi / 2)[0]:
        x1 = upper_breadth(z)
        x0 = half_breadth(z)
        if x >= x1:
            return None
        return CAR + (UPPER - CAR) * (x - x0) / (x1 - x0)
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
    """The outward unit normal of a plate standing upright over the upper deck's edge."""
    slope = (upper_breadth(min(HALF, z + d)) - upper_breadth(max(-HALF, z - d))) / (min(HALF, z + d) - max(-HALF, z - d))
    m = (1 + slope * slope) ** 0.5
    return (1 / m, 0.0, -slope / m)


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


BEND = 2.0          # metres of girth that a turn of one radian counts for, when points are set round a section


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
    y, area = keel_y(z), 0.0
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
    'carDeck': DEPTH, 'upperDeck': above_keel(UPPER), 'bulwark': BULWARK,
}

if __name__ == '__main__':
    h = hydrostatics()
    v = h['volume']
    print(f"moulded volume to the design waterline: {v:.0f} m3, {v * 1.025:.0f} t in sea water")
    print(f"block coefficient on the length between perpendiculars: {v / (LPP * BEAM * DRAFT):.3f}")
    print(f"midship section coefficient {h['midship'] / (BEAM * DRAFT):.3f}, waterplane coefficient {h['waterplane'] / (LPP * BEAM):.3f}")
    print(f"centre of buoyancy {h['lcb']:.2f} m from the transom ({(h['lcb'] - (2.4 + LPP / 2)) / LPP * 100:+.1f} % of her length from amidships)")
    print(f"the keel ends at {FOREFOOT:.2f} m, the stem passes the car deck at {STEM_AT_CAR:.2f} m")
    for yd in (0, 2.4, 3.8, 8, 12, 17, 34.2, 46, 52, 56, 60, 62, 64, 65.4, 66, 67, 68):
        z = Z(yd)
        print(f"yard {yd:5.1f}: keel {above_keel(keel_y(z)):.2f} m, car deck {half_breadth(z):.2f} m, upper deck {upper_breadth(z):.2f} m, "
              f"at the waterline {hull_x(0.0, z):.2f} m, at 1.4 m {hull_x(Y(1.4), z):.2f} m")
