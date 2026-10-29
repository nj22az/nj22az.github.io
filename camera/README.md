# Pocket Camera

`/camera/`: a camera and photo editor for **every Look in Johansson World**, alone or mixed, with the residents'
**die-cut stickers**. Asked for by the owner on 29 October 2026: "a fun mini app for the office of Johansson website,
photo editing app and a live camera app … use all the shaders from Johansson world on my photos maybe even a
combination. Make it feel like a polished camera app playful like Gameboy camera, … I don't want to have a Gameboy on
screen: use Apple design", then "Bring the die cut stickers to the camera app", "Audit yourself what's wrong pls fix it,
be designer for Gameboy camera and DS camera and a comic Artist" and "I want to be able to use my own photos too".

## What it does

- **Camera**: the live picture through any Look; swipe across it for the next one, drag up or down on it for light
  (a sun on the right edge; the small sun chip puts it back), tap twice to turn the camera round. Behind the chevron at
  the top, as on an iPhone: Timer (3 s, 10 s), Shape (4:3, 1:1, 16:9), Frame, Mirror, Date and Sound, each in yellow when
  on and shown beside the chevron while the row is closed. Digital zoom (1×, 2×, 3×), the film camera's date stamp
  (`’26 10 29`, as the hotel photos print it), a shutter that sounds and flashes, and the photo flying into the album.
- **Frames** (`frames.js`), as every hand-held camera photo had one: **Print** (an instant print's white border and
  deeper foot), **Panel** (a comic panel's hand-inked border on white), **Film** (a 35 mm frame with its sprocket holes
  and edge print, turning with the picture). Drawn over the picture's edges in the viewfinder and in the save alike;
  the date stays in the picture's own corner, stickers and balloons may cross the border as a balloon breaks a panel.
- **Mirror** lens: **Twin** (the left half mirrored onto the right) and **Quad** (one quarter into four), the trick
  lenses of the hand-held cameras, before the Looks so they draw the mirrored picture.
- **Mix**: up to three Looks stacked, each with its own intensity (tap the chosen one again in the camera; there the
  slider stands in for the strip). The dice rolls one of sixteen **named mixes** chosen by eye on a real photo and on the
  town ("Toy town" Print + Miniature, "Cartridge TV" 16-bit + Old TV, "Ink & wash" …; `MIXES` in `app.js`, with the
  pairs left out and why); "Mix" adds a Look's partner from those first. Thumbnails show the picture itself in every
  Look, over the layers before the one being chosen.
- **Editor** (a photo from the device, or any photo in the album): Looks, Adjust (Light, Contrast, Colour, Warmth,
  Pattern, the size of dots, strokes and lines, and Detail, how many lines the drawn Looks ink), Stickers, Frame (the
  frames over the photo itself, Mirror, the date stamp); hold the picture to see the original.
- **Stickers**: Thuan, Fuji, and Thuan & Nils, on the viewfinder or a photo. Drag; pinch and turn with two fingers;
  the corner handle turns and resizes with a mouse; wheel resizes, Shift+wheel turns; arrows nudge, Delete removes.
- **Lettering** (`lettering.js`, the first sheet): Speech, Shout, Thought and Caption with the photographer's own words,
  lettered as a letterer does (balanced lines in an oval, one closed outline round balloon and tail, a shout in
  capitals in a burst, a thought with its bubbles, a caption box) in Baloo 2, the face the residents' stickers are
  lettered in; drawn from paths, sharp at any size. The tail turns with the flip button, the words change with Aa or a
  double-click.
- **Your own photos**: **Photos** at the top right (and Your photos on the first screen and in the album, or drop
  pictures on the window, or paste one): one photo opens in the editor; several at once go straight into the album in
  the camera's Look, frame and light.
