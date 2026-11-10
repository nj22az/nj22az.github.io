#!/usr/bin/env python3
"""What drawing the bridge in CAD turned up. Every number here is measured or counted from the model, the register or the
Town's data, and each finding says where from. Run it to write findings.json (and FINDINGS.md).

    python3 ferry/design/bridge/findings.py

Kinds: error (the model contradicts itself or its own data), gap (the design words or the data ask for something that is
not drawn or not specified), risk (it works, but a real ship would not have it so). Rule values quoted are recalled, not
checked against the text of the rules: they are marked so.
"""
import json
import math
import os

import numpy as np

import cutlib as C
import register as R

HERE = os.path.dirname(os.path.abspath(__file__))
SNAP = R.SNAP
ROWS = R.ROWS
DECK = 9.1
EYE = 1.6                      # the model's own bridge eye, 12.6 m above the keel (FERRY_HEIGHTS.bridgeEye)
HELM_YARD = 20.9               # a person standing at the wheel: the wheel is at yard 21.43, a stride behind it
WATER_EYE = DECK + EYE         # eye height above the laden waterline, y

F = []


def finding(kind, title, what, where=None, source='', fix='', sheet=''):
    F.append(dict(id=f'BF-{len(F) + 1:02d}', kind=kind, title=title, what=what, where=where, source=source, fix=fix, sheet=sheet))


# ------------------------------------------------------------------------------------------------ the view from the helm
tris, mats, header, group = C.group_triangles()
glass = SNAP['glass']


def bearing(x, yard):
    """Degrees from dead ahead, positive to starboard, of a point seen from the helm eye (x 0, yard HELM_YARD)."""
    return math.degrees(math.atan2(-x, yard - HELM_YARD))


def arcs():
    """Glazed arcs seen from the helm (plan view, doors shut): each pane's two edges as bearings."""
    out = []
    for g in glass:
        sx, sy, sz = g['size']
        px, py, pz = g['pos']
        yard = pz + 17.25
        if sx < 0.1:   # a pane in a side wall: runs along z
            a, b = bearing(px, yard - sz / 2), bearing(px, yard + sz / 2)
        else:          # a pane in the forward wall: runs along x
            a, b = bearing(px - sx / 2, yard), bearing(px + sx / 2, yard)
        out.append((round(min(a, b), 1), round(max(a, b), 1), g))
    return sorted(out)


def union(iv):
    iv = sorted(iv)
    m = []
    for a, b in iv:
        if m and a <= m[-1][1] + 0.01:
            m[-1][1] = max(m[-1][1], b)
        else:
            m.append([a, b])
    return m


forward = [g for g in glass if g['size'][0] > 0.1 and g['pos'][2] > 5]
side = [g for g in glass if g['size'][0] < 0.1 and abs(g['pos'][0]) > 2.9 and 2 < g['pos'][2] < 6]
wh = [(a, b) for a, b, g in arcs() if g in forward or g in side]
MULLION = 6.0                  # gaps narrower than this are mullions: the view goes on round them
cover = [c for c in union([(a, b) for a, b in wh])]
merged = []
for a, b in cover:
    if merged and a - merged[-1][1] < MULLION:
        merged[-1][1] = b
    else:
        merged.append([a, b])
LIM = 112.5                    # SOLAS V/22: right ahead to 22.5 degrees abaft the beam each side (recalled, not checked)
seen = sum(max(0.0, min(b, LIM) - max(a, -LIM)) for a, b in merged)
blind_sectors = [(round(merged[i][1]), round(merged[i + 1][0])) for i in range(len(merged) - 1)]
port_end, stbd_end = merged[0][0], merged[-1][1]
finding('risk', 'Seen from the helm the glass covers %d° of the 225° the navigation-bridge guide asks for' % round(seen),
        f'From a person standing at the wheel (x 0, yard {HELM_YARD}, eye 1.6 m above the deck) the forward windows and the side windows, doors shut and the 0.12 m mullions ignored, '
        f'show these arcs, in degrees from dead ahead (+ to starboard): ' + ', '.join(f'{a:+.0f}° to {b:+.0f}°' for a, b in merged) + '. '
        f'To port the glass ends {abs(port_end) - 90:.0f}° abaft the beam (the guide wants 22.5°); to starboard it ends at {merged[0][1] if False else [b for a, b in merged if a < 70][0]:+.0f}° and then there is wall and a doorway '
        f'until {[a for a, b in merged if a > 70][0]:+.0f}°, where a 0.5 m window looks aft. Blind sectors inside ±112.5°: ' + ', '.join(f'{a:+d}° to {b:+d}°' for a, b in blind_sectors) + '. '
        'SOLAS V/22 applies to ships of 55 m and over, so it is a benchmark here, not a rule; the 225° and 22.5° are recalled, not checked against the text.',
        where=dict(room='wheelhouse', yard=HELM_YARD, x=0.0, h=EYE), source='ferry-interior.js glass (18 panes), ferry-bridge.js; drawn on CHR-B2', sheet='B2',
        fix='Glaze the wing doors\' upper halves and the aft starboard wall panel; add glass abaft the helm; rake the forward panes')

