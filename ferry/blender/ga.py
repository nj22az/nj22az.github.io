"""
The Chisum, a ro-ro freight ferry of 124.8 m: her general arrangement, as numbers. Revision D (12 November 2026).

**What she is now, and why.** Until this revision she was a car and passenger ferry of 68.4 m (revision C). The owner,
11 and 12 November 2026: "also it needs life boats , I think the decks needs to be more spacious try to make the ship more
realistic in proportions"; "maybe 69 meters is too small ? maybe we need it bigger? and several cargo decks?"; with real
arrangement drawings in hand, "maybe a Cargo ship is more fun ?"; and then chose: **a ro-ro freight ferry of about 125 m,
a classic of the 1970s kept in service and refitted**. Also: "exterior needs to be more realistic too, now it looks like a
bunch of boxes on top of each other"; "there needs to be walkways on deck, helipad, etc"; "the pilot door should also be
mechanical of course, not an open door , the ship needs to be seaworthy"; "The chimney needs to be functional".

Her story: built in 1974 for Johansson Line's island service, Minato to Kitano-jima; refitted since (modern instruments in
the original wheelhouse, a helicopter deck added aft).

**Her pattern** is the Mashala class (Rickmers Werft, Bremerhaven, 1977; later Riverdance): 116.30 x 17.40 m, 5.70 m deep
to the 2nd (main trailer) deck and 12.20 m to the 1st (upper) deck, two medium-speed engines through gears to two
controllable-pitch propellers, twin spade rudders, a bow thruster, a bulbous bow, the accommodation forward, a lower hold
for cars forward of the engine room, a fixed ramp from the main deck to the upper deck, a motor lifeboat each side. Her
general arrangement at 1:200 is printed as figure 1 of MAIB report 18/2009 and was looked at for this revision (profile,
deck outlines, the order of the rooms); `ferry/yard/reference/roro-freight-ships.md`, section 1b, is the reading of it.
She is stretched and widened toward the Bison class (J.J. Sietas, 1975: 125.0 x 19.05 m). Nothing is traced or copied:
what a real ship has, in what order and how large, is taken; every line here is the yard's own.

**Where each figure comes from** (P the pattern's drawing or its report; R another reference in ferry/yard/reference/;
Y the yard's own, chosen for this ship):
  - length over all 124.8 m, breadth 19.6 m: Y, between the pattern (116.3 x 17.4) and the Bison class (125.0 x 19.05);
  - depth to the main deck 6.6 m and to the upper deck 13.2 m: Y. The pattern's are 5.70 and 12.20 (P); the 6.6 m between
    the two decks is the pattern's 6.50 m (P) with a free height of 5.0 m and more under the beams, which is what lorries
    want (R: comparable-ferries, 4.8 to 5.1 m; Bore Bank 5.00 m);
  - draught 5.6 m: Y (the pattern's 5.379 m at 5.70 m depth, P);
  - 17.5 knots on two engines of about 4,000 kW: Y (the Bison class has 8,825 kW for 18.5 knots, R);
  - machinery aft under the main deck with a platform deck for the control room and workshop; a lower hold forward of it;
    the steering gear right aft; the thruster room forward of the hold: P;
  - five lanes of 3.0 m between side casings: R (lanes 2.9 to 3.0 m: roro-freight-ships, section 4), the casings as the
    guide's midship section of a ro-ro ship has them (Eyres and Bruce, chapter 17);
  - the lower hold reached by a cargo lift whose platform is the hatch cover when raised: R (Searunner, Coutances, Dana
    Maxima used lifts; the guide, chapter 25). The pattern has a ramp down to its hold: the yard's choice of a lift is the
    owner's ("ramps and a cargo lift");
  - a fixed ramp to the upper deck at 1 in 8: R (Bore Bank: under 8 degrees); along the starboard side: Y (the pattern's
    is on the centre);
  - a stern ramp 9.0 m wide in an opening 5.2 m high, 11 m long: Y (no source gives a classic ship's). In one length:
    raised, it stands over the upper deck at the stern, as the pattern's profile shows hers;
  - room sizes: R (owner-drawings-2026-11-12.md: single cabin with wet unit 2.5 x 4.9 m, mess for 32 in 7.8 x 7 m,
    galley 6.5 x 5.8 m, corridors 1.0 to 1.3 m, deck heights 2.75 to 3.0 m);
  - one lifeboat each side under gravity davits, the port one also the rescue boat: R (comparable-ferries, section 3);
  - the house's front 0.17 of her length from the stem, the funnels' tops under the wheelhouse's top: R
    (comparable-ferries, section 2);
  - the helicopter deck and the walkways: the owner's own words; their sizes Y.

**Where she departs from the pattern, and why.** Her house stands on the upper deck itself (galley, messes, lounges at
13.2 m); the pattern's stands one deck higher over a garage. Her funnels are a pair on the side casings, as the European
Gateway class has them, where the pattern has one casing to starboard. She carries 50 drivers and passengers where the
pattern carried 12, so she is a passenger ship by rule.

This file is that ship set out before anything of her is built: her principal particulars, her decks, her watertight
bulkheads and every space, each with where it is and what it is for. The hull (lines.py), the steel (steel.py), the page's
list of rooms (assemble.py) and the drawing JS1-102 (ferry/yard/drawings/) are made from it, so that they cannot differ.

**It is a proposal for the owner's approval.** Nothing in it is calculated beyond the sums written beside the figures and
the volume under her lines: no stability, no scantlings, no tonnage, no floodable length.

Frame: a place is (metres from the transom, metres to port of the centreline, metres above the keel).
No Blender here: plain Python.
"""

# ---- Principal particulars
LENGTH = 124.8           # over all: 208 frame spaces of 0.6 m, frame 0 at the transom
FRAME_SPACING = 0.6
LPP = 114.0              # between perpendiculars: the after one at the rudder stocks (4.2 m), the forward one at 118.2 m
BEAM = 19.6              # moulded
DEPTH = 6.6              # to the main (trailer) deck: the bulkhead deck and the freeboard deck
DEPTH_UPPER = 13.2       # to the upper (weather) deck
DRAFT = 5.6              # design
BLOCK = 0.66             # block coefficient of her lines as lofted (lines.py: 8,265 m³ under the design waterline)
SPEED = 17.5             # knots, service
CREW, DRIVERS = 25, 50
# Displacement, from the figures above: 0.661 x 114.0 x 19.6 x 5.6 x 1.025 = 8,478 t
DISPLACEMENT = round(0.661 * LPP * BEAM * DRAFT * 1.025)
HB = BEAM / 2

