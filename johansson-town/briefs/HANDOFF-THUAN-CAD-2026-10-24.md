# Thuan character CAD and shared game limb proposal — 24 October 2026

**Updated:** 24 October 2026, 12:51:27 UTC.

**Status:** revision A, amendment 1 delivered: ten A3 sheets, measured interference correction, editable shared game limb CAD and complete source package. Seven amended deliverables saved successfully. No new game mesh or character replacement implemented.

**Measured World baseline:** `main` at `30771c750c710905d3105e7f1db3ab1e51242cd2`.

**Local source review:** `main` at `0ca94d2ce0e3bfd92df232b60da318aed3ab1260`; relevant avatar geometry is unchanged from the measured baseline. This handover records design work only; no game mesh, animation or runtime change accompanies it.

**Film source audited:** `nj22az/jojo`, `pixar` at `c9e3b6afdc911f07e01f9d888734a414e47207ea`.

## Owner request and scope

After the noticeboard drawing, the owner asked: “How about Cad for Thuan and identify parts of improvement?” This issue measures the current World/Avatar Creator default, identifies specific improvements and records the separate Blender film prototype's gaps. It is a design/audit task; no game mesh, recipe, animation, runtime bundle or film asset was changed.

**Owner correction:** her arms merge into her hips. The first visual review did not establish this defect; the subsequent source-mesh section and three-dimensional checks confirm neutral forearm/palm interference on both sides. Treat this as P0 before cosmetic detail, not as an accepted silhouette feature.

**Latest request:** CAD her arms, hands, legs and feet as a practical improvement for the current game, scalable to all Avatar Creator models. The Blender/Pixar workspace is too advanced for this game proposal and is not its replacement asset. Thuan supplies reference dimensions; every implementation must derive its fit from the shared recipe measurements.

The owner’s workflow remains: prototypes on `development`; separate Blender improvement on `pixar`; `main` keeps the simplified cartoon World. The next concrete task is the shared game limb prototype on `development`, not importing the film model or promoting an unvalidated replacement to main.

## Drawing package — amendment 1

- `Thuan_Character_CAD_Rev_A.pdf`: **ten A3 sheets, JW-TH-001 through JW-TH-010**. The original measured turnaround/hand/face/priorities sheets are retained, with the confirmed arm/hip interference and new arm, hand, leg, foot and shared-system proposal sheets.
- `Thuan_Current_Model_Rev_A.dxf`: editable native millimetre geometry and dimensions, front/left/rear projections at 1:1, 28 bone centres in each view.
- **New `Thuan_Game_Limbs_Proposal_Rev_A1.dxf`:** combined editable 1:1 millimetre proposal, with eight labelled arm/hand/leg/shoe regions and **16 native dimensions**. It remains separate from the measured-current-model DXF.
- Unrigged neutral OBJ; **20 actual-model captures: 17 original baseline views and three static candidate-pose views**. The three new pictures pose the existing model and mittens; they do not show the proposed new limb meshes.
- Measured JSON, interference audit, `game_limb_design/arm-rest-proposal.json`, `hand-proposal.json`, `leg-foot-proposal.json`, `shared-game-limb-brief.md`, `proposed-controls.json`, generators and check reports. The baseline previews remain `Thuan_Measured_Turnaround_Rev_A.png` and `Thuan_Improvement_Map_Rev_A.png`.

The original four-sheet issue is superseded by this saved ten-sheet amendment. The final package is **7,084,187 bytes with 74 entries**; ZIP CRC and every SHA-256 manifest entry pass. Updated PDF, package, turnaround and improvement map retain their original file identities; the combined proposal DXF, four-limb overview and arm/hip detail are new deliverables. Owner-facing download links were supplied with the delivery. Sheet 1 prints at 1:10 on A3 at 100%; the new component dimensions describe proposed game geometry, not a manufacturing-ready solid. The OBJ is intersecting triangulated reference geometry, not watertight or rigged.

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

## Confirmed arm/hip defect and static pose candidate

`audit/arm-hip-clearance-audit.json` confirms actual neutral mesh interpenetration. At the wrist-height Z0 section, the left arm and clothed hip share **65.144 mm along X**, and the palm/hip share **63.644 mm**; the right side mirrors them. These are shared intervals at one section, not surface-normal penetration depths, minimum translations or prescribed sideways corrections. Component overlap areas must not be added.

