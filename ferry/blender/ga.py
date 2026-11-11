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

**It is a proposal for the owner's approval: revision A.** Nothing in it is calculated yet beyond the sums written beside
the figures: no hydrostatics, no stability, no scantlings, no tonnage. The proportions are those of small Japanese
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
BLOCK = 0.58             # block coefficient aimed at
SPEED = 14.0             # knots, service
# Displacement, from the figures above: 0.58 x 63.0 x 13.6 x 3.2 x 1.025 = 1,630 t
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
    ('Crew', '12, each in a cabin on the bridge deck'),
    ('Frame spacing', f'{FRAME_SPACING:.1f} m, frames 0 (the transom) to {round(LENGTH / FRAME_SPACING)}'),
]

# ---- The decks, above the keel
DECKS = dict(
    tank_top=1.2,        # the inner bottom under the machinery
    flat=2.9,            # the flat in the machinery spaces: the engine control room and the workshop stand on it
    car=5.0,             # the car deck
    mooring=7.7,         # the forecastle deck, over the bow door
    passenger=9.7,       # the passenger deck: 4.7 m over the car deck, 4.3 m clear under its beams
    bridge=12.5,         # the bridge deck: the wheelhouse and the crew
    top=15.2,            # the top deck: over the accommodation and the wheelhouse (the compass deck is its forward end)
    top_house=18.5,      # the roof of the top deck's house
)
FUNNEL_TOP, MAST_TOP = 21.5, 25.0
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


# ---- The hull's outline for the drawing: half-breadth of a deck at a place along her, and the keel line.
def half_breadth(yard, level='car'):
    """Half the breadth of a deck at `yard`: parallel amidships, drawn in to a wide transom aft and to the stem forward."""
    aft, fwd, stem = 12.0, 44.0, LENGTH - (2.2 if level == 'hold' else 0.0)
    if yard < 0 or yard > stem:
        return 0.0
    if yard < aft:
        return HB - (0.9 if level == 'hold' else 0.5) * ((aft - yard) / aft) ** 2 - (2.6 * max(0.0, (6.0 - yard) / 6.0) ** 1.5 if level == 'hold' else 0.0)
    if yard > fwd:
        t = (yard - fwd) / (stem - fwd)
        return HB * (1 - t ** (2.0 if level == 'hold' else 3.5))          # fuller above the water than at the tank top: she flares
    return HB


def keel(yard):
    """The underside of the hull on the centreline, above the base: flat amidships, rising aft over the screws, a raked stem."""
    if yard < 11.0:
        return 0.0 + 3.0 * ((11.0 - yard) / 11.0) ** 1.6
    if yard > 62.0:
        return min(DECKS['mooring'], ((yard - 62.0) / (LENGTH - 62.0)) ** 1.7 * DECKS['mooring'])
    return 0.0


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
S('hold', 'shaft-space', 'Shaft space', fr(8), fr(18), -3.0, 3.0, 'machinery', 'The two shaft lines, the propeller pitch oil units, the stern tube seals')
both('hold', 'fw-tank', 'Fresh water tank', fr(8), fr(18), 3.0, HB, 'tank', '30 m³ each side')
S('hold', 'engine-room', 'Engine room', fr(18), fr(41), -HB, HB, 'machinery', 'Two main engines and their gears, the pumps, the coolers, the purifiers')
S('hold', 'aux-engine-room', 'Auxiliary engine room', fr(41), fr(55), -HB, HB, 'machinery',
  'Three diesel generators, the compressors, the hot water boiler, the main switchboard on the flat above. A room of its own, so a fire in one machinery room leaves the other')
