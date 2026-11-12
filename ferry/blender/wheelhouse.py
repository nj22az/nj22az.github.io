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

The after wall below 2.08 m and the deck under it are the ship's (steel.py).

Drawn in the ship's axes (lines.py): x to port, y up from the waterline, z forward from amidships. Places below are as the
register gives them, in the bridge's own measures: x, `yard` (metres from the first Chisum's transom, where the bridge was
designed) and h (metres over the bridge deck). bridge_place.py carries them aboard the 68 m ship.
"""
import os, sys
from math import pi, cos, sin, radians, degrees, tan, atan, hypot
from mathutils import Vector
import lines as L
import spec as S
import shipyard
import bridge_place as BP
from shipyard import Part, srgb, tint, component, tile, lettering
from hull_appendages import _revolve

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'systems'))
import bridge as REG

DECK = BP.DECK                        # the bridge deck she stands on (bridge_place.py: the bridge's own measures are the first Chisum's)
W = BP.WING                           # the inner face of each wing's bulwark: the wings are carried to the ship's side
# The wheelhouse's heights over its deck. The owner, 11 November 2026, on raising the roof: "Yes make it realistic".
# It stood 2.055 m clear under a roof at 2.40 m, with the glass ending at 1.96 m and an overhead console hanging to 1.80 m,
# a tall helmsman's eye. Now: 2.30 m clear under the lining, a service void over it for the cable trays, the roof's
# structure from 2.42 m and its top (the compass deck) at 2.70 m; every window's glass and the wing doors' reach 2.00 m
# and more, and what hangs from the deckhead ahead of the helm hangs above the windows' head (yard/calc JS4-402).
HEAD_ROOM = 2.42                      # the roof's underside
CEIL = 2.30                           # the deckhead lining's underside: the clear height
LINING_T = 0.025                      # the lining panels; over them the void
OLD_HEAD = 2.08                       # where the other ship's aft wall ends: hers is carried up from there
SILL, HEAD, RAKE = 0.95, 2.10, tan(radians(10.0))
X_IN, X_OUT = 2.92, 3.00              # the house side, inside and out
AFT, FRONT_IN, FRONT_OUT = 19.545, 22.92, 23.00
CORNER = 22.82                        # where the side wall's last window ends and the forward corner begins

# Her colours as refitted (12 November 2026, yard/design/wheelhouse-refit.md): a real bridge's, not the site's teal and cream.
# The owner's two photographs of a ferry's wheelhouse (reference F3, F4) are the pattern: consoles in a strong marine blue
# with dark instrument fields, off-white linings over a dark skirting, a blue vinyl deck, the windows between light
# varnished wood with the glass in black rubber, stainless rails, black leather. What is the classic ship's own stays: the
# mahogany wheel and chart table, brass where there is brass.
HOUSE, LINING, CEILING = srgb(0xeeeae0), srgb(0xe8e6dd), srgb(0xefeee8)
BLUEC, DESK, ANOD, CASE = srgb(0x2c517c), srgb(0x24282b), srgb(0x17191b), srgb(0x7a8387)     # console enamel, desk tops, black cases, hammer grey
WOODL, SKIRT, RUBBER, JOINERY = srgb(0xc49a5e), srgb(0x2c3a4a), srgb(0x141516), srgb(0xeae8e0)  # light wood, skirting, rubber, white joinery
GREEN, CREAM, DARK, BRASS, WOOD = BLUEC, DESK, srgb(0x1b1e20), srgb(S.BRONZE), srgb(0x6b4429)
STAND, LEATHER, STEEL = srgb(0x6f787c), srgb(0x1d1d1f), srgb(S.STEEL)
FRAME, DOOR, SILLC = srgb(0x596168), srgb(0xdddcd4), srgb(0x6b7472)
RED, GREENLENS, WHITE_LAMP, BLUE = srgb(0xc2412f), srgb(0x2f9e5a), srgb(0xf6f1e2), srgb(0x4a6a8a)
GREY, BLACK, WHITE = srgb(0x7d8586), srgb(0x1a1f20), srgb(0xf2f0e8)
STAINLESS = srgb(0xc6ccce)
VINYL, MAT, WINGDECK, BOARD, ORANGE, YELLOW = srgb(0x4a6c96), srgb(0x1e2124), srgb(0x6f7d6c), srgb(0x9aa3a2), srgb(0xe8742a), srgb(0xe4d83c)
GLASS = srgb(0x2d4a55)

PARTS = dict(
    plating=('Wheelhouse, plating', 'Topside paint'), lining=('Wheelhouse, linings', 'Laminate'), frame=('Wheelhouse, window frames', 'Console paint'),
    glass=('Wheelhouse, window glass', 'Window glass'), floor=('Wheelhouse, deck covering', 'Vinyl deck'), seam=('Wheelhouse, panel seams', 'Marking'),
    console=('Wheelhouse, console', 'Marine enamel'), dark=('Wheelhouse, instruments', 'Matt black'), plastic=('Wheelhouse, plastics', 'Plastic'),
    steel=('Wheelhouse, steel', 'Stainless'), brass=('Wheelhouse, brass', 'Bronze'), wood=('Wheelhouse, wood', 'Varnished wood'),
    seat=('Wheelhouse, upholstery', 'Leather'), lens=('Wheelhouse, lamps and lenses', 'Lens'), screen=('Wheelhouse, screens', 'Screen picture'),
    face=('Wheelhouse, panel faces', 'Panel face'), paint=('Wheelhouse, painted fittings', 'Deck paint'), wing=('Wheelhouse, wing plating', 'Topside paint'),
    # the refit's own: desk tops, hammer-finish cases, black anodised cases, rubber, light wood, the deckhead's strips, the
    # skirting, the wings' painted deck, lit lamps
    desk=('Wheelhouse, desk tops', 'Matt black'), case=('Wheelhouse, equipment cases', 'Hammer finish'), anod=('Wheelhouse, black cases', 'Black anodised'),
    rubber=('Wheelhouse, rubber', 'Rubber'), lwood=('Wheelhouse, light wood', 'Light wood'), strip=('Wheelhouse, strips', 'Deckhead strip'),
    skirt=('Wheelhouse, skirting', 'Vinyl deck'), wingdeck=('Wheelhouse, wing deck', 'Deck paint'), lit=('Wheelhouse, lit lamps', 'Lit lamp'),
    cloth=('Wheelhouse, cloth', 'Cloth'),
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
    return (x, DECK + h, BP.Z(yard))


def fwd(h):
    """How far the raked forward wall has leaned forward at this height."""
    return (min(max(h, SILL), HEAD) - SILL) * RAKE


# What the house itself is made of is plate with square edges; everything fitted in it is a made thing, whose edges are
# chamfered and catch the light (JSY-STD-404, rule 2).
PLATE_KEYS = {'plating', 'lining', 'glass', 'floor', 'seam', 'wing', 'wingdeck'}


def box(key, x0, x1, yd0, yd1, h0, h1, colour, r=0.003):
    x0, x1 = sorted((x0, x1))
    yd0, yd1 = sorted((yd0, yd1))
    h0, h1 = sorted((h0, h1))
    p = key if isinstance(key, Part) else part(key)
    if key in PLATE_KEYS if isinstance(key, str) else False:
        p.box(P(x0, yd0, h0), P(x1, yd1, h1), colour)
    else:
        p.block(P(x0, yd0, h0), P(x1, yd1, h1), colour, r)


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


def tube(key, a, b, r, colour, sides=12, r2=None, caps=(True, True)):
    (key if isinstance(key, Part) else part(key)).tube(P(*a), P(*b), r, r2, colour=colour, sides=sides, caps=caps)


def vessel(key, a, b, r, colour, r2=None):
    """A length of a glass vessel (a bottle, a jar, a jug): its wall only. Glass is seen from both sides, so it has no end
    lying in the plane of what it stands on or of what closes it (JSY-STD-403, rule 8)."""
    tube(key, a, b, r, colour, r2=r2, caps=(False, False))


def torus(key, centre, big, small, colour, axis='z', n=28, m=10):
    """A ring about the fore-and-aft axis (a wheel) or the athwartships one (a lifebuoy against the bulwark)."""
    p = key if isinstance(key, Part) else part(key)
    p.ring(P(*centre), (0, 0, 1) if axis == 'z' else (1, 0, 0), big, small, colour)


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
            # A gate: a raised steel plate with a slot across the ship, and the stick standing in it on its ball. The
            # stick is a moving part (the panel is level: its face looks up).
            gate = part('steel')
            for z0, z1, x0, x1 in ((0.006, 0.018, -0.04, 0.04), (-0.018, -0.006, -0.04, 0.04), (-0.006, 0.006, 0.03, 0.04), (-0.006, 0.006, -0.04, -0.03)):
                gate.box(tuple(at + Vector((x0, 0.0, z0))), tuple(at + Vector((x1, 0.004, z1))), GREY)
            mv = _moving('Wheelhouse, tiller', 'tiller', steel='Shaft steel', grip='Plastic')
            _revolve(mv['steel'], tuple(at - n * 0.004), tuple(n), [(0.0, 0.0), (0.0, 0.0105), (0.006, 0.0105), (0.012, 0.007), (0.014, 0.0)], srgb(0x9aa2a3), sides=12)
            mv['steel'].tube(tuple(at + n * 0.008), tuple(at + n * 0.125), 0.0055, colour=GREY, sides=8)
            _revolve(mv['grip'], tuple(at + n * 0.115), tuple(n), [(0.0, 0.0), (0.0, 0.007), (0.01, 0.019), (0.035, 0.02), (0.05, 0.0)], BLACK, sides=12)
            LEVERS.append(dict(id='tiller', input='tiller', axis=[0, 0, 1], pivot=[float(v) for v in at]))
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
    side: [(19.65, 20.33, 1.10, 2.05, 'window'), (20.45, 21.25, 0.0, 2.05, 'door'), (21.30, 22.10, 0.97, 2.05, 'window'), (22.15, CORNER, 0.97, 2.05, 'window')]
    for side in (1, -1)
}
# The forward windows, x from and to: five alike between two corner posts of 0.06 m and four mullions of 0.10 m.
_pane = (2 * X_IN - 2 * 0.06 - 4 * 0.10) / 5
PANES = [(-X_IN + 0.06 + k * (_pane + 0.10), -X_IN + 0.06 + k * (_pane + 0.10) + _pane) for k in range(5)]
MULLION_X = PANES[2][1] + 0.05            # the mullion either side of the middle window, where the cable ducts come down
FRAME_T, STILE = 0.05, 0.06               # a window's frame, and the stile of a door's leaf beside its glass
HELM = (0.0, 20.9, 1.6)                   # the eye of a person standing at the wheel
EYES = (1.5, 1.8)                         # a short helmsman's eye and a tall one's: the glass must serve both
DOOR_GLASS = (0.95, 1.95)                 # the glazed part of a wing door's leaf


def view_from_helm(limit=112.5, mullion=6.0, eye=None):
    """
    How much of the horizon the glass shows a person standing at the wheel, doors shut, by the survey's own measure
    (ferry/design/bridge/findings.py): each pane's two edges as bearings from right ahead, gaps under 6 degrees taken as
    mullions the view goes on round, counted to 22.5 degrees abaft the beam on each side. Returns the degrees seen of 225
    and the blind sectors on one side (the two sides are alike).
    """
    from math import atan2, degrees
    ex, ey, eh = HELM
    eh = eye if eye is not None else eh
    front = FRONT_IN + 0.045 + fwd(eh)
    spans = [(degrees(atan2(a + FRAME_T - 0.005, front - ey)), degrees(atan2(b - FRAME_T + 0.005, front - ey))) for a, b in PANES if b > 0]
    spans[0] = (0.0, spans[0][1])
    for yd0, yd1, h0, h1, what in SIDES[1]:
        if what == 'window' and h0 + FRAME_T < eh < h1 - FRAME_T:
            a, b = yd0 + FRAME_T, yd1 - FRAME_T
        elif what == 'door' and DOOR_GLASS[0] < eh < DOOR_GLASS[1]:
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


AFT_FACE = 19.550                       # the face of the after wall's lining panels (the ship's own lining stands at 19.54: steel.py)


def _side_window(side, yd0, yd1, h0, h1):
    """A side window: the glass in black rubber; outside it a painted steel frame standing a little proud of the plating;
    inside a casing of light varnished wood, proud of the lining, and under it a wooden sill board."""
    t = FRAME_T
    bars = [(yd0, yd1, h0, h0 + t, 'low'), (yd0, yd1, h1 - t, h1, 'high'), (yd0, yd0 + t, h0 + t, h1 - t, 'aft'), (yd1 - t, yd1, h0 + t, h1 - t, 'fore')]
    for a, b, c, e, where in bars:
        # the part of the bar's breadth that is wood and steel (toward the wall) and the part that is rubber (toward the glass)
        if where in ('low', 'high'):
            wood = (a, b, c, c + 0.034) if where == 'low' else (a, b, e - 0.034, e)
            rub = (a + 0.034, b - 0.034, c + 0.034, e) if where == 'low' else (a + 0.034, b - 0.034, c, e - 0.034)
        else:
            wood = (a, a + 0.034, c, e) if where == 'aft' else (b - 0.034, b, c, e)
            rub = (a + 0.034, b, c, e) if where == 'aft' else (a, b - 0.034, c, e)
        box('lwood', side * 2.908, side * 2.952, wood[0], wood[1], wood[2], wood[3], WOODL, r=0.004)
        box('plating', side * 2.952, side * 3.008, wood[0], wood[1], wood[2], wood[3], tint(HOUSE, 0.97))
        box('rubber', side * 2.950, side * 2.980, rub[0], rub[1], rub[2], rub[3], RUBBER, r=0.004)
    x = side * 2.965
    part('glass').polygon([P(x, yd0 + t - 0.006, h0 + t - 0.006), P(x, yd1 - t + 0.006, h0 + t - 0.006), P(x, yd1 - t + 0.006, h1 - t + 0.006), P(x, yd0 + t - 0.006, h1 - t + 0.006)], GLASS)
    box('lwood', side * 2.862, side * 2.921, yd0 - 0.012, yd1 + 0.012, h0 - 0.030, h0, WOODL, r=0.006)             # the sill board


def _skirting(a, b, wall, inward, along='x'):
    """The vinyl of the deck turned up the wall as a coved skirting, 0.10 m high, between a and b along a wall: `wall` is
    where the lining's face stands, `inward` the way into the room (+1 or -1) across it."""
    arc = [(0.045 - 0.039 * cos(radians(q)), 0.051 - 0.039 * sin(radians(q))) for q in (90, 72, 54, 36, 18, 0)]
    prof = [(0.0, 0.012), (0.045, 0.012)] + arc + [(0.006, 0.100), (0.0, 0.100)]
    p = part('skirt')
    start = len(p.f)
    if along == 'x':
        ring = lambda x: [P(x, wall + inward * d, h) for d, h in prof]
    else:
        ring = lambda yd: [P(wall + inward * d, yd, h) for d, h in prof]
    p.grid([ring(a), ring(b)], SKIRT, close=True)
    for q in (a, b):
        p.polygon(ring(q), SKIRT)
    mid = Vector([sum(c) / len(c) for c in zip(*(ring(a) + ring(b)))])
    p.orient(start, lambda c: c - mid)


