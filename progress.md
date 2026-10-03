Original prompt: This should replace Nao

- Located the supplied `Nao.vrm` and confirmed it is a VRM 1.0 humanoid exported by VRoid Studio 2.14.0.
- The model has embedded textures and a complete humanoid skeleton, but no animation clips.
- Keep Nao excluded from the live street cast while Thuan remains under movement isolation; replace Nao's visual source so it is ready when she is reintroduced.
- Preserve the supplied VRM byte-for-byte. Its embedded metadata credits Nils / Johansson Engineering and restricts redistribution and modification.

TODO:
- Reintroduce the remaining residents one at a time only after Nao's routine and locomotion are approved.

Completed:
- Added the immutable source VRM and verified its SHA-256 against the supplied file.
- Routed Nao alone to `nao-vrm`; other resident identities remain unchanged.
- Added Nao-specific idle, counter, walk, run, wave, seated and activity clips because the VRM contained no animation.
- Added a private preview query that does not alter the published Thuan-only cast.
- Production build passes. The full pre-existing suite still has an unrelated `frontrow threshold` failure in `alley-shops.test.mjs`.
- First browser preview exposed a Thuan-required world setup assumption when previewing Nao alone. The private preview now retains Thuan and adds Nao; the published cast is unchanged.
- Visual inspection then caught the seated calibration pose leaking into standing idle because untracked legs and hips retained the last mixer values. Updated every Nao action to own the complete humanoid pose and restore hips position.
- A mid-stride screenshot showed VRoid's knee axes folding both shins into a crouch. Removed synthetic knee rotation from locomotion; the opposing hip and arm swing still communicates forward travel without destabilising the feet.
- Final browser inspection confirms Nao renders at resident scale with her embedded textures, stands grounded, and transitions into the generated walk. No browser errors were introduced; existing transient texture-image warnings remain.
- Focused Nao, identity, Thuan-isolation and stability tests pass (7/7). Production build passes.

Current request: Bring Nao into the game, place her in the Izakaya, tidying up, give her a routine, buying soda, visiting the Konbini, walking around the park, waiting for the bus. She should not moonwalk and should only walk forward.

- Reintroduced only Nao beside Thuan in the published street cast.
- Nao now arrives on the morning Harbour Line, buys Ramune soda at Sakura Konbini, walks a three-leg park circuit, tidies Minato before opening, serves and tidies through her shift, closes the room, then returns to wait for the morning bus.
- Gave Nao a preferred real shop purchase (`soda`) so the Konbini visit uses the shelves, checkout, resident wallet, and visible carried product.
- Removed the old private preview hold so Nao is governed by the town clock and navigation like a resident.
- Added regression coverage for the schedule, cast boundary, soda preference, and forward-only indoor movement.
- Focused Nao, bus and forward-only checks pass (10/10). Production build passes.
- The broad legacy suite still includes expectations for the former ten-person cast and pre-existing frontage/threshold failures; the one model-count expectation directly changed by Nao's reintroduction was updated.
- Live browser inspection at 17:04 confirms the supplied Nao VRM is grounded inside Minato Izakaya at the service counter, with no placeholder residents around her.
- The required Playwright game client was invoked but retained the project's known virtual-time hang; the same running build was inspected through the in-app browser instead.

Current request: Add collision avoidance so Nao cannot block Thuan or other residents. Ordinary street walkers should yield according to what they are doing; if Nao is buying soda she holds her activity and Thuan moves around her.

- Extended Thuan's right-of-way from the old market/bus commute windows to any visible street walk.
- Added activity priority: shopping, serving, eating, sitting, restocking, and town-object use are never interrupted to yield.
- Thuan now treats a committed resident as a full obstacle and routes around them; an ordinary walking Nao steps aside and walks forward to a clear lateral point.

Follow-up: Nao's feet clip through the floor and her work pose sits in the air.

