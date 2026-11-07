# Make comic in Johansson Studio: audit and design

The creator, 2026-10-10: "audit the comic maker in Johansson studio I want to be able to make as pretty comics as you
have made and we can use them as a basis to make movies later", and "I don't want a big grey blur of anything, the comic
can be absurd but should be simplistic". The creator uses Johansson Studio (`/avatar-creator/`) on an iPad, in Safari.

"As pretty as" means "Fujita's Back" (11 pages, made offline by the studio's comic engine, `jojo/art/pencil`, from film
stills). This document compares the web Studio's Build scene and Make comic with that engine, and designs how its look,
lettering, layouts, modules and quality gates come into the browser as JavaScript, and how a Studio comic becomes a film
storyboard. It is a design: no Studio code was changed. The engine's own audit, data model and batch 1 (a comic built
from data alone, with the gates) are in `jojo/content/COMIC-MAKER.md`; this document follows the same names so the two
can read each other's data.

## 1. The Studio today

**Build scene** (`scene.js`, `scene-world.js`, `scene-avatar.js`, `scene-physics.mjs`, `scene-model.mjs`). Five steps:
location, characters, pose and position, text, export. It is already the right foundation:
- The twelve locations are World's own geometry (`createTown`, the interior builders, the cel pass), not photographs;
  avatars, furniture and walls share one Three.js scene, camera and depth buffer.
- Characters are World's avatars posed by World's animator (20 poses, 13 expressions), placed in metres on the ground,
  stopped by walls and furniture (`walkTo`, `hitsSolid`), seated on the furniture's own seats.
- The camera (turn, height, distance) is shortened where scenery would block it.
- Bubbles anchor to each character's projected head and are dropped when the character is hidden (a raycast).

**Make comic.** Up to four panels, each a PNG captured from the scene canvas with its bubbles burnt in; reorder,
remove, save; a 2-column grid or a strip of 4:3 cells (`comicLayout`, 1200 px wide, 18 px gaps); a white page, a 2 px
border; a project file with the scene and the panel PNGs.

**World's own comic renderer** (`johansson-town/src/feed/comic.js`, `manga-fx.js`), which the Studio does not use yet,
already does several things our engine does, in the browser: residents drawn into captured rooms with the room's depth
written first (counters hide legs); shot framing by size (`wide`, `medium`, `close`, `low`, `high`, `dutch`,
`close-thing`, `eyes`) through `camera.setViewOffset`; blocking on the place's stand and seat spots, facing the camera
at least half-way; `inSight` (is everyone in the picture, head and body not hidden by the room: a visibility gate);
an `eyes` strip; face marks (sweat, vein, gloom, sparkle, heart …), speed-line backgrounds and sound effects.

### Gaps against "Fujita's Back"