def _joint(a, b, normal, width=0.003):
    """A joint between two lining panels: a dark line from a to b on a face that looks along `normal`."""
    p = part('seam')
    A, B, n = Vector(P(*a)), Vector(P(*b)), Vector(normal)
    side = (B - A).cross(n).normalized() * (width / 2)
    start = len(p.f)
    p.polygon([tuple(A - side + n * 0.0008), tuple(B - side + n * 0.0008), tuple(B + side + n * 0.0008), tuple(A + side + n * 0.0008)], tint(LINING, 0.62))
    p.orient(start, tuple(n))


def envelope():
    # ---- the aft wall above the ship's own, which ends at the old deckhead: plating outside (the riser of the step in
    # the roof, where the lower house top meets it), lining inside up to the deckhead
    # (below 2.20 m the other ship's side walls stand at its ends: it stops 3 mm inside their faces, not in them)
    box('plating', -X_OUT + 0.003, X_OUT - 0.003, AFT - 0.05, AFT - 0.025, OLD_HEAD, 2.20, HOUSE)
    box('plating', -X_OUT, X_OUT, AFT - 0.05, AFT - 0.025, 2.20, HEAD_ROOM, HOUSE)
    box('lining', -X_IN, X_IN, AFT - 0.025, AFT_FACE, OLD_HEAD, HEAD_ROOM, LINING)
    # Below it the wall is the ship's (steel.py), lined in her own cream. The refit lays the bridge's laminate over that
    # lining, 10 mm thick (its face stands 10 mm before the ship's: JSY-STD-403, rule 5), round the corridor's doorway and
    # the crew stair's opening.
    for x0, x1, h0, h1 in ((0.40, X_IN, 0.012, OLD_HEAD), (-0.40, 0.40, 1.92, OLD_HEAD), (-2.12, -0.40, 0.012, OLD_HEAD), (-X_IN, -2.12, 1.50, OLD_HEAD)):
        box('lining', x0, x1, 19.54, AFT_FACE, h0, h1, LINING)
    for x in (-1.80, -1.20, -0.60, 0.60, 1.20, 1.80, 2.40):
        _joint((x, AFT_FACE, 0.11), (x, AFT_FACE, CEIL), FWD)
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
        # the mullion between the two forward side windows, and the post between the door and the window forward of it,
        # faced in the casings' wood; the panel joints below the sills
        for a, b in ((22.10, 22.15), (21.25, 21.30)):
            box('lwood', side * 2.908, side * 2.921, a, b, 0.97, 2.05, WOODL, r=0.0)
        for yd in (19.60, 21.275, 21.70, 22.125, 22.55):
            _joint((side * X_IN, yd, 0.11), (side * X_IN, yd, 0.94 if yd > 21.26 else 1.07), (-side, 0, 0))
        # the skirting: from the after wall to the door, and from the door to the front (to starboard the crew stair's well
        # takes the after corner)
        _skirting(AFT_FACE if side > 0 else 20.16, 20.45, side * X_IN, -side, along='yard')
        _skirting(21.25, FRONT_IN, side * X_IN, -side, along='yard')
    _skirting(-X_IN, X_IN, FRONT_IN, -1)
    _skirting(0.40, X_IN, AFT_FACE, 1)
    _skirting(-2.07, -0.40, AFT_FACE, 1)
    # ---- the front: plating below the sill, then posts, mullions, frames and glass raked forward, then the head
    box('plating', -X_IN, X_IN, FRONT_IN + 0.04, FRONT_OUT, 0.0, SILL, HOUSE)
    box('lining', -X_IN, X_IN, FRONT_IN, FRONT_IN + 0.04, 0.0, SILL, LINING)
    posts = [(-X_IN, PANES[0][0])] + [(a[1], b[0]) for a, b in zip(PANES, PANES[1:])] + [(PANES[-1][1], X_IN)]
    w = 0.031                                                   # how far a mullion's wood (and the frame's steel) reaches into the opening; then rubber
    for x0, x1 in posts:
        _raked('plating', x0, x1, 0.5, 1.0, SILL, HEAD, HOUSE)
        # the inner half of every post and mullion is light varnished wood, and stands 12 mm proud of the lining below it
        _raked('lwood', max(x0 - w, -X_IN), min(x1 + w, X_IN), -0.15, 0.5, SILL, HEAD, WOODL)
        _joint(((x0 + x1) / 2, FRONT_IN, 0.11), ((x0 + x1) / 2, FRONT_IN, SILL - 0.04), AFTWARD)
    head = [(FRONT_IN + fwd(HEAD), HEAD), (FRONT_OUT + fwd(HEAD), HEAD), (FRONT_OUT + fwd(HEAD), HEAD_ROOM - 0.05), (FRONT_IN + fwd(HEAD), HEAD_ROOM - 0.05)]
    prism('plating', -X_IN, X_IN, [(y + 0.04 if i in (0, 3) else y, h) for i, (y, h) in enumerate(head)], HOUSE)
    prism('lining', -X_IN, X_IN, [(y if i in (0, 3) else y - 0.04, h) for i, (y, h) in enumerate(head)], LINING)
    t = 0.045
    for x0, x1 in PANES:
        # the wooden rails under and over the glass, between the mullions; the steel frame outside; the rubber the glass sits in
        _raked('lwood', x0 + w, x1 - w, -0.15, 0.5, SILL, SILL + w, WOODL)
        _raked('lwood', x0 + w, x1 - w, -0.15, 0.5, HEAD - w, HEAD, WOODL)
        _raked('plating', x0, x1, 0.62, 1.10, SILL, SILL + w + 0.002, tint(HOUSE, 0.97))
        _raked('plating', x0, x1, 0.62, 1.10, HEAD - w - 0.002, HEAD, tint(HOUSE, 0.97))
        for a, b in ((x0, x0 + w + 0.002), (x1 - w - 0.002, x1)):
            _raked('plating', a, b, 0.62, 1.10, SILL + w + 0.002, HEAD - w - 0.002, tint(HOUSE, 0.97))
        _raked('rubber', x0 + w - 0.002, x1 - w + 0.002, 0.42, 0.70, SILL + w - 0.002, SILL + t, RUBBER)
        _raked('rubber', x0 + w - 0.002, x1 - w + 0.002, 0.42, 0.70, HEAD - t, HEAD - w + 0.002, RUBBER)
        for a, b in ((x0 + w - 0.002, x0 + t), (x1 - t, x1 - w + 0.002)):
            _raked('rubber', a, b, 0.42, 0.70, SILL + t, HEAD - t, RUBBER)
        yg = lambda h: FRONT_IN + 0.045 + fwd(h)
        g = 0.006                                               # the glass goes this far into its rubber
        part('glass').polygon([P(x0 + t - g, yg(SILL + t - g), SILL + t - g), P(x1 - t + g, yg(SILL + t - g), SILL + t - g),
                               P(x1 - t + g, yg(HEAD - t + g), HEAD - t + g), P(x0 + t - g, yg(HEAD - t + g), HEAD - t + g)], GLASS)
    # the sill board along the front, under the wooden rails: light wood, 60 mm into the room
    box('lwood', -X_IN, X_IN, FRONT_IN - 0.060, FRONT_IN + 0.001, SILL - 0.032, SILL, WOODL, r=0.006)
    # the visor: the roof's eave carried forward over the glass
    box('plating', -3.08, 3.08, 23.09, 23.46, HEAD_ROOM - 0.05, HEAD_ROOM, HOUSE)
    prism('plating', -3.08, 3.08, [(23.40, HEAD_ROOM - 0.05), (23.46, HEAD_ROOM - 0.05), (23.46, HEAD_ROOM - 0.11), (23.44, HEAD_ROOM - 0.11)], tint(HOUSE, 0.94))


STRIP, STRIP_GAP = 0.185, 0.015         # the deckhead's strips: their breadth fore and aft, and the shadow gap between two


def ceiling():
    """The deckhead: long narrow strips of off-white panel running athwartships, 2.30 m over the deck, a shadow gap between
    each two; over them a dark backing, and over that the void the cable trays lie in. (It was one slab with seams painted
    on it.)"""
    end = FRONT_IN + fwd(HEAD)
    box('lining', -X_IN, X_IN, AFT, end, CEIL + 0.012, CEIL + LINING_T, srgb(0x2a2c2e))
    yd = AFT_FACE
    while yd < end - 0.02:
        box('strip', -X_IN, X_IN, yd, min(yd + STRIP, end), CEIL, CEIL + 0.012, CEILING, r=0.004)
        yd += STRIP + STRIP_GAP


def floor():
    """The deck covering: blue sheet vinyl, its sheets welded along two seams; rubber mats where one stands to conn her."""
    box('floor', -2.12, X_IN, AFT, FRONT_IN, 0.0, 0.012, VINYL)
    box('floor', -X_IN, -2.12, 20.15, FRONT_IN, 0.0, 0.012, VINYL)
    p = part('seam')
    start = len(p.f)
    for x in (-1.0, 1.0):                                                     # the welds between the sheets
        p.polygon([P(x - 0.002, AFT + 0.05, 0.0128), P(x + 0.002, AFT + 0.05, 0.0128), P(x + 0.002, FRONT_IN - 0.05, 0.0128), P(x - 0.002, FRONT_IN - 0.05, 0.0128)], tint(VINYL, 0.8))
    p.orient(start, UP)
    for x0, x1, a, b in ((-0.55, 0.55, 20.55, 21.40), (0.62, 1.48, 21.82, 22.24), (-1.48, -0.62, 21.82, 22.24)):
        box('rubber', x0, x1, a, b, 0.012, 0.020, MAT, r=0.003)
        n = int((b - a - 0.06) / 0.035)
        for k in range(n):                                                    # the mat's ribs, athwartships
            box('rubber', x0 + 0.02, x1 - 0.02, a + 0.03 + k * 0.035, a + 0.048 + k * 0.035, 0.020, 0.0235, tint(MAT, 1.25), r=0.0012)
    box('console', -0.05, 0.05, 21.98, 22.30, 0.012, 0.03, FRAME)             # the floor trunk from the console to the stand


