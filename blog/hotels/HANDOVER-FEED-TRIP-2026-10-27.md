# Hotels & Parking: social feed and trip planner — 27 October 2026

## Request and state

The owner, 27 October 2026:

- "Audit the hotel page I would like it to feel like a social media feed that you could
  organise and read comments and be icon driven with much less text, and the map to
  be easier to understand. I want to be able to add like I'm in Örebro and I'm driving
  to Malmö what's the most suitable hotel for me? Based on a green criteria."
- Then: "It should also be a suitable tool that gives time and distance like why would
  I want to stay in Kristinehamn? If I'm going to Malmo."

Built on branch `claude/peaceful-clarke-fprqk3`, restarted from main `cb9a16a0`
because the previous work there was already published. **Published to main on the
owner's word ("Push to main") as
[`3254716b`](https://github.com/nj22az/nj22az.github.io/commit/3254716b3329b1855a1c7b7d84d81fc0ba2338b5)**,
a fast-forward from `cb9a16a0`.
[Pages run 40455761285](https://github.com/nj22az/nj22az.github.io/actions/runs/40455761285)
succeeded. Nine live files match the commit byte for byte (the page, the three
scripts, both stylesheets, `hotels.json`, the CSV and this note), and the 46 browser
checks pass against the live page (OSRM still relayed in the sandbox).
Supersedes the layout of the
[26 October finder note](HANDOVER-FINDER-CLARITY-2026-10-26.md). Its data rules
still hold.

No hotel record, parking fact, category rule, CSV cell or evidence file changed.

## Audit (before → after, Chromium, same 34 free-parking hotels)

| Measure | Before | After |
| --- | --- | --- |
| Phone: first hotel starts at | 1,157 px | 832 px (the trip planner sits above it) |
| Phone: average post height | 403 px | 221 px |
| Phone: feed length | 13,715 px | 7,515 px |
| Visible words per post | 39 (max 68) | 31 (max 39) |
| Visible words on the page | ~1,730 | ~1,260 |
| Map legend, route, numbered picks | none | yes |
| Trip planning, saving, sharing | none | yes |

Overlap of map pins at the whole-Nordic zoom is still high (Stockholm and
Copenhagen clusters). Zooming in separates them, and the legend and numbers carry
the meaning.

## What changed

- **Trip planner** (`blog/hotels/hotels-trip.js`, new):
  - From and To, with the register's towns as suggestions (a gazetteer built from
    hotel coordinates). Other place names go to OpenStreetMap Nominatim. A locate
    button starts from the device position.
  - **Green (free) hotels only.** One OSRM `table` request gives real drive time and
    distance from the start to each candidate and from the destination to it.
  - **Best match:** the green hotel closest by road to the destination (within
    30 km). If there is none, the page says so and names the closest.
  - **Overnight stops on the way:** only drives of 2.5 h or more; only from 40% of the
    drive onwards; only when the detour (start→hotel + hotel→destination − direct)
    is 20 min or less. Each shows the time and km from the start, the detour, and the
    time left. These rules are why Kristinehamn is never offered for Örebro → Malmö.
  - From only gives the nearest green hotels by road.
  - The road line for the map is fetched a second after the table, to respect OSRM's
    one-request-a-second demo policy.
  - If routing fails, the page falls back to straight-line distance and says so.
  - `?from=&to=` makes a trip shareable and plans it on load. "My location" is never
    written to the URL.
  - Thresholds are the named constants at the top of the file.
  - Örebro → Malmö today: 503 km, 5 h 52 min. Best match is Scandic Segevång (4 km,
    6 min from Malmö). Stops: Scandic Värnamo (3 h 29 min / 282 km in, +11 min,
    2 h 33 min left) and Scandic Helsingborg Nord (+8 min, 50 min left).
- **Feed posts** (`tools/build-hotels.py`): flat feed, country → city → hotel order.
  - **Header:** a verdict avatar (a "P" circle in the category colour) with the
    hotel name, the verdict in words, and city and country.
  - **Caption:** the parking summary, clamped to two lines.
  - **Fact chips** from the record: free area, spaces, payment, receipt,
    registration, and price paid.
  - **Action bar:** Notes (count), Map, Website, Share.
  - **Notes thread:** the record's own content, laid out as comments: owner's
    report, price, register notes, and sources with the check date and links. Nothing
    is invented: no ratings, people or visitor comments.
  - A planned trip moves its picks to the top of the feed and puts a green
    "1 · 4 km · 6 min from Malmö" line on each.
- **Organise:** search, and a Filters button (Country, Chain, Receipt and Reset, with
  a count of active filters). Chips Free, Easy, Avoid and All show live counts. Saved
  hotels (bookmark on each post, kept in `localStorage` key `nj-hotel-saved`) appear
  as a Saved chip. The colour definitions sit in a "What the colours mean"
  disclosure.
- **Map** (`hotels-map.js`, `css/hotels-map.css`):
  - Round "P" pins: Avoid pins small and behind.
  - A legend: Free, Avoid, You.
  - For a trip: the road as a line, A and B, and the picks numbered as in the trip
    card.
  - Short popups: name, place, verdict, the trip line, "Open the post" (which opens
    its notes).
  - Icon controls: locate, fit, clear.
- The method text moved into a collapsed "How the register works"; it now also
  explains the planner. The comparison table and the CSV link are unchanged inside
  their disclosure.
- Asset versions: `hotels.css?v=8`, `hotels-map.css?v=3`, `hotels.js?v=6`,
  `hotels-map.js?v=6`, `hotels-trip.js?v=1`.

## Country tags — 27 October 2026, follow-up

The owner: "It should be clear with a tag or colour coding which country a post belongs
to." Colour alone would collide with the parking colours, so each post carries its
country's flag (inline SVG Nordic cross, `flag()` in `tools/build-hotels.py`) with the
code (SE, DK, NO, FI) as a tag in the header. The toolbar has a flag row (Denmark,
Finland, Norway, Sweden) with live counts that follow the parking choice. Pressing a
tag, on a post or in the row, filters to that country; pressing it again, or Reset,
clears it. On phones the post's tag wraps under the name so long names keep two
lines at most. Assets `hotels.css?v=9`, `hotels.js?v=7`. Browser checks `flags.cjs`
(session scratch): **19/19**, and the earlier 46 still pass. **Published to main on
the owner's word ("Yes") as
[`b52c3a72`](https://github.com/nj22az/nj22az.github.io/commit/b52c3a722104eab119ba4bc7249b5467512a35c3)**
(main merged in first; it had only Johansson Town changes, no conflicts).
[Pages run 40457133999](https://github.com/nj22az/nj22az.github.io/actions/runs/40457133999)
succeeded; 8/8 live hotel files match the commit and both harnesses pass live.

## External services and privacy

- OSRM demo server (`router.project-osrm.org`, CORS `*`, one request per second) and
  Nominatim (`nominatim.openstreetmap.org`). Both are called only when a trip is
  planned. The page says, beside the planner, that places are sent to OpenStreetMap
  routing and not saved.
- If heavy use is expected, move to a hosted router or the site's own worker.

## Checks run (27 October 2026)

- `python3 tools/build-hotels.py --check`: PASS (128). `python3 tools/build-hotels.test.py`:
  **17/17**. One assertion was rewritten for the new markup:
  `test_feed_preserves_unknown_registration_and_paid_garage` now checks the
  "Registration not stated" chip, that "No registration needed" is absent, and that
  the full notes are in the thread. Its purpose is unchanged.
- `node tools/hotel-theme.test.cjs`, `node tools/blog-feed.test.cjs`: PASS.
- Chromium harness, session scratch `feed.cjs`, not committed: **46/46**.
  - **Feed:** default free list and counts; thread closed then opened with its
    sources; Save, the Saved chip and its filter, kept after reload; Filters badge
    and Reset; Kista search (2 hotels).
  - **Örebro → Malmö:** total, best match Segevång, no backwards stops (no
    Kristinehamn, Karlstad or Örebro Väst), stop line with time, detour and time
    left; feed reordered with trip lines; deep link; A/B, numbered picks and route
    line on the map.
  - **Other trip cases:** Clear removes everything and the query; From only gives
    the nearest; an unknown place gives a message.
  - **Routing failure:** with OSRM aborted, straight-line wording and still a best
    pick.
  - **Phone:** a deep link plans on load; the map sits behind Feed/Map at full size
    with the route; Show on map opens a popup carrying the trip line; "Open the post"
    opens its notes; the action bar fits one row.
  - **Overflow and fallback:** no horizontal overflow at 320, 390, 834 and 1440 px;
    with JavaScript off, all 128 posts and their notes are readable and the planner
    is hidden; no console errors.
- **Limit:** this sandbox's Chromium could not fetch OSRM directly. Curl through the
  same proxy gets HTTP 200 with `access-control-allow-origin: *`. The harness relays
  OSRM through Playwright's own network stack (`route.fetch`), so the responses are
  real. Not tested: Safari, physical phones, real GPS, or a direct browser-to-OSRM
  call from a real device.

## Next

1. Published and verified. Still outstanding: one trip from a real phone, which is
   the first direct browser-to-OSRM call.
2. Possible later: visitor comments (needs a backend and moderation; none was
   built); Easy (yellow) hotels as a fallback when no green fits; a "leave at" time.
