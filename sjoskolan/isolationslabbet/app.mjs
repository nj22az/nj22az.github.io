// Isolationslabbet · interaktion och ritning
import { itNet, insulationTest, fmt, fmtR, fmtI, parseAnswer, isClose, OBJECTS, PAIRS, PHASES, SOLID_LIMIT } from './model.mjs';
import { markHtml } from '../gemensamt/markering.mjs?v=20260928';
import { DEFAULTS, CHALLENGES, expected } from './lessons.mjs';
import { ISO_PROTOKOLL, LAGEN } from './protokoll.mjs?v=20260927';
import { mountProtocol } from '../gemensamt/labbprotokoll.mjs?v=20260926';

const $ = (id) => document.getElementById(id);
const K = { blue: '#064f91', orange: '#c8641e', green: '#176844', red: '#b8323c', ink: '#163248', muted: '#4d6579', line: '#cad8e2' };
const STORE = 'sjoskolan-isolation-v1';
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const state = { s: { ...DEFAULTS }, lage: null, challenge: null, attempts: 0, solved: load() };
function load() { try { return new Set(JSON.parse(localStorage.getItem(STORE) || '[]')); } catch { return new Set(); } }
function save() { try { localStorage.setItem(STORE, JSON.stringify([...state.solved])); } catch { /* blockerad */ } }
const masked = (k) => Boolean(state.challenge?.mask.includes(k));
function update(patch, keepLage = false) { state.s = { ...state.s, ...patch }; if (!keepLage) state.lage = null; render(); }

const R_OPTIONS = [[10e6, '10 MΩ (god)'], [5e6, '5 MΩ'], [1e6, '1 MΩ'], [300e3, '300 kΩ'], [120e3, '120 kΩ'], [80e3, '80 kΩ'], [10e3, '10 kΩ'], [1e3, '1 kΩ'], [0, '0 Ω (fullständigt jordfel)']];
const opt = (pairs, cur) => pairs.map(([v, t]) => `<option value="${v}"${String(v) === String(cur) ? ' selected' : ''}>${esc(t)}</option>`).join('');

