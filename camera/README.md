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
  the top, as on an iPhone: Timer (3 s, 10 s), Shape (4:3, 1:1, 16:9), Frame, Mirror, Date and Sound, each in green when
  on and shown beside the chevron while the row is closed. Digital zoom (1×, 2×, 3×), the film camera's date stamp
  (`’26 10 29`, as the hotel photos print it), a shutter that sounds and flashes, and the photo flying into the album.
- **Frames** (`frames.js`), as every hand-held camera photo had one, all drawn in Python since 12 November 2026 (the
  owner: "Redraw the frames too, in python, make them more playful and cute, similar style to the icons", then of the
  frames: "walk away from the Gameboy arts, but keep the playfulness from Gameboy Camera"). Sixteen, from
  `tools/draw-camera-cute-frames.py` into `frames/cute.json`: **Print**, **Panel**, **Film**, **Scallop**, **Hearts**,
  **Starry**, **Tape**, **Clouds**, **Stamp**, **Confetti**, **Peekaboo** (a cat over the edge), **Telly**, **Harbour**,
  **Blossom**, **Festival** and **Ticket**. Film keeps its edge print (MINATO 400 and the frame number on one edge,
  the stock's maker JOHANSSON WORLD on the other, since the brand round of 9 November 2026): the one lettering on a
  frame. A frame is a description in hundredths of the photo's shorter side (border
  widths, a window's corners, shapes repeated along the sides, shapes set against a corner) that `frames.js` draws at
  the photo's own size, the same on a thumbnail and on sixteen megapixels, in the viewfinder and in the save alike.
  The date stays in the picture's own corner; stickers and balloons may cross the border. In the camera, **Frame** in
  the settings row opens a sheet with every frame on the picture as it is; the editor's Frame tab has the same row.
- **The year's frames and the face cutouts** (the owner, 12 November 2026: "And frames too, and cutouts, like a frog
  costume at the pond could have a cutout for the face, think extremely playful"): Tết, Summer, Halloween, Easter and
  Christmas frames, and five cutouts (Frog, Sunflower, Astronaut, Daruma, Snowman), each a painted board over the whole
  picture with a hole where your face goes: in the viewfinder you put your face in it, as at a real board (in the
  editor, Crop brings a face to it). Published in v2026.11.13.1.
- **The pixel frames** of October (Pocket, Harbour, Sakura, Ticket, Matsuri, Hello, Island Post, Shop Day;
  `tools/draw-camera-frames.py`, four shades, a 16-pixel border) are no longer offered. They are still drawn, so a photo
  framed in one keeps it and shows it among the choices when edited. The Game Boy Looks themselves stay (the owner:
  "Gameboy filters need to stay").
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
- **Pop** in Adjust (the owner, 2 November 2026: "how about actual photo enhancements to make a photo 'pop' better"):
  a switch and 0–100% strength (50% on first use), beside Enhance and after it. A photographer's hand edit in one
  control, on the GPU from the photo's own pixels, before the Looks: midtone **clarity** against the picture's large
  shapes (a soft blur from the source's mipmap, about a 48th of the crop across, so the viewfinder, thumbnails and a
  tiled 16 MP save agree), dark places opened a little and bright places held back (a dark, quiet background stays
  dark), a gentle S-curve for depth, and **vibrance**: dull colours gain more than vivid ones. Skin (warm hues in skin's
  balance) is spared most of the clarity and the vibrance, so faces keep their hue and smoothness. Off is the photo
  exactly; the strength is kept in the recipe and re-edit restores it. Enhance cleans and corrects; Pop is the look.
- **Makeup** in Adjust: a strip of this face wearing each look (Natural, Fresh, Clean, Soft glam, Evening, Bold lip,
  Sun-kissed, Rose), one tap, one Strength; the face is found by the app as the photo opens (the face pack, below),
  and the looks are drawn on its own lips, cheeks, eyes, lash lines (eyeliner, with a wing when the look asks), lids
  (eyeshadow), teeth, brows and skin. Fine-tune behind a door; Not quite right? shows the handles over the face.
- **Appearance** (the owner, 3 November 2026: "I need Dark and Light mode"): in the camera settings, Auto (as the
  device), Light or Dark. Every colour of the chrome is a theme token (`camera.css`); the photo and what sits on it are
  not themed; the games keep their paper in light and go black in dark. The audit behind it:
  [AUDIT-UI-2026-11-03.md](AUDIT-UI-2026-11-03.md).
- **Lip colour** (the owner, 3 November 2026: "I want to be able to choose more colors in the lipstick"): under the
  Makeup strip, a row of nineteen swatches after the look's own shade (rose, peach, berry, red, coral, plum, nude,
  bronze, cherry, hot pink, fuchsia, orange, brick, mauve, wine, chocolate, violet, blue, black). A colour chosen by
  hand goes on fully, lightness and all; the blush follows it only when it is a blush colour. The chosen colour is
  named in the Makeup summary ("Soft glam · Cherry").
- **No Look by default** (the owner, 3 November 2026: "Default to no filter"): the camera opens with the plain photo; a
  Look chosen since is remembered, and the old default (Pocket) stored by an earlier release is the default again.
- **Negative** (the owner: "I want an invert function too"): a Look in the Photo kind, every colour its opposite.
- **Select** in the album (the owner, 4 November 2026: "there should be a way to manage, delete the photos too"):
  Select turns every photo into a tick box; tap the ones to go, or Select all; Delete n asks once (the same sheet as
  one photo) and deletes them together; Done leaves nothing chosen. Outside Select a tap still opens the photo.
- **Installed, the status bar is the system's opaque bar** coloured by the theme (the owner's iPad, 4 November 2026:
  "The menu in top and bottom is blurred"): the translucent one had iPadOS 26 draw a scrim over the page's top. The
  safe area under the home indicator takes the open screen's own colour, so the games' paper (or black) runs to the
  foot of the screen.
