// shots.cjs out-folder [only,views]: the same set of views of her every time, from the page itself, drawn on the machine's own
// graphics card when Chromium can reach it (it says which it got). For putting one step beside the last: the audit after
// every step (AGENTS.md) and the owner's screenshots.
//
//   node ferry/tools/shots.cjs /path/to/folder            (the site served on port 8765)
//   node ferry/tools/shots.cjs /path/to/folder helm,wing  (only those views)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// On foot: [name, metres to port, metres from the transom, the deck's height over the waterline, heading, pitch, what to open]
// (heading 0 looks astern, pi looks ahead, pi / 2 to port: as the page's walkTo has it).
const ON_FOOT = [
  ['helm', 0.0, 51.75, 9.3, Math.PI, -0.10, []],
  ['helm-to-starboard', 1.2, 51.2, 9.3, -Math.PI / 2 - 0.5, -0.18, []],
  ['console-from-port', 3.2, 52.6, 9.3, -Math.PI / 2 + 0.35, -0.30, []],
  ['pantry', -1.45, 52.05, 9.3, Math.PI / 2 + 0.12, -0.42, ['cooler-door', 'pantry-cupboard']],
  ['wheelhouse-aft', 0.6, 52.7, 9.3, 0.35, -0.12, []],
  ['wing-port', 4.35, 51.0, 9.3, Math.PI + 0.85, -0.5, []],
  ['car-deck', 0.0, 6.0, 2.1, Math.PI, -0.03, []],
  ['saloon', 0.0, 30.0, 6.5, Math.PI, -0.05, []],
  ['engine-room', 0.0, 16.0, -2.0, Math.PI, -0.05, []],
];
// From outside: [name, afloat, the way the eye lies from her (x to port, y up, z ahead), how far for her length]
const OUTSIDE = [
  ['outside-bow-quarter', true, [-0.78, 0.30, 0.62], 1.25],
  ['outside-stern-quarter', true, [-0.62, 0.16, -0.78], 1.2],
  ['outside-beam-low', true, [-1, 0.06, 0.12], 1.15],
  ['outside-in-dock', false, [-0.78, 0.30, 0.62], 1.25],
];

(async () => {
  const out = process.argv[2];
  if (!out) { console.log('usage: node ferry/tools/shots.cjs out-folder [only,views]'); process.exit(2); }
  const only = process.argv[3] ? new Set(process.argv[3].split(',')) : null;
  const want = name => !only || only.has(name);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1.5, colorScheme: 'light' });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errors.push(m.text()); });
  await page.goto((process.env.CHISUM_URL || 'http://localhost:8765/ferry/') + '?shots=' + Date.now());
  await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready'), null, { timeout: 120000 });
  await page.addStyleTag({ content: 'header.title, #panel, #panel-toggle, #card, #bar, #stick, #status { visibility: hidden !important; }' });
  const gpu = await page.evaluate(() => { const gl = window.__ferry.look.renderer.getContext(), d = gl.getExtension('WEBGL_debug_renderer_info'); return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown'; });
  const settle = () => page.waitForTimeout(3200);          // the eye takes a moment to open or close
  for (const [name, afloat, dir, back] of OUTSIDE) {
    if (!want(name)) continue;
    await page.evaluate(([afloat, dir, back]) => {
      const f = window.__ferry, L = f.look, T = L.camera.position.constructor, s = f.ship;
      if (f.state.walk) f.leaveWalk();
      const key = document.querySelector('#fn-afloat');
      if (key && (key.getAttribute('aria-pressed') === 'true') !== afloat) key.click();
      L.camera.clearViewOffset(); L.camera.aspect = innerWidth / innerHeight; L.camera.updateProjectionMatrix();
      const target = new T(0, 4.5, 0), d = new T(...dir).normalize();
      L.controls.target.copy(target); L.camera.position.copy(target).addScaledVector(d, s.length * back); L.controls.update(); L.redraw();
    }, [afloat, dir, back]);
    await settle();
    await page.screenshot({ path: path.join(out, name + '.png') });
    console.log(name);
  }
  for (const [name, x, yard, level, yaw, pitch, open] of ON_FOOT) {
    if (!want(name)) continue;
    const got = await page.evaluate(([x, yard, level, yaw, pitch, open]) => {
      const f = window.__ferry;
      if (!f.state.walk) f.enterWalk();
      document.querySelector('#help').hidden = true;
      for (const id of ['cooler-door', 'pantry-cupboard']) f.work(id, open.includes(id));
      for (let t = 0; t < 1.5; t += 0.1) f.workAuto(0.1);
      const y = f.walkTo(x, yard - f.ship.length / 2, yaw, pitch, level);
      return { y, room: f.whereOnFoot() };
    }, [x, yard, level, yaw, pitch, open]);
    await settle();
    await page.screenshot({ path: path.join(out, name + '.png') });
    console.log(name, got.y === null ? '(no floor there)' : got.room);
  }
  console.log('drawn by', gpu);
  console.log(errors.length ? 'ERRORS ' + JSON.stringify(errors.slice(0, 4)) : 'no errors on the page');
  await browser.close();
})().catch(e => { console.log('FAILED ' + String(e).slice(0, 400)); process.exit(1); });
