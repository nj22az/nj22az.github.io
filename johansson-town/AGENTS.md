# Johansson World instructions

Read the repository's [AGENTS.md](../AGENTS.md) and [CLAUDE.md](../CLAUDE.md). Their working discipline applies here.

## Owner's current decisions — 18 October 2026

- Keep Minato a compact urban port town. Do not restore rural districts or expand its shoreline for housing.
- Every ordinary Minato villager needs an actual occupied home, with a reachable entrance, usable interior, sleeping place and credible work/home routine. A registry label alone is insufficient.
- Do not retain surplus empty houses or speculative residential units. Assign existing suitable homes first, then remove genuinely redundant residential buildings and their obsolete geometry/navigation references.
- Preserve working shops, port access, ferry operations, Harbour Park and Umi-no-yu. Do not remove an active workplace merely because an upper floor is vacant.
- Johansson is the ship's chief engineer. His main home is with Thuan on the separate tropical island; he also has a cabin aboard the ship. Older mayor descriptions are stale canon.
- ~~Thuan shares that tropical primary home and keeps a room in Thao and Chin's Minato house.~~ Superseded on 19 October 2026 (the consolidation's ruling 4, below): her weekday room is dropped; she lives with Nils on Kitano-jima. Do not create a separate empty house for her.
- Sakura's upper floor is to become the main office with a kitchenette and views over the port and town, not a home. The tiny existing ground-floor office remains complementary. ~~Grandmother Sakurai therefore needs a suitable home elsewhere on Minato.~~ Superseded on 19 October 2026: Grandmother Sakurai retires and Thuan owns Sakura outright (the consolidation, below).
- Keep the tropical island's terrain and facilities intact. Housing work on Minato must not rebuild that separate island.
- ~~Retain iPhone Safari resource safeguards.~~ Superseded on 19 October 2026, below.

## Owner's decisions — 19 October 2026

