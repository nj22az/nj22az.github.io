// On foot one can look closer and wider.
//
//   node ferry/checks/zoom.cjs          (the site served on port 8765: python3 -m http.server 8765)
//
// The owner, 11 November 2026: "I want to be able to zoom out and in on the walk aboard". The wheel, the keys + - and 0, and
// two fingers on a touch screen change the lens one walks with; this turns each, and checks what the page then draws with:
// the limits hold, the normal view comes back, a pinch does not turn one's head, looking closer makes a drag turn one less,
// and leaving the walk gives the outside view its own lens back.
const { chromium } = require('playwright');
const fails = [];
const check = (ok, text) => { console.log((ok ? 'ok    ' : 'FAIL  ') + text); if (!ok) fails.push(text); };
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('http://localhost:8765/ferry/?t=' + Date.now());
  await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready'), null, { timeout: 120000 });
  const lens = () => page.evaluate(() => ({ fov: window.__ferry.look.camera.fov, zoom: window.__ferry.walkZoom, yaw: window.__ferry.state.walk && window.__ferry.state.walk.yaw,
    said: document.querySelector('#what').textContent }));
  const outside = (await lens()).fov;
  await page.evaluate(() => { const f = window.__ferry; f.enterWalk(); f.walkTo(0, 30.0 - f.ship.length / 2, Math.PI, 0, 6.5); });
  let a = await lens();
  check(Math.abs(a.fov - 68) < 0.01 && a.zoom === 1, `one sets out with the normal lens (${a.fov.toFixed(1)}°)`);

  // ---- the wheel
  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(80);
  a = await lens();
  check(a.fov < 55 && a.zoom > 1.3, `the wheel turned away looks closer (${a.zoom.toFixed(2)} ×, ${a.fov.toFixed(1)}°; the page says "${a.said}")`);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(80);
  a = await lens();
  check(Math.abs(a.fov - 68) < 0.01, `turned back as far, it is the normal view again (${a.fov.toFixed(1)}°)`);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(80);
  a = await lens();
  check(a.fov > 80 && a.zoom < 0.8, `turned toward one, it looks wider (${a.zoom.toFixed(2)} ×, ${a.fov.toFixed(1)}°)`);
  const limits = await page.evaluate(() => window.__ferry.zoomLimits);
  for (let k = 0; k < 12; k++) await page.mouse.wheel(0, 2000);
  await page.waitForTimeout(80);
  const wide = await lens();
  for (let k = 0; k < 24; k++) await page.mouse.wheel(0, -2000);
  await page.waitForTimeout(80);
  const long = await lens();
  check(Math.abs(wide.fov - 104) < 0.1 && Math.abs(long.fov - 16) < 0.1, `it stops at its widest and its longest (${wide.fov.toFixed(0)}° and ${long.fov.toFixed(0)}°: ${limits[0].toFixed(2)} × to ${limits[1].toFixed(1)} ×)`);

  // ---- the keys
  await page.keyboard.press('Digit0');
  a = await lens();
  check(Math.abs(a.fov - 68) < 0.01 && a.zoom === 1, `0 is the normal view (${a.fov.toFixed(1)}°)`);
  await page.keyboard.press('Equal'); await page.keyboard.press('Equal');
  const plus = await lens();
  await page.keyboard.press('Minus');
  const minus = await lens();
  check(Math.abs(plus.zoom - 1.5625) < 0.01 && Math.abs(minus.zoom - 1.25) < 0.01, `+ looks closer and - wider (${plus.zoom.toFixed(2)} ×, then ${minus.zoom.toFixed(2)} ×)`);
  await page.keyboard.press('Digit0');

  // ---- looking closer, a drag turns one less
  const drag = async () => { const y0 = (await lens()).yaw; await page.mouse.move(500, 300); await page.mouse.down(); await page.mouse.move(700, 300, { steps: 8 }); await page.mouse.up(); return Math.abs((await lens()).yaw - y0); };
  const normal = await drag();
  await page.evaluate(() => window.__ferry.setWalkZoom(3));
  const close = await drag();
  await page.evaluate(() => window.__ferry.setWalkZoom(0.6));
  const far = await drag();
  check(Math.abs(normal / close - 3) < 0.1 && Math.abs(far - normal) < 0.01, `at 3 × the same drag turns one a third as far; looking wider it turns one as usual (${normal.toFixed(2)}, ${close.toFixed(2)}, ${far.toFixed(2)} rad)`);
  await page.keyboard.press('Digit0');

  // ---- two fingers
  const cdp = await context.newCDPSession(page);
  const touch = (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([x, y, id]) => ({ x, y, id })) });
  const before = await lens();
  await touch('touchStart', [[540, 400, 0]]);
  await touch('touchStart', [[540, 400, 0], [740, 400, 1]]);
  for (let k = 1; k <= 5; k++) await touch('touchMove', [[540 - k * 20, 400, 0], [740 + k * 20, 400, 1]]);
  await page.waitForTimeout(60);
  const spread = await lens();
  check(Math.abs(spread.zoom - 2) < 0.03 && Math.abs(spread.yaw - before.yaw) < 1e-6, `two fingers spread to twice as far apart look twice as close, and do not turn one's head (${spread.zoom.toFixed(2)} ×)`);
  for (let k = 1; k <= 5; k++) await touch('touchMove', [[440 + k * 30, 400, 0], [840 - k * 30, 400, 1]]);
  await page.waitForTimeout(60);
  const pinched = await lens();
  check(Math.abs(pinched.zoom - 0.5) < 0.03 || Math.abs(pinched.zoom - limits[0]) < 0.01, `pinched to half as far apart they look wider (${pinched.zoom.toFixed(2)} ×)`);
  await touch('touchEnd', []);
  // One finger lifts and the other goes on looking. The browser's own touch input cannot lift one finger of two here (it
  // lifts both at once), so the page is given the pointer events themselves, as a second finger down, away and up again.
  const lifted = await page.evaluate(() => {
    const f = window.__ferry, c = document.querySelector('#view canvas');
    const ev = (type, id, x) => c.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: 400, bubbles: true }));
    f.setWalkZoom(1);
    ev('pointerdown', 21, 540); ev('pointerdown', 22, 740);
    ev('pointermove', 21, 440); ev('pointermove', 22, 840);          // spread to twice as far apart
    const zoom = f.walkZoom, yaw = f.state.walk.yaw;
    ev('pointerup', 22, 840);
    ev('pointermove', 21, 340);                                      // the finger that stayed, dragged
    const after = { zoom: f.walkZoom, yaw: f.state.walk.yaw };
    ev('pointerup', 21, 340);
    return { zoom, turned: Math.abs(after.yaw - yaw), kept: after.zoom };
  });
  check(Math.abs(lifted.zoom - 2) < 0.03 && Math.abs(lifted.kept - lifted.zoom) < 1e-6 && lifted.turned > 0.1,
    `when one finger lifts, the other looks round and the zoom stays (${lifted.kept.toFixed(2)} ×, turned ${lifted.turned.toFixed(2)} rad)`);
  const card = await page.evaluate(() => { const c = document.querySelector('#card'); return !!c && !c.hidden && getComputedStyle(c).display !== 'none' && c.textContent.trim().length > 0; });
  check(!card, `lifting the fingers of a pinch names nothing`);

  // ---- leaving and coming back
  await page.evaluate(() => { window.__ferry.setWalkZoom(2); window.__ferry.leaveWalk(); });
  const left = await lens();
  await page.evaluate(() => window.__ferry.enterWalk());
  const again = await lens();
  check(Math.abs(left.fov - outside) < 0.01 && Math.abs(again.zoom - 2) < 0.01, `leaving the walk gives the outside view its own lens back (${left.fov.toFixed(0)}°), and the next walk begins with the zoom one left (${again.zoom.toFixed(1)} ×)`);
  check(errors.length === 0, `no errors in the console (${errors.slice(0, 3).join(' | ') || 'none'})`);
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
  process.exit(fails.length ? 1 : 0);
})();
