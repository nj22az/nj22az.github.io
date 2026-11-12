"""
The chief engineer's day room: the desk, the chair, the maintenance computer and the calendar, built from cabin_place.py.

The owner, 12 November 2026: "Build a functional Maintenance PC and add it to the chief engineers cabin"; "It needs to have an
ui, we are not going to a website we are still on the chisum , accessing the maintenance program is on the computer"; "Use I
create api to make a calendar in the chief engineers office with cute manga ladies".

Drawn first: JS5-511 (yard/drawings/cabin_drawing.py), from the same numbers. Design record: yard/design/maintenance-computer.md.
Where things stand is the owner's own drawing's (blender/assets/ce-suite/: CE-SUITE-GA-001, MS-CE-001): cabin_place.py says how.

What is built. A desk along her side at the room's after end (a top on two end panels, a back panel, a pedestal of three
drawers with their handles); an office chair before it on a five-star base with castors; and the computer: a screen on its
stand, a keyboard with its keys, a mouse, the system unit on the deck under the desk, and their cables. On her side under the
desk, 0.30 m up, a twin socket and a data outlet; skirting trunking from them aft along her side and inboard along the after
wall to the place of the suite's distribution board DB-CE beside the door, which is marked and **not installed**: both
cables end in a box there and say so. On the after wall, a calendar.

The screen. While nobody sits at it, it shows the program's opening picture, built here as what it is (a lit sheet, bars of
colour, lettering), not as a picture laid on a surface. It gives its place no light (`Signal white`: a thing that is lit on
the page is not traced as a lamp). A tap on the computer opens the program itself on the page (`opens`: app.js).

The calendar's page is a picture (cabin_pictures.py makes it: `Cabin picture`, the model's second sheet).

How it is kept from flickering (JSY-STD-403) and fine (JSY-STD-404, rule 6): what stands on the deck or on the desk meets it
face to face; what is on a face (a plate, the screen's sheet, a drawer's front) is let 1 mm into it and stands 2 mm and more
proud; lettering is paint, 0.6 mm over what it is on; everything lettered or smaller than a finger is fine work.

Drawn in the ship's axes (lines.py): x to port, y up from the waterline, z forward from amidships.
"""
import json
import os
import sys
from math import cos, pi, sin

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'systems'))
import spec as S
import cabin_place as CP
import stern_gear as G
import steel
from shipyard import Part, srgb, tint, component

HERE = os.path.dirname(os.path.abspath(__file__))
FLOOR = S.OFFICERS_DECK - S.MAIN_DECK           # the officers' deck, as stern_gear measures heights: over the main deck
WOOD, WOOD_DARK, FABRIC = srgb(0x8a5a33), srgb(0x6f4526), srgb(0x27364a)
BLACK, DARK, GREY, LIGHT, WHITE, STEEL = srgb(0x1c2022), srgb(0x3a3f41), srgb(0x9aa3a6), srgb(0xd9dcdd), srgb(0xf4f6ff), srgb(S.STEEL)
BLUE, PALE, INK, YELLOW, IVORY = srgb(0x0017c1), srgb(0xd9e6ff), srgb(0x1a1a1c), srgb(0xe3b341), srgb(0xe9e4d6)
_parts = {}


def part(name, look, **kw):
    if name not in _parts:
        p = Part(name, look, **kw)
        p.group = CP.DECK
        _parts[name] = p
    return _parts[name]


# ---- Two walls, two ways of saying where: along her side (u from the transom, v out from the wall's face into the room), and
# along the after wall (x to port, w out from its face). Heights over the officers' deck.
def sq(u, v, h):
    return G.Q(CP.SIDE - v, u, FLOOR + h)


def aq(x, w, h):
    return G.Q(x, CP.AFT + w, FLOOR + h)


def sbox(p, u0, u1, v0, v1, h0, h1, colour, soft=True):
    G.box(p, CP.SIDE - v1, CP.SIDE - v0, u0, u1, FLOOR + h0, FLOOR + h1, colour, soft)


def abox(p, x0, x1, w0, w1, h0, h1, colour, soft=True):
    G.box(p, x0, x1, CP.AFT + w0, CP.AFT + w1, FLOOR + h0, FLOOR + h1, colour, soft)


def stube(p, a, b, r, colour, sides=12):
    p.tube(sq(*a), sq(*b), r, None, colour=colour, sides=sides, caps=(True, True))


