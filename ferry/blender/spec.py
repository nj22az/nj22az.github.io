"""
The Chisum's hull as specified: where her paint lines, bulkheads, shafts, screws, rudders, doors, stairs and marks are,
and why.

She is the 68 m ship of the general arrangement (ga.py: her decks, her bulkheads and every space). This file is what the
builders need beyond that: numbers first, so the builder (hull_*.py, steel.py, stairs.py), the page's notes and later
sections read the same ship. Positions are in the ship's axes (lines.py): x to port, y up from the design waterline, z
forward from amidships; `yard` means metres from the transom.
"""
from math import pi, tan, radians
from lines import Y, FRAME_SPACING
import ga

BRIDGE_SHIFT = 30.505      # how far forward of its place on the first Chisum the bridge stands (bridge_place.py)


def fr(n):
    """A frame's distance from the transom."""
    return n * FRAME_SPACING


# ---- The decks, over the waterline (ga.DECKS is above the keel).
TANK_TOP = Y(ga.DECKS['tank_top'])
FLAT = Y(ga.DECKS['flat'])                 # the flat in the machinery spaces
CAR_DECK = Y(ga.DECKS['car'])
MOORING_DECK = Y(ga.DECKS['mooring'])
PASSENGER_DECK = Y(ga.DECKS['passenger'])
BRIDGE_DECK = Y(ga.DECKS['bridge'])
TOP_DECK = Y(ga.DECKS['top'])
TOP_HOUSE = Y(ga.DECKS['top_house'])

# ---- Paint (sRGB): white over red-brown antifouling, a teal band under the upper deck's edge.
ANTIFOULING = 0x8e3a30
WHITE = 0xeeeae0
TEAL = 0x2f6f74
LETTERING = 0x245c60       # her name, in the band's colour a shade deeper
MARK_DARK = 0x22282a       # draught marks on white plating
MARK_LIGHT = 0xf2efe6      # draught marks on antifouling
PRIMER = 0xb7c0b2          # grey-green shop primer: the inside of the shell, frames, floors, girders, bulkheads
BILGE_RED = 0x9a4b3d       # the tank top
STEEL = 0x8a9092
BRONZE = 0xb08a4a
ZINC = 0xb9bcb8
BLACK = 0x25292b
DECK_GREEN = 0x4f6f5e      # the weather decks and the car deck: non-skid deck paint
DECK_GREY = 0x8f9896       # steel decks inside, before any covering is laid

BOOT = 0.15                # the antifouling is carried 15 cm above the design waterline
BAND = 0.50                # the teal band's depth under the upper deck's edge
BAND_TOP = 0.03

# ---- Plating. 12 mm is drawn (her shell would be 9 to 11 mm; a little more reads better where she is cut).
SHELL = 0.012
STATION = 0.3              # the shell is drawn at every half frame at her ends
STATION_MID = (21.0, 29.4) # and at every frame where her section does not change
STRAKE_BUTT = 9.0          # a plate's length, metres; butts are shifted 3 m from strake to strake

# ---- Openings in the topsides, each side: the after mooring stations (ga: "behind openings in the shell") and the shell
# doors where foot passengers come aboard. (yards, heights over the waterline.)
MOORING_PORT = dict(yard=(1.8, 4.2), y=(CAR_DECK + 1.0, CAR_DECK + 2.2))
SHELL_DOOR = dict(yard=(31.5, 32.7), y=(CAR_DECK, CAR_DECK + 2.2))
# The topsides' rows of plating run at these heights (the openings above lie between them).
TOPSIDE_LEVELS = (CAR_DECK, CAR_DECK + 1.0, CAR_DECK + 2.2, PASSENGER_DECK - BAND, PASSENGER_DECK - BAND_TOP, PASSENGER_DECK)

