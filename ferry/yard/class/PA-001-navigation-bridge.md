# Plan approval comment sheet PA-001: navigation bridge

| | |
|---|---|
| Ship | Chisum, Johansson Shipyard newbuilding No. 1 |
| Revision | **2**, 11 November 2026. Revision 0 (the same day, on the design at the branch's `9da49be`) found 5 comments of category A and did not approve; revision 1 approved with comments; revision 2 follows the owner's decision to raise the wheelhouse roof and closes comment 21 |
| Submitted | For revision 1, the bridge as changed by the yard in answer to revision 0: `ferry/systems/bridge.py`, `ferry/systems/ship.py`, the model built from them, and two calculations, JS4-402 (visibility and the lights' sectors) and JS8-855 (batteries), in `ferry/yard/calc/`. For revision 2, the wheelhouse made 0.30 m taller, and JS4-402 extended to the view upward |
| Reviewed by | The surveyor. The Minato Register of Shipping is a society of Johansson World (`ferry/yard/README.md`): yard and surveyor are the same hands, kept apart on paper so that every decision has a reason and a record |
| Result | **Approved with comments.** No comment of category A is open. 8 of category B are open and are to be closed before the survey of the built section; 3 notes are open |

**How to read it.** A: to be resolved before the section is approved. B: before the survey of the built section. N: a note.
*Basis* names the requirement and says whether its text was **read** for this revision or is **recalled** from memory of
class practice. A recalled basis is not evidence, and is marked so that nobody takes it for one.

## The rule basis (comment 1)

The owner settled it on 11 November 2026 ("Rectify and proceed work according to your recommendations", the recommendation
being the international conventions as the benchmark). She is designed to **SOLAS as a passenger ship, COLREG and the Load
Line convention**, though she is a 34.5 m ferry between Minato and Kitano-jima whose own flag would ask less. Where a
regulation binds only larger ships (the bridge visibility rule starts at 55 m) the yard meets it all the same.

What was read for this revision, and where:

| Requirement | Read in | What it says, as far as it is used here |
|---|---|---|
| SOLAS II-1/29.7.2, 29.8.1, 29.8.4, 29.9 | consolidated text at imorules.com (a third-party mirror, not an IMO issue); the same clauses in Directive 2009/45/EC, annex I | Where the main steering gear has two or more identical power units, two independent control systems, both worked from the bridge. Each is "served by its own separate circuit supplied from a steering gear power circuit from a point within the steering gear compartment". Alarm on the bridge when a control system's supply fails. Power circuits and control systems, with their cables, "separated as far as is practicable throughout their length" |
| SOLAS II-1/30.2 | as above | Each steering gear is "served by at least two exclusive circuits fed directly from the main switchboard; however, one of the circuits may be supplied through the emergency switchboard" |
| SOLAS II-1/31.2.3, 31.2.6, 31.2.7, 31.5.1 | imorules.com | Remote control of propulsion from the bridge: an alarm on its failure, and "the preset speed and direction of thrust of the propellers shall be maintained until local control is in operation"; local control possible whatever fails in the remote control; the bridge's emergency stop independent of the bridge control. The regulation asks no particular power supply |
| SOLAS II-1/42.2, 42.3.1.2, 42.4 | imorules.com | Passenger ships. The emergency generator starts by itself and carries its load "as quickly as is safe and practicable, subject to a maximum of 45 s". The transitional source is "an accumulator battery" that takes over by itself and supplies for half an hour the emergency lighting **and the navigation lights**, the internal communication, the fire detection and alarm, the internal signals. The regulation does not name the public address or the general alarm; III/6.5.4 puts the public address on the emergency source |
| SOLAS II-1/45.5.3, 45.12 | imorules.com; Directive 2009/45/EC | Cables of essential and emergency services are routed clear of galleys, machinery spaces of category A and other high fire risk areas; "main and emergency feeders passing through any such zone are separated both vertically and horizontally as widely as is practicable" |
| SOLAS IV/13.2, 13.6.1 | resolution MSC.496(105), imo.org | The radio's reserve source: one hour where the emergency source complies fully with II-1/42, six hours where it does not; its charger restores the capacity required within 10 hours |
| The load of the reserve source | United Kingdom MGN 641 (M), annex F, 4.2 | Half the transmitting current, plus the receiving current, plus the other loads. The circular it gives, COMSAR/Circ.16, was not found in English |
| SOLAS V/22.1 | resolutions MSC.99(73) and MSC.142(77), imo.org | Ships of 55 m in length overall and more. Sea surface not hidden beyond two ship lengths or 500 m forward of the bow, to 10° either side; no blind sector from obstructions outside the wheelhouse over 10°, 20° in all, clear sectors of 5° between; 225° from the conning position; from each wing 225°, from 45° on the opposite bow round to right astern on its own side; the ship's side seen from the wing; front windows inclined 10° to 25°; framing kept to a minimum and none immediately forward of a workstation; the horizon in view for an eye at 1800 mm when she pitches (1600 mm where the Administration allows) |
| IACS Recommendation 95, revision 1 | IACS's own file, rec95rev1.pdf (a recommendation, not a rule) | Lower edge of the front windows 1000 mm at most, upper edge 2000 mm at least, divisions 150 mm at most |
| COLREG Annex I, 2(a)(i), 2(g), 2(i)(i), 3(d), 5, 9(b) | the United States Coast Guard's text of the international rules, navcen.uscg.gov | Masthead light at least 6 m above the hull and, on a beam over 6 m, at least the beam; sidelights not above three quarters of its height; two lights in a vertical line 2 m apart, the lowest 4 m above the hull; the masthead light forward of amidships; sidelights with inboard screens painted matt black; an all-round light not hidden by masts over more than 6°, or else two lights that appear as one at a mile |
| FSS Code chapter 9, 2.2.1 | resolution MSC.311(88), imo.org | Fire detection: not less than two sources of power, one of them an emergency source, by separate feeders direct from the main and the emergency switchboard to an automatic change-over switch in or beside the control panel |

Still recalled, not read: the class practice that the navigation light panel has two feeders direct from switchboards; that
fire-resistant cable is used for services that must work in a fire; that a remote control has two supplies; COLREG Annex
I, 9(a) (a sidelight's cut-off 1° to 3° outside its sector) and 2(f) (the masthead light clear of obstructions); the LSA
Code on the general alarm; the cable ratings and voltage-drop limits of `ferry/systems/ship.py`.

## Comments of revision 0, the yard's answers, and the surveyor's finding

| No. | Cat. | Comment (revision 0) | Basis | The yard's answer | Finding |
|---|---|---|---|---|---|
| 1 | A | The rules she is designed to are not stated | Contract specification JS1-101 | The conventions as the benchmark, by the owner's decision; recorded in `ferry/yard/README.md` and above. To be carried into JS1-101 when it is written | **Closed** |
| 2 | A | The navigation light panel took both supplies from boards that serve other consumers | II-1/42.2, 42.4 (read); two feeders direct from switchboards (recalled) | Two feeders of its own, each direct from a switchboard: 10 A, 2 × 2.5 mm² fire-resistant, 29.5 m, 2.8 % from the emergency switchboard's transitional section; 10 A, 2 × 4 mm², 44 m, 2.6 % from the main lighting board. They enter the bridge on opposite sides and come down different window ducts; they meet in the console for the last two metres to the panel, where the change-over switch is | **Closed** |
| 3 | A | One steering control unit on one way of one board | II-1/29.7.2, 29.8.1, 29.9, 30.2 (read) | Two control systems with nothing in common: No. 1 (STR-02) and No. 2 (STR-07), each with its own transmitter on the wheel, its own amplifier and its own power unit's valves. Each is fed from its power unit's circuit in the steering-gear room (2 A, 2 × 1.5 mm² fire-resistant, 56 m, 0.7 %), No. 1's from the main switchboard, No. 2's by the emergency switchboard. No. 1's cables leave by the port way, No. 2's by the starboard. The tiller works the valves of the chosen unit directly and needs neither | **Closed** for the bridge. See 23 |
| 4 | A | No transitional source: nothing carried the alarm, the public address and the emergency light through the 45 s | II-1/42.3.1.2, 42.4 (read) | The general service battery is the transitional source. The amplifier has a second supply from it (DC1 way 14, 16 A, 2 × 6 mm²) taken over without a break; a transitional light (LGT-14) is on DC1 way 15; the fire panel has its own battery. See 17 for the navigation lights | **Closed** for the bridge. See 26 |
| 5 | B | The radio battery was not sized | IV/13.2, 13.6.1 (read); the method from MGN 641 | JS8-855: 9.3 A counted, both VHF sets included; six hours need 87 Ah rated and 100 Ah is fitted, so the radio does not depend on the emergency generator being accepted; charger 10 A with a failure alarm at the radio position | **Closed.** The sets' currents are typical figures: the makers' replace them at installation (N) |
| 6 | B | The fire detection panel showed one supply | FSS Code 9/2.2.1 (read) | First answered with ways on the two wheelhouse boards; the text, once read, asks feeders direct from the switchboards. Now two feeders of its own (2 A, 2 × 1.5 mm² fire-resistant; 24.5 m from the emergency switchboard, 34 m from the main lighting board), the automatic change-over in the panel, a fault alarm for each, and the panel's own battery for the half hour | **Closed** (as 18) |
| 7 | B | Main and emergency feeder in the same tray; no cable types | II-1/45.5.3 (read); fire-resistant types (recalled) | Main supplies enter at the port after corner of the wheelhouse, emergency and battery supplies at the starboard one; they meet only at the boards, which stand side by side. The register now names each cable's type, and `FIRE_RESISTANT` lists which must go on working in a fire | **Closed** for the bridge. The ways below the bridge are judged with the sections they pass through |
| 8 | A | The propulsion control had one supply and both its lines by one way | II-1/31.2.6, 31.2.7, 31.5.1 (read); two supplies (recalled) | Two supplies from different sources (DC1 way 8 from the battery; BD2 way 7 from the emergency board through its own rectifier), an alarm on the loss of either. Line A leaves by the port way, line B by the starboard. If both lines are lost the engines hold the speed and direction last ordered, the alarm sounds on the bridge and in the engine control room, and control is taken at the engines | **Closed** for the bridge. The local control and the independence of the emergency stops are shown with the machinery section |
| 9 | B | The view of the sea over the bow, the frames ahead of the workstations, the edges of the glass and the wings were not shown | V/22.1 (read); IACS Rec. 95 (read) | JS4-402, made from the model. It found two defects, which the yard corrected: see 19 and 20. Result: sea hidden to 62 m ahead of the bow for an eye at 1.50 m (69 m allowed), 24 m at 1.80 m; outside the wheelhouse two blind sectors of 4.0° (the sidelights), 8° in all; no frame ahead of a workstation; lower edge of the glass 0.99 m; from each wing the whole 225° | **Closed**, but for the same calculation at her other draughts (B, listed below). The upper edge of the glass: 21 and 27 |
| 10 | B | The lights' arcs were not demonstrated | COLREG Annex I (read as listed) | JS4-402 section 5, each sector looked along from the lantern in the model. It found three defects. A single not-under-command lantern beside the mast is hidden by it over 26° to 36°: each height is now a pair, one either side, never both hidden. Two posts of the radar platform stood in the masthead light's sector: the light is raised 0.30 m over them (12.6 m above the hull, with the roof raised since), and nothing stands in it. The sidelights' screens: see 22 | **Closed**, but for 22 and the stern light, which comes with the passenger deck |
| 11 | B | Compass safe distances | The safe distance marked on each instrument (recalled) | Not answered: it needs the makers' figures | **Open** |
| 12 | B | Antenna separations; the radar's beam over the compass deck | Makers' requirements (recalled) | Not answered: it needs the makers' figures | **Open** |
| 13 | B | Short-circuit calculation, selectivity, the emergency generator's load list, the batteries | Class rules for electrical installations (recalled) | The batteries: JS8-855. The rest waits for the generators and switchboards of the machinery section. BD2's feeder is still 16 A over ways of 6 A and less: its selectivity is to be shown from the breakers' curves | **Open**, the batteries closed |
| 14 | N | The searchlight's breaker, 16 A where the other ship had 10 A | The yard's sizing rule | — | Closed in revision 0 |
| 15 | N | The wing doors open across wings 1.1 m wide | Working clearances | A hold-back at 90° against the house side is to be drawn | Open |
| 16 | N | The opening to the crew stair is 1.50 m high | Means of escape | The owner has since asked for an internal stair from the bridge to the engine room (11 November 2026). The stair trunk is redrawn for it with the accommodation, with full headroom | Open, with the accommodation |

## Comments raised at revisions 1 and 2

Found by reading the texts, by the yard's own calculations, and on the model. Comment 27 is revision 2's.

| No. | Cat. | On | Comment | Basis | The yard's answer | Finding |
|---|---|---|---|---|---|---|
| 17 | A | The navigation lights in the 45 s before the emergency generator is on the board | With both feeders dead she would show no lights for up to 45 s, and for good if the generator did not start. The transitional battery is to carry them | II-1/42.4.1 (read) | The emergency feeder now comes from a transitional section of the emergency switchboard, which the general service battery keeps alive through a 1 kVA inverter. JS8-855: with every lantern lit, the public address at full output and all of panel DC1, the bridge draws 31 Ah in the half hour of a bank that counts 128 Ah | **Closed** |
| 18 | A | The fire detection panel's feeders | Through the two wheelhouse distribution boards, not direct | FSS Code 9/2.2.1 (read) | As 6 | **Closed** |
| 19 | A | The sea over the console, from the conning position | For an eye at 1.50 m the engine instrument panel and the console's rudder angle indicator, on stand-offs 0.39 m over the console, and the levers at 0.30 m, hid the sea to 176 m ahead of the bow at 5° either side | V/22.1.1 (read) | The two panels sit on the console (0.22 m) and the levers are new control heads whose grips stand 0.19 m over it: 62 m. The build's own claim that nothing stood over 1.33 m was true and beside the point: what matters is what stands ahead of the wheel | **Closed** |
| 20 | A | The field of vision from each wing | The wing control stations stood across the whole wing with their levers inboard: from the levers the house's forward corner hid 13.5° of the arc, at 29° to 42° on the opposite bow | V/22.1.4 (read) | Each station is now a pedestal 0.63 m wide at the outboard forward corner of its wing, levers outboard. From the levers the whole 225° is clear | **Closed** |
| 21 | B | The upper edge of the forward glass | 1.96 m over the deck, under the 2000 mm recommended. The yard had raised the glass's head by 0.05 m, which was all the deckhead at 2.08 m allowed | V/22.1.8; IACS Rec. 95 (both read) | The owner decided (11 November 2026: "Yes make it realistic"). The wheelhouse is 0.30 m taller: 2.30 m clear under the lining, a service void, the roof's structure from 2.42 m, the compass deck at 2.70 m. The forward glass now runs from 0.99 to 2.06 m. The house top aft of the wheelhouse stays where it was, so the roof has a step, with a step block and marked edges; the mast and everything on the compass deck went up with it | **Closed** at revision 2 |
| 22 | B | The sidelights' inboard screens | 0.42 m long and 0.09 m inboard of the lens: the middle of the lens is still seen 14.5° across the bow, where the cut-off is to fall within 1° to 3° | COLREG Annex I, 5 (read), 9(a) (recalled) | Either the lantern's own screening gives the cut-off, shown by the maker's certificate, or the screens are 0.9 m long. The wing rail has no room for that; the yard proposes lanterns in boxes let into the wing bulwark under the rail, which would also take the two 4° blind sectors out of the view from the conning position | **Open** |
| 23 | B | Steering | The alarm on the bridge when a control system's supply fails is to be on the alarm list (JS8-857); the two systems' cables are to stay apart all the way to the steering-gear room | II-1/29.8.4, 29.9 (read) | With the steering-gear section | **Open** |
| 24 | N | Wing control stations | On the port wing the port engine's lever stood to starboard of the starboard engine's | Good practice: a control is laid out the same at every station | Corrected with the new stations: port engine to port on both wings, as on the console | Closed |
| 25 | N | The control levers | The owner asked (11 November 2026) for slots and mechanical moving parts | The owner | Each lever is a control head: a housing with a slot in its top plate, a drum on the lever's shaft under the slot, and a scale whose marks are where the arm crosses the plate. A tap moves a lever a notch, and the same lever at the console and on both wings moves as one; the tiller stands in a gate; the wheel turns with the rudder order | Closed |
| 27 | A | The view upward, from the conning position | Revision 1 judged the pitch she may take by the height of the glass. Measured in the model, the glass was not what ended the view: **the overhead console hung to 1.80 m**, 1.6 m ahead of the wheel, so an eye at 1.80 m had the horizon at its lower edge on an even keel; the compass periscope's mirror box hung to 1.84 m on the centreline; the rolled sun blinds hung 4 cm over the top of the glass. The side windows' glass ended at 1.78 m and the wing doors' at 1.75 m, under that eye: a tall helmsman could not see abeam without stooping | V/22.1.3, 22.1.8 (read) | With the roof raised: the overhead console hangs from 2.06 m up, above the windows' head; the periscope's box from 1.97 m; the blinds roll up inside the head frame; the side windows' glass reaches 2.00 m and the wing doors', now 2.01 m high, 1.95 m. JS4-402 revision 2 measures it: for an eye at 1.80 m the view ends at the head of the glass itself, 6.3° over the horizontal (11.1° for 1.60 m), and the glass shows 224° of 225° to an eye at 1.50 m and at 1.80 m alike. The build now measures the glass for both eyes and stops under 220° | **Closed** at revision 2 |
| 26 | B | The transitional battery, ship-wide | JS8-855 counts the bridge only. 97 Ah of the bank remain for the emergency lighting of every other space | II-1/42.4.1 (read) | The calculation is reissued as each section enters the register | **Open** until the last section |

## Examined without comment

- The masthead light is forward of amidships and 12.6 m above the hull, more than her beam of 8.4 m; the sidelights are at
  8.3 m, under three quarters of that (9.4 m); the not-under-command lights are 2.0 m apart in a vertical line and the
  lower is 11.3 m above the hull.
- The forward windows are inclined 10°, top outward.
- The magnetic compass is read from the helm through a periscope directly under the binnacle, and needs no power.
- Every way's breaker is at least 1.25 times its current and every cable is rated for its breaker; no cable loses more
  than 5 % and no consumer more than the limit in all (`register.py`, at every build).
- The two VHF sets, the NAVTEX receiver and the position fix for the distress call are on the radio battery, apart from
  the general service battery.
- The watch alarm has reset points at the console, the chart table and both wings, and calls the master's and the chief
  officer's cabins before the general alarm.
- Navigation data: every talker has one listener (the distributor), so no set loads another's line.
- The emergency stops of both main engines are on the bridge under flaps.
- The sound-powered telephone to the engine control room and the steering-gear room needs no supply.

## What is open, in one place

| No. | Cat. | What | Waits for |
|---|---|---|---|
| 11 | B | Compass safe distances | Makers' figures; sea trial |
| 12 | B | Antenna separations, radar radiation hazard area | Makers' figures |
| 13 | B | Short-circuit calculation, selectivity, emergency generator load list | The machinery section |
| 22 | B | Sidelight screens | The lantern maker's certificate, or the lanterns moved into the bulwark |
| 23 | B | Steering control supply alarm; separation to the steering gear | The steering-gear section |
| 26 | B | Transitional battery, ship-wide | Every other section |
| — | B | The stern light's sector (from 10) | The passenger deck |
| — | B | Visibility at the light draught and trimmed by the stern (from 9) | The stability booklet |
| 15, 16 | N | Wing door hold-backs; the stair from the bridge to the engine room | The accommodation |

The section may be built on. The next submission is the machinery spaces with the engine control room (PA-002).
