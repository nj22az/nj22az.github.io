# Startup crash audit and iPhone simulation — 30 October 2026

Owner: game does not start properly and kicks the player out; audit and remedy. Follow-up: “Run a simulated iPhone”.

Branch `codex/world-startup-repair`, from current production `ff76aee1a30ff1d000bd5bb9ecf0475543915899`.
This work is in progress and not published. The separate Izakaya CAD repair (#410) is not included.

The connected cloud browser reaches the published title but WebGL context creation fails with GL_RENDERER Disabled.
That environment failure does not diagnose the owner's device. A real WebKit/Mesa CI test with Playwright's iPhone 13
profile is added to the World workflow: cold startup, live frames, orientation, warm reload and Izakaya entry.
It preserves the ordinary compiled runtime, full graphics, six Pixar residents and detail streaming.
Desktop WebKit with a mobile profile does not reproduce physical iOS process memory limits.

Audit findings, corrections and actual check results will be recorded here before completion.
