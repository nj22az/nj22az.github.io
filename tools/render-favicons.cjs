// Renders the favicons with Chromium (Playwright), so the PNGs match what a browser draws from the SVG.
//   sheet <dir> <out.png>      judging sheet: tab strips at 16/32 px (light + dark), then 64/128/256
//   png <svg> <size> <out.png> one transparent PNG at that size
const { chromium } = require('playwright');
const fs = require('node:fs'); const path = require('node:path');
const [mode, a, b, c] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  if (mode === 'png') {
    const page = await browser.newPage({ viewport: { width: +b, height: +b }, deviceScaleFactor: 1 });
    const svg = fs.readFileSync(a, 'utf8');
    await page.setContent(`<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${b}" height="${b}" style="display:block"></body></html>`);
    await page.waitForTimeout(200);
    await page.screenshot({ path: c, omitBackground: true, clip: { x: 0, y: 0, width: +b, height: +b } });
    await browser.close(); return;
  }
  const names = ['office', 'hotels', 'world'];
  const svgs = Object.fromEntries(names.map(n => { const p = path.join(a, n + '.svg'); return [n, fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null]; }));
  const img = (n, s) => svgs[n] ? `<img src="data:image/svg+xml;base64,${Buffer.from(svgs[n]).toString('base64')}" width="${s}" height="${s}" style="display:block">` : `<div style="width:${s}px;height:${s}px;border:1px dashed #c00"></div>`;
  const tab = (n, s, label, dark) => `<div style="display:flex;align-items:center;gap:8px;padding:0 14px;height:${s + 20}px;border-radius:8px 8px 0 0;background:${dark ? '#3c3c3c' : '#fff'};color:${dark ? '#eee' : '#222'};font:${s === 16 ? 13 : 15}px system-ui;box-shadow:0 0 0 1px ${dark ? '#555' : '#ddd'}">${img(n, s)}<span>${label}</span></div>`;
  const labels = { office: 'The Office of Nils Johansson', hotels: 'Hotels & Parking', world: 'Johansson World' };
  const strip = (s, dark) => `<div style="display:flex;gap:6px;align-items:flex-end;padding:14px 14px 0;background:${dark ? '#202124' : '#dee1e6'}">${names.map(n => tab(n, s, labels[n], dark)).join('')}</div>`;
  const row = s => `<div style="display:flex;gap:28px;align-items:center;padding:14px 20px"><span style="width:60px;font:12px system-ui;color:#555">${s} px</span>${names.map(n => img(n, s)).join('')}</div>`;
  const html = `<html><body style="margin:0;background:#f5f8fa;font-family:system-ui"><div style="width:980px">${strip(16, false)}${strip(16, true)}${strip(32, false)}${strip(32, true)}<div style="padding:8px 20px;font:12px system-ui;color:#555">Larger sizes (bookmark bar, home screen, app list)</div>${row(64)}${row(128)}${row(256)}</div></body></html>`;
  const page = await browser.newPage({ viewport: { width: 980, height: 1200 }, deviceScaleFactor: 2 });
  await page.setContent(html); await page.waitForTimeout(300);
  await page.screenshot({ path: b, fullPage: true });
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
