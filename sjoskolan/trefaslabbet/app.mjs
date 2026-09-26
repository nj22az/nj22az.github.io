// Trefaslabbet · interaktion och ritning
import { fmt, parseAnswer, isClose, C as Cx, PHASE } from './model.mjs';
import { markHtml } from '../gemensamt/markering.mjs?v=20260928';
import { DEFAULTS, CHALLENGES, PLATES, readouts, expected } from './lessons.mjs';
import { mountProtocol } from '../gemensamt/labbprotokoll.mjs?v=20260926';
import { STATION_B_3F_PROTOKOLL, RIG_3F } from './stationB-protokoll.mjs?v=20260926';

const $ = (id) => document.getElementById(id);
const K = { blue: '#064f91', orange: '#c8641e', green: '#0e7c5a', red: '#b8323c', ink: '#163248', muted: '#6b7f90', grid: '#dfe7ee', slate: '#4a6378' };
const PH = [K.blue, K.orange, K.green];
const STORE = 'sjoskolan-trefas-v1';
const clone = (o) => JSON.parse(JSON.stringify(o));
const SUBS = { 'ᴸ': 'L', 'ᶜ': 'C', 'ᴿ': 'R', 'ꜰ': 'F', 'ɴ': 'N' };
const SUBRE = /[ᴸᶜᴿꜰɴ]/g;
const plain = (t) => String(t).replace(SUBRE, (ch) => SUBS[ch]);
const escHtml = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const subHtml = (t) => markHtml(String(t).replace(SUBRE, (ch) => `_{${SUBS[ch]}}`));

const state = { tab: 'visare', values: clone(DEFAULTS), challenge: null, attempts: 0, solved: loadSolved() };
function loadSolved() { try { return new Set(JSON.parse(localStorage.getItem(STORE) || '[]')); } catch { return new Set(); } }
function saveSolved() { try { localStorage.setItem(STORE, JSON.stringify([...state.solved])); } catch { /* blockerad */ } }

const VOLT = [['12.2', '12,2 V (Station B-rigg)'], ['230', '230 V'], ['400', '400 V'], ['440', '440 V (vanligt ombord)'], ['690', '690 V (större fartyg)']];
const CONTROLS = {
  visare: [
    { key: 'UL', label: 'Linjespänning Uᴸ', type: 'select', num: true, options: VOLT },
    { key: 'f', label: 'Frekvens', type: 'select', num: true, options: [['60', '60 Hz'], ['50', '50 Hz']] },
    { key: 'I1', label: 'Ström i L1', unit: 'A', min: 0, max: 30, step: 0.5 },
    { key: 'I2', label: 'Ström i L2', unit: 'A', min: 0, max: 30, step: 0.5 },
    { key: 'I3', label: 'Ström i L3', unit: 'A', min: 0, max: 30, step: 0.5 },
    { key: 'phi', label: 'Fasförskjutning φ (släpande)', unit: '°', min: 0, max: 80, step: 1 },
  ],
  neutral: [
    { key: 'UL', label: 'Linjespänning Uᴸ', type: 'select', num: true, options: VOLT },
    { key: 'neutral', label: 'Neutralledaren är hel', type: 'check' },
    { key: 'on1', label: 'Last på L1 inkopplad', type: 'check' },
    { key: 'R1', label: 'Last på L1', unit: 'Ω', min: 5, max: 300, step: 1 },
    { key: 'on2', label: 'Last på L2 inkopplad', type: 'check' },
    { key: 'R2', label: 'Last på L2', unit: 'Ω', min: 5, max: 300, step: 1 },
    { key: 'on3', label: 'Last på L3 inkopplad', type: 'check' },
    { key: 'R3', label: 'Last på L3', unit: 'Ω', min: 5, max: 300, step: 1 },
  ],
  ydelta: [
    { key: 'UL', label: 'Linjespänning Uᴸ', type: 'select', num: true, options: VOLT },
    { key: 'conn', label: 'Koppling', type: 'select', options: [['Y', 'Y (stjärna)'], ['Δ', 'Δ (triangel)']] },
    { key: 'Z', label: 'Grenimpedans |Z|', unit: 'Ω', min: 2, max: 200, step: 0.5 },
    { key: 'pf', label: 'Effektfaktor cos φ', unit: '', min: 0.1, max: 1, step: 0.01 },
    { key: 'plate', label: 'Motorns märkning Δ/Y', type: 'select', options: Object.keys(PLATES).map((k) => [k, PLATES[k] ? `${k} V` : 'Ingen motor (resistiv last)']) },
  ],
};

