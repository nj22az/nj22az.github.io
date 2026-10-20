# Body animation: first integration

The shared avatar creator now has **Body animation** in its side panel. Johansson Studio uses the same panel and rig.

- **Try wave** plays an original three-second reference performance without an account, API, model download or GPU worker.
- **Open animation** accepts a Johansson `.motion.json` or a self-contained animated `.glb` (up to 32 MB). Choose a clip when the GLB has several. Up to 30 seconds is sampled at 30 Hz; files may have up to 32 clips and 4096 nodes.
- Supported sources have one native Johansson or Mixamo-style body skeleton. Several skinned meshes sharing the same joints, such as Thuan's braids, are one skeleton. Bone names, hierarchy and rest transforms still matter; this is not arbitrary automatic rigging.
- Playback transfers body rotations in place. The target keeps its own bone lengths, appearance and location. No root travel, fingers, foot locking, prop contact correction or captured facial animation is imported. Review each take before treating it as finished acting.
- **Save motion** downloads a portable JSON file. Motion is preview state, separate from the character design. **Export animated GLB** includes the current character and its body animation; normal T-pose export remains available. Facial expressions remain the existing static export metadata/morphs, not a baked talking performance.
- Body pose selection ends imported-motion playback. The existing performance freeze also freezes motion. Changing the character's appearance retains the selected motion, so it can be tried on another body.

## Commercial dependency boundary

`motion.js`, `motion-import.js` and `motion-panel.js` are original repository work governed by the repository's [LICENSE.md](../LICENSE.md). No Prompt2Rig source, models, weights, example characters or upstream animation assets are included. They use the existing vendored Three.js engine, loader and exporter under their existing MIT notices.

The new path does not run or redistribute GVHMR, SMPL-X, WiLoR, MANO or Ultralytics YOLO. Rewriting an adapter around those components would not remove their terms; removing the components avoids adding their restrictions to this feature. This is a bounded dependency finding, not a commercial clearance of every asset or feature in Studio. Imported character/motion rights remain those of the source.

Prompt2Rig's design was researched as a reference: <https://github.com/blendi-remade/prompt2rig>. Its full text-to-video/HQ workflow is not implemented here. Video-to-body tracking and generated motion require a separately reviewed backend or suitably licensed model; no API keys are exposed or services silently called.

Mesh Avatar Studio (<https://github.com/shinshin86/mesh-avatar-studio>) remains relevant to a separate 2D illustration-animation workflow. Studio already has credited facial-tracking adaptations under `acting/TRACKING-LICENSE`; preserve that MIT notice and the MediaPipe notices. Its sample character is not part of this integration. The current work does not claim `.mavatar` import or a new 2D editor.

The owner's further reference, [AITuber OnAir's Node Yukkuri Explainer](https://github.com/shinshin86/aituber-onair/tree/main/packages/core/examples/node-yukkuri-explainer), is a useful future **two-speaker explainer** backend: JSON conversations, per-speaker speech/subtitle styling, line timing, slide panels and deterministic 1080p/30-fps MP4 rendering. It uses four transparent PNG states per speaker, not a rigged 3D performer. Its best integration point is the script/audio/timeline/export layer, with Johansson's own characters and voice configuration. Code is MIT-licensed (preserve Yuki Shindo's notice if adapted); the sample's AquesTalkPlayer/AquesTalk voices and any replacement service have separate terms. The sine demo is tones, not speech. No part of that example, dependency or speech backend is installed by this PR, and arbitrary script generation is not provided by that example.

## Validation

Run `node --test johansson-town/tests/motion.test.mjs` from the repository root. It checks bind-aware transfer, parent rotation, target proportions, endpoint sampling, format validation and self-contained import restrictions.

A local verification using actual Thuan geometry, a real canvas implementation and the vendored GLB exporter/loader exported and reimported the wave: 91 samples, 4,389,768-byte GLB, maximum tested angular difference 0.000623 radians across seven sample times. This is a data round trip, not a browser/GPU visual approval.

Before publication, complete the full runtime build and its runtime-package tests, then visually inspect the live panel at desktop and phone/tablet sizes, the wave on several body proportions, source clips with substantial hip/arm motion, and the exported GLB in another viewer. This workspace lacked a browser executable and a full checkout/build toolchain, so those checks were not completed here.

The branch-scoped `studio-motion-terminal` workflow performs the focused tests, full build/runtime-package checks and browser smoke test in a complete checkout. It saves desktop/phone Studio screenshots, isolated terminal previews and a generated-runtime patch as review artifacts. The runtime patch must be applied before publication; generated files are not silently committed to the default branch.
