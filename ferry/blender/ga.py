"""
The Chisum at 68 m: her general arrangement, as numbers.

The owner, 11 November 2026: "I think the ship needs to be longer maybe 65-70 meters". Asked which way (the yard's advice:
at her beam of 8.4 m and depth of 4.0 m she cannot be stretched to that, for she would be eight times as long as she is
wide and seventeen times as long as she is deep; it means a new, wider and deeper hull), the owner chose: "Rebuild the
Chisum at 68 m", in place: the other ship's interiors go at once, and the page shows a bare new hull with her bridge until
each deck is built.

This file is that ship set out, before anything of her is built: her principal particulars, her decks, her watertight
bulkheads and every space, each with where it is and what it is for. The drawing JS1-102 (ferry/yard/drawings/) is made
from it, and the hull, the decks and the page's list of rooms are to be built from it, so that the three cannot differ.

**It is a proposal for the owner's approval: revision C** (11 November 2026). Revision B enlarged the officers' cabins
and removed one crew cabin, at the owner's word. Revision C is the arrangement as her bare ship is built from it (the owner:
"How about making the ship longer ? As we said"): her outline and displacement are those of her lines as lofted (lines.py),
the forward main stairs have the length the yard's stair standard needs, the crew's stair trunk has its head on the bridge
deck, and the forward mooring deck, the gallery before the lounge and the engine room's platform are named.
Nothing in it is calculated yet beyond the sums written beside the figures and the volume under her lines: no stability,
no scantlings, no tonnage. The proportions are those of small Japanese
coastal car and passenger ferries of this length as the yard recalls them; no particular ship is copied and none was
read for it.

Frame: a place is (metres from the transom, metres to port of the centreline, metres above the keel).
No Blender here: plain Python.
"""

# ---- Principal particulars
LENGTH = 68.4            # over all: 114 frame spaces of 0.6 m, frame 0 at the transom
FRAME_SPACING = 0.6
LPP = 63.0               # between perpendiculars: the after one at the rudder stocks (2.4 m), the forward one at 65.4 m
BEAM = 13.6              # moulded
DEPTH = 5.0              # to the car deck (the bulkhead deck and the freeboard deck), at side amidships
DRAFT = 3.2              # design
BLOCK = 0.62             # block coefficient of her lines as lofted (lines.py: 1,694 m³ under the design waterline); 0.58 was aimed at
SPEED = 14.0             # knots, service
# Displacement, from the figures above: 0.62 x 63.0 x 13.6 x 3.2 x 1.025 = 1,740 t
DISPLACEMENT = round(BLOCK * LPP * BEAM * DRAFT * 1.025)
HB = BEAM / 2

PARTICULARS = [
    ('Type', 'Car and passenger ferry (ro-ro passenger ship), drive-through: stern ramp and bow visor with inner ramp'),
    ('Owner and service', 'Johansson Line; Minato to Kitano-jima and back'),
    ('Length over all', f'{LENGTH:.1f} m'),
    ('Length between perpendiculars', f'{LPP:.1f} m'),
    ('Breadth moulded', f'{BEAM:.1f} m'),
    ('Depth to the car deck', f'{DEPTH:.1f} m'),
    ('Design draught', f'{DRAFT:.1f} m'),
    ('Displacement at that draught', f'about {DISPLACEMENT:,} t (block coefficient {BLOCK})'),
    ('Service speed', f'{SPEED:.0f} knots'),
    ('Main engines', 'Two medium-speed diesels of about 1,470 kW each, each through a reduction gear to a controllable-pitch propeller'),
    ('Steering and manoeuvring', 'Two rudders; a bow thruster of about 300 kW'),
    ('Generators', 'Three of about 320 kW, 450 V, 60 Hz, in an auxiliary engine room of their own; an emergency generator on the top deck'),
    ('Vehicles', 'Four lanes of 2.6 m, 208 lane metres: about 40 cars, or 8 lorries and 20 cars; 4.3 m clear under the passenger deck'),
    ('Passengers', '350: about 280 seated in the saloon, the others on the open decks'),
    ('Crew', '12 on the bridge deck: five officers each in a cabin of 18 to 29 m², seven ratings in five cabins of 15 m²'),
    ('Frame spacing', f'{FRAME_SPACING:.1f} m, frames 0 (the transom) to {round(LENGTH / FRAME_SPACING)}'),
]

