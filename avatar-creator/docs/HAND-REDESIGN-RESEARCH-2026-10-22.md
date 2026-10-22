# Johansson hands: research and replacement plan

22 October 2026. **Plan, not an implemented replacement.** The owner rejected both PR #301's earlier experiment and the new five-digit Thuan prototype. Neither is approved for merge or cast adoption. Five digits total—four fingers and one thumb—is now an explicit owner decision.

## Decision

Stop adjusting the rejected procedural hand. Begin with an original, deliberately designed hand and forearm, approve its shape, then build deformation and animation around it. Recommended direction: rounded cartoon construction with credible anatomy and contacts, a restrained Johansson ink treatment, and expressive posing. Keep Thuan's established identity and the shared Studio/World engine.

Use Pixar/Disney as references for coordinated design, deformation and performance; The Simpsons/Family Guy for readable graphic shapes and economical gestures; Japanese illustration/anime practice for five-digit anatomy and portrait staging. This is an application of selected principles, not a claim that those productions use one shared method or that combining their styles creates an original asset automatically.

## Why the latest prototype failed

[Rejected comparison](qa/hand-redesign/rejected-prototype.jpg)—historical failure evidence only.

| Visible problem | Cause established or suggested by the prototype | Required replacement behaviour |
| --- | --- | --- |
| Thin projecting fingers attached to a forearm-sized lump | Palm is visually swallowed by the existing forearm end cap; finger/palm/forearm proportions were not approved together | A recognisable palm, taper into the wrist and a coherent arm silhouette at normal portrait scale |
| Tubular fingers with insufficient knuckle/pad structure | Rounded implicit fields generated a connected skin but not a convincing designed hand | Deliberately shaped pads, knuckle rhythm, varied finger lengths and a lower little-finger root |
| Thumb resembles a curved appendage rather than an opposing digit | Generic bend/rotation controls and an approximate thenar blend do not establish the correct shape or contact | Separate thumb-base opposition, correct two-segment thumb articulation, a substantial thumb pad and believable closure |
| Folded fingers read as small upright tabs; thumb does not convincingly secure them | Presets are angle recipes, without authored target shapes or contact solving | A designed folded-finger group with thumb contact and readable overlap in a V sign |
| Compressed creases, pinching and uneven shading | Linear skinning, approximate weights and insufficient corrective shapes | Stable palm/knuckle volume, clean compression and normals throughout transitions |
| Hand looks attached rather than part of Thuan | Hand and forearm are separate overlapping surfaces; ink thickness was chosen independently | Continuous wrist shape, compatible outline weight, matched skin/shading and convincing sleeve transitions |
| Pose is technically reachable but stiff | Existing shoulder/elbow shape and a symmetric wrist-target interpolation are not a finished performance | Comfortable elbow path, shoulder response, forearm twist, asymmetry, ease and settling |

The rejected code did pass topology, finite-weight/motion and compatibility tests. Those results establish plumbing, not attractive anatomy. A closed connected hand surface is not a hand-to-body weld. Increasing mesh resolution fixed finger bridges but did not fix art direction. More bones or more triangles alone will not repair these failures.

## Research: evidence and practical application

Sources accessed 22 October 2026. Entries distinguish documented facts from our proposed interpretation. No copied rigs, models, textures or full model sheets are included.

### Pixar

**Documented:** the Pixar/Museum of Science rigging exhibit explicitly separates skeleton articulation from how muscles and skin deform [R1]. The SIGGRAPH programme identifies the Inside Out 2 character-rig talk and its authors [R2].

**Application:** judge the surface in a set of difficult poses, not just whether bones reach targets. Author volume/shape corrections for a fist, thumb opposition, V-sign fold and wrist bends. Keep a small reusable hand family that fits the cast, with artist control over final shapes.

**Access limit:** Pixar's old paper URL redirected to its technology landing page; the ACM full text returned 403. The conference abstract was read, but this plan does not claim a full-paper review or reproduction of Pixar's proprietary hand rig. The indexed “curvenet” details are not an implementation requirement.

### Disney animation

**Documented:** Disney describes riggers working with animators and modellers to make expressive controls [R3]. Its SIGGRAPH Wish abstract connects simplified geometry, graphic shading and art-directed performance [R2].