# ---- Structure. Frames stand at every 0.6 m (frame 0 at the transom): a 150 x 75 mm angle below the car deck and a
# 100 x 65 mm one in the topsides. Every third frame is a web frame, 300 mm deep. Forward of the collision bulkhead, where
# the sea strikes her, a lighter frame stands between each pair.
FRAME_WEB = 0.150
FRAME_FLANGE = 0.075
WEB_FRAME = 0.300
WEB_EVERY = 3
TOPSIDE_FRAME = 0.100
INTERMEDIATE_WEB = 0.100
DECK_BEAM = 0.18                           # the depth of a deck's beams under its plating
# Watertight bulkheads (ga.BULKHEADS, by frame), to the car deck.
BULKHEADS = tuple(dict(frame=n, yard=fr(n), name=name[0].upper() + name[1:] + f' (frame {n})') for n, name in ga.BULKHEADS)
COLLISION = fr(103)
INTERMEDIATE_FROM = COLLISION
# The double bottom: from frame 24, where the run aft has risen 0.9 m and the bottom leaves no room under a tank top, to
# frame 90, abaft the thruster's tunnel. Forward of it and aft of it the floors carry a face bar and no tank top.
DOUBLE_BOTTOM = (fr(24), fr(90))
TIGHT_FLOORS = tuple(fr(n) for n in (24, 41, 55, 70, 85, 90))
# Girders: the centre girder, one under each main engine (the engines sit on the shaft lines), one outboard.
GIRDERS = (2.4, 4.6)
# Longitudinal bulkheads below the car deck: the sides of the tanks (ga.py). (yard from, yard to, off the centreline.)
TANK_SIDES = ((fr(8), fr(18), 3.0), (fr(55), fr(85), 2.2))

# ---- Shafts, screws, rudders. Twin screws turning outward, controllable-pitch. Each shaft runs straight from its
# gearbox's output flange in the engine room (2.4 m off the centreline, 12.6 m from the transom) to its screw, falling
# 8 degrees aft: steep enough that it stays inside her as far as the shaft space, where its stern tube begins.
SHAFT_X = 2.4
SHAFT_RISE = tan(radians(8.0))             # per metre going forward
SCREW = dict(yard=3.8, y=Y(1.2), diameter=2.0, blades=4, pitch_ratio=0.9, hub=0.28)
GEARBOX_FLANGE = dict(yard=12.6, y=SCREW['y'] + SHAFT_RISE * (12.6 - 3.8), radius=0.19)
SHAFT_RADIUS = 0.09                # a 180 mm shaft
SHAFT_COUPLING = 10.45             # where the intermediate shaft is coupled to the tail shaft
STERN_TUBE_SEAL = 10.05            # the stern tube's inboard seal
PLUMMER_BLOCK = 11.7               # the intermediate shaft's bearing, in the engine room
BRACKETS = (4.75, 7.3)             # the shaft brackets: the main one ahead of the screw, and one halfway along the open shaft
RUDDER = dict(yard_stock=2.4, top=Y(2.68), bottom=Y(0.25), chord_top=1.55, chord_bottom=1.30, balance=0.28, thickness=0.17)

# ---- The spaces the hull gives a floor to.
STEERING_FLAT = Y(3.15)            # the flat in the steering gear room and the shaft space, just over the floors there
ER_AFT_FLAT = Y(2.0)               # the engine room's after flat, frames 18 to 24, where the bottom is too high for the tank top
FORE_STORE_FLAT = FLAT             # the flat in the fore store, between the chain lockers
# The steering gear. A tiller on each stock points forward; a tie bar joins their ends; a ram lies athwartships outboard
# of each tiller, trunnioned on a stool and pinned to the tiller two thirds along it. 35 degrees each way.
TILLER = dict(level=STEERING_FLAT + 0.40, reach=0.95, ram_at=0.64, ram_anchor=1.60, clevis=0.10, tie_bar=0.16)
RUDDER_ANGLE = 35

