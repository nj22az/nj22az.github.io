# The wheelhouse refitted: record of the work, stage by stage

Johansson Shipyard · design record · 12 November 2026 (night) · newbuilding No. 1, the Chisum · branch `claude/chisum-wheelhouse`

The owner, of the navigation bridge as first built: **"It still looks like Lego create a realistic bridge"**; then "go back
to the bridge and increase realism by about a million"; "you have no budget on the 3d model, focus on photorealism and
reality"; "Every lever everything needs to be interactive"; "I want everything to be interactive in the bridge"; "a
transparent coffe can we can animate with coffee"; "I want you to make the whole ship realistic and audit yourself after
every step".

This is the record of that refit, done overnight without the owner. It says, for each stage, what was compared with what,
what matches, what does not match yet, what was put right, and what is owed; every new look, every fitting rebuilt, every
motion added, and the checks actually run with their real counts.

## The pattern

The owner's two photographs of a real ferry's wheelhouse (`../reference/owner-photographs-2026-11-11.md`, rows F3 and F4).
The pictures themselves were not before this session: it worked from their description, which is this list. Every audit
below goes down it item by item.

| | The photographs show |
|---|---|
| T1 | The consoles in one block on the centreline, painted a strong marine blue; sloped desks with dark instrument fields; flush panels of push buttons and lamps, small displays, telephones, a handset on a curly cord, control levers; a grab rail of stainless tube along the desk's edge |
| T2 | Two pilot chairs behind the block, high-backed, black, on pedestals that run on rails let into the deck |
| T3 | Windows all round between wooden mullions (light varnished wood facing the room, the glass in black rubber) |
| T4 | Round clear-view screens in two of the front windows; wipers outside |
| T5 | A continuous handrail under the sills on brackets; sockets and a small recessed box in the lining below the sill; the lining below the sill plain white panels with a dark skirting |
| T6 | The deckhead in long narrow strips running athwartships, off-white, with instruments hung under it over the windows (repeaters, a clock), small round lights, a sprinkler head, a loudspeaker, a smoke detector |
| T7 | A blue vinyl deck, slightly glossy, with dark rubber mats where one stands |
| T8 | Abaft the block a watchkeeper's table with a ship's profile engraved in its wooden top and a cup well in its corner, and a black leather sofa |
| T9 | The light comes in low through the glass and lies in bright bands on the mullions and the desk |

She is a classic ship of the 1970s kept in service and refitted: what is characterful and already aboard stays (the wooden
wheel on its stand, brass where there is brass, the wing repeaters).

## How the pictures are taken

`ferry/tools/shots-bridge.cjs <folder> [views]` (new; on the pattern of `shots.cjs`, which stands outside the room for two
of its interior views): thirty views of the bridge from the page itself on foot, drawn on this Mac's graphics card (it
says which it got: *ANGLE Metal Renderer: Apple M1 Pro* every time). A view is an eye and what it looks at, in the bridge's
own measures, and what is worked for it. The pictures are in `/Users/nilsjohansson/Developer/chisum-screens/2026-11-12/4-wheelhouse/<stage>/`
(outside the repository). Every picture named in this record was opened and looked at.

## Stage 0. As found

`0-before/` (30 views). 574,519 triangles; `make.sh` "built: every check passed" (0 pairs of faces in one plane, 0 afloat of
5,086 pieces, 17 runs carried), on the commit this branch starts from (`02154d9`).

What the pictures show, against the pattern: a teal table 5.5 m wide from wall to wall with a cream top (T1: no); black
boxes standing on it, each a prism with a picture on its face, their keys only drawn (T1: no); two chairs of plain boxes on
a disc and a post (T2: no); the windows in dark painted frames between cream posts (T3: no); no clear-view screen (T4: no);
no handrail, one socket (T5: no); a cream slab with painted seams and four oblong lamps that give no light (T6: no); a grey
deck (T7: no); neither table nor sofa (T8: no). The light of the room is right (T9: the light bake of the same day), and
the after end of the room is dim because no lamp in it is lit.

## Stage 1. Real materials

**What was done.** The house itself was given a real bridge's materials and the old fittings were put in them; no fitting's
shape was changed yet.

*New looks* (`shipyard.LOOKS`, each with its kind of surface in `shipyard.SURFACES`; none of the old looks was repainted):

| Look | What it is | Surface |
|---|---|---|
| Marine enamel | Gloss enamel on the consoles | paint |
| Matt black | Desk tops and instrument fields | matt |
| Hammer finish | Dimpled enamel of equipment cases | hammer (new) |
| Black anodised | Instrument plates and bezels | metal |
| Laminate | Lining panels, white joinery | laminate |
| Deckhead strip | The deckhead's strips | laminate |
| Vinyl deck | Sheet vinyl, a little glossy; the skirting | vinyl |
| Rubber | Window gaskets, mats, cords, gaiters | rubber (new) |
| Stainless | Rails, screws, hinges | metal |
| Light wood | Varnished mullions, sills, casings | wood |
| Leather | Chairs and settee | leather |
| Cloth | Woven stuff: flags, lifejackets | cloth (new) |
| Dial glass | The glass over a dial or a display | (clear) |
| Blind film | A sun blind's tinted film | (clear) |
| Coffee | What is in the jug | (none) |
| Lit lamp, Lit amber, Lit white | Lamps that are lit: each is a lamp to the light traced through her | (gives light) |

