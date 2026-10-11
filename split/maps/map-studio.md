# Johansson Studio split map (avatar-creator/ → nj22az/johansson-studio, served at /johansson-studio/)

Mapped 2026-10-11, read-only, from the working tree of `/home/user/nj22az.github.io` (branch
`claude/sjoskolan-youtube-strategy-gofi3o` at 553ade6e, plus the uncommitted work other agents have in progress) and
`/home/user/jojo` (main at 54c06e5). World is assumed to move to nj22az/johansson-world, with its files at the repo
root, served at /johansson-world/.

Evidence files next to this one:
- `studio-import-graph.json`: the static import graph from `avatar-creator/studio.js` (static and literal dynamic imports), made by `studio-import-trace.mjs`.
- `studio-import-graph-agent.json`: the same graph from `studio-api.js` (the `?agent` page).
- `studio-runtime-requests.json` / `studio-runtime-trace.log`: every file headless Chromium requested when it opened
  Studio, entered Build scene and picked each of the 12 locations, made by `studio-runtime-trace.mjs`. There were no page errors.
- `studio-world-files.tsv`: the full list of World files Studio needs, with sizes and the first step that needs each one (also in the appendix below).

## 1. Answer to the design question

**Recommendation: (b), a pinned copy of World. Studio's deploy workflow assembles it from a recorded World commit.
It is not committed to Studio's git history.** An automatic "bump" keeps Studio a few minutes behind World and never
broken by it.

Evidence:

1. **Studio uses a large part of World's raw source.** Studio needs 273 World JS modules plus 2 World CSS files, 4.7 MB
   in all (from `studio.js`, 286 modules in total, 276 of them World's). Opening the page loads the whole town graph,
   because `studio.js` statically imports `scene.js`, which imports `scene-world.js`, then `src/world/town.js` and
   everything under it. Across all 12 locations Studio also loads 41 World asset files, 29.4 MB (section 4).
2. **World's own site does not use that source.** World's `index.html` boots the Vite bundle in `runtime/` (hashed
   chunks, made by `scripts/build-runtime.mjs`). The raw `src/` tree is online only because Pages publishes the whole
   folder. With option (a), 273 module paths and their exports, and about 41 asset paths, would become an API that a
   separate site depends on.
3. **Studio and World change together often.** 4 of the 14 commits that touched `avatar-creator/` (shallow history
   since 2026-09-24) also changed World: `src/avatars/creator.js`, `line-ui.css`, `index.html`, `sw.js`. The work in
   progress now does the same:
   - It changes `src/avatars/animate.js`, `cast.js` and `src/photo/layout.js` at the same time as Studio files.
   - It adds `src/studio/*`, `data/studio/*` and `tools/studio/*` inside World for Studio.
   - With two repos and (a), each coupled change must reach World's live site first and stay backward compatible.
     Studio would be broken between the two pushes, or World's CI would have to run Studio's tests. The second choice
     deadlocks when the Studio fix needs the new World.
   - With (b), the Studio commit that needs the new World also moves the pin, so the change is atomic for Studio.
4. **Pages caching mixes versions.** Every file is served with `Cache-Control: max-age=600` (checked live on
   `/avatar-creator/` and `/johansson-town/src/avatars/build.js`). With (a), a Studio session that starts while World
   deploys can get modules from two World versions. World avoids this for itself with hashed `runtime/` chunks. With
   (b), the World copy changes only when Studio deploys, and a deploy-time bundle can hash it as well.
5. **Studio's planned role needs a World it controls.** NEXT.md §5/§6 (the asset modeller and "Mario Maker for
   Johansson World") and the work-in-progress Studio MCP (`tools/studio/*`: draft looks, then "update World" as a
   separate step) all show unpublished Studio data inside World's renderer. "Nothing goes live without the creator
   choosing it."
   - (b) gives Studio its own World copy, with drafts on top.
   - "Update World" becomes an explicit commit or PR in johansson-world, followed by a pin bump.
6. **Disk and size are fine.**
   - Studio's git repo stays small (624 KB today) because World files are not committed.
   - The Pages artifact is about 40 MB with the needed subset, or about 85 MB with all of World's `assets/` (77 MB on disk).
     Pages allows 1 GB.
   - Local sessions get World with a sparse, shallow fetch: about 5 MB of code plus the assets they need.

Costs of (b), stated plainly:
- An iPad that uses both apps downloads the shared textures and models twice, at most about 29 MB. The JS was never
  shared, because World runs its `runtime/` bundle.
- World's third-party asset licences must travel with the copy: `LICENSE-*.txt`, `RESOURCE_SOURCES.md`,
  `assets/ATTRIBUTION.md`, and the root `THIRD_PARTY_NOTICES.md`.
- A pin-bump job is needed.

**When (a) is acceptable (live cross-site imports from /johansson-world/):** as a simple first step on split day.
- The import edit is mechanical. `'../johansson-town/'` becomes `'../johansson-world/'`, and the relative imports
  still resolve across sites because both sites sit at the origin root. Checking out the two repos side by side
  (`~/johansson-world`, `~/johansson-studio`) copies the URL layout, so dev servers and node tests keep working.
- It is safe only if johansson-world's publish workflow also checks out johansson-studio and runs Studio's tests
  before publishing, which is what `johansson-town-live.yml` does today.
- Without that gate, any World refactor breaks the live Studio silently.

**(c) is rejected: pinned code with live assets.** World's code would resolve `assets/...` against a base of
`/johansson-world/`. When World renames or replaces an asset, the pinned code points at the wrong file, a "glitch"
under CLAUDE.md's rules. This is only possible if World moves to content-hashed asset names.

### Concrete shape of (b)

- **Repo `nj22az/johansson-studio`:** Studio's files at the root. That means `index.html`, `studio.js`, `scene*.js|mjs`,
  `studio-share.mjs`, `studio-api.js`, `*.css`, `tests/`, `docs/` and `WHERE-TO-EDIT.md`. Add:
  - `world.lock.json`: `{"repo":"nj22az/johansson-world","commit":"<sha>"}`.
  - `tools/get-world.mjs` (or `.sh`): fetches that commit, shallow and sparse, into `./world/`, which is git-ignored.
  - `package.json`: `type: module`, scripts `test` = `node --test tests/*.test.mjs`, devDependencies `playwright@1.61.0`
    and `pngjs@7.0.0` for `tests/studio.browser.mjs`, plus the MCP SDK and zod if the Studio MCP server moves here.
- **Paths inside `world/`** (copy whole folders, not single files, so code paths the trace did not reach still work):
  - Code: `src/`, `vendor/`, `physics.js`, `prop-factory.js`, `resource-catalog.js`, `creator/creator.css`, `line-ui.css`.
  - Download 3D model: `tools/vendor/GLTFExporter.js`.
  - Tests: `tests/fixtures.mjs`.
  - Assets: `assets/`, either all of it or the subset in the appendix.
  - Licences: `LICENSE-*.txt`, `RESOURCE_SOURCES.md`.
