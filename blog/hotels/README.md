# Hotels & Parking

## Feed and trip planner — 27 October 2026

The page now reads like a feed:
- icon-led posts;
- notes that open as a comment thread;
- Save and Share;
- a From/To planner that picks green-parking hotels by real drive time;
- a clearer map.

Data and rules are unchanged. On branch `claude/peaceful-clarke-fprqk3`, not yet
on main. See the [handover](HANDOVER-FEED-TRIP-2026-10-27.md).

## Finder clarity — 26 October 2026

The page is reorganised so a reader finds a place quickly:
- grouped by country and sorted by city;
- parking chosen with labelled chips showing live counts;
- compact cards with one facts row;
- list first on phones, with a List/Map switch.

No records or rules changed. Published as `330717e9`; see the
[handover](HANDOVER-FINDER-CLARITY-2026-10-26.md).

## Swedish Scandic audit — 25 October 2026

91 Swedish catalogue-linked property pages reviewed: **72 Avoid, 19 with verified
free options**. This adds 67 Avoid entries and green Scandic Värnamo. Existing 60
records and CSV rows remain unchanged. Haymarket and Downtown Camper correctly
belong to the Scandic chain filter; no new chain affiliation is guessed.
The register now contains **128 hotels, all mapped: 34 green, 0 Easy, 94 Avoid**.
See the [Swedish audit and complete Avoid list](SCANDIC-SWEDEN-AUDIT-2026-10-25.md),
[structured evidence](SCANDIC-SWEDEN-EVIDENCE-2026-10-25.json) and
[current handover](HANDOVER-SWEDEN-AUDIT-2026-10-25.md).
The policy below remains in force. Other hotel chains/countries are not a complete census.

## Field service parking decisions — 25 October 2026

This directory serves field service engineers who need a straightforward overnight
stop, with little payment or receipt administration. Free guest parking remains the
default. Easy requires **both** confirmed payment at the hotel **and** confirmed inclusion
on the hotel receipt. Paid parking with either fact unconfirmed is Avoid. Free
parking has no parking receipt requirement; access warnings can still make it Avoid.

The owner confirmed external paid parking as Avoid, then added: **“Unclear payment
is avoid.”** This applies to confirmed paid parking with an unknown payment route;
unknown is retained as null, not converted into an assertion of external payment.
The parking charge itself must still be verified. Avoid is a parking preference,
not a quality, service or safety review.

Best Western Plus Hotel Odense is also Avoid for difficult access, despite confirmed
free parking. The owner reports a long walk and construction-site parking; the
official hotel confirms expansion-related closures. Keep these sources distinct
and recheck after construction. See [Odense evidence](ODENSE-ACCESS-EVIDENCE-2026-10-25.json).
`parkingAccessWarning` records the attributed report; category calculation checks
this warning before the fee/payment rule. Default green results exclude it; All
parking and Avoid include it. Best Western has its own chain filter.

The first paid-parking batch adds 25 Scandics in the requested sequence: Denmark 14,
Sweden 4, Norway 3, Finland 4. All have official property-specific map markers.
All 25 are Avoid: none has confirmed hotel-receipt inclusion. Original 32 records and CSV rows are unchanged.
[Evidence and scope](SCANDIC-PAID-EVIDENCE-2026-10-25.json) and
[handover](HANDOVER-SCANDIC-PAID-2026-10-25.md). This is not a complete Nordic census.

Hotell Havanna, Varberg, is green for nearby free street parking. Ownership is
not required: the owner reports plentiful spaces close by; the hotel’s own A–Ö
page corroborates free nearby spaces. Street-by-street time limits and registration
remain unspecified, and availability is not guaranteed. Named selected-place
coordinates are verified from the official contact page’s map embed.

Scandic Odense is separately added with confirmed free outdoor weekday/weekend
parking (120 spaces) and its official named map marker. There are now 35 verified
free-parking options in total; 34 remain preferred/green, with Best Western Odense
excluded for access. These are distinct properties.

## Chain filter and fixed design — 25 October 2026

Hotel chain now intersects with country, search, parking and receipt filters.
Current groups are Scandic, Thon Hotels, Best Western and Other hotels; reset selects all chains.
The hotel section has a fixed, note-inspired reading/feed design, independent of
the homepage's changing theme. Its appearance selector is hidden, and visits do
not change the theme preference used elsewhere. See [design rules](DESIGN.md) and
the [latest handover](HANDOVER-CHAIN-DESIGN-2026-10-25.md).

## Map and feed update — 25 October 2026

All 32 hotel records now have verified coordinates. The 16 previously unmapped
Swedish Scandics use the named hotel marker from their official `/map-view` data;
see [location evidence](LOCATION-EVIDENCE-2026-10-25.json) and the
[current handover](HANDOVER-MAP-FEED-2026-10-25.md).
The icon-led hotel feed and comparison table share filters with the map.
Cards retain full conditions and sources in native expandable notes. Missing
points, should a future record lack verification, are excluded from the map and
counted explicitly. Parking facts and the 37-column CSV conventions are preserved.
Historical counts and older CSV descriptions below refer to their earlier releases.