*New kinds of surface* in `ferry/look.js` (`SURFACES`): `rubber` (a fine dull grain), `cloth` (a weave), `hammer` (the
dimpled paint of equipment cases). Nothing else in `look.js` was touched.

*Her colours*, chosen to be believable in daylight (no saturated toy colour): console enamel `#2c517c` (it was first
`#25558e`, which the picture from the port end showed as a cobalt too vivid for paint in shade: toned down); desk tops
`#24282b`; linings `#e8e6dd`; deckhead `#efeee8`; skirting `#2c3a4a`; deck vinyl `#4a6c96`; mats `#1e2124`; light wood
`#c49a5e`; the wheel's and the chart table's mahogany `#6b4429` (it was `#765032` and went orange once the room was lit);
leather `#1d1d1f`; stainless `#c6ccce`; hammer grey `#7a8387`.

*The house* (`wheelhouse.py`: `envelope`, `ceiling`, `floor`):
- every window's glass sits in a black rubber section; outside it a painted steel frame stands 8 mm proud of the plating;
  inside, the forward posts and mullions are faced in light varnished wood, 12 mm proud of the lining, with wooden rails
  under and over each pane and a sill board along the front; each side window has a wooden casing and a sill board;
- the linings are off-white laminate with a joint at each panel; on the after wall, which is the ship's own (`steel.py`,
  cream), the bridge's laminate is laid over the ship's lining, 10 mm thick;
- the deck's vinyl is turned up every wall as a coved skirting 0.10 m high, in a darker blue;
- the deckhead is eighteen strips 185 mm broad running athwartships with a 15 mm shadow gap, over a dark backing;
- the deck is blue sheet vinyl with two welded seams; ribbed rubber mats at the helm and at the two conning positions;
- the four deckhead lamps are lit (they are lamps to the light bake, which now lights the room's after end).

**Compared: `1-materials/helm.png`, `block-from-port.png`, `aft.png` against the pattern, and against `0-before/`.**

| | Matches | Does not match yet |
|---|---|---|
| T1 | The console is marine blue with a dark top; a stainless rail along its edge | It is still a table from wall to wall with boxes standing on it; nothing is set in |
| T2 | The chairs are black | They are still boxes; no rails |
| T3 | Light wood mullions and rails, glass in black rubber: this reads as the photograph's windows | Corners of the rubber are square |
| T4 | | No clear-view screen; the wipers are a bar on the sill |
| T5 | White panels with joints, a dark coved skirting | No handrail, no box in the lining |
| T6 | Strips athwartships, off-white | Lamps oblong; the instruments are flat discs on a blue box; no sprinkler |
| T7 | Blue vinyl with mats | |
| T8 | | Neither table nor sofa |
| T9 | Bands of sun on the mats and the deck; the wooden mullions take the light | |

**Put right in this stage.** One pair of faces in one plane, found by `zfight.py` on the first build: the flanges of the
three brass dials on the after wall ended in the plane of the new lining panels (the panels were made 10 mm thick instead
of 12). The blue and the mahogany, as said above.

**Checks actually run on this stage.** `ferry/blender/make.sh /tmp/chisum-w.npz /tmp/chisum-w.blend`: "built: every check
passed" (578,155 triangles, 3.82 MB; 0 pairs of faces in one plane; 0 afloat of 5,215 pieces; 17 runs carried; the light
bake). The six page checks against this worktree on port 8772, one at a time: **bridge 25, doors 17, stairs 50, travel 5,
zoom 14, offline 5: all pass.** Said as it happened: on the first run `bridge.cjs` passed 22 and then timed out opening
its second page (the phone), and `doors.cjs` failed its tap on the drinks machine; run again alone `bridge.cjs` passed 25
of 25; `doors.cjs` failed the same tap a second time and passed 17 of 17 the third time. Both are the failures the
handover already describes (a tap on foot that does not wait for a frame; the machine had a load average of 20 to 25 all
night from the other sessions' builds). Neither touches the bridge.

**Owed after this stage.** Everything of T1, T2, T4, T5, T6 and T8 that is a matter of shape: stage 2.

## Stage 2. Real shapes

**What was done.** Everything fitted in the wheelhouse was drawn again as the thing it is. The house, the wings' own
fittings (already to JSY-STD-404), the pantry's unit and the compass deck's fittings were kept.

### The arrangement, and why

The pattern's first line is "the consoles in one block on the centreline". The wheelhouse is 5.84 m wide and 3.38 m deep
inside. A block standing free of the forward bulkhead, with a way before it as in the photographs, leaves no room abaft it
for the wheel, the chairs and the way from wing door to wing door. So:

- **The block stands on the centreline against the forward bulkhead, 3.70 m wide**, and leaves a way 1.07 m wide to the
  forward corner windows each side of it. (It was a table 5.5 m wide from wall to wall.)
- **The settee stands along the port side** under the windows, forward of the wing door; **the watchkeeper's table in the
  starboard forward corner**, forward of the pantry, where the coffee is. There is no room abaft the block for either: the
  after wall is taken by the boards, the door, the flag locker, the chart table and the crew stair. The fold-down log
  desk under the port window went: the table has the deck log.
- **The two clear-view screens are in the windows ahead of the two pilot chairs** (the second and fourth of five); **the
  three wipers are on the middle window and the two outer ones**, hung as pendulum wipers from spindles in the windows'
  head, under the visor, with their motors inside over the blinds. Parked, a wiper hangs upright beside the mullion. (They
  lay along the sill, with motors that would now stand in the handrail's way; and a window has a wiper or a clear-view
  screen, not both.)
- **The two VHF sets are in an overhead console**, the distress set with its handset beside it; the **NAVTEX receiver is on
  a bracket over the chart table**, where its warnings are plotted; the **sound-powered telephone and the binocular box
  are on the block's two ends**. None of them fits a block 1.8 m narrower than the table was.
- **The overhead console is two**, port (the camera monitor) and starboard (the radios), and **between them four round
  instruments hang on trunnions** from the deckhead: the rudder angle indicator, a heading repeater (new), a clock (new),
  the wind.

**The register moved with it, consistently** (`ferry/systems/bridge.py`): each of these components says where it stands now
(`at`), and the builder draws it there. The desk's two rows and the upstand's foot are the register's `ROW1`, `ROW2`,
`BACK`. Fifteen components are new: the settee (OUT-41), the two handrails (OUT-42, 43), the hook rail (OUT-44), the
heading repeater and the clock (NAV-18, NAV-23), the two clear-view screens (NLT-17, 18), the window heating junction box
(NLT-19), two sprinkler heads (FIR-08, 09: the sprinkler main they stand on is not registered), and four more downlights
(LGT-15 to 18: eight round ones of 13 W where four oblong ones of 36 W were). The register's own checks hold (breakers,
cables, voltage drops along the ways as laid): **186 components, 41 circuits on 5 boards, 31 nets, 7 pipes**.

