# Christina: the ferry, deck by deck

A 3D viewer of the Christina, a 34.5 m car and passenger ferry: turn her, lift her decks apart (Explode), slice her open
along her length (Cut) and name every room aboard: <https://nj22az.github.io/ferry/>.

No build step. Serve the site root (`python3 -m http.server`) and open `/ferry/`.

| File | What |
|---|---|
| `index.html` | The page and its own chrome (title, the *Decks and rooms* panel, the bar with Explode, Cut and Reset view), on the pattern of `/motor-90l/` |
| `app.js` | The viewer: reads the data, lights it, explodes, cuts, selects decks and rooms |
| `data/ferry.bin.gz` | The model: a JMF1 container (below), about 135,000 triangles in 41 meshes, six decks, 50 named rooms |
| `data/ferry-atlas.webp` | Every plate, dial and sign aboard on one 2048 px picture |

## What she is, and what this first look is not

The owner, 9 November 2026: "I want a ferry viewer on my website", "a stand alone ferry viewer that can show the whole
ferry in an exploded view"; "I think you should call this ship the Christina , it's not the same as Minato Maru"; "We
can rebuild Minato maru later from what we learn from building this ship"; "When we have the demo laid out we can refine
it over time and then insert it into the games after"; "Make it look as realistic and pretty as possible , disregard
cartoon style from Johansson World for now".

So the Christina is the lead ship of a new design, and the Minato Maru of Johansson World is rebuilt later from what she
teaches. **This page is a first look.** For now her drawing is the Minato Maru's: the game's own code-built three.js
model (its engine room from Blender), exported, renamed and shown in new light. Her room notes therefore still speak of
the Minato Maru's crew and route. Her own build comes next: in Blender, from the working drawings (Rev C), section by
section starting with the hull and exterior, and this same page then shows that model.

The ferry in the live Johansson World is not replaced or changed by any of this.

## Where the data comes from

The model is not made here. It is exported from the Town's source (`nj22az/johansson-town`) by two tools,
`tools/ferry-viewer-export.mjs` and `tools/ferry-viewer-export.page.js`, which build the ferry in headless Chromium with
the game's own modules (her plates, dials and signs are drawn on canvases), pose her with the engine room shown, and
write the two files in `data/`:

```bash
node tools/ferry-viewer-export.mjs --out=<this checkout>/ferry/data [--report=<file.json>]
```

The export does not edit the game: the Christina's name is painted by the export page alone (it replaces the name where
the game draws it on the bow, the transom and the name boards, and stops if any of those places was missed). The header
of the data records the Town commit she was drawn from (`source.commit`, shown at the foot of the panel), so a stale
picture can be told from the game.

Until the weekend the Town's work on her lives on the branch `claude/festive-rubin-fo8mmp` of this repository, in
`temp/minato-maru/` (never on `main`), the two export tools among it (`town/tools/`, Town commit `c3ecb2d`).

## The file format (JMF1)

`ferry.bin.gz` is gzip over: the four bytes `JMF1`, a 32-bit little-endian header length, a JSON header (padded with
spaces to a multiple of four bytes), then one binary block.

- Header: `format`, `ship` (name, `drawnFrom`, length, beam, depth, draft, gross tons), `axes`, `bounds`, `atlas`
  (`file`, `size`), `materials`, `views[]` (each with `groups[]`: one per deck, with its `id`, `name`, `level`, its
  lift in the exploded view (`explode`), its `meshes[]` and its `spaces[]`), `source`.
- A mesh record gives byte offsets into the block: `pos` (Uint16 × 3, quantised over `bounds`), `nor` (Int8 × 3), `col`
  (sRGB Uint8 × 3), `uv` (Uint16 × 2, into the atlas, only on textured meshes) and `idx` (Uint16, or Uint32 when `wide`).
- A space record is a room: `id`, `name`, `text`, `why`, and its box `min`, `max`.
- Axes: metres; the bow is +z, port is +x, y is up with its origin on the laden waterline (keel −1.9, car deck 2.1,
  passenger deck 6.5, bridge deck 9.1, compass deck 11.5).

