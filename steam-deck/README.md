# Johansson World — offline Linux edition

The complete island game runs locally in a standalone Electron Linux application using its existing Three.js renderer. This is the Steam Deck edition, not a C rewrite or a CubeXX build. World, residents, shops, ferry, interiors and Studio assets are installed locally. Gameplay renderer requests to the internet are blocked.

## Controls and saves

- Left stick moves, right stick looks; A interacts, B backs out, Y opens inventory. R3 levels the camera; R2 runs, X jumps, L2 looks closely. Existing saved assignments are preserved; “Use island controls” applies the new defaults.
- The Deck’s ☰ Menu button opens pause from both the title and the island. L1/R1 switches Island, People and Settings; B returns a page or resumes from a section. ☰ always resumes. An always-visible Menu button and F10/Escape provide keyboard/mouse access.
- The first visit explains the controls and suggests first steps. ☰ → Island → How to play reopens that guide.
- ☰ → Settings → Controls & camera has sensitivity, dead zone, FOV, invert Y, walking camera motion, live stick feedback, axis selection, stick swapping and button remapping. Assignments and camera settings persist with saves. Conflicting button assignments swap so other actions remain accessible.
- Standard and unmapped controllers are supported. A held button is ignored until released after reconnect/resume; stick drift does not lock out all controls. Disconnecting pauses the island and opens recovery controls.
- View (▣) opens the town book. ☰ opens the desktop pause menu.
- One complete A prompt is shown at a time. D-pad left/right selects other nearby actions. B stands up or exits a room when available; in dialogues B goes back. Prompts follow remapped physical buttons.
- Symbols automatically follow the reported controller: Steam Deck, Xbox, PlayStation or Nintendo. Unknown face buttons use a four-position diamond with the required position highlighted. A persistent manual override handles devices translated by Steam Input. Nintendo labels reflect physical Gamepad positions; confirm/back are not silently swapped.
- Gecko tones and the pulsing cricket WAV are retired in both editions. Sparse, low filtered-noise calls keep the night quiet without pitched electronic beeps. Rain, waves and ferry signals remain.
- D-pad down toggles the HUD with the island preset. F8 does the same on a keyboard; F10 opens the pause menu.
- Island contains Explore, Town book, Bag, Go home, Save and How to play as six illustrated icon tiles. People selects a resident from portrait cards. Settings contains controls, display, updates and a confirmed Save & quit. X quick-saves while paused.
- Existing named game slots are retained in the app profile. Disk snapshots keep a previous copy under the application data saves directory. Game updates do not replace this directory.
- ☰ → People switches between the island's residents, using each person's appearance, home and saved position. Selection is also available before starting. Nighttime starts use the selected person's bed; night workers retain their own schedules. A or the left stick gets out of bed. ☰ → Island → Go home returns to their address, and a residential front door opens the same bedroom. Workplace residences and cabins retain their normal public access.
- Families keep their existing shared addresses; each playable person has an owned bed. Additional scene residents use existing vacant addresses. Identity, personal checkpoints and disputes persist with the normal save.
- Linux no longer offers recurring festival fights. Conversations offer an explicit “Lose your temper…” choice: three warnings precede a fourth insult starting a personal quarrel. Apologising or leaving avoids escalation; tempers decay and a cooldown prevents immediate repeated fights. Quarrels grant no festival rewards. Children and the established Johansson/Thuan/Thao/Nhung alliance do not fight.

## Installed-game design

Linux/Steam Deck is the first development and test platform; macOS, iPad and iPhone ports are planned. The icon catalogue associates original cross-platform SVGs with semantic SF Symbol names for future native Apple shells. See the [interface audit](docs/INTERFACE-AUDIT-2026-10-18.md) for reference research, the visual direction, input decisions and acceptance limits.

## Linux island redesign direction

This is a proposal for the next geography pass, not a change to the current coastline or ferry timetable. The web edition keeps its existing world.

