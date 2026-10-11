# Map: Sjöskolan (+ Elteknik book, EL-LABB, Motor 90L) → nj22az/sjoskolan

Read-only survey of `/home/user/nj22az.github.io` (branch `claude/sjoskolan-youtube-strategy-gofi3o` @ 553ade6e, compared
with `origin/main` @ 3c9e75bd) and `/home/user/jojo`. Nothing was changed, committed or pushed. No secret values were read.
Date: 2026-10-11.

## 0. Bottom line

- **Sjöskolan has few outward ties.** It does not use `shared.js`, `config.js`, `styles.css`, `css/` or the theme
  scripts, and has no root `package.json` or `requirements.txt`. About 770 absolute `/sjoskolan/...` URLs in 166 files keep
  working unchanged, because a project repo named `sjoskolan` is served at `/sjoskolan/` on the same origin
  (`https://nj22az.github.io`).
- **Recommended layout: keep the `sjoskolan/` folder as a subfolder of the new repo** (repo root = `sjoskolan/`,
  `elteknik/`, `.github/`, licence files), and deploy Pages with GitHub Actions. The deploy job builds `_site` from
  `sjoskolan/*` plus `elteknik/` (served at `/sjoskolan/elteknik/`).
  With this layout, about 25 tools and tests that assume "repo root contains `sjoskolan/`" keep working with no edits:
  Python `parents[3]`/`SJO.parent`, tests `new URL('../../../')`, Playwright `--directory ../..`, the figure specs'
  `"src":"sjoskolan/..."`, `bok.py`'s `REPO/elteknik/files`, and the CI `paths:`.
  Some of those tests are inside the **week-40 hash lock** (`verktyg/las/vecka-40.json`: `vecka-40/aktuell/*.test.mjs`).
  Flattening the repo would mean unlocking week 40 to edit them.
- **Must fix before World leaves `/johansson-town/` (this is needed whatever happens to Sjöskolan):** the simulator room
  `sjoskolan/simulatorer/` (Station A and B) loads three.js r170 at runtime from `../../johansson-town/vendor/`. Students
  reach it from week 41 ("Simulerade stationer A, B och C"). The fix is to give it its own copy.
- **Must fix in the new repo:** `verktyg/qa/week40.py` (CI) checks every `href`/`src` as a file under the repo root. 17
  week-40 pages link `/assets/images/apple-touch-icon.png`, which lives on the main site, so CI goes red in the new repo.
- **Elteknik:** move `elteknik/` with Sjöskolan, because `sjoskolan/innehall/bok/bok.py` writes
  `elteknik/files/bok.*.enc`. The main site keeps a stub at `/elteknik/`, because only the user-site repo can serve
  `/elteknik/`. The main-site blog (6 pages), the portal card and the sitemap point at `/elteknik/styles.css` and
  `/elteknik/files/*`. A page stub cannot redirect a CSS, JPG or PDF, so those links have to be edited.
  **The Shopify product page links to `https://nj22az.github.io/elteknik/`** (checked live, read-only).
- **EL-LABB (`ellab/`) stays on the main site.** It is already only a "retired, use these labs" notice at `/ellab/`
  (2 files, 12 KB). Moving it would just leave the same stub behind.
- **Motor 90L → johansson-world**, not Sjöskolan (see §11).

## 1. Recommended new repo `nj22az/sjoskolan`

```
sjoskolan/                      unchanged subtree (2230 tracked files, 316.5 MB) → served at /sjoskolan/
elteknik/                       book page + files (11 files, 8.2 MB)          → served at /sjoskolan/elteknik/
.github/workflows/sjoskolan.yml           copy the WORK-BRANCH version (main lacks workflow_dispatch)
.github/workflows/multimeter-browser.yml  copy the WORK-BRANCH version (main has the old 15-min, no-cache job)
.github/workflows/pages.yml               NEW (sketch below)
.gitignore        root .gitignore lines 12–17 (+ node_modules/, __pycache__/, .DS_Store)
LICENSE.md        copy (sjoskolan/README.md:21 links ../LICENSE.md)
THIRD_PARTY_NOTICES.md   Sjöskolan parts of the root file (lines 13–25 film companions: Anidoodle Apache-2.0 + NOTICE,
                  Helios ELv2, kokoro-onnx MIT, DejaVu fonts; line 37 three.js MIT; lines 99–106 multimeter refs; 117 kallor)
CLAUDE.md         root CLAUDE.md lines 188–212 (Sjöskolan, Övningsinnehåll, Notation, Översättning) + publishing notes
README.md
```