- **Edits on split day:**
  - `'../johansson-town/'` becomes `'./world/'` in Studio's root modules.
  - `'../../johansson-town/'` becomes `'../world/'` in `tests/`.
  - `<base href="/johansson-studio/world/">`.
  - `/avatar-creator/` becomes `/johansson-studio/` in the HTML links.
  - Fix the two asset URLs Studio builds itself (section 2, rows S12 and S13).
- **Deploy workflow (Pages source = GitHub Actions):** checkout, `get-world` at the lock, `node --test tests/*.test.mjs`
  (and the browser test), optionally bundle, `upload-pages-artifact`, `deploy-pages`.
- **Bump:** a scheduled and `workflow_dispatch` job reads World's `main` HEAD and tests Studio against it. When green,
  it commits `world.lock.json`, and that commit deploys.
  - A `repository_dispatch` from World's publish job is faster. It needs a token with access to johansson-studio,
    because `GITHUB_TOKEN` cannot dispatch to another repo.
  - A coupled change lands in World first. The Studio commit then carries its code change and the new lock together.
- **Local tools** (Studio MCP page, dev server): serve `world/` from `$WORLD`, defaulting to a sibling
  `../johansson-world` checkout when present, else `./world`. Drafts and unpublished World edits can then be seen in
  Studio before "update World".
- **Bundling** (optional, later): if Studio bundles World at deploy time, `scene-world.js` line 23 imports
  `src/world/izakaya.js?snappy=1`. That loads a second, separate module instance on purpose. `izakaya.js` never reads
  `snappy`. A bundler would dedupe or refuse it, so turn it into an explicit factory first. With bundling, the first
  load of about 275 module requests (4.7 MB) could be split so that Edit character no longer downloads the whole town.

## 2. Every Studio dependency (avatar-creator/ → elsewhere)

Line numbers are from the working tree, which includes the other agents' uncommitted edits.

| # | From | To | Kind | After the split, and the fix |
|---|------|----|------|------------------------------|
| S1 | avatar-creator/index.html:5 | `<base href="/johansson-town/">` | base href | World code builds asset URLs as `new URL('assets/'+path, document.baseURI)` (`src/assets.js:3`, `src/workshop/models.js:8`, `src/world/sakura-flyers.js:5`). Every glb, texture and feed image breaks. Fix: `/johansson-studio/world/` (b) or `/johansson-world/` (a). Every relative URL in the HTML also resolves against the base, which is why Studio's own links are absolute. |
| S2 | avatar-creator/index.html:11 | `https://nj22az.github.io/avatar-creator/` | canonical | Wrong canonical. Change to `/johansson-studio/`. |
| S3 | avatar-creator/index.html:12 | `/assets/images/favicon.svg` | icon (user site root) | Keeps working because the user site keeps it. Optionally give Studio its own icon. |
| S4 | avatar-creator/index.html:13 | `/johansson-town/assets/icons/town-192.png` | apple-touch-icon | 404 once World moves, and the iPad home-screen icon art is lost. Change to `world/assets/icons/town-192.png` under base (b) or `/johansson-world/assets/icons/town-192.png` (a). Better: a Studio icon in the Studio repo. |
| S5 | avatar-creator/index.html:17-18 | `/johansson-town/creator/creator.css`, `/johansson-town/line-ui.css` | World CSS | 404 and the page is unstyled. Point them at the World copy (b) or `/johansson-world/...` (a). Neither file has `url()` references. |
| S6 | avatar-creator/index.html:19-20,25 | `/avatar-creator/studio.css`, `scene.css`, `studio.js` | own files (absolute) | 404 at the new address. Change to `/johansson-studio/...`. Keep them absolute because of the `<base>`. |
| S7 | avatar-creator/studio.js:1-3 | `../johansson-town/src/avatars/{creator,cast,recipe}.js` | import | Resolves to `/johansson-town/...`, which becomes a redirect stub, so the module fails. Change to `./world/src/...` (b) or `../johansson-world/src/...` (a). |
| S8 | avatar-creator/scene.js:1-7 | World `vendor/three.module.js`, `src/avatars/{build,face,cast,recipe}.js`, `src/ui/icons.js`, `src/photo/layout.js` | import | Same as S7. |
| S9 | avatar-creator/scene-world.js:1-8 | World `vendor/three.module.js`, `src/world/{town,businesses,layout,supplied-rooms,walk-surface}.js`, `src/render/{sky,cel}.js` | import | Same as S7. |
| S10 | avatar-creator/scene-world.js:21-29 | dynamic `import()` of `src/world/interiors/{sakura-interior,sato-ramen,shared-dining-layout,compact-shops,onsen,town-hall}.js`, `src/world/izakaya.js?snappy=1` | dynamic import | Same as S7, and `?snappy=1` must be kept (see Bundling above). |
| S11 | avatar-creator/scene-avatar.js:1-2, scene-catalogue.mjs:5-7, studio-api.js:5-7 (new, untracked) | World `vendor/three.module.js`, `src/avatars/{animate,face,moves,build,recipe}.js` | import | Same as S7. |
| S12 | avatar-creator/scene.js:73 | `img.src=\`../johansson-town/assets/images/feed/${id}.webp\`` | DOM URL relative to the base | This works today only because `../johansson-town/` against base `/johansson-town/` happens to land in the right place. It breaks. Change to `assets/images/feed/${id}.webp`, relative to the new base. |
| S13 | avatar-creator/scene.js:201 | `fetch(new URL('../johansson-town/assets/images/feed/views.json', import.meta.url))` | fetch | 404, so "Locations unavailable". Change to `./world/assets/...` (b) or `../johansson-world/assets/...` (a). |
| S14 | avatar-creator/scene-physics.mjs:3 | comment: a copy of `johansson-town/physics.js` | docs / copied code | Only the comment changes. It is a deliberate copy, so keep it in step by hand. |
| S15 | avatar-creator/studio.js:33 | `shareLink: new URL('./?r='+code, location.href)` and `onClose: location.href='/#projects'` | link | The share link follows the new page URL (`/johansson-studio/?r=`), and `/#projects` stays on the user site. **Old shared links `/avatar-creator/?r=CODE` need a redirect that keeps `location.search` and `location.hash`.** |
| S16 | avatar-creator/studio.js:7,12,16; scene-model.mjs:3; scene.js:19,29,35,76,99 | localStorage `nj-avatar-studio-v1`, `nj-studio-scene-v1`, `nj-studio-snap` | storage key | **Survives.** localStorage belongs to the origin, `https://nj22az.github.io`, not the path, and every project site uses that origin. No key is path-scoped. World modules Studio loads also read World's keys (`johansson-town-avatar`, `johansson-town-players`, `johansson-town-1988-v5`, `johansson-town-resident-wardrobes`, `johansson-appearance-change`, shop-stock keys). These are also origin-wide and unchanged. No IndexedDB, cookies or service worker in Studio. |
| S17 | avatar-creator/studio.js:118 | `?agent` → `import('./studio-api.js')` → `window.__JOHANSSON_STUDIO__` | WebMCP / agent API (work in progress) | Moves with Studio. The page that drives it is World-side (S24-S27). |
| S18 | avatar-creator/studio-share.mjs, scene.js (exports) | file names `johansson-studio-*.png/json`, Web Share or download | export/share | No path dependencies, so nothing changes. |
| S19 | avatar-creator/tests/scene-avatar.test.mjs:3-6 | `../../johansson-town/vendor/three.module.js`, `tests/fixtures.mjs`, `src/avatars/{build,cast}.js` | test import | The tests fail without World. Change to `../world/...` (b) or `../../johansson-world/...` with sibling checkouts (a). |
| S20 | avatar-creator/tests/scene-catalogue.test.mjs:3-4 | `../../johansson-town/src/avatars/{animate,face}.js` | test import | Same as S19. |
| S21 | avatar-creator/tests/scene-world.test.mjs:4-5,10,12 | World `vendor`, `tests/fixtures.mjs`; a fetch shim reading `../../johansson-town/assets/<path after /assets/>`; `views.json` | test import / file reads | Same as S19. The shim and the views read need the World assets on disk. |
| S22 | avatar-creator/tests/studio.browser.mjs:6,70 | `require('playwright')`, `require('pngjs')` (or `CODEX_PRIMARY_RUNTIME_NODE_MODULES`) | node deps | They do not resolve from the folder today (no root `node_modules`). They work only with that env variable. Studio's `package.json` must declare `playwright@1.61.0` and `pngjs@7.0.0`. |
| S23 | avatar-creator/tests/studio.browser.mjs:11,32,187 | serves the repo root; `page.goto(base+'/avatar-creator/')`; `fetch('/avatar-creator/scene.css')` | test URL | Serve a root that holds `johansson-studio/` (and `johansson-world/` for (a)). Change the paths to `/johansson-studio/`. |
| S24 | avatar-creator/WHERE-TO-EDIT.md:1-12 | the work-branch and `johansson-town-live.yml` publishing description | docs | Wrong after the split. Rewrite it: Studio publishes from its own repo, and World is pinned. |
| S25 | avatar-creator/docs/COMIC-MAKER.md:5,29 (`/avatar-creator/`, `johansson-town/src/feed/comic.js`) and :7,11,56,155,203,230,242,274 (`jojo/...`) | docs paths | docs | Update `/avatar-creator/` → `/johansson-studio/` and `johansson-town/` → johansson-world. The `jojo/` paths are unchanged. |
| S26 | avatar-creator/docs/SCENE-WORKSPACE.md:3 | `/avatar-creator/` | docs | Same as S25. |