# ---- The decks, above the keel
DECKS = dict(
    tank_top=1.2,        # the inner bottom under the machinery
    flat=2.9,            # the flat in the machinery spaces: the engine control room and the workshop stand on it
    car=5.0,             # the car deck
    mooring=9.7,         # the forecastle deck: the upper deck forward of the lounge, over the bow door. (It was drawn at 7.7 m in
                         # revisions A and B: that left 2.5 m over the bow lanes, and lorries are to drive off through the bow.)
    passenger=9.7,       # the passenger deck: 4.7 m over the car deck, 4.3 m clear under its beams
    bridge=12.5,         # the bridge deck: the wheelhouse and the crew
    top=15.2,            # the top deck: over the accommodation and the wheelhouse (the compass deck is its forward end)
    top_house=18.5,      # the roof of the top deck's house
)
FUNNEL_TOP, MAST_TOP = 21.5, 19.8          # the mast is her bridge's own, from the first Chisum: 16.6 m over the waterline (a taller one is open: QUESTIONS)
PLANS = (
    ('top', 'Top deck', 15.2), ('bridge', 'Bridge deck', 12.5), ('passenger', 'Passenger deck', 9.7), ('car', 'Car deck', 5.0),
    ('hold', 'Below the car deck (at the tank top; the flat at 2.9 m shown dashed)', 1.2),
)

# ---- The watertight bulkheads below the car deck: (frame, what it divides)
BULKHEADS = [
    (8, 'after peak bulkhead'), (18, "the engine room's after bulkhead"), (41, 'between the engine room and the auxiliary engine room'),
    (55, "the auxiliary engine room's forward bulkhead"), (70, 'between the tanks'), (85, "the thruster room's after bulkhead"),
    (96, "the thruster room's forward bulkhead"), (103, 'collision bulkhead'),
]
# The collision bulkhead stands 3.6 m abaft the forward perpendicular: between 5 % of the length (3.15 m) and 8 % (5.04 m),
# which is where the yard recalls the rule to want it (SOLAS II-1, regulation 12; not read for this revision).


def fr(n):
    return n * FRAME_SPACING


# ---- The hull's outline, from her lines (lines.py): half-breadth at a level at a place along her, and the keel line.
def half_breadth(yard, level='car'):
    """Half her breadth at `yard`: at the car deck's edge ('car'), at the upper deck's ('upper': the passenger deck and the
    decks over it, which stand in line with her side), or below the car deck ('hold')."""
    import lines as L
    if yard < 0 or yard > LENGTH:
        return 0.0
    z = L.Z(yard)
    if level == 'hold':
        # at the tank top; where her bottom has risen over it (aft, and at the forefoot), 0.6 m over her bottom
        return L.hull_x(min(L.CAR - 0.05, max(L.Y(DECKS['tank_top']), L.keel_y(z) + 0.6)), z)
    return L.upper_breadth(z) if level == 'upper' else L.half_breadth(z)


def keel(yard):
    """The underside of the hull on the centreline, above the base: the keel, the run rising aft over the screws, the raked stem."""
    import lines as L
    return L.above_keel(L.keel_y(L.Z(min(max(yard, 0.0), LENGTH))))


# ---- The spaces. Each: the deck's plan it is drawn on, an id, its name, from and to (metres from the transom), from and
# to off the centreline (port is positive), what kind of space it is, and why it is there.
KINDS = dict(machinery='Machinery', tank='Tanks and voids', vehicle='Vehicles', passenger='Passengers', crew='Crew', service='Stores and service',
             safety='Safety', open='Open deck', bridge='Navigation')
SPACES = []


