// shots-machinery.cjs out-folder [only,views]: the same views of the machinery spaces every time, from the page itself on foot,
// drawn on the machine's own graphics card when Chromium can reach it (it says which it got). For the audit before and after
// each stage of the machinery complex (ferry/yard/design/machinery-complex-audit.md), as shots-bridge.cjs is for the bridge.
//
//   node ferry/tools/shots-machinery.cjs /path/to/folder                   (the site served on port 8765, or CHISUM_URL)
//   node ferry/tools/shots-machinery.cjs /path/to/folder er-centre,ecr     (only those views)
//
// A view is an eye and what it looks at, both in the ship's own measures as the arrangement and the machinery's design basis
// give them: metres to port of the centreline, metres from the transom, metres above the keel. Then a zoom, and what is
// worked for it. The eye is put where the view says; the walker is stood on the floor nearest under it, so that the page
// lights the place.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const VIEWS = [
  // name, eye, aim, zoom, worked. The engine room is 16.8 to 38.4 m from the transom: tank top 1.6 m, platform 4.0 m, main deck 6.6 m.
  ['er-from-walkway', [0.0, 25.8, 5.6], [0.0, 34.0, 2.4], 1, {}],              // from the platform's forward edge, before the control room's windows, looking forward and down
  ['er-centre-aft', [0.0, 31.0, 3.2], [0.0, 24.0, 3.6], 1, {}],                // on the tank top on the centreline, looking aft at the platform
  ['er-centre-fwd', [0.0, 27.5, 3.2], [0.0, 38.0, 2.6], 1, {}],                // and forward, to the bulkhead of the auxiliary engine room
  ['er-port-engine-place', [5.0, 36.5, 3.2], [2.6, 30.0, 2.6], 1, {}],         // where the port main engine is to stand (28.65 to 35.29 m, 0.89 to 4.41 m to port)
  ['er-port-gallery', [7.6, 33.0, 5.6], [1.0, 27.0, 3.0], 1, {}],              // on the port gallery, looking inboard and aft
  ['er-stbd-gallery', [-7.6, 27.0, 5.6], [-1.0, 35.0, 2.6], 1, {}],            // on the starboard gallery, looking inboard and forward
  ['er-stair-port', [2.6, 34.5, 3.2], [6.2, 30.5, 3.6], 1, {}],                // the stair from the port gallery to the tank top
  ['er-shaft-space', [3.4, 24.6, 3.0], [3.4, 18.5, 2.3], 1, {}],               // under the platform, along the port shaft line
  ['er-under-main-deck', [0.0, 26.2, 6.2], [0.0, 33.0, 1.7], 1, {}],           // from just under the main deck, down onto the whole floor
  ['platform-passage', [0.0, 17.6, 5.6], [0.0, 25.0, 5.2], 1, {}],             // the centre passage between the platform's rooms
  ['platform-walkway', [-8.6, 25.75, 5.6], [6.0, 25.6, 5.1], 1, {}],           // along the walkway before the control room's and the store's forward walls
  ['ecr-forward', [4.2, 22.0, 5.6], [3.6, 26.5, 5.2], 1, {}],                  // in the engine control room, looking forward through its windows
  ['ecr-from-door', [1.5, 21.6, 5.6], [6.6, 24.6, 5.0], 1, {}],
  ['ecr-windows-outside', [3.6, 28.2, 5.6], [3.6, 25.2, 5.3], 1, {}],          // the control room's windows from the gallery: the platform's rail before them
  ['switchboard-room', [1.5, 17.4, 5.6], [6.6, 20.4, 5.0], 1, {}],
  ['workshop', [-1.5, 17.4, 5.6], [-6.6, 20.4, 5.0], 1, {}],
  ['engine-store', [-1.5, 21.6, 5.6], [-6.6, 24.6, 5.0], 1, {}],
  ['aux-engine-room', [0.0, 39.2, 3.2], [0.0, 46.0, 2.8], 1, {}],
  ['aux-engine-room-aft', [2.0, 46.0, 3.2], [-2.0, 39.0, 3.0], 1, {}],
  ['steering-gear', [0.0, 6.6, 6.3], [1.5, 3.4, 5.1], 1, {}],                  // the one machinery space that is fitted: for comparison
];

