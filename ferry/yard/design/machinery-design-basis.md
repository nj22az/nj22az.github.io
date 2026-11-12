# The Chisum's machinery: design basis

Made on 12 November 2026 by a research agent for Johansson Shipyard. Every figure names its source through a bracketed key
(the keys and their full addresses are in section 7). "n/v" means not verified: no source reached gave the figure. "est."
means an engineering estimate of this document, with its basis beside it. "(summary)" after a key means the figure was seen
only in a search engine's summary of the page, not on the page itself. Makers' data belong to their makers and are studied,
not copied. This is a proposal for the owner's approval, and it is what the machinery of the model will be built from.
Nothing here is class-approved or construction information.

## How to read this

**The ship it is for** (decided, not changed here): length over all 124.8 m, breadth 19.6 m, depth to the main (trailer)
deck 6.6 m and to the upper deck 13.2 m, design draught 5.6 m, about 17.5 knots, crew 25 and 50 drivers. Two medium-speed
diesels of about 4,000 kW each, each through a reduction gear to a controllable-pitch propeller; two rudders; a bow thruster
of about 600 kW. Electrical supply as registered in `ferry/systems/ship.py` [H4]: 690 V three-phase 60 Hz where power is
made, 440 V behind two transformers, 230 V for lighting, 24 V batteries.

**The hull it must fit** is the general arrangement of revision D (`ferry/blender/ga.py`, `spec.py` and `lines.py` on the
branch `claude/chisum-revision-d`, read on 12 November 2026 [H1][H2][H3]). Frames are 0.6 m apart, frame 0 at the transom:

| Space | Frames | Metres from the transom | Level |
|---|---|---|---|
| Steering gear room | 0 to 12 | 0 to 7.2 | flat at 4.7 m |
| After passage (fresh water tanks each side) | 12 to 28 | 7.2 to 16.8 | flat at 4.7 m |
| **Engine room** | 28 to 64 | 16.8 to 38.4 (21.6 m) | tank top 1.6 m, platform 4.0 m, main deck 6.6 m |
| **Auxiliary engine room** | 64 to 78 | 38.4 to 46.8 (8.4 m) | the same |
| Lower hold | 78 to 144 | 46.8 to 86.4 | tank top 1.6 m |
| Forward pump room (between deep tanks) | 144 to 164 | 86.4 to 98.4 | tank top |
| Bow thruster room | 164 to 184 | 98.4 to 110.4 | tank top |

The shaft lines stand 3.40 m off the centreline and fall 2 degrees aft; the screws (3.0 m, four blades) are 8.0 m from the
transom with their centres 1.7 m above the keel; the gearbox output flanges are 25.6 m from the transom, 2.31 m above the
keel; the shafts are 280 mm; the stern tubes' inboard seals are at 21.4 m, the couplings to the tail shafts at 22.6 m, the
plummer blocks at 24.2 m; the rudder stocks are 4.2 m from the transom; the thruster tunnel is 1.6 m at frame 168; the
uptake casings and funnels are 16.2 to 23.2 m from the transom, 7.5 to 9.8 m off the centreline [H2][H1].

**Where a thing stands** is given as: **x**, metres forward of the engine room's after bulkhead (frame 28, 16.8 m from the
transom: add 16.8 to get metres from the transom); **y**, metres off the centreline, P (port) or S (starboard); **z**,
metres above the keel. "ER" is the engine room, "AER" the auxiliary engine room; "lower" is the lower floor (floor plates at
2.0 m, 0.4 m over the tank top), "platform" is the level at 4.0 m.

**The pattern** is the Mashala class of Rickmers Werft, 1977, as the MAIB described her sister Moondance [P4]: two MaK
8M453AK, reduction gears, two Escher Wyss propellers, two Deutz BA 8M 816 sets of 270 kW, two shaft generators of 550 kW,
a Jastram thruster of 441 kW. Where this basis follows her it says so.

**The story of her age.** Built 1974 to 1977 by a German yard; refitted in the 2010s. What is of 1975 is named as of 1975;
what the refit renewed is marked "refit". One thing does not fit a ship of 1975 and is said plainly in section 7: she
generates at 690 V, which no source reached shows on a ship of that time (the pattern generated at 440 V [P4]).

## The choices in one table

| Item | Chosen | Why this one |
|---|---|---|
| Main engines | Two Klöckner-Humboldt-Deutz **SBV 12 M 540**, 12 cylinders in V, 370 × 400 mm, 4,413 kW (6,000 PS) at 600 rpm, run at 3,750 kW in service | The same engines, two of them, drove the ro-ro freighter Bison of J.J. Sietas, Hamburg, 1975, of 125.00 × 19.05 m at 18.5 knots [P3]: her hull to within a metre. A V engine 3.84 m high [P2] is the only kind of 4,000 kW that stands under a main deck 5.0 m over the tank top. Its bore, stroke, speed and power range can be read [P1]; its size is its successor's [P2] |
| Not chosen | MaK 8M551AK or 9M551 (in line: too high for the space; no data sheet reached); MaK 8M453AK (2,206 kW each on the pattern [P4]: too small); Pielstick 12PC2-2V (the same 6,000 bhp; no size reached here); Stork-Werkspoor 9TM410 (5,700 bhp each on the European Gateway [H5]; in line, nine cylinders, about 9 m long: n/v; only its layout was reached [P10]); MAN 40/54 and 52/55 (no data reached) | |
| Reduction gears | Two Lohmann & Stolterfoht single-stage gears, input and output side by side (horizontal offset 0.75 m), multi-plate clutch, thrust bearing, power take-off; 600 : 220 rpm | Horizontal offset keeps the crankshaft as low as the propeller shaft, which the height of the room needs (section 2). L&S's gears for controllable-pitch propellers with a built-in take-off are named in the trade press, in vertical and horizontal offset [P7]. The type letters of 1975: n/v |
| Propellers | Two **Escher Wyss** controllable-pitch propellers, four blades, 3.0 m, 220 rpm | The pattern's make, and the one whose pitch system is described part by part in a public report [P4] |
| Shaft generators | Two of 750 kW (940 kVA), 690 V, 60 Hz, on the gears' take-offs | The pattern has two of 550 kW for a 441 kW thruster [P4]; these are in the same proportion to a 600 kW thruster. Without them the load balance does not close (section 4) |
| Generating sets | Three Deutz **BA 8 M 816 U**, 8 cylinders in line, 142 × 160 mm, 395 kW at 1,800 rpm [P1], each with an AEG alternator of 320 kW, 400 kVA, 690 V | The pattern's own engine family and alternator maker [P4]; the charge-cooled 8-cylinder is the smallest of the family that gives 320 kW electrical at 60 Hz |
| Emergency set | As the owner's drawing: 500 kW, 440 V, 60 Hz, radiator-cooled, in a room of 7.8 × 4.5 m. Type proposed: Cummins KTA19-G4 (refit) | The room is built to the owner's drawing [H6]. Her own emergency load is about 150 kW (section 4): the set is three times what the rule needs |
| Boilers | One oil-fired vertical boiler of 1,500 kg/h at 7 bar (Sunrod CPH pattern) and an exhaust gas economiser of 700 kg/h on each main engine | Sunrod CPH boilers stood in a ro-ro ferry of 1985 [E11]; 7 bar (100 lb/in²) and the fired boiler as the economisers' steam drum are period practice [E8][E7]. No maker's sheet of the 1970s was reached: sizes are est. |
| Steering gear | One electro-hydraulic ram gear: a ram on each rudder's tiller, the tillers joined by a tie bar, two power units, a hand pump (Hatlapa, type n/v) | The hull already has it so [H2], and the pattern's report reads the same way: a tiller joining the rudders, operating gear on each, one header tank, a hand pump [P4] |
| Bow thruster | KaMeWa tunnel thruster with controllable pitch, 1,650 mm tunnel, 600 kW, 690 V squirrel-cage motor | The hull's tunnel is 1.6 m [H2]; a 1,650 mm KaMeWa unit takes 630 to 760 kW [D5 (summary)] |

---

## 1. The machinery list

One row for each machine or tank. Sizes are length × width × height in metres as the thing stands (for upright cylinders:
diameter × height). Weights are dry unless said. "est." in the size column means the size was estimated from the rating or
from a present-day machine of the same duty named in the source column: **most auxiliaries of 1975 have no data sheet that
can be reached today, and the sizes given for them are those of the makers' present machines of the same duty**. That is
said row by row.

### 1.1 Propulsion

