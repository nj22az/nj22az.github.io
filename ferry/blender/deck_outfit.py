"""
Her decks' outfit that is the yard's own steel and paint: the lanes and walkways painted on her decks, the helicopter
deck's marks, the hawse pipes and chain pipes of her anchor gear, the foremast with its lights and stays.

The fittings that stand on her decks (lifeboats and davits, windlasses, winches, bitts, chocks, ventilators and the rest)
are not here: they come from the yard's library of deck fittings, and spec.OUTFIT gives each its place. What is here is
what those places need of her own structure (a pipe for each anchor's chain to come up and go down by) and what makes her
weather deck read as a working deck: where a trailer stands, where a man walks, where a helicopter lands.

Paint is a `Marking`: flat faces 2 mm over the plating, drawn by the page a hair in front of it (JSY-STD-403, rule 4).
"""
from math import atan2, cos, hypot, pi, sin

import ga
import lines as L
import spec as S
import steel
from shipyard import Part, srgb, tint

Z = L.Z
LIFT = 0.002
WHITE, YELLOW = srgb(0xeeece4), srgb(0xd9a92c)
GREY, DARK, BLACK = srgb(0xcfd2cc), srgb(0x2a3133), srgb(0x16191a)
BRONZE = srgb(0xa8792f)
_parts = {}


def part(group, name, look, **more):
    key = (group, name, look)
    if key not in _parts:
        p = Part(name, look, **more)
        p.group = group
        _parts[key] = p
    return _parts[key]


# =====================================================================================================================
# Paint
# =====================================================================================================================
def _strip(p, x0, x1, a, b, y, colour, piece=6.0):
    """A painted strip on a level deck, from yard a to b: in lengths of `piece`, so no face is longer than a plate."""
    n = max(1, int(round((b - a) / piece)))
    for i in range(n):
        ya, yb = a + (b - a) * i / n, a + (b - a) * (i + 1) / n
        start = len(p.f)
        p.polygon([(x0, y + LIFT, Z(ya)), (x1, y + LIFT, Z(ya)), (x1, y + LIFT, Z(yb)), (x0, y + LIFT, Z(yb))], colour)
        p.orient(start, (0, 1, 0))


def _ring(p, cx, yard, r0, r1, y, colour, n=64):
    """A painted ring on a level deck."""
    for k in range(n):
        a0, a1 = 2 * pi * k / n, 2 * pi * (k + 1) / n
        start = len(p.f)
        p.polygon([(cx + r * cos(a), y + LIFT, Z(yard) + r * sin(a)) for r, a in ((r0, a0), (r1, a0), (r1, a1), (r0, a1))], colour)
        p.orient(start, (0, 1, 0))


def markings():
    """The lanes, the walkways and the helicopter deck's marks."""
    M = S.DECK_MARKS
    w = M['line'] / 2
    # ---- the main deck: a white line along each lane's edge, from abaft the first trailer to where she narrows. The
    # starboard outer one begins forward of the fixed ramp; the two middle ones run on over the cargo lift's platform.
    main = part('main', 'Main deck, lane lines', 'Marking')
    for x, a, b in M['main']:
        _strip(main, x - w, x + w, a, b, S.MAIN_DECK, WHITE)
    # ---- the upper deck: the lanes, and a walkway each side between two yellow lines, outboard of the lanes and inboard of
    # the ventilators at the bulwark (her crew walk forward and aft clear of the trailers)
    upper = part('upper', 'Upper deck, lane lines', 'Marking')
    for x, a, b in M['upper']:
        _strip(upper, x - w, x + w, a, b, S.UPPER_DECK, WHITE)
    walk = part('upper', 'Upper deck, walkway lines', 'Marking')
    for x, a, b in M['walkway']:
        _strip(walk, x - w, x + w, a, b, S.UPPER_DECK, YELLOW)
    # ---- the helicopter deck: a white line round its edge, a yellow circle to set down in, and the H
    heli = part('upper', 'Helicopter deck, marks', 'Marking')
    H = M['helideck']
    y, c = S.HELIDECK, ga.HELIDECK['yard']
    outer, inner = steel.helideck_outline(H['edge']), steel.helideck_outline(H['edge'] + H['edge_line'])
    for k in range(8):
        j = (k + 1) % 8
        start = len(heli.f)
        heli.polygon([(outer[k][0], y + LIFT, Z(outer[k][1])), (outer[j][0], y + LIFT, Z(outer[j][1])), (inner[j][0], y + LIFT, Z(inner[j][1])), (inner[k][0], y + LIFT, Z(inner[k][1]))], WHITE)
        heli.orient(start, (0, 1, 0))
    _ring(heli, 0.0, c, H['circle'] - H['circle_line'], H['circle'], y, YELLOW)
    hw, hh, s = H['h'][0] / 2, H['h'][1] / 2, H['h'][2]
    for x0, x1, a, b in ((-hw, -hw + s, c - hh, c + hh), (hw - s, hw, c - hh, c + hh), (-hw + s, hw - s, c - s / 2, c + s / 2)):
        _strip(heli, x0, x1, a, b, y, WHITE)
    return [main, upper, walk, heli]