**Application:** a model sheet, clay sculpt, deformation tests and final Johansson shading must agree. Approve the model attached to the character before adding a large control interface. Keep expressive shape control, while avoiding photoreal skin detail that would conflict with the cast.

### The Simpsons

**Documented:** Adobe's first-party account of the 2016 live Simpsons segment describes prepared 2D artwork and triggered animations [R4]. HarperCollins identifies the official Simpsons drawing handbook; the complete book was not inspected [R5]. These are not evidence of a universal 3D hand rig.

**Application / visual direction:** develop a small set of strong, consistent hand silhouettes, with readable overlaps and restrained linework. Make the whole hand shape work before individual finger details. An ordinary pose should remain readable at game scale. Preserve five digits in Johansson even when studying more simplified cartoon examples.

### Family Guy

**Documented:** in a direct interview, showrunners Rich Appel and Alec Sulkin explain that drawing moved to screens/styluses while the show remains hand-drawn [R6]. Original pilot artist Jonathan Caustrita also publishes his own production credits and work context [R7]. Neither source documents a general-purpose 3D hand skeleton.

**Application / visual direction:** study soft compact masses, uncomplicated contours and intentional gesture shapes. Create an original Johansson palm and thumb rather than converting Peter Griffin's outline into a mesh. Authored 3D gesture poses and corrections can preserve intent; an arbitrary chain of finger angles cannot be assumed to match the drawing.

### Japanese illustration / anime reference

**Documented:** Ui Shigure's tutorial, published by ClipStudioOfficial, distinguishes the thumb, its base, four fingers and palm; discusses joint arcs, hand depth, folded fingers and optional nail simplification [R8]. It is a named illustrator's construction lesson, not a statement of every anime studio's workflow.

**Application:** keep five distinct digits, a credible thumb base, taper and joint rhythm. Use the owner's portrait references for gaze, face/hand spacing and clear V-sign staging. The tutorial contains teaching simplifications; do not interpret its fixed-palm diagram as a ban on 3D palm cupping. Avoid adding detailed tendons, sharp nails or realistic skin texture at this stage.

### Deformation and performance cross-check

**Documented:** Autodesk's hand-skinning guidance explains that hand setup requires more than basic joint motion, including controlled surface deformation [R9]. Nathaniel Seymour's Animation Mentor tutorial uses acted reference, varied finger/wrist poses, timing offsets and upper-body coordination [R10].

**Application:** separate geometry, rig, contact and acting acceptance. Record new reference from a consenting performer or use appropriately licensed footage. Do not estimate natural hand motion exclusively from a still. A two-handed portrait can be intentionally coordinated while retaining slight differences in wrist angle and settling.

## Proposed Johansson hand specification

These are design requirements to verify, not measurements already achieved.

- Five digits: four fingers with three phalangeal segments; thumb with a movable metacarpal/base and two phalangeal segments. Define the thumb's axes separately from finger curl. Include modest palm cupping and finger spread; avoid identical curling arcs for every finger.
- A rounded, shallowly cupped palm with a clear thenar/thumb pad; slight knuckle arc, lower little-finger root, varied lengths, soft pads and rounded tips. No glove cuff or isolated spherical wrist.
- Judge overall size against Thuan's face and forearm in the actual camera. Explore compact and slightly tapered original designs on the same character. Choose ratios from approved sheets; do not hard-code an unreviewed anatomical percentage as the house style.
- Skin and ink match the character. Test silhouette and internal crease lines at actual export and game resolutions. Keep detail readable without tracing every crease or outlining each finger as a separate tube.
- Model the wrist transition together with the distal forearm. A hidden overlapping forearm cap is not the final connection. Use a shared, matched boundary and consistent skinning/normals, or a technically justified seamless alternative proven through all wrist tests.
- Author a controlled mesh in Blender or an equivalent modelling tool, with an editable source asset and deliberate deformation loops at knuckles, thumb web and wrist. Procedural tools may assist; the rejected implicit mesh is not a production template. If the sculpt cannot meet review, obtain character-modelling help rather than declare another algorithmic approximation finished.

## Staged delivery and acceptance gates

