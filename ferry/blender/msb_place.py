"""
The Chisum's main switchboard: where it stands and what is on it, as plain numbers.

The owner, 12 November 2026: "start building the MSB , with all the right connections , so we can start hooking up the
electrical wiring to every single component onboard , including for the lights and all equipment on the bridge and
forecastle".

One file for everything that reads it: the drawing JS8-861 (yard/drawings/msb_drawing.py) is made from it before any steel
is built; the builder (blender/switchboard.py) stands the board from it; her register (systems/) takes its ways from it.

What it is. The machinery design basis (yard/design/machinery-design-basis.md, sections 1.2 and 4) gives the plant: three
diesel generating sets of 320 kW and two shaft generators of 750 kW at 690 V; a main switchboard of two bus sections with
a tie and a separate thruster bus; two transformers of 800 kVA to a 440 V section, with group starter boards; two lighting
transformers of 100 kVA to a 230 V section; an emergency switchboard fed from the 440 V section through a tie. This file
turns that into panels and ways. **The 690 V board is a row of nine cubicles on the place marked MSB; the 440 V and 230 V
sections are the row that faces it, on the place marked PSB.** Every way has its number, what it feeds, its breaker and
its cable: those are "the right connections" a cable from anywhere aboard is to be landed on.

Sizes are by her own rule (systems/ship.py): a breaker at least 1.25 times the full-load current, the next standard rating;
a cable rated for its breaker, three-core in parallel where one is not enough. Powers are the design basis's (its section
4.2); how the consumers are gathered onto ways is the yard's own. Nothing here is class-approved. Not calculated, and owed
(documents JS8-853 and JS8-852): the short-circuit level of the 690 V bars, and the voltage dip when the thruster starts.

Places are (x to port, metres from the transom, metres above the keel), as stern_place.py has them.
"""
import os
import sys
from math import ceil, sqrt

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'systems'))
import ship as SH
import stern_place as SP

PLATFORM = SP.PLATFORM                       # the switchboard room's floor, above the keel
ROOM = dict(x=(0.9, 7.4), yard=(16.8, 21.0), head=6.45)       # the room; `head`: the cable trays under the main deck
PF = 0.85                                    # the power factor a feeder is sized at

# ---- the two rows. Each stands on a place marked on the floor (stern_place.ENDS): the 690 V board forward, looking aft into
# the aisle; the 440 V and 230 V sections aft, looking forward. A cubicle is 0.5 m wide and 0.8 m deep, 2.0 m high on a
# plinth of 0.1 m; the trays are 0.35 m over its top.
CUBICLE = dict(wide=0.50, deep=0.80, high=2.00, plinth=0.10)
MSB_BOX = SP.END['MSB']['box']               # (x from, x to, from the transom from, to)
PSB_BOX = SP.END['PSB']['box']


def amps(kva=None, kw=None, volts=690):
    """A line's current: of so many kVA, or of so many kW at the sizing power factor."""
    va = kva * 1000 if kva is not None else kw * 1000 / PF
    return va / (sqrt(3) * volts)


def breaker(current, least=None):
    """The next standard rating at or over 1.25 times the current (air circuit breakers above 630 A: 800, 1000, 1250, 1600)."""
    need = max(current * SH.MARGIN, least or 0)
    return next(b for b in SH.BREAKERS + (800, 1000, 1250, 1600, 2000) if b >= need)


def cable(rating):
    """Three-core cable for a breaker: (how many in parallel, mm² each). The smallest single cable that carries it, or 120 mm²
    cables in parallel (150 mm² above 1,000 A)."""
    for mm2, can in sorted(SH.CABLE_RATING_3.items()):
        if can >= rating and mm2 <= 120:
            return 1, mm2
    mm2 = 150 if rating > 1000 else 120
    return ceil(rating / SH.CABLE_RATING_3[mm2]), mm2


def cable_text(n, mm2):
    return f'{n} x (3 x {mm2:g} mm2)' if n > 1 else f'3 x {mm2:g} mm2'