# =====================================================================================================================
# The anchor gear's pipes
# =====================================================================================================================
def _unit(v):
    n = hypot(hypot(v[0], v[1]), v[2])
    return (v[0] / n, v[1] / n, v[2] / n)


def anchor_pipes():
    """Each anchor's hawse pipe, from its mouth on the flare of the bow up through the forecastle deck, with a bolster where
    it comes out on deck; and the chain pipe from under the windlass down and inboard through the fore store to the main
    deck, where the chain locker is under it. (The windlass, the stopper and the chain are the library's.)"""
    pipes = part('main', 'Hawse pipes and chain pipes', 'Machinery paint', smooth=True, angle=40)
    deck = part('upper', 'Hawse pipes, deck bolsters', 'Machinery paint', smooth=True, angle=40)
    dark = part('upper', 'Hawse pipes, mouths on deck', 'Marking')
    H, C = S.HAWSE, S.CHAIN_PIPE
    for sgn in (1, -1):
        # the hawse pipe: from 0.25 m inside her plating at the anchor's mouth to 0.16 m over the forecastle deck
        z0 = Z(S.ANCHOR['yard'])
        y0 = L.Y(S.ANCHOR['height'])
        foot = (sgn * L.topside_x(y0, z0), y0, z0)
        zd = Z(H['deck_yard'])
        on_deck = (sgn * H['deck_x'], L.deck_y(zd), zd)
        u = _unit(tuple(on_deck[i] - foot[i] for i in range(3)))
        r = H['bore'] / 2 + 0.02
        a = tuple(foot[i] + u[i] * 0.25 for i in range(3))
        b = tuple(on_deck[i] + u[i] * 0.16 for i in range(3))
        under = tuple(on_deck[i] - u[i] * 0.05 for i in range(3))
        pipes.tube(a, under, r, colour=GREY, sides=20)
        deck.tube(under, b, r, colour=GREY, sides=20)
        # its bolster: a heavy ring round it where it comes out, lying on the deck
        deck.tube((on_deck[0], on_deck[1], on_deck[2]), (on_deck[0], on_deck[1] + 0.07, on_deck[2]), r + 0.16, colour=tint(GREY, 0.9), sides=24)
        start = len(dark.f)
        m = tuple(b[i] + u[i] * 0.002 for i in range(3))
        # two directions square to the pipe, to draw its dark bore's disc on its end
        side = _unit((u[1], -u[0], 0.0))
        up = (u[1] * side[2] - u[2] * side[1], u[2] * side[0] - u[0] * side[2], u[0] * side[1] - u[1] * side[0])
        dark.polygon([tuple(m[i] + (side[i] * cos(2 * pi * k / 20) + up[i] * sin(2 * pi * k / 20)) * H['bore'] / 2 for i in range(3)) for k in range(20)], BLACK)
        dark.orient(start, u)
        # the chain pipe: from 0.10 m over the forecastle deck (the windlass stands over it) to the main deck
        zc = Z(C['yard'])
        top = (sgn * C['x'], L.deck_y(zc) + 0.10, zc)
        low = (sgn * C['foot_x'], S.MAIN_DECK - 0.02, zc)
        rc = C['bore'] / 2 + 0.015
        just_under = tuple(top[i] + (low[i] - top[i]) * 0.15 / hypot(top[0] - low[0], top[1] - low[1]) for i in range(3))
        pipes.tube(just_under, low, rc, colour=GREY, sides=18)
        deck.tube(just_under, top, rc, colour=GREY, sides=18)
        deck.tube((top[0], L.deck_y(zc), zc), (top[0], L.deck_y(zc) + 0.05, zc), rc + 0.10, colour=tint(GREY, 0.9), sides=20)
        # a flange where it goes through the main deck into the chain locker
        pipes.tube((low[0], S.MAIN_DECK, zc), (low[0], S.MAIN_DECK + 0.03, zc), rc + 0.09, colour=tint(GREY, 0.85), sides=20)
    return [pipes, deck, dark]


