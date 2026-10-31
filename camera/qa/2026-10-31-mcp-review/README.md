# Pocket Camera MCP continuation review — 31 October 2026

Scope: PR #416, `codex/pocket-camera-mcp`, starting at `3267eff1993bf276a0ee6700407f23a0fa8cbfa6`.
The review changes the local adapter, tests, its CI checkout and three affected package resolutions. Camera and World
runtime source/assets, the existing release, `.mcp.json`'s eleven-tool architecture and publication state are preserved.

## Dependency audit

`npm audit --prefix johansson-town --json` initially reported three high-severity packages. `npm ls --all` confirmed
the following installed paths. The before/after JSON reports are retained beside this note.

| Package | Dependency path | Applicability to this adapter | Smallest compatible remedy applied |
| --- | --- | --- | --- |
| Zod 4.6.5 | Direct `zod`; also MCP client/server/core → Zod, deduplicated | Used by `z.fromJSONSchema` for every tool input. The advisory concerns excessive validation work on oversized collections. Existing strict schemas and local stdio limit exposure; no exploit was executed and exploitability is not claimed to have been established. | Exact 4.6.6, the advisory's first patched release; satisfies the SDK's existing `^4.2.0`. |
| Vite 7.3.6 | Direct development dependency | The reported editor-launch, middleware and filesystem advisories concern Vite's development server. This adapter runs its own read-only static preview and never imports or starts Vite; those vulnerable server paths are not used by the adapter. Vite remains a repository development/build tool. | Exact 7.3.7 within the same minor, preserving Node engine requirements and all other resolved dependencies. |
| source-map-js 1.2.1 | Vite → PostCSS 8.5.28 → source-map-js | Indexed source-map processing can block the event loop. The adapter does not run PostCSS or parse source maps, so this path is not invoked during Camera operations; repository CSS builds can use it. | Lockfile-only transitive update to 1.2.2, satisfying PostCSS's existing `^1.2.1`; no new direct dependency or override. |

Primary references: [Zod advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5),
[Vite advisory collection](https://github.com/vitejs/vite/security/advisories),
[Vite filesystem advisory and patched ranges](https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22),
[source-map-js advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) and
[source-map-js 1.2.2 release](https://github.com/7rulnik/source-map-js/releases/tag/v1.2.2).
The exact five Vite advisories reported by npm are included in `npm-audit-before.json`.

Commands used: targeted exact installs of `vite@7.3.7` and `zod@4.6.6`, followed by `npm update source-map-js`.
No `audit fix`, force option, major upgrade, unrelated package update, package addition or runtime rebuild was used.
The final lockfile changes only these three package entries and the two direct pins. The follow-up audit reports **0**
findings. This is a clean audit of this package prefix at this review, not a guarantee covering the separate REA npx
installation, every operating-system/browser component or future advisories.

## Review findings addressed

1. The 48-megapixel check formerly ran after the app's 16-megapixel downscaling. Original dimensions now fail before
   browser mutation, for PNG, JPEG and the three WebP header forms.
2. The shared preview served broad repository mounts and followed symlinks. A synthetic outside-mount file was
   successfully read through a link during reproduction. The adapter now has a narrowly scoped public-resource
   server with Host/Origin/cross-site checks, regular-file identity checks and no symlink serving. The shared World
   tooling server itself is not changed. This is loopback preview infrastructure, not an HTTP MCP endpoint.
3. A 20 MiB image needs about 28 MiB of base64 JSON, exceeding the SDK's default 10 MiB receive buffer. The server
   now uses a bounded buffer sized to the advertised import limit. A real stdio client test sends over 10 MiB.
4. Transport failure could leave the private browser running. Transport closure now triggers session cleanup;
   actual SDK cancellation/serialization and transport-buffer-error tests verify the lifecycle.

Save-copy, approved imports, exact-byte export and explicit Save/Export/Close confirmation remain in place. Preview
still sends pixels to the connected AI host. No capture, native Share, delete-photo or arbitrary-JavaScript tool was
added. The module-cache alignment check verifies the adapter against the app's actual import specifiers.

## Verification record

Local policy/lifecycle suite: **15/15**, including a real stdio discovery/large-payload exchange and SDK cancellation.
Seven adapter modules pass `node --check`; `git diff --check` passes.

`local-attempt.json` deliberately records **failed** real-browser acceptance after only the first two checks:
initialization and eleven-tool discovery passed, but Chromium's required Unix socket was denied by the executor.
The exact pinned Chrome for Testing 149.0.7827.55 ZIP passed archive integrity checks. No successful local rendering,
editing, preview, save or export is claimed from that attempt. There was no change to the managed socket policy.

Hosted rerun, final source commit, retained images and their inspection are recorded in
[the handover](../../HANDOVER-MCP-2026-10-31.md). The 20-check acceptance suite reads the real `.mcp.json` registration
and launches its absolute server path from outside the repository. It remains an acceptance client, not an installed
connection on the owner's computer or a tool connection in this chat. Physical Safari/iPhone remains untested.

## Completed hosted verification

Implementation **`23ead95974b5362aa1042b9368fb89b630de4108`**, tree **`0213ec74fa7b75edefa176a95f4b24e355ad6901`**.
[Run 41169563788](https://github.com/nj22az/nj22az.github.io/actions/runs/41169563788), job **124444372569**, passed
**15/15 units and 20/20 real MCP/Camera checks**, without skips. `hosted-results.json` is the exact successful result.
GitHub tested merge candidate `ce31b6ce1e3f93db55b64214a7998bf888283a51` into base `f49f22ba`.

[Full image artifact](https://github.com/nj22az/nj22az.github.io/actions/runs/41169563788/artifacts/13030695442), ZIP
SHA-256 **`16566b783e6df279e232b5948770a79c70e06535e61cf14692280336b4960efc`**, checked against the downloaded bytes,
upload log and GitHub's digest. Before/after previews and the 256 × 192 JPEG were all visually inspected. The default
Pocket image changes to the requested cropped, three-Look image with Drawing paper and the Print border, and the
saved JPEG contains that same crop/treatment. This is a synthetic fixture, not an art-quality audit.

`world-guard.log` records **560/560** passing tests across **109 files**, in 309 seconds.
`shared-mcp.log` records **21 passed, 1 skipped, 0 failed**; the existing opt-in After effects browser test was skipped
because `STUDIO_BROWSER_TEST` was not enabled. No test assertions or budgets were weakened.
