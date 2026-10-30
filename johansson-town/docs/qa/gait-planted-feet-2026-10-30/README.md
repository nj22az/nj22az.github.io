# Planted-feet candidate review — 30 October 2026

Final source/runtime: `0d38b1017e27b5e97f523146f496f616d48d7c1e`, based on main `37befc31`.
[Draft PR #406](https://github.com/nj22az/nj22az.github.io/pull/406) is not merged or published.

[Before-and-after clip](https://chatgpt.com/library?file_id=libfile_5aa456b4f438819198846d363da4be0f&account_id=personal):
6.5 s, 24 fps, 156 frames, H.264, 1920×540, silent. The left side is main and the right side is the candidate.
The same four bodies, speed profile, street and camera are used. Simulation is sampled at 60 Hz.
0–0.5 s standing; 0.5–3 s walking at 1.3 m/s; 3–5.5 s running at 3.5 m/s; 5.5–6.5 s stopping.
`clip.json` records the actual encoded metadata and SHA-256. The final clip replaces the initial comparison; its
Library identity is preserved (version 1).

`tools/gait-review.mjs OUT 37befc31` reproduces the timed motion inside the full source game; it reads the old animator
from git without checking it out. The cast is staged in the clear carriageway for comparison, not driven along their
daily routes. `report.json` records the bodies, viewports and zero page errors. Rendering uses software Chromium;
no physical phone or GPU-device acceptance is claimed.

- Pedestrian, overhead and 390×844 phone views at 2.208 s were inspected, together with five consecutive sampled
  frames around walk, run and stop. The PNG captures remain local: GitHub's blob-create operation returned internal
  errors. The comparison clip above is available, and the capture tool reproduces the views and frame sequences.
- `matrix.json`: **144** measured default-clothing, level-floor cases. Maximum film-probe slide **3.667 mm**;
  drawn-shoe slide **5.992 mm**; actual penetration **0.109 mm**;
  vertical sole change **32.761 mm/60 Hz frame**; first supported stop landing **113.333 ms**.
  The 10 mm contact/penetration limits are unchanged. Penetration uses actual vertices, not virtual bounding-box corners.
- `guard.log`: **471/471**, **92 files**, **228 s**, with CI's 6 GB heap.
- `runtime.log`: **4/4** after retaining main's runtime graph alongside the final build for already-open tabs.
- `build.log`: successful runtime rebuild. `focused-service.log`: **43/43** gait/style/service checks, collision
  assertions intact. Tests also guard steady-run body height and changes of pace.
- `boot.json`: the earlier full-game street/room boot at 390×844, no page errors.

Authored counter work, named poses and turns on the spot remain outside ordinary-locomotion certification.
The owner must approve the changed cadence before merge. The film-studio copy is unchanged.
