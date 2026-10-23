# Four experimental print and paint looks - 23 October 2026

## Scope and status

Owner requested Risograph, Manga with pencil strokes, Oil with heavy facial brushwork, then added Rubber Stamp and explicitly requested Izakaya renders. Implemented on `codex/print-media-looks-2026-10-23`, based on main `d4912912128e035c8336665a040e7c391f9580d8`. Local implementation commit `7e72a19`; review branch, not merged or deployed. Read alongside [the accepted shared-shader recovery](HANDOFF-SHARED-SHADERS-2026-10-23.md). Preserve Minato priority and the retirement of Storybook, Sunday Strip and Impasto Gouache.

## Delivered behaviour

World, Studio and After effects now discover nineteen looks: the accepted fifteen plus four explicitly experimental catalogue entries. Source kernels are in `src/render/print-media-shaders.js`, consumed by the existing shared `looks.js` factory; no second renderer or character system.

- `riso` / Risograph: coral and teal screened colour plates, indigo contours, warm paper, grain and small plate offsets. Patterns are deterministic.
- `pencilManga` / Pencil manga: white paper and porous graphite contours with short broken pencil strokes restricted to the deepest tones (below 0.28). This is a conservative luminance fallback, not a new lighting/shadow buffer. Lit mid-tone faces remain clear; the hero backdrop is thresholded once.
- `brushOil` / Heavy brush oil: wide directionally oriented, low-variance colour clusters; depth guards against borrowing background colour across silhouettes. Preview and export share the broad footprint with different sample counts. High-contrast facial features, ink contours and the World ink prepass remain. It is an image-space painterly approximation, not simulated 3D impasto.
- `stamp` / Rubber stamp: burgundy pigment, cream paper, solid cut shapes, variable pressure and sparse pinholes. This deliberately loses some tonal detail in dark rooms, as the review images show.

Accepted Manga, Cartoon, Oil and Crayon main fragment bodies were compared byte-for-byte against the main base and are unchanged. The new looks do not install the earlier material-pencil hook or replace accepted material settings. Geometry normals/depth are requested for the new looks. Studio letters stay on the later compositing layer; new styles use the existing slightly irregular bubble/panel outlines. Each new look survives scene, effect and layered-project normalization. The icon picker has distinct swatches and a scrollable height bound for the larger catalogue. Studio imports use `20261023-print-media` cache versions.

`avatar-creator/render-print-media.mjs` reproduces four complete production strips with the actual cast, booth, low-angle fist-pump hero and beer/football shed ending. `tools/shader-world-smoke.mjs --looks=riso,pencilManga,brushOil,stamp --izakaya <output>` reproduces the full-game views, including the requested bottle shelves and bar. The old helper invocation keeps its previous scope.

## Verification actually completed

- Initial focused catalogue/material/project tests: 24 passed.
- Final focused catalogue, picker, materials, capture/effects, scene and current-runtime set: 28 passed, zero failures.
- Real WebGL acceptance: 56 day/night environment/look combinations passed, plus numeric depth, normal and alpha-cutout captures, material restoration, warm-skin preservation and unchanged binary Manga/neutral Cartoon fixtures. New legacy picture-only shaders compiled in preview and export.
- Real After effects MCP stdio/Chromium acceptance passed in 24.0 s: nineteen looks discovered, editable text/assets exported and reopened, prior translation/removal checks retained.
- Runtime rebuilt in 12.11 s: `boot-CSqOOSL-.js`, `game-C38xgZqd.js`; current-source/runtime tests passed.
- Full compiled game, standard quality, 390 x 844 viewport: seventeen steps, twelve screenshots, zero reported page/shader errors or style fallbacks, 176.2 s. Four styles each in Minato Street, Community Hall and Minato Izakaya. Cloud software WebGL, not physical-device performance acceptance.
- All four 3200 x 1079 comic PNGs inspected. Eight-page review PDF rendered; comic lettering and the twelve game views visually checked. Riso is intentionally strongly coral/teal; Stamp is deliberately graphic and can merge dark colour regions. No claim of universal artistic acceptance.

## Deliverables and continuation

Saved eleven final deliverables successfully: four comic PNGs, four standalone Izakaya PNGs, `johansson-print-media-review.pdf` (eight pages), `johansson-print-media-game-screenshots.zip` (twelve game PNGs and report), and `johansson-print-media-editable.zip` (four layered Studio projects). Local directory: `deliverables/print-media/`. Previous accepted deliveries remain untouched.

Next: owner visual review of the four independent experiments, then merge only the accepted work. No physical-device FPS, Safari or native Linux package acceptance has been performed for these new looks; no Linux release or live Pages publication is claimed. Retain accepted presets unchanged during further tuning. The PR and exact publishing commit are recorded in the final review update below.
