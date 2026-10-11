# Main site and shared tooling: split map

Read-only survey, 2026-10-11. Sources: `origin/main` (3c9e75bd, local ref; remote main is now 068813dd), `origin/claude/sjoskolan-youtube-strategy-gofi3o`
(0651299d), the local working tree (HEAD 553ade6e, 14 commits behind origin, with uncommitted agent work), `/home/user/jojo`,
live HTTP probes of nj22az.github.io, the GitHub API (this repo only) and the cloud-session API.
Targets: World → `nj22az/johansson-world` at `/johansson-world/`. Studio → `nj22az/johansson-studio` at `/johansson-studio/`.
Sjöskolan, elteknik and ellab → `nj22az/sjoskolan` at `/sjoskolan/`.
Companion maps: `map-world.md` and `map-studio.md` cover the folders' own internals. This file covers the main site, the root files,
Pages behaviour, other writers and session setup.

## 0. Headline findings

1. **There is no 404.html at the site root** (live `/404.html` returns 404). `engineering-blog/404.html` exists, but GitHub uses only the
   root one. A new root `404.html` can send any deep link under `/johansson-town/…`, `/avatar-creator/…` and similar paths to
   the new address, keeping `search` and `hash`. Real stub files are still needed at `/johansson-town/index.html`,
   `/johansson-town/creator/index.html` and `/johansson-town/sw.js`. The old service worker and the iPad icon need a 200 response
   and a kill-switch worker, not a 404 page (§6).
2. **`/johansson-world/` does not collide today.** Main has no `johansson-world/` folder, and the live URL returns 404. The folder (a redirect
   to `/johansson-town/`) exists only on the work branch. `johansson-town-live.yml` copies only `johansson-town/` and
   `avatar-creator/`, so the folder never reaches main. Delete it from the branch before Pages is turned on for `nj22az/johansson-world`.
   Otherwise a later wholesale merge into main can create a redirect loop (`/johansson-world/` → `/johansson-town/` → stub →
   `/johansson-world/`). The local working tree's stale `config.js:104` also still has a second card pointing at `/johansson-world/`. The origin branch has already removed it.
3. **`/sjoskolan/` is the only path that does collide**, by design. It is unclear which side wins (§1). Use the probe test before
   the switch, and do the switch at a quiet time. The course runs weeks 37–45 and is now in week 41.
4. **Moving `elteknik/` into `nj22az/sjoskolan` changes its address**: it would be served at `/sjoskolan/elteknik/`, or wherever it is placed
   inside the artifact. The main site's blog series is tied to it in about 45 places: the `/elteknik/styles.css` stylesheet,
   `/elteknik/files/omslag.jpg`, `provkapitel.pdf` with a `download` attribute, and `/elteknik/` links. `config.js:72,75` and
   `sitemap.xml:5` also point at it. A `download` link to a 404 saves the 404 page, so those links must be edited, not redirected.
5. **Module imports cannot be redirected.** `thuans-storage/` and `motor-90l/workshop/` on the main site import World code at runtime
   from `/johansson-town/…`. The Sjöskolan simulators import World's `vendor/three.module.js` by relative path. All of them must be repointed or moved before
   `/johansson-town/` becomes a stub (see map-world §2a).
