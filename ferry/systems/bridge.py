"""
The navigation bridge of the Chisum: the wheelhouse, its two wings and what stands over it on the compass deck.
Every component with what it is, where it stands, what it draws and from which circuit; the boards and their circuits; the
nets that join the components; the pipes; and the cable ways all of it is laid along.

One source for two readers. `ferry/blender/wheelhouse.py` draws each component where this module puts it (`at`, and the
drawing's own measures in `g`); `register.py` works out currents, cable lengths and voltage drops, checks the lot and writes
`ferry/data/systems.json`, which the page reads.

Places are given as on the bridge deck: x to port, `yard` metres from the transom, h metres over the deck (the deck is
11.0 m above the keel, 9.1 m above the waterline). The compass deck's top is at h 2.40.

Powers are typical figures for equipment of the kind and size, not a maker's data sheet (basis 'typical'), or the Minato
Maru's planning figures (basis 'town'). The survey of 10 November (`ferry/design/bridge/register.csv`) is cross-referenced
as `survey`; where the Town gave an item a KKS tag it is kept as `kks`.
"""

import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'blender'))
import bridge_place as BP          # where the bridge stands in the 68 m ship: the places below are the bridge's own
import eg_place

SECTION = dict(id='bridge', name='Navigation bridge', rooms=dict(wheelhouse='Wheelhouse', **{'wing-p': 'Bridge wing, port', 'wing-s': 'Bridge wing, starboard', 'compass-deck': 'Compass deck', 'eg-house': 'Emergency generator room'}))
# The wheelhouse's heights (the owner, 11 November 2026, on raising its roof: "Yes make it realistic"): 2.30 m clear under
# the deckhead lining, a void over the lining for the cable trays, and the compass deck's top 2.70 m over the bridge deck.
DECK_H = 2.70          # the compass deck's top, over the bridge deck
CEIL = 2.30            # the deckhead lining: the clear height
VOID = 2.37            # the void between the lining and the roof's structure, where the cable trays lie

# ---------------------------------------------------------------------------------------------------------------------
# Cable ways: named points (x, yard, h) and the trays, trunks and ducts between them. A cable goes from its board to its
# consumer along the shortest way through them; its length is that way, the tails at both ends, and a tenth more.
# ---------------------------------------------------------------------------------------------------------------------
NODES = {
    'COR': (0.0, 19.50, VOID),          # where the signal and communication cables arrive: the corridor's deckhead at the wheelhouse door
    'MAIN-IN': (2.70, 19.50, VOID),     # where the main supplies arrive, along the port side of the house
    'EM-IN': (-2.70, 19.50, VOID),      # and the emergency and battery supplies, along the starboard side: the two ways lie 5.4 m apart
    'AFT-C': (0.0, 19.70, VOID),        # the cross tray along the aft wall
    'AFT-P': (1.60, 19.70, VOID),
    'AFT-PP': (2.70, 19.70, VOID),
    'AFT-S': (-1.50, 19.70, VOID),
    'AFT-SS': (-2.70, 19.70, VOID),
    'BRD': (1.60, 19.62, 1.85),         # the trunk down the aft wall to the boards
    'CHT': (-1.50, 19.62, 1.50),        # the trunk down to the chart table
    'P-M': (1.60, 21.20, VOID),         # the port tray, fore and aft
    'P-F': (1.60, 22.60, VOID),
    'S-M': (-1.50, 21.20, VOID),        # the starboard tray
    'S-F': (-1.50, 22.60, VOID),
    'MAST-0': (0.0, 20.80, VOID),       # the centre tray, and the cable transit at the mast's foot
    'C-F': (0.0, 22.60, VOID),
    'PP-F': (2.80, 22.60, VOID),        # the cross tray over the console
    'SS-F': (-2.80, 22.60, VOID),
    'OVH': (0.0, 22.52, 2.20),          # the overhead console
    'DUCT-P': (0.58, 22.88, VOID),      # the cable ducts down two window mullions into the console
    'DUCT-S': (-0.58, 22.88, VOID),
    'CON-PP': (2.60, 22.84, 0.50),      # the console's cable duct along its forward side
    'CON-P': (0.58, 22.84, 0.50),
    'CON-0': (0.0, 22.84, 0.50),
    'CON-S': (-0.58, 22.84, 0.50),
    'CON-SS': (-2.60, 22.84, 0.50),
    'STAND': (0.0, 21.98, 0.05),        # the floor trunk from the console to the steering stand
    'WING-P': (3.10, 22.65, 0.50),      # through the house side to each wing console
    'WING-S': (-3.10, 22.65, 0.50),
    'WALL-P': (2.96, 21.20, VOID),      # along the head of each side wall, for the wing lights
    'WALL-S': (-2.96, 21.20, VOID),
    'MAST-D': (0.0, 20.80, DECK_H + 0.05),   # up the mast
    'MAST-PF': (0.0, 20.80, 4.80),
    'MAST-ML': (0.0, 20.80, 5.60),
    'MAST-H': (0.0, 20.80, 5.85),
    'MAST-T': (0.0, 20.80, 7.25),
    'ROOF-A': (0.0, 19.85, DECK_H + 0.05),   # conduit on the compass deck, aft to the antennas
    'ROOF-F': (0.0, 22.00, DECK_H + 0.05),   # and forward to the searchlight, the floodlights and the binnacle
}
EDGES = [
    ('COR', 'AFT-C'), ('MAIN-IN', 'AFT-PP'), ('EM-IN', 'AFT-SS'), ('AFT-C', 'AFT-P'), ('AFT-P', 'AFT-PP'), ('AFT-C', 'AFT-S'), ('AFT-S', 'AFT-SS'),
    ('AFT-P', 'BRD'), ('AFT-S', 'CHT'),
    ('AFT-P', 'P-M'), ('P-M', 'P-F'), ('AFT-S', 'S-M'), ('S-M', 'S-F'),
    ('AFT-C', 'MAST-0'), ('MAST-0', 'C-F'),
    ('PP-F', 'P-F'), ('P-F', 'C-F'), ('C-F', 'S-F'), ('S-F', 'SS-F'), ('C-F', 'OVH'),
    ('P-F', 'DUCT-P'), ('S-F', 'DUCT-S'), ('DUCT-P', 'CON-P'), ('DUCT-S', 'CON-S'),
    ('CON-PP', 'CON-P'), ('CON-P', 'CON-0'), ('CON-0', 'CON-S'), ('CON-S', 'CON-SS'),
    ('CON-0', 'STAND'), ('CON-PP', 'WING-P'), ('CON-SS', 'WING-S'),
    ('P-M', 'WALL-P'), ('S-M', 'WALL-S'),
    ('MAST-0', 'MAST-D'), ('MAST-D', 'MAST-PF'), ('MAST-PF', 'MAST-ML'), ('MAST-ML', 'MAST-H'), ('MAST-H', 'MAST-T'),
    ('MAST-D', 'ROOF-A'), ('MAST-D', 'ROOF-F'),
]

# Where each board elsewhere sends its cables into the bridge. PA-001 comment 7: main and emergency supplies do not share a
# way. They meet only at the boards themselves, which stand side by side on the aft wall.
ENTRY = {'LB': 'MAIN-IN', 'MSB': 'MAIN-IN', 'SG1': 'MAIN-IN', 'ESB': 'EM-IN', 'TSB': 'EM-IN', 'DCB': 'EM-IN', 'DCB-R': 'EM-IN', 'SG2': 'EM-IN'}

# ---------------------------------------------------------------------------------------------------------------------
# Boards on the bridge. `comp` is the component that is the board; `feeder` the cable that feeds it: breaker (A), copper
# (mm²), and the board or circuit it comes from.
# ---------------------------------------------------------------------------------------------------------------------
BOARDS = [
    dict(id='BD1', name='Wheelhouse distribution board', comp='ELD-01', volts=105, kind='AC', fed_by='LB',
         feeder=dict(breaker=40, mm2=16),
         text='General services of the bridge: lighting, wipers, sockets, the air conditioner, the chart system. Dead in a blackout.'),
    dict(id='BD2', name='Wheelhouse emergency distribution board', comp='ELD-02', volts=105, kind='AC', fed_by='ESB',
         feeder=dict(breaker=16, mm2=4),
         text='What must work when the main board is dead: the radar, public address and general alarm, the emergency light, '
              'the whistle, the second supply of the propulsion control. Fed from the emergency switchboard, so from the main '
              'generators while they run and from the emergency generator when they do not. The navigation lights and the fire '
              'detection panel are not on it: each has feeders of its own, direct from the switchboards.'),
    dict(id='DC1', name='24 V DC panel, navigation and control', comp='ELD-03', volts=24, kind='DC', fed_by='DCB',
         feeder=dict(breaker=40, mm2=35),
         text='Navigation sensors, steering and propulsion control, alarms, the red night lighting: on the general service battery, '
              'so nothing on it notices a blackout.'),
    dict(id='DC2', name='24 V DC panel, radio', comp='ELD-04', volts=24, kind='DC', fed_by='DCB-R',
         feeder=dict(breaker=25, mm2=25),
         text='The radio installation on its own battery (the reserve source of energy): both VHF sets, the NAVTEX receiver, the '
              'position fix for the distress call, the portable sets\' charger.'),
    # PA-001 comment 2: each supply direct from a switchboard, not through a board that serves other consumers.
    # PA-001 revision 1, comment 17: the emergency feeder comes from the switchboard's transitional section, so that the
    # lanterns stay lit through the 45 seconds before the emergency generator is on the board (SOLAS II-1/42.4.1).
    dict(id='NLP', name='Navigation light panel', comp='NLT-01', volts=105, kind='AC', fed_by='TSB',
         feeder=dict(breaker=10, mm2=2.5), alt_feeder=dict(board='LB', breaker=10, mm2=4, via='CON-P'),      # round by the port side and the port duct
         text='One fused and monitored way for each lantern: a lamp that fails sounds the buzzer and lights its lamp on the '
              'panel. Two feeders of its own, each direct from a switchboard and by a different way: the emergency switchboard\'s '
              'transitional section, which the battery keeps alive while the emergency generator starts, and the main lighting '
              'board as the second, with the change-over switch on the panel. The emergency feeder comes down the starboard duct, the '
              'main feeder round the port side and down the port duct: they meet in the console, at the panel.'),
]