def srod(p, pts, r, colour):
    p.rod([sq(*q) for q in pts], r, colour)


def swords(p, text, height, u, v, h, colour, room=None, what='a plate in the chief engineer\'s day room'):
    """Lettering on a face that looks inboard from her side: read by whoever faces her side, forward at their right hand."""
    if room is not None:
        G.fits(text, height, room, what)
    G.letter(p, text, height, sq(u, v, h), (0, 0, 1), (0, 1, 0), colour)


def awords(p, text, height, x, w, h, colour, room=None, what='a plate on the day room\'s after wall'):
    """Lettering on a face that looks forward from the after wall: read by whoever looks aft."""
    if room is not None:
        G.fits(text, height, room, what)
    G.letter(p, text, height, aq(x, w, h), (1, 0, 0), (0, 1, 0), colour)


def windows_as_built():
    """The room's windows as steel.py cuts them: nothing is placed by cabin_place's copy of them unless it is the same."""
    (x0, x1), (y0, y1) = CP.ROOM['x'], CP.ROOM['yard']
    side = tuple((round(a, 2), round(b, 2)) for a, b, _, _ in steel.side_windows(CP.DECK, 1) if a >= y0 and b <= y1)
    front = tuple((round(a, 2), round(b, 2)) for a, b, _, _ in steel.front_windows(CP.DECK) if a >= x0 and b <= x1)
    return side, front


def desk():
    d, dr = CP.DESK, CP.DRAWERS
    (u0, u1), (v0, v1), top, t, pn = d['u'], d['v'], d['top'], d['thick'], d['panel']
    wood = part('Chief engineer\'s desk', 'Varnished wood')
    dark = part('Chief engineer\'s desk, pedestal', 'Varnished wood')
    fit = part('Chief engineer\'s desk, handles', 'Stainless', smooth=True, angle=40)
    sbox(wood, u0, u1, v0, v1, top - t, top, WOOD)                                    # the top
    sbox(wood, u0, u0 + pn, v0 + 0.02, v1 - 0.02, 0.0, top - t, WOOD, soft=False)      # its two end panels, on the deck
    sbox(wood, u1 - pn, u1, v0 + 0.02, v1 - 0.02, 0.0, top - t, WOOD, soft=False)
    sbox(wood, u0 + pn, u1 - pn, v0 + 0.02, v0 + 0.04, d['back'], top - t, tint(WOOD, 0.92), soft=False)  # the back panel between them: the cables pass under it
    # the pedestal: hung under the top against the forward end panel; three drawers, each with a front and a bar handle on two studs
    (pu0, pu1), (pv0, pv1), (ph0, ph1) = dr['u'], dr['v'], dr['h']
    sbox(dark, pu0, u1 - pn, pv0, pv1, ph0, top - t, WOOD_DARK, soft=False)
    each = (ph1 - ph0) / dr['count']
    for k in range(dr['count']):
        h0, h1 = ph0 + k * each + 0.004, ph0 + (k + 1) * each - 0.004
        sbox(wood, pu0 + 0.006, pu1 - 0.006, pv1 - 0.001, pv1 + 0.018, h0, h1, tint(WOOD, 1.06))
        hm = (h0 + h1) / 2 + 0.03
        stube(fit, (pu0 + 0.12, pv1 + 0.045, hm), (pu1 - 0.12, pv1 + 0.045, hm), 0.006, STEEL, 10)
        for hu in (pu0 + 0.14, pu1 - 0.14):
            stube(fit, (hu, pv1 + 0.017, hm), (hu, pv1 + 0.045, hm), 0.004, STEEL, 8)


