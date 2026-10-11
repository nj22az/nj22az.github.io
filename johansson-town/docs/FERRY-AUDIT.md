# The Minato–Kitano-jima ferry: audit and plan

The creator, 2026-10-10: *"audit it as marine ship construction engineer in Japan in the 1990's — now it looks like a
floating toy, it needs to be a realistic functional ship with loading decks, passenger waiting spaces, a realistic
functional engine room … and have a crew (some of our NPCs can be the crew …)"*; *"there are only two maybe 3 cars that
need to go on the ferry"*; *"the whole ship need to be modelled, we will have a dry dock later"*; and the rule that
came with it: *"don't take or make shortcuts when making the world"* (CLAUDE.md).

The audit is written as a 1990s Japanese ship-construction surveyor would write it for a small island car ferry
(小型カーフェリー) inspected by the government (JG) for smooth-water service (平水区域).


> **Decision, the creator, 2026-10-11 (supersedes the size in sections 2 and 4):** asked to choose between keeping this
> 22 m, three-car Minato Maru in today's harbour and a bigger ship with a bigger harbour, the creator chose **"Bigger
> ship, bigger harbour"**, keeping the name **Minato Maru (みなと丸)**; and answered yes to **crossings in real time
> with a doze option** and to **walking freely into the bridge and the engine room**. The bigger ship's particulars,
> machinery, electrics and harbour changes are in `briefs/ferry-audit.md` (about 34.5 × 8.4 m, 10 cars or 2 trucks and
> 5 cars, 100 passengers, the breakwater moved seaward and the outer pier lengthened). The work below (the model's
> construction, the crew, the paths, the look tool and the checks) carries over and is grown to that size, not thrown
> away. **One session builds the ferry at a time:** before ferry work, fetch the branch and read the latest commits on
> `src/world/ferry*` and this file.

## 1. Findings on the old ferry (ferry.js before this change)

| # | Finding | Severity |
|---|---|---|
| 1 | 15 m × 4.4 m with a 0.7 m draft: the size of a harbour launch. Its one "lane" was 1.1 m between the lines, narrower than a kei car (1.48 m); the deck held one car. | Major |
| 2 | Hull an extruded prism: vertical sides to a flat bottom, no sheer, no flare, no bilge, no keel. Seen from a dry dock it would be a box. | Major |
| 3 | Nothing under the water: no screws, shafts, rudders, skeg, thruster, bilge keels, anodes or sea chests. A ferry with nothing to drive or steer it. | Major |
| 4 | No draft marks, no load line mark, no name or port of registry. Every Japanese ship carries all three. | Major |
| 5 | The bow ramp a plate with two painted "chains": no hinge, no hydraulic rams, no side girders or toe. | Major |
| 6 | No mooring fittings at all (bitts, fairleads, windlass, anchor, capstan): moored by nothing. | Major |
| 7 | No navigation lights (masthead, sidelights, stern light), no radar, no whistle, no searchlight, no antennas: it could not legally sail at night. | Major |
| 8 | Lifesaving: two rings. No life floats, life-jacket lockers, muster signs, extinguishers. | Major |
| 9 | No crew anywhere; ramp and gangway moved by themselves. | Major |
| 10 | No engine room, switchboard, generators, steering gear or tanks: nothing for stories about breakdowns. | Major |
| 11 | Passengers rode the car deck among the cars (forbidden on Japanese ferries during the passage). | Minor |
| 12 | The code called the side against the pier "starboard"; she lies port side to the pier. | Minor |
| 13 | Cars boarding at Minato did a U-turn of 1.1 m radius on the spot (no car turns that tightly). | Minor (a shortcut) |

## 2. The ship: the Minato Maru (みなと丸), 1991

Data: `src/world/ferry-ship.js`. Model: `src/world/ferry-model.js`.

**Why this size.** Three cars (or a 4-tonne truck and a kei truck) in two lanes need a beam of about 6.4 m; two cars
nose to tail plus the ramp and the deckhouse need about 22 m. That is a 95-ton ferry, the smallest that carries a
deckhouse, a wheelhouse and a proper engine room, and it fits Minato harbour as it is: she berths port side to the
outer pier with her ramp on the quay, and swings in the basin with a metre to spare off the breakwater. The harbour
did not need to grow.

| | |
|---|---|
| Length overall / between perpendiculars | 22.0 m / 19.6 m |
| Beam / depth / draft / freeboard | 6.4 m / 2.48 m / 1.35 m / 1.13 m |
| Gross tonnage | 95 |
| Passengers / cars / crew | 60 / 3 / 4 |
| Speed | 10.5 kn service, 11.8 kn trial |
| Owner | Minato-chō (the town ferry, 町営フェリー); registered at Minato |

