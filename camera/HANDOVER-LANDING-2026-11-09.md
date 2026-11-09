# Pocket Camera handover: the landing page redrawn from the World's real title; the World's own title fixed — 9 November 2026

**Branches** `claude/laughing-brahmagupta-ybyndm` in **two repositories**:
- `nj22az/nj22az.github.io` (this one): the camera's landing page and brand layer, the Studio page's font link.
- `nj22az/johansson-town`: the World's title screen (`briefs/HANDOFF-TITLE-FONTS-2026-11-09.md` there).

**Release** `v2026.11.09.2`, key `20261109brand2`. **Published in both repositories** on the owner's "Push to main"
(9 November 2026), the Town first: see "Publication" below.
This corrects [the brand round](HANDOVER-BRAND-2026-11-09.md), published earlier the same day as `v2026.11.09.1`.

## The owner's words

- "How about the landing page it doesn't look quite right, I mean for the camera app"
- "Johansson Worlds landing page is a bit off too"

## What was wrong, and whose fault

**The camera's landing page: mine.** The brand round drew the World's wordmark from `johansson-town/landing.css`
(`.logo-main`, `.logo-town`, the `--ts-*` colours: yellow and orange letters with a green outline, WORLD in a tilted red
box, a white pill) and took a gold, a navy "ink", a paper and a rust from `base.css`, and Avenir Next from its font
list. None of that is what the World shows. `title-screen.css` and `line-ui.css`, later in the page, override all of
it: the drawn title is JOHANSSON in `#263d39` over WORLD in `#16815e`, plain LINE Seed JP ExtraBold, on cream
`#f5f5ec`, with a green Start button, and in the live World `--gold` and `--rust` both resolve to its green. I read
stylesheets and never looked at the rendered screen or asked which rule won. On the landing page the result was a
garish toy mark on a grey slab, the greeter overlapping its last letters, an empty navy band above (the bar, with its
lockup hidden), and a blank band over the card.

**The World's own title: a real fault in the World**, found while comparing. Every plain vowel on the island was drawn
in a second typeface (see the Town's handoff): JOHANSSON was six glyphs of LINE Seed JP ExtraBold and three of Figtree.
Also there: the Studio link dark on the night harbour, and the copyright pill cut at the fold on an iPhone's Safari.

## What changed here

- **The wordmark is the World's, as outlines.** `tools/draw-camera-wordmark.py` shapes JOHANSSON and WORLD in LINE Seed
  JP ExtraBold at the World's own setting (HarfBuzz for the kerning a browser applies, fontTools for the outlines) and
  the kana ポケットカメラ in Bold; `camera/brand/wordmark.json` keeps them; `tools/apply-camera-wordmark.mjs` writes
  them into `camera/index.html` between its wordmark markers (`--check` in `wordmark.test.mjs`).
  `camera/brand/world-wordmark.svg` is the mark alone.
- **The title card** (`camera-brand.css`, layout in `camera-ui.css`): the World's cream card in both themes; the
  wordmark and the stamp at the left, sized from the card's width (`--wm`); the greeter at the right in the room they
  leave (`max-width:37%`), never over them; the card flexes to 220 px on a tall phone. "Pocket Camera" in the World's
  typeface; the Start button the World's green. The idle bar has no lockup and no rule.
- **A container-query trap, kept as a comment in the CSS:** the card's height comes from flexing, and a flexed height
  answers `cqh` with 0 in Chromium, so `min(54cqw, 44cqh…)` made the wordmark vanish at every size but the
  fixed-height iPhone SE one. Only the width is asked of the container now. The welcome's own container queries name
  the stage (`@container stage (…)`), since the card is a container too.
- **The brand's typeface**: `camera/fonts/line-seed-jp-latin-700.woff2` and `-800.woff2` (7 KB each, Basic Latin and a
  few marks, OFL 1.1 in `OFL-LINESeedJP.txt`), `--font-brand` first. The suite asks the browser which font draws the
  lockup (CDP platform fonts), not the stylesheet.
- **Tokens** (`camera.css`): `--bar` in dark is the page's own `#0d0e10` again (theme colour and manifest with it);
  `--brand` is the World's green as text (`#7fcaa5` dark, `#0e5f43` light: 4.5:1 on the Game Room's paper needed the
  deep one); `--accent-soft` in dark back to its warm `#383225`; the navy, paper, gold-as-brand and rust tokens are
  gone. `--accent` (the gold for what is chosen) is unchanged and is now described as the camera's own.
- **Share card** (`social-share.js`): the World's ink, green and cream, in LINE Seed JP once it is loaded.
- **Game Room**: the kicker in `--brand`; its CHOOSE A GAME label keeps the room's own gold in the dark.
- **Two checks that failed now and then, fixed at the cause.** Ball: after "Use these" in the booth the list of faces
  went on showing the earlier choice until the four pictures had loaded (`useFace` drew the list last); it is drawn at
  once now, and the suite reads the head at every frame instead of two faces a quarter of a second apart. Integration:
  the suite took the recipe to expect while the face pack was still searching; it waits for the search to end.
