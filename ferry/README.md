# Christina: the ferry, deck by deck

A 3D viewer of the Christina, a 34.5 m car and passenger ferry: turn her, lift her decks apart (Explode), slice her open
along her length (Cut), put her rudders over (Rudder), name every room aboard, and walk through her on foot (Walk
aboard), where walls stop one and doors let one through: <https://nj22az.github.io/ferry/>.

The page has no build step: serve the site root (`python3 -m http.server`) and open `/ferry/`. Her data is built
beforehand (*Her own build*, below) and kept in `data/`.

| File | What |
|---|---|
| `index.html` | The page and its own chrome (title, the *Decks and rooms* panel, the bar with Explode, Cut, View, Walk aboard and Reset view), on the pattern of `/motor-90l/` |
| `app.js` | The viewer: reads the data, lights it, explodes, cuts, selects decks and rooms, moves the parts the data says can be worked, and carries the walker through her |
| `data/ferry.bin.gz` | The model: a JMF1 container (below), 1.55 MB, about 208,000 triangles in 75 meshes (83,400 of them her own: the hull and the fittings of its spaces), six decks, 50 named rooms |
| `data/ferry-atlas.webp` | Every plate, dial and sign aboard on one 2048 px picture |
| `blender/` | Her own build, in Blender: her lines, the builders of each section, the export and the tool that puts the data together (below) |

## What she is, and how far her own build has come

The owner, 9 November 2026: "I want a ferry viewer on my website", "a stand alone ferry viewer that can show the whole
ferry in an exploded view"; "I think you should call this ship the Christina , it's not the same as Minato Maru"; "We
can rebuild Minato maru later from what we learn from building this ship"; "When we have the demo laid out we can refine
it over time and then insert it into the games after"; "Make it look as realistic and pretty as possible , disregard
cartoon style from Johansson World for now".

So the Christina is the lead ship of a new design, and the Minato Maru of Johansson World is rebuilt later from what she
teaches. She is built in Blender, section by section, from the working drawings (Rev C), and each section takes the
place of the Minato Maru's drawing on this page as it is finished.

| Section | State |
|---|---|
| **1. Hull** | **Her own, 10 November 2026** (the owner: "Proceed"). Lines, shell plating in her paint, the plating's inner face, frames, floors, double-bottom girders, the watertight bulkheads at the ends, the tank top forward of the engine room, keel bar and skeg, bilge keels, tail shafts, stern tubes and brackets, two screws, two rudders, the bow thruster in its tunnel, sea chests, anodes, two anchors in their hawse pipes, draught marks, load line, her name |
| **1b. The spaces the hull gives a floor to** | **Her own, 10 November 2026** (the owner, on seeing the hull live: "Lots of things are missing like the steering gear and the propeller shaft"). The steering gear (flat, rudder carriers, tillers, tie bar, two rams, two hydraulic power units, hand pump, rudder-angle transmitter, the stern tubes' header tanks, the emergency fire pump); the shafting inside her (each intermediate shaft from its gearbox's flange through the bulkhead gland, over a plummer block, to the coupling on the tail shaft, and the stern tube's seal); two 6 m³ fresh-water tanks; the bow thruster's motor on the tunnel, its platform and starter; two chain lockers. These lift with the machinery spaces, where the panel lists their rooms |
| **1c. Working rudders** | **10 November 2026** (the owner: "The rudders too , need to work, or be azimuth pods"). The Rudder control puts both rudders over, to 35° either side. Blade, stock and anodes turn; so do the head of the stock and the tiller in the steering-gear room; the tie bar goes with the tillers' ends; each ram swings on its trunnion and its rod runs out or in. Azimuth pods were the owner's alternative: they would be another ship (no shafts, rudders or steering gear), and are not built |
| **On foot, and a better outside view** | **10 November 2026** (the owner: "I want to be able to explore it in fpv on the demo and have better camera controls"). *Walking aboard and the outside view*, below. For it the data changed in two places: the lobby's floor is opened over the two stairs, and the car deck has an underside over the hull's own spaces. |
| **Walls, doors, and the way aft** | **10 November 2026** (the owner: "Do one fix that can impact and make it better", and while it was made: "There needs to be a water tight door that can open to the steering gear"). On foot, walls now stop one and doors let one through. Three hinged watertight doors of her own stand on the centreline, and a walkway with steps goes through the shaft space: from the engine room one walks aft to the steering gear. *Walking aboard* and *The way aft*, below. |
| 2. Exterior above the hull (bulwark fittings, ramp, casings, deckhouses, funnels, mast) | The Minato Maru's drawing |
| 3. Car deck · 4. Engine room and machinery spaces · 5. Bridge · 6. Accommodation, toilets, galley | The Minato Maru's drawing |

Her room notes therefore still speak of the Minato Maru's crew and route. The ferry in the live Johansson World is not
replaced or changed by any of this.

## Where the data comes from

Her hull is made here (`blender/`, below). What is still the Minato Maru's is not: it is exported from the Town's source
(`nj22az/johansson-town`) by two tools,
`tools/ferry-viewer-export.mjs` and `tools/ferry-viewer-export.page.js`, which build the ferry in headless Chromium with
the game's own modules (her plates, dials and signs are drawn on canvases), pose her with the engine room shown, and
write the two files in `data/`:

```bash
node tools/ferry-viewer-export.mjs --out=<this checkout>/ferry/data [--report=<file.json>]
```

A fresh export carries the Minato Maru's hull again: run `blender/assemble.py` after it (with the part file from
`blender/build.py`), which puts the Christina's own hull back in its place.

