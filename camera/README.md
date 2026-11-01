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
  (lanterns and fireworks), **Hello** (Thuan, redrawn in four shades from her own sticker, waving from the corner), **Island Post** (a Minato postcard) and **Shop Day** (an island shop awning).
  Each is a sheet of pieces in `frames/` (corners, edges that repeat, scenes set against an edge) that `frames.js`
  lays out for the photo's own shape and enlarges with hard pixel edges, never stretched. In the camera, **Frame** in
  the settings row opens a sheet with every frame on the picture as it is; the editor's Frame tab has the same row.
  `python3 tools/draw-camera-frames.py --preview out.png` draws them on a photo at three shapes;
  `python3 tools/draw-camera-frames.test.py` checks that the files are the drawing and every border is whole.
  (Frames from a Game Boy Camera project were looked at and not used: no licence, and others' marks and art.)
- **Mirror** lens: **Twin** (the left half mirrored onto the right) and **Quad** (one quarter into four), the trick
  lenses of the hand-held cameras, before the Looks so they draw the mirrored picture.
- **Mix**: up to three Looks stacked, each with its own intensity (tap the chosen one again in the camera; there the
  slider stands in for the strip). On the live camera the dice rolls one of twenty named, curated mixes
  (`MIXES` in `smart-shuffle.js`); "Mix" adds a Look's partner from those first. In the photo editor the dice compares
  small previews of that original photo, chooses among high-ranking mixes and tunes their strengths, adjustments and
  Enhance. Repeated clicks explore variations; Undo Surprise restores the preceding Look/settings. Processing stays
  on the device. This screens for usable tone, colour and structure; it cannot guarantee personal taste. Thumbnails
  show the picture itself in every Look, over the layers before the one being chosen.
- **On a phone's browser** (a short screen: Safari with its toolbars) the picture takes the whole width and the Look
  row sits on its foot; the strip of Looks unfolds from the Look's name (the little chevron) and folds again at a tap
  on the picture; swiping across the picture steps through the Looks. On a tall screen (the Home Screen app) the tray
  stays under the picture. Every row fits across a phone held upright, 320 to 430 points wide: the seven settings,
  the sticker tabs, the six adjustments. One panel at a time: a sheet coming up puts the settings row away. The
  first screen has one way to start the camera (no shutter under it). In one photo, Download and Edit are white and
  Delete red; the album's Play opens Memory.
- **Editor** (a photo from the device, or any photo in the album): Looks, Adjust (Light, Contrast, Colour, Warmth,
  Pattern, the size of dots, strokes and lines, and Detail, how many lines the drawn Looks ink), Stickers, Frame (the
  frames over the photo itself, Mirror, the date stamp); hold the picture to see the original.
- **Crop** in the editor: pinch to zoom from 1× to 4× and drag the photo into position, or use the zoom slider.
  Original, square, 4:3, 3:4, 16:9 and 9:16 shapes; Reset restores the whole photo. A mouse can drag or wheel to zoom;
  arrow keys move the crop. The crop is kept with the recipe and restored on re-edit; Looks, frames, stickers and
  Erase all use the same cropped area. Imported originals are kept byte-for-byte until an Erase changes the source.
- **Smaller saves**: JPEG quality 0.88, at most 2,560 pixels on the long edge, without enlarging small photos.
  Applies to camera captures, edited photos and batch imports. Sources retain their editing resolution (up to
  4,096 pixels decoded); exports' dimensions in the album match the actual JPEG. Existing saved photos change only
  when saved again from the editor.
- **Enhance photo** in Adjust: an optional switch and 0–100% strength (65% on first use). Gentle edge-preserving
  smoothing, bounded luminance sharpening, crop-aware tone correction and restrained colour, applied before the Looks
  and manual adjustments. Hold the photo to compare with the original; switch off to restore the unenhanced result.
  The recipe retains the strength and re-edit starts from the retained source. Processing stays on the device, with
  no downloads or uploads. This is conventional photographic correction, not AI reconstruction or upscaling.
  No code, models or binaries from Merserk's Visual Enhancer are included: its Windows/DLSS/DirectML dependencies
  do not run in this browser, and its source licence restricts redistribution and hosted equivalents.
- **Makeup** in Adjust: Skin, Lips and Blush strengths with Rose, Peach and Berry colours. Find face uses
  a bundled offline frontal-face classifier; Align face moves/resizes the guide and independently positions both eyes
  and the mouth. Drag handles or use arrow keys (Shift for larger steps); Angle handles tilted faces. Lip width/height
  and the drawn lip outline fit the mask to a smile. Check placement
  before colouring. Effects preserve the original source and face geometry; Reset switches all effects off while
  retaining placement. Preview is bounded to 1,280 pixels; Save copy applies the recipe to the full decoded source.
  Original compares the source before makeup. Lip colour uses an adjustable template, not semantic lip segmentation.
- **Smart Erase**: Erase → Find spots marks up to twelve small, isolated contrast spots. Tap a numbered marker or its
  accessible numbered button to heal that area with the existing content-aware fill; nothing changes until selected.
  The manual brush remains available for larger distractions, with exact Undo during the editing session. This is
  local spot analysis, not automatic person/object recognition; inspect suggestions before removing them. Faces and
  texture can contain intentional details. Large removals and complicated backgrounds can need several brush passes.
  Makeup, detection and healing run on device and work after the offline download completes.
- **Stickers**: the camera's cast is Johansson, Thuan and Thao (the owner, 29 October 2026: "Remove Fujita he is not
  important for the camera app", "Use Johansson , Thuan and Thao"): **Thuan**, her Blender doll (the owner: "I was
  thinking blender Thuan the one that looks like a real doll"), **Johansson** and **Thao** in their Pixar bodies (as World
  draws them), and under Thuan's tab her other sheets, each under its name: **World Thuan** (hers), **Cartoon Thuan** and
  **Thuan & Nils**. One tab a resident: Text · Thuan · Johansson · Thao · Mine, all across the phone. On the viewfinder
  or a photo: drag; pinch and turn with two fingers; a chosen sticker has remove and flip at its top and, if it has
  words of its own, Say below; the corner handle (a mouse only) turns and resizes; wheel resizes, Shift+wheel turns;
  arrows nudge, Delete removes.
