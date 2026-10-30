# Kissa Higa in the shut Higa Liquor — handover, 30 October 2026

Branch `claude/great-sagan-mvc9bb` (nj22az.github.io), on top of the fish-market rework
([its handover](HANDOFF-FISH-MARKET-2026-10-30.md)). **Not on `main`; not published.** Main deploys the site: publish
only on the owner's word. The task folder is [`higa-kissaten/`](higa-kissaten/progress.md) (`progress.md` the map, the
plan, the Meshy audit and what was built; `checks.md`; `sources/task.md` the owner's words).

## The owner's words

- 30 October: "Since the liquor store is closed maybe it can be replaced by one of the buildings maybe the cafe";
  Grandmother Higa to keep it in the mornings.
- "Use my credits on meshy audit where it would make the scene better."
- "I need you to work automatically can you work accordingly to your own recommendations pls audit yourself and decide
  from the audits and proceed."
- "Don't publish to main without my word."

## Commits

| Commit | What |
| --- | --- |
| `dda83ff` | The map of every place that said the shop was shut, the plan, Meshy's costs. |
| `cff7b18` | The Meshy audit: 105 credits, nine props tried, photographed beside code versions in the real shop. |
| `89d99d7` | Kissa Higa built. |
| (this note's commit) | The handover, and photographs re-shot from the final build. |

## What Kissa Higa is

The data is in `src/commerce/kissa-higa.js`; the ruling is in `johansson-town/AGENTS.md`, "Owner's decision — 30 October
2026".

- **Who and when.** 喫茶ひが, kept by Grandmother Higa. Open Monday to Friday, 07:00–09:30.
  - She is at the front from 06:45, and the shutter goes up 06:50–06:54.
  - She is behind the counter until 09:40.
  - Then she is out on the pavement while the shutter comes down (09:44–09:48), and goes up to the bath at 09:50.
  - The weekend has no kissaten: on Saturday she opens Johansson Mart at 08:45.
- **The menu.** The morning set, blend coffee and iced coffee, ¥300 each. **No alcohol**: the drink stays Sakura's.
- **Supplies.** Bread and milk are on Sakura's account, taken at its till at five the afternoon before, because Sakura is
  shut before nine. Beans, eggs and butter come with Sakura Trading's Monday order.
- **The regulars, from their own days.**
  - Yui has her breakfast at the counter before school; it replaces her breakfast at home.
  - Ms Ganaha, before she opens the laundry.
  - Tetsuo, on Monday, Wednesday and Friday.
  - Officer Mori, before he goes to sleep.
  - Ms Uezu, on her weeks off watch.
- **The room.**
  - The counter is the coffee counter. In front of it is a ledge at 0.74 m with three stools at 0.46 m (the izakaya's
    pairing); the ledge stops short of the register.
  - Two siphons, a kettle, the cup shelf, and the family kusu, kept.
  - A table for two with bentwood chairs.
  - The record player and her husband's 45s.
  - A green awning, an A-board, and a paper on the shutter that still sends the drink to Sakura.
- **Meshy models.** The record player, the chairs and the grinder are Meshy models, streamed in near the shop
  (`src/world/okinawa/kissa-higa-props.js`, `assets/models/kissaten/`, 512 px). If one fails to load, a code stand-in takes
  its place. Everything else is drawn in code.
- **The clock.** The front follows the kissaten's clock: shutter, doors, tubes, lamp flames, board and paper. When the
  way in opens or shuts, the neighbours search their routes again (`neighbours.js` `replan`, `game.js` `passagesChanged`).
- **The storyteller.** A morning place, `kissa-higa`; the bench is the evening place `higa-liquor` (both
  `captured:false`).
- **Her guide article** is rewritten.
- **Rules.** Root `CLAUDE.md` and `johansson-town/AGENTS.md` are updated.

## Checks, run in this cloud session

Node 22, swiftshader; no GPU and no physical device.

- **Full CI guard** with CI's heap (`NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs`): **473/473,
  91 files**, after the final change. A first run failed 472/473 on `no-z-fighting`, a test still asserting the shut
  front; it now scans the front open and shut.
- **The new test** `tests/kissa-higa.test.mjs` is in the guard. Six tests that stated the shut shop were updated with
  dated notes; none was weakened.
- **Static photographs:** `node tools/kissa-higa-photos.mjs after` → `docs/qa/kissa-higa/after/`, ten views, looked at.
- **Live game:** `node tools/kissa-higa-live.mjs` → `docs/qa/kissa-higa/live/`, at 07:42 on a Tuesday.
  - Grandmother Higa stands at her place behind the counter.
  - Yui and Ms Ganaha sit on stool-1 and stool-0.
  - The bench baseline was taken at 19:41.
- **Routes:** every route into the room arrives on the neighbours' 0.5 m grid with the doors open (a script run against
  the built town's solids).
- **Meshy:** 105 credits spent (2,753 → 2,648); `art/kissaten/meshy/provenance.json` holds every prompt, task id and
  verdict.

## Known limits, for the owner

- **Cartoon residents' shoes hang 0.21–0.25 m** above the floor on every chair-height seat in town: 0.23 m on the 0.44 m
  benches, 0.25 m on these 0.46 m stools. It comes from the cartoon bodies' short legs. Their feet would only reach the
  floor at a 0.21 m seat. Not changed here: it is a town-wide question.
- Not checked live: Tetsuo, Officer Mori and Ms Uezu walking in (the Tuesday run has no Tetsuo, Mori comes from 08:30,
  Ms Uezu only on her weeks off). Their plans are covered by `kissa-higa.test.mjs`.
- The kissaten opens on public holidays (there is no holiday layer yet).
- The storyteller's backdrops are not captured yet.
- The Linux edition is not rebuilt, and Studio (`jojo`) is not synced.
- The town's money model is closed (22 October), so the kissaten's takings are not in it.
- No Pixar Grandmother Higa: the owner's 24 October plan builds heads from the owner's picture.
- **The independent code review was still running at handover.** Its findings, if any, are not in this commit; the next
  session runs one (below).

## Next

1. The owner reviews the kissaten (and the fish market, also on this branch) from the photographs, and says whether to
   publish.
2. An independent review of `89d99d7`, with any findings fixed (see the Codex prompt below).
3. Capture the storyteller's backdrops (`tools/render-feed-backdrops.mjs`, places `kissa-higa` and `higa-liquor`), then
   set `captured:true`.
4. Phone and real-GPU checks; then publish on the owner's word (merge to `main`, rebuild the runtime, run the CI guard,
   check Pages).