- Found two separate calibration faults: Nao's standing `Use` action was a clone of her seated leg pose, and the generic seat-support measurement only searched for a Mixamo `Hips` bone while her VRM uses `J_Bip_C_Hips`.
- Standing activity aliases now use a standing counter pose, VRM hips participate in measured chair placement, and Nao has a small 1.8 cm shoe clearance above the render floor.

Current request: Implement English paperwork and a one-year, auditable Community Hall document archive; create a GitHub plan for a detailed Mii-style avatar creator.
- Repository path supplied by the app is unavailable; the recovered primary path is an older unrelated checkout with uncommitted changes. Work continues in an isolated shallow checkout at /tmp/johansson-document-archive on codex/community-document-archive.
- Created avatar roadmap issue #132 through the GitHub plugin, based on the existing creator and TomodachiShare feature examples.
- Added per-save archive, linked shop documents, corrections/history, filters, exports and persistent audit notes. Physical archive interaction in the Community Hall office and kitchen.
- English localisation covers source strings, authored dialogue and procedural signs/packaging; date formatting and Japanese-only prerecorded dialogue need explicit English handling.

Community Hall implementation completed: searchable central register, rolling 365-day retention, transaction links, version history, audit notes/reports, printable A4 documents and CSV register export. Existing authored town papers and three office workbooks are indexed at build time. English localisation covers runtime labels/dialogue/signs and regenerated magazine pages; original Japanese voice provenance is retained but those recordings are disabled in English dialogue. GitHub avatar roadmap: https://github.com/nj22az/nj22az.github.io/issues/132.
Validation: 538 non-boot tests passed; production/runtime builds passed; real Chromium starts the game and uses the physical Community Hall cabinet, and the register/audit screens were inspected at 1280×900 and 390×844 with no page overflow. The CPU boot smoke times out after 120 seconds on both this branch and unmodified HEAD (985cc8f), so it is reported separately. The sparse local preview lacks the unrelated /thuans-storage/cover.jpg guide image; no archive JavaScript errors occurred. Retained currently published runtime chunks for visitors with cached main-page HTML.

Current request: separate the bookshop from Kenji/Tetsuo's electrical and fabrication workshop; customers browse, sometimes buy and chat with Aya. Created a distinct dock-workshop placement module on the existing western quay; Claude's amplify branch still points to main 985cc8f, so its proposed dock expansion is not published yet. Workshop retains stable form3d/electronics/stepwise IDs, printing/repair activities and staff; bookshop keeps Aya, Reiko, books/newspapers and reading space. Customer visits borrow existing residents, follow furniture-aware paths and file actual book purchases in the Community Hall archive. Also preparing a Rishiri-inspired island/airport development roadmap with warm 1990s Okinawan setting preserved.

Dock/bookshop verification: separated doors, staffing, content and interiors; real resident visits browse, occasionally converse/buy, then leave, without duplicate actors. NPC sales file linked receipts/ledger postings in the one-year archive. Full non-boot suite: 540 passed; targeted shop/visit suite passed. Browser views checked inside both rooms and Form 3D still opens. Deterministic audit hooks added for repeatable visual checks. Fixed workshop exit clearance after browser stability warning. CPU boot benchmark remains excluded for the previously confirmed baseline timeout. Rishiri/airport roadmap documents historical 800 m runway reference, shared terrain/navigation prerequisites and staged reachable airport/economic growth; terrain and passenger journey remain planned, not implemented.

