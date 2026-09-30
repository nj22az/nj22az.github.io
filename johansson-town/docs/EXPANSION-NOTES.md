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
| Old convenience store | `src/world/interiors/convenience.js`, `store-service.js` (`createStoreService`), `src/people/shop-business.js` | Used only by tests since Sakura's real interior replaced it | A template for a second shop, or retire with its four tests. |
| `?classic` characters | MakeHuman Thuan/Johansson, Nao VRoid, low-poly residents (`src/people/models.js` GLB branch, `johansson.js`, `yuri-*`, `nao-vrm-animation.js`; ~44 MB of assets) | Only behind the `?classic` URL flag | A "realistic" graphics mode or cutscene cast — or retire once Shimanchu avatars are final. |
| Japanese street kit, Thuan's old house exterior | `src/world/japanese-town.js`, `src/world/yuri-home.js` (+ `street-kit.glb`, `yuri-home-exterior.glb`) | Not used by the live town; still exercised by boot, bicycle, bookshop and late-asset tests | Kept until those tests are rewritten; then retire like the districts below. |
| Third-person camera | `setThirdPerson` / `VIEW_KEY` in `src/game.js` | Live (the eye button) | A photo or spectator mode. |
| Okinawan quarter kit | `src/world/okinawa/*` (Sakura Crossing–derived) | Live | A procedural generator for new streets and districts. |
| Thuan's flat above Sakura | `src/world/thuan-flat.js` | Exterior dressing only; her schedule still sends her to the canal-side house she shares with Nao | Move her home upstairs: households, `residents.js` home fields, commute and evening routines, and an interior. |

## Retired in the cleanup (recover from `5c63eb8`)

| What | Files | Why |
|---|---|---|
| Sea cave | `src/world/sea-cave.js`, `assets/models/sea-cave/` (12.5 MB), `tools/pack-sea-cave.mjs`, its test | Retired district; nothing in the game loaded it. A good future dungeon. |
| Full overworld | `src/world/full-town.js`, `promenade.js`, `street-clearance.js`, `assets/models/full-town/overworld.glb` (7.4 MB), `tools/prepare-street-clearance.mjs`, their tests | Replaced by the peninsula town. `navigation.json` and `street-clearance.json` stay (tests read them). |
| Harbour block | `src/world/harbour-block.js`, `assets/models/harbour-block/` (7.4 MB), `tools/compact-harbour-block.mjs`, `prepare-harbour-block.py`, `measure-art-scene.mjs`, its test | Retired street. |
| Merchant roofs | `src/world/merchant-roofs.js` | Only a test used it. |
| Orphan modules | `preflight.js`, `src/people/aya-animation.js`, `procedural.js`, `vroid.js`, `src/world/interiors/yuri-figurine.js` | Imported by nothing. |
| Unused assets | the old supplied Minato izakaya exterior (4.7 MB), Kenney mini-characters, three old konbini label images | No code loaded them. |
| Stale docs | `AUDIT.md`, `OFFICE-V4.md`, four identical `docs/YURI*.md` stubs, `COMPACT-TOWN.md`, `GRID-TOWN.md` | Superseded or describing systems that no longer exist. |
| Old runtime builds | ~615 hashed chunks in `runtime/` (~285 MB) | Each rebuild left its old chunks behind; the build script now prunes to the current and previous build. |

Generation reference images moved from `assets/generation/pilot/references/` to
`art/generation-references/`: they are inputs for making art, not game files.

## Known cleanup still open

- CSS: 14 stylesheets with heavy overlap (`polish.css` restates ~20 selectors from
  `styles.css`; the touch buttons are styled in up to seven files). Merge in one pass,
  keeping `context-controls.css` and `dual-controls.css` (tests read them by name).
- Unused selectors: `.start-card`, `.scene-line`, `.desktop-help`, `.boot-status` and
  the old landing-page `.board-*` / `.admit-*` classes.
- Docs with dead links: `EAST-GARDEN.md`, `VROID-CAST.md`, `NEIGHBOURS-AND-STREET.md`,
  `HARBOUR-BOARDWALK.md`, `WORKSHOP-PRINTING.md`.
- `.github/workflows/rebuild-town-runtime.yml` is a one-off with hard-coded checks.