def S(plan, id, name, a, b, x0, x1, kind, why='', level=None, label=None):
    # `label`: where its number stands on the drawing (metres from the transom, off the centreline), when not at its middle
    SPACES.append(dict(plan=plan, id=id, name=name, yard=(a, b), x=(min(x0, x1), max(x0, x1)), kind=kind, why=why, level=level, label=label))


def both(plan, id, name, a, b, x0, x1, kind, why='', names=None):
    """The same space on each side: port first."""
    S(plan, id + '-p', (names[0] if names else name + ', port'), a, b, x0, x1, kind, why)
    S(plan, id + '-s', (names[1] if names else name + ', starboard'), a, b, -x0, -x1, kind, why)


# Below the car deck
S('hold', 'steering-gear', 'Steering gear room', 0.0, fr(8), -HB, HB, 'machinery', 'Two rotary-vane steering gears, one on each rudder stock, with the emergency steering position')
S('hold', 'shaft-space', 'Shaft space', fr(8), fr(18), -3.0, 3.0, 'machinery',
  'The stern tubes and their inboard seals, the couplings to the intermediate shafts, the propeller pitch oil units. The shafts leave her 9 m from the transom: aft of that the space is the way to the steering gear')
both('hold', 'fw-tank', 'Fresh water tank', fr(8), fr(18), 3.0, HB, 'tank', '30 m³ each side')
S('hold', 'engine-room', 'Engine room', fr(18), fr(41), -HB, HB, 'machinery', 'Two main engines and their gears, the pumps, the coolers, the purifiers')
S('hold', 'aux-engine-room', 'Auxiliary engine room', fr(41), fr(55), -HB, HB, 'machinery',
  'Three diesel generators, the compressors, the hot water boiler, the main switchboard on the flat above. A room of its own, so a fire in one machinery room leaves the other')
S('hold', 'ecr', 'Engine control room (on the flat)', fr(46), fr(55), 2.6, 6.2, 'machinery', 'On the flat at 2.9 m: the control desk, the main switchboard behind glass, a day room and a toilet', level='flat')
S('hold', 'workshop', 'Workshop, engine store (on the flat)', fr(46), fr(55), -6.2, -2.6, 'service', 'On the flat at 2.9 m', level='flat')
S('hold', 'er-platform', 'Engine room platform (on the flat)', 19.4, fr(41), 3.9, 6.5, 'machinery',
  'On the flat at 2.9 m, port side: the foot of the crew stair, and the ladder down to the tank top', level='flat')
both('hold', 'fuel-tank', 'Fuel oil tank', fr(55), fr(70), 2.2, HB, 'tank', 'About 40 m³ each side; inboard of the side by the width of a wing void where the rule asks it')
S('hold', 'pipe-passage', 'Pipe passage and pump room', fr(55), fr(70), -2.2, 2.2, 'machinery', 'Ballast, bilge and fuel transfer pumps; the way forward below the car deck')
both('hold', 'ballast-tank', 'Ballast and heeling tank', fr(70), fr(85), 2.2, HB, 'tank', 'Heeling tanks for loading lorries on one side')
S('hold', 'sewage', 'Sewage plant and stores', fr(70), fr(85), -2.2, 2.2, 'service', 'The sewage treatment plant and its holding tank; passenger stores')
S('hold', 'thruster-room', 'Bow thruster room', fr(85), fr(96), -HB, HB, 'machinery', 'The thruster, its motor and starter')
S('hold', 'chain-lockers', 'Chain lockers and fore store', fr(96), fr(103), -HB, HB, 'service')
S('hold', 'fore-peak', 'Fore peak tank', fr(103), LENGTH, -HB, HB, 'tank', 'Ballast')

