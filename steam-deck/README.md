# Johansson World — offline Linux edition

The complete island game runs locally in a standalone Electron Linux application using its existing Three.js renderer. This is the Steam Deck edition, not a C rewrite or a CubeXX build. World, residents, shops, ferry, interiors and Studio assets are installed locally. Gameplay renderer requests to the internet are blocked.

## Controls and saves

- Left stick moves, right stick looks; A interacts, B backs out, Y opens Bag. R3 levels the camera; R2 runs, X jumps, L2 looks closely. Left trackpad also moves; right trackpad also looks, with its click centring the view. Linux now uses one fixed Steam Deck layout through Steam Input; old saved assignments and axes are ignored without deleting their saved values.
- The Deck’s ☰ Menu button opens pause from both the title and the island. L1/R1 switches Island, People and Settings; B returns a page or resumes from a section. ☰ always resumes. An always-visible Menu button and F10/Escape provide keyboard/mouse access.
- The first visit explains the controls and suggests first steps. ☰ → Island → How to play reopens that guide.
- ☰ → Settings → Controls & camera retains sensitivity, dead zone, FOV, invert Y, walking camera motion and live stick/trackpad feedback. Camera settings persist. Axis swaps, button remapping and device/glyph selection are unavailable in the shipped Deck profile.
- Steam Input must emit a standard virtual gamepad: axes 0/1 move, 2/3 look, with standard buttons. Raw-driver guessing is bypassed for this Linux profile. Stick movement or a fresh button can select a late virtual pad when the current pad is idle. Held buttons require release after reconnect; axes work immediately. Disconnecting pauses the island.
- View (▣) opens the town book. ☰ opens the desktop pause menu.
- One complete A prompt is shown at a time. D-pad left/right selects other nearby actions. B stands up or exits a room when available; in dialogues B goes back. Prompts follow the fixed Deck buttons.
- Prompts use Steam Deck symbols with fixed physical assignments. Other Linux controller compatibility is outside this release's acceptance scope.
- Gecko tones and the pulsing cricket WAV are retired in both editions. Sparse, low filtered-noise calls keep the night quiet without pitched electronic beeps. Rain, waves and ferry signals remain.
- D-pad down toggles the HUD with the island preset. F8 does the same on a keyboard; F10 opens the pause menu.
- Island contains Explore, Town book, Bag, Go home, Save and How to play as six illustrated icon tiles. People selects a resident from portrait cards. Settings contains controls, display, updates and a confirmed Save & quit. X quick-saves while paused.
- Existing named game slots are retained in the app profile. Disk snapshots keep a previous copy under the application data saves directory. Game updates do not replace this directory.
- ☰ → People switches between the island's residents, using each person's appearance, home and saved position. Selection is also available before starting. Nighttime starts use the selected person's bed; night workers retain their own schedules. A or the left stick gets out of bed. ☰ → Island → Go home returns to their address, and a residential front door opens the same bedroom. Workplace residences and cabins retain their normal public access.
- Families keep their existing shared addresses; each playable person has an owned bed. Additional scene residents use existing vacant addresses. Identity, personal checkpoints and disputes persist with the normal save.
- Both editions are peaceful: festival bouts, tournaments, spectating, personal quarrels and the combat-dependent cave descent have been withdrawn. Hurtful conversations end without fighting; apologies and relationships remain. Old combat saves recover safely ashore and keep money, possessions and identity.

## Installed-game design

Linux/Steam Deck is the first development and test platform; macOS, iPad and iPhone ports are planned. The icon catalogue associates original cross-platform SVGs with semantic SF Symbol names for future native Apple shells. See the [interface audit](docs/INTERFACE-AUDIT-2026-10-18.md) for reference research, the visual direction, input decisions and acceptance limits.

## Shared world integration

0.2.8 combines the published 0.2.7 controls and patch updater with the browser world's compact Minato, consolidated occupied households, Sakura office and internal stairs, refined houseboat, scenery and indoor visibility/stability changes. The canonical household registry supplies the playable roster; unassigned background figures do not claim removed vacant homes. Existing save slots and the application profile remain intact.

0.2.10 carries the web world of 19 October: the consolidated cast of 26 in 14 households (the roster the People page lists), the docks, Minato Police Station, the tempers, moves and pair poses, Sakura under Thuan and the dressed lots. Old saves migrate; a renamed resident goes on as the live person and the retired fall back to Johansson.

0.2.11 carries the web world of 20 October: Sakura's small upstairs office and rest room, its rebuilt office by the till, tap-to-walk into the office, the stair camera, one storey loaded at a time, no flashing surfaces across Minato, the patrol car, proper bicycles and the dock workshop's benches. The browser edition became a lighter demo; the Linux edition still runs every resident's full day, the trade and the machinery.

0.2.12 carries the web world of 21 October: one ground system across the island (kerbs, pavers, quays, lanes with gutters, beach and lawns), the quiet HUD, Sakura's stair as a passage to an office entered only from inside, the rebuilt parked cars, Nakamura Zenzai's makeover, Higa Liquor and the coin laundry with their staff, the upgraded police station and the reworked Harbour Park. The Linux edition still runs every resident's full day, the trade and the machinery.

0.2.13 carries main b51ef619 of 21 October: separate school, Community Hall and clinic buildings, Nils's study on Kitano-jima, the compact shared Minato/Sato dining interior, the walnut back bar and seated drinking animation. Linux retains its full simulation, controller interface, playable residents, owned beds, save profile and updater. The independent ferry timetable was still pending in that release. The evening liquor-shop bench is not reliably occupied; the claim in the 0.2.12 notes was too strong.

