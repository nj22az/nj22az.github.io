# Hotels & Parking: complete map coverage and hotel feed — 25 October 2026

## Delivery state

**Published to main and GitHub Pages.** Implementation commit:
[`aa792244c914eec604b0aac4e5fb18ccaa4119cd`](https://github.com/nj22az/nj22az.github.io/commit/aa792244c914eec604b0aac4e5fb18ccaa4119cd),
based on production `344dc5d5cac9e73cd8d6b885a7d3bed2356f4715`.
The owner explicitly requested verification, readability improvements and publication.
[Pages deployment 40160561135](https://github.com/nj22az/nj22az.github.io/actions/runs/40160561135)
completed successfully for that exact commit. Public HTML, JSON, CSV, map script
and hotel stylesheet were fetched successfully and match the tested bytes exactly.
[Public-file hashes](PUBLICATION-MAP-FEED-2026-10-25.json) preserve the result.
Live page: <https://nj22az.github.io/blog/hotels/>.
This sign-off changes documentation only; public application bytes remain the tested delivery.
No new branch is required: the existing site instructions publish ordinary website fixes
on main; the owner's main/development/pixar branch arrangement is preserved.

## Delivered

- All **16** hotels in the previous publication's `locationsNotPlotted` list now have
  property-specific coordinates from their own official Scandic `/map-view` pages.
  **32 of 32** registered hotels are mapped; **31** have the existing confirmed free option.
- The official map payload explicitly associates `hotelName`, `markerInfo.hotelId`
  and `coordinates`. Only that hotel marker was extracted. Nearby stations/airports
  under `pointsOfInterest`, viewport centres and third-party search results were not used.
  [Location evidence](LOCATION-EVIDENCE-2026-10-25.json) records property identity,
  existing address, exact marker evidence, source URL, review date and response SHA-256.
- Every non-coordinate JSON field and all 16 previously verified points are unchanged.
  No new hotel, parking claim, registration exemption, tariff or personal observation added.
  Skellefteå's free outdoor area and paid garage remain separate; Västerås still requires
  reception registration; unstated procedures remain unknown.
- The generated website has a readable hotel feed with SVG icons, labelled parking
  status, conditions, check date and direct marker actions. Full notes and sources use
  native disclosure controls. The complete comparison table remains available separately.
  Feed/Map jump links help narrow screens. Shared site navigation/themes are retained.
- Filters still select the same register rows, cards and markers. The user's location
  stays independent of hotel filters. Unmapped records remain readable and are counted
  accurately; no-library and permission-failure paths remain usable.
- The existing **37-column CSV** retains UTF-8 BOM/CRLF and its original values.
  Only the 16 previously blank latitude/longitude/source triples changed.

## Checks actually run

- `python3 tools/build-hotels.test.py`: **11/11 pass**, including coordinate evidence
  and CSV agreement, a null-coordinate fixture and registration/garage preservation.
- `python3 tools/build-hotels.py --check`: current, **32 records**.
- `node --check blog/hotels/hotels.js` and `hotels-map.js`: pass.
- `node tools/blog-feed.test.cjs`: pass; general article feed stays separate.
- `git -c core.whitespace=cr-at-eol diff --check`: pass.
- Artifact Tool CSV import/edit/re-import: **32 × 37 fields** round-trip; unrelated
  fields unchanged. Independent JSON baseline comparison and CSV point/source comparison pass.
- Chromium component harness using actual Leaflet 1.9.4, local mock tiles and simulated
  geolocation: **19 interaction/layout checks and 9 degradation checks pass**.
  Widths **1440, 834, 390, 320 px** have no horizontal overflow with shared styling.
  Checks cover default/free, country/search/parking/reset filters, accent-insensitive
  Växjö search, marker counts, correct card-to-marker popup, zero results, all 32 hotels,
  simulated position/filter/clear, denied permission, pending-result cancellation,
  missing-point counts and missing-Leaflet fallback. Desktop, iPad-width and phone-width visual review completed.
  The 320 px test exposed the shared body's minimum width plus a desktop scrollbar;
  `body.hotel-site` now permits a smaller content width without changing other pages.

## Verification limits

These are Chromium viewport checks, not physical iPad/phone or Safari acceptance.
Real GPS permission and device accuracy were not tested. Mock tiles deliberately avoid
automated traffic to OpenStreetMap; remote fonts were excluded from the local harness.
The HTTP preview's secure-context guard was bypassed only in its untracked fixture to
exercise simulated location; the published script retains the HTTPS requirement.
No-JavaScript rendering retains all records, native notes and the CSV; map controls stay hidden.
The untracked preview/fixture directories and hosting configuration are not part of publication.

## Next action

Publication and five public-file comparisons are complete. Further hotel expansion
remains a separate property-level parking verification task. Physical Safari/iPad/GPS
acceptance remains unclaimed. Unrelated World guard and Linux acceptance workflows
were still running/pending at this sign-off; no game or Linux code was modified.