# The car deck
S('car', 'stern-ramp', 'Stern ramp and door', 0.0, 2.0, -3.2, 3.2, 'vehicle', '6.4 m wide; it closes the stern')
S('car', 'vehicle-deck', 'Vehicle deck: four lanes', 2.0, 58.0, -5.2, 5.2, 'vehicle', 'Four lanes of 2.6 m between the casings, driven through from the stern ramp to the bow ramp')
S('car', 'bow-ramp', 'Bow lanes, inner bow door and ramp', 58.0, fr(103), -2.6, 2.6, 'vehicle', 'The lanes run on to the inner bow door, which is the collision bulkhead carried up and lowers as the ramp; the visor beyond it lifts')
both('car', 'aft-mooring', 'After mooring station', 0.0, 6.0, 5.2, HB, 'crew', 'A capstan and bollards each side, behind openings in the shell')
both('car', 'deck-store', 'Deck store', 6.0, 10.0, 5.2, HB, 'service', names=('Lashing store, port', 'Deck store, starboard'))
both('car', 'uptake', 'Engine uptake and air trunk', 10.0, 20.0, 5.2, HB, 'machinery', 'Exhausts and the engine rooms\' air, up to the funnel on that side')
S('car', 'crew-stair', 'Crew stair trunk, engine room entrance', 20.0, 24.0, 5.2, HB, 'crew',
  'One enclosed stair from the machinery flat to the bridge deck, as the owner asked of the first Chisum: "an internal stair case too so you can run all way from the bridge to the engine room"')
S('car', 'er-escape', 'Engine room escape, emergency fire pump', 20.0, 24.0, -HB, -5.2, 'safety')
both('car', 'stair-aft', 'Main stair, after', 24.0, 30.0, 5.2, HB, 'passenger',
     'To the passenger deck; class P of the yard\'s stair standard. Its foot is in the shell door lobby forward of it')
both('car', 'shell-door', 'Shell door and gangway lobby', 30.0, 33.0, 5.2, HB, 'passenger', 'Foot passengers come aboard here and go up the stair beside it')
both('car', 'fan-trunk-a', 'Car deck fans, drencher station', 33.0, 37.8, 5.2, HB, 'safety', 'The car deck\'s exhaust fans; the valves of its water spray; a hydrant')
both('car', 'stair-fwd', 'Main stair, forward', 37.8, 46.0, 5.2, HB, 'passenger',
     'To the passenger deck, with its foot lobby and the door from the lanes at its after end. 8.2 m long: 24 steps in two flights with a landing are 6.0 m (the yard\'s stair standard, class P), and a landing at each end')
both('car', 'bosun', 'Store', 46.0, 52.0, 5.2, HB, 'service', names=("Bosun's store, port", 'Paint and lamp store, starboard'))
both('car', 'fan-trunk-f', 'Car deck fan trunk', 52.0, 58.0, 5.2, HB, 'safety', 'Supply fans')
both('car', 'bow-gear', 'Bow door and windlass hydraulics', 58.0, fr(103), 2.6, 6.0, 'machinery', 'Against the collision bulkhead, which is carried up here as the frame of the inner bow door')

# The passenger deck
S('passenger', 'aft-mooring-deck', 'After mooring deck', 0.0, 5.0, -HB, HB, 'crew', 'Over the stern ramp; crew only')
S('passenger', 'sun-deck', 'Open passenger deck', 5.0, 13.0, -HB, HB, 'open', 'Benches under the sky; the life-saving appliances\' after station')
both('passenger', 'funnel', 'Funnel casing', 13.0, 20.0, 3.2, 5.8, 'machinery')
S('passenger', 'aft-lobby', 'After lobby', 13.0, 21.0, -3.2, 3.2, 'passenger', 'The way in from the open deck, between the funnels')
S('passenger', 'kiosk', 'Kiosk and pantry', 21.0, 27.0, -5.2, -2.0, 'service', 'Tea, noodles and the day\'s paper')
S('passenger', 'kiosk-store', 'Kiosk store', 21.0, 24.0, -HB, -5.2, 'service')
S('passenger', 'lobby', 'Lobby: information, drinks machine', 21.0, 27.0, -2.0, 5.2, 'passenger', 'The owner\'s drinks machine stands here')
both('passenger', 'stair-aft-head', 'Head of the after main stair', 24.0, 30.0, 5.2, HB, 'passenger')
S('passenger', 'toilets-p', 'Toilets', 30.0, 34.0, 3.6, HB, 'passenger')
S('passenger', 'toilets-s', 'Toilets, nursing room', 30.0, 36.0, -HB, -3.6, 'passenger')
S('passenger', 'saloon', 'Saloon: about 280 seats', 27.0, 46.0, -HB, HB, 'passenger', label=(38.0, 0.0), why= 'Rows of seats and tables, to the ship\'s side; windows down both sides')
both('passenger', 'stair-fwd-head', 'Head of the forward main stair', 40.0, 46.0, 5.2, HB, 'passenger')
S('passenger', 'lounge', 'Forward lounge', 46.0, 54.0, -HB, HB, 'passenger', 'Windows over the bow')
S('passenger', 'mooring-deck', 'Forward mooring deck', 54.0, 68.0, -HB, HB, 'crew',
  'The forecastle: the upper deck forward of the lounge, over the bow door, within a bulwark. The windlass, the bollards and fairleads; crew only, through the lounge\'s forward door')
