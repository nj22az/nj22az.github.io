# Plan approval comment sheet PA-001: navigation bridge

| | |
|---|---|
| Ship | Chisum, Johansson Shipyard newbuilding No. 1 |
| Submitted | The navigation bridge: layout and equipment (JS4-401, JS4-403), navigation lights (JS4-404, JS8-858), the bridge's electrical distribution (JS8-851, -852, -856), internal communication (JS8-859), radio (JS8-860), steering and propulsion control (JS4-408, JS8-861), fire detection (JS8-804), as registered in `ferry/systems/bridge.py` at the branch's `9da49be` and built in the model |
| Reviewed | 11 November 2026, by the surveyor (the Minato Register of Shipping is a society of Johansson World: `ferry/yard/README.md`) |
| Result | **Not approved: 5 comments of category A are open.** 8 of category B, 3 notes. 9 items examined without comment |

**How to read it.** A: to be resolved before the section is approved. B: to be resolved before the survey of the built section.
N: a note. *Basis* names the requirement; **every basis here is recalled from memory of the conventions and of class practice
and has not been read against a text**. That is itself comment 1. The yard answers in the last column, by changing the design
or by showing why it stands.

## Comments

| No. | Cat. | On | Comment | Basis (recalled) | Yard's answer |
|---|---|---|---|---|---|
| 1 | A | The submission as a whole | **The rules she is designed to are not stated.** A passenger ship on international voyages falls under SOLAS; a ferry between Minato and Kitano-jima is a domestic ship under her flag's rules for coastal passenger vessels, which differ (radio, lights' supplies, emergency power). Nothing below can be closed until this is fixed and the texts are read. This review takes the conventions as a benchmark | The contract specification names the rules (JS1-101, not written) | open |
| 2 | A | NLP, its supplies BD2 way 5 and BD1 way 9 | The navigation light panel takes both its supplies from distribution boards that serve other consumers: a fault on BD2 or on BD1 takes a supply of the lights with it. Each supply is to come **direct from a switchboard**: one from the emergency switchboard, one from the main (lighting) board, with the change-over at the panel as drawn | Class rules for navigation light distribution; SOLAS II-1 on emergency services | open |
| 3 | A | STR-02, net STEER, DC1 way 7 | **One steering control unit on one way of one board.** With two hydraulic power units (hull section, steering-gear room) the gear has two power circuits; the control from the bridge is to be in two independent systems, each supplied from its own power unit's circuit, their cables led apart. As registered, one fuse, or the loss of DC1, leaves the bridge with no steering but the tiller, and the tiller's own supply is not shown | SOLAS II-1/29 (steering gear control systems), II-1/30 (electrical supply) | open |
| 4 | A | INT-01 on BD2 way 2; LGT-07; FIR-01 | **No transitional source.** The emergency switchboard is dead for up to 45 s while the emergency generator starts. On a passenger ship the public address and general alarm, the emergency lighting and the fire detection are to stay alive through that gap for half an hour from a battery. The amplifier and the wheelhouse emergency light have the emergency board only | SOLAS II-1/42 (transitional source of emergency power, passenger ships) | open |
| 5 | B | DC2, BAT-R; COM-01, COM-02 | **The radio battery is not sized** (`ship.py` says so). Submit the capacity calculation: the distress set transmitting half the time and receiving the other half, the second set, the lighting at the radio position, for one hour (six without an emergency generator that meets the rules); and the charger's capacity to recharge in ten hours, with a charging-failure alarm on the bridge | SOLAS IV/13 (sources of energy); the calculation method of the radio rules | open |
| 6 | B | FIR-01, BD2 way 3 | The fire detection panel shows one supply and "a standby battery of its own". Show two supplies with automatic change-over and a fault alarm for each, one of them an emergency source, and the battery's endurance | FSS Code chapter 9 | open |
| 7 | B | Feeders of BD1 (from LB) and BD2 (from the emergency switchboard); node COR, tray AFT | **The main and the emergency feeder lie in the same tray** from the corridor's deckhead to the boards, 2 m and more side by side: one fire in that tray takes both. Lead them apart, and state the cable type of every emergency service (fire-resistant where it must work in a fire: public address and general alarm, fire detection, emergency lighting). The register gives a cable's size and length, not its type | Class rules on the separation of main and emergency circuits and on fire-resistant cables | open |
| 8 | A | PRP-07, net PROP-CAN, DC1 way 8 | The propulsion control unit has **one supply** (the register's own note says a second "is to come"), and its two CAN lines, described as going "by different ways", are routed by the register along the same way. Loss of DC1 way 8 loses the control of both engines from the bridge at once. Give it two supplies from different sources with an alarm on the loss of either, route the two lines apart, and state what the engines do when the control is lost (hold their speed; alarm; local control at the engines) | SOLAS II-1/31 (machinery controls); class rules on remote control of propulsion | open |
| 9 | B | JS4-402, `view_from_helm` | The arc of glass is measured (224° of 225°, mullions under 6° ignored). Not shown: **the view of the sea over the bow** from the conning position (not hidden beyond two ship's lengths, 69 m, ahead and 10° either side, with the bow ramp stowed upright); that no mullion stands straight ahead of a workstation (none does at the wheel; show it for both chairs); the height of the lower and upper edges of the forward glass for an eye at 1.5 m and at 1.8 m; the ship's side seen from each wing | SOLAS V/22 (navigation bridge visibility). It applies by length to larger ships: a benchmark here until comment 1 is closed | open |
| 10 | B | NLT-02 to NLT-08, JS4-404 | Positions are drawn; **the arcs are not demonstrated.** Submit a sheet showing each lantern's sector and its screening: the sidelights' inboard screens (their length and that no light shows across the bow), the masthead light's sector clear of the radar platform and the horns, the all-round lights' sectors hidden by the mast (not more than 6°) | COLREG Annex I, sections 2, 3, 5 and 9 | open |
| 11 | B | NAV-34, NAV-15; NLT-16, INT-11, NAV-30 | **Compass safe distances.** The searchlight stands 1.6 m from the standard compass, the loudhailer and the radar's turning unit within 2 m, the steel mast 1.4 m aft. List every electrical and steel fitting within 3 m of the compass and of its periscope with its marked safe distance, and provide for adjustment and a deviation card at the sea trial (JS4-406) | The safe distance marked on each instrument; the rules for magnetic compasses | open |
| 12 | B | COM-11, COM-12, NAV-31; NAV-30; JS4-405 | **Antenna arrangement.** The two VHF whips stand 2.4 m apart and the AIS whip between them at the same height: state the separations the makers require. The radar's beam passes over the compass deck at about 2.3 m: mark the deck as a radiation hazard area with the distance, or raise the scanner | Makers' installation requirements; class practice | open |
| 13 | B | JS8-853, -854, -855, -856 | Not submitted, and required before the electrical installation is approved: the short-circuit calculation and the breakers' selectivity (a fault on a way must open that way's breaker, not its board's feeder: BD2's feeder breaker is 16 A over ways of 10 A); the emergency generator's load list with BD2's 1.1 kW; both batteries' capacities | Class rules for electrical installations | open |
| 14 | N | LB, way "searchlight" | Noted and agreed: the yard's own check found the other ship's 10 A breaker under the 1.25 rule and gave hers 16 A | The yard's sizing rule | closed by the yard |
| 15 | N | OUT-18, OUT-19 | The two wing doors open outward across wings 1.1 m wide; open at 100° a leaf leaves about 0.4 m to pass. Consider a hold-back at 90° against the house side, or a sliding door | Escape and working clearances: to be read when comment 1 is closed | open |
| 16 | N | The aft wall; the crew stair | The opening to the crew stair under the aft wall is 1.50 m high (survey finding BF-12) and is still the other ship's. It is an escape route from the wheelhouse; its clear height is to be raised when the accommodation is drawn | Means of escape | open, with the accommodation |

## Examined without comment

- The masthead light is forward of amidships (20.8 m of 34.5 m) and about 12 m above the hull, more than her beam of 8.4 m; the
  sidelights, on the wing rails, are below three quarters of that height; the two not-under-command lights are 2.0 m apart in a
  vertical line and the lower is more than 4 m above the hull (COLREG Annex I, recalled).
- The forward windows are inclined 10°, top outward (10° to 25° is the benchmark).
- The magnetic compass is read from the helm through a periscope directly under the binnacle, and needs no power.
- Every way's breaker is at least 1.25 times its current and every cable is rated for its breaker; no cable loses more than
  5 % and no consumer more than the limit in all (`register.py`; the worst is 8.8 % of 24 V).
- The two VHF sets, the NAVTEX receiver and the position fix for the distress call are on the radio battery, apart from the
  general service battery.
- The watch alarm has reset points at the console, the chart table and both wings, and calls the master's and the chief
  officer's cabins before the general alarm.
- Navigation data: every talker has one listener (the distributor), so no set loads another's line.
- The emergency stops of both main engines are on the bridge under flaps.
- The sound-powered telephone to the engine control room and the steering-gear room needs no supply.

## What the yard does with this

Answer each comment in the last column, change `ferry/systems/bridge.py` and the model where the design changes, and resubmit;
the surveyor then issues PA-001 revision 1. Comments 2, 3, 4 and 8 change the bridge's boards: expect two more feeders (the
lights' own), a second steering control system, a transitional battery, and a second supply to the propulsion control.