The export does not edit the game: the Christina's name is painted by the export page alone (it replaces the name where
the game draws it on the bow, the transom and the name boards, and stops if any of those places was missed). The header
of the data records the Town commit she was drawn from (`source.commit`, shown at the foot of the panel), so a stale
picture can be told from the game.

The export also sorts every triangle to its deck. One rule is worth knowing: the engine room's model carries the
deckhead over the machinery spaces (three slabs, drawn in `art/ferry-engine-room/geometry-h1.json`). They are the car
deck's underside, so the export gives them to the car deck (36 triangles: those lying on a slab's face and looking out
of it), and the machinery rooms stand open from above once the car deck is lifted or hidden. Fittings fastened under
the deckhead keep their own tops and stay with their room. The export stops if it finds no slab.

Until the weekend the Town's work on her lives on the branch `claude/festive-rubin-fo8mmp` of this repository, in
`temp/minato-maru/` (never on `main`), the two export tools among it (`town/tools/`, Town commit `f0b2973`).

## Her own build (`blender/`)

Blender 4.0 or later, and Python 3 with numpy for the two tools that need no Blender.

```bash
blender -b -P ferry/blender/build.py -- --part christina-hull.npz --blend christina.blend   # build, export, save the .blend
python3 ferry/blender/assemble.py --part christina-hull.npz                                 # put it into data/ferry.bin.gz
python3 ferry/blender/check.py                                                              # check what the page will read
blender -b christina.blend -P ferry/blender/render.py -- --view stern --out hull.png        # a Cycles still (stern, bow, inside)
```

| File | What |
|---|---|
| `lines.py` | Her lines: the hull form as numbers (no Blender). The form is the Rev C drawings', so the decks drawn there still sit on her |
| `spec.py` | Her hull as specified: paint lines, plating, frames, bulkheads, shaft lines, screws, rudders, thruster, marks, each with its reason |
| `shipyard.py` | The yard's tools: a part (vertices, faces, a colour a face), the materials and how the viewer is to draw each, lettering |
| `hull_shell.py` | The shell: outer plating in four paint zones with every plate shaded a little differently, its inner face 12 mm inside it, the end plates, the bulwarks with the gangway gate, the thruster tunnel cut through the forefoot |
| `hull_structure.py` | Frames at every 0.5 m, plate floors with lightening holes, the centre girder and two side girders a side, six watertight bulkheads with their stiffeners, fore-peak stringers, the tank top |
| `hull_appendages.py` | Keel bar, skeg, bilge keels, tail shafts, stern tubes and their bossings, brackets, screws (true helicoid blades, turning outward), rudders under their headboxes, the thruster, sea chests, anodes |
| `hull_fittings.py` | What stands in the spaces the hull gives a floor to (steering gear, shafting inboard, fresh-water tanks, thruster motor and starter, chain lockers), and the anchors |
| `hull_markings.py` | Draught marks, the load line, her name: each point carried onto the plating it is painted on |
| `build.py` | Builds the sections into collections named after the viewer's parts (`hull`, `machinery`) |
| `export_jmf.py` | Writes every mesh of those collections as it stands in the file, so work done by hand in Blender is exported the same way |
| `assemble.py` | Puts the parts into `data/ferry.bin.gz` (below) |
| `check.py` | Checks the result without Blender (below) |
| `render.py` | A Cycles still of the hull on the slip |

The `.blend` and the part file are not kept in the repository: `build.py` writes them again in five seconds.

**How the two ships are put together (`assemble.py`).** The base is the Town's export, or this page's own file as the
tool last wrote it (the default), so no Town checkout is needed to build her again.
- Every mesh Blender brings is marked `from: "blender"` in its record; meshes so marked in the base are dropped first.
- A part Blender has built replaces the base's own meshes of that part: the Minato Maru's hull went when hers came
  (10,026 triangles; the engine control booth's window, which the export had sorted into the hull, went to the
  machinery spaces it belongs to).
- The tank top goes to the machinery spaces, by the export's own rule (a deck belongs to the rooms that stand on it): it
  lifts with them, and the double bottom is seen under it. So do the fittings of the steering-gear room, the
  fresh-water tanks, the shaft space, the thruster room and the fore peak: the panel lists those rooms under the
  machinery spaces, and a room chosen there must have its fittings in it. The tail shaft, the stern tube and the rudder
  stock below the flat stay with the hull, so in the exploded view each shaft parts at its coupling.
- **The Minato Maru's machinery spaces are fitted inside her shell.** They are square rooms, and where the hull rises
  aft their corners stood through the plating: the engine room's ladder trunk came down as much as 1.03 m under the
  counter on the port side, and the tank top's after corners 0.3 m out through the bilge. 169 points are moved just
  inside the plating, by the shorter way, in or up. This was so in the first look too, and it is an issue of the design
  she is drawn from (not in the Rev C list: the audit does not test rooms against the hull).
- **Stairwells the base has floored over are opened** (`OPENINGS`). The Minato Maru's lobby floor, a 5 mm covering, is
  one slab from side to side and lies over both stairs up from the car deck; the deck plating under it is cut
  correctly. So the stair could not be seen from the lobby, one climbed up through the floor, and there was no way
  down. The covering is cut back to the well on each side (1.26 m by 2.0 m, 7.40 to 9.40 m from the transom). Only
  faces between 6.5015 and 6.5095 m are cut: the stair's top step, the kerb and the feet of the walls round the well lie
  at 6.500 and stay. The 5 mm edge of the covering round the opening is not drawn.