# ---------------------------------------------------------------------------------------------------------------------
# The 690 V board: nine cubicles, numbered from the left of whoever stands in the aisle and looks at it (outboard first)
# ---------------------------------------------------------------------------------------------------------------------
# kind: 'gen' a generator's panel; 'feeder'; 'tie' the bus tie with the synchronising gear. `bus`: A (inboard half), B
# (outboard half), T (the thruster's). `kva` or `kw`: what passes its breaker. `to`: where its cables go.
MSB_PANELS = [
    dict(no=1, tag='SG2', name='SHAFT GENERATOR No. 2', kind='gen', bus='B', kva=940, to='Shaft generator No. 2, engine room, starboard gear', source='SG2'),
    dict(no=2, tag='DG3', name='DIESEL GENERATOR No. 3', kind='gen', bus='B', kva=400, to='Generating set No. 3, auxiliary engine room', source='DG3'),
    dict(no=3, tag='DG2', name='DIESEL GENERATOR No. 2', kind='gen', bus='B', kva=400, to='Generating set No. 2, auxiliary engine room', source='DG2'),
    dict(no=4, tag='T2', name='TRANSFORMER No. 2', kind='feeder', bus='B', kva=800, to='Transformer No. 2, 690/440 V, in this room'),
    dict(no=5, tag='TIE', name='BUS TIE  SYNCHRONISING', kind='tie', bus='A-B', amps=1600, to='Bars A to bars B'),
    dict(no=6, tag='T1', name='TRANSFORMER No. 1', kind='feeder', bus='A', kva=800, to='Transformer No. 1, 690/440 V, in this room'),
    dict(no=7, tag='DG1', name='DIESEL GENERATOR No. 1', kind='gen', bus='A', kva=400, to='Generating set No. 1, auxiliary engine room', source='DG1'),
    dict(no=8, tag='SG1', name='SHAFT GENERATOR No. 1', kind='gen', bus='T', kva=940, to='Shaft generator No. 1, engine room, port gear', source='SG1',
         second=dict(tag='TT', name='THRUSTER BUS TIE', amps=1000)),
    dict(no=9, tag='BT', name='BOW THRUSTER', kind='feeder', bus='T', kw=636, to='Bow thruster motor, 600 kW, thruster room (its starter there)'),
]
FRAMES = (400, 630, 800, 1000, 1250, 1600, 2000)        # air circuit breakers: the frame sizes


def acb(current):
    """An air circuit breaker for a generator, a transformer or a tie: its long-time setting, 1.1 times the rated current to
    the next 10 A, and the frame that takes it. Its cable is rated for the setting."""
    setting = int(ceil(current * 1.1 / 10.0) * 10)
    return setting, next(f for f in FRAMES if f >= setting)


for _p in MSB_PANELS:
    _p['amps'] = round(_p.get('amps') or amps(_p.get('kva'), _p.get('kw'), 690))
    if _p['kind'] == 'tie':
        _p['setting'], _p['breaker'], _p['cable'] = _p['amps'], _p['amps'], None
    else:
        _p['setting'], _p['breaker'] = acb(_p['amps'])
        _p['cable'] = cable(_p['setting'])
BARS = dict(volts=690, hz=60, amps=1600)


def panel_x(no, box=None, count=None):
    """A cubicle's two sides across the ship, (x from, x to): No. 1 is outboard on the 690 V board, which looks aft."""
    x0, x1 = (box or MSB_BOX)[:2]
    w = (x1 - x0) / (count or len(MSB_PANELS))
    return x1 - no * w, x1 - (no - 1) * w


