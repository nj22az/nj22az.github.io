FERRY DECK FIGHTERS - NATIVE LINUX DEMO
Version: 2026.10.17.1

For Steam Deck / SteamOS and x86-64 Linux desktops.
This is a playable prototype, not a Steam Deck Verified release.

PORTABLE USE
Extract the complete folder. Keep bin/ and assets/ beside the launcher.
Run Launch-Ferry-Deck-Fighters.sh. No compilation or administrator rights.
If your file manager removes executable permission, enable it in Properties
or run: sh Launch-Ferry-Deck-Fighters.sh

STEAM DECK
In Desktop Mode, install with the GitHub installer or extract this package.
In Steam, use Add a Game > Add a Non-Steam Game. Choose Ferry Deck Fighters
from installed applications, or Browse to Launch-Ferry-Deck-Fighters.sh.
Leave forced Proton compatibility disabled. Select a Gamepad controller layout.
Return to Gaming Mode and launch. The square game has borders on a wide screen.

CONTROLS
Stick/D-pad: move and sidestep. X: punch; repeat after contact for a follow-up.
Y: kick. Hold A: guard. B + direction: dodge. Start: start/pause/continue.
Select: pause/title. L1: change fighter while paused/on title.
R1: training mode while paused/on title.

DEPENDENCIES
64-bit Linux with glibc 2.17 or later; libSDL2-2.0.so.0; libz.so.1;
working EGL/GLES2 drivers. The installer does not modify SteamOS or use sudo.
If startup fails, see ~/.local/state/ferry-deck-fighters/latest.log
(or the equivalent XDG_STATE_HOME location).

CREDITS AND SOURCE
Thao, Thuan and Minato Maru use shared Johansson World / Studio assets.
Original C99 game and procedural combat animation.
https://github.com/nj22az/nj22az.github.io/tree/codex/ferry-deck-fighters/ferry-deck-fighters
No Tekken code, models, sounds or animation data are included.

RG CUBEXX
This x86-64 download is for Steam Deck / PCs. The source project also has an
ARM64 CubeXX build; its installation package depends on the device firmware.
