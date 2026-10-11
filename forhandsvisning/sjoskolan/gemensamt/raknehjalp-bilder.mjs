// Interaktiva bilder till Räknarhjälp (gemensamt/Raknehjalp.html): radianen, från varv till sinus,
// RAD eller DEG på räknaren, fasvinkeln och prefixstegen. Canvas med reglage och knappar; texten under
// varje bild säger samma sak i ord, så att bilden aldrig är enda bäraren av informationen.
// Exempeltalen (fartyget 440 V/60 Hz vid 1,5 ms, R 30 Ω och X_L 45 Ω, 382 mH) är kontrollerade mot
// övningsdatabasens svar (ANDRINGSLOGG regel 20–23).

const C = { blue: '#064f91', ink: '#163248', muted: '#4d6579', line: '#cad8e2', soft: '#edf4f9', ok: '#176844', warn: '#9a4a12', red: '#b8323c', gold: '#e0a100', paper: '#ffffff' };
const sv = (v, d = 3) => v.toLocaleString('sv-SE', { maximumFractionDigits: d, minimumFractionDigits: 0 });
const TAU = 2 * Math.PI;
const minskaRorelse = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** En canvas som följer sin behållares bredd och ritas om vid storleksändring. */
function duk(el, hojd, rita) {
  const cv = document.createElement('canvas'); el.prepend(cv);
  const ctx = cv.getContext('2d'); let w = 0, h = 0;
  const om = () => {
    w = el.clientWidth; h = typeof hojd === 'function' ? hojd(w) : hojd;
    const r = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * r); cv.height = Math.round(h * r); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    ctx.setTransform(r, 0, 0, r, 0, 0); rita(ctx, w, h);
  };
  new ResizeObserver(om).observe(el);
  return { rita: () => { if (w) { ctx.clearRect(0, 0, w, h); rita(ctx, w, h); } }, cv };
}
function text(ctx, s, x, y, { size = 16, color = C.ink, weight = 'normal', align = 'left', base = 'middle' } = {}) {
  ctx.font = `${weight} ${size}px Arial, Helvetica, sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y);
}
/** Text med nedsänkt index: X_{L} ritas som X och ett mindre L. */
function textIndex(ctx, bas, idx, x, y, opt = {}) {
  const size = opt.size || 16; text(ctx, bas, x, y, opt);
  ctx.font = `${opt.weight || 'normal'} ${size}px Arial, Helvetica, sans-serif`; const b = ctx.measureText(bas).width;
  const x2 = opt.align === 'center' ? x + b / 2 : x + b; text(ctx, idx, x2, y + size * 0.3, { ...opt, size: Math.round(size * 0.7), align: 'left' });
}
function linje(ctx, x1, y1, x2, y2, color = C.ink, lw = 2, dash = null) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
function pil(ctx, x1, y1, x2, y2, color = C.ink, lw = 3) {
  linje(ctx, x1, y1, x2, y2, color, lw); const a = Math.atan2(y2 - y1, x2 - x1), k = 10 + lw;
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - k * Math.cos(a - 0.4), y2 - k * Math.sin(a - 0.4)); ctx.lineTo(x2 - k * Math.cos(a + 0.4), y2 - k * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill(); ctx.restore();
}
function knappar(el, lista, val) {
  const rad = document.createElement('div'); rad.className = 'rhb-knappar'; rad.setAttribute('role', 'group');
  for (const [etikett, v] of lista) { const b = document.createElement('button'); b.type = 'button'; b.textContent = etikett; b.addEventListener('click', () => val(v)); rad.append(b); }
  el.append(rad); return rad;
}
function reglage(el, { etikett, min, max, steg, varde, enhet }, andrad) {
  const l = document.createElement('label'); l.className = 'rhb-reglage';
  l.innerHTML = `<span>${etikett}</span><input type="range" min="${min}" max="${max}" step="${steg}" value="${varde}"><output></output>`;
  const inp = l.querySelector('input'), ut = l.querySelector('output');
  const upd = () => { ut.textContent = `${sv(Number(inp.value), 2)} ${enhet}`; andrad(Number(inp.value)); };
  inp.addEventListener('input', upd); el.append(l);
  return { satt: (v) => { inp.value = v; upd(); }, get: () => Number(inp.value), init: upd };
}
const forklaring = (el) => { const p = document.createElement('p'); p.className = 'rhb-text'; p.setAttribute('aria-live', 'polite'); el.append(p); return p; };

/* 1. Vad är en radian? Bågen mäts i radier. */
function radianen(el) {
  let grad = 57.3;
  const txt = forklaring(el);
  const d = duk(el, (w) => Math.min(360, w * 0.72), (ctx, w, h) => {
    const r = Math.min(h * 0.36, w * 0.28), cx = w * 0.36, cy = h * 0.52, v = (grad * Math.PI) / 180;
    ctx.save(); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.restore();
    // bågen, med ett streck för varje hel radie längs bågen
    ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, -v, true); ctx.stroke(); ctx.restore();
    for (let k = 1; k <= Math.floor(v + 1e-9); k++) {
      const x1 = cx + (r - 12) * Math.cos(-k), y1 = cy + (r - 12) * Math.sin(-k), x2 = cx + (r + 12) * Math.cos(-k), y2 = cy + (r + 12) * Math.sin(-k);
      linje(ctx, x1, y1, x2, y2, C.gold, 4); text(ctx, String(k), cx + (r + 28) * Math.cos(-k), cy + (r + 28) * Math.sin(-k), { size: 15, weight: 'bold', color: C.warn, align: 'center' });
    }
    linje(ctx, cx, cy, cx + r, cy, C.ink, 3); text(ctx, 'radien r', cx + r / 2, cy + 18, { size: 15, color: C.muted, align: 'center' });
    pil(ctx, cx, cy, cx + r * Math.cos(-v), cy + r * Math.sin(-v), C.ink, 3);
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, -v, true); ctx.stroke(); ctx.restore();
    // förklaring till höger
    const x0 = Math.min(w - 10, cx + r + 50);
    if (w - x0 > 150) {
      text(ctx, `${sv(grad, 1)}°`, x0, cy - 40, { size: 26, weight: 'bold', color: C.red });
      text(ctx, `= ${sv(v, 3)} rad`, x0, cy, { size: 26, weight: 'bold', color: C.blue });
      text(ctx, `bågen = ${sv(v, 2)} · r`, x0, cy + 40, { size: 17, color: C.ink });
    }
  });
  const s = reglage(el, { etikett: 'Vinkel', min: 0, max: 360, steg: 0.1, varde: grad, enhet: '°' }, (g) => {
    grad = g; const v = (g * Math.PI) / 180; d.rita();
    txt.innerHTML = `<b>${sv(g, 1)}° = ${sv(v, 3)} rad.</b> Den blå bågen är lika lång som ${Math.abs(v - 1) < 0.005 ? 'en radie' : `${sv(v, 2)} radier`}. ` +
      (Math.abs(g - 360) < 0.05 ? 'Ett helt varv: bågen är hela omkretsen, 2π · r. Därför är 360° = 2π rad ≈ 6,28 rad.' :
        Math.abs(g - 180) < 0.05 ? 'Ett halvt varv är π rad ≈ 3,14 rad.' :
          Math.abs(v - 1) < 0.002 ? 'En radian: bågen är exakt en radie lång (ungefär 57,3°).' : 'De gula strecken visar var bågen blir 1, 2, 3 … radier lång.');
  });
  knappar(el, [['1 rad', 180 / Math.PI], ['90°', 90], ['180°', 180], ['360°', 360]], (g) => s.satt(g));
  s.init();
}

/* 2. Från varv till sinus: u(t) = û · sin(2π · f · t). Fartyget 440 V, 60 Hz. */
function frånVarvTillSinus(el) {
  const f = 60, uh = 622, T = 1000 / f; let tms = 1.5;
  const txt = forklaring(el);
  const d = duk(el, (w) => (w < 560 ? 520 : 300), (ctx, w, h) => {
    const smal = w < 560, r = smal ? Math.min(100, w * 0.26) : Math.min(110, h * 0.34);
    const cx = smal ? w / 2 : r + 30, cy = smal ? r + 34 : h / 2, v = TAU * f * (tms / 1000);
    ctx.save(); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.restore();
    linje(ctx, cx - r - 10, cy, cx + r + 10, cy, C.line, 1); linje(ctx, cx, cy - r - 10, cx, cy + r + 10, C.line, 1);
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, -v, true); ctx.stroke(); ctx.restore();
    const px = cx + r * Math.cos(-v), py = cy + r * Math.sin(-v);
    pil(ctx, cx, cy, px, py, C.blue, 4); linje(ctx, px, py, px, cy, C.gold, 3, [6, 5]);
    text(ctx, `vinkel ${sv(v, 2)} rad`, cx, cy + r + 22, { size: 15, color: C.red, align: 'center' });
    // grafen
    const gx = smal ? 40 : cx + r + 60, gw = w - gx - 16, gy = smal ? cy + r + 60 : 30, gh = smal ? h - gy - 30 : h - 60, mid = gy + gh / 2;
    linje(ctx, gx, mid, gx + gw, mid, C.line, 2); linje(ctx, gx, gy, gx, gy + gh, C.line, 2);
    ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const t = (i / 200) * T, x = gx + (i / 200) * gw, y = mid - Math.sin(TAU * f * t / 1000) * (gh / 2 - 6); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
    const mx = gx + (tms / T) * gw, my = mid - Math.sin(v) * (gh / 2 - 6);
    linje(ctx, mx, mid, mx, my, C.gold, 3, [6, 5]);
    if (!smal) linje(ctx, px, py, mx, my, C.gold, 1, [2, 4]);
    ctx.save(); ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(mx, my, 6, 0, TAU); ctx.fill(); ctx.restore();
    text(ctx, `u = ${sv(uh * Math.sin(v), 0)} V`, Math.min(mx + 10, gx + gw - 90), my - 18, { size: 16, weight: 'bold', color: C.red });
    text(ctx, '0', gx - 8, mid, { size: 14, color: C.muted, align: 'right' });
    text(ctx, `${sv(T, 1)} ms`, gx + gw, mid + 18, { size: 14, color: C.muted, align: 'right' });
    text(ctx, 'u (V)', gx + 4, gy + 8, { size: 14, color: C.muted });
  });
  reglage(el, { etikett: 'Tid t', min: 0, max: 16.6, steg: 0.1, varde: tms, enhet: 'ms' }, (t) => {
    tms = t; d.rita(); const v = TAU * f * (t / 1000);
    txt.innerHTML = `Pilen snurrar ett varv på ${sv(T, 1)} ms (60 varv per sekund). Vid t = ${sv(t, 1)} ms har den vridit sig<br>` +
      `<b>2π · f · t = 2π · 60 Hz · ${sv(t / 1000, 4)} s = ${sv(v, 3)} rad</b> (= ${sv((v * 180) / Math.PI, 1)}°).<br>` +
      `Pilens höjd är spänningen: <b>u = 622 V · sin(${sv(v, 3)}) = ${sv(uh * Math.sin(v), 0)} V</b>. Talet ${sv(v, 3)} är radianer, därför RAD.`;
  }).init();
}

/* 3. Samma knapptryck, två svar: räknaren i RAD eller DEG. */
function raknaren(el) {
  let lage = 'RAD'; const x = 0.565;
  const txt = forklaring(el);
  const d = duk(el, (w) => (w < 560 ? 430 : 280), (ctx, w, h) => {
    const smal = w < 560, bw = smal ? Math.min(260, w - 40) : 250, bx = smal ? (w - bw) / 2 : 24, by = 14, bh = smal ? 190 : h - 28;
    // räknaren
    ctx.save(); ctx.fillStyle = '#2b3a47'; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 18); ctx.fill();
    ctx.fillStyle = '#cfdcc0'; ctx.beginPath(); ctx.roundRect(bx + 16, by + 16, bw - 32, 92, 8); ctx.fill(); ctx.restore();
    text(ctx, lage === 'RAD' ? 'R' : 'D', bx + 26, by + 30, { size: 14, weight: 'bold', color: '#1b2a22' });
    text(ctx, `sin(${sv(x, 3)})`, bx + 26, by + 58, { size: 18, color: '#1b2a22' });
    const y = lage === 'RAD' ? Math.sin(x) : Math.sin((x * Math.PI) / 180);
    text(ctx, sv(y, lage === 'RAD' ? 3 : 5), bx + bw - 26, by + 88, { size: 26, weight: 'bold', color: '#1b2a22', align: 'right' });
    for (let i = 0; i < 3; i++) for (let j = 0; j < (smal ? 1 : 3); j++) { ctx.fillStyle = '#4b5d6c'; ctx.beginPath(); ctx.roundRect(bx + 22 + i * ((bw - 44) / 3), by + 124 + j * 44, (bw - 44) / 3 - 10, 32, 6); ctx.fill(); }
    // vilken vinkel räknaren tror att det är
    const cx = smal ? w / 2 : bx + bw + (w - bx - bw) / 2, cy = smal ? by + bh + 110 : h / 2 + 10, r = smal ? 80 : Math.min(95, h * 0.33);
    const v = lage === 'RAD' ? x : (x * Math.PI) / 180;
    ctx.save(); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    ctx.fillStyle = lage === 'RAD' ? 'rgba(6,79,145,.18)' : 'rgba(184,50,60,.25)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, 0, -Math.max(v, 0.012), true); ctx.closePath(); ctx.fill(); ctx.restore();
    linje(ctx, cx, cy, cx + r, cy, C.ink, 2); pil(ctx, cx, cy, cx + r * Math.cos(-v), cy + r * Math.sin(-v), lage === 'RAD' ? C.blue : C.red, 3);
    text(ctx, lage === 'RAD' ? `${sv(x, 3)} rad ≈ ${sv((x * 180) / Math.PI, 1)}°` : `${sv(x, 3)}° (nästan ingenting)`, cx, cy + r + 22, { size: 15, weight: 'bold', color: lage === 'RAD' ? C.blue : C.red, align: 'center' });
    text(ctx, 'Vinkeln räknaren använder', cx, cy - r - 18, { size: 14, color: C.muted, align: 'center' });
  });
  const rad = knappar(el, [['RAD', 'RAD'], ['DEG', 'DEG']], (l) => { lage = l; upd(); });
  const upd = () => {
    rad.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.textContent === lage)));
    d.rita(); const y = lage === 'RAD' ? Math.sin(x) : Math.sin((x * Math.PI) / 180);
    txt.innerHTML = lage === 'RAD'
      ? `<b>RAD (rätt):</b> räknaren läser 0,565 som radianer, alltså ungefär 32°. sin(0,565) = ${sv(y, 3)} och u = 622 V · ${sv(y, 3)} = <b>${sv(622 * y, 0)} V</b>. Rimligt: en bit upp mot toppen.`
      : `<b>DEG (fel här):</b> räknaren läser 0,565 som grader, en nästan platt vinkel. sin(0,565°) = ${sv(y, 5)} och u = 622 V · ${sv(y, 5)} = <b>${sv(622 * y, 1)} V</b>. Orimligt litet. Samma knapptryck, fel läge.`;
  };
  upd();
}

/* 4. Fasvinkeln: arctan(X_L / R) i grader. */
function fasvinkeln(el) {
  let R = 30, X = 45;
  const txt = forklaring(el);
  const d = duk(el, (w) => Math.min(300, Math.max(220, w * 0.42)), (ctx, w, h) => {
    const m = Math.min((w - 150) / 60, (h - 50) / 60), x0 = 50, y0 = h - 30, rx = x0 + R * m, xy = y0 - X * m, phi = Math.atan(X / R);
    ctx.save(); ctx.fillStyle = 'rgba(6,79,145,.07)'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(rx, y0); ctx.lineTo(rx, xy); ctx.closePath(); ctx.fill(); ctx.restore();
    linje(ctx, x0, y0, rx, y0, C.ink, 4); linje(ctx, rx, y0, rx, xy, C.warn, 4); linje(ctx, x0, y0, rx, xy, C.blue, 4);
    ctx.save(); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.strokeRect(rx - 14, y0 - 14, 14, 14); ctx.restore();
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x0, y0, 42, 0, -phi, true); ctx.stroke(); ctx.restore();
    text(ctx, 'φ', x0 + 52 * Math.cos(-phi / 2), y0 + 52 * Math.sin(-phi / 2), { size: 20, weight: 'bold', color: C.red, align: 'center' });
    text(ctx, `R = ${sv(R, 0)} Ω`, (x0 + rx) / 2, y0 + 20, { size: 16, weight: 'bold', color: C.ink, align: 'center' });
    textIndex(ctx, 'X', 'L', rx + 10, (y0 + xy) / 2 - 10, { size: 16, weight: 'bold', color: C.warn });
    text(ctx, `= ${sv(X, 0)} Ω`, rx + 34, (y0 + xy) / 2 - 10, { size: 16, weight: 'bold', color: C.warn });
    text(ctx, `Z = ${sv(Math.hypot(R, X), 1)} Ω`, (x0 + rx) / 2 - 18, (y0 + xy) / 2 - 12, { size: 16, weight: 'bold', color: C.blue, align: 'right' });
  });
  const upd = () => {
    d.rita(); const phi = Math.atan(X / R);
    txt.innerHTML = `Spolen (X<sub>L</sub>) står rakt upp, resistorn (R) ligger ner. Vinkeln mellan R och Z är fasvinkeln:<br>` +
      `<b>φ = arctan(X<sub>L</sub> / R) = arctan(${sv(X, 0)} / ${sv(R, 0)}) = ${sv((phi * 180) / Math.PI, 1)}°</b> med räknaren i DEG (tan⁻¹).<br>` +
      `I RAD hade samma knapptryck visat ${sv(phi, 3)}, samma vinkel i radianer. Frågan vill ha grader, därför DEG.`;
  };
  reglage(el, { etikett: 'R', min: 5, max: 60, steg: 1, varde: R, enhet: 'Ω' }, (v) => { R = v; upd(); }).init();
  reglage(el, { etikett: 'X_L (spolens reaktans)', min: 5, max: 60, steg: 1, varde: X, enhet: 'Ω' }, (v) => { X = v; upd(); }).init();
  el.querySelectorAll('.rhb-reglage span')[1].innerHTML = 'X<sub>L</sub> (spolens reaktans)';
}

/* 5. Prefixtrappan: varje steg är 1 000 gånger, kommat flyttar tre platser. */
const PREFIX = [['n', 'nano', -9], ['µ', 'mikro', -6], ['m', 'milli', -3], ['', 'grundenhet', 0], ['k', 'kilo', 3]];
const ENHET = { H: 'henry', F: 'farad', s: 'sekund', A: 'ampere', V: 'volt', W: 'watt', 'Ω': 'ohm' };
function prefixtrappan(el) {
  let tal = 382, pre = 'm', enh = 'H', anim = 1;
  const form = document.createElement('div'); form.className = 'rhb-omv';
  form.innerHTML = `<label>Tal <input inputmode="decimal" value="382" aria-label="Tal"></label>
<label>Prefix <select aria-label="Prefix">${PREFIX.filter((p) => p[0]).map(([p, n]) => `<option value="${p}"${p === 'm' ? ' selected' : ''}>${p} (${n})</option>`).join('')}</select></label>
<label>Enhet <select aria-label="Enhet">${Object.keys(ENHET).map((e) => `<option${e === 'H' ? ' selected' : ''}>${e}</option>`).join('')}</select></label>`;
  el.append(form);
  const txt = forklaring(el);
  const d = duk(el, (w) => (w < 560 ? 250 : 220), (ctx, w, h) => {
    const n = PREFIX.length, sw = (w - 20) / n, i = PREFIX.findIndex((p) => p[0] === pre), bas = 3;
    // trappan
    PREFIX.forEach(([p, namn, e], k) => {
      const x = 10 + k * sw, akt = k === i, grund = k === bas;
      ctx.save(); ctx.fillStyle = grund ? '#e6f3ec' : akt ? '#fff3cd' : C.soft; ctx.strokeStyle = grund ? C.ok : akt ? C.gold : C.line; ctx.lineWidth = akt || grund ? 3 : 1.5;
      ctx.beginPath(); ctx.roundRect(x + 4, 10, sw - 8, 66, 10); ctx.fill(); ctx.stroke(); ctx.restore();
      text(ctx, p + enh, x + sw / 2, 32, { size: 20, weight: 'bold', color: grund ? C.ok : C.ink, align: 'center' });
      text(ctx, e ? `10${String(e).replace('-', '⁻').replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c])}` : '1', x + sw / 2, 58, { size: 15, color: C.muted, align: 'center' });
      if (k < n - 1) text(ctx, sw < 110 ? '×1000' : '×1 000 →', x + sw, 92, { size: 14, color: C.muted, align: 'center' });
    });
    // pilen från valt prefix till grundenheten
    const xa = 10 + i * sw + sw / 2, xb = 10 + bas * sw + sw / 2, steg = Math.abs(bas - i);
    if (steg) pil(ctx, xa, 112, xa + (xb - xa) * anim, 112, C.red, 3);
    // talet med kommat som flyttar
    const e = PREFIX[i][2], v = tal * 10 ** e;
    const s1 = `${sv(tal, 6)} ${pre}${enh}`, s2 = `${sv(v, 12)} ${enh}`;
    text(ctx, s1, w / 2, 150, { size: 22, weight: 'bold', color: C.ink, align: 'center' });
    text(ctx, '=', w / 2, 180, { size: 18, color: C.muted, align: 'center' });
    ctx.globalAlpha = anim; text(ctx, s2, w / 2, 208, { size: 24, weight: 'bold', color: C.ok, align: 'center' }); ctx.globalAlpha = 1;
  });
  const [inp, sp, se] = form.querySelectorAll('input,select');
  const upd = () => {
    const x = Number(inp.value.replace(',', '.').replace(/\s/g, ''));
    if (!Number.isFinite(x)) { txt.textContent = 'Skriv ett tal, till exempel 382 eller 16,7.'; return; }
    tal = x; pre = sp.value; enh = se.value; const e = PREFIX.find((p) => p[0] === pre)[2], steg = Math.abs(e) / 3;
    const riktning = e < 0 ? 'vänster (talet blir mindre)' : 'höger (talet blir större)';
    txt.innerHTML = `${pre} betyder ${e < 0 ? `10<sup>${e}</sup>` : '1 000'}. Från ${pre}${enh} till ${enh} är det ${steg} steg i trappan, så kommat flyttar <b>${3 * steg} platser åt ${riktning}</b>:<br>` +
      `<b>${sv(x, 6)} ${pre}${enh} = ${sv(x, 6)} · ${e === 3 ? '1 000' : e === -3 ? '0,001' : `10<sup>${e}</sup>`} ${enh} = ${sv(x * 10 ** e, 12)} ${enh}</b>. På räknaren: ${sv(x, 6)}, tiopotensknappen ×10ˣ och ${String(e).replace('-', '−')}.`;
    if (minskaRorelse) { anim = 1; d.rita(); return; }
    const t0 = performance.now(); const steg2 = (t) => { anim = Math.min(1, (t - t0) / 600); d.rita(); if (anim < 1) requestAnimationFrame(steg2); }; requestAnimationFrame(steg2);
  };
  inp.addEventListener('input', upd); sp.addEventListener('change', upd); se.addEventListener('change', upd);
  knappar(el, [['382 mH', [382, 'm', 'H']], ['47 µF', [47, 'µ', 'F']], ['16,7 ms', [16.7, 'm', 's']], ['2,2 kΩ', [2.2, 'k', 'Ω']]], ([t, p, e]) => { inp.value = sv(t, 3); sp.value = p; se.value = e; upd(); });
  upd();
}

export function monteraBilder() {
  const B = { radianen, 'varv-sinus': frånVarvTillSinus, raknaren, fasvinkeln, prefixtrappan };
  for (const el of document.querySelectorAll('[data-bild]')) { try { B[el.dataset.bild](el); } catch (e) { el.insertAdjacentHTML('beforeend', '<p class="rhb-text">Bilden kunde inte ritas i den här webbläsaren. Texten ovan gäller ändå.</p>'); } }
}
