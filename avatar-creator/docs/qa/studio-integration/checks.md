# Fixed integration checks — 20 October 2026

| Requirement | Verdict | Evidence |
| --- | --- | --- |
| Current-main model import/edit/snap/export | pass | 25 focused, 3 runtime tests; desktop/phone workshop round trip; #275 merged |
| Room saving, replacement, undo, stale tabs and exchange | pass | room-editor.browser.mjs at 1280/390; MCP JSON/GLB/PNG round trip |
| Purpose review and World-model room import | pass | world-library.browser.mjs at 1280/390 |
| Static support, rotations and partial coverage | pass | support.test.mjs; included in 50 passing focused tests |
| Sato drinks contact an actual support | pass | Real room query: five samples, complete, gap approximately zero; authored stand/collider |
| Existing film engine, actual camera/marks, clean plate | pass | Browser/MCP export exact round trip; scene-save instrumentation confirms no empty cast persisted |
| MCP strict schemas and stale revisions | pass | 11 protocol tests within 50 focused tests |
| No second renderer/dependencies delivered | pass | No package/lock change; film bridge exports staging, does not render movies |
| Runtime/surface/stair fixes retained | pass | Final runtime build; 3 package tests; 5 no-z-fighting tests with 4096 MB heap |
| Independent review | pass after corrections | Reviewer identified clean-plate persistence and overall room support verdict defects; both fixed and re-reviewed with no unresolved findings |
| Full visual animation editor | unresolved | Not implemented by this integration; continue controls backed by jojo/remotion |

One broader test, ramen-kitchen regulars, throws on its Reiko fixture's missing profile. The identical failure was
reproduced from a clean current-main archive. It is not reported as passing. Default-heap surface testing ran out of
memory; the unchanged test passed with --max-old-space-size=4096. Full repository suite and physical iPad/Safari
were not run. Browser fonts encountered external resource errors; local assertions and page-error checks passed.

Evidence logs: /tmp/current-focused-tests.txt, /tmp/current-room-browser.txt, /tmp/current-library-browser-final.txt,
/tmp/current-z-fighting.txt, /tmp/current-integration-build-final.txt, /tmp/current-integration-runtime-final.txt,
/tmp/ramen-main-baseline.txt. Screenshots and support JSON: output/studio-mcp/library-qa/.
