"""
The navigation bridge (section 5 of her own build): the wheelhouse, its two wings, and what the bridge adds to the compass
deck. Everything in it is a component of her register (ferry/systems/bridge.py): this module draws each one where the
register puts it, and what it draws between `with component(tag):` and its end is that component in the model.

What was here before was the Minato Maru's house with her own fittings set into it (11 November). It is redrawn whole:

  - the house: plated outside, lined inside, five forward windows raked 10 degrees under a visor, windows and a weathertight
    door down each side, a lined deckhead with its lights, loudspeaker and smoke detector, a sheet deck covering;
  - the console in five bays with every instrument of the register on it: displays that show their pictures (her own sheet,
    atlas.py), flush panels with their knobs, levers, a microphone, handsets; the equipment inside it as plain units;
  - the steering stand, two chairs, the overhead console, the compass periscope under the binnacle;
  - on the aft wall the fire detection panel, the two distribution boards and the two 24 V panels, a locker, the flag locker,
    the chart table with its chart, clock, barometer and clinometer, the portable radios, the room air conditioner;
  - both wings: bulwark with a wooden rail, wing control station, sidelight on the rail (it stood behind the bulwark, where
    no ship abeam could see it), bearing repeater, lifebuoy, and to port the hydrant and hose box;
  - on the compass deck: two not-under-command lights, the NAVTEX and AIS position antennas, a wind sensor, the air
    conditioner's condensing unit.

assemble.py takes the Minato Maru's wheelhouse away for it (REPLACES: its pieces, and everything inside the house's box).

Drawn in the ship's axes (lines.py): x to port, y up from the laden waterline, z forward from amidships. Places below are as
the register gives them: x, `yard` (metres from the transom) and h (metres over the bridge deck, 11.0 m above the keel).
"""
import os, sys
from math import pi, cos, sin, radians, tan, hypot
from mathutils import Vector
import lines as L
import spec as S
import shipyard
from shipyard import Part, srgb, tint, component, tile
from hull_appendages import _revolve

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'systems'))
import bridge as REG

DECK = L.Y(11.0)                      # the bridge deck, 9.1 m over the waterline
HEAD_ROOM = 2.08                      # the roof's underside
CEIL = 2.055                          # the deckhead lining
SILL, HEAD, RAKE = 0.95, 1.95, tan(radians(10.0))
X_IN, X_OUT = 2.92, 3.00              # the house side, inside and out
AFT, FRONT_IN, FRONT_OUT = 19.545, 22.92, 23.00
CORNER = 22.82                        # where the side wall's last window ends and the forward corner begins

HOUSE, LINING, CEILING = srgb(0xeeeae0), srgb(0xe3dfd2), srgb(0xecebe4)
GREEN, CREAM, DARK, BRASS, WOOD = srgb(0x52796f), srgb(0xd8d2c0), srgb(0x252e30), srgb(S.BRONZE), srgb(0x765032)
STAND, LEATHER, STEEL = srgb(0x5c6466), srgb(0x3b3430), srgb(S.STEEL)
FRAME, DOOR, SILLC = srgb(0x3a4244), srgb(0x5d6b6a), srgb(0x6b7472)
RED, GREENLENS, WHITE_LAMP, BLUE = srgb(0xc2412f), srgb(0x2f9e5a), srgb(0xf6f1e2), srgb(0x4a6a8a)
GREY, BLACK, WHITE = srgb(0x7d8586), srgb(0x1a1f20), srgb(0xf2f0e8)
VINYL, MAT, WINGDECK, BOARD, ORANGE, YELLOW = srgb(0x6b6a60), srgb(0x26282a), srgb(0x6f7d6c), srgb(0x9aa3a2), srgb(0xe8742a), srgb(0xe4d83c)
GLASS = srgb(0x2d4a55)

PARTS = dict(
    plating=('Wheelhouse, plating', 'Topside paint'), lining=('Wheelhouse, linings', 'Lining'), frame=('Wheelhouse, window frames', 'Console paint'),
    glass=('Wheelhouse, window glass', 'Window glass'), floor=('Wheelhouse, deck covering', 'Deck covering'), seam=('Wheelhouse, panel seams', 'Marking'),
    console=('Wheelhouse, console', 'Console paint'), dark=('Wheelhouse, instruments', 'Machinery paint'), plastic=('Wheelhouse, plastics', 'Plastic'),
    steel=('Wheelhouse, steel', 'Shaft steel'), brass=('Wheelhouse, brass', 'Bronze'), wood=('Wheelhouse, wood', 'Varnished wood'),
    seat=('Wheelhouse, upholstery', 'Upholstery'), lens=('Wheelhouse, lamps and lenses', 'Lens'), screen=('Wheelhouse, screens', 'Screen picture'),
    face=('Wheelhouse, panel faces', 'Panel face'), paint=('Wheelhouse, painted fittings', 'Deck paint'), wing=('Wheelhouse, wing plating', 'Topside paint'),
    top=('Compass deck, bridge fittings', 'Topside paint', 'top'), top_dark=('Compass deck, bridge fittings, dark', 'Machinery paint', 'top'),
    top_lens=('Compass deck, bridge fittings, lenses', 'Lens', 'top'), top_steel=('Compass deck, bridge fittings, steel', 'Shaft steel', 'top'),
)
_parts, _extra = {}, []


# What hangs from the deckhead is fastened to the compass deck, and lifts away with it when she is taken apart (as the
# deckhead over the machinery spaces goes with the car deck): the lining, its lights, the overhead console, the periscope.
# So a room is looked down into with nothing over it.
_hung = [False]
HUNG = ('ceiling', 'ceil', 'grabrails', 'overhead', 'ovh_dial', 'ovh_screen', 'periscope', 'whistle_valve')


def part(key):
    top = len(PARTS[key]) > 2 or _hung[0]
    slot = (key, top)
    if slot not in _parts:
        name, look = PARTS[key][:2]
        if _hung[0] and len(PARTS[key]) == 2:
            name = name.replace('Wheelhouse, ', 'Wheelhouse deckhead, ')
        _parts[slot] = Part(name, look)
        _parts[slot].group = 'top' if top else 'bridge'
    return _parts[slot]


def P(x, yard, h):
    """A point from its place on the bridge deck: x to port, metres from the transom, metres over the deck."""
    return (x, DECK + h, L.Z(yard))


def fwd(h):
    """How far the raked forward wall has leaned forward at this height."""
    return (min(max(h, SILL), HEAD) - SILL) * RAKE


def box(key, x0, x1, yd0, yd1, h0, h1, colour):
    x0, x1 = sorted((x0, x1))
    yd0, yd1 = sorted((yd0, yd1))
    h0, h1 = sorted((h0, h1))
    (key if isinstance(key, Part) else part(key)).box(P(x0, yd0, h0), P(x1, yd1, h1), colour)


def prism(key, x0, x1, profile, colour):
    """A solid from an outline in (yard, h) pushed from x0 to x1."""
    p = key if isinstance(key, Part) else part(key)
    x0, x1 = sorted((x0, x1))
    start = len(p.f)
    ring = lambda x: [P(x, yd, h) for yd, h in profile]
    p.grid([ring(x0), ring(x1)], colour, close=True)
    for x in (x0, x1):
        p.polygon(ring(x), colour)
    mid = Vector([sum(c) / len(c) for c in zip(*[P((x0 + x1) / 2, yd, h) for yd, h in profile])])
    p.orient(start, lambda c: c - mid)


def tube(key, a, b, r, colour, sides=12, r2=None):
    (key if isinstance(key, Part) else part(key)).tube(P(*a), P(*b), r, r2, colour=colour, sides=sides)


def torus(key, centre, big, small, colour, axis='z', n=28, m=10):
    """A ring about the fore-and-aft axis (a wheel) or the athwartships one (a lifebuoy against the bulwark)."""
    p = part(key)
    c = Vector(P(*centre))
    a1, a2, ax = (Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))) if axis == 'z' else (Vector((0, 0, 1)), Vector((0, 1, 0)), Vector((1, 0, 0)))
    rows = []
    for i in range(n + 1):
        a = 2 * pi * i / n
        out = a1 * cos(a) + a2 * sin(a)
        mid = c + out * big
        rows.append([tuple(mid + out * (small * cos(2 * pi * k / m)) + ax * (small * sin(2 * pi * k / m))) for k in range(m)])
    start = len(p.f)
    p.grid(rows, colour, close=True)

    def away(q):
        v = Vector(q) - c
        v -= ax * v.dot(ax)
        v.normalize()
        return Vector(q) - (c + v * big)
    p.orient(start, away)


def pic(centre, normal, up, w, h, name, proud=0.0015):
    """A picture of her sheet, w by h, on a face that looks along `normal`; `up` is the picture's upward edge. Screens shine, the rest takes the light."""
    c, n, u = Vector(P(*centre)), Vector(normal).normalized(), Vector(up).normalized()
    r = u.cross(n)
    c = c + n * proud
    corners = [tuple(c - r * (w / 2) - u * (h / 2)), tuple(c + r * (w / 2) - u * (h / 2)), tuple(c + r * (w / 2) + u * (h / 2)), tuple(c - r * (w / 2) + u * (h / 2))]
    part('screen' if tile(name)['kind'] == 'screen' else 'face').picture(corners, name)
    return c, r, u, n


def disc(centre, normal, up, radius, name, sides=28, proud=0.0015):
    """A round picture: the circle inscribed in the picture's square."""
    c, n, u = Vector(P(*centre)), Vector(normal).normalized(), Vector(up).normalized()
    r = u.cross(n)
    c = c + n * proud
    u0, v0, u1, v1 = tile(name)['uv']
    p = part('face')
    mid = p.vert(tuple(c))
    ring, uvs = [], []
    for k in range(sides):
        a = 2 * pi * k / sides
        ring.append(p.vert(tuple(c + r * (radius * cos(a)) + u * (radius * sin(a)))))
        uvs.append((u0 + (0.5 + 0.5 * cos(a)) * (u1 - u0), v0 + (0.5 + 0.5 * sin(a)) * (v1 - v0)))
    cm = ((u0 + u1) / 2, (v0 + v1) / 2)
    for k in range(sides):
        j = (k + 1) % sides
        p.face((mid, ring[k], ring[j]), (1.0, 1.0, 1.0), [cm, uvs[k], uvs[j]])


