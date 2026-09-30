// node tools/rendera.cjs <playwright-rot> <utmapp> <bas-url> m=generator&v=0 ... → <utmapp>/<namn>.png och .json
const { chromium } = require(process.argv[2] + '/playwright');
const fs = require('fs');
(async () => {
  const [ut, bas, ...jobb] = process.argv.slice(3);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage();
  for (const j of jobb) {
    const i = j.indexOf('='), namn = j.slice(0, i), fraga = j.slice(i + 1);
    await p.goto(fraga.startsWith('/') ? `${bas}${fraga}` : `${bas}/sjoskolan/figurer3d/rendera.html?${fraga}`);   // /sökväg?… = annan renderingssida
    await p.waitForFunction(() => window.RESULTAT, null, { timeout: 60000, polling: 250 });
    const r = await p.evaluate(() => window.RESULTAT);
    fs.writeFileSync(`${ut}/${namn}.png`, Buffer.from(r.bild.split(',')[1], 'base64'));
    fs.writeFileSync(`${ut}/${namn}.json`, JSON.stringify(r.ankare));
    console.log(namn, Object.keys(r.ankare).length);
  }
  await b.close();
})();
