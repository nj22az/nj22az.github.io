# Hardware acceptance — RG CubeXX

## Established in this development environment

- Native x86-64 Linux executable builds with GCC using `-Wall -Wextra -Wpedantic`.
- Eleven combat test groups pass, including hit timing, guard, dodge, trading, bounds, pause, timeout, knockout and deterministic AI.
- Combat tests also pass AddressSanitizer and UndefinedBehaviorSanitizer. LeakSanitizer is disabled because the container cannot inspect `/proc` tasks.
- Native renderer runs offscreen through Mesa, with its GLES version forced to 2.0.
- Six 720 x 720 native framebuffer captures were generated and visually inspected. Capture reads use the ES 2.0 guaranteed RGBA/UNSIGNED_BYTE path.
- A 180-frame AI versus AI run completes with the real fixed-step simulation and renderer.
- ARM64 binary cross-compiles for Cortex-A53 and glibc 2.17. ELF architecture, interpreter and symbol baseline inspected.
- Current arena plus fighters: approximately 13,904 triangles, with guard effect approximately 14,288. Three main scene/UI draw batches. Vertex capacity is explicitly checked.

These observations are not CubeXX performance results. Desktop software rendering rates must not be presented as handheld benchmarks.

## Required before a device release

1. Record exact firmware name/version, 32/64-bit userspace, SDL2 version, available video backend, EGL/GLES implementation and controller mapping.
2. Launch the ARM64 build with `--gles --fullscreen`. Check that firmware's SDL2 library is on its loader path. The draft launcher is only a starting point, not a self-contained PortMaster package.
3. Verify the controller layout, analogue dead zone, D-pad, guard hold, dodge directions, Start/Select, hotplug and clean exit to the frontend.
4. Confirm legibility and framing on the 720 x 720 display. Move both fighters to all four playfield corners; check for camera obstruction and HUD overlap.
5. Record CPU/GPU frame times and frame pacing for at least ten minutes including hits, guard and results. Target is 60 fps / 16.67 ms, with thermal and battery observations. Reduce geometry or update costs only in response to measured bottlenecks.
6. Test audio output, silence/audio-device failure, suspend/resume and loss of window focus. No match simulation should advance during pause.
7. Package firmware-compatible SDL2/EGL dependencies and the verified launcher following the current PortMaster packaging requirements if distributing through PortMaster. Do not describe the current draft as approved or universally firmware-compatible.

## Next implementation priorities

1. Export the exact World character geometry/recipes into a portable asset format and preserve character identity across both games.
2. Refine attack animation to agree precisely with the reach, direction and active frames of the combat model.
3. Profile the prototype on the physical CubeXX before increasing visual complexity or declaring the performance target met.
