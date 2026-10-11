// Renders the animated logos to video, GIF and PNG for places that cannot play SVG
// (video editors, slides, social posts, email).
//   NODE_PATH=$(npm root -g) node tools/brand/export-logo.cjs
// Needs Playwright (Chromium) and ffmpeg. Writes into assets/brand/export/.
// PRORES=1 also writes ProRes 4444 .mov files with transparency (large, so not kept in git).

const { chromium } = require("playwright");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const BRAND = path.join(__dirname, "..", "..", "assets", "brand");
const OUT = path.join(BRAND, "export");
const FPS = 30;
const LEAD = 0.4; // empty frames before the first stroke
const HOLD = 1.6; // finished logo held at the end
const { duration } = JSON.parse(fs.readFileSync(path.join(BRAND, "timeline.json"), "utf8"));

const JOBS = [
  // name, svg, width, height, logo width share, background (null = transparent)
  ["johansson-intro-1080p", "johansson-stacked-animated.svg", 1920, 1080, 0.36, "#f5f0e8"],
  ["johansson-intro-1080p-on-dark", "johansson-stacked-on-dark-animated.svg", 1920, 1080, 0.36, "#1f1d1b"],
  ["johansson-intro-1080p-alpha", "johansson-stacked-animated.svg", 1920, 1080, 0.36, null],
  ["johansson-lower-third-alpha", "johansson-horizontal-on-dark-animated.svg", 1920, 1080, 0.3, null, "lower"],
  ["johansson-mark-square", "johansson-mark-animated.svg", 1080, 1080, 0.5, "#f5f0e8"],
];

async function frames(page, job, dir) {
  const [, svgFile, w, h, share, bg, place] = job;
  const svg = fs.readFileSync(path.join(BRAND, svgFile), "utf8").replace("<svg ", `<svg style="width:${share * 100}vw;height:auto;display:block" `);
  const pos = place === "lower" ? "align-items:end;justify-items:start;padding:0 0 7vh 6vw" : "place-items:center";
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<body style="margin:0;height:100vh;display:grid;${pos};background:${bg || "transparent"}">${svg}</body>`);
  const total = Math.round((LEAD + duration + HOLD) * FPS);
  for (let f = 0; f < total; f++) {
    const t = Math.max(0, f / FPS - LEAD) * 1000;
    await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), t);
    await page.screenshot({ path: path.join(dir, `f${String(f).padStart(4, "0")}.png`), omitBackground: !bg });
  }
}

const ff = (...args) => execFileSync(process.env.FFMPEG || "ffmpeg", ["-loglevel", "error", "-y", ...args], { stdio: "inherit" });

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const job of JOBS) {
    const name = job[0];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "jl-"));
    await frames(page, job, dir);
    const seq = ["-framerate", String(FPS), "-i", path.join(dir, "f%04d.png")];
    if (job[5]) {
      ff(...seq, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-movflags", "+faststart", path.join(OUT, `${name}.mp4`));
    } else {
      // WebM keeps transparency for the web; ProRes 4444 for Premiere, Final Cut, DaVinci.
      ff(...seq, "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "30", path.join(OUT, `${name}.webm`));
      if (process.env.PRORES) ff(...seq, "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", path.join(OUT, `${name}.mov`));
    }
    if (name === "johansson-intro-1080p" || name === "johansson-mark-square") {
      ff(...seq, "-vf", "scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse", path.join(OUT, `${name}.gif`));
    }
    const last = fs.readdirSync(dir).sort().pop();
    if (name.endsWith("alpha") && !name.includes("lower")) fs.copyFileSync(path.join(dir, last), path.join(OUT, "johansson-stacked-transparent.png"));
    if (name === "johansson-mark-square") fs.copyFileSync(path.join(dir, last), path.join(OUT, "johansson-mark-1080.png"));
    fs.rmSync(dir, { recursive: true });
    console.log("done", name);
  }
  await browser.close();
})();
