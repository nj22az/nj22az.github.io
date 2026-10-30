# Progress: a kissaten in the shut Higa Liquor

## Task
See `sources/task.md`. The owner, 30 October 2026: the shut Higa Liquor becomes a kissaten, kept by **Grandmother Higa
in the mornings**. Nothing is built yet: this folder holds the map of every place that says the shop is shut, the plan,
and what Meshy could make for it. The owner reviews the plan before any build. Branch `claude/great-sagan-mvc9bb`
(on top of the fish-market rework, not on `main`).

## Completed (30 October 2026)
- Meshy checked: `MESHY_API_KEY` is set in the environment (its value never printed); Meshy CLI 0.4.0 through
  `npm exec`, production API (`api.meshy.ai`); one free `balance` call answered: **2,753 credits**. Nothing generated.
- The map (below), redone in full from `git grep` over the whole repository and the studio repo `jojo`.
- The cast's mornings swept (every resident, 06:30–10:00 every half hour, a Monday, a Saturday and a Sunday, from
  `canonicalDay`), so the kissaten's regulars come from their own days.
- The plan and the Meshy/code split (below).

## The map: every place that says Higa Liquor is shut

The liquor shop stays closed: the drink is Sakura's (the 22 October ruling stands). What changes is the building: it
is no longer shut, it is a kissaten in the mornings. So every line about the *drink* having moved to Sakura stays true;
every line about the *building* being shut, dark, unkept or "for good" has to change.

### A. Code and data that must change (the game)

| File | Lines | What it says now |
| --- | --- | --- |
| `src/commerce/higa-liquor.js` | 1–11, 15–23, 25–28, 39–49 | Header: "shut for good", "Grandmother Higa keeps only the bathhouse". `HIGA_NOTICE`: the 閉店のお知らせ on the shutter. `HIGA_KUSU`: "still behind the counter of the shut shop". `YUNTAKU`: "The shop has shut, the bench has not". |
| `src/world/okinawa/higa-liquor-dressing.js` | 9–19, 45–79, 82–88, 92–162 (lettering), 320–366 (`higaFrontage`) | Header and `HIGA_DRESSING`: doors "shut since the shop closed", shutter "down for good", the closing notice, the 酒 · 泡盛 · ビール valance, the sugidama, the empties, the counter "until the shop shut", the delivery book, the bottle shelves, the cold case, the jars, lights "off since the shop shut". `HIGA_LEFT_OUT`: "a to-let sign or a new tenant … nobody is looking for the shop". The lettering atlas (valance, hours card, beer and awamori posters, 冷えてます, tags, notice). `higaFrontage`: shutter fixed down, doors shut, tubes at 0. |
| `src/world/okinawa/houses.js` | 168, 232, 480 | The `liquor` interior kind; the upper floor a stock room. |
| `src/world/okinawa/quarters.js` | 103–111, 308–311, 335, 342–348, 388–393, 606 | The shut front and its clock hook; the shop sign (`jp:"Higa Liquor Store"`, `en:'Higa liquor · closed'`, upright "Awamori", inspect "Read the notice on the shutter"); `higaPrompts`; the bench's prompt ("a bottle each from Sakura"); the bicycle "against its own (shut) shopfront"; the drop. |
| `src/people/cast.js` | 72–75, 244 | Grandmother Higa's `purpose` ("her liquor shop on Main Street stands shut") and `day`; `PLACES['higa-liquor']` `closed:'Shut for good …'` and no keepers. |
| `src/people/canonical-day.js` | 62–67 | Johansson Mart before the shut shop's bench; no kissaten. |
| `src/people/stand-sequences.js` | 65–72 | Her garden round, "from six to half past eight": it runs through the kissaten's opening. |
| `src/people/neighbours.js` | 44–48 | On her verandah 07:00–18:30, and her lines. |
| `src/people/canonical-rest.js` | 6 | Her rest 21:00–06:30 (stays; the plan fits inside it). |
| `src/people/roster.js` | 72 | Role: "her liquor shop is shut". |
| `src/people/workplaces.js` | 11–12 | Her workplace is Johansson Mart only. |
| `src/people/home-directory.js` | 30 | `'higa-liquor':'higa-saketen'`. |
| `src/people/shop-days.js` | 7–8, 44–46 | The bench "outside the shut Higa Liquor". |
| `src/feed/places.js` | 85–94 | The storyteller's place: "the shut Higa Liquor and its bench", things "the shutter, down for good", "the closing notice", doings "reading the notice on the shutter". Its shot is at 18:30. |
| `src/world/okinawa/kitahama-shop.js` | 33 | Why she keeps Johansson Mart: "whose liquor shop on Main Street stands shut … wanted a counter again". |
| `src/world/okinawa/lots.js` | 21–23 | The crate yard's owner: "her shop across Main Street is shut". (The yard, its HIGA LIQUOR EMPTIES sign and Sakura Trading's lease stay.) |
| `src/commerce/merchandising.js` | 60, `ACCOUNTS` | "Higa Liquor stands shut"; no account for a kissaten (bread, milk, coffee beans, eggs). |
| `tools/apply-articles.mjs`, `guide/articles.mjs`, `guide/residents.json`, `resident-guide.js` (built) | 34–35; 125–127; 625–643 | Her guide article: "Her liquor shop on Main Street is shut, a notice on the shutter", "stands shut since the drink went to Sakura". |
| `src/office/town-papers.js` (built) | — | The build indexes shop notices into the town papers; it re-indexes from the source. |
| `docs/ENGLISH-LOCALISATION.json`, `scripts/english-inventory.mjs` | 919; 30–33 | 比嘉酒店 → "Higa Liquor Store"; the new 喫茶 lettering needs its English. |
| `runtime/`, `index.html`, `sw.js` | — | Rebuilt by `npm run build:runtime`, last. |