### The tools

- `shipyard.py`: **`Part.lathe`** (a turned body from its profile: smooth round its axis, sharp where the profile turns
  more than 40°, always a closed solid) and **`Part.pillow`** (a box rounded all round: cushions, pads, moulded cases).
- `bridge_kit.py` (new): the bridge's measures, colours and parts; **`Frame`**, a place with its own three measures, so
  that a fitting is drawn once and set in a face that leans (the sloping desk, the upstand, the overhead consoles, the
  raked glass); `sweep` (a round line through points with shared rings: cords, cables, bent rails), `extrude`; and the
  small made things: `screw`, `bolt`, `knob`, `lamp`, `hinge`, `quarter_turn`, `louvres`, `nameplate`, `gland`, `pull`,
  `socket`, `panel`, `blank`, `display`.
- `atlas.py` notes, as it draws a panel, where each key, lamp, knob, display window and screw stands
  (`atlas-marks.json`; `--marks` notes them without drawing the sheet again: this Mac has not the Japanese font the
  drinks machine's pictures need, and the sheet itself is unchanged). The builder raises a real shape at each: **a panel
  is no longer only a picture of one**. A key's cap carries its own legend, cut from the same picture.
- `bridge_console.py`, `bridge_outfit.py`, `bridge_fittings.py` (new): the block and its instruments; the furniture and
  the after wall; the deckhead, the windows and the linings. `wheelhouse.py` keeps the house, the wings, the pantry and the
  compass deck.

### Every fitting rebuilt

Each has its row in `../standards/JSY-STD-404-detail.md`, section 3 (twenty-six rows added): the console block; a flush
panel; a display; the control heads; a handset in its cradle; the sound-powered telephone; the binocular box; a pilot
chair on its rail; the steering stand; the settee; the watchkeeper's table; the chart table; the flag locker; the locker
under the boards; the boards, fire panel and first-aid box; the brass bulkhead instruments; the fire extinguishers; the
overhead consoles and round instruments; the deckhead's fittings; a sun blind; a wiper; a clear-view screen; the handrail;
a window; the whistle pull; the coffee maker.

**Meshy was not used.** The owner allows it for sculpted things (the chairs' upholstery, binoculars, mugs, the cooler's
products). This session drew them with the yard's own tools instead (`pillow`, `lathe`), for two reasons: a generated
model carries its look in pictures of its own, and the file carries one colour a corner and one sheet of pictures (the
handover's "textures are the gap"); and a fitting drawn from measures goes through the gate piece by piece. It is owed as
a trial, not refused: the upholstery of the chairs and the settee is where it would show most.

### Found and put right while building

| Found by | What | Put right |
|---|---|---|
| `build.py` (solids inside-out) | A turned body with an open end (a rosette, a dome on a plate) is not a closed solid | `Part.lathe` closes every profile |
| A look at the faces' winding | Faces a millimetre across (a screw's head, a chamfer's corner) were turned at random: `Part.orient` worked their direction out in single precision about the ship's origin, 20 m away | It is worked out about the face's own corner, in whole precision. This was so before the refit too (the hose box door's chamfers); it shows only now that there are thousands of such faces |
| `zfight.py` | The upstand's leaning face was wound inward: a prism was turned to look away from its middle, which is wrong for an outline that goes in as well as out (the console's section, the coved skirting) | `extrude`: each side looks the way its own edge says |
| `zfight.py` | A lamp socket drawn in a frame that looked into the wall; an extinguisher's foot cup in the plane of the skirting's top; the two glasses of a night light in one plane | The frame turned; the extinguisher stands 2 cm higher; the lit glass stands 0.8 mm off |
| `afloat.py` | Twelve things 4 to 25 mm from what holds them: a drum's lid, two drawers over their rails, two lifejackets, two extinguishers' levers and one's hose, a lamp's lit glass, the wheel's brass cap, the settee's piping, a wash jet | Each carried |
| `make.sh` itself | When the Blender step failed, the rest of the gate ran on the part file of the build before and said "built: every check passed" | `make.sh` removes the part file first |
| The first pictures | The wipers, parked 33° off upright, lay across three windows | The spindle stands to one side: parked, the wiper is upright beside the mullion |