- **Text** (`lettering.js`, the first sheet): Speech, Shout, Thought and Caption with the photographer's own words,
  lettered as a letterer does (balanced lines in an oval, one closed outline round balloon and tail, a shout in
  capitals in a burst, a thought with its bubbles, a caption box) in Baloo 2, the face the residents' stickers are
  lettered in; drawn from paths, sharp at any size. The tail turns with the flip button, the words change with Aa or a
  double-click.
- **Your own photos**: **Photos** at the top right (and Your photos on the first screen and in the album, or drop
  pictures on the window, or paste one): one photo opens in the editor; several at once go straight into the album, with
  the camera's frame and light. Either way they start with the camera's main Look alone, never its whole mix (the
  owner, 29 October 2026: "main look and then we play with it in the app"); a second or third Look is added in the
  editor.
- **Your own stickers** (`cutout.js`, the sheet **Mine**): any photo becomes a die-cut sticker with the studio's white
  contour and restrained shadow; a picture with a transparent background (a subject lifted from a photo with Copy
  on an iPhone, iPad or Mac, then **Paste**) is cut round its own outline, any other with rounded corners. Kept on the
  device with the album; deleting one takes it off the viewfinder too, and saved photos keep it.
- **Album**: two sample photos (the original and Adventure Ink) are added once, including to existing albums. They can be edited or deleted; deleted samples do not reappear. Kept in this browser (IndexedDB), nothing uploaded. Each photo keeps its untouched picture and its
  recipe, so **Edit** starts again from the original with every Look, setting and sticker where it was. Share (the
  system sheet, so a phone can save to Photos or choose a social app) or download.

- **Save and Share**: Save and the shutter store photos directly in the app's album. **Share** opens the phone's
  system sheet, where Photos/Save Image and other apps are available. The optional printer accompanies Share and
  never delays the share call; **Print** switches that animation off, and reduced motion skips it. Cancelling Share
  removes the printer without downloading or resaving. Unsupported file-sharing browsers offer Download. A failed
  album save keeps the edit open and reports the error, without substituting a download.
