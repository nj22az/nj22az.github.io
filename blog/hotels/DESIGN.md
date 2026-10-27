# Hotels & Parking design

## Fixed direction

The owner requested an icon-led hotel feed on 25 October 2026, followed by a fixed
design that does not inherit the homepage's random appearance.

Selected reference: **note**, as analysed in
[awesome-design-md-jp](https://github.com/kzhrknt/awesome-design-md-jp/blob/main/design-md/note/DESIGN.md),
reviewed at blob `3a4772635e0546c378e98a93c4976d1e89e22522`.
This is a third-party design analysis, not official note documentation.

| Reference reviewed | Suitability for this page |
| --- | --- |
| note | Best fit: readable timeline, clear card hierarchy, neutral surfaces and restrained icons. |
| Hoshino Resorts | Strong hospitality photography/editorial reference, but the current register is principally verified parking information. |
| MUJI | Calm and readable, but its product-catalogue structure is less suited to the requested feed. |

## Application

- Near-black text `#08131a`, white cards, secondary background `#f5f8fa`, soft dividers.
- Helvetica Neue / Arial for the English and Swedish content. Preserve readable
  line spacing and labelled controls. Do not apply Japanese-specific text spacing.
- Icons accompany words. Green/yellow/red continue to describe parking; blue
  remains the visitor's location. Brand decoration must not change those meanings.
- Cards retain source dates, registration conditions, paid alternatives and
  expandable full notes. No invented ratings, stays, photographs or social activity.
- Hotel pages declare `data-theme-lock="clarity"` as their neutral shared base and
  `data-hotel-design="note"` for the section's own scoped tokens. Both initial
  bootstrap and shared navigation respect the lock. The appearance selector is
  hidden here, and hotel visits do not overwrite the saved theme used elsewhere.
- The page remains fixed when reloaded, entered directly or reached from a
  differently themed homepage. Homepage randomisation is retained.

## Chain filter

Groups derive from the already verified property names: `Scandic`, `Thon Hotels`,
and `Other hotels`. The last is a residual group, not a claim of independent
ownership. Do not offer absent chains or silently infer additional affiliations.
Country, chain, search, parking and receipt filters intersect and drive the same
table rows, feed cards and map markers. Reset returns to all chains/free parking.

## Finder layout — 26 October 2026

The owner found the register hard to search. Layout rules since then
([handover](HANDOVER-FINDER-CLARITY-2026-10-26.md)):

- Cards are grouped by country and sorted by city, then hotel (`place_key`). Never
  sort by recording date again.
- Parking is chosen with labelled radio chips that show live counts. The chips
  are also the colour legend. Do not add a separate legend.
- A card shows city, name, street, verdict, parking summary and one facts row.
  Everything else stays in its notes. No icon that is the same on every card.
- Below 1000 px the list comes first, with a floating List/Map switch. Above
  1000 px the list and the sticky map sit side by side.
