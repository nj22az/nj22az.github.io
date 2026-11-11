// Every stair aboard, walked: up from the deck below to the deck above, and down again.
//
//   node ferry/checks/stairs.cjs          (the site served on port 8765: python3 -m http.server 8765)
//
// The stairs are the model's own list (the file's `stairs`, from blender/spec.py): the owner, 11 November 2026, "All stairs
// need to be traversable and fully realistic and standardised". A stair that the walker cannot climb, or cannot come
// down, fails here; so does one whose figures are outside its class.
const { chromium } = require('playwright');
const CLASS = { P: { pitch: 40, going: 0.24, width: 0.9 }, C: { pitch: 45, going: 0.2, width: 0.7 }, L: { pitch: 55, going: 0.15, width: 0.55 } };
const fails = [];
const check = (ok, text) => { console.log((ok ? 'ok    ' : 'FAIL  ') + text); if (!ok) fails.push(text); };
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:8765/ferry/?t=' + Date.now());
  await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready'), null, { timeout: 120000 });
  const stairs = await page.evaluate(() => window.__ferry.stairs);
  check(stairs.length > 0, `the model lists ${stairs.length} stairs of her own`);
  for (const st of stairs) {
    const c = CLASS[st.cls];
    check(st.pitch <= c.pitch + 0.05 && st.going >= c.going - 1e-6 && st.width >= c.width - 1e-6,
      `${st.name}: a ${st.className}, ${st.steps} steps of ${Math.round(st.rise * 1000)} mm, going ${Math.round(st.going * 1000)} mm, ${st.pitch}°, ${st.width.toFixed(2)} m wide`);
    const walked = await page.evaluate(st => {
      const f = window.__ferry, HALF = 17.25, AHEAD = Math.PI, ASTERN = 0;
      if (!f.state.walk) f.enterWalk();
      const x = (st.x[0] + st.x[1]) / 2;
      const run = Math.abs(st.top[0] - st.foot[0]);
      const go = (yard, level, yaw, seconds) => {
        const y0 = f.walkTo(x, yard - HALF, yaw, 0, level);
        if (y0 === null) return null;
        f.hold('KeyW', true);
        for (let t = 0; t < seconds; t += 0.1) { f.workAuto(0.1); f.walkFor(0.1); }
        f.hold('KeyW', false);
        const w = f.state.walk;
        return { y0, y: w.y, yard: w.z + HALF, x: w.x };
      };
      // up: from 0.3 m beyond the foot on the deck below (a bench may stand close behind), toward the top
      const up = go(st.foot[0] + st.down * 0.3, st.foot[1], st.down < 0 ? AHEAD : ASTERN, (run + 2.2) / 0.9);
      // down: from 0.7 m beyond the top on the deck above, toward the foot
      const down = go(st.top[0] - st.down * 0.7, st.top[1], st.down < 0 ? ASTERN : AHEAD, (run + 2.2) / 0.9);
      return { up, down };
    }, st);
    const { up, down } = walked;
    check(up && Math.abs(up.y - st.top[1]) < 0.06 && (up.yard - st.top[0]) * -st.down > 0.2,
      `${st.name}: walked up, from ${st.foot[1].toFixed(2)} m to ${up ? up.y.toFixed(2) : '?'} m (the deck above is at ${st.top[1].toFixed(2)}), arriving ${up ? up.yard.toFixed(2) : '?'} m from the transom`);
    check(down && Math.abs(down.y - st.foot[1]) < 0.06 && (down.yard - st.foot[0]) * st.down > 0.2,
      `${st.name}: walked down again, to ${down ? down.y.toFixed(2) : '?'} m at ${down ? down.yard.toFixed(2) : '?'} m from the transom`);
  }
  check(errors.length === 0, `no errors in the console (${errors.slice(0, 3).join(' | ') || 'none'})`);
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
  process.exit(fails.length ? 1 : 0);
})();
