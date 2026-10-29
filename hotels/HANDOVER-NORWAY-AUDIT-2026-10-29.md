# Norwegian Scandic audit — 29 October 2026

## Delivery state

Prepared on local `main` from production `34a1c38070aec190141108e7c541368033ebf33f`.
No new remote branch and no PR. **Published to `main` as
[`8a1d1aa7002cbdaa47969ef045d59327a0d97153`](https://github.com/nj22az/nj22az.github.io/commit/8a1d1aa7002cbdaa47969ef045d59327a0d97153).
[Pages deployment 40835574456](https://github.com/nj22az/nj22az.github.io/actions/runs/40835574456)
succeeded. All 16 public files match tested local bytes, including page, data, CSV,
CSS/JS, audit, evidence, tests and handovers. See
[publication evidence](PUBLICATION-NORWAY-2026-10-29.json).
The handover/publication sign-off is a documentation-only follow-up.
The owner explicitly requested expansion and addition of supported findings to the
directory, CSV and map through the repository workflow.

## Result

[Complete audit](SCANDIC-NORWAY-AUDIT-2026-10-29.md) and
[structured official evidence](SCANDIC-NORWAY-EVIDENCE-2026-10-29.json).
All 81 countryCode NO catalogue properties reviewed, including by-Scandic/partner
properties. Before: only Flesland Airport, Byporten and Ørnen registered; 78 unreviewed.
Now: 75 additions, three refreshed, three charge-unknown cases withheld.
Norwegian Scandics: 18 Green, 1 Blue (Sunnfjord), 0 Yellow, 59 Red; 78 registered/mapped.
The full register has 211 hotels: 57 Green, 4 Blue, 1 Yellow, 149 Red, all mapped.

Eight linked official parking subpages were also read. Sources, SHA-256 values,
verification dates, weekday/weekend tariffs, capacities, distances and unresolved
billing facts are retained. Property identity/address checked against the property's
own Hotel JSON-LD; named catalogue hotel locations carry ids and source/hash evidence.
Original three map points preserved. No city or viewport centres substituted.

Holberg, Karl Johan and Sarpsborg do not establish charges on their official parking
sections; they remain outside JSON/CSV/map with their review in the evidence.
Hotel Norge has conflicting official tariffs, both recorded; no definitive rate selected.
Paid status can be confirmed while an amount remains unpublished (“At a cost”).
No Norwegian property confirms combined hotel-receipt inclusion, so none is Yellow.
Explicit official structured paymentType supports hotel-payment facts, separately
from receipt inclusion. Operator identity alone never implies an external payment route.
Negative distance placeholders at Solli and Helsfyr are retained as unknown distances.

## Integration and preservation

- Current Norwegian parking facts go into hotels.json; current tariffs never replace
  actual stay payments. No invented stays, room prices, ratings or owner observations.
  No new stay blog post is needed because this update contains only official research.
- Blue required-registration category is consistent in generator, cards/table,
  filters/counts, CSV and map. Marina/Kolding flags reuse existing evidence;
  Västerås already has the structured requirement. Evidence dates are preserved.
- Existing 131 unrelated JSON records unchanged; only three Norwegian Scandic records
  and Marina/Kolding registration flags changed. Existing CSV rows unchanged except
  the three Norwegian refreshes and Blue category labels for Marina/Kolding/Västerås.
- Chain filter recognises the four named by-Scandic/partner properties explicitly.
- Green remains reset/default and the trip-planner criterion; Blue is selectable
  separately and visible in All. “You” keeps its own labelled rectangular marker.
- Fixed design retained. Cache versions: hotels CSS 13, map CSS 4, hotels JS 11,
  map JS 7. Generated page and data committed together.
- CSV authored/round-tripped through @oai/artifact-tool: 211 rows × 38 columns,
  UTF-8 BOM/CRLF. Numeric zero applies only to free parking; actual paid amounts
  unknown remain blank. Dated tariffs and official sources preserved.

## Validation actually completed

- `python3 tools/build-hotels.test.py`: 22/22 pass, including all 81 dispositions,
  charge-unknown exclusions, coordinates, dates, CSV amounts and receipt discipline.
- `python3 tools/build-hotels.py --check`: PASS, 211 records.
- `node tools/hotel-filters.test.cjs`: 43 assertions pass, executing the actual JS
  against generated row attributes: Norway/chain/category/receipt/search combinations,
  Blue counts and map visibility events agreeing with rows/cards.
- `node tools/hotel-theme.test.cjs`: PASS across 11 saved themes and empty storage.
- `node tools/blog-feed.test.cjs`: PASS.
- Node syntax checks for hotels.js/hotels-map.js: PASS.
- `git -c core.whitespace=cr-at-eol diff --check`: PASS (CSV intentionally uses CRLF).
- Prior record/CSV preservation compared against the production base.

**Visual/browser limit:** no browser executable was available in the local runtime;
Playwright's official browser download returned an unusable archive. The separate
cloud browser could not reach the local preview (ERR_CONNECTION_REFUSED).
Desktop/narrow-screen layout, Leaflet interactions, GPS and browser fallbacks were
not run. The filter test is a VM/DOM-attribute test, not a browser or visual test.
No Safari, iPad or physical-device claim is made. Existing wrapping styles and
labelled marker shapes were retained; the Blue styles use the same component rules.

## Next concrete actions

Publication and exact live bytes are verified. Complete desktop/iPad/narrow-screen/Leaflet checks when a browser can reach the page;
mock OSM tile requests in automation. Confirm charges for the three withheld properties
from official hotel information before admission. Resolve Hotel Norge tariffs and
hotel-receipt inclusion before promoting any paid Norwegian property to Yellow.