def chair():
    c = CP.CHAIR
    cu, cv, seat = c['u'], c['v'], c['seat']
    base = part('Chief engineer\'s chair, base', 'Matt black', smooth=True, angle=40)
    metal = part('Chief engineer\'s chair, column', 'Stainless', smooth=True, angle=40)
    cloth = part('Chief engineer\'s chair, upholstery', 'Upholstery')
    for k in range(5):                                                               # five arms, a castor under the end of each
        a = 2 * pi * k / 5 + pi / 10
        eu, ev = cu + c['base'] * cos(a), cv + c['base'] * sin(a)
        stube(base, (cu, cv, 0.085), (eu, ev, 0.070), 0.016, BLACK, 8)
        base.ball(sq(eu, ev, 0.030), 0.030, BLACK)
        stube(base, (eu, ev, 0.030), (eu, ev, 0.072), 0.008, BLACK, 8)
    stube(base, (cu, cv, 0.060), (cu, cv, 0.110), 0.035, BLACK, 16)                   # the hub
    stube(metal, (cu, cv, 0.100), (cu, cv, seat - 0.075), 0.022, STEEL, 16)            # the gas column
    sbox(base, cu - 0.10, cu + 0.10, cv - 0.10, cv + 0.10, seat - 0.085, seat - 0.060, BLACK)             # the seat's plate
    sbox(cloth, cu - c['wide'] / 2, cu + c['wide'] / 2, cv - c['deep'] / 2, cv + c['deep'] / 2, seat - 0.060, seat, FABRIC)
    sbox(base, cu - 0.03, cu + 0.03, cv + c['deep'] / 2 - 0.03, cv + c['deep'] / 2 + 0.02, seat - 0.075, seat + 0.22, BLACK)       # the back's upright, from under the seat
    sbox(cloth, cu - c['wide'] / 2 + 0.02, cu + c['wide'] / 2 - 0.02, cv + c['deep'] / 2 + 0.015, cv + c['deep'] / 2 + 0.075, seat + 0.10, seat + c['back'], FABRIC)


