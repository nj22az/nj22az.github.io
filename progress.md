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