# ---- what stands on a panel's face in three dimensions, by the picture: (kind, across from the left, down from the top, size in picture points)
DETAILS = {
    'dimmer_panel': [('knob', (56 + i * 96) / 304, 76 / 160, 15) for i in range(3)],
    'wiper_panel': [('knob', (56 + i * 96) / 384, 76 / 160, 13) for i in range(3)],
    'steer_mode': [('knob', 0.5, 78 / 256, 19), ('tiller', 0.5, 198 / 256, 0)],
    'whistle_panel': [('button', 62 / 208, 74 / 160, 30), ('knob', 150 / 208, 74 / 160, 13)],
    'sl_panel': [('stick', 104 / 208, 80 / 160, 0)],
    'bnwas': [('knob', 76 / 336, 124 / 160, 11)],
    'pa_panel': [('mic', 404 / 464, 70 / 160, 0)],
    'radar_kbd': [('ball', (512 - 62) / 512, 0.5, 34)],
    'ecdis_kbd': [('ball', (384 - 62) / 384, 0.5, 34)],
    'navlight_panel': [('toggle', (424 + i * 58) / 848, 92 / 208, 0) for i in range(7)] + [('knob', 800 / 848, 150 / 208, 12)],
}


def details(name, got, w, h):
    c, r, u, n = got
    px = w / tile(name)['px'][0]
    for kind, fx, fy, size in DETAILS.get(name, ()):
        at = c + r * ((fx - 0.5) * w) + u * ((0.5 - fy) * h)
        if kind == 'knob':
            part('plastic').tube(tuple(at), tuple(at + n * 0.016), size * px, size * px * 0.85, colour=BLACK, sides=14)
            part('lens').tube(tuple(at + n * 0.016 + u * (size * px * 0.45)), tuple(at + n * 0.0175 + u * (size * px * 0.45)), size * px * 0.16, colour=WHITE, sides=6)
        elif kind == 'button':
            part('steel').tube(tuple(at), tuple(at + n * 0.012), size * px * 0.8, colour=GREY, sides=14)
            part('plastic').tube(tuple(at + n * 0.012), tuple(at + n * 0.03), size * px, size * px * 0.9, colour=RED, sides=16)
        elif kind == 'ball':
            _revolve(part('plastic'), tuple(at - n * 0.004), tuple(n), [(0.0, 0.0), (0.0, size * px), (size * px * 0.5, size * px * 0.86), (size * px * 0.82, size * px * 0.5), (size * px * 0.95, 0.0)], srgb(0x8a1f1a), sides=16)
        elif kind == 'stick':
            part('steel').tube(tuple(at), tuple(at + n * 0.06), 0.006, colour=GREY, sides=8)
            _revolve(part('plastic'), tuple(at + n * 0.05), tuple(n), [(0.0, 0.0), (0.0, 0.006), (0.006, 0.014), (0.02, 0.015), (0.03, 0.0)], BLACK, sides=12)
        elif kind == 'toggle':
            part('steel').tube(tuple(at), tuple(at + n * 0.006), 0.007, colour=GREY, sides=10)
            part('steel').tube(tuple(at + n * 0.006), tuple(at + n * 0.03 + u * 0.012), 0.0035, 0.0045, colour=srgb(0xd7dcdc), sides=8)
        elif kind == 'tiller':
            part('steel').tube(tuple(at), tuple(at + n * 0.012), 0.016, colour=GREY, sides=12)
            part('steel').tube(tuple(at + n * 0.012), tuple(at + n * 0.14), 0.007, colour=GREY, sides=8)
            _revolve(part('plastic'), tuple(at + n * 0.13), tuple(n), [(0.0, 0.0), (0.0, 0.007), (0.01, 0.019), (0.035, 0.02), (0.05, 0.0)], BLACK, sides=12)
        elif kind == 'mic':
            part('steel').tube(tuple(at), tuple(at + n * 0.015), 0.022, colour=GREY, sides=14)
            mid = at + n * 0.16 - u * 0.03
            tip = at + n * 0.22 - u * 0.10
            part('plastic').tube(tuple(at + n * 0.015), tuple(mid), 0.005, colour=BLACK, sides=8)
            part('plastic').tube(tuple(mid), tuple(tip), 0.005, colour=BLACK, sides=8)
            part('plastic').tube(tuple(tip), tuple(tip - u * 0.05 + n * 0.01), 0.013, 0.016, colour=BLACK, sides=10)


UP, FWD, AFTWARD, PORT, STBD = (0, 1, 0), (0, 0, 1), (0, 0, -1), (1, 0, 0), (-1, 0, 0)
TILT = (0, cos(radians(20)), sin(radians(20)))            # up the leaning face of a display
TILT_N = (0, sin(radians(20)), -cos(radians(20)))         # and the way that face looks: aft and a little up


# =====================================================================================================================
# The house
# =====================================================================================================================
SIDES = {                                                  # openings in each side wall, the same on both sides: (yard from, to, h from, to, what)
    side: [(19.65, 20.33, 1.10, 1.80, 'window'), (20.45, 21.25, 0.0, 1.95, 'door'), (21.30, 22.10, 0.97, 1.83, 'window'), (22.15, CORNER, 0.97, 1.83, 'window')]
    for side in (1, -1)
}
# The forward windows, x from and to: five alike between two corner posts of 0.06 m and four mullions of 0.10 m.
_pane = (2 * X_IN - 2 * 0.06 - 4 * 0.10) / 5
PANES = [(-X_IN + 0.06 + k * (_pane + 0.10), -X_IN + 0.06 + k * (_pane + 0.10) + _pane) for k in range(5)]
MULLION_X = PANES[2][1] + 0.05            # the mullion either side of the middle window, where the cable ducts come down
FRAME_T, STILE = 0.05, 0.06               # a window's frame, and the stile of a door's leaf beside its glass
HELM = (0.0, 20.9, 1.6)                   # the eye of a person standing at the wheel


def view_from_helm(limit=112.5, mullion=6.0):
    """
    How much of the horizon the glass shows a person standing at the wheel, doors shut, by the survey's own measure
    (ferry/design/bridge/findings.py): each pane's two edges as bearings from right ahead, gaps under 6 degrees taken as
    mullions the view goes on round, counted to 22.5 degrees abaft the beam on each side. Returns the degrees seen of 225
    and the blind sectors on one side (the two sides are alike).
    """
    from math import atan2, degrees
    ex, ey, eh = HELM
    front = FRONT_IN + 0.045 + fwd(eh)
    spans = [(degrees(atan2(a + FRAME_T - 0.005, front - ey)), degrees(atan2(b - FRAME_T + 0.005, front - ey))) for a, b in PANES if b > 0]
    spans[0] = (0.0, spans[0][1])
    for yd0, yd1, h0, h1, what in SIDES[1]:
        if what == 'window' and h0 + FRAME_T < eh < h1 - FRAME_T:
            a, b = yd0 + FRAME_T, yd1 - FRAME_T
        elif what == 'door':
            a, b = yd0 + 0.04 + STILE, yd1 - 0.04 - STILE
        else:
            continue
        spans.append(tuple(sorted((degrees(atan2(2.965, b - ey)), degrees(atan2(2.965, a - ey))))))
    spans.sort()
    merged = [list(spans[0])]
    for a, b in spans[1:]:
        if a - merged[-1][1] < mullion:
            merged[-1][1] = max(merged[-1][1], b)
        else:
            merged.append([a, b])
    seen = 2 * sum(max(0.0, min(b, limit) - min(a, limit)) for a, b in merged)
    blind = [(round(merged[i][1], 1), round(merged[i + 1][0], 1)) for i in range(len(merged) - 1)]
    return seen, blind, round(merged[-1][1], 1)


def _wall(side, yd0, yd1, h0, h1):
    """A length of the side wall: plating outside, lining inside."""
    if yd1 - yd0 < 1e-6 or h1 - h0 < 1e-6:
        return
    box('plating', side * (X_IN + 0.04), side * X_OUT, yd0, yd1, h0, h1, HOUSE)
    box('lining', side * X_IN, side * (X_IN + 0.04), yd0, yd1, h0, h1, LINING)


def _raked(key, x0, x1, t0, t1, h0, h1, colour):
    """A member of the raked forward wall between heights h0 and h1: t0 and t1 are how far through the wall it lies (0 inside, 1 outside)."""
    th = FRONT_OUT - FRONT_IN
    prof = [(FRONT_IN + th * t0 + fwd(h0), h0), (FRONT_IN + th * t1 + fwd(h0), h0), (FRONT_IN + th * t1 + fwd(h1), h1), (FRONT_IN + th * t0 + fwd(h1), h1)]
    prism(key, x0, x1, prof, colour)


def _side_window(side, yd0, yd1, h0, h1):
    xa, xb = side * 2.94, side * 2.99
    t = FRAME_T
    box('frame', xa, xb, yd0, yd1, h0, h0 + t, FRAME)
    box('frame', xa, xb, yd0, yd1, h1 - t, h1, FRAME)
    for a, b in ((yd0, yd0 + t), (yd1 - t, yd1)):
        box('frame', xa, xb, a, b, h0 + t, h1 - t, FRAME)
    x = side * 2.965
    part('glass').polygon([P(x, yd0 + t, h0 + t), P(x, yd1 - t, h0 + t), P(x, yd1 - t, h1 - t), P(x, yd0 + t, h1 - t)], GLASS)