- **Remove background** (`background.js`; the owner: "and remove background"): in Erase, one tap keeps the subject and
  makes the rest see-through. A person is found by MediaPipe's Selfie Segmenter in the face pack's worker
  (`vendor/mediapipe/selfie_segmenter.tflite`, 250 KB, Apache-2.0); a plain background (a product, a logo, a drawing
  on paper) is flooded from the picture's edges by colour, patches of it inside the subject too. The mask is kept
  beside the picture, never baked in, so the Looks still see the whole photograph; it masks the preview (a
  checkerboard shows through) and the saved copy, which is a PNG with its mask kept, so a re-edit opens cut out.
  "Put the background back" undoes it. A photo with neither a person nor a plain ground says so.
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
  **Thuan & Nils**. Six sections since 13 November 2026 (*Choosing, made easier*, below): For you · Minato · Friends ·
  Seasons · Words · Mine; the residents are chips with their faces inside Minato. On the viewfinder
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
  device with the album; deleting one takes it off the viewfinder too, and saved photos keep it. Since 12 November 2026
  (the owner: "can you make a function to add stickers easily? Even use the system stickers from the phone or iPad")
  Mine has four ways in: **From a photo** (several at once: one is stuck on the picture, several wait under Mine),
  **From a sheet** (a picture of a whole sticker sheet is cut into its stickers, `sticker-sheet.js`), **Paste**, and
  the **Sticker box**, a field that takes whatever picture lands in it: a sticker chosen from the iPhone's or iPad's
  keyboard, a paste, a picture dragged in. See *Sticker sheets and adding stickers* below.
- **Album**: two sample photos (the original and Adventure Ink) are added once, including to existing albums. They can be edited or deleted; deleted samples do not reappear. Kept in this browser (IndexedDB), nothing uploaded. Each photo keeps its untouched picture and its
  recipe, so **Edit** starts again from the original with every Look, setting and sticker where it was. Share (the
  system sheet, so a phone can save to Photos or choose a social app) or download.
- **Album backup** (`backup.js`, `zip.js`; the owner, 2 November 2026: "start with backup"): the album's **Album
  backup** row opens a sheet that says where this album lives (on an iPhone the Home Screen app and Safari keep
  separate albums), how many photos and own stickers it holds, the space used and whether the browser has promised to
  keep it. **Back up album** packs one ZIP: every photo's untouched original, its finished picture and thumbnail, its
  recipe (JSON) and the own stickers, each picture byte for byte and once only. **Save backup** then opens the share
  sheet (Save to Files on an iPhone) or downloads it; two taps, because packing takes longer than a phone lets a tap
  open the share sheet. **Restore from a backup** adds every photo and sticker the album does not have, by id, after
  checking each picture's checksum; it never replaces or deletes one (a photo edited since keeps its newer self). A
  damaged or foreign file is refused with a message. The row remembers the day of the last saved backup. Plain stored
  ZIP, readable by any unzip tool; at most 4 GB and 65,535 files.

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
  icon is drawn in code by `tools/draw-camera-icon.py` (a white toy camera on Johansson World's ink, the lens ringed in the
  World's green, the Pocket Look's pixel house in the glass): the 180 px Home Screen icon, 192 and 512 px and a maskable 512
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

