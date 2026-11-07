# Johansson Camera MCP

A local **stdio MCP server** for Pocket Camera. It drives the real `/camera/` editor in an isolated Chromium session;
there is no second renderer and no change to the published app. The SDK, Zod and Playwright versions already pinned
in `johansson-town/package-lock.json` are reused.

## Install and connect

From the repository checkout containing this work:

```sh
npm ci --prefix johansson-town
cd johansson-town && npx playwright install chromium && cd ..
node johansson-town/tools/camera/server.mjs
```

The last command waits for an MCP client on stdin; it is not a web server URL. `.mcp.json` registers the server as
`johansson-camera`. Restart or reconnect the local MCP host after pulling the branch. A host launched outside the
repository should use the **absolute path** to `johansson-town/tools/camera/server.mjs` as its Node argument.

For path-based imports, set `CAMERA_MCP_INPUT_DIR` in the host's server environment to a folder containing only images
you approve for this workflow. Paths are resolved inside that folder; traversal and symlink escapes are rejected.
Without that setting, `camera_import` accepts padded base64 image bytes instead. Imports accept PNG, JPEG or WebP,
up to 20 MiB and 48 megapixels. They never fetch arbitrary URLs. `CHROMIUM_EXECUTABLE` optionally selects an installed
Chromium executable; otherwise Playwright's browser is used.

The 48-megapixel limit is checked from the original PNG/JPEG/WebP header before the app decodes or downsizes it.
Keep the approved directory under your control; do not let an untrusted process replace its contents while importing.
The stdio input buffer accommodates a full 20 MiB image after base64 encoding, with a bounded allowance for JSON.
The private preview serves Camera resources and its five shared shader/UI modules only. It rejects foreign Hosts,
foreign Origins, cross-site requests and symlinked preview files; it does not serve dependencies or the input directory.

## Workflow

1. `camera_open`, then `camera_catalog` to inspect the app's real choices.
2. `camera_import` with `path` or `data`, then `camera_edit` with an `edit` object.
3. `camera_preview` to inspect the actual editor picture.
4. On the user's save/export instruction: `camera_save({confirm:true})`, then
   `camera_export({id:"<returned photo id>",confirm:true})`.
5. Export every photo to retain, then `camera_close({confirm:true})`.

Edits support one to three Look layers (`look`, `amount`), the app's six adjustments, Enhance, paper, frame and a crop
rectangle (`x`, `y`, `w`, `h`, each a fraction of the original image). Call the catalog rather than guessing IDs.
`camera_state` reports the current recipe and page errors. `camera_album` lists session photo metadata;
`camera_open_photo` uses the app's original-source re-editing. Opening another image while editing requires an
explicit `discard:true`, or save first.

Save always makes a **new copy** through the normal Save handler: original source, recipe, crop, Enhance, Looks,
paper, overlays and JPEG compression remain the app's responsibility. Export writes exactly the saved image bytes
under a unique filename, returns its SHA-256 and never overwrites a file. The preview is a screenshot of the editor,
not a full-resolution export.

## Boundaries

- This is **not** a connection to the user's iPhone, Safari tab, Photos library or existing browser album.
- The isolated browser album is temporary. Closing, cancellation or disconnect discards it. Exported files survive
  close, but are in the operating system's temporary directory: move them somewhere durable.
- No hardware-camera permission, native Share, automatic upload, delete-photo, arbitrary JavaScript or publish tool.
- The page is limited to its local preview origin. A requested preview sends image pixels to the connected AI host;
  do not describe that as entirely private/on-device AI processing.
- This is local MCP, not a hosted HTTP connector and not browser-native WebMCP. No public endpoint or API key is added.
- Sticker/lettering authoring, Erase brush painting and mini-game controls are not exposed by this first adapter.
- The adapter source is on `main` through PR #416, merged on the owner's instruction. Pull main before local setup.
  The website's Camera renderer remains unchanged; merging does not create a hosted MCP connection.

## Checks

```sh
node --test johansson-town/tools/camera/policy.test.mjs
CAMERA_MCP_EVIDENCE_DIR=./camera-mcp-evidence node johansson-town/tools/camera/acceptance.mjs
```

The acceptance script uses the official MCP client over stdio, a generated test image and the actual app. It checks
initialization/discovery, import, edits, rejected edits, preview pixels, copy-save, exact-byte export, retained sources,
no page errors and cleanup. The PR workflow runs both and uploads the images/report. Chromium/SwiftShader is not a
physical Safari or iPhone test. See [the current handover](HANDOVER-MCP-2026-10-31.md) for checks actually completed.

The client reads this checkout's `.mcp.json` registration and launches its absolute server path from outside the
repository. It tests both generated base64 bytes and a generated file in a temporary approved input directory.
This proves the acceptance client's connection; it does not install the server in the owner's MCP host or expose
the tools to this ChatGPT conversation. To complete that connection, configure a local stdio-capable host to run
Node with the absolute server path, reconnect it, and verify that all eleven `camera_*` tools are discovered.
Then run the generated-image workflow before approving any personal image for preview.

## Connecting this server to ChatGPT web

The existing server is local stdio; the public `/camera/` URL is **not** an MCP endpoint. ChatGPT web does not read
this repository's `.mcp.json` or local Codex configuration. Installing Plugin Creator alone does not connect Camera.
[Official connection guidance](https://learn.chatgpt.com/docs/extend/mcp).

To retain local hosting, [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels) can
forward the existing stdio process through outbound HTTPS. A persistent host must run Node, the pinned dependencies,
Chromium and `tunnel-client`. The owner must select the intended Platform organisation and ChatGPT workspace, create
or reuse a tunnel with the appropriate Read/Manage/Use roles, and supply its runtime credential through secure setup.
Use the actual absolute server path as the stdio command; run the tunnel client's doctor/readiness checks, then add the
same tunnel under ChatGPT Plugins → Add custom MCP server → Tunnel. Confirm actual eleven-tool discovery and a
generated-image import/edit/preview/save/export cycle in that chat before calling the connection complete.

No tunnel, external host, hosted HTTP server or Camera plugin has been provisioned by this repository change. Keep the
existing approved-folder and confirmation rules. Tunnel messages have a documented 10 MiB envelope limit: for large
photos prefer approved local-path import rather than large base64 messages. MCP preview still sends image pixels to
the connected host, and its temporary album requires export before closing. The offline web app itself needs no MCP.
