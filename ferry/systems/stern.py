"""
The stern ramp and what works it: the second section of the Chisum's register.

The owner, 12 November 2026: "make the ramp more realistic its a simple system that could be animated much better, and
hydraulics and a local control panel that is wired up, with component list and proper wiring , as a place holder now, draw
all feed to the engine room, but all ends need to be marked so we know where to instal the Generators and electrical
cabinets".

Every component with what it is, where it stands, what it draws and from which circuit; the starter panel and its ways;
the nets (control, position switches, alarms, and as placeholders the generators' and transformers' feeders); the pipes; and
the cable ways all of it is laid along, from the stern to the places marked in the machinery spaces where the main
switchboard, its transformers and the three generating sets are to stand.

One source, as bridge.py is for the bridge: `ferry/blender/stern_gear.py` draws each component, `register.py` works out the
currents, lengths and drops and writes `ferry/data/systems.json`, and the yard's drawing JS3-304 prints the lists. The
measures themselves are in `ferry/blender/stern_place.py`.

Places are given as (x to port, metres from the transom, metres above the keel): the main deck is 6.6 m above the keel,
the engine room's platform 4.0 m, the tank top 1.6 m.

**What is a placeholder here.** The main switchboard, its 440 V section, the two transformers and the three generating
sets are not built: their places are marked in the model (a floor outline, a sign and the tagged ends of the cables that
are to be landed there), and their feeders are drawn through her as the register's runs. Their sizes are the machinery
design basis's; nothing of them is class-approved or construction information.

Powers and ratings are the machinery design basis's estimates (basis 'basis') or the yard's own (basis 'yard').
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'blender'))
import lines as L
import stern_place as SP

K = 6.6                                 # the main deck, above the keel
SECTION = dict(id='stern', name='Stern ramp and its supply',
               rooms={'stern': 'Stern door, main deck', 'mooring-p': 'After mooring station, port', 'mooring-s': 'After mooring station, starboard',
                      'hydraulic-room': 'Hydraulic pump room', 'switchboard-room': 'Main switchboard room', 'aux-engine-room': 'Auxiliary engine room'})


def xyz(p):
    """(x, metres from the transom, metres above the keel) → the ship's axes."""
    return [round(p[0], 3), round(L.Y(p[2]), 3), round(L.Z(p[1]), 3)]


def at(x, inn, h):
    """A place given as stern_place.py gives it (h over the main deck) → this section's measure."""
    return (round(x, 4), round(inn, 4), round(K + h, 4))


