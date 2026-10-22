# Johansson hand redesign handover — 22 October 2026

## Latest owner decisions

- **Five digits total** per hand: four fingers and one thumb. This explicitly resolves the earlier “four fingers” ambiguity and supersedes “unresolved” wording on identity PR #357's older handover/body.
- The owner rejected the new Thuan hand screenshots and requested a plan informed by Pixar, Disney animation, The Simpsons, Family Guy and anime. The procedural Thuan prototype is **rejected**, not awaiting ordinary approval. Stop developing that mesh as the production solution.
- Rejected experimental PR #301 must not be merged. No new five-digit hand geometry has been merged or approved in this task.

## Delivered work

[Research and staged replacement plan](HAND-REDESIGN-RESEARCH-2026-10-22.md), with ten source/access records, a diagnosis of the failed renders, an original five-digit construction specification, eight staged gates, creator/World/save/export constraints, contact and visual acceptance, provisional performance targets, provenance and legal limits.

Recommended method: original design sheets → owner direction → artist-authored clay hand/forearm → model acceptance → rig/corrective deformation → physical contacts → Thuan performance → shared integration → representative cast/device/release review. More controls or triangles do not substitute for approved anatomy. The next proposed deliverable is two hand designs attached to Thuan's forearm; no new replacement mesh is implemented by this planning change.

The plan distinguishes documented production facts from our recommendations. Pixar surface deformation and Disney collaborative rigging are verified from first-party pages; the full Inside Out 2 paper could not be retrieved (redirect/403), so proprietary rig details are not claimed. Simpsons/Family Guy 2D references are not represented as disclosed 3D rigs. Ui Shigure's illustration lesson is named and is not described as a universal anime production method. See the access record for the uninspected handbook/full videos.

## Branch, PR and repository state

Planning branch: `codex/johansson-hand-redesign-plan`, based on freshly verified main `0f4b7c7e69082283f6f8ef9719a01b5ea0904df9` (PR #359, Higa bench). Root/World instructions are unchanged from the initial read. This delivery contains **documentation and one clearly labelled rejected-evidence image only**, no source/runtime modifications. Delivery: [draft PR #360](https://github.com/nj22az/nj22az.github.io/pull/360), planning/evidence commit `534565cebd698851a3a6b37ee6e73def07efaa6d`. No source/runtime implementation is delivered. The following documentation commit records these identifiers.

Earlier identity work remains separate: [PR #357](https://github.com/nj22az/nj22az.github.io/pull/357), head `9a6feee0d0aafb9b2db821d1f6ab3e69f146a0f2`, open/draft/unmerged, now conflicting. Its v2 shapes are not owner-approved cast defaults. Audit [PR #355](https://github.com/nj22az/nj22az.github.io/pull/355) is a separate proposal document. Body-pose PR #300 was open/unmerged/conflicting at the initial inspection; hand PR #301 open/unmerged/rejected. Do not merge them as part of this plan.

## Rejected local prototype: preserve, do not publish

Local worktree `/dev/shm/thuan-portrait`, branch `codex/thuan-five-digit-portrait`, starts at `d66daa0c4ec660920281bed0bcf07171b24c8106`. Its code, generated runtime, screenshots, animated samples and staged changes remain local and uncommitted; the local portrait handover is now prominently marked REJECTED. Do not reset/delete another session's changes or push that staged implementation as the accepted hand project.

A remote branch of that name was created at d66daa0 before rejection. Blob uploads were interrupted; no completed implementation tree/commit/ref update or prototype PR was created. Unreferenced uploaded objects do not constitute an accepted delivery. This planning branch does not import the rejected source. [Failure evidence](qa/hand-redesign/rejected-prototype.jpg) is retained only to explain the replacement requirements.

Historical checks on the rejected prototype: 15 focused rig/customisation/drink/runtime tests passed; browser renders, exact-time seeks and phone overflow checks passed; MP4 was 60 frames/5 seconds/12 fps. These are explicitly **not aesthetic acceptance**. The 64-file full local guard had 332 passes and one failed `no-z-fighting.test.mjs` process. Its isolated recheck also failed without an assertion report. Cause is unestablished; do not call this a green suite or assert a memory cause without evidence. Physical-device performance, full collision continuity and finger save/export acceptance were not verified.

## Validation and next actions

Planning change: source/access records checked; Markdown paths and rejected-evidence target checked; only intended four files are included in the planning tree. No new runtime/geometry/animation code is delivered, so gameplay tests were not rerun for this documentation-only change.

1. Review/design two original compact/tapered five-digit hand sheets on Thuan; approve proportions before modelling.
2. Build and review the clay model and wrist connection on both sides, all angles. If the modelling cannot meet the visual standard, obtain character-artist assistance rather than ship another procedural approximation.
3. Continue through the plan's separate rig, contact and performance gates, retaining one shared engine and old saves.
4. Keep the release checklist current; verify actual motion, device performance, export round trips and provenance before publication. Owner review remains required before applying the direction across the cast.
