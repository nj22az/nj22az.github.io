import {publishEquipment,setEquipmentControl} from './equipment-state.mjs';
// Växelströmslabbet · interaktion och ritning
import { waveform, instant, instantPower, seriesCircuit, fmt, parseAnswer, isClose, SHAPES } from './model.mjs';
import { markHtml } from '../gemensamt/markering.mjs?v=20260928';
import { DEFAULTS, CHALLENGES, readouts, expected } from './lessons.mjs?v=20260925-ac2';
import { mountProtocol } from '../gemensamt/labbprotokoll.mjs?v=20260929-not';
import { STATION_B_AC_PROTOKOLL, RIG_AC, CAL_AC } from './stationB-protokoll.mjs?v=20260925-ac2';

const $ = (id) => document.getElementById(id);
const C = { blue: '#064f91', orange: '#c8641e', green: '#0e7c5a', red: '#b8323c', slate: '#4a6378', purple: '#7a3fa0', ink: '#163248', muted: '#6b7f90', grid: '#dfe7ee', soft: '#edf3f7' };
const STORE = 'sjoskolan-vaxelstrom-v1';
const clone = (o) => JSON.parse(JSON.stringify(o));
// Index skrivs nedsänkt (X_L, X_C, U_R, Q_C) i stället för med upphöjda bokstäver
const SUBS = { 'ᴸ': 'L', 'ᶜ': 'C', 'ᴿ': 'R', 'ꜰ': 'F' };
const plain = (t) => String(t).replace(/[ᴸᶜᴿꜰ]/g, (ch) => SUBS[ch]).replace(/_\{([^{}]*)\}/g, '$1');
const escHtml = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const subHtml = (t) => markHtml(String(t).replace(/[ᴸᶜᴿꜰ]/g, (ch) => `_{${SUBS[ch]}}`));

const state = { tab: 'sinus', values: clone(DEFAULTS), challenge: null, attempts: 0, solved: loadSolved() };

// ---------- lagring ----------
function loadSolved() {
  try { return new Set(JSON.parse(localStorage.getItem(STORE) || '[]')); } catch { return new Set(); }
}
function saveSolved() {
  try { localStorage.setItem(STORE, JSON.stringify([...state.solved])); } catch { /* lagring blockerad */ }
}

// ---------- reglage ----------
const CONTROLS = {
  sinus: [
    { key: 'shape', label: 'Kurvform', type: 'select', options: Object.entries(SHAPES).map(([v, s]) => [v, s.label]) },
    { key: 'urms', label: 'Effektivvärde U', unit: 'V', min: 1, max: 690, step: 0.1 },
    { key: 'f', label: 'Frekvens f', unit: 'Hz', min: 1, max: 400, step: 1 },
    { key: 'window', label: 'Tidsaxel', type: 'select', options: [['auto', 'Två perioder'], ['20', '0–20 ms'], ['40', '0–40 ms'], ['100', '0–100 ms']] },
    { key: 't', label: 'Tidpunkt t', unit: 'ms', min: 0, max: (s) => windowMs(s), step: 0.05 },
    { key: 'showB', label: 'Visa en andra, förskjuten signal', type: 'check' },
    { key: 'dt', label: 'Förskjutning Δt', unit: 'ms', min: -10, max: 10, step: 0.1, show: (s) => s.showB },
  ],
  impedans: [
    { key: 'kind', label: 'Seriekrets', type: 'select', options: [['R', 'R'], ['RL', 'R + L'], ['RC', 'R + C'], ['RLC', 'R + L + C']] },
    { key: 'U', label: 'Källspänning U (RMS)', unit: 'V', min: 1, max: 400, step: 1 },
    { key: 'f', label: 'Frekvens f', unit: 'Hz', min: 1, max: 500, step: 1 },
    { key: 'R', label: 'Resistans R', unit: 'Ω', min: 1, max: 200, step: 0.5 },
    { key: 'L', label: 'Induktans L', unit: 'mH', min: 1, max: 1000, step: 0.5, show: (s) => s.kind.includes('L') },
    { key: 'C', label: 'Kapacitans C', unit: 'µF', min: 1, max: 1000, step: 0.1, show: (s) => s.kind.includes('C') },
  ],
  effekt: [
    { key: 'U', label: 'Spänning U (RMS)', unit: 'V', min: 12, max: 690, step: 1 },
    { key: 'f', label: 'Nätfrekvens', type: 'select', options: [['60', '60 Hz (vanligt ombord)'], ['50', '50 Hz (land)']] },
    { key: 'P', label: 'Aktiv effekt P', unit: 'W', min: 100, max: 20000, step: 10 },
    { key: 'pf', label: 'Effektfaktor PF = cos φ', unit: '', min: 0.1, max: 1, step: 0.01 },
    { key: 'character', label: 'Lastens karaktär', type: 'select', options: [['induktiv', 'Induktiv (motor, pump, fläkt)'], ['kapacitiv', 'Kapacitiv (t.ex. filter, lätt belastad kabel)']] },
    { key: 'Qc', label: 'Kompensering Q_{C} (kondensator)', unit: 'var', min: 0, max: (s) => Math.max(100, Math.ceil(readouts('effekt', s).QcFull * 1.5 / 10) * 10), step: 10, show: (s) => s.character === 'induktiv' },
    { key: 'Rcable', label: 'Kabelns slingresistans', unit: 'Ω', min: 0, max: 2, step: 0.01 },
  ],
};

function windowMs(s) {
  return s.window === 'auto' ? 2000 / s.f : Number(s.window);
}
const v2 = (v) => v.toFixed(2).replace('.', ',');
const resolve = (v, s) => (typeof v === 'function' ? v(s) : v);