## Current Swedish publication — 24 October 2026

The latest owner instruction is to establish confirmed free guest-parking fees first.
The Swedish update lists 18 verified Scandics, with free weekday/weekend outdoor
tariffs, registration notes and paid alternatives. A free-option label does not
mean every parking area is free, no registration, or a guaranteed space. Detailed
colour refinement is deferred. The CSV now appends seven evidence fields (37 total).
See [the current handover](HANDOVER-SCANDIC-2026-10-24.md). Historical counts below
describe earlier releases, not the current register.

An independent Blog subsection, linked from `/blog/`. Hotel reviews do not enter
the general article catalogue or the homepage's article feed.

## Admission rule: confirmed parking only

The owner's instruction on 24 October 2026 is binding: **do not add a hotel when
we do not know whether guest parking is free.** Check the current property-owned
hotel information before adding a discovered free-parking hotel. An API amenity,
tourism feed, map tag, search result or generic chain list is a research lead;
resolve the property-specific conditions before publication. Exclude ambiguous,
conflicting and stale claims until they are resolved.

Every published record has `parkingVerification` with `status` (`confirmed-free`
or `confirmed-paid`), `checkedOn` (ISO date) and `sourceUrl` (the reviewed hotel or
parking URL). The generator rejects missing, unknown or inconsistent parking
confirmation. This checks the recorded evidence contract; a person must still
read the source and establish the facts. It does not fetch or automatically
reverify live websites.

Keep the free option precise: normal guest parking for the stay, including any
registration instructions. Free outdoor parking does not make a paid garage or
EV charging free. Nearby public parking can qualify when its free use and practical access are
confirmed by property information or an attributed owner report. Record ownership,
time limits and uncertainty explicitly. A few free hours or an unexplained parking
package alone does not establish free parking for the stay.
If a published policy changes or becomes uncertain, remove the affected hotel
from the public free-parking register until it is checked again. Preserve known
paid stay observations, including Scandic Elmia, as clearly labelled paid entries.

## Parking colours: the owner's corrected definition

| Colour | Category | Meaning |
| --- | --- | --- |
| Green | Free parking | Confirmed free guest parking; the preferred option and default filter. |
| Yellow | Easy parking | Parking is paid at the hotel and confirmed on the hotel receipt. |
| Red | Paid parking — Avoid | Paid parking has external payment, separate receipts or either fact unconfirmed; documented difficult access also qualifies. |

“Easy parking” requires **payment at the hotel and confirmed hotel-receipt inclusion**. The old physical-ease field and
combined free-and-easy category have been removed. Free parking qualifies for green unless an attributed access warning makes it
Avoid. A fee-free access warning keeps `freeParking: true` and zero parking charge. Use `parkingPaymentAtHotel: null` when parking is free; for paid
parking, record payment at the hotel as `true`, `false` or `null`. Only `true` together
with `parkingOnHotelReceipt: true` qualifies as yellow; otherwise paid parking is red. For confirmed paid parking, an unknown payment route is red/Avoid under the
owner’s 25 October rule. Keep `parkingPaymentAtHotel: null` and
`parkingType: "payment-unconfirmed"`; never rewrite unknown as false. Unknown
parking charges still cannot be published. `parkingOnHotelReceipt` is a separate billing
fact and may remain unknown even when payment at reception is confirmed.

Table and review labels, map markers/popups, filters and the CSV share these
definitions. Colours retain their meaning across themes, and text labels convey
the same categories. The visitor's own map position is blue. Reset filters
returns to green/free parking; All parking shows the complete register. Without
JavaScript, all records remain readable with their category labels. Current
counts: **34 green, 0 yellow, 94 red; 128 hotels with 128 verified locations**.

## Updating the register

1. Add confirmed parking facts or the owner's observations to `hotels.json` after
   applying the admission rule above. Use a stable review id and hotel id.
   `recordedOn` is when the note was recorded; do not infer precise stay dates.
2. Record accommodation prices **paid for the complete stay** in `roomPaid`, with
   `nights`, an ISO `currency` where known and a `priceNote`. The page calculates
   the total from room and parking amounts. Unknown amounts and nights are `null`,
   never zero. If a receipt supplies only an ambiguous currency label, preserve it
   in `currencyLabel`, leave `currency` null and explain that in `priceNote`.
   Do not replace a paid price with a hotel's current advertised tariff.
3. Use `true` or `false` for free parking, supported by `parkingVerification`.
   Record the paid-parking payment route using `parkingPaymentAtHotel` as above.
   Inclusion on the hotel receipt may remain `null`.
   Free parking has a zero charge and a receipt state of not applicable on the
   page/export. Use `parkingLabel` and `parkingSummary` to describe registration
   requirements or distinguish a free outdoor option from a paid garage.
