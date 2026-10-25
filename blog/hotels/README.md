# Hotels & Parking

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
EV charging free. A hotel with only nearby public parking, a few free hours or
an unexplained parking package is not admitted as a confirmed free hotel.
If a published policy changes or becomes uncertain, remove the affected hotel
from the public free-parking register until it is checked again. Preserve known
paid stay observations, including Scandic Elmia, as clearly labelled paid entries.

## Parking colours: the owner's corrected definition

| Colour | Category | Meaning |
| --- | --- | --- |
| Green | Free parking | Confirmed free guest parking; the preferred option and default filter. |
| Yellow | Easy parking | Parking is paid, and payment can be settled at the hotel. |
| Red | Paid parking — Avoid | Parking is paid separately through an external payment route. |

“Easy parking” refers to **payment at the hotel**. The old physical-ease field and
combined free-and-easy category have been removed. Free parking always qualifies
for green. Use `parkingPaymentAtHotel: null` when parking is free; for paid
parking, verify `true` (yellow) or `false` (red). Unknown payment routing cannot
be assigned a colour or published. `parkingOnHotelReceipt` is a separate billing
fact and may remain unknown even when payment at reception is confirmed.

Table and review labels, map markers/popups, filters and the CSV share these
definitions. Colours retain their meaning across themes, and text labels convey
the same categories. The visitor's own map position is blue. Reset filters
returns to green/free parking; All parking shows the complete register. Without
JavaScript, all records remain readable with their category labels. Current
counts: **15 green, 0 yellow, 1 red (Scandic Elmia)**.

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
