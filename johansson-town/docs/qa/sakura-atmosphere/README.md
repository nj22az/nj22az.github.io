# Sakura atmosphere pass / JW-SAK-ATM-01 Rev B

Basis: PR #378 head1514a3825af4b78b78ee434557fa3a5520f9d137. Follow-up branch `codex/sakura-atmosphere-pass`, intended draft base `codex/sakura-retain-detail`. Candidate only; normal game remains unchanged. No merge/deployment.

This implements the owner's five high-impact priorities after an inventory/CAD audit. The coin tray, cups, chopsticks and gum already existed, so they are retained rather than duplicated. The new acrylic holder adds straws and individually wrapped wet wipes; the old chopstick cup becomes clear acrylic and moves80mm clear of the bags. The white block was a placeholder handwash basin, not the existing front-counter oden vat; it is now open with a metal rim, drain and tap. A small original crayon oden tag uses the same authored star outline/lettering as the shelf system.

Roof service pads (20mm finish,400mm pitch/20mm joints) and a dark100mm perimeter drainage-edge finish break up the slab. The gate, tank/equipment and delivery/outer passage stay clear. Three ribbed empty fictional Sakura/Higa crates fit below the high end of the lower flight: top880, conservative underside1413, over500mm clearance. Render audit thickened the crate waist bands and added original raised return-brand panels, so they read as moulded plastic rather than cages. No new ground slab, roof grade, walking level, route or escape interaction.

Fresh-chiller back and shelves receive a pale cyan material response without recolouring products or adding lights. Three counted rice facings rotate -2,+3,-2.5 degrees; body, artwork/wrapper, saved instance matrices and audited envelopes agree. All36 rice facings/24 counted units and the full33-line/780-unit catalogue remain. No permanently hidden stock: actual shopping creates gaps. The review harness buys two rice balls through the shared basket/checkout functions in its disposable local save, producing a genuine22/24 shelf count for the photograph.

Contact shading uses a tiny128px radial texture and one merged transparent draw per group, opacity0.18, +1.5mm, depthWrite=false and polygon offset. It appears under microwaves, dispenser feet, vending base, tank feet and stair posts. No lights, framebuffer effects, shadow maps or global Look change. These are artistic contact cues, not baked physical AO.

## CAD and audit

`schedule.json` is identical to runtime `sakura-atmosphere.json`. It contains positions, dimensions, material intent and protected retained equipment. `probe-stock.mjs` measures proposed rotated product bounds from the original templates; `build-cad.py` checks overlaps, service/door clearances and stair headroom before producing the two-page PDF and editable DXF. `audit.json` and `stock-audit.json` hold performed checks. Written dimensions govern; this is virtual-environment coordination.

Run from the town directory:

```
node docs/qa/sakura-atmosphere/probe-stock.mjs
python3 docs/qa/sakura-atmosphere/build-cad.py
npm run build:runtime
TOWN_CHROMIUM_PATH=/path/to/chrome-headless-shell node tools/sakura-rebuild-review.mjs --atmosphere /absolute/output
```

## Deferred audit suggestions

Poster tape/curl, more hanging promotions/endcap stocking, banner flutter, entrance umbrella/board, broader material gradients, inspectable flavour text and expanded ambience/audio remain outside this first five-priority pass. Existing20 notices, four A2 posters and original price/sale semantics are preserved. Physical-device/FPS, full candidate flicker, roof traversal and wider PR #378 migration/acceptance remain open. Latest actual checks and evidence are recorded in the handover; do not infer acceptance from CAD alone.

## Next counter / safety CAD inputs from the owner

`next-pass-coordinate-proposals.json` records the next counter envelopes (waybills/pen, harbour-cat charity box, karashi holder), plus an inset staff-only stair chain and a conditional frontage bay. These are planning coordinates, not constructed or accepted CAD. Simple retained-prop overlap checks pass. A280mm stanchion base cannot simply be centred at the956mm stair edges: the proposed centres are inset140mm so its bases stay within the existing envelope and do not consume the855mm outer passage.

The owner's additional gas/electric meter, ditch, payphone, bin, mirror, noticeboard, POS and oden dimensions are reference envelopes pending specific source/model verification, not claimed JIS-mandated dimensions. Existing working equipment is retained. Actual services, actor reach, door/navigation/lens clearance and season/price data govern the next dimensioned drawing. Counter clutter is next; frontage follows. A proposed original sleepy rain-frog holding tissues is a separate unbuilt concept, with a budget target rather than measured runtime performance.