def computer():
    sc, d, kb, ms, un = CP.SCREEN, CP.DESK, CP.KEYS, CP.MOUSE, CP.UNIT
    top = d['top']
    case = part('Maintenance computer, cases', 'Plastic', smooth=True, angle=40)
    glass = part('Maintenance computer, screen', 'Screen', fine=True)
    lit = part('Maintenance computer, the screen\'s sheet', 'Signal white', fine=True)
    ui = part('Maintenance computer, what the screen shows', 'Plastic', fine=True)
    paint = part('Maintenance computer, lettering', 'Marking', fine=True)
    keys = part('Maintenance computer, keys', 'Plastic', fine=True)
    plate = part('Maintenance computer, plates', 'Plastic', fine=True)
    cable = part('Maintenance computer, cables', 'Rubber', smooth=True, angle=50)
    plugs = part('Maintenance computer, plugs', 'Plastic', smooth=True, angle=40)
    u, f, w, hgt, foot, bz = sc['u'], sc['face'], sc['wide'], sc['high'], sc['foot'], sc['bezel']
    # ---- the screen: its foot on the desk, its neck, its case, its glass; and on the glass the lit sheet
    sbox(case, u - 0.12, u + 0.12, f - 0.19, f - 0.03, top, top + 0.012, BLACK)
    sbox(case, u - 0.025, u + 0.025, f - 0.085, f - 0.055, top + 0.012, foot + hgt * 0.55, BLACK)
    sbox(case, u - 0.06, u + 0.06, f - 0.085, f - sc['thick'] + 0.001, foot + hgt * 0.35, foot + hgt * 0.65, BLACK)       # the neck's plate on the case's back
    sbox(case, u - w / 2 - bz, u + w / 2 + bz, f - sc['thick'], f - 0.002, foot - bz, foot + hgt + bz, BLACK)
    sbox(glass, u - w / 2, u + w / 2, f - 0.003, f, foot, foot + hgt, srgb(0x0c0f11), soft=False)
    s0, s1, sh0, sh1 = u - w / 2 + 0.004, u + w / 2 - 0.004, foot + 0.004, foot + hgt - 0.004
    sbox(lit, s0, s1, f - 0.001, f + 0.001, sh0, sh1, WHITE, soft=False)
    # what it shows, as the program opens: its bar with its name, the ship, three rows of the register, and where to tap
    proud, ink = f + 0.0026, f + 0.0032
    sbox(ui, s0, s1, f, f + 0.0026, sh1 - 0.040, sh1, BLUE, soft=False)
    swords(paint, 'MAINTENANCE DESK', 0.015, s0 + 0.118, ink, sh1 - 0.028, WHITE, 0.24, 'the bar of the maintenance program\'s opening picture')
    swords(paint, 'JOHANSSON CO', 0.008, s1 - 0.062, ink, sh1 - 0.024, WHITE, 0.12, 'the bar of the maintenance program\'s opening picture')
    swords(paint, 'M/V CHISUM', 0.024, u, f + 0.0016, sh1 - 0.085, INK, w - 0.04, 'the maintenance program\'s opening picture')
    swords(paint, 'EVERYTHING ABOARD, ITS JOBS AND ITS PAPERS', 0.0085, u, f + 0.0016, sh1 - 0.106, INK, w - 0.04, 'the maintenance program\'s opening picture')
    for k in range(3):                                                               # three rows: a mark, a name, a state
        h0 = sh1 - 0.150 - k * 0.034
        sbox(ui, s0 + 0.020, s1 - 0.020, f, proud, h0, h0 + 0.024, PALE, soft=False)
        sbox(ui, s0 + 0.028, s0 + 0.044, f + 0.001, f + 0.0034, h0 + 0.004, h0 + 0.020, BLUE, soft=False)
        sbox(ui, s0 + 0.056, s0 + 0.200 + 0.03 * k, f + 0.001, f + 0.0034, h0 + 0.009, h0 + 0.015, GREY, soft=False)
        sbox(ui, s1 - 0.090, s1 - 0.030, f + 0.001, f + 0.0034, h0 + 0.007, h0 + 0.017, srgb(0x197a4b) if k else srgb(0x7a5f00), soft=False)
    sbox(ui, u - 0.085, u + 0.085, f, proud, sh0 + 0.012, sh0 + 0.046, BLUE, soft=False)
    swords(paint, 'TAP TO OPEN', 0.012, u, ink, sh0 + 0.023, WHITE, 0.15, 'the button of the maintenance program\'s opening picture')
    sbox(plate, u - 0.045, u + 0.045, f - 0.003, f + 0.0006, foot - bz + 0.001, foot - 0.002, LIGHT, soft=False)              # the tag plate on the lower bezel
    swords(paint, CP.TAGS['computer'], 0.0065, u, f + 0.0012, foot - bz + 0.0025, BLACK, 0.08, 'the screen\'s tag plate')
    # ---- the keyboard: its body, and its keys in five rows (the long one nearest whoever sits)
    (k0, k1), (kv0, kv1) = kb['u'], kb['v']
    sbox(case, k0, k1, kv0, kv1, top, top + kb['high'] - 0.006, BLACK)
    rows, cols = 5, 14
    pu, pv = (k1 - k0 - 0.016) / cols, (kv1 - kv0 - 0.014) / rows
    for r in range(rows):
        for c in range(cols):
            if r == 0 and 3 <= c <= 8:                                               # the space bar
                if c == 3:
                    sbox(keys, k0 + 0.008 + 3 * pu + 0.0015, k0 + 0.008 + 9 * pu - 0.0015, kv1 - 0.007 - pv + 0.0015, kv1 - 0.007 - 0.0015, top + kb['high'] - 0.007, top + kb['high'], DARK)
                continue
            sbox(keys, k0 + 0.008 + c * pu + 0.0015, k0 + 0.008 + (c + 1) * pu - 0.0015, kv1 - 0.007 - (r + 1) * pv + 0.0015, kv1 - 0.007 - r * pv - 0.0015,
                 top + kb['high'] - 0.007, top + kb['high'], DARK)
    # ---- the mouse, on its mat
    (m0, m1), (mv0, mv1) = ms['u'], ms['v']
    sbox(case, m0 - 0.08, m1 + 0.08, mv0 - 0.06, mv1 + 0.05, top, top + 0.003, srgb(0x2b3033), soft=False)
    sbox(case, m0, m1, mv0, mv1, top + 0.003, top + ms['high'], BLACK)
    # ---- the system unit, on four feet on the deck under the desk; its front looks inboard
    (n0, n1), (nv0, nv1), nf, nh = un['u'], un['v'], un['foot'], un['high']
    for fu in (n0 + 0.02, n1 - 0.02):
        for fv in (nv0 + 0.03, nv1 - 0.03):
            stube(case, (fu, fv, 0.0), (fu, fv, nf + 0.002), 0.012, BLACK, 10)
    sbox(case, n0, n1, nv0, nv1, nf, nf + nh, DARK)
    stube(case, ((n0 + n1) / 2, nv1 - 0.001, nf + nh - 0.05), ((n0 + n1) / 2, nv1 + 0.004, nf + nh - 0.05), 0.010, LIGHT, 16)            # its button
    sbox(plate, n0 + 0.03, n1 - 0.03, nv1 - 0.001, nv1 + 0.002, nf + 0.05, nf + 0.085, LIGHT, soft=False)
    swords(paint, CP.TAGS['computer'], 0.011, (n0 + n1) / 2, nv1 + 0.0026, nf + 0.061, BLACK, n1 - n0 - 0.07, 'the system unit\'s tag plate')
    # ---- its cables. Nothing of them runs through the air (JSY-STD-402; blender/spans.py). Behind the desk there are 25 mm to
    # her side: a cable that goes along or up and down there lies against the wall under a saddle clip, each at a height of its
    # own over the outlets' plates, so that none passes through another, through a plate or through a trunking riser; from the
    # wall it steps out and comes down into its plug from above. From the unit's back each crosses to the wall under the
    # desk's back panel: a free loop of 0.15 m. (The unit's power and data first ran 0.2 and 0.4 m level through the air
    # before the plates, and the keyboard's cable hung 0.6 m free behind the desk: the first two found by spans.py.)
    sk, dt = CP.SOCKET, CP.DATA
    wall, near, r = 0.012, 0.030, 0.004
    hm = (sk['h'][0] + sk['h'][1]) / 2
    o1, o2, od = sk['u'][0] + 0.038, sk['u'][1] - 0.038, (dt['u'][0] + dt['u'][1]) / 2
    clip = part('Maintenance computer, cable clips', 'Plastic')
    hk, hv, hp, hd, hs = 0.33, 0.28, 0.36, 0.39, 0.42                                 # heights: the keyboard's, the picture's, the unit's power, its data, the screen's power
    ukey, upw, uvid, udt = n0 + 0.02, n0 + 0.05, (n0 + n1) / 2, n1 - 0.05             # where each leaves the unit's back
    if max(hk, hp, hd) + r > d['back'] - 0.02 or min(hp, hd, hs) - r < sk['h'][1] + 0.01:
        raise SystemExit('the chief engineer\'s day room is not built: the computer\'s cables do not pass between the outlets\' plates and the desk\'s back panel')

    def plug(uo):
        sbox(plugs, uo - 0.016, uo + 0.016, sk['proud'] - 0.001, 0.034, hm - 0.016, hm + 0.016, BLACK)

    def saddle(uc, hc, upright=False, panel=False):
        """A saddle clip over a cable: on her side, or on the back of the desk's back panel. Let 1 mm into what it is fixed to."""
        a, b = (0.008, 0.006) if upright else (0.006, 0.008)
        face = d['v'][0] + 0.02
        sbox(clip, uc - a, uc + a, face - 0.0195 if panel else -0.001, face + 0.001 if panel else 0.0185, hc - b, hc + b, LIGHT)

    srod(cable, [(upw, nv0, hp), (upw, wall, hp), (o1, wall, hp), (o1, near, hp), (o1, near, hm + 0.016)], r, BLACK)          # the unit's power, to the socket's first outlet
    plug(o1)
    saddle(upw + 0.07, hp), saddle(o1 - 0.06, hp)
    srod(cable, [(udt, nv0, hd), (udt, wall, hd), (od, wall, hd), (od, near, hd), (od, near, hm + 0.016)], r, BLACK)          # its data
    plug(od)
    saddle(udt + 0.07, hd), saddle((o1 + o2) / 2, hd), saddle(od - 0.06, hd)
    # The screen's two cables do as a screen's do: out of the case's back beside the neck, down behind it onto the stand's foot,
    # back over the foot and the desk's top to its back edge, and down behind the desk. (They first went straight from the wall
    # to the case through the air, the picture's cable up the wall beside the screen: a frame of wire standing in the room.)
    back, drop, lie, edge = f - sc['thick'] + 0.002, f - 0.100, top + 0.012 + r, f - 0.19 - r      # in the case; behind the neck; on the foot; behind the foot
    desk_top, lane = top + r + 0.001, 0.032                                           # on the desk's top; a third way behind the desk, under its top

    def from_screen(us):
        return [(us, back, foot + 0.045), (us, drop, foot + 0.045), (us, drop, lie), (us, edge, lie), (us, edge, desk_top), (us, wall, desk_top)]

    up, uv = u - 0.045, u + 0.045
    srod(cable, from_screen(up) + [(up, wall, hs), (o2, wall, hs), (o2, near, hs), (o2, near, hm + 0.016)], r, BLACK)         # the screen's power, to the socket's second outlet
    plug(o2)
    saddle(up, 0.58, upright=True), saddle((up + o2) / 2, hs)
    srod(cable, from_screen(uv) + [(uv, wall, 0.60), (uv, lane, 0.60), (uvid, lane, 0.60), (uvid, lane, hv), (uvid, nv0, hv)], r, DARK)       # the screen's picture, to the unit: along the back of the desk's back panel
    saddle(uv, 0.68, upright=True), saddle(uv - 0.12, 0.60, panel=True), saddle(uvid + 0.13, 0.60, panel=True)
    # the keyboard's: along the back of the desk's top to its after end, over the edge, down her side and under the back panel to the unit
    kr, kt, kw = 0.003, top + 0.004, 0.010
    srod(cable, [(k0 + 0.02, kv0, kt), (k0 + 0.02, 0.035, kt), (ukey, 0.035, kt), (ukey, kw, kt), (ukey, kw, hk), (ukey, nv0, hk)], kr, DARK)
    saddle(ukey, 0.55, upright=True)


