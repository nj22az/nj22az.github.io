# Latest handovers

Start here on every task, then read the latest applicable notes below. Maintain this index whenever a new note supersedes one of these. For an area without a note, create and link one when handing over work. Dates alone do not settle conflicting information: verify current branches, PRs, checks and releases.

**Sakura keeps its upper-floor office (the owner, 24 October 2026, 20:07: "Actually Im starting to like the top floor office on Sakura , abort removing it").** The single-storey Sakura (Codex's `development` prototype, draft PRs #378/#384/#385, CAD Rev D/E "one storey, roof-only stair") is **not** to be carried to `main`, and the Pixar konbini is not to drop the upstairs. Main is unchanged: the office and rest room upstairs stay (`src/world/interiors/sakura-office-room.js`, `SAKURA_UPSTAIRS`). Ground-floor detail from that prototype may still be proposed on its own, without removing the upper floor.

## Next week's priority — from 24 October 2026: the Pixar world

**The Pixar-style konbini (Sakura Shōten) with Thuan, Johansson and Fujita interactions.** Three branches in each repo (the owner, 24 October): `main` (the cartoon World), `development` (Codex's prototypes), `pixar` (the Pixar work); every other branch is kept as an `archive/<name>` tag. Start from [the Pixar handover](johansson-town/briefs/HANDOFF-PIXAR-2026-10-24.md); the branch survey is [docs/BRANCHES-2026-10-24.md](docs/BRANCHES-2026-10-24.md).

## Current owner priority — 23 October 2026

**Make Minato impeccable and immersive: “a little paradise that you wish were real.”**
Read the [Minato design direction in the World handover](johansson-town/briefs/HANDOFF-2026-10-22-afternoon.md#owner-direction--23-october-2026-minato-comes-first).
Refine existing places, residents' daily lives, comfortable interactions, atmosphere and reliability.
The third city island is low priority and deferred until explicitly reprioritised by the owner.

| Work area | Current handover |
| --- | --- |
| World: original CAD cargo ship and eastern berth | [25 October cargo berth publication](johansson-town/briefs/HANDOFF-CARGO-BERTH-2026-10-25.md). Owner explicitly requested publication. Original 72 m ship and 100 m quay; integrated with current main, its ground plan and existing ferry. Release checks/publication state are recorded in the note. |
| World: fish-market floating price board | [25 October auction-board correction](johansson-town/briefs/HANDOFF-AUCTION-BOARD-2026-10-25.md). Reuses the harbour cabinet, hood and grounded posts; final validation/publication state in the note. |
| World: island trees, main publication | [25 October owner-authorised tree publication](johansson-town/briefs/HANDOFF-TREE-MAIN-2026-10-25.md). Isolated CAD-derived trees from `5ab0316`, enabled by default; cherry and planting centres retained. **23 focused checks passed** on the final main candidate; current-main runtime rebuilt. Full guard, Pages and ordinary-play browser review are tracked in the note. |
| World: residents talking and interacting on the web | [25 October NPC social restoration](johansson-town/briefs/HANDOFF-NPC-SOCIAL-2026-10-25.md). Browser social budget restored; both schedule controllers share nearby exchanges, including Vy. Local checks and publication state are recorded in the note; physical Safari remains unverified. |
| Linux fixed Steam Deck controls | [0.2.21 release evidence](linux-port/acceptance-0.2.21.md). **Published** through [PR #398](https://github.com/nj22az/nj22az.github.io/pull/398), release `22a03f8c`. Fixed sticks/buttons, explicit left/right trackpads, retained saves/camera tuning and usable-input-loss recovery. **42/42 desktop, 421/421 guard, 92 WebGL cases / 19 Looks**, compiled Deck, native, offline and full baseline acceptance pass. Published artifacts/update verified; website verified after Pages 40170586119: 26 exact files, seven current release links, both guide aliases and installer equality. Physical Deck remains unverified. |
| Linux 0.2.20 facial correction package | [25 October release evidence and screenshots](linux-port/acceptance-0.2.20.md). **Published** through merged [PR #397](https://github.com/nj22az/nj22az.github.io/pull/397), release `a56db368`; exact candidate/release tree verified. **413/413 World guard**, complete Linux acceptance and final release/installer gates pass; **92 packaged WebGL cases / 19 Looks**. All **1,621 archive files**, **32 runtime modules**, public assets/checksums and installer verified. World/install pages and installer are live; **21 public files**, **seven current release links** and installer equality verified after Pages deployment. Physical Steam Deck/8BitDo acceptance remains unverified. |
| World / Studio: painted facial features fading under filters | [25 October facial visibility correction](johansson-town/briefs/HANDOFF-FACE-VISIBILITY-2026-10-25.md). Shared head lighting floor and Sketchbook dark-feature preservation; original defect reproduced. **413/413 guard**, **92 WebGL cases across 19 Looks**, rebuilt-game midnight/room checks pass. **Published to main as `c36a40c`** (source/runtime `b2f6f71`); [Pages deployment passed](https://github.com/nj22az/nj22az.github.io/actions/runs/40138237247), and all **seven checked public files** match the tested delivery byte-for-byte. GitHub guard [40138238061](https://github.com/nj22az/nj22az.github.io/actions/runs/40138238061) was still running at this publication check; local full guard passed. Physical Safari remains unverified. [Linux 0.2.20 now includes this correction](linux-port/acceptance-0.2.20.md), with published package/source/checksum verification. |
| World: Nakamura / Blue Coral exterior CAD audit | [24 October measured exterior audit](johansson-town/briefs/HANDOFF-NAKAMURA-EXTERIOR-AUDIT-2026-10-24.md), recorded in `cfad7c39`. Source and owner-screenshot review: pole lies in the family-door approach; banner and crossarm are perpendicular; no base/fixing or pole collider in the builder. Measurements and proposed wall-mounted correction recorded. **Audit only: no runtime change, repair or gameplay acceptance.** Next: implement and verify entrance/queue/flag envelopes and open/closed views. |
| World: moving car collisions | [24 October vehicle-collision repair](johansson-town/briefs/HANDOFF-VEHICLE-COLLISION-2026-10-24.md). Verified candidate: vehicle colliders follow driving/held/reversing/ferry poses, live dynamic spatial queries and no conversations with seated drivers. Full guard and compiled-game desktop/phone-width checks pass; publication pending. |
| World / Studio: Thuan CAD and shared game arms/hands/legs/feet | [24 October Thuan CAD](johansson-town/briefs/HANDOFF-THUAN-CAD-2026-10-24.md), updated **14:00 UTC**. **Revision A, amendment 2: design/reference mathematics only; no game mesh or runtime changes.** **12 A3 sheets**, 12-region 1:1 proposal DXF with **27 native dimensions**, original 16 preserved, zero audit errors/fixes; current measured DXF unchanged. Directional elbow/knee fans, outfit-specific full-arm coverage, axial-only helper with last-12-mm wrist blend, existing six-sided fingers/cupping, collar **122×130 clear / 142×150 outer / 10 mm recess**, staged foot roll and separate scalar AO specified. Foot reference: **1,419,860 evaluations, minimum Y = 0 mm and support error = 0 mm**, within stated flat-plane assumptions; no actual-shoe/gait acceptance. **20 captures: 17 baseline + three current-model static candidates**; **26.099 mm lower-arm clearance** remains static. Ceiling **62 bones**, first 28 stable, ≤4 weights; canonical Thuan ≤22k primary triangles, other recipes ≤4,198 net extra. Source review **62bd8870**, measured geometry **30771c7**; World/film scales remain separate. Twelve PDF pages record no text overflow. Final amendment-2 aggregate/package-save verification: **39/39 artifact checks pass; ZIP CRC and hashes verified; eight deliverables saved**; established file identities retained in the handover. Next: compatible shared game prototype on `development`, full motion/Look/device validation before promotion. |
| World: Sakura street poster on Blue Coral | [SP-NK-001 rev C](johansson-town/docs/qa/sakura-street-poster/README.md). Pixar Thuan B1 poster on the ice-cream shop's south wall, measured clear in the built town; guard 79/79. |
| World: Sakura wall band (the lettered board round the shop's walls) | [24 October wall-band handover](johansson-town/briefs/HANDOFF-SAKURA-WALL-BAND-2026-10-24.md). CAD SK-WB rev A (49/49 checks) and built: one composition per wall, clear of the beams, stripe on its own rail; Eisa poster and cigarette rack lowered under it. |
| World: realistic harbour noticeboard remake | [24 October noticeboard handover](johansson-town/briefs/HANDOFF-NOTICEBOARD-DESIGN-2026-10-24.md). **Implemented from revision A and published to `main` on the owner's word** (evening of 24 October): measured case, hood, acrylic doors, posts on their two grades; papers in their drawn places with no stacked faces; corrected flyer hours and map. Woodland/flyer/z-fighting tests and the compiled-game review pass; physical-device check outstanding. |
| World: bench beside the harbour notice board and ferry-office door hood | [24 October frontage correction](johansson-town/briefs/HANDOFF-FERRY-OFFICE-FRONTAGE-2026-10-24.md). Earlier unreferenced review never reached live main. **Published and verified** as [`580de3c1`](https://github.com/nj22az/nj22az.github.io/commit/580de3c1ed4f12c3e2f962dd49370435bf4256cb). Bench and door hood removed; newer woodland poster/board/viewer and old-save compatibility preserved. Local World guard **400/400**, extra checks **20/20**, six real-game views and poster open/close pass. GitHub guard and Pages passed; **54/54 live files** match. Signed off. |
| World: woodland diorama notice-board poster | [24 October woodland-poster handover](johansson-town/briefs/HANDOFF-WOODLAND-POSTER-2026-10-24.md). Corrected R3 poster on the harbour board; **Look** opens the local 3D viewer. **Published to main as `afe5ba6`; Pages verified live.** Full GitHub World guard **401/401**, final compiled-game 14/14, and ten live-file integrity checks pass. See the note for controls, evidence and Linux-package limits. |
| World website / Linux consolidation | [World website handover](world/HANDOVER-2026-10-24.md), including the 25 October Linux 0.2.20 follow-up. Downloads, installation guide, public installer and current-version references are integrated only after final artifact verification; old release history and anchors are preserved. See the release evidence for live-file sign-off and physical-device limits. |
| Studio / Avatar Creator: Vy from the supplied GLB | [24 October Vy reference handover](johansson-town/briefs/HANDOFF-VY-REFERENCE-2026-10-24.md). **Owner accepted and authorised replacing current Vy everywhere, including the website.** Shared default, saved-look upgrades, guide photos and mascot complete. All 4 pair tests and complete **387-check World guard pass**; merged greeting/runtime 8/8 and built-game smoke pass. Implemented in `8033aa3`, combined with newer main in `83bb0e7`; publication verification pending. |
| Blog: Hotels & Parking | [25 October Swedish Scandic audit](blog/hotels/HANDOVER-SWEDEN-AUDIT-2026-10-25.md). 91 Swedish properties reviewed: 72 Avoid / 19 free. Adds 67 Avoid and green Värnamo; 128 hotels and verified map points overall. Previous 60 records/CSV rows preserved; receipt and access rules retained. See note for checks and deployment sign-off. |
| Conversation greeting eyes | [24 October correction and validation](johansson-town/briefs/HANDOFF-CONVERSATION-EYES-2026-10-24.md). One-line nod expression correction; actual controller tests, rebuilt runtime, complete guard and built-game smoke passed on the validation branch. Check the note and current main for promotion state. |
| Studio: Seventeen Beers sea-wall comic | [23 October sea-wall comic handover](johansson-town/briefs/HANDOFF-SEVENTEEN-BEERS-COMIC-2026-10-23.md). Canonical Fujita/Johansson, actual promenade bench, Risograph and editable creator mark; PNG/project and nineteen-style PDF delivered, with Risograph first and one complete strip per page. Reusable sea-wall camera location added to Studio. |
| Studio: Pixar-style rigged cast in Blender (Thuận, Johansson, Mr Fujita; clothes) | **Studio repo** `nj22az/jojo`, branch `pixar` (was `claude/lucid-sagan-ztc2th`), folder `3d/cast/` (`README.md`, `progress.md`, `checks.md`, `sources/task.md`). 23 October 2026, a prototype, not a World asset; nothing in World changed. **Thuận**: generated body (Higgsfield `z_image` + Tripo H3.1) rigged in Blender from code (IK legs with reverse foot, braids, jaw, clavicles, two-bone arm solve, code-sculpted five-digit hands grafted at the wrists). **Johansson** (lean, 180 cm, "her husband, not grandpa"): no credits, the shape from Hunyuan3D-2mini run on the CPU (`hunyuan_cpu.py`), painted in Blender from the concept (`concept_paint.py`), rigged the same way. **Mr Fujita**: the rejected heavy first Johansson, repurposed by the owner, shirt re-dyed yellow, head drawn in to 75%, shown at 160 cm. **Clothes** (`wardrobe.py`, `shots_outfit.py`): Thuận in a white balloon-sleeved blouse, black pinafore and velvet bow, posed after an owner's reference photo (pose and clothes only). Open: Johansson's sides are painted from front/back only; Thuận's painted eyes (no blink/aim); sleeve folds above ~70° arm raise; clothes are modelled per pose (stills), not yet skinned for animation. **Poster shoot** (24 October): Sakura's cold cabinet and its corner of the shop rebuilt in Blender from World's measures, for stills only (`set_sakura.py`, `props.py`: World's painted labels, every line in its World flavours), Thuan holding NAGI; layout `art/poster/sakura_tea.py`. Found in World and left for the owner: the cold-cabinet products' `purpose.placed` notes (coffee "under the tea", milk "top of the last column", tea "eye level") contradict `shelf.levels`, which count from the bottom (`studio/rules.js`), so the game shows them the other way round. **Next week's priority** (the owner, 24 October): the Pixar-style konbini with Thuan, Johansson and Fujita interactions; start from `jojo/3d/sakura/progress.md`. **Pixar-style konbini plan** (24 October): `jojo/3d/sakura/PLAN.md`, built from Codex's single-storey Sakura (`codex/sakura-counter-operations` pinned at 719f1435, draft PR #385 on #384/#378), CAD first as the owner's rule asks; the poster moves to its walk-in cold room. The poster set itself builds World's current room (`set_sakura.room`). Also found in World and left for the owner: the Eisa poster's print reads "Acer" where it means Eisa (`sakura-dressing.js` eisaPoster). The owner renders finals on a Mac M1 Pro (`jojo/3d/cast/RENDER-ON-PC.md`). Credits used ~19.9 of 22; `libopengl0` was installed in the container for MeshLab (add it to the setup script to keep it). The Codex hand plan (draft PR #360) is the background; its five-digit rule is kept. |
| World / Studio: experimental print and paint looks | [23 October print-media shader handover](johansson-town/briefs/HANDOFF-PRINT-MEDIA-SHADERS-2026-10-23.md). [PR #383](https://github.com/nj22az/nj22az.github.io/pull/383), publishing implementation `9aa922e1`, adds Risograph, Pencil Manga, Heavy Brush Oil and Rubber Stamp; accepted styles preserved. Four comic variants and twelve full-game views (including Minato Izakaya), eight-page PDF and editable projects delivered. Merged with owner approval as `2b836773`; World guard passed, extended Linux conversation acceptance timed out and was retried. Follow-up pushed to main as `9f546d5b` adds a discreet editable Johansson creator wordmark to new comics, with project/share persistence; see the latest handover section. |
| Studio: Fujita television comic | [23 October production handover](johansson-town/briefs/HANDOFF-FUJITA-TV-COMIC-2026-10-23.md). Latest: [shared shader implementation handover](johansson-town/briefs/HANDOFF-SHARED-SHADERS-2026-10-23.md): World/Studio share geometry-aware illustration effects, capture buffers and export quality; Manga/Cartoon/Oil comparisons delivered on a review branch, followed by the owner’s second review: binary Manga, calmer Cartoon colour, highlight-only Oil grain and broken surface-pencil strokes. Owner approved and merged the recovery in [PR #382](https://github.com/nj22az/nj22az.github.io/pull/382), main `50f531d3`; both GitHub World guard and Linux acceptance passed. Four-language Manga source/lettering follow-up pushed to main as `f7a82033`; exports (Vietnamese/Japanese/Swedish/English), editable projects and PDF delivered; see the latest merge/language section in that handover. Latest visual recovery removes the rejected Storybook/Sunday/Gouache experiments, restores the accepted Cartoon/Manga/Oil and ink prepass, and retains the Crayon cheek fix and architectural Sketchbook. See the handover’s recovery section; do not revive the rejected hybrids without a new owner request. Physical-device acceptance remains outstanding. New Thuan “Make something of your life” comic with an unnamed man, hero burst and football ending; see the Thuan revision section ([PR #381](https://github.com/nj22az/nj22az.github.io/pull/381), merged `070f8f54`; image/project delivered, Pages verification pending). After effects MCP 1.7 adds discovery and comic editing/export tools; see the MCP wiring section in the handover ([PR #380](https://github.com/nj22az/nj22az.github.io/pull/380), merged `b287e702`). After effects adds replacement text, shader looks, image/sticker assets and English/Swedish versions. [PR #379](https://github.com/nj22az/nj22az.github.io/pull/379) merged as `101dc238`; After effects verified live. Earlier: corrected speech-bubble joins and head clearance ([PR #377](https://github.com/nj22az/nj22az.github.io/pull/377), merged `23629714`); built-in editable comic, camera/pose editing and 14 per-panel shader looks; project round-trip verified. Merged in [PR #375](https://github.com/nj22az/nj22az.github.io/pull/375) as `fffc491b`; Pages deployment verified. Editable scene/comic sharing and the immediate preview merged in [PR #376](https://github.com/nj22az/nj22az.github.io/pull/376), `ee165872`; public comic viewer and Studio sharing entry verified live. |
| Current fighting withdrawal: web and Linux | [22 October implementation handover](johansson-town/briefs/HANDOFF-COMBAT-WITHDRAWAL-2026-10-22.md). [PR #365](https://github.com/nj22az/nj22az.github.io/pull/365): merged to main as `4a52d5d2161f9691b8f3e808ba959389f463e578`; [Linux 0.2.17](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.17) published through merged [PR #370](https://github.com/nj22az/nj22az.github.io/pull/370). 367 World checks, full Linux acceptance and public installer/checksum verification passed; signed off. |
| Food service and seating integration: PR #350 on main plus PR #351 | [22 October combined integration review](johansson-town/briefs/HANDOFF-FOOD-SEATING-INTEGRATION-2026-10-22.md). [Merged PR #356](https://github.com/nj22az/nj22az.github.io/pull/356), squash commit `2fd64868fe6da67619cef618ed8c67174843a96f`. Owner approved the combined screenshots; handover signed off. |
| Johansson World: world, characters, benches and storytelling | [22 October 2026 afternoon World handoff](johansson-town/briefs/HANDOFF-2026-10-22-afternoon.md) (seated poses #351, civic comic backdrops #352, retired-cast tests #353), after the [morning one](johansson-town/briefs/HANDOFF-2026-10-22.md). Also read the earlier notes they reference. |
| Minato Izakaya: food preparation, separate food/drink delivery and serving clearances | [22 October 2026 food-service handover](johansson-town/briefs/HANDOFF-IZAKAYA-FOOD-2026-10-22.md). Read alongside the World handoff. |
| Nhung becomes the island doctor (Dr Kakazu retired into her); Front-Row's trade and Saturday closing at Sakura | **Merged** to main through [PR #362](https://github.com/nj22az/nj22az.github.io/pull/362) on the owner's word (23 October 2026; branch `claude/clever-ride-qdpo8s`, with main merged in and the runtime rebuilt): [task folder](johansson-town/briefs/nhung-doctor/progress.md) and the session notes below. |
| Higa Liquor closes into Sakura (Sakura sells and supplies all the drink, Kōji's round is Sakura Trading's, the shop shut with a notice) | **Merged**: [PR #363](https://github.com/nj22az/nj22az.github.io/pull/363) into #362's branch (`41fed9ec`), and with it to main through #362 (23 October 2026): [task folder](johansson-town/briefs/higa-liquor-closes/progress.md) and the session note below. |
| #362 and #363 merged; the money model closed for now; the next step (simplify background processes) | **Latest:** [22 October 2026 night handoff](johansson-town/briefs/HANDOFF-2026-10-22-night.md). Supersedes the two session notes of 22 October (late evening, night) below for state; they keep the detail. |
| Claude Code skills: Colorfigures (hand-inked interactive isometric figures) | **Merged** to main as [PR #361](https://github.com/nj22az/nj22az.github.io/pull/361) (squash `a0fb347c`), only `.claude/skills/colorfigures/` (8 files, MIT, reviewed before adding). Signed off. |
| Look setting (shader styles under Settings in the Town book) and Free camera (frozen fly-round view) | [22 October 2026 looks handover](johansson-town/briefs/HANDOFF-LOOKS-2026-10-22.md). Branch `claude/upbeat-hamilton-4bhz8q`, pushed straight to `main` on the owner's instruction ("Push camera to main"). |
| World test maintenance: save consolidation and frozen screenshot regression | [22 October save-consolidation sign-off](johansson-town/briefs/HANDOFF-SAVE-CONSOLIDATION-2026-10-22.md), PR #369, merged as `97579cc0b4bfd4af3523e3ae0bf25d672643d82b`; 350 local checks and the GitHub guard passed. Earlier [frozen-audit sign-off](johansson-town/briefs/HANDOFF-FROZEN-AUDIT-2026-10-22.md), PR #368, merged as `67856af51864165014f12299966065411b3eb381`. Read alongside the World handoff. |
| Linux edition, controllers, right-stick camera and release integration | [22 October 2026 Linux controller handover](HANDOVER-LINUX-JOYSTICK-2026-10-22.md). Read alongside the World handoff for shared game changes. |

The newest note for Nhung the doctor and Higa Liquor is the [22 October 2026 night handoff](johansson-town/briefs/HANDOFF-2026-10-22-night.md): both merged to main through #362 on 23 October; the money model closed for now; next, simplify background processes.

The Linux controller note contains newer merge and release information than the morning World note. Real-device confirmation of right-stick camera control on Bluetooth and Steam Deck remains outstanding; follow that note's reproduction steps. Its evening update: a saved Look axis past the pad's axes now falls back to the right stick (`84baf00`, for 0.2.17, unreleased; it rides the Nhung doctor PR from `claude/clever-ride-qdpo8s`).

## Session handover — 24 October 2026 (night), branch `claude/peaceful-johnson-103tja`: Linux 0.2.19

#393 (Vy cel-shaded) is merged as `94613e2`. The owner: "Linux is still 0.2.18" and "Yes build it pls". Prepared as 0.2.18
was: current main merged into `codex/johansson-world-steam-deck` (tree checked equal to main), version 0.2.19 in
`steam-deck/package.json`, `package-lock.json`, both `install.sh` copies, and `steam-deck/releases/0.2.19.md` (Vy cel
shading, Make a face, harbour noticeboard and woodland diorama, solid cars and the flowerbed bench, the installer's
Steam Library and Gamepad layout). `npm test --prefix steam-deck` passed locally. Release PR into the release branch;
merging it publishes. After: verify assets, installer, checksum; point the website at 0.2.19 on main.

**0.2.19 published:** #394 squash `e5d0c94` (its Linux console acceptance, run 40117841659, passed), [release workflow
40120289660](https://github.com/nj22az/nj22az.github.io/actions/runs/40120289660) green. Verified by hand: archive and
0.2.18→0.2.19 patch match `SHA256SUMS`, the manifest and GitHub's digests; the app reports 0.2.19; the packaged
`build.js` has Vy's cel shading; the release installer equals the website's. Evidence:
`linux-port/acceptance-0.2.19.md`. The website (World page, install guide, installer at 0.2.19; the comparison table's web
column now says play as any resident; a 0.2.19 change-log entry) goes to main in its own PR. Still unverified: a real
Steam Deck, above all whether the Gamepad layout fixes the owner's controls.

## Session handover — 24 October 2026 (late evening), branch `claude/peaceful-johnson-103tja`: Vy cel-shaded

#392 (Steam Gaming Mode install, Deck Gamepad layout, REA) is merged as `b845f0b` and live; the owner has still to run the
`--steam` command on the Deck and report whether the controls work.

The owner: "Vy has a shiny 3d head instead of being celshaded like the rest of the characters, can you implement full cel
shading on her" and "bring her head to the avatar creator". Cause: the `sculpted` head form (Vy's, from the 24 October
reference work) was deliberately exempt in `src/avatars/build.js`: plain `MeshStandardMaterial` instead of
`celFrom(…,{bands:'soft3'})`, near-sphere normals (0.15 lerp against everyone else's 0.7) and no ink-nose bump. Now every
head form is shaded the same; the sculpted silhouette is kept. Her head was already in Studio's Face → Style picker as
"Soft sculpted" (the last of 19 shapes); it now renders cel-shaded there too (checked in Studio on Johansson).

Resident guide portraits re-rendered with `tools/render-resident-guide.mjs` (the hash covers `build.js`): Vy's is now
flat-shaded; five others (06, Aya, Mai, Mr Fujita, Ms Ganaha) had been stale and now show the tailored skirt the game
already draws. Checks: Studio before/after renders of Vy and Thuan looked at (Thuan unchanged); 32 avatar/Vy tests;
runtime rebuilt; full guard 409/409, 77 files. Next: Linux 0.2.19 (the owner noticed Linux is still 0.2.18).

## Session handover — 24 October 2026 (evening), branch `claude/peaceful-johnson-103tja`: Steam Gaming Mode install, Deck controls, REA

**#391 (play as anyone, faces) is merged** (`28f68fc`). Its second Linux failure was real: the console check still asserted
the old "web has no character system" rule; the check now asserts the web starts as Johansson, out of bed, no Linux UI.

**Owner, 24 October:** the installer should put the game in Steam's Gaming Mode, and on the Deck "no controls work … I
can only move the camera by touching the screen … the install should map to the controller". The installer
(`steam-deck/install.sh`, copied byte-for-byte to `johansson-world/install.sh`, the website's command) now:
- writes a *Johansson World* non-Steam shortcut into every Steam account's `userdata/<id>/config/shortcuts.vdf` (binary
  KeyValues; other shortcuts kept; an earlier hand-made *Johansson World* entry replaced; first original kept as
  `shortcuts.vdf.before-johansson-world`), closing Steam first with `steam -shutdown` if it is running, since Steam
  overwrites the file otherwise;
- sets Steam Input for it to the Deck's built-in `controller_neptune_gamepad_fps.vdf` ("Gamepad with Camera Controls") in
  `steamapps/common/Steam Controller Configs/<id>/config/configset_controller_neptune.vdf`, keyed by the lowercased name,
  with a backup. Likely cause of the owner's fault: Steam guessing a keyboard/mouse layout for an unknown non-Steam game;
- `sh install.sh --steam` does only those two steps for an existing install; `JOHANSSON_NO_STEAM=1` skips them.
Sources: the configset format, key and template name from Valve's steam-for-linux issue 13251 and community projects
(Deckhand #25, kuluu-ffxi #568). **Unverified:** the root key `controller_config` is used only when the file does not
exist yet (an existing file keeps its own root); no physical Steam Deck was available, so whether this fixes the
owner's controls is not yet confirmed. Ask the owner to run the `--steam` command and report.

The website: install guide and World page say the installer adds the game to the Library with the Gamepad layout and
give the `--steam` command; the copy buttons now copy their own block (the World page's button was broken: no
`.ferry-install` ancestor); script cache `?v=2`.

**REA** (`morluto/rea`) is a permanent development tool: `.mcp.json` registers `rea` pinned at `rea-agents@6.7.0`; root
`AGENTS.md` (new section) and `CLAUDE.md` say what to use it on and its limits. `npx -y rea-agents@6.7.0 --help` ran here.

Checks: `npm test --prefix steam-deck` 39/39, the installer fixture now covering the Library entry, the Steam Input layout,
backups and a second `--steam` run without duplicates; both pages in Chromium at 390 px: every copy button copies its own
command, no overflow, no page errors.

## Session handover — 24 October 2026 (afternoon), branch `claude/peaceful-johnson-103tja`: play as anyone and faces on the web

The owner asked whether "play any character", posing and emotions could come to the web, and chose both. Posing was
already there (Moves: 43 moves, 9 full-body poses with faces; the Photo studio). Added: **Town book → People → Play as**
on every playable resident's card (25), using Linux's own possession (`src/desktop/life.js`); on the web it runs only
while you play someone other than Johansson (`playingResident()` in `src/game.js`), so Johansson's web opening, house
and view are unchanged. Web saves keep who you play (`activities.js` loads `desktopLife`); residents and letters use that
name. **Moves → Make a face**: all 46 faces with their glyphs, held ten seconds (Neutral lets go); switching character
resets the face. The Moves text follows who you play. Insult/apology choices and full conversations stay Linux's.
Recorded in `johansson-town/AGENTS.md` under the 19 October edition ruling.

Checks: `town-directory` gains a Play as test; `controller-game`, `edition`, `harbour-festival`, `town-directory`
16/16 before it; **full CI guard 400/400, 76 files**; runtime rebuilt, `runtime-package` 4/4. Real built game in
headless Chromium (web, no desktop shell): Moves lists Make a face, the 46 faces open and Lovestruck applies; People
shows 25 Play as buttons with Johansson's "Playing now"; Thuan is controlled with her own body and a neutral face, the
book closes, Moves describes her; back to Johansson works; the save holds the choice; no page errors. Screenshots
looked at. Not checked: phone/iPad, touch controls, Linux edition after the change (its console check runs on the PR).

Open for the owner: a resident who is indoors when chosen starts at home in the plain Linux bedroom
(`desktop/bedroom.js`), which is much simpler than the town's dressed interiors; worth dressing per home before this is
promoted widely.

## Session handover — 24 October 2026, branch `claude/peaceful-johnson-103tja`: the "Acer" poster and the cold cabinet

A small World fix from the Pixar handover's list of slips. Sakura's Eisa festival poster printed "Acer" (a machine
translation of エイサー) and its inspect title read "Acer · Eisa poster". Now it prints "Eisa" and the title reads
"Sakura · Eisa poster", like the sale poster next to it (`src/world/interiors/sakura-dressing.js`). The glossary entry that
caused it (`docs/ENGLISH-LOCALISATION.json`) now reads "Eisa". Runtime rebuilt with `npm run build:runtime`. One older
`sakura-interior-*` chunk still contains "Acer" because the build keeps the previous build's chunks for open tabs, and
the next rebuild prunes it.

Checks run: `runtime-package`, `sakura-dressing`, `izakaya-posters`, `ferry-timetable-words`, `sakura-small-office` and
`sakura-upstairs`, 30/30 passed. Not run: the full `ci-guard` and any in-game look at the poster (no GPU browser check).
Pushed to the branch, no PR, not merged.

**Then the cold cabinet, on the owner's go-ahead.** The drinks' `placed` notes were right and the shelf numbers were
upside down (tea at the bottom, children's drinks at the top, milk at the bottom). Every cold-cabinet line's levels are
mirrored in `johansson-town/data/studio/products.json` and `src/commerce/products-data.js` is regenerated
(`tools/studio/build-data.mjs`, `--check` passes); runtime rebuilt. Now tea, water and cola stand at eye level, coffee, orange
and soda low, milk on top and beer low in the column by the till. Tests that pinned the old numbers updated, none weakened:
`products-move` gains a dated adjustment that asserts each line is exactly mirrored; the `studio-apply` double-booking and
empty-shelf cases and the `studio-mcp` beer row use the mirrored shelves. Before/after screenshots from the built game
(headless Chromium, desktop) were checked and sent to the owner.

Checks run: the catalogue, konbini, products, runtime-package, Sakura, shop, Studio and vending tests plus
`higa-shop-collision` and `housing-consolidation`: 228 of 232 passed. The 4 failures fail the same way on the unchanged
branch: `catalog` (catalog-data.js out of date), `shop-display` (three islands with a route), and two in `studio-apply`
(Mrs Kinjō is not a resident; the flavour cell case). Not run: the full `ci-guard`, phone/iPad views. The Blender poster set
in `jojo` copies this cabinet and should be re-taken.

**Then four stale checks, on the owner's "work after them".** The four failures above were the tests, not the town:
`catalog-data.js` regenerated from `assets/catalog` (one cap's buyer note); `shop-display` routes the till the way the
clerk walks (to `staffApproach`, then the straight step into the till pocket, now checked clear at `staffBody`);
`studio-apply` used Mrs Kinjō and the Bus driver, who have left the cast (now Nhung), and matched only the old wording of
the age refusal (now both current wordings). Runtime rebuilt; `origin/main` merged in (handover text only).

Checks run after all of it: the 232 shop/Studio/game-build tests 232/232, and the **full CI guard with a 10 GB heap:
391/391, 75 files, all green**. Not run: phone/iPad views, physical devices.

**Merged and published.** [PR #388](https://github.com/nj22az/nj22az.github.io/pull/388), squash `2cc5a6b`, merged on the
owner's word. On the PR, `guard` passed; `linux` (Linux console acceptance, run 40079598412) logged "Linux acceptance
passed" and was then cut off by the step's `timeout 20m` in the web-only recovery that follows (exit 124), as on #383's
run 39972713417; this session could not re-run it (403), and the owner chose to merge (see the PR comment). On main the
World guard (run 40081981794) and Pages deployment (run 40081981319) passed; the public site serves `boot-B2WrrZ5x.js`
and its Sakura chunk reads "Eisa" and "Sakura · Eisa poster".

Next: (1) **Linux 0.2.18**, only with the owner's go-ahead: the offline Linux edition still ships 0.2.17's World ("Acer",
the old cabinet) and lacks the controller fix `84baf00`; bump `steam-deck/package.json`, add `steam-deck/releases/0.2.18.md`,
bring main into the release branch and follow the release steps in
[the Linux handover](HANDOVER-LINUX-JOYSTICK-2026-10-22.md#commands-and-next-release). (2) The Linux console check's
20-minute step budget is now too tight for its web-only recovery after a full acceptance; give that step its own
budget rather than weakening it. (3) Re-take the Blender cabinet in `jojo`.

**Linux 0.2.18, prepared on the owner's go-ahead** (branch `claude/peaceful-johnson-103tja`, PR into
`codex/johansson-world-steam-deck`). The release branch was main at #365 plus 0.2.17's four version files, all already on
main, so current main (with this note) was merged in and the tree checked equal to main's. Then: `steam-deck/package.json`,
`package-lock.json` and `install.sh` at 0.2.18; `steam-deck/releases/0.2.18.md` (looks, Town book, Nhung/Higa Liquor,
Vy, greeting eyes, Eisa poster, cold cabinet, the controller fallback `84baf00`); and the Linux console check's
full-acceptance step given 30 minutes (job 45) so its web-only recovery is not cut off. `npm test --prefix steam-deck`
38/38. Publishing happens when the PR merges into the release branch (`johansson-world-linux.yml`); the owner confirms
that merge. After it: verify the release assets, installer and checksum, then point the website's downloads at 0.2.18
on main (`world/index.html`, `johansson-world/install.sh`, `linux-port/install/index.html`), as 7624d98 did for 0.2.17.

**0.2.18 published** on the owner's word: [PR #389](https://github.com/nj22az/nj22az.github.io/pull/389) squash
`c7540727` into `codex/johansson-world-steam-deck`; its Linux console acceptance (run 40084048887) passed in 30 minutes,
the full-acceptance step in 21. [Release workflow 40086718443](https://github.com/nj22az/nj22az.github.io/actions/runs/40086718443)
passed every step, published [the prerelease](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.18)
and verified the public installer. Checked by hand afterwards: archive and 0.2.17→0.2.18 patch match `SHA256SUMS`,
`latest-linux.json` and GitHub's digests; the app reports 0.2.18; the packaged Sakura chunk has the Eisa fix. Evidence:
[`linux-port/acceptance-0.2.18.md`](linux-port/acceptance-0.2.18.md). [PR #390](https://github.com/nj22az/nj22az.github.io/pull/390), merged as `5a5bddb` and verified live, carries the release files, that evidence
and the website (World page, install guide, installer at 0.2.18; the player guide's Town book paths and shop list
updated to the eight-tile book and the closed Higa Liquor; a 24 October change-log entry). The woodland diorama merged
to main after the release and ships next time. Still unverified: physical Steam Deck, 8BitDo, iPhone.

## Repository instructions handover — 22 October 2026

The owner requested that every new agent check the latest handover and update it when finished. Root [AGENTS.md](AGENTS.md#handover-required-at-the-start-and-end-of-every-task) now requires that lifecycle for every task, including partial or blocked work. [CLAUDE.md](CLAUDE.md) repeats the entry point so both Claude and Codex encounter it.

This change adds repository instructions and this index. Existing project rules and dated handovers are preserved. Validation: reviewed the current main instruction files and handover inventory; checked all local Markdown link targets and the three-file diff. No game, runtime or visual changes; no gameplay tests required.

Next agent: read the handover for your work area, verify live repository state, carry out the owner's task, and update that handover plus this index if its latest pointer changes.

## Session handover — 22 October 2026 (evening), branch `claude/laughing-rubin-6p25x2`

Not merged; no PR. Three things live on this branch, in this order:
1. `84baf00` **Controller fix** (steam-deck; 0.2.17 was published without it, so it ships in 0.2.18 or later): a saved Look/Move pair past the pad's axes
   falls back to the default sticks; test added, 39/39 desktop tests passed. Ready on its own; see the Linux note.
2. `a30a254`, `3fe01c0` and the commit carrying this note: **Nhung becomes the island doctor**, work in progress. Start
   with [its task folder](johansson-town/briefs/nhung-doctor/progress.md) (`progress.md`, `checks.md`,
   `sources/task.md`): the owner's decisions, what is done, the baseline comparison and the exact list still failing.
3. `54d1573` the Colorfigures skill, already on main through #361 (it merges cleanly).

Next agent: finish (2) per its Next action, keep (1) with it or split it into its own PR, then the queued Higa Liquor
step. Do not merge (2) to main before the CI guard is green and the runtime is rebuilt: main deploys the site.

## Session handover — 22 October 2026 (late evening), branch `claude/clever-ride-qdpo8s`

**Update, 23 October:** merged to main through #362 on the owner's word; see the [night handoff](johansson-town/briefs/HANDOFF-2026-10-22-night.md).

The branch holds `claude/laughing-rubin-6p25x2` (the controller fix `84baf00`, the doctor work in progress, Colorfigures)
plus main merged in, then the finishing commits. One PR to main, [#362](https://github.com/nj22az/nj22az.github.io/pull/362), carries both the controller fix (its own commit, kept as
it was) and **Nhung becomes the island doctor**; it is not merged: main deploys the site, and the owner merges on their
word.

Done here, as the [task folder](johansson-town/briefs/nhung-doctor/progress.md) records: the tests that stated the old
arrangement updated (none weakened; the sisters' game reports a todo), her red car fetches the clinic's medicines
from the airport freight on Monday and Thursday evenings, the clinic draws the doctor only when her day has her
there, Front-Row draws her at the paper in the evening, the jagged sage shirt under her coat fixed (and the same band on
every open jacket), portraits and article photos re-rendered and looked at, a separate review whose findings were fixed,
the runtime rebuilt once, last. `node tools/ci-guard.mjs` alone: 333 of 334, the one `no-z-fighting` running out of
memory on this container's Node 22 heap exactly as on the base commit (it passes with a 10 GB heap; CI runs Node 24).

Open for the owner (task folder, "Open issues"): the sisters' jan-ken-pon has no day now that Nhung keeps Sakura on
Sunday and it shuts on Saturday; books at Sakura are by order only; the clinic's "Mayor" wording.

Next agent: the PR waits on the owner. The Higa Liquor step (Sakura sells and supplies all alcohol, Kōji's round is
Sakura Trading's, the shop stands shut with a notice) is its own stacked PR, branch
`claude/clever-ride-qdpo8s-higa-liquor` on top of this one, task folder `johansson-town/briefs/higa-liquor-closes/`.

## Session handover — 22 October 2026 (night), branch `claude/clever-ride-qdpo8s-higa-liquor`

**Update, 23 October:** merged to main through #362 on the owner's word; see the [night handoff](johansson-town/briefs/HANDOFF-2026-10-22-night.md).

**Higa Liquor closes into Sakura** (the owner, 22 October: "close Higa Liquor. Sakura sells and supplies all alcohol,
Kōji's round becomes Sakura Trading's, and the building stands shut with a notice on it"; their answer on how: "Own
stacked PR"; [PR #363](https://github.com/nj22az/nj22az.github.io/pull/363)). The branch is the doctor branch (`claude/clever-ride-qdpo8s`, PR #362) plus this change; its PR is based
on the doctor branch, so it shows only this change. Merge #362 first, then this one, each on the owner's word: main
deploys the site, and this branch's runtime was built from the doctor branch's, keeping that build's chunks.

The owner's decision and its details: `johansson-town/AGENTS.md`, "Owner's decision — 22 October 2026: Higa Liquor
closes into Sakura"; the work, the review and the open issues: the
[task folder](johansson-town/briefs/higa-liquor-closes/progress.md) (`progress.md`, `checks.md`, `sources/task.md`).

Next agent: both PRs wait on the owner. Open for them: the walking Kōji keeps to the ice plant between the depot and
the crate yard (the drops are in the data, not walked); the economy model does not know Sakura's Saturday closing; the
Higa feed backdrop is still to be captured.

## Session handover — 25 October 2026: Linux 0.2.20 facial correction release

[PR #397](https://github.com/nj22az/nj22az.github.io/pull/397) is merged to the existing Linux release branch as `a56db3686b853907f08335c88e0197b96b972b47`; [release workflow 40163244813](https://github.com/nj22az/nj22az.github.io/actions/runs/40163244813) passed through publication and public installer verification. Complete candidate acceptance [40161672630](https://github.com/nj22az/nj22az.github.io/actions/runs/40161672630) passed, as did the 413-check guard. Candidate `2c504ee0` and the release share tree `156956a70be12d3f49026df6615a982ca8bd5167`.

The existing preparation branch was reused after unrelated main pushes cancelled PR #396. The first frozen run exposed a first-entry Help fixture race; the fixture now waits for its actual state before unchanged assertions, matching focused controller recovery. No shipped controller or game/render source changed. Final shared-avatar/filter bytes and all 32 runtime modules match the approved production snapshot; release captures and published checksums are retained in [the evidence](linux-port/acceptance-0.2.20.md).

The package is frozen from production main `aa792244`, retaining the facial correction `c36a40c`; concurrent later NPC-social work on main is preserved by this website/evidence integration and is not silently folded into the immutable release. A later package needs the next unpublished version, at least 0.2.21, after checking current releases. Physical Steam Deck and 8BitDo acceptance remain unverified. Website publication `465808031c0b73b7e38d5f4493f44f5c2494ae4a` is verified live after [Pages run 40164117036](https://github.com/nj22az/nj22az.github.io/actions/runs/40164117036): 21 exact public files (including the raw installer used by the command), both guide aliases and seven current release links; installer bytes equal the release. The actual 0.2.19 updater applies the 1,671,472-byte patch to the exact 1,621-file target while retaining the previous installation and a synthetic profile. [Final sign-off and machine-readable evidence](linux-port/acceptance-0.2.20.md).


## 25 October: Linux 0.2.21 fixed Steam Deck release

Owner prioritises default Deck sticks and trackpads over other Linux controllers. [Published evidence](linux-port/acceptance-0.2.21.md) records production `7c048393`, final candidate `78965d9ff54cc1907da9a22b4b758d40a7ad2f11`, identical tree `9dbcadd435455ae250965f96a17e980d80c320ac` and release `22a03f8ce69a1c0b6241a1fe4cbe14f79b53577e` through PR #398. All candidate/release gates and the actual 0.2.20 updater pass. Run the current installer once in Desktop Mode to apply Steam's trackpad template; app-only updates cannot edit the running Steam client's layout. Saves and camera preferences are retained; old controller remaps are ignored. Physical Deck and actual Steam template loading remain unverified. Website publication `43a638509fdabf721297489cd2b14e00333d15b3` verified after [Pages deployment 40170586119](https://github.com/nj22az/nj22az.github.io/actions/runs/40170586119): **26 files**, both guide aliases, **7 current release links**, all four versioned installer commands and installer/release byte equality passed. [Live verification](linux-port/qa/0.2.21/public-site-verification.json).
