// Builds the Johansson logo family into assets/brand/.
//   node tools/brand/build-logo.mjs
//
// Every letter is a drawn monoline stroke (no font needed), so the files look
// the same in an <img>, in a video editor and on paper. Animated files draw
// themselves once (about 2 s) and then hold; prefers-reduced-motion shows the
// finished logo at once. Colours come from --jl-ink and --jl-accent when the
// SVG is inlined, with the house colours as the fallback.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "assets", "brand");

const COLOURS = {
  light: { ink: "#3d3a37", accent: "#3ea88c" }, // on cream or white
  dark: { ink: "#f5f0e8", accent: "#5cc4a6" }, // on dark backgrounds
};

// Monoline capitals, cap height 40 (y 0..40), one array entry per stroke.
const GLYPHS = {
  J: { w: 22, d: ["M22 0V27a11 11 0 0 1-22 0"] },
  O: { w: 34, d: ["M17 0A17 20 0 0 1 17 40A17 20 0 0 1 17 0"] },
  H: { w: 28, d: ["M0 0V40", "M28 0V40", "M0 20H28"] },
  A: { w: 30, d: ["M0 40L15 0L30 40", "M5.6 25H24.4"] },
  N: { w: 28, d: ["M0 40V0L28 40V0"] },
  S: {
    w: 26,
    d: ["M24 6C21 2 17.5 0 13 0C6.5 0 2 3.8 2 10C2 16.5 8 18.2 13 20C18.5 22 25 24 25 30.5C25 36.5 20 40 13 40C8 40 3.8 37.8 1 34"],
  },
};
const WORD = "JOHANSSON";
const TRACK = 14;
const WORD_W = [...WORD].reduce((s, c) => s + GLYPHS[c].w, 0) + TRACK * (WORD.length - 1);

// Timeline (seconds).
const T = { ring: 0, ringDur: 0.85, j: 0.3, jDur: 0.6, stamp: 0.85, word: 0.8, letter: 0.08, stroke: 0.06, strokeDur: 0.45 };
const DURATION = T.word + T.letter * (WORD.length - 1) + T.stroke * 2 + T.strokeDur; // ≈ 2.04 s

let delays = [];
const draw = (d, delay, dur, cls) => {
  delays.push([delay, dur]);
  return `<path class="${cls}" pathLength="1" d="${d}" style="animation-delay:${delay.toFixed(2)}s;animation-duration:${dur.toFixed(2)}s"/>`;
};

// The mark: a stamped ring with a J, drawn in a 100 x 100 box.
function mark() {
  return (
    `<g class="mark">` +
    draw("M50 8A42 42 0 1 1 50 92A42 42 0 1 1 50 8", T.ring, T.ringDur, "a s5") +
    draw("M45 30H62V57A12 12 0 0 1 38 57", T.j, T.jDur, "a s9") +
    `</g>`
  );
}

function wordmark() {
  let x = 0;
  let out = `<g class="word">`;
  [...WORD].forEach((c, i) => {
    const g = GLYPHS[c];
    out += `<g transform="translate(${x} 0)">`;
    g.d.forEach((d, k) => (out += draw(d, T.word + i * T.letter + k * T.stroke, T.strokeDur, "i s7")));
    out += `</g>`;
    x += g.w + TRACK;
  });
  return out + `</g>`;
}

function style(c, animated) {
  const base =
    `path{fill:none;stroke-linecap:round;stroke-linejoin:round}` +
    `.i{stroke:var(--jl-ink,${c.ink})}.a{stroke:var(--jl-accent,${c.accent})}` +
    `.s5{stroke-width:5}.s7{stroke-width:7}.s9{stroke-width:9}`;
  if (!animated) return base;
  return (
    base +
    `path{stroke-dasharray:1 1;animation-name:jl-draw;animation-timing-function:cubic-bezier(.65,0,.35,1);animation-fill-mode:both}` +
    `.mark{transform-box:fill-box;transform-origin:center;animation:jl-stamp .45s cubic-bezier(.3,1.6,.5,1) ${T.stamp}s both}` +
    `@keyframes jl-draw{0%{stroke-dashoffset:1;opacity:0}1%{opacity:1}100%{stroke-dashoffset:0;opacity:1}}` +
    `@keyframes jl-stamp{0%{transform:scale(1)}35%{transform:scale(.93)}100%{transform:scale(1)}}` +
    `@media (prefers-reduced-motion:reduce){path,.mark{animation:none!important;stroke-dashoffset:0!important;opacity:1!important}}`
  );
}

const LAYOUTS = {
  // Mark beside the name: headers, letterheads, video lower thirds.
  horizontal: { vb: [0, 0, 128 + WORD_W + 8, 100], body: () => mark() + `<g transform="translate(128 30)">${wordmark()}</g>` },
  // Mark above the name: title cards, posters, intros.
  stacked: {
    vb: [0, 0, 420, 270],
    body: () =>
      `<g transform="translate(130 6) scale(1.6)">${mark()}</g>` +
      `<g transform="translate(${(420 - WORD_W * 0.92) / 2} 210) scale(.92)">${wordmark()}</g>`,
  },
  // Mark alone: avatars, favicons, watermarks, stamps.
  mark: { vb: [0, 0, 100, 100], body: () => mark() },
  // Name alone: tight spaces where the mark is shown elsewhere.
  wordmark: { vb: [-6, -6, WORD_W + 12, 52], body: () => wordmark() },
};

mkdirSync(OUT, { recursive: true });
const written = [];
for (const [name, L] of Object.entries(LAYOUTS)) {
  for (const [scheme, c] of Object.entries(COLOURS)) {
    for (const animated of [true, false]) {
      delays = [];
      const body = L.body();
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${L.vb.join(" ")}" width="${L.vb[2]}" height="${L.vb[3]}" role="img" aria-label="Johansson">` +
        `<title>Johansson</title><style>${style(c, animated)}</style>${body}</svg>\n`;
      const file = `johansson-${name}${scheme === "dark" ? "-on-dark" : ""}${animated ? "-animated" : ""}.svg`;
      writeFileSync(join(OUT, file), svg);
      written.push(file);
    }
  }
}
writeFileSync(join(OUT, "timeline.json"), JSON.stringify({ duration: +DURATION.toFixed(2), stamp: T.stamp }, null, 2) + "\n");
console.log(`${written.length} files in assets/brand/ (animation ${DURATION.toFixed(2)} s)`);
