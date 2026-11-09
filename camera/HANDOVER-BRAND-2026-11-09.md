# Pocket Camera handover: Johansson World's brand, the stickers' enclosed paper, the cut-out on shaded grounds — 9 November 2026

**Branch** `claude/laughing-brahmagupta-ybyndm`, rebuilt on the new `main` (see "The repository was reset" below).
**Release** `v2026.11.09.1`, key `20261109brand1` (page, `app.js`, `camera.css`, `camera-ui.css`, `camera-black.css`,
`game-room-refresh.css`, `camera-brand.css`, `looks-gl.js`, `frames.js`, `background.js`, `social-share.js`,
`memory.js`, `blackjack.js`, `solitaire.js`, `ball.js`, `stickers.js`); stickers style `20261109-contour2`.
**Not published**: the owner publishes with "Push to main".

## The owner's words

- "I would like the branding from Johansson World to be more clear and sophisticated" → "What's your recommendation?"
  → the recommendation (one lockup everywhere, the toy wordmark once on the title card, the harbour palette in the bars
  and accents, the World's type, the brand on what leaves the app) → "Proceed".
- During the build, from the phone: "The cat out in the stickers need improvement. I see big patches are white", then
  "Eh Johansson's Legs are not cut out right".

## The repository was reset first

On 7 November the owner kept only today's `main` on GitHub (`HANDOVER.md`: "GitHub keeps only today's main"); the
Town moved to `nj22az/johansson-town`. This branch had no ancestor in the new history, so it was rebuilt from the new
`main` (`git checkout -B … origin/main`), the fun audit re-applied (`ff8eb75ca`), and pushed with `--force-with-lease`
over the old-history branch. The local `johansson-town/` checkout was kept beside the repository (Git ignores it) for
the tests, which load the Town's static server and `src/avatars/face.js`; the published baselines the suites compare
against now come from `camera/tests/fixtures/published-baselines/` (the local runner copies them, as the workflow does).

## What was built

### The brand (`camera-brand.css`, tokens in `camera.css`)

See the README, "Johansson World's brand on the camera". In short: the lockup (eyebrow JOHANSSON WORLD over Pocket
Camera, Avenir Next / Yu Gothic) in the camera bar, the settings foot (with "Visit the World ›" to `/johansson-town/`),
the Game Room (bar "Minato Machi", kicker "Johansson World") and the share card; the World's toy wordmark and the pill
ポケットカメラ on the title card only (the bar's lockup hidden there); gold `#e2b665` for what is chosen (brass
`#7d5a1c` in light), the World's ink `#142d37` for the dark bars, the tab row and the status bar (`theme-color`,
manifest `theme_color`), light a touch towards paper; the Film frame's edge prints JOHANSSON WORLD; the icons redrawn
on ink with a gold ring (`tools/draw-camera-icon.py`); page title, descriptions and manifest name the World.
Screens in `camera/qa/2026-11-09-brand/`.

### The residents' stickers (`tools/camera_sticker_contours.py`, `tools/build-camera-stickers.py`)

`contour()` kept every white the figure enclosed, to protect shirts and teeth, so the studio's paper between two legs,
under an arm akimbo or inside a crooked elbow stayed as a white patch (pure white, bounded by the figure's ink; the
largest in HandsOnHips at 20,000 and 16,000 pixels of the studio cut, Laugh 6,500). `enclosed_paper()` cuts a patch
of 60 pixels or more that is 90% pure white with half its boundary ink; a garment's white is shaded (the nearest
misses were 75–96 pixels at 65–72% pure, 17–32% ink). Thumbnails and the 1024-pixel cuts are resampled with the alpha
premultiplied (`shrink`), so the file's grey behind see-through pixels no longer fringes the edge. All six sets were
rebuilt from the studio's plain cuts (`/home/user/jojo`, commit `7803e69`, the one the manifest already named);
`stickers.json` and `stickers.js` carry `20261109-contour2`. Before/after: `camera/qa/2026-11-09-stickers/`.

### Remove background on a ground that is not flat (`background.js plainMask`)

The plain flood refused any ground whose rim strayed more than 26 levels from one colour, so a thing on a sheet with a
shadow, a vignette or grain went to the person segmenter and came back with its sheet. Now the rim is read stretch by
stretch (running median), grain as the typical stray, and the flood carries a reference colour that drifts with the
ground (hue first, lightness at half, a small step from the neighbour); a patch the rim cannot reach is read against the
nearest ground. A latent fault fixed on the way: a speck given back to the subject walked into the rim's ground and
handed the whole background back (patch pixels are now marked apart). Measured on two residents' stickers and a furry
blob over a flat sheet, a shadowed sheet with a vignette, a lit wall and grainy paper (JPEG at 86): ground left behind
0–0.5% (the blob's blurred halo 1–1.5%), subject lost 4–7% (the stickers' own white die-cut rim, which is the sheet's
colour) and 10% for khaki shorts on cream paper; the furry blob on grainy paper is still refused (the flood runs into it
and the coverage check throws the result away, as before). `background.test.mjs` has the shaded-sheet case.

## Checks

PENDING: filled in when the final run completes.

## Open

- The owner has not yet seen the brand screens or the recut stickers on the phone; the screenshots are the sheet.
- The person path (the segmenter) is unchanged: a person before a white wall keeps whatever the segmenter keeps.
- The furry-on-grainy-paper case; a subject the colour of its ground at a soft edge.
- The fun audit's three rounds (front door and host; sound and motion; your face in the room and the sticker book).