def wing(g):
    side = g['side']
    box('wingdeck', side * X_OUT, side * W, 19.50, 22.94, 0.0, 0.012, WINGDECK)
    box('wing', side * W, side * (W + 0.06), 19.50, FRONT_OUT, 0.0, 1.10, HOUSE)                     # the bulwark outboard
    box('wing', side * X_OUT, side * W, 22.94, FRONT_OUT, 0.0, 1.10, HOUSE)                    # and across the forward end
    for yd in (20.1, 20.7, 21.3, 21.9, 22.5):                                                     # its stays
        prism('wing', side * (W - 0.01), side * W, [(yd - 0.004, 0.012), (yd + 0.004, 0.012), (yd + 0.004, 1.10), (yd - 0.004, 1.10)], tint(HOUSE, 0.92))
        prism('wing', side * (W - 0.08), side * W, [(yd - 0.004, 0.012), (yd + 0.004, 0.012), (yd + 0.004, 0.30), (yd - 0.004, 0.30)], tint(HOUSE, 0.92))
    box('wood', side * (W - 0.06), side * (W + 0.09), 19.50, 23.03, 1.10, 1.15, WOOD)                         # the rail
    box('wood', side * X_OUT, side * (W - 0.06), 22.91, 23.03, 1.10, 1.15, WOOD)


# =====================================================================================================================
# Doors
# =====================================================================================================================
MOTIONS = []


def door_wing(g, tag):
    """A weathertight door in the house side: a lining, a 0.15 m coaming sill, a leaf hinged on its forward edge that opens outward.
    The opening is 2.01 m high and the leaf is glazed from 0.95 to 1.95 m: a tall helmsman sees abeam through it."""
    side, (yd0, yd1) = g['side'], g['yd']
    name = 'port' if side > 0 else 'starboard'
    mover = f'door-wing-{name[0]}'
    xi, xo = side * X_IN, side * X_OUT
    for a, b in ((yd0, yd0 + 0.04), (yd1 - 0.04, yd1)):
        box('frame', xi, xo, a, b, 0.15, 2.01, FRAME)
    box('frame', xi, xo, yd0, yd1, 2.01, 2.05, FRAME)
    box('paint', side * 2.88, side * 3.07, yd0, yd1, 0.004, 0.15, SILLC)       # its foot in the deck covering, not in one plane with the covering's underside
    leaf = Part(f'Wheelhouse, wing door, {name}', 'Deck paint', mover=mover)
    glass = Part(f'Wheelhouse, wing door glass, {name}', 'Window glass', mover=mover)
    fit = Part(f'Wheelhouse, wing door hardware, {name}', 'Bronze', mover=mover)
    a, b = yd0 + 0.04, yd1 - 0.04
    xa, xb = side * 2.95, side * 2.99
    box(leaf, xa, xb, a, b, 0.15, 0.95, DOOR)
    box(leaf, xa, xb, a, b, DOOR_GLASS[1], 2.01, DOOR)
    box(leaf, xa, xb, a, a + STILE, DOOR_GLASS[0], DOOR_GLASS[1], DOOR)
    box(leaf, xa, xb, b - STILE, b, DOOR_GLASS[0], DOOR_GLASS[1], DOOR)
    box(leaf, side * 2.99, side * 3.005, a + 0.01, b - 0.01, 0.15, 0.31, tint(DOOR, 0.55))
    glass.polygon([P(side * 2.97, a + STILE, 0.95), P(side * 2.97, b - STILE, 0.95), P(side * 2.97, b - STILE, DOOR_GLASS[1]), P(side * 2.97, a + STILE, DOOR_GLASS[1])], GLASS)
    for xs, d in ((side * 2.99, 1), (side * 2.95, -1)):
        box(fit, xs, xs + side * d * 0.045, a + 0.03, a + 0.06, 0.98, 1.08, BRASS)
        box(fit, xs + side * d * 0.03, xs + side * d * 0.05, a + 0.015, a + 0.12, 1.03, 1.06, BRASS)
    for hh in (0.35, 1.80):
        tube(fit, (side * 2.97, b, hh - 0.06), (side * 2.97, b, hh + 0.06), 0.016, BRASS, 10)
    for p in (leaf, glass, fit):
        p.group = 'bridge'
        _extra.append(p)
    MOTIONS.append(dict(id=mover, name=f'Door to the {name} wing', pivot=[side * 2.97, 0.0, BP.Z(b)], ratio=-1.0 * side, max=100,
                        at=[side * 3.0, DECK, BP.Z((yd0 + yd1) / 2)], normal=[side, 0, 0]))


def door_corridor(g, tag):
    """The door from the crew corridor, in the aft wall's opening: hinged to starboard, it opens into the wheelhouse."""
    mover = 'door-corridor'
    for sx in (-1, 1):
        box('frame', sx * 0.40, sx * 0.36, 19.46, 19.545, 0.0, 1.92, FRAME)
    box('frame', -0.40, 0.40, 19.46, 19.545, 1.88, 1.92, FRAME)
    leaf = Part('Wheelhouse, corridor door', 'Lining', mover=mover)
    fit = Part('Wheelhouse, corridor door hardware', 'Shaft steel', mover=mover)
    glass = Part('Wheelhouse, corridor door glass', 'Window glass', mover=mover)
    cream = JOINERY
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
    MOTIONS.append(dict(id=mover, name='Door from the corridor to the wheelhouse', pivot=[-0.365, 0.0, BP.Z(19.535)], ratio=-1.0, max=92,
                        at=[0.0, DECK, BP.Z(19.50)], normal=[0, 0, 1]))


# =====================================================================================================================
# The console, the stand, the chairs
# =====================================================================================================================
def console(g, tag, *where):
    box('console', -2.70, 2.70, 22.34, 22.92, 0.012, 0.08, FRAME)
    box('console', -2.75, 2.75, 22.30, 22.92, 0.08, 0.97, GREEN)
    box('desk', -2.76, 2.76, 22.29, 22.92, 0.97, 1.00, DESK)
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
    tube('steel', (-2.65, 22.25, 1.02), (2.65, 22.25, 1.02), 0.014, STAINLESS, 10)
    for x in (-2.6, -1.3, 0.0, 1.3, 2.6):
        tube('steel', (x, 22.25, 1.02), (x, 22.30, 0.985), 0.008, GREY, 6)
    tube('steel', (-2.6, 22.22, 0.20), (2.6, 22.22, 0.20), 0.016, GREY, 10)
    for x in (-2.5, -0.9, 0.9, 2.5):
        tube('steel', (x, 22.22, 0.20), (x, 22.31, 0.20), 0.01, GREY, 6)


def stand(g, tag, *where):
    box('case', -0.32, 0.32, 21.48, 22.02, 0.012, 0.10, STAND)
    box('case', -0.28, 0.28, 21.52, 21.98, 0.10, 0.95, STAND)
    box('desk', -0.31, 0.31, 21.49, 22.01, 0.95, 0.98, DESK)
    # The wheel is one moving part on its shaft: it turns with the rudder order, four degrees for one of rudder, and its
    # king spoke (the one with the brass cap) stands upright when the rudders are amidships.
    c = (0.0, 21.42, 1.05)
    mv = _moving('Wheelhouse, steering wheel', 'wheel', wood='Varnished wood', brass='Bronze', shaft='Shaft steel')
    torus(mv['wood'], c, 0.29, 0.022, WOOD)
    tube(mv['brass'], (0, 21.385, 1.05), (0, 21.455, 1.05), 0.055, BRASS, 16)
    # The helm unit, on the stand's top at its after edge. The owner, 11 November 2026: "The wheel is not connected to anything
    # in the wheelhouse": it hung on a stub of shaft that ended in the air, 4 cm over the stand. The shaft now turns with the
    # wheel and runs through a flanged bearing into the unit, where it turns the two transmitters (one for each control
    # system) and, through a reduction, the pointer under the glass on the unit's lid, which shows the rudder ordered.
    hx, ha, hb, h0, h1 = 0.11, 21.50, 21.63, 0.98, 1.135
    box('case', -hx, hx, ha, hb, h0, h1 - 0.012, STAND)
    box('desk', -hx + 0.008, hx - 0.008, ha + 0.008, hb - 0.008, h1 - 0.012, h1, DESK)               # its lid
    for x in (-hx + 0.02, hx - 0.02):                                                                               # held down to the stand
        for yd in (ha + 0.02, hb - 0.02):
            tube('steel', (x, yd, h1), (x, yd, h1 + 0.004), 0.006, GREY, 8)
    tube('steel', (0, ha - 0.012, 1.05), (0, ha, 1.05), 0.064, GREY, 20)                                             # the bearing's flange
    tube('steel', (0, ha - 0.034, 1.05), (0, ha - 0.012, 1.05), 0.040, GREY, 16)                                     # and its boss
    for i in range(6):
        a = i * pi / 3 + pi / 6
        tube('steel', (0.052 * cos(a), ha - 0.018, 1.05 + 0.052 * sin(a)), (0.052 * cos(a), ha - 0.012, 1.05 + 0.052 * sin(a)), 0.006, STEEL, 6)
    tube(mv['shaft'], (0, 21.455, 1.05), (0, ha + 0.04, 1.05), 0.019, STEEL, 14)                                      # the shaft, into the unit
    disc((0.0, (ha + hb) / 2, h1), UP, FWD, 0.045, 'rai')                                                            # the rudder ordered
    for i in range(8):
        a = i * pi / 4
        d = (cos(a), sin(a))
        tube(mv['wood'], (0.05 * d[0], 21.42, 1.05 + 0.05 * d[1]), (0.36 * d[0], 21.42, 1.05 + 0.36 * d[1]), 0.012, WOOD, 8, 0.016)
        tube(mv['wood'], (0.29 * d[0], 21.42, 1.05 + 0.29 * d[1]), (0.37 * d[0], 21.42, 1.05 + 0.37 * d[1]), 0.016, WOOD, 8)
    tube(mv['brass'], (0, 21.42, 1.05 + 0.37), (0, 21.42, 1.05 + 0.385), 0.0175, BRASS, 10)
    tube(mv['brass'], (0, 21.42, 1.05 + 0.312), (0, 21.42, 1.05 + 0.324), 0.0178, BRASS, 10)
    LEVERS.append(dict(id='wheel', input='rudder', axis=[0, 0, 1], pivot=list(P(*c)), ratio=4.0))


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
        # each armrest's post stands in a lug on the seat's frame (it stood 6 mm clear of the seat: blender/afloat.py)
        box('steel', x + sx * 0.235, x + sx * 0.282, yard - 0.16, yard - 0.08, 0.63, 0.70, GREY)
        tube('steel', (x + sx * 0.26, yard - 0.12, 0.66), (x + sx * 0.26, yard - 0.12, 0.90), 0.014, GREY, 8)
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


# ---------------------------------------------------------------------------------------------------------------------
# Levers. A lever is a moving part: it turns on its shaft, in its slot, when it is worked (motion()).
# ---------------------------------------------------------------------------------------------------------------------
LEVERS = []                         # this build's lever motions: the part's name, what works it, its shaft
PLATE = 0.065                       # a control head's slotted plate stands this far over the lever's shaft
NOTCH = 0.14 * 39 / 288             # the distance between the marks of the engine scale (its picture, 0.14 m long)
THRUST = 0.13 * 57 / 288            # and of the thruster scale
ORDERS = ('full astern', 'half astern', 'slow astern', 'stop', 'slow ahead', 'half ahead', 'full ahead')
THRUSTS = ('full thrust to port', 'half thrust to port', 'stopped', 'half thrust to starboard', 'full thrust to starboard')