S('hold', 'ecr', 'Engine control room (on the flat)', fr(46), fr(55), 2.6, 6.2, 'machinery', 'On the flat at 2.9 m: the control desk, the main switchboard behind glass, a day room and a toilet', level='flat')
S('hold', 'workshop', 'Workshop, engine store (on the flat)', fr(46), fr(55), -6.2, -2.6, 'service', 'On the flat at 2.9 m', level='flat')
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
S('car', 'bow-ramp', 'Bow lanes, inner bow door and ramp', 58.0, 64.2, -2.6, 2.6, 'vehicle', 'The visor lifts; the inner door is the collision bulkhead carried up, and lowers as the ramp')
both('car', 'aft-mooring', 'After mooring station', 0.0, 6.0, 5.2, HB, 'crew', 'A capstan and bollards each side, behind openings in the shell')
both('car', 'deck-store', 'Deck store', 6.0, 10.0, 5.2, HB, 'service', names=('Lashing store, port', 'Deck store, starboard'))
both('car', 'uptake', 'Engine uptake and air trunk', 10.0, 20.0, 5.2, HB, 'machinery', 'Exhausts and the engine rooms\' air, up to the funnel on that side')
S('car', 'crew-stair', 'Crew stair trunk, engine room entrance', 20.0, 24.0, 5.2, HB, 'crew',
  'One enclosed stair from the machinery flat to the bridge deck, as the owner asked of the first Chisum: "an internal stair case too so you can run all way from the bridge to the engine room"')
S('car', 'er-escape', 'Engine room escape, emergency fire pump', 20.0, 24.0, -HB, -5.2, 'safety')
both('car', 'stair-aft', 'Main stair, after', 24.0, 30.0, 5.2, HB, 'passenger', 'To the passenger deck; class P of the yard\'s stair standard')
both('car', 'shell-door', 'Shell door and gangway lobby', 30.0, 33.0, 5.2, HB, 'passenger', 'Foot passengers come aboard here and go up the stair beside it')
both('car', 'fan-trunk-a', 'Car deck fans, drencher station', 33.0, 40.0, 5.2, HB, 'safety', 'The car deck\'s exhaust fans; the valves of its water spray; a hydrant')
both('car', 'stair-fwd', 'Main stair, forward', 40.0, 46.0, 5.2, HB, 'passenger')
both('car', 'bosun', 'Store', 46.0, 52.0, 5.2, HB, 'service', names=("Bosun's store, port", 'Paint and lamp store, starboard'))
both('car', 'fan-trunk-f', 'Car deck fan trunk', 52.0, 58.0, 5.2, HB, 'safety', 'Supply fans')
both('car', 'bow-gear', 'Bow door and windlass hydraulics', 58.0, 62.0, 2.6, 6.0, 'machinery')

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
S('passenger', 'crew-stair-pax', 'Crew stair trunk', 20.0, 24.0, 5.2, HB, 'crew')

# The bridge deck
S('bridge', 'aft-deck', 'Open deck, funnels', 13.0, 22.0, -HB, HB, 'open')
S('bridge', 'side-deck-p', 'Side deck: rescue boat, liferafts', 22.0, 50.0, 5.0, HB, 'safety')
S('bridge', 'side-deck-s', 'Side deck: liferafts', 22.0, 50.0, -HB, -5.0, 'safety')
S('bridge', 'mess', 'Crew mess and day room', 22.0, 27.4, 0.6, 5.0, 'crew')
S('bridge', 'galley', 'Galley', 22.0, 26.2, -5.0, -0.6, 'crew')
S('bridge', 'provisions', 'Provisions', 26.2, 28.6, -5.0, -0.6, 'service')
S('bridge', 'laundry', 'Laundry', 28.6, 30.4, -5.0, -0.6, 'service')
S('bridge', 'wash', 'Showers and toilets', 30.4, 33.4, -5.0, -0.6, 'crew')
S('bridge', 'cabins-p', 'Four crew cabins', 27.4, 39.4, 0.6, 5.0, 'crew', 'Single cabins of 3.0 m by 4.4 m')
S('bridge', 'cabins-s', 'Two crew cabins', 33.4, 39.4, -5.0, -0.6, 'crew')
S('bridge', 'chief-engineer', 'Chief engineer', 39.4, 44.2, 0.6, 5.0, 'crew')
S('bridge', 'master', 'Master', 44.2, 50.0, 0.6, 5.0, 'crew', 'A day room and a bedroom, next to the wheelhouse')
S('bridge', 'chief-officer', 'Chief officer', 39.4, 43.6, -5.0, -0.6, 'crew')
S('bridge', 'second', 'Second officer; second engineer', 43.6, 47.2, -5.0, -0.6, 'crew')
S('bridge', 'office', "Ship's office", 47.2, 50.0, -5.0, -0.6, 'crew')
S('bridge', 'corridor', 'Corridor', 22.0, 50.0, -0.6, 0.6, 'crew')
S('bridge', 'wheelhouse', 'Wheelhouse, wings to the ship\'s side', 50.0, 55.6, -HB, HB, 'bridge',
  'Her navigation bridge, moved aboard with what is fitted in it; the wings are carried out to the side so the berth is seen from the wing console')

