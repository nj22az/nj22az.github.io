# Coordinated attention — prototype specification, 25 October 2026

Owner instruction: proceed with an independently implemented eye, neck and body
attention improvement. Target: the existing cartoon rig, not replacement geometry.

## Behaviour specified before implementation

| Part | Intended behaviour / limit |
| --- | --- |
| Eyes | Acknowledge a valid target first; settle towards the remaining angle after head movement. Maximum eye offset represents 24° horizontal / 18° vertical. |
| Neck | Begins after 0.10 s; at most 32° horizontal. |
| Head | At most 22° additional horizontal turn. Combined vertical correction: 26° up / 22° down. |
| Chest | Helps only on a large turn, after 0.28 s; at most 8°. Walking, driving, carrying, restocking and hand tasks retain the torso. |
| Whole body | Free residents in a player conversation begin turning after 0.28 s. Occupied residents retain their existing body direction. |
| Reach | Fade for a target behind the body (100–138°), nearer than 0.36 m, or further than 6 m; no attention at ≤0.18 m or ≥7 m. |
| Origin | Current head centre transformed through the actual skeleton and parents; seated height is never assumed to equal standing height. |
| Priority | Sleeping, lying, explicit performance poses, consumption and head/hand contact take precedence. Explicit eye directions keep their existing priority. |
| Release | Ease joints and eyes to neutral. Invalid/non-finite target input must not contaminate the skeleton. |

Opt-in on `development`: `?attention-rig`; `?attention-rig=0` retains the previous
controller. No new bones, meshes, textures or persistent save fields.

## Provenance

The earlier repository assessment inspected selected files in `doldecomp/sms`.
This is therefore **not** described as a formal clean-room process. This prototype
is written from the above Johansson behaviour requirements, our existing rig and
standard vector/quaternion/interpolation mathematics. No source, constants,
identifiers, assets or dependencies from that repository are imported or translated.
This note records implementation provenance; it is not legal clearance of the game.

## Acceptance

Check eye-before-neck-before-body timing; bounded movement; seated and standing
partners of different heights; rotated/transformed parents; behind/near/far/invalid
targets; frame-rate variation; release; consumption, task and explicit pose priority;
painted and rigged eyes; unchanged normal URL behaviour. Run focused regressions,
rebuild runtime, run the World guard and inspect an animated browser review.
