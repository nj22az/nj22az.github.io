# Bicycle acceptance

The CPU tests substitute the renderer and browser APIs. They cannot establish
that a visitor can ride the bicycle in the published frame loop.

## Real-browser check

Install Playwright as an authoring tool, as for `tools/render-resident-guide.mjs`:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
npm run test:bicycle:browser
TOWN_BICYCLE_URL=https://nj22az.github.io/johansson-town/ npm run test:bicycle:browser
```

`TOWN_CHROMIUM_PATH` selects an existing Chromium executable.
`TOWN_BROWSER_PROXY` optionally supplies a proxy URL.
`TOWN_BROWSER_ARTIFACTS` selects the output folder (default
`/tmp/town-bicycle-browser`). Playwright is never shipped to visitors.

The default command serves the checked-in **compiled runtime** over localhost.
The URL command exercises Pages. Both compare the source fingerprint and every
chunk in the boot/game dependency graph with the checkout before entering town.
A newer deployment or an older cached deployment must be reconciled with the
checkout before acceptance; the runner does not silently test different code.

Each run creates isolated desktop (1280 × 800) and phone (390 × 844, coarse pointer
and touch) contexts. The existing `?audit` teleport places the observer beside the
actual parked bicycle after standing from the Sakura opening. All subsequent
actions use real keyboard or touch events, without calling the simulation,
setting ride state or substituting WebGLRenderer. The runner checks:

- The ordinary interaction prompt and mount action.
- Forward movement from the parked position through the street collision logic.
- Right steering and the resulting camera heading.
- Visible rider/bicycle attachment and finite world transforms.
- Dismount, parking under the town parent and restoration of the previous view.
- Uncaught JavaScript errors, plus mounted, steering and dismounted screenshots.

The phone movement uses Chromium touch events on the actual virtual joystick.
The runner waits for observed movement/heading rather than assuming a frame rate.
SwiftShader permits WebGL correctness checks on machines without a GPU; it does
not establish hardware phone performance. Existing saves are isolated by fresh
browser contexts. No production audit APIs or gameplay code are added.

## Investigation on 30 September 2026

- Requested baseline: `be8924d56981918f4dd253a103fef6d067d5b1b6`.
- Inspected checkout: `04e0c30ad50de0e63371fafc68a3d8470d01a97b`.
  The intervening changes concern removable hats and curated openings, rather
  than a bicycle repair.
- Eight focused CPU bicycle tests and three runtime packaging tests passed.
- Pages returned source fingerprint
  `c96dd09101baa1a2b2e82628a7d69a2423a5589d70fcdde642645e4d35021b6a`,
  matching the checkout.
- The live HTML selected `runtime/game-DnnGu_6I.js`. The downloaded chunk and
  checkout file both had SHA-256
  `b99cab449387cddfea6ffd496b35ff4ca65eaae9b07c52234630d6073d587d1b`.
- The available cloud browser failed to initialise WebGL. A separate Chromium
  executable failed before page creation because the execution sandbox prohibits
  the local Unix sockets Chromium requires. The permission policy rejected an
  elevated launch. Neither result demonstrates a game bicycle defect.

The real-browser runner is prepared and syntax-checked, but **has not passed** in
this session. The reported failure remains unclassified and no source repair has
been made. Run both local and Pages acceptance in a Chromium-capable environment
before claiming a repair, then change only the demonstrated cause and rebuild the
runtime with `npm run build:runtime`.