def envelope():
    # ---- the two sides
    for side, openings in SIDES.items():
        at = AFT
        for yd0, yd1, h0, h1, what in openings:
            _wall(side, at, yd0, 0.0, HEAD_ROOM)
            if what == 'window':
                _wall(side, yd0, yd1, 0.0, h0)
                _wall(side, yd0, yd1, h1, HEAD_ROOM)
                _side_window(side, yd0, yd1, h0, h1)
            else:
                _wall(side, yd0, yd1, h1, HEAD_ROOM)
            at = yd1
        # the forward corner: the side wall carried into the rake of the front
        cheek = [(CORNER, 0.0), (FRONT_OUT, 0.0), (FRONT_OUT, SILL), (FRONT_OUT + fwd(HEAD), HEAD), (FRONT_OUT + fwd(HEAD), HEAD_ROOM - 0.05), (CORNER, HEAD_ROOM - 0.05)]
        prism('plating', side * (X_IN + 0.04), side * X_OUT, cheek, HOUSE)
        prism('lining', side * X_IN, side * (X_IN + 0.04), cheek, LINING)
        box('plating', side * X_IN, side * X_OUT, CORNER, 23.10, HEAD_ROOM - 0.05, HEAD_ROOM, HOUSE)
    # ---- the front: plating below the sill, then posts, mullions, frames and glass raked forward, then the head
    box('plating', -X_IN, X_IN, FRONT_IN + 0.04, FRONT_OUT, 0.0, SILL, HOUSE)
    box('lining', -X_IN, X_IN, FRONT_IN, FRONT_IN + 0.04, 0.0, SILL, LINING)
    posts = [(-X_IN, PANES[0][0])] + [(a[1], b[0]) for a, b in zip(PANES, PANES[1:])] + [(PANES[-1][1], X_IN)]
    for x0, x1 in posts:
        _raked('plating', x0, x1, 0.5, 1.0, SILL, HEAD, HOUSE)
        _raked('lining', x0, x1, 0.0, 0.5, SILL, HEAD, LINING)
    head = [(FRONT_IN + fwd(HEAD), HEAD), (FRONT_OUT + fwd(HEAD), HEAD), (FRONT_OUT + fwd(HEAD), HEAD_ROOM - 0.05), (FRONT_IN + fwd(HEAD), HEAD_ROOM - 0.05)]
    prism('plating', -X_IN, X_IN, [(y + 0.04 if i in (0, 3) else y, h) for i, (y, h) in enumerate(head)], HOUSE)
    prism('lining', -X_IN, X_IN, [(y if i in (0, 3) else y - 0.04, h) for i, (y, h) in enumerate(head)], LINING)
    t = 0.045
    for x0, x1 in PANES:
        _raked('frame', x0, x1, 0.25, 0.85, SILL, SILL + t, FRAME)
        _raked('frame', x0, x1, 0.25, 0.85, HEAD - t, HEAD, FRAME)
        for a, b in ((x0, x0 + t), (x1 - t, x1)):
            _raked('frame', a, b, 0.25, 0.85, SILL + t, HEAD - t, FRAME)
        yg = lambda h: FRONT_IN + 0.045 + fwd(h)
        part('glass').polygon([P(x0 + t, yg(SILL + t), SILL + t), P(x1 - t, yg(SILL + t), SILL + t), P(x1 - t, yg(HEAD - t), HEAD - t), P(x0 + t, yg(HEAD - t), HEAD - t)], GLASS)
    # the visor: the roof's eave carried forward over the glass
    box('plating', -3.08, 3.08, 23.09, 23.46, HEAD_ROOM - 0.05, HEAD_ROOM, HOUSE)
    prism('plating', -3.08, 3.08, [(23.40, HEAD_ROOM - 0.05), (23.46, HEAD_ROOM - 0.05), (23.46, HEAD_ROOM - 0.11), (23.44, HEAD_ROOM - 0.11)], tint(HOUSE, 0.94))


def ceiling():
    """The deckhead: lining panels 25 mm under the roof, their seams every 0.6 m."""
    box('lining', -X_IN, X_IN, AFT, FRONT_IN + fwd(HEAD), CEIL, HEAD_ROOM, CEILING)
    p = part('seam')
    ink = tint(CEILING, 0.72)
    start = len(p.f)
    y = CEIL - 0.0008
    for k in range(-4, 5):
        x = k * 0.6
        p.polygon([P(x - 0.004, AFT, y), P(x + 0.004, AFT, y), P(x + 0.004, 23.05, y), P(x - 0.004, 23.05, y)], ink)
    for k in range(6):
        yd = 19.8 + k * 0.6
        p.polygon([P(-X_IN, yd - 0.004, y), P(X_IN, yd - 0.004, y), P(X_IN, yd + 0.004, y), P(-X_IN, yd + 0.004, y)], ink)
    p.orient(start, (0, -1, 0))


def floor():
    box('floor', -2.12, X_IN, AFT, FRONT_IN, 0.0, 0.012, VINYL)
    box('floor', -X_IN, -2.12, 20.15, FRONT_IN, 0.0, 0.012, VINYL)
    box('floor', -0.55, 0.55, 20.55, 21.40, 0.012, 0.02, MAT)                 # the mat at the helm
    for k in range(11):
        box('floor', -0.53, 0.53, 20.59 + k * 0.075, 20.62 + k * 0.075, 0.02, 0.024, tint(MAT, 1.5))
    box('console', -0.05, 0.05, 21.98, 22.30, 0.012, 0.03, FRAME)             # the floor trunk from the console to the stand


def wing(g):
    side = g['side']
    box('floor', side * X_OUT, side * 4.10, 19.50, 22.94, 0.0, 0.012, WINGDECK)
    box('wing', side * 4.10, side * 4.16, 19.50, FRONT_OUT, 0.0, 1.10, HOUSE)                     # the bulwark outboard
    box('wing', side * X_OUT, side * 4.10, 22.94, FRONT_OUT, 0.0, 1.10, HOUSE)                    # and across the forward end
    for yd in (20.1, 20.7, 21.3, 21.9, 22.5):                                                     # its stays
        prism('wing', side * 4.09, side * 4.10, [(yd - 0.004, 0.012), (yd + 0.004, 0.012), (yd + 0.004, 1.10), (yd - 0.004, 1.10)], tint(HOUSE, 0.92))
        prism('wing', side * 4.02, side * 4.10, [(yd - 0.004, 0.012), (yd + 0.004, 0.012), (yd + 0.004, 0.30), (yd - 0.004, 0.30)], tint(HOUSE, 0.92))
    box('wood', side * 4.04, side * 4.19, 19.50, 23.03, 1.10, 1.15, WOOD)                         # the rail
    box('wood', side * X_OUT, side * 4.04, 22.91, 23.03, 1.10, 1.15, WOOD)


# =====================================================================================================================
# Doors
# =====================================================================================================================
MOTIONS = []


def door_wing(g, tag):
    """A weathertight door in the house side: a lining, a 0.15 m coaming sill, a leaf hinged on its forward edge that opens outward."""
    side, (yd0, yd1) = g['side'], g['yd']
    name = 'port' if side > 0 else 'starboard'
    mover = f'door-wing-{name[0]}'
    xi, xo = side * X_IN, side * X_OUT
    for a, b in ((yd0, yd0 + 0.04), (yd1 - 0.04, yd1)):
        box('frame', xi, xo, a, b, 0.15, 1.91, FRAME)
    box('frame', xi, xo, yd0, yd1, 1.91, 1.95, FRAME)
    box('paint', side * 2.88, side * 3.07, yd0, yd1, 0.0, 0.15, SILLC)
    leaf = Part(f'Wheelhouse, wing door, {name}', 'Deck paint', mover=mover)
    glass = Part(f'Wheelhouse, wing door glass, {name}', 'Window glass', mover=mover)
    fit = Part(f'Wheelhouse, wing door hardware, {name}', 'Bronze', mover=mover)
    a, b = yd0 + 0.04, yd1 - 0.04
    xa, xb = side * 2.95, side * 2.99
    box(leaf, xa, xb, a, b, 0.15, 0.95, DOOR)
    box(leaf, xa, xb, a, b, 1.75, 1.91, DOOR)
    box(leaf, xa, xb, a, a + STILE, 0.95, 1.75, DOOR)
    box(leaf, xa, xb, b - STILE, b, 0.95, 1.75, DOOR)
    box(leaf, side * 2.99, side * 3.005, a + 0.01, b - 0.01, 0.15, 0.31, tint(DOOR, 0.55))
    glass.polygon([P(side * 2.97, a + STILE, 0.95), P(side * 2.97, b - STILE, 0.95), P(side * 2.97, b - STILE, 1.75), P(side * 2.97, a + STILE, 1.75)], GLASS)
    for xs, d in ((side * 3.0, 1), (side * 2.95, -1)):
        box(fit, xs, xs + side * d * 0.045, a + 0.03, a + 0.06, 0.98, 1.08, BRASS)
        box(fit, xs + side * d * 0.03, xs + side * d * 0.05, a + 0.015, a + 0.12, 1.03, 1.06, BRASS)
    for hh in (0.35, 1.55):
        tube(fit, (side * 2.97, b, hh - 0.06), (side * 2.97, b, hh + 0.06), 0.016, BRASS, 10)
    for p in (leaf, glass, fit):
        p.group = 'bridge'
        _extra.append(p)
    MOTIONS.append(dict(id=mover, name=f'Door to the {name} wing', pivot=[side * 2.97, 0.0, L.Z(b)], ratio=-1.0 * side, max=100,
                        at=[side * 3.0, DECK, L.Z((yd0 + yd1) / 2)], normal=[side, 0, 0]))


def door_corridor(g, tag):
    """The door from the crew corridor, in the aft wall's opening: hinged to starboard, it opens into the wheelhouse."""
    mover = 'door-corridor'
    for sx in (-1, 1):
        box('frame', sx * 0.40, sx * 0.36, 19.46, 19.545, 0.0, 1.92, FRAME)
    box('frame', -0.40, 0.40, 19.46, 19.545, 1.88, 1.92, FRAME)
    leaf = Part('Wheelhouse, corridor door', 'Lining', mover=mover)
    fit = Part('Wheelhouse, corridor door hardware', 'Shaft steel', mover=mover)
    glass = Part('Wheelhouse, corridor door glass', 'Window glass', mover=mover)
    cream = srgb(0xd9d2bf)
    box(leaf, -0.355, 0.355, 19.50, 19.54, 0.02, 1.40, cream)
    box(leaf, -0.355, 0.355, 19.50, 19.54, 1.66, 1.875, cream)
    box(leaf, -0.355, -0.13, 19.50, 19.54, 1.40, 1.66, cream)
    box(leaf, 0.13, 0.355, 19.50, 19.54, 1.40, 1.66, cream)
    box(leaf, -0.35, 0.35, 19.54, 19.546, 0.02, 0.22, tint(STEEL, 0.9))                # a kick plate
    glass.polygon([P(-0.13, 19.52, 1.40), P(0.13, 19.52, 1.40), P(0.13, 19.52, 1.66), P(-0.13, 19.52, 1.66)], GLASS)
    for yd, d in ((19.54, 1), (19.50, -1)):                                           # a lever handle on both faces, at the free edge
        box(fit, 0.26, 0.30, yd, yd + d * 0.04, 0.98, 1.06, GREY)
        box(fit, 0.17, 0.30, yd + d * 0.03, yd + d * 0.045, 1.02, 1.04, GREY)
    for hh in (0.3, 1.6):
        tube(fit, (-0.365, 19.535, hh - 0.05), (-0.365, 19.535, hh + 0.05), 0.012, GREY, 8)
    for p in (leaf, fit, glass):
        p.group = 'bridge'
        _extra.append(p)
    MOTIONS.append(dict(id=mover, name='Door from the corridor to the wheelhouse', pivot=[-0.365, 0.0, L.Z(19.535)], ratio=-1.0, max=92,
                        at=[0.0, DECK, L.Z(19.50)], normal=[0, 0, 1]))


