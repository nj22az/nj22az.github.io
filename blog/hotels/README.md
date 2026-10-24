# Hotels & Parking

An independent Blog subsection, linked from `/blog/`. Hotel reviews do not enter
the general article catalogue or the homepage's article feed.

## Updating the register

1. Add the owner's observations to `hotels.json`. Use a stable review id and hotel
   id. `recordedOn` is when the note was recorded; do not infer precise stay dates.
2. Record prices **paid for that stay**, with the currency separately. The page
   calculates the total from room and parking amounts. Do not replace these with
   a hotel's current advertised tariff.
3. Use `true`, `false` or `null` for free parking, easy parking and inclusion on the
   hotel receipt. Unknown ease must never qualify for the free-and-easy filter.
4. Verify hotel identity/address against the official hotel or parking page.
   Attribute the review, prices and receipt experience to the personal stay
   report. Do not invent service, breakfast, cleanliness or numerical ratings.
5. Run `python3 tools/build-hotels.py`. Commit the data and generated page together.
6. Refresh `hotel-reviews.csv` from the same records using a spreadsheet tool.
   Preserve numeric prices, ISO recorded dates, source URLs and UTF-8 place names.
   CSV totals are exported values; the website derives them from the inputs.
   Compare the CSV fields and totals with the JSON before publishing.
7. Run `python3 tools/build-hotels.py --check` and check filtering, reset, the CSV
   download and narrow-screen layout. Update the relevant handover.

The site has no build dependency: generated HTML and the CSV are served directly.
`hotels.js` progressively adds filters to the existing table and matching notes.
The complete register and CSV remain available without JavaScript.

## Future map

The address, city, country and stable hotel id are stored for a future map.
`coordinates` stays `null` until independently verified. When available, use
`{"latitude": 0, "longitude": 0, "sourceUrl": "https://…"}` with the actual
verified coordinates and a source; never substitute zeroes for an unknown point.
No map, geolocation prompt or map service dependency is added at this stage.

## First entry

Scandic Elmia, Jönköping, recorded 24 October 2026. Room SEK 1,107; parking SEK 105;
total SEK 1,212. External paid parking through Pair; a separate website receipt
was available and parking could not be put on the hotel receipt on this stay.
Ease of parking and precise stay dates have not been independently supplied.