- **Paper** under Frame, in the editor and the camera's Frame sheet: None, Drawing, Rough or Warm. A deterministic
  paper finish after the Looks, before frames, date and stickers. It follows the photo into the album and re-edit;
  camera paper is remembered. None is the default and adds no pass or texture.
- **Solitaire** fits its seven columns to the available board width, including narrow phones. Short landscape
  screens use smaller cards; long runs scroll vertically. Rotation and browser-height changes retain the game.
- **Memory** (`memory.js`, the game pad at the top of the album, or Play Memory in an empty album): pairs of cards
  face down, turn two, keep them if they match. Play with **your own photos** (at least six in the album), one of
  the residents' sticker sheets (each of the sheets above) or **your own stickers**; 6, 8, 10 or 12
  pairs. The board takes the grid that gives the cards the most room on the screen; a third card turns two that did
  not match back at once; moves and time are counted, the best game for each set of cards and size is kept, and a
  resident cheers the last pair.
- **Card games**: the Album opens a game room with Blackjack and draw-one Klondike Solitaire. Blackjack has no stakes: Hit or Stand, with the dealer standing on 17. Solitaire uses tap-to-select and tap-to-place controls. A 52-card sheet and matching back are drawn by `tools/draw-playing-cards.py`; the Jacks, Queens and Kings use the existing Thao, Thuan and Johansson sticker artwork. The card games use a new shuffled deck for each deal.
- **Share game results**: Memory wins, Blackjack outcomes and Solitaire wins can be shared through the device share sheet, or saved as an image. A text fallback is offered when image sharing is unavailable. No result is posted until the player chooses to share.
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
there is a picture the Look tray waits and the shutter starts the camera. Johansson, the chief engineer, salutes the empty album; every tap answers with a soft sound, which Sound in the settings mutes. The interface uses black and charcoal camera surfaces, clear labels, restrained warm accents and original island pixel art, with 44-point targets. Memory uses a Python-drawn Minato lighthouse card back. A wide window puts the controls
beside the picture, as on an iPad.

## Adventure Ink

**Adventure Ink** is a camera-only Look with cel bands and ink outlines; its matching **Adventure** frame is drawn by `tools/draw-camera-frames.py`. The Look works with the existing mix and editing system.

## The camera's own Looks, and the kinds

Besides World's nineteen and Adventure Ink, five Looks are the camera's own (`looks-gl.js`, each a main of its own over
World's shared helpers; World is unchanged; the owner, 29 October 2026: "Yes add"): **Instant film** (a matte fade,
warm light, a leak of light in the corner, grain), **VHS camcorder** (an 80s home video tape: colour that bleeds and
lags along each line, lines a hair apart, the foot torn sideways, a few specks), **Comic dots** (cyan, magenta, yellow
and black dots at their own screen angles on cream paper, black only in the shadows), **Blueprint** (a cyanotype:
Prussian blue to paper white) and **Night vision** (green phosphor through a round image tube, with grain). Like every
Look they are still: nothing moves with time, so a photo is the viewfinder.

The strip shows one kind at a time (the owner: "make sub menu organisation so it doesn't feel cluttered like game
consoles can stay with each other and vhs for 80's or so"): **Photo** (Natural, Black & white, Sepia, Instant,
Miniature, Night vision), **Games** (Pocket, 16-bit), **80s** (Old TV, VHS), **Drawn** (Line drawing, Sketchbook, Pencil
crayon, Pencil manga, Manga, Cartoon, Adventure Ink, Comic dots), **Painted** (Watercolour, Oil, Heavy brush) and
**Print** (Woodblock, Rubber stamp, Blueprint), and since 30 October **Riso** (five Risographs, below) and the five
consoles under **Games**. The kind of the chosen Look is the one open and keeps its name
in yellow while another is looked at; a swipe across the picture goes through every Look, kind after kind; only the
open kind's thumbnails are drawn, and none while the strip is folded over the picture. A Look World adds later goes under
More until it is given a kind (`LOOK_GROUPS` in `app.js`). New dice mixes: Home video (Instant and VHS), Comic book
(Cartoon and Comic dots), Engineer's plan (Line drawing and Blueprint), Night watch (Night vision and Old TV).