def lever_notches(across=False):
    """The lever's angle in degrees at each mark of its scale: the arm crosses the slotted plate exactly at the mark."""
    marks, pitch = ((-2, -1, 0, 1, 2), THRUST) if across else (range(-3, 4), NOTCH)
    return [round(degrees(atan(k * pitch / PLATE)), 2) for k in marks]


# What can be worked by a tap: its name, the fitting of the register it belongs to, its positions and what each means.
CONTROLS = [
    dict(id='lever-engine-p', name='Port engine lever', fitting='PRP-01', home=3, steps=[dict(v=a, say=o) for a, o in zip(lever_notches(), ORDERS)]),
    dict(id='lever-engine-s', name='Starboard engine lever', fitting='PRP-02', home=3, steps=[dict(v=a, say=o) for a, o in zip(lever_notches(), ORDERS)]),
    dict(id='lever-thruster', name='Bow thruster lever', fitting='PRP-03', home=2, steps=[dict(v=a, say=o) for a, o in zip(lever_notches(True), THRUSTS)]),
    dict(id='tiller', name='Tiller', fitting='STR-03', home=1,
         steps=[dict(v=-24.0, say='held to port: the rudders go to port until it is let go'), dict(v=0.0, say='let go: the rudders stay where they are'),
                dict(v=24.0, say='held to starboard: the rudders go to starboard until it is let go')]),
]


def _moving(title, mover, **looks):
    """The parts of one thing that moves, one for each look it needs: the viewer turns them together (the file's `movers`)."""
    parts = {key: Part(f'{title}, {key}', look, mover=mover) for key, look in looks.items()}
    for part_ in parts.values():
        part_.group = 'bridge'
        _extra.append(part_)
    return parts


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

    def block(key, u0, u1, va, vb, h0, h1, col):
        (xa, ya), (xb, yb) = at(u0, va), at(u1, vb)
        box(key, xa, xb, ya, yb, h0, h1, col)

    lo = base - sink
    block('dark', -half_l, half_l, -half_w, v0, lo, top, DARK)                  # the housing: four blocks round the slot
    block('dark', -half_l, half_l, v1, half_w, lo, top, DARK)
    block('dark', run, half_l, v0, v1, lo, top, DARK)
    block('dark', -half_l, -run, v0, v1, lo, top, DARK)
    for va, vb in ((v0 - 0.003 * s, v0), (v1, v1 + 0.003 * s)):                 # the slot's steel lips
        block('steel', -run - 0.003 * s, run + 0.003 * s, va, vb, top, top + 0.0015, GREY)
    for u0, u1 in ((run, run + 0.003 * s), (-run - 0.003 * s, -run)):
        block('steel', u0, u1, v0, v1, top, top + 0.0015, GREY)
    long, wide = ((0.13, 0.05) if across else (0.14, 0.055))                    # the scale, its marks against the slot
    cx, cy = at(0.0, v0 - (0.005 + wide / 2) * s)
    pic((cx, cy, top), UP, FWD, (long if across else wide) * s, (wide if across else long) * s, 'thr_scale' if across else 'lever_scale')

    mv = _moving(title, mover, steel='Shaft steel', grip='Plastic', drum='Machinery paint')
    (ax0, ay0), (ax1, ay1) = at(0.0, v0 + 0.001 * s), at(0.0, v1 - 0.001 * s)
    tube(mv['drum'], (ax0, ay0, piv), (ax1, ay1, piv), (PLATE - 0.007) * s, srgb(0x2b3032), 24)
    px, py = at(0.0, vs)
    tube(mv['steel'], (px, py, piv + (PLATE - 0.010) * s), (px, py, piv + (PLATE + 0.014) * s), 0.0075 * s, srgb(0x9aa2a3), 10)      # the arm's boss on the drum
    tube(mv['steel'], (px, py, piv + 0.05 * s), (px, py, piv + 0.16 * s), 0.0055 * s, GREY, 10)
    (gx0, gy0), (gx1, gy1) = at(0.0, vs - 0.045 * s), at(0.0, vs + 0.045 * s)
    tube(mv['grip'], (gx0, gy0, piv + 0.16 * s), (gx1, gy1, piv + 0.16 * s), 0.022 * s, colour, 14)
    LEVERS.append(dict(id=mover, input=works, axis=[0, 0, 1] if across else [1, 0, 0], pivot=list(P(px, py, piv))))


LEVER_OF = {'PRP-01': ('Wheelhouse, port engine lever', 'lever-engine-p'), 'PRP-02': ('Wheelhouse, starboard engine lever', 'lever-engine-s'),
            'PRP-03': ('Wheelhouse, bow thruster lever', 'lever-thruster')}


def lever(g, tag, x, yard, h):
    """An engine or thruster control lever on the console. Its grip's top is 0.19 m over the console: the sea is seen over it (JS4-402)."""
    title, works = LEVER_OF[tag]
    control_head(title, works, works, x, yard, h, srgb(g['colour']), across=bool(g.get('across')))


def phone(g, tag, x, yard, h):
    flush(g, tag, x, yard, h)
    handset(x + g['w'] / 2 - 0.045, yard - 0.06, h + 0.004)


def sp_phone(g, tag, x, yard, h):
    """The sound-powered telephone: a grey box with its handset on top and a calling crank at its side."""
    box('case', x - 0.08, x + 0.08, yard - 0.10, yard + 0.12, h, h + 0.10, CASE)
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
    box('case', x - w / 2, x + w / 2, yard - d / 2, yard + d / 2, h, h + H, CASE)
    box('dark', x - w / 2 + 0.02, x + w / 2 - 0.02, yard - d / 2 - 0.004, yard - d / 2, h + H * 0.25, h + H * 0.55, BLACK)


def overhead(g, tag, x, yard, h):
    """
    The overhead console: a sloped panel under the deckhead, its face looking aft and down. It hangs wholly above the
    windows' head: its lowest edge, 2.06 m over the deck, is over the line from a tall helmsman's eye to the top of the
    glass, so it hides nothing that the glass would show (the first one hung to 1.80 m, that eye's own height).
    """
    prof = [(22.36, CEIL), (22.68, CEIL), (22.68, h + 0.06), (22.50, h)]
    prism('console', -1.50, 1.50, prof, tint(GREEN, 0.95))
    for sx in (-1, 1):
        box('console', sx * 1.50, sx * 1.52, 22.35, 22.69, h - 0.01, CEIL, tint(GREEN, 0.8))


OVH_UP = Vector((0.0, 0.24, -0.14)).normalized()          # up the console's face, from its lower edge to the deckhead
OVH_N = Vector((0.0, -0.14, -0.24)).normalized()          # and the way the face looks: down and aft
OVH_MID = (22.43, 2.18)                                    # the middle of the face: (metres from the transom, over the deck)


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
    """The magnetic compass read from the helm: a tube down from the binnacle above, a mirror box, a glass. The box hangs
    above the line from a tall helmsman's eye to the top of the forward glass: it is glanced up at, not looked round."""
    box('dark', -0.11, 0.11, yard - 0.10, yard + 0.10, CEIL - 0.025, CEIL, DARK)
    tube('steel', (0.0, yard, CEIL - 0.025), (0.0, yard, h + 0.11), 0.025, GREY, 12)
    box('dark', -0.08, 0.08, yard - 0.08, yard + 0.08, h, h + 0.11, DARK)
    tube('lens', (0.0, yard - 0.08, h + 0.055), (0.0, yard - 0.095, h + 0.055), 0.03, srgb(0xdfe6e1), 14)


# =====================================================================================================================
# The aft wall and the sides
# =====================================================================================================================
def wallbox(g, tag, x, yard, h):
    """A box on the aft wall with its picture on the front: a panel, a board with a door, a locker of pigeonholes."""
    w, H, d = g['w'], g['H'], g['d']
    col = srgb(g['colour'])
    box('case' if not g.get('open') else 'wood', x - w / 2, x + w / 2, yard + 0.001, yard + d, h, h + H, col)
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
    box('case', x - 0.05, x + 0.05, yard + 0.001, yard + 0.04, h - 0.05, h + 0.05, srgb(g['colour']))
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
    cream = JOINERY
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
    if g.get('wall') == 'port':
        box('steel', x - 0.085, x + 0.085, yard - 0.085, yard - 0.075, h + 0.28, h + 0.32, GREY)
    else:
        # hung on the aft wall: a strap round the cylinder on a bracket that reaches the wall, 10 cm behind its middle
        box('steel', x - 0.085, x + 0.085, yard - 0.10, yard - 0.072, h + 0.28, h + 0.32, GREY)
        box('steel', x - 0.02, x + 0.02, yard - 0.10, yard - 0.072, h + 0.08, h + 0.12, GREY)


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
    """
    The crew stair's head: a rail along its inboard side, and across the top, where one comes up out of it, a self-closing
    gate of two bars. The first drawing had those bars fixed: nobody could have come up the stair (found when the stairs
    were walked, checks/stairs.cjs). The gate hangs on the outboard post and opens forward, away from the well.
    """
    x = -2.07
    rail = STAINLESS
    for yd in (19.60, 20.15):
        tube('steel', (x, yd, 0.012), (x, yd, 1.0), 0.016, rail, 8)
    for hh in (0.5, 1.0):
        tube('steel', (x, 19.56, hh), (x, 20.16, hh), 0.014, rail, 8)
    tube('steel', (-2.88, 20.16, 0.012), (-2.88, 20.16, 1.0), 0.016, rail, 8)
    mv = _moving('Wheelhouse, crew stair gate', 'gate-crew-stair', steel='Shaft steel', grip='Plastic')
    for hh in (0.5, 1.0):
        tube(mv['steel'], (-2.86, 20.16, hh), (x - 0.03, 20.16, hh), 0.014, rail, 8)
    tube(mv['steel'], (x - 0.03, 20.16, 0.5), (x - 0.03, 20.16, 1.0), 0.012, rail, 8)                 # its closing stile
    tube(mv['steel'], (-2.86, 20.16, 0.5), (-2.86, 20.16, 1.0), 0.012, rail, 8)                      # and the hinge stile
    box(mv['grip'], x - 0.20, x - 0.03, 20.150, 20.170, 0.70, 0.80, srgb(0xe2b93b))                  # a yellow plate on the closing stile: push
    MOTIONS.append(dict(id='gate-crew-stair', name='Gate at the head of the crew stair', pivot=[-2.86, 0.0, BP.Z(20.16)], ratio=-1.0, max=95,
                        at=[-2.50, DECK, BP.Z(20.16)], normal=[0, 0, 1], reach=1.3))
    box('paint', -2.90, -2.14, 19.54, 19.56, 1.52, 1.64, srgb(0x1e8246))                     # over the opening, on the wall: the way out
    pic((-2.52, 19.56, 1.58), FWD, UP, 0.30, 0.11, 'exit')


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
        box('lit', x - w / 2 + 0.02, x + w / 2 - 0.02, yard - l / 2 + 0.02, yard + l / 2 - 0.02, CEIL - 0.036, CEIL - 0.03, WHITE_LAMP)
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
    tube('steel', (sx * 0.75, 20.30, h), (sx * 0.75, 22.05, h), 0.014, STAINLESS, 10)
    for yd in (20.35, 21.18, 22.0):
        tube('steel', (sx * 0.75, yd, h), (sx * 0.75, yd, CEIL), 0.008, GREY, 6)


