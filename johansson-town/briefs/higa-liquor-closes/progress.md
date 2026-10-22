# Progress: Higa Liquor closes into Sakura

## Task
See `sources/task.md`. The owner, 22 October 2026: "close Higa Liquor. Sakura sells and supplies all alcohol, Kōji's round
becomes Sakura Trading's, and the building stands shut with a notice on it." Done as its own stacked PR on
`claude/clever-ride-qdpo8s-higa-liquor`, on top of the Nhung doctor PR (#362), merged only on the owner's word and after
#362 (the owner: "Own stacked PR").

## Outputs
- The change on `claude/clever-ride-qdpo8s-higa-liquor` (nj22az.github.io), its PR based on `claude/clever-ride-qdpo8s`
  (see HANDOVER.md for its number and state).
- The owner's decision: `johansson-town/AGENTS.md`, "Owner's decision — 22 October 2026: Higa Liquor closes into
  Sakura"; root CLAUDE.md's trade line.
- Photographs of the shut front, before and after: sent to the owner in the session, not committed.

## Completed
- `commerce/higa-liquor.js`: the hours, the 留守 card, the counter's goods, the keeper and the round are gone; what is
  left is the closing notice (`HIGA_NOTICE`), the family kusu and the yuntaku bench (no longer tied to the shop's hours).
- `commerce/trade-round.js` (new): Sakura Trading's round, Kōji's on his weeks ashore, Tuesdays and Fridays from 10:30:
  loading at the depot in the Quay Warehouse (a world point, the canonical day's `warehouse`), Minato, Sato Ramen, the
  ferry ramp for the Coral Bay Bar, Mr Fujita's shed, the empties to the crate yard; its delivery book is read in
  Sakura's back office ("Read the drink round's book").
- Merchandising: one supplier, Sakura, with `alcohol` on its record and `alcohol` lines on the accounts of Minato, Sato
  Ramen, the Coral Bay Bar and Mr Fujita's shed (a new account: the Higas' six o'clock van is gone, the round leaves his
  crates); `SOURCED_FROM` is empty; products.json's beer is `supplier: "sakura"`; `studio/rules.js` now asks that
  alcohol be Sakura's; `tools/studio/references.mjs` reads the accounts' `alcohol` lines too, so a retire of the beer
  still sees the bars that order it.
- Sakura's till sells the bottles the Higas sold (`konbini.js` `SAKURA_BOTTLES`, at the Higas' prices); the cans stay in
  the cold cabinet.
- Economy (`economy/town-economy.js`, `goods.js`): the Higa business is gone; the bars pay Sakura's `barTrade` for drink;
  Sakura's counter sells the drink the Higas sold; Sakura keeps more drink in its stock room (8 kegs, 14 of the rest).
- People: Grandmother Higa keeps only the bath (bandai 10–12 and 13–17); Yui minds no counter on Saturdays; Kōji's
  purpose and role; `shop-days.js` (the round, the bench, the laundry); `canonical-day.js`; the place `higa-liquor` is
  closed in `cast.js` PLACES; the directory calls her the bathhouse owner.
- The shut front (`higa-liquor-dressing.js`, `quarters.js`): the shutter down and the doors shut at every hour, the
  lights off, nothing on the clock; the notice on the shutter's face (the lettering sheet, 6 mm in front of the steel),
  read from the street ("Read the notice on the shutter"); the delivery book and kusu prompts are gone (they are behind
  the shutter); the bench's prompt says the bottles come from Sakura. No new geometry.
- Texts that named the old trade: Sakura's paperwork (the Higa invoice gone, as Front-Row's went), the small office's
  cork-board note and calendar (the round's Tuesdays and Fridays), the bath's mirror advert, Mr Fujita's shed and day,
  the quay crates, the harbour boats, the island guide, the airport, the storefront's empties, the Minato back bar, the
  Johansson house bar, the Sakura office, the crate yard's lot, the feed's place, the wardrobe, the garden round, the
  guide (Grandmother Higa's article) and the cast roster, the studio's product findings and `STUDIO-MCP.md`.
- Tests that stated the old arrangement, rewritten to state the new one (none weakened): `higa-liquor-laundry` (shut for
  good, nobody keeps it, the round is Sakura Trading's, the shut front at every hour and the notice on the shutter),
  `products-move`, `sakura-merchandising`, `paperwork`, `sakura-small-office`, `town-economy`, `izakaya-backbar`,
  `okinawa-quarters`, `studio-apply` (the beer cannot go back to the Higas), `studio-mcp` (the beer's references show
  Sato Ramen ordering it from Sakura), `no-z-fighting` (the shut front with its notice).

## Decisions
- Mr Fujita's beer: the round leaves two crates in his shed on Tuesdays and Fridays and takes the empties; at six he
  stands the night's empties in the crate by the door. His three to six bottles an evening are unchanged.
- The crate yard across Main Street is rented by Sakura Trading from Grandmother Higa; its painted sign (HIGA LIQUOR ·
  EMPTIES) stays, as the shop's sign does: no new geometry.
- The Minato back bar's measured plan (`art/izakaya/compact/plan.json`, `compact-report.json`,
  `tools/blender/build-minato-compact.py`) keeps "Higa Liquor's fourteen fictional brands" as the brands' origin: the
  plan is hash-pinned by the building survey and the GLB built from it. What the World says (`izakaya-walnut.js`) is
  that Sakura Trading supplies them.
- The dated planning documents in `johansson-town/docs/` (MASTER-PLAN, CAST-CONSOLIDATION and the like) are records of
  their day and are left; AGENTS.md's decision supersedes them.
- On Saturdays, when Sakura is shut, there is no bottle to take away; the bars still pour. The bench is sat on as on
  other days.

## Open issues
- The walking Kōji goes to the depot at 10:30 and to the crate yard at 11:30; between them his body keeps to the ice
  plant, as it did on the Higas' round (the residents' planner gives the drops no point; the canonical day, the stories
  and the tests have every stop).
- Feed backdrops for `higa-liquor` (the shut front) are still to be captured with `render-feed-backdrops.mjs`, as they
  were before this change.

## Next action
See checks.md for the evaluator's results. Then: the owner looks at the before/after photographs and merges the doctor PR
(#362) first and this one after it, each on their word.
