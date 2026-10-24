# Swedish Scandic parking findings — 24 October 2026

## Publication status

**Published to main; GitHub Pages deployment succeeded.** Final implementation:
[`1e103658eeff1c8ad9896b9102b8ad853d272af4`](https://github.com/nj22az/nj22az.github.io/commit/1e103658eeff1c8ad9896b9102b8ad853d272af4).
[Pages run 40095772295](https://github.com/nj22az/nj22az.github.io/actions/runs/40095772295)
completed successfully on 24 October 2026 at 12:54:47 UTC for that exact commit.
The final sign-off removes the temporary publication workflow and changes only
documentation/verification records, not the reviewed public page or data.

Live page: <https://nj22az.github.io/blog/hotels/>.
Export: <https://nj22az.github.io/blog/hotels/hotel-reviews.csv>.
The separate ChatGPT Sites dashboard was not modified by this GitHub Pages update.

## Owner decision

Publish the verified Swedish findings. Fee confirmation comes first: explicit free
weekday and weekend tariffs for the named outdoor guest-parking area. Registration
instructions and paid alternatives remain visible. Do not claim no registration,
guaranteed availability, free EV charging, free garages or full-chain coverage.
Detailed green/blue/yellow/red refinement was deferred by the owner's later request.

## Delivered

- **18 Swedish Scandic hotels** reviewed individually against official property
  Amenities > Parking sections. **16 added**, Sundsvall Nord and Östersund Syd refreshed.
- **32 hotels total; 31 confirmed free-parking options**, plus the existing paid
  Scandic Elmia observation. The 18 Swedish Scandics are a verified subset, not an
  exhaustive Swedish or Nordic chain inventory.
- **Scandic Skellefteå:** outdoor parking explicitly free on weekdays/weekends;
  outdoor capacity not published. The separate **40-space garage** is paid:
  SEK 100 day (08:30–16:30), SEK 220 night (17:00–08:00), or SEK 270 per 24 hours,
  on both weekdays and weekends. These are not the outdoor parking tariffs.
- **Scandic Västerås:** reception registration explicitly required. Unstated
  registration procedures at other hotels are not represented as confirmed absent.
- Table, parking notes and **37-column CSV** retain source links and check dates.
  Added evidence fields identify the free area, weekday/weekend prices, capacity,
  registration, paid alternatives and evidence basis.
- Existing hotel prices, personal stay descriptions, currencies, nights and map
  positions are preserved. New accommodation prices remain unknown, not zero.
  No private uploads, booking references, card details or exact stay dates published.

## Map limitation — outstanding

**16 of the 32 hotels have verified map points.** The 16 new Swedish additions
have verified street/postal addresses but their coordinates could not be verified
through the official location retrieval in this session. They are in the table,
notes and CSV; they are NOT plotted using approximate city-centre coordinates.
The page states this coverage, and the map status explicitly reports mapped versus
selected hotels. Searching for Växjö or Skellefteå no longer misleadingly says
that no hotel matches when its address entry is present but its map point is absent.
The exact missing list is in the publication-checks JSON below.

## Verification actually completed

- [Publication run 40095190246](https://github.com/nj22az/nj22az.github.io/actions/runs/40095190246):
  8 admission tests, generated-page check, both JavaScript syntax checks and the
  existing Blog feed regression passed. The initial attempt stopped on Git treating
  CSV CRLF as trailing whitespace; CRLF-aware whitespace validation resolved this
  without removing content tests.
- [Final coverage run 40095739207](https://github.com/nj22az/nj22az.github.io/actions/runs/40095739207):
  the same checks passed after the map-status clarification and cache-key changes.
- Downloaded the tested artifact and independently verified 32 JSON/HTML/CSV rows,
  31 free options, 18 Swedish evidence rows, 37 CSV columns, UTF-8 BOM/CRLF,
  matching source URLs and the Skellefteå/Västerås distinctions.
- Offline Chromium hotel-component checks passed at 1440, 834, 390 and 320 px:
  country/search/parking/reset filters, accent-insensitive search, matching notes,
  published fee text, no horizontal overflow and no component JavaScript errors.
  Both actual Leaflet marker/filter behaviour and missing-Leaflet fallback passed;
  no-JavaScript content retains all 32 records. Desktop and phone renderings inspected.
- Those browser checks used downloaded local files with external requests blocked;
  shared navigation/theme bootstrap scripts were excluded, and remote fonts/map
  tiles were not loaded. They are component checks, not a full live-browser or
  physical-device sign-off. No real GPS, Safari or native Excel acceptance claimed.
- [Public-file check 40095417781](https://github.com/nj22az/nj22az.github.io/actions/runs/40095417781)
  returned HTTP 200 and exact repository-byte matches for HTML, JSON and CSV after
  the data addition, before the final map-coverage wording polish. JSON and CSV did
  not change in that polish. The final polished implementation has the successful
  Pages result recorded above; a second byte comparison of its HTML is not claimed.

Evidence: [reviewed source manifest](scandic-sweden-findings-2026-10-24.json),
[data checks and unmapped hotels](SCANDIC-PUBLICATION-CHECKS-2026-10-24.json),
[release verification summary](SCANDIC-RELEASE-2026-10-24.json).
The root HANDOVER.md points here; the earlier hotel handover remains historical.

## Remaining work

Verify property-specific coordinates for the 16 additions and then regenerate the
page/export together. Keep the table available while map verification is incomplete.
Further Nordic or other-chain expansion requires new official property-level checks;
no unverified 171-hotel catalogue has been imported. The separate Sites dashboard
and detailed colour refinements remain outside this publication.
