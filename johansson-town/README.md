# Johansson Town

A small harbour town in Okinawa in 1997 (Heisei 9), on today's date: the town clock is your clock. Walk the streets, shop at
Sakura Shōten, meet Thuan, Nao and the neighbours, and settle into daily life. It runs in
the browser with Three.js and no framework: <https://nj22az.github.io/johansson-town/>.

## Running it

```sh
npm ci                    # vite + meshoptimizer, for building and tests
npx serve ..              # or any static server from the site root; open /johansson-town/
npm test                  # node --test tests/*.test.mjs
npm run build:runtime     # after changing src/, root *.js, root *.css or scripts/
```

The live page loads bundled code from `runtime/`, not the raw `src/` graph.
`npm run build:runtime` rebuilds it, rewrites the hashed `boot-*.js` / `audio-*.js`
references and the `?h=` stylesheet hashes in `index.html`, records a source hash in
`runtime/source.json`, and prunes every chunk except the current and previous build.
Commit `index.html` and `runtime/` with the source change; a test checks they match.

Some older tests fail on `main` (world-layout and resident-schedule suites written for
retired layouts). Compare a change against the failure list before and after it rather
than expecting a clean run.

## Layout

| Path | What |
|---|---|
| `index.html`, `landing.js`, `title-screen.css` | Title screen (Johansson Co. splash, PRESS START) and the town guide page |
| `src/boot.js` → `src/game.js` | Entry point and the game loop, camera, rooms and input wiring |
| `activities.js` | Every dialogue, menu and shop flow (Thuan, the counter, the bag, residents) |
| `src/world/` | The town: streets, harbour, shops, park, onsen, bus; `interiors/` for rooms (Sakura in `sakura-interior.js`, `sakura-layout.js`, `sakura-cheer.js`, `sakura-life.js`) |
| `src/avatars/` | Shimanchu islanders: recipe → body, face, animation; `creator.js` is the maker |
| `src/people/` | Residents, schedules, Thuan's shop work, conversations |
| `src/commerce/` | Stock, the konbini basket and checkout, hot snacks, the shop ledger |
| `src/render/` | Cel shading, ink/grade pipeline, sky, dusk clock, painted ground textures |
| `src/interact/` | Held drinks, carrying shop goods |
| `src/ui/` | Icons and HUD dressing |
| `*.css` (root) | HUD and page styles; `tomodachi-ui.css` is the current HUD skin, loaded last |
| `assets/` | Models, textures, audio (see `assets/ATTRIBUTION.md`) |
| `art/`, `tools/` | Source art and the Blender / packing pipelines that regenerate assets |
| `creator/` | Standalone islander maker, used by share links |
| `docs/` | Design notes; start with `AMPLIFY-AUDIT.md` (current audit, look and building-kit standards, roadmap), then `ART_DIRECTION.md`, `SAKURA_STORE.md`, `EXPANSION-NOTES.md` |

## Playing

- **Touch:** left thumb walks, and steers too: hold the stick off to one side and the
  view turns that way. Push it to the rim for a moment to run. Drag anywhere else to
  look (the same swipe turns the same on any screen). The round button does whatever
  is nearby (stand, take, talk, read); the tiles on the right open the town book,
  camera, view and moves. Tuning lives in `src/input/touch-feel.js`.
- **Keyboard:** WASD / arrows, mouse look, Shift to run, Space to jump, E to interact,
  V to switch view, Q for the town book, N to cycle the time of day.
- **Controller:** left stick moves, right stick looks, A interacts, Start on the title.

At Sakura, pick things off the shelves (one goes in your hand, more in a basket), pay
Thuan at the counter, buy hot snacks, and ask her what she recommends. Progress saves
on the device.

## Characters

Everyone is a Shimanchu (島人, islander): a round-headed, cel-shaded figure built at load
time from a recipe in `src/avatars/`. **Town book → Make your islander** changes how you
look; **Share** gives a `creator/?r=<code>` link, and `?avatar=<code>` imports one into
the game.

Each islander has a personality: four dials (pace, talk, feelings, outlook) in their recipe,
one of sixteen island types (`src/avatars/personality.js`; the town's own people have
authored dials in `TOWN_DIALS`). `src/avatars/body-language.js` turns the type into
body language: the move a feeling brings (a happy Festival friend kicks up a heel, a
Lighthouse keeper nods), what they do standing about, and what their hands do as they start
a line. Dialogue lines carry a feeling read from the words. The playful poses (heart,
hand by the cheek, coy look, ta-da, hands on hips, heel kick) are on the Moves menu, in the
photo studio and in the maker's preview.

## More

- `docs/EXPANSION-NOTES.md`: dormant systems worth building on (Shopify, the local AI
  chat, WebMCP, …), what the September 2026 cleanup retired, and how to recover it.
- `WEBMCP.md`: the browser tools agents can use to drive the town.
- `RESOURCE_SOURCES.md`, `assets/ATTRIBUTION.md`, `LICENSE-*.txt`: sources and licences.
