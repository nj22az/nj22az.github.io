# Sakura stair entrance handover — 22 October 2026

## Scope and review state

Owner requested the P1 Sakura stockroom correction from documentation PR #349, preserving the 20 October inside-only non-traversable stair/fade decision. Work is on `codex/sakura-stair-entrance`, based on main `a0fb347ced9250b2e5a6210ba068bf595a7ca310`. Review: [draft PR #364](https://github.com/nj22az/nj22az.github.io/pull/364), implementation/review commit `602f66f539c13edc49c7b3609c98759a416a47c5`. Proposed only; do not merge before the owner reviews the before/after pictures. Nothing is deployed or released.

Repository instructions, current root index, 22 October morning/afternoon handovers and their 21 October references were read. PR #349 remains an open documentation-only plan; its fighting, banner, dock and residential work is separate. No existing Sakura repair PR was found at the start. Main was rechecked and remained at the base above.

## Correction

The three original black boxes reached 6.81 m above the stockroom. The former two-flight ceiling aperture exposed them as a black wall and roof-like slab. `src/world/interiors/sakura-stairs.js` now encloses the former alcove in plaster, closes that ceiling opening with a soffit at 2.98 m, and provides timber linings around a 1.1 m wide entrance with a 2.35 m head. One black volume begins 1.13 m behind the opening and ends below 2.84 m. The five visible treads, walk/fade path, timing, trigger boxes, prompt, return arrival, office stair head, inside-only office access and fire escape are retained.

Walls, trim and soffit have colliders; player-radius reachability and ray tests cover the recess. The old visibility assertion required black beyond the treads even when looking at the ceiling; it now admits the newly required soffit, while still rejecting open sky and exposed non-dark geometry beyond the recess. New side/high rays require real wall/lintel and a frontal ray still requires darkness. The z-fighting scanner passes without altered tolerance or exclusions. No ground plan or baseline was changed.

Source stair blob: `712fad96930f68ae125078807ace90feb3db9c93`. Rebuilt runtime source SHA-256: `eab03861ea7a9ebd110e1d75ffb5bdd696bb8c32175dbc9b1bdd845bbd33ab4a`. Generated runtime/index/cache changes are included.

## Evidence

[QA record and before/after pictures](../docs/qa/sakura-entrance/README.md). Actual game through the audit API, required 390×844 viewport, plus 1280×800 and 844×390. The owner's IMG_8651.jpeg was inspected; its camera/build were not recorded, so the stockroom aisle is reconstructed, not claimed as an exact original viewpoint. The four comparison pairs use identical cameras, sunny weather, fresh storage, web edition and town minute 424100 (22 October, 12:20). Reports preserve coordinates and mode.

`tools/sakura-entrance-photos.mjs` is reproducible. It verifies prompt up/down and automatic walk-trigger up/down, fade activation, correct rooms/positions, collision-free arrivals and clear camera positions. The rebuilt runtime was checked in third person (`after/report.json`) and first person (`first-person/report.json`), each with zero page errors. Screenshots were inspected. Software Chromium/SwiftShader is not physical iPhone Safari acceptance. No native Linux package is claimed tested or released.

## Checks

- `npm run build:runtime`: passed.
- `node --test tests/sakura-stairs.test.mjs`: 6 passed.
- Focused upstairs, enterable-sites and ground-standard checks passed; ground baseline stays empty.
- `NODE_OPTIONS=--max-old-space-size=6144 node --test tests/no-z-fighting.test.mjs`: 13 passed.
- Rebuilt-runtime first-/third-person round trips: 8 transition checks passed (prompt and automatic, up/down, in each view mode).
- Full CI guard: **347 passed, 0 failed, 64 files**, 177 seconds. Runtime-package: **3 passed**. Full outputs are in the QA directory.
- `git diff --check`: passed.

## Next

Draft PR #364 is submitted with screenshots and passing local test evidence. Owner visual review follows; do not merge on the strength of automated checks alone. Physical iPhone Safari and installed Linux acceptance remain unverified. Unrelated quality recovery stays in its own work.

