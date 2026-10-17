# Johansson World — offline Linux edition

The complete island game runs locally in a standalone Electron Linux application using its existing Three.js renderer. This is the Steam Deck edition, not a C rewrite or a CubeXX build. World, residents, shops, ferry, interiors, Studio and stockroom assets are installed locally. Gameplay renderer requests to the internet are blocked.

## Controls and saves

- Left stick moves, right stick looks; A interacts, B backs out, Y opens inventory.
- View opens the town book. Start opens the desktop pause menu.
- L3 toggles the HUD. F8 does the same on a keyboard; F10 opens the pause menu.
- Save progress, resume, Harbour Festival, update and Save & quit are in the pause menu.
- Existing named game slots are retained in the app profile. Disk snapshots keep a previous copy under the application data saves directory. Game updates do not replace this directory.
- Harbour Festival is an optional side quest in the real island. Johansson, Thuan, Thao and Nhung are allies: none can fight another member of this group.

## Updates

Pause → Check for updates connects to this repository's Linux release channel on request. A newer build downloads into a separate version folder and is checked against its published SHA-256 and byte count. Save & restart switches to that version. The previous version is retained. Checking for updates requires internet; playing the installed game does not.

## Development

Run npm ci in this folder. Rebuild the world runtime after source changes, then run node tools/package.mjs --site-only and npm start. npm run package makes the Linux tarball and release manifest. npm test checks saves and updater boundaries.

The release workflow builds the package and publishes a versioned GitHub prerelease. Physical Steam Deck performance and controller acceptance still need testing. The bundled rendering engine is Chromium/WebGL, not a native C scene renderer.
