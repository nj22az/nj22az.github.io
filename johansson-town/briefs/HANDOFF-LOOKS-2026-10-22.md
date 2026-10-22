# Handoff — Look setting (shader styles), 22 October 2026

## Owner's request
"https://github.com/daniel-ilett/smo-shaders is it possible to implement this shaders in a settings menu? To change what
the game looks like", then: "Yea but I want one more, manga or pencil crayon graphics". Both manga and pencil crayon were built.

## What changed (branch `claude/upbeat-hamilton-4bhz8q`, not yet merged; no PR opened)
- `johansson-town/src/render/looks.js` (new): the catalogue (Natural, Black & white, Sepia, Pocket Gentleman, 16-bit,
  Line drawing, Old TV, Manga, Pencil crayon) and one GLSL fragment shader each, written new for three.js. Its set of
  looks comes from Daniel Ilett's smo-shaders (MIT, Unity HLSL); no code from it is copied. Credited in `RESOURCE_SOURCES.md`.
- `johansson-town/src/render/ink-pipeline.js`: an optional final look pass after FXAA, using a lazily allocated `rtLook`
  target. Natural adds no pass; each look's shader compiles the first time it is chosen. `pipeline.setLook(name)`.
- `johansson-town/src/game.js`: the Town book gets a **Settings › Look** row (`#lookButton`) that opens a menu.
  The choice is saved in `localStorage` key `johansson-town-look`. Without the ink pipeline (reduced graphics) only
  Black & white and Sepia are offered, as a CSS filter on the canvas. Audits use `__JOHANSSON_LOOK__.style` / `.setStyle(name)`.
- `index.html`: the setting row. `src/ui/icon-controls.js`: its icon. `runtime/` rebuilt.
- `tests/looks.test.mjs` (new, added to `tests/ci-guard.txt`).

## Checks actually run
- `node --test tests/looks.test.mjs tests/cel-look.test.mjs tests/runtime-package.test.mjs`: 27 pass.
- `node tools/ci-guard.mjs`: 337 pass, 1 fail. The failure is `no-z-fighting.test.mjs` aborting with a V8 out-of-memory
  error. It fails the same way on unmodified main in this container and passes (13/13) with `--max-old-space-size=8192`.
- Software Chromium (swiftshader) boot via a copy of `tools/cloud-boot-smoke.mjs`: all nine looks rendered at the town hall
  gate, plus Manga and Pencil crayon in the Community Hall, with no shader or page errors. The first pass showed horizontal
  stripes on flat ground (depth-precision noise in the outline detector) in Line drawing, Manga and Crayon; the threshold
  was raised and the stripes are gone. The built runtime menu was clicked through (Town book › Settings › Look › Manga):
  it applies and is stored.
- Not done: no GPU browser, phone or Steam Deck check; performance not measured on real devices. The menu was not
  photographed at the 390 px mobile width.

## Known limits / next actions
- Patterns (screentone, hatching, paper, dither) are fixed to the screen, so they stay still while the world moves
  under them (the "shower door" look). They never flicker on a still camera.
- Manga in very bright interiors is mostly white line art with little tone; consider starting the tone at a higher
  luminance if the owner wants more grey.
- Photo studio captures already include the live look (they read the canvas); its own films still apply on top.
- Possible follow-ups: let the storyteller's comics choose a look; an oil-painting look for the photo studio only.