4. Verify hotel identity, street, postcode and country against the official hotel
   page. Use the full country name and two-letter `countryCode`. Identify whether
   each note comes from a stay report or published hotel information; do not
   invent service, breakfast, cleanliness or numerical ratings. Never commit
   receipt/message screenshots, guest names, booking references, card details,
   personal contact information or exact stay dates.
5. Run `python3 tools/build-hotels.py`. Commit the data and generated page together.
6. Refresh `hotel-reviews.csv` from the same records using a spreadsheet tool.
   Preserve numeric prices, ISO recorded dates, source URLs and UTF-8 place names.
   CSV totals are exported values; the website derives them from the inputs.
   Include nights, average accommodation price per night, the price basis and
   coordinate sources, parking confirmation status, check date, source, parking
   category and payment-at-hotel state. Column O is now Parking category and
   column AD is Payment at hotel, giving 30 columns.
   Compare all CSV fields and totals with the JSON before
   publishing; do not mix a multi-night total with a nightly rate.
7. Run `python3 tools/build-hotels.test.py` and `python3 tools/build-hotels.py --check`.
   Check combined country/parking/
   receipt/search filters, map selection, location controls, reset, the CSV
   download and narrow-screen layout. Update the relevant handover.

The site has no build dependency: generated HTML and the CSV are served directly.
`hotels.js` progressively adds filters to the existing table and matching notes,
and dispatches `hotel-filter-change` with the visible review ids for the map.
The complete register and CSV remain available without JavaScript.

## Map and location

`hotels-map.js` uses Leaflet 1.9.4, loaded with the official SRI hashes, and
OpenStreetMap tiles. Attribution remains visible and normal browser caching and
referrer behaviour are retained. There is no tile prefetch, offline download,
runtime geocoding or location backend. **Mock tile requests in automated browser
checks**; do not pan/zoom a headless browser against the public tile service.

Each hotel's `coordinates` contains `latitude`, `longitude` and `sourceUrl`.
Use the official property marker or an authoritative property-specific source;
never substitute a city centre, static-map viewport centre or zeroes for an
unknown point. A missing point stays null and is not plotted.

The map uses the same visible review ids as the table and notes. Show my location
requests a single browser reading only after a click. Update refreshes it; Clear
removes it and ignores any pending response. A position and its accuracy circle
exist only in memory and are never added to the data, CSV, logs or storage.
The tile provider receives normal map-view requests, so do not claim that the
viewed area is hidden from it. Denied/failed location permission and a missing
map library leave the hotel register usable.

All seven initial property points are verified. The six Scandic points come from
their official `/map-view` property-marker data; Marina's point comes from the
`!3d`/`!4d` coordinates of the Google Maps place link on its official homepage.

The nine Nordic additions use official hotel map/structured-data points for
Norway and Finland and property-specific Visit Sweden tourism records for the
three Swedish points. Every coordinate retains its own source URL.

## Nordic additions and Expedia research

The register contains 16 hotels: 15 with a confirmed free guest-parking option
and the existing paid Elmia stay. The nine additions are Scandic Sundsvall Nord,
Scandic Östersund Syd, Hotell Jämteborg, Thon Hotel Bergen Airport, Thon Hotel
Elgstua, Thon Hotel Hallingdal, Scandic Espoo, Scandic Laajavuori and Scandic
Waskia. Their own property pages were checked on 24 October 2026. Their room
prices and personal stay assessments remain unknown.

This is a growing verified directory, not a complete census of Nordic hotels.
The Expedia repository findings, access requirements and offline import process
are documented in [NORDIC-CATALOGUE-2026-10-24.md](NORDIC-CATALOGUE-2026-10-24.md).
Research candidates and imported audits do not enter the public data, map or CSV.

## Danish additions

Hotel Marina, Scandic Aalborg Øst, Scandic Aarhus Vest, Scandic Kolding,
Scandic Opus Horsens and Scandic Sønderborg have free outdoor parking.
Marina requires the reported APCOA tablet registration at reception; Kolding
also requires reception registration. Opus's garage is paid.

Marina's permitted receipt amount is 5,728.46 kr for five nights including taxes
and fees after a booking credit, averaging 1,145.69 kr per night. The screenshot
does not show an ISO currency code, so neither SEK nor DKK is assumed. No raw
receipt or private conversation is published. The other new room prices remain
unknown.

## First entry

Scandic Elmia, Jönköping, recorded 24 October 2026. Room SEK 1,107; parking SEK 105;
total SEK 1,212. External paid parking through Pair; a separate website receipt
was available and parking could not be put on the hotel receipt on this stay.
Precise stay dates have not been independently supplied.