def outlet(name):
    """The twin socket, or the data outlet, on her side under the desk: its plate, and the trunking up to it from the skirting."""
    o = CP.SOCKET if name == 'socket' else CP.DATA
    tr = CP.TRUNK
    white = part(f'Chief engineer\'s desk {name}, plate', 'Plastic', fine=True)
    dark = part(f'Chief engineer\'s desk {name}, faces', 'Plastic', smooth=True, angle=40, fine=True)
    trunk = part(f'Chief engineer\'s desk {name}, trunking', 'Plastic')
    (u0, u1), (h0, h1) = o['u'], o['h']
    um, hm = (u0 + u1) / 2, (h0 + h1) / 2
    sbox(white, u0, u1, -0.001, o['proud'], h0, h1, WHITE)                                               # the plate, let 1 mm into the wall
    if name == 'socket':                                                                                 # its two outlets
        for cu in (u0 + 0.038, u1 - 0.038):
            stube(dark, (cu, o['proud'] - 0.001, hm), (cu, o['proud'] + 0.0015, hm), 0.019, srgb(0xc9cdcf), 24)
    else:
        sbox(dark, um - 0.009, um + 0.009, o['proud'] - 0.001, o['proud'] + 0.0015, hm - 0.008, hm + 0.008, DARK, soft=False)
    sbox(trunk, um - 0.02, um + 0.02, 0.0, tr['deep'], tr['h'][1], h0, IVORY, soft=False)                # the riser, from the skirting trunking to the plate


