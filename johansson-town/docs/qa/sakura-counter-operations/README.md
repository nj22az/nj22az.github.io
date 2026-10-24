# Sakura counter operations / 24 October 2026

Follow-up to draft #384; opt-in `?sakura-rebuild` only. Base `6f1570f91347976f04f199546301dc73e42869c9`.

`build-cad.py` regenerates the corrected Rev B PDF/DXF and audit from `schedule.json`. The runtime imports an identical `src/world/interiors/sakura-counter-operations.json`. The original coordinate proposals are retained in the atmosphere folder; they are not the construction schedule. The recovered unfinished CAD and builder were reviewed in a separate worktree before completion.

Corrections: the original west-side charity and karashi locations exceeded the assumed staff reach. Move them to the staff edge; move the rack90mm east and pen south clear of the scanner cord. Static shoulder at X12350 / height948.41 is an assumption using the previous counter audit's Thuan arm envelope456.734mm. The resulting target distances are365.542 /312.197 /380.093 /315.168mm. This does not demonstrate live grasp, customer access or replenishment animation.

The built prop group has three mesh nodes,1418 triangles, one512px atlas and no lights. Transparent acrylic is a separate batch. It adds no products, stock/save IDs, buying/donation logic, colliders or floor routes. The full original catalogue of33 lines and780 counted units is retained by the candidate checks. Customer self-service is not claimed.

Run from `johansson-town/`:

```sh
python3 docs/qa/sakura-counter-operations/build-cad.py
python3 docs/qa/sakura-stair-chain/build-cad.py
node --test tests/sakura-atmosphere.test.mjs tests/sakura-rebuild.test.mjs tests/sakura-counter-density.test.mjs tests/sakura-queue.test.mjs tests/sakura-checkout.test.mjs
npm run build:runtime
node --test tests/runtime-package.test.mjs
TOWN_CHROMIUM_PATH=/tmp/chromium node tools/sakura-rebuild-review.mjs --operations docs/qa/sakura-counter-operations/implementation
python3 docs/qa/sakura-counter-operations/build-review.py
NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs --test-concurrency=2
```

The capture script emits PNG files; the review generator compresses JPEG evidence into the checked-in compact PDF. `implementation/report.json` records the actual browser pass, zero page errors and shop/cast state. Original PNG captures are local intermediates; retained JPEGs are the final evidence. Preserve remote predecessor runtime chunks when building so cached pages can finish loading.

The separate stair-chain CAD is **unbuilt**. Its bases fit D12092-13048 and stop10mm before the first tread; the855mm outside passage is untouched. Release hardware, sign hangers, anchorage, worker sightlines and the ground/stair interface remain unresolved. Frontage and all parent rebuild acceptance limits remain open.

Final validation: focused12/12, runtime-package4/4, runtime build and the full73-file guard381/381 passed in326s with6144MB Node test heap. This heap is for audits, not a graphics setting or mobile performance result.