# ---- The vehicle decks
LANE = 3.0               # a trailer lane
CASING = 7.5             # the side casings' inboard walls, off the centreline: five lanes of 3.0 m between them
STERN_DOOR = dict(half=4.5, height=5.2)                       # the opening in the transom
STERN_RAMP = dict(length=11.0, half=4.7)                      # the ramp: one length, as the pattern's; raised, it stands 4.4 m over the upper deck
FIXED_RAMP = dict(yard=(12.6, 65.4), x=(-7.5, -3.9), slope=8.0)     # main deck to upper deck: 6.6 m in 52.8 m, 1 in 8
RAMP_OPENING = dict(yard=(24.6, 65.4), x=(-7.5, -3.9))        # where it comes up through the upper deck, under its cover
CARGO_LIFT = dict(yard=(50.0, 66.0), half=1.8)                # the lift to the lower hold: 16.0 x 3.6 m
HOLD_SIDE = 5.9          # the lower hold's side walls: wing tanks outboard of them, about a fifth of her breadth
HELIDECK = dict(yard=10.0, across=19.0, over=1.0)             # an octagon 19 m across its flats, 1.0 m over the upper deck; its
#                                                               middle 10.0 m from the transom, so that its forward corners' edges
#                                                               pass 0.1 m clear of the funnels' after inboard corners (at 10.5 m
#                                                               they cut 0.2 m into them: found 12 November 2026)
FUNNEL = dict(yard=(16.2, 23.2), x=(7.5, 9.5), top=22.4)      # each funnel's casing on the upper deck, and its top above the keel
HOUSE = (80.0, 104.0)    # the house, on the upper deck
HOUSE_HALF = 7.5         # the half breadth of its upper tiers (the boat deck's house and those over it)
BOAT_RECESS = 5.9        # the boat deck's house is this narrow where the lifeboats stand beside it,
BOAT_RECESS_TO = 91.0    # from its after end to here: 3.6 m of deck and more each side for a boat under gravity davits
LIFEBOAT = (81.5, 90.5)  # each lifeboat's station along her side: 9.0 m (the rail has a gap there)
LIFERAFTS = (93.0, 95.4, 97.8)                                # where a liferaft's cradle stands at the rail, each side (the rail has a gap of 1.7 m at each)
TRUNK = dict(yard=(91.0, 95.0), half=1.2)                     # the house's stair trunk

PARTICULARS = [
    ('Type', 'Ro-ro freight ferry (ro-ro cargo and passenger ship): a stern ramp, a main trailer deck, a weather deck reached by a fixed ramp, a lower hold reached by a cargo lift'),
    ('Owner and service', 'Johansson Line; Minato to Kitano-jima and back. Built 1974, refitted'),
    ('Length over all', f'{LENGTH:.1f} m'),
    ('Length between perpendiculars', f'{LPP:.1f} m'),
    ('Breadth moulded', f'{BEAM:.1f} m'),
    ('Depth to the main deck', f'{DEPTH:.1f} m'),
    ('Depth to the upper deck', f'{DEPTH_UPPER:.1f} m'),
    ('Design draught', f'{DRAFT:.1f} m'),
    ('Displacement at that draught', f'about {DISPLACEMENT:,} t (block coefficient {BLOCK})'),
    ('Service speed', f'{SPEED:.1f} knots'),
    ('Main engines', 'Two medium-speed diesels of about 4,000 kW each, each through a reduction gear to a controllable-pitch propeller of 3.0 m'),
    ('Steering and manoeuvring', 'Two spade rudders; a bow thruster of about 600 kW in a tunnel; a bulbous bow'),
    ('Generators', 'Three diesel sets of about 500 kW, 450 V, 60 Hz, in an auxiliary engine room of their own; an emergency set in a room on the officers\' deck'),
    ('Vehicles', f'Main deck: five lanes of {LANE:.1f} m, 5.0 m and more clear. Upper deck: trailers in the open, by a fixed ramp at 1 in 8. Lower hold: cars and trailers, by a lift of 16.0 x 3.6 m'),
    ('Drivers and passengers', f'{DRIVERS}: eight berths in four cabins on the boat deck, the others in the drivers\' lounge'),
    ('Crew', f'{CREW}: six officers on the officers\' deck; nineteen ratings in twelve cabins on the boat deck: six single cabins, six across the front with two berths, and one single cabin that takes a second'),
    ('Life-saving', 'One lifeboat for 40 each side under gravity davits on the boat deck (the port one is also the rescue boat); three liferafts for 25 each side'),
    ('Frame spacing', f'{FRAME_SPACING:.1f} m, frames 0 (the transom) to {round(LENGTH / FRAME_SPACING)}'),
]

# ---- The decks, above the keel
DECKS = dict(
    tank_top=1.6,        # the inner bottom: the lower hold's floor, and the machinery spaces' forward of 25 m
    platform=4.0,        # the engine room platform: control room, switchboard room, workshop, stores
    aft_flat=4.7,        # the flat in the steering gear room and the after passage, over the rising bottom
    main=6.6,            # the main deck: trailers; the bulkhead deck
    upper=13.2,          # the upper deck: trailers in the open aft of the house, the house's lowest tier, the forecastle
    helideck=14.2,       # the helicopter deck, over the upper deck aft
    boat=16.0,           # the boat deck: cabins, the lifeboats
    officers=18.8,       # the officers' deck
    bridge=21.6,         # the bridge deck: the wheelhouse and its wings
    compass=24.3,        # the compass deck: the wheelhouse's top
)
TIER = 2.8               # the house's tiers, deck to deck (the references: 2.75 to 3.0 m)
FUNNEL_TOP, MAST_TOP = FUNNEL['top'], 28.9        # the mast is her bridge's own, from the first Chisum: 23.3 m over the waterline
PLANS = (
    ('top', 'Compass deck', 24.3), ('bridge', 'Bridge deck', 21.6), ('officers', "Officers' deck", 18.8), ('boat', 'Boat deck', 16.0),
    ('upper', 'Upper deck', 13.2), ('main', 'Main deck', 6.6),
    ('hold', 'Below the main deck (at the tank top; the platform at 4.0 m shown dashed)', 1.6),
)

# ---- The watertight bulkheads below the main deck: (frame, what it divides)
BULKHEADS = [
    (12, 'after peak bulkhead'), (28, "the engine room's after bulkhead"), (64, 'between the engine room and the auxiliary engine room'),
    (78, "the lower hold's after bulkhead"), (144, "the lower hold's forward bulkhead"), (164, "the thruster room's after bulkhead"),
    (184, 'collision bulkhead'),
]
COLLISION = 184
# The collision bulkhead stands 7.8 m abaft the forward perpendicular: between 5 % of the length (5.7 m) and 8 % (9.1 m),
# which is where the yard recalls the rule to want it (SOLAS II-1, regulation 12; not read for this revision).


