# Progress · 6r the plant

## Task
6r-1: the pipes built in 3D from the piping diagrams (see sources/task.md).

## Outputs
- `src/world/ferry-pipe-routes.js` (lanes, router, segments and bends), the anchors and routed runs in `src/world/ferry-interior.js` (`FERRY_INTERIOR.pipes`, `.anchors`), `tests/ferry-pipes.test.mjs`, sheets 5 and 7 with the runs.

## Completed
- Audit (2026-10-13): 37 hand-painted runs, none from data; no machinery state. Baseline tris 66 170 (budget 70 000).

## Completed (6r-1)
- 151 anchors, 172 routes; the hand-painted runs removed; the service tank lowered to 1.55 m (0.75 m wide) so the lanes pass over it; the bilge wells moved to the aisle's aft end (the ladder foot was over one); the hydrophore's 300 L pressure tank built in the aux room; the priming pumps built at the engines' forward feet; overboard valves, tank-top stubs, penetrations drawn.

## Decisions
- Anchors live beside the machines in ferry-interior.js (the coordinates are known there); the router is its own module.
- Out of scope for 6r-1: pipes beyond the machinery spaces; they end at a penetration (deckhead, bulkhead, tank top).
- Low lanes (bilge, ballast, lubricating oil) run under the floor plates, as they do on a ship: invisible but routed and tested; a machine's own circuit (jacket water, lubricating oil on an engine) hugs the machine, the router trying both orders round it.
- Cross-ship runs follow the forward bulkhead of each room, never the aft one (the switchboard stands there).
- The budget: 95 442 triangles in one merged mesh; raised to 100 000.

## Reviewed (2026-10-13)
- A separate reviewer (general-purpose agent, given the output paths, checks.md and the sources) found: suctions run straight across the walkways; compartment crossings stacked on one line and through the aux room's bulkhead; the storeP→vP loop; no penetration pieces or overboard valves drawn; collinear bars drawn twice. All fixed (low lanes for suctions, crossings by compartment and staggered, the near case, rings and stems, spans merged) and the walkway and bulkhead checks added to `tests/ferry-pipes.test.mjs`.
- `src/world/ferry-plant.js` (6r-2's core) written and tested (5 tests); not wired into the game yet.

## Open issues
- 6r-2 integration: the console's dials and alarm matrix, the engine sound and the crew's routine still read the old fixed state; prompts to start, stop, change over and isolate not yet offered at the machines.
- Lines to other decks (9) end at a penetration; drawn on their own decks later.

## Next action
Publish 6r-1 with ferry-plant.js (suite, runtime rebuild, merge the branch and main, push, check the run); then 6r-2 integration: `createPlant` driving the console (dials, alarms), the machine prompts, the engine sound and the crew's routine; then 6r-3 overhaul.
