# Handover: Johansson Mart, Kitahama: the corner shop, drawn (27 October 2026)

**State: drawn and specified on branch `claude/kitahama-corner-shop`; not built into World.** Waiting for the owner's two
Meshy models (exterior and interior), made to the brief in `docs/qa/kitahama-shop/README.md`.

## The owner's decisions (27 October 2026)

- A smaller konbini than Sakura, in the feel of a small 1990s chain shop, but our own: Johansson Mart, in Johansson
  Marine's house green (the Acme rule), no game's or real chain's name, colours, logo or layout.
- On the northern part of the island: the entrance to Kitahama, the east end of the north block, at the corner of the
  cross lane and the approach.
- Kept by a resident we already have: Grandmother Higa ("maybe bring grandma higa as the attendant"), weekday evenings
  17:30–21:00 and Saturdays 9:00–21:00, when Sakura is shut and she is free of the bath; shut on Sundays.
- "Draw the shop in cad and I'll drop a Meshy for you after, exterior and interior; you need to describe size and all
  what we need."

## Where

| File | What |
| --- | --- |
| `src/world/okinawa/kitahama-shop.js` | the design data: building, openings, partitions, fittings and outside items, each with its why; livery; her week; delivery; stock; site changes; open items |
| `docs/qa/kitahama-shop/build_shop_cad.py` | draws KS-001 rev A from the data (needs reportlab, ezdxf; fonts DejaVu Sans and IPA Gothic, embedded) |
| `docs/qa/kitahama-shop/Kitahama-Shop-KS-001-Rev-A.pdf` / `.dxf` / `checks.json` | four A3 sheets, the plan at 1:1 mm, 23/23 checks |
| `docs/qa/kitahama-shop/README.md` | the Meshy brief: export frame, sizes, colours, every fitting placed, prompts |

## Found while drawing (fixed in the data)

- The keeper's aisle behind the till was 500 mm; the counter and the back shelf were moved to give 700 mm.
- The stock shelving stood across the delivery door; it now runs along the stockroom's west wall, and a check keeps
  900 mm clear inside each door and the staff door's swing clear.
- The gōyā curtain, shortened for the shop, would have run into the garden shed; it now stops at x 29.8.

## Next

1. The owner's Meshy GLBs into `art/` (or wherever the asset catalogue takes them), checked against the README's sizes.
2. Build it: place the models at `WORLD` (x 35.6, z 63.2), colliders from the data, the doors, the lights; then work
   through `SITE_CHANGES` (the parking, the beds, the hedge, the sign), Grandmother Higa's day in `people/cast.js`,
   the van's stop, the storyteller's place. Check it in the live game before publishing.
