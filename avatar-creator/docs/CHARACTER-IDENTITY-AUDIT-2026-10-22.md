# Studio and character identity audit — 22 October 2026

## Status and scope

Owner request: audit Johansson Studio and the avatar creator; preserve their playful, cute appeal while making the characters less reminiscent of Nintendo's Miis.

**Audit and proposed direction only. No character, creator, runtime or release has been changed.**
Source baseline: main `96a0f83583bb8f10c379f2640cd0216fd4294faa`.
Review branch: `codex/studio-character-identity-audit-2026-10-22`.
This document is also the task handover. The recommendations are proposals, not newly approved design rules.

Read the root instructions, World instructions, HANDOVER.md, the World handoffs of 21 October morning/evening and 22 October, ANIMATION_DIRECTION.md, the existing character-style brief, Studio workflow/where-to-edit notes, and the current sources listed below.

## Recommendation

Develop the existing **inked island storybook** identity: soft sculpted cheeks, readable necks and shoulders, expressive original faces, rounded bare hands, constructed island clothing and warm muted colours. Preserve Johansson, Thuan and the cast's recognisable features. Make a small representative prototype before changing the entire roster.

Do not replace one game's recognisable look with another's. Large heads, simple features and approachable controls can remain; the specific drawings, silhouettes, interface artwork, performances and branding should be independently authored.

## Verified findings

| Priority | Evidence on main | Consequence / proposed remedy |
| --- | --- | --- |
| P1 | Studio imports World's `openCreator`; both use the shared recipe/build/face engine. | Keep one character system. Establish a versioned appearance migration before changing existing saved characters. |
| P1 | The 11 October `character-style.md` already proposes originality measures. Current `head-profile.js` still has heart taper .37, diamond .36 and teardrop .35 before jaw adjustment. | The guide is not an implementation record. Prototype softer lower faces and more distinctive cheek/chin profiles; retain meaningful shape diversity rather than making every head round. |
| P1 | `build.js measure()` retains neck .055 × scale and hand .056 × scale. | Trial a more visible neck and shoulder transition, plus fuller hands. Judge with collars, hair, poses and real characters; do not globally alter measurements without contact checks. |
| P1 | `personality.js` has four eight-step dials mapped to sixteen types; profile stores birthday, favourite colour and catchphrase. | This is a strong conceptual association with the reference series, rather than proof of infringement. Offer behaviour-led choices such as greeting, working rhythm, humour and social habits; preserve old profile data and avoid merely renaming sixteen types. |
| P1 | PR #301 is open, stacked on #300, and explicitly records rejected hand geometry: handedness, wrist attachment, thumb and folded-finger defects. #300 is open and was not mergeable at inspection. | Treat the hand project as unfinished. Reconcile the owner's latest digit-count instruction before modelling: this PR says four fingers plus thumb, while the later conversation mentions four fingers. Do not merge the rejected geometry as a shortcut. |
| P2 | Appearance history in `creator.js` is an undo stack capped at 60; there is no appearance redo stack/control in inspected main. | Add transaction-based Undo/Redo, grouping a continuous drag as one edit, plus per-feature locks and before/after comparison. Pose history in an open PR is a separate feature. |
| P2 | Studio already offers front/quarter/profile/back views, neutral/side lighting, expressions, poses, feature reset, PNG/design/GLB actions and scene handoff. | Improve discoverability and comparison; do not rebuild features that already exist. Show a compact review strip for neutral, smile, surprise, profile and full body. |
| P2 | Seven Studio modes compete at the top; character tooling is assembled around the shared creator. | Make a clear Character workspace with Appearance, Wardrobe and Performance sections; keep scene/model/room authoring available as separate workspaces. Preserve phone access and keyboard labels. |
| P2 | `randomRecipe()` chooses skin from `pal.skin.slice(0,7)`, excluding the last two swatches. It never selects the elder life-stage although it generates older-looking adult recipes. | Offer locks and curated outfit combinations, use the full intended skin selection, and explicitly support elder generation. Preserve deterministic seeds through a generator version. |
| P2 | Cloth palette/random defaults still differ from the muted palette proposed by the style guide. | Apply a curated island palette to new presets and random outfits first. Preserve existing signature colours and custom colours in saved designs. |
| P1 | `docs/apk-character-study.md` records Miitomo APK inspection and selected decompilation; it states no Nintendo meshes, textures, shaders or implementation code were added. Root notices distinguish references from licensed reuse. | This is a provenance review item, not evidence of copied shipping assets. Trace the origin of shipped face drawings, hair meshes, UI icons, sounds and shaders. Keep truthful research history; renaming comments or deleting credits does not resolve copying or licence obligations. |

Source locations: `avatar-creator/studio.js`, `docs/STUDIO-WORKFLOW.md`, `docs/apk-character-study.md`; `johansson-town/src/avatars/{creator,recipe,build,head-profile,face,personality}.js`; `johansson-town/briefs/character-style.md`; root THIRD_PARTY_NOTICES.md.

## Character direction to prototype