Pages deploy sketch (Settings → Pages → Source: GitHub Actions):

```yaml
name: Publicera Sjöskolan
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: false }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: '${{ steps.d.outputs.page_url }}' }
    steps:
      - uses: actions/checkout@v6
      - run: |
          mkdir -p _site
          git archive HEAD sjoskolan | tar -x --strip-components=1 -C _site   # tracked files only, no node_modules
          git archive HEAD elteknik  | tar -x -C _site                        # → /sjoskolan/elteknik/
          printf '{"repo":"%s","sha":"%s"}\n' "$GITHUB_REPOSITORY" "$GITHUB_SHA" > _site/publicerad.json
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: _site }
      - id: d
        uses: actions/deploy-pages@v4
```
`publicerad.json` is a marker. During the cutover it shows that `/sjoskolan/` is now served by the new repo. The site is
about 325 MB, which is under the 1 GB Pages limit; no single file is over 37 MB.

## 2. Moves / stays

| Item | Decision | Why |
|---|---|---|
| `sjoskolan/` | **move** (keep as subfolder) | the course |
| `elteknik/` | **move** to repo root → `/sjoskolan/elteknik/` | `bok.py` writes `REPO/elteknik/files`; book content is built from `sjoskolan/innehall` (`innehall.py bygg bok`) |
| `.github/workflows/sjoskolan.yml`, `multimeter-browser.yml` | **move** (branch versions) | Sjöskolan CI |
| World `johansson-town/vendor/three.module.js` (r170, sha256 89074684…), `BufferGeometryUtils.js` (3de83209…), `LICENSE-THREE.txt` | **copy** into `sjoskolan/simulatorer/vendor/` | simulator runtime + tests; hashes already recorded in `simulatorer/snapshot.json` vendorFiles and still match |
| `ellab/` | **stay on main** (notice page at `/ellab/`) | only the user-site repo can serve `/ellab/`; old code is only in git history |
| `motor-90l/` | **→ johansson-world** | runtime- and test-coupled to World (§11) |
| `blog/elteknik/` | stay on main | the main blog's series; `INVENTERING.md:45` says it is outside the course's scope |
| `assets/images/apple-touch-icon.png` | **stay on main, never delete** | 111 Sjöskolan HTML pages, 9 generators and the encrypted teacher-page wrapper reference `/assets/images/apple-touch-icon.png`; week-40 pages are hash-locked and teacher pages are encrypted, so they cannot simply be rewritten |
| `assets/js/shopify-book-price.js` | stay on main (or copy into `elteknik/`) | used by `elteknik/index.html:51`, main `index.html:24`, `blog/elteknik/*` |

## 3. Outbound dependencies (Sjöskolan / Elteknik → elsewhere)

