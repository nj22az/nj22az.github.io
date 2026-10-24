# Scenario 3D Collection: evaluated, not adopted

The owner, 24 October 2026, asked whether <https://huggingface.co/datasets/scenario-labs/3d-collection> is useful for
Johansson World. Short answer: not as a source of shipped props; useful as a side-by-side comparison of image-to-3D
generators when the pending prop conversions (`assets/generation/pilot/`) resume. Nothing from it is in the repository.

## What it is

1,342 AI-generated 3D examples (about 39 GB), CC BY 4.0, credit "Scenario". Outputs: 1,271 GLB, 137 Blender, 41 SPZ,
23 PLY, 21 VOX, 7 FBX. 1,166 are image-to-3D, 75 text-to-3D, 53 edits of an existing model, 41 splats. About 45
generators: Rodin (Hyper3D), TRELLIS and TRELLIS 2, Meshy 7/7.1, Tripo 2.5–3.1 and P1/P2, Hitem/Sparc3D, Direct3D-S2,
SAM 3D Objects, PartCrafter, and Blender scenes written by language models (`claude-opus-5-5`, `gpt-6-astra` and
Scenario's wrappers of them). One metadata file, `data/train-00000-of-00001.parquet`, holds prompts, settings, inputs,
output paths and hashes. A separate Hunyuan companion (`scenario-labs/3d-collection-hunyuan`) is gated and under
Tencent's own licences, which have excluded the EU, UK and South Korea; leave it alone.

## What was measured (24 October 2026)

- Subjects: 266 distinct prompts across the 370 rows that have one; the rest are image-only. Mostly game showcase work:
  cartoon creatures, robots, sci-fi craft, fantasy weapons and villages. Things that could exist in a 1997 island town are
  few: an electric kettle, teapots, a ramen bowl, wooden barrels, an old paraffin lantern, potted cactus and succulent,
  palm trees, a weathered fishing trawler, a bicycle with a book cart, a 1950s pickup, a tractor, generic chairs and sofas.
  The town already builds its own kettles, teapots and barrels in code (for example `src/world/interiors/`).
- Weight, from eight downloaded samples (`tris` = triangles, textures embedded):

  | Sample | Generator | Size | Triangles | Textures |
  | --- | --- | ---: | ---: | --- |
  | Electric kettle | Meshy 7.1 text-to-3D | 19.0 MB | 121,796 | 4096² ×2, 2048² |
  | Ramen bowl | Meshy 7.1 text-to-3D | 21.8 MB | 73,390 | 4096² ×2, 2048² |
  | Wooden barrel | Rodin | 9.7 MB | 87,596 | 2048² ×3 |
  | Rusty lantern | Rodin v2 | 5.2 MB | 38,155 | 2048² |
  | Teapot (edit) | claude-opus-5-5, Blender | 4.9 MB | 120,113 | 4096² ×3 |
  | Bicycle book cart | gpt-6-astra, Blender | 9.1 MB | 140,470 | 1,400 primitives, 32 materials |
  | Fishing trawler | claude-opus-5-5, Blender | 2.3 MB | 39,962 | 16 maps, 18 materials |
  | Succulent | Meshy 7.1 text-to-3D | 4.0 MB | 407 | 2048² ×3 |

  For comparison, shipped town props: potted plant 3,796 triangles / 0.4 MB, vending machine 3,360 / 0.2 MB, harbour
  bench 1,284 / 0.1 MB, Fujita's houseboat 5,136 / 0.3 MB. The pilot's promotion rule asks for roughly 2–5k triangles
  and one shared 1K material per small prop, and a whole quarter's budget is 150k triangles. One kettle from this set
  would take most of it.
- The generated meshes are single fused shells (lids, handles and doors are not separate parts), so they cannot open,
  pour or be held the way the town's code-built props are.
- Comparison value: 536 distinct input images; 214 of them were run through two or more generators, 8 through ten or more.
  That shows how each generator handles the same picture before paying for one.

## If it is used later

Treat any file as an intake candidate under `RESOURCE_SOURCES.md`: exact-file provenance (the parquet's path and SHA-256),
"Scenario" credited on screen and in `assets/ATTRIBUTION.md`, then the pilot README's promotion steps (inspect, repair,
reduce, bake, set metres and pivot, replace only the visual child, keep collision, the action and the procedural
fallback). Each prop needs a purpose and a place (CLAUDE.md, "Nothing is random"); a prop that exists only because the
dataset had it does not qualify.
