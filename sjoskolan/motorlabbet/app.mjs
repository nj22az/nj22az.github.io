// Motorlabbet: samma stationer som den fysiska labben vecka 41, för den som inte kan komma.
// Knapparna styr allt. 3D-bänken (scen.js) visar samma läge och går också att klicka i.
import { resistans, lindningar, avlasning, Y, DELTA, BLECK, PLINT, STARTARE, startareResistans, tang, felFor, helDelta } from './model.mjs?v=20260929';
import { mittD } from '../gemensamt/elevtal.mjs?v=20260930';

const D = mittD();
const R = lindningar(D);
const FEL = felFor(D);
const S = {
  station: 'M', bleck: [], losa: [], prob: { rod: null, svart: null }, kort: false,
  sprob: { rod: null, svart: null }, utlost: false,
  tang: { lage: 'ute', pa: false, nollstalld: false }, felsokning: false,
};
const $ = (q) => document.querySelector(q);
const status = (t) => { const el = $('#ml-status'); el.textContent = t; };
let scen = null;

function visningM() {
  if (S.kort) return avlasning(0);
  if (!S.prob.rod || !S.prob.svart) return 'OL';
  return avlasning(resistans(S.prob.rod, S.prob.svart, R, S.bleck, S.losa));
}
function visningS() {
  if (!S.sprob.rod || !S.sprob.svart) return 'OL';
  return avlasning(startareResistans(S.sprob.rod, S.sprob.svart, S.utlost));
}
const tangVisning = () => tang(S.tang.lage, 2.0, S.tang.pa, S.tang.nollstalld);
const sladdarUte = () => !S.prob.rod && !S.prob.svart && !S.kort;

function plintSvg() {
  const P = { W2: [60, 40], U2: [140, 40], V2: [220, 40], U1: [60, 120], V1: [140, 120], W1: [220, 120], PE: [290, 150] };
  let s = '<svg viewBox="0 0 320 175" role="img" aria-label="Plinten sedd uppifrån med blecken och mätsladdarna">';
  s += '<rect x="20" y="10" width="240" height="150" rx="10" fill="#f4f7fa" stroke="#8d9aa5"/>';
  const lind = [['U1', 'U2', '#1763a3'], ['V1', 'V2', '#c8641e'], ['W1', 'W2', '#0e7c5a']];
  for (const [a, b, c] of lind) s += `<path d="M${P[a][0]},${P[a][1]} L${P[b][0]},${P[b][1]}" stroke="${c}" stroke-width="2" stroke-dasharray="5 4" fill="none"/>`;
  for (const x of S.bleck) {
    const [a, b] = x.split('-'); const los = S.losa.includes(x);
    s += `<path d="M${P[a][0]},${P[a][1]} L${P[b][0]},${P[b][1]}" stroke="#b8942a" stroke-width="9" stroke-linecap="round" opacity="${los ? 0.45 : 1}"/>`;
  }
  for (const [t, [x, y]] of Object.entries(P)) {
    const f = S.prob.rod === t ? '#c0392b' : S.prob.svart === t ? '#1b1f23' : t === 'PE' ? '#2e8b57' : '#d8b24a';
    s += `<circle cx="${x}" cy="${y}" r="13" fill="${f}" stroke="#163248" stroke-width="2"/><text x="${x}" y="${y + (y < 80 ? -20 : 32)}" text-anchor="middle" font-size="15" font-weight="700" fill="#163248">${t}</text>`;
  }
  return s + '</svg>';
}

