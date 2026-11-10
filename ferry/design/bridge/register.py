#!/usr/bin/env python3
"""The Christina's bridge: a register of every piece of equipment and machinery on the bridge deck, its wheelhouse and
wings, and the compass deck's fittings the bridge supplies. Run it to write register.json and register.csv.

    python3 ferry/design/bridge/register.py

Three sources are merged, and every row says which one it comes from (`basis`):
  drawn   a piece that is in the model (the Town's ferry-interior.js, ferry-bridge.js, or her own Blender compass deck);
  words   named in the Town's design words for the room (FERRY_GA) but nothing is drawn;
  data    in the Town's electrical or piping tables (tags, boards, feeders, pipe lines) but nothing is drawn;
  needed  in neither, but any working ship of this kind has it: my inference, to be checked, never a Town fact.
Tags are the Town's own KKS tags (VGB-B 105, ferry-kks.js) where it has given one. A row with no tag has the KKS function
key (system) it would belong to, from the Town's table, and the rest of its tag is left to be assigned.

Axes in the output: yard = metres from the transom, x = metres to port of the centreline, h = metres above the deck
(the bridge deck's floor is 11.0 m above the keel; the compass deck's, 13.4 m).
"""
import csv
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SNAP = json.load(open(os.path.join(HERE, 'town-bridge.json')))
FEEDERS = {f['id']: f for f in SNAP['feeders']}
NODES = {n['id']: n for n in SNAP['pipingNodes']}
LINES = SNAP['pipingLines']
YARD = 17.25
DECK = 9.1          # the bridge deck's floor, y from the waterline
FORE = 23.0         # yard of the wheelhouse's forward wall (ferry-bridge.js: fore = Z(23))

# Where the Town's kit puts the wheelhouse equipment (ferry-bridge.js): x to port, h above the deck, yard = 23 + z.
KIT = 'ferry-bridge.js'


def piece(space, name=None, nth=0, **kw):
    """A drawn piece of the Town's interior, by room and name (nth when a name repeats)."""
    found = [p for p in SNAP['pieces'] if p['space'] == space and (name is None or p['name'] == name)
             and all(p.get(k) == v for k, v in kw.items())]
    if len(found) <= nth:
        raise SystemExit(f'no piece {space}/{name}#{nth}')
    return found[nth]


def geom(p):
    lo, hi = p['lo'], p['hi']
    return dict(yard=round((lo[2] + hi[2]) / 2 + YARD, 2), x=round((lo[0] + hi[0]) / 2, 2),
                h=round((lo[1] + hi[1]) / 2 - DECK, 2),
                size=[round(hi[0] - lo[0], 2), round(hi[2] - lo[2], 2), round(hi[1] - lo[1], 2)],
                src=('ferry-interior.js:' + '|'.join(map(str, p['lines']))) if p['lines'] else 'ferry-interior.js')


def kit(x, h, z, size=None, src=KIT):
    return dict(yard=round(FORE + z, 2), x=x, h=h, size=size, src=src)


def feed(*ids):
    out = []
    for i in ids:
        f = FEEDERS[i]
        kind = f"{f['volts']} V {'3~' if f['phases'] == 3 else '1~'}"
        out.append(f"{f['board']} {kind} · feeder {f['id']} ({f['tag']}) · {f['kW']} kW · {f['amps']} A · {f['starter']} · "
                   f"breaker {f['breaker']} A · {f['cable']} · {f['length']} m · cable {f['number']}")
    return ' | '.join(out)


def pipe(*ids):
    out = []
    for i in ids:
        n = NODES[i]
        touching = [l for l in LINES if l['from'] == i or l['to'] == i]
        parts = [f"{l['system']} {l['from']}→{l['to']} DN{l['dn']}" + (f" ({l['note']})" if l['note'] else '') for l in touching]
        out.append(f"{n['tag']} {n['label']}: " + '; '.join(parts))
    return ' | '.join(out)


ROWS = []


def add(room, item, cls, status, basis, g=None, tag='', fn='', el='', pl='', need='', note='', deck='bridge'):
    row = dict(deck=deck, room=room, item=item, cls=cls, status=status, basis=basis, tag=tag, fn=fn,
               yard=None, x=None, h=None, size=None, electrical=el, plumbing=pl, connect=need, source='', note=note)
    if g:
        row.update({k: g[k] for k in ('yard', 'x', 'h', 'size')})
        row['source'] = g['src']
    ROWS.append(row)


