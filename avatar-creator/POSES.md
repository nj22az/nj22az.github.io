# Shared body posing — first release

The optional five-digit extension is documented in [HANDS.md](HANDS.md).

World's **Photo studio → Cast → Pose** and Johansson Studio's **Edit character → Pose** use `johansson-town/src/avatars/pose.js` and the same `pose-panel.js`. World's appearance editing still belongs to Studio; normal gameplay and resident routines do not receive a held photograph pose.

Choose a base pose, hold a moment, then adjust the head, torso or either arm. Each wrist has bend, turn and tilt; Mirror arm edits applies arm changes to both sides. Sliders are bounded **offsets from the held pose**, not absolute anatomical joint angles. Holding stops body animation; Return to animation, a new base pose, imported-motion playback or starting acting capture releases manual control. Manual posing during imported playback stops that take. Undo/redo is separate from appearance edits and groups a continuous slider drag into one edit. Reset adjustments preserves the held base; Return to animation releases it.

Save pose downloads `johansson.pose.json`. Open pose accepts the same versioned format in World and Studio. It stores existing bone rotations/scales, a root-height fraction and the adjustment values; it does not contain a character recipe or replace the target's bone lengths, world position or facing. Unknown joints are ignored, invalid transforms rejected, offsets clamped, and imports limited to 32 KB. Character files remain unchanged. Studio's Use in scene carries the custom pose; scene/project files retain it. Selecting another scene pose or furniture placement releases it. Captured scene acting takes precedence over a custom pose.

PNG exports use the displayed held pose. The later hand extension adds a separate Export posed GLB action in Studio. Existing T-pose and animated GLB exports retain their established behaviour: neither bakes the manual adjustment layer. There is no automatic collision/contact solving; inspect extreme arm combinations and different proportions before final use. Reusing a crouched or seated pose on another body retains a proportional root-height offset, not automatic furniture contact.

## Validation

- `node --test johansson-town/tests/pose.test.mjs`: actual avatar rigs, zero-offset identity, 1,000 repeated applications without drift, target proportions and appearance, malformed files, undo/redo and old/new scene snapshots.
- `POSE_CHROME=/path/to/chromium node avatar-creator/tests/pose.browser.mjs`: a self-contained server, shared creator, freeze/PNG consistency, undo/redo, file round trips and errors, appearance rebuilds, animation ownership, actual Studio scene handoff, native World Photo Studio and desktop/phone screenshots. `POSE_EVIDENCE` changes the default `/tmp/avatar-pose-evidence` output folder.
- Run the existing motion, performance, scene and avatar checks, then `npm run build:runtime` and `node --test tests/runtime-package.test.mjs` in `johansson-town/`.

A software Chromium view is not physical iPhone/iPad Safari or full-game navigation approval.

## Hand-stage design — owner's preference, 21 October 2026

Use bare, skin-coloured hands with **four fingers plus a thumb** (five digits). Preserve the rounded Johansson style, with no gloves, cuffs or decorative glove markings. The owner's cartoon-hand HTML is a reference for curl, spread, wrist controls and gesture presets, not a replacement renderer, mesh hierarchy or dependency version. Begin with a few readable gestures, then assess articulated fingers, skeleton/export compatibility and mobile cost separately. The body-pose release introduced no finger bones or geometry; HANDS.md describes the subsequent opt-in implementation.
