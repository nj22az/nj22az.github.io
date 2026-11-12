# JS8-856 · Cable schedule

Johansson Shipyard · made by `ferry/yard/drawings/electrical_drawing.py` from the component register (`ferry/data/systems.json`) · Chisum · revision 0, 12 November 2026

Every cable the register holds: the feeders to the bridge's five boards, each way on them, and the circuits that come to the bridge direct from boards
elsewhere. The one-line diagram is JS8-851; the boards are JS8-864; that the installation works is proven in `../calc/JS8-851-proof-of-supply.md`.

A breaker is at least 1.25 times the full-load current; a cable is rated for its breaker; no cable loses more than 5 % of the voltage, and no consumer more than 6 % in all from the switchboard (10 % on a battery supply). A cable's length is the way it is laid along, and a tenth more.

**Length** is the cable as laid, with its branches, and a tenth more for bends and making off; a feeder's is its one run. **Drop** is the voltage lost from the
switchboard to the cable's farthest consumer. A cable said to be fire-resistant must go on working in a fire (the register's `FIRE_RESISTANT`).

| Cable | From | To | What it feeds | Volts | Breaker A | Load A | Cable | Length m | Drop % |
|---|---|---|---|---|---|---|---|---|---|
| BD1-F1 | LB | BD1 | Feeder to wheelhouse distribution board | 230 AC | 25 | 16.3 | 2 × 6 mm² + earth | 33.5 | 1.7 |
| BD1-W1 | BD1 | OUT-09, LGT-01, LGT-02, LGT-03, LGT-04, LGT-05 | Wheelhouse lighting | 230 AC | 6 | 0.79 | 2 × 1.5 mm² + earth | 23.2 | 1.9 |
| BD1-W2 | BD1 | LGT-08, LGT-09, LGT-11, LGT-12 | Wing lights and foredeck floodlights | 230 AC | 10 | 1.84 | 2 × 2.5 mm² + earth | 26.3 | 1.9 |
| BD1-W3 | BD1 | NLT-13, NLT-14, NLT-15, PIP-11 | Window wipers and window wash | 230 AC | 6 | 0.94 | 2 × 1.5 mm² + earth | 19.0 | 1.9 |
| BD1-W4 | BD1 | ELD-11, ELD-13 | Console sockets | 230 AC | 10 | 1.45 | 2 × 2.5 mm² + earth | 14.4 | 1.9 |
| BD1-W5 | BD1 | HVC-01, HVC-02 | Air conditioner | 230 AC | 16 | 4.83 | 2 × 4 mm² + earth | 8.5 | 1.9 |
| BD1-W6 | BD1 | NAV-05, ALM-05, ALM-07 | Chart system and cameras | 230 AC | 6 | 0.97 | 2 × 1.5 mm² + earth | 20.5 | 1.9 |
| BD1-W7 | BD1 | OUT-39, OUT-40 | Pantry: cooler and coffee maker | 230 AC | 10 | 4.69 | 2 × 2.5 mm² + earth | 14.9 | 2.2 |
| BD1-W8 | BD1 | LGT-10, ELD-12 | Dimmers and console heaters | 230 AC | 6 | 0.77 | 2 × 1.5 mm² + earth | 13.9 | 1.9 |
| BD2-F1 | ESB | BD2 | Feeder to wheelhouse emergency distribution board | 230 AC | 16 | 2.8 | 2 × 4 mm² + earth, fire-resistant | 24.5 | 0.3 |
| BD2-W1 | BD2 | NAV-01, NAV-02, NAV-30 | Radar | 230 AC | 6 | 1.45 | 2 × 2.5 mm² + earth | 21.4 | 0.5 |
| BD2-W2 | BD2 | INT-01 | Public address and general alarm | 230 AC | 6 | 1.16 | 2 × 1.5 mm² + earth, fire-resistant | 11.9 | 0.5 |
| BD2-W4 | BD2 | LGT-07 | Emergency lighting, wheelhouse | 230 AC | 2 | 0.07 | 2 × 1.5 mm² + earth, fire-resistant | 5.7 | 0.3 |
| BD2-W6 | BD2 | NLT-10, PIP-10 | Whistle control | 230 AC | 2 | 0.14 | 2 × 1.5 mm² + earth | 13.9 | 0.4 |
| BD2-W7 | BD2 | PRP-07 | Propulsion control, second supply | 230 AC | 2 | 0.0 | 2 × 1.5 mm² + earth, fire-resistant | 9.6 | 0.4 |
| DC1-F1 | DCB | DC1 | Feeder to 24 v dc panel, navigation and control | 24 DC | 40 | 25.8 | 2 × 35 mm² + earth, fire-resistant | 24.5 | 3.3 |
| DC1-W1 | DC1 | NAV-06 | GPS navigator | 24 DC | 2 | 0.42 | 2 × 1.5 mm² + earth | 11.2 | 3.9 |
| DC1-W2 | DC1 | NAV-04 | AIS transponder | 24 DC | 6 | 2.5 | 2 × 2.5 mm² + earth | 14.6 | 6.1 |
| DC1-W3 | DC1 | NAV-11 | Satellite compass | 24 DC | 2 | 0.83 | 2 × 1.5 mm² + earth | 10.8 | 4.5 |
| DC1-W4 | DC1 | NAV-07 | Echo sounder | 24 DC | 4 | 1.67 | 2 × 1.5 mm² + earth | 13.4 | 6.1 |
| DC1-W5 | DC1 | NAV-08 | Speed log | 24 DC | 2 | 0.83 | 2 × 1.5 mm² + earth | 9.6 | 4.4 |
| DC1-W6 | DC1 | NAV-09, NAV-10, NAV-14 | Navigation data: distributor, network switch, conning display | 24 DC | 6 | 3.54 | 2 × 2.5 mm² + earth | 12.5 | 6.2 |
| DC1-W7 | DC1 | NAV-12 | Autopilot | 24 DC | 2 | 1.25 | 2 × 1.5 mm² + earth | 12.6 | 5.3 |
| DC1-W8 | DC1 | PRP-06, PRP-07 | Propulsion remote control | 24 DC | 10 | 4.17 | 2 × 4 mm² + earth | 10.6 | 5.2 |
| DC1-W9 | DC1 | PRP-03 | Bow thruster control | 24 DC | 2 | 1.25 | 2 × 1.5 mm² + earth | 10.7 | 5.0 |
| DC1-W10 | DC1 | INT-02 | Talkback | 24 DC | 2 | 1.25 | 2 × 1.5 mm² + earth | 12.4 | 5.2 |
| DC1-W11 | DC1 | ALM-01, ALM-02, ALM-06 | Alarm panel, watch alarm, door and ramp panel | 24 DC | 4 | 2.5 | 2 × 1.5 mm² + earth | 18.1 | 7.9 |
| DC1-W12 | DC1 | NAV-16, NAV-17, STR-04, STR-05, STR-06 | Heading and bearing repeaters, rudder angle indicators | 24 DC | 4 | 1.88 | 2 × 2.5 mm² + earth | 35.4 | 5.9 |
| DC1-W13 | DC1 | NAV-13 | Wind sensor and display | 24 DC | 2 | 0.21 | 2 × 1.5 mm² + earth | 8.1 | 3.5 |
| DC1-W14 | DC1 | INT-01 | Public address and general alarm, battery supply | 24 DC | 16 | 0.0 | 2 × 6 mm² + earth, fire-resistant | 12.0 | 7.2 |
| DC1-W15 | DC1 | NAV-34, LGT-06, LGT-13, LGT-14 | Night and transitional lighting, binnacle light | 24 DC | 2 | 1.04 | 2 × 1.5 mm² + earth, fire-resistant | 16.0 | 4.5 |
| DC1-W16 | DC1 | NLT-21 | Signalling lamp socket | 24 DC | 4 | 2.5 | 2 × 1.5 mm² + earth | 11.8 | 7.0 |
| DC2-F1 | DCB-R | DC2 | Feeder to 24 v dc panel, radio | 24 DC | 25 | 14.2 | 2 × 25 mm² + earth, fire-resistant | 25.0 | 2.6 |
| DC2-W1 | DC2 | COM-01 | VHF No. 1 | 24 DC | 10 | 6.25 | 2 × 4 mm² + earth | 14.6 | 6.9 |
| DC2-W2 | DC2 | COM-02 | VHF No. 2 | 24 DC | 10 | 6.25 | 2 × 4 mm² + earth | 14.1 | 6.8 |
| DC2-W3 | DC2 | COM-05 | NAVTEX receiver | 24 DC | 2 | 0.42 | 2 × 1.5 mm² + earth | 12.7 | 3.3 |
| DC2-W4 | DC2 | NAV-06 | GPS navigator, second supply | 24 DC | 2 | 0.0 | 2 × 1.5 mm² + earth | 11.6 | 3.2 |
| DC2-W5 | DC2 | COM-06 | Portable VHF charger | 24 DC | 2 | 1.25 | 2 × 1.5 mm² + earth | 8.0 | 3.8 |
| NLP-F1 | TSB | NLP | Feeder to navigation light panel | 230 AC | 10 | 2.6 | 2 × 2.5 mm² + earth, fire-resistant | 29.5 | 0.6 |
| NLP-F2 | LB | NLP | Second feeder to navigation light panel | 230 AC | 10 | 2.6 | 2 × 4 mm² + earth, fire-resistant | 44.0 | 0.6 |
| NLP-W1 | NLP | NLT-04 | Masthead light | 230 AC | 2 | 0.26 | 2 × 1.5 mm² + earth, fire-resistant | 14.9 | 0.6 |
| NLP-W2 | NLP | NLT-02 | Port sidelight | 230 AC | 2 | 0.26 | 2 × 1.5 mm² + earth, fire-resistant | 12.9 | 0.6 |
| NLP-W3 | NLP | NLT-03 | Starboard sidelight | 230 AC | 2 | 0.26 | 2 × 1.5 mm² + earth, fire-resistant | 7.2 | 0.6 |
| NLP-W4 | NLP | NLT-06 | Stern light | 230 AC | 2 | 0.26 | 2 × 1.5 mm² + earth, fire-resistant | 12.6 | 0.8 |
| NLP-W5 | NLP | NLT-05 | Anchor light | 230 AC | 2 | 0.26 | 2 × 1.5 mm² + earth, fire-resistant | 16.6 | 0.6 |
| NLP-W6 | NLP | NLT-07 | Not under command, upper pair | 230 AC | 2 | 0.52 | 2 × 1.5 mm² + earth, fire-resistant | 15.4 | 0.7 |
| NLP-W7 | NLP | NLT-08 | Not under command, lower pair | 230 AC | 2 | 0.52 | 2 × 1.5 mm² + earth, fire-resistant | 13.2 | 0.7 |
| SG1-D1 | SG1 | STR-02 | Steering control system No. 1 | 230 AC | 2 | 0.22 | 2 × 1.5 mm² + earth, fire-resistant | 10.9 | 0.2 |
| SG2-D2 | SG2 | STR-07 | Steering control system No. 2 | 230 AC | 2 | 0.22 | 2 × 1.5 mm² + earth, fire-resistant | 10.9 | 0.2 |
| ESB-D3 | ESB | FIR-01 | Fire detection panel, emergency feeder | 230 AC | 2 | 0.26 | 2 × 1.5 mm² + earth, fire-resistant | 7.1 | 0.1 |
| LB-D4 | LB | FIR-01 | Fire detection panel, main feeder | 230 AC | 2 | 0.0 | 2 × 1.5 mm² + earth, fire-resistant | 3.6 | 0.1 |
| LB-D5 | LB | LGT-25, LGT-26 | Bridge deck lighting, corridor and after platform | 230 AC | 6 | 0.31 | 2 × 1.5 mm² + earth | 46.4 | 0.2 |
| ESB-D6 | ESB | LGT-27, LGT-28 | Emergency lighting, bridge deck | 230 AC | 6 | 0.31 | 2 × 1.5 mm² + earth | 53.3 | 0.2 |
| ESB-D7 | ESB | EMG-03 | Emergency generator: starting battery charger | 230 AC | 10 | 2.61 | 2 × 2.5 mm² + earth | 22.0 | 0.8 |
| LB-D8 | LB | NLT-16 | Searchlight | 230 AC | 16 | 4.35 | 2 × 4 mm² + earth | 8.0 | 0.8 |

## Cable to buy, by type

| Cable | Metres | Drums of 100 m |
|---|---|---|
| 2 × 1.5 mm² + earth | 341 | 4 |
| 2 × 2.5 mm² + earth | 162 | 2 |
| 2 × 4 mm² + earth | 56 | 1 |
| 2 × 6 mm² + earth | 34 | 1 |
| 2 × 1.5 mm² + earth, fire-resistant | 168 | 2 |
| 2 × 2.5 mm² + earth, fire-resistant | 30 | 1 |
| 2 × 4 mm² + earth, fire-resistant | 68 | 1 |
| 2 × 6 mm² + earth, fire-resistant | 12 | 1 |
| 2 × 25 mm² + earth, fire-resistant | 25 | 1 |
| 2 × 35 mm² + earth, fire-resistant | 24 | 1 |

55 cables, 920 m in all. Nothing here says how the cables are carried: the ways they are laid along (trays, trunks, ducts) are the register's
`NODES` and `EDGES` (`ferry/systems/bridge.py`), which the page's X-ray draws.