## 3. Everything else that points at Studio, or that Studio's plumbing lives in

| # | From | To | Kind | After the split, and the fix |
|---|------|----|------|------------------------------|
| W1 | johansson-town/index.html:88 | `<a id="openStudio" href="/avatar-creator/">` | href (World title screen) | Lands on the redirect stub, so it still works. Change it to `/johansson-studio/`. No test covers it. |
| W2 | johansson-town/WHERE-TO-EDIT.md:5,11 | `avatar-creator/` | docs | Rewrite for two repos. |
| W3 | .github/workflows/johansson-town-live.yml:11,39-41,54,63 | `avatar-creator/**`, `node --test avatar-creator/tests/*.test.mjs`, copying `avatar-creator` onto main | CI | Retire it for Studio. Studio's own deploy workflow takes over (section 1). The main site's `avatar-creator/` becomes a redirect stub, and this workflow's "main has avatar-creator changes the branch does not have" guard must not fire on it. |
| W4 | config.js:94 | `url: "/avatar-creator/"` | nav / bento link | Change to `/johansson-studio/`. |
| W5 | sitemap.xml:13 | `https://nj22az.github.io/avatar-creator/` | sitemap | Change to `/johansson-studio/`. Project sites need their own sitemap, or keep it listed here. |
| W6 | CLAUDE.md:121,129 (and jojo CLAUDE.md:9,20,25) | Studio = `avatar-creator/`, World = `johansson-town/` on the work branch | docs | Rewrite: two repos and their addresses. |
| W7 | johansson-world/index.html (exists on the work branch only, not on main; live `/johansson-world/` is 404 today) | meta refresh and `location.replace('/johansson-town/'+search+hash)` | redirect stub | **It points the wrong way.** It must never reach main, and the main site must not keep a `johansson-world/` folder once the project repo serves that path. Its shape (keeps search and hash, canonical, noscript link) is the model for the new `/avatar-creator/` and `/johansson-town/` stubs. |
| W8 | (new) main site `avatar-creator/index.html` | redirect to `/johansson-studio/`+search+hash | redirect | Needed for bookmarks, the iPad home-screen icon and shared `?r=` links. Studio has no manifest or service worker, so a stub is enough. |
| W9 | johansson-town/sw.js:3-5, pwa.js:7 | service worker scope `/johansson-town/`, network-first for navigations, cache prefix `johansson-town-` | service worker (World) | Studio is never controlled by it. Studio's requests for World files come from a page outside that scope, so they are not intercepted. This is noted for the World map: the old worker stays registered at `/johansson-town/`. It fetches navigations from the network, so the redirect stub is served when online. Offline, it may serve the cached old game. The stub could unregister it. |
| W10 | johansson-town/tools/mcp/static-server.mjs:8-30 (uncommitted change) | `serveGame({root, mounts:['johansson-town','avatar-creator']})` | MCP / test server | Mounts top-level folders of one repo. Two repos need two roots, e.g. `mounts:{'johansson-world':WORLD,'johansson-studio':STUDIO}`. |
| W11 | johansson-town/tools/studio/page.mjs:3,17,25 (new) | opens `avatar-creator/?agent` from `CODE_ROOT` (the site repo root) | MCP (headless Studio page) | Breaks. It belongs with Studio and must find a World checkout (`$WORLD`, a sibling, or `world/`). |
| W12 | johansson-town/tools/studio/server.mjs, tools.mjs, cli.mjs, smoke.mjs, apply.mjs, build-data.mjs, repo.mjs (new, untracked) | MCP server named `johansson-studio`, using World's `node_modules` (`@modelcontextprotocol/server`, zod, playwright) | MCP | **Decide where it lives** (open question). |
| W13 | johansson-town/tools/studio/repo.mjs:17,24-33; tools.mjs:33,147,175,193,209,215 | writes `johansson-town/data/studio/{looks,products,log,brand-rules}.json`, `johansson-town/src/avatars/looks-data.js`, `johansson-town/src/commerce/products-data.js`; reads `johansson-town/guide/residents.json`; runs `git status -- johansson-town avatar-creator .mcp.json` | file paths | All of them assume one repo whose root holds both folders (`CODE_ROOT` is three folders up). Fix: remove the `johansson-town/` prefix (World root), take the World root from configuration, and run git per repo. |
| W14 | johansson-town/src/studio/{ops,rules,change,sha256}.js (new) | imported by `tools/studio/*` and World tests, and planned for the Studio page (ops.js: "every change the iPad, the page's agent API (WebMCP) or Claude makes") | shared code | rules.js imports World's `avatars/looks.js`, `cast.js`, `recipe.js` and `people/profiles.js`. **Decide which repo owns it.** Suggestion: the data (`data/studio/*.json`), `looks.js`, the generated `looks-data.js`, `sha256.js` and `build-data.mjs --check` stay in World (World's CI verifies them). ops, rules, change and the MCP/CLI tools go to Studio and import World from its copy. |
| W15 | johansson-town/tests/studio-apply.test.mjs, studio-data.test.mjs, studio-mcp.test.mjs, looks-data.test.mjs (new) | `tools/studio/*`, `src/studio/*`; studio-mcp spawns the MCP server, whose renders open the Studio page | tests | World's `npm test` would depend on Studio. Move the MCP and page tests to Studio, and keep the data tests in World. |
| W16 | johansson-town/src/avatars/looks-data.js:2 (new) | comment: "johansson-studio tools (avatar-creator/docs/STUDIO-MCP.md)" | docs | Update the path. STUDIO-MCP.md does not exist yet. |
| W17 | .mcp.json:3-6 | `johansson-town-audit`: `node johansson-town/tools/mcp/server.mjs` | MCP config | Becomes `node tools/mcp/server.mjs` in johansson-world. The planned `johansson-studio` entry goes in johansson-studio's `.mcp.json`, and needs a World path. |
| W18 | johansson-town/assets/figurines/thuan/provenance.json:21 | the word "avatar-creator" | data text | Harmless, and can be renamed. |

