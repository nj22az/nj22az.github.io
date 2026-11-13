# Pocket Camera: the fun round — 12 November 2026

Version **v2026.11.12.1**, release key `20261112fun1`. Branch `claude/laughing-brahmagupta-ybyndm`.
Publication: see the last section.

## State when this was last written (13 November 2026, after the second publication)

- **Live**: **v2026.11.13.1**, main `e869d0153`, release key `20261113year1`: everything in this note that is marked
  done, including what was drawn after the first publication (the friends through the year, the year's frames, the
  face cutouts, the first pass of the playful skin).
- **The branch holds nothing unpublished** but this note's own record of that.
- **Waiting on the owner**: whether the skin's first pass is the right direction before the rest is redrawn
  (screenshots were sent on 12 November); a try of the Sticker box with the iPhone's keyboard stickers; whether to
  build any of the studio or the new filters; whether the seven sheet pictures should stay in the public repository
  (`tools/sources/sticker-sheets/`).
- **Still owed**: the rest of the interface in the playful style (*Not done* 3), and a cutout in the editor bringing
  the photo's face to the hole. How: with the photo's face guide `f` (`recipe.makeup.face`, in shares of the source)
  and the hole `win = frameWindow(id, pw, ph)` on the cropped picture (as shares `hx, hy, hh` of it): the crop's
  height is `f.h / (0.86 * hh)` (at most the whole photo), its width from the crop's own shape, its corner
  `(f.x + f.w / 2 - hx * w, f.y + f.h / 2 - hy * h)` kept inside the photo. Until then Crop does it by hand, and in
  the viewfinder you put your face in the hole as at a real board.

## What the owner asked, in order

- "I don't like the sliders or the icons, can you improve the user interface and remove the ball juggle game it didn't
  end up well, use python and draw the assets, draw the icons, make it really fun to use, and have many presets to make
  the shaders to look awesome, sliders need to be accessed by a setting"
- "Looks much better" (the icons). "Redraw the frames too, in python, make them more playful and cute, similar style to
  the icons". "Redraw the whole ui in the playful style, so it's fun to use the app".
- Of the frames: "Good walk away from the Gameboy arts, but keep the playfulness from Gameboy Camera", "But with that
  said Gameboy filters need to stay", "I'm talking abot the frames".
- "Your python drawing is awesome so you can draw stickers too", "I like animals like frogs and ducks and rabbits add
  them too", "And Japanese matsuri festival and lunar Tet stickers", "And Christmas, and Halloween and Easter and
  summer", "And frames too, and cutouts, like a frog costume at the pond could have a cutout for the face, think
  extremely playful".
- Of the first drawn sheet (plain flat things): "Looks nice but a bit too generic", "Can't you give them more
  personality, like your icons? Or crayon shin chan style comics".
- "You can make stickers of my Johansson Assets too" (six pictures: the studio's marks and the sailor's pose sheets).
  "Here are more sticker sheets, can you make a function to add stickers easily? Even use the system stickers from the
  phone or iPad" (a festival sheet, then a Shōwa sheet).
- "No more flat, like line and kakao friends"; then, of a try at a wobbly ink line with shading: "I mean the characters
  can be flat, this is too ugly, you made icons perfectly and frames perfectly I think you lost your art style?"; of
  five round flat animals: "Better but too round, they lack personality"; of five with their own builds: "The animals
  are better".
- "Push to main".

## What is done and published

| | Where |
|---|---|
| Ball removed; the Game Room has three games; a win at Memory or Solitaire opens the secret sheet | `unlocks.js`, `index.html`, `app.js` |
| Every icon drawn in Python: 51 symbols, 11 kinds, 43 Looks, 4 game signs | `tools/draw-camera-icons.py`, `tools/apply-camera-icons.mjs`, `icons/ui-icons.json`, `look-icons.js` |
| 225 presets over the 43 Looks, a row under the strip | `presets.js`, `looks-gl.js` (`tuned`), `app.js` |
| Sliders behind a setting (off: steppers and the preset row) | `steppers.js`, `camera-fun.css`, `app.js` |
| 16 frames drawn in Python; the pixel frames no longer offered, still drawn on photos that wear one | `tools/draw-camera-cute-frames.py`, `frames/cute.json`, `frames.js` |
| The camera's own sheets on a list; tabs; seasons by the calendar; kinds never greet; `deck` | `stickers/sheets.json`, `stickers.js`, `app.js` (`stickerTabs`, `residentSets`, `deckSets`) |
| The owner's sheets cut into stickers: Cartoon Johansson 38, Animation Studios 8, Matsuri 33, Shōwa 21 | `tools/cut-sticker-sheet.py`, `tools/sources/sticker-sheets/` (the pictures and a recipe each) |
| Friends 22 and Bits 10, drawn in code in the icons' flat hand | `tools/cute_hand.py`, `tools/draw-cute-stickers.py` |
| Mine: From a photo (several), From a sheet, Paste, the Sticker box | `sticker-sheet.js`, `cutout.js` (`edge`), `app.js` (`stickersFromSheet`, `stickerBox`) |

