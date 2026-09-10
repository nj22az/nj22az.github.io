# Asset licence ledger

All runtime files are served from this game's directory. No remote model, map, texture or audio service is required while playing. This ledger identifies included files; proposed sources are not credited as if their assets shipped.

| Files | Creator/source | Licence and changes |
| --- | --- | --- |
| `../vendor/three.module.js`, loaders, utilities and `../tools/vendor/GLTFExporter.js` | [Three.js r170](https://github.com/mrdoob/three.js/tree/r170) | MIT; full text in `../vendor/LICENSE-THREE.txt`; module paths and whitespace normalised |
| `asphalt.jpg`, `materials/asphalt-*.jpg` | [asphalt_02 — Rob Tuytel / Poly Haven](https://polyhaven.com/a/asphalt_02) | CC0; 1K albedo, OpenGL normal and packed AO/roughness/metalness |
| `timber.jpg`, `materials/timber-*.jpg` | [weathered_planks — Dario Barresi and Dimitrios Savva / Poly Haven](https://polyhaven.com/a/weathered_planks) | CC0; same three channels |
| `roof.jpg`, `materials/roof-*.jpg` | [roof_tiles_14 — Rob Tuytel / Poly Haven](https://polyhaven.com/a/roof_tiles_14) | CC0; same three channels |
| `plaster.jpg`, `materials/plaster-*.jpg` | [plastered_stone_wall — Rob Tuytel / Poly Haven](https://polyhaven.com/a/plastered_stone_wall) | CC0; same three channels |
| `characters/residents/town-*.glb` | [Quaternius Ultimate Modular Men](https://quaternius.com/packs/ultimatemodularcharacters.html), [Ultimate Modular Women](https://quaternius.com/packs/ultimatemodularwomen.html) | CC0; five clothed adult bases. Material palettes merged to vertex colours; six compatible clips retained; suit weapon removed. Included creator licence texts and exact provenance in `characters/residents/`. |
| `maps/tomonoura.json`, `maps/adapted-roads.json` | [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright) | ODbL 1.0; retained source coordinates plus explicitly adapted game centrelines. The map data, including adaptations, is offered under ODbL. No Google or GSI tiles are included. |
| `audio/*.wav` | Original Johansson Town signal-rendered Foley and instrumental loops | Newly created project material; generator in `../tools/render-audio.py`. No sampled songs, recorded broadcasts or third-party music. CC0 dedication in `audio/LICENSE.txt`. |

Poly Haven's [licence statement](https://polyhaven.com/license) and [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). OSM's [ODbL 1.0 terms](https://opendatacommons.org/licenses/odbl/1-0/). File hashes are included in the manifests alongside download/source URLs.

Original town geometry, procedural fallback rigs, signs and fictional paper text are authored project content. This ledger does not relicense the entire repository.

The older Kenney Mini Character archive remains on disk under its included CC0 licence but is not loaded. ambientCG, Quaternius UBC/UAL2 and restaurant packs, GSI historical photographs and Sketchfab kits are **not included** in this revision. No commercial asset pack or franchise model is included.

## Generation pilot

`audio/voices/*.wav`: four project-scripted synthetic Japanese dialogue clips generated with [Qwen3-TTS CustomVoice](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice) via its public Hugging Face Space. Model licence: Apache-2.0; no weights distributed. Output provenance, exact requests and licensing scope are in `audio/voices/PROVENANCE.md`.

`generation/pilot/references/*.png`: five OpenAI-generated isolated prop references, with original project prompts and hashes alongside them. Authoring only; no generated street photograph is used as a game surface. TRELLIS.2 conversion was attempted but blocked by public GPU quota; no TRELLIS meshes ship in this revision.

`lighting/industrial_sunset_02_1k.hdr`: [Industrial Sunset 02 — Sergej Majboroda / Poly Haven](https://polyhaven.com/a/industrial_sunset_02), CC0. Unmodified 1K HDR file; verified against the creator API's MD5, SHA-256 in `lighting/PROVENANCE.json`. Used for lighting/reflections, not photographed modern scenery. `../vendor/RGBELoader.js` is Three.js r170, MIT under the included Three licence, with its import made local.

Kenji: `characters/realistic/kenji.glb` is authored in Blender using MPFB/MakeHuman anatomical data and the MakeHuman CC0 system asset pack (skin, casualsuit01, shoes01, short01, low-poly eyes, eyebrow001). Exact file hashes, holders, source links and full CC0 text are in `characters/realistic/`. The editable packed `.blend`, scripts and actual CPU render previews are included under `art/characters/kenji/` and `tools/blender/`. MPFB add-on code is an authoring dependency and is not bundled.

Yui: `characters/realistic/yui.glb` uses the MakeHuman CC0 anatomical base, young Asian female skin, female_elegantsuit01, shoes03, long01 hair, low-poly eyes and eyebrow001. Pink textile adaptation, A-line skirt shape, cream collar, glasses, hat and ribbon geometry were authored in Blender. Source hashes and rights holders: `characters/realistic/yui-provenance.json`; full CC0 text is shared with Kenji. User reference photographs are not redistributed.

## Yuri — user-supplied Meshy design

`characters/realistic/yuri-meshy.glb` is the user's uploaded `Meshy_AI_Garden_Charm_0908113531_texture.glb`, included at their explicit request. It embeds three 2048px JPEG textures and contains 14,235 triangles. It is an unrigged posed mesh with no animation clips. It is **not represented as CC0**; the original author/account retains their applicable rights. The previous MakeHuman Yuri remains the local loading fallback.

## Yuri — Thoughtful Girl biped revision

The runtime `characters/realistic/yuri-playful.glb` now uses the user's newer `Meshy_AI_Thoughtful_Girl_in_Pi_biped.zip`, containing textured Walking and Running GLBs. Included at the user's request; not represented as CC0. The supplied skeleton and locomotion are retained, with local Blender geometry/shading/weight repairs and an original quiet idle. The previous Garden Charm design is preserved in git history. Editable packed source and renders: `art/characters/yuri-biped/`.
## Yuri — Thoughtful Girl (2026-09-08)
- Source: owner-supplied `Meshy_AI_Thoughtful_Girl_in_Pi_biped(1).zip`, used at the owner's request. No CC0 licence is asserted.
- Active file: `characters/realistic/yuri-playful.glb`; one textured skinned mesh with the supplied walking and running clips.
- Packed with `tools/prepare-yuri.py`: duplicate clip removal, shared mesh/textures, embedded 1024px JPEG maps.
- Original rig-specific idle/head tilt and greeting nod/hand flutter: `src/people/yuri-animation.js`. No facial morph targets or facial animation are supplied.
- Previous Garden Charm asset is retained for rollback and is no longer requested at boot.

### Vending machine (September 2026)
- **Vending Machine**, Don Carson: https://poly.pizza/m/0CX6wj64Swu
- Licence: Creative Commons Attribution 3.0 Unported, https://creativecommons.org/licenses/by/3.0/
- Download: https://static.poly.pizza/f12c4236-7a2b-4b50-aa1f-fa2575fab9ae.glb
- Local original: `models/props/vending-machine.glb` (249,008 bytes).
- Runtime adaptations: normalize scale/orientation; omit transparent glass; bake source colours into one opaque mesh; add original Minato Drinks, Harbour Tea and Dockside Coffee mock branding.
- All drink brands and campaign artwork are fictional placeholders, not endorsements. Campaign presentation is in `src/commerce/vending-catalogue.js`; saved inventory IDs and drink gameplay remain independent of branding. No advertising service is connected.

## Living-town prototype · September 2026

Minato izakaya and the 21 resident prototypes are original scripted Blender constructions for this project. Editable `.blend` files, generators and export records are included under `art/izakaya`, `art/living-cast` and `tools/blender`. Runtime GLBs are local. No downloaded third-party mesh or texture was used in these new constructions. Yuri's user-supplied Meshy asset and its existing provenance are unchanged. The prototype cast is not a claim of final art approval or equivalence to Yuri; see `docs/LIVING-TOWN.md`.

## Quiet City Block — owner-supplied Meshy asset (2026-09-08)

`models/harbour-block/harbour-shops.glb` and its three JPEG maps derive from the owner's `Meshy_AI_Quiet_City_Block_0908215843_texture.glb`, supplied through [Drive](https://drive.google.com/file/d/1n-K5OgB0sRO5Ve4Z82Uf-wP-nDythdoN/view) and included at their request. No CC0 licence is asserted for this supplied asset. Four buildings are extracted and simplified into near/far versions; source ground and detached vegetation/poles are removed, fused foliage is trimmed, and textures are re-encoded at their original 2048px resolution. Exact source hash and runtime counts: `models/harbour-block/manifest.json`. The boardwalk, entry frames and signs are authored project geometry; the extra surface grain uses the existing credited Poly Haven timber and plaster textures. Reproduction and validation: `../docs/HARBOUR-BOARDWALK.md`.

## Fitted neighbours and street surfaces (2026-09-09)

The archived fitted cast used `characters/neighbours/resident-00.glb` through `resident-20.glb`, authored with Blender 4.2.23 LTS and MPFB from the MakeHuman CC0 anatomical base and system asset pack. Each has independent age/build/face fitting, fitted clothes and hair, blended skin weights, seven original in-place clips and grounded soles. Covered thighs are masked beneath skirts. Textures are shared locally and limited to 256–1024px; clothing colours and older residents' hair are adapted. Exact inputs, hashes, pinned authoring revision and modifications are in `characters/neighbours/manifest.json` and the per-resident `.source.json` files. Full CC0 terms and source rights holders remain in `characters/realistic/LICENSE-MAKEHUMAN-CC0.md` and `characters/realistic/provenance.json`. The former segmented `living/` models are now an inactive archive. Yuri's supplied asset and rights are unchanged.

The following surfaces were discovered through the owner's [GameDev Free Resources catalogue](https://github.com/teamgravitydev/gamedev-free-resources). All are CC0 1.0; exact source downloads and before/after hashes are in `materials/oga-manifest.json`.

| Shipped files | Creator and exact source | Adaptation |
| --- | --- | --- |
| `materials/oga-concrete.jpg` | [YCbCr — Concrete Textures Seamless 1k](https://opengameart.org/content/concrete-textures-seamless-1k) | Selected concrete2 diffuse image; 1024px JPEG; shallow runtime bump inference |
| `materials/oga-paving.jpg` | [para — Ground Pavement Texture Pack](https://opengameart.org/content/ground-pavement-texture-pack) | Selected ground_stone_pavement_01.png; downsampled to 1024px JPEG; shallow runtime bump inference |
| `materials/oga-bamboo.jpg`, `materials/oga-bamboo-normal.jpg` | [YCbCr — Bamboo Wood Seamless 1k](https://opengameart.org/content/bamboo-wood-seamless-1k) | Original colour and normal channels re-encoded as 1024px JPEG |

`models/street/potted-plant.glb`: [Banana Plant — Polygonal Mind](https://github.com/ToxSam/cc0-models-Polygonal-Mind/blob/main/projects/avatar-show/Banana_Plant.glb), discovered through the owner's [ToxSam OS3A Gallery](https://github.com/ToxSam/os3a-gallery). CC0 under the collection's [creator licence](https://github.com/ToxSam/cc0-models-Polygonal-Mind/blob/main/License.md), included as `models/street/LICENSE-CC0.md`. Original geometry retained, embedded textures reduced to 512px, leaf blending changed to alpha testing, and repeated plants instanced in spatial cells. Original and shipped hashes are in `models/street/manifest.json`.

## User-supplied office and ramen restaurant (2026-09-09)

These two models were supplied by the owner and included at their express request. They are separate from the CC0 catalogue assets above. The following author, source and licence fields are preserved from the supplied GLBs; they are uploader metadata, not an independent rights verification for the original games.

| Runtime model | Supplied source and attribution | Adaptation |
| --- | --- | --- |
| `models/office/office-interior.glb` | **3DS — Tomodachi Life — Interiors — 065 Office**; original game by Nintendo. Source upload: [Unknown Person / jkimmel694](https://sketchfab.com/jkimmel694), [model page](https://sketchfab.com/3d-models/3ds-tomodachi-life-interiors-065-office-e6d0799ea5f34c8a8ab57237a0208ff5). Embedded licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). | Removed 40 identical duplicate primitives, restored vertex-alpha shadow transparency, retained all 25 embedded images and tiled floor UVs, rotated the entrance, merged matching materials. 2,991 triangles; 28 draws. |
| `models/ramen/ramen-restaurant.glb` | **Shenmue — Ramen Restaurant**; original game by Sega / AM2. Refurbished source upload: [Kiklox](https://sketchfab.com/kiklox), [model page](https://sketchfab.com/3d-models/shenmue-ramen-restaurant-a005cf77086246a6a192658c5574519a). Embedded licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). | Converted legacy specular/glossiness diffuse textures to core glTF base colour, retained all 56 embedded textures, fitted human scale and street-facing orientation, merged matching materials. 7,765 triangles; 56 draws. Shared between the exterior and interior. |

Both models use unlit materials to preserve their baked texture/vertex lighting. Original source metadata, input/output SHA-256 hashes, transforms and counts are recorded in each model directory's `manifest.json`. The original uploads are not modified. Reproduction: `python tools/pack-supplied-rooms.py --office /path/to/office.glb --ramen /path/to/ramen.glb` (Python with NumPy). Collision shapes, interaction anchors and the original Sato Ramen fascia/roof trim are project additions. No CC0 licence is asserted for either supplied model.

## Yuri’s bedroom — Bedroom Interior (2026-09-09)

`models/yuri-home/yuri-bedroom.glb` is the owner-supplied **Bedroom Interior** by [ankitk2618](https://sketchfab.com/ankitk2618), [model page](https://sketchfab.com/3d-models/bedroom-interior-082a0fa7766448b8ad68202367cb27c1). Embedded licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Included at the owner’s request from their Drive file.

Adaptations: bake the source hierarchy into vertices; scale the 1.33 m dollhouse interior to a 2.72 m ceiling; rotate the south doorway to +Z; downsample embedded JPEGs to 1024px; merge primitives that share a material; unlit materials keep the baked lighting. 74,874 triangles; 24 draws. Source/output hashes, furniture bounds and transforms: `models/yuri-home/manifest.json`. Reproduction: `python tools/pack-yuri-bedroom.py /path/to/bedroom.glb` (NumPy and Pillow). No CC0 licence is asserted for this supplied interior.

## Yuri’s house — Japanese Residential Home 02 (2026-09-09)

`models/yuri-home/yuri-home-exterior.glb` is the owner-supplied **Japanese Residential Home 02** by [Morrissey Alexander](https://sketchfab.com/reckzilla), [model page](https://sketchfab.com/3d-models/japanese-residential-home-02-c31697f09152453cb3ed215482e7a810). Embedded licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Included at the owner’s request from their Drive file.

Adaptations: bake the Sketchfab hierarchy into one mesh; convert centimetres to metres; rotate the east door to local +Z; ground the floor at Y=0; re-encode the base-colour atlas at 2048px JPEG and packed metallic-roughness/normal maps at 1024px; opaque front-facing materials. 1,996 triangles; one draw; 1,422,240 bytes. Source/output hashes, bounds and door centre: `models/yuri-home/exterior-manifest.json`. Reproduction: `python tools/pack-yuri-home.py /path/to/japanese_residential_home_02.glb` (NumPy and Pillow). The house replaces the generic canal-bank shell at 22 Willow Alley; the existing bedroom interior remains.

## Minato Izakaya — BenMaher exterior (2026-09-09)

The active exterior is now `models/izakaya/minato-benmaher-exterior.glb`, derived from the owner's supplied **Izakaya - Low Poly Building** by [BenMaher](https://sketchfab.com/BenMaher). The GLB identifies this [source model](https://sketchfab.com/3d-models/izakaya-low-poly-building-3f43e5429171408e9bd19553ea813364) and [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) licence. These credits are preserved from the upload's embedded metadata. No endorsement by the creator is implied.

Adaptations: remove the separate two-triangle presentation ground plane; keep all 2,446 building triangles; merge opaque geometry; preserve wire and rooftop-cloth cutouts with small RGBA texture crops; re-encode the base-colour atlas at 2048px and normal, packed AO/roughness/metalness and emission atlases at 1024px; retain the original neon colours at 65% emission strength; fit human scale, orientation and the door to Minato's existing street entrance. The result is 2,958,412 bytes and three draws. Source/output hashes, preserved metadata and geometry bounds are in `models/izakaya/benmaher-manifest.json`. Reproduce with `python tools/pack-benmaher-izakaya.py /path/to/izakaya_-_low_poly_building.glb` (NumPy and Pillow).

The previously supplied Meshy izakaya exterior is an inactive archive. Minato's existing project-authored dining room and activities remain active.

## VRoid anime town cast (2026-09-09)

The active 21 town residents now use `characters/vroid/`. Five CC0 sample models by **pixiv Inc. / VRoid Project** supply the actual anime geometry, humanoid skinning and facial morph targets. Sources and model-specific creator licence pages:

| Packed base | Original VRoid sample | Creator licence |
| --- | --- | --- |
| `vroid-bob.glb` | Vivi / beta AvatarSample_2 | [CC0](https://vroid.pixiv.help/hc/en-us/articles/360014900273) |
| `vroid-casual.glb` | HairSample_Male | [CC0 sample listing](https://vroid.pixiv.help/hc/en-us/articles/4402614652569) |
| `vroid-vest.glb` | Sakurada Fumiriya | [CC0](https://vroid.pixiv.help/hc/en-us/articles/360014788554) |
| `vroid-ponytail.glb` | Victoria Rubin / beta AvatarSample_4 | [CC0](https://vroid.pixiv.help/hc/en-us/articles/360014900233) |
| `vroid-long.glb` | Sendagaya Shino | [CC0](https://vroid.pixiv.help/hc/en-us/articles/360013482714) |

The original VRMs were obtained from the public [madjin/vrm-samples mirror](https://github.com/madjin/vrm-samples/tree/e16eb187100149a315ad92c3c9968f1d5baa6c7d/vroid/beta). `characters/vroid/manifest.json` records the exact input and output hashes. Changes: 512–1024px local texture atlases, four or five skinned draws per base, shared geometry, individual hair/clothes colours, head-bound glasses, retained eyelid/smile/mouth morphs, seven original humanoid animations, seated skirt fitting, fitted dark shorts beneath skirts, sole grounding and orientation conversion. The runtime uses portable GLB and illustrated unlit materials, without a VRoid Hub account or remote asset service. See `../docs/VROID-CAST.md` for reproduction.

## Complete canal overworld

Japanese Town by Nazareno_rojas, CC BY 4.0. All original buildings, streets, bridge and canal retained. Texture compression, static batching and gameplay adaptation: Johansson Town. See [source, licence and changes](models/full-town/CREDITS.md).

### Inakaya restaurant exterior and adjoining timber house

`models/ramen/inakaya-exterior.glb`: **Japanese Restaurant “Inakaya”**, by
[Jellepostma](https://sketchfab.com/Jellepostma),
[original model](https://sketchfab.com/3d-models/japanese-restaurant-inakaya-97594e92c418491ab7f032ed2abbf596),
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), as embedded in the supplied file.
Adapted for the east lane: fitted width/depth, grounded geometry, removed source
foreground paving/poles, compacted unused vertices, reduced embedded texture sizes.
Both buildings, their material assignments and transparent details are retained.
The right doorway leads to the existing Sato Ramen interior; the timber doorway
leads to the supplied crystal room, moved from StepWise Instruments.
Rebuild with `python tools/pack-inakaya.py /path/to/japanese_restaurant_inakaya.glb`.
Hashes, dimensions and texture sizes are recorded in `models/ramen/inakaya-manifest.json`.
