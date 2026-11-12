# Tetsuo’s Workshop preview

12 November 2026. The entrance lives at `/temp/workshop/`. The existing `/temp/` homepage links to it. Erik’s motor routine remains a standalone link under `/motor-90l/workshop/`.

- `scene.js` stages the exterior and instrument room. Quayside and Workshop door are positions in the same exterior scene. Workbench cuts to the instrument bench. Each view has a fragment URL and a rendered still for WebGL fallback.
- `assets/` adapts the façade, footprint, bench and light-pool modules from Johansson Town commit [`8a9b2e09`](https://github.com/nj22az/johansson-town/tree/8a9b2e09fa5aebc3a9cd988bebd319e11772ec91). The portable bench uses the site's bundled Three.js and preserves the original instrument and drawer state. The visitor can switch the lamp, select the scope input and open the drawer. The preview adds the quay dressing, exterior details, room shell and camera positions.
- The Sakura Godot demo files are outside this preview’s dependencies.

Browser review ran on `development` at [`f7a2d55`](https://github.com/nj22az/nj22az.github.io/commit/f7a2d5551a8633ef2f22ebd50958545dd99b020c). [Chromium run and screenshots](https://github.com/nj22az/nj22az.github.io/actions/runs/43324071940) passed at 1440 × 990 and 390 × 844. The checks covered three distinct rendered camera views, bench state feedback, asset responses, horizontal overflow, round-trip navigation, WebGL fallback and playback of the published Erik lesson. Mobile checks used emulation. A physical phone and Safari remain untested.

The release contains the preview route and this handover. Review it through `/temp/` before deciding whether any part belongs on the production homepage.
