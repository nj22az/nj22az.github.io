// Hållkretslabbet · interaktion och ritning
import { solve, meter, fmt, parseAnswer, isClose } from './model.mjs';
import { FAULTS } from './model.mjs';
import { markHtml } from '../gemensamt/markering.mjs?v=20260928';
import { POINTS, FAULT_TEXT, DEFAULTS, CHALLENGES, run, expected } from './lessons.mjs';
import { mountProtocol } from '../gemensamt/labbprotokoll.mjs?v=20260926';
import { STATION_C_PROTOKOLL } from './stationC-protokoll.mjs?v=20260926';

const $ = (id) => document.getElementById(id);
const K = { blue: '#064f91', orange: '#c8641e', green: '#0e7c5a', red: '#b8323c', ink: '#163248', muted: '#6b7f90', grid: '#dfe7ee' };
const STORE = 'sjoskolan-hallkrets-v1';
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const state = { s: { ...DEFAULTS }, challenge: null, attempts: 0, solved: load(), module: 0, revealed: false };
// Felmodul: ett slumpat fel (eller inget) som eleven ska hitta genom att mäta, som instruktörens felmoduler på stationen
const hidden = () => Boolean(state.challenge?.hideFault || (state.module && !state.revealed));
// Felmodulerna dras utan återläggning, som en låda med moduler: samma fel kommer inte två gånger i rad.
let bag = [];
function newModule() {
  if (!bag.length) bag = [...FAULTS].sort(() => Math.random() - 0.5);
  state.module += 1; state.revealed = false;
  state.s = { ...state.s, U: 12, s0: false, s1: false, k1: false, supply: true };
  update({ fault: bag.pop() });
}
function load() { try { return new Set(JSON.parse(localStorage.getItem(STORE) || '[]')); } catch { return new Set(); } }
function save() { try { localStorage.setItem(STORE, JSON.stringify([...state.solved])); } catch { /* blockerad */ } }
const masked = (k) => Boolean(state.challenge?.mask.includes(k));

/** Nytt läge: räkna om med tidigare K1-läge så att hållningen följer med. */
function update(patch) { const s = { ...state.s, ...patch }; const r = solve(s, state.s.k1); state.s = { ...s, k1: r.k1 }; render(); }