The selected candidate keeps the current pivot-to-pivot lengths: **223.120 mm upper arm and 202.694 mm forearm**. The builder's 222.896/202.633 mm values are vertical parameters, not those true distances. Local Three.js **XYZ** rotations relative to the existing bind pose are shoulder Z **+14° left / −14° right**, elbow X **−10°**, elbow Y **+75° left / −75° right**, and wrist XYZ zero. The 75° value is local rig twist, not an absolute anatomical pronation measurement. The resulting upper-arm centreline is **16.569° outward from vertical in front view**, not 14°.

Exact triangle-pair checks give **26.099 mm minimum geometric clearance on each side** between the selected existing forearm/elbow-band/palm/thumb surfaces and the complete torso plus both shorts-leg shells, with no intersections in that static pose. The existing closed mittens are retained; the intentional upper-arm/chest attachment is excluded. The current 11 mm ink expansion per surface gives a conservative 22 mm combined allowance, leaving approximately 4.099 mm geometrically; this is an envelope calculation, not a full-motion or projected-outline guarantee.

Three new front/quarter/detail captures show that candidate on the actual current model. **The new hand is not yet built:** its greater distal reach, digit poses, prop contacts, shoulders, other recipes and complete motion still require validation. Do not report the static 26.099 mm result as proof for the new meshes or all characters.

## Shared game limb dimensions and implementation contract

| Proposed or retained reference | Value and scope |
| --- | --- |
| Complete hand, longest wrist-to-tip reach | **155 mm**, proposed straight design |
| Palm width | **78 mm**, palm body only, not the thumb-inclusive outline |
| Wrist width / palm and wrist depth | **56 mm / 34 mm** |
| Thigh / shin pivot distances | **205.273 mm each**, retained |
| Trainer envelope | **180 W × 330 L × 105 H mm**, proposed |
| Geometric gap between proposed neutral shoes | **16.987 mm**, excluding shader ink; local outline treatment remains required |

The palmar thumb chain is a projected placement guide; its 24 + 19 + 15 mm values are true 3D targets requiring a fitted opposition axis and depth. The shared design uses continuous deforming arm/leg surfaces, controlled elbow/knee loops, a joined palm/thumb web and five separate digits, and one forefoot bend per foot. It preserves the current character family, colours, height/proportions, existing arm IK and named shoulder–elbow–hand / thigh–knee–foot semantics. Fit all dimensions from `measure(recipe)`; do not copy these Thuan dimensions unchanged onto children or other builds.

**Proposed rig ceiling: 62 bones** = existing 28 + 30 digit bones + two forearm twist helpers + two forefoot bones. Preserve the first 28 names, indices and parents; append additions, with at most four normalised weights per vertex. A 52-bone comparison with two bones per digit retains five visible digits but loses independently controllable distal flexion; equivalent handle/pinch/fist quality is unproved. The 62-bone registry is the canonical proposal; the 52-bone option is recorded only for comparison, not as a second body contract. Neither is performance-certified.

**Geometry/material gates:** canonical Thuan in the reference outfit targets **≤22,000 primary triangles**, versus 17,802 current. Other recipes may add **≤4,198 net primary triangles over their own baseline**, preserving existing wardrobe increment budgets; 22,000 is not a universal cap for every elaborate outfit. Keep two baseline colour meshes plus two ink shells, counting existing face accessories and held props separately. No extra limb material slots or per-finger draws. The two complete hands target ≤2,400 triangles after replacing the existing 1,840 hand-source triangles, including the collapsed finger payload. Paired desktop/iPad and actual-World measurements are still required; no frame-rate improvement is claimed.

Source compatibility gates, detailed in the package's `shared-game-limb-brief.md` and `proposed-controls.json`:

