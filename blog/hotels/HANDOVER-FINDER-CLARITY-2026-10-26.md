# Hotels & Parking finder clarity — 26 October 2026

## Request and state

The owner: "my hotels database on the blog page needs more clarity it's not so easy to
find the right information." Implemented on branch `claude/peaceful-clarke-fprqk3`
(pushed; see the commit on that branch). **Not merged to main and not published.**
GitHub Pages deploys only from main. Publishing needs the owner's word.

No hotel record, parking fact, category rule, CSV cell or evidence file changed.
This is a presentation change to the generated page, its filter script and its styles.

## What was hard to find (before)

- On a phone, about 1,000 px of filters and map came before the first hotel.
- The feed was ordered by recording date, so a city could not be found by eye.
- Every card repeated the same hotel icon. It said "Registration: see notes;
  requirements may be unstated" and "No parking charge" under a "Free parking" label.
  Each card was about 560 px tall.
- The colour legend and the Parking dropdown said the same thing twice.
- "35 free-parking options" in the header did not match the 34 shown. Best Western
  Odense is free but Avoid for access.

## What changed

- **Order and grouping:** cards are grouped by country (sticky heading with a live
  count), then sorted by city and hotel. The comparison table uses the same order.
  The order is set in `build()` (`place_key`), so a direct `build()` call is ordered too.
- **Parking choice:** the legend and dropdown are replaced by four labelled radio
  chips, each with its own count: Free parking, Easy · one receipt, Avoid, All
  hotels. The counts follow the other filters, so a reader sees what each choice
  would find. Easy and Avoid are defined in one line under the chips.
  Each chip keeps its category colour, and the selected one has a tick and a heavier
  border, so colour is not the only signal. Default and Reset are still Free parking.
- **Cards:** city above the name, then the street, the parking verdict and the parking
  summary. A one-line facts row follows: Payment and Receipt for paid entries,
  Registration where `parkingDetails` exists, Stay paid where recorded, and Checked
  (linked to the source). Full notes, prices, tags and sources are unchanged inside
  the disclosure. The same hotel icon on every card was removed. Unknown values say
  "Not confirmed" or "Not stated by the hotel", never "Not required".
- **Header:** the all-caps eyebrow and the findings box are gone. One line now gives
  the register's size and countries and links to "How the register works". The
  method section still holds every rule.
- **Phones and tablets (≤1000 px):** the list comes first. A floating List/Map switch
  (`aria-pressed`) appears while the results are on screen. Show on map switches to
  the map and opens the hotel. "Read hotel notes" in a popup switches back to the card
  and opens its notes. Returning to the list restores the scroll position. Desktop
  keeps the list beside the sticky map, and the switch never appears there.
- **Result line:** reads "34 hotels with free parking", "16 hotels to avoid" or
  "128 hotels".
- Asset versions bumped: `hotels.css?v=7`, `hotels.js?v=5`, `hotels-map.js?v=5`.

Files: `tools/build-hotels.py`, `blog/hotels/index.html` (generated),
`blog/hotels/hotels.js`, `blog/hotels/hotels-map.js` (a `hotel-view-change` listener
that resizes and refits the map), `css/hotels.css` (feed rules replaced, rules for
removed elements dropped), `tools/build-hotels.test.py` (one assertion; see Checks),
`blog/hotels/DESIGN.md`.

## Skills added at the owner's request

- `.claude/skills/ui-ux-pro-max/` from `nextlevelbuilder/ui-ux-pro-max-skill`
  (MIT, commit `28b3b8de`, v2.15.0). Installed with
  `npx skills add nextlevelbuilder/ui-ux-pro-max-skill --agent claude-code --skill ui-ux-pro-max --copy`.
  Before it was added, the installed files were checked identical to the reviewed
  clone. Its scripts are local Python with no network or subprocess calls.
  Its SKILL.md prefixes paths with `${CLAUDE_PLUGIN_ROOT}`, which is unset in this
  project. Run it from the repo root as `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain ux`.
- `.claude/skills/frontend-design/` from `anthropics/skills` (Apache-2.0, guidance
  only, no scripts).
- `skills-lock.json` (repo root) records both sources and hashes, so
  `npx skills experimental_install` can restore them. Only these two of the
  repositories' skills were installed.

## Checks run (26 October 2026)

- `python3 tools/build-hotels.py --check`: PASS, 128 records, page current.
- `python3 tools/build-hotels.test.py`: **17/17 OK**. One assertion changed:
  `test_feed_preserves_unknown_registration_and_paid_garage` now checks for
  `<dt>Registration</dt><dd>Not stated by the hotel</dd>` and that "Not required" is
  absent. Before, it checked the old wording "requirements may be unstated". Its
  purpose is unchanged: unknown registration stays visibly unknown.
- `node tools/hotel-theme.test.cjs` and `node tools/blog-feed.test.cjs`: PASS.
- Chromium harness (session scratch, not committed), against a local server with real
  Leaflet and OpenStreetMap tiles: **33/33 checks**:
  - default free list and initial chip counts match `hotels.json`;
  - place order matches country → city → name;
  - Sweden counts and the single visible group;
  - Avoid chip, map markers following filters, Göteborg search, empty state with zero
    counts, Reset back to Free;
  - arrow keys move the radio choice, and the focus ring is visible;
  - phone list-first view, floating switch, map shown at full size with every marker;
  - Show on map opens the popup, and "Read hotel notes" returns to the card with notes
    open, clear of the nav;
  - no horizontal overflow at 320, 390, 834 and 1440 px;
  - with JavaScript off, all 128 cards are readable;
  - no console errors.
- Screenshots reviewed: desktop default, desktop Avoid and Jönköping searches, tablet
  834 px, phone list, phone map.
- Not tested: Safari, physical phones, real GPS.

## Next

1. The owner reviews the branch and decides on publishing. To publish, merge
   `claude/peaceful-clarke-fprqk3` into main, then verify the Pages run and the live
   `blog/hotels/index.html`, `css/hotels.css`, `hotels.js` and `hotels-map.js`.
2. Possible follow-up, not built: sort by distance once "Show my location" has a
   position (nearest free-parking hotel first).