FN = {
    'CTA': 'CTA Navigation and radio equipment', 'CSA': 'CSA Fire detection and alarm', 'CMA': 'CMA Engine control and alarm',
    'XSA': 'XSA Steering gear', 'XSC': 'XSC Bow thruster', 'SGJ': 'SGJ CO₂ fire extinguishing', 'SGA': 'SGA Fire main',
    'SGP': 'SGP Portable extinguishers', 'GKB': 'GKB Drinking water distribution', 'GHB': 'GHB Flushing water',
    'GQA': 'GQA Waste water collection', 'SAC': 'SAC Accommodation HVAC', 'BRB': 'BRB 105 V lighting board',
    'BRV': 'BRV Emergency board', 'BRU': 'BRU Battery chargers', 'BTA': 'BTA 24 V DC supply', 'MKA': 'MKA Generator',
    'BRT': 'BRT 440/105 V transformers', 'EGD': 'EGD Fuel service tank', 'UYA': 'UYA Accommodation', 'XSB': 'XSB Bow ramp hydraulics',
    'MKY': 'MKY Generator control', 'SMA': 'SMA Hoists and davits',
}
NO_KEY = 'no key in the Town table'

# ----------------------------------------------------------------------------------------------------------------- EG room
r = 'eg-room'
add(r, 'Emergency generator, 40 kVA / 32 kW', 'machinery', 'built', 'drawn', geom(piece(r, 'emergency generator')),
    tag='15MKA10 AG001', fn=FN['MKA'],
    el='Source to ESB: 63 A frame, 52 A setting, 16 mm² (FERRY_SOURCES EG)',
    pl='Diesel fuel from the day tank; air cooled through the louvres (design words); exhaust to open air; starter from the 24 V bank',
    need='Fuel feed and return to the 60 L day tank; exhaust to the open deck (no pipe is drawn or specified); battery cables; start/stop and alarms to the ESB; earth')
add(r, 'Emergency switchboard (ESB), 440 V and 105 V', 'electrical', 'built', 'drawn', geom(piece(r, 'emergency switchboard')),
    tag='10BRV10 GS001', fn=FN['BRV'],
    el='Fed by bus-tie from the MSB and by the EG. Feeds: nav-lights, emergency-radar, emergency-light, emergency-charger',
    need='Cables up the casing trunk from the MSB (control booth); feeders to the compass deck, the wheelhouse, the corridor')
add(r, '24 V battery bank (starting and radio/emergency)', 'electrical', 'part-built', 'drawn', geom(piece(r, 'battery box')),
    tag='10BTA10 GS001', fn=FN['BTA'],
    el='24 V DC distribution, two banks and chargers (the emergency charger is named for radio, fire detection, alarm); no 24 V feeder to any consumer is in the feeder table',
    need='Radio/emergency bank to the wheelhouse (VHF, DSC, NAVTEX, GPS, alarm panel) and to the EG starter; charger supplies; ventilation of the battery space',
    note='One "battery box" is drawn for two banks')
add(r, 'Battery chargers (two, 1.5 kW each, MSB)', 'electrical', 'data only', 'data', tag='10BRU10 GU001 / GU002', fn=FN['BRU'],
    el=feed('chargersA', 'chargersB'), need='Output cables to the two banks; alarm if a charger fails')
add(r, 'Emergency charger (0.5 kW, ESB)', 'electrical', 'data only', 'data', tag='10BRU10 GU003', fn=FN['BRU'],
    el=feed('emergency-charger'), need='Output to the radio/emergency bank')
add(r, 'Emergency lighting transformer, 5 kVA, 440/105 V', 'electrical', 'data only', 'data', tag='10BRT20 GT001', fn=FN['BRT'],
    el='ETR source to ESB: 10 A frame primary, 32 A secondary (FERRY_SOURCES ETR)', need='Primary from the ESB 440 V section; 105 V to the emergency lighting circuits')
add(r, 'Day tank, 60 L', 'machinery', 'built', 'drawn', geom(piece(r, 'day tank')), fn=FN['EGD'],
    pl='Fuel: filled from the transfer system (EGC); feeds the EG; overflow and vent',
    need='Fill line from below (no pipe is drawn); overflow to a drain tank; vent to open air; low-level alarm; quick-closing valve operated from the CO₂ room',
    note='Drawn 1.6 m above the deck; nothing is under it (Rev C F23-F26 class: floating)')
add(r, 'Louvres (EG room air)', 'outfit', 'designed', 'words', fn=FN['SAC'], need='Weathertight louvres with closing flaps in the wall to the open deck; sized for the EG\'s air and heat')
add(r, 'Exhaust pipe and silencer, EG', 'machinery', 'required', 'needed', fn='XJR Exhaust gas system (the Town\'s diesel-engine key)',
    pl='Exhaust gas to open air', need='Through the deckhead or the aft wall to a vent clear of the accommodation; lagged; spark arrester')
add(r, 'Exit door to the open deck (weathertight)', 'outfit', 'part-built', 'drawn', dict(yard=6.0, x=1.6, h=0.96, size=[0.8, 0.08, 1.92], src='measured off the model: a doorway 0.80 m wide in the aft wall'), fn=NO_KEY, note='A doorway; no leaf was found. Its only exit: no door to the corridor (FERRY_GA exits: open-deck)')