# ---- The ways on foot below the car deck. The first Chisum had hinged watertight doors on the centreline at the owner's
# word (10 November 2026: "There needs to be a water tight door that can open to the steering gear"; "all rooms need to be
# accessible") and she has them the same way: a door 0.70 m by 1.60 m clear over a 0.20 m sill, corners rounded, six dogs
# worked by a handwheel, hung to port and opening 90 degrees. `floor` is the level the sill stands on; `opens` +1 toward
# the bow. The collision bulkhead has none.
# **To be settled with class:** a passenger ship's doors in her watertight bulkheads are to be sliding and power-operated
# (SOLAS II-1, regulation 13, as the yard recalls it; not read). These are drawn hinged until the machinery spaces are built.
WT_DOOR = dict(width=0.70, height=1.60, sill=0.20, corner=0.12, frame=0.07, leaf=0.02, open=90, reach=2.4)
WT_DOORS = (
    dict(id='door-steering-gear', name='Door to the steering gear', where='steering gear', yard=fr(8), floor=STEERING_FLAT, opens=1),
    dict(id='door-shaft-space', name='Door to the shaft space', where='shaft space', yard=fr(18), floor=ER_AFT_FLAT, opens=1),
    dict(id='door-aux-engine-room', name='Door between the engine rooms', where='engine rooms', yard=fr(41), floor=TANK_TOP, opens=1),
    dict(id='door-pipe-passage', name='Door to the pipe passage', where='pipe passage', yard=fr(55), floor=TANK_TOP, opens=-1),
    dict(id='door-stores', name='Door to the sewage plant and stores', where='stores', yard=fr(70), floor=TANK_TOP, opens=-1),
    dict(id='door-thruster-room', name='Door to the thruster room', where='thruster room', yard=fr(85), floor=TANK_TOP, opens=-1),
)
# The steps in the shaft space, on the centreline: from the engine room's after flat up to the steering flat.
WALKWAY = dict(half=0.45, platform=(9.9, 10.74), treads=5, going=0.25, flat=(4.86, 8.65), rail=0.95)
# And the steps in the engine room from its after flat down to the tank top (frame 24).
ER_STEPS = dict(half=0.45, treads=3, going=0.25, at=fr(24))