# =====================================================================================================================
# The console, the stand, the chairs
# =====================================================================================================================
def console(g, tag, *where):
    box('console', -2.70, 2.70, 22.34, 22.92, 0.012, 0.08, FRAME)
    box('console', -2.75, 2.75, 22.30, 22.92, 0.08, 0.97, GREEN)
    box('console', -2.76, 2.76, 22.29, 22.92, 0.97, 1.00, CREAM)
    # five bays, two doors each, with a pull; a ventilation grille low in each
    for x0, x1 in ((1.45, 2.75), (0.62, 1.45), (-0.38, 0.62), (-1.45, -0.38), (-2.75, -1.45)):
        w = (x1 - x0) / 2
        for k in range(2):
            a, b = x0 + k * w + 0.012, x0 + (k + 1) * w - 0.012
            if x0 < -1.45 + 1e-6 and x1 < -1.0 and k == 0 or (x0 == -1.45 and k == 1 and False):
                pass
            box('console', a, b, 22.292, 22.30, 0.16, 0.56 if (a < -1.0 and b > -2.1) else 0.90, tint(GREEN, 1.07))
            box('steel', (a + b) / 2 - 0.05, (a + b) / 2 + 0.05, 22.280, 22.292, 0.50 if (a < -1.0 and b > -2.1) else 0.84, (0.50 if (a < -1.0 and b > -2.1) else 0.84) + 0.012, GREY)
        for k in range(4):
            box('dark', x0 + 0.10, x1 - 0.10, 22.296, 22.301, 0.10 + k * 0.012, 0.106 + k * 0.012, BLACK)
    # a grab rail along the after edge, on stand-offs, and a foot rail
    tube('steel', (-2.65, 22.25, 1.02), (2.65, 22.25, 1.02), 0.014, srgb(0xc9cfcf), 10)
    for x in (-2.6, -1.3, 0.0, 1.3, 2.6):
        tube('steel', (x, 22.25, 1.02), (x, 22.30, 0.985), 0.008, GREY, 6)
    tube('steel', (-2.6, 22.22, 0.20), (2.6, 22.22, 0.20), 0.016, GREY, 10)
    for x in (-2.5, -0.9, 0.9, 2.5):
        tube('steel', (x, 22.22, 0.20), (x, 22.31, 0.20), 0.01, GREY, 6)


def stand(g, tag, *where):
    box('console', -0.32, 0.32, 21.48, 22.02, 0.012, 0.10, STAND)
    box('console', -0.28, 0.28, 21.52, 21.98, 0.10, 0.95, STAND)
    box('console', -0.31, 0.31, 21.49, 22.01, 0.95, 0.98, tint(STAND, 0.55))
    c = (0.0, 21.42, 1.05)
    torus('wood', c, 0.29, 0.022, WOOD)
    tube('brass', (0, 21.385, 1.05), (0, 21.455, 1.05), 0.055, BRASS, 16)
    tube('steel', (0, 21.45, 1.05), (0, 21.52, 1.05), 0.03, GREY, 12)
    for i in range(8):
        a = i * pi / 4
        d = (cos(a), sin(a))
        tube('wood', (0.05 * d[0], 21.42, 1.05 + 0.05 * d[1]), (0.36 * d[0], 21.42, 1.05 + 0.36 * d[1]), 0.012, WOOD, 8, 0.016)
        tube('wood', (0.29 * d[0], 21.42, 1.05 + 0.29 * d[1]), (0.37 * d[0], 21.42, 1.05 + 0.37 * d[1]), 0.016, WOOD, 8)


def chair(g, tag, x, yard):
    tube('steel', (x, yard, 0.012), (x, yard, 0.04), 0.26, GREY, 24)
    tube('steel', (x, yard, 0.04), (x, yard, 0.62), 0.045, GREY, 14)
    torus_y = 0.30
    for k in range(4):
        a = k * pi / 2 + 0.4
        tube('steel', (x, yard, torus_y), (x + 0.24 * cos(a), yard + 0.24 * sin(a), torus_y), 0.01, GREY, 6)
    for k in range(12):                                                         # the foot ring
        a0, a1 = k * pi / 6, (k + 1) * pi / 6
        tube('steel', (x + 0.24 * cos(a0), yard + 0.24 * sin(a0), torus_y), (x + 0.24 * cos(a1), yard + 0.24 * sin(a1), torus_y), 0.012, GREY, 6)
    box('seat', x - 0.24, x + 0.24, yard - 0.22, yard + 0.24, 0.62, 0.72, LEATHER)
    prism('seat', x - 0.22, x + 0.22, [(yard - 0.27, 0.70), (yard - 0.19, 0.70), (yard - 0.23, 1.22), (yard - 0.31, 1.22)], LEATHER)
    box('seat', x - 0.14, x + 0.14, yard - 0.32, yard - 0.24, 1.22, 1.38, tint(LEATHER, 1.15))
    for sx in (-1, 1):
        tube('steel', (x + sx * 0.26, yard - 0.12, 0.72), (x + sx * 0.26, yard - 0.12, 0.90), 0.014, GREY, 8)
        box('seat', x + sx * 0.26 - 0.03, x + sx * 0.26 + 0.03, yard - 0.18, yard + 0.20, 0.90, 0.94, tint(LEATHER, 1.2))


# =====================================================================================================================
# Instruments
# =====================================================================================================================
def display(g, tag, x, yard, h):
    """A display or a set on the console: a housing whose after face leans back 20 degrees and carries the picture."""
    w, d, H = g['w'], g['d'], g['H']
    back = H * tan(radians(20))
    prism('dark', x - w / 2, x + w / 2, [(yard, h), (yard + d, h), (yard + d, h + H), (yard + back, h + H)], DARK)
    bz = 0.025
    face = H / cos(radians(20))
    pic((x, yard + back / 2, h + H / 2), TILT_N, TILT, w - 2 * bz, face - 2 * bz, g['tile'])
    if g.get('hood'):
        top = h + H + 0.012
        box('dark', x - w / 2 - 0.012, x + w / 2 + 0.012, yard - 0.07, yard + back + 0.03, top, top + 0.02, DARK)
        for sx in (-1, 1):
            prism('dark', x + sx * (w / 2 + 0.002), x + sx * (w / 2 + 0.014), [(yard - 0.07, h + 0.10), (yard + 0.02, h + 0.01), (yard + d, h + 0.01), (yard + d, top + 0.02), (yard - 0.07, top + 0.02)], DARK)
    if h > REG.TOP + 0.01:                                                    # a set raised on a stand-off
        box('dark', x - w / 2 + 0.04, x + w / 2 - 0.04, yard + 0.01, yard + d - 0.01, REG.TOP, h, DARK)
    if g.get('keys'):
        name, kw = g['keys']
        flush(dict(w=kw, l=0.12, tile=name), tag, x, REG.FRONT, REG.TOP)
    if g.get('handset'):
        handset(x + g['handset'] * (w / 2 + 0.07), yard + 0.02, h)


def handset(x, yard, h, along='yard'):
    """A telephone handset lying in its cradle, with a coiled cord."""
    box('plastic', x - 0.03, x + 0.03, yard, yard + 0.20, h, h + 0.02, BLACK)
    for yy in (yard + 0.02, yard + 0.16):
        box('plastic', x - 0.028, x + 0.028, yy, yy + 0.035, h + 0.02, h + 0.045, BLACK)
    box('plastic', x - 0.022, x + 0.022, yard + 0.005, yard + 0.195, h + 0.045, h + 0.065, srgb(0x2a2f31))
    for k in range(5):
        tube('plastic', (x + 0.034, yard + 0.02 + k * 0.012, h + 0.012), (x + 0.045, yard + 0.026 + k * 0.012, h + 0.03), 0.003, BLACK, 5)


def flush(g, tag, x, yard, h):
    """A panel set flush in a level top: a plate, its picture, and whatever stands on it."""
    w, l = g['w'], g['l']
    rise = g.get('rise', 0.004)
    box('dark', x - w / 2, x + w / 2, yard - l / 2, yard + l / 2, h, h + rise, DARK)
    got = pic((x, yard, h + rise), UP, FWD, w - 0.008, l - 0.008, g['tile'])
    details(g['tile'], got, w - 0.008, l - 0.008)


def facepanel(g, tag, x, yard, h):
    """A panel on an upright face that looks aft: the console's, or the steering stand's."""
    w, H = g['w'], g['H']
    box('dark', x - w / 2, x + w / 2, yard - 0.012, yard, h, h + H, DARK)
    got = pic((x, yard - 0.012, h + H / 2), AFTWARD, UP, w - 0.01, H - 0.01, g['tile'])
    details(g['tile'], got, w - 0.01, H - 0.01)


def lever(g, tag, x, yard, h):
    """An engine or thruster control lever: a base with its scale, a shaft, a grip."""
    col = srgb(g['colour'])
    box('dark', x - 0.07, x + 0.07, yard - 0.15, yard + 0.15, h, h + 0.04, DARK)
    if g.get('across'):
        pic((x, yard + 0.085, h + 0.04), UP, FWD, 0.13, 0.05, 'thr_scale')
        tube('steel', (x, yard - 0.03, h + 0.04), (x, yard - 0.03, h + 0.27), 0.012, GREY, 10)
        tube('plastic', (x, yard - 0.075, h + 0.27), (x, yard + 0.015, h + 0.27), 0.03, col, 12)
    else:
        pic((x + 0.038, yard, h + 0.04), UP, FWD, 0.055, 0.14, 'lever_scale')
        tube('steel', (x - 0.025, yard, h + 0.04), (x - 0.025, yard, h + 0.27), 0.012, GREY, 10)
        tube('plastic', (x - 0.065, yard, h + 0.27), (x + 0.015, yard, h + 0.27), 0.03, col, 12)
    tube('steel', (x - (0.0 if g.get('across') else 0.025), yard - (0.03 if g.get('across') else 0.0), h + 0.04), (x - (0.0 if g.get('across') else 0.025), yard - (0.03 if g.get('across') else 0.0), h + 0.055), 0.03, GREY, 12)


