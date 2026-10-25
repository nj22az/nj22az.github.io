# Shared skirt motion and swimwear — 25 October 2026

## Owner request and scope

Owner: “Can you make anyone using a skirt, make the skirt follow the body more realistic”; “Make swimsuits that work for all characters, male characters have swimming trunks”; and the explicit correction “Thuan should have a swimsuit not swimming trunks”. Continue the shared wardrobe work on **development**, from published `955b5870e558be823e9d54e005f9420f7f93fa07`. Local merge `7409de7` reconciles the connector-published history with the identical local tree; it changes no files. Main was inspected at `6764729b510ffcad74775df8babef3b4087cdc25` (a later tree-audit documentation commit); unrelated main work is not merged into this motion change. Previous context: [fabric/pressed-pleat handover](HANDOFF-WARDROBE-FABRIC-2026-10-25.md).

This is a shared movement correction for **plain, panel, pleated, pressed and long skirts**, including temporary sailor/shopping outfits, without name/gender restrictions or changes to resident identity. It is not a cloth-simulation engine, a main/website/Linux release.

## Root causes and implementation

1. `towel-fit.js` took the average direction of the thighs. The directions mostly cancel during an alternating stride; a small shear and 6% skin contribution made the hem move, but the surface largely retained a level hoop. The replacement keeps a continuous surface across both legs, adding a smoothly blended local leg angle below the hip. Upper cloth stays on the hips; the hem follows its own side without separating into two trouser legs. Long skirts receive less angular pull so a longer hem does not exaggerate the same thigh excursion. Lateral leg changes also feed a restrained continuous sideways response.
2. The existing seated lap surface, thigh/shin collision projection, pelvis fitting, seat support and spring contribution remain. Stride-specific rotation/sideways response fades out as the thighs enter the seated pose. Visible cloth normals use the same local bend. Leg angles are read once per mesh refresh into a small uniform rather than reconstructed with `atan` for every shader vertex. CPU and shader paths use the same response coefficients (`SKIRT_FOLLOW`). No extra bones, meshes or geometry are added to the everyday garment.
3. Temporary sailor/shopping bodies discarded cloth flags and used a plain outline; they therefore bypassed the continuous fit. They now retain fitted vertices and apply the same fitting to their body, outline and shadow. The fitter takes the **actual worn recipe**, not the prior everyday skirt. Panel-specific waist/length state no longer contaminates a temporary classic garment. Temporary fitted materials are disposed when replaced and when the avatar is disposed.

Skirt fitting changes: `src/avatars/towel-fit.js` and `build.js`. Swimwear also updates recipe/creator/cast/wardrobe/player and Studio save handling. Existing recipes and fabric/design files remain compatible. No skirt silhouette or resident default is replaced by this task.

## Swimwear and explicit Thuận correction

Automatic swimwear now uses the established body silhouette rather than hair length, lipstick or facial hair. Canonical male characters receive swimming trunks; feminine characters receive a one-piece (or the existing elder skirted cut). Every body can explicitly select trunks, one-piece or skirted in the creator; the choice and colour survive recipe normalisation and share/design round trips. Old recipes default to automatic. Neutral custom bodies start in trunks and can select any cut.

Thuận has **explicit `swim.style: onepiece`** in both canonical and original recipes. A one-time swimwear-only migration covers older saved resident, player and Studio appearances without replacing their face, hair, everyday outfit, body, profile or swim colour. Revision markers preserve later deliberate edits. Her swimsuit does not depend on a silhouette or hair heuristic.

The swimsuit edge has close torso-profile rows and fitted binding; trunks have an elastic waistband. Leg openings now use open lathed sleeves with a turned hem instead of rounded limb capsules extending cloth below its intended hem. Normal everyday shorts retain their existing geometry. The actual wearer’s torso and limb dimensions drive all three swimwear cuts.

[Swimwear fit sheet](../docs/qa/skirt-motion/swimwear-fit.png) shows actual CPU triangles/vertex colours for Johansson, Mr Fujita, Daichi, Thuận, Vy and Mrs Sato. Hair/head geometry is omitted for the neckline-to-feet garment diagnostic. It is not a WebGL screenshot or device acceptance. Reproduce with `node avatar-creator/render-swimwear-geometry.mjs /tmp/swimwear.json` then `python avatar-creator/render-swimwear-diagnostic.py /tmp/swimwear.json /tmp/swimwear.png`.

## Observable checks

- Opposite thigh angles must produce opposite signed responses on the corresponding hem sides; the leading side must follow over 55% of the thigh-tip excursion in the controlled ±0.45 rad reference test. The previous averaged fit fails this check.
- The top band must stay in the same place relative to the hips during stride and a body turn, for every construction.
- Child/adult/elder, classic/studio proportions and all five constructions must produce finite continuous fitted motion through an alternating stride. Existing bounded-edge/no-spike tests remain unchanged.
- A temporary sailor/shopping skirt must use its own waist and length, retain the fit flags and fitted shadow, and stay valid when repeatedly switching. The previous temporary wardrobe fails this check.
- Existing seated hand/leg/cloth contact, floor contacts, bathwrap and whole-World regression checks remain required. Passing finite-position checks alone does not establish collision-free or aesthetically accepted motion.

