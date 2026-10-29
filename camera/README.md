# Pocket Camera

`/camera/`: a camera and photo editor for **every Look in Johansson World**, alone or mixed, with the residents'
**die-cut stickers**. Asked for by the owner on 29 October 2026: "a fun mini app for the office of Johansson website,
photo editing app and a live camera app … use all the shaders from Johansson world on my photos maybe even a
combination. Make it feel like a polished camera app playful like Gameboy camera, … I don't want to have a Gameboy on
screen: use Apple design", then "Bring the die cut stickers to the camera app".

## What it does

- **Camera**: the live picture through any Look; swipe across it for the next one, tap twice to turn the camera round.
  Self-timer (3 s, 10 s), shape (4:3, 1:1, 16:9), digital zoom (1×, 2×, 3×), the film camera's date stamp
  (`’26 10 29`, as the hotel photos print it), a shutter that sounds and flashes, and the photo flying into the album.
- **Mix**: up to three Looks stacked, each with its own intensity (tap the chosen one again in the camera); the dice
  rolls a surprise mix. Thumbnails show the picture itself in every Look, over the layers before the one being chosen.
- **Editor** (a photo from the device, or any photo in the album): Looks, Adjust (Light, Contrast, Colour, Warmth and
  Pattern, the size of dots, strokes and lines), Stickers, the date stamp; hold the picture to see the original.
- **Stickers**: Thuan, Fuji, and Thuan & Nils, on the viewfinder or a photo. Drag; pinch and turn with two fingers;
  the corner handle turns and resizes with a mouse; wheel resizes, Shift+wheel turns; arrows nudge, Delete removes.
- **Album**: kept in this browser (IndexedDB), nothing uploaded. Each photo keeps its untouched picture and its
  recipe, so **Edit** starts again from the original with every Look, setting and sticker where it was. Share (the
  system sheet, so a phone can save to Photos) or download.

Default first Look: **Pocket**, the town's own hand-held camera (World's `pocket` Look), which gives the Game Boy
Camera feeling with no console on screen. The interface follows Apple's camera and Photos apps: always dark, system
font, the camera's yellow for what is chosen, translucent material, 44-point targets. A wide window puts the controls
beside the picture, as on an iPad.

## How it works

| File | Purpose |
|---|---|
| `looks-gl.js` | The WebGL2 engine: World's Looks on a picture, the first pass, mixing, thumbnails, tiled saves |
| `app.js` | Camera, tray, editor, album, viewer, keys and gestures |
| `stickers.js` | The sticker layer on the picture, and printing stickers into a save |
| `album.js` | IndexedDB storage of shots (photo, source, thumbnail, recipe) |
| `stickers/` | Web copies of the studio's sticker sheets and `stickers.json` (built, see below) |
| `preview.jpg`, `card.webp`, `card-narrow.webp` | Link preview and the homepage card, from `tools/render-camera-preview.mjs` |

- **The shaders are World's, imported, never copied**: `looks-gl.js` imports `johansson-town/src/render/looks.js` and
  builds each Look without depth (the picture-only build Studio's comic panels use), as GLSL ES 3.00, wrapped so it
  mixes into what came before. A new or changed Look in World appears here with no change.
- **One replacement in World's source**: `unit()` (patterns sized to a 1080-line screen) follows the picture's height,
  so dots and strokes cover the same share of the viewfinder, a thumbnail and a 12-megapixel save. The Node test fails
  if World's `unit()` changes and the replacement stops matching.
- **First pass (ours)**: crop, mirror, Light/Contrast/Colour/Warmth; for Looks that draw lines a light edge-keeping
  smoothing so camera noise is not inked; for the ink Looks (`INK_LOOKS`: Pocket, 16-bit, Lines, Manga, Print, Riso,
  Pencil manga, Stamp) the photo is exposed to the town's middle first, as World's Pocket camera exposes each photo,
  because their fixed thresholds were set for the bright town and print a shady photo almost solid.
- **Phones** draw the viewfinder with World's light versions of the heavy Looks (Oil, Heavy brush) and a resolution
  that drops when frames come slowly; every save uses the full versions at full size (up to 4096 px, 16 MP), drawn in
  tiles. Stickers and the date stamp are printed on after the Looks, as real stickers sit on a print.
- **Stickers** come from the studio repo (`nj22az/jojo`, `art/stickers/`, drawn by World's avatar code and lettered in
  each resident's voice, checked by the language controllers there). `tools/build-camera-stickers.py ../jojo` makes the
  1024 px and 256 px WebP copies and the manifest (it records the studio commit). Run it again after the studio adds or
  re-cuts a sticker. The Thuan stickers are the sheets of 19 October 2026, drawn before her Pixar body replaced the
  cartoon in World; new Pixar stickers would be made in the studio first.

## Checks

```
node camera/tests/looks-gl.test.mjs          # every Look converts; recipe, sizes, rows
node camera/tests/camera.browser.mjs         # real Chromium with a fake camera, phone and desktop (needs ffmpeg for the photo feed)
CAMERA_SHOTS=/tmp/shots node camera/tests/camera.browser.mjs   # and screenshots of each step
```

The browser check compiles and draws all 19 Looks on the camera picture, takes a photo with a mix, a sticker and the
date stamp, re-edits it from its source (adjustments, a second sticker resized by its handle, hold for the original),
imports and saves a photo, deletes one, reloads, and requires no page errors. It runs in software WebGL (SwiftShader);
real phones (iPhone Safari, Android Chrome) and their frame rates are not covered by it.