# =====================================================================================================================
# The foremast
# =====================================================================================================================
def foremast():
    """The foremast on the forecastle, on her centre line (spec.FOREMAST): a tapered steel pole on a doubler with four
    knees, steps through it, the anchor light on its truck, the bell on a bracket, and three stays to eyes on
    the deck. Where the specification gives it a yard or a masthead light, those are drawn too (hers has neither: her
    forward masthead light is on the bridge's mast, as her pattern's is)."""
    F = S.FOREMAST
    z = Z(F['yard'])
    y0 = L.deck_y(z)
    top = y0 + F['height']
    mast = part('upper', 'Foremast', 'Topside paint', smooth=True, angle=40)
    fit = part('upper', 'Foremast, fittings', 'Machinery paint', smooth=True, angle=40)
    lens = part('upper', 'Foremast, light glasses', 'Lens', smooth=True, angle=50)
    wire = part('upper', 'Foremast, stays', 'Shaft steel', smooth=True, angle=40)
    bell = part('upper', "Ship's bell", 'Bronze', smooth=True, angle=50)
    white = srgb(S.WHITE)
    r0, r1 = F['foot_d'] / 2, F['head_d'] / 2
    radius = lambda h: r0 + (r1 - r0) * h / F['height']
    mast.tube((0.0, y0 + 0.02, z), (0.0, top, z), r0, r1, colour=white, sides=20)
    mast.box((-0.55, y0, z - 0.55), (0.55, y0 + 0.02, z + 0.55), tint(white, 0.9))                 # its doubler on the deck
    for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1)):                                               # four knees
        start = len(mast.f)
        t = 0.008
        a, b, c = (dx * (r0 - 0.01), dz * (r0 - 0.01)), (dx * 0.52, dz * 0.52), (dx * (r0 - 0.01), dz * (r0 - 0.01))
        px, pz = -dz * t, dx * t                                                                    # the knee's thickness, square to it
        tri = lambda s: [(a[0] + s * px, y0 + 0.02, z + a[1] + s * pz), (b[0] + s * px, y0 + 0.02, z + b[1] + s * pz), (c[0] + s * px, y0 + 0.50, z + c[1] + s * pz)]
        mast.polygon(tri(1), tint(white, 0.95))
        mast.orient(start, (px, 0, pz))
        start = len(mast.f)
        mast.polygon(tri(-1), tint(white, 0.95))
        mast.orient(start, (-px, 0, -pz))
        start = len(mast.f)
        mast.grid([[tri(1)[1], tri(1)[2]], [tri(-1)[1], tri(-1)[2]]], tint(white, 0.9))
        mast.orient(start, (dx, 0.5, dz))
    # its steps, from 0.6 m to a metre under its truck: a bar through the pole every 0.3 m, standing out 0.12 m and more
    # each side (a staple on its after side would not reach the pole where it has tapered: found by afloat.py)
    h = 0.6
    while h < F['height'] - 1.0:
        reach = radius(h) + 0.12
        fit.rod([(-reach, y0 + h, z), (reach, y0 + h, z)], 0.011, DARK)
        h += 0.30
    # the yard for the signal halyards, with a block at each arm
    hy = F.get('yard_at')
    if hy:
      fit.tube((-F['yard_half'], y0 + hy, z - radius(hy) - 0.04), (F['yard_half'], y0 + hy, z - radius(hy) - 0.04), 0.035, colour=white, sides=12)
      fit.box((-0.06, y0 + hy - 0.05, z - radius(hy) - 0.08), (0.06, y0 + hy + 0.05, z - radius(hy) + 0.02), tint(white, 0.9))
      for sx in (-1, 1):
        fit.tube((sx * (F['yard_half'] - 0.1), y0 + hy - 0.035, z - radius(hy) - 0.04), (sx * (F['yard_half'] - 0.1), y0 + hy - 0.14, z - radius(hy) - 0.04), 0.03, colour=DARK, sides=10)
    # the forward masthead light: a lantern on a bracket before the mast, a screen behind it (it shows from right ahead to
    # 22.5 degrees abaft each beam: COLREG rule 21, as the yard recalls it)
    hl = F.get('masthead')
    if hl:
        rm = radius(hl)
        fit.box((-0.05, y0 + hl - 0.06, z + rm - 0.01), (0.05, y0 + hl - 0.02, z + rm + 0.34), DARK)
        fit.tube((0.0, y0 + hl - 0.02, z + rm + 0.24), (0.0, y0 + hl + 0.03, z + rm + 0.24), 0.085, colour=DARK, sides=18)
        lens.tube((0.0, y0 + hl + 0.03, z + rm + 0.24), (0.0, y0 + hl + 0.21, z + rm + 0.24), 0.075, colour=srgb(0xf6f1e2), sides=18)
        fit.tube((0.0, y0 + hl + 0.21, z + rm + 0.24), (0.0, y0 + hl + 0.25, z + rm + 0.24), 0.088, colour=DARK, sides=18)
        fit.box((-0.14, y0 + hl - 0.02, z + rm + 0.10), (0.14, y0 + hl + 0.27, z + rm + 0.115), BLACK)
    # the anchor light on its truck: an all-round white light
    fit.tube((0.0, top, z), (0.0, top + 0.05, z), r1 + 0.03, colour=DARK, sides=18)
    lens.tube((0.0, top + 0.05, z), (0.0, top + 0.22, z), 0.07, colour=srgb(0xf6f1e2), sides=18)
    fit.tube((0.0, top + 0.22, z), (0.0, top + 0.26, z), 0.082, colour=DARK, sides=18)
    # the bell, on a bracket on its after side at 1.75 m: mouth down, its lanyard hanging
    hb = F['bell']
    rb = radius(hb)
    fit.box((-0.02, y0 + hb, z - rb - 0.30), (0.02, y0 + hb + 0.04, z - rb + 0.01), DARK)
    fit.tube((0.0, y0 + hb - 0.05, z - rb - 0.24), (0.0, y0 + hb, z - rb - 0.24), 0.012, colour=DARK, sides=8)
    bell.tube((0.0, y0 + hb - 0.09, z - rb - 0.24), (0.0, y0 + hb - 0.05, z - rb - 0.24), 0.07, 0.04, colour=BRONZE, sides=20)
    bell.tube((0.0, y0 + hb - 0.27, z - rb - 0.24), (0.0, y0 + hb - 0.09, z - rb - 0.24), 0.15, 0.07, colour=BRONZE, sides=20)
    wire.rod([(0.0, y0 + hb - 0.24, z - rb - 0.24), (0.0, y0 + hb - 0.46, z - rb - 0.24)], 0.006, DARK)
    # the stays: from a band on the mast to eye plates on the deck, one each side led aft and one right ahead
    hs = F['stays_at']
    rs = radius(hs)
    fit.tube((0.0, y0 + hs - 0.04, z), (0.0, y0 + hs + 0.04, z), rs + 0.012, colour=DARK, sides=20)
    for fx, fyard in F['stay_feet']:
        fz = Z(fyard)
        fy = L.deck_y(fz)
        d = _unit((fx, 0.0, fz - z)) if (fx or fz - z) else (0.0, 0.0, 1.0)
        head = (d[0] * (rs + 0.012), y0 + hs, z + d[2] * (rs + 0.012))
        fit.box((fx - 0.06, fy, fz - 0.06), (fx + 0.06, fy + 0.015, fz + 0.06), DARK)
        fit.box((fx - 0.012, fy + 0.015, fz - 0.04), (fx + 0.012, fy + 0.09, fz + 0.04), DARK)
        wire.rod([head, (fx, fy + 0.07, fz)], 0.008, tint(GREY, 0.8))
    return [mast, fit, lens, wire, bell]


def build():
    return markings() + anchor_pipes() + foremast()
