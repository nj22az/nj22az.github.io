# Pocket Camera complete offline release — 31 October 2026

## Published on the owner's instruction

The owner instructed **“Push to main”**, then requested direct MCP connection and complete offline use. Smart Surprise
[PR #419](https://github.com/nj22az/nj22az.github.io/pull/419) was merged first at **e0e749cc143f88e4ee7662d24f02c398204bdd88**;
its Pages **41226967552** and [33/33 initial public-byte checks](qa/2026-10-31-smart-surprise/publication.json) passed.

The offline follow-up [PR #420](https://github.com/nj22az/nj22az.github.io/pull/420) is now **merged and deployed** at
**a1125c62e38e9dcb507f6bd73dce1003cad1cee6**, identical tree **697943460292524ef78c2c12a702f31f9537d4bb** to all-Camera-green reviewed source
**ef4962533e9274051d2ac6670ecf7ceb324ba2cd**. Branch: **codex/pocket-camera-offline**. Earlier source **defa72b79a8b35d44f2f69572b21225b42162b62**
caught an interrupted-first-install retry error; it was corrected without weakening the test. Release/import keys,
including the adapter renderer import, align at **20261031offline1**. Existing World work and local changes are preserved.

## Delivered behaviour

The previous worker retained only files already visited. This release prepares **316 public files / 22,385,224 bytes**:
code, shared shader modules, every supplied sticker/thumbnail, frames, fonts, samples, card sheets and Erase worker/WASM.
It verifies the manifest and every file digest before activation; failed installations retain the previous cache.
Readiness/retry appears as one 44px Settings icon with an accessible label, without covering the photograph. Missing files
and complete cache removal can be repaired. Only Camera caches are cleaned; IndexedDB and other apps' data remain.

Online requests retain live network-first behaviour, with complete cached fallback for versioned requests, query navigation
and a three-second stalled-request limit. Open online once and wait for the download icon to become a checkmark; then
startup, camera, local imports, Looks/Smart, editing, overlays, Erase, JPEG copies, album and games need no network.
Initial download and retained browser site data are required. Smart Surprise works on-device; it needs no online model.

Regenerate with **node tools/build-camera-offline.mjs** after changing runtime assets. The generated **camera/offline.json**
and worker digest are checked by **camera/tests/offline.test.mjs**. All 18 imported Camera modules have one address. No
runtime dependency, World shader/runtime edit, hardware capture tool, native Share tool, public MCP service or AR is added.

## Actual verification

On **ef496253**, [Camera run 41228514057](https://github.com/nj22az/nj22az.github.io/actions/runs/41228514057):

- Core **143/143**, job **124617806746**; UI **82/82**, **124617806893**; shader audit **50/50**, **124617806947**;
  Smart **14/14**, **124617806997**; offline **13/13**, **124617806923**: **302/302 browser checks**, no skips.
- Offline checks prove failed install/retry; existing/other cache and album retention; every asset's exact bytes without
  network; query navigation; generated camera viewfinder; every Look/Smart/crop/sticker/JPEG save; first-use Erase/WASM;
  games; two cold browser process restarts; phone/tablet controls; stalled fetch fallback and cache repair. No page errors.
- All local Camera units, offline inventory/hash, 18-module consistency, syntax and diff checks pass, including Smart 7/7.
- [MCP 41228514058](https://github.com/nj22az/nj22az.github.io/actions/runs/41228514058), job **124617601234**:
  **15/15 units + 20/20 actual SDK-to-Camera acceptance**; eleven tools discovered and generated-image workflow proved.
  Fresh pinned install and independent local JSON audit: **zero npm vulnerabilities**.
- [World 41228514034](https://github.com/nj22az/nj22az.github.io/actions/runs/41228514034): guard **569/569**, job
  **124617834338**, and automated WebKit/iPhone-profile startup **124617834083**, passed. These are not physical devices.
- Linux **41228514049**, **124617601131**, repeats two pre-existing World failures: controller smoke expects old landing
  x=-1.5, actual x=0.3; housing consolidation counts moving ferry meshes on post-office-lot. Both were reproduced on pristine
  base main; [retained log](qa/2026-10-31-smart-surprise/unchanged-main-world.log). No assertions changed. No Linux release.

Pages **41229423812**: build **124620289748**, report **124620536971**, deploy **124620537045**, all passed.
[324/324 canonical/versioned public requests](qa/2026-10-31-offline/publication.json) match the tested runtime, including all
316 bundle files, worker, manifest and app entrypoints. [Evidence, screenshots and archive links](qa/2026-10-31-offline/README.md)
retain exact jobs and hashes; all six CI ZIPs were downloaded, SHA-256/CRC/path verified and retained. Actual offline
phone/tablet controls, editor and saved JPEG, plus MCP generated-image previews/export, were inspected. The final
handover/evidence commit changes no tested runtime. Post-merge World checks are independent of the passing source jobs.

## Connection and physical-device limits

The **SDK acceptance client connects**. Plugin Creator was installed at the owner's request. The owner's installed Camera
MCP host and this chat remain **unconnected**: no actual reachable Camera host/tunnel and workspace plugin registration
has been verified. The existing stdio server runs an isolated Chromium session and does not attach to Safari, Photos or
an existing browser album. ChatGPT web does not read repository .mcp.json or local Codex configuration.

The documented private route is a running local host plus **Secure MCP Tunnel**, associated with the intended Platform
organisation and ChatGPT workspace, its restricted runtime credential and custom-plugin registration. Neither a host nor
a tunnel identity/authentication is invented or exposed. See [MCP.md](MCP.md) for exact setup and verification steps. A
local desktop client can use the existing stdio command directly. Approved imports, pixel-preview disclosure, temporary
MCP album and explicit save/export/close remain. Export before close. Installing Plugin Creator alone is not Camera setup.

Physical iPhone 17/iPad mini Safari, actual hardware camera and native Share remain untested. Browser storage eviction can
remove offline files; keeping site data is required. No offline ChatGPT model or new hosted architecture is claimed.

## Next action

Use the live Camera once online until the Settings checkmark appears, then test a physical iPhone/iPad offline. To finish
MCP connection, use a persistent host that can run Node/Chromium, configure its private tunnel and workspace registration,
and prove eleven-tool discovery plus the generated-image workflow from that host/chat. Resolve the independent Linux
World fixtures in their own work; preserve the published Camera and concurrent World release.
