# Studio surface prototype — 23 October 2026

Working, opt-in proof for [plan PR #371](https://github.com/nj22az/nj22az.github.io/pull/371), which was still open and unmerged when read. The complete plan was read from `codex/johansson-suite-material-plan-2026-10-23`. No default material migration is authorised by this prototype.

## Review the actual renders

Each comparison uses the same recipe, geometry, rest pose, camera, exposure, light rig and output transform. The top row is original; the bottom row is the proposed surface treatment. Hands are main's existing resting hands, with no anatomy, topology, proportion or rig changes. Johansson provides a contrasting male silhouette, warmer skin and grey hair beside Thuan's dark braids.

| Character | Neutral portrait: face, body, hand | Daylight: face, body, hand | Warm interior: face, body, hand |
| --- | --- | --- | --- |
| Thuan | [Comparison](thuan-neutral-comparison.png) | [Comparison](thuan-daylight-comparison.png) | [Comparison](thuan-interior-comparison.png) |
| Johansson | [Comparison](johansson-neutral-comparison.png) | [Comparison](johansson-daylight-comparison.png) | [Comparison](johansson-interior-comparison.png) |

[Thuan faces under all three lights](thuan-lighting-faces.png) · [Johansson faces](johansson-lighting-faces.png) · [Cotton and satin](thuan-finishes.png) · [Side-by-side turntable](thuan-turntable.mp4).

The turntable is a silent 4-second review loop: 24 authored camera/character-angle samples at 6 fps, 1024 × 710 H.264. Both halves use one fixed neutral lighting rig and the same rest pose; angle is `frame/24 * 2π`. There is no duplicate endpoint frame, interpolated motion, audio or performance acting. This is a highlight/seam inspection, not a polished character film.

Natural renders retain the existing geometry outlines. Additional real Ink-pipeline pairs: [Manga before](thuan-manga-legacy.png) / [after](thuan-manga-enhanced.png), [Crayon before](thuan-crayon-legacy.png) / [after](thuan-crayon-enhanced.png), [Oil before](thuan-oil-legacy.png) / [after](thuan-oil-enhanced.png). The latest main Oil face/lettering preservation is retained. These are pipeline compatibility renders; the character editor itself continues to use its original direct-render path.

[Desktop controls](studio-controls-1280.png) · [Phone-sized controls](studio-controls-390.png). These are software Chromium viewports, not photographs of physical devices.

## Try it

Open Studio → **Edit character → Preview & surfaces**. Under **Surfaces · prototype**, choose Before/After, Cotton/Satin and Neutral portrait/Daylight/Warm interior. Close the panel to see the character unobstructed. The same surface selection applies to the existing transparent PNG export.

Before/original remains the default, including after reload. Preview materials never enter a character recipe, character save, share code, World transfer or GLB. Download comparison settings records the recipe, preset version, preview controls, lighting and rendering settings; it is a capture record, not an implemented scene-import format. Existing character files remain interchangeable. World, scene/comic composition, bathing/alternate preview outfits and 3D exports retain their original finishes in this first proof. The comparison is supported on ordinary clothing only; an alternate outfit temporarily restores the original surface overlay, including the face.

## Actual insertion points and colour contract

| Area | Inspected implementation | Result |
| --- | --- | --- |
| Installed engine | `johansson-town/vendor/three.module.js` | Vendored Three.js **r170** (MIT). Runtime property probes confirmed `specularIntensity`, `sheen`, `sheenRoughness` and `anisotropy`. No upgrade or CDN dependency. |
| Main avatar body | `src/avatars/build.js`: `part`, `addBody`, `bodyMaterial`, `buildAvatar` | One merged, vertex-coloured skinned body, with a painted garment canvas. `celFrom(MeshStandardMaterial)` creates a **MeshToonMaterial**, deliberately dropping physical roughness/specular response. |
| Head | `buildHead`, `face.js`, `face-objects.js` | Painted sRGB face, authored flattened face normals, faint existing self-illumination and separate facial accessories. Preserved. |
| Legacy toon/outline | `src/render/cel.js`, `build.js` `outlineMaterial` | Soft three-band toon ramp plus geometry outlines. Legacy meshes/materials remain available unchanged. |
| Character preview | `src/avatars/creator.js`, Studio `studio.js` | sRGB output; NoToneMapping, exposure 1, hemisphere fill + directional key, no environment map, existing unshadowed preview. The study does not alter exposure or tone mapping when toggled. |
| PNG | Creator `exportPNG` | Existing square sRGB render target and pixel readback, transparent background, full-body camera independently framed from the preview. Same active materials and light rig; targets disposed in `finally`. |
| GLB/motion | `src/avatars/export.js` | Builds a separate legacy avatar, with the existing body/braid/morph export. No prototype materials or pose changes silently baked into GLBs. |
| Scene/comic | `avatar-creator/scene.js`, `scene-avatar.js` | Separate sRGB renderer and existing composition/poster/photo workflow. Deliberately not migrated. |
| World Look | `src/render/ink-pipeline.js`, `looks.js`, `game.js` | NoToneMapping; linear scene colour → Ink/grade → FXAA → selected Look. Existing HDR/scale/device policies and Natural-on-restart remain intact. No competing filter or gamma correction added. |

The three explicitly selected lighting rigs live in `src/render/studio-lighting.js`. Full parameters and each capture's exact camera, resolution, exposure, recipe, material version and Look are in [report.json](report.json). The harness uses no environment map, texture download or automatic device downgrade.

## Implementation and boundaries

`src/avatars/material-presets.js` is the small shared authority. Skin uses built-in Physical with restrained dielectric specular; hair and matte cotton use Standard; satin uses Physical with a modest neutral sheen. No SSS, clearcoat, transmission, anisotropy, normal maps or new BRDF shader is added. Satin's current highlight is isotropic; directional fabric fibres need a separately justified tangent-aware treatment.

The builder records semantic skin/hair/cloth regions when Studio opts in. Finish boundaries are authored beside garment boundaries, not guessed from skin/garment colours. A preview-only indexed geometry batches up to four finishes plus a removable hat range. It shares original position/normal/UV/skin-weight buffers, preserves vertex order in the source geometry, and leaves the original outline geometry and hat draw range intact. Returning to Before restores the exact original body/head materials and geometry. Existing garment and cloth-fit hooks are reused.

Each preview owns a bounded cache of its finish materials and index geometry. Colours and textures remain owned by that avatar; there is no mutable cross-character material cache. Disposal restores originals before disposing preview resources and then the avatar.

The repeated-preview test exposed an existing leak: `avatar.dispose()` did not call `Skeleton.dispose()`, retaining one renderer-created bone texture per rendered avatar. The cleanup now releases it once. The fix changes resource lifetime, not World's material defaults. Initial failing evidence showed 11 extra textures after cycling; the final repeated check must retain equal counts. Geometry/resource counts include the review pipeline and cached shared ramps; they are renderer counters, not byte-accurate GPU memory.

## Validation and measured cost

See [report.json](report.json), [studio-ui-report.json](studio-ui-report.json), [full guard output](ci-guard.txt), [focused tests](focused-tests.txt), [runtime checks](runtime-package.txt) and the accompanying handover for final run counts and measurements. No normal-GPU, Safari or Steam Deck performance is claimed.

- Baseline full-body screenshots for both characters were pixel-identical to the pristine main avatar builder. Both builds were rendered through the same browser/camera/light setup. The pristine builder is unchanged between the initial inspected `b4a4320` and integrated `85065dc` main revisions.
- Actual browser invariants: recipe, positions, skin indices and weights unchanged; legacy materials/groups restored; independently built characters remain independent under material editing.
- Desktop 1280 × 800 and touch-emulated 390 × 844: save/reload, legacy default after reload, appearance rebuilding with the selected finish, PNG change with finishes, byte-identical frozen PNG after returning to legacy. No page exceptions.
- Five actual Creator open/export/close cycles: five context-loss events requested by cleanup and no leftover preview DOM.
- Ten repeated shared-avatar rebuilds: final geometry/texture counts equal the starting counts; compiled program count does not grow. Cotton and satin variants are reused within a preview.
- Built-runtime World smoke at 390 × 844 also passed: START/play plus actual street and Community Hall captures, six steps and zero page errors ([record](world-smoke/report.json)). This verifies boot/default integration, not World material adoption.
- Natural, Manga, Crayon and Oil rendered with no page or shader errors. World street/izakaya/ferry-night artistic acceptance is outside this Studio-only prototype.

Measurements use a 512 × 640, DPR 1 Chromium 149.0.7827.55 WebGL2 context on Linux, **ANGLE Vulkan SwiftShader**, on a shared AMD EPYC 9V74 host. The browser exposes the host's logical CPU count in the report; the container has a constrained/shared CPU allocation. After six warm-up draws, 30 samples measure synchronous wall time around rendering plus a one-pixel `readPixels` and `gl.finish`. This includes JavaScript, driver, software rasterisation and readback overhead; it is not a GPU timer, normal interactive frame time or an FPS result. The PNG figure measures canvas encoding only; the UI separately exercises the complete export.

Draw calls rise **4 → 7 for Thuan** and **5 → 7 for Johansson** in the neutral full-body review. Triangle counts and texture counts are unchanged. CPU submission, p95 and first-switch costs remain in the raw record; variability prevents claiming a speed improvement from these software runs. No rollout budget or 60/30-fps target is declared passed. Before World adoption, agree and measure a hardware budget, including first-switch compilation, on a normal desktop GPU, real iPhone/iPad Safari and Linux/Steam Deck.

## Reproduce

From repository root, with the existing dependencies installed in `johansson-town/`:

```bash
node --test johansson-town/tests/material-presets.test.mjs
CHROMIUM_EXECUTABLE=/path/to/chromium MATERIAL_BASELINE_REF=<pristine-main-ref> node avatar-creator/tests/material-study.browser.mjs
CHROMIUM_EXECUTABLE=/path/to/chromium node avatar-creator/tests/material-studio-ui.browser.mjs
python3 avatar-creator/scripts/material-review-sheets.py
cd johansson-town
npm run build:runtime
node --test tests/runtime-package.test.mjs
NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs --test-concurrency=2
```

Run browsers and the guard separately. The render harness writes original stills, exact settings, raw samples and 24 turntable frames per mode. Labelled sheets and the movie combine those actual renders; they do not generate or repaint the characters. Intermediate turntable PNGs can be discarded after encoding. A baseline ref must identify the pristine builder; omit the variable only when not running that additional equality check.

## Attribution

Research references: [Disney BRDF Explorer](https://github.com/wdas/brdf), [Disney example BRDF](https://github.com/wdas/brdf/blob/main/src/brdfs/disney.brdf), [Three.js Standard](https://threejs.org/docs/pages/MeshStandardMaterial.html), [Physical](https://threejs.org/docs/pages/MeshPhysicalMaterial.html). The current online docs cover newer versions too; feature use here was checked against the installed r170 source and actual compilation.

No Disney code, datasets, probes, imagery, logos or assets were copied. The existing Three.js MIT headers and repository notices remain. This is an original numerical/material study using built-in features, not a claim of Disney affiliation or suite-wide commercial clearance.