# ---------------------------------------------------------------------------------------------------------------------
# Cable ways: named points and the ways between them
# ---------------------------------------------------------------------------------------------------------------------
_pb, _jb = SP.PANEL['box'], SP.JB['box']
_x1 = SP.WALL + SP.T + SP.BANK_OFF
_x2 = _x1 + SP.LAYER
_xr = SP.CASING + SP.T + SP.BANK_OFF
_yf = 7.2 - SP.T - SP.BANK_OFF
_he = SP.line('E')[4]
_mid = (SP.STAND['inn'][0] + SP.STAND['inn'][1]) / 2
_pump = SP.HPU['pumps']
_END = {tag: SP.end_point(tag) for tag in SP.END}
OVER = 6.45                             # the trays under the main deck in the machinery spaces, above the keel
NODES = {
    # ---- the starter panel and the tray over the power pack
    'RSP': at((_pb[0] + _pb[1]) / 2, _pb[2] + 0.15, _pb[5]),
    'TRAY-F': at(_pump[0][0], _pb[2] + 0.15, 2.10),
    'TRAY-M2': at(_pump[1][0], _pump[1][1], 2.10),
    'TRAY-M1': at(_pump[0][0], _pump[0][1], 2.10),
    'TRAY-M3': at(SP.HPU['cleat_pump'][0], SP.HPU['cleat_pump'][1], 2.10),
    'TRAY-A': at(_pump[0][0], 10.62, 2.10),
    # ---- the feeder's way: up the forward wall, forward through the casing's rooms under the upper deck's beams, down through
    # the main deck in the uptake's room, and along under the main deck into the switchboard room
    'HR-TOP': at((_pb[0] + _pb[1]) / 2, 12.55, 3.20),
    'DS-FWD': at((_pb[0] + _pb[1]) / 2, 16.10, 3.20),
    'UT-DN': at((_pb[0] + _pb[1]) / 2, 17.80, 3.20),
    'ER-PEN': ((_pb[0] + _pb[1]) / 2, 17.80, OVER),
    'SB-WALL': (7.40, 17.80, OVER),
    'SB-T1': (_END['T1'][0], 17.80, OVER),
    'SB-T2': (_END['T2'][0], _END['T2'][1], OVER),
    'PSB': _END['PSB'], 'MSB': _END['MSB'], 'T1': _END['T1'], 'T2': _END['T2'],
    'PSB-UP': (_END['PSB'][0], _END['PSB'][1], OVER), 'MSB-UP': (_END['MSB'][0], _END['MSB'][1], OVER),
    # ---- the generators' feeders: forward under the main deck through the engine room, through the bulkhead at frame 64,
    # across the auxiliary engine room over the alternators, and down to each
    'ER-AFT': (_END['MSB'][0], 25.40, OVER),
    'ER-FWD': (_END['MSB'][0], 38.20, OVER),
    'AER-IN': (_END['MSB'][0], 38.60, OVER),
    'AER-X': (_END['MSB'][0], _END['DG1'][1], OVER),
    'AER-1': (_END['DG1'][0], _END['DG1'][1], OVER), 'AER-2': (_END['DG2'][0], _END['DG2'][1], OVER), 'AER-3': (_END['DG3'][0], _END['DG3'][1], OVER),
    'DG1': _END['DG1'], 'DG2': _END['DG2'], 'DG3': _END['DG3'],
    # ---- the control stand's conduit, with the pipes along the walls, and the junction box of the switches
    'E-PANEL': at(_xr, 12.40, _he),
    'E-VS': at(_xr, SP.MANIFOLD_AT['E'], _he),
    'VS': at(_xr, SP.MANIFOLD_AT['E'], SP.HPU['manifold'][5] + 0.25),
    'E-COR': at(_xr, _yf, _he),
    'E-STN': at(_x1, _yf, _he),
    'E-JB': at(_x2, _mid, _he),
    'JB': at(_x2, _mid, (_jb[4] + _jb[5]) / 2),
    'STAND': at(SP.STAND['x'][1], _mid, 0.60),
    # ---- the switches' cables: with the pipes up the wall and across over the door's head to the starboard station
    'X-P': at(_x2, 0.30, SP.CROSS['B'] + 0.07),
    'X-S': at(-_x2, 0.30, SP.CROSS['B'] + 0.07),
    'X-HP': at(SP.HOOK['x'], 0.30, SP.CROSS['B'] + 0.07),
    'X-HS': at(-SP.HOOK['x'], 0.30, SP.CROSS['B'] + 0.07),
}
EDGES = [
    ('RSP', 'TRAY-F'), ('TRAY-F', 'TRAY-M2'), ('TRAY-M2', 'TRAY-M1'), ('TRAY-M1', 'TRAY-M3'), ('TRAY-M3', 'TRAY-A'),
    ('RSP', 'HR-TOP'), ('HR-TOP', 'DS-FWD'), ('DS-FWD', 'UT-DN'), ('UT-DN', 'ER-PEN'), ('ER-PEN', 'SB-WALL'), ('SB-WALL', 'SB-T1'),
    ('SB-T1', 'PSB-UP'), ('PSB-UP', 'PSB'), ('SB-T1', 'T1'), ('SB-T1', 'SB-T2'), ('SB-T2', 'T2'), ('SB-T2', 'MSB-UP'), ('MSB-UP', 'MSB'),
    ('MSB-UP', 'ER-AFT'), ('ER-AFT', 'ER-FWD'), ('ER-FWD', 'AER-IN'), ('AER-IN', 'AER-X'), ('AER-X', 'AER-1'), ('AER-1', 'AER-2'), ('AER-2', 'AER-3'),
    ('AER-1', 'DG1'), ('AER-2', 'DG2'), ('AER-3', 'DG3'),
    ('RSP', 'E-PANEL'), ('E-PANEL', 'E-VS'), ('E-VS', 'VS'), ('E-VS', 'E-COR'), ('E-COR', 'E-STN'), ('E-STN', 'E-JB'), ('E-JB', 'JB'), ('JB', 'STAND'),
    ('JB', 'X-P'), ('X-P', 'X-HP'), ('X-HP', 'X-HS'), ('X-HS', 'X-S'),
]
# Where each board elsewhere sends its cable into this section: the 440 V section's own place, so the feeder is drawn whole.
ENTRY = {'PSB': 'PSB'}