### Compared: the pictures of stage 2 against the pattern

`2a-shapes-first/` (the first build that passed the gate: 30 views) and `3-works/` (the last build: 38 views).
`helm.png`, `block-from-port.png`, `windows-port.png`, `deckhead.png`, `close-telephone.png`, `close-lever.png`,
`close-chair-rail.png`, `close-clearview.png`, `table.png`, `aft.png` were put beside the pattern, item by item.

| | Matches | Does not match yet |
|---|---|---|
| T1 | One block on the centreline in marine blue; a sloped desk with a dark field; flush panels whose keys and lamps are shapes; displays set in under glass with bezels and screws; a telephone with its handset on a coiled cord; control heads; a stainless grab rail on brackets along the desk's edge | It stands against the forward bulkhead: there is no way before it. The lettering of a panel is still its picture (under and on the keys). Where the block has no instrument there is a blanking plate. Nothing is worn |
| T2 | Two high-backed black chairs with headrest, armrests and footrest, each on a pedestal with a gaiter on a carriage that runs on two rails in a slot let into the deck | The upholstery is smooth: no stitching, creases or piping; no belts |
| T3 | Mullions, rails and sills of light varnished wood; the glass in black rubber; a painted steel frame outside | The rubber's corners are square; the wood's joints are not drawn |
| T4 | Two clear-view screens (ring, bolts, gasket, a clear disc in a tinted window, the motor at the middle on its tube); three wipers outside with arms, blades and motors | The wipers are pendulum wipers, not pantographs. The glass's heating is a junction box only |
| T5 | A handrail under the sills on brackets with rosettes; a double socket and a box let into the lining below the sill; white panels over a dark coved skirting | The rail is not continuous: it ends at the block each side. The panels' joints are lines, not profiles |
| T6 | Strips athwartships; four round instruments in brass bezels hung on yokes over the windows (rudder, heading, clock, wind); round downlights; two sprinkler heads; a loudspeaker; a smoke detector | No air outlet, no access hatch in the strips |
| T7 | Blue vinyl, a little glossy, with ribbed rubber mats at the helm and before the console | No wear, no scuffs |
| T8 | A table with her profile and name engraved in its wooden top and a cup well in its corner; a settee in black leather | Both stand beside the block (the table in the starboard forward corner, the settee along the port side), not abaft it: there is no room abaft it. The engraving is fine and reads from about a metre |
| T9 | The sun lies in bands on the deck, the mats, the chairs and the wood | The after end of the room is dim by day: the downlights are small |

**Looked at and judged.** `2a-shapes-first/helm.png` against `0-before/helm.png` is the whole change in one pair: a table
with boxes on it became a console with instruments in it. `3-works/windows-port.png` shows the room as a room: settee,
handrail, wooden windows, a clear-view screen, the strips, the instruments overhead. `3-works/worked-chairs.png` shows the
block from above with both rows of the desk, the two chairs turned and one run aft on its rail.

**Checks actually run on stage 2.** `make.sh` on the first whole build of stage 2: "built: every check passed" (825,458
triangles, 5.28 MB; 0 pairs of faces in one plane; 0 afloat of 8,735 pieces; 17 runs carried; the light bake). The page
checks were not run on that build alone: two of its new parts (the clear-view screens, the wipers) need what stage 3 gave
the page, so stages 2 and 3 went through the page checks together and are one commit.

## Stage 3. Everything works

The owner: "Every lever everything needs to be interactive"; "I want everything to be interactive in the bridge"; "a
transparent coffe can we can animate with coffee".

**What was done.** Whatever a hand works on a real bridge is a part of its own in the model, with its hinge, slide or
shaft, and the page works it: by a tap on the part itself, or (new) by a tap anywhere on the fitting it belongs to.

### What the page gained (`ferry/app.js`, kept small: 68 lines added, 3 changed)

`ferry/README.md` (*The file format*) is another session's to write; until it says these, this is where they are said.

