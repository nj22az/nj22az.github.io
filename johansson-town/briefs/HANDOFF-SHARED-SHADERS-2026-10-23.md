# Shared illustration shaders — implementation handover

23 October 2026. Branch `codex/shared-illustration-shaders-2026-10-23`. Implementation rebased onto main `03dd675c5e70f166e29f9f87eb30a76a4d4f19f6`, preserving the newly merged Nhung/Higa/controller work. Review PR and final check results are recorded below before sign-off. Visual changes are not merged or deployed.

## Delivered behaviour

World and Studio use the same fourteen-look GLSL factory with explicit depth/normal capabilities and preview/export sample budgets. Natural remains the comparison baseline. Manga has readable tiered screentones and restrained spot blacks; Cartoon uses scoped two-band 3D materials; Oil uses an orientation-guided anisotropic quadrant Kuwahara filter. Other styles gain monochrome contrast, sepia duotone, fixed 16-colour mapping, feature-preserving Pocket edges, restrained CRT separation, geometry edges with pressure variation, curated woodblock inks, quieter watercolour washes and brighter Crayon paper.

The shared auxiliary renderer captures normal/depth from the same posed scene and camera; alpha-cutout texture transforms are honoured, source materials restored, normal resources disposed, and shadow updates disabled during the auxiliary pass. Opaque RGB24 depth avoids Canvas alpha-rounding loss. Capture happens on explicit scene capture/export, not every animated preview. Standard skinned/morphed/instanced meshes use the same geometry. Custom shader-only vertex deformation has not been separately verified. Object-ID buffers were optional in the plan and are not implemented.

Fresh Studio projects retain validated optional capture PNGs and camera metadata. Miniature supports depth focus and deliberate tilt focus, with editable/persisted distance and range; World exposes the same focus API. Legacy picture-only projects remain editable with honest 2D-approximation notices. Captured plates reconstruct world-space stroke coordinates; live Crayon uses rest-position triplanar strokes. Full Cartoon/Crayon material changes require Edit scene and recapture when starting from an old Natural plate. `baseLook` prevents duplicate filtering of an already baked identical look.

Lettering stays editable after effects, including replacement, translation and assets; deterministic small contour jitter affects bubble/border paths, never glyphs. The original built-in comic layer pack and all fourteen original reference exports were preserved. PR #371 was verified open and documentation-only before implementation; no parallel physical-material overhaul was imported.

## Evidence and acceptance

- 40 focused shader/cel/material/comic checks passed before integration; after rebasing, seven capture/material/runtime checks passed, including current-source runtime fingerprints.
- Comprehensive real WebGL browser test passed before and after integration: numeric depth error below 2e-7, normal orientation, alpha cutouts with texture transforms, source material restoration, two actual World environments across all fourteen looks plus Manga/Cartoon/Oil night cases (34 combinations), camera and pose changes.
- Real MCP stdio + Chromium regression passed. Saved project focus controls including tilt mode round-tripped through the actual Studio UI. All fourteen legacy picture-only looks compiled without shader errors.
- Matched-camera compiled-game checks passed on old and revised builds: street and Community Hall, Manga/Cartoon/Oil/Crayon, 12 steps each, zero errors/fallbacks. Latest-main integrated smoke and guard results follow below.
- Pre-integration full guard: 361 passes, one process-level failure in `no-z-fighting.test.mjs`; isolated TAP rerun reports SIGKILL, with cgroup OOM kills observed. This is not a passing full guard. No test weakened or skipped to mask it. Latest-main rerun pending at time of initial note.
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
