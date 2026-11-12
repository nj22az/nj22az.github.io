# The machinery complex: audit as found (milestone 0)

Johansson Shipyard · design record · 12 November 2026 (afternoon) · newbuilding No. 1, the Chisum

The owner, asked what to take up next after the bridge's bay was published: **"Machinery complex"**. It is the first
environment the production directive names (`../reference/production-directive-2026-11-12.md`): the engine room, its
platform and galleries, the engine control room, the main switchboard room, the workshop and the store, as one continuous
two-level place. The directive's first milestone is this: pictures of what is there, and a register of what is wrong or
missing, **before anything is built**. Nothing was built or changed in the ship for this record.

**What it was compared with.** The yard's own basis for her machinery, `machinery-design-basis.md` (a research agent's
proposal of 12 November, 1,687 lines: every machine with its maker, size and place, every system as a list of connections,
the load list, the control room as built in 1975 and as refitted), and the general arrangement, revision D (`ga.py`).
The basis says of itself that it is "a proposal for the owner's approval": it is not yet approved.

## How the pictures are taken

`ferry/tools/shots-machinery.cjs <folder> [views]` (new, on the pattern of `shots-bridge.cjs`): twenty fixed views from the
page itself on foot, an eye and what it looks at in the ship's own measures (metres to port, metres from the transom,
metres above the keel), drawn on this Mac's graphics card (*ANGLE Metal Renderer: Apple M1 Pro*), no errors on the page.
The pictures are in `/Users/nilsjohansson/Developer/chisum-screens/2026-11-12/12-machinery/0-as-found/` (outside the
repository). The build photographed is the published one (`main` at `0a50979`; the model of `8d4a526`). Six of the
twenty were opened for this record and are named below; the others were taken and not looked at.

## What she has below the main deck

**51,022 triangles of her 3,057,036 are in the machinery spaces**, in 44 objects:

| Is there | What |
|---|---|
| Built, and to the yard's standards | The steering gear (two rams, tillers, tie bar: it works); five watertight doors with their dogs and wheels (they open); the two stairs from the galleries to the tank top (JSY-STD-401); the ladder to the lower hold |
| Built as bare steel | The tank top; the platform at 4.0 m with its plates, bearers, pillars and rails; the walls of its four rooms, with their doorways and two windows; the after passage's walkway; light fittings (the room is lit by the light traced through her) |
| A placeholder | The shafting inside her: each intermediate shaft a plain bar, each coupling and plummer block a plain drum on a block; the bow thruster's motor |
| Not there at all | Main engines, reduction gears, flexible couplings, shaft generators, pitch oil units and distribution boxes; generating sets; boilers and economisers; every pump, cooler, filter, separator, compressor, receiver and tank; the floor plates of the lower level and everything under them; all piping, ducting, exhaust and uptakes; cable ways; the lifting rails and the soft patch; the main switchboard, the transformers and the group starter boards; the control room's desk and everything on it; the workshop's and the store's fittings; signs, tags, extinguishers, telephones, alarms |
| Not registered | **The register (`ferry/systems/`) has no component below the main deck**: 186 components, all of the bridge, the compass deck, the emergency generator room and the stern. Nothing in these rooms answers a tap, and no circuit or pipe is recorded |

## Heights, measured in the model as built

Asked by the directive before any geometry is altered. From the part file, at the places named (to the plating; a deck's
ordinary beams are 0.25 m deep under it):

| Place | Floor, above the keel | Clear to the plating over it | Under the beams or bearers |
|---|---|---|---|
| Engine room, tank top, on the centreline and where an engine is to stand | 1.60 m | 4.99 m (the main deck) | 4.74 m |
| On the tank top under a gallery; in the shaft space under the platform | 1.60 m | 2.39 m (the platform's plates) | about 2.2 m (the bearers' depth was not measured) |
| On the platform and its galleries; in the control room, the switchboard room, the workshop | 4.00 m | 2.59 m | 2.34 m |

So a person walks upright everywhere today. **With the basis's floor plates at 2.00 m, the way under a gallery is 1.99 m
to the plates and about 1.8 m under the bearers** (the basis says 1.75 m, "a space to stoop in" in the shaft space): low
for a tall person, and to be drawn before it is built. The page's walker is 1.70 m tall and ducks to 1.25 m.

## The defect register

Severity: **high** stops the complex from being what the directive's test asks ("stand beside a diesel engine, inspect
the machinery and its mounting, walk up to the control room, open a switchboard, and recognise the engineering
arrangement"); **medium** is wrong and is put right as its place is built; **low** is finish.