Eight more came on 4 November 2026 (the owner: "more shaders … that might make the images really funny or pop, or look
like a real manga or a cartoon or a comic book"), in two new kinds. **Pop**: **Pop art** (Lichtenstein's panel: flat
printer's red, yellow, blue and green, skin as a tint of red Ben-Day dots and denser dots in its shade, hair blonde or
black, a heavy even outline), **Street poster** (a stencilled screen print: the picture cut by tone into cream, sky
blue, red and navy, a fine line screen where one gives way to the next), **Neon lines** (the drawing as lit tubes on
the dark, each in the colour it crossed, with a glow), **Heat camera** (a thermal imager's ironbow false colour, the
found face warmest, blue things cold, a soft sensor blur) and **Funhouse mirror** (a fairground mirror's bulge on the
found face, two and a half times at the middle, easing to nothing at its rim; the middle of the picture when no face
is found). **Comic**: **Comic dots** (moved here from Drawn), **Golden age comic** (a 1940s book: a colourist's flat
fills in the printer's few tints, none, a quarter, a half or solid, as coarse dot screens, the black plate a hair out
of register and cyan more so, on yellowed, foxed newsprint), **Action manga** (the Manga page's screens and solid blacks
on the subject, the background cleared to paper, and speed lines ruled from the frame's edge in towards the found face,
heavy at the edge and tapering, never across the subject) and **Old cartoon** (a 1930s black-and-white cartoon: every
material one of three greys or black, a thick brush outline, on grainy, scratched, dusty film with dark corners). Manga
and Action manga share one page of screens (`PHOTO_MANGA`); the three that aim at the subject read the first found
face through the `uFace` uniform (`faceUniform()`: the oval's centre and half-size after the crop and the mirror).

The strip shows one kind at a time (the owner: "make sub menu organisation so it doesn't feel cluttered like game
consoles can stay with each other and vhs for 80's or so"): **Photo** (Natural, Black & white, Sepia, Negative, Instant,
Miniature, Night vision), **Pop** (Pop art, Street poster, Neon lines, Heat camera, Funhouse mirror), **Games** (Pocket,
16-bit), **80s** (Old TV, VHS), **Drawn** (Line drawing, Sketchbook, Pencil crayon, Pencil manga, Manga, Cartoon,
Adventure Ink), **Comic** (Comic dots, Golden age comic, Action manga, Old cartoon), **Painted** (Watercolour, Oil, Heavy
brush) and **Print** (Woodblock, Rubber stamp, Blueprint), and since 30 October **Riso** (five Risographs, below) and the
five consoles under **Games**. The nine kinds sit in one row of symbols; on a phone narrower than they are the row
scrolls and the open kind is brought into view. The kind of the chosen Look is the one open and keeps its name
in green while another is looked at; a swipe across the picture goes through every Look, kind after kind; only the
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

## The Pocket faces, the secret sheet and the dancing greeter

From the Game Boy Camera (the owner, 5 November 2026, after reading TCRF's notes on it: "Build 1, 3 and 4"). The Game
Boy Camera met an error with a scribbled photograph of one of Nintendo's staff, and its "Run" option with "Who are you
running from?"; its last stamps were unlocked by a score in Ball; Mario danced on its title screen, faster with Up.

- **The Pocket faces** (`tools/draw-pocket-faces.mjs`, `stickers/pocket-faces/`): the residents' heads, found by the
  camera's own face pack on their sticker sheets, drawn through the Pocket Look at the Camera's 128 × 112 and scribbled
  over on the landmarks (a cross over an eye, a spiral on a cheek, glasses, a moustache, horns, a monocle, tears, a
  party hat, stubble), eight of them, each with its own line. A failure's message carries one of three faces, and one
  time in eight the rare fourth ("Don't be so silly!"); a refused or missing camera is met by "Who are you hiding
  from?" before the explanation; Cancel in the editor after a change is "Who are you running from?" (Cancel after no
  change is quiet: the found faces, the makeup guide and a saved cut-out coming back are not changes); the thirtieth
  photo in the album notes that a Game Boy Camera held thirty (`pocket-faces.js`).
- **The secret sheet** (`unlocks.js`): the faces are a sticker sheet of their own, its tab shown with a lock and the
  way to open it (a win in Memory or Solitaire) until it is won; the win is met by the secret face's own line, the
  sheet opens for good (`unlocked` in the settings, wins counted in `wins`) and the faces become a Memory deck too. A
  face placed on a photo offers its line as a balloon, like any resident's sticker.
- **The greeter dances**: the sticker that greets the first screen hops and sways; a tap on the picture steps the tempo
  round (three tempos), Up and Down on a keyboard step it; reduced motion keeps it still.

## Ball, with your face (removed on 12 November 2026)

**Removed**: the owner, 12 November 2026: "remove the ball juggle game it didn't end up well". `ball.js` and its tests are
gone; the Game Room has Memory, Blackjack and Solitaire, and a win at Memory or Solitaire opens the secret sheet. What
follows is the record of what it was.

The Game & Watch juggle of 1980, as the Game Boy Camera played it with the photographer's own face on the juggler
(the owner, 5 November 2026: "I would like 2 also"; 6 November: "The ball game should have four frames and the ball
game doesn't quite work as you made it"; `ball.js`, in the Game Room beside Memory, Blackjack and Solitaire). The
juggler's arms swing together to the side you press: a tap on the left half of the LCD (the left arrow, A, or the Left
button under it) puts both hands on the left, the right half puts them on the right. A ball flies from one hand over
the head to the other side in seven segments and is caught when the hands are on that side as it comes down, then
thrown straight back, so the hands have to be moved again. Ten points a catch, as the Camera's Game B scored; a drop
ends the game; two balls at first, a third at a hundred points; every catch quickens the tempo and every hundred points
gives a breather, as the original slowed after each hundred. The balls set out on their own ticks of the crossing, so no
two ever come down on the same tick and a perfect player is never asked for two sides at once. The screen is an LCD:
every segment a ball or an arm can show is there faintly, the balls step from segment to segment, the score is in
seven-segment digits.

The juggler's head is your face in **four frames**, as the Camera took four photographs of you in four blank ovals and
showed them in turn: the booth ("Take four faces") opens the front camera with an oval to hold your face in, takes a
picture at each tap of Take (pull a different face each time), cuts each to the oval with a soft edge (`cropOval`,
`boothOval`), and the juggler's head changes between the four every other tick while you play. The setup also offers
the album's photos with a face found in them and "Choose a photo" (the face pack finds the face; one frame), and a
Pocket face juggles until a face is chosen. The face is kept in the settings (`gameFace`: `frames`, `from`). Five
hundred points, the Camera's own mark, opens the secret sheet (`unlocks.js`) and makes the juggler, your face and all,
a sticker under Mine (`ballWon`). The best score is kept (`ballBest`) and a result can be shared like the other games'.
`tests/ball.test.mjs` plays the game alone; `tests/ball.browser.mjs` the screen, the booth with a fake camera included.

The Game Room is one tap from the album: the round button in the album's bar opens it (the owner, 5 November 2026:
"I can't find the ball game"; it used to open Memory alone), and the Game Room card under the photos does too.

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

**Remove background** (`background.js`, 3 November 2026) sits beside Find spots: the person (MediaPipe's Selfie
Segmenter, 256 × 256, in `face-pack-worker.js`; `face-pack.js findPerson`) or a plain ground (`plainMask`) becomes a
mask canvas kept on the edit (`edit.cutout`), never baked into the picture. The plain ground is read as a colour that
bends, not one colour (9 November 2026; the owner: "I see big patches are white"): the rim's colour stretch by stretch
(a running median, so a subject standing on the frame's edge does not pull it), its grain as the typical stray from
that, and a flood from the rim in which every pixel carries a reference colour that drifts with the ground it crosses
and a pixel joins when it is near the reference (hue first, lightness, which shade moves, at half) and a small step from
its neighbour; a patch the rim cannot reach (between two legs, under a shadow) is read against the nearest ground and
goes too when it is more than a speck. A sheet with a shadow and a vignette, a wall lit from one side and grainy paper
now cut clean; a scene (sky over grass, noise) is still refused, and a subject whose colour is the ground's (khaki
shorts on cream paper) can still lose a little at a soft edge.
The preview is masked with CSS (`maskDataURL`, the crop's part at 512 px, re-made only when the crop or the mask
changes); the save applies it to the rendered pixels (`applyMask`, destination-in) before the frame, stickers and date,
and writes a PNG and the mask as a PNG beside it (`shot.mask`), which a re-edit reads back (`maskFromBlob`) and the
album backup carries like any other picture. The segmenter's own edge is a soft band (its mask is 256 pixels across),
so **the matte** (`matte.js`, in `matte-worker.js` off the page's thread; the owner: "Make the cut-out edge crisper on
hair") re-draws that band along the photograph's own colour edges with a guided filter (colour guide, radius 2% of the
longer side, at up to 1,024 pixels across), then firms it with a gentle curve: a strand of hair in the band keeps its
alpha and the ground between strands lets go, in about a second. A colour-projection matte (foreground and background
colours estimated on each side, the pixel placed between them) was tried first and carved dark hair away against a dark
ground; the guided feathering trusts the segmenter for what is wholly inside or outside and only moves its edge.
`qa/2026-11-03-ui/hair-before-after.png` shows the braids three times life size, before and after.

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

