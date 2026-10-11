// Builds the Johansson logo family into assets/brand/.
//   NODE_PATH=$(npm root -g) node tools/brand/build-logo.mjs     (needs opentype.js)
//
// A signature "Johansson" with a spark that flies an arc over the name, leaving a
// tapered line and a trail of twinkles, and the name appearing behind it. The spark
// lands at the end of the arc and stays as a small star. Letter shapes come from the
// Satisfy font (Apache-2.0, tools/brand/fonts/), turned into outlines so no font is
// needed to show the logo. Animated files play once (about 3 s) and hold;
// prefers-reduced-motion shows the finished logo. Inlined SVGs take their colours
// from --jl-ink, --jl-star and --jl-glow.

import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const opentype = require("opentype.js");
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "..", "assets", "brand");
const font = opentype.loadSync(join(HERE, "fonts", "Satisfy-Regular.ttf"));

const COLOURS = {
  light: { ink: "#1d2f57", star: "#d99a2b", glow: "#f4c766" }, // on cream or white
  dark: { ink: "#ffffff", star: "#fff8e6", glow: "#ffd98a" }, // on night blue or black
};

// Timeline (seconds).
const T = { start: 0.25, flight: 1.8, land: 0.55, dust: 1.0 };
const ARRIVE = T.start + T.flight;
const DURATION = ARRIVE + T.dust;

