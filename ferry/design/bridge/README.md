# The Christina's bridge: drawn in CAD, logged, and designed

The owner, 10 November 2026: "I need you to draw the bridge in CAD and then we need to log every piece of equipment and
machinery that's on the bridge and what this is a bigger part in building the electrical wiring and a plumbing", and "by
drawing the bridge in CAD, you can find errors and problems to it and by investigating the general arrangement plans that you
found you might find a way to build a magical realistic bridge". This folder is the answer: six drawing sheets, a register,
a list of what the drawing found, and a design basis for a realistic wheelhouse. It is **survey and design-basis work, not a
rebuild**: the page still shows the Town's bridge. Section 5 of her Blender build (the bridge deck group) is the next step.

## What is here

| File | What |
|---|---|
| `sheets/CHR-B1-bridge-deck-ga.*` | Bridge deck general arrangement, plan cut 1.0 m above the deck (and 0.2 m in grey), two sections along the ship, every drawn item tagged, door widths measured, findings marked. 1:50 |
| `sheets/CHR-B2-wheelhouse.*` | Wheelhouse and wings: four plan cuts, the glass, the helm's eye and the arcs it sees, the view from the wheel (items by height), a section on the centreline with the lines of sight over the console. 1:25 |
| `sheets/CHR-B3-register.*` | The register as a schedule (116 rows) |
| `sheets/CHR-B4-wiring-and-plumbing.*` | The Town's 14 feeders and 14 pipe lines that serve the deck, with what is missing from them (dashed red) |
| `sheets/CHR-B5-findings.*` | The 19 findings, each with where it comes from and what to do |
| `sheets/CHR-B6-realistic-wheelhouse.*` | The design basis: every item of the design words placed, the view made whole, compared with the Ranger III. 1:25 |
| `register.csv`, `register.json` | **The log**: 116 items (`B001`–`B116`), each with room, status, KKS tag, position, electrical supply, plumbing, what it must connect to, and the source line |
| `feeders.csv`, `pipes.csv` | The Town's own feeder schedule (with cable numbers) and pipe lines that serve the bridge deck, as flat tables |
| `FINDINGS.md`, `findings.json` | The findings as text |
| `design-basis.json` | The positions of the realistic wheelhouse (32 items), what changes from what is drawn, and why: what a future `ferry/blender/bridge.py` reads |
| `town-bridge.json` | The snapshot of the Town's data everything is made from (Town commit `f0b2973`) |

Each sheet is a DXF (R2010, millimetres on the sheet, layers named for what they hold), a PNG preview and a PDF. The PDFs of
B3 and B5 are not kept (3 MB each of glyph outlines; their content is `register.csv` and `FINDINGS.md`); run `sheets.py` to make them.

## How it was made

```bash
node ferry/design/bridge/extract_town.mjs [path to the Town]   # the Town's bridge data → town-bridge.json (needs the Town checkout)
python3 ferry/design/bridge/register.py                        # the log
python3 ferry/design/bridge/findings.py                        # the findings
python3 ferry/design/bridge/design_basis.py                    # the realistic wheelhouse
python3 ferry/design/bridge/sheets.py [B1 … B6]                # the sheets
```

Needs `ezdxf` and `matplotlib` besides numpy. The plans and sections are **cuts through the triangles of the page's own
`bridge` group** (`ferry/data/ferry.bin.gz`, read with `assemble.read_jmf`), so they show what the page shows, not what a
source file says. The equipment is the Town's `FERRY_INTERIOR` (218 pieces on the deck, 41 named), the wheelhouse kit
(`ferry-bridge.js`), the design words (`FERRY_GA`), the electrical and piping tables, and the Town's own audit
(`auditFerry`). Every register row says which of four sources it comes from (`basis`): *drawn*, *words* (the design words name
it, nothing is drawn), *data* (the tables name it, nothing is drawn), *needed* (neither: **my inference**, to be checked).

## What drawing it found (19: 7 errors, 8 gaps, 4 risks; `FINDINGS.md`)

The ones that matter most:

- **The two engine levers are crossed** (`ferry-bridge.js:44`: Port at x +0.20, Starboard at x +0.40, x positive to port).
- **The opening to the crew stair is 1.50 m high**; every other doorway is 1.92–1.95 m.
- **The compass card and its housing stand at eye level dead ahead of the wheel** (1.50–1.62 m, 0.7 m from the eye): they hide
  the sea out to 75 m in a 13° arc. The glass shows 173° of the 225° the navigation-bridge guide asks for (SOLAS V/22, a
  benchmark for a 34.5 m ship, not a rule; the numbers are recalled, not checked).