## The rules this round set (keep them)

- **The drawing hand** is the icons' and the frames': flat colour, round chunky shapes, two tones of one colour and a
  pale third, dark only for a face, no outline, no wobble, no shading. A rougher line was tried and refused. The
  personality is in who is drawn and what they are up to: each friend has its own build (a wide squat frog, a small
  duck with a heavy brow and big feet, a tall thin rabbit, a wide-jawed cat, a big bear with a small head) and each
  sticker is a small scene. Study LINE's and Kakao's friends for how a cast acts; never copy a character.
- **The frames leave the Game Boy's pixel art; the Game Boy Looks stay.**
- **Sliders are a setting.** A new control gets a stepper (`stepperFor`), or presets, first.
- **A new sticker sheet needs no code**: a tool writes `stickers/<id>/`, `stickers/<id>.json` and adds the file to
  `stickers/sheets.json`. A sheet with a `kind` never greets; `deck: true` makes it a Memory deck.
- **White is lost in a sticker's white edge**: a puff of steam or a pale prop is drawn in a pale grey-blue (`MIST`,
  `STEAM`), and a white animal in cream.
- **A drop or a paste in the sticker box stops there** (it does not also open the editor: the page listens for both).

## How to rebuild

```
python3 tools/draw-camera-icons.py && node tools/apply-camera-icons.mjs          # icons
python3 tools/draw-camera-cute-frames.py                                         # frames/cute.json
python3 tools/draw-cute-stickers.py [--sheet out.png] [--only cute,bits]         # the friends and the bits (about 2 min)
python3 tools/cut-sticker-sheet.py tools/sources/sticker-sheets/<id>.json [--sheet out.png]   # one of the owner's sheets
node tools/build-camera-offline.mjs                                              # after any change under camera/
```

`tools/cut-sticker-sheet.py` needs numpy and scipy (it cuts each piece on its own core; a sheet takes one to three
minutes). Its recipe's knobs are in its docstring: `mode` (ink, edge, cut), `ground` (border, border+white, pale),
`join`, `marks`, `main`, `whole`, `tolerance`.

## Checks

- `node camera/tests/stickers.browser.mjs`: 9 checks (the sheets on the list and every file of them, tabs and seasons
  for three dates, greeters and decks, the picker's headings, Mine's four ways, a drawn sheet cut into six, the owner's
  three kinds of sheet cut in the app: 12 poses on white, 32 or 33 on cream with touching white edges, 21 or 22 on a
  chequered ground; a photograph is one sticker; the sticker box takes a paste, an inserted picture and a drop and no
  typing).
- The whole regression (`.github/workflows/pocket-camera.yml`): see the publication section for this release's result.
- `camera/tests/offline.test.mjs` allows the bundle 48 MB (it is about 45: the sheets added about 4.6 MB).

## Not verified

- **The iPhone's keyboard stickers in the Sticker box.** Built to how iOS offers stickers (only in a field that takes
  pictures) and tested with a paste, an inserted picture and a drop in Chromium. It needs the owner's iPhone or iPad:
  open Stickers → Mine → tap Sticker box → the emoji keyboard → its sticker drawer → choose one. If nothing arrives,
  say what the keyboard showed.
- Physical Safari was not used for anything in this round.

## Not done (asked for, still owed)

