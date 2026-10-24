# Thuan character CAD and improvement audit — 24 October 2026

**Updated:** 13:56 CEST / 11:56 UTC.  
**Status:** revision A drawing, editable CAD and improvement brief delivered; no character replacement implemented.  
**World baseline:** `main` at `30771c750c710905d3105e7f1db3ab1e51242cd2`.  
**Film source audited:** `nj22az/jojo`, `pixar` at `c9e3b6afdc911f07e01f9d888734a414e47207ea`.

## Owner request and scope

After the noticeboard drawing, the owner asked: “How about Cad for Thuan and identify parts of improvement?” This issue measures the current World/Avatar Creator default, identifies specific improvements and records the separate Blender film prototype's gaps. It is a design/audit task; no game mesh, recipe, animation, runtime bundle or film asset was changed.

The owner’s workflow remains: detailed prototypes on `development`; Blender improvement on `pixar`; `main` keeps the simplified cartoon World. Do not treat this CAD issue as an instruction to promote a detailed replacement to main.

## Delivered files

- `Thuan_Character_CAD_Rev_A.pdf`: four A3 sheets, **JW-TH-001 through JW-TH-004** — measured turnaround; current hand/rig plus proposed five-digit schematic; face/clothing improvement map; priorities and acceptance.
- `Thuan_Current_Model_Rev_A.dxf`: editable native millimetre geometry and dimensions, front/left/rear projections at 1:1, 28 bone centres in each view.
- `Thuan_Character_CAD_Package_Rev_A.zip`: PDF, DXF, unrigged neutral OBJ, 17 actual-model captures, measured JSON, source audits, generators, README and verification/hash manifest.
- `Thuan_Measured_Turnaround_Rev_A.png` and `Thuan_Improvement_Map_Rev_A.png`: final screenshot previews.

All five owner-facing files were saved successfully. The full package is 4,507,532 bytes. Sheet 1 prints at 1:10 on A3 at 100%; the orange hand proposal is explicitly schematic and not dimensioned for manufacture. The OBJ is intersecting triangulated reference geometry, not a watertight solid or rigged export.

## Current appearance and measured baseline

The approved `src/avatars/thuan-studio-design.js` recipe, selected by `cast.js`, is charcoal polo, brown shorts, warm-white sneakers, short dark braids and pale ties, heavy brown eyes and a wide rose mouth. It does not use historical glasses, long-braid overrides, the Meshy display figurine or the film blouse/pinafore.

Measurement method: `buildAvatar(recipeFor('Thuan'))`, no saved wardrobe/published look override, closed hands, neutral expression, no idle sway, `createFootGrounder(avatar)(0)`. Reset runtime root yaw to zero for drawing axes **+X wearer left, +Y up, +Z front**. Y0 is the grounded sole plane. Actual source vertices are evaluated after skinning. Shader ink and cloth displacement are excluded from dimensions.

| Reference | Millimetres |
| --- | --- |
| Actual grounded neutral envelope | **564.411 W × 1637.918 H × 532.002 D** |
| Current `THUAN_PROFILE.height`, `src/people/residents.js` | 1640 |
| Internal builder H parameter | 1621.062 |
| Bare head mesh | 538.962 W × 540.940 H × 468.547 D |
| Actual height / bare head height | 3.028 head heights |
| Left wrist joint centre | X185.712, Y534.328, Z0 |
| Left shoulder joint centre | X170.712, Y959.857, Z0 |
| Palm ellipsoid primitive only | 102.127 W × 130.496 H × 88.510 D |

The rounded values in the drawing use one decimal. The approximate three-head proportion is the accepted stylisation, not an anatomical error. Bind-space soles lie below the builder origin; normal foot grounding already corrects this. No floor bug is claimed.

## Prioritised improvements

