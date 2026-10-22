# Johansson Studio character prototype — 22 October 2026

## State, baseline and review gate

Owner requested a publishable, distinctive Johansson identity while retaining the cast's playful appeal. This is the **first opt-in shape study**, not an approved cast rollout or a release.

Branch: `codex/studio-storybook-prototype`. Visual/source baseline: main `9f7ccd4cf498eb266f5eec6b215332ff483ee9d4`. Main was rechecked at `125255c3eb97d6792ada7efa89cefd7ceddc37d6`; the avatar/Studio sources and instructions had not changed. The delivery runtime uses that newer main, preserving its civic backdrop changes. Implementation commit and PR are recorded in the follow-up delivery entry below.

PR [#355](https://github.com/nj22az/nj22az.github.io/pull/355) remains open and unmerged at inspection. Its [audit on the PR branch](https://github.com/nj22az/nj22az.github.io/blob/codex/studio-character-identity-audit-2026-10-22/avatar-creator/docs/CHARACTER-IDENTITY-AUDIT-2026-10-22.md) is documentation and proposals only. No audit recommendation is presented here as a previously implemented feature.

## Implemented

- Shared `buildAvatar(recipe,{renderStyle:'island-storybook-v1'})` and `measure(recipe,{renderStyle:...})` opt-in. Default remains `classic`; World and ordinary Studio calls keep the same geometry. Unknown styles fail explicitly.
- Lower-face taper reduced by 32%, cheek field increased .045, lower facial plane rounded in profile by a smooth 6% field, box corners softened by 12%. Original head families remain distinct.
- Neck measurement .073 × body scale for adults/elders/teens, .065 for children, versus .055 in classic; shoulders/garment width increased 4.5%. Total height, head radius and hand size retained. The same measurements drive collars, sleeves, animation, seats and prop reach.
- Hair crown volumes gain a restrained unequal 0–2.6% mass field; bald/horseshoe/buzz identities remain unchanged. No new mesh or texture assets imported.
- `avatar-creator/identity-review.html`: Johansson, Thuan, Tetsu (stable Tetsuo key), Grandmother Higa and Mai; front, quarter, profile and full body; neutral, smile, surprise, walk, sit, hold tea and sip tea; exact-time seeking and playback. Identical lighting, projection scale and unchanged materials on both sides. Tea for every age.
- Baseline recipes, measurement and geometry hashes; reproducible frozen-source capture, comparative sheets and looping motion previews.

The study adjusts construction and existing clothing fit. New clothing designs, new facial drawing families, a complete hair redesign and a new creator interface are **not implemented**.

## Evidence and reproduction

[Evidence directory](qa/identity-v1/README.md). Files `review-0.jpg` through `review-4.jpg`: current on left, study on right, views in front/quarter/profile/full-body order. `performance-*` covers expressions, seat and hold. `motion-*` loops walking above and tea sipping below. Actual Studio desktop/390×844 UI captures are included. All renders are software Chromium/SwiftShader, not physical-device acceptance.

From the repository root with dependencies installed in `johansson-town`:

```sh
CHROMIUM_PATH=/path/to/chrome-headless-shell node avatar-creator/tests/identity-review.browser.mjs
python avatar-creator/tests/identity-sheets.py
node --test johansson-town/tests/storybook-style.test.mjs johansson-town/tests/avatar-customization.test.mjs johansson-town/tests/avatar-silhouette.test.mjs johansson-town/tests/drink-grip.test.mjs
```

The browser runner archives the exact baseline's `src` and `vendor` into a temporary directory and uses the same review harness for both builds. It removes that directory afterwards. Raw PNG intermediates are ignored by git; curated sheets, motion previews, report and baseline fixtures are retained. Pillow and DejaVu Sans are needed for the sheets. `PLAYWRIGHT_PACKAGE` can point at an installed dependency package when dependencies are outside this checkout.

## Checks actually performed

- 22 focused Node tests passed. The refined 11-test prototype suite also passed with explicit seat-surface and tea-rim/lip checks. Classic geometry/measurements match frozen main for all five; original recipe input and encode/decode round trips are unchanged; bone names/order/parents are retained; motion matrices remain finite.
- 20 of 20 frozen-main left-hand render comparisons are pixel-identical. Seeded out-of-order timeline seeking returns identical pixels.
- All five characters rendered in four requested views; smile/surprise/sit/hold captured; 12 samples each of walking and sipping captured and inspected as temporal contact sheets; looping GIFs prepared for owner playback. Full-speed owner movement review remains pending.
- Review page at 390×844 has no horizontal overflow; labelled keyboard character selection passes. Actual unchanged Studio loaded at desktop and phone sizes without page errors. This does not establish a complete accessibility audit.
- Runtime build and three runtime-package tests passed on the initial baseline. A delivery rebuild against newer main 125255c3 and all three runtime-package checks also passed.
- Initial 64-file local CI guard failed because the sparse checkout omitted model/guide/art fixtures and the geometry scan exhausted Node's default heap. Missing fixtures were fetched; targeted recheck with 6 GB heap passed 45 tests including boot, drinking rig/simulator, izakaya bar, compact interiors, no-z-fighting, Sakura bench and merchandising. This is not a claim that the entire guard was rerun green. The additional 12-test back-bar recheck also passed. Remote CI remains required.

## Visual findings and limits

The direction preserves identity and is deliberately subtle. Necks remain visibly cylindrical, upper sleeves have a rounded puff, hair is still built from the existing masses, and some profile ears/sideburns and sculpted noses remain faceted. These are visible in the baseline too; do not call the characters publication-ready. The prototype is not a complete contact/collision certificate for every outfit, pose and prop. Existing mittens remain; no new hand geometry is included.

## Hands: owner wording, not assistant assumptions

PR [#301](https://github.com/nj22az/nj22az.github.io/pull/301) remains open and contains rejected experimental five-digit geometry. It was not merged or copied. The latest retrieved owner wording was 21 October 06:44 UTC: hands similar in broad cartoon shape to Peter Griffin's, **“but 4 fingers”**. Later “four fingers plus a thumb / five total” statements were assistant interpretations, not an explicit owner clarification. The exact intended total therefore remains unresolved. **Before the next hand-modelling stage, obtain an explicit choice between four total digits (three fingers + thumb) and five (four fingers + thumb).** Do not copy another character's hand asset or design. This does not block the present non-hand study.

## Release-readiness checklist

| Area | State | Next observable check |
| --- | --- | --- |
| Frozen visual baseline / five-character opt-in | Completed | Owner reviews sheets and moving previews |
| Cast-wide visual approval and rollout | Unverified | Obtain owner direction; no default switch before it |
| Classic recipes / unchanged default geometry | Completed for five fixtures | Expand legacy scene, World-save and GLB round trips before rollout |
| Prototype seat and measured rim/lip contact | Completed for five fixtures | Full wardrobe/pose contact sweep and continuous playback |
| Hand redesign | Failed prior prototype; deferred here | Resolve digit total, then new palm/back/side milestone |
| New face, hair and wardrobe families | Proposed | Independently authored art, fit and expression review |
| Appearance Undo/Redo, locks, selective randomisation | Proposed | Transactional edit and keyboard/phone tests |
| Named character library, duplicate/reopen/export | Proposed | Durable save/import/export round trips and failure cases |
| Keyboard/responsive interface | Partial | Review page checked; full creator audit outstanding |
| Desktop/mobile performance | Unverified | Measure physical desktop/iPhone/iPad; software timings are unsuitable |
| Main Studio load failure/recovery | Unverified | WebGL failure and retry flow; review page has explicit failure text |
| Asset provenance/licences | Partial inventory below | Trace all shipped part families and dependencies |
| Branding and legal review | Unverified | Qualified games/IP solicitor reviews actual shipped art/UI and intended markets |

## Provenance notes

New shape fields, review interface and tea geometry are authored in this change; no Nintendo assets, traced parts, fonts or sounds were imported. Existing face drawings, hair meshes, clothes, icons, shaders and dependencies are retained, **not newly cleared**. Baseline recipes come from the shared cast/looks sources. Three.js remains under its existing notice. Contact-sheet lettering uses installed DejaVu Sans solely in evidence pictures. Preserve the truthful APK research record and existing third-party notices; this task does not erase or reclassify them.

A qualified IP solicitor should review the actual silhouette/face/hair library, creator interface and branding; the origin and licence trail of every shipped family; the recorded research history; and rights in the intended commercial markets. No Nintendo clearance or legal safety is claimed from altered proportions, names or outlines.

## Next actions

1. Owner compares the five sheets and moving previews; decide whether to keep, reduce or revise these proportions.
2. Resolve total hand digit count before modelling hands. Keep #301 rejected.
3. If the direction is approved, improve neck/shoulder transitions and author a small original face/hair/garment family, then repeat contact and expression review.
4. Implement creator history/locks and character-library round trips in separate reviewable stages. Preserve old recipes and add an explicit persisted appearance version only when rollout semantics are approved.
5. Complete remote guard, physical-device performance/accessibility, GLB/scene/save compatibility, provenance and solicitor review before commercial release.