- Graphics: every device draws the standard of before 18 October 2026 (the owner: "pre October 18 standard graphics is what we are looking for"; "I don't need iPhone safeguards I need the code to be optimised so it still looks good"). Desktop, tablet and phone differ only in drawing resolution and shadow detail (`src/render/startup-recovery.js` `graphicsProfile`). Do not reintroduce device classes that drop shadows, multisampling, HDR, detail streaming or varied openings; keep memory down by optimising what is drawn and kept instead (for example `src/render/canvas-release.js`, the ferry's engine-room plates drawn only aboard).
- Reduced graphics is a recovery mode only after two interrupted launches in a row, and the game says so and offers the full look back.
- Where empty houses were removed, the street plan closes up around them: no vacant lawn or paving lots left where buildings stood.
- New Yokosuka (<https://github.com/brynnb/new-yokosuka>) is a permanent inspiration for the World: "here you can see home interiors and convenience stores and everything we need"; its 1986 setting does not matter, "small town Japan still has much old parts in the 90s and even today". Plan homes, shops, streets and the harbour from its real rooms, measured and recorded as data; never copy its assets ([docs/research/new-yokosuka.md](docs/research/new-yokosuka.md)).
- Sakura's upstairs is replanned (the owner: "The Sakura office is way too big and empty. I want maybe two windows you can look out from; now the whole island looks broken from the Sakura office. It should have like a bedroom or rest room upstairs too. Can you use anything from New Yokosuka?"). Read with the ruling above that the upper floor is the main office, not a home: the office shrinks to a small shop's office with its kitchenette and exactly two outlooks (Main Street from the front, the ferry berth from the desk's side window), and the rest room is a staff 休憩室/仮眠室, a 4½-mat tatami room with a futon in its cupboard for a rest between the shop and the late boat, or a night if the ferry ever cannot run; nobody lives there, and no canonical day sleeps there while the town does not stop for weather (`world/typhoons.js`). The plan, sizes and the New Yokosuka numbers it uses are data in `src/world/interiors/sakura-office-room.js` (`SAKURA_UPSTAIRS`); the island seen through the windows is drawn by every portal in view at once (`render/shop-street-view.js`).
- Sakura's stair and the office's doors, 20 October 2026 (the owner, on his iPhone: "I don't want the stairs to be traversable it's too much errors when running up the stairs, I want the stairs to lead up to a black hole and we disappear into there and when it loads we come up on the upper floor. And more the entry to the upper office is only from inside not from outside now I have a button to enter the office when I'm outside Sakura, that's wrong. I guess it should be possible to evacuate through the fire ladder but that door only open from the inside"). The inside stair is a passage into darkness, never walked: from the stockroom its first treads rise into black, stepping onto them (or "Go upstairs") walks him into the dark while the picture fades, and the office storey opens as a room of its own at the stair head; coming down is the same and he arrives at the stair's foot in the stockroom (`src/world/interiors/sakura-stairs.js` `SAKURA_STAIR_PASSAGE`, game.js `takeSakuraStair`). Two rooms, the shop and the office; no flight, landing, landing lens or storey switching. The office is entered only from inside, up that stair: its site is `insideOnly` (`thuan-flat.js`) and has no door, button, pin, directory card or route outside. The fire door opens from inside only: "Evacuate by the fire escape" takes him out onto the landing and down the caged ladder to the yard; from the yard the fire escape is to look at, nothing more (`okinawa/old-town.js` `SAKURA_BACK`). Rooms are scanned for flashing faces at a phone's size (`tests/no-z-fighting.test.mjs`).

~~The implementation plan is [docs/MINATO-HOMES-PLAN.md](docs/MINATO-HOMES-PLAN.md).~~ Superseded on 19 October 2026 by the cast, household and crew consolidation below; the homes plan remains as dependency evidence only. Preserve save compatibility when implementing it.

## Owner's rulings — 19 October 2026: the cast, household and crew consolidation

The plan of record is [docs/CAST-CONSOLIDATION.md](docs/CAST-CONSOLIDATION.md), the owner's brief with its addendum; where the two differ, the addendum wins, and both win over every older character, ownership and housing description here and in `docs/`. Its data is `src/people/roster.js` (mirrored in `docs/cast-roster.json`): 21 core and 5 supporting identities with stable ids, short display names and historical aliases, the ten retired identities and where their purpose goes, the 14 core households, the eight ship posts and the shore roles. It is run as five PRs (the brief, "How it is run"); phase 1 (roster data, aliases and the save migration, `src/save.js migrateCast`) changes nothing visible, and each later phase switches one part of the game over to the roster.

In brief: Thuan owns and runs Sakura outright; Chin is the motorman aboard and Tetsu's repairman ashore, never Sakura staff; Fujita becomes the ferry master, shown as Fuji, sober on watch, the shed and the beer only after he signs off; Nils is chief engineer, not mayor, at home with Thuan on Kitano-jima with a duty cabin aboard; Jack Reed (harbour agent) and Mac Turner (relief engineer) replace the Harbour master and Mr Nakandakari as American long-term residents; ten identities retire (the Bus driver, Mr Higa Jr, Grandmother Sakurai, Grandmother Chinen, Postman Tōma, Mr Shimabukuro, Mr Ōshiro, Mrs Kinjō, Barfly, Reiko) and six more Minato houses go.

The owner's rulings of later that day (the brief's addendum), which win:

1. **Police station.** Mori does not stay in the kōban. A real police station (交番/警察署 on the signs, English in speech) is built on the empty lot next to it, enterable like the shops (front desk, waiting bench, lost-and-found, notice board, holding room, bicycle rack, patrol-car bay); Mori's accommodation moves inside it. The household count stays 14 and the home id `koban` is retained as his logical identity. The station is a separate job after the consolidation, which must not build on that lot.
2. **Kitahama lots.** The street-dressing pass skips the Kitahama lots; the compaction decides the plan, and the dressing (gardens, 月極 parking, bike sheds, hedges) follows on the final layout.
3. **Trade rules.** Retiring Mrs Kinjō moves flowers to Sakura: change the "Rainflower Florist supplies decorations" line in the repo CLAUDE.md and `src/commerce/merchandising.js` with it, and remove the florist pavilion. Remove the former post-office shop-house once Mika's counter has the parcels (if inspection finds a shared or non-residential dependency, name it and make the smallest complete service-preserving change).
4. **Thuan's weekday room at 1 Kitahama is dropped.** She and Nils live on Kitano-jima and the ferry runs 06:25–22:15. kitahama-1 is purely Thao, Chin and Vy.
5. **kitano-3** (the dead Chinen house) is removed in this job, not reported as a candidate.
6. **Kitahama Heights** becomes two attached ground-floor houses with their own doors and gardens (no corridor, no stair), keeping the `kitahama-flat-3` / `kitahama-flat-4` ids for migration.

Reconciled with the source on 19 October 2026 (`src/people/roster.js` records each): Yui, Aya and Nao, three of the brief's display names, are the sisters' names in the oldest saves (`src/people/renamed.js`), so those renames apply only to saves from before the roster (castRevision 1) and the names now belong to the teacher, the purser and the bosun; the manning plan's post key stays `oiler` with the title Motorman and a `motorman` alias; Jack takes both the Harbour master's shore keys and Mr Fujita's Minato linesman duty.

Phase 2 (the ship posts and shore roles) is in: `src/people/ferry-crew.js` reads every post and shore role from the roster; the five supporting crew are people of `cast.js` (`supporting`) with recipes of their own, the cabins aboard and Kai's rented Shiroma house registered as quarters, never households (`island-households.js` CORE_HOUSEHOLDS / SUPPORTING_QUARTERS); the crew's day is the ship's, 06:05–22:20 (`FERRY_WORKING_DAY`); Mr Fujita is the master, the shed's own body walked to and from the gangway (`master-commute.js`), the shed and the beer only after he signs off (`fujita-day.js`); the harbour agent's street body takes the Minato lines (`ferry-shore-crew.js`, `shore-duty.js`); Chin is the motorman with no Sakura shift; Mac is renamed in the live cast with his biography. The short display names Fuji, Jack, Nao and Koji (and the rest) are phase 5's sweep: `castMember` resolves both names meanwhile. The crew cabin is drawn with one two-tier bunk (the bosun's week-on berth and the relief engineer's), so the purser's and the cook's berths are the docks-and-boats job's.

Phase 3 (the households) is in: Nhung lives at 3 Kitahama with Kōji and Riku (`kitahama-layout.js` KITAHAMA_RESIDENT_HOMES, her room `households.js`, the family house `interiors/family-home.js` with three futons); Thuan's weekday room is gone and she lives on Kitano-jima only, over on the 08:30 boat and home on the 22:00 one (`kitano-residents.js`, `commuter-schedule.js`), Nhung keeping Sakura at the weekend; Kitahama Heights is two attached ground-floor houses, A (Mac, id `kitahama-flat-3`) and B (Ms Ganaha, id `kitahama-flat-4`), each with its own gate, door and garden on Fukugi Lane and no stair (`kitahama-layout.js` KITAHAMA_HEIGHTS, `okinawa/kitahama-quarter.js`), the logical units `kitahama-flat-1`/`-2` retired in the registry with Mr Higa Jr and Grandmother Sakurai resolving to the roster's fallback (`home-directory.js`) until phase 4 takes their bodies; Thuan owns and runs Sakura outright and the shop keeps honest hours, 9:00–20:30 every day with nobody at night (`commerce/sakura-rota.js`, superseding the 24-hour opening of 12 October that the retired night keeper made possible); Sakura supplies the town's flowers and decorations and sells the bouquets at its door (`merchandising.js`, `okinawa/old-town.js`), the Rainflower pavilion selling nothing until phase 4 removes it; the post and parcel counter is Ms Ganaha's window at the Port Terminal (`ganaha.js`, `interiors/port-hall.js`), the old post office counter shut until phase 4 removes the shop-house, Tōma's round running from the terminal meanwhile.

Phase 4 (the retirements and removals) is in: the ten retired identities (roster.js RETIRED: the Bus driver, Mr Higa Jr,
Grandmother Sakurai, Grandmother Chinen, Postman Tōma, Mr Shimabukuro, Mr Ōshiro, Mrs Kinjō, Barfly and Reiko) are out of
`people/cast.js`, so they have no body in the street, the shops, the izakaya or aboard, no household, shift, nameplate,
home pin, place or relationship pair, and the save migration (`save.js`, castRevision 2) drops their records and lands a
save made inside a removed building at the retained place (`roster.js RETIRED_HOMES`, `households.js HOME_ALIASES`).
What they did went where the roster says: Kōji fishes his own sabani and Chin mends the boats, Tetsuo keeps the power
house's switchboard, Nhung prints the town's small paper at the bookshop's back bench, the izakaya's regulars are the
residents (nobody lives in the bar; Thao cleans after last orders), the post round is the terminal's mailbag, the
harbour master's favour is Mrs Sato's delivery box (both ends must walk the town), and the stories' catalogue leaves the
retired out (`feed/storyteller.js living`). Removed, with their foundations, walls, gates, nameplates, drops, lights,
prompts, interiors and directory and map entries: 4, 5 and 6 Kitahama, the Kinjō and Ōshiro houses on the seawall walk,
1 Front-Row Yard, the post-office shop-house on the East Row, the Rainflower pavilion (the bouquets are at Sakura's door,
`okinawa/old-town.js SAKURA_FLOWER_STAND`; a saved photo or destination at the old id lands there) and the Chinen house on
Kitano-jima (the island's ground and plantings take the plot back). The registry keeps each as a record of a removal
(`island-households.js`, `retired`), distinct from the housing project's nine of 18 October. The streets closed up where
they could without touching the Kitahama lots (ruling 2) or the police lot (ruling 1): the two Kitahama side lanes north
of the cross lane that served only 4 and 5 end at the cross lane (`kitahama-layout.js`), the East Row's apron is paved
per standing shop so the park's lawn meets Main Street where the shop-house stood, the Nishi lanes stay (the Higa house's
side, the way to 2 Front-Row Yard, the utaki's approach), and every cleared lot is recorded with its ground and the reason
it is clear in `okinawa/lots.js CLEARED_LOTS` for the deferred dressing pass. Two walkers who meet face to face now step
round one at a time (`schedules.js`): the changed timing had Thuan and Tetsuo mirroring each other's detour on the kerb.

Phase 5 (the stories, directories, maps and docs; the last) is in, and the consolidation is complete: the report is
[docs/CAST-CONSOLIDATION-REPORT.md](docs/CAST-CONSOLIDATION-REPORT.md) (the 26, the old-name map, the 14 households and
the quarters, the removals, the watches and the hours, the save notes, the test results and what is unresolved). The
resident guide (`guide/residents.json`, from `guide/articles.mjs`) is exactly the 26 live residents, each with a feature,
a photo shoot and a portrait rendered from the live avatars (the eleven who had none: Dr Kakazu, Mai, Mac, Ms Uezu,
Ms Ganaha, Mr Fujita, Ryo, Ren, Aya, Jun, Kai), the retired eight's features kept as history (`RETIRED_ARTICLES`); the
storyteller's catalogue is that guide, so every story role fits the roster's posts (Fuji on the bridge, Chin in the
engine room, Nhung at the paper's bench, Ms Ganaha's window, Mac the relief, Thuan owning Sakura), and every one of the
26 is a regular somewhere (`feed/places.js`). The police station (`koban`) and the terminal counter are storyteller
places, wired with `captured:false` until their backdrops are photographed (`node tools/render-feed-backdrops.mjs
police-station port-hall`; the first frame does not finish under swiftshader in a cloud session), and the storyteller
sets no story in a place without its pictures. The ten retired keep their drawings, walks and costumes for Studio and
history only (`avatars/cast.js RETIRED_RECIPES`, `gait.js RETIRED_GAITS`, `dungeon/costumes.js RETIRED_COSTUMES`,
`tests/retired-recipes.test.mjs`); Studio's lists name the 26 by the names World uses, the crew as a group (Mac,
Ms Ganaha). The brief's short display names (Fuji, Jack, Nao, Koji, Mika, Yui, Tetsu, Aki, Dr Ken, Emi, Nils) are the
roster's and resolve everywhere through `castMember`; the names the world, its saves, drawings and prompts use stay
`cast.js`'s (Mr Fujita, Harbour master, Ms Uezu, Kōji, Ms Ganaha, Miss Higa, Tetsuo, Mrs Sato, Dr Kakazu, Mrs Nakamura,
Johansson), a rename being a sweep of its own (the portraits, the wardrobe keys and some three hundred tests key on
them). Sakura's products are for the living (`data/studio/products.json`), the wardrobe's and outfits' "who wears it"
lines too, and the docs that describe the cast of before the consolidation carry a history banner.

## Owner's decision — 19 October 2026: the web is a gorgeous demo for the Linux game

The owner: "It looks really pretty but slow to load and stalling while I play. Can some parts be offloaded on web while
still looking pretty as now? I'm thinking expensive NPC behaviour maybe belongs in the Linux version; the web should be a
gorgeous demo for the Linux game." The rule lives in one place, `src/edition.js`: the Linux edition (`steam-deck/`, the
Electron shell, `window.johanssonDesktop` set) runs everything; the web edition draws exactly what Linux draws (the
graphics ruling above stands: shadows, multisampling, HDR, detail streaming, the Ink grade on every device) and simulates
less, by the named budgets there. Nothing else asks which edition it is. Later rulings the same day, all part of it:

