# Kitano-jima: the hamlet, the villagers, and the ferry's crew

The creator, 2026-10-12: *"How about the staff and passengers I mean the crew, can you build in that some villagers maybe
live at the tropical island, move their home there, I think Johansson should live on the tropical island."*

Three things, built in three batches, people never in the same batch as buildings (CLAUDE.md):

| Batch | What | State |
|---|---|---|
| 7a | **Kitano hamlet**: three walled houses by the pier, Johansson's among them (his rooms move out of the town hall) | built, below |
| 7b | **The villagers**: Chin and Tetsuo move from the Front-Row yard to the house to let; Jun's home life in his house; the ferry commute | planned, §3 |
| 7c | **The crew at their posts** aboard the Minato Maru, by phase, with looks and lines | planned, §4 |

## 1. What was there (2026-10-12, before 7a)

Kitano-jima (`src/world/airport-island.js`, `tropical-island.js`, `airport-district.js`) had the airstrip behind its
fence, the terminal, the plaza with three kiosks, the departure lounge, the pier with the cargo court, the Hinata lookout,
Coral Bay with its bar, Turtle Cove, and the jungle trails: **no house, no village, no road but the cargo court.** One
person lived there: Jun (`src/people/neighbours.js`), who checks the commuter tickets, whose "home" was a hidden point on
the passenger walk. The ferry's prompt about the bicycle rack spoke of "the way from the pier to the village": that
village did not exist (the village in the menus is Hoshizaki, on Minato's own island). Walking residents cannot reach
Kitano-jima on foot (no bridge: `kitano-link-plan.js`); commuters who take the ferry are hidden "away" at sea.
Johansson's home was the room `mayor-home`, the town hall's east wing (`src/world/school.js`, `interiors/town-hall.js`),
with his futon, television, post and bath, and the furniture Johansson Studio puts in it.

## 2. Batch 7a: Kitano hamlet (北野集落)

**The plan.** A sandy lane of crushed coral runs south of the cargo court (island frame u −47…−20, v 47.5–51.5), about
twenty metres from the ferry's landing. North of it a row of two walled plots with their gates on the lane: **Jun's
house** (`kitano-2`, concrete, block walls, the bicycle in the yard: 城間, the Shiromas) and a **red-tile house to let**
(`kitano-3`, coral walls, hinpun, fukugi: 貸家). South of the lane, with the sea behind it, **Johansson's house**
(`kitano-1`, red-tile, coral walls, a gajumaru and his bicycle in the yard: ヨハンソン). Each plot has its slab (the
plateau here runs 0.9–1.25 m, the yards sit at 1.3, the lane at 1.22), its walls, its gate with the shisa on the posts
and the nameplate beside it, and the house at the back, in the Okinawan kit the Kitahama houses are built with
(`okinawa/houses.js`), so the hamlet is of the same town. Layout: `src/world/kitano-hamlet-layout.js` (no imports, read by
the ground and the plantings); builder: `src/world/kitano-hamlet.js`, on the island's own group in its frame, with every
wall's and house's collider turned into the world with the island.

**Johansson lives there.** The gate of `kitano-1` is the site `mayor-home`: through it are his rooms as they were
(`buildMayorHome`: the genkan, the low table, the futon that sleeps him until morning, the kitchen, the television with
the evening news, the bath, the letter box, the photographs), with the furniture Johansson Studio put there, because the
room's id and the group's name did not change; only its door moved across the water. The town hall's field face keeps
the community kitchen, the mayor's office and the clinic; the east-wing door is gone. *Go home* from Minato now means
the ferry: a crossing from the office, as the household registry says.

**What it touches (checked).**
- `airport-ground.js`: the lane and the three yards are public floors (`KITANO_HAMLET_FLOORS`), so feet stay level on
  the slabs; the gates' doors are on the lane's floor.
- `tropical-island.js`: no palm, tree, shrub or rock in the hamlet's rectangle (the seeded plantings reshuffle after it;
  the trails keep their clearance by their own rule).
- `districts.js`: built after Kitahama's and Fumoto's houses, with `options.sites`, so each gate is a door like theirs;
  `home-exit-label.js`: *Exit to the lane*; `island-households.js`: Johansson at `kitano-1`, Jun at `kitano-2` (the
  nameplates' "who lives here" lines read it, as the family-home interiors do).
- Tests: `school` (the town hall's doors), `boot` (the sites list, every site entered, the stability check that every
  door and its exit step are clear), `island-growth`, `airport-dock-access`, `airport-island`, `kitano-link`,
  `home-interiors`, `home-exit-label`, `residential-quarter`, `distant-islands`, `town-hall-plan`, `airport-ferry`.
- In the game: sailed over, walked the lane, read the gates' prompts, went in at Johansson's gate (his rooms, the exit
  label), looked at the row from the cargo court and at his house from the west.

**Found and fixed on the way.** The Okinawan kit records every house's service drop as a power node on the group it
finishes, in the kit's own frame; the town's power station then strung feeders to those points read as Minato
coordinates, and a wire hung over the coastal road at (−37, 44.5) became "ground" for the walk surface (the
`garden-bridge-access` test caught it). The hamlet now finishes into its own group and drops that network: Minato's
lines do not cross the strait. The island's own supply (a pole line from the airport's generator) is open.

