"""
The bridge deck abaft the wheelhouse: the crew's corridor, and the house from outside.

The owner, 11 November 2026: "I would say continue with bridge deck , how about the outside and the corridor to the
cabins", and: "How to make the corridor more realistic and outside".

What the other ship draws there is one piece for the whole house (its walls, the partitions, the deck) with eight bare
doorways off a bare corridor, handrail bars that hang 2 cm off the walls, three open holes in the aft wall, and nine flat
window frames inside the plating. The walls stay, for the cabins behind them are not rebuilt yet. This module gives the
corridor and the outside what a ship has there:

  the corridor   a door in each of the eight doorways (frame, leaf with a vent grille, lever handles, hinges, a name
                 plate; it opens into the cabin for whoever turns to it); storm rails of varnished wood on brackets;
                 a skirting; a panelled deckhead with five recessed lights, three smoke detectors, a loudspeaker and an
                 exit sign at each end; by the aft door an extinguisher, a call point, the alarm bell and the light switch
  the aft wall   three weathertight steel doors on 15 cm sills (the corridor's with a porthole, the emergency generator
                 room's and the CO2 room's with their signs), each with hinges, a lever handle and two dogs, a light over it
  the sides      nine windows: a steel frame with rounded corners standing proud of the plating, twelve bolts, the glass,
                 a drip strip over it
  the platform   a fire hose box whose door opens on the hose and nozzle inside, with its hydrant; the shore firemen's copy
                 of the fire plan in its tube; the public-address horn
  on the walls   in the corridor: the notice board, the muster list, the fire control plan, escape signs

Drawn in the ship's axes (lines.py): x to port, y up, z forward. A place is given as (x, metres from the transom, metres
over the bridge deck). Where each thing stands is in the tables at the top: the build and the register read the same ones.
"""
from math import pi, cos, sin
from mathutils import Vector
import lines as L
from shipyard import Part, srgb, tint, round_rect

DECK = 9.10                      # the bridge deck, over the waterline
WALL, CABIN = 0.45, 0.53         # the corridor's walls: their faces on the corridor's side and on the cabins'
HEAD = 1.924                     # the doorways' heads
CEIL = 2.085                     # the underside of her deckhead panels (the other ship's bare deckhead is at 2.20)
AFT, AFT_IN = 6.00, 6.08         # the aft wall: its after and forward faces
SIDE, SIDE_IN = 3.00, 2.92       # the side walls: outer and inner faces
SILL = 0.15

# The eight cabin doors: the room, its name on the plate, the side (+1 port), the doorway, and the jamb it is hung on.
# Each is hung where the leaf, open, lies against a partition and clear of the furniture (the survey of 11 November).
# The galley's doorway is 0.60 m: the other ship's galley unit stands 10 cm into it, and a post closes that strip.
CABIN_DOORS = (
    dict(id='crew-cabin', plate='np_crew', name='crew cabin', side=1, yard=(9.20, 9.90), hung='aft'),
    dict(id='mate-cabin', plate='np_mate', name="chief officer's cabin", side=-1, yard=(9.20, 9.90), hung='aft'),
    dict(id='deckhand-cabin', plate='np_deckhand', name="deckhand's cabin", side=1, yard=(11.70, 12.40), hung='aft'),
    dict(id='crew-wc', plate='np_wc', name='crew WC and shower', side=-1, yard=(11.70, 12.40), hung='aft'),
    dict(id='mess', plate='np_mess', name='mess room', side=1, yard=(14.20, 14.90), hung='aft'),
    dict(id='galley', plate='np_galley', name='galley', side=-1, yard=(14.30, 14.90), hung='fwd', post=(14.20, 14.30)),
    dict(id='chief-cabin', plate='np_chief', name="chief engineer's cabin", side=1, yard=(16.70, 17.40), hung='aft'),
    dict(id='master-cabin', plate='np_master', name="master's cabin", side=-1, yard=(16.70, 17.40), hung='aft'),
)
# The three doors in the aft wall, from the after platform: the doorway (x), the side its hinges are on, its sign.
AFT_DOORS = (
    dict(id='corridor-aft', name="crew's corridor", x=(-0.40, 0.40), hinge=1, plate='np_crew_only', port=True),
    dict(id='eg-room', name='emergency generator room', x=(1.20, 2.00), hinge=1, plate='np_eg'),
    dict(id='co2-room', name='CO2 room', x=(-2.00, -1.20), hinge=-1, plate='np_co2'),
)
# The windows in the side walls: the side, and where each opening begins (0.50 m long, 1.20 to 1.70 m over the deck).
WINDOWS = tuple((1, a) for a in (9.95, 12.45, 14.95, 17.65)) + tuple((-1, a) for a in (9.95, 12.45, 14.95, 17.35, 18.60))
WINDOW = dict(length=0.50, h=(1.20, 1.70), frame=0.06, corner=0.05, proud=0.012)
LIGHTS = (7.60, 10.80, 13.30, 15.80, 18.30)          # the corridor's deckhead lights
DETECTORS = (9.00, 12.90, 16.90)
SPEAKER = 14.55
RAILS = ((6.25, 9.10), (9.98, 11.62), (12.48, 14.12), (14.98, 16.62), (17.48, 19.30))
WALLS = ((6.10, 9.20), (9.90, 11.70), (12.40, 14.20), (14.90, 16.70), (17.40, 19.44))     # the walls between the doorways

