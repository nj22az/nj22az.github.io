// Builds 29 style variations of the Johansson logo into assets/brand/styles/.
//   NODE_PATH=$(npm root -g) node tools/brand/build-styles.mjs     (needs opentype.js)
//
// Each variation takes its palette, type and mood from one Japanese design system in
// awesome-design-md-jp (kzhrknt/awesome-design-md-jp, design-md/<source>/DESIGN.md), and its motion
// from the pixel2motion method (nolangz/pixel2motion): personality words → preset tokens →
// reveal pattern, with the 12 animation principles it leans on recorded per variation.
//
// Rules every variation keeps (pixel2motion's Final Frame Contract and composition rules):
// - The base CSS of every element IS the final logo; keyframes only describe where motion
//   starts (from/intermediate stops, never a 100% that differs). Animations fill backwards
//   only: once one ends it stops applying, so the last frame, ?static=1 and the still SVG are
//   the same pixels (a finished animation that kept filling forwards would leave the element
//   on its own compositing layer and shift its anti-aliasing).
// - All motion sits inside @media (prefers-reduced-motion: no-preference).
// - Easing is written as literal cubic-bezier values, never var() inside keyframes.
// - Animated elements carry no transform attribute; position lives on a parent <g>.
// - Every class, id and keyframe name starts with the variation's key, so any number of
//   variations can be inlined on one page.

import { mkdirSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { W, H, r2, EASE, rng, type, vtype, outlinePoints, cubic, variation, pathOf } from "./lib/kit.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "assets", "brand", "styles");
// ---- The 29 variations -------------------------------------------------------------------
// Each entry: source design system, the personality words read from its DESIGN.md, the
// pixel2motion preset and reveal pattern chosen from them, the principles it leans on, and
// a build function that writes the artwork into the variation.
const V = [];
const def = (o) => V.push(o);

def({
  slug: "muji", title: "Kinari", source: "muji", words: "quiet, plain, unhurried", preset: "Calm",
  pattern: "Staggered fade with a growing rule", principles: ["Staging", "Slow in/out", "Timing", "Appeal"],
  bg: "#f4eede",
  build(v) {
    const wm = type("inter-500.ttf", "JOHANSSON", { size: 54, y: 228, tracking: 7 });
    const kana = type("notosansjp-400.ttf", "ヨハンソン", { size: 17, y: 272, tracking: 9 });
    v.body.push(`<g class="${v.c("wm")}" fill="#3c3c43">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.body.push(`<g class="${v.c("kana")}" fill="#6d6d72">${kana.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.body.push(`<rect class="${v.c("rule")}" x="376" y="300" width="48" height="2" fill="#7f0019"/>`);
    v.anim("wm", `from{opacity:0;transform:translateY(5px)}`, 1300, EASE.calm, 200);
    v.anim("kana", `from{opacity:0;transform:translateY(4px)}`, 1100, EASE.calm, 700);
    v.css.push(`.${v.c("rule")}{${v.tb()}}`);
    v.anim("rule", `from{transform:scaleX(0)}`, 900, EASE.calm, 1300);
  },
});

def({
  slug: "aesop", title: "Apothecary", source: "aesop", words: "literary, ascetic, measured", preset: "Elegant",
  pattern: "Letter cascade, reading order, no deformation", principles: ["Timing", "Staging", "Follow through", "Appeal"],
  bg: "#fffef2",
  build(v) {
    const wm = type("marcellus.ttf", "JOHANSSON", { size: 60, y: 232, tracking: 15 });
    const est = type("newsreader-300.ttf", "EST. 2011", { size: 17, y: 290, tracking: 5 });
    v.body.push(`<g fill="#333333">${wm.letters.map((l, i) => pathOf(l, `class="${v.c("l")}" style="animation-delay:${200 + i * 120}ms"`)).join("")}</g>`);
    v.body.push(`<rect class="${v.c("rule")}" x="340" y="258" width="120" height="1" fill="#666666"/>`);
    v.body.push(`<g class="${v.c("est")}" fill="#666666">${est.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.anim("l", `from{opacity:0;transform:translateY(3px)}`, 900, EASE.elegantEnter, 200, 200 + 8 * 120);
    v.css.push(`.${v.c("rule")}{${v.tb()}}`);
    v.anim("rule", `from{transform:scaleX(0)}`, 900, EASE.elegantSettle, 1250);
    v.anim("est", `from{opacity:0}`, 800, EASE.elegantEnter, 1600);
  },
});

def({
  slug: "aman", title: "Serene", source: "aman-tokyo", words: "serene, understated, silent", preset: "Elegant",
  pattern: "Slow mask wipe upward, kana first", principles: ["Staging", "Timing", "Slow in/out", "Appeal"],
  bg: "#f3eee7",
  build(v) {
    const kana = type("notoserifjp-200.ttf", "ヨハンソン", { size: 16, y: 160, tracking: 12 });
    const wm = type("newsreader-300.ttf", "Johansson", { size: 78, y: 262 });
    v.body.push(`<g class="${v.c("kana")}" fill="#313131">${kana.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.body.push(`<g class="${v.c("wm")}" fill="#313131">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.anim("kana", `from{opacity:0}`, 1400, EASE.elegantEnter, 150);
    v.anim("wm", `from{clip-path:inset(100% 0 0 0);transform:translateY(6px)}`, 1800, EASE.elegantEnter, 700);
  },
});

def({
  slug: "yohji", title: "Black poetics", source: "yohjiyamamoto", words: "dark, poetic, anti-commercial", preset: "Elegant",
  pattern: "A falling hairline, then a curtain reveal", principles: ["Anticipation", "Staging", "Timing", "Appeal"],
  bg: "#000000",
  build(v) {
    const wm = type("tenor.ttf", "johansson", { size: 66, x: 96, y: 336, tracking: 3, align: "start" });
    v.body.push(`<rect class="${v.c("line")}" x="96" y="70" width="1" height="200" fill="#ffffff"/>`);
    v.body.push(`<g class="${v.c("wm")}" fill="#ffffff">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.css.push(`.${v.c("line")}{${v.tb("top")}}`);
    v.anim("line", `from{transform:scaleY(0)}`, 1100, EASE.elegantEnter, 200);
    v.anim("wm", `from{clip-path:inset(0 0 100% 0);opacity:.2}`, 1600, EASE.elegantSettle, 1050);
  },
});

def({
  slug: "toraya", title: "Seasonal sweets", source: "toraya", words: "refined, seasonal, gentle", preset: "Elegant",
  pattern: "Two pastel circles bloom, then a wipe", principles: ["Follow through", "Staging", "Slow in/out", "Appeal"],
  bg: "#ffffff",
  build(v) {
    v.body.push(`<g style="mix-blend-mode:multiply"><circle class="${v.c("a")}" cx="210" cy="215" r="62" fill="#eee0e9"/><circle class="${v.c("b")}" cx="250" cy="235" r="62" fill="#d6e2db" style="mix-blend-mode:multiply"/></g>`);
    const wm = type("shippori-500.ttf", "Johansson", { size: 60, x: 330, y: 246, align: "start" });
    const kana = type("notosansjp-400.ttf", "ヨハンソン", { size: 15, x: 333, y: 286, tracking: 7, align: "start" });
    v.body.push(`<g class="${v.c("wm")}" fill="#27455c">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.body.push(`<g class="${v.c("kana")}" fill="#111111">${kana.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.css.push(`.${v.c("a")},.${v.c("b")}{${v.tb()}}`);
    v.anim("a", `from{transform:scale(.6);opacity:0}`, 1300, EASE.elegantSettle, 100);
    v.anim("b", `from{transform:scale(.6);opacity:0}`, 1300, EASE.elegantSettle, 320);
    v.anim("wm", `from{clip-path:inset(0 100% 0 0)}`, 1200, EASE.elegantEnter, 800);
    v.anim("kana", `from{opacity:0}`, 900, EASE.elegantEnter, 1500);
  },
});

def({
  slug: "ippodo", title: "Tea steam", source: "ippodo", words: "quiet, ma, tea-room calm", preset: "Calm",
  pattern: "Kana rise like steam, blur clearing", principles: ["Slow in/out", "Arcs", "Overlapping action", "Timing"],
  bg: "#ffffff",
  build(v) {
    const kana = type("shippori-500.ttf", "ヨハンソン", { size: 58, y: 230, tracking: 14 });
    const wm = type("notosansjp-400.ttf", "JOHANSSON", { size: 14, y: 286, tracking: 11 });
    v.body.push(`<g fill="#93806f">${kana.letters.map((l, i) => pathOf(l, `class="${v.c("k")}" style="animation-delay:${150 + i * 170}ms"`)).join("")}</g>`);
    v.body.push(`<rect class="${v.c("rule")}" x="385" y="256" width="30" height="1" fill="#93806f"/>`);
    v.body.push(`<g class="${v.c("wm")}" fill="#3a3a3a">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.anim("k", `from{opacity:0;transform:translateY(16px);filter:blur(5px)}`, 1100, EASE.calm, 150, 150 + 4 * 170);
    v.css.push(`.${v.c("rule")}{${v.tb()}}`);
    v.anim("rule", `from{transform:scaleX(0)}`, 700, EASE.calm, 1300);
    v.anim("wm", `from{opacity:0}`, 900, EASE.calm, 1500);
  },
});

def({
  slug: "nintendo", title: "Play red", source: "nintendo", words: "friendly, iconic, joyful", preset: "Playful",
  pattern: "Scale-pop with anticipation, letters hop in", principles: ["Anticipation", "Squash & stretch", "Exaggeration", "Follow through", "Appeal"],
  bg: "#ffffff",
  build(v) {
    const j = type("mplusrounded-800.ttf", "J", { size: 78, x: 190, y: 250 });
    const wm = type("mplusrounded-800.ttf", "Johansson", { size: 62, x: 268, y: 248, align: "start" });
    v.body.push(`<g class="${v.c("mark")}"><circle cx="190" cy="222" r="56" fill="#e60012"/><g fill="#ffffff">${j.letters.map((l) => pathOf(l)).join("")}</g></g>`);
    v.body.push(`<g fill="#3c3c3c">${wm.letters.map((l, i) => pathOf(l, `class="${v.c("l")}" style="animation-delay:${450 + i * 55}ms"`)).join("")}</g>`);
    v.css.push(`.${v.c("mark")}{${v.tb()}}.${v.c("l")}{${v.tb("bottom")}}`);
    v.anim("mark", `0%{transform:scale(.6);opacity:0}20%{transform:scale(.5);opacity:1}60%{transform:scale(1.12)}80%{transform:scale(.97)}`, 800, EASE.narrative, 0);
    v.anim("l", `0%{opacity:0;transform:translateY(22px) scale(1,1)}45%{opacity:1;transform:translateY(-8px) scale(.92,1.1)}75%{transform:translateY(0) scale(1.08,.9)}`, 520, EASE.friendlyEnter, 450, 450 + 8 * 55);
  },
});

def({
  slug: "ghibli", title: "Wind and leaf", source: "ghibli", words: "warm, handmade, classic", preset: "Friendly",
  pattern: "A gust draws on, a leaf rides it, letters lift as it passes", principles: ["Arcs", "Secondary action", "Overlapping action", "Slow in/out", "Appeal"],
  bg: "#fafafa",
  build(v) {
    const wm = type("klee-600.ttf", "Johansson", { size: 82, y: 240 });
    const gust = cubic([130, 330], [300, 250], [470, 380], [690, 290]);
    v.body.push(`<path class="${v.c("gust")}" d="${gust.d}" pathLength="1" fill="none" stroke="#109ceb" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 1.2" opacity=".55"/>`);
    v.body.push(`<g fill="#221815">${wm.letters.map((l, i) => pathOf(l, `class="${v.c("l")}" style="animation-delay:${300 + ((l.cx - 150) / 520) * 1300}ms"`)).join("")}</g>`);
    // The leaf rides the gust, then settles at its end.
    const steps = 30, frames = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps, s = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2, p = gust.at(s);
      frames.push(`${r2(14 + u * 86)}%{transform:translate(${r2(p.x)}px,${r2(p.y)}px) rotate(${r2(p.deg + Math.sin(u * 9) * 25)}deg)}`);
    }
    const last = gust.at(1);
    v.body.push(`<g class="${v.c("leaf")}" style="transform:translate(${r2(last.x)}px,${r2(last.y)}px) rotate(${r2(last.deg)}deg)"><path d="M-14 0C-8-9 6-9 14 0C6 9-8 9-14 0Z" fill="#f79b30"/><path d="M-14 0H10" stroke="#c9741a" stroke-width="1.2"/></g>`);
    v.anim("gust", `from{stroke-dashoffset:1.1}`, 1800, EASE.calm, 200);
    v.anim("l", `from{opacity:0;transform:translateY(10px) rotate(-3deg)}`, 800, EASE.friendlyEnter, 300, 1600);
    v.anim("leaf", `0%{opacity:0;transform:translate(130px,330px) rotate(-20deg)}12%{opacity:1;transform:translate(130px,330px) rotate(-20deg)}${frames.join("")}`, 2200, "linear", 0);
  },
});

def({
  slug: "sanrio", title: "Pastel pop", source: "sanrio", words: "pastel, round, character-led", preset: "Playful",
  pattern: "Letters drop with squash and stretch, two stars twinkle", principles: ["Squash & stretch", "Exaggeration", "Secondary action", "Follow through", "Appeal"],
  bg: "#ffffff",
  build(v) {
    const wm = type("fredoka-600.ttf", "johansson", { size: 92, y: 262, tracking: 2 });
    const cols = ["#e383a8", "#71c6d6"];
    v.body.push(wm.letters.map((l, i) => pathOf(l, `class="${v.c("l")}" fill="${cols[i % 2]}" style="animation-delay:${150 + i * 75}ms"`)).join(""));
    const star = "M0-1C.12-.3.3-.12 1 0C.3.12.12.3 0 1C-.12.3-.3.12-1 0C-.3-.12-.12-.3 0-1Z";
    [[184, 140, 14, "#e383a8"], [622, 150, 10, "#71c6d6"]].forEach(([x, y, s, col], i) =>
      v.body.push(`<g transform="translate(${x} ${y}) scale(${s})"><path class="${v.c("st")}" d="${star}" fill="${col}" style="animation-delay:${1050 + i * 180}ms"/></g>`));
    v.css.push(`.${v.c("l")}{${v.tb("bottom")}}.${v.c("st")}{${v.tb()}}`);
    v.anim("l", `0%{opacity:0;transform:translateY(-120px) scale(.85,1.25)}55%{opacity:1;transform:translateY(0) scale(.85,1.2)}70%{transform:translateY(0) scale(1.2,.78)}85%{transform:translateY(-6px) scale(.96,1.04)}`, 700, "cubic-bezier(.5,0,.75,0)", 150, 150 + 8 * 75);
    v.anim("st", `0%{transform:scale(0) rotate(-90deg)}60%{transform:scale(1.4) rotate(15deg)}`, 600, EASE.playfulSettle, 1050, 1230);
  },
});

def({
  slug: "teamlab", title: "Particles", source: "teamlab", words: "immersive, art-first, luminous", preset: "Energetic",
  pattern: "Particles converge onto the outlines, then the letters light", principles: ["Staging", "Overlapping action", "Arcs", "Secondary action", "Appeal"],
  bg: "#0e0f0e",
  build(v) {
    const wm = type("inter-200.ttf", "JOHANSSON", { size: 66, y: 250, tracking: 16 });
    const pts = outlinePoints(wm.letters, 9), rand = rng(11);
    const dots = pts.map(([x, y]) => {
      const a = rand() * Math.PI * 2, d = 160 + rand() * 260, delay = Math.round(rand() * 500);
      return `<circle class="${v.c("p")}" cx="${r2(x)}" cy="${r2(y)}" r="1.6" fill="#ffffff" style="--dx:${r2(Math.cos(a) * d)}px;--dy:${r2(Math.sin(a) * d * 0.6)}px;animation-delay:${delay}ms;animation-duration:1400ms,${2500 - delay}ms"/>`;
    });
    v.body.push(`<g class="${v.c("wm")}" fill="#ffffff">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.body.push(`<g>${dots.join("")}</g>`);
    // Particles end invisible (opacity 0 is their final state), so the still logo is the letters alone.
    // Two animations on one clock: travel (transform) and life (fade in, hold, fade out by 2500 ms).
    const kf1 = `${v.key}-fly`, kf2 = `${v.key}-life`;
    v.css.push(`.${v.c("p")}{opacity:0}`);
    v.css.push(`.${v.c("p")}{animation:${kf1} 1400ms ${EASE.boldEnter} backwards,${kf2} linear backwards}` +
      `@keyframes ${kf1}{from{transform:translate(var(--dx),var(--dy))}}` +
      `@keyframes ${kf2}{0%{opacity:0}10%{opacity:1}75%{opacity:1}100%{opacity:0}}`);
    v.anim("wm", `from{opacity:0}`, 700, EASE.natural, 1650);
    v.anim("dummy", `from{opacity:1}`, 1, "linear", 2499);
  },
});

def({
  slug: "rhizomatiks", title: "Signal", source: "rhizomatiks", words: "technical, greyscale, exact", preset: "Professional",
  pattern: "Horizontal slices snap into register, a scan line passes", principles: ["Timing", "Staging", "Overlapping action", "Solid drawing"],
  bg: "#f0f0f0",
  build(v) {
    const wm = type("notoserifjp-500.ttf", "JOHANSSON", { size: 68, y: 246, tracking: 5 });
    const kana = type("notoserifjp-200.ttf", "ヨハンソン", { size: 16, y: 292, tracking: 10 });
    const y1 = wm.box.y1 - 4, y2 = wm.box.y2 + 4, hs = (y2 - y1) / 8, rand = rng(5);
    v.defs.push(`<g id="${v.c("wm")}">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    for (let i = 0; i < 8; i++) {
      v.defs.push(`<clipPath id="${v.c("s" + i)}"><rect x="0" y="${r2(y1 + i * hs)}" width="${W}" height="${r2(hs + 0.6)}"/></clipPath>`);
      const dx = Math.round((rand() - 0.5) * 240);
      v.body.push(`<g clip-path="url(#${v.c("s" + i)})"><use href="#${v.c("wm")}" class="${v.c("sl")}" fill="#1a1a1a" style="--dx:${dx}px;animation-delay:${300 + i * 45}ms"/></g>`);
    }
    v.body.push(`<g class="${v.c("kana")}" fill="#666666">${kana.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.body.push(`<rect class="${v.c("scan")}" x="0" y="${r2(y1)}" width="${W}" height="1" fill="#1a1a1a" opacity="0"/>`);
    v.anim("sl", `0%{transform:translateX(var(--dx));opacity:0}30%{opacity:.35}70%{transform:translateX(calc(var(--dx) * -.04));opacity:1}`, 650, "cubic-bezier(.7,0,.2,1)", 300, 300 + 7 * 45);
    v.anim("scan", `0%{opacity:0;transform:translateY(0)}6%{opacity:.6;transform:translateY(0)}100%{opacity:0;transform:translateY(${r2(y2 - y1)}px)}`, 700, "linear", 900);
    v.anim("kana", `from{opacity:0}`, 600, EASE.trustEnter, 1300);
  },
});

def({
  slug: "kurashi", title: "Vertical print", source: "kurashi-no-techo", words: "print, mincho, handwork", preset: "Calm",
  pattern: "Brush-down reveal in writing order, then the seal stamps", principles: ["Staging", "Timing", "Squash & stretch", "Follow through"],
  bg: "#efefe2",
  build(v) {
    const kana = vtype("shippori-500.ttf", "ヨハンソン", { size: 60, cx: 400, y0: 46, step: 64 });
    v.body.push(`<g fill="#222222">${kana.letters.map((l, i) => pathOf(l, `class="${v.c("k")}" style="animation-delay:${200 + i * 300}ms"`)).join("")}</g>`);
    const j = type("shippori-500.ttf", "J", { size: 34, x: 466, y: 384 });
    v.body.push(`<g class="${v.c("seal")}"><rect x="444" y="350" width="44" height="44" rx="4" fill="#df2016"/><g fill="#efefe2">${j.letters.map((l) => pathOf(l)).join("")}</g></g>`);
    v.anim("k", `from{clip-path:inset(0 0 100% 0)}`, 420, EASE.natural, 200, 200 + 4 * 300);
    v.css.push(`.${v.c("seal")}{${v.tb()}}`);
    v.anim("seal", `0%{opacity:0;transform:scale(1.5) rotate(-8deg)}55%{opacity:1;transform:scale(.92) rotate(0)}80%{transform:scale(1.03)}`, 420, EASE.boldEnter, 1850);
  },
});

def({
  slug: "hobonichi", title: "Letter stickers", source: "hobonichi", words: "intimate, colourful, round", preset: "Playful",
  pattern: "Each letter pops on like a sticker, tilts, then sits straight", principles: ["Exaggeration", "Overlapping action", "Squash & stretch", "Appeal"],
  bg: "#f3fff4",
  build(v) {
    const wm = type("zenmaru-700.ttf", "johansson", { size: 86, y: 258, tracking: 2 });
    const cols = ["#3e3e3e", "#5dae64", "#d9a300", "#3e8fd0"];
    const rand = rng(3);
    v.body.push(wm.letters.map((l, i) => pathOf(l, `class="${v.c("l")}" fill="${cols[i % 4]}" style="--r:${Math.round((rand() - 0.5) * 30)}deg;animation-delay:${120 + i * 85}ms"`)).join(""));
    v.css.push(`.${v.c("l")}{${v.tb()}}`);
    v.anim("l", `0%{opacity:0;transform:scale(0) rotate(var(--r))}55%{opacity:1;transform:scale(1.18) rotate(var(--r))}80%{transform:scale(.96) rotate(calc(var(--r) * -.2))}`, 560, EASE.playfulSettle, 120, 120 + 8 * 85);
  },
});

def({
  slug: "metro", title: "Route line", source: "tokyometro", words: "reliable, functional, legible", preset: "Professional",
  pattern: "The line draws, stations light as it reaches them", principles: ["Staging", "Slow in/out", "Timing", "Solid drawing"],
  bg: "#ffffff",
  build(v) {
    v.body.push(`<path class="${v.c("line")}" d="M150 150H650" pathLength="1" stroke="#00467e" stroke-width="10" stroke-linecap="round" stroke-dasharray="1 1.2" fill="none"/>`);
    [200, 400, 600].forEach((x, i) =>
      v.body.push(`<circle class="${v.c("st")}" cx="${x}" cy="150" r="11" fill="#ffffff" stroke="#00467e" stroke-width="5" style="animation-delay:${200 + ((x - 150) / 500) * 900}ms"/>`));
    const wm = type("notosansjp-700.ttf", "JOHANSSON", { size: 54, y: 268, tracking: 5 });
    const kana = type("notosansjp-400.ttf", "ヨハンソン", { size: 18, y: 308, tracking: 8 });
    v.body.push(`<g class="${v.c("wm")}" fill="#00467e">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.body.push(`<g class="${v.c("kana")}" fill="#333333">${kana.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.anim("line", `from{stroke-dashoffset:1.1}`, 900, EASE.trustEnter, 200);
    v.css.push(`.${v.c("st")}{${v.tb()}}`);
    v.anim("st", `from{transform:scale(0)}`, 260, EASE.trustEnter, 200, 1100);
    v.anim("wm", `from{opacity:0;transform:translateY(8px)}`, 600, EASE.trustEnter, 1000);
    v.anim("kana", `from{opacity:0;transform:translateY(6px)}`, 600, EASE.trustEnter, 1150);
  },
});

def({
  slug: "wired", title: "Redaction", source: "wired", words: "editorial, typographic, sharp", preset: "Energetic",
  pattern: "A black block sweeps across and leaves the name behind", principles: ["Timing", "Anticipation", "Staging", "Exaggeration"],
  bg: "#ffffff",
  build(v) {
    const wm = type("inter-800.ttf", "JOHANSSON", { size: 86, y: 250, tracking: -2 });
    const cap = type("spacemono-700.ttf", "/ JOHANSSON / 2011", { size: 14, x: wm.box.x1, y: 296, tracking: 2, align: "start" });
    const b = wm.box;
    v.body.push(`<g class="${v.c("wm")}" fill="#1a1a1a">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.body.push(`<rect class="${v.c("bar")}" x="${r2(b.x1 - 10)}" y="${r2(b.y1 - 8)}" width="${r2(b.x2 - b.x1 + 20)}" height="${r2(b.y2 - b.y1 + 16)}" fill="#1a1a1a" style="transform:scaleX(0)"/>`);
    v.body.push(`<g fill="#757575">${cap.letters.map((l, i) => pathOf(l, `class="${v.c("c")}" style="animation-delay:${900 + i * 28}ms"`)).join("")}</g>`);
    v.css.push(`.${v.c("bar")}{${v.tb("left")}}`);
    v.anim("bar", `0%{transform:scaleX(0);transform-origin:left}45%{transform:scaleX(1);transform-origin:left}55%{transform:scaleX(1);transform-origin:right}100%{transform:scaleX(0);transform-origin:right}`, 900, EASE.boldEnter, 100);
    v.anim("wm", `0%,50%{opacity:0}51%{opacity:1}`, 900, "linear", 100);
    v.anim("c", `from{opacity:0}`, 1, "steps(1)", 900, 900 + 17 * 28);
  },
});

def({
  slug: "popeye", title: "Retro magazine", source: "popeye", words: "pop, young, retro-modern", preset: "Energetic",
  pattern: "The name slides in skewed, its cyan print shadow lags and lands", principles: ["Exaggeration", "Overlapping action", "Follow through", "Arcs"],
  bg: "#343ec9",
  build(v) {
    const wm = type("dmsans-800i.ttf", "Johansson", { size: 104, y: 262 });
    v.body.push(`<g transform="translate(7 7)"><g class="${v.c("sh")}" fill="#3affff">${wm.letters.map((l) => pathOf(l)).join("")}</g></g>`);
    v.body.push(`<g class="${v.c("wm")}" fill="#ffffff">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.body.push(`<rect class="${v.c("bar")}" x="${r2(wm.box.x1 + 10)}" y="${r2(wm.box.y2 + 22)}" width="${r2((wm.box.x2 - wm.box.x1) * 0.42)}" height="10" fill="#ff9000"/>`);
    v.css.push(`.${v.c("bar")}{${v.tb("left")}}`);
    v.anim("wm", `0%{opacity:0;transform:translateX(-260px) skewX(-18deg)}60%{opacity:1;transform:translateX(14px) skewX(4deg)}`, 700, EASE.boldEnter, 150);
    v.anim("sh", `0%{opacity:0;transform:translateX(-270px) skewX(-20deg)}62%{opacity:1;transform:translateX(18px) skewX(5deg)}`, 760, EASE.boldEnter, 200);
    v.anim("bar", `from{transform:scaleX(0)}`, 380, EASE.boldEnter, 900);
  },
});

def({
  slug: "casio", title: "Display", source: "casio", words: "precise, solid, angular", preset: "Professional",
  pattern: "Unlit segments glow first, then each letter switches on in steps", principles: ["Timing", "Staging", "Solid drawing"],
  bg: "#f4f5f8",
  build(v) {
    const wm = type("orbitron-600.ttf", "JOHANSSON", { size: 58, y: 250, tracking: 7 });
    v.body.push(`<g class="${v.c("ghost")}" fill="#0a3282" opacity=".07">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.body.push(`<g fill="#0a3282">${wm.letters.map((l, i) => pathOf(l, `class="${v.c("l")}" style="animation-delay:${450 + i * 70}ms"`)).join("")}</g>`);
    v.body.push(`<rect class="${v.c("tick")}" x="${r2(wm.box.x2 - 34)}" y="${r2(wm.box.y2 + 18)}" width="34" height="4" fill="#bb3c39"/>`);
    v.anim("ghost", `from{opacity:0}`, 300, "steps(3)", 100);
    v.anim("l", `0%{opacity:0}40%{opacity:1}55%{opacity:.15}70%{opacity:1}`, 300, "steps(1)", 450, 450 + 8 * 70);
    v.anim("tick", `0%,49%{opacity:0}50%,100%{opacity:1}`, 400, "steps(1)", 1250, 1650, ";animation-iteration-count:2");
  },
});

def({
  slug: "grandseiko", title: "Gliding seconds", source: "grand-seiko", words: "heritage, exacting, deep navy", preset: "Elegant",
  pattern: "A seconds hand glides one full turn and draws the ring", principles: ["Timing", "Slow in/out", "Staging", "Solid drawing", "Appeal"],
  bg: "#000040",
  build(v) {
    const cx = 400, cy = 158, r = 64;
    const ticks = Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6, r1 = i % 3 ? r - 7 : r - 12;
      return `<line x1="${r2(cx + Math.sin(a) * r1)}" y1="${r2(cy - Math.cos(a) * r1)}" x2="${r2(cx + Math.sin(a) * (r - 3))}" y2="${r2(cy - Math.cos(a) * (r - 3))}"/>`;
    }).join("");
    v.body.push(`<path class="${v.c("ring")}" d="M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx} ${cy + r}A${r} ${r} 0 1 1 ${cx} ${cy - r}" pathLength="1" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="1 1"/>`);
    v.body.push(`<g class="${v.c("ticks")}" stroke="#ffffff" stroke-width="1.5">${ticks}</g>`);
    v.body.push(`<line class="${v.c("hand")}" x1="${cx}" y1="${cy + 10}" x2="${cx}" y2="${cy - r + 8}" stroke="#ffffff" stroke-width="1.2" opacity="0"/><circle class="${v.c("hub")}" cx="${cx}" cy="${cy}" r="2.5" fill="#ffffff"/>`);
    const wm = type("cormorant-500.ttf", "JOHANSSON", { size: 50, y: 316, tracking: 13 });
    v.body.push(`<g class="${v.c("wm")}" fill="#ffffff">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.css.push(`.${v.c("hand")}{transform-box:view-box;transform-origin:${cx}px ${cy}px}`);
    v.anim("ring", `from{stroke-dashoffset:1}`, 2000, "linear", 200);
    v.anim("hand", `0%{opacity:1;transform:rotate(0)}95%{opacity:1;transform:rotate(342deg)}100%{opacity:0;transform:rotate(360deg)}`, 2000, "linear", 200);
    v.anim("ticks", `from{opacity:0}`, 1400, EASE.elegantEnter, 500);
    v.anim("hub", `from{opacity:0}`, 400, EASE.elegantEnter, 100);
    v.anim("wm", `from{opacity:0;transform:translateY(6px)}`, 1500, EASE.elegantSettle, 1500);
  },
});

def({
  slug: "sony", title: "Cinematic", source: "sony", words: "cinematic, advanced, dark", preset: "Elegant",
  pattern: "Letters converge out of blur, a light line opens beneath", principles: ["Staging", "Slow in/out", "Exaggeration", "Secondary action"],
  bg: "#000000",
  build(v) {
    const wm = type("inter-200.ttf", "JOHANSSON", { size: 60, y: 238, tracking: 12 });
    v.body.push(`<g fill="#ffffff">${wm.letters.map((l) => pathOf(l, `class="${v.c("l")}" style="--dx:${r2((l.cx - W / 2) * 1.6)}px"`)).join("")}</g>`);
    v.defs.push(`<linearGradient id="${v.c("g")}" x1="0" x2="1"><stop offset="0" stop-color="#2d75c7" stop-opacity="0"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#2d75c7" stop-opacity="0"/></linearGradient>`);
    v.body.push(`<rect class="${v.c("light")}" x="200" y="282" width="400" height="1.5" fill="url(#${v.c("g")})" opacity=".55"/>`);
    v.anim("l", `from{opacity:0;transform:translateX(var(--dx));filter:blur(10px)}`, 1700, EASE.elegantSettle, 200);
    v.css.push(`.${v.c("light")}{${v.tb()}}`);
    v.anim("light", `0%{transform:scaleX(0);opacity:0}50%{transform:scaleX(1);opacity:1}`, 1400, EASE.elegantEnter, 900);
  },
});

def({
  slug: "snowpeak", title: "Ridge", source: "snowpeak", words: "cultural, outdoor, deep red", preset: "Calm",
  pattern: "The mountain ridge draws on, the name settles under it", principles: ["Staging", "Slow in/out", "Arcs", "Timing"],
  bg: "#ffffff",
  build(v) {
    v.body.push(`<path class="${v.c("ridge")}" d="M250 190L318 128L352 156L410 92L470 160L500 138L550 190" pathLength="1" fill="none" stroke="#820000" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="1 1.2"/>`);
    const wm = type("ebgaramond.ttf", "Johansson", { size: 68, y: 280 });
    const est = type("inter-300.ttf", "EST. 2011", { size: 12, y: 318, tracking: 7 });
    v.body.push(`<g class="${v.c("wm")}" fill="#000000">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.body.push(`<g class="${v.c("est")}" fill="#888888">${est.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.anim("ridge", `from{stroke-dashoffset:1.1}`, 1400, EASE.natural, 150);
    v.anim("wm", `from{opacity:0;transform:translateY(8px)}`, 1100, EASE.calm, 1000);
    v.anim("est", `from{opacity:0}`, 800, EASE.calm, 1500);
  },
});

def({
  slug: "humanmade", title: "Vintage badge", source: "humanmade", words: "streetwear, vintage, colourful", preset: "Energetic",
  pattern: "The badge slaps down, squashes, and settles at its tilt", principles: ["Anticipation", "Squash & stretch", "Exaggeration", "Follow through", "Appeal"],
  bg: "#ffffff",
  build(v) {
    const wm = type("archivoblack.ttf", "JOHANSSON", { size: 54, y: 246, tracking: 2 });
    const b = wm.box, pad = 30;
    const est = type("courierprime.ttf", "EST. 2011", { size: 16, y: b.y2 + pad + 44, tracking: 3 });
    v.body.push(`<g class="${v.c("badge")}"><rect x="${r2(b.x1 - pad)}" y="${r2(b.y1 - pad)}" width="${r2(b.x2 - b.x1 + 2 * pad)}" height="${r2(b.y2 - b.y1 + 2 * pad)}" rx="14" fill="#ffd83b" stroke="#ed1c24" stroke-width="6"/><g fill="#ed1c24">${wm.letters.map((l) => pathOf(l)).join("")}</g></g>`);
    v.body.push(`<g fill="#121212">${est.letters.map((l, i) => pathOf(l, `class="${v.c("c")}" style="animation-delay:${750 + i * 45}ms"`)).join("")}</g>`);
    v.css.push(`.${v.c("badge")}{${v.tb()};transform:rotate(-4deg)}`);
    v.anim("badge", `0%{opacity:0;transform:scale(1.7) rotate(-16deg)}35%{opacity:1;transform:scale(.9,.84) rotate(-3deg)}60%{transform:scale(1.04,1.06) rotate(-5deg)}80%{transform:scale(.99) rotate(-3.6deg)}`, 650, EASE.boldEnter, 100);
    v.anim("c", `from{opacity:0}`, 1, "steps(1)", 750, 750 + 8 * 45);
  },
});

def({
  slug: "groovisions", title: "System", source: "groovisions", words: "anonymous, systematic, hairline", preset: "Professional",
  pattern: "A hairline extends, the name rises from behind it", principles: ["Staging", "Slow in/out", "Timing", "Solid drawing"],
  bg: "#ffffff",
  build(v) {
    const wm = type("inter-300.ttf", "johansson", { size: 62, x: 140, y: 240, align: "start" });
    const cap = type("inter-300.ttf", "JOHANSSON", { size: 11, x: 660, y: 276, tracking: 5, align: "end" });
    v.defs.push(`<clipPath id="${v.c("above")}"><rect x="0" y="0" width="${W}" height="256"/></clipPath>`);
    v.body.push(`<g clip-path="url(#${v.c("above")})"><g class="${v.c("wm")}" fill="#333333">${wm.letters.map((l) => pathOf(l)).join("")}</g></g>`);
    v.body.push(`<rect class="${v.c("line")}" x="140" y="256" width="520" height="1" fill="#9f9f9f"/>`);
    v.body.push(`<g class="${v.c("cap")}" fill="#9f9f9f">${cap.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.css.push(`.${v.c("line")}{${v.tb("left")}}`);
    v.anim("line", `from{transform:scaleX(0)}`, 700, EASE.trustSettle, 150);
    v.anim("wm", `from{transform:translateY(70px)}`, 700, EASE.trustEnter, 700);
    v.anim("cap", `from{opacity:0}`, 500, EASE.trustEnter, 1250);
  },
});

def({
  slug: "kigi", title: "Giant J", source: "kigi", words: "bold scale, acid teal, quiet type", preset: "Energetic",
  pattern: "A teal block wipes in, the giant J rises through it", principles: ["Staging", "Exaggeration", "Timing", "Overlapping action"],
  bg: "#e6e6e6",
  build(v) {
    v.body.push(`<rect class="${v.c("block")}" x="110" y="96" width="200" height="258" fill="#00c69e"/>`);
    const j = type("inter-800.ttf", "J", { size: 330, x: 210, y: 350 });
    v.defs.push(`<clipPath id="${v.c("clip")}"><rect x="0" y="40" width="${W}" height="${r2(j.box.y2 + 2 - 40)}"/></clipPath>`);
    v.body.push(`<g clip-path="url(#${v.c("clip")})"><g class="${v.c("j")}" fill="#221815">${j.letters.map((l) => pathOf(l)).join("")}</g></g>`);
    const wm = type("inter-300.ttf", "johansson", { size: 24, x: 690, y: 350, tracking: 1, align: "end" });
    v.body.push(`<g class="${v.c("wm")}" fill="#221815">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.css.push(`.${v.c("block")}{${v.tb("left")}}`);
    v.anim("block", `from{transform:scaleX(0)}`, 500, EASE.boldEnter, 100);
    v.anim("j", `from{transform:translateY(330px)}`, 800, EASE.boldEnter, 380);
    v.anim("wm", `from{opacity:0;transform:translateX(-10px)}`, 600, EASE.boldEnter, 1000);
  },
});

def({
  slug: "pentel", title: "Marker swipe", source: "pentel", words: "pure red, pen, cheerful", preset: "Playful",
  pattern: "A red marker swipes the pill, the letters pop out of it", principles: ["Arcs", "Timing", "Overlapping action", "Squash & stretch", "Appeal"],
  bg: "#ffffff",
  build(v) {
    v.body.push(`<path class="${v.c("swipe")}" d="M195 200H605" pathLength="1" stroke="#ff0000" stroke-width="106" stroke-linecap="round" stroke-dasharray="1 1.2" fill="none"/>`);
    const wm = type("notosansjp-700.ttf", "JOHANSSON", { size: 50, y: 218, tracking: 5 });
    const kana = type("notosansjp-400.ttf", "ヨハンソン", { size: 18, y: 300, tracking: 9 });
    v.body.push(`<g fill="#ffffff">${wm.letters.map((l, i) => pathOf(l, `class="${v.c("l")}" style="animation-delay:${420 + i * 45}ms"`)).join("")}</g>`);
    v.body.push(`<g class="${v.c("kana")}" fill="#212121">${kana.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.anim("swipe", `from{stroke-dashoffset:1.1}`, 520, EASE.boldEnter, 100);
    v.css.push(`.${v.c("l")}{${v.tb()}}`);
    v.anim("l", `0%{opacity:0;transform:scale(.3)}60%{opacity:1;transform:scale(1.15)}`, 380, EASE.playfulSettle, 420, 420 + 8 * 45);
    v.anim("kana", `from{opacity:0;transform:translateY(6px)}`, 500, EASE.playfulSettle, 950);
  },
});

def({
  slug: "kinto", title: "Fine frame", source: "kinto", words: "light, considered, everyday", preset: "Calm",
  pattern: "A fine frame draws round, the name eases in, an orange line underlines", principles: ["Staging", "Slow in/out", "Follow through", "Appeal"],
  bg: "#ffffff",
  build(v) {
    v.body.push(`<path class="${v.c("frame")}" d="M400 140H620V310H180V140Z" pathLength="1" fill="none" stroke="#9f9f9f" stroke-width="1" stroke-dasharray="1 1"/>`);
    const wm = type("instrument-500.ttf", "JOHANSSON", { size: 44, y: 238, tracking: 15 });
    v.body.push(`<g fill="#555555">${wm.letters.map((l, i) => pathOf(l, `class="${v.c("l")}" style="--dx:${r2((l.cx - W / 2) * 0.12)}px"`)).join("")}</g>`);
    v.body.push(`<rect class="${v.c("line")}" x="385" y="266" width="30" height="2" fill="#ff4500"/>`);
    v.anim("frame", `from{stroke-dashoffset:1}`, 1300, EASE.calm, 100);
    v.anim("l", `from{opacity:0;transform:translateX(var(--dx))}`, 1200, EASE.calm, 700);
    v.css.push(`.${v.c("line")}{${v.tb()}}`);
    v.anim("line", `from{transform:scaleX(0)}`, 600, EASE.calm, 1500);
  },
});

def({
  slug: "kapital", title: "Workshop label", source: "kapital", words: "craft, vintage, folklore", preset: "Friendly",
  pattern: "The label border stitches round, letters press in, the date types out", principles: ["Timing", "Staging", "Squash & stretch", "Appeal"],
  bg: "#261107",
  build(v) {
    v.body.push(`<path class="${v.c("b1")}" d="M400 112H624V338H176V112Z" pathLength="1" fill="none" stroke="#d2ac91" stroke-width="2" stroke-dasharray="1 1"/>`);
    v.body.push(`<path class="${v.c("b2")}" d="M400 122H614V328H186V122Z" pathLength="1" fill="none" stroke="#d2ac91" stroke-width="1" stroke-dasharray=".012 .008"/>`);
    const wm = type("kameron-700.ttf", "JOHANSSON", { size: 56, y: 242, tracking: 4 });
    const cap = type("courierprime.ttf", "— EST. 2011 —", { size: 16, y: 290, tracking: 2 });
    v.body.push(`<g fill="#d2ac91">${wm.letters.map((l, i) => pathOf(l, `class="${v.c("l")}" style="animation-delay:${900 + i * 90}ms"`)).join("")}</g>`);
    v.body.push(`<g fill="#d2ac91">${cap.letters.map((l, i) => pathOf(l, `class="${v.c("c")}" style="animation-delay:${1800 + i * 55}ms"`)).join("")}</g>`);
    v.anim("b1", `from{stroke-dashoffset:1}`, 1000, EASE.natural, 100);
    v.anim("b2", `from{opacity:0}`, 500, EASE.natural, 700);
    v.css.push(`.${v.c("l")}{${v.tb()}}`);
    v.anim("l", `0%{opacity:0;transform:scale(1.25)}50%{opacity:1;transform:scale(.96)}`, 260, EASE.boldEnter, 900, 900 + 8 * 90);
    v.anim("c", `from{opacity:0}`, 1, "steps(1)", 1800, 1800 + 12 * 55);
  },
});

def({
  slug: "calpis", title: "Polka dots", source: "calpis", words: "fresh, clean, blue and white", preset: "Friendly",
  pattern: "Dots pop in a wave, the name bobs up", principles: ["Overlapping action", "Follow through", "Squash & stretch", "Appeal"],
  bg: "#0033ff",
  build(v) {
    const dots = [];
    for (let row = 0; row < 2; row++) for (let i = 0; i < 13; i++) {
      const x = 70 + i * 55 + (row % 2) * 27, y = 70 + row * 34;
      dots.push([x, y]);
      dots.push([x, H - 70 - row * 34]);
    }
    v.body.push(dots.map(([x, y]) => `<circle class="${v.c("d")}" cx="${x}" cy="${y}" r="9" fill="#ffffff" style="animation-delay:${Math.round(100 + (x / W) * 700)}ms"/>`).join(""));
    const wm = type("mplusrounded-800.ttf", "Johansson", { size: 84, y: 256 });
    v.body.push(`<g class="${v.c("wm")}" fill="#ffffff">${wm.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.css.push(`.${v.c("d")}{${v.tb()}}`);
    v.anim("d", `0%{transform:scale(0)}70%{transform:scale(1.25)}`, 420, EASE.friendlyEnter, 100, 800);
    v.anim("wm", `0%{opacity:0;transform:translateY(30px)}60%{opacity:1;transform:translateY(-6px)}80%{transform:translateY(2px)}`, 800, EASE.friendlyEnter, 750);
  },
});

def({
  slug: "dassai", title: "One drop", source: "dassai", words: "pure, wide, deep indigo", preset: "Elegant",
  pattern: "A drop falls, its ripple opens, the name appears from the centre out", principles: ["Anticipation", "Arcs", "Secondary action", "Staging", "Timing"],
  bg: "#ffffff",
  build(v) {
    const wm = type("notoserifjp-500.ttf", "JOHANSSON", { size: 40, y: 248, tracking: 26 });
    const kana = type("notoserifjp-200.ttf", "ヨハンソン", { size: 15, y: 300, tracking: 18 });
    v.body.push(`<circle class="${v.c("drop")}" cx="400" cy="232" r="3.5" fill="#27174b" opacity="0"/>`);
    v.body.push(`<ellipse class="${v.c("rip")}" cx="400" cy="232" rx="300" ry="34" fill="none" stroke="#a5afd3" stroke-width="1" opacity="0"/>`);
    v.body.push(`<g fill="#27174b">${wm.letters.map((l) => pathOf(l, `class="${v.c("l")}" style="animation-delay:${1050 + Math.abs(l.cx - W / 2) * 2.2}ms"`)).join("")}</g>`);
    v.body.push(`<g class="${v.c("kana")}" fill="#27174b">${kana.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.anim("drop", `0%{opacity:0;transform:translateY(-190px)}15%{opacity:1}80%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(0)}`, 900, "cubic-bezier(.55,0,1,.45)", 150);
    v.css.push(`.${v.c("rip")}{${v.tb()}}`);
    v.anim("rip", `0%{opacity:.9;transform:scale(.02)}100%{opacity:0;transform:scale(1)}`, 1400, EASE.elegantSettle, 870);
    v.anim("l", `from{opacity:0;filter:blur(3px)}`, 1100, EASE.elegantEnter, 1050, 1050 + 330 * 2.2);
    v.anim("kana", `from{opacity:0}`, 1000, EASE.elegantEnter, 1900);
  },
});

def({
  slug: "kaikado", title: "Copper caddy", source: "kaikado", words: "craft, hairline, copper", preset: "Elegant",
  pattern: "Draw-on: the caddy and the letter outlines are drawn, then the ink fills", principles: ["Staging", "Slow in/out", "Timing", "Solid drawing", "Appeal"],
  bg: "#f2efe9",
  build(v) {
    v.body.push(`<path class="${v.c("can")}" d="M200 152H262V300C262 306 258 310 252 310H210C204 310 200 306 200 300Z" pathLength="1" fill="none" stroke="#9d805f" stroke-width="1.3" stroke-dasharray="1 1"/>`);
    v.body.push(`<path class="${v.c("lid")}" d="M196 142H266V164H196Z" pathLength="1" fill="none" stroke="#9d805f" stroke-width="1.3" stroke-dasharray="1 1"/>`);
    const wm = type("notoserifjp-200.ttf", "Johansson", { size: 62, x: 300, y: 252, align: "start" });
    const kana = type("notoserifjp-200.ttf", "ヨハンソン", { size: 14, x: 302, y: 292, tracking: 10, align: "start" });
    v.body.push(`<g>${wm.letters.map((l, i) => pathOf(l, `class="${v.c("l")}" pathLength="1" fill="#333333" stroke="#9d805f" stroke-width=".8" stroke-dasharray="1 1" stroke-dashoffset="1" style="animation-delay:${500 + i * 110}ms"`)).join("")}</g>`);
    v.body.push(`<g class="${v.c("kana")}" fill="#9d805f">${kana.letters.map((l) => pathOf(l)).join("")}</g>`);
    v.anim("can", `from{stroke-dashoffset:1}`, 1300, EASE.natural, 100);
    v.anim("lid", `from{stroke-dashoffset:1}`, 700, EASE.natural, 600);
    // Outline draws, then the fill comes in as the outline fades: the ink dries.
    v.anim("l", `0%{stroke-dashoffset:1;fill-opacity:0;stroke-opacity:1}60%{stroke-dashoffset:0;fill-opacity:0;stroke-opacity:1}100%{stroke-dashoffset:0;fill-opacity:1;stroke-opacity:0}`, 1300, EASE.natural, 500, 500 + 8 * 110);
    v.css.push(`.${v.c("l")}{stroke-opacity:0}`);
    v.anim("kana", `from{opacity:0}`, 900, EASE.elegantEnter, 1900);
  },
});

// ---- Write -------------------------------------------------------------------------------
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) if (f.endsWith(".svg")) rmSync(join(OUT, f)); // keep export/
const manifest = [];
V.forEach((spec, i) => {
  const key = `j${String(i + 1).padStart(2, "0")}`;
  const v = variation(key);
  spec.build(v);
  const bg = `<rect width="${W}" height="${H}" fill="${spec.bg}"/>`;
  const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Johansson">` +
    `<title>Johansson — ${spec.title}</title>`;
  const defs = v.defs.length ? `<defs>${v.defs.join("")}</defs>` : "";
  const motion = `<style>@media (prefers-reduced-motion:no-preference){${v.css.join("")}}</style>`;
  // Static CSS (transform-box, final transforms) must apply in both files; it is any rule without animation.
  const still = v.css.filter((r) => !r.includes("animation")).join("");
  const name = `${String(i + 1).padStart(2, "0")}-${spec.slug}`;
  writeFileSync(join(OUT, `${name}.svg`), `${head}${motion}${still ? `<style>${still}</style>` : ""}${defs}${bg}${v.body.join("")}</svg>\n`);
  writeFileSync(join(OUT, `${name}-still.svg`), `${head}${still ? `<style>${still}</style>` : ""}${defs}${bg}${v.body.join("")}</svg>\n`);
  manifest.push({
    n: i + 1, key, file: `${name}.svg`, still: `${name}-still.svg`, slug: spec.slug, title: spec.title,
    source: spec.source, words: spec.words, preset: spec.preset, pattern: spec.pattern,
    principles: spec.principles, bg: spec.bg, duration: Math.ceil(v.end / 50) * 50,
  });
});
writeFileSync(join(OUT, "styles.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`${manifest.length} variations in assets/brand/styles/`);

// pixel2motion's motion_spec.md: the brief, the derivation and the timeline for each variation.
const spec = [
  "# Johansson in 29 styles — motion spec",
  "",
  "Generated by `tools/brand/build-styles.mjs`; do not edit by hand.",
  "",
  "## Method",
  "",
  "- **Pixel (brief).** Each variation starts from one design system in",
  "  [awesome-design-md-jp](https://github.com/kzhrknt/awesome-design-md-jp): its palette, type stack and",
  "  atmosphere keywords (`design-md/<source>/DESIGN.md`). Three personality words are read from those keywords.",
  "- **Vector.** No raster tracing is needed: the name is set from open-licence fonts close to each system's",
  "  type and converted to outlines, one path per letter (letters are the actors); marks are primitives",
  "  (circles, rules, rectangles, a few cubic curves). Every class and id is scoped by the variation key.",
  "- **Motion.** The words pick a [pixel2motion](https://github.com/nolangz/pixel2motion) personality preset",
  "  (timing band, easing tokens, squash and overshoot allowances) and a reveal pattern from its library.",
  "  Easing is literal `cubic-bezier()`; all motion sits inside `prefers-reduced-motion: no-preference`.",
  "- **Final Frame Contract.** Keyframes describe only where motion starts; the base CSS is the finished",
  "  logo and animations fill backwards only, so the last frame, `?static=1` and the still SVG are",
  "  identical. `tools/brand/qa-styles.cjs` proves it for every variation (end frame == still, 0 pixels apart)",
  "  and writes frames at 0, 25, 50 and 75 % for review.",
  "",
  "## Presets (literal values)",
  "",
  "| Preset | Enter | Settle | Squash | Overshoot |",
  "|---|---|---|---|---|",
  `| Playful | \`${EASE.playfulEnter}\` | \`${EASE.playfulSettle}\` | up to 25 % | 1.08–1.25 |`,
  `| Elegant | \`${EASE.elegantEnter}\` | \`${EASE.elegantSettle}\` | none | none |`,
  `| Professional | \`${EASE.trustEnter}\` | \`${EASE.trustSettle}\` | none | none |`,
  `| Energetic | \`${EASE.boldEnter}\` | \`${EASE.playfulEnter}\` | up to 16 % | 1.04–1.12 |`,
  `| Calm | \`${EASE.calm}\` | \`${EASE.calm}\` | none | none |`,
  `| Friendly | \`${EASE.friendlyEnter}\` | \`${EASE.playfulSettle}\` | up to 8 % | 1.04–1.25 |`,
  "",
  "## Variations",
  "",
  "| # | Style | After | Personality words | Preset | Reveal pattern | Principles | Length |",
  "|---|---|---|---|---|---|---|---|",
  ...manifest.map((m) => `| ${m.n} | ${m.title} | \`${m.source}\` | ${m.words} | ${m.preset} | ${m.pattern} | ${m.principles.join(", ")} | ${(m.duration / 1000).toFixed(2)} s |`),
  "",
];
writeFileSync(join(OUT, "MOTION_SPEC.md"), spec.join("\n"));
