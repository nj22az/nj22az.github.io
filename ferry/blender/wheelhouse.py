"""
The wheelhouse: the first room of the bridge deck (section 5 of her own build). Its positions follow ferry/design/bridge/design-basis.json
(the survey's design basis; the two are kept in step by hand, and the basis records which of its items this module built).

What was drawn there before is the Minato Maru's: a console and a steering stand as blocks, a handful of boxes for the
instruments, two engine levers drawn in the wrong order, wing doors laid beside their doorways. The survey of 10 November
(ferry/design/bridge/README.md) found them and laid out a realistic wheelhouse from M/V Ranger III's pilot house (HAER MI-432)
and the Town's design words. This module builds it. The viewer's part is `bridge`; assemble.py replaces the other ship's
pieces inside the wheelhouse (REPLACES) and cuts the starboard wall for its new window (OPENINGS); the walls, the forward
glass and the deck stay the Minato Maru's for now, as do the aft wall's chart table and panels.

  - the console (5.5 m, top at 1.0 m), the steering stand with its wheel, the non-follow-up lever, the autopilot head and the
    heading readout low on its face (not at the eye, where it stood), the master's chair;
  - the engine levers the right way round (port to port) with the thruster lever beside them, the radar with a hood no
    higher than 1.33 m, the sounder and plotter, the repeater, the VHF and telephone, the NAVTEX, the navigation-light panel,
    the searchlight handle, the whistle push, the ramp lamp board, the compass read overhead, three wipers;
  - on the aft wall (kept) the alarm handset, the clock, barometer and inclinometer, a fold-down log desk;
  - two wing doors, hinged, weathertight, with a sill, a glazed upper half, hardware, and a motion each (they open for whoever
    comes near); the starboard wall's window and its glass; a console at each wing's forward end with levers, repeaters and a
    windscreen; the two sidelights on screens at the wing ends.

Drawn in the ship's axes (lines.py): x to port, y up from the laden waterline, z forward from amidships. Heights below are
metres over the bridge deck (11.0 m above the keel), `yard` is metres from the transom.
"""
from math import pi, cos, sin, radians, tan, atan2, hypot
from mathutils import Vector
import lines as L
import spec as S
from shipyard import Part, srgb, tint
from hull_appendages import _revolve

DECK = L.Y(11.0)                      # the bridge deck's floor, 9.1 m over the waterline
FLOOR = 0.01                          # the carpet's top

GREEN, CREAM, DARK, BRASS, WOOD = srgb(0x52796f), srgb(0xd8d2c0), srgb(0x252e30), srgb(S.BRONZE), srgb(0x765032)
STAND, LEATHER, STEEL = srgb(0x5c6466), srgb(0x4a3f36), srgb(S.STEEL)
FRAME, DOOR, SILL = srgb(0x3a4244), srgb(0x5d6b6a), srgb(0x6b7472)
SCREEN, RED, GREENLENS, WHITE_LAMP = srgb(0x0b2a1d), srgb(0xc2412f), srgb(0x2f9e5a), srgb(0xf6f1e2)
GREY, BLACK = srgb(0x7d8586), srgb(0x1a1f20)


def P(x, yard, h):
    """A point from its place on the bridge deck: x to port, metres from the transom, metres over the deck."""
    return (x, DECK + h, L.Z(yard))


def _box(part, x0, x1, yd0, yd1, h0, h1, colour):
    x0, x1 = sorted((x0, x1))
    yd0, yd1 = sorted((yd0, yd1))
    part.box(P(x0, yd0, h0), P(x1, yd1, h1), colour)


def _prism(part, x0, x1, profile, colour):
    """A solid from a convex outline in (yard, h) pushed from x0 to x1: its sides and ends look outward."""
    n = len(profile)
    start = len(part.f)
    ring = lambda x: [P(x, yd, h) for yd, h in profile]
    part.grid([ring(x0), ring(x1)], colour, close=True)
    for x in (x0, x1):
        part.polygon(ring(x), colour)
    mid = Vector([sum(c) / len(c) for c in zip(*[P((x0 + x1) / 2, yd, h) for yd, h in profile])])
    part.orient(start, lambda c: c - mid)


def _tube(part, a, b, r, colour, sides=12, r2=None):
    part.tube(a, b, r, r2, colour=colour, sides=sides)


