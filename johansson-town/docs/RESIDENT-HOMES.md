# Homes and the overnight town

Each of the 21 VRoid neighbours and Yuri now has a separate, named home on an
existing compact lane. These are modest private exteriors with tiled roofs,
timber doors, mailboxes and readable nameplates. Yuri’s house is the exception:
the canal-bank kit building is replaced with her supplied Japanese house, and
the player can step into her supplied bedroom. An occupied home's window glows
at night. Residents reach their own thresholds before being hidden indoors, and
depart from the same locations the next day.

Officer Mori patrols the shopping street and eastern junction from 22:00 until
06:00, including rainy nights, then walks home. Patrol waypoints advance on
arrival, not by clock jumps. Minato Izakaya opens at 16:00 and closes at 03:00;
Nao stays at the counter across midnight. Masaru visits 23:00–02:00 and Tetsuo
00:00–02:45. The sign, entry checks, guest list, ordering and closing transition
use the same overnight hours. At closing, guests resume their street schedules
and the player returns outside.

Hana, Daichi and the cold-store assistant make staggered, non-overlapping ramen
visits. Yuri's existing actor now walks between Sakura, her alternate-evening
izakaya visit and her home; her supplied rig and 1.88 m presentation are retained.
The restaurant and shop borrow existing actors rather than creating duplicates.

All residents continue moving off camera and while the player is in a shop;
only the eight nearest outdoor actors render. Navigation checks slope transitions
and replans around stalled crowds. Houses share the district's instancing batches,
a single nameplate atlas and instanced windows; no extra point lights or character
models are loaded. Simulating the entire cast and occasional crowd replanning add
CPU work. Actual browser/device frame times remain unmeasured.

Validation covers all 22 reachable doorsteps, building overlap, continuous walking
through an evening and night, overnight patrol, midnight and 03:00 boundaries,
restaurant/market actor ownership, closure during play, existing quests and all
interiors. The available browser cannot initialise WebGL, so these automated
checks do not constitute visual or GPU performance approval.