# A circuit that comes to the bridge from a board elsewhere and is not one of the bridge's own: the Minato Maru's feeder
# list gives it whole (breaker, cable, length).
OUTSIDE_CIRCUITS = {
    # PA-001 comment 3: each steering control system is fed from its own power unit's circuit, not from a bridge board.
    ('SG1', 'control'): dict(name='Steering control system No. 1', breaker=2, mm2=1.5),
    ('SG2', 'control'): dict(name='Steering control system No. 2', breaker=2, mm2=1.5),
    # PA-001 revision 1, comment 18 (FSS Code chapter 9, 2.2.1): the fire detection panel's two feeders run direct from the
    # main and the emergency switchboard to the change-over switch at the panel, through no other board.
    ('ESB', 'fire detection'): dict(name='Fire detection panel, emergency feeder', breaker=2, mm2=1.5),
    ('LB', 'fire detection'): dict(name='Fire detection panel, main feeder', breaker=2, mm2=1.5),
    # The bridge deck abaft the wheelhouse (blender/bridge_deck.py): the corridor's and the platform's lights on the lighting
    # board's circuit for this deck; the two exit lights on the emergency switchboard's emergency lighting.
    ('LB', 'bridge deck lighting'): dict(name='Bridge deck lighting, corridor and after platform', breaker=6, mm2=1.5),
    ('ESB', 'emergency lighting'): dict(name='Emergency lighting, bridge deck', breaker=6, mm2=1.5),
    # The emergency generator room (blender/eg_room.py): the starting battery's charger.
    # (2.5 mm²: on the 68 m ship the room stands on the top deck, and the way from the bridge's cable entry, by which every
    # cable of this section is still measured, is 39 m: 1.5 mm² lost 6.3 % of the voltage over it.)
    ('ESB', 'emergency generator auxiliaries'): dict(name='Emergency generator: starting battery charger', breaker=10, mm2=2.5),
    ('LB', 'searchlight'): dict(name='Searchlight', breaker=16, mm2=4, length=37.0, kks='10CTA10 GS001',
                                note="The Minato Maru's feeder, its own cable from the lighting board by the port casing trunk, with a 16 A breaker: "
                                     "that ship's list gives it 10 A for 9.5 A, which is under its own rule of 1.25 times the full-load current."),
}

# Circuits: (board, number, name, breaker A, copper mm², power factor or None for the default 0.9).
CIRCUITS = [
    ('BD1', 1, 'Wheelhouse lighting', 6, 1.5, None),
    ('BD1', 2, 'Wing lights and foredeck floodlights', 10, 2.5, None),
    ('BD1', 3, 'Window wipers and window wash', 6, 1.5, None),
    ('BD1', 4, 'Console sockets', 10, 2.5, None),
    ('BD1', 5, 'Air conditioner', 16, 4, None),
    ('BD1', 6, 'Chart system and cameras', 6, 1.5, None),
    ('BD1', 8, 'Dimmers and console heaters', 6, 1.5, None),
    ('BD2', 1, 'Radar', 6, 2.5, None),
    ('BD2', 2, 'Public address and general alarm', 6, 1.5, None),
    ('BD2', 4, 'Emergency lighting, wheelhouse', 2, 1.5, None),
    ('BD2', 6, 'Whistle control', 2, 1.5, None),
    ('BD2', 7, 'Propulsion control, second supply', 2, 1.5, None),
    ('DC1', 1, 'GPS navigator', 2, 1.5, None),
    ('DC1', 2, 'AIS transponder', 6, 2.5, None),
    ('DC1', 3, 'Satellite compass', 2, 1.5, None),
    ('DC1', 4, 'Echo sounder', 4, 1.5, None),
    ('DC1', 5, 'Speed log', 2, 1.5, None),
    ('DC1', 6, 'Navigation data: distributor, network switch, conning display', 6, 2.5, None),
    ('DC1', 7, 'Autopilot', 2, 1.5, None),
    ('DC1', 8, 'Propulsion remote control', 10, 4, None),
    ('DC1', 9, 'Bow thruster control', 2, 1.5, None),
    ('DC1', 10, 'Talkback', 2, 1.5, None),
    ('DC1', 11, 'Alarm panel, watch alarm, door and ramp panel', 4, 1.5, None),
    ('DC1', 12, 'Heading and bearing repeaters, rudder angle indicators', 4, 2.5, None),
    ('DC1', 13, 'Wind sensor and display', 2, 1.5, None),
    ('DC1', 14, 'Public address and general alarm, battery supply', 16, 6, None),
    ('DC1', 15, 'Night and transitional lighting, binnacle light', 2, 1.5, None),
    ('DC1', 16, 'Signalling lamp socket', 4, 1.5, None),
    ('DC2', 1, 'VHF No. 1', 10, 4, None),
    ('DC2', 2, 'VHF No. 2', 10, 4, None),
    ('DC2', 3, 'NAVTEX receiver', 2, 1.5, None),
    ('DC2', 4, 'GPS navigator, second supply', 2, 1.5, None),
    ('DC2', 5, 'Portable VHF charger', 2, 1.5, None),
    ('NLP', 1, 'Masthead light', 2, 1.5, 1.0),
    ('NLP', 2, 'Port sidelight', 2, 1.5, 1.0),
    ('NLP', 3, 'Starboard sidelight', 2, 1.5, 1.0),
    ('NLP', 4, 'Stern light', 2, 1.5, 1.0),
    ('NLP', 5, 'Anchor light', 2, 1.5, 1.0),
    ('NLP', 6, 'Not under command, upper pair', 2, 1.5, 1.0),
    ('NLP', 7, 'Not under command, lower pair', 2, 1.5, 1.0),
]

# Cables that must go on working in a fire (PA-001 comment 7): the feeders and ways of the emergency services.
FIRE_RESISTANT = {('feeder', 'BD2'), ('feeder', 'NLP'), ('alt', 'NLP'), ('feeder', 'DC1'), ('feeder', 'DC2'),
                  ('BD2', 2), ('BD2', 4), ('BD2', 7), ('ESB', 'fire detection'), ('LB', 'fire detection'), ('DC1', 14), ('DC1', 15), ('SG1', 'control'), ('SG2', 'control')} | {('NLP', n) for n in range(1, 8)}

# ---------------------------------------------------------------------------------------------------------------------
# Components.
# ---------------------------------------------------------------------------------------------------------------------
COMPONENTS = []


def C(id, name, room, at, what, g=None, w=0, use=1.0, by=None, alt=None, node=None, survey=None, kks=None, basis='typical',
      hid=None, box=None, pick=True, note=None, tail=None):
    """
    A component. `at` is where it stands (x, yard, h); `g` how it is drawn (kind and measures); `w` what it draws in watts
    and `use` the share of that it takes on average at sea; `by` the circuit that feeds it (board, number), `alt` a second
    supply; `node` the cable way it is reached from (else the nearest); `hid` says where a component that cannot be seen is;
    `box` places one that another module draws (x0, x1, yard0, yard1, h0, h1); `pick` False keeps it from answering a tap;
    `tail` is the cable's length beyond `node` where the component lies outside the section (its way there is not drawn).
    """
    if room in ('wing-p', 'wing-s'):
        at = (BP.wing_x(at[0]), at[1], at[2])          # the wings are carried to the ship's side: what stood at their outer end went with them
    COMPONENTS.append(dict(id=id, name=name, room=room, at=at, what=what, g=g or dict(kind='none'), w=w, use=use, by=by, alt=alt,
                           node=node, survey=survey, kks=kks, basis=basis, hid=hid, box=box, pick=pick, note=note, tail=tail))


WH, WP, WS, CD = 'wheelhouse', 'wing-p', 'wing-s', 'compass-deck'
TOP = 1.00             # the console's top
FRONT, BACK = 22.39, 22.50   # the console's two rows: flush panels at the helmsman's hand, tilted displays behind them

# ---- Outfit: the room and its furniture.
C('OUT-01', 'Console', WH, (0.0, 22.61, 0.0), 'The forward console, 5.5 m wide, in five bays with doors to the equipment inside; its top is at 1.0 m; nothing on it stands higher than 1.33 m, and nothing ahead of the wheel higher than 1.22 m, so the sea is seen over it from the helm (calculation JS4-402).',
  dict(kind='console'), survey='B080')
C('OUT-02', "Master's chair", WH, (1.05, 21.55, 0.0), 'A high pedestal chair at the conning position, to port of the wheel.', dict(kind='chair'), survey='B089')
C('OUT-03', "Watch officer's chair", WH, (-1.05, 21.55, 0.0), 'A second pedestal chair, at the radar.', dict(kind='chair'))
C('OUT-04', 'Chart table', WH, (-1.475, 19.84, 0.0), 'The chart table against the aft wall, with three drawers for folded charts and the chart in use on its top. She navigates on paper charts; the chart system on the console is an aid.',
  dict(kind='chart_table', w=0.95, d=0.60, H=0.95), survey='B087')
C('OUT-05', 'Bookshelf, nautical publications', WH, (-1.62, 19.54, 1.58), 'Tide tables, the list of lights, the radio signals list, the signal code and the ship\'s own manuals, behind a fiddle rail.',
  dict(kind='bookshelf', w=0.66, d=0.20, H=0.26))
C('OUT-07', 'Binoculars box', WH, (-2.64, 22.76, TOP), 'Two 7 × 50 binoculars in a varnished box at the console\'s starboard end.', dict(kind='binoculars'))
C('OUT-08', 'Stair well and rail', WH, (-2.50, 19.85, 0.0), 'The head of the crew stair from the saloon, railed on its inboard side, with a self-closing gate across the top where one comes up: it opens forward, away from the well.',
  dict(kind='stairwell'))
C('OUT-09', 'Log desk', WH, (2.71, 21.70, 0.88), 'A fold-down desk under the port window for the deck log, with its own lamp.', dict(kind='log_desk', w=0.72, d=0.40),
  w=10, use=0.2, by=('BD1', 1), survey='B102')
C('OUT-10', 'Door, corridor to wheelhouse', WH, (0.0, 19.50, 0.0), 'The door from the crew corridor. It opens into the wheelhouse and is kept shut at night to keep the corridor\'s light off the glass.',
  dict(kind='door_corridor'))
C('OUT-11', 'Deck covering', WH, (0.0, 21.2, 0.0), 'Sheet vinyl on the steel deck, with a ribbed rubber mat at the helm.', dict(kind='floor'), pick=False)
C('OUT-14', 'Deckhead lining', WH, (0.0, 21.2, CEIL), 'Lining panels under the compass deck; the cable trays lie above them.', dict(kind='ceiling'), pick=False)
C('OUT-15', 'Overhead grab rail, port', WH, (0.75, 21.2, 1.98), 'A rail under the deckhead to hold on to in a seaway.', dict(kind='grabrails', side=1))
C('OUT-23', 'Overhead grab rail, starboard', WH, (-0.75, 21.2, 1.98), 'A rail under the deckhead to hold on to in a seaway.', dict(kind='grabrails', side=-1))
C('OUT-16', 'Overhead console', WH, (0.0, 22.52, 2.06), 'A sloped panel under the deckhead over the forward console, for what is read at a glance. It hangs above the windows\' head, so that it hides nothing the glass would show.', dict(kind='overhead'))
C('OUT-17', 'Sun blinds', WH, (0.0, 22.98, 2.06), 'A roller blind of tinted film at the head of each forward window.', dict(kind='blinds'))
C('OUT-18', 'Door to the port wing', WH, (2.96, 20.85, 0.0), 'A weathertight door, hinged on its forward edge, with a glazed upper half and a 0.15 m sill. It stands opposite the starboard one: the Minato Maru\'s stood in the aft corner, where the boards and their locker now have the wall to themselves.',
  dict(kind='door_wing', side=1, yd=(20.45, 21.25)), survey='B104')
