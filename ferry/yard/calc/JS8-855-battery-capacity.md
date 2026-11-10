# JS8-855 · Battery capacity

Johansson Shipyard, newbuilding No. 1, Chisum. Calculated by `ferry/yard/calc/bridge_calcs.py` from the register (`ferry/systems/bridge.py`, `ship.py`). Revision 1, 11 November 2026.

Both banks are 24 V lead-acid, in the emergency generator room. A bank is taken at 80 % of its rated capacity at the end of its life and is not discharged below 20 %: **0.64 of the rated ampere-hours are counted.** Powers are the register's; a set's receiving current is a typical figure until the maker's is in hand.

## 1. The radio battery: reserve source of energy (bank BAT-R, panel DC2)

**Requirement.** SOLAS chapter IV, regulation 13, as amended by resolution MSC.496(105) (read for PA-001 revision 1): the reserve source runs the VHF installation, and the loads the regulation adds to it, for one hour where the emergency source of electrical power complies fully with regulation II-1/42, and for six hours where it does not (13.2); the charger brings the bank back to the capacity required within 10 hours (13.6.1). The load is worked out as half the current drawn when transmitting, plus the current drawn when receiving, plus the current of the other loads (the method of COMSAR/Circ.16, as given in the United Kingdom's MGN 641, annex F).

| Load | Transmitting A | Receiving A | Counted A |
|---|---|---|---|
| VHF radiotelephone No. 1, with DSC (COM-01) | 6.25 | 0.50 | 3.62 |
| VHF radiotelephone No. 2 (COM-02) | 6.25 | 0.50 | 3.62 |
| NAVTEX receiver (COM-05) | | | 0.42 |
| Portable VHF sets and charger (COM-06) | | | 1.25 |
| GPS navigator (NAV-06), its second supply: the position for the distress call | | | 0.42 |
| **Total** | | | **9.33** |

- For one hour: 9.3 Ah, a bank of 15 Ah rated. For six hours: 56 Ah, a bank of 87 Ah rated.
- **Fitted: 24 V, 100 Ah.** It meets the six-hour case, so the radio does not depend on the emergency generator being accepted. Both VHF sets are counted, though the rule asks one.
- Charger: the six-hour capacity back in 10 hours with the sets on watch: 56 / 10 + 3.1 = 8.7 A. **Fitted: 24 V, 10 A**, automatic, with a charging-failure alarm at the radio position.

## 2. The general service battery: transitional source of emergency power (bank BAT-G; panel DC1 and the transitional section)

**Requirement.** SOLAS chapter II-1, regulation 42 (passenger ships), read for PA-001 revision 1: the emergency generator starts by itself and is on the board within 45 s (42.3.1.2); the transitional source is an accumulator battery that takes over by itself and carries for half an hour the emergency lighting and the navigation lights, the internal communication, the fire detection and alarm and the internal signals (42.4.1). The fire detection panel has its own battery for this half hour and is not counted here.

| Load on the bank in the rule's half hour | W | A at 24 V | Ah in 0.5 h |
|---|---|---|---|
| Everything on panel DC1: navigation sensors, autopilot, propulsion control, alarms, night and transitional lighting | 620 | 25.8 | 12.9 |
| Public address and general alarm amplifier at full output, on its battery supply (DC1 way 14) | 240 | 10.0 | 5.0 |
| Navigation light panel, every lantern lit, through the inverter (efficiency 0.85) | 540 | 26.5 | 13.2 |
| **Total, the bridge** | | **62.3** | **31.2** |

- The bridge takes 31 Ah in the half hour: a bank of 49 Ah rated would carry it.
- **Fitted: 24 V, 200 Ah**, of which 128 Ah are counted. **97 Ah remain for the transitional services of the other sections** (the emergency lighting of the passenger spaces, stairs, machinery spaces and embarkation stations; the watertight doors' indication): up to 4.6 kW for the half hour. This calculation is closed only when every section is in the register.
- If the emergency generator never starts, panel DC1 and the lanterns she shows under way (240 W) draw 37.6 A: the bank carries navigation and control for 3.4 hours.
- Inverter: the navigation light panel's 540 W connected. **Fitted: 1 kVA, 24 V DC to 105 V**, in the emergency generator room, feeding the transitional section of the emergency switchboard.
- Charger: a tenth of the bank an hour and panel DC1's load: 20 + 25.8 = 45.8 A. **Fitted: 24 V, 50 A**, automatic, with a charging-failure alarm on the bridge alarm panel.
- Neither steering control system is on this bank: each is fed from its own power unit's circuit (PA-001 comment 3).