**General arrangement (fore to aft).** Car deck with the hydraulic bow ramp, two 2.6 m lanes, lashing points,
scuppers, inner bulwark stiffeners, a hydrant and extinguisher, and ladders up the deckhouse front. The deckhouse:
the passenger saloon with side and front doors and the muster and life-jacket signs. The stern mooring deck: capstan,
two pairs of bitts, closed fairleads, the flagstaff and two lifebuoys. The upper deck on the saloon roof: open deck
with benches, two rigid life floats, life-jacket lockers, lifebuoys, the funnel (both exhausts in one casing) and
the engine-room vents; the wheelhouse forward, its open wings with dodgers and wing consoles; the mast with masthead
light, radar scanner, whistle, VHF whips, GPS and searchlight; sidelights in their screens, red to port.
Below the car deck (data now, modelled in batch 3): steering-gear room, engine room, fuel and fresh-water tanks, crew
quarters (mess and galley, master's cabin, crew cabin, shower, changing room), fore peak and chain locker.

**Hull and underwater body.** Lofted from sections every 0.5 m: parallel midbody, a spoon forefoot under the ramp,
a counter rising over the screws, flare forward, a 0.6 m bilge. Keel bar and skeg; two shafts in stern-tube bosses
on A-brackets; two four-bladed bronze screws (1.05 m) that turn under way; two spade rudders with anodes; the
bow-thruster tunnel and its grilles; bilge keels; sea-chest gratings; antifouling, black boot-top, company teal
topsides and white bulwarks; rubbing strake; draft marks fore and aft, the JG load line amidships, the name forward
and name and port on the transom; the starboard anchor in its pocket.

**Machinery.** Two 257 kW high-speed diesels at 1 800 rpm through 2.47:1 reverse-reduction gears; engine-driven
sea-water, jacket-water and lube-oil pumps; 24 V electric start. A 30 kW bow thruster. Electro-hydraulic steering,
two pumps, hand pump for emergency steering. Fuel: A-type heavy oil (A重油).

**Electrics.** Two 60 kVA (48 kW) 445 V 60 Hz generators; IT main switchboard with insulation monitor; 445/105 V
lighting transformers; 24 V emergency bank; 30 kVA shore supply through a 200/445 V transformer at Minato. The load
balance (`FERRY_LOADS`, tested): at sea 35 kW on one set (72 %), manoeuvring 63 kW on two (66 %), loading 32 kW on
one, night 8 kW on shore power. The car deck is open to the sky and needs no exhaust fans. The bow thruster will not start on one generator; a preferential trip sheds the air
conditioning, galley and water heater. The emergency bank holds the emergency lighting, navigation lights, VHF and
alarms for about 7 hours.

**Scenarios for stories** (`FERRY_SCENARIOS`, each step a post and a place on board): blackout halfway across (bad fuel,
steering by hand pump), a net round the port screw, the ramp hose bursting at Kitano-jima, the shore power and the
rice cooker.

## 3. The crew (src/people/ferry-crew.js)

Safe manning for her size is four. Three are islanders who were already in the town; one is new.

| Post | Who | Why them |
|---|---|---|
| Master (船長) | **the Bus driver** | He drove the Harbour Line bus; when the line became the ferry he took his deck licence and went with it. Master since 1994. The town still calls him the bus driver (saves and looks keep the name). |
| Chief engineer (機関長) | **Mr Nakandakari** (new, 61) | Twenty years in the Naha cargo boats' engine rooms; Mr Shimabukuro of the power house sailed with him and sent for him. Lives aboard in the chief's cabin. |
| Oiler (機関員) | **Mr Higa Jr** | Grandmother Higa's grandson (his grandfather drove the harbour bus for thirty years). Served his time at Mr Ōshiro's boatyard. |
| Deck hand and bosun (甲板員) | **Ms Uezu**, week on / week off | Already "deckhand on the ferry, a week on and a week off"; lives aboard on her week on. |
| Relief deck hand | **Kōji** | Crews on the Ōshiro boat; takes the deck on Ms Uezu's week off. |
| Ticket clerk (ashore) | **Ms Ganaha** | Already sells the tickets at the Port Terminal window. |
| Linesman at Minato | **Mr Fujita** | Lives in his shed on the pier; takes the bow line at every call for a can of coffee. |
| Port | **Harbour master** | Gives the berth, keeps the port radio. |

Each post has a station and a job in every phase of a call (`FERRY_WATCH`: arriving, waiting, reversing, swinging,
leaving, crossing, night). `crewFor`, `crewDoing` and `crewOnDuty` answer who and what for stories and the game.
The island households (`island-households.js`) and the resident guide (the master's role) say the same.

## 4. What changed around her (the impact list, and how each was checked)

- **Berth:** centre (−7.45, −61.5), port side 0.15 m off the pier, bow 0.5 m off the quay wall; the ramp lands where
  it did. Hull collider follows. *Checked:* `tests/ferry.test.mjs` (every hull point, not just the centre).
- **Harbour paths:** keyed paths (`ferry-paths.js`) with the bow's heading set apart from the track: astern off the
  berth, swing on the thruster, ahead round the breakwater; the reverse to come in. *Checked:* a metre off the
  breakwater, 0.1 m+ off both piers, never over the quay, no spinning.
- **Kitano-jima crossing:** the same departure, the sea route, then bow in to the jetty 1.9 m off; leaving it, astern
  16 m before swinging. *Checked:* `tests/airport-ferry.test.mjs` with the real hull outline, and against the new
  tropical Kitano-jima (merged from main the same day): the seabed shelves from 2.2 m under her after body to 1.3 m
  under her bow, where her forefoot draws 0.35 m, and her ramp lands between the jetty's side rails
  (`docs/qa/ferry/16-…`, `17-…`).
- **Gangway, queue and landing:** the gangway now runs from the deckhouse's port door, through a gangway gate in the
  bulwark (shut at sea, folded back and hooked alongside), to the pier end (z −63.5); the queue and the arrival point
  moved south of the crate stack.
- **The pier's berthing face:** the guard rails on the outer pier's west flank are gone (they stood across her gangway
  and would foul her lines); four D-section rubber fenders hang there instead, where her side lies. *Checked:* `tests/airport-dock-access.test.mjs`.
- **Cars:** ride in car place 1 (starboard lane forward). Boarding at Minato is now a three-point turn: down, left onto
  the open quay, back round a 3 m arc onto her centreline and straight back down the ramp. *Checked:*
  `tests/kitano-link.test.mjs` (the full car body against every solid), `tests/airport-ferry.test.mjs`.
- **Quay:** the net-drying rack moved north to the warehouse frontage line, clear of the cars' arc; its rope coil now
  lies by the bollard her bow line goes to. *Checked:* `tests/port-access.test.mjs` (frontage clear).
- **Passengers:** ride the open upper deck aft, between the benches. *Checked:* clear of funnel, benches and vents.
- **Films and comics:** `remotion/tools/impact.py` finds no view of the berth in any episode. The storyteller's
  harbour and pier backdrops were photographed again, and a new place, *the Minato Maru* (`ferry`), was added with its
  own backdrops. *Checked:* `tests/feed-storyteller.test.mjs`.
- **Looked at in the game:** `tools/ferry-look.mjs` photographs her from the quay, the pier, broadside, astern, above,
  the bow and ramp (down and up), the car deck, the waterline (draft marks, load line) and lifted out of the water as a
  dry dock would see her (the reviewed set: `docs/qa/ferry/`). Faults those photographs found and fixed: the car deck and inner bulwarks drawn facing
  down (see-through), the transom's paint smeared and then half missing, the bow name half inside the plating, the
  draft marks inside the curved bow, the wheelhouse wings floating at half height, the gangway through the bulwark and
  across the pier's rail, a car-deck fan housing hanging in the air (and the fans themselves, which an open car deck
  does not need), a sign over the door frame.

## 5. Open: what is not built yet (in this order)

1. **Interiors** (batch 3): the saloon (carpet area to sit and lie on, seats, purser's window, toilets, vending corner,
   safety plan), the wheelhouse inside (wheel and autopilot, radar, magnetic compass, the throttles and telegraph,
   VHF, chart table, echo sounder, the navigation-lights panel), the crew quarters below (mess and galley, cabins,
   shower, changing room), entered from the ship like any building.
2. **Machinery modelled** (batch 4): engine room and steering-gear room in 3D (mains, gears, generators, main
   switchboard and 24 V board, pumps, tanks, CO₂ cabinet), and the switchboard as a live state (generators on and off,
   the preferential trip, the thruster interlock, shore power) that the scenarios drive.
3. **Crew in the world** (characters batch, never with ground or lighting): looks for Mr Nakandakari, Ms Uezu,
   Mr Higa Jr; the crew at their stations through each phase; Mr Fujita taking the line; guide entries and
   portraits so the storyteller can cast them; backdrops on board.
4. **Behaviour:** real mooring lines that run from the bitts to the bollards and slacken and tighten; the ramp lowered
   by the bosun, not by itself; the whistle; the wake and the engine sound; three cars at once (traffic loads one at
   a time today).
5. **The quay end:** a linkspan (可動橋) at Minato that follows the tide, as a real ferry port has, instead of the ramp
   landing straight on the quay edge.
6. **Kitano-jima:** cars there still do a half turn of 1.5 m radius on the plaza before backing aboard (the same
   shortcut Minato had); give it a real three-point turn too.
7. **Dry dock** (later, the creator): the underwater body is modelled for it now.

## 6. The bigger Minato Maru, batch by batch (from 2026-10-11)

The creator chose the bigger ship and the bigger harbour (the banner at the top; `briefs/ferry-audit.md` has her
particulars, electrics and crew). She is built in batches, each one kind, each planned before it is made (what it
touches: colliders, standing spots, walking routes, residents' routines, cars, tests, the storyteller's backdrops,
the films' shots via the studio's `remotion/tools/impact.py`), then changed, tested and looked at
(`tools/ferry-look.mjs`, which now photographs the source tree with `--source`, so the runtime need not be rebuilt
to look). Each batch is its own commit.

### Batch 1: behaviour that was wrong (today's 22 m ship, today's harbour)

**Plan: what it touches.**

| Change | Touches | Checked by |
|---|---|---|
| Crossings sailed as *passages* (`ferry-paths.js` `passage`): each leg (astern, swing, out of harbour, sea, approach, berthing) in its minutes, speed continuous from rest to rest, the bow turning through its keyed headings at no more than 3°/s in harbour and 1°/s at sea, the sea's corners rounded on steady turns (`roundedTrack`). The 18 s ride is the 18-minute passage played sixty times faster until crossings are sailed in real time | `airport-ferry.js` (both crossings), the ride in `island/play.js` (the camera follows her as before), cars aboard (`town-traffic.js` `sitOnDeck` copies her pose, so they roll with her), the player on her upper deck | `tests/airport-ferry.test.mjs`: every hull point a metre and more off the breakwater, the second pier, its arm, the houseboat and Kitano-jima's real shore, 0.1 m off the outer pier, 0.5 m off the quay; turn rates within the limits for each leg; speed never jumping; 18 minutes, 10 at sea |
| The harbour manoeuvres re-keyed (`TOWN_UNBERTHING`, `TOWN_BERTHING`): the old swing put her bow 2 m into the second pier's east arm (x −38.3…−23.7, z −64.3…−59.7) and her arrival touched it; no test looked at the arm | the same paths, and the timetable's arrival and departure (`ferry.js`, now passages too) | the tests above and `tests/ferry.test.mjs` (the arm and the houseboat added). Clearances now: breakwater 1.8 m, arm 1.27 m, second pier 4.2 m, houseboat 8 m |
| Her motion (`ferry.js` `shipMotion`): heave with the swell, roll at her own period (IMO estimate, 5.5 s), ±0.35° alongside and in harbour, ±2° at sea, pitch to ±0.5°; one model for moored, crossing and timetable, so nothing jumps when she casts off. The ramp's toe and the gangway's foot now rest on the quay and the pier while she heaves (they bobbed ±0.1 m into and above the concrete) | the model's ramp and gangway (`ferry-model.js` `restRamp`, `restGangway`); the cars' lane onto the ramp is unchanged (the toe stays where it lay) | `tests/ferry.test.mjs`: roll and pitch amplitudes; toe and foot within 2 mm of where they always lay while she heaves |
| Her lights: navigation lights under way from sunset to sunrise (none alongside), the saloon lit by the clock in service and only the night watch's light after the last boat; before, only the timetable mode (not used in play) lit her | `ferry-model.js` (`setNavigationLights`, `setCabinLights`), `ferry-ship.js` `FERRY_DAY` | `tests/ferry.test.mjs` (night crossing lit, red to port; dark alongside; none by day) |
| Her sound: the whistle at 350 Hz (COLREGs Annex III for 20–75 m; it was a liner's 110 Hz), sounding Rule 34's signals from her passage (one prolonged and three short leaving the berth, one prolonged passing the breakwater's end), played where she is; her engines follow her (idle alongside, louder under way, off on shore power after the last boat) instead of a fixed point by the Port Building | `town-audio.js`, the ferry's state passed to it from `game.js` (`world.ferry.audio`) | `tests/ferry.test.mjs` (the signals and where they are sounded; engine states by phase and hour) |
| One timetable: crossings on request, with the commuter boats in at 08:30, 14:30 and 22:00, on the poster under the canopy, the hall's board, the boarding menu, the harbour office and the ticket clerk on the izakaya telephone; Vy waits for the ferry to school, not a bus | `commuter-schedule.js`, `port-building.js` (poster), `island/play.js`, `izakaya-play.js`, `neighbours.js` (Vy's words only: her places and hours are unchanged) | `tests/ferry-timetable-words.test.mjs` |
| The power house reads 60 cycles (Okinawa is 60 Hz) | `school.js` | the same test |
| The fishing boat at the east quay called herself "the Minato Maru"; she is the Daisan Minatomaru, and the ferry has the name | `okinawa/quarters.js` (the inspect text) | read |
| Seen from the pier she no longer vanishes at the harbour mouth: the town draws streets only within 54 m of the player and treated her as a point with a ±4 m box (`render/town-sections.js`), so she popped out of sight as she left; she is now drawn wherever she is in view, like the islands on the horizon | `ferry.js` (`userData.horizon`) | `tests/ferry.test.mjs`; photographs 03 and 04 |

Not moved in this batch: **the cargo ship**. In today's 31 m basin there is nowhere a 26 m coaster can come in bow
first and leave again: the pocket west of the ferry (between her and the second pier) is 23 × 10 m, so a ship lying
there cannot turn to get out; the outer pier's east face needs a turn of 90° within 31 m of a breakwater, and her
stern would hit it; the east quay is full with the fishing boats. Every one of them also crosses the ferry's swing.
Its berth moves with the bigger basin, in batch 4 (to the outer pier's east face, in and out round the
breakwater's east end), and its clipping and sideways arrival end there.

**Looked at** (`node tools/ferry-look.mjs <dir> --source --jpg --set=crossing,night`, the reviewed set in
`docs/qa/ferry/b1-*.webp`): the swing clear of the second pier's arm (01), the ramp's toe on the quay (02), the ship
leaving and at sea seen from the pier (03, 04), at sea with the player aboard (05), her lights crossing at night (06:
masthead, green sidelight, stern light, the saloon lit) and dark alongside after the last boat (07), the timetable
poster (08), in at Kitano-jima (09). Two things the photographs taught the look tool: far from the player the game
draws neither the sea nor (until this batch) the ship, so a crossing is photographed with the player carried aboard,
as the ride does; and teleporting is not followed by a step, which would walk the player back to dry ground.

Not affected: no film view sees the berth or the poster (`impact.py` over x −45…10, z −120…−48: the `cloud` view of
`thuan-poster` sees 1 % of the berth's box, none of it in plain view); the storyteller's harbour, pier and ferry
backdrops show her alongside, where she lies as before.

### Batch 2: the ship as data at the new size (no visual change)

**Plan: what it touches.** `ferry-ship.js` becomes the 34.5 m Minato Maru as designed (`briefs/ferry-audit.md`
§2–§5): her particulars, heights, the general arrangement deck by deck (every space with where it is, what is in it,
why, and its ways out), the ten car places and the trucks' loading plan, the machinery and its systems, the electrics
(generators, emergency generator, shore power, boards, the preference trip) and the load table in five conditions
(at sea, arriving and leaving, loading, at night on shore power, blackout), the lifesaving and fire appliances, the
safe manning of eight, and the scenarios grown to her equipment. Nothing is drawn differently: the model and
everything that places things on her keep the 22 m hull's numbers, which move to the model
(`ferry-model.js` `FERRY_HULL`, `FERRY_DECKS`, the hull as drawn) until batch 5 grows her.

| Touches | How | Checked by |
|---|---|---|
| The model, the paths and berths, the crossing, the cars' deck place and the passenger's place (`ferry-model.js`, `ferry-paths.js`, `ferry.js`, `airport-ferry.js`, `town-traffic.js`) | read `FERRY_HULL`/`FERRY_DECKS` from the model instead of `FERRY_SHIP`/`FERRY_DECKS` from the data; the same numbers | every ferry test unchanged and passing; the model's triangle count and bounding box the same |
| Her roll period | `shipMotion` rolls at the drawn hull's period (`rollPeriod(FERRY_HULL)`), 5.5 s | `tests/ferry.test.mjs` |
| The crew (`people/ferry-crew.js`) | its four posts are four of the eight in `FERRY_MANNING`; who fills the other four is the crew batch's (the brief and the earlier plan cast them differently: an open decision) | `tests/ferry-ship.test.mjs` |
| The stories (`FERRY_SCENARIOS`) | the four kept and grown: the blackout now comes at the breakwater and the emergency generator takes the load; the net is round the starboard screw; the ramp hose; the shore power plugged in with two phases crossed (at 50 kVA the rice cooker no longer trips it) | every step's post is in the manning and its place in the general arrangement |
| Residents, routines, colliders, walking routes, cars, backdrops, films | none: data only | — |

**Checked.** `tests/ferry-ship.test.mjs` holds the data to the brief and the rules: displacement from her block
coefficient (within 2 %), depth = draft + freeboard, the masthead light six metres and a breadth above the hull, 4.2 m
clear under the passenger deck; every space inside her hull, none overlapping another unless it is inside it, every
manned space with two ways out (or one into a space with two), a hundred passenger places (36 + 42 + 22), the engine
room's ways out through the casings and the emergency-generator and CO₂ rooms opening to the open deck only; ten car
places and the trucks' plan sized for the town's longest and widest vehicle, half a metre apart, clear of the casings,
the walkway and the bow houses; the bilge main and the CO₂ by their rules; the load table's totals within 0.15 kW of
the brief (39.9, 109.8, 45.7, 10.3, 10.0 kW against its rounded 39.8, 109.7, 45.6, 10.3, 9.9), the generators at 40 %,
55 % on two, 46 %, shore power at 26 %, the emergency generator at 31 %, the preference trip shedding 14.4 kW at
stage 1, the thruster's 122 A and its star-delta start within two generators, the lighting transformer at 44–54 %;
rafts, jackets and lifebuoys for 108; the scenarios' posts and places. The model is unchanged: built from batch 1's
code and from this one, its 47,158 vertices give the same checksum, so there is nothing new to photograph; the 79
ferry, harbour, traffic and storyteller tests pass.

### Batch 3: the harbour, ground only (the breakwater out, the outer pier longer)

**Plan: what it touches.** The basin is made big enough for her: the breakwater moves 23 m seaward (its centre from
z −83 to −106, the same 68 × 4 m wall, its two beacons with it), so the basin is 54 m from the quay instead of 31;
the outer pier is lengthened from 15.3 m to 38.35 m (to z −88), slab, coping and edge beams, so the 34.5 m ship
will lie along its west face with her stern line on it. No prop moves in this batch: the old end rail at z −64.18,
the bollards, the bait station, the winch, the crates, the lamp and the fenders stay where they are, and the
extension stays shut behind the rail until batch 4 moves the rail and the pier-end props to the new end.

| Touches | How | Checked by |
|---|---|---|
| The breakwater and its beacons (`harbour.js`) | moved to z −106 | the tests that pin it (`ferry.test.mjs`, `airport-ferry.test.mjs`, `kitano-link.test.mjs`: its beacon is there, the open water inside and outside is clear) |
| The outer pier (`layout.js` `OUTER_PIER`, `town.js`) | slab, deck surface, coping and edge beams to z −88 | `routeAt`, `groundHeight` on the new slab; `open-street.test.mjs` |
| Walking on the pier | unchanged: the walkable pier still ends where it did (z −64.95, `OUTER_PIER.open`), so the extension beyond the old end rail is not walkable yet. (Stopping it at the rail itself was tried and undone: two of today's queue spots, z −63.85 and −64.15, stand in the rail; they move with the gangway in batch 4) | `port-access`, `airport-dock-access`, `bus-boarding`, `open-street` |
| Today's 22 m ship's passages (`ferry-paths.js`, `airport-ferry.js`) | her old swing put her stern where the longer pier now is (x −2.7, z −76.6 as she turned); she now backs out south-west, clear of the pier, and swings in the western basin the breakwater has opened. The mouth's corner moves out with the breakwater's west end (to −47, −86; the sea corner to −42, −124), her way in starts its swing a little further south (−29, −73.5), and the minutes are shared again (in from the mouth 1.5 min, the sea 9.5; out unchanged); the breakwater's prolonged blast is sounded at its new end | `tests/airport-ferry.test.mjs`, `tests/ferry.test.mjs` against the new pier and breakwater (whole hull outline, turn rates, speed and acceleration) |
| Standing spots and routines | none move: the pier-end spot (`openings.js` 'pier'), the fishing, bait and winch prompts, Vy's place and the queue are all north of the rail | the same tests |
| Cars and traffic | none: the cars' lanes are on the quay and the ship | `kitano-link.test.mjs` |
| The storyteller's harbour, pier and ferry backdrops | the breakwater and the extension are in their background | looked at from the same cameras (below); rendered again with the new ship in batch 5, so the pictures are not committed three times |
| Films | `impact.py` for the old and new breakwater and the extension | below |

**Checked.** The related suites pass (85 tests: `ferry`, `ferry-ship`, `ferry-timetable-words`, `airport-ferry`,
`airport-island`, `airport-dock-access`, `kitano-link`, `port-access`, `open-street`, `bus-boarding`,
`lived-in-island`, `fujita-houseboat`, `owned-vehicles`, `harbour-instances`, `feed-storyteller`, `spawn-scene`).
`kitano-link.test.mjs` now finds the breakwater at its new place and keeps the open water clear inside and outside it.
The whole hull outline, every second of both timetables: 3.84 m off the breakwater (its south-east head, on the way to
Kitano-jima; 1.8 m before), 3.75 m off the second pier arm going out and 1.78 m coming in, 6.65 m off its north face,
12.6 m off Fujita's houseboat; she lies 0.15 m off the outer pier only at the berth, on her fenders. Photographed from
source (`tools/ferry-look.mjs --source --set=harbour`, its harbour views moved out with the basin): the plan, the
extension from the quay, the swing in the western basin, out round the breakwater, the way in, and the storyteller's
pier camera with the extension and the breakwater behind the rail (`docs/qa/ferry/b3-01` to `b3-06`). Films:
`impact.py` finds no view that sees the old or new breakwater or the extension, in either episode.

**Still open after batch 3.** The cargo ship still comes in sideways along x −20.5 and now passes through the
breakwater at its new place (it passed through the old one too); batch 4 gives her a berth and a way in. The sea leg
to Kitano-jima joins its leading line 3.8 m off the breakwater's south-east head: good enough for today's ship at
the time-lapse's speed, not for a 34.5 m ship; batch 5 lays her passages again (the east gap, or the leading line
joined further east).

### Batch 4: berths, props and colliders

Done in three parts, each checked and committed on its own: (a) Minato's ferry berth, (b) the cargo ship's berth,
(c) Kitano-jima's berth (after the island work merged from main the same day has been read). Today's 22 m ship still
sails until batch 5; everything here is laid out for the 34.5 m ship and works for both.

#### 4a: the ferry's berth at Minato

**Plan: what it touches.** The pier's west face becomes a berthing face for the 34.5 m ship (stem at z −52, stern
at −86.5): nine V-type rubber fenders (250 mm, 1 m long) at 4 m centres from −52 to −84 on the coping face, in place
of the four D-fenders that served the 22 m ship; four cast bitts on the edge, 0.45 m in from the face, where her
lines lead (−53 head line, −62 forward spring, −77 after spring, −87 stern line), in place of the two mushroom
bollards that stood in the middle of the west half (2.75 m in, where the passengers will walk to her gangway); a
ladder recessed into the face at −66; a lamp at −79.5 (the old one at −63.25 stays). The pier end moves to the new
end: the end rail (to z −87.6) and the anglers' corner with it (the bait station, the winch, the crates, the rope
coil, the fishing prompt, a lifebuoy on the end rail), and the walkable pier with it. At the quay, a steel landing
plate for her ramp, flush with the quay (x −10.8 to −6.3, the 4.4 m ramp's footprint and its run-off); the quay
bollard that stood in it (x −10) and its rope coil move 2.3 m west, and the quay rail stops short of the plate.

| Touches | How | Checked by |
|---|---|---|
| Her berth (`ferry-paths.js` BERTH_X) | she lies on the fender faces, not 0.15 m off a bare face: her centre from x −7.45 to −7.64 for today's ship (−8.64 for the 34.5 m one); leaving, she comes 0.3 m off the fenders while she backs | `ferry.test.mjs`, `airport-ferry.test.mjs` (whole hull against the fenders, the pier, the arm, the breakwater) |
| Colliders | the two bollards in the walk go; four bitts on the edge, the bait station, winch and crates at the new end; nothing new stands in the walk from the quay to the gangway or the queue | `airport-dock-access` (street to the queue and landing), `port-access`, `bus-boarding`, `ferry` (queue places on the pier) |
| Walking on the pier | to the new end rail (z −87.4) instead of −64.95 | `stability.test.mjs`, `systems.test.mjs` (the new end stops you), `open-street.test.mjs` |
| The gangway, the queue, the arrival point | unchanged in z (they follow the ship's door, `FERRY_BERTH.gangwayZ`); the gangway is 0.19 m longer across to the pier; no bitt within a metre of it | `ferry.test.mjs`, photographs |
| Cars and traffic | the ramp and the cars' line move 0.19 m west with her; the landing plate is flush, the nets keep 0.26 m to a car's mirror | `owned-vehicles`, `kitano-link`, photographs (the nets move in batch 5, with her new centreline) |
| Standing spots and routines | the spawn 'end of the pier' (`openings.js`) moves to the new end; residents' places (`town-grid.js` pier, the cat, the ballgame) are characters' routines and are left for their own batch | `openings.test.mjs`, `spawn-scene.test.mjs` |
| The storyteller | the pier's camera (`feed/places.js`) moves to the new end, where its things now are (the end, the rod, the bait, the light); the pictures are rendered again in batch 5 with the new ship | `feed-storyteller.test.mjs` |
| Films | `impact.py` for the pier, the quay plate and the bollard | below |

**Checked.** The related suites pass (126 tests, the batch 3 set and `stability`, `systems`, `openings`,
`port-shed`, `port-building`, `feed-seating`, `east-garden`, `office`, `resident-life`, `town-sections`,
`quest-customization-audit`). Two new checks: she lies on the fenders' faces (to 5 mm), with four or more along her
side, and no point of her hull goes into them at any moment of either timetable (`ferry.test.mjs`, and
`airport-ferry.test.mjs` for the Kitano-jima passages). Doing that showed she touched the forward fenders by a centimetre
in the last metre of coming alongside, turning as she slid in; her last key now has her parallel to them, 0.36 m
off, so she closes the last metres square. Clearances as before (3.84 m off the breakwater, 1.78 m off the arm
coming in, 3.75 m going out); turn rates within the limits. Walking: Main Street to the queue and the landing point,
the pier to its new end (−87.35, the lifebuoy on the rail) and not past it. Films: `impact.py` finds the quay corner
by the landing in one wide view of `thuan-poster` (beat 5, the cloud view), but neither the plate nor the old or new
bollard in plain view; nothing of the pier. Photographed from source (`docs/qa/ferry/b4a-01` to `b4a-08`): the pier
from the quay, her side on the fenders, the empty berthing face with the ladder's recess and the bitts, the gangway
clear of the forward spring's bitt, the ramp on the landing plate with the kerb cut away, the anglers' corner, the
view from the moved spawn, the plan. The anglers' things were moved once after looking: the winch to the east edge
and the crates beside the bait station, so the spawn's view of the lighthouse is not across a crate stack.

**Left for later.** Her lines to the bitts are drawn with the new ship (batch 5), when her own bitts and fairleads
are where they will stay; the drying nets north of the ramp move with her new centreline then too. The residents'
'pier' place (`town-grid.js`, used by the cat and Sunday's ballgame) stays at z −62: that is a routine, not a prop.

#### 4b: the island cargo boat's berth

**Plan: what it touches.** The cargo boat lay "3.5 m off the west quay" with her bow inside the ferry, and came and
went sideways through the breakwater (finding 5). The brief's first choice, the outer pier's east face for the 26 m
ship, does not work once it is drawn: with the breakwater 16 m off the pier's end, a 26 m hull cannot be turned
onto the face without her bow crossing the pier or her stern the breakwater (tried with the whole hull outline at
every second: −0.3 to −4 m into one or the other). The west quay's pocket is a trap the ferry's bow closes. So she
becomes what an island of this size is actually served by, a **19-ton class island cargo boat (19トン型貨物船), 20 × 5
m** (the brief's own fallback length), and lies at the **pier's east face**, starboard side to, bow 2 m off the quay,
on five V-fenders, her four lines on bitts on the east edge (z −53 head line, −60 forward spring, −64 after spring,
−73 stern line). In: from beyond sight to the south, up the open water east of the harbour, round the breakwater's
east end (9 m off it), across the eastern basin on a slant to the pier, the stern brought in last. Out: the stern
sprung off, astern 22 m until her bow is past the pier's end, ahead hard to port across the eastern basin (her stern
kicks to 2 m off the pier's end), past the breakwater's end and away south. Her speed is held to what she can carry
(0.05 m/s² ahead, 0.03 astern, 2.4 °/s on her turns: `ferry-paths.js` `profiledTrack`). The fishing boat that lay off
the east face goes alongside the main quay east of the pier, by the east quay's boats, on the quay wall's tyre at
x 14, her lines to the quay bollards at x 10 and 15; the east face's rails and her two bollards go.

| Touches | How | Checked by |
|---|---|---|
| The cargo boat (`cargo-shipping.js`) | 20 × 5 m (her old 26 m model drawn to scale), floats 0.7 m deep instead of 0.14, real passages in and out, four mooring lines drawn to the bitts while alongside, in place of the single rope to the west quay | `tests/cargo-shipping.test.mjs` (new): every half second of both passages, the whole hull outline against the pier, its fenders, the ferry's fenders, the quay, the breakwater, the moved fishing boat, the east quay's boats and Kitano-jima's shore; never west of the pier; speed, turn rate and acceleration; she lies on her fenders |
| Her timetable (`CARGO_CALLS`) | alongside 07:30–08:55 and 15:00–16:30 (the morning boat used to leave at 08:40, in the ferry's 08:30 call); in and out take her passages' minutes (4.4 and 5.7) | the same test: her harbour minutes fall outside the ferry's timetable calls |
| The pier's east face (`town.js`, `minato-berth.js` `CARGO_BERTH`) | five V-fenders, four bitts on the edge; the two bollards 2.75 m in, the rails on the east flank and the fishing boat's ropes go; the ladder stays between her fenders | `airport-dock-access`, `port-access`, `stability` (walking on the pier) |
| The fishing boat (`harbour.js`) | alongside the main quay at x 13.5–19.8, lines to the quay's bollards | `cargo-shipping.test.mjs` (4 m off the cargo boat), photographs |
| Her board (`cargo-shipping.js`, the west quay) | the real times, and which side she berths | `lived-in-island.test.mjs` |
| Residents | none: Riku, Emi and the forklift keep their places and hours (`docklands-life.js`); the freight board's shifts are unchanged | `lived-in-island.test.mjs` |
| The ferry | none: the two never share water (the cargo boat never comes west of the pier) | `cargo-shipping.test.mjs` |
| The storyteller | the harbour camera (16:00) now has her alongside the east face in its view; rendered again with the new ship in batch 5 | batch 5 |
| Films | `impact.py`: neither the east face, the fishing boat's new place nor her old place is in plain view of any shot | done |

**Checked.** The related suites pass (115 tests, with the new `cargo-shipping.test.mjs`). Her clearances, whole
hull, every quarter second: 0.70 m off the pier and its fenders while she slants in, 2.0 m off the pier's end as her
stern kicks on the way out, 7.8 m off the breakwater, 3.6 m off the fishing boat, 10.6 m off the east quay's boats,
2.0 m off the quay with her bow alongside; never west of the pier. Her passages: in 4.4 minutes, out 5.7; at most 3.2
m/s (6 knots) at sea, 2.4 °/s on her turns, 0.05 m/s² changing speed. Walking on the pier and to the queue as before.
Photographed from source (`docs/qa/ferry/b4b-01` to `b4b-07`): round the breakwater's east end, slanting in to the
pier, alongside with her lines and fenders, swinging out across the eastern basin, the fishing boat on the quay, and
the harbour from above at 08:00 with both ships at their berths.

**Left for later.** Her hull is still the old box model drawn smaller (a flat-sided hull, the deck overhanging its
bow); she deserves the ferry's lofting in her own batch. An on-request ferry crossing to Kitano-jima can meet her
on her sea leg south-east of the breakwater (only the timetable calls are kept apart); the call batch should have the
ferry wait for her, as a harbour master would.