# Obstructions on the line of sight dead ahead, from the eye.
obst = [
    ('the compass card and its brass housing', 21.6, 1.50, 1.62, 0.16),
    ('the radar hood', 22.3, 1.49, 1.52, 0.50),
    ('the console top with its cream strip', 22.92, 1.00, 1.03, 5.5),
]


def blind(dist, top):
    """The sea is hidden out to this many metres from the eye behind an obstruction of height `top` (above the deck)
    `dist` metres ahead, seen from an eye at EYE (metres above the deck): the line of sight meets the water here."""
    dip = EYE - top
    if dip <= 0:
        return float('inf')
    return WATER_EYE * dist / dip


def fmt(name, yard, lo, hi, width, x=0.0):
    d = yard - HELM_YARD
    arc = 2 * math.degrees(math.atan2(width / 2, d))
    brg = math.degrees(math.atan2(-x, d))
    where = 'dead ahead' if abs(brg) < 3 else f'{abs(brg):.0f}° to {"starboard" if brg > 0 else "port"}'
    if hi >= EYE:
        low = blind(d, lo)
        return (f'{name} ({lo:.2f}–{hi:.2f} m above the deck) stands level with or above the eye, {d:.1f} m ahead, {where}, across {arc:.0f}° of the horizon; '
                f'it hides the sea out to {low:.0f} m from the eye')
    far = blind(d, hi)
    return f'{name} ({lo:.2f}–{hi:.2f} m, {d:.1f} m ahead, {where}, {arc:.0f}° wide) hides the sea out to {far:.0f} m from the eye'


bow = 34.5 - HELM_YARD
lines = [fmt('the compass card and its brass housing', 21.6, 1.50, 1.62, 0.16), fmt('the radar hood', 22.3, 1.49, 1.52, 0.50, x=-0.95)]
lines.append(f'the console top with its cream strip (1.00–1.03 m, 2.0 m ahead, across the whole forward arc) hides the sea out to {blind(22.92 - HELM_YARD, 1.03):.0f} m from the eye, '
             f'which is {blind(22.92 - HELM_YARD, 1.03) - bow:.0f} m ahead of the bow')
finding('risk', 'The compass card and its housing stand on the line of sight dead ahead',
        'Measured from the model, with the eye 1.6 m above the deck and the helm at yard 20.9: ' + '; '.join(lines) + '. '
        'The ship is 34.5 m long, so 70 m is two ship lengths: the heading readout at 1.51–1.59 m, 0.7 m ahead of the eye, is the only thing at eye height in the sector right ahead.',
        where=dict(room='wheelhouse', yard=21.6, x=0.0, h=1.55), source='ferry-bridge.js:57 (compass card), ferry-interior.js (brass block x ±0.08, h 1.50–1.62); CHR-B2 section', sheet='B2',
        fix='Move the heading display overhead or low in the stand (below 1.2 m), or into the repeater panel; keep the periscope tube above the eye')

# ------------------------------------------------------------------------------------------------------- the model's own errors
finding('error', 'The two engine levers are crossed',
        'ferry-bridge.js draws "Port" at x +0.20 and "Starboard" at x +0.40; x is positive to port, so the starboard lever stands to port of the port lever. '
        'Facing forward, a helmsman has the starboard lever on his left and the port lever on his right.',
        where=dict(room='wheelhouse', yard=22.6, x=0.3, h=1.1), source='ferry-bridge.js:44 ([.2,\'mainP\',\'Port\'],[.4,\'mainS\',\'Starboard\']); register B076/B077', sheet='B2',
        fix='Port lever at x +0.4, starboard at x +0.2 (or both on the centreline, port to port); the engine-order repeater reads the same way round')
