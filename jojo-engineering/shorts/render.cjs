// Renders the shorts to vertical MP4 (1080×1920, H.264 + AAC), a cover image, SRT captions and an
// upload sheet with title, description and tags.
// Needs a local server in the repo root:  python3 -m http.server 8765
// Run:  node jojo-engineering/shorts/render.cjs [--no-talk] [id …]    (no id renders all)
//       --no-talk leaves out the talk blips so you can record your own voice-over on the music.
// ffmpeg comes from the FFMPEG environment variable, or PATH.
const { spawn, execFileSync, execSync } = require('child_process');
const fs = require('fs'); const os = require('os'); const path = require('path');
const pw = require(execSync('npm root -g').toString().trim() + '/playwright');
const BASE = process.env.BASE || 'http://localhost:8765/jojo-engineering/shorts/play.html';
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const OUT = path.join(__dirname, 'video'); const FPS = 30;

async function open(browser, id) {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(`${BASE}?render=1&short=${id}`); await p.waitForFunction(() => window.__frame);
  await p.evaluate(() => document.fonts.ready);
  if (errs.length) throw new Error(errs.join('\n'));
  return p;
}
const grab = (p, t) => p.evaluate((t) => { window.__frame(t); return document.querySelector('canvas').toDataURL('image/png').split(',')[1]; }, t).then((b) => Buffer.from(b, 'base64'));

function sheet(sh) {
  const tags = sh.tags.map((t) => `#${t.replace(/[^\w]+/g, '')}`).join(' ');
  return `TITLE\n${sh.title}\n\nDESCRIPTION\n${sh.desc}\n\n${tags} #shorts\n\nTAGS\n${sh.tags.join(', ')}\n\nCAPTIONS\nUpload ${sh.id}.srt as English subtitles.\n`;
}

async function render(browser, id, talk) {
  const p = await open(browser, id);
  const sh = await p.evaluate(async () => {
    const s = (await import('./index.mjs')).SHORTS.find((x) => x.id === window.__short.id);
    return { ...window.__short, title: s.title, desc: s.desc, tags: s.tags, srt: (await import('./engine.mjs')).toSRT(s) };
  });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'short-'));
  const tl = path.join(tmp, 'timeline.json'), wav = path.join(tmp, 'audio.wav');
  fs.writeFileSync(tl, JSON.stringify({ duration: sh.duration, lines: sh.lines, cuts: sh.cuts }));
  execFileSync('python3', [path.join(__dirname, 'audio.py'), tl, wav, ...(talk ? [] : ['--no-talk'])]);
  const n = Math.ceil(sh.duration * FPS);
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-i', wav,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ar', '44100',
    '-shortest', '-movflags', '+faststart', path.join(OUT, `${id}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < n; i++) { const buf = await grab(p, i / FPS); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise((r, j) => ff.on('close', (c) => (c ? j(new Error(`ffmpeg ${c}`)) : r())));
  fs.writeFileSync(path.join(OUT, `${id}.png`), await grab(p, sh.cover));
  fs.writeFileSync(path.join(OUT, `${id}.srt`), sh.srt);
  fs.writeFileSync(path.join(OUT, `${id}.txt`), sheet(sh));
  fs.rmSync(tmp, { recursive: true, force: true });
  await p.close(); console.log(`${id}: ${n} frames, ${sh.duration} s`);
}

(async () => {
  const args = process.argv.slice(2); const talk = !args.includes('--no-talk');
  const ids0 = args.filter((a) => !a.startsWith('--'));
  const browser = await pw.chromium.launch();
  try {
    fs.mkdirSync(OUT, { recursive: true });
    const ids = ids0.length ? ids0 : await (await open(browser, '')).evaluate(async () => (await import('./index.mjs')).IDS);
    for (const id of ids) await render(browser, id, talk);
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