C('OUT-19', 'Door to the starboard wing', WH, (-2.96, 20.85, 0.0), 'A weathertight door, hinged on its forward edge, with a glazed upper half and a 0.15 m sill.',
  dict(kind='door_wing', side=-1, yd=(20.45, 21.25)), survey='B104')
C('OUT-20', 'Wheelhouse plating, linings and windows', WH, (0.0, 21.2, 0.0), 'The house itself: plated outside, lined inside, five forward windows raked 10° under a visor, and windows down both sides: glass over 224° of the horizon from the helm.',
  dict(kind='envelope'), pick=False, survey='B105')
C('OUT-21', 'Wing bulwarks, port', WP, (3.6, 21.2, 0.0), 'A plated bulwark 1.1 m high round the wing, with a varnished cap rail.', dict(kind='wing', side=1), pick=False)
C('OUT-22', 'Wing bulwarks, starboard', WS, (-3.6, 21.2, 0.0), 'A plated bulwark 1.1 m high round the wing, with a varnished cap rail.', dict(kind='wing', side=-1), pick=False)

# ---- Navigation.
C('NAV-01', 'Radar display', WH, (-1.05, BACK, TOP), 'The radar picture, with target tracking: the display and its keyboard at the watch officer\'s chair, under a hood against the daylight.',
  dict(kind='display', w=0.50, d=0.30, H=0.30, tile='radar', hood=True, keys=('radar_kbd', 0.40)), w=80, by=('BD2', 1), node='CON-SS', survey='B081', kks='10CTA10 GS002')
C('NAV-02', 'Radar processor', WH, (-1.05, 22.64, 0.30), 'The radar\'s processor unit: it takes the scanner\'s signal, the heading and the position, and gives the picture to the display and to the chart system.',
  dict(kind='box', size=(0.40, 0.28, 0.18)), w=120, by=('BD2', 1), node='CON-SS', hid='inside the console, radar bay')
C('NAV-30', 'Radar scanner', CD, (0.0, 20.80, 5.02), 'An X-band scanner on the mast platform: a turning unit and a 1.8 m array, 14.2 m above the waterline.',
  box=(-0.96, 0.96, 20.62, 20.98, 4.80, 5.20), w=100, by=('BD2', 1), node='MAST-PF', survey='B114')
C('NAV-04', 'AIS transponder', WH, (-1.55, 22.55, TOP), 'Sends her name, position, course and speed on VHF and shows the ships that send theirs.',
  dict(kind='display', w=0.22, d=0.22, H=0.18, tile='ais'), w=60, use=0.3, by=('DC1', 2), node='CON-SS')
C('NAV-05', 'Electronic chart system', WH, (1.95, BACK, TOP), 'Her position on an electronic chart, with the radar\'s and the AIS\'s targets laid over it. An aid: the paper chart on the chart table is the chart she is navigated on.',
  dict(kind='display', w=0.50, d=0.30, H=0.30, tile='ecdis', keys=('ecdis_kbd', 0.30)), w=120, by=('BD1', 6), node='CON-PP', survey='B082', kks='10CTA10 GS002')
C('NAV-06', 'GPS navigator', WH, (-0.60, 22.55, TOP), 'Position, course and speed over the ground from the satellites; it gives them to every set that needs them, the radios among them.',
  dict(kind='display', w=0.24, d=0.22, H=0.18, tile='gps'), w=10, by=('DC1', 1), alt=('DC2', 4), node='CON-S', survey='B096', kks='10CTA10 GS002')
C('NAV-07', 'Echo sounder', WH, (1.49, 22.55, TOP), 'The depth under the keel, drawn as a trace, with a shallow-water alarm.',
  dict(kind='display', w=0.24, d=0.22, H=0.22, tile='echo'), w=40, by=('DC1', 4), node='CON-PP', survey='B082', kks='10CTA10 GS002')
C('NAV-08', 'Speed log', WH, (0.80, 22.64, 0.62), 'The speed through the water from a sensor in the bottom; shown on the conning display.',
  dict(kind='box', size=(0.22, 0.16, 0.08)), w=20, by=('DC1', 5), node='CON-P', hid='inside the console, conning bay')
C('NAV-09', 'Navigation data distributor', WH, (-0.60, 22.64, 0.56), 'Takes each sensor\'s sentences once and gives a buffered copy to every listener, so that no set can pull another\'s line down.',
  dict(kind='box', size=(0.26, 0.16, 0.08)), w=10, by=('DC1', 6), node='CON-S', hid='inside the console, radar bay')
C('NAV-10', 'Conning display', WH, (1.05, BACK, TOP), 'Heading, rudder angle, both engines\' revolutions, speed, depth and wind on one screen in front of the master\'s chair.',
  dict(kind='display', w=0.46, d=0.30, H=0.30, tile='conning'), w=60, by=('DC1', 6), node='CON-P', survey='B083')
C('NAV-11', 'Satellite compass processor', WH, (-0.60, 22.64, 0.30), 'Works out her true heading and rate of turn from the two antennas in the dome on the compass deck. It is the heading every set steers and plots by.',
  dict(kind='box', size=(0.26, 0.20, 0.10)), w=20, by=('DC1', 3), node='CON-S', hid='inside the console, radar bay')
C('NAV-12', 'Autopilot control unit', WH, (0.12, 21.74, 0.98), 'Sets and holds a heading; it steers through the steering control unit like the wheel does.',
  dict(kind='flush', w=0.20, l=0.20, tile='autopilot', rise=0.07), w=30, by=('DC1', 7), node='STAND', survey='B075', kks='10CTA10 GS002')
C('NAV-13', 'Wind display', WH, (-0.42, 22.43, 2.18), 'Wind direction and speed relative to the ship, on the overhead console.', dict(kind='ovh_dial', r=0.085, tile='wind'), w=5, by=('DC1', 13), node='OVH')
C('NAV-14', 'Navigation network switch', WH, (0.80, 22.64, 0.50), 'The Ethernet switch of the navigation network.', dict(kind='box', size=(0.24, 0.14, 0.05)), w=15, by=('DC1', 6), node='CON-P',
  hid='inside the console, conning bay')
C('NAV-15', 'Compass periscope', WH, (0.0, 22.20, 1.97), 'The magnetic compass on the compass deck, read from the helm through a tube and a mirror: it stands directly under the binnacle.',
  dict(kind='periscope'), survey='B084')
C('NAV-16', 'Bearing repeater, port wing', WP, (3.55, 21.55, 0.0), 'A heading repeater under an azimuth ring on a pelorus stand, to take bearings from the wing.',
  dict(kind='pelorus', side=1), w=10, by=('DC1', 12), node='WING-P')
C('NAV-17', 'Bearing repeater, starboard wing', WS, (-3.55, 21.55, 0.0), 'A heading repeater under an azimuth ring on a pelorus stand, to take bearings from the wing.',
  dict(kind='pelorus', side=-1), w=10, by=('DC1', 12), node='WING-S')
C('NAV-20', 'Ship\'s clock', WH, (-1.84, 19.54, 1.36), 'A brass bulkhead clock over the chart table.', dict(kind='dial', r=0.085, tile='clock'), survey='B101')
C('NAV-21', 'Barometer', WH, (-1.60, 19.54, 1.36), 'An aneroid barometer.', dict(kind='dial', r=0.085, tile='barometer'), survey='B101')
C('NAV-22', 'Clinometer', WH, (-1.36, 19.54, 1.36), 'Shows her list in degrees.', dict(kind='dial', r=0.085, tile='clinometer'), survey='B101')
C('NAV-31', 'AIS antenna', CD, (0.6, 19.80, DECK_H), 'The AIS\'s own VHF whip, 1.4 m.', box=(0.54, 0.66, 19.74, 19.86, DECK_H, DECK_H + 1.42), node='ROOF-A')
C('NAV-32', 'GPS antenna', CD, (0.8, 19.90, DECK_H), 'The GPS navigator\'s antenna dome.', box=(0.69, 0.91, 19.79, 20.01, DECK_H, DECK_H + 0.31), node='ROOF-A', survey='B115')
C('NAV-33', 'Satellite compass antenna', CD, (-0.8, 19.90, DECK_H), 'Two satellite antennas in one dome, a known distance apart along her length: the heading is the direction from one to the other.',
  box=(-0.99, -0.61, 19.71, 20.09, DECK_H, DECK_H + 0.38), node='ROOF-A')
C('NAV-34', 'Magnetic compass and binnacle', CD, (0.0, 22.20, DECK_H), 'The standard compass, on the centreline clear of steel and wiring, with a dimmed lamp. It needs no power to point.',
  box=(-0.30, 0.30, 21.90, 22.50, DECK_H, DECK_H + 1.21), w=5, use=0.5, by=('DC1', 15), node='ROOF-F', survey='B116')
C('NAV-35', 'AIS position antenna', CD, (0.30, 19.62, DECK_H), 'A small satellite antenna for the AIS\'s own position fix.', dict(kind='gnss_small'), node='ROOF-A')
C('NAV-36', 'Wind sensor', CD, (-1.40, 20.80, 4.70), 'A cup anemometer and a vane at the starboard end of the flag yard.', dict(kind='wind_sensor'), node='MAST-PF')

# ---- Steering.
C('STR-01', 'Steering stand and wheel', WH, (0.0, 21.75, 0.0), 'The helm: an eight-spoke wheel on a stand. The wheel\'s shaft runs through a flanged bearing into the helm unit on the stand\'s top, where it turns two transmitters, one for each control system, and the pointer on the unit\'s lid that shows the rudder ordered. Where the wheel is put, the rudders follow: four degrees of wheel for one of rudder, and the spoke with the brass cap upright when they are amidships. On the page the wheel turns with the rudder.',
  dict(kind='stand'), survey='B073')
C('STR-02', 'Steering control system No. 1', WH, (0.11, 21.75, 0.30), 'The first of two control systems that have nothing in common. It compares the rudder ordered (by the wheel\'s first transmitter, or the autopilot) with the angle fed back from the gear and works the valves of power unit No. 1. Its supply comes from that power unit\'s own circuit in the steering-gear room, and its cables go down the port side.',
  dict(kind='box', size=(0.19, 0.30, 0.34)), w=50, by=('SG1', 'control'), node='STAND', hid='inside the steering stand, port half')
C('STR-07', 'Steering control system No. 2', WH, (-0.11, 21.75, 0.30), 'The second control system: the wheel\'s second transmitter, its own amplifier, the valves of power unit No. 2, a supply from that unit\'s circuit (which comes by the emergency switchboard), and cables down the starboard side. Either system steers her alone; the selector on the stand chooses.',
  dict(kind='box', size=(0.19, 0.30, 0.34)), w=50, by=('SG2', 'control'), node='STAND', hid='inside the steering stand, starboard half')