function knapp(txt, fn, extra = '') { return `<button type="button" class="sj-btn" ${extra} data-g="${fn}">${txt}</button>`; }
function valLista(namn, lista, vald) {
  return `<select data-val="${namn}"><option value="">Inte ansluten</option>${lista.map((t) => `<option ${t === vald ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
}

function panel() {
  const p = $('#ml-panel');
  if (S.station === 'M' || S.station === 'F') {
    const bleckKnappar = BLECK.map((x) => `<button type="button" class="ml-bleck" aria-pressed="${S.bleck.includes(x)}" data-bleck="${x}">${x.replace('-', '–')}</button>`).join('');
    p.innerHTML = `
      <h2>${S.station === 'F' ? 'Felsökning: hitta felet i plinten' : 'Station M: lindningar, Y och Δ'}</h2>
      ${S.station === 'F' ? '<p>Motorn ska vara Δ-kopplad, men något är fel. Mät de tre paren, skriv en hypotes, rätta felet och mät igen.</p>' : '<p>Mät lindningarna utan bleck. Lägg sedan blecken för Y och för Δ och mät mellan plintarna.</p>'}
      <div class="ml-plint">${plintSvg()}</div>
      <fieldset><legend>Blecken <span class="ml-tips">(bara med mätsladdarna bortkopplade)</span></legend>
        <div class="ml-rad">${bleckKnappar}</div>
        <div class="ml-rad">${knapp('Inga bleck', 'inga')}${knapp('Lägg Y', 'y')}${knapp('Lägg Δ', 'delta')}${S.station === 'F' ? knapp('Dra åt muttrarna', 'dra') : ''}</div></fieldset>
      <fieldset><legend>Multimetern, Ω</legend>
        <div class="ml-rad"><label>Röd ${valLista('rod', [...PLINT, 'PE'], S.prob.rod)}</label><label>Svart ${valLista('svart', [...PLINT, 'PE'], S.prob.svart)}</label></div>
        <div class="ml-rad">${knapp('Koppla bort sladdarna', 'bort')}${knapp('Håll spetsarna mot varandra', 'kort')}</div>
        <p class="ml-visning" aria-live="polite"><span>${visningM()}</span> Ω</p></fieldset>
      ${S.station === 'F' ? `<div class="ml-rad">${knapp('Starta om felet', 'nyttfel')}${knapp('Jag har rättat felet', 'kontroll', 'data-primar')}</div>` : ''}`;
  } else if (S.station === 'S') {
    p.innerHTML = `
      <h2>Station S: startaren</h2>
      <p>Startaren är aldrig ansluten. Mät spolen och kontakterna spänningslöst. Prova överlastreläets testknapp.</p>
      <fieldset><legend>Multimetern, Ω</legend>
        <div class="ml-rad"><label>Röd ${valLista('srod', STARTARE, S.sprob.rod)}</label><label>Svart ${valLista('ssvart', STARTARE, S.sprob.svart)}</label></div>
        <p class="ml-visning" aria-live="polite"><span>${visningS()}</span> Ω</p></fieldset>
      <fieldset><legend>Överlastreläet F2</legend>
        <div class="ml-rad">${knapp('Tryck på TEST', 'test')}${knapp('Återställ (RESET)', 'reset')}</div>
        <p>Läge: <strong>${S.utlost ? 'utlöst' : 'inte utlöst'}</strong></p></fieldset>`;
  } else {
    const lage = { ute: 'Sladden utanför käften', en: 'Sladden en gång genom käften', tva: 'Sladden två varv', harnal: 'Hårnål: ut och tillbaka' };
    p.innerHTML = `
      <h2>Station T: strömtången</h2>
      <p>DC-aggregatet driver 2,0 A genom en labbsladd (strömgräns, skyddsklenspänning). Flytta sladden bara med utgången avslagen.</p>
      <fieldset><legend>Sladden</legend><div class="ml-rad">${Object.entries(lage).map(([k, t]) => `<button type="button" class="ml-bleck" aria-pressed="${S.tang.lage === k}" data-lage="${k}">${t}</button>`).join('')}</div></fieldset>
      <fieldset><legend>Aggregat och tång</legend>
        <div class="ml-rad">${knapp(S.tang.pa ? 'Slå av utgången' : 'Slå på utgången', 'utgang')}${knapp('Nollställ tången (DC A)', 'noll')}</div>
        <p class="ml-visning" aria-live="polite"><span>${tangVisning()}</span> A</p>
        <p class="ml-tips">Aggregatet: ${S.tang.pa ? '2,00 A' : 'utgången av'}. Tången: ${S.tang.nollstalld ? 'nollställd' : 'inte nollställd'}.</p></fieldset>`;
  }
}

function uppdatera() {
  panel();
  for (const b of document.querySelectorAll('[data-station]')) b.setAttribute('aria-selected', String(b.dataset.station === S.station));
  scen?.set({ ...S, visningM: visningM(), visningS: visningS(), tang: { ...S.tang, visning: tangVisning() } });
}

function bleckAndring(fn) {
  if (!sladdarUte()) { status('Koppla bort mätsladdarna innan du flyttar blecken.'); return; }
  fn(); status('');
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.station) { S.station = b.dataset.station; if (S.station === 'F' && !S.felsokning) startaFel(); scen?.vy(S.station === 'F' ? 'M' : S.station); status(''); uppdatera(); return; }
  if (b.dataset.bleck) { const x = b.dataset.bleck; bleckAndring(() => { S.bleck = S.bleck.includes(x) ? S.bleck.filter((y) => y !== x) : [...S.bleck, x]; S.losa = S.losa.filter((y) => y !== x); }); uppdatera(); return; }
  if (b.dataset.lage) {
    if (S.tang.pa) status('Slå av utgången innan du flyttar sladden.');
    else { S.tang.lage = b.dataset.lage; status(''); }
    uppdatera(); return;
  }
  const g = b.dataset.g; if (!g) return;
  const G = {
    inga: () => bleckAndring(() => { S.bleck = []; S.losa = []; }),
    y: () => bleckAndring(() => { S.bleck = [...Y]; S.losa = []; }),
    delta: () => bleckAndring(() => { S.bleck = [...DELTA]; S.losa = []; }),
    dra: () => bleckAndring(() => { S.losa = []; status('Du har dragit åt alla muttrar.'); }),
    bort: () => { S.prob = { rod: null, svart: null }; S.kort = false; status('Mätsladdarna är bortkopplade.'); },
    kort: () => { S.prob = { rod: null, svart: null }; S.kort = true; status('Spetsarna mot varandra: mätaren visar sladdarnas resistans.'); },
    test: () => { S.utlost = true; }, reset: () => { S.utlost = false; },
    utgang: () => { S.tang.pa = !S.tang.pa; },
    noll: () => { if (S.tang.lage !== 'ute') status('Nollställ med sladden utanför käften.'); else { S.tang.nollstalld = true; status('Tången är nollställd.'); } },
    nyttfel: () => startaFel(),
    kontroll: () => status(helDelta(S.bleck, S.losa) ? 'Rätt: alla tre bleck ligger för Δ och har kontakt. Mät paren igen och skriv slutsatsen i protokollet.' : 'Plinten är ännu inte en hel Δ-koppling. Mät de tre paren och jämför med (2/3) · R.'),
  };
  G[g]?.(); uppdatera();
});
document.addEventListener('change', (e) => {
  const v = e.target.dataset?.val; if (!v) return;
  const t = e.target.value || null;
  if (v === 'rod' || v === 'svart') { S.kort = false; S.prob[v] = t; }
  if (v === 'srod') S.sprob.rod = t; if (v === 'ssvart') S.sprob.svart = t;
  uppdatera();
});
function startaFel() { S.felsokning = true; S.bleck = [...FEL.bleck]; S.losa = [...FEL.losa]; S.prob = { rod: null, svart: null }; S.kort = false; status('Läraren har lagt in ett fel. Hitta det med mätning.'); }
function pick(v) {
  if (v.typ === 'plint' && (S.station === 'M' || S.station === 'F')) { S.kort = false; if (!S.prob.rod) S.prob.rod = v.id; else if (!S.prob.svart && v.id !== S.prob.rod) S.prob.svart = v.id; else { S.prob = { rod: v.id, svart: null }; } }
  else if (v.typ === 'start' && S.station === 'S') { if (!S.sprob.rod) S.sprob.rod = v.id; else if (!S.sprob.svart && v.id !== S.sprob.rod) S.sprob.svart = v.id; else S.sprob = { rod: v.id, svart: null }; }
  else if (v.typ === 'knapp') { if (v.id === 'test') S.utlost = true; if (v.id === 'reset') S.utlost = false; if (v.id === 'utgang') S.tang.pa = !S.tang.pa; }
  else return;
  uppdatera();
}

// Protokollet sparas i webbläsaren.
const PNYCKEL = 'sj-motorlabbet-protokoll';
function protokoll() {
  let d = {}; try { d = JSON.parse(localStorage.getItem(PNYCKEL) || '{}'); } catch { /* privat läge */ }
  for (const el of document.querySelectorAll('#ml-protokoll input, #ml-protokoll textarea')) {
    if (d[el.name] != null) el.value = d[el.name];
    el.addEventListener('input', () => { d[el.name] = el.value; try { localStorage.setItem(PNYCKEL, JSON.stringify(d)); } catch { /* privat läge */ } });
  }
}

async function start() {
  $('#ml-d').textContent = D;
  uppdatera(); protokoll();
  const vy = $('#ml-3d');
  try {
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) throw Error('WebGL saknas');
    const { mount } = await import('./scen.js?v=20260929');
    scen = mount(vy, { onPick: pick });
    vy.dataset.lage = '3d'; uppdatera();
  } catch {
    vy.dataset.lage = 'platt';
    vy.innerHTML = '<p class="ml-platt">3D-bilden kunde inte visas i den här webbläsaren. Allt fungerar med knapparna och plintbilden bredvid.</p>';
  }
}
start();