def blinds(g, tag, x, yard, h):
    """A roller blind at the head of each forward window, rolled up: the roll, and its bottom bar with a finger's breadth
    of tinted film showing, inside the depth of the window's head frame. Rolled up it hangs over none of the glass (the
    first ones hung 4 cm over its top: the yard's calculation JS4-402 found them)."""
    yd = FRONT_IN + fwd(HEAD) - 0.03
    low = HEAD - 0.03                                           # the glass ends at HEAD - 0.045
    for x0, x1 in PANES:
        tube('plastic', (x0 + 0.02, yd, HEAD + 0.03), (x1 - 0.02, yd, HEAD + 0.03), 0.02, srgb(0xd9d5c8), 10)
        part('glass').polygon([P(x0 + 0.04, yd - 0.004, HEAD + 0.012), P(x1 - 0.04, yd - 0.004, HEAD + 0.012), P(x1 - 0.04, yd - 0.012, low), P(x0 + 0.04, yd - 0.012, low)], srgb(0x1a2a2e))
        tube('steel', (x0 + 0.04, yd - 0.012, low), (x1 - 0.04, yd - 0.012, low), 0.006, GREY, 6)
        for xb in (x0 + 0.012, x1 - 0.028):                     # the roll's brackets, on the wall over the glass: its ends stand in them
            box('steel', xb, xb + 0.016, yd - 0.022, yd + 0.031, HEAD + 0.008, HEAD + 0.052, GREY)


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
    box('case', x - 0.33, x - 0.21, FRONT_IN - 0.10, FRONT_IN, SILL - 0.13, SILL - 0.01, CASE)       # the motor, under the sill inside the console


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
    """
    A wing control station: a pedestal 0.63 m wide against the wing's forward bulwark, at its outboard end, with a sloping
    top and a low windscreen. The levers are outboard, where the person berthing her stands: from there the eye is far
    enough out to see past the house's forward corner to 45 degrees on the opposite bow (SOLAS V/22.1.4; the yard's
    calculation JS4-402 found the first station, across the whole wing with its levers inboard, 13.5 degrees short).
    The levers stand in the order they have on the console, port engine to port, on both wings.
    """
    side = g['side']
    x0, x1, y0, y1 = abs(x) - 0.315, abs(x) + 0.315, yard - 0.17, yard + 0.17
    xa, xb = sorted((side * x0, side * x1))
    at = lambda u: side * (x0 + u)                                   # u metres from the pedestal's inboard edge
    box('console', xa, xb, y0 + 0.03, y1 - 0.03, 0.012, 0.10, FRAME)
    box('console', xa, xb, y0, y1, 0.10, 0.82, GREEN)
    prism('console', xa - 0.01, xb + 0.01, [(y0 - 0.02, 0.82), (y1 + 0.02, 0.82), (y1 + 0.02, 0.98), (y0 + 0.14, 0.88)], tint(GREEN, 1.08))
    # Three control heads of three-quarter size, sunk into the sloping top: the two engines outboard, fore and aft, the
    # thruster nearest the person, across. Each lever moves with its fellow on the console and on the other wing.
    where = 'Port wing' if side > 0 else 'Starboard wing'
    tail = '-wp' if side > 0 else '-ws'
    for u, col, name, works in zip((0.56, 0.44) if side > 0 else (0.44, 0.56), (RED, GREENLENS), ('port engine lever', 'starboard engine lever'), ('lever-engine-p', 'lever-engine-s')):
        control_head(f'{where}, {name}', works + tail, works, at(u), y0 + 0.13, 0.89, col, s=0.77, sink=0.05)
    control_head(f'{where}, bow thruster lever', 'lever-thruster' + tail, 'lever-thruster', at(0.20), y0 + 0.085, 0.875, BLUE, across=True, s=0.77, sink=0.05)
    slope = (0.98 - 0.88) / (y1 + 0.02 - (y0 + 0.14))
    nrm = Vector((0.0, 1.0, -slope)).normalized()
    upv = Vector((0.0, slope, 1.0)).normalized()
    for u, name in ((0.09, 'rai'), (0.25, 'rpm')):
        ys = y0 + 0.265
        hs = 0.88 + (ys - (y0 + 0.14)) * slope
        c = Vector(P(at(u), ys, hs))
        part('brass').tube(tuple(c), tuple(c + nrm * 0.012), 0.072, colour=BRASS, sides=20)
        disc((at(u), ys, hs), tuple(nrm), tuple(upv), 0.062, name, proud=0.0135)
    # the watch alarm's reset and the whistle push on the lip, between the thruster's head and the engines'; and a
    # windscreen across the forward edge
    lip = Vector((0.0, 1.0, -0.375)).normalized()
    for dy, col in ((0.06, BLUE), (0.125, RED)):
        c = Vector(P(at(0.33), y0 + dy, 0.82 + (dy + 0.02) * 0.375))
        part('plastic').tube(tuple(c), tuple(c + lip * 0.022), 0.016, colour=col, sides=12)
    for xs in (xa + 0.03, xb - 0.03):
        tube('steel', (xs, y1 - 0.02, 0.98), (xs, y1 - 0.02, 1.32), 0.012, GREY, 8)
    part('glass').polygon([P(xa + 0.03, y1 - 0.02, 1.00), P(xb - 0.03, y1 - 0.02, 1.00), P(xb - 0.03, y1 - 0.02, 1.30), P(xa + 0.03, y1 - 0.02, 1.30)], GLASS)


def sidelight(g, tag, x, yard, h):
    """A sidelight on the bulwark's rail at the wing's outer end: the lantern, and inboard of it the screen that cuts its light off across the bow."""
    side = g['side']
    xo = side * (W + 0.03)
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


def oval_ring(p, centre, side, R, a, b, colour, n=96, m=32):
    """A ring that lies against a wall which looks athwartships, its face toward whoever stands inboard of it: its section an
    oval, `a` across (along the ring's radius) and `b` thick. `colour` is one colour or a function of the length's number
    (0 to n - 1, counted anticlockwise from the right as it is looked at). Lit smooth."""
    c = Vector(P(*centre))
    e_a = Vector((-side, 0.0, 0.0))                                           # toward the eye
    rows = []
    for i in range(n):
        t = 2 * pi * i / n
        e_r = Vector((0.0, sin(t), side * cos(t)))                            # outward along the radius: right is forward to port, aft to starboard
        row = []
        for k in range(m):
            q = 2 * pi * k / m
            nrm = (e_r * (cos(q) / a) + e_a * (sin(q) / b)).normalized()
            row.append(p.vert(tuple(c + e_r * (R + a * cos(q)) + e_a * (b * sin(q))), tuple(nrm)))
        rows.append(row)
    start = len(p.f)
    for i in range(n):
        ra, rb = rows[i], rows[(i + 1) % n]
        col = colour(i) if callable(colour) else colour
        for k in range(m):
            j = (k + 1) % m
            p.face((ra[k], ra[j], rb[j], rb[k]), col, smooth=True)

    def away(q):
        v = Vector(q) - c
        v.x = 0.0
        v.normalize()
        return Vector(q) - (c + v * R)
    p.orient(start, away)


def in_pieces(tri, longest):
    """A flat triangle (three (u, v) points) as smaller ones, none with an edge longer than `longest`."""
    out, todo = [], [tuple(tri)]
    while todo:
        a_, b_, c_ = todo.pop()
        if max(hypot(a_[0] - b_[0], a_[1] - b_[1]), hypot(b_[0] - c_[0], b_[1] - c_[1]), hypot(c_[0] - a_[0], c_[1] - a_[1])) <= longest:
            out.append((a_, b_, c_))
            continue
        ab, bc, ca = ((a_[0] + b_[0]) / 2, (a_[1] + b_[1]) / 2), ((b_[0] + c_[0]) / 2, (b_[1] + c_[1]) / 2), ((c_[0] + a_[0]) / 2, (c_[1] + a_[1]) / 2)
        todo += [(a_, ab, ca), (ab, b_, bc), (ca, bc, c_), (ab, bc, ca)]
    return out


def at_ring(centre, side, r, t, lift=0.0):
    """A point on such a ring's middle plane: r from its centre, at the angle t (anticlockwise from the right as it is looked at)."""
    cx, cy, cz = P(*centre)
    return (cx - side * lift, cy + r * sin(t), cz + side * r * cos(t))


def pelorus(g, tag, x, yard, h):
    """
    A bearing repeater on its pelorus stand, as one meets it on a bridge wing: a column bolted to the deck by a flange; a
    junction box on the column with the cable that comes up from the deck; a brass fork on the column's head; in the fork a
    gimbal ring, and in the ring the weighted bowl, so that the card lies level when she rolls; the card under glass in a
    bezel; and on the bezel the azimuth circle, turned by hand, with its two sight vanes (the far one a wire in a frame,
    the near one a slit) and two knobs to turn it by.
    """
    side = g['side']
    white, brass, steel, dark = part('wing'), part('brass'), part('steel'), part('dark')
    # ---- the foot and the column
    tube('wing', (x, yard, 0.012), (x, yard, 0.030), 0.170, tint(HOUSE, 0.88))
    for k in range(6):
        a = pi / 6 + k * pi / 3
        bx, by = x + 0.140 * cos(a), yard + 0.140 * sin(a)
        tube('steel', (bx, by, 0.030), (bx, by, 0.033), 0.017, GREY)                                  # a washer
        tube('steel', (bx, by, 0.033), (bx, by, 0.043), 0.011, STEEL)                                 # and its bolt's head
    tube('wing', (x, yard, 0.030), (x, yard, 0.080), 0.098, tint(HOUSE, 0.94), r2=0.077)              # the weld's taper
    tube('wing', (x, yard, 0.080), (x, yard, 1.020), 0.076, HOUSE, r2=0.056)
    tube('wing', (x, yard, 1.020), (x, yard, 1.050), 0.066, tint(HOUSE, 0.94))
    # ---- the junction box on the column's after side, its lid's four screws, its gland and the cable from the deck
    grey = srgb(0x8d9496)
    box('dark', x - 0.060, x + 0.060, yard - 0.128, yard - 0.060, 0.50, 0.66, grey, r=0.006)
    box('dark', x - 0.054, x + 0.054, yard - 0.134, yard - 0.128, 0.506, 0.654, tint(grey, 0.93), r=0.002)   # its lid
    for sx, hh in ((-0.046, 0.514), (0.046, 0.514), (-0.046, 0.646), (0.046, 0.646)):
        tube('steel', (x + sx, yard - 0.134, hh), (x + sx, yard - 0.137, hh), 0.0035, STEEL)
    tube('brass', (x, yard - 0.094, 0.50), (x, yard - 0.094, 0.470), 0.013, BRASS)                    # the gland under it
    tube('brass', (x, yard - 0.094, 0.470), (x, yard - 0.094, 0.462), 0.010, tint(BRASS, 0.8))
    part('plastic').rod([P(x, yard - 0.094, 0.465), P(x, yard - 0.094, 0.20), P(x, yard - 0.150, 0.06), P(x, yard - 0.190, 0.035), P(x, yard - 0.190, 0.012)], 0.0065, BLACK)
    tube('brass', (x, yard - 0.190, 0.012), (x, yard - 0.190, 0.040), 0.014, BRASS)                   # the deck gland the cable comes up through
    # the dimmer for the card's lamp, on the column's inboard side
    tube('dark', (x - side * 0.060, yard, 0.92), (x - side * 0.074, yard, 0.92), 0.020, BLACK)
    tube('dark', (x - side * 0.074, yard, 0.92), (x - side * 0.090, yard, 0.92), 0.013, srgb(0x3a4042))
    # ---- the fork, the gimbal ring and the bowl
    box('brass', x - 0.168, x + 0.168, yard - 0.020, yard + 0.020, 1.050, 1.068, BRASS, r=0.004)
    for sx in (-1, 1):
        box('brass', x + sx * 0.151, x + sx * 0.168, yard - 0.020, yard + 0.020, 1.064, 1.222, BRASS, r=0.004)
        tube('brass', (x + sx * 0.174, yard, 1.200), (x + sx * 0.136, yard, 1.200), 0.0065, tint(BRASS, 0.85))      # the ring's pivot through the arm
        brass.ball(P(x + sx * 0.176, yard, 1.200), 0.011, BRASS)
    brass.ring(P(x, yard, 1.200), UP, 0.137, 0.0075, BRASS)
    for sy in (-1, 1):
        tube('brass', (x, yard + sy * 0.138, 1.200), (x, yard + sy * 0.124, 1.200), 0.0065, tint(BRASS, 0.85))      # the bowl's pivots in the ring
    tube('brass', (x, yard, 1.072), (x, yard, 1.096), 0.046, tint(BRASS, 0.78))                                  # the weight that keeps it upright
    tube('brass', (x, yard, 1.096), (x, yard, 1.200), 0.062, BRASS, r2=0.126)
    disc((x, yard, 1.200), UP, FWD, 0.117, 'card', sides=56)
    tube('glass', (x, yard, 1.2050), (x, yard, 1.2080), 0.119, GLASS)
    brass.ring(P(x, yard, 1.2080), UP, 0.1225, 0.0065, BRASS)                                                     # the bezel
    # ---- the azimuth circle: a ring that turns on the bezel, with the far vane, the near vane and two knobs
    old = tint(BRASS, 0.86)
    brass.ring(P(x, yard, 1.2165), UP, 0.1290, 0.0045, old)
    f = yard + 0.129                                                                                              # the far vane: a wire in a frame
    for sx in (-1, 1):
        box('brass', x + sx * 0.0125 - 0.0022, x + sx * 0.0125 + 0.0022, f - 0.0022, f + 0.0022, 1.2165, 1.332, old)
    box('brass', x - 0.0147, x + 0.0147, f - 0.0022, f + 0.0022, 1.3276, 1.332, old)
    tube('steel', (x, f, 1.2165), (x, f, 1.3280), 0.0008, BLACK)
    n = yard - 0.129                                                                                              # the near vane: a slit to look through
    for sx in (-1, 1):
        box('brass', x + sx * 0.0075 - 0.0060, x + sx * 0.0075 + 0.0060, n - 0.0022, n + 0.0022, 1.2165, 1.300, old)
    box('brass', x - 0.0135, x + 0.0135, n - 0.0022, n + 0.0022, 1.2956, 1.300, old)
    box('dark', x - 0.016, x + 0.016, n - 0.011, n + 0.011, 1.2165, 1.238, BLACK, r=0.003)                          # the prism's housing at its foot
    for sx in (-1, 1):
        tube('brass', (x + sx * 0.129, yard, 1.2165), (x + sx * 0.129, yard, 1.2330), 0.0095, old)
        brass.ball(P(x + sx * 0.129, yard, 1.2335), 0.0105, old, squash=0.6)