C('STR-03', 'Steering mode selector and tiller', WH, (-0.14, 21.74, 0.98), 'Chooses the control system (No. 1 or No. 2) and hand steering, autopilot or the tiller. The tiller works the valves of the chosen power unit directly (non-follow-up): the rudders move while it is held over, and it needs neither amplifier. It stands in a gate, a slot across the ship; a tap holds it over or lets it go.',
  dict(kind='flush', w=0.18, l=0.20, tile='steer_mode', lever=True), node='STAND', survey='B075')
C('STR-04', 'Heading repeater', WH, (0.0, 21.515, 0.86), 'The heading in figures, low on the stand\'s face: read by looking down, not through it.',
  dict(kind='facepanel', w=0.20, H=0.12, tile='hdg'), w=10, by=('DC1', 12), node='STAND', survey='B075')
C('STR-05', 'Rudder angle indicator, overhead', WH, (0.42, 22.43, 2.18), 'The rudders\' true angle, from the transmitter on the steering gear: read from anywhere in the wheelhouse.',
  dict(kind='ovh_dial', r=0.11, tile='rai'), w=10, by=('DC1', 12), node='OVH')
C('STR-06', 'Rudder angle indicator, console', WH, (-0.13, 22.74, TOP), 'A second indicator among the propulsion instruments. It sits on the console, not on a stand-off, so that the sea is seen over it (calculation JS4-402).',
  dict(kind='display', w=0.22, d=0.12, H=0.22, tile='rai_panel', lit=True), w=5, by=('DC1', 12), node='CON-0')

# ---- Propulsion control.
C('PRP-01', 'Engine control lever, port', WH, (0.45, 22.60, TOP), 'One lever for the port engine: ahead or astern through the gearbox, then revolutions. A control head: the lever turns on a shaft inside the housing and comes up through a slot in its top plate; a drum on the shaft closes the slot under it, and where the arm crosses the plate is its reading on the scale beside it, from full astern through stop to full ahead. Pushed forward is ahead. A tap moves it a notch, and the port engine\'s lever on each wing moves with it.',
  dict(kind='lever', colour=0xc2412f), node='CON-P', survey='B076')
C('PRP-02', 'Engine control lever, starboard', WH, (0.25, 22.60, TOP), 'One lever for the starboard engine, a control head like the port one\'s. A tap moves it a notch, and its fellow on each wing moves with it.', dict(kind='lever', colour=0x2f9e5a), node='CON-P', survey='B077')
C('PRP-03', 'Bow thruster lever', WH, (-0.15, 22.60, TOP), 'Thrust to port or starboard from the tunnel thruster in the bow. A control head whose slot lies across the ship: the lever is pushed the way her bow is to go. A tap moves it a notch, with its fellow on each wing.', dict(kind='lever', colour=0x4a6a8a, across=True), w=30, use=0.1, by=('DC1', 9), node='CON-0', survey='B078')
C('PRP-04', 'Propulsion control panel', WH, (0.35, FRONT, TOP), 'Which station has control (bridge, a wing, or the engine control room), engine start and stop, and an emergency stop for each engine under a flap.',
  dict(kind='flush', w=0.46, l=0.12, tile='prop_panel'), node='CON-P')
C('PRP-05', 'Bow thruster panel', WH, (-0.15, FRONT, TOP), 'Start, stop, running lamp and the motor\'s current.', dict(kind='flush', w=0.20, l=0.12, tile='thr_panel'), node='CON-0')
C('PRP-06', 'Engine instrument panel', WH, (0.37, 22.74, TOP), 'Revolutions of both engines, their oil pressure and cooling-water temperature. Low on the console, straight ahead of the wheel: the sea is seen over it (calculation JS4-402).',
  dict(kind='display', w=0.60, d=0.12, H=0.22, tile='engine_panel', lit=True), w=20, by=('DC1', 8), node='CON-P', survey='B083')
C('PRP-07', 'Propulsion control unit, bridge', WH, (0.35, 22.64, 0.30), 'Reads the levers at the three stations, decides which one commands, and sends the orders to the engine room over two CAN lines.',
  dict(kind='box', size=(0.40, 0.25, 0.30)), w=80, by=('DC1', 8), alt=('BD2', 7), node='CON-P', hid='inside the console, propulsion bay',
  note='Two supplies from different sources: the general service battery, and the emergency board through a rectifier of its own in the same case; the loss of either gives an alarm. If both control lines are lost the engines hold the speed and direction last ordered, the alarm sounds on the bridge and in the engine control room, and control is taken at the engines.')
C('PRP-10', 'Wing control station, port', WP, (3.715, 22.75, 0.0), 'Engine and thruster levers, a rudder angle indicator and a revolution indicator at the outboard forward corner of the wing, for berthing port side to. The levers are outboard: standing at them she is seen along her side, and across the bow past the house to 45° on the other side.',
  dict(kind='wing_console', side=1), node='WING-P', survey='B107')
C('PRP-11', 'Wing control station, starboard', WS, (-3.715, 22.75, 0.0), 'Engine and thruster levers, a rudder angle indicator and a revolution indicator at the outboard forward corner of the wing, for berthing starboard side to. The levers are outboard, as on the port wing.',
  dict(kind='wing_console', side=-1), node='WING-S', survey='B109')

# ---- Radio.
C('COM-01', 'VHF radiotelephone No. 1, with DSC', WH, (-1.95, 22.55, TOP), 'The distress and calling set: 25 W, digital selective calling on channel 70 with her position from the GPS, and a handset.',
  dict(kind='display', w=0.30, d=0.22, H=0.18, tile='vhf1', lit=True, handset=-1), w=150, use=0.1, by=('DC2', 1), node='CON-SS', survey='B093')
C('COM-02', 'VHF radiotelephone No. 2', WH, (-2.35, 22.55, TOP), 'The second set, for port and working channels, and the spare for the first.',
  dict(kind='display', w=0.26, d=0.22, H=0.18, tile='vhf2', lit=True), w=150, use=0.1, by=('DC2', 2), node='CON-SS')
C('COM-05', 'NAVTEX receiver', WH, (2.52, 22.55, TOP), 'Prints navigational and weather warnings broadcast on 518 kHz.',
  dict(kind='navtex', w=0.26, d=0.24, H=0.18, tile='navtex'), w=10, by=('DC2', 3), node='CON-PP', survey='B095', kks='10CTA10 GS002')
C('COM-06', 'Portable VHF sets and charger', WH, (-1.12, 19.54, 1.28), 'Three waterproof two-way sets for the survival craft, kept charged in their rack.',
  dict(kind='handhelds'), w=30, use=0.3, by=('DC2', 5), node='CHT')
C('COM-07', 'Radar transponder, port', WH, (2.90, 20.39, 1.45), 'A search and rescue transponder beside the port door, to be taken into a survival craft: it answers a searching radar. Its own battery.',
  dict(kind='sart', side=1))
C('COM-08', 'Radar transponder, starboard', WH, (-2.90, 20.39, 1.45), 'The second transponder, beside the starboard door. Its own battery.', dict(kind='sart', side=-1))
C('COM-10', 'Float-free EPIRB', WS, (-3.07, 20.39, 1.48), 'A satellite distress beacon in a bracket that lets it go and float free if she sinks. Its own battery.', dict(kind='epirb'), survey='B111')
C('COM-11', 'VHF antenna No. 1', CD, (-1.2, 19.60, DECK_H), 'A 3 m whip on the starboard side.', box=(-1.26, -1.14, 19.54, 19.66, DECK_H, DECK_H + 3.0), node='ROOF-A', survey='B115')
C('COM-12', 'VHF antenna No. 2', CD, (1.2, 19.60, DECK_H), 'A 3 m whip on the port side.', box=(1.14, 1.26, 19.54, 19.66, DECK_H, DECK_H + 3.0), node='ROOF-A', survey='B115')
C('COM-13', 'NAVTEX antenna', CD, (-0.35, 19.62, DECK_H), 'A short active antenna for 518 kHz.', dict(kind='navtex_ant'), node='ROOF-A', survey='B115')

# ---- Internal communication.
C('INT-01', 'Public address and general alarm amplifier', WH, (2.30, 22.64, 0.30), 'A 240 W amplifier with the general alarm\'s tone generator: seven short blasts and a long one on every loudspeaker aboard.',
  dict(kind='box', size=(0.45, 0.28, 0.18)), w=240, use=0.1, by=('BD2', 2), alt=('DC1', 14), node='CON-PP', hid='inside the console, port bay', survey='B097', kks='10CTA10 GS002',
  note='Two supplies: the emergency board, and the general service battery as the transitional source, taken over without a break when the board is dead.')
C('INT-02', 'Public address and talkback panel', WH, (2.50, FRONT, TOP), 'The microphone, the zone keys (car deck, saloon, crew, open decks), the general alarm key, and the talkback keys for the two wings, the mooring stations, the ramp and the engine control room.',
  dict(kind='flush', w=0.36, l=0.12, tile='pa_panel', mic=True), w=30, use=0.3, by=('DC1', 10), node='CON-PP', survey='B097')
C('INT-04', 'Telephone', WH, (2.12, FRONT, TOP), 'The ship\'s automatic telephone: cabins, mess, galley, engine control room.', dict(kind='phone', w=0.22, l=0.12, tile='phone'), node='CON-PP', survey='B094')
C('INT-05', 'Sound-powered telephone', WH, (-2.63, 22.42, TOP), 'Speaks to the engine control room and the steering-gear room with no supply at all: the voice makes the current, and a hand crank rings the other end.',
  dict(kind='sp_phone'), node='CON-SS', survey='B094')
C('INT-07', 'General alarm push button', WH, (0.56, 19.54, 1.52), 'Sounds the general alarm from the door.', dict(kind='callpoint', colour=0xe0b020, tile='ga_push'), node='BRD')
C('INT-08', 'Loudspeaker, wheelhouse', WH, (0.6, 20.6, CEIL), 'A loudspeaker in the deckhead.', dict(kind='ceil', type='speaker', r=0.10), node='MAST-0')
C('INT-09', 'Talkback station, port wing', WP, (3.06, 22.91, 1.22), 'A weatherproof loudspeaking station on the house side.', dict(kind='talkback', side=1), node='WING-P')
C('INT-10', 'Talkback station, starboard wing', WS, (-3.06, 22.91, 1.22), 'A weatherproof loudspeaking station on the house side.', dict(kind='talkback', side=-1), node='WING-S')
C('INT-11', 'Loudhailer', CD, (0.5, 21.15, 4.80), 'A horn loudspeaker on the mast platform, for hailing and for the fog signal\'s listening watch.',
  box=(0.36, 0.64, 21.06, 21.40, 4.80, 5.12), node='MAST-PF')