(async () => {
  const out = process.argv[2];
  if (!out) { console.log('usage: node ferry/tools/shots-machinery.cjs out-folder [only,views]'); process.exit(2); }
  const only = process.argv[3] ? new Set(process.argv[3].split(',')) : null;
  const want = name => !only || only.has(name);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1, colorScheme: 'light' });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errors.push(m.text()); });
  await page.goto((process.env.CHISUM_URL || 'http://localhost:8765/ferry/') + '?shots=' + Date.now());
  await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready'), null, { timeout: 180000 });
  await page.addStyleTag({ content: 'header.title, #panel, #panel-toggle, #card, #bar, #stick, #status, #help, #map-mini { visibility: hidden !important; }' });
  const gpu = await page.evaluate(() => { const gl = window.__ferry.look.renderer.getContext(), d = gl.getExtension('WEBGL_debug_renderer_info'); return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown'; });
  // On foot in the wheelhouse first: every deck in its place, the sea and the sky, the lens of the walk.
  const half = await page.evaluate(() => window.__ferry.ship.length / 2);
  // The model's heights are over her waterline: the bridge deck is 21.6 m above the keel (ga.py), so the keel is this far under it.
  const KEEL = (await page.evaluate(() => window.__ferry.ship.bridge.deck)) - 21.6;
  await page.evaluate(([z, y]) => { const f = window.__ferry; f.enterWalk(); f.walkTo(0, z, Math.PI, 0, y); }, [31.0 - half, KEEL + 1.6]);
  for (const [name, eye, aim, zoom, worked] of VIEWS) {
    if (!want(name)) continue;
    await page.evaluate(([eye, aim, zoom, worked, KEEL, half]) => {
      const f = window.__ferry, L = f.look, cam = L.camera, T = cam.position.constructor;
      const P = p => new T(p[0], KEEL + p[2], p[1] - half);
      // what is worked for this view: a door open, a thing running (the page's own inputs, as a tap leaves them); a
      // rotary switch turned so many steps from where it rests, and back there for the next view
      window.__homes = window.__homes || Object.fromEntries(Object.keys(f.state.inputs).filter(id => f.control(id) && f.control(id).steps).map(id => [id, f.control(id).at]));
      for (const id of Object.keys(f.state.inputs)) f.work(id, worked[id] === true);
      for (const [id, home] of Object.entries(window.__homes)) for (let k = 0; k < 8 && f.control(id).at !== home; k++) f.step(id);
      for (const [id, v] of Object.entries(worked)) if (typeof v === 'number') for (let k = 0; k < v; k++) f.step(id);
      for (let t = 0; t < 1.6; t += 0.1) { f.workAuto(0.1); if (f.workSteps) f.workSteps(0.1); }
      // the walker stands near the eye (the page lights and shows the place it is in), then the eye is put where the view says
      const e = P(eye);
      window.__stood = f.walkTo(e.x, e.z, Math.PI, 0, e.y - 1.6);       // on the floor under the eye, if there is one
      f.setWalkZoom(zoom, true);
      window.__pose = () => { cam.position.copy(e); cam.up.set(0, 1, 0); cam.lookAt(P(aim)); cam.updateMatrixWorld(); L.redraw(); };
      if (!window.__posing) { window.__posing = true; const tick = () => { if (window.__pose) window.__pose(); requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
      window.__pose();
    }, [eye, aim, zoom, worked, KEEL, half]);
    await page.waitForTimeout(3400);                       // the eye takes a moment to open or close
    await page.screenshot({ path: path.join(out, name + '.png') });
    console.log(name + ((await page.evaluate(() => window.__stood)) === null ? '   (no floor under this eye: the walker stands where it stood)' : ''));
  }
  console.log('drawn by', gpu);
  console.log(errors.length ? 'ERRORS ' + JSON.stringify(errors.slice(0, 4)) : 'no errors on the page');
  await browser.close();
})().catch(e => { console.log('FAILED ' + String(e).slice(0, 400)); process.exit(1); });
