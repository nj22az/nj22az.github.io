"""
The Chisum's hull as specified: where her paint lines, bulkheads, shafts, screws, rudders and marks are, and why.

Numbers first, so the builder (hull_*.py), the page's notes and later sections read the same ship. Positions are in the
ship's axes (lines.py): x to port, y up from the laden waterline, z forward from amidships; `yard` means metres from
the transom, as the working drawings count.
"""
from math import pi
from lines import Y

# ---- Paint (sRGB). The scheme is the Rev C ship's: white over red-brown antifouling, a teal band under the sheer.
ANTIFOULING = 0x8e3a30
WHITE = 0xeeeae0
TEAL = 0x2f6f74
LETTERING = 0x245c60       # her name, in the band's colour a shade deeper
MARK_DARK = 0x22282a       # draught marks on white plating
MARK_LIGHT = 0xf2efe6      # draught marks on antifouling
PRIMER = 0xb7c0b2          # grey-green shop primer: the inside of the shell, frames, floors, girders, bulkheads
BILGE_RED = 0x9a4b3d       # the tank top under the floor plates
STEEL = 0x8a9092
BRONZE = 0xb08a4a
ZINC = 0xb9bcb8
BLACK = 0x25292b

BOOT = 0.10                # the antifouling is carried 10 cm above the laden waterline
BAND = 0.42                # the teal band's depth under the deck edge
BAND_TOP = 0.02

# ---- Plating. 12 mm is drawn (her shell would be 8 to 10 mm; a little more reads better where she is cut).
SHELL = 0.012
STATION = 0.25             # the shell is drawn at every half frame
STRAKE_BUTT = 6.0          # a plate's length, metres; butts are shifted 2 m from strake to strake

# ---- The gangway gate in the port bulwark (the car deck's own inner bulwark is open between the same two frames).
GATE = (-3.75, -2.75)

# ---- Structure. Frames stand at every 0.5 m (frame 0 at the transom). The machinery spaces' own linings stand
# 14 cm inside the moulded line (Rev C sheet C3), so a frame 100 mm deep (112 mm off the moulded line with the plating)
# clears them. 100 × 65 mm: the 5 × 3 in angle of M/V Ranger III (HAER MI-432), a 50 m vessel, scaled to a hull of 4 m
# depth. Forward of the collision bulkhead, where the sea strikes her, a lighter frame (80 × 65 mm, Ranger III's 4 × 3 in)
# stands between each pair, so the spacing there is 0.25 m.
FRAME_WEB = 0.100
FRAME_FLANGE = 0.065
INTERMEDIATE_WEB = 0.080
INTERMEDIATE_FROM = 30.5            # the yard of the collision bulkhead
TANK_TOP = Y(0.7)
# Watertight bulkheads that the hull carries herself (yard). 8.5 and 26 are set 8 cm clear of the machinery spaces'
# own end walls, which stand at 8.44–8.50 and 26.00–26.06.
BULKHEADS = (
    dict(yard=2.6, name='Steering-gear room, forward bulkhead'),
    dict(yard=5.0, name='Fresh-water tanks, forward bulkhead (frame 10)'),
    dict(yard=8.42, name='Engine room, aft bulkhead (frame 17)', trunk=(3.03, Y(0.9))),
    dict(yard=26.08, name='Electrical workshop, forward bulkhead (frame 52)'),
    dict(yard=27.5, name='Thruster room, aft bulkhead (frame 55)'),
    dict(yard=30.5, name='Collision bulkhead (frame 61)'),
)
# The double bottom runs under the machinery spaces, yard 8.5 to 26; floors at 8.5, 14, 22.5 and 26 are tank ends.
DOUBLE_BOTTOM = (8.5, 26.0)
TIGHT_FLOORS = (8.5, 14.0, 22.5, 26.0)
# Girders: the centre girder, one under each main engine (the engines sit 1.55 m off the centreline), one outboard.
GIRDERS = (1.55, 3.0)

