# Module 1 student acceptance — 16 October 2026

Scope: optional revision only. The original course week, ordinary submission and grading remain authoritative and unchanged.

## Observed on the published version

A desktop Chrome walkthrough completed all six exercises through visible controls, without teacher instructions: closed-load voltage 12.00 V; open-switch load voltage 0.00 V; source voltage with open switch 12.00 V; broken-return load voltage 0.00 V; series current 1.967 A for a 2 A ideal prediction; isolated resistance 6.2 Ω including leads.

Observed friction:

- Requesting a hint was necessary again after each operation because the hint disappeared on render.
- Return continuity was hidden inside a disclosure needed for exercise 4.
- Selecting a probe colour and then a terminal required repeated navigation between controls.
- The next-exercise control was far from the measurement feedback and allowed progression before any successful attempt.
- Changing the current socket while powered produced an error; its recovery required finding a separate supply control.
- The WebGL fallback retained a large empty viewport and camera controls with no effect.

The cloud browser reports WebGL disabled by its environment. This does **not** establish a production 3D defect. Its real rendered equipment could not be visually accepted there. No physical iPad was available.

## Supported changes

Persistent next-handgrip guidance now explains and performs **one named operation per click**, through the same instrument model as the detailed controls. It never predicts, measures or marks an exercise complete for the student. The student still supplies a prediction, unit and reason. Each probe also has a direct, labelled endpoint list; the 3D tap/drag controls remain available.

Return controls are visible. Circuit status distinguishes supply off, isolated source, open switch, broken return and the series bridge. Ordinary switch operation does not add a redundant power cycle. Rewiring retains the repository’s power-off guidance. Recovery explicitly disconnects probes before resetting protection; restarting cannot clear a tripped instrument. Every submitted attempt remains in the protocol.

Success places the next-exercise button beside the result. The exercise selector still permits revisiting any scenario. The fallback hides the unavailable viewport and camera controls, and opens the circuit diagram. The existing native work-view dialog and current diagnosis validation are preserved. Responsive endpoint lists avoid small drag targets; the schematic scales within its container.

## Verification

- `node --test sjoskolan/vecka-37/revision/*.test.mjs`: model, actual DOM events, guided progression, protection recovery, original preservation and export hashes.
- Browser suite: `node sjoskolan/multimetersimulator/node_modules/@playwright/test/cli.js test -c sjoskolan/vecka-37/revision/student-browser.config.mjs`.
- Three browser projects: desktop Chromium, phone Chromium with Pixel 7 viewport/touch emulation, and WebKit with iPad Mini viewport/touch emulation. These are browser-engine tests, **not physical-device certification**.
- Each browser journey uses only rendered guidance and controls, completes all six exercises, captures each instrument, checks page overflow and reload persistence, and tests direct probe lists, wrong-unit correction and tripped-protection recovery.
- CI retains screenshots, the rendered-3D/fallback state, failure traces and the HTML test report as `module-one-browser-evidence`.

Browser-run results will be recorded after the first CI run. Physical iPad Safari and interactive rendered-3D visual acceptance remain outstanding until separately observed.