# ---- Alarm and monitoring.
C('ALM-01', 'Machinery alarm panel', WH, (1.30, FRONT, TOP), 'The engine room\'s alarms in groups, with a buzzer: the bridge sees that something is wrong below, and whether the engineer has accepted it.',
  dict(kind='flush', w=0.32, l=0.12, tile='alarm_panel'), w=25, by=('DC1', 11), node='CON-P', survey='B090')
C('ALM-02', 'Bridge watch alarm', WH, (0.96, FRONT, TOP), 'Asks the watch to press a button every few minutes at night. Unanswered, it calls the master\'s cabin, then the general alarm.',
  dict(kind='flush', w=0.26, l=0.12, tile='bnwas'), w=15, by=('DC1', 11), node='CON-P')
C('ALM-04', 'Watch alarm reset, chart table', WH, (-1.05, 19.54, 1.18), 'A reset button at the chart table.', dict(kind='callpoint', colour=0x3a4244, tile='bnwas_reset'), node='CHT')
C('ALM-05', 'Camera monitor', WH, (1.10, 22.43, 2.18), 'Four cameras on one screen: the bow ramp, the car deck, the stern and the engine room.',
  dict(kind='ovh_screen', w=0.42, H=0.19, tile='cctv'), w=40, by=('BD1', 6), node='OVH')
C('ALM-06', 'Ramp, hatch and watertight door panel', WH, (-1.55, FRONT, TOP), 'A lamp for the bow ramp, each hatch and each of the five watertight doors: green when shut and secured, red when not.',
  dict(kind='flush', w=0.44, l=0.12, tile='ramp_panel'), w=20, by=('DC1', 11), node='CON-SS', survey='B098')
C('ALM-07', 'Camera recorder', WH, (1.62, 22.64, 0.30), 'Records the cameras.', dict(kind='box', size=(0.40, 0.28, 0.09)), w=40, by=('BD1', 6), node='CON-PP', hid='inside the console, port bay')

# ---- Fire detection and fire-fighting.
C('FIR-01', 'Fire detection panel', WH, (0.94, 19.54, 1.20), 'The addressable fire detection panel: it names the detector that has answered, sounds the bells, and after two minutes unaccepted, the general alarm. It has a standby battery of its own.',
  dict(kind='wallbox', w=0.42, H=0.52, d=0.10, tile='fire_panel', colour=0xb03024), w=60, by=('ESB', 'fire detection'), alt=('LB', 'fire detection'), node='BRD', survey='B090', kks='10CSA',
  note='Two feeders of its own, direct from the emergency and the main switchboard, with the automatic change-over switch in the panel and a fault alarm for each; '
       'and a battery of its own that carries it for half an hour, through the 45 seconds before the emergency generator is on the board.')
C('FIR-02', 'Manual call point', WH, (0.56, 19.54, 1.32), 'Break the glass to give the alarm.', dict(kind='callpoint', colour=0xc2412f, tile='callpoint'), node='BRD', survey='B022')
C('FIR-03', 'Smoke detector', WH, (-0.5, 21.0, CEIL), 'An optical smoke detector on loop 1.', dict(kind='ceil', type='detector', r=0.055), node='MAST-0', survey='B022')
C('FIR-05', 'Fire extinguisher, CO₂ 5 kg', WH, (-0.70, 19.64, 0.04), 'For the electrical equipment: carbon dioxide leaves nothing behind.', dict(kind='extinguisher', colour=0xc2412f, horn=True), survey='B072')
C('FIR-06', 'Fire extinguisher, powder 6 kg', WH, (2.82, 20.39, 0.10), 'Dry powder, beside the port door.', dict(kind='extinguisher', colour=0xc2412f, wall='port'), survey='B072')
C('FIR-07', 'Fire hose box', WP, (3.11, 19.95, 0.10), 'A 15 m hose with a dual-purpose nozzle, coiled in its box beside the hydrant.', dict(kind='hosebox'), survey='B106')

# ---- Navigation lights and signals.
C('NLT-01', 'Navigation light panel', WH, (-1.55, 22.30, 0.63), 'A switch, a fuse and a lamp-failure indicator for each lantern, on a mimic of the ship; a change-over switch between its two supplies.',
  dict(kind='facepanel', w=1.06, H=0.26, tile='navlight_panel', face='console'), node='CON-SS', survey='B085', kks='10CTA20 GS001', basis='town')
C('NLT-02', 'Sidelight, port', WP, (4.13, 22.70, 1.20), 'Red, from right ahead to 22.5° abaft the port beam: on the bulwark\'s rail at the wing\'s outer end, with a screen board inboard of it.', dict(kind='sidelight', side=1), w=60, use=0.5, by=('NLP', 2), node='WING-P', survey='B108', basis='town')
C('NLT-03', 'Sidelight, starboard', WS, (-4.13, 22.70, 1.20), 'Green, from right ahead to 22.5° abaft the starboard beam: on the bulwark\'s rail, with a screen board inboard of it.', dict(kind='sidelight', side=-1), w=60, use=0.5, by=('NLP', 3), node='WING-S', survey='B110', basis='town')
C('NLT-04', 'Masthead light', CD, (0.0, 20.98, 5.60), 'White, over 225° ahead, on the front of the mast above the radar, its lens clear over the posts of the radar platform.', box=(-0.13, 0.13, 20.90, 21.08, 5.46, 5.70), w=60, use=0.5, by=('NLP', 1), node='MAST-ML', survey='B113', basis='town')
C('NLT-05', 'Anchor light', CD, (0.0, 20.80, 7.20), 'White, all round, on the crown of the mast.', box=(-0.07, 0.07, 20.73, 20.87, 7.14, 7.30), w=60, use=0.0, by=('NLP', 5), node='MAST-T', survey='B113', basis='town')
C('NLT-06', 'Stern light', CD, (0.0, 0.3, -2.4), 'White, over 135° astern. It stands at the after end of the passenger deck and is still the Minato Maru\'s drawing.',
  w=60, use=0.5, by=('NLP', 4), node='COR', tail=24.0, survey='B113', basis='town', hid='at the after end of the passenger deck, not yet rebuilt')
C('NLT-07', 'Not-under-command lights, upper pair', CD, (0.0, 20.80, 6.20), 'Red, all round: two heights of them in a vertical line, 2 m apart, say she cannot keep out of the way. Each height is a pair of lanterns, one either side of the mast, lit together: a single lantern beside the mast would be hidden by it over 35° of the horizon, and no more than 6° is allowed.', dict(kind='nuc', h=6.20), w=120, use=0.0, by=('NLP', 6), node='MAST-H', basis='town')
C('NLT-08', 'Not-under-command lights, lower pair', CD, (0.0, 20.80, 4.20), 'Red, all round: the lower pair, 2 m under the upper.', dict(kind='nuc', h=4.20), w=120, use=0.0, by=('NLP', 7), node='MAST-D', basis='town')
C('NLT-09', 'Whistle', CD, (0.0, 21.20, 5.88), 'Two air horns on the front of the mast, sounded by compressed air.', box=(-0.18, 0.18, 20.82, 21.44, 5.76, 6.02), node='MAST-H')
C('NLT-10', 'Whistle panel', WH, (0.72, FRONT, TOP), 'A push button for the whistle and a timer for the fog signal (one long blast every two minutes when under way).',
  dict(kind='flush', w=0.16, l=0.12, tile='whistle_panel', button=0xc2412f), w=10, by=('BD2', 6), node='CON-P', survey='B099')
C('NLT-11', 'Searchlight control', WH, (-0.50, FRONT, TOP), 'A joystick that turns and tilts the searchlight, and its lamp switch.', dict(kind='flush', w=0.16, l=0.12, tile='sl_panel', stick=True), node='CON-S', survey='B100')
C('NLT-12', 'Wiper and window wash panel', WH, (-2.02, FRONT, TOP), 'Each wiper on, off or intermittent, and the wash.', dict(kind='flush', w=0.30, l=0.12, tile='wiper_panel'), node='CON-SS')
C('NLT-13', 'Window wiper, starboard', WH, (-1.164, 23.02, 1.00), 'A pantograph wiper on the outside of the glass; its motor is under the sill.', dict(kind='wiper'), w=60, use=0.2, by=('BD1', 3), node='CON-SS', survey='B086')
C('NLT-14', 'Window wiper, centre', WH, (0.0, 23.02, 1.00), 'A pantograph wiper on the outside of the glass; its motor is under the sill.', dict(kind='wiper'), w=60, use=0.2, by=('BD1', 3), node='CON-0', survey='B086')
C('NLT-15', 'Window wiper, port', WH, (1.164, 23.02, 1.00), 'A pantograph wiper on the outside of the glass; its motor is under the sill.', dict(kind='wiper'), w=60, use=0.2, by=('BD1', 3), node='CON-P', survey='B086')
C('NLT-16', 'Searchlight', CD, (-1.6, 22.0, DECK_H), 'A 1 kW searchlight on the compass deck, turned from the console.', box=(-1.82, -1.38, 21.75, 22.34, DECK_H, DECK_H + 0.95), w=1000, use=0.0,
  by=('LB', 'searchlight'), node='ROOF-F', survey='B112', kks='10CTA10 GS001', basis='town')
C('NLT-20', 'Flag locker', WH, (-0.70, 19.54, 1.00), 'The signal flags of the international code, each rolled in its own pigeonhole.', dict(kind='wallbox', w=0.44, H=0.95, d=0.18, tile='flags', colour=0x765032, open=True))
C('NLT-21', 'Daylight signalling lamp', WH, (-2.90, 20.39, 0.72), 'A hand lamp for Morse by day, on its hook beside the starboard door with its socket.', dict(kind='aldis'), w=60, use=0.0, by=('DC1', 16), node='WALL-S')

# ---- Lighting.
for i, (x, yd) in enumerate(((1.55, 21.20), (-1.55, 21.20), (1.20, 20.20), (-1.20, 20.20))):
    C(f'LGT-0{i + 1}', 'Deckhead light', WH, (x, yd, CEIL), 'A white light in the deckhead, for work in harbour and by day.', dict(kind='ceil', type='light', w=0.60, l=0.30),
      w=36, use=0.1, by=('BD1', 1), node='P-M' if x > 0 else 'S-M', survey='B103', kks='10BRB10 GS011')
C('LGT-05', 'Chart lamp', WH, (-1.90, 19.66, 0.95), 'A dimmed lamp on a stalk, red or white, that lights the chart and nothing else.', dict(kind='chart_lamp'), w=10, use=0.5, by=('BD1', 1), node='CHT', survey='B087')
C('LGT-06', 'Night light, red, port', WH, (0.9, 22.15, CEIL), 'A red light over the console: enough to find a switch by, without spoiling the night vision.', dict(kind='ceil', type='red', r=0.035, xs=(0.9,)),
  w=5, use=0.5, by=('DC1', 15), node='C-F')