# ---------------------------------------------------------------------------------------------------------------------
# The 440 V section and the 230 V section: the row that faces the 690 V board. Its ways, gathered from the load list
# ---------------------------------------------------------------------------------------------------------------------
# (way, bus half, what it feeds, connected kW (or kVA for a transformer, with 'kva'), what is on it, where it goes)
# P: port half, behind transformer No. 1. S: starboard half, behind No. 2. Either transformer carries both through the tie.
PSB_WAYS = [
    ('P01', 'P', 'Incomer from transformer No. 1', dict(kva=800), 'T1', 'Main switchboard room'),
    ('P02', 'P', 'Group starter board No. 1 (GSP1)', dict(kw=168.6, share=0.7), 'Main engines\' lubricating oil, jacket water, sea water, nozzle cooling, pitch oil and gear pumps, port side; fuel booster, circulating and transfer pumps; separators No. 1', 'Engine room platform, port'),
    ('P03', 'P', 'Lighting transformer No. 1 (LT1)', dict(kva=100), 'The 230 V section, port half', 'Main switchboard room'),
    ('P04', 'P', 'Emergency switchboard, tie (ESB)', dict(kw=165.0), 'The emergency switchboard while there is main power', 'Emergency generator room, officers\' deck'),
    ('P05', 'P', 'Stern ramp starter panel (RSP)', dict(kw=86.7, breaker=160, **{'as': (1, 70)}), 'Two main pumps of 37 kW, cleat pump, cooler fan, control. As registered (systems/stern.py): cable W-RMP-01', 'Hydraulic pump room, main deck'),
    ('P06', 'P', 'Cargo lift starter panel (LSP)', dict(kw=90.0), 'Two pumps of 45 kW of the lift\'s power pack', 'Hydraulic pump room, main deck'),
    ('P07', 'P', 'Forward mooring starter panel (FMP)', dict(kw=110.0), 'Two pumps of 55 kW: both windlasses and mooring winches on the forecastle', 'Fore store, main deck forward'),
    ('P08', 'P', 'Steering gear power unit No. 1', dict(kw=11.0), 'One of the two exclusive circuits (the other is from the emergency switchboard)', 'Steering gear room'),
    ('P09', 'P', 'Fire pump No. 1', dict(kw=30.0), '', 'Engine room'),
    ('P10', 'P', 'Bilge and general service pump No. 1', dict(kw=18.5), '', 'Engine room'),
    ('P11', 'P', 'Ballast pump No. 2 and heeling pump', dict(kw=40.5), 'Local starters', 'Engine room'),
    ('P12', 'P', 'Starting air compressor No. 1', dict(kw=15.0), '', 'Engine room'),
    ('P13', 'P', 'Machinery ventilation starter board (MVB)', dict(kw=52.5, share=0.9), 'Engine room and auxiliary engine room supply fans, separator room, workshop, steering gear and store fans', 'Engine casing'),
    ('P14', 'P', 'Vehicle deck ventilation starter board (VVB)', dict(kw=100.0, share=0.85), 'Four main deck exhaust fans, two supply fans, lower hold exhaust and supply fans, all two-speed', 'Main deck, port casing'),
    ('P15', 'P', 'Shore connection, incomer', dict(amps=400), 'From the shore box: in port with every set stopped', 'Main deck, port pilot door lobby'),
    ('P16', 'P', 'Spare', dict(amps=100), '', ''),
    ('TIE', '-', '440 V bus tie', dict(amps=1250), 'Port half to starboard half', ''),
    ('S01', 'S', 'Incomer from transformer No. 2', dict(kva=800), 'T2', 'Main switchboard room'),
    ('S02', 'S', 'Group starter board No. 2 (GSP2)', dict(kw=165.3, share=0.7), 'The same pumps, starboard side; harbour sea water pump, stern tube pump, diesel oil transfer and separator, sludge pump; separators No. 2', 'Engine room platform, starboard'),
    ('S03', 'S', 'Lighting transformer No. 2 (LT2)', dict(kva=100), 'The 230 V section, starboard half', 'Main switchboard room'),
    ('S04', 'S', 'Galley distribution board (GDB)', dict(kw=90.0, share=0.6), 'Range, ovens, fryer, dishwasher, boilers', 'Galley, boat deck'),
    ('S05', 'S', 'Reefer sockets, board No. 1 (RF1)', dict(kw=90.0, share=0.7), 'Ten sockets of 9 kW on the main deck', 'Main deck, starboard casing'),
    ('S06', 'S', 'Reefer sockets, board No. 2 (RF2)', dict(kw=90.0, share=0.7), 'Ten sockets of 9 kW on the upper deck', 'Upper deck'),
    ('S07', 'S', 'Air conditioning plant starter board (ACB)', dict(kw=103.0, share=0.8), 'Compressor of 55 kW, air handling unit fan, sea water and chilled water pumps, provision refrigeration, galley and sanitary exhaust fans', 'Air conditioning room'),
    ('S08', 'S', 'After mooring capstans', dict(kw=30.0), 'Two capstans of 15 kW, each side of the stern door', 'After mooring stations, main deck'),
    ('S09', 'S', 'Fire pump No. 2', dict(kw=30.0), '', 'Auxiliary engine room'),
    ('S10', 'S', 'Bilge and general service pump No. 2, bilge piston pump', dict(kw=20.7), 'Local starters', 'Engine room'),
    ('S11', 'S', 'Starting air compressor No. 2, control air compressor', dict(kw=22.5), 'Local starters', 'Engine room'),
    ('S12', 'S', 'Steam and water services starter board (SWB)', dict(kw=85.0, share=0.6), 'Boiler burner, feed, circulating and condensate pumps; hydrophores, hot water, calorifier heater, sewage plant, fresh water generator', 'Auxiliary engine room'),
    ('S13', 'S', 'Bow thruster auxiliaries', dict(kw=5.5), 'Pitch oil pump and room fan', 'Bow thruster room'),
    ('S14', 'S', 'Accommodation power board (APB)', dict(kw=60.2, share=0.5), 'Laundry, workshop machines and welding, pilot door power packs, provision crane, control room air conditioner', 'Officers\' deck'),
    ('S15', 'S', 'Spare', dict(amps=100), '', ''),
]
# The 230 V section, behind the two lighting transformers (100 kVA each; either carries it through a tie). Three-phase 230 V
# to each distribution board; her lighting circuits are single-phase from them. (way, half, what, connected kW, where)
LB_WAYS = [
    ('L01', 'P', 'Incomer from lighting transformer No. 1', dict(kva=100), 'Main switchboard room'),
    ('L02', 'P', 'Wheelhouse distribution board (BD1)', dict(kw=3.4, least=25), 'Navigation bridge: registered (systems/bridge.py)'),
    ('L03', 'P', 'Navigation light panel, main feeder (NLP)', dict(kw=0.54, least=10), 'Navigation bridge: registered; its other feeder is from the emergency switchboard'),
    ('L04', 'P', 'Fire detection panel, main feeder', dict(kw=0.3, least=10), 'Navigation bridge: registered'),
    ('L05', 'P', 'Lighting board, officers\' and bridge decks (LD1)', dict(kw=10.0), 'Officers\' deck'),
    ('L06', 'P', 'Lighting board, boat deck and accommodation (LD2)', dict(kw=15.0), 'Boat deck'),
    ('L07', 'P', 'Lighting board, forecastle and fore deck (LD3)', dict(kw=6.0), 'Fore store: the forecastle\'s lights, the windlasses\' floodlights, the anchor light\'s local supply, sockets forward'),
    ('L08', 'P', 'Deck floodlights, helideck and boat stations (LD4)', dict(kw=14.0), 'Boat deck'),
    ('L09', 'P', 'Searchlight', dict(kw=1.0, least=10), 'Compass deck: registered'),
    ('L10', 'P', 'Spare', dict(amps=32), ''),
    ('TIE', '-', '230 V bus tie', dict(amps=250), ''),
    ('L11', 'S', 'Incomer from lighting transformer No. 2', dict(kva=100), 'Main switchboard room'),
    ('L12', 'S', 'Lighting board, main vehicle deck (LD5)', dict(kw=14.0), 'Main deck, port casing'),
    ('L13', 'S', 'Lighting board, upper deck and lower hold (LD6)', dict(kw=16.0), 'Upper deck'),
    ('L14', 'S', 'Lighting board, machinery spaces (LD7)', dict(kw=12.0), 'Engine room platform'),
    ('L15', 'S', 'Sockets and small power, accommodation (SP1)', dict(kw=15.0), 'Boat deck'),
    ('L16', 'S', 'Sockets and small power, decks and machinery (SP2)', dict(kw=10.0), 'Main deck'),
    ('L17', 'S', 'Battery chargers and automation supplies', dict(kw=8.0), 'Emergency generator room; engine control room'),
    ('L18', 'S', 'Navigation, radio and internal communication supplies', dict(kw=10.0), 'Navigation bridge; the emergency switchboard feeds the same boards'),
    ('L19', 'S', 'Control air dryer', dict(kw=0.75, least=10), 'Engine room'),
    ('L20', 'S', 'Spare', dict(amps=32), ''),
]


