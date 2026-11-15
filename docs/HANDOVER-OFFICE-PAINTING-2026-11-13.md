# Handover: the Office homepage · 13–15 November 2026

**Current state (15 November, evening): the homepage on the branch `claude/zealous-bell-teears` is the voyage aboard the
Chisum, not the painted street.** The owner found the painted version still messy and asked for something like Kage
(MengTo/kage), with the Chisum as the backdrop, the bridge as a room of the site ("I think the Bridge looks best at the
moment") and a part of the page under water (like Noniv/abyssal-garden). Kage has no licence: its idea was studied, none of
its code or art was taken. Abyssal Garden is MIT; only its mood was used (the underwater light here is new code).

## The voyage

- Six chapters over fixed pictures of the Chisum rendered from her own model in her own viewer
  (`tools/office-voyage/render-plates.mjs`, the shot list in `PLATES`; `tools/office-voyage/build.py` writes
  `assets/office-voyage/<name>-<1920|960>.webp`, 0.6 MB for all): 00 at sea (her bow), 01 Explore (her side), 02 Create
  (from astern), 03 Learn (over her house), 04 Below the waterline (under her bow, then her screws: the water rises over
  the view and light shafts, motes and the moving surface are drawn live, `assets/js/office-voyage.js`), 05 the bridge
  (her wheelhouse; the wheel, the radar, the alarm panel, the wing and the chart are links into the site).
- Editorial type (Inter Tight, from Google Fonts), a chapter rail on wide screens, her name and each chapter's in vertical
  Japanese. On portrait screens the frame pans to each chapter's subject; on phones the bridge's fittings are a list and
  the rail is left out. With reduced motion nothing moves but the pictures change.
- The picture under her bow is mirrored so the bulb stands clear of the words (nothing to read on her below the waterline).
- After the bridge the Office's own sections follow unchanged (projects, journal, about, locations).
- **Removed from the homepage on this branch:** the painted street and its scenes (their files deleted on the branch; the
  first preview of them stays on `main` under `/temp/office/painted/`) and the Minato harbour arrival with its 3D diorama.
  **Before this replaces the live homepage, `.github/workflows/harbour-diorama.yml` and `tools/office-port/diorama.browser.mjs`
  must be retired or the harbour put back: they test the harbour on the homepage and would fail.**
- `tools/office-home/review.browser.mjs` checks the six chapters, the bridge's five ways (44 px), and (motion allowed) that
  the water rises and its light is drawn. Passes locally on every profile.

## The ship's screens (15 November, later)

The owner: "the feed that comes under should be worked into the ship, like if I click a computer on the bridge … I will
come to the place I want". So nothing follows the voyage any more: the Office's sections are screens aboard
(`assets/js/office-voyage.js`, *The ship's screens*). The radar shows the projects (`#projects`), the chart the journal
(`#blog`, `#journal`), the ship's clock where Nils works (`#locations`), the chair About (`#about`). The wheel (Johansson
World), the alarm panel (Maintenance Desk) and the wing (walk aboard, `/ferry/`) lead off the page. Every link to those
anchors (the header's Projects, the chapters' links, `/#projects` from elsewhere) opens its screen; the bridge leans in
toward the fitting behind it; Escape, Close and the browser's Back put it away. Without JavaScript the sections stay on
the page as before. Fixed on the way: the bridge chapter's box lay over the fittings, so on a desktop they could not be
clicked; empty chapter space now lets the pointer through. The review opens the projects from `/#projects`, closes them,
finds the bridge's seven ways (44 px) and opens the radar from the bridge; with motion, opens the chart, goes Back, opens
the chair and Closes it. Passes locally on every profile.

The earlier, painted version is recorded below.

---

## The painted street (superseded)

**State: on branch `claude/zealous-bell-teears`. A preview is live at <https://nj22az.github.io/temp/office/> (main `66a8de0`, on the owner's yes of 15 November to "add /temp/office/": new files only, not indexed, the live homepage unchanged). The owner is deciding whether it replaces the homepage.**

To replace the homepage, on the owner's word only: bring `index.html`, `tools/office-home/review.browser.mjs` and `.github/workflows/office-home.yml` from the branch to `main` (the other files are already there), then remove `temp/office/`. To drop it: remove `temp/office/`, `css/office-painting.css`, `assets/js/office-painting*.js` and `assets/office-painting/` from `main`.

The owner asked (13 November) for the Office of Nils Johansson to "look like an interactive painting really with clear
sections", populated with good assets from Johansson World, more modular, **without changing any Sjöskolan link**, and
changing only the Office's layout; then that Pocket Camera's shaders could be used. Asked whether the first version would
sweep anyone off their feet, Claude said no and proposed a full version; the owner said "go for the full version" (15
November). This is that version.

## What the homepage is now

- **The opening fills the screen with the harbour road outside Sakura Shōten**, as the game plays it at 08:59:54: a film
  of the real town (`tools/office-painting/capture-street.mjs`, the Town's own audit camera and simulation, stepped frame
  by frame), in which **Sakura's shutter rolls up at nine** and seagulls cross; after that the open street loops. No
  resident happens to walk through this view at that hour (the 06:30 sweep found residents in the area but none in
  frame); the dog by the fruit trestle and the gulls are what move.
- **It is painted live by Pocket Camera's own engine** (`assets/js/office-painting-live.js` imports `/camera/looks-gl.js`,
  which imports `/johansson-town/src/render/looks.js` and `/johansson-town/src/avatars/face.js` from the published Town).
  Woodblock is the default. The palette ("Paint it as") offers Woodblock, Watercolour, Sketchbook, Manga, Blueprint and
  "As it is" (the game's colours).
- **Before the film runs, and always with reduced motion, no WebGL2 or data saving**, the page shows the film's first
  frame painted in the chosen Look (`street-<look>-<1600|800>.webp`), so nothing changes but the motion.
- **Changing Look is a brush**: the old painting is scrubbed off in broad strokes (`scrub()`/`brush()` in
  `assets/js/office-painting.js`), soft and streaked at the edges. Reduced motion swaps at once.
- **With a mouse, the pointer wipes the paint** and shows the town in the game's own colours beneath; the paint flows
  back in about two seconds. Not on touch.
- **The page's sections are signs in the street**: Explore is an enamel plate on the quay warehouse door (to `#harbour`),
  Learn a notice in the upstairs office window, Create the chalk A-board on the pavement (both open `#projects` on their
  filter), Read is painted on the road (to `#blog`). A sign near a cropped edge is moved along just enough to be whole.
  Under 860 px the signs are a 2×2 grid under the picture.
- **The heading is the print's title slip** (a cartouche, top left, on the sky), not plain text on the sky as first
  proposed: the sky is navy in Woodblock and pale in Watercolour, and no single ink reads on both. Its words and links are
  unchanged. Under 860 px it sits under the picture.
- **Each section opens on its own painted scene**, brushed in as it scrolls into view and repainted with the hero's Look:
  the town and pier from above (projects), the harbour from the water (blog), the garden photograph (About). The two town
  scenes are fresh game renders kept in `tools/office-painting/sources/`. The town at night was tried and dropped:
  Woodblock and Manga break on it even with the exposure lifted.
- The chosen Look is remembered in this browser only (`localStorage` `office-painting-look`).
- Also fixed in passing: the section introductions were indented by an old centred rule.

## Files

- `index.html` (hero, scenes), `css/office-painting.css`, `assets/js/office-painting.js`, `assets/js/office-painting-live.js`.
- `assets/office-painting/`: `street.json` (loop point), `street-1280|800.mp4|webm` (1.7 MB / 0.7 MB H.264; VP9 for
  browsers without H.264), and every scene in every Look at 1600 and 800 wide (Manga is the heaviest, about 0.5 MB).
- `tools/office-painting/capture-street.mjs`: the film and scene renders (`--time`, `--seconds`, `--fps`, `--pos`, `--at`,
  `--sweep` to find who walks through the view). It stops the game's own render loop and reads each frame off the canvas;
  at 1600×1000 about 5 s a frame in a 4-core cloud container, so the 24 s film took 25 minutes.
- `tools/office-painting/build.py film <frames>` and `build.py scenes`: paint through `tools/render-camera-looks.mjs`,
  encode the film with its last 1.5 s mixed into the frames before the loop point (9.5 s), so the jump back is not seen.
- Both need `nj22az/johansson-town` cloned as `johansson-town/` (for the capture, the whole repository).

## Checked

- `tools/office-home/review.browser.mjs`: passes locally on every profile; it now also changes Look, follows a sign, measures
  the painting's 44 px targets, and (new `desktop-live` profile, motion allowed) waits for the live film, changes brush and
  checks that no 3D engine loads. `.github/workflows/office-home.yml` checks out the Town's `src/avatars` for it.
- `tools/office-port/diorama.browser.mjs` passes locally.
- Looked at in Chromium at 1440×900, 1280×800, 1180×820, 1024×768, 768×1024, 390×844, light and dark. Not seen in Safari
  or on a real phone; the live film has only run in software WebGL here, where it is far slower than on a real GPU.

## Open, for the owner

1. Whether the hero film should wait for a resident to walk past (a longer sweep for another hour, or another view).
2. The homepage journal still shows the three newest posts, at present three hotel-parking notes in a row.
3. Locations is still two Google Maps iframes, the one part not in the painting's style.
4. No Meshy model is in this repository; nothing here uses one.