C('LGT-13', 'Night light, red, starboard', WH, (-0.9, 22.15, CEIL), 'A red light over the console.', dict(kind='ceil', type='red', r=0.035, xs=(-0.9,)),
  w=5, use=0.5, by=('DC1', 15), node='C-F')
C('LGT-07', 'Emergency light', WH, (0.0, 20.40, CEIL), 'Lights by itself when the main supply fails.', dict(kind='ceil', type='emergency', w=0.30, l=0.12), w=15, use=0.0, by=('BD2', 4), node='MAST-0', kks='10BRV20 GS011')
C('LGT-14', 'Transitional light', WH, (0.6, 21.9, CEIL), 'A 24 V lamp on the general service battery: it lights at once when the supply fails, before the emergency generator has started.', dict(kind='ceil', type='emergency', w=0.20, l=0.10),
  w=10, use=0.0, by=('DC1', 15), node='P-M')
C('LGT-08', 'Wing light, port', WP, (3.05, 22.91, 1.90), 'A bulkhead light on the house side.', dict(kind='wing_light', side=1), w=40, use=0.1, by=('BD1', 2), node='WALL-P')
C('LGT-09', 'Wing light, starboard', WS, (-3.05, 22.91, 1.90), 'A bulkhead light on the house side.', dict(kind='wing_light', side=-1), w=40, use=0.1, by=('BD1', 2), node='WALL-S')
C('LGT-10', 'Dimmer panel', WH, (-2.38, FRONT, TOP), 'Dims the instruments and the console lighting for the night watch.', dict(kind='flush', w=0.24, l=0.12, tile='dimmer_panel', knobs=3), w=60, use=0.5, by=('BD1', 8), node='CON-SS')
C('LGT-11', 'Foredeck floodlight, port', CD, (2.35, 22.66, DECK_H), 'Lights the car deck forward and the ramp.', box=(2.19, 2.51, 22.58, 22.78, DECK_H, DECK_H + 0.63), w=150, use=0.1, by=('BD1', 2), node='ROOF-F')
C('LGT-12', 'Foredeck floodlight, starboard', CD, (-2.35, 22.66, DECK_H), 'Lights the car deck forward and the ramp.', box=(-2.51, -2.19, 22.58, 22.78, DECK_H, DECK_H + 0.63), w=150, use=0.1, by=('BD1', 2), node='ROOF-F')

# ---- Electrical distribution.
C('ELD-01', 'Wheelhouse distribution board BD1', WH, (1.50, 19.54, 0.95), '105 V, from the lighting board in the engine control room: eight ways for the bridge\'s general services.',
  dict(kind='wallbox', w=0.60, H=0.85, d=0.16, tile='bd1', colour=0x9aa3a2, handle=True), node='BRD')
C('ELD-02', 'Emergency distribution board BD2', WH, (2.11, 19.54, 1.05), '105 V, from the emergency switchboard: six ways for what must not go dark.',
  dict(kind='wallbox', w=0.46, H=0.75, d=0.16, tile='bd2', colour=0x9aa3a2, handle=True), node='BRD')
C('ELD-03', '24 V DC panel DC1, navigation and control', WH, (2.63, 19.54, 1.44), '24 V from the general service battery: fifteen fused ways, a voltmeter and an earth-fault lamp.',
  dict(kind='wallbox', w=0.44, H=0.36, d=0.14, tile='dc1', colour=0x9aa3a2, handle=True), node='BRD')
C('ELD-04', '24 V DC panel DC2, radio', WH, (2.63, 19.54, 1.05), '24 V from the radio battery: five fused ways, a voltmeter and the charger-failure alarm.',
  dict(kind='wallbox', w=0.44, H=0.36, d=0.14, tile='dc2', colour=0x9aa3a2, handle=True), node='BRD')
C('ELD-11', 'Console socket, port', WH, (2.20, 22.30, 0.72), 'A 105 V socket on the console\'s after face.', dict(kind='sockets', xs=(2.20,)), w=150, use=0.1, by=('BD1', 4), node='CON-PP')
C('ELD-13', 'Console socket, centre', WH, (-0.40, 22.30, 0.72), 'A 105 V socket on the console\'s after face.', dict(kind='sockets', xs=(-0.40,)), w=150, use=0.1, by=('BD1', 4), node='CON-S')
C('ELD-12', 'Console heaters', WH, (0.0, 22.70, 0.14), 'Small heaters low in the console that keep the damp out of the electronics when she lies cold.', dict(kind='box', size=(0.60, 0.06, 0.06)),
  w=100, use=0.2, by=('BD1', 8), node='CON-0', hid='inside the console, at its foot')
C('ELD-20', 'Cable transit at the mast', WH, (0.0, 20.80, CEIL), 'Where the cables to the mast and the compass deck pass the deck, sealed gastight and watertight.', dict(kind='ceil', type='transit', w=0.24, l=0.16), node='MAST-0')
C('ELD-21', 'Cable duct on the port mullion', WH, (0.58, 22.90, 1.45), 'A covered duct down a forward mullion, from the trays over the deckhead to the console.', dict(kind='mullion_ducts', side=1), node='DUCT-P')
C('ELD-22', 'Cable duct on the starboard mullion', WH, (-0.58, 22.90, 1.45), 'A covered duct down a forward mullion, from the trays over the deckhead to the console.', dict(kind='mullion_ducts', side=-1), node='DUCT-S')

# ---- Air conditioning.
C('HVC-01', 'Air conditioner, room unit', WH, (-2.52, 19.54, 1.95), 'The wheelhouse\'s cooling and dehumidifying unit, high on the aft wall over the stair.', dict(kind='ac_indoor', w=0.74, H=0.28, d=0.20),
  w=60, use=0.6, by=('BD1', 5), node='AFT-SS', survey='B059', kks='10SAC20 AH001', basis='town')
C('HVC-02', 'Air conditioner, condensing unit', CD, (-2.30, 19.95, DECK_H), 'The compressor and condenser, on the compass deck above the room unit.', dict(kind='ac_outdoor', w=0.78, d=0.32, H=0.55),
  w=940, use=0.6, by=('BD1', 5), node='AFT-SS', survey='B059', kks='10SAC20 AH001', basis='town')

# ---- Piping fittings.
C('PIP-01', 'Fire hydrant, port wing', WP, (3.09, 20.39, 0.55), 'A 50 mm hydrant on the fire main, with a hose coupling and a hand valve.', dict(kind='hydrant'), survey='B106', kks='10SGA30 AA518', basis='town')
C('PIP-05', 'Scupper, port wing', WP, (3.92, 19.80, 0.0), 'The wing\'s deck drain, led overboard.', dict(kind='scupper', side=1))
C('PIP-06', 'Scupper, starboard wing', WS, (-3.92, 19.80, 0.0), 'The wing\'s deck drain, led overboard.', dict(kind='scupper', side=-1))
C('PIP-10', 'Whistle valve', WH, (0.30, 20.95, 2.08), 'The valve that lets air to the whistle: opened by a solenoid from the push buttons and the fog timer, or by hand with the pull above the helm.',
  dict(kind='whistle_valve'), w=20, use=0.0, by=('BD2', 6), node='MAST-0')
C('PIP-11', 'Window wash valve', WH, (2.62, 22.80, 0.30), 'A solenoid valve on the fresh-water line to the wash nozzles.', dict(kind='box', size=(0.10, 0.08, 0.10)), w=15, use=0.0, by=('BD1', 3), node='CON-PP',
  hid='inside the console, port end')
C('PIP-12', 'Window wash nozzles', WH, (0.0, 23.03, 0.99), 'A nozzle at each wiper.', dict(kind='nozzles'))

# ---- Life-saving.
C('LSA-01', 'Lifebuoy with light and smoke, port', WP, (4.02, 20.90, 0.62), 'A lifebuoy on a quick-release with a self-igniting light and a smoke float: thrown from the wing for a man overboard.', dict(kind='lifebuoy', side=1))
C('LSA-02', 'Lifebuoy with light and smoke, starboard', WS, (-4.02, 20.90, 0.62), 'A lifebuoy on a quick-release with a self-igniting light and a smoke float.', dict(kind='lifebuoy', side=-1))
C('LSA-05', 'Locker: lifejackets and pyrotechnics', WH, (2.03, 19.54, 0.0), 'Four lifejackets for the watch, twelve parachute flares and the line-throwing appliance, under the boards.',
  dict(kind='locker', w=1.66, d=0.34, H=0.84))
C('LSA-06', 'First-aid kit', WH, (-0.70, 19.54, 0.68), 'A first-aid box under the flag locker.', dict(kind='wallbox', w=0.30, H=0.26, d=0.12, tile='firstaid', colour=0xe9ece8))


