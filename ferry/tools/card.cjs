// card.cjs out.png: the homepage card's picture of her, 1200 × 630, as the page opens on her (from the bow quarter, above),
// the page's chrome hidden and the lens centred on her whole length. Shot at twice the size; make the WebP from it with
// Pillow (ferry/README.md, Coupling). Tries the machine's own graphics card first (Metal on a Mac) and says which it got.
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2] || 'card.png';
  const url = process.argv[3] || 'http://localhost:8765/ferry/';
  const browser = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url + '?card=' + Date.now());
  await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready'), null, { timeout: 90000 })
    .catch(async e => { console.log('not ready: "' + await page.textContent('#status') + '"', JSON.stringify(errors.slice(0, 3))); throw e; });
  await page.addStyleTag({ content: 'header.title, #panel, #panel-toggle, #card, #bar, #stick, #status { visibility: hidden !important; }' });
  const got = await page.evaluate(async () => {
    const f = window.__ferry, L = f.look, cam = L.camera, T = cam.position.constructor;
    const gl = L.renderer.getContext(), dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const s = f.ship, half = s.length / 2;
    // her box: the beam, keel to funnel top, end to end (y from the design waterline)
    const lo = new T(-s.beam / 2, -s.draft - 0.2, -half), hi = new T(s.beam / 2, 21.5 - s.draft, half);
    const mid = lo.clone().add(hi).multiplyScalar(0.5);
    const dir = new T(-0.78, 0.42, 0.62).normalize();   // app.js HOME_DIR: the way the page first looks at her
    cam.clearViewOffset(); cam.aspect = 1200 / 630; cam.updateProjectionMatrix();
    const corners = [];
    for (const x of [lo.x, hi.x]) for (const y of [lo.y, hi.y]) for (const z of [lo.z, hi.z]) corners.push(new T(x, y, z));
    // stand back until every corner of her box is inside 96 % of the frame
    let d = 40;
    for (let i = 0; i < 60; i++) {
      cam.position.copy(mid).addScaledVector(dir, d); cam.lookAt(mid); cam.updateMatrixWorld();
      const m = Math.max(...corners.map(c => { const p = c.clone().project(cam); return Math.max(Math.abs(p.x), Math.abs(p.y)); }));
      d *= m / 0.96;
    }
    L.controls.target.copy(mid); L.controls.update(); cam.lookAt(mid);
    L.fitSun && L.fitSun(); L.redraw();
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));
    return { renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'unknown', distance: +d.toFixed(1) };
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: out });
  console.log('drawn by', got.renderer, '· eye', got.distance, 'm from her middle');
  console.log(errors.length ? 'ERRORS ' + JSON.stringify(errors.slice(0, 3)) : 'no errors on the page');
  await browser.close();
})().catch(e => { console.log('FAILED ' + String(e).slice(0, 300)); process.exit(1); });
