# Johansson Town title screen review

Reconstructed from surviving implementation scripts after workspace maintenance removed the unpublished checkout. Based on main `68ed406` (1 October 2026), preserving the newer drinking, intoxication and walk-home behaviour.

## Changes

Ivory and amber typography over the existing town photograph, with Enter Town, Town guide and Harbour view. The visitor guide remains the initial page. Harbour view explicitly loads the existing game renderer and town once; Enter Town reuses that renderer. No replacement settlement, additional 3D scene or external graphics library is added.

The live view offers a bounded camera tour, pointer/touch dragging, scroll zoom, reset, day/sunset/night preview lighting, sound on/off and a native settings dialog for drift speed. Reduced motion disables automatic drift. Simulation, saving, restocking, opening selection and clock restoration are deferred until entry. Preview lighting does not write the town clock preference. Existing harbour audio supplies ambience and the entry chime after a user gesture. Entry interpolates the camera briefly unless reduced motion is requested.

## Validation

- Runtime compilation, source fingerprint and stylesheet hash checks pass.
- Full current Node suite: 515 checks, 514 pass, one pre-existing resident portrait fingerprint failure.
- Four new behavioural checks pass: frame-rate independence, bounded gestures/control isolation, reduced motion, save/audio/restocking deferral.
- JavaScript syntax and Git whitespace checks pass.
- The portrait check involves untouched guide/avatar/personality/cel files. The test and its manifest have not been weakened or restamped.

## Remaining acceptance

Keep the PR draft. Chromium could not run in the prior validation environment: the full executable failed creating its process-singleton socket (`Operation not permitted`), while headless shell crashed before navigation. No browser screenshots or phone frame-rate results are claimed.

A repeatable harness is included at `tests/title-screen.browser.mjs`. From `johansson-town`, with `CREATOR_CHROME` pointing at an installed Chromium executable and `CODEX_PRIMARY_RUNTIME_NODE_MODULES` pointing at the dependency directory containing Playwright, run:

```sh
node tests/title-screen.browser.mjs
```

The harness covers desktop 1440×1000, touch 390×844 and reduced-motion 390×844. It checks actual rendered geometry, unchanged preview storage, no initial audio context, lighting presets, settings dismissal, dragging, reset, mute, guide return, entry, saved yen/time and stability diagnostics. Evidence is captured only when a browser actually renders. Visual camera composition, responsive interaction, physical iOS/WebKit, live Pages and phone performance remain unverified. Do not merge until visual, runtime and performance acceptance pass.
