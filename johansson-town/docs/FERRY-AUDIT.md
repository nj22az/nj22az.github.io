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

#### 4c: Kitano-jima's berth

Waits for the merge of main's island work (Kitano-jima and Mount Aoba grown in detail, another session, 2026-10-11)
into this working copy, which another session's unfinished files hold up; it is done on the merged island.

### Batch 5: the hull and decks at the new size

**Plan.** `ferry-model.js` is drawn again from the data (`ferry-ship.js`), not scaled: the hull lofted by the same
method at 34.5 × 8.4 m, 3.0 m deep, floating at her laden draft of 1.9 m (car deck 1.1 m above the water: the ramp
lies at 5° on the quay), a blunt island-ferry bow with the ramp's opening and the two bow houses, the spoon forefoot,
the counter over twin 1.45 m screws, two spade rudders, the 0.9 m thruster tunnel; white topsides over red-brown
antifouling with the teal sheer band; the car deck (2.5–30 m from the transom) with two lanes, ten numbered places,
48 lashing sockets, the casings either side (3–20 m) and the railed walkway to the gangway door; the passenger deck
over it (0–23 m: the open deck aft with its benches and twin funnels, the deckhouse with windows the length of the
lobby, carpet room and saloon, the side walkways); the bridge deck (the crew house, the wheelhouse and its open
wings); the compass deck and the mast with its lights at their heights (masthead 15 m above the keel); the 4 m ramp
and 2 m flap on their rams; the lifesaving gear where the GA puts it. Every deck a person uses is a floor at its GA
height with the headroom and the stairs between, listed in ship coordinates for the walking batch (`FERRY_WALK`).
One correction to the data: the gangway door and the walkway to it go to the **port** casing, the side she lies to
at Minato (the brief put them to starboard, which would face the open water there).

| Touches | How | Checked by |
|---|---|---|
| The model and its parts (`ferry-model.js`: hull, decks, ramp, gangway, gate, lights, screws, radar) | drawn from `FERRY_SHIP`, `FERRY_HEIGHTS`, `FERRY_GA`; the same parts and controls (`setRamp`, `restRamp`, `restGangway`, `setGate`, lights) | `ferry-ship.test.mjs` (the model's sizes and decks against the data, the screws in their apertures, the ramp's width and reach), draw calls |
| Her berth at Minato (`ferry-paths.js`) | on the fenders (x −8.64), the stem 2.2 m off the quay (centre z −69.45), the gangway door at z −72.7 | `ferry.test.mjs`, `airport-ferry.test.mjs` (whole hull) |
| Her passages in and out of Minato and to Kitano-jima | laid again for 34.5 m: astern off the berth, the swing in the western basin round (−24, −84), out by the mouth; the sea route joining Kitano-jima's leading line clear of the breakwater's head | the same tests; turn rates, speed, acceleration |
| The gangway, the queue, the arrival point | follow her door (`FERRY_BERTH.gangwayZ`) to z −72, on the new pier length | `ferry.test.mjs` (queue on the pier), `airport-dock-access.test.mjs` (the walk to it) |
| Cars (`town-traffic.js`) | the ramp's landing and the deck place from `FERRY_CAR_PLACES` (the first car to the aft end of the starboard lane, as a loader fills her); the drying nets out of her ramp's line | `owned-vehicles`, `kitano-link`, `bus-boarding` |
| The passenger's place on a crossing (`play.js` via `FERRY_DECKS.passenger`) | the open deck aft, between the benches | `airport-ferry.test.mjs` |
| Kitano-jima's berth | her ramp on its landing (after 4c) | `airport-ferry.test.mjs`, `airport-dock-access.test.mjs` |
| The storyteller | the harbour, pier and ferry pictures rendered again (`tools/render-feed-backdrops.mjs`, from source) | `feed-storyteller.test.mjs`, looked at |
| Films | `impact.py` for her new footprint | below |

