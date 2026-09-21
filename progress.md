Original prompt: This should replace Nao

- Located the supplied `Nao.vrm` and confirmed it is a VRM 1.0 humanoid exported by VRoid Studio 2.14.0.
- The model has embedded textures and a complete humanoid skeleton, but no animation clips.
- Keep Nao excluded from the live street cast while Thuan remains under movement isolation; replace Nao's visual source so it is ready when she is reintroduced.
- Preserve the supplied VRM byte-for-byte. Its embedded metadata credits Nils / Johansson Engineering and restricts redistribution and modification.

TODO:
- Reintroduce the remaining residents one at a time only after Nao's routine and locomotion are approved.

Completed:
- Added the immutable source VRM and verified its SHA-256 against the supplied file.
- Routed Nao alone to `nao-vrm`; other resident identities remain unchanged.
- Added Nao-specific idle, counter, walk, run, wave, seated and activity clips because the VRM contained no animation.
- Added a private preview query that does not alter the published Thuan-only cast.
- Production build passes. The full pre-existing suite still has an unrelated `frontrow threshold` failure in `alley-shops.test.mjs`.
- First browser preview exposed a Thuan-required world setup assumption when previewing Nao alone. The private preview now retains Thuan and adds Nao; the published cast is unchanged.
- Visual inspection then caught the seated calibration pose leaking into standing idle because untracked legs and hips retained the last mixer values. Updated every Nao action to own the complete humanoid pose and restore hips position.
- A mid-stride screenshot showed VRoid's knee axes folding both shins into a crouch. Removed synthetic knee rotation from locomotion; the opposing hip and arm swing still communicates forward travel without destabilising the feet.
- Final browser inspection confirms Nao renders at resident scale with her embedded textures, stands grounded, and transitions into the generated walk. No browser errors were introduced; existing transient texture-image warnings remain.
- Focused Nao, identity, Thuan-isolation and stability tests pass (7/7). Production build passes.

Current request: Bring Nao into the game, place her in the Izakaya, tidying up, give her a routine, buying soda, visiting the Konbini, walking around the park, waiting for the bus. She should not moonwalk and should only walk forward.

- Reintroduced only Nao beside Thuan in the published street cast.
- Nao now arrives on the morning Harbour Line, buys Ramune soda at Sakura Konbini, walks a three-leg park circuit, tidies Minato before opening, serves and tidies through her shift, closes the room, then returns to wait for the morning bus.
- Gave Nao a preferred real shop purchase (`soda`) so the Konbini visit uses the shelves, checkout, resident wallet, and visible carried product.
- Removed the old private preview hold so Nao is governed by the town clock and navigation like a resident.
- Added regression coverage for the schedule, cast boundary, soda preference, and forward-only indoor movement.
- Focused Nao, bus and forward-only checks pass (10/10). Production build passes.
- The broad legacy suite still includes expectations for the former ten-person cast and pre-existing frontage/threshold failures; the one model-count expectation directly changed by Nao's reintroduction was updated.
- Live browser inspection at 17:04 confirms the supplied Nao VRM is grounded inside Minato Izakaya at the service counter, with no placeholder residents around her.
- The required Playwright game client was invoked but retained the project's known virtual-time hang; the same running build was inspected through the in-app browser instead.