6. **Several writers push to this repo's main right now**:
   - the "Island city plan redesign" session (session_01G8DAjj6ZCrp3XDhjgmTSXQ, running, on `main`), which pushes World changes straight to main;
   - the "Johansson World entry points" session (session_01SkiPY39K3gDyeDM4v9Fzhc, blocked on "Shall I go ahead?");
   - Codex PRs (`codex/*`, last merged #170 on 2026-10-10);
   - the branch workflow.

   The latest publish run (38115920783, 05:47Z) **failed** in "Copy johansson-town and avatar-creator onto main", the guard against
   main-only changes. This dual-writer conflict is what the split removes (§8).
7. **The root files the moved folders depend on are few.** `.mcp.json` has 2 servers (the second, `johansson-studio`, is uncommitted in the working tree), and `.claude/agents` holds 3 files
   (2 are identical to jojo's copies). The workflows (`johansson-town-live.yml` exists **only on the branch**; `sjoskolan.yml` and `multimeter-browser.yml`
   are on both) use secret `LARARLOSEN`, which `nj22az/sjoskolan` must be given. There are also `.gitignore` lines, the `CLAUDE.md` sections,
   `LICENSE.md` and the `THIRD_PARTY_NOTICES.md` sections. There is no root `package.json`, `node_modules` or `scripts/`, and `tools/` holds only the
   portal's `schedule-editor.py`.
8. **No custom domain and no `CNAME`.** Project sites are served at `nj22az.github.io/<repo>/`, all on one origin. `localStorage`, IndexedDB and
   Cache Storage are origin-wide, so saves survive the move. The exception is the iPad home-screen app, which has its own storage container (see map-world §0.6).
   Sjöskolan's path-based keys (`sj-ovningar:/sjoskolan/…`) keep working because the path does not change.
9. **The Cloudflare Pages scaffolding is dormant.** `wrangler.toml`, `functions/api/*` and `shop/shop.js:583 fetch('/api/create-checkout')`
   are present, but `shop/config.js:46 stripePublishableKey: ""` is empty. `nj22az-github-io.pages.dev` does not resolve through the proxy (a 502 on CONNECT,
   while other `*.pages.dev` hosts answer), so it is probably not deployed. This is unverified. Nothing here moves.
10. **Pages limits favour the split.** A published site may be at most 1 GB, and main's tree is 715 MB today. Classic branch builds have a soft limit of
    10 builds per hour, which does not apply to custom Actions workflows. Each deployment times out after 10 minutes.

## 1. GitHub Pages: a project site and a same-named folder in the user site

- **Official docs** (docs.github.com "About GitHub Pages", "GitHub Pages limits"): a project site is served at
  `<owner>.github.io/<repositoryname>`. The docs say **nothing** about a collision with a folder of the user site. **Unverified.**
- **Community evidence**, which conflicts:
  - discourse.gohugo.io/t/52238 (2024): a repo named `droppin-dimes` that had once had Pages **shadowed** the user site's
    `droppin-dimes/` folder, which returned 404. *Unpublishing that repo's Pages did not help; deleting or renaming the repo did*, as the poster reported.
  - phillipalday.com (2014): "initialising the User page blocks the existing subdirectories". Pushing to the project's
    `gh-pages` restores the project's "mount point".
  - Both reports fit a model in which **a project site claims its path when it is deployed**, and which side wins may depend on which
    deployed last. Neither has been tested on this account.
- **Probe before the Sjöskolan switch** (about 10 minutes, no risk to the course; the creator must make the repo):
  1. Add `pages-probe/index.html` (text "USER") to main and wait for the user-site build.
  2. Create the public repo `nj22az/pages-probe` with `index.html` ("PROJECT") and enable Pages.
     `curl https://nj22az.github.io/pages-probe/`.
  3. Push any change to main so the user site rebuilds, then curl again. This tests whether "last deploy wins".
  4. Disable Pages on the probe repo and curl again. This tests rollback. Then rename the repo and curl again.
  5. Delete the repo and the folder.
  The results decide whether Sjöskolan's rollback can be "disable Pages" or must be "rename the repo".
- **Consequences for the order of work (§7):**
  - World and Studio use new names with no folder on main, so there is no collision. Turn Pages on and check the new URLs while the old ones still run.
  - Creating an empty repo without Pages should not touch `/sjoskolan/`. After creating `nj22az/sjoskolan`, check that
    `curl -sI https://nj22az.github.io/sjoskolan/` keeps the user site's ETag. Today it is `6acb246e-2e51`, deployed at 05:53:50, the same second as `/`.
  - To know which site is serving `/sjoskolan/`, put a marker file only in the project artifact, for example `/sjoskolan/.split-marker.txt` or
    `split.json`. A 200 means the project site is serving. Also compare the `last-modified` time with the user-site build.
  - Keep main's `sjoskolan/` folder until the project site is confirmed and the switch has held across one later user-site build. Then
    delete it from main.
  - A project site's `robots.txt` is ignored, because robots.txt is read only at the host root. The main site's `robots.txt` and `sitemap.xml` govern all
    three project sites.

## 2. Main-site files that point at the moving folders (update in the stub commit)

| File:line (origin/main) | Points at | After the split |
|---|---|---|
| `config.js:84` | `/johansson-town/` (Johansson World card) | `/johansson-world/`, only once that site is live |
| `config.js:94` | `/avatar-creator/` (Johansson Studio card) | `/johansson-studio/` |
| `config.js:62` | `/sjoskolan/` | unchanged |
| `config.js:72,75` | `/elteknik/`, `/elteknik/files/omslag.jpg` | new elteknik address, or unchanged if it stays (§10) |
| `sitemap.xml:13,14` | `/avatar-creator/`, `/johansson-town/` | `/johansson-studio/`, `/johansson-world/` |
| `sitemap.xml:4,5` | `/sjoskolan/`, `/elteknik/` | `/sjoskolan/` unchanged. Elteknik follows the decision. |
| `blog/the-torn-poster/index.html:82` | `href="/johansson-town/"` | `/johansson-world/` |
| `blog/index.html:40` | `/elteknik/files/omslag.jpg` | the new address, or a copy under `/assets/` |
| `blog/elteknik/*/index.html` (6 pages: lines 14,22,37,42,60 plus the CTA block; `index.html` 8,10,14,22,36,88,90,136,146) | `/elteknik/styles.css` (stylesheet), `/elteknik/files/omslag.jpg` (og:image, img), `/elteknik/files/provkapitel.pdf` (`download`), `/elteknik/` | copy `styles.css` into `blog/elteknik/`, repoint the images and PDF, or keep `elteknik/` on main |
| `blog/elteknik/article.css:1` | comment: builds on `/elteknik/styles.css` | as above |
| `mizuhama-1988/index.html:1` | meta-refresh plus `location.replace('/johansson-town/'…)` | `/johansson-world/` (avoids two redirects in a row) |
| `johansson-world/index.html` (branch only) | redirect to `/johansson-town/` | **delete** before Pages is turned on for johansson-world |
| `.mcp.json:3-5` (and working tree `:7-10`) | `johansson-town/tools/mcp/server.mjs`, `johansson-town/tools/studio/server.mjs` | remove from main. World and Studio get their own (§4). |
| `.gitignore:13-17` | `sjoskolan/innehall/build/`, `.skyddat/`, `bok/.bok/`, `__pycache__/`, `vaxelstromslabbet-utkast/node_modules` | move to the sjoskolan repo (keep a copy until main's folder is gone) |
| `.gitignore` (working tree) | `/output/studio-mcp/` | written by `johansson-town/tools/studio/repo.mjs` (`CODE_ROOT` = site root) → whichever repo owns that tool |
| `LICENSE.md:48-56` | `johansson-town/assets/workshop/LICENSE.txt`, `johansson-town/assets/audio/LICENSE.txt` | link to the World repo. World gets its own LICENSE.md. |
| `THIRD_PARTY_NOTICES.md:13-29` (Sjöskolan film companions), `:33-69` (Johansson Town), `:92`, `:99-105`, `:117` | sjoskolan/, johansson-town/ paths | split by section into each repo. Main keeps Form 3D Studio and a pointer. |
| `CLAUDE.md` (branch) `:115-143` Words, `:145-186` Johansson Town, `:188-212` Sjöskolan; (main) `:115-137`, `:139-162` | World, Studio and Sjöskolan rules | move to each repo's CLAUDE.md. Main keeps a "lives elsewhere" table and the iPad and naming notes. |
| `README.md:9` | mentions Sjöskolan | edit the wording |
| `progress.md` (404 lines, Codex-style World log) | johansson-town history | move to World as `docs/history/progress.md`, or leave it on main |
| `.github/workflows/sjoskolan.yml`, `multimeter-browser.yml` | `sjoskolan/**` | move to the sjoskolan repo. Delete on main in the same commit that deletes `sjoskolan/`. |
| `.github/workflows/johansson-town-live.yml` (branch only) | copies World and Studio onto main | **disable before the stub commit** (§7). Deleting it on main does nothing, because it runs from the branch. |

## 3. Moving folders that depend on main-site files (these keep working across repos, but stay coupled)

| From (origin/main) | Main-site target | Kind | Note |
|---|---|---|---|
| `sjoskolan/**` (125 pages), `ellab/index.html:8`, `elteknik/index.html:18,19`, `motor-90l/index.html`, `motor-90l/workshop/index.html` | `/assets/images/apple-touch-icon.png` | icon | Same origin, so it works. Copy it into each repo to make them independent. |
| `avatar-creator/index.html:12` | `/assets/images/favicon.svg` | icon | Same |
| `elteknik/index.html:51` | `/assets/js/shopify-book-price.js` | script | Copy it. It is shared with `index.html:24` and the blog. |
| `elteknik/index.html:172-178`, `:57,239` | `/blog/elteknik/…`, `/` | links | Same origin, so they work |
| `johansson-town/src/workshop/interface.js:18` | `/form-3d-studio/` (main), `/stepbuddy/` (nj22az/stepbuddy) | iframe | Same origin, so it works. Main must keep `form-3d-studio/`. |
| `johansson-town/scripts/build-workshop-models.mjs:4` | `../../form-3d-studio/src/open-models.mjs` | dev import | Breaks in the new repo. Point it at a sibling clone (`../nj22az.github.io/form-3d-studio`) or vendor it. |
| `johansson-town/index.html:156`, `activities.js:1010-1011` | `/thuans-storage/?from=johansson-town…` | link | Follows the thuans-storage decision |
| `thuans-storage/src/game.js:18`, `assets/storage-*.js:5435` | `import('/johansson-town/src/dungeon/pretend.js')` | runtime import | **Breaks** when the stub lands. Move it to World, or point it at `/johansson-world/src/…` and rebuild the bundle. |
| `thuans-storage/index.html:36` | importmap key `/johansson-town/vendor/three.module.js` | importmap | Same |
| `thuans-storage/src/ui.js:28` | `location.href='/johansson-town/'` | link | Same |
| `thuans-storage/tests/playability.test.mjs:104` | `../../johansson-town/src/dungeon/costumes.js` | test | Same |
| `motor-90l/workshop/erik.js:5`, `workshop/index.html:80` | `/johansson-town/src/avatars/build.js`, `/johansson-town/vendor/three.module.js` | runtime import | **Breaks.** Move it to World, or repoint it. |
| `sjoskolan/simulatorer/{scene.mjs:1, erik-visar.mjs:4, character/build.js:1-2, character/cel.js:1, vaxelstrom/scen.mjs:3, vaxelstrom/manus.mjs:5}` | `../../(../)johansson-town/vendor/three.module.js`, `BufferGeometryUtils.js` | runtime import | **Breaks** the student labs. Vendor three r170 into the Sjöskolan repo **before** World's stub. |
| `sjoskolan/innehall/bok/bok.py:22-24` | `REPO/'elteknik'/'files'` | build output | Works only if elteknik sits beside sjoskolan in the same repo (supports moving it) |
| `sjoskolan/verktyg/qa/week40.py:17-51`, `vecka-40/41 resultat-teacher.test.mjs:10-13`, `innehall/migrering/kallor.py:13,44` | the repo root acts as the web root (`/sjoskolan/...` → `ROOT/sjoskolan/...`; `git show rev:sjoskolan/path`) | tool layout | **Keep the `sjoskolan/` subfolder in the new repo** and publish it with an Actions artifact whose root is `sjoskolan/`. Do not flatten. Import history with the same paths. |
| `/home/user/jojo/studio/material.py:9,24` | `../nj22az.github.io/sjoskolan` (`JOJO_MATERIAL`) | dev read | Becomes `../sjoskolan/sjoskolan` |

## 4. Root files and shared tooling: what each new repo needs

**nj22az/johansson-world**
- `.mcp.json`: `johansson-town-audit` → `{"command":"node","args":["tools/mcp/server.mjs"]}`. `tools/mcp/session.mjs:8` sets root to `../../`,
  which becomes the repo root (fine). `static-server.mjs:14,25` serves at the `/johansson-town/` prefix (works locally; rename it to `/johansson-world/`).
  `session.mjs:89` imports `/johansson-town/tools/mcp/navigation.mjs` by URL, so it must change with the prefix. `session.mjs:130` writes
  `resolve(root,'../output/mcp-audit')`, which would land **outside the repo** (for example `/home/user/output`). Change it to `output/mcp-audit` and gitignore it.
- In-flight `johansson-studio` MCP (`johansson-town/tools/studio/*`, uncommitted): `repo.mjs` sets `CODE_ROOT` three folders up, which is the *site*
  root. Its `PATHS` are `johansson-town/data/studio/*.json`, `johansson-town/src/avatars/looks-data.js`,
  `johansson-town/src/commerce/products-data.js`, `johansson-town/assets/graphics/labels/*` and `output/studio-mcp`. `page.mjs` serves only
  `/johansson-town/` and `/avatar-creator/`. It writes World data, so it fits World with the `johansson-town/` prefixes removed. It also needs Studio served
  beside World (a sibling clone, §9). Alternatively it goes to Studio with a `WORLD_DIR`. Decide before moving it.
- `.claude/agents/set-designer.md`, `street-designer.md` (identical to jojo's) and `gag-writer.md` (it **differs** from jojo's copy, so pick one).
  Their bodies name `johansson-town/assets/...`, `remotion/CAST.md` and the audit MCP. Rewrite the paths.
- `CLAUDE.md`: the branch's `:115-186` (Words, Johansson Town), with paths de-prefixed, plus the publishing rules for the new repo.
- `LICENSE.md` (all-rights-reserved text, copied), `THIRD_PARTY_NOTICES.md` `:33-69`, `:92`, `:106-112` (ToxSam, VRM).
- `.nojekyll` if Pages deploys from a branch (`runtime/.vite/` begins with a dot). It is not needed with an Actions artifact.
- `.gitignore`: `node_modules/`, `output/`, `dist/`.
- The workflow replacing `johansson-town-live.yml` (World half). Settings → Pages → Source = GitHub Actions is set by the creator; the Pages API
  returns 403 to Claude.
- `progress.md` (optional).
- If it moves in: `thuans-storage/` (it brings its own `.nojekyll`) and `motor-90l/`.

**nj22az/johansson-studio**
- Its own `CLAUDE.md`: Words, plus the Studio rules (iPad Safari) and how it loads World (see map-studio §1).
- `.mcp.json` for the Studio MCP, if it lives here.
- `LICENSE.md`.
- A test workflow that checks out `nj22az/johansson-world` beside it (today the Studio tests run inside `johansson-town-live.yml` from the site root).
- An `apple-touch-icon` that does not point at `/johansson-town/assets/icons/town-192.png` (`avatar-creator/index.html:13`).

**nj22az/sjoskolan**
- Folders `sjoskolan/` (332 MB), `elteknik/` (8.3 MB) and `ellab/` (12 KB) at the same paths.
- `.github/workflows/sjoskolan.yml` and `multimeter-browser.yml`, unchanged (their paths already start with `sjoskolan/`), plus a `pages.yml` that uploads
  `sjoskolan/` as the artifact root, adding elteknik and ellab under it if they move.
- **Repo secret `LARARLOSEN`**, used by `sjoskolan.yml:41,45`. The creator sets it; it is never written in the repo.
- The `.gitignore` lines 13-17 and `node_modules/`.
- `CLAUDE.md` with the Sjöskolan section (`ANDRINGSLOGG`, `DESIGN`, `innehall`, notation, translation).
- `LICENSE.md` (it names Sjöskolan teaching material explicitly).
- `THIRD_PARTY_NOTICES.md` `:13-29`, `:99-105`, `:117`.
- A copy of `/assets/images/apple-touch-icon.png` (optional).
- Open PRs against main touching Sjöskolan: **#157** (`sjoskolan/veckor-41-42-numrerade-labbar-20261008`) and **#158**
  (`sjoskolan/tentamen-120min-50-50-utkast-20261008`). Merge them before the import, or redo them in the new repo.

**The main site keeps** `config.js`, `shared.js`, `styles.css`, `css/`, `theme-bootstrap.js`, `subpage-theme.*` (used by blog,
engineering-blog, form-3d-studio, shop and the-front-row-seat), `assets/`, `blog/`, `_posts/`, `engineering-blog/`, `shop/`, `functions/`,
`wrangler.toml`, `form-3d-studio/`, `the-front-row-seat/`, `tools/schedule-editor.py` (edits `config.js`), `robots.txt`, `sitemap.xml`,
`.nojekyll`, the stubs, and the new `404.html`.
- **Stray root files**, which nothing references: `IMG_2855.jpeg` (6 MB), and `db_gg2.png`, `kk_desk.png`, `kk_mob.png` (added in a Sjöskolan commit,
  3d77a158). Removing them is the creator's call.

## 5. Folder decisions on the main site

| Folder | Coupling | Recommendation |
|---|---|---|
| `johansson-town/` | World | Becomes stubs: `index.html`, `creator/index.html`, a kill-switch `sw.js`, and a README "moved to nj22az/johansson-world" |
| `avatar-creator/` | Studio | Becomes a stub `index.html` (Studio has no manifest and no service worker) |
| `johansson-world/` | branch-only redirect | Delete it on the branch now. It must never be on main once the project site exists. |
| `mizuhama-1988/` | redirect | Repoint to `/johansson-world/` |
| `thuans-storage/` (15 MB) | imports World, returns to World, uses World's save keys | Move to World (as map-world says). `/thuans-storage/` becomes a stub plus a 404 mapping. |
| `motor-90l/` (1.1 MB) | imports World's avatars and three; World's `npm test` hashes it; Sjöskolan only mentions it | World (least breakage), or Sjöskolan with a cross-repo import. This is the creator's call (§10). |
| `elteknik/` | built by `sjoskolan/innehall/bok/bok.py`; read by the main blog in about 45 places | Either move it (URL changes, stub and 404 mapping, blog edits) or keep it on main and copy the built files over (§10) |
| `ellab/` | retired page linking `/sjoskolan/...` | Move it with Sjöskolan, or simply leave `/ellab/` on main as is, since it is 12 KB and static |
| `form-3d-studio/`, `the-front-row-seat/`, `engineering-blog/`, `shop/`, `functions/`, `blog/`, `_posts/` | none to the moving folders except §2 and §3 | Stay |
| `nj22az/elteknik-och-ellara` | a separate gated YH course SPA (roles Elev, Lärare, Bok; `site/app.js`), live at `/elteknik-och-ellara/`, last modified 2026-09-07. It is **not** the same code as `elteknik/`. | Unrelated to the split. It could join `nj22az/sjoskolan` later. |
| `nj22az/JT` (public, last push 2026-09-28, no Pages) | added as a source in sessions 01SkiPY… and 01RHuR… | Ask the creator what it is (an older Johansson Town repo?) before creating `johansson-world` |

## 6. Stubs and the root 404.html

- `johansson-town/index.html` and `johansson-town/creator/index.html` must be **200 pages**, so the old service worker's network-first
  navigation does not fall back to its cached old shell. Each one runs:
  `location.replace('/johansson-world/'+sub+location.search+location.hash)`. It first unregisters any service worker whose scope is
  `/johansson-town/`, then redirects inside the promise rather than with a 0-second meta refresh. Add a `<noscript>` link.
- `johansson-town/sw.js` is the kill switch (map-world §3). It must be a real file, because a 404 does not unregister a worker.
- `avatar-creator/index.html` → `/johansson-studio/` plus search and hash.
- Root `404.html`: an ordered prefix map. It acts only on known old prefixes and otherwise shows a plain "not found" page in the site style.
  ```
  [['/johansson-town/','/johansson-world/'], ['/avatar-creator/','/johansson-studio/'],
   ['/mizuhama-1988/','/johansson-world/'], ['/thuans-storage/','/johansson-world/thuans-storage/'] (if moved),
   ['/motor-90l/','/johansson-world/motor-90l/'] (if moved), ['/elteknik/','/sjoskolan/elteknik/'] (if moved),
   ['/ellab/','/sjoskolan/'] (if moved)]
  ```
  Match `p===prefix.slice(0,-1) || p.startsWith(prefix)`, then `location.replace(to + p.slice(prefix.length) + search + hash)`.
  It does not help module, JSON, GLB or `download` requests, because those receive the HTML. Whether a project site with no 404.html falls back to the user
  site's 404.html is unverified. The prefix map is harmless either way.

## 7. Safe cutover order

0. Land the in-flight agents' work. Tell the other writers (§8). Run the Pages probe (§1).
1. Creator: create `nj22az/johansson-world`, `nj22az/johansson-studio` and `nj22az/sjoskolan`, all public and empty. **Do not enable Pages yet.**
   Give the Claude GitHub App access to them if it is installed for selected repositories only. Set `LARARLOSEN` on sjoskolan.
   Check that `/sjoskolan/` keeps the same ETag.
2. Import the trees. History-preserving extraction needs the full 1.6 GB history, which does not fit this container (about 440 MB free). Run it as an
   Actions job (`git filter-repo`).

   `GITHUB_TOKEN` cannot push commits that add or remove `.github/workflows` files. So leave the workflows out of the filtered history, or push to a side branch, and add the workflows in a normal commit.
3. **World first.** Delete the `johansson-world/` folder from the branch. Populate the repo, enable Pages (Actions), and verify that `/johansson-world/`,
   `/johansson-world/creator/` and saves work in Safari while `/johansson-town/` still runs.
4. **Studio.** Repoint `../johansson-town/` to `/johansson-world/` (map-studio). Enable Pages and verify on the iPad.
5. **Sjöskolan simulators**: vendor their own three.js in whichever repo they are in at that moment. Verify the lab pages.
   Also `thuans-storage/` and `motor-90l/`: move or repoint them, and rebuild the Storage bundle.
6. **Disable `johansson-town-live.yml`** with Actions → disable workflow, or delete it on the branch. Then make **one** main-site commit:
   - the stubs, the kill-switch `sw.js` and `404.html`;
   - `config.js:84,94`, `sitemap.xml`, `blog/the-torn-poster:82`, `mizuhama-1988`;
   - remove `.mcp.json` entries and the World/Studio parts of `CLAUDE.md`, `LICENSE.md` and `THIRD_PARTY_NOTICES.md`.

   Verify `/johansson-town/`, `/johansson-town/creator/?r=…`, `/avatar-creator/`, the old iPad icon, `/thuans-storage/` and `/motor-90l/workshop/`.
7. **Sjöskolan last**, at a quiet hour outside lessons:
   - Make sure the repo's CI is green and a local serve of the artifact under `/sjoskolan/` works.
   - Enable Pages, run the deployment, and check the marker file and the ETag.
   - Smoke-test the week 41 and 42 pages, the labs, the teacher unlock and the results code.
   - After it has held through one later user-site build, delete `sjoskolan/`, plus `elteknik/` and `ellab/` if they moved, and both Sjöskolan workflows and the `.gitignore` lines from main.
   - Elteknik's blog edits go in the same commit.
8. Update jojo (§9) and the CLAUDE.md files. Close or port the stale open World PRs on main (#155, #152, #128, #127, #125, #124, #119, #111, #103, #101,
   #100, #97, #68, #67, #66, #53, #50; #160 targets a feature branch).

## 8. Other writers and where they work after the split

- **session_01G8DAjj6ZCrp3XDhjgmTSXQ, "Island city plan redesign"**
  - State: RUNNING, source `main`, auto mode, origin iOS. Last summary: "izakaya window cut open; rebuilding, running full suite".
    Artifact: "Johansson Island Master Plan" (https://claude.ai/artifact/FPXQzKherxKgNePk5sTzjN). It accepts messages from other sessions.
  - Traces on main:
    - a504668b, c5961622, 08608baf (`johansson-town/docs/MASTER-PLAN.md`, `src/world/island-plan.js`, `island-landscape.js`);
    - 1d8f9202 (Kitano-jima, Mount Aoba, utaki, Coral Bay Bar, plus a `CLAUDE.md` trade line);
    - 125fe300 and 068813dd ("Merge origin/main and rebuild the runtime");
    - 48431b8b (Kitano-jima across the strait, Minato street front, izakaya portal).
  - It works on main directly against `WHERE-TO-EDIT.md` ("Make changes on the work branch, not directly on main"), which caused today's
    publish failure.
  - **After the split:** it works in `nj22az/johansson-world` (main) and nowhere else, using its island files and `tools/reachability-audit.mjs`.
    Until then, it should stop pushing to main and either push to the work branch or pause.
- **session_01SkiPY39K3gDyeDM4v9Fzhc, "Johansson World entry points"**
  - IDLE and BLOCKED on "Shall I go ahead?". Sources: nj22az.github.io, nj22az/JT and jojo.
  - Made bf70280c (`config.js`, the Mizuhama card removed).
  - After the split: main-site `config.js` only.
- **session_01RHuRSJ3Hg545ZoiFQegudV, Cowork bound to "Nils's MacBook Pro"**
  - Sources: nj22az/jt and nj22az.github.io.
  - Made 1b5da1f1 "Portal: Avatar Creator card becomes Johansson Studio".
  - Artifact: "Johansson World & Studio — brand and touch audit".
- **Codex (commits authored as nj22az, branches `codex/*`)**
  - PRs #159–#170 were merged into main on 2026-10-10, touching `avatar-creator/` and `johansson-town/`.
  - After the split: open its PRs on `nj22az/johansson-studio` or `nj22az/johansson-world`.
- **This session**, session_015VmRVkw19eqfRrMXc1iXco ("Sjöskolan YouTube channel strategy"), on the work branch, with jojo.
- **Workflows registered from other branches**: `build-minato-barfly-asset.yml`, `build-town-publication.yml`, `equipment.yml`,
  `johansson-town.yml`, `jojo-shorts.yml`, `town-mcp-smoke.yml` and `town-window-review.yml`. They are still active and trigger on pushes to those branches.
  Disable them or move them to the World repo.
- Docs that must change: `johansson-town/WHERE-TO-EDIT.md`, `avatar-creator/WHERE-TO-EDIT.md`, `johansson-town/briefs/NEXT.md:4`,
  the branch `CLAUDE.md:115-143` ("Publishing World and Studio") and jojo's `CLAUDE.md:9-25`.

## 9. Future cloud sessions, local layout and jojo

- **Clone layout**: every repo goes beside the others in `/home/user/`: `nj22az.github.io`, `johansson-world`, `johansson-studio`, `sjoskolan` and
  `jojo`. The clone names match the live URLs, so `python3 -m http.server -d /home/user` serves `/johansson-world/` and `/johansson-studio/`
  exactly as live. Studio's World imports (`/johansson-world/...`) resolve locally with no copy.
  Sjöskolan is served from its own repo root (`-d /home/user/sjoskolan`), which gives `/sjoskolan/...` as live and matches its tools.
- **Session per product.** A session's repositories are chosen when it starts; `add_repo` attaches more.
  - **World:** `source_url` = johansson-world. Default `clone_depth`. Set `blob_limit_kb` to about 2048, so the large GLBs in docs, output and tests are fetched on demand. The tree is 238 MB tracked, of which about 89 MB is served.
  - **Studio:** source johansson-studio, plus `add_repo` johansson-world (read), cloned to `/home/user/johansson-world`. Use a sparse
    checkout of the World files Studio needs (map-studio appendix).
  - **Sjöskolan:** source sjoskolan. Use `sparse_checkout_paths` for one week or lab when the disk is tight (332 MB).
  - **Main site:** source nj22az.github.io with the default depth. The tree is about 120 MB after the split. The 1.6 GB of history remains unless it is rewritten, which is not recommended.
  - **jojo:** source jojo plus johansson-world (and studio).
  - The environment's setup script could shallow-clone missing siblings with `--depth 1 --filter=blob:limit=1m`. Watch the small disk.
- **jojo variables** (one per repo, falling back to the sibling path):
  - `TOWN_SITE`/`TOWN_FOLDER` in `town-studio/townstudio/town.py:14-31` → a `WORLD_DIR` defaulting to `../johansson-world` and `~/johansson-world`, checked by
    `index.html` at the root with `TOWN_FOLDER=''`. The same applies to `headless.py:42`, `mcp_server.py:32`, `app.py:181` and `assets.py:455` (`--site` → `--world`).
  - `remotion/tools/sync-town.sh:4,7`: `TOWN` default → `$HERE/../../johansson-world`.
  - The capture tools' `SITE=…/nj22az.github.io` plus `/johansson-town/?audit` → serve `/home/user` and open `/johansson-world/?audit`
    (`content/onsen-breaker/stage-plan.md:356`, `remotion/FILM.md:28`).
  - `studio/material.py:24`: `JOJO_MATERIAL` default → `../sjoskolan/sjoskolan`.
  - `content/COMIC-MAKER.md:8-10` → `/johansson-studio/`.
  - Skills `film-director/SKILL.md:57` and `comic-layout/SKILL.md:136`; agents `set-designer.md:15,28,32` and `street-designer.md:30`.
- **Claude GitHub App:** this session gets "not enabled for this session" for `elteknik-och-ellara` and `stepbuddy`. The new repos must be
  selected when a session starts, or attached with `add_repo`. They need push access for the publishing sessions.

## 10. Open questions for the creator

1. Elteknik: should `/elteknik/` keep its address by staying on the main site, with the book files built in `nj22az/sjoskolan` and copied over by a workflow
   or by hand, or move to `/sjoskolan/elteknik/` (or `/sjoskolan/bok/`) with stubs and about 45 blog edits? Shopify, printed material and links
   already sent probably point at `/elteknik/`.
2. Motor 90L: World (its code imports World; World's tests and GLB use it) or Sjöskolan (teaching content)?
3. Thuan's Storage: move it into World (recommended) or keep it on the main site and repoint it?
4. What is `nj22az/JT`, and does it replace or feed `johansson-world`?
5. The in-flight `johansson-studio` MCP (`johansson-town/tools/studio/`): World repo or Studio repo?
6. Which `gag-writer.md` wins, the site's or jojo's?
7. Should history be kept (an Actions `filter-repo` import), or should each repo start fresh with a pointer to the old repo?
8. Sjöskolan's switch window: which day or hour has no lessons? Rollback (disable Pages or rename the repo) depends on the probe's result.
9. Should the other open PRs against main (#155 etc.) be closed?