0.2.14 clears inherited centre anchors from the Linux action rail, keeping it in the right-hand column already reserved by the captions. Extended acceptance checks rectangle intersections on both axes, approaches the actual home door before pressing B, and compares selected drawings with the roster's authored-avatar mapping (Mac deliberately retains the former drawing). Physical Steam Deck acceptance remains pending.

The cycling and Thuan storage-room minigames are retired in both editions. Linux no longer bundles the separate storage game. Normal shopping, stocking routines and decorative bikes remain.

Development comparisons and release status are recorded at [Linux Port](https://nj22az.github.io/linux-port/).

## Updates

☰ → Settings → Check for updates connects to this repository's Linux release channel on request. A newer build downloads into a separate version folder and is checked against its published SHA-256 and byte count. Save & restart switches to that version. The previous version is retained. Checking for updates requires internet; playing the installed game does not.

The terminal installer shows a vending-machine delivery animation during upgrades, including actual download progress and verification stages. Redirected logs are plain; set JOHANSSON_NO_ANIMATION=1 for quiet terminal output or NO_COLOR=1 to omit color. The launcher gains the new original vending-machine icon after an installer-managed update starts. Existing Steam shortcuts may keep Steam's cached custom artwork; the release also includes the PNG for manual artwork selection.

0.2.7 is the full bootstrap update that installs patch support. Later releases publish a patch from the immediately previous version when the Electron runtime matches; Settings → Updates shows the selected download type and MiB before downloading. Only changed shell/game files and assets travel. Added files, removed files and file modes are recorded in a SHA-256 inventory. The updater checks the installed base, stages a separate target, verifies every target file and switches only on Save & restart. The previous installation and save profile remain intact. A modified base, skipped version or engine change uses the complete package; a corrupt patch fails without switching. The standalone installer remains a complete download for fresh installs and repairs, and prints the target version in the terminal.

The vending-machine icon is launcher artwork. It is absent from the game's title/loading screen and pause header. The installer sets the Linux desktop shortcut icon and prints the PNG path for Steam shortcut artwork; existing Steam shortcuts can cache their prior artwork and may need it selected manually in Steam Desktop Mode.

Menus use the physical D-pad, left stick or left trackpad. Gamepad activity hides the cursor; deliberate mouse movement/clicks restore it. Idle drift does not steal the pointer. The guide lists exploration, inspection, camera and menu controls.

**Apply the trackpads layout:** run the current installer in Desktop Mode, then launch Johansson World from Steam Library → Non-Steam. For an existing installation, `sh install.sh --steam` repairs the shortcut and layout without downloading the game. Steam closes briefly before its files are changed. The installer writes the original local template `controller_base/templates/controller_neptune_johansson_world.vdf` and selects it in each account's `configset_controller_neptune.vdf`, preserving other games and first-run backups. Steam / Quick Access remain system controls; rear paddles retain Steam Input's unassigned default. The in-game updater replaces the app but cannot change a running Steam client's layout: run the installer once after upgrading from 0.2.20.

Version 0.2.21 targets Steam Deck only. Automated fixtures check installer files and virtual gamepad output; physical Deck acceptance, including actual Steam template loading and trackpad feel, remains unverified.

Linux startup uses exact spatial filtering for paving and wire-obstruction queries. A local Chrome/Mac comparison measured title readiness at 10.7 seconds before and 5.6 seconds after; this is not a Steam Deck benchmark. Geometry, triangle hit tests, cel shading and the web edition's query paths are preserved.

## Development

Run npm ci in this folder. Rebuild the world runtime after source changes, then run node tools/package.mjs --site-only and npm start. npm run package makes the Linux tarball and release manifest. npm test checks controllers, saves and updater boundaries. npm run test:console exercises the actual packaged island with a simulated controller at 1280×800, 1280×720, 960×540 and 800×600; run playwright install chromium first. WORLD_CHROME can select a local Chromium executable. The Linux console acceptance workflow also runs the native Linux application and produces a downloadable candidate archive without changing the website or published release.

The release workflow builds the package and publishes a versioned GitHub prerelease. Physical Steam Deck performance and controller acceptance still need testing. The bundled rendering engine is Chromium/WebGL, not a native C scene renderer.

## Steam Deck profile

The desktop edition uses the full desktop scene even when Deck's touchscreen reports coarse input. It renders at 1× display resolution rather than supersampling a handheld screen, and keeps the existing cel shading and desktop shadows. Nearby assets stay resident after loading; local detail preloading looks 32 metres ahead, expands the loading radius by 1.8×, allows two concurrent jobs and caps outstanding decodes at four. It does not allocate RAM just to fill the machine. SteamOS and the GPU share the device's memory.

Linux has a full-screen title, a scrollable pause/settings interface with fixed navigation hints, and a separate controller HUD: no touch sticks or movement buttons, compact location/clock/context hints, controller button labels and larger focused menu choices. Pause → Performance & memory reports observed FPS, recent longest frame, draw calls, textures and resident memory by process. The target is 60 FPS; a physical Deck measurement is still required. The website's default streaming and UI are preserved.

0.2.15 integrates the owner-approved Minato Maru timetable from main e16d14ff: scheduled Harbour Line service, departure warnings and passenger choices, safe access closure, continuous walking aboard, safe-shore save migration and the chief/relief watch. The ferry returns to Minato overnight. It retains the 0.2.14 console corrections. Release verification and remaining physical-device checks are recorded in the integration PR and release evidence.

0.2.16 reads Bluetooth and other pads Chromium does not map in their Linux driver's layout, and lets the pad being pressed take over from an idle one. It is otherwise 0.2.15.
