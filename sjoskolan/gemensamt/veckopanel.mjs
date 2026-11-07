// Veckans översikt ("Din vecka") överst på veckosidan: steg, delar, övningar, inlämningen och kursplanens punkter.
// Data om veckan står i <script type="application/json" id="veckopanel-data"> (verktyg/veckosidor/kursplan.py).
// Elevens framsteg finns bara i den här webbläsaren (localStorage). Utan lagring eller skript visar panelen nollor och länkar.
//   sj-steg:vecka-NN                                   Klart-bockarna på veckosidan
//   sj-last:vecka-NN                                   ”Jag har läst del N” på delsidorna ({"del-1": ISO, …, "text": ISO})
//   sj-ovningar:/sjoskolan/<mapp>/aktuell/Formelstod_och_ovningar.html   avbockade övningar (ankare → true)
//   inlämningen: veckoStatus(vecka) i gemensamt/sjalvrattning.mjs (självrättande veckor)

const las = (nyckel, standard) => {
  try { return JSON.parse(localStorage.getItem(nyckel) || 'null') ?? standard; } catch { return standard; }
};

export function rakna(data, lagring = las, status = null) {
  const steg = lagring(`sj-steg:vecka-${data.vecka}`, {});
  const lasning = (status && status.lasning) || lagring(`sj-last:vecka-${data.vecka}`, {});
  const klaraOvn = {};
  for (const [mapp] of data.ovningar) klaraOvn[mapp] = lagring(`sj-ovningar:/sjoskolan/${mapp}/aktuell/Formelstod_och_ovningar.html`, {});
  const raknaOvn = grupper => grupper.reduce((s, [mapp, ankare]) => s + ankare.filter(a => klaraOvn[mapp]?.[a]).length, 0);
  const totOvn = grupper => grupper.reduce((s, [, ankare]) => s + ankare.length, 0);
  const stegKlara = data.steg.filter(id => steg[id]).length;
  const delarLasta = data.delar.filter(d => lasning[`del-${d}`]).length;
  const mal = data.mal.map(m => {
    const inl = status?.lm?.[m.id] || { ratt: 0, totalt: m.inlamning || 0 };
    const gjort = raknaOvn(m.ovningar) + (inl.ratt || 0);
    const totalt = totOvn(m.ovningar) + (inl.totalt || 0);
    return { ...m, gjort, totalt };
  });
  return {
    steg: [stegKlara, data.steg.length],
    delar: [delarLasta, data.delar.length],
    ovningar: [raknaOvn(data.ovningar), totOvn(data.ovningar)],
    // Utan sparad plan (eleven har inte öppnat formuläret) står rutan kvar som på sidan: Inte påbörjad.
    inlamning: status?.uppgifter?.length ? inlamningText(status) : null,
    mal,
  };
}

function inlamningText(s) {
  const ratt = s.uppgifter.reduce((a, u) => a + (u.ratt || 0), 0);
  const tot = s.uppgifter.reduce((a, u) => a + (u.totalt || 0), 0);
  if (s.inlamnad) return { text: 'Inlämnad', not: `${ratt} av ${tot} rätt`, andel: tot ? ratt / tot : 1, klar: true };
  if (s.last) return { text: `${ratt} av ${tot} rätt`, not: 'Läs om veckan för nya försök', andel: tot ? ratt / tot : 0 };
  return { text: `${ratt} av ${tot} rätt`, not: ratt ? 'Fortsätt i formuläret' : 'Inte påbörjad', andel: tot ? ratt / tot : 0 };
}

export function dagarKvar(sista, idag = new Date()) {
  const [y, m, d] = sista.split('-').map(Number);
  const slut = new Date(y, m - 1, d, 23, 59);
  const start = new Date(idag.getFullYear(), idag.getMonth(), idag.getDate());
  return Math.round((new Date(slut.getFullYear(), slut.getMonth(), slut.getDate()) - start) / 86400000);
}

function satt(rot, nyckel, [n, tot], klarText) {
  const ruta = rot.querySelector(`[data-vp="${nyckel}"]`);
  if (!ruta) return;
  const klar = tot > 0 && n >= tot;
  ruta.querySelector('.vp-tal').textContent = klar && klarText ? klarText : `${n} av ${tot}`;
  ruta.querySelector('.vp-stapel i').style.width = `${tot ? Math.round(100 * n / tot) : 0}%`;
  ruta.classList.toggle('klar', klar);
}

export async function visa(rot = document.getElementById('veckopanel')) {
  if (!rot) return;
  const data = JSON.parse(document.getElementById('veckopanel-data').textContent);
  let status = null;
  if (data.sjalvrattande) {
    try {
      const mod = await import(data.sjalvrattande);
      status = typeof mod.veckoStatus === 'function' ? mod.veckoStatus(data.vecka) : null;
    } catch { status = null; }  // utan inlämningsmodulen visar rutan bara länken
  }
  const r = rakna(data, las, status);
  satt(rot, 'steg', r.steg, 'Alla klara');
  satt(rot, 'delar', r.delar, 'Alla lästa');
  satt(rot, 'ovningar', r.ovningar, 'Alla klara');
  const inl = rot.querySelector('[data-vp="inlamning"]');
  if (inl && r.inlamning) {
    inl.querySelector('.vp-tal').textContent = r.inlamning.text;
    inl.querySelector('.vp-not').textContent = r.inlamning.not;
    inl.querySelector('.vp-stapel i').style.width = `${Math.round(100 * r.inlamning.andel)}%`;
    inl.classList.toggle('klar', !!r.inlamning.klar);
  }
  for (const m of r.mal) {
    const rad = rot.querySelector(`[data-lm="${m.id}"]`);
    if (!rad) continue;
    rad.querySelector('.vp-lm-tal').textContent = m.totalt ? `${m.gjort} av ${m.totalt}` : (m.annat || '');
    rad.querySelector('.vp-stapel i').style.width = `${m.totalt ? Math.round(100 * m.gjort / m.totalt) : 0}%`;
  }
  const kvar = rot.querySelector('.vp-kvar');
  if (kvar) {
    const n = dagarKvar(data.sista);
    kvar.textContent = n > 1 ? `${n} dagar kvar` : n === 1 ? 'i morgon' : n === 0 ? 'i dag' : 'passerad';
    kvar.classList.toggle('bradskande', n >= 0 && n <= 1);
  }
}

if (typeof document !== 'undefined') {
  const start = () => {
    visa();
    // Klart-bockarna på sidan ändrar stegräkningen direkt; en annan flik (delsidan, formuläret) när sidan visas igen.
    document.addEventListener('change', e => { if (e.target.closest?.('.vag-klar')) setTimeout(visa, 0); });
    addEventListener('pageshow', () => visa());
    addEventListener('storage', () => visa());
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}
