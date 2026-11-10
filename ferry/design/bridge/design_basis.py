#!/usr/bin/env python3
"""A realistic wheelhouse for the Christina: where every item of the design words goes, and why. Writes design-basis.json,
the positions section 5 of the Blender build will read (a future ferry/blender/bridge.py), and drawn on CHR-B6.

    python3 ferry/design/bridge/design_basis.py

The envelope is the one she has (wheelhouse x ±3.0, yard 19.5–23.0, deck 11.0, deckhead 13.4 m above the keel; wings
x 3.0–4.1 to each side, yard 19.5–23.0); only its fittings move. Axes: x to port of the centreline (so the drawing, looking
forward, has port on the left), yard from the transom, h above the deck. Sizes are (x, yard, h) in metres; h is the height of the item's underside above the deck.

What it is based on, and how far:
  - Ranger III (HAER MI-432 sheet 4, a 50 m twin-screw passenger and cargo vessel): read off the sheet at 75 px per foot,
    to within 0.2 m. Her pilot house is 5.9 m wide and 4.8 m deep with a rounded front glazed all round and a door to each wing
    (three steps up from the wing), a steering stand on the centreline 0.63 × 0.95 m with a seat beside it, the master engine
    controls ahead and to port, the radar to starboard, the compass ahead of the stand, a chart table 1.07 × 1.54 m
    aft against the bulkhead, a rack of equipment aft to starboard, and the master's sea cabin directly aft with its own stair.
  - The Town's design words for the room (FERRY_GA wheelhouse, wings), every item of which is placed.
  - Rules of the arrangement of a bridge, as practice, not as the text of any rule (recalled, not checked): the conning
    position has an all-round view with the sea visible from within about one ship length of the bow; nothing at eye level
    dead ahead; the engine, thruster and steering controls within reach of one person at the centre and duplicated on the wings;
    equipment below the sight line or overhead; the chart table clear of the glare of the glass; every item reachable on a
    separate fused supply.
"""
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
YARD = 17.25