# ---------------------------------------------------------------------------------------------------------------------
# The starter panel and its ways
# ---------------------------------------------------------------------------------------------------------------------
BOARDS = [
    dict(id='RSP', name='Stern ramp starter panel', comp='ELD-51', volts=440, kind='AC3', fed_by='PSB',
         feeder=dict(breaker=160, mm2=70),
         text='In the hydraulic pump room: an isolator, a star-delta starter for each main pump, direct starters for the cleats\' pump and the '
              'cooler\'s fan, and the control transformer. Fed from the main switchboard\'s 440 V section, whose place is marked in the main '
              'switchboard room: its feeder is drawn the whole way there. Dead in a blackout: the ramp then stays where its load-holding valves '
              'hold it, and is worked by the hand pump.'),
]
OUTSIDE_CIRCUITS = {}
# (board, number, name, breaker A, copper mm², power factor)
CIRCUITS = [
    ('RSP', 1, 'Main pump No. 1, 37 kW, star-delta', 80, 25, 0.86),
    ('RSP', 2, 'Main pump No. 2, 37 kW, star-delta', 80, 25, 0.86),
    ('RSP', 3, 'Cleat pump, 4 kW', 10, 1.5, 0.84),
    ('RSP', 4, 'Oil cooler fan, 1.1 kW', 4, 1.5, 0.80),
    ('RSP', 5, 'Control transformer 440/24 V, 630 VA: stand, valves, switches', 2, 1.5, None),
]
FIRE_RESISTANT = set()

# ---------------------------------------------------------------------------------------------------------------------
# Components
# ---------------------------------------------------------------------------------------------------------------------
COMPONENTS = []


def C(id, name, room, where, what, w=0, use=0.0, by=None, node=None, basis='basis', drawn=True, note=None, tail=None):
    """A component: `where` is where it stands; `w` what it draws in watts and `use` the share of that it takes on average at
    sea (the ramp is worked in port: nothing); `by` the way that feeds it; `node` the cable way it is reached from."""
    COMPONENTS.append(dict(id=id, name=name, room=room, at=where, what=what, g=dict(kind='stern' if drawn else 'none'), w=w, use=use, by=by, alt=None,
                           node=node, survey=None, kks=None, basis=basis, hid=None, box=None, pick=True, note=note, tail=tail))


R, H, BO, HK = SP.RAM, SP.HPU, SP.BOLT, SP.HOOK
_closed, _level, _lowest = SP.ram_length(0), SP.ram_length(SP.LEVEL), SP.ram_length(SP.LOWEST)
_worst = max(range(int(SP.LEAF_FROM), int(SP.LOWEST) + 1), key=SP.ram_force)
# ---- the ramp itself
C('RMP-01', 'Stern ramp and door', 'stern', at(0.0, -0.24, 5.5),
  f'One leaf, {SP.LEAF["length"]:g} m long and {2 * SP.LEAF["half"]:g} m wide, a box girder {SP.DEPTH:.2f} m deep, about {SP.LEAF["mass"]:g} t. Raised, it is the stern '
  f'door: it lies against a rubber seal round the opening; ten cleats hold it, and a safety latch on each door post that needs no oil. It turns on six hinges at the sill and lowers aft onto the quay: '
  f'level at {SP.LEVEL:g} degrees, and {SP.LOWEST - SP.LEVEL:g} degrees further for a quay that lies lower. Clear driveway {2 * SP.LEAF["drive"]:g} m, between the two cylinders.')
C('RMP-02', 'Ramp hinges', 'stern', at(0.0, SP.HINGE['inn'], SP.HINGE['h']),
  f'Six along the sill: at each a lug of the ship stands out of the transom into a slot in the leaf\'s foot, and one pin of {2000 * SP.HINGE["pin"]:.0f} mm goes through all of them. '
  f'The hinge line lies {-1000 * SP.HINGE["inn"]:.0f} mm abaft the transom and {-1000 * SP.HINGE["h"]:.0f} mm under the main deck, so that the roadway comes down level with the deck.')
for sgn, tag, side in ((1, 'RMP-03', 'port'), (-1, 'RMP-04', 'starboard')):
    C(tag, f'Ramp cylinder, {side}', 'stern', at(sgn * R['x'], 1.9, 3.8),
      f'Double-acting, bore {1000 * R["bore"]:.0f} mm, rod {1000 * R["rod"]:.0f} mm, stroke {R["stroke"]:.2f} m. Hung from a bracket under the upper deck\'s web beam at 3.6 m and pinned '
      f'to a lug on the leaf {R["pin"][1]:.1f} m from the hinge: {_closed:.2f} m between its pins with the ramp raised, {_level:.2f} m with it level. It pulls: at most '
      f'{SP.ram_force(_worst):.0f} kN, {SP.ram_force(_worst) / SP.ANNULUS / 100:.0f} bar on its rod side. A load-holding valve is bolted to it: if a hose bursts the ramp stays where it is.')