def lifebuoy(g, tag, x, yard, h):
    """
    A lifebuoy as it hangs on a ship: an oval-sectioned ring in orange with four reflective bands, her name over its top
    and her port under it, a grab line round the outside in four bights, in a bracket of flat and round bar bolted to the
    bulwark (a clip over the top, a hook under each lower quarter). Beside it the man-overboard light and smoke float in its
    own clamps, made fast to the ring by a lanyard: thrown together from the wing.
    """
    side = g['side']
    R, a, b = 0.300, 0.080, 0.050
    xc = side * (W - 0.075)
    centre = (xc, yard, h)
    band = lambda i: abs(((i + 0.5) * 360.0 / 96 + 45.0) % 90.0 - 45.0) > 41.0
    oval_ring(part('plastic'), centre, side, R, a, b, lambda i: tint(WHITE, 0.98) if band(i) else ORANGE)
    # ---- her name and her port, painted on the ring's face and following it round
    for text, top in ((S.NAME, True), (S.PORT_OF_REGISTRY, False)):
        pts, tris, width = lettering(text, 0.052)
        paint = part('seam')

        def onto(u, v):
            r, t = (R - 0.026 + v, pi / 2 - (u - width / 2) / R) if top else (R + 0.026 - v, 3 * pi / 2 + (u - width / 2) / R)
            lift = b * max(0.0, 1.0 - ((r - R) / a) ** 2) ** 0.5 + 0.0006
            return paint.vert(at_ring(centre, side, r, t, lift))
        first = len(paint.f)
        for tri in tris:
            # A letter is paint on a curved face: a flat piece of it would cut under the curve, so each is laid on in
            # pieces no longer than 5 mm, every corner on the ring.
            for piece in in_pieces([pts[i] for i in tri], 0.005):
                paint.face(tuple(onto(*q) for q in piece), BLACK)
        paint.orient(first, (-side, 0, 0))
    # ---- the grab line: made fast under each band, hanging in a bight between
    rope = part('plastic')
    for k in range(4):
        t0, t1 = radians(45 + 90 * k + 5), radians(135 + 90 * k - 5)
        pts = []
        for i in range(15):
            u = i / 14
            pts.append(at_ring(centre, side, R + a + 0.0035 + 0.085 * sin(pi * u) ** 0.8, t0 + (t1 - t0) * u))
        rope.rod(pts, 0.0048, srgb(0xf4f1e6))
    # ---- its bracket: an upright of flat bar on the bulwark with a cross bar, a clip over the ring's top, a hook under each lower quarter
    box('steel', side * W, side * (W - 0.006), yard - 0.025, yard + 0.025, h - 0.44, h + 0.44, GREY, r=0.002)
    box('steel', side * W, side * (W - 0.006), yard - 0.24, yard + 0.24, h - 0.285, h - 0.245, GREY, r=0.002)
    for hh in (h - 0.40, h + 0.40):
        tube('steel', (side * (W - 0.006), yard, hh), (side * (W - 0.012), yard, hh), 0.009, STEEL)                 # the bolts through the bulwark
    out = xc - side * (b + 0.016)                                                                                   # just inboard of the ring's face
    top = h + R + a + 0.0045
    part('steel').rod([P(side * W, yard, top), P(out, yard, top), P(out, yard, top - 0.045)], 0.0055, STEEL)
    for sy in (-1, 1):
        low = h - (R + a) * cos(radians(30)) - 0.0045
        yq = yard + sy * (R + a) * sin(radians(30))
        part('steel').rod([P(side * W, yq, h - 0.265), P(side * W - side * 0.02, yq, low), P(out, yq, low), P(out, yq, low + 0.045)], 0.0055, STEEL)
    # ---- the light and smoke float, forward of it: its canister, its lamp, its two clamps, its lanyard to the ring
    yc = yard + 0.50
    tube('dark', (xc, yc, 0.285), (xc, yc, 0.315), 0.0585, BLACK)                                                   # its weighted foot
    tube('plastic', (xc, yc, 0.315), (xc, yc, 0.660), 0.055, ORANGE)
    tube('plastic', (xc, yc, 0.455), (xc, yc, 0.545), 0.0565, YELLOW)                                               # its instruction band
    tube('plastic', (xc, yc, 0.660), (xc, yc, 0.695), 0.055, ORANGE, r2=0.034)
    tube('dark', (xc, yc, 0.695), (xc, yc, 0.708), 0.036, BLACK)
    part('lens').ball(P(xc, yc, 0.708), 0.033, WHITE_LAMP, squash=0.85)
    for hh in (0.375, 0.605):
        part('steel').ring(P(xc, yc, hh), UP, 0.0585, 0.0045, STEEL)
        box('steel', side * W, side * (W - 0.024), yc - 0.020, yc + 0.020, hh - 0.012, hh + 0.012, GREY, r=0.002)
        box('steel', side * (W - 0.118), side * (W - 0.134), yc - 0.012, yc + 0.012, hh - 0.010, hh + 0.010, STEEL, r=0.002)   # the clamp's catch
    part('plastic').rod([P(xc - side * 0.030, yc, 0.700), P(xc - side * 0.040, yc - 0.030, 0.800), P(xc - side * 0.030, yc - 0.075, 0.740),
                         at_ring(centre, side, R + a + 0.002, 0.0)], 0.003, ORANGE)


def hydrant(g, tag, x, yard, h):
    """
    A fire hydrant on the wing: a riser up through the deck in a bolted flange, clamped to the house side; an angle valve
    with its bonnet, gland and handwheel; the outlet looking down and outboard with a brass hose coupling and its cap on a
    chain.
    """
    red = srgb(0xb8342a)
    px = x + 0.06
    paint, brass, steel = part('paint'), part('brass'), part('steel')
    tube('paint', (px, yard, 0.012), (px, yard, 0.030), 0.085, red)
    for k in range(4):
        a = pi / 4 + k * pi / 2
        tube('steel', (px + 0.066 * cos(a), yard + 0.066 * sin(a), 0.030), (px + 0.066 * cos(a), yard + 0.066 * sin(a), 0.040), 0.009, STEEL)
    tube('paint', (px, yard, 0.030), (px, yard, h - 0.045), 0.032, red)
    # the clamp that holds the riser to the house side
    box('steel', X_OUT, px - 0.030, yard - 0.020, yard + 0.020, 0.300, 0.318, GREY, r=0.003)
    steel.ring(P(px, yard, 0.309), UP, 0.0345, 0.0055, GREY)
    # the valve: body, bonnet, gland nut, stem, handwheel
    paint.ball(P(px, yard, h), 0.062, red)
    tube('paint', (px, yard, h + 0.045), (px, yard, h + 0.060), 0.058, red)                                         # the bonnet's flange
    tube('paint', (px, yard, h + 0.060), (px, yard, h + 0.130), 0.038, red, r2=0.030)
    tube('brass', (px, yard, h + 0.130), (px, yard, h + 0.156), 0.021, BRASS)
    tube('steel', (px, yard, h + 0.156), (px, yard, h + 0.262), 0.0075, STEEL)
    paint.ring(P(px, yard, h + 0.236), UP, 0.085, 0.0085, red)
    tube('paint', (px, yard, h + 0.224), (px, yard, h + 0.248), 0.021, red)
    for k in range(4):
        a = pi / 4 + k * pi / 2
        tube('paint', (px + 0.018 * cos(a), yard + 0.018 * sin(a), h + 0.236), (px + 0.084 * cos(a), yard + 0.084 * sin(a), h + 0.236), 0.0065, red)
    tube('brass', (px, yard, h + 0.248), (px, yard, h + 0.262), 0.013, BRASS)                                       # the nut on the stem
    # the outlet, 30 degrees down and outboard, its coupling and its cap on a chain
    ox, oh = cos(radians(30)), -sin(radians(30))
    along = lambda d: (px + ox * d, yard, h + oh * d)
    tube('paint', along(0.030), along(0.125), 0.036, red)
    tube('brass', along(0.125), along(0.137), 0.047, BRASS)
    tube('brass', along(0.137), along(0.170), 0.040, BRASS)
    tube('brass', along(0.170), along(0.192), 0.049, tint(BRASS, 0.9))                                              # the cap
    tube('brass', along(0.192), along(0.200), 0.020, tint(BRASS, 0.8))
    for sy in (-1, 1):                                                                                             # the coupling's two lugs
        box('brass', along(0.150)[0] - 0.008, along(0.150)[0] + 0.008, yard + sy * 0.038, yard + sy * 0.056, along(0.150)[2] - 0.008, along(0.150)[2] + 0.008, BRASS, r=0.002)
    cx, _, ch = along(0.196)
    steel.rod([P(cx, yard, ch), P(cx - 0.02, yard + 0.03, ch - 0.10), P(px + 0.04, yard + 0.04, ch - 0.16), P(px + 0.030, yard + 0.012, h - 0.20)], 0.0025, GREY)


