// shots.cjs out-folder [only,views]: the same set of views of her every time, from the page itself, drawn on the machine's own
// graphics card when Chromium can reach it (it says which it got). For putting one step beside the last: the audit after
// every step (AGENTS.md) and the owner's screenshots.
//
//   node ferry/tools/shots.cjs /path/to/folder            (the site served on port 8765)
//   node ferry/tools/shots.cjs /path/to/folder helm,wing  (only those views)
//
// No view is a place written down in metres of one ship. The views of the bridge are in the bridge's own measure (metres
// from the first Chisum's transom, where it was designed: blender/bridge_place.py) and the file says where the bridge
// stands (its `ship.bridge`); every other view on foot is a place in a room of the general arrangement, given as a part of
// the way across and along that room's box, which the file lists (its spaces). A ship of another size needs no change here.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AHEAD = Math.PI, ASTERN = 0, PORT = -Math.PI / 2, STBD = Math.PI / 2;
// On the bridge: [name, metres to port, metres along in the bridge's measure, heading, pitch, what to open]. `wing` in place
// of the metres to port is so far inboard of a wing's end bulwark.
const BRIDGE = [
  ['helm', 0.0, 21.245, AHEAD, -0.10, []],
  ['helm-to-starboard', 1.2, 20.695, PORT - 0.5, -0.18, []],
  ['console-from-port', 3.2, 22.095, PORT + 0.35, -0.30, []],
  ['pantry', -1.45, 21.545, STBD + 0.12, -0.42, ['cooler-door', 'pantry-cupboard']],
  ['wheelhouse-aft', 0.6, 22.195, 0.35, -0.12, []],
  ['wing-port', { wing: 2.09 }, 20.495, AHEAD + 0.85, -0.5, []],
  ['wing-port-from-the-door', 3.6, 20.85, PORT, -0.12, []],
];
// In a room: [name, the room's id in the general arrangement, how far across it (0 its starboard side, 1 its port side), how
// far along it (0 its after end, 1 its forward end), heading, pitch].
const ROOMS = [
  ['upper-deck-looking-aft', 'trailer-deck', 0.5, 0.78, ASTERN, -0.04],
  ['upper-deck-looking-forward', 'trailer-deck', 0.5, 0.25, AHEAD, -0.02],
  ['helideck', 'helideck', 0.5, 0.88, ASTERN, -0.16],
  ['boat-deck-lifeboat-station', 'boat-deck-p', 0.45, 0.04, AHEAD, -0.10],
  ['officers-deck-generator-room', 'officers-deck-aft', 0.88, 0.06, AHEAD + 0.55, -0.05],
  ['forecastle', 'forecastle', 0.5, 0.12, AHEAD, -0.10],
  ['vehicle-deck', 'vehicle-deck', 0.5, 0.05, AHEAD, -0.03],
  ['vehicle-deck-looking-aft', 'vehicle-deck', 0.5, 0.45, ASTERN, -0.03],
  ['pilot-lobby', 'pilot-lobby-p', 0.12, 0.35, PORT + 0.25, -0.05],
  ['lower-hold', 'lower-hold', 0.5, 0.08, AHEAD, -0.03],
  ['engine-room', 'engine-room', 0.5, 0.46, AHEAD, -0.02],
  ['engine-room-platform', 'er-platform', 0.5, 0.37, AHEAD, -0.18],
  ['steering-gear', 'steering-gear', 0.5, 0.85, ASTERN, -0.12],
  ['crew-lounge', 'crew-lounge', 0.9, 0.12, AHEAD - 0.7, -0.06],
  ['drivers-lounge', 'drivers-lounge', 0.35, 0.25, AHEAD + 0.25, -0.05],
  ['cabin', 'crew-cabin-p1', 0.12, 0.3, PORT + 0.2, -0.10],
  ['house-corridor', 'corridor-p', 0.5, 0.05, AHEAD, -0.03],
];
// From outside: [name, afloat, the way the eye lies from her (x to port, y up, z ahead), how far for her length, the lens
// in degrees (none: the page's own), the height over the waterline it looks at]. The true profile and the true plan are
// drawn through a long lens from far off, as nearly without perspective as the page can: to lay beside a drawing.
const OUTSIDE = [
  ['outside-bow-quarter', true, [-0.78, 0.30, 0.62], 1.25],
  ['outside-stern-quarter', true, [-0.62, 0.16, -0.78], 1.4],
  ['outside-beam-low', true, [-1, 0.06, 0.12], 1.55],
  ['outside-true-profile', false, [-1, 0, 0], 3.9, 10, 8.5],
  ['outside-true-plan', false, [-0.0005, 1, 0], 3.9, 10, 4.5],
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
  const lens = await page.evaluate(() => window.__ferry.look.camera.fov);
  for (const [name, afloat, dir, back, fov, height] of OUTSIDE) {
    if (!want(name)) continue;
    await page.evaluate(([afloat, dir, back, fov, height]) => {
      const f = window.__ferry, L = f.look, T = L.camera.position.constructor, s = f.ship;
      if (f.state.walk) f.leaveWalk();
      const key = document.querySelector('#fn-afloat');
      if (key && (key.getAttribute('aria-pressed') === 'true') !== afloat) key.click();
      L.camera.clearViewOffset(); L.camera.aspect = innerWidth / innerHeight; L.camera.fov = fov; L.camera.updateProjectionMatrix();
      const target = new T(0, height, 0), d = new T(...dir).normalize();
      L.controls.target.copy(target); L.camera.position.copy(target).addScaledVector(d, s.length * back); L.controls.update(); L.redraw();
    }, [afloat, dir, back, fov || lens, height === undefined ? 4.5 : height]);
    await settle();
    await page.screenshot({ path: path.join(out, name + '.png') });
    console.log(name);
  }
  await page.evaluate(lens => { const L = window.__ferry.look; L.camera.fov = lens; L.camera.updateProjectionMatrix(); }, lens);
  // On foot: where each view stands, from the file.
  const places = await page.evaluate(([BRIDGE, ROOMS]) => {
    const f = window.__ferry, s = f.ship, b = s.bridge, half = s.length / 2, out = [];
    for (const [name, x, along, yaw, pitch, open] of BRIDGE)
      out.push({ name, x: typeof x === 'number' ? x : b.wing - x.wing, z: along + b.shift - half, level: b.deck, yaw, pitch, open });
    const rooms = new Map(f.spaces.map(sp => [sp.id, sp]));
    for (const [name, id, across, along, yaw, pitch] of ROOMS) {
      const sp = rooms.get(id);
      if (!sp) { out.push({ name, missing: id }); continue; }
      out.push({ name, x: sp.min[0] + (sp.max[0] - sp.min[0]) * across, z: sp.min[2] + (sp.max[2] - sp.min[2]) * along, level: sp.min[1] + 0.05, yaw, pitch, open: [] });
    }
    return out;
  }, [BRIDGE, ROOMS]);
  for (const p of places) {
    if (!want(p.name)) continue;
    if (p.missing) { console.log(p.name, `(the arrangement has no room "${p.missing}")`); continue; }
    const got = await page.evaluate(p => {
      const f = window.__ferry;
      if (!f.state.walk) f.enterWalk();
      document.querySelector('#help').hidden = true;
      for (const id of ['cooler-door', 'pantry-cupboard']) f.work(id, p.open.includes(id));
      for (let t = 0; t < 1.5; t += 0.1) f.workAuto(0.1);
      const y = f.walkTo(p.x, p.z, p.yaw, p.pitch, p.level);
      return { y, room: f.whereOnFoot() };
    }, p);
    await settle();
    await page.screenshot({ path: path.join(out, p.name + '.png') });
    console.log(p.name, got.y === null ? '(no floor there)' : got.room);
  }
  console.log('drawn by', gpu);
  console.log(errors.length ? 'ERRORS ' + JSON.stringify(errors.slice(0, 4)) : 'no errors on the page');
  await browser.close();
})().catch(e => { console.log('FAILED ' + String(e).slice(0, 400)); process.exit(1); });
