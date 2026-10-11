// Shared tools for the logo builders: Google Fonts subsets (downloaded once into .font-cache),
// per-letter outlines, vertical setting, outline sampling, cubic paths, scoped CSS animation.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const opentype = require("opentype.js");
const HERE = join(dirname(fileURLToPath(import.meta.url)), "..");
const FONTS = join(HERE, ".font-cache");
export const W = 800, H = 450;

// Google Fonts subsets holding only the characters the logos use. They are downloaded on the first
// build into an ignored cache: only the letter outlines go into the logos, never the font files.
const FONT_SOURCES = {
  "inter-200.ttf": ["Inter", 200], "inter-300.ttf": ["Inter", 300], "inter-500.ttf": ["Inter", 500], "inter-800.ttf": ["Inter", 800],
  "belleza.ttf": ["Belleza", 400], "marcellus.ttf": ["Marcellus", 400], "tenor.ttf": ["Tenor Sans", 400],
  "cormorant-500.ttf": ["Cormorant Garamond", 500], "ebgaramond.ttf": ["EB Garamond", 400], "newsreader-300.ttf": ["Newsreader", 300],
  "shippori-500.ttf": ["Shippori Mincho", 500], "notoserifjp-200.ttf": ["Noto Serif JP", 200], "notoserifjp-500.ttf": ["Noto Serif JP", 500],
  "notosansjp-400.ttf": ["Noto Sans JP", 400], "notosansjp-700.ttf": ["Noto Sans JP", 700], "mplusrounded-800.ttf": ["M PLUS Rounded 1c", 800],
  "fredoka-600.ttf": ["Fredoka", 600], "klee-600.ttf": ["Klee One", 600], "zenmaru-700.ttf": ["Zen Maru Gothic", 700],
  "dmsans-800i.ttf": ["DM Sans", "800italic"], "orbitron-600.ttf": ["Orbitron", 600], "archivoblack.ttf": ["Archivo Black", 400],
  "instrument-500.ttf": ["Instrument Sans", 500], "kameron-700.ttf": ["Kameron", 700], "courierprime.ttf": ["Courier Prime", 400],
  "spacemono-700.ttf": ["Space Mono", 700],
};
const CHARS = "JOHANSSONjohansson ヨハンソン ESTMDB2011·—/.-";
mkdirSync(FONTS, { recursive: true });
for (const [file, [family, weight]] of Object.entries(FONT_SOURCES)) {
  if (existsSync(join(FONTS, file))) continue;
  // An old user agent makes Google Fonts answer with TrueType, which opentype.js reads.
  const css = await (await fetch(`https://fonts.googleapis.com/css?family=${encodeURIComponent(family)}:${weight}&text=${encodeURIComponent(CHARS)}`, { headers: { "User-Agent": "Mozilla/4.0" } })).text();
  const url = css.match(/url\((https:[^)]+)\)/)?.[1];
  if (!url) throw new Error(`no font file for ${family} ${weight}`);
  writeFileSync(join(FONTS, file), Buffer.from(await (await fetch(url)).arrayBuffer()));
}
export const fonts = {};
export const font = (file) => (fonts[file] ||= opentype.loadSync(join(FONTS, file)));
export const r2 = (n) => Math.round(n * 100) / 100;

// pixel2motion personality presets (references/motion-personality.md), literal values.
export const EASE = {
  playfulEnter: "cubic-bezier(.34,1.56,.64,1)",
  playfulSettle: "cubic-bezier(.22,1,.36,1)",
  elegantEnter: "cubic-bezier(.4,0,.6,1)",
  elegantSettle: "cubic-bezier(.16,1,.3,1)",
  trustEnter: "cubic-bezier(0,0,.2,1)",
  trustSettle: "cubic-bezier(.4,0,.2,1)",
  boldEnter: "cubic-bezier(.16,1,.3,1)",
  calm: "cubic-bezier(.42,0,.58,1)",
  friendlyEnter: "cubic-bezier(.25,.46,.45,.94)",
  narrative: "cubic-bezier(.34,0,.14,1)",
  natural: "cubic-bezier(.4,0,.2,1)",
};

// Seeded randomness, so every build writes the same files.
export function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

// ---- Type: outlines per letter, so letters can move on their own ------------------------
export function type(file, str, { size, x = W / 2, y, tracking = 0, align = "middle" }) {
  const f = font(file), scale = size / f.unitsPerEm;
  const glyphs = f.stringToGlyphs(str);
  const adv = [];
  let width = 0;
  glyphs.forEach((g, i) => {
    let a = g.advanceWidth * scale;
    if (i < glyphs.length - 1) a += f.getKerningValue(g, glyphs[i + 1]) * scale + tracking;
    adv.push(a);
    width += a;
  });
  let pen = align === "middle" ? x - width / 2 : align === "end" ? x - width : x;
  const letters = [];
  const box = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  glyphs.forEach((g, i) => {
    const p = g.getPath(pen, y, size);
    const b = p.getBoundingBox();
    if (b.x2 > b.x1) {
      letters.push({ ch: str[i], d: p.toPathData(2), path: p, x: pen, b, cx: (b.x1 + b.x2) / 2, cy: (b.y1 + b.y2) / 2 });
      box.x1 = Math.min(box.x1, b.x1); box.y1 = Math.min(box.y1, b.y1);
      box.x2 = Math.max(box.x2, b.x2); box.y2 = Math.max(box.y2, b.y2);
    }
    pen += adv[i];
  });
  return { letters, box, width };
}

