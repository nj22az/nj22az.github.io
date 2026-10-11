// Veckosidan som dagar (verktyg/veckosidor/dagsvy.py): rutan ”I dag”, lektionsdagarna och det som gäller hela veckan.
// Data om veckan står i <script type="application/json" id="dagsvy-data">. Elevens framsteg finns bara i den här
// webbläsaren (localStorage). Utan skript visar sidan alla lektioner öppna och inga siffror.
//   sj-steg:vecka-NN        Klart-rutorna för läxor utan eget läge ({"v42_01-film": true, …})
//   sj-last:vecka-NN        ”Jag har läst del N” på delsidorna ({"del-1": ISO, …})
//   sj-ovningar:/sjoskolan/<mapp>/aktuell/Formelstod_och_ovningar.html   avbockade övningar (ankare → true)
//   inlämningen och quizet: gemensamt/sjalvrattning.mjs (veckoStatus och quizStatus)
import { rakna, dagarKvar } from './veckopanel.mjs';

const VECKODAG = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
const MANAD = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];

const las = (nyckel, standard) => {
  try { return JSON.parse(localStorage.getItem(nyckel) || 'null') ?? standard; } catch { return standard; }
};
const skriv = (nyckel, varde) => {
  try { localStorage.setItem(nyckel, JSON.stringify(varde)); return true; } catch { return false; }
};

export const lokaltDatum = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const minuter = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
export const datumText = (d) => `${VECKODAG[d.getDay()]} ${d.getDate()} ${MANAD[d.getMonth()]}`;

/** Dagens läge. typ: lektion (fas före, pågår eller efter), ingen (ingen lektion i dag), före-veckan eller slut. */
export function idagLage(lektioner, sista, nu = new Date()) {
  const idag = lokaltDatum(nu), klocka = nu.getHours() * 60 + nu.getMinutes();
  const dagens = lektioner.find((l) => l.datum === idag) || null;
  const nasta = lektioner.find((l) => l.datum > idag) || null;
  if (dagens) {
    const fas = klocka < minuter(dagens.start) ? 'före' : klocka < minuter(dagens.slut) ? 'pågår' : 'efter';
    return { typ: 'lektion', fas, lektion: dagens, nasta };
  }
  if (lektioner.length && idag < lektioner[0].datum) return { typ: 'före-veckan', lektion: null, nasta: lektioner[0] };
  if (idag > sista) return { typ: 'slut', lektion: null, nasta: null };
  return { typ: 'ingen', lektion: null, nasta };
}

/** Läget för en läxa: del-N (”Jag har läst del N”), ovn-N (övning N.6–N.10 avbockade), annars Klart-rutan. */
export function laxLage(lektion, laxa, k) {
  if (laxa.startsWith('del-')) {
    const t = k.lasning[laxa];
    return { klar: !!t, text: t ? '✓ Läst' : 'Inte läst än' };
  }
  if (laxa.startsWith('ovn-')) {
    const klara = [6, 7, 8, 9, 10].filter((i) => k.ovningar[`${lektion.id}-q${i}`]).length;
    return { klar: klara === 5, text: klara === 5 ? '✓ 5 av 5 klara' : `${klara} av 5 klara` };
  }
  return { klar: !!k.steg[`${lektion.id}-${laxa}`], text: '' };
}

/** Text för en uppgift med självrättning: Inlämnad, x av y rätt eller Inte påbörjad. */
export function formularText(s) {
  if (!s || !Array.isArray(s.uppgifter) || !s.uppgifter.length) return { text: 'Inte påbörjad', andel: 0, klar: false };
  const ratt = s.uppgifter.reduce((a, u) => a + (u.ratt || 0), 0), tot = s.uppgifter.reduce((a, u) => a + (u.totalt || 0), 0);
  const andel = tot ? ratt / tot : 0;
  if (s.inlamnad) return { text: `✓ Inlämnad · ${ratt} av ${tot} rätt`, andel, klar: true };
  return { text: `${ratt} av ${tot} rätt${s.last ? ' · låsta frågor: läs om texten' : ''}`, andel, klar: false };
}

/** Kvar till en sista dag: 3 dagar kvar, i morgon, i dag eller passerad. */
export function kvarText(sista, nu = new Date()) {
  const n = dagarKvar(sista, nu);
  return { text: n > 1 ? `${n} dagar kvar` : n === 1 ? 'i morgon' : n === 0 ? 'i dag' : 'passerad', bradskande: n >= 0 && n <= 1 };
}

function lageNu(data) {
  const ovningar = {};
  for (const [mapp, ankare] of data.ovningar) Object.assign(ovningar, Object.fromEntries(Object.entries(las(`sj-ovningar:/sjoskolan/${mapp}/aktuell/Formelstod_och_ovningar.html`, {})).filter(([a]) => ankare.includes(a))));
  return { steg: las(`sj-steg:vecka-${data.vecka}`, {}), lasning: las(`sj-last:vecka-${data.vecka}`, {}), ovningar };
}

