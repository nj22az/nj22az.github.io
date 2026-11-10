# The Chisum's systems: her component register

The owner, 11 November 2026: "Make the ferry fully realistic in blender, start with one section at a time. Start with the bridge,
aim for a fully explorable realistic ferry with a component register, I.e, what equipment is installed, what's the power what's
the main? How's the plumbing, how's the subsystems and the communication nets. A fully functional realistic well defined ferry,
use the Christina as ground work". And while it was made: "If current foundation is lacking don't be ashamed of redrawing it, the
important part is that it's a realistic vessel".

This folder is the answer to the second half of that: every component she carries, written down once, with what it is, where it
stands, what it draws and from which circuit, what it talks to and over what, and which pipe it is on. The model is drawn from it
(`../blender/wheelhouse.py` puts each component where the register says), the page reads it (`../systems.js`: tap a fitting, or
open *Systems*), and a tool checks that it holds together. **The first section registered is the navigation bridge.**

| File | What |
|---|---|
| `ship.py` | Ship-wide: her supply (the answer to "what is the main?"), the sources, the boards a section may be fed from, the subsystems, and the rule a circuit is sized by |
| `bridge.py` | The navigation bridge: 147 components, 5 boards with 35 ways and 5 circuits direct from boards elsewhere, 31 nets, 7 pipes, and the cable ways (trays, trunks, ducts) all of it is laid along |
| `register.py` | Puts them together, routes every cable, works out currents, lengths and voltage drops, checks the lot, and writes `../data/systems.json` and the tables in `out/` |
| `out/bridge-components.csv`, `-circuits.csv`, `-nets.csv`, `-pipes.csv` | The register as tables, for people |

```bash
python3 ferry/systems/register.py                       # check and write (keeps the places the model last gave)
python3 ferry/systems/register.py --boxes <part file>   # with a fresh part file from blender/build.py
```

`../blender/assemble.py` runs it too, with the places of the build it is assembling, so the model and the register never part.

## What she is supplied by

- **Main: 440 V three-phase, 60 Hz**, three-wire and insulated, from two diesel generators of 100 kW (125 kVA) on the main
  switchboard in the engine control room, or 50 kVA from the shore at Minato.
- **Lighting and small power: 105 V single-phase**, through transformers; both poles insulated and switched.
- **Emergency:** a 32 kW (40 kVA) generator on the bridge deck feeds the emergency switchboard, which is otherwise fed from the
  main board; its 105 V section is behind a 5 kVA transformer.
- **24 V direct current** from two battery banks in the emergency generator room, each on its own charger: the radio bank,
  which feeds the radio and nothing else; and the general service bank, for navigation and control, which is also the
  **transitional source**: through the 45 seconds the emergency generator takes to start it carries the alarm and the public
  address, the transitional lighting and, through a 1 kVA inverter and a transitional section of the emergency switchboard,
  the navigation lights. Their capacities are worked out in `../yard/calc/JS8-855-battery-capacity.md`.

This is the Minato Maru's plant (the Town's working drawings D1 and D15), continued: the same generators, voltages and sizing
rule. What is hers is the distribution on the bridge, which the survey of 10 November found wanting (one 0.75 kW feeder for six
systems, no direct current to any consumer, no fire detection or general alarm circuit):

| Board | Where | Fed from | Feeds |
|---|---|---|---|
| **BD1** Wheelhouse distribution, 105 V | aft wall | the lighting board, 40 A, 2 × 16 mm², 33.5 m, 2.2 % | lighting, wing lights and floodlights, wipers, sockets, air conditioner, chart system and cameras, dimmers; 2.4 kW connected |
| **BD2** Emergency distribution, 105 V | aft wall | the emergency switchboard, 16 A, 2 × 4 mm² fire-resistant, 24 m, 1.6 % | radar, public address and general alarm, emergency light, whistle control, the propulsion control's second supply; 0.6 kW |
| **DC1** 24 V, navigation and control | aft wall | the general service battery, 40 A, 2 × 35 mm² fire-resistant, 24.5 m, 3.3 % | GPS, AIS, satellite compass, sounder, log, navigation data, autopilot, propulsion and thruster control, talkback, alarms, repeaters, night and transitional lighting, the amplifier's battery supply; 0.6 kW |
| **DC2** 24 V, radio | aft wall | the radio battery, 25 A, 2 × 25 mm² fire-resistant, 25 m, 2.6 % | both VHF sets, NAVTEX, the GPS's second supply, the portable sets' charger; 340 W |
| **NLP** Navigation light panel | console | two feeders of its own: the emergency switchboard's transitional section (10 A, 2 × 2.5 mm² fire-resistant, 29.5 m, 2.8 %) and the main lighting board (10 A, 2 × 4 mm², 43.5 m, 2.6 %), by different sides of the room | one monitored way a lantern: masthead, sidelights, stern, anchor, two pairs of not-under-command lights; 540 W |