# ---- Shafts, screws, rudders. Twin screws turning outward. Each shaft runs straight from its gearbox's output flange
# (1.55 m off the centreline, 1.5 m above the keel, 8.85 m from the transom: the engine room as drawn on Rev C sheet C3)
# to its screw, falling 6° aft; it leaves the hull 6.5 m from the transom.
SHAFT_X = 1.55
GEARBOX_FLANGE = dict(yard=8.85, y=Y(1.5), radius=0.12)
SCREW = dict(yard=3.2, y=-1.0, diameter=1.45, blades=4, pitch_ratio=0.8, hub=0.15)
SHAFT_RISE = (GEARBOX_FLANGE['y'] - SCREW['y']) / (GEARBOX_FLANGE['yard'] - SCREW['yard'])   # per metre going forward
SHAFT_RADIUS = 0.055               # a 110 mm shaft
SHAFT_COUPLING = 7.45              # where the intermediate shaft is coupled to the tail shaft
STERN_TUBE_SEAL = 7.15             # the stern tube's inboard seal
PLUMMER_BLOCK = 8.0                # the intermediate shaft's bearing, on the floor at frame 16
BRACKET_YARD = 3.9
RUDDER = dict(yard_stock=1.72, top=-0.30, bottom=-1.60, chord_top=0.66, chord_bottom=0.54, balance=0.30, thickness=0.18)

# ---- The spaces the hull gives a floor to. The flat in the steering-gear room and under the fresh-water tanks lies
# just over the floors' face bars; the thruster room's platform lies just over the crown of the tunnel.
FLAT = 0.27
THRUSTER_PLATFORM = Y(1.46)
# The steering gear. A tiller on each stock points forward; a tie bar joins their ends; a ram lies athwartships outboard
# of each tiller, trunnioned on a stool and pinned to the tiller two thirds along it. 35° each way.
TILLER = dict(level=FLAT + 0.33, reach=0.62, ram_at=0.42, ram_anchor=1.16, clevis=0.075, tie_bar=0.13)
RUDDER_ANGLE = 35

# ---- The way aft on foot (the owner, 10 November 2026: "There needs to be a water tight door that can open to the
# steering gear"). From the engine room one goes aft on the centreline through three hinged watertight doors: into the
# shaft space, up its steps to the level of the flats, between the two fresh-water tanks, and into the steering-gear
# room. A door is 0.60 m by 1.40 m clear over a 0.20 m sill, corners rounded, six dogs worked by a handwheel; it is
# hung to port and opens 90°, toward the side where the deck is level and clear (`opens`: +1 toward the bow, the leaf
# on the forward face; -1 toward the stern). `through` is how far the frame runs fore and aft: the engine room's door
# stands in her own bulkhead (8.42 m) and lines the other ship's wall (8.44 to 8.50 m) as well.
WT_DOOR = dict(width=0.60, height=1.40, sill=0.20, corner=0.10, frame=0.06, leaf=0.02, open=90, reach=2.4)
WT_DOORS = (
    dict(id='door-engine-room', name='Door to the shaft space', where='engine room', yard=8.42, floor=Y(0.9), opens=1, through=(8.40, 8.52)),
    dict(id='door-shaft-space', name='Door between shaft space and tanks', where='shaft space', yard=5.0, floor=FLAT, opens=-1),
    dict(id='door-steering-gear', name='Door to the steering gear', where='steering gear', yard=2.6, floor=FLAT, opens=1),
    # Forward (the owner, 10 November 2026: "all rooms need to be accessible"): from the electrical workshop into the void
    # and on into the thruster room, 0.8 m to starboard of the centreline, where the workshop's forward wall is clear.
    # The collision bulkhead beyond has no door, as the rules require: the fore peak is entered from above (LADDERS).
    dict(id='door-void', name='Door to the void', where='void', yard=26.08, x=-0.8, floor=Y(0.9), opens=-1, through=(25.98, 26.13)),
    dict(id='door-thruster-room', name='Door to the thruster room', where='thruster room', yard=27.5, x=-0.8, floor=THRUSTER_PLATFORM, opens=1),
)
# The walkway through the shaft space: a platform at the engine room's floor plates, six treads and a flat at the
# level of the steering flat, 0.8 m wide between two rails, clear over the floors of her bottom as she rises aft.
WALKWAY = dict(half=0.40, platform=(8.05, 8.38), treads=6, going=0.25, flat=(5.06, 6.55), rail=0.95)


