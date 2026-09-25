// Sjöskolan · labbprotokoll som fylls i medan simulatorn används.
// Samma protokoll för alla simulerade stationer: kontroller före start, mätningar med förväntat och uppmätt värde,
// felsökning (observation → hypotes → kontroll), analys, utskrift, CSV och ett ifyllt exempel.
// Beräkningsdelarna saknar DOM-beroenden och testas i labbprotokoll.test.mjs.

/** Läser ett tal ur text med decimalkomma och eventuell enhet: "11,94 V" → 11.94. */
export function parseNum(text) {
  const m = String(text ?? '').replace(/[\s  ]/g, '').replace(/[−–]/g, '-').replace(',', '.').match(/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?/i);
  return m ? Number(m[0]) : NaN;
}

/** Enheten efter talet, t.ex. "kΩ" i "1,004 kΩ". Tom sträng om ingen enhet anges. */
export function unitOf(text) {
  const m = String(text ?? '').replace(/[\s\u00a0\u202f]/g, '').replace(/[−–]/g, '-').replace(',', '.').match(/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?([µumkM]?(V|A|Ω|s|Hz|W))/i);
  return m ? m[3].replace('u', 'µ') : '';
}

/** Avvikelse = uppmätt − förväntat, även i procent av förväntat värde. Olika enheter jämförs inte. */
export function deviation(expected, measured) {
  const e = parseNum(expected), u = parseNum(measured);
  if (!Number.isFinite(e) || !Number.isFinite(u)) return null;
  const ue = unitOf(expected), um = unitOf(measured);
  if (ue && um && ue !== um) return { mismatch: [ue, um] };
  return { abs: u - e, rel: e === 0 ? null : (u - e) / Math.abs(e) * 100 };
}