async function formularStatus(data) {
  if (!data.sjalvrattande) return {};
  try {
    const mod = await import(data.sjalvrattande);
    const inl = typeof mod.veckoStatus === 'function' ? mod.veckoStatus(data.vecka) : null;
    const lasf = typeof mod.quizStatus === 'function' ? mod.quizStatus(data.vecka) : null;
    return { inl, lasf };
  } catch { return {}; }
}

function satt(el, text) { if (el && el.textContent !== text) el.textContent = text; }

function visaIdag(rot, data, lage, nu) {
  const ruta = rot.querySelector('#idag');
  if (!ruta) return;
  const $ = (id) => ruta.querySelector(`#${id}`);
  const knapp = $('idag-knapp'), lank = $('idag-lank'), amnen = $('idag-amnen');
  const farg = (l) => { ruta.style.setProperty('--dag', l ? l.farg : '#163248'); ruta.style.setProperty('--dag-ton', l ? `${l.farg}14` : '#f3f6f9'); };
  const visaAmnen = (l) => { amnen.replaceChildren(...l.amnen.map((t) => Object.assign(document.createElement('li'), { textContent: t }))); amnen.hidden = !l.amnen.length; };
  const nastaText = (l) => (l ? `Nästa lektion: ${l.dag.toLowerCase()} ${l.datumtext.split(' ').slice(1).join(' ')} ${l.tid}, ${l.titel}.` : '');
  lank.hidden = false; amnen.hidden = true;
  if (lage.typ === 'lektion' && lage.fas !== 'efter') {
    const l = lage.lektion; farg(l);
    satt($('idag-nar'), `${lage.fas === 'pågår' ? 'Pågår nu' : 'I dag'} · ${l.datumtext} · ${l.tid} ${l.satt}`);
    satt($('idag-rubrik'), l.titel); satt($('idag-text'), 'Det här pratar vi om i dag:'); visaAmnen(l);
    knapp.href = l.bildspel; satt(knapp, 'Öppna presentationen');
    lank.href = `#dag-${l.dag.toLowerCase()}`; satt(lank, 'Läxor efter lektionen');
  } else if (lage.typ === 'lektion') {
    const l = lage.lektion; farg(l);
    satt($('idag-nar'), `I dag · ${l.datumtext} · lektionen är slut`);
    satt($('idag-rubrik'), 'Gör läxorna efter lektionen');
    satt($('idag-text'), `${l.titel}. ${nastaText(lage.nasta) || `Det var veckans sista lektion. Inlämningen senast ${data.sista_text}.`}`);
    knapp.href = `#dag-${l.dag.toLowerCase()}`; satt(knapp, 'Läxor efter lektionen');
    lank.href = l.bildspel; satt(lank, 'Presentationen igen');
  } else if (lage.typ === 'före-veckan') {
    const l = lage.nasta; farg(l);
    satt($('idag-nar'), `Första lektionen · ${l.datumtext} · ${l.tid} ${l.satt}`);
    satt($('idag-rubrik'), l.titel); satt($('idag-text'), 'Det här pratar vi om:'); visaAmnen(l);
    knapp.href = l.bildspel; satt(knapp, 'Öppna presentationen');
    lank.href = '#veckan'; satt(lank, 'Det här gäller hela veckan');
  } else if (lage.typ === 'ingen') {
    farg(null);
    const idag = lokaltDatum(nu);
    const nastaVk = data.veckan.filter((x) => x.sista && x.sista >= idag).sort((a, b) => (a.sista < b.sista ? -1 : 1))[0];
    satt($('idag-nar'), `I dag · ${datumText(nu)} · ingen lektion`);
    satt($('idag-rubrik'), 'Gör läxorna');
    const kvar = nastaVk ? kvarText(nastaVk.sista, nu).text : '';
    satt($('idag-text'), [nastaVk ? `${nastaVk.titel} senast ${datumText(new Date(`${nastaVk.sista}T12:00`))} (${kvar}).` : '', nastaText(lage.nasta)].filter(Boolean).join(' '));
    if (nastaVk) { knapp.href = nastaVk.href; satt(knapp, nastaVk.knapp); } else { knapp.href = '#dagar'; satt(knapp, 'Läxor efter lektionerna'); }
    lank.href = '#dagar'; satt(lank, 'Läxor efter lektionerna');
  } else {
    farg(null);
    satt($('idag-nar'), `Vecka ${data.vecka} är slut`);
    satt($('idag-rubrik'), `Fortsätt med vecka ${data.vecka + 1}`);
    satt($('idag-text'), 'Det du inte har gjort klart kan du fortfarande göra här, men börja med den nya veckan.');
    knapp.href = `../../vecka-${data.vecka + 1}/aktuell/`; satt(knapp, `Till vecka ${data.vecka + 1}`);
    lank.hidden = true;
  }
  ruta.hidden = false;
}

let forstaGangen = true;