| | In the file | What the page does |
|---|---|---|
| 1 | A mover of kind `stretch` | The part grows along `axis` from `pivot` by its input times `ratio` of its own length: a blind's film drawn out of its cassette, the coffee rising in its jug |
| 2 | A mover of kind `show`, with `over` and `when` | The part is there only while its input is over `over` (a lamp's lit glass), or with `when: "off"` only while it is not (the film that darkens a display turned down) |
| 3 | A tap input with `run: "sweep"` and `period`, or `run: "spin"` and `rate` | While it is on the part sweeps to its limit and back, or spins; turned off, it goes on to where it is parked and stops there. `with` names a switch that also turns it on. Nothing runs for whoever has asked for less motion |
| 4 | An input with `level` (`fill`, `rate`, `drain`, `drainRate`) and `start` | It has no keys: it rises while what fills it is on and falls while what drains it is worked |
| 5 | A tap input with `fitting` | A tap anywhere on that fitting of the register works it (the nearest such input to the place tapped), and shows the fitting's card as before |
| 6 | For checks | `__ferry.workSteps`, and `movers()` says whether each part is shown |

The four kinds of motion the page had (`turn`, `slide`, `carry`, `aim`), `on`, the doors and the levers are untouched.

### What is worked, and what it does

| Input | What | How |
|---|---|---|
| `console-door-1p` … `console-door-5s` (10) | The console's cabinet doors | Each turns 105° on its hinges; behind it the units of the register on their shelves |
| `locker-door-1` … `4` | The locker under the boards | Each turns 100°; lifejackets, flares, the line-thrower |
| `chart-drawer-1` … `3`, `table-drawer` | Drawers | Each runs out 0.36 m (0.26 m) with what is in it |
| `handset-telephone`, `handset-vhf`, `handset-sound-powered` | Handsets | Each lifts off its cradle or hook (it turns up on the end its cord holds) |
| `blind-1` … `5` | Sun blinds | The bar runs 1.03 m down the glass on its wires; the film (`blind-n-film`, `stretch`) is drawn out with it |
| `wiper-port`, `wiper-centre`, `wiper-starboard` | Wipers | `run: sweep`: 62° across the glass and back in 1.6 s; parked upright. Also `with` its switch |
| `wiper-switch-port` … (3, steps) | The wiper switches on the console | Off, intermittent, on: its wiper runs while it is not off |
| `clear-view-port`, `clear-view-starboard` | Clear-view screens | `run: spin`: the disc, its clips and its flange turn; it stops where it began |
| `chair-master-slide`, `chair-officer-slide` | Pilot chairs on their rails | The carriage runs 0.42 m aft |
| `chair-master-turn`, `chair-officer-turn` | Pilot chairs on their pedestals | The seat turns 70° inboard; it rides `on` the carriage |
| `whistle-pull` | The whistle pull over the helm | Drawn 7 cm down; the valve's lever (`whistle-lever`) goes over 21° |
| `binocular-box-lid` | The binocular box | The lid lifts 100° |
| `dimmer-console`, `dimmer-instruments`, `dimmer-chart` (steps) | The dimmers | A step each tap. The red night lights' lit glasses (`night-lights-lit`), the chart lamp's (`chart-lamp-lit`) and the film over every display (`instruments-dimmed`) are `show` parts that follow them |
| `coffee-machine` | The coffee maker's switch | The rocker goes over; its lamp is lit; **the jug fills** (7 % a second) |
| `coffee-jug` | The jug | Lifted and tipped 52°; **it empties** (22 % a second) |
| `coffee` (level) | The coffee in the jug | A `stretch` part that rides `on` the jug: 4 mm deep when empty, 94 mm when full; she is found with 55 % |

With what was there before (the wing doors, the corridor door, the stair gate, the hose box, the pantry's cupboard and
cooler, the three levers at three stations, the tiller, the wheel) that is every thing on the bridge that a hand works,
except those listed as owed below.

### Audit

**Compared: what a hand works on the bridge, against what answers on the page.** `ferry/checks/works.cjs` (new: 21
checks) works each thing as a tap works it and asks that it does what it is for; `doors.cjs` already opens and shuts every
input the file marks `auto`, so each of the 41 new ones is opened and shut there too. `3-works/worked-*.png` and
`night-switches.png` were looked at.

| | Works | Does not work yet |
|---|---|---|
| The console | Its ten cabinet doors; the three levers and the tiller (as before); the wiper switches; the three dimmers; the telephone's handset | The keys, the trackballs, the searchlight's joystick, the whistle's push and the toggles of the navigation light panel are shapes: a tap on them shows their fitting's card and works nothing. The engine instruments do not follow the levers; the screens are still pictures |
| The windows | Five blinds; three wipers; two clear-view screens | The wash; the heated glass's switch |
| The chairs | Each runs on its rail and turns | Height and backrest |
| The after wall | The chart table's three drawers; the locker's four doors | **The boards' doors** (BD1, BD2, DC1, DC2), the fire panel, the first-aid box: the owner asks for cabinets that open on real insides with their wiring, which is the next piece of work in their own order, not a door on an empty box |
| The rest | The table's drawer; the binocular box; the whistle pull; the VHF's and the sound-powered telephone's handsets; the pantry's cupboard and cooler (as before); **the coffee** | The whistle makes no sound; the settee's lockers are pulls only; what is in a locker cannot be taken out |

**Put right in this stage.** The first pictures of a blind drawn down showed nothing: a film that lets 40 % through does
not darken a sky the eye is already blinded by; the film now lets 10 % through (it darkens a display turned down the same
way). The red night lights, being lamps to the traced light, reddened the deckhead by day though they are out by day:
their lit glass is a look of its own, a fifteenth as strong. `bridge.cjs` was moved with the block in three lines: one
stands 15 cm further aft to reach the port lever (the desk's nose is nearer), it is the settee that stops one at the port
side, and the block's grab rail stops one 7 cm before the desk does.

### Checks actually run on the last build (stages 2 and 3 together)

- `ferry/blender/make.sh /tmp/chisum-w.npz /tmp/chisum-w.blend`: **"built: every check passed"**: 825,152 triangles in a
  file of 5.28 MB (it was 574,519 and 3.80 MB); `zfight.py` 0 pairs of faces in one plane among 503 pieces; `afloat.py` 0
  afloat of 8,741 pieces (8,732 held, 9 flat pictures); `spans.py` 17 runs, every one carried; the light bake. `check.py`:
  the register beside the model holds the 186 components the model names, each within the model. `zfight.py`'s second
  list, which does not stop the build, names three coverings: her name on the starboard side (the false alarm of
  JSY-STD-403 §5), and two that are meant (a panel's picture 1 mm under the caps of its own keys, on the desk and
  overhead).
- The page checks against this worktree on port 8772, one at a time: **bridge 25, doors 17, works 21, stairs 50, travel
  5, zoom 14, offline 5: all pass.** Said as it happened: on the build before the last, `bridge.cjs` passed 24 of 25: the
  walker sent at the console stopped 7 cm earlier than the check allowed, at the block's grab rail; the check's bound was
  moved to the rail and it passed 25 of 25 alone, and again in this run. `works.cjs` passed 21 of 21 on its first run and
  on each since. `doors.cjs` now opens and shuts 59 things aboard (it had 18; its 17 checks are as before).
- `bridge.cjs` on this build: the register holds 186 components, all 186 with a place in the model; 181 components answer
  at their own place.
- **Not run:** the yard's two calculations (`yard/calc`), the homepage's review, a phone or a tablet. The pictures are
  from headless Chromium on this Mac's graphics card; nobody has walked the refitted bridge in a browser by hand.

## Stage 4. What is read is read over what is worked (12 November 2026, morning)

The owner, having walked the refitted bridge: **"the panels and lever need to be placed more intelligent because now some
levers are blocking some panels, look at the bridge as an end user"**; and, with a picture of the two engine levers
standing before the engine dials: **"is that really normal"**. It is not.

**As found** (the page itself on foot, in the desktop app's browser on this Mac's graphics card; from behind the wheel, from
the eye of each pilot chair, from beside the steering stand, and at each wing station):

- The three control heads stood on the console's level strip at 22.60 m, their grips 0.19 m over it. The engine instrument
  panel and the rudder angle indicator are set in the low middle of the upstand, 0.12 m beyond them and only 0.22 m high
  (it is low so that the sea is seen over it: JS4-402). From behind the wheel the two engine grips lay across the middle
  of the six engine dials; from either chair they covered nearly all of them; the thruster's lever stood before the rudder
  angle indicator.
- At each wing station the two dials lay in the sloping top 0.18 m behind the thruster's lever: its grip covered their
  lower edges from a metre abaft the station and half of one dial from two.

**Why moving them sideways does not answer it.** A lever at arm's length before an upright face hides a different part of
it from each place one stands: the lines from the two pilot chairs past the same lever land 0.28 m apart on the upstand.
There is no place along the strip where a lever 0.19 m high hides nothing. The answer is in height and depth: **what is
worked stands nearest the hand and lowest, what is read stands beyond it and higher, and is read over it.** The owner's
drawing of the *Arctic Tide*'s wheelhouse (`../reference/owner-drawings-2026-11-12.md`, B: her forward console looked at
again for this) is arranged so: levers, joystick and panels in the low consoles at the chairs' arms, the displays standing
apart beyond them.

**What was done** (`ferry/systems/bridge.py`: `HAND`, `HEAD`, `STRIP`; `blender/bridge_console.py`: `lever`, `flush`;
`blender/wheelhouse.py`: `wing_console`):

| | Was | Is |
|---|---|---|
| The three control heads (PRP-01, 02, 03) | Standing on the level strip at 22.60 m; grip's top 1.19 m | **In the desk's after edge, at the hand** (22.255 m: their after faces in line with the after row of panels), sunk in the sloping desk until the slotted plate is 4 mm over it at the head's forward end; grip's top 1.10 m. Same places across her: thruster, starboard engine, port engine. The drum on each shaft is wholly inside the block (the builder stops if it would come out under the desk's lip) |
| The desk behind them | The propulsion and thruster panels in the forward row, with blanking plates | **Clear** from -0.44 to 0.58 m: nothing is set where a grip stands before it |
| Propulsion control panel (PRP-04), bow thruster panel (PRP-05) | Forward row of the desk | **On the level strip** at 22.635 m, each in line ahead of its levers and under its instruments |
| Engine instruments (PRP-06), rudder angle indicator (STR-06), GPS (NAV-06) | In the low middle of the upstand | The same places: now read over the grips |
| Dimmer panel (LGT-10) | After row, 0.34 m to port | After row, 0.39 m to starboard (the engine heads took its place) |
| Wiper and wash panel (NLT-12) | After row, 0.30 m to starboard | Forward row, 0.62 m to starboard (the thruster's head took its place) |
| Whistle panel (NLT-10) | After row, 0.62 m to port | 2 cm farther to port, clear of the port engine's head |
| The wing stations (PRP-10, 11) | Engine heads at one height and the thruster's at another, standing 4 to 10 cm proud of the sloping top; the two dials lying in the top behind the thruster's lever; a windscreen on the top's forward edge | **The three heads in one row** in the after part of the top, their plates at one height, 9 mm over the top at the engines' forward end (grips' tops 0.99 m, were 1.04 and 1.02); **forward of them the top rises in an upright face that leans back 20 degrees**, like the console's upstand, and the two dials are set in it: the rudder angle over the thruster's lever, the revolutions over the engines'. The windscreen stands on the face's top |

The register moved with it: the three levers, the two panels and the three displaced panels say where they stand now, and
their cables are laid to them (`systems/out/`, `data/systems.json`: 186 components, 41 circuits, all its checks hold).

**The rule and its check.** `../standards/JSY-STD-404-detail.md`, rule 13: *what is read is read over what is worked*.
`ferry/checks/sight.cjs` (new) keeps it: in the page's own model it draws a line from the walker's eye (1.6 m) at each of
209 places abaft the block, from side to side of the room and back to its after wall, to each of 25 points of what is
read of every instrument in the upstand, and a lever in the line fails it; the same for the panels on the level strip
from the helm forward, and for the two dials of each wing station; with the levers at stop, both engines full ahead and
full astern, and the thruster full over each way. It first proves that it can see a lever (a point 6 cm before the port
engine's grip is behind it).

**Said as it happened.** The first build had the plates 9 mm over the desk (grip's top 1.102 m). `sight.cjs` passed
everything from the helm forward and at the wings, and cut 9 of 37,400 lines in the upstand: the foot of the conning
display behind the port engine's grip from the room's starboard after corner, and the foot of the rudder angle indicator
behind the thruster's grip from against the after wall. The heads were sunk 5 mm more (the plate cannot go lower: it is
4 mm over the desk at its forward end) and she was built again: one line of 37,400 was still cut, from one place in the
starboard after corner to the lowest point asked of the conning display, 2.5 cm up it. That point is not read: the
lowest 4 cm of a display in the upstand are its bezel and its row of keys. The check was then made to ask what is read
(each face from 15 % of its height up) and from more of the room (to 2.7 m each side, where it had stopped at 2.4): **none
of 41,800 lines is cut, at any of the five positions of the levers.** So it is said plainly: from the room's after
corners a grip can stand before the key strip under the conning display or the radar, never before a picture or a dial.
The results are in `ferry/README.md`, *Checks actually run*.

**Looked at after** (the same places as before, in the same browser, and twelve pictures by `ferry/tools/shots-bridge.cjs`
in `/Users/nilsjohansson/Developer/chisum-screens/2026-11-12/5-levers/`, each opened): from behind the wheel
(`over-levers-helm.png`) the six engine dials, the rudder angle indicator and the GPS stand clear over the three grips;
from the master's chair, with the eye at 1.36 m (`chair-master.png`), the same, where the two engine grips had covered
the dials; from beside the stand the propulsion panel lies clear between the levers and the dials; at the wing
(`wing-station-port.png`) the two dials stand in their face over the levers.

**Not done, plainly.**
- From farther aft than about 20.5 m a grip does come before the after edge of its own panel on the level strip (the
  check asks those panels only from the helm forward, and says so). They are worked standing at the block.
- The thruster's and the starboard engine's heads stand behind the steering stand's breadth, as they did: they are
  reached from beside the stand.
- The yard's sight-line calculation (JS4-402) was not run again: the grips are 9 cm lower than they were, the upstand
  and everything on it are where they were.
- The electrical drawings JS8-851, JS8-856 and JS8-864 were drawn before the refit and are not redrawn: the register's
  own tables are.

## Stage 5. The wings closed in: one band of windows across her (12 November 2026, morning)

The owner, with a photograph of a ferry's bridge front and forecastle (kept outside the repository as
`chisum-reference/owner-photo-2026-11-12-bridge-front-and-forecastle.png`): **"I want the bridge to look like this and the
forecastle too"**; "How about this bridge and forecastle can you implement it"; and, of the same picture: **"Do you see it
has a outwaard build , that makes the bridge more roomy"**.

**What the photograph shows** (looked at, not traced): a bridge that reaches across the ship's whole breadth; one band of
large windows, leaning forward, carried from side to side and round the corners onto the wings' ends; the wings closed in,
their ends standing outboard of the house below; the whole front built out forward of the house's face on a sloped
underside; a roof whose edge is one line; an open forecastle below and ahead, behind a solid bulwark, with its windlasses,
bitts and fairleads.

**What was done in this stage** (`blender/wheelhouse.py`: `wing`, `sidelight`, `wing_console`; `systems/bridge.py`): the
wings are closed in, as a ship's open wings are when she is refitted.

| | Was | Is |
|---|---|---|
| A wing | An open deck 6.7 m long behind a bulwark 1.1 m high with a wooden rail | A room: the bulwark stays; **forward**, it ends at the wheelhouse's own sill and six panes of a metre lean over it with the wheelhouse's glass, between steel posts; **outboard**, three panes stand on the rail, and the corner is a steel cheek carried into the rake; **aft**, a wall with a window and a weathertight door that opens aft onto the open bridge deck (it opens to whoever comes near, like her other doors); **over it** a roof from the house's side to her side at the height of the wheelhouse's eave, whose forward edge is that eave's own line |
| The band of windows | The wheelhouse's five panes, 5.8 m | **Seventeen panes across 19.5 m**: six, five and six |
| The wheelhouse inside it | Side walls with two windows and a weathertight door each side | The same: its doors open into the wings now |
| The sidelights | On the bulwark's rail at each wing's outer end | On the wing's roof at its outer end, 1.27 m higher, each with its screen |
| The wing stations | A low windscreen of their own on the dials' face | None: the wing's glass stands before them |

**Not done in this stage, plainly.** (1) **The protruding part forward on the bridge.** The owner, with a second
photograph (the ro-pax *Finnarrow* from her bow): "I think we dont understand each other? I mean that protruding part
forward on the bridge". The middle of that bridge's front stands out forward of its wings as a bay with canted corners,
glazed all round, and the room is deeper there. Hers is flat: wheelhouse and wings in one line, and the wheelhouse 3.4 m
deep. Building the middle out moves that part of the forward wall and everything on it (windows, wipers, clear-view
screens, blinds, the handrail, the visor and roof over it, the steel under it) and gives the room the depth the console
block was drawn for (stage 2: "the block is drawn so that it can be stood free there"). It is the next stage. (2) The wheelhouse's
side walls still divide it from the wings: one room across is a matter for that stage too. (3) The wings' walls are bare
painted steel inside, without lining. (4) The glass of the wings has no wipers. (5) Inside a wing a thin bright line
runs where the walls meet the roof: the light traced for the open air over a roof 5 cm thick shows through at the joint
(an angle bar was put round the walls' head for it and did not remove it).

**Checks actually run** are in `ferry/README.md`, *Checks actually run*.

## What the bridge still lacks, compared with a real one

Said plainly, in the order it would be seen:

1. **Wear.** Every surface is new: no scuffed vinyl at the helm, no chipped enamel at the doors' edges, no fingermarks on
   the screens. The page gives each kind of surface a grain; nothing gives it a history.
2. **The crew's things.** A real bridge has a mug in the cup well, a pencil on a string, a tide table open, notices taped
   up, a jacket on a hook, a pair of sunglasses. There is the deck log, a pencil and the chart.
3. **Upholstery.** The chairs and the settee are smooth cushions. Stitching, creases, piping and buttons are what Meshy
   or hand sculpting would give; neither was tried.
4. **Cables.** Each unit in the console has a connector strip and stands under a cable duct, but no cable runs from one
   to the other; the boards have glands and tails to their trunk; behind the linings there is nothing.
5. **The boards' insides**, and with them the owner's own next step (every electrical connection): not begun here.
6. **Lettering on curved and small things**: the keys' legends are the sheet's, sharp at arm's length and soft at a hand's
   breadth.
7. **The block stands against the bulkhead**, and the table and settee beside it, where the photographs have a way before
   the consoles and the table and sofa abaft them. That is her wheelhouse's size (3.4 m deep), not an oversight; the 125 m
   ship of revision D has a deeper house, and the block is drawn so that it can be stood free there (its back is a panel).
8. **Night.** The page has one day. The dimmers, the night lights and the chart lamp work, and are seen by daylight.
9. **Sound.** Nothing on the bridge is heard.
10. **Not measured again:** the yard's sight-line calculation (JS4-402, `yard/calc/bridge_calcs.py`, half an hour) was not
    run on the new block. Its limits were kept by design (nothing ahead of the wheel over 1.225 m against its 1.22 m;
    nothing else over 1.315 m against 1.33 m), and `build.py` still finds 224° of 225° through the glass by the survey's
    measure; but the two clear-view screens' rings and motors now stand in two panes, which that measure does not see.

## Outside this session's own files

| File | What changed, and why |
|---|---|
| `ferry/app.js` | Two kinds of motion (`stretch`, `show`), what runs (`run`, `with`), what fills and empties (`level`), a tap on a fitting works what belongs to it (`fitting`), and two things for checks: 68 lines added, 3 changed. The table above |
| `ferry/look.js` | Three kinds of surface: `rubber`, `cloth`, `hammer` (5 lines) |
| `ferry/systems/bridge.py` | The register follows the refit: the places of some forty-five components moved, 15 components new, the rows of the desk as `ROW1`, `ROW2`, `BACK`; its tables under `ferry/systems/out/` and `ferry/data/systems.json` are written from it |
| `ferry/checks/bridge.cjs` | Three lines, moved with the block (above) |
| `ferry/blender/make.sh` | One line: the part file of an earlier build is removed first, so that a failed Blender step cannot be passed over |
| `ferry/yard/standards/JSY-STD-404-detail.md` | Twenty-six rows in section 3: the parts each rebuilt fitting is known by |
| `ferry/data/ferry.bin.gz`, `light.bin.gz` | Built |

Not touched: `HANDOVER.md`, `ferry/README.md`, `ferry/tools/shots.cjs`, `ga.py`, `lines.py`, `steel.py`, `spec.py`,
`bridge_place.py`, `build.py`, `light.py`. **Three of them now say what is no longer so** and are for whoever owns them:
`ferry/README.md` (*The navigation bridge* describes the 5.5 m console and the old fittings; *The file format* lacks the
table of stage 3; *Checks actually run* lacks this night's), `ferry/systems/README.md` (147 components: there are 186),
and `HANDOVER.md`.
