# Johansson Suite: material and lighting enhancement plan

Date: 23 October 2026 (Europe/Copenhagen)
Status: proposed implementation plan; no rendering or material changes implemented by this document.

## Intended result

Give Johansson Studio, Avatar Creator, World and their story/comic renders a consistent original cartoon material language. Skin, hair, cloth, painted metal, ceramics and glass should read as different substances while retaining appealing shapes, readable faces and the established Johansson palette.

Use Disney's BRDF research as a reference, with the existing Three.js renderer as the implementation foundation. Do not embed the desktop BRDF Explorer, replace the engine, duplicate the avatar system or attempt a suite-wide shader rewrite.

The first deliverable is a controlled before/after Studio comparison using the same Thuan character, outfit, pose and camera. Hand topology and rigging remain separate work: a better material cannot correct anatomy, grip contact or deformation.

## Evidence and references

- Disney BRDF Explorer: https://github.com/wdas/brdf — an application for developing and analysing reflectance functions, not an animation, rigging or character-generation package.
- Disney example shader: https://github.com/wdas/brdf/blob/main/src/brdfs/disney.brdf — roughness, specular, sheen, anisotropy, clearcoat and an approximate subsurface term. Its subsurface control is not full light transport through skin.
- Three.js Standard: https://threejs.org/docs/pages/MeshStandardMaterial.html — metallic/roughness shading; documentation links Disney's research.
- Three.js Physical: https://threejs.org/docs/pages/MeshPhysicalMaterial.html — additional sheen, anisotropy, clearcoat and transmission, each with potential rendering cost. Check support against the suite's installed Three.js version before selecting features.
- Local direction: ../../ANIMATION_DIRECTION.md and ../AGENTS.md.
- Existing Look integration: HANDOFF-LOOKS-2026-10-22.md.

Read-only main inspection found physical materials already used in src/drinking/vessel.js, src/world/harbour.js and src/world/interiors/town-hall.js. This is an incremental consolidation, not the introduction of PBR from scratch. Search excerpts are not a complete material inventory.

## Rules for the implementation

1. Preserve the current engine, character recipes, proportions, saved identity and cast.
2. Treat surface materials, scene lighting and final image Looks as separate controls. Material changes must work with the existing Ink/Look pipeline, not stack another competing final filter on it.
3. Keep World web and Linux visually consistent. Respect the existing rule that ordinary device differences are drawing resolution and shadow detail; do not introduce automatic phone-only material downgrades. Optimise scene workload and shared resources first.
4. Studio capture may use an explicit higher-quality rendering context; this is an export workflow, not a hidden change to World's device policy.
5. Avoid shiny skin, mirror-like hair, uniformly glossy clothes, black eyes, blown highlights and unwanted coloured spill on faces.
6. Do not change ground geometry or bypass the existing ground material authority.
7. Start with built-in materials. Introduce custom shader code only for a demonstrated missing effect with measurable benefit and a maintainable compatibility path.

## Delivery sequence

| Phase | Work | Deliverable and exit condition |
| --- | --- | --- |
| 1. Baseline and inventory | Identify actual avatar material creation points, Studio and Creator render paths, Three.js version, colour spaces, environment lighting, tone mapping, Ink/Look order and capture behaviour. Measure representative scenes. | Reproducible baseline images and performance records; agreed insertion points. |
| 2. Shared material presets | Add a small shared preset catalogue and material factory in the existing shared engine. Keep colour/identity data independent of finish parameters. Reuse materials where safe. | Studio, Creator and a World test character resolve the same versioned presets without changing old saved identities. |
| 3. Studio proof | Render Thuan and a contrasting character under neutral portrait, daylight and warm interior rigs. Compare existing and proposed materials at identical exposure, pose and camera. | Labelled paired images and a short turntable, with an owner visual review before changing defaults. |
| 4. Creator integration | Add a restrained selection of meaningful finish options to existing outfit/accessory controls. Preview in the same lighting used by Studio's neutral rig. | Selected finish survives save/reload and Studio/World transfer; existing recipes load unchanged. |
| 5. Selected World adoption | Apply approved presets first to the player/residents and a few close-view props in Minato Izakaya and Sakura. Check daylight, warm interiors and ferry night lighting. | Visible benefit in actual game captures; no loss of established visual identity or unacceptable measured cost. |
| 6. Photography and story output | Reuse presets in existing Studio export and story/comic capture. Add approved lighting presets and reproducible capture metadata through existing controls. | Preview/export parity at matched settings; intentional quality differences documented; affected backdrops refreshed only after approval. |

Implement as small reviewable PRs. Do not perform a bulk migration of every world material before the proof succeeds.

## Initial preset scope

| Surface | Intended treatment | Boundary |
| --- | --- | --- |
| Skin | Broad, soft highlights; controlled roughness; warm colour retained under neutral light | Non-metallic. Start without a custom subsurface shader; evaluate a subtle approximation only if side-by-side evidence justifies it. |
| Hair | Cohesive larger highlights that follow the hairstyle | Start with roughness and shape; add anisotropy only with suitable tangents and verified engine support. |
| Cotton | Matte, readable folds and restrained sheen | No glitter or silk-like gloss. |
| Satin | Broader directional highlights and modest sheen | Keep highlights below face-distracting intensity. |
| Leather/rubber | Controlled gloss on leather; subdued rubber | Distinguishable from skin and painted plastic. |
| Painted metal/ceramic | Separate paint/glaze response from exposed metal | A metal substrate does not make opaque paint metallic. |
| Glass | Legible silhouette and highlights; transmission only where useful | Check sorting, overlapping surfaces and capture cost; no blanket conversion to transmission. |