def fr(n):
    return n * FRAME_SPACING


# ---- The hull's outline, from her lines (lines.py): half-breadth at a level at a place along her, and the keel line.
def half_breadth(yard, level='main'):
    """Half her breadth at `yard`: at the main deck's edge ('main'), at the upper deck's ('upper': it and the decks over
    it, which stand in line with her side), or below the main deck ('hold')."""
    import lines as L
    if yard < 0 or yard > LENGTH:
        return 0.0
    z = L.Z(yard)
    if level == 'hold':
        # at the tank top; where her bottom has risen over it (aft, and at the forefoot), 0.6 m over her bottom
        return L.hull_x(min(L.MAIN - 0.05, max(L.Y(DECKS['tank_top']), L.keel_y(z) + 0.6)), z)
    return L.upper_breadth(z) if level == 'upper' else L.half_breadth(z)


def keel(yard):
    """The underside of the hull on the centreline, above the base: the keel, the run rising aft over the screws, the raked stem."""
    import lines as L
    return L.above_keel(L.keel_y(L.Z(min(max(yard, 0.0), LENGTH))))


# ---- The spaces. Each: the deck's plan it is drawn on, an id, its name, from and to (metres from the transom), from and
# to off the centreline (port is positive), what kind of space it is, and why it is there.
KINDS = dict(machinery='Machinery', tank='Tanks and voids', vehicle='Vehicles', passenger='Drivers and passengers', crew='Crew', service='Stores and service',
             safety='Safety', open='Open deck', bridge='Navigation')
SPACES = []


def S(plan, id, name, a, b, x0, x1, kind, why='', level=None, label=None):
    # `label`: where its number stands on the drawing (metres from the transom, off the centreline), when not at its middle
    SPACES.append(dict(plan=plan, id=id, name=name, yard=(a, b), x=(min(x0, x1), max(x0, x1)), kind=kind, why=why, level=level, label=label))


def both(plan, id, name, a, b, x0, x1, kind, why='', names=None):
    """The same space on each side: port first."""
    S(plan, id + '-p', (names[0] if names else name + ', port'), a, b, x0, x1, kind, why)
    S(plan, id + '-s', (names[1] if names else name + ', starboard'), a, b, -x0, -x1, kind, why)


C = CASING
# ---------------------------------------------------------------------------------------------------------------------
# Below the main deck
# ---------------------------------------------------------------------------------------------------------------------
S('hold', 'steering-gear', 'Steering gear room', 0.0, fr(12), -HB, HB, 'machinery',
  'Right aft, as the pattern has it: a tiller on each rudder stock, a tie bar, a ram on each, two hydraulic power units, the emergency steering position', level='aft')
S('hold', 'aft-passage', 'After passage', fr(12), fr(28), -1.2, 1.2, 'machinery',
  'The way from the engine room to the steering gear, over the rising bottom: the propeller pitch oil units, the fresh water pumps', level='aft')
both('hold', 'fw-tank', 'Fresh water tank', fr(12), fr(28), 1.2, HB, 'tank', 'About 60 m³ each side')
S('hold', 'engine-room', 'Engine room', fr(28), fr(64), -HB, HB, 'machinery',
  'Two main engines and their gears on the tank top forward of 25 m, the pumps, coolers and purifiers round them; abaft them the bottom rises and the platform lies across her')
S('hold', 'er-platform', 'Engine room platform', fr(28), fr(64), -HB, HB, 'machinery',
  'At 4.0 m: across her abaft the engines, and a gallery each side of them. The stair from the main deck arrives on the port gallery; a stair each side goes down to the tank top', level='platform')
S('hold', 'switchboard-room', 'Main switchboard room (on the platform)', fr(28), 21.0, 0.9, 7.4, 'machinery', 'The main switchboard, 450 V, behind the control room', level='platform')
S('hold', 'ecr', 'Engine control room (on the platform)', 21.0, fr(42), 0.9, 7.4, 'machinery',
  'The control desk, looking forward over the engines through its windows. The pattern has it on the platform deck beside the workshop', level='platform')
S('hold', 'workshop', 'Engine workshop (on the platform)', fr(28), 21.0, -7.4, -0.9, 'service', 'Bench, lathe, drill, welding; the board with the engines\' service intervals', level='platform')
S('hold', 'engine-store', 'Engine store (on the platform)', 21.0, fr(42), -7.4, -0.9, 'service', 'Spares', level='platform')
S('hold', 'aux-engine-room', 'Auxiliary engine room', fr(64), fr(78), -HB, HB, 'machinery',
  'Three diesel generators, the compressors, the boiler. A room of its own, so a fire in one machinery room leaves the other')
S('hold', 'lower-hold', 'Lower hold', fr(78), fr(144), -HOLD_SIDE, HOLD_SIDE, 'vehicle',
  'Cars and trailers on the tank top, three lanes, 4.4 m clear: reached by the cargo lift from the main deck. In one length, as ships of her time had it')
S('hold', 'hold-stair', 'Lower hold stair', fr(78), 54.6, HOLD_SIDE, HB, 'crew', 'The way on foot between the main deck and the lower hold, in a trunk through the port wing tank')
S('hold', 'heeling-tank-p', 'Heeling tank, port', 54.6, fr(100), HOLD_SIDE, HB, 'tank', 'Joined to the starboard one by a cross-over and a reversible pump, for loading trailers on one side')
S('hold', 'heeling-tank-s', 'Heeling tank, starboard', fr(78), fr(100), -HB, -HOLD_SIDE, 'tank')
both('hold', 'fuel-tank', 'Fuel oil tank', fr(100), fr(122), HOLD_SIDE, HB, 'tank', 'Wing tanks, about 110 m³ each side')
both('hold', 'ballast-tank', 'Ballast tank', fr(122), fr(144), HOLD_SIDE, HB, 'tank')
S('hold', 'pump-room', 'Forward pump room', fr(144), fr(164), -1.8, 1.8, 'machinery', 'Ballast, bilge and fire pumps forward; the heeling pump')
both('hold', 'deep-tank', 'Deep tank', fr(144), fr(164), 1.8, HB, 'tank', 'Ballast')
S('hold', 'thruster-room', 'Bow thruster room', fr(164), fr(COLLISION), -HB, HB, 'machinery', 'The thruster in its tunnel, its motor of about 600 kW and its starter')
S('hold', 'fore-peak', 'Fore peak tank', fr(COLLISION), 120.6, -HB, HB, 'tank', 'Ballast, down into the bulb')

# ---------------------------------------------------------------------------------------------------------------------
# The main deck
# ---------------------------------------------------------------------------------------------------------------------
S('main', 'stern-ramp', 'Stern door and ramp', 0.0, 1.2, -4.5, 4.5, 'vehicle',
  '9.0 m wide in an opening 5.2 m high. The ramp is 11 m long, in one length: raised, it closes the stern and stands 4.4 m over the upper deck, as the pattern\'s does')