### B. Tests that state the shut shop

| Test | Lines | What it asserts |
| --- | --- | --- |
| `tests/higa-liquor-laundry.test.mjs` (in the CI guard) | 27–29, 41–47, 51–60, 218–229 | No hours exported (it lists the old names `higaLiquorOpen`, `higaShutterDown`, `HIGA_LIQUOR_HOURS` … as gone); the closing notice; nobody is ever at `higa-liquor`; `PLACES['higa-liquor']` closed with no keepers; "the shut front at every hour": shutter down, doors shut, lights off, notice on the shutter. |
| `tests/no-z-fighting.test.mjs` | 59–64 | `higa.update` undefined and the shutter visible. |
| `tests/east-lawn.test.mjs` | 196–205 | The shut shop's floor is out of reach behind its shutter (must become reachable in hours). |
| `tests/okinawa-quarters.test.mjs` | 117–124 | Grandmother Higa on her verandah at nine. |
| `tests/higa-shop-collision.test.mjs` | all | The `liquor-*` solids, the customer to the counter, the keeper round its open end: these survive, renamed if the solids are. |
| `tests/minato-walking-routes.test.mjs` | 54 | `'Higa Liquor'` as a walking destination at [4.8, 8.75]. |
| `tests/seat-layouts.test.mjs` | 65–73 | The bench's two places (stays). |
| `tests/yard-homes.test.mjs` | 62 | Plot ids `nakamura`, `higa-saketen` (stays if the plot keeps its id). |

### C. Rules and documents

- Root `CLAUDE.md` 147–150: "Higa Liquor has closed … the shop stands shut with a notice on its shutter, and Grandmother
  Higa keeps only the bathhouse".
- `johansson-town/AGENTS.md` 254–270, "Owner's decision — 22 October 2026": "Higa Liquor is shut for good … the shutter
  down at every hour, the doors shut, the lights off … no new geometry". A 30 October ruling is added after it,
  superseding the shut-front parts and keeping the drink parts.