# The walkway through the void: from the workshop's floor plates up two treads to the level of the thruster platform.
WALKWAY_VOID = dict(x=-0.8, half=0.40, platform=(26.14, 26.40), treads=2, going=0.25, flat=27.44, rail=0.95)
# The flat in the fore peak, between the chain lockers.
FORE_PEAK_FLAT = 0.20

# ---- Ladders, and the hatches over two of them. A ladder stands upright at (x, yard); `faces` is the way one looks while
# on it (x, z); `foot` and `head` are the levels it joins. With a hatch, the opening is 0.65 m by 0.60 m in the deck over
# it, a coaming round it and a cover hinged on the ladder's side. `group` is the part of the ship it is drawn with.
#  - From the lower lobby down to the flat in the shaft space: the way to the machinery spaces and the steering gear.
#  - From the car deck, just forward of the collision bulkhead, down to the flat in the fore peak.
#  - From the bridge deck, at the head of the port stairs, up the house side to the compass deck.
LADDERS = (
    dict(id='ladder-shaft-space', name='Ladder to the shaft space', up='Ladder to the lower lobby', group='machinery',
         x=-0.98, yard=5.45, faces=(-1, 0), foot=FLAT, head=Y(4.0), hatch='hatch-shaft-space', hatch_name='Hatch to the shaft space'),
    dict(id='ladder-fore-peak', name='Ladder to the fore peak', up='Ladder to the car deck', group='machinery',
         x=0.55, yard=30.58, faces=(0, -1), foot=FORE_PEAK_FLAT, head=Y(4.0), hatch='hatch-fore-peak', hatch_name='Hatch to the fore peak',
         wall=0.08),      # it stands 8 cm forward of the collision bulkhead and is fastened to it (it was fastened to nothing)
    dict(id='ladder-compass-deck', name='Ladder to the bridge deck', up='Ladder to the compass deck', group='bridge',
         x=3.14, yard=19.25, faces=(-1, 0), foot=9.11, head=11.5, top=1.0, wall=0.17,
         foot_at=(3.45, 19.78), head_at=(2.58, 19.25)),
)


def ladder_side(l):
    """The way from a ladder to the one who climbs it: (x, z), the opposite of the way they look."""
    return (-l['faces'][0], -l['faces'][1])


def hatch_opening(l):
    """The opening over a ladder: (x0, x1, yard0, yard1). From 5 cm behind the ladder to 0.60 m before it, 0.60 m across."""
    cx, cz = ladder_side(l)
    xs = sorted((l['x'] - 0.05 * cx - 0.30 * abs(cz), l['x'] + 0.60 * cx + 0.30 * abs(cz)))
    zs = sorted((l['yard'] - 0.05 * cz - 0.30 * abs(cx), l['yard'] + 0.60 * cz + 0.30 * abs(cx)))
    return (xs[0], xs[1], zs[0], zs[1])


def ladder_way(l):
    """Where one stands at a ladder's foot and at its head, and the line one climbs on: three (x, yard) points."""
    cx, cz = ladder_side(l)
    line = (l['x'] + 0.30 * cx, l['yard'] + 0.30 * cz)
    foot = l.get('foot_at') or (l['x'] + 0.68 * cx, l['yard'] + 0.68 * cz)
    head = l.get('head_at') or (l['x'] + 1.00 * cx, l['yard'] + 1.00 * cz)
    return foot, head, line