| | Severity | Where | What, and the evidence | Proposed correction |
|---|---|---|---|---|
| M0-01 | high | Engine room, lower level | **No machinery.** The floor is an empty tank top 21.6 m long (`er-from-walkway.png`, `er-centre-aft.png`, `er-port-gallery.png`) | Milestone 1 and 2: every machine of the basis's section 2.3 at its place, the two main engines, gears and shafting first |
| M0-02 | high | The platform's four rooms | **Empty rooms.** The control room is four walls, a floor and two windows (`ecr-forward.png`); the switchboard room, the workshop and the store the same | The control room's desk and the main switchboard as the basis's sections 5.2 and 4 have them, from the register |
| M0-03 | high | Engine room, under the platform, x 3.40 m each side | **The platform's pillars stand on the two shaft lines.** `steel.platform` sets pillars at -3.4, 0 and +3.4 m across her; the shafts lie 3.40 m off the centreline (`spec.SHAFT_X`). A pillar comes down onto each intermediate shaft (`er-shaft-space.png`: the pillar and the bearing in one line). `afloat.py` passes it: the pillar touches something | Pillars placed from the shafts', the engines' and the gears' places, as the bay's knees are placed from the windows: the builder stops if one stands in a machine's or a shaft's way. A check of the gate's kind is owed (below) |
| M0-04 | high | Whole complex | **No lower floor.** One walks on the tank top itself, in primer red. The basis has chequered floor plates at 2.00 m on bearers, lifting plates over every valve and well, the engines' wells and the bilge wells under them | The floor plates with the machinery they are fitted round |
| M0-05 | high | Whole complex | **No pipe, duct, cable way, exhaust or lifting rail**, so no machine could be connected to another | After the machines stand: each system of the basis's section 3 as runs between them, carried (`spans.py`) |
| M0-06 | high | The register | **No component, circuit, net or pipe of the machinery is registered.** The basis's load list (section 4) and machinery list (section 1) are prose | A machinery section of the register, written from the basis, before the model is drawn from it: as the bridge was |
| M0-07 | medium | Forward edge of the platform | **The rail runs along the foot of the control room's two windows, with no walkway before them** (`ecr-windows-outside.png`; `windows.py` named it on its first run, JSY-STD-405 section 3). The basis has a grating walkway a metre wide before the windows, joining the centre passage, both side passages and both galleries | The walkway of the basis; the rail on its forward edge, a metre before the glass |
| M0-08 | medium | Galleries and ways down | **The platform is not the basis's.** As built: a gallery each side from 5.4 m off the centreline to her side, the whole length from 25.2 to 38.4 m, with one stair each down to the tank top at 31 m. The basis: galleries from 26.2 to 34.0 m with their inboard edge at 4.6 m; an inclined ladder on the centreline from the walkway to the centre aisle; a ladder at each gallery's forward end; the exhaust crossing where the galleries end. The hull was drawn before the basis was written | To be decided with the owner (below): the basis's arrangement is the one the machines fit |
| M0-09 | medium | Engine control room | **Two windows; the basis has three**, with the desk across the forward side under them | With the control room |
| M0-10 | medium | Ways out | **One way out to the deck**: the stair in the port casing. The arrangement's own note says a second way of escape from the room's far end "is not yet in the arrangement"; the basis gives an escape trunk at the platform's after starboard corner | The escape trunk of the basis, drawn first |
| M0-11 | medium | Light | One state of light. No emergency light, no switch that works, no night | With the register's lighting circuits |
| M0-12 | low | Shafting | Couplings and plummer blocks are plain drums; no shaft brake, guard, seal, drip tray or lamp | With the shaft space |
| M0-13 | low | Surfaces | Bare steel and one paint. The basis (from the owner's photograph F1): engines light green, floor plates blue, lifting plates edged yellow | With each fitting |
| M0-14 | high | Auxiliary engine room | **Bare**: a tank top and four walls (`aux-engine-room.png`, taken, not opened) | After the engine room: the three generating sets, the boiler, the separators (the basis's section 2.4) |

## Not checked in this audit, plainly

- **What a frame costs here.** A quick timing in the page gave figures that do not agree with the handover's measured
  ones for the wheelhouse, so it measured something else and is not reported. The handover's method (a frame drawn and
  waited for) is to be run in the engine room now, while it is bare, so that what the machinery adds is known.
- Fourteen of the twenty pictures were taken and not opened.
- Sprint, crouch and an inspection camera (the directive's section 6): the page has a walker that ducks; what else it
  has was not tried.
- The basis itself was read in part for this record (its head, its choices, its sections 2.1 to 2.3). Its sections on
  the systems, the load list and the control room were not read through.
- No one walked the machinery spaces by hand.

## A check that is owed

`afloat.py` asks that a thing touches something; `zfight.py` that two faces are not in one plane; `windows.py` that
nothing stands over a pane. **Nothing asks that a structure keeps out of a machine's way**: M0-03 passed the whole gate.
As the machinery goes in, each machine is to carry the space it needs to be worked and taken apart (the basis gives
them: a piston's withdrawal, a cooler's bundle, a door's swing), and a check of the gate is to fail when anything stands
in one. To be written with milestone 1, before the first machine.

## What is proposed, for the owner's word

In the directive's order, each step ending at the gate and at pictures from the same twenty cameras.

1. **The drawing before the steel** (JSY-STD-405, rule 1): the arrangement of the complex as two plans (the lower floor
   at 2.0 m, the platform at 4.0 m) and two sections, made by a program from the basis's own places and the hull's own
   numbers, with every clearance written on it. It will show at once where the basis and the hull as built disagree.
2. **Milestone 1, the blockout**: the platform rebuilt to the basis (M0-03, 07, 08, 10), the floor plates, and every
   machine of the engine room as its true envelope at its place, with the space each needs kept clear and checked. The
   machinery's section of the register written first (M0-06).
3. **Milestone 2, structure and machines**, one at a time to JSY-STD-404, each with the parts it is known by: the main
   engines with their seatings, the gears, the shafting; then the pumps and coolers; then the control room and the main
   switchboard, opening on their real insides.
4. **Milestones 3 to 5**: surfaces and light (normal, low, emergency); what works (the register's states: start, stop,
   a feeder opened); the reviews, the walk, the performance report.

**The one decision this needs first: that the platform is rebuilt to the basis's arrangement**, which changes steel that
is built and published (the galleries shorter and nearer the centreline, a walkway before the control room's windows,
other ways down, pillars moved). The session recommends it: the machines of the basis do not fit the platform as it
stands, and its pillars stand on her shafts.
