// Vertical Shorts engine (1080×1920): pixel-art ship bridge, hook banner at the top, a board in the
// middle and the teacher with a speech bubble at the bottom. Deterministic: the same time gives the same frame,
// so play.html can preview and render.cjs can render frame by frame.
import { drawTeacher } from './teacher.mjs';

/** Channel name shown in the hook banner. */
export const BRAND = 'JOJO ENGINEERING';

export const COL = {
  sea: '#0b3b5c', sea2: '#0e4c75', sky: '#eaf3f9', paper: '#ffffff', ink: '#163248', muted: '#5f7688',
  blue: '#064f91', orange: '#c8641e', green: '#0e7c5a', red: '#b8323c', purple: '#7a3fa0', gold: '#f2b705', grid: '#d8e3ec',
};
export const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
/** 0→1 between times a and b (seconds) */
export const prog = (t, a, b) => ease((t - a) / (b - a));

const SUB = { 'ᴸ': 'L', 'ᶜ': 'C', 'ᴿ': 'R', 'ꜰ': 'F', 'ɴ': 'N' };
/** Text with subscripts for _{…} (and ᴸ ᶜ ᴿ ꜰ ɴ). align: left|center|right */
export function text(ctx, s, x, y, { size = 34, color = COL.ink, weight = 600, align = 'left', font = 'Carlito, Calibri, Arial, sans-serif', alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.textBaseline = 'middle';
  const parts = []; let buf = '';
  const str = String(s);
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '_' && str[i + 1] === '{') { const j = str.indexOf('}', i); if (buf) parts.push([buf, false]); parts.push([str.slice(i + 2, j), true]); buf = ''; i = j; }
    else if (SUB[ch]) { if (buf) parts.push([buf, false]); parts.push([SUB[ch], true]); buf = ''; } else buf += ch;
  }
  if (buf) parts.push([buf, false]);
  const fnt = (sub) => `${weight} ${sub ? Math.round(size * 0.7) : size}px ${font}`;
  let total = 0; for (const [p, sub] of parts) { ctx.font = fnt(sub); total += ctx.measureText(p).width; }
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  for (const [p, sub] of parts) { ctx.font = fnt(sub); ctx.fillText(p, cx, sub ? y + size * 0.22 : y); cx += ctx.measureText(p).width; }
  ctx.restore(); return total;
}
export function line(ctx, x1, y1, x2, y2, color = COL.ink, w = 3, dash = null) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
export function arrow(ctx, x1, y1, x2, y2, color = COL.ink, w = 5, head = 18) {
  const a = Math.atan2(y2 - y1, x2 - x1); const len = Math.hypot(x2 - x1, y2 - y1); if (len < 1) return;
  const h = Math.min(head, len * 0.6); const hx = x2 - h * Math.cos(a), hy = y2 - h * Math.sin(a);
  line(ctx, x1, y1, hx, hy, color, w);
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(hx + h * 0.45 * Math.sin(a), hy - h * 0.45 * Math.cos(a)); ctx.lineTo(hx - h * 0.45 * Math.sin(a), hy + h * 0.45 * Math.cos(a)); ctx.closePath(); ctx.fill(); ctx.restore();
}
export function roundRect(ctx, x, y, w, h, r, fill, stroke = null, lw = 2) {
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } ctx.restore();
}
/** Curve y = f(x) in the box (x0,y0,w,h), domain [a,b], range [-ymax, ymax] */
export function plot(ctx, f, { x0, y0, w, h, a = 0, b = 1, ymax = 1, color = COL.blue, width = 5, upto = 1, dash = null, fill = null }) {
  const X = (x) => x0 + ((x - a) / (b - a)) * w; const Y = (v) => y0 + h / 2 - (v / ymax) * (h / 2);
  const n = 400, end = Math.max(1, Math.round(n * clamp(upto)));
  ctx.save(); ctx.beginPath();
  for (let i = 0; i <= end; i++) { const x = a + ((b - a) * i) / n; const px = X(x), py = Y(f(x)); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
  if (fill) { ctx.lineTo(X(a + ((b - a) * end) / n), Y(0)); ctx.lineTo(X(a), Y(0)); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.beginPath(); for (let i = 0; i <= end; i++) { const x = a + ((b - a) * i) / n; if (i) ctx.lineTo(X(x), Y(f(x))); else ctx.moveTo(X(x), Y(f(x))); } }
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.restore();
  return { X, Y };
}
export function axes(ctx, { x0, y0, w, h, color = '#9fb2c1' }) {
  line(ctx, x0, y0 + h / 2, x0 + w, y0 + h / 2, color, 2); line(ctx, x0, y0, x0, y0 + h, color, 2);
}

export const W = 1080, H = 1920;
// The board. The Shorts UI covers roughly 120 px on the right and 380 px at the bottom.
export const B = { x: 60, y: 420, w: 960, h: 740 };
const FONT = 'Carlito, Calibri, Arial, sans-serif';
const PX = 12; // pixelstorlek i bakgrunden

const GULL = [['..kk......kk..', '.kwwk....kwwk.', 'k..kwwkkwwk..k', '.....kwwk.....', '......kk......'],
  ['..............', '......kk......', '.kkkkwwwwkkkk.', 'kwwwk.kk.kwwwk', 'k............k']];
/** A small pixel seagull flying past the window */
function gull(ctx, x, y, t) {
  const rows = GULL[Math.floor(t / 0.2) % 2];
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') { ctx.fillStyle = ch === 'k' ? '#1b2530' : '#ffffff'; ctx.fillRect(x + i * 5, y + j * 5, 5, 5); } }));
}

/** Pixel-art ship bridge: windows with sea, bulkhead with instruments, deck plates. */
export function bridge(ctx, t) {
  // sky in bands
  const sky = ['#9fd0ee', '#b3daf2', '#c8e5f6', '#dcf0fa'];
  sky.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * 120, W, 120); });
  // slowly drifting clouds
  ctx.fillStyle = '#ffffff';
  for (const [x0, y, w] of [[80, 150, 22], [620, 260, 16], [360, 60, 12]]) {
    const x = ((x0 + t * 14) % (W + 400)) - 200;
    ctx.fillRect(x, y, w * PX, PX * 2); ctx.fillRect(x + 3 * PX, y - PX * 2, (w - 7) * PX, PX * 2); ctx.fillRect(x + 6 * PX, y - PX * 3, 5 * PX, PX);
  }
  // island on the horizon
  ctx.fillStyle = '#4f8f5a'; ctx.fillRect(700, 444, 22 * PX, 36); ctx.fillRect(760, 420, 12 * PX, 24); ctx.fillStyle = '#3f7a4a'; ctx.fillRect(800, 408, 5 * PX, 12);
  // sea with pixel waves
  ctx.fillStyle = '#1f6fa6'; ctx.fillRect(0, 480, W, 300);
  ctx.fillStyle = '#2d86c0'; for (let r = 0; r < 6; r++) ctx.fillRect(0, 492 + r * 48, W, PX * 2);
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  for (let r = 0; r < 6; r++) for (let k = 0; k < 7; k++) {
    const x = ((k * 190 + r * 70 + Math.floor(t * (8 + r * 3)) * PX) % (W + 60)) - 30;
    ctx.fillRect(Math.round(x / PX) * PX, 504 + r * 48, 4 * PX, PX / 2 + 2);
  }
  // a seagull flies past every 16 seconds
  const cyc = t % 16;
  if (cyc < 7) gull(ctx, W + 60 - cyc * 200, 300 + Math.sin(cyc * 2) * 16, t);
  // window frames
  ctx.fillStyle = '#5d6d7b';
  ctx.fillRect(0, 0, W, 36); ctx.fillRect(0, 760, W, 36);
  for (const x of [0, 348, 708, 1056]) ctx.fillRect(x, 0, 24, 796);
  ctx.fillStyle = '#7b8c9a'; for (const x of [0, 348, 708, 1056]) ctx.fillRect(x + 4, 0, 6, 796);
  // bulkhead with panels
  ctx.fillStyle = '#c5d0da'; ctx.fillRect(0, 796, W, 740);
  ctx.fillStyle = '#b3c0cc'; for (let y = 796; y < 1536; y += 120) ctx.fillRect(0, y, W, 6);
  // console with blinking lamps
  ctx.fillStyle = '#3a4a58'; ctx.fillRect(0, 1180, W, 360);
  ctx.fillStyle = '#2b3945'; ctx.fillRect(0, 1180, W, 18);
  const lamps = ['#35d07f', '#f2b705', '#35d07f', '#e05050', '#4fb3ff'];
  for (let i = 0; i < 16; i++) {
    const on = (Math.floor(t * 1.3 + i * 0.7) % 5) !== 0;
    ctx.fillStyle = on ? lamps[i % lamps.length] : '#23303b'; ctx.fillRect(40 + i * 64, 1230, PX * 2, PX * 2);
  }
  for (let i = 0; i < 4; i++) { ctx.fillStyle = '#12303f'; ctx.fillRect(60 + i * 250, 1290, 190, 120); ctx.fillStyle = '#1f5f4a'; ctx.fillRect(72 + i * 250, 1302, 166, 96); }
  // deck plates
  for (let y = 1536; y < H; y += 48) for (let x = 0; x < W; x += 48) { ctx.fillStyle = ((x + y) / 48) % 2 ? '#8b98a4' : '#96a3ae'; ctx.fillRect(x, y, 48, 48); }
}