export async function visa(rot = document) {
  const dataEl = rot.querySelector('#dagsvy-data');
  if (!dataEl) return;
  const data = JSON.parse(dataEl.textContent);
  const nu = new Date(), lage = idagLage(data.lektioner, data.sista, nu);
  const k = lageNu(data);
  const { inl, lasf } = await formularStatus(data);

  visaIdag(rot, data, lage, nu);
  // Nästa lektion lyfts fram när det inte är lektion i dag eller när dagens lektion är slut.
  const fokus = lage.typ === 'lektion' && lage.fas !== 'efter' ? null : lage.nasta;
  for (const l of data.lektioner) {
    const kort = rot.querySelector(`[data-lektion="${l.id}"]`);
    if (!kort) continue;
    let klara = 0;
    for (const laxa of l.laxor) {
      const li = kort.querySelector(`[data-laxa="${laxa}"]`);
      const s = laxLage(l, laxa, k);
      klara += s.klar ? 1 : 0;
      const el = li?.querySelector('[data-lage]');
      if (el) { satt(el, s.text); el.classList.toggle('klar', s.klar); }
      const ruta = li?.querySelector('input[data-klar]');
      if (ruta) ruta.checked = s.klar;
    }
    const idag = lage.lektion?.id === l.id, nasta = fokus?.id === l.id;
    kort.classList.toggle('idag-kort', idag); kort.classList.toggle('nasta-kort', nasta);
    const status = kort.querySelector('.dag-lage');
    const etikett = idag ? 'I dag' : nasta ? 'Nästa lektion' : '';
    status.replaceChildren(...(etikett ? [Object.assign(document.createElement('b'), { textContent: etikett }), ' · '] : []), `Läxor: ${klara} av ${l.laxor.length} klara`);
    // En lektion som har varit och har läxor kvar syns i varningsfärg, också när rutan är stängd.
    status.classList.toggle('kvar', l.datum < lokaltDatum(nu) && klara < l.laxor.length);
    if (forstaGangen) kort.open = idag || nasta;  // de andra dagarna står kvar som en rad; eleven kan öppna dem
  }
  forstaGangen = false;

  // Hela veckan
  const allaOvn = data.ovningar.reduce((s, [, a]) => s + a.length, 0), klaraOvn = Object.values(k.ovningar).filter(Boolean).length;
  const vecka = {
    ovningar: { text: klaraOvn >= allaOvn ? `✓ Alla ${allaOvn} klara` : `${klaraOvn} av ${allaOvn} klara`, andel: allaOvn ? klaraOvn / allaOvn : 0, klar: klaraOvn >= allaOvn },
    inlamning: formularText(inl),
    quiz: formularText(lasf ? { ...lasf, uppgifter: lasf.dokument || lasf.uppgifter } : null),
  };
  for (const x of rot.querySelectorAll('.vk[data-vk]')) {
    const s = vecka[x.dataset.vk];
    if (s) {
      const el = x.querySelector('.vk-lage');
      satt(el, s.text); el.classList.toggle('klar', !!s.klar);
      x.querySelector('.vp-stapel i').style.width = `${Math.round(100 * s.andel)}%`;
    }
    if (x.dataset.sista) {
      const kv = kvarText(x.dataset.sista, nu), el = x.querySelector('.vk-kvar');
      satt(el, `· ${kv.text}`); el.classList.toggle('bradskande', kv.bradskande && !s?.klar);
    }
  }

  // Kursplanens punkter: övningar plus inlämningens rätta svar per punkt (samma räkning som översikten).
  const r = rakna({ ...data, steg: [], delar: [] }, las, inl && inl.uppgifter?.length ? inl : null);
  for (const m of r.mal) {
    const rad = rot.querySelector(`[data-lm="${m.id}"]`);
    if (!rad) continue;
    satt(rad.querySelector('.vp-lm-tal'), m.totalt ? `${m.gjort} av ${m.totalt}` : (m.annat || ''));
    rad.querySelector('.vp-stapel i').style.width = `${m.totalt ? Math.round(100 * m.gjort / m.totalt) : 0}%`;
  }
}

if (typeof document !== 'undefined' && document.getElementById('dagsvy-data')) {
  const start = () => {
    visa();
    document.addEventListener('change', (e) => {
      const ruta = e.target.closest?.('input[data-klar]');
      if (!ruta) return;
      const data = JSON.parse(document.getElementById('dagsvy-data').textContent), nyckel = `sj-steg:vecka-${data.vecka}`;
      const steg = las(nyckel, {});
      if (ruta.checked) steg[ruta.dataset.klar] = true; else delete steg[ruta.dataset.klar];
      skriv(nyckel, steg);
      visa();
    });
    // Delsidan, övningarna och formulären sparar i andra flikar: räkna om när eleven kommer tillbaka.
    addEventListener('pageshow', () => visa());
    addEventListener('storage', () => visa());
    document.addEventListener('visibilitychange', () => { if (!document.hidden) visa(); });
    setInterval(() => { if (!document.hidden) visa(); }, 60000);  // ”I dag” byter läge när lektionen börjar och slutar
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}