def phone(g, tag, x, yard, h):
    flush(g, tag, x, yard, h)
    handset(x + g['w'] / 2 - 0.045, yard - 0.06, h + 0.004)


def sp_phone(g, tag, x, yard, h):
    """The sound-powered telephone: a grey box with its handset on top and a calling crank at its side."""
    box('console', x - 0.08, x + 0.08, yard - 0.10, yard + 0.12, h, h + 0.10, srgb(0x8d9796))
    handset(x, yard - 0.09, h + 0.10)
    tube('steel', (x - 0.08, yard, h + 0.05), (x - 0.11, yard, h + 0.05), 0.008, GREY, 8)
    tube('steel', (x - 0.11, yard, h + 0.05), (x - 0.11, yard + 0.04, h + 0.05), 0.005, GREY, 6)
    tube('plastic', (x - 0.11, yard + 0.04, h + 0.05), (x - 0.14, yard + 0.04, h + 0.05), 0.008, BLACK, 8)


def navtex(g, tag, x, yard, h):
    w, d, H = g['w'], g['d'], g['H']
    display(dict(g, hood=False), tag, x, yard, h)
    box('paint', x - 0.09, x + 0.09, yard + 0.06, yard + d - 0.01, h + H, h + H + 0.004, WHITE)       # the printed paper, coming out of the top
    box('paint', x - 0.09, x + 0.09, yard + d - 0.012, yard + d - 0.008, h + H, h + H + 0.05, WHITE)


def hidden(g, tag, x, yard, h):
    """A unit inside the console or the stand: a plain case with a connector strip."""
    w, d, H = g['size']
    box('console', x - w / 2, x + w / 2, yard - d / 2, yard + d / 2, h, h + H, srgb(0x8a9392))
    box('dark', x - w / 2 + 0.02, x + w / 2 - 0.02, yard - d / 2 - 0.004, yard - d / 2, h + H * 0.25, h + H * 0.55, BLACK)


def overhead(g, tag, x, yard, h):
    """The overhead console: a sloped panel under the deckhead, its face looking aft and down."""
    prof = [(22.40, CEIL), (22.68, CEIL), (22.68, 1.88), (22.50, 1.80)]
    prism('console', -1.50, 1.50, prof, tint(GREEN, 0.95))
    for sx in (-1, 1):
        box('console', sx * 1.50, sx * 1.52, 22.39, 22.69, 1.79, CEIL, tint(GREEN, 0.8))


OVH_UP = Vector((0.0, 0.255, -0.10)).normalized()
OVH_N = Vector((0.0, -0.10, -0.255)).normalized()
OVH_MID = (22.45, 1.9275)


def ovh_dial(g, tag, x, yard, h):
    r = g['r']
    c = Vector(P(x, *OVH_MID))
    part('steel').tube(tuple(c), tuple(c + OVH_N * 0.012), r + 0.012, colour=srgb(0x2a2f31), sides=24)
    disc((x, OVH_MID[0], OVH_MID[1]), OVH_N, OVH_UP, r, g['tile'], proud=0.0135)


def ovh_screen(g, tag, x, yard, h):
    w, H = g['w'], g['H']
    c = Vector(P(x, *OVH_MID))
    r = OVH_UP.cross(OVH_N)
    p = part('dark')
    start = len(p.f)
    a, b, n = r * (w / 2 + 0.012), OVH_UP * (H / 2 + 0.012), OVH_N * 0.014
    lo = [c - a - b, c + a - b, c + a + b, c - a + b]
    p.grid([[tuple(q) for q in lo], [tuple(q + n) for q in lo]], DARK, close=True)
    p.polygon([tuple(q + n) for q in lo], DARK)
    p.polygon([tuple(q) for q in lo], DARK)
    p.orient(start, lambda q: q - (c + n * 0.5))
    pic((x, OVH_MID[0], OVH_MID[1]), OVH_N, OVH_UP, w, H, g['tile'], proud=0.0155)


def periscope(g, tag, x, yard, h):
    """The magnetic compass read from the helm: a tube down from the binnacle above, a mirror box, a glass."""
    box('dark', -0.11, 0.11, yard - 0.10, yard + 0.10, CEIL - 0.025, CEIL, DARK)
    tube('steel', (0.0, yard, CEIL - 0.03), (0.0, yard, 1.95), 0.025, GREY, 12)
    box('dark', -0.08, 0.08, yard - 0.08, yard + 0.08, 1.84, 1.95, DARK)
    tube('lens', (0.0, yard - 0.08, 1.895), (0.0, yard - 0.095, 1.895), 0.03, srgb(0xdfe6e1), 14)


# =====================================================================================================================
# The aft wall and the sides
# =====================================================================================================================
def wallbox(g, tag, x, yard, h):
    """A box on the aft wall with its picture on the front: a panel, a board with a door, a locker of pigeonholes."""
    w, H, d = g['w'], g['H'], g['d']
    col = srgb(g['colour'])
    box('console', x - w / 2, x + w / 2, yard + 0.001, yard + d, h, h + H, col)
    inset = 0.0 if g.get('open') else 0.006
    pic((x, yard + d, h + H / 2), FWD, UP, w - 2 * inset - 0.004, H - 2 * inset - 0.004, g['tile'])
    if g.get('handle'):
        box('steel', x + w / 2 - 0.035, x + w / 2 - 0.015, yard + d, yard + d + 0.025, h + H / 2 - 0.05, h + H / 2 + 0.05, GREY)
        for hh in (h + 0.08, h + H - 0.08):
            tube('steel', (x - w / 2 + 0.006, yard + d, hh - 0.03), (x - w / 2 + 0.006, yard + d, hh + 0.03), 0.008, GREY, 8)


def dial(g, tag, x, yard, h):
    """A brass bulkhead instrument on the aft wall."""
    r = g['r']
    tube('brass', (x, yard + 0.001, h), (x, yard + 0.035, h), r + 0.014, BRASS, 24, r + 0.010)
    tube('brass', (x, yard + 0.001, h), (x, yard + 0.012, h), r + 0.03, BRASS, 24)
    disc((x, yard + 0.035, h), FWD, UP, r, g['tile'])


def callpoint(g, tag, x, yard, h):
    box('console', x - 0.05, x + 0.05, yard + 0.001, yard + 0.04, h - 0.05, h + 0.05, srgb(g['colour']))
    pic((x, yard + 0.04, h), FWD, UP, 0.088, 0.088, g['tile'])


def chart_table(g, tag, x, yard, h):
    w, d, H = g['w'], g['d'], g['H']
    x0, x1, y0, y1 = x - w / 2, x + w / 2, AFT, AFT + d
    box('wood', x0, x1, y0, y1 - 0.01, 0.012, H - 0.03, tint(WOOD, 0.92))
    box('wood', x0 - 0.01, x1 + 0.01, y0, y1 + 0.01, H - 0.03, H, WOOD)
    for k in range(3):                                                          # drawers for folded charts, with a pull each
        hh = 0.10 + k * 0.27
        box('wood', x0 + 0.02, x1 - 0.02, y1 - 0.01, y1, hh, hh + 0.24, tint(WOOD, 1.08))
        box('brass', x - 0.07, x + 0.07, y1, y1 + 0.012, hh + 0.11, hh + 0.13, BRASS)
    for a, b, c, e in ((x0 - 0.01, x1 + 0.01, y0, y0 + 0.012), (x0 - 0.01, x0 + 0.002, y0, y1 + 0.01), (x1 - 0.002, x1 + 0.01, y0, y1 + 0.01)):
        box('wood', a, b, c, e, H, H + 0.025, WOOD)                             # a fiddle round three sides
    pic((x, yard + 0.01, H), UP, FWD, 0.88, 0.54, 'chart')
    # dividers and a parallel rule on the chart
    tube('brass', (x + 0.30, yard + 0.14, H + 0.006), (x + 0.20, yard + 0.02, H + 0.006), 0.004, BRASS, 6)
    tube('brass', (x + 0.30, yard + 0.14, H + 0.006), (x + 0.24, yard + 0.01, H + 0.006), 0.004, BRASS, 6)
    box('plastic', x - 0.34, x - 0.02, yard - 0.20, yard - 0.15, H + 0.002, H + 0.008, srgb(0x9aa7aa))


def chart_lamp(g, tag, x, yard, h):
    tube('steel', (x, yard, h), (x, yard, h + 0.03), 0.03, GREY, 12)
    tube('steel', (x, yard, h + 0.03), (x, yard, h + 0.30), 0.006, GREY, 6)
    tube('steel', (x, yard, h + 0.30), (x + 0.16, yard + 0.12, h + 0.26), 0.006, GREY, 6)
    tube('dark', (x + 0.16, yard + 0.12, h + 0.27), (x + 0.19, yard + 0.15, h + 0.20), 0.02, DARK, 10, 0.04)


def bookshelf(g, tag, x, yard, h):
    w, d, H = g['w'], g['d'], g['H']
    box('wood', x - w / 2 - 0.015, x + w / 2 + 0.015, yard + 0.001, yard + d, h - 0.02, h, WOOD)
    for sx in (-1, 1):
        box('wood', x + sx * (w / 2 + 0.015), x + sx * (w / 2), yard + 0.001, yard + d, h, h + H + 0.02, WOOD)
    box('paint', x - w / 2, x + w / 2, yard + 0.001, yard + d - 0.03, h, h + H, srgb(0x3a2c20))
    pic((x, yard + d - 0.03, h + H / 2), FWD, UP, w, H, 'books')
    tube('brass', (x - w / 2, yard + d - 0.01, h + 0.09), (x + w / 2, yard + d - 0.01, h + 0.09), 0.005, BRASS, 6)


def log_desk(g, tag, x, yard, h):
    """A fold-down desk under the port window, with a lamp and the deck log open on it."""
    w, d = g['w'], g['d']
    box('wood', X_IN - d, X_IN, yard - w / 2, yard + w / 2, h, h + 0.03, WOOD)
    for yy in (yard - w / 2 + 0.07, yard + w / 2 - 0.07):
        tube('steel', (X_IN, yy, h - 0.28), (X_IN - d + 0.10, yy, h), 0.012, GREY, 8)
    pic((X_IN - d / 2 - 0.02, yard, h + 0.03), UP, STBD, 0.34, 0.24, 'logbook')
    tube('steel', (X_IN - 0.05, yard + w / 2 - 0.08, h + 0.03), (X_IN - 0.05, yard + w / 2 - 0.08, h + 0.24), 0.007, GREY, 6)
    tube('dark', (X_IN - 0.05, yard + w / 2 - 0.08, h + 0.24), (X_IN - 0.16, yard + w / 2 - 0.16, h + 0.20), 0.03, DARK, 10, 0.012)