## Prompt for Codex

```text
Continue the Johansson World work on branch claude/great-sagan-mvc9bb in nj22az/nj22az.github.io. Work on a branch of
your own made from it (codex/kissa-higa-review) and open a draft PR into claude/great-sagan-mvc9bb, not into main. Do
not merge or push to main: main deploys the site, and the owner publishes only on their own word.

Read first, in order: HANDOVER.md; AGENTS.md (the handover rules); johansson-town/AGENTS.md (above all "Owner's
decision — 30 October 2026: Kissa Higa in the shut Higa Liquor"); johansson-town/briefs/HANDOFF-KISSA-HIGA-2026-10-30.md;
johansson-town/briefs/higa-kissaten/progress.md and checks.md. The owner's rules in the root CLAUDE.md hold: no glitches,
clipping, floating or unnatural behaviour; nothing random (every item has a who, a why and a where); tests may be updated
for a decided change, never weakened.

Kissa Higa (src/commerce/kissa-higa.js) is built and pushed in commit 89d99d7, with the CI guard at 473/473. Do this:

1. Review 89d99d7 independently (ignore johansson-town/runtime/, index.html, sw.js, resident-guide.js: build output).
   Look for: wrong shop-frame conversions (world x = 9.55 - local z, world z = 8.4 + local x, the frame turned -PI/2);
   yaw signs (stand-points.js yawFacing = atan2(-dx,-dz)); off-by-one minutes in the hours and the shutter (town day 0 is
   a Thursday; the hooks get absolute town minutes); anyone shut inside when the shutter comes down; regulars clashing
   with their other rows in cast.js or sharing a seat; side effects of neighbours.js replan (it resets every non-stair
   neighbour's journey when the way in opens or shuts); items through each other or through walls; colliders that do not
   match what is drawn; rules text (CLAUDE.md, johansson-town/AGENTS.md) that disagrees with the code. Fix what is real,
   each fix with a test where a test can hold it.
2. Check the residents in the running game at 08:35 on a Monday (town day 4) and on a Wednesday (day 6) with
   tools/kissa-higa-live.mjs (change its times or add a run): Officer Mori on stool-2 and Tetsuo before him. On a rota
   week 1 day (town day 11, a Monday), Ms Uezu at chair-1. Look at every photograph at full size before you call it right.
3. Capture the storyteller's backdrops for the places kissa-higa and higa-liquor (src/feed/places.js, captured:false)
   with tools/render-feed-backdrops.mjs, look at them, and set captured:true only if they read.
4. Do not change seat heights for the cartoon residents' hanging feet. The handover measures 0.21–0.25 m on every
   chair-height seat in town; it is the owner's call, so report it.
5. Before you finish: npm run build:runtime (from johansson-town/); NODE_OPTIONS=--max-old-space-size=6144 node
   tools/ci-guard.mjs, all green; update the handover note and HANDOVER.md with what changed, the commits, the checks you
   actually ran and their results, and what is still open. Say plainly what you did not check (no phone, no physical
   device in a cloud session).

Do not spend Meshy credits or add new assets without the owner's word.
```
