// Builds the three chosen Johansson logos as letter-by-letter constructions into assets/brand/final/.
//   NODE_PATH=$(npm root -g) node tools/brand/build-final.mjs
//
// The motion is in the manner of AAA studio idents rather than cartoon reveals: nothing bounces;
// parts arrive fast and lock hard (expo-out), the eye is led by one light, a slow camera push
// gives weight, and one impact beat lands the mark. Each letter is built from slices that slide
// into their own windows; kana are written stroke by stroke in stroke order.
// Same contract as the 29 styles: base CSS is the finished logo, keyframes only say where motion
// starts, animations fill backwards only, all motion sits in prefers-reduced-motion: no-preference.
// Backwards fill shows the 0% keyframe from the first frame, so anything that should not be seen
// before its beat (a flash, a hand, an ink ring) starts its keyframes at opacity 0.

import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { W, H, r2, type, vtype, variation, pathOf } from "./lib/kit.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "assets", "brand", "final");
const LOCK = "cubic-bezier(.16,1,.3,1)"; // expo-out: arrive fast, lock hard
const SNAP = "cubic-bezier(.7,0,.2,1)"; // hard in, hard stop
const BRUSH = "cubic-bezier(.45,0,.25,1)";

// Slices: each letter cut into horizontal bands; each band slides into its own window from
// alternating sides, so the letter assembles like machined parts locking together.
function sliced(v, letters, o) {
  const { bands, fill, start, stagger, bandStagger, dist, dur, name } = o;
  let out = "";
  letters.forEach((L, i) => {
    const h = (L.b.y2 - L.b.y1) / bands;
    for (let b = 0; b < bands; b++) {
      const id = v.c(`${name}${i}b${b}`), dir = (b % 2 ? 1 : -1) * (i % 2 ? -1 : 1);
      v.defs.push(`<clipPath id="${id}"><rect x="${r2(L.b.x1 - 3)}" y="${r2(L.b.y1 + b * h - 0.3)}" width="${r2(L.b.x2 - L.b.x1 + 6)}" height="${r2(h + 0.6)}"/></clipPath>`);
      out += `<g clip-path="url(#${id})"><path class="${v.c(name)}" d="${L.d}" fill="${fill}" style="--dx:${dir * dist}px;animation-delay:${Math.round(start + i * stagger + b * bandStagger)}ms"/></g>`;
    }
  });
  v.anim(name, `from{transform:translateX(var(--dx))}`, dur, LOCK, start, start + (letters.length - 1) * stagger + (bands - 1) * bandStagger);
  return out;
}

// One soft light passing over the given shapes (clipped to them), then gone.
function sheen(v, shapes, { x1, x2, y1, y2, start, dur, color, opacity }) {
  const clip = v.c("shc"), grad = v.c("shg");
  v.defs.push(`<clipPath id="${clip}">${shapes}</clipPath>`);
  v.defs.push(`<linearGradient id="${grad}" x1="0" x2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".5" stop-color="${color}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`);
  const w = 140, endX = x2 + 260;
  v.css.push(`.${v.c("sh")}{transform:translateX(${endX}px) skewX(-22deg)}`);
  v.anim("sh", `from{transform:translateX(${x1 - w - 160}px) skewX(-22deg)}`, dur, "cubic-bezier(.45,0,.55,1)", start);
  return `<g clip-path="url(#${clip})"><rect class="${v.c("sh")}" x="0" y="${y1 - 40}" width="${w}" height="${y2 - y1 + 80}" fill="url(#${grad})"/></g>`;
}