au = [a for a in SNAP['audit']]
finding('error', f'The Town\'s own audit still lists {len(au)} findings on this deck',
        '; '.join(f"{a['n']} {a['what']} ({a['space']})" for a in au) + '. All eight are open in the model that the page shows.',
        where=dict(room='mate-cabin', yard=10.9, x=-2.65, h=0.3), source='tools/ferry-audit.mjs auditFerry(), Town f0b2973', sheet='B1',
        fix='Move the desk 25 cm; rest the day tank on a shelf or hang it from the deckhead; trim the pieces inside the bunks')
pc = [p for p in SNAP['pieces'] if p['space'] == 'wheelhouse' and p['hex'] == 0x2a2f31]
if len(pc) >= 2:
    a, b = pc[0], pc[1]
    ov = [round(min(a['hi'][k], b['hi'][k]) - max(a['lo'][k], b['lo'][k]), 2) for k in (0, 2, 1)]
    if min(ov) > 0:
        finding('error', 'Two unnamed dark boxes on the console stand inside one another',
                f'x +1.40..+1.90 and x +1.30..+1.75 at yard 22.45–22.75, 1.0–1.25 m above the deck, overlap by {ov[0]:.2f} × {ov[1]:.2f} × {ov[2]:.2f} m (x, yard, h). They are drawn where the VHF, NAVTEX and telephone would be, and named by nobody.',
                where=dict(room='wheelhouse', yard=22.6, x=1.6, h=1.1), source='ferry-interior.js (unnamed boxes); register B092', sheet='B2',
                fix='Replace by the named sets (VHF with DSC, NAVTEX, telephone)')
finding('error', 'The galley range is tagged as drinking water',
        'The range is 10GKB30 AH001 and the galley appliances 10GKB30 GS001; GKB is the Town\'s own key for drinking-water distribution (the hydrophore), and a cooking range is not water. '
        'The galley\'s water heater is 10GKB20 AC001, which is right.', where=dict(room='galley', yard=14.6, x=-2.62, h=0.45),
        source='ferry-electrical.js TAGS (range, galley-appliances); ferry-kks.js GKB; register B061/B064', sheet='B1',
        fix='Give cooking its own function key under the accommodation, yard-allocated, so a tag search for water never finds a range')
finding('error', 'The crew WC and shower have no place of their own in the water and waste data',
        'Their basin and shower water is the node "toilets" (10GKB20 BR002, where: toilets) and their flush is "flush" (10GHB10 BR001, where: toilets), both on the passenger deck; '
        'the toilet fans are also "toilets". The only bridge-deck fittings in the drawing, a WC and a basin, therefore have tags that point two decks down.',
        where=dict(room='crew-wc', yard=12.9, x=-1.7, h=0.8), source='ferry-piping.js 170–181; ferry-electrical.js TAGS toilet-fans; register B049–B052', sheet='B4',
        fix='Add crew-WC nodes (hot, cold, flush, soil, extract fan) located in crew-wc')

# ------------------------------------------------------------------------------------------------- design words against drawn
stat = {}
for r in ROWS:
    stat.setdefault(r['status'], []).append(r)
designed = stat.get('designed', [])
from collections import Counter


def names(rows):
    c = Counter(r['item'] for r in rows)
    return '; '.join(n + (f' (× {k})' if k > 1 else '') for n, k in c.items())


data_only = stat.get('data only', [])
finding('gap', f'{len(designed)} items the design words name are not drawn, and {len(data_only)} more are in the data only',
        'Not drawn: ' + '; '.join(f"{r['item']} ({r['room']})" for r in designed) + '. In the data (tags, loads, pipe lines) but not drawn: ' + names(data_only) + '.',
        source='ferry-ship.js FERRY_GA (design words), ferry-electrical.js, ferry-piping.js; register status "designed" and "data only"', sheet='B3',
        fix='Build them in section 5 from the register; each row says what it must connect to')
finding('gap', 'The wheelhouse has no thruster lever, no autopilot, and neither wing console',
        'The design words give the wheelhouse "two engine levers and the thruster lever at the centre and on both wing consoles". Drawn: the two engine levers at the centre (crossed); nothing at the wings. '
        'The wings are 1.1 m wide with two rails and no console, so the berthing position the design words describe is not there.',
        where=dict(room='wing-p', yard=21.2, x=3.55, h=1.0), source='ferry-ship.js:134-136; ferry-bridge.js:44-49; register B075–B079, B107, B109', sheet='B2',
        fix='A console on each wing at the wing door, levers, a rudder-angle and engine repeater, a watertight cover')

