# Johansson hand project: research and acceptance brief

21 October 2026. Status: research and baseline audit complete; replacement modelling and animation not complete. PR #301 is an experimental rig, not an accepted character asset. The owner rejected both the isolated hands and the Johansson peace-sign portrait, including its handedness. Passing the existing tests does not change that judgement.

## Objective and fixed requirements

Design hands that belong to the established Johansson avatar. Use the same asset, rig and gesture definitions in Studio and World. Retain four fingers plus a thumb, bare skin matched to the character, and the existing rounded, cel-shaded character language. No gloves, cuffs, realistic tendons or dense decorative detail. Judge proportions against the complete avatar before judging a close-up.

Required gestures: relaxed, open/wave, peace, pointing, fist, holding, thumbs up and thumbs down. Each must work on the character's left and right hands. A thumb merely extended from a generic fist is not an accepted thumbs-up gesture; the complete hand, wrist and forearm must convey the direction.

## What the research establishes

These sources support principles, not a claim that one universal cartoon/anime hand rig exists. They do not document Nintendo's internal skeletons or establish that Nintendo swaps hand meshes.

| Primary source | Finding | Johansson design decision |
| --- | --- | --- |
| Stan Prokopenko, *Drawing Cartoon Hands*, published by Clip Studio | Stylisation builds on palm structure, thumb mass and anatomy; exaggeration is chosen for the character and gesture. Anime styles vary and can simplify surface detail while retaining structure. | Develop an original compact five-digit hand from the avatar's shape language. Do not reuse the reference glove or substitute thin realistic fingers. |
| Ui Shigure / Palmie, *How to Draw a Variety of Hands*, published by Clip Studio | Treat thumb, thumb base, four fingers and palm as distinct moving forms. Knuckle placement and the different behaviour of the thumb matter. | Model thumb opposition and the knuckle arc explicitly. Give the thumb its own control behaviour rather than another finger curl. |
| Prokopenko, *Drawing a Perfect Fist* | A fist has an organised overall volume; fingers converge and the ring/little fingers fold differently. | Author the closed fist and curled fingers of peace/thumb gestures deliberately; equal joint angles on four parallel tubes are insufficient. |
| Nathaniel Seymour / Animation Mentor, *How to Animate Hand Gestures* | Use acting reference, clear silhouettes, varied finger timing, wrist changes and upper-body coordination. | Review the arm-to-hand performance as a unit. Block gestures before polishing motion; fingers should not all start and stop together. |
| Arc System Works, Motomura's *Guilty Gear Xrd* art presentation | Its creators describe a deliberately developed 3D treatment intended to retain a drawn 2D appearance. | Use it as a production-method reference for deliberate art direction, not as a hand asset or a claim about its undisclosed hand rig. The linked slide PDF was unavailable during this research, so its detailed techniques have not been verified here. |

Sources reviewed:
- https://www.clipstudio.net/how-to-draw/archives/156336
- https://tips.clip-studio.com/en-us/articles/1338
- https://www.proko.com/course-lesson/drawing-a-perfect-fist-hands-in-action/
- https://www.animationmentor.com/blog/tutorial-how-to-animate-hand-gestures/
- https://www.arcsystemworks.com/guilty-gear-xrds-art-style-the-x-factor-between-2d-and-3d-talk-from-gdc-2015-is-now-available-online/

## Baseline failures in this repository

1. **Connected appearance is missing.** `avatars/hands.js` merges a palm, thumb pad and five independent digit surfaces into one draw call. Merging geometries is not stitching their surfaces. Finger roots and the wrist still depend on overlap. The thumb pad can look pasted on.
2. **Handedness has no acceptance test.** The current suite verifies five names and stable indices, not the relationship between palm direction, thumb side, finger order and the character's anatomical side. The owner's rejected portrait is baseline failure evidence, not a reference to match.
3. **The silhouette does not belong to the avatar yet.** The narrow palm, thin extended fingers, curled cylinders and large forearm outline do not form a coherent shape at normal viewing size. Smaller per-part ink values disguise some joins but do not fix the model.
4. **The wrist patch is incomplete.** The optional arm's end radius was reduced from `.86 * armR` to `.45 * armR` without a designed common attachment surface. `limb()` retains its lathe normals after tapering; the redesigned attachment needs a normals review as well as a silhouette review.
5. **The pose system is too crude.** Curl applies fixed rotations to every segment. A fist needs palm cupping, finger convergence and thumb opposition. Current `thumbsUp` is documented as only a thumb-extended shape; there is no authored thumbs-down performance.
6. **The body gesture and fingers are separate.** `animate.js`'s existing `Peace` was written around the old hands. Applying a new finger shape does not establish correct wrist orientation or a convincing complete pose. The last portrait used an additional wrist-orientation override; that is not proof that the Studio preset works correctly without intervention.
7. **Validation omitted the important failures.** The tests establish control, persistence and export behaviour. They do not establish attractive proportions, correct anatomy, a seamless wrist, non-intersecting curled fingers or believable moving gestures.