- Replace the implicit mitten contact offsets in `consume.js`/`work-hands.js` with geometry-derived palm/grip/tip data while preserving held-object attachments and two-bone reach. Make `setOpenHands(false)` rig-aware.
- Update `foot-ground.js`: it currently samples only vertices rigidly weighted to `footL/R`, so appended toe weights and blended soles need explicit membership/side metadata and cache invalidation. Preserve floor, seated, bicycle and lying support.
- Finalise digit/twist controls after the last actor/creator wrist override, including steering-wheel and work-hand operations; reconcile any new foot deformation with support.
- Preserve all clothes/swim/bath/after-bath bodies, shoe removal, shared spring bones and recipe rebuild behaviour. Verify child, teen, adult and elder stages, all three proportion modes and silhouettes, and extreme height/build combinations.
- Preserve recipe/share/save v1 compatibility. Version the rig/export contract separately: current motion v1 filters to its 17 named body joints, and GLB export opens the legacy fingers, splits braid geometry and omits runtime ink/cloth shaders. Explicitly support or bake new controls.
- Check six gestures, left/right grips and release, bends through the full existing pose range including beyond 90°, high reaches, walk/run, seated/floor transitions and all footwear. A frozen distant-hand/update mode is only a future option after measured validation; it is not implemented here.

## Prioritised improvements

1. **P0 — Correct the confirmed arm/hip interference.** Fit the complete clothed body and limbs before surface polish; preserve pivot lengths and validate relaxed pose plus full motion. The static candidate above is the starting evidence, not a completed fix.
2. **P0 — Record scale per variant before remaking.** World is approximately 1.64 m; film construction is 1.60 m; its poster mapping uses 1.49 m. These are distinct sources. This shared game proposal retains the current World scale; check counters, seats, prop reach and paired characters rather than silently rescaling it to the film reference.
3. **P1 — Articulated game hands, arms, legs and feet.** The latest owner request expands the hand-only suggestion to the shared limb system above. Current mittens are the existing style, not evidence that articulated fingers work. Preserve current IK, contacts, creator controls and save/export compatibility while implementing the proposed five-digit hands and coherent limb surfaces.
4. **P1 — Progressive facial controls.** World already has gaze, blinking and speech. Current `paintFace` uses a binary blink/talk repaint key; `face.js` closes eyelids above 0.5. Actual captures confirm blink 0.0 and 0.4 are identical, while 0.6 differs. `blinkLeft` alone does not repaint because independent blink fields are omitted from the cache key. Improve transitions and independent controls without losing heavy eyes, diamond jaw and rose mouth. Expression-based winks are not claimed absent; the latest limb request does not itself implement this earlier recommendation.
5. **P1 — Garment construction and deformation.** Current polo collar/placket are painted; lower sleeve edges are faceted, shoulder forms overlap in silhouette and the shorts read as rounded pelvis/thigh covers. Add folded collar depth, coherent cuffs, waistband/crotch and controlled garment deformation. Review complete wave, high reach, walk and seated transitions.
6. **P2 — Braids and sneakers.** Replace stacked braid lobes with interlaced clumps while keeping colour, ties, silhouette and two-link secondary motion. Clarify trainer sole/upper/heel. The current neutral shoe gap is approximately 7.0 mm versus default 11 mm GPU ink expansion, and the front render shows their outlines meeting. The 16.987 mm proposal gap is separate and still needs local ink review; no underlying current shoe penetration is inferred from the outline alone.
7. **P2 — Runtime cost and exports.** Current body/head have 53,406 triangle corners and 17,802 source triangles, drawn in two primary meshes plus two ink shells. The isolated full views issue four draws, not a complete-game performance measure. In this neutral state 1,600 triangles are effectively zero area; 1,248 are specifically collapsed legacy fingers. Replace redundant geometry with export compatibility and meet the proposal's measured cost gates; no new runtime cost has been signed off.

## Blender film prototype — do not confuse with World

Authenticated source review of `jojo/3d/cast` confirms five-digit rigged hands, weighted jaw, clavicles, arm solving, reverse-foot controls and three-bone braids already exist in accepted film Thuan. Remaining work in its `checks.md`/implementation:

- Painted eyes have no blink or aim; do not transfer this claim to World.
- Fused sleeve/arm surface creases above approximately 70°; separate sleeve or corrective shapes remain needed.
- Blouse/pinafore is built around each still pose, not skinned for animation.
- Wrist colour transition, braid ends/grooming and fabric finish need refinement.
- Gesture and walk clips remain unrendered in the recorded work; stills do not prove continuous motion acceptance.

