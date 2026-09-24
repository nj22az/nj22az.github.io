# Minato Barfly: editable character and rig source

This folder is the reproducible Blender source for the permanent Minato regular. It builds a bespoke low-poly character from editable Blender geometry, rather than styling the shared male resident rig at runtime.

The design follows the resident profile: broad build, short salt-and-pepper hair, red patterned open-collar shirt, dark trousers and brass wristwatch. The scene includes a review stool, a beer prop and an orthographic lighting setup. Character height is 1.72 m.

## Build

Use Blender 4.x and run:

```sh
blender --background --factory-startup --python build_barfly.py -- --output ./out
```

The output directory contains:

- `minato-barfly.blend`: editable native source scene, rig, materials and review camera.
- `minato-barfly.glb`: skinned interchange asset with facial morph targets and named drink/sleep clips.
- `minato-barfly-review.png`: neutral presentation render.
- `minato-barfly-rig-audit.json`: machine-readable rig validation.

The same build and validation run on pull requests in GitHub Actions. The four outputs are retained as a downloadable Actions artifact so reviewers can open the native Blender file and inspect the interchange export without committing generated binaries.

## Rig controls

- Body: root, pelvis, spine, chest, neck, head, jaw, upper/lower arms, hands, thighs, shins and feet.
- Face: `Smile`, `Frown`, `JawOpen`, `Blink.L` and `Blink.R` shape keys; brow and eyelid bones on both sides; eye meshes also carry side-specific blink targets.
- Fingers: individual thumb (two segments) and index, middle, ring and pinky (three segments) bones on both hands, with each phalanx weighted to its matching bone.
- Animation clips: `Barfly_Drink_Loop` and `Barfly_Sleep_Loop`.

The Blender audit checks all expected bones, per-finger weights, facial targets and animation channels. Passing the audit confirms the rig controls exist and are attached to weighted meshes; it does not replace an artist's deformation review.

## Reviewer checklist

1. Inspect the PNG for silhouette, face, shirt print, watch and overall proportions.
2. Open the `.blend`; select `Barfly_Rig`, enter Pose Mode and test each hand/finger chain plus jaw, brows and eyelids.
3. In Object Data Properties on `Barfly_Head`, move each face shape key from 0 to 1 and check that it produces a visible, clean deformation. Test each eye's blink key as well.
4. Preview both NLA clips and confirm the drink hand reaches the prop while the sleep pose reads clearly.
5. Inspect the GLB in a glTF viewer and confirm its armature, skinning, morph targets and two animation clips survive export.

This PR delivers a reviewable character asset. It does not replace the live town character until the asset passes visual and in-game integration review.
