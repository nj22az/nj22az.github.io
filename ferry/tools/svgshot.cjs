// svgshot.cjs <svg> <png> [x y w h]: a picture of an SVG sheet, or of a part of it at twice the size
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [svg, png, x, y, w, h] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1900, height: 1200 }, deviceScaleFactor: x ? 2 : 1 });
  await p.setContent('<body style="margin:0">' + fs.readFileSync(svg, 'utf8') + '</body>');
  await p.screenshot(x ? { path: png, clip: { x: +x, y: +y, width: +w, height: +h } } : { path: png, fullPage: true });
  await b.close();
})();
