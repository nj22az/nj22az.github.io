# Complete offline island on iPad — 31 October 2026

The owner asked to explore Johansson World offline on his iPad and conduct a human audit. This extends the existing game; no renderer, simulation, rooms, residents, saves or Pocket Camera runtime are changed.

## Implementation and publication

- Base: verified main `3869b9dff5f214ae28f35c061575fa80476d15d9` (Camera offline release retained).
- Review branch: `codex/town-offline-audit`. Implementation commit and PR will be recorded after transfer.
- An explicit Offline control on the title and in Town book → Settings downloads the complete game inventory, about 131 MiB. It verifies each file's length and SHA-256 before publishing a ready marker. Download progress, pause/resume, retry, quota errors and recovery after termination are included.
- A complete snapshot is pinned separately from the bounded visited-content cache. A failed replacement retains the previous complete snapshot; a completed replacement reuses matching files and removes obsolete island snapshots. Camera caches and localStorage saves are untouched.
- All gameplay assets and current compiled entries, including lazy room/audio/season/engine-room content, are included. Blender sources, authoring scripts, docs and personal saves are excluded. External Studio/calculator pages, live shops and the separately opted-in AI model are outside island exploration. Existing font fallbacks work without Google Fonts.
- **Not published.** The owner's initial boundary requires explicit authority for main/publication. Previous Camera publication requests have been completed. This new World feature is prepared for review first.

## Verification

Initial CPU checks: 10 offline policy/inventory tests and four runtime-package tests passed before the final review refinements. Re-run and record the final exact source, inventory, hosted jobs and evidence before completion. Local graphics are unavailable in this managed environment; real graphical checks run in GitHub Actions.

`town-offline.yml` tests real Chromium and WebKit with an iPad mini 744 × 1133 CSS viewport, DPR 2 and touch. It downloads through the UI, pauses/resumes, hashes every file with networking disabled, restarts the browser twice using persistent storage, boots the ordinary game URL, retains a real save, rotates the display, exercises touch and movement, then enters unvisited rooms and all eight default Blender ferry views. No scene or service-worker response is mocked. Google Fonts are replaced with the existing system font fallback for deterministic CI.

These are desktop browser simulations, **not a physical iPadOS Safari sign-off**. Physical installation, memory pressure, long-term browser storage retention and the owner's human exploration remain open.

Existing unrelated Linux acceptance failures remain documented in the Camera offline handover: ferry landing expectation and the post-office lot scan. Do not weaken those assertions or mix their repair into this change.

## Human audit on the iPad

After publication:

1. Open Johansson World in Safari while connected. Share → Add to Home Screen; open that icon.
2. Tap Offline → Download for offline. Keep the app open until **Ready offline**. Download in the app you will actually use; Safari and the Home Screen app can have separate storage and saves.
3. Enable Airplane Mode and switch Wi-Fi off. Close and reopen the app. Continue your existing save.
4. Walk the harbour; visit Sakura and its upstairs office, Minato Izakaya, Sato Ramen and the ferry's engine/control rooms. Try portrait and landscape, movement, conversations and local sound.
5. Save, close and reopen while still offline. Confirm progress remains. For defects, record the location, time, orientation, action and screenshot.

Keep the app's website data. Safari can remove data under device storage pressure; the app requests persistent storage from a user gesture without promising it will be granted. [WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/) is the primary reference.

## Next action

Complete hosted offline and regression checks, inspect screenshots, retain evidence, update this handover with exact commits/results, and obtain publication authority before merging this World change.