| Tag | Name | Make and type | Off | Rating | Size (m) and weight | Driven by, voltage | Where | Source |
|---|---|---|---|---|---|---|---|---|
| ME1, ME2 | Main engine | Klöckner-Humboldt-Deutz SBV 12 M 540. Four-stroke, single-acting, 12 cylinders in a 60° V, bore 370 mm, stroke 400 mm, 43.0 litres a cylinder, turbocharged and charge-air-cooled, direct injection, non-reversing ("S": a marine engine without direct reversing; "R" would be the reversing one) | 2 | 4,413 kW (6,000 PS) at 600 rpm continuous; mean effective pressure 17.1 bar, piston speed 8.0 m/s (worked from the bore, stroke and power); service 3,750 kW at 600 rpm | 6.64 × 3.52 × 3.84; 48 t. These are the figures of the S/BV 12 M 640, the successor with the same bore and stroke [P2]: est. for the 540 | Starting air, 30 bar (pressure n/v for the type) | ER lower, x 11.85 to 18.49, centre y 2.65 P and S; crankshaft 2.53 m above the keel at mid-length, parallel to the shaft line | P1 P2 P3 |
| FC1, FC2 | Flexible coupling, engine to gear | Rubber-element highly flexible coupling (Vulkan or Lohmann & Stolterfoht; type n/v) | 2 | 70 kNm (4,413 kW at 600 rpm) | 1.3 diameter × 0.7; 1.2 t (est.) | | x 11.15 to 11.85, y 2.65 | est. |
| GB1, GB2 | Reduction gear | Lohmann & Stolterfoht, Witten: single reduction, single helical, horizontal offset 0.75 m, built-in hydraulic multi-plate clutch, built-in thrust bearing, power take-off before the clutch with a step-up stage (the family later sold as GCH with the suffix P [P7]; designation of 1975 n/v) | 2 | 4,413 kW, 600 to 220 rpm, 2.73 : 1; output torque 192 kNm; take-off 790 kW at 1,200 rpm | 2.2 × 2.5 × 2.0; 17 t (est.: a present single-input gear of the size is 2.0 to 2.4 m long, 2.3 m wide, 16.5 t [P8 (summary)]) | Attached oil pump; stand-by pump GB-P | x 8.95 to 11.15; output shaft on y 3.40, input on y 2.65, take-off on y 2.05; shafts 2.31 m above the keel at the output flange | P7 P8 |
| OD1, OD2 | Oil distribution box (the pattern's "oil transfer box") | Escher Wyss, on the intermediate shaft: a stationary ring round the turning shaft that passes pitch oil into the two tubes inside the shaft; carries the mechanical pitch indicator and the levers for setting pitch by hand. A box on the intermediate shaft abaft the gear was the arrangement of the time [P9] | 2 | pitch range 32° ahead, 23° astern [P4] | 0.7 diameter × 0.6 long (est.) | Oil from CPH1, CPH2 | on the shaft, x 8.1 to 8.7, y 3.40 | P4 P9 |
| IS1, IS2 | Intermediate shaft | Forged steel, hollow-bored for the oil tubes, flanged both ends | 2 | 192 kNm at 220 rpm | 3.0 long × 0.28 diameter [H2]; 1.5 t (est.). By the class formula as recalled, 245 mm would do for the intermediate shaft and 300 mm is needed at the propeller: n/v | | x 5.8 to 8.8, y 3.40 | H2 |
| PB1, PB2 | Plummer block (intermediate shaft bearing) | White-metal, oil-ring lubricated, water-cooled | 2 | | 0.7 × 0.8 × 0.7; 0.4 t (est.) | | x 7.4 [H2] | H2 |
| SB1, SB2 | Shaft brake and locking device | Disc on the coupling flange, two pneumatic callipers, a locking pin for work on the line | 2 | holds a trailing shaft with the gear declutched | disc 0.9 diameter (est.) | Working air 7 bar | at the coupling, x 5.8 [H2] | est. |
| TS1, TS2 | Tail (propeller) shaft | Forged steel, hollow-bored, flanged to the propeller hub, bronze liners in way of the bracket bearings | 2 | | 14.6 long × 0.28 [H2]; 7.1 t (est.: 483 kg a metre) | | from the coupling at x 5.8 aft to the screw, 8.0 m from the transom; it leaves the hull about 19 m from the transom [H2] | H2 |
| ST1, ST2 | Stern tube with seals | Cast-iron tube, white-metal bearings, oil-filled from a header tank; lip seals of the Simplex pattern inboard and outboard (make and type n/v) | 2 | static head from STH at 9.0 m | about 3 long (est.) | | inboard seal at x 4.6 [H2] | H2, est. |
| BR | Shaft bracket bearings | Two brackets on each shaft, 9.5 and 14.2 m from the transom [H2]; water-lubricated rubber-stave bearings (est.: a yard of the time might have chosen oil; n/v); a rope guard on the after one | 4 | | | | outside the hull | H2 |
| CP1, CP2 | Controllable-pitch propeller | Escher Wyss, four blades bolted to a hub that holds the pitch-adjusting piston; outward turning | 2 | 3.0 m [H2], 220 rpm, tip speed 34.6 m/s; 4,413 kW | hub about 0.86 diameter (est.: a present hub of that diameter for a four-bladed propeller weighs 1.9 t without blades [P6]); whole propeller about 5.5 t (est.) | Pitch oil through the shaft | 8.0 m from the transom, y 3.40 P and S, centre 1.7 m above the keel [H2] | P4 P6 H2 |
| CPH1, CPH2 | Propeller pitch oil unit | A tank with screw pumps, filter, cooler (sea water) and the control valve block: "two independent screw hydraulic oil pumps", one system a shaft, cross-connected for an emergency [P4]. Here each unit has a duty and a stand-by pump | 2 | tank 600 l; 2 pumps of 11 kW each; working pressure n/v | 1.9 × 1.3 × 1.5; 0.9 t dry (est.) | 440 V | ER, shaft space under the platform, x 2.4 to 4.3, y 0.4 to 1.7 P and S (the hull's arrangement puts them in the after passage [H1]: either will do) | P4 |
| STH1, STH2 | Stern tube oil header tank | Steel tank with level glass, low-level switch and thermometer | 2 | 100 l | 0.5 × 0.5 × 0.6 | gravity | in the uptake casings at 9.0 m above the keel (3.4 m over the load waterline: est.) | est. |
| STD | Stern tube oil drain tank and circulating pump | | 1 | 200 l; pump 0.75 kW | 0.8 × 0.6 × 0.6 | 440 V | shaft space, centreline, x 4.6 | est. |
| TG1, TG2 | Turning gear | Electric, engaging the flywheel, interlocked with starting air | 2 | 2.2 kW | 0.8 × 0.4 × 0.5 | 440 V | at each flywheel, x 11.7 | est. |

### 1.2 Electrical generation and distribution

| Tag | Name | Make and type | Off | Rating | Size (m) and weight | Driven by, voltage | Where | Source |
|---|---|---|---|---|---|---|---|---|
| DG1, DG2, DG3 | Diesel generating set | Engine: Deutz BA 8 M 816 U, 8 cylinders in line, 142 × 160 mm, 20.27 litres, turbocharged (one KKK turbocharger) and charge-air-cooled, 395 kW (537 PS) at 1,800 rpm continuous, built 1975 to 1983, water-cooled oil cooler and attached cooling water pump [P1]; wet sump (est.). Alternator: AEG, type DKBH (the pattern's [P4]), brushless, 400 kVA, 0.8 power factor (AEG and AvK alternators are seen on engines of the family today [E3][E4]; the DKBH's size is n/v). On a common bed frame on rubber mounts | 3 | 320 kW, 400 kVA, 690 V, 60 Hz, 1,800 rpm, four poles | Engine 2.2 × 1.0 × 1.5, 2,000 to 2,050 kg [P1]. Set about 3.7 × 1.3 × 1.9, 4.6 t (est.: a present set of the same output is 2.90 × 1.00 × 1.47 with a 2.4 t engine and a 1.1 t alternator [E5]) | Electric start, 24 V (seen on dealers' engines of the type [E2]; air start n/v) | AER lower, x 22.6 to 26.3; DG1 on y 1.6 P, DG2 on y 2.0 S, DG3 on y 5.6 S; alternators forward | P1 P4 E2 E3 E4 E5 |
| SG1, SG2 | Shaft generator | AEG synchronous alternator, six poles, brushless, on the gear's power take-off through a flexible coupling. Frequency follows the main engine: 60 Hz at 600 engine rpm, as on the pattern [P4] | 2 | 750 kW, 940 kVA, 690 V, 60 Hz, 1,200 rpm | 2.3 × 1.3 × 1.4; 4.5 t (est.) | GB1, GB2 take-off | ER, under the platform, x 6.4 to 8.7, centre y 2.05 P and S | P4, est. |
| EG | Emergency generating set | As the owner's drawing: 500 kW, 440 V, three-phase, 60 Hz [H6]. Proposed type (refit): Cummins KTA19-G4, six cylinders in line, 19 litres, 503 kW stand-by, with a Stamford alternator and a set-mounted radiator (alternator type n/v) | 1 | 500 kW nameplate; about 470 kW electrical from 503 kW at the shaft (est.) | Engine 1.86 × 0.87 × 1.73, 1,855 kg; radiator air 12.5 m³/s [E16 (summary)]. Set with radiator about 3.9 × 1.5 × 2.1, 4.6 t (est.) | Two 24 V starting batteries, each good for three starts (the rule: three starts and a second source for three more [R14]) | Emergency generator room, officers' deck, 80.1 to 88.1 m from the transom on the centreline [H1] | H6 E16 R14 |
| EG-T | Emergency set's fuel tank | Steel, with level gauge, quick-closing valve pulled from outside the room | 1 | 2.5 m³ proposed: 36 hours at 250 kW (section 6). The room as built has about 200 l [H6] | 1.6 × 1.25 × 1.25 | gravity | in the emergency generator room | est. |
| MSB | Main switchboard, 690 V | Dead-front, floor-standing, two bus sections with a tie breaker and a separate thruster bus: panels for DG1, DG2, DG3, SG1, SG2, synchronising, bus tie, thruster feeder, two transformer feeders | 1 | 690 V, 60 Hz, 1,600 A bars (est.) | 9 panels, 7.6 × 0.8 × 2.2 (est.) | | Main switchboard room, platform, x 0 to 4.2, y 0.9 to 7.4 P: the forward of two rows | H4, est. |
| T1, T2 | Main transformers | Dry type, three-phase | 2 | 800 kVA each, 690/440 V; either carries the whole 440 V load (section 4) | 2.0 × 1.2 × 2.0; 2.6 t each (est.) | | Switchboard room, outboard end | est. |
| PSB | 440 V section and group starters | Feeders and the group starter panels of the engine room's motors (the after row in the switchboard room), with two group starter boards on the platform, GSP1 and GSP2 | 1 + 2 | 440 V | after row 6.5 × 0.8 × 2.2; GSP1, GSP2 each 2.6 × 0.6 × 2.0 (est.) | | Switchboard room; GSP1, GSP2 at x 5.0 to 7.6, y 7.7 to 8.5 P and S | H4, est. |
| LT1, LT2 | Lighting transformers | Dry type | 2 | 100 kVA each, 440/230 V | 0.9 × 0.6 × 0.9; 0.5 t (est.) | | Switchboard room | est. |
| ESB, ET | Emergency switchboard and its transformer | 440 V board with a 230 V section behind a 30 kVA transformer; fed from PSB through a tie, or from EG within 45 seconds [R12] | 1 | 440 V | 3.2 × 0.6 × 2.0 (est.) | | Emergency generator room | H4 R12 |
| SHORE | Shore connection | Box with a breaker, phase sequence lamps and a cable reel | 1 | 440 V, 60 Hz, 400 A (est.) | 0.8 × 0.4 × 1.2 | | Main deck, port pilot door lobby | est. |
| BAT | 24 V batteries | General service and radio banks with their chargers, as registered [H4] | 2 | as `ship.py` | | | Battery room, bridge deck [H1] | H4 |

### 1.3 Steam

| Tag | Name | Make and type | Off | Rating | Size (m) and weight | Driven by, voltage | Where | Source |
|---|---|---|---|---|---|---|---|---|
| AB | Oil-fired auxiliary boiler | Vertical cylindrical pin-tube boiler of the Sunrod CPH pattern (two CPH-120 stood in the ro-ro ferry Caribou of 1985 [E11]; Sunrod's small range was 0.5 to 6 t/h [E14]). It is also the steam drum of the two economisers | 1 | 1,500 kg/h saturated steam at 7 bar gauge (100 lb/in² was the period's pressure [E8]) | 2.3 diameter × 4.0; about 5 t dry, 8 t in water (est.: a present boiler of 1,600 kg/h is 4.03 high and 2.3 across [E12]; a packaged boiler of the 1970s for 2 to 5 t/h weighed 6 to 9 t wet [E7]: the scan's figures are not clear) | Burner AB-BR | AER lower, standing on the tank top through the floor, x 26.6 to 28.9, y 6.0 to 8.3 S; top 5.65 m above the keel | E7 E8 E11 E12 E14 |
| AB-BR | Burner | Pressure-jet burner for heavy fuel with a diesel pilot, forced-draught fan, fuel pump, flame eye (the Caribou's was a Nu-Way [E11]; rotary-cup burners were the period's alternative [E15]) | 1 | about 115 kg/h of fuel (est.: 0.077 kg of fuel a kg of steam, a figure recalled and n/v); fan and pump 5.5 kW | 1.2 × 0.8 × 0.8 | 440 V | on the boiler's front, facing inboard | E11 E15 |
| EGE1, EGE2 | Exhaust gas economiser | Sunrod extended-surface (pin-tube) element in the exhaust pipe, forced circulation from the boiler's water space: the arrangement "widely adopted" in the 1970s [E7][E9] | 2 | 700 kg/h each at the engine's service power (est.: 8 kg/s of gas cooled from 380 to 250 °C gives 1.1 MW, about 1,500 kg/h: the element is sized for half of that so the pipe keeps its heat) | 1.4 diameter × 3.6; 4 t (est.: a present unit of 0.1 to 2 t/h is 1.1 to 1.55 across and 2.8 to 4.6 high [E13]) | Circulating pumps BC-P | in the exhaust trunks in the side casings, x 17.2 to 19.4, y 8.6 P and S, z 7.2 to 10.8 | E7 E9 E13 |
| BC-P1, BC-P2 | Economiser circulating pumps | Centrifugal, hot water, one running | 2 | 12 m³/h at 2.5 bar over boiler pressure; 3 kW | 0.7 × 0.4 × 0.4 | 440 V | AER lower, x 26.7 to 28.6, y 3.4 to 5.0 S | est. |
| FD-P1, FD-P2 | Boiler feed water pumps | Multi-stage centrifugal (or side-channel), one running, started by the boiler's level control | 2 | 2.5 m³/h at 10 bar; 2.2 kW | 0.7 × 0.3 × 0.4 | 440 V | with BC-P | est. |
| HW | Hotwell (cascade and observation tank) | Open steel tank with a filter box, an observation glass for oil in the condensate (heavy-fuel ships need one for the returns of the bunker coils [E8]), make-up float valve, thermometer | 1 | 1.5 m³ | 1.4 × 0.8 × 1.4, on a stool 1.5 m high | gravity to FD-P | AER, x 29.0 to 29.8, y 4.6 to 6.2 S | E8 |
| CD-P | Condensate pump | Small centrifugal pump: lifts the returns that drain to a pot under the floor up to the hotwell | 1 | 2 m³/h; 1.1 kW | 0.5 × 0.3 × 0.3 | 440 V | AER lower, by the boiler | est. |
| DC | Dump condenser | Shell-and-tube, sea-water-cooled: condenses the economisers' surplus | 1 | 800 kg/h of steam | 0.5 diameter × 2.0 | Sea water from the main line | AER, against the forward bulkhead, y 6.6 to 8.6 S, z 3.5 | E13, est. |
| SIL1, SIL2 | Main engine exhaust silencer | Absorption silencer with spark arrester, soot collector and drain, nominal bore 700 | 2 | 25 dB(A) | 1.5 diameter × 4.55; 1,470 kg [E17] | | upright in each funnel, z 13.5 to 18.0 | E17 |
| SIL3 to SIL5 | Generating sets' silencers | Absorption silencer with spark arrester | 3 | for 395 kW; pipe 250 mm (est.) | up to 0.86 diameter × 2.53, 360 kg (the smallest in a present maker's table, for a 300 mm pipe [E18]) | | in the starboard funnel | E18 |

### 1.4 Fuel

Heavy fuel (intermediate fuel of 180 cSt at 50 °C: the pattern burned intermediate fuel or diesel [P4]) for the main engines
and the boiler; marine diesel oil for the generating sets, the emergency set, and for starting and stopping the main
engines. Capacities are worked out in section 6.

| Tag | Name | Make and type | Off | Rating | Size (m) and weight | Driven by, voltage | Where | Source |
|---|---|---|---|---|---|---|---|---|
| T-HF1P, T-HF1S | Heavy fuel bunker tank No. 1 | Wing tank with steam coils | 2 | about 110 m³ each [H1] | | | wings of the lower hold, frames 100 to 122 [H1] | H1 |
| T-HF2P, T-HF2S | Heavy fuel bunker tank No. 2 | Double-bottom tank with steam coils (**proposed here: not in the hull's arrangement**) | 2 | about 60 m³ each | | | under the lower hold aft, frames 78 to 90 | est. |
| T-DOP, T-DOS | Diesel oil bunker tank | Double-bottom tank (**proposed here**) | 2 | about 40 m³ each | | | under the auxiliary engine room, frames 66 to 78, outboard | est. |
| T-HFS | Heavy fuel settling tank | Built-in, steam coil, sloping bottom to a self-closing sludge cock, level gauge, high and low level alarms, thermometer, quick-closing outlet valve | 1 | 44 m³ (24 hours at service power) | 4.6 × 3.7 × 2.5 | | AER platform, x 21.8 to 26.4, y 5.9 to 9.6 P, z 4.0 to 6.5 | est. |
| T-HFD | Heavy fuel service (day) tank | As the settling tank; overflows back to it | 1 | 21 m³ (11 hours) | 2.2 × 3.7 × 2.5 | | x 26.4 to 28.6, y 5.9 to 9.6 P | est. |
| T-DOD | Diesel oil service tank | Built-in, level gauge (the owner's photograph E4 is the pattern: a magnetic level gauge between two cocks, a self-closing drain cock over a tray [H5]) | 1 | 12 m³ | 1.3 × 3.7 × 2.5 | | x 28.6 to 29.9, y 5.9 to 9.6 P | H5, est. |
| T-OF | Fuel overflow tank | Double bottom, with a flow alarm in the overflow main | 1 | 10 m³ | | | under AER | est. |
| T-SL | Sludge tank | Free-standing, steam coil, directly under the separators (the maker asks for a falling pipe and the tank as near as possible [P5]) | 1 | 4 m³ | 2.6 × 2.0 × 0.9 | | AER lower, x 23.6 to 26.2, y 3.2 to 5.2 P, on the tank top | P5 |
| T-LK | Leak fuel and dirty oil tank | Double bottom | 1 | 3 m³ | | | under ER, forward | est. |
| SL-P | Sludge pump | Screw pump: empties T-SL, T-LK and T-BH to the shore connection | 1 | 5 m³/h at 4 bar; 2.2 kW | 0.9 × 0.3 × 0.4 (est.) | 440 V | AER lower, beside T-SL | est. |
| FO-TP1 | Heavy fuel transfer pump | Screw pump (Allweiler or IMO: types n/v), with suction strainer and relief valve | 1 | 30 m³/h at 4 bar; 7.5 kW | 1.2 × 0.4 × 0.5; 150 kg (est.) | 440 V | AER lower, under the separator room, x 22.4, y 3.6 P | est. |
| FO-TP2 | Diesel oil transfer pump | Gear or screw pump; can stand in for FO-TP1 through a spectacle flange | 1 | 15 m³/h at 4 bar; 4 kW | 1.0 × 0.4 × 0.5 (est.) | 440 V | beside FO-TP1 | est. |
| FO-SEP1, FO-SEP2 | Heavy fuel separators | Alfa-Laval MAPX 207, self-cleaning disc separators, run in series as purifier and clarifier or singly; each can take the whole consumption (the rule a maker gives [P5]). A MAPX 207S-24 of 1987 was rated 5,750 l/h [A4]; whether the type was made in 1974 to 1977: n/v. The solid-bowl MAB 206 is the fallback [A3] | 2 | needed: 2,400 l/h (8,826 kW at 217 g/kWh, plus 15 %, 23 hours a day, 0.96 kg a litre: the maker's formula [P5]); motor 7.5 kW | 1.14 × 0.90 × 1.31; 785 kg without motor. These are the figures of the MOPX 207, the same frame [A2] | 440 V | Separator room, AER platform, x 22.0 to 29.6, y 2.6 to 5.6 P | A2 A3 A4 P5 |
| FO-SEP3 | Diesel oil separator | Alfa-Laval MAPX 204 (up to 2,500 l/h, 3 hp motor [A5]; date n/v) | 1 | 1,000 l/h; 5.5 kW allowed | about 0.9 × 0.7 × 1.1; 400 kg (est.: a MOPX 205 is 400 kg net [A1]) | 440 V | Separator room | A1 A5 |
| FO-H1, FO-H2 | Separator heaters | Steam shell-and-tube with thermostatic valve | 2 | 68 kW each (2,400 l/h raised 48 K to 98 °C, the maker's formula [P5]) | 0.3 diameter × 1.5 | steam 7 bar | Separator room, on the bulkhead | P5 |
| FO-BU | Fuel booster unit | In 1975 separate parts on a common tray: two supply pumps (FO-BP1, 2: 6 bar), a mixing and venting tank of 100 l, two circulating pumps (FO-CP1, 2: 10 bar, 3.5 to 4 times the consumption), two steam heaters, a viscosity controller, a duplex filter, a flow meter (the proportions are a maker's [P5]) | 1 | 6.8 m³/h circulating; supply pumps 2.2 kW, circulating pumps 3 kW | 3.2 × 1.4 × 2.0; 1.8 t (est.) | 440 V; steam | ER platform, port gallery, x 12.6 to 16.8, y 5.2 to 7.6 | P5, est. |
| FO-VIS | Viscosity controller | VAF Viscotherm: a capillary and a small gear pump give a pressure difference that works the heaters' steam valve. VAF made its first marine viscosity meter in 1966 [A14]; the name was registered in 1971 [A15] | 1 | set to 13 cSt (range 10 to 24 cSt [P5]) | 0.4 × 0.3 × 0.4 (est.; n/v) | 230 V | in FO-BU | A14 A15 P5 |
| FO-AF | Fuel fine filter | Boll & Kirch duplex filter (1975); an automatic back-flushing filter at the refit (a present type 6.64 of 100 mm bore has 32 candles and weighs 298 kg [A16]) | 1 | 35 µm [P5] | 0.9 × 0.6 × 1.1 (est.) | air for back-flushing | in FO-BU | A16 P5 |
| BS-P, BS-S | Bunker station | Manifold in a save-all: heavy fuel filling 150 mm, diesel 100 mm, sludge and bilge discharge 65 mm with the standard discharge flange, pressure gauges, sampling cock | 2 | | 2.0 × 0.6 × 1.2 | | Main deck, pilot door lobbies, 66 to 72 m from the transom, P and S [H1] | H1 |
| QC | Quick-closing valves and their station | On every fuel and lubricating oil tank outlet above the double bottom; released by air from a cabinet outside the machinery spaces | 14 valves, 1 cabinet | 7 bar | cabinet 0.6 × 0.3 × 0.8 | working air bottle 40 l | cabinet in the engine room entrance at the main deck | est. |

### 1.5 Lubricating oil

There is no separate cylinder oil system: a trunk-piston engine oils its liners from the crankcase (est. for the type).

| Tag | Name | Make and type | Off | Rating | Size (m) and weight | Driven by, voltage | Where | Source |
|---|---|---|---|---|---|---|---|---|
| T-LC1, T-LC2 | Main engine oil circulating tank | Double-bottom tank under each engine: the engine has a dry sump (the smaller V engines of the maker had one-piece dry sumps [P1]; for the 540: n/v) | 2 | 6.5 m³ each (1.4 litres a kW on heavy fuel, a maker's rule [P5]) | | | under ME1 and ME2, x 11.5 to 19, below the wells | P1 P5 |
| LO-P1 to LO-P4 | Main lubricating oil pumps | Screw pumps, two an engine, one running: the pattern's engines had electrically driven lubricating oil pumps [P4] | 4 | 80 m³/h at 5 bar (a present engine of 4,350 kW takes 77 to 87 m³/h at 4.5 bar [P5]); 22 kW | 1.5 × 0.5 × 0.6; 350 kg (est.) | 440 V | ER lower, x 8.8 to 11.4, y 5.3 to 6.9, P for ME1 and S for ME2 | P4 P5 |
| LO-PP1, LO-PP2 | Pre-lubricating pumps | Gear pumps, run before a start and in port | 2 | 19 m³/h at 0.8 bar [P5]; 3 kW | 0.7 × 0.3 × 0.4 | 440 V | with LO-P | P5 |
| LO-C1, LO-C2 | Lubricating oil cooler | Shell-and-tube, sea water in the tubes, with a thermostatic three-way valve | 2 | about 520 kW [P5: the present engine's figure] | 0.7 diameter × 3.2; 1.6 t (est.). The tube bundle draws out aft, under the platform: 3.2 m clear | | ER lower, x 8.8 to 12.2, y 7.5 to 8.4 P and S | P5, est. |
| LO-F1, LO-F2 | Lubricating oil filter | Duplex full-flow filter (1975); automatic filter of 35 µm at the refit [P5] | 2 | 80 m³/h | 1.0 × 0.8 × 1.4 (est.) | | with LO-P | P5 |
| LO-SEP1, LO-SEP2 | Lubricating oil separators | Alfa-Laval MAPX 204, one an engine, running continuously, each with a steam heater | 2 | 1,150 to 1,440 l/h each (the maker's formula for 4,413 kW on heavy fuel [P5]); 5.5 kW | as FO-SEP3 | 440 V | Separator room | A5 P5 |
| T-LS1, T-LS2 | Main engine oil storage tanks | Free-standing, with level glasses, filled from the deck | 2 | 6 m³ each | 2.0 × 1.4 × 2.2 | gravity to the circulating tanks | AER platform, x 21.9 to 26.2, y 6.6 to 9.6 S | est. |
| T-LR | Renovating tank | Takes one engine's charge for batch separating; steam coil | 1 | 6.5 m³ | 2.0 × 1.5 × 2.2 | | with T-LS | est. |
| T-LG, T-LD, T-LH | Gear oil, generator engine oil and hydraulic oil storage tanks | Free-standing | 3 | 2, 1.5 and 1.5 m³ | each about 1.0 × 0.9 × 2.0 | hand and air pumps | with T-LS | est. |
| GB-P1, GB-P2, GB-C1, GB-C2 | Gear stand-by oil pump and oil cooler | Screw pump; shell-and-tube cooler, sea water | 2 + 2 | 20 m³/h at 6 bar, 7.5 kW; cooler 70 kW (est.: 1.5 % of the power) | pump 0.9 × 0.4 × 0.5; cooler 0.35 diameter × 1.6 | 440 V | beside each gear, outboard, x 9 to 11, y 4.4 to 5.2 | est. |

### 1.6 Cooling water

Each engine is cooled as the pattern's were: a closed fresh water circuit for the jackets, and sea water through the fresh
water cooler, the lubricating oil cooler and the charge air coolers, "through coolers with strainers" [P4][H5]. There is no
central cooler: that came later.

| Tag | Name | Make and type | Off | Rating | Size (m) and weight | Driven by, voltage | Where | Source |
|---|---|---|---|---|---|---|---|---|
| SC-H, SC-L | Sea chests | High chest on the port side, low chest on the starboard side, as on the pattern [P4]; each with a grating, a steam and air blow-out connection, a vent pipe to above the main deck, a 300 mm sea valve worked from above the floor | 2 | | chests about 1.8 × 0.6 × 0.6 in the shell [H2] | | x 15.0 to 16.8, P and S. The hull has both 0.9 to 1.5 m above the keel [H2]: the port one is proposed at 2.2 to 2.8 m | P4 H2 |
| SW-F1, SW-F2 | Sea water strainers | Basket strainer with a bolted lid, differential pressure gauge (the pattern's port strainer caught mussels and plastic [P4]) | 2 | 300 mm | 0.7 diameter × 1.1 | | inboard of each chest | P4 |
| SW-P1, SW-P2 | Main sea water cooling pumps | Vertical centrifugal, one running, one stand-by; either can draw from either chest; SW-P1 has the emergency bilge suction | 2 | 230 m³/h at 2.4 bar, the pattern's figures [P4]; 37 kW | 0.75 × 0.6 × 1.7; 550 kg (est.: a present pump of the size is 0.73 long, 0.77 high and 256 to 289 kg without its motor [A20]) | 440 V | ER lower, x 16.6 to 19.8, y 5.4 to 7.2 P | P4 A20 |
| SW-HP | Harbour sea water pump | Vertical centrifugal: cools the generating sets and the pitch oil coolers when the main pumps are stopped, as on the pattern (there "between 1.5 and 1.75 bar" [P4]) | 1 | 60 m³/h at 1.75 bar; 7.5 kW | 0.6 × 0.5 × 1.3 (est.) | 440 V | with SW-P | P4 |
| FW-C1, FW-C2 | Jacket fresh water cooler | Shell-and-tube, sea water in the tubes, three-way thermostatic valve | 2 | about 900 kW (est.; the present engine gives 632 kW to its jackets [P5]) | 0.65 diameter × 3.0; 1.4 t (est.). The bundle draws out forward | | ER lower, x 12.8 to 16.0, y 7.6 to 8.5 P and S | P5, est. |
| FW-P1, FW-P2, FW-P3 | Jacket fresh water pumps | Vertical centrifugal, one an engine and a common stand-by (electrically driven on the pattern [P4]) | 3 | 70 m³/h at 3 bar (the present engine: 66 m³/h [P5]); 11 kW | 0.7 × 0.5 × 1.4; 350 kg (est. [A20]) | 440 V | FW-P1 and FW-P3 at x 12.6 to 15.2, y 5.3 to 6.5 P; FW-P2 the same to starboard | P4 P5 A20 |
| FW-PH | Jacket preheater | Steam heater with a small circulating pump: keeps a stopped engine at 60 °C (a maker asks 5 to 6 kW a cylinder [P5][E17]) | 1 | 80 kW; pump 3 kW | 1.2 × 0.5 × 1.0 | steam; 440 V | ER lower, x 12.4 to 15.6, y 5.3 to 6.5 S | P5 E17 |
| FW-ET1, FW-ET2, FW-ET3 | Expansion tanks | Open-vented, level glass, low-level alarm, make-up from the fresh water system, a filling funnel for inhibitor | 3 | 400 l each for the main engines, 200 l for the generating sets (at least a tenth of the circuit [P5]) | 1.0 × 0.6 × 0.7 | static head 0.5 to 0.8 bar [P5] | under the main deck: z 5.6 to 6.3, at x 15.5, y 8.8 P and S; the third in AER | P5 |
| NC | Injection nozzle cooling unit | Tank, two pumps and a cooler in one frame (heavy-fuel engines of the time cooled their nozzles; for the 540: n/v) | 1 | 2 pumps of 1.5 kW | 1.4 × 1.4 × 1.5 (est.) | 440 V | ER lower, forward of ME1, x 18.9 to 20.3, y 2.0 to 3.4 P | est. |
| FWG | Fresh water generator | Atlas (Atlas-Danmark) AFGU: a single-stage vacuum evaporator heated by ME2's jacket water, with a combined brine and air ejector fed by its own sea water pump. 15,000 Atlas-Danmark units were at sea by 1985 [A11]; the data of the 1970s: n/v | 1 | about 15 t a day; heat 350 to 430 kW; ejector pump 11 kW | 1.45 × 1.08 × 1.68; 675 kg (a present copy of the type [A10]: its table is damaged, the columns were inferred) | 440 V | ER platform, starboard gallery, x 13.0 to 15.4, y 5.6 to 7.6 | A10 A11 |
| OV | Overboard discharges | Sea water outlets with screw-down non-return valves at the shell, above the load waterline where they can be | 4 | 200 mm (two), 100 mm (two) | | | ER, P and S, x 9 to 12, z 5.8 | est. |

### 1.7 Compressed air

| Tag | Name | Make and type | Off | Rating | Size (m) and weight | Driven by, voltage | Where | Source |
|---|---|---|---|---|---|---|---|---|
| AC1, AC2 | Starting air compressors | Hatlapa, two-stage, water-cooled, of the W series. The figures are today's W55 [A6]; that it was made in 1974 to 1977: n/v | 2 | 53 m³/h to 30 bar at 1,450 rpm, 13 kW (15 kW motor allowed at 60 Hz) | 0.95 × 0.60 × 0.95; 400 kg with motor [A6] | 440 V | AER lower, x 26.8 to 28.3, y 3.3 to 6.0 P | A6 |
| AC-E | Emergency air compressor | Hatlapa, air-cooled, small (today's L9 [A7]); on the emergency switchboard, to start a generating set on a dead ship (the rule allows an emergency compressor [R10]) | 1 | 8.7 m³/h to 30 bar, 2.3 kW | 0.82 × 0.54 × 0.54; 120 kg [A7] | 440 V, emergency board | AER lower, x 26.8 to 28.0, y 6.3 to 7.2 P | A7 R10 |
| AR1, AR2 | Main starting air receivers | Welded steel, 30 bar, each with safety valve, pressure gauge, drain, fusible plug | 2 | 1,000 l each | 3.56 long × 0.65 diameter; 810 kg (a present maker's table: approximate [A12]) | | AER lower, lying one over the other against the forward bulkhead, y 2.8 to 6.4 P, z 2.4 and 3.2 | A12 R10 |
| AR3 | Generating sets' and control air receiver | As above | 1 | 250 l, 30 bar | 1.77 × 0.48; 274 kg [A12] | | AER, beside AR1 | A12 |
| RD | Reducing stations | 30 to 7 bar for working and control air; 30 to 7 bar for the whistle | 2 | | 0.8 × 0.3 × 0.5 | | AER, on the bulkhead by the receivers | est. |
| AC-C, AD, WR | Control and working air compressor, dryer and receiver (refit) | Oil-injected screw compressor; refrigerant dryer with filters; receiver of 500 l at 8 bar. In 1975 control air came from the starting air through a reducer and a filter | 1 each | 60 m³/h at 8 bar, 7.5 kW; dryer 0.75 kW | compressor 1.0 × 0.7 × 1.2; dryer 0.6 × 0.5 × 0.9; receiver 0.6 diameter × 2.0 (est.) | 440 V, 230 V | ER platform, starboard gallery, x 9.6 to 12.2, y 6.0 to 8.0 | est. |
| WH | Whistle | Zöllner Makrofon M125/130: 130 Hz, 138 dB at 1 m, 7 to 40 bar, 20 to 30 l/s of air, for ships of 75 to under 200 m [A13 (summary)] | 1 | | horn about 1.2 long (n/v) | air through a solenoid valve; the bridge's pipe is registered [H4] | on the mast | A13 |

### 1.8 Bilge, ballast and fire

She carries more than twelve passengers, so she is a passenger ship in the rule's sense: three fire pumps, three bilge
pumps, a drencher on the closed vehicle decks. The sums are in section 3.

| Tag | Name | Make and type | Off | Rating | Size (m) and weight | Driven by, voltage | Where | Source |
|---|---|---|---|---|---|---|---|---|
| BG-P1, BG-P2 | Bilge and general service pumps | Vertical self-priming centrifugal (a present maker's has a built-on water-ring priming pump [A20]); BG-P2 can also feed the fire main | 2 | 90 m³/h at 3 bar; 18.5 kW. The rule's pump for a 125 mm bilge main at 2 m/s is 88 m³/h [R8][R9] | 0.75 × 0.6 × 1.6; 450 kg (est. [A20]) | 440 V | BG-P1: ER lower, x 16.6 to 18.7, y 5.4 to 7.2 S. BG-P2: AER lower, x 22.2 to 24.6, y 7.0 to 8.8 S | R8 R9 A20 |
| BG-PP | Bilge piston pump | Slow-running twin piston pump: feeds the separator without making an emulsion | 1 | 5 m³/h; 2.2 kW | 1.0 × 0.6 × 0.9 (est.; n/v) | 440 V | ER lower, x 18.9 to 20.4, y 5.4 to 7.2 S | est. |
| OWS | Oily water separator | Blohm + Voss Turbulo, gravity plate separator (the present range is 0.25 to 10 m³/h [A17 (summary)]). In 1975 it worked to 100 parts in a million; the refit gave it a 15 parts alarm and a three-way valve | 1 | 2.5 m³/h | 1.8 × 1.1 × 1.35 (a present static separator of 2.5 m³/h [A18 (summary)]) | | with BG-PP | A17 A18 |
| T-BH | Bilge water holding tank | Double bottom, steam coil | 1 | 15 m³ | | | under ER, starboard | est. |
| FP1, FP2 | Fire pumps No. 1 and No. 2 | Vertical centrifugal | 2 | 70 m³/h at 8 bar; 30 kW. The rule: three pumps for a passenger ship of 4,000 gross tons and more; together two thirds of the bilge pumping; 4 bar at the hydrants [R6] | 0.7 × 0.6 × 1.6; 450 kg (est.) | 440 V | FP1 with BG-P1 in ER; FP2 with BG-P2 in AER | R6 |
| FP3 | Fire pump No. 3 (the emergency fire pump) | Vertical centrifugal with its own sea suction, fed from the emergency switchboard: a fire in one compartment must not stop all the pumps [R6] | 1 | 70 m³/h at 8 bar; 30 kW | as FP1 | 440 V, emergency board | Forward pump room, frames 144 to 164 [H1] | R6 H1 |
| DR-P | Drencher pump | Vertical centrifugal: water spray for the main deck and the lower hold | 1 | 180 m³/h at 6 bar; 55 kW. The rule: 5 litres a square metre a minute where the deck is 2.5 m high or more, two sections of 20 m at once [R5]: two of 20 × 15 m take 3,000 l/min | 0.9 × 0.7 × 1.9; 800 kg (est.) | 440 V, main and emergency boards | Forward pump room | R5 |
| DV | Drencher valve station | Eight section valves (five sections of 20 m on the main deck, three of 15 m in the lower hold) with a test and drain line; outside the protected spaces, as the rule asks [R5] | 1 | 100 mm valves | manifold 3.0 × 0.5 × 1.5 | | Port casing at the main deck, x 19.4 to 21.6 (**proposed: the hull's arrangement gives this to the deck workshop** [H1]) | R5 H1 |
| CO2 | Carbon dioxide battery for the machinery spaces | 45 kg cylinders in racks with a pilot bank, two release cabinets (engine room, auxiliary engine room), a pre-discharge alarm, a time delay | 34 cylinders | 1,530 kg: 35 % of the engine room's 2,460 m³ with its casings, at 0.56 m³ a kg [R15] (est. volume) | room 3.6 × 2.0; each cylinder 0.27 diameter × 1.6 | | CO₂ room on the upper deck, forward of the port funnel, 23.2 to 26.8 m from the transom (**proposed: not in the hull's arrangement**) | R15 |
| WM-P | Local water mist unit (refit) | High-pressure pump unit with nozzles over the main engines' tops, the generating sets, the separators and the boiler front | 1 | 15 kW | 1.2 × 0.8 × 1.4 (est.) | 440 V, emergency board | AER lower, by the door | est. |
| BA-P1, BA-P2 | Ballast pumps | Vertical self-priming centrifugal; BA-P1 is the third bilge pump | 2 | 150 m³/h at 2.5 bar; 18.5 kW | 0.8 × 0.6 × 1.7 (est.) | 440 V | Forward pump room [H1] | H1 |
| HL-P | Heeling pump | Reversible axial-flow pump in the cross-over between the two heeling tanks; automatic from an inclinometer while loading (the pattern: "a reversible pump of 600 m³/h" in a 300 mm cross-over, automatic in every port [H5]) | 1 | 600 m³/h either way at 0.8 bar; 22 kW | 1.4 × 0.8 × 0.8 (est.) | 440 V | AER lower, at the forward bulkhead on the centreline, x 28.3 to 29.7 (the hull's arrangement names the forward pump room [H1]: here it is next to the tanks it serves) | H5 H1 |
| BV | Ballast valve control | Butterfly valves with hydraulic actuators; in 1975 a hand pump and a panel without a mimic, as on the pattern [H5]; a mimic panel with tank levels at the refit | 1 | about 24 valves | panel 1.2 × 0.4 × 1.0 | | Cargo office; valves in the pump room and double bottom | H5 |
| HD-F | Helicopter deck foam (refit) | Foam tank, proportioner and two monitors fed from the fire main: 6 l/min a square metre, two monitors of at least 500 l/min, five minutes of concentrate [D24] | 1 | about 1,700 l/min for a deck of 19 m (est.); tank 600 l | tank 1.0 × 0.8 × 1.2 | fire main | at the helicopter deck's stair, starboard | D24 |

### 1.9 Steering and manoeuvring

| Tag | Name | Make and type | Off | Rating | Size (m) and weight | Driven by, voltage | Where | Source |
|---|---|---|---|---|---|---|---|---|
| SGR | Steering gear | Electro-hydraulic ram gear (Hatlapa, Uetersen; type of 1975 n/v): a forged tiller on each rudder stock, a double-acting ram athwartships on each tiller, the tillers' ends joined by a tie bar so that either ram moves both rudders; 35° each way | 1 | 166 kNm for the two rudders at 35° (est.: 83 kNm a rudder of 7.3 m² at 17.5 knots by the class formula [D1]; the rudder is the hull's [H2]). Rams: bore 140 mm, stroke 1.2 m, 160 bar (est.) | each ram 2.4 long; tie bar 6.8 long. A present ram gear of 161 kNm is 2.2 × 1.0 × 0.8 and 2.2 t with two 9.5 kW units [D3] | SGR-PU1, SGR-PU2 | Steering gear room, flat at 4.7 m; stocks 4.2 m from the transom, y 3.40 P and S [H2] | D1 D3 H2 P4 |
| SGR-PU1, SGR-PU2 | Steering gear power units | Each: a motor, a pump and a tank; each alone gives full speed (35° to 30° on the other side in 28 seconds [R11]), so no separate auxiliary gear is needed in a passenger ship [R11]. One is fed from the main switchboard, one by the emergency switchboard [H4] | 2 | 11 kW each; tank 250 l | 1.3 × 0.8 × 1.3 (est.) | 440 V | Steering gear room, centreline, 5.5 to 6.5 m from the transom | R11 H4 |
| SGR-E | Emergency steering | Hand pump with a header tank ("the hydraulic oil header tank" and "the hand pump" of the pattern [P4]), a rudder angle scale on each stock, a gyro repeater, a sound-powered telephone to the bridge | 1 | | stand 0.8 × 0.6 × 1.3 | by hand | Steering gear room | P4 |
| BT | Bow thruster | KaMeWa tunnel thruster, controllable pitch, four blades, right-angle gear in the tunnel; tunnel 1,650 mm inside (the hull's is 1.6 m [H2]). Today's unit of that tunnel is good for up to 1,091 kW [D4]; the 1,650 mm unit takes 630 to 760 kW at 1,475 to 1,770 motor rpm, 312 to 374 propeller rpm [D5 (summary)]. Designation of 1975 n/v | 1 | 600 kW; thrust about 90 kN (est.: 0.15 kN a kW; n/v) | tunnel piece about 1.8 long; about 4.2 t without motor (est.: a present unit of 1.5 m is 1.8 long and 4.15 t [D6]) | BT-M | frame 168 (100.8 m from the transom), centre 2.4 m above the keel [H2] | H2 D4 D5 D6 |
| BT-M | Thruster motor | Vertical squirrel-cage motor, four poles, on the thruster's stool; the pitch is at zero when it starts | 1 | 600 kW, 690 V, 60 Hz, about 1,780 rpm; input 636 kW | 1.0 diameter × 2.2; 3.3 t (est.: a present 630 kW four-pole motor is 3,300 kg [D7 (summary)]) | 690 V, thruster bus | Thruster room | D7 |
| BT-ST | Thruster starter | Auto-transformer starter in 1975 (est.; a ship of another kind had star-delta starters replaced by soft starters at a refit [D8 (summary)]); a soft starter at the refit | 1 | | 1.6 × 0.8 × 2.2 (est.) | 690 V | Thruster room | D8 |
| BT-HP | Thruster pitch oil unit | Tank, pump, header tank above the waterline | 1 | 4 kW; 150 l | 0.9 × 0.6 × 1.0 (est.) | 440 V | Thruster room | est. |

### 1.10 Cargo access hydraulics

The makers of the time were MacGregor, Navire and Kvaerner Brug; MacGregor's public leaflets and one period article are
what could be read [D10] to [D14].

| Tag | Name | Make and type | Off | Rating | Size (m) and weight | Driven by, voltage | Where | Source |
|---|---|---|---|---|---|---|---|---|
| HPU-R | Power pack for the stern ramp, its cleats and the ramp cover | Tank with two main pumps and a small pump for the cleats, filters, a cooler, a hand pump; valve blocks with solenoid and hand levers (the owner's photograph E3 is the pattern [H5]). A ferry of 1978 had three main pumps on a common tank [D10]; a ferry of 1980 had three pumps first set to 180 bar [D9] | 1 | 2 pumps of 37 kW, 100 l/min each at 210 bar (est.), one pump gives half speed; tank 1,500 l | 2.6 × 1.4 × 1.9; 2.2 t filled (est.) | 440 V | Hydraulic pump room, main deck, port casing, 7.2 to 12.6 m from the transom [H1] | D9 D10 H1 H5 |
| HPU-L | Power pack for the cargo lift | As above; two pumps, so that one gives half speed (as the lifts of a ship of 1977 had [H5]) | 1 | 2 pumps of 45 kW at 210 bar (est.: 85 t raised 5 m in 75 seconds); tank 2,000 l | 3.0 × 1.5 × 1.9; 2.8 t filled (est.) | 440 V | Hydraulic pump room | H5 H1 |
| RAMP | Stern ramp and door | One leaf, 9.0 m wide and 11 m long [H1], hinged at the main deck's after edge; raised, it closes the stern. Two direct-acting cylinders (ramps under 200 to 250 m² are worked by cylinders, larger ones by wires [D11]); hydraulic hook cleats above the opening and bolt cleats at each side, load-control valves on the cylinders, a rubber seal [D11] | 1 | about 55 t (est.: a straight stern ramp of about 60 t is recorded [D15]); opens in 2 to 4 minutes [D11] | cylinders: bore 280 mm, stroke 4.5 m (est.) | HPU-R | Transom [H1] | D11 D15 H1 |
| RCOV | Ramp cover | Hinged weathertight cover over the fixed ramp's opening in the upper deck, 40.8 × 3.6 m [H1], in sections hinged at the side and raised by direct cylinders, held by hydraulic bolt cleats (about half a minute a 20 m section [D12]) | 2 sections | | 4 cylinders, bore 160 mm, stroke 1.6 m (est.) | HPU-R | Upper deck, starboard side, 24.6 to 65.4 m from the transom [H1] | D12 H1 |
| LIFT | Cargo lift to the lower hold | Platform of 16.0 × 3.6 m [H1] on two pairs of scissor arms standing on the tank top, four cylinders; raised, it is the hold's hatch cover, locked by four hydraulic bolts and sealed. Safe load 50 t (the lifts of the time: 50 t [H5]). A present scissor lift takes about 40 t [D14] | 1 | 50 t; 5.0 m travel in about 75 seconds (est.) | platform about 35 t; cylinders bore 250 mm, stroke 2.2 m (est.) | HPU-L | Main deck, middle lane, 50.0 to 66.0 m from the transom [H1] | D14 H1 H5 |
| PD1, PD2 | Pilot and bunker doors | Outward-opening shell door with hydraulic cylinders and cleats, each with a small power pack and a hand pump (a present door of 1.5 × 2.2 m opens in about 30 seconds [D13]; a maker's emergency hand pump gives 20 cm³ a stroke to 250 bar [D25]) | 2 | 2.2 kW each | door 1.5 × 2.2 | 440 V | Pilot door lobbies, main deck, 66 to 72 m from the transom [H1] | D13 D25 |
| CS-R, CS-L | Control stands | Ramp: a stand with levers and lamps on the main deck beside the ramp, port side, with sight of the ramp's foot (a ferry of 1980: "on the car deck, port side, just aft of the ramp" [D9]). Lift: a stand at the lift's port side with a key switch, hold-to-run levers, a horn and a lamp. Door and ramp indication on the bridge, as registered [H4] | 2 | | each 0.8 × 0.5 × 1.3 | 24 V control | Main deck | D9 H4 |

### 1.11 Deck machinery

| Tag | Name | Make and type | Off | Rating | Size (m) and weight | Driven by, voltage | Where | Source |
|---|---|---|---|---|---|---|---|---|
| WL1, WL2 | Combined windlass and mooring winch | Hydraulik Brattvaag low-pressure hydraulic (type n/v): one cable lifter, one mooring drum with a band brake and a clutch, one warping head, a hand brake, a local valve stand | 2 | Cable lifter: 124 kN at 9 m/min for 54 mm chain of grade 2 (the rule: 42.5 d² newtons and 0.15 m/s [D17]). Drum: 80 kN at 15 m/min (est.) | 3.8 × 2.6 × 1.9; 9 t (est.) | DM-HPU | Forecastle (upper deck forward of the house), P and S [H1] | D17 H1 |
| DM-HPU | Forward hydraulic pump unit | Two screw pumps on a tank; ring main to both windlasses. Brattvaag's low-pressure system runs at 64 bar today and ran at 47 bar before [D16]: in 1975 about 40 to 47 bar (inferred) | 1 | 2 pumps of 55 kW; tank 1,000 l | 2.8 × 1.4 × 1.8 (est.) | 440 V | Fore store, main deck forward of the collision bulkhead, starboard [H1] | D16 H1 |
| ANC | Anchors | Stockless bower anchors (Hall pattern), two in hawse pipes and a spare on deck | 3 | 3,780 kg each: equipment number about 1,255 (worked in section 6), the row for 1,220 to 1,300 [D18] | | | Bow | D18 |
| CHN | Chain cable | Stud-link, grade 2, in 27.5 m lengths joined by kenter shackles; a chain stopper and a devil's claw on each cable | 2 cables | 54 mm; 522.5 m in all [D18]: 9.5 lengths a side; each locker about 8.5 m³ (est.) | | | Chain lockers under the windlasses [H1] | D18 |
| CAP1, CAP2 | After mooring capstans | Vertical electric capstan with the motor under the head | 2 | 50 kN at 15 m/min; 15 kW (est.) | 0.9 diameter × 1.2 | 440 V | After mooring stations, main deck, each side of the stern door [H1] | H1, est. |
| PC | Provision crane | Electro-hydraulic slewing jib crane (maker n/v) | 1 | 1.5 t at 8 m; 7.5 kW (est.) | pedestal 0.6 diameter, jib 8.5 | 440 V | Boat deck, port side aft | est. |
| LB1, LB2 | Lifeboats and davits | Open motor lifeboat for 60 in glass-reinforced plastic, about 8.5 × 3.0 m, about 7.5 t loaded (est.: present open boats are 8.02 × 2.65 m for 52 and 8.50 × 3.10 m for 72 [D21]). Gravity davits of the roller-track kind: the arms run down inclined trackways on rollers, one fall on two winch drums, lowered by a brake lever [D20]. Maker (Schat or Welin) and size of 1975: n/v | 2 | winch 11 kW for hoisting (est.: present winches are 7.5 and 15 kW [D22]); lowering by gravity, centrifugal brake and hand brake, hand crank [D19] | davit about 3.5 high, 6.6 between arms (a present davit's letters, undefined [D23]) | 440 V, emergency board | Boat deck, 81.5 to 90.5 m from the transom, P and S [H1] | D19 to D23 H1 |

### 1.12 Ventilation and air conditioning

| Tag | Name | Make and type | Off | Rating | Size (m) and weight | Driven by, voltage | Where | Source |
|---|---|---|---|---|---|---|---|---|
| EF1, EF2 | Engine room supply fans | Axial, two-speed, with fire dampers (Nordisk Ventilator, Næstved, in the marine trade since 1952 [R29]; type n/v) | 2 | 12.5 m³/s each at 600 Pa; 15 kW | 1.25 diameter × 0.9 (est.) | 440 V | in the starboard engine room air trunk at the upper deck, with louvred intakes | R1 R29 |
| AF1, AF2 | Auxiliary engine room supply fans | Axial | 2 | 5 m³/s each; 7.5 kW | 0.9 diameter × 0.7 (est.) | 440 V | in the auxiliary room's trunk, starboard | R1 |
| XF | Separator room, workshop and control room fans | Small axial and centrifugal fans; the separator room's draws from hoods over the separators to the port uptake | 3 | 1.5 m³/s and less; 1.5 kW each | | 440 V | at each room | est. |
| VF1 to VF4 | Main deck exhaust fans | Axial, two-speed, spark-proof: all four at low speed give 10 air changes an hour at sea, all four at full speed 20 while loading | 4 | 11 m³/s each at full speed; 11 kW (2.8 kW at low speed) | 1.25 diameter × 0.9 (est.) | 440 V | Fan room, port casing, 54.6 to 66.0 m from the transom [H1], and the after casings | R2 R3 H1 |
| VS1, VS2 | Main deck supply fans | Axial, two-speed: four fifths of the exhaust, so the deck stays under the pressure of the stairs | 2 | 17.5 m³/s each; 15 kW | 1.4 diameter × 1.0 (est.) | 440 V | forward, in the trunks under the house | H6 |
| HF1, HF2 | Lower hold exhaust fans | Axial, spark-proof: one gives 10 changes, two give 20 | 2 | 8.1 m³/s each; 7.5 kW | 1.0 diameter × 0.8 (est.) | 440 V | Fan room and the lower hold's trunk [H1] | R2 H1 |
| HS1, HS2 | Lower hold supply fans | Axial | 2 | 6.5 m³/s each; 5.5 kW | 1.0 diameter × 0.8 (est.) | 440 V | Lower hold ventilation trunk, starboard casing [H1] | H1 |
| AHU | Accommodation air handling unit | Filter, steam preheater, cooling coil, steam reheater, centrifugal fan; ducted to cabin units | 1 | 18,000 m³/h (5 m³/s); fan 15 kW (est.: about 7 changes an hour of 2,600 m³) | 4.5 × 2.2 × 2.2; 2.5 t (est.) | 440 V | Air conditioning room in the house (**the hull's arrangement names none: proposed in "Lockers and air trunk" on the boat deck**) | est. |
| ACC | Air conditioning refrigerating plant | Reciprocating compressor, sea-water-cooled condenser, receiver (refrigerant R22 in 1975; changed at the refit) | 1 | about 150 kW of cooling; compressor 55 kW; a sea water pump and a chilled water pump of 5.5 kW each | 3.0 × 1.2 × 1.8; 2 t (est.) | 440 V | Air conditioning room | est. |
| PR | Provision refrigerating plant | Two small compressors, one running, for the cold room and the freezer | 2 | 4 kW each | 1.4 × 0.8 × 1.0 (est.) | 440 V | beside the cold rooms, upper deck [H1] | est. |

### 1.13 Sanitary and fresh water

| Tag | Name | Make and type | Off | Rating | Size (m) and weight | Driven by, voltage | Where | Source |
|---|---|---|---|---|---|---|---|---|
| T-FWP, T-FWS | Fresh water tanks | Built-in | 2 | about 60 m³ each [H1] | | | each side of the after passage, frames 12 to 28 [H1] | H1 |
| HY | Fresh water hydrophore | Pressure tank with two pumps, pressure switches, an air charging connection | 1 | 1,000 l; 2 pumps of 3 kW, 5 m³/h at 5 bar | tank 1.0 diameter × 2.0 (est.; a 500 l unit of today is 1.24 × 0.96 × 1.92 [A22 (summary, uncertain)]) | 440 V | After passage [H1] | H1 A22 |
| SY | Sanitary sea water hydrophore | As HY: flushing water for the toilets, the practice of 1975 | 1 | 500 l; 2 pumps of 3 kW | 0.8 diameter × 1.8 (est.) | 440 V | After passage | est. |
| CAL | Hot water calorifier | Upright, steam coil and an electric heater for when there is no steam, circulating pump | 1 | 750 l; steam 60 kW; electric 30 kW; pump 0.55 kW | 0.8 diameter × 1.9 (est.) | steam; 440 V | After passage | est. |
| STP | Sewage treatment plant | Hamworthy Super Trident, extended aeration, a type fitted to ships since 1963 [A19]; the old ST4A was rated 6,010 l a day [A19 (summary)]: 75 persons at 70 l. Fitted at the refit; before it a holding tank | 1 | 6,010 l a day; two blowers of 1.5 kW, discharge pump 3 kW | 2.72 × 2.08 × 1.82; 5.0 t full (today's unit of the same rating [A19]) | 440 V | AER lower, x 22.0 to 24.7, y 6.0 to 8.1 P | A19 |
| UV | Steriliser and mineraliser | For the fresh water generator's water (refit) | 1 | 1 m³/h | 0.8 × 0.3 × 0.4 | 230 V | After passage | est. |
| INC | Incinerator | **None fitted.** Sludge and oily bilge water are landed ashore through the discharge flange at the bunker stations. (A present incinerator of 465 kW is 1.7 × 1.9 × 1.96 m and 3.2 t [A23 (summary)]: there is room for one on the upper deck abaft the starboard funnel) | 0 | | | | | A23 |

### 1.14 Workshop, stores and lifting gear

Makes are not given: no source for a ship's workshop of 1975 was reached (n/v). Sizes are typical of the kind.

| Tag | Name | What it is | Off | Rating | Size (m) and weight | Driven by, voltage | Where | Source |
|---|---|---|---|---|---|---|---|---|
| WS-L | Centre lathe | 1,000 mm between centres, 200 mm centre height, with chucks and a steady | 1 | 4 kW | 2.4 × 1.0 × 1.4; 1.2 t | 440 V | Workshop, platform, x 0 to 4.2, y 0.9 to 7.4 S, along the after bulkhead | est. |
| WS-D | Pillar drill | 32 mm in steel, with a machine vice | 1 | 1.5 kW | 0.8 × 0.5 × 2.0; 0.3 t | 440 V | Workshop | est. |
| WS-G | Double-ended grinder | 250 mm wheels on a pedestal, with eye shields | 1 | 1.1 kW | 0.6 × 0.4 × 1.3 | 440 V | Workshop | est. |
| WS-W | Welding | Welding rectifier of 300 A with a steel-topped table, a fume hood and its fan; gas welding with the oxygen and acetylene bottles in lockers on the open deck and pipes down | 1 | 15 kVA | table 1.5 × 0.8 × 0.9 | 440 V | Workshop, in a screened corner | est. |
| WS-B | Benches and boards | A bench 4 m long with two vices and drawers; a nozzle test stand; a valve grinding stand; a tool board (the owner's photograph E2: blue perforated board, hose hanger, **the whiteboard with the engines' service intervals** [H5]) | 1 | | bench 4.0 × 0.8 × 0.9 | | Workshop | H5 |
| STORE | Engine store | Steel shelving and bins; a spare cylinder head, piston with rod, liner, a set of bearings, fuel pumps and valves for the main engines on bolted stands | 1 | | shelving 0.6 deep along three walls | | Engine store, platform, x 4.2 to 8.4, y 0.9 to 7.4 S; the heavy spares at SPR on the starboard gallery | est. |
| LR1 to LR4 | Lifting rails over the main engines | Fore-and-aft rolled-steel joists under the main deck's webs, one over the line along which each bank's pistons draw, each with a geared trolley and a low-headroom chain block. The two inner rails run on forward to the cross rail LR5; the two outer ones stop short of the exhaust crossing. An eye plate over each turbocharger | 4 | 1.5 t each (est.: a cylinder head of a 370 mm engine is about 0.5 t, a liner about 0.5 t, a piston with its rod about 0.3 t; n/v) | inner rails 10 m long, x 10 to 20; outer rails 7.3 m, x 10 to 17.3; hook at 5.45 m above the keel | by hand | inner at y 0.97, outer at y 4.33, P and S | est. |
| LR5, LR6 | Cross rails | Athwartships joists: LR5 forward of the engines, joining the two inner rails under the soft patch; LR6 over the gears, joining all four and reaching the walkway | 2 | 3 t | LR5 3 m long, LR6 11 m | by hand | x 19.6 and x 10.0 | est. |
| SP1 | Soft patch | A bolted flush plate in the main deck over the forward end of the centre aisle, for shipping a piston, a liner, a turbocharger, an alternator: opened in port with the deck empty | 1 | opening 2.8 × 2.0 m | | lifted by a truck crane on the deck | x 18.6 to 21.4, centreline | est. |
| LR7 to LR9 | Rails over the generating sets | Athwartships joist over each set | 3 | 1 t | 3 m | by hand | AER | est. |

### 1.15 Control

| Tag | Name | What it is | Off | Where | Source |
|---|---|---|---|---|---|
| ECR | Engine control room | 4.2 × 6.5 m [H1], windows forward over the gears and engines; the control desk across the forward side; a door to the centre passage and one to the walkway before the windows; a desk, a chart of the systems, the telephone, a settee | 1 | Platform, x 4.2 to 8.4, y 0.9 to 7.4 P | H1 |
| CD | Control desk (1975) | Described in section 5: pitch levers, engine speed setters, clutch buttons, gauges, the alarm panel, the pump starters, the telegraph | 1 | in ECR | P4 R19 |
| AMS | Alarm and monitoring system | 1975: an annunciator of lamp windows with a horn and a group alarm to the bridge and the engineers' cabins. Refit: an integrated system with screens (section 5) | 1 | ECR, bridge, cabins | R18 R19 R24 R27 |
| BC | Bridge control | Pitch levers for the two propellers on the bridge and at both wings, working the pitch setters by pneumatic signal, as on the pattern [P4]; thruster control at the same three places [P4] | 1 | Bridge | P4 H4 |

---

## 2. The arrangement of the machinery spaces

### 2.1 The heights that rule everything

The room is low: 5.0 m from the tank top (1.6 m) to the main deck (6.6 m), and trailers drive on that deck, so nothing
can rise through it on the centre. Every choice below follows from that. Heights are above the keel.

| What | Height | Basis |
|---|---|---|
| Tank top | 1.60 m | H1 |
| Bottom of each engine's well (the tank top lowered between the seating girders, 7.2 × 2.1 m under each engine) | 1.20 m | est.: the engine's oil pan hangs into it |
| Floor plates of the lower level | 2.00 m | est.: 0.4 m over the tank top |
| Propeller shaft at the gear's output flange (x 8.8) | 2.31 m | H2 |
| Crankshaft, parallel to the shaft and beside it: at the engine's after end, middle, forward end | 2.42, 2.53, 2.65 m | the 2° of the shaft line [H2] |
| Underside of the engine's oil pan at the middle | about 1.38 m | est.: 1.15 m under the crankshaft; the maker's installation drawing is needed (n/v) |
| Tops of the cylinder head covers | about 4.55 m | est.: 2.0 m over the crankshaft |
| Platform and wing galleries | 4.00 m | H1 |
| Top of the engine (turbochargers and air coolers) at the middle and forward | 5.22, 5.34 m | 3.84 m over the pan [P2] |
| Hooks of the lifting rails | 5.45 m | est.: rails under the deck webs |
| Underside of the main deck's webs (taken as 0.7 m deep, every fourth frame, 2.4 m apart) | 5.90 m | est.: the hull's steel is to confirm it |
| Underside of the main deck's ordinary beams | 6.35 m | est. |
| Main deck | 6.60 m | H1 |

Three things follow.

1. **The gear is a horizontal-offset gear.** With the input above the output (the usual vertical offset of about 0.7 m)
   the engine's top would stand at 5.9 to 6.0 m, in the deck's webs. With input and output side by side the crankshaft is
   at the shaft's height, the engine's top is 0.55 m under the webs, and the engine stands 0.75 m nearer the centreline
   than its shaft.
2. **Pistons draw out sideways and upward, along the cylinder's axis, 30° from the vertical.** To clear a piston with its
   rod (about 1.45 m long: est.) the hook must stand about 2.9 m above the crankshaft and 1.68 m to the side of it: at
   5.45 m above the keel. That is just what a rail under the webs gives. The piston withdrawal height of the 12 M 540 is
   n/v: if the maker's figure is more, pistons come out between two webs with a rail fixed to the beams (hook to 5.9 m).
3. **The exhaust cannot run under the deck above the galleries.** A lagged 700 mm pipe is 0.9 m across; under the webs its
   underside is at 5.0 m, one metre over a gallery at 4.0 m. So each engine's exhaust crosses to the ship's side once, at
   the engine's forward end where there is no gallery, lying in the bay between two webs (underside 5.45 m, 3.4 m over the
   floor plates), turns up through the main deck into the side casing, and runs aft in the top of the casing to the funnel.

### 2.2 The main engine as it is to be drawn

Only the first three rows are read of the engine or its successor; the rest is how V engines of its size and time were
commonly built, set down so that the modeller has one answer, and all of it n/v until a drawing of the 540 is found.

| Part | Where on the engine | Basis |
|---|---|---|
| Cylinders | Two banks of six, 60° between them, 370 mm bore, 400 mm stroke | P1 |
| Cylinder heads, frame | A head to each cylinder with four valves; crankcase and heads of nodular cast iron | P2 (the 640) |
| Fuel, governor | Heavy fuel or gas oil; hydraulic governor | P2 (the 640) |
| Flywheel and turning gear | After end, towards the gear | est. |
| Cylinder spacing | About 0.8 m, the banks staggered by a connecting rod's width | est. from the length |
| Turbochargers | Two, one a bank, on a bracket over the forward end, exhaust outlets upward into one pipe; make n/v | est. |
| Charge air coolers | Two, under the turbochargers at the forward end, sea-water-cooled; an air pipe along the outside of each bank | est. |
| Exhaust manifolds | Inside the V, lagged and covered | est. |
| Camshafts | One a bank, low on the outside, behind a row of doors (the maker's smaller V engines have them so [P1]) | P1, est. |
| Fuel injection pumps | One a cylinder, in a row above each camshaft on the outside of the bank, with the fuel supply and return rails | est. |
| Crankcase doors | One to each pair of cylinders, low on each side, with relief valves (the owner's photograph F1 shows camshaft doors over round clamped crankcase doors [H5]) | H5, est. |
| Oil pan | Shallow and dry, two outlets at the bottom | est. |
| Connections | At the forward end, low: lubricating oil in (125), jacket water in and out (125), sea water to the air coolers (150), starting air (50), fuel in and out (32), on the side facing the centre aisle | bores [P5], places est. |
| Starting | Air-start valves in the heads of one bank, a distributor on that camshaft's end | est. |
| Control stand | At the forward end on the side facing the centre aisle: starting lever, fuel lever, gauge board, the governor above | est. |
| Footboards | Along each bank at about 3.4 m, with handrails | est. |
| Colour | Light green; floor plates blue, lifting plates edged yellow | H5 (the owner's photograph F1) |
| Firing order, valve timing, clearances | n/v | |

### 2.3 What stands where: the engine room (frames 28 to 64, x 0 to 21.6)

The hull's half-breadth at 2.0 m above the keel is 8.3 m at x 8.4, 9.1 m at x 14 and 9.4 m at x 21.6; at the platform it
is 9.6 to 9.8 m throughout [H3]. Abaft x 8.4 the bottom rises: on the centreline it is 1.06 m above the keel at x 8.4 and
2.45 m at the after bulkhead [H3], and each shaft leaves the hull about x 2.2 [H2].

**Lower level, under the platform (the shaft space, x 0 to 8.4).** Headroom is 1.2 to 1.75 m under the platform's beams
(3.75 m): a space to stoop in, floored with plates on the rising floors at about 2.2 to 2.6 m.

| Item | x | y | Notes |
|---|---|---|---|
| Stern tube inboard seals (ST1, ST2) | 4.6 | 3.40 P, S | shaft 2.17 m above the keel; a drip tray and a lamp at each |
| Tail shaft couplings with the shaft brakes (SB1, SB2) | 5.8 | 3.40 P, S | the tail shaft draws out aft, through the stern tube, in dock |
| Plummer blocks (PB1, PB2) | 7.4 | 3.40 P, S | |
| Oil distribution boxes (OD1, OD2) | 8.1 to 8.7 | 3.40 P, S | with the hand pitch levers and the mechanical pitch scale, reached from the lower floor at x 8.4 |
| Shaft generators (SG1, SG2) | 6.4 to 8.7 | 1.4 to 2.7 P, S | centre 2.3 m above the keel, top 3.0 m; each draws out aft on a rail under the platform |
| Pitch oil units (CPH1, CPH2) | 2.4 to 4.3 | 0.4 to 1.7 P, S | |
| Stern tube drain tank and pump (STD) | 4.6 | 0 | |
| After bilge well | 1.0 | 0 | the lowest point of the shaft space |

**Lower level, forward of the platform (x 8.4 to 21.6).** Open to the main deck except under the wing galleries.

| Item | x | y | Notes and clearances |
|---|---|---|---|
| Reduction gears (GB1, GB2) | 8.95 to 11.15 | 1.75 to 4.25 P, S | top about 3.5 m; the top cover lifts on cross rail LR6; stand-by pump and cooler outboard of each |
| Flexible couplings (FC1, FC2) | 11.15 to 11.85 | 2.65 P, S | under a guard; the turning gear at the flywheel |
| **Main engines (ME1, ME2)** | 11.85 to 18.49 | 0.89 to 4.41 P, S | flywheel aft, turbochargers and charge air coolers forward (as the exhaust needs: section 7 says what is not known of the type) |
| Centre aisle | 8.4 to 21.6 | 0.89 S to 0.89 P | 1.78 m wide between the engines; both inner banks' pistons draw into it |
| Wing aisles | 8.4 to 21.6 | 4.4 to 5.3 P, S | 0.9 m wide, along each engine's outer bank, under the edge of the gallery |
| Lubricating oil pumps and filter (LO-P1, LO-P2, LO-PP1, LO-F1 to port; LO-P3, LO-P4, LO-PP2, LO-F2 to starboard) | 8.8 to 11.4 | 5.3 to 6.9 P, S | under the galleries, 1.75 m headroom |
| Lubricating oil coolers (LO-C1, LO-C2) | 8.8 to 12.2 | 7.5 to 8.4 P, S | on stools, axis 2.8 m above the keel (the side is 9.0 m out there [H3]); bundle draws aft under the platform to x 5.6: clear |
| Jacket water coolers (FW-C1, FW-C2) | 12.8 to 16.0 | 7.6 to 8.5 P, S | bundle draws forward to x 19.0: clear |
| Jacket water pumps FW-P1, FW-P3 | 12.6 to 15.2 | 5.3 to 6.5 P | |
| Jacket water pump FW-P2 and preheater FW-PH | 12.4 to 15.6 | 5.3 to 6.5 S | |
| Sea chests and strainers (SC-H port, SC-L starboard) | 15.0 to 16.8 | 8.6 to 9.4 P, S | the sea valves' handwheels on extended spindles above the floor plates |
| Sea water pumps SW-P1, SW-P2 and harbour pump SW-HP | 16.6 to 19.8 | 5.4 to 7.2 P | forward of the port gallery's end: open above, so a motor lifts straight up to cross rail LR5 |
| Fire pump FP1 and bilge pump BG-P1 | 16.6 to 18.7 | 5.4 to 7.2 S | |
| Bilge piston pump and oily water separator (BG-PP, OWS) | 18.9 to 20.4 | 5.4 to 7.2 S | |
| Nozzle cooling unit (NC) | 18.9 to 20.3 | 2.0 to 3.4 P | |
| Sea water cross-over main, 300 mm | along x 20.9 | from 8.9 P to 8.9 S | on the tank top under a raised step of floor plates, 0.9 m wide and 0.35 m high |
| Watertight sliding door to the auxiliary engine room | 21.6 | 0 | 0.8 × 1.8 m clear, hydraulically worked from both sides and from the bridge |
| Forward bilge wells | 20.5 | 8.3 P, S | and one under the centre aisle at x 11.5 |

**Platform (4.0 m).** The after part lies across the ship over the shaft space, as the hull's arrangement has it [H1].

| Item | x | y | Notes |
|---|---|---|---|
| Main switchboard room | 0 to 4.2 | 0.9 to 7.4 P | two rows of panels athwartships facing each other across a 1.2 m aisle, 0.6 m behind each row; T1, T2 at the outboard end; a door to the centre passage and one to the control room. 2.2 m clear under a lined deckhead |
| Engine control room (ECR) | 4.2 to 8.4 | 0.9 to 7.4 P | the desk across the forward side under three windows |
| Workshop | 0 to 4.2 | 0.9 to 7.4 S | |
| Engine store | 4.2 to 8.4 | 0.9 to 7.4 S | |
| Centre passage | 0 to 8.4 | 0.9 S to 0.9 P | a hinged watertight door in the after bulkhead to the after passage and the steering gear (three steps up to the flat at 4.7 m) |
| Side passages | 0 to 8.4 | 7.4 to 9.6 P, S | the group starter boards GSP1 and GSP2 against the rooms' outboard walls at x 5.0 to 7.6; to starboard the door to the escape trunk at x 0 |
| Walkway before the control room's windows | 8.4 to 9.4 | 9.6 S to 9.6 P | grating; it joins the centre passage, both side passages and both galleries |
| **Port wing gallery** | 9.4 to 17.2 | 4.6 to 9.6 P | grating on beams, a rail along its inboard edge. On it: the foot of the stair from the main deck (x 9.4 to 12.4, y 8.3 to 9.4) and the fuel booster unit FO-BU (x 12.6 to 16.8, y 5.2 to 7.6) |
| **Starboard wing gallery** | 9.4 to 17.2 | 4.6 to 9.6 S | On it: the control air compressor, dryer and receiver (x 9.6 to 12.2, y 6.0 to 8.0), the fresh water generator FWG (x 13.0 to 15.4, y 5.6 to 7.6), the heavy spares SPR (x 15.8 to 17.0, y 8.0 to 9.4) |
| Exhaust crossings and risers (EX1, EX2) | 17.5 to 19.3 | 2.65 to 9.4 P, S | forward of the galleries' ends; the riser passes the main deck at y 7.8 to 9.4 |
| Cylinder head footboards | 11.9 to 18.5 | along each bank | fitted to the engines at about 3.4 m, 0.4 m wide, reached by short ladders from the floor plates and, for the outer banks, by a step across from the gallery |

**Ways on foot.** In: from the main deck through a door in the port casing (the engine room entrance [H1]), down a stair
of 2.6 m rise inside the casing's foot to the port gallery at x 9.4. Between levels: an inclined ladder on the centreline
from the walkway (x 9.4) down forward to the centre aisle (it lands at x 10.6); a ladder from the forward end of each
gallery (x 17.2) down to the floor plates at x 18.0. **Out in an emergency:** (1) the stair to the main deck; (2) the door
at the after starboard corner of the platform into the escape trunk, a vertical ladder in the starboard casing to the
upper deck [H1]; (3) the watertight door into the auxiliary engine room and that room's own ladder.

**Floor plates and what lies under them.** Chequered steel plates of about 1.0 × 0.7 m on angle bearers, 2.0 m above the
keel, lifting plates edged yellow over every valve, well and manhole, painted blue as in the owner's photograph F1 [H5].
The space under them is only 0.4 m deep, so only pipes of 150 mm and less cross under the floor: the bilge main (125 mm)
along the centreline with its branches to the wells; the lubricating oil suctions rising through the tank top from the
circulating tanks to the pumps (200 mm: they lie in a trench of the tank top 0.25 m deep from each engine's well to its
pumps); the jacket water and sea water branches to each engine (125 and 150 mm); the drains to the leak and bilge tanks.
The larger pipes do not go under the floor: the sea water mains (200 and 300 mm) run in the wings against the ship's side
below the galleries, and the cross-over under its raised step. The tank top carries the manholes of the double-bottom
tanks, each under a marked plate, and their sounding pipes.

**Lifting.** Four fore-and-aft rails LR1 to LR4, one over each bank's withdrawal line: the inner ones (y 0.97 P and S) from
x 10 to 20, the outer ones (y 4.33 P and S) from x 10 to 17.3, where the exhaust crosses. A cross rail LR5 at x 19.6 joins
the inner rails under the soft patch SP1; a cross rail LR6 at x 10.0 over the gears joins all four. Loads leave the ship
through SP1 (a bolted plate in the main deck, x 18.6 to 21.4 on the centreline) or go by trolley along LR6 to the walkway
and by hand truck through the centre passage to the workshop. Under the galleries each cooler has an eye plate in line with
its bundle.

### 2.4 What stands where: the auxiliary engine room (frames 64 to 78, x 21.6 to 30.0)

Half-breadth 9.5 m at the floor and 9.8 m at the platform [H3]. A platform at 4.0 m runs along the port side (tanks and the
separator room) and the after starboard corner (oil storage); the middle is open from the floor to the main deck over the
generating sets.

| Level | Item | x | y | Notes |
|---|---|---|---|---|
| Lower | Generating sets DG1, DG2, DG3 | 22.6 to 26.3 | centres 1.6 P, 2.0 S, 5.6 S | crankshafts fore and aft, alternators forward; 2.3 m between sets; a rail athwart over each (LR7 to LR9) |
| Lower | Heeling pump HL-P | 28.3 to 29.7 | 0 | its 300 mm pipes pass the forward bulkhead to the heeling tanks each side of the lower hold |
| Lower | Starting air compressors AC1, AC2; emergency compressor AC-E | 26.8 to 28.3 | 3.3 to 7.2 P | under the separator room |
| Lower | Air receivers AR1, AR2, AR3 | 29.2 to 29.8 | 2.8 to 6.4 P | lying athwartships on the forward bulkhead |
| Lower | Sludge tank T-SL | 23.6 to 26.2 | 3.2 to 5.2 P | under the separators |
| Lower | Fuel transfer pumps FO-TP1, FO-TP2 | 22.2 to 23.4 | 3.2 to 4.4 P | |
| Lower | Sewage plant STP | 22.0 to 24.7 | 6.0 to 8.1 P | under the settling tank |
| Lower | Boiler AB with its burner inboard | 26.6 to 28.9 | 6.0 to 8.3 S | on the tank top; its flue leaves the top outboard into the trunk above |
| Lower | Hotwell HW, feed pumps FD-P, circulating pumps BC-P, dump condenser DC | 26.7 to 29.8 | 3.4 to 8.6 S | round the boiler |
| Lower | Fire pump FP2, bilge pump BG-P2 | 22.2 to 24.6 | 7.0 to 8.8 S | **with a sea inlet of their own in this room (150 mm, starboard): the hull has none here yet** |
| Lower | Water mist unit WM-P | 22.0 to 23.2 | 8.3 to 9.1 P | |
| Platform | Heavy fuel settling tank T-HFS | 21.8 to 26.4 | 5.9 to 9.6 P | 4.0 to 6.5 m above the keel |
| Platform | Heavy fuel service tank T-HFD | 26.4 to 28.6 | 5.9 to 9.6 P | |
| Platform | Diesel oil service tank T-DOD | 28.6 to 29.9 | 5.9 to 9.6 P | |
| Platform | Separator room: FO-SEP1, FO-SEP2, FO-SEP3, LO-SEP1, LO-SEP2 in a row, heaters and control boxes on the outboard wall | 22.0 to 29.6 | 2.6 to 5.6 P | a steel floor with a 150 mm coaming draining to T-SL; a hood and an exhaust fan; a door at each end; a rail overhead for the bowls |
| Platform | Lubricating oil storage tanks T-LS1, T-LS2, T-LR, T-LG, T-LD, T-LH | 21.9 to 26.2 | 6.6 to 9.6 S | |
| Platform | Expansion tank FW-ET3 | 25.0 | 2.0 S | under the deck over DG2 |

Ways on foot: the watertight door from the engine room at the lower floor; an inclined ladder from the floor to the
separator room's after door (x 22.0, y 2.4 P); a walkway at 4.0 m across the after bulkhead to the oil storage platform.
Escape: a vertical ladder in the auxiliary room's trunk in the starboard casing (x 27 to 29, y 8.6 S) to the upper deck.

### 2.5 The casings and funnels

Each side casing is 2.3 m wide (7.5 to 9.8 m off the centreline) and stands on the main deck to the upper deck (6.6 to
13.2 m); each funnel stands on the upper deck over its uptake, 2.0 m wide, 7.0 m long, its top 22.4 m above the keel [H1].

| Casing space at the main deck | x (from the transom) | Port | Starboard |
|---|---|---|---|
| Aft of the engine room | -9.6 to -4.2 (7.2 to 12.6) | Hydraulic pump room: HPU-R, HPU-L [H1] | deck store [H1] |
| | -4.2 to -0.6 (12.6 to 16.2) | deck store [H1] | Engine room escape trunk [H1] |
| Uptake under the funnel | -0.6 to 6.4 (16.2 to 23.2) | ME1's exhaust arrives at the top from forward and turns up into the funnel; the port engine room exhaust air; STH1 | ME2's exhaust, the three generating sets' exhausts and the boiler flue, all arriving from forward; STH2 |
| | 6.4 to 13.8 (23.2 to 30.6) | Engine room entrance and stair [H1]; ME1's exhaust overhead | Engine room air trunk [H1]: supply fans EF1, EF2 at the upper deck, air down to the galleries; the pipes overhead |
| | 13.8 to 17.2 (30.6 to 34.0) | deck workshop [H1] | air trunk |
| Exhaust trunk | 17.2 to 19.4 (34.0 to 36.2) | **EX1: ME1's riser and economiser EGE1** (proposed: taken from the deck workshop) | **EX2: ME2's riser and EGE2**, in the air trunk |
| | 19.4 to 21.6 (36.2 to 38.4) | **Drencher valve station DV** (proposed) | air trunk |
| Over the auxiliary engine room | 21.6 to 30.0 (38.4 to 46.8) | lashing store [H1] | Auxiliary engine room trunk [H1]: generating sets' exhausts, boiler flue, fans AF1, AF2, the escape ladder |

**Each main engine's exhaust**, 700 mm bore (section 3.7): from the two turbochargers' common outlet at the engine's
forward end (x 17.9, 5.2 m above the keel) through a bellows, outboard at x 18.0 in the bay between the webs at x 16.8
and 19.2 (centre 5.9 m), up through the main deck at y 8.6, through the economiser (7.2 to 10.8 m), a bend at 11.9 m, then
aft for 13 m along the top of the casing (centre 12.3 m, over the head of the entrance stair on the port side), up into the
funnel, through the silencer (13.5 to 18.0 m) and out 0.5 m above the funnel's top, cut on the slant and raked aft like
the pipes of the owner's photographs B3 and B4 [H5]. Fixed points at the economiser and at the silencer; bellows between.

**The generating sets' exhausts** (250 mm each) rise from each set into the bay between the webs at x 24.0 and 26.4, cross
to starboard, go up the auxiliary room's trunk to 11 m, and run aft in the starboard casing below ME2's pipe to the
starboard funnel, each to its own silencer and its own outlet. **The boiler's flue** (350 mm) goes with them. So the
**port funnel carries one pipe** (ME1) and the engine room's exhaust air louvres, and the **starboard funnel carries five**
(ME2, DG1, DG2, DG3, the boiler), each of its own diameter, as the owner asked of a funnel: "a casing round real uptakes"
[H5]. The emergency set's exhaust is its own, on the house [H6].

**On the upper deck**, proposed and not yet in the hull's arrangement: the carbon dioxide room against the forward end of
the port funnel (23.2 to 26.8 m from the transom), entered from the open deck; the engine room fan house against the
forward end of the starboard funnel, with the louvred intakes of EF1 and EF2 facing outboard.

### 2.6 The other machinery spaces

| Space | What stands in it |
|---|---|
| Steering gear room (frames 0 to 12, flat at 4.7 m) [H1] | Rudder stocks at 4.2 m from the transom, y 3.40 P and S, each with its carrier bearing and tiller pointing forward; the two rams athwartships outboard of the tillers; the tie bar across at the tillers' ends; power units SGR-PU1 and SGR-PU2 on the centreline at 5.5 to 6.5 m; the emergency stand SGR-E between them; a storage tank of 400 l on the forward bulkhead; a fan; a bilge well with an alarm |
| After passage (frames 12 to 28, centre 2.4 m) [H1] | Fresh water hydrophore HY, sanitary hydrophore SY, calorifier CAL, steriliser UV along the port side; the fresh water tanks' level gauges; the passage itself 1.2 m clear |
| Hydraulic pump room (main deck, port casing, 7.2 to 12.6 m) [H1] | HPU-R forward, HPU-L aft, each on a drip tray; the valve stand of the ramp against the inboard wall with a window to the ramp; a hand pump; an oil cooler; a fan; a door to the after mooring station |
| Forward pump room (frames 144 to 164, centre 3.6 m) [H1] | BA-P1, BA-P2, FP3, DR-P, each with its own sea suction from a chest in the room; the ballast valve manifold; a bilge well with an alarm; entered by a trunk from the main deck |
| Bow thruster room (frames 164 to 184) [H1] | BT in its tunnel at frame 168, BT-M upright on its stool, BT-ST and BT-HP on the after bulkhead, the header tank above; a fan; a bilge alarm shared with the pump room, as the pattern has [H5] |
| Emergency generator room (officers' deck) [H1][H6] | EG, EG-T, ESB, ET, the starting batteries and charger, the air ducts with their fire dampers: built already to the owner's drawing |
| Fore store (main deck forward of frame 184) [H1] | DM-HPU to starboard; the chain lockers; rope |

### 2.7 The plans

Scale: one character is 0.28 m along the ship, one line is 0.5 m across her. Port is at the top; x runs forward from the
engine room's after bulkhead. `#` is a watertight bulkhead, `~` the ship's side at that level, `=` a shaft, `:` the edge
of the platform above.

**Lower level** (tank top and floor plates; abaft the dotted line it is the shaft space under the platform). On the
shafts: S the stern tube seal, B the coupling and brake, P the plummer block, OD the oil distribution box. W the after
bilge well, L the foot of the centre ladder, X the sea water cross-over, D the watertight door, SC a sea chest, NC the
nozzle cooling unit, AR the air receivers, ACE the emergency compressor, SLT the sludge tank, STP the sewage plant, AB the
boiler, HW the hotwell, "BC,FD" the boiler's pumps.

```
                                                        PORT
    #                                                                            #                              #
    #                                         ~~~~~~~~~~~~+-----+~~~~~~~~~~~~~~~~#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
    #                          ~~~:~~~~~~~~~~~            | SC  ................ #                              #
    #                  ~~~~~~~~   :+------------+ +-------+-----+              . #                              #
    #             ~~~~~           :|   LO-C1    | |  FW-C1   |                 . # +---------+                  #
    #          ~~~                :+------------+ +----------+                 . # |         |                  #
    #       ~~~                   :+---------+                 +-----------+   . # |   STP   |      +ACE+       #
    #      ~                      :| LO-P,F1 |   +--------+    |  SW-P1,2  |   . # |         |      +---+    +-+#
    #                             :|         |   |FW-P1,3 |    |   SW-HP   |   . # +---------+      +----+   | |#
    #     shaft space under       :+---------+   +--------+    +-----------+   . #                  |AC2 |   | |#
    #       the platform          :                                            . #       +--------+ +----+   |R|#
    #    ~                        : +-------+ +-----------------------+        . #       |        | +----+   |A|#
    #   ~                         : |       | |                       |        . #       |  SLT   | |AC1 |   | |#
    ================S===B=====P==OD=|       | |                       | +----+ . #       |        | +----+   | |#
    #  ~                          : |  GB1  | |      ME1 (port)       | |NC  | . #       +--------+          +-+#
    #                      +-------+|       | |  Deutz SBV 12 M 540   | |    | . #   +------------+             #
    # ~                    |  SG1 :||       | |                       | +----+ . #   |    DG1     |             #
    #       +------+       +-------++-------+ |                       |        . #   |            |             #
    #~      |CPH1  |              :           +-----------------------+        . #   +------------+      +-----+#
    #       +------+              :                                            . #                       |     |#
    #  W                          :     L           centre aisle               X D                       |HL-P |#
    #       +------+              :                                            . #                       |     |#
    #~      |CPH2  |              :           +-----------------------+        . #                       +-----+#
    #       +------+       +-------++-------+ |                       |        . #   +------------+             #
    # ~                    |  SG2 :||       | |                       |        . #   |    DG2     |             #
    #                      +-------+|       | |    ME2 (starboard)    |        . #   +------------+             #
    #  ~                          : |  GB2  | |  Deutz SBV 12 M 540   |        . #                              #
    ================S===B=====P==OD=|       | |                       |        . #                  +------+    #
    #   ~                         : |       | |                       |        . #                  |BC,FD |    #
    #    ~                        : +-------+ +-----------------------+        . #                  |      |+--+#
    #                             :                                            . #   +------------+ +------+HW |#
    #     ~                       :+---------+  +-----------+  +-------++----+ . #   |    DG3     |         |  |#
    #                             :| LO-P,F2 |  | FW-P2,PH  |  |  FP1  ||OWS | . #   |            |+--------+--+#
    #      ~                      :|         |  +-----------+  | BG-P1 ||    | . #   +------------+|        |   #
    #       ~~~                   :+---------+                 +-------++----+ . #  +-------+      |  AB    |   #
    #          ~~~                :+------------+ +----------+                 . #  |       |      |        |   #
    #             ~~~~~           :|   LO-C2    | |  FW-C2   |                 . #  |  FP2  |      |        |   #
    #                  ~~~~~~~~   :+------------+ +-------+-----+              . #  | BG-P2 |      +--------+   #
    #                          ~~~:~~~~~~~~~~~            | SC  ................ #  +-------+                   #
    #                                         ~~~~~~~~~~~~+-----+~~~~~~~~~~~~~~~~#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
    #                                                                            #                              #
                                                      STARBOARD
x   0      2      4      6      8      10     12     14     16     18      20     22     24     26     28      30
```

**Platform, 4.0 m.** d the door to the after passage, e the door to the escape trunk, L the head of the centre ladder, the
dotted line the walkway before the control room's windows, EX1 and EX2 the exhaust risers, SPR the heavy spares, "AC-C, AD"
the control air compressor and dryer.

```
                                                        PORT
    #                                                                            #    ~~~~~~~~~~~~~~~~~~~~~~~~~~#
    #    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~+----------+~~~~~~~~~~~~~~~~~|+-----+~~~~~~~#+----------------+-------+---+#
    #~~~~                            |stair up  | port gallery    || EX1 |       #|                |       |   |#
    #                 +--------+     +----------+                 ||     |       #|                |  HFO  |   |#
    #                 | GSP1   |                                  |+-----+       #| HFO SETTLING   | SERV. |MDO|#
    +--------------+--+--------+--+              +--------------+ |              #|     44 m3      | 21 m3 |12 |#
    |              |              |              |              | |              #|                |       |   |#
    |              |              |              | FO-BU fuel   | |              #|                |       |   |#
    |              |              |              |booster unit  | |     (open    #+----------------+-------+---+#
    |              |              |              |              | |    to the    # +--------------------------+ #
    |  MAIN SWBD   |   CONTROL    |              +--------------+ |    floor)    # |                          | #
    |    ROOM      |    ROOM      |  ---------+-----------------------+          # |                          | #
    |  MSB T1 T2   |     ECR      |  .        |                       |          # |     SEPARATOR ROOM       | #
    |              |              |  .        |                       |          # | FO-SEP1,2,3  LO-SEP1,2   | #
    |              |              |  .        |      (ME1 below)      |          # |                          | #
    |              |              |  .        |                       |          # +--------------------------+ #
    |              |              |  .        |                       |          #                              #
    |              |              |  .        |                       |          #                              #
    +--------------+--------------+  .        +-----------------------+          #                              #
    #                                .                                           #                              #
    d       centre passage          L.       (open: centre aisle below)          #                              #
    #                                .                                           #                              #
    +--------------+--------------+  .        +-----------------------+          #                              #
    |              |              |  .        |                       |          #                              #
    |              |              |  .        |                       |          #       (open over the         #
    |              |              |  .        |      (ME2 below)      |          #         generators)          #
    |              |              |  .        |                       |          #                              #
    |              |              |  .        |                       |          #                              #
    |  WORKSHOP    |   ENGINE     |  .        |                       |          #                              #
    |              |    STORE     |  ---------+-----------------------+          #                              #
    |              |              |                               |     (open    #                              #
    |              |              |               +--------+      |    to the    #                              #
    |              |              |   +---------+ |        |      |    floor)    #                 +--------+   #
    |              |              |   |         | |  FWG   |      |              #+---------------+|        |   #
    |              |              |   |AC-C, AD | |        |      |              #|               ||  AB    |   #
    +--------------+--+--------+--+   |         | +--------+      |              #|               || below  |   #
    #                 | GSP2   |      +---------+           +----+|+-----+       #|  LO STORAGE   ||        |   #
    e                 +--------+                            |SPR ||| EX2 |       #|     TANKS     |+--------+   #
    #~~~~                             starboard gallery     |    |||     |       #|               |             #
    #    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~+----+|+-----+~~~~~~~#+---------------+             #
    #                                                                            #    ~~~~~~~~~~~~~~~~~~~~~~~~~~#
                                                      STARBOARD
x   0      2      4      6      8      10     12     14     16     18      20     22     24     26     28      30
```

**The casings at the main deck, 6.6 m** (this plan runs from 9.6 m abaft the engine room's after bulkhead; it is drawn at
0.36 m a character). SP1 is the soft patch over the centre aisle, DV the drencher valve station.

```
                                                       PORT
  +--------------+---------+-------------------+--------------------+--------+-----+------+----------------------+
  |              |         |                   |                    |        |     |      |                      |
  |  HYDRAULIC   |  deck   |    PORT UPTAKE    |    ENGINE ROOM     | deck   | EX1 | DV   |    lashing store     |
  |  PUMP ROOM   |  store  |   to the funnel   |     ENTRANCE       | wkshp  |EGE1 |      |                      |
  |              |         |                   |                    |        |     |      |                      |
  +--------------+---------+-------------------+--------------------+--------+-----+------+----------------------+
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :    MAIN DECK (6.6 m): five trailer lanes                   :                      :
                             :                                                            :                      :
                             :             between the casings                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                   +-------+:                      :
                             :                                                   |       |:                      :
                             :                                                   |  SP1  |:                      :
                             :                                                   |       |:                      :
                             :                                                   +-------+:                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
                             :                                                            :                      :
  +--------------+---------+-------------------+-----------------------------+-----+------+----------------------+
  |              |         |                   |                             |     |      |                      |
  | deck store   | ESCAPE  |    STBD UPTAKE    |    ENGINE ROOM AIR TRUNK    | EX2 | air  |   AUX. ROOM TRUNK    |
  |              |  TRUNK  |   to the funnel   |        fans EF1, EF2        |EGE2 |      | DG1-3, AB flue, air  |
  |              |         |                   |                             |     |      |                      |
  +--------------+---------+-------------------+-----------------------------+-----+------+----------------------+
                                                     STARBOARD
x     -8   -6    -4    -2    0     2    4     6     8   10    12   14    16    18   20    22   24    26    28   30
```

### 2.8 The length the machinery needs

| From aft | Metres |
|---|---|
| Shaft space: seals, couplings and brakes, plummer blocks, oil distribution boxes, shaft generators (the gear's output flange is fixed by the hull at x 8.8 [H2]) | 8.8 |
| Gear, from its output flange to its input flange | 2.35 |
| Flexible coupling and flywheel | 0.70 |
| Engine | 6.64 |
| Forward of the engine: the cross aisle, the cross-over, the door | 3.11 |
| **Engine room** | **21.6** |
| Auxiliary engine room: 1.0 m abaft the sets, the sets 3.7 m, 3.7 m forward of them for the compressors, receivers, boiler and heeling pump | 8.4 |
| **Together** | **30.0** |

The hull gives exactly this: frames 28 to 78, 16.8 to 46.8 m from the transom, between the after passage and the lower
hold [H1]. There is nothing to spare. The engine room could lose at most 0.9 m forward of the engines (2.2 m is the least
for the aisle, the cross-over and the door's swing of pipes); the auxiliary room could lose nothing. An engine longer than
6.64 m (an in-line engine of the power is about 9 m: n/v) would not go in.

---

## 3. Each system as a list of connections

This is what the piping diagrams and the pipes of the model are to be built from. Each line has a number, where it runs
from and to, what it carries, its nominal bore in millimetres (DN) and the valves and instruments on it. **The bores are
est.**, worked from the flow at the usual speeds (about 2 m/s in sea water and fresh water pressure pipes, 1 to 1.5 m/s
in suctions and in oil, 30 m/s in steam, 35 m/s in exhaust), except the engine connections, which are those a maker gives
for an engine of the same power and speed [P5] and are marked so. Valve types: "SDNR" is a screw-down non-return valve.

### 3.0 Colours and working conditions

Pipes are painted to **ISO 14726** (the 2008 edition, read for this basis [R17]). The standard gives a main colour for
each kind of content and an additional colour for the particular service, painted as a narrower band between two bands
of the main colour; the mark is put once in each room, at each side of a bulkhead or deck the pipe passes, by each valve,
and every 3 to 5 m [R17]. A yard of 1975 used its own or a national code (n/v): the marks below are the refit's.

| Content | Main colour | Mark for the service (main, additional, main) | Source |
|---|---|---|---|
| Sea water | Green | cooling sea water: green, yellow, green; ballast: green, violet, green | R17 |
| Fresh water | Blue | cooling fresh water: blue, violet, blue; drinking and other services: n/v | R17 |
| Fuel | Brown | heavy fuel: brown, black, brown; diesel oil: brown, yellow, brown | R17 |
| Oils other than fuel | Orange | engine lubricating oil: orange, yellow, orange; hydraulic oil: orange, grey, orange | R17 |
| Steam | Silver | n/v for condensate and feed | R17 |
| Non-flammable gases (compressed air, CO₂) | Grey | high-pressure air: grey, red, grey; control air: grey, violet, grey | R17 |
| Fire fighting | Red | fire main water: red, green, red; spray (drencher) water: red, violet, red | R17 |
| Waste media (bilge, sludge, sewage, exhaust drains) | Black | bilge water: black, green, black | R17 |
| Air and sounding pipes | Maroon | | R17 |
| Air in ventilation ducts | White | | R17 |
| Exhaust gas | lagged and clad in sheet metal, unpainted | mark n/v | |

| Working condition | Value | Source |
|---|---|---|
| Starting air | 30 bar; low-pressure alarm 15 bar | P5 (a present engine) |
| Control and working air | 7 bar | est. |
| Steam | 7 bar gauge, saturated (170 °C); 3 bar after the reducing station for tank coils and the accommodation | E8, est. |
| Heavy fuel: bunker tanks, settling tank, separator inlet | 40 to 50 °C, 50 to 70 °C, 98 °C | E17 |
| Heavy fuel at the engines | 7 to 8 bar; 13 cSt, about 118 °C for fuel of 180 cSt (temperature est.) | P5 |
| Fuel supply pumps, circulating pumps | 6 bar, 10 bar | P5 |
| Lubricating oil before the engine | 4.5 bar, 63 °C (a present engine); 78 °C after it | P5 |
| Jacket water after the engine | about 80 °C in 1975 (the pattern's generating sets ran at 80 to 82 °C [P4]); a present engine 93 °C | P4 P5 |
| Sea water after the main pumps; after the harbour pump | 2.4 bar; 1.5 to 1.75 bar | P4 |
| Sea water design temperature | 32 °C | P5 |
| Fire main | 8 bar at the pumps; 4 bar at the hydrants with two pumps running | R6 |
| Drencher | 6 bar at the pump; 5 l/m² a minute | R5 |
| Cargo access hydraulics | 210 bar (est.; 180 bar and 225 bar are recorded for one system of 1980 [D9]) | D9 |
| Deck machinery hydraulics | about 45 bar (inferred [D16]) | D16 |
| Steering gear | 160 bar at full torque (est.) | est. |
| Exhaust after the turbochargers | 380 to 420 °C (est.; a present engine 320 to 420 °C [P5]) | P5 |

### 3.1 Fuel oil

| Line | From → to | Medium | DN | Valves and instruments |
|---|---|---|---|---|
| FO-01 | Bunker stations BS-P, BS-S → filling main → T-HF1P, T-HF1S, T-HF2P, T-HF2S | Heavy fuel | 150 | At each station: blank flange, gate valve, pressure gauge, thermometer, sampling cock, save-all with a drain. At each tank: filling valve, level transmitter, high-level alarm, thermometer |
| FO-02 | Station → T-DOP, T-DOS | Diesel oil | 100 | As FO-01 |
| FO-03 | Bunker tanks → transfer suction main → FO-TP1 | Heavy fuel | 100 | Quick-closing suction valves on the wing tanks (QC), plain valves on the double-bottom tanks; duplex suction strainer; compound gauge |
| FO-04 | FO-TP1 → T-HFS; branches back to the filling main (tank to tank, or ashore) | Heavy fuel | 80 | SDNR at the pump, relief valve back to the suction, pressure gauge; high-level switch in T-HFS stops the pump |
| FO-05 | T-HFS → feed pumps of FO-SEP1, FO-SEP2 → FO-H1, FO-H2 → the separators | Heavy fuel, 98 °C | 32 | QC valve at the tank, strainer, thermostatic steam valve and thermometer at each heater, three-way valve returning cold oil to the tank, flow-setting valve, pressure gauge |
| FO-06 | Separators → T-HFD | Clean heavy fuel | 32 | Sight glass, non-return valve; valves to run the two in series (purifier then clarifier) or in parallel |
| FO-07 | T-HFD overflow → T-HFS | Heavy fuel | 50 | none: an open overflow, so the separators always run at full flow |
| FO-08 | T-HFD → change-over valve → FO-BU supply pumps | Heavy fuel | 50 | QC valve, three-way change-over valve (heavy fuel or diesel), suction strainers, compound gauge |
| FO-09 | T-DOD → change-over valve | Diesel oil | 40 | QC valve |
| FO-10 | Supply pumps FO-BP1, FO-BP2 → flow meter → mixing tank | Fuel, 6 bar | 40 | Non-return valves, pressure-control valve spilling back to the suction, pressure gauge and low-pressure switch (starts the stand-by pump), by-pass round the meter |
| FO-11 | Mixing tank → circulating pumps FO-CP1, FO-CP2 → heaters → FO-VIS → FO-AF → supply header → ME1, ME2 | Fuel, 10 bar, 118 °C | 50; 32 at each engine [P5] | Non-return valves, thermometers before and after the heaters, viscosity indicator and controller working the steam valve, differential pressure gauge and alarm at the filter, pressure and temperature transmitters at the header, a shut-off cock at each engine |
| FO-12 | ME1, ME2 return → pressure-control valve → mixing tank; mixing tank vent → T-HFD | Fuel | 32 each [P5], 40 common; vent 15 | Pressure-control valve, sight glass, automatic de-aerating valve |
| FO-13 | Engines' clean leak fuel → T-LK | Fuel | 20 [P5: 18] | Level alarm in T-LK; at the refit a leak alarm pot on each engine's shielded injection pipes |
| FO-14 | T-DOP, T-DOS → FO-TP2 → FO-SEP3 → T-DOD (or direct) | Diesel oil | 65 suction, 40 delivery | QC valve not needed (double bottom); strainer; high-level switch in T-DOD |
| FO-15 | T-DOD → DG1, DG2, DG3; returns → T-DOD | Diesel oil, by gravity | 25; returns 20 | QC valve at the tank, a duplex filter and a shut-off cock at each set, a flexible hose to the engine |
| FO-16 | T-HFD and T-DOD → AB-BR | Heavy fuel, diesel pilot | 25, 15 | QC valves, the burner's own pump, heater, solenoid valves and pressure gauge |
| FO-17 | T-DOD → FO-TP2 → riser → EG-T on the officers' deck; overflow back | Diesel oil | 25; overflow 32 | Filling valve at the tank, level gauge, overflow sight glass |
| FO-18 | Separators' sludge outlets → T-SL | Sludge | 80, falling all the way | none (open) |
| FO-19 | T-HFS, T-HFD, T-DOD drain cocks → funnel and tray → T-SL | Water and sludge | 40 | Self-closing cocks |
| FO-20 | T-SL → sludge pump SL-P → bunker stations (ashore) | Sludge | 65 | Steam coil and thermometer in the tank, high-level alarm, standard discharge flange |
| FO-21 | Overflows of T-HFS, T-HFD, T-DOD and the bunker tanks → overflow main → T-OF | Fuel | 80 to 100 | Sight glass and flow alarm in the main; high-level alarm in T-OF |
| FO-22 | Every fuel tank → vent head on the upper deck | Air | 50 to 100 | Vent heads with flame screens and float closures, in the casings' tops and at the ship's side |

All heavy fuel pipes are steam-traced and lagged. The quick-closing valves are shut from the cabinet in the engine room
entrance.

### 3.2 Lubricating oil

| Line | From → to | Medium | DN | Valves and instruments |
|---|---|---|---|---|
| LO-01 | T-LC1 → LO-P1, LO-P2 (and T-LC2 → LO-P3, LO-P4) | Oil | 200 [P5: 150 to the pump] | Suction pipe ending 150 mm over the tank bottom, coarse strainer, a valve and compound gauge at each pump |
| LO-02 | Pumps → LO-C → three-way thermostatic valve → LO-F → engine | Oil, 4.5 bar | 125 [P5] | Non-return and relief valve at each pump; thermometers before and after the cooler; differential pressure gauge and alarm at the filter; at the engine a pressure gauge, a pressure transmitter, a low-pressure switch for the stand-by pump and one for the shutdown, a temperature transmitter |
| LO-03 | Engine oil pan (two outlets) → T-LC | Oil, by gravity | 200 [P5] | none; a perforated plate in the tank; level transmitter and low-level alarm, thermometer, sounding pipe |
| LO-04 | T-LC → LO-PP → engine inlet after the filter | Oil | 65 | Non-return valve; flow switch |
| LO-05 | T-LC → LO-SEP (its own feed pump) → steam heater → separator → T-LC | Oil, 85 to 90 °C at the separator | 32 | Thermostatic steam valve, thermometer, sight glass; sludge to T-SL |
| LO-06 | T-LS1, T-LS2 → T-LC1, T-LC2; T-LC → T-LR and back through a separator | Oil | 50 | Valves; level glasses on the storage tanks; QC valves at their outlets |
| LO-07 | Crankcase → vent pipe with an oil trap → funnel top | Oil mist | 125 [P5] | none |
| LO-08 | Bunker stations → filling pipes → T-LS1, T-LS2, T-LG, T-LD, T-LH | Oil | 50 | Capped filling connections, named |
| LO-09 | Drip trays and oil drains → T-LK → SL-P → ashore | Dirty oil | 25 to 40 | |
| LO-10 | Gear oil sump → attached pump (or GB-P) → GB-C → filter → bearings, sprays and the clutch valve | Gear oil | 65 | Non-return valves, thermometers, filter differential pressure, pressure transmitter and low-pressure switch, clutch pressure switch |
| LO-11 | STH1, STH2 → stern tubes; stern tubes → STD → pump → header tanks | Stern tube oil | 25 | Shut-off valve at the tank and at the tube, level switch, sampling cock, thermometer in the tube's after bearing (refit) |
| LO-12 | CPH tank → screw pump → filter → control valve (the pitch setter) → OD box → the two tubes in the shaft → hub; return → cooler → tank | Pitch oil | 40 pressure, 50 return | Relief valve, pressure gauge and transmitter, low-pressure switch starting the stand-by pump, filter indicator, thermometer, level switch; cross-connection between the two units, normally shut [P4] |

The generating sets have wet sumps (est.) with attached pumps and filters, filled by hose from T-LD.

### 3.3 Sea water cooling

| Line | From → to | Medium | DN | Valves and instruments |
|---|---|---|---|---|
| SW-01 | SC-H (port, high) → sea valve → SW-F1 → cross-over main ← SW-F2 ← sea valve ← SC-L (starboard, low) | Sea water | 300 | Sea valves (butterfly or gate) bolted to the chests with spindles above the floor; differential pressure gauge on each strainer; the main lies along x 20.9 |
| SW-02 | Cross-over → SW-P1, SW-P2 | Sea water | 250 | Suction valve and compound gauge at each pump |
| SW-03 | Port forward bilge well → **emergency bilge suction** → SW-P1 | Bilge water | 250 (the pump's inlet, as the rule asks [R8]) | One SDNR valve with a red handwheel on a spindle 0.45 m above the floor plates, a strum box in the well, a notice |
| SW-04 | SW-P1, SW-P2 → main service line | Sea water, 2.4 bar | 200 | SDNR and pressure gauge at each pump; pressure transmitter and a low-pressure switch that starts the stand-by pump |
| SW-05 | Main service line → ME1: charge air coolers (two, side by side) → LO-C1 → FW-C1 → overboard OV, port. The same for ME2 to starboard: its branch crosses under the raised step beside the cross-over | Sea water | 150 | A valve at the branch, thermometers before and after each cooler, a throttle valve before the overboard |
| SW-06 | Main service line → GB-C1, GB-C2; CPH coolers; plummer blocks; DC; AC1, AC2 | Sea water | 50; 40; 15; 65; 25 | A valve at each; sight flow glasses at the plummer blocks |
| SW-07 | Cross-over → SW-HP → harbour service line → DG1 to DG3 coolers (through the bulkhead), CPH coolers, AC1, AC2 | Sea water, 1.5 to 1.75 bar | 100 | SDNR; **the isolating valve joining the harbour line to the main service line**, open when a main pump runs (the valve the pattern's blackout turned on [P4]): the refit puts a position switch on it |
| SW-08 | Coolers → overboard valves OV | Sea water | 200 (two), 100 (two) | SDNR shell valves at 5.8 m above the keel |
| SW-09 | Cross-over → FWG's ejector pump → FWG → overboard | Sea water | 80 | Valve, strainer, pressure gauge |
| SW-10 | Harbour line → SY (sanitary hydrophore) in the after passage | Sea water | 40 | Valve |
| SW-11 | Working air and steam → each sea chest; each chest → vent | Air, steam | 25; vent 50 | Valves with a hose connection; the vent rises in the casing to above the main deck |

### 3.4 Fresh water cooling (jackets)

| Line | From → to | Medium | DN | Valves and instruments |
|---|---|---|---|---|
| FW-01 | Engine outlet → three-way thermostatic valve → FW-C → pump suction (by-pass straight to the suction) | Fresh water, about 80 °C | 125 [P5] | Thermometer and temperature transmitter at the outlet (alarm, shutdown), a venting cock at the high point |
| FW-02 | FW-P1 → ME1 inlet; FW-P2 → ME2 inlet | Fresh water, 3 bar | 125 [P5] | Non-return valve, pressure gauge, low-pressure switch starting the stand-by pump, thermometer at the inlet |
| FW-03 | FW-P3 (stand-by) ↔ both circuits | Fresh water | 100 [P5] | Two pairs of valves, normally shut |
| FW-04 | FW-ET1, FW-ET2 → pump suctions; vents from the engines' and coolers' high points → the tanks | Fresh water | 32; vents 15 | Level glass and low-level alarm on each tank |
| FW-05 | ME2 outlet → FWG heating coil → back before the cooler | Fresh water | 80 | Two valves and a by-pass throttle; thermometers |
| FW-06 | Engine outlet → FW-PH (pump and steam heater) → engine inlet, either engine | Fresh water, 60 °C | 40 [P5] | Valves, thermostat on the steam valve |
| FW-07 | Jacket circuit → turbocharger casings → back | Fresh water | 25 | Valves, sight flow glasses (if the type's turbochargers are water-cooled: n/v) |
| FW-08 | NC tank → pump → the engines' nozzle cooling rails → cooler → tank | Fresh water (or oil: n/v) | 20 | Thermometers, flow switch, level glass |
| FW-09 | Each generating set: attached pump → engine → set-mounted cooler; FW-ET3 → the sets | Fresh water | 50 on the set; 25 | The thermometer on each set's water rail (the pattern's was misread [P4]: here a transmitter too) |
| FW-10 | Fresh water hydrophore → expansion tanks, hotwell | Fresh water | 15 | Float valves; a dosing funnel for inhibitor |

### 3.5 Compressed air

| Line | From → to | Medium | DN | Valves and instruments |
|---|---|---|---|---|
| AIR-01 | AC1, AC2 → oil and water separator → filling main → AR1, AR2 | Air, 30 bar | 25 | Non-return valve after each compressor; on each receiver a stop valve, safety valve, pressure gauge, drain; pressure switches start and stop the compressors (25 and 30 bar), automatic drains, unloaded start |
| AIR-02 | AC-E → AR3 | Air, 30 bar | 15 | As above; a cross valve to AR1, AR2 |
| AIR-03 | AR1, AR2 → starting air main → ME1, ME2 main starting valves | Air, 30 bar | 50 (a present engine of 4,350 kW has a 32 mm connection [P5]) | Stop valve at each receiver, pressure transmitter and low-pressure alarm, a non-return valve and a flame arrester at each engine, the turning gear's interlock valve, a drain |
| AIR-04 | AR1, AR2 → reducing station → working air main | Air, 7 bar | 25 | Reducing valve with a safety valve and gauges; hose connections at ten places in the machinery spaces and the workshop; branches to the shaft brakes, the sea chests, the quick-closing valves' bottle |
| AIR-05 | Working air main → riser → whistle valve on the bridge → whistle on the mast | Air | 25 riser; 15 at the bridge, as registered [H4] | Stop valve, drain, the whistle's solenoid and hand valve |
| AIR-06 | AC-C → AD → WR → control air main | Dry air, 7 bar | 25 | Filters, dew-point indicator, low-pressure alarm; a stand-by supply from the working air through a filter |
| AIR-07 | Control air main → pitch setters and the bridge and control room pitch levers (the signal is pneumatic [P4]); engine speed setters; thermostatic and pressure-control valves; FO-VIS; separators; boiler controls; fire dampers; remote valve actuators | Dry air | 15 and less | A filter-regulator at each user |

### 3.6 Steam, feed and condensate

| Line | From → to | Medium | DN | Valves and instruments |
|---|---|---|---|---|
| ST-01 | AB main stop valve → steam main → distribution header in the auxiliary engine room | Steam, 7 bar | 65 | Main stop valve, pressure gauge and transmitter; two safety valves on the boiler with a waste pipe of 80 mm to the funnel top; two water level glasses, level controller, low-level cut-out |
| ST-02 | Header → reducing station (7 to 3 bar) → bunker tank coils (T-HF1P, T-HF1S, T-HF2P, T-HF2S) | Steam, 3 bar | 40 | Reducing valve, safety valve, gauges; an inlet valve to each coil; a steam trap and a test cock at each coil's outlet |
| ST-03 | Header → coils of T-HFS, T-HFD, T-SL, T-BH, T-OF, T-LR | Steam | 25 | Inlet valve and trap at each; thermostatic valves on the settling and service tanks |
| ST-04 | Header → FO-H1, FO-H2, the lubricating oil separators' heaters | Steam | 25 | Thermostatic control valves, traps |
| ST-05 | Header → the booster unit's heaters | Steam | 25 | Control valve worked by FO-VIS, traps |
| ST-06 | Header → tracing along every heavy fuel pipe | Steam | 15 | A valve and a trap to each run |
| ST-07 | Header → FW-PH | Steam | 32 | Thermostatic valve, trap |
| ST-08 | Header → forward along the port casing to the house: the air handling unit's heaters, the calorifier CAL (after passage), the galley | Steam, 3 bar | 40 | Stop valve at the header and at the house, drains at the low points, expansion loops |
| ST-09 | Header → pressure-controlled dump valve → DC → condensate to HW | Steam | 50 | The dump valve opens above 7.5 bar when the economisers make more than is used |
| ST-10 | AB water space → BC-P1, BC-P2 → EGE1 and EGE2 → AB steam space | Water; steam and water | 50 out, 65 back | Non-return valves, a flow switch on each economiser (no flow: alarm), stop valves so one economiser can be run dry, thermometers; steam soot blowers on each economiser (25) |
| ST-11 | HW → FD-P1, FD-P2 → feed check valves → AB | Feed water, 80 to 90 °C | 25 | Two feed lines, feed regulator, pressure gauge, a salinity cell (refit) |
| ST-12 | All traps → condensate main → observation tank (part of HW) | Condensate | 25 to 40 | Sight glass and an oil detector on the returns from the fuel tanks' coils |
| ST-13 | AB blow-down → shell valve | Water | 25 | Blow-down valve and SDNR at the shell |

### 3.7 Exhaust gas

| Line | From → to | DN | Fittings and instruments |
|---|---|---|---|
| EX-01 | ME1 turbochargers → EGE1 → SIL1 → funnel top (port) | 700 (a present engine of the power: at least 650 [P5]) | Bellows at the engine and in the long run, fixed points at the economiser and the silencer, drains at the low points, a thermocouple after each cylinder and before and after each turbocharger, a back-pressure tapping (3 kPa is a maker's limit [P5]) |
| EX-02 | ME2 turbochargers → EGE2 → SIL2 → funnel top (starboard) | 700 | as EX-01 |
| EX-03 to EX-05 | DG1, DG2, DG3 → SIL3, SIL4, SIL5 → funnel top (starboard) | 250 (est.) | Bellows at each set, a thermocouple after each turbocharger, drains |
| EX-06 | AB → funnel top (starboard) | 350 (est.) | A damper, a flue gas thermometer |
| EX-07 | EG → silencer on the house top | 250 (est.) | As built in the emergency generator room [H6] |

All are lagged with mineral wool under sheet cladding wherever they can be touched or oil can reach them.

### 3.8 Bilge and ballast

The rule's sizes: bilge main d = 25 + 1.68 √(L (B + D)) [R9]; with L 114.0 m, B 19.6 m, D 6.6 m it is 117 mm, so
125 mm; each bilge pump must give 2 m/s in it [R8], 88 m³/h; a passenger ship has at least three power pumps on the
main [R8]: BG-P1, BG-P2 and BA-P1.

| Line | From → to | Medium | DN | Valves and instruments |
|---|---|---|---|---|
| BG-01 | Bilge main: along the engine room's centreline under the floor, through the bulkheads aft to the steering gear room and forward to the pump room | Bilge water | 125 | A SDNR valve at each bulkhead; mud boxes |
| BG-02 | Wells → branch suctions → the main: engine room after well, centre well, forward wells P and S; auxiliary engine room P and S; steering gear room; after passage; the lower hold's four wells; pump room; thruster room | Bilge water | 80 (65 in the small spaces) | Each through a SDNR valve in a valve chest at BG-P1 (after spaces) or BG-P2 (forward spaces); a strum box in each well; a level alarm in each well [R19] |
| BG-03 | Starboard forward well → BG-P1 (direct suction); auxiliary room well → BG-P2 (direct suction) | Bilge water | 125 [R8] | One valve each |
| BG-04 | SW-03: the emergency bilge suction on SW-P1 | Bilge water | 250 | see 3.3 |
| BG-05 | BG-P1, BG-P2 → overboard | Bilge water | 125 | SDNR shell valves above the load waterline, kept sealed since the refit: for flooding only |
| BG-06 | Wells → BG-PP → T-BH | Oily water | 50 | Valves; high-level alarm in T-BH |
| BG-07 | T-BH → OWS → oil content alarm (15 parts in a million) → three-way valve → overboard, or back to T-BH | Water | 40 | Sampling point, flow meter, the three-way valve worked by the alarm; separated oil to T-SL |
| BG-08 | T-BH → SL-P → bunker stations (ashore) | Oily water | 65 | |
| BG-09 | Main deck scuppers → overboard; lower hold drain wells → BG-02 | Water | 100 | Scuppers with non-return valves each side; they must carry 125 % of the drencher and two hoses [R2] |
| BA-01 | Sea chest in the pump room → BA-P1, BA-P2 → ballast main → fore peak, deep tanks P and S, double-bottom tanks, wing ballast tanks P and S; and back overboard | Sea water | 150 main, 100 to 125 branches | A remote butterfly valve on each tank's branch (BV), a manifold in the pump room, SDNR at the shell; BA-P1 also has a suction from the bilge main |
| BA-02 | Heeling tank P ↔ HL-P ↔ heeling tank S | Sea water | 300 [H5] | A remote butterfly valve at each tank, shut at sea as on the pattern [H5]; high and low level switches in each tank; an inclinometer starts the pump one way or the other |
| BA-03 | Every ballast and heeling tank → air pipe to the upper deck; sounding pipe | Air | 100 to 150 | Float-ball vent heads; the pattern's sounding pipes stood on the cargo decks [H5] |

### 3.9 Fire main, drencher and gas

| Line | From → to | Medium | DN | Valves and instruments |
|---|---|---|---|---|
| FI-01 | FP1 (suction from the sea water cross-over), FP2 (its own inlet in the auxiliary room), FP3 (its own chest in the pump room) → fire main | Sea water, 8 bar | 150 at the pumps, 125 along the ship | SDNR and pressure gauge at each pump, a relief valve, isolating valves where the main passes a watertight bulkhead and at the foot of each riser; pressure transmitter to the bridge |
| FI-02 | Fire main, port and starboard along the casings at the main deck, with risers to the upper deck, the house, the forecastle and the helicopter deck | Sea water | 125; risers 65 | Hydrants of 50 mm with a hose box at each: on the vehicle decks about every 20 m each side, four in the engine room (two a level), two in the auxiliary engine room, one in the steering gear room, on each deck of the house. Coupling pattern n/v |
| FI-03 | Bunker stations: international shore connection → fire main | Water | 65 | Blank flange, valve |
| FI-04 | Fire main → drencher main | Sea water | 100 | A locked non-return valve, as the rule asks [R5] |
| FI-05 | Fire main → HD-F → two foam monitors at the helicopter deck; fire main → hawse pipes (chain wash), bilge ejectors | Sea water | 65; 50 | Valves |
| DR-01 | Sea chest (pump room) → DR-P → drencher main aft to DV | Sea water, 6 bar | 150 | SDNR, pressure gauge, test line overboard; started at DV, on the bridge and at the pump [R5] |
| DR-02 | DV → eight section pipes → open spray nozzles under the upper deck over the main deck (five sections of 20 m) and under the main deck in the lower hold (three sections of 15 m) | Sea water | 100 | A section valve, a drain and a pressure gauge to each section; nozzles about 3 m apart |
| CO-01 | CO₂ room → two distribution valves → engine room nozzles; auxiliary engine room nozzles | Carbon dioxide | 50; 32 | Pilot cylinders and release cabinets at the engine room entrance and in the CO₂ room; pre-discharge alarm and a time delay; the release stops the fans and shuts the quick-closing valves; 85 % of the gas in 2 minutes [R15] |
| WM-01 | WM-P → section valves → nozzles over the engines, generating sets, separators and boiler front (refit) | Fresh water | 15, stainless | Flame detectors start it; release buttons at the entrance and in the control room |

### 3.10 Hydraulics

| Line | From → to | Medium | Bore | Valves and instruments |
|---|---|---|---|---|
| HY-01 | HPU-R → ramp valve stand → the two ramp cylinders | Oil, 210 bar | 25 pressure, 50 return | Pressure filter, relief valve, gauges; lever valves with solenoids; a load-holding valve bolted to each cylinder [D11]; return filter, cooler, tank level and temperature switches |
| HY-02 | HPU-R → cleat valve block → two hook cleats, eight bolt cleats | Oil | 12 | Sequence: cleats free before the ramp can lower; a limit switch on every cleat, shown at the stand and on the bridge |
| HY-03 | HPU-R → upper deck valve stand → the ramp cover's cylinders and bolt cleats | Oil | 20 pressure, 32 return | As HY-01; the stand is at the cover's after end |
| HY-04 | HPU-L → along the port casing → lift valve stand → four lift cylinders and four locking bolts | Oil, 210 bar | 32 pressure, 65 return | A pipe-rupture valve on each cylinder; limit switches at both decks; hold-to-run control |
| HY-05 | Hand pumps at HPU-R and HPU-L → the same lines | Oil | 12 | Change-over cocks |
| HY-06 | SGR-PU1, SGR-PU2 → valve block → the two rams | Oil, 160 bar | 25 | Isolating and by-pass valves at each ram, relief valves, a header and storage tank with a low-level alarm, the hand pump SGR-E |
| HY-07 | DM-HPU → ring main on the forecastle → WL1, WL2 | Oil, about 45 bar | 80 pressure, 100 return | A control valve with a hand lever at each winch; low pressure wants large pipes |
| HY-08 | BT-HP → the thruster's pitch servo; header tank → the thruster's gear housing | Oil | 20 | Low-level and low-pressure alarms |
| HY-09 | Watertight door's own unit (pump, accumulator, hand pumps each side) → the door's cylinder | Oil | 12 | Closed from the bridge; a horn and a lamp at the door |
| HY-10 | Ballast valve control unit → the remote valves' actuators | Oil | 8 | Position shown at the panel |

---

## 4. Electrical load list

### 4.1 The plant

| Source | Rating | Feeds |
|---|---|---|
| DG1, DG2, DG3 | 320 kW each, 690 V, 60 Hz | Main switchboard, 690 V: they run in parallel |
| SG1, SG2 | 750 kW each, 690 V, 60 Hz at 600 engine rpm | SG1 the thruster bus or the main bus; SG2 the main bus. Their frequency is the main engines' speed, so they do not run in parallel with the diesel sets or with each other, except for the seconds of a load transfer (the pattern's could not either, and its breakers kept one shaft generator from feeding the thruster and the main bars together [P4]) |
| T1, T2 | 800 kVA each, 690/440 V | The 440 V section: either alone carries it |
| EG | 500 kW, 440 V | The emergency switchboard, within 45 seconds of the main supply failing [R12] |
| Shore | 440 V, 400 A (est.) | The 440 V section, in port with all sets stopped |

Everything but the thruster motor takes its power at 440 V or 230 V, so all of it passes T1 and T2: the heaviest main-bus
load below, 657 kW, is 770 kVA at a power factor of 0.85.

### 4.2 The list

A consumer's demand is: number in use × rated kW × utilisation. The rated powers are the motors' shaft powers of section 1.
**The utilisation figures are estimates** of this basis in the manner of a yard's load analysis; none comes from a
measurement. The five conditions: at sea at service speed; manoeuvring with the thruster at full power, the mooring gear
working and the vehicle deck fans already at full; loading and unloading in port with the main engines stopped; in port at
night with trailers aboard; emergency (the main supply lost, a fire being fought on a vehicle deck, the ship steering).

| Tag | Consumer | Off | kW each | V | Board | At sea | Manoeuvring | Loading | Night in port | Emergency |
|---|---|---|---|---|---|---|---|---|---|---|
| | **Propulsion auxiliaries** | | | | | | | | | |
| LO-P1..4 | Main engine lubricating oil pumps | 4 | 22 | 440 | PSB/GSP | 37.4 (2 × 0.85) | 37.4 (2 × 0.85) | 0 | 0 |  |
| LO-PP1,2 | Main engine pre-lubricating pumps | 2 | 3 | 440 | PSB/GSP | 0 | 0 | 4.8 (2 × 0.80) | 4.8 (2 × 0.80) |  |
| FW-P1..3 | Jacket (high temperature) fresh water pumps | 3 | 11 | 440 | PSB/GSP | 18.7 (2 × 0.85) | 18.7 (2 × 0.85) | 0 | 0 |  |
| FW-PH | Jacket preheating pump | 1 | 3 | 440 | PSB/GSP | 0 | 0 | 2.4 (1 × 0.80) | 2.4 (1 × 0.80) |  |
| SW-P1,2 | Main sea water cooling pumps | 2 | 37 | 440 | PSB/GSP | 29.6 (1 × 0.80) | 29.6 (1 × 0.80) | 0 | 0 |  |
| SW-HP | Harbour sea water pump | 1 | 7.5 | 440 | PSB/GSP | 0 | 0 | 6 (1 × 0.80) | 6 (1 × 0.80) |  |
| NC-P1,2 | Injection nozzle cooling pumps | 2 | 1.5 | 440 | PSB/GSP | 1.2 (1 × 0.80) | 1.2 (1 × 0.80) | 0 | 0 |  |
| GB-P1,2 | Gearbox stand-by lubricating oil pumps | 2 | 7.5 | 440 | PSB/GSP | 0 | 12 (2 × 0.80) | 0 | 0 |  |
| CPH-P1..4 | Propeller pitch oil pumps | 4 | 11 | 440 | PSB/GSP | 13.2 (2 × 0.60) | 17.6 (2 × 0.80) | 0 | 0 |  |
| ST-P | Stern tube oil circulating pump | 1 | 0.75 | 440 | PSB/GSP | 0.6 (1 × 0.80) | 0.6 (1 × 0.80) | 0 | 0 |  |
| TG1,2 | Main engine turning gears | 2 | 2.2 | 440 | PSB/GSP | 0 | 0 | 0 | 0 |  |
| | **Fuel and lubricating oil treatment** | | | | | | | | | |
| FO-BP1,2 | Fuel booster (supply) pumps | 2 | 2.2 | 440 | PSB/GSP | 1.8 (1 × 0.80) | 1.8 (1 × 0.80) | 1.1 (1 × 0.50) | 1.1 (1 × 0.50) |  |
| FO-CP1,2 | Fuel circulating pumps | 2 | 3 | 440 | PSB/GSP | 2.4 (1 × 0.80) | 2.4 (1 × 0.80) | 1.5 (1 × 0.50) | 1.5 (1 × 0.50) |  |
| FO-TP1 | Heavy fuel transfer pump | 1 | 7.5 | 440 | PSB/GSP | 1.5 (1 × 0.20) | 0 | 1.5 (1 × 0.20) | 0 |  |
| FO-TP2 | Diesel oil transfer pump | 1 | 4 | 440 | PSB/GSP | 0.4 (1 × 0.10) | 0 | 0.4 (1 × 0.10) | 0 | 0.8 (1 × 0.20) |
| FO-SEP1,2 | Heavy fuel separators | 2 | 7.5 | 440 | PSB/GSP | 12 (2 × 0.80) | 12 (2 × 0.80) | 6 (1 × 0.80) | 0 |  |
| FO-SEP3 | Diesel oil separator | 1 | 5.5 | 440 | PSB/GSP | 1.6 (1 × 0.30) | 0 | 1.6 (1 × 0.30) | 0 |  |
| LO-SEP1,2 | Lubricating oil separators | 2 | 5.5 | 440 | PSB/GSP | 8.8 (2 × 0.80) | 8.8 (2 × 0.80) | 8.8 (2 × 0.80) | 4.4 (1 × 0.80) |  |
| SL-P | Sludge pump | 1 | 2.2 | 440 | PSB/GSP | 0.1 (1 × 0.05) | 0 | 0.7 (1 × 0.30) | 0 |  |
| | **Steam plant** | | | | | | | | | |
| AB-BR | Boiler burner, fan and fuel pump | 1 | 5.5 | 440 | PSB | 0.6 (1 × 0.10) | 1.6 (1 × 0.30) | 3.8 (1 × 0.70) | 3.3 (1 × 0.60) |  |
| FD-P1,2 | Boiler feed water pumps | 2 | 2.2 | 440 | PSB | 1.1 (1 × 0.50) | 1.1 (1 × 0.50) | 1.1 (1 × 0.50) | 0.9 (1 × 0.40) |  |
| BC-P1,2 | Economiser circulating pumps | 2 | 3 | 440 | PSB | 2.4 (1 × 0.80) | 2.4 (1 × 0.80) | 0 | 0 |  |
| CD-P | Condensate (hotwell) pump | 1 | 1.1 | 440 | PSB | 0.6 (1 × 0.50) | 0.6 (1 × 0.50) | 0.6 (1 × 0.50) | 0.6 (1 × 0.50) |  |
| | **Compressed air** | | | | | | | | | |
| AC1,2 | Starting air compressors | 2 | 15 | 440 | PSB | 1.5 (1 × 0.10) | 7.5 (1 × 0.50) | 1.5 (1 × 0.10) | 0.8 (1 × 0.05) |  |
| AC-E | Emergency air compressor | 1 | 2.3 | 440 | ESB | 0 | 0 | 0 | 0 | 2.3 (1 × 1.00) |
| AC-C | Control and working air compressor (refit) | 1 | 7.5 | 440 | PSB | 3 (1 × 0.40) | 3.8 (1 × 0.50) | 3.8 (1 × 0.50) | 2.2 (1 × 0.30) |  |
| AD | Control air dryer (refit) | 1 | 0.75 | 230 | LB | 0.8 (1 × 1.00) | 0.8 (1 × 1.00) | 0.8 (1 × 1.00) | 0.8 (1 × 1.00) |  |
| | **Bilge, ballast, fire** | | | | | | | | | |
| BG-P1,2 | Bilge and general service pumps | 2 | 18.5 | 440 | PSB | 0.9 (1 × 0.05) | 0 | 1.9 (1 × 0.10) | 0 |  |
| BG-PP | Bilge piston pump and oily water separator | 1 | 2.2 | 440 | PSB | 0.4 (1 × 0.20) | 0 | 0 | 0 |  |
| FP1,2 | Fire pumps No. 1 and 2 | 2 | 30 | 440 | PSB | 1.5 (1 × 0.05) | 0 | 3 (1 × 0.10) | 0 |  |
| FP3 | Fire pump No. 3 (emergency fire pump) | 1 | 30 | 440 | ESB | 0 | 0 | 0 | 0 | 27 (1 × 0.90) |
| DR-P | Drencher pump | 1 | 55 | 440 | ESB | 0 | 0 | 0 | 0 | 49.5 (1 × 0.90) |
| WM-P | Local water mist pump unit (refit) | 1 | 15 | 440 | ESB | 0 | 0 | 0 | 0 | 0 |
| BA-P1,2 | Ballast pumps | 2 | 18.5 | 440 | PSB | 0 | 0 | 9.2 (1 × 0.50) | 0 | 16.7 (1 × 0.90) |
| HL-P | Heeling pump | 1 | 22 | 440 | PSB | 0 | 0 | 13.2 (1 × 0.60) | 0 |  |
| | **Steering and manoeuvring** | | | | | | | | | |
| SGR-PU1,2 | Steering gear power units | 2 | 11 | 440 | PSB and ESB | 5.5 (1 × 0.50) | 13.2 (2 × 0.60) | 0 | 0 | 8.8 (1 × 0.80) |
| BT-M | Bow thruster motor (690 V, on the thruster bus) | 1 | 600 | 690 | MSB thruster bus | 0 | 636 (1 × 1.06) | 0 | 0 |  |
| BT-HP | Thruster pitch oil pump and room fan | 1 | 5.5 | 440 | PSB | 0 | 4.4 (1 × 0.80) | 0 | 0 |  |
| | **Cargo access and deck machinery** | | | | | | | | | |
| HPU-R | Stern ramp, cover and cleats power pack pumps | 2 | 37 | 440 | PSB | 0 | 0 | 11.1 (2 × 0.15) | 0 |  |
| HPU-L | Cargo lift power pack pumps | 2 | 45 | 440 | PSB | 0 | 0 | 31.5 (2 × 0.35) | 0 |  |
| PD-P | Pilot door power packs | 2 | 2.2 | 440 | PSB | 0 | 0.7 (1 × 0.30) | 0 | 0 |  |
| DM-HPU | Forward windlass and winch pumps | 2 | 55 | 440 | PSB | 0 | 55 (2 × 0.50) | 0 | 0 |  |
| CAP1,2 | After mooring capstans | 2 | 15 | 440 | PSB | 0 | 15 (2 × 0.50) | 0 | 0 |  |
| LB-W1,2 | Lifeboat winches | 2 | 11 | 440 | ESB | 0 | 0 | 0 | 0 | 5.5 (1 × 0.50) |
| PC | Provision crane | 1 | 7.5 | 440 | PSB | 0 | 0 | 1.5 (1 × 0.20) | 0 |  |
| | **Ventilation and air conditioning** | | | | | | | | | |
| EF1,2 | Engine room supply fans | 2 | 15 | 440 | PSB | 27 (2 × 0.90) | 27 (2 × 0.90) | 13.5 (1 × 0.90) | 13.5 (1 × 0.90) |  |
| AF1,2 | Auxiliary engine room supply fans | 2 | 7.5 | 440 | PSB | 6.8 (1 × 0.90) | 13.5 (2 × 0.90) | 13.5 (2 × 0.90) | 6.8 (1 × 0.90) |  |
| XF | Separator room, workshop and control room fans | 3 | 1.5 | 440 | PSB | 3.6 (3 × 0.80) | 3.6 (3 × 0.80) | 3.6 (3 × 0.80) | 2.4 (2 × 0.80) |  |
| VF1..4 | Main deck exhaust fans (two speed: 11 / 2.8 kW) | 4 | 11 | 440 | PSB | 9.7 (4 × 0.22) | 37.4 (4 × 0.85) | 37.4 (4 × 0.85) | 9.7 (4 × 0.22) |  |
| VS1,2 | Main deck supply fans (two speed: 15 / 3.7 kW) | 2 | 15 | 440 | PSB | 6.6 (2 × 0.22) | 25.5 (2 × 0.85) | 25.5 (2 × 0.85) | 6.6 (2 × 0.22) |  |
| HF1,2 | Lower hold exhaust fans | 2 | 7.5 | 440 | PSB | 6.4 (1 × 0.85) | 12.8 (2 × 0.85) | 12.8 (2 × 0.85) | 6.4 (1 × 0.85) |  |
| HS1,2 | Lower hold supply fans | 2 | 5.5 | 440 | PSB | 4.7 (1 × 0.85) | 9.3 (2 × 0.85) | 9.3 (2 × 0.85) | 4.7 (1 × 0.85) |  |
| SF | Steering gear, hydraulic room, thruster room, store fans | 5 | 0.75 | 440 | PSB | 2.4 (4 × 0.80) | 3 (5 × 0.80) | 2.4 (4 × 0.80) | 1.8 (3 × 0.80) |  |
| AHU | Accommodation air handling unit fan | 1 | 15 | 440 | PSB | 12.8 (1 × 0.85) | 12.8 (1 × 0.85) | 12.8 (1 × 0.85) | 12.8 (1 × 0.85) |  |
| ACC | Air conditioning compressor | 1 | 55 | 440 | PSB | 33 (1 × 0.60) | 33 (1 × 0.60) | 33 (1 × 0.60) | 27.5 (1 × 0.50) |  |
| ACC-P | Air conditioning sea water and chilled water pumps | 2 | 5.5 | 440 | PSB | 7.7 (2 × 0.70) | 7.7 (2 × 0.70) | 7.7 (2 × 0.70) | 7.7 (2 × 0.70) |  |
| PR | Provision refrigerating compressors | 2 | 4 | 440 | PSB | 2 (1 × 0.50) | 2 (1 × 0.50) | 2 (1 × 0.50) | 2 (1 × 0.50) |  |
| GX | Galley and sanitary exhaust fans | 3 | 1.5 | 440 | PSB | 3.1 (3 × 0.70) | 3.1 (3 × 0.70) | 3.1 (3 × 0.70) | 2.1 (2 × 0.70) |  |
| | **Sanitary and fresh water** | | | | | | | | | |
| HY-P1,2 | Fresh water hydrophore pumps | 2 | 3 | 440 | PSB | 0.9 (1 × 0.30) | 0.9 (1 × 0.30) | 0.9 (1 × 0.30) | 0.6 (1 × 0.20) |  |
| SY-P1,2 | Sanitary sea water hydrophore pumps | 2 | 3 | 440 | PSB | 0.9 (1 × 0.30) | 0.9 (1 × 0.30) | 0.9 (1 × 0.30) | 0.6 (1 × 0.20) |  |
| HWC | Hot water circulating pump | 1 | 0.55 | 440 | PSB | 0.6 (1 × 1.00) | 0.6 (1 × 1.00) | 0.6 (1 × 1.00) | 0.6 (1 × 1.00) |  |
| CAL-E | Calorifier electric heater (when no steam) | 1 | 30 | 440 | PSB | 0 | 0 | 0 | 0 |  |
| STP | Sewage plant blowers and discharge pump | 1 | 6 | 440 | PSB | 1.8 (1 × 0.30) | 1.8 (1 × 0.30) | 1.8 (1 × 0.30) | 1.8 (1 × 0.30) |  |
| FWG-P | Fresh water generator ejector and distillate pumps | 1 | 11.75 | 440 | PSB | 10.6 (1 × 0.90) | 0 | 0 | 0 |  |
| | **Galley, laundry, workshop** | | | | | | | | | |
| GAL | Galley (range, ovens, fryer, dishwasher, boilers): connected | 1 | 90 | 440 | PSB | 31.5 (1 × 0.35) | 22.5 (1 × 0.25) | 31.5 (1 × 0.35) | 9 (1 × 0.10) |  |
| LAU | Laundry: connected | 1 | 20 | 440 | PSB | 4 (1 × 0.20) | 0 | 4 (1 × 0.20) | 0 |  |
| WS | Workshop machines and welding: connected | 1 | 25 | 440 | PSB | 2.5 (1 × 0.10) | 0 | 5 (1 × 0.20) | 0 |  |
| | **Lighting, small power, electronics (230 V)** | | | | | | | | | |
| L-ACC | Accommodation lighting | 1 | 25 | 230 | LB | 17.5 (1 × 0.70) | 17.5 (1 × 0.70) | 17.5 (1 × 0.70) | 10 (1 × 0.40) | 6.2 (1 × 0.25) |
| L-VEH | Vehicle decks and lower hold lighting | 1 | 30 | 230 | LB | 15 (1 × 0.50) | 30 (1 × 1.00) | 30 (1 × 1.00) | 9 (1 × 0.30) | 6 (1 × 0.20) |
| L-ER | Machinery spaces lighting | 1 | 12 | 230 | LB | 12 (1 × 1.00) | 12 (1 × 1.00) | 12 (1 × 1.00) | 9.6 (1 × 0.80) | 3.6 (1 × 0.30) |
| L-DK | Deck floodlights, helideck and boat station lights | 1 | 20 | 230 | LB | 2 (1 × 0.10) | 16 (1 × 0.80) | 16 (1 × 0.80) | 6 (1 × 0.30) | 6 (1 × 0.30) |
| NAV | Navigation, radio, internal communication, alarms | 1 | 10 | 230 | LB and ESB | 8 (1 × 0.80) | 9 (1 × 0.90) | 5 (1 × 0.50) | 4 (1 × 0.40) | 8 (1 × 0.80) |
| SP | Sockets and small power | 1 | 25 | 230 | LB | 7.5 (1 × 0.30) | 7.5 (1 × 0.30) | 10 (1 × 0.40) | 5 (1 × 0.20) | 2.5 (1 × 0.10) |
| CH | Battery chargers and automation supplies | 1 | 8 | 230 | LB and ESB | 4.8 (1 × 0.60) | 4.8 (1 × 0.60) | 4.8 (1 × 0.60) | 4.8 (1 × 0.60) | 6.4 (1 × 0.80) |
| ECR-AC | Control room and switchboard room air conditioner (refit) | 1 | 7.5 | 440 | PSB | 4.5 (1 × 0.60) | 4.5 (1 × 0.60) | 4.5 (1 × 0.60) | 3.8 (1 × 0.50) |  |
| | **Cargo** | | | | | | | | | |
| RF | Reefer trailer sockets: 20 of 9 kW, connected | 1 | 180 | 440 | PSB | 90 (1 × 0.50) | 90 (1 × 0.50) | 54 (1 × 0.30) | 54 (1 × 0.30) |  |
| | **Total demand, kW** | | | | | **487** | **1293** | **493** | **251** | **149** |
| | of which on the thruster bus | | | | | 0 | 636 | 0 | 0 | 0 |
| | **on the main bus (or the emergency board)** | | | | | **487** | **657** | **493** | **251** | **149** |

In each cell: demand in kW (number in use × utilisation). "PSB" is the 440 V section of the main switchboard, "GSP" its
group starter boards, "LB" the 230 V lighting board, "ESB" the emergency switchboard.

### 4.3 Do the generators carry it?

| Condition | Demand | Carried by | Loading | Verdict |
|---|---|---|---|---|
| At sea | 487 kW | One shaft generator (750 kW), the diesel sets stopped, as the pattern ran [P4] | 65 % | Yes. Two diesel sets would also do it (76 % of 640 kW) |
| Manoeuvring | 636 kW on the thruster bus; 657 kW on the main bus | SG1 alone on the thruster bus; DG1, DG2 and DG3 together on the main bus, as the pattern did with her two sets and one shaft generator [P4] | SG1 85 %; the three sets 68 % of 960 kW | Yes, **but with no set in reserve**: if one diesel set trips, the other two (640 kW) are overloaded until the preference trips drop the reefer sockets, the galley, the laundry and the air conditioning compressor (about 150 kW), which leaves 507 kW (79 %) |
| Loading in port | 493 kW | Two diesel sets, the third standing by | 77 % of 640 kW | Yes |
| In port at night | 251 kW | One diesel set | 78 % of 320 kW | Yes, closely; a second set starts on load |
| Emergency | 149 kW | The emergency set (500 kW) | 30 % | Yes: three times over |

**Said plainly.** Three sets of 320 kW carry the ship **only together with the shaft generators**. Without them the
manoeuvring condition is 1,293 kW against 960 kW installed: it does not close. What would close it without shaft
generators, keeping one set in reserve: three diesel sets of about 700 kW each, or four of 450 kW. (The hull's general
arrangement speaks of three sets of about 500 kW [H1]: all three on line would give 1,500 kW, 86 % loaded, with none in
reserve.) With the shaft generators kept, as here, the three 320 kW sets are right for the port and tight for manoeuvring.

Two things are not calculated and are owed (document JS8-852): the voltage dip when the 600 kW thruster motor starts on a
940 kVA shaft generator, and the short-circuit level of the 690 V board.

### 4.4 What the emergency switchboard feeds

One steering gear power unit; fire pump No. 3; the drencher pump; ballast pump BA-P1 as the emergency bilge pump; the
emergency air compressor; the lifeboat winches; the water mist unit; the diesel oil transfer pump (to fill the emergency
set's tank); emergency lighting on every deck, at the boats and on the vehicle decks; navigation lights, navigation and
radio equipment, internal communication and alarms; the battery chargers; the watertight door's unit. For a passenger ship
the rule asks the emergency source to carry its list for 36 hours, or not less than 12 on short voyages if the
Administration agrees [R12]; a cargo ship's is 18 hours [R13].

---

## 5. Control and monitoring

### 5.1 What a ship of 1975 was built to

- Det norske Veritas brought in the first class for automated ships in 1966, named E0 [R18]; a ship so classed sails with
  her engine room unattended at night, and "an alarm system calls a duty engineer" [R18]. The notations of Germanischer
  Lloyd and Lloyd's Register of the time: n/v.
- IMCO's recommendation of 1971 for periodically unattended machinery spaces asks for: fire detection that alarms on the
  bridge; bilge well level alarms; control of the propeller's speed and thrust from the bridge by a single lever, with a
  pitch indicator there; alarms on the bridge, in the control room and in the engineers' accommodation; automatic starting
  of a stand-by generator; and a signal that the lone watchkeeper is well [R19].
- The rule since: an engineers' alarm reaching the cabins through a selector switch, sounding if an alarm is not attended
  [R26].
- Alarm systems on the market: Norcontrol's DataSafe "covers the watchkeeping and monitoring part of an unmanned engine
  room" (1971; Norcontrol instruments were then in 38 ships) [R24]; Decca's Isis, "alarm monitoring and data logging",
  solid state and modular (1971) [R25]. What a German yard fitted (Siemens, AEG): n/v.
- The pattern ship had **no machinery data logger**: "System and equipment parameters were manually recorded in the Engine
  Room Log" [P4].

### 5.2 The control room as built (1975)

The room is 4.2 × 6.5 m on the platform, the desk across its forward side under three windows that look over the gears
and engines [H1]. What is taken from the pattern's report is marked [P4]; the rest is est. from the recommendation [R19]
and the practice of the time, and should be checked against photographs the owner may have.

| Part of the desk | What it carries |
|---|---|
| Centre, sloping top | Two **pitch levers**, each engraved with ten equal divisions ahead and ten astern [P4]. Two engine speed setters (pneumatic). Clutch in and out buttons with lamps for each gear. The **change-over switch between control room and bridge**: the control room is the master station, and only it can hand control to the bridge [P4]; a lamp on the bridge shows who has it [P4]. Emergency stop buttons for each engine under covers (the engines could be stopped from the control room and from the bridge [P4]). The engine telegraph's receiver with its bell |
| Centre, upright panel | For each shaft: pitch indicator [P4], shaft revolutions, engine revolutions, turbocharger revolutions, fuel rack position. For each engine a row of round gauges: lubricating oil pressure, jacket water pressure and temperature, fuel pressure, charge air pressure, starting air, control air. An exhaust temperature meter with a rotary selector for each engine's cylinders and turbocharger |
| Port wing of the desk | The **alarm panel**: lamp windows in rows, about 120 of them (est.), each lettered; buttons for accept, reset and lamp test; a horn; group alarm lamps repeated on the bridge and in the engineers' cabins and mess; the watch (dead-man) timer |
| Starboard wing | **Pump control**: start and stop buttons and a running lamp for every pump of sections 1.1 and 1.4 to 1.7, with a selector for which of each pair stands by. Tank level gauges for the settling and service tanks. The quick-closing valves' and fans' emergency stops |
| After bulkhead | A mimic panel of the electrical system with kilowatt meters for the three sets and the two shaft generators and lamps for the breakers (the breakers and the synchroscope themselves are on the main switchboard next door). The telephone, the sound-powered telephone to the bridge and the steering gear, the talk-back. A desk with the engine room log |

The emergency set has its own panel in its room, selectable for manual or automatic start, with a test that simulates a
loss of voltage [P4].

**Bridge control.** The propellers' pitch is set from levers on the bridge and at both wings; on the pattern the wing levers
moved the bridge unit by a chain, and the levers sent a pneumatic signal to each propeller's pitch setter [P4]. The engines
run at a constant 600 rpm whenever a shaft generator is on the board (it sets the frequency [P4]); with the shaft generators
off, a combinator can lower the speed with the pitch: whether the Escher Wyss control of 1975 had a combinator: n/v. The
pitch can be set by hand at each oil distribution box, where the mechanical scale is the true reading [P4]. On loss of the
pitch oil pressure the pattern's blades went to full astern [P4]: the refit's control should hold the last pitch or go to
zero (section 7).

### 5.3 The refit (2010s): an integrated alarm, monitoring and control system

A system of the kind of Kongsberg's K-Chief 600 ("configurable from 16 to 20 000 channels", "decentralised", with operator
stations [R27]) or Praxis's Mega-Guard (control processors with up to eight input and output modules each, a redundant
Ethernet link, extension alarm panels with duty selection and a dead-man timer [R28]). Which make: the owner's choice.

| Part | Where | What |
|---|---|---|
| Operator stations | Two in the control room desk (let into the old gauge panel's place: the round gauges of the engines stay beside them), one on the bridge's conning position (the owner's photograph D1: "a monitoring screen at the conning position" [H5]) | Mimic pages for each system of section 3, alarm list, trends, running hours |
| Remote input and output cabinets | Six: engine room port (ME1, its pumps, coolers), engine room starboard (ME2), auxiliary engine room (sets, boiler, air, fuel treatment), switchboard room (power management), after end (steering gear, cargo hydraulics, after tanks), forward (thruster, pump room, ballast, drencher, deck machinery, accommodation plant) | Each on a doubled network, each fed from the 24 V battery system and a second supply |
| Extension alarm panels | Chief engineer, second and third engineer, electrician, mess, crew lounge, bridge | Group alarms, duty engineer selection, the call that sounds everywhere if an alarm is not accepted in time [R26] |
| Power management | In the switchboard room cabinet | Automatic start and synchronising of the diesel sets, start of a stand-by set on load, the heavy consumer request of the thruster, the preference trips, black-out restart |
| Safety systems kept apart | On each engine and set | The shutdowns stay hard-wired and independent of the screens: overspeed, low lubricating oil pressure, oil mist (the class tables [R20][R21]) |
| Tank gauging and valve control | Cargo office and control room | Levels of every fuel, ballast, heeling and fresh water tank; the ballast and heeling valves |
| Maintenance programme | A workstation in the control room and the chief engineer's office | Running hours of every machine come from the system; jobs fall due by hours or by date. The whiteboard in the workshop (the owner's photograph E2 [H5]) stays as its paper form |

### 5.4 The input and output list, by system

Types: P pressure transmitter (4 to 20 mA); T resistance thermometer (Pt100); TC thermocouple; L level transmitter; S speed
pick-up; D contact (on or off); C command (output). **Alarm settings: where a maker prints one it is given with its key,
but none is the 12 M 540's own (n/v): [P5] is a present engine of 4,350 kW at 600 rpm, [R22] a smaller engine of the older
kind, [R23] a present engine of 500 kW a cylinder.** The settings for this ship are to be taken from the engine builders'
books when they are found.

**A. Main engines** (each engine; two engines: about 110 signals)

| Signal | Type | Range | Alarm and trip settings | Source |
|---|---|---|---|---|
| Engine speed | S | 0 to 750 rpm | Overspeed alarm 110 % (660 rpm), shutdown 115 % (690 rpm) | R23 |
| Turbocharger speed, two | S | n/v | | |
| Fuel rack position | P | 0 to 100 % | | |
| Lubricating oil pressure before the engine | P | 0 to 10 bar | Nominal 4.5 bar, alarm 3.8 bar, stop 3.5 bar [P5]; an older engine: alarm 3 bar, stop 2.5 bar [R22] | P5 R22 |
| Lubricating oil temperature before the engine | T | 0 to 120 °C | Nominal 63 °C, alarm 70 °C | P5 |
| Lubricating oil filter pressure drop | P | 0 to 2.5 bar | Alarm 1.0 bar | P5 |
| Main bearing temperatures, seven (refit) | T | 0 to 150 °C | Alarm 95 °C | R22 |
| Oil mist in the crankcase | D | | Alarm and shutdown | R20 R21 |
| Jacket water pressure before the engine | P | 0 to 6 bar | Alarm 1.9 bar [P5]; or 0.4 bar over the static head [R22] | P5 R22 |
| Jacket water temperature after the engine | T | 0 to 150 °C | For an engine run at 80 °C: alarm 90 °C, stop 95 °C [R22]. A present engine: nominal 93, alarm 103, stop 110 °C [P5] | R22 P5 |
| Jacket water temperature before the engine | T | 0 to 150 °C | | |
| Charge air pressure | P | 0 to 4 bar | | |
| Charge air temperature after each cooler, two | T | 0 to 120 °C | Alarm 60 °C [P5]; 65 °C [R22] | P5 R22 |
| Exhaust temperature after each cylinder, twelve | TC | 0 to 700 °C | Alarm 410 °C; deviation from the mean ±50 °C | R22 |
| Exhaust temperature before and after each turbocharger, four | TC | 0 to 700 °C | Alarm 550 °C before the turbocharger | R22 |
| Fuel pressure before the injection pumps | P | 0 to 16 bar | Nominal 7 to 8 bar [P5]; alarm 4 bar on heavy fuel [R22] | P5 R22 |
| Fuel temperature at the engine | T | 0 to 200 °C | | |
| Fuel leak from the injection pipes (refit) | D | | Alarm | |
| Nozzle cooling flow and temperature | D, T | | Alarm | est. |
| Starting air pressure at the engine | P | 0 to 40 bar | Alarm 15 bar | P5 R23 |
| Control air pressure | P | 0 to 10 bar | Alarm 5.5 bar | R23 |
| Turning gear engaged; start blocked; local or remote; running; slow-down; shut-down; emergency stop given | D, seven | | | R20 |
| Start, stop, speed setting, emergency stop | C, four | | | |

**B. Gears, shafts and propellers** (each shaft; two: about 44)

| Signal | Type | Range | Setting | Source |
|---|---|---|---|---|
| Gear oil pressure; clutch oil pressure | P, two | 0 to 25 bar | Low: alarm, then the clutch is released (settings n/v) | est. |
| Gear oil temperature; gear bearing temperatures, four; thrust bearing temperature | T, six | 0 to 150 °C | n/v | est. |
| Gear oil filter; stand-by pump running; clutch engaged | D, three | | | |
| Clutch in, clutch out | C, two | | | |
| Shaft speed | S | 0 to 250 rpm | | |
| Plummer block temperature; stern tube after bearing temperature (refit) | T, two | 0 to 120 °C | n/v | est. |
| Stern tube header tank level low; shaft brake applied | D, two | | | |
| Pitch, measured | P | 23° astern to 32° ahead [P4] | Deviation from the order: alarm | P4 |
| Pitch order; control at the bridge, the control room or the box | C, D | | | P4 |
| Pitch oil pressure; temperature; tank level low; filter; pumps running, two; stand-by pump started | P, T, D | 0 to 100 bar (n/v) | Low pressure: stand-by pump starts, alarm | P4 |

**C. Electrical plant** (about 120)

| Signal | Type | Notes | Source |
|---|---|---|---|
| Each diesel set (three): speed; lubricating oil pressure; cooling water temperature; exhaust temperature; overspeed trip; start failure; breaker closed, open, tripped; ready; kW, A, V, Hz; three winding temperatures; bearing temperature; start, stop, speed raise and lower | S, P, T, TC, D, C: about 22 each | The pattern's sets shut down on high cooling water temperature, which blacked the ship out [P4]: here the alarm comes 5 °C before the trip and the stand-by set starts on it | P4 |
| Each shaft generator (two): breaker closed, open, tripped; kW, A, V, Hz; three winding temperatures; two bearing temperatures; voltage regulator fault | about 12 each | The pattern's starboard machine was out of use for a failed part of its voltage regulator [P4] | P4 |
| Main switchboard: voltage and frequency of each bus section and the thruster bus; bus tie; earth fault lamps for 690 V, 440 V and 230 V; transformer temperatures; preference trip stages; shore connection in; thruster breaker; thruster start request and permit | about 20 | The system is insulated, with earth-fault lamps on the board [H4] | H4 |
| Emergency plant: set running; breaker; tie to the main board; start failure; **mode switch not in automatic**; fuel tank low; chargers failed, three; 24 V earth fault; battery voltage low, two | about 12 | The pattern's emergency set did not start because it had been left out of automatic [P4]: so the switch's position is an alarm here | P4 |

**D. Fuel** (about 55): level of thirteen tanks (L; high and low alarms on the settling and service tanks, high on the
overflow, sludge and leak tanks); temperature of the four bunker tanks, the settling and the service tank (T); flow in the
overflow main (D); each separator running, failed, and its feed temperature (D, D, T); at the booster unit the supply
pressure, the circulating pressure, the viscosity (alarm high and low: range 10 to 24 cSt [P5]), the temperature, the
filter's pressure drop, four pumps running, two stand-by starts, the position of the change-over valve, the flow meter's
pulse; the transfer pumps running; the quick-closing valves released.

**E. Lubricating oil** (about 30): level and temperature of the two circulating tanks (low-level alarm); four pumps
running, two stand-by starts, two pre-lubricating pumps; each separator running, failed, its temperature; level of the six
storage tanks.

**F. Cooling water** (about 28): sea water pressure in the main service line (low: the stand-by pump starts); three sea
water pumps running; the sea valves' positions (refit); each strainer's pressure drop; **the position of the valve joining
the harbour and main service lines** [P4]; sea water temperature; three jacket water pumps running and the stand-by start;
low level in the three expansion tanks; the preheater on; the fresh water generator running, its salinity alarm; the
nozzle cooling unit.

**G. Compressed air** (about 14): pressure in AR1, AR2 and AR3 (alarm 15 bar [P5]); three compressors running and failed;
control air pressure (alarm 5.5 bar [R23]); working air pressure; dryer fault.

**H. Steam** (about 26): boiler pressure (high and low); water level high, low and the low-level cut-out; flame failure;
burner running; fuel temperature low; feed pumps and circulating pumps running; flow through each economiser; gas
temperature before and after each economiser (a rising outlet temperature is a soot fire); hotwell level; oil in the
condensate; the dump valve open.

**I. Bilge, ballast and fire** (about 130): a high-level alarm in each of fourteen bilge wells [R19]; the bilge holding
tank's level; the oily water separator's 15 parts alarm; three fire pumps running and their starts; fire main pressure; the
drencher pump running, its pressure, eight section valves open; carbon dioxide released, its warning, the room's door; the
water mist unit; level of twelve ballast tanks and the two heeling tanks; the heel angle; the heeling pump running to port
or to starboard; about 24 ballast and heeling valves, each open, shut and its two commands; the watertight door open or
shut. The fire detection system has its own panel and gives the system a common alarm and a common fault [H4].

**J. Steering gear and thruster** (about 32): for each steering power unit: running, overload, phase failure, power
failure, control supply failure, low oil level, hydraulic lock; two rudder angles; the thruster motor running, its current,
three winding and two bearing temperatures, pitch measured and ordered, oil level and pressure low, ready, the room's
bilge.

**K. Cargo access and deck machinery** (about 45): each power pack's pumps running, oil level, oil temperature, filter and
pressure; the stern ramp closed and each of its ten cleats locked; the ramp cover closed and secured; the lift up and its
four bolts in; the two pilot doors closed and locked (all repeated on the bridge's door and ramp panel [H4]); the forward
pump unit.

**L. Ventilation, vehicle decks and air conditioning** (about 80): each of 22 fans running and failed, with its start and
stop; twelve fire dampers shut; **loss of vehicle deck ventilation, alarmed on the bridge as the rule asks** [R2]; carbon
monoxide at four points on the vehicle decks (a circular gives 40 mg/m³ as the alarm [R4]); the air handling unit's
temperatures; the refrigerating plants; the cold rooms' temperatures.

**M. Fresh water and sanitary** (about 14) and **N. common signals** (about 12): the two fresh water tanks' levels; the
hydrophores' pressures and pumps; the calorifier; the sewage plant; the temperatures of the engine room and the control
room; the watch alarm; the engineers' call; the system's own faults.

**In all about 740 signals.** With a fifth to spare the refit's system is laid out for 900 channels.

---

## 6. Capacities and endurance

### 6.1 Power for 17.5 knots

No resistance calculation has been made. The check is by the Admiralty coefficient (displacement to the power two thirds,
times speed cubed, over power) against two ships of her kind:

| Ship | Displacement | Speed | Power taken | Coefficient |
|---|---|---|---|---|
| Bison (Sietas, 1975), 125.00 × 19.05 m, two 12 M 540 [P3] | about 7,500 t (est.: n/v) | 18.5 kn | 90 % of 8,825 kW | about 305 |
| Mashala class (Rickmers, 1977), 116.3 m [P4] | about 6,000 t (est.: n/v) | 15.5 kn | 90 % of 4,413 kW | about 310 |
| **Chisum** | 8,490 t [H1] | 17.5 kn | **7,430 kW** at a coefficient of 300 | |

So the service power is taken as **2 × 3,750 kW = 7,500 kW, 85 % of the engines' 2 × 4,413 kW**. The margin above it (15 %)
is for weather, a fouled hull and the shaft generator.

### 6.2 Fuel

| Item | Figure | Basis |
|---|---|---|
| Specific fuel consumption of the main engines | 205 g/kWh on the test bed with diesel oil (150 g a metric horsepower-hour) | est.: typical of medium-speed engines of the early 1970s; the 12 M 540's own figure is n/v. A present engine of the same power and speed burns 173 to 179 g/kWh [P5] |
| The same on heavy fuel | 217 g/kWh | est.: heating value 40.4 against 42.7 MJ/kg |
| Main engines at service power | 7,500 kW × 217 g/kWh = 1,630 kg/h = **39.1 t a day** | |
| Shaft generator at sea | 487 kW electrical (section 4), about 530 kW at the engine = 115 kg/h = **2.8 t a day** | est.: 92 % through the take-off and the machine |
| **At sea, in all** | **41.8 t a day of heavy fuel**: 43.5 m³ a day, 1.81 m³/h | density 0.96 t/m³ |
| Boiler | none at sea (the economisers make the steam); in port in winter about 1,000 kg/h of steam: 77 kg/h, **1.8 t a day** | 0.077 kg of fuel a kg of steam (recalled from the ventilation standard's table: n/v) |
| Generating sets in port | about 330 kW average (493 kW for 8 hours, 251 kW for 16) at about 225 g/kWh: 80 kg/h, **1.9 t a day of diesel oil** | est.; the 816's consumption is n/v |

| Tank | Volume | Holds |
|---|---|---|
| Heavy fuel bunkers T-HF1P, T-HF1S | 2 × 110 m³ [H1] | |
| Heavy fuel bunkers T-HF2P, T-HF2S (proposed) | 2 × 60 m³ | |
| **Heavy fuel in all** | **340 m³**; usable 323 m³ (98 % full, 97 % pumpable) = 310 t | **7.4 days at sea: 3,100 nautical miles at 17.5 knots** |
| With the hull's two wing tanks only | 220 m³; usable 209 m³ = 200 t | 4.8 days: 2,000 miles |
| Settling tank T-HFS | 44 m³ | 24 hours at service power |
| Service tank T-HFD | 21 m³ | 11.5 hours |
| Diesel oil bunkers T-DOP, T-DOS (proposed) | 2 × 40 m³; usable 76 m³ = 65 t | 34 days of the generating sets in port |
| Diesel oil service tank T-DOD | 12 m³ | 5 days of the sets; or about 6 hours of both main engines at service power on diesel |
| Emergency set's tank EG-T | 2.5 m³ proposed | 36 hours [R12] at 250 kW: 66 l/h (est.: 206 g/kWh at the shaft [E16 (summary)]). At the set's full 500 kW, 36 hours would want 4.4 m³. The tank in the room as built (about 200 l [H6]) is 3 hours at 250 kW |
| Overflow, sludge, leak, bilge holding | 10, 4, 3, 15 m³ | sludge: about 1 % of the fuel burned, 0.4 t a day (est.): 9 days |

Her route is the owner's (Minato to Kitano-jima and back [H1]); its length is not written anywhere this agent read. The
figures above give a ship that bunkers once a week on a daily service, as the ferries of her kind did (one of the larger
class sailed with 441 m³ of heavy fuel and about 100 m³ of diesel [H5]).

### 6.3 Lubricating oil

| Item | Figure | Basis |
|---|---|---|
| Main engines' consumption | about 1.3 g/kWh: 9.8 kg/h, 0.26 m³ a day at sea | est.; n/v. A present engine: 3.3 l/h at 4,350 kW [P5] |
| Circulating tanks T-LC1, T-LC2 | 6.5 m³ each | 1.4 l/kW [P5] |
| Storage T-LS1, T-LS2 | 2 × 6 m³ | one whole charge and three weeks' consumption |
| Renovating tank T-LR | 6.5 m³ | one charge |
| Gear oil, generator engine oil, hydraulic oil | 2, 1.5, 1.5 m³ | est. |

### 6.4 Fresh water

| Item | Figure | Basis |
|---|---|---|
| Consumption | 75 persons × 150 l = 11.3 t a day, and about 1.5 t a day for the boiler and the engines: **12.8 t a day** | est. |
| Tanks T-FWP, T-FWS | 2 × 60 m³ [H1] | 9 days without making any |
| Fresh water generator FWG | about 15 t a day at sea | covers the consumption on a sea day |

### 6.5 Starting air

The rule: at least two receivers of about equal size and at least two compressors, one of them independent; the
compressors together charge the receivers from empty in one hour; for non-reversing engines with a controllable-pitch
propeller not less than six starts [R10]. Air for one start of a 12 M 540: n/v. A present six-cylinder engine of the same
power takes 1.2 normal cubic metres [P5]; an engine of 1975 with twice the cylinders is taken at 4 (est.).

| Check | Figure |
|---|---|
| Two receivers of 1,000 l from 30 bar down to 12 bar | 36 normal cubic metres: nine starts at 4 m³; six starts of each engine would want 48 m³, 2 × 1,350 l |
| Two compressors of 53 m³/h filling 2,000 l to 30 bar (60 m³ of free air) | 34 minutes together, 68 minutes with one |

So the receivers hold nine starts, between the rule's six in all and six of each engine: which of the two a class society
would ask of a twin-engined ship is n/v (the rule lets the number be agreed for such plants). If twelve are asked, the
receivers become 2 × 1,350 l (a present table's 1,250 l receiver is 2.93 m long by 0.8 m across [A12]).

### 6.6 Steam

| User | Steam, kg/h (winter) | Basis |
|---|---|---|
| Bunker tank coils | 250 | est. |
| Settling, service, sludge and bilge tank coils | 90 | est. |
| Fuel separator heaters (2,400 l/h by 48 K) | 115 | 68 kW by the maker's formula [P5] |
| Booster unit heaters (1.8 m³/h from 95 to 118 °C) | 45 | est. |
| Lubricating oil separator heaters | 70 | est. |
| Trace heating | 30 | est. |
| Accommodation heating | 340 | est.: 200 kW |
| Hot water | 100 | est.: 60 kW |
| Galley | 30 | est. |
| **At sea** | **about 1,070** | the two economisers give 1,400 |
| In port, with jacket preheating (140: 5 kW a cylinder [E17]) and without the fuel separators' full load | about 1,000 | the oil-fired boiler gives 1,500 |

A study of 1970 for ships with two medium-speed engines chose an oil-fired boiler of 2,000 lb/h (900 kg/h) at
100 lb/in² beside a waste-heat boiler of 2,400 lb/h (1,090 kg/h) [E8]: the same order.

### 6.7 Ventilation

**Machinery spaces**, by the method of ISO 8861 [R1]: outside air at 35 °C, a rise of not more than 12.5 K; the airflow is
the larger of combustion air plus the air that carries off the heat, or one and a half times the combustion air;
combustion air for four-stroke engines 0.0020 kg a kW a second at 1.13 kg/m³ [R1]. That is 6.4 m³/h a kW for combustion and
at least 9.6 m³/h a kW in all: the rule of thumb.

| | Figure |
|---|---|
| Combustion air, main engines (8,826 kW) | 15.6 m³/s |
| Combustion air, two generating sets (790 kW; a stand-by set is left out [R1]) and the boiler | 1.9 m³/s |
| Heat to carry off: about 350 kW (est.: engines, sets, exhaust pipes, boiler, electrical machines; the standard's own table was not read) | 24.5 m³/s, less 0.4 of the engines' and sets' combustion air and all of the boiler's [R1]: 17.2 m³/s |
| **Total** | **34.7 m³/s** (1.5 times the combustion air alone would be 26.2) |
| Fans | EF1, EF2: 2 × 12.5 m³/s for the engine room; AF1, AF2: 2 × 5 m³/s for the auxiliary room: 35 m³/s |

**Vehicle decks.** The older rule asked at least 10 air changes an hour in a passenger ship's vehicle spaces, by a system
of their own, with the loss of ventilation shown on the bridge [R3]; today's asks 10 for special category spaces and
lets the Administration ask more while vehicles are loaded and unloaded [R2]. The repository's design figure is 10 at sea
and 20 while loading [H6].

| Space | Volume | 10 changes an hour | 20 changes an hour | Fans |
|---|---|---|---|---|
| Main deck, about 100 × 15 × 5.2 m | 7,800 m³ | 78,000 m³/h, 21.7 m³/s | 156,000 m³/h, 43.3 m³/s | Exhaust VF1 to VF4, 4 × 11 m³/s: all four at half speed at sea, at full speed while loading. Supply VS1, VS2, 2 × 17.5 m³/s (four fifths of the exhaust) |
| Lower hold, about 45 × 14 × 4.6 m | 2,900 m³ | 29,000 m³/h, 8.1 m³/s | 58,000 m³/h, 16.1 m³/s | Exhaust HF1, HF2, 2 × 8.1 m³/s: one at sea, two while loading. Supply HS1, HS2, 2 × 6.5 m³/s |

### 6.8 Anchors and cables

Equipment number = displacement^(2/3) + 2 × breadth × h + 0.1 × A, where h is the height from the load waterline to the top
of the uppermost house and A the side area above the waterline (the form of the rule as recalled; the table is read [D18]).

| Term | Figure |
|---|---|
| Displacement 8,490 t [H1], to the power two thirds | 416 |
| h: freeboard to the upper deck 7.6 m, and four tiers of house of 2.8, 2.8, 2.8 and 2.7 m [H1] | 18.7 m; 2 × 19.6 × 18.7 = 733 |
| A: hull 114.0 × 7.6 = 866 m², houses about 198 m² | 1,064 m²; a tenth: 106 |
| **Equipment number** | **about 1,255** |
| The table's row for 1,220 to 1,300 [D18] | bower anchors of 3,780 kg (two, and a spare in the older edition); 522.5 m of stud-link chain; 62 mm in grade 1, **54 mm in grade 2**, 48 mm in grade 3 |
| Mooring lines and towline for this row | n/v. The row for 1,390 to 1,480 gives a towline of 200 m and four lines of 180 m [D18b (summary)] |

---

## 7. What is not settled, and the sources

### 7.1 Not settled

**The engines and the height of the room**

1. **The 12 M 540's own size, weight and details are not verified.** Read: 60° V, 370 × 400 mm, 550 to 600 rpm, a range of
   2,750 to 9,600 PS over 6 to 16 cylinders [P1], and two of them giving 8,825 kW in the Bison [P3]. Taken from its
   successor, the 12 M 640 [P2]: 6.64 × 3.52 × 3.84 m and 48 t. Not found at all: which end the turbochargers stand at, the
   piston withdrawal height, the sump (dry is assumed), where the camshafts and the fuel pumps are, the firing order, the
   starting air pressure and air per start, the fuel consumption, whether the lubricating oil and cooling pumps were
   attached (the pattern's were electric [P4]: followed here), the nozzle cooling, the paint. A Deutz installation drawing
   or an instruction book of the 540 would settle all of it; the Deutz archive in Cologne and the owners of sister engines
   are the places to ask.
2. **Colour.** Proposed: the light green of the owner's photograph F1, with blue floor plates [H5]. Deutz's own marine
   paint of 1975: n/v.
3. **The deck over the engines.** Everything in section 2.1 rests on webs 0.7 m deep under the main deck (underside
   5.9 m). The hull's steel has to confirm it. If the webs are deeper the engine's top (5.34 m at its forward end) and the
   exhaust crossing (underside 5.45 m) come too near.
4. **The engine wells.** The tank top is lowered to 1.2 m under each engine. That is a change to the hull's double bottom
   and to the circulating tanks under it.
5. **The gears.** Maker, horizontal offset, 0.75 m and the take-off's place are this basis's proposal; the type letters of
   1975, the real centre distance, size and weight: n/v [P7][P8].
6. **The propellers and shafts.** Escher Wyss hub size, oil pressure and whether the control had a combinator: n/v. The
   hull has 280 mm shafts and 3.0 m screws [H2]: by the class formula as recalled the propeller shaft wants about 300 mm;
   and 3.0 m is a small screw for 4,413 kW (the best diameter at 220 rpm is nearer 3.4 m: est.), accepted here because the
   hull is drawn round it. The pattern's pitch goes full astern when its oil pressure fails [P4]: whether to copy that
   behaviour or correct it at the refit is the owner's to say.

**The electrical plant**

7. **690 V in a ship of 1975.** No source shows it; the pattern made 440 V [P4]. Either the story says the generating
   plant and main switchboard were renewed at the refit (then the three sets could honestly be present-day sets: a Volvo
   Penta D13-MG of 322 kW electrical is 3.22 × 1.17 × 1.81 m and 3.2 t [E6]), or she keeps her Deutz 816 sets and the
   anachronism is accepted. This basis keeps the Deutz sets: they are what the owner would have stood beside.
8. **The generating sets' sizes** are est.: only the bare engine's are read [P1]. The AEG alternator's type DKBH is the
   pattern's [P4]; its size at 400 kVA: n/v. The same for the shaft generators.
9. **The load figures** are estimates throughout (section 4.2), and the reefer sockets (180 kW connected) are an
   assumption: a ship of 1977 had 75 such sockets [H5], the pattern's number is n/v.
10. **The emergency set.** 500 kW is the owner's drawing; her own emergency load is about 150 kW. The tank in the room as
    built is about 200 l; 36 hours wants 2.5 m³ (section 6.2). The type proposed is known here only from a search summary
    [E16].
11. **The hull's general arrangement speaks of three sets of about 500 kW at 450 V** [H1]; the design basis given to this
    agent says three of about 320 kW at 690 V [H4]. This document follows the second. They should be made one.

**Boilers and auxiliaries**

12. **No maker's sheet of the 1970s was found for any boiler, economiser, separator, compressor, pump, cooler, fresh water
    generator, sewage plant or oily water separator.** The types named are right for the time as far as could be read;
    their **sizes are those of the makers' present machines of the same duty** (or est.) and are marked so, row by row.
    Whether the Alfa-Laval MAPX 207 and the Hatlapa W-type compressor were made in 1974 to 1977: n/v.
13. **Sunrod** is chosen on the evidence of one ferry of 1985 [E11]; Aalborg's AQ boilers are the other candidate (an AQ-3
    was read only as a 12 t/h tanker boiler [E10], an AQ-2 as an exhaust boiler [E20]).
14. **Fuel after 2015.** She burns heavy fuel as built. A ship trading where 0.1 % sulphur is asked would have gone over to
    gas oil at the refit, and the separators, heaters, booster unit and much of the steam would stand idle. Not decided.

**Things this basis asks of the hull** (none is in `ga.py` or `spec.py` yet)

15. The port sea chest raised to 2.2 to 2.8 m above the keel (high and low suctions, as the pattern [P4]); a sea inlet in
    the auxiliary engine room for fire pump No. 2; sea chests in the forward pump room for the ballast, drencher and No. 3
    fire pumps.
16. Two double-bottom heavy fuel tanks of 60 m³ and two diesel oil tanks of 40 m³; the overflow, sludge, leak, bilge
    holding and circulating tanks in the double bottom under the machinery.
17. In the side casings at the main deck: the exhaust trunks EX1 and EX2 (34.0 to 36.2 m from the transom), the drencher
    valve station (36.2 to 38.4 m, port), which take 4.4 m from the deck workshop. On the upper deck: a carbon dioxide
    room forward of the port funnel and a fan house forward of the starboard one. In the house: an air conditioning room.
18. A soft patch in the main deck over the engine room (2.8 × 2.0 m on the centreline, 35.4 to 38.2 m from the transom).
19. The heeling pump in the auxiliary engine room, not the forward pump room; the pitch oil units in the engine room, not
    the after passage.
20. After mooring: the hull has a capstan each side [H1]. Whether a ship of 125 m would be passed with capstans alone aft
    (no drum winch): n/v.

**Rules**

21. She carries 50 drivers, so the passenger ship rules are applied (three fire pumps, three bilge pumps, drencher, 36 hours
    of emergency power, steering gear without a separate auxiliary). They were read in the present text from a mirror of the
    convention [R2][R6][R8][R11] to [R14], not from the convention itself, and **the text in force when she was built was
    not read** except the vehicle space ventilation of the 1974/78 text [R3] and IMCO's resolutions of 1967 and 1971
    [R5][R19]. Her gross tonnage is not calculated; it is taken as over 4,000 (the pattern, smaller, is 5,881 [P4]).
22. The class formulae for shaft diameter and the equipment number, and 0.077 kg of fuel a kg of steam, are recalled, not
    read.
23. ISO 14726 is of 2008 [R17]: the pipe colours are the refit's.

**Not researched at all, for want of sources:** the workshop's machine makes, the provision crane's maker, the davits' and
lifeboats' makers and sizes of 1975 (only how such davits work was read [D19][D20]), the deck machinery's type numbers.

The repository's handover file was not updated by this agent: it was allowed to write this one file only.

### 7.2 Sources

Numbers missing from a series are sources that were read and not used.

**The ship herself (this repository)**

- [H1] `ferry/blender/ga.py`, revision D of the general arrangement, on the branch `claude/chisum-revision-d` (worktree
  `.claude/worktrees/agent-aada69ab104d62771`), read 12 November 2026.
- [H2] `ferry/blender/spec.py` on the same branch: shaft lines, screws, rudders, steering gear, thruster, sea chests.
- [H3] `ferry/blender/lines.py` on the same branch: half-breadths and the keel line, computed from it on 12 November 2026.
- [H4] `ferry/systems/ship.py` and `ferry/systems/README.md`: the supply as registered, the boards, the bridge's pipes.
- [H5] `ferry/yard/reference/roro-freight-ships.md`, `classic-ferries-1958-1978.md`, `owner-photographs-2026-11-11.md`,
  `owner-drawings-2026-11-12.md`.
- [H6] `HANDOVER.md`: the emergency generator room as built to the owner's drawing; the vehicle deck ventilation's figures.

**Propulsion**

- [P1] German Wikipedia, "Liste der Deutz-Motoren": the sections BVM540, BVM640 and Baureihe AM816, and the meaning of the
  type letters. https://de.wikipedia.org/wiki/Liste_der_Deutz-Motoren
- [P2] Deutz AG data sheet "Baureihe 640 für Schiffsanwendungen", once at http://www.deutz.hu/640s.htm , read in the
  archived copy https://web.archive.org/web/2015/http://www.deutz.hu/640s.htm
- [P3] Fakta om Fartyg, Bison (1975). http://www.faktaomfartyg.se/bison_1975.htm
- [P4] Marine Accident Investigation Branch, report 5/2009, electrical blackout and grounding of Moondance: sections 1.6 to
  1.9. https://assets.publishing.service.gov.uk/media/547c6ff840f0b6024400005f/MoondanceReport.pdf
- [P5] Wärtsilä 38B Marine Project Guide, 1/2002: technical data of the 6L38B (4,350 kW at 600 rpm), pipe connections,
  system rules. https://www.lme.ntua.gr/academic-info-1/prospheromena-mathemata/egkatastaseis-prooses/PGW38B2002.pdf
- [P6] Kongsberg, "Kamewa CP-A" leaflet (controllable-pitch propeller hubs: dimensions and weights).
  https://www.kongsberg.com/contentassets/0514176f48514cb3abb738f4b1f9d8c7/04.propeller_4p_22.10.09.pdf
- [P7] Maritime Reporter, September 1992, page 10 (Lohmann + Stolterfoht's marine gears).
  https://magazines.marinelink.com/Magazines/MaritimeReporter/199209/page/10
- [P8] Reintjes product guide (summary only: main dimensions and weights of the LAF gears).
  https://www.reintjes-gears.de/sites/default/files/2023-08/Product%20Guide%202023_web_0.pdf
- [P9] Maritime Reporter, October 1970, page 8 (controllable-pitch propellers in large ships; the oil distribution box on
  the intermediate shaft). https://magazines.marinelink.com/Magazines/MaritimeReporter/197010/page/8
- [P10] QuantiParts, the SWD TM410 (layout only). https://quantiparts.com/?p=1747

**Generating sets, boilers, exhaust**

- [E2] Pool Trading, Deutz SBA 8M 816. https://www.pooltrading.com/merk-deutz/sba-8m-816/
- [E3] Wotol, Deutz BA8M816 with an AvK alternator. https://www.wotol.com/product/deutz-ba8m816/2796030
- [E4] Resale, Deutz BA 12M 816 with an AEG alternator. https://www.resale.info/en/deutz-ba-12m-816/No-127821972
- [E5] Caterpillar 3406C marine generator set, 320 kW (data sheet LEHM1604).
  https://www.depco.com/pdfs/3406c-marine-generator-set-320kw-lehm1604.pdf/
- [E6] Volvo Penta D13-MG. https://pubs.volvopenta.com/publications/47709020
- [E7] Hodgkin, Transactions of the Institute of Marine Engineers 88 (1976). https://library.imarest.org/record/2103
- [E8] Buchanan, Transactions of the Institute of Marine Engineers 82 (1970). https://library.imarest.org/record/2007
- [E9] Short (1971). https://library.imarest.org/record/478
- [E10] Transactions of the Institute of Marine Engineers 91 (1979). https://library.imarest.org/record/2154
- [E11] Transportation Safety Board of Canada, report M04M0013 (Caribou).
  https://tsb.gc.ca/eng/rapports-reports/marine/2004/m04m0013/m04m0013.html
- [E12] Alfa Laval Aalborg OS-TCi.
  https://alfalaval.com/globalassets/images/industries/marine-and-transportation/lng/aalborg-os-tci-rev.pdf
- [E13] Alfa Laval Aalborg XS-TC7A.
  https://assets.alfalaval.com/documents/pca2abc93/alfa-laval-aalborg-xs-tc7a-product-leaflet-en.pdf
- [E14] Steam Esteem, Sunrod boilers. https://steamesteem.com/boilers/sunrod-boilers.html
- [E15] Alfa Laval Aalborg OS (burners).
  https://www.alfalaval.co.uk/products/heat-transfer/boilers/oil-gas-fired-steam-boiler/aalborg-os/
- [E16] Cummins KTA19 (summary only). https://www.cummins.com/g-drive-engines/diesel-kta19-series and
  https://incal.cummins.com/www/common/templatehtml/technicaldocument/SpecSheets/Gdrive/k19/kta19g4.pdf
- [E17] Wärtsilä 32 Product Guide, 2018. https://www.hurtigwiki.de/_media/schiffe/ms_trollfjord/product-guide-o-e-w32.pdf
- [E18] Wärtsilä 20 guide, 1/2019.
  https://tech-expo.ru/upload/iblock/e33/Instruktsiya-po-ekspluatatsii-W_rtsil_W20.pdf
- [E20] Aalborg AQ-2 boiler manual (a copy). https://pdfcoffee.com/boiler-aalborg-aq-2-ovimu-pdf-free.html

**Auxiliaries**

- [A1] Alfa Laval MOPX brochure.
  https://www.alfalaval.com/globalassets/documents/products/separation/centrifugal-separators/disc-stack-separators/mopx.pdf
- [A2] Alfa Laval MOPX 207 separator manual.
  https://alphahellas.gr/manual/purifiers/alfa-laval-mopx-207-separator-manual.pdf
- [A3] Alfa Laval MAB 206 leaflet.
  https://assets.alfalaval.com/documents/p24bbda1b/alfa-laval-product-leaflet-mab-206-separator-product-leaflets-en-gb.pdf
- [A4] Surplus Record, MAPX 207S-24 of 1987.
  https://surplusrecord.com/listing/alfa-laval-mapx-207s-24-disc-centrifugal-separator-5750-l-h-1987-1073637/
- [A5] Gumatech, MAPX 204. https://gumatech.com/purifier/mapx-204/
- [A6] Hatlapa water-cooled compressors W55, W80.
  https://www.macgregor.com/globalassets/services/downloads/compressors/hatlapa-water-cooled-compressor-datasheet_w55-w80_nov2025.pdf
- [A7] Hatlapa compressors L9 to L190.
  https://www.macgregor.com/globalassets/services/downloads/compressors/hatlapa-compressorl9_l14_l140_160_190-datasheet_november2025.pdf
- [A10] Jinbo Marine, AFGU fresh water generator. https://www.jinbomarine.com/AFGU-Fresh-Water-Generator
- [A11] Maritime Reporter, 15 August 1985 (Atlas-Danmark).
  https://magazines.marinelink.com/Magazines/MaritimeReporter/19850815/content/atlasdanmark-freshwater-generators-202721
- [A12] Wärtsilä 31 manual, page 86 (starting air vessels). https://www.manualslib.com/manual/1228139/Wartsila-31.html?page=86
- [A13] Zöllner Makrofon (summary only). https://www.nauticexpo.com/prod/zollner-signal-gmbh/product-200323-581906.html
- [A14] VAF Instruments, history. https://www.vaf.nl/who-we-are/
- [A15] Wikipedia, Viscotherm. https://en.wikipedia.org/wiki/Viscotherm
- [A16] Boll & Kirch type 6.64. https://www.bollfilter.com/fileadmin/downloads/prospekte/6-64-en.pdf
- [A17] Blohm + Voss Turbulo MPB (summary only). https://www.scribd.com/document/658124835/SKF-Blohm-Voss-Turbulo-MPB
- [A18] Kloska OC 2.5 EB (summary only). https://www.kloska.com/wp-content/uploads/2023/10/technical-specs-OC-2.5-EB.pdf
- [A19] Hamworthy Super Trident. https://www.hamworthy.com/products/waste-management/sewage-treatment/super-trident ;
  its history: https://www.ship-technology.com/contractors/wastewater/hamworthy-water/ ; the ST4A (summary only):
  https://www.scribd.com/document/541352268/IM-27-Sewage-Treatment-Unit
- [A20] Desmi NSL pumps. https://www.desmi.dk/media/s4yfy43e/nsl_compact_spacer_-_dimensional_sketches.pdf and
  https://www.desmi.dk/media/eprei05v/nsl_uk_low.pdf
- [A22] Jinbo Marine, hydrophore units (summary only, uncertain).
  https://www.jinbomarine.com/pdf/Marine-ZYG-Series-Hydrophore-System
- [A23] TeamTec OG200 (summary only). https://pdf.nauticexpo.com/pdf/teamtec-as/og-200-csw/31696-16974.html

**Steering, thruster, cargo access, deck machinery, boats**

- [D1] IACS unified requirement S10 (rudder force and torque).
  https://www.turkloydu.org/pdf-files/iacs-karar-ve-csr-degisimleri/iacs-es-gereklilikleri/UR_S10_Rev4_Corr1_TR_EN.pdf
- [D3] Hatlapa product catalogue, 2013. https://www.mshs.com/wp-content/uploads/2022/05/HATLAPA_All_in_One_2013_webres.pdf
- [D4] Kongsberg tunnel thruster type TT.
  https://kongsbergmaritime.com/products/propulsors-and-propulsion-systems/thrusters/standard-tunnel-thruster/type-tt/
- [D5] Rolls-Royce archived page, standard tunnel thruster (summary only).
  https://www.mylearning.rolls-royce.com/products-and-services/marine-archived/product-finder/propulsors/tunnel-thrusters/standard-tunnel-thruster.aspx
- [D6] Wärtsilä transverse thrusters.
  https://www.wartsila.com/marine/build/propulsors-and-gears/thrusters/wartsila-transverse-thrusters
- [D7] ABB M3BP 400LB 4 (summary only).
  https://flumasys.com/m3bp-400lb-4-process-performance-cast-iron-motor-class-efficiency-ie2-4-poles-630-kw-cenelec
- [D8] AuCom case study (summary only).
  https://www.aucom.com/case-studies/case-study-bow-thrusters-and-fluid-pumps-on-lng-carriers
- [D9] Final report on the Estonia, chapter 3.2. https://onse.fi/estonia/chapt03_2.html
- [D10] Maritime Reporter, October 1978 (MacGregor's equipment in the Claymore).
  https://magazines.marinelink.com/Magazines/MaritimeReporter/197810/content/macgregors-solution-variation-210164
- [D11] MacGregor, stern ramps. https://www.macgregor.com/globalassets/picturepark/imported-assets/37186.pdf
- [D12] MacGregor, ramp covers. https://www.macgregor.com/globalassets/picturepark/imported-assets/37183.pdf
- [D13] MacGregor, shell doors. https://www.macgregor.com/globalassets/picturepark/imported-assets/37185.pdf
- [D14] MacGregor, lifts. https://www.macgregor.com/globalassets/picturepark/imported-assets/37179.pdf
- [D15] Chalmers University thesis (a stern ramp of about 60 t).
  https://publications.lib.chalmers.se/records/fulltext/194841/194841.pdf
- [D16] Brattvaag low-pressure hydraulics: https://gumatech.com/stocks/hydraulics/european-makers-hyd-pumps-list/brattvaag/
  and https://www.worldfishing.net/fishing-boats-go-for-64-bar-winches/92434.article
- [D17] IACS unified requirement A3 (windlasses).
  https://turkloydu.org/pdf-files/iacs-karar-ve-csr-degisimleri/iacs-es-gereklilikleri/UR_A3_Rev1_TR_EN.pdf
- [D18] IACS unified requirement A1 (anchoring equipment table).
  https://www.turkloydu.org/pdf-files/iacs-karar-ve-csr-degisimleri/iacs-es-gereklilikleri/UR_A1_Rev6_Corr2_TR_EN.pdf ;
  the edition of 2005, with three anchors: https://www.plaisance-pratique.com/IMG/pdf/Mooringreq.pdf
- [D18b] Mooring lines for one row (summary only; the page has since gone).
  https://ics.org.ir/ICS_Rules/OTHER%20RULES%20AND%20GUIDANCE/RULES%20AND%20GUIDANCES%20FOR%20THE%20CLASSIFICATION%20OF%20STEEL%20BARGES/part97.htm
- [D19] MAIB report, Marine Explorer (davits of a German-built ship of 1965).
  https://assets.publishing.service.gov.uk/media/547c712340f0b60241000105/marine-explorer.pdf
- [D20] MAIB report, Norsea, 1992 (Schat roller-track davits).
  https://assets.publishing.service.gov.uk/media/54c14ee3ed915d1594000013/MAIBReport_Norsea-1992.pdf
- [D21] A present open lifeboat.
  https://hangyumarine.en.made-in-china.com/share/cSqJVhAGhkhW/China-8-5mtr-Used-Open-Lifeboat-with-Engine.html
- [D22] A present lifeboat winch. https://www.jinbomarine.com/print/Electrical-Lifeboat-Winch
- [D23] A present gravity davit. https://www.jinbomarine.com/print/Gravity-Luffing-Arm-Davit
- [D24] IMO MSC.1/Circ.1431 (helicopter deck foam).
  https://denizcilik.uab.gov.tr/uploads/pages/imo-yangindan-korunma-ve-mucadele/msc-1-circ-1431.pdf
- [D25] MacGregor door manual extracts (hand pump).
  https://media.defense.gov/2024/Jan/11/2003374293/-1/-1/1/CG-EX-10-MACGREGOR%20DOOR%20MANUAL%20EXTRACTS.PDF

**Rules, ventilation, colours, automation**

- [R1] ISO 8861:1998, preview of clauses 4 to 6.3.
  https://cdn.standards.iteh.ai/samples/25519/fed6cc2f1e1246d88c4ca596397013ec/ISO-8861-1998.pdf
- [R2] SOLAS II-2, regulation 20 (a mirror of the text). https://www.imorules.com/GUID-4AD654C8-E917-458B-A71B-8F81D09DBE66.html
- [R3] SOLAS 1974 with the 1978 Protocol, II-2 regulation 30, as transcribed in South Africa's regulations.
  https://api.acts.co.za/merchant-shipping-act-1951/chii-2_pb_regulation_30__prote.php
- [R4] IMO MSC.1/Circ.1515.
  https://deutsche-flagge.de/de/redaktion/dokumente/interpretationen/solas/ii-2/msc-1-circ-1515-revised-design-guidelines-and-operational-recommendations-for-ventilation-systems-in-ro-ro-cargo-spaces.pdf
- [R5] IMCO resolution A.123(V), 1967.
  https://www.deutsche-flagge.de/de/redaktion/dokumente/interpretationen/solas/ii-2/res-a-123-v-recommendation-on-fixed-fire-extinguishing-systems-for-special-category-spaces.pdf
- [R6] SOLAS II-2, regulation 10 (mirror). https://www.imorules.com/GUID-04259239-E868-4ABF-8BB9-B2BE5AB52C93.html
- [R8] SOLAS II-1, regulation 35-1 (mirror). https://www.imorules.com/GUID-71A0C980-55E4-4BB0-8C88-859BADC26EC4.html
- [R9] Danish Maritime Authority, Notice D, chapter II-1 C (the bilge main formula).
  https://dma.dk/Media/637743811015405275/DII1C-01102002.pdf
- [R10] Türk Loydu, Rules, Chapter 4 Machinery, 2015, section 2 H (starting air).
  https://www.turkloydu.org/pdf-files/turk-loydu-kurallari/cilt-b/chapter-4-machinery-2015.pdf
- [R11] SOLAS II-1, regulation 29 (mirror). https://www.imorules.com/GUID-CF547534-23B3-4162-8415-6C806370E406.html
- [R12] SOLAS II-1, regulation 42 (mirror). https://www.imorules.com/GUID-C048F800-5412-40B3-ACCD-C562D4E4F719.html
- [R13] SOLAS II-1, regulation 43 (mirror). https://www.imorules.com/GUID-7F31AD5F-EA75-4FB7-AFA1-04BCEFA9462B.html
- [R14] SOLAS II-1, regulation 44 (mirror). https://www.imorules.com/GUID-F495315E-6929-470C-B64C-769D3EC49342.html
- [R15] IMO resolution MSC.98(73), the Fire Safety Systems Code, chapter 5.
  https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.98(73).pdf
- [R17] ISO 14726:2008. https://law.resource.org/pub/us/cfr/ibr/inc/iso/iso.14726.2008.pdf
- [R18] Høivold, "Norwegian research and development in the field of ship automation", Modeling, Identification and
  Control, 1984. https://www.mic-journal.no/PDF/1984/MIC-1984-3-4.pdf
- [R19] IMCO resolution A.211(VII), 1971.
  https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/AssemblyDocuments/A.211(7).pdf
- [R20] IACS unified requirement M35. https://www.turkloydu.org/pdf-files/iacs-karar-ve-csr-degisimleri/iacs-es-gereklilikleri/UR_M35.pdf
- [R21] IACS unified requirement M36.
  https://turkloydu.org/pdf-files/iacs-karar-ve-csr-degisimleri/iacs-es-gereklilikleri/UR_M36_Rev6_TR_EN.pdf
- [R22] MAN L28/32H GenSet instruction manual, 2012.
  https://maredu.hcg.gr/modules/document/file.php/MAK330/MANUALS/L28-32H_GenSet_TierII.pdf
- [R23] MAN (Everllence) L32/40CD GenSet project guide.
  https://www.everllence.com/applications/projectguides/4stroke/Genset/PG_G-II_L3240CD%20NR.pdf
- [R24] Maritime Reporter, January 1971, page 18 (Norcontrol DataSafe).
  https://magazines.marinelink.com/Magazines/MaritimeReporter/197101/page/18
- [R25] Maritime Reporter, March 1971, page 17 (Decca Isis).
  https://magazines.marinelink.com/Magazines/MaritimeReporter/197103/page/17
- [R26] SOLAS II-1, regulation 51 (mirror). https://www.imorules.com/GUID-FF47A6C7-8AED-4A68-B5EE-20D3E6E5449B.html
- [R27] Kongsberg K-Chief 600.
  https://kongsbergmaritime.com/products/engines-engine-room-and-automation-systems/automation-safety-and-control/vessel-automation-k-chief/integrated-marine-automation-system-k-chief-600/
- [R28] Praxis Automation, Mega-Guard. https://www.praxis-automation.nl/products/vessel-management-system/
- [R29] Novenco (Nordisk Ventilator Co.), history. https://www.novenco-building.com/about/history/

The mirror of the convention at imorules.com is not an official site: before anything here is quoted to class, the
regulation is to be read in the convention itself.
