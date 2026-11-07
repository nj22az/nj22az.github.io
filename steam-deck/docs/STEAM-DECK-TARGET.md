# Steam Deck target — 18 October 2026

Primary sources: [Valve LCD specification](https://www.steamdeck.com/en/tech/deck), [Valve OLED specification](https://www.steamdeck.com/en/tech/oled).

Both have a 4-core/8-thread Zen 2 CPU, 8 RDNA 2 compute units, 16 GB shared RAM and a 1280×800 display. LCD refresh is 60 Hz; OLED supports up to 90 Hz. These specifications define a budget, not a measured performance result.

The Linux renderer caps its pixel ratio and ink-pass scale at 1, requests the high-performance GPU, keeps desktop scene/shadows and preloads nearby detail with bounded concurrency. The primary UI target is 1280×800, also checked at 1280×720, 960×540 and 800×600. Text is native and unaffected by imagery treatments. Gamepad navigation covers all normal menus.

Movement uses the existing 1/60-second simulation accumulator, bounded frame deltas, and elapsed-time camera/animation updates. Faster rendering must not accelerate walking or town time. Pausing/resuming resets elapsed time. Do not make a faster GPU run the world faster or burn memory by preloading everything.

Aim for stable 60 FPS with visible frame-time diagnostics. OLED can follow its display refresh; this release does not force an artificial 60 Hz gate that could introduce uneven cadence on a 90 Hz display. No physical Deck measurement has been made in this session. Real-device checks should cover arrival, a busy street, interiors, ferry, warm GPU operation, sleep/resume and battery profile before claiming a stable frame rate.

Demo route: use the Island guide to learn controls, visit Sakura and meet Thuận, enter a shop and return outside, then visit the harbour. Keep the route interactive; do not replace it with a staged video.
