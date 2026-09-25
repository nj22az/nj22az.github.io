// Renderar filmerna till MP4 (H.264), affischbild och WebVTT-undertexter.
// Kräver en lokal server i repots rot:  python3 -m http.server 8765
// Kör:  node sjoskolan/filmer/render.cjs [film-id …]   (utan id renderas alla)
// Snabbkontroll av enstaka bilder:  node sjoskolan/filmer/render.cjs --stills <katalog> <film-id> <t1,t2,…>
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path');
const pw = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const BASE = process.env.BASE || 'http://localhost:8765/sjoskolan/filmer/spela.html';
const OUT = path.join(__dirname, 'video'); const FPS = 30;

async function open(browser, id) {
  const p = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(`${BASE}?render=1&film=${id}`); await p.waitForFunction(() => window.__frame);
  await p.evaluate(() => document.fonts.ready);
  if (errs.length) throw new Error(errs.join('\n'));
  return p;
}
const grab = (p, t) => p.evaluate((t) => { window.__frame(t); return document.querySelector('canvas').toDataURL('image/png').split(',')[1]; }, t).then((b) => Buffer.from(b, 'base64'));

async function render(browser, id) {
  const p = await open(browser, id); const { duration } = await p.evaluate(() => window.__film);
  const n = Math.ceil(duration * FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(OUT, `${id}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < n; i++) { const buf = await grab(p, i / FPS); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise((r, j) => ff.on('close', (c) => (c ? j(new Error(`ffmpeg ${c}`)) : r())));
  // Affisch från titelkortet (före första repliken) och undertexter
  fs.writeFileSync(path.join(OUT, `${id}.png`), await grab(p, 0.5));
  const vtt = await p.evaluate(async () => { const m = await import('./engine.mjs'); const f = (await import('./films/index.mjs')).FILMS.find((x) => x.id === window.__film.id); return m.toVTT(f); });
  fs.writeFileSync(path.join(OUT, `${id}.vtt`), vtt);
  await p.close(); console.log(`${id}: ${n} bilder, ${duration} s`);
}

(async () => {
  const args = process.argv.slice(2); const browser = await pw.chromium.launch();
  try {
    if (args[0] === '--stills') {
      const [, dir, id, times] = args; const p = await open(browser, id);
      for (const t of times.split(',').map(Number)) fs.writeFileSync(path.join(dir, `${id}_${t}.png`), await grab(p, t));
      return;
    }
    fs.mkdirSync(OUT, { recursive: true });
    const ids = args.length ? args : await (await open(browser, '')).evaluate(async () => (await import('./films/index.mjs')).FILMS.map((f) => f.id));
    for (const id of ids) await render(browser, id);
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
