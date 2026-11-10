"""
The Christina's lines: her hull form, as numbers.

She is 34.5 m long, 8.4 m in beam, 4.0 m deep to the car deck and draws 1.9 m laden. The form is the one the Rev C
working drawings show (sheet JS-127-C1: profiles, plan and four body sections), so the decks drawn there still sit on
her: a long parallel body with a tight bilge, a spoon forefoot under a blunt bow that the ramp closes, and a counter
rising aft over two screws. The Town draws the same form in src/world/ferry-model.js (halfBreadth, keelY, sectionPoint);
build_hull.py checks this file against that hull, vertex by vertex, before it builds (check_against()).

Frame, metres, as the viewer's: x to port, y up from the laden waterline, z forward from amidships.
A shipyard position (metres from the transom, metres above the keel) is yard(z) and above_keel(y).

No Blender here: plain Python, so the lines can be read and tested anywhere.
"""
from math import sin, cos, acos, pi

LENGTH = 34.5
BEAM = 8.4
DEPTH = 4.0            # keel to the car deck at side, amidships
DRAFT = 1.9            # laden
HALF = LENGTH / 2
HB = BEAM / 2
KEEL = -DRAFT          # the base line
CAR = DEPTH - DRAFT    # the car deck's plating
BULWARK = 1.05         # bulwark height above the deck edge
FRAME_SPACING = 0.5    # frame 0 at the transom, frame 69 at the stem


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


def sheer(z):
    """The deck edge rises toward the bow, and a little toward the stern."""
    return (0.3 if z > 0 else 0.1) * (z / HALF) ** 2


def deck_edge(z):
    return CAR - 0.06 + sheer(z)


def bulwark_top(z):
    return deck_edge(z) + BULWARK


_FWD, _AFT = Z(28.5), Z(1.5)


def half_breadth(z):
    """Half-breadth at the deck: parallel for most of her length, drawn in a little at the bow and the transom."""
    if z > _FWD:
        return HB - 0.32 * ((z - _FWD) / (HALF - _FWD)) ** 2
    if z < _AFT:
        return HB - 0.12 * ((_AFT - z) / (HALF + _AFT)) ** 2
    return HB


_FOREFOOT, _COUNTER, _COUNTER_TOP = Z(25.5), Z(10.5), Z(4)


def keel_y(z):
    """The keel line: a spoon forefoot under the bow, and a counter rising aft over the screws."""
    if z > _FOREFOOT:
        return KEEL + 1.75 * ((z - _FOREFOOT) / (HALF - _FOREFOOT)) ** 2
    if z < _COUNTER:
        t = min(1.0, (_COUNTER - z) / (_COUNTER - _COUNTER_TOP))
        y = KEEL + 1.85 * t * t * (3 - 2 * t)
        if z < _COUNTER_TOP:
            y += 0.1 * ((_COUNTER_TOP - z) / (_COUNTER_TOP + HALF))
        return y
    return KEEL


def fullness(z):
    """How full the section is: boxy amidships (a small bilge radius), rounder at the ends."""
    if z > Z(24):
        return 7 - 4.2 * ((z - Z(24)) / (HALF - Z(24)))
    if z < Z(9):
        return 7 - 2.5 * ((Z(9) - z) / (Z(9) + HALF))
    return 7.0


def narrowing(z):
    return 0.12 * ((z - Z(26)) / (HALF - Z(26))) ** 2 if z > Z(26) else 0.0


def section_point(z, theta):
    """A point (x, y) on the section at z: theta from 0 (the keel, on the centreline) to pi/2 (the deck edge)."""
    n, k, top, hb = fullness(z), keel_y(z), deck_edge(z), half_breadth(z)
    sn, cs = max(0.0, sin(theta)), max(0.0, cos(theta))
    y = k + (top - k) * (1 - cs ** (2 / n))
    x = hb * sn ** (2 / n) * (1 - narrowing(z) * max(0.0, min(1.0, (top - y) / (top - k))))
    return x, y


def theta_at(y, z):
    """The section's parameter at a height y."""
    a, b = 0.0, pi / 2
    for _ in range(48):
        m = (a + b) / 2
        if section_point(z, m)[1] < y:
            a = m
        else:
            b = m
    return (a + b) / 2