## Face stickers

The owner (2 November 2026): "I also want fun effects like Manga eyes, evil eyebrows, Halloween cute stickers etc
(maybe things can be brought from the avatar creator and Johansson World?)", then "Imagine using stickers for the
eyebrows from the avatar creator". Adjust → **Face stickers** (`face-stamps.js`), on the same face guide as Makeup
(the face found by the face pack as the photo opens; Not quite right? shows the handles):

- **Brows**: the avatar creator's twelve brow styles, drawn by World's own face painter (`drawBrow` in
  `johansson-town/src/avatars/face.js`, imported, never copied, so a brow redrawn in the Studio is redrawn here), with
  **Mood** from Worried through Calm and Cross to **Evil** (face.js's own moods: angry 1.4, scheme 1.7, raging 1.9),
  Size, Height and five inks (Ink, Brown, Ginger, Blonde, Witch). A photographed brow is about twice a resident's length,
  so the mood turns it a little over half as far (evil about 30°, not 52°, which stood them on end).
- **Eyes**: the residents' eyes over the photo's eyes (`drawEye`): Sparkle, Doe, Starry, and the funny faces' Hearts,
  Stars, Dizzy, Shock and Bawling, with Size and World's iris colours.
- **Shine**: manga catchlights in the photo's own eyes: the window's light high on the iris, on the same side in both
  eyes, its small reflection low on the other side, and a little star when strong.
- **Hat**: the Halloween sheet's headpieces (witch hat, cat ears, pumpkin stem), their crown on the head's crown
  (1.75 eye-spans above the eyes), as wide as the head (2.4 eye-spans), at the eyes' angle; Size and Height.
- **Finish**: **Drawn on** puts them into the picture before the Looks (Manga inks the brows, Pocket prints them in four
  greens); **Sticker** lays them on top with the sheets' white die-cut rim, like the residents' stickers.

The face is laid on the photo by its two eyes: the residents' 256-unit face (eyes 76 apart at y 104, brows at y 70) is
turned, scaled and moved so its eyes are the photo's eyes. Everything is vector, drawn at the photo's own size, so a
16 MP save is sharp. The recipe keeps `stamps` with the photo; Original hides them; Reset takes them all off; the
original photo is never changed. Nothing is uploaded: the face pack's own finder, bundled.

## The face pack, Makeup as looks, characters and Auto

The owner (3 November 2026): "it needs to be extremely polished and the app should do the job, not sliders and manual
adjustment. Manual sliders are a last resort" (the audit: [AUDIT-MAKEUP-FACE-2026-11-03.md](AUDIT-MAKEUP-FACE-2026-11-03.md)).

- **The face pack** (`face-pack.js`, `face-pack-worker.js`): every face in a photo is found by the app as the photo
  opens in the editor, in a worker, with MediaPipe's Face Landmarker (`vendor/mediapipe/`, Apache-2.0, 13.4 MB; the
  Studio's Actor's desk ships the same model). The recipe keeps a compact face per person (about 130 points: the lip
  loops, the eye and brow loops, the face oval, the irises, a few anchors, how open the mouth is and the smile), so a
  save and a re-edit draw exactly what was previewed. The guide Makeup and the Face stickers use (`makeup.face`) is
  derived from the largest face; nothing is placed by hand. A glint sweeps the photo while it looks. No face: one line,
  "I can't see a face here. Tap the face?": a tap looks again round it, and failing that puts the handles there.
  **Not quite right?** shows the handles over the face up close; a handle dragged moves the found face's own points
  with it (the eye and its brow, or the lips), and the outline drawn is the face's own oval and lips.
  `tests/face-pack-check.html` runs the finder on a phone and says how long it took.
- **Makeup as looks** (`makeup.js`): a strip of this face wearing each look (Natural, Fresh, Clean, Soft glam, Evening,
  Bold lip, Sun-kissed, Rose), one tap, one Strength after it. Each look is drawn on the face's own masks: the lips
  (outer loop less inner, so never on the teeth), the cheekbones, the band under each eye, the whites and irises of the
  eyes, the teeth when the mouth is open, the brows, and the skin (the oval less the features, gated by the skin's own
  colour, so hair and glasses stay crisp). The lip and blush colours are the person's own, moved toward the look's shade
  in OKLab and following the lip's own light, never a flat paint; the skin is evened by splitting its frequencies (pores
  and hairs kept, blotches calmed). **Eyeliner and eyeshadow** (3 November 2026): the liner is the upper lash line from
  the eye loop's own points, thin at the inner corner and fuller at the outer, carried past the corner and lifted as a
  wing when the look asks (Soft glam a little, Evening and Bold lip a full one), drawn toward black or brown and never
  on the eye; the shadow is a wash from the lash line up over the lid, highest over its middle, feathered toward the
  brow, kept off the eye, the brow and the band under the eye, and only on skin-coloured pixels, in a tone that is a
  move from the person's own skin colour (taupe, smoke, bronze, rose, plum, gold, peach). Clean draws neither; both
  follow Strength and the Eyes fine-tune. **Fine-tune** (a door): Skin, Lips, Blush, Eyes and Teeth as multipliers of
  the look, and the lip shade. An older recipe's Skin/Lips/Blush amounts become the Custom look on the same masks.
