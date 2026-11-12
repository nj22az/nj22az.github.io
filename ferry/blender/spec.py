"""
The Chisum's hull as specified: where her paint lines, bulkheads, shafts, screws, rudders, doors, stairs and marks are,
and why.

She is the 124.8 m ro-ro freight ferry of the general arrangement (ga.py, revision D: her decks, her bulkheads and every
space). This file is what the builders need beyond that: numbers first, so the builder (hull_*.py, steel.py, stairs.py),
the page's notes and later sections read the same ship. Positions are in the ship's axes (lines.py): x to port, y up from
the design waterline, z forward from amidships; `yard` means metres from the transom.
"""
from math import pi, tan, radians
from lines import Y, FRAME_SPACING
import lines as _L
import ga

# How far forward of its place on the first Chisum the bridge stands (bridge_place.py): its after wall's outer face
# (19.495 m in its own measure) lands 100.0 m from the transom, its front 0.5 m inside the front of the house.
BRIDGE_SHIFT = 80.505


def fr(n):
    """A frame's distance from the transom."""
    return n * FRAME_SPACING


# ---- The viewer's parts, bottom to top: each lifts away from the one under it when she is taken apart. A builder's
# part names the one it belongs to (`part.group`); the hull is the default.
PARTS = ('hull', 'machinery', 'main', 'upper', 'boat', 'officers', 'bridge', 'top')

# ---- The decks, over the waterline (ga.DECKS is above the keel).
TANK_TOP = Y(ga.DECKS['tank_top'])
PLATFORM = Y(ga.DECKS['platform'])         # the engine room platform
AFT_FLAT = Y(ga.DECKS['aft_flat'])         # the flat in the steering gear room and the after passage
MAIN_DECK = Y(ga.DECKS['main'])
UPPER_DECK = Y(ga.DECKS['upper'])
HELIDECK = Y(ga.DECKS['helideck'])
BOAT_DECK = Y(ga.DECKS['boat'])
OFFICERS_DECK = Y(ga.DECKS['officers'])
BRIDGE_DECK = Y(ga.DECKS['bridge'])
COMPASS_DECK = Y(ga.DECKS['compass'])
# Each plan of ga.py: the level its rooms stand on.
LEVELS = dict(hold=TANK_TOP, main=MAIN_DECK, upper=UPPER_DECK, boat=BOAT_DECK, officers=OFFICERS_DECK, bridge=BRIDGE_DECK, top=COMPASS_DECK)

# ---- Paint (sRGB): a classic freighter's. The line's deep teal from the boot top to the rail, red antifouling under the
# water with a white line between, white houses, green decks.
ANTIFOULING = 0x8e3a30
WHITE = 0xeeeae0
TEAL = 0x2f6f74            # the line's teal: the funnels, the lettering on white
HULL = 0x1f5560            # the hull: the line's teal, deep
LETTERING = 0xf1eee4       # her name and the line's, white on the hull
MARK_DARK = 0x22282a       # draught marks on white plating
MARK_LIGHT = 0xf2efe6      # draught marks on antifouling and on the hull's teal
PRIMER = 0xb7c0b2          # grey-green shop primer: the inside of the shell, frames, floors, girders, bulkheads
BILGE_RED = 0x9a4b3d       # the tank top
STEEL = 0x8a9092
BRONZE = 0xb08a4a
ZINC = 0xb9bcb8
BLACK = 0x25292b
DECK_GREEN = 0x4f6f5e      # the weather decks and the vehicle decks: non-skid deck paint
DECK_GREY = 0x8f9896       # steel decks inside, before any covering is laid
BUFF = 0xd9b77a            # masts, davits, ventilators

BOOT = 0.25                # the antifouling is carried 25 cm above the design waterline
BOOT_LINE = 0.20           # the white line over it

