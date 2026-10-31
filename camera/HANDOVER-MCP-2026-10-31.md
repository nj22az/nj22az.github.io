# Pocket Camera MCP — 31 October 2026

## Request and branch

Owner: **“Mcp wire the Johansson camera web app.”**

Work is on `codex/pocket-camera-mcp`, based on `main` **`f49f22ba82e6d4b1fd9b5033f8bddc4d3eed903f`**.
This is review work, **not merged or published**. The prior Camera release via #414 stays intact. No Camera runtime,
shader, CSS, service worker, sticker asset, World runtime or existing album migration is changed.

The existing publication handover remains the root HANDOVER.md index's Camera entry and links to this continuation.
Read [MCP.md](MCP.md) for setup, tool boundaries and operation.

## Implemented

- `.mcp.json`: dedicated `johansson-camera` entry, retaining Town Audit, Studio and REA.
- `johansson-town/tools/camera/`: lazy isolated browser session, eleven SDK-registered stdio tools, strict schemas,
  validation, file-import restrictions, serialization, cancellation and cleanup.
- The existing `window.pocketCamera` bridge and actual DOM controls perform edits. The original Save handler performs
  final rendering and JPEG encoding. Every MCP save is a copy. Export preserves the exact saved bytes.
- State/catalog, import, recipe editing, preview, album metadata, original-source re-edit, save-copy, export and close.
- No hardware capture, personal browser/phone connection, arbitrary URL import, native Share, delete or publication.
- Temporary album only; exports survive closure but must be moved out of the OS temporary directory for durability.
- `policy.test.mjs`: validation and lifecycle checks. `acceptance.mjs`: official client -> stdio -> actual Camera.
- `.github/workflows/camera-mcp.yml`: bounded PR acceptance and evidence artifact.

## Verification so far

**Actually run locally:** 9/9 Node unit tests pass, including invalid image payloads, import traversal and symlink
escape rejection, recipe bounds, tool inventory, required save/export/close confirmation, startup failure cleanup and
cancellation during a delayed browser launch. All six new `.mjs` files pass `node --check`.

**Not yet verified at this handover checkpoint:** actual SDK handshake and real Camera browser acceptance. The local
container cannot resolve GitHub/npm and has no installed repository SDK dependencies; the acceptance suite is therefore
supplied for the PR runner. Do not report it as passed until the job log confirms all 16 checks. Physical Safari,
iPhone/iPad, native sharing and a live user's MCP-host connection have not been tested.

## Remaining acceptance and next action

Check the PR workflow and inspect its before/after preview and saved JPEG. Resolve any failures before merging.
The adapter deliberately references the published Camera module cache keys `20261031rc2`, `20261029f` and
`20261029c`; keep these aligned when Camera dependencies change. Existing app rendering/regression acceptance remains
in [the publication handover](HANDOVER-PUBLICATION-2026-10-31.md), not evidence of this new adapter passing.

The tool scope excludes sticker/lettering authoring, Erase painting and mini-games. Browser-native WebMCP and a hosted
HTTP MCP endpoint are also not implemented. Do not claim all app functions or the user's live phone tab are wired.

Publication requires a separate owner instruction. An installed local MCP host can use this branch independently of
GitHub Pages after dependency/browser installation and reconnection.