const f = (n) => +n.toFixed(2);
const ease = (u) => 0.5 - Math.cos(Math.PI * u) / 2; // ease-in-out sine
// Deterministic jitter, so every build is the same file.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// A quadratic arc with a length table, so the spark moves at an even speed along it.
function arc(p0, p1, p2) {
  const pt = (t) => [
    (1 - t) ** 2 * p0[0] + 2 * t * (1 - t) * p1[0] + t * t * p2[0],
    (1 - t) ** 2 * p0[1] + 2 * t * (1 - t) * p1[1] + t * t * p2[1],
  ];
  const N = 600, len = [0];
  for (let i = 1; i <= N; i++) {
    const a = pt((i - 1) / N), b = pt(i / N);
    len.push(len[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = len[N];
  const tAt = (s) => {
    const want = s * total;
    let i = len.findIndex((l) => l >= want);
    if (i <= 0) return 0;
    return (i - 1 + (want - len[i - 1]) / (len[i] - len[i - 1])) / N;
  };
  const at = (s) => {
    const t = tAt(s), p = pt(t), q = pt(Math.min(1, t + 1e-3)), r = pt(Math.max(0, t - 1e-3));
    const dx = q[0] - r[0], dy = q[1] - r[1], d = Math.hypot(dx, dy);
    return { x: p[0], y: p[1], nx: -dy / d, ny: dx / d };
  };
  return { at, d: `M${p0.map(f)}Q${p1.map(f)} ${p2.map(f)}` };
}

// Arc drawn as a thin crescent: widest in the middle, sharp at both ends.
function crescent(a, width) {
  const top = [], bot = [];
  for (let i = 0; i <= 80; i++) {
    const s = i / 80, p = a.at(s), w = (width / 2) * Math.sin(Math.PI * s) ** 0.9;
    top.push(`${f(p.x + p.nx * w)} ${f(p.y + p.ny * w)}`);
    bot.unshift(`${f(p.x - p.nx * w)} ${f(p.y - p.ny * w)}`);
  }
  return `M${top.join("L")}L${bot.join("L")}Z`;
}

const STAR = "M0-1C.12-.3.3-.12 1 0C.3.12.12.3 0 1C-.12.3-.3.12-1 0C-.3-.12-.12-.3 0-1Z"; // 4-point twinkle, radius 1

function logo({ text, size, vb, arcPts, arcWidth, starSize, wipeEdge, dustCount }, c, animated, id) {
  const glyphs = font.getPath(text, 0, 0, size);
  const bb = glyphs.getBoundingBox();
  const dx = (vb[2] - (bb.x2 - bb.x1)) / 2 - bb.x1 + (vb.shiftX || 0), dy = vb.baseline;
  const name = font.getPath(text, dx, dy, size).toPathData(2);
  const box = { x1: bb.x1 + dx, x2: bb.x2 + dx, y1: bb.y1 + dy, y2: bb.y2 + dy, w: bb.x2 - bb.x1, h: bb.y2 - bb.y1 };
  const a = arc(...arcPts(box));
  const end = a.at(1);

  const defs =
    `<radialGradient id="${id}g"><stop offset="0" stop-color="var(--jl-glow,${c.glow})" stop-opacity=".9"/>` +
    `<stop offset=".35" stop-color="var(--jl-glow,${c.glow})" stop-opacity=".35"/><stop offset="1" stop-color="var(--jl-glow,${c.glow})" stop-opacity="0"/></radialGradient>`;
  const ink = `fill="var(--jl-ink,${c.ink})"`;
  const star = (cls, s) => `<path class="${cls}" d="${STAR}" transform="scale(${s})" fill="var(--jl-star,${c.star})"/>`;

  if (!animated) {
    return {
      defs,
      body:
        `<path d="${name}" ${ink}/><path d="${crescent(a, arcWidth)}" ${ink}/>` +
        `<g transform="translate(${f(end.x)} ${f(end.y)})"><circle r="${starSize * 1.4}" fill="url(#${id}g)" opacity=".5"/>${star("", starSize * 0.6)}</g>`,
      css: "",
    };
  }

  // Keyframes shared by the spark, the arc mask and the name's wipe, so they stay in step.
  const steps = 40, spark = [], dash = [], wipe = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps, s = ease(u), p = a.at(s);
    const pct = f(((T.start + u * T.flight) / DURATION) * 100);
    spark.push(`${pct}%{transform:translate(${f(p.x)}px,${f(p.y)}px)}`);
    dash.push(`${pct}%{stroke-dashoffset:${f(1 - s)}}`);
    wipe.push(`${pct}%{transform:translateX(${f(p.x)}px)}`);
  }
  const first = a.at(0);
  spark.unshift(`0%{transform:translate(${f(first.x)}px,${f(first.y)}px)}`);
  spark.push(`100%{transform:translate(${f(end.x)}px,${f(end.y)}px)}`);
  dash.unshift(`0%{stroke-dashoffset:1}`);
  dash.push(`100%{stroke-dashoffset:0}`);
  wipe.unshift(`0%{transform:translateX(${f(first.x)}px)}`);
  const done = `${f((ARRIVE / DURATION) * 100 + 8)}%{transform:translateX(${f(vb[2] + wipeEdge + 40)}px)}100%{transform:translateX(${f(vb[2] + wipeEdge + 40)}px)}`;

  // Twinkles left behind the spark; each one sparkles, drifts down and goes out.
  let dust = "", dustCss = "";
  for (let i = 0; i < dustCount; i++) {
    const s = 0.04 + (0.9 * (i + rand() * 0.6)) / dustCount;
    let u = 0, lo = 0, hi = 1; // invert the easing: when does the spark pass s?
    for (let k = 0; k < 30; k++) ((u = (lo + hi) / 2), ease(u) < s ? (lo = u) : (hi = u));
    const p = a.at(s), side = rand() * 2 - 1;
    const x = p.x + p.nx * side * arcWidth * 2.2 + (rand() - 0.5) * 8, y = p.y + p.ny * side * arcWidth * 2.2 + 4;
    const k = starSize * (0.4 + rand() * 0.35);
    dust += `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)})"><path class="d" d="${STAR}" fill="var(--jl-star,${c.star})" style="animation-delay:${f(T.start + u * T.flight)}s"/></g>`;
  }
  dustCss = `.d{opacity:0;transform-box:fill-box;transform-origin:center;animation:${id}-d ${T.dust}s ease-out both}` +
    `@keyframes ${id}-d{0%{opacity:0;transform:translateY(0) scale(0) rotate(0)}20%{opacity:1;transform:translateY(.2px) scale(1) rotate(25deg)}100%{opacity:0;transform:translateY(2.5px) scale(.2) rotate(70deg)}}`;

  const landPct = (t) => f(((ARRIVE + t) / DURATION) * 100);
  const startPct = f((T.start / DURATION) * 100);
  const css =
    `.sp{animation:${id}-sp ${DURATION}s linear both}@keyframes ${id}-sp{${spark.join("")}}` +
    `.am{animation:${id}-am ${DURATION}s linear both}@keyframes ${id}-am{${dash.join("")}}` +
    `.wp{animation:${id}-wp ${DURATION}s linear both}@keyframes ${id}-wp{${wipe.join("")}${done}}` +
    // The spark: grows in, flies, flares on landing, then settles into the resting star.
    `.lf{transform-box:fill-box;transform-origin:center;animation:${id}-lf ${DURATION}s ease-out both}` +
    `@keyframes ${id}-lf{0%{transform:scale(0) rotate(0)}${startPct}%{transform:scale(0) rotate(0)}${f(startPct + 8)}%{transform:scale(1) rotate(90deg)}` +
    `${landPct(0)}%{transform:scale(1) rotate(360deg)}${landPct(0.18)}%{transform:scale(1.9) rotate(405deg)}${landPct(T.land)}%{transform:scale(.6) rotate(450deg)}100%{transform:scale(.6) rotate(450deg)}}` +
    `.gl{animation:${id}-gl ${DURATION}s ease-out both}` +
    `@keyframes ${id}-gl{0%{opacity:0}${startPct}%{opacity:0}${f(startPct + 8)}%{opacity:1}${landPct(0)}%{opacity:1}${landPct(0.18)}%{opacity:1;transform:scale(1.6)}${landPct(T.land)}%{opacity:.5;transform:scale(1)}100%{opacity:.5;transform:scale(1)}}` +
    `.gl{transform-box:fill-box;transform-origin:center}` +
    dustCss +
    `@media (prefers-reduced-motion:reduce){.sp,.am,.wp,.lf,.gl,.d{animation:none!important}` +
    `.sp{transform:translate(${f(end.x)}px,${f(end.y)}px)}.am{stroke-dashoffset:0}.wp{transform:translateX(${f(vb[2] + wipeEdge + 40)}px)}.lf{transform:scale(.6) rotate(450deg)}.gl{opacity:.5}.d{opacity:0}}`;

  return {
    defs:
      defs +
      `<linearGradient id="${id}e"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
      `<mask id="${id}n" maskUnits="userSpaceOnUse" x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}"><g class="wp"><rect x="${-vb[2] - 2 * wipeEdge}" y="${vb[1]}" width="${vb[2] + wipeEdge}" height="${vb[3]}" fill="#fff"/><rect x="${-wipeEdge}" y="${vb[1]}" width="${wipeEdge}" height="${vb[3]}" fill="url(#${id}e)"/></g></mask>` +
      `<mask id="${id}a" maskUnits="userSpaceOnUse" x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}"><path class="am" d="${a.d}" pathLength="1" stroke-dasharray="1 1" fill="none" stroke="#fff" stroke-width="${arcWidth * 6}"/></mask>`,
    body:
      `<path d="${name}" ${ink} mask="url(#${id}n)"/>` +
      `<path d="${crescent(a, arcWidth)}" ${ink} mask="url(#${id}a)"/>` +
      dust +
      `<g class="sp"><circle class="gl" r="${starSize * 1.4}" fill="url(#${id}g)"/>${`<g class="lf">${star("", starSize)}</g>`}</g>`,
    css,
  };
}

const LAYOUTS = {
  // The signature with its arc: headers, title cards, intros.
  signature: {
    text: "Johansson", size: 170, vb: Object.assign([0, 0, 800, 330], { baseline: 258 }),
    arcPts: (b) => [[b.x1 - 30, b.y1 + b.h * 0.42], [b.x1 + b.w * 0.5, b.y1 - b.h * 0.95], [b.x2 + 28, b.y1 + b.h * 0.08]],
    arcWidth: 5, starSize: 16, wipeEdge: 70, dustCount: 16,
  },
  // The J alone with a small arc: avatars, favicons, watermarks.
  mark: {
    text: "J", size: 200, vb: Object.assign([0, 0, 240, 240], { baseline: 175, shiftX: -6 }),
    arcPts: (b) => [[b.x1 - 6, b.y1 + b.h * 0.25], [b.x1 + b.w * 0.55, b.y1 - b.h * 0.42], [b.x2 + 26, b.y1 + b.h * 0.12]],
    arcWidth: 5, starSize: 13, wipeEdge: 40, dustCount: 8,
  },
};

mkdirSync(OUT, { recursive: true });
let n = 0;
for (const [name, L] of Object.entries(LAYOUTS)) {
  for (const [scheme, c] of Object.entries(COLOURS)) {
    for (const animated of [true, false]) {
      seed = 7;
      const id = "jl" + name[0] + scheme[0] + (animated ? "a" : "s");
      const { defs, body, css } = logo(L, c, animated, id);
      const vb = L.vb;
      // Inline <style> applies to the whole page, so every class carries this file's id.
      const scope = (str) => str.replace(/\.(sp|am|wp|lf|gl|d)(?=[{,])/g, `.${id}-$1`).replace(/class="(sp|am|wp|lf|gl|d)"/g, `class="${id}-$1"`);
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb[0]} ${vb[1]} ${vb[2]} ${vb[3]}" width="${vb[2]}" height="${vb[3]}" role="img" aria-label="Johansson">` +
        `<title>Johansson</title>${css ? `<style>${scope(css)}</style>` : ""}<defs>${scope(defs)}</defs>${scope(body)}</svg>\n`;
      writeFileSync(join(OUT, `johansson-${name}${scheme === "dark" ? "-on-dark" : ""}${animated ? "-animated" : ""}.svg`), svg);
      n++;
    }
  }
}
writeFileSync(join(OUT, "timeline.json"), JSON.stringify({ duration: f(DURATION), arrive: f(ARRIVE) }, null, 2) + "\n");
console.log(`${n} files in assets/brand/ (animation ${f(DURATION)} s)`);