`thuan_ai.py` normalises the source to 1.60 m; `shots_poster.py` applies 1.49/1.60 for the shop scene. Its landmarks are rig centres, not external body dimensions. The film GLB was not downloaded, measured or newly rendered here. Local long-braid QA and Meshy figurine GLBs are separate, excluded assets.

## Verification actually completed

- **Initial four-sheet issue:** 14/14 artifact checks passed, covering snapshot/hash consistency, browser/CAD bounds, independent Node measurement agreement within 0.001 mm, sole datum, 17 baseline captures/no page errors, blink pixels, original PDF/DXF/OBJ/source counts and text bounds. Those unchanged baseline checks are retained in the final amended verification.
- **Final amendment verification:** **27/27 artifact checks pass**, including retained baseline checks, the new proposal CAD, rendered candidate landmarks within 0.001 mm, hand/arm geometry, registry, budget arithmetic and shoe-gap calculation. ZIP CRC and all manifest hashes pass. Seven amended files saved successfully.
- **Amendment 1 PDF:** ten A3 pages rendered; `output/drawing-checks.json` records ten pages, 420 × 297 mm, and **no text overflows**. Independent source and sheet reviews checked model/film distinctions, dimensions, proposals and acceptance wording.
- **20 capture records:** 17 baseline views plus three static candidate views in `output/limb-proposal-capture-report.json`; both reports contain zero page errors. Candidate captures retain the current model and mittens, with the declared local rotations.
- **New combined DXF:** eight labelled regions, millimetres at 1:1, **16 native dimensions** with `dimlfac=1`; reopening reports **zero audit errors and zero fixes** in `game_limb_design/combined-dxf-checks.json`.
- **Static clearance:** exact triangle-pair checks and containment checks for the selected existing limb/body surfaces give the 26.099 mm minimum on each side; candidate landmarks and true segment lengths agree with the capture and CAD data. Full motion, new-hand geometry and all-body clearance remain unverified.
- Three valid silhouette unions. DXF retains unsimplified boundaries; compact PDF contour errors are below 0.10 mm. Native dimensions explicitly show 564.4 / 1637.9 / 532.0 / 564.4 mm with `dimlfac=1`. Reopening reports zero audit errors/fixes.
- Neutral OBJ contains 16,202 non-degenerate faces; the source's 1,600 zero-area faces are excluded.
- The rig registry's 62 unique sequential indices, valid parent names and +4,198-triangle allocation arithmetic were checked. These validate the design data, not a working character.
- No new limb mesh, full game regression, continuous motion acceptance, Blender render or physical-device/performance sign-off is claimed. No game source/runtime files changed. Final amended-package saving, ZIP integrity and manifest verification are complete.

## Primary source references and next action

World: `src/avatars/{thuan-studio-design,cast,build,face,garment,animate,springs,consume,work-hands,foot-ground}.js`; `src/people/residents.js`; `tests/thuan-studio-design.test.mjs`. The package's audit notes preserve exact source locations and the measurements/generators.

Film: [checks](https://github.com/nj22az/jojo/blob/c9e3b6afdc911f07e01f9d888734a414e47207ea/3d/cast/checks.md), [rig](https://github.com/nj22az/jojo/blob/c9e3b6afdc911f07e01f9d888734a414e47207ea/3d/cast/airig.py), [wardrobe](https://github.com/nj22az/jojo/blob/c9e3b6afdc911f07e01f9d888734a414e47207ea/3d/cast/wardrobe.py), [scale/landmarks](https://github.com/nj22az/jojo/blob/c9e3b6afdc911f07e01f9d888734a414e47207ea/3d/cast/thuan_ai.py), [poster mapping](https://github.com/nj22az/jojo/blob/c9e3b6afdc911f07e01f9d888734a414e47207ea/3d/cast/shots_poster.py).

**Next:** prototype the shared game arms/hands/legs/feet on `development`, preserving current World scale, character identity and source compatibility. Resolve arm/hip clearance first, build the actual new surfaces, and review matched before/after views plus complete motion across creator body variants before promotion. The film workflow remains separate. This amendment records a measured drawing and design proposal, not an implemented or performance-approved replacement.
