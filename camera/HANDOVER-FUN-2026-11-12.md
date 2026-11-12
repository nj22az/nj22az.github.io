# Pocket Camera: the fun round — 12 November 2026

Version **v2026.11.12.1**, release key `20261112fun1`. Branch `claude/laughing-brahmagupta-ybyndm`.
Publication: see the last section.

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

1. **Seasonal friends**: Tết, Christmas, Halloween, Easter and summer (and the friends at the matsuri), the cast in
   each season, in the hand above. Sheets go under Season with their months (`when`): add them to `SHEETS` in
   `tools/draw-cute-stickers.py`.
2. **Seasonal frames and face cutouts** ("like a frog costume at the pond could have a cutout for the face, think
   extremely playful"). Plan: a frame of kind cutout in `frames/cute.json`, a painted board with a hole, drawn from
   `cute_hand.Drawing.paths()` (path data the browser draws at any size; `cut` is the hole); live in the viewfinder
   the face is put in the hole as at a real board; in the editor the photo's found face (`recipe.makeup.face`) is
   brought to the hole by the crop.
3. **The whole interface in the playful style** ("Redraw the whole ui in the playful style, so it's fun to use the
   app"), and the sliders' own look when Sliders is on. Nothing of it is in this release beyond the icons, the preset
   row and the steppers. References studied: Sanrio (pills, 20–24 px cards, soft low shadows), YOHO Brewing
   (thick-bordered pills, two colours), LINE (one clear action, 44 px targets), Nintendo (flat, calm).
4. **A note on the four filter projects and a studio** (Filters4Processing, PhotoCraft, mIRO, XBImageFilters): studied;
   almost nothing can be reused as code (licences), about twelve effects are worth writing ourselves (kaleidoscope,
   fisheye, twirl, colour splash, tiny planet, prism fringe, solarize, melt, glass blocks, stained glass, Droste, ghost
   trails), and a small studio (undo for everything, paint a Look on or off, a doodle layer). Not written up in the
   repository yet and nothing of it built: the owner has not asked for it to be built.
5. **AI Comic Factory** and **obs-dlss5-nr** were looked at on the owner's links: neither can be part of a static,
   offline browser app (the first needs a model server, the second is a Windows plugin on NVIDIA's runtime).

## Publication

(Written after the push to main.)
