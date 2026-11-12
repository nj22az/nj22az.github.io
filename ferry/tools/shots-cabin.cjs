// shots-cabin.cjs out-folder [only,views]: the same views of the chief engineer's day room every time, from the page itself on
// foot, drawn on the machine's own graphics card when Chromium can reach it (it says which it got). As shots-machinery.cjs is
// for the machinery spaces. `screen-read` and `board-read` are from arm's length, where lettering is judged (JSY-STD-404).
//
//   node ferry/tools/shots-cabin.cjs /path/to/folder                   (the site served on port 8765, or CHISUM_URL)
//   node ferry/tools/shots-cabin.cjs /path/to/folder desk,calendar     (only those views)
//
// A view is an eye and what it looks at, in the ship's own measures as blender/cabin_place.py has them: metres to port of the
// centreline, metres from the transom, metres above the keel (the officers' deck is 18.8 m above it). The last view,
// `computer-open`, taps the computer and shows the page as it is then: the maintenance program, and the button back.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const VIEWS = [
  // name, eye, aim. The room is 2.995 to 7.5 m to port, 98.05 to 104.0 m from the transom; her side is at 7.5, the after wall at 98.05.
  ['room', [4.6, 102.2, 20.6], [6.9, 98.6, 19.6]],                  // from the middle of the room, aft and to port: the desk, the after wall
  ['from-door', [4.0, 98.5, 20.4], [7.2, 99.1, 19.6]],              // just inside the door
  ['desk', [6.35, 98.92, 19.95], [7.45, 98.92, 19.75]],             // as one sits at it
  ['screen-read', [6.72, 98.92, 19.86], [7.17, 98.92, 19.84]],      // the screen from arm's length
  ['desk-top', [6.9, 98.2, 20.2], [7.35, 98.8, 19.55]],             // the desk's top from its after end: the keyboard's cable, the screen's two
  ['behind-screen', [7.40, 98.15, 20.05], [7.40, 99.3, 19.5]],      // between the desk and her side, looking forward: the cables down behind the stand
  ['under-desk', [6.5, 99.0, 19.15], [7.49, 98.62, 19.18]],         // from the chair's place, under the top: the unit, the outlets, the clipped cables
  ['after-wall', [5.3, 100.6, 20.3], [5.3, 98.06, 20.2]],           // the place of DB-CE beside the door, the trunking up to it, the calendar
  ['board-read', [4.67, 98.75, 20.42], [4.67, 98.06, 20.40]],       // the board's sign and the box under it, from arm's length
  ['calendar', [6.21, 98.95, 20.28], [6.21, 98.06, 20.28]],         // the calendar
  ['window', [5.6, 99.2, 20.4], [7.5, 99.85, 20.1]],                // the desk's forward end under the side window
];

(async () => {
  const out = process.argv[2];
  if (!out) { console.log('usage: node ferry/tools/shots-cabin.cjs out-folder [only,views]'); process.exit(2); }
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
  const hide = await page.addStyleTag({ content: 'header.title, #panel, #panel-toggle, #card, #bar, #stick, #status, #help, #map-mini { visibility: hidden !important; }' });
  const gpu = await page.evaluate(() => { const gl = window.__ferry.look.renderer.getContext(), d = gl.getExtension('WEBGL_debug_renderer_info'); return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown'; });
  const half = await page.evaluate(() => window.__ferry.ship.length / 2);
  // The model's heights are over her waterline: the bridge deck is 21.6 m above the keel (ga.py), so the keel is this far under it.
  const KEEL = (await page.evaluate(() => window.__ferry.ship.bridge.deck)) - 21.6;
  await page.evaluate(([z, y]) => { const f = window.__ferry; f.enterWalk(); f.walkTo(5.0, z, Math.PI, 0, y); }, [100.5 - half, KEEL + 18.8]);
  for (const [name, eye, aim] of VIEWS) {
    if (!want(name)) continue;
    await page.evaluate(([eye, aim, KEEL, half]) => {
      const f = window.__ferry, L = f.look, cam = L.camera, T = cam.position.constructor;
      const P = p => new T(p[0], KEEL + p[2], p[1] - half);
      // the walker stands in the room (the page lights and shows the place it is in), then the eye is put where the view says
      window.__stood = f.walkTo(5.0, 100.5 - half, Math.PI, 0, KEEL + 18.8);
      f.setWalkZoom(1, true);
      const e = P(eye);
      window.__pose = () => { cam.position.copy(e); cam.up.set(0, 1, 0); cam.lookAt(P(aim)); cam.updateMatrixWorld(); L.redraw(); };
      if (!window.__posing) { window.__posing = true; const tick = () => { if (window.__pose) window.__pose(); requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
      window.__pose();
    }, [eye, aim, KEEL, half]);
    await page.waitForTimeout(3400);                       // the eye takes a moment to open or close
    await page.screenshot({ path: path.join(out, name + '.png') });
    console.log(name + ((await page.evaluate(() => window.__stood)) === null ? '   (no floor under the walker: it stands where it stood)' : ''));
  }
  if (want('computer-open')) {
    // a tap on the computer: the maintenance program fills the page, with its button back
    await page.evaluate(() => { window.__pose = null; });
    await page.evaluate(h => h.remove(), hide);
    const tapped = await page.evaluate(() => { const f = window.__ferry; return f.tap('ce-computer') && f.computerOpen; });
    if (tapped) {
      await page.frameLocator('#computer-screen').locator('#app h1, #app .page-head').first().waitFor({ timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(out, 'computer-open.png') });
      await page.click('#computer-back');
      console.log('computer-open');
    } else console.log('computer-open   (a tap on the computer did not open the program)');
  }
  console.log('drawn by', gpu);
  console.log(errors.length ? 'ERRORS ' + JSON.stringify(errors.slice(0, 4)) : 'no errors on the page');
  await browser.close();
})().catch(e => { console.log('FAILED ' + String(e).slice(0, 400)); process.exit(1); });