- Stale since 22 October, fix while there: `avatar-creator/docs/STUDIO-MCP.md` 136 ("All alcohol comes from Higa
  Liquor"), `docs/MASTER-PLAN.md` 64 and 105 (Higa Liquor supplies the Coral Bay Bar and the co-op),
  `docs/INTERIOR-INVENTORY.md` 75.

### D. Stays as it is

- Every line that says the *drink* moved to Sakura: `activities.js` 1075, `commerce/konbini.js` 248 and 257,
  `merchandising.js` 52–53 and 130, `paperwork.js`, `trade-round.js`, `economy/goods.js`, `economy/town-economy.js`,
  `studio/rules.js` 526, `harbour-boats.js`, `quay-dressing.js`, `port-shed.js`, `storefront.js`, `izakaya-walnut.js`,
  `minato-compact-plan.js`, `johansson-house-interior.js`, `sakura-office-room.js`, `sakura-small-office.js`,
  `sakura-trade-posters.js`, `roster.js` 67, `docs/cast-roster.json`. The liquor shop stays closed.
- Neighbour and layout comments that only use the name as an address: `coin-laundry.js`, `coin-laundry-dressing.js`,
  `police-station.js`, `police-station-layout.js`, `architecture-plan.js`, `ground-plan-quarters.js`, `signs.js`,
  `layout.js`.
- History: every `briefs/HANDOFF-*`, `briefs/higa-liquor-closes/`, `docs/qa/**` logs, `steam-deck/releases/*`,
  `linux-port/acceptance-0.2.18.md`, `world/index.html`'s release notes, `docs/CAST-CONSOLIDATION*.md`,
  `MINATO-CONSOLIDATION.md`; studio repo `jojo` `research/mario-artist/report.md` 140 (a research note).

## The plan (for the owner's review; nothing built)

### Who, when, and why it works
- **Grandmother Higa** opens at **07:00** and shuts at **09:30**, washes up and walks up Kitano Road to Umi-no-yu for the
  bandai at ten. The shop stands at the foot of Kitano Road, under the bath, so the walk is a minute.
- **Days: Monday to Friday** (recommended). On Saturdays she opens Johansson Mart at 08:45 (`kitahama-shop.js`
  `SHOP_DUTY`), and Sunday is her one morning with nothing to open.
- **Her garden round** (now 06:00–08:30) moves: a short round before opening (06:30–06:50, the water jar and the altar
  flowers) and the rest at her lunch hour, which she already spends at home (the handama "for lunch" fits there).
- Her weekday then runs 07:00 kissaten, 10:00 bandai, 12:00 lunch and garden, 13:00 bandai, 17:00 Johansson Mart until
  21:00. That is a long day at 78; the owner may prefer fewer days.

### The regulars, from their own days (the morning sweep)
Almost everyone is at work by seven: the ferry crew, Kōji at the auction and the ice plant, Thuan crossing to Sakura,
Mrs Sato at the stock pot, Mrs Nakamura's beans, the clinic, the school. The ones whose mornings are free and near:
- **Officer Mori**: the police station is next door; he is at the station until nine, then asleep after the night
  patrol. A morning set at half past eight before bed.
- **Tetsuo**: breakfast at home 07:30–09:00, the radio bench from nine. He keeps her boiler; she pushes Yui at him.
  Some mornings he takes his breakfast at her counter instead.
- **Ms Ganaha**: at home until eight, then the coin laundry across Main Street, the mailbag at half past nine. A coffee
  before she opens up.
- **Ms Uezu**, on her weeks off watch (at home all morning).
- The player, at any hour it is open.
- A choice for the owner: **Miss Higa (Yui)** could take her breakfast at her grandmother's counter before school
  (07:30); it puts her and Tetsuo at the same counter.

### The menu
- **Morning set (モーニング), ¥300**: a blend coffee with a thick slice of toast (Sakura's milk bread, buttered) and a
  boiled egg, the coffee's price, as morning service is in a Japanese kissaten. Every hour it is open is morning.
- **Blend (ブレンド), ¥300**: brewed a cup at a time in a siphon (Sato Ramen's urn coffee with lunch is ¥200).
- **Iced coffee (アイスコーヒー), ¥300**: brewed strong, poured over ice from the ice plant, with gum syrup and milk.
- No alcohol: it stays Sakura's.

### Supplies (Sakura Trading)
A new account in `merchandising.js`: milk bread and milk (existing lines), plus two new lines, coffee beans (roasted in
Naha, on the ferry) and eggs, which Sakura also sells over its counter. Ice comes from Kōji's ice plant. The town's
money model stays closed (22 October); the kissaten's takings are not added to it unless the owner asks.

### The building (World, drawn in code)
- **Shutter up 06:50–09:40** on the kissaten's days, down at all other hours, following the clock as Nakamura's does
  (`nakamura-dressing.js` 388–400). The doors slide open; the tubes light (no point light: phone budget).
- **A new paper on the shutter** in her brush hand: 喫茶 朝7時〜9時半, and お酒は さくら商店へ kept, so the old regulars
  still know where the drink is.
- **The awning re-covered in green canvas**, its valance 喫茶 ひが · コーヒー · モーニング; the upright sign "Awamori"
  becomes コーヒー; the sugidama (the sake seller's sign) comes down.
- **An A-board** on the pavement in hours (モーニング ¥300), clear of the footway, the bench and the bicycle.
- **Inside**, in the room as it stands (4.1 × 5.75 m; the counter across the back is 2.47 m long and 0.95 m high):
  - the counter becomes the coffee counter: two siphons on spirit lamps, a kettle on a gas ring, a hand grinder, the
    register and her abacus kept;
  - four stools along its front (0.6 m apart);
  - the dear-bottle shelf behind it becomes the cup shelf;
  - the family kusu stays in its corner with its 非売品 card, under the nose of the morning crowd;
  - the record player and her late husband's records (he drove the island bus) on a low cabinet where the awamori jars
    stood, beside the counter where she can reach it;
  - a table for two by the window, where the bottle shelves were;
  - the cold case and the delivery book go.
- Buy prompts for the three items (closed text outside hours), sit prompts on the stools and the table; every new thing
  a solid with its own collider; the room reachable in hours.
- **The yuntaku bench stays** for the evening: Tetsuo and Mac, and Mr Fujita's empty crate.
- The ids stay (`higa-saketen` plot, the frame), so saves and the yard's lease keep working; the place becomes
  `kissa-higa` in `PLACES`, with Grandmother Higa its keeper in hours.

### The storyteller
A new morning place in `feed/places.js`, its shot at 07:40 from `render-feed-backdrops.mjs`: the siphons bubbling, the
toast, the egg in its cup, the record player, the kusu with its card, the A-board; regulars Officer Mori, Tetsuo and Ms
Ganaha. The evening place keeps the bench. Story hooks from what the town already holds:
- A spirit lamp heats the coffee in the shop that used to sell spirits.
- Officer Mori nods off over his toast after the night patrol; the egg rolls.
- Grandmother Higa's matchmaking has a counter now: Tetsuo's stool is always next to the one she keeps for Yui.
- "A cup of that with my coffee?" The kusu is still not for sale, at any price.
- Her late husband's records: he drove the island bus for thirty years (`neighbours.js`); what he played is decision 5.
- The iced coffee's ice comes from Kōji's ice plant, the same ice as the fish.

### Decisions for the owner
1. The name: 喫茶ひが (Kissa Higa, as the regulars called the shop by her name; recommended) or 喫茶ゆんたく (after the
   bench).
2. The days: Monday to Friday (recommended), or every day but Saturday.
3. Her garden round split between before opening and lunch (recommended).
4. Yui at the counter for breakfast before school: yes or no.
5. Her husband's records: min'yō and enka on 45s (proposed), or something else.

## What Meshy can make, and what should be drawn in code

Prices from Meshy's own planner (`meshy make … --dry-run`, which calls nothing) and its price list
(<https://docs.meshy.ai/en/api/pricing>, read 30 October 2026). Balance: 2,753 credits.

| Meshy step | Credits |
| --- | --- |
| Text to 3D: preview (mesh) + refine (texture) | 20 + 10 = 30 |
| Image to 3D, textured (meshy-6 / 7.1) | 30 (mesh only 20; meshy-6-lite 5–15) |
| Retexture | 10 |
| Remesh (polygon budget) / UV unwrap | 5 each |
| Convert / resize | 1 each |
| Rigging (humanoid) / animation | 5 / 3 an action |
| Text to image (concept) | 3–9 |

**For World (the cartoon three.js town on `main`): draw all of it in code.** Cups and saucers, the siphons, the record
player, the stools, the table and chairs, the A-board and the lettering.
- The town's cel and ink passes are tuned to the kit's clean, low shapes (`okinawa/kit.js`). A Meshy model carries
  baked colour and a dense, irregular mesh; it inks badly and looks unlike the kit props beside it.
- Glass: the siphons, the cups' shine and the door panes are the town's shop-glass material; Meshy bakes glass as
  opaque paint.
- Phone budget: the whole kissaten in code is a few thousand vertices. One standard Meshy model runs to tens of
  thousands of triangles; smart topology can hold 100–15,000 triangles, but each prop would still need a collider made
  by hand and its texture re-banded for the cel look.
- The tests (collisions, Z-fighting, ground clearance) measure the kit's own geometry.

**Where Meshy earns its credits:**
- **A Pixar Grandmother Higa**, as Thao and Johansson were made from the owner's Meshy models: image to 3D, textured,
  then rigged in Blender by the studio's own scripts (`jojo` `3d/cast/game_meshy.py`), or Meshy's rigging. About
  30 + 5 = 35 credits, from a reference image (the owner's, or a concept at 3–9 credits).
- **The Pixar kissaten's props in Blender** (studio repo `jojo`, branch `pixar`, for stills and films), where detail
  shows: the record player, a bentwood chair, a hand coffee grinder, a cast-iron stool base. About 30 each, 5 more for a
  remesh: about 140 credits for the four.
- Not Meshy even there: the siphons and the cups. They are glass and turned shapes, quicker and truer modelled in
  Blender (screw/lathe) with a real glass shader.

All of it: about 175 credits, 6% of the balance. Nothing has been generated; each step waits for the owner's word.

## Next action
The owner answers the five decisions and says whether to build. Then, in this order: the data module (hours, menu,
regulars, supplies) with its tests; the dressing and the frontage on the clock; her day and the regulars' days; the
storyteller place and its backdrop; the guide and the rules text; the tests in section B updated with dated notes (none
weakened); `npm run build:runtime`; the CI guard with CI's heap; photos at 07:40 and 10:00, looked at. Publishing to
`main` only on the owner's word.
