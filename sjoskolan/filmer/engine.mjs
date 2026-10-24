// Sjöskolans filmmotor: deterministisk canvas-animation som kan spelas i webbläsaren
// och renderas bild för bild till video (se render.cjs).
import { drawMans, drawSigge } from './mascots.mjs';
export const W = 1280, H = 720;
export const COL = {
  sea: '#0b3b5c', sea2: '#0e4c75', sky: '#eaf3f9', paper: '#ffffff', ink: '#163248', muted: '#5f7688',
  blue: '#064f91', orange: '#c8641e', green: '#0e7c5a', red: '#b8323c', purple: '#7a3fa0', gold: '#f2b705', grid: '#d8e3ec',
};
export const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
/** 0→1 mellan tiderna a och b (sekunder) */
export const prog = (t, a, b) => ease((t - a) / (b - a));

const SUB = { 'ᴸ': 'L', 'ᶜ': 'C', 'ᴿ': 'R', 'ꜰ': 'F', 'ɴ': 'N' };
/** Text med nedsänkta index för tecknen ᴸ ᶜ ᴿ ꜰ ɴ och för _{…}. align: left|center|right */
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
/** Kurva y = f(x) i rektangeln (x0,y0,w,h) med domän [a,b] och värdemängd [-ymax, ymax] */
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
/** Havsbakgrund med vågor; phase flyttar vågorna */
export function seaBackground(ctx, t, { horizon = 560 } = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, horizon); g.addColorStop(0, '#dcecf7'); g.addColorStop(1, '#f5fafd');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, horizon);
  ctx.fillStyle = COL.sea2; ctx.fillRect(0, horizon, W, H - horizon);
  for (let k = 0; k < 3; k++) {
    ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.25 - k * 0.06})`; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = 0; x <= W; x += 8) { const y = horizon + 22 + k * 38 + 6 * Math.sin(x / 55 + t * 1.6 + k); if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
  }
}
/** Ljus tavla att rita diagram på */
export function board(ctx, x, y, w, h) { roundRect(ctx, x + 6, y + 8, w, h, 22, 'rgba(0,30,60,.12)'); roundRect(ctx, x, y, w, h, 22, COL.paper, '#c9d7e2', 2); }

/** Pratbubbla. side: 'left'|'right'|'down' anger var pilen pekar från bubblan. */
export function bubble(ctx, s, x, y, { w = 520, size = 30, side = 'left', tx = null, ty = null, alpha = 1, color = COL.ink } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.font = `600 ${size}px Carlito, Calibri, Arial, sans-serif`;
  const words = String(s).split(' '); const lines = []; let cur = '';
  for (const wd of words) { const test = cur ? `${cur} ${wd}` : wd; if (ctx.measureText(test).width > w - 44 && cur) { lines.push(cur); cur = wd; } else cur = test; }
  if (cur) lines.push(cur);
  const lh = size * 1.25; const h = lines.length * lh + 34;
  roundRect(ctx, x, y, w, h, 24, '#ffffff', '#163248', 3);
  if (tx !== null) {
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#163248'; ctx.lineWidth = 3; ctx.beginPath();
    if (tx > x + w) { const by = clamp(ty, y + 24, y + h - 24); ctx.moveTo(x + w, by - 16); ctx.lineTo(tx, ty); ctx.lineTo(x + w, by + 16); ctx.fill(); ctx.stroke(); ctx.fillRect(x + w - 5, by - 14, 6, 28); }
    else { const bx = clamp(tx, x + 40, x + w - 40); const by = ty < y ? y : y + h; ctx.moveTo(bx - 18, by); ctx.lineTo(tx, ty); ctx.lineTo(bx + 18, by); ctx.fill(); ctx.stroke(); ctx.fillRect(bx - 16, by - (ty < y ? -2 : 3), 32, 5); }
  }
  lines.forEach((ln, i) => text(ctx, ln, x + 22, y + 17 + lh / 2 + i * lh, { size, color }));
  ctx.restore(); return h;
}
/** Titelkort */
export function titleCard(ctx, t, title, sub, week) {
  seaBackground(ctx, t, { horizon: 520 });
  text(ctx, 'SJÖSKOLAN · ELTEKNIK', 80, 110, { size: 26, color: COL.muted, weight: 700 });
  text(ctx, title, 80, 190, { size: 72, weight: 700, color: COL.ink });
  text(ctx, sub, 80, 265, { size: 34, weight: 400, color: COL.muted });
  if (week) { roundRect(ctx, 80, 312, 190, 50, 25, COL.blue); text(ctx, week, 175, 337, { size: 26, color: '#fff', align: 'center', weight: 700 }); }
}

/**
 * En film: { id, title, sub, week, scenes: [{ dur, draw(ctx, t, env) }], lines: [{ at, to, who, text }] }
 * Tiden t i scenens draw() räknas från scenens början.
 */
export function duration(film) { return film.scenes.reduce((s, sc) => s + sc.dur, 0); }

/** Scenernas repliker (say: [[från, till, vem, text]], tider inom scenen) samlas till filmens tidslinje. */
export function compile(film) {
  let t0 = 0; film.lines = [];
  for (const sc of film.scenes) { for (const [a, b, who, txt] of sc.say || []) film.lines.push({ at: t0 + a, to: t0 + b, who, text: txt }); t0 += sc.dur; }
  return film;
}

// Standardlayout: tavla till vänster, måsen och matrosen till höger, repliken i en bubbla under tavlan.
export const BOARD = { x: 36, y: 30, w: 870, h: 510 };
const SPOT = { Sigge: [1104, 486], Måns: [936, 380] };
export function stage(ctx, t) { seaBackground(ctx, t); board(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h); }
/** Ritar maskotarna och aktuell replik. Den som pratar rör munnen. */
export function cast(ctx, film, time, { wave = false, flap = false, hop = false } = {}) {
  const ln = lineAt(film, time); const who = ln?.who;
  // Måns står på en pollare
  roundRect(ctx, 950, 506, 128, 26, 6, '#2b3a47'); roundRect(ctx, 968, 530, 92, 60, 4, '#3a4b59');
  drawMans(ctx, SPOT.Måns[0], SPOT.Måns[1], { px: 7, time, talking: who === 'Måns', flip: true, flap: flap || who === 'Måns' && /[!?]$/.test(ln.text), hop });
  drawSigge(ctx, SPOT.Sigge[0], SPOT.Sigge[1], { px: 9, time, talking: who === 'Sigge', wave });
  if (ln) {
    const fade = Math.min(1, (time - ln.at) / 0.2, (ln.to - time) / 0.2);
    const tx = who === 'Måns' ? 930 : 1096, ty = who === 'Måns' ? 440 : 560;
    bubble(ctx, ln.text, 36, 566, { w: 870, size: 29, tx, ty, alpha: fade });
  }
}
export function drawFrame(ctx, film, time) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  let t0 = 0;
  for (const sc of film.scenes) {
    if (time < t0 + sc.dur || sc === film.scenes[film.scenes.length - 1]) {
      const t = Math.min(time - t0, sc.dur);
      sc.draw(ctx, t, { T: sc.dur, global: time, film });
      if (sc.cast !== false) cast(ctx, film, time, typeof sc.cast === 'function' ? sc.cast(t) : {});
      break;
    }
    t0 += sc.dur;
  }
}
/** Undertexter i WebVTT-format ur filmens repliker */
export function toVTT(film) {
  const ts = (s) => { const m = Math.floor(s / 60), r = s - m * 60; return `00:${String(m).padStart(2, '0')}:${r.toFixed(3).padStart(6, '0')}`; };
  return 'WEBVTT\n\n' + film.lines.map((l, i) => `${i + 1}\n${ts(l.at)} --> ${ts(l.to)}\n${l.who ? `<v ${l.who}>` : ''}${l.text.replace(/_\{([^}]*)\}/g, '$1').replace(/[ᴸᶜᴿꜰɴ]/g, (c) => SUB[c])}\n`).join('\n');
}
/** Repliken som gäller vid global tid */
export const lineAt = (film, time) => film.lines.find((l) => time >= l.at && time < l.to);