## Integration update — 22 October 2026, Europe/Copenhagen

The owner requested “Fix it” after the next-priority review. The original stair source, regression tests and QA evidence have been applied to current main `a0704ef99e552405acad0d440b5162743d43dcfe` in an isolated worktree. The runtime has been rebuilt from the combined current source, preserving peaceful gameplay, Look picker and Free camera. Historical test counts and screenshots above describe the earlier candidate, not this integration.

Local Chromium is absent and its download returned invalid ZIP data. A narrowly scoped GitHub Actions visual check now runs the existing actual-game stair harness in first and third person and uploads its screenshots and round-trip reports. Current-main acceptance is pending; no fresh device or installed Linux release is claimed.

### Current-main refresh

Main advanced during verification to `0ee177da830a1419efe4f1b1d89a482139124410` (four additional Looks and Natural on each launch). Those source, tests and generated baseline changes were retained and the stair runtime rebuilt again. The first integration passed 31 focused checks and the full guard (371 tests, 70 files, 184 seconds). The refreshed candidate is undergoing the same full guard. The earlier screenshots remain historical; fresh CI capture is required before final acceptance.

## Engineering handover — 22 October 2026 (Europe/Copenhagen)

Repair delivered on PR #364, branch `codex/sakura-stair-entrance`; tested integration commit `977f11963da40b476642a6e022c0c261c574737a`, with main `0ee177da830a1419efe4f1b1d89a482139124410` retained. Runtime source SHA-256: `43aff388233a442a87816fc7c0c6890e80525a883c1790a1a28885d261fc84f6`. The newest Look styles and Natural-on-launch decision, peaceful gameplay and Free camera remain intact. No stair transition or trigger changes were introduced.

Completed checks:
- First integration: 31 focused checks passed (stairs, runtime package, enterable sites, ground standard and z-fighting).
- Refreshed integration: full local guard **372 passed, 0 failed, 70 files**, 171 seconds.
- GitHub guard on the refreshed integration: **372 passed, 0 failed, 70 files**, 178 seconds: [run 39862259521](https://github.com/nj22az/nj22az.github.io/actions/runs/39862259521).
- First integrated actual-game capture completed both view modes and all eight prompt/walking up/down transitions, with zero page errors and clear arrival/player cameras. [Artifact 12462800596](https://github.com/nj22az/nj22az.github.io/actions/runs/39861574708/artifacts/12462800596). Its workflow was subsequently marked cancelled when the newer main integration was submitted; both complete JSON reports and screenshots were downloaded and inspected. Tested merge tree `6f2c49a17eeb655bf9684500c3e8bfd1390868e1`, revision `6e65bfdb451d64a6ca61ad178a0acb0afbe218a5`, predates the extra Look styles. It is not claimed as fresh validation of those later styles.
- Latest dedicated visual check [39862259537](https://github.com/nj22az/nj22az.github.io/actions/runs/39862259537) and Linux candidate acceptance [39862259564](https://github.com/nj22az/nj22az.github.io/actions/runs/39862259564) were still installing browser/build dependencies at handover; no result claimed. A subsequent documentation-only commit may restart those PR checks; the runtime hash above identifies the tested game.
- Diff whitespace check passed. Ground baseline stays empty.

**Implementation and source checks complete; visual owner acceptance and merge remain outstanding.** The owner requested the fix but has not expressly accepted the before/after appearance. Preserve the repository's visual-review rule: “Visual changes merge only after the owner has seen before/after photos” (21 October morning handover), and merge on the owner's word with the GitHub guard green (evening handover). PR remains open and is not deployed. No new Linux release, physical iPhone Safari or physical Steam Deck acceptance is claimed.

Next: review the linked comparison and current CI images; resolve any capture/check failure; merge after owner acceptance, preserving newer main work and rebuilding again if source changes. Linux 0.2.17 remains the published version; any future release must use a new version.