def way(rec, volts):
    """A way's line current, breaker and cable, from what is connected to it."""
    tag, half, name, what = rec[0], rec[1], rec[2], rec[3]
    setting = None
    if 'amps' in what:
        current = float(what['amps'])
        rating = int(what['amps'])
    else:
        current = amps(what.get('kva'), what.get('kw', 0) * what.get('share', 1.0) if 'kw' in what else None, volts)
        rating = breaker(current, what.get('least'))
    if name.startswith('Incomer') or (tag == 'TIE' and current > 630):
        setting, rating = acb(current) if name.startswith('Incomer') else (rating, rating)      # an air circuit breaker, as on the 690 V board
    n, mm2 = what['as'] if 'as' in what else cable(setting or rating)
    if 'as' in what:
        rating = what['breaker']
    return dict(tag=tag, half=half, name=name, kw=what.get('kw'), kva=what.get('kva'), share=what.get('share', 1.0), amps=round(current, 1), breaker=rating, setting=setting,
                registered='as' in what,
                cable=(n, mm2), text=rec[4] if len(rec) > 4 else '', where=rec[5] if len(rec) > 5 else (rec[4] if len(rec) == 5 else ''))


def psb():
    return [way(r, 440) for r in PSB_WAYS]


def lb():
    out = []
    for r in LB_WAYS:
        w = way((r[0], r[1], r[2], r[3], '', r[4]), 230)
        out.append(w)
    return out