| Stage | Work and deliverable | Pass criteria / review |
| --- | --- | --- |
| 0. Retire failed experiments | Mark PR #301 and this local prototype rejected; preserve failure evidence; fix digit decision in handover | No rejected hand geometry on main; later agents cannot mistake test passes for approval |
| 1. Shape design | Two original design sheets on Thuan: palm, back, side, quarter; relaxed, open, fist and V silhouettes; include wrist/forearm | Owner chooses a direction. Correct thumb side, clear palm, varied fingers, coherent arm attachment and appealing proportions at normal character scale |
| 2. Clay model | One authored connected model, both hands fitted to Thuan; neutral/open hand plus sculpted fist and V targets; neutral light, no flattering effects | Full turntable and front/quarter/profile look convincing. No detached wrist, tube-finger appearance or forearm cap swallowing the palm. Owner approves shape before rig expansion |
| 3. Deformation rig | Finger controls, distinct thumb opposition, palm cup, wrist/forearm twist and limits; authored corrective shapes for difficult poses | Stable knuckle/palm volume, proper handedness, no web tearing, joint collapse, wrist gaps or candy-wrapper twist. Inspect intermediate poses, not just endpoints |
| 4. Contacts and gesture library | Relaxed, open/wave, V, point, fist, thumbs up/down, cylindrical grip, pinch; both hands. Glass, mug, phone, cheek and lap cases | Correct thumb/folded-finger overlap, contact before object movement, no visible penetration or hovering. Initial contact target: within 3 mm at intended touch points, then adjust only with a documented visual reason |
| 5. Thuan portrait performance | One- then two-handed portrait: raise, form gesture, hold/blink, release/lower; hair/sleeves included; 5–8 s, deterministic capture | Continuous comfortable shoulder/elbow/wrist motion; attractive readable V; no hand/face/hair penetration; holds settle naturally. Inspect real-time playback and adjacent frames at contacts. Owner approves before other cast |
| 6. Shared integration | Studio and World use the same hand asset/rig; presets plus optional fine controls, Undo/Redo, pose/scene save, reopening, GLB and animated finger tracks | Old recipes/scenes/World saves still load. Primary body bone indices/names retained; new named rig extension is versioned/append-only. Pose remains separate from appearance; old body clips still work. Current hand style persists explicitly when adopted |
| 7. Cast and release | Johansson, Thuan, Tetsu, elder, child; body/hand-size extremes; all clothing categories; mobile/desktop tests; provenance | Owner acceptance, correct contacts and seams, measured frame/memory/draw-call costs, physical Safari and desktop checks, documented asset rights and outstanding legal questions |

Stop at a failed gate and correct that stage. Do not proceed from “rig works” to cast rollout while shape is unapproved. Stage 1 is the next proposed implementation milestone, not another code-generated hand shown as finished.

## Engineering constraints for the accepted model

- Retain one shared character builder, appearance contracts, existing body animation and consumption/contact systems. No unrelated World, ground or lighting changes.
- Preserve legacy body bone names/order/indices. Design an optional versioned extension for fingers and necessary wrist/palm controls. Avoid a second independent character engine; do not treat the rejected separate hand skeletons as an approved export design.
- Use animator-friendly controls: gesture preset, strength, finger curl/spread, thumb opposition, wrist orientation and hand target with elbow control. Support joint editing when necessary; the user should not need dozens of sliders for a V sign.
- Use skinning plus authored pose corrections supported by the shared renderer/exporter. Verify that normals, outlines, corrective shapes and finger tracks survive actual GLB round trips. Do not assume a DCC rig exports unchanged.
- Establish the mesh budget after an approved clay model. Initial optimisation target for discussion: roughly 1–2 thousand triangles per interactive hand, with a measured close-up option if necessary. This is provisional, not a demonstrated budget. Same accepted appearance across devices; no inferior phone-only hand model.
- Benchmark empty baseline, one posed hero, five representative characters and a crowded World scene. Report CPU animation time, GPU/frame timing where available, draw calls, triangles, memory and first-build/load cost. Do not extrapolate hardware performance from SwiftShader.
- Save original source, export settings, topology/skin version, source hashes and provenance. Verify generation is reproducible. No proprietary source art or downloaded studio rigs enter the shipped asset graph without appropriate rights.

## Review matrix and release checklist