def _torus(part, centre, big, small, colour, n=28, m=10):
    """A ring in the x-y plane (its axis along z), seen from forward or aft alike: a wheel's rim."""
    cx, cy, cz = centre
    rows = []
    for i in range(n + 1):
        a = 2 * pi * i / n
        mid = Vector((cx + big * cos(a), cy + big * sin(a), cz))
        out = Vector((cos(a), sin(a), 0))
        rows.append([tuple(mid + out * (small * cos(2 * pi * k / m)) + Vector((0, 0, 1)) * (small * sin(2 * pi * k / m))) for k in range(m)])
    start = len(part.f)
    part.grid(rows, colour, close=True)

    def away(c):
        v = Vector((c[0] - cx, c[1] - cy, 0))
        v.normalize()
        return Vector(c) - (Vector((cx, cy, cz)) + v * big)
    part.orient(start, away)


def _disc(part, centre, axis, r, thick, colour, sides=20):
    a = Vector(centre)
    d = Vector(axis).normalized()
    part.tube(tuple(a), tuple(a + d * thick), r, r, colour=colour, sides=sides)


def _display(parts, x, yard, h, w, d, H, hood=0.0, name=''):
    """A display on the console: a housing whose after face (toward the helmsman) leans back 20° and carries the screen."""
    dark, screen = parts['dark'], parts['screen']
    back = H * tan(radians(20))
    prof = [(yard, h), (yard + d, h), (yard + d, h + H), (yard + back, h + H)]
    _prism(dark, x - w / 2, x + w / 2, prof, DARK)
    # the screen sits on the leaning face, a millimetre proud, inside a bezel
    bz = 0.025
    def on_face(s, t):
        """s across (-1..1 of the inner width), t up the face (0..1)."""
        yd = yard + back * t
        hh = h + H * t
        return P(x + s * (w / 2 - bz), yd - 0.0015 * H / hypot(H, back) , hh + 0.0015 * back / hypot(H, back))
    t0, t1 = bz / H, 1 - bz / H
    start = len(screen.f)
    screen.polygon([on_face(-1, t0), on_face(1, t0), on_face(1, t1), on_face(-1, t1)], SCREEN)
    screen.orient(start, (0, 0.36, -1))
    if hood:
        # a three-plate hood: a roof and two cheeks standing over the face
        top = h + H + 0.015
        _box(dark, x - w / 2 - 0.01, x + w / 2 + 0.01, yard - 0.06, yard + back + 0.03, top, top + 0.025, DARK)
        for sx in (-1, 1):
            _box(dark, x + sx * (w / 2 + 0.005) - 0.015, x + sx * (w / 2 + 0.005) + 0.015, yard - 0.06, yard + d, h + 0.02, top + 0.025, DARK)


def _lever(parts, x, yard, h, grip_colour, length=0.23):
    """An engine lever at rest, upright: a quadrant plate, a shaft, a grip."""
    _box(parts['dark'], x - 0.07, x + 0.07, yard - 0.15, yard + 0.15, h, h + 0.04, DARK)
    _tube(parts['steel'], P(x, yard, h + 0.04), P(x, yard, h + 0.04 + length), 0.012, GREY, 10)
    _tube(parts['dark'], P(x - 0.045, yard, h + 0.04 + length), P(x + 0.045, yard, h + 0.04 + length), 0.03, grip_colour, 12)


def _wheel(parts, x, yard, h):
    """The helm: eight spokes with handles, a varnished rim, a brass hub on a shaft out of the stand's face."""
    wood, brass, steel = parts['wood'], parts['brass'], parts['steel']
    c = P(x, yard, h)
    _torus(wood, c, 0.29, 0.022, WOOD)
    _tube(brass, (c[0], c[1], c[2] - 0.035), (c[0], c[1], c[2] + 0.035), 0.055, BRASS, 16)
    _tube(steel, (c[0], c[1], c[2] + 0.03), (c[0], c[1], c[2] + 0.10), 0.03, GREY, 12)
    for i in range(8):
        a = i * pi / 4
        d = Vector((cos(a), sin(a), 0))
        _tube(wood, tuple(Vector(c) + d * 0.05), tuple(Vector(c) + d * 0.36), 0.012, WOOD, 8, 0.016)
        _tube(wood, tuple(Vector(c) + d * 0.29), tuple(Vector(c) + d * 0.37), 0.016, WOOD, 8)


