# Johansson World — offline Linux edition

The complete island game runs locally in a standalone Electron Linux application using its existing Three.js renderer. This is the Steam Deck edition, not a C rewrite or a CubeXX build. World, residents, shops, ferry, interiors, Studio and stockroom assets are installed locally. Gameplay renderer requests to the internet are blocked.

## Controls and saves

- Left stick moves, right stick looks; A interacts, B backs out, Y opens inventory. R3 levels the camera; LB runs, RB jumps, RT zooms.
- Start opens a controller-navigable pause menu from both the title and the island. B returns one page; Start resumes. An always-visible Menu button and F10/Escape provide keyboard/mouse access.
- The first visit explains the controls and suggests first steps. Start → How to play reopens that guide.
- Start → Controls & camera has sensitivity, dead zone, FOV, invert Y, walking camera motion, live stick feedback, axis selection, stick swapping and button remapping. Assignments and camera settings persist with saves. Conflicting button assignments swap so other actions remain accessible.
- Standard and unmapped controllers are supported. A held button is ignored until released after reconnect/resume; stick drift does not lock out all controls. Disconnecting pauses the island and opens recovery controls.
- View opens the town book. Start opens the desktop pause menu.
- L3 toggles the HUD. F8 does the same on a keyboard; F10 opens the pause menu.
- Save progress, resume, Harbour Festival, update and Save & quit are in the pause menu.
- Existing named game slots are retained in the app profile. Disk snapshots keep a previous copy under the application data saves directory. Game updates do not replace this directory.
- Harbour Festival is an optional side quest in the real island. Johansson, Thuan, Thao and Nhung are allies: none can fight another member of this group.

## Updates

Pause → Check for updates connects to this repository's Linux release channel on request. A newer build downloads into a separate version folder and is checked against its published SHA-256 and byte count. Save & restart switches to that version. The previous version is retained. Checking for updates requires internet; playing the installed game does not.

## Development

Run npm ci in this folder. Rebuild the world runtime after source changes, then run node tools/package.mjs --site-only and npm start. npm run package makes the Linux tarball and release manifest. npm test checks controllers, saves and updater boundaries. npm run test:console exercises the actual packaged island with a simulated controller at 1280×800, 1280×720, 960×540 and 800×600; run playwright install chromium first. WORLD_CHROME can select a local Chromium executable. The Linux console acceptance workflow also runs the native Linux application and produces a downloadable candidate archive without changing the website or published release.

The release workflow builds the package and publishes a versioned GitHub prerelease. Physical Steam Deck performance and controller acceptance still need testing. The bundled rendering engine is Chromium/WebGL, not a native C scene renderer.

## Steam Deck profile

The desktop edition uses the full desktop scene even when Deck's touchscreen reports coarse input. It renders at 1× display resolution rather than supersampling a handheld screen, and keeps the existing cel shading and desktop shadows. Nearby assets stay resident after loading; local detail preloading looks 32 metres ahead, expands the loading radius by 1.8×, allows two concurrent jobs and caps outstanding decodes at four. It does not allocate RAM just to fill the machine. SteamOS and the GPU share the device's memory.

Linux has a full-screen title, a scrollable pause/settings interface with fixed navigation hints, and a separate controller HUD: no touch sticks or movement buttons, compact location/clock/context hints, controller button labels and larger focused menu choices. Pause → Performance & memory reports observed FPS, recent longest frame, draw calls, textures and resident memory by process. The target is 60 FPS; a physical Deck measurement is still required. The website's default streaming and UI are preserved.