# ----------------------------------------------------------------------------------------------------------------- doors
finding('risk', 'The cabin doors are 0.70 m wide; every other door on the deck is 0.80 m',
        'Measured in the model\'s cut 1.0 m above the deck: eight cabin doorways of 0.70 m (yards 9.2–9.9, 11.7–12.4, 14.2–14.9 and 16.7–17.4, both sides) off a corridor 0.90 m wide; '
        'the corridor door, the aft doors to the EG and CO₂ rooms, the crew stair opening and both wing doors are 0.80 m. Door heads are at 1.92–1.95 m (the crew stair opening is lower: next finding).',
        where=dict(room='corridor', yard=13.0, x=0.0, h=1.0), source='plan cut of ferry/data/ferry.bin.gz (bridge group) at y = 10.1; CHR-B1', sheet='B1',
        fix='0.80 m for the crew\'s escape doors; the guide value is recalled, not checked against the rules')
finding('error', 'The wing doors are drawn as plates laid beside their doorways, over a window and a wall',
        'Port: the doorway is yard 19.60–20.40 and the leaf (0.75 m) stands at 20.45–21.20, flat inside the wall over the 1.0 m window at 20.60–21.60. '
        'Starboard: the doorway is 20.45–21.25 and the leaf at 21.30–22.05 lies against a solid wall panel. The leaves are single plates with no frame, hinge, handle or glass, and neither sits in a sill.',
        where=dict(room='wheelhouse', yard=21.0, x=2.9, h=1.0), source='ferry-interior.js "wing door" x2, wall boxes; register B104', sheet='B2',
        fix='A real weathertight door in each doorway with a coaming sill, hinges, dogs and a glazed upper half; the leaf swings out or in without covering a window')

finding('error', 'The opening from the wheelhouse to the crew stair is 1.50 m high',
        'In the wheelhouse\'s aft wall at x −2.92..−2.12 (0.80 m wide) the wall piece above the opening starts 1.50 m above the deck; every other doorway on the deck has its head at 1.92–1.95 m. '
        'A person of average height strikes the lintel; this is the stair the crew use between the bridge and the passenger deck, and the walk through it (Town issue "crew stair headroom") needed a stoop.',
        where=dict(room='wheelhouse', yard=19.5, x=-2.5, h=1.5), source='ferry-interior.js wall box x −2.92..−2.12, z 2.21–2.29, h 1.50–2.20; plan and cut of the model; CHR-B2', sheet='B2',
        fix='Raise the lintel to 1.95 m (the deckhead, the roof slab\'s underside, is at 2.08 m)')

# ---------------------------------------------------------------------------------------------------------- electrical
feeders = SNAP['feeders']
finding('gap', 'The ship has 59 feeders and not one is direct current; the 24 V board has no consumers',
        'FERRY_FEEDERS is all 440 V or 105 V (59 of 59). The 24 V board 10BTA10 GS001 ("starting batteries, radio and emergency batteries, chargers") has chargers, and the emergency charger is named for "radio, fire detection, alarm", '
        'but no feeder leaves the batteries. In the wheelhouse the VHF with DSC, the alarm panel, the compass and chart lamps and the EG\'s starter all want 24 V.',
        where=dict(room='eg-room', yard=6.5, x=2.65, h=0.3), source='ferry-electrical.js FERRY_FEEDERS, chargers; register B003, B075, B090, B093', sheet='B4',
        fix='A 24 V radio/emergency distribution with fused feeders to the wheelhouse and a cable-number series 2001–2499')
be = {f['id']: f for f in feeders}['bridge-electronics']
lc = {f['id']: f for f in feeders}['light-crew']
instr = [r for r in ROWS if r['room'] == 'wheelhouse' and r['cls'] in ('navigation', 'safety', 'machinery')]
finding('gap', f'One {be["kW"]} kW feeder serves six named wheelhouse systems and a second, {lc["kW"]} kW, lights the whole deck',
        f'bridge-electronics ("radar, autopilot, echo sounder, GPS, NAVTEX, PA"): {be["kW"]} kW, {be["amps"]} A, {be["cable"]}, {be["length"]} m, {be["drop"]} % drop against the Town\'s own 5 % feeder budget, '
        f'for the {len(instr)} navigation, safety and control items the register lists in the wheelhouse. The VHF with DSC, the ship\'s telephone, the repeater panel, the whistle, the ramp lamps and the lever solenoids are named by no feeder; '
        f'the three wiper motors have none. "light-crew" ("lighting: bridge, mess, galley, cabins") is {lc["kW"]} kW, {lc["amps"]} A on {lc["cable"]}, {lc["length"]} m for the whole deck: no wheelhouse, wing, cabin or EG-room circuit of its own, no sockets for the mess television or the kettle.',
        where=dict(room='wheelhouse', yard=22.6, x=0.0, h=1.2), source='ferry-electrical.js FERRY_FEEDERS bridge-electronics, light-crew; ferry-bridge-wipers.js; register', sheet='B4',
        fix='A distribution panel in the wheelhouse with a fused way per instrument; per-room lighting and socket circuits')