The current canonical cast has 31 people. Its home registry lists 17 vacant addresses, including all four Fumoto homes and two of the four Kitahama flats. Hoshizaki's three simple building shells do not yet have registered households. The road plan combines Main Street, Kitahama's offset lane grid, the coastal circuit and a separate paved circuit around almost every building; even partitioned paving therefore reads as several competing networks.

- Keep Minato compact: harbour, shopping street and occupied residential blocks form one town. Keep a small inhabited Hoshizaki fishing village, with a short rural stretch between village and town. Reduce the oversized northern land mass instead of filling it with more shells.
- Author one street graph on a common alignment. Main Street is the spine, with a small number of cross streets and back lanes. Give each door a short approach to a shared lane. Retire redundant building circuits and duplicate parallel lanes. Paving, kerbs, map, walking, traffic, lamps and drains must consume that same graph.
- Plan households before houses. Preserve established families and housemates; attach every live character to a real home and bed. Retain only occupied houses plus at most one deliberate vacancy. Surplus lots become connected gardens, allotments or shoreline; surplus flat space becomes shared living space. Put actual fishing households in Hoshizaki instead of adding anonymous villagers.
- Keep the existing Kitano-jima crossing as a real destination. A subsequent small farming island can reuse Fumoto's co-op, well, fields and homes with assigned residents; a later outer island can provide a lighthouse, beach and nature walks. Each island needs a reason to visit, an accessible berth, a return service and useful activity before it is added to the ferry menu.
- Stream each island as a separate world area, retaining resident/home identities and saves while unloading distant interiors, colliders and AI. Measure frame time and memory before/after on Linux; fewer houses and meshes alone are not proof of a performance gain.

Acceptance for that pass: a readable overview map, no stacked road surfaces, continuous street junctions and door access, no unassigned residents or anonymous empty houses, safe migration of existing checkpoints, and a complete controller-operated outward/return ferry trip. The coastline, roads, terrain, homes and navigation should move together; shrinking only the rendered land would leave invisible walking ground and broken addresses.

The cycling and Thuan storage-room minigames are retired in both editions. Linux no longer bundles the separate storage game. Normal shopping, stocking routines and decorative bikes remain.

Development comparisons and release status are recorded at [Linux Port](https://nj22az.github.io/linux-port/).

## Updates

☰ → Settings → Check for updates connects to this repository's Linux release channel on request. A newer build downloads into a separate version folder and is checked against its published SHA-256 and byte count. Save & restart switches to that version. The previous version is retained. Checking for updates requires internet; playing the installed game does not.

## Development

Run npm ci in this folder. Rebuild the world runtime after source changes, then run node tools/package.mjs --site-only and npm start. npm run package makes the Linux tarball and release manifest. npm test checks controllers, saves and updater boundaries. npm run test:console exercises the actual packaged island with a simulated controller at 1280×800, 1280×720, 960×540 and 800×600; run playwright install chromium first. WORLD_CHROME can select a local Chromium executable. The Linux console acceptance workflow also runs the native Linux application and produces a downloadable candidate archive without changing the website or published release.

The release workflow builds the package and publishes a versioned GitHub prerelease. Physical Steam Deck performance and controller acceptance still need testing. The bundled rendering engine is Chromium/WebGL, not a native C scene renderer.

## Steam Deck profile

The desktop edition uses the full desktop scene even when Deck's touchscreen reports coarse input. It renders at 1× display resolution rather than supersampling a handheld screen, and keeps the existing cel shading and desktop shadows. Nearby assets stay resident after loading; local detail preloading looks 32 metres ahead, expands the loading radius by 1.8×, allows two concurrent jobs and caps outstanding decodes at four. It does not allocate RAM just to fill the machine. SteamOS and the GPU share the device's memory.

Linux has a full-screen title, a scrollable pause/settings interface with fixed navigation hints, and a separate controller HUD: no touch sticks or movement buttons, compact location/clock/context hints, controller button labels and larger focused menu choices. Pause → Performance & memory reports observed FPS, recent longest frame, draw calls, textures and resident memory by process. The target is 60 FPS; a physical Deck measurement is still required. The website's default streaming and UI are preserved.