# What hangs on the corridor's walls (the owner, 11 November 2026: "The corridor needs boards and information as well"):
# the picture, the side (+1 the port wall), the middle (metres from the transom, metres over the deck), its width and height.
BOARDS = (
    dict(id='notice-board', tile='notice_board', side=1, at=(7.45, 1.52), size=(1.02, 0.70), frame='wood'),
    dict(id='muster-list', tile='muster_list', side=1, at=(8.57, 1.50), size=(0.48, 0.64), frame='dark'),
    dict(id='fire-plan', tile='fire_plan', side=-1, at=(7.62, 1.50), size=(0.96, 0.60), frame='dark'),
    dict(id='extinguisher-sign', tile='ext_sign', side=-1, at=(6.45, 1.48), size=(0.15, 0.15), frame=None),
) + tuple(dict(id=f'escape-{k}', tile='escape_left' if side > 0 else 'escape_right', side=side, at=(yard, 1.62), size=(0.32, 0.12), frame=None)
          for k, (side, yard) in enumerate(((1, 13.30), (-1, 13.30), (1, 18.40), (-1, 18.40))))

CREAM, TEAL, WHITE, GREY, DARK = srgb(0xd8d2c0), srgb(0x2f6f74), srgb(0xf2f0e8), srgb(0x7d8586), srgb(0x252e30)
WOOD, BRASS, RED, PANEL, STEEL = srgb(0x8d6f4c), srgb(0xb08d57), srgb(0xc2412f), srgb(0xe9e6dc), srgb(0x9aa2a3)
LAMP, GLASS, GREEN = srgb(0xf6f1e4), srgb(0x2d4a55), srgb(0x1e8246)
MOTIONS = []
Z = L.Z


def P(x, yard, h):
    return (x, DECK + h, Z(yard))


class Shop:
    """The parts of this section, made as they are first asked for."""

    def __init__(self):
        self.parts = {}

    def __call__(self, key, look='Bulkhead paint', mover=None, **kw):
        slot = (key, mover)
        if slot not in self.parts:
            p = Part(f'Bridge deck, {key}', look, mover=mover, **kw)
            p.group = 'bridge'
            self.parts[slot] = p
        return self.parts[slot]


def box(p, x0, x1, a, b, h0, h1, colour):
    x0, x1 = sorted((x0, x1))
    a, b = sorted((a, b))
    h0, h1 = sorted((h0, h1))
    p.box(P(x0, a, h0), P(x1, b, h1), colour)


def tube(p, a, b, r, colour, sides=10, r2=None):
    p.tube(P(*a), P(*b), r, r2, colour=colour, sides=sides)


def sign(p, centre, normal, w, h, name, proud=0.0015):
    """A picture of her sheet, upright, on a face that looks along `normal`."""
    c, n, u = Vector(P(*centre)), Vector(normal).normalized(), Vector((0, 1, 0))
    r = u.cross(n)
    c = c + n * proud
    p.picture([tuple(c - r * (w / 2) - u * (h / 2)), tuple(c + r * (w / 2) - u * (h / 2)),
               tuple(c + r * (w / 2) + u * (h / 2)), tuple(c - r * (w / 2) + u * (h / 2))], name)