S('passenger', 'crew-stair-pax', 'Crew stair trunk', 20.0, 24.0, 5.2, HB, 'crew')

# The bridge deck
# The owner, 11 November 2026, with the files of a chief engineer's suite of their own (assets/ce-suite/: a suite of 7.2 m by
# 5.0 m, 36 m², for a 190 m cargo ship: a day room and office, a bedroom, a wet unit and a store, with its lighting, sockets,
# water, drains and air): "Can this be used to make the chief engineer cabin", then: "Expand their current cabins they should
# be comfortable and roomy maybe 20 m^2 remove one of the other cabins". Revision B: the house is 1.2 m wider (rooms 5.0 m
# deep, as the suite's are, side decks 1.2 m), the senior officers' cabins are 22 to 29 m² and the other officers' 18 m², one
# crew cabin is gone (five single cabins of 15 m² for seven ratings: two of them take a second berth), and the rescue boat
# stands on the open deck aft, where the wider house leaves it no side deck.
HOUSE = 5.6              # the accommodation house's half breadth on the bridge deck
S('bridge', 'aft-deck', 'Open deck: funnels, rescue boat and davit', 13.0, 20.0, -HB, HB, 'open')
S('bridge', 'aft-deck-s', 'Open deck before the house', 20.0, 22.0, -HB, 5.2, 'open')
S('bridge', 'crew-stair-head', 'Head of the crew stair', 20.0, 24.0, 5.2, HB, 'crew',
  'Where the crew\'s stair trunk arrives from the passenger deck: a door into the mess, and one forward onto the side deck')
S('bridge', 'side-deck-p', 'Side deck: liferafts', 24.0, 50.0, HOUSE, HB, 'safety')
S('bridge', 'side-deck-s', 'Side deck: liferafts', 22.0, 50.0, -HB, -HOUSE, 'safety')
S('bridge', 'mess', 'Crew mess and day room', 22.0, 27.0, 0.6, 5.2, 'crew', '23 m²; the crew\'s stair comes up beside it')
for _n, _a in enumerate((27.0, 30.0, 33.0), 1):
    S('bridge', f'cabin-p{_n}', f'Crew cabin {_n}', _a, _a + 3.0, 0.6, HOUSE, 'crew', 'A single cabin of 3.0 m by 5.0 m, 15 m²')
S('bridge', 'second-engineer', 'Second engineer', 36.0, 39.6, 0.6, HOUSE, 'crew', '18 m²')
S('bridge', 'chief-engineer', "Chief engineer's suite", 39.6, 44.2, 0.6, HOUSE, 'crew',
  "23 m²: a day room with a desk, a bedroom, a wet unit; fitted out from the owner's suite package (its rooms, fittings and its "
  "electrical and plumbing lists), which as drawn is 7.2 m by 5.0 m")