def _chair(parts, x, yard):
    steel, seat = parts['steel'], parts['seat']
    _tube(steel, P(x, yard, FLOOR), P(x, yard, FLOOR + 0.03), 0.26, GREY, 24)
    _tube(steel, P(x, yard, FLOOR + 0.03), P(x, yard, 0.62), 0.045, GREY, 14)
    for k in range(3):
        a = k * 2 * pi / 3 + 0.4
        _tube(steel, P(x, yard, 0.30), P(x + 0.2 * cos(a), yard + 0.2 * sin(a), 0.30), 0.012, GREY, 8)
    _tube(steel, P(x - 0.22, yard, 0.30), P(x + 0.22, yard, 0.30), 0.012, GREY, 8)
    _box(seat, x - 0.23, x + 0.23, yard - 0.22, yard + 0.22, 0.62, 0.72, LEATHER)
    _box(seat, x - 0.22, x + 0.22, yard - 0.26, yard - 0.20, 0.72, 1.18, LEATHER)
    for sx in (-1, 1):
        _tube(steel, P(x + sx * 0.25, yard - 0.12, 0.72), P(x + sx * 0.25, yard - 0.12, 0.90), 0.014, GREY, 8)
        _box(seat, x + sx * 0.25 - 0.025, x + sx * 0.25 + 0.025, yard - 0.18, yard + 0.20, 0.90, 0.94, LEATHER)


def _console_and_stand(parts):
    con, stand, dark, wood = parts['console'], parts['stand'], parts['dark'], parts['wood']
    # The console: a toe kick, the body in sea green, a cream top with a nosing, the wall of the wheelhouse behind.
    _box(con, -2.70, 2.70, 22.34, 22.92, FLOOR, 0.08, FRAME)
    _box(con, -2.75, 2.75, 22.30, 22.92, 0.08, 0.97, GREEN)
    _box(con, -2.76, 2.76, 22.29, 22.92, 0.97, 1.00, CREAM)
    for sx in (-1, 1):                                           # the ends are finished off
        _box(con, sx * 2.75 - 0.0, sx * 2.78, 22.30, 22.92, 0.08, 0.97, tint(GREEN, 0.9))
    # The steering stand: a plinth, a tapered body, a top plate.
    _box(stand, -0.32, 0.32, 21.48, 22.02, FLOOR, 0.10, STAND)
    _box(stand, -0.28, 0.28, 21.52, 21.98, 0.10, 0.95, STAND)
    _box(stand, -0.31, 0.31, 21.49, 22.01, 0.95, 0.98, tint(STAND, 0.55))
    # The non-follow-up lever to starboard of the wheel's line, on the top plate; the autopilot head to port of it.
    _box(dark, -0.15, -0.09, 21.69, 21.75, 0.98, 1.00, DARK)
    _tube(parts['steel'], P(-0.12, 21.72, 1.00), P(-0.12, 21.69, 1.20), 0.010, GREY, 10)
    _tube(dark, P(-0.12, 21.69, 1.20), P(-0.12, 21.69, 1.26), 0.022, DARK, 12)
    _prism(dark, 0.02, 0.22, [(21.64, 0.98), (21.84, 0.98), (21.84, 1.08), (21.69, 1.08)], DARK)
    # The heading readout, low on the stand's after face (it stood at 1.5 m, on the line of sight, before).
    _box(dark, -0.12, 0.12, 21.465, 21.52, 0.84, 1.00, DARK)
    start = len(parts['screen'].f)
    parts['screen'].polygon([P(-0.10, 21.462, 0.86), P(0.10, 21.462, 0.86), P(0.10, 21.462, 0.98), P(-0.10, 21.462, 0.98)], SCREEN)
    parts['screen'].orient(start, (0, 0, -1))
    _wheel(parts, 0.0, 21.42, 1.05)
    return