# ---------------------------------------------------------------------------------------------------------------------
def cabin_door(S, d):
    """A joiner door in a corridor doorway: it stands in the wall and opens into the cabin."""
    s = d['side']
    a, b = d['yard']
    frame, hard = S('corridor, door frames'), S('corridor, door hinges', 'Shaft steel', smooth=True, angle=40)
    xa, xb = s * (WALL - 0.01), s * (CABIN + 0.01)                 # the frame stands a centimetre proud of the wall each side
    if d.get('post'):
        box(S('corridor, joinery'), s * WALL, s * CABIN, d['post'][0], d['post'][1], 0.0, HEAD, WHITE)
    box(frame, xa, xb, a, a + 0.025, 0.0, HEAD, TEAL)
    box(frame, xa, xb, b - 0.025, b, 0.0, HEAD, TEAL)
    box(frame, xa, xb, a + 0.025, b - 0.025, HEAD - 0.025, HEAD, TEAL)
    mover = f"door-{d['id']}"
    leaf = S(f"corridor, door, {d['name']}", 'Bulkhead paint', mover=mover)
    grip = S(f"corridor, door, {d['name']}, fittings", 'Shaft steel', mover=mover, smooth=True, angle=40)
    plate = S(f"corridor, door, {d['name']}, plate", 'Panel face', mover=mover)
    la, lb = a + 0.027, b - 0.027
    x0, x1 = s * (CABIN - 0.04), s * CABIN                         # the leaf, 40 mm, flush with the wall's face in the cabin
    box(leaf, x0, x1, la, lb, 0.012, HEAD - 0.029, CREAM)
    hinge, free = (la, lb) if d['hung'] == 'aft' else (lb, la)
    way = 1 if free > hinge else -1
    for x in (x0, x1):                                             # the vent grille low in the leaf, both faces
        out = -s if x == x0 else s
        for k in range(5):
            box(leaf, x, x + out * 0.004, la + 0.15, lb - 0.15, 0.16 + k * 0.035, 0.18 + k * 0.035, DARK)
        # a lever handle on a rose, 1.0 m up, 7 cm from the free edge
        hy = free - way * 0.07
        tube(grip, (x, hy, 1.0), (x + out * 0.045, hy, 1.0), 0.011, STEEL, 8)
        tube(grip, (x + out * 0.04, hy, 1.0), (x + out * 0.04, hy - way * 0.11, 1.0), 0.009, STEEL, 8)
        tube(grip, (x, hy, 1.0), (x + out * 0.006, hy, 1.0), 0.026, STEEL, 12)
    sign(plate, (x0, (la + lb) / 2, 1.62), (-s, 0, 0), 0.24, 0.06, d['plate'])
    # Two hinges on the cabin's side, where the leaf turns: a knuckle on the frame's face, at the leaf's edge.
    px = s * (CABIN + 0.012)
    for hh in (0.25, 1.62):
        tube(hard, (px, hinge, hh - 0.045), (px, hinge, hh + 0.045), 0.012, STEEL, 8)
    turn = (1 if way > 0 else -1) * s                              # the free edge goes into the cabin
    MOTIONS.append(dict(id=mover, name=f"Door to the {d['name']}", pivot=[px, 0.0, Z(hinge)], ratio=float(turn), max=90,
                        at=[s * (CABIN + 0.27), DECK, Z((a + b) / 2)], normal=[s, 0, 0], reach=0.72))


