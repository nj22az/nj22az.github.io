// shots-stern.cjs out-folder [only,views]: the same views of the stern ramp and what works it every time, from the page
// itself, drawn on the machine's own graphics card when Chromium can reach it (it says which it got). For the audit before
// and after each stage of the stern ramp's rebuild (JS3-304), as shots-machinery.cjs is for the machinery spaces.
//
//   node ferry/tools/shots-stern.cjs /path/to/folder                     (the site served on port 8765, or CHISUM_URL)
//   node ferry/tools/shots-stern.cjs /path/to/folder ramp-level,stand    (only those views)
//
// A view is an eye and what it looks at, both in the ship's own measures: metres to port of the centreline, metres from the
// transom (negative: abaft it), metres above the keel. Then a zoom, and what is worked for it: a number for a thing with
// keys (the stern ramp: degrees lowered) puts it there at once; `true` works a thing a tap works.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const VIEWS = [
  // name, eye, aim, zoom, worked. The main deck is 6.6 m above the keel, the upper deck 13.2 m, the waterline 5.6 m.
  ['astern-raised', [13.0, -22.0, 12.5], [0.0, 0.0, 10.0], 1, {}],                              // from off her port quarter: the stern door shut
  ['astern-level', [13.0, -26.0, 12.5], [0.0, -4.0, 8.0], 1, { 'stern-ramp': 90 }],             // and the ramp level
  ['astern-lowest', [16.0, -20.0, 8.6], [0.0, -6.0, 6.4], 1, { 'stern-ramp': 999 }],            // at its lowest, seen low from the side
  ['inside-raised', [0.0, 15.0, 8.3], [0.0, 0.0, 9.6], 1, {}],                                  // from the main deck's centre line, looking aft at the door
  ['inside-half', [0.0, 15.0, 8.3], [0.0, -1.0, 9.0], 1, { 'stern-ramp': 45 }],                 // half way down
  ['inside-level', [0.0, 15.0, 8.3], [0.0, -3.0, 7.4], 1, { 'stern-ramp': 90 }],                // the ramp level: the way ashore
  ['port-cylinder', [1.2, 8.6, 8.3], [4.4, 0.8, 9.0], 1, { 'stern-ramp': 90 }],                 // the port cylinder and what it is pinned to, the ramp level
  ['port-cylinder-raised', [1.2, 8.6, 8.3], [4.4, 0.8, 9.4], 1, {}],                            // and raised
  ['hinges', [2.6, 1.9, 7.5], [3.6, -0.3, 6.6], 1, { 'stern-ramp': 90 }],                       // the hinge line at the sill, from close
  ['flaps', [3.0, -6.5, 8.2], [0.0, -11.5, 6.4], 1, { 'stern-ramp': 90 }],                      // standing on the ramp, looking at its end
  ['cleats-port', [2.2, 2.4, 8.3], [4.5, 0.1, 8.6], 1, {}],                                     // the port side of the door, shut: the cleats
  ['stand', [2.3, 3.4, 8.2], [4.3, 1.5, 7.6], 1, {}],                                           // the control stand beside the door, port side
  ['stand-face', [3.35, 1.45, 8.05], [4.4, 1.45, 7.75], 1, {}],                                 // its face, as the one who works it sees it
  ['mooring-station-port', [5.2, 6.6, 8.2], [8.4, 0.6, 7.6], 1, {}],                            // in the port after mooring station, looking aft
  ['hydraulic-room', [7.9, 12.2, 8.2], [9.0, 8.0, 7.5], 1, {}],                                 // the hydraulic pump room, from its forward end
  ['hydraulic-room-inboard', [9.2, 7.7, 8.2], [7.6, 11.6, 7.4], 1, {}],                         // and from its after outboard corner, at the inboard wall
  ['switchboard-room', [1.5, 17.4, 5.6], [6.6, 20.4, 5.0], 1, {}],                              // where the main switchboard is to stand
  ['switchboard-room-aft', [6.8, 20.6, 5.6], [2.0, 17.2, 4.8], 1, {}],
  ['aux-engine-room', [0.0, 39.2, 3.2], [0.0, 46.0, 2.8], 1, {}],                               // where the three generating sets are to stand
  ['aux-engine-room-aft', [2.0, 46.0, 3.2], [-2.0, 39.0, 3.0], 1, {}],
];

(async () => {
  const out = process.argv[2];
  if (!out) { console.log('usage: node ferry/tools/shots-stern.cjs out-folder [only,views]'); process.exit(2); }
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
  const half = await page.evaluate(() => window.__ferry.ship.length / 2);
  // The model's heights are over her waterline: the bridge deck is 21.6 m above the keel (ga.py), so the keel is this far under it.
  const KEEL = (await page.evaluate(() => window.__ferry.ship.bridge.deck)) - 21.6;
  await page.evaluate(([z, y]) => { const f = window.__ferry; f.enterWalk(); f.walkTo(0, z, Math.PI, 0, y); }, [10.0 - half, KEEL + 6.6]);
  for (const [name, eye, aim, zoom, worked] of VIEWS) {
    if (!want(name)) continue;
    await page.evaluate(([eye, aim, zoom, worked, KEEL, half]) => {
      const f = window.__ferry, L = f.look, cam = L.camera, T = cam.position.constructor;
      const P = p => new T(p[0], KEEL + p[2], p[1] - half);
      // what has keys is put where the view says (the ramp: so many degrees; more than it has is its lowest), and back at rest otherwise
      window.__set = window.__set || new Set();
      for (const id of window.__set) if (typeof worked[id] !== 'number') f.setInput(id, 0);
      for (const id of Object.keys(f.state.inputs)) {
        if (typeof worked[id] === 'number') { f.setInput(id, worked[id]); window.__set.add(id); }
        else f.work(id, worked[id] === true);
      }
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
