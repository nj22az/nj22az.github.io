# Wardrobe fabric and pressed-pleat prototype — 25 October 2026

## Brief, branch and publication boundary

Owner supplied `cenyi/LifeSimGrid`, asked what could be used, and authorised proceeding. The agreed first priorities are better clothing construction and an editable fabric workspace. This is an original Johansson implementation informed by that tool's repeating-pixel designer, not a Nintendo save importer or a second avatar engine.

Work stays on **`development`** under the 24 October owner workflow. Starting development head: `5fd5426471d6bf96f4d365bf1e1428daf894b5aa`. Current main `e2773e5` was brought **into development**, merge **`1aba40497283844d3a645b536582348f425b65ee`**, to preserve the accepted Vy panel skirt, current shared faces, website and later fixes before extending the wardrobe. Both sets of instruction/handover additions were retained. Runtime conflicts were replaced with main's runtime before rebuilding the combined development sources. The existing flagged Sakura development prototype remains; **this branch must not be merged wholesale into main**. The single-storey Sakura remains prohibited from main. No new branch or repository was created.

**This is an initial technical review prototype. No aesthetic, Pixar-quality, full motion-contact, browser-layout or physical-iPad acceptance is claimed.** Final check results and remote delivery are recorded at the end of this note.

## Delivered behaviour

- On a served **development checkout**, open `/avatar-creator/?wardrobe`. The toolbar has **Design fabric**; Top → Colour and Bottoms → Colour have the same action. Bottoms → Pleated skirt → Style offers **Classic / Pressed pleats** while the flag is present. Ordinary recipes keep their previous construction; no resident's default appearance is replaced.
- The fabric editor paints a **repeating 16 × 16 tile** with pencil, flood fill, eraser, continuous pointer strokes, keyboard arrows/Space, undo, clear, Checks/Stripes starters and repeat size. Choose **Top and sleeves** or **Panel / pressed skirt**. The latter enables the appropriate independent skirt mesh. Image import accepts bounded PNG/JPEG/WebP and reduces it to at most sixteen colours. PNG export retains transparent squares, which use the garment's base colour.
- Each gesture updates the actual Creator recipe. A small character PNG preview uses the existing Creator renderer, so the complete figure can remain visible even when the dialog covers the main preview. **Keep fabric** retains edits; **Cancel / Escape** restores the opening recipe. Save character and existing design/share formats retain the bounded tile data. Wardrobe share links retain `wardrobe` when opened from that prototype. No external image URLs or embedded original pictures are retained.
- Fabric edits use `setOutfit`, preserving the character's identity and original Reset feature baseline. Standard complete outfit sets replace their garments' custom fabric; partial accessory sets retain it. Temporary sailor/shopping/lobby clothes do not inherit another garment's tile. Existing bath rules remain.
- Optional **pressed pleats** use an original 2,304-triangle mesh: twelve panels with recessed pleat returns, fitted upper rows, sewn-flat waist, different front/seat depth shaping and short turned-edge returns. It uses the existing skeleton, skin weights, hem springs and CPU/GPU cloth fit, with one independent cloth draw and outline. It does **not** introduce cloth simulation. Existing panel-skirt geometry is retained.
- Fabric sits below the existing collars/cuffs/garment details. Top fabric is confined to the torso and sleeve UV regions; the skin/other-parts sampling strip stays transparent. Panel and pressed skirts use the existing separate cloth material and original UVs.

Core implementation: `src/avatars/fabric.js`, `fabric-editor.js`, `pressed-skirt.js`, and the existing recipe, Creator, garment painter, authored-skirt material and builder. Studio entry version and World runtime are refreshed.

## Study and scope decisions

Inspected LifeSimGrid's `TomodachiClothesTemplatePage.tsx`, `PixelStudio.tsx`, `VoiceLab.tsx`, island planner, compatibility/personality data and MIT licence. Source: <https://github.com/cenyi/LifeSimGrid>.

No upstream code/assets or dependency were copied. The new editor uses the repository's plain JavaScript and Three.js architecture; LifeSimGrid's Next/React stack was not introduced. Its clothing designer is a flat painter, not a garment-construction solution. The optional voice idea already overlaps World's profile-based Ryukyu-scale blips (`avatars/personality.js`, `voiceOf`, and town audio); no parallel voice engine was added. Zodiac compatibility does not replace residents' actual social behaviour. Island layout, NPC routines, facial geometry and Linux releases are outside this wardrobe change.

This first increment adds a pressed-pleat alternative and custom cloth. It does not claim to finish a new Blender-authored A-line skirt, layered blouse/cardigan collection, realistic fabric simulation or the full reference-character standard. The accepted panel skirt remains the existing authored foundation.

## Verification and limits