C('RMP-05', 'End flaps', 'stern', at(0.0, -0.10, 10.4),
  f'{SP.FLAP["n"]} flaps of {SP.FLAP["width"]:g} by {SP.FLAP["length"]:g} m across the ramp\'s end, each on its own hinge: they lie on the quay and take up her list. Stowed, they lie folded '
  'back over the roadway; they fold out as the ramp comes down.')
C('RMP-06', 'Door seal', 'stern', at(0.0, -0.01, 5.25),
  'A rubber strip on the transom round the opening\'s sides and head: the raised ramp is drawn against it by the cleats. The roadway is left flat where it meets it.')
_n = 11
for sgn, side, room in ((1, 'port', 'mooring-p'), (-1, 'starboard', 'mooring-s')):
    for k, h in enumerate(BO['h']):
        C(f'RMP-{_n}', f'Bolt cleat, {side}, No. {k + 1}', room, at(sgn * (BO['house'][0] + 0.2), BO['inn'], h),
          f'A bolt of {1000 * BO["d"]:.0f} mm shot inboard through the door post into a keeper on the ramp, {h:.1f} m over the deck, by a small cylinder; drawn back {1000 * BO["travel"]:.0f} mm to let go. '
          'A switch on it says when the bolt is home.', node='JB' if sgn > 0 else 'X-S', drawn=True)
        _n += 1
for sgn, side in ((1, 'port'), (-1, 'starboard')):
    C(f'RMP-{_n}', f'Hook cleat, {side}', 'stern', at(sgn * HK['x'], HK['pivot'][0] - 0.2, HK['pivot'][1] + 0.1),
      f'At the door\'s head: an arm on a pivot under a hanger, with a tooth that stands up abaft a pin on the ramp. To let go, its cylinder drops the arm {HK["swing"]:g} degrees. '
      'A switch on it says when it is home.', node='X-HP' if sgn > 0 else 'X-HS')
    _n += 1
C('RMP-30', 'Ramp control stand', 'stern', at((SP.STAND['x'][0] + SP.STAND['x'][1]) / 2, _mid, 0.9),
  'A steel desk on the main deck beside the door, port side, against the mooring station\'s wall: whoever works it stands inboard of it with the ramp\'s foot at the left hand. '
  'On the desk: the emergency stop, a start and a stop button for each main pump, and two spring-centred levers, CLEATS (lock, open) and RAMP (raise, lower). On the upstand: '
  'two pressure indicators, 0 to 250 bar (SYSTEM: the pumps\' pressure; RAMP LINE A: what carries the leaf, 189 bar with it level), eight lamp windows (power on, pump 1 '
  'running, pump 2 running, ramp closed, cleats locked, cleats open, oil level, oil temperature), the key switch that gives the control to the stand or to the bridge, lamp '
  'test, horn, and the instructions engraved. Interlocked: no lever does anything until a pump runs; the ramp is not lowered until the cleats are open; the cleats are not '
  'locked until the ramp is home; the emergency stop trips both pumps and holds the ramp. A beacon on its top is lit while the ramp is neither locked nor landed. '
  'Its door opens on the terminals of X1.',
  w=90, by=('RSP', 5), node='STAND', basis='yard')
C('RMP-31', 'Junction box of the ramp\'s switches', 'mooring-p', at((_jb[0] + _jb[1]) / 2, (_jb[2] + _jb[3]) / 2, (_jb[4] + _jb[5]) / 2),
  'On the port mooring station\'s wall behind the control stand: the ten cleats\' switches, the two latches\' and the two door switches are joined here to the stand, to the bridge\'s door and ramp panel '
  'and to the alarm system.', w=20, by=('RSP', 5), node='JB', basis='yard')
for sgn, tag, side in ((1, 'RMP-32', 'port'), (-1, 'RMP-33', 'starboard')):
    C(tag, f'Door switch, {side}', 'stern', at(sgn * (SP.WALL - 0.06), 0.06, 2.85),
      'On the door post: closed by the raised ramp when it is home against its seal. With the ten cleats\' and the two latches\' switches it makes "ramp closed and locked".', node='JB' if sgn > 0 else 'X-S')