def locker(g, tag, x, yard, h):
    w, d, H = g['w'], g['d'], g['H']
    cream = srgb(0xd8d2c0)
    box('console', x - w / 2, x + w / 2, yard + 0.001, yard + d, 0.012, 0.08, FRAME)
    box('console', x - w / 2, x + w / 2, yard + 0.001, yard + d, 0.08, H, cream)
    box('console', x - w / 2 - 0.01, x + w / 2 + 0.01, yard + 0.001, yard + d + 0.01, H, H + 0.025, tint(WOOD, 1.0))
    n = 4
    for k in range(n):
        a, b = x - w / 2 + k * w / n + 0.01, x - w / 2 + (k + 1) * w / n - 0.01
        box('console', a, b, yard + d, yard + d + 0.008, 0.12, H - 0.04, tint(cream, 1.05))
        box('steel', (a + b) / 2 - 0.04, (a + b) / 2 + 0.04, yard + d + 0.008, yard + d + 0.02, H - 0.12, H - 0.105, GREY)


def extinguisher(g, tag, x, yard, h):
    col = srgb(g['colour'])
    if g.get('wall') == 'port':
        x = X_IN - 0.085
    tube('paint', (x, yard, h), (x, yard, h + 0.46), 0.075, col, 16)
    tube('paint', (x, yard, h + 0.46), (x, yard, h + 0.52), 0.075, col, 16, 0.03)
    tube('dark', (x, yard, h + 0.52), (x, yard, h + 0.58), 0.022, BLACK, 10)
    box('dark', x - 0.012, x + 0.012, yard - 0.02, yard + 0.10, h + 0.58, h + 0.60, BLACK)
    if g.get('horn'):
        tube('dark', (x + 0.03, yard + 0.03, h + 0.55), (x + 0.11, yard + 0.06, h + 0.36), 0.012, BLACK, 8)
        tube('dark', (x + 0.11, yard + 0.06, h + 0.36), (x + 0.12, yard + 0.07, h + 0.10), 0.02, BLACK, 10, 0.045)
    else:
        tube('dark', (x + 0.03, yard + 0.03, h + 0.55), (x + 0.09, yard + 0.03, h + 0.20), 0.009, BLACK, 6)
    box('steel', x - 0.085, x + 0.085, yard - 0.085, yard - 0.075, h + 0.28, h + 0.32, GREY)


def sart(g, tag, x, yard, h):
    side = g['side']
    xw = side * X_IN
    box('steel', xw, xw - side * 0.012, yard - 0.05, yard + 0.05, h - 0.02, h + 0.34, GREY)
    tube('plastic', (xw - side * 0.055, yard, h), (xw - side * 0.055, yard, h + 0.26), 0.038, ORANGE, 14)
    tube('plastic', (xw - side * 0.055, yard, h + 0.26), (xw - side * 0.055, yard, h + 0.32), 0.03, srgb(0xdfe6e1), 12, 0.022)
    for hh in (h + 0.05, h + 0.21):
        box('steel', xw - side * 0.10, xw, yard - 0.045, yard + 0.045, hh, hh + 0.012, GREY)


def handhelds(g, tag, x, yard, h):
    box('dark', x - 0.14, x + 0.14, yard + 0.001, yard + 0.06, h, h + 0.07, DARK)
    for k in range(3):
        xx = x - 0.09 + k * 0.09
        box('plastic', xx - 0.03, xx + 0.03, yard + 0.012, yard + 0.05, h + 0.03, h + 0.17, ORANGE if k == 1 else srgb(0xe0c020))
        box('dark', xx - 0.022, xx + 0.022, yard + 0.05, yard + 0.052, h + 0.10, h + 0.15, BLACK)
        tube('plastic', (xx - 0.015, yard + 0.03, h + 0.17), (xx - 0.015, yard + 0.03, h + 0.26), 0.006, BLACK, 6)


def aldis(g, tag, x, yard, h):
    xw = -X_IN
    box('steel', xw, xw + 0.012, yard - 0.04, yard + 0.04, h + 0.02, h + 0.30, GREY)
    tube('steel', (xw + 0.012, yard, h + 0.26), (xw + 0.07, yard, h + 0.26), 0.006, GREY, 6)
    tube('dark', (xw + 0.07, yard - 0.09, h + 0.18), (xw + 0.07, yard + 0.07, h + 0.18), 0.065, srgb(0x4a5456), 16)
    tube('lens', (xw + 0.07, yard + 0.07, h + 0.18), (xw + 0.07, yard + 0.078, h + 0.18), 0.058, srgb(0xdfe6e1), 16)
    tube('dark', (xw + 0.07, yard - 0.02, h + 0.115), (xw + 0.07, yard - 0.05, h), 0.016, BLACK, 8)
    box('dark', xw, xw + 0.03, yard - 0.03, yard + 0.03, h - 0.14, h - 0.07, DARK)          # its socket


def binoculars(g, tag, x, yard, h):
    box('wood', x - 0.10, x + 0.10, yard - 0.08, yard + 0.08, h, h + 0.10, WOOD)
    for sx in (-1, 1):
        tube('plastic', (x + sx * 0.035, yard, h + 0.06), (x + sx * 0.035, yard, h + 0.19), 0.028, BLACK, 12, 0.024)
        tube('lens', (x + sx * 0.035, yard, h + 0.19), (x + sx * 0.035, yard, h + 0.194), 0.02, srgb(0x56606a), 10)
    box('plastic', x - 0.02, x + 0.02, yard - 0.012, yard + 0.012, h + 0.12, h + 0.15, BLACK)


def stairwell(g, tag, x, yard, h):
    """The crew stair's head: a rail on its inboard side and a bar across the top."""
    x = -2.07
    for yd in (19.60, 20.15):
        tube('steel', (x, yd, 0.012), (x, yd, 1.0), 0.016, srgb(0xc9cfcf), 8)
    for hh in (0.5, 1.0):
        tube('steel', (x, 19.56, hh), (x, 20.16, hh), 0.014, srgb(0xc9cfcf), 8)
        tube('steel', (x, 20.16, hh), (-2.90, 20.16, hh), 0.014, srgb(0xc9cfcf), 8)
    tube('steel', (-2.88, 20.16, 0.012), (-2.88, 20.16, 1.0), 0.016, srgb(0xc9cfcf), 8)
    box('paint', -2.90, -2.14, 19.56, 19.58, 1.52, 1.64, srgb(0x1e8246))                     # over the opening: the way out
    pic((-2.52, 19.58, 1.58), FWD, UP, 0.30, 0.11, 'exit')


def ac_indoor(g, tag, x, yard, h):
    w, H, d = g['w'], g['H'], g['d']
    box('plastic', x - w / 2, x + w / 2, yard + 0.001, yard + d, h, h + H, WHITE)
    box('dark', x - w / 2 + 0.04, x + w / 2 - 0.04, yard + d - 0.06, yard + d + 0.002, h + 0.02, h + 0.05, srgb(0x4a5254))
    for k in range(5):
        box('plastic', x - w / 2 + 0.03, x + w / 2 - 0.03, yard + d, yard + d + 0.003, h + 0.10 + k * 0.03, h + 0.105 + k * 0.03, tint(WHITE, 0.85))
    tube('lens', (x + w / 2 - 0.06, yard + d, h + 0.075), (x + w / 2 - 0.06, yard + d + 0.004, h + 0.075), 0.006, GREENLENS, 8)


def sockets(g, tag, x, yard, h):
    for xx in g['xs']:
        box('plastic', xx - 0.05, xx + 0.05, yard - 0.012, yard, h - 0.04, h + 0.04, WHITE)
        tube('dark', (xx, yard - 0.012, h), (xx, yard - 0.016, h), 0.022, BLACK, 12)


def ceil(g, tag, x, yard, h):
    kind = g['type']
    if kind == 'light':
        w, l = g['w'], g['l']
        box('paint', x - w / 2, x + w / 2, yard - l / 2, yard + l / 2, CEIL - 0.03, CEIL, WHITE)
        box('lens', x - w / 2 + 0.02, x + w / 2 - 0.02, yard - l / 2 + 0.02, yard + l / 2 - 0.02, CEIL - 0.036, CEIL - 0.03, WHITE_LAMP)
    elif kind == 'red':
        for xx in g['xs']:
            tube('dark', (xx, yard, CEIL), (xx, yard, CEIL - 0.012), 0.05, DARK, 14)
            tube('lens', (xx, yard, CEIL - 0.012), (xx, yard, CEIL - 0.03), g['r'], RED, 12)
    elif kind == 'speaker':
        tube('paint', (x, yard, CEIL), (x, yard, CEIL - 0.012), g['r'], WHITE, 20)
        tube('dark', (x, yard, CEIL - 0.012), (x, yard, CEIL - 0.014), g['r'] * 0.8, srgb(0x4a5254), 20)
    elif kind == 'detector':
        tube('plastic', (x, yard, CEIL), (x, yard, CEIL - 0.02), g['r'], WHITE, 18)
        tube('plastic', (x, yard, CEIL - 0.02), (x, yard, CEIL - 0.045), g['r'] * 0.8, WHITE, 18, g['r'] * 0.45)
        tube('lens', (x + 0.03, yard, CEIL - 0.02), (x + 0.03, yard, CEIL - 0.024), 0.005, RED, 6)
    elif kind == 'emergency':
        w, l = g['w'], g['l']
        box('paint', x - w / 2, x + w / 2, yard - l / 2, yard + l / 2, CEIL - 0.04, CEIL, WHITE)
        box('lens', x - w / 2 + 0.015, x + w / 2 - 0.015, yard - l / 2 + 0.015, yard + l / 2 - 0.015, CEIL - 0.046, CEIL - 0.04, WHITE_LAMP)
        tube('lens', (x + w / 2 - 0.02, yard, CEIL - 0.046), (x + w / 2 - 0.02, yard, CEIL - 0.05), 0.005, GREENLENS, 6)
    elif kind == 'transit':
        w, l = g['w'], g['l']
        box('steel', x - w / 2, x + w / 2, yard - l / 2, yard + l / 2, CEIL - 0.02, CEIL, GREY)
        for i in range(4):
            for j in range(2):
                tube('dark', (x - 0.075 + i * 0.05, yard - 0.03 + j * 0.06, CEIL - 0.02), (x - 0.075 + i * 0.05, yard - 0.03 + j * 0.06, CEIL - 0.035), 0.016, BLACK, 8)