// The camera: a slow push in for the whole piece, and an impact shake on one beat.
function camera(v, inner, { push = 1.05, pushDur = 3600, shakeAt, shakePx = 3 }) {
  v.css.push(`.${v.c("cam")},.${v.c("shk")}{transform-box:view-box;transform-origin:${W / 2}px ${H / 2}px}`);
  v.anim("cam", `from{transform:scale(${push})}`, pushDur, "cubic-bezier(.2,.6,.2,1)", 0);
  if (shakeAt != null) {
    const s = shakePx;
    v.anim("shk", `0%{transform:translate(0,0)}15%{transform:translate(${s}px,${-s * 0.7}px)}35%{transform:translate(${-s * 0.8}px,${s * 0.6}px)}55%{transform:translate(${s * 0.5}px,${s * 0.3}px)}75%{transform:translate(${-s * 0.25}px,${-s * 0.2}px)}`, 200, "linear", shakeAt);
  }
  return `<g class="${v.c("cam")}"><g class="${v.c("shk")}">${inner}</g></g>`;
}

const FINAL = [];

// 1 — Precision (after grand-seiko): the movement assembles, the hand runs once, the name is machined in.
FINAL.push({
  slug: "precision", title: "Precision", after: "grand-seiko", bg: "#000040",
  why: "The strongest system of the 29: a dial that works alone as an icon, a wordmark with real typographic poise, and a story (exactness, time, engineering) that is true of the founder. It reads at 16 px and on a building.",
  build(v) {
    const cx = 400, cy = 150, r = 64;
    let s = "";
    // Glint at twelve: the first point of light, before anything else moves.
    s += `<g transform="translate(${cx} ${cy - r}) scale(9)"><path class="${v.c("gl")}" d="M0-1C.12-.3.3-.12 1 0C.3.12.12.3 0 1C-.12.3-.3.12-1 0C-.3-.12-.12-.3 0-1Z" fill="#ffffff" opacity="0"/></g>`;
    v.css.push(`.${v.c("gl")}{transform-box:fill-box;transform-origin:center}`);
    v.anim("gl", `0%{opacity:0;transform:scale(0) rotate(0)}40%{opacity:1;transform:scale(1) rotate(45deg)}100%{opacity:0;transform:scale(0) rotate(90deg)}`, 520, "cubic-bezier(.3,0,.3,1)", 80);
    // Twelve indices fly in along their radii and lock, clockwise.
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6, r1 = i % 3 ? r - 7 : r - 13, sx = Math.sin(a), cy0 = -Math.cos(a);
      s += `<line class="${v.c("ix")}" x1="${r2(cx + sx * r1)}" y1="${r2(cy + cy0 * r1)}" x2="${r2(cx + sx * (r - 3))}" y2="${r2(cy + cy0 * (r - 3))}" stroke="#ffffff" stroke-width="${i % 3 ? 1.4 : 2.2}" style="--dx:${r2(sx * 90)}px;--dy:${r2(cy0 * 90)}px;animation-delay:${300 + i * 45}ms"/>`;
    }
    v.anim("ix", `from{opacity:0;transform:translate(var(--dx),var(--dy))}`, 620, LOCK, 300, 300 + 11 * 45);
    // The ring is drawn by the seconds hand's single smooth turn (linear: the one honest use of it).
    s += `<path class="${v.c("ring")}" d="M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx} ${cy + r}A${r} ${r} 0 1 1 ${cx} ${cy - r}" pathLength="1" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="1 1"/>`;
    s += `<line class="${v.c("hand")}" x1="${cx}" y1="${cy + 12}" x2="${cx}" y2="${cy - r + 9}" stroke="#ffffff" stroke-width="1.2" opacity="0"/>`;
    s += `<circle class="${v.c("hub")}" cx="${cx}" cy="${cy}" r="2.6" fill="#ffffff"/>`;
    v.css.push(`.${v.c("hand")}{transform-box:view-box;transform-origin:${cx}px ${cy}px}`);
    v.anim("ring", `from{stroke-dashoffset:1}`, 1400, "linear", 850);
    v.anim("hand", `0%{opacity:0;transform:rotate(0)}1%{opacity:1;transform:rotate(0)}94%{opacity:1;transform:rotate(338deg)}100%{opacity:0;transform:rotate(360deg)}`, 1400, "linear", 850);
    v.anim("hub", `from{opacity:0}`, 300, LOCK, 800);
    // The name, machined in: three slices per letter lock from alternating sides.
    const wm = type("cormorant-500.ttf", "JOHANSSON", { size: 50, y: 316, tracking: 13 });
    s += sliced(v, wm.letters, { bands: 3, fill: "#ffffff", start: 1550, stagger: 70, bandStagger: 40, dist: 46, dur: 640, name: "wl" });
    const est = type("inter-300.ttf", "EST. 2011", { size: 10, y: 346, tracking: 8 });
    s += `<g class="${v.c("est")}" fill="#ffffff" opacity=".6">${est.letters.map((l) => pathOf(l)).join("")}</g>`;
    v.anim("est", `from{opacity:0}`, 600, LOCK, 2500);
    // One light across dial and name.
    const shapes = wm.letters.map((l) => pathOf(l)).join("") + `<circle cx="${cx}" cy="${cy}" r="${r + 2}"/>`;
    s += sheen(v, shapes, { x1: wm.box.x1, x2: wm.box.x2, y1: cy - r, y2: wm.box.y2, start: 2650, dur: 1000, color: "#ffffff", opacity: 0.35 });
    v.body.push(camera(v, s, { push: 1.06, pushDur: 3800 }));
  },
});