def board():
    """The skirting trunking from the outlets to the place of the suite's distribution board DB-CE beside the door; the place
    itself, marked (an outline, a sign); and the box under it where the two cables end and say so. DB-CE is not installed."""
    tr, b = CP.TRUNK, CP.BOARD
    (th0, th1), deep = tr['h'], tr['deep']
    trunk = part('Chief engineer\'s day room, skirting trunking', 'Plastic')
    mark = part('Chief engineer\'s day room, the board\'s place', 'Machinery paint')
    sign = part('Chief engineer\'s day room, the board\'s sign', 'Plastic', fine=True)
    paint = part('Chief engineer\'s day room, the board\'s lettering', 'Marking', fine=True)
    sbox(trunk, CP.AFT + deep, tr['to'], 0.0, deep, th0, th1, IVORY, soft=False)                         # along her side, from the after wall to past the data outlet
    abox(trunk, tr['up'] - 0.02, CP.SIDE, 0.0, deep, th0, th1, IVORY, soft=False)                        # along the after wall, into the corner
    (bx0, bx1, bh0, bh1) = b['box']
    abox(trunk, tr['up'] - 0.02, tr['up'] + 0.02, 0.0, deep, th1, bh0, IVORY, soft=False)                # up the wall to the box
    abox(mark, bx0, bx1, -0.001, 0.050, bh0, bh1, GREY)                                                  # the box where the cables end
    abox(sign, bx0 + 0.008, bx1 - 0.008, 0.049, 0.052, bh0 + 0.008, bh1 - 0.008, WHITE, soft=False)
    lines = ('S1 AND DATA', 'CABLE ENDS')
    size = 0.011
    gap = (bh1 - bh0 - 0.016 - len(lines) * size) / (len(lines) + 1)
    h = bh1 - 0.008
    for t in lines:
        h -= gap + size
        awords(paint, t, size, (bx0 + bx1) / 2, 0.0526, h, BLACK, bx1 - bx0 - 0.026, 'the box where the day room\'s cables end')
    # the board's place: an outline of flat bar in yellow, and its sign
    (x0, x1), (h0, h1) = b['x'], b['h']
    w, t = 0.012, 0.003
    for xa, xb, ha, hb in ((x0, x1, h0, h0 + w), (x0, x1, h1 - w, h1), (x0, x0 + w, h0 + w, h1 - w), (x1 - w, x1, h0 + w, h1 - w)):
        abox(mark, xa, xb, -0.001, t, ha, hb, YELLOW, soft=False)
    abox(sign, x0 + 0.03, x1 - 0.03, -0.001, 0.003, h0 + 0.05, h1 - 0.05, WHITE, soft=False)
    lines = ((CP.TAGS['board'] + '  DB-CE', 0.022), ('DISTRIBUTION BOARD', 0.014), ('CHIEF ENGINEER\'S SUITE', 0.011), ('NOT INSTALLED', 0.018))
    room = x1 - x0 - 0.09
    gap = (h1 - h0 - 0.10 - sum(sz for _, sz in lines)) / (len(lines) + 1)
    h = h1 - 0.05
    for text, sz in lines:
        h -= gap + sz
        awords(paint, text, sz, (x0 + x1) / 2, 0.0036, h, BLACK, room, 'the sign of the place of DB-CE')