- **Characters** (`face-stamps.js CHARACTERS`): Face stickers as a strip of this face as Evil, Shocked, In love, Manga,
  Dizzy, Witch, Cat and Pumpkin; one tap puts the whole face on, the next tap the next variant. Sizes and places come
  from the found face: the drawn brows on the real brows' line, the hat's crown above the real forehead, as wide as the
  real head. Under drawn-on brows the real brows are covered with the forehead's own skin brought down over them. The
  parts (Brows, Eyes, Shine, Hat, their colours and sliders, the finish) are behind Fine-tune.
- **Auto** (`auto.js`): every photo taken or imported opens already set right: Enhance and Pop at levels measured from
  the photo (its contrast, its light, its colour, a cast; a portrait a little less Pop). The Adjust tab's first row
  says On, Adjusted or Off; off is the exact photo. The camera setting **Auto** (on by default) turns it off for new
  photos. Enhance, Pop and the six adjusters are behind the Adjust tab's own Fine-tune door.

## Zoom

The owner (3 November 2026): "I want to be able to zoom in and out on the photo while I'm in the app by gesture", then
"Make up too, face identify". `zoom-view.js`, in the editor and on the album's photo; only the view changes, never the
photo, its recipe or a save:

- **Pinch** zooms round the fingers, from the whole photo to two screen pixels on each of the photo's own (2× to 8×);
  past either end it gives a little and springs back. **One finger** moves a zoomed photo about, never past its edges
  (they give and spring back too), and a flick carries on a little. **Double-tap** zooms to 2.5× where tapped, and
  again back to the whole photo; so does the zoom button in the photo's corner (it shows the zoom, 2.5×). On a
  computer: a trackpad pinch, or ctrl and the wheel; the wheel alone moves a zoomed photo.
