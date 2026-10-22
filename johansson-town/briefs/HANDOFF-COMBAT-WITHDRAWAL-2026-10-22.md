# Combat withdrawal — 22 October 2026

## Status and source

[PR #365](https://github.com/nj22az/nj22az.github.io/pull/365), branch `codex/withdraw-combat`, implements P0 of the owner's [recovery plan, PR #349](https://github.com/nj22az/nj22az.github.io/pull/349). **Owner-approved integration is merged to main as `4a52d5d2161f9691b8f3e808ba959389f463e578`. Current-source World checks passed; Linux 0.2.17 release acceptance remains in progress in PR #370. No new Linux release is claimed yet.**

Verified implementation/harness head: `e5b0ceabf6c58a1db68b0ab58f4bb5eaadda5810`, on main `a0fb347ced9250b2e5a6210ba068bf595a7ca310`. Initial implementation: `13e54e09233a3add4753f1e9892bd06375cfc3ec`; safe arena/travel migration and explicit offline gates: `4029c0af213588af097d7db3a60b10889ae179ae`. The final follow-up changes only this handover and its root index; gameplay, runtime and acceptance code remain identical to the verified head.

Read root CLAUDE.md, AGENTS.md, HANDOVER.md and johansson-town/AGENTS.md before further work. Sakura geometry, banners, ground, character design and future fighting are separate tasks. The owner's current decision is a peaceful ordinary game in both editions; no replacement fighting mode is authorised here.

## What changed

- Removed all festival bouts, tournaments, exhibitions, spectating, nearby offers, launcher events/menu tile, public festival audit API, combat frame/input interception, hiding/restoring of residents, damage and combat rewards. Deleted both harbour-festival modules, the dungeon simulation/generator and first-person fists/weapons module. There is no dormant feature switch or replacement simulation.
- Removed Linux insult-to-fight escalation and its callback. “Clear the air…” retains warnings, apologies and a peaceful end to hurtful conversations. Old version-1 hostility is dropped; version-2 saves retain only peaceful cooldowns. Identity selection, owned beds and independent checkpoints remain.
- Withdrew the combat-dependent cave descent. Its mouth, scenery and reading interactions remain; a notice says the descent is closed. No speculative non-combat dungeon was built.
- Removed combat control/help text and combat-only HUD rules. Ferry decks and equipment, conversations, dining, character routines, ordinary festivals and exploration remain. Shared Studio/story costumes and expressive poses remain artistic assets without a gameplay combat simulation or launcher.
- Rebuilt index/runtime/manifest/service-worker cache version. Pruned the original compiled combat graph instead of shipping it as a previous-build payload. The Linux packager omits historical World development documents/QA captures, retains the Spector component notice, and preserves the other tools' documentation.

## Save compatibility

`readSave` applies migration to active, legacy, previous-copy and imported slots. Retired combat progress/resume/hostility fields are discarded without clawing back money or possessions, or clearing ordinary relationships, identity or travel milestones. Progress alone does not relocate an ordinary player.

Shipped bouts were in-memory and did not persist an active encounter. Defensive imported/audit active-bout, spectator, tournament-resume, cave and arena fixtures are also supported. An active encounter resets the current journey location to town while preserving tickets/projects/progress, restores the existing safe fish-auction opening (19.8, -40), and clears affected identity checkpoints. Normal startup restores camera/input/HUD. The transient recovery flag is consumed on entry; subsequent ordinary saves do not relaunch an encounter or repeatedly relocate the player.

## Verification actually completed

| Check | Result and evidence |
| --- | --- |
| World CI guard | **Passed: 352 tests across 65 files**, 223 seconds. Includes empty ground baseline, safe spawns/enterable sites, z-fighting, seating, dining, ferry timetable and withdrawal tests. [39833599965](https://github.com/nj22az/nj22az.github.io/actions/runs/39833599965) |
| Linux regression suites | **37 desktop tests and 57 targeted game tests passed** on the verified source. [39833600011](https://github.com/nj22az/nj22az.github.io/actions/runs/39833600011) |
| Actual native packaged application | **Passed** under Ubuntu/Xvfb/SwiftShader: real startup/stability/version, retired event/date/keyboard routes and API absence, no combat reward, pause/HUD and actual disk snapshot. `PEACEFUL_SMOKE`: HUD false, launcher false, API false, money unchanged true. Same Linux run. |
| Offline packaged browser | **Passed**, with remote requests blocked: running true, combat accessible false, saves present, no page errors or missing files. Same Linux run. |
| Full console/controller/world acceptance | **Passed**: controller recovery/remaps, four window sizes, all 26 identities, owned beds/waking, normal conversations and pause/resume, peaceful repeated insults, old keyboard/controller inputs, retained encounter save, saved identity/settings reload, separate web isolation and old cave-save recovery. Final report: `passed:true`, `errors:[]`, `missing:[]`. Same Linux run. |
| Additional save/calendar/travel checks | **25 passed locally**: save-safety, year-loop, future-calendar, travel-progression and context-actions. |
| Focused withdrawal/runtime checks | **9 passed locally**: every adult/child/family pair, repeated/restored insults, active/spectator/tournament/cave/arena saves, idempotence, property preservation, removed entry points and compiled payload. |
| Extracted candidate archive | **1,553 files matched the full inventory**; component notice present and retired modules absent. Local source stamp `1210c746144abaf2fb89353394a6dcbaba1e87ef`, whose packaged gameplay is unchanged at the verified head. SHA-256 `8ab279d32cf3fe231b381c1a3dcc3f1d802b94ba7f29b648525ff7154346975e`. Private validation candidate only. |

Artifacts: [linux-console-candidate, 12449978994](https://github.com/nj22az/nj22az.github.io/actions/runs/39833600011/artifacts/12449978994). Inspected real-game captures include peaceful fourth-insult dialogue, saved Thuan/night controls, the native controls guide and final web recovery at the fish auction. These are software-rendered acceptance, **not physical Steam Deck, 8BitDo or iPhone Safari acceptance**.

## Harness findings and limits

Local normal Chromium/native attempts encountered this session's socket/display restrictions; local graphical acceptance is not claimed. Ubuntu CI supplies the completed graphical/native evidence above.

Two earlier Linux runs passed their Linux console assertions but failed the separate web recovery screenshot's 30-second timeout after recovery/absence assertions had passed: [39826539001](https://github.com/nj22az/nj22az.github.io/actions/runs/39826539001) and [39829534136](https://github.com/nj22az/nj22az.github.io/actions/runs/39829534136). The second run appeared active in status reads after its log had completed; it was another capture timeout, not a proven gameplay or browser-shutdown deadlock.

The passing harness uses Playwright's public BrowserServer lifecycle to terminate each completed browser, gives the web capture the same 120-second action budget as Linux, freezes only the already-asserted frame, and bounds failure diagnostics. Native/offline checks run before the long console suite; every prior gameplay/layout/save assertion remains, with an explicit failing 20-minute console bound inside the unchanged 40-minute job budget. No graphics setting was reduced and no broad acceptance was disabled. The passing web capture completed, with normal HUD and the safe-arrival caption.

An unrelated visual observation remains: the desktop identity chip overlaps the top dialogue balloon in `11-peaceful-conversation.png`. This task did not change that layout or establish a before/after baseline; investigate separately.

## Review, merge and subsequent Linux release

1. Owner review of PR #365; **merge only on the owner's instruction**. The final documentation-only follow-up may start another automatic CI run; keep the required checks green before merging. Recheck main for concurrent changes and rebuild the combined runtime last if integration changes source.
2. After approval, integrate into `codex/johansson-world-steam-deck`, inspect current releases, and assign the next unpublished version (0.2.17 or later). Version 0.2.16 was the latest published prerelease when checked on 22 October; **its tag/assets were not overwritten**. Local/CI candidates deliberately used the existing source version for validation and must never be uploaded over that release.
3. Follow HANDOVER-LINUX-JOYSTICK-2026-10-22.md and the release workflow: version/package-lock/installer/release note, full appropriate acceptance on the release tree, new immutable assets, installer/checksum verification, then public download/guide updates. Main source changes alone do not update an installed Linux application.
4. Physical-device verification remains outstanding. Future fighting requires a separate approved design/prototype and stays outside the peaceful ordinary build; do not revive random street fights or insult escalation.


## Current-main integration and merge — 2026-10-22T22:54:41+02:00

The owner instructed proceeding with integration. Main first acquired the #368/#369
test repairs and then concurrent rendering styles/free camera at
`af053a44dafe7d0ffe5dc0f3958829eb10aed18c`. These are retained. The merge removes
stale `festival?.active` and `if(fists)` references from the free-camera additions;
the source withdrawal test now rejects them. The runtime was rebuilt with a
peaceful previous manifest, so old combat payloads are not retained.

Verified combined candidate: `9431a9b689f3bbc36148b1b7a5f576032ca64ba7`,
tree `1df0876e60a750962037bb9e1fccab00bba70d6d`.
Squash merge of #365: `4a52d5d2161f9691b8f3e808ba959389f463e578`.
The merged tree matches the candidate exactly.

Checks: **367 local guard tests passed across 69 files (193 s)**; 23 focused
looks/free-camera/frozen-render/withdrawal/runtime checks passed. Earlier
desktop (37) and withdrawal/save/cast (17) checks also passed.
[Current-source GitHub guard](https://github.com/nj22az/nj22az.github.io/actions/runs/39851915816)
passed before merge. Runtime source hash:
`9393340c1c5bce6f09c5b5b229e7fe48780bc1c05bfa7d13f2374f708c3cd520`.
The Look and Free camera buttons remain in the published page; combat UI does not.

Local cloud-boot photography could not launch: `/opt/pw-browsers/chromium` is
absent in this session. No local screenshot success is claimed. Hosted native,
offline and console acceptance is running again for the new source.

Linux release candidate [#370](https://github.com/nj22az/nj22az.github.io/pull/370),
`98136ef8ea425828674d3188cea9c1e93f6b4df8`, has the same World tree plus version,
lockfile, installer and notes at **0.2.17**. Its World guard passed; its full
[Linux acceptance](https://github.com/nj22az/nj22az.github.io/actions/runs/39851951948)
is pending. The separate proposed controller-settings repair (#362) is excluded.
Published 0.2.16 and its assets are untouched. Public-download/installer/guide
updates are prepared locally and must not be published until the new release is verified.

Next: complete exact-tree Linux acceptance; merge #370 into the Linux release
branch; verify publication, native startup, installer and checksums; then update
main's version metadata, public downloads and this handover. Physical devices
remain unverified. The browser source merge alone does not update installed Linux copies.