| From | To | Kind | After the split / fix |
|---|---|---|---|
| `sjoskolan/simulatorer/character/build.js:1-2`, `character/cel.js:1`, `erik-visar.mjs:4`, `scene.mjs:1`, `vaxelstrom/scen.mjs:3`, `vaxelstrom/manus.mjs:5` | `../../(..)/johansson-town/vendor/three.module.js`, `BufferGeometryUtils.js` → URL `/johansson-town/vendor/...` | ES module import (runtime) | Breaks when `/johansson-town/` becomes redirect stubs (a module import does not follow an HTML redirect) and in the new repo (the file is absent). Fix: copy the 2 files + licence into `sjoskolan/simulatorer/vendor/`, point all 8 import lines (7 three, 1 BufferGeometryUtils) at the same path (one three instance), and update `snapshot.json:13`. Do it now, before the World move. `simulatorer/` is not week-locked. |
| `sjoskolan/simulatorer/vaxelstrom/session.test.mjs:7` | same three.module.js | test import | same fix |
| `sjoskolan/simulatorer/snapshot.json:13,21-31` | `johansson-town/...` hashes | provenance (doc) | keep as provenance; vendor hashes still match today; the avatar copies (`character/*.js`) deliberately differ from current World |
| `sjoskolan/verktyg/qa/week40.py:47-55` (run by CI `sjoskolan.yml:33`) | `ROOT/assets/images/apple-touch-icon.png` for 17 week-40 pages | CI link check | CI fails in the new repo (`missing /assets/images/apple-touch-icon.png`). Fix (week40.py is not locked): skip links outside `/sjoskolan/` (main-site paths), or add a test-only `assets/images/apple-touch-icon.png` at the repo root (not deployed). |
| 111 `sjoskolan/**/*.html` (e.g. `vecka-40/aktuell/*.html`, `larare/*.html`) + generators `innehall/export/{delsidor,delsidor_veckor,lektioner,beteckningar}.py`, `verktyg/{veckosidor/bygg.py,veckosidor/arbetsvecka40.py,inlamning/bygg.py,formelsamling/bygg.py,larare/las.mjs}` | `/assets/images/apple-touch-icon.png` (main site) | icon link (runtime) | Keeps working (same origin) **as long as main keeps the file**. Only cosmetic if missing. |
| `elteknik/index.html:18-19` | `/assets/images/apple-touch-icon.png` | icon | same |
| `elteknik/index.html:51` | `/assets/js/shopify-book-price.js` | script (live price) | works cross-repo; optionally copy into `elteknik/` to decouple |
| `elteknik/index.html:57,239` | `/` (portal) | link | works |
| `elteknik/index.html:172-178` | `/blog/elteknik/...` (5 posts + index) | links | work (main site) |
| `elteknik/index.html:8,10,14,39,40` | `https://nj22az.github.io/elteknik/` (canonical, og:url, og:image, JSON-LD) | SEO | update to `/sjoskolan/elteknik/` |
| `elteknik/unlock.js:11-12,26` | `files/bok.*.enc`, `files/manifest.json` (relative) | fetch | no change |
| `sjoskolan/innehall/bok/bok.py:22-24` | `REPO/elteknik/files` | build output | works only if `elteknik/` sits at the new repo root (recommended layout) |
| `sjoskolan/innehall/migrering/kallor.py:13-14,44`, `familjer.py:48` | `git show 8cabde3:sjoskolan/...` in nj22az.github.io history | one-off migration, git history | fails in a new repo (SHA or history absent). Keep the old repo history; mark the tool as historical. Exercise records store `revision: 8cabde3` (provenance only). |
| `sjoskolan/README.md:21-22` | `../LICENSE.md`, `../THIRD_PARTY_NOTICES.md` | docs | copy both files to the new repo root |
| `sjoskolan/kallor.html:1` | `github.com/nj22az/nj22az.github.io/blob/main/{LICENSE,THIRD_PARTY_NOTICES}.md` | link | keeps working while the old files exist; better to point at the new repo |
| `sjoskolan/multimeterfilm/index.html:18` | `github.com/nj22az/nj22az.github.io/tree/main/sjoskolan/multimeterfilm` | source link | goes stale once the folder leaves main → point at `github.com/nj22az/sjoskolan/tree/main/sjoskolan/multimeterfilm` |
| `sjoskolan/multimetersimulator/acceptance/2026-09-27.md:48` | old repo Actions run URL | evidence (doc) | keep (historical) |

