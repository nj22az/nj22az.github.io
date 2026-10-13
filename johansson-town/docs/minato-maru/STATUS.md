# The Minato Maru: status of the vessel and engine particulars

For the creator's audit of the vessel (2026-10-13), before the CAD comes. Generated from the ship's data by `node tools/ferry-status.mjs`
(`tests/ferry-status.test.mjs` fails when this report no longer matches the data), so the numbers here are the ones the game, the
drawings and the plant run on. Sources: `src/world/ferry-ship.js` (particulars, machinery, electrics, loads, safety), `ferry-model.js`
(the loft), `ferry-interior.js` (the machinery spaces as built), `ferry-piping.js`, `ferry-electrical.js`, `ferry-plant.js`,
`johansson-marine.js` (the makers' catalogue). The yard's findings and the programme are in `README.md`; the batches in `../FERRY-AUDIT.md`.

## 1. The vessel

| | |
|---|---|
| Name, port of registry | Minato Maru (みなと丸), Minato |
| Owner | Minato-chō (the town ferry, a chōei ferī) |
| Type | Passenger ship and vehicle ferry (ryokakusen ken jidōsha tosen), bow ramp only, twin screw |
| Built, refit | 1994, Johansson Shipyard (ヨハンソン造船), Innoshima, Seto Inland Sea: hull No. 127, an island ferry like the dozens before her; 1998: GMDSS (VHF with DSC, EPIRB, SART, NAVTEX) |
| Rules, area | Ship Safety Act and its regulations; inspected by the Okinawa General Bureau’s transport department; classed with NK at the insurer’s request; Limited coastal (gentei engan) |
| Length overall / between perpendiculars | 34.5 m / 31 m |
| Breadth moulded / depth to car deck | 8.4 m / 3 m |
| Draft laden / service; freeboard laden | 1.9 m / 1.7 m; 1.1 m |
| Gross tonnage | 199 |
| Displacement laden / lightship / deadweight (particulars) | 283 t / 210 t / 73 t |
| Block coefficient, GM loaded (particulars) | 0.56, 1.6 m |
| Passengers / vehicles / crew | 100 / 6 cars (or a truck and 2 cars, or 8 kei trucks; 5 t axle, 4.2 m clear) / 8 |
| Speed service / trial / manoeuvring / inside the breakwater | 11.5 / 12.8 / 3 / 5 kn |
| Colours | White superstructure; white hull over red-brown antifouling with a teal sheer band (the ferry company’s colour on the Port Building); teal funnels with the town’s anchor mark |

### 1.1 The hull as lofted against the particulars (README finding 1: still open)

| | Particulars | From the loft at 1.9 m |
|---|---|---|
| Displacement | 283 t | 375.4 t |
| Block coefficient | 0.56 | 0.708 |
| Prismatic / waterplane coefficient | — | 0.739 / 0.952 |
| LCB from the transom | — | 19.3 m |
| KB / BM_T / KM_T | — | 1.06 / 3.89 / 4.95 m |
| TPC | — | 2.66 t/cm |

The loft is fuller than the particulars (a long parallel middle body); the naval architect's answer is to fair the hull finer at the ends with a weight estimate (D2, D3), not to change the particulars. Nothing is fudged until then.

### 1.2 General arrangement

47 spaces (sheet 2): aft-peak, steering-gear, fresh-water, engine-room, control-booth, er-double-bottom, shaft-space, aux-room, workshop, engine-store, fwd-double-bottom, void, bow-thruster, fore-peak, aft-mooring, lower-lobby, car-deck, casing-p, casing-s, foyer, bow-house-p, bow-house-s, ramp, open-deck, lobby, toilets, carpet-room, saloon, walkway-p, walkway-s, eg-room, co2-room, crew-cabin, mate-cabin, deckhand-cabin, crew-wc, mess, galley, chief-cabin, master-cabin, corridor, wheelhouse, wing-p, wing-s, compass-deck, funnel-p, funnel-s.

Machinery spaces as built and walked (`ferry-interior.js`, sheets 5 and 7): the engine room (Fr 17–28) on three levels (tank top under the gratings, floor plates, upper grating), the control booth with the main switchboard, the auxiliary machinery room (Fr 28–38) through a watertight sliding door, the workshop and engine store (Fr 38–45), a void forward; the fan flat over the lower lobby is designed (6q-2) but not built.

## 2. Engine and machinery particulars

Every machine is a Johansson Marine machine (CLAUDE.md: Johansson is this universe's Acme), built like the real marine machines of its day; its model number is in the catalogue and its numbers are the ship's own.

| | |
|---|---|
| Main engines | 2 × JM6-160: Four-stroke medium-speed marine diesel, six in line, turbocharged and intercooled; 6 cylinders 160 × 200 mm (24 L), 460 kW (625 PS) at 1350 rpm, mep 17 bar, 3 t each |
| Starting | Compressed air at 2.94 MPa (30 kgf/cm²) from two 150 L bottles |
| Engine-driven pumps | Each engine drives its own lubricating-oil, jacket-water and sea-water pumps: they run when the engine runs, with or without electricity, so a blackout does not stop the propellers |
| Fuel | A-heavy oil (A-jūyu) at 210 g/kWh; firing pressure 27.5 bar idle, 67.5 bar full; 46 L a crossing, 920 L a day |
| Gearboxes | 2 × JR-30: Reverse-reduction gearbox with hydraulic multi-disc ahead and astern clutches; bridge control from the wheelhouse and both wings, emergency control in the engine room; 3 : 1 |
| Shafting | 2 × 110 mm; Oil-lubricated stern tubes with lip seals; header tanks in the steering-gear room |
| Propellers | 2 × 4-bladed aluminium bronze 1.45 m, P/D 0.8, fixed pitch, 450 rpm, turning outward |
| Rudders | 2 × 0.75 m², 35°, behind each propeller |
| Steering gear | JS-22: Electro-hydraulic, two power units: one at sea, both in narrow water; 2 × 2.2 kW; 35° one side to 30° the other in under 28 s; No.2 is fed from the emergency switchboard; a hand pump and a telephone to the bridge |
| Bow thruster | JT-75: 75 kW, 0.9 m tunnel, 10 kN, star-delta start; may start only with two generators on the board |
| Starting air | 2 × JC-30, 30 kgf/cm² · two 150 L bottles |
| Fuel treatment | JF-1 purifier, A-heavy oil · 250 L/h; 2 × JP-5 transfer pumps |
| Fire main | 2 × JP-40 40 m³/h at 0.5 MPa (11 kW); emergency fire pump 5.5 kW 20 m³/h; main DN 65; hydrants car deck 4, passenger deck 2, bridge 1, engine room 1 |
| Bilge | JP-25 25 m³/h (3.7 kW); main DN 65 (The rule asks for 25 + 1.68·√(L(B+D)) millimetres: 57 for her); separator JO-15 0.25 m³/h · 15 ppm |
| Fixed fire fighting | CO₂ 4 × 45 kg for the engine room (40 % of the engine room’s gross volume at 0.56 m³ a kilogram: 136 kg needed, 180 kg carried); detection 30 heads in 6 zones, panel in the wheelhouse |
| Fresh water | JQ-2 hydrophore 0.75 kW, 300 L tank, 0.25–0.35 MPa; 1.5 m³ a day |
| Ramp | JH-55: 2 × 5.5 kW at 14 MPa, 2 cylinders 100 mm; up in 60 s, down in 45 s |
| Anchors and mooring | 2 × 480 kg stockless, 19 mm grade 2 chain 137.5 m; 2 × JW-75 7.5 kW; JW-55 5.5 kW; 6 × 40 m vinylon lines |
| Tanks | fuel 15 m³ (storage 7.5 + 7.5, service 1.5); fresh water 12; sewage 4; bilge holding 1; sludge 0.3; lubricating oil 0.6; ballast fore peak 6, aft peak 4, port 8, starboard 8 m³ (sheet 4) |

### 2.1 Johansson Marine equipment list

| Model | Machine | Specification | Fitted |
|---|---|---|---|
| JM6-160 | Main engine | 6 cyl · 160×200 mm · 460 kW at 1350 rpm | 2 |
| JR-30 | Reverse-reduction gear | 3:1 · hydraulic multi-disc ahead and astern clutches | 2 |
| JG-125 | Generator set | 125 kVA · 445 V 60 Hz · 1800 rpm · 4 cyl | 2 |
| JG-40E | Emergency generator | 40 kVA · on load within 45 s | 1 |
| JT-75 | Bow thruster | 75 kW · 0.9 m tunnel · 10 kN | 1 |
| JS-22 | Steering gear | 2 × 2.2 kW power units · 35° one side to 30° the other in under 28 s | 1 |
| JE-440 | Main switchboard | 445 V 60 Hz IT · 2 generator panels · shore 50 kVA | 1 |
| JC-30 | Starting-air compressor | 30 kgf/cm² · two 150 L bottles | 2 |
| JF-1 | Fuel purifier | A-heavy oil · 250 L/h | 1 |
| JP-40 | Fire and general-service pump | 40 m³/h at 0.5 MPa · 11 kW | 2 |
| JP-25 | Bilge pump | 25 m³/h · 3.7 kW | 1 |
| JO-15 | Oily-water separator | 0.25 m³/h · 15 ppm | 1 |
| JW-75 | Windlass | 7.5 kW · 19 mm chain | 2 |
| JW-55 | Mooring capstan | 5.5 kW | 1 |
| JH-55 | Ramp hydraulic power pack | 2 × 5.5 kW · 14 MPa | 1 |
| JN-1800 | Radar | X-band · 4 ft scanner · 24 nm | 1 |
| JN-25 | VHF radiotelephone | 25 W · DSC (1998 refit) | 1 |
| JN-AP2 | Autopilot | with the non-follow-up lever | 1 |
| JP-32 | General-service pump | 40 m³/h · 11 kW · sea water | 1 |
| JP-15 | Sanitary pump | 1.5 kW · sea-water flushing | 2 |
| JP-5 | Fuel transfer pump | 1.5 kW · 2 m³/h · gear pump | 2 |
| JP-15D | Sewage discharge pump | 1.5 kW · vortex impeller | 2 |
| JQ-2 | Hydrophore set | 0.75 kW · 300 L tank · 0.25–0.35 MPa | 1 |

## 3. Electrical particulars

| | |
|---|---|
| System | 440 V three-phase three-wire, insulated from earth (earth lamps and an insulation meter on the board); lighting 105 V through 2 × 30 kVA (1 in use) |
| Generators | 2 × JG-125 125 kVA (100 kW, pf 0.8) 445 V 60 Hz 1800 rpm, 162 A; breaker 200 A frame set 170 A; trips: over-current, short-time, under-voltage and reverse power (about 10 %) |
| Emergency generator | JG-40E 40 kVA (32 kW), on load within 45 s, 60 L day tank for 15 h; 40 kVA rather than 25, because the 5.5 kW emergency fire pump starts direct on line (66 A against a rated 52 A) |
| Batteries | 24 V, banks: starting, radio and emergency; transitional 30 min |
| Shore supply | 200 V 3-phase 60 Hz, 50 kVA (40 kW), 50 kVA 200/440 V in the quay kiosk at Minato, 75 A; Shore power and the generators never run together: the shore breaker and the generators’ breakers are interlocked |
| Switchboards | MSB: Main switchboard, in the engine control booth: DG1, synchronising (synchroscope, lamps, two kW meters, Hz, V, A, three earth lamps, insulation meter), DG2, two 440 V feeder panels, shore; LB: 105 V lighting board, fed through one of the two 30 kVA transformers; ESB: Emergency switchboard, 440 V and 105 V sections, in the emergency-generator room: fed from the main board through a bus-tie, and from the emergency generator when the main board is dead |
| Consumers | 50 loads in the load analysis (sheet 3a), 58 feeders with breakers and cables (sheets 3b, 3c) |

### 3.1 Load by condition (sheet 3a)

| Condition | Supply | Demand | Load |
|---|---|---|---|
| sea | 1 generator 100 kW | 40.1 kW | 40 % |
| arrival | 2 generators 200 kW | 110 kW | 55 % |
| loading | 1 generator 100 kW | 45.9 kW | 46 % |
| night | shore 40 kW | 10.3 kW | 26 % |
| blackout | emergency generator 32 kW | 10 kW | 31 % |

Electrical checks (`electricalChecks()`): none outstanding.

## 4. Piping systems (sheets 8.1–8.11) and the pipes as built

| System | Nodes | Lines | Duty / standby pairs |
|---|---|---|---|
| fuel | 18 | 22 | Fuel transfer: tp1 / tp2 |
| lube | 28 | 28 | Lubricating oil, port main engine: lop-mainP / prime-mainP; Lubricating oil, starboard main engine: lop-mainS / prime-mainS |
| seawater | 20 | 23 | Sea-water cooling, port main engine: swp-mainP / gs; Sea-water cooling, starboard main engine: swp-mainS / gs |
| jacket | 24 | 24 | — |
| bilge | 21 | 24 | Bilge: bp / fbp; Ballast: balp / gs2 |
| fire | 22 | 22 | Fire main: fp1 / fp2 |
| air | 16 | 17 | Starting air: c1 / c2 |
| freshwater | 11 | 15 | Fresh water: hp1 / hp2 |
| sewage | 9 | 10 | Sanitary flushing: sp1 / sp2; Sewage discharge: dp1 / dp2 |
| exhaust | 14 | 8 | — |
| hydraulics | 13 | 17 | Steering: hpu1 / hpu2; Ramp: rp1 / rp2 |

In the machinery spaces every machine, tank stub and penetration of the diagrams is anchored (151 anchors) and every line between two of them is routed in 3D in its system's colour and bore (172 runs of 210 lines; the rest end at a penetration to another deck). Every pumped service has two means (14 pairs).

## 5. Life-saving and fire safety (sheet 6)

108 persons; 5 liferafts × 25 (serviced yearly in Naha); rescue boat 4 m for 6 with a 15 hp outboard and a 3.7 kW davit; extinguishers, hydrants, the CO₂ system, muster stations and escapes on the fire control and safety plan.

## 6. The plant as it runs in the game (6r-2)

The crew's day: shore power until 06:10, No.1 generator on the board, the engines for the first boat at 06:25, shore power again after the last at 22:15; No.2 generator on the board for the thruster from the breakwater in and for the departure. At 14:00 alongside, replayed from midnight:

| State | Machines |
|---|---|
| running | Port main engine, Starboard main engine, Generator No.1, Sanitary pump No.1 JP-15, Engine-room supply fans No.1 |
| stopped | Generator No.2, Fuel transfer pump No.1, Priming pump, Priming pump, General-service pump JP-32, Bilge pump JP-25, Fire and bilge pump No.2 (8.6), Ballast pump JP-32, General-service pump (standby, 8.3), Emergency fire pump, Steering power unit No.1, Steering power unit No.2, Ramp pump No.1, Ramp pump No.2, Engine-room supply fans No.2, Car-deck exhaust fans No.1, Car-deck exhaust fans No.2, Bow thruster (star-delta, two-generator interlock), Anchor windlass and warping heads, Aft mooring capstan, Ramp power pack pump (one of two runs) No.1, Ramp power pack pump (one of two runs) No.2, Fuel purifier, Oily-water separator, Rescue-boat davit winch |
| standby | Fuel transfer pump No.2, Fire and GS pump No.1 JP-40, Fire and bilge pump No.2 JP-40, Starting-air compressor No.1 JC-30, Starting-air compressor No.2 JC-30, Hydrophore pump No.1, Hydrophore pump No.2, Sanitary pump No.2 JP-15 |

Readings at 14:00: board 1 generator(s) on the board, 16 kW; starting air 29 / 28 bar; service tank 48 %; fresh-water pressure 0.31 MPa; alarms: none. The player works the plant at 18 stations (start, stop, standby, isolate and tag out, open for overhaul, breakers, change-overs); the console's dials, readout and alarm matrix read the plant.

## 7. The design programme: built and open

### Built

| Batch | Sheets | What |
|---|---|---|
| D1 (built 2026-10-12) | 1, 1a, 1b, 2, 3, 3a, 4 | The generator, the lines, hydrostatics, GA, one-line, loads, tanks; finding 1 |
| D9 (built 2026-10-12) | 5, 6 | Engine room arrangement from the interior as built, with the equipment list; the fire control and safety plan, posted aboard |
| D9a (built 2026-10-12) | all | Every sheet framed as a yard drawing: border with zones, title block (yard, ship, drawing number JS-127-nn, scale, sheet, date, drawn/checked/approved, revision), wrapped notes, labels that fit, dimension lines, hatched sections (the creator, 2026-10-12: "The drawings don't look real and text overflowing") |
| D14 (6q-1, built 2026-10-13) | 7, 2, 4, 6 | The machinery spaces as a line of rooms on several levels (the creator, 2026-10-13: "The engine room should be several levels and have many rooms"): the auxiliary machinery room, the workshop and the engine store forward of the engine room through a watertight sliding door, walkable in the game with their machines, prompts and safety items; the ballast moved into the double bottom under them; finding 5 |
| D16 (6r-1, built 2026-10-13) | 5, 7 | The pipes built in 3D from the piping diagrams (the creator: "are pipes connected, do they lead to systems?"): every machine, tank stub and penetration of the machinery spaces anchored (`FERRY_INTERIOR.anchors`), every line between two of them routed as an orthogonal run in its system's colour and bore by `src/world/ferry-pipe-routes.js` (overhead lanes by system, bilge and oil mains under the plates, cross runs along the forward bulkheads, a machine's own circuit hugging it), drawn in the game and on the plans of sheets 5 and 7; 172 of 181 lines, the rest ending at a penetration to another deck; tested against the machines (`tests/ferry-pipes.test.mjs`) |
| D10 (built 2026-10-13) | 8.1–8.11 | Piping diagrams from `FERRY_PIPING` (the creator: "Make a piping diagram too, so all pipes are correct, and redundant motors so you can alternate"): eleven systems, 196 nodes and 210 lines with bores, every node tagged (KKS) and placed; every pumped service with two means (`FERRY_SERVICES`: duty and standby, alternated weekly): a second fuel transfer pump, compressor, hydrophore pump, sanitary pump and sewage pump added to the ship, the general-service pump standing by for either main engine's cooling and for the ballast, the fire and bilge pump for the bilge, the emergency fire pump outside the engine room; the engine-driven pumps' electric standbys. Open: the diagrams' pipe runs drawn in the engine room's model from the same data (the runs there are painted by system today) |
| D15 (built 2026-10-13) | 3, 3b, 3c | Electrical drawings from `FERRY_FEEDERS` (the creator: "electrical drawings for the ship … correct … with proper cabling"): the one-line with every source, board, transformer and feeder tagged; the feeder lists with full-load current, starter (star-delta over 7.5 kW), breaker (≥ 1.25 × FLA, standard ratings), marine cable by rating and by voltage drop (≤ 5 %) over its route, length and route; the cable schedule with KKS cable numbers. Open: control and alarm cabling (4501–5999), the motor starter schematics, the lighting circuits fixture by fixture |
| D17 (built 2026-10-13) | 3, 3a, 3b, 3c, 6 | The car deck's working fittings, from the creator's photographs and films of a working road ferry (he chose to keep her white and teal and take the fittings only): `FERRY_DECK_FITTINGS` in `ferry-model.js`. The vehicle barrier, two red-and-white leaves 0.7 m aft of the bow houses, shut across the lanes at sea and lifted upright onto the walkways when the ramp is down (a wall in the walk either way); a lane-signal post on each bow house with a board each way (lane 2, the truck's centre lane, lane 1) under three lamps, red at sea, green with the ramp down, and the four 500 W ramp floodlights of the `floodlights` load, drawn at last and lit for loading after dark; the lane signals as a consumer of their own on the lighting board (`lane-signals`, 0.18 kW, 10BRB10 GS020, cable 10BRB10 1016); red walkways outboard of the lanes forward of the casings; the four car-deck hydrants of the fire main (hCar1–4) drawn as valves with handwheel and brass coupling, aft on the casings by the hose boxes and forward on the bulwark with hose boxes of their own, and the safety plan corrected to them (it had three, at places the piping did not have); stainless exhaust pipes out of the funnels; 非常口 and 前に物を置かないでください on the engine room's escape door (`FERRY_DECK_SIGNS`). Views 18–20 and n5 in `tools/ferry-look.mjs`. The fittings cost 1 810 triangles and five meshes after trimming (the lamps, lenses and boards merged): the model is at 39 meshes of its 40, so the next moving part must share a mesh |
| D18 (6r-2, built 2026-10-13) | — | The plant runs (`src/world/ferry-plant.js`): every engine and motor-driven machine with a state, the duty/standby pairs, a chief's interlocks, the crew's day by the clock; the console's dials and alarm matrix, the prompts at 18 stations and her sound read it (`ferry-plant-controls.js`); the player starts, stops, changes over, isolates and opens machines (`tests/ferry-plant-game.test.mjs`) |

### Open

| Batch | Sheets | What |
|---|---|---|
| D2 | weight estimate, 1b | Lightship by group and deadweight by condition in the data; draft, trim and KG by condition; the GM the ship really has |
| D3 | 1, 1a, 1b | The hull faired finer at the ends to the target block coefficient; the model follows; walked and photographed |
| D4 | 5 midship section, 5a scantlings | `FERRY_STRUCTURE`: frames, plating, stiffeners, deck loads, by rule; the section drawn |
| D5 | 6 shell expansion, 7 deck plans (structure) | Plates and seams, the car-deck grid of girders and pillars |
| D6 | 8 machinery arrangement, 9 piping | The engine room drawn to the data; one diagram per system |
| D7 | 10 fire-control and life-saving plans, 11 mooring | From `FERRY_SAFETY` and the mooring data |
| D8 | 12 stability booklet | Intact and damage stability, the loading conditions the master actually uses |
| D14b (6q-2) | 7 | The fan flat at 5.5 m over the lower lobby: the engine-room fans and their trunks down the casings, its ladder from the casing P landing and its hatch to the open deck; the `er-fans` load moves there |
| D14c (6q-3) | 5, 7 | The bilge level: the red tank top under the gratings, the bilge wells and their suctions, the sounding pipes, the shaft space seen through its manhole |
| D11 | 14 shafting and propeller | Shaft line, bearings, stern tube and seal, coupling, the propeller drawing (B-series section data), torsional check |
| D12 | 15 midship section, scantlings | Frames, plating, longitudinals, deck beams, pillars and bulkheads to a class rule (the ANYstructure DNV plate and girder tool is the reference), the lightship weight it gives feeding D2 |
| D13 | 16 ventilation, insulation, deck machinery | Engine-room air supply (the diesels' combustion air plus cooling), fire insulation classes, windlass and capstan foundations |

## 8. Open findings and what the CAD audit should settle

1. **The hull** (finding 1): the loft is fuller than the particulars (§1.1). The CAD decides which stands: fair the hull to the particulars, or correct the particulars to the hull, then the weight estimate (D2) sets draft, trim, KG and GM.
2. **No structure is drawn** (finding 2): the midship section and scantlings (D12), the shell expansion and deck plans (D5) need rule scantlings in the data; the CAD's steel is the reference.
3. **Shafting and propeller** (D11), **ventilation, insulation and deck machinery** (D13), **the stability booklet** (D8) are open.
4. **The fan flat** (6q-2) and **the bilge level** (6q-3) of the machinery spaces are designed, not built; the CO₂ covers the engine room only (the new rooms rely on extinguishers and detection).
5. **The plant** (6r-3): overhaul scenes (covers off, parts on the plates) when a machine is opened, the crew at the handles when the routine starts a machine, alarm acknowledge, the plant saved with the game; the starboard engine's open No.4 crankcase door (from the photographs) should follow the plant's state.
6. **Lines beyond the machinery spaces** (hydrants on the car and passenger decks, the galley and toilets, the steering-gear room, the bow house) are on the diagrams but not yet built on their own decks.

When the CAD comes: compare it with sheets 1–2 (lines, GA), 5 and 7 (machinery spaces), 8.x (piping), 3.x (electrical) and this report, and record every difference as a finding in README.md before anything in the data is changed (CLAUDE.md: plan a change before making it; no fudged numbers).