- **A wall of the base is opened where a door of hers stands, and a rail where it bars a doorway** (the same
  `OPENINGS`, which cut a rectangle through any thin plate or bar of the base). The engine room's after wall (6 cm,
  8.44 to 8.50 m) is opened for the watertight door to the shaft space. On the bridge deck a handrail ran along each
  side of the crew's corridor in one length, across the four cabin doorways on that side: it is cut away at each
  (the cut ends are open tubes).
- A part may give a mesh to another of the viewer's parts (`part.group` in the builders). The hull's build gives the
  car deck its plating as seen from below, over the hull's own spaces (below).
- A second run on its own output gives the same file byte for byte.
- `ship.built` in the header names the sections that are her own; the panel's last paragraph is written from it.

**The shaft lines.** Each shaft runs straight from its gearbox's output flange in the engine room (1.55 m off the
centreline, 1.5 m above the keel, 8.85 m from the transom, as the Rev C engine room has it) to its screw, falling 6° aft,
and leaves the hull 6.5 m from the transom. In the design she is drawn from the shaft was drawn only outside the hull,
on a line 0.36 m under the gearbox flanges and 5 cm outboard of them: it never met its engine. That is a third issue for
the Town at the weekend (with the two under *How the two ships are put together*).

**Six things worth knowing before changing the build.**
- *Plating is flat between its own points; structure follows her lines.* Frames and floors stand 12 mm inside the lines,
  so the plating must keep closer to the lines than that or the structure comes out through it. The rows of plating
  are therefore set by girth and turning together (`lines.girth_psis`: closer round the turn of the bilge), which keeps
  the plating within 3.4 mm of her lines everywhere (it was 15.6 mm at the stern with even spacing, and frames showed
  through there). `build.py` measures every corner of the structure against the plating as drawn and stops if one comes
  within 4 mm (the nearest is 5.2 mm).
- *The two faces of the plating.* The inner face is made from the outer one, triangle for triangle, each corner moved
  12 mm inward square to the plating. Drawn as a sheet of its own (at every other station, with its own rows) it came
  out through the outer plating where she twists, under the counter and at the forefoot: the page hides that (it shows
  one side of each face), a Cycles still does not. `build.py` looks outward from 89,584 points of the inner face and
  stops if the plating is not there (it is never nearer than 10.4 mm).
- *Solids look outward.* A solid whose faces look inward is drawn inside-out: the page shows its far inner wall and it
  reads as glass. The yard's round bar (`Part.tube`) was so in every direction until 10 November (the steering rams
  showed it). `build.py` now tries the bar in seven directions and measures the volume of each object made only of
  closed solids, and stops if one is inside-out.
- *Plates behind plating.* A floor or a frame stands square to the shell 12 mm behind it. Seen exactly edge-on a plate's
  depth is not to be trusted, and it showed through the plating as dotted hairlines along every frame. Plates
  (`Primer plate`) are therefore drawn a hair further away (`offset: [1, 1]`), the more so the more edge-on they are.
- *Marks in front of plating.* Lettering is flat geometry 4 mm off the plating, drawn a hair nearer (`offset: [-2, -4]`).
  Cut open, such a mark keeps its one face (`app.js`, `setCut`), or her name reads mirrored inside the transom.
- *Where the Minato Maru's rooms still are, the hull keeps clear of them:* frames are 75 mm angles inside the 14 cm
  between the moulded line and the rooms' linings, and the bulkheads at frames 17 and 52 stand 8 cm outside the rooms'
  own end walls. When the machinery spaces are rebuilt, these become ordinary web frames and bulkheads.

## Walking aboard and the outside view

The owner, 10 November 2026: "I want to be able to explore it in fpv on the demo and have better camera controls".

**The outside view.** Scrolling or pinching zooms toward the pointer, not toward the middle. A double-click or
double-tap looks closer at what is under it and makes it the point she turns about (the first tap still names the
room). *View* looks at her from the bow quarter, either side, ahead, astern, above or below. The arrow keys turn and
tip her, + and − zoom, Home resets. Close to, the near plane comes in with the distance (0.4 m from afar, 0.05 m at the
closest), so one can look at a fitting from 0.6 m.

**On foot.** *Walk aboard* puts the eye 1.6 m over the deck with a 68° lens. The walk begins in the room that is
chosen in the panel, else at the after end of the vehicle lanes, looking forward. She is whole while one walks: every
deck shown, nothing lifted and nothing cut; the panel, Explode, Cut, View and Reset view are put away, and the line under her name says how
to walk.

| | Keys and mouse | Touch |
|---|---|---|
| Walk | W A S D, or the arrow keys (up and down walk, left and right turn) | The thumb-stick, lower left |
| Look round | Drag on the model | Drag anywhere else, with another finger while walking if wanted |
| Faster | Shift (3.8 m/s, a walk is 1.5 m/s) | Push the stick to its edge |
| Deck above, deck below | E and Q, or Page Up and Page Down, or the two buttons | The two buttons |
| Leave | Esc, or the button | The button |

The Rudder slider stays: one can stand in the steering-gear room and put the rudders over.

