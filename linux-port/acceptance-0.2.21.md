# Linux 0.2.21 — fixed Steam Deck controls

25 October 2026. **Candidate, not yet published.** Public downloads remain 0.2.20 until release verification.

The owner requested fixed default Steam Deck controls, prioritising its sticks and trackpads over other Linux controller compatibility. The Linux preload selects `inputProfile: steam-deck`; the shared desktop reader then fixes axes 0/1 and 2/3, action buttons and Deck symbols. Stored remaps/controller choices are ignored without deleting them. Camera tuning and game saves are retained. Raw-driver detection is bypassed in this profile. Stick-only activity can select a late standard virtual pad beside an idle one.

Left stick and left trackpad move and choose in menus. Right stick and right trackpad look; clicking either right control centres the camera. The other standard Deck buttons retain their existing island actions. Rear paddles have the default unassigned state; Steam and Quick Access remain system controls.

## Source and installer

Production main verified at `7c048393daaf614e242956cf3ee7b3f9bdc0f626`; latest published Linux release was 0.2.20, with no subsequent published package. World sources are unchanged by this control work, including facial correction `c36a40c`. Existing release-preparation and release branches are reused; no new branch.

The one-file installer embeds an original local Steam Input template, writes it to `controller_base/templates/controller_neptune_johansson_world.vdf` and selects its filename for Johansson World in each account's `configset_controller_neptune.vdf`. Other games and first-run backups are preserved; `--steam` is idempotent. The actual Steam client must be closed before configuration changes. Run the current installer in Desktop Mode once after updating, then launch from Steam Library → Non-Steam. The in-game updater cannot change a running Steam client's input layout.

Format research used Valve's official Steam client manifest `steam_client_ubuntu12`, version `1792618285`, and its `public_all.zip.f7b7316d122d96ff7f79b6eede24edd5b142d7bf` (SHA-256 `c3cf55bac18220f9c3587c91e94777d31968781c76628154794cf15a7de6f6a0`). Inspected Neptune templates for source names/modes/activators, and standard gamepad templates for explicit `output_joystick` values. No Valve assets or full templates are redistributed; the small game-specific binding document was authored here. The selected settings use `joystick_move` for movement and right-stick control, `mouse_joystick` for the right trackpad, analogue triggers and standard XInput buttons.

## Checks and limits

- Local desktop/installer/storage/updater regression suite: **42/42 passed**. Includes stale remap/device preferences, both standard axes, fixed buttons, raw-device rejection, stick-only takeover, held-button reconnect suppression, explicit pad/trigger bindings, Steam configuration preservation and repeat installer repair.
- Compiled-game acceptance is extended to use the actual Deck preload marker and intentionally broken old preferences. It checks absence of remapping controls, retained camera tuning, movement, camera yaw/pitch and right-click centre for stick and trackpad-emulated virtual packets, plus real menus/Bag/Town book.
- Hosted packaging, native startup/disk saves, full Linux layout/resident/save acceptance, all 19 Looks and World guard: pending.

**No physical Steam Deck is attached.** Tests inject the virtual Gamepad packets that Steam Input is configured to produce. They cannot prove Steam's live loading of the local template, physical trackpad feel, actual hardware axes or Gaming Mode performance. These remain hardware acceptance items. Other Linux controllers are outside this release's scope. Do not claim the owner's physical-device fault is confirmed resolved.