/** Svensk talformatering med rimligt antal decimaler. */
export function fmtNum(v, digits = 3) {
  if (!Number.isFinite(v)) return '–';
  if (Math.abs(v) < 1e-12) return '0';
  const d = Math.max(0, Math.min(4, digits - 1 - Math.floor(Math.log10(Math.abs(v)))));
  return v.toLocaleString('sv-SE', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');
}

/** Rimlighetskontroll av elevens egen avvikelse: stämmer den med uppmätt − förväntat? */
export function deviationMatches(own, expected, measured) {
  const d = deviation(expected, measured), o = parseNum(own);
  if (d?.mismatch) return 'enhet';
  if (!d || !Number.isFinite(o)) return null;
  const scale = Math.max(Math.abs(parseNum(expected)), Math.abs(parseNum(measured)));
  return Math.abs(o - d.abs) <= Math.max(0.02 * Math.abs(d.abs), 0.001 * scale, 1e-9);
}

export const ROW_FIELDS = [
  ['storhet', 'Mätstorhet'], ['punkter', 'Mätpunkter (röd / svart)'], ['drift', 'Driftläge och instrument'],
  ['forv', 'Förväntat värde'], ['uppm', 'Uppmätt värde'], ['avv', 'Avvikelse (uppmätt − förväntat)'],
  ['tol', 'Tolerans / gräns'], ['bed', 'Bedömning'], ['komm', 'Kommentar'],
];
export const FAULT_FIELDS = [
  ['obs', 'Observation'], ['hyp', 'Hypotes (möjlig orsak)'], ['kontroll', 'Kontroll som skiljer mellan orsakerna'],
  ['omsann', 'Förväntat resultat om hypotesen stämmer'], ['resultat', 'Resultat'], ['slutsats', 'Slutsats'],
];
export const BED = ['', 'Inom tolerans', 'Utanför tolerans', 'Kan inte avgöras'];
export const HEAD = [['namn', 'Namn'], ['datum', 'Datum'], ['rigg', 'Rigg / simulatorläge']];

// Storhet, mätpunkter och tolerans kommer från stationens mätplan och kan ändras. Förväntat värde skriver eleven själv.
const SEEDED = ['storhet', 'punkter', 'tol'];
const seedRow = (plan, row = {}) => { const r = { ...row }; for (const k of SEEDED) if (r[k] === undefined && plan[k]) r[k] = plan[k]; return r; };
export function emptyData(def) {
  return {
    head: {}, checks: {}, answers: {},
    rows: (def.rows || []).map((plan) => seedRow(plan)),
    faults: Array.from({ length: def.faults ?? 0 }, () => ({})),
  };
}

/** Vad saknas innan protokollet kan lämnas in? Returnerar en lista med korta texter. */
export function missing(def, data) {
  const out = [];
  if (!String(data.head?.namn || '').trim()) out.push('namn');
  const unchecked = (def.checks || []).filter((c) => !data.checks?.[c.k]).length;
  if (unchecked) out.push(`${unchecked} kontroll${unchecked > 1 ? 'er' : ''} före start`);
  const open = [], noNum = [];
  (def.rows || []).forEach((plan, i) => {
    const r = data.rows?.[i] || {};
    if (plan.optional) return;
    if (['forv', 'uppm', 'avv', 'tol', 'bed'].some((k) => !String(r[k] || '').trim())) open.push(i + 1);
    else if (!/\d/.test(r.forv)) noNum.push(i + 1);
  });
  if (open.length) out.push(`förväntat, uppmätt, avvikelse, tolerans och bedömning i mätning ${open.join(', ')}`);
  if (noNum.length) out.push(`ett förväntat värde med siffror i mätning ${noNum.join(', ')}`);
  if (def.faults) {
    const done = (data.faults || []).filter((f) => FAULT_FIELDS.every(([k]) => String(f[k] || '').trim())).length;
    if (done < (def.faultsRequired ?? 1)) out.push(`felsökning: minst ${def.faultsRequired ?? 1} helt ifylld rad`);
  }
  for (const q of (def.questions || []).filter((x) => !x.optional)) {
    const words = String(data.answers?.[q.k] || '').trim().split(/\s+/).filter(Boolean).length;
    if (q.requireText) { if (!words) out.push(q.short || q.label.toLowerCase()); }
    else if (words < (q.minWords ?? 8)) out.push(`${q.short || q.label.toLowerCase()} (minst ${q.minWords ?? 8} ord)`);
  }
  return out;
}

const csvCell = (v) => { let t = String(v ?? ''); if (/^[\s]*[=+\-@]/.test(t)) t = "'" + t; return '"' + t.replaceAll('"', '""') + '"'; };
export function protocolCSV(def, data) {
  const lines = [[def.title], [def.station || ''], []];
  for (const [k, l] of HEAD) lines.push([l, data.head?.[k] || '']);
  lines.push([], ['Kontroll före start', 'Klar']);
  for (const c of def.checks || []) lines.push([c.text, data.checks?.[c.k] ? 'Ja' : 'Nej']);
  lines.push([], ['Nr', ...ROW_FIELDS.map(([, l]) => l), 'Hämtat från simulatorn']);
  (data.rows || []).forEach((r, i) => lines.push([i + 1, ...ROW_FIELDS.map(([k]) => r[k] || ''), r.tid || '']));
  if (def.faults) {
    lines.push([], ['Nr', ...FAULT_FIELDS.map(([, l]) => l)]);
    (data.faults || []).forEach((f, i) => lines.push([i + 1, ...FAULT_FIELDS.map(([k]) => f[k] || '')]));
  }
  lines.push([]);
  for (const q of def.questions || []) lines.push([q.label, data.answers?.[q.k] || '']);
  return '﻿' + lines.map((row) => row.map(csvCell).join(';')).join('\r\n');
}

// ---------------------------------------------------------------- DOM

const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function formHTML(def, data, ro, idp) {
  // Exemplet visas som vanlig text, så att det går att läsa med skärmläsare och har full kontrast.
  const val = (v) => `<span class="lp-val">${esc(v) || '–'}</span>`;
  const inp = (path, v, label, attrs = '') => (ro ? val(v) : `<input data-p="${path}" value="${esc(v)}" aria-label="${esc(label)}"${attrs}>`);
  const ta = (path, v, label, attrs = '') => (ro ? val(v) : `<textarea data-p="${path}" aria-label="${esc(label)}"${attrs}>${esc(v)}</textarea>`);
  let h = `<div class="lp-head">${HEAD.map(([k, l]) => `<label>${l}${inp(`head.${k}`, data.head?.[k], l)}</label>`).join('')}</div>`;
  if (def.checks?.length) {
    h += `<h3>1. Före start</h3><p class="lp-help">${esc(def.checksIntro || 'Bocka av först när du har gjort kontrollen. I en fysisk station ger instruktören klartecken efter dessa kontroller.')}</p><ul class="lp-checks">`;
    h += def.checks.map((c) => (ro ? `<li><span class="lp-val">${data.checks?.[c.k] ? 'Klar' : 'Inte gjord'}</span> <span>${esc(c.text)}</span></li>` : `<li><label><input type="checkbox" data-p="checks.${c.k}"${data.checks?.[c.k] ? ' checked' : ''}> <span>${esc(c.text)}</span></label></li>`)).join('') + '</ul>';
  }
  if (def.rows?.length) {
    h += `<h3>2. Mätningar</h3><p class="lp-help">${esc(def.rowsIntro || 'Skriv förväntat värde innan du mäter. Mät sedan i simulatorn och tryck ”Hämta avläsning”. Avvikelse = uppmätt − förväntat.')}</p><ol class="lp-rows">`;
    def.rows.forEach((plan, i) => {
      const r = data.rows?.[i] || {};
      h += `<li class="lp-row" data-row="${i}"><div class="lp-row-head"><strong>Mätning ${i + 1}${plan.title ? ` · ${esc(plan.title)}` : ''}</strong>${plan.optional ? '<span class="lp-opt">frivillig</span>' : ''}`;
      if (!ro && def.snapshot !== false) h += `<button type="button" class="lp-fetch" data-row="${i}">Hämta avläsning</button>`;
      h += `</div><div class="lp-grid">`;
      for (const [k, defaultLabel] of ROW_FIELDS) {
        const l = plan.labels?.[k] || defaultLabel;
        const ph = plan[k] && !SEEDED.includes(k) ? ` placeholder="${esc(plan[k])}"` : '';
        if (k === 'bed' && ro) h += `<label>${l}${val(r.bed)}</label>`;
        else if (k === 'bed') h += `<label>${l}<select data-p="rows.${i}.bed">${(plan.bedOptions || BED).map((b) => `<option${(r.bed || '') === b ? ' selected' : ''} value="${b}">${b || 'Välj'}</option>`).join('')}</select></label>`;
        else if (k === 'komm') h += `<label class="lp-wide">${l}${ta(`rows.${i}.${k}`, r[k], `${l}, mätning ${i + 1}`, ph)}</label>`;
        else h += `<label>${l}${inp(`rows.${i}.${k}`, r[k], `${l}, mätning ${i + 1}`, ph)}${k === 'uppm' ? `<small class="lp-src" id="${idp}src${i}">${r.tid ? `Hämtat från simulatorn ${esc(r.tid)}` : ''}</small>` : ''}${k === 'avv' ? `<small class="lp-calc" id="${idp}calc${i}"></small>` : ''}</label>`;
      }
      h += '</div></li>';
    });
    h += '</ol>';
  }
  if (def.faults) {
    h += `<h3>3. Felsökning</h3><p class="lp-help">${esc(def.faultsIntro || 'Håll isär observation och hypotes. Välj en kontroll som ger olika resultat för olika orsaker, och skriv vad du väntar dig innan du mäter.')}</p><ol class="lp-rows">`;
    for (let i = 0; i < def.faults; i++) {
      const f = data.faults?.[i] || {};
      if (ro && !FAULT_FIELDS.some(([k]) => f[k])) continue; // tomma rader visas inte i exemplet
      h += `<li class="lp-row"><div class="lp-row-head"><strong>Fel ${i + 1}</strong></div><div class="lp-grid lp-grid-3">${FAULT_FIELDS.map(([k, l]) => `<label>${l}${ta(`faults.${i}.${k}`, f[k], `${l}, fel ${i + 1}`)}</label>`).join('')}</div></li>`;
    }
    h += '</ol>';
  }
  if (def.questions?.length) {
    h += `<h3>${def.faults ? 4 : 3}. Analys och slutsats</h3>`;
    h += def.questions.map((q) => `<label class="lp-q">${q.optional ? '<span class="lp-opt">Fördjupning, frivillig</span>' : ''}${esc(q.label)}${q.hint ? `<small>${esc(q.hint)}</small>` : ''}${ta(`answers.${q.k}`, data.answers?.[q.k], q.label)}</label>`).join('');
  }
  return h;
}

function setPath(obj, path, val) {
  const ks = path.split('.'); let o = obj;
  for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]] ??= /^\d+$/.test(ks[i + 1]) ? [] : {};
  o[ks.at(-1)] = val;
}

