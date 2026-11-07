// True 1x renders of the favicons at 16 and 32 device pixels on light and dark tabs, enlarged
// without smoothing, plus a grayscale row: what a browser tab actually shows.
//   node tools/favicon-pixels.cjs <dir with office/hotels/world.svg> <out.png>
//   node truepx.cjs <dir> <out.png>
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const dir = process.argv[2], out = process.argv[3];
(async () => {
  const browser = await chromium.launch();
  const names = ['office', 'hotels', 'world'];
  const src = n => `data:image/svg+xml;base64,${Buffer.from(fs.readFileSync(path.join(dir, n + '.svg'))).toString('base64')}`;
  const pngs = {};
  for (const n of names) for (const s of [16, 32]) {
    const page = await browser.newPage({ viewport: { width: s, height: s }, deviceScaleFactor: 1 });
    await page.setContent(`<html><body style="margin:0;background:transparent"><img src="${src(n)}" width="${s}" height="${s}" style="display:block"></body></html>`);
    await page.waitForTimeout(150);
    pngs[n + s] = (await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: s, height: s } })).toString('base64');
    fs.writeFileSync(path.join(dir, `_true_${n}_${s}.png`), Buffer.from(pngs[n + s], 'base64'));
    await page.close();
  }
  const cell = (n, s, bg, gray) => `<div style="background:${bg};padding:8px 10px;${gray ? 'filter:grayscale(1)' : ''}"><img src="data:image/png;base64,${pngs[n + s]}" width="${s * (s === 16 ? 12 : 6)}" height="${s * (s === 16 ? 12 : 6)}" style="image-rendering:pixelated;display:block"></div>`;
  const rowOf = (s, bg, gray) => `<div style="display:flex;gap:10px;background:${bg};padding:6px">${names.map(n => cell(n, s, bg, gray)).join('')}</div>`;
  const html = `<html><body style="margin:0;background:#888"><div style="display:flex;flex-direction:column;gap:8px;padding:8px;width:max-content">
    ${rowOf(16, '#fff')}${rowOf(16, '#3c3c3c')}${rowOf(16, '#dee1e6', true)}${rowOf(32, '#fff')}${rowOf(32, '#3c3c3c')}</div></body></html>`;
  const page = await browser.newPage({ viewport: { width: 700, height: 1200 }, deviceScaleFactor: 1 });
  await page.setContent(html); await page.waitForTimeout(200);
  await page.screenshot({ path: out, fullPage: true }); await browser.close();
})();