- **Silhouette:** keep a large, friendly head. Give the neck, shoulders, torso and shoes clearer structure; offer a few coherent proportion families instead of increasing every slider's range. Compare present proportions with a modestly taller adult option before choosing measurements.
- **Face:** author a small signature family of bead/ink eyes, lids, brows and expressive mouths. Preserve optional varied eyes and ethnic facial variety. Check front and profile noses together so painted and sculpted features read as one nose.
- **Hair:** retain simple readable masses with a few deliberately shaped locks, partings and asymmetry. Avoid a shared helmet outline across otherwise different characters.
- **Hands:** rounded palms and short digits, consistent ink, correct left/right construction and seamless wrists. Relaxed, wave, peace, pointing, holding and thumbs up/down must read in silhouette and motion.
- **Clothing:** collars, cuffs, seams, pockets and restrained fabric patterns carry identity. Preserve kariyushi, shop aprons, ferry workwear and personal accessories; avoid excessive realistic fabric detail.
- **Performance:** individual posture, eye-led attention, a greeting and a working idle convey more personality than extra face parts. Keep broad comic expressions, with controlled transitions and secure prop contacts.
- **Materials:** retain cel shading and ink; make skin, hair, cloth and glasses respond distinctly without shiny plastic skin. Scale outline treatment with character/detail size.

Ink, proportions or a new name alone are not legal safeguards.

## Creator improvements

1. Clear route: choose a starting person → shape their appearance → dress them → review expressions and movement → save or use in a scene.
2. Keep detailed feature editing under Adjust. Add feature locks, linked/unlinked symmetry, reliable Undo/Redo and a non-destructive comparison view.
3. Add a small named character library with thumbnails, Save as new, Duplicate and explicit saved/unsaved status. The current character save key stores one active recipe; distinguish it from existing scene/model libraries.
4. Let users randomise only the face, hair or outfit, with locked identity features. Offer coordinated everyday outfits rather than unrelated random parts.
5. Add a fit review: hats/hair, glasses/nose, collar/neck, hands/lap, seated skirt, feet/floor, glass/lips. Report actual problems; do not label an unchecked design as validated.
6. Recover gracefully when WebGL cannot start: replace the loading state with a clear explanation and retry/help. No endless blank editor.

## Staged delivery and acceptance

| Stage | Deliverable | Required evidence |
| --- | --- | --- |
| 1 | Originality/provenance inventory and current visual baseline | Source/licence record for each shipped part family; current desktop and 390×844 captures; distinguish research from shipped assets. |
| 2 | One small character prototype in the shared engine | Before/after sheets of Nils, Thuan, Tetsu, an elder and a child; front, quarter, profile and back. Preserve identity and skin/hair diversity. Owner reviews before cast-wide rollout. |
| 3 | Head/hair/clothing fit and hand milestone | Neutral and expressive faces at portrait size; hands from palm/back/side on both arms; walking, sitting, drink contact and wardrobe combinations. No floating, flickering or obvious intersections. |
| 4 | Creator workflow improvements | Appearance Undo/Redo, locks, duplicate/save/open round trips, phone and keyboard operation; old saved recipes survive. |
| 5 | Shared rollout | Studio and World produce matching characters; scene and GLB export/import checks; measured frame cost on desktop and physical iPhone/iPad. Rebuild runtime and regenerate affected portraits only after acceptance. |

Do not bundle this with ground, world layout or lighting changes. Preserve existing bone contracts and saves; add explicit schema/render-style versions when needed. No repository split during the course.

## Legal scope

This audit is design and engineering guidance, not legal clearance. PRV and the European Commission's IP Helpdesk distinguish game ideas from their particular expression and note that characters/artwork can be protected. Copyright, trade marks, design rights and potentially patents need separate consideration. There is no percentage of visual alteration that guarantees freedom from a claim.

Before commercial release, have a qualified games/IP solicitor review actual comparison sheets, the creator interface, branding, provenance and relevant rights in the intended markets. Do not promise that an outline or revised head makes the product Nintendo-safe.

Sources checked 22 October 2026:
- [PRV: copyright in games](https://www.prv.se/sv/spelutveckling/hantera-spelkoncept-strategiskt/upphovsratt/)
- [European Commission: IP in the videogames industry](https://intellectual-property-helpdesk.ec.europa.eu/regional-ip-helpdesks/european-ip-helpdesk/europe-ip-specials/europe-ip-specials-ip-videogames-industry_en)

## Verification and handover

Performed: current-main source inspection, handover review, current PR #300/#301 state reads, live Studio startup attempt and one reload, console inspection, and inspection of the historical `docs/qa/after-studio.jpg` image.

**Live visual limit:** this cloud browser cannot create a WebGL context (`GL_RENDERER = Disabled`). Studio remained partially loaded after retry. This establishes a browser-environment limitation and an opportunity for better error recovery, not that Studio is broken on the owner's device. The recorded photo is historical and is not current-main visual acceptance.

No gameplay tests, performance measurements, physical-device checks, fresh character renders or complete forensic asset/licence audit were run. No full visual or legal clearance is claimed. No implementation or release is included.

Next concrete action: capture the current cast on a WebGL-capable renderer, then prototype stage 2 and present comparable pictures before any global appearance change. Check the latest hand PR and owner instruction before touching the hand model.