**How the walker finds its way** (`app.js`, *walking aboard*). There is no separate collision model: the walker reads
the same triangles the page draws. At start every triangle of what stands still is kept by 0.5 m squares of the plan:
as a floor if it faces up, a deckhead if it faces down, a wall if it stands upright (52,600, 53,800 and 126,000 of
them; glass is a wall but not a floor).
- The feet stand on the highest floor under them within a step. A step is 0.3 m, up or down, and no more: stairs carry
  one from deck to deck (their risers are 0.2 m), a seat is not climbed, and a deck's edge holds one back. Nobody
  falls.
- A gap of up to 0.15 m in the floor is stepped across: the outside stairs to the bridge wings leave 6 cm between the
  top tread and the landing.
- A slot narrower than the body is stood across, not in: the steering flat is laid in plates with 1 to 2 cm between
  them, and a foot on a seam would otherwise stand on the hull plating 24 cm below.
- What stands on a deck stops the walker: anything whose top lies between 0.42 m and 1.7 m over the feet, within
  0.18 m of them (furniture, machinery, rails, the bulwark, the capstan, the barrier across the bow). 0.42 m is two
  treads of a stair, which a body on a stair has beside its feet. What only hangs there, with 1.25 m or more under
  it (the head of a doorway), is stooped under.
- **Walls stop the walker.** Each wall triangle near the body is cut at nine heights between 0.5 m and 1.6 m over the
  feet, and the line it leaves in the plan must stay 0.18 m from the body's middle. So bulkheads, linings, windows,
  casings, the mast and lockers are solid, and the eye never comes nearer a wall than the lens can see.
- **Doors let one through.** The other ship's doors are leaves that do not open. They are found by their shape (an
  upright slab 0.5 to 1.05 m wide, 1.6 to 2.12 m high, its faces 1 to 6 cm apart): 23 of them, 15 hung on a wall with
  no opening behind them; a door's own leaf, frame and handle are no wall, and standing in its doorway the
  wall it hangs in does not count. One walks through the leaf. Her own watertight doors swing open (below).
- Stopped by the wall beside a doorway one was making for, one is drawn to its middle.
- Under a deckhead, beam or pipe lower than the walker the eye comes down, keeping 0.12 m under it; through a low
  doorway it comes down to 0.2 m under the lowest height at which the wall is met (one stoops). Where there is less
  than 1.1 m one does not go.
- The way is gone in strides of 2 cm, so a rail is never stepped over, and by the clock, so the pace does not hang on
  how fast a device draws (a pause of more than a quarter of a second is walked as a quarter).
- The deck keys put one down over the same spot on the next deck where one can stand there, else at the nearest such
  place. A walk never begins hemmed in: the start is looked for outward from a room's middle until there is 0.9 m to
  walk from it.

What still does not stop one, and which rooms have no door, is in *Known limits*.

**The way aft, and her watertight doors** (`blender/spec.py`: `WT_DOORS`, `WALKWAY`; `hull_fittings.py`: `way_aft`).
The owner, 10 November 2026: "There needs to be a water tight door that can open to the steering gear". The
steering-gear room had no way in. Now one goes aft from the engine room on the centreline:
- through a watertight door in the engine room's after bulkhead (8.42 m from the transom), which opens forward;
- along a platform at the level of the engine room's floor plates and up six treads (0.18 m each, 0.8 m wide between
  two rails) to a flat at the level of the steering flat, 1.27 m higher, clear over the floors of her bottom as she
  rises aft;
- through the door at frame 10 (5.0 m), which opens aft, and along the gangway between the two fresh-water tanks;
- through the door to the steering gear (2.6 m), which opens forward into that gangway.

A door is 0.60 m by 1.40 m clear over a 0.20 m sill, its corners rounded 0.10 m: a frame of flat bar standing 5 cm
proud of the bulkhead each side, a 20 mm leaf with a pressed panel, six dogs worked by a handwheel, two hinges to
port. The bulkheads are cut for them (`hull_structure.py`), and so is the other ship's engine-room wall
(`assemble.py`, `OPENINGS`), which the first door's frame lines. One steps over the sill and stoops under the head: the
eye comes down to 1.28 m in the doorway. **The doors open by themselves** to whoever comes within 2.4 m on foot, in
0.8 s, and shut again behind. From outside, a tap on a door opens it, and another shuts it. They have no slider:
the file marks them `auto` (*The file format*).

**The car deck from below.** The Minato Maru's car deck is drawn from above only. Seen from the hull's own spaces one
looked up through it into the car deck. `hull_structure.py` now builds the deck's plating as it is seen from below,
abaft the engine room and forward of the electrical workshop (272 triangles, at 2.07 m, where the bulkheads and the
frames end); the machinery spaces between have deckheads of their own. It is one face, looking down, and part of the
car deck, not of the hull: it lifts away with the deck when she is taken apart, and is never a lid over the open hull.

**For checks.** `window.__ferry` also carries `enterWalk`, `leaveWalk`, `hopDeck(±1)`, `walkTo(x, z, yaw, pitch,
level)`, `hold(code, on)`, `walkFor(seconds)` (the walk of so many seconds gone at once, 60 steps a second, whatever
the machine can draw), `floorAt`, `footing`, `roomFor`, `headroom`, `wallClear`, `work(id, open)` (leave a door open or shut, as a tap
would), `workAuto(seconds)`, `spaces`, `lookFrom(name)` and `focusAt(x, y)`; `state.walk` says where the walker
stands, `state.inputs` how far each door stands open.

## The file format (JMF1)

`ferry.bin.gz` is gzip over: the four bytes `JMF1`, a 32-bit little-endian header length, a JSON header (padded with
spaces to a multiple of four bytes), then one binary block.