- **Your own stickers** (`cutout.js`, the sheet **Mine**): any photo becomes a die-cut sticker with the studio's white
  border, grey cut line and shadow; a picture with a transparent background (a subject lifted from a photo with Copy
  on an iPhone, iPad or Mac, then **Paste**) is cut round its own outline, any other with rounded corners. Kept on the
  device with the album; deleting one takes it off the viewfinder too, and saved photos keep it.
- **Album**: kept in this browser (IndexedDB), nothing uploaded. Each photo keeps its untouched picture and its
  recipe, so **Edit** starts again from the original with every Look, setting and sticker where it was. Share (the
  system sheet, so a phone can save to Photos) or download.

Default first Look: **Pocket**, the town's own hand-held camera (World's `pocket` Look), which gives the Game Boy
Camera feeling with no console on screen. Fuji ("Haisai!") or Thuan ("Chào nha!") greets on the first screen, and
Fuji salutes the empty album ("Casting off!"); every tap answers with a soft sound, which Sound in the settings mutes. The interface follows Apple's camera and Photos apps: always dark, system
font, the camera's yellow for what is chosen, translucent material, 44-point targets. A wide window puts the controls
beside the picture, as on an iPad.

## How it works

| File | Purpose |
|---|---|
| `looks-gl.js` | The WebGL2 engine: World's Looks on a picture, the first pass, mixing, thumbnails, tiled saves |
| `app.js` | Camera, tray, editor, album, viewer, keys and gestures |
| `stickers.js` | The sticker layer on the picture, and printing stickers into a save |
| `album.js` | IndexedDB storage of shots (photo, source, thumbnail, recipe) and of the own stickers |
| `frames.js` | The frames, drawn over a picture of any size |
| `lettering.js` | Balloons and captions, laid out and drawn |
| `cutout.js` | The photographer's own pictures to die-cut stickers |
| `fonts/` | Baloo 2, subset to Latin and Vietnamese (SIL OFL 1.1, `OFL-Baloo2.txt`) |
| `stickers/` | Web copies of the studio's sticker sheets and `stickers.json` (built, see below) |
| `preview.jpg`, `card.webp`, `card-narrow.webp` | Link preview and the homepage card, from `tools/render-camera-preview.mjs` |

- **The shaders are World's, imported, never copied**: `looks-gl.js` imports `johansson-town/src/render/looks.js` and
  builds each Look without depth (the picture-only build Studio's comic panels use), as GLSL ES 3.00, wrapped so it
  mixes into what came before. A new or changed Look in World appears here with no change.
- **One replacement in World's source**: `unit()` (patterns sized to a 1080-line screen) follows the picture's height,
  so dots and strokes cover the same share of the viewfinder, a thumbnail and a 12-megapixel save. The Node test fails
  if World's `unit()` changes and the replacement stops matching.
- **First pass (ours)**: crop, mirror, the Mirror lens, Light/Contrast/Colour/Warmth; for Looks that draw lines a light
  edge-keeping smoothing so camera noise is not inked (Detail widens or removes it); for the ink Looks (`INK_LOOKS`: Pocket, 16-bit, Lines, Manga, Print, Riso,
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

The browser check (36 checks at phone and desktop size) compiles and draws all 19 Looks on the camera picture, starts
the camera twice at once (one camera stays on), mixes by hand and by the dice, sets the Print frame and the date in the
settings row, drags light up and puts it back, sticks on a sticker (dragged, then pinched with two fingers) and a
lettered balloon, takes the photo (the print's border is in the saved file), re-edits it from its source (Film frame,
Twin, Pattern, Detail, Light, a third sticker resized by its handle, hold for the original, Cancel held while saving),
imports one photo and then two at once, makes own stickers from a cut-out and a photo and deletes one, deletes a photo,
reloads (album and own stickers kept), loses the graphics and takes no black photo, and requires no page errors. It runs in software WebGL (SwiftShader), which never restores a lost context, so the camera coming back after
one is not checked; real phones (iPhone Safari, Android Chrome) and their frame rates are not covered by it either.