## Chosen engineering direction

Build an authored, connected hand surface with sufficient topology at the thumb web, knuckles and wrist. Design the lower forearm and attachment with it. It can be generated from authored control points in the existing Three.js builder or authored externally and converted to repository-owned geometry; the asset's topology and visual result decide which route is accepted. Do not adopt another overlapping-capsule assembly as the final asset.

Use a canonical hand coordinate frame and explicit anatomical landmarks: wrist centre, palm normal, index-side edge, little-finger edge, thumb base and finger joints. Document its relationship to the existing avatar's local coordinates, default root rotation and Studio display rotation. Mirror geometry with correct winding and corresponding joint axes; do not repair handedness by swapping bone labels or turning a wrongly built hand towards a convenient camera.

Use skeletal posing for the fingers and wrist. Evaluate corrective shapes for thumb opposition, palm cupping and knuckle volume where weights alone fail. This is a proposed implementation, not a feature already supplied by the prototype. Preserve the existing body-bone contracts; any additional joint or pose-format change requires explicit compatibility handling. Keep the working UI, history, pose-file and GLB plumbing where it remains suitable.

## Delivery stages and exit checks

| Stage | Deliverable | Required evidence before proceeding |
| --- | --- | --- |
| 1. Shape and handedness | Both hands attached to Johansson; relaxed/open reference poses, palm/back/side turnarounds | Correct anatomical side and thumb direction in labelled views; coherent palm, finger, wrist and arm proportions at full-body and portrait scale. No cosmetic camera correction concealing a fault. |
| 2. Topology and deformation | Connected hand/attachment with rig and weights | Wireframe and shaded views; no exposed holes or root detachments, consistent normals/winding, sensible bends and preserved knuckle/thumb volume. Checks use anatomical landmarks as well as bone names. |
| 3. Authored gesture set | All eight required gestures on each hand | Complete-avatar sheets plus palm/back/side close-ups. Peace has two readable extended fingers; folded fingers and thumb form believable masses. Up/down thumbs remain clearly directional. |
| 4. Moving performance | Relaxed-to-wave, peace, thumbs up and thumbs down, including return to rest | Reproducible moving clips and sampled transition frames; arcs, anticipation and staggered finger timing; no sudden flips, volume collapse or visible intersections. |
| 5. Cast fit | Shared asset across adults, children, elders, body builds/proportions and outfits | Same camera and lighting for comparisons; no sleeve gaps, oversized wrists or lost gesture readability. Check Johansson, Thuan and Vy first, then the full recipe range. |
| 6. Shared integration | Studio and World use the accepted definitions | UI-to-render comparison, save/load, undo/redo, scene persistence, still/animated export as actually supported, runtime packaging and measured device cost. Preserve default avatars until replacement passes. |

Stage 1 is the next modelling milestone. No stage is marked complete solely because a script ran or screenshots were produced.

## Review protocol

For every shape revision render both hands on the same Johansson recipe, with fixed lighting and camera positions: front, both three-quarter views, back and hand side profiles. Include an unposed full-body comparison and ordinary gameplay-size views. Label left/right by the character's anatomy, not the viewer's side. Include palm/back identification so orientation is not guessed from thumb position alone.

For each key gesture retain the same views and a plain silhouette render. There must be no floating/thumb-pad appearance, exposed gaps at a finger root, wrist step resembling an attached part, accidental extra digits or curled-finger surfaces visibly passing through each other. Flag failures explicitly rather than selecting one flattering angle.

Start motion studies with an approximately two-second performance: preparation, action, readable hold and return. This is a proposed test brief, not a standard attributed to the sources. Sample the transition as well as its end pose; renderer frame rate and artistic pose timing are separate decisions. Use a deterministic `renderAt(t)` or equivalent baked timeline so the same time gives the same frame after seeking.

Extend automated checks with signed anatomical landmarks under wrist rotation, left/right mirror consistency, valid mesh normals/weights, attachment continuity and meaningful contact/deformation checks. Keep existing body/skeleton/export regressions. Record triangles, draw calls, build time and measured frame cost against the baseline; the existing vertex-count threshold is not evidence of device performance. Physical Safari and hardware measurements must be reported separately from software Chromium results.

## Current release status

Research and source inspection are complete for this brief. New connected geometry, correct handedness, authored thumbs up/down, corrective deformation and moving performance tests remain outstanding. The present hand asset is rejected for visual use and is not ready for merge. Do not describe its 40 earlier passing checks as visual approval. No gameplay or renderer changes are made by this research brief.