These need no change if the `sjoskolan/` subfolder is kept:
- `vecka-40/aktuell/resultat-teacher.test.mjs:12-13` (week-locked), `vecka-41/aktuell/resultat-teacher.test.mjs:10`
- `vaxelstromslabbet/tests/{guided,free}.test.mjs:2-8`, `vaxelstromslabbet-utkast/tests/*`
- `vecka-40/aktuell/arbetsrum-ui.test.mjs` (week-locked)
- `multimetersimulator/playwright.config.mjs:20-21`, `simulatorer/playwright.config.mjs:20-21` (serve `../..`, open `/sjoskolan/...`)
- `verktyg/qa/week40.py:17` (`parents[3]`), `verktyg/figurer/fig3d.py:8,21`, `figurkontroll.py:28`, `spec40–45.json` (`"src":"sjoskolan/..."`)
- `innehall/bok/README.md:18` ("run from the repo root")

## 4. Inbound links that must keep working

| From | To | Kind | Status after the move |
|---|---|---|---|
| `config.js:62` | `/sjoskolan/` | portal card | unchanged URL, OK |
| `sitemap.xml:4` | `https://nj22az.github.io/sjoskolan/` | sitemap | OK |
| `ellab/index.html:26-30` | `/sjoskolan/{multimetersimulator,vaxelstromslabbet,trefaslabbet,hallkretslabbet}/`, `/sjoskolan/` | links | OK |
| `sjoskolan/verktyg/formelsamling/bygg.py:31` → printed `sjoskolan/gemensamt/Formelsamling.pdf` | `https://nj22az.github.io/sjoskolan/gemensamt/Formelsamling.html` (printed URL **and QR code**) | print/QR | OK (same path) |
| `sjoskolan/vecka-40/aktuell/resultat.mjs:15,109`, `vecka-41/aktuell/resultat.mjs:18,75` | `location.origin + /sjoskolan/larare/resultat(-v41).html#r=…` | result-code link + QR handed to the teacher | OK (same origin and path) |
| `verktyg/ac/build-decks.mjs`, `innehall/export/*.py`, `verktyg/veckosidor/bygg.py`, `verktyg/inlamning/bygg.py`, `verktyg/larare/larar{noter,manus}.py` | `https://nj22az.github.io/sjoskolan/...` written into slides, PDFs and pages | print/slides | OK |
| `sjoskolan/vecka-39/aktuell/v39_03_Multimeter_och_matfel_elev.pptx` (text) | `/sjoskolan/vecka-39/aktuell/Multimeter_sjofart_elev_v6.pptx` | slide text | already stale (the file is in `vecka-39/arkiv/2026-09-24/`); not caused by the split |
| 81 canonical tags, `innehall/schema/*.schema.json` `$id` | `https://nj22az.github.io/sjoskolan/...` | SEO/schema | OK |
| Students' bookmarks, LMS links, home-screen icons | `/sjoskolan/...` | external | OK |
| **Shopify product `elteknik-och-ellara` (id 16055390503242) descriptionHtml** ("Provläs gratis … på nj22az.github.io/elteknik") | `https://nj22az.github.io/elteknik/` | external link | needs the `/elteknik/` stub on main, then update the description (creator) |
| `config.js:72` | `/elteknik/` | portal card | stub covers it; better to update to `/sjoskolan/elteknik/` |
| `config.js:75` | `/elteknik/files/omslag.jpg` | image | **breaks**: update the path or keep a frozen copy on main |
| `blog/index.html:40` / `:45` | `/elteknik/files/omslag.jpg` / `/elteknik/` | image / link | image **breaks**: update |
| `blog/elteknik/index.html:22,88,90,136,146` | `/elteknik/styles.css`, `/elteknik/`, `omslag.jpg`, `provkapitel.pdf` | stylesheet, links, image, PDF | **stylesheet, image and PDF break.** Copy `styles.css` into `blog/elteknik/` (removes the cross-repo CSS dependency) and point files at `/sjoskolan/elteknik/files/…` |
| `blog/elteknik/trefas-440-v-60-hz/index.html:22,131,140,156` | same | same | same |
| `blog/elteknik/pumpen-som-inte-startar/index.html:22,99,108,124` | same | same | same |
| `blog/elteknik/lanternan-som-lyser-svagt/index.html:22,137,146,162` | same | same | same |
| `blog/elteknik/isolationslarmet/index.html:22,123,132,148` | same | same | same |
| `blog/elteknik/fem-sakerhetsregler/index.html:22,103,112,128` | same | same | same |
| `blog/elteknik/article.css:1` | "builds on /elteknik/styles.css" | comment | update |
| `sitemap.xml:5` | `https://nj22az.github.io/elteknik/` | sitemap | replace with `/sjoskolan/elteknik/` |
| Social previews (og:image) already shared | `https://nj22az.github.io/elteknik/files/omslag.jpg` | external | breaks unless a frozen copy is kept on main |
| `elteknik/files/provkapitel.pdf` (free sample) | contains **no** site URL (checked with PyMuPDF: no links, no "github.io" text) | print | OK |
| Full book `bok.pdf.enc` / `bok.epub.enc` (also the PDF sold on Shopify) | unknown, encrypted | print | **cannot check without BOKLOSEN**. If it prints `nj22az.github.io/elteknik`, the `/elteknik/` stub must stay forever. |