finding('gap', 'No fire-detection loop, no general-alarm circuit and no detector exists, though the key CSA does',
        'The Town defines CSA ("fire detection and alarm"), the 24 V emergency charger is named for "radio, fire detection, alarm", and the design words list a fire panel, the PA and general alarm and a CO₂ cabinet that "sounds the alarm and stops the fans"; '
        'no load, feeder or cable in the tables is tagged CSA, the CO₂ cabinet\'s alarm line has no cable, and no detector or call point is drawn in any of the nine rooms and the corridor.',
        where=dict(room='wheelhouse', yard=19.56, x=-1.3, h=1.8), source='ferry-kks.js CSA; ferry-electrical.js emergency-charger; ferry-piping.js co2rel→co2al; register B022 etc.', sheet='B4',
        fix='Detector loops (cables 4501–5999), an alarm panel with its own battery, bells and speakers on the emergency board')

# ------------------------------------------------------------------------------------------------------------- plumbing
finding('gap', f'Not one of the {len(SNAP["pipingLines"])} pipe lines that serve the bridge deck is drawn on it',
        f'{SNAP["pipesDrawnOnBridge"]} pipes in the model stand on or above the bridge deck. The Town\'s own route check calls {len(SNAP["routeIssues"])} of the {len(SNAP["pipingLines"])} lines unresolved: '
        + '; '.join(f"{i['line'].split('#')[0]} ({i['reason']})" for i in SNAP['routeIssues']) + '.',
        where=dict(room='galley', yard=14.6, x=-2.6, h=1.0), source='ferry-interior.js pipes / engineeringPipes / pipeRouteIssues; pipes.csv', sheet='B4',
        fix='Route DN50 fire main, DN20/15 fresh water, DN32/100 flush and soil, the CO₂ line, through the casing trunk and along the deckhead; resolve each of the 11')
finding('gap', 'Every waste water on the deck has nowhere to go',
        'The galley sink, the basin, the shower (not drawn), the fridge-freezer defrost, the hood and the four air-conditioning units\' condensate all produce grey water; '
        'the only waste system in the Town\'s tables is the flush to the sewage holding tank (soil from the WCs; the overboard is sealed). No node of FERRY_PIPING is a sink, a shower, a drain or grey water.',
        where=dict(room='galley', yard=15.45, x=-2.62, h=0.45), source='ferry-piping.js sewage system (sp1, sp2, flush, htank); register B050, B051, B059, B063, B064', sheet='B4',
        fix='A grey-water collector to the 4 m³ sewage holding tank (the Town lets nothing overboard in the strait), with traps at every fitting')
# hydrant reach
HYD = (3.55, 20.0)                  # a hydrant on the port wing at the aft end (the Town gives only "wing-p")
DOOR = (3.0, 20.0)
CORR = (0.0, 19.5)


def reach(room_yard, doorway_x, indoors=1.5):
    d = math.dist(HYD, DOOR) + math.dist(DOOR, CORR) + (19.5 - room_yard)
    return round(d + 0.9 + indoors, 1)


routes = []
for room, yard in (('master-cabin', 17.05), ('chief-cabin', 17.05), ('mess', 14.55), ('galley', 14.55), ('deckhand-cabin', 12.05),
                   ('crew-wc', 12.05), ('crew-cabin', 9.55), ('mate-cabin', 9.55)):
    routes.append((room, reach(yard, 0)))