/** Word wrap to a width. */
export function wrap(ctx, s, maxW, size, weight = 700) {
  ctx.save(); ctx.font = `${weight} ${size}px ${FONT}`;
  const out = []; let cur = '';
  for (const wd of String(s).split(' ')) { const test = cur ? `${cur} ${wd}` : wd; if (ctx.measureText(test.replace(/_\{([^}]*)\}/g, '$1')).width > maxW && cur) { out.push(cur); cur = wd; } else cur = test; }
  if (cur) out.push(cur); ctx.restore(); return out;
}

/** The hook: the question in a dark banner at the top, for the whole video. */
export function hook(ctx, s, t, kicker) {
  const a = ease(t / 0.25);
  // Shrink the text until the hook fits on two lines
  let size = 62, lines = wrap(ctx, s, 880, size);
  while (lines.length > 2 && size > 44) { size -= 4; lines = wrap(ctx, s, 880, size); }
  const lh = Math.round(size * 1.2), h = 70 + lines.length * lh;
  ctx.save(); ctx.globalAlpha = a;
  roundRect(ctx, 60, 150 + (1 - a) * -30, 960, h, 26, 'rgba(10,30,50,.92)');
  ctx.fillStyle = COL.gold; ctx.fillRect(60, 150 + 26, 10, h - 52);
  text(ctx, kicker, 100, 150 + 34, { size: 26, color: COL.gold, weight: 700 });
  lines.forEach((ln, i) => text(ctx, ln, 100, 150 + 84 + i * lh, { size, color: '#ffffff', weight: 700 }));
  ctx.restore();
  return 150 + h;
}

