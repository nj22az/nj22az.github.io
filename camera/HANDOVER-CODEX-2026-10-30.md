# Pocket Camera Looks: handover to Codex — 30 October 2026

**Later, 30 October: photo crop and smaller exports are published** to `main` as `0cd8408b`, PR #408,
on the owner's “Publish”. Pages passed and all six changed live runtime files match the tested versions. Read [the crop handover](HANDOVER-PHOTO-CROP-2026-10-30.md) for the controls, compression,
checks and source-retention behaviour. No Look shader body was changed by that work.

Claude's work on the camera's Looks (shaders) this day, handed to Codex to continue. Read this, then
[README.md](README.md) (sections "Pencil crayon and Rubber stamp…", "Who each Look is for", "The game consoles", "Riso",
"Rebuilt for their judges" and its rounds) and [AUDIT-LOOKS-2026-10-30.md](AUDIT-LOOKS-2026-10-30.md), the standing
backlog. The day's full history is the first section of [HANDOVER-2026-10-29.md](HANDOVER-2026-10-29.md).

## Where it stands

| | Commit | State |
|---|---|---|
| `main` (the live site) | `1ed9a7ef2` | Rounds one to four and this handover, all published on the owner's word ("Push then work the rest", "Yes then proceed", and "Yes" to publishing round four, 30 October) |
| `claude/friendly-darwin-a4e3re` | the same, plus this note's update | Claude's working branch |

Anything you do next goes to `main` only on the owner's explicit word. Branch off `main` or
`claude/friendly-darwin-a4e3re` (they are the same code).

## What the owner asked, in order (30 October 2026)

1. Two iPhone screenshots (Stamp, Crayon on a portrait): "does the shaders need improvement? Or how do you see" → "Proceed".
2. "Yes proceed but you need audit yourself imagine you are a professional designer and you would pay a lot of money
   for this app".
3. "I want more video game shaders, n64, Gameboy color, PlayStation etc".
4. "Identify who is the user for each shader, audit as this user. Manga is Rumiko Takahashi and Akira Toriyama for
   instance". The judges are the table in README "Who each Look is for". Keep judging that way.
5. "I do love Risograph can there be several variations on Risograph?".
6. "Push then work the rest", then "Yes then proceed".

## How the code is laid out (`camera/looks-gl.js`)

- **World is never changed for the camera.** World's Looks (`johansson-town/src/render/looks.js`) are written for the
  3D town and lean on its depth and normals; a photo has neither. The camera either draws a Look with its own body, under
  World's name and swatch, or replaces a few exact lines of World's source.