1. ~~Seasonal friends~~ **Drawn after the first publication; published in v2026.11.13.1**: 28 stickers in six sheets under
   Season, each with its months (`when`): Matsuri (4, the friends at the festival, beside the owner's sheet of its
   things), Tết (5: the cat and its lucky money, since in Vietnam the year is the cat's), Easter (4), Summer (5),
   Halloween (5, beside the Blender sheet) and Christmas (5). `seasons()` in `tools/draw-cute-stickers.py`. The sticker
   suite passes with them (the Season tab runs the year from today: in November Christmas first).
2. ~~Seasonal frames and face cutouts~~ **Drawn after the first publication; published in v2026.11.13.1**: five frames
   for the year (Tết, Summer, Halloween, Easter, Christmas; Festival was there) and five **face cutouts** (Frog at the
   pond, Sunflower, Astronaut, Daruma, Snowman): a painted board over the whole picture with a hole where a face goes,
   as stands at a festival. `cutouts()` in `tools/draw-camera-cute-frames.py` draws them with the stickers' kit and
   writes them as path data into `frames/cute.json` (`cutouts`: `window`, `hole`, `shapes`); `frames.js drawCutout`
   draws one in a square of 100 whose middle 72 is the picture's shorter side, so the somebody is whole on any shape
   of picture. They are among the frames in the Frame sheet and the editor's Frame tab; in the viewfinder you put
   your face in the hole as at a real board. **Still to do**: in the editor, bring the photo's found face
   (`recipe.makeup.face`) to the hole by the crop (`frames.js frameWindow(id, w, h)` says where the hole is); until
   then Crop does it by hand. A bug found on the way: `cute_hand.Drawing.paths()` lost closed outlines that ended
   exactly where they began (a line cannot be simplified against a chord of no length); fixed, and the fun suite
   checks every cutout on four shapes of picture.
3. **The whole interface in the playful style** ("Redraw the whole ui in the playful style, so it's fun to use the
   app"): **a first pass only, published in v2026.11.13.1** (the foot of `camera-fun.css`): rounder tiles and cards,
   a solid lower edge on the primary and pill buttons and the steppers that goes down under a finger, everything
   pressable gives and springs back (not under reduced motion), and the sliders, when on, have a 10 px track and a
   30 px ringed thumb. Colours and layout are untouched; ui 82/82, audit 59/59, theme, brand and screens pass with it.
   **Still owed**: the rest of the redraw (the bars, the sheets, the album, the Game Room, the brand typeface on
   controls, selected states), best done with the owner looking at screenshots: they have refused three drawings
   this round before liking one, so show before going far. References studied: Sanrio (pills, 20–24 px cards, soft
   low shadows), YOHO Brewing (thick-bordered pills, two colours), LINE (one clear action, 44 px targets), Nintendo
   (flat, calm).
4. **The four filter projects and a studio** (Filters4Processing, PhotoCraft, mIRO, XBImageFilters): the study is
   [RESEARCH-FILTERS-STUDIO-2026-11-12.md](RESEARCH-FILTERS-STUDIO-2026-11-12.md). In short: almost nothing can be
   reused as code (licences); about twelve effects are worth writing ourselves (kaleidoscope, fisheye, twirl, colour
   splash, tiny planet, prism fringe, solarize, melt, glass blocks, stained glass, Droste, ghost trails); a small
   studio would be undo for everything, painting a Look on or off, and a doodle layer. **Nothing of it is built**: the
   owner asked whether it could be added ("Maybe we can add a studio function like photo craft and add those filters
   too") and has not yet said to build it.
5. **AI Comic Factory** and **obs-dlss5-nr** were looked at on the owner's links: neither can be part of a static,
   offline browser app (the first needs a model server, the second is a Windows plugin on NVIDIA's runtime).

## Publication

**Published on the owner's "Push to main", 12 November 2026**: main `fb9cef280` (the branch rebased onto main
`b92478a03`, another session's /temp page, which touched nothing of the camera).

- Before the push, on the commit that was published: the whole regression, 50 of 50 (22 Node tests; 28 browser suites,
  among them camera, ui 82/82, crop 33/33, audit 59/59, retouch 40/40, integration 9/9, offline 13/13, brand 11/11,
  stickers 9, fun 7).
- After the push, as found live: 30 of 30 checked files of `https://nj22az.github.io/camera/` are byte for byte the
  commit's (the page, app.js, stickers.js, sticker-sheet.js, cutout.js, frames.js, frames/cute.json, presets.js,
  steppers.js, look-icons.js, looks-gl.js, unlocks.js, three stylesheets, offline.json, sw.js, sheets.json, seven
  sheets and five sticker pictures); the page says v2026.11.12.1; `ball.js` answers 404.
- Not in this publication: `tools/draw-cute-stickers.py`'s seasonal friends (written, not yet drawn or looked at; kept
  aside in a stash named "seasonal friends, not drawn yet" in the session that wrote it, and described under *Not
  done*).

**Published again on the owner's "Push to main", 13 November 2026**: main `e869d0153`, v2026.11.13.1, release key
`20261113year1` (the branch rebased onto main `b8b93b60e`, other sessions' ferry and maintenance work, which touched
nothing of the camera).

- Before the push, on the tree that was published: the whole regression, 50 of 50 (22 Node tests; 28 browser suites,
  among them camera, ui 82/82, crop 33/33, audit 59/59, retouch 40/40, integration 9/9, offline 13/13, brand 11/11,
  stickers 9, fun 8).
- After the push, as found live: 40 of 40 checked files of `https://nj22az.github.io/camera/` are byte for byte the
  commit's (the 30 of the first publication's check, and the six seasonal sheets and four of their pictures); the page
  says v2026.11.13.1; `ball.js` answers 404.
- The Pocket Camera workflow runs on pull requests and by hand, not on a push to main, so there is no run of it for
  either publication: the regression above was run here, with the workflow's own list of suites.