/** The board in the middle */
export function card(ctx, y = B.y, h = B.h) {
  roundRect(ctx, B.x + 8, y + 10, B.w, h, 28, 'rgba(0,20,40,.22)');
  roundRect(ctx, B.x, y, B.w, h, 28, COL.paper, '#163248', 4);
}

/** Speech bubble to the right of the teacher. Returns its height. */
export function speech(ctx, s, alpha = 1, { x = 420, y = 1220, w = 540, size = 44 } = {}) {
  if (alpha <= 0 || !s) return 0;
  const lines = wrap(ctx, s, w - 56, size, 700);
  const lh = size * 1.22, h = lines.length * lh + 44;
  ctx.save(); ctx.globalAlpha = alpha;
  roundRect(ctx, x + 6, y + 8, w, h, 26, 'rgba(0,20,40,.25)');
  roundRect(ctx, x, y, w, h, 26, '#ffffff', '#163248', 4);
  // tail towards the mouth
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#163248'; ctx.lineWidth = 4; ctx.beginPath();
  const by = Math.min(y + h - 30, y + 90);
  ctx.moveTo(x, by - 22); ctx.lineTo(x - 56, by + 34); ctx.lineTo(x, by + 16); ctx.fill(); ctx.stroke(); ctx.fillRect(x - 3, by - 20, 8, 34);
  lines.forEach((ln, i) => text(ctx, ln, x + 28, y + 22 + lh / 2 + i * lh, { size, weight: 700, color: COL.ink }));
  ctx.restore(); return h;
}

