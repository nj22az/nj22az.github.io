# Minato Maru: working drawings Rev C, the ship in sections, with her issues found (9 November 2026)

The owner, 9 November 2026: *"Start a revision C the ferry has lots of issues at the moment so if you can create working
cads this will be helpful build her in sections start with exterior then cargo deck engine room bridge, accommodation
toilet galley etc"*.

**State:**
- The work is on branch `claude/ferry-cad-rev-c` of this repository, built from `main` `fc7281f`, and committed locally.
- It is **not on GitHub yet.** The session that made it had read access to `nj22az/johansson-town` only: the request
  for push access was refused by the session's safety check.
- The owner was sent the PDF, the sheets and a git bundle of the branch. Pushing waits for the owner to grant access.
- Nothing in the game changed. Rev C touches only `tools/`, `tests/` and `docs/`, which are outside the runtime's source
  hash.

## What was built

- **`tools/ferry-cad-core.mjs`, the CAD engine moved out of `tools/ferry-exterior-cad.mjs` unchanged.**
  - It covers projection, hidden-line removal, SVG, R12 DXF and the A1 sheet furniture.
  - Rev B's tool imports it: regenerated with `--no-pdf`, its 3 SVG, 3 DXF and `problems.json` are byte-identical to
    before.
  - New: several clip planes a view, so a section can be cropped to its section. Also the depth-buffer resolution per
    view (5 mm at 1:25) and the title-block details per set.
- **`tools/ferry-audit.mjs`, the issues in her data.**
  - Clashes, fittings into structure, trim inside fittings, floating fittings, faces sharing a plane, and manned rooms
    without a floor.
  - Each issue comes with its general-arrangement room, its deck, yard, x and height, and the source line of
    `ferry-interior.js` (under `__KIT_TRACE__`).
  - Rules keep it from reporting what is meant: structure meeting structure, an assembly's own parts, pipework and
    cables into what they serve, a pump and its motor. Port and starboard repeats are folded into one.
- **`tools/ferry-cad.mjs`, the set:** eight A1 sheets JS-127-C1 to C8 in the owner's order (see
  `docs/minato-maru/rev-c/README.md`).
  - Plans and sections are cropped to each section, with the design (`FERRY_GA`) dashed over each plan.
  - Issues are balloons on the plans with a list on each sheet.
  - C4, C6, C7 and C8 add a "design and as built" panel per room.
  - A layout check refuses overlapping views.
  - It writes SVG, DXF and PNG per sheet, one PDF, `issues.json` and `ISSUES.md`.
- **She is drawn posed below deck, as the game poses her:** the engine room shown and its Blender model
  (`minato-engine-room-h1-f1.glb`) loaded by the game's own loader, from the checkout. The first draft showed the
  machinery spaces empty, because the room is hidden until someone goes below.
- **`tests/ferry-cad-rev-c.test.mjs`, 4/4:**
  - the sections in the owner's order
  - no layout overlap on any sheet
  - shipyard coordinates
  - the audit's rules (a clash always involves a fitting, connectors are not clashes, each finding names its source,
    port and starboard once, numbering in order)

## What it found (30 issues: 15 clash, 15 check; full list in `docs/minato-maru/rev-c/ISSUES.md`)

1. **The engine room's Blender model flickers.**
   - Nine places share a plane inside the model; six of them are 0.6 to 5.75 m² each (F7, F9, F11 to F14).
   - Four more share a plane with the ship's own steel at the control booth (F1, F4 to F6, `ferry-model.js:604`).
   - `tests/ferry-z-fighting.test.mjs` builds her without this model, so it passes while these flicker in the game.
   - This is probably much of the "lots of z-fighting" the owner saw below deck.
2. **Clashes in her data:**
   - The mate's bunk runs 25 cm into the desk (F27, `ferry-interior.js:681` and `:684`).
   - The main engines' bedplates run 13 cm into the local control stands (F2) and 4 cm into the flywheel housings
     (F3). Both are in the code-built engine room, shown until the Blender model loads.
3. **The steering-gear room** has two exits but no floor (F15), and no named fitting at all: the design lists rams,
   power units and a hand pump.
4. **Floating:**
   - three toilet cubicle doors (F24 to F26)
   - five code-built engine-room ceiling lights, 15 cm under the deckhead (F16, F18 to F20, F23)
   - the emergency generator room's day tank (F28)
5. **Design against as built:**
   - no shower in the "Crew WC and shower"
   - no rice cooker or hatch to the mess in the galley
   - no kettle, duty board or muster list in the mess
6. **The rest:** one small fitting 3 cm into a wall (F29), two trim pieces inside fittings (F17, F22), small faces
   sharing a plane (F8, F10, F21, F30). F30 is the 15 cm² on the navigation feeder's stand-in, known from Rev B.

## Checks actually run

- `node tools/ferry-cad.mjs`: the eight sheets, the PDF and the PNGs in about 20 s. The layout check is clean.
- Every sheet was looked at as a PNG. The first drafts' overlaps (the 1:25 sheets' sections, the exterior plan off the
  sheet) and the empty engine room were fixed.
- `tests/ferry-cad-rev-c.test.mjs`: 4/4.
- `tests/ferry-z-fighting.test.mjs`, `ferry-exterior.test.mjs`, `ferry-accommodation.test.mjs`: pass.
- `tests/runtime-package.test.mjs`: 4 failures in this checkout only. It is a sparse checkout without `runtime/` and
  `assets/` (except the engine-room GLB). Rev C changes nothing the runtime hash covers (`src/`, `scripts/`, root
  `.js`).
- **Not run:** the full guard, a browser, a device.

## Next concrete actions

1. **Publish.** With push access to `nj22az/johansson-town`, push `claude/ferry-cad-rev-c`, or apply the bundle the
   owner was sent. Merge on the owner's word.
2. **Fix the engine room's flicker.**
   - Either re-export `minato-engine-room-h1-f1.glb` from Blender with the coplanar faces separated, or offset them in
     `ferry-engine-room-asset.js`.
   - Make `tests/ferry-z-fighting.test.mjs` load the model, as `tools/ferry-cad.mjs` does, so it guards it.
3. **Fix the clashes and floating fittings** at their source lines, then regenerate Rev C and watch the list shorten.
4. **The design gaps:** the steering-gear room's floor and fittings; the crew shower; the galley's rice cooker and hatch;
   the mess's kettle, duty board and muster list.
5. **The owner marks up the sheets.** What the audit cannot see becomes the next round.
