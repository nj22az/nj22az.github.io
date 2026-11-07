# Hotel-chain filter and fixed design — 25 October 2026

## Delivery state

**Published to main as `7a8adf680a17fac7bef79f334a3b5198818e6fff`.**
[Pages deployment 40161562449](https://github.com/nj22az/nj22az.github.io/actions/runs/40161562449)
completed successfully for the exact implementation commit. Public HTML, hotel CSS,
hotel filter script, shared navigation and theme bootstrap all match the tested bytes.
Continue from the [completed coordinate/feed delivery](HANDOVER-MAP-FEED-2026-10-25.md).

## Changes

- Hotel-chain selector: Scandic (**27**, of which **26** have a free option),
  Thon Hotels (**3**) and Other hotels (**2**). Groups use the existing verified
  property identities; Other is not an independent-ownership claim.
- Chain combines with country, search, parking and receipt filters, keeping the
  comparison table, hotel feed and actual Leaflet markers in agreement. Reset clears it.
- Fixed note-inspired design: neutral text, white cards, restrained dividers and
  labelled icons. [Design decision and references](DESIGN.md) compare note,
  Hoshino Resorts and MUJI from `kzhrknt/awesome-design-md-jp`.
- HTML declares a neutral Clarity base plus hotel-specific note tokens. A scoped
  lock is respected by both `theme-bootstrap.js` and `shared.js`; the appearance
  picker is hidden for this section. Saved homepage preferences are not overwritten.
  Homepage randomisation and ordinary Blog inheritance remain unchanged.
- No hotel data, parking evidence, coordinates or CSV values changed. Existing
  green/yellow/red parking meanings and blue user-location marker remain intact.

## Verification

- Hotel builder/data tests: **12/12 pass**; generated HTML is current.
- `node tools/hotel-theme.test.cjs`: lock works for all 11 saved themes and empty
  storage, cannot be overridden through `remember`, does not consume randomness
  or overwrite preferences. Homepage randomisation and Blog inheritance pass.
- JavaScript syntax checks for bootstrap, shared navigation and hotel filters pass.
- Existing `node tools/blog-feed.test.cjs` regression passes.
- Chromium harness: **29 interaction/layout checks pass**, including chain/country/search
  intersections, 26 free Scandics versus all 27, Thon/Other selection and reset;
  fixed design with saved Popwave preference, hidden appearance selector and preserved
  homepage preference; actual Leaflet marker synchronisation and simulated location.
- **9 map/location degradation checks pass**: null point, missing Leaflet,
  denied permission and clear during a pending location request.
- No horizontal overflow at **1440, 834, 390 or 320 px** with shared navigation/styles.
  Desktop visual review completed. Tests use local mock map tiles, no remote fonts
  and simulated GPS; physical Safari/iPad/phone/GPS acceptance is not claimed.

## Next action

Publication is verified. Future hotel additions still require property-level parking
confirmation; chain filtering does not relax that rule.

## Follow-up: Finnish hotel research

The owner then requested verified Finnish free-parking research.
[Eight additional properties](FINLAND-PARKING-RESEARCH-2026-10-25.md) were confirmed
against their own sites: four Scandics, two Sokos properties, Kauppi and Kajanus.
Rosendahl and Eden Nokia were excluded because their official outdoor tariffs are paid.
The research shortlist has not been imported into hotel data/CSV/map. Registration
remains unknown where the property does not specify it; full identity/address/map
verification is the next concrete prerequisite for a later import.