/** Large formulas or lines on the board, faded in at given times. list: [[time, text, colour?, size?]] */
export function rows(ctx, t, list, { x = B.x + 60, y = B.y + 120, gap = 110, size = 64 } = {}) {
  list.forEach(([at, s, c = COL.ink, sz = size], i) => {
    const a = prog(t, at, at + 0.5); if (a <= 0) return;
    text(ctx, s, x + (1 - a) * 30, y + i * gap, { size: sz, weight: 700, color: c, alpha: a });
  });
}
/** Board heading */
export function heading(ctx, s, y = B.y + 64) { text(ctx, s, B.x + 44, y, { size: 42, weight: 700, color: COL.muted }); }
/** Stamp for the takeaway, e.g. “×4” */
export function stamp(ctx, s, x, y, a, color = COL.red) {
  if (a <= 0) return; const k = 1 + (1 - ease(a)) * 0.6;
  ctx.save(); ctx.font = `700 96px ${FONT}`; const w = ctx.measureText(s.replace(/_\{([^}]*)\}/g, '$1')).width + 60;
  const fit = Math.min(1, 860 / w);
  ctx.translate(x, y); ctx.scale(k * fit, k * fit); ctx.rotate(-0.08); ctx.globalAlpha = clamp(a * 1.5);
  roundRect(ctx, -w / 2, -66, w, 132, 18, 'rgba(255,255,255,.9)', color, 8);
  text(ctx, s, 0, 4, { size: 96, weight: 700, color, align: 'center' });
  ctx.restore();
}
/** Lightning bolt for faults and arcs */
export function bolt(ctx, x, y, s = 1, a = 1, color = COL.orange) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color; ctx.beginPath();
  [[0, -34], [18, -3], [5, -3], [18, 34], [-15, 0], [0, 0]].forEach(([dx, dy], i) => (i ? ctx.lineTo(x + dx * s, y + dy * s) : ctx.moveTo(x + dx * s, y + dy * s)));
  ctx.closePath(); ctx.fill(); ctx.restore();
}

/**
 * Builds a short. def: { id, kicker, hook, title, desc, tags, beats: [{ dur, draw(ctx, t), say: [[from, to, text]], point? }] }
 * Time in beat.draw counts from the start of the beat. Lines are collected into one timeline.
 */
export function compileShort(def) {
  let t0 = 0; def.lines = []; def.cuts = [];
  for (const bt of def.beats) { def.cuts.push(t0); for (const [a, b, s] of bt.say || []) def.lines.push({ at: t0 + a, to: t0 + b, who: 'Nils', text: s }); t0 += bt.dur; }
  def.duration = t0; return def;
}
export const lineAt = (sh, time) => sh.lines.find((l) => time >= l.at && time < l.to);

export function drawShort(ctx, sh, time) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  bridge(ctx, time);
  let t0 = 0, beat = null, bt = 0;
  for (const b of sh.beats) { if (time < t0 + b.dur) { beat = b; bt = time - t0; break; } t0 += b.dur; }
  if (!beat) { beat = sh.beats[sh.beats.length - 1]; bt = beat.dur; }
  hook(ctx, sh.hook, time, `${BRAND} · ${sh.kicker}`);
  card(ctx);
  ctx.save(); ctx.beginPath(); ctx.roundRect(B.x, B.y, B.w, B.h, 28); ctx.clip();
  // soft transition between beats
  const fade = clamp(bt / 0.25);
  ctx.globalAlpha = fade; beat.draw(ctx, bt); ctx.restore();
  const ln = lineAt(sh, time);
  drawTeacher(ctx, 40, 1800, { px: 14, time, talking: !!ln && (time - ln.at) < Math.max(0.6, (ln.to - ln.at) * 0.8), point: typeof beat.point === 'function' ? beat.point(bt) : !!beat.point });
  if (ln) speech(ctx, ln.text, Math.min(1, (time - ln.at) / 0.15, (ln.to - time) / 0.15));
}

/** Captions in SRT format (YouTube accepts SRT and VTT). */
export function toSRT(sh) {
  const ts = (s) => { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, r = s % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${r.toFixed(3).replace('.', ',').padStart(6, '0')}`; };
  return sh.lines.map((l, i) => `${i + 1}\n${ts(l.at)} --> ${ts(l.to)}\n${l.text.replace(/_\{([^}]*)\}/g, '$1')}\n`).join('\n');
}