S('bridge', 'master', "Master's suite", 44.2, 50.0, 0.6, HOUSE, 'crew', '29 m²: a day room and a bedroom, next to the wheelhouse')
S('bridge', 'galley', 'Galley', 22.0, 26.2, -HOUSE, -0.6, 'crew')
S('bridge', 'provisions', 'Provisions', 26.2, 28.2, -HOUSE, -0.6, 'service')
S('bridge', 'laundry', 'Laundry', 28.2, 29.8, -HOUSE, -0.6, 'service')
S('bridge', 'wash', 'Showers and toilets', 29.8, 32.4, -HOUSE, -0.6, 'crew', "The ratings'; each officer's cabin has its own")
for _n, _a in enumerate((32.4, 35.4), 4):
    S('bridge', f'cabin-s{_n}', f'Crew cabin {_n}', _a, _a + 3.0, -HOUSE, -0.6, 'crew', 'A single cabin of 15 m²; one of the five takes a second berth')
S('bridge', 'second-officer', 'Second officer', 38.4, 42.0, -HOUSE, -0.6, 'crew', '18 m²')
S('bridge', 'chief-officer', 'Chief officer', 42.0, 46.4, -HOUSE, -0.6, 'crew', '22 m²')
S('bridge', 'office', "Ship's office", 46.4, 50.0, -HOUSE, -0.6, 'crew')
S('bridge', 'corridor', 'Corridor', 22.0, 50.0, -0.6, 0.6, 'crew')
S('bridge', 'wheelhouse', 'Wheelhouse, wings to the ship\'s side', 50.0, 54.0, -HB, HB, 'bridge',
  'Her navigation bridge, moved aboard with what is fitted in it; the wings are carried out to the side so the berth is seen from the wing console')

# The top deck: the house the owner asked for
# The top deck's houses stand apart, each entered from the open deck: the emergency generator room's air comes in through
# its forward wall and goes out through its side, so no other room stands against it. TOP_HOUSE is their half breadth: the
# generator room as the owner's drawing has it, 4.5 m inside its 80 mm walls.
TOP_HOUSE = 2.33
S('top', 'co2-room', 'CO₂ room', 27.0, 29.2, -TOP_HOUSE, TOP_HOUSE, 'safety', 'The engine rooms\' gas; entered from the open deck only')
S('top', 'eg-room', 'Emergency generator room', 29.8, 37.8, -TOP_HOUSE, TOP_HOUSE, 'machinery',
  'The owner, 11 November 2026: "Build the ships emergency generator room", with a drawing of a room 7.8 m by 4.5 m and 3.2 m high: the set on its skid, the emergency switchboard, the day tank, the starting batteries; above the uppermost deck and entered from the open deck')
S('top', 'battery-room', 'Battery room', 38.6, 40.0, 0.0, TOP_HOUSE, 'safety', 'The transitional and radio batteries: a room of their own, not the switchboard\'s (SOLAS II-1/42.5.2 as the yard recalls it; to be read)')
S('top', 'ac-room', 'Air conditioning plant', 38.6, 40.0, -TOP_HOUSE, 0.0, 'machinery', 'The chilled water unit for the air handling unit next door')
S('top', 'ventilation-room', 'Ventilation room', 40.0, 46.2, -TOP_HOUSE, TOP_HOUSE, 'machinery',
  'The owner, 11 November 2026: "this is the ventilation room that should be on top of the bridge deck", with a drawing of a room 6.2 m by 3.4 m and 2.9 m high: an air handling unit of 6,000 m³/h for the passenger spaces, two extract fans of 3,000 m³/h, the filter box, the fire damper')
S('top', 'compass-deck', 'Compass deck: mast, radar, compass', 50.0, 54.0, -3.1, 3.1, 'bridge', 'The wheelhouse\'s roof, level with the top deck')
S('top', 'top-open', 'Top deck, open', 22.0, 50.0, -5.6, 5.6, 'open', label=(24.5, 0.0), why= 'Over the accommodation: the house\'s doors open onto it; the air intakes and outlets stand clear of the funnels\' smoke')
both('top', 'funnel-top', 'Funnel', 13.0, 20.0, 3.2, 5.8, 'machinery', 'With the line\'s J')

