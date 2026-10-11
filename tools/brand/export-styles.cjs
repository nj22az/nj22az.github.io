// Renders every style variation to a 1080p MP4 and a PNG still, plus one reel of all 29.
//   NODE_PATH=$(npm root -g) [SET=final] node tools/brand/export-styles.cjs [slug ...]
// Needs Playwright (Chromium) and ffmpeg. Writes into assets/brand/styles/export/.

const { chromium } = require("playwright");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const SET = process.env.SET || "styles"; // styles (the 29) or final (the three)
const DIR = path.join(__dirname, "..", "..", "assets", "brand", SET);
const MANIFEST = SET === "final" ? "final.json" : "styles.json";
const OUT = path.join(DIR, "export");
const FPS = 30, LEAD = 0.3, HOLD = 1.5;
const only = process.argv.slice(2);
const all = JSON.parse(fs.readFileSync(path.join(DIR, MANIFEST), "utf8"));
const list = all.filter((s) => !only.length || only.includes(s.slug));
const ff = (...a) => execFileSync(process.env.FFMPEG || "ffmpeg", ["-loglevel", "error", "-y", ...a], { stdio: "inherit" });

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const s of list) {
    const svg = fs.readFileSync(path.join(DIR, s.file), "utf8").replace("<svg ", '<svg style="width:100vw;height:100vh;display:block" ');
    await page.setContent(`<body style="margin:0;overflow:hidden">${svg}</body>`);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "jls-"));
    const total = Math.round((LEAD + s.duration / 1000 + HOLD) * FPS);
    for (let f = 0; f < total; f++) {
      const t = Math.max(0, f / FPS - LEAD) * 1000;
      await page.evaluate(async (t) => {
        document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; });
        // Headless Chromium repaints only part of a seeked SVG; a filter toggle repaints all of it.
        const svg = document.querySelector("svg"), frame = () => new Promise((r) => requestAnimationFrame(() => r()));
        svg.style.filter = "opacity(1)"; await frame(); svg.style.filter = ""; await frame();
      }, t);
      await page.screenshot({ path: path.join(dir, `f${String(f).padStart(4, "0")}.png`) });
    }
    const name = s.file.replace(/\.svg$/, "");
    ff("-framerate", String(FPS), "-i", path.join(dir, "f%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-movflags", "+faststart", path.join(OUT, `${name}.mp4`));
    fs.copyFileSync(path.join(dir, fs.readdirSync(dir).sort().pop()), path.join(OUT, `${name}.png`));
    fs.rmSync(dir, { recursive: true });
    console.log("done", name);
  }
  await browser.close();
  // The reel: all variations in order.
  const listFile = path.join(os.tmpdir(), "jls-reel.txt");
  fs.writeFileSync(listFile, all.map((s) => `file '${path.join(OUT, s.file.replace(/\.svg$/, ".mp4"))}'`).join("\n"));
  ff("-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", "-movflags", "+faststart", path.join(OUT, SET === "final" ? "johansson-final-three-reel.mp4" : "johansson-29-styles-reel.mp4"));
  console.log("done reel");
})();