`/elteknik/` stub on main: `elteknik/index.html` with `<meta http-equiv="refresh" content="0; url=/sjoskolan/elteknik/">`,
`<link rel="canonical" href="https://nj22az.github.io/sjoskolan/elteknik/">` and
`location.replace('/sjoskolan/elteknik/'+location.search+location.hash)`.

## 5. Root files Sjöskolan / Elteknik use

| File | Used by | Plan |
|---|---|---|
| `assets/images/apple-touch-icon.png` | 111 Sjöskolan pages, `elteknik/index.html`, `ellab/index.html`, 9 generators | keep on main (contract) |
| `assets/js/shopify-book-price.js` | `elteknik/index.html:51` | keep, or copy |
| `LICENSE.md`, `THIRD_PARTY_NOTICES.md` | `sjoskolan/README.md:21-22`, `kallor.html` | copy/split |
| `.gitignore:12-17` | content DB build, `.skyddat/`, `bok/.bok/`, `__pycache__/`, utkast `node_modules` | copy |
| `.nojekyll` | main Pages (Jekyll off) | not needed with the Actions deploy (harmless) |
| `CLAUDE.md:188-212` | Sjöskolan rules | move; leave a pointer on main |
| `shared.js`, `config.js`, `styles.css`, `css/`, `theme-bootstrap.js`, `subpage-theme.*`, `tools/`, `functions/`, `wrangler.toml` | **not used** by Sjöskolan, Elteknik or EL-LABB | — |
| root `package.json` / `requirements.txt` | **none exist** | per-folder `package.json` + lock: `multimetersimulator`, `simulatorer`, `vaxelstromslabbet`, `vaxelstromslabbet-utkast`, `multimeterfilm`, `innehall/bok/sattning` |

## 6. CI

`.github/workflows/sjoskolan.yml` (paths `sjoskolan/**` and itself; push/PR on any branch; on the branch it also has `workflow_dispatch`):
- checkout@v6; setup-node@v6 with Node **22.16.0** (line 20); setup-python@v5 with Python **3.11** (line 24); `pip install python-pptx` (line 26).
- `innehall.py validera` and `kontrollera`; `verktyg/las/veckolas.py kontrollera`; `verktyg/qa/week40.py`; unittest for `verktyg/las` and `innehall/tests`.
- `node --test sjoskolan/*/model.test.mjs verktyg/larare/las.test.mjs gemensamt/labbprotokoll.test.mjs`.
- `vecka-40` and `vecka-41/aktuell/resultat*.test.mjs` with **secret `LARARLOSEN`** (lines 42, 46). Without it the
  teacher tests are skipped, not failed.
- `npm ci && npm test` in `multimetersimulator` and `vaxelstromslabbet`; `arbetsrum*.test.mjs`; `filmer/check.mjs`.
- The `simulatorer/` tests (`npm test` there) are **not** in CI today.

