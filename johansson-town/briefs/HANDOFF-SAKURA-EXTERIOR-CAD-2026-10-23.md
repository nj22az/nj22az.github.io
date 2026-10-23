# Sakura exterior-led CAD and 3D review - 23 October 2026, Rev E

## Current direction

Single-storey konbini; use the whole existing 14,260 x 11,000 mm exterior box with proposed 180 mm perimeter allowance (13,900 x 10,640 mm clear). No occupied second floor or large internal staircase. Toilet is in the rear staff area. External rear staircase serves only the roof tank and escape route.

The owner supplied a detailed merchandising grid, a Three.js HTML prototype and a ceiling/sign function. Rev E incorporates that layout and a working standalone design preview. This supersedes Rev D's lower-density fitting arrangement, while retaining its one-storey/roof-only decision. Design/prototype scope, not a live game replacement or merge authorisation.

## Review branch and history

Branch `codex/sakura-exterior-led-cad`; [draft PR #373](https://github.com/nj22az/nj22az.github.io/pull/373), unmerged. Rev D files through `b261c199cca45e19751dfc42c3fab24aa6f7723b`, handover/index through `b9b85cc650ac5ce3740a45b1e8ca575968f02e23`. Rev C's upper-floor retention is superseded. Original exterior source: main `e15be1738e2e68c1f1ba323b9992dc89661751f4`. Before any game implementation, recheck current main and concurrent #366/#364/#363; none of those older proposals overrides the owner's current single-storey direction.

Rev E drawing/prototype/checks are recorded through `ac5c26d7501336f5514770614bb799850ec90e1b`; CAD source began at `6dbc77f52221db0501e4ce50ffaec0ebd95be523`. The self-contained preview was also verified through a local `file://` open with no network dependencies.

## Current layout and resolved discrepancies

- Rear service strip Y=8,240..10,640 mm. WC/lobby X=0..2,400; rest/archive X=2,400..5,200; cold room X=5,200..10,400; receiving X=10,400..13,900. Shift office X=11,400..13,900, Y=6,200..8,240, proposed floor +150 mm. Zone dimensions precede partition deductions.
- Rear strip 33.36 m2 plus office 5.10 m2 = 38.46 m2, **26.0%** of 147.896 m2. The remaining 74% includes retail fixtures/counter functions; it is not net walkable sales area or a certified universal 1990s ratio.
- Three 900 x 4,500 mm islands: 3,600 body plus 450 endcaps each end. Y=2,400..6,900 resolves the supplied 100 mm discrepancy and preserves the 1,340 mm rear cross-aisle. Heights 1,350; freezer 850. Specified 1,050/1,150 mm aisles await actual-avatar and camera checks.
- Eight 600 mm beverage doors. Cold-room external depth 2,200 = 75 + 700 rack + 1,350 clear lane + 75. No crates stacked in the required cold-room lane. East 900 mm staff door reaches receiving directly.
- Controlled staff entry added from rear sales aisle to rest/WC. Office has south staff-aisle and north receiving openings. The owner's HTML had a solid rear partition and no usable WC door; those were corrected.
- Owner's rear delivery-door centre **X=11,500** is explicitly a **proposed relocation** from the earlier 7,850 mm axis, not an unchanged source opening. Width 1,050. Register the opening, rear lane and roof stair before implementation.
- Counter retains 780 mm surface height, 800 mm front depth and 1,200 mm staff aisle. Hot zone fits 600 mm oden + 350 steamer + 450 compact case. Two POS/basket well, microwaves, basin and tobacco rack. The deeper counter requires actual Thuan contact/reach validation; no reaching animation is claimed.
- Observation glazing is not guaranteed one-way under arbitrary lighting. Ground support functions stay: desk/cash, tea/rest, futon, archive/decor and stock. Quantities/capacity still unverified.
- Roof-only stair/tank retained. Acoustic ceiling is now 2,800 mm to match supplied fixture function; roof deck approximately 4,010 mm. No occupied upper floor. Prototype exterior is a simplified cream/timber envelope, not final exterior art.

## Period and identity

Original Johansson signs/products, no copied chain branding. Primary sources: Lawson Entertainment company history records online Loppi ticket sales from September 1997 (`https://www.ent.lawson.co.jp/company/`); FamilyMart records FamiPort in 2000 (`https://www.family.co.jp/company/familymart/corporate_history.html`). Lawson's 2022 integrated report dates its ATM installations to 2001 (`https://www.lawson.jp/en/ir/library/annual_report/2022/ar01.html`). Accordingly use an early-style original ticket prop, exclude FamiPort, and reserve the requested ATM footprint rather than assert typical 1997 service. This does not establish that an independent Minato shop had such a terminal.

New Yokosuka remains proportion/merchandising reference via the inherited 19 October study. No newly measured reference model, copied assets or GPL code is claimed.

## Working 3D preview

`prototype/interior.mjs` exports `buildSakuraShotenInterior(THREE)`; repository preview reuses shared Three.js r170. Delivered `Sakura-Shoten-3D.html` embeds the engine, geometry, Japanese font and dependency notices for offline opening.

- Actual Japanese/English textures, readable from both sides; three hanging boards plus room/product signs. Embedded Noto Sans JP subset with OFL notice; Three.js MIT notice retained.
- Nine emissive fluorescent housings/tubes, no point lights; acoustic tile grid separately toggleable. Sign boards span 2.125..2.475 m; wires terminate at the 2.8 m ceiling, unlike the supplied above-ceiling suspension.
- Instanced material/parent batches for 2,864 box pieces, rather than one mesh/edge material/light per box. Five cameras and wall/ceiling/sign/grid controls; pointer orbit/pan/zoom and mobile panel layout.
- Clerk eye height is adjustable schematic inspection, **not** the actual Thuan rig. At 1.25 m eye height the 1.35 m shelves obstruct some sightlines; do not assume they are below everyone's eyes. No replacement character system was introduced.
- Roof view includes cylindrical tank, complete external flights, landings/bridge and continuous handrails; no black cut-off stair.

## Validation actually run

CAD: reopened millimetre DXF, zero audit errors/fixes; 15 scheduled floor-fixture envelopes inside the rectangle and mutually non-overlapping; cooler section sum and eight-door width fit checked; 1,340 rear aisle verified. Three A3 PDF pages reopened/text checked, rendered and visually inspected. SVG ground sheet exported.

3D: JavaScript syntax and scene/matrix construction; Japanese glyph coverage. Self-contained HTML run in headless Chrome with SwiftShader at 1280x800 and 390x844. All five cameras and wall/ceiling/sign/grid controls passed; no page errors or invalid matrices; wire top equals ceiling; zero point lights. Measured rendered draws: diorama 49, entrance 45, clerk 53, office 48, roof 66. Phone document width 390 for viewport 390; panel initially collapsed. Screenshots inspected for room/ceiling/sign/roof views. These are not FPS, GPU, physical-device, collision/navigation or actor-hand tests.

Standard browser package download failed; testing used an official Chrome-for-Testing headless shell. Reproduction harness accepts `SAKURA_CHROME` and `SAKURA_PREVIEW_ROOT`.

No game/runtime/save/schedule files changed, no deployment or merge.

## Next

Review the standalone preview, then greybox in the real game with the actual exterior and Thuan rig. Verify shelf eye lines, 1,050 mm aisles, readers/queues, cooler doors and stock access, 800 mm counter hand-offs, raised office step/camera, receiving/roof/lane clearance and storage quantities. Retire upstairs prompts and safely migrate old upstairs saves only when implementing the agreed single-storey replacement.
