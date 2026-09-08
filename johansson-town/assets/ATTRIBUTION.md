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

The runtime `characters/realistic/yuri-meshy.glb` now uses the user's newer `Meshy_AI_Thoughtful_Girl_in_Pi_biped.zip`, containing textured Walking and Running GLBs. Included at the user's request; not represented as CC0. The supplied skeleton and locomotion are retained, with local Blender geometry/shading/weight repairs and an original quiet idle. The previous Garden Charm design is preserved in git history. Editable packed source and renders: `art/characters/yuri-biped/`.
