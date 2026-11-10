# Pocket Camera handover: the highlight is the World's green, the Game Room has a door on the title screen — 10 November 2026

**Branches** `claude/laughing-brahmagupta-ybyndm` in **two repositories**:
- `nj22az/nj22az.github.io` (this one): the camera.
- `nj22az/johansson-town`: the World's stylesheet cleanup, its brand folder and its checks' time limit
  (`briefs/HANDOFF-BRAND-CLEANUP-2026-11-10.md` there).

**Release** `v2026.11.10.1`, key `20261110green1` (page, `app.js`, `camera.css`, `camera-ui.css`, `camera-black.css`,
`game-room-refresh.css`, `camera-brand.css`, `looks-gl.js`, `frames.js`, `background.js`, `social-share.js`,
`memory.js`, `blackjack.js`, `solitaire.js`, `ball.js`, `stickers.js`, `face-stamps.js`, `pocket-faces.js`).
**Not published.** Both branches wait for the owner's "Push to main". Live is still `v2026.11.09.2`.

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

## Open, for the owner

1. **Publishing**: "Push to main" publishes both. The Town first is not needed this time (the camera does not depend
   on the World's cleanup), but the Town's guard workflow only runs on its `main`.
2. **Not seen on a physical iPhone**: this round, and still neither landing page of 9 November. Software Chromium only.
3. Someone with the app on the Home Screen keeps the gold icon until they remove it and add it again.
4. The fun audit's three rounds are still unstarted (`AUDIT-FUN-2026-11-09.md`); the door on the title screen is the
   first step of its "front door" round.
