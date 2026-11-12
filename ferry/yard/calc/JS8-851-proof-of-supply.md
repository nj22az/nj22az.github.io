# JS8-851 · Proof of supply: the installation, switched

Johansson Shipyard · calculation · made by `ferry/systems/prove.py` from the component register (`ferry/data/systems.json`) · Chisum

The owner, 11 November 2026: "it needs to be a functional electrical installation". This sheet switches the installation as
registered: every source on and off, every breaker opened once, and says what is alive each time. It is made again whenever
the register changes, and the tool stops with an error if a consumer has no supply or a required service dies.

**Scope.** 94 consumers with a supply, on 6 boards of the bridge and 8 circuits direct from boards
elsewhere; 9 boards elsewhere; 7 sources. The register holds the navigation bridge and what feeds it:
her machinery, lighting and galley are not registered yet, so nothing is proven of them.

## 1. Every consumer has a protected way back to a source

With every source on, **94 of 94 consumers are alive**. None is without a supply.

Each way is protected by its own breaker and each board by its feeder's (the sizes are in the cable schedule, JS8-856:
a breaker is at least 1.25 times the load, a cable is rated for its breaker, no cable loses more than
5.0 % of the voltage). How each board is reached:

| Board | Fed from | Then from |
|---|---|---|
| **BD1** Wheelhouse distribution board | LB | LB ← PSB ← (MSB ← (G1 or G2 or G3) or SHORE) |
| **BD2** Wheelhouse emergency distribution board | ESB | ESB ← PSB ← (MSB ← (G1 or G2 or G3) or SHORE) or EG |
| **DC1** 24 V DC panel, navigation and control | DCB | DCB ← BAT-G |
| **DC2** 24 V DC panel, radio | DCB-R | DCB-R ← BAT-R |
| **NLP** Navigation light panel | TSB and LB | TSB ← ESB ← (PSB ← (MSB ← (G1 or G2 or G3) or SHORE) or EG) or BAT-G; LB ← PSB ← (MSB ← (G1 or G2 or G3) or SHORE) |
| **RSP** Stern ramp starter panel | PSB | PSB ← MSB ← (G1 or G2 or G3) or SHORE |

## 2. What each breaker takes with it

At sea with the generators running, the emergency generator standing by and both batteries on, each breaker is opened
once. A consumer with a second supply stays alive on it. **A breaker takes only what hangs on it:** if opening one killed
something on another way, the tool would say so.