// 2 — Monolith (after kigi): a teal slab is cut, the giant J is stacked from steel plates, the name is set.
FINAL.push({
  slug: "monolith", title: "Monolith", after: "kigi", bg: "#e6e6e6",
  why: "The most ownable icon: one letter at monumental scale against an acid-teal slab. It survives as a favicon, an app icon, a stamp or a building sign, and the tiny lowercase name gives the confidence of a studio that does not need to shout.",
  build(v) {
    let s = "";
    // Anticipation: a hairline marks where the slab will open.
    s += `<rect class="${v.c("hl")}" x="110" y="96" width="2" height="258" fill="#00c69e" opacity="0"/>`;
    v.css.push(`.${v.c("hl")}{transform-box:fill-box;transform-origin:center}`);
    v.anim("hl", `0%{opacity:1;transform:scaleY(0)}60%{opacity:1;transform:scaleY(1)}99%{opacity:1}100%{opacity:0}`, 420, LOCK, 0);
    s += `<rect class="${v.c("block")}" x="110" y="96" width="200" height="258" fill="#00c69e"/>`;
    v.css.push(`.${v.c("block")}{transform-box:fill-box;transform-origin:left}`);
    v.anim("block", `from{transform:scaleX(0)}`, 460, SNAP, 300);
    // The J: seven plates slam in from alternating sides and lock.
    const j = type("inter-800.ttf", "J", { size: 330, x: 210, y: 350 });
    s += sliced(v, j.letters, { bands: 7, fill: "#221815", start: 640, stagger: 0, bandStagger: 60, dist: 560, dur: 560, name: "jp" });
    // Impact frame when the last plate locks: one pale flash on the slab, and the camera shakes.
    const impact = 640 + 6 * 60 + 300;
    s += `<rect class="${v.c("fl")}" x="110" y="96" width="200" height="258" fill="#ffffff" opacity="0"/>`;
    v.anim("fl", `0%{opacity:0}1%{opacity:.45}100%{opacity:0}`, 260, "cubic-bezier(0,0,.2,1)", impact);
    // The name, set letter by letter: each rises out of its own baseline.
    const wm = type("inter-300.ttf", "johansson", { size: 24, x: 690, y: 350, tracking: 1, align: "end" });
    s += wm.letters.map((l, i) => pathOf(l, `class="${v.c("wl")}" fill="#221815" style="animation-delay:${impact + 150 + i * 40}ms"`)).join("");
    v.anim("wl", `from{clip-path:inset(100% 0 0 0);transform:translateY(12px)}`, 460, LOCK, impact + 150, impact + 150 + 8 * 40);
    s += `<rect class="${v.c("rule")}" x="${r2(wm.box.x1)}" y="362" width="${r2(wm.box.x2 - wm.box.x1)}" height="2" fill="#00c69e"/>`;
    v.css.push(`.${v.c("rule")}{transform-box:fill-box;transform-origin:left}`);
    v.anim("rule", `from{transform:scaleX(0)}`, 520, SNAP, impact + 650);
    // One light down the J's steel.
    s += sheen(v, j.letters.map((l) => pathOf(l)).join(""), { x1: j.box.x1, x2: j.box.x2, y1: j.box.y1, y2: j.box.y2, start: impact + 700, dur: 900, color: "#ffffff", opacity: 0.35 });
    v.body.push(camera(v, s, { push: 1.04, pushDur: 3200, shakeAt: impact, shakePx: 3 }));
  },
});