def _instruments(parts):
    dark, steel, brass, lens, screen = parts['dark'], parts['steel'], parts['brass'], parts['lens'], parts['screen']
    top = 1.00
    # Controls at the master's hand: the engine levers (port to port) and the thruster lever, ahead of the stand.
    _lever(parts, 0.45, 22.60, top, RED)               # port engine
    _lever(parts, 0.25, 22.60, top, BLACK)             # starboard engine
    _lever(parts, -0.15, 22.60, top, srgb(0x4a6a8a))   # bow thruster
    # Displays, tilted back, none above 1.33 m: the radar to starboard with its hood, the sounder and plotter to port.
    _display(parts, -1.05, 22.45, top, 0.46, 0.30, 0.28, hood=1.0)
    _display(parts, 1.75, 22.45, top, 0.60, 0.30, 0.28)
    _display(parts, 0.35, 22.74, top + 0.15, 0.86, 0.12, 0.25)           # engine and heading repeater, on its own stand-off
    _box(dark, -0.05, 0.05, 22.74, 22.86, top, top + 0.15, DARK)
    _box(dark, 0.20, 0.50, 22.74, 22.86, top, top + 0.15, DARK)
    # VHF with DSC and its handset, the ship's telephone, the NAVTEX printer.
    _display(parts, -1.95, 22.55, top, 0.35, 0.28, 0.20)
    _tube(dark, P(-1.78, 22.50, top + 0.02), P(-1.78, 22.50, top + 0.14), 0.02, DARK, 8)           # handset cradle
    _display(parts, -2.35, 22.55, top, 0.25, 0.28, 0.20)
    _prism(dark, 2.35 - 0.15, 2.35 + 0.15, [(22.41, top), (22.69, top), (22.69, top + 0.20), (22.45, top + 0.20)], DARK)
    _box(parts['paper'], 2.35 - 0.10, 2.35 + 0.10, 22.45, 22.69, top + 0.20, top + 0.205, CREAM)
    # The navigation-light panel on the console's after face: four switches, four lenses, a plate.
    _box(dark, -2.08, -1.02, 22.265, 22.30, 0.63, 0.89, DARK)
    for i, col in enumerate((WHITE_LAMP, RED, GREENLENS, WHITE_LAMP)):
        xs = -1.95 + i * 0.27
        _tube(steel, P(xs, 22.265, 0.70), P(xs, 22.235, 0.70), 0.008, GREY, 8)
        _tube(steel, P(xs, 22.235, 0.70), P(xs + 0.0, 22.225, 0.74), 0.006, GREY, 8)
        _tube(lens, P(xs, 22.265, 0.82), P(xs, 22.25, 0.82), 0.026, col, 14)
    # The searchlight handle, the whistle push, the ramp lamp board.
    _tube(steel, P(-0.60, 22.62, top), P(-0.60, 22.62, top + 0.10), 0.02, GREY, 10)
    _tube(dark, P(-0.60, 22.62, top + 0.10), P(-0.60, 22.50, top + 0.19), 0.017, DARK, 10)
    _tube(dark, P(0.85, 22.60, top), P(0.85, 22.60, top + 0.05), 0.03, DARK, 12)
    _tube(lens, P(0.85, 22.60, top + 0.05), P(0.85, 22.60, top + 0.075), 0.022, RED, 12)
    _display(parts, 1.25, 22.40, top, 0.40, 0.25, 0.15)
    for i in range(6):
        c = (RED, RED, GREENLENS, GREENLENS, WHITE_LAMP, WHITE_LAMP)[i]
        _tube(lens, P(1.25 - 0.15 + i * 0.06, 22.395, top + 0.07), P(1.25 - 0.15 + i * 0.06, 22.385, top + 0.07), 0.012, c, 8)


def _overhead(parts):
    dark, lens, steel = parts['dark'], parts['lens'], parts['steel']
    top = 2.08                                                  # the deckhead: the roof slab's underside
    # The compass is read in a periscope at the deckhead, above the eye (it stood at 1.5 m, dead ahead, before).
    _box(dark, -0.11, 0.11, 21.45, 21.65, top - 0.025, top, DARK)
    _tube(steel, P(0.0, 21.55, top - 0.03), P(0.0, 21.55, 1.95), 0.025, GREY, 12)
    _box(dark, -0.08, 0.08, 21.47, 21.63, 1.84, 1.95, DARK)
    _tube(lens, P(0.0, 21.47, 1.895), P(0.0, 21.455, 1.895), 0.03, srgb(0xdfe6e1), 14)
    # White lights in the deckhead, a red night light over the console.
    for sx in (-1, 1):
        _box(lens, sx * 1.55 - 0.30, sx * 1.55 + 0.30, 21.10, 21.32, top - 0.04, top, WHITE_LAMP)
        _tube(lens, P(sx * 0.9, 22.15, top), P(sx * 0.9, 22.15, top - 0.03), 0.035, RED, 12)
    # On the aft wall (the other ship's chart table, panels, clock and barometer stay): the alarm handset and a log desk.
    _box(dark, -0.75, -0.55, 19.54, 19.60, 1.35, 1.55, DARK)
    _tube(dark, P(-0.65, 19.60, 1.50), P(-0.65, 19.62, 1.40), 0.018, DARK, 8)
    # The log desk, folded down: a varnished slab on two brackets, a lamp on a stalk.
    _box(parts['wood'], 1.55, 2.35, 19.55, 19.95, 0.88, 0.91, WOOD)
    for x in (1.62, 2.28):
        _tube(steel, P(x, 19.55, 0.60), P(x, 19.85, 0.88), 0.012, GREY, 8)
    _tube(steel, P(2.25, 19.62, 0.91), P(2.25, 19.62, 1.10), 0.008, GREY, 8)
    _tube(dark, P(2.25, 19.62, 1.10), P(2.18, 19.72, 1.08), 0.03, DARK, 10, 0.012)