def door_opening(d):
    """A door's clear opening: (x0, y0, x1, y1), port and up positive."""
    y0 = d['floor'] + WT_DOOR['sill']
    x = d.get('x', 0.0)
    return (x - WT_DOOR['width'] / 2, y0, x + WT_DOOR['width'] / 2, y0 + WT_DOOR['height'])


def door_frame_yards(d):
    return d.get('through', (d['yard'] - 0.05, d['yard'] + 0.05))


# Machinery colours, as the engine room's (Rev C): engines green, motors blue, fire red, fresh water blue.
ENGINE_GREEN = 0x2e7a4e
MOTOR_BLUE = 0x2a3f6b
FIRE_RED = 0xc2412f
WATER_BLUE = 0x4f7fb0
OIL_BROWN = 0x8a6a3a
DARK_GREY = 0x3a3f41
LIGHT_GREY = 0x9aa3a2
FLOOR_PLATE = 0x8c9193
FLANGE = 0x9ea4a6
RAIL_YELLOW = 0xe3c341
DOOR_GREY = 0xc9cfcc

# ---- The bow thruster: a 0.9 m tunnel through the forefoot.
THRUSTER = dict(yard=29.0, y=-0.95, radius=0.45)

# ---- Keel, skeg, bilge keels.
# The keel bar runs from under the skeg's forward end to the forefoot. The bilge keels stand at the middle of the turn
# of the bilge (psi = pi/4), where their tips stay inside her beam and above her keel.
KEEL_BAR = dict(width=0.15, depth=0.05, yard=(10.2, 33.0))
SKEG = dict(yard=(3.6, 10.6), thickness=0.18)
BILGE_KEEL = dict(yard=(11.0, 23.0), depth=0.22, psi=pi / 4)

# ---- The compass deck: the roof of the bridge house, her mast and what it carries (section 2, the first slice; the owner,
# 10 November 2026: "Yes, proceed"). The positions are the Minato Maru's, so the ladder that comes up to it, the rooms
# that hang under it and the walker still fit; the fittings follow what M/V Ranger III (HAER MI-432) carries on her
# pilot-house roof: radar, searchlight, anchor and masthead lights, VHF antennas, vent heads over the spaces below.
COMPASS_DECK = dict(deck=11.5, slab=0.32, half=3.10, yards=(5.95, 23.16), corner=0.35,
                    rail=1.0, rail_in=0.13, post_every=1.45,
                    gate=(19.25, 0.8),            # the gap in the port rail where the ladder arrives: (yard, width)
                    # The wheelhouse stands 0.30 m taller than the house behind it (the owner, 11 November 2026, on raising
                    # its roof: "Yes make it realistic"): from the wheelhouse's aft wall forward the roof is a step higher.
                    # That higher part, over the wheelhouse, is the compass deck proper; `deck` is the house top aft of it,
                    # where the ladder arrives. `slab_top` is the depth of the roof's structure over the wheelhouse.
                    step=19.495, rise=0.30, slab_top=0.28)
# Heights above the waterline. The mast stands on the compass deck and went up 0.30 m with it. The masthead light stands
# 0.2 m over the tops of the radar platform's posts: lower, two of them stood in its sector (the yard's calculation JS4-402,
# for class comment PA-001 No. 10). The horns are between it and the upper not-under-command lights.
MAST = dict(yard=20.8, top=16.4, yardarm=13.8, platform=13.9, radar=14.12, masthead=14.7, horns=14.95)
ROOF_DECK = 0xb4bab6        # the roof's paint: light grey, non-skid