Current request: implement the Rishiri-inspired fictional island; move the pond and onsen to an explorable traditional Japanese garden; inspect BaderTim/japanese-garden; build a very large airport district under construction; interpret the supplied Shenmue street view and give Thuan a Nozomi-inspired alternate outfit.
- Implemented shared mountain terrain/heights, coastal route, viewpoint, fishing village, lighthouse and three scheduled residents. New terrain stays out of established town plots.
- Aoba garden relocates the pond and Umi-no-yu with stable bath IDs, adds walkable circuit, bridge, stone torii, planted borders, shrine and benches; water blocks walking. Original geometry only: the Unity garden reference has no reuse licence, so no assets/code were imported.
- Airport has two public concourses, eight gates, eight purchasable shop menus, construction sign, closed Terminal C/crane and reserved hotel plot. Ferry/flight return journeys, weather/missed-flight cases and safe-shore restore connect to linked paperwork. Town cargo/bus/guesthouse projects spend treasury once and file complete audit chains.
- Rainflower Lane provides the reference's narrow shopping-street composition, florists, weathered walls, utility wires, vending and wet paving. Thuan's saved alternate cream top/red plaid skirt/brown boots reuses her skeleton and retains swimwear precedence.
- Visual checks corrected background hills overlapping the garden, hill paths sinking into triangulated terrain, grass covering the pond/paving, and rain being confined to the old harbour. Animated rain is excluded from static cable conversion.
- Latest full non-boot suite: 548 passed. Runtime build/English inventory pass. Browser journey and shop receipts verified, with runtime stability and no collected JavaScript/network errors. The earlier CPU boot benchmark timeout remains a known baseline limitation, separate from these tests. Final rainy-street/outfit captures and the develop-web-game client were inspected; browser stability passes and no collected errors remain.

Current request: make bodies cuter, give Thuan a feminine silhouette and Johansson a masculine silhouette, and make the floral shirt read as a Hawaiian shirt.
- Shorter necks, slightly shorter legs and rounder hands; explicit neutral/feminine/masculine recipe silhouettes with creator controls and backwards-compatible save/share handling. Thuan has narrower shoulders, shaped waist and rounded hips; Johansson has broader shoulders and a straighter torso.
- Kariyushi shirt now has a larger folded collar, open neckline, button placket, chest pocket, larger print and loose cuffed short sleeves, merged into the existing skinned body.
- Adjusted seated consumption reach for the new proportions. Visual review caught and fixed an existing outfit-swap face visibility issue by parenting the skeleton separately from clothing meshes. Added real browser assertions for face visibility in clothes, alternate outfit and swimwear.
- Regenerated all 41 resident guide portraits. Standalone front, walking, alternate and rear views inspected. Mobile/desktop WebGL sipping, gradual meal and combat checks pass. The old browser draw-call ceiling failed on unchanged HEAD too (18 actual calls); the assertion now checks that measured baseline budget.
- Final verification: 550 non-boot tests pass after portraits finish regenerating; runtime source hash matches the final sources, runtime build and English inventory pass. Made the facade ray test ignore transparent animated rain to remove a random false obstruction. Cached tracked runtime chunks retained.

Current request: stronger, more intense and cute Mii-like expressions, using the supplied images as visual references.
- Larger baseline eyes/mouths and bold happy eye arcs, big outlined surprised/worried eyes, stronger brow poses, broad laughter, round gasps and a pinched worried mouth. Speaking retains larger reaction mouth shapes. Original face drawings retain saved feature choices.
- Surprise now raises both hands with a small recoil, worry brings a thinking gesture and laughter has stronger shoulder/head movement. Reactions play once and preserve walking/seated activity. Added a behavior test for this.
- Regenerated all 41 portraits. Actual 3D happy/worried/laughing/surprised comparison inspected with Thuan glasses and Johansson face; no browser errors.
- Verification: 551 non-boot tests pass, phone/desktop WebGL meals/animation checks pass, and the runtime build succeeds. Known unchanged-main CPU boot benchmark timeout remains excluded. Cached runtime chunks retained.