function renderControls() {
  const form = $('controls');
  const s = state.values[state.tab];
  const locked = Boolean(state.challenge);
  form.innerHTML = '';
  for (const c of CONTROLS[state.tab]) {
    if (c.show && !c.show(s)) continue;
    const id = `ctl-${c.key}`;
    const row = document.createElement('div');
    row.className = `control control-${c.type || 'range'}`;
    if (c.type === 'select') {
      row.innerHTML = `<label for="${id}">${subHtml(c.label)}</label><select id="${id}">${c.options.map(([v, l]) => `<option value="${v}"${String(s[c.key]) === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
    } else if (c.type === 'check') {
      row.innerHTML = `<label class="check"><input type="checkbox" id="${id}"${s[c.key] ? ' checked' : ''}> ${subHtml(c.label)}</label>`;
    } else {
      const max = resolve(c.max, s);
      if (s[c.key] > max) s[c.key] = max;
      row.innerHTML = `<div class="control-top"><label for="${id}">${subHtml(c.label)}</label><span class="num"><input type="number" id="${id}-n" aria-label="${plain(c.label)} som tal" min="${c.min}" max="${max}" step="${c.step}" value="${s[c.key]}"><span>${c.unit}</span></span></div>
        <input type="range" id="${id}" min="${c.min}" max="${max}" step="${c.step}" value="${s[c.key]}" aria-valuetext="${fmt(s[c.key])} ${c.unit}">`;
    }
    form.append(row);
    row.querySelectorAll('input,select').forEach((el) => {
      el.disabled = locked && !(state.challenge?.lockTime === false && c.key === 't');
      const evt = el.type === 'range' || el.type === 'number' ? 'input' : 'change';
      el.addEventListener(evt, () => onControl(c, el));
    });
  }
  $('lock-note').hidden = !locked;
}

function onControl(c, el) {
  const s = state.values[state.tab];
  let v;
  if (c.type === 'check') v = el.checked;
  else if (c.type === 'select') v = el.value;
  else {
    v = Number(el.value);
    if (!Number.isFinite(v)) return;
    v = Math.min(resolve(c.max, s), Math.max(c.min, v));
    const twin = el.type === 'range' ? $(`ctl-${c.key}-n`) : $(`ctl-${c.key}`);
    if (twin && document.activeElement !== twin) twin.value = v;
    const range = $(`ctl-${c.key}`);
    if (range) range.setAttribute('aria-valuetext', `${fmt(v)} ${c.unit}`);
  }
  if (c.key === 'f' && c.type === 'select') v = Number(v);
  s[c.key] = v;
  if (c.key === 'character' && v === 'kapacitiv') s.Qc = 0;
  // val och kryssrutor kan ändra vilka reglage som visas; skjutreglage byts inte ut under dragning
  if (c.type === 'select' || c.type === 'check') renderControls();
  else refreshLimits();
  render();
}

function refreshLimits() {
  const s = state.values[state.tab];
  for (const c of CONTROLS[state.tab]) {
    if (typeof c.max !== 'function') continue;
    const max = c.max(s);
    if (s[c.key] > max) s[c.key] = max;
    for (const el of [$(`ctl-${c.key}`), $(`ctl-${c.key}-n`)]) {
      if (!el) continue;
      el.max = max;
      if (Number(el.value) !== s[c.key] && document.activeElement !== el) el.value = s[c.key];
    }
  }
}

// ---------- SVG-hjälp ----------
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function txt(x, y, t, { color = C.ink, size = 14, anchor = 'start', weight = 400, baseline = 'middle' } = {}) {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-weight="${weight}" dominant-baseline="${baseline}" paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round">${esc(t).replace(/[ᴸᶜᴿꜰ]/g, (ch) => `_{${SUBS[ch]}}`).replace(/_\{([^{}]*)\}/g, (_, x) => `<tspan baseline-shift="sub" font-size="75%">${x}</tspan>`)}</text>`;
}
function line(x1, y1, x2, y2, color, w = 2, dash = '') {
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`;
}
function arrow(x1, y1, x2, y2, color, w = 3) {
  const a = Math.atan2(y2 - y1, x2 - x1); const h = 11;
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 2) return '';
  const hx = x2 - h * Math.cos(a), hy = y2 - h * Math.sin(a);
  return line(x1, y1, hx, hy, color, w) + `<path d="M${x2.toFixed(1)},${y2.toFixed(1)} L${(hx + 5 * Math.sin(a)).toFixed(1)},${(hy - 5 * Math.cos(a)).toFixed(1)} L${(hx - 5 * Math.sin(a)).toFixed(1)},${(hy + 5 * Math.cos(a)).toFixed(1)} Z" fill="${color}"/>`;
}
function svg(w, h, body, label) {
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(plain(label))}">${body}</svg>`;
}
function figure(title, content, cls = '') {
  return `<figure class="fig ${cls}"><figcaption>${title}</figcaption>${content}</figure>`;
}

/** Tidsdiagram. series: [{fn, color, width, dash, label}], x i ms. */
function timePlot({ w = 640, h = 300, t0 = 0, t1, ymax, yTick, series, yLabel = 'V', showScale = true, showTicks = true, extra = () => '', label, xLabelUnit = 'ms' }) {
  const m = { l: 56, r: 18, t: 18, b: 38 };
  const X = (t) => m.l + ((t - t0) / (t1 - t0)) * (w - m.l - m.r);
  const Y = (v) => m.t + (1 - (v + ymax) / (2 * ymax)) * (h - m.t - m.b);
  let b = `<rect x="${m.l}" y="${m.t}" width="${w - m.l - m.r}" height="${h - m.t - m.b}" fill="#fff"/>`;
  const ticks = niceTicks(t0, t1, 6);
  for (const t of ticks) b += line(X(t), m.t, X(t), h - m.b, C.grid, 1) + (showTicks ? txt(X(t), h - m.b + 16, fmt(t, 3), { color: C.muted, size: 12, anchor: 'middle' }) : '');
  b += txt(w - m.r, h - 8, `t (${xLabelUnit})`, { color: C.muted, size: 12, anchor: 'end' });
  if (showScale) {
    const yt = yTick ?? ymax / 1.25;
    for (const v of [-yt, 0, yt]) b += line(m.l - 4, Y(v), m.l, Y(v), '#9fb2c1', 1.5) + txt(m.l - 8, Y(v), fmt(v, 3), { color: C.muted, size: 12, anchor: 'end' });
    b += txt(12, m.t + 4, yLabel, { color: C.muted, size: 12 });
  }
  b += line(m.l, Y(0), w - m.r, Y(0), '#9fb2c1', 1.5) + line(m.l, m.t, m.l, h - m.b, '#9fb2c1', 1.5);
  for (const s of series) {
    const n = 400; let d = '';
    for (let k = 0; k <= n; k++) {
      const t = t0 + ((t1 - t0) * k) / n;
      d += `${k ? 'L' : 'M'}${X(t).toFixed(1)},${Y(Math.max(-ymax, Math.min(ymax, s.fn(t)))).toFixed(1)}`;
    }
    if (s.fill) b += `<path d="${d} L${X(t1)},${Y(0)} L${X(t0)},${Y(0)} Z" fill="${s.fill}" opacity=".16"/>`;
    b += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2.6}"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} stroke-linejoin="round"/>`;
  }
  b += extra({ X, Y, m, w, h });
  return svg(w, h, b, label);
}
function niceTicks(a, b, n) {
  const span = b - a; const raw = span / n; const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * p).find((k) => k >= raw) || raw;
  const out = []; for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(Number(v.toFixed(10)));
  return out;
}
function legend(items) {
  return `<ul class="legend">${items.map(([c, t, dash]) => `<li><i style="background:${dash ? 'none' : c};border-top:${dash ? `3px dashed ${c}` : 'none'}"></i>${t}</li>`).join('')}</ul>`;
}