# (register id or None, item, x, yard, h, (sx, syard, sh), why, the change from what is drawn)
ITEMS = [
    ('B073', 'Steering stand with wheel, NFU lever and autopilot head', 0.0, 21.75, 0.0, (0.60, 0.50, 0.95), 'Centreline conning position, as Ranger III; the wheel on a horizontal shaft, 1.05 m up; NFU lever and autopilot head on the stand\'s top', 'widen to 0.60 (Ranger III 0.63); add the two missing controls'),
    ('B074', 'Helm wheel, eight spokes', 0.0, 21.43, 0.76, (0.58, 0.07, 0.58), 'Rim below the eye (1.34 m top)', 'keep'),
    ('B075', 'Heading readout low on the stand\'s face', 0.0, 21.52, 0.85, (0.22, 0.03, 0.14), 'The helmsman reads it by looking down, not through it', 'MOVE from 1.50–1.62 m dead ahead to 0.85 m'),
    ('B084', 'Compass periscope eyepiece, overhead', 0.0, 21.55, 2.05, (0.20, 0.20, 0.15), 'A magnetic compass is read in a periscope or a reflector at the deckhead, above the eye', 'MOVE overhead (2.0–2.2 m): clears the horizon'),
    ('B076', 'Engine lever, port', 0.45, 22.60, 1.0, (0.12, 0.30, 0.25), 'The port lever to the port side of the starboard one', 'MOVE to x +0.45 (it was at +0.20: crossed)'),
    ('B077', 'Engine lever, starboard', 0.25, 22.60, 1.0, (0.12, 0.30, 0.25), 'As above', 'MOVE to x +0.25 (it was at +0.40)'),
    ('B078', 'Thruster lever', -0.15, 22.60, 1.0, (0.12, 0.30, 0.25), 'Beside the engine levers, within one hand\'s reach of them', 'ADD'),
    ('B083', 'Engine and heading repeater panel', 0.35, 22.82, 1.15, (0.86, 0.12, 0.25), 'Forward of the levers, tilted back 20°', 'keep, tilt'),
    ('B081', 'Radar display', -1.05, 22.45, 1.05, (0.46, 0.30, 0.28), 'Starboard forward, as Ranger III; screen tilted, top at 1.33 m so the hood no longer stands at eye level', 'LOWER the hood from 1.52 to 1.33 m; move 0.1 m inboard'),
    ('B082', 'Echo sounder and GPS plotter', 1.75, 22.45, 1.05, (0.60, 0.30, 0.28), 'Port forward, an arm\'s length from the engine levers; inboard of where the sounder was (x +2.4)', 'MOVE inboard, add the plotter on the same bracket'),
    ('B093', 'VHF with DSC and handset', -1.95, 22.55, 1.0, (0.35, 0.28, 0.20), 'Starboard end, within reach of the starboard wing door', 'ADD'),
    ('B094', 'Ship\'s telephone and sound-powered phone', -2.35, 22.55, 1.0, (0.25, 0.28, 0.20), 'With the VHF; engine room and control booth', 'ADD'),
    ('B095', 'NAVTEX printer', 2.35, 22.55, 1.0, (0.30, 0.28, 0.20), 'Port end', 'ADD'),
    ('B085', 'Navigation-light panel (four double-pole switches)', -1.55, 22.30, 0.75, (1.05, 0.10, 0.25), 'On the console\'s aft face, below the sight line, starboard of the radar', 'MOVE from x −2.05 to −1.55 (VHF takes the end)'),
    ('B100', 'Searchlight handle', -0.60, 22.60, 1.0, (0.15, 0.20, 0.30), 'Beside the thruster lever; pan and tilt to the compass deck', 'ADD'),
    ('B099', 'Whistle push and fog-signal switch', 0.85, 22.60, 1.0, (0.12, 0.12, 0.10), 'Near the engine levers, in the master\'s hand', 'ADD'),
    ('B098', 'Ramp lamp board, lane signals', 1.25, 22.50, 1.0, (0.40, 0.25, 0.15), 'Where the master can see it with the ramp ahead', 'ADD'),
    ('B080', 'Console, 5.5 m, top at 1.0 m', 0.0, 22.61, 0.0, (5.50, 0.62, 1.00), 'Keeps its place; its top and the glass sill at 0.97 m become a 10 cm gap with a flush trim, no light on the glass', 'keep'),
    ('B089', 'Master\'s high chair', 1.05, 21.55, 0.0, (0.50, 0.48, 1.20), 'Port of the stand, as Ranger III\'s seat beside the stand', 'keep'),
    ('B087', 'Chart table, 0.95 × 0.60', -1.48, 19.84, 0.0, (0.95, 0.60, 0.95), 'Against the aft bulkhead, starboard, with its lamp over; a folded half-chart fits', 'keep; lamp shade red'),
    ('B090', 'Fire and alarm panel', -1.30, 19.56, 1.55, (0.80, 0.08, 0.50), 'Over the chart table on the aft wall, where it is now; 24 V and detector loops behind it', 'keep; name it, give it a 24 V supply'),
    ('B097', 'PA and general alarm handset', -0.65, 19.56, 1.35, (0.20, 0.08, 0.20), 'Between the fire panel and the corridor door', 'ADD'),
    ('B101', 'Clock, barometer, inclinometer', 1.95, 19.56, 1.90, (0.60, 0.05, 0.25), 'Aft wall, port, above the log desk', 'ADD'),
    ('B102', 'Log desk (fold-down)', 1.95, 19.70, 0.90, (0.80, 0.40, 0.04), 'Aft wall, port, beside the open corridor door', 'ADD'),
    ('B104', 'Wing doors, hinged, glazed upper half, 0.15 m sill', 3.0, 20.0, 0.0, (0.06, 0.80, 1.95), 'Real leaves in the doorways, swinging out onto the wing so they cover no window; the sill keeps the weather out; glass makes the arc from the helm whole', 'REPLACE the plates laid beside the doorways'),
    ('B104', 'Starboard wing door, same', -3.0, 20.85, 0.0, (0.06, 0.80, 1.95), 'As above', 'REPLACE'),
    ('B105', 'Starboard wall panel glazed, 0.90 m', -3.0, 21.7, 0.97, (0.06, 0.90, 0.86), 'The solid panel at yard 21.25–22.15 hides +67° to +83° from the helm; the port side has a window there', 'ADD glass'),
    ('B107', 'Port wing console, 0.90 × 0.45', 3.55, 22.78, 0.0, (0.90, 0.45, 1.00), 'At the wing\'s forward end: engine and thruster levers, rudder and rpm repeater, a weathertight lid', 'ADD'),
    ('B109', 'Starboard wing console', -3.55, 22.78, 0.0, (0.90, 0.45, 1.00), 'As to port', 'ADD'),
    ('B108', 'Port sidelight (red) on a screen', 4.05, 22.90, 1.20, (0.15, 0.15, 0.20), 'At the wing end, 112.5° arc, screened', 'MOVE to the wing from the exterior'),
    ('B110', 'Starboard sidelight (green) on a screen', -4.05, 22.90, 1.20, (0.15, 0.15, 0.20), 'As to port', 'MOVE'),
    ('B111', 'Float-free EPIRB in its bracket', -3.05, 22.40, 2.05, (0.20, 0.20, 0.35), 'On the starboard wing\'s house wall above the window, clear of rails and overhead', 'ADD'),
]

