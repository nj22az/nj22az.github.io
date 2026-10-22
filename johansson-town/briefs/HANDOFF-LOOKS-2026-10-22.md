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

## Free camera (same branch, second commit)
Owner: "Could you add a free camera option too? So I could rotate and view the scene from any angle; it freezes the game".

- `johansson-town/src/input/free-camera.js` (new): a pure flight step (`stepFreeCamera`) and the controller. Keys: W A S D or
  arrows to fly, E/Space up, Q/C down, Shift faster, Alt slower, mouse drag to look, wheel forward and back. Touch: one finger
  looks, pinch moves, two-finger drag slides. Controller: left stick flies, right stick looks, triggers/bumpers go down and up,
  B leaves. Esc, O or Exit leaves; "Back to start" returns to the entry view. Movement eases in and out. The camera never goes
  below the ground or the room floor and stays on a leash (80 m outdoors, 14 m indoors) so streamed districts stay drawn.
  It respects the player's sensitivity and invert-Y settings.
- `johansson-town/src/game.js`: Town book tile **Free camera** (`#freeCameraButton`) and the O key. While free, the loop
  consumes the clock delta and draws through `renderStill` (the audit's former `render()` body, now shared), so no simulation,
  animation, input or saves advance. Johansson's body is shown even in first person, and the first-person hands are hidden.
  Leaving needs no restore, because play recomputes the camera on the next frame.
- `tests/free-camera.test.mjs` (new, in the CI guard).

Checks: `node --test` on the free-camera, looks, cel-look, runtime-package and audit-boot tests: 35 pass. CI guard: 344 pass,
1 fail (the same `no-z-fighting` out-of-memory failure; `--max-old-space-size` does not reach its child process). `node tools/cloud-boot-smoke.mjs`
on the rebuilt runtime: clean, so audit stills still work through `renderStill`. Source boot in software Chromium at 960×600:
O entered (HUD hidden, bar shown); E+S rose and backed off; a mouse drag turned the view. Two screenshots 4 s apart with no
input were pixel-identical (the world is frozen). Esc returned to the original view with the HUD back.
Not checked: touch gestures and controller on real devices; the bar at phone width.
Known: with the clock on real time, the wall clock keeps running while frozen, so the town catches up on leaving, as after any
pause. The lens passes through walls, by design.

## Pushed to main — 22 October 2026
Owner: "Push camera to main". The branch, both the Look setting and the free camera since the camera commit builds on it,
was merged with `origin/main` (3 commits: PRs #368 and #369 and their handover) and pushed to `main` directly, with no PR.
`tests/visual-audit-freeze.test.mjs` (new on main) reads the audit's render body from `game.js` as text. It now also loads
`renderStill`, which that body delegates to; its assertions are unchanged. After the merge: that test, consolidation,
runtime-package, audit-boot, free-camera and looks tests: 19 pass. CI guard: 348 pass, 1 fail (the `no-z-fighting` out-of-memory
abort in this container, also on main). Watch the `johansson-world.yml` run on main for the real result.