S('main', 'vehicle-deck', 'Main deck: five trailer lanes', 1.2, fr(COLLISION), -C, C, 'vehicle', label=(40.0, 3.0),
  why='Five lanes of 3.0 m between the side casings, from the stern door to the collision bulkhead; 6.4 m clear under the upper deck\'s beams and 5.7 m under its webs')
S('main', 'fixed-ramp', 'Fixed ramp to the upper deck', FIXED_RAMP['yard'][0], FIXED_RAMP['yard'][1], FIXED_RAMP['x'][0], FIXED_RAMP['x'][1], 'vehicle',
  'Along the starboard casing, 3.6 m wide, rising forward at 1 in 8 to come out through the upper deck under its hinged cover')
S('main', 'cargo-lift', 'Cargo lift to the lower hold', CARGO_LIFT['yard'][0], CARGO_LIFT['yard'][1], -CARGO_LIFT['half'], CARGO_LIFT['half'], 'vehicle',
  'A platform of 16.0 x 3.6 m in the middle lane: raised, it is the hatch cover of the lower hold')
both('main', 'aft-mooring', 'After mooring station', 0.0, fr(12), 4.5, HB, 'crew', 'Enclosed, each side of the stern door: a capstan and bitts behind a mooring port in the shell')
S('main', 'hydraulic-room', 'Hydraulic pump room', fr(12), 12.6, C, HB, 'machinery', 'The power packs of the stern ramp and the cargo lift')
S('main', 'deck-store-s', 'Deck store, starboard', fr(12), 12.6, -HB, -C, 'service')
S('main', 'deck-store-p', 'Deck store, port', 12.6, 16.2, C, HB, 'service')
S('main', 'co2-room', 'CO2 room', 12.6, 16.2, -HB, -C, 'safety', 'The fixed fire-extinguishing gas for the engine rooms and the cargo decks: above the bulkhead deck, entered from the main deck at the foot of the fixed ramp')
both('main', 'uptake', 'Engine uptake and air trunk', 16.2, 23.2, C, HB, 'machinery', 'The exhausts and the engine room\'s air, up to the funnel on that side')
S('main', 'er-entrance', 'Engine room entrance', 23.2, 30.6, C, HB, 'crew', 'The stair down to the engine room platform')
S('main', 'deck-workshop', 'Deck workshop', 30.6, 38.4, C, HB, 'service')
S('main', 'lashing-store', 'Lashing store', 38.4, fr(78), C, HB, 'service', 'Chains, web lashings, trestles, chocks')
S('main', 'hold-stair-head', 'Head of the lower hold stair', fr(78), 54.6, C, HB, 'crew')
S('main', 'fan-room', 'Vehicle deck fans', 54.6, 66.0, C, HB, 'safety', 'The exhaust fans of the main deck and the lower hold; a hydrant')
S('main', 'er-vent', 'Engine room air trunk', 23.2, 38.4, -HB, -C, 'machinery')
S('main', 'aux-vent', 'Auxiliary engine room trunk', 38.4, fr(78), -HB, -C, 'machinery', 'The generators\' exhausts and air')
S('main', 'hold-vent', 'Lower hold ventilation trunk', fr(78), 66.0, -HB, -C, 'safety')
both('main', 'pilot-lobby', 'Pilot door lobby', 66.0, 72.0, C, HB, 'crew', 'A door in the shell, 1.0 m over the water: the pilot, stores, the bunker hose')
both('main', 'main-stair', 'Main stair', 72.0, 84.6, C, HB, 'passenger', 'From the trailers up to the house: class P of the yard\'s stair standard')
S('main', 'bosun-store', "Bosun's store", 84.6, 93.0, C, HB, 'service')
S('main', 'paint-store', 'Paint and lamp store', 84.6, 93.0, -HB, -C, 'service')
S('main', 'fore-store', 'Fore store and chain lockers', fr(COLLISION), 117.0, -HB, HB, 'service', 'Forward of the collision bulkhead, over the fore peak tank: the chain lockers under the windlasses, mooring ropes')

# ---------------------------------------------------------------------------------------------------------------------
# The upper deck: open aft of the house, the house's lowest tier, the forecastle
# ---------------------------------------------------------------------------------------------------------------------
_H0, _H1 = HOUSE
_T0, _T1 = TRUNK['yard']
S('upper', 'aft-deck', 'Upper deck aft', 0.0, 23.2, -HB, HB, 'open', label=(21.6, 0.0), why='Under and round the helicopter deck; crew only')
S('upper', 'helideck', 'Helicopter deck', HELIDECK['yard'] - HELIDECK['across'] / 2, HELIDECK['yard'] + HELIDECK['across'] / 2, -9.5, 9.5, 'safety',
  'An octagon 19 m across, 1.0 m over the upper deck: added at her refit, for the islands\' ambulance flights. A stair each side', level='helideck')
both('upper', 'funnel', 'Funnel', FUNNEL['yard'][0], FUNNEL['yard'][1], FUNNEL['x'][0], FUNNEL['x'][1], 'machinery',
     'A casing round the uptakes of that side\'s machinery, with the line\'s J. Its top is 22.4 m above the keel, under the wheelhouse\'s')
S('upper', 'trailer-deck', 'Upper deck: trailers', 23.2, _H0, -C, C, 'vehicle', label=(72.0, 2.0), why='In the open, within the bulwark; lashing pots')
S('upper', 'ramp-cover', 'Ramp opening and its cover', RAMP_OPENING['yard'][0], RAMP_OPENING['yard'][1], RAMP_OPENING['x'][0], RAMP_OPENING['x'][1], 'vehicle',
  'Where the fixed ramp comes up from the main deck: closed at sea by a hinged weathertight cover')