for sgn, tag, side in ((1, 'RMP-34', 'port'), (-1, 'RMP-35', 'starboard')):
    C(tag, f'Safety latch, {side}', 'stern', at(sgn * (SP.LATCH['x'][0] + 0.02), 0.35, SP.LATCH['h'] + 0.05),
      f'On the door post at breast height. It needs no oil to hold: an arm on a pivot whose tooth falls by its own weight behind a striker pin on the ramp as the ramp comes home, '
      f'and stays there. It is lifted {SP.LATCH["swing"]:g} degrees to let the ramp go, by a small cylinder on the cleats\' let-go line or, with no oil, by pressing down its handle; '
      'a pin through arm and bracket secures it for the sea passage. It lets go first and falls in last. A switch on it says when it is home.', node='JB' if sgn > 0 else 'X-S')
# ---- the hydraulics
_t = H['tank']
C('HYD-01', 'Stern ramp power pack (HPU-R)', 'hydraulic-room', at((_t[0] + _t[1]) / 2, (_t[2] + _t[3]) / 2, 0.6),
  'A tank of about 1,500 litres on a drip tray, with the two main pumps and the cleats\' pump on its lid, a level glass, a breather and filler, level and temperature switches. '
  'It works the stern ramp and its cleats; the ramp cover over the fixed ramp is to be worked from it too.')
C('HYD-02', 'Main pump No. 1', 'hydraulic-room', at(_pump[0][0], _pump[0][1], 1.5),
  'A pump of 100 l/min at 210 bar under a 37 kW motor on the tank\'s lid. One pump works the ramp at half speed.', w=40200, by=('RSP', 1), node='TRAY-M1')
C('HYD-03', 'Main pump No. 2', 'hydraulic-room', at(_pump[1][0], _pump[1][1], 1.5),
  'As No. 1. With both running the ramp is raised from its lowest in about a minute and a half.', w=40200, by=('RSP', 2), node='TRAY-M2')
C('HYD-04', 'Cleat pump', 'hydraulic-room', at(H['cleat_pump'][0], H['cleat_pump'][1], 1.3),
  'A small pump under a 4 kW motor: it works the ten cleats, so that they can be locked and let go with the main pumps stopped.', w=4700, by=('RSP', 3), node='TRAY-M3')
_c = H['cooler']
C('HYD-05', 'Oil cooler', 'hydraulic-room', at((_c[0] + _c[1]) / 2, (_c[2] + _c[3]) / 2, 0.62),
  'An air-blast cooler in the return line, on the tank\'s after end, with a 1.1 kW fan.', w=1400, by=('RSP', 4), node='TRAY-A')
_b = H['block']
C('HYD-06', 'Pressure block', 'hydraulic-room', at((_b[0] + _b[1]) / 2, (_b[2] + _b[3]) / 2, 1.15),
  'On the tank\'s lid: a non-return valve after each pump, the pressure filter, the relief valve set to 210 bar and the pressure gauge.')
C('HYD-07', 'Return filter', 'hydraulic-room', at(H['return_filter'][0], H['return_filter'][1], 1.15), 'In the return to the tank, with a clogging indicator.')
C('HYD-08', 'Hand pump', 'hydraulic-room', at(H['hand_pump'][0] - 0.06, H['hand_pump'][1], 0.75),
  'On the tank\'s inboard side: with no power the cleats and, slowly, the ramp are worked by it through the same valves.')
_m = H['manifold']
C('HYD-10', 'Valve stand', 'hydraulic-room', at((_m[0] + _m[1]) / 2, (_m[2] + _m[3]) / 2, 1.2),
  'On the inboard wall: three lever valves with solenoids (the ramp, the cleats, and one for the ramp cover), each worked from the control stand or here by hand; a gauge '
  'for each of the ramp\'s two lines, and two pressure transmitters (PT1 the system, PT2 line A) for the control stand\'s indicators. The cleats must be free before the ramp\'s valve can lower it.', w=120, by=('RSP', 5), node='VS', basis='yard')
C('ELD-51', 'Stern ramp starter panel (RSP)', 'hydraulic-room', at((_pb[0] + _pb[1]) / 2, (_pb[2] + _pb[3]) / 2, 1.2),
  'On the hydraulic pump room\'s forward wall. Its door opens on the isolator, the two star-delta starters, the two direct starters, the control transformer and the terminals.',
  node='RSP', basis='yard')
# ---- the places marked in the machinery spaces
for e in SP.ENDS:
    x0, x1, a, b = e['box']
    tag = {'MSB': 'ELD-61', 'PSB': 'ELD-62', 'T1': 'ELD-63', 'T2': 'ELD-64', 'DG1': 'GEN-01', 'DG2': 'GEN-02', 'DG3': 'GEN-03'}[e['tag']]
    C(tag, f"{e['tag']}: place marked", e['room'], ((x0 + x1) / 2, (a + b) / 2, e['floor'] + 0.9),
      f"NOT INSTALLED. {e['what']} Its place is marked on the floor ({x1 - x0:.2f} by {b - a:.2f} m) with a sign, and the cables that are to be landed on it end here, tagged.",
      node=e['tag'], note='A placeholder: the machinery design basis\'s place and size.')