// 3 — Seal (after kurashi-no-techo): the name is written stroke by stroke, then signed with the seal.
FINAL.push({
  slug: "seal", title: "Seal", after: "kurashi-no-techo", bg: "#efefe2",
  why: "The one with a story no competitor can borrow: a Swedish name written in Japanese and signed with a hanko, as a port-town craftsman would. The red seal alone is a complete mark, and the vertical setting is unmistakable at any size.",
  build(v) {
    let s = "";
    // Registration guide: a faint hairline the brush follows, gone once the writing begins.
    s += `<rect class="${v.c("guide")}" x="399.5" y="46" width="1" height="324" fill="#222222" opacity="0"/>`;
    v.css.push(`.${v.c("guide")}{transform-box:fill-box;transform-origin:top}`);
    v.anim("guide", `0%{opacity:.22;transform:scaleY(0)}35%{opacity:.22;transform:scaleY(1)}100%{opacity:0;transform:scaleY(1)}`, 900, "cubic-bezier(.4,0,.2,1)", 0);
    // Stroke order: dots before sweeps, then left to right; each stroke wiped in its brush direction.
    const kana = vtype("shippori-500.ttf", "ヨハンソン", { size: 60, cx: 400, y0: 46, step: 64 });
    const DIR = { "ヨ": ["tb"], "ハ": ["tb", "tb"], "ン": ["lr", "lr"], "ソ": ["tb", "tb"] };
    let t = 320;
    kana.letters.forEach((L, ci) => {
      const contours = [];
      let cur = null;
      for (const c of L.path.commands) { if (c.type === "M") contours.push((cur = [])); cur.push(c); }
      const info = contours.map((cmds) => {
        const xs = cmds.filter((k) => k.x != null).map((k) => k.x), ys = cmds.filter((k) => k.y != null).map((k) => k.y);
        const d = cmds.map((k) => (k.type === "Z" ? "Z" : k.type === "M" || k.type === "L" ? `${k.type}${r2(k.x)} ${r2(k.y)}` : k.type === "Q" ? `Q${r2(k.x1)} ${r2(k.y1)} ${r2(k.x)} ${r2(k.y)}` : `C${r2(k.x1)} ${r2(k.y1)} ${r2(k.x2)} ${r2(k.y2)} ${r2(k.x)} ${r2(k.y)}`)).join("");
        return { d, x1: Math.min(...xs), area: (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)) };
      });
      const big = Math.max(...info.map((c) => c.area));
      const dot = (c) => (c.area < big * 0.35 ? 0 : 1);
      info.sort((a, b) => dot(a) - dot(b) || a.x1 - b.x1);
      info.forEach((c, k) => {
        const dir = DIR[L.ch][k] || "tb", dur = contours.length === 1 ? 300 : 190;
        s += `<path class="${v.c(dir === "tb" ? "stb" : "slr")}" d="${c.d}" fill="#222222" style="animation-delay:${t}ms;animation-duration:${dur}ms"/>`;
        t += dur + 45;
      });
      t += 70;
      if (ci === kana.letters.length - 1) t -= 115;
    });
    v.anim("stb", `from{clip-path:inset(0 0 100% 0)}`, 190, BRUSH, 320, t - 190);
    v.anim("slr", `from{clip-path:inset(0 100% 0 0)}`, 190, BRUSH, 320, t - 190);
    // The seal lands: drop, press, a ring of ink, a small shake.
    const sealAt = t + 120;
    const jj = type("shippori-500.ttf", "J", { size: 34, x: 466, y: 384 });
    s += `<circle class="${v.c("ink")}" cx="466" cy="372" r="34" fill="none" stroke="#df2016" stroke-width="1.5" opacity="0"/>`;
    s += `<g class="${v.c("seal")}"><rect x="444" y="350" width="44" height="44" rx="4" fill="#df2016"/><g fill="#efefe2">${jj.letters.map((l) => pathOf(l)).join("")}</g></g>`;
    v.css.push(`.${v.c("seal")},.${v.c("ink")}{transform-box:fill-box;transform-origin:center}`);
    v.anim("seal", `0%{opacity:0;transform:scale(1.9) rotate(-9deg)}55%{opacity:1;transform:scale(.9) rotate(0)}78%{transform:scale(1.03)}`, 420, LOCK, sealAt);
    v.anim("ink", `0%{opacity:0;transform:scale(.4)}1%{opacity:.55;transform:scale(.4)}100%{opacity:0;transform:scale(1.7)}`, 700, "cubic-bezier(0,0,.2,1)", sealAt + 220);
    // The name in Latin letters, set vertically beside the column, one letter at a time.
    const lat = type("shippori-500.ttf", "JOHANSSON", { size: 13, x: 0, y: 0, tracking: 7, align: "start" });
    s += `<g transform="translate(350 62) rotate(90)">${lat.letters.map((l, i) => pathOf(l, `class="${v.c("lt")}" fill="#222222" style="animation-delay:${sealAt + 380 + i * 40}ms"`)).join("")}</g>`;
    v.anim("lt", `from{opacity:0;transform:translateY(-4px)}`, 360, LOCK, sealAt + 380, sealAt + 380 + 8 * 40);
    v.body.push(camera(v, s, { push: 1.04, pushDur: sealAt + 900, shakeAt: sealAt + 220, shakePx: 2 }));
  },
});