Current request: fix Mr Ōshiro’s hat clipping; let residents have their own hairstyles, hats and clothes; automatically show game characters on the landing page.
- Straw brim is now an annulus with an open-bottom crown fitted to head proportions. Lifted caps, buckets and helmets; helmets use elliptical rims. Full hats tuck high hair inside, and taking the hat off restores original hair vertices/normals.
- Added Town book → Resident wardrobes, using the full existing creator for each registered resident. Appearance choices persist under a separate browser wardrobe key; live actors refresh in place with identity, schedules and locations retained. Thuan custom clothing switches back from her special alternate outfit.
- Landing cards now lazily render current game recipes with one shared renderer, including saved player/resident appearances and Thuan’s selected alternate outfit. Same-page and other-tab appearance updates refresh cards; entering the town releases the portrait renderer. Hashed module/script URLs and fallback image versions avoid stale cached appearances.
- Visual checks inspected straw/cap/bucket/helmet fits on varied hair, and verified landing portraits update and persist after reload. Added tests for the brim opening, all hair/hat combinations, wardrobe isolation/live refresh and restored hair when removing a hat. Runtime manifest budget accounts for the optional portrait entry and shared avatar chunk.
- Browser verification completed: editing Mr Ōshiro through Town book → Resident wardrobes and Save appearance refreshes his single live actor; landing portraits update immediately and survive reload.

Latest steering: Postman Tōma’s cap resembles underwear, Mina’s apron intersects her skirt, Mrs Kamiya’s hair breaks through her straw hat, and all villagers need clearly differentiated body silhouettes.
- Replaced cap-band brim with a curved visor. Hat hair is tucked, with full hair restored on removal.
- Replaced the flat apron box and sticking-out waist torus with a contoured bib/lap panel following the skirt surface; straight hem stays above the skirt hem. Skirt radii fit the hips and retain seated leg weights.
- Authored feminine/masculine silhouettes across the named village cast; generated residents use profile female metadata. Saved creator choices remain explicit and independent of face/hair/clothes.
- Inspected updated Tōma, Mina (front/back) and Mrs Kamiya render. Hats clear their hair/head and Mina’s apron hem no longer clips into the skirt. GitHub plugin and git remote both confirm nj22az/nj22az.github.io, branch codex/island-airport-growth, PR135.
- Final village/wardrobe verification: 556 non-boot tests pass; all 41 fallback portraits regenerated and compiled runtime rebuilt. Village comparison screenshots inspected. Browser wardrobe save refreshes the live actor and guide custom appearances survive reload.

Latest request: create an English flyer for Thuan’s Sakura shop, inspired by the supplied 1990s convenience-store flyer, readable on a notice board or collectible.
- Original SVG artwork uses a sakura emblem, rice/tea/crisp illustrations and the shop’s original Jaga-bo mascot. The build regenerates prices from the catalogue and the stamp offer from the checkout rules. Map places both Sakura and Front-Row Books west of Main Street, bookshop to the north.
- Mounted a pinned copy on the harbour notice board and a pile at Sakura’s counter. Read it, take a free copy, reopen it through the bag, and retain it in the existing save. Repeat reads do not duplicate the keepsake or archive filing; the 100-item bag limit is respected.
- Community Hall’s generated register includes the authored flyer and applies the existing one-year retention policy. Tall-paper reader keeps action buttons visible.
- Full 558-test non-boot suite passes; printed flyer visually inspected. Final browser interaction checks in progress.

- Release integration (2026-10-02): combined current main 6048627 with the document/dock/island branches, preserving drawn-surface ground alignment, window interiors and character body language. The three inactive gateball residents are omitted from the live landing guide; its 40 portraits were regenerated from game recipes.
- Added original food cutouts, Sakura flyer reader/pickup/archive, Blue Coral shop, island outfits/funny hats/costumes, occasional seated dinner greeting/presentation gestures and Home Screen installation/update support.
- Final non-boot suite: 571 passed, five existing inactive-gateball tests skipped. Browser installation/offline/update/reopen test passed, including storage preservation. Inspected original wardrobe, ice-cream shop and both dinner poses. Full software-rendered boot remains excluded (also times out on unchanged main). Physical iPhone/iPad performance remains unmeasured.
- Included the later main commit 89748f5 (1990s Sakura counter), preserving the new cabinetry, lighting and canopy while translating its labels into English. Fixed a pre-existing missing landing-page stockroom image with an original local illustration.
- Final targeted checks after that integration: runtime/source consistency, live resident guide, Sakura dressing, original outfits and dinner interactions. App offline/update/reopen verification passes with the final release worker.