// ---------- figurer ----------
function txt(x, y, t, { color = K.ink, size = 15, anchor = 'start', weight = 400 } = {}) {
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-weight="${weight}" dominant-baseline="middle">${esc(t)}</text>`;
}
const ln = (x1, y1, x2, y2, c = K.ink, w = 3) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
function netFigure(s, r) {
  const hide = masked('net'); const ys = [70, 110, 150]; const hull = 300;
  let b = txt(20, 30, 'Generator 440 V (IT, stjärnpunkten isolerad från skrovet)', { weight: 700, size: 14 });
  PHASES.forEach((p, i) => { b += ln(60, ys[i], 680, ys[i]) + txt(40, ys[i], p, { weight: 700, anchor: 'end' }); });
  PHASES.forEach((p, i) => {
    const y = ys[i], x = 200 + i * 170, solid = s.R[i] <= SOLID_LIMIT, low = s.R[i] < 1e6;
    const col = solid ? K.red : low ? K.orange : K.ink;
    b += `<circle cx="${x}" cy="${y}" r="5" fill="${K.ink}"/>` + ln(x, y, x, 190, col) + `<rect x="${x - 10}" y="190" width="20" height="46" fill="#fff" stroke="${col}" stroke-width="3"/>` + ln(x, 236, x, hull, col);
    b += txt(x + 16, 206, `R${i + 1}`, { size: 13, color: col, weight: 700 }) + txt(x + 16, 222, hide ? '?' : fmtR(s.R[i]), { size: 13, color: col, weight: 700 });
    if (s.C > 0) { const xc = x + 110; b += `<circle cx="${xc}" cy="${y}" r="4" fill="${K.muted}"/>` + ln(xc, y, xc, 206, K.muted, 2) + ln(xc - 12, 206, xc + 12, 206, K.muted, 2) + ln(xc - 12, 214, xc + 12, 214, K.muted, 2) + ln(xc, 214, xc, hull, K.muted, 2) + txt(xc + 16, 210, `C${i + 1}`, { size: 13, color: K.muted }); }
  });
  b += ln(60, hull, 680, hull, K.blue, 5) + txt(360, hull + 22, 'Skrov (PE)', { anchor: 'middle', weight: 700, color: K.blue });
  b += `<rect x="40" y="200" width="110" height="46" rx="6" fill="${r.alarm && !hide ? '#fde9e9' : '#fff'}" stroke="${K.ink}" stroke-width="2"/>` + txt(95, 215, 'IMD', { anchor: 'middle', weight: 700, size: 14 }) + txt(95, 233, hide ? '?' : r.alarm ? 'LARM' : 'normal', { anchor: 'middle', size: 13, weight: 700, color: r.alarm && !hide ? K.red : K.green });
  b += ln(95, 246, 95, hull, K.ink, 2) + ln(95, 200, 95, 150, K.ink, 2) + `<circle cx="95" cy="150" r="5" fill="${K.ink}"/>`;
  if (s.C > 0) b += txt(680, hull + 22, `C = ${fmt(s.C * 1e6)} µF per fas`, { size: 13, anchor: 'end', color: K.muted });
  return `<figure class="fig wide"><figcaption>IT-nät ombord: isolationsresistans och kapacitans mot skrovet</figcaption><svg viewBox="0 0 700 330" role="img" aria-label="IT-nät med tre faser, isolationsresistanser mot skrov och isolationsövervakning.">${b}</svg></figure>`;
}
function testFigure(s, t) {
  const [a, bb] = s.par.split('-');
  let b = `<rect x="440" y="70" width="200" height="150" rx="10" fill="#fff" stroke="${K.ink}" stroke-width="3"/>` + txt(540, 95, OBJECTS[s.obj].name.split(' (')[0], { anchor: 'middle', weight: 700, size: 14 });
  ['L1', 'L2', 'L3', 'PE'].forEach((n, i) => { const x = 470 + i * 45; const on = n === a || n === bb; b += `<circle cx="${x}" cy="190" r="${on ? 9 : 6}" fill="${on ? (n === a ? K.red : K.ink) : '#fff'}" stroke="${K.ink}" stroke-width="2"/>` + txt(x, 165, n, { anchor: 'middle', size: 13, weight: 700 }); });
  b += `<rect x="40" y="90" width="200" height="120" rx="12" fill="#f4c744" stroke="${K.ink}" stroke-width="3"/><rect x="60" y="105" width="160" height="50" rx="4" fill="#dfe8cf" stroke="${K.ink}"/>`;
  const shown = masked('prov') ? '?' : t.error ? '– – –' : t.over ? '> 999 MΩ' : fmtR(t.R);
  b += txt(140, 130, shown, { anchor: 'middle', size: 20, weight: 700 }) + txt(140, 180, `ISOLATION ${s.Uprov} V`, { anchor: 'middle', size: 13, weight: 700 });
  const i1 = 470 + ['L1', 'L2', 'L3', 'PE'].indexOf(a) * 45, i2 = 470 + ['L1', 'L2', 'L3', 'PE'].indexOf(bb) * 45;
  b += `<path d="M240,140 C330,140 ${i1 - 60},250 ${i1},199" fill="none" stroke="${K.red}" stroke-width="4"/><path d="M240,170 C320,200 ${i2 - 40},280 ${i2},199" fill="none" stroke="${K.ink}" stroke-width="4"/>`;
  if (!s.frans) b += txt(540, 50, 'Inte frånskilt', { anchor: 'middle', color: K.red, weight: 700 });
  return `<figure class="fig wide"><figcaption>Isolationsprovning av ett frånskilt objekt</figcaption><svg viewBox="0 0 700 300" role="img" aria-label="Isolationsprovare ansluten mellan ${a} och ${bb}.">${b}</svg></figure>`;
}

// ---------- reglage ----------
function renderControls() {
  const s = state.s, locked = Boolean(state.challenge);
  let h = `<div class="control control-select"><label for="c-del">Del</label><select id="c-del">${opt([['overvakning', '1. Isolationsövervakning i IT-nät'], ['prov', '2. Isolationsprovning']], s.del)}</select></div>`;
  if (s.del === 'overvakning') {
    h += PHASES.map((p, i) => `<div class="control control-select"><label for="c-r${i}">Isolation ${p} mot skrov</label><select id="c-r${i}">${opt(R_OPTIONS, s.R[i])}</select></div>`).join('');
    h += `<div class="control control-select"><label for="c-c">Nätkapacitans per fas</label><select id="c-c">${opt([[0, '0 (bara resistans)'], [0.5e-6, '0,5 µF'], [1e-6, '1 µF'], [2e-6, '2 µF']], s.C)}</select></div>`;
    h += `<div class="control control-select"><label for="c-f">Frekvens</label><select id="c-f">${opt([[50, '50 Hz'], [60, '60 Hz']], s.f)}</select></div>`;
    h += `<div class="control control-select"><label for="c-larm">Larmgräns IMD</label><select id="c-larm">${opt([[50e3, '50 kΩ'], [100e3, '100 kΩ'], [300e3, '300 kΩ']], s.larm)}</select></div>`;
  } else {
    h += `<div class="control control-select"><label for="c-obj">Objekt</label><select id="c-obj">${opt(Object.entries(OBJECTS).map(([k, o]) => [k, o.name]), s.obj)}</select></div>`;
    h += `<div class="control control-select"><label for="c-par">Mät mellan</label><select id="c-par">${opt(PAIRS.map((p) => [p, p.replace('-', ' och ')]), s.par)}</select></div>`;
    h += `<div class="control control-select"><label for="c-u">Provspänning</label><select id="c-u">${opt([[250, '250 V DC'], [500, '500 V DC'], [1000, '1 000 V DC']], s.Uprov)}</select></div>`;
    h += `<div class="control control-check"><label class="check"><input type="checkbox" id="c-frans"${s.frans ? ' checked' : ''}> Frånskilt, låst och kontrollerat spänningslöst</label></div>`;
  }
  $('controls').innerHTML = h;
  $('c-del').onchange = (e) => update({ del: e.target.value });
  if (s.del === 'overvakning') {
    PHASES.forEach((_, i) => { $(`c-r${i}`).onchange = (e) => { const R = [...state.s.R]; R[i] = Number(e.target.value); update({ R }); }; });
    $('c-c').onchange = (e) => update({ C: Number(e.target.value) });
    $('c-f').onchange = (e) => update({ f: Number(e.target.value) });
    $('c-larm').onchange = (e) => update({ larm: Number(e.target.value) });
  } else {
    $('c-obj').onchange = (e) => update({ obj: e.target.value });
    $('c-par').onchange = (e) => update({ par: e.target.value }, state.lage === 'm3');
    $('c-u').onchange = (e) => update({ Uprov: Number(e.target.value) });
    $('c-frans').onchange = (e) => update({ frans: e.target.checked });
  }
  $('controls').querySelectorAll('select,input').forEach((el) => { el.disabled = locked; });
  $('lock-note').hidden = !locked;
}
function render() {
  const s = state.s;
  let items;
  if (s.del === 'overvakning') {
    const r = itNet(s), hide = masked('net');
    $('figures').innerHTML = netFigure(s, r);
    const v = (x) => (hide ? '?' : x);
    items = [
      ['Isolationsvärde (IMD)', v(fmtR(r.Riso)), `larmgräns ${fmtR(s.larm)}: ${hide ? '?' : r.alarm ? 'LARM' : 'inget larm'}`],
      ...PHASES.map((p, i) => [`${p} mot skrov`, v(`${fmt(r.Uhull[i] < 0.05 ? 0 : r.Uhull[i])} V`), i === 0 ? `normalt ${fmt(r.UF)} V` : '']),
      ['Ström i sämsta isolationen', v(fmtI(r.Ifault)), `genom R${r.faultPhase + 1}`],
      ['Andra jordfelet', v(r.second ? `${fmt(r.second.I / 1e3)} kA` : 'nej'), r.second ? `kortslutning ${PHASES[r.second.phases[0]]}–skrov–${PHASES[r.second.phases[1]]}` : 'bara ett fel eller inget'],
    ];
    $('principle').textContent = r.second
      ? 'Två jordfel på olika faser: strömmen går från den ena fasen genom skrovet till den andra. Det är en kortslutning, och skydden ska lösa.'
      : 'Isolationsövervakningen lägger en likspänning mellan nätet och skrovet och mäter hela nätets isolation. Alla faser leder parallellt. Vid ett fullständigt jordfel får skrovet samma potential som den felande fasen, och de friska faserna får huvudspänning mot skrovet.';
  } else {
    const t = insulationTest(s), hide = masked('prov');
    $('figures').innerHTML = testFigure(s, t);
    items = t.error ? [['Provning', 'stoppad', ''], ['Orsak', 'ej frånskilt', '']] : [
      ['Isolationsresistans', hide ? '?' : t.over ? '> 999 MΩ' : fmtR(t.R), `${s.par.replace('-', ' mot ')}, ${s.Uprov} V DC`],
      ['Läckström', hide ? '?' : fmtI(t.I), 'R = Uprov / Iläck'],
      ['Gräns enligt instruktion', 'minst 1 MΩ', 'mot PE, i denna labb'],
    ];
    $('principle').textContent = t.error || 'Provaren lägger en hög likspänning mellan två punkter på det frånskilda objektet och mäter läckströmmen. Fukt, smuts och skadad isolation ger större ström och lägre resistans. Anteckna provspänning, tid, temperatur och vad som var inkopplat, så att mätningen kan jämföras senare.';
  }
  $('readouts').innerHTML = items.map(([k, v, d]) => `<div class="${v === '?' ? 'hidden-value' : ''}"><dt>${esc(k)}</dt><dd><strong>${esc(v)}</strong><span>${esc(d)}</span></dd></div>`).join('');
  renderControls();
}

// ---------- uppgifter ----------
function renderSelect() {
  $('challenge-select').innerHTML = '<option value="">Välj uppgift …</option>' + CHALLENGES.map((c) => `<option value="${c.id}"${state.challenge?.id === c.id ? ' selected' : ''}>${state.solved.has(c.id) ? '✓ ' : ''}${esc(c.title)}</option>`).join('');
  $('progress').textContent = `${CHALLENGES.filter((c) => state.solved.has(c.id)).length} av ${CHALLENGES.length} klara`;
}
function start(id) {
  const c = CHALLENGES.find((x) => x.id === id); if (!c) return leave();
  state.challenge = c; state.attempts = 0; state.lage = null; state.s = { ...DEFAULTS, ...c.set };
  $('challenge-body').hidden = false; $('challenge-intro').hidden = true;
  $('challenge-deck').textContent = c.deck; $('challenge-task').innerHTML = markHtml(c.task);
  $('answer-label').innerHTML = `${markHtml(c.ask.label)} =`; $('answer-unit').textContent = c.ask.unit;
  $('answer').value = ''; $('hint-text').innerHTML = markHtml(c.hint); $('hint').open = false;
  $('feedback').className = 'feedback'; $('feedback').textContent = ''; $('show-answer').hidden = true;
  renderSelect(); render(); url();
}
function leave() { state.challenge = null; $('challenge-body').hidden = true; $('challenge-intro').hidden = false; renderSelect(); render(); url(); }
function finish(ok, msg) {
  const c = state.challenge, e = expected(c);
  if (ok) { state.solved.add(c.id); save(); }
  state.challenge = null;
  $('feedback').className = `feedback ${ok ? 'ok' : 'info'}`;
  $('feedback').innerHTML = `<strong>${msg}</strong> ${markHtml(c.ask.label)} = ${fmt(e, 3)} ${esc(c.ask.unit)}.<br><span class="solution">${markHtml(c.solution)}</span><br>Reglagen är nu upplåsta. Prova själv.`;
  renderSelect(); render();
}
$('answer-form').addEventListener('submit', (ev) => {
  ev.preventDefault(); const c = state.challenge; if (!c) return;
  const a = parseAnswer($('answer').value), fb = $('feedback');
  if (!Number.isFinite(a)) { fb.className = 'feedback warn'; fb.textContent = 'Skriv ett tal, till exempel 0,75.'; return; }
  const e = expected(c); if (isClose(a, e, { rel: 0.02, abs: 0.005 })) return finish(true, 'Rätt!');
  state.attempts += 1;
  const typ = c.mistakes.find((m) => isClose(a, m.v, { rel: 0.02, abs: 0.005 }));
  if (state.attempts >= 2) { $('hint').open = true; $('show-answer').hidden = false; }
  fb.className = 'feedback warn'; fb.textContent = `Inte ännu. ${typ ? typ.msg : 'Kontrollera sambandet och enheten.'}`;
});
$('show-answer').addEventListener('click', () => finish(false, 'Facit:'));
$('leave').addEventListener('click', leave);
$('challenge-select').addEventListener('change', (e) => (e.target.value ? start(e.target.value) : leave()));
$('reset').addEventListener('click', () => { if (state.challenge) return; state.s = { ...DEFAULTS, del: state.s.del }; state.lage = null; render(); });
function url() { const p = new URLSearchParams(); if (state.challenge) p.set('uppgift', state.challenge.id); else if (state.s.del === 'prov') p.set('del', 'matning'); try { history.replaceState(null, '', p.toString() ? `?${p}` : location.pathname); } catch { /* */ } }

const params = new URLSearchParams(location.search);
if (params.get('del') === 'matning') state.s.del = 'prov';
renderSelect(); render();
if (params.get('uppgift')) start(params.get('uppgift'));

// ---------- labbprotokoll ----------
mountProtocol(document.getElementById('labbprotokoll'), { ...ISO_PROTOKOLL,
  presets: Object.entries(LAGEN).map(([k, l]) => ({ label: l.label, apply: () => { if (state.challenge) leave(); state.s = { ...DEFAULTS, ...l.set }; state.lage = k; render(); }, done: `Läget är inställt: ${l.text}.` })),
  snapshot(plan) {
    if (state.challenge) return { error: 'Lös eller lämna uppgiften först. Mätvärdena är dolda medan du räknar.' };
    const n = plan?.need || {}, nr = ISO_PROTOKOLL.rows.indexOf(plan) + 1;
    if (n.lage && state.lage !== n.lage) return { error: `Mätning ${nr} gäller läget ”${LAGEN[n.lage].label}”. Tryck på den knappen först. Ändrar du ett reglage därefter behöver du trycka igen.` };
    const s = state.s;
    if (plan.q === 'prov') {
      if (s.par !== n.par) return { error: `Mätning ${nr} gäller ${n.par.replace('-', ' mot ')}. Välj det under ”Mät mellan”.` };
      const t = insulationTest(s); if (t.error) return { error: t.error };
      return { punkter: s.par.replace('-', ' / '), drift: `${LAGEN.m3.text}`, varde: t.over ? '> 999 MΩ' : fmtR(t.R) };
    }
    const r = itNet(s), drift = LAGEN[state.lage].text;
    if (plan.q === 'Riso') return { punkter: 'IMD', drift, varde: fmtR(r.Riso) };
    if (plan.q === 'U1') return { punkter: 'L1 / skrov', drift, varde: `${fmt(r.Uhull[0])} V` };
    if (plan.q === 'U2') return { punkter: 'L2 / skrov', drift, varde: `${fmt(r.Uhull[1])} V` };
    if (plan.q === 'Ifel') return { punkter: 'tång runt felstället', drift, varde: fmtI(r.Ifault) };
    return { error: 'Ingen avläsning för denna rad.' };
  } });
