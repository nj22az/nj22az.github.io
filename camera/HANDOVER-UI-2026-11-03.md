# Pocket Camera: light and dark mode, the UI audit, eyeliner and eyeshadow — 3 November 2026

The owner (3 November 2026): "Add the eyeliner and eyeshadow to the looks, and AUDIT and enhance the UI,
https://github.com/ctpena/asagaoui I need Dark and Light mode". The audit: [AUDIT-UI-2026-11-03.md](AUDIT-UI-2026-11-03.md).
This note records what was built from it, how it was checked, and what is still open.

## State

**The fifth round (the Pop and Comic Looks) is published and verified on 4 November 2026.** The owner: "Push to main".
Main fast-forwarded to [`5749479ae`](https://github.com/nj22az/nj22az.github.io/commit/5749479ae2952e34a680f50a51548cb7fff1a2d8)
(the branch merged with the SC-90 and Minato Maru work that had reached main meanwhile; no camera file touched by it;
the 19 unit files and the comic suite re-run green after the merge). Pages run 1626 deployed it (success); **15/15 public
files match main byte for byte** (SHA-256, cache-busted: the page, `app.js`, `looks-gl.js`, `look-icons.js`,
`camera.css`, `camera-ui.css`, `offline.json`, `sw.js`, the comic, audit and unit tests, the README, this note, the
sheet and HANDOVER.md). On the live page (headless Chromium, 390 × 844): visible version `v2026.11.04.2`, the page and
`camera-ui.css` at `20261104fx1`; nine kinds in one row with no overflow; Pop holds Pop art, Street poster, Neon
lines, Heat camera and Funhouse mirror and Comic holds Comic dots, Golden age, Action manga and Old cartoon; the test
portrait's face was found in 4.1 s and the live engine drew all nine with it (43 Looks; the mean levels of the eight
all differ from the original's), Action manga's spokes in the editor screenshot; no page errors. This round carries
the third (matte) and fourth (album Select, status bar) rounds below to main with it.

**The first release was published and verified on 3 November 2026.** The owner: "Push to main". Main fast-forwarded to
[`b49505ba9`](https://github.com/nj22az/nj22az.github.io/commit/b49505ba96feb38ef530782b105aaeb9fffb2f65) from branch
`claude/laughing-brahmagupta-ybyndm`. Pages deployed it (run 1610, success); **17/17 public files match main byte for
byte** (SHA-256, cache-busted: the camera's `index.html`, `app.js`, `makeup.js`, the four stylesheets, `offline.json`,
`sw.js`, the four changed suites, the README, the audit and this note; the workflow file is not served). On the live
page (headless Chromium, 390 × 844): a light device opened the camera light with `v2026.11.03.3` and the stylesheets at
`20261103ui1`, the Appearance row read Auto, a stored Dark was on the page before the app ran and the browser's theme
colour followed, the worker registered; the test portrait's face was found in 7.8 s (first use loads the runtime) and
Evening put the liner on its lash line (luminance 86 to 35 just above the lid), no page errors. Visible version
`v2026.11.03.3`, release key `20261103ui1` (every camera module moved to it from `20261103face1`; `album.js` stays at
`20261102fun1`). The offline bundle is **352 files, 36.96 MB**, rebuilt after the last change
(`node tools/build-camera-offline.mjs`; the page is part of it and the worker refuses a stale manifest, so rebuild after
any camera file changes, the page's cache keys included).

## What was built

1. **One theme, two values** (`camera.css`): the live dark palette became the `:root` tokens (`--bg --bar --surface
   --surface-2 --well --hero --fill --fill-strong --label --label-2 --label-3 --separator --outline --accent
   --accent-fill --on-accent --accent-soft --chip-on --chip-on-label --red --stamp --shadow --overlay --shutter
   --shutter-ring`); the light set sits under `:root[data-theme=light]`. `camera-black.css` is now the chrome in
   tokens (its games block is dark-only: `:root:not([data-theme=light]) :is(...)`), `camera-ui.css` keeps only
   `--camera-rail` of its own and its chrome colours are tokens, `camera-refresh.css` lost its dead `:root` and the
   three colour rules that still showed. What sits on the photograph (sticker handles, the face guide, the zoom button,
   the crop grid, the Original badge) keeps its own glass in both themes. The games keep their paper palette
   (`game-room-refresh.css`) in light.
2. **Appearance** (`app.js`: `state.theme`, `applyTheme`, `resolvedTheme`; `index.html` `#themeSetting`): Auto (the
   device, the default), Light, Dark, in the camera settings after Sound, remembered in `office-pocket-camera.theme`.
   A head script sets `html[data-theme]` and the `theme-color` meta before the first paint from the stored setting or
   the device; `applyTheme` follows a device change while on Auto. `color-scheme` is `dark light`. Installed on an
   iPhone in light, the band behind the status bar stays dark (`html.standalone[data-theme=light]`), because the page
   uses `black-translucent` and the status text is white.
3. **Eyeliner and eyeshadow** (`makeup.js`): `SHADOW_TONES` (taupe, smoke, bronze, rose, plum, gold, peach: moves from
   the person's own skin in OKLab with a darkening or a lift) and `LINER_TONES` (black, brown); every look names
   `liner:{amount,tone,wing}` and `shadow:{amount,tone}`; `makeupAmounts` scales both by Strength and the Eyes
   fine-tune; `faceMasks` gained `liner(wing)` (the upper lid's nine points outer corner first, thin at the inner
   corner, fuller at the outer, a wing past the corner lifted toward the brow, never on the eye; memoised per wing) and
   `shadow` (a wash from the lash line up over the lid, feathered, kept off the eye, the brow and the under-eye band);
   the skin weight `own` is now measured over the whole region so the lid takes shadow and lashes do not. The pass
   draws the shadow after the brows and the liner last. `faceFromGuide`'s loops start at the photo's left, the
   landmarker's at the outer corner: `upperLid` takes the corner further from the nose either way.
4. **Fixes from the audit** (`camera-ui.css`): the chosen crop shape is the chosen chip (it was near-black text on the
   dark surface); the leftover ring round album cards is gone; the Makeup button has a lipstick (`#i-makeup`) instead
   of the Adjust tab's sliders. New symbols: `i-moon` (unused for now), `i-makeup`.
5. **Tests and workflow**: `tests/theme.browser.mjs` (5 checks) and `tests/makeup.test.mjs` grew to 6 checks;
   `.github/workflows/pocket-camera.yml` runs `theme` in the `camera-face-auto` job. The README lists both.

## Verification

Unit and module checks: every `tests/*.test.mjs` passes (17 files), `node --check` on every module and suite. The
browser regression, run as the workflow does, suite by suite (Playwright's own Chromium, SwiftShader):

| Suite | Result |
|---|---|
| theme | 5/5 |
| makeup (unit) | 6/6 |
| camera | 56/56 |
| crop | 33/33 |
| enhance | 22/22 |
| save-share-layout | 14/14 |
| paper | 5/5 |
| integration | 9/9 |
| sticker-contour | 4/4 |
| ui | 82/82 |
| audit | 50/50 |
| smart | 14/14 |
| offline | 13/13 |
| retouch | 40/40 |
| screens | 5/5 |
| face-stamps | 12/12 |
| backup | 7/7 |
| pop | 5/5 |
| zoom | 13/13 |
| face-pack | 4/4 |
| auto | 5/5 |

Three suites needed test-only repairs on the way, none of them about the theme: the audit's tile locator matched the
Makeup strip's tiles as well as the Looks strip's (scoped to `#strip`); smart's Undo snapshot was taken before the face
pack had written the faces into the recipe (it waits for them now); the audit's stored settings lacked `auto:false`, so
Auto's Enhance and Pop sat under its exact-pixel comparison (as enhance and smart already had). The zoom suite's
double tap missed once on the system Chromium and passed on Playwright's own. One finding about the release itself:
`index.html` is part of the offline bundle, so bumping its stylesheet cache keys after the build left the bundle stale
and the worker refused to register (the camera suite caught it); the bundle was rebuilt and the suites above ran on it.

Looked at (the screenshots are in `qa/2026-11-03-ui/`): every screen at a phone (390 × 844, 2×) and a desktop
(1280 × 900) in light and in dark: the welcome, the settings, the editor's six tabs with Makeup and Face stickers
open, the saved photo, the album, the backup sheet, the Game Room, Blackjack, Solitaire and Memory. The eight looks on
the test portrait at full strength (`looks-sheet.png`) and the eyes close up as Off, Natural and Evening
(`eyes-close.png`): the liner follows the lash line of the closed eyes with a wing on Evening, the smoke wash sits on
the lids and fades toward the brows, Natural is a light brown line and a taupe wash, Clean draws neither.

**Environment note for whoever runs the suites next:** the system Chromium (`CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium`,
needed by the MCP acceptance) grants the fake camera's permission at once under `--use-fake-ui-for-media-stream`, so
the app starts the camera on load and `camera.browser.mjs` never sees the welcome. Run the camera suites with
Playwright's own Chromium (leave `CHROMIUM_EXECUTABLE` unset), as the workflow does.

## The second release of the day: lip colours, no Look by default, Negative, Remove background (`v2026.11.03.4`)

The owner, from the phone (Messenger's browser, light): "Icons still had problems, I want to be able to choose more
colors in the lipstick now they all look too similar"; "Default to no filter"; "I want an invert function too and
remove background". Built on the branch after the first publication:

1. **The camera's tray chips in light** (the icons problem): the Mix, dice and sticker chips kept the dark glass meant
   for a tray floating over the picture, and in light carried black icons on dark grey. The tray sits under the picture
   in this layout, so the chips take the panel's fill (`camera-ui.css`).
2. **Lip colour** (`makeup.js MAKEUP_SHADES`, nineteen; `app.js renderMakeup`): a row of round swatches under the
   strip, out of the Fine-tune door, the look's own shade first, the chosen one ringed and named beside the row's title
   and in the Makeup summary. A chosen colour is put on at nine tenths (a look's own shade is only moved toward) and
   sets the lip's lightness (black darkens, nude lightens); the blush follows only a blush colour (`blush:false` on
   wine, chocolate, violet, blue, black). The sheet of all nineteen on the test face: `qa/2026-11-03-ui/lips-sheet.png`.
3. **No Look by default** (`app.js startRecipe`): the camera opens with the plain photo. A Look chosen since is
   remembered (`remember()` marks the stored recipe `kept`); the old default, Pocket, stored without that mark, is the
   default again. The camera suite keeps its remembered-Pocket scenario by storing one; `tests/defaults.browser.mjs`
   covers the default, the migration and the lip row.
4. **Negative** (`looks-gl.js NEGATIVE_BODY`, the Photo kind after Sepia, its own icon): every colour its opposite.
   The integration and audit suites count 35 Looks now.
5. **Remove background** (`background.js`; `face-pack-worker.js` 'segment'; `face-pack.js findPerson`;
   `vendor/mediapipe/selfie_segmenter.tflite`, 250 KB, Apache-2.0, noted in NOTICE.txt and the MCP preview's vendor
   list): in Erase beside Find spots. The person by the segmenter (first when faces were found), else a plain ground by
   a flood from the edges (`plainMask`, with patches of ground inside the subject taken too and specks left alone);
   neither, and the hint says so. The mask lives beside the picture (`edit.cutout`): the preview is masked with CSS
   over a checkerboard, the saved copy is a PNG masked before the frame and stickers, with the mask saved as a PNG
   beside it, so a re-edit opens cut out and the backup carries it. "Put the background back" undoes it. On the test
   portrait the person was cut in 785 ms once the segmenter had loaded.

Release `v2026.11.03.4`, key `20261103ui2`; the offline bundle is **354 files, 37.2 MB** (the segmenter's model is
250 KB of it).

**Verification of the second release** (Playwright's own Chromium, SwiftShader; every `tests/*.test.mjs` passes,
`background.test.mjs` with 4 checks among them): camera 56/56, crop 33/33, enhance 22/22, save-share-layout 14/14,
paper 5/5, integration 9/9, sticker-contour 4/4, ui 82/82, audit 51/51, smart 14/14, offline 13/13, retouch 40/40,
screens 5/5, face-stamps 12/12, backup 7/7, pop 5/5, zoom 13/13, face-pack 4/4, auto 5/5, theme 5/5, defaults 4/4,
background 3/3. Two suites needed their Look count moved from 34 to 35 (ui, integration), and integration's
prior-engine comparison now skips a Look the prior engine never had. Looked at (`qa/2026-11-03-ui/`): the nineteen lip
colours on the test face (`lips-sheet.png`), the lip colour row in both themes, the camera's tray in light with the
fake camera running (`light-camera-tray.png`), the Negative Look (`light-negative.png`), and Remove background on the
portrait and on a drawing (`background-person.png`, `background-plain.png`).

**Published and verified on 3 November 2026.** The owner: "Proceed". Main fast-forwarded to
[`44c24688e`](https://github.com/nj22az/nj22az.github.io/commit/44c24688efe6754bcc92090280c920aa389744f6); Pages
deployed it (run 1612, success); **18/18 public files match main byte for byte** (the camera's page, `app.js`,
`makeup.js`, `looks-gl.js`, `look-icons.js`, `background.js`, `face-pack.js`, `face-pack-worker.js`, `camera-ui.css`,
`offline.json`, `sw.js`, the segmenter model and NOTICE, the two new suites, the README, this note and HANDOVER.md).
On the live page (headless Chromium, 390 × 844, a light device, a fresh profile): the camera opened with no Look at
`v2026.11.03.4`; the test portrait's face was found in 7.4 s; the Photo kind offered None, Mono, Sepia, Negative,
Instant, Tilt and Night; the lip row held the look's own and nineteen colours and Cherry read "Soft glam · Cherry";
Remove background kept the person in 1.6 s (the live segmenter's first use) and the saved copy was a PNG with its mask;
no page errors. The World guard (run 429, triggered by the MCP preview's vendor list) was still running at this note.

## The third release of the day: the cut-out edge crisper on hair (`v2026.11.03.5`)

The owner: "Make the cut-out edge crisper on hair". The segmenter answers at 256 pixels across, so its edge scaled to
a photo was a soft band that swallowed the braids. `matte.js` (pure functions over typed arrays: a summed-area box
mean, bilinear resampling, a grey and a colour guided filter, `refineMask`) runs in `matte-worker.js`, a module worker,
off the page's thread; `background.js refinePerson` sends the picture at up to 1,024 pixels across with the coarse mask
and gets the refined mask back, falling back to the coarse edge if the worker fails; `findBackground` reports
`refined`, which the edit keeps as `cutoutRefined`. The method is guided feathering: in a band 2.5% of the longer side
round the coarse edge, the mask's soft ramp is re-drawn along the photograph's own colour edges by the guided filter
(colour guide, radius 2%, eps 1e-3), then a gentle curve firms it; outside the band the mask is hard. A
colour-projection matte was tried first (foreground and background colours estimated on each side of the edge, each
pixel placed between them) and carved the dark braids away against the dark ground; the guided feathering trusts the
segmenter for what is wholly inside or outside and only moves its edge. On the test portrait the braids are now cut
bead by bead where the segmenter had a blur (`qa/2026-11-03-ui/hair-before-after.png`, three times life size), in
0.7–0.9 s. Release `v2026.11.03.5`, key `20261103ui3`; the offline bundle is **356 files, 37.2 MB**.

`tests/matte.test.mjs` (5 checks: the box mean, the resampling, both guided filters, a disc with hair-thin spokes in the
coarse ramp keeping its spokes and clearing the ground between them, crisper than the ramp); `tests/background.browser.mjs`
now also checks the person's edge was refined and that the mask's changes sit on the picture's edges more than the
segmenter's did (an edge-agreement measure; a plain count of half-way pixels was wrong for hair, which is partial by
right).

**Verification of the third release** (Playwright's own Chromium, SwiftShader): every `tests/*.test.mjs` passes
(19 files, `matte.test.mjs` 5 among them); offline 13/13, ui 82/82, retouch 40/40, face-pack 4/4, auto 5/5, theme 5/5,
defaults 4/4, zoom 13/13, integration 9/9, camera 56/56, background 3/3 (the portrait's edge refined; its edge
agreement 0.065 against the segmenter's 0.055). The suites not rerun (crop, enhance, save-share-layout, paper,
sticker-contour, audit, smart, screens, face-stamps, backup, pop) passed on the second release and this one changes no
module they exercise beyond its cache key. **Not yet on main**: the owner publishes with "Push to main".

## The fourth round: Select in the album, the status bar, the games' foot (`v2026.11.04.1`)

The owner, from the iPad installed from the Home Screen (4 November 2026): "The menu in top and bottom is blurred,
there should be a way to manage, delete the photos too … and I'm missing shaders? Is something missing?"

1. **The bands at the top and the foot.** The top was iPadOS 26's own scrim under a translucent status bar
   (`black-translucent`), drawn whatever the page paints there; the dark band of the first release did not show through
   it. The status bar is now the system's opaque bar (`default`), coloured by the theme-color `applyTheme` keeps, so
   nothing is drawn over the page; the band rules in `camera.css` are gone. The foot was the camera's page colour in
   the `.app` padding under the home indicator while the Memory and card-game screens are paper: `.app[data-mode=…]`
   now takes each screen's own colour in both themes (`camera-ui.css`; Blackjack and Solitaire by `:has()`).
   **Unverified on the iPad**: neither band can be reproduced here (Playwright's safe-area insets are zero), so this
   is the owner's check.
2. **Select** (`app.js renderSelection`, `#albumSelect`, `#albumActions`): in the album bar; every photo gets a tick
   box, a tap chooses, Select all / Select none, Delete n asks through the same sheet as one photo and deletes them
   together, Done leaves nothing chosen; the roll, the note and the album itself follow. `tests/album.browser.mjs`
   (3 checks) and the workflow's `camera-face-backup` job.
3. **"Missing shaders?"** Nothing was removed: 35 Looks (34 plus Negative). In the camera on a phone the strip stays
   folded under the Look's name until it is tapped (the 29 October layout), and the game consoles are one Pocket and one
   8-bit tile whose models (Colour hand-held, Red visor, SNES, 32-bit, 64-bit) live in Look settings since 31 October.

Release `v2026.11.04.1`, key `20261104ui1`; the offline bundle is **356 files, 37.2 MB**.

**Verification of the fourth round** (Playwright's own Chromium): every `tests/*.test.mjs` passes (19 files); offline
13/13, ui 82/82, theme 5/5, defaults 4/4, backup 7/7, album 3/3, integration 9/9, save-share-layout 14/14, camera
56/56, background 3/3. Looked at: the album in Select on a phone (`qa/2026-11-03-ui/album-select.png`): the title
whole, Done, a tick box on every photo, the action row. **Published** with the fifth round on 4 November 2026 (see State). The two iPad bands are the owner's check now
that it is live.

## The fifth round: the Pop and Comic Looks (`v2026.11.04.2`)

The owner (4 November 2026): "Can you add more shaders? Is there any more interesting ones that might make the images
really funny or pop, or look like a real manga or a cartoon or a comic book?" Eight camera-only Looks, judged on the
test portrait (`qa/2026-11-04-looks/pop-comic-sheet.png`, with the found face; `pop-comic-no-face.png` without one):

1. **Pop** (a new kind after Photo): **Pop art** (Lichtenstein: flat printer's red, yellow, blue and green, skin as red
   Ben-Day dots, denser in its shade, hair blonde or black, a heavy even outline), **Street poster** (a stencilled
   screen print cut by tone into cream, sky blue, red and navy, a line screen between the cuts), **Neon lines** (the
   drawing as lit tubes on the dark, each in the colour it crossed, a glow round them), **Heat camera** (the ironbow
   false colour, the found face warmest, blue things cold, a sensor blur) and **Funhouse mirror** (a bulge on the found
   face, two and a half times at the middle, smooth at its rim; the middle of the picture when no face is found).
2. **Comic** (a new kind after Drawn): **Comic dots** moved here from Drawn, **Golden age comic** (a 1940s book: flat
   fills in the printer's tints, none, a quarter, a half or solid, as coarse screens, the shade one tint more and a
   quarter of cyan, the black plate a hair out of register and cyan more so, yellowed foxed newsprint), **Action manga**
   (the Manga page's screens and solid blacks on the subject, the background cleared to paper, speed lines ruled from
   the frame's edge in towards the face, heavy at the edge, tapering, never across the subject) and **Old cartoon** (a
   1930s black-and-white cartoon: three greys and black, a thick brush outline, grainy scratched dusty film).
3. **The engine** (`looks-gl.js`): `PHOTO_MANGA` is the one page of screens Manga and Action manga share (`mangaInk()`;
   Manga's pixels are unchanged, the integration suite's baseline comparison proves it); every camera program has a
   `uFace` uniform (`faceUniform()`: the first found face's oval centre and half-size after the crop and the mirror, y
   up; zeros without a face), set in `run()` and in the thumbnails; the five tone-cut Looks are in `INK_LOOKS` (exposed
   first), the five inking ones in `CAMERA_LINE_LOOKS` (smoothed first). Symbols in `look-icons.js`, kind glyphs in
   `app.js` (`GROUP_GLYPHS.pop`, `.comic`).
4. **Nine kinds in one row** (`camera-ui.css`): 36-point symbol chips, 1 px apart, no wrapping; the row scrolls on a
   phone narrower than 334 px of chips and `renderStripSelection` brings the open kind into it (never the page).
5. **What was rejected on the sheet**: the first Golden age was a muddy tan (paper too dark, every ink raised by the
   grey, a thin line); the first Action manga's spokes started at a fixed share of the face's size and never began when
   the face filled the frame, so they are now ruled from the frame's edge along each ray.

Release `v2026.11.04.2`, key `20261104fx1` (the page, `app.js`, `looks-gl.js`, `look-icons.js`, `camera.css`,
`camera-ui.css`; every other module stays at `20261104ui1`); the offline bundle is **356 files, 37.27 MB**.
`tests/comic.browser.mjs` (4 checks: the eight draw the portrait as pictures of their own in both builds, Funhouse
widens the grid in the middle and leaves the edge, Action manga's spokes stay out of the face, Heat is warmest on the
face, the kinds row is one row and scrolls with the open kind in view) joins the workflow's `camera-face-auto` job;
`looks-gl.test.mjs` covers the face uniform and the shared page; the camera, ui, integration and audit suites count 43
Looks and the kinds `Photo, Pop, Games, 80s, Drawn, Comic, Painted, Print, Riso`.

**Verification of the fifth round** (Playwright's own Chromium, the whole regression as the workflow runs it): every
`tests/*.test.mjs` passes (19 files); camera 56/56, crop 33/33, enhance 22/22, save-share-layout 14/14, paper 5/5,
integration 9/9 (1,032 combinations of 43 Looks, 516 preview/export comparisons, 68 baseline comparisons: Manga's
pixels unchanged by the shared page), sticker-contour 4/4, ui 82/82, audit 59/59 (after its distinct-symbol count moved
to 43; the first run failed on that count alone), smart 14/14, offline 13/13, retouch 40/40, screens 5/5, face-stamps
12/12, backup 7/7, pop 5/5, zoom 13/13, face-pack 4/4, auto 5/5, theme 5/5, defaults 4/4, background 3/3, comic 4/4,
album 3/3. Looked at: the sheet of the eight on the portrait with and without the found face, the light builds of the
five that differ in LIGHT, the kinds row in the editor and in the camera on a 390 phone (`qa/2026-11-04-looks/`).
**Published** on the owner's "Push to main" (see State).

## Open

- **A physical iPhone**, in Safari and installed from the Home Screen, in both themes: the status-bar band in light,
  the yellow button and the amber chosen state on a real screen, the Appearance row.
- **Desktop Safari and Firefox**: `:is()` and `:root[data-theme]` are everywhere; checked in Chromium only.
- **Later, by choice** (audit C findings): fold `camera-refresh.css` into `camera-ui.css` and delete it; a larger-type
  pass (tile names at 14 points); the camera following the site's `nj-theme` instead of the device.
- **Unchanged limits**: the makeup pass is CPU (about 240 ms a Strength step at 1,280 px; a GL port is next), the
  first face of a photo is the one made up, no live viewfinder landmarks.

## How to pick this up

```bash
node camera/tests/comic.browser.mjs              # the Pop and Comic Looks, the face uniform, the kinds row
node camera/tests/theme.browser.mjs              # Appearance and contrast in both themes
node camera/tests/makeup.test.mjs                # the liner and the shadow on the synthetic face
node tools/build-camera-offline.mjs              # after any camera file changes
```

Screenshots of every screen in both themes come from a Playwright script like `tests/theme.browser.mjs` with
`localStorage.office-pocket-camera.theme` set to `light` or `dark` before the page loads.