- Header: `format`, `ship` (name, `drawnFrom`, length, beam, depth, draft, gross tons), `axes`, `bounds`, `atlas`
  (`file`, `size`), `materials`, `views[]` (each with `groups[]`: one per deck, with its `id`, `name`, `level`, its
  lift in the exploded view (`explode`), its `meshes[]` and its `spaces[]`), `source`.
- A mesh record gives byte offsets into the block: `pos` (Uint16 × 3, quantised over `bounds`), `nor` (Int8 × 3), `col`
  (sRGB Uint8 × 3), `uv` (Uint16 × 2, into the atlas, only on textured meshes) and `idx` (Uint16, or Uint32 when `wide`).
  `from: "blender"` marks a mesh of her own build; the others are the Town's export.
- `ship.built[]` lists the sections that are her own (`part`, `section`, `date`); `source.blender` names the builder.
- **Parts that move.** `inputs[]` are what can be worked on the page: `id`, `name`, `min`, `max`, `step`, `unit`, and
  how a setting is said (`below`, `above`, `rest`: "Rudder 20° to port", "Rudder amidships"). The page makes a slider
  for each. `movers[]` are the motions: `id`, `input`, `axis`, `pivot`, and a `kind`:
  `turn` (the part turns about the pivot by the input's angle), `carry` (it keeps its heading and goes with `point` as
  that turns about the pivot: the tie bar), `aim` (it swings about `anchor` to keep pointing at `pin`, which turns about
  the pivot: a ram's cylinder; with `extend` it also runs along that line by as much as the distance has changed: the
  rod). A mesh record's `mover` names the motion it takes part in; the page puts the meshes of one motion in one group
  inside their deck and moves the group. The rudder's angle is negative to port and positive to starboard, as a helm
  indicator shows it; a positive angle turns about the upright axis so that the blade's after edge goes to starboard.
  In Blender a moving part is an object with the custom property `mover` (`Part(..., mover='rudder-p')`), and
  `hull_fittings.motion()` describes the motions; `build.py` stops if a part names a motion that is not described, or
  a motion moves nothing.
- A space record is a room: `id`, `name`, `text`, `why`, and its box `min`, `max`.
- Axes: metres; the bow is +z, port is +x, y is up with its origin on the laden waterline (keel −1.9, car deck 2.1,
  passenger deck 6.5, bridge deck 9.1, compass deck 11.5).

The decks, bottom to top: `hull`, `machinery`, `car`, `passenger`, `bridge`, `top`.

An input may be worked by the page itself and not by a slider: `"auto": "near"` with `at` (a point), `reach` (metres)
and `normal` (the way through it). Such an input opens (goes to `max`) for a walker within `reach` of `at`, shuts (goes
to `min`) behind them, and answers a tap from outside; `normal` tells the walker which way the doorway lies. A mover's
`ratio` (1 when absent) is the turn it makes for each degree of its input: -1 for a door that opens the other way.

## The look this page applies

The game's cartoon look does not bind this page. `app.js` keeps the geometry and colours it reads and changes only how
they are lit:

- ACES tone mapping, a sky shader as the environment (so paint and glass have something to reflect), one sun with soft
  shadows and a shadow-only floor over the page's backdrop.
- Opaque textured unlit materials stay unlit: they are screens, dials and signs, and must read as drawn.
- The game's other unlit materials (lamps and painted markings) are made lit, so they sit in the same light as the ship.
- Transparent materials become glass (a little tinted, reflective).
- The light that comes up from the ground is as bright as a pale floor gives (since 10 November: `ground` in the sky
  shader, 0.36 before, 0.60 now), so the shafts, screws and rudders under her can be read. Seen from above she looks as
  she did.
- A material's `offset` is a depth offset: paint laid on plating is drawn a hair nearer, plates behind plating a hair
  further (see *Her own build*).

## Coupling

- Three.js r170 comes from `/motor-90l/vendor/` (`three.module.min.js` through the import map, and `OrbitControls.js`).
  Moving or upgrading that folder changes this page too.
- The page uses its own chrome, not the site's `shared.js` navigation, as `/motor-90l/` does.
- `window.__ferry` (`setExplode`, `setCut`, `home`, `select`, `showDeck`, `setPanel`, `identify`, `state`, and `look`:
  the renderer, scene, camera, controls, sun and `redraw()`) is there for checks and screenshots.
- **The homepage card.** The owner, 9 November 2026: "Make it one of my projects , on the website". She is the `ferry`
  entry of `CONFIG.projectExplorer` in `/config.js` (second card, under Explore), drawn by
  `/assets/js/project-explorer.js`; `CONFIG.projects` has her too. The homepage never loads the 3D model (its design
  review forbids it): the card shows a picture, `/assets/images/ferry/christina-card.webp`. It lives under `assets/`,
  not here, because the homepage review's sparse checkout does not include `ferry/`.
- **Retake the card picture when the model changes.** It is this page's cut view from the starboard side with the
  chrome hidden and the lens centred (`camera.clearViewOffset()`, aspect 1200 : 630): Cut 0.5, the camera set through
  `window.__ferry.look` with its target at (0, 6.3, 1.4) and the eye 50 m from it toward (−1, 0.2, 0.3), shot at
  1200 × 630 at scale 2 and reduced to a 1200 × 630 WebP (quality 84). Retaken on 10 November with her own hull. The
  counts in `tools/office-home/review.browser.mjs` (7 cards; Explore 2, Create 3, Learn 2) follow
  `CONFIG.projectExplorer`.

