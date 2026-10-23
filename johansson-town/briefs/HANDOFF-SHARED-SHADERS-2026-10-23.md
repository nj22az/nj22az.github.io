# Shared illustration shaders — implementation handover

23 October 2026. Branch `codex/shared-illustration-shaders-2026-10-23`. Implementation rebased onto main `03dd675c5e70f166e29f9f87eb30a76a4d4f19f6`, preserving the newly merged Nhung/Higa/controller work. [PR #382](https://github.com/nj22az/nj22az.github.io/pull/382) is open and mergeable, with implementation publishing commit `bae2618fa31514f592a5053ac8dd186ae6f0ae1b` (local implementation `ff657a3b`, integration/runtime/docs `bddb0b3a`). Final check results follow below. Visual changes are not merged or deployed.

## Delivered behaviour

World and Studio use the same fourteen-look GLSL factory with explicit depth/normal capabilities and preview/export sample budgets. Natural remains the comparison baseline. Manga has readable tiered screentones and restrained spot blacks; Cartoon uses scoped two-band 3D materials; Oil uses an orientation-guided anisotropic quadrant Kuwahara filter. Other styles gain monochrome contrast, sepia duotone, fixed 16-colour mapping, feature-preserving Pocket edges, restrained CRT separation, geometry edges with pressure variation, curated woodblock inks, quieter watercolour washes and brighter Crayon paper.

The shared auxiliary renderer captures normal/depth from the same posed scene and camera; alpha-cutout texture transforms are honoured, source materials restored, normal resources disposed, and shadow updates disabled during the auxiliary pass. Opaque RGB24 depth avoids Canvas alpha-rounding loss. Capture happens on explicit scene capture/export, not every animated preview. Standard skinned/morphed/instanced meshes use the same geometry. Custom shader-only vertex deformation has not been separately verified. Object-ID buffers were optional in the plan and are not implemented.

Fresh Studio projects retain validated optional capture PNGs and camera metadata. Miniature supports depth focus and deliberate tilt focus, with editable/persisted distance and range; World exposes the same focus API. Legacy picture-only projects remain editable with honest 2D-approximation notices. Captured plates reconstruct world-space stroke coordinates; live Crayon uses rest-position triplanar strokes. Full Cartoon/Crayon material changes require Edit scene and recapture when starting from an old Natural plate. `baseLook` prevents duplicate filtering of an already baked identical look.

Lettering stays editable after effects, including replacement, translation and assets; deterministic small contour jitter affects bubble/border paths, never glyphs. The original built-in comic layer pack and all fourteen original reference exports were preserved. PR #371 was verified open and documentation-only before implementation; no parallel physical-material overhaul was imported.

## Evidence and acceptance

- 40 focused shader/cel/material/comic checks passed before integration; after rebasing, seven capture/material/runtime checks passed, including current-source runtime fingerprints.
- Comprehensive real WebGL browser test passed before and after integration: numeric depth error below 2e-7, normal orientation, alpha cutouts with texture transforms, source material restoration, two actual World environments across all fourteen looks plus Manga/Cartoon/Oil night cases (34 combinations), camera and pose changes.
- Real MCP stdio + Chromium regression passed. Saved project focus controls including tilt mode round-tripped through the actual Studio UI. All fourteen legacy picture-only looks compiled without shader errors.
- Matched-camera compiled-game checks passed on old and revised builds: street and Community Hall, Manga/Cartoon/Oil/Crayon, 12 steps each, zero errors/fallbacks. Latest-main integrated compiled-game smoke also passed: 12 steps, all eight requested street/interior screenshots, zero errors/fallbacks, 106.4 s total. The comprehensive shared pipeline and runtime checks passed again after integration.
- Pre-integration full guard: 361 passes, one process-level failure in `no-z-fighting.test.mjs`; isolated TAP rerun reports SIGKILL, with cgroup OOM kills observed. This is not a passing full guard. No test weakened or skipped to mask it. Latest-main full rerun was interrupted under the same memory pressure; isolated latest-main retry with a 2 GiB heap conclusively reports JavaScript heap exhaustion (SIGABRT). No full-guard pass is claimed. The guard must run on a better-provisioned runner.
- Runtime rebuilt after latest-main integration (10.24 s); native browser checks use software WebGL. Timings include compilation and are not physical GPU/iPad/iPhone performance acceptance. Device frame-rate targets and owner visual acceptance remain outstanding.

## Review files

Saved separate Manga, Cartoon and Oil full-strip previews, a three-page before/after PDF, and a fresh 6,282,788-byte `.studio.json` project with normals/depth. Locations in this session:

- `deliverables/shared-shader-upgrade/after-manga.png`
- `deliverables/shared-shader-upgrade/after-flat.png`
- `deliverables/shared-shader-upgrade/after-oil.png`
- `deliverables/shared-shader-upgrade/shared-shader-before-after.pdf`
- `deliverables/shared-shader-upgrade/captured/make-something.studio.json`

Reproduce with `avatar-creator/render-shader-proof.mjs` (optional `STUDIO_PROOF_OUTPUT`), `STUDIO_BROWSER_TEST=1 node --test avatar-creator/tests/shared-looks.browser.mjs`, and `node johansson-town/tools/shader-world-smoke.mjs <output>` (`--baseline=<git-ref>` for an available retained build). Set `TOWN_CHROMIUM_PATH` when Chromium is outside Playwright's default cache. Do not overwrite the original reference PNGs.

Next: review separate before/after strips, complete the geometry guard on a sufficiently provisioned runner if memory termination persists, measure actual target devices, then merge/deploy only after the planned visual review. Minato remains the priority; no island expansion is part of this work.

Final sign-off: implementation and review files delivered in open, mergeable PR #382; no merge/deployment claimed. `git diff --check` passed. Current runtime entry is `boot-bEI-4URo.js`; source fingerprints match. The incomplete geometry guard and actual-device profiling remain explicitly open.

## Second owner review - 23 October 2026

Owner supplied a second visual critique after the seven-page review PDF. Refined the same shared code on PR #382, preserving the first review files. Corrected one diagnosis: Cartoon already quantised luminance, not individual RGB channels. Removed its saturation expansion and independent channel clipping, limited common gain, and added a restrained cool shadow tint. Natural is untouched.

Manga now outputs pure black/white picture pigment; antialiasing in final composition/downsampling can still soften display edges, but no tinted grey substrate remains under tone dots. Depth-clear canvas backgrounds are thresholded once and bypass tone/edge expansion, so hero rays stay solid. This also leaves clear sky as unprinted white. Existing lettering stays separate.

Oil keeps its orientation-guided clustering; uniform linen modulation drops from .04 to .016 (60 percent) and, with the quieter stroke modulation, appears only where the paint is bright/thin. A capped five-percent derivative ridge catches clustered paint boundaries. This is a graphic impasto cue, not a physical specular material.

Crayon rest-space strokes now have short staggered runs, low-frequency coordinate wobble, 45-degree primary strokes, a crossed shadow tier and cellular wax grain. Grain is shared across both directions per surface projection; bright surfaces bypass stroke work. The saved-picture fallback also breaks its runs and uses light/dark tiers, but is still the documented approximation. `render-shader-proof.mjs` accepts optional `STUDIO_PROOF_LOOKS` to recapture the four complete comic variants through the production editor.

Validation so far: 34 focused/capture/material/runtime checks passed, rebuilt runtime `boot-Cre9fA3O.js`, comprehensive real WebGL test passed all fourteen looks in two environments and the six night combinations. New GPU assertions require strictly binary Manga across a grey ramp and bounded neutral hue drift in Cartoon. Full four-style production comic recaptures completed without page/shader errors and were visually reviewed. Matched-camera full-game screenshots and refreshed review PDF follow below. Previous full-guard memory exhaustion and missing physical-device profiling remain open; this refinement does not claim to resolve those.

Second-review final evidence: compiled-game check passed all 12 steps/eight street and Community Hall screenshots with zero errors/fallbacks in 113.4 s. Reviewed the four fresh full comic recaptures and all eight rendered PDF pages. Delivered `deliverables/shared-shader-upgrade/refinement-2/johansson-shader-refinements.pdf` (eight pages), four separate comic PNGs and `refined-game-screenshots.zip` (eight PNGs). The three first-review comparisons use their immediately previous versions; Crayon is explicitly labelled against the original fourteen-style reference. Fixed camera positions are the same, but weather/sky lighting can vary between game runs; this is not a lighting-identical benchmark. Existing first-review files are preserved.

Second-review source and runtime are a follow-up to publishing commit `512b3a01f7896de9041ad2d2524a73fb364bafad` on the same PR #382 branch. `git diff --check` and the 34 focused/runtime checks pass. The full geometry guard is still not signed off; no re-run of that memory-heavy guard or device-performance acceptance is claimed for this follow-up.