Five circuits come to the bridge direct from boards elsewhere and belong to none of its own (`OUTSIDE_CIRCUITS`): the two
steering control systems, each from its own power unit's circuit in the steering-gear room (2 A, 56 m); the fire detection
panel's two feeders, from the emergency switchboard and the main lighting board; the searchlight. Main supplies enter the
bridge at its port after corner and emergency and battery supplies at the starboard one (`ENTRY`); cables that must go on
working in a fire are named in `FIRE_RESISTANT`, and the register prints each cable's type.

This distribution was changed twice on 11 November 2026 in answer to class (`../yard/class/PA-001-navigation-bridge.md`,
which says what each change answers and which regulation was read for it).

## How a circuit is sized, and checked

A breaker is at least 1.25 times the full-load current (the next standard rating); the cable is rated for its breaker; no cable
loses more than 5 % of the voltage; no consumer more than 6 % in all from the switchboard, 10 % on a battery supply. A cable's
length is not typed in: it is **the way the cable is laid** through the cable ways of `bridge.py` (the trays over the deckhead
lining, the trunk down the aft wall to the boards, two ducts down the forward mullions into the console, the console's own duct,
a floor trunk to the steering stand, the house side to each wing, the mast), plus the tails at both ends and a tenth more. So
moving a component in the register moves its cable, changes its length and its voltage drop, and the check says if a breaker or
a cable no longer suffices.

`register.py` stops if: a tag is used twice; a component that draws power is on no circuit, or names one that does not exist; a
way has nothing on it; a breaker is not a standard rating, is under 1.25 times its current, or under the current with the
standby loads on; a cable is rated under its breaker; a drop is over the limit; a net has fewer than two ends, a hub that is
not a member, or names a component that is not registered; a pipe joins something that is not registered. All hold: the worst
drop in all is 8.8 % on DC1 way 11 (the limit there is 10 %) and 4.2 % on alternating current (the stern light, 39 m from its panel).

**The first run found one of the Minato Maru's own:** her searchlight feeder (10CTA10 GS001) has a 10 A breaker for 9.5 A,
under her list's own rule of 1.25 times the full-load current. The Chisum's has 16 A on the same 4 mm² cable. That is for
the Town's repository to put right in its feeder list.

## The nets

28 of them, each with its medium and what every member says or hears: navigation data (IEC 61162-1, every talker to a
distributor that gives each listener a buffered line of its own), AIS targets, the navigation network (Ethernet), the radar's
scanner cable, the cameras, propulsion control (two CAN lines), steering control (orders out, rudder angle back), public address
and general alarm, talkback, the sound-powered telephone, the telephone, fire detection loop 1, machinery alarms, the watch
alarm, door and ramp indication, whistle, wipers, searchlight, dimming, six antenna feeders, the sounder's and the log's
sensor cables. Where a net runs on into a section that is not registered yet (the engine control room, the steering-gear room,
the car deck), that end is named as a place and a thing, and becomes a component when its section is built.

## The pipes

Seven: compressed air to the whistle (DN 15, by the whistle valve over the helm, up the mast to the horns), fresh water to the
window wash (DN 15, by a solenoid valve in the console to a nozzle at each wiper), the fire main's branch to the hydrant on the
port wing (DN 50), a scupper from each wing (DN 50), and the air conditioner's refrigerant lines and condensate drain.

## Adding the next section

1. Write `<section>.py` on the pattern of `bridge.py`: `SECTION`, `NODES` and `EDGES` (its cable ways, joined to the next
   section's where they meet), `BOARDS`, `CIRCUITS`, `COMPONENTS` (with `C(...)`), `NETS`, `PIPES`. Add it to `SECTIONS` in
   `register.py`.
2. Where one of its components is an end that an earlier section named as "elsewhere" (`ext:ECR:…`), give that net the
   component's tag instead.
3. Draw it in Blender from that data, each component inside `with component(tag):` (`../blender/shipyard.py`), so the build
   writes where it is.
4. `register.py` must pass; `../checks/bridge.cjs` is the pattern for the page's own check.

## Limits

- **Powers are typical figures** for equipment of the kind and size, not a maker's data sheet (`basis` says which are the
  Minato Maru's planning figures). The share used "at sea" is an estimate.
- **The rules are recalled, not checked against a text**: 1.25 and 5 % are the Minato Maru's (D15); 6 % and 10 % in all, and
  the cable ratings (two-core rubber-insulated marine cable at 45 °C, rounded down), are from memory of IEC 60092-352 practice.
  The carriage requirements behind the equipment list (two VHF sets, NAVTEX, AIS, the watch alarm, two not-under-command
  lights) are as I recall them for a small passenger ship in sea area A1, not checked against the flag's rules.
- **Nothing here is class-approved or construction information.**
- The cable lengths from the boards below to the bridge are the Minato Maru's (33 m from the control booth, 20 m from the
  emergency generator room), until the sections between are routed. The battery banks are not sized.
- The cable ways are data: the page draws a circuit's run through them, and the model shows the two mullion ducts, the floor
  trunk and the cable transit at the mast, but not the trays over the lining nor the cables themselves.
- Tags are of this register's own making (subsystem and number: `NAV-01`). The Minato Maru's KKS tag is kept beside a
  component where she gave one; the survey's row (`B081`) likewise.