- **Residents** (the owner: "I think you can program some simple behaviour for the NPCs on web while still, and not too
  much dialogue"). On the web a resident near the player (within `residentRadius`) or in view walks and behaves as on
  Linux; out of sight and out of reach they keep their timetable without walking it (`people/attention.js`,
  `schedules.js` settle, `neighbours.js`): no route searched, no step taken, so nobody is ever seen to jump. No chats
  between residents, no happenings chains, no multi-line conversations. Stand points (`full-life.js setStandFilter`) are
  kept for residents in view, near or in the player's room; a seen resident whose detour finds no way round waits half a
  town minute before searching again (`detourRetryMinutes`): talking to a resident is one short line for the
  moment (`greetings.js shortGreeting`, at most 35 characters) and whatever they sell or serve. The full conversations,
  favours, chats and happenings are Linux's.
- **Trade and machinery** (the owner: "the convoluted business backend doesn't need to work on the web either … even if
  we model the houses and engine room and workshop realistically, they will be like a display piece on the web"). Rooms
  and machines are built and drawn as on Linux; on the web their operation prompts read what the thing is instead of
  working it (the ferry's plant stations, the town's machines, the workshop printer), and no orders, deliveries,
  closing restocks or stock counts run.
- **Unlimited money on the web**: the wallet never runs out (`WEB_PURSE`, shown as "plenty of yen"); prices stay on the
  labels and are paid at the till.
- **The shop's magical supply** (the owner: "it can be back next day: if you buy all the coffee in one day, they will
  have more tomorrow"): what the player takes stays gone for the rest of that trading day, in the save, and every shelf
  is full again at the next opening, 9:00 (`shop-stock.js webShelves`). Other customers do not empty facings.
- **Realistic paperwork** (the owner: "I'd like the documents and spreadsheets to be realistic"): on the web Sakura's
  office folder is a deterministic snapshot made from the data, as a 1997 Okinawan shop wrote it: the Z report, the stock
  book, the rota, the depot's delivery note, Higa Liquor's and Front-Row's invoices, every total the sum of its lines
  (`commerce/paperwork.js`, `tests/paperwork.test.mjs`). On Linux the ledger is the live shop's.
- Outside a page (node's suites) the edition is Linux unless `JOHANSSON_EDITION=web`; `tests/edition.test.mjs` holds
  the web budgets and the Linux path.

## Owner's decision — 21 October 2026: one ground system

The owner, on his phone: "the roads seems to have reversed to chaos again… Can you make a plan to finally fix the roads
to a unified system? Pavement? Walk paths, grass and sandy beach?" (the plan approved: "Go ahead").

- Ground: every surface comes from `src/world/ground-standard.js`. No module draws its own ground slab, colour or
  height. The rulebook gives each class its top, colour, finish, the districts it belongs in and the edge it needs
  against every neighbour: a 15 cm kerb, an edge line and U-gutter, stone or coral edging, or a graded join.
- The ground-standard test (`tests/ground-standard.test.mjs`, measured by `tools/ground-audit.mjs`) is a ratchet. A new
  violation fails. So does one that grew, and so does one that was fixed but is still listed in
  `tests/fixtures/ground-baseline.json`. The list only shrinks.
- A district on the standard is laid by the generator (`src/world/ground-build.js`) from its plan (`ground-plan.js`,
  `ground-plan-harbour.js`): add or move ground by changing the plan, never with a slab of a module's own. Step 2 put Main
  Street and the harbour on it. Main Street's carriageway lies a kerb under the town's datum and is graded back at its
  ends; what stands on the road or at its ends takes its height from the plan (`streetDrop`, `groundTopAt`). Step 3 put
  Kitahama, Nishi-machi, the west yard and the town hall on it (`ground-plan-quarters.js`). In a lane district a house
  meets the lane by its own gate and the U-gutter (`lane-edges.js` draws the plan's gutter runs), never by a paved
  ring. In the west yard the buildings stand on concrete aprons edged against the lawn.
- The plan, the rulebook tables and today's counts are in [docs/GROUND-STANDARD.md](docs/GROUND-STANDARD.md). The work
  runs in steps, each merged after the owner sees photos: (2) Main Street and the harbour; (3) Kitahama, Nishi, the
  neighbourhood and the school; (4) the beach, the coast, the park and the lawns, until the baseline is empty.

## Verification

Use focused geometry, collision, navigation and schedule checks. For runtime changes run `npm run build:runtime` and `node --test tests/runtime-package.test.mjs`. Check real pedestrian and overhead views, including mobile, wherever a GPU browser is available; state when physical-device or visual checks are unavailable. Do not claim screenshots or tests that were not performed.