MARK = {'MSB': 'ELD-61', 'PSB': 'ELD-62', 'T1': 'ELD-63', 'T2': 'ELD-64', 'DG1': 'GEN-01', 'DG2': 'GEN-02', 'DG3': 'GEN-03'}

# ---------------------------------------------------------------------------------------------------------------------
# Nets
# ---------------------------------------------------------------------------------------------------------------------
_cleats = [c['id'] for c in COMPONENTS if c['name'].startswith(('Bolt cleat', 'Hook cleat', 'Door switch', 'Safety latch'))]
NETS = [
    dict(id='RAMP-CTL', name='Stern ramp control', medium='24 V, one pair to each solenoid, button and lamp', hub='ELD-51', out='HR-TOP',
         text='From the starter panel\'s control circuit to the control stand and the valve stand: pump start and stop, raise and lower, the cleats\' valve, the lamps.',
         members=[('ELD-51', 'node', 'starts the pumps, feeds the circuit'), ('RMP-30', 'node', 'orders: pump, raise, lower, stop'),
                  ('HYD-10', 'listens', 'its solenoids'), ('RMP-31', 'node', 'the switches\' states')]),
    dict(id='RAMP-IND', name='Ramp and cleat position', medium='24 V, one pair to each switch', hub='RMP-31', out='HR-TOP',
         text='Each of the ten cleats, both safety latches and both door posts has a switch. All home: "ramp closed and locked", green at the stand and on the bridge. Any away: red on the bridge.',
         members=[('RMP-31', 'node', '')] + [(c, 'talks', 'home, or not') for c in _cleats]
         + [('ext:BRG:Ramp, hatch and watertight door panel (ALM-06)', 'listens', 'closed and locked, or not')]),
    dict(id='RAMP-ALM', name='Power pack alarms', medium='24 V, one pair to each switch', hub='ELD-51', out='ER-PEN',
         text='Oil level low, oil temperature high, filter clogged, a pump tripped: a lamp at the stand and one group alarm to the control room.',
         members=[('ELD-51', 'node', ''), ('HYD-01', 'talks', 'oil level, oil temperature'), ('HYD-07', 'talks', 'filter clogged'), ('RMP-30', 'listens', 'the oil lamp'),
                  ('ext:ECR:Alarm and monitoring system', 'listens', 'stern ramp power pack: group alarm')]),
    # The main supply, as placeholders: so that the feed is drawn the whole way from where the generating sets are to stand.
    dict(id='GEN-FEED', name='Generators\' feeders (placeholders)', medium='690 V three-phase, 2 x (3 x 120 mm2) a set', hub='ELD-61', kind='power',
         text='From each generating set\'s place to the main switchboard\'s: 400 kVA at 690 V is 335 A a set. Not sized by this register; drawn so that the way is known.',
         members=[('ELD-61', 'node', 'the bars'), ('GEN-01', 'talks', '320 kW'), ('GEN-02', 'talks', '320 kW'), ('GEN-03', 'talks', '320 kW')]),
    dict(id='TX-FEED-1', name='Transformer No. 1 feeders (placeholders)', medium='690 V in, 440 V out, three-phase', kind='power',
         text='From the main switchboard to transformer No. 1 and on to the 440 V section.',
         members=[('ELD-61', 'talks', '690 V'), ('ELD-63', 'node', '800 kVA'), ('ELD-62', 'listens', '440 V')]),
    dict(id='TX-FEED-2', name='Transformer No. 2 feeders (placeholders)', medium='690 V in, 440 V out, three-phase', kind='power',
         text='From the main switchboard to transformer No. 2 and on to the 440 V section.',
         members=[('ELD-61', 'talks', '690 V'), ('ELD-64', 'node', '800 kVA'), ('ELD-62', 'listens', '440 V')]),
]

# ---------------------------------------------------------------------------------------------------------------------
# Pipes: each as it is laid (stern_place.routes), its longest run
# ---------------------------------------------------------------------------------------------------------------------
_routes = SP.routes()


def _path(name):
    return [at(*p) for p in max(_routes[name], key=len)]