## Evidence and reproduction

[Geometry comparison GIF](../docs/qa/skirt-motion/skirt-motion-comparison.gif) and [still](../docs/qa/skirt-motion/skirt-motion-comparison.png): same original rig, neutral garment and deterministic gait, before/after. These are **actual fitted CPU triangles**, drawn as a neutral diagnostic. They are not WebGL screenshots, final materials or an illustration filter review. Twelve sampled frames represent two seconds of walking; diagnostic playback sampling is not the game's frame rate. The crop intentionally shows waist/hem/legs rather than a finished character portrait.

Before geometry was exported from an isolated unchanged `955b5870` source snapshot; after geometry uses this change. No synthetic body or generated concept image was substituted. Both exports contain 2,880 cloth triangles and 3,624 retained body triangles per frame. The comparison still was opened and inspected for framing, readable hem movement and labels. Visual GPU/Safari and continuous rendered-game acceptance remain outstanding under the previously recorded browser restrictions; this task does not bypass them.

Reproduce the numerical regression from the root:

```sh
node --test johansson-town/tests/skirt-motion.test.mjs johansson-town/tests/skirt-follow.test.mjs johansson-town/tests/authored-skirt.test.mjs
```

Geometry export/diagnostic (the baseline root must be an unchanged checkout):

```sh
node avatar-creator/render-skirt-motion-geometry.mjs /tmp/before.json /path/to/baseline-root
node avatar-creator/render-skirt-motion-geometry.mjs /tmp/after.json
python avatar-creator/render-skirt-motion-diagnostic.py /tmp/before.json /tmp/after.json /tmp/skirt-motion-review
```

The Python diagnostic uses NumPy and Pillow only; it does not alter game assets. Intermediate full triangle dumps are scratch data. No hardware frame-rate, shader compile/render or iPad acceptance claim.

## Validation and delivery

- New regression file on unchanged `955b5870`: **2 pass / 2 fail**, specifically insufficient side-follow and missing temporary-outfit fit. Same four checks pass with this correction.
- Focused skirt-motion / skirt-follow / authored-skirt: **12/12 pass**. Prior skirt/authored/fabric/bathwrap compatibility run: **20/20 pass** before the final uniform dimension correction; the full guard below covers the final source.
- Final runtime rebuild passes; focused skirt plus runtime integrity **16/16 pass**. Swimwear **5/5 pass**, including all resident coverage/bare lower legs, repeated wardrobe switches, 96 age/proportion/build/cut combinations, saved choices and Thuận migration.
- Earlier skirt-only complete sequential guard: **431/431 pass, 85 files**. The later combined guard was interrupted by the managed network policy (blocked access to `https://nj22az.github.io:443`), after seated-pose checks and without an assertion failure in its captured output. It is **not recorded as a completed green guard**. The remaining alphabetical tail (12 files, including seated pose and all swimwear checks) was rerun separately: **54/54 pass**. This split verification is distinguished from an uninterrupted complete guard.
- Final editor DOM/canvas compatibility: **4/4 pass**. Logs in `docs/qa/skirt-motion/`. The final focused runtime checks validate the final rebuild; the broader guard began before the last swimsuit hem/migration refinements. Those refinements are covered by the final swimwear and focused checks.
- Source syntax, diagnostic export and `git diff --check` pass. Geometry comparison generated and inspected. No live-site or Linux deployment is authorised by this work.

## Concurrent development update

The first compare-and-swap publication did not advance the branch because another session published island trees as `5ab0316ce45eaaf8662abe8e9a5e794d030cbe95` after the initial branch inspection. Preserve that complete development update. Its non-runtime files have been incorporated, both handover rows and guard entries retained, and the runtime rebuilt with both changes. The final publication is based on that remote head, with no force update. Final combined rebuild passes. Combined runtime, tree rebuild, island loading/collision, skirt motion and swimwear validation: **25/25 pass**. Publication will use the exact combined tree. The earlier unattached `1e1cd418` commit was not delivered to a branch.

## Screenshot request

Owner requested screenshots. Actual WebGL screenshots could not be captured: local Chrome launch is blocked by the sandbox socket policy and the available remote browser cannot reach the container preview. The source geometry swimwear sheet and animated skirt comparison were shown, explicitly labelled as CPU fit diagnostics. No screenshot or browser aesthetic acceptance is claimed.

## Next concrete review

Review actual WebGL walking/turning/sitting on several residents and skirt lengths, especially long hems, wide strides, hands on the lap and repeated temporary-outfit changes. Check cloth highlights/ink/shadows against the surface and verify Safari/iPad operation and performance. The new numerical coverage and neutral geometry diagnostic support review but do not replace owner aesthetic judgement or full shader/device acceptance. Keep the detailed development branch away from wholesale main promotion because it also retains the earlier flagged Sakura prototype.