These are art-direction targets, not verified numeric settings. Tune values against actual renders rather than prescribing one roughness value for every character.

## Shared implementation contract

Choose exact file locations after the inventory; reuse an existing material authority if one already exists.

- Preset identifiers describe finishes, not people. A character's skin colour remains identity data; its surface finish is a separate reference.
- A small versioned schema holds preset ID and bounded permitted overrides. Existing recipes without a preset retain their current appearance until explicitly migrated.
- Presets resolve through one factory used by shared avatars and their consumers. World props adopt it selectively.
- Cache immutable materials by resolved parameters. Clone before per-character animated or editable changes; never let editing one character recolour another.
- Dispose scene-owned clones and environment resources when previews close. Avoid accumulating material/shader variants during wardrobe changes.
- Preserve existing skinned meshes, vertex colours, face decals, morph targets, transparency and InstancedMesh behaviour. Verify compatibility before converting any class.
- Follow the existing renderer's colour-management contract: colour textures in their appropriate colour space, numeric data maps as data, one intended output transform. Do not copy the example shader's manual gamma conversion into the suite blindly.
- Record material preset version, lighting ID, camera, exposure, Look and capture settings so an approved image can be reproduced.
- Keep material changes reversible through legacy preset resolution. Plan migrations explicitly; do not overwrite old appearance data.

## Studio controls

Expose a few useful photographic choices rather than a technical BRDF editor:

- Lighting: Neutral portrait, Daylight, Warm interior.
- Finishes: choose via relevant clothing/accessory controls with comparable swatches.
- Comparison: identical-camera before/after view.
- Capture: retain existing export controls; introduce a higher-quality capture option only where supported and measured.

Advanced numeric controls belong in a development/debug view until a real user need is established. Do not advertise full cinematic skin scattering, physically accurate hair or offline path tracing as consequences of this work.

World's Look selection continues to reset to Natural on restart, as currently instructed. A saved Studio shoot may record its chosen Look without changing World's startup behaviour.

## Acceptance and verification

### Visual evidence

Use fixed scenes, cameras, times and exposure. Save:
- Head/shoulder, full-body and hand close-up comparisons for Thuan and contrasting skin/hair/outfit combinations.
- A short turntable to expose unstable highlights, seams and normal errors.
- Actual World street, izakaya and ferry-night captures.
- Natural plus representative Manga, Crayon and Oil captures, ensuring surface highlights do not fight outlines or destroy facial readability.
- Creator preview and exported image under matched conditions.

Review for plastic-looking skin, dark eyes, colour loss, banding, transparency errors, shimmer, detached shadows and material seams. Hands must still pass the separate anatomy/contact review.

### Functional checks

Exercise old recipes/saves, preset save/reload, transfer between Creator and Studio, wardrobe edits without cross-character mutation, repeated open/close resource cleanup and unsupported-feature fallbacks. Use meaningful runtime/behaviour tests, not assertions that merely mirror preset constants.

Run applicable existing Studio/Creator checks. For World runtime edits rebuild runtime and run the runtime-package test and the current CI guard, as required by johansson-town/AGENTS.md.

### Performance checks

Record baseline and proposed results using identical scenes, camera paths, resolution and warm-up. Measure median and p95 frame time, shader compilation hitches, draw calls, texture/material/program counts, available memory indicators and export time. Repeat after cycling outfits/previews.

Use desktop, an actual iPad/iPhone Safari device and Steam Deck/Linux when available. The project targets of 60 fps desktop and 30 fps tablet are goals to verify, not results established here. Set a permitted frame-time/resource increase from the measured baseline before rollout; if baseline already misses the target, do not call the enhancement accepted until the budget issue is resolved.

Software Chromium can verify boot, image generation and shader errors, but cannot establish real-device performance. Keep all unperformed checks explicitly pending.

## Attribution and source handling

Prefer built-in Three.js features and cite Disney research in the material documentation. If any Disney source is copied or adapted, inspect its exact file licence and preserve the required notices; the example shader has an Apache-2.0 header with a modified trademark clause. Check bundled probes and measured datasets separately before reuse. Do not label the entire suite commercially cleared from this dependency check.

No Disney name, logo or claimed affiliation is needed in the product's user interface.

## First implementation task

Produce the baseline inventory, a small shared preset prototype and an identical-camera Thuan comparison in Studio. Keep default World materials unchanged. Present actual rendered comparisons plus measured costs for review. This first task should determine whether the visual benefit warrants broader adoption.

## Planning handover

Completed: read current main instructions, the handover index, animation direction, current Look handover and afternoon World note; checked representative existing material usage and Disney/Three.js references.

Delivered: this phased implementation and acceptance plan. No material code, presets, shaders, screenshots, performance measurements, runtime rebuild or tests were produced in this planning task. Implementation is not signed off.

Branch: codex/johansson-suite-material-plan-2026-10-23.
Next action: phase 1 and the first Studio prototype described above. Re-read current main handovers and inspect overlapping avatar/hand work before editing; preserve concurrent changes.