`.github/workflows/multimeter-browser.yml` (paths `sjoskolan/multimetersimulator/**`, `sjoskolan/gemensamt/**`):
- Node **24** (line 24); `npm ci`; Playwright browsers cached (key = `multimetersimulator/package-lock.json`).
- `playwright install chromium webkit` + `install-deps` (12-min limit); `npm test`, `npm run test:browser`.
- Uploads `test-results/` and `playwright-report/`. 30-minute job timeout (branch version; main still has 15).

Secrets, names only: **`LARARLOSEN`** (CI). Local-only environment variables, never stored in the repo: `BOKLOSEN`,
`LARARGUIDE_KLARTEXT`, `LARARLOSEN_GAMMALT` (rekey), `LOSEN` (`innehall/lib/krypto.mjs`), `BOK_EPUB_DIR`.

Tool dependencies:
- Python, outside the standard library: python-pptx, matplotlib, Pillow, qrcode, PyMuPDF, numpy, onnxruntime, kokoro-onnx.
- Node: Playwright 1.56.1, jsdom 30.1.1, happy-dom 20.14.5, esbuild 0.25.5, three 0.186.1 (bundled into `motorlabbet/scen.js`
  and `generatorn/scen.js`), pagedjs 0.4.3, Helios 5.13.2.
- Other: LibreOffice and Chromium for the heavy exports.

## 7. Generated files

- `innehall.py bygg` builds the course pages, simulators' `*.gen.mjs`, worksheets, submission pages, exam and id register.
- The heavy exports are `bygg presentationer` (pptx, PDF, slide shows), `bygg larare` (needs LARARLOSEN and
  LARARGUIDE_KLARTEXT) and `bygg bok` (needs BOKLOSEN; writes `../elteknik/files/bok.epub.enc` through `bok/bok.py packa`).
- `innehall.py kontrollera` (CI) checks that the generated files are current, the notation, the week lock and the
  translation script. It only scans `sjoskolan/` (`SJO.rglob`).
- **Do not put `elteknik/` or `ellab/` inside `sjoskolan/`.** Their pages lack `oversattning.js`, and
  `innehall.py:243-249` would fail CI.
- The week lock (`verktyg/las/vecka-40.json`, 174 files) uses paths relative to `sjoskolan/`, so it is portable. Do not
  edit locked files during the move.

## 8. Protected content (no passwords in the repo; none were printed)

- `sjoskolan/innehall/skyddat/larare.enc` (LARARLOSEN) and `bok.enc` (BOKLOSEN) are the encrypted parts of the content
  database. `innehall.py skyddat packa-upp` decrypts them into the git-ignored `.skyddat/`.
- Teacher pages (`sjoskolan/larare/*.html`, the lab handbook) are a wrapper page holding a
  `<script id="lock-data">{v,it,salt,iv,ct}</script>` envelope. The browser decrypts it with WebCrypto
  (AES-256-GCM, PBKDF2-SHA-256, 600 000 rounds). Tooling: `verktyg/larare/las.mjs` with `lock`, `unlock` and `rekey`.
  `larare/filer/*.enc` holds 19 encrypted teacher files.
- Book: `elteknik/files/bok.{pdf,epub}.enc` use the format `"NJENC1"` + salt(16) + iv(12) + AES-256-GCM ciphertext, with
  PBKDF2-SHA-256 rounds taken from `files/manifest.json` (600000). `elteknik/unlock.js` decrypts in the browser.
- All of this works the same under the project site (relative and `/sjoskolan/...` paths, same origin, sessionStorage
  per origin).
- **Unknown:** whether the encrypted teacher pages reference root paths such as `/johansson-town/` or `/elteknik/`. This
  needs a local `las.mjs unlock` plus grep by the creator, or a browser test after the cutover.

## 9. Translation script

Pages load `/sjoskolan/gemensamt/oversattning.js` with an absolute path; it is unchanged under the project site. The check
is `innehall.py:242-249` (CI), which skips `arkiv/`, `node_modules/`, `innehall/` and lock-data pages. 90 pages carry it.