def calendar():
    """The calendar on the after wall: a card on a nail, a wire binding across its middle, and its page (cabin_pictures.py)."""
    c = CP.CALENDAR
    (x0, x1), (h0, h1) = c['x'], c['h']
    card = part('Chief engineer\'s calendar, card', 'Plastic')
    page = part('Chief engineer\'s calendar, page', 'Cabin picture')
    wire = part('Chief engineer\'s calendar, binding', 'Stainless', smooth=True, angle=40)
    abox(card, x0, x1, 0.0, 0.003, h0, h1, WHITE, soft=False)
    u0, v0, u1, v1 = json.load(open(os.path.join(HERE, 'cabin_pictures.json')))['tiles']['calendar']
    # as it is looked at from the room: bottom left, bottom right, top right, top left (looking aft, port is at the right hand)
    page.face([page.vert(aq(x0 + 0.004, 0.0036, h0 + 0.004)), page.vert(aq(x1 - 0.004, 0.0036, h0 + 0.004)), page.vert(aq(x1 - 0.004, 0.0036, h1 - 0.004)), page.vert(aq(x0 + 0.004, 0.0036, h1 - 0.004))],
              (1.0, 1.0, 1.0), [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])
    hm = (h0 + h1) / 2
    wire.tube(aq(x0 + 0.015, 0.007, hm), aq(x1 - 0.015, 0.007, hm), 0.004, None, colour=STEEL, sides=10, caps=(True, True))
    for k in range(9):                                                                # the binding's rings, through the card
        xr = x0 + 0.04 + k * (x1 - x0 - 0.08) / 8
        wire.tube(aq(xr, 0.0, hm), aq(xr, 0.011, hm), 0.003, None, colour=STEEL, sides=8, caps=(True, True))
    wire.tube(aq((x0 + x1) / 2, -0.001, h1 - 0.018), aq((x0 + x1) / 2, 0.012, h1 - 0.018), 0.004, None, colour=STEEL, sides=10, caps=(True, True))      # the nail it hangs on


def build():
    bad = CP.wrong()
    side, front = windows_as_built()
    if side != tuple(CP.WINDOWS['side']) or front != tuple(CP.WINDOWS['front']):
        bad.append(f'the room\'s windows are not where cabin_place.py has them: steel.py cuts {side} in her side and {front} in the house front')
    if bad:
        raise SystemExit('the chief engineer\'s day room is not built: ' + '; '.join(bad))
    with component(CP.TAGS['desk']):
        desk()
    with component(CP.TAGS['chair']):
        chair()
    with component(CP.TAGS['computer']):
        computer()
    with component(CP.TAGS['socket']):
        outlet('socket')
    with component(CP.TAGS['data']):
        outlet('data')
    with component(CP.TAGS['board']):
        board()
    with component(CP.TAGS['calendar']):
        calendar()
    return list(_parts.values())


def motion():
    """A tap on the computer sits one down at it: the page opens the maintenance program (app.js: `opens`). Nothing of it moves."""
    x, yard, h = CP.screen_centre()
    return [dict(id=CP.INPUT, name='Chief engineer\'s computer', min=0, max=1, step=1, unit='', below='', above='in use', rest='idle', auto='tap', opens='maintenance',
                 fitting=CP.TAGS['computer'], at=list(G.Q(x, yard, FLOOR + h)), reach=2.5)], []