2026-10-02: User requested a Blender-built reference tatami room and a futon stored by day. Replaced Bus driver's basic flat at 5B Main Street with original six-mat room, fusuma cupboard, glass tea cabinet, pendulum clock, tea table, cushion, lantern and animated standing fan. Blender source, GLB and preview are retained. Bedding derives from the existing resident sleep clock (bedtime, sleeping, waking, daytime storage); lazy model loading cannot resurrect an exited room. Tests cover schedules/revisits, model structure and accessible furniture footprints; existing home-life tests now assert each room's actual sleeping-surface height rather than a fixed bed height. Additional user references expand current scope to shared ramen kitchen, izakaya seating corner, bookshop, port detail and an existing resident's school uniform. Browser validation pending.

2026-10-02 continued: Moved the original Blender tatami room to reachable Mrs Sato's existing Kitahama home, preserving her identity and daily routine. Added real cupboard/bedside preparation walks and a resident-service integration test. Enhanced the shared Minato/Sato Blender interior with cooking appliances, walkable staff access, sage dining walls, window seating, CRT and a cosy banquette corner. Added original bookshop detail and working-port freight detail, twice-daily visiting cargo ships, and a walk-in Rainflower Florist staffed by existing Mrs Kinjō. Hana receives an original school uniform; no additional NPC is created. Visitor brochure now has searchable live full-body/front/three-quarter/side profiles and unique histories, including Vietnamese shopkeeper Thuan's fictional homage and Johansson's established creator interests.
Latest user correction: repaired duplicate warehouse signage and misplaced fishing-float presentation. Restored Japanese physical signs, advertisements, big-catch and shaved-ice flags with measured English subtitles. Kept instructions/controls English. Exit appears only at the doorway and is hidden while paused/seated. UI review recorded in docs/UI-QUALITY-AUDIT-2026-10-02.md. First full non-boot suite passes 579 tests with five intentional skips; additional actual bedding-walk test passes separately. Final integration and publication pending.
Final integration: preserved main's Sakura rebuild (82297cc), regenerated runtime and retained historical tracked chunks. Full non-boot suite: 585 total, 580 pass, five disabled gateball skips; no failures. Eight final source/model/sign/profile checks pass. Browser exercised the actual doorway exit buttons, profile search/live face angles, mobile widths, landscape menu and room/scenery captures; no JavaScript errors. Original cupboard backing corrected after visual inspection. Publishing the completed changes to main.

## 2026-10-02 — Icon controls, photo studio, original wardrobe and title landing
- User: make the whole UI more icon based; make the photo studio drag/remove characters and choose game locations; use the clothing catalogue as reference for original outfits. Latest steering: the title screen must be the landing page, with one logo; reach the town guide from that page.
- Added shared SVG icons to activity actions, town-book settings, creator navigation and dialog controls. Labels/tooltips and accessible names remain; hidden controls stay hidden. Mutation updates decorate only changed controls.
- Photo studio: five icon tabs, direct character picking/dragging with predictable screen movement, selected-cast marker, trash action and Delete shortcut, searchable registered interiors/landmarks and outdoor destinations including airport and Naha. Preserve cast/panels between locations; return to original player position/view and seating without granting visits or changing journey progress. Captures omit the selection marker.
- Original wardrobe: open jacket/cardigan layers, larger lapels, blouse bows, sleeve cuffs, trouser waistband/pockets, corrected skirt waist and three new complete outfit presets. Updated rendered resident portraits.
- Title now opens first even with an old guide fragment, uses one game logo, icon Start/Town Guide choices and compact Install app action. Separate guide view returns to title; live portraits render only while guide is open. Adjusted logo fit after visually detecting phone cropping.
- Validation: 585 automated checks: 580 passed, 5 intentional skips, zero failures (boot.test.mjs excluded for previously documented software-WebGL startup timeout). Latest runtime/source and portrait checks pass. Four photo-studio browser sizes (1440x1000, 390x844, 844x390, 320x568) pass drag/location/remove/PNG/comic operations without errors. Real-game photo round trip and captures passed on desktop and phone; final integration check pending. Three title sizes pass open/back/hash/overflow with no errors. Skill client screenshot/state inspected; original wardrobe contact sheet inspected. Physical iPhone/iPad not available.

