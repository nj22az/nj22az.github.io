# Optional bare five-digit hands — experimental

**Visual review failed.** The current geometry and handedness have not been accepted. This document describes the existing prototype, not a finished asset. See [the dedicated hand project](HAND-DESIGN-PROJECT.md) for the research, replacement design and acceptance stages, including authored thumbs up and thumbs down.

The shared pose panel now offers **Left hand** and **Right hand**. Choose a gesture or enable **Articulated bare hands** to use the new geometry. Both hands have four fingers (index, middle, ring and little) plus a thumb. Their colour comes from the character's skin; there are no gloves, cuffs or glove markings.

Presets: relaxed, open, fist, point, peace and thumb extended. Each digit has an independent curl slider, with a separate spread control. Wrist bend, turn and tilt remain in the arm controls. “Thumb extended” describes the hand shape; use the wrist/body controls to orient it upward. Undo/redo and pose files include the hand settings. Disabling the option restores the original hand geometry.

World's native Photo Studio and Studio's character editor use the same controls and pose format. Studio scenes retain the configuration. This is an explicit preview/scene option; normal gameplay avatars and saved character appearance recipes remain unchanged.

## Rig and geometry

`avatars/hands.js` defines 28 additional joints: three per non-thumb finger and two per thumb, on each hand. They are appended only when `buildAvatar(...,{articulatedHands:true})` is requested. Every existing bone name/index and its rest position is preserved. Default avatars retain their original 28-joint skeleton and geometry.

The new palm and fingers are skin-coloured geometry inside the existing skinned body mesh and outline, with no additional draw call. The revised palm is a flattened taper from wrist to knuckles, rather than a sphere. Fingers taper into rounded tips and blend weights at their roots and joints. Thumb opposition carries a curled thumb across the fingers. Only the optional articulated version tapers the forearm at the wrist, preventing its old rounded end from obscuring the palm. Fine digits use a smaller outline than the body. The same hand geometry is used by the ordinary, sailor, shopping-lane, swim, towel and after-bath preview outfits.

Hand poses set local finger rotations directly, without accumulating offsets or taking ownership of the wrist. Studio can resume body/imported motion with the selected static hand configuration. This release provides the rig and gesture controls, not a finger-keyframe timeline, procedural finger-roll loops, automatic imported finger tracking, or automatic object grips. Fingers can intersect the palm or a prop in extreme combinations; review close work before final use.

## Files and export

Existing version-1 pose files remain accepted. New files use the same format with an optional validated `hands` field. Old loaders can ignore that optional field. Hand settings are independent of the appearance recipe and portable between World and Studio.

Studio's **Export posed GLB** exports the held body pose and enabled finger joints as an editable static rig. The 56-joint result was loaded again through the vendored GLTFLoader and checked against the selected ring-finger angle. Existing T-pose and animated body-GLB exports retain their established behaviour; the animated export does not include the optional hand configuration or finger tracks. World Photo Studio saves the portable pose and PNG; 3D asset export belongs to Studio.

## Validation

- `node --test johansson-town/tests/hands.test.mjs`: optional skeleton/index stability, five digits, bounded geometry, finite skin weights, independent finger controls, repeated application, old/new pose files and clothing variants.
- `POSE_CHROME=/path/to/chromium node avatar-creator/tests/hands.browser.mjs`: controls, undo/redo, original-hand fallback, pose transfer, static GLB export/load, Studio scenes, World photo controls, device layouts and diagnostic gesture close-ups.
- Existing body-pose browser checks, avatar/motion/scene/performance tests, full runtime build and runtime-package verification.

Screenshots and exact verification notes are in `johansson-town/docs/qa/bare-hands/`. Software Chromium is not physical iPhone/iPad Safari or full-game navigation approval.