// Vertical setting (tategaki): one character per step, centred on cx.
export function vtype(file, str, { size, cx, y0, step }) {
  const f = font(file), scale = size / f.unitsPerEm;
  const letters = [];
  [...str].forEach((ch, i) => {
    const g = f.charToGlyph(ch);
    const p = g.getPath(cx - (g.advanceWidth * scale) / 2, y0 + i * step + size * 0.86, size);
    const b = p.getBoundingBox();
    letters.push({ ch, d: p.toPathData(2), path: p, b, cx: (b.x1 + b.x2) / 2, cy: (b.y1 + b.y2) / 2 });
  });
  return { letters };
}

// Points along glyph outlines (for particles), spaced about `gap` apart.
export function outlinePoints(letters, gap) {
  const pts = [];
  for (const L of letters) {
    let cx = 0, cy = 0, sx = 0, sy = 0, carry = 0;
    const seg = (fn, len) => {
      const n = Math.max(2, Math.ceil(len / 1.5));
      let prev = fn(0);
      for (let i = 1; i <= n; i++) {
        const p = fn(i / n);
        carry += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
        if (carry >= gap) { pts.push(p); carry = 0; }
        prev = p;
      }
    };
    for (const c of L.path.commands) {
      if (c.type === "M") { cx = sx = c.x; cy = sy = c.y; carry = gap; }
      else if (c.type === "L") { const a = [cx, cy]; seg((t) => [a[0] + (c.x - a[0]) * t, a[1] + (c.y - a[1]) * t], Math.hypot(c.x - cx, c.y - cy)); cx = c.x; cy = c.y; }
      else if (c.type === "Q") { const a = [cx, cy]; seg((t) => [(1 - t) ** 2 * a[0] + 2 * t * (1 - t) * c.x1 + t * t * c.x, (1 - t) ** 2 * a[1] + 2 * t * (1 - t) * c.y1 + t * t * c.y], Math.hypot(c.x - cx, c.y - cy) * 1.3); cx = c.x; cy = c.y; }
      else if (c.type === "C") { const a = [cx, cy]; seg((t) => [(1 - t) ** 3 * a[0] + 3 * t * (1 - t) ** 2 * c.x1 + 3 * t * t * (1 - t) * c.x2 + t ** 3 * c.x, (1 - t) ** 3 * a[1] + 3 * t * (1 - t) ** 2 * c.y1 + 3 * t * t * (1 - t) * c.y2 + t ** 3 * c.y], Math.hypot(c.x - cx, c.y - cy) * 1.3); cx = c.x; cy = c.y; }
      else if (c.type === "Z") { const a = [cx, cy]; seg((t) => [a[0] + (sx - a[0]) * t, a[1] + (sy - a[1]) * t], Math.hypot(sx - cx, sy - cy)); cx = sx; cy = sy; }
    }
  }
  return pts;
}

// A cubic curve with an arc-length table, for things that travel along a path.
export function cubic(p0, p1, p2, p3) {
  const pt = (t) => [0, 1].map((k) => (1 - t) ** 3 * p0[k] + 3 * t * (1 - t) ** 2 * p1[k] + 3 * t * t * (1 - t) * p2[k] + t ** 3 * p3[k]);
  const N = 400, len = [0];
  for (let i = 1; i <= N; i++) { const a = pt((i - 1) / N), b = pt(i / N); len.push(len[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const at = (s) => {
    const want = s * len[N];
    let i = len.findIndex((l) => l >= want);
    const t = i <= 0 ? 0 : (i - 1 + (want - len[i - 1]) / (len[i] - len[i - 1] || 1)) / N;
    const p = pt(t), q = pt(Math.min(1, t + 0.002)), r = pt(Math.max(0, t - 0.002));
    return { x: p[0], y: p[1], deg: (Math.atan2(q[1] - r[1], q[0] - r[0]) * 180) / Math.PI };
  };
  return { at, d: `M${p0}C${p1} ${p2} ${p3}` };
}

// ---- One variation's SVG and CSS ---------------------------------------------------------
export function variation(key) {
  const css = [], defs = [], body = [];
  let n = 0, end = 0;
  const c = (name) => `${key}-${name}`;
  // anim(class, keyframes, ms, easing, delay, maxDelay): keyframes must not restate the final state.
  const anim = (cls, frames, ms, ease, delay = 0, maxDelay = delay, extra = "") => {
    const kf = `${key}-k${++n}`;
    css.push(`.${c(cls)}{animation:${kf} ${ms}ms ${ease} ${delay}ms backwards${extra}}@keyframes ${kf}{${frames}}`);
    end = Math.max(end, maxDelay + ms);
  };
  const tb = (origin = "center") => `transform-box:fill-box;transform-origin:${origin}`;
  return { key, c, css, defs, body, anim, tb, get end() { return end; } };
}

export const pathOf = (L, attrs = "") => `<path d="${L.d}" ${attrs}/>`;
export const rect = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
