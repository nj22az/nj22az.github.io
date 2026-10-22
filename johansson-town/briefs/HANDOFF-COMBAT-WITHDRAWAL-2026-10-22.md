# Combat withdrawal — 22 October 2026

## Decision, scope and current state

The owner's 22 October instruction withdraws all current fighting from web and Linux. Read root CLAUDE.md, AGENTS.md, HANDOVER.md, johansson-town/AGENTS.md and the recovery plan in [PR #349](https://github.com/nj22az/nj22az.github.io/pull/349). This implementation follows P0 only. Sakura, ground, banners, character design and any future fighting prototype are separate work.

Branch: `codex/withdraw-combat`, based on main `a0fb347ced9250b2e5a6210ba068bf595a7ca310`. Implementation candidate only: **not merged, deployed or released**. [Draft PR #365](https://github.com/nj22az/nj22az.github.io/pull/365), initial implementation commit `13e54e09233a3add4753f1e9892bd06375cfc3ec`. Final acceptance is pending; workflow links/results will be recorded below. The owner must approve merging under the existing review process.

## Implementation

- Removed festival bout/tournament/spectator/quarrel instantiation, nearby offers, event listener, menu tile, public audit API and frame/input interception from game.js. Deleted both combat festival modules, the dungeon simulation/generator and first-person fists/weapons module. No dormant replacement is shipped.
- Removed Linux insult-to-fight escalation and its callback. The social choice is now “Clear the air…”; apologies, warnings and a peaceful end to hurtful conversations remain. Old hostility records are discarded when restoring version-1 resident life; version-2 saves retain peaceful cooldowns. Character selection, owned beds and identity checkpoints remain.
- Withdrew the combat-dependent cave descent, retaining the mouth, scenery and reading interactions. Its notice says the descent is closed. No new peaceful dungeon or future fighting system is invented.
- Save migration runs through readSave for current, legacy, previous-copy and imported slots. Retires combat progress and resume fields without clawing back money or possessions, or changing ordinary relationships/travel. Historical progress alone does not relocate the player. Shipped bouts were in-memory, never persisted as active bouts; defensive active/resume and cave/arena-location migration also handles imported/audit fixtures. Active encounter saves (including arena-resume records) return only the current journey location to town, preserving travel milestones/tickets/projects, and recover to the existing fish-auction opening (19.8, -40), with normal camera/input startup, and clear affected identity checkpoints. The transient recovery flag is consumed on entry, preventing repeated relocation.
- Rebuilt runtime from the changed source. Removed the previous compiled graph for this withdrawal, so the old executable combat graph is not retained as a compatibility payload. Updated index, manifest and service-worker cache version. Studio/story costumes and gestures remain shared artistic assets; they have no combat simulation or gameplay launcher.
- Updated Linux guide/control text and removed combat-only HUD rules. The Linux packager excludes historical World docs/QA output; combat-only source modules are deleted and absent from the packaged site. Ferry decks, ordinary festivals, conversation and resident/ferry simulation are preserved.

## Verification actually performed

- World CI guard: **352 tests, 65 files, all green**, 178 seconds. Includes zero-baseline ground, enterable-sites/safe spawns, z-fighting, seating, dining and ferry timetable checks. Node heap 6144 MiB.
- Desktop tests: **37 passed**. Character identities, owned beds, switching, saves, controller recovery/remapping, update and peaceful insult policy remain covered.
- Withdrawal/runtime focused suites: **9 passed**. Every adult/child/family pair, repeated/restored insults, active spectator/tournament/cave/arena save fixtures, idempotence and property preservation; no retired source modules or public launcher; delivered compiled chunks scanned for retired combat handlers/UI/rewards.
- Additional actual-game controller plus Studio costume/gesture suites: **8 passed** (including the five withdrawal policy tests). Movement/look/settings resume in the real game with a stub renderer; this is not graphical acceptance.
- Browser runtime rebuilt successfully; runtime-package tests pass. git diff --check passes.
- Local Linux candidate packaged successfully on retry (the first tar attempt reported changing directory metadata). No tag or published asset was changed. Candidate uses the existing source version 0.2.16 strictly for local validation, not release; never upload it over that release.
- Local graphical acceptance attempted but **not passed**: normal Chromium fails at Unix-socket creation under this session's restrictions; the single-process headless fallback stalled loading. Native Electron and Xvfb were also attempted, with socket/display restrictions. No local screenshots or physical-device acceptance are claimed. Use the PR's ordinary Ubuntu CI for full console/native/package verification.

## Acceptance changes and next steps

The existing full console harness keeps its layout, all-resident, bed/wake, conversation, controller, save-reload and web-isolation checks. Its former fourth-insult fight now must end peacefully, with no combat UI or reward. It also tests old keyboard/controller inputs and the retired festival event. Retained Linux encounter and web cave-save fixtures verify recovery through the running clients. Native smoke replaces its four fights/tournament with absence checks at the former locations/date, while retaining startup, pause/HUD and actual disk snapshots. The offline browser smoke likewise rejects retired launchers, uses the installed Playwright and actual candidate version, and now runs explicitly in both Linux acceptance and release workflows. Broad acceptance is not disabled.

1. Complete PR review and the World/Linux CI gates. Record exact commit, PR, run links and results here. Correct any actual failures; do not weaken assertions.
2. Merge only on the owner's instruction, once checks pass. Recheck main for concurrent changes and rebuild the combined runtime last.
3. After approval, integrate into `codex/johansson-world-steam-deck` and assign the next unpublished Linux version. The releases API was checked on 22 October: **0.2.16 is the latest published prerelease**. Do not overwrite its tag or assets. Recheck before selecting 0.2.17 or later; follow HANDOVER-LINUX-JOYSTICK-2026-10-22.md and the release workflow.
4. Run full console/offline/native, controller recovery, disk-save and installer/checksum acceptance against that release tree. Publish a new release, then update the public download/installer pointers through the normal follow-up. Main source alone does not update installed Linux applications.
5. Physical Steam Deck/8BitDo and iPhone Safari remain unverified. Future fighting stays deferred and separate.