## Pencil crayon and Rubber stamp, made for photographs

World's Looks are written for the town: its Crayon lays strokes along each wall and floor from the scene's depth and
normals, and its Stamp inks everything darker than one grey. A photograph has neither depth nor normals, and the owner's
iPhone review (30 October 2026: "does the shaders need improvement?", then "Proceed") showed what that does: Crayon an
even diagonal mesh over face and background alike with the colour washed to grey, Stamp a dark wall that swallowed the
arm in front of it, blotted cheeks and a sandpaper speckle. The camera now draws both with its own versions
(`CRAYON_BODY`, `STAMP_BODY` in `looks-gl.js`), under World's names and swatches; World's town Looks are unchanged.

- **Crayon:** wax pigment built in broad overlapping marks, with an edge-preserving colour underdrawing, lighter
  tooth and denser burnished darks. Colour fills the form rather than remaining isolated pencil scratches; pale
  skin retains its colour, and black cloth is a dark mass. Optional paper stock is chosen separately under Frame.
- **Rubber stamp:** each tone judged against what is round it, so a light shape keeps its edge against a dark one and a
  soft shadow on a face is not darkened into a blot; the ink pressed harder on one side of the print, pooled at the cut
  edges, thinning in a mottle and missing the paper in ragged patches where the pressure was light.

Both have a phone build for the viewfinder (`#ifndef LIGHT`: fewer samples, no spot blacks); a save uses the full one.
To judge a Look on real photographs, `node tools/render-camera-looks.mjs --looks crayon,stamp --out <folder> <photos>`
draws them through the camera's own engine (`--light` for the phone builds); render into one folder before a change
and another after.

## Who each Look is for

The owner (30 October 2026): "Identify who is the user for each shader, audit as this user. Manga is Rumiko Takahashi
and Akira Toriyama for instance." Every Look is judged through the eyes of the people its medium belongs to, on real
photographs (portraits, a café, a garden, a night street), at viewfinder size and at 1:1. A change to a Look is shown
to its judge before it ships (`tools/render-camera-looks.mjs`, then a before/after sheet).

