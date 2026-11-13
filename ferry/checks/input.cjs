// The Chisum is worked as a visitor works her: with a real mouse, real keys and a finger, never through the page's test hooks
// (they are read here only to say where the eye and the walker are). The other checks drive her through the hooks: they
// would pass with a pane of glass over the whole page.
//
// The owner, 13 November 2026, after a publication: "Camera controls and walking controls seems broken , did something happen".
// Nothing was found broken in Chromium, at a desk or with a finger; this check is what was tried, kept so that it is tried
// every time. It does not try Safari's engine, which the owner's tablet has.
//
//   node ferry/checks/input.cjs [url]        (the site served on port 8765, or CHISUM_URL, or the address given)
//
// A click on a button is given with the mouse at the button's place (page.mouse.click), not page.click: on this page
// page.click waits half a minute for a navigation that does not come.
const { chromium } = require('playwright');
const fails = [];
const check = (ok, text) => { console.log((ok ? 'ok    ' : 'FAIL  ') + text); if (!ok) fails.push(text); };
const URL_ = process.argv[2] || process.env.CHISUM_URL || 'http://localhost:8765/ferry/';
const state = page => page.evaluate(() => {
  const f = window.__ferry, c = f.look.camera, w = f.state.walk;
  return { cam: [c.position.x, c.position.y, c.position.z].map(v => +v.toFixed(2)), fov: +c.fov.toFixed(1), open: f.computerOpen,
    walk: w ? { x: +w.x.toFixed(2), z: +w.z.toFixed(2), yaw: +(w.yaw ?? 0).toFixed(3), pitch: +(w.pitch ?? 0).toFixed(3) } : null };
});
const differ = (a, b) => JSON.stringify(a) !== JSON.stringify(b);
const line = (x0, y0, x1, y1, n = 10) => Array.from({ length: n + 1 }, (_, k) => [x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]);

