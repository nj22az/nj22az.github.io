# Johansson Heights Minato (ヨハンソンハイツ港町)

The port town's apartment block, on the plot Rainflower Lane leaves. Built 1991 by Johansson Construction (Naha works) (ヨハンソン建設).

The creator (2026-10-13): "Remove rain flower lane, I want the citizens at the port town live in apartments for now. I want a cad drawing for the apartment complex so you know what to build, it should be a realistic apartment complex with plumbing and sewage and electrical wiring each apartment should be big like a hotel room for now and they should look like hotel rooms with a desk". Then: the lane’s shops on the ground floor, everyone in Minato moves in, a kitchenette in every flat.

Every sheet and table here is generated from `src/world/minato-apartments.js` by `node tools/apartment-drawings.mjs`; `tests/apartment-design-book.test.mjs` fails when a sheet is stale or a check fails. Change the data, run the tool, commit the sheets.

## Particulars

| | |
|---|---|
| Plot | x -4.5…11.1, z 30…53.6 (world); building origin (-1.4, 31) |
| Structure | Reinforced concrete, moment frame (columns and beams); RC slabs; party walls RC 180 |
| Storeys | 7: 1F 3.6 m, 2F–7F 2.9 m; roof +21 m |
| Footprint | 12.35 × 21.6 m (core 2.8 × 7.4 m on the west) |
| Flats | 36, each 3.42 × 7 m inside (23.94 m²) + 3.86 m² balcony |
| People | 49 |
| Ground floor | Blue Coral Ice Cream, Rainflower Florist, Entrance hall, Lift lobby, Caretaker’s office, Electrical room, Utility transformer room, Pump room, Bicycle store, Refuse store |
| Lift | Johansson Lifts JL-600: 9 persons, 600 kg, 60 m/min, rope traction, machine room on the roof, 7 stops |
| Water | 13.25 m³/day; tank 9 m³; booster 2 × 1.5 kW at 0.35 MPa |
| Drainage | 3 stacks 100A vented through the roof; 75-person treatment tank |
| Electricity | 6.6 kV; T1 150 kVA 1φ, T2 50 kVA 3φ; 30 A a flat |

## Sheets

| No. | Sheet | File |
|---|---|---|
| JC-H01-A-01 | Site plan | [site-plan.svg](site-plan.svg) |
| JC-H01-A-02 | Ground floor plan (1F) | [plan-1F.svg](plan-1F.svg) |
| JC-H01-A-03 | Typical floor plan (2F–7F) | [plan-typical.svg](plan-typical.svg) |
| JC-H01-A-04 | Roof plan | [plan-roof.svg](plan-roof.svg) |
| JC-H01-A-05 | Flat plans, types A and B | [flat-plan.svg](flat-plan.svg) |
| JC-H01-A-06 | Section A–A and west elevation | [section-elevation.svg](section-elevation.svg) |
| JC-H01-P-01 | Cold water supply: riser diagram | [water-supply.svg](water-supply.svg) |
| JC-H01-P-02 | Soil, waste and vent: riser diagram | [drainage.svg](drainage.svg) |
| JC-H01-P-03 | Flat plumbing plan | [flat-plumbing.svg](flat-plumbing.svg) |
| JC-H01-E-01 | Electrical single-line diagram | [single-line.svg](single-line.svg) |
| JC-H01-E-02 | Flat electrical plan | [flat-electrical.svg](flat-electrical.svg) |
| JC-H01-F-01 | Fire safety and escape | [fire-escape.svg](fire-escape.svg) |
| | Flat schedule (who lives where) | [flats.md](flats.md) |

## Findings and open points

- **AF1** (open): Town water main: assumed a 75 mm main under the plaza with 0.15 MPa or more. The town’s water today is a well rota and Mr Chinen’s water lorry; the town needs a main (or the building a larger tank filled by the lorry) before this can be built.
- **AF2** (open): Demand factor 0.45 for 36 flats is assumed; check it against the Interior Wiring Code’s table for dwellings before the transformers are ordered.
- **AF3** (open): Treatment tank sized by JIS A 3302 as recalled (flats 0.05 × floor area, shops 0.075 × floor area); confirm the edition’s figures and the outfall permit.
- **AF4** (open): Structure: columns 600 × 600 and spans of 7.2 m are a first sizing; beams, slabs and the foundation (piles in reclaimed ground near the shore?) need a structural design and a soil survey.
- **AF5** (open): Seven storeys (22 m) is twice the height of anything else in Minato: it is the town’s landmark, seen from the ferry. The creator to confirm the height; six flats a floor on this plot cannot house everyone in fewer floors.
- **AF6** (open): The lane’s ground is sunk 0.40 m; the plot is regraded to the town datum and the building stands at GL +0.10. Aoba Garden’s residential walk crosses the plot today and must be rerouted round it.
- **AF7** (open): Entrance doors open outward onto a 1.2 m corridor; set each in a 0.4 m alcove beside its shaft so an open leaf does not block the corridor (detail to draw).
- **AF8** (closed): Every flat stands over another (no transfer of stacks): the three stacks drop straight to 1F and turn under the slab; the electrical room has no water pipe over it.

## What the build batch changes in the town

Planned before building (CLAUDE.md: plan a change before making it):

- Rainflower Lane goes: `shopping-lane.js`, `shopping-lane-plan.js` (routes, ground height, landmark), its colliders, power poles and vending machine; `coastal-ground.js`, `park-access.js`, `island-plan.js`, `island-landscape.js`, `town.js` and `island/play.js` stop calling it; Aoba Garden’s residential walk is rerouted round the building.
- Blue Coral and Rainflower Florist move into 1F with their owners, stock, routines and supply accounts (`flower-shop.js`, `blue-coral-shop.js`, `neighbours.js`, `commerce/merchandising.js`); Vy’s after-school stop moves to Blue Coral’s new counter.
- Every Minato household moves to its flat (`island-households.js`, `residents.js`, `households.js`, `home-life.js`, `schedules.js`): routines go home to the building’s entrance, then the lift, then their door. A new interior for the flats from this data.
- The emptied houses (`LEFT_HOMES`) stay standing but empty, or are removed; the creator to say. Removing the Okinawan quarters’ houses is also the biggest loading saving (26 MB of geometry).
- Tests, the feed’s places, the guide, the photo spot and the tools that name the lane are moved to the building; every comic and film shot of the lane is listed by `remotion/tools/impact.py` before it changes.