# ---------------------------------------------------------------------------------------------------------------- CO2 room
r = 'co2-room'
add(r, 'CO₂ bottles, 4 × 45 kg', 'safety', 'built', 'drawn',
    dict(yard=8.6, x=-2.15, h=0.73, size=[1.1, 0.24, 1.45], src='measured off the model (four hexagonal prisms, not in ferry-interior.js)'),
    tag='10SGJ10 BB001', fn=FN['SGJ'], pl=pipe('co2b'),
    need='Manifold, main valve and a 40 mm line to six nozzles under the engine-room deckhead (the line is unresolved in the Town: "outside machinery-space envelope")',
    note='Standing 0.28 m clear of the forward wall; ties and a weighing arrangement are not drawn')
add(r, 'CO₂ release cabinet', 'safety', 'built', 'drawn', geom(piece(r, 'CO₂ release cabinet')), tag='10SGJ10 CH001', fn=FN['SGJ'],
    pl=pipe('co2rel'), el='Alarm and fan-stop signals (control; cable 4501–5999 range)',
    need='Pilot line to the main valve; wire to the alarm and fan-stop contacts; keyed, alarm first')
add(r, 'CO₂ main valve', 'safety', 'data only', 'data', tag='10SGJ10 AA201', fn=FN['SGJ'], pl=pipe('co2v'), need='Between the bottles and the engine-room line; opened from the cabinet')
add(r, 'Remote fan stops', 'safety', 'built', 'drawn', geom(piece(r, 'fan stops')), fn='SAA Engine-room HVAC',
    el='Control circuits to the engine-room and car-deck fan starters (er-fans, car-deck-fans on MSB)', need='Stop contacts wired into the starters; labelled; behind a glass or a lid')
add(r, 'Remote fuel quick-closing valves (controls)', 'safety', 'designed', 'words', fn='EGB Fuel storage',
    need='Pull handles or pneumatic/hydraulic release to each fuel tank valve (engine room, day tank); labelled')
add(r, 'Firemen\'s outfit locker, two outfits', 'safety', 'built', 'drawn', geom(piece(r, 'firemen’s outfit locker')), fn=FN['SGP'],
    note='Contents (two sets of fire-fighter\'s outfit, breathing apparatus, axes, lifelines) are not drawn')
add(r, 'Exit door to the open deck', 'outfit', 'part-built', 'drawn', dict(yard=6.0, x=-1.6, h=0.96, size=[0.8, 0.08, 1.92], src='measured off the model: a doorway 0.80 m wide in the aft wall'), fn=NO_KEY, note='A doorway; no leaf was found. Its only exit is the open deck (FERRY_GA exits: open-deck)')

# ------------------------------------------------------------------------------------------------------------------ cabins
for r, who in (('crew-cabin', 'the bosun and the oiler'), ('mate-cabin', 'the chief officer'), ('deckhand-cabin', 'the deckhand'),
               ('chief-cabin', 'the chief engineer'), ('master-cabin', 'the master')):
    nb = len([p for p in SNAP['pieces'] if p['space'] == r and p['name'] == 'bunk'])
    add(r, f'Bunk ({"two berths, stacked" if r == "crew-cabin" else "one berth"})', 'furniture', 'built', 'drawn', geom(piece(r, 'bunk')), fn=FN['UYA'],
        note=f'For {who}')
    add(r, 'Locker', 'furniture', 'built', 'drawn', geom(piece(r, 'locker')), fn=FN['UYA'])
    add(r, 'Berth reading lamp and cabin light', 'electrical', 'data only', 'data', fn=FN['BRB'], el='Part of "light-crew" (LB 105 V, 0.42 kW for the whole bridge-deck crew lighting): ' + feed('light-crew'),
        need='One lighting circuit and a berth lamp per cabin; switch at the door; no per-cabin circuit exists in the table')
    add(r, 'Cabin air conditioning/ventilation unit', 'electrical', 'data only', 'data', fn=FN['SAC'], el='Part of the four "room-ac" units listed in the mess: ' + feed('room-acA', 'room-acB'),
        need='Supply and exhaust duct or a split unit with a condensate drain; thermostat')
    add(r, 'Smoke detector and call point', 'safety', 'required', 'needed', fn=FN['CSA'], need='Detector loop to the fire panel in the wheelhouse; no fire loop is in the Town\'s feeder table')
add(r := 'crew-cabin', 'Fold-down desk', 'furniture', 'designed', 'words', fn=FN['UYA'], note='In the design words; not drawn')
for r in ('mate-cabin', 'chief-cabin', 'master-cabin'):
    d = [p for p in SNAP['pieces'] if p['space'] == r and p['name'] == 'desk']
    add(r, 'Desk', 'furniture', 'built', 'drawn', geom(d[1]) if len(d) > 1 else geom(d[0]), fn=FN['UYA'], note='Two pieces (top and carcase)')