## 10. Simulators importing World code

- **Files used:** only `johansson-town/vendor/three.module.js` (r170, 1.31 MB) and `BufferGeometryUtils.js` (31 KB; it
  imports `./three.module.js`, so it needs no import map).
- World's avatar code was already copied into `sjoskolan/simulatorer/character/` (build, cel, erik, face, head-profile,
  johansson, recipe, world-uv). Those copies import only three.
- **Own copy:** yes. Add `sjoskolan/simulatorer/vendor/{three.module.js,BufferGeometryUtils.js,LICENSE-THREE.txt}` and edit
  8 import lines. That is +1.35 MB, with identical bytes, so there is no behaviour change.
- `motorlabbet/`, `generatorn/` and `figurer3d/` already ship their own bundled three (0.186.1 via
  `vaxelstromslabbet/node_modules` at build time).
- Storage keys stay separate. The simulator tests check that it never touches `johansson-town-avatar`
  (`simulatorer/session.test.mjs:6,17`, `browser-tests/room.spec.mjs:9,32`).

## 11. Motor 90L (`motor-90l/`, 21 files, 1.0 MB): recommend **nj22az/johansson-world**

- **What it is:** a 3D IEC 90L 1.5 kW pump motor viewer (strip-down/rebuild, Y/Δ, cutaway, .glb export) at `/motor-90l/`,
  plus Erik's workshop routine at `/motor-90l/workshop/` (teaching lock-off, prove dead, Y/Δ and winding tests).
- **Its runtime depends on World:**
  - `motor-90l/workshop/erik.js:5` imports `/johansson-town/src/avatars/build.js`, which imports 16 World modules directly (more transitively).
  - `motor-90l/workshop/index.html:80` has an import map `three` → `/johansson-town/vendor/three.module.js`.
- **World depends on it:**
  - `johansson-town/tools/pack-motor-90l.mjs:26,98` builds `assets/models/props/motor-90l-display.glb` from
    `../../motor-90l/motor.js` and `calc.mjs`.
  - `johansson-town/tests/motor-bench.test.mjs:20` checks their sha256 against `motor-90l-display-provenance.json:3-6`.
  - `src/workshop/motor-bench.js:11` defines `MOTOR_LINKS {stripDown:'/motor-90l/', routine:'/motor-90l/workshop/'}`,
    tested at line 47; it is the in-game link.
- Other users: `jojo/remotion/src/motor/` keeps copies of `motor.js`/`calc.mjs` (README:3). Sjöskolan has **no** runtime
  link; it is mentioned in `simulatorer/PLAN-ERIK.md:37,41` and in a comment in `simulatorer/character/erik.js:3`.
- **So:** move it into johansson-world as `motor-90l/` (→ `/johansson-world/motor-90l/`).
  - Fix World's test and pack paths (`'../../'` becomes `'../'` if `motor-90l/` sits at the World repo root).
  - Update `MOTOR_LINKS` and the workshop import map and import to World's new paths.
  - Leave stubs on main at `/motor-90l/` and `/motor-90l/workshop/`.
- If Sjöskolan later wants it (Station D), it links to `/johansson-world/motor-90l/` (same origin).

## 12. Elteknik and `nj22az/elteknik-och-ellara`

- `elteknik/` on the main site is the book's sales and sample page: `index.html`, `styles.css`, `unlock.js` and `files/`
  (cover, sample chapter, preview pages, manifest, encrypted PDF/EPUB). It has no code ties to the other repo.
- `nj22az/elteknik-och-ellara` (public, has_pages = true, "YH course and matching KDP book. Markdown and figures only.",
  25 MB, last push 2026-09-07):
  - It is live at `https://nj22az.github.io/elteknik-och-ellara/`: a password-gated course portal (roles Elev, Lärare,
    Bok; `site/app.js`, marked@15.0.7 from jsDelivr).
  - It is **not referenced** by nj22az.github.io or jojo, and does not reference `/elteknik/` or `/sjoskolan/` (shell
    page checked).
  - This session cannot read its files; `gh api` returned 403 (repo not attached).
  - The split does not affect it.