1. **P0 — Record scale per variant before remaking.** World is approximately 1.64 m; film construction is 1.60 m; its poster mapping uses 1.49 m. These are distinct sources. Select and record a target for the intended detailed variant, then check counters, seats, prop reach and paired characters. Do not silently rescale the approved main character.
2. **P1 — Articulated detailed hands and wrist.** Current mittens are intentional: palm plus thumb bulge. Four dormant finger capsules per hand are rigidly weighted to the wrist and collapse in the ordinary closed state; `animate.js` forces mittens. The proposed detail uses four fingers and an opposing thumb, continuous palm/web, knuckles/pads and blended wrist/forearm twist. Preserve existing arm IK and prop contacts. Validate relaxed/open/fist/point/V/thumbs-up plus bottle/handle grip, release and rotation.
3. **P1 — Progressive facial controls.** World already has gaze, blinking and speech. Current `paintFace` uses a binary blink/talk repaint key; `face.js` closes eyelids above 0.5. Actual captures confirm blink 0.0 and 0.4 are identical, while 0.6 differs. `blinkLeft` alone does not repaint because independent blink fields are omitted from the cache key. Improve transitions and independent controls without losing heavy eyes, diamond jaw and rose mouth. Expression-based winks are not claimed absent.
4. **P1 — Garment construction and deformation.** Current polo collar/placket are painted; lower sleeve edges are faceted, shoulder forms overlap in silhouette and the shorts read as rounded pelvis/thigh covers. Add folded collar depth, coherent cuffs, waistband/crotch and controlled garment deformation. Review complete wave, high reach, walk and seated transitions.
5. **P2 — Braids and sneakers.** Replace stacked braid lobes with interlaced clumps while keeping colour, ties, silhouette and two-link secondary motion. Clarify trainer sole/upper/heel. The neutral shoe gap is approximately 7.0 mm versus default 11 mm GPU ink expansion, and the front render shows their outlines meeting. Review local ink width/stance; no underlying shoe penetration is inferred from this alone.
6. **P2 — Runtime cost and exports.** Current body/head have 53,406 triangle corners and 17,802 source triangles, drawn in two primary meshes plus two ink shells. The isolated full views issue four draws, not a complete-game performance measure. In this neutral state 1,600 triangles are effectively zero area; 1,248 are specifically collapsed legacy fingers. Gate redundant geometry only with export compatibility. Keep a light World option and measure the detailed model on target devices.

## Blender film prototype — do not confuse with World

Authenticated source review of `jojo/3d/cast` confirms five-digit rigged hands, weighted jaw, clavicles, arm solving, reverse-foot controls and three-bone braids already exist in accepted film Thuan. Remaining work in its `checks.md`/implementation:

- Painted eyes have no blink or aim; do not transfer this claim to World.
- Fused sleeve/arm surface creases above approximately 70°; separate sleeve or corrective shapes remain needed.
- Blouse/pinafore is built around each still pose, not skinned for animation.
- Wrist colour transition, braid ends/grooming and fabric finish need refinement.
- Gesture and walk clips remain unrendered in the recorded work; stills do not prove continuous motion acceptance.

`thuan_ai.py` normalises the source to 1.60 m; `shots_poster.py` applies 1.49/1.60 for the shop scene. Its landmarks are rig centres, not external body dimensions. The film GLB was not downloaded, measured or newly rendered here. Local long-braid QA and Meshy figurine GLBs are separate, excluded assets.

## Verification actually completed

- **14/14 artifact checks pass**: snapshot/hash consistency; browser vs CAD bounds; independent Node measurement agreement within 0.001 mm; sole datum; 17 captures/no page errors; blink pixel comparisons; four A3 PDF pages; DXF mm/audit; OBJ face count; source triangle count; drawing text bounds.
- Three valid silhouette unions. DXF retains unsimplified boundaries; compact PDF contour errors are below 0.10 mm. Native dimensions explicitly show 564.4 / 1637.9 / 532.0 / 564.4 mm with `dimlfac=1`. Reopening reports zero audit errors/fixes.
- Neutral OBJ contains 16,202 non-degenerate faces; the source's 1,600 zero-area faces are excluded.
- Four sheets rendered and inspected, with independent source/visual review. Wrist/hip labels, sleeve callout and pose heading were corrected. ZIP integrity passed.
- No full game regression, continuous motion acceptance, Blender render or physical-device test is claimed. No game source/runtime files changed.

## Primary source references and next action

World: `src/avatars/{thuan-studio-design,cast,build,face,garment,animate,springs,consume,work-hands,foot-ground}.js`; `src/people/residents.js`; `tests/thuan-studio-design.test.mjs`. The package's audit notes preserve exact source locations and the measurements/generators.

Film: [checks](https://github.com/nj22az/jojo/blob/c9e3b6afdc911f07e01f9d888734a414e47207ea/3d/cast/checks.md), [rig](https://github.com/nj22az/jojo/blob/c9e3b6afdc911f07e01f9d888734a414e47207ea/3d/cast/airig.py), [wardrobe](https://github.com/nj22az/jojo/blob/c9e3b6afdc911f07e01f9d888734a414e47207ea/3d/cast/wardrobe.py), [scale/landmarks](https://github.com/nj22az/jojo/blob/c9e3b6afdc911f07e01f9d888734a414e47207ea/3d/cast/thuan_ai.py), [poster mapping](https://github.com/nj22az/jojo/blob/c9e3b6afdc911f07e01f9d888734a414e47207ea/3d/cast/shots_poster.py).

**Next:** establish the intended detailed variant’s scale, prototype hands/face/garments on `development` using this measured reference, then follow the separate `pixar` handover. The requested drawing and improvement audit are complete; modelling and motion acceptance remain future work.
