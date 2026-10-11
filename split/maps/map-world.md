# Johansson World (johansson-town/) — split map

Read-only survey, 2026-10-11, of `/home/user/nj22az.github.io` on branch `claude/sjoskolan-youtube-strategy-gofi3o`
(HEAD 553ade6e, shallow clone) and `/home/user/jojo` (main). Target: repo `nj22az/johansson-world`, served at
`https://nj22az.github.io/johansson-world/`, with `/johansson-town/` kept working as a redirect.

Raw grep dumps beside this file: `raw-jt-name.txt` (World files naming its own folder), `raw-jt-escape.txt`
(relative `../` paths inside World that resolve outside it), `raw-outside-jt.txt` (site files naming World),
`raw-jojo.txt` (studio repo files naming World / the site clone). `escape.py` is the resolver used.

## 0. Headline findings

1. **World's runtime code is already portable.** `src/` and the root JS/CSS use only relative URLs
   (`./`, `document.baseURI` in `src/assets.js:3`), the manifest uses `./` for id/start_url/scope, `pwa.js:7`
   registers `./sw.js` with scope `./`, `sw.js:5` derives its scope from its own URL, and both Vite configs use
   `base:'./'` (`vite.config.js`, `scripts/build-runtime.mjs` build call). Nothing in the game itself hardcodes
   `/johansson-town/`. Served from `/johansson-world/` the game works unchanged.