# ---- Ladders, and the hatch over one. A ladder stands upright at (x, yard); `faces` is the way one looks while on it
# (x, z); `foot` and `head` are the levels it joins. With a hatch, the opening is 0.65 m by 0.60 m in the deck over it, a
# coaming round it and a cover hinged on the ladder's side. `group` is the part of the ship it is drawn with.
#  - From the car deck down to the flat in the fore store, abaft the chain lockers: the collision bulkhead and the thruster
#    room's forward bulkhead have no door, so the store is entered from above. The hatch is flush with the deck and lies on
#    the line between the two middle lanes, where no wheel runs; the ladder hangs from its coaming and stands on the flat.
LADDERS = (
    dict(id='ladder-fore-store', name='Ladder to the fore store', up='Ladder to the car deck', group='machinery',
         x=0.0, yard=58.5, faces=(0, -1), foot=FORE_STORE_FLAT, head=CAR_DECK, hatch='hatch-fore-store', hatch_name='Hatch to the fore store'),
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

# ---- The bow thruster: a 1.2 m tunnel through the forefoot at frame 92, of about 300 kW.
THRUSTER = dict(yard=fr(92), y=Y(1.4), radius=0.6)

# ---- Keel, skeg, bilge keels.
# The keel bar runs from under the skeg's forward end to the forefoot. The bilge keels stand at the middle of the turn
# of the bilge (psi = pi/4) along her parallel body, where their tips stay inside her beam and above her keel.
KEEL_BAR = dict(width=0.20, depth=0.06, yard=(20.4, 62.2))
SKEG = dict(yard=(6.4, 21.4), thickness=0.24)
BILGE_KEEL = dict(yard=(21.6, 40.2), depth=0.30, psi=pi / 4)
SEA_CHEST = dict(yard=(17.4, 18.6), y=(Y(0.75), Y(1.25)))          # each side of the engine room, where the cooling water comes in

# ---- The top deck's forward end is the compass deck: the wheelhouse's roof, her mast and what it carries. The first
# Chisum's compass deck (compass_deck.py) is landed here whole with her bridge (bridge_place.py); the numbers below are
# that block's own, in its own measures (metres from the first ship's transom, heights over her waterline), and the
# placing carries them aboard.
COMPASS_DECK = dict(deck=11.5, slab=0.32, half=3.10, yards=(19.495, 23.16), corner=0.35,
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
# The forecastle is level with the passenger deck, so no stair leads to it.
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
# The side casings on the car deck are 1.6 m wide between the lanes and the shell (ga.py): 1.45 m clear between the casing's
# wall and the frames. A main stair is that wide. The crew's stair trunk has two lanes of 0.70 m in it, side by side.
CASING_CLEAR = (5.225, 6.675)
LANE_IN, LANE_OUT = (5.225, 5.925), (5.975, 6.675)
_P = (PASSENGER_DECK - CAR_DECK) / 24          # 24 steps of 196 mm between the car deck and the passenger deck
_MID = CAR_DECK + 12 * _P                      # the crew stair's half landing between them


def _mirror(st, id, name):
    return dict(st, id=id, name=name, x=(-st['x'][1], -st['x'][0]), sides=tuple(reversed(st['sides'])), gaps=tuple(reversed(st.get('gaps', (0.0, 0.0)))))


# (A stair's inboard side is the casing's wall, 8 mm off its stringer: its rail is bracketed to it. Outboard are her frames,
# with nothing between them to fasten a bracket to: the rail stands on posts from the stringer there.)
_main_aft = dict(id='main-aft-p', cls='P', name='after main stair, port', part='car', x=CASING_CLEAR, top=(25.2, PASSENGER_DECK), down=1,
                 legs=[12, ('landing', 0.95), 12], rise=_P, going=0.220, foot=CAR_DECK, sides=('wall', 'open'), gaps=(0.020, 0.0))
_main_fwd = dict(id='main-fwd-p', cls='P', name='forward main stair, port', part='car', x=CASING_CLEAR, top=(44.8, PASSENGER_DECK), down=-1,
                 legs=[12, ('landing', 0.95), 12], rise=_P, going=0.220, foot=CAR_DECK, sides=('wall', 'open'), gaps=(0.020, 0.0))
_L14 = dict(cls='L', legs=[14], rise=2.8 / 14, going=0.152, sides=('open', 'open'), paint=WHITE)
STAIRS = [
    # ---- The four main stairs, car deck to passenger deck, in the side casings: 24 steps in two flights with a landing.
    # The after ones come down going forward and end in the shell door lobbies, where foot passengers come aboard; the
    # forward ones come down going aft and end in a foot lobby of their own.
    _main_aft, _mirror(_main_aft, 'main-aft-s', 'after main stair, starboard'),
    _main_fwd, _mirror(_main_fwd, 'main-fwd-s', 'forward main stair, starboard'),
    # ---- The crew's stair trunk, port side, 20 to 24 m from the transom (the owner, of the first Chisum: "an internal stair case too so
    # you can run all way from the bridge to the engine room"): one enclosed stair from the machinery flat to the bridge
    # deck, in two lanes that turn back on each other at a landing at each end. Each deck is entered at the trunk's forward
    # landing; the last flight arrives inside the accommodation.
    dict(id='crew-machinery', cls='C', name='crew stair, machinery flat to car deck', part='machinery', x=LANE_IN, top=(23.2, CAR_DECK), down=-1,
         legs=[11], rise=(CAR_DECK - FLAT) / 11, going=0.200, foot=FLAT, sides=('open', 'open'), top_ext=0.0, top_newel=False),
    dict(id='crew-car-lower', cls='C', name='crew stair, car deck to half landing', part='car', x=LANE_OUT, top=(20.8, _MID), down=1,
         legs=[12], rise=_P, going=0.200, foot=CAR_DECK, sides=('open', 'open'), top_ext=0.0),
    dict(id='crew-car-upper', cls='C', name='crew stair, half landing to passenger deck', part='car', x=LANE_IN, top=(23.2, PASSENGER_DECK), down=-1,
         legs=[12], rise=_P, going=0.200, foot=_MID, sides=('wall', 'open'), gaps=(0.020, 0.0), top_ext=0.0),
    dict(id='crew-pax-lower', cls='C', name='crew stair, passenger deck to half landing', part='passenger', x=LANE_OUT, top=(21.8, PASSENGER_DECK + 1.4), down=1,
         legs=[7], rise=0.200, going=0.200, foot=PASSENGER_DECK, sides=('open', 'wall'), gaps=(0.0, 0.111), top_ext=0.0),
    dict(id='crew-pax-upper', cls='C', name='crew stair, half landing to bridge deck', part='passenger', x=LANE_IN, top=(22.2, BRIDGE_DECK), down=-1,
         legs=[7], rise=0.200, going=0.200, foot=PASSENGER_DECK + 1.4, sides=('wall', 'open'), gaps=(0.020, 0.0), top_ext=0.0),
    # ---- The crew's stair from the forward lounge up into the wheelhouse, as the first Chisum had one from her saloon: it
    # keeps its place in the bridge (the gate at its head is the wheelhouse's), in an enclosure of its own in the lounge and
    # a casing in the ship's office. The bridge's second way out.
    dict(id='wheelhouse', cls='C', name='crew stair to the wheelhouse', part='passenger', x=(-2.90, -2.14), top=(20.15 + BRIDGE_SHIFT, BRIDGE_DECK), down=-1,
         legs=[14], rise=0.200, going=0.200, foot=PASSENGER_DECK, sides=('wall', 'wall'), gaps=(0.050, 0.050), top_ext=0.0, top_newel=False),
    # ---- In the machinery spaces: from the engine room's port platform (the foot of the crew stair) down to the tank top,
    # and up to the engine control room and the workshop on their flats in the auxiliary engine room.
    # (Crew stairs, not inclined ladders: the flat is 1.70 m over the tank top, which is nine steps of 189 mm or eight of
    # 213 mm, and the standard's ladder has steps of 190 to 208 mm. Nine steps of a crew stair keep it.)
    dict(id='engine-room', cls='C', name='engine room, platform to tank top', part='machinery', x=(4.20, 4.90), top=(19.4, FLAT), down=-1,
         legs=[9], rise=(FLAT - TANK_TOP) / 9, going=0.200, foot=TANK_TOP, sides=('open', 'open'), top_ext=0.10),
    dict(id='control-room', cls='C', name='engine control room', part='machinery', x=(2.70, 3.40), top=(27.6, FLAT), down=-1,
         legs=[9], rise=(FLAT - TANK_TOP) / 9, going=0.200, foot=TANK_TOP, sides=('open', 'open'), top_ext=0.10),
    dict(id='workshop', cls='C', name='workshop', part='machinery', x=(-3.40, -2.70), top=(27.6, FLAT), down=-1,
         legs=[9], rise=(FLAT - TANK_TOP) / 9, going=0.200, foot=TANK_TOP, sides=('open', 'open'), top_ext=0.10),
    # ---- Outside: from the open passenger deck aft up to the bridge deck's open deck, each side of the funnels; from the
    # bridge deck's open deck up to the top deck, against the galley's after wall.
    dict(_L14, id='aft-p', name='bridge deck, port', part='passenger', x=(5.95, 6.55), top=(13.0, BRIDGE_DECK), down=-1, foot=PASSENGER_DECK),
    dict(_L14, id='aft-s', name='bridge deck, starboard', part='passenger', x=(-6.55, -5.95), top=(13.0, BRIDGE_DECK), down=-1, foot=PASSENGER_DECK),
    dict(id='top-deck', cls='L', name='top deck', part='bridge', x=(-3.30, -2.70), top=(22.0, TOP_DECK), down=-1, legs=[14], rise=2.7 / 14,
         going=0.152, foot=BRIDGE_DECK, sides=('open', 'open'), paint=WHITE),
]
# The crew stair trunk's own floors: its landings (yards, lanes, level), which steel.py lays between its walls.
CREW_TRUNK = dict(yard=(20.0, 24.0), x=(5.2, 6.8), aft=(20.0, 20.8), fwd=(23.2, 24.0), mid=_MID, upper=PASSENGER_DECK + 1.4)

# ---- Marks.
# Figures every 20 cm from `lowest` (metres above the keel) to 4.4 m, wherever the plating is upright enough to carry one.
DRAUGHT_MARKS = (
    dict(where='aft', yard=6.0, lowest=3.0),
    dict(where='midships', yard=33.9, lowest=0.6),
    dict(where='forward', yard=62.0, lowest=1.2),
)
DRAUGHT_TOP = 4.4
LOAD_LINE_YARD = 35.4
NAME = 'CHISUM'             # as it is painted. The owner, 11 November 2026: "Maybe rename her to the Chisum", then "rename to Chisum"; she was the Christina from 9 November
SHIP_NAME = NAME.title()    # as it is written
PORT_OF_REGISTRY = 'MINATO'
NAME_YARD = 58.6            # her name on each bow, in the band's height
# The shipping line she sails for, lettered along each side of the hull, and its colour (the funnels' teal). Its mark, a J
# in a ring, is on the funnels (blender/livery.py).
LINE = 'JOHANSSON LINE'            # the owner, 11 November 2026: "Johansson Line not lines by the way"
LINE_YARD = 38.7           # its middle: forward of the shell doors and on the flat of her side, abaft where she begins to narrow (lettering
                           # 1 m high laid on curved plating dips under it between its own corners: zfight.py found 4.6 mm of it)
LINE_COLOUR = 0x2f6f74
