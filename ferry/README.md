# Chisum: the ferry, deck by deck

A 3D viewer of the Chisum, a 68 m car and passenger ferry: turn her, lift her decks apart (Explode), slice her open
along her length (Cut), put her rudders over (Rudder), lower her stern ramp (Stern ramp), name every room aboard, walk
through her on foot (Walk aboard), where walls stop one, doors let one through, stairs are climbed, and every room is
reached on foot, and see what every fitting on her bridge is, what feeds it and what it talks to (tap it, or open
*Systems*): <https://nj22az.github.io/ferry/>.

The page has no build step: serve the site root (`python3 -m http.server`) and open `/ferry/`. Her data is built
beforehand (`blender/make.sh`, below) and kept in `data/`.

| File | What |
|---|---|
| `index.html` | The page and its own chrome (title, the *Decks and rooms* panel, the bar with Explode, Cut, Rudder, Stern ramp, View, Walk aboard and Reset view), on the pattern of `/motor-90l/` |
| `app.js` | The viewer: reads the data, lights it, explodes, cuts, selects decks and rooms, moves the parts the data says can be worked, and carries the walker through her |
| `systems.js` | Her systems on the page: the card that says what a fitting is, the *Systems* list, and what is drawn over the model for a board, a circuit, a net or a pipe |
| `data/ferry.bin.gz` | The model: a JMF1 container (below), 1.77 MB, about 237,100 triangles, six parts, 93 named rooms, 16 stairs, 41 moving parts. Everything in it is her own, built in Blender |
| `data/chisum-atlas.webp` | Her pictures: what her screens show, her dial faces, panel faces, board doors, chart and flags (2048 × 3008, drawn by `blender/atlas.py`) |
| `data/systems.json` | Her component register as the page reads it (167 components; written by `systems/register.py`) |
| `systems/` | Her systems as designed: every component with its supply, circuit, nets and pipes; the tool that routes, sizes and checks them ([README](systems/README.md)) |
| `blender/` | Her build, in Blender: the arrangement (`ga.py`), her lines (`lines.py`), the yard's specification (`spec.py`), a builder for each section, the export, the tool that puts the data together, the checks, and `make.sh`, which runs all of it in order |
| `checks/*.cjs` | The page's own checks, in a browser: the bridge and the register, doors and the stern ramp, the stairs, quick travel, zoom on foot, offline (*Checks actually run*) |
| `yard/` | Johansson Shipyard's paperwork for her as a newbuilding: what the simulation of a classed build is and is not, the document register, the yard's standards (stairs, supports, no z-fighting), its drawings (the general arrangement, the stern ramp and after end), class's comment sheets, and the calculations ([README](yard/README.md)) |

## The Chisum at 68 m: her bare ship (11 November 2026)

The owner, 11 November 2026: "I think the ship needs to be longer maybe 65-70 meters". At the first Chisum's beam of
8.4 m and depth of 4.0 m she could not be stretched to that; asked, the owner chose **"Rebuild the Chisum at 68 m"**, in
place: a new hull, the other ship's interiors gone at once, the page showing a bare new ship with her bridge until each
deck is fitted. Then: "How about making the ship longer ? As we said". This section is that ship, as built.

**What she is.** 68.4 m over all, 13.6 m beam, 5.0 m to the car deck, 3.2 m draught; her lines displace 1,745 t (block
coefficient 0.62). Drive-through, four lanes of 2.6 m with 4.3 m clear; a passenger deck, a bridge deck with the crew's
cabins, a top deck with the owner's emergency generator room; eight watertight bulkheads. `blender/ga.py` is her general
arrangement (revision C: 93 spaces on five plans, each with what it is for), and `python3 ferry/blender/ga.py` checks it
against itself and against her lines. `yard/drawings/JS1-102-general-arrangement.svg` is drawn from it. It is still a
proposal for the owner's approval, with eight questions on the sheet.

**She is a ship of her own, beside the Minato Maru.** The owner, 11 November 2026, after she was published: "I'm thinking
the Minato Maru can be simplified , this is an additional ship". So she is no longer the lead ship from which the Minato
Maru is to be rebuilt (the plan of 9 November, further down this file): the realistic engineering lives in her, and the
Minato Maru stays Johansson World's own ferry and may be made simpler. What of the Minato Maru can go, what stays and
what the two ships can share is sorted in `temp/minato-maru/SIMPLIFY.md` (on the work branch; nothing is removed yet).

