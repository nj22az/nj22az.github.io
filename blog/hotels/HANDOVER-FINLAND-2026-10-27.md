# Finland follow-up: Rosendahl to Easy, eight free-parking hotels — 27 October 2026

## Request and state

The owner, 27 October 2026: "Scandic Rosendahl in Finland should be yellow as it's easy to
park there and I know you can pay for parking at the hotel by them. Can you search for
more hotels in Finland with confirmed free parking?"

On branch `claude/peaceful-clarke-fprqk3`; **not on main and not published** until the
owner says so. Evidence: [FINLAND-EVIDENCE-2026-10-27.json](FINLAND-EVIDENCE-2026-10-27.json).

## Scandic Rosendahl, Tampere: Avoid → Easy (yellow)

- Official page re-read today: tariff unchanged (outdoor EUR 2/h or 8/24 h; garage
  EUR 2.50/h or 14/24 h; pay at reception, machine, ParkMan or EasyPark).
- The owner reports paying at the hotel with parking on the hotel bill. That is the
  second fact Easy needs (`parkingOnHotelReceipt: true`). It is recorded as the owner's
  report in the summary, notes, source note and evidence basis, never as something the
  official page says. If a stay ever produces a separate parking receipt, set it back
  to `null` and the hotel returns to Avoid.
- Register now: **136 hotels: 42 green, 1 Easy, 93 Avoid; all 136 mapped.**

## Eight Finnish hotels added, free parking confirmed on their own pages today

All eight came from the [25 October research shortlist](FINLAND-PARKING-RESEARCH-2026-10-25.md)
and were re-read today before admission. Scandic map points are the official
`/map-view` named markers (hotel id 670, 693, 672, 668); Sokos points are the hotel
pages' own location data; Kauppi is its website's own map pin; Kajanus is the centre
of its contact page's own map embed. No city-centre pins.

| Hotel | Place | Confirmed today |
| --- | --- | --- |
| Scandic Aulanko | Hämeenlinna | Free outdoor, 330 spaces, no reservation; 13 EV points (charge not confirmed free) |
| Scandic Kemi | Kemi | Free outdoor, 50 spaces with heater sockets |
| Scandic Kouvola | Kouvola | Free outdoor adjacent car park, 100 spaces, accessible spaces |
| Scandic Hyvinkää | Hyvinkää | Free outdoor, **only 12 spaces**; when full the hotel directs you elsewhere, charge unconfirmed |
| Break Sokos Hotel Bomba | Nurmes | Free 24/7 in front of the spa hotel and in the Karelian village; charging bays are for charging only |
| Break Sokos Hotel Vuokatti | Sotkamo | Free hotel lot with heating poles and free Snowpolis overflow lot; EV charging paid via ABC app |
| Hotel Kauppi | Tampere | Free parking in front, included in the room price; no postal code published |
| Hotel Kajanus | Kajaani | Free own area, 80 heater-post spaces, no reservation |

Still excluded: Scandic Eden Nokia (paid, payment route unconfirmed) and the former
Scandic Imatran Valtionhotelli URL (redirects). This is not a Finnish census; other
chains in Finland remain unreviewed.

## Files

`hotels.json` (+8 records, Rosendahl edited), `hotel-reviews.csv` (136 rows; the 127
untouched rows are byte-identical; Rosendahl's row changed only in its parking
cells, source and basis), `index.html` (regenerated), `tools/build-hotels.test.py`
(Scandic count 121 → 125; Rosendahl exception in the 25 October paid-evidence test,
pointing at the new evidence; a new Finland test).

## Checks

`build-hotels.py --check` PASS (136); unit tests **18/18**; theme-lock test PASS;
browser harnesses 19/19 (tags) and 46/46 (feed and trip; its Easy count is now read
from the data). Easy view and Finland view screenshots reviewed. Not tested: Safari
or physical devices.