both('upper', 'walkway', 'Walkway', 23.2, _H0, C, HB, 'open', 'Inside the bulwark, from the house to the casings and the helicopter deck')
S('upper', 'after-lobby', 'After lobby', _H0, 81.6, -C, C, 'crew', 'The way in from the open deck, across the house')
both('upper', 'stair-head', 'Head of the main stair', _H0, 86.0, C, HB, 'passenger')
both('upper', 'stair-lobby', 'Stair lobby', 81.6, 86.0, 6.3, C, 'passenger', 'From the head of the main stair to the after lobby')
S('upper', 'changing-room', 'Changing and drying room', 81.6, 86.0, 3.5, 6.3, 'crew', 'On the way in from the deck: lockers, benches, a drying cabinet')
S('upper', 'laundry', 'Laundry', 81.6, 86.0, -6.3, -3.5, 'service')
S('upper', 'provisions', 'Dry provisions', 81.6, 87.6, -2.3, 2.3, 'service')
S('upper', 'cold-rooms', 'Cold room and freezer', 87.6, _T0, -2.3, 2.3, 'service')
S('upper', 'house-stair', 'Stair trunk', _T0, _T1, -TRUNK['half'], TRUNK['half'], 'crew', 'One enclosed stair through the house, from the upper deck to the officers\' deck')
S('upper', 'linen-store', 'Linen store', _T0, 93.6, TRUNK['half'], 2.3, 'service')
S('upper', 'cleaning-locker', 'Cleaning locker', _T0, 93.6, -2.3, -TRUNK['half'], 'service')
S('upper', 'galley', 'Galley', _T1, 101.6, -2.3, 2.3, 'crew', 'Between the two corridors: it serves the messes to starboard and the drivers\' lounge to port')
S('upper', 'pantry', 'Pantry', 102.8, _H1, -3.5, 3.5, 'service')
S('upper', 'corridor-p', 'Corridor, port', 81.6, 101.6, 2.3, 3.5, 'crew')
S('upper', 'corridor-s', 'Corridor, starboard', 81.6, 101.6, -3.5, -2.3, 'crew')
S('upper', 'corridor-fwd', 'Cross corridor', 101.6, 102.8, -3.5, 3.5, 'crew')
S('upper', 'hospital', 'Hospital', 86.0, 90.2, 3.5, HB, 'safety', 'Two berths, a desk, its own wash room')
S('upper', 'ship-office', "Ship's office", 90.2, 93.8, 3.5, HB, 'crew', 'Cargo papers, the drivers\' counter')
S('upper', 'drivers-lounge', "Drivers' lounge", 93.8, _H1, 3.5, HB, 'passenger', 'Seats, tables and the owner\'s drinks machine: the drivers eat here, from the galley')
S('upper', 'crew-lounge', "Crew's lounge", 86.0, 94.0, -HB, -3.5, 'crew',
  'The owner, 11 November 2026: "I need a longue for the crew as well , with a library and tv, and bookshelves", "something like a British Gentlemans club, with chesterfield chairs". 8.0 m by 6.2 m, 50 m², windows to starboard')
S('upper', 'crew-mess', 'Crew mess', 94.0, 99.6, -HB, -3.5, 'crew')
S('upper', 'officers-mess', "Officers' mess and saloon", 99.6, _H1, -HB, -3.5, 'crew', 'Windows over the forecastle')
S('upper', 'forecastle', 'Forecastle: forward mooring deck', _H1, 124.0, -HB, HB, 'crew',
  'Before the house, within a bulwark that carries her flare; it rises 1.5 m to the stem. The windlasses, bitts and fairleads; the foremast', level='forecastle')

# ---------------------------------------------------------------------------------------------------------------------
# The boat deck. Its house is 11.8 m wide abaft 91 m, where a lifeboat stands on 3.6 m of deck and more each side, and 15.0 m wide
# forward of it.
# ---------------------------------------------------------------------------------------------------------------------
HH, HR, REC = HOUSE_HALF, BOAT_RECESS, BOAT_RECESS_TO
S('boat', 'boat-deck-p', 'Boat deck, port', _H0, _H1, HR, HB, 'safety', label=(86.0, 8.0),
  why='Open. The lifeboat station: a boat for 40 under gravity davits, 81.5 to 90.5 m from the transom (it is also the rescue boat); forward of it three liferafts in cradles at the rail')
S('boat', 'boat-deck-s', 'Boat deck, starboard', _H0, _H1, -HB, -HR, 'safety', label=(86.0, -8.0),
  why='Open. The lifeboat station: a boat for 40 under gravity davits, 81.5 to 90.5 m from the transom; forward of it three liferafts in cradles at the rail')
S('boat', 'boat-lobby-aft', 'After cross passage', _H0, 81.3, -HR, HR, 'crew', 'A door to the boat deck each side')
S('boat', 'boat-lobby-fwd', 'Forward cross passage', 98.5, 99.8, -HH, HH, 'crew', 'A door to the boat deck each side, forward of the lifeboats')
S('boat', 'boat-corridor-p', 'Corridor, port', 81.3, 98.5, TRUNK['half'], 2.5, 'crew')
S('boat', 'boat-corridor-s', 'Corridor, starboard', 81.3, 98.5, -2.5, -TRUNK['half'], 'crew')
S('boat', 'boat-locker', 'Lockers and air trunk', 81.3, _T0, -TRUNK['half'], TRUNK['half'], 'service')
S('boat', 'house-stair-boat', 'Stair trunk', _T0, _T1, -TRUNK['half'], TRUNK['half'], 'crew')
S('boat', 'crew-pantry', 'Crew pantry', _T1, 98.5, -TRUNK['half'], TRUNK['half'], 'crew')
for _n, (_a, _b) in enumerate(((81.3, 86.15), (86.15, REC))):
    S('boat', f'drivers-cabin-{_n + 1}', f"Drivers' cabin {_n + 1}", _a, _b, 2.5, HR, 'passenger', 'Two berths and a wet unit: 4.85 m by 3.4 m, beside the lifeboat')
    S('boat', f'drivers-cabin-{_n + 3}', f"Drivers' cabin {_n + 3}", _a, _b, -HR, -2.5, 'passenger', 'Two berths and a wet unit: 4.85 m by 3.4 m, beside the lifeboat')
for _n in range(3):
    _a = REC + 2.5 * _n
    S('boat', f'crew-cabin-p{_n + 1}', f'Crew cabin {_n + 1}', _a, _a + 2.5, 2.5, HH, 'crew', 'A single cabin of 2.5 m by 5.0 m with its own wet unit')
    S('boat', f'crew-cabin-s{_n + 1}', f'Crew cabin {_n + 4}', _a, _a + 2.5, -HH, -2.5, 'crew', 'A single cabin of 2.5 m by 5.0 m with its own wet unit')
for _n in range(6):
    _x = -HH + 2.5 * _n
    S('boat', f'crew-cabin-f{_n + 1}', f'Crew cabin {_n + 7}', 99.8, _H1, _x, _x + 2.5, 'crew', 'Two berths and a wet unit: 2.5 m by 4.2 m, a window over the forecastle')

# ---------------------------------------------------------------------------------------------------------------------
# The officers' deck
# ---------------------------------------------------------------------------------------------------------------------
OFF = REC                   # where the officers' house begins: over the boat deck's house where that is at its full breadth
BH = 2.995                  # the cabins' inboard walls: in line with the sides of the wheelhouse two decks up; the stair that
                            # goes up into the wheelhouse stands against the starboard one
