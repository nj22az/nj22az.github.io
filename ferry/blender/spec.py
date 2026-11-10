"""
The Christina's hull as specified: where her paint lines, bulkheads, shafts, screws, rudders and marks are, and why.

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
# 14 cm inside the moulded line (Rev C sheet C3), so a 75 mm frame clears them.
FRAME_WEB = 0.075
FRAME_FLANGE = 0.05
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
)
# The walkway through the shaft space: a platform at the engine room's floor plates, six treads and a flat at the
# level of the steering flat, 0.8 m wide between two rails, clear over the floors of her bottom as she rises aft.
WALKWAY = dict(half=0.40, platform=(8.05, 8.38), treads=6, going=0.25, flat=(5.06, 6.55), rail=0.95)


def door_opening(d):
    """A door's clear opening: (x0, y0, x1, y1), port and up positive."""
    y0 = d['floor'] + WT_DOOR['sill']
    return (-WT_DOOR['width'] / 2, y0, WT_DOOR['width'] / 2, y0 + WT_DOOR['height'])


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

# ---- Marks.
# Figures every 20 cm from `lowest` (metres above the keel) to 2.8 m, wherever the plating is upright enough to carry one.
DRAUGHT_MARKS = (
    dict(where='aft', yard=6.2, lowest=1.4),
    dict(where='midships', yard=16.6, lowest=0.4),
    dict(where='forward', yard=30.9, lowest=0.8),
)
LOAD_LINE_YARD = 17.6
NAME = 'CHRISTINA'
PORT_OF_REGISTRY = 'MINATO'