eg = round(math.dist(HYD, DOOR) + math.dist(DOOR, CORR) + (19.5 - 6.0) + 1.6 + 1.5, 1)
routes += [('eg-room (door on the open deck)', eg), ('co2-room (door on the open deck)', eg)]
over = [f'{n} {d} m' for n, d in routes if d > 15]
finding('risk', 'One hydrant and a 15 m hose do not reach the aft half of the bridge deck',
        'The Town has one hydrant on the bridge deck (10SGA30 AA518, "wing-p", 15 m hose, 12 mm nozzle). Taking it at the aft end of the port wing and laying the hose through the wing door, the wheelhouse and the corridor, '
        'the laid length to a point 1.5 m inside each room is: ' + '; '.join(f'{n} {d} m' for n, d in routes) + '. Over 15 m: ' + ', '.join(over) + '. '
        'The hose\'s jet adds a few metres; a second hydrant, or a hose box at the aft platform, is the usual answer.',
        where=dict(room='wing-p', yard=20.0, x=3.55, h=1.0), source='ferry-piping.js:134 hBridge; plan distances on CHR-B1; the hydrant\'s place on the wing is assumed', sheet='B1',
        fix='A second hydrant at the aft platform; or the main brought up the aft stair; check against the fire-control plan')
finding('gap', 'The emergency generator has no fuel, exhaust or vent in any table',
        'The 60 L day tank is a drawn box (a Town audit finding: it rests on nothing); no node of the fuel system feeds or returns it, the generator has no exhaust, and the "louvres" of the design words are not drawn. '
        'The room\'s only door opens to the weather deck.', where=dict(room='eg-room', yard=6.4, x=0.8, h=1.6),
        source='ferry-piping.js fuel system (no EG node); ferry-interior.js day tank; register B001, B007–B009', sheet='B4',
        fix='A DN15 fill from the transfer pump and a return, an overflow and a vent; an exhaust through the aft wall or the deckhead; louvres with closing flaps')


STATUS = [
    ('glass covers', 'Done 11 November 2026 (wheelhouse.py): the wing doors are glazed in their upper halves and the starboard wall has its window; measured on the built model, the glass shows 224° of the 225°.'),
    ('compass card', 'Done 11 November 2026: the heading readout is low on the stand (0.84–1.0 m), the compass is read in a periscope at 1.84–1.95 m, the displays top out at 1.33 m.'),
    ('engine levers', 'Done 11 November 2026: port lever at x +0.45, starboard at +0.25, the thruster lever at −0.15.'),
    ('unnamed dark boxes', 'Done 11 November 2026: replaced by the named VHF, telephone and NAVTEX.'),
    ('thruster lever', 'Done 11 November 2026 for the thruster lever, the autopilot head and both wing consoles; the VHF, telephone and NAVTEX are built too; the alarm panel is the Town\'s (kept).'),
    ('wing doors', 'Done 11 November 2026: two hinged weathertight doors with a 0.15 m sill, a glazed upper half, handles and hinges, opening outward for whoever comes near.'),
]


def status_of(f):
    for key, text in STATUS:
        if key in f['title']:
            return text
    return ''


def markdown():
    out = ['# What drawing the bridge in CAD turned up', '',
           f'Generated by `findings.py` from the Town at commit `{SNAP["source"]["commit"]}` and `ferry/data/ferry.bin.gz`. {len(F)} findings: '
           + ', '.join(f'{n} {k}' for k, n in sorted({k: sum(1 for f in F if f['kind'] == k) for k in ('error', 'gap', 'risk')}.items())) + '. '
           '*error*: the model contradicts itself or its data; *gap*: asked for, not drawn or not specified; *risk*: it works, a real ship would not have it so.', '']
    for f in F:
        out += [f"## {f['id']} · {f['kind']} · {f['title']}", '', f['what'], '', f"- Where from: {f['source']}" + (f" · drawn on CHR-{f['sheet']}" if f['sheet'] else ''), f"- To do: {f['fix']}"]
        if f.get('status'):
            out.append(f"- **{f['status']}**")
        out.append('')
    return '\n'.join(out)


def main():
    for f in F:
        f['status'] = status_of(f)
    open(os.path.join(HERE, 'FINDINGS.md'), 'w').write(markdown())
    json.dump(dict(source=SNAP['source'], count=len(F), findings=F), open(os.path.join(HERE, 'findings.json'), 'w'), indent=1, ensure_ascii=False)
    kinds = {}
    for f in F:
        kinds[f['kind']] = kinds.get(f['kind'], 0) + 1
    print(len(F), kinds)
    for f in F:
        print(f"{f['id']} [{f['kind']}] {f['title']}")


if __name__ == '__main__':
    main()