def wrong():
    """What does not hold: an empty list when the board can be built as it is set down here."""
    bad = []
    w = (MSB_BOX[1] - MSB_BOX[0]) / len(MSB_PANELS)
    if abs(w - CUBICLE['wide']) > 1e-6:
        bad.append(f'the nine cubicles of the 690 V board are {w:.3f} m wide on the place marked for them, not {CUBICLE["wide"]:.2f} m')
    if PLATFORM + CUBICLE['plinth'] + CUBICLE['high'] > ROOM['head'] - 0.30:
        bad.append('the board stands less than 0.30 m under the cable trays')
    aisle = MSB_BOX[2] - PSB_BOX[3]
    if aisle < 1.0:
        bad.append(f'the aisle between the two rows is {aisle:.2f} m: a switchboard is worked from 1.0 m at least')
    for side, total in (('A', sum(p['amps'] for p in MSB_PANELS if p['kind'] == 'gen' and p['bus'].startswith('A'))),
                        ('B', sum(p['amps'] for p in MSB_PANELS if p['kind'] == 'gen' and p['bus'] == 'B'))):
        if total > BARS['amps']:
            bad.append(f'the generators on bars {side} can put {total} A onto bars of {BARS["amps"]} A')
    for half in 'PS':
        feeds = sum(x['amps'] for x in psb() if x['half'] == half and not x['name'].startswith(('Incomer', 'Spare', 'Shore')))
        can = amps(kva=800, volts=440)
        if feeds * 0.65 > can:                                   # not everything runs at once: the load list's own conditions stay under 660 kW in all
            bad.append(f'the 440 V section\'s {half} half asks {feeds * 0.65:.0f} A of a transformer of {can:.0f} A')
    for tie_, rows in (('P', lb()), ('S', lb())):
        feeds = sum(x['amps'] for x in rows if x['half'] == tie_ and not x['name'].startswith(('Incomer', 'Spare')))
        if feeds > amps(kva=100, volts=230) * 1.05:
            bad.append(f'the 230 V section\'s {tie_} half asks {feeds:.0f} A of a transformer of {amps(kva=100, volts=230):.0f} A')
    return bad


if __name__ == '__main__':
    print(f'690 V board: {len(MSB_PANELS)} cubicles of {CUBICLE["wide"]:.2f} m on {MSB_BOX[1] - MSB_BOX[0]:.2f} m; bars {BARS["amps"]} A')
    for p in MSB_PANELS:
        c = cable_text(*p['cable']) if p['cable'] else 'bars'
        print(f"  {p['no']}  {p['tag']:<4} {p['name']:<24} bus {p['bus']:<4} {p['amps']:>5} A   breaker {p['breaker']:>5} A   {c:<22} {p['to']}")
    for title, rows, volts in (('440 V section', psb(), 440), ('230 V section', lb(), 230)):
        print(f'{title}: {len(rows)} ways')
        for x in rows:
            print(f"  {x['tag']:<4} {x['half']} {x['name']:<58} {x['amps']:>7.1f} A   {x['breaker']:>5} A   {cable_text(*x['cable'])}")
    bad = wrong()
    print('holds' if not bad else 'DOES NOT HOLD: ' + '; '.join(bad))
    sys.exit(1 if bad else 0)
