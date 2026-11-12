const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:8765/ferry/?t=' + Date.now());
  await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready'), null, { timeout: 240000 });
  const go = async (tag, x, yard, yaw, pitch, open) => {
    const r = await page.evaluate(([x, yard, yaw, pitch, open]) => {
      const f = window.__ferry; if (!f.state.walk) f.enterWalk();
      for (const id of ['cooler-door', 'pantry-cupboard']) f.work(id, open);
      for (let t = 0; t < 1.6; t += 0.1) f.workAuto(0.1);
      const y = f.walkTo(x, yard - f.ship.length / 2, yaw, pitch, 9.3);
      f.setWalkZoom && f.setWalkZoom(1.6);
      return { y, room: f.whereOnFoot(), doors: ['cooler-door', 'pantry-cupboard'].map(id => f.state.inputs[id]) };
    }, [x, yard, yaw, pitch, open]);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}-${tag}.png` });
    console.log(tag, JSON.stringify(r));
  };
  await go('shut', -1.45, 52.05, Math.PI / 2 + 0.12, -0.42, false);
  await go('open', -1.45, 52.05, Math.PI / 2 + 0.12, -0.42, true);
  console.log(errors.length ? 'ERRORS ' + JSON.stringify(errors.slice(0, 3)) : 'no errors on the page');
  await browser.close();
})().catch(e => { console.log('FAILED ' + String(e).slice(0, 300)); process.exit(1); });