PIPES = [
    dict(id='HY-01A', system='Hydraulics', name='Line A: the cylinders\' rod sides', dn=25, medium='Oil, 210 bar', material='Seamless steel, 30 x 4',
         ends=['HYD-10', 'RMP-03', 'RMP-04'], path=_path('A'),
         text='From the valve stand along the hydraulic room\'s wall and the port mooring station\'s, up, across over the door\'s head and to both cylinders. Oil here raises the ramp and holds it.'),
    dict(id='HY-01B', system='Hydraulics', name='Line B: the cylinders\' piston sides', dn=25, medium='Oil', material='Seamless steel, 30 x 4',
         ends=['HYD-10', 'RMP-03', 'RMP-04'], path=_path('B'),
         text='Beside line A. Oil here lowers the ramp, against the load-holding valves.'),
    dict(id='HY-02C', system='Hydraulics', name='Line C: cleats, lock', dn=12, medium='Oil', material='Seamless steel, 18 x 2.5',
         ends=['HYD-10'] + [c['id'] for c in COMPONENTS if c['name'].startswith(('Bolt cleat', 'Hook cleat'))], path=_path('C'),
         text='To a header down each mooring station\'s wall and across over the door\'s head: every cleat is fed from it by a hose.'),
    dict(id='HY-02D', system='Hydraulics', name='Line D: cleats, let go', dn=12, medium='Oil', material='Seamless steel, 18 x 2.5',
         ends=['HYD-10'] + [c['id'] for c in COMPONENTS if c['name'].startswith(('Bolt cleat', 'Hook cleat', 'Safety latch'))], path=_path('D'),
         text='Beside line C. The two safety latches\' lifting cylinders are on it too.'),
    dict(id='HY-03P', system='Hydraulics', name='Pressure, pumps to valve stand', dn=25, medium='Oil, 210 bar', material='Seamless steel, 30 x 4',
         ends=['HYD-06', 'HYD-10'], path=_path('P'), text='From the pressure block on the tank over the way to the valve stand.'),
    dict(id='HY-03T', system='Hydraulics', name='Return, valve stand to tank', dn=32, medium='Oil', material='Seamless steel, 35 x 3',
         ends=['HYD-10', 'HYD-01'], path=_path('T'), text='Back over the way, through the cooler and the return filter into the tank.'),
]