async function worked(browser, how) {
  const finger = how === 'a finger';
  const context = await browser.newContext(finger ? { viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: true } : { viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
  await page.goto(URL_ + '?t=' + Date.now());
  await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready'), null, { timeout: 180000 });
  await page.waitForTimeout(1500);
  const cdp = await context.newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id })) });
  const stroke = async (pts, hold = 0) => {
    if (finger) { await touch('touchStart', [pts[0]]); for (const q of pts.slice(1)) { await touch('touchMove', [q]); await page.waitForTimeout(30); } if (hold) await page.waitForTimeout(hold); await touch('touchEnd', []); }
    else { await page.mouse.move(...pts[0]); await page.mouse.down(); for (const q of pts.slice(1)) await page.mouse.move(...q); if (hold) await page.waitForTimeout(hold); await page.mouse.up(); }
    await page.waitForTimeout(600);
  };
  const press = async sel => { const r = await page.locator(sel).boundingBox(); if (finger) await stroke([[r.x + r.width / 2, r.y + r.height / 2]]); else await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); await page.waitForTimeout(1200); };
  const pinch = async () => { await touch('touchStart', [[500, 400], [700, 400]]); for (let k = 1; k <= 8; k++) { await touch('touchMove', [[500 - 12 * k, 400], [700 + 12 * k, 400]]); await page.waitForTimeout(30); } await touch('touchEnd', []); await page.waitForTimeout(700); };
  const ahead = async ms => {
    if (!finger) { await page.keyboard.down('KeyW'); await page.waitForTimeout(ms); await page.keyboard.up('KeyW'); await page.waitForTimeout(300); return; }
    const s = await page.evaluate(() => { const q = document.querySelector('#stick').getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2, h: q.height }; });
    await stroke(line(s.x, s.y, s.x, s.y - s.h * 0.4, 6), ms);
  };

  // From outside: the view is turned and brought nearer.
  const a = await state(page);
  await stroke(line(590, 380, 720, 430));
  const b = await state(page);
  check(differ(a.cam, b.cam), `${how}: a drag turns the outside view`);
  if (finger) await pinch(); else { await page.mouse.move(640, 380); await page.mouse.wheel(0, -600); await page.waitForTimeout(900); }
  const c = await state(page);
  check(differ(b.cam, c.cam), `${how}: ${finger ? 'two fingers' : 'the wheel'} bring${finger ? '' : 's'} her nearer`);

  // On foot: Walk aboard, ahead, look round, nearer.
  await press('#walk');
  const w0 = await state(page);
  check(!!w0.walk, `${how}: Walk aboard puts one on foot`);
  if (w0.walk) {
    await ahead(1500);
    const w1 = await state(page);
    const gone = Math.hypot(w1.walk.x - w0.walk.x, w1.walk.z - w0.walk.z);
    check(gone > (process.env.CHISUM_SOFTWARE ? 0.05 : 1.0), `${how}: ${finger ? 'the stick' : 'the W key'} walks ahead (${gone.toFixed(2)} m in a second and a half)`);
    await stroke(line(700, 380, 860, 400));
    const w2 = await state(page);
    check(differ([w1.walk.yaw, w1.walk.pitch], [w2.walk.yaw, w2.walk.pitch]), `${how}: a drag looks round on foot`);
    if (finger) { await pinch(); const w3 = await state(page); check(differ(w2.fov, w3.fov), `${how}: two fingers bring what is looked at nearer on foot`); }

    // The chief engineer's computer: opened as a tap on it opens it, worked inside (the keys and the pointer are the
    // program's then), left by its button; and the ship answers again.
    const opened = await page.evaluate(async () => {
      const f = window.__ferry;
      const buf = await new Response((await fetch('data/ferry.bin.gz')).body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      const header = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, new DataView(buf).getUint32(4, true))));
      const def = header.inputs.find(i => i.opens === 'maintenance');
      if (!def) return false;
      f.walkTo(def.at[0] - 0.87, def.at[2], Math.PI / 2, 0, def.at[1] - 1.04);      // before the desk, where the chair stands
      return f.tap(def.id) && f.computerOpen && !!f.state.walk;
    });
    if (opened) {
      const frame = page.frameLocator('#computer-screen');
      await frame.locator('#nav a[href="#assets"]').waitFor({ timeout: 30000 });
      const nav = await frame.locator('#nav a[href="#assets"]').boundingBox();
      if (finger) await stroke([[nav.x + nav.width / 2, nav.y + nav.height / 2]]); else await page.mouse.click(nav.x + nav.width / 2, nav.y + nav.height / 2);
      await page.waitForTimeout(1200);
      await press('#computer-back');
      const out = await state(page);
      await ahead(1200);
      const w4 = await state(page);
      await stroke(line(700, 380, 860, 400));
      const w5 = await state(page);
      check(!out.open && differ([out.walk.x, out.walk.z], [w4.walk.x, w4.walk.z]) && differ([w4.walk.yaw, w4.walk.pitch], [w5.walk.yaw, w5.walk.pitch]),
        `${how}: after the maintenance program and "Back to the Chisum", one walks and looks round as before`);
    } else check(true, `${how}: (no computer aboard this build: the way back from it is not tried)`);
    await press('#walk');
    const o0 = await state(page);
    await stroke(line(590, 380, 720, 430));
    const o1 = await state(page);
    check(!o0.walk && differ(o0.cam, o1.cam), `${how}: Leave ends the walk, and the outside view turns again`);
  }
  check(errors.length === 0, `${how}: no errors on the page (${errors.length ? errors.join('; ') : 'none'})`);
  await context.close();
}

(async () => {
  // Drawn on the machine's own graphics card, as the picture tools are: on foot she is drawn anew every frame, and without a
  // card a frame takes three seconds (so does each touch: found on 13 November, and the same in the publication before). With
  // CHISUM_SOFTWARE=1 it is drawn without one, as the other checks are; allow a quarter of an hour then. A browser for each.
  const args = process.env.CHISUM_SOFTWARE ? { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] } : { channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] };
  for (const how of ['a mouse and keys', 'a finger']) {
    const browser = await chromium.launch(args);
    await worked(browser, how);
    await browser.close();
  }
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAILED ' + String(e).slice(0, 400)); process.exit(1); });
