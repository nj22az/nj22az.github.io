# Pocket Camera handover: the highlight is the World's green, the Game Room has a door on the title screen — 10 November 2026

**Branches** `claude/laughing-brahmagupta-ybyndm` in **two repositories**:
- `nj22az/nj22az.github.io` (this one): the camera.
- `nj22az/johansson-town`: the World's stylesheet cleanup, its brand folder and its checks' time limit
  (`briefs/HANDOFF-BRAND-CLEANUP-2026-11-10.md` there).

**Release** `v2026.11.10.1`, key `20261110green1` (page, `app.js`, `camera.css`, `camera-ui.css`, `camera-black.css`,
`game-room-refresh.css`, `camera-brand.css`, `looks-gl.js`, `frames.js`, `background.js`, `social-share.js`,
`memory.js`, `blackjack.js`, `solitaire.js`, `ball.js`, `stickers.js`, `face-stamps.js`, `pocket-faces.js`).
**Published in both repositories** on the owner's "Push to main" (10 November 2026): see "Publication" below.

## The owner's words

"What's your recommendations" → the recommendation: (1) move the camera's highlight from gold to the World's green
everywhere, the Home Screen icon's ring with it; (2) put the Game Room on the camera's landing page; (3) in the World,
delete the dead toy-wordmark and gold styles and add one small brand file; (4) give the World's iPad ferry check a
longer limit. And one thing only the owner can do: look at both landing pages on the iPhone.
→ **"Proceed according to your recommendation"** (10 November 2026).

## What changed here

### The highlight (`camera.css` tokens)