add('master-cabin', 'Safe (ship\'s papers)', 'furniture', 'built', 'drawn', geom(piece('master-cabin', 'safe')), fn=FN['UYA'])
add('crew-cabin', 'Duty-berth name plate (relief engineer)', 'outfit', 'built', 'drawn',
    dict(yard=round(SNAP['plates'][0]['pos'][2] + YARD, 2), x=SNAP['plates'][0]['pos'][0], h=round(SNAP['plates'][0]['pos'][1] - DECK, 2), size=[0.7, 0.01, 0.18], src='ferry-interior.js plates'), fn=FN['UYA'])

# --------------------------------------------------------------------------------------------------------------- crew WC
r = 'crew-wc'
add(r, 'WC', 'plumbing', 'built', 'drawn', geom(piece(r, 'WC')), tag='10GHB10 BR001 (shared)', fn=FN['GHB'],
    pl=pipe('flush'), need='Sea-water flush from the sanitary pumps (GHB, DN32); soil pipe to the sewage tank by gravity (DN100) — no pipe is drawn on this deck')
add(r, 'Basin', 'plumbing', 'built', 'drawn', geom(piece(r, 'basin')), tag='10GKB20 BR002 (shared)', fn=FN['GKB'],
    pl=pipe('toilets'), need='Cold and hot drinking water (DN15/20); waste to the grey-water drain: no such drain exists in the Town\'s tables')
add(r, 'Shower', 'plumbing', 'designed', 'words', tag='10GKB20 BR002 (shared)', fn=FN['GKB'],
    pl='Hot and cold drinking water; grey-water drain', need='Mixer; waste with a trap to the grey-water drain; the shower tray needs a watertight coaming; extract ventilation',
    note='"Crew WC and shower": the shower is not drawn (Rev C task: close the design gaps)')
add(r, 'Extract fan for the WC and shower', 'machinery', 'required', 'needed', fn=FN['SAC'],
    need='Duct to open air through the house side; the Town\'s only toilet fans (10SAC30 AN001-M01, 0.3 kW) are in the passenger-deck toilets, none here')

# ----------------------------------------------------------------------------------------------------------------- mess
r = 'mess'
add(r, 'Mess table (for six)', 'furniture', 'built', 'drawn', geom(piece(r, 'mess table')), fn=FN['UYA'])
add(r, 'Mess benches (two)', 'furniture', 'built', 'drawn', geom(piece(r, 'mess bench', 0)), fn=FN['UYA'], note='Two pieces, one each side of the table')
add(r, 'Sideboard', 'furniture', 'built', 'drawn', geom(piece(r, 'sideboard')), fn=FN['UYA'])
add(r, 'Television', 'electrical', 'built', 'drawn', geom(piece(r, 'mess television')), fn=FN['BRB'],
    el='No feeder: the Town\'s "tv" load is in the carpet room, not the mess', need='105 V socket circuit and an aerial/data cable; fixed to the bulkhead')
add(r, 'Kettle', 'electrical', 'built', 'drawn', dict(yard=14.35, x=2.55, h=1.0, size=[0.12, 0.14, 0.2], src='in the model, unnamed: a grey cylinder on the sideboard (found by looking at the model\'s pieces, not in the interior list)'), fn=FN['BRB'], need='A 105 V socket on a protected circuit (galley-appliances covers 4 kW in the galley, not the mess)')
add(r, 'Duty board and muster list', 'outfit', 'designed', 'words', fn=NO_KEY, note='The muster list is a statutory notice; neither is drawn')
add(r, 'Air-conditioning units (four, 2 kW each)', 'electrical', 'data only', 'data', fn=FN['SAC'], tag='10SAC20 AH001 / AH002',
    el=feed('room-acA', 'room-acB'), need='Located "in the mess" in the Town data: serves the bridge deck; supply ducts to every cabin; condensate drains (none exist)')
add(r, 'Lighting for the crew rooms (0.42 kW)', 'electrical', 'data only', 'data', tag='10BRB10 GS014', fn=FN['BRB'], el=feed('light-crew'), need='Circuits per room; emergency lights from the ESB')

# ---------------------------------------------------------------------------------------------------------------- galley
r = 'galley'
add(r, 'Three-plate range, 6 kW', 'electrical', 'built', 'drawn', geom(piece(r, 'range')), tag='10GKB30 AH001', fn='GKB (the Town tags the range under drinking water)',
    el=feed('range'), need='440 V 3~ cable to a range isolator within reach; hood fan interlock; fire blanket nearby',
    note='Tagged 10GKB30: GKB is the drinking-water key; a cooking range is not water distribution (a KKS slip, see findings)')