# ---- Plating. 12 mm is drawn (her shell would be 11 to 14 mm; it reads where she is cut).
SHELL = 0.012
STATION = 0.3              # the shell is drawn at every half frame at her ends
STATION_MID = (46.2, 60.0) # and at every frame where her section does not change
STRAKE_BUTT = 9.0          # a plate's length, metres; butts are shifted 3 m from strake to strake

# ---- Openings in the topsides, each side: the after mooring stations' mooring ports (ga: "behind a mooring port in the
# shell"), and the pilot doors: each a real door, its leaf hinged on the shell (steel.py), shut at sea. (yards, heights
# over the waterline.)
MOORING_PORT = dict(yard=(2.4, 4.8), y=(MAIN_DECK + 1.0, MAIN_DECK + 2.2))
PILOT_DOOR = dict(yard=(68.7, 69.9), y=(MAIN_DECK, MAIN_DECK + 2.2))      # (between frames: a frame stands 0.3 m clear of each edge)
# The topsides' rows of plating run at these heights as far as the upper deck (the openings above lie between them); the
# upper deck's edge and the rail, which rise with the sheer forward, are the last two rows.
TOPSIDE_LEVELS = (MAIN_DECK, MAIN_DECK + 1.0, MAIN_DECK + 2.2, MAIN_DECK + 4.4, UPPER_DECK - 0.5)
# Where her side plating is carried up over the upper deck's edge as a bulwark, each side: (from, to, metres from the
# transom). Between them the house stands at her side.
BULWARKS = ((0.0, ga.HOUSE[0]), (ga.HOUSE[1], _L.LENGTH))

# ---- The stern door and its ramp (ga.py: an opening 9.0 m wide and 5.2 m high; a ramp of 11 m). The owner, 11 November
# 2026: "How do you get on to cargo deck from this ship ? Aft ramp ?", "It needs a hydraulic ramp", "And lights , draw the
# aft in cad".
# The ramp is how vehicles come aboard. Raised, it is the stern door: it lies against the transom from outside, covers the
# opening and stands on over the upper deck, as the pattern's does. It turns on its hinges just abaft the main deck's sill
# and lowers aft onto the quay: level with the deck at 90 degrees, and 10 degrees further for a quay that lies lower.
# It is worked by two double-acting hydraulic cylinders, one at each side of the opening, each trunnioned on a pedestal on
# the main deck 6.0 m inside the stern and pinned to a lug on the ramp's roadway 2.2 m over its hinges, which stands in
# through the opening: 5.94 m between its pins with the ramp raised, 8.64 m with it level, a stroke of 2.70 m. `ram_x` is
# where they stand off the centreline, inside the opening's width. Heights are over the waterline; the second of each pair
# is metres inside the transom's plating (negative: abaft it). `barrel` is the cylinder's length from its foot pin,
# `rod_from` where the rod's inner end lies with the ramp raised; `column` the pedestal's column, which ends `column_over`
# above the foot pin, on a footplate.
STERN_DOOR = dict(half=ga.STERN_DOOR['half'], height=ga.STERN_DOOR['height'])
STERN_RAMP = dict(id='stern-ramp', lowered=100, half=ga.STERN_RAMP['half'], length=ga.STERN_RAMP['length'], thick=(-0.17, -0.03), foot=0.02,
                  hinge=(MAIN_DECK + 0.02, -0.10), lug=0.14,
                  ram_x=4.25, trunnion=(MAIN_DECK + 2.60, 6.00), pin=(MAIN_DECK + 2.22, 0.07), barrel=3.70, barrel_d=0.30, rod_d=0.16, rod_from=0.45,
                  column=0.30, column_over=0.16, footplate=(0.60, 0.90))