// ---------- SVG ----------
function txt(x, y, t, { color = K.ink, size = 15, anchor = 'start', weight = 400 } = {}) {
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-weight="${weight}" dominant-baseline="middle">${esc(t).replace(/_\{([^}]*)\}/g, '<tspan baseline-shift="sub" font-size="75%">$1</tspan>')}</text>`;
}
const ln = (x1, y1, x2, y2, c = K.ink, w = 3, dash = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
function contact(x1, x2, y, closed, live, { nc = false, label = '', below = false, broken = false } = {}) {
  const c = live ? K.orange : K.ink, w = live ? 5 : 3; let b = ln(x1, y, x1 + 16, y, c, w) + ln(x2 - 16, y, x2, y, c, w);
  if (nc) b += ln(x2 - 16, y, x2 - 16, y - 22, c, w);
  const e = nc ? (closed ? [x2 - 10, y - 26] : [x2 - 30, y + 6]) : (closed ? [x2 - 16, y] : [x2 - 20, y - 26]);
  b += ln(x1 + 16, y, e[0], e[1], broken ? K.red : c, w);
  b += `<circle cx="${x1 + 16}" cy="${y}" r="3.5" fill="${K.ink}"/><circle cx="${x2 - 16}" cy="${y}" r="3.5" fill="${K.ink}"/>`;
  return b + txt((x1 + x2) / 2, below ? y + 26 : y - 40, label, { size: 14, anchor: 'middle', weight: 700, color: broken ? K.red : K.ink });
}
const XY = { P: [60, 150], a: [230, 150], b: [450, 150], c: [610, 150], N: [690, 150] };
function schematic(s0, r) {
  const s = hidden() ? { ...s0, fault: 'ingen' } : s0; // felet visas inte grafiskt under diagnosuppgiften
  const Y = 150, YU = 80, YD = 225, live = r.I > 1e-9 && !masked('nodes');
  const up = live && s.s1, down = live && s.k1 && s.fault !== 'hall';
  let b = '';
  b += txt(22, Y - 36, `+${s.U} V`, { size: 15, weight: 700, color: s.supply ? K.ink : K.muted });
  if (!s.supply) b += txt(22, Y + 36, 'från', { size: 13, color: K.red });
  b += ln(XY.P[0], Y, 110, Y, live ? K.orange : K.ink, live ? 5 : 3);
  b += contact(110, 190, Y, !s.s0 && s.fault !== 's0', live, { nc: true, label: 'S0 STOPP', broken: s.fault === 's0' });
  b += ln(190, Y, 300, Y, live ? K.orange : K.ink, live ? 5 : 3);
  b += ln(300, Y, 300, YU, up ? K.orange : K.ink, up ? 5 : 3) + ln(300, YU, 330, YU, up ? K.orange : K.ink, up ? 5 : 3);
  b += contact(330, 410, YU, s.s1, up, { label: 'S1 START' });
  b += ln(410, YU, 440, YU, up ? K.orange : K.ink, up ? 5 : 3) + ln(440, YU, 440, Y, up ? K.orange : K.ink, up ? 5 : 3);
  b += ln(300, Y, 300, YD, down ? K.orange : K.ink, down ? 5 : 3) + ln(300, YD, 330, YD, down ? K.orange : K.ink, down ? 5 : 3);
  b += contact(330, 410, YD, s.k1 && s.fault !== 'hall', down, { label: 'K1 NO', below: true, broken: s.fault === 'hall' });
  b += ln(410, YD, 440, YD, down ? K.orange : K.ink, down ? 5 : 3) + ln(440, YD, 440, Y, down ? K.orange : K.ink, down ? 5 : 3);
  b += ln(440, Y, 500, Y, live ? K.orange : K.ink, live ? 5 : 3);
  b += `<rect x="500" y="${Y - 22}" width="80" height="44" rx="4" fill="${s.k1 ? '#fde9d6' : '#fff'}" stroke="${live ? K.orange : K.ink}" stroke-width="${live ? 4 : 3}"/>` + txt(540, Y, 'K1', { size: 17, anchor: 'middle', weight: 700 });
  if (s.fault === 'spole') b += `<path d="M528,${Y - 12} L552,${Y + 12} M552,${Y - 12} L528,${Y + 12}" stroke="${K.red}" stroke-width="3"/>`;
  b += ln(580, Y, 640, Y, live ? K.orange : K.ink, live ? 5 : 3);
  if (s.fault === 'retur') b += ln(640, Y, 652, Y) + `<path d="M656,${Y - 9} L668,${Y + 9} M668,${Y - 9} L656,${Y + 9}" stroke="${K.red}" stroke-width="3"/>` + ln(672, Y, XY.N[0], Y);
  else b += ln(640, Y, XY.N[0], Y, live ? K.orange : K.ink, live ? 5 : 3);
  b += txt(XY.N[0] + 8, Y - 36, '0 V', { size: 15, weight: 700, anchor: 'end' });
  // mätpunkter och sonder
  for (const [n, [x, y]] of Object.entries(XY)) {
    const probe = s.red === n ? K.red : s.black === n ? K.ink : null;
    b += `<circle cx="${x}" cy="${y}" r="${probe ? 8 : 5}" fill="${probe || '#fff'}" stroke="${K.ink}" stroke-width="2"/>`;
    if (n !== 'P' && n !== 'N') b += txt(x, y + 24, n, { size: 15, anchor: 'middle', weight: 700, color: K.blue });
  }
  b += txt(360, 300, s.k1 ? 'K1 dragen' : 'K1 släppt', { size: 16, anchor: 'middle', weight: 700, color: s.k1 ? K.green : K.muted });
  return `<figure class="fig wide"><figcaption>Hållkrets med S0 STOPP (NC), S1 START (NO) och K1:s hjälpkontakt (NO)</figcaption><svg viewBox="0 0 720 320" role="img" aria-label="Hållkrets. K1 är ${s.k1 ? 'dragen' : 'släppt'}.">${b}</svg></figure>`;
}

// ---------- reglage ----------
function renderControls() {
  const s = state.s, locked = Boolean(state.challenge);
  const opt = (obj, cur) => Object.entries(obj).map(([k, v]) => `<option value="${k}"${k === cur ? ' selected' : ''}>${esc(v)}</option>`).join('');
  $('controls').innerHTML = `
    <div class="control btn-row">
      <button type="button" id="b-s1" class="toggle" aria-pressed="${s.s1}">S1 START: ${s.s1 ? 'intryckt' : 'släppt'}</button>
      <button type="button" id="b-s0" class="toggle" aria-pressed="${s.s0}">S0 STOPP: ${s.s0 ? 'intryckt' : 'släppt'}</button>
    </div>
    <div class="control control-check"><label class="check"><input type="checkbox" id="c-supply"${s.supply ? ' checked' : ''}> Styrspänning till</label></div>
    <div class="control control-select"><label for="c-fault">Inlagt fel</label><select id="c-fault">${state.challenge?.hideFault ? '<option>Okänt fel</option>' : (state.module ? `<option value="modul" selected>Felmodul ${state.module}: ${state.revealed ? esc(FAULT_TEXT[s.fault]) : 'okänt fel'}</option>` : '') + opt(FAULT_TEXT, state.module ? '' : s.fault) + '<option value="ny">Ny felmodul (okänt fel)</option>'}</select></div>
    ${state.module && !state.revealed && !state.challenge ? '<div class="control"><button type="button" id="b-reveal" class="toggle">Visa felmodulens fel</button></div>' : ''}
    <div class="control control-select"><label for="c-U">Styrspänning</label><select id="c-U">${opt({ 24: '24 V DC (labbets standard)', 12: '12 V DC (som stationsriggen)' }, String(s.U))}</select></div>
    <div class="control control-select"><label for="c-red">Röd sond</label><select id="c-red">${opt(POINTS, s.red)}</select></div>
    <div class="control control-select"><label for="c-black">Svart sond</label><select id="c-black">${opt(POINTS, s.black)}</select></div>`;
  $('b-s1').onclick = () => update({ s1: !state.s.s1 });
  $('b-s0').onclick = () => update({ s0: !state.s.s0 });
  $('c-supply').onchange = (e) => update({ supply: e.target.checked });
  $('c-fault').onchange = (e) => { if (e.target.value === 'ny') return newModule(); if (e.target.value === 'modul') return; state.module = 0; state.revealed = false; update({ fault: e.target.value }); };
  $('c-U').onchange = (e) => update({ U: Number(e.target.value) });
  if ($('b-reveal')) $('b-reveal').onclick = () => { state.revealed = true; render(); };
  $('c-red').onchange = (e) => update({ red: e.target.value });
  $('c-black').onchange = (e) => update({ black: e.target.value });
  $('controls').querySelectorAll('button,select,input').forEach((el) => { el.disabled = locked; });
  $('lock-note').hidden = !locked;
}
function render() {
  const s = state.s; const r = solve(s, s.k1);
  $('figures').innerHTML = schematic(s, r);
  const m = meter(r.V, s.red, s.black);
  const pot = (n) => (masked('nodes') ? '?' : Number.isFinite(r.V[n]) ? `${fmt(r.V[n])} V` : 'flytande*');
  const items = [
    ['Mätare', masked('meter') ? '?' : Number.isFinite(m) ? `${fmt(m)} V` : 'flytande*', `röd ${s.red}, svart ${s.black === 'N' ? '0 V' : s.black}`],
    ['Spolström', masked('I') ? '?' : `${fmt(r.I * 1000)} mA`, `spolen ${s.R} Ω`],
    ['a', pot('a'), 'efter S0'], ['b', pot('b'), 'spolens matningssida'], ['c', pot('c'), 'spolens retursida'],
  ];
  $('readouts').innerHTML = items.map(([k, v, d]) => `<div class="${v === '?' ? 'hidden-value' : ''}"><dt>${esc(k)}</dt><dd><strong>${esc(v)}</strong><span>${esc(d)}</span></dd></div>`).join('');
  const floating = !masked('nodes') && (!Number.isFinite(m) || ['a', 'b', 'c'].some((n) => !Number.isFinite(r.V[n])));
  $('principle').textContent = (floating ? '* Flytande: punkten är inte förbunden med matning eller retur. En verklig mätare visar då ungefär 0 V eller ett ostadigt värde. ' : '') + (state.module && !state.revealed ? `Felmodul ${state.module} är isatt. Felet är okänt. Mät, skriv observation, hypotes och kontroll i labbprotokollet och visa sedan felet.` : s.fault !== 'ingen' && !hidden()
    ? `Inlagt fel: ${FAULT_TEXT[s.fault]}. Mät mellan två punkter i taget och jämför med vad kretsen borde visa.`
    : 'S0 ligger i serie före båda grenarna. S1 och K1:s hjälpkontakt ligger parallellt. När K1 drar håller hjälpkontakten kretsen sluten även när START släpps. Försvinner styrspänningen släpper K1 och startar inte själv igen.');
  renderControls();
}

// ---------- uppgifter ----------
function renderSelect() {
  $('challenge-select').innerHTML = '<option value="">Välj uppgift …</option>' + CHALLENGES.map((c) => `<option value="${c.id}"${state.challenge?.id === c.id ? ' selected' : ''}>${state.solved.has(c.id) ? '✓ ' : ''}${esc(c.title)}</option>`).join('');
  $('progress').textContent = `${CHALLENGES.filter((c) => state.solved.has(c.id)).length} av ${CHALLENGES.length} klara`;
}
function start(id) {
  const c = CHALLENGES.find((x) => x.id === id); if (!c) return leave();
  state.challenge = c; state.attempts = 0; state.s = run(c.steps).s; state.module = 0; state.revealed = false;
  $('challenge-body').hidden = false; $('challenge-intro').hidden = true;
  $('challenge-deck').textContent = c.deck; $('challenge-task').innerHTML = markHtml(c.task);
  $('answer-label').innerHTML = `${markHtml(c.ask.label)} =`; $('answer-unit').textContent = c.ask.unit;
  $('answer').value = ''; $('hint-text').innerHTML = markHtml(c.hint); $('hint').open = false;
  $('feedback').className = 'feedback'; $('feedback').textContent = ''; $('show-answer').hidden = true;
  renderSelect(); render(); url();
}
function leave() { state.challenge = null; $('challenge-body').hidden = true; $('challenge-intro').hidden = false; renderSelect(); render(); url(); }
function finish(ok, msg) {
  const c = state.challenge; const e = expected(c);
  if (ok) { state.solved.add(c.id); save(); }
  state.challenge = null;
  $('feedback').className = `feedback ${ok ? 'ok' : 'info'}`;
  $('feedback').innerHTML = `<strong>${msg}</strong> ${markHtml(c.ask.label)} = ${fmt(e, 4)} ${esc(c.ask.unit)}.<br><span class="solution">${markHtml(c.solution)}</span><br>Knapparna är nu upplåsta. Prova själv.`;
  $('show-answer').hidden = true; renderSelect(); render();
}
$('answer-form').addEventListener('submit', (ev) => {
  ev.preventDefault(); const c = state.challenge; if (!c) return;
  const a = parseAnswer($('answer').value); const fb = $('feedback');
  if (!Number.isFinite(a)) { fb.className = 'feedback warn'; fb.textContent = 'Skriv ett tal, till exempel 24.'; return; }
  const e = expected(c); if (isClose(a, e, c.ask)) return finish(true, 'Rätt!');
  state.attempts += 1; let msg = 'Inte ännu. ';
  const typ = (c.mistakes || []).find((m) => isClose(a, m.v, { rel: 0.02, abs: 0.01 }));
  msg += typ ? typ.msg : 'Följ strömvägen och ange potentialen på mätpunkternas båda sidor.';
  if (state.attempts >= 2) { $('hint').open = true; $('show-answer').hidden = false; }
  fb.className = 'feedback warn'; fb.textContent = msg;
});
$('show-answer').addEventListener('click', () => finish(false, 'Facit:'));
$('leave').addEventListener('click', leave);
$('challenge-select').addEventListener('change', (e) => (e.target.value ? start(e.target.value) : leave()));
$('reset').addEventListener('click', () => { if (state.challenge) return; state.s = { ...DEFAULTS }; state.module = 0; state.revealed = false; render(); });
function url() { const p = new URLSearchParams(); if (state.challenge) p.set('uppgift', state.challenge.id); try { history.replaceState(null, '', p.toString() ? `?${p}` : location.pathname); } catch { /* */ } }

renderSelect(); render();
const q = new URLSearchParams(location.search).get('uppgift'); if (q) start(q);

// Labbprotokoll för Station C
mountProtocol(document.getElementById('labbprotokoll'), { ...STATION_C_PROTOKOLL,
  presets: [{ label: 'Ny felmodul (okänt fel)', apply: () => { if (state.challenge) leave(); newModule(); }, done: 'En ny felmodul är isatt. Felet visas inte förrän du väljer ”Visa felmodulens fel”.' },
    { label: 'Stationsrigg 12 V utan fel', apply: () => { if (state.challenge) leave(); state.module = 0; state.revealed = false; state.s = { ...DEFAULTS, U: 12 }; render(); }, done: 'Kretsen är i vila med 12 V styrspänning och utan fel.' }],
  snapshot(plan) {
    if (masked('meter') || masked('I')) return { error: 'Lös uppgiften först. Mätvärdena är dolda medan du räknar.' };
    const s = state.s, r = solve(s, s.k1), n = plan?.need || {};
    const states = { vila: !s.s0 && !s.s1 && !s.k1, start: s.s1 && s.k1, hall: !s.s1 && !s.s0 && s.k1 };
    const stateText = { vila: 'kretsen i vila (K1 släppt, inga knappar intryckta)', start: 'START intryckt och K1 dragen', hall: 'START släppt och K1 dragen' };
    const nr = STATION_C_PROTOKOLL.rows.indexOf(plan) + 1;
    if (n.red && (s.red !== n.red || s.black !== n.black)) { const nm = (x) => (x === 'P' ? '+U' : x === 'N' ? '0 V' : x); return { error: `Mätning ${nr} gäller röd sond på ${nm(n.red)} och svart på ${nm(n.black)}.` }; }
    if (n.state && !states[n.state]) return { error: `Mätning ${nr} gäller ${stateText[n.state]}. Använd START och STOPP först.` };
    if ((state.module || s.fault !== 'ingen') && nr) return { error: 'Mätning 1–7 gäller kretsen utan fel. Resultat från felmodulen skriver du i felsökningsdelen. Välj ”Stationsrigg 12 V utan fel”. Felmodulerna hör till felsökningsdelen.' };
    const drift = `${s.U} V, S0 ${s.s0 ? 'intryckt' : 'släppt'}, S1 ${s.s1 ? 'intryckt' : 'släppt'}, K1 ${s.k1 ? 'dragen' : 'släppt'}, styrspänning ${s.supply ? 'till' : 'från'}, ${state.module ? `felmodul ${state.module}` : FAULT_TEXT[s.fault].toLowerCase()}`;
    if (plan?.q === 'I') return { punkter: 'spolström', drift, varde: `${fmt(r.I * 1000)} mA` };
    const m = meter(r.V, s.red, s.black);
    const name = (n) => (n === 'P' ? '+U' : n === 'N' ? '0 V' : n);
    return { punkter: `röd ${name(s.red)} / svart ${name(s.black)}`, drift, varde: Number.isFinite(m) ? `${fmt(m)} V` : 'flytande (≈ 0 V, ostadigt)' };
  } });
