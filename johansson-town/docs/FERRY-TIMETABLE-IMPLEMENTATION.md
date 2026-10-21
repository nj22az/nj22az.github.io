# Minato Maru timetable implementation

Status: implementation on `codex/ferry-timetable`, awaiting owner visual approval. Do not merge or issue a Linux release before that approval. The town-hall backdrop work is separate.

## Service

`HARBOUR_LINE` remains the single source. Its entries are arrivals at Minato. `src/people/ferry-timetable.js` derives the outward and return departures using the existing crossing and dwell durations.

| Kitano-jima departure | Minato arrival | Minato departure | Kitano-jima arrival |
| --- | --- | --- | --- |
| 08:08 | 08:30 | 08:45 | 09:07 |
| 14:08 | 14:30 | 14:45 | 15:07 |
| 21:38 | 22:00 | 22:15 | 22:37 |

The ship prepares machinery and crew stations twenty town minutes before departure. At T−2 the existing prolonged whistle sounds, the gangway sign reads 出港 / Departing, and a passenger aboard sees Go ashore / Stay aboard. A passenger can board during that warning. The warning never holds the ship; silence means remaining aboard.

At departure passenger access and new vehicle loading close. People on the gangway or ramp are settled at the nearer safe end before a moving access part is withdrawn. A vehicle already transferring finishes under the existing physical interlocks. Wheel securing, ramp locks, each mooring line and crew acknowledgements remain mandatory: a genuine safety fault can delay physical unberthing and is shown by the operations panel.

The route follows the existing measured sailing profile, slowed to the timetable passage with a reserve for mooring. Access at the destination cannot open before the published arrival and the all-fast, ramp and driver checks. The passenger remains on the same moving floors and retains walking, stairs, engine-room access and camera control. Go ashore follows the ship's existing pedestrian route and then the appropriate shore landing.

The port poster, hall board, telephone and passenger menu now describe scheduled service. Delivery vehicles stage for the derived sailings. A queued vehicle after boarding closes waits for a later boat instead of preventing departure. The free quick crossing remains independent and never moves the ferry or its cargo.

Mac's existing physical relief-watch controller and the Linux edition's full crew simulation remain in use. No player acknowledgement is required by the ship's operation.

## Saves and clock

Legacy requested/held journeys restore the last safe shore and preserve their return fare, flight ticket and check-in. The existing safe-shore recovery and vehicle reconciliation remain in force. The idle ship resynchronises when the saved clock or selected time changes; an active operation is not restarted by a passenger request.

## Verification

Automated and browser results are recorded with the review. The reproducible phone check is `node tools/validate-ferry-timetable.mjs output/ferry-timetable`, using a software Chromium via `TOWN_CHROMIUM_PATH` when required. It operates the actual game and writes screenshots and state records.

After visual approval, merge the source and tests, rebuild the runtime against the latest main without overwriting unrelated index changes, then integrate the approved commit into the next Linux release. This branch does not publish a release.
