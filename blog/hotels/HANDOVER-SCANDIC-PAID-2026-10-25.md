# Field service parking register — 25 October 2026

## Delivery state

Prepared and locally verified; publication sign-off will be recorded here after
GitHub Pages succeeds and the public files match the implementation.

## Final owner rules

This directory helps field service engineers find an uncomplicated overnight stop
without extra parking receipts or awkward access.

- Green: confirmed free usable parking, including nearby public street parking.
  Hotel ownership is not required. Preserve all registration and time restrictions.
- Easy/yellow: paid parking only when **both** payment at the hotel and inclusion
  on the hotel receipt are confirmed.
- Avoid/red: paid parking with external payment, a separate receipt, or either
  payment-at-hotel or receipt inclusion unconfirmed. Preserve unknowns as null.
- An attributed difficult-access report can make a free hotel Avoid. The fee
  remains free/zero; this must never be misrepresented as paid parking.
- These are practical parking recommendations, not hotel quality or safety ratings.

## Delivered data and interface

**60 hotels: 33 green, 0 Easy, 27 Avoid; all 60 have verified map points.**
34 have verified free options; Best Western Plus Hotel Odense is the access exception.

- Paid Scandic batch in requested order: Denmark 14, Sweden 4, Norway 3, Finland 4.
  All 25 classify as Avoid under the final receipt rule. Byporten and Rosendahl
  retain confirmed hotel payment but unknown receipt inclusion; no false external
  payment claim was introduced. This is a first batch, not a complete Nordic census.
- Best Western Plus Hotel Odense, Ørbækvej 350: free parking plus **Avoid · Difficult
  access**. Owner reports distant construction-site parking; official expansion
  notice corroborates partial closure, not exact walking distance or every space.
  Stay date and distance remain unknown. Recheck after construction.
- Scandic Odense, Hvidkærvej 25: green, free outdoor weekday/weekend parking,
  120 spaces, no reservations. Separate property from Best Western.
- Hotell Havanna, Varberg: green nearby free street parking. Owner reports no own
  parking and plentiful close spaces; live hotel A–Ö page corroborates nearby free
  spaces. Local time/registration limits are unspecified; no guaranteed availability.
- All 28 additions have property-specific coordinates. Scandic points are named
  official map markers. Best Western supplies official Hotel/GeoCoordinates.
  Havanna uses the **selected named place** in the official contact-page map embed,
  not its different viewport centre.
- Feed is explicitly for field service work. Receipt state is visible on cards;
  unknown receipt inclusion cannot qualify as Easy. Chain filter adds Best Western.
  Existing fixed note-inspired design, free default and map/filter behaviour remain.
- Original 32 JSON records and all original CSV cells preserved. Published tariffs
  remain notes; no current price became an invented personal amount paid.
  Spreadsheet-tool CSV round-trip covers 60 hotels × 37 columns, UTF-8 BOM/CRLF.

## Evidence

- [Scandic evidence](SCANDIC-PAID-EVIDENCE-2026-10-25.json): 25 paid properties and
  free Scandic Odense, official source hashes, named markers and payment facts.
- [Audit and country scope](SCANDIC-PAID-AUDIT-2026-10-25.md).
- [Best Western access evidence](ODENSE-ACCESS-EVIDENCE-2026-10-25.json).
- [Havanna street-parking evidence](HAVANNA-PARKING-EVIDENCE-2026-10-25.json).

## Checks

- Hotel builder/data tests: **15/15 pass**; generated page current.
- Theme-lock regression passes across all 11 saved themes and empty storage;
  homepage preference/randomisation unchanged. Blog feed regression passes.
- Hotel-map JavaScript syntax and CRLF-aware diff whitespace checks pass.
- **48 Chromium interaction/layout checks and 9 fallback checks pass.**
- Chromium harness tests the actual Leaflet library with local mock tiles and
  simulated location. Combined chain/country/search/parking/receipt filters,
  all cards/markers, unknown route/receipt, Best Western access exception,
  Scandic Odense and Havanna green entries, reset and empty states pass.
- Layout measured at **1440, 834, 390 and 320 px**, for preferred and Avoid feeds.
  Phone-sized Best Western access card visually inspected.
- Missing point, missing Leaflet, denied geolocation and clear during a pending
  location response checked. No public map tiles used in automated checks.
- Physical iPad/phone, Safari and actual GPS have not been tested.

## Next actions and limits

Publish and verify deployment as below. Country audit remains a growing batch;
expand the remaining Swedish/Norwegian/Finnish Scandics with the same evidence rule.
Resolve hotel receipt inclusion directly before promoting any paid entry to Easy.
Recheck Best Western access after works. Finnish free shortlist remains research
only except previously published hotels; no unverified candidate was imported.