def _wipers(parts):
    """Three wipers on the outside of the forward glass, parked along the sill: a motor spindle, an arm, a rubber blade."""
    steel, dark, brass = parts['steel'], parts['dark'], parts['brass']
    for x in (-1.18, 0.0, 1.18):
        _tube(brass, P(x - 0.27, 22.99, 1.00), P(x - 0.27, 23.04, 1.00), 0.02, BRASS, 12)
        _tube(steel, P(x - 0.27, 23.04, 1.00), P(x + 0.25, 23.05, 1.03), 0.006, GREY, 8)
        _box(dark, x - 0.20, x + 0.28, 23.04, 23.06, 1.00, 1.02, BLACK)


def _door(parts, side, yd0, yd1, name):
    """
    A wing door in a doorway of the house side: a lining, a coaming sill 0.15 m high, a leaf hinged on its forward edge that
    opens outward, with a glazed upper half, a lever handle on both faces, a kick plate and two hinges. `side` is +1 to port.
    Returns the part list for its leaf and its motion (the leaf turns about the hinge).
    """
    frame, sill = parts['frame'], parts['sill']
    x = side * 3.0
    xi, xo = side * 2.92, side * 3.0
    # lining and coaming
    for a, b in ((yd0, yd0 + 0.04), (yd1 - 0.04, yd1)):
        _box(frame, xi, xo, a, b, 0.15, 1.91, FRAME)
    _box(frame, xi, xo, yd0, yd1, 1.91, 1.95, FRAME)
    _box(sill, side * 2.88, side * 3.07, yd0, yd1, 0.0, 0.15, SILL)
    # the leaf
    leaf = Part(f'Wheelhouse, wing door, {name}', 'Deck paint', mover=f'door-wing-{name[0]}')
    glass = Part(f'Wheelhouse, wing door glass, {name}', 'Window glass', mover=f'door-wing-{name[0]}')
    fit = Part(f'Wheelhouse, wing door hardware, {name}', 'Bronze', mover=f'door-wing-{name[0]}')
    a, b = yd0 + 0.04, yd1 - 0.04
    xa, xb = side * 2.95, side * 2.99
    _box(leaf, xa, xb, a, b, 0.15, 0.95, DOOR)                      # the lower panel
    _box(leaf, xa, xb, a, b, 1.75, 1.91, DOOR)                      # the top rail
    _box(leaf, xa, xb, a, a + 0.08, 0.95, 1.75, DOOR)               # the free stile
    _box(leaf, xa, xb, b - 0.08, b, 0.95, 1.75, DOOR)               # the hinge stile
    _box(leaf, side * 2.99, side * 3.005, a + 0.01, b - 0.01, 0.15, 0.31, tint(DOOR, 0.55))   # kick plate, outside
    glass.polygon([P(side * 2.97, a + 0.08, 0.95), P(side * 2.97, b - 0.08, 0.95), P(side * 2.97, b - 0.08, 1.75), P(side * 2.97, a + 0.08, 1.75)], tint(srgb(0x2d4a55), 1.0))
    # the lever handle, on both faces, near the free edge; two hinges and the pin on the forward edge
    for xs, d in ((side * 3.0, 1), (side * 2.95, -1)):
        _box(fit, xs, xs + side * d * 0.045, a + 0.03, a + 0.06, 0.98, 1.08, BRASS)
        _box(fit, xs + side * d * 0.03, xs + side * d * 0.05, a + 0.015, a + 0.12, 1.03, 1.06, BRASS)
    for hh in (0.35, 1.55):
        _tube(fit, P(side * 2.97, b, hh - 0.06), P(side * 2.97, b, hh + 0.06), 0.016, BRASS, 10)
    z_h = L.Z(b)
    return [leaf, glass, fit], dict(id=f'door-wing-{name[0]}', hinge=(side * 2.97, z_h), side=side, mid=L.Z((yd0 + yd1) / 2))


