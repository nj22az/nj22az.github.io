# The Minato Maru (みなと丸): the design book

The creator, 2026-10-12: *"The ferry needs to be built like a realistic ferry in the 90's, the cartoon cel shading is just
to make it more fun. Be a naval ship architect and build the ferry as a real ferry would be built and make drawings, one
should be able to build a real ferry from our documentation."*

This folder is that documentation. Every drawing and table here is **generated from the ship's data** by
`tools/ferry-drawings.mjs` (`node tools/ferry-drawings.mjs`; the test `tests/ferry-design-book.test.mjs` fails when a
committed sheet no longer matches the data), so the ship in the game, the ship in the drawings and the ship in the stories
are one ship. The data: `src/world/ferry-ship.js` (particulars, general arrangement, machinery, electrics, loads, safety,
manning), `src/world/ferry-model.js` (the hull's lines), `src/world/ferry-interior.js` (every bulkhead, door, stair and
fitting inside her, as walked). The shipbuilder's brief behind the data is `briefs/ferry-audit.md`; the batches that built
her are in `docs/FERRY-AUDIT.md`.

## Principal particulars

| | |
|---|---|
| Name, port of registry | Minato Maru (みなと丸), Minato |
| Owner | Minato-chō (the town ferry, 町営フェリー) |
| Type | Passenger ship and vehicle ferry, bow ramp only, twin screw (旅客船兼自動車渡船) |
| Built, refit | 1994, a small Seto Inland Sea yard; 1998 GMDSS |
| Rules, area | Ship Safety Act (船舶安全法) and regulations; NK class at the insurer's request; limited coastal (限定沿海) |
| Length overall / between perpendiculars | 34.5 m / 31.0 m |
| Breadth moulded / depth to car deck | 8.4 m / 3.0 m |
| Draft, laden / service | 1.9 m / 1.7 m |
| Freeboard to the car deck, laden | 1.1 m |
| Gross tonnage | 199 |
| Displacement laden / lightship / deadweight (data) | 283 t / 210 t / 73 t **(see finding 1)** |
| Passengers / vehicles / crew | 100 / 6 cars (or an 8 t truck and two cars, or eight kei trucks) / 8 |
| Speed, service / trial | 11.5 kn / 12.8 kn |
| Main engines | 2 × 460 kW (625 PS) at 1 350 rpm, six-cylinder four-stroke medium-speed diesels, 160 × 200 mm, turbocharged and intercooled, air start |
| Gearing, propellers | 3:1 reverse-reduction gearboxes; 2 × four-bladed fixed-pitch aluminium-bronze propellers 1.45 m, 450 rpm, outward turning |
| Rudders, steering | 2 spade rudders 0.75 m² behind the propellers; electro-hydraulic, 2 × 2.2 kW units, hand pump |
| Bow thruster | 75 kW, 0.9 m tunnel, 10 kN |
| Generators | 2 × 125 kVA (100 kW) 445 V 60 Hz; emergency 40 kVA; 24 V batteries; 50 kVA shore supply at Minato |
| Fuel, fresh water | 15 m³ A-heavy oil (16 days); 12 m³ fresh water (filled every fifth morning) |
| Metacentric height, loaded (data) | 1.6 m **(see finding 1)** |

## The sheets

| Sheet | File | What it is |
|---|---|---|
| 1 | `lines-plan.svg` | Sheer plan, half-breadth plan and body plan, 21 stations, buttocks and waterlines |
| 1a | `offsets.md` | Table of offsets: half-breadths at every station and waterline, keel and deck heights |
| 1b | `hydrostatics.md` | Displacement, LCB, KB, BM, KM, waterplane, TPC, MCT and the form coefficients by draft, and the check against the particulars |
| 2 | `general-arrangement.svg` | Profile and the five deck plans: every space of `FERRY_GA` |
| 3 | `electrical-one-line.svg` | Generation, main and emergency switchboards, transformers, feeders |
| 3a | `electrical-load.md` | The electric load analysis (電力調査表): every consumer in the five conditions |
| 4 | `tanks.md` | Tank plan and capacities |

The contents of each space, and why it is where it is, are the `what` and `why` of each `FERRY_GA` entry (read them in
`src/world/ferry-ship.js`); the inside of each space as built, to the centimetre, is `src/world/ferry-interior.js`.

## Findings (what a yard would send back)

1. **The hull displaces more than the particulars say.** Integrated from the loft, the hull at the laden draft of 1.9 m
   displaces **375 t** with a block coefficient of **0.71** and a waterplane coefficient of 0.95; the particulars say 283 t
   and 0.56. The loft is boxy: a parallel middle body from 1.5 m to 28.5 m from the transom (27 m of 34.5 m), full
   waterlines right to the ends, a 0.6 m bilge. A real ferry of this length and beam would be between the two: a block
   coefficient of about 0.60–0.65 and 310–340 t laden. Either the hull is faired finer at both ends (the model changes:
   a visual batch of its own, with the game's ferry walked and photographed after it) or the particulars are corrected to
   the hull. The naval architect's answer is the first, with a **weight estimate** (lightship by group: hull steel,
   outfit, machinery; deadweight: six cars or the truck, a hundred passengers, fuel, water, stores) that sets the real
   draft and KG, and so the real GM. Until then the drawings say so here and in `hydrostatics.md`, and nothing is fudged.
2. **No structure is drawn yet.** The midship section with scantlings (keel, bottom and side shell, car deck under a
   5 t axle, frames at 500 mm, web frames, floors, girders, pillars, bulkheads), the shell expansion and the deck
   plating plans are what a yard cuts steel from; they need rule scantlings (NK rules for steel ships under 90 m) in the
   data first (`FERRY_STRUCTURE`, open).
3. **The piping diagrams** (bilge and ballast, fire main, fuel, cooling sea water and jacket water, lubricating oil,
   compressed air, fresh and sanitary water, hydraulics for the ramp and steering), **the machinery arrangement** in the
   engine room, **the fire-control plan**, **the life-saving plan** and **the mooring and anchoring arrangement** are
   described in the data (`FERRY_MACHINERY`, `FERRY_SAFETY`, `FERRY_GA`) but not yet drawn as sheets.
4. **Stability**: intact stability curves (KN or GZ) and the damage cases the rules ask of a passenger ship (one
   compartment, with the car deck's free surface) are not computed yet; they need the weight estimate and the finer hull.

## The programme (in this order; each batch leaves the ship whole)

| Batch | Sheet(s) | What is built |
|---|---|---|
| D1 (built 2026-10-12) | 1, 1a, 1b, 2, 3, 3a, 4 | The generator, the lines, hydrostatics, GA, one-line, loads, tanks; finding 1 |
| D2 | weight estimate, 1b | Lightship by group and deadweight by condition in the data; draft, trim and KG by condition; the GM the ship really has |
| D3 | 1, 1a, 1b | The hull faired finer at the ends to the target block coefficient; the model follows; walked and photographed |
| D4 | 5 midship section, 5a scantlings | `FERRY_STRUCTURE`: frames, plating, stiffeners, deck loads, by rule; the section drawn |
| D5 | 6 shell expansion, 7 deck plans (structure) | Plates and seams, the car-deck grid of girders and pillars |
| D6 | 8 machinery arrangement, 9 piping | The engine room drawn to the data; one diagram per system |
| D7 | 10 fire-control and life-saving plans, 11 mooring | From `FERRY_SAFETY` and the mooring data |
| D8 | 12 stability booklet | Intact and damage stability, the loading conditions the master actually uses |