# ---------------------------------------------------------------------------------------------------------------------
# Nets: what talks to what, and over what. A member is a component's id, or 'ext:<place>:<what>' for an end in a section
# that is not registered yet (ship.ELSEWHERE names the places). `says` is what a member puts on the net.
# ---------------------------------------------------------------------------------------------------------------------
NETS = [
    dict(id='NMEA', name='Navigation data', medium='IEC 61162-1 (NMEA 0183), 4800 baud, one twisted pair a line',
         text='Every sensor talks to the distributor on its own line; the distributor gives each listener a buffered line of its own. '
              'A talker never has more than one listener to drive, and a short on one line stays on that line.',
         hub='NAV-09', members=[
             ('NAV-09', 'node', 'a buffered copy of every sentence, to each listener'),
             ('NAV-06', 'talks', 'GGA, RMC, VTG, ZDA: position, course and speed over the ground, time'),
             ('NAV-11', 'talks', 'HDT, ROT: true heading, rate of turn'),
             ('NAV-07', 'talks', 'DPT, DBT: depth'),
             ('NAV-08', 'talks', 'VHW, VBW: speed through the water'),
             ('NAV-13', 'talks', 'MWV: wind'),
             ('NAV-01', 'listens', 'heading, position, speed'), ('NAV-02', 'listens', 'heading, position, speed'),
             ('NAV-05', 'listens', 'all of it'), ('NAV-10', 'listens', 'all of it'),
             ('NAV-12', 'listens', 'heading, course'), ('NAV-04', 'listens', 'heading, rate of turn'),
             ('COM-01', 'listens', 'position and time, for the distress call'), ('COM-02', 'listens', 'position and time'),
             ('COM-05', 'listens', 'position, to choose the stations'),
             ('STR-04', 'listens', 'heading'), ('NAV-16', 'listens', 'heading'), ('NAV-17', 'listens', 'heading'),
             ('ALM-02', 'listens', 'whether the autopilot steers'),
         ]),
    dict(id='AIS', name='AIS targets', medium='IEC 61162-2, 38 400 baud', text='The ships the AIS hears, to the radar and the chart system.',
         hub='NAV-04', members=[('NAV-04', 'talks', 'VDM, VDO: other ships and her own report'), ('NAV-02', 'listens', ''), ('NAV-05', 'listens', '')]),
    dict(id='NAV-LAN', name='Navigation network', medium='Ethernet, 100 Mbit/s, screened Cat 5e',
         text='The radar picture and the charts between the processor, the displays and the chart system.',
         hub='NAV-14', members=[('NAV-14', 'node', ''), ('NAV-02', 'node', 'radar picture, tracked targets'), ('NAV-01', 'node', ''), ('NAV-05', 'node', 'charts, route'), ('NAV-10', 'node', '')]),
    dict(id='RADAR', name='Radar scanner cable', medium='composite cable: power, Ethernet and trigger, up the mast',
         text='One cable from the processor to the turning unit on the mast.', members=[('NAV-02', 'node', ''), ('NAV-30', 'node', '')]),
    dict(id='CCTV', name='Camera network', medium='Ethernet with power to the cameras',
         text='The cameras to the recorder and the monitor.', hub='ALM-07',
         members=[('ALM-07', 'node', ''), ('ALM-05', 'node', ''), ('ext:CAR:Cameras at the bow ramp and on the car deck', 'node', ''),
                  ('ext:PAX:Camera at the stern', 'node', ''), ('ext:ER:Camera in the engine room', 'node', '')]),
    dict(id='PROP-CAN-A', name='Propulsion control, line A', medium='CAN bus, screened twisted pair, down the port side', out='MAIN-IN',
         text='The levers\' orders to the engines, gearboxes and thruster, and their answers back, on two lines that go below by different sides of the ship: either carries all of it.',
         hub='PRP-07', members=[
             ('PRP-07', 'node', 'which station commands; the orders'), ('PRP-01', 'node', 'lever position'), ('PRP-02', 'node', 'lever position'),
             ('PRP-03', 'node', 'lever position'), ('PRP-04', 'node', ''), ('PRP-05', 'node', ''), ('PRP-06', 'node', ''),
             ('PRP-10', 'node', 'lever positions'), ('PRP-11', 'node', 'lever positions'), ('NAV-10', 'node', 'revolutions, for the conning display'),
             ('ext:ECR:Engine control units, port and starboard', 'node', 'revolutions, clutch state, alarms'),
             ('ext:THR:Bow thruster starter and controller', 'node', 'running, current'),
         ]),
    dict(id='PROP-CAN-B', name='Propulsion control, line B', medium='CAN bus, screened twisted pair, down the starboard side', out='EM-IN',
         text='The second line, by the other side.', hub='PRP-07',
         members=[('PRP-07', 'node', ''), ('PRP-01', 'node', ''), ('PRP-02', 'node', ''), ('PRP-03', 'node', ''), ('PRP-10', 'node', ''), ('PRP-11', 'node', ''),
                  ('ext:ECR:Engine control units, port and starboard', 'node', ''), ('ext:THR:Bow thruster starter and controller', 'node', '')]),
    dict(id='STEER-1', name='Steering control system No. 1', medium='control cables, screened, down the port side', out='MAIN-IN',
         text='From the wheel\'s first transmitter and the autopilot to the valves of power unit No. 1. It shares no part, supply or cable way with system No. 2.',
         hub='STR-02', members=[
             ('STR-02', 'node', 'valve orders'), ('STR-01', 'talks', 'the wheel\'s position, first transmitter'), ('STR-03', 'talks', 'system and mode chosen; tiller port or starboard'),
             ('NAV-12', 'talks', 'rudder ordered by the autopilot'),
             ('ext:STG:Hydraulic power unit No. 1 (valves, running, alarms)', 'node', '')]),
    dict(id='STEER-2', name='Steering control system No. 2', medium='control cables, screened, down the starboard side', out='EM-IN',
         text='From the wheel\'s second transmitter to the valves of power unit No. 2.',
         hub='STR-07', members=[
             ('STR-07', 'node', 'valve orders'), ('STR-01', 'talks', 'the wheel\'s position, second transmitter'), ('STR-03', 'talks', 'system and mode chosen; tiller port or starboard'),
             ('ext:STG:Hydraulic power unit No. 2 (valves, running, alarms)', 'node', '')]),
    dict(id='RUDDER', name='Rudder angle indication', medium='4 to 20 mA signal, screened pair, with its own supply',
         text='The rudders\' true angle from the transmitter on the steering gear to every indicator. It is independent of both control systems: it shows the truth when either has failed.',
         members=[('STR-05', 'listens', 'rudder angle'), ('STR-06', 'listens', 'rudder angle'), ('PRP-10', 'listens', 'rudder angle'), ('PRP-11', 'listens', 'rudder angle'),
                  ('NAV-10', 'listens', 'rudder angle'), ('ext:STG:Rudder angle transmitter', 'talks', 'rudder angle')]),
    dict(id='PA-GA', name='Public address and general alarm', medium='100 V loudspeaker lines in zones; fire-resistant cable',
         text='One amplifier, the microphone at the console, and loudspeakers in every space aboard. The general alarm goes out on the same lines.',
         hub='INT-01', members=[
             ('INT-01', 'node', ''), ('INT-02', 'talks', 'microphone, zone keys'), ('INT-07', 'talks', 'general alarm'), ('INT-08', 'listens', ''), ('INT-11', 'listens', ''),
             ('FIR-01', 'talks', 'fire alarm unaccepted: sound the general alarm'), ('ALM-02', 'talks', 'watch alarm, third stage'),
             ('ext:DECKS:Loudspeakers on the car deck, in the saloon, the crew rooms, the machinery spaces and on the open decks', 'listens', ''),
         ]),
    dict(id='TALKBACK', name='Talkback', medium='screened pairs to each station', text='Loudspeaking stations for manoeuvring: press and speak.',
         hub='INT-02', members=[('INT-02', 'node', ''), ('INT-09', 'node', ''), ('INT-10', 'node', ''),
                                ('ext:CAR:Stations at the bow ramp and the forward mooring station', 'node', ''), ('ext:PAX:Station at the after mooring station', 'node', ''),
                                ('ext:ECR:Station in the engine control room', 'node', '')]),
    dict(id='SP-TEL', name='Sound-powered telephone', medium='one pair, no supply',
         text='The emergency line between the bridge, the engine control room and the steering-gear room.',
         hub='INT-05', members=[('INT-05', 'node', ''), ('ext:ECR:Sound-powered telephone', 'node', ''), ('ext:STG:Sound-powered telephone, for emergency steering', 'node', '')]),
    dict(id='TEL', name='Telephone', medium='one pair a set, to the exchange', text='The automatic telephone.',
         members=[('INT-04', 'node', ''), ('ext:ECR:Telephone exchange', 'node', ''), ('ext:ACC:Sets in the cabins, the mess and the galley', 'node', '')]),
    dict(id='FIRE-1', name='Fire detection loop 1', medium='a two-wire addressable loop, out and back, fire-resistant cable',
         text='Bridge deck: every detector and call point on one loop that starts and ends at the panel, so a single break loses nothing.',
         hub='FIR-01', members=[('FIR-01', 'node', ''), ('FIR-03', 'talks', 'smoke'), ('FIR-02', 'talks', 'call point'),
                                ('ext:ACC:Detectors and call points in the corridor, the cabins, the mess, the galley and the two machinery rooms of the bridge deck', 'talks', ''),
                                ('ext:DECKS:Loops 2 to 4 (passenger deck, car deck, machinery spaces), the alarm bells, the fan stops', 'node', '')]),
    dict(id='AMS', name='Machinery alarms', medium='RS-485, two lines', text='The alarm system in the engine control room to its panel on the bridge.',
         members=[('ALM-01', 'node', ''), ('ext:ECR:Alarm and monitoring system', 'talks', 'alarm groups, engineer\'s acceptance')]),
    dict(id='WATCH', name='Bridge watch alarm', medium='24 V control cables',
         text='The reset buttons to the watch alarm, and its calls out.', hub='ALM-02',
         members=[('ALM-02', 'node', ''), ('ALM-04', 'talks', 'reset'), ('PRP-10', 'talks', 'reset button at the wing'), ('PRP-11', 'talks', 'reset button at the wing'),
                  ('ext:ACC:Buzzers in the master\'s and the chief officer\'s cabins', 'listens', '')]),
    dict(id='DOORS', name='Door, hatch and ramp indication', medium='24 V, one pair to each limit switch',
         text='Two switches on each closing (shut, and secured) to the lamps on the bridge.', hub='ALM-06',
         members=[('ALM-06', 'node', ''), ('ext:HULL:The five watertight doors below the car deck', 'talks', 'shut and dogged'),
                  ('ext:CAR:The bow ramp and the three hatches in the car deck', 'talks', 'shut and secured')]),
    dict(id='WHISTLE', name='Whistle control', medium='105 V control cable', text='The push buttons and the fog timer to the whistle valve.', hub='NLT-10',
         members=[('NLT-10', 'node', ''), ('PIP-10', 'listens', ''), ('PRP-10', 'talks', 'whistle button at the wing'), ('PRP-11', 'talks', 'whistle button at the wing')]),
    dict(id='WIPERS', name='Wiper control', medium='105 V, switched', text='The panel to the three wiper motors and the wash valve.', hub='NLT-12',
         members=[('NLT-12', 'node', ''), ('NLT-13', 'listens', ''), ('NLT-14', 'listens', ''), ('NLT-15', 'listens', ''), ('PIP-11', 'listens', '')]),
    dict(id='SEARCHLIGHT', name='Searchlight control', medium='control cable', text='The joystick to the searchlight\'s two motors and its lamp contactor.',
         members=[('NLT-11', 'node', ''), ('NLT-16', 'node', '')]),
    dict(id='DIMMING', name='Instrument dimming', medium='0 to 10 V control line', text='One knob dims every instrument on the console together.', hub='LGT-10',
         members=[('LGT-10', 'node', ''), ('NAV-01', 'listens', ''), ('NAV-05', 'listens', ''), ('NAV-10', 'listens', ''), ('PRP-06', 'listens', ''), ('STR-06', 'listens', ''),
                  ('STR-05', 'listens', ''), ('NAV-13', 'listens', '')]),
    dict(id='RF-VHF1', name='VHF No. 1 antenna feeder', medium='50 ohm coaxial cable', text='', members=[('COM-01', 'node', ''), ('COM-11', 'node', '')]),
    dict(id='RF-VHF2', name='VHF No. 2 antenna feeder', medium='50 ohm coaxial cable', text='', members=[('COM-02', 'node', ''), ('COM-12', 'node', '')]),
    dict(id='RF-AIS', name='AIS antenna feeders', medium='50 ohm coaxial cable, two', text='', hub='NAV-04', members=[('NAV-04', 'node', ''), ('NAV-31', 'node', ''), ('NAV-35', 'node', '')]),
    dict(id='RF-GPS', name='GPS antenna feeder', medium='50 ohm coaxial cable', text='', members=[('NAV-06', 'node', ''), ('NAV-32', 'node', '')]),
    dict(id='RF-SATC', name='Satellite compass antenna cable', medium='multi-core antenna cable', text='', members=[('NAV-11', 'node', ''), ('NAV-33', 'node', '')]),
    dict(id='RF-NAVTEX', name='NAVTEX antenna feeder', medium='50 ohm coaxial cable', text='', members=[('COM-05', 'node', ''), ('COM-13', 'node', '')]),
    dict(id='WIND', name='Wind sensor cable', medium='screened four-core', text='', members=[('NAV-13', 'node', ''), ('NAV-36', 'node', '')]),
    dict(id='SOUNDER', name='Echo sounder transducer cable', medium='screened transducer cable', text='To the transducer in her bottom.',
         members=[('NAV-07', 'node', ''), ('ext:HULL:Echo sounder transducer, in the bottom forward of the engine room', 'node', '')]),
    dict(id='LOG', name='Speed log sensor cable', medium='screened sensor cable', text='To the sensor in her bottom.',
         members=[('NAV-08', 'node', ''), ('ext:HULL:Speed log sensor, in the bottom forward of the engine room', 'node', '')]),
]

