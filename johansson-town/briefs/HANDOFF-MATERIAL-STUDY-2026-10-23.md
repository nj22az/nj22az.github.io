# Handover — Studio material and lighting prototype, 23 October 2026

Status: implemented for visual review on `codex/studio-material-prototype`; not merged, deployed or artistically signed off. World defaults are unchanged. [Implementation PR #372](https://github.com/nj22az/nj22az.github.io/pull/372). Implementation commit: `0606b350175b56224b2176869106689926c0d2fa`; tested/uploaded tree `d1f08cff406b51f319ee740a2cbfca5f6b4d791e`. The following handover-only commit adds these review links; the runtime and tested source remain unchanged.

## Starting state and concurrent work

Read root CLAUDE/AGENTS/HANDOVER, the applicable World and Look handovers, World AGENTS, ANIMATION_DIRECTION, Studio editing/workflow/motion records and the current shared creator/build/export sources. PR #371 remained open/unmerged; its complete plan was read from `codex/johansson-suite-material-plan-2026-10-23`. This implementation is based on main, not a merge of that planning branch.

Initial inspected main: `b4a4320e5a3369a8c114274d5ee22de250bc4463`. Integrated main: `85065dca5f6d574f1d64d71c2ed83d25da3a683a`, including the concurrent Oil face/lettering preservation change and its handover. Main's avatar builder is unchanged between those revisions.

Inspected the live open-PR inventory: #300 body poses, #301 rejected experimental hands, #357 unaccepted identity study, #360 hand redesign plan, and #355 identity audit. They remain separate. No experimental branch was merged, no rig or anatomy was edited and no hand shading is presented as an anatomy repair. Ship/cast/household/planning work is untouched.

## Delivered

- `src/avatars/material-presets.js`: versioned skin/hair/cotton/satin preset factory using installed Three.js r170 Standard/Physical; preview-owned materials, original textures, bounded roughness override and reversible disposal.
- `build.js`: semantic surface ranges behind the `materialStudy` build option; a preview index batches finishes without changing source positions, normals, weights, skeleton, recipes, face paintings, outlines or removable-hat range. Existing default build remains toon.
- `creator.js`: opt-in Studio controls, restoration/rebuild/close lifecycle and PNG parity. Creator consumers that do not opt in keep existing finishes.
- `src/render/studio-lighting.js`: explicit Neutral portrait, Daylight and Warm interior rigs, separate from surface treatment and Looks. No device-only material policy.
- Studio **Preview & surfaces**: Before/After, Cotton/Satin, comparison lighting and downloadable capture settings. Default and reload are Before. Character design/save/share/World-transfer formats are untouched; prototype finish is intentionally preview state. Ordinary clothes only; alternate bathing/costume previews temporarily restore legacy surfaces.
- Fixed an existing resource leak found by the required lifecycle test: `avatar.dispose()` now disposes its shared skeleton/bone texture once. This is a cleanup change, not a World material change.
- Complete baseline/material/lighting/export inventory and source/licence findings in the [review record](../../avatar-creator/docs/qa/material-study/README.md).
- 36 actual paired-character/view/lighting stills, cotton/satin stills, six Ink/Look compatibility stills, labelled sheets, actual desktop/phone-sized Studio screenshots and PNG exports, plus a paired four-second turntable.
- Reproducible browser harnesses, sheet/movie generator, raw capture/settings/timing records, four meaningful shared-material tests added to the CI guard, rebuilt runtime.

## Visual findings

The prototype adds restrained skin gradients/specular response, larger readable hair highlights and visible cotton/satin differences. Thuan's painted eyes/whites, mouths, palette and geometry outlines remain readable. Johansson retains his existing dot-eye design. Legacy full-body pictures for both characters match the pristine main builder pixel-for-pixel. The more dimensional physical response is a proposal for owner review, not an accepted new Johansson default.

Nose/hand forms and authored face-normal differences remain visible because geometry was preserved. The hand close-ups show main's actual resting hands, not the separate rejected five-digit rig. No claim of full skin scattering or physically modelled hair/fabric fibres is made. Satin currently uses isotropic roughness and modest neutral sheen, not tangent-driven anisotropy.

## Checks actually run

- `node --test` over material-presets, avatars, avatar-customization, avatar-features and cel-look: **43 passed**, zero failures.
- Final material software-browser harness: **36 comparison stills**, two cloth-finish stills, six Look stills, both 24-frame turntable halves; zero page/shader errors. Both main-builder baseline equality checks and geometry/weights/identity/isolation invariants passed.
- Final Studio UI browser harness: **1280 × 800** and **390 × 844 touch emulation** passed save/reload, legacy-on-reload, recipe-preserving finish edits, PNG material application, identical frozen PNG after reverting, and rebuilding edited clothes while keeping the chosen preview finish. New select labels fit both layouts. Zero page exceptions.
- Five Creator open/export/close cycles: five contexts released and zero remaining preview elements. Ten avatar/material recreation cycles: geometry and texture counts stable; program count reduced from 21 to 14 instead of accumulating. The initial resource test found 11 retained textures; the skeleton cleanup fixed that measured failure.
- Final `npm run build:runtime`: passed. Final standalone runtime-package checks: **4 passed**, including source stamp and withdrawn-combat packaging.
- Built-runtime World browser smoke at **390 × 844**: page loaded, Island ready, START/play, actual street and Community Hall renders; **six steps, zero page errors**, finished in 39.4 s. These timings are software smoke-test wall times, not frame-rate measurements. [Report and captures](../../avatar-creator/docs/qa/material-study/world-smoke/report.json).
- Final complete CI guard: **375 passed**, zero failures, 71 files, 299 seconds with the explicit 6 GiB heap and concurrency 2. No tests, audit tolerances, exclusions or guard requirements were weakened.
- The earlier guard was not green: local baseline reconstruction retained two already-deleted festival source files, the runtime stamp became stale during integration, and `no-z-fighting` hit the default Node heap limit. Those baseline/stamp issues were corrected, and the final guard uses `NODE_OPTIONS=--max-old-space-size=6144` with concurrency 2. It does not skip that audit.
- Runtime source SHA-256: `b6dd8e1a9b31b5b5d07bb238a4b4903f3327c7603bcbfd234a748f61cb249bb0`.
- Encoded turntable inspected with ffprobe: **1024 × 710, 24 frames, 6 fps, 4.000 seconds**, H.264, silent. Still sheets and Studio controls visually inspected.

## Measurements and practical limits

[Raw material records](../../avatar-creator/docs/qa/material-study/report.json) · [UI records](../../avatar-creator/docs/qa/material-study/studio-ui-report.json).

Linux, Chromium 149.0.7827.55, ANGLE Vulkan SwiftShader on a shared AMD EPYC 9V74 host; cgroup allocation 8 CPU equivalents and 8 GiB memory, browser exposes hardwareConcurrency 9. These are software-renderer checks, not a normal desktop GPU or physical phone/tablet/Steam Deck benchmark.

512 × 640, DPR 1, identical neutral full-body scene, six warm-ups and 30 timed samples per mode. Values include rendering, synchronous one-pixel readback, driver and JavaScript overhead:

| Character | Original median / p95 | Proposed median / p95 | Draw calls | Texture count |
| --- | --- | --- | --- | --- |
| Thuan | 27.5 / 39.3 ms | 28.3 / 42.7 ms | 4 → 7 | 4 → 4 |
| Johansson | 31.6 / 69.5 ms | 36.0 / 53.3 ms | 5 → 7 | 4 → 4 |

The first enhanced switch/readback cost **299.9 ms** in this software context, including shader compilation/first use. The measured p95 variation is too large to claim an optimisation. Triangle counts are unchanged; resource counters are not byte-accurate VRAM measurements. PNG-encoding timings and raw samples are retained, with the measurement method. No FPS target or permitted hardware overhead budget is declared passed.

## What remains

1. Owner compares the actual pictures/movie and decides whether to retain/tune this surface direction. Do not merge or change World defaults before that review.
2. Measure first-use/warm performance and memory on a normal desktop GPU, physical iPhone/iPad Safari and Linux/Steam Deck. Agree a rollout budget before broader use.
3. Future phases, separately scoped: persistent finish schema and scene/GLB transfer, neutral environment lighting evaluation, directional fabric/hair if justified, selected World adoption and actual street/izakaya/ferry-night comparisons. These are not implemented or claimed by this prototype.
4. Hand anatomy/rigging and artistic approval remain the separate hand project. No further geometry changes are authorised by this shading result.

The Disney references are research only. No Disney source, BRDF Explorer, datasets or probes were imported. Built-in Three.js and existing repository garment/cloth-fit/Ink code retain their notices. This is not a suite-wide commercial clearance.