def _window(parts, x, yd0, yd1, h0, h1):
    """The starboard wall's new window: a steel frame round the opening cut in the other ship's panel, and its glass."""
    frame, glass = parts['frame'], parts['glass']
    xa, xb = -2.99, -2.94
    t = 0.05
    _box(frame, xa, xb, yd0, yd1, h0, h0 + t, FRAME)
    _box(frame, xa, xb, yd0, yd1, h1 - t, h1, FRAME)
    for a, b in ((yd0, yd0 + t), (yd1 - t, yd1)):
        _box(frame, xa, xb, a, b, h0 + t, h1 - t, FRAME)
    glass.polygon([P(-2.965, yd0 + t, h0 + t), P(-2.965, yd1 - t, h0 + t), P(-2.965, yd1 - t, h1 - t), P(-2.965, yd0 + t, h1 - t)], srgb(0x2d4a55))


def _wing(parts, side, name):
    """A wing console at the forward end of the wing, and the sidelight on its screen at the wing's outer end."""
    con, dark, steel, brass, lens, screen, glass = (parts[k] for k in ('wing', 'dark', 'steel', 'brass', 'lens', 'screen', 'wglass'))
    x0, x1, y0, y1 = 3.10, 4.00, 22.425, 22.875
    xa, xb = sorted((side * x0, side * x1))
    _box(con, xa, xb, y0 + 0.03, y1 - 0.03, 0.0, 0.10, FRAME)
    _box(con, xa, xb, y0, y1, 0.10, 0.82, GREEN)
    # the sloped top: lower at the helmsman's side, higher forward, so the levers and dials face him
    _prism(con, xa - 0.01, xb + 0.01, [(y0 - 0.02, 0.82), (y1 + 0.02, 0.82), (y1 + 0.02, 0.98), (y0 + 0.14, 0.88)], tint(GREEN, 1.08))
    xm = (xa + xb) / 2
    for dx, col in ((-0.28, RED), (-0.14, BLACK), (0.0, srgb(0x4a6a8a))):
        _lever_wing(parts, xm + side * dx, y0 + 0.13, col)
    slope = (0.98 - 0.88) / (y1 + 0.02 - (y0 + 0.14))                      # the top rises forward
    nrm = Vector((-slope, 1.0)).normalized()                                # its normal, as (yard, height)
    for dx in (0.18, 0.34):
        ys = y0 + 0.30
        hs = 0.88 + (ys - (y0 + 0.14)) * slope
        _tube(brass, P(xm + side * dx, ys, hs), P(xm + side * dx, ys + nrm.x * 0.012, hs + nrm.y * 0.012), 0.072, BRASS, 20)
        _tube(screen, P(xm + side * dx, ys + nrm.x * 0.012, hs + nrm.y * 0.012), P(xm + side * dx, ys + nrm.x * 0.02, hs + nrm.y * 0.02), 0.062, SCREEN, 20)
    # a windscreen across the forward edge, on two steel stanchions
    for xs in (xa + 0.03, xb - 0.03):
        _tube(steel, P(xs, y1 - 0.02, 0.98), P(xs, y1 - 0.02, 1.32), 0.012, GREY, 8)
    wg = [P(xa + 0.03, y1 - 0.02, 1.00), P(xb - 0.03, y1 - 0.02, 1.00), P(xb - 0.03, y1 - 0.02, 1.30), P(xa + 0.03, y1 - 0.02, 1.30)]
    glass.polygon(wg, srgb(0x2d4a55))
    # the sidelight at the wing's outer end, forward: a lantern on a post, with a screen board inboard of it
    sx = side * 4.03
    _box(dark, sx - 0.03, sx + 0.03, 22.85, 22.91, 0.0, 0.98, STAND)
    _box(dark, sx - 0.07, sx + 0.07, 22.80, 22.96, 0.98, 1.18, DARK)
    _tube(lens, P(sx + side * 0.07, 22.88, 1.08), P(sx + side * 0.095, 22.88, 1.08), 0.06, RED if side > 0 else GREENLENS, 16)
    _box(dark, side * 3.99 - 0.008, side * 3.99 + 0.008, 22.42, 22.96, 0.98, 1.20, tint(DARK, 0.9))