# ---------------------------------------------------------------------------------------------------------------------
# Stairs. The owner, 11 November 2026: "All stairs need to be traversable and fully realistic and standardised".
#
# The yard's standard (ferry/yard/standards/JSY-STD-401-stairs.md says where each figure comes from): three classes, and
# every stair aboard is one of them. `pitch` is the steepest it may be, `rise` the least and the greatest height of a
# step, `going` the least distance from one step's edge to the next, `width` the least clear width, `flight` the most
# steps in one flight before a landing. blender/stairs.py builds every stair from STAIRS and stops if one breaks its class.
#   P  a stair passengers use: closed steps under a floor covering, a marked edge on every step, a handrail each side,
#      a landing after 12 steps at most
#   C  a stair for the crew inside the ship: the same, narrower, its steps 20 mm shorter
#   L  an inclined ladder for the crew, on deck or in the machinery spaces: open grating treads, a handrail each side
# No step aboard is higher than 208 mm: two of them must come under the 0.42 m at which the page's walker (app.js, OVER)
# takes a thing for an obstacle and not for the next step but one. The check that walks every stair found it.
# ---------------------------------------------------------------------------------------------------------------------
STAIR_CLASS = dict(
    P=dict(name='passenger stair', pitch=45.0, rise=(0.170, 0.200), going=0.220, width=0.90, flight=12, tread='closed', rail=0.90),
    C=dict(name='crew stair', pitch=45.0, rise=(0.180, 0.200), going=0.200, width=0.70, flight=14, tread='closed', rail=0.90),
    L=dict(name='inclined ladder', pitch=55.0, rise=(0.190, 0.208), going=0.150, width=0.55, flight=16, tread='open', rail=0.90),
)
# Each stair: the viewer's part it is built in; `x`, the clear width between its stringers; `top`, the edge of the deck it
# comes down from (metres from the transom, height over the waterline); `down`, +1 if it comes down going forward, -1 going
# aft; `legs`, its flights as counts of steps with ('landing', length) between them; `rise` and `going`; `foot`, the level
# it reaches; `sides`, what stands at its lower-x and higher-x side ('wall': a rail on brackets, 'open': a rail on posts).
STAIRS = [
    # Up to each bridge wing from the side walkway of the passenger deck (crew only: the wheelhouse is not for passengers).
    dict(id='wing-p', cls='L', name='port wing', part='passenger', x=(3.47, 4.03), top=(19.50, 9.10), down=-1, legs=[13], rise=2.60 / 13,
         going=0.152, foot=6.50, sides=('open', 'open'), paint=WHITE),
    dict(id='wing-s', cls='L', name='starboard wing', part='passenger', x=(-4.03, -3.47), top=(19.50, 9.10), down=-1, legs=[13], rise=2.60 / 13,
         going=0.152, foot=6.50, sides=('open', 'open'), paint=WHITE),
    # Up to the bridge deck's after landing from the open deck.
    dict(id='aft-p', cls='L', name='after landing, port', part='passenger', x=(0.87, 1.43), top=(4.80, 9.10), down=-1, legs=[13], rise=2.60 / 13,
         going=0.152, foot=6.50, sides=('open', 'open'), paint=WHITE),
    dict(id='aft-s', cls='L', name='after landing, starboard', part='passenger', x=(-1.43, -0.87), top=(4.80, 9.10), down=-1, legs=[13], rise=2.60 / 13,
         going=0.152, foot=6.50, sides=('open', 'open'), paint=WHITE),
    # The crew's stair from the saloon to the wheelhouse, in its own enclosure and, through the bridge deck, in a casing in
    # the master's cabin. It keeps the other ship's place and pitch, which is the steepest a crew stair may be. At its head
    # the wheelhouse has a rail and a self-closing gate (wheelhouse.stairwell), so it has no newels of its own there.
    dict(id='crew', cls='C', name='crew stair to the wheelhouse', part='passenger', x=(-2.90, -2.14), top=(20.15, 9.10), down=-1, legs=[13], rise=0.200,
         going=0.200, foot=6.50, sides=('open', 'wall'), gaps=(0.0, 0.10), top_ext=0.0, top_newel=False),
    # Down to the engine room from the port casing, through the well in the car deck (6.5 to 8.5 m from the transom).
    dict(id='engine-room', cls='L', name='engine room', part='machinery', x=(3.14, 3.96), top=(6.50, 2.10), down=1, legs=[16], rise=3.10 / 16,
         going=0.150, foot=-1.00, sides=('open', 'open'), top_ext=0.10, well=dict(x=(3.08, 4.02), yard=(6.50, 8.50))),
    # The two main stairs, from the passenger deck's lobby down to the car deck inside the side casings: 22 steps of 200 mm
    # in two flights with a landing (JSY-STD-401 says why they are as steep as 42 degrees: the lobby above and the deck
    # over the landing leave 2.42 m for the upper flight). Each is lined to its walls and ends in a foot lobby (MAIN_STAIR).
    dict(id='main-p', cls='P', name='main stair, port', part='car', x=(2.825, 4.005), top=(6.95, 6.50), down=1, legs=[12, ('landing', 0.95), 10],
         rise=0.200, going=0.220, foot=2.10, sides=('wall', 'wall'), gaps=(0.015, 0.015), main=1),
    dict(id='main-s', cls='P', name='main stair, starboard', part='car', x=(-4.005, -2.825), top=(6.95, 6.50), down=1, legs=[12, ('landing', 0.95), 10],
         rise=0.200, going=0.220, foot=2.10, sides=('wall', 'wall'), gaps=(0.015, 0.015), main=-1),
]
# What stands round each main stair (blender/stairs.py draws it, blender/assemble.py cuts the other ship's drawing to it).
# Distances off the centreline are for the port stair; the starboard one is its mirror image.
#   `well`     the opening in the passenger deck: it was 7.40 to 9.40 m and is lengthened aft to the top step
#   `wall`     the inner faces of the stair's enclosure: the casing's inboard wall, and the lining on its outboard wall, which
#              stands in line with the lobby's side wall above (the casing's own plate is 9 cm further out)
#   `lobby`    the foot lobby on the car deck, from the casing's old cross wall to its forward end, 2.20 m under its deckhead
#   `door`     the way in from the car deck: a sliding fire door inside the lobby (a hinged one would swing into the lane
#              outside or across the lobby inside), the opening and how far the leaf runs forward to open
#   `old_door` the other ship's opening, beside what are now the lower flight's last steps: plated in
#   `guard`    the balustrade along the well in the lobby above
MAIN_STAIR = dict(
    well=(6.95, 9.40), wall=(2.81, 4.02), plate=4.11, slab=(6.25, 6.50), deckhead=6.245,
    lobby=dict(yard=(12.60, 14.70), head=4.30),
    door=dict(yard=(12.66, 13.60), height=2.00, run=0.98, sill=0.03),
    old_door=dict(yard=(11.346, 12.554), height=2.004),
    guard=dict(height=1.06, cap=0.045),
    # Starboard only: the casing there is drawn solid aft of 7.40 m and forward of 12.60 m. The top two steps stand in a
    # pocket cut in the after block, and the foot lobby is cut out of the forward one.
    pocket=dict(yard=(6.93, 7.40), y=(5.74, 6.25)),
)

# ---- Marks.
# Figures every 20 cm from `lowest` (metres above the keel) to 2.8 m, wherever the plating is upright enough to carry one.
DRAUGHT_MARKS = (
    dict(where='aft', yard=6.2, lowest=1.4),
    dict(where='midships', yard=16.6, lowest=0.4),
    dict(where='forward', yard=30.9, lowest=0.8),
)
LOAD_LINE_YARD = 17.6
NAME = 'CHISUM'             # as it is painted. The owner, 11 November 2026: "Maybe rename her to the Chisum", then "rename to Chisum"; she was the Christina from 9 November
SHIP_NAME = NAME.title()    # as it is written
PORT_OF_REGISTRY = 'MINATO'
# The shipping line she sails for, lettered along each side of the hull, and its colour (the funnels' teal). Its mark, a J
# in a ring, is on the funnels (blender/livery.py).
LINE = 'JOHANSSON LINE'            # the owner, 11 November 2026: "Johansson Line not lines by the way"
LINE_YARD = 23.0           # its middle: forward of the midships draught marks and the load line mark, which it would otherwise stand over
LINE_COLOUR = 0x2f6f74