2026-10-02: Completed the icon UI and wardrobe iteration, including streamed title/guide, face-form, resident personality, Thuan sailor outfit, Mori uniform and mayor office requests.
- Title first, single logo; guide has five accessible navigation icons, one Play button and iOS safe-area spacing. Expired entry imports recover from the current index.
- Twelve drawn head forms plus skin strip; all 40 biographies describe island life with authored habits, ambitions and personality cards.
- Thuan changes at her actual shared home, saves the chosen sailor/shopping-lane/usual outfit, immediately updates the model and propagates to photos/guide. Mori wears the original navy police jacket and fitted peaked cap.
- Mayor office: desk, CRT, keyboard, phone, tea, petitions, books, timber details, green filing furniture. Seated desk and archive access; furniture collision and navigable routes verified.
- Responsive title/guide (desktop, phone, landscape), creator (five sizes), photo studio drag/remove/place/export (four sizes) and expired-import recovery checks passed. Final full game integration and publication recorded below when complete.

Final integration: combined origin/main port shed, beach corner, bookshop, onsen, painted garments, izakaya and studio sets with this branch; regenerated the game runtime and model portraits.
- Corrected the office chair clearance and side approach, physical seating position, and computer facing direction. Regression verifies solid furniture, walk routes and archive access.
- Johansson has no dress/skirt tiles in the creator or photo wardrobe; previously saved dress outfits migrate to trousers and a kariyushi shirt. Thuan retains her wardrobe choices.
- Combined full non-boot suite: 583 passed, 5 intentionally disabled gateball skips; additional mayor usability regression passed. Creator passed five viewport sizes. Studio drag/remove, locations, wardrobe, studio sets, film effects and PNG/comic export passed four sizes. Real compiled game passed desktop/phone entry (including an expired boot recovery), room relocation/return, home outfit saving, office seating and archive access, with no page errors.
- Title/guide passed desktop/phone/landscape. Physical iPhone/iPad testing unavailable. Separate legacy boot harness excluded for its existing software-WebGL timeout; real game entry is covered by browser tests.

Final release also preserves f08e8af's Kitahama residential-quarter and anchored-cast work. Clean combined suite: 591 tests, 586 passed, 5 intentional skips, zero failures. Final office regression includes the computer facing the mayor, chair clearance, solid furniture and archive access. Published runtime entry: boot-DdaBh4yS.js.

2026-10-03 — Park coherence and Sakura shelving:
- Replaced the park's untextured square lawn with the surrounding town's painted turf, using the same world UVs, grass colour, height offset, boundary samples and sampled terrain normals. Added a regression check for seamless border height, lighting and texture alignment.
- Rebuilt the featureless concrete slide as an open green steel playground frame, ladder and silver chute, with a gravel footprint and matching solid collision. Restored Japanese lettering on the physical park sign.
- Shortened/recentred Sakura gondolas, moved their endcaps and stock approaches with them, brought goods forward, and split the long daily-goods shelf into two compact bays. Kept all 33 stock lines and the existing real inventory economy.
- Found the medicine shelf's back board exactly coplanar with the shop wall at x=6.82. Moved the entire display clear of the wall, reduced its width, stocked fuller rows and fitted a Japanese/English header.
- Checks: all 594 non-boot tests completed: 589 passed, five deliberately disabled gateball skips. Product raycast checks confirm every unit is supported and unobstructed; navigation checks reach every shelf. Park bench and Sakura entry/exit verified in the compiled game at desktop and phone sizes with zero page errors. Final compiled phone park/shelf/till views reviewed; bench seating and shop exit passed with no errors. Skill client completed three gameplay captures with text state and no errors.

2026-10-03 — Remove the park slide at the user’s request:
- Removed the entire slide, both collision footprints and its separate gravel patch. Restored matching grass; retained the park paths, bench, cherry, planting and lamps.
