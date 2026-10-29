# Pocket Camera

`/camera/`: a camera and photo editor for **every Look in Johansson World**, alone or mixed, with the residents'
**die-cut stickers**. Asked for by the owner on 29 October 2026: "a fun mini app for the office of Johansson website,
photo editing app and a live camera app … use all the shaders from Johansson world on my photos maybe even a
combination. Make it feel like a polished camera app playful like Gameboy camera, … I don't want to have a Gameboy on
screen: use Apple design", then "Bring the die cut stickers to the camera app", "Audit yourself what's wrong pls fix it,
be designer for Gameboy camera and DS camera and a comic Artist" and "I want to be able to use my own photos too"; then,
from an iPhone, "the Ui needs improvement", "Fuji shouldn't be cropped off like that we should use the whole screen
intelligently", "Replace Fuji with a random sticker when you start" and "It should be installable as iPhone app web page
too on the Home Screen draw a Camera icon with Python"; then "Can you add the mini games and the printer animation
when saving ? I want memory with our own photos or with the stickers".

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
- **Pixel frames**, drawn in Python by `tools/draw-camera-frames.py` (the owner: "Draw our own frames in Python") in
  the hand-held camera's own way, four shades and a 16-pixel border where the photo's short side is 144: **Pocket**
  (the Pocket Look's greens, the little camera), **Harbour** (the ferry, the lighthouse, gulls and the sun),
  **Sakura** (a branch in blossom), **Ticket** (Minato to Kitano-jima, perforated and stamped), **Matsuri**
  (lanterns and fireworks) and **Hello** (Thuan, redrawn in four shades from her own sticker, waving from the corner:
  "Hi there!").
  Each is a sheet of pieces in `frames/` (corners, edges that repeat, scenes set against an edge) that `frames.js`
  lays out for the photo's own shape and enlarges with hard pixel edges, never stretched. In the camera, **Frame** in
  the settings row opens a sheet with every frame on the picture as it is; the editor's Frame tab has the same row.
  `python3 tools/draw-camera-frames.py --preview out.png` draws them on a photo at three shapes;
  `python3 tools/draw-camera-frames.test.py` checks that the files are the drawing and every border is whole.
  (Frames from a Game Boy Camera project were looked at and not used: no licence, and others' marks and art.)
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
- **Stickers**: the camera's cast is Johansson, Thuan and Thao (the owner, 29 October 2026: "Remove Fujita he is not
  important for the camera app", "Use Johansson , Thuan and Thao"): **Thuan**, **Johansson** and **Thao** in their
  Pixar bodies (as World draws them), **Cartoon Thuan** and **Thuan & Nils**, on the viewfinder or a photo. Drag; pinch and turn with two fingers;
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

- **The printer** (`printer.js`): every photo saved, from the shutter or the editor's Save, comes out of a little
  printer first, as the hand-held camera's photos came out of its printer: a white toy printer in the icon's plastic
  rises, the photo feeds up out of the slot in the motor's small steps on warm paper (its light blinks, it buzzes), is
  torn off against the slot's teeth and flies into the album's thumbnail, or onto the photo after Save. About three
  seconds; a tap skips to the tear; **Print** in the settings row turns it off for quick shooting; nothing plays with
  reduced motion. The viewfinder holds still behind it, so the print moves smoothly.
- **Memory** (`memory.js`, the game pad at the top of the album, or Play Memory in an empty album): pairs of cards
  face down, turn two, keep them if they match. Play with **your own photos** (at least six in the album), one of
  the residents' sticker sheets (each of the sheets above) or **your own stickers**; 6, 8, 10 or 12
  pairs. The board takes the grid that gives the cards the most room on the screen; a third card turns two that did
  not match back at once; moves and time are counted, the best game for each set of cards and size is kept, and a
  resident cheers the last pair.
- **Home Screen app** (`manifest.webmanifest`, `sw.js`, `icons/`): Share, then Add to Home Screen, on an iPhone (or
  Install on Android and desktop Chrome) gives Pocket Camera its own icon and a full screen without the browser. The
  icon is drawn in code by `tools/draw-camera-icon.py` (a white toy camera on graphite, the lens ringed in the camera's
  yellow, the Pocket Look's pixel house in the glass): the 180 px Home Screen icon, 192 and 512 px and a maskable 512
  for the manifest, and the 32 px tab icon. On the Home Screen the way back to the website is hidden. The worker asks
  the network first, so the app is always the site as published, and keeps a copy of the camera's own files and of the
  World code the Looks use, so the camera opens without a signal.

Default first Look: **Pocket**, the town's own hand-held camera (World's `pocket` Look), which gives the Game Boy
Camera feeling with no console on screen. The first screen greets with a sticker from the residents' sheets, a
different one each time (never the one shown last), sized to the space the browser leaves so it is always whole; until
there is a picture the Look tray waits and the shutter starts the camera. Johansson, the chief engineer, salutes the empty album; every tap answers with a soft sound, which Sound in the settings mutes. The interface follows Apple's camera and Photos apps: always dark, system
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
  re-cuts a sticker. A sheet's `who` names the resident ("What does Thuan say?"); a sticker with no checked line yet
  (Johansson's, Thao's) has a label instead ("Waving") and offers no words of its own.

## Checks

```
node camera/tests/looks-gl.test.mjs          # every Look converts; recipe, sizes, rows
node camera/tests/camera.browser.mjs         # real Chromium with a fake camera, phone-browser sizes, phone and desktop (needs ffmpeg for the photo feed)
CAMERA_SHOTS=/tmp/shots node camera/tests/camera.browser.mjs   # and screenshots of each step
```

The browser check (49 checks) first opens the first screen at the sizes an iPhone's Safari really leaves (390×664 with
its toolbar, 375×560 on an iPhone SE): the greeting whole inside the picture's space, no Look tray yet, the shutter
starting the camera, the manifest, its icons at their sizes and the offline worker; then the printer (it feeds in
steps, the print lands in the album, a tap skips it, Print off saves without it) and Memory (six photos of their own,
the board whole on the screen, a miss turned back by a third card, the win and the best game kept; a 12-pair game with
Thuan's sheet) and the pixel frames (every border closed at three shapes, the photo clear, the Harbour frame in a
saved JPEG). Then, at phone and desktop size, it
compiles and draws all 19 Looks on the camera picture, starts
the camera twice at once (one camera stays on), mixes by hand and by the dice, sets the Print frame and the date in the
settings row, drags light up and puts it back, sticks on a sticker (dragged, then pinched with two fingers) and a
lettered balloon, takes the photo (the print's border is in the saved file), re-edits it from its source (Film frame,
Twin, Pattern, Detail, Light, a third sticker resized by its handle, hold for the original, Cancel held while saving),
imports one photo and then two at once, makes own stickers from a cut-out and a photo and deletes one, deletes a photo,
reloads (album and own stickers kept), loses the graphics and takes no black photo, and requires no page errors. It runs in software WebGL (SwiftShader), which never restores a lost context, so the camera coming back after
one is not checked; real phones (iPhone Safari, Android Chrome) and their frame rates are not covered by it either.
