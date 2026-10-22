# Save-consolidation regression check — 22 October 2026

## Scope and verified state

The owner requested merging PR #368, then the next outstanding handover fix.
Read the root instructions, World instructions, current handover index and its
21–22 October World and frozen-audit notes. The 21 October morning handoff lists
`consolidation.test.mjs` among the failing systems checks; the afternoon handoff
retains those groups as issue 10.

PR #368 is merged to main as `67856af51864165014f12299966065411b3eb381`, after
its GitHub guard passed. That commit is this work's base. No other open PR was
merged or changed. The selected save test still failed on that base because it
expected retired Reiko's saved location to survive the approved cast migration.

- Branch: `codex/consolidation-save-guard`.
- PR: [#369](https://github.com/nj22az/nj22az.github.io/pull/369).
- Implementation commit: `0ac026969b1e7643933403c2a624b81661d5b8e6`.
- State: implemented and locally verified; open, not merged, deployed or released.

## Fix and acceptance

Corrected the obsolete expectation in `tests/consolidation.test.mjs`. The real
`readSave` path must merge old business visits, preserve inventory, quest/escort
progress and inspected content IDs, retain live Thao's location, move old Kenji's
record to Chin and drop retired Reiko. It must leave the original stored save
untouched and load a saved migration identically the second time.

Removed unused scene-building helpers and imports left in that test file. Added
the repaired test to `tests/ci-guard.txt`, taking the guard from 65 to 66 files.
No migration logic, production source, generated runtime, graphics, geometry or
existing player saves were modified. No runtime rebuild is needed.

## Checks actually run

- Before repair: the consolidation test failed at Reiko's location expectation;
  the seven related cast-migration checks passed.
- After repair: `node --test tests/consolidation.test.mjs tests/cast-migration.test.mjs`:
  **8 passed, 0 failed**.
- Three temporary result mutations were rejected: lost inventory, lost live Thao,
  and restored retired Reiko. Temporary files were removed.
- `NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs`:
  **350 passed, 0 failed; 66 files; 188 seconds**. The checked tree includes the
  frozen-audit repair now merged through #368.
- `git diff --check` and local handover Markdown links: passed.

No screenshots, physical-device acceptance, installed Linux acceptance or new
release are claimed. Other outstanding test groups were not recounted.

## Sign-off and next action

**Signed off by Codex — 2026-10-22T22:30:07+02:00 (Europe/Copenhagen): implementation and local
verification complete.** GitHub checks for #369 were still running when recorded;
no remote pass is claimed. The subsequent handover commit changes documentation only.

Next: inspect GitHub checks, then merge #369 only on the owner's instruction.
Keep the remaining afternoon-handoff issues open; two formerly failing files
have now been repaired across #368 and #369.
