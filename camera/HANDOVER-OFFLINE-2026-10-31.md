# Pocket Camera complete offline use — 31 October 2026

## Current review

The owner requested “Push to main”, then direct MCP connection and complete offline use. Smart Surprise PR #419
is merged at **e0e749cc143f88e4ee7662d24f02c398204bdd88**, identical tree to reviewed **a20a25fdb92bffd393ec967701792ae319a443b6**.
Its Pages **41226967552** build/report/deploy passed. Exact-head Camera **41208139819** and MCP **41208139842** passed;
World guard/WebKit **41208139808** passed. Linux **41208139856** repeats the two documented unchanged main failures.

This offline follow-up is on **codex/pocket-camera-offline**, based on that merge, **not yet published**. It preserves
Smart Surprise, originals, album/copy-save, frames, stickers and the existing local stdio adapter. No World runtime or
shader is edited. Release/import keys align at **20261031offline1**, including the adapter renderer import.

## What changed

The former worker cached only visited files. The new worker downloads a complete **316-file / 22.4 MB** public runtime
bundle: code, shared shader modules, all supplied stickers/thumbnails, frames, fonts, samples, card sheets and Erase WASM.
`node tools/build-camera-offline.mjs` regenerates **camera/offline.json** and its exact worker digest after runtime asset
changes. Unit checks reject stale or oversized bundles. No personal pictures, album, QA or World scene/models enter it.

Install verifies each file digest and only activates after completion, retaining the preceding cache on failure. Updates
clean only Pocket Camera caches. Network-first fetches retain live online updates and fall back to the complete snapshot,
including versioned requests and query-bearing navigation; stalled requests have a three-second limit. Settings has one
44px icon for preparation, readiness or retry, with accessible labels. Missing cache entries can be detected and repaired.
Album data remains in IndexedDB and is never cleared by the worker.

Initial download requires a connection. The browser must retain its site data; removing it also removes offline files.
No claim of first-ever offline installation, physical Safari acceptance or offline ChatGPT/AI model operation is made.
Smart Surprise and photo processing already run on-device and need no online model.

## Verification so far

- Local Camera units/module consistency/syntax/diff checks pass, including offline inventory/hash checks and Smart 7/7.
- MCP policy/lifecycle/cache keys: **15/15 pass**. Fresh pinned dependencies installed; no dependency upgrades.
- New hosted suite pending: failed install + retry, previous cache/album preservation, every cached byte without network,
  query navigation, generated camera viewfinder, all Looks/Smart/crop/stickers/save, first-use Erase/WASM, games,
  cold browser restart, phone/tablet controls, stalled fetch fallback, repair and application errors.
- Existing 289 Camera browser checks and real MCP acceptance are retained and will rerun. Local Chromium cannot launch
  in this managed environment (Unix-socket restriction); use hosted Actions, not a security bypass.

## MCP connection state

Plugin Creator was installed at the owner's request. This is **not** an installed Johansson Camera plugin or a successful
Camera tool call from this chat. The existing adapter runs as a local stdio process in an isolated Chromium session;
its SDK acceptance client is verified. It does not attach to the owner's Safari tab, Photos or browser album.

Official OpenAI guidance: ChatGPT web uses plugins rather than reading the repository's `.mcp.json` or local Codex config.
An existing stdio server can remain private through **Secure MCP Tunnel**, requiring a running host, a tunnel associated
with the intended ChatGPT workspace, its restricted runtime credential, and custom-plugin registration. None is configured
or verified here. No endpoint, tunnel identity, authentication or installation is invented. See [MCP.md](MCP.md) for the
exact remaining connection steps. Local desktop registration is possible on a host that can run the existing server.

## Next action

Run hosted offline and existing Camera/MCP suites, inspect offline screenshots and JPEG, retain evidence and update this
note with exact commits/results. The owner has authorised publication; publish the verified offline follow-up to main and
verify Pages/public bytes. Keep concurrent handovers and unrelated World work intact. Connect the chat only after a real
reachable host/tunnel and workspace registration are available; do not describe the SDK test client as the owner's client.
