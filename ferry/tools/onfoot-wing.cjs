// wing.cjs out-prefix: on foot on the port bridge wing, as a tablet held upright sees it
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  const t0 = Date.now();
  await page.goto('http://localhost:8765/ferry/?t=' + Date.now());
  await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready'), null, { timeout: 240000 });
  console.log('ready after', ((Date.now() - t0) / 1000).toFixed(1), 's');
  const shots = [['a', 4.35, 51.0, Math.PI + 0.85, -0.5], ['b', 4.9, 51.9, -Math.PI / 2 + 0.25, -0.25], ['c', 4.4, 50.6, Math.PI / 2 + 0.2, -0.35]];
  for (const [tag, x, yard, yaw, pitch] of shots) {
    const r = await page.evaluate(([x, yard, yaw, pitch]) => {
      const f = window.__ferry; if (!f.state.walk) f.enterWalk();
      const y = f.walkTo(x, yard - f.ship.length / 2, yaw, pitch, 9.3);
      return { y, room: f.whereOnFoot() };
    }, [x, yard, yaw, pitch]);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${out}-${tag}.png` });
    console.log(tag, JSON.stringify(r));
  }
  // the hose box opens to a tap
  const box = await page.evaluate(() => { const f = window.__ferry; const before = f.movers().find(m => m.id === 'hose-box-p'); f.work('hose-box-p', true); for (let t = 0; t < 1.5; t += 0.1) f.workAuto(0.1); const m = f.movers().find(m => m.id === 'hose-box-p'); return { has: !!before, turned: m ? Math.round(Math.atan2(m.matrix[8], m.matrix[0]) * 180 / Math.PI) : null }; });
  console.log('hose box', JSON.stringify(box));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}-d.png` });
  console.log(errors.length ? 'ERRORS ' + JSON.stringify(errors.slice(0, 3)) : 'no errors on the page');
  await browser.close();
})().catch(e => { console.log('FAILED ' + String(e).slice(0, 300)); process.exit(1); });
