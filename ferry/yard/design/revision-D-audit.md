# The Chisum, revision D: the audit

12 November 2026. The owner: "I want you to make the whole ship realistic and audit yourself after every step".

After each stage: what was compared with what, what matched, what did not, and what was done about it. The pictures are in
`/Users/nilsjohansson/Developer/chisum-screens/2026-11-12/3-revision-D/`, one folder to a stage (they are not in the
repository). The design basis is `revision-D.md` beside this file. Nothing here is said to have been looked at or run that
was not.

## Stage 1: her bare ship

Pictures: `1-stage-1-bare-ship/` (30 views from the page, drawn on the Mac's graphics card) and `1-stage-1-bare-ship/light/`
(eight slices through the light). Commit: the one that carries this file.

### 1.1 Her lines against the brief

| Asked | Built (lines.py, measured by its own hydrostatics) | |
|---|---|---|
| Length over all 124.8 m, 208 frames of 0.6 m, frame 0 at the transom | 124.8 m | matches |
| Length between perpendiculars about 114 m | 114.0 m: the after one at the rudder stocks (4.2 m), the forward one at 118.2 m | matches |
| Beam 19.6 m, depth 6.6 m and 13.2 m, draught 5.6 m | the same | matches |
| A ship of about 17.5 knots: a moderate block coefficient | 0.661 (the first lofting gave 0.733 with a blunt entrance: the parallel body was shortened to 72 m and the ends fined) | matches the pattern's kind of ship |
| A raked, flared bow with a bulb | stem raked 32.7 degrees; the topsides flare forward (at 110 m she is 6.7 m wide at the main deck and 16.1 m at the rail); a bulb 10.1 m long, its nose 2.6 m before the forward perpendicular | matches |
| Sheer of 1.5 m forward | 1.5 m at the stem head; it begins at the house front (104 m), not at 0.75 of her length as first asked | **departs**, recorded: the house stands on a level deck (question 3 on JS1-102) |
| A transom stern | a transom, with the run rising from 46 m to 4.5 m above the base | matches |

### 1.2 Her profile and plan against the pattern's drawing

The pattern's general arrangement (figure 1 of MAIB report 18/2009, PDF page 13) was measured on the page, not traced:
its profile is 116.3 m in 1,158 picture points. Beside it: `outside-true-profile.png` and `outside-true-plan.png`, drawn by
the page through a long lens (10 degrees, from 487 m), and the drawing JS1-102.

| | The pattern (measured) | Chisum, revision D | |
|---|---|---|---|
| Length to beam | 6.68 | 6.37 (the Bison class: 6.56) | between the two, as intended |
| Beam to draught | 3.23 | 3.50 | wider for her draught: the yard's choice of 19.6 m for five lanes between casings |
| House front from the stem head | 0.14 of her length | 0.167 | a little farther aft: the forecastle holds two windlasses and the mooring gear on 20.8 m |
| The house's upper tiers, fore and aft | about 0.15 of her length | 0.19 (24 m) | longer: she carries 25 crew and 50 drivers |
| What the house stands on | a garage tier one deck above the upper deck | the upper deck itself | **departs**, recorded (design basis, 6.1) |
| Funnel | one casing to starboard, its middle 0.24 of her length from the stern, its top a little under the wheelhouse top | two on the side casings, their middle 0.16 from the stern, tops 1.9 m under the wheelhouse top | **departs**, recorded (6.2); the height relation matches |
| Masts | one on the wheelhouse; a taller raked one on the funnel | one on the wheelhouse (the first Chisum's) | **does not match**: see the open list (masts and lights) |
| Lifeboat | one each side abaft the house's upper tiers, at boat deck level | a station each side on the boat deck, 81.5 to 90.5 m | the place matches; the boats are not built (the fittings library) |
| Stern | a transom; the ramp raised over the upper deck | the same: 11 m of ramp, 4.4 m over the upper deck | matches |
| Bow | raked stem, bulb, sheer forward only, a bulwarked forecastle | the same | matches |
| Lower hold | forward of the engine room, reached by a ramp | forward of the engine rooms, reached by a cargo lift | **departs**, recorded (6.4) |

### 1.3 Her proportions against the ratio table (`comparable-ferries-2026-11-11.md`, section 2)

The table was made for car ferries of 55 to 85 m; where it speaks of a ship's kind and not her size it is applied.

| Ratio | The table | Chisum, revision D | |
|---|---|---|---|
| Clear height on a deck that takes lorries | 4.8 to 5.1 m | 5.69 m under the main deck's web beams (6.6 m deck to deck, webs 0.90 m) | more than enough; the machinery design basis asks for webs of 0.70 m: **open** |
| Accommodation, deck to deck | 2.7 to 2.9 m | 2.8 m | matches |
| Bridge front from the stem | 0.15 to 0.22 of her length | 0.171 (the wheelhouse front at 103.5 m) | matches |
| Wheelhouse | about 10 m fore and aft, the full beam | 3.5 m fore and aft and 6.0 m wide, with open wings to her full beam | **does not match**: it is the first Chisum's wheelhouse, kept at the owner's word |
| Eye above the water | 15 to 17.5 m | 17.6 m (bridge deck 16.0 m over the water) | at the top of the range |
| Funnel | its top at or just below the wheelhouse top | 22.4 m against 24.3 m above the keel | matches |
| Mast | its top about 7 m over the wheelhouse | 4.6 m over it (28.9 m above the keel) | **low**: the open list |
| Forecastle | 0.17 to 0.19 of her length, the bow rising 1.6 to 3.9 m | 0.167, rising 1.5 m | just under both |
| Rails | 1.0 m, three courses, the lowest opening 230 mm, the others 380 mm | 1.0 m; openings 218, 361 and 354 mm clear | matches (the first draft had a lowest opening of 288 mm: put right) |
| Superstructure | 50 to 60 % of her length | 19 % | not a freight ship's ratio: not applied |

### 1.4 The arrangement against the brief's list

| Asked | Built | |
|---|---|---|
| Machinery aft | engine room 21.6 m (frames 28 to 64) and auxiliary engine room 8.4 m, with a platform at 4.0 m for the control room, switchboard room, workshop and store; steering gear right aft | the spaces match (and the machinery design basis: 21.6 + 8.4 m); **no machinery in them yet** |
| A lower hold with a cargo lift of 16 x 3.6 m | 39.6 x 11.8 m between wing tanks; the lift's platform, raised, is its hatch cover | the platform does not move: **owed** (its hoisting gear) |
| A stern door and ramp 9 m wide in a 5.2 m opening, 11 m of ramp on hydraulic cylinders | opening 9.0 x 5.2 m; ramp 9.4 x 11 m, a box girder 0.42 m deep; two cylinders; Raise, Stop, Lower | works: `doors.cjs` (the rods run out 2.71 m, pin to pin 5.94 m closed) |
| A fixed ramp at 1 in 8 on the starboard side | 12.6 to 65.4 m, 3.6 m wide, 6.6 m in 52.8 m | matches (`ga.check`) |
| A pilot door each side with a working leaf | at 68.7 to 69.9 m, each with a frame, a leaf with dogs and hinges, an outer skin in her side's colour | works: a tap opens it |
| Twin funnels on the side casings with real uptakes | the casings; three uptake stubs in each head | stage 2 |
| A helicopter deck: an octagon of about 19 m, raised about 0.9 m | 19 m across, 1.0 m over the upper deck, on girders and pillars, a stair each side | built; its marks: stage 2. **Found: its forward corners' edges cut 0.2 m into the funnels' after inboard corners** (put right in stage 2: the deck moved 0.5 m aft) |
| Walkways | a space each side of the upper deck, 2.3 m wide | their lines: stage 2 |
| A forecastle | 104 m to the stem, sheered, bulwarked | built; its gear: places only |
| The house from 80 to 104 m with the listed rooms | four tiers; galley 30 m², crew mess 35 m², officers' mess 28 m², drivers' lounge 64 m², **crew lounge 50.4 m²**, hospital, office, laundry, stores; 12 crew cabins and 4 drivers' cabins; 6 officers' cabins | built as bare steel rooms with doorways and windows |
| Lifeboats each side | the stations and the rail's gaps | the boats and davits: the fittings library |
| The wheelhouse block on the bridge deck, wings to her side | landed 80.505 m forward of where it was designed; wings to 9.71 m on knees | works: `bridge.cjs` |
| The emergency generator room above the bulkhead deck, entered from the open deck | on the officers' deck abaft the house | works: `doors.cjs` walks out of it |
| The drinks machine in the drivers' lounge | against the lounge's front wall | works: `doors.cjs` |

### 1.5 The checks

All of the gate's checks passed on the build of this stage; the figures are in `ferry/README.md`, *Checks actually run*,
12 November 2026. What the checks found that pictures had not shown: the engine room's gallery stairs could not be walked;
the after mooring stations' doors were behind the stern ramp's cylinder pedestals; five rooms in the starboard casing had
no door (one is the CO2 room now and has one; four are trunks and are listed below).

### 1.6 The pictures, each looked at

| Picture | What it shows | Found |
|---|---|---|
| `outside-bow-quarter`, `outside-in-dock` | the whole ship from her port bow, afloat and in dock | she reads as a ro-ro freighter: teal hull, red bottom with a white line, bulb, raked bow, the house forward, two funnels aft. **The house is square boxes; the forecastle and the upper deck are bare; no foremast** |
| `outside-stern-quarter` | her stern and port side | the raised ramp carries CHISUM and MINATO whole on a smooth skin (the first draft's girders cut the name: put right) |
| `outside-beam-low` | her port side from the water | whole in the frame; the pilot door is one with her side (it was white: put right); the lifeboat station is empty |
| `outside-true-profile`, `outside-true-plan` | profile and plan through a long lens | compared with the pattern in 1.2. From above the weather deck is one green field: stage 2 |
| `helm`, `helm-to-starboard`, `console-from-port`, `pantry`, `wheelhouse-aft` | the wheelhouse | as it was on the 68 m ship; nothing lost in the move |
| `wing-port`, `wing-port-from-the-door` | the port bridge wing | the wing reaches her side; its fittings stand at its outer end |
| `upper-deck-looking-aft`, `upper-deck-looking-forward` | the trailer deck | the funnels, the raised ramp, the fixed ramp's railed opening, the bulwarks. **No lane lines, no walkway marks** |
| `helideck` | on the helicopter deck looking aft | bare plate: **no marks** |
| `boat-deck-lifeboat-station` | the boat deck, port, looking forward | the station's clear deck and the gap in the rail; windows with rounded corners; the wing's knee above |
| `officers-deck-generator-room` | the officers' deck abaft the house | the generator room, the ladder to the bridge deck, rails |
| `forecastle` | the forecastle looking forward | bare sheered deck inside its bulwark |
| `vehicle-deck`, `vehicle-deck-looking-aft` | the main deck | five lanes' width between the casings, the fixed ramp's guard, the lift's platform, rows of fittings under the beams, the casing doors |
| `pilot-lobby` | a pilot door from inside | the leaf with its stiffeners, dogs and handle |
| `lower-hold` | the lower hold looking forward | lit by two rows of fittings; the lift's platform dark overhead; the door to the stair trunk |
| `engine-room`, `engine-room-platform` | the engine room | the tank top, the two galleries with their stairs and rails, the fittings; **empty of machinery** |
| `steering-gear` | the steering gear room | the gear at the stocks, low under the beams (1.65 m clear under them) |
| `crew-lounge`, `drivers-lounge`, `cabin`, `house-corridor` | rooms of the house | bare rooms, each lit by its fittings and its windows; the drinks machine in the drivers' lounge |

The first set of pictures of this stage showed every enclosed room lit in blotches. The cause was in the tracing of her
light (a lamp is small: of a hundred rays one meets it); `light.py` now draws a line from every point to every lamp
within 9 m. The pictures above are after that.

### 1.7 The light, sliced (`light/`)

One level cut at eye height on each deck and one along her centre line. Every room of the house shows a pool of light
under each fitting; the main deck is lit evenly from stern to bow; the engine rooms and the lower hold are lit. The
darkest enclosed places are under the cargo lift's platform (the hold's two middle rows of fittings cannot hang under a
platform that moves) and under the fixed ramp (no fittings there yet). Enclosed points: light 0.10 to 0.57 (10th to 90th
in a hundred) against 1.28 on the open deck.

## Stage 2a: her decks' outfit (`deck_outfit.py`, the bulwarks' openings)

Pictures: `2-stage-2a-decks/`. Commit: "stage 2: her decks read as working decks".

Compared: the same thirty views with stage 1's, and the true plan with the coordinating session's point 5 ("from above,
the weather deck is one flat green field").

| What | Built | Looked at in | Found |
|---|---|---|---|
| Lane lines | white, 0.10 m, along the four lane edges of the main deck (9 to 108 m) and of the upper deck (24 to 79.4 m); the starboard outer one begins forward of the fixed ramp and of its opening, and steps over the hatch to the lower hold | `outside-true-plan`, `upper-deck-looking-aft`, `vehicle-deck` | seen from above and on both decks: white, straight, clear of the ramp, its opening and the hatch; on the main deck they run on over the lift's platform |
| Walkways | a walkway 1.1 m wide each side of the upper deck between two yellow lines, inboard of the ventilators' places at the bulwark | `outside-true-plan`, `upper-deck-looking-forward` | the two yellow lines each side read on deck; to starboard the inner one begins where the opening's rail ends |
| Helicopter deck | a white line round its edge, a yellow circle of 9.5 m, a white H; the deck moved 0.5 m aft, clear of the funnels | `helideck`, `outside-true-plan` | the H, the circle and the edge line read from the deck and from above; in the plan the deck's forward corners now pass clear of the funnels |
| Anchor gear's pipes | a hawse pipe each side from the anchor's mouth (115.2 m) up through the forecastle deck at 114.6 m with a bolster; a chain pipe each side from 112.5 m down and inboard through the fore store to the main deck | `forecastle`, `outside-bow-quarter` | the two bolsters stand on the forecastle beside the mast with the chain pipes' collars abaft them; the anchors hang at their mouths below |
| Foremast | a pole of 7.0 m on the centre line at 116.9 m: anchor light, bell, steps, three stays | `forecastle`, `outside-true-profile` | on the centre line with its three stays, the bell on its after side; in the profile it stands forward of the house and lower than the bridge's mast |
| Bulwarks | plated in five strakes; 24 freeing ports each side (0.6 x 0.24 m); an eye of 0.6 x 0.36 m for each of the ten panama chocks | `outside-beam-low`, `forecastle`, `upper-deck-looking-aft` | from outside a row of small openings along the sheer; from the deck slots at the bulwark's foot, and the chocks' eyes higher up at the mooring stations |

Not matched, and why: the lashing pots, the ventilators, the mooring gear and the monitors are places in `spec.OUTFIT`
and are not drawn (the fittings library); the helicopter deck has no net and no lights; the freeing ports have no bars
across them; no chock is shaped in the stern bulwark or at the stem head (two places were taken out of the list rather
than left unshaped).

## Stage 2b: the funnels, and the house's outside

Pictures: `3-stage-2b-funnels-and-house/`. Commit: "stage 2: the funnels as casings round their uptakes; window frames,
eyebrows and coamings".

Compared: the coordinating session's points 1 and 2; the machinery design basis's figures as the coordinating session
gave them (a main engine's exhaust about 0.7 m bore, a generating set's about 0.25 m, the boiler's about 0.4 m, an exhaust
gas economiser in each main engine's uptake).

| What | Built | Looked at in | Found |
|---|---|---|---|
| The uptakes | in each funnel three pipes of their own bores (0.70 m; 0.25 and 0.25 m to port, 0.25 and 0.40 m to starboard), lagged, upright from the main deck through the casing's room and the upper deck, up inside the funnel and out of its head; a ring for a rain cap on each | `upper-deck-looking-aft`, `outside-stern-quarter`, a look from above (Blender) | three pipes of their own bores stand out of each head, a large one and two smaller; the helicopter deck's edge passes clear of the funnels |
| Economisers | a lagged drum 1.5 m across and 2.2 m high on each main engine's uptake, on four legs in the casing's room on the main deck, with an inspection door | not in the thirty views (the room is small; walked into on the page: not walked into on the page this night; seen in a look from Blender inside the port casing's room: the drum on the main engine's uptake, the two smaller pipes beside it) | |
| Louvres, head bar, platform, ladder, whistle | a louvre panel low in each side of each funnel; a half-round bar round the head; a platform 2.65 m long on the inboard side 1.1 m under the head with a rail; an upright ladder to it with hoops from 2.4 m; the whistle on the port funnel's forward face | `funnel-port`, `upper-deck-looking-aft` | in `funnel-port` (a view added for this): the louvre panel low in the side, the ladder with its hoops, the platform and its rail under the black head, the whistle at the head's forward edge, the line's J |
| Window frames and eyebrows | on the outer face of every outside window: a frame of flat bar following the rounded corners, and an eyebrow over it with its ends turned down | `boat-deck-lifeboat-station`, `outside-beam-low`, `outside-bow-quarter` | in `house-from-the-forecastle` (added for this) and at the lifeboat station: each window stands in its frame under its eyebrow, on all three tiers; from far off they read as a thin light edge round each window |
| Coamings | 0.20 m under each of the house's seven doors to a weather deck; 0.25 m along the outboard side and across the after end of the fixed ramp's opening | `upper-deck-looking-forward`; `doors.cjs` walks over each door's | `doors.cjs` walked through all seven doors over their coamings, both ways; the opening's coaming is a low white strip under its rail |

Found while building it: a wall along her side is built in lengths that follow her side, but a window's corners (and now
its frame) were set on a straight line between the window's ends, up to 5 mm inside the wall's face at the forward
windows of the upper deck's house (`zfight.py` named the frame and the wall). The corners and the frames follow the wall's
own lengths now.

Which pictures were opened after stage 2: the six outside views, the upper deck's, the helicopter deck's, the forecastle's, the boat deck's, the officers' deck's, the two vehicle deck views, the lower hold, the engine room from its platform, and the two added close views. The bridge's seven views and the rooms of the house were looked at on stage 1's build and not opened again: nothing in them was touched.

Not matched: the funnels are still raked boxes in plan (their corners are square); the uptakes end at the main deck
(their runs to the engines, the silencers and the boiler come with the machinery); there is no hinged rain cap on the
rings; the platform is not reached on the page (its ladder is not one of the page's ways).

## The coordinating session's audit of 02:55 (four outside views), and what was done about each point

1. **The house reads as boxes stacked on each other.** Done (stage 2b): a frame and a rain eyebrow on every outside
   window; coamings of 0.20 m under the house's seven doors to the weather decks. Already there: the wings carried to her
   side on knees with their bulwarks, each tier's after end open as a deck with inclined ladders, windows with rounded
   corners. **Not done, and owed**: the front raked aft with rounded corners; each tier set back from the one below with
   a walkway and rail round it; the wheelhouse front as one band of windows leaning outward (the wheelhouse is the first
   Chisum's block: its front is as it was built). Why not tonight: the wall builder draws straight lengths along and
   across her, upright; a raked or rounded wall needs its windows, glass, corners, the deck's outline over it and the rail
   on it drawn on that shape, and setting the tiers back moves the bridge block aft, where the arrangement's rooms abaft
   it are still given as figures. It was not begun rather than half done. How to do it: give `steel.py` a wall kind that
   follows a plan outline of straight lengths and arcs (as `_wall_point` now follows her side), lean it by a rake per
   tier, and derive the bridge deck's rooms from `bridge_place.SHIFT`.
2. **The funnels are plain raked boxes.** Done (stage 2b): each is a casing round three uptakes of their own bores,
   lagged from the main deck up; an economiser on each main engine's; louvres, a head bar, a platform with a ladder, the
   whistle. Not done: a rain gutter or cowl as a shaped head; the uptakes' runs below the main deck (the machinery).
3. **Masts.** Done (stage 2a): a foremast on the forecastle with the anchor light and the bell. **Not done as asked**: the
   foremast carries no masthead light and the bridge's mast was not raised. The rule as the yard recalls it wants the two
   masthead lights at least half her length apart; her pattern's profile shows the forward one on the wheelhouse's mast
   and the after one on a tall raked mast at the funnel. A second masthead light 16 m abaft a foremast's would not be
   that. It is the open list's second point and a question on JS1-102.
4. **The transom's lettering cut by the door's seam.** Done in stage 1: the ramp is a box girder with a smooth outer skin;
   her name and port are painted on it whole (`outside-stern-quarter.png`).
5. **The weather deck is one flat green field.** Done (stage 2a): lane lines, the walkways' lines, the helicopter deck's
   marks, the foremast, the hawse pipes' bolsters, freeing ports and chock eyes in the bulwarks; (stage 2b) a coaming
   along the ramp opening's outboard side and after end. The places of the lashing pots, the mooring gear, the
   ventilators and the monitors are in `spec.OUTFIT` and on JS1-102; the fittings are the library's. Not done: the
   opening's cover.

## Open list (after stage 2)

- The house's shape (point 1 above).
- **Masts and lights.** Her mast on the wheelhouse is the first Chisum's: its masthead light is her forward one (the
  mast stands 23.5 m from the stem, within a quarter of her length). The rule as the yard recalls it (COLREG annex I; to
  be read) wants a second masthead light at least half her length abaft the first and 4.5 m higher; her pattern carries
  it on a tall raked mast at the funnel. With two funnels at her sides that light wants a mast on her centre line between
  them. Not built; for the owner to settle.
- The deck fittings themselves (lifeboats and davits, liferafts, windlasses, winches, bitts, chocks, ventilators, lashing pots, monitors): places in `spec.OUTFIT`; the library is built separately.
- The helicopter deck's net and lights; bars across the freeing ports; a chock in the stern bulwark and one at the stem head; hinged rain caps on the uptakes.
- Her machinery; the uptakes below the main deck with it. The machinery design basis asks for main deck webs 0.70 m deep
  and 0.55 m over the engines: the model's webs are 0.90 m and the engine room is 4.09 m clear under them.
- The cargo lift's hoisting gear: the platform is drawn raised and does not move.
- The ramp cover over the fixed ramp's opening: the opening is railed and has its coaming.
- The chain lockers under the fore store; a second escape from the engine room.
- Four trunks in the starboard casing (the starboard uptake and three ventilation trunks) have no door: the fixed ramp runs
  along their only wall to the deck.
- No fittings under the fixed ramp; the hold is dim under the lift's platform.
- The after passage and the steering gear room are 1.9 m high: their fittings hang lower than 2.1 m.
- Leaves for the house's doors (weathertight outside, joiner doors inside); linings, furniture, everything of the rooms.
- The yard's drawing JS3-304 (stern ramp and after end) draws the 68 m ship: superseded, not yet redrawn.
- `zfight.py`'s second list (coverings that lie close under another surface) names six: her name on the bow, the forward
  draught marks, the sea chests' openings and two faces in the wheelhouse. They do not fail the check and were not measured.