| Quality | The comic engine (Fujita's Back) | The Studio today | Gap |
|---|---|---|---|
| Finish | pencil and ink (`clear.py`): flattened colour, one ink weight, hatched coloured pencil with paper between, figure contour and shadow crescent, graphite tooth | toon-shaded 3D render (cel pass) | the whole look |
| Panel data | every panel is data (module, subject, frame, words); pages rebuild from it | a panel is a PNG; its scene, cast, camera and words are gone once captured | panels cannot be edited, re-rendered or filmed |
| Lettering | Comic Neue capitals in hand-drawn ovals; curved tapering tails that stop at the mouth; shouts, captions, chained halves; placed by search (never over a face, below the mouth, into another panel; reading order) and audited | system font in rounded rectangles, a straight tail pointing down from the head top, clamped inside the picture; no avoidance, no order, no audit | the lettering engine |
| Pages | 1080 × 1350 pages, 40 px margins, 16 px gutters, any panel shape (slants), the page's rhythm planned per page | four 4:3 cells | page templates |
| Sounds | Bangers, black outline, white halo, colour by meaning, placed beside their source | none in the Studio (World's feed has its own) | sound effects |
| Dark panels | black, eyes and voices; night gamma; torch pools; a flash | none | dark module, night looks |
| Inserts | a prop big and alone (the breaker in 4c, 5k, 7a) | none | insert module, prop library |
| Explainer | Why it works: a drawing (data) and a presenter | none | explainer module |
| Simplicity | gates on every panel (faces, cut heads, slivers, foreground masses, size, muddles, lettering) | none (only hidden bubbles dropped) | gates |
| Film | the storyboard and shot plan drive the film's episode | none | export |
| Storage | files | `localStorage` (5 MB in Safari) and PNGs in memory | IndexedDB |

## 2. Principles

1. **A comic is data; pictures are renders.** Pages → panels → module, scene (location, cast, camera), words. Any
   panel can be re-rendered, re-lettered, printed larger or filmed. The format is the storyboard's
   (`jojo/content/<story>/storyboard.json`), so the offline engine can print a Studio comic and the Studio can open a
   studio storyboard.
2. **The camera is the frame.** A panel is rendered in 3D at its own shape and size; nothing is cropped from a bigger
   picture, so nothing is enlarged and the framing presets place the camera itself.
3. **The look is a GPU pass.** `clear.py`'s steps are per-pixel maths: they port to fragment shaders. In 3D we also
   have depth, normals and object ids, so the ink comes from the geometry (clean lines, no texture noise).
4. **Lettering and gates are pure modules,** the same rules as `comic.py` and `gates.py`, tested in Node.
5. **Simple by construction.** Each module has the simplicity rule built in; the gates run live while you edit and
   offer one-tap fixes. A failing gate blocks export unless it is waived with a written reason.
6. **iPad first.** Touch editing, Safari's memory and canvas limits, IndexedDB, fonts loaded before drawing.

## 3. The data model

The Studio's comic file (`format: "johansson-studio-comic"`, version 1) holds the storyboard model; the Studio keeps
its own scene fields (`location`, actors with `x`, `z`, `turn`, `seat`, `size`) inside each panel's `scene`:

```json
{"format": "johansson-studio-comic", "version": 1, "title": "FUJITA'S BACK", "header": "JOHANSSON · BONUS",
 "kicker": "JOHANSSON · ELECTRICITY, SIMPLY", "lang": "en",
 "props": {"contractBreaker": {"name": "the contract breaker", "asset": null, "object": "Contract breaker",
           "purpose": "the power company's 40 A breaker: it guards the whole house"}},
 "pages": [{"n": 4, "template": "strip-two-strip",
   "panels": [{"id": "4c", "module": "insert", "slot": 2,
     "purpose": "Everything at once: the contract breaker warms.",
     "subject": ["prop:contractBreaker"],
     "scene": {"location": "onsen", "light": "evening",
               "camera": {"preset": "insert", "on": ["prop:contractBreaker"], "orbit": 0, "elevation": 0, "zoom": 1},
               "actors": []},
     "look": {}, "keep": [],
     "words": [{"kind": "caption", "en": "Everything at once."},
               {"kind": "sfx", "en": "tik… tik…", "at": [0.84, 0.86], "angle": -6, "size": 30, "colour": "red"}]}]}]}
```

- **Panel:** `id`, `module` (`set`, `cast`, `insert`, `dark`, `explainer`, `sfx`, `close`), `slot` (a cell of the
  page template) or `poly` (any shape), `purpose`, `subject`, `scene`, `look` (`night`, `pool`, `flash`, `torch`),
  `words`, and per module `eyes`, `ghosts`, `diagram`, `presenter`, `label`; `waive` ({gate: reason}).
- **Scene:** `location` (one of the twelve, later any World place), `time` and `light` (`day`, `evening`, `night`,
  `blackout`, `torch`), `camera` (a preset and its subject, the author's turn/height/distance on top, or an exact
  `position`/`target`/`fov`), `actors` (`name`, `recipe`, `x`, `z` in metres from the location's origin, `turn`, `pose`,
  `expression`, `seat`, `size`, held `props`), `hide` (objects left out of this shot).
- **Words:** `kind` (`balloon`, `shout`, `caption`, `sfx`, `title`), `en` (and other languages from the story's
  `text.json`), `who`, `to`, and when the author places them by hand `place` (balloon centre) or `at` (sound,
  fractions of the panel), `size`, `colour`, `angle`, `off` (a voice from outside the panel), `nervous` (zigzag tail).
- **Migration:** today's projects open as one page whose panels are `module: "image"` (the captured PNGs, shown as
  they are), and the scene in the project becomes the scene of a new first panel.

## 4. The modules in the browser

| Module | How the Studio makes it | Simplicity built in |
|---|---|---|
| `set` | the panel's scene in 3D, at the panel's shape, camera from its preset | one named subject; non-subjects that would sit in the way are flagged before you render |
| `cast` | only the characters (the location hidden by a layer), on paper, a flat colour or speed lines | no set, so no set can become a mass |
| `insert` | a prop alone (everything else on a hidden layer) on paper, its hero render from Studio's asset library when there is one, else World's object; optional label and hand (a posed mitten) | the prop fills three quarters of the height; nothing else is drawn |
| `dark` | black; eyes (open, wince, spin, wide, wet), faint ghosts (baskets), voices from the eyes | only eyes, sounds and words |
| `explainer` | a drawing from data (the engine's `diagram.py` kit: lines, shapes, arrows, icons, breakers, heat lines, a stacked bar) and a presenter: a posed resident rendered on transparent, his mouth from the head bone | the drawing and the presenter kept clear of lettering |
| `sfx` | a sound filling the panel on black, paper or speed lines | one word, three quarters of the width |
| `close` | "Now you know.", Johansson's ta-da pose, the series line | the same close for every story |

The `eyes` strip and face marks of World's `manga-fx.js` become options of `set` and `cast` (marks over a head), so the
feed and the Studio share them.

## 5. The look: the pencil and ink finish as WebGL passes

Render the panel at print density (2 × page units; a 1000 × 384 panel is 2000 × 768 pixels) into render targets, then
compose. Each step names the `clear.py` line it ports, so the two finishes can be compared on the same frame.

1. **Buffers:** colour (the cel-shaded scene), depth, view-space normals, and an id buffer (each character its own id,
   the subject prop its own, the set 0): one extra render with flat id materials (layers keep it cheap). Pack depth into
   RGBA8 (Safari renders to half-float targets only with an extension; packing avoids it).
2. **Flat colour (`flatten`):** the cel pass already flattens light; a small Kuwahara or two-pass bilateral filter
   (radius 4–6 px) removes texture noise. Then saturation × 1.32, value × 0.98 + 8 (`finish`'s sat and lift).
3. **Ink (`ink`):** lines from depth discontinuities (silhouettes), normal creases (over 35–40°) and id boundaries,
   thinned to one weight (`line` ≈ 3.6–5 px at print size), dilated by a disc, anti-aliased once with a steep curve
   (`clip((a − .15)/.6)`). This is cleaner than `clear.py`'s colour edges: textures never become lines.
4. **Coloured pencil:** two hatch directions (−38° and 52°, spacing `max(4, 1.5 × line)`), pressed harder in dark
   colours (`press = clip(1.15 − lum, .35, 1)`), coverage `clip(.46 + .5·strokes·(.5 + .5·press) + .3·press² + grain,
   .42, 1)`, mixed with paper (250, 246, 236). Grain: a tileable noise texture filtered along 45°.
5. **The figure pops (matte):** the id buffer's characters (and the subject prop) are the matte: a bold outer contour
   (`contour` 2.2 × the line), a hatched shadow crescent on the side away from the light (the matte offset towards the
   upper left, subtracted, blurred), the background 6 % quieter.
6. **Graphite tooth:** the line × (.78 + .22 · grain).
7. **Looks:** night is real light first (the house lights off, the street's glow, a torch as a spot light with its
   pool) and then the engine's grade (gamma 1.3–2.3, × (.92, .95, 1.08)); the flash is the engine's bloom; the stretch
   is an auto-contrast. Light states come from World's own scenarios where a place has them (the onsen's evening,
   blackout, restored).

Performance target on an iPad: a panel's finish in under 300 ms at print density; the preview at screen density while
editing, the finish recomputed when the panel settles. Keep every canvas under 16 megapixels (Safari's canvas limit).

## 6. Lettering

A pure module (`comic-letter.mjs`), ported from `comic.py`, drawn on a 2D canvas over the finished panel:

- **Shapes:** balloons are a soft superellipse (exponent .82) with a slight hand wobble that hugs its words, one ink
  line round body and tail together (white inside); the tail is a curved, tapering quadratic from inside the balloon to
  a point short of the mouth, never across a face; nervous lines get a zigzag tail; shouts are rounded bursts (15
  points, soft inward curves); captions are cream boxes flush in a corner; chained halves of one thought share a short
  neck and no second tail.
- **Fonts:** Comic Neue Bold capitals (balloons, captions), Bangers (sounds, titles), Mali for Vietnamese, Patrick Hand
  for maths (all SIL Open Font Licence; in `jojo/art/pencil/fonts`), served as woff2 and loaded with the FontFace API
  before anything is lettered.
- **Mouths from the head bone:** the mouth point is the head's centre, 0.7 R forward along the face and 0.6 R down (as
  `remotion/src/FilmCast.tsx` reports it to the engine), projected through the panel's camera; the face circle comes
  from the head radius. A speaker outside the frame gets a tail out through the border, or no tail (`off`).
- **Placement and audit:** the same search and rules as `comic.py`: R1 inside its panel (may break the top border into
  the gutter), R2 above or beside the speaker, never below the mouth, R3 high, R4 never over a face or a keep-clear
  prop, R5 a short tail, R6 reading order (later never higher, nor left on the same row; captions first), R7 compact
  (re-wrapped to about 1.6 : 1, lines ending where the voice pauses), R8 never touching other words; it retries smaller
  once, and a hard failure says "reframe the panel: room above the speaker's head". About 30 000 candidates per balloon
  on a 1000-px panel: well under 50 ms in JavaScript.
- **Touch:** a balloon can be dragged; it keeps its tail on the speaker and the audit scores the new spot live; a tap
  on a character starts a balloon for them.

## 7. Pages and reading order

- **Page:** 1080 × 1350 (4:5, a phone screen and a comic page), margins 40, gutters 16, the header and the page dots (or
  page numbers in book mode), the story's title band on page 1, the cover, the close.
- **Templates:** a library of page layouts the author picks per page, each a list of cells: three strips; a wide strip,
  two, a wide strip; four inserts in a row under a strip (the torch beats); a tall panel beside a stack; a splash; and
  slanted gutters (8–15°, leaning with the motion) as a template option. A cell can be split or joined by touch.
  Each panel is rendered at its cell's shape, so the aspect never fights the camera.
- **Reading order:** left to right, top to bottom; panels are numbered on the page while editing; balloons follow R6.
  The comic-layout rules travel with the templates (alternate shot sizes, one peak per page, a hook at the end of a page).
- **Export:** each page as PNG, the whole comic as a PDF (a small writer embedding the pages as JPEG; no library needed),
  and the comic file (data plus renders). Projects live in IndexedDB; the downloaded file is the portable copy.

## 8. Camera presets and framing

The presets are placements of the camera, chosen from the subject's mark and facing (World's feed already frames by
shot size with `setViewOffset`; the Studio adds the camera position):

| Preset | Camera | Frame |
|---|---|---|
| `wide` | the place's wide view, or 4–6 m back at eye level | everyone whole, the place around them |
| `full` | eye level (the subject's eye height), three-quarters to the face | the subject's whole figure, a little air |
| `medium` | eye level, closer | head to waist, about 4.6 head radii tall, head in the upper third, lead room on the side the face looks |
| `close` | eye level, close | face and shoulders, about 3.2 radii, eyes on the upper third |
| `insert` | square to the prop at its height, long lens | the prop's bounds plus a fifth |
| `low hero` | 0.6–0.8 m, looking up | full or medium |
| `eyes` | on the faces | a thin strip between black bars |

The camera is tested against the scenery (the Studio's raycast shortening), and the subject's head, face and body
against it too (World's `inSight`). The author's turn, height and distance sliders act on top of the preset, and an
"Auto frame" button puts the preset back.

## 9. The simplicity gates in the browser

The same gates as `jojo/art/pencil/gates.py`, measured from the 3D scene, so they are exact:

| Gate | Measured from |
|---|---|
| `face` | every speaker's face disc (from the head bone and the mouth direction) inside the frame and not hidden (raycasts to the face, World's `inSight`) |
| `head-cut` | any visible head the border cuts (a close-up may cut the top of the head, never the face) |
| `cut`, `sliver`, `extra` | each character's share of their own id-buffer pixels inside the frame, the edges they touch, whether they are the subject |
| `foreground` | a non-subject character nearer than the subject covering over 12 % of the panel; the set nearer than 0.6 × the subject's distance covering over 12 % (20 % in a wide shot), floors and water excepted |
| `size` | the subject's head under 14 px on the page (a note under 22 px); a prop under a third of the panel's height (half for an insert) |
| `muddle` | two visible heads overlapping on the page |
| `back` | a speaker facing more than 120° away from the lens |
| `dark` | the subject's face lost in a night look |
| `lettering` | the lettering audit's hard rules |

The id buffer is read back at a quarter size (one `readPixels`), so the gates cost a few milliseconds. The panel shows a
small badge while a gate fails; the list says what and offers a fix: "Auto frame", "Leave Thao out of this shot",
"Move the camera past the counter", "Closer". Export is refused while a gate fails, unless the panel waives it with a
reason the author writes.

The offline engine's calibration (replaying draft 3's crops on the same stills) caught 2b, 5a, 6g, 6h and 7d, the
grey masses and edge-cut figures the simplicity audit found by eye; haze and small far blobs (9a's steam, 5d's fans)
need a measure on the finished panel, still open in both.

## 10. From a Studio comic to a film

A Studio panel already holds what a film shot needs. The export writes the studio's storyboard and shot plan:

| Studio | Film (`remotion/episodes/<id>.json` via `jojo/content/<story>/`) |
|---|---|
| page | a beat (`purpose`, the page's arc and score from the story card) |
| panel | a shot (`at` from the words' timing; a silent panel holds `film.hold` seconds) |
| `scene.location`, `light` | the view's room and plate state (capture list for `capture-room.mjs`) |
| `scene.camera` (preset resolved) | the view's `pos`, `at`, `fov`, `size` |
| actor `x`, `z` + the location's origin, `turn`, `seat` | a mark: `x`, `z` in the room's frame, `to` (a point ahead along the facing), `sit` (seat height) |
| actor `pose`, `expression` | `gesture`/`pose` (the same World names), `face` (a mapping table where the film has story faces the Studio lacks: pain, dismay …) |
| words in reading order | `say` lines (`who`, `text`; a shout is `excited`); captions stay comic-only; sounds become `sfxText` |
| `dark` panels | a black shot with their voices |
| `subject`, `purpose` | kept with the shot (the reviewer and the film's shot-checker read them) |

Then the generic generator (`jojo/remotion/tools/episode_from_board.py`, the next engine batch, which replaces
per-story `episode.make.py`) writes the episode; the film's draft voices give the timing; the comic's stills and the
film never disagree because both come from one storyboard. The round trip also works the other way: a studio
storyboard opens in the Studio for editing, and the offline engine can print a Studio comic.

## 11. The Make comic workspace on an iPad

- **Comic:** the pages as a strip of thumbnails, one page large; tap a panel to select it; "Add page" (pick a
  template), "Add panel" (pick a module), reorder by dragging; the checks summary (all panels green).
- **Panel:** the panel large, with tabs: Module; Scene (opens Build scene on this panel's own scene: its five steps
  stay, acting on the selected panel); Camera (presets, Auto frame, the three sliders); Words (add balloon, shout,
  caption or sound; pick the speaker; drag to place); Look (day, evening, night, torch, flash); Checks (the gates and
  their fixes).
- **Export:** pages, PDF, the comic file, and "Send to film" (the storyboard and shot plan for the studio).

Build scene is being changed by another agent now: the comic needs only a small interface from it (edit a given scene
and return it; render a scene at a given size and camera; report each character's head, mouth and id), so the two can
move separately.

## 12. Order of work (small batches, each checked on the iPad)

1. **Data:** the comic model, migration of today's projects, page templates, every panel rendered from its data
   (no finish), IndexedDB storage; Node tests for the model and templates.
2. **Lettering:** the port of `comic.py`'s shapes, placement and audit; fonts; Node tests that compare its placements
   with `comic.py`'s on the same inputs (faces, mouths, keep boxes).
3. **The finish:** the WebGL passes; a side-by-side of one frame through `clear.py` and through the shader.
4. **Gates:** id-buffer read-back, the gates and their fixes, export refused on a failure.
5. **Modules:** dark, insert (World's objects, then Studio's hero renders), explainer (the diagram kit and a presenter),
   sfx, close; World's eyes strip and face marks.
6. **Export:** PDF, the comic file, iPad memory and speed checked on a device.
7. **Film:** "Send to film" and the engine's `episode_from_board.py`.

Acceptance: pages 4 and 6 of "Fujita's Back" rebuilt in the Studio from the storyboard (`jojo/content/onsen-breaker/
storyboard.json`), side by side with draft 4 at the same size: the same rhythm, lettering that passes the audit, no
gate failing; a new four-page comic made on the iPad by the creator, start to finish, without help.

## 13. Questions for the creator

1. Page shape: the 4:5 page of "Fujita's Back" for every comic, or also a strip (four panels) for quick memes?
2. Should the Studio's comics be in pencil only, or keep a choice of the clean 3D look for photographs and memes?
3. Which resident presents Why it works by default when a story has no film yet (the engine's rule: the one who would
   really know it)?
