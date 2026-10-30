# Kissa Higa and fish-market publication — 30 October 2026

The owner said **“Push”** after being told that the reviewed café, fish-market rework and co-op sales counter were
pushed on their branches but were not on `main` or live. This is the publication authority for these changes.
It supersedes the earlier “awaiting the owner's word” status for this scope; the remaining design decisions below are
not silently resolved by publication.

## Candidate and scope

- Publication branch: `codex/kissa-higa-publication`, from `main` at
  `37befc31db79e09ac2a1507663f80d6f0cc65ee3`.
- Reviewed branch: `codex/kissa-higa-review` at `c95ad9dd353e1ece88cd20781b9fe4a615ae81b6`.
  Its [draft PR #404](https://github.com/nj22az/nj22az.github.io/pull/404) keeps its original target,
  `claude/great-sagan-mvc9bb`; publication uses a separate PR into `main`.
- Fish market and sales counter: `58e6117004e17b87f05595560bb4d9302892b443`.
- Café build: `89d99d70`; review fixes: `75a8e72bdc2e4324f724de4e00843ad01ed8db3e`;
  reviewed runtime, captures and evidence: `50fee3d3748101a1d1591f5a0581dd90f112d370`.
- The main merge preserves the newer Pocket Camera work. The sole conflict was the handover index: resolved by keeping
  main's current entries and adding the café/market entries. `camera/` is byte-identical to current main.
- `johansson-town/src`, tests and assets are byte-identical to the reviewed branch. The runtime is rebuilt from that
  same World source, keeping the previous published main chunks for clients still finishing an old load.
- This publishes the fish market's co-op counter and its existing displays/dressing, plus Kissa Higa. It does not invent
  or change other town stalls, and does not create a Linux release or sync Studio.

## Checks and evidence

- Prior review's hosted [World guard run 41053209821](https://github.com/nj22az/nj22az.github.io/actions/runs/41053209821):
  **passed** on `c95ad9dd` (re-checked in this publication session).
- `npm run build:runtime`: **passed; `boot-DfkZ-ZpG.js`, source SHA-256 `116a61c368eaeb4b9d57762f1aed26e1c5581704f734b27057861acbe8610d3a`; 60 runtime files including the previous published main chunks**.
- `NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs`: **482/482, 91 files, all green in 261 s** on the combined candidate.
- Fish-market and runtime-package focused checks: **13/13 passed after the final retention rebuild**.
- All nine existing `docs/qa/fish-market/after/*.jpg` photographs were opened at original 900 × 600 resolution in this
  publication session. These are source-scene photographs, not a new running-game simulation. They read as the revised
  shed, sales counter with fish displayed on ice, wash corner, scale/bell and quay dressing.
- The prior café evidence remains applicable: all 21 live, ten static and eight backdrop views plus two thumbnails were
  inspected in the review. Monday day 4, Wednesday day 6 and rota-week-1 Monday day 11 passed the required 08:20/08:35
  seat checks and the occupied closing/release case, with no page errors. This publication merge does not change those
  source or asset bytes. The café live tool has not been rerun in this publication session.
- The guard followed the first combined build. The final rebuild changes only retention of the old main chunks;
  current source and bundle bytes are unchanged, and the 13 focused fish/runtime checks passed afterwards.
- Local build/guard/focused logs: [`docs/qa/kissa-higa/publication/`](../docs/qa/kissa-higa/publication/).
- Authored-file whitespace check (`git diff origin/main HEAD --check -- . ':!johansson-town/runtime'`): clean.
  Existing generated shader-string whitespace is preserved in the runtime.

**Publication PR, merge commit, hosted checks and live delivery:** pending. No publication success is claimed until
those are verified and recorded in the follow-up below.

## Remaining limits and owner decisions

Seat heights are unchanged. Cartoon shoes still hang about 0.21–0.25 m on chair-height seats across town; that proportion
is the owner's decision. The weekday lunch half of Grandmother Higa's garden round remains unbuilt. Yui's counter
breakfast remains the original builder's choice, which the owner may reverse. Public holidays have no separate layer;
the money model remains closed. The fish counter's board is fixed, the damp band is not animated with washing, and
Kōji's dialogue/storyteller integration remains as recorded in the [fish-market handover](HANDOFF-FISH-MARKET-2026-10-30.md).

No Meshy calls, new credit spend, new model or new scene prop asset in this review/publication. Existing approved models
and the requested backdrop/evidence renders are included. No phone, iPad, physical device, touch control or hardware
GPU has been checked in the cloud session. No installed Linux acceptance or packaging was run locally; hosted checks
are reported separately when available. Studio is not synced.