**Open after 7a.** The 待合所 waiting shelter at the pier (the brief's §6.2); the lane's own lamp and power; a path from
the lane to Coral Bay; the yard-home at 2 Front-Row Yard still Chin's and Tetsuo's until 7b.

## 3. Batch 7b: the villagers (planned; the creator's lore of 2026-10-12 below rules)

The creator, 2026-10-12, after 7a: *"Thuan is Johansson's wife, they live together but she stays on the port town in the
weekdays and in the weekend she is home with her husband and Nhung covers in the shop and the book store is closed in
the weekend. Sakura is always open, it should change to 24-7 and have Chin work the night shift; Chin is Thao's
husband."* So:

- **Johansson and Thuan are married.** Their home is `kitano-1` on Kitano-jima. On weekdays Thuan stays in Minato at
  1 Kitahama (her weekday room, with Thao); on Friday evening she takes the ferry home to Kitano-jima and is there
  with her husband until the Monday morning boat. The household registry, the nameplate (ヨハンソン: Johansson & Thuan)
  and her "I live at…" line say so. In his house her futon lies beside his.
- **Chin is Thao's husband**: he lives with Thao at 1 Kitahama, not in the Front-Row yard. Tetsuo, alone in 2 Front-Row
  Yard, moves to Kitano-jima's house to let (`kitano-3`): his radio test is at the airport, his kei truck collects its
  cargo. 2 Front-Row Yard becomes the house to let in town.
- **Sakura Shōten is open 24 hours, seven days.** Thuan keeps the day shift on weekdays; **Chin works the night shift**
  (every night, after the workshop closes); **Nhung covers the day shift at the weekend** while Thuan is on Kitano-jima.
- **Front Row Books is closed at the weekend** (Nhung is at Sakura; Reiko's paper still comes out).
- Island residents (Johansson's wife at weekends, Tetsuo) are **ferry commuters** at Minato and keep **home life** on the
  island; Jun gets his house.


- **Tetsuo moves to `kitano-3`** (his profile's `home` getter in `people/residents.js` returns the hamlet gate; `world.homes`,
  the registry and 2 Front-Row Yard follow). At Minato he is a **ferry commuter** (off the morning boat, to the
  workshop, the evening boat home); on the island he keeps **home life** at his house.
- **Jun** gets his house: his routine's "off duty, home" is `kitano-2`'s yard and, when Johansson calls, his room.
- **Nameplates and dialogue**: "I live at Kitano hamlet, across the water"; the ferry's bicycle-rack prompt is true.
- Tests: `yard-homes` (2 Front-Row Yard to let), `continuous-life` (home owners' sites), `home-interiors`,
  `thuan-*` unaffected, a new `kitano-hamlet` test (the commute's timetable, the island home life).

### 7b-1, built: the households (2026-10-12)

- `people/households.js`: `yuri-home` is Thuan, Thao and Chin; 2 Front-Row Yard (`resident-home-kenji`) has no
  household and is **to let** (`yard-homes.js` now builds every yard house, the empty one with the agent's board, a
  family-home interior and *Look round*). `kitahama-layout.js`: 1 Kitahama's residents and nameplate name the three.
- `people/kitano-residents.js`: **Tetsuo lives at `kitano-3`** (the Chinen house, 知念); his profile's `home` is the
  hamlet's gate (world coordinates), his address Kitano hamlet; with no household in town he is no longer a home
  owner, so the timetable's commuter rules carry him: the 14:30 boat in, the workshop's afternoon-and-evening shift,
  the morning boat home, and `awayPlace` says *at home on Kitano-jima*, not the mainland.
- **Chin keeps the yard's day** (lunch at Sato, the workshop, the evening, then home) from 1 Kitahama: the commuter
  rules sent him through the generic branches and lost his lunch (the `continuous-life` test found it).
- Rooms: the family home lays **three futons** (red tile: Thuan's in the nibanza, Thao's and Chin's in the uraza; concrete:
  three in the east room) and a third seat at the low table's west cushion; the shared Kitahama room gives a third
  person the middle futon; Thuan's futon is in Johansson's house, folded by day in the corner by his pillow
  (`town-hall.js`); `home-life.js` gives Chin a place in the Yuri apartment.
- Texts: the household registry (Thuan his wife, Chin Thao's husband, Tetsuo at kitano-3), the hamlet's nameplates
  (ヨハンソン: Johansson & Thuan; 知念: Chinen), the residents' *I live at…* lines.
- Tests updated: `yard-homes` (to let), `resident-home-plan`, `visual-home-camera`, `seat-layouts`,
  `neighbourhood-access` (Tetsuo no longer in the park at 13:00: he is on the island), `home-interiors`,
  `continuous-life`, `town-hall-plan` pass with the rest of the household suite and `boot`.
- Open for 7b-2 and 7b-3: Sakura 24/7 with Chin's night shift and Nhung's weekend cover, Front Row closed at the
  weekend, Thuan's weekends on Kitano-jima, Jun's home life, the guide's portraits and backstories (Johansson's wife,
  Thao's husband) regenerated.

### 7b-2, built: Sakura open 24 hours, the rota, the weekend (2026-10-12)

- `commerce/sakura-rota.js` is the one place that says **who is at Sakura's counter**: Thuan 09:00–20:30 on weekdays,
  **Nhung** the same hours on Saturday and Sunday (Thuan is home on Kitano-jima), **Chin** 20:30–06:00 every night,
  and Grandmother Sakurai, who owns the shop and lives above it, 06:00–09:00 (she has no walking body yet; the counter
  keeps the last clerk's binding). The day clerk hands over at 20:30 so her end-of-day restock (`shop-stock.js`
  `closingDay`, from 20:00) is done with the night clerk already in the shop.
- **Sakura never closes**: the konbini hours, the shopfront shutter (always up; a fixture can still set it), the strip
  lights and the interior tubes (full strength all night), the shutter text, flyer, town papers and specials board
  ("Open 24 hours, every day"; the hot case still runs 09:00–20:00), and the staff board's rota. Purchases no longer
  wait for opening time; the till, the sold-out line, the restock entries and the recycling box name whoever is on shift.
- **The clerk follows the rota**: `shop-retail`, `indoor-residents` and `sakura-shop` bind the counter's services to the
  body on shift and re-bind when it changes (`followRota`).
- **Plans**: Chin works the night shift, sleeps 06:30–13:30 at 1 Kitahama, keeps his afternoon at the bench and loses
  his Sato lunch slot (he is asleep); Nhung minds Sakura at the weekend and has no bookshop day then; Thuan's weekday
  market shift is gated by the rota; **Front Row Books is closed at the weekend** (`town.js isOpen`, no bookshop
  visits). Tetsuo, who had fallen into the night-bus pattern after moving to Kitano-jima in 7b-1 (at the izakaya at
  midnight, away all day), now takes the 08:30 boat over, works 09:00–18:30 with lunch at Sato and goes home on the
  22:00 boat (`commuter-schedule.js`).
- Checked in the headless game: at 23:00 the shop is lit, the shutter up and Chin at the counter; on Saturday at
  10:00 Nhung is the clerk and Thuan is at home. Tests: the shutter, strip-light and tube tests say "always on";
  `continuous-life` and `npc-seating` use Nhung's and Reiko's lunch visits; `sato-ramen` has no slot for Chin.
- Open: Grandmother Sakurai's body for 06:00–09:00; Thuan's weekends on Kitano-jima (7b-3: at the weekend she is at
  home at 1 Kitahama, not yet across the water); Reiko is held at the market room's origin with `place: market` at all
  hours in the headless game, on main as well (an old resident-location record; not this batch's); the specials
  text in `activities.js` still says Thuan in places that are hers anyway.

## 4. Batch 7c: the crew at their posts (built 2026-10-12)

The data is there (`people/ferry-crew.js`: the master, Mr Nakandakari the chief, Mr Higa Jr the oiler, Ms Uezu on deck,
Kōji her relief; `FERRY_WATCH` says where each is in every phase). Nobody is aboard. The batch: actors parented to the
ship's group (so they ride with her, as the inspect prompts do), one per post, placed by `FERRY_WATCH` for her phase:
alongside, the master in the wheelhouse, the chief at the booth's desk, the deck hand at the gangway or the ramp, the
purser at her window; under way, the master at the wheel, the chief by the engines, the deck hand on the car deck. Each
with a look (recipes in `avatars/cast.js`, portraits for the guide), a prompt with a few lines of their own, and the
purser's window selling nothing yet (section 7 of `docs/FERRY-AUDIT.md`). Tests: each post occupied in each phase, every
actor on a floor of hers.

**Built.** `src/people/ferry-crew-aboard.js`: one body per post of `FERRY_CREW`, a child of her group, placed by
`FERRY_WATCH` for her phase (`watchPhase`: her own phase by day, *night* outside `FERRY_DAY`), at `CREW_POSTS` (the
wheelhouse at the wheel, the port wing, the control booth, the floor plates by the engines for the oiler's watch, the
aft mooring station, the bow between the bow houses, the foyer at the gangway, the car deck, the saloon's cross
passage, the crew corridor by the mess and by the cabin), facing the work. The master is the bus driver, as
`ferry-crew.js` says; his body in town is hidden while he is aboard. At night the chief and, on her week on, the deck
hand. Each has a *Talk to* prompt that rides with her, saying what they are doing in this phase and why they have the
job. Looks are the cast's recipes (generated for the three new faces until recipes are authored). Wired in `game.js`
beside the neighbours and ticked with the town. Tests: `ferry-crew-aboard` (every post of every phase on one of her
floors and clear of her walls; who is aboard by day and night; the bodies ride with her; the town body hidden). In the
game: alongside, Mr Higa Jr in the foyer and Ms Uezu on the car deck with their prompts; at sea, Ms Uezu at the bow
end of the car deck. Open: authored looks and portraits for Mr Nakandakari, Ms Uezu and Mr Higa Jr; the purser's post
(the manning's eight); the crew moving between posts instead of appearing at them.