## Known limits

Of her own hull (section 1):
- Her lines are the Rev C form unchanged: a blunt bow closed by a flat plate under the ramp, and a hard corner where
  the transom meets the plating. Fairing her (a rounded stem, a radius at the transom) waits for the sections that sit
  on those lines, since the Minato Maru's decks must still fit her.
- The hull ends at the deck edge and the bulwark's outer plating. The bulwark's inner face, its cap rail and stays, the
  rubbing strake, the freeing ports and the car deck's plating and beams are still the Minato Maru's (section 2 and 3).
- The car deck's underside over the hull's own spaces is plain plating: no beams, girders or pillars under it yet, and
  no hatch drawn in it (from below it closes the places where the car deck has one).
- The spaces the hull gives a floor to have their main fittings and nothing else: no ladders or hatches into them
  from the car deck (the steering-gear room, the tanks and the shaft space are entered through the watertight doors
  from the engine room), no lighting, no bilge, ballast or fire-main piping, no cable trays; the fore peak has its chain lockers but no ballast
  tank; the shaft space has its walkway and no other floor plates. The steering flat gives 1.80 m under the
  car deck, not the 2.0 m of the arrangement, whose floor lay 6 cm over the keel plate.
- The rudders are worked by the page's slider only: nothing steers her, the screws do not turn, and the hydraulic pipes
  end beside the rams without the hoses that would let the cylinders swing (they swing up to 8°).
- The anchors are simple: a shank, a head and two flukes, without the cable, the shackle or the pipe through to the
  windlass, which is still the Minato Maru's.
- Inside the machinery spaces the frames are hidden behind the Minato Maru's linings, and there are no watertight
  bulkheads of her own at frames 28, 38 and 45, only the rooms' walls.
- Plating seams and welds are not drawn: a plate is told from its neighbour by a slightly different shade.
- The port of registry on her transom is still MINATO, until the owner names hers.

Of walking aboard:
- **Five rooms have no way in on foot**: the void, the bow-thruster room and the fore peak (closed compartments of the
  hull, with no hatch or ladder drawn), the starboard funnel casing, and the bow ramp beyond its barrier. They are
  entered by choosing them in the panel before Walk aboard; from inside one cannot walk out.
- Ladders are not climbed, so the decks fall into three groups joined only by the deck keys: the car deck, passenger
  deck and bridge deck (joined by stairs: 31 of the 46 rooms are reached on foot from where the walk begins); the
  machinery spaces with the way aft; the compass deck. With the keys 41 rooms are reached.
- **The other ship's doors do not swing.** One walks through the shut leaf, and through the wall behind it where the
  drawing has no opening there. A door is known by its shape only: a door drawn in several pieces, or a leaf more than
  6 cm thick, would be a wall, and a wall panel shaped like a door would let one through.
- Just inside the steering-gear door the tie bar lies across the way, 0.46 m over the flat. It moves with the
  rudders, and what moves is not in the walker's way: one walks through it.
- The crew stair from the saloon to the wheelhouse is not passed: the bar across its top is drawn closed, and under
  the edge of the opening in the deckhead there is 1.55 m over the fourth tread. The two outside stairs to the bridge
  wings do the same journey.
- In the hull's spaces without a floor of their own (the shaft space beside its walkway, the void, the fore peak) the
  walker stands on the structure: the floors' top edges and the stringers.
- Along a wall that lies askew to her length (her sides at the ends) the walker stops where it meets it: it slides
  along walls that run fore and aft or athwartships only.
- No footsteps, no head-bob, no light of its own: the spaces are lit as the outside view lights them.
- Measured on this machine only, which draws in software (about one picture a second with the eye inside her): the
  frame rate while walking on a phone or a laptop is not measured.

Of the page and of what is still the Minato Maru's:
- The cut faces are hollow: plating is not capped where it is sliced.
- In the exploded view the stack is framed small, and two small dark fittings float beside the car deck.
- A pale translucent panel shows amidships at the car-deck opening.
- When a room is framed, the title's paragraph can lie over the model on a desktop screen.
- The room notes speak of the Minato Maru's crew and route.
- No ambient occlusion and no sea yet: she stands in a studio.
- The Rev C working drawings list 18 open issues in the design she is drawn from (10 clashes, 8 to check); those above
  the hull and in the machinery spaces are in this model too. The machinery spaces' corners standing through the hull
  (above) are not in that list.

## Checks actually run

### 10 November 2026, last of all: walls, doors and the way aft

Headless Chromium with software rendering, as before. 49 checks, all passed, no console errors: the 42 below, and
- in the steering-gear room, walking into the bulkhead 0.9 m to port of the door: stopped 0.18 m short of it;
- from the engine room aft for 9 s, begun 0.25 m off the doors' line: through three watertight doors and up the steps
  to the steering flat (0.27 m, 1.33 m from the transom); the steering-gear door stands open at 90°, the engine
  room's has shut behind;
- on the steering-gear door's sill: 0.20 m over the flat, the eye stooped to 1.28 m;
- and forward again to the engine room;
- from the crew's corridor through an open doorway into a cabin; where there is no doorway the corridor's wall and
  its handrail stop one;
- from outside, a door left open as a tap leaves it: 45° after 0.4 s, 90° at rest.

