# Expansion notes

What is built but not (yet) fully in play, what was retired in the September 2026
cleanup, and how to get any of it back. Everything removed is still in git history at
commit **`5c63eb8`** (the last commit before the cleanup), so nothing below is lost:

```sh
git show 5c63eb8:johansson-town/src/world/sea-cave.js > src/world/sea-cave.js
git checkout 5c63eb8 -- johansson-town/assets/models/sea-cave
```

## Dormant systems worth building on

| System | Where | State | Could become |
|---|---|---|---|
| Shopify storefront | `src/commerce/shopify.js`, `shopify-config.js`, the mail-order catalogue at Sakura's counter | Wired in, `enabled:false`, no store token | A real merch / print-on-demand shop for the Form 3D models: add a public Storefront token and product map (`docs/shopify-storefront-validation.txt`). |
| Thuan's local AI chat | `src/people/thuan-mind.js`, `thuan-chat.js`, `thuan-voice.js` ("Ask her something") | Live, opt-in; downloads a ~670 MB model in the browser via WebLLM | Unscripted conversation for any resident; a smaller model or a server option. |
| WebMCP tools | `webmcp.js`, `webmcp-characters.js`, `WEBMCP.md` | Live, loaded lazily | Agent-driven playtesting, guided tours, AI co-players. |
| Avatar creator | `src/avatars/creator.js`, `creator/`, `tools/avatar-preview.html` | Live (Town book → Make your islander, share links) | Shareable islander codes, NPC authoring, a cast editor. |
| Office workbooks | `src/office/workbooks.js`, `assets/office-workbooks/`, `scripts/build-office-workbooks.mjs` | Live in the harbour office | Spreadsheet puzzles and records tied to quests. |
| Thuan's Storage | `/thuans-storage/` (sibling game) + `storage-restock` anchor + `shop-stock.js` | Live hand-off | A deeper restock-and-sell economy loop between the two games. |
| Third-person camera | `setThirdPerson` / `VIEW_KEY` in `src/game.js` | Live (the eye button) | A photo or spectator mode. |
| Okinawan quarter kit | `src/world/okinawa/*` (Sakura Crossing–derived) | Live | A procedural generator for new streets and districts. |
| Thuan's flat above Sakura | `src/world/thuan-flat.js` | Exterior dressing only; her schedule still sends her to the canal-side house she shares with Nao | Move her home upstairs: households, `residents.js` home fields, commute and evening routines, and an interior. |

## Residents

On the street: Thuan, Nao, and the Front-Row staff — Aya and Reiko (books, evening press), Kenji and
Tetsuo (workshop, radio repair) — who live in two yard houses behind the bookshop
(`src/world/yard-homes*.js`) and sleep there instead of taking the bus.

The harbour master and Officer Mori live where they work (`livesAtWork` in
`commuter-schedule.js`, `workplaceResidentPlan` in `social.js`). The harbour master sleeps behind a
folding screen in the harbour office (`buildBedNook` in `interiors/office-workplace.js`). Mori has the
police box, a chūzaisho on the lawn corner at the bus plaza (`src/world/koban*.js`,
`interiors/koban.js`): front desk from 16:00, night patrol 22:00–06:00, asleep in the tatami room
behind it through the morning. A site with `ownRoom` keeps its own interior as a home, and
`homeLayouts` gives home-residents.js the bed and table inside it.

Still held back, in `STREET_CAST_NAMES`: Mrs Sato and the Bus driver; they would each need a home and
a peninsula routine the same way. Thuan and Nao still commute; their flat above Sakura is dressed
from outside only. Everyone on the street is a recipe in `src/avatars/cast.js`.

Hats are a separate piece of the avatar (`avatar.hat`, `setHat`, the `hatOff` flag). At home the hat
goes on the room's `hatHook` (a peg, or the top of a hat stand) as a `buildHatProp` copy, and back
on the head at the door. A home layout without a hook leaves the hat on.

## Retired in the cleanup (recover from `5c63eb8`)

| What | Files | Why |
|---|---|---|
| Sea cave | `src/world/sea-cave.js`, `assets/models/sea-cave/` (12.5 MB), `tools/pack-sea-cave.mjs`, its test | Retired district; nothing in the game loaded it. A good future dungeon. |
| Full overworld | `src/world/full-town.js`, `promenade.js`, `street-clearance.js`, `assets/models/full-town/overworld.glb` (7.4 MB), `tools/prepare-street-clearance.mjs`, their tests | Replaced by the peninsula town. `navigation.json` and `street-clearance.json` stay (tests read them). |
| Harbour block | `src/world/harbour-block.js`, `assets/models/harbour-block/` (7.4 MB), `tools/compact-harbour-block.mjs`, `prepare-harbour-block.py`, `measure-art-scene.mjs`, its test | Retired street. |
| Merchant roofs | `src/world/merchant-roofs.js` | Only a test used it. |
| Orphan modules | `preflight.js`, `src/people/aya-animation.js`, `procedural.js`, `vroid.js`, `src/world/interiors/yuri-figurine.js` | Imported by nothing. |
| Unused assets | the old supplied Minato izakaya exterior (4.7 MB), Kenney mini-characters, three old konbini label images | No code loaded them. |
| Classic character cast | `assets/characters/` (~50 MB: MakeHuman Thuan and Johansson, Nao's VRoid, the Meshy Thuan and figurine, the low-poly residents), `art/characters/` (source art), the GLB branch of `src/people/models.js`, `johansson.js`, the `yuri-*`, `nao-vrm-animation`, `thuan-face-controller`, `thuan-fingers`, `resident-animation`, `resident-wardrobe`, `office-hands`, `meal-motion`, `thuan-seat-drape`, `gait`, `surface` modules, their Blender tools and tests | Everyone is a Shimanchu now; the `?classic` flag is gone. Recover from the commit before the removal (see `git log -- johansson-town/assets/characters`). |
| Old convenience store, Japanese street kit, old canal-house exterior | `convenience.js`, `store-service.js`, `shop-business.js`, `japanese-town.js`, `yuri-home.js` and their GLBs | Replaced by Sakura's real interior and the peninsula town. |
| Stale docs | `AUDIT.md`, `OFFICE-V4.md`, four identical `docs/YURI*.md` stubs, `COMPACT-TOWN.md`, `GRID-TOWN.md` | Superseded or describing systems that no longer exist. |
| Old runtime builds | ~615 hashed chunks in `runtime/` (~285 MB) | Each rebuild left its old chunks behind; the build script now prunes to the current and previous build. |

Generation reference images moved from `assets/generation/pilot/references/` to
`art/generation-references/`: they are inputs for making art, not game files.

## Done in the second cleanup pass

- CSS: 14 stylesheets merged into 5 in link order (`base.css`, `context-controls.css`,
  `landing.css`, `dual-controls.css`, `tomodachi-ui.css`), with ~90 rules for classes
  that no longer exist removed. Each section is labelled with its original file name.
- Old convenience store and street-kit leftovers retired; dead doc links fixed; the
  one-off `rebuild-town-runtime` workflow deleted.

## Openings and free time

The game starts at one of a few curated openings (`src/world/openings.js`): the Sakura bench, a beer
at Minato while it is open, the end of the pier, the park bench, the seawall, or the bus stop. The pick
fits the hour and the weather, and is never the same as last time. `?spawn=<id>` forces one; the
`?audit` harness keeps the Sakura bench unless it names one. Residents on a park visit, a stroll or
an evening out are drawn to benches (`SEAT_PULL` in `town-activities.js`).