**What is built, all of it hers** (nothing of the Minato Maru or of the first Chisum's borrowed interiors is in the file):

| | |
|---|---|
| Hull | From her own lines (`lines.py`): shell plating in her paint with its inner face, frames and web frames, floors, girders, the eight bulkheads with their stiffeners, tank top, keel plate and stem bar, skeg, bilge keels, two shafts with brackets, screws and rudders, the bow thruster in its tunnel, sea chests, anodes, anchors, draught marks, load line, her name and the line's |
| Below the car deck | The steering gear (it works with the Rudder control), the shafting inboard, six watertight doors on the centreline, the flats and steps between them, the thruster's motor, the chain lockers. The engine rooms are otherwise bare |
| Steel | `steel.py` builds every deck, casing, house and room of the arrangement as bare steel: walls with their doorways and windows, decks with their wells and hatches, beams under them, rails, the two funnels, the crew's stair trunk. It is the first builder written to the yard's working instruction against z-fighting (below) |
| Stairs | Sixteen, to the yard's standard `JSY-STD-401`: four main stairs, the crew's stair from the machinery flat to the bridge deck, the stair into the wheelhouse, the ladders outside and in the machinery spaces. Every one is walked up and down by `checks/stairs.cjs` |
| The navigation bridge | The first Chisum's wheelhouse, wings, compass deck and mast with all that is fitted in them, landed whole on the bridge deck 50 m from the transom (`bridge_place.py`), its wings carried out to her side |
| The emergency generator room | To the owner's drawing, in the house on the top deck |
| The drinks machine | In the saloon, at its after end to port |
| The stern ramp | The stern door is the ramp (below) |

**Not built.** Her outfit: the machinery, the saloon, the cabins, the galley, lane marks and lashing points, mooring gear,
boats. The bow visor is not cut and the inner bow door stands shut. The page's note under the list of decks says so.

### The stern ramp, its hydraulics and the lights of the after end

The owner, 11 November 2026: "How do you get on to cargo deck from this ship ? Aft ramp ?"; "It needs a hydraulic ramp
what's a slider"; "And lights , draw the aft in cad".

- **The ramp** is the stern door: one leaf 6.36 m wide in the 6.40 by 4.30 m opening, hinged on the sill. The *Stern
  ramp* control in the bar lowers it (the slider is only the page's handle on it): level at 90°, and to 100° for a quay
  that lies lower.
- **Two hydraulic cylinders** work it, one each side of the roadway: foot pin on a yellow pedestal on the car deck 3.2 m
  inside the stern, rod pin on a lug on the ramp. They swing and their rods run out as the ramp goes down: 3.04 m
  between the pins raised, 4.26 m level, 4.33 m at its lowest.
- **Lights**: the sternlight (white, 135° astern; component NLT-06 of the register, which had no place until now) on the
  bulwark's rail on the centreline, with a screen forward of it; two floodlights on posts over the door's corners,
  looking 50° down so the middle of their beam falls where the ramp's end lies on the quay; a red and green signal on
  the transom to starboard of the door, on the driver's side, for those who wait to drive aboard.
- **The drawing**: `yard/drawings/JS3-304-stern-ramp-and-after-end.svg`, made by `yard/drawings/stern_drawing.py`: the
  transom seen from astern, the profile on the centreline and the plan at the car deck at one scale, the ramp's motion
  as a table (angle, length between the pins, the cylinder's arm about the hinge), the lights, the parts.
- **One set of numbers.** `spec.py` holds them (`STERN_DOOR`, `STERN_RAMP`, `STERN_LIGHTS`); `hull_shell.py` cuts the
  opening from them, `steel.py` builds the ramp, the cylinders and the lights from them, the register places the
  sternlight from them, and the drawing is drawn from them. Change the ship there, build and draw again.
- **Not settled** (the sheet lists eight): no hydraulic power unit, pipes or control stand; no force, weight or cylinder
  size calculated; how the raised ramp is held and made tight is not drawn; no lip or flaps; the floodlights and the
  signal are not in the register yet; the quays and the tide are not known; and the owner's "Does it need to be wider?":
  not for what she carries (6.40 m serves two of her four lanes at a time, 5.86 m between the cylinders: cars two
  abreast, lorries one at a time), about 7.4 m if two lorries are to pass abreast. Not decided.

### Building her, and the three standards she is held to

    ferry/blender/make.sh [part file] [blend file]

runs, in order and stopping at the first that fails: the arrangement's own check, the Blender build (which itself stops
if the plating's inner face comes through the outer, if structure comes through the plating, if a solid looks inward or
a moving part has no parts), `assemble.py` (which writes `data/ferry.bin.gz` and the register), `check.py`, `zfight.py`,
`afloat.py`, `spans.py`. Then, with the site served on port 8765, the page's checks: `node ferry/checks/<name>.cjs`,
**one at a time** (six browsers at once are slow enough that a lever has not finished moving when its check looks).

| Standard | What it asks | What holds her to it |
|---|---|---|
| `yard/standards/JSY-STD-401-stairs.md` | Three classes of stair, each with its rise, going and width | `spec.py` (`STAIRS`), `stairs.py`, the build's own test, `checks/stairs.cjs` |
| `yard/standards/JSY-STD-402-supports.md` | Nothing hangs in the air: every pipe, cable and fitting is carried | `afloat.py`, `spans.py` |
| `yard/standards/JSY-STD-403-no-z-fighting.md` | No two faces in one plane. The owner: "Z fighting is not allowed", "Design with anti z fighting measures", "Write it in the repo , as a working instruction". Ten rules kept by design before anything is drawn | `zfight.py` after every build; the instruction itself says what the check does not see |

> **From here to *Checks actually run*, this file was written for the first Chisum, 34.5 m long**, whose hull was her own
> and whose interiors were the Minato Maru's drawing. It is kept as the record of how the builders, the viewer, the walk,
> the file format and the bridge came to be, and most of it still describes them. Where it speaks of the other ship's
> interiors, of `bridge_deck.py`, `name_plates.py` or `data/ferry-atlas.webp`, of 34.5 m, of her lobby or her old rooms,
> that is gone: this section and `blender/ga.py` say what she is now.

## What she is, and how far her own build has come

The owner, 9 November 2026: "I want a ferry viewer on my website", "a stand alone ferry viewer that can show the whole
ferry in an exploded view"; "I think you should call this ship the Christina , it's not the same as Minato Maru"; "We
can rebuild Minato maru later from what we learn from building this ship"; "When we have the demo laid out we can refine
it over time and then insert it into the games after"; "Make it look as realistic and pretty as possible , disregard
cartoon style from Johansson World for now".

**She is the Chisum since 11 November 2026.** The owner: "Maybe rename her to the Chisum", then: "Push to main , then
rename to Chisum". From 9 to 11 November she was the Christina; the handover's older notes, the bridge survey's sheets
(`CHR-B1` to `CHR-B6`) and the commits before the rename call her that. Her name is one line of the yard's specification
(`blender/spec.py`, `NAME`): the lettering on both bows and on the transom, her own pictures (the AIS screen, the fire
panel) and the name in the model's header are made from it. The other ship's sheet of pictures carried the name on three
plates (bow, transom, the name board on the wheelhouse front) and in the small print of its two fire plans:
`blender/name_plates.py` paints hers there.

So the Chisum is the lead ship of a new design, and the Minato Maru of Johansson World is rebuilt later from what she
teaches. She is built in Blender, section by section, from the working drawings (Rev C), and each section takes the
place of the Minato Maru's drawing on this page as it is finished.

| Section | State |
|---|---|
| **1. Hull** | **Her own, 10 November 2026** (the owner: "Proceed"). Lines, shell plating in her paint, the plating's inner face, frames, floors, double-bottom girders, the watertight bulkheads at the ends, the tank top forward of the engine room, keel bar and skeg, bilge keels, tail shafts, stern tubes and brackets, two screws, two rudders, the bow thruster in its tunnel, sea chests, anodes, two anchors in their hawse pipes, draught marks, load line, her name |
| **1b. The spaces the hull gives a floor to** | **Her own, 10 November 2026** (the owner, on seeing the hull live: "Lots of things are missing like the steering gear and the propeller shaft"). The steering gear (flat, rudder carriers, tillers, tie bar, two rams, two hydraulic power units, hand pump, rudder-angle transmitter, the stern tubes' header tanks, the emergency fire pump); the shafting inside her (each intermediate shaft from its gearbox's flange through the bulkhead gland, over a plummer block, to the coupling on the tail shaft, and the stern tube's seal); two 6 m³ fresh-water tanks; the bow thruster's motor on the tunnel, its platform and starter; two chain lockers. These lift with the machinery spaces, where the panel lists their rooms |
| **1c. Working rudders** | **10 November 2026** (the owner: "The rudders too , need to work, or be azimuth pods"). The Rudder control puts both rudders over, to 35° either side. Blade, stock and anodes turn; so do the head of the stock and the tiller in the steering-gear room; the tie bar goes with the tillers' ends; each ram swings on its trunnion and its rod runs out or in. Azimuth pods were the owner's alternative: they would be another ship (no shafts, rudders or steering gear), and are not built |
| **On foot, and a better outside view** | **10 November 2026** (the owner: "I want to be able to explore it in fpv on the demo and have better camera controls"). *Walking aboard and the outside view*, below. For it the data changed in two places: the lobby's floor is opened over the two stairs, and the car deck has an underside over the hull's own spaces. |
| **Walls, doors, and the way aft** | **10 November 2026** (the owner: "Do one fix that can impact and make it better", and while it was made: "There needs to be a water tight door that can open to the steering gear"). On foot, walls now stop one and doors let one through. Three hinged watertight doors of her own stand on the centreline, and a walkway with steps goes through the shaft space: from the engine room one walks aft to the steering gear. *Walking aboard* and *The way aft*, below. |
| **Every room on foot** | **10 November 2026** (the owner: "Fix the rooms all rooms need to be accessible"). From where the walk begins every room is now reached on foot: a hatch and ladder from the lower lobby to the shaft space (and so to all the machinery spaces), two more watertight doors forward into the void and the thruster room, a hatch and ladder into the fore peak, a ladder to the compass deck. *The ways on foot*, below. |
| **2. Exterior above the hull: the compass deck and mast** (first slice) | **Her own, 10 November 2026** (the owner: "Yes, proceed", after the reference drawings). The roof of the bridge house and what stands on it, at the Minato Maru's positions: the slab with its rounded plan and plated top, a three-course rail all round with a gap where the ladder arrives, the mast on a gusseted foot with its flag yard, radar platform, radar, masthead and anchor lights, air horns and loudhailer, VHF and AIS whips, GNSS and satellite-compass domes, the searchlight, two floodlights, the binnacle, and vent heads over the generator room, the galley and the crew WC. *The compass deck*, below. |
| 2. Exterior above the hull, the rest (bulwark fittings, ramp, casings, deckhouses, funnels) | The Minato Maru's drawing |
| **5. The navigation bridge** | **Her own, 11 November 2026** (the owner: "Make the ferry fully realistic in blender, start with one section at a time. Start with the bridge, aim for a fully explorable realistic ferry with a component register", and: "If current foundation is lacking don't be ashamed of redrawing it"). The wheelhouse redrawn whole (plated, lined, glazed; five forward windows raked 10° under a visor; the same windows and a door down each side), its console with every instrument showing its picture, the boards on the aft wall, both wings, and what the bridge adds to the compass deck: 145 components, each one an entry of her register with its supply, circuit, nets and pipes. *The navigation bridge* and *Her systems*, below. |
| **Her stairs, on every deck** | **Her own, 11 November 2026** (the owner: "All stairs need to be traversable and fully realistic and standardised"). Eight stairs to one yard standard in three classes, each built from one line of the specification and walked up and down by a check: the two main stairs between the car deck and the passenger deck (two flights with a landing, in lined enclosures with a foot lobby and a sliding fire door each), the crew stair to the wheelhouse, the engine room ladder, four outside ladders. *Her stairs*, below. With them a check that nothing aboard hangs in the air (the owner: "every detail in every part of the ship needs to be realistic"): *Nothing hangs in the air*, below |
| **5b. The bridge deck abaft the wheelhouse: the corridor and the house outside** | **Her own fit-out, 11 November 2026** (the owner: "continue with bridge deck , how about the outside and the corridor to the cabins"; "The corridor needs boards and information as well"; "The door needs to be able to open nothing is ornamental"). The walls are still the other ship's. *The bridge deck abaft the wheelhouse*, below |
| 3. Car deck · 4. Engine room and machinery spaces · 5. The rest of the bridge deck (the cabins, the galley, the mess, the EG and CO₂ rooms, their walls) · 6. Accommodation, toilets, galley | The Minato Maru's drawing |

Her room notes therefore still speak of the Minato Maru's crew and route. The ferry in the live Johansson World is not
replaced or changed by any of this.

## What comes next: the owner's list

The method is now fixed (register a section in `systems/`, draw it from that register in Blender, check it, show it on the
page), one section at a time. **She is built as a real newbuilding of Johansson Shipyard, surveyed by class** (the owner,
11 November 2026; `yard/README.md`): each section is submitted, commented on and answered before it is called finished.

- **Done: class answered on the navigation bridge** ([`yard/class/PA-001`](yard/class/PA-001-navigation-bridge.md),
  revision 1: **approved with comments**, no comment of category A open). The rule basis is the international conventions.
  What is still open there is listed in one table at its end: the height of the wheelhouse roof (the owner's to decide),
  the sidelights' screens, and what waits for makers' figures or for other sections.

Asked for by the owner on 11 November 2026 and not yet begun:

- **An internal staircase from the bridge all the way to the engine room** ("I want an internal stair case too so you can
  run all way from the bridge to the engine room"). One enclosed stair trunk through every deck: bridge deck, passenger
  deck, car deck, machinery spaces. Today the crew stair from the wheelhouse reaches the passenger deck through an opening
  1.50 m high, and the machinery spaces are entered from the car deck. It is drawn with the machinery spaces and the
  accommodation, with full headroom and a door at each deck (it is also an escape route and a fire boundary).
- **An engine control room.** The Minato Maru has a control booth in the machinery spaces; she is to have a proper control
  room. The bridge's nets already end there by name (the main switchboard and lighting board, the engine control units, the
  alarm system, the telephone exchange, the talkback and sound-powered telephone stations): those ends become components.
- **A coffee and break room and a toilet for the engine department**, below.
- **A shower and toilet in each cabin.** The bridge deck has one shared crew WC and shower today; the cabins are 2.5 m by
  2.5 m, so each wet unit has to be found within its cabin or by re-dividing the deck. That is the crew accommodation's
  section (with it: the fresh-water, hot-water and grey- and black-water pipes the survey found missing, findings BF-07,
  BF-16 and BF-17, and the fire detection loop's detectors in every room).

Order: the machinery spaces with the control room and the stair trunk next (the bridge's cables and nets run there, so
the register grows without a gap; class comment sheet PA-002), then the crew accommodation.

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
`blender/build.py`), which puts the Chisum's own hull back in its place.

The export does not edit the game: the Chisum's name is painted by the export page alone (it replaces the name where
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

## Reference drawings (public domain) and what they are good for

The owner, 10 November 2026: "Search for free GA or installation drawings from public domain shipyards and see if can
use anything to make this ship more realistic". They are studied and measured, never traced or copied (as for the
Town's New Yokosuka), and none is kept in this repository. What was searched, what the rights are, and what was seen:

**Usable, and looked at.** The Library of Congress's Historic American Engineering Record (HAER) measured drawings,
whose rights advisory reads "No known restrictions on images made by the U.S. Government; images copied from other
sources may be restricted":
- [M/V Ranger III, HAER MI-432](https://www.loc.gov/item/mi0766/): the National Park Service's 1957 passenger and cargo
  vessel, 165 ft (50 m), 34 ft beam, 15 ft 1¾ in depth, 10 ft draft, twin controllable-pitch screws. Six sheets of
  measured drawings (2022): the outboard profile, a longitudinal section with scantlings, the main deck and the lower
  deck and holds (machinery, shaft alleys, steering gear in the after peak, tanks, crew spaces), the boat, bridge and
  upper decks, the lines with a table of offsets. Sheet 5 was not looked at. **The closest real vessel found.**
- [M/V Husky II (ex USS LCI(L)-653), HAER AK-52](https://www.loc.gov/item/ak0557/): four sheets, among them the 1944
  general arrangements and the lines with offsets, traced from National Archives microfilm (RG 19). A 48 m twin-screw
  landing ship with bow gangways, not a car ferry. Sheets 2 and 4 were not looked at.
- Listed, not looked at: [Ferry EUREKA](https://www.loc.gov/item/ca1504/) (an 1890 steam ferry, 7 sheets), USS SHACKLE
  ([AK-49](https://www.loc.gov/item/ak0533/), 10 sheets) and the schooner Lettie G. Howard
  ([NY-206](https://www.loc.gov/item/ny1621/), 20 sheets).

**Public domain in principle, not reachable here.** The National Archives (RG 19, the Bureau of Ships) has digitised
over 11,000 ship drawings, with an [index](https://www.archives.gov/research/cartographic/ship-index) of 19,223 rows.
Its ferry entries are Navy yard ferries (YFB) and one 1959 coastal ferry (COHO, RG 357). The catalogue is a script-driven
site, so nothing was opened from it. The Smithsonian's Open Access collection (CC0) has general arrangements of
wartime merchant ships (Victory ships, T2 tankers), all large.

**Free to look at, not public domain.** East Carolina University's [LCU 1667-1679 drawings](https://digital.lib.ecu.edu/79681)
(a 41 m twin-screw bow-ramp craft: the closest type, with the bow ramp winch, the stern gate and the watertight doors)
are by a private yard, Barbour Boat Works, and are "In Copyright, educational use permitted"
(`rightsstatements.org/vocab/InC-EDU/1.0/`): they may be read, not reused. Royal Museums Greenwich, Mystic Seaport,
scans on Model Monkey and similar sites vary by item. Sjöhistoriska museet's drawings (35,000, about 10,000 digitised,
many marked Public Domain) are described under CC0 in the national heritage index, but the licence of each image is its
own; the ferry drawings there are from 1874 to 1920 (a 1909 proposal for a motor ferry for Svanesund among them), and
DigitaltMuseum refused automated access, so none was opened. Wikimedia Commons was rate-limited and not searched.

**What the Ranger III sheets give that this build can use.**
- *Scantlings of a real hull* (read off sheet 2 at full resolution). 24 in (610 mm) frame spacing; side frames
  5 × 3 × 5/16 in inverted angle (127 × 76 mm) from the tank top to the main deck, 3½ × 2½ × ¼ in above it, spaced 2 ft,
  and 4 × 3 × 5/16 in intermediate frames 12 in between the regular ones at the forward end; plate floors of 12.75 and
  15.3 lb plate (5/16 and 3/8 in); a plate centre vertical keel of 20.4 lb, watertight or oil-tight between frames
  19 and 51. The Chisum's frames were 75 × 50 mm, 0.5 m apart: lighter than
  that vessel's, as is to be expected of a hull 15 m shorter, but on the light side. **Taken up (10 November 2026):**
  100 × 65 mm, the 5 × 3 in angle scaled to a hull of 4 m depth, and a lighter 80 × 65 mm frame (its 4 × 3 in) between
  each pair forward of the collision bulkhead, so the fore peak has them every 0.25 m (`spec.py`: `FRAME_WEB`,
  `INTERMEDIATE_WEB`; `hull_structure.py`: `_side_frames`). Whether the sizes match a class rule was not checked.
- *What a real outfit holds* (the boat and bridge deck, the pilot house roof): range light, anchor lights, side lights,
  searchlight, radar and radio antennas, a 13-person life raft, a 5-ton cargo crane, a capstan, a 20 by 10 ft cargo
  hatch. A checklist for section 2.
- *Where things lie in a real lower deck*: the steering gear on the centreline of the after peak under a shaft and tank
  space, line shaft bearings in the shaft alleys, the pitch control stand between the engines, the sewage and fresh-water
  tanks aft of the machinery. This build lays the steering gear, shafts and tanks the same way round.

**What they do not give.** A 34.5 m twin-screw car ferry with a bow ramp has no public-domain general arrangement among
these, and the one close in type (the LCU) is copyrighted. Her hull lines stay the Rev C form: Ranger III and the
landing ship are different hulls.

## Her own build (`blender/`)

Blender 4.0 or later, and Python 3 with numpy for the tools that need no Blender (and Pillow for her pictures).

```bash
python3 ferry/blender/atlas.py                                                              # her pictures: only when one of them changes
blender -b -P ferry/blender/build.py -- --part chisum-hull.npz --blend chisum.blend   # build, export, save the .blend
python3 ferry/blender/assemble.py --part chisum-hull.npz                                 # put it into data/ferry.bin.gz, and write data/systems.json
python3 ferry/blender/check.py                                                              # check what the page will read
node ferry/checks/bridge.cjs                                                                # check the page itself (the site served on port 8765)
blender -b chisum.blend -P ferry/blender/render.py -- --view stern --out hull.png        # a Cycles still (stern, bow, inside)
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
| `compass_deck.py` | The roof of the bridge house, her mast and what it carries (the viewer's part `top`): slab, plating, rails, mast, radar, lights, antennas, searchlight, binnacle, vents |
| `wheelhouse.py` | The navigation bridge: the house, the console and every component of the register, both wings, the bridge's fittings on the compass deck. It draws each component where `systems/bridge.py` puts it; assemble.py takes the other ship's wheelhouse away for it |
| `name_plates.py` | Her name on the other ship's three name plates (its sheet of pictures): run when her name changes |
| `atlas.py`, `atlas.json` | Her own pictures, drawn in Python (Pillow, no Blender) and packed on one sheet, and where each lies on it. Run `atlas.py` before `build.py` when a picture changes |
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
- The electrical workshop's forward wall is opened for the door to the void, and the car deck (its plating, and the
  lobby's floor covering on it) over each of her ladders that comes down through it.
- Three spaces that are not entered are given the place where a walk begun at them starts (`STAND`).
- A part may give a mesh to another of the viewer's parts (`part.group` in the builders). The hull's build gives the
  car deck its plating as seen from below, over the hull's own spaces (below).
- **A room of the base is emptied where hers is built** (`REPLACES`, `clear`): the other ship's wheelhouse walls are one
  piece with the rest of the house, so they cannot go as pieces. Every triangle of the base inside the wheelhouse's box
  goes, and one that crosses the box's faces is cut there and its outside kept (`clear_box`).
- Her own pictures travel as a second sheet (`atlases` in the header; a material's `atlas` says which), and her register
  is written beside the model with the places of the same build (`systems.json`).
- A second run on its own output gives the same files byte for byte.
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
- *Where the Minato Maru's rooms still are, the hull keeps clear of them:* frames are 100 mm angles inside the 14 cm
  between the moulded line and the rooms' linings (28 mm to spare), and the bulkheads at frames 17 and 52 stand 8 cm outside the rooms'
  own end walls. When the machinery spaces are rebuilt, these become ordinary web frames and bulkheads.

## Her stairs (`blender/stairs.py`, `blender/spec.py`: `STAIRS`)

The owner, 11 November 2026: "All stairs need to be traversable and fully realistic and standardised."

- **One standard.** The yard's standard `yard/standards/JSY-STD-401-stairs.md` has three classes: P, a passenger stair
  (45° at most, steps 170 to 200 mm, going 220 mm at least, 0.90 m clear, a landing after 12 steps, a handrail each side);
  C, a crew stair (45°, going 200 mm, 0.70 m); L, an inclined ladder for the crew on deck and in the machinery spaces
  (55°, open grating treads). The figures are `spec.STAIR_CLASS`. The standard says where each comes from, and that its
  outside requirements are recalled and not yet read.
- **One builder.** Every stair is one line of `spec.STAIRS` (its class, where its top step is, how many steps in each
  flight, the landings between, what stands at each side) and `stairs.py` builds it: treads, risers and a closed underside
  or open gratings, stringers, landings, a marked edge on each closed step, handrails on posts or on wall brackets with
  newels. `stair_rules.py` (no Blender) holds a stair to its class; the build stops if one breaks it.
- **Eight stairs**, all hers: the two main stairs between the car deck and the passenger deck (P: 22 steps of 200 mm in
  flights of 12 and 10 with a landing, 42°, 1.18 m clear), the crew stair to the wheelhouse (C: 13 steps, 45°), the engine
  room ladder (L: 16 steps, 52°), and the four outside ladders to the bridge wings and the after landing (L: 13 steps, 53°).
  The other ship's were 45° to 60° with steps 150 to 200 mm deep on two bars.
- **The main stairs** are 1.6 m longer than the other ship's (JSY-STD-401 section 4 has the reasoning). `spec.MAIN_STAIR`
  says what stands round them and `stairs.main_stair_fitout` draws it: each well in the passenger deck lengthened aft to
  6.95 m, trimmed, with a lined guard and a teak capping rail along it; a lining that brings the casing's outboard wall in
  line with the lobby's wall above; the other ship's doorway from the lower lobby plated in; a foot lobby on the car deck
  (to port the foyer from the gangway; to starboard cut out of the casing, which the other ship draws solid there) and a
  sliding fire door from the car deck, 0.90 m clear, with a hatched zone kept clear before it and signs both sides. The
  doors open onto the vehicle lanes a metre forward of the lower lobby's own fire doors, no longer into the lower lobby.
- **In the assembler** (`assemble.py`): `REPLACES` drops the other ship's flights, handrail bars, door sets and guards
  (`stairs-…` rules, several boxes each); `OPENINGS` (`_main_stair_openings`) lengthens the wells through the deck's two
  faces and the panel under it, opens the casing walls for the doors, and cuts the starboard pocket and foot lobby out of
  the solid blocks; `NUDGES` moves a base piece that lies in another's plane or stands in the way; `SAYS` rewrites what
  the page says of a space the build has changed. The model's header carries `stairs[]` (each stair's figures, its
  flights and landings, and its class's limits) for the page and for the check.
- **Walked.** `checks/stairs.cjs` walks every stair in the header up from the deck below and down again, and holds its
  figures to the limits the header gives.

## Nothing hangs in the air (`blender/afloat.py`)

The owner, 11 November 2026, of the steering wheel: "The wheel is not connected to anything in the wheelhouse fix this every
detail in every part of the ship needs to be realistic". The wheel stood on a stub of shaft that ended in the air 4 cm over
its stand. It now has a helm unit on the stand: the shaft turns with the wheel and runs through a flanged bearing into the
unit, which carries the pointer that shows the rudder ordered.

`afloat.py` looks for every such thing. It takes the model apart into pieces (connected sets of triangles) and asks what
holds each: two pieces hold each other if a corner of one lies within 4 mm of the other (8 mm for paint and pictures), an
edge of one passes through the other, or one stands inside the other. The shell and the largest pieces are the ground;
what touches the ground is held, what touches that is held, and so on. What is left is afloat, alone or in a cluster that
holds only itself, as the wheel, its hub and its stub did.

    python3 ferry/blender/afloat.py --part chisum.npz --allow ferry/blender/afloat-known.json [--all]

Its first run found 84 things of hers afloat. 45 were paint drawn 4 to 5 mm proud of the curved shell (the tolerance for
paint is now 8 mm). 36 were real and are fixed. On the bridge and above: the four chairs' armrests (each post 6 mm clear
of the seat), the five sun blinds (no brackets), the wing doors' outside handles, the push plate of the crew stair's
gate, the exit board over the crew stair, the CO₂ extinguisher's bracket, the compass periscope's tube (5 mm short of
its plate), the searchlight (no trunnions in its yoke). On the car deck: the new sliding doors' tracks. In the hull and
its spaces: both screws (the boss's forward face was open round a shaft 38 mm smaller); the rudder carriers, the tillers'
bosses and the rams' cylinders, each 5 to 30 mm clear of the stock or stool that holds it, and with them the whole
steering gear; every coupling, gland and bearing housing round the shafts (bored 15 mm larger than the shaft); the
steps of the shaft-space and void walkways (no post, 17 cm over the floors); the fresh-water tanks (bearers on nothing:
they now lie over the frames, on legs to the floors); the steering gear's watertight door (its hinge lugs stood beside
the frame on no wall). The last three, in the fore peak, were fixed after the publication of 11 November and are
**on the development branch only**: the ladder is fastened to the collision bulkhead by stand-offs, the flat's bearers
come up to its plates, and each chain locker stands on four legs on the floors of frames 63 and 64. `afloat-known.json`
(things known to be afloat, with the reason) is empty. `--all` also lists the other ship's: 187 things, 125 of them in
the machinery spaces.

## The bridge deck abaft the wheelhouse (`blender/bridge_deck.py`)

What the other ship draws there is one piece for the whole house, eight bare doorways off a bare corridor, handrail bars
hanging 2 cm off the walls, three open holes in the aft wall and nine flat window frames inside the plating. The walls
stay (the cabins behind them are not rebuilt); `bridge_deck.py` gives the corridor and the outside what a ship has there,
from the tables at its top, and `systems/bridge.py` registers it (rooms `corridor` and `aft-platform`, 43 components).

- **The corridor.** A joiner door in each of the eight doorways: frame, leaf with a vent grille, lever handles, hinges on
  the cabin's side, a name plate. Each opens into its room for whoever turns to it (it stays shut for one who walks down
  the middle), hung on the jamb where the open leaf lies clear of the furniture. Two pieces of the other ship's furniture
  were moved for it (`assemble.NUDGES`): the chief engineer's wardrobe stood in the after half of his doorway, and a rail
  hung across the crew cabin's. The galley's doorway is 0.60 m, not 0.70: the other ship's galley unit stands 10 cm into
  it and a post closes that strip. Storm rails of varnished wood on brass brackets; a skirting; a panelled deckhead at
  2.085 m with five recessed lights, three smoke detectors, a loudspeaker, two air diffusers and an exit light at each
  end; by the aft door an extinguisher under its sign, a call point, the alarm bell and the light switch.
- **Boards and information.** On the walls: the notice board (watch list, hours of work and rest, sailings, safety
  policy, drills, notices), the muster list (the alarm signal, each rank's duty at fire and at abandoning ship, the two
  muster stations), the fire control and safety plan, and four escape signs pointing aft. Outside by the door, the shore
  firemen's copy of the fire plan in its red tube. The requirements behind them (a muster list shown in the
  accommodation, a fire plan permanently exhibited with a copy outside the house, a table of working arrangements) are
  recalled, not read.
- **The aft wall.** Three weathertight steel doors on 15 cm sills, each closing on a flat-bar frame from outside, hung
  on two hinges with lugs on the plating, two dogs and a lever handle each side, a light over it: the corridor's with a
  porthole, the emergency generator room's and the CO₂ room's with their signs. They open aft onto the platform.
- **The sides.** Nine windows: a steel frame with rounded corners 12 mm proud of the plating and lining the opening,
  twelve bolts, the glass, a drip strip over it.
- **The platform.** A fire hose box that is a cabinet (the hose rolled on its peg, the nozzle in its clip) whose door
  opens, with its hydrant under it (the survey's finding BF-18 asked for a second hydrant aft); the loudspeaker horn.
- **Every door opens** (`checks/doors.cjs`): all 25 doors, gates, hatches and cabinet doors the model says can be worked
  are opened and shut as a tap does it.

## No two faces in one plane (`blender/zfight.py`)

The owner, 11 November 2026: "Z fighting is not allowed". Where two faces lie in one plane, look the same way and
overlap, the page cannot tell which is in front and they flicker. `zfight.py` sorts every triangle of the model by its
plane and finds every pair of different pieces that overlap by more than a square centimetre. Not a fight: a pair where
one is drawn with an offset toward the eye (paint, pictures, floor plates), and two faces bedded on a third that looks
the other way (the feet of two things on one deck).

    python3 ferry/blender/zfight.py --part chisum.npz [--all]

Its first run found 34 pairs with a part of hers; all are fixed (the wheelhouse's aft wall band in the side walls'
faces, a wing door sill in the deck covering's underside, the sliding doors' hangers in their track, the sun blinds'
brackets, the porthole's glass, the stairs' newels in their stringers, and others). **629 pairs remain among the other
ship's own pieces** (`--all` lists them): they are not fixed, and go as each section is rebuilt or by a pass over the
other ship's drawing that is not written yet.

## The emergency generator room (`blender/eg_room.py`, `blender/eg_place.py`)

The owner, 11 November 2026, twice, with a drawing ("Ship emergency generator room, general arrangement") and a picture of
the room: "Build the ships emergency generator room". It is built whole, to the drawing's measures: 7.80 m long, 4.50 m
wide, 3.20 m high; 1.00 m clear, a set of 4.20 m, 1.20 m clear before the switchboard, an escape route of 1.00 m to the
door; 2.40 m of headroom under the ducts.

- **In it:** the generator set (a six-cylinder turbocharged diesel and its alternator on a skid on six mounts, the
  radiator in a cowl at its forward end, its name plate with the drawing's rating: 440 V, three-phase, 60 Hz, 500 kW);
  the exhaust (a bellows, a lagged riser with its bands, up through the deckhead to a silencer on the roof); the supply
  air duct with fire damper FD-01 and the exhaust air duct with FD-02 along the starboard wall, each ending in a louvre
  outside; the day tank of about 200 L on its stand over a tray, with a level gauge, a quick-closing valve whose pull is
  in a red box outside the door, a vent out through the wall, and tagged fuel lines; the 24 V starting battery bank in
  its rack and its charger; the control panel and the two-section emergency switchboard on plinths, with the
  alternator's cables in trays; gratings beside the set and before the board, a rubber mat at the board, a yellow guard
  rail round the alternator; four lit lights; the extinguisher, call point and telephone by the door; the warning board;
  the exit sign; the escape route marked on the deck; and the weathertight door with its porthole.
- **Nothing in it runs through the air** (`yard/standards/JSY-STD-402-supports.md`, `blender/spans.py`). The owner, of
  the room as first built: "There looks like too much floating objects in the emergency generator room why aren't you
  working according to Spec?" They were right: a cable stood 1.4 m up from the alternator to a tray, another crossed the
  room in the air, the ducts hung on rods too thin to see, fuel lines ran off the wall with no bracket; `afloat.py` had
  passed it all because each thing touched something at an end. Now: the alternator's cables go down from a terminal box
  on its side into a covered duct on the deck, up a cable ladder on the wall, along a ladder under the duct on brackets
  and down into the switchboard; the ducts and dampers hang on trapezes of 40 mm angle; the fuel lines are clamped to a
  rack on the forward wall (supply, return and the filling line, each tagged), laid on the deck beside the skid under a
  yellow step-over plate where one walks, and bracketed to the skid's rail; the battery lead runs in a conduit; the
  exhaust riser is stayed to the wall; the pull wire is led through eyes. `spans.py` follows each of the room's 23 runs
  (73 m) along its centre line and fails if any is unsupported further than the standard allows.
- **What works:** the door opens outward for whoever comes to it; each fire damper's lever is turned a quarter by a tap.
- **Where it stands.** It is a block for the 68 m ship's top deck (`ga.py`: `eg-room`). That hull is not built, so the
  block is landed on the present ship's house top, abaft the wheelhouse (`eg_place.PLACE` is the only thing that says
  where). On the present ship it is as high as her mast's lower lights and would shade her radar aft: it is there to be
  walked, not as her arrangement. Go to it by **Go to → Top → Emergency generator room**, or on foot from the compass
  deck. The two vent heads that stood where it stands are forward of it; the other ship's generator room on the bridge
  deck is emptied and named a store.
- **The yard's, not the drawing's:** the exhaust has its own stack (the drawing leads it to the funnel); the tank's valve
  has a pull outside; the ducts end in wall louvres; the starting battery is the only battery in the room.
- **Open, and told to the owner:** the set's 500 kW is the drawing's figure and is more than the 68 m ship's arrangement
  gives each main generator (about 320 kW), and her own emergency loads are near 200 kW; a 200 L tank feeds 500 kW for
  about an hour and a half at full load. JS8-854 (the emergency load list) is to settle the rating and the tank together.
  No rule text was read for the room.
- **In the register:** 20 components in a new subsystem, Emergency power (EMG-01 to 11, four lights, the extinguisher,
  the call point, the heat detector, the telephone, the door).
- `zfight.py` now looks for the face two others are bedded on across the whole plane, not only in the same bin of
  distance: adding the room moved the model file's rounding by a hair and two bedded pairs under the drinks machine were
  reported wrongly.

## The drinks machine (`blender/vending.py`, `blender/jpvm.py`, `blender/glb.py`, `blender/assets/jpvm-2r20/`)

The owner, 11 November 2026, with the files of a machine of their own (JPVM-2R20: the model as a glTF binary, the
Blender script that made it, a parts list, the controller's state machine, the wiring): "Use this vending machine
instead"; then: "Use English so we can see what we are selling , English and Japanese". The files are in
`blender/assets/jpvm-2r20/` as they came (without the two rendered previews, the Blender 5 scene and the PDF of the
wiring drawing: the script makes the first three again, and the drawing is there as SVG).

- **Not redrawn.** `glb.py` reads the file (numpy only: nodes, triangles, materials); `vending.py` stands its 262 parts in
  the lobby in the finishes the file gives them, against the forward wall, 60 mm off it for the condenser's air, held by
  two angles to the wall and four deck cleats. 22,000 triangles; the model file is 2.09 MB (its budget in `check.py` went
  from 2 to 3 MB).
- **What it sells** is Johansson World's line-up of seven drinks (`jpvm.SELL`, with why each is aboard; read from the
  owner's site, since the Town's source is not in this repository): ten cans in the upper row, the right-hand four hot,
  and ten 500 ml bottles below (`jpvm.ROWS`). One price for a can (¥130) and one for a bottle (¥160): the commonest of
  each row in the file's own table, which prices every selection differently whatever stands in it. **The Japanese names
  of the drinks are the yard's** (緑茶, 缶コーヒー, さんぴん茶, シークヮーサー, 琉球コーラ, ブラックコーヒー, コーンスープ) and want
  the owner's eye.
- **Lettered in English and Japanese** (`jpvm.pictures`, drawn onto her picture sheet by `atlas.py`): each selection's
  label (the brand, what it is, its Japanese name, the price, cold or hot), a menu of the seven drinks on the door's lower
  panel, the lit header, the credit display, the card reader's pad, the sold-out lamps (one lit, as in the file), the
  recycling plate, and printed strips at the coin slot, the note slot, the return lever, the change cup and the take-out
  port. The display cans and the bottles' wraps are in each drink's colour. English is in DejaVu Sans Bold, Japanese in
  IPA Gothic (the only Japanese face on the build machine; `atlas.py` stops if it is missing).
- **What moves** is what the file's rig moves, about the pivots its script names: the door for a tap (90° aboard; the
  file's 100° would stand it over the stair well's guard), the take-out flap for whoever stands before it (55°; at the
  file's 75° it passes through the back of the bin), the coin return lever and the change cup's flap for a tap. The flap
  and the coin return ride on the door (`on`). The vend cycle is not played.
- **What is not as in the file, and why** (the owner is told each): its pivots and all its lettering lie at the file's
  origin (its script loses their places when it parents them), so the pivots are taken from the script, and the file's
  lettering (Japanese only, naming no drink, a third of the size the script asks) is not used; the display cans and
  bottles stand 28 mm further back (in the file they stand through the window's glass); the chute is at the place the
  script gives it (in the file it is turned about the origin and passes through the compressor); one button that the
  file's animation leaves 60 mm out in front is at rest; five pairs of surfaces that lay in one plane are a millimetre or
  two apart; the can kept in mid-fall is left out; and sixteen inside parts that hung free have mounts
  (`vending.mounts`). The picture sheet is now 3072 wide, to stay under 4096 either way.
- `checks/doors.cjs` walks up to it (the flap opens, the door does not), taps it (the door opens and what is on it goes
  with it) and taps the open door (it shuts).

## Offline, and on the Home Screen (`offline.js`, `sw.js`, `offline-files.js`, `manifest.webmanifest`)

The owner, 11 November 2026: "Make a install to Home Screen and download offline button so I don't need a connection to
look at it". **Save offline** in the bar fetches the 15 files the page needs (4.4 MB since the drinks machine came
aboard, 3.9 MB before: the page, its scripts, three.js, the model, the register, both picture sheets, the icons) and
keeps them; the button then reads "Saved offline", and
pressing it again renews the copy. From then on the page's service worker gives the saved copy whenever the network does
not answer (at once with no connection; after four seconds on a slow one). With a connection the page is always the
newest, and each answer renews the saved copy. **Install** asks the browser to put the page on the Home Screen; on an
iPhone or iPad the browser has no such request, so the button says where the command is (Share, then Add to Home
Screen). A file the page loads must be listed in `offline-files.js` to be saved. `checks/offline.cjs` saves the page,
cuts the network and opens it again.

## The compass deck (`blender/compass_deck.py`)

The roof of the bridge house is the viewer's part `top`, 1,164 triangles in the Minato Maru's drawing (a slab, a rail,
a mast, a few boxes) and 9,332 in hers. `assemble.py` takes the one for the other (`SUPERSEDES['top']`, as for the hull),
so nothing of the other ship's is left on it. Its positions are the Minato Maru's, so the ladder that comes up to it, the
rooms under it and the walker on it still fit: the roof's top is at 11.50 m (13.40 m above the keel), the mast stands
at 20.8 m from the transom, the binnacle at 22.2 m.

**Since 11 November 2026 the roof has two levels.** The owner had the wheelhouse roof raised ("Yes make it realistic"):
from the wheelhouse's aft wall forward (19.5 m from the transom) the roof is 0.30 m higher, at 11.80 m (13.70 m above the
keel). That higher part is the compass deck proper; the house top aft of it, where the ladder arrives, is where it was.
A step block 0.15 m high halves the rise, clear of the ladder's head, and the block's edge and the deck's are marked
yellow; the rail steps up at a post on the starboard side (to port the gate lies across the step). The mast, the binnacle,
the antennas, the searchlight and the floodlights stand on the higher part and went up with it: the mast now rises to
16.4 m (18.3 m above the keel), the masthead light is 16.6 m above the keel. `spec.COMPASS_DECK` (`step`, `rise`) and
`spec.MAST` hold the figures.

- *The roof.* A slab 0.32 m deep with a rounded plan (3.10 m each side, 5.95 to 23.16 m from the transom), white at the
  edge and on its underside, which is the bridge house's deckhead. Its plating is light grey, a plate 2.4 m by 1.2 m,
  the seams drawn as marks a hair in front of it. The slab's top lies 6 mm under the plating.
- *The rail.* Three courses of tube (1.0, 0.62 and 0.30 m) with a stanchion on a foot plate about every 1.45 m, all
  round 0.13 m in from the edge, with an 0.8 m gap in the port side at 19.25 m from the transom, where the ladder
  arrives. (The Minato Maru's rail ran only round the wheelhouse; the rest of the roof was open to the edge.)
- *The mast.* A tube 0.22 m through at the foot and 0.12 m at the head, on a foot plate with six gussets, with a
  flag yard of 2.8 m at 15.4 m above the keel; a radar platform of 1.3 m by 1.0 m with toe plates; a turning unit and a
  1.8 m slotted-waveguide array; the masthead light (white, 225° forward) on a bracket on the front of the mast above the radar, and
  the anchor light (white, all round) on its crown, as for a power-driven vessel of 20 to 50 m; two air horns and a
  loudhailer.
- *Aft of the mast.* Two VHF whips of 3 m and an AIS whip of 1.4 m on insulators; a GNSS dome and a satellite
  compass dome; to starboard forward the searchlight on a yoke, and at each front corner a floodlight angled down
  toward the bow; on the centreline the standard compass in its binnacle, with its brass ring and its dome.
- *Vent heads over the spaces below*, as on Ranger III's roof: the emergency generator room's air intake (a louvred
  coaming, 7.7 m from the transom) and its exhaust (a 0.14 m pipe with a flap), the galley's extract cowl (15.25 m,
  starboard) and the crew WC's mushroom head (12.75 m).

On foot the roof is a floor like any other: the rail holds one in (0.18 m off it), the gap lets one reach the ladder,
and the mast, the binnacle, the vents and the lights are in the way. The compass deck's reach on foot fell from
100 m² to 89 m² for it. What is lacking: the lamps do not light (the viewer's day has none lit), the radar does not turn
(the page has no continuous motion for it yet), nothing is drawn of the cables, and the stern light
is still the Minato Maru's, outside this part (the sidelights are hers, from 11 November: *The wheelhouse*).

## The navigation bridge (`blender/wheelhouse.py`)

Section 5. The owner, 11 November 2026: "Make the ferry fully realistic in blender, start with one section at a time. Start
with the bridge", and while it was built: "If current foundation is lacking don't be ashamed of redrawing it, the important
part is that it's a realistic vessel". So the wheelhouse is not the Minato Maru's with her fittings set into it (the first
slice, the same morning): it is redrawn whole, and everything in it is a component of her register (`systems/`, below). The
builder holds no positions of its own: it draws each component where `systems/bridge.py` puts it, and what it draws between
`with component(tag):` and its end is that component in the model (`shipyard.component`), so the build writes where each one is.

- *The house.* Plating outside in the house's paint, a lining inside, 8 cm in all. Five forward windows (1.04 m each)
  between posts and mullions, **raked 10° forward** from the sill at 0.95 m to the head at 2.10 m (the glass itself from
  0.99 to 2.06 m), under a visor that
  carries the roof's eave 0.3 m forward of the glass. Down each side, the same: a window over the after corner, a
  weathertight door (hinged forward, a 0.15 m sill, a glazed upper half), two windows. **From the helm the glass shows
  224° of 225°**, by the survey's measure (gaps under 6° are mullions the view goes on round; counted to 22.5° abaft
  each beam): `build.py` works it out from the windows as built and stops if a blind sector opens. The first drawing of
  the new corners showed 193°; the corner posts were slimmed to 0.06 m and the door stiles to 0.06 m for it.
  **The port door moved**: the
  other ship's stood in the after corner, where the boards and their locker would have stood in its doorway (the page's
  check found it: the walker could not get out); it now stands opposite the starboard one, 20.45 to 21.25 m from the
  transom. **The wheelhouse is 2.30 m clear** under a deckhead lining with its panel seams (it was 2.06 m: the owner had
  the roof raised); over the lining a void for the cable trays, the roof's structure from 2.42 m, the compass deck at
  2.70 m. The side windows' glass reaches 2.00 m and the wing doors are 2.01 m high and glazed to 1.95 m, so a tall
  helmsman sees abeam as well as ahead: `build.py` measures the glass for an eye at 1.50 m and at 1.80 m and stops if
  either sees less than 220°. A sheet deck covering with a ribbed mat at the helm.
- *The console* (5.5 m, top at 1.0 m; nothing on it over 1.33 m, and nothing ahead of the wheel over 1.22 m, so that
  the sea is seen over it: `yard/calc`) in five bays with doors, a grab rail and a foot rail. In
  the after row, flush panels with their knobs, buttons, a joystick, a trackball, a microphone and two handsets; behind
  them the tilted displays. From port: NAVTEX, the chart system, the echo sounder, the conning display; the two engine
  levers and the thruster lever under the engine instruments and a rudder angle indicator; the GPS, the radar under its
  hood, the AIS, two VHF sets, the binoculars. On its after face the navigation light panel, with a switch a lantern.
  Inside it, as plain cased units, what is not seen: the radar processor, the navigation data distributor, the satellite
  compass processor, the network switch, the speed log, the propulsion control unit, the amplifier, the camera recorder.
- *Every screen shows its picture* and every dial has its face: her own sheet (`atlas.py`), drawn in Python. The radar,
  the chart system and the paper chart on the chart table show the same water (Minato's approaches and Kitano-jima),
  each in its own way; no photograph, no maker's panel and no chart of a real coast is on it.
- *The steering stand* with its wheel, the mode selector and tiller, the autopilot's control unit, the heading in figures
  low on its face; the master's chair and a second at the radar; an overhead console with the camera monitor, a rudder
  angle indicator and the wind, **hung above the windows' head** (from 2.06 m up: the first hung to 1.80 m, a tall
  helmsman's eye, and hid the horizon from him); the compass periscope **directly under the binnacle** (it hung 0.65 m
  aft of it), its mirror box from 1.97 m.
- *The aft wall:* the fire detection panel, a call point and the general alarm push at the door; the boards BD1 and BD2
  and the two 24 V panels, their doors lettered with their ways; a locker under them; the door from the corridor (hinged,
  it opens for whoever comes near); the flag locker, a first-aid box and an extinguisher; the chart table with its
  drawers, the chart, a lamp, the clock, barometer and clinometer, a shelf of publications and the portable radios in
  their charger; over the crew stair's head, which has a rail and a bar, the room air conditioner.
- *The levers are control heads, and they move.* The owner, 11 November 2026: "Levers need slots and mechanical moving
  parts". Each engine lever and the thruster lever turns on a shaft inside a housing and comes up through **a slot in its
  top plate**; a drum on the shaft closes the slot under it, and the scale beside the slot is marked where the arm crosses
  the plate at each order (full astern to full ahead; thrust to port or starboard), which is how the scale and the
  lever's angles are worked out (`lever_notches`). **A tap moves a lever a notch** and says the order; the same lever at
  the console and on both wings moves as one, as synchronised stations do. The tiller stands in a gate and is held over or
  let go by a tap. **The wheel turns with the rudder**, four degrees for one, its king spoke capped in brass.
- *Each wing:* a bulwark 1.1 m high with stays and a varnished rail, the wing control station (a pedestal at the outboard
  forward corner, its levers outboard, so that the person at them sees past the house across the bow), a bearing repeater on a
  stand, a lifebuoy with its light and smoke float, a wing light, a talkback station, a scupper; to port the hydrant and
  the hose box; to starboard the EPIRB. **The sidelights stand on the rail** with their screens: they stood behind the
  bulwark, where no ship abeam could have seen them.
- *On the compass deck* (the viewer's part `top`): the not-under-command lights, a pair of lanterns at each of two
  heights, one either side of the mast (one alone is hidden by the mast over 26° and more), the NAVTEX antenna, the
  AIS's position antenna, a wind sensor on the flag yard, the air conditioner's condensing unit.

**What hangs from the deckhead lifts with the compass deck** (the lining, its lights, the overhead console, the periscope,
the grab rails), as the deckhead over the machinery spaces goes with the car deck: so the wheelhouse is looked down into
with nothing over it when she is taken apart. In the register those components say `part: top`.

`assemble.py` takes the other ship's wheelhouse away for it (`REPLACES`: its pieces from the aft wall's forward face to the
front, wings and all; and everything inside the house's own box, cut at the box's faces). The aft wall itself, with the
corridor's doorway and the crew stair's opening, is still the other ship's. 122,200 triangles are built in all, 21,900 of
them the bridge's own in the `bridge` part and 2,800 in `top`; of the other ship's 14,586 on the bridge deck 4,950 are left.

**What class and the yard's calculations changed** (11 November 2026; `yard/class/PA-001`, revision 1). The navigation
lights and the fire detection panel each have two feeders of their own, direct from the switchboards, and the lights'
emergency feeder comes from a section the battery keeps alive through the 45 seconds the emergency generator takes to
start. There are two steering control systems with nothing in common, each fed from its own power unit's circuit. The
propulsion control has two supplies and its two lines leave by different sides. Main and emergency cables enter the bridge
at opposite corners. `yard/calc/bridge_calcs.py`, which reads the model, found what reading the drawing had not: the engine
instruments and the levers hid the sea to 176 m ahead of the bow from a short helmsman (now 62 m; 69 m is allowed); the
wing control stations stood where the house's corner hid 13.5° of the view across the bow (moved outboard: the whole 225°
is clear); two posts of the radar platform stood in the masthead light's sector (the light is 0.3 m higher); a single
not-under-command lantern is hidden by the mast (pairs). Then the owner had the roof raised, and the calculation was
extended to the view upward: what had ended it was not the glass but the overhead console, the periscope and the rolled
sun blinds, all now above the glass's head (an eye at 1.80 m keeps the horizon until she pitches 6.3° by the bow; at
1.60 m, 11.1°). Still open: the sidelights' screens are 0.42 m long and let the lens be seen 14.5° across the bow.

## Her systems: the register, and how the page shows it (`systems/`, `systems.js`)

The owner: "a component register, I.e, what equipment is installed, what's the power what's the main? How's the plumbing,
how's the subsystems and the communication nets. A fully functional realistic well defined ferry". [`systems/README.md`](systems/README.md)
says what is in it and how it is checked. In short: 147 components on the navigation bridge; her supply (440 V three-phase
60 Hz, 105 V for lighting and small power, 24 V from two batteries, a 32 kW emergency generator, and a transitional section
the battery keeps alive through an inverter); five boards with 35 ways and five circuits that come to the bridge direct from
boards elsewhere, each breaker and cable sized and each voltage drop worked out from **the way the cable is actually laid**
through the bridge's trays, trunks and ducts; 31 nets with what every member says or hears; 7 pipes.

On the page:
- **A tap on a fitting** (or a click on foot) opens a card (and moves it a notch, if it is a lever): its tag, subsystem and room, what it is, what it draws and
  from which way of which board (breaker, cable, length, voltage drop), its second supply, its nets with its part in
  each, its pipes. The names in the card are links: to the circuit, the net, the pipe.
- **The panel's second list, *Systems***: her supply in two sentences; the sources; the boards (each opens to its feeder
  and its ways); the nets; the pipes; the equipment by subsystem; links to the register as tables.
- **Whatever is chosen is shown in the model**: a box round each component that belongs to it, and the run of its cables
  (amber for power, blue for a net) or its pipe (green), drawn through whatever stands before them. They stay while one
  walks aboard.
- What cannot be seen (the units inside the console and the stand) is reached from the lists; its card says where it is.

How the page finds the component under a tap: the register gives each one its box in the ship's axes and the viewer's
part it is drawn in; the smallest box that holds the point wins (a knob over its panel, the panel over the console). The
walls, the deckhead and the deck covering do not answer: there the room is named, as before.

## Walking aboard and the outside view

**Zoom on foot.** The owner, 11 November 2026: "I want to be able to zoom out and in on the walk aboard". On foot the
lens one walks with can be changed: two fingers spread or pinched on a touch screen, the wheel (or a pinch on a trackpad)
on a computer, or the keys + and -; 0 is the normal view again. Zoom 1 is the 68° lens as before; it goes from 0.53 × (a
104° lens: a phone held upright sees only 35° across at the normal lens, and 61° at the widest) to 4.8 × (16°, to read a
label across a room), and settles on 1 when brought near it. It is the lens that changes, not where one stands. Looking
closer, the same drag turns one less, so a label can be followed; a pinch does not turn one's head, and when one of the two
fingers lifts the other goes on looking. The left thumb on the stick is not a finger of a pinch. The page says the zoom
for a moment ("Zoom: 2.0 ×") and then the room again. The zoom one leaves with is the next walk's. `checks/zoom.cjs` turns
the wheel, presses the keys and pinches with two fingers, and checks the lens the page then draws with.

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
| A ladder | F, or the button that appears at its foot and at its head | That button |
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
- Her ladders are taken at a button (below). The other ship's own ladders are not climbed.
- Under a deckhead, beam or pipe lower than the walker the eye comes down, keeping 0.12 m under it; through a low
  doorway it comes down to 0.2 m under the lowest height at which the wall is met (one stoops). Where there is less
  than 1.1 m one does not go.
- The way is gone in strides of 2 cm, so a rail is never stepped over, and by the clock, so the pace does not hang on
  how fast a device draws (a pause of more than a quarter of a second is walked as a quarter).
- The deck keys put one down over the same spot on the next deck where one can stand there, else at the nearest such
  place. A walk never begins hemmed in: the start is looked for outward from a room's middle until there is 0.9 m to
  walk from it.

What still does not stop one, and which rooms have no door, is in *Known limits*.

**The ways on foot: her watertight doors, ladders and hatches** (`blender/spec.py`: `WT_DOORS`, `WALKWAY`,
`WALKWAY_VOID`, `LADDERS`; `hull_fittings.py`: `way_aft`, `ladders`, `ways`). The owner, 10 November 2026: "There needs to
be a water tight door that can open to the steering gear", then "Fix the rooms all rooms need to be accessible". The
other ship's drawing gives no way into the spaces below the car deck (its two engine-room ladders end under an unbroken
deck) nor up to the compass deck. Hers, from where the walk begins on the car deck:

- **Below, aft.** In the lower lobby a hatch (0.65 m by 0.60 m, a coaming 0.12 m high, its cover hinged behind the
  ladder) and a ladder down to the flat in the shaft space. From there forward, down six treads (0.18 m each, 0.8 m
  wide between two rails) and through the watertight door in the engine room's after bulkhead (8.42 m from the
  transom) into the engine room and the machinery spaces beyond; or aft, through the door at frame 10 (5.0 m), along the
  gangway between the two fresh-water tanks, and through the door to the steering gear (2.6 m).
- **Below, forward.** From the electrical workshop through a watertight door (26.08 m, 0.8 m to starboard of the
  centreline, where the workshop's wall is clear) into the void, up two treads, and through another (27.5 m) onto the
  thruster room's platform. The collision bulkhead beyond has no door, as the rules require: the fore peak is entered
  from the car deck, by a hatch just forward of that bulkhead and a ladder down to a flat between the chain lockers.
- **Above.** At the head of the port stairs to the bridge wing, a ladder up the house side to the compass deck.

A door is 0.60 m by 1.40 m clear over a 0.20 m sill, its corners rounded 0.10 m: a frame of flat bar standing 5 cm
proud of the bulkhead each side, a 20 mm leaf with a pressed panel, six dogs worked by a handwheel, two hinges to
port. The bulkheads are cut for them (`hull_structure.py`), and so are the other ship's walls where a door stands in
one, and its car deck at the hatches (`assemble.py`, `OPENINGS`). One steps over the sill and stoops under the head:
the eye comes down to 1.28 m in the doorway. **The doors and the hatch covers open by themselves** to whoever comes
within reach on foot (2.4 m of a door, 1.9 m of a hatch, from the deck or from the ladder under it), in 0.8 s, and
shut again behind. From outside, a tap opens one and another shuts it. They have no slider: the file marks them
`auto` (*The file format*).

**A ladder is not climbed rung by rung.** Standing at its foot or its head, a button appears in the bar, named for
where the ladder leads (F does the same); it carries the walker over to the ladder, along it and off at the other end,
1.2 m/s on the level and 0.75 m/s on the rungs. Each end is set at load on the nearest spot with room to stand.

**Spaces that are not entered.** The bow ramp is stowed upright, and the two funnels are uptake casings without a
door: one walks up to them. Chosen in the panel, a walk begins beside them (`stand` in the space's record, written by
`assemble.py`, `STAND`). The four tanks of the double bottom are too low to stand in: a walk begun there starts in the
room over them.

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
  (`file`, `size`), `atlases[]` (the sheets of pictures: the other ship's, then her own; a material's `atlas` is the
  index of the one it is drawn from), `systems` (`file`: her register beside the model; `components`: how many), `materials`, `views[]` (each with `groups[]`: one per deck, with its `id`, `name`, `level`, its
  lift in the exploded view (`explode`), its `meshes[]` and its `spaces[]`), `source`.
- A mesh record gives byte offsets into the block: `pos` (Uint16 × 3, quantised over `bounds`), `nor` (Int8 × 3), `col`
  (sRGB Uint8 × 3), `uv` (Uint16 × 2, into the atlas, only on textured meshes) and `idx` (Uint16, or Uint32 when `wide`).
  `from: "blender"` marks a mesh of her own build; the others are the Town's export.
- `ship.built[]` lists the sections that are her own (`part`, `section`, `date`); `source.blender` names the builder.
- **Parts that move.** `inputs[]` are what can be worked on the page: `id`, `name`, `min`, `max`, `step`, `unit`, and
  how a setting is said (`below`, `above`, `rest`: "Rudder 20° to port", "Rudder amidships"). The page makes a slider
  for each, with two exceptions. An input with `auto: "near"` is a door: it opens to whoever comes near on foot, and to a
  tap; with `auto: "tap"` it is worked by a tap only, on foot too (the drinks machine's door and coin return: nobody opens
  them by walking past). An input with `steps` is a lever: `steps[]` are its positions (`v`, the angle in degrees, and `say`, what the
  position means), `home` the one it rests in, `fitting` the component of the register it belongs to; a tap on the lever
  or on its fitting moves it to the next position, to the end of its travel and back, and it travels there in a moment
  (`stepInput`, `workSteps`). Several movers may answer one input: the same lever at three stations.
  `movers[]` are the motions: `id`, `input`, `axis`, `pivot`, and a `kind`:
  `turn` (the part turns about the pivot by the input's angle), `slide` (it runs along `axis` by the input times
  `ratio`: a sliding door, whose input is in centimetres), `carry` (it keeps its heading and goes with `point` as
  that turns about the pivot: the tie bar), `aim` (it swings about `anchor` to keep pointing at `pin`, which turns about
  the pivot: a ram's cylinder; with `extend` it also runs along that line by as much as the distance has changed: the
  rod). A mover with `on` rides on another moving part and goes with it after its own motion (a flap in a door); one
  deep. A mesh record's `mover` names the motion it takes part in; the page puts the meshes of one motion in one group
  inside their deck and moves the group. The rudder's angle is negative to port and positive to starboard, as a helm
  indicator shows it; a positive angle turns about the upright axis so that the blade's after edge goes to starboard.
  In Blender a moving part is an object with the custom property `mover` (`Part(..., mover='rudder-p')`), and
  `hull_fittings.motion()`, `wheelhouse.motion()` and `stairs.motion()` describe the motions; `build.py` stops if a part names a motion
  that is not described, or a motion moves nothing.
- A space record is a room: `id`, `name`, `text`, `why`, and its box `min`, `max`.
- Axes: metres; the bow is +z, port is +x, y is up with its origin on the laden waterline (keel −1.9, car deck 2.1,
  passenger deck 6.5, bridge deck 9.1, compass deck 11.5).

The decks, bottom to top: `hull`, `machinery`, `car`, `passenger`, `bridge`, `top`.

`ways` (optional) are the ladders: `{id, kind: "ladder", down, up, a, b, line}`, where `a` is the place to stand at
the foot and `b` at the head (x, y, z), `line` (x, z) is where one is while on the rungs, and `down` and `up` name
where it leads from the head and from the foot. A space may carry `stand` (x, y, z): where a walk begun at it starts.

An input may be worked by the page itself and not by a slider: `"auto": "near"` with `at` (a point), `reach` (metres),
`height` (how far above or below `at` still counts as near, 1.5 m when absent) and `normal` (the way through it, for a
door). Such an input opens (goes to `max`) for a walker within `reach` of `at`, shuts (goes
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
  review forbids it): the card shows a picture, `/assets/images/ferry/chisum-card.webp`. It lives under `assets/`,
  not here, because the homepage review's sparse checkout does not include `ferry/`.
- **Retake the card picture when the model changes.** It is this page's cut view from the starboard side with the
  chrome hidden and the lens centred (`camera.clearViewOffset()`, aspect 1200 : 630): Cut 0.5, the camera set through
  `window.__ferry.look` with its target at (0, 6.3, 1.4) and the eye 50 m from it toward (−1, 0.2, 0.3), shot at
  1200 × 630 at scale 2 and reduced to a 1200 × 630 WebP (quality 84). Retaken on 10 November with her own hull. The
  counts in `tools/office-home/review.browser.mjs` (7 cards; Explore 2, Create 3, Learn 2) follow
  `CONFIG.projectExplorer`.

## The bridge, surveyed and designed (`design/bridge/`)

Before section 5 (the bridge deck) was built, the Town's bridge was drawn in CAD (six A1 sheets cut from this page's own `bridge`
group as it then was), every piece of equipment and machinery on it logged with its electrical and plumbing connections (116 rows,
`register.csv`), what the drawing found written down (19 findings), and a realistic wheelhouse laid out from the Ranger III's
pilot house and the Town's design words (`design-basis.json`). It is the survey of what stood there; the navigation bridge that
replaced it is registered in `systems/`. Read [`design/bridge/README.md`](design/bridge/README.md).

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
- The rudders are worked by the page's slider only (the wheel turns with it): nothing steers her, the screws do not turn
  and the engine levers order nothing but their own position, and the hydraulic pipes
  end beside the rams without the hoses that would let the cylinders swing (they swing up to 8°).
- The anchors are simple: a shank, a head and two flukes, without the cable, the shackle or the pipe through to the
  windlass, which is still the Minato Maru's.
- Inside the machinery spaces the frames are hidden behind the Minato Maru's linings, and there are no watertight
  bulkheads of her own at frames 28, 38 and 45, only the rooms' walls.
- Plating seams and welds are not drawn: a plate is told from its neighbour by a slightly different shade.
- The port of registry on her transom is still MINATO, until the owner names hers.

Of the navigation bridge and her systems:
- **The pictures stand still.** A screen shows one moment (heading 042.5°, 11.4 knots off Minato); nothing on the bridge
  answers the Rudder slider yet, no lamp is lit, the wipers and the radar do not move, the levers stand at rest.
- The cable trays over the deckhead lining and the cables themselves are not modelled: a circuit's run is drawn by the
  page from the register's cable ways. The pipes likewise, but for their fittings.
- The aft wall is still the other ship's, with the crew stair's opening 1.50 m high under it (finding BF-12); the stair is
  railed and barred and is not gone down from the wheelhouse.
- The name board on the wheelhouse front is the other ship's plate with her name painted on it (`name_plates.py`); its
  lowest 3 cm is sunk in the visor.
- The stern light is in the register and on its way of the navigation light panel, and is still the other ship's drawing,
  at the after end of the passenger deck.
- Powers are typical figures, the sizing rules are recalled and not checked against a text, and nothing is class-approved
  (`systems/README.md`, *Limits*).
- Panel faces take the light like paint: in low sun through the glass a face can be hard to read. Screens shine by themselves.
- The registered sections end at the bridge: what a net or a pipe runs on to below is named as a place, not yet as a component.

Of walking aboard:
- **Every room is reached on foot** from where the walk begins, with three kinds of exception. The stowed bow ramp and
  the two funnel casings are walked up to, not into. The four double-bottom tanks cannot be stood in. And the other
  ship's own two engine-room ladders are not climbed: they end under an unbroken deck, and hers do their work.
- The hatch to the fore peak lies in the vehicle lane, 0.25 to 0.85 m to port of the centreline: a raised coaming
  where cars drive. A flush hatch, or one in a bow house, is a decision for the car deck's own section.
- The ladder to the compass deck stands on a ledge 0.4 m wide beside the port stairs, and at its head there is no
  rail to step through: the compass deck has none aft of the wheelhouse.
- On a ladder the walker is carried along a straight line, not hand over hand, and passes through the hatch cover's
  place whether or not it has finished opening.
- **The other ship's doors do not swing.** One walks through the shut leaf, and through the wall behind it where the
  drawing has no opening there. A door is known by its shape only: a door drawn in several pieces, or a leaf more than
  6 cm thick, would be a wall, and a wall panel shaped like a door would let one through.
- Just inside the steering-gear door the tie bar lies across the way, 0.46 m over the flat. It moves with the
  rudders, and what moves is not in the walker's way: one walks through it.
- Every stair is walked on its own (`checks/stairs.cjs`), but the whole way from the wheelhouse to the engine room
  floor has not been walked in one go: between the crew stair's foot and the lobby it runs through the other ship's
  saloon, and from a main stair's foot to the engine room entrance it crosses the car deck and the lower lobby. The
  owner's internal stair trunk (the list above) is not built.
- The main stairs' doors open onto the vehicle lanes, not into the lower lobby (JSY-STD-401 section 4). The space under
  the port main stair's lower flight has no use and no door.
- 187 of the other ship's pieces hang in the air (`afloat.py --all`), 125 of them in the machinery spaces: they go as
  those sections are rebuilt. On `main` as published on 11 November, three things of hers in the fore peak still do (the
  chain lockers and the ladder); they are fixed on the development branch.
- The chain lockers still end 4 cm under the car deck, with no spurling pipe drawn to the windlass above.
- The stair standard's outside requirements are recalled, not read.
- 629 pairs of the other ship's own faces lie in one plane over each other (`zfight.py --all`): the owner's "Z fighting
  is not allowed" holds for her own parts only so far.
- The bridge deck's walls, cabins, galley, mess, emergency generator room and CO₂ room are still the other ship's. The
  galley's door is 0.60 m because of the other ship's unit in its doorway.
- Not built, and asked for by the owner on 11 November 2026: an auxiliary engine room near the funnels (to be settled
  with the machinery spaces; the emergency generator room is already beside the funnels, on the bridge deck). The
  funnels themselves are still the other ship's; only the line's mark on them is hers.
- Offline: saving has been tested in Chromium only, not on an iPhone.
- In the hull's spaces without a floor of their own (the shaft space beside its walkway, the void, the fore peak) the
  walker stands on the structure: the floors' top edges and the stringers.
- Along a wall that lies askew to her length (her sides at the ends) the walker stops where it meets it: it slides
  along walls that run fore and aft or athwartships only.
- No footsteps, no head-bob, no light of its own: the spaces are lit as the outside view lights them.
- Measured on this machine only, which draws in software (about one picture a second with the eye inside her): the
  frame rate while walking on a phone or a laptop is not measured.

Of the compass deck:
- The lamps are not lit and the radar does not turn. The stern light belongs to the passenger deck and is still the
  Minato Maru's; so is the funnels' exhaust.
- Nothing of the wiring, the antenna cables or the mast's ladder (there is none: the mast is serviced from the platform)
  is drawn, and the roof has no hatch to the wheelhouse below.
- The vent heads are over the rooms the Minato Maru's drawing has under them; where those rooms are rebuilt they may move.

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

### 11 November 2026: the 68 m ship, her stern ramp and its lights

Run in a cloud container (Blender 4.0.2 headless, Chromium with software GL), on the model as committed.

| Check | Result |
|---|---|
| `ferry/blender/make.sh` | **built: every check passed.** In order: `ga.py` (93 spaces on 5 plans, 8 watertight bulkheads, about 1,742 t); the build's own tests (the plating's inner face never nearer the outer than 3.8 mm and nowhere through it; structure never nearer the plating than 6.9 mm; every solid looks outward; 41 motions, each with its parts; 237,628 triangles in 186 meshes); `assemble.py` (1.77 MB, 237,141 triangles, 93 rooms, 16 stairs, 167 components); `check.py` all passed |
| `zfight.py` | **0 pairs** of faces in one plane among 353 pieces. Its second list names 4 coverings "close under another surface": three panel faces in the wheelhouse that lie under their bezels by design, and the line's name on the starboard side at 43 m. That one was measured point by point against the plating: the lettering stands 3.4 mm and more outside it, so the listing is the check's own error (`JSY-STD-403`, section 5, row 5). It does not stop the build |
| `afloat.py` | 4,579 pieces: 4,570 held, 9 flat pictures on a surface, **0 afloat** |
| `spans.py` | 17 runs of pipe, cable and wire (71 m), **every one carried** |
| `checks/bridge.cjs` | 25 of 25 |
| `checks/doors.cjs` | 17 of 17: every door opens and shuts; the stern ramp lowers through 90° and is raised again; **each cylinder's rod end stays on the ramp's lug from raised to 100° (0.0 mm off) and has run out 1.22 m when the ramp lies level**; the sternlight is drawn on the centreline 0.11 m abaft the transom, 7.72 m over the waterline; the ways on foot through the watertight doors, a casing's doorway, the corridor into the wheelhouse |
| `checks/stairs.cjs` | 50 of 50: all 16 stairs walked up and down |
| `checks/travel.cjs` | 5 of 5: quick travel to every deck and each of the 93 rooms |
| `checks/zoom.cjs` | 14 of 14 |
| `checks/offline.cjs` | 5 of 5 |
| `yard/drawings/stern_drawing.py` | Writes JS3-304 and prints the cylinder's lengths (3.04, 4.26, 4.33 m) and where the floodlights' beam falls (5.21 m abaft the transom; the ramp ends at 4.18 m). The sheet was looked at in Chromium, whole and in two close-ups |

- **Published to `main` as `323354b`** on the owner's "Publish now", **and live**: fourteen live files compared with
  `main`, all the same; `data/ferry-atlas.webp` answers 404; the live page loaded in Chromium shows her at 68.4 m with
  93 rooms, 16 stairs, 167 components, lowers the stern ramp, and raises no error.
- **Run the page checks one at a time.** Six at once, `bridge.cjs` failed one check: a lever had turned 1.15° of its
  16.26° when the check looked, 1.5 s after the tap. Alone it passes.
- **Looked at**: the stern in Cycles stills (three, from astern, from above and close to), and on the page itself at
  1400 × 900 with the ramp raised and level, and the sternlight close to.
- **Not done**: nothing was tried on a real phone or a real graphics card. The depth figure in `JSY-STD-403` is an
  estimate. The floodlights and the signal are drawn fittings: they are not in the register and the page has no night.
  The bridge's visibility calculation (JS4-402) is the first Chisum's and is not remade for the longer, higher bow.

### 11 November 2026, later: zoom on foot

- The owner: "I want to be able to zoom out and in on the walk aboard". `app.js`: `setWalkZoom`, the two-finger pinch,
  the wheel and the keys (section "Walking aboard" above); the hint line says how.
- `node ferry/checks/zoom.cjs`: all passed (the wheel both ways and back to normal; the limits, 104° and 16°; 0, + and -;
  a drag at 3 × turns a third as far; two fingers spread to twice as far apart give 2.00 × and do not turn the head;
  pinched, wider; one finger lifted, the other looks on; a pinch names nothing; leaving gives the outside view its lens
  back). `doors.cjs`, `bridge.cjs`, `stairs.cjs`, `travel.cjs`, `offline.cjs` all passed.
- Looked at in pictures on a phone-sized screen (390 by 844) at 0.53 ×, 1 × and 3 ×, before the drinks machine.
- **Not checked:** on a real phone or tablet. The two-finger pinch is driven by Chromium's touch input and, for one finger
  lifting, by the pointer events themselves; Safari on an iPhone is not tried.

### 11 November 2026, after it: nothing in the generator room runs through the air

- The owner: "There looks like too much floating objects in the emergency generator room why aren't you working according
  to Spec?" The room's cables, ducts and pipes are reworked onto ladders, a floor duct, trapezes, a pipe rack and brackets;
  JSY-STD-402 says how things are carried; `blender/spans.py` is new and is run with the other checks.
- Build, assembled twice to the same two files; `check.py` all passed; `zfight.py` none of hers; `afloat.py` none of hers;
  **`spans.py`: 23 runs of pipe, cable, conduit and wire (73 m), every one carried** (its first run found a 1.95 m length
  of the supply line without a support; a post from the tank's stand now carries it).
- Looked at in pictures from the same three places as before.
- **Not checked by a program:** the hangers' spacing and size; the wheelhouse's and the hull's older fittings, which were
  built before this check and are named in the standard's open points.

### 11 November 2026, after the general arrangement: the emergency generator room

- The owner: "Build the ships emergency generator room", with the drawing. Section "The emergency generator room" above.
- Atlas (3072 by 4096, at the limit kept for phones), build (15,000 triangles for the room), assembled twice to the same
  two files (2.20 MB, 300,700 triangles); `check.py` all passed; `zfight.py`: no face of hers in one plane over another;
  `afloat.py`: nothing of hers hangs in the air; `bridge.cjs`, `stairs.cjs`, `doors.cjs` (with a walk from the room's
  escape route out through its door, and the damper's lever left alone by a passer-by), `travel.cjs` (47 rooms),
  `offline.cjs` all passed.
- Looked at in pictures: the room from the battery corner, from the escape route, toward the switchboard and door, and
  from outside on the house top.
- **Not done or not checked:** no rule text read; the room's lighting is the page's daylight plus four glowing fittings,
  not a lit interior; the dampers' blades are inside their casings and not drawn; the switchboard's and the panel's
  fronts are pictures, not doors that open; nothing on a phone.

### 11 November 2026, after the car deck: the owner's drinks machine, in two languages; Johansson Line

- The owner: "Use this vending machine instead" (JPVM-2R20), "Use English so we can see what we are selling , English
  and Japanese", and "Johansson Line not lines by the way". Section "The drinks machine" above says what was done.
- Atlas, build, assembled twice to the same two files; `check.py` all passed (the size budget raised to 3 MB: 2.09 MB,
  290,000 triangles); `zfight.py`: no face of hers lies in one plane over another (the machine's file had five such
  pairs); `afloat.py`: nothing of hers hangs in the air (sixteen of the machine's inside parts did); `bridge.cjs`,
  `stairs.cjs`, `doors.cjs` (with the machine: flap, tap, tap again), `travel.cjs`, `offline.cjs` all passed.
- Looked at in pictures: the machine from across the lobby, its labels close to, its door open, the hull's lettering.
- **Not done or not checked:** the machine's lettering is not read by anyone who reads Japanese; its sides and back, its
  flap open and its coin return pressed are not looked at in pictures; nothing on a phone; the page's material for clear
  glass and for lit parts is new (`clear`, `emissive`) and seen in Chromium's software renderer only.

### 11 November 2026, last: the car deck's patches, and the drinks machine built to the World's own

- The owner, with a picture from the tablet: "Cargo deck has lots of Z fighting". It was not two faces in one plane, and
  `zfight.py` had not seen it: over the engine room the other ship draws that room's deckhead panel as a box whose top
  lies 12 mm under the car deck's surface, in the material its coverings are drawn in, which the page pulls toward the
  eye; seen low across the deck the panel came through the deck's paint in patches, and from higher up it hid the lane
  markings altogether. Its top face is cut away (`assemble.OPENINGS`). Before and after, from the bow: the deck was
  light with no lane lines; it is now its grey-green with the yellow centre line and the lanes' dashes.
- `zfight.py` now also lists this second kind (a face drawn with a pull toward the eye lying close under another that
  looks the same way): 94 today, most of them the other ship's floor coverings 3 mm under the feet of its furniture.
  It lists them and does not fail on them yet: some are meant (a dial's face under its bezel), and they are not sorted.
- The owner, of the drinks machine: "It doesn't look like the machine in Johansson World?" It did not: it had been
  drawn from the World library's description. The World's builder is not in this repository but is served on the
  owner's site (`johansson-town/src/world/vending.js`, `commerce/vending-catalogue.js`), and `blender/vending.py` is
  now built to it: a mid-1990s can machine 1.03 by 1.83 by 0.74 m in the bottler's red with a cream face, the lit
  Minato Drinks header over its cold and hot strips, two bands of glass with eight cans each over their price plates
  (the catalogue's products, colours and order: sanpin, Harbour Tea, shikuwasa with its sold-out lamp, Ryukyu Cola;
  J-Coffee, Dockside, corn soup hot at the right), buttons on the rails, the J-Coffee poster, the money panel, the
  take-out pocket behind its smoked flap, a poster on each side and the maker's plate. What is painted on it is drawn
  after the World's painted sheets, not copied from them pixel for pixel; the World's rounded corners are square here.
- The Blender build, `assemble.py` twice with the same hashes, `check.py`, `zfight.py`, `afloat.py`, `bridge.cjs`,
  `stairs.cjs`, `doors.cjs`, `travel.cjs`, `offline.cjs`: all passed. Looked at: the car deck from the bow before and
  after; the machine from the lobby.

### 11 November 2026, later still: Johansson World's drinks machine in the lobby

- The owner: "Can you bring the vending machine from Johansson World into the accommodation ?" `blender/vending.py`
  builds a Johansson Vending JV-16C in the passenger deck's lobby, in place of the other ship's two plain boxes
  (`assemble.REPLACES`: `vending`): sixteen columns in two rows behind glass, a button under each (blue cold, red hot),
  the display, coin slot, note slot and return lever to the right, J-Coffee in the three bottom columns under the coin
  slot, the maker's band, what it sells, and a delivery flap that swings in for whoever stands before it. **It is built
  again from what the World's library says of the machine** (`avatar-creator/world-library.json`); the World's own model
  and builder (`johansson-town/src/world/vending.js`, `vending-machine.glb`) are not in this repository, so it is not a
  copy of that model and may differ from it in shape and colour.
- The Blender build, `assemble.py` twice with the same hashes, `check.py`, `zfight.py`, `afloat.py`, `bridge.cjs`,
  `stairs.cjs`, `doors.cjs` (26 doors and flaps now), `travel.cjs`, `offline.cjs`: all passed. Looked at from the lobby.

### 11 November 2026, later: the line's mark

- The owner: "we need to make the shipping company sign Johansson Lines and a big J similar to Jonsson lines ships but
  my own thing"; of the page's first icon, whose J sat low and to one side: "The Johansson emblem with the J needs to be
  aligned and pushed on the chimneys update pls". The mark is her own, drawn in `blender/emblem.py`: a J of one weight
  (a stem, a hook at its foot, a bar at its head) set in the middle of a ring by its own outline. `blender/livery.py`
  paints it in white on the outboard and inboard face of each funnel, laid on the two facets either side of the
  funnel's ridge and cut along it; the other ship's anchor pictures are gone. `python3 ferry/blender/emblem.py` draws
  the page's three icons from the same shape. `hull_markings.py` letters JOHANSSON LINE (the owner, later the same day: "Johansson Line not lines by the way") in the funnels' teal along each
  side of the hull, 0.62 m high, forward of the midships draught marks.
- The Blender build, `assemble.py` twice with the same hashes, `check.py`, `bridge_calcs.py`, `zfight.py`, `afloat.py`,
  and `bridge.cjs`, `stairs.cjs`, `doors.cjs`, `travel.cjs`, `offline.cjs`: all passed. Looked at: the port funnel's
  outboard mark from the quarter (no seam at the ridge), the 192 px icon, the port side with the lettering.
- Not looked at: the starboard funnel, the inboard faces, the starboard lettering.

### 11 November 2026, after the publication: quick travel on foot

- The owner: "In the free walk add quick travel to the decks"; "The whole ship is not traversable as it is now , I'll
  identify the problems offline"; "But I want to explore every deck and every room". On foot the bar has a list, **Go
  to**: every deck (it puts one on that deck nearest to where one stands) and under each deck every room of it (it puts
  one in the room). The keys 1 to 5 are the decks from the lowest up. `travelTo` and `fillTravel` in `app.js`.
- `node ferry/checks/travel.cjs`: the list has 5 decks and 46 rooms; each was chosen; each deck was reached, each room
  could be stood in, the walker stood inside the room named, and from there could walk 0.3 m or more in some direction.
  That one can be put in every room does not mean every room is reached on foot from every other: the owner reports
  that the ship is not traversable throughout, and no check walks from room to room yet.
- `bridge.cjs`, `doors.cjs`, `stairs.cjs`, `offline.cjs`: all passed with the list in the bar. Looked at on a 390 px
  screen in the corridor: the list, Deck below, Deck above and Leave fit in the bar.

### 11 November 2026, last of the day: the bridge deck's corridor and outside, no z-fighting, offline

- Published to `main` as `e940780` on the owner's "Push to main": 13 of 13 live files matched the tree pushed; on the
  live page, at phone width, Save offline saved 15 files and with the network cut the page opened again with the whole
  model. Not tried on an iPhone.

- The Blender build (43 motions), `assemble.py` twice with the same hashes, `check.py`, `bridge_calcs.py`: all passed.
- `zfight.py`: no face of hers lies in one plane over another (629 pairs among the other ship's own).
- `afloat.py`: nothing of hers hangs in the air (the other ship's: 179 things).
- `node ferry/checks/doors.cjs`: 25 doors, gates, hatches and cabinet doors each open to a tap and shut again; walking
  down the middle of the corridor to the wheelhouse door the cabin doors stay shut; turning into the mess its door opens
  and one walks in; the corridor's aft door lets one out onto the platform. No console errors.
- `node ferry/checks/offline.cjs` (390 px wide): saved 15 files, 3.9 MB; with the network cut the page opened again with
  the whole model; no wider than the screen; Install says where the command is.
- `bridge.cjs` (25, with its phone checks and the two new buttons in the bar) and `stairs.cjs` (8 stairs): all passed.
- Looked at: the corridor from its aft end (boards, rails, doors, deckhead), the aft wall with the corridor door and the
  hose box open, two windows from outside, the mess door standing open from the corridor.
- Not done: no picture of the galley, WC or cabins' doors from inside the rooms; the starboard windows were not looked
  at; nothing was tried on a real phone.

### 11 November 2026, after it: published, and the fore peak

- Published to `main` as `4dcad33` on the owner's "Yes". The Pages build served the new model within the wait; 13 of 13
  live files matched the tree pushed (the model, the register, her sheet of pictures, `app.js`, `systems.js`, the page,
  this README, the stair standard, the document register, `afloat.py`, `stairs.py`, `stairs.cjs`, the handover). The
  live page, opened in a browser: 8 stairs and both stair doors in the model, no console errors, and the wheel on its
  helm unit in the picture taken there.
- Then, on the branch only: the fore peak (ladder stand-offs, the flat's bearers, legs under the chain lockers). The
  Blender build (0 corners through the plating), `assemble.py` twice with the same hashes, `check.py`,
  `bridge_calcs.py`, `bridge.cjs`, `stairs.cjs`: all passed. `afloat.py` with an empty known list: 4,867 pieces, 2,366
  of hers, nothing of hers hangs in the air. On foot on the fore peak's flat: stood at 0.20 m, "Machinery spaces · Fore
  peak". No picture of the fore peak was taken.

### 11 November 2026, the stairs, and nothing hanging in the air

- `python3 ferry/blender/atlas.py`, the Blender build, `assemble.py` twice with the same two hashes, `check.py` (all 48
  passed), `yard/calc/bridge_calcs.py` (all hold: the helm unit stands 1.14 m over the deck, under the 1.22 m of the
  levers ahead of it).
- `node ferry/checks/stairs.cjs`: 8 stairs in the model; each within its class's limits, walked up from the deck below
  to the deck above and down again (main stairs: from 2.10 m to 6.51 m arriving 6.23 m from the transom, and down to
  2.10 m at 14.51 m; crew stair, engine room ladder, both wing ladders, both after ladders likewise). No console errors.
- `node ferry/checks/bridge.cjs`: all 25 passed with the helm unit and the other fixes.
- On foot from the vehicle lanes into each foot lobby through its door: the door ran open 0.98 m as the walker came
  near and the walker came to rest 3.84 m off the centreline, inside the lobby (port and starboard).
- `python3 ferry/blender/afloat.py --part … --allow ferry/blender/afloat-known.json`: 4,829 pieces, 2,328 of hers;
  nothing of hers hangs in the air but the three known things in the fore peak (4,855 pieces after the last fixes,
  2,354 of hers).
- Looked at: the wheel from beside the helm (hub, shaft, flanged bearing, helm unit on the stand); the port stairhead
  from the lobby (guard, capping rail, handrail and newel); the port stair from its foot lobby (two flights, landing,
  rails on brackets, marked edges, the door's leaf and its sign); the starboard door from the lanes (frame, leaf, signs,
  the hatched zone).
  Also the starboard foot lobby from inside (stair, door, light) and a chair beside the wheel (the armrest on its lug,
  the order pointer on the helm unit's lid).
- Not done: no picture was taken of the sun blinds' brackets, the searchlight's trunnions or the screws after the fix
  (the check that found them passes); the stairs were not looked at on a phone (`bridge.cjs` ran its two phone checks
  of the page's layout, which passed).

### 11 November 2026, after it: the wheelhouse roof raised

The owner: "Yes make it realistic". The wheelhouse 0.30 m taller, the roof in two levels, the glass and the doors carried
up, what hangs from the deckhead lifted above the windows' head, the mast and the compass deck's fittings up with the roof.
`build.py` (122,573 triangles; **the glass shows 224° of 225° to an eye at 1.50 m and to one at 1.80 m**; all solids
outward; 28 motions), `assemble.py` twice with the same two files (1,775,862 bytes, 236,560 triangles), `register.py` (all
checks hold; a few cables are half a metre longer), `check.py` all passed, **`bridge_calcs.py`: all calculations hold**,
with a new one, the view upward (it failed once, on the rolled sun blinds hanging 4 cm over the glass: lifted into the
head frame). `checks/bridge.cjs` **25 of 25** (new: from the house top over the step block onto the compass deck,
11.50 to 11.80 m). Looked at in pictures: from the wheel with the eye at 1.80 m, the wheelhouse from outside, the step in
the roof, the aft wall inside (where the other ship's wall ends and hers is carried up there is a joint line at 2.08 m).
The homepage card's picture is retaken by the recipe above. Not run: the homepage's own review (only the card's picture
changed); the walk tests of the other decks. Published to `main` the same day on the owner's word.

### 11 November 2026, last of all: class answered, and the levers

The bridge as changed for class comment sheet PA-001 revision 1, and the levers the owner asked for. `atlas.py` (55
pictures; two faces redrawn lower, the board doors lettered from the register), `build.py` (122,175 triangles; glass 224°
of 225°; all solids outward; **28 motions, each with its parts**: the 17 before, nine levers at three stations, the tiller
and the wheel), `assemble.py` twice with the same two files (1,772,194 bytes, 236,175 triangles), `register.py` (147
components, 146 in the model, 40 circuits, 31 nets, 7 pipes: all checks hold), `check.py` all passed.
**`yard/calc/bridge_calcs.py`: all calculations hold** (sea hidden to 62 m ahead of the bow of 69 m allowed; two blind
sectors of 4.0° outside the wheelhouse; each wing 225° clear; the masthead and anchor lights unobstructed, no bearing on
which both lanterns of a not-under-command pair are hidden; radio battery 87 Ah needed of 100 Ah; 31 Ah of the general
service bank's 128 Ah in the transitional half hour). Its earlier runs failed five times on real defects, each corrected in
the design: the list is in the bridge's section above. `checks/bridge.cjs` **24 of 24**: three new (on foot, a tap on the
port engine lever moves it a notch and shows its card; the same lever at the console and on both wings has turned 16.26°;
the wheel turns four degrees for one of rudder). Looked at in pictures: the console from the wheel, the control heads at
rest and worked, the port wing's station, the view from its levers across the bow, the mast. Not run: the homepage's own
review (nothing of the homepage changed); the walk tests of the other decks (nothing of them changed). Published to `main`
the same day on the owner's "Merge current progress to main so I can look at it", with the rename and the yard's paperwork.

### 11 November 2026, last: renamed Chisum

`name_plates.py` on the other ship's sheet (bow, transom and board lettering in the same ink, height and spacing; looked at
on the sheet and in the model: CHISUM on the bow, over MINATO on the transom, on the name board); `atlas.py`, `build.py`
(119,623 triangles: her name is three letters shorter), `assemble.py` twice with the same files, `check.py` all passed (one
new: the model, the register and the specification agree on her name), `checks/bridge.cjs` 21 of 21. The homepage card's
picture is retaken under its new file name. Not run: the homepage's own review (its counts do not change; only the card's
title and picture file do).

### 11 November 2026, later: the navigation bridge and her systems

- `systems/register.py`: all its checks hold (145 components, 41 ways on 5 boards, 28 nets, 7 pipes; the worst voltage drop
  in all is 8.8 % on a battery way, where 10 % is the limit, and 4.2 % on alternating current, where it is 6 %). Its first
  run found the Minato Maru's searchlight breaker under her own rule (`systems/README.md`).
- `build.py`: 119,692 triangles; its checks unchanged (plating never nearer than 10.4 mm, structure 5.2 mm, 0 corners
  through, solids looking outward, now for 33 parts of the bridge too; 17 motions, each with its parts: the corridor door
  is new). `assemble.py` twice: the same `ferry.bin.gz` and `systems.json`. `check.py`: all 41 passed, six of them new
  (two sheets of pictures, her own drawn from, the register beside the model with as many components as the model names,
  every component within the model and in one of its parts, every consumer of every way registered).
- **`checks/bridge.cjs`, 21 checks, all passed** (headless Chromium, software rendering, 1400 × 900 and 390 × 844): the
  register is read; 144 of 145 components have a place in the model (the stern light has none); 139 answer at their own
  place; 96 boards, ways, nets, pipes and subsystems are shown; the radar's card names BD2 way 1, 105 V and its nets; on
  foot from the corridor through its door into the wheelhouse, stopped by the stand, the console, the chart table, the
  log desk and the bar at the stair's head, through each wing door over its sill, held by the bulwark, off the port wing
  aft onto the stairs, and back to the corridor; a tap on foot names what is tapped; on a phone the page is no wider than
  the screen and the card stands over the bar; no console errors.
- **That check found a fault of this build's own**, put right before it was kept: the locker under the boards stood in
  the port doorway (the walker could not leave by it), so the port door was moved forward to mirror the starboard one.
  And measuring the glass from the helm found another: the new forward corners had opened a blind sector (193° of 225°);
  slimmed, they show 224°, and the build now measures it every time.
- Looked at: from the helm, down on each bay of the console, the aft wall, the chart table, both wings, the room from above
  with the compass deck lifted, a board and a net shown with their runs, the card on foot; outside from the bow quarter,
  the port side and ahead. The homepage card's picture is retaken.
- **Not run:** any real phone or GPU, an actual tap by a finger, Safari and Firefox; the walk of every room of the ship and
  the count of rooms reached on foot (the script of the earlier sessions is not in the repository: nothing below the
  bridge deck changed, and the ways onto the wings and into the corridor are checked above); the page with the register
  missing or late.

### 11 November 2026, the wheelhouse

`build.py`: 103,834 triangles, its checks unchanged (plating never nearer than 10.4 mm, structure 5.2 mm, 0 corners through,
solids looking outward, now also for the wheelhouse's solids; 16 motions, each with its parts: the two wing doors are new);
`assemble.py` twice: the same file; `check.py --town …`: all passed. 7,970 of the Town's wheelhouse triangles dropped, the
starboard wall cut for the window (4 triangles), the new part added. Walking: 62 checks, all passed; rooms on foot as before
(the starboard wing walks further). The page's eleven standard pictures: no console errors. Looked at: the wheelhouse from the
helm, from either side of the console, looking aft, at the doors shut and open, on both wings, and from outside from four sides. The
glass's arc from the helm measured on the built model: 224°. Not run: any real device; the doors' swing seen by a person, not by a
picture.

### 10 November 2026, the compass deck and mast

`build.py`: 97,474 triangles, its checks unchanged (the plating's two faces never nearer than 10.4 mm, structure never
nearer than 5.2 mm to the plating, 0 corners through it, solids looking outward, now also for the roof's solids);
`assemble.py` on the Town's export and again on its own output: the same file; `check.py --town …`: all passed. The
Town's 1,164 roof triangles are dropped and 9,332 of hers added. Walking: 62 checks, all passed (58 before, and four
for the roof: the rail holds one in at x 2.78, the gap lets one reach the ladder, the binnacle and the front rail hold
one at 21.8 and 22.8 m); 46 of 46 rooms reached on foot as before. The page's eleven standard pictures: no console
errors. Looked at: the roof from outside before and after from the same camera, and on foot along the roof, at the
mast, at the forward corner and among the vents. Not run: any real device.

### 10 November 2026, after it: heavier frames (from the reference drawings)

`build.py` (88,142 triangles, 14 motions) with its checks unchanged (the plating's two faces never nearer than 10.4 mm,
structure never nearer than 5.2 mm to the plating, 0 corners through it, solids looking outward); `assemble.py` on the
Town's export and again on its own output: the same file; `check.py --town …`: all passed. Walking: all 58 checks, and
46 of 46 rooms reached on foot, as before. The page's eleven standard pictures: no console errors. Looked at: the open
hull from forward before and after (twice as many frames in the fore peak, each deeper) and the engine room (nothing
stands through the other ship's linings). **Not seen:** a difference from inside the steering-gear room or from a
distance: a frame's face grew from 50 to 65 mm, which needs a close look. Not run: any real device.

### 10 November 2026, the last: every room on foot

Headless Chromium with software rendering, as before. 58 checks, all passed, no console errors: the 49 below, and
- the Ladder button is in the bar at a ladder only;
- three ladders; at each one's head the button names where it leads, it takes the walker down to the foot (0.27 m in
  the shaft space, 0.20 m in the fore peak, 9.11 m on the bridge deck), where the button names the way back, and up
  again;
- from the electrical workshop forward for 4 s: through two watertight doors and up the void's steps onto the thruster
  platform (-0.44 m, 28.27 m from the transom);
- chosen in the panel, the ramp and each funnel: the walk begins beside it, and one can walk on from there.

Also:
- **Where one can get to** (the flood, by the walker's own rules, ladders among them): **46 of the 46 rooms on foot
  from where the walk begins**, the ramp and the two funnels counted when one stands within 0.6 m of them; the four
  double-bottom tanks are not counted.
- **Every room** begun on foot (all 50): a place to stand in each, with 0.9 m or more to walk from it.
- **Looked at, on foot**: the hatch in the lower lobby with its cover open and the ladder going down; the ladder to
  the compass deck at the head of the port stairs; the fore peak's ladder and hatch from its flat; the door to the
  void standing open from the electrical workshop, the void's steps and the thruster room's door beyond.
- **The data**: `build.py`, 87,358 triangles, 14 motions, its checks unchanged. `assemble.py` on the Town's export and
  again on its own output: the same file. `check.py --town …`: all passed. Nothing of the other ship's is left in the
  doorway to the void or in the two hatches (counted).
- **Found and put right on the way**: the Ladder button stayed in the bar after one had left the ladder (the page's
  own rule for what shows while walking overrode `hidden`).
- **Not looked at**: the ladder from below in the shaft space; the thruster room from its door; the hatch covers
  swinging. **Not run**: any real device; a screen reader.

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