// ---------- flikar ----------
const masked = (key) => Boolean(state.challenge?.mask.includes(key));
const show = (key, v, unit, digits = 3) => (masked(key) ? '?' : `${state.tab === 'sinus' && ['peak','pp','rms','T'].includes(key) ? v2(v) : fmt(v, digits)} ${unit}`.trim());

function renderSinus(s, r) {
  const W = windowMs(s);
  const t = Math.min(s.t, W);
  const peak = r.peak;
  const ymax = peak * 1.3;
  const fA = (ms) => instant(s, ms / 1000);
  const fB = (ms) => instant(s, ms / 1000, s.dt / 1000);
  const series = [{ fn: fA, color: C.blue }];
  if (s.showB) series.push({ fn: fB, color: C.orange });
  const hideScale = masked('scale');
  const extra = ({ X, Y, m, w }) => {
    let b = line(m.l, Y(s.urms), w - m.r, Y(s.urms), C.green, 2, '7 6');
    b += txt(w - m.r - 4, Y(s.urms) - 11, hideScale ? 'U (RMS)' : `U = ${fmt(s.urms)} V RMS`, { color: C.green, size: 13, anchor: 'end' });
    // period
    const T = 1000 / s.f;
    const tp = s.shape === 'sinus' || s.shape === 'triangel' ? T / 4 : T / 8;
    if (tp + T <= W) {
      const yb = Y(peak) - 16;
      b += line(X(tp), Y(peak), X(tp), yb, C.muted, 1, '3 3') + line(X(tp + T), Y(peak), X(tp + T), yb, C.muted, 1, '3 3');
      b += arrow(X(tp + T / 2), yb, X(tp), yb, C.ink, 1.6) + arrow(X(tp + T / 2), yb, X(tp + T), yb, C.ink, 1.6);
      b += txt(X(tp + T / 2), yb - 10, masked('T') ? 'T = ?' : `T = ${fmt(T)} ms`, { size: 13, anchor: 'middle' });
    }
    // markör
    const u = fA(t);
    b += line(X(t), m.t, X(t), Y(0) + (u > 0 ? 0 : 0), C.red, 1.4, '4 4');
    b += `<circle cx="${X(t)}" cy="${Y(u)}" r="6" fill="${C.red}"/>`;
    const right = X(t) < (w * 0.7);
    b += txt(X(t) + (right ? 12 : -12), Y(u) + (u >= 0 ? 20 : -18), masked('ut') ? `u(${fmt(t)} ms) = ?` : `u = ${fmt(u)} V`, { color: C.red, size: 13, anchor: right ? 'start' : 'end', weight: 700 });
    if (s.showB) {
      const t1 = tp, t2 = tp + s.dt;
      if (t2 >= 0 && t2 <= W) {
        const yb = Y(-peak) + 18;
        b += arrow(X(t1), yb, X(t2), yb, C.orange, 1.6) + txt((X(t1) + X(t2)) / 2, yb + 13, `Δt = ${fmt(s.dt)} ms`, { color: C.orange, size: 12, anchor: 'middle' });
      }
    }
    return b;
  };
  const plot = timePlot({ t1: W, ymax, yTick: peak, series, showScale: !hideScale, showTicks: !masked('ticks'), extra, label: `Tidsdiagram för ${SHAPES[s.shape].label.toLowerCase()} med effektivvärde ${fmt(s.urms)} volt och frekvens ${s.f} hertz` });
  const leg = legend([[C.blue, 'u(t)'], ...(s.showB ? [[C.orange, 'andra signalen']] : []), [C.green, 'effektivvärde', true], [C.red, 'vald tidpunkt']]);
  $('figures').innerHTML = figure('Spänning över tiden', plot + leg, 'wide');

  const items = [
    ['û', show('peak', r.peak, 'V'), 'toppvärde'],
    ['U_{pp}', show('pp', r.pp, 'V'), 'topp till topp'],
    ['U', `${fmt(r.rms)} V`, 'effektivvärde (RMS)'],
    ['U_{medel}', '0 V', 'medelvärde över en period'],
    ['Multimeter, true RMS', masked('rms') ? '?' : `${v2(r.trms)} V`, 'idealmodell; verkliga instrument har gränser'],
    ['Multimeter, medelvärdesvisande', masked('rms') ? '?' : `${v2(r.avg)} V`, 'kalibrerad för sinus: 1,111 · likriktat medelvärde'],
    ['T', show('T', r.T, 'ms'), 'periodtid'],
    ['f', `${fmt(s.f)} Hz`, 'frekvens'],
    [`u(${fmt(t)} ms)`, show('ut', r.ut, 'V'), 'momentanvärde'],
  ];
  if (s.showB) items.push(['φ', masked('phi') ? '?' : `${fmt(r.phi, 3)}°`, 'fasförskjutning; positiv: signal 2 släpar']);
  readoutList(items);
  const factor = { sinus: 'û/√2', fyrkant: 'û', triangel: 'û/√3' }[s.shape];
  $('principle').innerHTML = `För ${SHAPES[s.shape].label.toLowerCase()} gäller U = ${factor}. Medelvärdet är noll eftersom positiv och negativ halvperiod tar ut varandra, men effektivvärdet värmer en resistor lika mycket som en likspänning med samma värde.`;
}

