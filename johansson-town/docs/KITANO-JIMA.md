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

**Open after 7a.** The 待合所 waiting shelter at the pier (the brief's §6.2); the lane's own lamp; a path from the lane
to Coral Bay; the yard-home at 2 Front-Row Yard still Chin's and Tetsuo's until 7b.

## 3. Batch 7b: the villagers (planned)

- **Chin and Tetsuo move to `kitano-3`.** Their work already faces the island: Tetsuo's kei truck collects the airport
  cargo and his radio test is at the terminal; Chin's car lives in the airport yard. Their profiles' `home` getter
  (`people/residents.js`) returns the hamlet gate; `world.homes`, the household registry and 2 Front-Row Yard (which
  becomes the house to let in town) follow. At Minato they are **ferry commuters** (the existing commuter mode:
  off the morning boat at the pier, to the workshop and the bookshop, the evening boat home); on the island they keep
  **home life** at their house (the family-home interior with their futons, and their yard), and the ferry's purser
  knows them by name.
- **Jun** gets his house: his routine's "off duty, home" is `kitano-2`'s yard and, when Johansson calls, his room.
- **Nameplates and dialogue**: "I live at Kitano hamlet, across the water"; the ferry's bicycle-rack prompt is true.
- Tests: `yard-homes` (2 Front-Row Yard to let), `continuous-life` (home owners' sites), `home-interiors`,
  `thuan-*` unaffected, a new `kitano-hamlet` test (the commute's timetable, the island home life).

## 4. Batch 7c: the crew at their posts (planned)

The data is there (`people/ferry-crew.js`: the master, Mr Nakandakari the chief, Mr Higa Jr the oiler, Ms Uezu on deck,
Kōji her relief; `FERRY_WATCH` says where each is in every phase). Nobody is aboard. The batch: actors parented to the
ship's group (so they ride with her, as the inspect prompts do), one per post, placed by `FERRY_WATCH` for her phase:
alongside, the master in the wheelhouse, the chief at the booth's desk, the deck hand at the gangway or the ramp, the
purser at her window; under way, the master at the wheel, the chief by the engines, the deck hand on the car deck. Each
with a look (recipes in `avatars/cast.js`, portraits for the guide), a prompt with a few lines of their own, and the
purser's window selling nothing yet (section 7 of `docs/FERRY-AUDIT.md`). Tests: each post occupied in each phase, every
actor on a floor of hers.