| | dark | light |
|---|---|---|
| `--accent` (what is chosen: text, rings, a slider's travel) | `#5fd6a2` | `#0e5f43` |
| `--accent-fill` (the one main button) | `#16815e` | `#16815e` |
| `--on-accent` (the words on it) | `#fff` | `#fff` |
| `--accent-soft` (a chosen tab's ground) | `#16372d` | `#dff0e6` |
| `--sun` (new: the light chip's sun) | `#f2c35a` | `#9a6a00` |

- Before: `#e2b665` gold on dark, `#7d5a1c` brass on light, dark words on a gold button. The World has no gold.
- White on `#16815e` is 4.84:1; `--accent` is at least 4.5:1 on the page, on a surface and on its own soft ground in
  both themes (the brand suite computes it).
- **What keeps a photograph's colours**, because it is drawn on the photograph: the sun and its track that set the
  light (`.exposure`, `#f2c35a`), the light chip (`--sun`), the date stamp's amber (`--stamp`).
- The printer's light is a green lamp (`#5fd6a2`).
- **The Game Room.** Its own palette stays on its fittings (the gold choice tiles, the score chips, the ♠ ♥ sign, a
  selected Solitaire card on the green felt, where a green ring would not show). Its main buttons and chosen states
  are the green: Blackjack's Hit, Memory's Play, Memory's chosen deck (`#5fd6a2` ring in the dark, `#16815e` on the
  room's paper) and chosen number of pairs (`game-room-refresh.css`, `camera-black.css`). Before, Hit and Ball's Play
  followed the token and Memory's Play was pinned gold, so three games had two colours of main button.
- The album's backup tile: the World's ink with a soft green glyph (it was slate with a gold one).

### The Home Screen icon (`tools/draw-camera-icon.py`, `camera/icons/*`)

The white toy camera on the World's ink (`#263d39`, lit at the top, deep at the foot), the lens ring and the flash in
the World's green (`#16815e`). Four greens for the ring were drawn side by side at 512, 120 and 60 px before choosing:
the World's own reads calmest against the Pocket Look's lime glass. An installed icon keeps its old picture until the
app is removed from the Home Screen and added again (iOS).

### The Game Room's door (`index.html`, `app.js`, `camera-ui.css`)

- The album's card on the title screen is now one of **two doors side by side** (`.welcome-doors`): **Your album**
  (the last photo, or a photo sign when there is none, and "2 photos" / "No photos yet") and **Game Room** (the room's
  ♠ ♥ sign, "Four games"). The pair is 62 px high where the album's card alone was 80, so the greeting still fits an
  iPhone SE's Safari whole.
- Why: a phone shows the title screen at every start unless its browser says the camera is already allowed
  (`maybeStartCamera` in `app.js`), and the room was two taps behind the album.
- `enterGames(fromCamera)` remembers the door: the room's Back says **Camera** and returns to the title screen when
  one came from there, **Album** when one came from the album, and still does after a game.
- Each label is on one line down to a 360-point screen ("Game Room" is 87 points wide in bold 15; under 375 points the
  sign is 34 px and the padding 8).

## Checks

The whole Pocket Camera regression on the finished code, as `.github/workflows/pocket-camera.yml` runs it (Playwright's
Chromium on SwiftShader, the published baselines from `camera/tests/fixtures/published-baselines/`):

- the 22 unit files pass (`offline.test.mjs` on the rebuilt bundle: 379 files, 40.4 MB);
- the 26 browser suites pass: camera 56, crop 33, enhance 22, save-share-layout 14, paper 5, integration 9,
  sticker-contour 4, ui 82, audit 59, smart 14, offline 13, retouch 40, screens 5, face-stamps 12, backup 7, pop 5,
  zoom 13, face-pack 4, auto 5, theme 5, defaults 4, background 3, comic 4, album 3, faces 7, ball 6, brand 11.

It was run twice, with nothing failing either time: once on the round as first built, and again from the start on
the committed bundle after the last change (Memory's chosen number of pairs, and a comment in the page).

`brand.browser.mjs` has two new checks (11):
- the two doors: of one size, side by side, a finger high, on the first screen, each label on one line at 375 × 560,
  360 × 640 and 390 × 844; by the title screen's door Back says Camera, still after a game, and leads back to the
  title screen; by the album's door it says Album and leads there;
- the highlight: `--accent-fill` is `#16815e` in both themes, the words on it and what is chosen keep 4.5:1 on the
  page, a surface and the soft ground, what is chosen is a green; Hit, Play, the chosen deck and the chosen number of
  pairs are painted in it.
The icon check now reads the ring and the flash as exactly `rgb(22,129,94)` on a ground whose strongest channel is green.

One thing learnt while writing the doors check: after `setViewportSize` the browser re-reads its media queries when it
next draws, not when it is measured. The check waits two frames after each resize.

Looked at, not only measured (`camera/qa/2026-11-10-green/`): the running camera, the editor's Looks, Adjust and Frame
tabs in both themes; Memory's setup and Blackjack in both themes; the title screen with its two doors at 375 × 560,
390 × 664, 390 × 844 (dark and light) and 1100 × 760; the Game Room entered from the title screen; the icon.

## Publication

The owner: "Push to main". Both pushes were fast-forwards, at 05:27 UTC on 10 November 2026.

**The camera** (this repository): `main` `f4632430d` → `e205f2f46`. The Pages run for it (42762215980) succeeded;
the live page showed `v2026.11.10.1` 69 seconds after the push. (Another session then put two commits of the ferry
viewer on top, `main` `d6d9e685f`; they touch no camera file, and the branch was brought up to them.)
- 20 live files match the repository byte for byte: the page, `app.js`, the five stylesheets, `offline.json`,
  `sw.js`, the manifest, the five icons, `ball.js`, `memory.js`, `blackjack.js`, `face-stamps.js`, `pocket-faces.js`.
- The live page, headless, at 390 × 664 (dark), 375 × 560 (light) and 390 × 844 (dark): `v2026.11.10.1`; the two
  doors side by side, 62 px high, each label on one line, the whole greeting on the first screen; `--accent-fill`
  `#16815e` with `--accent` `#5fd6a2` in dark and `#0e5f43` in light; Start in `rgb(22,129,94)`; no page errors.
- Through the live Game Room door: Back says Camera, still after a game of Blackjack, and leads back to the title
  screen; from the album it says Album. Memory's Play, its chosen number of pairs and Blackjack's Hit are
  `rgb(22,129,94)`. The live icon's ring and flash are `(22,129,94)` on a `(23,37,35)` corner. The offline worker
  is registered.

**The Town** (`nj22az/johansson-town`): `main` `fcbcae9` → `8a9b2e0`. Its publish run (42762203354) succeeded in
4 min 15 s; the new `brand/brand.json` answered 200 at 05:31:18.
- 9 live files match the repository byte for byte (the page, `landing.css`, `base.css`, `title-screen.css`,
  `line-ui.css`, the three files of `brand/`, `WHERE-TO-EDIT.md`); the live `landing.css` has none of the old names.
- The live title, by the browser's own account: JOHANSSON in `rgb(38,61,57)`, ExtraBold, 28 px on a phone and 52 px
  on a desktop; WORLD in `rgb(22,129,94)`, 24 and 40 px; both `display:flex`, no animation, transform, shadow, box
  or border; `#start` with no ground of its own; the wordmark LINE Seed JP ExtraBold × 9 and × 5, the long vowels
  Figtree × 3 among LINE Seed JP × 24; nothing under the fold at 390 × 664; no page errors.
- **Its guard workflow (42762203444) completed for the first time, every job green**: the guard tests, the iPad in
  landscape (7 min 34 s this time), the iPad in portrait (7 min 46 s), the desktop (11 min 18 s) and the iPhone
  start-up (14 min 6 s, which the old 15-minute limit would barely have let through).

## Open, for the owner

1. **Not seen on a physical iPhone**: this round, and still neither landing page of 9 November. Software Chromium only.
2. Someone with the app on the Home Screen keeps the gold icon until they remove it and add it again.
3. The fun audit's three rounds are still unstarted (`AUDIT-FUN-2026-11-09.md`); the door on the title screen is the
   first step of its "front door" round.