- **Johansson Studio** (`avatar-creator/index.html`): Google's Figtree subset link removed; the face now comes from the
  Town's `line-ui.css`. **Publish the Town first**: until its `line-ui.css` is live, a Studio without the link would
  draw ā ē ī ō ū in LINE Seed JP (the bar beside the letter).

## Checks

The whole Pocket Camera regression on the finished code, as `.github/workflows/pocket-camera.yml` runs it (Playwright's
Chromium on SwiftShader, the published baselines from `camera/tests/fixtures/published-baselines/`), with nothing
failing:

- the 22 unit files, `wordmark.test.mjs` new among them;
- the 26 browser suites: camera 56, crop 33, enhance 22, save-share-layout 14, paper 5, integration 9,
  sticker-contour 4, ui 82, audit 59, smart 14, offline 13, retouch 40, screens 5, face-stamps 12, backup 7, pop 5,
  zoom 13, face-pack 4, auto 5, theme 5, defaults 4, background 3, comic 4, album 3, faces 7, ball 6, brand 9.

The run before it failed integration and Ball; both were races, described above, and each was then run alone until it
held (integration 3 of 3 with the baselines, Ball 5 of 5) before the whole regression was run again.

Looked at, not only measured (`camera/qa/2026-11-09-landing/`): the landing page before and after, installed and in
Safari, dark and light, on an iPhone SE's height, an iPad's and a desktop's; the running camera's bar; the Game Room;
the share card; the World's title before and after, with its wordmark enlarged.

In the Town (its handoff has the detail): `tools/font-audit.mjs` fails on the old state and passes on the new; the
title measured at eight sizes; the three tests that read the changed files pass (13). The Town's full guard was not run
(its checkout had no `npm ci`).

## Publication

**The Town** (`nj22az/johansson-town`): `main` `fc7281f` → `4deb767`, then `fcbcae9`.
- The first deployment did not go live: `actions/deploy-pages` gave up after its ten minutes with Pages still
  `syncing_files` and cancelled it. This session's integration may neither re-run a job nor dispatch a workflow there
  (403), so `pages.yml` was given thirty minutes for the deployment and that commit, pushed to `main`, published: the
  second run took 47 seconds.
- Live: six changed files match the repository byte for byte (the page, `line-ui.css`, `title-screen.css`, the
  creator page, the font file, its licence). The live title on a phone, by the browser's own account: JOHANSSON
  LINE Seed JP ExtraBold × 9, WORLD × 5, the tag × 32, the stamp × 16; "Sakura Shōten, Kōji, Ōshiro" LINE Seed JP × 24
  and Figtree × 3; nothing under the fold at 390 × 664; the Studio link on its backing; no Google Figtree link; no
  page errors.
- Its guard workflow: the `guard` job (the tests of `tests/ci-guard.txt`) passed on both pushes. The `iphone-startup`
  job failed on the first push at "authored dining exit approach failed" in the Izakaya, after start-up, rotation and
  reload had passed; the Town's handoff has it. That workflow had never completed in the Town's repository before.

**The Office** (this repository): `main` had moved meanwhile (`efe4a45df`, another session's ferry viewer, `/ferry/`),
so it was merged into the branch (no camera file touched; the bundle, module and wordmark tests re-run) and `main`
fast-forwarded to `ca4021019`. Pages run 42716476625 succeeded.
- Live: 16 files match byte for byte (the page, `app.js`, the four stylesheets, `ball.js`, `social-share.js`, the
  manifest, `offline.json`, `sw.js`, the two font files and their licence, the Studio page, the ferry's page).
- The live landing page at 390 × 664 (dark), 375 × 560 (light) and 390 × 844 (dark): `v2026.11.09.2`; the wordmark's
  outlines `rgb(38,61,57)` and `rgb(22,129,94)` on `rgb(245,245,236)`; 45 to 91 px between the wordmark and the
  greeter; the whole greeting on the first screen; Start in the World's green; the theme colour `#0d0e10` in dark and
  `#faf8f2` in light; no page errors.
- The running camera's lockup is drawn by LINE Seed JP (15 and 13 glyphs, no fallback).
- Johansson Studio, live, with Google's subset gone: "Sakura Shōten, Kōji" is LINE Seed JP × 17 and Figtree × 2.

## Open, for the owner

1. **The camera's working highlight.** The gold for what is chosen was sold as "the World's gold"; the World has none.
   It can stay (a camera's yellow, as an iPhone's) or become the World's green everywhere. The editor in both, side by
   side in dark and light: `camera/qa/2026-11-09-landing/option-highlight-gold-or-green.jpg` (the tokens overridden in
   the page for the picture; nothing changed in the code). The Home Screen icon (dark teal ground, gold ring) goes
   with that choice.
2. **Not seen on a physical iPhone**, either landing page. Software Chromium only.
3. LINE Seed JP's licence file in the fontsource package is headed "Google Inc." where a copyright line would be; the
   typeface is LINE Corporation's, released under OFL 1.1. The file is copied as shipped.
4. The fun audit's three rounds are still unstarted.
