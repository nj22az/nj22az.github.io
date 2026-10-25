# Thao: Blender ribbon dress and long side-part waves — 25 October 2026

**Latest continuation:** the owner asked whether Thao has the newly rigged eyes. The original rework had painted eyes; the runtime now incorporates the exact shared eye system from main, retaining the reworked face, hair and dress. See the eye integration section below for current evidence and publication status. Saved Blender previews remain painted-eye portable exports.

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

## Rigged-eye integration — latest owner follow-up

- Original dress/hair delivery is published on remote `development` as **`1ac0ad6e4646bf75130dce9d1c90978f2cb38f6d`**. Local Git could read the repository but had no push credentials; the connected GitHub service published the files. Its returned tree SHA **`5ef8f059d20f817b62e5b1ef987fe9d9f5065597`** exactly matches the tested local tree. Local development was aligned with that same-content remote commit without discarding work.
- Selectively ported `eyes3d.js`, face painting, fractional animation blinks, performance face painting and portable export integration from verified main **`9c7db3e823332598831adb4f577fca5cc5e2a435`** (main eye publication `b3ebec8a`). No whole-branch merge or architecture replacement. Thao's new sculpted face, long waves, no earrings and ribbon dress remain intact.
- Runtime eyes are enabled by default, on the head bone: **480 triangles, one extra draw**, sliding gaze, smooth and per-eye blink, lids/lashes/highlights and expression states. `?eyes3d=0` retains the painted comparison; symbolic expressions retain their established painted fallback. Blender/GLB review exports explicitly retain painted eyes, matching main's portable export policy; do not claim those native files contain a Blender eye rig.
- Focused eye, dress and expression suites: **14/14 pass**. Updated the existing expression test's obsolete two-draw assumption to include the one shared eye draw, preserving the two body/head outlines and checking attachment to the head. Added the previously unguarded expression suite and the eye suite to the guard.
- Real ink-pipeline browser comparison: **pass**, twelve views across six residents. Final reworked Thao draws **11,856 / 9,036 eye pixels** in front / three-quarter views, **zero changed pixels outside the eyes**. [Browser log](../docs/qa/thao-dress/rigged-eyes-browser.txt).
- [Thao eye sheet](../docs/qa/thao-dress/rigged-eyes/Thao.png) and [state report](../docs/qa/thao-dress/rigged-eyes/Thao.json): painted comparison, new eyes, four gaze directions, partial/full blink, turns and expressions; visually inspected. Updated Thao's resident portrait through the shared renderer and rebuilt runtime; package integrity **4/4 pass**.

Final post-eye compiled-game captures, full guard and remote publication are recorded below when complete. Physical-device and continuous motion acceptance remain open.

## Owner's appearance distinction — final Thao styling

The owner: **"I want Thao to be 'Prettier' Than Thuan … Thuan is More cute, and independent."** Implemented as a visual distinction: Thao is the more elegant, poised sister, with wider lifted cat-shaped eyes and lashes, lightly arched brows, less cheek roundness, a more defined jaw, a smaller nose, restrained rose lips and less blush. Long side-part waves, pale pink ribbon dress, adult stature, beauty mark and no earrings remain. Thuan's approved recipe, personality and independent shop-owner role are preserved; no behavioural changes were made to either sister.

Rendered and inspected matching Thao/Thuan eye sheets to compare their silhouettes and expressions. Reconstructed the complete native Thao model in Blender 4.5.3 from the final shared topology/weights and updated packed face texture; all five Blender studio renders were regenerated. The separate garment and hair source sculpts remain reusable. The studio export still uses painted fallback eyes, explicitly documented above; the game uses rigged eyes.

Final style-focused checks **14/14 pass** ([log](../docs/qa/thao-dress/rigged-eyes-focused.txt)). Shared eye lighting/Look browser regression **passes**, 92 renders on Johansson across the existing 19 Looks and repeat switches, dim/day and two viewports; minimum measured contrast **0.0646**, required floor **0.045** ([log](../docs/qa/thao-dress/rigged-eyes-lighting.txt)). This is shared eye-pipeline evidence, not a Thao-specific 92-render claim. Final Thao eye comparison browser check passes as recorded above. Fresh five-view shared-avatar captures and two compiled-game izakaya captures use the final face and rigged eyes, with zero page errors. The owner was shown the new full-body and portrait captures during this continuation.

## Final combined acceptance

Final **462/462 World guard checks pass, 91 files, 333 seconds**, including runtime integrity, the rigged eyes, expression caching, garment fitting, paired poses and the existing World guard. Command: `NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs --test-concurrency=2`. [Full current log](../docs/qa/thao-dress/rigged-eyes-full-guard.txt). No guard skips or failures. This result supersedes the earlier painted-eye 452-check delivery result for the final candidate. `git diff --cached --check` passes.

Signed off: Codex — final elegant Thao styling, shared rigged eyes, Blender source refresh, actual avatar/room screenshots, visual comparison and full combined regression complete. Development publication verification follows; no main/Pages or Linux publication and no physical-device acceptance is claimed.