Also:
- **Every room** begun on foot (all 50): a place to stand in each, with 0.9 m or more to walk from it.
- **Where one can get to** (the flood, by the walker's own rules, walls and doors among them): on foot from where the
  walk begins 207 m² of the car deck, 79 m² of the passenger deck and 52 m² of the bridge deck, 31 of the 46 rooms;
  with the deck keys 41 rooms. Before the corridor's handrails were cut at the doorways the seven crew rooms on the
  bridge deck could not be entered.
- **Looked at, on foot**: the engine room's door shut, from 2.6 m; the steering-gear door open, from the gangway
  between the tanks, the steering gear seen through it.
- **The data**: `build.py`, 83,504 triangles, 10 motions, its checks unchanged (plating 10.4 mm, structure 5.2 mm,
  solids looking outward). `assemble.py` on the Town's export and again on its own output: the same file.
  `check.py --town …`: all passed.
- **Found and put right on the way**: a door's frame, whose top is lower than the walker, stopped the walker as
  furniture would (what only hangs is now stooped under); a stride of no length counted as a stride, so one stood
  still at a wall instead of being drawn to the doorway; on the steering flat's centre seam there was nothing under
  the feet at the door's sill; a door on its way made the shadows be drawn again at every picture (now once, when it
  has come to rest).
- **Not run**: a phone, a tablet or a laptop with a graphics card; a tap on a door in the outside view with a real
  pointer (the door's answer to it was run through `window.__ferry.work`); a screen reader.

### 10 November 2026, last: walking aboard and the outside view

All in headless Chromium with software rendering, from `python3 -m http.server` at the site root. 42 checks, all
passed, no console errors:
- **The outside view** (1440 × 900): each *View*; double-click looks closer (83.1 m to 35.9 m, three more to 3.6 m,
  the near plane drawn in to 0.23 m); the wheel zooms; an arrow key turns; Home resets.
- **On foot** (900 × 600; walks gone with `walkFor`, one with the real W key and the real clock): the walk begins on
  the car deck at 2.11 m, 14.1 m from the transom, with Cut and Explode closed and the outside view's controls put
  away; W for 2 s is 3.00 m; a run forward ends at the barrier across the bow; sideways ends 0.25 m inside her side,
  port and starboard; walking into the capstan stops 0.2 m short of it; a drag turns the head; both stairs from the car
  deck to the lobby, up and down again; both outside stairs to the bridge wings, up and down again; the lobby's edge
  holds one back from the stairwell; the deck keys from the compass deck down to the machinery spaces and back; E; Esc
  restores the lens and the panel; with the wheelhouse chosen the walk begins there; the steering-gear room is begun on
  its flat at 0.27 m with 1.80 m of headroom.
- **By touch** (390 × 844, real touch events): the thumb-stick stands clear above the bar; held at half its reach it
  walks 2.16 m in 2 s, at 0.86 of its reach 5.62 m; a second finger dragged across the model turns the head while the
  first walks; lifting the thumb stops; Deck above and Leave by tap.
- **Every room** (`select` then Walk aboard, all 50): a place to stand was found in each, and from 49 of them one can
  walk 0.9 m or more (the engine control booth gives 0.53 m). The walk begun in the crew stair stands in the passage
  beside the stair; one begun in a double-bottom tank stands in the room over it.
- **Where one can get to** (a flood over 5 cm squares by the walker's own rules): from the start, on foot, 247 m² of
  the car deck, 97 m² of the passenger deck and 81 m² of the bridge deck; with the deck keys also 101 m² of the
  machinery spaces and 102 m² of the compass deck.
- **Looked at, on foot**: the car deck from the start, the lobby's stairwell from the landing (open, the stair seen
  going down), up the stair from the car deck, the wheelhouse, the engine room, the steering-gear room (flat, tillers,
  tie bar, the forward bulkhead and the deckhead over it), the crew stair from its top and its foot. Outside: the
  page's eleven standard pictures (desktop, dark, exploded, cut, hull only, two rooms, four on the phone); in the
  exploded view the hull stands open as before.
- **The data**: `build.py`, 78,630 triangles, its checks unchanged (plating 10.4 mm, structure 5.2 mm, solids looking
  outward, 7 motions). `assemble.py` on the Town's export and again on its own output: the same file byte for byte.
  `check.py --town …`: all passed.
- **Found and put right on the way**: the lobby floor over the stairs and the car deck without an underside (above);
  floor plates wound face down were not stood on; the first cut of the lobby floor also took the stair's top step and
  the feet of the walls (the level is now 8 mm wide); a start on a plate seam stood on the hull plating; the walk
  began facing a blank bulkhead (it begins in the vehicle lanes now); the hint lay behind the bar.
- **Not run**: a phone, a tablet or a laptop with a graphics card (frame rate, the feel of the stick, Safari); a
  screen reader.

### 10 November 2026, later still: working rudders

- The moving parts were measured on the page at 0° and at 35° either way (the box of each motion's group, read back
  through `window.__ferry.look`): to starboard the blades' after edges go to starboard and the tillers to port, the tie
  bar goes 0.36 m across and 0.11 m aft with them, the port ram's rod runs 0.22 m in and the starboard one 0.26 m out,
  and each rod stays inside its cylinder at both ends of its stroke. To port, the mirror of it.
- Looked at: the rudders hard over from astern and from the quarter, the steering gear amidships and hard over each way
  from above, the bar with its third slider on desktop and at 390 × 844, the exploded ship with the rudders over. No
  console errors.
- Found and put right on the way: the power units and the hand pump stood in the tie bar's path (they now stand aft of
  the stocks); every plain round bar was inside-out (above).