- `tests/fabric.test.mjs`: portable/malformed tile data, flood boundaries and continuous strokes, UV seam/normals/open passages/mesh budget, upper-body clearance at representative age/proportion/build extremes, shared skeleton/normalised weights, finite Walk/Run/Sit frames and clothing switching. Includes complete-set and temporary-uniform regression. Added to the CI guard.
- `avatar-creator/tests/fabric-editor.dom.mjs`: actual event-handler integration in JSDOM with native canvas drawing. Covers painting/undo/eraser, two garment targets, cancellation/focus restoration, image import, PNG export, retaining the other garment, rejecting stale asynchronous imports and garment/sleeve pixels versus transparent skin strip. **These are DOM/canvas checks, not a browser or touchscreen test.**
- Additional avatar, authored-skirt and wardrobe tests are run and their final counts recorded below. An unrelated `wardrobe-batch2.test.mjs` assertion still searches for retired **Shimabukuro**. It fails identically in an isolated **unchanged `1aba404`** source snapshot; this task does not rewrite retired-cast history to satisfy it. It is not in the current guard.
- Real Chromium launch was attempted. It fails before loading a page at `process_singleton_posix.cc`: local socket creation is prohibited. A sandbox escalation request was rejected because `sandbox_approval` is disabled. The permitted connected cloud browser also cannot reach the container's loopback server (`ERR_CONNECTION_REFUSED`). No workaround weakened that policy; no screenshot or real browser acceptance is asserted.
- `avatar-creator/render-wardrobe-prototype.mjs` is a reproduction helper for an environment with working Chromium. It is **syntax-checked only here**, not a passed browser test. It captures classic/pressed comparisons, three residents, views/poses/custom fabric, editor desktop/tablet/phone views and a save/reopen check. Existing browser/device performance budgets remain; no hardware frame-rate claim.
- Finite simulated poses are not proof of attractive motion or zero hem/thigh/seat collisions. Continuous filmed walk/turn/sit, matched-light front/side/back images, filter review and physical Safari testing remain visual acceptance gates.

## Reproduce

```sh
# From repository root, on development:
npm ci --prefix johansson-town
python3 -m http.server 8000
# Open http://localhost:8000/avatar-creator/?wardrobe

node --test johansson-town/tests/fabric.test.mjs
# Optional isolated DOM test dependencies; not application dependencies:
npm install --prefix /tmp/wardrobe-dom jsdom @napi-rs/canvas
TOWN_DOM_MODULES=/tmp/wardrobe-dom/node_modules node --test avatar-creator/tests/fabric-editor.dom.mjs
TOWN_CHROMIUM_PATH=/path/to/chrome node avatar-creator/render-wardrobe-prototype.mjs /tmp/wardrobe-review
```

## Next concrete review

Run the browser helper and inspect actual full-size skirt views and editor layouts. Check the pressed waist, panel folds and edge returns, then continuous seated/turning/stride contacts on several body shapes. Verify iPad pencil/fill/scroll/import/keep/cancel/save/reopen and repeat-size readability. Refine geometry from those observations before considering any selective promotion. Do not treat passing numerical tests as visual sign-off.

## Final verification / delivery

- Full sequential World guard: **427/427 pass, 84 files, 520 seconds**, with `NODE_OPTIONS=--max-old-space-size=6656 node tools/ci-guard.mjs --test-concurrency=1`.
- Final focused fabric/authored-skirt/wardrobe-catalogue run: **16/16 pass**. DOM/native-canvas editor integration: **4/4 pass**. Final rebuilt-runtime package integrity: **4/4 pass**. Initial authored/tailored skirt compatibility run: **6/6 pass**.
- The additional five-file wardrobe/customisation run was **27 pass / 1 fail**, the retired Shimabukuro assertion. The same assertion was reproduced against unchanged `1aba404`; it remains outside the guard and outside this task.
- Runtime rebuilt after the final source refinements. Final source syntax and `git diff --check` pass. No physical device, real browser screenshots, shader-render matrix, continuous filmed contacts or Linux package claimed.
- Logs and machine-readable evidence: [wardrobe prototype QA](../docs/qa/wardrobe-prototype/). Broad guard ran while the last isolated editor/lifecycle refinements were completed; the final focused and runtime checks cover those refinements. Numerical passing checks are not visual sign-off.
- Implementation committed locally as **`9ff7fa6`** on **`development`** after integration merge `1aba404`. A documentation follow-up records this delivery boundary and strips trailing whitespace from the saved baseline-test log.
- **Historical block, superseded by the owner-authorised publication below.** Automatic approval review rejected `git push origin HEAD:development`: it treated the remote as unverified and the operation as external publication not explicitly authorised by the owner, with possible disclosure of private project contents. No connector or alternate transport was used to bypass that rejection. Obtain explicit owner authorisation for publishing this development prototype to `nj22az/nj22az.github.io`, then push normally without force after checking that the remote development head is still compatible. The last verified remote head was `5fd5426471d6bf96f4d365bf1e1428daf894b5aa`.
- Main has not been changed, no PR to main is opened, and no website or Linux release is deployed. Browser/iPad visual acceptance remains separately outstanding even if publication is authorised.


## Owner-authorised GitHub publication — 25 October 2026

The owner replied **“@GitHub proceed”** to the explicit request to publish this prototype to `nj22az/nj22az.github.io` on `development`. This authorises publication and supersedes the previous block; no main promotion was requested. GitHub confirmed the repository is public and the connected account has push permission. The CLI had no credentials, so publication used the owner-selected GitHub connector.

Published implementation commit: **`394eb0bb6ddb058ab657a26789df0dee8db7a323`**. Its tree **`4611c4ae66533411b11b064d5e18ac3b280d4220`** was verified byte-for-byte identical by Git tree SHA to local delivery `654083e` (implementation `9ff7fa6`). All 75 uploaded new blobs were individually verified against local Git hashes. The commit retains prior development `5fd5426` and integrated main `e2773e5` as parents. The development ref was advanced with an expected-head check and without force. This follow-up updates only the handover/index/QA delivery status.

**Published to development for review; not deployed to the live website, not merged to main, no Linux package.** The previous 427/427 guard, 16/16 focused, 4/4 DOM and 4/4 runtime evidence still applies to the identical source/runtime tree. No tests are rerun for this documentation-only publication follow-up. Browser/iPad visual and motion-contact review remains outstanding.
