# Swedish Scandic parking audit — 25 October 2026

## Delivery state

Prepared and locally verified; deployment and public-file verification will be
recorded here after publication. Previous delivery:
[60-hotel field service register](HANDOVER-SCANDIC-PAID-2026-10-25.md).

## Outcome and scope

**91 Swedish catalogue-linked Scandic properties reviewed: 72 Avoid, 19 with a free
option.** Includes Scandic Go, Haymarket and Downtown Camper. The three Norway,
Denmark and Finland recommendation links in the Sweden page were excluded by
property identity/country, not counted as Swedish coverage. This is a Scandic
Sweden audit, not every hotel chain in Sweden or a claim about future openings.

Added **67 Avoid entries and free Scandic Värnamo**. The directory now has
**128 hotels: 34 green, 0 Easy, 94 Avoid; all 128 mapped**. The Swedish filter has
93 properties: 91 Scandics plus the existing Havanna and Jämteborg entries.

The established engineer-focused rule remains: paid parking is Easy only with
confirmed payment at the hotel AND confirmed inclusion on its receipt. Either
unknown makes paid parking Avoid. Unknown remains null, never asserted impossible.
Free usable parking can be nearby public parking; an attributed access warning
can override it. No hotel-quality or safety rating is implied.

## Evidence and notable conditions

- [Complete Swedish Avoid list and free exclusions](SCANDIC-SWEDEN-AUDIT-2026-10-25.md).
- [91-property structured evidence](SCANDIC-SWEDEN-EVIDENCE-2026-10-25.json): property
  identity, current tariff units/windows, weekday/weekend distinctions, reservation
  and distance facts, check dates, source hashes and 68 exact named map markers.
- **Kista:** permits bought at reception, but hotel receipt inclusion unconfirmed.
- **Haymarket:** reception discount does not establish hotel payment or billing.
- **Europa:** hotel ticket applies only on Nordstan floor 6; booking at reception
  does not establish a combined receipt.
- **S:t Jörgen:** official renovation restriction prevents entrance stopping;
  garage recommended for reception access. Different weekday/weekend tariffs.
- **Kiruna:** live parking page links construction-related temporary directions
  with an older dated attachment. Confirm current access, do not date the works
  from the audit date. No free night period inferred from stated hourly windows.
- **No 25:** hotel identifies Burggrevegatan garage; municipal operator confirms
  paid tariff and payment machine. Operator page retrieved through web search;
  direct raw HTTP fetch returned 403, so no invented raw-page hash is recorded.
- **Värnamo:** 24 free outdoor Myntgatan spaces, weekdays/weekends, no reservation;
  registration requirements remain unknown.

## Implementation and preservation

- All previous 60 JSON records and every previous CSV cell are unchanged, including
  Elmia’s SEK 105 paid stay and original receipt observation. Current SEK 10/hour
  Elmia tariff is an audit fact, not a replacement for the personal payment.
- All 68 additions use named official property markers, independently matched to
  each hotel identity. No city-centre or viewport-centre substitutes.
- Haymarket and Downtown Camper join Scandic in the chain filter using verified
  property IDs. Other hotel groups remain unchanged.
- Feed cards expose reported distances and key arrival restrictions. Full notes
  retain all listed parking areas, prices, booking and registration uncertainty.
- CSV written and round-tripped through the spreadsheet tool: **128 × 37 columns**,
  UTF-8 BOM/CRLF, numeric free charges and unknown personal paid amounts preserved.
- Generated HTML links the Swedish audit and distinguishes its scope from partial
  coverage elsewhere. Fixed design and existing map/filter implementation retained.

## Checks

- Hotel/data suite: **17/17 pass**; generator `--check` passes.
- Theme-lock regression across all 11 saved themes and empty storage passes;
  homepage behaviour remains unchanged. Blog feed regression passes.
- Exact comparison against the clean published baseline confirms all original
  60 records/CSV rows retained. New CSV fee/receipt states match JSON.
- **55 Chromium interaction/layout checks and 9 fallback checks pass.**
- Phone-sized S:t Jörgen card visually reviewed, including the arrival restriction.
- Chromium harness uses actual Leaflet with local mock tiles and simulated GPS.
  Combined country/chain/parking/search/receipt filters and map markers checked;
  new named marker, Kista receipt handling, Haymarket/Downtown Camper chain mapping,
  Värnamo green exclusion, previous access exceptions, reset and empty states covered.
- Responsive overflow checked at **1440, 834, 390 and 320 px**, preferred and Avoid.
  Missing location/library, denied permission and clear during pending GPS covered.
- Physical devices, Safari and real GPS are not claimed as tested.

## Remaining work

Publish, verify Pages and record sign-off below. Recheck receipt inclusion directly
before moving any paid property to Easy. Follow up construction access before travel.
Norway/Finland/Denmark and other chains remain separate work; do not infer nationwide
hotel coverage from this Scandic catalogue audit.