- `build.py`: 7 motions, each with its parts; the earlier checks unchanged. `check.py --town …`: all passed.
  `assemble.py` twice: the same file.

### 10 November 2026, later: published, and the fittings of the hull's spaces

- **Published** on the owner's "Push go main": `main` `d6d9e68` (the hull). Eight live files compared with the tree
  pushed, byte for byte, 65 seconds after the push: all matched.
- The fittings (section 1b): `check.py --town …` 23 checks, all passed (every mesh of the machinery spaces, the new
  fittings among them, is inside the shell); the build's two checks unchanged (10.4 mm, 5.2 mm); `assemble.py` twice,
  the same file.
- Headless Chromium as before: the steering gear from above and in the cut, the shafting from above and in the cut
  (engine, gearbox, bulkhead gland, plummer block, coupling, seal, stern tube, screw in one line), the fresh-water
  tanks, the thruster room, an anchor, the stern from below, and the steering-gear room chosen from the panel (it now
  frames its gear). No console errors. Found by looking and put right: the stern-tube bossings showed as antifouled
  castings inside the shaft space; the floor plates mirrored the sky.

### 10 November 2026: her own hull

- `python3 ferry/blender/check.py --town <the Town's export, commit f0b2973>`: 19 checks, all passed (23 since the fittings). Among them: her
  lines pass through all 1,750 port loft points of the Rev C hull (furthest 0.30 mm, the file's own rounding); they
  displace 368 t at 1.9 m; no point of her frames, floors, girders, bulkheads or stringers is outside the moulded shell;
  none of the fitted machinery spaces is. This check found a fault while she was being built (the face bars of the
  forward floors stood up to 48 mm out through the bow plating) and it was put right.
- `build.py`'s own two checks (above), which stop the build: the plating's two faces (89,584 points, never nearer than
  10.4 mm, none outside) and the structure behind the plating (never nearer than 5.2 mm, no corner through it). Each was
  written after a Cycles still showed the fault, and each was seen to fail on the build as it was before the fix (32
  points of the inner face outside the plating; 73 corners of structure through it).
- `assemble.py` run twice, on the Town's export and then on its own output: the same file byte for byte (`cmp`).
- `node --input-type=module --check < ferry/app.js`.
- Headless Chromium (software rendering, SwiftShader) at 1440 × 900 and at 390 × 844 with touch, light and dark: closed
  ship, exploded, cut, the hull alone, the engine room and the double bottom chosen from the panel, the panel open on
  the phone size. No console errors or failed requests in any of them. Looked at closely besides: the stern gear from
  below on both quarters, the bow thruster's mouth, the bilge with its keel, sea chest and anodes, the draught marks at
  all three stations, the load line, her name on both bows and the transom, the gangway gate against the car deck's own
  gate posts, the hull from inside (fore, amidships, aft), and the ship cut along the centreline at the engine room, the
  ladder trunk, the bow and the stern.
- Three faults found by looking and put right: dotted hairlines along every frame under her bottom (plates edge-on
  behind the plating: the depth offset above; a probe of 1,039 pixels that differed with the floors drawn went to
  none); her name mirrored inside the transom when she is cut open; the transom's edge cut coarser than the plating it
  meets.
- Two Cycles stills in Blender 4.0.2 (64 samples, 1920 × 1080): the stern on the slip and the open hull from above. The
  stern still showed two faults the page hides (it draws one side of each face): the inner face of the plating, and
  then frames and floors, coming out through the plating under the counter. Both are put right and now checked by the
  build; the still was rendered again after each.
- The homepage card's picture retaken from the new model at the same framing; the homepage's own files are unchanged,
  so its design review was not run again.

Not checked: a real phone, a real GPU (frame rate is unknown; the model grew from 134,000 to 202,000 triangles and the
file from 1.15 to 1.52 MB), an actual finger tap on a room, Safari and Firefox. Whether the depth offset on the plates
behaves the same on a real GPU as in software rendering is not known: if hairlines show under her bottom on a phone,
raise `offset` on `Primer plate` in `blender/shipyard.py`.

### 9 November 2026: the first look

- `node --input-type=module --check < ferry/app.js`.
- Headless Chromium (software rendering, SwiftShader) at 1440 × 900 and at 390 × 844 with touch: closed ship, exploded,
  cut, decks hidden, rooms selected (wheelhouse, engine room, saloon), the machinery deck alone, the panel open on the
  phone size, light and dark colour schemes. No console errors or failed requests in any of them.
- The cut view again after one fix: a picture (her name, a sign, a dial) keeps its one face when she is cut open, so her
  name no longer shows mirrored on the inside of the hull.
- The machinery rooms open from above (data from Town commit `f0b2973`): the export's report names the three slabs and
  36 triangles moved to the car deck; pictures of the machinery deck alone from above (light and dark), the exploded
  ship, the closed ship, the cut view, and the engine room and the auxiliary room chosen from the panel at 1440 × 900
  and the engine room at 390 × 844. No console errors.
- The homepage card: `node --check config.js`, `node --check assets/js/project-explorer.js`, and the homepage design
  review (`tools/office-home/review.browser.mjs`) run locally in headless Chromium at its six sizes: passed, with 7
  cards and a desktop project grid of 2536 px against its 3062 px limit (80 % of the baseline's height). The card itself
  was looked at on desktop, at 390 px and 320 px wide, light and dark.