add(r, 'Hood and extract', 'machinery', 'built', 'drawn', geom(piece(r, 'hood')), fn=FN['SAC'], el='The hood is named in galley-appliances: ' + feed('galley-appliances'), need='Grease filter, duct to open air through the house side, fan, and a fire damper; a 105 V circuit')
add(r, 'Sink', 'plumbing', 'built', 'drawn', geom(piece(r, 'sink')), tag='10GKB20 BR001', fn=FN['GKB'], pl=pipe('galley'),
    need='Cold and hot DN20/15; waste with a trap to a grey-water drain (none in the Town\'s tables)')
add(r, 'Fridge-freezer', 'electrical', 'built', 'drawn', geom(piece(r, 'fridge-freezer')), tag='10GKB30 GS001 (shared)', fn='GKB (as above)',
    el=feed('galley-appliances'), need='105 V socket; ventilated recess; defrost drain')
add(r, 'Provision locker', 'furniture', 'built', 'drawn', geom(piece(r, 'provision locker')), fn=FN['UYA'])
add(r, 'Rice cooker', 'electrical', 'built', 'drawn', dict(yard=15.45, x=-2.62, h=1.0, size=[0.16, 0.18, 0.2], src='in the model, unnamed: a cream cylinder on the counter beside the sink'), tag='10GKB30 GS001 (shared)', fn='GKB (as above)', el='Named in galley-appliances (rice cooker, microwave, pot, fridge, hood): ' + feed('galley-appliances'), note='Drawn, unnamed (found by looking at the model\'s pieces)')
add(r, 'Hatch to the mess', 'outfit', 'designed', 'words', fn=NO_KEY, note='In the design words; not drawn')
add(r, 'Water heater, 100 L / 3 kW', 'plumbing', 'data only', 'data', tag='10GKB20 AC001', fn=FN['GKB'], el=feed('water-heater'), pl=pipe('heater'),
    need='Cold feed from the pressure tank, hot to the galley, the crew WC and the shower, an expansion vessel, a safety valve with a drain; "the kiosk\'s hot water too" (design words) needs a pipe two decks down')

# ---------------------------------------------------------------------------------------------------------------- corridor
r = 'corridor'
add(r, 'Ceiling lights (five)', 'electrical', 'built', 'drawn',
    dict(yard=14.0, x=0.0, h=2.1, size=[0.4, 0.3, 0.04], src='ferry-interior.js (unnamed, five 0.4 m plates 2 m apart)'), tag='10BRV20 GS011', fn=FN['BRV'],
    el=feed('emergency-light'), need='Emergency lighting from the ESB (1.55 kW) inside the normal lighting; the lights are drawn at 2 m spacing')
add(r, 'Red plate over the aft crew door (an exit sign, by its place)', 'safety', 'built', 'drawn', dict(yard=6.0, x=0.0, h=2.0, size=[0.8, 0.02, 0.15], src='ferry-interior.js (unnamed red box)'), fn=FN['BRV'],
    need='A lit exit sign on the emergency circuit', note='Unnamed in the source')
add(r, 'Handrails along the corridor', 'outfit', 'built', 'drawn', dict(yard=12.75, x=0.0, h=0.9, size=[0.9, 13.5, 0.04], src='assemble.py OPENINGS (cut at the doorways)'), fn=FN['UYA'])
add(r, 'Fire extinguishers (portable)', 'safety', 'required', 'needed', fn=FN['SGP'], need='At least one in the corridor and one in the galley; not drawn on this deck')

# ------------------------------------------------------------------------------------------------------------- wheelhouse
r = 'wheelhouse'
add(r, 'Steering stand (pedestal)', 'navigation', 'built', 'drawn', geom(piece(r, 'steering stand')), fn=FN['XSA'],
    need='Non-follow-up and follow-up signals to the steering gear (control cables 4501–5999), power from the steering board; rudder angle indicator wiring',
    note='A 0.5 × 0.5 × 0.95 m block')
add(r, 'Helm wheel (eight spokes)', 'navigation', 'built', 'drawn', kit(0.0, 1.05, -1.57, [0.58, 0.07, 0.58]), fn=FN['XSA'], need='Follow-up transmitter to the steering gear; wheel, pedestal and shaft are one piece in the model')
add(r, 'Non-follow-up lever and autopilot', 'navigation', 'designed', 'words', fn=FN['XSA'], el='Autopilot is named in the bridge-electronics feeder (105 V): ' + feed('bridge-electronics'), need='NFU lever on the stand; autopilot panel; both to the steering gear\'s solenoid valves; heading sensor from the compass')
add(r, 'Engine telegraph lever, port', 'machinery', 'built', 'drawn', kit(0.2, 1.1, -0.4, [0.14, 0.3, 0.3]), fn=FN['CMA'],
    need='Remote engine control to the port engine (control cables); engine-order repeater in the engine room',
    note='Drawn at x +0.20 (to port of the centreline)')