2. **What breaks is everything around it**: five absolute links out of World to site neighbours, four outside
   projects that *import World's modules at runtime* (Studio, Thuan's Storage, Motor 90L workshop, Sjöskolan
   simulators), one World unit test that reads `../../motor-90l/` (in `npm test`, so the new repo's CI fails),
   ~40 dev tools that serve the *site root* and address World as `/johansson-town/`, and the studio repo `jojo`
   which locates World as `../nj22az.github.io/johansson-town`.
3. **Module imports cannot be redirected.** A meta-refresh/JS stub at `/johansson-town/` only helps page
   navigations. `import '/johansson-town/src/...'` and `../../johansson-town/vendor/three.module.js` must be
   repointed (or the code moved) *before* the old folder is replaced by a stub, or Studio, Thuan's Storage,
   the motor workshop and the Sjöskolan simulators go blank.
4. **Redirect loop trap:** the work branch has `johansson-world/index.html` → `/johansson-town/` (not on main yet;
   live `/johansson-world/` is 404 today). Once `/johansson-town/` redirects to `/johansson-world/`, that folder
   must not exist on main (delete it from the branch in the split commit).
5. **Ordering trap:** `.github/workflows/johansson-town-live.yml` copies the whole `johansson-town/` folder onto
   main on every branch push. It must be removed/disabled in the same commit that turns `johansson-town/` into a
   stub, otherwise the next push re-publishes the old game over the stub.
6. **Saves:** no storage key is path-derived. All keys are origin-wide `localStorage` (`johansson-town-*`), there
   is no IndexedDB/sessionStorage/cookie use, and the only Cache Storage is the service worker's. Same origin
   ⇒ Safari saves survive. **Caveat for the iPad home-screen app:** iPadOS gives each Home Screen web app its own
   website-data container, separate from Safari; a *new* icon added from `/johansson-world/` starts with empty
   storage. Keep the old icon (it redirects within its own container), or export the save from the old icon
   (in-game save file download, `activities.js:715`; `title-menu.js:72` already accepts save files whose game id is
   `johansson-town` or `johansson-world`) and load it in the new one. **Do not rename the `johansson-town-*`
   localStorage keys or the `johansson-town:storage-*` keys** — they are the saves.

## 1. Inside World: paths and names that cross or name the boundary

### 1a. Runtime (served pages)

| file:line | what | after the split |
|---|---|---|
| `index.html:88` | `<a id="openStudio" href="/avatar-creator/">` | → `/johansson-studio/` (Studio stub would also catch it) |
| `index.html:156` | `<a class="stockroom-card" href="/thuans-storage/">` | → `./thuans-storage/` if Storage moves in, else keep |
| `activities.js:1010-1011` (bundled in `runtime/game-*.js:1124`) | `location.href='/thuans-storage/?from=johansson-town&mode=…'` | same; keep the `from=johansson-town` token (identifier, not a path) |
| `src/workshop/interface.js:18` | iframe `/stepbuddy/` and `/form-3d-studio/` | still valid (same origin; stepbuddy is its own Pages repo, form-3d-studio stays on main) |
| `src/workshop/motor-bench.js:11` (`MOTOR_LINKS`) | `/motor-90l/`, `/motor-90l/workshop/` | → `./motor-90l/…` if Motor 90L moves in; `tests/motor-bench.test.mjs:47` asserts the literal |
| `src/avatars/export.js:2` | `import … '../../tools/vendor/GLTFExporter.js'` | stays inside World, but makes `tools/vendor/` a **runtime** folder (raw-src consumers load it) |
| `title-menu.js:1-3` | imports raw `./src/features.js`, `./src/people/friendship.js`, `./src/save.js` | `src/` is runtime, not only build input |
| `title-sky.js` | imports `./vendor/three.module.js` | `vendor/` runtime |
| `creator/index.html:12-23,36,38` | raw `../src/avatars/*`, `../line-ui.css`, share link `./?r=CODE` → `/johansson-town/creator/?r=CODE` | works relatively; old shared links need a stub at `/johansson-town/creator/` |
| `src/game.js:435` + `src/build/placements.js:11` | fetches `data/world-placements.json` via `document.baseURI` | `data/` runtime |
| `src/features.js:6` | `LIVE_HOSTS=['nj22az.github.io',…]` decorator guard is host-based | unaffected by the path change |
| `sw.js:3` | cache `PREFIX='johansson-town-'` | Cache Storage is **origin-wide**, not scope-wide. Rename to `johansson-world-` in the new repo and let its `activate` delete leftover `johansson-town-*` caches; otherwise the old site's cache is kept as "previous build" and a kill-switch for the old SW could wipe the new one's cache |
| `sw.js:5,10` | `SCOPE=new URL('./',self.location)` | becomes `/johansson-world/`; no overlap with `/johansson-town/` |
| `manifest.webmanifest:2,7,8` | `id`/`start_url`/`scope` = `./` | new app identity `/johansson-world/` (a different installed app on Chrome/Android) |
| `pwa.js:7` | `register('./sw.js',{scope:'./',updateViaCache:'none'})` | fine |
| `src/photo/studio.js`, `activities.js:715` | download names `johansson-town*.png/json` | cosmetic; optional rename |

### 1b. Tests (`npm test` = `node --test tests/*.test.mjs`, 263 files; 13 `*.browser.mjs` not in npm test)

| file:line | reaches | breaks how |
|---|---|---|
| `tests/motor-bench.test.mjs:20` | reads `../../motor-90l/motor.js`, `../../motor-90l/calc.mjs` (hashes from `assets/models/props/motor-90l-display-provenance.json:3-6`) | **fails in the new repo's CI** (ENOENT) unless Motor 90L moves in (then path `../motor-90l/`) |
| `tests/motor-bench.test.mjs:47` | asserts `MOTOR_LINKS` literals | change with `src/workshop/motor-bench.js:11` |
| `tests/storage-boss.browser.mjs:2,7,10,20,30,34` | serves the **site root** (`../../`) as `http://town.test/`, needs `/johansson-town/` and `/thuans-storage/assets/storage-*.js` | breaks; becomes a same-repo test if Storage moves in |
| `tests/fixtures.mjs:24`, `office.test.mjs:19`, `owned-display-lod.test.mjs:78`, `park.test.mjs:20`, `workshop.test.mjs:89`, `tatami-home.test.mjs:39`, `voices.test.mjs:33`, `mcp-audit.test.mjs:25`, `izakaya-persistence.browser.mjs:13` | fake location `https://nj22az.github.io/johansson-town/` and asserted pathnames `/johansson-town/assets/…` | self-consistent, still pass; rename all together if desired |
| `tests/evidence/storage-boss/README.md:12-15` | commands `node --test johansson-town/tests/…` and `thuans-storage/tests/*.test.mjs` from site root | docs |
| `tests/office-workbooks.test.mjs:64` | `'../../other.xlsx'` | a negative-test string, not a path dependency |

### 1c. Tools and scripts (dev only)

| file:line | reaches | breaks how / fix |
|---|---|---|
| `tools/pack-motor-90l.mjs:1,26,98,100` | `import('../../motor-90l/motor.js')`, hashes `motor-90l/calc.mjs` | needs Motor 90L next to it |
| `scripts/build-workshop-models.mjs:2,4` | `import … '../../form-3d-studio/src/open-models.mjs'` (after `npm ci` there) | one-off generator; needs a form-3d-studio checkout beside World (env var or sibling path) |
| `scripts/build-building-audit.mjs:33` | `git show <rev>:johansson-town/docs/building-plans/analysis.json` | in-repo path prefix; becomes `docs/building-plans/analysis.json` (old revs keep the old prefix) |
| `scripts/build-building-audit.mjs:19`, `scripts/build-runtime.mjs:8` | `new URL('..')` = World root | fine |
| `tools/serve-audit.py:16-19` (`npm run audit:serve`) | serves `parents[2]` = **site root**, prints `/johansson-town/` | after split serves the parent of the clone and the folder is no longer called `johansson-town` → serve World root under a fixed mount |
| `tools/ferry-look.mjs:14,27,36,113`, `tools/render-feed-backdrops.mjs:22,27-28,42,60,76,82,162` | `site=resolve(root,'..')` served as web root; page `…/johansson-town/?audit`; in-page `import('/johansson-town/vendor/three.module.js')`, `/johansson-town/src/…` | break (wrong root + folder name). `render-feed-backdrops` makes the storyteller's comic backdrops |
| `tools/access-arrival-audit.mjs:5,53`, `audit-town.mjs:21,27,41`, `avatar-floor-audit.mjs:11,14`, `bookshop-path-audit.mjs:22`, `clipping-audit.mjs:11,21,26-27,42,46-47`, `drink-grip-audit.mjs:5`, `fujita-houseboat-audit.mjs:67`, `graphics-smoke.mjs:5`, `owned-display-comparison.mjs:7`, `seating-audit.mjs:3-4,15,39,67`, `ui-expanded-audit.mjs:10`, `visual-audit.mjs:16,53,105,108` (`npm run audit:visual`) | default base URL `http://127.0.0.1:PORT/johansson-town/` + in-page imports of `/johansson-town/…` | assume `serve-audit.py`'s site-root layout; keep working only if the local server keeps mounting World at `/johansson-town/` — pick one mount name (`/johansson-world/`) and change all together |
| `tools/access-arrival-audit.mjs:6`, `audit-town.mjs:8`, `avatar-floor-audit.mjs:5`, `bookshop-path-audit.mjs:9`, `clipping-audit.mjs:5`, `graphics-smoke.mjs:6`, `owned-display-comparison.mjs:9`, `sakura-rack-audit.mjs:29`, `ui-expanded-audit.mjs:12`, `ui-layout-audit.mjs:11`, `ui-standalone-creator-audit.mjs:8`, `mcp/smoke.mjs:7` (`npm run audit:mcp`), `mcp/tour-client.mjs:8`, `mcp/shop-tour-console.mjs:8` | write evidence to `../../output/` = **site-root `output/`** (exists now, untracked, holds `studio-mcp/`), not World's own `output/` | after split they write *outside* the repo (parent folder). Change to `../output/` |
| `tools/drink-grip-audit.mjs:5` | `resolve('../output/…')` relative to cwd (World) = site root | same |
| `docs/DRINK-GRIP-QA-2026-10-06.md:12`, `docs/SEATING-AND-CONTEXT-QA-2026-10-05.md:23-27` | links `../../output/playwright/…` (site-root evidence) | dead links already (not in git) |
| `tools/mcp/static-server.mjs:10-38` (uncommitted edit) | serves World at `/johansson-town/`; new `mounts` mode serves the site root with `['johansson-town','avatar-creator']` | mount mode cannot work across two repos without a configured sibling path |
| `tools/mcp/session.mjs:8,89` | root = World; in-page `import('/johansson-town/tools/mcp/navigation.mjs')` | consistent with static-server prefix |
| `tools/check-installable-app.mjs:7,10,13` | own server, `/johansson-town/` prefix | self-contained |
| `tools/studio/*` **(untracked, in flight — task #41)**: `repo.mjs:9,17,24-33` (`CODE_ROOT` = three up = site root; data paths `johansson-town/data/studio/*`, `johansson-town/src/avatars/looks-data.js`, `johansson-town/src/commerce/products-data.js`, label regex `johansson-town/assets/graphics/labels/`), `page.mjs:3,17,25` (mounts World + `avatar-creator`, opens `avatar-creator/?agent`), `tools.mjs:33,162,176,215` (`git status -- johansson-town avatar-creator .mcp.json`), `apply.mjs:5-6,71`, `build-data.mjs:6-7,18,45`, `server.mjs:7` → `avatar-creator/docs/STUDIO-MCP.md` | Studio's MCP lives *inside World* and assumes one repo containing both apps. Decide: it stays in World (Studio edits World's data, "Mario Maker"), with Studio located via an env var/sibling path; and `src/studio/`, `data/studio/` stay with World |
| `.mcp.json:3-5` (site root) | `johansson-town-audit` → `node johansson-town/tools/mcp/server.mjs` | new repo: `.mcp.json` with `tools/mcp/server.mjs`. The server name is used in `CLAUDE.md:173`, `.claude/agents/set-designer.md:32`, `street-designer.md:30` (tool names `mcp__johansson-town-audit__*`); keep the name or rename everywhere |
| `package.json` (World) | own scripts/deps (vite, playwright, MCP SDK, meshoptimizer…) | becomes the repo-root package.json; there is **no** site-root package.json or node_modules |
| `node_modules/` (World, ignored, 75 MB) | also used **by absolute path** from jojo (`art/pencil/pose.mjs:1`, `town-studio/evidence/*.mjs:1`) | jojo path changes |
| `README.md:5,11` | live URL; "`npx serve ..` … open `/johansson-town/`" | rewrite: serve the repo root |
| `WHERE-TO-EDIT.md:1-12` | work-branch + `johansson-town-live.yml` publishing rules | rewrite for the new repo |
| `briefs/NEXT.md:53,96-110` | `jojo/…`, World catalogue `johansson-town/assets/catalog/` | update path |
| `assets/ATTRIBUTION.md:236`, `assets/models/props/motor-90l-display-provenance.json:3-6` | `../../motor-90l/` source | update when Motor 90L placement is decided |
| `docs/**` (16 files, 235 hits, 211 in `docs/qa/izakaya-items/mcp-actions.json`) | evidence/notes naming `johansson-town/` | historical; leave |
| `output/playwright/shadow-wall/experiment.mjs:19` | `…/johansson-town/?audit` | archived experiment |

## 2. Outside → World (who imports, fetches or links World)

### 2a. Runtime imports (break hard; a page stub cannot fix them)

| file:line | depends on | fix |
|---|---|---|
| `avatar-creator/index.html:5` | `<base href="/johansson-town/">` — makes World's `assetURL()`/`document.baseURI` fetches land in World | `/johansson-world/` |
| `avatar-creator/index.html:13,17,18` | `/johansson-town/assets/icons/town-192.png`, `/johansson-town/creator/creator.css`, `/johansson-town/line-ui.css` | repoint |
| `avatar-creator/scene.js:1-7,74,202` | `../johansson-town/vendor/three.module.js`, `src/avatars/{build,face,cast,recipe}.js`, `src/ui/icons.js`, `src/photo/layout.js`, `assets/images/feed/*` + `views.json` | `../johansson-world/…` (cross-repo, same origin) or a pinned copy |
| `avatar-creator/scene-world.js:1-8,21,23,26-29` | `src/world/{town,businesses,layout,supplied-rooms,walk-surface,izakaya}.js`, `src/world/interiors/{sakura-interior,sato-ramen,compact-shops,onsen,town-hall}.js`, `src/render/{sky,cel}.js`, vendor three (+ transitively World root `prop-factory.js`, `resource-catalog.js`) | same |
| `avatar-creator/scene-avatar.js:1-2`, `scene-catalogue.mjs:5-7`, `studio.js:1-3` | `src/avatars/{animate,face,moves,creator,cast,recipe}.js`, vendor three | same |
| `avatar-creator/tests/scene-avatar.test.mjs:3-6`, `scene-catalogue.test.mjs:3-4`, `scene-world.test.mjs:4-5,10,12` | World `vendor/`, `src/`, **`tests/fixtures.mjs`**, `assets/` read from disk | Studio CI needs a World checkout beside it |
| `thuans-storage/src/game.js:18` (+ built `assets/storage-c72192d58068.js:5435`; old `storage-66e120fdd89d.js:5435`) | `import('/johansson-town/src/dungeon/pretend.js')` | repoint + rebuild bundle, or move Storage into World |
| `thuans-storage/index.html:36` | importmap **key** `"/johansson-town/vendor/three.module.js"` → its own r186 | key must equal the URL `pretend.js` resolves to (`/johansson-world/vendor/three.module.js` or relative after a move), else World's r170 loads as a second Three |
| `thuans-storage/src/ui.js:28,30` (+ bundle `:5962,5964`) | return `location.href='/johansson-town/'`; keys `johansson-town:storage-night:*`, `johansson-town:storage-won` (`ui.js:2`) | return URL → World; **keep keys** (read by `johansson-town/src/commerce/shop-stock.js:36`) |
| `thuans-storage/tests/playability.test.mjs:104` | `../../johansson-town/src/dungeon/costumes.js` | cross-repo test unless moved |
| `motor-90l/workshop/erik.js:5` | `import … '/johansson-town/src/avatars/build.js'` | repoint or move Motor 90L into World |
| `motor-90l/workshop/index.html:80` | importmap `three` → `/johansson-town/vendor/three.module.js` (shared with `build.js`'s own `../../vendor/three.module.js`) | same |
| `sjoskolan/simulatorer/character/build.js:1-2`, `character/cel.js:1`, `erik-visar.mjs:4`, `scene.mjs:1`, `vaxelstrom/manus.mjs:5`, `vaxelstrom/scen.mjs:3`, `vaxelstrom/session.test.mjs:7` | `../../(../)johansson-town/vendor/three.module.js` and `BufferGeometryUtils.js` | after the move Sjöskolan is another repo; vendor its own three r170 (1.4 MB; hashes recorded in `sjoskolan/simulatorer/snapshot.json:29-30`) |

### 2b. Navigation links (fixed by stubs, but update the source)

| file:line | link |
|---|---|
| `config.js:84` | project card `url: "/johansson-town/"` (and `:94` `"/avatar-creator/"`) |
| `sitemap.xml:14` (and `:13`) | `https://nj22az.github.io/johansson-town/` |
| `blog/the-torn-poster/index.html:82` | `<a href="/johansson-town/">walk the island</a>` |
| `mizuhama-1988/index.html:1` | redirect → `/johansson-town/` (point straight at `/johansson-world/`, avoid a double hop) |
| `johansson-world/index.html:1` (**branch only**) | redirect → `/johansson-town/` — **delete** (loop + would collide with the project site path) |
| `motor-90l/index.html:144` | `href="/"` home link (main site) |
| external: WordPress posts, iPad home-screen icon, shared `?avatar=` / `creator/?r=` links | old URLs |

### 2c. Same-origin state shared with neighbours (survives; keep names)
- `sjoskolan/simulatorer/browser-tests/room.spec.mjs:9,32`, `sjoskolan/simulatorer/session.test.mjs:6,17` assert they never touch `johansson-town-avatar` — still meaningful (same origin).
- Studio keys (`nj-avatar-studio-v1`, `nj-studio-scene-v1`, `nj-studio-snap`, `johansson-studio-*`) are origin-wide; not World's.

### 2d. Site-repo meta files naming World
- `.github/workflows/johansson-town-live.yml` (whole file): triggers on `johansson-town/**`, tests in `johansson-town/`, runs `avatar-creator/tests`, copies both folders onto main.
- `.mcp.json:3-5`; `CLAUDE.md:115-186` (World/Studio words, publishing, Johansson Town rules, paths `johansson-town/src/feed/`, `src/commerce/merchandising.js`, `briefs/NEXT.md`, MCP name); `.claude/agents/set-designer.md:15,28,32`, `street-designer.md:30`, `gag-writer.md` (World agents, refer to `remotion/CAST.md`).
- `LICENSE.md:50,52` (`johansson-town/assets/workshop/LICENSE.txt`, `assets/audio/LICENSE.txt`); `THIRD_PARTY_NOTICES.md:37-54,92` (the "Johansson Town and related 3D scenes" table) → the new repo needs its own LICENSE + notices, and the site's files must link to the new repo.
- `progress.md` (lines 245-399): history, leave.

### 2e. Studio repo `/home/user/jojo` (dev-time; expects `../nj22az.github.io/johansson-town`)
- `remotion/tools/sync-town.sh:4,7` (copies World's avatar/render/world code into the film), `remotion/tools/room-colliders.mjs:5,11`, `remotion/tools/capture-office.mjs:5,26,29`, `capture-room.mjs:67,69,216`, `capture-workshop.mjs:6,27,30` (serve a site checkout; open `/johansson-town/?audit`; set `johansson-town-clock`), `remotion/public/backdrops/onsen-set/colliders.json:3`.
- `town-studio/townstudio/town.py:14,21-27` (`TOWN_FOLDER='johansson-town'`, finds a `nj22az.github.io` clone), `assets.py:20,37,189,388-401,455` (publishes into `<site>/johansson-town/assets/catalog/`), `server.py:4` (serves the site clone, World at `/johansson-town/`), `headless.py:42`, `mcp_server.py:32`, `app.py:181`.
- `town-studio/modeller/build.js:5-6,34`, `export.js:9,17` (`/johansson-town/tools/vendor/GLTFExporter.js`), `look.js:6-8`, `modeller/tools/keep-clear.mjs:17`; tests `town-studio/tests/test_assets.py:73-74,113-114,171-172`.
- `art/pencil/pose.mjs:1,6` (World's `node_modules/playwright` by absolute path; `/johansson-town/tools/pamphlet-pose.html`), `town-studio/evidence/*.mjs:1`, `quality/story_engine.py:47`, `content/onsen-breaker/card*.json:9`.
- Simplest compatible fix: one variable for "the World checkout" (`TOWN`/`TOWN_SITE` exist already) pointing at the `johansson-world` clone, and the local servers mount it at a fixed `/johansson-world/` (or keep `/johansson-town/` as the local mount name everywhere).

## 3. Service worker and the installed iPad app

Today: SW `/johansson-town/sw.js`, scope `/johansson-town/`, caches `johansson-town-<20-hex>`, network-first for
navigations (`cache:'no-store'`), stores every OK same-scope GET (≤512 entries), serves the cached home page
offline. The iPad icon's id/start_url/scope are `/johansson-town/`.

After the move, for anyone who already has the old SW (Safari or the icon):
- Online: the old SW passes the navigation to the network, receives the stub, caches it and shows it; the stub
  sends the player to `/johansson-world/` (out of the old scope; the new page registers its own SW there).
- Offline: the old SW serves its cached copy (now the stub, or the old game shell whose runtime chunks may be
  partly cached) — stale, not harmful.
- The browser re-checks `/johansson-town/sw.js` on navigations. If that URL 404s the update fails and the old
  registration **stays** (a 404 does not unregister). So publish a **kill-switch `sw.js`** at
  `/johansson-town/sw.js`: install → `skipWaiting`; activate → delete caches starting `johansson-town-` (safe only
  if the new World uses another prefix), `self.registration.unregister()`, `clients.matchAll()` → `navigate(url)`.
  The stub page can also unregister registrations whose scope path is `/johansson-town/` before redirecting
  (redirect after the promise, not via a 0-second meta refresh).
- Installed app: iOS never updates an installed manifest; the icon keeps opening `/johansson-town/` → stub →
  `/johansson-world/`. Navigating out of the app's scope may show an in-app browser bar on iPadOS. The clean end
  state is a new icon from `/johansson-world/`, **but that icon has its own empty storage**: export the save first
  (or keep using the old icon). Chrome/Android: new manifest id ⇒ a separate installed app; the old one keeps
  working through the stub.
- Stubs needed on main (`johansson-town/`): `index.html` and `creator/index.html` (both
  `location.replace('/johansson-world/…'+location.search+location.hash)`, preserving `?avatar=`, `?r=`, `?audit`,
  `#…`), `sw.js` (kill-switch). Optional: a site-root `404.html` mapping `/johansson-town/<rest>` →
  `/johansson-world/<rest>` (and `/avatar-creator/…`, `/thuans-storage/…`, `/motor-90l/…`) for deep page links.
  Nothing can redirect module/JSON/GLB requests — see §2a.

## 4. Publishing: what the new repo must build and upload

Current workflow (`johansson-town-live.yml`): push to the work branch → `npm ci` → `tests/live-features.test.mjs` →
`npm test` (includes `tests/runtime-package.test.mjs`, which only *checks* that the committed `runtime/` and
`index.html` hashes match `src/`; it does not build) → Studio tests from the site root → copy `johansson-town/` +
`avatar-creator/` onto main (guarded against main-only edits). Classic Pages then serves **all 238 MB** of the
folder, including `docs/`, `tests/`, `output/`, `art/` (e.g. `/johansson-town/docs/FERRY-AUDIT.md` and
`/johansson-town/tests/fixtures.mjs` return 200 live).

Nothing is built in CI: `runtime/` (Vite bundle), the `?h=` hashes in `index.html`/`creator/index.html`,
`runtime/source.json` and `sw.js`'s `VERSION` are produced locally by `npm run build:runtime` and committed.
`dist/` (`npm run build`, ignored) is not what is published.

Tracked size at HEAD, by folder: assets 76.7 MB · docs 63.3 · art 42.2 · tests 22.1 · output 20.4 · runtime 6.2 ·
src 4.0 · vendor 1.4 · tools 0.7 · root files 0.7 · guide 0.1 · briefs 0.1 · scripts/creator/data ≈0 = 238 MB.
Largest blobs: `assets/models/izakaya/minato-interior.glb` 10.3 MB, `assets/figurines/thuan/thuan-realistic.glb`
9.6 MB (nothing near GitHub's 100 MB limit at HEAD; history not checked — shallow clone).

**Runtime (must be served):** `index.html`, `creator/`, root `*.css` (9), root `*.js` (activities, content-data,
content-items, inspect-3d, landing, loading-facts, physics, prop-factory, pwa, resident-guide, resource-catalog,
title-menu, title-sky, touch-ui, webmcp, webmcp-characters — all part of the raw source graph), `sw.js`,
`manifest.webmanifest`, `runtime/` (incl. `.vite/manifest.json`, harmless), `assets/`, `src/` (raw: title menu,
creator page, Studio, Thuan's Storage, motor workshop), `vendor/`, `tools/vendor/GLTFExporter.js` (raw
`src/avatars/export.js`), `data/world-placements.json`, licence files (`LICENSE-*.txt`, `assets/**/ATTRIBUTION.md`,
`assets/**/LICENSE.txt`). ≈ 89 MB. Plus `thuans-storage/` (15 MB) and `motor-90l/` (1.1 MB) if they move in.
**Workshop (repo only):** `docs/`, `tests/`, `output/`, `art/`, `briefs/`, `guide/` (source of the generated
`resident-guide.js`), `tools/` (except `tools/vendor/`), `scripts/`, `package*.json`, `vite.config.js`, `*.md`.
(`tools/pamphlet-pose.html`, `tools/avatar-preview.html` are used by jojo through a *local* server only.)

Suggested `nj22az/johansson-world/.github/workflows/pages.yml`: on push to `main` (+ `workflow_dispatch`);
`test` job = `npm ci --ignore-scripts`, `node --test tests/live-features.test.mjs`, `npm test` (motor test fixed
first); `deploy` job = copy the runtime set into `_site/`, `actions/upload-pages-artifact`, `actions/deploy-pages`
(permissions `pages: write`, `id-token: write`). The creator must set Settings → Pages → Source = "GitHub Actions"
(Claude gets 403 on the Pages API). Alternative with no build: Pages "deploy from branch main /(root)" plus a
`.nojekyll` file — serves the workshop folders too, exactly like today. Either way, Studio's cross-repo test
(today run inside this workflow) has to move to the Studio repo, checking out `nj22az/johansson-world` beside it.

## 5. Must move with World (into `nj22az/johansson-world`)
- Everything in `johansson-town/` (repo root), including untracked in-flight work once landed: `src/studio/`,
  `tools/studio/`, `data/studio/`, `src/avatars/{fun-poses,looks,looks-data}.js`, new tests.
- `.mcp.json` entry `johansson-town-audit` (path → `tools/mcp/server.mjs`).
- `.claude/agents/{set-designer,street-designer,gag-writer}.md`.
- The World sections of `CLAUDE.md` (115-186) → World's own `CLAUDE.md` (the site CLAUDE.md keeps a pointer).
- A replacement for `.github/workflows/johansson-town-live.yml` (World half).
- World rows of `THIRD_PARTY_NOTICES.md` (37-54, 92) and the relevant `LICENSE.md` paragraphs.
- **Recommended:** `thuans-storage/` (only entry point is World; imports World's `src/dungeon/pretend.js`;
  returns to World; reads/writes World's `johansson-town:storage-*` keys; World's `tests/storage-boss.browser.mjs`
  tests both) — with a `/thuans-storage/` stub on main.
- **Recommended:** `motor-90l/` (workshop imports World's avatar builder and three; World's GLB and
  `npm test` hash its `motor.js`/`calc.mjs`; only linked from World's workshop bench; Sjöskolan only mentions it
  in `sjoskolan/simulatorer/PLAN-ERIK.md:37,41` and a comment in `character/erik.js:3`) — with `/motor-90l/` and
  `/motor-90l/workshop/` stubs on main. If it goes to Sjöskolan instead, World must vendor the motor source or
  drop the hash test, and the workshop must import `/johansson-world/src/avatars/build.js` cross-repo.

## 6. Stays on the main site, but must change in the split commit
`johansson-town/` → stubs (index, creator/, kill-switch sw.js); delete `johansson-world/` (branch only);
`mizuhama-1988/index.html`; `config.js:84`; `sitemap.xml:14`; `blog/the-torn-poster/index.html:82`;
remove `johansson-town-live.yml` (or cut it down to Studio-only until Studio moves); `.mcp.json`; `CLAUDE.md`;
`LICENSE.md`/`THIRD_PARTY_NOTICES.md`; Sjöskolan simulators' three.js imports (or in the Sjöskolan repo);
`thuans-storage/` and `motor-90l/` (if they stay: repoint imports, rebuild Storage bundle).
`form-3d-studio/` stays (World only iframes it and has a one-off generator script importing it).

## 7. Order that avoids a broken moment
1. Land the in-flight World/Studio agents' work; freeze `johansson-town/` and `avatar-creator/` on the branch.
2. Creator creates the empty public repos. Populate `johansson-world` (history-preserving extraction needs the full
   1.6 GB history — not possible in a ~560 MB-free container; do it in a GitHub Actions job in the new repo with
   `git filter-repo --subdirectory-filter johansson-town` (+ `--path` renames for thuans-storage/motor-90l), or
   import the tree without history). Fix the motor test path, output paths, local-server mount, README, sw.js
   cache prefix, `.mcp.json`, CLAUDE.md, and the links in §1a. Enable Pages; check `/johansson-world/` live.
3. Same for Studio (`/johansson-studio/`), now importing `/johansson-world/…`; check it on the iPad.
4. Repoint Sjöskolan simulators (own three copy) — verify the simulator pages still load.
5. One commit on the site (via the branch, workflow removed in the same commit): stubs + deletions + link updates.
   Verify `/johansson-town/`, `/johansson-town/creator/?r=…`, `/avatar-creator/`, `/thuans-storage/`,
   `/motor-90l/workshop/`, the simulator pages, and the old iPad icon.
6. Update jojo's `TOWN`/`TOWN_SITE` defaults and local servers.
