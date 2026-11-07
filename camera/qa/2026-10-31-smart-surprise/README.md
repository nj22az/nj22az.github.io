# Photo-aware Surprise evidence — 31 October 2026

Review source `b795c7a02a721ff538b435e9aacd6126b3a868a8`, [draft PR #419](https://github.com/nj22az/nj22az.github.io/pull/419), key `20261031smart1`.
Not merged or published. See [the handover](../../HANDOVER-SMART-SHUFFLE-2026-10-31.md).

Actual Camera engine renders and Chromium screenshots; no generated UI mockups. Five source types each evaluate
fourteen candidates in 440–605 ms on the hosted runner. Performance on physical devices is unmeasured. This quality
proxy ranks tone/structure/detail/colour; it cannot guarantee taste or improvement on every click. Every search uses
the original source. Initial `e0dec365` evidence is superseded by the corrected portrait/import suite on this source.

- [Full Smart Surprise evidence ZIP](https://chatgpt.com/library?file_id=libfile_544f3c0038308191bd12de19509468e1&account_id=personal) — 14/14 checks, five before/after pairs,
  full shader renders, phone/tablet/small/large-text screenshots, actual saved JPEG, source photo and recipes.
- [MCP evidence ZIP](https://chatgpt.com/library?file_id=libfile_147291738a24819190db37e390022022&account_id=personal) — 15/15 units + 20/20 real acceptance, generated-image previews and JPEG.
- [Portrait before](https://chatgpt.com/library?file_id=libfile_1375681fef408191adb622dcd00a355c&account_id=personal) · [Portrait after](https://chatgpt.com/library?file_id=libfile_48d92c64cdac8191a1bd5107df876c10&account_id=personal).
- [Café before](https://chatgpt.com/library?file_id=libfile_4b9a68d1aa088191a7a23744a038da98&account_id=personal) · [Café after](https://chatgpt.com/library?file_id=libfile_2af35150fb3481919350f403b517bc2b&account_id=personal).
- [Phone controls](https://chatgpt.com/library?file_id=libfile_2cdbd0981250819180d75e31d9f3bb9a&account_id=personal) · [iPad mini controls](https://chatgpt.com/library?file_id=libfile_f5cba1fe07c48191ab6491e534dfa08e&account_id=personal) · [Saved JPEG](https://chatgpt.com/library?file_id=libfile_0f30175902308191a0eeb908aa86204c&account_id=personal).

Complete regression artifacts are retained as [Camera ZIP](https://chatgpt.com/library?file_id=libfile_75ff873d4e048191bc8387334c56377e&account_id=personal), [UI ZIP](https://chatgpt.com/library?file_id=libfile_425c7598343481919309b9e544e24401&account_id=personal) and [shader audit ZIP](https://chatgpt.com/library?file_id=libfile_99ded891c24881919c1438467f18f7ff&account_id=personal).
All three archives were downloaded and their SHA-256, CRC and extraction paths validated.

Portrait: Vladislav Anchuk / Pexels 29747506, Pexels licence; the public test source is documented in the existing
`tools/camera-test-photos.py`. Café/garden are existing repository photos; dark/bright are generated test patterns.
Engine before/after JPEGs contain the cropped photo and shader recipe; UI screenshots additionally show the retained
frame, stamp and sticker. The portrait source and all evidence digests are recorded in [evidence.json](evidence.json).
ZIP SHA-256, CRC and extraction paths were verified; renders, screenshots and both saved JPEG pipelines were inspected.

Full Camera 143/143, UI 82/82, shader audit 50/50 and new Smart 14/14 pass: **289/289 browser checks**.
World guard 569/569 and automated World WebKit pass. [Exact detailed results](evidence.json) retain job and artifact IDs.

Linux acceptance failed two unchanged World tests. Both reproduce on pristine base main `baf0da1a` with **11 passed /
2 failed**, [full log](unchanged-main-world.log). No World shader, runtime, fixture or assertion is changed by this PR.
Physical Safari, hardware camera/native Share and the owner's installed MCP host remain unverified/unconnected.