add(r, 'Engine telegraph lever, starboard', 'machinery', 'built', 'drawn', kit(0.4, 1.1, -0.4, [0.14, 0.3, 0.3]), fn=FN['CMA'],
    need='Remote engine control to the starboard engine', note='Drawn at x +0.40: further to port than the port lever (the two are crossed, see findings)')
add(r, 'Thruster lever (centre)', 'machinery', 'designed', 'words', fn=FN['XSC'], el='Bow thruster 75 kW star-delta; control circuit only here', need='Proportional lever; interlock with the two-generator rule; to the thruster starter in the bow house')
add(r, 'Engine and thruster levers at both wing consoles', 'machinery', 'designed', 'words', fn=FN['CMA'], need='Duplicate lever sets under a transfer switch; none of the wing consoles is drawn')
add(r, 'Console, 5.5 m wide', 'furniture', 'built', 'drawn', geom(piece(r, 'wheelhouse console')), fn=FN['CTA'], need='Cable trays in and behind it; a trunk to the deck below for the cables')
add(r, 'Radar display (CRT)', 'navigation', 'built', 'drawn', kit(-0.95, 1.28, -0.612, [0.46, 0.1, 0.38]), fn=FN['CTA'], tag='10CTA10 GS002 (shared)',
    el=feed('bridge-electronics') + ' | emergency supply: ' + feed('emergency-radar'), need='Coax to the antenna on the compass deck; 105 V; heading input',
    note='With a three-plate hood; the screen redraws a demo sweep')
add(r, 'Echo sounder display', 'navigation', 'built', 'drawn', kit(2.4, 1.19, -0.43, [0.5, 0.34, 0.3]), fn=FN['CTA'], tag='10CTA10 GS002 (shared)', el=feed('bridge-electronics'),
    need='Transducer cable through the hull (none is drawn)', note='Reads "NO DEPTH DATA": no bathymetry is connected')
add(r, 'Engine and heading repeater panel', 'navigation', 'built', 'drawn', kit(0.68, 1.17, -0.565, [0.91, 0.12, 0.27]), fn=FN['CMA'], el=feed('bridge-electronics'),
    need='Engine rpm and telegraph signals from the engine room; heading from the compass')
add(r, 'Magnetic compass periscope', 'navigation', 'built', 'drawn', kit(0.0, 1.55, -1.405, [0.16, 0.15, 0.12]), fn=FN['CTA'], need='Optical tube to the binnacle on the compass deck; a lamp on the 24 V DC supply')
add(r, 'Navigation-light panel (4 double-pole switches)', 'navigation', 'built', 'drawn', kit(-2.05, 1.16, -0.619, [1.05, 0.1, 0.25], src='ferry-bridge-lantern.js'),
    tag='10CTA20 GS001', fn=FN['CTA'], el=feed('nav-lights'), need='Dedicated circuits to masthead, sidelights, stern and all-round lights with failure indication (Town ELEC-10: not yet specified)')
add(r, 'Window wipers (three pantograph)', 'machinery', 'built', 'drawn', kit(0.0, 1.45, -0.04, [3.6, 0.1, 0.8], src='ferry-bridge-wipers.js'), fn=FN['UYA'],
    need='A motor and switch per wiper (no feeder exists); a freshwater washer jet from the drinking-water supply',
    note='At x -1.18, 0 and +1.18 on the forward windows')
add(r, 'Chart table with drawers and red lamp', 'navigation', 'built', 'drawn', geom(piece(r, 'chart table')), fn=FN['CTA'], el='Red chart lamp on the 24 V DC', need='A dimmable red lamp; parallel rule rack; the table is against the aft wall')
add(r, 'Paper chart on the table', 'outfit', 'built', 'drawn', kit(-1.475, 0.965, -3.5 + 0.36 - 0.0, [0.88, 0.54, 0.01]), fn=NO_KEY)
add(r, 'Master\'s high chair (pedestal)', 'furniture', 'built', 'drawn', kit(1.0, 0.6, -1.5, [0.5, 0.48, 1.2]), fn=FN['UYA'], note='Pedestal chair with arm rests')
add(r, 'Red panel on the aft wall (by its place and colour, the fire/alarm panel)', 'safety', 'built', 'drawn',
    dict(yard=19.56, x=-1.3, h=1.8, size=[0.8, 0.06, 0.5], src='ferry-interior.js (unnamed red box above the chart table)'), fn=FN['CSA'],
    el='No load in the table; the 24 V emergency charger is named for "fire detection, alarm"', need='24 V DC supply; the detection loops from every room; the release alarm from the CO₂ cabinet; the fans\' stops')