S('officers', 'officers-deck-aft', "Officers' deck, open", _H0, OFF, -HR, HR, 'open', label=(89.6, 4.6), why='Abaft the house: the emergency generator room stands on it; ladders up to the bridge deck')
S('officers', 'eg-room', 'Emergency generator room', 80.1, 88.06, -2.33, 2.33, 'machinery',
  'The owner, 11 November 2026: "Build the ships emergency generator room", with a drawing of a room 7.8 m by 4.5 m and 3.2 m high: the set on its skid, the emergency switchboard, the day tank, the starting batteries. Above the bulkhead deck and entered from the open deck')
S('officers', 'house-stair-officers', 'Stair trunk', _T0, _T1, -TRUNK['half'], TRUNK['half'], 'crew')
S('officers', 'radio-room', 'Radio room', _T1, 97.0, -TRUNK['half'], TRUNK['half'], 'bridge')
S('officers', 'officers-corridor-p', 'Corridor, port', OFF, 97.0, TRUNK['half'], BH, 'crew')
S('officers', 'officers-corridor-s', 'Corridor, starboard', OFF, 97.0, -BH, -TRUNK['half'], 'crew')
S('officers', 'second-engineer', 'Second engineer', OFF, 94.0, BH, HH, 'crew')
S('officers', 'third-engineer', 'Third engineer', 94.0, 97.0, BH, HH, 'crew')
S('officers', 'chief-officer', 'Chief officer', OFF, 94.0, -HH, -BH, 'crew')
S('officers', 'second-officer', 'Second officer', 94.0, 97.0, -HH, -BH, 'crew')
S('officers', 'officers-lobby', 'Cross passage', 97.0, 98.05, -HH, HH, 'crew')
S('officers', 'chief-engineer', "Chief engineer's suite", 98.05, _H1, BH, HH, 'crew', '27 m²: a day room with a desk, a bedroom, a wet unit')
S('officers', 'pilot-cabin', "Pilot's and owner's cabin", 98.05, _H1, 0.4, BH, 'crew')
S('officers', 'office', 'Office', 98.05, _H1, -2.085, 0.4, 'crew')
S('officers', 'wheelhouse-stair', 'Stair to the wheelhouse', 98.05, _H1, -BH, -2.085, 'crew', 'The inside way up to the bridge')
S('officers', 'master', "Master's suite", 98.05, _H1, -HH, -BH, 'crew', '27 m²: a day room and a bedroom, under the wheelhouse')

# ---------------------------------------------------------------------------------------------------------------------
# The bridge deck
# ---------------------------------------------------------------------------------------------------------------------
S('bridge', 'bridge-deck-open', 'Bridge deck, open', OFF, 100.0, -HH, HH, 'open', label=(92.5, 0.0), why='Abaft and beside the house; the ladders from the officers\' deck arrive here')
S('bridge', 'battery-room', 'Battery and radio equipment room', 94.0, 96.6, 0.6, BH, 'safety', 'The transitional and radio batteries, the radio installation\'s chargers: a room of their own')
S('bridge', 'bridge-lobby', 'Lobby', 94.0, 96.6, -1.2, 0.6, 'bridge', 'The door from the open deck')
S('bridge', 'bridge-wc', 'Toilet', 94.0, 96.6, -BH, -1.2, 'bridge')
S('bridge', 'chart-room', 'Chart room', 96.6, 100.0, -2.085, BH, 'bridge', 'Abaft the wheelhouse, through its after door')
S('bridge', 'bridge-locker', 'Flag and pyrotechnics locker', 96.6, 98.35, -BH, -2.085, 'bridge')
S('bridge', 'wheelhouse', "Wheelhouse, wings to the ship's side", 100.0, 103.5, -HB, HB, 'bridge',
  'Her navigation bridge, landed whole with what is fitted in it; the wings are carried out to her full breadth so the berth is seen from the wing console')

# ---------------------------------------------------------------------------------------------------------------------
# The compass deck
# ---------------------------------------------------------------------------------------------------------------------
S('top', 'compass-deck', 'Compass deck: mast, radar, compass', 100.0, 103.66, -3.1, 3.1, 'bridge', "The wheelhouse's roof")
S('top', 'house-top', 'House top', 94.0, 100.0, -BH, BH, 'open', 'The roof of the rooms abaft the wheelhouse; the ladder from the bridge deck arrives here')

# Open spaces that lie over or round others on their plan: they are not walled, and the check lets them overlap.
OVERLAP = {'vehicle-deck', 'fixed-ramp', 'cargo-lift', 'aft-deck', 'helideck', 'trailer-deck', 'ramp-cover', 'officers-deck-aft', 'bridge-deck-open', 'er-platform',
           'engine-room', 'boat-deck-p', 'boat-deck-s'}

# ---- What stands on the profile: (name, from, to, foot, top)
PROFILE = [
    ('hull', 0.0, LENGTH, 0.0, DECKS['upper']),
    ('house', _H0, _H1, DECKS['upper'], DECKS['boat']),
    ('boat deck house', _H0, _H1, DECKS['boat'], DECKS['officers']),
    ("officers' house", OFF, _H1, DECKS['officers'], DECKS['bridge']),
    ('emergency generator room', 80.1, 88.06, DECKS['officers'], DECKS['officers'] + 3.4),
    ('bridge house', 94.0, 103.5, DECKS['bridge'], DECKS['compass']),
    ('funnel', FUNNEL['yard'][0], FUNNEL['yard'][1], DECKS['upper'], FUNNEL_TOP),
    ('helicopter deck', HELIDECK['yard'] - HELIDECK['across'] / 2, HELIDECK['yard'] + HELIDECK['across'] / 2, DECKS['helideck'] - 0.2, DECKS['helideck']),
]