def corridor(S):
    joinery, dark = S('corridor, joinery'), S('corridor, dark fittings', 'Plastic')
    lamps, rails = S('lamps', 'Lens'), S('corridor, rails', 'Varnished wood', smooth=True, angle=40)
    brass = S('corridor, brackets', 'Bronze', smooth=True, angle=40)
    signs, red = S('signs', 'Panel face'), S('fire fittings', 'Machinery paint', smooth=True, angle=40)
    # ---- the deckhead: panels 1.2 m long on a grid, the joints dark; the lights sit flush in them
    box(joinery, -WALL, WALL, AFT_IN + 0.02, 19.45, CEIL, CEIL + 0.015, PANEL)
    yd = AFT_IN + 0.02 + 1.2
    while yd < 19.3:
        if all(abs(yd - c) > 0.36 for c in LIGHTS):
            box(dark, -WALL, WALL, yd - 0.003, yd + 0.003, CEIL - 0.001, CEIL, GREY)
        yd += 1.2
    for c in LIGHTS:
        box(joinery, -0.17, 0.17, c - 0.32, c + 0.32, CEIL - 0.006, CEIL, tint(PANEL, 0.8))
        box(lamps, -0.15, 0.15, c - 0.30, c + 0.30, CEIL - 0.009, CEIL - 0.006, LAMP)
    for c in DETECTORS:
        tube(joinery, (0.0, c, CEIL), (0.0, c, CEIL - 0.012), 0.055, WHITE, 16)
        tube(joinery, (0.0, c, CEIL - 0.012), (0.0, c, CEIL - 0.04), 0.045, WHITE, 16, 0.03)
        tube(red, (0.03, c, CEIL - 0.04), (0.03, c, CEIL - 0.043), 0.004, RED, 6)
    tube(dark, (0.0, SPEAKER, CEIL), (0.0, SPEAKER, CEIL - 0.008), 0.095, GREY, 20)        # the loudspeaker's grille
    tube(dark, (0.0, SPEAKER, CEIL - 0.008), (0.0, SPEAKER, CEIL - 0.011), 0.08, DARK, 20)
    for c in (8.3, 17.9):                                                                  # two supply air diffusers
        box(joinery, -0.14, 0.14, c - 0.14, c + 0.14, CEIL - 0.012, CEIL, WHITE)
        for k in range(4):
            box(dark, -0.11, 0.11, c - 0.10 + k * 0.06, c - 0.085 + k * 0.06, CEIL - 0.014, CEIL - 0.012, DARK)
    # ---- an exit sign at each end, over the door
    for yard, n in ((AFT_IN, (0, 0, 1)), (19.46, (0, 0, -1))):
        zs = n[2]
        box(joinery, -0.17, 0.17, yard, yard + zs * 0.03, 1.955, 2.075, GREEN)
        sign(signs, (0.0, yard + zs * 0.03, 2.015), n, 0.30, 0.11, 'exit')
    # ---- each wall: a skirting, and a storm rail on brackets, between the doorways
    for s in (1, -1):
        for a, b in WALLS:
            if s < 0 and (a, b) == (12.40, 14.20):
                b = 14.30                                          # to the galley's narrower doorway
            box(dark, s * (WALL - 0.008), s * WALL, a + 0.012, b - 0.012, 0.008, 0.09, DARK)
        rx = s * (WALL - 0.055)
        for a, b in RAILS:
            tube(rails, (rx, a, 0.95), (rx, b, 0.95), 0.02, WOOD, 12)
            n = max(2, int(round((b - a) / 0.85)) + 1)
            for k in range(n):
                yd = a + 0.08 + (b - a - 0.16) * k / (n - 1)
                tube(brass, (s * WALL, yd, 0.915), (rx, yd, 0.915), 0.008, BRASS, 8)
                tube(brass, (rx, yd, 0.915), (rx, yd, 0.94), 0.008, BRASS, 8)
                tube(brass, (s * WALL, yd, 0.915), (s * (WALL - 0.004), yd, 0.915), 0.022, BRASS, 10)
    # ---- by the aft door: a powder extinguisher on the starboard wall; a call point, the bell and the switch to port
    ex, ey, eh = -(WALL - 0.085), 6.45, 0.10
    tube(red, (ex, ey, eh), (ex, ey, eh + 0.44), 0.075, RED, 16)
    tube(red, (ex, ey, eh + 0.44), (ex, ey, eh + 0.50), 0.075, RED, 16, 0.03)
    tube(dark, (ex, ey, eh + 0.50), (ex, ey, eh + 0.56), 0.022, DARK, 10)
    box(dark, ex - 0.012, ex + 0.012, ey - 0.02, ey + 0.10, eh + 0.56, eh + 0.58, DARK)
    tube(dark, (ex + 0.03, ey + 0.03, eh + 0.53), (ex + 0.07, ey + 0.03, eh + 0.18), 0.009, DARK, 6)
    box(joinery, -WALL, ex + 0.085, ey - 0.02, ey + 0.02, eh + 0.26, eh + 0.30, GREY)      # its strap, from the wall
    box(joinery, -WALL, ex, ey - 0.03, ey + 0.03, eh - 0.012, eh, GREY)                    # and the cup it stands in
    cy = 6.36
    box(red, WALL - 0.035, WALL, cy - 0.045, cy + 0.045, 1.355, 1.445, RED)
    sign(signs, (WALL - 0.035, cy, 1.40), (-1, 0, 0), 0.08, 0.08, 'callpoint')
    tube(red, (WALL, cy, 1.93), (WALL - 0.03, cy, 1.93), 0.075, RED, 16)                   # the alarm bell
    tube(red, (WALL - 0.03, cy, 1.93), (WALL - 0.055, cy, 1.93), 0.075, RED, 16, 0.03)
    box(joinery, WALL - 0.012, WALL, cy + 0.20, cy + 0.28, 1.16, 1.28, WHITE)              # the light switch
    box(dark, WALL - 0.016, WALL - 0.012, cy + 0.225, cy + 0.255, 1.20, 1.24, GREY)
    for d in CABIN_DOORS:
        cabin_door(S, d)
    # ---- the boards and papers: each on a backing on the wall, a frame round the larger ones
    backing = S('corridor, boards', 'Plastic')
    woodwork = S('corridor, board frames', 'Varnished wood')
    for b in BOARDS:
        s, (yard, h), (w, hh) = b['side'], b['at'], b['size']
        x = s * WALL
        m = 0.02 if b['frame'] else 0.006
        box(backing, x, x - s * 0.012, yard - w / 2 - m, yard + w / 2 + m, h - hh / 2 - m, h + hh / 2 + m, DARK if b['frame'] != 'wood' else WOOD)
        if b['frame']:
            part, colour = (woodwork, WOOD) if b['frame'] == 'wood' else (backing, DARK)
            for ya, yb, ha, hb in ((yard - w / 2 - m, yard + w / 2 + m, h + hh / 2, h + hh / 2 + m), (yard - w / 2 - m, yard + w / 2 + m, h - hh / 2 - m, h - hh / 2),
                                   (yard - w / 2 - m, yard - w / 2, h - hh / 2, h + hh / 2), (yard + w / 2, yard + w / 2 + m, h - hh / 2, h + hh / 2)):
                box(part, x - s * 0.012, x - s * 0.02, ya, yb, ha, hb, tint(colour, 0.85))
        sign(signs, (x - s * 0.012, yard, h), (-s, 0, 0), w, hh, b['tile'])