# The lights of the after end. Each: what it is for, where (x off the centreline, height over the waterline, metres AFT of
# the transom's plating).
#   the sternlight   white, over 135 degrees astern (COLREG rule 21, as the yard recalls it): at the stern on the
#                    bulwark's rail, to port of the raised ramp, which stands on the centreline. Component NLT-06.
#   two floodlights  on posts on the bulwark's rail beside the door's two corners, looking aft and `tilt` degrees down: they
#                    light the ramp and the quay for those who drive aboard at night and for the crew who work the ramp.
#   the signal       red over green on the transom to starboard of the door, where a driver coming aboard (who sits to
#                    starboard: she sails in Japan) sees it: wait, or drive on.
RAIL_AFT = UPPER_DECK + _L.BULWARK
STERN_LIGHTS = dict(
    sternlight=dict(x=5.6, y=RAIL_AFT + 0.02, aft=0.11),
    floods=dict(x=5.2, y=RAIL_AFT + 0.40, aft=0.06, tilt=50, head=(0.32, 0.22, 0.16)),
    signal=dict(x=-5.4, y=MAIN_DECK + 2.45, size=(0.30, 0.58, 0.14)),
)

# ---- Structure. Frames stand at every 0.6 m (frame 0 at the transom): a 200 x 90 mm angle below the main deck and a
# 150 x 75 mm one in the topsides. Every third frame is a web frame, 400 mm deep. Forward of the collision bulkhead, where
# the sea strikes her, a lighter frame stands between each pair.
FRAME_WEB = 0.200
FRAME_FLANGE = 0.090
WEB_FRAME = 0.400
WEB_EVERY = 3
TOPSIDE_FRAME = 0.150
INTERMEDIATE_WEB = 0.120
DECK_BEAM = 0.25                           # the depth of a deck's beams under its plating
DECK_WEB = 0.90                            # and of the web beams that carry the upper deck across the lanes, at every sixth frame
# Watertight bulkheads (ga.BULKHEADS, by frame), to the main deck.
BULKHEADS = tuple(dict(frame=n, yard=fr(n), name=name[0].upper() + name[1:] + f' (frame {n})') for n, name in ga.BULKHEADS)
COLLISION = fr(ga.COLLISION)
INTERMEDIATE_FROM = COLLISION
# The double bottom: from frame 42, where the run aft has risen 1.06 m and the bottom leaves no room under a tank top, to
# the collision bulkhead. Forward of it and aft of it the floors carry a face bar and no tank top.
DOUBLE_BOTTOM = (fr(42), fr(ga.COLLISION))
TIGHT_FLOORS = tuple(fr(n) for n in (42, 64, 78, 100, 122, 144, 164, 184))
# Girders: the centre girder, one under each main engine (the engines sit on the shaft lines), one outboard.
GIRDERS = (3.4, 6.4)
# Longitudinal bulkheads below the main deck: the sides of the tanks and of the lower hold (ga.py). Each: yard from, yard
# to, off the centreline, and the doorways cut in the port one (yard from, yard to, sill and head over the tank top).
TANK_SIDES = (
    dict(yard=(fr(12), fr(28)), x=1.2),
    dict(yard=(fr(78), fr(144)), x=ga.HOLD_SIDE, doors=((47.3, 48.2, 0.0, 2.05),)),
    dict(yard=(fr(144), fr(164)), x=1.8),
)
# The lower hold stair's trunk in the port wing tank (ga: hold-stair): its forward end, a plate across from the hold's side
# to the shell.
TRUNK_END = dict(yard=54.6, x=ga.HOLD_SIDE)

# ---- Shafts, screws, rudders. Twin screws turning outward, controllable-pitch, 3.0 m in diameter. Each shaft runs
# straight from its gearbox's output flange in the engine room (3.4 m off the centreline, 25.6 m from the transom) to its
# screw, falling 2 degrees aft; it leaves her about 19 m from the transom, under the engine room platform.
SHAFT_X = 3.4
SHAFT_RISE = tan(radians(2.0))             # per metre going forward
SCREW = dict(yard=8.0, y=Y(1.7), diameter=3.0, blades=4, pitch_ratio=0.95, hub=0.42)
GEARBOX_FLANGE = dict(yard=25.6, y=SCREW['y'] + SHAFT_RISE * (25.6 - 8.0), radius=0.30)
SHAFT_RADIUS = 0.14                # a 280 mm shaft
SHAFT_COUPLING = 22.6              # where the intermediate shaft is coupled to the tail shaft
STERN_TUBE_SEAL = 21.4             # the stern tube's inboard seal
PLUMMER_BLOCK = 24.2               # the intermediate shaft's bearing, in the engine room
BRACKETS = (9.5, 14.2)             # the shaft brackets: the main one ahead of the screw, and one halfway along the open shaft
RUDDER = dict(yard_stock=4.2, top=Y(3.82), bottom=Y(0.35), chord_top=2.30, chord_bottom=1.90, balance=0.28, thickness=0.17)

