# Sakura atmosphere handover - 24 October 2026

Read the [retained-detail handover](HANDOFF-SAKURA-RETAINED-DETAIL-2026-10-23.md) for the larger rebuild and remaining acceptance. Root CAD-before-remodel instructions apply.

## Branch and delivery

Follow-up branch `codex/sakura-atmosphere-pass`, [draft PR #384](https://github.com/nj22az/nj22az.github.io/pull/384), targets `codex/sakura-retain-detail` / parent [draft PR #378](https://github.com/nj22az/nj22az.github.io/pull/378). Basis1514a3825af4b78b78ee434557fa3a5520f9d137. Construction, CAD and visual-evidence commit: `01e97a25768eddfd05b3bf6adadff7515eaf5d13`; a following documentation commit records final validation and this handover. Neither PR is merged or deployed. Normal game remains unchanged; use `?sakura-rebuild` for the candidate. Current-main integration remains separate pending work.

## Built from corrected CAD

The owner supplied an environmental audit and five high-impact priorities. `docs/qa/sakura-atmosphere/` contains the measured Rev B schedule, two-page PDF, editable DXF, stock probe, generator, audit and actual-game evidence. Runtime `sakura-atmosphere.json` matches the schedule.

- Roof:32 service tiles/cut pieces (20mm finish,400 pitch/20 joints), quiet100mm perimeter drainage-edge finish, soft contact at tank feet/stair posts. No new grade, ground slab, route or roof walking level.
- Returns:three original moulded Sakura/Higa empty crates,460x400x280, base+40/top+880, underneath the high end of the lower flight. Conservative underside1413 gives over500mm clearance. Protected delivery zone and855mm outer passage unchanged. First render read as cages; CAD/runtime gained heavier waist bands and raised branded panels before final roof capture.
- Counter:original blue coin tray, scanner, register, cups, bags, chopsticks and gum retained rather than duplicated. Clear chopstick cup moves80mm clear of bags; CAD lowered its floating6mm base to the780 worktop and retained sticks now rest on the cup floor. New divided acrylic straw/wet-wipe holder and100x65 crayon oden tag fit the existing counter. Original white block was a placeholder handwash basin, not oden: it is now open with a metal rim, drain and tap. The original detailed front-counter oden vat stays.
- Chiller:subtle cyan inner back/shelves; original product materials unchanged. Three rice facings rotate -2,+3,-2.5 degrees, with body/art/wrapper and depletion/restoration matrices kept together. All36 rice display facings/24 counted units and the full33 catalogue lines/780 counted units remain.
- Contact:128px radial textures, opacity0.18,+1.5mm,depthWrite=false with polygon offset. Microwaves/dispenser feet, vending base, tank feet/stair posts. Artistic contact cues; no extra lights, shadow maps or global Look change.

## Checks actually completed

Final focused21 candidate/atmosphere/counter/queue/checkout checks passed. Runtime build passed;4 runtime-package checks passed after predecessor preservation. Final full73-file guard: **380/380 passed in280s**, using `NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs --test-concurrency=2`. The larger heap lets the audit worker finish; it is not a game/mobile graphics setting. Preliminary full run also passed380/380; an intervening repeat did not produce completion after session interruption and is not used as acceptance. Final full log is in `implementation/ci-guard.log`.

Stock probe:three proposed rotations fit their fixture and have zero conservative product overlaps. CAD:zero new retained-prop/roof-obstruction overlaps, checked crate headroom, DXF reopen zero errors. All drawing/review pages rendered and inspected. Embedded review fonts corrected the earlier font substitution.

Actual built-game capture:counter overview, oden/coin tray, utensil close-up, chiller, roof and return crates. Camera reframe avoids Thuận's braid obscuring the utensils; final crate/roof recapture shows revised moulding and labels. Reports preserve those capture passes; counter/chiller geometry is unchanged by the final crate-only styling revision. All passes had zero page errors. Review uses a disposable local game save and the shared normal basket/checkout functions:two rice balls bought,24->22 on shelf,¥220 receipt. The gaps are a recorded sale, not permanently hidden stock. Six final JPEGs and capture reports are under `implementation/`.

Owner receives an eight-page PDF under1MB:matched roof before/after at the same camera/clock/weather, five detail pages and the two-page CAD. Geometry measurements:counter15 mesh nodes/866 triangles/two textures; roof8 nodes/2100 triangles/two textures; vending contact adds one2-triangle mesh/128px texture. These are built geometry counts, not GPU-pass counts or physical-device FPS.

## Limits

Full guard is green with the stated test heap, including its existing geometric flicker checks. This does not establish full opt-in candidate flicker, physical iPad/FPS, live worker grasp/replenishment contacts, rear-door/floor/portal acceptance or the wider old-save migration. Roof/stair remain scenery with collision, no roof entry prompt or escape gameplay. No donation/prize mechanics, live hydraulic simulation or real engineering certification. Preserve the parent handover's remaining limitations.

## Next work / latest owner inputs

**Counter operational clutter is next**, then the frontage under the awning. Read `docs/qa/sakura-atmosphere/next-pass-coordinate-proposals.json`. It records unconstructed waybill rack/chained pen, harbour-cat charity box and karashi-holder envelopes, plus a separate staff-only chain safety-detail proposal. Simple proposed bounds do not overlap the retained scanner/cord, coin tray, gum, ticket stand or vat. They still need dimensioned CAD, worker/customer reach, replenishment and source-asset checks before construction.

The proposed Ø280 barrier bases are inset140mm from the956 clear-width edges:base depth12092-13048 stays inside the existing stair envelope, preserving the855 outer passage. Do not centre those bases on the rails. The current stair collider/prompt behaviour is unchanged.

The owner's later meter, crate445x365x315, bakery-tray, ditch, payphone, recycling-bin, mirror, noticeboard, POS and oden sizes are **reference envelopes**, not verified JIS-mandated dimensions. Built crates remain the audited460x400x280. Check specific manufacturer/standard evidence before any JIS claim, and retain existing usable equipment. Add a gas meter only if a real gas consumer/service is established. Signage must match existing services, prices and the game season; do not invent DPE availability, new-arrival claims or a spring fair in the October capture.

Frontage needs actual ground/door/navigation/lens CAD first. A possible bay can hold a payphone or an original sleepy rain-frog statue holding tissues; it cannot hold both. Mascot dimensions/performance in the proposal are targets only, not a built benchmark. Umbrella stand, noticeboard/window layering, poster tape/curl, stock-aware endcaps/hanging promotions, banner motion and expanded audio remain deferred. Inspect the existing chime/ambience before adding a short original Sakura cue; no borrowed franchise assets/audio.

## Counter operations follow-up - 24 October 2026, 07:20 Stockholm

Owner requested continuation from this handover. Reviewed PR #384, root/town instructions, the retained-detail handover and the coordinate proposals. Found unfinished local counter CAD/source/captures; copied the useful work to an isolated worktree, reviewed it and completed the pass without altering the earlier checkout.

**Delivery:** `codex/sakura-counter-operations`, [draft PR #385](https://github.com/nj22az/nj22az.github.io/pull/385), targets `codex/sakura-atmosphere-pass` / draft #384. Construction, corrected CAD and visual evidence commit: `cfb22dbf90c047a188ec12ade48a402b553476ff`; the following documentation commit records final validation. Parent basis `6f1570f91347976f04f199546301dc73e42869c9`. No merge or deployment; `?sakura-rebuild` remains required.

**Built:** three-tier paper/waybill rack, pen with base and tether, original harbour-cat acrylic charity box with an actual coin-slot opening, and eight karashi sachets in a holder beside the retained oden. All bases meet +780. Static staff replenishment failed at the original west-side charity/mustard proposal: Rev B moves both to the staff edge, shifts the rack90mm east and moves the pen south clear of the rack/scanner cord. No customer self-service, donation mechanics or new parcel transaction is introduced.

Shared corrected schedule is `docs/qa/sakura-counter-operations/schedule.json` and identical runtime JSON. `build-cad.py` checks counter support, conservative retained/prop footprint separation, tether bounds, assumed staff target reach and DXF reopening. Available Thuan reach456.734mm comes from the prior counter audit; required distances365.542 /312.197 /380.093 /315.168mm assume shoulder X12350 at948.41mm and approach at each target depth. This is not live grasp/replenishment acceptance. The DXF now includes retained envelopes, counter/staff context and width/depth/height dimensions.

**Separate chain CAD:** `docs/qa/sakura-stair-chain/` contains Rev A plan/elevation, editable DXF, schedule and regenerating audit. The full diameter280 base envelopes fit D12092-13048 inside the956 clear stair width; X5350 bases stop10mm before first tread X5500. The855 outer passage is unchanged. Chain ends +820, centre +710, post top +890 include the +40 apron datum. This is **unbuilt**: draw release hardware, sign hangers and anchors; verify live worker sightlines and existing apron/stair grade interface before construction. The current collider, stair access and prompts stay unchanged.

**Checks actually completed:** focused12/12; runtime build; runtime-package4/4. Final full guard: 381/381 passed in326s (73 files,6144MB audit heap). Same6144MB Node audit heap and concurrency2 as the parent pass. Full log is retained in `docs/qa/sakura-counter-operations/implementation/ci-guard.log`. Immediate predecessor chunks on the branch are preserved after the runtime build for cached pages. Source/runtime blob hashes verified during GitHub transfer.

Fresh actual built-game capture through `tools/sakura-rebuild-review.mjs --operations`: four final views in129s, zero page errors, actual Thuan and ordinary stock state. Counter group:3 mesh nodes /1418 triangles /one512px atlas /no added lights. These are geometry counts, not measured GPU passes or physical-device FPS. All four images inspected. Six-page `Sakura-Counter-Operations-Review.pdf` is595055 bytes with the screenshots and both CAD sheets; embedded fonts and layout were rendered and inspected after correcting image/header overlap and font substitution. JPEGs, scene report and generators accompany the PDF.

**Remaining:** all parent physical-device/FPS, live contacts, full opt-in candidate flicker, rear-door/floor/portal and save/current-main integration limits remain open. Full guard does not establish those acceptances. Next independent pass is frontage ground/door/navigation/lens CAD before any payphone/frog/umbrella construction; the bay cannot hold both proposed alternatives. Complete the chain's missing detail before implementing it. Preserve existing products, prices, services, season and original assets.