def grabrails(g, tag, x, yard, h):
    sx = g['side']
    tube('steel', (sx * 0.75, 20.30, h), (sx * 0.75, 22.05, h), 0.014, srgb(0xc9cfcf), 10)
    for yd in (20.35, 21.18, 22.0):
        tube('steel', (sx * 0.75, yd, h), (sx * 0.75, yd, CEIL), 0.008, GREY, 6)


def blinds(g, tag, x, yard, h):
    """A roller blind at the head of each forward window: the roll, and a hand's breadth of tinted film drawn down."""
    yd = FRONT_IN + fwd(HEAD) - 0.03
    for x0, x1 in PANES:
        tube('plastic', (x0 + 0.02, yd, 1.985), (x1 - 0.02, yd, 1.985), 0.022, srgb(0xd9d5c8), 10)
        part('glass').polygon([P(x0 + 0.04, yd - 0.004, 1.965), P(x1 - 0.04, yd - 0.004, 1.965), P(x1 - 0.04, yd - 0.022, 1.86), P(x0 + 0.04, yd - 0.022, 1.86)], srgb(0x1a2a2e))
        tube('steel', (x0 + 0.04, yd - 0.022, 1.86), (x1 - 0.04, yd - 0.022, 1.86), 0.006, GREY, 6)


def mullion_ducts(g, tag, x, yard, h):
    sx = g['side']
    x0, x1 = sx * MULLION_X - 0.035, sx * MULLION_X + 0.035
    prism('paint', x0, x1, [(FRONT_IN - 0.03 + fwd(SILL), 1.00), (FRONT_IN + fwd(SILL), 1.00), (FRONT_IN + fwd(HEAD), HEAD), (FRONT_IN - 0.03 + fwd(HEAD), HEAD)], tint(LINING, 0.93))
    box('paint', x0, x1, FRONT_IN + fwd(HEAD) - 0.03, FRONT_IN + fwd(HEAD), HEAD, CEIL, tint(LINING, 0.93))


def wiper(g, tag, x, yard, h):
    """A wiper on the outside of the raked glass, parked along the sill: the spindle, the arm, the blade."""
    yo = FRONT_OUT + 0.02
    tube('brass', (x - 0.27, FRONT_OUT - 0.01, SILL + 0.03), (x - 0.27, yo + 0.02, SILL + 0.03), 0.02, BRASS, 12)
    tube('steel', (x - 0.27, yo + 0.02, SILL + 0.03), (x + 0.25, yo + 0.03, SILL + 0.075), 0.006, GREY, 8)
    box('plastic', x - 0.20, x + 0.28, yo + 0.01, yo + 0.03, SILL + 0.06, SILL + 0.08, BLACK)
    box('console', x - 0.33, x - 0.21, FRONT_IN - 0.10, FRONT_IN, SILL - 0.13, SILL - 0.01, srgb(0x8a9392))       # the motor, under the sill inside the console


def nozzles(g, tag, x, yard, h):
    for xx in (-(_pane + 0.10), 0.0, _pane + 0.10):
        tube('brass', (xx - 0.36, FRONT_OUT, SILL - 0.02), (xx - 0.36, FRONT_OUT + 0.03, SILL - 0.02), 0.008, BRASS, 8)
        tube('brass', (xx - 0.36, FRONT_OUT + 0.03, SILL - 0.02), (xx - 0.36, FRONT_OUT + 0.035, SILL + 0.01), 0.005, BRASS, 6)
    tube('brass', (-1.52, FRONT_OUT + 0.012, SILL - 0.02), (2.62, FRONT_OUT + 0.012, SILL - 0.02), 0.006, BRASS, 6)


def whistle_valve(g, tag, x, yard, h):
    """The whistle valve under the deckhead, and its pull over the helm."""
    box('brass', x - 0.04, x + 0.04, yard - 0.05, yard + 0.05, h, CEIL, BRASS)
    tube('brass', (x, yard - 0.05, h + 0.05), (x, yard - 0.09, h + 0.05), 0.012, BRASS, 8)
    tube('steel', (x, yard + 0.05, h + 0.03), (x, yard + 0.30, h + 0.03), 0.003, GREY, 5)
    tube('steel', (x, yard + 0.30, h + 0.03), (x, yard + 0.30, h - 0.12), 0.003, GREY, 5)
    tube('wood', (x - 0.05, yard + 0.30, h - 0.13), (x + 0.05, yard + 0.30, h - 0.13), 0.012, WOOD, 8)


# =====================================================================================================================
# The wings
# =====================================================================================================================
def wing_console(g, tag, x, yard, h):
    side = g['side']
    x0, x1, y0, y1 = 3.10, 4.00, 22.425, 22.875
    xa, xb = sorted((side * x0, side * x1))
    box('console', xa, xb, y0 + 0.03, y1 - 0.03, 0.012, 0.10, FRAME)
    box('console', xa, xb, y0, y1, 0.10, 0.82, GREEN)
    prism('console', xa - 0.01, xb + 0.01, [(y0 - 0.02, 0.82), (y1 + 0.02, 0.82), (y1 + 0.02, 0.98), (y0 + 0.14, 0.88)], tint(GREEN, 1.08))
    xm = (xa + xb) / 2
    for dx, col in ((-0.28, RED), (-0.14, GREENLENS), (0.0, BLUE)):
        xx = xm + side * dx
        tube('steel', (xx, y0 + 0.13, 0.875), (xx, y0 + 0.13, 1.10), 0.011, GREY, 10)
        tube('plastic', (xx - 0.04, y0 + 0.13, 1.10), (xx + 0.04, y0 + 0.13, 1.10), 0.028, col, 12)
    slope = (0.98 - 0.88) / (y1 + 0.02 - (y0 + 0.14))
    nrm = Vector((0.0, 1.0, -slope)).normalized()
    upv = Vector((0.0, slope, 1.0)).normalized()
    for dx, name in ((0.18, 'rai'), (0.34, 'rpm')):
        ys = y0 + 0.30
        hs = 0.88 + (ys - (y0 + 0.14)) * slope
        c = Vector(P(xm + side * dx, ys, hs))
        part('brass').tube(tuple(c), tuple(c + nrm * 0.012), 0.072, colour=BRASS, sides=20)
        disc((xm + side * dx, ys, hs), tuple(nrm), tuple(upv), 0.062, name, proud=0.0135)
    # the watch alarm's reset and the whistle push, and a windscreen across the forward edge
    for dx, col in ((0.26, BLUE), (0.38, RED)):
        c = Vector(P(xm + side * dx, y0 + 0.16, 0.88 + 0.02 * slope))
        part('plastic').tube(tuple(c), tuple(c + nrm * 0.022), 0.016, colour=col, sides=12)
    for xs in (xa + 0.03, xb - 0.03):
        tube('steel', (xs, y1 - 0.02, 0.98), (xs, y1 - 0.02, 1.32), 0.012, GREY, 8)
    part('glass').polygon([P(xa + 0.03, y1 - 0.02, 1.00), P(xb - 0.03, y1 - 0.02, 1.00), P(xb - 0.03, y1 - 0.02, 1.30), P(xa + 0.03, y1 - 0.02, 1.30)], GLASS)


def sidelight(g, tag, x, yard, h):
    """A sidelight on the bulwark's rail at the wing's outer end: the lantern, and inboard of it the screen that cuts its light off across the bow."""
    side = g['side']
    xo = side * 4.13
    box('dark', xo - 0.035, xo + 0.035, yard - 0.035, yard + 0.035, 1.15, h + 0.02, STAND)
    tube('dark', (xo, yard, h + 0.02), (xo, yard, h + 0.06), 0.07, DARK, 16)
    tube('lens', (xo, yard, h + 0.06), (xo, yard, h + 0.19), 0.062, RED if side > 0 else GREENLENS, 16)
    tube('dark', (xo, yard, h + 0.19), (xo, yard, h + 0.23), 0.072, DARK, 16)
    # the screen: matt black, inboard of the lantern, 0.9 m long forward of it
    box('dark', xo - side * 0.085, xo - side * 0.10, yard - 0.10, 23.02, 1.15, h + 0.26, BLACK)
    box('dark', xo - side * 0.10, xo + side * 0.03, yard - 0.10, yard - 0.085, 1.15, h + 0.26, BLACK)


def epirb(g, tag, x, yard, h):
    box('steel', -X_OUT, -X_OUT - 0.035, yard - 0.07, yard + 0.07, 1.42, 1.82, GREY)
    tube('plastic', (x, yard, 1.48), (x, yard, 1.74), 0.062, ORANGE, 16)
    tube('plastic', (x, yard, 1.74), (x, yard, 1.80), 0.04, srgb(0xdfe6e1), 14)
    for hh in (1.55, 1.68):
        tube('steel', (x - 0.07, yard, hh), (x, yard, hh), 0.012, GREY, 8)


def pelorus(g, tag, x, yard, h):
    """A bearing repeater: a heading repeater in a bowl on a stand, under an azimuth ring with two sight vanes."""
    tube('wing', (x, yard, 0.012), (x, yard, 0.04), 0.16, tint(HOUSE, 0.9), 18)
    tube('wing', (x, yard, 0.04), (x, yard, 1.12), 0.07, HOUSE, 16, 0.055)
    tube('brass', (x, yard, 1.12), (x, yard, 1.22), 0.09, BRASS, 20, 0.125)
    disc((x, yard, 1.22), UP, FWD, 0.115, 'card')
    tube('brass', (x, yard, 1.22), (x, yard, 1.232), 0.128, BRASS, 24, 0.128)
    for sy in (-1, 1):
        box('brass', x - 0.004, x + 0.004, yard + sy * 0.122, yard + sy * 0.128, 1.232, 1.33, BRASS)