function renderControls() {
  const form = $('controls'); const s = state.values[state.tab]; const locked = Boolean(state.challenge);
  form.innerHTML = '';
  for (const c of CONTROLS[state.tab]) {
    const id = `ctl-${c.key}`; const row = document.createElement('div'); row.className = `control control-${c.type || 'range'}`;
    if (c.type === 'select') row.innerHTML = `<label for="${id}">${subHtml(c.label)}</label><select id="${id}">${c.options.map(([v, l]) => `<option value="${v}"${String(s[c.key]) === v ? ' selected' : ''}>${escHtml(l)}</option>`).join('')}</select>`;
    else if (c.type === 'check') row.innerHTML = `<label class="check"><input type="checkbox" id="${id}"${s[c.key] ? ' checked' : ''}> ${subHtml(c.label)}</label>`;
    else {
      row.innerHTML = `<div class="control-top"><label for="${id}">${subHtml(c.label)}</label><span class="num"><input type="number" id="${id}-n" aria-label="${plain(c.label)} som tal" min="${c.min}" max="${c.max}" step="${c.step}" value="${s[c.key]}"><span>${c.unit}</span></span></div>
        <input type="range" id="${id}" min="${c.min}" max="${c.max}" step="${c.step}" value="${s[c.key]}" aria-valuetext="${fmt(s[c.key])} ${c.unit}">`;
    }
    form.append(row);
    row.querySelectorAll('input,select').forEach((el) => {
      el.disabled = locked;
      el.addEventListener(el.type === 'range' || el.type === 'number' ? 'input' : 'change', () => onControl(c, el));
    });
  }
  $('lock-note').hidden = !locked;
}
function onControl(c, el) {
  const s = state.values[state.tab]; let v;
  if (c.type === 'check') v = el.checked;
  else if (c.type === 'select') v = c.num ? Number(el.value) : el.value;
  else {
    v = Number(el.value); if (!Number.isFinite(v)) return;
    v = Math.min(c.max, Math.max(c.min, v));
    const twin = el.type === 'range' ? $(`ctl-${c.key}-n`) : $(`ctl-${c.key}`);
    if (twin && document.activeElement !== twin) twin.value = v;
    $(`ctl-${c.key}`).setAttribute('aria-valuetext', `${fmt(v)} ${c.unit}`);
  }
  s[c.key] = v; render();
}