# ---- What the yard asks the owner to settle
REVISION = 'D'
QUESTIONS = [
    'The lower hold is one compartment of 39.6 m, as ships of her time had it; a ship built today is not allowed that. A watertight bulkhead with a sliding door across it, or the hold as drawn.',
    'Berths: 25 crew (six officers; nineteen ratings in twelve cabins, seven of them with two berths) and eight drivers in four cabins; the other 42 drivers and passengers ride in the lounge. The boat deck\'s house is narrow abaft 91 m, where the lifeboats stand: more cabins need another tier.',
    'The sheer begins at the front of the house (104 m), not at three quarters of her length as first asked: the house stands on a level deck.',
    'Her funnels stand abaft the engines, at the helicopter deck\'s two forward corners: their smoke lies over it with the wind ahead, and they stand in a helicopter\'s way from forward. The deck is drawn where the owner asked for it, aft.',
    'Her watertight doors below the main deck are drawn hinged, as the first Chisum\'s were at the owner\'s word; a passenger ship\'s are to be sliding and power-operated (SOLAS II-1/13 as the yard recalls it; to be read).',
    'Her mast is the first Chisum\'s, on the wheelhouse, 28.9 m above the keel (23.3 m over the water): her forward masthead light is on it. A second masthead light, at least half her length abaft the first and 4.5 m higher (COLREG annex I, as the yard recalls it; to be read), wants a mast on her centre line between the funnels, as her pattern carries one at its funnel: not built. The foremast on the forecastle carries the anchor light and the bell.',
    'The emergency generator\'s size: the owner\'s drawing names 500 kW, which is as much as one of her main sets. The room is drawn at the drawing\'s size.',
    'The engine room has one stair up (to the port casing) and watertight doors forward and aft; a second way of escape to the deck, from its far end, is not yet in the arrangement. The room first drawn for it in the starboard casing stood over the fresh water tanks, not over the engine room: it is the CO2 room now.',
    'The CO2 room is entered from the main deck, which is an enclosed vehicle deck; the rules ask for a way in from the open deck (as the yard recalls them; to be read).',
    'The uptake and the three ventilation trunks in the starboard casing have no door: the fixed ramp runs along their only wall to the deck. They are trunks, opened by bolted plates.',
    'The stern ramp, raised, stands 3.4 m over the helicopter deck at its after edge: a helicopter comes in over her side, not over her stern. A ramp in two lengths that folds would end under the deck; it is drawn in one, as the pattern has it.',
]

# ---- Her stations: where the fittings of her decks stand, and why there. The fittings themselves come from the yard's
# library of deck fittings (blender/fittings.py); the place of each one, to the centimetre, is in spec.OUTFIT, and steel.py
# leaves the deck clear and shapes the rails and bulwarks for them. (Station, where, what stands there and why.)
STATIONS = [
    ('Lifeboat stations', 'boat deck, 81.5 to 90.5 m from the transom, each side',
     'A 7.3 m boat for 40 under gravity davits. The house is 11.8 m wide here and the deck beside it 3.6 m and more: the boat stows inside her side and swings out '
     'over it. The boat deck is the embarkation deck. The rail has a gap of 9.0 m at each boat. The two boats take 80, the six rafts 150: she carries 75.'),
    ('Liferaft stations', 'boat deck, 93.0, 95.4 and 97.8 m, each side',
     'Three rafts in cradles at the rail each side, forward of the boats and clear of the cross passage\'s door (98.75 m): thrown over, or floating free. '
     'A metre of deck is left between a cradle and the house. The rail has a gap of 1.7 m at each.'),
    ('Anchor gear', 'forecastle, 110.8 to 115.0 m, each side 2.6 m off the centre line',
     'Each anchor hangs in its hawse pipe on the flare of the bow, 115.2 m from the transom and 4.0 m over the water. The pipe comes up through the forecastle deck '
     'at 114.6 m; the chain runs aft over the chain stopper (113.7 m) to the windlass (112.0 m) and goes down its chain pipe at 112.5 m, forward of the collision '
     'bulkhead (110.4 m), inboard to the chain locker under the fore store.'),
    ('Forward mooring station', 'forecastle, 104.5 to 123.7 m',
     'A mooring winch each side at 106.8 m, 2.8 m before the house, and the windlasses\' warping heads. Lines leave her at six chocks in the bulwark: head lines at '
     '119.1 m, breast lines at 110.7 m, springs at 105.6 m (a chock in the stem head for a tug is not yet in her). Bitts stand beside each chock, a roller fairlead '
     'where a line turns. The spare lines are on two reels under the lee of the house front. The foremast stands on the centre line at 116.9 m.'),
    ('After mooring stations', 'main deck, 0 to 7.2 m, inside each casing; and the upper deck\'s after corners',
     'As the pattern has them: her weather deck aft is the helicopter deck, so the stern lines are worked from a station inside each casing on the main deck, '
     'through a mooring port in her side (2.4 to 4.8 m): a winch, bitts, a roller fairlead at the port\'s sill. On the upper deck a capstan and bitts stand in each '
     'after corner, outside the helicopter deck\'s octagon, with two chocks in her side bulwark, at 1.2 and 3.0 m (one in the stern bulwark beside the raised ramp is not yet in her).'),
    ('Ventilators and air pipes', 'upper deck, at the bulwark, outboard of the walkways',
     'The trunks of the engine room, the auxiliary engine room and the lower hold come up in the starboard casing, the main deck\'s exhaust in the port one: a '
     'mushroom ventilator stands over each, hard against the bulwark, and 1.2 m of walkway is left inboard of it. The wing tanks\' air pipes stand between them.'),
    ('Helicopter deck', 'upper deck aft, 0.5 to 19.5 m',
     'A foam monitor each side on the upper deck at the helicopter deck\'s forward edge, beside its two stairs: it covers the whole deck from outside it.'),
    ('Lashing', 'main deck, upper deck and lower hold',
     'Pots flush in the deck along the lane edges, 2.4 m apart: four rows on the main and upper decks (three beside the fixed ramp and its opening, one beside the '
     'cargo lift), three in the lower hold.'),
]


def check():
    """What must hold of the arrangement itself; returns what does not."""
    wrong = []
    for s in SPACES:
        a, b = s['yard']
        if not (0 <= a < b <= LENGTH + 1e-9):
            wrong.append(f"{s['id']}: from {a} to {b} is not within her length")
        if max(abs(s['x'][0]), abs(s['x'][1])) > HB + 1e-9:
            wrong.append(f"{s['id']}: wider than the ship")
    ids = [s['id'] for s in SPACES]
    wrong += [f'{i}: named twice' for i in sorted(set(ids)) if ids.count(i) > 1]
    for plan, _, _ in PLANS:
        for level in sorted({s['level'] for s in SPACES if s['plan'] == plan}, key=str):
            here = [s for s in SPACES if s['plan'] == plan and s['level'] == level]
            for i, p in enumerate(here):
                for q in here[i + 1:]:
                    ox = min(p['x'][1], q['x'][1]) - max(p['x'][0], q['x'][0])
                    oy = min(p['yard'][1], q['yard'][1]) - max(p['yard'][0], q['yard'][0])
                    if ox > 0.05 and oy > 0.05 and not ({p['id'], q['id']} & OVERLAP):
                        wrong.append(f"{plan}: {p['id']} and {q['id']} lie over each other ({ox:.1f} m by {oy:.1f} m)")
    frames = [n for n, _ in BULKHEADS]
    if frames != sorted(frames):
        wrong.append('the bulkheads are not in order')
    fp = LENGTH - (LENGTH - 4.2 - LPP)
    if not (0.05 * LPP <= fp - fr(COLLISION) <= 0.08 * LPP):
        wrong.append('the collision bulkhead is not between 5 and 8 per cent of her length abaft the forward perpendicular')
    slope = (DECKS['upper'] - DECKS['main']) / (FIXED_RAMP['yard'][1] - FIXED_RAMP['yard'][0])
    if abs(1 / slope - FIXED_RAMP['slope']) > 0.01:
        wrong.append(f'the fixed ramp rises 1 in {1 / slope:.2f}, not 1 in {FIXED_RAMP["slope"]:g}')
    if abs(DECKS['boat'] - DECKS['upper'] - TIER) > 1e-9 or abs(DECKS['officers'] - DECKS['boat'] - TIER) > 1e-9 or abs(DECKS['bridge'] - DECKS['officers'] - TIER) > 1e-9:
        wrong.append('the house\'s tiers are not all one height')
    if FUNNEL_TOP >= DECKS['compass']:
        wrong.append('the funnels stand over the wheelhouse\'s top')
    return wrong