def lifebuoy(g, tag, x, yard, h):
    side = g['side']
    xc = side * 4.02
    torus('plastic', (xc, yard, h), 0.305, 0.06, ORANGE, axis='x')
    for k in range(4):                                                         # four bands of reflective tape
        a = k * pi / 2 + pi / 4
        box('paint', xc - 0.064, xc + 0.064, yard + 0.305 * cos(a) - 0.035, yard + 0.305 * cos(a) + 0.035, h + 0.305 * sin(a) - 0.064, h + 0.305 * sin(a) + 0.064, WHITE)
    box('steel', side * 4.10, side * 4.075, yard - 0.02, yard + 0.02, h + 0.28, h + 0.40, GREY)                 # its bracket
    # the light and smoke float beside it
    tube('plastic', (xc, yard + 0.50, 0.30), (xc, yard + 0.50, 0.72), 0.06, ORANGE, 14)
    tube('plastic', (xc, yard + 0.50, 0.72), (xc, yard + 0.50, 0.80), 0.045, WHITE, 12)
    box('steel', side * 4.10, side * 4.07, yard + 0.45, yard + 0.55, 0.36, 0.40, GREY)
    box('steel', side * 4.10, side * 4.07, yard + 0.45, yard + 0.55, 0.60, 0.64, GREY)


def hydrant(g, tag, x, yard, h):
    red = srgb(0xb8342a)
    tube('paint', (x + 0.06, yard, 0.012), (x + 0.06, yard, h), 0.04, red, 12)
    tube('paint', (x + 0.06, yard, h), (x + 0.06, yard, h + 0.12), 0.06, red, 14)
    tube('brass', (x + 0.06, yard, h + 0.05), (x + 0.20, yard, h - 0.02), 0.04, BRASS, 12)
    tube('brass', (x + 0.20, yard, h - 0.02), (x + 0.23, yard, h - 0.035), 0.05, BRASS, 12)
    tube('paint', (x + 0.06, yard, h + 0.12), (x + 0.06, yard, h + 0.22), 0.012, red, 8)
    torus('paint', (x + 0.06, yard, h + 0.22), 0.07, 0.01, red, axis='z', n=16, m=6)
    for k in range(3):
        a = k * 2 * pi / 3
        tube('paint', (x + 0.06, yard, h + 0.22), (x + 0.06 + 0.07 * cos(a), yard, h + 0.22 + 0.07 * sin(a)), 0.006, red, 5)


def hosebox(g, tag, x, yard, h):
    red = srgb(0xb8342a)
    box('paint', X_OUT, X_OUT + 0.22, yard - 0.26, yard + 0.26, h, h + 0.62, red)
    pic((X_OUT + 0.22, yard, h + 0.48), PORT, UP, 0.40, 0.15, 'hose')
    box('steel', X_OUT + 0.22, X_OUT + 0.235, yard + 0.20, yard + 0.23, h + 0.25, h + 0.35, GREY)


def scupper(g, tag, x, yard, h):
    box('dark', x - 0.07, x + 0.07, yard - 0.07, yard + 0.07, 0.012, 0.016, BLACK)
    for k in range(5):
        box('steel', x - 0.06, x + 0.06, yard - 0.055 + k * 0.026, yard - 0.045 + k * 0.026, 0.016, 0.019, GREY)


def wing_light(g, tag, x, yard, h):
    side = g['side']
    xw = side * X_OUT
    box('dark', xw, xw + side * 0.03, yard - 0.06, yard + 0.06, h - 0.08, h + 0.08, DARK)
    box('lens', xw + side * 0.03, xw + side * 0.075, yard - 0.045, yard + 0.045, h - 0.065, h + 0.065, WHITE_LAMP)
    for hh in (h - 0.035, h, h + 0.035):
        box('steel', xw + side * 0.03, xw + side * 0.08, yard - 0.05, yard + 0.05, hh - 0.003, hh + 0.003, GREY)


def talkback_station(g, tag, x, yard, h):
    side = g['side']
    xw = side * X_OUT
    box('paint', xw, xw + side * 0.07, yard - 0.06, yard + 0.06, h, h + 0.17, YELLOW)
    pic((xw + side * 0.07, yard, h + 0.085), (side, 0, 0), UP, 0.11, 0.16, 'talkback')


# =====================================================================================================================
# What the bridge adds to the compass deck (the viewer's part `top`)
# =====================================================================================================================
ROOF = REG.DECK_H


def nuc(g, tag, x, yard, h):
    tube('top', (0.06, yard, h + 0.04), (x, yard, h + 0.04), 0.012, HOUSE, 6)
    tube('top_dark', (x, yard, h), (x, yard, h + 0.05), 0.06, DARK, 14)
    tube('top_lens', (x, yard, h + 0.05), (x, yard, h + 0.16), 0.052, RED, 14)
    tube('top_dark', (x, yard, h + 0.16), (x, yard, h + 0.19), 0.06, DARK, 14)


def navtex_ant(g, tag, x, yard, h):
    tube('top_steel', (x, yard, ROOF), (x, yard, ROOF + 0.45), 0.014, srgb(S.ZINC), 8)
    tube('top', (x, yard, ROOF + 0.45), (x, yard, ROOF + 0.62), 0.03, HOUSE, 12)
    tube('top', (x, yard, ROOF + 0.62), (x, yard, ROOF + 1.05), 0.006, HOUSE, 6, 0.003)


def gnss_small(g, tag, x, yard, h):
    tube('top_steel', (x, yard, ROOF), (x, yard, ROOF + 0.30), 0.012, GREY, 8)
    _revolve(part('top'), P(x, yard, ROOF + 0.30), (0, 1, 0), [(0.0, 0.0), (0.0, 0.045), (0.03, 0.042), (0.05, 0.025), (0.06, 0.0)], HOUSE, sides=14)


def wind_sensor(g, tag, x, yard, h):
    tube('top_steel', (x, yard, h), (x, yard, h + 0.32), 0.008, GREY, 6)
    for k in range(3):                                                          # the cups
        a = k * 2 * pi / 3
        tube('top_steel', (x, yard, h + 0.32), (x + 0.07 * cos(a), yard + 0.07 * sin(a), h + 0.32), 0.003, GREY, 5)
        _revolve(part('top_dark'), P(x + 0.07 * cos(a), yard + 0.07 * sin(a), h + 0.32), (-sin(a), 0, cos(a)), [(0.0, 0.0), (0.012, 0.02), (0.02, 0.022), (0.021, 0.0)], BLACK, sides=8)
    tube('top_steel', (x, yard - 0.10, h + 0.24), (x, yard + 0.06, h + 0.24), 0.004, GREY, 5)      # the vane
    box('top_dark', x - 0.002, x + 0.002, yard - 0.14, yard - 0.07, h + 0.21, h + 0.27, BLACK)


def ac_outdoor(g, tag, x, yard, h):
    w, d, H = g['w'], g['d'], g['H']
    for sx in (-1, 1):
        box('top_steel', x + sx * (w / 2 - 0.08) - 0.03, x + sx * (w / 2 - 0.08) + 0.03, yard - d / 2, yard + d / 2, ROOF, ROOF + 0.08, GREY)
    box('top', x - w / 2, x + w / 2, yard - d / 2, yard + d / 2, ROOF + 0.08, ROOF + 0.08 + H, HOUSE)
    c = (x - 0.10, yard + d / 2, ROOF + 0.08 + H / 2)
    tube('top_dark', c, (c[0], c[1] + 0.012, c[2]), 0.21, srgb(0x394144), 20)
    for k in range(6):
        a = k * pi / 6
        tube('top_steel', (c[0] - 0.2 * cos(a), c[1] + 0.016, c[2] - 0.2 * sin(a)), (c[0] + 0.2 * cos(a), c[1] + 0.016, c[2] + 0.2 * sin(a)), 0.003, GREY, 4)


# =====================================================================================================================
KINDS = dict(
    console=console, stand=stand, display=display, flush=flush, facepanel=facepanel, lever=lever, phone=phone, sp_phone=sp_phone, navtex=navtex,
    box=hidden, overhead=overhead, ovh_dial=ovh_dial, ovh_screen=ovh_screen, periscope=periscope, wallbox=wallbox, dial=dial, callpoint=callpoint,
    chart_table=chart_table, chart_lamp=chart_lamp, bookshelf=bookshelf, log_desk=log_desk, locker=locker, extinguisher=extinguisher, sart=sart,
    handhelds=handhelds, aldis=aldis, binoculars=binoculars, stairwell=stairwell, ac_indoor=ac_indoor, sockets=sockets, ceil=ceil, grabrails=grabrails,
    blinds=blinds, mullion_ducts=mullion_ducts, wiper=wiper, nozzles=nozzles, whistle_valve=whistle_valve, wing_console=wing_console, sidelight=sidelight,
    epirb=epirb, pelorus=pelorus, lifebuoy=lifebuoy, hydrant=hydrant, hosebox=hosebox, scupper=scupper, wing_light=wing_light, talkback=talkback_station,
    nuc=nuc, navtex_ant=navtex_ant, gnss_small=gnss_small, wind_sensor=wind_sensor, ac_outdoor=ac_outdoor,
)


def build():
    _parts.clear()
    _extra.clear()
    MOTIONS.clear()
    for c in REG.COMPONENTS:
        g, kind = c['g'], c['g']['kind']
        if kind == 'none':
            continue
        x, yard, h = c['at']
        _hung[0] = kind in HUNG
        with component(c['id']):
            if kind == 'envelope':
                envelope()
            elif kind == 'ceiling':
                ceiling()
            elif kind == 'floor':
                floor()
            elif kind == 'wing':
                wing(g)
            elif kind == 'door_wing':
                door_wing(g, c['id'])
            elif kind == 'door_corridor':
                door_corridor(g, c['id'])
            elif kind == 'chair':
                chair(g, c['id'], x, yard)
            else:
                KINDS[kind](g, c['id'], x, yard, h)
    _hung[0] = False
    seen, blind, to = view_from_helm()
    print(f'glass seen from the helm: {seen:.0f} of 225 degrees, to {to:.0f} degrees each side; blind sectors wider than a mullion: {blind or "none"}')
    if seen < 220:
        raise SystemExit(f'the glass shows the helm {seen:.0f} of 225 degrees: a blind sector has opened at {blind}')
    out = list(_parts.values()) + _extra
    for p in out:
        p.smooth = False
    return out


def motion():
    """Each door turns on its hinge and opens for whoever comes near on foot."""
    inputs, movers = [], []
    for m in MOTIONS:
        inputs.append(dict(id=m['id'], name=m['name'], min=0, max=m['max'], step=1, unit='°', below='', above='open', rest='shut', auto='near',
                           at=m['at'], normal=m['normal'], reach=1.6))
        movers.append(dict(id=m['id'], kind='turn', input=m['id'], axis=[0, 1, 0], pivot=m['pivot'], ratio=m['ratio']))
    return inputs, movers