| Breaker | A | Goes dead | Stays alive on its second supply |
|---|---|---|---|
| BD1: its feeder | 25 | OUT-09, NAV-05, ALM-05, ALM-07, NLT-13, NLT-14, NLT-15, NLT-17, NLT-18, NLT-19, LGT-01, LGT-02, LGT-03, LGT-04, LGT-15, LGT-16, LGT-17, LGT-18, LGT-05, LGT-08, LGT-09, LGT-10, LGT-11, LGT-12, ELD-11, ELD-13, ELD-12, OUT-39, OUT-40, HVC-01, HVC-02, PIP-11 |  |
| BD1 way 1 · Wheelhouse lighting | 6 | OUT-09, LGT-01, LGT-02, LGT-03, LGT-04, LGT-15, LGT-16, LGT-17, LGT-18, LGT-05 |  |
| BD1 way 2 · Wing lights and foredeck floodlights | 10 | LGT-08, LGT-09, LGT-11, LGT-12 |  |
| BD1 way 3 · Window wipers and window wash | 6 | NLT-13, NLT-14, NLT-15, NLT-17, NLT-18, PIP-11 |  |
| BD1 way 4 · Console sockets | 10 | ELD-11, ELD-13 |  |
| BD1 way 5 · Air conditioner | 16 | HVC-01, HVC-02 |  |
| BD1 way 6 · Chart system and cameras | 6 | NAV-05, ALM-05, ALM-07 |  |
| BD1 way 7 · Pantry: cooler and coffee maker | 10 | OUT-39, OUT-40 |  |
| BD1 way 8 · Dimmers and console heaters | 6 | NLT-19, LGT-10, ELD-12 |  |
| BD2: its feeder | 16 | NAV-01, NAV-02, NAV-30, NLT-10, LGT-07, PIP-10 | INT-01 |
| BD2 way 1 · Radar | 6 | NAV-01, NAV-02, NAV-30 |  |
| BD2 way 2 · Public address and general alarm | 6 | nothing | INT-01 |
| BD2 way 4 · Emergency lighting, wheelhouse | 2 | LGT-07 |  |
| BD2 way 6 · Whistle control | 2 | NLT-10, PIP-10 |  |
| BD2 way 7 · Propulsion control, second supply | 2 | nothing |  |
| DC1: its feeder | 40 | NAV-04, NAV-07, NAV-08, NAV-09, NAV-10, NAV-11, NAV-12, NAV-13, NAV-18, NAV-14, NAV-16, NAV-17, NAV-34, STR-04, STR-05, STR-06, PRP-03, PRP-06, INT-02, ALM-01, ALM-02, ALM-06, NLT-21, LGT-06, LGT-13, LGT-14 | NAV-06, PRP-07 |
| DC1 way 1 · GPS navigator | 2 | nothing | NAV-06 |
| DC1 way 2 · AIS transponder | 6 | NAV-04 |  |
| DC1 way 3 · Satellite compass | 2 | NAV-11 |  |
| DC1 way 4 · Echo sounder | 4 | NAV-07 |  |
| DC1 way 5 · Speed log | 2 | NAV-08 |  |
| DC1 way 6 · Navigation data: distributor, network switch, conning display | 6 | NAV-09, NAV-10, NAV-14 |  |
| DC1 way 7 · Autopilot | 2 | NAV-12 |  |
| DC1 way 8 · Propulsion remote control | 10 | PRP-06 | PRP-07 |
| DC1 way 9 · Bow thruster control | 2 | PRP-03 |  |
| DC1 way 10 · Talkback | 2 | INT-02 |  |
| DC1 way 11 · Alarm panel, watch alarm, door and ramp panel | 4 | ALM-01, ALM-02, ALM-06 |  |
| DC1 way 12 · Heading and bearing repeaters, rudder angle indicators | 4 | NAV-18, NAV-16, NAV-17, STR-04, STR-05, STR-06 |  |
| DC1 way 13 · Wind sensor and display | 2 | NAV-13 |  |
| DC1 way 14 · Public address and general alarm, battery supply | 16 | nothing |  |
| DC1 way 15 · Night and transitional lighting, binnacle light | 2 | NAV-34, LGT-06, LGT-13, LGT-14 |  |
| DC1 way 16 · Signalling lamp socket | 4 | NLT-21 |  |
| DC2: its feeder | 25 | COM-01, COM-02, COM-05, COM-06 |  |
| DC2 way 1 · VHF No. 1 | 10 | COM-01 |  |
| DC2 way 2 · VHF No. 2 | 10 | COM-02 |  |
| DC2 way 3 · NAVTEX receiver | 2 | COM-05 |  |
| DC2 way 4 · GPS navigator, second supply | 2 | nothing |  |
| DC2 way 5 · Portable VHF charger | 2 | COM-06 |  |
| NLP: its feeder | 10 | nothing |  |
| NLP: its second feeder | 10 | nothing |  |
| NLP way 1 · Masthead light | 2 | NLT-04 |  |
| NLP way 2 · Port sidelight | 2 | NLT-02 |  |
| NLP way 3 · Starboard sidelight | 2 | NLT-03 |  |
| NLP way 4 · Stern light | 2 | NLT-06 |  |
| NLP way 5 · Anchor light | 2 | NLT-05 |  |
| NLP way 6 · Not under command, upper pair | 2 | NLT-07 |  |
| NLP way 7 · Not under command, lower pair | 2 | NLT-08 |  |
| RSP: its feeder | 160 | RMP-30, RMP-31, HYD-02, HYD-03, HYD-04, HYD-05, HYD-10 |  |
| RSP way 1 · Main pump No. 1, 37 kW, star-delta | 80 | HYD-02 |  |
| RSP way 2 · Main pump No. 2, 37 kW, star-delta | 80 | HYD-03 |  |
| RSP way 3 · Cleat pump, 4 kW | 10 | HYD-04 |  |
| RSP way 4 · Oil cooler fan, 1.1 kW | 4 | HYD-05 |  |
| RSP way 5 · Control transformer 440/24 V, 630 VA: stand, valves, switches | 2 | RMP-30, RMP-31, HYD-10 |  |
| SG1 · Steering control system No. 1 | 2 | STR-02 |  |
| SG2 · Steering control system No. 2 | 2 | STR-07 |  |
| ESB · Fire detection panel, emergency feeder | 2 | nothing | FIR-01 |
| LB · Fire detection panel, main feeder | 2 | nothing |  |
| LB · Bridge deck lighting, corridor and after platform | 6 | LGT-25, LGT-26 |  |
| ESB · Emergency lighting, bridge deck | 6 | LGT-27, LGT-28 |  |
| ESB · Emergency generator: starting battery charger | 10 | EMG-03 |  |
| LB · Searchlight | 16 | NLT-16 |  |

61 breakers opened, one at a time. Each took its own way and nothing else.

## 3. Losing a source