def check_lines():
    """Her particulars against her lines as lofted (lines.py); returns what does not agree. Slower: the volume is summed."""
    import lines as L
    wrong = []
    for name, here, there in (('length', LENGTH, L.LENGTH), ('beam', BEAM, L.BEAM), ('depth', DEPTH, L.DEPTH), ('depth to the upper deck', DEPTH_UPPER, L.DEPTH_UPPER),
                              ('draught', DRAFT, L.DRAFT), ('length between perpendiculars', LPP, L.LPP), ('frame spacing', FRAME_SPACING, L.FRAME_SPACING),
                              ('the front of the house, where the sheer begins', HOUSE[1], L.SHEER_FROM)):
        if abs(here - there) > 1e-9:
            wrong.append(f'{name}: {here} here, {there} in her lines')
    block = L.displacement() / (LPP * BEAM * DRAFT)
    if abs(block - BLOCK) > 0.005:
        wrong.append(f'block coefficient {BLOCK} here, {block:.3f} by her lines')
    # the lower hold stands inside her at the tank top, and the lanes inside her at the main deck as far as the casings run
    for yd in (fr(78), fr(144)):
        if half_breadth(yd, 'hold') < HOLD_SIDE:
            wrong.append(f'the lower hold is wider than she is at the tank top, {yd:.1f} m from the transom')
    return wrong


# ---- The arrangement as a map reads it
PLAN_DECK = dict(hold='machinery')            # the part of the model a plan belongs to, where it is not named as the plan is (spec.PARTS)


def plans():
    """
    The arrangement as the page's mini map reads it (ferry/map.js; the owner, 12 November 2026: "I miss a mini map sort of
    so I don't get lost maybe based on the GA"): what drawing JS1-102 is drawn from, as numbers. For each plan its deck's
    edge (half breadths from her lines, every 0.6 m), its spaces as they stand in the arrangement, and what else the
    drawing shows on it; and her profile. Metres from the transom, metres off the centreline (port is positive), metres
    above the keel. A tier of the house has no edge of its own: its deck is what its spaces cover.
    """
    import lines as L
    r = lambda v: round(float(v), 3)
    ys = lambda a, b, step=0.6: [a + i * step for i in range(int(round((b - a) / step)) + 1)]

    def edge(a, b, lvl):
        # the deck's edge from a to b; forward it ends in a point where her sides have closed on her stem (the stem bar's
        # own breadth beyond that is not a deck)
        pts = [[r(y), r(half_breadth(y, lvl))] for y in ys(a, b)]
        while len(pts) > 2 and pts[-1][1] < 0.25 and pts[-2][1] < 0.25:
            pts.pop()
        pts[-1][1] = min(pts[-1][1], 0.0) if pts[-1][1] < 0.25 else pts[-1][1]
        return pts
    out = []
    for plan, title, level in PLANS:
        spaces = [s for s in SPACES if s['plan'] == plan]
        tier = plan in ('top', 'bridge', 'officers')
        lvl = 'hold' if plan == 'hold' else 'main' if plan == 'main' else 'upper'
        if plan in ('hold', 'main', 'upper'):
            a, b = 0.0, LENGTH - (2.2 if plan == 'hold' else 0.0)           # at the tank top her stem is 2.2 m short of her length
        else:
            a, b = min(s['yard'][0] for s in spaces), max(s['yard'][1] for s in spaces)
        rim = None if tier else edge(a, b, lvl)
        rec = dict(id=plan, deck=PLAN_DECK.get(plan, plan), name=title.split(' (')[0], level=level, tier=tier, yard=[r(a), r(b) if tier else rim[-1][0]],
                   edge=rim,
                   spaces=[dict(id=s['id'], name=s['name'], kind=s['kind'], yard=[r(s['yard'][0]), r(s['yard'][1])], x=[r(s['x'][0]), r(s['x'][1])], level=s['level'])
                           for s in spaces])
        if plan == 'hold':
            rec['bulkheads'] = [r(fr(n)) for n, _ in BULKHEADS]
        if plan in ('main', 'upper'):
            rec['lanes'] = dict(x=[-4.5, -1.5, 1.5, 4.5], yard=[8.0, 104.0] if plan == 'main' else [23.2, HOUSE[0]])
        if plan == 'upper':
            rec['helideck'] = dict(yard=HELIDECK['yard'], across=HELIDECK['across'])
        out.append(rec)
    along = ys(0.0, LENGTH, 1.2)
    hull = [[r(v), r(keel(v))] for v in along] + [[r(v), r(L.above_keel(L.deck_y(L.Z(v))))] for v in reversed(along)]
    return dict(format='chisum-plans-1', arrangement=REVISION, drawing='JS1-102', length=LENGTH, beam=BEAM, draft=DRAFT, kinds=KINDS,
                side=edge(0.0, LENGTH, 'upper'),          # her side at the upper deck: shown faintly round a tier of the house
                plans=out,
                profile=dict(hull=hull, blocks=[dict(name=n, yard=[r(a), r(b)], h=[r(lo), r(hi)]) for n, a, b, lo, hi in PROFILE[1:]], mast=MAST_TOP))


if __name__ == '__main__':
    import sys
    bad = check() + check_lines()
    print(f'revision {REVISION}: {len(SPACES)} spaces on {len(PLANS)} plans, {len(BULKHEADS)} watertight bulkheads; displacement about {DISPLACEMENT:,} t')
    for w in bad:
        print('  NOT:', w)
    if '--plans' in sys.argv and not bad:            # the arrangement for the page's mini map: written only when it holds
        import json
        to = sys.argv[sys.argv.index('--plans') + 1]
        with open(to, 'w') as f:
            json.dump(plans(), f, separators=(',', ':'))
        print(f'{to}: {len(PLANS)} plans for the page\'s map')
    raise SystemExit(1 if bad else 0)
