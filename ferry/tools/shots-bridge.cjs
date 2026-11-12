// shots-bridge.cjs out-folder [only,views]: the same views of the navigation bridge every time, from the page itself on foot,
// drawn on the machine's own graphics card when Chromium can reach it (it says which it got). For the audit after each stage
// of the wheelhouse's refit (ferry/yard/design/wheelhouse-refit.md): one stage's pictures are put beside the last's.
//
//   node ferry/tools/shots-bridge.cjs /path/to/folder              (the site served on port 8765, or CHISUM_URL)
//   node ferry/tools/shots-bridge.cjs /path/to/folder helm,lever   (only those views)
//
// A view is an eye and what it looks at, both in the bridge's own measures (metres to port, metres from the first Chisum's
// transom, metres over the bridge deck: ferry/blender/bridge_place.py), a zoom, and what is worked for it: the file's
// inputs by name, true for open or running, or a number of steps for a rotary switch. The eye is put where the view says,
// not where a walker could stand: a close-up is taken from 0.6 m, as a person leaning in would see it.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

let SHIFT, DECK;                      // where the bridge stands in the ship: the file says (ship.bridge), since revision D
const VIEWS = [
  // name, eye, aim, zoom, worked
  ['helm', [0.0, 20.75, 1.62], [0.0, 23.2, 1.20], 1, {}],
  ['helm-low', [0.0, 20.55, 1.45], [0.0, 22.6, 0.95], 1, {}],
  ['chair-master', [1.05, 21.42, 1.36], [0.75, 23.0, 1.12], 1, {}],
  ['chair-officer', [-1.05, 21.42, 1.36], [-0.85, 23.0, 1.12], 1, {}],
  ['block-from-port', [2.55, 21.05, 1.55], [0.2, 22.55, 0.95], 1, {}],
  ['block-from-starboard', [-2.35, 20.95, 1.55], [-0.2, 22.55, 0.95], 1, {}],
  ['block-after-face', [0.6, 20.6, 0.95], [0.3, 22.3, 0.55], 1, {}],
  ['sofa', [0.55, 20.95, 1.55], [2.6, 22.1, 0.55], 1, {}],
  ['table', [-0.9, 21.0, 1.55], [-2.6, 22.45, 0.75], 1, {}],
  ['aft', [0.0, 22.0, 1.6], [0.0, 19.5, 1.15], 1, {}],
  ['aft-port', [-1.2, 21.9, 1.6], [2.2, 19.6, 1.1], 1, {}],
  ['aft-starboard', [1.2, 21.9, 1.6], [-2.2, 19.6, 1.0], 1, {}],
  ['deckhead', [0.0, 20.2, 1.5], [0.0, 22.4, 2.5], 1, {}],
  ['windows-port', [-0.6, 20.8, 1.6], [2.4, 23.0, 1.45], 1, {}],
  ['close-lever', [0.62, 21.80, 1.52], [0.36, 22.34, 1.02], 1, {}],
  // what is read is read over what is worked: the walker's own eye (1.6 m) behind the wheel, beside the stand, and from the room's after end
  ['over-levers-helm', [0.0, 20.90, 1.60], [0.15, 22.70, 1.02], 1, {}],
  ['over-levers-port', [0.80, 21.60, 1.60], [0.15, 22.60, 1.00], 1, {}],
  ['over-levers-starboard', [-0.75, 21.60, 1.60], [0.05, 22.60, 1.00], 1, {}],
  ['over-levers-aft', [-0.30, 20.00, 1.60], [0.10, 22.70, 1.05], 2, {}],
  ['over-levers-ahead', [0.35, 21.60, 1.60], [0.35, 22.70, 1.02], 1, { 'lever-engine-p': 3, 'lever-engine-s': 3 }],
  ['close-telephone', [1.25, 21.78, 1.42], [1.25, 22.26, 0.97], 1, {}],
  ['close-display', [-1.05, 22.02, 1.42], [-1.05, 22.56, 1.15], 1, {}],
  ['close-panel', [0.35, 21.92, 1.42], [0.35, 22.36, 0.98], 1, {}],
  ['close-clearview', [0.25, 22.35, 1.55], [0.0, 23.05, 1.52], 1, {}],
  ['close-chair-rail', [0.45, 21.0, 0.62], [1.02, 21.42, 0.05], 1, {}],
  ['close-chair', [0.2, 20.85, 1.45], [1.05, 21.5, 0.85], 1, {}],
  ['close-wheel', [0.55, 20.75, 1.45], [0.0, 21.45, 1.0], 1, {}],
  ['close-chart-table', [-1.35, 20.75, 1.55], [-1.5, 19.85, 0.98], 1, {}],
  ['pantry', [-1.55, 21.55, 1.5], [-2.7, 21.78, 0.55], 1, {}],
  ['pantry-open', [-1.55, 21.55, 1.5], [-2.7, 21.78, 0.55], 1, { 'cooler-door': true, 'pantry-cupboard': true }],
  ['close-coffee', [-1.95, 21.86, 0.80], [-2.68, 21.96, 0.60], 1, {}],
  // what is worked, worked: doors open, blinds down, a wiper and a clear-view screen running, chairs run aft and turned, the jug poured, the night
  ['worked-console', [-0.45, 21.15, 1.25], [-0.95, 22.3, 0.38], 1, { 'console-door-3s': true, 'console-door-4p': true, 'console-door-4s': true, 'console-door-5p': true, 'console-door-5s': true }],
  ['worked-telephone', [1.25, 21.78, 1.42], [1.25, 22.26, 0.97], 1, { 'handset-telephone': true }],
  ['worked-windows', [0.0, 20.75, 1.62], [0.0, 23.2, 1.35], 1, { 'blind-2': true, 'blind-5': true, 'wiper-centre': true, 'wiper-starboard': true, 'clear-view-port': true, 'handset-vhf': true }],
  ['worked-chairs', [0.0, 20.2, 1.75], [0.0, 21.6, 0.55], 1, { 'chair-master-slide': true, 'chair-master-turn': true, 'chair-officer-turn': true }],
  ['worked-coffee', [-1.95, 21.86, 0.80], [-2.68, 21.96, 0.60], 1, { 'coffee-machine': true, 'coffee-jug': true }],
  ['worked-aft', [0.6, 21.9, 1.6], [-0.9, 19.6, 0.8], 1, { 'chart-drawer-1': true, 'chart-drawer-3': true, 'locker-door-1': true, 'locker-door-3': true, 'table-drawer': true, 'binocular-box-lid': true }],
  ['worked-locker', [1.2, 21.3, 1.5], [2.0, 19.7, 0.5], 1, { 'locker-door-1': true, 'locker-door-2': true, 'locker-door-3': true, 'locker-door-4': true }],
  ['night-switches', [0.0, 20.75, 1.5], [0.0, 23.0, 1.2], 1, { 'dimmer-console': 1, 'dimmer-instruments': 2 }],
  ['wing-port', [4.3, 20.3, 1.62], [5.9, 22.8, 0.9], 1, {}],
  ['wing-port-in', [5.9, 21.9, 1.62], [3.0, 21.2, 1.3], 1, {}],
  ['wing-starboard', [-4.3, 20.3, 1.62], [-5.9, 22.8, 0.9], 1, {}],
  ['wing-starboard-in', [-5.9, 21.9, 1.62], [-3.0, 21.2, 1.3], 1, {}],
];