add(r, 'Panel of six green indicator lamps', 'navigation', 'built', 'drawn', dict(yard=19.6, x=-1.3, h=1.93, size=[0.67, 0.02, 0.05], src='ferry-interior.js (six unnamed green plates)'), fn=FN['CTA'], note='Part of the panel above (B090); unnamed in the source')
add(r, 'Two unnamed console boxes (dark)', 'navigation', 'built', 'drawn', dict(yard=22.6, x=1.6, h=1.1, size=[0.5, 0.3, 0.2], src='ferry-interior.js (two unnamed dark boxes at x +1.3 to +1.9)'), fn=FN['CTA'],
    note='Drawn, named by nobody: they stand where the VHF, NAVTEX and the telephone would')
add(r, 'VHF with DSC', 'navigation', 'designed', 'words', fn=FN['CTA'], el='24 V DC', need='Antenna coax to the mast; GPS feed for DSC; handset; the Town lists no radio load')
add(r, 'Ship\'s telephone and engine-room phone', 'navigation', 'designed', 'words', fn=FN['CTA'], need='Sound-powered or battery circuit to the engine room, control booth, steering gear')
add(r, 'NAVTEX printer', 'navigation', 'designed', 'words', fn=FN['CTA'], el='Named in the bridge-electronics feeder: ' + feed('bridge-electronics'), need='Antenna; paper')
add(r, 'GPS display', 'navigation', 'designed', 'words', fn=FN['CTA'], el='Named in the bridge-electronics feeder: ' + feed('bridge-electronics'), need='Antenna on the compass deck; feeds to the radar, DSC, autopilot')
add(r, 'PA and general alarm', 'safety', 'designed', 'words', fn=FN['CSA'], el='PA is named in bridge-electronics and in the emergency radar/PA feeder: ' + feed('emergency-radar') + '; the alarm is named for the 24 V emergency charger', need='Amplifier; speakers in every room and on deck; alarm bells; the cables are the longest on the ship')
add(r, 'Ramp lamps and lane signals', 'safety', 'designed', 'words', fn=FN['XSB'], need='Lamp board for the ramp locking pins and limit switches (ramp: "10XSB10 AA203 limit switches to the bridge lamp"); lane signals load on the lighting board',
    note='The Town\'s ramp node says "limit switches to the bridge lamp": no lamp is drawn')
add(r, 'Whistle button', 'navigation', 'designed', 'words', fn=FN['CTA'], need='A solenoid on the whistle at the funnel or mast; 24 V or air')
add(r, 'Searchlight control', 'navigation', 'designed', 'words', fn=FN['CTA'], el=feed('searchlight'), need='Handle with a pan/tilt cable to the compass deck; the 1 kW lamp is on the lighting board')
add(r, 'Clock and barometer (drawn, unnamed); inclinometer not found', 'navigation', 'part-built', 'drawn', dict(yard=19.57, x=1.65, h=1.9, size=[0.8, 0.06, 0.34], src='in the model, unnamed: a clock at x +1.25..+1.55 and a brass barometer ring at x +1.85..+2.05 on the aft wall'), fn=NO_KEY, note='A pale 0.55 × 0.55 m board at x +2.30..+2.85 beside them is also unnamed')
add(r, 'Log desk', 'furniture', 'designed', 'words', fn=NO_KEY, need='Writing surface and a lamp; the engine log and deck log')
add(r, 'Overhead lights (two)', 'electrical', 'built', 'drawn', dict(yard=21.25, x=0.0, h=2.17, size=[0.7, 0.3, 0.06], src='ferry-interior.js (two unnamed pale plates)'), tag='10BRB10 GS011', fn=FN['BRB'],
    el='Inside "light-crew" (lighting: bridge, mess, galley, cabins): ' + feed('light-crew'), need='Own circuit; dimmable white and red lighting; no light spill on the glass')
add(r, 'Wing doors (two, weathertight)', 'outfit', 'built', 'drawn', geom(piece(r, 'wing door', 0)), fn=NO_KEY, note='Port leaf at yard 20.45-21.20, starboard leaf at 21.30-22.05, drawn laid open against the wall')
add(r, 'Forward windows (five panes) and side windows', 'outfit', 'built', 'drawn', dict(yard=22.96, x=0.0, h=1.45, size=[5.78, 0.08, 0.96], src='ferry-interior.js glass'), fn=NO_KEY, note='Panes 1.05 × 0.96 m, sill 0.97 m above the deck')

# ------------------------------------------------------------------------------------------------------------------- wings
add('wing-p', 'Hydrant, bridge deck, 15 m hose', 'safety', 'data only', 'data', tag='10SGA30 AA518', fn=FN['SGA'], pl=pipe('hBridge'),
    need='A DN50 branch from the fire main up the casing to the bridge deck (the line is unresolved: pipe clearance); hose box; the main must be drained in frost')