- Where `/elteknik/` lives afterwards: **`/sjoskolan/elteknik/`, with a stub left at `/elteknik/`** (§4).
  - Alternative that keeps the URL exactly: a separate tiny repo named `elteknik` (Pages at `/elteknik/`). `bok.py` would
    then need a second checkout or an `ELTEKNIK_DIR`.
  - Another alternative: leave `elteknik/` on main and have `bok.py` write across repos.

## 13. Storage (unchanged origin, so saved data survives)

All keys are per origin, and the project site is the same origin `https://nj22az.github.io`:
- localStorage: `sj-elev-d`, `sj-elevnamn` (`gemensamt/elevtal.mjs:4,27`), `sj-ovningar:`+pathname
  (`gemensamt/ovningsvy.mjs:23`; the pathname is unchanged), `sjoskolan-*` (multimeter, AC, protocols, station rigs),
  `sj-larare-resultat-v40`.
- sessionStorage: teacher pages.
- No service worker, IndexedDB or cookies.

**No migration is needed.**

## 14. Cutover sequence (Sjöskolan part)

0. **Now, in the current repo, before World moves:** vendor three.js into `sjoskolan/simulatorer/vendor/` and fix the 8
   import lines. Browser-check `/sjoskolan/simulatorer/` Station A and B.
1. Creator: create the empty public repo `nj22az/sjoskolan` and add the Actions secret `LARARLOSEN`. Do **not** turn on
   Pages yet.
2. Import a snapshot of `sjoskolan/` + `elteknik/` + the two workflows + licence files from the newest commit:
   - Main plus the branch-only `ANDRINGSLOGG.md` lines and workflow changes.
   - This container cannot do it: about 480 MB is free and the content is 325 MB plus git objects. Use a GitHub Actions
     job in the new repo (sparse, blob-less clone of the public source) or the creator's Mac.
   - Freeze Sjöskolan edits on main from here on.
3. In the new repo: add `pages.yml`, apply the `week40.py` fix, the repo-link fixes and the Elteknik canonical URLs. Get
   `sjoskolan.yml` and `multimeter-browser.yml` green.
4. Outside lesson hours, enable Pages (Source: GitHub Actions) and run the deploy.
   - Check that `/sjoskolan/publicerad.json` names the new repo. Project sites shadow the same-named user-site folder;
     verify this.
   - Smoke-test: course start page, week 41 pages, simulators, result QR, Formelsamling, `/sjoskolan/elteknik/` sample
     and unlock, and one teacher page unlock (creator).
5. Main repo:
   - Delete `sjoskolan/`, `.github/workflows/sjoskolan.yml` and `multimeter-browser.yml`.
   - Replace `elteknik/` with the stub (plus frozen `files/omslag.jpg` and `provkapitel.pdf` if wanted).
   - Fix `blog/elteknik/*` (6), `blog/index.html`, `config.js:72,75`, `sitemap.xml:5`, `.gitignore:12-17`,
     `CLAUDE.md:188-212` (pointer), and the Sjöskolan lines in `LICENSE.md`/`THIRD_PARTY_NOTICES.md`.
   - Keep `assets/images/apple-touch-icon.png`, `assets/js/shopify-book-price.js` and `ellab/`.
6. Creator: update the Shopify description link. Add `nj22az/sjoskolan` to Claude sessions.
   In jojo, change `studio/material.py:24` and `studio/studio.py:1036` from the default `../nj22az.github.io/sjoskolan`
   to `../sjoskolan/sjoskolan`, or set `JOJO_MATERIAL`.

## 15. Open questions

See the structured output; the main ones are history versus a snapshot, timing mid-course, the frozen Elteknik files,
whether the book or teacher pages print site URLs, the gating of deploys on CI, and the Actions billing lock.