- **The editor** draws the photo again at the detail the zoom shows once the fingers rest (up to the photo's own pixels,
  within 8 MP and the renderer's largest side), and so the frame, the stickers' lines and lettering, the face stickers
  and Erase's marks. A sticker's buttons and outline, the face guide's handles and outline keep one finger's size.
- **Which touch is whose**: a touch that starts on a sticker is the sticker's (two fingers there size it, as before);
  one finger on the face guide's handles drags them and two zoom (on a phone the handles cover a small face); a swipe
  to the next Look only at the whole photo; hold for the original only at the whole photo (the Original button
  compares when zoomed); in **Erase** one finger paints and two zoom and move, and the brush keeps its size on the
  screen, so zoomed in it takes away finer things; **Crop** shows the whole photo, its pinch changes the crop.
- **Makeup and Face stickers**: while the face guide is on, the panel scrolls within a little under half a phone's
  screen so the photo has room, and **Not quite right?** zooms in on the face it found (about two thirds of the photo's
  height) to check the guide's eyes sit on the photo's.
- Every screen opens at the whole photo.

## Halloween, made in Blender

The owner: "make parts in blender", "implement if you make new things back into Johansson World". The **Halloween**
sticker tab (`stickers/halloween.json`, kind `season`: never a Memory deck or a greeting) has eight parts modelled and
rendered in Blender by `tools/blender/render-halloween-stickers.py` (Cycles, a Freestyle ink line in World's face ink
`#2b2623`, the residents' thin die-cut rim): World's own Halloween redrawn from its code (the paper pumpkin lantern, the
jack-o'-lantern, the plush obake, the witch hat, the pumpkin suit's stem cap) and three new things, the cat ears, a
paper bat and wrapped sweets. The three headpieces carry `hat` (the crown's place on the picture and the share of its
width that is a head's width, measured from the models), which the Face stickers' Hat places on a face. The new
things went back into Johansson World: the bat and the sweets as Johansson Studio catalogue assets (built in Blender by
`johansson-town/assets/catalog/<id>/source/build-*.py`, checked, exported and published by Studio), hung on Sakura's
lantern string and heaped on its crates; the cat ears as a Halloween costume (`storyProps(avatar).give('catEars')`).

## Johansson World's brand on the camera — 9 November 2026

The owner: "I would like the branding from Johansson World to be more clear and sophisticated." Later the same day, of
the first cut: "How about the landing page it doesn't look quite right, I mean for the camera app."

**What the World really looks like** (read from its drawn title screen, `johansson-town/title-screen.css` and
`line-ui.css`, not from the older rules under them): one typeface, LINE Seed JP; an ink `#263d39`; a green `#16815e`;
a cream surface `#f5f5ec`; a brighter green `#06c755` for a stamp's edge. Its wordmark is JOHANSSON in the ink over
WORLD in the green, plain ExtraBold letters with air between them (28 px with .035em over 24 px with .18em on a
phone), a tag line, a tilted WORK IN PROGRESS stamp, cream panels and a green Start button.
Since 10 November 2026 the World keeps its own record of this, `brand/` in `nj22az/johansson-town` (`brand.json`,
`wordmark.svg`, a test that holds it to the title's stylesheets); read that, not the stylesheets.

**The first cut was wrong, and why.** It drew a yellow, orange and red toy wordmark with a green outline, called a gold
and a navy "ink" the World's, and set the brand's words in Avenir Next: all from `landing.css` and `base.css` rules
that `title-screen.css` and `line-ui.css` have long overridden (in the live World `--gold` and `--rust` both resolve
to its green). On the landing page the toy mark sat on a grey slab, the greeter overlapped it, and the bar above was an
empty navy band. The rule since: **look at the World's drawn screen (and ask the browser which rules win) before
copying its look.**

What is there now (`camera-brand.css`, the tokens in `camera.css`):

- **The title card** (the welcome). The World's cream card, in both themes, as the World's own panels are cream over
  its harbour by day and by night. On it, once: the World's wordmark **as outlines** (drawn from LINE Seed JP ExtraBold
  at the World's own setting by `tools/draw-camera-wordmark.py`, set into the page by
  `tools/apply-camera-wordmark.mjs`; no font decides how it looks), and the camera's Japanese name ポケットカメラ as
  a stamp in the World's stamp form (signs in Japanese, words in English). The greeter dances at the right, in the room
  the wordmark leaves, clear of it whichever resident greets. Under the card, "Pocket Camera" in the World's typeface,
  "A little camera from Minato Machi. Take a photo, try a Look, play with your face.", and a Start button in the
  World's green, as Start Exploring is. The bar above is quiet there (no lockup, no rule), so the settings button sits
  at the corner of the page as the World's Settings does. The card takes spare height on a tall phone (to 220) and
  keeps its least on a short one, so the whole greeting fits an iPhone SE's Safari.
- **Two doors under the buttons** (10 November 2026): **Your album** (the last photo and how many there are) and
  **Game Room** (its ♠ ♥ sign, "Four games"), side by side, so the pair is no taller than the album's card was alone.
  A phone shows the title screen at every start unless its browser says the camera is already allowed, and the
  room was two taps behind the album. The room's Back leaves
  by the door one came in through and says so: "Camera" from the title screen, "Album" from the album (`enterGames`
  in `app.js`).
- **One lockup, everywhere else the app names itself.** A tracked eyebrow JOHANSSON WORLD in the World's green (a soft
  one, `#7fcaa5`, on dark; a deep one, `#0e5f43`, for small type on light) over "Pocket Camera": the running camera's
  bar, the settings foot ("Johansson World · Minato Machi", the version, "Visit the World ›" to `/johansson-town/`),
  the Game Room's kicker (the bar there says "Minato Machi", the room "Game Room"), the share card
  (`social-share.js`: the World's ink header, its green rules, its cream, the text signed "Pocket Camera · Johansson
  World").
- **The typeface.** The brand's words are set in LINE Seed JP, the camera's own files (`fonts/line-seed-jp-latin-700`
  and `-800.woff2`, Basic Latin and a few marks, 7 KB each, SIL OFL 1.1 in `fonts/OFL-LINESeedJP.txt`), so the camera
  still loads nothing from another host and works offline.
- **The bars** are the page's own dark again (`--bar:#0d0e10`, the browser's theme colour with it), as before the
  first cut's navy.
- **On what leaves the app.** The Film frame's far edge prints JOHANSSON WORLD beside the stock's MINATO 400
  (`frames.js`); the instant print stays plain.
- **The highlight is the World's green** (the owner, 10 November 2026: "Proceed according to your recommendation").
  What is chosen (a tab, a tile, a setting that is on, a slider's travel) and the one main button of a screen were the
  camera's yellow and then a gold; the World has no gold. `--accent` is the green as text and rings (`#5fd6a2` on
  dark, `#0e5f43` on light, 4.5:1 and better on the page, on a surface and on its own soft ground), `--accent-fill`
  the World's own `#16815e` under white words, so Start camera, Save copy, Blackjack's Hit, Memory's Play and Ball's
  Play are one button. What is drawn on the photograph keeps a photograph's colours: the sun that sets the light
  (`--sun`) and the date stamp's amber (`--stamp`). The Game Room keeps its own gold on its fittings (the choice
  tiles, the score chips, a selected Solitaire card on the green felt); its chosen deck, its chosen number of pairs
  and its main buttons are the green.
- **The Home Screen icon** (`tools/draw-camera-icon.py`) is the white toy camera on the World's ink, lit at the top,
  its lens ring and flash in the World's green. An installed icon keeps its old picture until the app is removed
  from the Home Screen and added again; that is iOS, not the camera.

`brand.browser.mjs` (11 checks) holds it: the page, the manifest and the status bar; the wordmark's two outlines in the
World's ink and green on its cream, unstroked, once; the stamp; the greeter at least 2 px clear of the wordmark for the
three widest and two narrowest stickers at 390 × 664, 375 × 560 and 390 × 844, the whole greeting on the first screen;
the two doors side by side, a finger high, each label on one line at 375 × 560, 360 × 640 and 390 × 844, and the
room's Back leaving by the door one came in through; the lockup drawn by LINE Seed JP itself (the browser's account of
the glyphs, not the stylesheet's); the settings foot's 44-point link; the Game Room's kicker on one line; the
highlight's tokens in both themes with their contrasts, and Hit, Play and the chosen deck in the green; the Film edge
print; the share card's ink and cream; the icon's ground, ring and flash. `wordmark.test.mjs` checks that the page's block is the drawn outlines and that nothing of the toy wordmark or
the navy is left.

The same day, from the owner's phone: **"The cat out in the stickers need improvement. I see big patches are white";
"Eh Johansson's Legs are not cut out right."** Two things were wrong. The residents' die-cut stickers kept the studio's
paper wherever the figure enclosed it (between two legs, under an arm akimbo, inside a crooked elbow: pure white against
the figure's ink, which `tools/camera_sticker_contours.py` had left as "enclosed white" so shirts and teeth would
survive); `enclosed_paper` now tells the studio's flat paper (nearly all pure white, bounded by ink) from a garment's
shaded whites and cuts it, every set was rebuilt from the studio's plain cuts (`tools/build-camera-stickers.py
../jojo`, style `20261109-contour2`), and the thumbnails are resampled with the alpha premultiplied (`shrink`), so no
grey or white fringe. And Remove background's plain flood gave up on any ground that was not one flat colour, so a
thing on a sheet with a shadow went to the person segmenter and came back with its sheet: see Remove background below.

## The fun round — 12 November 2026

The owner: "I don't like the sliders or the icons, can you improve the user interface and remove the ball juggle game it
didn't end up well, use python and draw the assets, draw the icons, make it really fun to use, and have many presets to
make the shaders to look awesome, sliders need to be accessed by a setting". Published as v2026.11.12.1.

- **Icons drawn in Python** (`tools/draw-camera-icons.py` → `icons/ui-icons.json`; `node tools/apply-camera-icons.mjs`
  sets them into the page between its icon markers and writes `look-icons.js`; `--check` fails when either is stale):
  51 interface symbols, 11 kinds, 43 Looks and 4 Game Room signs on a 24 grid, chunky and filled in two tones of the
  text's own colour. The owner: "Looks much better".
- **Presets** (`presets.js`): 225 named presets over the 43 Looks, in a row under the strip once a Look is chosen (a
  console family's models first). A preset is a strength, a small tune of tone and colour, sometimes a second Look laid
  over (`over`), kept on the layer (`preset`, `tune`, `mate`); `looks-gl.js tuned()` adds the tunes to the
  photographer's own adjustments. Pattern and Detail do not show at thumbnail size, so presets leave them alone.
- **Sliders behind a setting**: Settings → Sliders (off by default; `state.sliders`, the page's `data-sliders`). Off, a
  control that was a slider is a stepper (`steppers.js`: minus, pips, plus; it drives the slider's own input, so
  everything that listened still hears each step) and the intensity slider is the preset row; on, the sliders return.
- **Frames** redrawn (above). **Ball** removed (below).
- **A first pass of the playful interface** (the owner: "Redraw the whole ui in the playful style, so it's fun to use
  the app"; the foot of `camera-fun.css`, published in v2026.11.13.1): rounder tiles and cards, a solid lower edge on
  the primary and pill buttons and the steppers that goes down under a finger, everything pressable gives and springs
  back (not under reduced motion), and the sliders, when on, have a track with some body and a ringed thumb. Colours
  and layout are as they were. The rest of the redraw is still to come.

### Choosing, made easier — 13 November 2026 (on the branch, not yet published)

The owner: "Yes it's looking better, try to make the sticker sections more intelligent and choosing filter too, it's a
bit overwhelming as it is now". Forty-three Looks and some four hundred stickers are too many to show at once, so each
picker opens on a short page **For you** and keeps the rest one tap behind (`picks.js`, plain functions, tested in
`tests/picks.test.mjs`).

- **Looks.** The first kind is no kind: **For you** (a star, and the one kind whose name is written out; the chosen
  kind always says its name, one name at a time). Its strip is the photo as it is, up to two Looks used lately (the
  Looks of the photos last taken or saved, `recentLooks`), and six picked for this picture: from what it is (dark or
  bright, pale or colourful, busy or plain, warm or cool, a face or none: `lookPrior`, on the measurements
  `smart-shuffle.js` takes of a small copy that is not kept) and, in the editor, from how the twelve likeliest really
  come out on it (each preview scored as Surprise scores a mix, for at most a second and a half); never more than two
  of one kind. In the camera the picture is measured when the camera starts and when the strip is opened. For you
  stays open while the chosen Look is one of its picks; a swipe to a Look that is not shows that Look's own kind.
  **Every Look in the strip says its name.**
- **Styles** (a Look's presets) open when the chosen Look is tapped again, in the editor as in the camera: one row of
  choices at a time. The first times, the toast says so ("tap it again for its styles").
- **Stickers.** Six sections where there were ten tabs: **For you** (what was used lately, `recentStickers`; the
  season that is here or coming; things to wear when there is a face, found in the photo or the camera turned on
  you; a handful that changes with the day, led by a balloon), **Minato** (the residents, the town's things and the
  secret faces, each a chip with a face; the secret one a lock alone until a game opens it), **Friends**, **Seasons**,
  **Words** (balloons, lines and marks) and **Mine**.

### Sticker sheets and adding stickers

- **The camera's own sheets** are listed in `stickers/sheets.json` and loaded by `stickers.js` after the residents'
  manifest; a tool that draws or cuts a sheet adds it to the list, so a new sheet needs no code. A sheet says its `tab`,
  its `kind` (`marks`, `season` with its months `when`, `secret`, `cute`, `things`, `studio`) and whether it is one of
  Memory's decks (`deck`). A sheet with a kind never greets. A sheet's `tab` puts it in a section: Friends, Season and
  Manga in theirs, any other tab (a resident's, Shōwa, Faces) a chip inside Minato; in Seasons the sheet in season
  comes first, then the next to come; a group's own sheet first, every other under its name.
- **The owner's sheets, cut by `tools/cut-sticker-sheet.py`** (the owner: "You can make stickers of my Johansson Assets
  too", "Here are more sticker sheets"): **Cartoon Johansson** (38, his sailor in his poses, under Johansson's tab, a
  Memory deck and a greeter), **Animation Studios** (8, the studio's marks), **Matsuri** (33, under Season) and
  **Shōwa** (21, under Minato). The pictures are kept in `tools/sources/sticker-sheets/` with a recipe each (which
  pieces, their names, how the sheet is read). The tool finds every drawing (the ground flooded in from the edges, so
  paper inside a closed outline stays; a small mark near a drawing is cut with it, nearest first), gives it a die-cut
  edge and writes the sheet. Adding one: `python3 tools/cut-sticker-sheet.py --new picture.png --id harbour --name
  Harbour --tab Minato --sheet out.png`, name the pieces in the recipe it wrote, run it again on the recipe.
- **Friends**, drawn in code (`tools/cute_hand.py`, `tools/draw-cute-stickers.py`): a frog, a duck, a rabbit, a cat and
  a bear in the flat hand of the icons and the frames, each with its own build and its own way of being, 22 small
  scenes (the frog sips its tea, the duck says no, the rabbit has the worst day ever, the cat and the cup) and 10 plain
  **Bits**. The owner's notes on the way: a first sheet of plain things "a bit too generic"; a wobbly ink line "too
  ugly … I think you lost your art style?"; five round balls "too round, they lack personality"; of these builds "The
  animals are better". A Memory deck.
- **The friends through the year** (the owner: "And Japanese matsuri festival and lunar Tet stickers", "And Christmas,
  and Halloween and Easter and summer"): 28 stickers in six sheets under Season, the same five dressed for the day
  (the duck is a ghost, the frog is definitely an egg, the cat is in the tree). Published in v2026.11.13.1.
- **From a sheet**, in the app (`sticker-sheet.js`): the same reading as the tool, on the device; a photograph (no
  ground all round it) is not a sheet and becomes one sticker. Each piece gets its edge from `cutout.js`.
- **The sticker box**: an iPhone or iPad offers its keyboard's stickers only in a field that takes pictures, so the
  box is one (a `contenteditable`); it catches a paste, a picture the system inserts, and a drop, and nothing can be
  typed in it. **Not yet tried on a phone**: the paste, the inserted picture and the drop are tested in Chromium; the
  keyboard's own sticker drawer needs the owner's iPhone.

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
| `face-stamps.js` | Face stickers: World's brows and eyes, manga shine and Halloween hats on the face guide |
| `backup.js`, `zip.js` | Album backup: one stored ZIP of originals, photos, recipes and own stickers; restore adds, never replaces |
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
node camera/tests/stickers.browser.mjs        # the sheets on the list, six sections and For you, seasons, decks and greeters, a sheet cut in the app, the sticker box
node camera/tests/picks.test.mjs              # what is offered first: Looks picked for a photo, the stickers' first page through the year
node camera/tests/integration.browser.mjs     # full/LIGHT matrix, mixed thumbnails, exact JPEG/Share bytes, retained recipes
node camera/tests/paper.browser.mjs           # paper preview/export agreement, colour/black retention, persistence and controls
node camera/tests/zip.test.mjs                 # the backup ZIP: round trip, checksums, a standard reader, damage, foreign files
node camera/tests/backup.browser.mjs           # backup sheet, share/download, byte-for-byte restore, never replacing newer edits
node camera/tests/face-stamps.test.mjs         # face stickers' recipe, World's parts and the face geometry
node camera/tests/face-stamps.browser.mjs      # brows, eyes, shine and hats on the real portrait; finishes, save, re-edit, phone width
node camera/tests/pop.browser.mjs              # Pop: exact when off, contrast and colour, skin and dark backgrounds, any size, the row
node camera/tests/zoom.browser.mjs             # zoom: pinch, move, flick, double tap, edges, detail, stickers, Erase, Crop, Makeup, save, album, wheel
node camera/tests/makeup.test.mjs              # the makeup recipe, a face from the guide, the pure pass: outside the face untouched
node camera/tests/face-pack.browser.mjs        # the face found as the photo opens, the handles, the recipe, no face
node camera/tests/auto.browser.mjs             # Auto's levels, on by default, off exact, Adjusted, the setting
node camera/tests/theme.browser.mjs            # Appearance: Auto follows the device, Light and Dark pinned and remembered, no flash, 4.5:1 in both, the games' paper and black
node camera/tests/brand.browser.mjs            # Johansson World's brand: page, manifest and status bar; the title card's wordmark (the World's outlines, ink and green on cream) once, the greeter clear of it; the lockup drawn by LINE Seed JP; the title screen's two doors (the album, the Game Room) and the room's Back by the door one came in through; the settings foot, the Game Room's kicker at 4.5:1 in both themes; the highlight in the World's green (tokens, contrasts, Hit, Play, the chosen deck and pairs); the Film edge print; the share card; the icon's ink and green
node camera/tests/wordmark.test.mjs            # the page's wordmark block is the drawn outlines; the brand type's files and licence; nothing of the first cut left
node camera/tests/defaults.browser.mjs         # no Look by default, the old default migrated, a chosen Look kept; the lip colour row
node camera/tests/background.test.mjs          # Remove background's plain flood and person mask on synthetic pictures
node camera/tests/background.browser.mjs       # Remove background on the portrait (the segmenter), a drawing on paper, a photo with neither; the PNG and its mask
node camera/tests/matte.test.mjs               # the cut-out edge's refinement: box mean, resampling, guided filters, hair-thin spokes kept
node camera/tests/album.browser.mjs            # Select in the album: tick boxes, Select all and none, Delete n together, Done
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
compiles and draws all 43 Looks on the camera picture, starts
the camera twice at once (one camera stays on), mixes by hand and by the dice, sets the Print frame and the date in the
settings row, drags light up and puts it back, taps Miniature's focus onto the picture (and not without Miniature), sticks on a sticker (dragged, then pinched with two fingers) and a
lettered balloon, takes the photo (the print's border is in the saved file), re-edits it from its source (Film frame,
Twin, Pattern, Detail, Light, a third sticker resized by its handle, hold for the original, Cancel held while saving),
imports one photo and then two at once, makes own stickers from a cut-out and a photo and deletes one, deletes a photo,
reloads (album and own stickers kept), loses the graphics and takes no black photo, and requires no page errors. It runs in software WebGL (SwiftShader), which never restores a lost context, so the camera coming back after
one is not checked; real phones (iPhone Safari, Android Chrome) and their frame rates are not covered by it either.

## Complete offline bundle

After the first complete online download, the Settings download icon becomes **Ready offline**. Startup, local photo
imports, Looks/Smart Surprise, editing, stickers, frames, Erase, album saves and games use a verified bundle (about
45 MB since 12 November 2026: the face finder is 13 MB of it, the sticker sheets 28 MB).
Keep the browser's site data. An incomplete download remains retryable and never replaces the previous complete cache.
Regenerate `camera/offline.json` and the worker digest with `node tools/build-camera-offline.mjs` after changing runtime
assets; `camera/tests/offline.test.mjs` rejects a stale bundle. Test real offline behaviour with
`CAMERA_SHOTS=./camera-offline-evidence node camera/tests/offline.browser.mjs`. Physical Safari acceptance remains open.

To update an existing Home Screen copy after a release, connect to the internet and reload/reopen the app. In Settings,
wait for the offline-ready checkmark. The app checks for updates on page/foreground resume and reconnection; the first
launch after a release still shows the previous version while the new bundle downloads (an offline app paints what it
has). Once the newer worker is verified, the app refreshes itself as soon as nothing is going on (the first screen
before the camera runs, or the album; `offline.js autoReload`, since 5 November 2026) and says "Pocket Camera updated
to v…"; while a photo is being shot, edited, viewed or shared, or a game played, **Update** in Settings offers the
refresh instead and takes it only after the open edit, import, capture or share is finished. It never clears the album. Existing older releases need a normal online page reload to
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