**What changed from the plan, once it was drawn.** (1) Her ramp, centred on her centreline at x −8.64, would have
landed 0.37 m inside the warehouse's south-east corner (x −10.57 from z −47.96), as would the brief's (x −10.8): the
quay between the pier and the warehouse is 6.4 m wide. So her stem lies 2.2 m off the quay, the 4.6 m leaf lands
0.33 m short of the corner, and the 2 m flap that lies on the quay is 3.6 m wide, 0.13 m clear of the wall; the
landing plate is narrower under the flap. (2) The row of three fish crates under the floats on the warehouse's wall
(`okinawa/old-town.js`) stood where the flap lies now, and the corner from there to the forklift's shutter is swept
by the cars coming off her (`kitano-link` found a car's tail in the one stack first kept there): the crates are gone,
as a ferry's apron is kept clear, and the floats stay hung on the wall above it. The quay wall's tyre fender at x −7,
which had stood in the coping and was left standing on the plate when 4a cut the coping away, is gone too (her stem
lies 2.2 m off the quay). The drying nets move 1.3 m north: the cars
backing round onto her centreline, a metre further west than the 22 m ship's, sweep their old place. (3) Her harbour work takes longer than the small ship's: in, four and a half minutes (the timetable's
`FERRY_TIMES.harbour`, 3.5 before), with a pivot leg of its own; to Kitano-jima the harbour work at both ends takes
about ten minutes of the eighteen and the sea seven. (4) The sea route to Kitano-jima now runs 28 m south of the
breakwater and joins the leading line east of its head (the 34.5 m ship's berth there is 6 m further out along it);
her hull passes the head 3.4 m off going and 3.2 m coming back (3.8 m for the 22 m ship): the leading line itself runs
that close, and 4c, which lays Kitano-jima's berth for her, is the place to move it out. (5) The passage planner can now ease a
leg's speed in from the last one's over a given distance (`ease`), so the slow pivots and the brisk legs either side
join without a jump. (6) The landing plate of 4a lay on the quay's slab, its top 4 mm over the concrete across 21 m²,
which a phone draws as two flickering surfaces (`ground-clearance.test.mjs` found it). The slab (`harbour.js`) is now
cast round the plate and recessed under it: the plate and the steel angle in front of it are let in, their tops flush
with the concrete (`MINATO_BERTH.landing.top`, −0.016), and plate and concrete meet edge to edge.

**Checked.** `ferry-ship.test.mjs`: her particulars from the data, her decks at their heights, the mast top and the
masthead light where the GA puts them, ten car places in two lanes stopping at the casings, the screws under the
counter, the lights and the ramp's rams, and every deck a person walks on outside (`FERRY_WALK`: the car-deck walkway
and lanes, the aft mooring station, the open deck, the side walkways, the bridge deck's ledges and aft platform, the
wings, the compass deck) is a drawn floor with two metres over it; 31 meshes, about 25,000 triangles.
`ferry.test.mjs`, `airport-ferry.test.mjs`: the whole 34.5 × 8.4 m hull against the pier, its fenders, the second
pier's arm (1.9 m in the pivot), the breakwater (2.1 m), the houseboat (10.6 m), the quay and Kitano-jima's shore
(4.1 m), every half second of every passage; turn rates within their limits and no speed jumps; the ramp's leaf on
the landing plate and its flap flat, the gangway's foot on the pier, as she heaves and rolls. `owned-vehicles`,
`kitano-link`: the crossing car backs aboard to the aft place in the starboard lane, its whole body clear of every
solid on the quay. `airport-dock-access`: Main Street to the queue at her new door. `ground-clearance`: no two surfaces in one plane
(the plate let into the slab), with `boot`, `collider-grid`, `consolidation`, `warehouse` and the rest of the harbour's
suites. Films: `impact.py` finds nothing of
her, her ramp or the plate in any shot; the moved nets and the crates' empty place are in plain view of `thuan-poster`'s cloud shot
(beat 5, down Main Street): its plates `main-street` and `main-street-2` must be photographed again before that film
is rendered again (the published film is unchanged). Photographed from source (`docs/qa/ferry/b5-01` to `b5-16`): at
the berth from the quay, the ramp on the plate by the warehouse's corner, the gangway from the pier, broadside, the
stern quarter, along the car deck from the ramp, the open deck aft, the bridge and mast, from above, in dry dock,
pivoting in the western basin, out round the breakwater, bow-in at Kitano-jima, alongside at night, the landing
plate flush with the quay (b5-15), and the quay's kerb across the pier's root (b5-16, found; below). The storyteller's
harbour, pier and ferry pictures are rendered again from source (`tools/render-feed-backdrops.mjs --source`).

**The Kitano-jima passages on the merged island.** This batch was built on the island as it stood in this working
copy, Kitano-jima 150 m east of the harbour. On the branch Kitano-jima had moved far across the strait (main,
`48431b8b`, to x 270, z −290) and the crossing had been re-timed from its legs' lengths (`8ebecf2c`). In the merge,
`airport-ferry.js` keeps `8ebecf2c`'s paces (28 m a town minute at sea, 24 out of the harbour) and its crossing timed
from the legs' lengths, with this batch's harbour keys, eased legs and harbour minutes for the 34.5 m ship
(`FIXED_MINUTES`: 7.6 to Kitano-jima, 9.5 back; out of each harbour at least 3 and 1.5 minutes). Her sea route is laid
again for her: from the mouth south to (−42, −132), a 60 m turn there to the south-east across the strait, and a 60 m
turn onto the leading line 65 m short of her berth (which lies 6.25 m further out along it than the 22 m ship's). The
22 m ship's 40 m turns took her to 1.03°/s where a turn meets a straight; on 60 m turns she turns at most 0.62°/s going
and 0.69°/s coming back. The crossing is 22 minutes (19 for the 22 m ship; the ride 13 seconds): out, 2 astern, 2.5
the pivot, 3 out by the mouth, 11.4 at sea, 1.5 the approach and 1.6 alongside; back, 1.5 astern, 2 her swing, 1.5
out along the leading line, 11 at sea, 1.5 in through the mouth, 1.6 the pivot and 2.9 alongside. Her hull keeps 2.1 m
off the breakwater (in the pivot) and 3.95 m coming in, 1.88 m off the second pier's arm, 10.6 m off the houseboat and
4.1 m off Kitano-jima's shore at the jetty. Checked on the merged tree: `airport-ferry`, `airport-dock-access`,
`ferry-timetable-words`, `ferry`, `ferry-ship`, `kitano-link`, `owned-vehicles`, `cargo-shipping`, `airport-island`,
`ocean`, `ground-clearance`; photographed on the merged island (`docs/qa/ferry/b5-17` to `b5-24`: the pivot in the western basin, out past
the breakwater, at sea with Kitano-jima ahead, on its leading line, alongside, and bow-in at its jetty with the ramp
on the landing). Kitano-jima's berth itself is still 4c: the jetty has no fenders or bollards for the bigger ship.

**Left for later.** Her mooring lines to the bitts (the call batch); Kitano-jima's berth for her (4c); the interiors,
the engine room and the bridge to walk in; the timetable's real-time crossings.
Found while photographing the plate, not changed here: the quay's coping and kerb (`harbour.js`) run on across the
outer pier's root (x −4.1 to 4.1), so everyone walking onto the pier walks through a 28 cm kerb, and the tyre fender at
x 0 stands in it. A props batch cuts them there; the pier's deck then stands 11 cm over the quay at its root, which
wants a short ramp (`layout.js` steps the walking height there from 0 to 0.098).


### Batch 6a: walking aboard alongside (2026-10-11)

The creator, 2026-10-11 (a phone screenshot at the gangway): *"I want to be able to board and explore the ferry,
whenever it's in port."* Until now "Board" opened the ticket menu and the crossing was a ride; nobody set foot on her.

**What changed.** `src/world/ferry-walk.js`: her decks are floors in her own frame (the ship, the ramp's leaf, its flap,
the gangway), so they heave and roll with her and can stack (the car deck under the passenger deck); the floor under
you is the highest one no more than a step above your feet. Her casings, bow houses, the walkway's rail, the pillars,
the capstan and bitts, the forecastle ladders, the ramp's rams and the gangway's rails are solids in the same frames.
Where a floor ends you step ashore only where the shore is there: off the gangway's foot onto the pier, off the
ramp's flap onto the quay's landing plate (Minato) or the pier (Kitano-jima). The gangway is a floor only while it is
run out, the ramp only while it is down, and nothing is a floor while she is under way: **only in port**.
`game.js` walks the player on them (`deckUnder`, `playerGround`; her own solids instead of the town's bounds and the
hull collider while aboard; the third-person lens kept out of her casings and from under the passenger deck's slab).
A vehicle's crossing (`island/play.js`) waits while the player is aboard, so she never sails off with a visitor; the
player's own crossing is still bought on the pier and ridden on the open deck as before.

**The model.** The gangway door was painted on a solid casing. The port casing now has the passage the general
arrangement gives it (shipyard z 13.5–14.5): the gangway door in her side, hooked back against the passage's aft wall
alongside; the gate leaf hooked back against its forward wall (it used to swing into the casing); a 2 m deckhead with
its light; the shore-power box (440 V) on the forward wall; and the inboard door onto the walkway, hooked back against
the casing's face.

**What you can walk now.** The pier → the gangway → the passage → the walkway (its rail keeps you off the lane until
its ends) → the whole car deck from the aft mooring station to the bow houses → the ramp → the quay, and back; at
Kitano-jima the ramp from the pier.

**Checked.** `tests/ferry-walk.test.mjs`: the walk from the pier up the gangway, through the casing to the walkway and
the lane with no jump in height; the bulwark, the casings and the gangway's rails stop you; down the ramp to the quay
and back; at sea, nothing; up the ramp at Kitano-jima; every floor 4 cm or less from the surface the model draws.
In the running game (source tree, headless): the same walk by the keyboard, photographed on the pier, in the passage,
on the walkway, down the lane, on the ramp and on the quay. The whole suite (`npm test`).

**Open, next batches (in this order).**
1. **Stair P and the lobby** (6b). The general arrangement's passenger stair P (casing P, z 10–13.5) cannot top out in
   the lobby (z 6–9.5) as drawn: rising aft from the walkway's door at z 11.8 at 48°, it needs its well open from
   z 7.4 to 9.4, under the 0.5 m side walkway. The lobby is made full breadth (to her sides, z 6–9.5) with the stair
   heads P and S in its wings, and the side walkways start at its forward doors (z 9.5).
2. **The side walkways are 0.5 m wide** (x 3.6–4.1), too narrow to walk (a person needs 0.56 m, and the walkways'
   liferafts stand in them). The deckhouse goes to 6.8 m (walkways 0.7 m clear), the liferafts onto cradles outboard
   of the rail.
3. The lobby's furniture (purser's window, kiosk, vending corner, boards), the toilets, the carpet room, the saloon;
   the open deck aft and its ladders up to the bridge deck; the wheelhouse and the crew's rooms; the engine room
   (from the casing's door at z 7). Each with its floors and solids in `ferry-walk.js`.
4. The forecastle tops (a vertical ladder each): a climb, not a walk.
5. Tapping to walk (point-walk) plans over the town's ground only, so it does not route aboard yet; walking with the
   stick or the keys does.

**The ramp head cleared (the creator, 2026-10-11, with a marked-up phone screenshot: "remove anything that blocks the
drive up the ramp, just delete them, we will decide later if we need any of them"; "the ramp shouldn't poke under the
warehouse").** Deleted: the nets' drying frame against the warehouse (`harbour.js`), the harbour hand pump and its
prompt (`town.js`), the net of floats on the warehouse's corner (`okinawa/old-town.js`) and the quay bollard at x −5
beside the landing (`harbour.js`). The warehouse (`warehouse.js`) is 2.5 m shorter at its quay end (z −45.4 instead
of −47.9): its east wall stood 0.4 m over the landing plate's west edge, so the ramp ran under it. Its street end,
doors, signs and shutter are where they were. Open: whether any of the deleted things come back, and where.

### Batch 6b: her houses walked inside (2026-10-11)

The creator, 2026-10-11: *"The ferry needs to be explorable."* Her decks above the car deck are now walked, inside and
out, while she lies alongside.

**One list for what is built and what is walked.** `src/world/ferry-interior.js` holds her casings, stairwells, the
passenger deck's slab, the deckhouse, its rooms and furniture, the walkways, the ladders and the wheelhouse as boxes,
bars, panes and floors. `ferry-model.js` draws them; `ferry-walk.js` stands people on the floors (a stair's or a
ladder's floor slopes, `y` given at each end) and stops them at the boxes marked solid; the third-person lens stays out
of the boxes marked for it (the deckheads, the awning, the bridge deck's platform). So what you see and where you can go
cannot disagree, and the tests check every floor against the surface the model draws.

**The general arrangement corrected (`ferry-ship.js` FERRY_GA).**
- *Stairs P and S:* in the casings, z 7.4–12.3, the door from the car deck at z 11.3–12.3 (P from the walkway), the flight
  rising aft at 48° (22 risers of 0.2 m) to the lobby, the well open in the passenger deck from z 7.4 to 9.4 where the
  stair passes under it with headroom. (As drawn before, z 10–13.5, a stair could not top out in the lobby.) The crew
  changing room (P) and the bosun's store (S) are under the flights.
- *The lobby* is the deckhouse's full breadth (z 6–9.5, x ±4.1), its wings the stair heads.
- *The house forward of it is 6.8 m wide* (was 7.2): the side walkways are 0.7 m, wide enough to walk (0.5 m was not),
  from z 9.5; their liferafts are in cradles outboard of the rail (they stood in the walkway).
- *The saloon* has a cross passage at its aft end (z 16.5–17.6) to its side doors (moved from z 21.7 to 17.05), then
  the seven rows of 42 seats.
- *Each walkway ends in a ladder to its bridge wing* (z 17.6–19.5, 53°), and the wing's door opens into the wheelhouse.
  (The open deck no longer opens onto the walkways: the lobby's wings stand between.)

**What you can walk now.** From the walkway on the car deck, through stair P's door and up into the lobby (the
purser's window, the drink machines, the toilets' doors, benches, the timetable board); aft through the double door to
the open deck (benches under the awning, the funnels, the liferaft, the rescue boat) and up either ladder to the bridge
deck's aft platform (the emergency-generator and CO₂ rooms' doors); forward along the corridor between the toilets, up
two steps into the carpet room (carpet, cushions, the shoe shelves, the life-jacket lockers, the blanket rack, the
television), down two into the saloon; out through a side door onto the walkway, up the ladder to the bridge wing (the
dodger, the wing console) and in through the wing door to the wheelhouse (the console under the windows with the radar,
the engine levers and the VHF, the steering stand and its wheel, the master's chair, the chart table). Stair S from the
starboard lane the same way. The windows are glass now: you see out, and in from outside.

**In the game.** While aboard, the town's fixed colliders (the pier's bitts and fenders alongside) no longer stop the
player or the lens: only what moves with her (the cars on her deck) and her own solids.

**Checked.** `tests/ferry-walk.test.mjs`: up stair P to the lobby, through the corridor, the carpet room's steps, the
saloon, the side door, the walkway and the ladder to the wing and into the wheelhouse, and back down to the car deck,
with no jump in height over 0.16 m; from the lobby to the open deck and up a ladder to the platform; the walls hold
(the saloon's side, the toilets, the stair well, the wing's aft edge, the wheelhouse's front); every floor on the
surface the model draws (stairs within half a riser of their treads). `ferry-ship.test.mjs` (the general arrangement,
the open decks drawn with headroom, 33 meshes, about 33,000 triangles), `ferry`, `airport-ferry`. In the running game:
photographed at the stair door, on the stair, in the lobby, the carpet room, the saloon, on the walkway, in the
wheelhouse, on the wing, the open deck and the platform, and from outside; walked by the keyboard from the walkway up the
stair, across the lobby and through the carpet room into the saloon.

**Open.** The toilets, the crew's rooms (cabins, mess, galley), the emergency-generator and CO₂ rooms and the engine
room are behind closed doors; the compass deck (no ladder yet); the forecastle tops (vertical ladders: a climb); the
crew aboard; tapping to walk aboard. In small rooms the third-person lens comes in close behind him.

### Batch 6c: the engine room and the crew's spaces (2026-10-11)

The creator, 2026-10-11: *"Build the engine room, accommodation spaces etc, be a ship construction engineer in the 90's"*,
and *"The engine room needs focus too."*

**What a 1990s yard drawing office would have caught in the general arrangement, and changed.**
- *The engine room cannot start at z 5.* The hull's counter rises aft of z 10.5: at z 8 her bottom is already above the
  floor plates' level (0.9 m over the keel), at z 5 above the tank top. The engine room is z 8.5–14 (floor plates at
  0.9 m, 1.9 m clear under the car deck); aft of it a **shaft space** (z 5–8.5, over the counter, reached by a manhole)
  carries the shafts to the stern tubes. The fresh-water tanks (z 2.6–5) and the steering-gear room (z 0.3–2.6) sit on
  the counter (2.0 and 1.95 m over the keel), not below her bottom. (`ferry-ship.js` FERRY_GA.)
- *The generators* stand athwartships forward of the mains (the length forward of the engines is 2 m, not enough for
  them fore and aft), and *the control booth* moves aft to starboard (z 8.6–10.9), so the ladder's foot, the strip along
  each side and the cross passage forward are free to walk.
- *The crew's stair to the lobby* had no place a passenger would not walk into. The crew go up the open deck's ladders
  to the bridge deck's aft platform and in through **their own door** between the emergency-generator and CO₂ rooms.

**Built (ferry-interior.js; drawn and walked from the same list).**
- **Engine room:** in by casing P's door (z 6.6–7.4) and a 53° ladder down through a hatch cut in the car deck (the
  plating is open there, `ferry-model.js`), into the port aft corner. Two main engines (x ±1.55, six rocker covers, the
  turbocharger forward, the lagged exhaust led aft to the uptake, a gauge board), their gearboxes and local control
  stands aft, the shafts through the aft bulkhead in their seals; two generators athwartships forward (engine inboard,
  alternator outboard); the control booth (the main switchboard on the aft bulkhead, the engine panel and log desk, a
  chair, the telephone, a window to the engines); along starboard the two fire and general-service pumps, the bilge,
  sanitary and hydrophore pumps; the 1.6 m³ fuel service tank (gauge glass, quick-closing valve) in the forward corner;
  along port the air compressor and the two 150 L starting-air bottles against the aft bulkhead, the workbench and vice,
  the purifier, the oily-water separator, two lubricating-oil drums; the sea chests and their valves low forward; the
  fuel lines; the fire main's hydrant and extinguishers; CO₂ nozzles, lights and the coloured service pipes overhead
  (fuel brown, sea water green, fresh water blue, fire main red); sounding pipes; the escape ladder in the aft starboard
  corner; lining on her sides, chequer floor plates, the deckhead under the car deck.
- **Crew house (bridge deck):** the corridor from the crew's door to the wheelhouse (whose aft door now stands open);
  to port the crew cabin (two bunks), the deckhand's cabin, the mess (a table for six, benches, television, kettle, duty
  board), the chief engineer's cabin; to starboard the chief officer's cabin, the crew WC and shower, the galley
  (range and hood, sink, fridge-freezer, provision locker), the master's cabin (desk, bunk, safe); square ports in each.
- **Emergency-generator room** (the 40 kVA set, the emergency switchboard, batteries, day tank, louvres) and **CO₂ room**
  (four bottles in their rack, the release cabinet, the firemen's locker, the fan stops), open from the platform.
- **Toilets** in the passenger deckhouse open: men's (a WC cubicle, two urinals, a basin) and women's (two cubicles, a
  basin), tiled.
- **What you can look at** (`ferry-inspect.js`): 17 prompts with her real figures (the main engine, the gearbox, a
  generator, the main switchboard, the log, the pumps, the starting air, the service tank, the purifier, the emergency
  generator, the CO₂, the wheel, the radar and console, the chart table, the purser's window, the mess, the galley).
  A ship's prompt is offered only on the deck you stand on (`game.js`: no engine-room prompt through the car deck).

**Two things the walk found.** The sea's surface ran through the engine room at waist height (it is below her
waterline): the ocean is no longer drawn inside her parallel body (`ocean.js` `setOceanHole`, set by `ferry.js` each
frame from her pose). And the third-person lens was held 35 cm over the town's ground, which is 1.9 m above her
engine-room floor: aboard it follows her decks.

**Checked.** `ferry-walk.test.mjs`: down into the engine room by the door, the ladder and round the engines to the
control booth and back up, no jump over 0.16 m, no walking through an engine; the crew house from the platform: the
corridor, a cabin, the mess, the wheelhouse; the EG room; every floor on the surface the model draws (where nothing
stands on it). `ferry-ship.test.mjs` (the general arrangement, now with the shaft space; 33 meshes, about 39,000
triangles: the cap is raised to 60,000 for her interiors). In the running game: photographed in the engine room
(ladder foot, the aisle both ways, the port strip, the booth), the corridor, a cabin, the mess, the galley, the master's
cabin, the EG room and the men's toilet; the engine's prompt offered below and not from the car deck above; the wheel's
card read.

**Open.** The steering-gear room and the bow-thruster room (hatches, not yet walked); the shaft space; the compass
deck; the crew aboard at their posts; machinery that runs (the engines' sound and the switchboard as a live state).

### Batch 6d: realism, and a lens for her rooms (2026-10-12)

The creator, 2026-10-12: *"Make the ferry more realistic and improve the camera angle so it's easy to explore."*

**The lens in her rooms (`game.js`).** Aboard, with a deckhead over him within 2.0–2.45 m (`shipRoom`: the walk's own
camera solids), the third-person lens pivots at his chest (1.3 m, not 1.6), stands 2 m back at most (not 3.2), and
rises sooner and higher (from 2.1 m in, up to 0.5 m) to look down over him; the deckhead stops it. Nearer than
0.85 m (a wall at his back, a passage, the engine room's ladder foot) it becomes a **head camera**: he is hidden and
the view keeps his own pitch, instead of a screen full of the back of his head (the engine room, the mess and the
wheelhouse were that). Found and fixed on the way: in the engine room (1.9 m clear) a 1.82 m man's eye pivot stood in
the deckhead's margin, so the boom was 0 m and the view was his skull; the crew house and wheelhouse had no deckhead for
the lens (it rose out through the compass deck) and were never "a room". The audit page has `probe(x, y, z)` for the
lens's tests at a point.

**Realism (`ferry-model.js`, `ferry-interior.js`, `ferry.js`).**
- **Mooring lines.** Alongside at Minato she is tied up: four vinylon lines (`FERRY_MOORING`), the head line and the
  forward spring from the forward station on the port bow house out through a fairlead, the after spring and the stern
  line from the aft station through a fairlead at the bulwark, each to its own bitt on the pier (`MINATO_BERTH.bitts`:
  z −53, −62, −77, −87). Laid every frame from her pose, so they stay on her bitts as she heaves; gone the moment she
  casts off; none yet at Kitano-jima (no bitts there until 4c).
- **Window frames.** Every pane (51) in an anodised frame 5 cm wide, 1 cm proud of the plating: a window is a fitting,
  not a hole in a flat wall.
- **Her name boards** (みなと丸 · MINATO MARU, white with a teal border) on the wheelhouse front and both sides of the
  bridge house; **the ship's flag** (日の丸) on the stern staff.
- **Bulwark stiffeners**, a flat bar every 1.25 m inside the car deck's bulwark, as a plated bulwark has.
- **Grab rails** at 1.0 m along the deckhouse's and the lobby's outer sides, and down both sides of the crew's corridor.
- **Fire-hose boxes** (red, with their window) on the casings' faces by the car deck's hydrants.
- **Engine room:** hand rails on stanchions round each main engine, 0.4 m off the block, yellow (you hold them in a
  seaway and never step over them), and **cable trays** along the deckhead either side from the switchboard forward.

**Checked.** `ferry.test.mjs`: moored alongside at Minato with one line to each of the pier's bitts, each run leaving
her side and sloping down to the pier, none at sea and none at Kitano-jima; the ship's own tests (33 meshes, about
43,000 triangles; the stern flag inside her length). `ferry-walk`: the engines' rails stand where the walk already kept
clear. In the running game: the lobby, carpet room, saloon, corridor, mess, engine room (two views), wheelhouse and
car deck photographed with the new lens; from outside, the frames, the name board, the flag and the lines.

### Batch 6e: a new world when you step aboard (2026-10-12)

The creator, 2026-10-12: *"Audit the ship again, I want the ferry to be at least as detailed as the Sakura konbini but
bigger and when we are on the ship offload the city we should still be able to see it live as from the door of the
izakaya and Sakura but when we are on the ship we are basically on a new world even when it's moored or when it's
sailing during development Johansson can sail for free to the tropical island so implement it pls, add to the title
screen work in progress to signify the game is not 'ready'"*, and then: *"I think the entrance to the engine room
should be easier to find, I want to be able to explore the engine room now, and the bridge, make the interior more
realistic."* The audit against the konbini is section 7 below.

**Aboard is a place (`game.js`).** With a deck under him the HUD says **MINATO MARU** and where on her he is (the car
deck, the saloon, the engine room, the wheelhouse …), the way it says SAKURA at the konbini's door; the town stays live
outside her windows and doors (the town already streams by distance, so nothing is unloaded: she is the place, the town
the view from her, as the izakaya's door frames the street).

**Sailing for free, on foot (`island/play.js`, `island/services.js`, `ferry-walk.js`).** `FERRY_FARE` is 0 while the
game is in development: the purser's window and the ferry menu offer *Sail now* (*Board the local ferry* when she is
not alongside), one press, no ticket. A crossing started aboard is **afoot**: Johansson is not put in a car and the
cinematic camera is not taken; he stays where he stands (the open deck, the saloon, the engine room) and the ship
carries him (`advanceTown` snapshots his position in her frame before the island tick and the world update, and puts
him back in it after, turning him with her yaw). The ship's floors are open whenever she is visible, under way as
alongside; only the ramp and the gangway are open while she waits. The crossing takes 60 s afoot (the cars' crossing is
unchanged). At the far side he is on her deck alongside Kitano-jima, free to walk off down the ramp. The HUD follows:
*at sea*, then *alongside Kitano-jima*. Crossing back is the same from her deck there.

**The way down is found (`ferry-interior.js`, `ferry-model.js`, `ferry-inspect.js`).** The engine room's door on the
casing's car-deck face carries a lit **機関室 ENGINE ROOM** sign with a light hood over it, yellow-and-black hazard
stripes on the deck through the doorway, ear defenders on a hook inside and the green escape sign; a prompt at the door
(*Engine room: through the door and down the ladder*) says what is behind it, and one at the crew's door on the bridge
deck's aft platform (*Crew only*) says how the corridor leads to the wheelhouse and that the wings' ladders do too.
**CREW ONLY** and **WHEELHOUSE** decals mark the crew's door and both wing doors.

**Realism below and above.** Engine room: the mains have their gauge boards, maker's plates, red exhaust manifolds,
air filters, flywheel housings, oil fillers and injection-pump covers; the general alarm bell, the first-aid box and the
engine room's own sign. Wheelhouse: the magnetic-compass periscope down from the compass deck to the steering stand,
the radar's hood, the telegraph's lever box, the VHF handset on its cradle, the PA microphone, the echo sounder, the
navigation-lights panel with its lamps, the window sills with the binoculars and the log, the wipers, the clock and
barometer, the fire-detection panel and the muster list, the deckhead lights, the chart-table lamp, drawers and
instruments. Open deck: the benches are two a side with a 1.1 m aisle down the middle (they met in the middle before,
so the open deck could not be walked fore and aft).

**Title screen.** A **WORK IN PROGRESS** stamp under the title (`index.html`, `landing.css`), so no one takes the game
for finished.

**Found and fixed on the way.** The first carry took his place in her frame before his own walk and put it back
after, so aboard he could not walk at all (every step undone the same frame). It is now taken and put back twice,
round the two moves of hers only (the crossing in `islandPlay.tick`, the swell in `world.update`), never round his.

**Checked.** Tests: `airport-ferry`, `island-growth` and `ferry-walk` follow the free fare and the open floors (a
crossing under way keeps his place in her frame; 43 ferry tests). In the running game (`tools` harness): the title
stamp; *Sail now* from her deck, his position in her frame constant for the whole 66 s crossing while the HUD went
*at sea* → *alongside Kitano-jima*; the engine room's door and sign from the walkway and head on; the engines' detail
and the view aft from the forward end; the wheelhouse console and its aft bulkhead; the crew's door and its sign; the
open deck's aisle, walked.

## 7. Audit: the Minato Maru against the Sakura konbini (2026-10-12)

The creator's bar: *"at least as detailed as the Sakura konbini but bigger."* Measured honestly, by what each has:

| | Sakura konbini | Minato Maru (after 6e) |
|---|---|---|
| Fabric | one room, a backroom, a restroom; shelves, counter, windows, signage, surfaces with patina | 872 boxes, 215 rails, 51 windows, 44 floors over three decks: car deck, lobby, carpet room, saloon, open deck, corridor, cabins, mess, galley, engine room, wheelhouse, wings; the hull with its underwater body |
| Things to look at | every product with who it is for and why it is there (`commerce/merchandising.js`), the magazine rack, the specials board, flyers | 19 inspect prompts with her real numbers (engines, board, pumps, tanks, CO₂, radar, chart) |
| People | staff on shift with routines, customers who browse, queue, pay and leave; dialogue (`sakura-script.js`) | the crew exist as data (`people/ferry-crew.js`) but **nobody is aboard**: no master on the bridge, no chief below, no purser at the window |
| Life | opening hours, lights, the door's chime, cheer, the restroom used | she sails, moors and loads cars; **no engine sound, no whistle, no wake, no running engines to see** |
| Trade | buy anything on the shelves; the flyer | the kiosk and the purser's window sell nothing; the fare is free |
| Stories | the storyteller shoots in her rooms (backdrops) | **no backdrops captured** aboard yet |

So the ship is bigger and, as fabric, at least as detailed; what the konbini has and she lacks is **life**. In this
order, each its own batch (never with ground or lighting):

1. **Crew at their posts (people batch):** the master in the wheelhouse, the chief in the booth, the purser at her
   window, the bosun at the ramp, each with a look, a routine through the phases (waiting, loading, at sea) and a few
   lines; guide entries and portraits so the storyteller can cast them.
2. **Running engines:** the mains' sound and a turbocharger whine below when she is under way, the exhaust from the
   funnel, the whistle on casting off, the wake; gauges that read differently stopped and running.
3. **The kiosk and the purser sell:** canned coffee, the ferry's own senbei, the ticket as a keepsake, tied to the
   town's trade (Sakura supplies the kiosk).
4. **Backdrops aboard** for the storyteller (`tools/render-feed-backdrops.mjs`): the saloon, the open deck, the
   wheelhouse, the engine room.
5. **Still open from before:** the steering-gear and bow-thruster rooms, the compass deck walked, mooring bitts at
   Kitano-jima, tap-to-walk aboard, the linkspan at Minato.

### Batch 6f: the ways aboard widened, collision that holds, a smaller car deck (2026-10-12)

The creator, 2026-10-12: *"Collision onboard needs to be improved I don't want to clip through any ramp or door, the
entrance through the gangway, and stairways needs to be widened, car deck doesn't have to be so big, eat in to the
loading deck, and make it one or two lanes for the cars and trucks."*

**What is wrong today.** Johansson is 0.28 m in radius for the walk but about 0.6 m across to look at, so in a 0.9 m
door, on the 0.9 m gangway between its rails and on the 0.85 m stairs his shoulders pass through the jambs and the
rails. The raised ramp and the shut gangway gate are no solids: the floors end there, which stops his centre, not his
body, and at the bow he can stand half through the ramp. The car deck has two lanes of 3.1 m and ten places for a
town whose longest vehicle is 3.9 m; the walkway along the port lane narrows it and keeps the passage, the walkway
and the stair as three separate 0.9 m ways.

**The design (a small Japanese ferry of 1991 would be built so).**
- **The casings 1.3 m wide** (inner face at x ±2.75, not ±3.1): the car deck between them is 5.5 m, **two lanes of
  2.75 m** (a car is 1.62 m wide, an 8-tonne truck 2.5 m; two trucks side by side still fit, 0.25 m to the casings).
- **One way aboard, 1.4 m wide the whole way:** the gangway 1.4 m between its rails, the gate and the passage through
  casing P 1.4 m (shipyard z 13.3–14.7), and from the passage the casing is **hollow aft to the stair's foot** (a foyer,
  z 11.3–14.7): a foot passenger never steps onto the car deck. Stair P and stair S **1.2 m clear**, their doors onto
  the car deck 1.2 m (z 11.35–12.55). The engine room's door 1.1 m (z 6.3–7.4). The railed walkway along the port
  lane goes (its job is done inside the casing), so the port lane is full width.
- **Solids that follow her moving parts:** the raised ramp is a wall across the bow while it is up (and while it moves);
  the gate and the gangway door are a wall in her side while the gangway is in; the gate leaf and the gangway door
  hooked back are solids against the passage's walls while it is out (the passage keeps 1.2 m between them).
- **The car deck shortened** (6f-b): six places, three a lane, from z 11.3 to the bow houses; aft of the forward
  bulkhead at z 11.3 the car deck's level becomes the **lower lobby** (z 2.5–11.3, between the casings, 2.5 m deckhead),
  into which the passage, both stairs' feet, the engine room's door (easier to find: it faces the lobby under its sign)
  and the aft mooring station's door all open: the drivers' waiting corner with benches, the bicycle and baggage bay,
  a vending machine, the safety plan, and its two 1.2 m doors in the forward bulkhead onto the lanes.

**Impact list (what each touches, checked one by one).**
- `ferry-ship.js`: FERRY_SHIP.vehicles 10 → 6; the GA spaces car-deck, casing-p/s, walkway → foyer, a lower-lobby
  space; FERRY_CAR_PLACES (x ±1.375, three a lane from z 16.6); FERRY_TRUCK_PLAN (two trucks, two cars).
- `ferry-model.js`: GATE (−3.95 … −2.55), FERRY_CASINGS.inner 2.75, FERRY_DECKS.car (lanes ±1.375 of 2.75, walkway
  1.35, slots), the lane lines and sockets, the walkway's hatching and rail gone, the passage's inboard door gone, the
  gangway 1.4 m, FERRY_WALK's car-deck entries, the ENGINE ROOM decal at z 6.85.
- `ferry-interior.js`: CAS_IN 2.75, FERRY_STAIRS (x, door, wellFore), FERRY_ENGINE_ROOM.door/entrance, the gate
  passage, the foyer's deckhead, the lower lobby's bulkheads, doors, deckhead and fittings; `underStair`.
- `ferry-walk.js`: pseudo-parts `bow` (ramp up), `gate` (gangway in) and `shore` (gangway out) in `partOpen`; their
  solids; the gangway floor 1.4 m; the walkway rail and inboard door leaf gone.
- `ferry-inspect.js`: er-door at z 6.85. `town-traffic.js`: FIRST_PLACE follows the slots (the aft starboard place is
  now at z 16.6); the drive from the bow to it is shorter.
- Tests: `ferry-walk` (the route from the pier now pier → gangway → passage → foyer → stair; the engine-room route's
  start), `ferry-ship` (six places, two trucks and two cars, lanes against the casings, the foyer in the solids list),
  `ferry` (hull unchanged). Residents' routines: none walk the car deck. Films: `remotion/tools/impact.py` on the
  ferry's car deck shots (none photographed inside her yet).
- Looked at in the game after each half: the gangway, the passage and foyer, both stairs, the ramp up and down from the
  car deck and from the quay, the gate at sea and at Kitano-jima; the lanes with a car aboard.

**Built (two commits, 6f-a the widths and the walls, 6f-b the car deck and the lower lobby).** As designed above, with
three changes found in the building: the gangway door hinges on its forward jamb and hooks back along the passage's
forward wall (its aft side is now the foyer, so a leaf there would have closed the way); the gate leaf swings out and
lies against the bulwark's outside, forward of the gate (1.34 m of leaf does not fit inside a 1.3 m passage); and the
loading plan carries **one** 8-tonne truck on the centreline, not two side by side (in 2.75 m lanes they would stand
0.25 m apart). The lower lobby's crew door is on the centreline, the bicycle rack (two bicycles) to port of it and the
baggage shelf with the lifejacket lockers to starboard, so neither stands in the doorway. The forward bulkhead's fire
doors are 1.1 m sliding doors at x ±1.0, their leaves parked outboard on the lobby side (a hinged 1.2 m leaf has no
wall to hook back on between the door and the casing).

**Checked.** Tests: `ferry-ship` (six places, a truck and two cars, every place clear of the casings, the foyer and the
lower lobby, the lanes against the casings; every FERRY_WALK rectangle, the lower lobby and the foyer among them, has a
drawn floor under it), `ferry-walk` (pier → gangway → passage → foyer → stair door → lane; the engine-room route from
the lobby; stair P to the wheelhouse; the ramp down and back; under way), `ferry`, `airport-ferry`, `owned-vehicles`
(the traffic's car place). In the game, before the cherry-pick (a worktree of the branch served to the harness): walked
out along the gangway onto the pier and back in, aft through the foyer and up stair P, through the stair door onto the
lane, down the ramp onto the quay, through the starboard fire door from the lobby onto the lane, and aft through the
crew door to the mooring station; photographed the gangway from the pier, the passage and the foyer, the stair, the
lanes from the bow and from the lobby's bulkhead, the engine room's door, the lower lobby both ways and its bicycles.
Still open: the raised ramp's wall and the shut gate are proven by the walk's tests only (no photograph under way yet).