# ---- What stands on the profile: (name, from, to, foot, top)
PROFILE = [
    ('hull', 0.0, LENGTH, 0.0, DECKS['passenger']),
    ('passenger house', 13.0, 54.0, DECKS['passenger'], DECKS['bridge']),
    ('accommodation', 22.0, 50.0, DECKS['bridge'], DECKS['top']),
    ('wheelhouse', 50.0, 54.0, DECKS['bridge'], DECKS['top']),
    ('top house', 27.0, 46.2, DECKS['top'], DECKS['top_house']),
    ('funnel', 13.6, 19.6, DECKS['passenger'], FUNNEL_TOP),
]

# ---- What the yard asks the owner to settle before she is built
REVISION = 'C'
QUESTIONS = [
    "The chief engineer's suite: 23 m² with the rooms and fittings of the owner's suite package rearranged to fit (drawn); or the package's own 36 m² (7.2 m by 5.0 m), which takes the second engineer's cabin as well.",
    'The bow: a visor and an inner ramp, driven through (drawn); or her old way, a blunt bow that the ramp itself closes.',
    'The saloon to the ship\'s side with windows (drawn), or narrower with a promenade outside it on each side.',
    'Where the owner\'s two rooms stand: in one house on the top deck with the CO₂ room and the batteries (drawn).',
    'The emergency generator\'s size: the owner\'s drawing names 500 kW; her own emergency loads (steering, fire and drencher pumps, lighting, navigation) come to something near 200 kW. The room is drawn at the drawing\'s size either way.',
    'Her service speed and engines (14 knots, two of 1,470 kW): they set the engine room\'s length.',
    'Her watertight doors below the car deck are drawn hinged, as the first Chisum\'s were at the owner\'s word; a passenger ship\'s are to be sliding and power-operated (SOLAS II-1/13 as the yard recalls it; to be read). To be settled with the machinery spaces.',
    'Her mast is the first Chisum\'s, 19.8 m above the keel: whether her lights\' heights and the view over her bow hold at 68 m is calculation JS4-402, to be made again.',
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
        here = [s for s in SPACES if s['plan'] == plan and s['level'] is None]
        for i, p in enumerate(here):
            for q in here[i + 1:]:
                ox = min(p['x'][1], q['x'][1]) - max(p['x'][0], q['x'][0])
                oy = min(p['yard'][1], q['yard'][1]) - max(p['yard'][0], q['yard'][0])
                if ox > 0.05 and oy > 0.05 and not ({p['id'], q['id']} & {'top-open', 'saloon', 'aft-deck'}):
                    wrong.append(f"{plan}: {p['id']} and {q['id']} lie over each other ({ox:.1f} m by {oy:.1f} m)")
    frames = [n for n, _ in BULKHEADS]
    if frames != sorted(frames):
        wrong.append('the bulkheads are not in order')
    fp = 65.4
    if not (0.05 * LPP <= fp - fr(103) <= 0.08 * LPP):
        wrong.append('the collision bulkhead is not between 5 and 8 per cent of her length abaft the forward perpendicular')
    return wrong


def check_lines():
    """Her particulars against her lines as lofted (lines.py); returns what does not agree. Slower: the volume is summed."""
    import lines as L
    wrong = []
    for name, here, there in (('length', LENGTH, L.LENGTH), ('beam', BEAM, L.BEAM), ('depth', DEPTH, L.DEPTH), ('draught', DRAFT, L.DRAFT),
                              ('length between perpendiculars', LPP, L.LPP), ('frame spacing', FRAME_SPACING, L.FRAME_SPACING)):
        if abs(here - there) > 1e-9:
            wrong.append(f'{name}: {here} here, {there} in her lines')
    block = L.displacement() / (LPP * BEAM * DRAFT)
    if abs(block - BLOCK) > 0.005:
        wrong.append(f'block coefficient {BLOCK} here, {block:.3f} by her lines')
    return wrong


if __name__ == '__main__':
    bad = check() + check_lines()
    print(f'{len(SPACES)} spaces on {len(PLANS)} plans, {len(BULKHEADS)} watertight bulkheads; displacement about {DISPLACEMENT:,} t')
    for w in bad:
        print('  NOT:', w)
    raise SystemExit(1 if bad else 0)
