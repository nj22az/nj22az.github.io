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
| Built, refit | 1994, Johansson Shipyard, Innoshima (hull No. 127); 1998 GMDSS |
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
| 3b | `feeder-lists.svg` | Feeder lists: every consumer of the main, lighting and emergency switchboards with its KKS tag, full-load current, starter, breaker, cable (cores × mm², rating), route and length, voltage drop (`src/world/ferry-electrical.js`) |
| 3c | `cable-schedule.md` | The cable schedule the electricians pull from: every power cable numbered by the KKS rule, its ends, type, section, route and length |
| 3a | `electrical-load.md` | The electric load analysis (電力調査表): every consumer in the five conditions |
| 4 | `tanks.md` | Tank plan and capacities |
| 5 | `engine-room-arrangement.svg` | Machinery arrangement: plan at the floor plates with the frame grid, centreline elevation, hatched section through the mains, dimensions, equipment list keyed to the drawing (every rectangle a box of `FERRY_INTERIOR` as built) |
| 8.1–8.11 | `piping-<system>.svg` | Piping diagrams, one a system (fuel oil, lubricating oil, sea-water cooling, jacket water, bilge and ballast, fire main and CO₂, starting and service air, fresh water, sanitary water and sewage, exhaust, hydraulics): every tank, pump, valve, strainer, cooler and consumer with its KKS tag and its space, every line with its bore, and the duty/standby table of the system (`src/world/ferry-piping.js`) |
| 7 | `machinery-spaces.svg` | Machinery spaces, levels and rooms: the longitudinal section at the centreline with every level (tank top, floor plates, car deck, fan flat, passenger deck) and every hold space on its frames, the plan at the floor plates from the engine room through the watertight door to the auxiliary machinery room, the workshop and the store, the list of levels |
| 6 | `safety-plan.svg` | Fire control and safety plan: profile and the four decks with every extinguisher, hydrant, fixed system, liferaft, lifebuoy, lifejacket locker, muster station, escape and control station (`FERRY_SAFETY_ITEMS`, `src/world/ferry-safety-plan.js`); the same drawing is posted aboard, marked YOU ARE HERE |

The contents of each space, and why it is where it is, are the `what` and `why` of each `FERRY_GA` entry (read them in
`src/world/ferry-ship.js`); the inside of each space as built, to the centimetre, is `src/world/ferry-interior.js`.

## Tags: KKS (the creator, 2026-10-13: "Use correct KKS codes for the drawings")

Every system, machine, valve, tank, instrument and cable on the sheets carries a tag by the VGB Kraftwerk-Kennzeichensystem,
the power-plant identification system, with the ship as the plant (`src/world/ferry-kks.js`). The structure and the
counting rules are VGB-B 105's as restated in Eskom's open KKS Coding Standard 240-93576498 (2016):