# ---- The spaces the hull gives a floor to.
STEERING_FLAT = AFT_FLAT           # the flat in the steering gear room and the after passage, just over the floors there
THRUSTER_FLAT = TANK_TOP           # the flat in the thruster room, level with the tank top abaft it
# The steering gear. A tiller on each stock points forward; a tie bar joins their ends; a ram lies athwartships outboard
# of each tiller, trunnioned on a stool and pinned to the tiller two thirds along it. 35 degrees each way.
TILLER = dict(level=STEERING_FLAT + 0.45, reach=1.25, ram_at=0.84, ram_anchor=2.10, clevis=0.13, tie_bar=0.20)
RUDDER_ANGLE = 35

# ---- The ways on foot below the main deck. The first Chisum had hinged watertight doors on the centreline at the owner's
# word (10 November 2026: "There needs to be a water tight door that can open to the steering gear"; "all rooms need to be
# accessible") and she has them the same way: a door 0.70 m by 1.60 m clear over a 0.20 m sill, corners rounded, six dogs
# worked by a handwheel, hung to port and opening 90 degrees. `floor` is the level the sill stands on; `opens` +1 toward
# the bow. The lower hold's after bulkhead has none (the hold is a cargo space, entered by its own stair and the lift), and
# the collision bulkhead has none.
# **To be settled with class:** a passenger ship's doors in her watertight bulkheads are to be sliding and power-operated
# (SOLAS II-1, regulation 13, as the yard recalls it; not read). These are drawn hinged until the machinery spaces are built.
WT_DOOR = dict(width=0.70, height=1.60, sill=0.20, corner=0.12, frame=0.07, leaf=0.02, open=90, reach=2.4)
WT_DOORS = (
    dict(id='door-steering-gear', name='Door to the steering gear', where='steering gear', yard=fr(12), floor=STEERING_FLAT, opens=1),
    dict(id='door-aft-passage', name='Door to the after passage', where='after passage', yard=fr(28), floor=PLATFORM, opens=1),
    dict(id='door-aux-engine-room', name='Door between the engine rooms', where='engine rooms', yard=fr(64), floor=TANK_TOP, opens=1),
    dict(id='door-pump-room', name='Door to the forward pump room', where='pump room', yard=fr(144), floor=TANK_TOP, opens=-1),
    dict(id='door-thruster-room', name='Door to the thruster room', where='thruster room', yard=fr(164), floor=TANK_TOP, opens=-1),
)
# The way through the after passage, on the centreline: inside the engine room's door a platform at the engine room
# platform's level, three treads up, and the flat at the steering gear's level as far as its door.
WALKWAY = dict(half=0.45, platform=(15.9, 16.74), treads=3, going=0.25, flat=(7.26, 15.15), rail=0.95)