def hull_x(y, z):
    """The moulded half-breadth at a height y and a station z."""
    if y >= deck_edge(z):
        return half_breadth(z)
    if y <= keel_y(z):
        return 0.0
    return section_point(z, theta_at(y, z))[0]


def section_sc(z, psi):
    """
    The section's own shape, before it is scaled: (s, c) with s^n + c^n = 1. s is the breadth (0 on the centreline, 1 at
    the side) and c the depth below the deck edge (1 at the keel, 0 at the deck edge). psi runs evenly round the turn
    of the bilge, from 0 at the keel to pi/2 at the deck edge, where theta crowds every point into the two ends.
    """
    n = fullness(z)
    sn, cs = sin(psi), cos(psi)
    r = (abs(sn) ** n + abs(cs) ** n) ** (-1 / n)
    return sn * r, abs(cs) * r


def section_psi(z, psi):
    """The same curve as section_point(), by psi. A negative psi gives the starboard side."""
    s, c = section_sc(z, psi)
    k, top, hb = keel_y(z), deck_edge(z), half_breadth(z)
    y = k + (top - k) * (1 - c)
    x = hb * s * (1 - narrowing(z) * max(0.0, min(1.0, (top - y) / (top - k))))
    return x, y


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


def hull_y(x, z):
    """The height of the shell over (or under) a point x off the centreline; None outboard of the hull."""
    x = abs(x)
    if x >= section_psi(z, pi / 2)[0]:
        return None
    return section_psi(z, psi_at_x(x, z))[1]


def shell_point(z, psi):
    """A point (x, y, z) on the port shell."""
    x, y = section_psi(z, psi)
    return (x, y, z)


def shell_normal(z, psi, d=1e-4):
    """The outward unit normal of the port shell at (z, psi)."""
    p0, p1 = max(-pi / 2, psi - d), min(pi / 2, psi + d)
    x0, y0 = section_psi(z, p0)
    x1, y1 = section_psi(z, p1)
    za, zb = max(-HALF, z - d), min(HALF, z + d)
    xa, ya = section_psi(za, psi)
    xb, yb = section_psi(zb, psi)
    tu = (x1 - x0, y1 - y0, 0.0)                 # along the girth, keel to deck
    tv = (xb - xa, yb - ya, zb - za)             # along her length, toward the bow
    n = (tu[1] * tv[2] - tu[2] * tv[1], tu[2] * tv[0] - tu[0] * tv[2], tu[0] * tv[1] - tu[1] * tv[0])
    m = (n[0] ** 2 + n[1] ** 2 + n[2] ** 2) ** 0.5 or 1.0
    return (n[0] / m, n[1] / m, n[2] / m)


def bulwark_normal(z, d=1e-4):
    """The outward unit normal of the port bulwark, which stands upright over the deck edge."""
    slope = (half_breadth(min(HALF, z + d)) - half_breadth(max(-HALF, z - d))) / (min(HALF, z + d) - max(-HALF, z - d))
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


def displacement(draft_y=0.0, step=0.05):
    """Moulded volume (m³) under a waterline at y = draft_y, by integrating the sections."""
    vol, z = 0.0, -HALF
    while z < HALF - 1e-9:
        zm = z + step / 2
        k = keel_y(zm)
        area, y = 0.0, k
        dy = 0.01
        while y < draft_y - 1e-9:
            area += 2 * hull_x(y + dy / 2, zm) * dy
            y += dy
        vol += area * step
        z += step
    return vol


PARTICULARS = {
    'name': 'Christina',
    'length': LENGTH, 'beam': BEAM, 'depth': DEPTH, 'draft': DRAFT,
    'frameSpacing': FRAME_SPACING,
    'carDeck': DEPTH, 'bulwark': BULWARK,
}

if __name__ == '__main__':
    v = displacement()
    print(f"moulded volume to the laden waterline: {v:.1f} m3, {v * 1.025:.1f} t in sea water")
    print(f"block coefficient on length overall: {v / (LENGTH * BEAM * DRAFT):.3f}")
    for yd in (0, 3, 11, 20.5, 31, 34.5):
        z = Z(yd)
        print(f"yard {yd:5.1f}: keel {above_keel(keel_y(z)):.2f} m, deck edge {above_keel(deck_edge(z)):.2f} m, "
              f"half-breadth {half_breadth(z):.3f} m, at the waterline {hull_x(0.0, z):.3f} m")