add('wing-p', 'Wing console (engine and thruster levers)', 'machinery', 'designed', 'words', fn=FN['CMA'], need='Lever set with transfer switch; weathertight; a rudder-angle and rpm repeater')
add('wing-p', 'Port sidelight (red)', 'navigation', 'designed', 'words', fn=FN['CTA'], el='Dedicated nav circuit from the panel (10CTA20 GS001); 105 V ESB', need='Screened lantern at the wing end; cable from the panel along the wing', note='Today it is the Town\'s exterior lantern (not in the bridge group)')
add('wing-s', 'Wing console (engine and thruster levers)', 'machinery', 'designed', 'words', fn=FN['CMA'], need='As to port')
add('wing-s', 'Starboard sidelight (green)', 'navigation', 'designed', 'words', fn=FN['CTA'], el='As to port; this is the lantern the Town\'s navigation feeder supplies', need='As to port')
add('wing-s', 'Float-free EPIRB', 'safety', 'designed', 'words', fn=NO_KEY, need='Hydrostatic release bracket clear of rails; registered')

# ------------------------------------------------------------------------------------------------------ compass-deck interface
cd = 'compass-deck'
for item, fn, el, need in (
        ('Searchlight, 1 kW', FN['CTA'], feed('searchlight'), 'Remote control cable down the mast to the wheelhouse handle'),
        ('Navigation lights (masthead, sidelights, stern, all-round)', FN['CTA'], feed('nav-lights'), 'Fed through the wheelhouse panel; each lamp with a failure alarm'),
        ('Radar antenna', FN['CTA'], '105 V via the wheelhouse set', 'Coax and power to the display; turns at 24 rpm (not in the model: it does not turn)'),
        ('VHF, GPS and NAVTEX antennas', FN['CTA'], '', 'Coax to the wheelhouse sets'),
        ('Magnetic compass binnacle', FN['CTA'], '', 'Optical tube down to the periscope in the wheelhouse')):
    add(cd, item, 'navigation', 'built' if 'Searchlight' not in item and 'Navigation lights' not in item else 'part-built', 'drawn',
        fn=fn, el=el, need=need, deck='compass', note='Her own Blender compass deck (compass_deck.py); the Town draws the lanterns on the exterior')

for i, row in enumerate(ROWS, 1):
    row['id'] = f'B{i:03d}'

# What the wheelhouse build (ferry/blender/wheelhouse.py, 11 November 2026) has made hers: the design basis' items, and the
# survey's rows that its slice replaced or folded in (the wipers, the two unnamed boxes, the overhead lamps, the GPS with the sounder).
_basis = json.load(open(os.path.join(HERE, 'design-basis.json')))
HERS = {i['register'] for i in _basis['items'] if i.get('built_by', '').startswith('ferry/blender')} | {'B075', 'B086', 'B092', 'B096', 'B103', 'B105'}
for row in ROWS:
    row['hers'] = 'built, wheelhouse.py (11 Nov 2026)' if row['id'] in HERS else ''

COLS = ['id', 'deck', 'room', 'item', 'cls', 'status', 'hers', 'basis', 'tag', 'fn', 'yard', 'x', 'h', 'size', 'electrical', 'plumbing', 'connect', 'source', 'note']


def services():
    """The Town's feeders and pipe lines that serve the bridge deck, as two flat schedules."""
    fcols = ['id', 'tag', 'name', 'board', 'where', 'volts', 'phases', 'kW', 'amps', 'starter', 'breaker', 'cable', 'length', 'drop', 'route', 'number']
    with open(os.path.join(HERE, 'feeders.csv'), 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f); w.writerow(fcols)
        for x in SNAP['feeders']:
            w.writerow([x.get(c, '') for c in fcols])
    pcols = ['system', 'from', 'to', 'dn', 'note', 'from_tag', 'from_room', 'to_tag', 'to_room']
    allnodes = {n['id']: n for n in SNAP['pipingNodes']}
    with open(os.path.join(HERE, 'pipes.csv'), 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f); w.writerow(pcols)
        for l in LINES:
            a, b = allnodes.get(l['from'], {}), allnodes.get(l['to'], {})
            w.writerow([l['system'], l['from'], l['to'], l['dn'], l['note'] or '', a.get('tag', ''), a.get('where', ''), b.get('tag', ''), b.get('where', '')])


def main():
    services()
    out = dict(source=SNAP['source'], count=len(ROWS), rows=ROWS)
    json.dump(out, open(os.path.join(HERE, 'register.json'), 'w'), indent=1, ensure_ascii=False)
    with open(os.path.join(HERE, 'register.csv'), 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(COLS)
        for r in ROWS:
            w.writerow([('x'.join(map(str, r[c])) if c == 'size' and r[c] else ('' if r[c] is None else r[c])) for c in COLS])
    from collections import Counter
    print(f'{len(ROWS)} rows;', dict(Counter(r['status'] for r in ROWS)), dict(Counter(r['basis'] for r in ROWS)))


if __name__ == '__main__':
    main()