# ---------------------------------------------------------------------------------------------------------------------
def aft_door(S, d):
    """A weathertight steel door in the aft wall: a flat-bar frame round the opening on a sill, the leaf closing on it from
    outside, hung on two hinges and opening aft onto the platform."""
    x0, x1 = d['x']
    hs = d['hinge']
    steel, lamps = S('outside, door frames', 'Topside paint'), S('lamps', 'Lens')
    fit = S('outside, fittings', 'Machinery paint', smooth=True, angle=40)
    top = HEAD + 0.026
    box(steel, x0, x1, AFT - 0.012, AFT_IN + 0.012, 0.0, SILL, WHITE)                      # the sill, through the wall
    box(steel, x0 - 0.05, x0, AFT - 0.012, AFT, 0.0, top, WHITE)                           # the frame on the plating
    box(steel, x1, x1 + 0.05, AFT - 0.012, AFT, 0.0, top, WHITE)
    box(steel, x0, x1, AFT - 0.012, AFT, HEAD, top, WHITE)
    mover = f"door-{d['id']}"
    leaf = S(f"outside, door, {d['name']}", 'Topside paint', mover=mover)
    grip = S(f"outside, door, {d['name']}, fittings", 'Shaft steel', mover=mover, smooth=True, angle=40)
    plate = S(f"outside, door, {d['name']}, plate", 'Panel face', mover=mover)
    colour = srgb(0xe2e0d8)
    a, b = x0 - 0.03, x1 + 0.03                                    # the leaf laps the frame by 3 cm all round
    la, lb = AFT - 0.052, AFT - 0.012                              # and is 40 mm thick, against the frame's face
    lo, hi = SILL - 0.03, HEAD + 0.02
    if d.get('port'):
        # the corridor's door has a porthole: the leaf is drawn round it
        cx, ch, r = (a + b) / 2, 1.50, 0.11
        box(leaf, a, b, la, lb, lo, ch - r, colour)
        box(leaf, a, b, la, lb, ch + r, hi, colour)
        box(leaf, a, cx - r, la, lb, ch - r, ch + r, colour)
        box(leaf, cx + r, b, la, lb, ch - r, ch + r, colour)
        glass = S(f"outside, door, {d['name']}, glass", 'Window glass', mover=mover)
        box(glass, cx - r - 0.006, cx + r + 0.006, la + 0.014, la + 0.026, ch - r - 0.006, ch + r + 0.006, GLASS)   # its edges in the leaf
        for yd, n in ((la, -1), (lb, 1)):                                                  # a bronze ring each side
            ring = [(cx + (r + 0.035) * cos(t), ch + (r + 0.035) * sin(t)) for t in (2 * pi * k / 20 for k in range(20))]
            hole = [(cx + (r - 0.012) * cos(t), ch + (r - 0.012) * sin(t)) for t in (2 * pi * k / 20 for k in range(20))]
            start = len(grip.f)
            grip.polygon([P(x, yd + n * 0.004, h) for x, h in ring], BRASS, [[P(x, yd + n * 0.004, h) for x, h in hole]])
            grip.orient(start, (0, 0, n))
            start = len(grip.f)
            grip.grid([[P(x, yd, h) for x, h in ring], [P(x, yd + n * 0.004, h) for x, h in ring]], BRASS, close=True)
            grip.orient(start, lambda c, cx=cx, ch=ch: (c[0] - cx, c[1] - (DECK + ch), 0))
    else:
        box(leaf, a, b, la, lb, lo, hi, colour)
    box(leaf, a + 0.13, b - 0.13, la - 0.008, la, SILL + 0.10, 1.25, tint(colour, 0.97))    # the pressed panel that stiffens it
    hx = b if hs > 0 else a                                                               # the hinge edge
    fx = a if hs > 0 else b                                                               # the closing edge
    pin = hx + hs * 0.03
    for hh in (0.42, 1.62):                                                               # hinges: a blade on the leaf, a pin, lugs on the plating
        box(leaf, hx - hs * 0.10, hx + hs * 0.02, la - 0.012, la, hh - 0.03, hh + 0.03, tint(colour, 0.85))
        tube(grip, (pin, la - 0.006, hh - 0.05), (pin, la - 0.006, hh + 0.05), 0.012, STEEL, 8)
        for ly in (hh + 0.05, hh - 0.075):
            box(steel, pin - 0.018, pin + 0.03, la - 0.02, AFT, ly, ly + 0.025, tint(WHITE, 0.85))
    for hh in (0.55, 1.70):                                                               # two dogs at the closing edge
        tube(grip, (fx + hs * 0.06, la, hh), (fx + hs * 0.06, la - 0.03, hh), 0.014, STEEL, 8)
        box(grip, fx + hs * 0.045, fx + hs * 0.075, la - 0.03, la - 0.018, hh - 0.10, hh + 0.02, DARK)
    for yd, n in ((la, -1), (lb, 1)):                                                     # a lever handle each side
        tube(grip, (fx + hs * 0.10, yd, 1.05), (fx + hs * 0.10, yd + n * 0.05, 1.05), 0.012, STEEL, 8)
        tube(grip, (fx + hs * 0.10, yd + n * 0.045, 1.05), (fx + hs * 0.22, yd + n * 0.045, 1.05), 0.010, STEEL, 8)
    sign(plate, ((a + b) / 2, la, 1.80 if d.get('port') else 1.60), (0, 0, -1), 0.44, 0.11, d['plate'])
    # the light over it: a bulkhead fitting with a guard
    cx = (x0 + x1) / 2
    box(fit, cx - 0.09, cx + 0.09, AFT - 0.035, AFT, 2.115, 2.19, GREY)
    box(lamps, cx - 0.075, cx + 0.075, AFT - 0.075, AFT - 0.035, 2.125, 2.18, LAMP)
    for k in (-1, 0, 1):
        box(fit, cx + k * 0.05 - 0.004, cx + k * 0.05 + 0.004, AFT - 0.081, AFT - 0.035, 2.12, 2.185, GREY)
    turn = -hs                                                    # the closing edge swings aft
    MOTIONS.append(dict(id=mover, name=f"Door to the {d['name']}", pivot=[pin, 0.0, Z(la - 0.006)], ratio=float(turn), max=95,
                        at=[cx, DECK, Z(AFT + 0.04)], normal=[0, 0, -1], reach=1.1))