Each gesture must be checked on L/R hands from palm, back, thumb side, little-finger side, front, quarter and profile. Include both held and transition states, wrist flex/extend and forearm rotation, with long/short sleeves. Use identical camera/light before and after, neutral clay first and final ink second. Show full character and close-ups. Keep failure views in the record.

| Item | Current state |
| --- | --- |
| Five-digit decision | Confirmed by owner |
| First research pass and redesign plan | Completed as documentation |
| PR #301 geometry | Rejected; unmerged |
| Latest Thuan procedural prototype | Rejected; local code frozen, not delivered as approved work |
| New design sheets / approved model / accepted rig | Not started / not approved |
| Historical focused prototype tests | 15 passed; not aesthetic acceptance |
| Historical full local guard | 332 passed, one no-z-fighting test process failed; isolated process recheck also failed without an assertion report |
| New replacement visual/contact/save/export/performance/device checks | Unverified |
| Creator usability/accessibility, full release asset audit and IP review | Outstanding |
| Merge / commercial readiness | Not authorised / not established |

Changing digits, proportions or naming does not guarantee legal safety. Before commercial release, review the shipped asset inventory and provenance and take specific similarity, branding and licence questions to a qualified IP solicitor. Study general methods; independently author Johansson assets. This plan is not Nintendo clearance or a claim of Disney/Pixar production quality.

## Sources and access record

- **R1:** [The Science Behind Pixar—Rigging Challenge](https://sciencebehindpixar.org/pipeline/rigging/challenge). Museum of Science/Pixar collaboration; page read. Supports articulation versus surface deformation, not a disclosed reusable hand rig.
- **R2:** [SIGGRAPH 2024 Talks programme](https://www.siggraph.org/wp-content/uploads/2024/09/talks.html), entries “Pixar's Inside Out 2: Character Rig Challenges & Techniques” and “Character Stylization in Disney's Wish”. Programme abstracts read. Pixar full-paper URL redirected; [ACM DOI](https://doi.org/10.1145/3641233.3664342) returned 403; full text not read.
- **R3:** [Walt Disney Animation Studios—Rigging](https://disneyanimation.com/process/rigging/). Official process page read; broad workflow statement only.
- **R4:** [Adobe—The Simpsons live animation production](https://blog.adobe.com/en/publish/2016/05/15/the-simpsons-tv-show-and-adobe-make-live-animation-television-history). First-party technology account read. Scope: 2016 live segment, not every episode or every gesture technique.
- **R5:** [HarperCollins—The Simpsons Handbook, Matt Groening](https://harpercollins.co.uk/products/the-simpsons-handbook-the-simpsons-matt-groening). Publisher listing/search extract inspected; direct page retrieval failed; full book not read. Pointer for a legitimate further model-sheet study, not proof of specific hand measurements.
- **R6:** [AWN—direct interview with Rich Appel and Alec Sulkin](https://www.awn.com/animationworld/family-guy-rich-appel-and-alec-sulkin-talk-longevity-collaboration-and-doing-it-hand), 22 April 2025. Primary interview read, especially production section. Supports digital hand-drawn workflow, not 3D rig claims.
- **R7:** [Jonathan Caustrita—Family Guy production work](https://jonathancaustrita.art/family-guy). Artist's own credits/pilot context read. Portfolio pointer; no extracted assets included.
- **R8:** [Ui Shigure / ClipStudioOfficial—How to Draw a Variety of Hands](https://tips.clip-studio.com/en-us/articles/1338). Primary creator tutorial read, including structure, thumb base, joint arcs, folded hands and stylisation. Not a universal anime pipeline or medical anatomy reference.
- **R9:** [Autodesk Maya—Skinning a hand](https://help.autodesk.com/cloudhelp/2027/ENU/Maya-CharacterAnimation/files/GUID-99A8D786-4A4C-4280-A130-27D2B5F004C6.htm). Official documentation read; deformation principles, not a requirement to switch the project to Maya.
- **R10:** [Animation Mentor / Nathaniel Seymour—Animating Hand Gestures](https://www.animationmentor.com/blog/tutorial-how-to-animate-hand-gestures/). Primary instructional article read; acted reference, purposeful posing, timing and upper-body coordination. Embedded full video not independently reviewed in this pass.
