// The ferry opens without a connection once it has been saved.
//
//   node ferry/checks/offline.cjs          (the site served on port 8765: python3 -m http.server 8765)
//
// The owner, 11 November 2026: "Make a install to Home Screen and download offline button so I don't need a connection to
// look at it". On a phone-sized screen: the page is saved with its button, the network is cut, the page is opened again and
// must show the whole ferry; the Install button says where the command is when the browser has no request of its own.
const { chromium } = require('playwright');
const fails = [];
const check = (ok, text) => { console.log((ok ? 'ok    ' : 'FAIL  ') + text); if (!ok) fails.push(text); };
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  const ready = () => page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready'), null, { timeout: 120000 });
  await page.goto('http://localhost:8765/ferry/');
  await ready();
  await page.waitForFunction(() => navigator.serviceWorker.ready.then(() => true), null, { timeout: 20000 });
  await page.click('#offline');
  await page.waitForFunction(() => /Saved:|Not saved/.test(document.getElementById('what').textContent), null, { timeout: 120000 });
  const said = await page.textContent('#what');
  check(/^Saved: \d+ files/.test(said), `Save offline: "${said}"`);
  await page.reload(); await ready();                      // the service worker now has the page
  await context.setOffline(true);
  await page.reload(); await ready();
  const off = await page.evaluate(() => ({ stairs: window.__ferry.stairs.length, systems: window.__ferry.systems ? 1 : 0, label: document.getElementById('offline').textContent,
    wide: document.documentElement.scrollWidth }));
  check(off.stairs === 8 && off.label === 'Saved offline', `with the network cut the page opens again with the whole model (${off.stairs} stairs listed) and says "${off.label}"`);
  check(off.wide <= 390, `on a phone the page is still no wider than the screen (${off.wide} px)`);
  await page.click('#install');
  const hint = await page.textContent('#what');
  check(/Home Screen/.test(hint), `Install: "${hint}"`);
  check(errors.length === 0, `no errors in the console (${errors.slice(0, 3).join(' | ') || 'none'})`);
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
  process.exit(fails.length ? 1 : 0);
})();