The decks, bottom to top: `hull`, `machinery`, `car`, `passenger`, `bridge`, `top`.

## The look this page applies

The game's cartoon look does not bind this page. `app.js` keeps the geometry and colours it reads and changes only how
they are lit:

- ACES tone mapping, a sky shader as the environment (so paint and glass have something to reflect), one sun with soft
  shadows and a shadow-only floor over the page's backdrop.
- Opaque textured unlit materials stay unlit: they are screens, dials and signs, and must read as drawn.
- The game's other unlit materials (lamps and painted markings) are made lit, so they sit in the same light as the ship.
- Transparent materials become glass (a little tinted, reflective).

## Coupling

- Three.js r170 comes from `/motor-90l/vendor/` (`three.module.min.js` through the import map, and `OrbitControls.js`).
  Moving or upgrading that folder changes this page too.
- The page uses its own chrome, not the site's `shared.js` navigation, as `/motor-90l/` does.
- `window.__ferry` (`setExplode`, `setCut`, `home`, `select`, `showDeck`, `setPanel`, `identify`, `state`, and `look`:
  the renderer, scene, camera, controls, sun and `redraw()`) is there for checks and screenshots.
- **The homepage card.** The owner, 9 November 2026: "Make it one of my projects , on the website". She is the `ferry`
  entry of `CONFIG.projectExplorer` in `/config.js` (second card, under Explore), drawn by
  `/assets/js/project-explorer.js`; `CONFIG.projects` has her too. The homepage never loads the 3D model (its design
  review forbids it): the card shows a picture, `/assets/images/ferry/christina-card.webp`. It lives under `assets/`,
  not here, because the homepage review's sparse checkout does not include `ferry/`.
- **Retake the card picture when the model changes.** It is this page's cut view from the starboard side with the
  chrome hidden: Cut 0.5, the camera set through `window.__ferry.look` (target (0, 6.3, 1.4), looking along
  (−1, 0.2, 0.3) from 50 m, aspect 1200 : 630), shot at 1200 × 630 at scale 2 and reduced to a 1200 × 630 WebP
  (quality 84). The counts in `tools/office-home/review.browser.mjs` (7 cards; Explore 2, Create 3, Learn 2) follow
  `CONFIG.projectExplorer`.

## Known limits of the first look

- Seen from above, the machinery rooms are covered by their deckhead: use **Cut** to open the engine room. (The lid
  belongs with the car deck; the export will move it.)
- The cut faces are hollow: plating is not capped where it is sliced.
- In the exploded view the stack is framed small, and two small dark fittings float beside the car deck.
- A pale translucent panel shows amidships at the car-deck opening.
- When a room is framed, the title's paragraph can lie over the model on a desktop screen.
- The room notes speak of the Minato Maru's crew and route.
- No ambient occlusion and no sea yet: she stands in a studio.
- The Rev C working drawings list 18 open issues in the design she is drawn from (10 clashes, 8 to check); they are in
  this model too.

## Checks actually run (9 November 2026)

- `node --input-type=module --check < ferry/app.js`.
- Headless Chromium (software rendering, SwiftShader) at 1440 × 900 and at 390 × 844 with touch: closed ship, exploded,
  cut, decks hidden, rooms selected (wheelhouse, engine room, saloon), the machinery deck alone, the panel open on the
  phone size, light and dark colour schemes. No console errors or failed requests in any of them.
- The cut view again after one fix: a picture (her name, a sign, a dial) keeps its one face when she is cut open, so her
  name no longer shows mirrored on the inside of the hull.
- The homepage card: `node --check config.js`, `node --check assets/js/project-explorer.js`, and the homepage design
  review (`tools/office-home/review.browser.mjs`) run locally in headless Chromium at its six sizes: passed, with 7
  cards and a desktop project grid of 2536 px against its 3062 px limit (80 % of the baseline's height). The card itself was looked at on desktop, at
  390 px and 320 px wide, light and dark.

Not checked: a real phone, a real GPU (frame rate is unknown), an actual finger tap on a room (`identify` was only called
from script), Safari and Firefox.