- **The wing doors are plates laid beside their doorways**, over a window and a wall, with no frame, hinge or glass.
- **No wing console is drawn**, nor the thruster lever, the autopilot, the VHF, the telephone, the alarm: 26 items the design
  words name and 18 more the tables name are not drawn.
- **Wiring**: the ship has 59 feeders and none is direct current; one 0.75 kW feeder serves the radar, autopilot, echo sounder,
  GPS, NAVTEX and PA, with a 4.4 % drop; no fire-detection loop or general-alarm circuit exists.
- **Plumbing**: none of the 14 pipe lines that serve the deck is drawn on it; the Town's own route check calls 11 unresolved;
  the crew WC and shower are filed under the passenger-deck "toilets"; no grey-water drain exists anywhere; one hydrant with a
  15 m hose does not reach the EG and CO₂ rooms (20 m of hose route, taking the hydrant at the aft end of the port wing, where
  the Town only says "wing-p").
- The Town's own audit still lists 8 findings on the deck (a bunk and desk 25 cm into each other, a day tank resting on
  nothing, five trim pieces inside bunks, a locker in a wall).

Several of these are the Town's (its tags, its tables, its drawn pieces); the Town is a separate repository, so they are recorded
here, not fixed there.

## A realistic wheelhouse (`CHR-B6`, `design-basis.json`)

The Ranger III's pilot house (HAER MI-432 sheet 4, public domain; measured off the master scan at 75 px per foot, to within
0.2 m) is the benchmark: 5.9 m wide and 4.8 m deep with a rounded, all-round glazed front, a door to each wing, a steering
stand on the centreline with a seat beside it, the master engine controls ahead to port, the radar to starboard, the compass
ahead of the stand, a chart table 1.07 × 1.54 m aft against the bulkhead, and the master's sea cabin directly aft. The
Christina's wheelhouse is the same width and 1.3 m shallower; her envelope stays as it is and only the fittings change:

- every item of the design words placed (32 items with position and size), the console rearranged so nothing is at eye level
  in the 20° ahead: the heading readout low in the stand, the compass read overhead, the displays tilted and topping at 1.33 m;
- the two engine levers the right way round with the thruster lever beside them; a console at each wing's forward end;
- real wing doors in the doorways (hinged, a 0.15 m sill, the upper half glazed) and the starboard wall panel glazed, which
  closes the arc from the helm to −113°…+113° = 225°;
- the forward glass raked 10° (a guide value, recalled): its head would be at yard 23.17, and the compass-deck slab's edge is 23.16;
- every item on its own supply: a 24 V radio/emergency distribution, a wheelhouse panel with a fused way each, detector loops.

## Limits

- Drawn from the Town's model as the page shows it (Town `f0b2973`); a Town change needs `extract_town.mjs` and the rest rerun.
- The helm's eye (x 0, yard 20.9, 1.6 m up) and the hydrant's place (aft end of the port wing) are assumed.
- SOLAS V/22, the 225°, the 10° rake, and the 0.8 m door are recalled, not checked against a text. The Ranger III dimensions are
  read off a scan by eye to within 0.2 m. None of this is class-approved or construction information.
- The `needed` rows of the register (smoke detectors, an EG exhaust, fire extinguishers, an extract fan) are my inference.
- The unnamed fittings (the red panel on the aft wall as the fire/alarm panel, the red plate over the aft door as an exit sign)
  are named by their place and colour; the source names them nothing.
- No equipment's real catalogue size, weight or power was looked up; the electrical data is the Town's planning envelope.
- The sheets were checked by looking at the rendered PNGs and by `ezdxf`'s audit (0 errors on all six); no CAD program opened them.

## Next

Section 5 of her own build: a `ferry/blender/bridge.py` that reads `design-basis.json` and builds the wheelhouse, wings and the
house's rooms (with the register's items as named parts, so the electrical and plumbing routes can then be drawn to them),
superseding the Town's `bridge` group the way `hull` and `top` were. The findings that are the Town's (tags, tables, the audit)
belong in the Town's repository.
