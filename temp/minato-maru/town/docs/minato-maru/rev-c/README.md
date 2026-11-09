# The Minato Maru's working drawings, Rev C (9 November 2026)

The owner, 9 November 2026: *"Start a revision C the ferry has lots of issues at the moment so if you can create working
cads this will be helpful build her in sections start with exterior then cargo deck engine room bridge, accommodation
toilet galley etc"*.

Rev C draws her section by section, in that order, from the game's own model. Each sheet marks and lists the issues
found in that section, so the drawings can be worked from. The **issue list** is [ISSUES.md](ISSUES.md), generated with
the sheets; `issues.json` holds the same with every figure.

This continues the as-built survey of [Rev A and Rev B](../exterior/README.md): Rev A, the exterior, commit `b6873c5`;
Rev B, 3 November. It is not the 13 October engine-room design issue in [`../cad-revb/`](../cad-revb/), a separate
series.

| Sheet | File | What it shows | Scale |
|---|---|---|---|
| JS-127-C1 | `JS-127-C1-exterior` | Starboard and port profiles, plan from above, bow and stern, body sections at 3.0, 11.0, 20.5 and 31.0 m | 1:100 |
| JS-127-C2 | `JS-127-C2-car-deck` | Car deck plan cut 1.5 m above it, centreline section, sections at the lower lobby, foyer and casings, lanes, bow houses | 1:50 |
| JS-127-C3 | `JS-127-C3-engine-room` | Machinery spaces cut 1.5 m above the floor plates, centreline section, sections at the steering gear, engine room, auxiliary room, electrical workshop | 1:50 |
| JS-127-C4 | `JS-127-C4-bridge` | Wheelhouse and wings, sections looking forward and aft at 21.4 m, the centreline, the compass deck from above | 1:25, 1:50 |
| JS-127-C5 | `JS-127-C5-passenger-accommodation` | Passenger deck plan, a section 1.3 m to port, sections at the lobby, carpet room, saloon and open deck | 1:50 |
| JS-127-C6 | `JS-127-C6-crew-accommodation` | The bridge deck house: plan, the corridor, sections through every cabin row | 1:50 |
| JS-127-C7 | `JS-127-C7-toilets` | The passengers' toilets (plan, sections both ways, men's and women's), the crew WC | 1:25 |
| JS-127-C8 | `JS-127-C8-galley-mess` | Galley and mess: plan, sections both ways, a section through each | 1:25 |
| all | `Minato_Maru_Working_Drawings_RevC.pdf` | The eight A1 sheets as one vector PDF | |

Each sheet comes as SVG, AutoCAD R12 DXF (millimetres at sheet size) and a PNG preview.

## How she is drawn

- **The model.** `buildFerryModel()` is built in Node as the game builds it, at sea with the ramp raised. She is posed
  as the game poses her with someone aboard below deck: the engine room is shown, and its Blender model
  (`assets/models/ferry-engine-room/minato-engine-room-h1-f1.glb`) is loaded by the game's own loader from this
  checkout. Before that, nothing of the machinery spaces showed (the room is hidden until you go below).
- **The views.** Plans are cut by a horizontal plane and sections by a vertical one, each cropped to its section. What
  is cut is drawn heavy; what lies beyond is drawn in outline, with hidden lines removed (`tools/ferry-cad-core.mjs`,
  the engine Rev B used, moved there unchanged).
- **The design, dashed.** The general arrangement (`src/world/ferry-ship.js` `FERRY_GA`) is drawn dashed over each plan,
  so a room built away from its design shows.
- **Design and as built.** On C4, C6, C7 and C8, a panel sets each room's design words beside the named fittings built
  in it, so a missing fitting shows.

## The issues (`tools/ferry-audit.mjs`)

Found in her data and numbered F1… for the whole set. Red marks a **clash** (wrong, to fix); amber a **check** (look at
it: often wrong, sometimes meant).

| Check | What it finds |
|---|---|
| clash | Two different fittings in the same space, more than 1.5 cm deep |
| into-structure | A fitting more than 3 cm into a wall, deck or casing |
| part-clash | A trim piece of one assembly more than 5 cm inside another fitting |
| floating | A fitting resting on nothing and hanging from nothing (no deck, top, wall or fitting within 2 cm) |
| coplanar | Two faces sharing a plane over more than 4 cm²: they flash (`tools/z-fighting.mjs`, the town's standard) |
| no-floor | A manned room with doors that almost nobody can stand in (under 10 % walkable) |

The audit does not report things that are meant:
- walls meeting decks
- a fitting's own parts
- pipework, cables, taps and valves passing into what they serve (up to 10 cm)
- a pump with its own motor

The same finding to port and starboard is given once.

### What Rev C found (30 issues: 15 clash, 15 check)

- **The engine room's Blender model flashes.** In the game it replaces the code-built engine room when you go below.
  - Nine places share a plane inside the model, three of them between its two objects (F7 to F14 and F21). Six of
    them are large: F7, F9 and F11 to F14 are 0.6 to 5.75 m² each.
  - Four more places share a plane with the ship's own steelwork at the control booth (F1, F4 to F6).
  - The earlier ferry flicker test (`tests/ferry-z-fighting.test.mjs`) builds her without this model, so it never saw
    them.
- **Real clashes in her data:**
  - The mate's bunk runs 25 cm into his desk (F27).
  - The main engines' bedplates run 13 cm into the local control stands (F2) and 4 cm into the flywheel housings (F3).
    Both are in the code-built engine room, seen until the Blender model loads.
- **No floor:** the steering-gear room has two exits but nowhere to stand (F15).
- **Floating:**
  - Three toilet cubicle doors touch neither partition nor floor (F24 to F26).
  - Five ceiling lights hang 15 cm below the deckhead with nothing holding them, in the code-built engine room (F16,
    F18 to F20, F23).
  - The day tank in the emergency generator room stands on nothing (F28).
- **Design against as built** (from the panels, not numbered):
  - The crew WC has no shower, though the design calls it "Crew WC and shower".
  - The galley has no rice cooker and no hatch to the mess.
  - The mess has no kettle, duty board or muster list.
  - The steering-gear room has no named fitting at all: no rams, power units or hand pump.

## Limits

- **What the audit cannot see:** a door in the wrong place, a missing handrail, a room wrong for its use, a texture.
  Those are for the owner's review of the sheets: mark them up and they become the next round.
- **Assets not loaded:** of the assets the game streams in, only the engine room's Blender model is loaded. The
  navigation feeder is drawn as its stand-in, and the residents and the shore are not drawn.
- **Hidden-line accuracy:** a 10 mm depth buffer (5 mm at 1:25), and feature edges where faces meet at 50° or more.
- **No physical device was used.** This is a working drawing of a game vessel, with no flag, class or construction
  approval.

## Regenerating

Run `node tools/ferry-cad.mjs` from the Town's root; it takes about 20 s. It writes the sheets, the PDF, the PNG
previews, `issues.json` and `ISSUES.md`.
- `--no-pdf` writes only SVG, DXF and the issue lists.
- `--only=C3` draws one sheet.
- The PDF and PNG need the pre-installed Chromium (Playwright).
- `tests/ferry-cad-rev-c.test.mjs` checks the layout and the audit's rules.
