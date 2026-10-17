# Ferry Deck Fighters

A separate native 3D fighting-game prototype with **Thao and Thuan**, set on the **Minato Maru car deck** from Johansson World. Primary target: **Anbernic RG CubeXX (Linux/H700)**. Linux desktop is the development target. No browser or JavaScript runtime is required.

This is the first playable foundation, not a finished game or a certified PortMaster package. The 60 fps hardware target is **not yet measured on a CubeXX**.

![Native prototype](screenshots/arena.png)

## Implemented

- Two selectable fighters: Thao (white tee, blue shorts, high ponytail) and Thuan (yellow flower blouse, navy trousers, rose glasses, braids).
- Fully 3D arena and movement; opponents automatically face one another.
- Jab, kick, frontal guard, dodge with a limited invulnerable window, recovery, hit stun and hit stop.
- Computer opponent, passive training opponent, 60-second rounds and first to two wins.
- Square-screen HUD, title, pause, results and fighter switching.
- Keyboard and SDL2 standard controller input, controller reconnection and pause on focus loss.
- Small synthesised hit/block sounds; audio is optional.
- Fixed 60 Hz combat simulation independent of rendering cadence.
- GLES 2.0 compatible vertex-colour renderer. Static arena geometry is uploaded once; fighters and UI use two streaming batches. No textures, network requests, runtime asset downloads or shader-heavy effects.

## Build and run on Linux desktop

Requires a C99 compiler, make and the SDL2 runtime (`libSDL2-2.0.so.0`). SDL2 development headers are not required: the small platform adapter loads a narrow documented SDL2 ABI dynamically.

```sh
make
make test
./build/ferry-deck-fighters
```

On Debian/Ubuntu, the runtime package is normally `libsdl2-2.0-0`. Use `--gles` on a system with OpenGL ES 2.0 and EGL drivers. `--fullscreen` preserves a square viewport.

| Action | Keyboard | SDL controller position |
|---|---|---|
| Move / sidestep | WASD / arrows | Left stick / D-pad |
| Jab | J | X / west |
| Kick | K | Y / north |
| Guard | Hold L | Hold A / south |
| Dodge | Space + direction | B / east + direction |
| Start / pause / continue | Enter | Start |
| Pause / title / quit title | Escape | Back / Select |
| Switch player (title or pause) | Tab | L1 |
| Training (title or pause) | T | R1 |

The controller labels shown are SDL's standard layout; CubeXX physical button mapping still needs verification. Either fighter is playable, with the other controlled by the computer. Two human players and multiplayer are not implemented.

## ARM64 build

Using Zig 0.13.0 as a cross compiler:

```sh
make CC='zig cc -target aarch64-linux-gnu.2.17 -mcpu=cortex_a53' \
  CFLAGS='-O2 -std=c99 -Wall -Wextra -Wpedantic' \
  -B
```

This compiles against glibc 2.17 and the Cortex-A53 instruction baseline. The resulting executable needs an ARM64 Linux userspace with that glibc baseline, SDL2, and functioning EGL/GLES drivers. It has not been executed on the handheld. Stock and custom firmware differ: see [hardware acceptance](docs/HARDWARE.md).

## Inspect the current prototype

[Four-view screenshot sheet](screenshots/Ferry_Deck_Fighters_Inspection.png), [title](screenshots/title.png), [jab](screenshots/jab.png), [kick](screenshots/kick.png), [guard](screenshots/guard.png), [result](screenshots/victory.png).

These are captures of the actual native renderer at 720 x 720, using deterministic staged game states for comparison. They are not concept art. `--demo` runs AI versus AI using the real combat simulation. Regenerate screenshots on a Linux Mesa development machine with:

```sh
make
python3 -m pip install Pillow
python3 tools/capture_screenshots.py
```

Pillow is used only by the screenshot tool, not by the game.

## Source relationship and limits

The character palettes, clothing and distinguishing features were transcribed from `johansson-town/src/avatars/cast.js` at commit `0ca25b7dce3beef58ab1fd5cb84ba1629c032157`. These are new lightweight native interpretations; the exact World meshes, rig and wardrobe are not yet exported. The shared character export pipeline is a next step.

The ship dimensions and arrangement follow `johansson-town/src/world/ferry-model.js`: 34.5 x 8.4 m, side casings ending at station 20 m, bow houses beginning at station 30 m, a 4.6 m bow ramp and red/white vehicle barrier at station 29.3 m. The combat origin is station 24 m. The native ferry scene is a simplified recreation, with an added sparring rectangle, not an engineering model or a transfer of the entire ferry.

Open work: exact character asset transfer, animation polish, hand/hit-volume alignment, target controller mapping, CubeXX firmware packaging, device profiling, audio-device verification, throws/combos, accessibility settings and additional arenas. No main website/game files are modified by this project.