# The glass that makes the view whole (plan: the pane's two ends along the wall, x, yard)
GLASS_NEW = [('port door', 3.0, 19.65, 20.35), ('starboard door', -3.0, 20.50, 21.20), ('starboard panel', -3.0, 21.35, 22.05)]

RAKE_DEG = 10.0   # the forward glass leaning out at the top: head at yard 23.0 + 0.96·tan(10°) = 23.17; the slab edge is 23.16


def rake_head():
    return round(23.0 + 0.96 * math.tan(math.radians(RAKE_DEG)), 2)


def view_after(findings_module):
    """The arcs seen from the helm once the doors and the starboard panel are glazed: merged arcs, degrees from dead ahead."""
    FD = findings_module
    arcs = [(a, b) for a, b, g in FD.arcs() if g in FD.forward or g in FD.side]
    for _, x, y0, y1 in GLASS_NEW:
        a, b = FD.bearing(x, y0), FD.bearing(x, y1)
        arcs.append((min(a, b), max(a, b)))
    cover = FD.union(arcs)
    merged = []
    for a, b in cover:
        if merged and a - merged[-1][1] < FD.MULLION:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    seen = sum(max(0.0, min(b, FD.LIM) - max(a, -FD.LIM)) for a, b in merged)
    return merged, seen


def main():
    import findings as FD
    merged, seen = view_after(FD)
    out = dict(
        note=__doc__.strip().split('\n')[0],
        envelope=dict(x=[-3.0, 3.0], yard=[19.5, 23.0], wing_x=[3.0, 4.1], deck_above_keel=11.0, deckhead_above_keel=13.4),
        rake=dict(deg=RAKE_DEG, head_yard=rake_head(), slab_edge_yard=23.16),
        view=dict(eye=dict(x=0.0, yard=FD.HELM_YARD, h=1.6), arcs_now=[[round(a), round(b)] for a, b in FD.merged], arcs_after=[[round(a), round(b)] for a, b in merged],
                  seen_now=round(FD.seen), seen_after=round(seen)),
        items=[dict(register=r, item=i, x=x, yard=y, h=h, size=list(sz), why=w, change=c) for r, i, x, y, h, sz, w, c in ITEMS],
        glass_new=[dict(name=n, x=x, yard=[a, b]) for n, x, a, b in GLASS_NEW],
        ranger_iii=dict(source='HAER MI-432 sheet 4 (LoC mi0766), read at 75 px/ft, ±0.2 m', pilot_house_width=5.9, pilot_house_depth=4.8, chart_table=[1.07, 1.54],
                        steering_stand=[0.63, 0.95], wing_door_steps=3, sea_cabin='directly aft, own stair'),
    )
    json.dump(out, open(os.path.join(HERE, 'design-basis.json'), 'w'), indent=1, ensure_ascii=False)
    print(f'{len(ITEMS)} items; glazed arc from the helm {round(FD.seen)}° now, {round(seen)}° after; rake head at yard {rake_head()}')
    print('arcs after:', [[round(a), round(b)] for a, b in merged])


if __name__ == '__main__':
    main()