def window(S, side, a):
    """A window in the side plating: a frame with rounded corners proud of the plating, bolted; the glass; a drip strip over it."""
    W = WINDOW
    frame, glass = S('outside, window frames', 'Topside paint'), S('window glass', 'Window glass')
    bolts = S('outside, bolts', 'Shaft steel', smooth=True, angle=40)
    b = a + W['length']
    h0, h1 = W['h']
    fw, r = W['frame'], W['corner']
    # round_rect gives an outline in a plane across the ship; here it is laid in the plane of the side wall.
    lay = lambda pts, x: [(x, y, zz) for zz, y, _ in pts]
    outer = lambda x: lay(round_rect(Z(a) - fw, DECK + h0 - fw, Z(b) + fw, DECK + h1 + fw, r + fw, 0.0), x)
    inner = lambda x: lay(round_rect(Z(a) + 0.004, DECK + h0 + 0.004, Z(b) - 0.004, DECK + h1 - 0.004, r, 0.0), x)
    mid = ((Z(a) + Z(b)) / 2, DECK + (h0 + h1) / 2)
    out = lambda c, s=side: (s, 0, 0)
    for x, look in ((side * (SIDE + W['proud']), side), (side * (SIDE_IN - 0.008), -side)):
        start = len(frame.f)
        frame.polygon(outer(x), WHITE if look == side else PANEL, [inner(x)])
        frame.orient(start, (look, 0, 0))
    for x0, x1 in ((side * SIDE, side * (SIDE + W['proud'])), (side * SIDE_IN, side * (SIDE_IN - 0.008))):
        start = len(frame.f)
        frame.grid([outer(x0), outer(x1)], tint(WHITE, 0.93), close=True)
        frame.orient(start, lambda c: (0, c[1] - mid[1], c[2] - mid[0]))
    start = len(frame.f)                                           # the lining of the opening, through the wall
    frame.grid([inner(side * (SIDE + W['proud'])), inner(side * (SIDE_IN - 0.008))], tint(WHITE, 0.88), close=True)
    frame.orient(start, lambda c: (0, mid[1] - c[1], mid[0] - c[2]))
    start = len(glass.f)
    glass.polygon(inner(side * (SIDE - 0.03)), GLASS)
    glass.orient(start, (side, 0, 0))
    ring = round_rect(Z(a) - fw / 2, DECK + h0 - fw / 2, Z(b) + fw / 2, DECK + h1 + fw / 2, r + fw / 2, 0.0, n=1)
    pts = []
    for (z0, y0, _), (z1, y1, _) in zip(ring, ring[1:] + ring[:1]):
        for t in (0.25, 0.75) if abs(z1 - z0) + abs(y1 - y0) > 0.2 else (0.5,):
            pts.append((z0 + (z1 - z0) * t, y0 + (y1 - y0) * t))
    xs = side * (SIDE + W['proud'])
    for zz, y in pts:
        bolts.tube((xs, y, zz), (xs + side * 0.006, y, zz), 0.008, None, colour=STEEL, sides=6)
    box(frame, side * SIDE, side * (SIDE + 0.045), a - 0.09, b + 0.09, h1 + fw + 0.03, h1 + fw + 0.045, WHITE)   # the drip strip