| Condition | Sources on | Boards alive | Consumers alive | What is dark |
|---|---|---|---|---|
| At sea, normal | BAT-G, BAT-R, G1, G2, G3 | BD1, BD2, DC1, DC2, NLP, RSP, MSB, PSB, LB, ESB, TSB, DCB, DCB-R, SG1, SG2 | 94 of 94 | nothing |
| Alongside, on the shore connection | BAT-G, BAT-R, SHORE | BD1, BD2, DC1, DC2, NLP, RSP, PSB, LB, ESB, TSB, DCB, DCB-R, SG1, SG2 | 94 of 94 | nothing |
| Blackout, the first 45 seconds (before the emergency generator is on the board) | BAT-G, BAT-R | DC1, DC2, NLP, TSB, DCB, DCB-R | 40 of 94 | all or part of: Alarm and monitoring, Electrical distribution, Emergency power, Fire detection and fire-fighting, Air conditioning, Cargo access hydraulics, Lighting, Navigation, Navigation lights and signals, Outfit, Piping, Stern ramp and door, Steering |
| Blackout, the emergency generator running | BAT-G, BAT-R, EG | BD2, DC1, DC2, NLP, ESB, TSB, DCB, DCB-R, SG2 | 51 of 94 | all or part of: Alarm and monitoring, Electrical distribution, Air conditioning, Cargo access hydraulics, Lighting, Navigation, Navigation lights and signals, Outfit, Piping, Stern ramp and door, Steering |
| Blackout, and the general service battery lost | BAT-R, EG | BD2, DC2, NLP, ESB, TSB, DCB-R, SG2 | 25 of 94 | all or part of: Alarm and monitoring, Electrical distribution, Air conditioning, Cargo access hydraulics, Internal communication, Lighting, Navigation, Navigation lights and signals, Outfit, Piping, Propulsion control, Stern ramp and door, Steering |
| Blackout, and the radio battery lost | BAT-G, EG | BD2, DC1, NLP, ESB, TSB, DCB, SG2 | 47 of 94 | all or part of: Alarm and monitoring, Radio, Electrical distribution, Air conditioning, Cargo access hydraulics, Lighting, Navigation, Navigation lights and signals, Outfit, Piping, Stern ramp and door, Steering |
| Everything lost but the radio battery | BAT-R | DC2, DCB-R | 5 of 94 | all or part of: Alarm and monitoring, Electrical distribution, Emergency power, Fire detection and fire-fighting, Air conditioning, Cargo access hydraulics, Internal communication, Lighting, Navigation, Navigation lights and signals, Outfit, Piping, Propulsion control, Stern ramp and door, Steering |

## 4. What must not go dark

The services a ship must keep through a blackout, as the yard recalls the rule (SOLAS chapter II-1, regulation 42 for
passenger ships: an emergency source, and a transitional source that carries the essentials while the generator starts;
chapter IV for the radio's reserve source). **Recalled, not read for this sheet.** Each is looked for among what stays
alive in the first 45 seconds on the batteries alone:

| Service | Components | Must be alive | Alive then | Verdict |
|---|---|---|---|---|
| Navigation lights (the lanterns on the navigation light panel) | NLT-02, NLT-03, NLT-04, NLT-05, NLT-06, NLT-07, NLT-08 | on the batteries alone, at once | NLT-02, NLT-03, NLT-04, NLT-05, NLT-06, NLT-07, NLT-08 | kept |
| Radio (VHF with DSC, NAVTEX) | COM-01, COM-02, COM-05, COM-06 | on the batteries alone, at once | COM-01, COM-02, COM-05, COM-06 | kept |
| General alarm and public address | INT-01, INT-02 | on the batteries alone, at once | INT-01, INT-02 | kept |
| Fire detection panel | FIR-01 | on the batteries alone, at once | FIR-01 | kept (on its own battery, as the register says of it) |
| Position and heading (GPS, compass) | NAV-06, NAV-11, NAV-34 | on the batteries alone, at once | NAV-06, NAV-11, NAV-34 | kept |
| Steering control (one of the two systems) | STR-02, STR-07 | once the emergency generator is on the board (45 s) | STR-07 | kept in part |
| Radar | NAV-01, NAV-02, NAV-30 | once the emergency generator is on the board (45 s) | NAV-01, NAV-02, NAV-30 | kept |

Steering control may wait for the emergency generator because the steering gear itself does: its power units are on the
main and the emergency switchboard, and a gear is given 45 seconds to have its second supply. "Kept in part" there means one
of the two control systems, which is what a blackout leaves of the gear too. The lanterns that are not on the navigation light
panel (wipers and window wash are registered in the same subsystem) are not counted as navigation lights.

## 5. Limits

- The proof is of the register, not of a ship: a cable that is registered and not yet drawn in the model is proven all the same.
- Change-overs are taken to work (the bus-tie, the inverter, the panel's switch): none is modelled as a part that can fail.
- Nothing is said of fault currents or of whether a small breaker opens before a large one on a short circuit (JS8-853, to do).
- The rule in section 4 is recalled. When its text has been read, the list of what must survive is to be made from it.
- That a thing has a battery of its own is read from the words the register says of it (the fire detection panel). It should be a field of the register, with the battery's size, and then be proven like the others.