## 4. World files Studio needs (follow the import graph, then measured at runtime)

Static import graph from `studio.js`: 286 modules (`studio-import-graph.json`). 10 of them are Studio's (130 KB) and
276 are World's (4.67 MB). There are no bare specifiers, so no npm package is used at runtime. No module path is built
dynamically, except asset URLs.

Measured in headless Chromium, which opened the page, then Build scene, then each of the 12 locations:
**337 files, 32.6 MiB**. Studio's own share is 13 files, 0.16 MiB.

| World part | Files | Size | Notes |
|------------|-------|------|-------|
| `src/world/**` | 180 | 1.9 MB | `town.js` and everything under it, plus the interiors, loaded when a location is chosen |
| `vendor/three.module.js` | 1 | 1.31 MB | |
| `src/avatars/**` | 32 (+2 static only) | 0.85 MB | `export.js` and `face-morphs.js` load only for "Download 3D model" |
| `src/people/**` | 18 | 142 KB | |
| `vendor/GLTFLoader.js`, `BufferGeometryUtils.js`, `SkeletonUtils.js` | 3 | 151 KB | |
| `tools/vendor/GLTFExporter.js` | 1 (static only) | 82 KB | Download 3D model only, via `src/avatars/export.js` |
| `src/commerce`, `src/render`, `src/office`, `src/audio`, `src/workshop`, `src/ui`, `src/photo`, `src/save.js`, `src/town-clock.js`, `src/assets.js` | 36 | 0.2 MB | `town-audio.js` is imported, but Studio requested no `.wav` |
| `physics.js`, `prop-factory.js`, `resource-catalog.js` (World root) | 3 | 14 KB | imported by `src/world/town-power.js`, `town.js` and `prop-factory.js` |
| `creator/creator.css`, `line-ui.css` | 2 | 37 KB | `<link>` in index.html |
| **Code total** | **278** | **4.7 MB** | 275 requested at runtime, plus 3 for Download 3D model |
| `assets/models/**` | 9 | 16.2 MB | `minato-interior.glb` is 10.9 MB; also barfly, merry_Moose, maneki-neko, umi-no-yu, benches, potted plant, houseboat hull |
| `assets/figurines/thuan/thuan-display.glb` | 1 | 5.2 MB | Sakura |
| `assets/materials/*` and the root `timber.jpg` and `roof.jpg` | 8 | 4.7 MB | outdoor town |
| `assets/graphics/{konbini,izakaya}/**` | 8 | 1.5 MB | |
| `assets/food/island-icecream.png` | 1 | 1.26 MB | |
| `assets/images/feed/*.webp` and `views.json` | 13 | 0.47 MB | location pictures and camera presets |
| `assets/papers/sakura-flyer.svg` | 1 | 6.5 KB | |
| **Asset total** | **41** | **29.4 MB** | `harbour`, the default location, needs about 6.2 MB of them (editor phase) |
| `tests/fixtures.mjs` | 1 | 3.7 KB | tests only (`installDOM`), no imports |

Assets the reached code can request but the trace did not, because they stream in near the player or depend on a
mode: `models/props/vending-machine.glb`, `models/props/motor-90l-display.glb`, `models/owned/*`, `assets/audio/*.wav`,
`assets/video/izakaya-ad.{mp4,jpg}`, `assets/workshop/*.json`, `assets/magazines/*`, other `assets/food/island-*.png`
and `materials/oga-bamboo*`. **So copy whole folders for (b)**: World's `src/` (5.1 MB), `vendor/` (1.5 MB) and
`assets/` (77 MB). Or at least the asset folders named here. Do not copy single files.

The work-in-progress agent page (`studio-api.js`) adds no World files beyond these (`studio-import-graph-agent.json`).

## 5. jojo (studio repo) tools that read World or Studio paths

No jojo code reads `avatar-creator/`. All of it targets World inside the site clone, through the `johansson-town/`
prefix, a sibling `nj22az.github.io` folder or `/home/user/nj22az.github.io`. Only docs mention Studio's address.