def hosebox(g, tag, x, yard, h):
    """
    The fire hose box beside the hydrant, on the house side: a steel cabinet on two brackets, its door on two hinges with
    a quarter-turn catch (it opens to a tap), and in it what the sign says: the hose rolled on a peg with its coupling, the
    nozzle in its clips, the hydrant's spanner on a hook.
    """
    red, dark_red = srgb(0xb8342a), srgb(0x8f2a22)
    x0, x1, t = X_OUT, X_OUT + 0.22, 0.004
    ya, yb, h1 = yard - 0.26, yard + 0.26, h + 0.62
    box('paint', x0, x0 + t, ya, yb, h, h1, red, r=0.001)                                                           # its back, on the house side
    box('paint', x0, x1 - 0.008, ya, ya + t, h, h1, red, r=0.001)
    box('paint', x0, x1 - 0.008, yb - t, yb, h, h1, red, r=0.001)
    box('paint', x0, x1 - 0.008, ya, yb, h, h + t, red, r=0.001)
    box('paint', x0, x1 - 0.008, ya, yb, h1 - t, h1, red, r=0.001)
    for yq in (yard - 0.18, yard + 0.18):                                                                           # two brackets under it, on the house side
        box('steel', x0, x0 + 0.18, yq - 0.015, yq + 0.015, h - 0.012, h, GREY, r=0.002)
        box('steel', x0, x0 + 0.012, yq - 0.015, yq + 0.015, h - 0.13, h - 0.012, GREY, r=0.002)
    # ---- inside: the hose rolled flat on a peg, its coupling, the nozzle in two clips, the spanner on a hook
    canvas, inner = srgb(0xd9d2bd), part('plastic')
    xm = x0 + 0.090
    peg_h = h + 0.400
    tube('steel', (x0 + t, yard, peg_h), (x0 + 0.150, yard, peg_h), 0.020, GREY)
    tube('steel', (x0 + 0.150, yard, peg_h), (x0 + 0.156, yard, peg_h), 0.030, GREY)                                 # the peg's end plate keeps the roll on
    R0, turns, pitch, ha, hb = 0.070, 8, 0.0175, 0.0092, 0.033
    coil = (xm, yard, peg_h - (R0 - ha - 0.020) + 0.001)                                                            # the roll hangs on the peg by its innermost turn
    for k in range(turns):
        oval_ring(inner, coil, -1, R0 + k * pitch, ha, hb, tint(canvas, 0.94 + 0.02 * (k % 3)), n=72, m=20)
    ro = R0 + (turns - 1) * pitch
    tube('brass', (xm, yard + 0.02, coil[2] - ro - 0.006), (xm, yard + 0.085, coil[2] - ro - 0.006), 0.036, BRASS)   # the coupling on the roll's outer end
    tube('brass', (xm, yard + 0.085, coil[2] - ro - 0.006), (xm, yard + 0.097, coil[2] - ro - 0.006), 0.043, BRASS)
    ny = yb - 0.045                                                                                                # the nozzle, upright at the forward side
    tube('brass', (xm, ny, h + 0.105), (xm, ny, h + 0.150), 0.030, BRASS)
    tube('paint', (xm, ny, h + 0.150), (xm, ny, h + 0.300), 0.024, dark_red)
    tube('brass', (xm, ny, h + 0.300), (xm, ny, h + 0.420), 0.024, BRASS, r2=0.013)
    tube('brass', (xm, ny, h + 0.420), (xm, ny, h + 0.436), 0.017, tint(BRASS, 0.85))
    for hh in (h + 0.180, h + 0.340):
        box('steel', x0 + t, xm + 0.004, ny - 0.006, ny + 0.006, hh - 0.008, hh + 0.008, GREY, r=0.002)              # its clips, from the back
    box('steel', x0 + t, xm + 0.030, ny - 0.030, ny + 0.030, h + 0.094, h + 0.105, GREY, r=0.002)                    # and the shelf its foot stands on
    sy = ya + 0.040                                                                                                # the spanner, hung on a hook at the after side
    tube('steel', (x0 + t, sy, h + 0.500), (x0 + 0.050, sy, h + 0.500), 0.004, GREY)
    box('steel', x0 + 0.030, x0 + 0.038, sy - 0.014, sy + 0.014, h + 0.210, h + 0.515, STEEL, r=0.002)
    part('steel').ring(P(x0 + 0.034, sy, h + 0.200), PORT, 0.022, 0.0045, STEEL, sweep=(radians(200), radians(520)))
    # ---- the door: a pan with a rim, hinged at its after edge, the sign on it, a quarter-turn catch at its forward edge
    mover = 'hose-box-p' if x > 0 else 'hose-box-s'
    M = _moving('Fire hose box, door', mover, leaf='Deck paint', fit='Shaft steel', sign='Panel face')
    leaf, fit = M['leaf'], M['fit']
    box(leaf, x1 - 0.008, x1 - 0.004, ya + 0.002, yb - 0.002, h + 0.002, h1 - 0.002, red, r=0.001)
    for (qa, qb, ha_, hb_) in ((ya + 0.002, yb - 0.002, h + 0.002, h + 0.022), (ya + 0.002, yb - 0.002, h1 - 0.022, h1 - 0.002),
                               (ya + 0.002, ya + 0.022, h + 0.022, h1 - 0.022), (yb - 0.022, yb - 0.002, h + 0.022, h1 - 0.022)):
        box(leaf, x1 - 0.004, x1, qa, qb, ha_, hb_, tint(red, 0.94), r=0.0015)                                      # the rim that stiffens it
    c, n, u = Vector(P(x1 - 0.004, yard, h + 0.44)) + Vector((0.0012, 0, 0)), Vector(PORT), Vector(UP)
    r = u.cross(n)
    M['sign'].picture([tuple(c - r * 0.20 - u * 0.075), tuple(c + r * 0.20 - u * 0.075), tuple(c + r * 0.20 + u * 0.075), tuple(c - r * 0.20 + u * 0.075)], 'hose')
    for hh in (h + 0.12, h + 0.50):                                                                                # two hinges
        tube(fit, (x1 + 0.0015, ya - 0.006, hh - 0.035), (x1 + 0.0015, ya - 0.006, hh + 0.035), 0.0065, STEEL)
        box(fit, x1, x1 + 0.003, ya - 0.004, ya + 0.040, hh - 0.030, hh + 0.030, STEEL, r=0.0)      # its leaf lies on the door's rim, not in it
    ky, kh = yb - 0.040, h + 0.31                                                                                  # the catch
    tube(fit, (x1, ky, kh), (x1 + 0.010, ky, kh), 0.018, STEEL)
    box(fit, x1 + 0.010, x1 + 0.018, ky - 0.008, ky + 0.008, kh - 0.045, kh + 0.012, STEEL, r=0.003)
    MOTIONS.append(dict(id=mover, name='Fire hose box', pivot=[x1 + 0.0015, 0.0, BP.Z(ya - 0.006)], ratio=1.0, max=105,
                        at=[x1, DECK + h + 0.31, BP.Z(yard)], normal=[1, 0, 0], auto='tap', reach=1.8))


# ---- The pantry. The owner, 11 November 2026: "we need a cooler and a coffee pot too". On the starboard side, forward of the
# wing door, under the side window and wholly below its sill (0.95 m), so nothing of it stands in the view abeam: a unit
# 0.80 m long and 0.46 m deep with two bays. In the after bay the cooler; in the forward bay a niche for the coffee maker,
# with a rail across its front for when she rolls, and under it a cupboard for the mugs.
PANTRY = dict(back=-X_IN, front=-X_IN + 0.46, y0=21.34, y1=22.14, top=0.90, t=0.018, split=0.44, shelf=0.45)


def _pantry():
    Q = PANTRY
    ys = Q['y0'] + Q['split']                                      # the divider's after face
    return Q['back'], Q['front'], Q['y0'], Q['y1'], ys, Q['top'], Q['t']


def _door_motion(mover, name, hinge_x, hinge_yard, ratio, at, reach=1.7, opens=100):
    MOTIONS.append(dict(id=mover, name=name, pivot=[hinge_x, 0.0, BP.Z(hinge_yard)], ratio=ratio, max=opens,
                        at=[at[0], DECK + at[2], BP.Z(at[1])], normal=[1, 0, 0], auto='tap', reach=reach))


def pantry(g, tag, x, yard, h):
    """The unit itself: a carcass of panels on a plinth set back for the feet, a wooden top, the niche's shelf and its rail, and
    the cupboard under the niche with its door (it opens to a tap), its shelf, four mugs, the coffee tin, the tea and the sugar."""
    xb, xf, y0, y1, ys, T, t = _pantry()
    cream = JOINERY
    sh = PANTRY['shelf']
    box('console', xb + 0.02, xf - 0.035, y0 + 0.02, y1 - 0.02, 0.012, 0.08, FRAME)
    box('console', xb, xb + t, y0, y1, 0.08, T - t, cream)
    for a in (y0, ys, y1 - t):
        box('console', xb + t, xf, a, a + t, 0.08, T - t, cream)
    box('console', xb + t, xf, y0 + t, ys, 0.08, 0.08 + t, cream)
    box('console', xb + t, xf, ys + t, y1 - t, 0.08, 0.08 + t, cream)
    box('console', xb, xf, y0, y1, T - t, T, cream)
    box('wood', xb, xf + 0.012, y0 - 0.008, y1 + 0.008, T, T + 0.022, WOOD, r=0.005)
    box('console', xb + t, xf, ys + t, y1 - t, sh, sh + t, cream)
    part('steel').rod([P(xf - 0.012, ys + t, sh + t + 0.055), P(xf - 0.012, y1 - t, sh + t + 0.055)], 0.0045, STEEL)        # the rail across the niche
    # ---- in the cupboard: a shelf; mugs on it; the tin, the tea and the sugar under it
    a, b = ys + t, y1 - t
    box('console', xb + t, xf - 0.03, a, b, 0.27, 0.27 + 0.012, cream)
    white, mugs = srgb(0xf4f2ea), part('plastic')
    for i, (mx, my) in enumerate(((xb + 0.10, a + 0.075), (xb + 0.10, a + 0.215), (xb + 0.22, a + 0.075), (xb + 0.22, a + 0.215))):
        tube('plastic', (mx, my, 0.282), (mx, my, 0.372), 0.040, white if i != 2 else srgb(0x2f6f74))
        tube('dark', (mx, my, 0.372), (mx, my, 0.3725), 0.0355, srgb(0x2a2420))                                          # the dark of the inside
        mugs.ring(P(mx + 0.052, my, 0.327), (0, 0, 1), 0.026, 0.0055, white if i != 2 else srgb(0x2f6f74), sweep=(radians(-110), radians(110)))
    tube('paint', (xb + 0.10, a + 0.08, 0.098), (xb + 0.10, a + 0.08, 0.235), 0.050, srgb(0xa8322a))                       # the coffee tin
    tube('steel', (xb + 0.10, a + 0.08, 0.235), (xb + 0.10, a + 0.08, 0.243), 0.051, STEEL)
    box('plastic', xb + 0.05, xb + 0.19, a + 0.17, a + 0.25, 0.098, 0.178, srgb(0x3f7a4a), r=0.004)                         # the tea
    vessel('glass', (xb + 0.27, a + 0.12, 0.098), (xb + 0.27, a + 0.12, 0.210), 0.042, GLASS)                               # the sugar, in a jar
    tube('plastic', (xb + 0.27, a + 0.12, 0.100), (xb + 0.27, a + 0.12, 0.175), 0.038, white)
    tube('steel', (xb + 0.27, a + 0.12, 0.210), (xb + 0.27, a + 0.12, 0.222), 0.044, STEEL)
    # ---- the cupboard's door: hinged on its forward edge, a knob at its after edge
    M = _moving('Pantry, cupboard door', 'pantry-cupboard', leaf='Console paint', fit='Shaft steel')
    box(M['leaf'], xf - 0.018, xf, a + 0.003, b - 0.003, 0.101, sh - 0.003, tint(cream, 1.03), r=0.004)
    tube(M['fit'], (xf, a + 0.035, 0.36), (xf + 0.016, a + 0.035, 0.36), 0.006, STEEL)
    M['fit'].ball(P(xf + 0.020, a + 0.035, 0.36), 0.012, STEEL)
    for hh in (0.16, 0.39):
        tube(M['fit'], (xf - 0.004, b - 0.003, hh - 0.022), (xf - 0.004, b - 0.003, hh + 0.022), 0.006, STEEL)
    _door_motion('pantry-cupboard', 'Pantry cupboard', xf - 0.004, b - 0.003, -1.0, (xf, (a + b) / 2, 0.28))