(async () => {
  const out = process.argv[2];
  if (!out) { console.log('usage: node ferry/tools/shots-bridge.cjs out-folder [only,views]'); process.exit(2); }
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
  await page.addStyleTag({ content: 'header.title, #panel, #panel-toggle, #card, #bar, #stick, #status, #help { visibility: hidden !important; }' });
  const gpu = await page.evaluate(() => { const gl = window.__ferry.look.renderer.getContext(), d = gl.getExtension('WEBGL_debug_renderer_info'); return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown'; });
  // On foot in the wheelhouse first: every deck in its place, the sea and the sky, the lens of the walk.
  const half = await page.evaluate(() => window.__ferry.ship.length / 2);
  ({ SHIFT, DECK } = await page.evaluate(() => ({ SHIFT: window.__ferry.ship.bridge.shift, DECK: window.__ferry.ship.bridge.deck })));
  // the wing control stations stand at the ship's side (ship.bridge.wing): from behind the levers, and from two metres abaft them
  const WS = (await page.evaluate(() => window.__ferry.ship.bridge.wing)) - 0.385;
  for (const [side, sx] of [['port', 1], ['starboard', -1]])
    VIEWS.push([`wing-station-${side}`, [sx * WS, 21.95, 1.60], [sx * WS, 22.80, 0.98], 1, {}], [`wing-station-${side}-aft`, [sx * (WS - 0.25), 20.60, 1.60], [sx * WS, 22.80, 1.00], 2, {}]);
  await page.evaluate(([z, DECK]) => { const f = window.__ferry; f.enterWalk(); f.walkTo(0, z, Math.PI, 0, DECK); }, [20.9 + SHIFT - half, DECK]);
  for (const [name, eye, aim, zoom, worked] of VIEWS) {
    if (!want(name)) continue;
    await page.evaluate(([eye, aim, zoom, worked, SHIFT, DECK, half]) => {
      const f = window.__ferry, L = f.look, cam = L.camera, T = cam.position.constructor;
      const P = p => new T(p[0], DECK + p[2], p[1] + SHIFT - half);
      // what is worked for this view: a door open, a thing running (the page's own inputs, as a tap leaves them); a
      // rotary switch turned so many steps from where it rests, and back there for the next view
      window.__homes = window.__homes || Object.fromEntries(Object.keys(f.state.inputs).filter(id => f.control(id) && f.control(id).steps).map(id => [id, f.control(id).at]));
      for (const id of Object.keys(f.state.inputs)) f.work(id, worked[id] === true);
      for (const [id, home] of Object.entries(window.__homes)) for (let k = 0; k < 8 && f.control(id).at !== home; k++) f.step(id);
      for (const [id, v] of Object.entries(worked)) if (typeof v === 'number') for (let k = 0; k < v; k++) f.step(id);
      for (let t = 0; t < 1.6; t += 0.1) { f.workAuto(0.1); if (f.workSteps) f.workSteps(0.1); }
      // the walker stands near the eye (the page lights and shows the place it is in), then the eye is put where the view says
      const e = P(eye);
      f.walkTo(e.x, e.z, Math.PI, 0, DECK);
      f.setWalkZoom(zoom, true);
      window.__pose = () => { cam.position.copy(e); cam.up.set(0, 1, 0); cam.lookAt(P(aim)); cam.updateMatrixWorld(); L.redraw(); };
      if (!window.__posing) { window.__posing = true; const tick = () => { if (window.__pose) window.__pose(); requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
      window.__pose();
    }, [eye, aim, zoom, worked, SHIFT, DECK, half]);
    await page.waitForTimeout(3400);                       // the eye takes a moment to open or close
    await page.screenshot({ path: path.join(out, name + '.png') });
    console.log(name);
  }
  console.log('drawn by', gpu);
  console.log(errors.length ? 'ERRORS ' + JSON.stringify(errors.slice(0, 4)) : 'no errors on the page');
  await browser.close();
})().catch(e => { console.log('FAILED ' + String(e).slice(0, 400)); process.exit(1); });