| # | From | To | Kind | After the split, and the fix |
|---|------|----|------|------------------------------|
| J1 | remotion/tools/sync-town.sh:4,7 | `TOWN` defaults to `$HERE/../../nj22az.github.io/johansson-town`, and it reads `$TOWN/src/...` | tool path | The default path disappears. Default to `../../johansson-world` (the World repo root). `src/` inside is unchanged. |
| J2 | remotion/tools/room-colliders.mjs:5,11 | `TOWN` defaults to `../../nj22az.github.io/johansson-town` | tool path | Same as J1. |
| J3 | remotion/tools/capture-room.mjs:46,57,69,216; capture-office.mjs:5,29; capture-workshop.mjs:6,30 | `SITE` = a site checkout; `goto /johansson-town/?audit&visual-audit`; `import('/johansson-town/vendor/three.module.js')`; localStorage `johansson-town-clock` | tool path / URL | The server root must expose World at `/johansson-world/` (a parent folder holding the `johansson-world` checkout), and the URLs change. The storage key is unchanged. |
| J4 | town-studio/townstudio/town.py:14,15,21-32,44,76,112,151,174-176,187,199 | `TOWN_FOLDER='johansson-town'`, `BRANCH='main'`, finds the `nj22az.github.io` clone, commits only `johansson-town/`, pushes `HEAD:main` of the site repo, placements at `johansson-town/data/world-placements.json` | tool path / git publish | Must point at a johansson-world clone with World at the root: `TOWN_FOLDER=''`, the "outside town" check becomes moot, and it pushes to johansson-world `main`. Note that it pushes to main directly, unlike CLAUDE.md's work-branch flow. Decide World's live branch. |
| J5 | town-studio/townstudio/server.py:4,20,177 | serves the site clone at `/`, with World at `/johansson-town/` | local server | Serve World at `/johansson-world/`, and Studio at `/johansson-studio/` if the web Studio is wanted locally. |
| J6 | town-studio/townstudio/assets.py:20,37,189,195,399-402,455 | `CATALOG='johansson-town/assets/catalog'`, `--site <nj22az.github.io folder>`, `site/'johansson-town'` | asset publish | Change to `assets/catalog` in the World clone, and `--site` becomes `--world`. This is "build assets in Studio, assemble them in World", so it becomes a commit or PR to johansson-world. |
| J7 | town-studio/townstudio/headless.py:42, mcp_server.py:32, app.py:181, build_page.py:3 | `TOWN_SITE` = the `nj22az.github.io` folder | env / messages | Rename to a World checkout (e.g. `WORLD`). |
| J8 | town-studio/modeller/build.js:5,6,34; export.js:9,17; look.js:6-8 | absolute imports `/johansson-town/vendor/{three.module,BufferGeometryUtils,GLTFLoader}.js`, `/johansson-town/tools/vendor/GLTFExporter.js`, `/johansson-town/src/render/{cel,ink-pipeline}.js` | import (browser) | Change to `/johansson-world/...` under townstudio's server. When the modeller moves into the web Studio (town-studio/progress.md:95, the "Make model" workspace), it imports World through Studio's `world/` copy. |
| J9 | town-studio/modeller/tools/keep-clear.mjs:5,17 | `TOWN` defaults to `../../nj22az.github.io/johansson-town` | tool path | Same as J1. |
| J10 | town-studio/evidence/{build-mouse,builder-live,home-decorating}.mjs:1,6-7 | `import ... from '/home/user/nj22az.github.io/johansson-town/node_modules/playwright/index.mjs'`; `http://127.0.0.1:8765/johansson-town/` | import / URL | These are historical evidence scripts. Update them or leave them as records. |
| J11 | town-studio/tests/test_assets.py:73-74,113-114,129,171-172 | a fake site with a `johansson-town/` folder, `src/build/catalogue.js` | test | Follows J6. |
| J12 | art/pencil/pose.mjs:1,6; art/pencil/README.md:6; comic.py:170 | playwright from `/home/user/nj22az.github.io/johansson-town/node_modules`; `127.0.0.1:8765/johansson-town/tools/pamphlet-pose.html` | import / URL | Change to the World clone's `node_modules` and `/johansson-world/tools/pamphlet-pose.html`. |
| J13 | quality/story_engine.py:47 | `ROOT.parent/'nj22az.github.io'/f` for paths starting with `johansson-town/` | file path | Change to `ROOT.parent/'johansson-world'`, with the prefix removed. |
| J14 | remotion/src/town/README.md:4 (synced "at commit 281a36bd"), remotion/src/town/*.js:1-2, remotion/src/noren.ts:16 | `johansson-town/src/...` provenance comments | docs | Paths become World-relative. A history-preserving split with filter-repo **rewrites commit SHAs**, so the cited SHAs no longer exist in johansson-world. |
| J15 | remotion/mcp/server.mjs:24,135; remotion/mcp/README.md:53,67 | an MCP server named **`johansson-studio`** (the Shorts film studio) | MCP name | **Name collision** with the new Studio MCP server (W12, also `johansson-studio`). Rename one of them, e.g. `johansson-shorts`. |
| J16 | content/COMIC-MAKER.md:8,10,133,207; town-studio/progress.md:68,95 | `nj22az.github.io/avatar-creator/`, `avatar-creator/docs/COMIC-MAKER.md` | docs | Change to `nj22az.github.io/johansson-studio/` and `johansson-studio/docs/COMIC-MAKER.md`. |
| J17 | jojo .claude/agents/{set-designer,street-designer}.md, .claude/skills/{comic-layout,film-director}/SKILL.md | `johansson-town/...`, the "site repo" | docs | Update to johansson-world. |
| J18 | studio/material.py:9,24 (Sjöskolan, not Studio) | `../nj22az.github.io/sjoskolan` | tool path | For the Sjöskolan map: becomes a sibling `sjoskolan` checkout. |

## 6. Move list (Studio repo contents)

Move to nj22az/johansson-studio:
- `avatar-creator/index.html`, `studio.js`, `studio.css`, `scene.js`, `scene.css`, `scene-avatar.js`,
  `scene-world.js`, `scene-catalogue.mjs`, `scene-controls.mjs`, `scene-model.mjs`, `scene-physics.mjs`,
  `scene-snap.mjs`, `studio-share.mjs`, `studio-api.js`.
- `avatar-creator/tests/*`.
- `avatar-creator/docs/*` (COMIC-MAKER.md, SCENE-WORKSPACE.md, apk-character-study.md and two PNGs).
- `avatar-creator/WHERE-TO-EDIT.md` (rewritten).
- Probably the Studio side of the work-in-progress MCP: `johansson-town/tools/studio/{server,tools,cli,smoke,page}.mjs`,
  `src/studio/{ops,rules,change}.js`, and the MCP and page tests. Decide this before the move (W12-W15).

Stays on the main site:
- An `avatar-creator/index.html` redirect stub to `/johansson-studio/` that keeps `?r=` and the hash.
- The links in `config.js` and `sitemap.xml`, updated.

## 7. Open questions

1. **Which repo owns the Studio MCP and the change tools** (`tools/studio/*`, `src/studio/*`, `data/studio/*`,
   generated `looks-data.js`)? They are being written now, inside World, with paths rooted at the site repo.
2. Can World's publish workflow notify Studio for a fast pin bump? That needs a repo-scoped token secret in
   johansson-world. Otherwise Studio polls on a schedule.
3. Is a split with history wanted? filter-repo rewrites SHAs, which breaks provenance SHAs like 281a36bd and the
   `rev-list` logic in the publish workflow. A fresh import without history is simpler, given the 1.6 GB history and
   the small cloud disks.
4. GitHub Pages precedence: when johansson-world or johansson-studio has Pages enabled, it should take over that path
   from the user site, as nj22az/stepbuddy already does at `/stepbuddy/`. Verify this, and keep no same-named folder
   on the user site.
5. Should Studio get its own icon and manifest, so the iPad home-screen icon no longer borrows World's `town-192.png`?
6. Should the stubs at `/johansson-town/` and `/avatar-creator/` also unregister World's old service worker and its
   `johansson-town-*` caches? The World map owns this, but it affects the old bookmark path.

## Appendix: the full list of World files Studio needs (from studio-world-files.tsv)

The first column is the path as served today (`/johansson-town/...`). The third is the first step that requested it:
`editor` (opening the page and entering Build scene, with the default location `harbour`), a location, or
`static-graph-only`.

```
path	bytes	first_needed_by
/johansson-town/assets/figurines/thuan/thuan-display.glb	5171572	location:sakura
/johansson-town/assets/food/island-icecream.png	1262395	editor
/johansson-town/assets/graphics/izakaya/minato-lanterns.webp	88766	location:minato
/johansson-town/assets/graphics/izakaya/minato-tori.webp	97074	location:minato
/johansson-town/assets/graphics/izakaya/shiomachi-sake.webp	73744	location:minato
/johansson-town/assets/graphics/konbini/packaging-atlas.webp	550814	location:sakura
/johansson-town/assets/graphics/konbini/packaging-groceries.webp	491278	location:sakura
/johansson-town/assets/graphics/konbini/thuan-labels/golden-tea.webp	59080	location:sakura
/johansson-town/assets/graphics/konbini/thuan-labels/night-shift.webp	39160	location:sakura
/johansson-town/assets/graphics/konbini/thuan-labels/stick-bites.webp	107760	location:sakura
/johansson-town/assets/images/feed/books.webp	41172	location:sakura
/johansson-town/assets/images/feed/garden.webp	44204	location:sakura
/johansson-town/assets/images/feed/harbour.webp	23688	location:sakura
/johansson-town/assets/images/feed/minato.webp	24720	location:sakura
/johansson-town/assets/images/feed/onsen.webp	27018	location:sakura
/johansson-town/assets/images/feed/park.webp	23210	location:sakura
/johansson-town/assets/images/feed/pier.webp	17204	location:sakura
/johansson-town/assets/images/feed/rainflower.webp	21364	location:sakura
/johansson-town/assets/images/feed/sakura-street.webp	54846	location:sakura
/johansson-town/assets/images/feed/sakura.webp	59834	location:sakura
/johansson-town/assets/images/feed/sato-ramen.webp	22168	location:sakura
/johansson-town/assets/images/feed/town-hall.webp	21118	location:sakura
/johansson-town/assets/images/feed/views.json	90069	editor
/johansson-town/assets/materials/plaster-arm.jpg	713786	editor
/johansson-town/assets/materials/plaster-nor_gl.jpg	1041406	editor
/johansson-town/assets/materials/roof-arm.jpg	205773	editor
/johansson-town/assets/materials/roof-nor_gl.jpg	533448	editor
/johansson-town/assets/materials/timber-arm.jpg	528272	editor
/johansson-town/assets/materials/timber-nor_gl.jpg	681552	editor
/johansson-town/assets/models/harbour/fujita-houseboat-hull.glb	83888	editor
/johansson-town/assets/models/izakaya/minato-interior.glb	10850096	location:minato
/johansson-town/assets/models/onsen/umi-no-yu.glb	1070496	location:garden
/johansson-town/assets/models/owned/barfly.glb	1168300	location:minato
/johansson-town/assets/models/owned/maneki-neko-display.glb	1083720	location:sakura
/johansson-town/assets/models/owned/merry_Moose.glb	1321204	location:town-hall
/johansson-town/assets/models/park/harbour-bench.glb	67964	location:sakura-street
/johansson-town/assets/models/street/potted-plant.glb	420756	location:rainflower
/johansson-town/assets/models/street/sakura-bench.glb	161096	location:sakura-street
/johansson-town/assets/papers/sakura-flyer.svg	6501	editor
/johansson-town/assets/roof.jpg	416642	editor
/johansson-town/assets/timber.jpg	599581	editor
/johansson-town/creator/creator.css	380	editor
/johansson-town/line-ui.css	36483	editor
/johansson-town/physics.js	1909	editor
/johansson-town/prop-factory.js	9281	editor
/johansson-town/resource-catalog.js	2965	editor
/johansson-town/src/assets.js	255	editor
/johansson-town/src/audio/school-chime.js	707	editor
/johansson-town/src/audio/soundscape.js	3558	editor
/johansson-town/src/audio/town-audio.js	16265	editor
/johansson-town/src/avatars/actors.js	13929	editor
/johansson-town/src/avatars/animate.js	124374	editor
/johansson-town/src/avatars/bicycle-pose.js	2646	editor
/johansson-town/src/avatars/body-language.js	6224	editor
/johansson-town/src/avatars/braid-path.js	525	editor
/johansson-town/src/avatars/build.js	135517	editor
/johansson-town/src/avatars/cast.js	23745	editor
/johansson-town/src/avatars/consume.js	8614	editor
/johansson-town/src/avatars/contrast-polo-mesh.js	18484	editor
/johansson-town/src/avatars/creator.js	77331	editor
/johansson-town/src/avatars/face-objects.js	5827	editor
/johansson-town/src/avatars/face-position.js	1260	editor
/johansson-town/src/avatars/face.js	47038	editor
/johansson-town/src/avatars/foot-ground.js	6396	editor
/johansson-town/src/avatars/fun-poses.js	9211	editor
/johansson-town/src/avatars/gait.js	5582	editor
/johansson-town/src/avatars/garment.js	16295	editor
/johansson-town/src/avatars/head-profile.js	1460	editor
/johansson-town/src/avatars/looks-data.js	836	editor
/johansson-town/src/avatars/looks.js	3481	editor
/johansson-town/src/avatars/moves.js	734	editor
/johansson-town/src/avatars/outfits.js	6074	editor
/johansson-town/src/avatars/personality.js	9112	editor
/johansson-town/src/avatars/pleated-skirt.js	1110	editor
/johansson-town/src/avatars/recipe.js	14087	editor
/johansson-town/src/avatars/seat-support.js	2323	editor
/johansson-town/src/avatars/springs.js	10703	editor
/johansson-town/src/avatars/story-props.js	19027	editor
/johansson-town/src/avatars/swept-ponytail-mesh.js	259806	editor
/johansson-town/src/avatars/tools.js	3119	editor
/johansson-town/src/avatars/towel-fit.js	10363	editor
/johansson-town/src/avatars/wardrobe.js	964	editor
/johansson-town/src/commerce/brands.js	5664	editor
/johansson-town/src/commerce/catalogue.js	4837	editor
/johansson-town/src/commerce/flavours.js	1734	location:sakura
/johansson-town/src/commerce/food-art.js	608	editor
/johansson-town/src/commerce/fresh-labels.js	9589	location:sakura
/johansson-town/src/commerce/konbini.js	12420	editor
/johansson-town/src/commerce/sakura-economy.js	8172	editor
/johansson-town/src/commerce/sakura-flyer.js	1552	editor
/johansson-town/src/commerce/sakura-specials.js	1385	location:sakura
/johansson-town/src/commerce/shop-product.js	6517	location:sakura
/johansson-town/src/commerce/shop-stock.js	7187	editor
/johansson-town/src/commerce/vending-catalogue.js	2341	editor
/johansson-town/src/office/archive.js	10012	editor
/johansson-town/src/office/town-papers.js	24964	editor
/johansson-town/src/people/bookshop-visits.js	725	editor
/johansson-town/src/people/commuter-schedule.js	7361	editor
/johansson-town/src/people/happenings.js	10529	editor
/johansson-town/src/people/home-life.js	3538	editor
/johansson-town/src/people/households.js	1387	editor
/johansson-town/src/people/island-households.js	7102	editor
/johansson-town/src/people/izakaya-beer.js	15960	editor
/johansson-town/src/people/izakaya-hours.js	3465	editor
/johansson-town/src/people/izakaya-serving-visuals.js	19669	editor
/johansson-town/src/people/market-visits.js	2239	editor
/johansson-town/src/people/owned-characters.js	3122	editor
/johansson-town/src/people/profiles.js	16600	editor
/johansson-town/src/people/renamed.js	811	editor
/johansson-town/src/people/resident-personalities.js	8124	editor
/johansson-town/src/people/residents.js	6345	editor
/johansson-town/src/people/sleep-cover.js	2389	editor
/johansson-town/src/people/social.js	30912	editor
/johansson-town/src/people/vehicle-driver.js	1961	editor
/johansson-town/src/photo/layout.js	3720	editor
/johansson-town/src/render/cel.js	16621	editor
/johansson-town/src/render/dusk.js	6308	editor
/johansson-town/src/render/ground-palette.js	1148	editor
/johansson-town/src/render/harbour-instances.js	2104	editor
/johansson-town/src/render/materials.js	3746	editor
/johansson-town/src/render/sky.js	5144	editor
/johansson-town/src/render/static-props.js	7429	editor
/johansson-town/src/render/toy-surfaces.js	5918	editor
/johansson-town/src/render/window-interior.js	11142	editor
/johansson-town/src/render/world-uv.js	1822	editor
/johansson-town/src/save.js	4493	editor
/johansson-town/src/town-clock.js	6666	editor
/johansson-town/src/ui/icons.js	8079	editor
/johansson-town/src/workshop/catalogue.js	2085	editor
/johansson-town/src/workshop/machine.js	3869	location:books
/johansson-town/src/workshop/models.js	1938	location:books
/johansson-town/src/workshop/motor-bench.js	3407	location:books
/johansson-town/src/world/advertising-billboard.js	6734	editor
/johansson-town/src/world/airport-district-plan.js	983	editor
/johansson-town/src/world/airport-district.js	9599	editor
/johansson-town/src/world/airport-ferry.js	5510	editor
/johansson-town/src/world/airport-ground.js	3158	editor
/johansson-town/src/world/airport-island.js	10080	editor
/johansson-town/src/world/airport-vehicle-yard.js	1712	editor
/johansson-town/src/world/aoba-radio.js	4487	editor
/johansson-town/src/world/beach-corner.js	10268	editor
/johansson-town/src/world/beach-layout.js	1414	editor
/johansson-town/src/world/beach-life.js	15526	editor
/johansson-town/src/world/bicycle-fit.js	672	editor
/johansson-town/src/world/bicycle.js	7068	editor
/johansson-town/src/world/blue-coral-shop.js	6240	editor
/johansson-town/src/world/boardwalk.js	3765	editor
/johansson-town/src/world/bookshop-workshop-layout.js	892	editor
/johansson-town/src/world/breakwaters.js	3525	editor
/johansson-town/src/world/bus-station.js	2276	editor
/johansson-town/src/world/business-layout.js	113	editor
/johansson-town/src/world/businesses.js	2886	editor
/johansson-town/src/world/cargo-shipping.js	9240	editor
/johansson-town/src/world/coastal-ground.js	2038	editor
/johansson-town/src/world/countryside.js	14553	editor
/johansson-town/src/world/coyote-tunnel.js	19678	editor
/johansson-town/src/world/detail-stream.js	2184	editor
/johansson-town/src/world/dining-layout.js	3421	editor
/johansson-town/src/world/districts.js	3611	editor
/johansson-town/src/world/dock-workshop-layout.js	849	editor
/johansson-town/src/world/dock-workshop.js	2659	editor
/johansson-town/src/world/docklands-detail.js	4049	editor
/johansson-town/src/world/docklands-layout.js	521	editor
/johansson-town/src/world/docklands-life.js	5101	editor
/johansson-town/src/world/east-garden.js	9451	editor
/johansson-town/src/world/east-lawn.js	13960	editor
/johansson-town/src/world/exterior-details.js	2009	editor
/johansson-town/src/world/ferry-model.js	42261	editor
/johansson-town/src/world/ferry-paths.js	17836	editor
/johansson-town/src/world/ferry-ship.js	39007	editor
/johansson-town/src/world/ferry.js	16892	editor
/johansson-town/src/world/flower-shop.js	4724	editor
/johansson-town/src/world/forest-edge.js	6058	editor
/johansson-town/src/world/fujita-day.js	6367	editor
/johansson-town/src/world/fujita-houseboat.js	10082	editor
/johansson-town/src/world/fujita-routine.js	3829	editor
/johansson-town/src/world/furniture-standards.js	830	editor
/johansson-town/src/world/garden-layout.js	4489	editor
/johansson-town/src/world/ground-layers.js	1169	editor
/johansson-town/src/world/harbour-bench-dimensions.js	449	editor
/johansson-town/src/world/harbour-office.js	2104	editor
/johansson-town/src/world/harbour.js	33798	editor
/johansson-town/src/world/home-lights.js	4175	editor
/johansson-town/src/world/horizon.js	3461	editor
/johansson-town/src/world/interiors/bookshop-detail.js	9661	location:books
/johansson-town/src/world/interiors/compact-shops.js	10935	location:books
/johansson-town/src/world/interiors/future-calendar.js	7859	editor
/johansson-town/src/world/interiors/house-plan.js	7181	editor
/johansson-town/src/world/interiors/izakaya-devices.js	9638	editor
/johansson-town/src/world/interiors/izakaya-dressing.js	23368	editor
/johansson-town/src/world/interiors/izakaya-exploration.js	9799	editor
/johansson-town/src/world/interiors/izakaya-interactive.js	4138	editor
/johansson-town/src/world/interiors/izakaya-lived-in.js	12276	editor
/johansson-town/src/world/interiors/izakaya-patina.js	5735	editor
/johansson-town/src/world/interiors/izakaya-posters.js	3109	editor
/johansson-town/src/world/interiors/koban.js	14950	editor
/johansson-town/src/world/interiors/magazine-art.js	23130	editor
/johansson-town/src/world/interiors/magazine-issues.js	8465	editor
/johansson-town/src/world/interiors/office-workplace.js	17242	editor
/johansson-town/src/world/interiors/onsen-electrics.js	107147	location:onsen
/johansson-town/src/world/interiors/onsen-front.js	26975	editor
/johansson-town/src/world/interiors/onsen-lobby.js	41160	location:onsen
/johansson-town/src/world/interiors/onsen-night.js	8957	location:onsen
/johansson-town/src/world/interiors/onsen-props.js	43559	location:onsen
/johansson-town/src/world/interiors/onsen-rocks.js	4103	location:onsen
/johansson-town/src/world/interiors/onsen-signs.js	10639	editor
/johansson-town/src/world/interiors/onsen-steam.js	23364	location:onsen
/johansson-town/src/world/interiors/onsen-towels.js	8478	location:onsen
/johansson-town/src/world/interiors/onsen-wash.js	10190	location:onsen
/johansson-town/src/world/interiors/onsen.js	40700	location:onsen
/johansson-town/src/world/interiors/sakura-backroom.js	22259	location:sakura
/johansson-town/src/world/interiors/sakura-cheer.js	21039	location:sakura
/johansson-town/src/world/interiors/sakura-corners.js	12336	location:sakura
/johansson-town/src/world/interiors/sakura-counter-detail.js	10277	location:sakura
/johansson-town/src/world/interiors/sakura-dressing.js	31435	location:sakura
/johansson-town/src/world/interiors/sakura-food-products.js	9926	location:sakura
/johansson-town/src/world/interiors/sakura-interior.js	15026	location:sakura
/johansson-town/src/world/interiors/sakura-layout.js	17977	editor
/johansson-town/src/world/interiors/sakura-life.js	31496	location:sakura
/johansson-town/src/world/interiors/sakura-magazine-rack.js	10353	editor
/johansson-town/src/world/interiors/sakura-restroom.js	17341	location:sakura
/johansson-town/src/world/interiors/sakura-shelf-edge.js	3630	location:sakura
/johansson-town/src/world/interiors/sakura-shell.js	20590	location:sakura
/johansson-town/src/world/interiors/sakura-specials-board.js	6920	location:sakura
/johansson-town/src/world/interiors/sakura-surfaces.js	3991	location:sakura
/johansson-town/src/world/interiors/sato-ramen-dressing.js	11628	location:sato-ramen
/johansson-town/src/world/interiors/sato-ramen.js	7211	location:sato-ramen
/johansson-town/src/world/interiors/shared-dining-layout.js	2179	editor
/johansson-town/src/world/interiors/shelf-flavours.js	2952	location:sakura
/johansson-town/src/world/interiors/shop-refrigerator.js	3858	location:sakura
/johansson-town/src/world/interiors/staff-board.js	3182	location:sakura
/johansson-town/src/world/interiors/stockroom-products.js	4120	location:sakura
/johansson-town/src/world/interiors/store-advertising.js	12649	location:sakura
/johansson-town/src/world/interiors/tatami-home-layout.js	516	editor
/johansson-town/src/world/interiors/town-hall.js	39216	location:town-hall
/johansson-town/src/world/island-coast.js	4268	editor
/johansson-town/src/world/island-homes.js	2379	editor
/johansson-town/src/world/island-landscape.js	9818	editor
/johansson-town/src/world/island-plan.js	4815	editor
/johansson-town/src/world/izakaya.js	20950	editor
/johansson-town/src/world/kitahama-layout.js	5108	editor
/johansson-town/src/world/kitano-link-plan.js	4928	editor
/johansson-town/src/world/kitano-link.js	7834	editor
/johansson-town/src/world/koban-layout.js	1124	editor
/johansson-town/src/world/koban.js	7859	editor
/johansson-town/src/world/landmark-lots.js	256	editor
/johansson-town/src/world/lane-surfaces.js	6277	editor
/johansson-town/src/world/layout.js	12475	editor
/johansson-town/src/world/light-pools.js	2043	editor
/johansson-town/src/world/main-road.js	1475	editor
/johansson-town/src/world/minato-berth.js	5374	editor
/johansson-town/src/world/minato-facade.js	27595	editor
/johansson-town/src/world/ocean.js	15886	editor
/johansson-town/src/world/oil-jetty-layout.js	750	editor
/johansson-town/src/world/oil-jetty.js	6164	editor
/johansson-town/src/world/okinawa/houses.js	24629	editor
/johansson-town/src/world/okinawa/kit.js	14596	editor
/johansson-town/src/world/okinawa/kitahama-quarter.js	13221	editor
/johansson-town/src/world/okinawa/layout.js	7823	editor
/johansson-town/src/world/okinawa/old-town.js	18431	editor
/johansson-town/src/world/okinawa/props.js	12797	editor
/johansson-town/src/world/okinawa/quarters.js	46011	editor
/johansson-town/src/world/okinawa/signs.js	15652	editor
/johansson-town/src/world/okinawa/stairs.js	1974	editor
/johansson-town/src/world/okinawa/trees.js	7744	editor
/johansson-town/src/world/onsen-layout.js	946	editor
/johansson-town/src/world/park-access.js	6722	editor
/johansson-town/src/world/park-height.js	23836	editor
/johansson-town/src/world/park-layout.js	7716	editor
/johansson-town/src/world/park-onsen.js	12248	editor
/johansson-town/src/world/park.js	14348	editor
/johansson-town/src/world/port-building.js	9623	editor
/johansson-town/src/world/port-shed.js	27736	editor
/johansson-town/src/world/quiet-life.js	2023	editor
/johansson-town/src/world/residential-layout.js	1249	editor
/johansson-town/src/world/road-network.js	9824	editor
/johansson-town/src/world/road-standards.js	10137	editor
/johansson-town/src/world/road-vehicles.js	10504	editor
/johansson-town/src/world/roadside-props.js	8698	editor
/johansson-town/src/world/sakura-bench.js	4088	editor
/johansson-town/src/world/sakura-flyers.js	1321	editor
/johansson-town/src/world/sato-ramen-layout.js	4538	editor
/johansson-town/src/world/school-layout.js	4858	editor
/johansson-town/src/world/school.js	31849	editor
/johansson-town/src/world/shop-door.js	1962	editor
/johansson-town/src/world/shop-glass.js	2482	editor
/johansson-town/src/world/shopping-lane-plan.js	3051	editor
/johansson-town/src/world/shopping-lane.js	8045	editor
/johansson-town/src/world/sliding-door.js	4050	editor
/johansson-town/src/world/staff-bench.js	4401	editor
/johansson-town/src/world/storefront.js	14211	editor
/johansson-town/src/world/street-furniture.js	7299	editor
/johansson-town/src/world/street-lamps.js	6824	editor
/johansson-town/src/world/street-plants.js	2684	editor
/johansson-town/src/world/supplied-rooms.js	2266	editor
/johansson-town/src/world/terrain-path.js	1355	editor
/johansson-town/src/world/terrain-surface.js	762	editor
/johansson-town/src/world/thuan-flat.js	6134	editor
/johansson-town/src/world/town-grid.js	1248	editor
/johansson-town/src/world/town-power.js	5687	editor
/johansson-town/src/world/town-traffic.js	14668	editor
/johansson-town/src/world/town.js	35990	editor
/johansson-town/src/world/traditional-garden.js	11392	editor
/johansson-town/src/world/transit.js	309	editor
/johansson-town/src/world/tropical-island.js	16786	editor
/johansson-town/src/world/vending.js	13466	editor
/johansson-town/src/world/walk-surface.js	5321	editor
/johansson-town/src/world/warehouse.js	5412	editor
/johansson-town/src/world/west-shops.js	9084	editor
/johansson-town/src/world/west-yard.js	4600	editor
/johansson-town/src/world/yard-homes-layout.js	1321	editor
/johansson-town/src/world/yard-homes.js	7288	editor
/johansson-town/vendor/BufferGeometryUtils.js	31780	editor
/johansson-town/vendor/GLTFLoader.js	110278	editor
/johansson-town/vendor/SkeletonUtils.js	8814	editor
/johansson-town/vendor/three.module.js	1314680	editor
/johansson-town/src/avatars/export.js	3464	static-graph-only (Download 3D model)
/johansson-town/src/avatars/face-morphs.js	1595	static-graph-only (Download 3D model)
/johansson-town/tools/vendor/GLTFExporter.js	81907	static-graph-only (Download 3D model)
```