function renderImpedans(s, r) {
  const hasL = s.kind.includes('L'), hasC = s.kind.includes('C');
  const hideVals = masked('phasorValues');
  // kretsschema
  const parts = [['R', 'R', `${fmt(s.R)} Ω`]];
  if (hasL) parts.push(['L', 'X_{L}', masked('XL') ? '?' : `${fmt(r.XL)} Ω`]);
  if (hasC) parts.push(['C', 'X_{C}', masked('XC') ? '?' : `${fmt(r.XC)} Ω`]);
  let cb = line(70, 60, 390, 60, C.ink, 2.5) + line(390, 60, 390, 190, C.ink, 2.5) + line(390, 190, 70, 190, C.ink, 2.5) + line(70, 190, 70, 60, C.ink, 2.5);
  cb += `<circle cx="70" cy="125" r="24" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/><path d="M56,125 q7,-14 14,0 t14,0" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
  cb += txt(38, 125, `${fmt(s.U)} V`, { anchor: 'end', size: 14 }) + txt(38, 143, `${fmt(s.f)} Hz`, { anchor: 'end', size: 12, color: C.muted });
  parts.forEach(([k, name, val], i) => {
    const x = 70 + (320 * (i + 1)) / (parts.length + 1);
    if (k === 'R') cb += `<rect x="${x - 26}" y="51" width="52" height="18" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/>`;
    if (k === 'L') { cb += `<rect x="${x - 30}" y="54" width="60" height="10" fill="#fff" stroke="none"/>`; for (let j = 0; j < 4; j++) cb += `<path d="M${x - 30 + j * 15},60 a7.5,7.5 0 0 1 15,0" fill="none" stroke="${C.ink}" stroke-width="2.5"/>`; }
    if (k === 'C') cb += `<rect x="${x - 6}" y="44" width="12" height="32" fill="#fff"/>` + line(x - 5, 44, x - 5, 76, C.ink, 3) + line(x + 5, 44, x + 5, 76, C.ink, 3);
    cb += txt(x, 14, name, { anchor: 'middle', size: 13, weight: 700 }) + txt(x, 31, val, { anchor: 'middle', size: 13 });
  });
  cb += arrow(390, 100, 390, 150, C.orange, 2.5) + txt(380, 125, masked('I') ? 'I = ?' : `I = ${fmt(r.I)} A`, { anchor: 'end', color: C.orange, size: 14, weight: 700 });
  const circuit = svg(500, 215, `<g transform="translate(40,0)">${cb}</g>`, `Seriekrets ${s.kind} matad med ${fmt(s.U)} volt`);

  // visardiagram
  const vmax = Math.max(s.U, r.UR, r.UL, r.UC, 1);
  const sc = 150 / vmax; const ox = 60, oy = 170;
  let pb = line(ox - 10, oy, 400, oy, C.grid, 1) + line(ox, 20, ox, 320, C.grid, 1);
  const x1 = ox + r.UR * sc; const y2 = oy - (r.UL - r.UC) * sc;
  pb += arrow(ox, oy, x1, oy, C.slate);
  pb += txt((ox + x1) / 2, oy + 18, hideVals || masked('UR') ? 'U_{R}' : `U_{R} = ${fmt(r.UR)} V`, { color: C.slate, size: 13, anchor: 'middle' });
  if (hasL) { pb += arrow(x1, oy, x1, oy - r.UL * sc, C.green); pb += txt(x1 + (hasC ? 30 : 8), oy - r.UL * sc * 0.78, hideVals || masked('UL') ? 'U_{L}' : `U_{L} = ${fmt(r.UL)} V`, { color: C.green, size: 13 }); }
  if (hasC) {
    const xs = hasL ? x1 + 16 : x1; const ys = hasL ? oy - r.UL * sc : oy;
    pb += arrow(xs, ys, xs, ys + r.UC * sc, C.purple);
    pb += txt(xs + 8, ys + r.UC * sc * 0.78, hideVals ? 'U_{C}' : `U_{C} = ${fmt(r.UC)} V`, { color: C.purple, size: 13 });
  }
  pb += arrow(ox, oy, x1, y2, C.blue, 3.4);
  pb += txt(ox + (x1 - ox) * 0.45 - 8, oy + (y2 - oy) * 0.45 - 8, `U = ${fmt(s.U)} V`, { color: C.blue, size: 13, anchor: 'end', weight: 700 });
  if (Math.abs(r.phi) > 1) {
    const rr = 44; const a = (-r.phi * Math.PI) / 180;
    pb += `<path d="M${ox + rr},${oy} A${rr},${rr} 0 0 ${r.phi > 0 ? 0 : 1} ${(ox + rr * Math.cos(a)).toFixed(1)},${(oy + rr * Math.sin(a)).toFixed(1)}" fill="none" stroke="${C.ink}" stroke-width="1.5"/>`;
    pb += txt(ox + rr + 8, oy + (r.phi > 0 ? -12 : 14), masked('phi') ? 'φ = ?' : `φ = ${fmt(r.phi)}°`, { size: 13 });
  }
  pb += arrow(ox, oy + 42, ox + 60, oy + 42, C.muted, 2) + txt(ox + 68, oy + 42, 'I (referens)', { color: C.muted, size: 12 });
  const phasor = svg(420, 340, pb, `Visardiagram: fasvinkel ${masked('phi') ? 'dold' : fmt(r.phi) + ' grader'}`);

  // tidsdiagram u och i
  const T = 1000 / s.f; const imax = r.I * Math.SQRT2; const umax = s.U * Math.SQRT2;
  const k = imax > 0 ? (umax * 0.7) / imax : 1;
  const plot = timePlot({
    w: 640, h: 250, t1: 2 * T, ymax: umax * 1.25, yTick: umax, showScale: true, xLabelUnit: 'ms',
    series: [
      { fn: (ms) => umax * Math.sin((2 * Math.PI * ms) / T), color: C.blue },
      { fn: (ms) => k * imax * Math.sin((2 * Math.PI * ms) / T - (r.phi * Math.PI) / 180), color: C.orange },
    ],
    label: 'Spänning och ström över tiden',
  });
  const plotFig = figure('u och i över tiden', plot + legend([[C.blue, 'u(t)'], [C.orange, 'i(t), skalad för jämförelse']]) + (masked('character') ? '' : `<p class="fig-note">${r.character === 'induktiv' ? 'Strömmen släpar efter spänningen.' : r.character === 'kapacitiv' ? 'Strömmen leder före spänningen.' : 'Strömmen är i fas med spänningen (resonans eller ren resistans).'}</p>`), 'wide');

  // I som funktion av f
  let freqFig = '';
  if (hasL || hasC) {
    const fmax = Math.max(100, (r.f0 || s.f) * 2.2, s.f * 1.3);
    const Iat = (f) => seriesCircuit({ kind: s.kind, U: s.U, f, R: s.R, L: s.L / 1000, C: s.C / 1e6 }).I;
    let peakI = 0; for (let j = 1; j <= 200; j++) peakI = Math.max(peakI, Iat((fmax * j) / 200));
    const w = 420, h = 220, m = { l: 48, r: 14, t: 16, b: 36 };
    const X = (f) => m.l + (f / fmax) * (w - m.l - m.r); const Y = (i) => h - m.b - (i / (peakI * 1.15)) * (h - m.t - m.b);
    let fb = '';
    for (const f of niceTicks(0, fmax, 5)) fb += line(X(f), m.t, X(f), h - m.b, C.grid, 1) + (masked('freqTicks') ? '' : txt(X(f), h - m.b + 15, fmt(f, 3), { size: 11, color: C.muted, anchor: 'middle' }));
    fb += line(m.l, h - m.b, w - m.r, h - m.b, '#9fb2c1', 1.5) + line(m.l, m.t, m.l, h - m.b, '#9fb2c1', 1.5);
    let d = ''; for (let j = 1; j <= 240; j++) { const f = (fmax * j) / 240; d += `${j > 1 ? 'L' : 'M'}${X(f).toFixed(1)},${Y(Iat(f)).toFixed(1)}`; }
    fb += `<path d="${d}" fill="none" stroke="${C.orange}" stroke-width="2.6"/>`;
    if (r.f0 && !masked('f0')) fb += line(X(r.f0), m.t, X(r.f0), h - m.b, C.red, 1.4, '5 4') + txt(X(r.f0) + 6, m.t + 8, `f_{0} = ${fmt(r.f0)} Hz`, { color: C.red, size: 12 });
    fb += `<circle cx="${X(s.f)}" cy="${Y(r.I)}" r="6" fill="${C.blue}"/>` + txt(w - m.r, h - 6, 'f (Hz)', { size: 12, color: C.muted, anchor: 'end' }) + txt(8, m.t + 2, 'I', { size: 12, color: C.muted });
    freqFig = figure('Strömmen när frekvensen ändras', svg(w, h, fb, 'Ström som funktion av frekvens') + '<p class="fig-note">Punkten visar nuvarande frekvens.</p>');
  }
  $('figures').innerHTML = figure('Krets', circuit) + figure('Visardiagram (spänningar)', phasor) + plotFig + freqFig;

  const phiTxt = masked('phi') ? '?' : `${fmt(r.phi)}°`;
  const items = [];
  if (hasL) items.push(['X_{L}', show('XL', r.XL, 'Ω'), 'induktiv reaktans, 2πfL']);
  if (hasC) items.push(['X_{C}', show('XC', r.XC, 'Ω'), 'kapacitiv reaktans, 1/(2πfC)']);
  if (hasL || hasC) items.push(['X', show('X', r.X, 'Ω'), 'nettoreaktans X_{L} − X_{C}']);
  items.push(['|Z|', show('Z', r.Z, 'Ω'), 'impedansens belopp'], ['I', show('I', r.I, 'A'), 'ström (RMS)'], ['φ', phiTxt, masked('character') ? 'fasvinkel' : r.character === 'resistiv' ? 'i fas' : r.phi > 0 ? 'strömmen släpar' : 'strömmen leder']);
  items.push(['U_{R}', show('UR', r.UR, 'V'), 'över resistorn']);
  if (hasL) items.push(['U_{L}', show('UL', r.UL, 'V'), 'över spolen']);
  if (hasC) items.push(['U_{C}', show('UC', r.UC, 'V'), 'över kondensatorn']);
  if (r.f0) items.push(['f_{0}', show('f0', r.f0, 'Hz'), 'resonansfrekvens']);
  readoutList(items);
  const over = Math.max(r.UL, r.UC) > s.U * 1.001;
  $('principle').innerHTML = (over && !masked('phasorValues') ? '<strong>Obs:</strong> Spänningen över spolen eller kondensatorn är större än källspänningen. Nära resonans kan komponentspänningar bli farligt höga. Samma fenomen gör kondensatorbatterier tillsammans med övertoner från frekvensomriktare till en risk ombord. ' : '') + (hasL && hasC
    ? 'Delspänningarna är visare. U_{L} och U_{C} pekar åt motsatta håll och tar delvis ut varandra, därför kan de var för sig bli större än källspänningen. Vid resonans är X_{L} = X_{C} och bara R begränsar strömmen.'
    : 'Resistorns spänning ligger i fas med strömmen och den reaktiva spänningen 90° från den. Därför adderas beloppen med Pythagoras, inte direkt: |Z| = √(R² + X²).');
}

function renderEffekt(s, r) {
  const hideTri = masked('triangleValues');
  const Pk = s.P; const Qk = r.Q; const Q2 = r.Q2;
  const qTop = Math.max(Qk, Q2, 0), qBot = Math.min(Qk, Q2, 0);
  const vmax = Math.max(Pk, qTop - qBot, 1);
  const w = 500, h = 330; const sc = 240 / vmax; const ox = 50; const oy = 40 + qTop * sc;
  const up = (q) => oy - q * sc;
  let tb = '';
  tb += arrow(ox, oy, ox + Pk * sc, oy, C.blue, 3.4);
  tb += arrow(ox + Pk * sc, oy, ox + Pk * sc, up(Qk), C.green, 3.4);
  tb += arrow(ox, oy, ox + Pk * sc, up(Qk), C.ink, 3.4);
  tb += txt(ox + (Pk * sc) / 2, oy + (Qk >= 0 && Q2 >= 0 ? 20 : Qk < 0 ? -16 : -12), `P = ${fmt(Pk)} W`, { color: C.blue, size: 13, anchor: 'middle' });
  tb += txt(ox + Pk * sc + 10, (oy + up(Qk)) / 2, hideTri || masked('Q') ? 'Q = ?' : `Q = ${fmt(Qk)} var`, { color: C.green, size: 13 });
  tb += txt(ox + (Pk * sc) / 2 - 12, (oy + up(Qk)) / 2 - 8, hideTri || masked('S') ? 'S = ?' : `S = ${fmt(r.S)} VA`, { color: C.ink, size: 13, anchor: 'end' });
  if (s.Qc > 0 && s.character === 'induktiv') {
    if (Q2 < 0) tb += line(ox - 10, oy, ox + Pk * sc + 20, oy, C.grid, 1);
    tb += arrow(ox + Pk * sc + 135, up(Qk), ox + Pk * sc + 135, up(Q2), C.orange, 3);
    tb += txt(ox + Pk * sc + 145, (up(Qk) + up(Q2)) / 2, `Q_{C} = ${fmt(s.Qc)} var`, { color: C.orange, size: 13 });
    tb += `<line x1="${ox}" y1="${oy}" x2="${(ox + Pk * sc).toFixed(1)}" y2="${up(Q2).toFixed(1)}" stroke="${C.ink}" stroke-width="2.4" stroke-dasharray="7 6"/>`;
    tb += txt(ox + Pk * sc * 0.6, up(Q2 * 0.6) + (Q2 >= 0 ? 16 : 18), hideTri ? 'S efter' : `S efter = ${fmt(r.S2)} VA`, { color: C.ink, size: 12 });
  }
  const tri = svg(w, h, tb, 'Effekttriangel');

  // staplar
  const bw = 420, bh = 210; const Imax = Math.max(r.I, r.I2, 0.001); const Lmax = Math.max(r.loss, r.loss2, 0.001);
  let bb = '';
  const bar = (x, v, max, color, lab, val) => {
    const hh = (v / max) * 112; return `<rect x="${x}" y="${170 - hh}" width="54" height="${hh}" fill="${color}" rx="3"/>` + txt(x + 27, 188, lab, { size: 12, anchor: 'middle', color: C.muted }) + txt(x + 27, 160 - hh, val, { size: 12, anchor: 'middle' });
  };
  bb += txt(20, 18, 'Ström', { size: 13, weight: 700 }) + txt(230, 18, 'Kabelförlust I²R', { size: 13, weight: 700 });
  bb += bar(30, r.I, Imax, C.blue, 'före', masked('I') ? '?' : `${fmt(r.I)} A`) + bar(100, r.I2, Imax, '#6f9bc6', 'efter', masked('I2') ? '?' : `${fmt(r.I2)} A`);
  bb += bar(240, r.loss, Lmax, C.red, 'före', masked('loss') ? '?' : `${fmt(r.loss)} W`) + bar(310, r.loss2, Lmax, '#d9868d', 'efter', masked('loss2') ? '?' : `${fmt(r.loss2)} W`);
  const bars = svg(bw, bh, bb, 'Ström och kabelförlust före och efter kompensering');

  // u, i, p
  const fN = Number(s.f) || 50; const T = 1000 / fN; const U = s.U; const I = r.I; const phi = r.phi;
  const umax = U * Math.SQRT2; const pmax = 2 * U * I;
  const kI = (umax * 0.6) / (I * Math.SQRT2 || 1); const kP = (umax * 0.9) / pmax;
  const plot = timePlot({
    w: 640, h: 260, t1: 2 * T, ymax: umax * 1.2, showScale: false,
    series: [
      { fn: (ms) => kP * instantPower({ U, I, f: fN, phiDeg: phi }, ms / 1000).p, color: C.red, width: 2, dash: '6 4', fill: C.red },
      { fn: (ms) => instantPower({ U, I, f: fN, phiDeg: phi }, ms / 1000).u, color: C.blue },
      { fn: (ms) => kI * instantPower({ U, I, f: fN, phiDeg: phi }, ms / 1000).i, color: C.orange },
    ],
    extra: ({ X, Y, m, w: ww }) => line(m.l, Y(kP * s.P), ww - m.r, Y(kP * s.P), C.red, 2) + txt(m.l + 6, Y(kP * s.P) - 10, 'medeleffekt P', { color: C.red, size: 12, weight: 700 }),
    label: 'Momentan spänning, ström och effekt',
  });
  $('figures').innerHTML = figure('Effekttriangel', tri) + figure('Före och efter kompensering', bars) + figure(`Momentan effekt p = u · i (utan kompensering, ${fN} Hz)`, plot + legend([[C.blue, 'u'], [C.orange, 'i (skalad)'], [C.red, 'p (skalad)', true]]), 'wide');

  readoutList([
    ['S', show('S', r.S, 'VA'), 'skenbar effekt, P/PF'],
    ['Q', show('Q', r.Q, 'var'), 'reaktiv effekt'],
    ['φ', `${fmt(r.phi)}°`, 'fasvinkel, cos φ = PF'],
    ['I', show('I', r.I, 'A'), 'matningsström'],
    ['Q_{C} för PF 1', s.character === 'kapacitiv' ? '–' : show('QcFull', r.QcFull, 'var'), s.character === 'kapacitiv' ? 'kondensator hjälper inte vid kapacitiv last' : 'kondensator som krävs'],
    ['PF efter', `${fmt(r.PF2, 3)}${r.character2 === 'resistiv' ? '' : r.character2 === 'kapacitiv' ? ' kap.' : ' ind.'}`, r.character2 === 'kapacitiv' && s.character === 'induktiv' ? 'överkompenserat: matningen blir kapacitiv' : 'med vald Q_{C}'],
    ['I efter', show('I2', r.I2, 'A'), 'med vald Q_{C}'],
    ['Förlust', masked('loss') || masked('loss2') ? '?' : `${fmt(r.loss)} → ${fmt(r.loss2)} W`, 'i kabeln, I²R'],
  ]);
  const overcomp = s.character === 'induktiv' && r.character2 === 'kapacitiv';
  $('principle').innerHTML = (overcomp ? '<strong>Överkompenserat:</strong> matningen blir kapacitiv. Det undviks ombord, där generatorns spänningsregulator och skydd är gjorda för induktiv last. ' : '') + 'P utför arbete. Q pendlar mellan källa och last och ger medeleffekt noll, men kräver ändå ström i kabeln. En kondensator levererar reaktiv effekt lokalt, så matningens S och I minskar medan lastens P är oförändrad. Ombord används kondensatorbatterier sällan: generatorn är märkt i kVA vid cos φ 0,8 och levererar Q själv. Låg PF syns som hög ström i generator och brytare fast kW-lasten är låg.';
}

function readoutList(items) {
  $('readouts').innerHTML = items.map(([k, v, d]) => `<div class="${v === '?' ? 'hidden-value' : ''}"><dt>${subHtml(k)}</dt><dd><strong>${escHtml(v)}</strong><span>${subHtml(d)}</span></dd></div>`).join('');
}

function render() {
  const s = state.values[state.tab];
  publishEquipment({tab:state.tab,values:s,locked:Boolean(state.challenge),editable:true});
  const r = readouts(state.tab, s);
  ({ sinus: renderSinus, impedans: renderImpedans, effekt: renderEffekt })[state.tab](s, r);
  const pr = $('principle'); pr.innerHTML = pr.innerHTML.replace(/[ᴸᶜᴿꜰ]/g, (ch) => `<sub>${SUBS[ch]}</sub>`).replace(/_\{([^{}]*)\}/g, '<sub>$1</sub>');
}

export function refreshEquipment(){publishEquipment({tab:state.tab,values:state.values[state.tab],locked:Boolean(state.challenge),editable:true});}
setEquipmentControl((key,value)=>{
 if(state.challenge||!Number.isFinite(value))return;
 const c=CONTROLS[state.tab].find(c=>c.key===key);if(!c)return;
 if(c.type==='select'&&!c.options.some(([v])=>Number(v)===value))return;
 const el=$(`ctl-${key}-n`)||$(`ctl-${key}`);if(!el)return;el.value=String(value);onControl(c,el);renderControls();
});

// ---------- uppgifter ----------
function renderChallengeSelect() {
  const sel = $('challenge-select');
  const list = CHALLENGES.filter((c) => c.tab === state.tab);
  sel.innerHTML = '<option value="">Välj uppgift …</option>' + list.map((c) => `<option value="${c.id}"${state.challenge?.id === c.id ? ' selected' : ''}>${state.solved.has(c.id) ? '✓ ' : ''}${c.title}</option>`).join('');
  const done = CHALLENGES.filter((c) => state.solved.has(c.id)).length;
  $('progress').textContent = `${done} av ${CHALLENGES.length} klara`;
}

function startChallenge(id) {
  const c = CHALLENGES.find((x) => x.id === id);
  if (!c) return leaveChallenge();
  state.challenge = c; state.attempts = 0;
  if (c.tab !== state.tab) setTab(c.tab, false);
  state.values[c.tab] = clone(c.setup);
  $('challenge-body').hidden = false; $('challenge-intro').hidden = true;
  $('challenge-deck').innerHTML = `<a href="../vecka-40/aktuell/Genomgang.html?del=${c.tab}&amp;avsnitt=${c.theory}" target="_blank" rel="noopener">${escHtml(c.deck)} · öppna stöd</a>`;
  $('challenge-task').innerHTML = subHtml(c.task);
  $('answer-label').innerHTML = `${subHtml(c.ask.label)} =`;
  $('answer-unit').textContent = c.ask.unit;
  $('answer').value = ''; $('hint-text').innerHTML = subHtml(c.hint); $('hint').open = false;
  $('feedback').className = 'feedback'; $('feedback').textContent = '';
  $('show-answer').hidden = true;
  renderControls(); renderChallengeSelect(); render(); updateUrl();
}

function leaveChallenge() {
  state.challenge = null;
  $('challenge-body').hidden = true; $('challenge-intro').hidden = false;
  renderControls(); renderChallengeSelect(); render(); updateUrl();
}

function finishChallenge(correct, message) {
  const c = state.challenge;
  const e = expected(c);
  if (correct) { state.solved.add(c.id); saveSolved(); }
  state.challenge = null;
  const fb = $('feedback');
  fb.className = `feedback ${correct ? 'ok' : 'info'}`;
  fb.innerHTML = `<strong>${message}</strong> ${subHtml(c.ask.label)} = ${fmt(e, 4)} ${c.ask.unit}. ${subHtml(c.after || 'Reglagen är nu upplåsta. Ändra ett värde och se vad som händer.')}`;
  $('show-answer').hidden = true;
  renderControls(); renderChallengeSelect(); render();
  // behåll uppgiftstexten synlig efter lösningen
  $('challenge-body').hidden = false; $('challenge-intro').hidden = true;
}

function checkAnswer(ev) {
  ev.preventDefault();
  const c = state.challenge; if (!c) return;
  const raw = parseAnswer($('answer').value);
  const fb = $('feedback');
  if (!Number.isFinite(raw)) { fb.className = 'feedback warn'; fb.textContent = 'Skriv ett tal, till exempel 16,7.'; return; }
  const ans = c.ask.absolute ? Math.abs(raw) : raw;
  const e = expected(c);
  if (isClose(ans, e, c.ask)) return finishChallenge(true, 'Rätt!');
  state.attempts += 1;
  fb.className = 'feedback warn';
  let msg = 'Inte ännu. ';
  const typical = (typeof c.mistakes === 'function' ? c.mistakes() : c.mistakes || []).find((m) => isClose(ans, c.ask.absolute ? Math.abs(m.v) : m.v, { rel: 0.02, abs: c.ask.abs || 0 }));
  if (typical) msg += `${typical.msg} `;
  else if (isClose(ans * 1000, e, c.ask) || isClose(ans / 1000, e, c.ask)) msg += 'Talet stämmer men enheten är fel med en faktor 1 000. ';
  else if (!c.ask.absolute && isClose(-ans, e, c.ask)) msg += 'Beloppet stämmer, men tecknet är fel. ';
  else if (isClose(ans * Math.SQRT2, e, c.ask) || isClose(ans / Math.SQRT2, e, c.ask)) msg += 'Du är en faktor √2 fel. Blanda inte ihop topp- och effektivvärde. ';
  else msg += 'Kontrollera formeln och enheterna. ';
  if (state.attempts >= 2) { $('hint').open = true; $('show-answer').hidden = false; }
  fb.innerHTML = subHtml(msg);
}

// ---------- flikar och URL ----------
function setTab(tab, doRender = true) {
  state.tab = tab;
  document.querySelectorAll('[role=tab]').forEach((b) => {
    const on = b.dataset.tab === tab; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
  });
  $('lab').setAttribute('aria-labelledby', `tab-${tab}`);
  if (doRender) {
    state.challenge = null; state.attempts = 0; $('challenge-body').hidden = true; $('challenge-intro').hidden = false; $('feedback').textContent = ''; $('answer').value = '';
    renderControls(); renderChallengeSelect(); render(); updateUrl();
  }
}
function updateUrl() {
  const p = new URLSearchParams(location.search); p.set('flik', state.tab); p.delete('del'); p.delete('steg'); p.delete('uppgift'); if (state.challenge) p.set('uppgift', state.challenge.id);
  try { history.replaceState(null, '', `?${p}`); } catch { /* fil-URL */ }
}

document.querySelectorAll('[role=tab]').forEach((b) => {
  b.addEventListener('click', () => setTab(b.dataset.tab));
  b.addEventListener('keydown', (e) => {
    const tabs = [...document.querySelectorAll('[role=tab]')]; const i = tabs.indexOf(b);
    const j = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
    if (j >= 0) { e.preventDefault(); tabs[j].focus(); setTab(tabs[j].dataset.tab); }
  });
});
$('challenge-select').addEventListener('change', (e) => (e.target.value ? startChallenge(e.target.value) : leaveChallenge()));
$('answer-form').addEventListener('submit', checkAnswer);
$('show-answer').addEventListener('click', () => finishChallenge(false, 'Facit:'));
$('leave').addEventListener('click', leaveChallenge);
$('reset').addEventListener('click', () => { if (state.challenge) return; state.values[state.tab] = clone(DEFAULTS[state.tab]); renderControls(); render(); });

const params = new URLSearchParams(location.search);
const startTab = params.get('flik');
setTab(DEFAULTS[startTab] ? startTab : 'sinus');
if (params.get('uppgift')) startChallenge(params.get('uppgift'));

// Labbprotokoll för Station B, AC-delen
function rigAC(shape, rig = RIG_AC) {
  leaveChallenge();
  setTab('sinus', false);
  state.values.sinus = { ...clone(DEFAULTS.sinus), ...rig, shape, t: 5, window: 'auto' };
  renderControls(); renderChallengeSelect(); render(); updateUrl();
}
mountProtocol(document.getElementById('labbprotokoll'), { ...STATION_B_AC_PROTOKOLL,
  presets: [
    { label: 'Kalibrator 10,00 V sinus', apply: () => rigAC('sinus', CAL_AC), done: 'Kalibratorn är ansluten: 10,00 V sinus, 50 Hz. Kontrollera båda mätarna.' },
    { label: 'Stationens AC-källa: sinus', apply: () => rigAC('sinus'), done: 'AC-källan är inställd: sinus, 50 Hz.' },
    { label: 'Samma källa: fyrkant', apply: () => rigAC('fyrkant'), done: 'Kurvformen är fyrkant med samma effektivvärde.' },
    { label: 'Samma källa: triangel', apply: () => rigAC('triangel'), done: 'Kurvformen är triangel med samma effektivvärde.' },
  ],
  snapshot(plan) {
    if (state.tab !== 'sinus') return { error: 'Byt till fliken ”Sinus och effektivvärde” för att mäta på AC-källan.' };
    const s = state.values.sinus, r = readouts('sinus', s), c = state.challenge;
    if (c && (c.mask || []).some((k) => ['peak', 'pp', 'T', 'rms'].includes(k))) return { error: 'Lös uppgiften först. Mätvärdena är dolda medan du räknar.' };
    const n = plan?.need;
    if (n && (s.shape !== n.shape || Math.abs(s.urms - n.urms) > 1e-9 || Math.abs(s.f - 50) > 1e-9)) return { error: `Mätning ${STATION_B_AC_PROTOKOLL.rows.indexOf(plan) + 1} gäller ${n.urms === CAL_AC.urms ? 'kalibratorn' : 'stationens källa'} med kurvformen ${SHAPES[n.shape].label.toLowerCase()}. Ställ in den med knapparna överst i protokollet.` };
    const q = plan?.q || 'trms';
    const inst = { trms: 'true RMS-multimeter', avg: 'medelvärdesvisande multimeter', peak: 'oscilloskop', T: 'oscilloskop', pp: 'oscilloskop' }[q];
    const val = { trms: `${v2(r.trms)} V`, avg: `${v2(r.avg)} V`, peak: `${v2(r.peak)} V`, pp: `${v2(r.pp)} V`, T: `${v2(r.T)} ms` }[q];
    return { punkter: 'källans mätuttag', drift: `${SHAPES[s.shape].label}, ${fmt(s.f)} Hz, ${inst}`, varde: val };
  } });