def cooler(g, tag, x, yard, h):
    """The cooler, in the after bay: a small refrigerator of its own, standing on four feet; an insulated cabinet with two wire
    shelves and what the watch keeps cold; a door with a gasket, a shelf of its own for bottles and a handle. It opens to a tap."""
    xb, xf, y0, y1, ys, T, t = _pantry()
    white, inner, wire = srgb(0xf2f0e8), srgb(0xe9edee), srgb(0xb9c0c2)
    a, b = y0 + t + 0.006, ys - 0.006
    x0, x1 = xb + t + 0.010, xf - 0.046                                # the cabinet, behind its door
    h0, h1, w = 0.100, 0.860, 0.030
    for (fx, fy) in ((x0 + 0.03, a + 0.03), (x0 + 0.03, b - 0.03), (x1 - 0.03, a + 0.03), (x1 - 0.03, b - 0.03)):
        tube('dark', (fx, fy, 0.098), (fx, fy, h0), 0.014, BLACK)
    box('plastic', x0, x0 + w, a, b, h0, h1, white)                                                                    # its back, sides, floor and top
    box('plastic', x0 + w, x1, a, a + w, h0, h1, white)
    box('plastic', x0 + w, x1, b - w, b, h0, h1, white)
    box('plastic', x0 + w, x1, a + w, b - w, h0, h0 + w, white)
    box('plastic', x0 + w, x1, a + w, b - w, h1 - w, h1, white)
    box('dark', x0 + w, x0 + w + 0.012, a + w + 0.02, b - w - 0.02, h1 - w - 0.12, h1 - w - 0.02, srgb(0xcfd6d8), r=0.003)   # the cold plate at the back
    ia, ib = a + w, b - w
    for sh in (0.360, 0.580):                                                                                           # two wire shelves, each a frame and its wires
        part('steel').rod([P(x0 + w + 0.004, ia, sh), P(x1 - 0.006, ia, sh), P(x1 - 0.006, ib, sh), P(x0 + w + 0.004, ib, sh), P(x0 + w + 0.004, ia, sh)], 0.003, wire)
        for k in range(1, 9):
            yy = ia + (ib - ia) * k / 9
            tube('steel', (x0 + w + 0.004, yy, sh), (x1 - 0.006, yy, sh), 0.0016, wire)
    # what is kept cold: bottles on the floor, cans on the first shelf, milk and the watch's box on the second
    green, brown, red, blue = srgb(0x2f6f4a), srgb(0x5a3a1e), srgb(0xb5332a), srgb(0x2d5f9a)
    for k, col in enumerate((green, brown, green, brown)):
        bx, by = x0 + w + 0.06 + 0.075 * (k // 2), ia + 0.06 + 0.085 * (k % 2)
        vessel('glass', (bx, by, h0 + w), (bx, by, h0 + w + 0.150), 0.031, col)
        vessel('glass', (bx, by, h0 + w + 0.150), (bx, by, h0 + w + 0.200), 0.031, col, r2=0.013)
        vessel('glass', (bx, by, h0 + w + 0.200), (bx, by, h0 + w + 0.222), 0.013, col)
        tube('steel', (bx, by, h0 + w + 0.222), (bx, by, h0 + w + 0.228), 0.0145, srgb(0xd8b23a))
    for k in range(6):
        cx, cy = x0 + w + 0.06 + 0.075 * (k // 3), ia + 0.05 + 0.075 * (k % 3)
        tube('steel', (cx, cy, 0.3632), (cx, cy, 0.478), 0.033, (red, blue, srgb(0xd9d9d4))[k % 3])
        tube('steel', (cx, cy, 0.478), (cx, cy, 0.481), 0.029, srgb(0xc9cdd0))
    box('plastic', x0 + w + 0.03, x0 + w + 0.10, ia + 0.03, ia + 0.10, 0.5806, 0.775, srgb(0xf7f5ee), r=0.004)             # milk: it beds a millimetre onto the wires it stands on
    box('plastic', x0 + w + 0.03, x0 + w + 0.21, ia + 0.14, ib - 0.02, 0.5806, 0.650, srgb(0x4a86a8), r=0.008)             # the watch's box
    # ---- the door: its leaf, the gasket round its inner face, its own shelf with a rail and two bottles, its handle
    M = _moving('Cooler, door', 'cooler-door', leaf='Plastic', fit='Shaft steel', dark='Machinery paint', glass='Window glass')
    leaf = M['leaf']
    box(leaf, xf - 0.040, xf, a, b, h0, h1, white, r=0.006)
    for (qa, qb, ga, gb) in ((a + 0.012, b - 0.012, h0 + 0.012, h0 + 0.024), (a + 0.012, b - 0.012, h1 - 0.024, h1 - 0.012),
                             (a + 0.012, a + 0.024, h0 + 0.024, h1 - 0.024), (b - 0.024, b - 0.012, h0 + 0.024, h1 - 0.024)):
        box(M['dark'], xf - 0.046, xf - 0.040, qa, qb, ga, gb, srgb(0x3a4042), r=0.0)                                    # the gasket
    box(leaf, xf - 0.105, xf - 0.040, a + 0.03, b - 0.03, 0.230, 0.242, inner, r=0.003)                                   # the door's shelf
    M['fit'].rod([P(xf - 0.100, a + 0.03, 0.300), P(xf - 0.100, b - 0.03, 0.300)], 0.003, wire)
    for yy in (a + 0.03, b - 0.03):
        box(leaf, xf - 0.105, xf - 0.040, yy - 0.004, yy + 0.004, 0.242, 0.304, inner, r=0.0)
    for k, yy in enumerate((a + 0.11, b - 0.11)):
        vessel(M['glass'], (xf - 0.072, yy, 0.242), (xf - 0.072, yy, 0.400), 0.027, (srgb(0xe8e4d8), srgb(0x2f6f4a))[k])
        vessel(M['glass'], (xf - 0.072, yy, 0.400), (xf - 0.072, yy, 0.455), 0.027, (srgb(0xe8e4d8), srgb(0x2f6f4a))[k], r2=0.012)
        tube(M['fit'], (xf - 0.072, yy, 0.455), (xf - 0.072, yy, 0.470), 0.013, srgb(0xd8b23a))
    hy = b - 0.035                                                                                                     # the handle, at the free edge
    for hh in (0.52, 0.76):
        tube(M['fit'], (xf, hy, hh), (xf + 0.028, hy, hh), 0.005, STEEL)
    M['fit'].rod([P(xf + 0.028, hy, 0.50), P(xf + 0.028, hy, 0.78)], 0.007, STEEL)
    _door_motion('cooler-door', 'Cooler', xf - 0.004, a, 1.0, (xf, (a + b) / 2, 0.50))


def coffee_maker(g, tag, x, yard, h):
    """The coffee pot: a filter machine in the niche, on the shelf behind the rail: a base with the hot plate and the switch, a
    column that holds the water with a window to see its level, a head with the filter's basket over the jug, and the jug
    itself, of glass, with its collar, lid and handle, and coffee in it."""
    xb, xf, y0, y1, ys, T, t = _pantry()
    top = PANTRY['shelf'] + t                                           # the shelf's top
    c = (ys + t + y1 - t) / 2
    black, body = srgb(0x1c2022), srgb(0x2a3033)
    bx0, bx1 = xb + t + 0.045, xb + t + 0.045 + 0.27
    box('dark', bx0, bx1, c - 0.105, c + 0.105, top, top + 0.022, body, r=0.006)
    for (fx, fy) in ((bx0 + 0.02, c - 0.085), (bx0 + 0.02, c + 0.085), (bx1 - 0.02, c - 0.085), (bx1 - 0.02, c + 0.085)):
        tube('dark', (fx, fy, top), (fx, fy, top + 0.002), 0.010, black)
    jx = bx1 - 0.085                                                     # the jug's middle, on the hot plate
    tube('steel', (jx, c, top + 0.022), (jx, c, top + 0.026), 0.072, srgb(0x4a4f52))
    box('dark', bx0, bx0 + 0.085, c - 0.105, c + 0.105, top + 0.022, top + 0.300, body, r=0.008)                          # the column
    box('lens', bx0 + 0.085, bx0 + 0.088, c - 0.03, c + 0.03, top + 0.070, top + 0.250, srgb(0x6f8fa3), r=0.001)             # the water's window
    box('dark', bx0, bx1 - 0.015, c - 0.105, c + 0.105, top + 0.258, top + 0.300, body, r=0.008)                           # the head
    tube('dark', (jx, c, top + 0.258), (jx, c, top + 0.196), 0.062, black, r2=0.046)                                     # the filter's basket
    tube('dark', (jx, c, top + 0.196), (jx, c, top + 0.188), 0.012, black)
    box('paint', bx1 - 0.010, bx1 + 0.004, c + 0.060, c + 0.090, top + 0.004, top + 0.018, srgb(0xc2412f), r=0.002)        # the switch, lit when it is on
    # the jug
    vessel('glass', (jx, c, top + 0.026), (jx, c, top + 0.130), 0.064, GLASS)
    vessel('glass', (jx, c, top + 0.130), (jx, c, top + 0.158), 0.064, GLASS, r2=0.050)
    tube('dark', (jx, c, top + 0.030), (jx, c, top + 0.098), 0.060, srgb(0x2b1a10))                                      # the coffee
    part('dark').ring(P(jx, c, top + 0.158), UP, 0.051, 0.006, black)                                                    # its collar
    tube('dark', (jx, c, top + 0.160), (jx, c, top + 0.168), 0.047, black)                                               # its lid
    part('dark').ball(P(jx, c, top + 0.172), 0.010, black)
    part('dark').rod([P(jx + 0.050, c, top + 0.156), P(jx + 0.096, c, top + 0.150), P(jx + 0.100, c, top + 0.075), P(jx + 0.063, c, top + 0.050)], 0.0075, black)


def pantry_socket(g, tag, x, yard, h):
    """A double 230 V socket at the back of the niche, with the coffee maker's plug in one and the cooler's in the other; the
    cooler's lead goes through the divider to it."""
    xb, xf, y0, y1, ys, T, t = _pantry()
    white, cable = srgb(0xf2f0e8), srgb(0x25282a)
    c = (ys + t + y1 - t) / 2
    fx = xb + t
    box('plastic', fx, fx + 0.010, c - 0.075, c + 0.075, h - 0.042, h + 0.042, white, r=0.003)
    for k, yy in enumerate((c - 0.036, c + 0.036)):
        tube('dark', (fx + 0.010, yy, h), (fx + 0.012, yy, h), 0.019, srgb(0x2a2e30))
        box('plastic', fx + 0.012, fx + 0.040, yy - 0.018, yy + 0.018, h - 0.018, h + 0.018, white, r=0.005)                # a plug in each
    top = PANTRY['shelf'] + t
    part('plastic').rod([P(fx + 0.040, c + 0.036, h), P(fx + 0.050, c + 0.036, h - 0.06), P(fx + 0.050, c + 0.02, top + 0.16)], 0.0035, cable)   # to the coffee maker's column
    part('plastic').rod([P(fx + 0.040, c - 0.036, h), P(fx + 0.052, c - 0.036, h - 0.05), P(fx + 0.052, c - 0.10, h - 0.10), P(fx + 0.052, ys - 0.02, h - 0.10),
                         P(fx + 0.045, ys - 0.02, 0.86)], 0.0035, cable)                                                                    # through the divider to the cooler's back


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
    """A pair of all-round red lanterns on a cross arm, one either side of the mast: together they are seen all round, where
    one beside the mast would be hidden by it over 35 degrees (COLREG Annex I, 9(b): not more than 6)."""
    tube('top', (-0.30, yard, h + 0.04), (0.30, yard, h + 0.04), 0.012, HOUSE, 6)
    for sx in (-0.30, 0.30):
        tube('top_dark', (sx, yard, h), (sx, yard, h + 0.05), 0.06, DARK, 14)
        tube('top_lens', (sx, yard, h + 0.05), (sx, yard, h + 0.16), 0.052, RED, 14)
        tube('top_dark', (sx, yard, h + 0.16), (sx, yard, h + 0.19), 0.06, DARK, 14)


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
    pantry=pantry, cooler=cooler, coffee=coffee_maker, pantry_socket=pantry_socket,
)


def build():
    _parts.clear()
    _extra.clear()
    MOTIONS.clear()
    LEVERS.clear()
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
    for eye in EYES:
        seen, blind, to = view_from_helm(eye=eye)
        print(f'glass seen from the helm, eye {eye:.2f} m: {seen:.0f} of 225 degrees, to {to:.0f} degrees each side; blind sectors wider than a mullion: {blind or "none"}')
        if seen < 220:
            raise SystemExit(f'the glass shows an eye at {eye:.2f} m {seen:.0f} of 225 degrees: a blind sector has opened at {blind}')
    out = list(_parts.values()) + _extra
    for p in out:
        p.smooth = False
    return out


def motion():
    """
    Each door turns on its hinge and opens for whoever comes near on foot. Each lever turns on its shaft, a notch for a
    tap, and the same lever at the console and on both wings moves as one. The wheel turns with the rudder order.
    """
    inputs, movers = [], []
    for m in MOTIONS:
        inputs.append(dict(id=m['id'], name=m['name'], min=0, max=m['max'], step=1, unit='°', below='', above='open', rest='shut', auto=m.get('auto', 'near'),
                           at=m['at'], normal=m['normal'], reach=m.get('reach', 1.6)))
        movers.append(dict(id=m['id'], kind='turn', input=m['id'], axis=[0, 1, 0], pivot=m['pivot'], ratio=m['ratio']))
    for c in CONTROLS:
        inputs.append(dict(id=c['id'], name=c['name'], fitting=c['fitting'], steps=c['steps'], home=c['home'], min=c['steps'][0]['v'], max=c['steps'][-1]['v'], unit='°'))
    for m in LEVERS:
        movers.append(dict(id=m['id'], kind='turn', input=m['input'], axis=m['axis'], pivot=[round(float(v), 4) for v in m['pivot']], ratio=m.get('ratio', 1.0)))
    return inputs, movers
