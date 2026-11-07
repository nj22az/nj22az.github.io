# Minato Maru engine-room publication — 31 October 2026

The owner's instruction, “Implement and push to main”, publishes the Blender H1-F1 engine room in ordinary World play: **2,400 mm working headroom**, the raised deck/access arrangement and **eight locked ship-local cameras**. No URL flag or Meshy step is needed.

- [Live game](https://nj22az.github.io/johansson-town/)
- [Main-release handover](../../johansson-town/briefs/HANDOFF-FERRY-ENGINE-ROOM-MAIN-2026-10-31.md)
- [Native Blender model](../../johansson-town/art/ferry-engine-room/Minato_Maru_Engine_Room_H1.blend)
- [Sixteen-sheet CAD](../../johansson-town/art/ferry-engine-room/cad/Minato_Maru_Engine_Room_H1_Implementation.pdf)
- [Source provenance](source-provenance.json) and [public file hashes](public-files.json)

**Published to main; source `390fc31a`.** The final hosted guard passed **569/569**, and the complete native WebKit phone run passed, including all eight engine-room camera views, normal movement, asset loading, native exit taps, repeated room/resource checks, real context-loss recovery and the twelve-hour return. [Publication record](publication.json) records deployment, hosted checks, artifacts and live-file verification. Captures named `ferry-*.png` show the actual compiled game with WebGL. They are not Blender preview renders. The WebKit check uses an iPhone 13 profile on Linux; physical iPhone/iPad performance remains unverified. The auxiliary tablet-size resize left unused white area, so it is diagnostic evidence in the native artifact and is not accepted as a tablet result. Only full phone-viewport captures are presented here.

The original implementation is `2bb7bb35`; `baf0da1a` aligns the opening and ladder return and parks the review fixture at the actual Town timetable dwell. The latter source passed 569 hosted tests and the complete engine-room graphics section. Its full report is retained as `webkit-baf0da1a-report.json`: the later dining exit exposed the shared touch movement zone above the action button. `390fc31a` raises the touch HUD above that zone and verifies a real hit at the exit button before tapping. The complete game source and runtime trees are unchanged between those latter two commits.

All 62 JS files from the previous production release remain byte-for-byte available. The public check verified 97 unique entry, runtime, model, Blender and CAD files. The final stylesheet/index/service-worker change is checked separately in the publication record.

[Engine-room phone capture](ferry-engines-phone.png) · [Control-booth phone capture](ferry-control-phone.png) · [Successful full phone report](webkit-390fc31a-report.json)
