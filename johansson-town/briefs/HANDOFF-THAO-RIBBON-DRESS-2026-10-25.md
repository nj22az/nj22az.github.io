# Thao: Blender ribbon dress and long side-part waves — 25 October 2026

## Owner request and delivery boundary

Owner supplied a photograph and requested a reusable dress, fitted to Thao, a prettier and less generic Thao, no earrings, and Blender construction followed by game integration. Follow-up explicitly requested long hair like the reference and screenshots.

Work is on **development**, based on `ecc483958b6a5c4b64c0f7f055c07d6c8decbf3b`. This is a shared cartoon-avatar integration, not a replacement character engine. No main promotion, live Pages deployment or Linux release is claimed. Preserve the branch's other work; do not merge all development into main because it retains separately flagged architecture prototypes.

## Delivered

- Original Blender construction: wide flat straps, fitted pale-pink bodice, scalloped eyelet band, threaded black ribbon, looped bow and tails, and an open A-line skirt. The photo shows the upper garment only: the matching skirt and unseen back are original completion choices.
- Long, dark side-part waves authored in Blender: continuous back curtain, asymmetric swept crown and four tapered S-wave face-framing locks. No ponytail. Root tapering removes the initial exposed tube-like ends; the hairline keeps the eyes visible. Shared secondary-motion bones carry the hanging hair.
- Thao retains her stature and adult identity, with a soft sculpted silhouette, defined almond eyes, tapered brows, understated lips and a small beauty mark. Her earrings are explicitly `none`.
- Creator hair **Long side-part waves**, Top **Ribbon dress bodice** and outfit set **Pink ribbon dress** are available to every avatar. Thao's default uses the full set. Existing personalised resident appearances remain respected.
- Evaluated Blender topology is imported into `ribbon-dress-data.js` and `sidepart-waves-data.js`; `ribbon-dress.js` fits it to each actual torso. Straps use the existing signed-distance body fit. Skirt uses the shared leg-follow, hem and CPU/GPU cloth clearance path. Existing swimwear/bath clothes still replace normal clothes.
- [Editable Blender assets and reproduction instructions](../assets/models/wardrobe/ribbon-dress/README.md), including complete rigged `Thao-ribbon-dress.blend` with packed textures. Garment has **3,930 authored triangles**; hair **7,088** before the existing merge/outline pipeline. No new runtime loader, draw or cloth solver is added for these pieces.
- Resident guide portraits regenerated through the live shared renderer; its fingerprint now includes the new mesh modules and shared hair springs. Runtime rebuilt and source/package checks pass.

## Visual self-audit and evidence

The initial Blender and real WebGL views exposed a bright over-wide scalp part, abrupt front-lock roots and hidden body/trim ink leaking through the dress. Corrected the part width, root taper and ink ranges before the final views. The standalone sculpting files retain separate named parts; the complete model retains shared skeleton weights and face textures.

[Five actual WebGL views](../docs/qa/thao-dress/webgl-report.json) show front, three-quarter, side, back and face. [Full compiled-game report](../docs/qa/thao-dress/world/report.json) confirms normal title/START/room loading, Thao visible at the izakaya service station at 19:00, and two captures, with zero page errors. Main capture: [Thao in Minato Izakaya](../docs/qa/thao-dress/world/thao-in-izakaya.png). These are local game screenshots, not evidence of public deployment. Separate `thao-*.webp` and `dress-detail.webp` are Blender studio renders, not game screenshots.

## Verification

- New fitting/shared-rig tests plus compiled-runtime integrity: **8/8 pass**, [log](../docs/qa/thao-dress/focused-checks.txt). Straps checked across 36 age/proportion/build/silhouette combinations; portable recipe round-trip, open skirt passages/normals, shared skeleton weights, finite walk/sit vertices on Thao/Thuan/Johansson and normal/swim/after-bath switching.
- Five WebGL avatar views, zero page errors; compiled-game izakaya captures, zero page errors. Software Chromium/SwiftShader, **1280 × 900** for the room captures. No physical-device performance claim.
- Paired-pose and garment suite: **8/8 pass**, [log](../docs/qa/thao-dress/paired-pose-checks.txt). The first full guard found two Thao/Vy contact regressions (7 mm in a facing pose; 15 mm from the skirt in back-to-back). The final face uses the less pointed shared sculpted form. The shared pair fitter now includes actual cloth vertices carried by hem springs with their leg/hip weight blend; contact proof includes those same physical cloth surfaces. Collision/contact tolerances remain unchanged. No current-game fighting was restored: these are existing Studio artistic poses.
- Full guard result and publication commit are recorded below when complete.

## Remaining limits / next action

No physical iPad or Steam Deck test, measured FPS, continuous filmed motion/contact acceptance or public-site deployment is claimed. The shared hair has spring support but uses the existing simplified collision/animation system, not strand simulation. Matching skirt/back are documented design assumptions. Review owner aesthetics in the saved screenshots before any selective main promotion. Do not overwrite personal saved looks to force the new default.

Signed off: Codex — modelling, shared integration, local visual self-audit and focused verification completed; full guard/publication status below.

## Final verification

Full World guard: **452/452 pass, 89 files, 343 seconds**, `NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs --test-concurrency=2`. [Complete log](../docs/qa/thao-dress/full-guard.txt). Final source/runtime checks: **8/8 pass**. Five shared-avatar WebGL views and two fresh compiled-game izakaya views, zero page errors. The first guard failure was corrected; no collision/contact tolerance was relaxed.

## Continuation and publication — 25 October 2026

The owner asked to carry on with Thao. Recovered the unfinished working tree at `/workspace/scratch/3cbe812a3d23/repo`: the model, integration and full-guard evidence existed, but no Thao commit had been made. Verified the remote `development` head was still `ecc483958b6a5c4b64c0f7f055c07d6c8decbf3b`; no concurrent development change needed reconciliation. Main remains a separate, newer cartoon release and is not replaced by this prototype branch.

Re-read the supplied dress/hair reference and inspected the actual avatar and compiled-game views. Fresh `node --test tests/ribbon-dress.test.mjs tests/runtime-package.test.mjs`: **8/8 pass**. The earlier **452/452** guard result above is retained evidence from the same unchanged implementation, not a claim of a second full-guard run. Fresh screenshot review and remote commit verification are recorded below when completed.

Signed off: Codex — resumed the owner's Thao task, recovered the completed Blender work, checked the delivery boundary and revalidated source/runtime before committing to `development`.

Fresh capture commands `node tools/render-thao-dress.mjs` and `TOWN_CHROMIUM_PATH=/tmp/johansson-chromium node tools/render-thao-world.mjs` both completed successfully: **five avatar views and two compiled-game views, zero page errors**. The room report confirms title/START, normal room entry and visible indoor Thao at the service station; refreshed screenshots were visually inspected against the supplied reference. No application source or model geometry changed during this continuation. `git diff --cached --check` passes after removing trailing blank-line whitespace from the preserved initial regression log.
