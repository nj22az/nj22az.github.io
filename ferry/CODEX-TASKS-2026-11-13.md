# The Chisum: tasks for Codex, working beside Claude in the same repository

13 November 2026. The owner: "Give me some clear tasks you can delegate to codex working in the same project".

Five tasks, each whole by itself. None of them builds her model, so none meets Claude's work on her builders and her page.

## For every task

- Read [`AGENTS.md`](../AGENTS.md) and the block **RESUME HERE** at the top of [`HANDOVER.md`](../HANDOVER.md) first.
- **Branch from today's `main`** (`git fetch origin && git switch -c codex/<task> origin/main`). Never from an older branch;
  never push to `main`: open a pull request and say what was run.
- **Hands off, they are Claude's while this list stands:** `ferry/blender/` (but for the one file task 3 names), `ferry/systems/`,
  `ferry/app.js`, `ferry/data/ferry.bin.gz`, `ferry/data/light.bin.gz`, `ferry/data/systems.json`, and the RESUME HERE block
  of `HANDOVER.md`. Her model is one file: two builds of it cannot be merged.
- Write what was done into a note of the task's own (`ferry/HANDOVER-CODEX-<task>-<date>.md`) and add one line at the very top
  of `HANDOVER.md` that points to it, as the other notes there do.
- Say plainly what was not run. A check that was not run did not pass.
- How the page is served and checked: `HANDOVER.md`, section 4 (a threading server on port 8766; the checks in
  `ferry/checks/`, one at a time; `PLAYWRIGHT_BROWSERS_PATH`, `CHISUM_URL`).

## 1. Her page worked with real input, in Safari's engine

**Why.** The owner looks at her on an iPad and reported, after a publication: "Camera controls and walking controls seems
broken". Nothing was found broken in Chromium (`ferry/checks/input.cjs`: a real mouse, real keys and a finger; the other
checks drive her through test hooks). **Safari's engine has never been tried.**

**Do.** Run `ferry/checks/input.cjs` under Playwright's WebKit as well as Chromium (an iPad's size and touch; `input.cjs`
gives a finger through Chromium's debugger, which WebKit does not have: give it another way there). Find what differs.

**Done when.** `node ferry/checks/input.cjs` runs both engines and prints `ok`/`FAIL` lines as the other checks do; the note
lists every line that fails in WebKit and not in Chromium, each with what was seen. **Fix nothing in `ferry/app.js`**: say
what is wrong and where; Claude changes the page.

## 2. The maintenance program without a connection

**Why.** Aboard, the chief engineer's computer opens Maintenance Desk (`/maintenance-demo/?vessel=chisum`) inside her page.
Saved for use without a connection (`ferry/offline.js`, `ferry/sw.js`, `ferry/offline-files.js`), she opens; **the program
does not**: it lies outside her worker's reach (`/ferry/`).

**Do.** Make the program, her list (`ferry/data/equipment.json`) and her papers (the files that list names, under
`ferry/yard/` and `ferry/blender/assets/ce-suite/`) open with the network cut, once "Save offline" has been pressed on her
page. Keep her worker's rule: with a connection the newest is always given; nothing is saved unasked.

**Files.** `maintenance-demo/` (a worker of its own, or what else gives it reach), `ferry/offline-files.js`, `ferry/offline.js`,
`ferry/sw.js`, `ferry/checks/offline.cjs`.

**Done when.** `ferry/checks/offline.cjs` has new lines that pass: saved, network cut, a tap on the computer opens the
program, its register lists her items, a drawing and an instruction open. `node --test maintenance-demo/tests/*.test.mjs`
still passes (344). The workshop (`?workshop`) is as it was.

## 3. The check of cable runs does not see a thin bent cable

**Why.** `ferry/blender/spans.py` asks that no pipe or cable runs through the air (JSY-STD-402). On 12 November it named two
cables of the chief engineer's computer and **did not list a third at all** (the keyboard's, 3 mm thick, bent five times),
which hung 0.6 m free. Likely cause, not looked into: `afloat.pieces_of_soup` joins the lengths of a thin rod into one bent
piece, and `spans.py` then drops it as not "long and thin".

**Do.** Find the cause. Make the check judge every straight length of every rod a builder lays (`shipyard.Part.rod`), thin
or thick. Give it a small test of its own with made-up geometry (a bent 3 mm cable in the air must be named; the same
cable lying on a deck must not).

**Files.** `ferry/blender/spans.py` (and `ferry/blender/afloat.py` only if the cause is there). No builder. To try it, build a
trial of your own and leave it out of the commit: `blender -b -P ferry/blender/build.py -- --part /tmp/codex.npz --blend /tmp/codex.blend`,
then `python3 ferry/blender/spans.py --part /tmp/codex.npz --list`.

**Done when.** The test passes; the note lists **every run aboard that the corrected check names** (part, place, length).
Do not put those runs right: they are builders' work, Claude's.

## 4. Her electrical sheets, drawn again from her register

**Why.** `ferry/yard/drawings/electrical_drawing.py` draws JS8-851 (the one-line diagram), JS8-856 (the cable schedule), JS8-864
(each board with its door open) and the parts list **from the bridge's boards only, and has not been run since the stern
ramp's panel RSP and the chief engineer's board DB-CE came into the register**. The maintenance program hands these sheets
to items they do not show.

**Do.** Draw them from the whole register as it stands (`ferry/data/systems.json`: read it, do not write it): every board,
every way, every cable, with what is not installed marked so (DB-CE; the places of the main switchboard, the transformers
and the generating sets). Look at every sheet as a picture (`rsvg-convert -w 1640 sheet.svg -o sheet.png`).

**Files.** `ferry/yard/drawings/electrical_drawing.py`, the sheets it writes under `ferry/yard/drawings/`, their rows in
`ferry/yard/document-register.csv`.

**Done when.** Every board of `systems.json` is on JS8-851 and has its sheet of JS8-864; every cable is in JS8-856; no text
runs off a sheet or over another; the note says which figures are the register's and which were assumed.

## 5. A check that walks to every room

**Why.** Offered to the owner on 11 November and never made: nobody knows which of her 133 rooms cannot be reached on foot.

**Do.** A new page check, `ferry/checks/reach.cjs`: from where a walk begins, walk (through the page's own walking, doors
opening as they do for a walker, stairs climbed) to every room of the arrangement (`ferry/data/plans.json`), and list each
room that cannot be reached, with the last doorway or stair before it.

**Files.** `ferry/checks/reach.cjs` only (new). Read `ferry/checks/stairs.cjs` and `doors.cjs` for how a walker is driven.

**Done when.** It runs to the end in under ten minutes, prints one line a room, and ends with the count of rooms reached and
not reached. **It reports; it changes nothing aboard.** A room that is bare steel with no doorway cut is a finding, not a
failure of the check.
