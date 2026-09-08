# Character candidates: acquisition record

Prepared 8 September 2026. These are interim low-poly, fully clothed, adult-proportioned models, not a claim of photorealism or period-specific Japanese identity. This record accompanies the selected optimised runtime exports.

## Selected official Quaternius packs

### Ultimate Modular Men (February 2022)

- Creator page: https://quaternius.com/packs/ultimatemodularcharacters.html
- Creator-linked public download folder: https://drive.google.com/drive/folders/1USAAquX2JJWuA2m6zol0KUkFe3UkZ8zX
- Individual glTF folder: https://drive.google.com/drive/folders/1qpSIycVWTwhKMgyA_bEFHPh1CfBBBa09
- Included licence: `quaternius-modular-LICENSE.txt`, downloaded directly from that folder's License.txt (file ID `1TTvylHa1CsiJuHFWWiv6PFGhLM-aAH5z`). It expressly identifies Ultimate Modular Males by Quaternius and dedicates the pack under CC0 1.0 Universal: https://creativecommons.org/publicdomain/zero/1.0/
- Worker.gltf original ID: `14d8n7IDnnlnGt_uiATnNg3uvi_4dyd9V`; binary packaging: `quaternius-worker.glb`.
- Suit.gltf original ID: `1NhXHnGU0zK9hBrT5FoZp8nTz_EmvTPg5`; binary packaging: `quaternius-suit.glb`.
- Casual_2.gltf original ID: `1Jn7kULNmrtqP8BUUL19h8MhbdOnwPFhv`; binary packaging: `quaternius-casual_2.glb`.

The GLBs package the original JSON and embedded buffer data without changing geometry, skinning or animation. All textures are absent; colours are material palettes. They need no decoder or remote request. `pack_glb.py` records the exact packaging procedure; `inspect-models.mjs` parses with the project's Three r170 GLTFLoader and samples Walk using AnimationMixer.

All three have embedded compatible clips: `Idle`, `Idle_Neutral`, `Walk`, `Run`, `Interact`, `Wave`, plus other unused combat clips. Each retains its own skeleton and clips; load a model then use those clips, rather than attaching legacy procedural parts. The root rig is `CharacterArmature`, with joint names `Root`, `Body`, `Hips`, `Abdomen`, `Torso`, `Chest`, `Neck`, `Head`, `Shoulder.L`, `UpperArm.L`, `LowerArm.L`, `Wrist.L`, `UpperLeg.L`, `LowerLeg.L`, `Foot.L` and mirrored `.R` joints plus finger joints. Use SkeletonUtils.clone for independent residents.

### Ultimate Modular Women (April 2022)

- Creator page: https://quaternius.com/packs/ultimatemodularwomen.html
- Creator-linked public download folder: https://drive.google.com/drive/folders/1720N9IGyQHXYvtvZJzazhxtTTlz-y2Vf
- Individual glTF folder: https://drive.google.com/drive/folders/1_FIjjIVE0SkQIrwgWJ3Q8NQku25ll5a2
- Included licence: `quaternius-modular-women-LICENSE.txt`, original `License.txt` file ID `1lIFL16xEpoPbr0j_HUATgmcEnAmYoIK2`, downloaded from the creator-linked folder. CC0 1.0 Universal.

- Casual.gltf original ID: `18b3WwlrwrFYWAM7BcnjWeIxKJyxAQiGh`; stored as `Female_Casual.gltf`; binary packaging: `quaternius-female_casual.glb`.
- Formal.gltf original ID: `1iayBzVv_zLjuPtaNPouw_auwKlQLLmes`; stored as `Female_Formal.gltf`; binary packaging: `quaternius-female_formal.glb`.

## Recommended town-ready exports

All five models face source local **+Z** with **+Y up**. For the current controller that faces local -Z, rotate the loaded model child by `Math.PI` about Y; keep the controller root and heading unchanged. Male Eye-material centroids were measured approximately +0.096 m in Z ahead of the Head joint in Idle_Neutral. The women use the same forward body/leg orientation.

Use `town-worker.glb`, `town-suit.glb`, `town-casual_2.glb`, `town-female_casual.glb`, `town-female_formal.glb`.

`optimize-models.mjs` performs the following offline preparation using Three r170 GLTFLoader, BufferGeometryUtils and GLTFExporter:

- Confirms identical world transforms, bind matrices, skeleton object/joint ordering and inverse-bind matrices before merging.
- Removes the male Suit's original Pistol accessory. No weapon mesh remains in the town export.
- Converts each original material's linear RGB palette to vertex colour, multiplying existing vertex colours where present. Every original part has opaque roughness 0.5/metalness 0 material with no texture maps, so a single matching material preserves appearance.
- Merges the body parts into one skinned mesh named `ResidentBody`, using one vertex-colour `TownPalette` material. This reduces each model from 9–13 draw calls to one (per ordinary render pass; shadow passes are additional).
- Preserves geometry, normals, skeleton and weights, and retains only the six relevant clips: `Idle`, `Idle_Neutral`, `Interact`, `Run`, `Walk`, `Wave`. No animation retargeting or rescaling is performed.
- Tests every triangle corner across those six clips at four time samples, plus a 50/50 idle-walk blended pose, comparing to the original separate parts. Maximum pre-export deformation error is exactly zero for all five models. Reloads each GLB and compares animated geometry again; maximum error is below 7e-9 metres.

`optimization-report.json` records exact sizes, hashes, triangle counts and validation results. These exports cost 1.11–1.28 MB each, 6.04 MB combined. Materials remain intentionally low-poly stylised. They provide no claim of Japanese identity, ageing, period tailoring, realistic facial detail, or new UAL2 animations. Artist preview images were inspected; the exported skinning was numerically verified. An in-game visual review is still required for the final palette, scale and desired art direction.

## Other research candidates: do not ship

- `hero-ubc-wip.glb`: publicly redistributed derivative from ilrein/warptracker; its ledger says UBC/UAL CC0 but calls it WIP awaiting wardrobe. Excluded from selected models.
- `quaternius-ual.glb`: credited public derivative from norio/vrm-game-starter, 46 UAL clips and mannequin. Excluded from character meshes; not needed for selected official models, which embed their own clips.
- Older 2019 Smooth_Male_LongSleeve.fbx and two Smooth_Female*.fbx files were downloaded with their included CC0 licences but not converted or selected, because the 2022 packs supply native glTF.
- The official UBC free standard download flow returned a product page after the generated download URL, even with cookies preserved. No paid files were purchased and no access restrictions were bypassed.