def _epirb(parts):
    """The float-free EPIRB in its bracket on the post of the starboard wall between window and door, outside, clear of the rails."""
    ep, steel = parts['epirb'], parts['steel']
    x, yard = -3.07, 20.35
    _box(steel, -3.00, -3.035, yard - 0.07, yard + 0.07, 1.42, 1.82, GREY)
    _tube(ep, P(x, yard, 1.48), P(x, yard, 1.74), 0.062, srgb(0xe8742a), 16)
    _tube(ep, P(x, yard, 1.74), P(x, yard, 1.80), 0.04, srgb(0xdfe6e1), 14)
    _tube(steel, P(x - 0.07, yard, 1.55), P(x + 0.0, yard, 1.55), 0.012, GREY, 8)
    _tube(steel, P(x - 0.07, yard, 1.68), P(x + 0.0, yard, 1.68), 0.012, GREY, 8)


def _lever_wing(parts, x, yard, colour):
    _tube(parts['steel'], P(x, yard, 0.875), P(x, yard, 1.10), 0.011, GREY, 10)
    _tube(parts['dark'], P(x - 0.04, yard, 1.10), P(x + 0.04, yard, 1.10), 0.028, colour, 12)


def build():
    names = dict(console=('Wheelhouse, console', 'Console paint'), stand=('Wheelhouse, steering stand', 'Console paint'),
                 dark=('Wheelhouse, instruments', 'Machinery paint'), screen=('Wheelhouse, screens', 'Screen'),
                 lens=('Wheelhouse, lamps and dials', 'Lens'), brass=('Wheelhouse, brass', 'Bronze'), steel=('Wheelhouse, steel', 'Shaft steel'),
                 wood=('Wheelhouse, wood', 'Varnished wood'), seat=('Wheelhouse, chair', 'Upholstery'), paper=('Wheelhouse, paper', 'Deck paint'),
                 frame=('Wheelhouse, frames', 'Console paint'), sill=('Wheelhouse, sills', 'Deck paint'),
                 glass=('Wheelhouse, window glass', 'Window glass'), wing=('Wheelhouse, wing consoles', 'Console paint'),
                 wglass=('Wheelhouse, wing windscreens', 'Window glass'), epirb=('Wheelhouse, EPIRB', 'Machinery paint'))
    parts = {k: Part(n, look) for k, (n, look) in names.items()}
    _console_and_stand(parts)
    _chair(parts, 1.05, 21.55)
    _instruments(parts)
    _overhead(parts)
    _wipers(parts)
    _window(parts, -3.0, 21.30, 22.10, 0.97, 1.83)
    leaves = []
    global MOTIONS
    MOTIONS = []
    for side, yd0, yd1, name in ((1, 19.60, 20.40, 'port'), (-1, 20.45, 21.25, 'starboard')):
        got, motion = _door(parts, side, yd0, yd1, name)
        leaves += got
        MOTIONS.append(motion)
    for side, name in ((1, 'port'), (-1, 'starboard')):
        _wing(parts, side, name)
    _epirb(parts)
    out = list(parts.values()) + leaves
    for p in out:
        p.group = 'bridge'
        p.smooth = False
    return out


MOTIONS = []


def motion():
    """Each wing door turns on its forward hinge, outward, up to 100°, and opens for whoever comes near on foot."""
    inputs, movers = [], []
    for m in MOTIONS:
        side = m['side']
        inputs.append(dict(id=m['id'], name=f"Door to the {'port' if side > 0 else 'starboard'} wing", min=0, max=100, step=1, unit='°',
                           below='', above='open', rest='shut', auto='near', at=[side * 3.0, DECK, m['mid']], normal=[side, 0, 0], reach=1.6))
        movers.append(dict(id=m['id'], kind='turn', input=m['id'], axis=[0, 1, 0], pivot=[m['hinge'][0], 0.0, m['hinge'][1]], ratio=-1.0 * side))
    return inputs, movers