# ---- Ladders, and the hatch over one. A ladder stands upright at (x, yard); `faces` is the way one looks while on it
# (x, z); `foot` and `head` are the levels it joins. With a hatch, the opening is 0.65 m by 0.60 m in the deck over it, a
# coaming round it and a cover hinged on the ladder's side. `group` is the part of the ship it is drawn with; `wall` how
# far behind it the wall it is fastened to stands; `top` how far its stringers stand over its head.
#  - The lower hold's second way out, at its forward end: a ladder to a flush hatch in the main deck, on the line between
#    the two starboard lanes, where no wheel runs (the first way is the stair in the port wing tank).
#  - From the bridge deck to the house top and the compass deck: up the after wall of the rooms abaft the wheelhouse.
LADDERS = (
    dict(id='ladder-lower-hold', name='Ladder to the lower hold', up='Ladder to the main deck', group='machinery',
         x=-4.5, yard=84.0, faces=(0, -1), foot=TANK_TOP, head=MAIN_DECK, hatch='hatch-lower-hold', hatch_name='Hatch to the lower hold', hatch_group='main'),
    dict(id='ladder-house-top', name='Ladder to the bridge deck', up='Ladder to the compass deck', group='bridge',
         x=1.8, yard=93.78, faces=(0, 1), foot=BRIDGE_DECK, head=COMPASS_DECK, wall=0.21, top=1.0, head_at=(1.8, 94.9)),
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


# Machinery colours: engines green, motors blue, fire red, fresh water blue.
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

# ---- The bow thruster: a 1.6 m tunnel through the forebody at frame 168, of about 600 kW.
THRUSTER = dict(yard=fr(168), y=Y(2.4), radius=0.8)

# ---- Keel, skeg, bilge keels.
# The keel bar runs from under the skeg's forward end to the forefoot. The bilge keels stand at the middle of the turn
# of the bilge (psi = pi/4) along her parallel body, where their tips stay inside her beam and above her keel.
KEEL_BAR = dict(width=0.26, depth=0.07, yard=(44.4, 112.2))
SKEG = dict(yard=(11.0, 45.4), thickness=0.30)
BILGE_KEEL = dict(yard=(46.2, 70.2), depth=0.40, psi=pi / 4)
SEA_CHEST = dict(yard=(31.8, 33.6), y=(Y(0.9), Y(1.5)))            # each side of the engine room, where the cooling water comes in

# ---- The compass deck: the wheelhouse's roof, her mast and what it carries. The first Chisum's compass deck
# (compass_deck.py) is landed here whole with her bridge (bridge_place.py); the numbers below are that block's own, in its
# own measures (metres from the first ship's transom, heights over her waterline), and the placing carries them aboard.
COMPASS = dict(deck=11.5, slab=0.32, half=3.10, yards=(19.495, 23.16), corner=0.35,
               rail=1.0, rail_in=0.13, post_every=1.45,
               step=19.495, rise=0.30, slab_top=0.28)
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
# takes a thing for an obstacle and not for the next step but one.
# ---------------------------------------------------------------------------------------------------------------------
STAIR_CLASS = dict(
    P=dict(name='passenger stair', pitch=45.0, rise=(0.170, 0.200), going=0.220, width=0.90, flight=12, tread='closed', rail=0.90),
    C=dict(name='crew stair', pitch=45.0, rise=(0.180, 0.200), going=0.200, width=0.70, flight=14, tread='closed', rail=0.90),
    L=dict(name='inclined ladder', pitch=55.0, rise=(0.190, 0.208), going=0.150, width=0.55, flight=16, tread='open', rail=0.90),
)
# Each stair: the viewer's part it is built in; `x`, the clear width between its stringers; `top`, the edge of the deck it
# comes down from (metres from the transom, height over the waterline); `down`, +1 if it comes down going forward, -1 going
# aft; `legs`, its flights as counts of steps with ('landing', length) between them; `rise` and `going`; `foot`, the level
# it reaches; `sides`, what stands at its lower-x and higher-x side ('wall': a rail on brackets, 'open': a rail on posts);
# `gaps`, how far each wall stands from the stair's edge.
#
# The side casings on the main deck are 2.3 m wide between the lanes and the shell (ga.py). A stair in one stands against
# the casing's wall: 1.2 m wide for the main stairs, 0.75 m for the crew's.
C = ga.CASING
MAIN_STAIR_X = (C + 0.025, C + 1.225)
CREW_STAIR_X = (C + 0.25, C + 1.00)
TRUNK = ga.TRUNK
# The house's stair trunk: two lanes side by side that turn back on each other at a half landing aft; each deck is entered
# at its forward landing.
LANE_PORT, LANE_STBD = (0.10, 1.15), (-1.15, -0.10)
TRUNK_AFT = (TRUNK['yard'][0], TRUNK['yard'][0] + 1.34)        # the half landing
TRUNK_FWD = (TRUNK['yard'][1] - 1.34, TRUNK['yard'][1])        # each deck's own landing
TRUNK_DECKS = (('upper', UPPER_DECK), ('boat', BOAT_DECK), ('officers', OFFICERS_DECK))
DECK_NAME = dict(upper='upper deck', boat='boat deck', officers="officers' deck")


def _mirror(st, id, name):
    return dict(st, id=id, name=name, x=(-st['x'][1], -st['x'][0]), sides=tuple(reversed(st['sides'])), gaps=tuple(reversed(st.get('gaps', (0.0, 0.0)))))


# (A stair's inboard side is the casing's wall, 20 mm off its stringer: its rail is bracketed to it. Outboard are her frames,
# with nothing between them to fasten a bracket to: the rail stands on posts from the stringer there.)
_main = dict(id='main-p', cls='P', name='main stair, port', part='main', x=MAIN_STAIR_X, top=(83.0, UPPER_DECK), down=-1,
             legs=[11, ('landing', 0.95), 11, ('landing', 0.95), 11], rise=0.200, going=0.220, foot=MAIN_DECK, sides=('wall', 'open'), gaps=(0.020, 0.0))
_L14 = dict(cls='L', legs=[14], rise=2.8 / 14, going=0.152, sides=('open', 'open'), paint=WHITE)
_er_floor = dict(id='er-floor-p', cls='C', name='engine room, port gallery to tank top', part='machinery', x=(5.50, 6.20), top=(31.0, PLATFORM), down=1,
                 legs=[12], rise=(PLATFORM - TANK_TOP) / 12, going=0.200, foot=TANK_TOP, sides=('open', 'open'), top_ext=0.10)
_boat = dict(_L14, id='boat-p', name='boat deck, port', part='upper', x=(6.45, 7.05), top=(ga.HOUSE[0], BOAT_DECK), down=-1, foot=UPPER_DECK)
_bridge = dict(_L14, id='bridge-p', name='bridge deck, port', part='officers', x=(4.90, 5.50), top=(ga.OFF, BRIDGE_DECK), down=-1, foot=OFFICERS_DECK)
_heli = dict(id='heli-p', cls='L', name='helicopter deck, port', part='upper', x=(2.40, 3.00), top=(20.0, HELIDECK), down=1, legs=[5], rise=1.0 / 5, going=0.152,
             foot=UPPER_DECK, sides=('open', 'open'), paint=WHITE)
STAIRS = [
    # ---- The two main stairs, main deck to upper deck, in the side casings under the house's after end: 33 steps in three
    # flights with two landings. They come down going aft; their heads are inside the house.
    _main, _mirror(_main, 'main-s', 'main stair, starboard'),
    # ---- The engine room: from the main deck's port casing down to the platform's port gallery, and from each gallery
    # down to the tank top beside the engines.
    dict(id='er-entrance', cls='C', name='engine room entrance', part='main', x=CREW_STAIR_X, top=(29.8, MAIN_DECK), down=-1,
         legs=[13], rise=(MAIN_DECK - PLATFORM) / 13, going=0.200, foot=PLATFORM, sides=('open', 'open'), top_ext=0.0, top_newel=False),
    _er_floor, _mirror(_er_floor, 'er-floor-s', 'engine room, starboard gallery to tank top'),
    # ---- The lower hold: from the main deck's port casing down through the wing tank to the tank top, 25 steps in two
    # flights with a landing.
    dict(id='hold-stair', cls='C', name='lower hold stair', part='main', x=CREW_STAIR_X, top=(53.6, MAIN_DECK), down=-1,
         legs=[13, ('landing', 0.80), 12], rise=(MAIN_DECK - TANK_TOP) / 25, going=0.200, foot=TANK_TOP, sides=('open', 'open'), top_ext=0.0, top_newel=False),
]
# ---- The house's stair trunk, upper deck to officers' deck: two storeys, each of two flights of seven steps. Class P:
# the drivers' cabins are on the boat deck.
for (_name, _level), (_next, _) in zip(TRUNK_DECKS, TRUNK_DECKS[1:]):
    STAIRS += [
        dict(id=f'house-{_name}-lower', cls='P', name=f'house stair, {DECK_NAME[_name]} to half landing', part=_name, x=LANE_PORT, top=(TRUNK_AFT[1], _level + 1.4), down=1,
             legs=[7], rise=0.200, going=0.220, foot=_level, sides=('open', 'wall'), gaps=(0.0, 0.045), top_ext=0.0),
        dict(id=f'house-{_name}-upper', cls='P', name=f'house stair, half landing to {DECK_NAME[_next]}', part=_name, x=LANE_STBD,
             top=(TRUNK_FWD[0], _level + 2.8), down=-1, legs=[7], rise=0.200, going=0.220, foot=_level + 1.4, sides=('wall', 'open'), gaps=(0.045, 0.0), top_ext=0.0),
    ]
STAIRS += [
    # ---- The crew's stair from the officers' deck up into the wheelhouse, as the first Chisum had one from her saloon: it
    # keeps its place in the bridge (the gate at its head is the wheelhouse's), in an enclosure of its own.
    dict(id='wheelhouse', cls='C', name='crew stair to the wheelhouse', part='officers', x=(-2.90, -2.14), top=(20.15 + BRIDGE_SHIFT, BRIDGE_DECK), down=-1,
         legs=[14], rise=0.200, going=0.200, foot=OFFICERS_DECK, sides=('wall', 'wall'), gaps=(0.050, 0.050), top_ext=0.0, top_newel=False),
    # ---- Outside: from the upper deck up the house's after end to the boat deck, abaft each lifeboat; from the officers'
    # deck abaft the house to the bridge deck; and the helicopter deck's two stairs. (The officers' deck abaft the house is
    # reached through the house and from the bridge deck: a ladder up from the boat deck would stand in a lifeboat's station.)
    _boat, _mirror(_boat, 'boat-s', 'boat deck, starboard'),
    _bridge, _mirror(_bridge, 'bridge-s', 'bridge deck, starboard'),
    _heli, _mirror(_heli, 'heli-s', 'helicopter deck, starboard'),
]

# ---- Marks.
# Figures every 20 cm from `lowest` (metres above the keel) to 7.0 m, wherever the plating is upright enough to carry one.
DRAUGHT_MARKS = (
    dict(where='aft', yard=6.6, lowest=4.8),
    dict(where='midships', yard=61.2, lowest=1.0),
    dict(where='forward', yard=112.8, lowest=3.6),
)
DRAUGHT_TOP = 7.0
LOAD_LINE_YARD = 63.6
NAME = 'CHISUM'             # as it is painted. The owner, 11 November 2026: "Maybe rename her to the Chisum", then "rename to Chisum"; she was the Christina from 9 November
SHIP_NAME = NAME.title()    # as it is written
PORT_OF_REGISTRY = 'MINATO'
NAME_YARD = 110.0           # her name on each bow
# The shipping line she sails for, lettered along each side of the hull in white. Its mark, a J in a ring, is on the
# funnels (blender/livery.py).
LINE = 'JOHANSSON LINE'            # the owner, 11 November 2026: "Johansson Line not lines by the way"
LINE_YARD = 52.0            # its middle: on the flat of her side, between the funnels and the pilot doors
LINE_COLOUR = LETTERING