# ---------------------------------------------------------------------------------------------------------------------
# The wiring of the control circuit: every terminal of the stand's strip X1 and where its core goes (JS3-304 prints it,
# and the stand's own terminal strip in the model has as many terminals)
# ---------------------------------------------------------------------------------------------------------------------
# (terminal, what, the other end, the core of cable W-RMP-10 between the starter panel's strip X0 and the stand's X1)
STAND_TERMINALS = [
    (1, '24 V +', 'RSP X0:1', 1), (2, '24 V 0', 'RSP X0:2', 2),
    (3, 'Emergency stop, contact 1 (opens the pumps\' circuit)', 'RSP X0:3', 3), (4, 'Emergency stop, contact 1, return', 'RSP X0:4', 4),
    (5, 'Emergency stop, contact 2 (opens the valves\' circuit)', 'RSP X0:5', 5), (6, 'Emergency stop, contact 2, return', 'RSP X0:6', 6),
    (7, 'Pump 1: start', 'RSP X0:7 (K1 coil circuit)', 7), (8, 'Pump 1: stop', 'RSP X0:8', 8), (9, 'Pump 1: running', 'RSP X0:9 (K1 auxiliary)', 9),
    (10, 'Pump 2: start', 'RSP X0:10 (K2 coil circuit)', 10), (11, 'Pump 2: stop', 'RSP X0:11', 11), (12, 'Pump 2: running', 'RSP X0:12 (K2 auxiliary)', 12),
    (13, 'Cleats lever: lock', 'RSP X0:13 (valve V2, solenoid a)', 13), (14, 'Cleats lever: open', 'RSP X0:14 (valve V2, solenoid b)', 14),
    (15, 'Ramp lever: raise', 'RSP X0:15 (valve V1, solenoid a)', 15), (16, 'Ramp lever: lower', 'RSP X0:16 (valve V1, solenoid b)', 16),
    (17, 'Cleats open (all twelve away)', 'JB X2:29', 17), (18, 'Cleats locked (all twelve home)', 'JB X2:30', 18), (19, 'Ramp closed (both door switches)', 'JB X2:31', 19),
    (20, 'Oil level low', 'RSP X0:20 (LS1)', 20), (21, 'Oil temperature high', 'RSP X0:21 (TS1)', 21),
    (22, 'System pressure, 4 to 20 mA', 'RSP X0:22 (PT1)', 22), (23, 'Ramp line A pressure, 4 to 20 mA', 'RSP X0:23 (PT2)', 23),
    (24, 'Beacon and horn', 'RSP X0:24 (KA5)', 24), (25, 'Control at the stand (key switch)', 'RSP X0:25', 25), (26, 'Lamp test', 'RSP X0:26', 26),
    (27, 'Spare', '', 27), (28, 'Spare', '', 28),
]
# The cables (tag, from, to, cores and size, what)
CABLES = [
    ('W-RMP-01', 'PSB (place marked)', 'RSP', '3 x 70 mm2 + earth', 'Feeder, 440 V, 160 A'),
    ('W-RMP-02', 'RSP way 1', 'Main pump No. 1', '2 x (3 x 25 mm2) + earth', 'Six leads for the star-delta starter'),
    ('W-RMP-03', 'RSP way 2', 'Main pump No. 2', '2 x (3 x 25 mm2) + earth', 'Six leads for the star-delta starter'),
    ('W-RMP-04', 'RSP way 3', 'Cleat pump', '3 x 1.5 mm2 + earth', ''),
    ('W-RMP-05', 'RSP way 4', 'Oil cooler fan', '3 x 1.5 mm2 + earth', ''),
    ('W-RMP-10', 'RSP X0', 'Control stand X1', '30 x 1.5 mm2', 'Control, 24 V: in the conduit with the pipes'),
    ('W-RMP-11', 'RSP X0', 'Valve stand', '7 x 1.5 mm2', 'Six solenoids and a common'),
    ('W-RMP-12', 'Control stand X1', 'Junction box X2', '4 x 1.5 mm2', 'Cleats open; cleats locked; ramp closed'),
    ('W-RMP-13', 'Junction box X2', 'Each cleat, latch and door switch (14)', '2 x 1.5 mm2 each', 'One pair a switch'),
    ('W-RMP-14', 'Junction box X2', 'Bridge, door and ramp panel ALM-06', '2 x 1.5 mm2', 'Closed and locked, to the bridge'),
    ('W-RMP-15', 'RSP X0', 'Engine control room, alarm system', '2 x 1.5 mm2', 'Group alarm'),
    ('W-GEN-01', 'DG1 (place marked)', 'MSB (place marked)', '2 x (3 x 120 mm2) + earth', 'Placeholder: 690 V, 335 A'),
    ('W-GEN-02', 'DG2 (place marked)', 'MSB (place marked)', '2 x (3 x 120 mm2) + earth', 'Placeholder: 690 V, 335 A'),
    ('W-GEN-03', 'DG3 (place marked)', 'MSB (place marked)', '2 x (3 x 120 mm2) + earth', 'Placeholder: 690 V, 335 A'),
    ('W-TX-01', 'MSB (place marked)', 'T1 (place marked)', '3 x (3 x 120 mm2) + earth', 'Placeholder: 690 V, 670 A'),
    ('W-TX-02', 'T1 (place marked)', 'PSB (place marked)', '4 x (3 x 150 mm2) + earth', 'Placeholder: 440 V, 1,050 A'),
    ('W-TX-03', 'MSB (place marked)', 'T2 (place marked)', '3 x (3 x 120 mm2) + earth', 'Placeholder: 690 V, 670 A'),
    ('W-TX-04', 'T2 (place marked)', 'PSB (place marked)', '4 x (3 x 150 mm2) + earth', 'Placeholder: 440 V, 1,050 A'),
]
# What is in the starter panel (tag, what, rating)
PANEL_PARTS = [
    ('Q0', 'Isolator, door-interlocked', '160 A, 3-pole'),
    ('F1, F2', 'Motor circuit breakers, main pumps', '80 A'),
    ('K1M, K1D, K1S', 'Contactors, pump No. 1: main, delta, star', '65 A, 65 A, 40 A'),
    ('K2M, K2D, K2S', 'Contactors, pump No. 2: main, delta, star', '65 A, 65 A, 40 A'),
    ('F3, K3', 'Breaker and contactor, cleat pump', '10 A, 9 A'),
    ('F4, K4', 'Breaker and contactor, cooler fan', '4 A, 9 A'),
    ('T10', 'Control transformer with rectifier', '440/24 V, 630 VA'),
    ('F10, F11', 'Control fuses', '2 A, 10 A'),
    ('KT1, KT2', 'Star-delta timers', '0 to 30 s'),
    ('KA1 to KA5', 'Relays: cleats open, cleats locked, ramp closed, alarm, beacon and horn', '24 V'),
    ('P1, P2', 'Ammeters, main pumps', '0 to 100 A'),
    ('H1 to H5', 'Door lamps: power, pump 1, pump 2, cleat pump, alarm', '24 V'),
    ('X0', 'Terminal strip', '40 terminals'),
]