| Level | Characters | Aboard |
|---|---|---|
| 0 total plant | G | 1 the Minato Maru; 0 the shore (the quay kiosk's shore supply is plant-common) |
| 1 system | F0 F1F2F3 FN | F0 tells identical systems apart (0 common, 1 port main engine, 2 starboard, 3 generator No.1, 4 No.2, 5 the emergency generator); F1F2F3 the function key; FN the subsystem decade in the direction of flow |
| 2 equipment unit | A1A2 AN | AP pump, AA valve, AN compressor or fan, AT filter or separator, AC heat exchanger, BB tank, BR pipe, BS silencer, AE winch or hoist, AH air-conditioning unit, GS board section, GT transformer, GU charger, C* measuring circuit (CP pressure, CT temperature, CL level, CF flow, CQ analysis, CS speed, CE electrical); numbered by the key part's rules: valves 1xx electric actuator, 2xx pneumatic/hydraulic/solenoid, 4xx drain and vent, 5xx hand, 6xx mechanical, 9xx safety; measuring circuits 0xx remote analogue, 3xx remote binary, 5xx local |
| 3 component | B1B2 BN | -M01 the motor, KP01 the pump, MK01 the coupling, KA01 the valve body, KC01 the cooler, KD01 the vessel, MG01 the gear |

So `11XJA10 AP001 -M01` reads: the ship, the port main engine, diesel engine 10, pump unit 001, its motor. Cables: the lower
end's tag in alphabetical order, then 1001–1999 for AC ≤ 1 kV, 2001–2499 DC power, 4501–5999 control, 7001–7999
measuring, 8001–8999 communication (`10BRA10 1009` is the thruster's cable from the main board).

The function keys and where each comes from (`KKS_FUNCTION_KEYS`, `source`): **read in the published key tables** (VGB-B
105 as quoted by the Eskom standard, the Siemens abridged key and the Voith Siemens handbook): XJA diesel engine, XJB
turbocharger, XJG liquid cooling, XJH charge-air cooling, XJK transmission gear, XJN fuel system at the engine; MKA
generator, MKC excitation; EG light fuel oil supply; PA main cooling water, PC auxiliary cooling water; GA raw water, GH
distribution not for drinking, GK drinking water, GM process drainage, GN process drains treatment, GQ domestic waste
water collection, GR its disposal; SG stationary fire protection (SGA fire water, SGJ CO₂), SC stationary compressed air
(SCA generation, SCB distribution), SA heating, ventilation and air conditioning, SM cranes and hoists; BAA generator
leads, BRA–BRS low-voltage distribution boards, BRU converters, BRV emergency power generating equipment; UM structures for
main machine sets, UZ for transport, UY general service. **The yard's reading of the key part's lettering, to be confirmed
against the full key part before a real yard cuts steel** (`source: 'yard'`, each with its reason): XJJ starting, XJL air
intake, XJR exhaust, XJV lubricating oil, XJY control (the X group letters its subsystems as the M group does: MBJ, MBL,
MBR, MBV are published); the EG decades EGA–EGD; BRT low-voltage transformers (BBT is the medium-voltage key); BTA the 24 V
batteries; BQA the shore supply; the C keys CMA engine control, CSA fire detection, CTA navigation and radio; SGP portable
extinguishers; and XSA–XSD for the ship's own machines the key part does not know (steering gear, ramp hydraulics, bow
thruster, windlasses), allocated under X (heavy machinery, not main machine sets).

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
5. **The hold forward of the engine room was empty.** Between Fr 28 and Fr 55 (z 14–27.5) the general arrangement had
   13.5 m of hull, 8 m wide and 2.1 m high under the car deck, down as "tanks and voids" holding 20 m³ of tanks: 260 m³
   of ship doing nothing, which no owner pays a yard for. Settled in 6q-1 as a yard would: the auxiliary machinery room
   (Fr 28–38, through a watertight sliding door in the engine room's forward bulkhead; the ballast and bilge manifold
   and the ballast pump over the ballast tanks, now in the double bottom under it; the sewage holding tank built in to
   port, out of the engine room; an escape trunk into casing S), the workshop and the engine store (Fr 38–45, through a
   door), and a reserve void forward (Fr 45–55). The watertight door is the rule's: the bulkhead is a subdivision
   bulkhead below the bulkhead deck, so the door slides, closes by hand at the door and from the wheelhouse, and is
   kept shut at sea (sheet 7). Open: the CO₂ covers the engine room only; the new rooms rely on their extinguishers and
   the detection heads, and the fan flat over the lower lobby (the 1.9 m between its deckhead at 5.5 m and the
   passenger deck at 7.4 m, 10 m long, which the arrangement had left unassigned) is designed as the engine-room fan
   room and will be built in 6q-2.
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
| D9 (built 2026-10-12) | 5, 6 | Engine room arrangement from the interior as built, with the equipment list; the fire control and safety plan, posted aboard |
| D9a (built 2026-10-12) | all | Every sheet framed as a yard drawing: border with zones, title block (yard, ship, drawing number JS-127-nn, scale, sheet, date, drawn/checked/approved, revision), wrapped notes, labels that fit, dimension lines, hatched sections (the creator, 2026-10-12: "The drawings don't look real and text overflowing") |
| D14 (6q-1, built 2026-10-13) | 7, 2, 4, 6 | The machinery spaces as a line of rooms on several levels (the creator, 2026-10-13: "The engine room should be several levels and have many rooms"): the auxiliary machinery room, the workshop and the engine store forward of the engine room through a watertight sliding door, walkable in the game with their machines, prompts and safety items; the ballast moved into the double bottom under them; finding 5 |
| D16 (6r-1, built 2026-10-13) | 5, 7 | The pipes built in 3D from the piping diagrams (the creator: "are pipes connected, do they lead to systems?"): every machine, tank stub and penetration of the machinery spaces anchored (`FERRY_INTERIOR.anchors`), every line between two of them routed as an orthogonal run in its system's colour and bore by `src/world/ferry-pipe-routes.js` (overhead lanes by system, bilge and oil mains under the plates, cross runs along the forward bulkheads, a machine's own circuit hugging it), drawn in the game and on the plans of sheets 5 and 7; 172 of 181 lines, the rest ending at a penetration to another deck; tested against the machines (`tests/ferry-pipes.test.mjs`) |
| D14b (6q-2) | 7 | The fan flat at 5.5 m over the lower lobby: the engine-room fans and their trunks down the casings, its ladder from the casing P landing and its hatch to the open deck; the `er-fans` load moves there |
| D14c (6q-3) | 5, 7 | The bilge level: the red tank top under the gratings, the bilge wells and their suctions, the sounding pipes, the shaft space seen through its manhole |
| D10 (built 2026-10-13) | 8.1–8.11 | Piping diagrams from `FERRY_PIPING` (the creator: "Make a piping diagram too, so all pipes are correct, and redundant motors so you can alternate"): eleven systems, 196 nodes and 210 lines with bores, every node tagged (KKS) and placed; every pumped service with two means (`FERRY_SERVICES`: duty and standby, alternated weekly): a second fuel transfer pump, compressor, hydrophore pump, sanitary pump and sewage pump added to the ship, the general-service pump standing by for either main engine's cooling and for the ballast, the fire and bilge pump for the bilge, the emergency fire pump outside the engine room; the engine-driven pumps' electric standbys. Open: the diagrams' pipe runs drawn in the engine room's model from the same data (the runs there are painted by system today) |
| D15 (built 2026-10-13) | 3, 3b, 3c | Electrical drawings from `FERRY_FEEDERS` (the creator: "electrical drawings for the ship … correct … with proper cabling"): the one-line with every source, board, transformer and feeder tagged; the feeder lists with full-load current, starter (star-delta over 7.5 kW), breaker (≥ 1.25 × FLA, standard ratings), marine cable by rating and by voltage drop (≤ 5 %) over its route, length and route; the cable schedule with KKS cable numbers. Open: control and alarm cabling (4501–5999), the motor starter schematics, the lighting circuits fixture by fixture |
| D17 (built 2026-10-13) | 3, 3a, 3b, 3c, 6 | The car deck's working fittings, from the creator's photographs and films of a working road ferry (he chose to keep her white and teal and take the fittings only): `FERRY_DECK_FITTINGS` in `ferry-model.js`. The vehicle barrier, two red-and-white leaves 0.7 m aft of the bow houses, shut across the lanes at sea and lifted upright onto the walkways when the ramp is down (a wall in the walk either way); a lane-signal post on each bow house with a board each way (lane 2, the truck's centre lane, lane 1) under three lamps, red at sea, green with the ramp down, and the four 500 W ramp floodlights of the `floodlights` load, drawn at last and lit for loading after dark; the lane signals as a consumer of their own on the lighting board (`lane-signals`, 0.18 kW, 10BRB10 GS020, cable 10BRB10 1016); red walkways outboard of the lanes forward of the casings; the four car-deck hydrants of the fire main (hCar1–4) drawn as valves with handwheel and brass coupling, aft on the casings by the hose boxes and forward on the bulwark with hose boxes of their own, and the safety plan corrected to them (it had three, at places the piping did not have); stainless exhaust pipes out of the funnels; 非常口 and 前に物を置かないでください on the engine room's escape door (`FERRY_DECK_SIGNS`). Views 18–20 and n5 in `tools/ferry-look.mjs`. The fittings cost 1 810 triangles and five meshes after trimming (the lamps, lenses and boards merged): the model is at 39 meshes of its 40, so the next moving part must share a mesh |
| D18 (6r-2, built 2026-10-13) | — | The plant runs (`src/world/ferry-plant.js`): every engine and motor-driven machine with a state, the duty/standby pairs, a chief's interlocks, the crew's day by the clock; the console's dials and alarm matrix, the prompts at 18 stations and her sound read it (`ferry-plant-controls.js`); the player starts, stops, changes over, isolates and opens machines (`tests/ferry-plant-game.test.mjs`) |
| D11 | 14 shafting and propeller | Shaft line, bearings, stern tube and seal, coupling, the propeller drawing (B-series section data), torsional check |
| D12 | 15 midship section, scantlings | Frames, plating, longitudinals, deck beams, pillars and bulkheads to a class rule (the ANYstructure DNV plate and girder tool is the reference), the lightship weight it gives feeding D2 |
| D13 | 16 ventilation, insulation, deck machinery | Engine-room air supply (the diesels' combustion air plus cooling), fire insulation classes, windlass and capstan foundations |

**Buildability (the creator, 2026-10-12: "one should be able to build a ship from the drawings a real functional and
floating ship").** Sheets 1–7 describe her form, her spaces, her electrics, her machinery arrangement and her machinery spaces level by level; they are not
yet a build set. A yard would also need D2 (the weights, so she floats at her marks), D3 (the hull faired to her
displacement), D10–D13 and D8, and the class approval of each. Every one of them is to be generated from data by
`tools/ferry-drawings.mjs`, as the sheets so far are, so the game, the book and the ship never disagree.

References the creator pointed to (2026-10-12): [ShipD](https://github.com/noahbagz/ShipD), 30 000 parametric hulls
(45 parameters, 49 feasibility constraints, hydrostatics at ten drafts, Michell wave drag) whose hull parameterisation
and constraints are the model for D3's fairing; the GitHub
[naval-architecture topic](https://github.com/topics/naval-architecture), where OpenHull and hullforge (parametric
hulls with hydrostatics, GZ stability and Michell resistance), ANYstructure (DNV plate, girder and cylinder design, for
D12) and the Wageningen B-series propeller tools (prop3d, propy_opt, for D11) are the tools to check our numbers
against; the King's College Ship-Design-Project (Simulink models of a ship and its control, for the engine control
later). ftShipBuilder is a Full Thrust tabletop ship builder, not naval architecture, and is not used.