# ---------------------------------------------------------------------------------------------------------------------
# Pipes. `path` is the run on the bridge as points (x, yard, h); `ends` what it joins (a component, or 'ext:…').
# ---------------------------------------------------------------------------------------------------------------------
PIPES = [
    dict(id='AIR-WH', system='Compressed air', name='Whistle air', dn=15, medium='working air, 0.7 MPa', material='copper',
         text='From the working-air receiver in the engine room, up the pipe trunk, to the whistle valve over the helm and on up the mast to the two horns.',
         ends=['ext:ER:Working-air receiver', 'PIP-10', 'NLT-09'],
         path=[(2.80, 19.62, 0.0), (2.80, 19.62, 2.16), (0.30, 19.62, 2.16), (0.30, 20.95, 2.16), (0.30, 20.95, 2.03), (0.30, 20.95, 2.16), (0.08, 20.95, 2.16),
               (0.08, 20.95, 5.55), (0.0, 21.0, 5.55)]),
    dict(id='FW-WASH', system='Fresh water', name='Window wash', dn=15, medium='fresh water from the pressure set', material='copper',
         text='A branch of the cold fresh-water main to the valve in the console, and from there along the outside of the sill to a nozzle at each wiper.',
         ends=['ext:ACC:Cold fresh-water main, bridge deck', 'PIP-11', 'PIP-12'],
         path=[(2.84, 19.62, 0.0), (2.84, 19.62, 0.10), (2.84, 22.80, 0.10), (2.62, 22.80, 0.10), (2.62, 22.80, 0.30), (2.62, 22.80, 0.90), (2.62, 23.04, 0.90),
               (2.62, 23.04, 0.93), (-1.41, 23.04, 0.93)]),
    dict(id='FIRE-MAIN', system='Fire main', name='Fire main branch to the bridge deck', dn=50, medium='sea water, 0.7 MPa', material='galvanised steel',
         text='A branch of the fire main up the house side to the hydrant on the port wing.',
         ends=['ext:CAR:Fire main', 'PIP-01'],
         path=[(3.09, 20.39, -0.25), (3.09, 20.39, 0.55)]),
    dict(id='SCUP-P', system='Scuppers', name='Scupper, port wing', dn=50, medium='rain and spray', material='galvanised steel',
         text='From the wing\'s deck down the house side and overboard above the waterline.', ends=['PIP-05', 'ext:PAX:Overboard, port side'],
         path=[(BP.wing_x(3.92), 19.80, 0.0), (BP.wing_x(3.92), 19.80, -0.25)]),
    dict(id='SCUP-S', system='Scuppers', name='Scupper, starboard wing', dn=50, medium='rain and spray', material='galvanised steel',
         text='From the wing\'s deck down the house side and overboard above the waterline.', ends=['PIP-06', 'ext:PAX:Overboard, starboard side'],
         path=[(BP.wing_x(-3.92), 19.80, 0.0), (BP.wing_x(-3.92), 19.80, -0.25)]),
    dict(id='AC-REF', system='Air conditioning', name='Refrigerant lines', dn=12, medium='refrigerant, a liquid line and a suction line, insulated', material='copper',
         text='Between the room unit and the condensing unit above it.', ends=['HVC-01', 'HVC-02'],
         path=[(-2.80, 19.60, 1.86), (-2.80, 19.60, 2.16), (-2.30, 19.60, 2.16), (-2.30, 19.80, 2.16), (-2.30, 19.80, 2.50)]),
    dict(id='AC-DRAIN', system='Air conditioning', name='Condensate drain', dn=20, medium='condensate', material='plastic hose',
         text='From the room unit through the house side to the starboard wing\'s deck, and so to its scupper.', ends=['HVC-01', 'PIP-06'],
         path=[(-2.85, 19.60, 1.74), (-2.97, 19.60, 1.70), (-3.03, 19.60, 1.70), (-3.03, 19.60, 0.05)]),
]


# The first Chisum's bridge deck abaft the wheelhouse (her corridor's lights, detectors, boards and doors, the after
# platform's fire station: 36 components) went with that ship on 11 November 2026. The 68 m ship's accommodation is bare
# steel; its fittings are registered when it is built.


# ---- The emergency generator room (blender/eg_room.py), built to the owner's drawing and landed on the house top: what is in
# it. Each is drawn there under its tag; its place here is for the cable's length. The room's measures (p aft from its
# forward wall, q to starboard from its port wall, h over its deck) are turned into the register's by _eg, from where
# blender/eg_place.py stands the room: on the 68 m ship's top deck.
EG = 'eg-house'


def _eg(p, q, h):
    P = eg_place.PLACE
    return (round(P['x'] - q, 3), round(P['yard'] - BP.SHIFT - p, 3), round(P['deck'] - BP.DECK + h, 3))


C('EMG-01', 'Emergency generator set No. 1', EG, _eg(3.15, 2.05, 0.9),
  'A six-cylinder turbocharged diesel and its alternator on one skid, on six rubber mounts: 440 V, three-phase, 60 Hz, 500 kW on the owner\'s drawing. '
  'Its radiator stands at its forward end in a cowl, so it needs no sea water. It starts by itself when the main board is dead.',
  note='500 kW is the drawing\'s figure and is more than the 68 m ship\'s arrangement gives each of her main generators (about 320 kW); her own emergency loads '
       'come to something near 200 kW. The rating is one of the questions put to the owner with the general arrangement.')
C('EMG-02', 'Starting battery bank, 24 V', EG, _eg(0.55, 0.55, 0.35), 'Eight 12 V blocks in a steel rack, in two strings: they turn the starter, and nothing else is fed from them. '
  'The ship\'s transitional and radio batteries are not in this room.')
C('EMG-03', 'Starting battery charger', EG, _eg(0.55, 0.17, 1.55), 'Keeps the starting bank charged from the emergency switchboard; a voltmeter, an ammeter and a failure lamp.',
  w=600, use=0.2, by=('ESB', 'emergency generator auxiliaries'), node='COR')
C('EMG-04', 'Emergency generator control panel', EG, _eg(4.85, 4.19, 0.9), 'Starts and stops the set, by itself or by hand; shows its voltage, frequency, load, oil pressure and temperature; '
  'the emergency stop is on its front. Fed from the starting battery.')
C('EMG-05', 'Emergency switchboard, 440 V', EG, _eg(5.90, 4.10, 1.0), 'Two sections: the generator breaker and the bus tie from the main board with their meters; and the ways to what must '
  'work when all else has stopped (steering, the emergency fire pump, emergency lighting, navigation lights, radio, alarms, the bilge pump).')
C('EMG-06', 'Day tank, about 200 L', EG, _eg(1.18, 4.05, 1.97), 'The set\'s own fuel, high enough to run to the engine by gravity: on a stand over a tray, with a level gauge, filled from the service tank.',
  note='200 L is the drawing\'s figure. At full load 500 kW burns about 125 L an hour: the hours the rule asks of an emergency source are to be worked out with the rating.')
C('EMG-07', 'Fuel quick-closing valve and its pull', EG, _eg(1.00, 4.21, 1.60), 'Under the tank: shut by a wire from the red box outside the door, so that nobody goes into a fire to stop the fuel.')
C('EMG-08', 'Exhaust: bellows, lagged riser, silencer', EG, _eg(3.50, 3.90, 2.7), 'From the turbocharger through a bellows and a lagged riser up through the deckhead to a silencer on the roof.',
  note='The owner\'s drawing leads it to the funnel. Here it has a stack of its own, so the emergency set does not depend on the main machinery\'s casing.')
C('EMG-09', 'Supply air duct and fire damper FD-01', EG, _eg(1.30, 4.13, 2.7), 'Air for the engine and the room, in through a louvre on the forward wall; the damper shuts it. Its lever is worked by hand: tap it.')
C('EMG-10', 'Exhaust air duct and fire damper FD-02', EG, _eg(5.40, 4.13, 2.7), 'The room\'s warm air, out through a louvre on the starboard wall; the damper shuts it. Its lever is worked by hand: tap it.')
C('EMG-11', 'Fuel lines', EG, _eg(1.60, 1.27, 0.35), 'Supply from the day tank to the engine\'s filters and the return beside it, each tagged; the filling line from the service tank with its strainer and valve; the tank\'s vent, out through the wall.')
for _k, (_p, _q, _by) in enumerate(((2.00, 0.85, ('LB', 'bridge deck lighting')), (4.30, 0.85, ('LB', 'bridge deck lighting')), (5.90, 3.10, ('ESB', 'emergency lighting')),
                                   (7.22, 2.20, ('ESB', 'emergency lighting')))):
    C(f'LGT-{25 + _k}', f'Emergency generator room light No. {_k + 1}', EG, _eg(_p, _q, 3.0), 'A fitting under the deckhead beams. Two of the four are on the emergency lighting: the one before the switchboard and the one over the way to the door.',
      w=36, by=_by, node='COR')
C('FIR-18', 'Fire extinguisher, CO2 5 kg, emergency generator room', EG, _eg(7.70, 3.55, 0.55), 'Carbon dioxide, for a fire in the switchboard or the set: by the door, under its sign.')
C('FIR-19', 'Manual call point, emergency generator room', EG, _eg(7.78, 4.10, 1.40), 'Break the glass to give the alarm: by the door one leaves by.', node='COR')
C('FIR-20', 'Heat detector, emergency generator room', EG, _eg(4.22, 1.25, 3.18), 'A heat detector on loop 1 (a running diesel would set a smoke detector off).', node='COR')
C('INT-14', 'Telephone, emergency generator room', EG, _eg(7.76, 2.90, 1.45), 'To the wheelhouse and the engine control room.', node='COR')
C('OUT-37', 'Weathertight door, emergency generator room (house top)', EG, _eg(7.20, 4.55, 1.1), 'A steel door with a porthole, two dogs and a lever handle, opening outward onto the deck: the escape route ends at it.')