| Kind | Look | Judged as |
|---|---|---|
| Photo | Natural | an iPhone photographer: nothing lost or shifted |
| | Black & white | Daidō Moriyama |
| | Sepia | a Meiji-era studio portrait photographer; the family album |
| | Instant film | Wim Wenders and his Polaroids |
| | Miniature | Olivo Barbieri's tilt-shift cities |
| | Night vision | a wildlife cameraman filming through an image intensifier |
| Games | Pocket | the Game Boy Camera's team and its players (1998) |
| | Colour hand-held | Game Boy Color pixel artists (the Pokémon Gold and Silver years) |
| | Red visor | the Virtual Boy (Gunpei Yokoi) |
| | 8-bit | Famicom pixel artists |
| | 16-bit | Super Famicom pixel artists (Chrono Trigger, with Toriyama's designs) |
| | 32-bit | PlayStation artists and today's PS1-look community |
| | 64-bit | Nintendo 64 texture artists (Mario 64, Ocarina of Time) |
| 80s | Old TV | a family watching a Shōwa-era television |
| | VHS camcorder | a parent filming a 1980s school sports day |
| Drawn | Manga | Rumiko Takahashi and Akira Toriyama: the printed tankōbon page |
| | Pencil manga | the same mangaka's pencils before inking; Takehiko Inoue's pencil work |
| | Line drawing | Moebius |
| | Sketchbook | an architect sketching on site; the Urban Sketchers |
| | Pencil crayon | a picture-book illustrator in coloured pencil |
| | Adventure Ink | Akira Toriyama's colour pages |
| | Cartoon | a TV anime colour designer (Crayon Shin-chan, Doraemon) |
| | Comic dots | the printers of 1960s colour comics; Roy Lichtenstein |
| Painted | Watercolour | Beatrix Potter; a modern urban watercolourist |
| | Oil painting | Edward Hopper |
| | Heavy brush | Vincent van Gogh |
| Print | Woodblock | Hokusai, Hiroshige and Kawase Hasui |
| | Risograph | a zine maker at a Risograph studio |
| | Rubber stamp | the designers and collectors of Japanese station stamps (eki stamps) |
| | Blueprint | Anna Atkins; an engineer's blueprint |

## The game consoles

The owner (30 October 2026): "I want more video game shaders, n64, Gameboy color, PlayStation etc". Five camera-only
Looks join Pocket and 16-bit under Games, each drawing a photo under its machine's real picture constraints, never named
after it (as with Pocket and 16-bit), and reworked the same day after their own artists' audit:

- **Colour hand-held**: 144 lines; eight shared four-colour ramps (skin, leaves, sky and water, wood, red, violet, grey,
  sunlight), each 8×8 tile taking the ramp nearest its hue and strength; flat colour, a checker only where two shades
  meet; 15-bit.
- **Red visor**: 224 rows of LED red in four shades on black, the gap between rows drawn; darkened, never exposed up.
- **8-bit**: 224 lines of wide pixels; one sub-palette per 16×16 block (three rows of one hue column of the console's
  palette, or its greys, plus the black backdrop), so the blocks clash as the console's did.
- **32-bit**: 320×240; the photo as a textured wall seen at a slight tilt on a coarse mesh, its corners snapped to
  whole pixels and the texture laid without perspective correction (lines kink at the triangles); unfiltered 2×2
  texels; the graphics chip's four-by-four dither, then five bits a channel.
- **64-bit**: a texture about 48 texels tall, cut to 15-bit, smeared by the three-point filter; fog only at the top of
  the picture and never over blacks; 16-bit with a fine noise dither.
- Pocket now has the camera's 112 rows. VHS colour trails to the right (it ran left), dropouts are rare white streaks,
  and the head switch makes one hook at the foot.

## Riso

The owner (30 October 2026): "I do love Risograph can there be several variations on Risograph?" Five Risographs, in
their own kind: **Risograph** (World's coral and teal, now printed the camera's way), **Riso pink & blue**
(fluorescent pink and blue), **Riso red & navy** (bright red and federal blue), **Riso black & pink** (a duotone: pink
for the middle tones, black for the shadows) and **Riso three-colour** (yellow, fluorescent pink and blue, the whole
picture in Riso inks). One separation serves them all (`risoBody` in `looks-gl.js`): overprinted inks multiply, which in
optical density is a sum, so each point's amounts are solved exactly (least squares, kept between none and full), and
the darks are the inks printed over each other, never a third black. Each drum prints a little out of register through
Riso's grain screen (a stochastic dither, not a dot grid), with roller streaks along the feed and a starved mottle in
big solids; the darkest drum carries the contours. A new ink pair is one line in `RISO_INKS`.

## Rebuilt for their judges (30 October 2026)

After the audits in [AUDIT-LOOKS-2026-10-30.md](AUDIT-LOOKS-2026-10-30.md), the camera draws these with its own
versions (World's town Looks unchanged): **Comic dots** (no exposure; flat colour in tints of fixed steps on four
plates, dot gain, solids and a black keyline), **Watercolour** (three transparent washes keeping their colour, glazed
darks in indigo or sepia, a soft rim where a wash dried, paper left white, no outlines), **Heavy brush** (distinct dabs
along the form, each one colour, bristle grooves, Prussian-blue drawing), **Black & white** (Moriyama: grain strongest
in the middle greys, a softer toe, halation), **Night vision** (automatic brightness, halos, scintillation and the
fibre plate's honeycomb, P43 yellow-green). Oil painting and Miniature keep World's shaders with a few of their lines
replaced (`PHOTO_EDITS`: Hopper's coloured darks without clipping, no white specks or mouth-corner blots, brushwork in
all the paint; no saturation burn), and the camera refuses to start if World changes one of those lines. The shared
line finder sees a point a little soft (no line for a hair's gap or a grain of granite) and does not draw a light,
thin mark inside a bright area (teeth); the shared hatching follows the picture's form and stays in the shadows.

Round two (after the owner's "Push then work the rest", the same day): **Cartoon** and **Adventure Ink** are cel builds
(`PHOTO_CEL`: an edge-keeping material colour, a base and one hard shadow per material, Adventure Ink's small highlight,
a brush-pen outline thick for Cartoon and fine for Adventure Ink); **Sepia** (blue-sensitive plate, chocolate blacks,
a portrait lens's soft fall-off, a faded album border), **Instant film** (soft, no grain, the developer uneven at the
bottom edge, no leak), **Blueprint** (a brushed coat with a bare-paper margin), **Old TV** (bright, a smooth rounded
screen, composite softness, bloom) and **16-bit** (material ramps in 15-bit colour) are the camera's own; Crayon's
strokes are a grain streaked along the hand; Sketchbook leaves a ragged paper margin; 32-bit's mesh tilts enough to
kink; Miniature's band sits on an upright photo's upper third. Every line Look draws through `inked()`: the lines and
contours, except a mark among bright, little-coloured neighbours lighter than their surroundings, so a row of teeth is
one white shape. The first pass makes a photo smaller as a Lanczos resize would (four samples from the mipmap level twice
the picture's size, lightly sharpened) instead of the GPU's blend between levels, which lost about a quarter of a tall
photo's fine detail; Looks that read their source softer on purpose (the line Looks) are unchanged.

Round three (after a second persona re-audit, scores and ranked fixes in the audit file): teeth no longer zipped in any
line Look (a mark that is itself light is not drawn); Cartoon and Adventure Ink, and Line drawing and Pencil manga, made
distinct; 8-bit held to the console's four sub-palettes and 13 colours; 32-bit keeps the photographer's framing (a
wobbling snapped mesh, not a tilt); 64-bit filtered smoothly; Riso grain on a 2 px interleaved-gradient screen; and the
photo, print and TV Looks adjusted as listed there.

Round four (published round three, then "proceed"): every line Look draws strokes, not specks (`inked()` keeps a mark
only where the drawing carries on a few pixels along its own direction; the phone's viewfinder skips the test, a save
draws it); Cartoon and Adventure Ink paint a cheek, not its pores (a point darker than the ring round it takes the ring's
colour before the cel colour is set), and Cartoon finds its outline at twice the scale, so it outlines shapes and its
smile is one shape. **Miniature's focus is tapped:** with Miniature in the recipe, a single tap on the picture (camera or
editor) puts the plane of focus at that height (`recipe.focus`, a height from the foot, -1 for the automatic band);
"Focus here" confirms it. Tried and left out: a busyness measure (the camera's own smoothing leaves a wrinkled cheek and
a lip line measuring alike) and a wider colour silhouette (no visible gain for thirty more samples a pixel); outlines
round a person against a background of their own colour and light need a subject mask.

## Erase

The editor's **Erase** tab (`erase.js`; the owner, 29 October 2026: "The eraser works better than the cutouts"): paint
over what should go and, when the finger lifts, it is filled from the picture round it. The fill is PhotoCraft's
Content-Aware Fill (patch-based completion; <https://github.com/storytold/photocraft>, MIT OR Apache-2.0, licence in
`pocket-algo.LICENSE.txt`), built from `tools/pocket-algo/` (a few lines over `photocraft_algo::content_aware`, pinned
to the commit it was tested at) to `pocket-algo.wasm` (157 KB), and run in `erase-worker.js` off the page's thread.
Only a window round the stroke is filled (a square of 4·√(w·h) round it, as PhotoCraft samples, at a working size of
1.6 megapixels at most), and it comes back through the painted mask, so nothing else changes. It changes the photo's
own picture: the Looks, stickers and frames are drawn over it as before, and a save keeps the erased picture as the
photo's source. Undo takes back the last few (within 64 MB). Rebuild the module with `tools/pocket-algo/build.sh`
(Rust and `rustup target add wasm32-unknown-unknown`).

PhotoCraft's Select Subject was tried for cutting own stickers out of any photo and left out: on its own it took the
wrong parts, and tapped it took the floor; a drawn box cut well, but not well enough yet beside the iPhone's own Copy
Subject, which the camera already pastes.

## A manga moment

The owner (29 October 2026): "How about Line messengers crazy effects ? … Can make the pictures look like they are from
a manga", then "Yes proceed". Nothing of LINE's is used (its art and code are its own); these are manga's common
techniques, drawn here:
- **Focus lines** (集中線) and **speed lines** (`effects.js`, the Manga tab): a sticker of their own over the whole
  picture, painted under every other sticker. The clear circle is what is held: drag it onto a face, pinch to widen
  it, turn speed lines with two fingers; flipped, the lines are white for a dark picture. The same lines every time,
  at the picture's own size, in the viewfinder and in a save.
- **Sound**, a lettering style in the Text tab: the letters in Rounded Mplus 1c Black (cut down to kana, punctuation
  and Latin, 38 KB, `fonts/OFL-MPLUSRounded1c.txt`), each turned and sized a little along a rising line, black with a
  white edge. Twelve ready to tap, with what they mean: ドーン!, ゴゴゴ, ドキドキ, ガーン, ジャーン!, バーン!, キラキラ, シーン,
  ザワザワ, ゴクリ, BOOM!, WHAM!.
- **Marks** (`tools/draw-manga-marks.py`, under the lines in the Manga tab): sweat drop (drawn the way Akira Toriyama
  draws one, the owner: "Make the water drop look like an Akira Toriyama water drop": a plump bulb, a short tip that
  flicks to one side, one brush line heavy at the bottom and thin at the tip, the shine inside), anger vein, sparkles, heart,
  !, ?, !?, gloom lines, blush and a music note, drawn in Python with an ink line and a white edge. They go in small,
  by a face, and are never a deck for Memory or a greeting.

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
  (Johansson's, Thao's, some of the Blender Thuan's) has a label instead ("Waving") and offers no words of its own.
  The Blender Thuan is rendered in Cycles by the studio's `3d/cast/shots_stickers.py`; the others by World's avatar
  code (`art/stickers/render.mjs`).

## Combined release — published 31 October 2026

**31 October:** [PR #414](https://github.com/nj22az/nj22az.github.io/pull/414) is merged and published on the owner’s “Push to main”. [Publication handover](HANDOVER-PUBLICATION-2026-10-31.md); strict **143/143** browser checks and Pages deployment passed. [Thin sticker contours](HANDOVER-STICKER-CONTOURS-2026-10-31.md) are included: all 116 supplied stickers plus thumbnails, and a 0.45% rim for newly made custom stickers. Figure positions and saved IDs remain stable. [Actual comparisons](qa/2026-10-31-contours/README.md).

The combined Save/Share and Enhance review is recorded in [the integration handover](HANDOVER-INTEGRATION-2026-10-30.md), with [actual comparisons and phone-sized screenshots](qa/2026-10-30-integration/README.md). It retains the published crop/compression path. The separate #405 photographic-Look/person-mask development is not included. Physical iPhone/iPad Safari and actual Photos sharing remain unverified; screenshots and native-Share mocks are browser emulation.

## Checks

```
node camera/tests/looks-gl.test.mjs          # every Look converts; recipe, sizes, rows
node camera/tests/crop.test.mjs              # crop bounds, shapes, zoom and recipe round trips
node camera/tests/crop.browser.mjs           # gestures, source contact, saved pixels, compression and original retention
node camera/tests/save-share-layout.browser.mjs # album-only saves, native-share mock, cancellation/failure and phone Solitaire sizing
node camera/tests/enhance.browser.mjs         # reversible strength, crop/export, prior-engine parity
node camera/tests/sticker-contour.browser.mjs # catalogue, pale shoes, thin own-sticker rims and preview/export
node camera/tests/integration.browser.mjs     # full/LIGHT matrix, mixed thumbnails, exact JPEG/Share bytes, retained recipes
node camera/tests/paper.browser.mjs           # paper preview/export agreement, colour/black retention, persistence and controls
node camera/tests/blackjack.test.mjs         # scores and hand flow
node camera/tests/solitaire.test.mjs         # Klondike dealing and move rules
node camera/tests/camera.browser.mjs         # real Chromium with a fake camera, phone-browser sizes, phone and desktop (needs ffmpeg for the photo feed)
CAMERA_SHOTS=/tmp/shots node camera/tests/camera.browser.mjs   # and screenshots of each step
```

The browser check (56 checks) first opens the first screen at the sizes an iPhone's Safari really leaves (390×664 with
its toolbar, 375×560 on an iPhone SE): the greeting whole inside the picture's space, no Look tray yet, the shutter
starting the camera, the manifest, its icons at their sizes and the offline worker; then the printer (it feeds in
steps, the print lands in the album, a tap skips it, Print off saves without it) and Memory (six photos of their own,
the board whole on the screen, a miss turned back by a third card, the win and the best game kept; a 12-pair game with
the cartoon Thuan's sheet) and the pixel frames (every border closed at three shapes, the photo clear, the Harbour frame in a
saved JPEG). Then, at phone and desktop size, it
compiles and draws all 34 Looks on the camera picture, starts
the camera twice at once (one camera stays on), mixes by hand and by the dice, sets the Print frame and the date in the
settings row, drags light up and puts it back, taps Miniature's focus onto the picture (and not without Miniature), sticks on a sticker (dragged, then pinched with two fingers) and a
lettered balloon, takes the photo (the print's border is in the saved file), re-edits it from its source (Film frame,
Twin, Pattern, Detail, Light, a third sticker resized by its handle, hold for the original, Cancel held while saving),
imports one photo and then two at once, makes own stickers from a cut-out and a photo and deletes one, deletes a photo,
reloads (album and own stickers kept), loses the graphics and takes no black photo, and requires no page errors. It runs in software WebGL (SwiftShader), which never restores a lost context, so the camera coming back after
one is not checked; real phones (iPhone Safari, Android Chrome) and their frame rates are not covered by it either.

## Complete offline bundle

After the first complete online download, the Settings download icon becomes **Ready offline**. Startup, local photo
imports, Looks/Smart Surprise, editing, stickers, frames, Erase, album saves and games use a verified 22.7 MB bundle.
Keep the browser's site data. An incomplete download remains retryable and never replaces the previous complete cache.
Regenerate `camera/offline.json` and the worker digest with `node tools/build-camera-offline.mjs` after changing runtime
assets; `camera/tests/offline.test.mjs` rejects a stale bundle. Test real offline behaviour with
`CAMERA_SHOTS=./camera-offline-evidence node camera/tests/offline.browser.mjs`. Physical Safari acceptance remains open.

To update an existing Home Screen copy after a release, connect to the internet and reload/reopen the app. In Settings,
wait for the offline-ready checkmark. This release checks for updates on page/foreground resume and reconnection;
a verified newer worker enables **Update** in Settings. That action refreshes the app only after an open edit, import,
capture or share is finished. It never clears the album. Existing older releases need a normal online page reload to
receive this update control; simply reconnecting a suspended old page does not guarantee a UI refresh. Do not remove
the Home Screen app or clear site data to update. A separately downloaded ZIP/source copy needs its files replaced
or updated from the repository; it does not receive website releases automatically.

### Look settings — 1 November 2026

The Games strip has one **Handheld** tile and one **Game system** tile. Tap the sliders beside the selected mix layer:
Handheld offers Game Boy, Game Boy Pocket, Game Boy Light, Game Boy Colour and Red visor; Game system offers the
8-bit, 16-bit, 32-bit and 64-bit renderers. Riso's five ink palettes now share one tile and an Ink palette selector.
Existing recipe IDs and rendering defaults remain supported. Pocket and Light are camera-only four-shade LCD palettes.

Games and VHS can have an optional LCD or CRT finish with Scanlines, Glow, Screen curve and Pixel / phosphor grid.
Old TV adjusts its native CRT pass instead of applying a second tube. Original keeps the existing Look's appearance;
Reset removes its custom settings. Model/system changes within one family keep the screen controls; choosing a
separate Look clears them. These controls do not consume a Mix layer. Settings travel with camera preferences and
saved photo recipes, through previews, thumbnails and exports. World shaders are unchanged.

`look-settings.js` owns family/variant metadata and bounded recipe options. `tests/look-settings.test.mjs` checks
compatibility and persistence; `tests/screens.browser.mjs` exercises real WebGL and the family controls, a page-reload
album round trip, camera preferences and narrow/tablet layouts. Chromium emulation does not verify physical Safari.