def platform(S):
    """On the after platform: the fire station on the aft wall between two doors, and the public-address horn."""
    red, fit = S('fire fittings', 'Machinery paint', smooth=True, angle=40), S('outside, fittings', 'Machinery paint', smooth=True, angle=40)
    signs = S('signs', 'Panel face')
    # The hose box, with the hydrant under it. A cabinet, not a block: a back and four sides, the hose rolled flat inside on
    # its peg with the nozzle beside it, and a door that opens for whoever comes near (the owner, 11 November 2026: "The
    # door needs to be able to open nothing is ornamental").
    bx0, bx1, bh0, bh1, deep = -1.08, -0.52, 0.62, 1.22, 0.18
    box(red, bx0, bx1, AFT - 0.012, AFT, bh0, bh1, RED)
    for xa, xb, ha, hb in ((bx0, bx0 + 0.012, bh0, bh1), (bx1 - 0.012, bx1, bh0, bh1), (bx0, bx1, bh0, bh0 + 0.012), (bx0, bx1, bh1 - 0.012, bh1)):
        box(red, xa, xb, AFT - deep, AFT - 0.012, ha, hb, RED)
    hose = S('fire hose', 'Upholstery', smooth=True, angle=40)
    cx, ch = (bx0 + bx1) / 2 - 0.05, (bh0 + bh1) / 2
    tube(hose, (cx, AFT - 0.03, ch), (cx, AFT - 0.11, ch), 0.21, srgb(0xd9cfae), 24)                 # the hose, rolled flat
    tube(fit, (cx, AFT - 0.012, ch), (cx, AFT - 0.125, ch), 0.03, STEEL, 10)                         # the peg it hangs on
    tube(fit, (bx1 - 0.07, AFT - 0.07, bh0 + 0.012), (bx1 - 0.07, AFT - 0.07, bh0 + 0.10), 0.028, srgb(0xb08d57), 10)       # the nozzle, in its clip
    tube(fit, (bx1 - 0.07, AFT - 0.07, bh0 + 0.10), (bx1 - 0.07, AFT - 0.07, bh0 + 0.30), 0.028, srgb(0xb08d57), 10, 0.014)
    box(fit, bx1 - 0.10, bx1 - 0.012, AFT - 0.085, AFT - 0.055, bh0 + 0.16, bh0 + 0.18, STEEL)
    mover = 'door-hose-box'
    door = S('fire hose box, door', 'Machinery paint', mover=mover)
    doorfit = S('fire hose box, door, fittings', 'Shaft steel', mover=mover, smooth=True, angle=40)
    doorsign = S('fire hose box, door, sign', 'Panel face', mover=mover)
    box(door, bx0, bx1, AFT - deep - 0.008, AFT - deep, bh0, bh1, tint(RED, 0.92))
    box(doorfit, bx1 - 0.04, bx1 - 0.025, AFT - deep - 0.022, AFT - deep - 0.008, 0.86, 0.98, STEEL)
    for hh in (bh0 + 0.08, bh1 - 0.08):                                                             # its hinges, on the cabinet's side
        tube(doorfit, (bx0 - 0.008, AFT - deep - 0.004, hh - 0.03), (bx0 - 0.008, AFT - deep - 0.004, hh + 0.03), 0.008, STEEL, 8)
        box(red, bx0 - 0.014, bx0, AFT - deep - 0.004, AFT - deep + 0.03, hh + 0.03, hh + 0.045, RED)
        box(red, bx0 - 0.014, bx0, AFT - deep - 0.004, AFT - deep + 0.03, hh - 0.045, hh - 0.03, RED)
    sign(doorsign, ((bx0 + bx1) / 2, AFT - deep - 0.008, 1.08), (0, 0, -1), 0.40, 0.15, 'hose')
    MOTIONS.append(dict(id=mover, name='Fire hose box', pivot=[bx0 - 0.008, 0.0, Z(AFT - deep - 0.004)], ratio=1.0, max=90,
                        at=[(bx0 + bx1) / 2, DECK, Z(AFT - deep - 0.3)], normal=None, reach=0.85))
    # the copy of the fire plan for the shore's firemen, in its red tube on the wall to port of the corridor's door
    tube(red, (0.50, AFT - 0.075, 1.28), (1.12, AFT - 0.075, 1.28), 0.06, RED, 16)
    for x in (0.60, 1.02):
        box(fit, x - 0.012, x + 0.012, AFT - 0.075, AFT, 1.255, 1.305, GREY)
    box(red, 0.65, 0.97, AFT - 0.139, AFT - 0.13, 1.235, 1.325, tint(RED, 0.9))
    sign(signs, (0.81, AFT - 0.139, 1.28), (0, 0, -1), 0.30, 0.075, 'fire_plan_label')
    hx, hy = -0.80, AFT - 0.09
    tube(red, (hx, hy, 0.0), (hx, hy, 0.40), 0.032, RED, 12)
    tube(red, (hx, hy, 0.40), (hx, hy, 0.48), 0.05, RED, 12)
    tube(red, (hx, hy, 0.44), (hx, hy - 0.11, 0.44), 0.035, RED, 12)
    tube(fit, (hx, hy - 0.11, 0.44), (hx, hy - 0.14, 0.44), 0.045, srgb(0xb08d57), 12)
    tube(fit, (hx, hy, 0.48), (hx, hy, 0.56), 0.01, STEEL, 8)
    tube(red, (hx, hy, 0.555), (hx, hy, 0.57), 0.07, RED, 14)
    tube(red, (hx, hy, 0.0), (hx, hy, 0.012), 0.07, RED, 14)
    # the horn, high on the wall to port of the corridor's door
    px, ph = 0.80, 2.02
    box(fit, px - 0.03, px + 0.03, AFT - 0.04, AFT, ph - 0.03, ph + 0.03, GREY)
    tube(fit, (px, AFT - 0.04, ph), (px, AFT - 0.10, ph), 0.03, GREY, 12)
    tube(fit, (px, AFT - 0.10, ph), (px, AFT - 0.26, ph - 0.03), 0.035, GREY, 16, 0.10)


def build():
    MOTIONS.clear()
    S = Shop()
    corridor(S)
    for d in AFT_DOORS:
        aft_door(S, d)
    for side, a in WINDOWS:
        window(S, side, a)
    platform(S)
    return list(S.parts.values())


def motion():
    """Each door turns on its hinges and opens for whoever comes near on foot: a cabin's door only for one who turns to it."""
    inputs, movers = [], []
    for m in MOTIONS:
        rec = dict(id=m['id'], name=m['name'], min=0, max=m['max'], step=1, unit='°', below='', above='open', rest='shut', auto='near',
                   at=m['at'], reach=m['reach'])
        if m['normal']:
            rec['normal'] = m['normal']                           # a doorway one walks through; a cabinet's door has none
        inputs.append(rec)
        movers.append(dict(id=m['id'], kind='turn', input=m['id'], axis=[0, 1, 0], pivot=m['pivot'], ratio=m['ratio']))
    return inputs, movers
