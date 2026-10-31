# Sakura/izakaya room recovery and Nakamura retirement — 31 October 2026

## Owner request and state

Owner: “The game crashes in Sakura office too, find the issues. Izikaya and Sakura, remove the ice cream family now ... we need to build facilities before we populate them”.

Work branch: `codex/sakura-izakaya-resident-repair`, from production `8124d06ca0bd90606a737c3856c7a9da968fd15a`. Local merge `2f645b0` retains current Pocket Camera publication and brings in the existing combined room repair (`55ee0843`), preserving its work instead of rebuilding another independent interior. This includes startup/resource repair #413, CAD Rev 9/entry recovery #410, published artwork #409 and the owner's two-office-poster selection (KITANO 12 and UMINEKO Black). This task's new changes and verification are recorded below. Publication state: local work in progress; no new main update is claimed.

## Confirmed faults

- Main's released-canvas registry retained disposed room textures, backing canvases and painter closures. The existing startup repair unregisters them on disposal; its regression reproduces twelve retained entries before the fix and zero afterwards.
- Six concurrent full-character decodes and shader warm-up of hidden subtrees caused avoidable memory/compilation peaks. The integrated repair uses two concurrent jobs and compiles drawable subtrees, retaining the normal cartoon rendering and original models/textures.
- Entry lacked complete recovery around prerequisite loads and allowed another entry between loading phases. One lock now spans prerequisites and construction; rejected loads retain the current room and can be retried. A construction exception uses the ordinary street rollback and logs the original error.
- Sakura's stair transition ignored a false readiness result, discarded its loaded storey and announced arrival even after failure. Failed prerequisites now keep the original floor, return the player to its safe stair arrival and clear passage/input state for a retry. Successful swaps dispose the preceding room once.
- Sakura's cached poster/case atlases were disposed by office cleanup despite also belonging to the persistent shop. The shared textures now declare that ownership. The regression first reproduced three poster and one case disposal event; five office build/cleanup cycles now preserve the cached atlases while disposing room-owned resources.

These are reproduced code/resource faults. They do not establish the exact cause of an OS-level physical iPhone page closure; that reported failure remains distinct from the automated checks below.

## Facilities before residents

Exactly Emi Nakamura (`emi`, Mrs Nakamura) and Mai Nakamura (`mai`, Mai) retire from active cast, households, schedules, school presence, social choices and resident guides. Historical recipes/assets remain available for existing creative work. Their retained dessert/ice-cream premises are vacant, shuttered and unstaffed, and cannot take an order. Their former upstairs home is no longer an occupied address; the premises remain. The community-kitchen programme pauses while civic register/clinic facilities remain.

Save migration removes retired aliases and relationships, remaps the old home discovery, drops errands from or to either retiree, and retains surviving progress. Desktop life already recovers an absent controlled resident to Johansson; regression coverage checks the new retired aliases without replacing that implementation. No replacement resident or best friend is invented.

## Verification

Pending final source generation, runtime build, combined guard and full-game smoke. Focused tests and final exact totals will be recorded before handover. The browser fixture extends the existing iPhone-profile WebKit/Mesa acceptance with repeated office/izakaya entries and bounded post-warm-up texture/geometry/canvas counts, all prior graphics/error assertions retained. Extending a fixture is not a passed browser run. Physical iPhone/iPad/Steam Deck acceptance remains unverified. No new Linux release, Studio sync or paid asset generation.

## Next

Finish source/generation checks, rebuild runtime while retaining the currently published cache graph, run the combined guard and CPU room smoke, then publish a review candidate and run the extended WebKit fixture if authorised. Record actual external branch/PR/deployment state rather than assuming it from a local commit. A prior conversation's combined candidate upload was rejected by automatic approval review; no rejected action is to be bypassed.