- `CAMERA_BODIES` maps a Look's name to the camera's own `main` (World's Cartoon program supplies the shared helpers:
  `luma`, `hash`, `noise`, `bayer4`, `edges`, `spotBlack`, `unit()`). 31 of the 34 Looks are the camera's own now (26
  named bodies and the five Risographs, `riso` included, from `risoBody`); `oil` and `tilt` are World's with
  `PHOTO_EDITS` (exact `[from,to]` replacements; `photoFragment` throws if World's line changed, on purpose); `none` is
  no pass at all.
- Shared GLSL blocks, interpolated into the bodies (a block must be defined **above** any body that uses it: they are
  template literals evaluated at module load):
  - `PHOTO_STROKES`: `finished()` (the picture's edges drawn lighter), `pencilLane`/`pencilHatch`/`pencilLayer`
    (straight tapered strokes in bowing lanes), `pencilFlow`/`flowAngle` (strokes along the picture's form).
  - `PHOTO_LINES`: `ringLuma`, `ringColour`, `around`, `inkLine`, `lineAt` (a point darker than the rings round it,
    seen a little soft), `contour` (colour edges), and **`inked()`**, which every line Look draws through: the lines and
    contours except (a) a mark in a row of bright, little-coloured teeth, (b) a mark that is itself light, and (c) in
    the full build, a mark that does not carry on a few pixels along its own direction (strokes, not specks).
  - `PHOTO_CEL`: `celSmooth`, `celBase` (an edge-keeping material colour; thin dark marks painted over first).
  - `CONSOLE_GRID`: `cellColour` (a big pixel's average colour).
- The consoles: `SNES_BODY`, `HANDHELD_COLOUR_BODY`, `EIGHT_BIT_BODY`, `THIRTY_TWO_BIT_BODY`, `SIXTY_FOUR_BIT_BODY`,
  `RED_VISOR_BODY`, `POCKET_BODY`. The Risographs: `RISO_INKS` (one line per ink set; `duo:true` for a duotone) and
  `risoBody(inks)` (an exact separation in optical density).
- `LOOKS` (labels and hints), `LOOK_STANDIN` (the World swatch a camera-only Look borrows), `INK_LOOKS` (Looks whose
  picture is first exposed to a middle grey: keep the colour consoles, 16-bit and the cel Looks **out** of it, or their
  darks are lost).
- Phone builds: a body's `#ifdef LIGHT` / `#ifndef LIGHT` parts make a lighter viewfinder build (`hasLight` matches
  both); a save always uses the full build. Put any extra-sample refinement under `#ifndef LIGHT`.
- The first pass (`PREPARE`): crop, mirror, trick lens, adjustments, edge-keeping smoothing for line Looks, exposure for
  `INK_LOOKS`, and a Lanczos-like shrink (`resized()`, from the mipmap level twice the picture's size).
- `recipe.focus` (a height from the picture's foot, -1 = automatic) reaches shaders as `uFocusY`; `focusTap` in
  `camera/app.js` sets it on a single tap while Miniature is in the recipe.
- `camera/app.js`: `LOOK_GROUPS` (the kinds in the strip: Photo, Games, 80s, Drawn, Painted, Print, Riso), `MIXES`
  (the dice's named mixes), `FINISHERS`.

## How to work (the loop that was used)

```sh
python3 tools/camera-test-photos.py /tmp/bench/in            # the six test photos (two in the repo, four fetched)
node tools/render-camera-looks.mjs --looks manga,flat --out /tmp/bench/before /tmp/bench/in/*.jpg
# … change a Look in camera/looks-gl.js …
node tools/render-camera-looks.mjs --looks manga,flat --out /tmp/bench/after /tmp/bench/in/*.jpg
python3 tools/camera-look-sheet.py --out /tmp/bench/sheet.jpg --looks manga,flat \
  --photos portrait-restaurant,portrait-braids,portrait-hat,cafe,garden,night /tmp/bench/before /tmp/bench/after
python3 tools/camera-look-sheet.py --out /tmp/bench/mouth.jpg --looks manga --photos portrait-restaurant \
  --crop 300,330,560,460 --height 300 /tmp/bench/before /tmp/bench/after   # a face at 1:1
```

`--light` renders the phone builds; `--focus 0.3` places Miniature's band. Useful 1:1 crops (in a render's own pixels,
1080 lines tall): restaurant mouth `300,330,560,460`, restaurant glasses `220,180,480,310`, restaurant face
`220,200,560,470`, hat face `520,160,960,520`, braids mouth `330,500,590,630`.

Judge every change at phone size **and** at 1:1, as the Look's own judge (README table), on all six photos: a fix for a
portrait often breaks the garden or the night street. When a round is done, have someone (or a separate pass) re-judge
it cold in the personas, with the previous scores beside it, and record the scores in the audit file.

**Checks before every push** (all passed on `507dad865`):

```sh
node camera/tests/looks-gl.test.mjs      # every Look converts; recipe, sizes
node camera/tests/modules.test.mjs       # every camera module imported at one address
node --check camera/looks-gl.js && node --check camera/app.js && git diff --check
node camera/tests/camera.browser.mjs     # 56 checks, about 5 minutes, Chromium + SwiftShader + ffmpeg
```

## Traps that cost time

- **`smoothstep(a,b,x)` with `a >= b` is undefined in GLSL** (SwiftShader happens to draw it; a phone may not). Write
  `1.0-smoothstep(b,a,x)`. Find any: `grep -n -o -E "smoothstep\(\.?[0-9.]+,\.?[0-9.]+" camera/looks-gl.js | awk -F'[(,]' '$2+0>$3+0'`
- GLSL reserved words as names fail to compile (`half` did). The render tool prints the compiler's error.
- A body that uses a helper must interpolate its block (`${PHOTO_LINES}` …); "no matching overloaded function" means it
  did not. A local variable named like a helper (`around`) shadows it.
- `INK_LOOKS` exposure: a Look added to it is brightened to a middle grey first.
- Bump the cache keys when a module changes (`app.js?v=` in `camera/index.html`, `looks-gl.js?v=` in `camera/app.js`;
  `modules.test.mjs` checks every import agrees), or phones keep the old shader.
- The browser suite runs SwiftShader in the cloud: it proves compile and draw, not phone frame rates.
- A test asserting a Look's internals (`looks-gl.test.mjs` line 24, Adventure Ink and Cartoon) must be updated with
  the Look.

## Next, in order

1. **Re-judge rounds three and four** in the personas (none of it has been re-judged). Record scores in the audit file.
2. **Outline people against a background of their own colour and light** (the drawn and cel Looks' most common
   remaining fault). A wider colour edge was tried and left out (no gain for ~30 samples a pixel); it needs a subject
   mask. The camera has none yet: `camera/cutout.js` only cuts round a picture that already has a transparent
   background (an iPhone "Copy Subject"), and `erase.js` (PhotoCraft's WebAssembly) fills a painted mask. A
   segmentation pass that makes a person mask on the device, fed to the Looks as a texture, is the likely route; its
   size, licence and phone cost need checking first.
3. The audit file's open and "Partly" rows, worst score first (the second re-audit's table there has the scores).
4. **A real iPhone** (not possible from the cloud): frame rate of the full builds with their extra samples (Heavy
   brush, Riso three-colour, the continuity test in `inked()`), the phone builds in the viewfinder, a 12 MP save. Ask the
   owner to try it; the owner's own photos are the real test.
5. Publish only on the owner's word; update this note, [HANDOVER-2026-10-29.md](HANDOVER-2026-10-29.md) and the index
   row in [../HANDOVER.md](../HANDOVER.md) with commits, checks run and what is still unverified.

The test photos' sources and licences are in `tools/camera-test-photos.py`; they are not kept in the repository.
