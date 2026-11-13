// shots-boatdeck.cjs out-folder [only,views]: the same views of the lifeboat stations and the guard at their open deck edge every
// time, from the page itself, drawn on the machine's own graphics card when Chromium can reach it (it says which it got). As
// shots-machinery.cjs is for the machinery spaces.
//
//   node ferry/tools/shots-boatdeck.cjs /path/to/folder                 (the site served on port 8765, or CHISUM_URL)
//   node ferry/tools/shots-boatdeck.cjs /path/to/folder along,folded    (only those views)
//
// A view is an eye and what it looks at, in the ship's own measures: metres to port of the centreline, metres from the
// transom, metres above the keel (the boat deck is 16.0 m above it; each station's middle is 86.0 m from the transom, its deck
// edge 9.6 m off the centreline). The port station (No 2, the rescue boat) is worked; the starboard one (No 1, under her
// cover) is shown as the owner's picture of 13 November had it. Then what is worked for it: `tap` the things a tap works, `order` what has keys (and how long to
// wait for it, in seconds).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const GUARD = 'lifeboat-p-guard', DAVIT = 'lifeboat-p-davit';
const VIEWS = [
  // name, eye, aim, what is worked
  ['starboard', [-17.5, 79.5, 20.5], [-9.6, 86.0, 16.6], {}],                               // as the owner's picture: No 1 from outboard and aft, the open edge under the boat
  ['outside', [17.5, 79.5, 20.5], [9.6, 86.0, 16.6], {}],                                   // the same of No 2, to port
  ['along', [8.4, 82.4, 17.6], [9.6, 87.0, 16.6], {}],                                      // on the boat deck, along the edge: the guard standing
  ['hinge', [9.05, 86.55, 16.45], [9.62, 86.0, 16.12], {}],                                 // a stanchion's hinge, its locking pin
  ['end-post', [9.1, 82.9, 17.05], [9.62, 82.2, 16.85], {}],                                // the chain's hook in the end rail's eye
  ['folded', [8.4, 82.4, 17.6], [9.6, 87.0, 16.6], { tap: [GUARD] }],                       // folded flat on the deck, each head on its pad
  ['folded-outside', [17.5, 79.5, 20.5], [9.6, 86.0, 16.6], { tap: [GUARD] }],
  ['boat-out', [17.5, 79.5, 20.5], [9.6, 86.0, 16.6], { tap: [GUARD], order: [[DAVIT, 46, 17]] }],     // and the boat turned out over the folded guard
];

(async () => {
  const out = process.argv[2];
  if (!out) { console.log('usage: node ferry/tools/shots-boatdeck.cjs out-folder [only,views]'); process.exit(2); }
  const only = process.argv[3] ? new Set(process.argv[3].split(',')) : null;
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
  const half = await page.evaluate(() => window.__ferry.ship.length / 2);
  // The model's heights are over her waterline: the bridge deck is 21.6 m above the keel (ga.py), so the keel is this far under it.
  const KEEL = (await page.evaluate(() => window.__ferry.ship.bridge.deck)) - 21.6;
  await page.evaluate(([z, y]) => { const f = window.__ferry; f.enterWalk(); f.walkTo(8.0, z, Math.PI, 0, y); }, [84.0 - half, KEEL + 16.0]);
  // as she lies before each view: the davits in, then the guard up
  const rest = async () => {
    await page.evaluate(D => window.__ferry.order(D, 0), DAVIT);
    await page.waitForFunction(D => window.__ferry.state.inputs[D] === 0, DAVIT, { timeout: 40000 });
    await page.evaluate(G => { const f = window.__ferry; if (f.state.inputs[G] > 0) f.tap(G); for (let t = 0; t < 1.6; t += 0.1) f.workAuto(0.1); }, GUARD);
  };
  for (const [name, eye, aim, worked] of VIEWS) {
    if (only && !only.has(name)) continue;
    await rest();
    await page.evaluate(ids => { const f = window.__ferry; for (const id of ids) f.tap(id); for (let t = 0; t < 1.6; t += 0.1) f.workAuto(0.1); }, worked.tap || []);
    for (const [id, to, seconds] of worked.order || []) { await page.evaluate(([id, to]) => window.__ferry.order(id, to), [id, to]); await page.waitForTimeout(seconds * 1000); }
    await page.evaluate(([eye, aim, KEEL, half]) => {
      const f = window.__ferry, L = f.look, cam = L.camera, T = cam.position.constructor;
      const P = p => new T(p[0], KEEL + p[2], p[1] - half);
      f.walkTo(8.0, 84.0 - half, Math.PI, 0, KEEL + 16.0);                // the walker stands on the boat deck: the page shows and lights the place it is in
      f.setWalkZoom(1, true);
      const e = P(eye);
      window.__pose = () => { cam.position.copy(e); cam.up.set(0, 1, 0); cam.lookAt(P(aim)); cam.updateMatrixWorld(); L.redraw(); };
      if (!window.__posing) { window.__posing = true; const tick = () => { if (window.__pose) window.__pose(); requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
      window.__pose();
    }, [eye, aim, KEEL, half]);
    await page.waitForTimeout(3400);                       // the eye takes a moment to open or close
    await page.screenshot({ path: path.join(out, name + '.png') });
    console.log(name, JSON.stringify(await page.evaluate(([G, D]) => ({ guard: window.__ferry.state.inputs[G], davit: window.__ferry.state.inputs[D], said: document.querySelector('#what').textContent }), [GUARD, DAVIT])));
  }
  await rest();
  console.log('drawn by', gpu);
  console.log(errors.length ? 'ERRORS ' + JSON.stringify(errors.slice(0, 4)) : 'no errors on the page');
  await browser.close();
})().catch(e => { console.log('FAILED ' + String(e).slice(0, 400)); process.exit(1); });
