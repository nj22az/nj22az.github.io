// Motion QA for the style variations (pixel2motion's Motion QA, steps 1 and 5).
//   NODE_PATH=$(npm root -g) node tools/brand/qa-styles.cjs <out-dir> [slug ...]
// For each variation: frames at 0, 25, 50, 75 % and the end, a contact sheet row, and the
// Final Frame Contract: the animated file at its end must equal the still file exactly.

const { chromium } = require("playwright");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "..", "assets", "brand", "styles");
const [out, ...only] = process.argv.slice(2);
if (!out) throw new Error("usage: qa-styles.cjs <out-dir> [slug ...]");
fs.mkdirSync(out, { recursive: true });
const list = JSON.parse(fs.readFileSync(path.join(DIR, "styles.json"), "utf8")).filter((s) => !only.length || only.includes(s.slug));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 450 } });
  const shot = async (file, t) => {
    await page.setContent(`<body style="margin:0">${fs.readFileSync(path.join(DIR, file), "utf8")}</body>`);
    if (t != null) await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), t);
    // Headless Chromium repaints only part of an SVG after a paused animation is seeked; toggling a
    // filter on the root forces the whole picture to repaint before the screenshot.
    await page.evaluate(async () => {
      const svg = document.querySelector("svg"), frame = () => new Promise((r) => requestAnimationFrame(() => r()));
      svg.style.filter = "opacity(1)"; await frame(); svg.style.filter = ""; await frame(); await frame();
    });
    return page.screenshot();
  };
  let failed = 0;
  for (const s of list) {
    const T = s.duration + 100;
    const frames = [];
    for (const f of [0, 0.25, 0.5, 0.75]) {
      const p = path.join(out, `${s.slug}-${Math.round(f * 100)}.png`);
      fs.writeFileSync(p, await shot(s.file, f * T));
      frames.push(p);
    }
    const endShot = await shot(s.file, T);
    const stillShot = await shot(s.still, null);
    const ok = Buffer.compare(endShot, stillShot) === 0;
    if (!ok) failed++;
    const pe = path.join(out, `${s.slug}-end.png`);
    fs.writeFileSync(pe, endShot);
    fs.writeFileSync(path.join(out, `${s.slug}-still.png`), stillShot);
    frames.push(pe);
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...frames.flatMap((f) => ["-i", f]), "-filter_complex", `${frames.map((_, i) => `[${i}]scale=320:-1[s${i}]`).join(";")};${frames.map((_, i) => `[s${i}]`).join("")}hstack=${frames.length}`, path.join(out, `row-${String(s.n).padStart(2, "0")}-${s.slug}.png`)]);
    console.log(`${String(s.n).padStart(2)} ${s.slug.padEnd(12)} ${s.duration}ms  final frame ${ok ? "== still" : "DIFFERS from still"}`);
  }
  await browser.close();
  if (failed) process.exitCode = 1;
})();