# The top deck: the house the owner asked for
S('top', 'co2-room', 'CO₂ room', 27.0, 29.8, -2.5, 2.5, 'safety', 'The engine rooms\' gas; entered from the open deck only')
S('top', 'eg-room', 'Emergency generator room', 29.8, 37.8, -2.5, 2.5, 'machinery',
  'The owner, 11 November 2026: "Build the ships emergency generator room", with a drawing of a room 7.8 m by 4.5 m and 3.2 m high: the set on its skid, the emergency switchboard, the day tank, the starting batteries; above the uppermost deck and entered from the open deck')
S('top', 'battery-room', 'Battery room', 37.8, 39.8, 0.0, 2.5, 'safety', 'The transitional and radio batteries: a room of their own, not the switchboard\'s (SOLAS II-1/42.5.2 as the yard recalls it; to be read)')
S('top', 'ac-room', 'Air conditioning plant', 37.8, 39.8, -2.5, 0.0, 'machinery', 'The chilled water unit for the air handling unit next door')
S('top', 'ventilation-room', 'Ventilation room', 39.8, 46.2, -2.5, 2.5, 'machinery',
  'The owner, 11 November 2026: "this is the ventilation room that should be on top of the bridge deck", with a drawing of a room 6.2 m by 3.4 m and 2.9 m high: an air handling unit of 6,000 m³/h for the passenger spaces, two extract fans of 3,000 m³/h, the filter box, the fire damper')
S('top', 'compass-deck', 'Compass deck: mast, radar, compass', 50.0, 55.6, -HB, HB, 'bridge')
S('top', 'top-open', 'Top deck, open', 22.0, 50.0, -5.0, 5.0, 'open', label=(24.5, 0.0), why= 'Over the accommodation: the house\'s doors open onto it; the air intakes and outlets stand clear of the funnels\' smoke')
both('top', 'funnel-top', 'Funnel', 13.0, 20.0, 3.2, 5.8, 'machinery', 'With the line\'s J')

# ---- What stands on the profile: (name, from, to, foot, top)
PROFILE = [
    ('hull', 0.0, LENGTH, 0.0, DECKS['passenger']),
    ('passenger house', 13.0, 54.0, DECKS['passenger'], DECKS['bridge']),
    ('accommodation', 22.0, 50.0, DECKS['bridge'], DECKS['top']),
    ('wheelhouse', 50.0, 55.6, DECKS['bridge'], DECKS['top']),
    ('top house', 27.0, 46.2, DECKS['top'], DECKS['top_house']),
    ('funnel', 13.6, 19.6, DECKS['passenger'], FUNNEL_TOP),
]

# ---- What the yard asks the owner to settle before she is built
QUESTIONS = [
    'The bow: a visor and an inner ramp, driven through (drawn); or her old way, a blunt bow that the ramp itself closes.',
    'The saloon to the ship\'s side with windows (drawn), or narrower with a promenade outside it on each side.',
    'Where the owner\'s two rooms stand: in one house on the top deck with the CO₂ room and the batteries (drawn).',
    'The emergency generator\'s size: the owner\'s drawing names 500 kW; her own emergency loads (steering, fire and drencher pumps, lighting, navigation) come to something near 200 kW. The room is drawn at the drawing\'s size either way.',
    'Her service speed and engines (14 knots, two of 1,470 kW): they set the engine room\'s length.',
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


if __name__ == '__main__':
    bad = check()
    print(f'{len(SPACES)} spaces on {len(PLANS)} plans, {len(BULKHEADS)} watertight bulkheads; displacement about {DISPLACEMENT:,} t')
    for w in bad:
        print('  NOT:', w)
    raise SystemExit(1 if bad else 0)