// ---------- SVG ----------
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function txt(x, y, t, { color = K.ink, size = 14, anchor = 'start', weight = 400 } = {}) {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-weight="${weight}" dominant-baseline="middle" paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round">${esc(t).replace(SUBRE, (ch) => `<tspan baseline-shift="sub" font-size="75%">${SUBS[ch]}</tspan>`)}</text>`;
}
function line(x1, y1, x2, y2, color, w = 2, dash = '') {
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`;
}
function arrow(x1, y1, x2, y2, color, w = 3) {
  const a = Math.atan2(y2 - y1, x2 - x1); const len = Math.hypot(x2 - x1, y2 - y1); if (len < 2) return '';
  const h = Math.min(11, len * 0.5); const hx = x2 - h * Math.cos(a), hy = y2 - h * Math.sin(a);
  return line(x1, y1, hx, hy, color, w) + `<path d="M${x2.toFixed(1)},${y2.toFixed(1)} L${(hx + 5 * Math.sin(a)).toFixed(1)},${(hy - 5 * Math.cos(a)).toFixed(1)} L${(hx - 5 * Math.sin(a)).toFixed(1)},${(hy + 5 * Math.cos(a)).toFixed(1)} Z" fill="${color}"/>`;
}
const svg = (w, h, body, label) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(plain(label))}">${body}</svg>`;
const figure = (title, content, cls = '') => `<figure class="fig ${cls}"><figcaption>${subHtml(title)}</figcaption>${content}</figure>`;
const legend = (items) => `<ul class="legend">${items.map(([c, t, dash]) => `<li><i style="background:${dash ? 'none' : c};border-top:${dash ? `3px dashed ${c}` : 'none'}"></i>${subHtml(t)}</li>`).join('')}</ul>`;
// visare: vinkel i grader, L1 ritas uppåt (90°) och L2/L3 medurs
const scr = (p, ox, oy, sc) => [ox + sc * p[1] * 0 + sc * Math.cos((Math.atan2(p[1], p[0]) + Math.PI / 2)) * Math.hypot(p[0], p[1]), oy - sc * Math.sin(Math.atan2(p[1], p[0]) + Math.PI / 2) * Math.hypot(p[0], p[1])];

const masked = (k) => Boolean(state.challenge?.mask.includes(k));
const show = (k, v, unit, d = 3) => (masked(k) ? '?' : `${fmt(v, d)} ${unit}`.trim());

function renderVisare(s, r) {
  // spänningsstjärna
  const W = 420, H = 330, ox = 210, oy = 175, sc = 120 / r.UF;
  let vb = '';
  const tips = PHASE.map((a) => scr(Cx.polar(r.UF, a), ox, oy, sc));
  tips.forEach((t, k) => { vb += arrow(ox, oy, t[0], t[1], PH[k], 3); vb += txt(t[0] + (t[0] - ox) * 0.12, t[1] + (t[1] - oy) * 0.12, `L${k + 1}`, { color: PH[k], size: 14, anchor: 'middle', weight: 700 }); });
  vb += line(tips[0][0], tips[0][1], tips[1][0], tips[1][1], K.red, 2, '6 5');
  vb += txt((tips[0][0] + tips[1][0]) / 2 + 12, (tips[0][1] + tips[1][1]) / 2 - 6, `Uᴸ = ${fmt(s.UL)} V`, { color: K.red, size: 13 });
  vb += txt(ox - 8, oy - 60, masked('UF') ? 'Uꜰ = ?' : `Uꜰ = ${fmt(r.UF)} V`, { color: K.blue, size: 13, anchor: 'end' });
  vb += `<circle cx="${ox}" cy="${oy}" r="4" fill="${K.ink}"/>` + txt(ox + 8, oy + 12, 'N', { color: K.muted, size: 12 });
  const vfig = figure('Spänningsvisare', svg(W, H, vb, `Tre fasspänningar, linjespänning ${s.UL} volt`));

  // strömvisare, stjärna och summa
  const Imax = Math.max(s.I1, s.I2, s.I3, 1); const sc2 = 95 / Imax;
  let cb = ''; const ox2 = 120, oy2 = 170;
  r.phasors.forEach((p, k) => { if (Cx.abs(p) > 1e-9) { const t = scr(p, ox2, oy2, sc2); cb += arrow(ox2, oy2, t[0], t[1], PH[k], 3); cb += txt(t[0] + (t[0] - ox2) * 0.15, t[1] + (t[1] - oy2) * 0.15, `I${'₁₂₃'[k]}`, { color: PH[k], size: 13, anchor: 'middle' }); } });
  cb += txt(ox2, 318, 'Från N', { color: K.muted, size: 12, anchor: 'middle' });
  // kedja
  let p = [0, 0]; const ox3 = 320, oy3 = 170; let start = scr(p, ox3, oy3, sc2);
  r.phasors.forEach((ph, k) => { const q = Cx.add(p, ph); const a = scr(p, ox3, oy3, sc2), b = scr(q, ox3, oy3, sc2); cb += arrow(a[0], a[1], b[0], b[1], PH[k], 2.6); p = q; });
  const end = scr(p, ox3, oy3, sc2);
  if (r.IN > 0.05 && !masked('sumValues')) cb += arrow(end[0], end[1], start[0], start[1], K.ink, 2.6).replace(/stroke-linecap/g, 'stroke-dasharray="6 4" stroke-linecap');
  cb += txt(ox3, 318, masked('sumValues') ? 'Iɴ = ? (sluter kedjan)' : `Iɴ sluter kedjan: ${fmt(r.IN)} A`, { color: K.ink, size: 12, anchor: 'middle' });
  const cfig = figure('Strömvisare och deras summa', svg(440, 330, cb, 'Fasströmmar som visare och deras summa'));

  // tidsdiagram
  const T = 1000 / s.f; const w = 640, h = 230, m = { l: 20, r: 12, t: 12, b: 24 };
  const imax = Math.max(Imax, r.IN, 1) * Math.SQRT2 * 1.15;
  const X = (t) => m.l + (t / (2 * T)) * (w - m.l - m.r); const Y = (v) => m.t + (1 - (v + imax) / (2 * imax)) * (h - m.t - m.b);
  let tb = line(m.l, Y(0), w - m.r, Y(0), '#9fb2c1', 1.5);
  const Is = [s.I1, s.I2, s.I3];
  const fn = (k, t) => Is[k] * Math.SQRT2 * Math.sin((2 * Math.PI * t) / T + (PHASE[k] - s.phi) * Math.PI / 180);
  for (const k of [0, 1, 2]) { let d = ''; for (let j = 0; j <= 300; j++) { const t = (2 * T * j) / 300; d += `${j ? 'L' : 'M'}${X(t).toFixed(1)},${Y(fn(k, t)).toFixed(1)}`; } tb += `<path d="${d}" fill="none" stroke="${PH[k]}" stroke-width="2.2"/>`; }
  let dN = ''; for (let j = 0; j <= 300; j++) { const t = (2 * T * j) / 300; dN += `${j ? 'L' : 'M'}${X(t).toFixed(1)},${Y(fn(0, t) + fn(1, t) + fn(2, t)).toFixed(1)}`; }
  if (!masked('sumValues')) tb += `<path d="${dN}" fill="none" stroke="${K.ink}" stroke-width="2.4" stroke-dasharray="7 5"/>`;
  tb += txt(w - m.r, h - 6, `t, två perioder (${fmt(2 * T)} ms)`, { color: K.muted, size: 12, anchor: 'end' });
  const tfig = figure('Strömmar över tiden', svg(w, h, tb, 'Tre fasströmmar och neutralströmmen över tiden') + legend([[PH[0], 'i₁'], [PH[1], 'i₂'], [PH[2], 'i₃'], ...(masked('sumValues') ? [] : [[K.ink, 'iɴ = i₁ + i₂ + i₃ (går tillbaka i N)', true]])]), 'wide');
  $('figures').innerHTML = vfig + cfig + tfig;
  list([
    ['Uᴸ', `${fmt(s.UL)} V`, 'linjespänning (huvudspänning)'], ['Uꜰ', show('UF', r.UF, 'V'), 'fasspänning, Uᴸ/√3'],
    ['120°', `${fmt(r.dt)} ms`, `tidsavstånd vid ${s.f} Hz`], ['Iɴ', show('IN', r.IN, 'A'), 'neutralström (visarsumma)'],
  ]);
  $('principle').innerHTML = subHtml((s.UL >= 440 ? 'Ombord har 440 V- och 690 V-näten normalt ingen neutralledare. Iɴ visar då vad som skulle gå i en neutralledare, till exempel i ett 400/230 V-nät i land eller i ett hotellnät med neutralledare. ' : '') + 'Neutralströmmen är visarsumman av fasströmmarna. Lika stora strömmar med 120° emellan tar ut varandra. Olinjära laster, till exempel frekvensomriktare, kan ändå ge neutralström genom övertoner, som modellen inte visar.');
}

function renderNeutral(s, r) {
  const raw = r.raw; const W = 460, H = 330, ox = 230, oy = 180, sc = 125 / raw.UF;
  const E = raw.E.map((e) => scr(e, ox, oy, sc)); const n0 = scr(raw.VN, ox, oy, sc);
  let b = '';
  b += `<polygon points="${E.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${K.grid}" stroke-width="2"/>`;
  E.forEach((t, k) => { b += line(ox, oy, t[0], t[1], '#b8c6d2', 1.5, '4 4'); b += txt(t[0] + (t[0] - ox) * 0.12, t[1] + (t[1] - oy) * 0.12, `L${k + 1}`, { color: PH[k], size: 14, anchor: 'middle', weight: 700 }); });
  const on = [s.on1, s.on2, s.on3].map((v) => v !== false); const R = [s.R1, s.R2, s.R3];
  const hideU = ['U1', 'U2', 'U3'].some(masked);
  if (!hideU) E.forEach((t, k) => { if (on[k] && Number.isFinite(n0[0])) { b += arrow(n0[0], n0[1], t[0], t[1], PH[k], 3); const mid = [(n0[0] + t[0]) / 2, (n0[1] + t[1]) / 2]; if (!masked('phasorValues')) b += txt(mid[0] + 8, mid[1], `${fmt(r[`U${k + 1}`])} V`, { color: PH[k], size: 12 }); } });
  b += `<circle cx="${ox}" cy="${oy}" r="4" fill="${K.muted}"/>` + txt(ox - 8, oy + 14, 'N (källa)', { color: K.muted, size: 11, anchor: 'end' });
  if (hideU) b += txt(ox, H - 16, 'Visarna visas när du har svarat', { color: K.muted, size: 12, anchor: 'middle' });
  else if (!s.neutral && Number.isFinite(n0[0])) b += `<circle cx="${n0[0]}" cy="${n0[1]}" r="6" fill="${K.red}"/>` + txt(n0[0] + 9, n0[1] + 14, 'lastens stjärnpunkt', { color: K.red, size: 11 });
  const pfig = figure('Spänning över varje last', svg(W, H, b, 'Fasspänningar och lastens stjärnpunkt'));
  // kretsschema: L1 längst till höger så att ledningarna inte korsas
  let cb = ''; const ys = [40, 75, 110, 210]; const xd = [250, 180, 110];
  ['L1', 'L2', 'L3', 'N'].forEach((n, k) => { cb += txt(14, ys[k], n, { size: 13, weight: 700 }); cb += line(40, ys[k], k < 3 ? xd[k] : 180, ys[k], K.ink, 2.2); });
  [0, 1, 2].forEach((k) => {
    const x = xd[k]; cb += line(x, ys[k], x, 175, K.ink, 2.2);
    if (on[k]) cb += `<rect x="${x - 9}" y="${ys[k] + 8}" width="18" height="${175 - ys[k] - 20}" fill="#fff" stroke="${PH[k]}" stroke-width="2.5"/>` + txt(x + 14, (ys[k] + 175) / 2, `${fmt(R[k])} Ω`, { size: 12, color: PH[k] });
    else cb += `<path d="M${x - 6},${ys[k] + 20} L${x + 6},${ys[k] + 32}" stroke="${K.muted}" stroke-width="2"/>` + txt(x + 10, (ys[k] + 175) / 2, 'frånkopplad', { size: 11, color: K.muted });
  });
  cb += line(110, 175, 250, 175, K.ink, 2.2) + `<circle cx="180" cy="175" r="4" fill="${K.ink}"/>`;
  cb += s.neutral ? line(180, 175, 180, 210, K.ink, 2.2) : line(180, 175, 180, 185, K.ink, 2.2) + `<path d="M172,189 L188,201 M188,189 L172,201" stroke="${K.red}" stroke-width="3"/>` + txt(196, 195, 'brott', { color: K.red, size: 12 }) + line(180, 205, 180, 210, K.ink, 2.2);
  const cfig = figure('Koppling', svg(320, 225, cb, s.neutral ? 'Tre laster med hel neutralledare' : 'Tre laster med bruten neutralledare'));
  // staplar
  let bb = ''; const Umax = Math.max(raw.UF, ...[r.U1, r.U2, r.U3].filter((u, k) => on[k] && Number.isFinite(u))) * 1.2; const bw = 560, bh = 200;
  bb += line(40, 170 - (raw.UF / Umax) * 140, bw - 10, 170 - (raw.UF / Umax) * 140, K.muted, 1.5, '6 5') + txt(bw - 10, 160 - (raw.UF / Umax) * 140, `Uꜰ = ${fmt(raw.UF)} V`, { size: 12, color: K.muted, anchor: 'end' });
  [r.U1, r.U2, r.U3].forEach((u, k) => {
    if (!on[k] || !Number.isFinite(u)) { const x = 80 + k * 150; bb += txt(x + 35, 185, `L${k + 1}: öppen klämma`, { size: 12, anchor: 'middle', color: K.muted }); return; }
    const x = 80 + k * 150; const over = u > raw.UF * 1.1;
    if (hideU) { bb += `<rect x="${x}" y="30" width="70" height="140" fill="none" stroke="${PH[k]}" stroke-dasharray="5 4" rx="3"/>` + txt(x + 35, 100, '?', { size: 22, anchor: 'middle', color: PH[k], weight: 700 }) + txt(x + 35, 185, `last L${k + 1}`, { size: 12, anchor: 'middle', color: K.muted }); return; }
    const hh = (u / Umax) * 140;
    bb += `<rect x="${x}" y="${170 - hh}" width="70" height="${hh}" fill="${over ? K.red : PH[k]}" opacity="0.85" rx="3"/>`;
    bb += txt(x + 35, 185, `last L${k + 1}`, { size: 12, anchor: 'middle', color: K.muted });
    bb += txt(x + 35, 160 - hh, masked(`U${k + 1}`) ? '?' : `${fmt(u)} V${over ? ' ⚠' : ''}`, { size: 13, anchor: 'middle', color: over ? K.red : K.ink, weight: over ? 700 : 400 });
  });
  const bfig = figure('Lastspänning jämfört med Uꜰ', svg(bw, bh, bb, 'Spänning över varje last'), 'wide');
  $('figures').innerHTML = pfig + cfig + bfig;
  const uv = (k) => (!on[k - 1] || !Number.isFinite(r[`U${k}`]) ? '–' : show(`U${k}`, r[`U${k}`], 'V'));
  list([
    ['U last L1', uv(1), `I = ${masked('I1') ? '?' : fmt(r.I1) + ' A'}`],
    ['U last L2', uv(2), `I = ${masked('I2') ? '?' : fmt(r.I2) + ' A'}`],
    ['U last L3', uv(3), `I = ${masked('I3') ? '?' : fmt(r.I3) + ' A'}`],
    ['Iɴ', s.neutral ? show('IN', r.IN, 'A') : '–', s.neutral ? 'neutralström' : 'ingen neutralledare'],
    ['Förskjutning', show('shift', r.shift, 'V'), 'lastens stjärnpunkt mot N'],
  ]);
  $('principle').innerHTML = subHtml(s.neutral
    ? 'Med hel neutralledare får varje last sin fasspänning, oavsett hur ojämnt lasterna är fördelade. Skillnaden i ström går tillbaka i neutralledaren.'
    : 'Utan neutralledare flyttar lastens stjärnpunkt mot den tyngst belastade fasen. Den svagast belastade lasten kan då få nästan hela linjespänningen. Apparater kan förstöras och bränder uppstå. Därför får neutralledaren inte brytas ensam. Detta gäller nät med neutralledare, till exempel 400/230 V i land, på varv och i vissa fartygs hotellnät. Ett treledar-IT-nät ombord har ingen neutralledare som kan brytas.');
}

function renderYdelta(s, r) {
  const Y = s.conn === 'Y';
  let b = ''; const cx = 200, cy = 170, rr = 105;
  const V = [90, 210, 330].map((a) => [cx + rr * Math.cos(a * Math.PI / 180), cy - rr * Math.sin(a * Math.PI / 180)]);
  const res = (p, q, col) => { const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; const a = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI; return line(p[0], p[1], q[0], q[1], K.ink, 2.4) + `<rect x="${m[0] - 22}" y="${m[1] - 9}" width="44" height="18" fill="#fff" stroke="${col}" stroke-width="2.5" transform="rotate(${a.toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)})"/>`; };
  if (Y) V.forEach((v, k) => { b += res([cx, cy], v, PH[k]); }); else [[0, 1], [1, 2], [2, 0]].forEach(([i, j], k) => { b += res(V[i], V[j], PH[k]); });
  V.forEach((v, k) => { b += `<circle cx="${v[0]}" cy="${v[1]}" r="5" fill="${K.ink}"/>` + txt(v[0] + (v[0] - cx) * 0.2, v[1] + (v[1] - cy) * 0.2, `L${k + 1}`, { size: 14, weight: 700, anchor: 'middle' }); });
  if (Y) b += `<circle cx="${cx}" cy="${cy}" r="4" fill="${K.ink}"/>`;
  b += arrow(V[0][0], V[0][1] - 55, V[0][0], V[0][1] - 10, masked('IL') ? K.red : K.ink, 2.4) + txt(V[0][0] + 16, V[0][1] - 40, masked('IL') ? 'Iᴸ = ?' : `Iᴸ = ${fmt(r.IL)} A`, { color: masked('IL') ? K.red : K.ink, size: 13 });
  b += txt(20, 310, masked('Ugren') ? 'Ugren = ?' : `Ugren = ${fmt(r.Ugren)} V`, { size: 13 }) + txt(220, 310, masked('Igren') ? 'Igren = ?' : `Igren = ${fmt(r.Igren)} A`, { size: 13 });
  const lfig = figure(`${Y ? 'Y-koppling' : 'Δ-koppling'}, |Z| = ${fmt(s.Z)} Ω per gren`, svg(400, 330, b, `${s.conn}-koppling`));
  // märkning och plint
  if (!PLATES[s.plate]) { $('figures').innerHTML = lfig; list([
    ['Ugren', show('Ugren', r.Ugren, 'V'), Y ? 'Uᴸ/√3 i Y' : 'Uᴸ i Δ'], ['Igren', show('Igren', r.Igren, 'A'), 'Ugren/|Z|'],
    ['Iᴸ', show('IL', r.IL, 'A'), Y ? 'lika med Igren i Y' : '√3 · Igren i Δ'], ['S', show('S', r.S / 1000, 'kVA'), '√3 · Uᴸ · Iᴸ'],
    ['P', show('PkW', r.PkW, 'kW'), 'S · cos φ'], ['Q', show('Q', r.Q / 1000, 'kvar'), 'S · sin φ (kvar = kilovar)']]);
    $('principle').innerHTML = subHtml('Samma grenimpedans drar tre gånger så stor linjeström i Δ som i Y vid samma nät.'); return; }
  const [Ulow, Uhigh] = PLATES[s.plate]; const ok = r.right === s.conn; const ratio = r.ratio;
  let mb = `<rect x="20" y="16" width="220" height="62" rx="6" fill="#eef2f5" stroke="${K.ink}" stroke-width="1.6"/>` + txt(130, 36, '3~ motor', { size: 13, anchor: 'middle' }) + txt(130, 60, `Δ/Y ${Ulow}/${Uhigh} V`, { size: 16, anchor: 'middle', weight: 700 });
  mb += txt(260, 47, `Nät: ${s.UL} V`, { size: 14, color: K.blue });
  const plx = 60, ply = 120, dx = 70; const tops = ['W2', 'U2', 'V2'], bots = ['U1', 'V1', 'W1'];
  mb += `<rect x="${plx - 30}" y="${ply - 30}" width="${2 * dx + 60}" height="110" fill="#f4f7fa" stroke="#9fb2c1"/>`;
  for (let k = 0; k < 3; k++) { mb += `<circle cx="${plx + k * dx}" cy="${ply}" r="9" fill="#fff" stroke="${K.ink}" stroke-width="1.8"/><circle cx="${plx + k * dx}" cy="${ply + 55}" r="9" fill="#fff" stroke="${K.ink}" stroke-width="1.8"/>` + txt(plx + k * dx, ply - 18, tops[k], { size: 11, anchor: 'middle' }) + txt(plx + k * dx + 14, ply + 55, bots[k], { size: 11 }); }
  const lc = ok ? K.green : K.red;
  if (Y) mb += line(plx, ply, plx + 2 * dx, ply, lc, 6); else for (let k = 0; k < 3; k++) mb += line(plx + k * dx, ply, plx + k * dx, ply + 55, lc, 6);
  let verdict;
  if (!r.right) verdict = ['Ingen koppling passar märkningen på detta nät.', K.red];
  else if (ok) verdict = [`Rätt: ${s.conn} ger lindningen ${fmt(ratio * Ulow)} V (märkt ${Ulow} V).`, K.green];
  else verdict = [`Fel: lindningen får ${fmt(ratio * Ulow)} V, ${ratio > 1 ? `${fmt(ratio, 2)} gånger för mycket: lindningen överhettas och isolationen kan skadas` : 'för lite: motorn ger bara ungefär en tredjedel av momentet och överhettas vid full last'}. Välj ${r.right}.`, K.red];
  const mfig = figure('Motorns märkning och kopplingsplint', svg(470, 210, mb, 'Motorns märkning och kopplingsplint') + `<p class="fig-note" style="color:${verdict[1]}">${subHtml(verdict[0])}</p><p class="fig-note">Kontrollera även frekvensen (50/60 Hz) på märkskylten.</p>`);
  $('figures').innerHTML = lfig + mfig;
  list([
    ['Ugren', show('Ugren', r.Ugren, 'V'), Y ? 'Uᴸ/√3 i Y' : 'Uᴸ i Δ'], ['Igren', show('Igren', r.Igren, 'A'), 'Ugren/|Z|'],
    ['Iᴸ', show('IL', r.IL, 'A'), Y ? 'lika med Igren i Y' : '√3 · Igren i Δ'], ['S', show('S', r.S / 1000, 'kVA'), '√3 · Uᴸ · Iᴸ'],
    ['P', show('PkW', r.PkW, 'kW'), 'S · cos φ'], ['Q', show('Q', r.Q / 1000, 'kvar'), 'S · sin φ (kvar = kilovar)'],
  ]);
  $('principle').innerHTML = subHtml('Samma grenimpedans drar tre gånger så stor linjeström i Δ som i Y vid samma nät. Därför måste motorns koppling följa märkningen: den lägre spänningen gäller Δ, den högre Y. Fel koppling ger √3 gånger för hög eller för låg lindningsspänning. En motor som går i Δ på nätet kan startas Y/Δ: startström och startmoment blir då ungefär en tredjedel.');
}

function list(items) { $('readouts').innerHTML = items.map(([k, v, d]) => `<div class="${v === '?' ? 'hidden-value' : ''}"><dt>${subHtml(k)}</dt><dd><strong>${escHtml(v)}</strong><span>${subHtml(d)}</span></dd></div>`).join(''); }
function render() { const s = state.values[state.tab]; const r = readouts(state.tab, s); ({ visare: renderVisare, neutral: renderNeutral, ydelta: renderYdelta })[state.tab](s, r); }

// ---------- uppgifter ----------
function renderChallengeSelect() {
  const list_ = CHALLENGES.filter((c) => c.tab === state.tab);
  $('challenge-select').innerHTML = '<option value="">Välj uppgift …</option>' + list_.map((c) => `<option value="${c.id}"${state.challenge?.id === c.id ? ' selected' : ''}>${state.solved.has(c.id) ? '✓ ' : ''}${escHtml(plain(c.title))}</option>`).join('');
  $('progress').textContent = `${CHALLENGES.filter((c) => state.solved.has(c.id)).length} av ${CHALLENGES.length} klara`;
}
function startChallenge(id) {
  const c = CHALLENGES.find((x) => x.id === id); if (!c) return leaveChallenge();
  state.challenge = c; state.attempts = 0; if (c.tab !== state.tab) setTab(c.tab, false);
  state.values[c.tab] = clone(c.setup);
  $('challenge-body').hidden = false; $('challenge-intro').hidden = true;
  $('challenge-deck').textContent = c.deck; $('challenge-task').innerHTML = subHtml(c.task);
  $('answer-label').innerHTML = `${subHtml(c.ask.label)} =`; $('answer-unit').textContent = c.ask.unit;
  $('answer').value = ''; $('hint-text').innerHTML = subHtml(c.hint); $('hint').open = false;
  $('feedback').className = 'feedback'; $('feedback').textContent = ''; $('show-answer').hidden = true;
  renderControls(); renderChallengeSelect(); render(); updateUrl();
}
function leaveChallenge() { state.challenge = null; $('challenge-body').hidden = true; $('challenge-intro').hidden = false; renderControls(); renderChallengeSelect(); render(); updateUrl(); }
function finish(correct, message) {
  const c = state.challenge; const e = expected(c);
  if (correct) { state.solved.add(c.id); saveSolved(); }
  state.challenge = null;
  $('feedback').className = `feedback ${correct ? 'ok' : 'info'}`;
  $('feedback').innerHTML = `<strong>${message}</strong> ${subHtml(c.ask.label)} = ${fmt(e, 4)} ${c.ask.unit}.<br><span class="solution">${subHtml(c.solution)}</span><br>Reglagen är nu upplåsta. Ändra ett värde och se vad som händer.`;
  $('show-answer').hidden = true; renderControls(); renderChallengeSelect(); render();
  $('challenge-body').hidden = false; $('challenge-intro').hidden = true;
}
$('answer-form').addEventListener('submit', (ev) => {
  ev.preventDefault(); const c = state.challenge; if (!c) return;
  const ans = parseAnswer($('answer').value); const fb = $('feedback');
  if (!Number.isFinite(ans)) { fb.className = 'feedback warn'; fb.textContent = 'Skriv ett tal, till exempel 17,3.'; return; }
  const e = expected(c); if (isClose(ans, e, c.ask)) return finish(true, 'Rätt!');
  state.attempts += 1; let msg = 'Inte ännu. ';
  const typical = (c.mistakes || []).find((m) => isClose(ans, m.v, { rel: 0.02 }));
  if (typical) msg += `${typical.msg} `;
  else if (isClose(ans * 1000, e, c.ask) || isClose(ans / 1000, e, c.ask)) msg += 'Talet stämmer men enheten är fel med en faktor 1 000. ';
  else if (isClose(ans * Math.sqrt(3), e, c.ask) || isClose(ans / Math.sqrt(3), e, c.ask)) msg += 'Du är en faktor √3 fel. Kontrollera om det gäller fas- eller linjevärde. ';
  else msg += 'Kontrollera formeln och enheterna. ';
  if (state.attempts >= 2) { $('hint').open = true; $('show-answer').hidden = false; }
  fb.className = 'feedback warn'; fb.innerHTML = subHtml(msg);
});
$('show-answer').addEventListener('click', () => finish(false, 'Facit:'));
$('leave').addEventListener('click', leaveChallenge);
$('challenge-select').addEventListener('change', (e) => (e.target.value ? startChallenge(e.target.value) : leaveChallenge()));
$('reset').addEventListener('click', () => { if (state.challenge) return; state.values[state.tab] = clone(DEFAULTS[state.tab]); renderControls(); render(); });

function setTab(tab, doRender = true) {
  state.tab = tab;
  document.querySelectorAll('[role=tab]').forEach((b) => { const on = b.dataset.tab === tab; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
  $('lab').setAttribute('aria-labelledby', `tab-${tab}`);
  if (doRender) { if (state.challenge && state.challenge.tab !== tab) { state.challenge = null; $('challenge-body').hidden = true; $('challenge-intro').hidden = false; } renderControls(); renderChallengeSelect(); render(); updateUrl(); }
}
function updateUrl() { const p = new URLSearchParams(); p.set('flik', state.tab); if (state.challenge) p.set('uppgift', state.challenge.id); try { history.replaceState(null, '', `?${p}`); } catch { /* */ } }
document.querySelectorAll('[role=tab]').forEach((b) => {
  b.addEventListener('click', () => setTab(b.dataset.tab));
  b.addEventListener('keydown', (e) => { const tabs = [...document.querySelectorAll('[role=tab]')]; const i = tabs.indexOf(b); const j = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : -1; if (j >= 0) { e.preventDefault(); tabs[j].focus(); setTab(tabs[j].dataset.tab); } });
});
const params = new URLSearchParams(location.search);
setTab(DEFAULTS[params.get('flik')] ? params.get('flik') : 'visare');
if (params.get('uppgift')) startChallenge(params.get('uppgift'));

// Labbprotokoll för Station B, trefasdelen
function rig3F(patch) {
  if (state.challenge) leaveChallenge();
  setTab('neutral', false);
  state.values.neutral = { ...clone(RIG_3F), ...patch };
  renderControls(); renderChallengeSelect(); render(); updateUrl();
}
mountProtocol(document.getElementById('labbprotokoll'), { ...STATION_B_3F_PROTOKOLL,
  presets: [
    { label: 'Stationens trefasrigg: N hel', apply: () => rig3F({}), done: 'Trefasriggen är inställd: 12,2 V, tre laster, neutralledaren hel.' },
    { label: 'Bryt N', apply: () => rig3F({ neutral: false }), done: 'Neutralledaren är bruten. Alla tre laster är inkopplade.' },
    { label: 'Bryt N och koppla från L2-lasten', apply: () => rig3F({ neutral: false, on2: false }), done: 'Neutralledaren är bruten och L2-lasten frånkopplad.' },
  ],
  snapshot(plan) {
    if (state.tab !== 'neutral') return { error: 'Byt till fliken ”Neutralledaren” för att mäta på trefasriggen.' };
    if (state.challenge) return { error: 'Lämna uppgiften först (”Utforska fritt”), eller använd knapparna ovan för att ställa in riggen.' };
    const s = state.values.neutral, r = readouts('neutral', s), q = plan?.q || 'U1', n = plan?.need;
    if (n && ['UL', 'R1', 'R2', 'R3', 'on1', 'on2', 'on3', 'neutral'].some((k) => s[k] !== n[k])) {
      return { error: `Mätning ${STATION_B_3F_PROTOKOLL.rows.indexOf(plan) + 1} gäller stationsriggen med N ${n.neutral ? 'hel' : 'bruten'}${n.on2 ? '' : ' och last 2 frånkopplad'}. Ställ in den med knapparna överst i protokollet.` };
    }
    const on = [1, 2, 3].filter((k) => s[`on${k}`] !== false).map((k) => `L${k}`).join(', ');
    const drift = `Uᴸ ${fmt(s.UL)} V, N ${s.neutral ? 'hel' : 'bruten'}, laster: ${on.replace(/L/g, '') || 'inga'} (R1 ${s.R1}, R2 ${s.R2}, R3 ${s.R3} Ω)`;
    const val = q.startsWith('U') ? `${r[q].toFixed(2).replace('.', ',')} V` : `${(r[q] * 1000).toFixed(1).replace('.', ',')} mA`;
    return { punkter: plan?.punkter, drift, varde: val };
  } });
