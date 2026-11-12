# The maintenance computer: the chief engineer's PC, and a maintenance program that knows the ship

Johansson Shipyard · design record · revision 1 · 12 November 2026 · newbuilding No. 1, the Chisum · **built the same night, but
for what section 7 lists** (revision 0 was the proposal; sections 1 to 6 stand as they were proposed, and section 7 says how
it was built and where that differs)

The owner, 12 November 2026, at night, in the order said. Of the site's own program at `/maintenance-demo/` (Maintenance
Desk): "This could be used for the maintenance system onboard , if it needs enhancing add that , so we can update that
program as well". Then: "Build a functional Maintenance PC and add it to the chief engineers cabin ,". "Which has all parts
and equipment onboard". "It needs to have an ui, we are not going to a website we are still on the chisum , accessing the
maintenance program is on the computer". "We can have full screen but needs a clear button to leave and go back to the
chisum".

## 1. What is asked, in one sentence

A computer stands on a desk in the chief engineer's cabin; one goes to it aboard, works the maintenance program on it, and
the program holds every part and every piece of equipment the ship has; one never leaves the Chisum to do so, and one
button, always in sight, goes back to the ship.

## 2. What there is today

- **The cabin.** The chief engineer's suite is on the officers' deck, port side, under the wheelhouse: 98.05 to 104.0 m from
  the transom, 2.995 to 7.5 m to port, 26.8 m², the deck 13.2 m over the waterline and the next one 2.8 m above it
  (`ga.py`: "a day room with a desk, a bedroom, a wet unit"). Its door is in its after end, 3.6 to 4.4 m to port, onto the
  cross passage. It has two windows in her side (99.4 to 100.3 and 101.6 to 102.5 m) and two in the house front (3.6 to 4.5
  and 5.6 to 6.5 m to port), each 0.9 m wide, from 1.05 to 1.68 m over the deck (`steel.py`: `CABIN`). **Nothing stands in
  it**: no cabin aboard is fitted out yet.
- **The program.** Maintenance Desk is a working program, not a picture of one: assets with their particulars, a programme
  of tasks by date or by running hours, a schedule, inspections with checklists, actions, risk assessments, complete
  records with retained files, history, print and export; 64 files, its own tests. It keeps one workspace in the visitor's
  browser (`localStorage`, one key) and knows a fictional workshop of four machines and three test kits. It has no notion
  of a ship, of a place aboard, of a system, or of a part.
- **What the ship knows of herself.** Three lists, in three places, none of them complete:

  | List | Where | Entries today | In it |
  |---|---|---|---|
  | The register | `ferry/data/systems.json`, from `ferry/systems/` | 225 | The bridge's equipment (186) and the stern ramp with all that works it (39): tag, name, system, room, place, what it is, its supply |
  | Deck fittings | `ferry/blender/spec.py`: `OUTFIT` | 88 | Windlasses, winches, capstans, bitts, chocks, fairleads, lifeboat stations, liferafts, ventilators, air pipes, monitors: id, kind, place, why it stands there. **None is in the register** |
  | Light fittings | `ferry/blender/lighting.py` | 392 in 97 spaces | Counted by the build; not listed anywhere a program can read |

  And what she does not have cannot be listed: below the main deck there is no engine, gear, generator or pump yet
  (`machinery-complex-audit.md`); the switchboard is nine cubicles begun on 12 November.

## 3. What is proposed

### 3.1 One list of everything aboard

A new step of her build writes `ferry/data/equipment.json`: every item she has, once, from her own builders' numbers. The
register's components as they are; each deck fitting; each light fitting; each door and hatch that is worked. For each: its
tag, its name, what kind of thing it is, its system, its deck and room, its place (so the ship can take one to it), what it
is in words, **its parts** (a fitting's builder already says them: a windlass's `known_by` names its bedplate, cable lifter,
band brake, clutch, gear case and so on; the register has the ramp's panel parts and terminals), and where its maintenance
comes from. The list is made by the build, so it grows as she is built, and nothing is typed twice. `check.py` counts it
against the model.

How it is gathered: the builders of fittings and lights run inside Blender and cannot be asked from outside it, so `build.py`
asks each of them as it builds (a section may answer `inventory()`, as it may answer `motion()` or `doorways()` today) and
writes what they say beside the part file; a plain program, `ferry/systems/equipment.py`, joins that with the register.

### 3.2 The program, given a ship

Maintenance Desk is enhanced, in its own folder, so that the same program serves a workshop and a vessel:

- **A workspace for each.** Opened as it is today it is the workshop, unchanged for the site's visitors. Opened for the
  Chisum it keeps a second workspace of its own and fills it from `equipment.json`.
- **A ship's way of finding things**: by system, by deck and room, by tag, by a search; an item's page shows where it is, its
  parts, its drawing and instruction where she has them (JS3-304, JS3-304-M1, JS8-865).
- **Jobs.** Where a thing has an instruction, its jobs are that instruction's (the power pack: JS3-304-M1, section 12, with
  its oil and its levels). For the rest, jobs by kind of thing (a winch, a windlass, a lifeboat station, a liferaft, a
  watertight door, a light fitting, a breaker). **These are the yard's own choices and are marked so**: no maker's manual
  exists for anything aboard, and the statutory intervals for the life-saving gear are as recalled, not read.
