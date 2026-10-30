# Startup crash audit and iPhone simulation — 30 October 2026

Owner: game does not start properly and kicks the player out; audit and remedy. Follow-up: “Run a simulated iPhone”.

## Branch and scope

`codex/world-startup-repair`, from production `ff76aee1a30ff1d000bd5bb9ecf0475543915899`.
[Draft PR #413](https://github.com/nj22az/nj22az.github.io/pull/413), into `main`. Not merged or published.
The separate Izakaya CAD repair (#410) is not included. No character, scene, shader-quality or Linux release change.

## Findings and corrections

The exact physical-device kick-out is not reproduced. Confirmed defects, rather than a speculative crash diagnosis:

- The released-canvas registry retained disposed room textures, canvases and redraw closures. A context restore
  repainted those obsolete pictures. The regression first failed on unchanged code: all 12 disposed entries remained.
  Disposal now unregisters them and releases their canvases. The same regression passes with zero retained entries.
- The WebGL lifecycle listened only after town construction and shader warm-up. A context lost during those loading
  stages could miss the `preventDefault` that permits restoration. The listener now attaches before the first loading
  yield, and defers callbacks that need gameplay state until that state exists. It records loss/restore locally.
- The interrupted-start marker began in `game.js`, after the Pixar models loaded. It now starts in `boot.js` before
  model fetch/decoding; the game reuses it, and an import retry cannot count the page twice. The 45-second settling
  period begins after an actual playable frame, rather than on the START click.
- A failed title preview enabled START and hid the useful error until the player clicked. It now immediately shows
  the startup error and Retry, and keeps START disabled. A behavioural test executes the actual inline loader with
  rejected WebGL creation and verifies the visible error, disabled button and working reload action.

Full normal graphics and the six current Pixar characters are preserved. Recovery still waits for two interrupted
launches; no general phone quality reduction. Saves are not cleared or migrated by these changes.

## Simulated iPhone baseline

The connected cloud browser reaches the published title but WebGL creation fails with GL_RENDERER Disabled. That
is an environment limit, not evidence of a fault in the owner's phone. The automated test instead ran WebKit/Mesa
with Playwright's iPhone 13 user agent, DPR 3, touch, phone viewport, portrait and landscape, against the compiled
production World. Full HDR, four-sample antialiasing and ink remained enabled.

[Run 41131374437](https://github.com/nj22az/nj22az.github.io/actions/runs/41131374437), test-only commit
`a1a011619151f6b557d1836290cc11727218b1d4`: **iPhone WebKit test and full World guard passed**.
Cold launch, live frame progression, rotation, warm reload and real Izakaya entry passed; no page errors or failed
requests. Cold-start check at 38.4 seconds, all five groups by 72.93 seconds on the hosted software renderer.
These are test-harness elapsed times, not physical iPhone loading or FPS claims.

[Machine-readable baseline](../docs/qa/startup-2026-10-30/iphone-baseline.json).
[Original report and three PNGs](https://github.com/nj22az/nj22az.github.io/actions/runs/41131374437/artifacts/13012329471).
The portrait screenshot was opened and inspected at full resolution: actual World scene, current resident, controls
and harbour, not a blank or loading frame. The baseline does **not** reproduce the owner's kick-out.

## Correction validation

- Runtime rebuilt with pinned Vite 7.3.6; the previous live boot and its dependency graph are retained for cached pages.
- Focused source/package/loader/lifecycle/canvas checks: **27/27 passed** locally.
- New early graphics-loss ordering test failed before moving the lifecycle and passed afterwards.
- All five startup/lifecycle/canvas test files are now in the World guard, rather than outside it.
- The expanded WebKit run additionally checks save persistence and a real forced context loss during loading, with
  the driver's `WEBGL_lose_context` extension. Its result will be recorded after the corrected candidate runs.
- Authored-file whitespace and JavaScript syntax checks passed.
- Complete local guard and full-game CPU smoke were launched; final results are pending below.

## Remaining acceptance

A desktop WebKit engine with a mobile profile does not model iOS jetsam/process limits, Mobile Safari's exact GPU
implementation, or the owner's existing tabs, saved state and network. No physical iPhone/iPad/Steam Deck claim.
Inspect the corrected CI result and captures, then publish only under the owner's instruction for `main`.