// ---- Write -------------------------------------------------------------------------------
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) if (f.endsWith(".svg")) rmSync(join(OUT, f)); // keep export/
const manifest = [];
FINAL.forEach((spec, i) => {
  const key = `f${i + 1}`;
  const v = variation(key);
  spec.build(v);
  const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Johansson">` +
    `<title>Johansson — ${spec.title}</title>`;
  const defs = v.defs.length ? `<defs>${v.defs.join("")}</defs>` : "";
  const still = v.css.filter((r) => !r.includes("animation")).join("");
  const plate = `<rect width="${W}" height="${H}" fill="${spec.bg}"/>`;
  const name = `${i + 1}-${spec.slug}`;
  const art = `${defs}${plate}${v.body.join("")}`;
  writeFileSync(join(OUT, `${name}.svg`), `${head}<style>@media (prefers-reduced-motion:no-preference){${v.css.join("")}}</style>${still ? `<style>${still}</style>` : ""}${art}</svg>\n`);
  writeFileSync(join(OUT, `${name}-still.svg`), `${head}${still ? `<style>${still}</style>` : ""}${art}</svg>\n`);
  manifest.push({ n: i + 1, key, slug: spec.slug, title: spec.title, source: spec.after, why: spec.why, bg: spec.bg, file: `${name}.svg`, still: `${name}-still.svg`, duration: Math.ceil(v.end / 50) * 50 });
});
writeFileSync(join(OUT, "final.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(manifest.map((m) => `${m.n} ${m.slug} ${m.duration}ms`).join("\n"));