- **"Show on board"** on every item: the program closes and the ship takes one to the thing.

### 3.3 The computer in the day room

Drawn first (a sheet of the day room, with the door, the four windows and the door's swing on it), then built: a desk against
a wall that has no window, a chair that turns, and on the desk a screen on its stand, a keyboard, a mouse and a system unit,
each with its cable; a twin socket and a data outlet on the wall above the desk. It is the register's too: its tag, a 230 V
socket circuit, and a data cable. Neither the officers' deck's distribution board nor a network cabinet is built: **both
ends are marked**, as the generators' are. The rest of the suite (bedroom, wet unit, linings) is not part of this.

### 3.4 Working it, on the page

- On foot in the cabin, or from outside by picking it, **a tap on the screen sits one down at it**: the maintenance program
  fills the display. It is drawn inside the Chisum's own page: the address does not change, the ship is not unloaded, and
  where one stood is kept.
- **One button, always in sight, top left, as large as the bar's keys: "Back to the Chisum".** The Escape key does the same.
  One is back in the cabin, standing where one stood.
- While nobody sits at it the screen in the model shows the program's opening picture, lit.
- **From the ship to the program:** a fitting's card aboard gains "Maintenance", which opens the same display at that item.

## 4. What it costs, said plainly

- **Two programs change, and each keeps its own checks.** Maintenance Desk gains the vessel's workspace and its tests grow;
  the Chisum gains a tenth page check (the computer is found, opened, an item of hers is in it, "Show on board" arrives,
  the button goes back).
- **What is recorded stays on the device it was recorded on**, as today. Nothing is shared between the owner's tablet and
  another machine; that would need a server, which the site does not have.
- **For use without a connection** the Chisum's offline store has to take the program's files and the list as well.
- **Her sheet of pictures cannot be drawn again on this Mac** (HANDOVER: a font is missing). The screen's opening picture is
  therefore a sheet of its own; the file format already allows several.
- The whole ship is built again for the desk and the computer (a quarter of an hour), with every check.

## 5. Order of work, each step leaving her whole

1. The list (`equipment.json`) and its count in `check.py`: nothing looks different.
2. Maintenance Desk's vessel workspace, with its tests; tried by itself in a browser.
3. The day room's sheet, then the desk, chair and computer; the register's entries; her build and all its checks.
4. The display on the page with its button back; the card's "Maintenance"; the tenth page check.
5. Pictures from the page, from arm's length for the lettering; then the handover.

## 6. Open, for the owner

- **Whose name is on it.** The program asks for a company, a site and a coordinator. Proposed: Johansson Line, M/V Chisum,
  Chief Engineer; say if a name is to stand there.
- **Running hours.** The program can plan by a meter. Her pumps and winches run on the page, and it could count their hours
  for the program while one is aboard; proposed for a later step, after the five above.

## 7. As built, 12 November 2026 (revision 1)

The five steps of section 5 are done. What was built, and where it is not as sections 3 and 4 proposed:

- **The desk stands at her side, not against a wall without a window** (3.3). The owner's own package for a chief engineer's
  suite, kept aboard since 11 November (`ferry/blender/assets/ce-suite/`: CE-SUITE-GA-001, MS-CE-001), has the day room's
  desk at the ship's side beside a window, its sockets 0.30 m over the deck on circuit S1 of the suite's own board DB-CE, in
  skirting trunking, and DB-CE by the door. The room is built so: the desk along her side at the after end, its forward half
  metre under the first side window and 0.31 m under its sill, the screen 0.20 m clear of the pane; a twin socket and a data
  outlet under the desk; 5.0 m of skirting trunking to the place of DB-CE beside the door. **DB-CE is not installed**: its
  place is an outline and a sign, and both cables end in a box under it and say so. Sheet
  [JS5-511](../drawings/JS5-511-chief-engineers-day-room.svg); numbers `ferry/blender/cabin_place.py`; builder
  `ferry/blender/cabin_ce.py`; the register's third section `ferry/systems/accommodation.py` (seven components, the board
  DB-CE with its one way, a new subsystem ADM).
- **The screen's opening picture is built, not a picture laid on a surface** (4): a lit sheet, bars and lettering, as fine
  work. The second sheet of pictures that section 4 foresaw is there all the same, for the calendar on the after wall
  (`ferry/blender/cabin_pictures.py`, `ferry/data/chisum-cabins.webp`).
- **The owner's package is among her papers** (3.2): its drawing and its method statement are read inside the program beside
  the yard's own sheets, and the day room's items name them. They are of a suite of 7.2 by 5.0 m on a 190 m ship and say so.
- **The register is narrowed by department** (not proposed; the owner, the same night: "We should be able to filter by
  department , deck, engine , galley"): `equipment.py` says whose each item is, and the program offers the three over its
  systems.

Not done of what was proposed: the 392 light fittings and each fitting's parts are not in the list (3.1: `build.py` is to ask
each section for an `inventory()`); doors and hatches are not in it; `check.py` does not count the list against the model;
the program is not kept for use without a connection (4); the two questions of section 6 are still the owner's.