/**
 * Monterar protokollet i `root`.
 * def.presets: knappar som ställer in simulatorn som stationens rigg, [{ label, apply, done }].
 * def.snapshot(plan, i): funktion som returnerar { punkter, drift, varde } för aktuell avläsning i simulatorn,
 * eller { error } om det inte finns någon avläsning att hämta.
 */
export function mountProtocol(root, def) {
  const KEY = `sjoskolan-protokoll-${def.key}`;
  let data = emptyData(def), storageOK = true, confirmClear = false;
  // Optional station-specific migration preserves previous student entries.
  try { if (def.migrate && !localStorage.getItem(KEY)) { const migrated = def.migrate(localStorage); if (migrated) localStorage.setItem(KEY, JSON.stringify(migrated)); } } catch { storageOK = false; }
  try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d) data = { ...data, ...d, rows: (def.rows || []).map((plan, i) => seedRow(plan, d.rows?.[i] || {})), faults: Array.from({ length: def.faults ?? 0 }, (_, i) => d.faults?.[i] || {}) }; } catch { storageOK = false; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { storageOK = false; } };

  root.classList.add('lp');
  root.innerHTML = `
    <div class="lp-top"><div><p class="lp-kicker">${esc(def.station || 'Simulerad station')}</p><h2 id="${def.key}-title">${esc(def.title)}</h2>
    <p>${esc(def.intro || '')}</p></div>
    <div class="lp-actions"><button type="button" class="lp-print">Skriv ut / spara som PDF</button><button type="button" class="lp-csv">Ladda ner CSV</button><button type="button" class="lp-clear">Töm protokollet</button></div></div>
    ${def.presets?.length ? `<div class="lp-presets">${def.presets.map((p, i) => `<button type="button" data-preset="${i}">${esc(p.label)}</button>`).join('')}</div>` : ''}
    ${def.instrument ? `<p class="lp-instrument"><strong>Instrument och rigg:</strong> ${esc(def.instrument)}</p>` : ''}
    <p class="lp-msg" role="status" aria-live="polite"></p>
    <form class="lp-form" autocomplete="off">${formHTML(def, data, false, def.key)}</form>
    <p class="lp-status"></p>
    ${def.example ? `<details class="lp-example"><summary>Visa ifyllt exempel</summary><p class="lp-help">${esc(def.example.note || 'Exemplet visar hur ett fullständigt protokoll kan se ut. Dina egna värden och formuleringar ska komma från din egen mätning.')}</p><div class="lp-form lp-ro">${formHTML(def, def.example, true, def.key + 'ex')}</div></details>` : ''}
    <p class="lp-foot">${storageOK ? 'Det du skriver sparas bara i den här webbläsaren. Skriv ut eller spara som PDF för att lämna in.' : 'Webbläsaren tillåter inte lagring här. Skriv ut innan du stänger sidan.'} Ett simulerat protokoll är övning och underlag. Praktisk bedömning sker på en verklig rigg enligt lärarens plan.</p>`;
  root.setAttribute('aria-labelledby', `${def.key}-title`);
  const $ = (s) => root.querySelector(s);
  const msg = (t, warn = false) => { const el = $('.lp-msg'); el.textContent = t; el.classList.toggle('warn', warn); };

  function refresh() {
    (def.rows || []).forEach((_, i) => {
      const r = data.rows[i] || {}, el = root.querySelector(`#${def.key}calc${i}`); if (!el) return;
      const d = deviation(r.forv, r.uppm), ok = deviationMatches(r.avv, r.forv, r.uppm);
      el.textContent = ok === 'enhet' ? `Skriv förväntat och uppmätt med samma enhet (${d.mismatch.join(' och ')}).` : d && ok === false ? `Kontrollera: uppmätt − förväntat blir ${fmtNum(d.abs)}${d.rel === null ? '' : ` (${fmtNum(d.rel, 2)} %)`}.` : d && ok ? 'Stämmer med uppmätt − förväntat.' : '';
      el.classList.toggle('warn', ok === false || ok === 'enhet');
    });
    const m = missing(def, data);
    $('.lp-status').textContent = m.length ? `Saknas innan inlämning: ${m.join('; ')}.` : 'Protokollet är komplett. Skriv ut eller spara som PDF.';
    $('.lp-status').classList.toggle('done', !m.length);
  }
  const form = $('.lp-form');
  form.addEventListener('input', (e) => {
    const p = e.target.dataset.p; if (!p) return;
    setPath(data, p, e.target.type === 'checkbox' ? e.target.checked : e.target.value);
    const m = p.match(/^rows\.(\d+)\.uppm$/);
    if (m && data.rows[m[1]].tid) { data.rows[m[1]].tid = ''; root.querySelector(`#${def.key}src${m[1]}`).textContent = 'Ändrat för hand'; }
    save(); refresh();
  });
  form.addEventListener('click', (e) => {
    const b = e.target.closest('.lp-fetch'); if (!b) return;
    const i = Number(b.dataset.row), r = data.rows[i];
    if (!String(r.forv || '').trim()) { msg(`Räkna först: skriv förväntat värde i mätning ${i + 1} innan du hämtar avläsningen.`, true); root.querySelector(`[data-p="rows.${i}.forv"]`).focus(); return; }
    const s = def.snapshot?.(def.rows[i], i);
    if (!s || s.error) { msg(s?.error || 'Det finns ingen avläsning att hämta just nu.', true); return; }
    const t = new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    Object.assign(r, { punkter: s.punkter ?? r.punkter, drift: s.drift ?? r.drift, uppm: s.varde, tid: t });
    for (const k of ['punkter', 'drift', 'uppm']) root.querySelector(`[data-p="rows.${i}.${k}"]`).value = r[k] || '';
    root.querySelector(`#${def.key}src${i}`).textContent = `Hämtat från simulatorn ${t}`;
    msg(`Mätning ${i + 1}: ${s.varde} hämtat. Räkna avvikelsen och bedöm resultatet.`);
    save(); refresh();
  });
  // Kryssrutor och listor skickar change i vissa webbläsare
  form.addEventListener('change', (e) => {
    const p = e.target.dataset.p; if (!p || !(e.target.type === 'checkbox' || e.target.tagName === 'SELECT')) return;
    setPath(data, p, e.target.type === 'checkbox' ? e.target.checked : e.target.value); save(); refresh();
  });
  root.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => { const p = def.presets[b.dataset.preset]; p.apply(); msg(p.done || `${p.label}: klart.`); }));
  $('.lp-print').addEventListener('click', () => {
    const ex = $('.lp-example'); const open = ex?.open; if (ex) ex.open = false;
    document.body.classList.add('lp-printing'); window.print(); document.body.classList.remove('lp-printing'); if (ex) ex.open = open;
  });
  $('.lp-csv').addEventListener('click', () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([protocolCSV(def, data)], { type: 'text/csv;charset=utf-8' }));
    a.download = `${def.key}-protokoll.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('.lp-clear').addEventListener('click', (e) => {
    if (!confirmClear) { confirmClear = true; e.target.textContent = 'Ja, töm allt'; setTimeout(() => { confirmClear = false; e.target.textContent = 'Töm protokollet'; }, 4000); return; }
    data = emptyData(def); save(); form.innerHTML = formHTML(def, data, false, def.key); confirmClear = false; e.target.textContent = 'Töm protokollet'; msg('Protokollet är tömt.'); refresh();
  });
  refresh();
  return { get data() { return data; }, refresh };
}

