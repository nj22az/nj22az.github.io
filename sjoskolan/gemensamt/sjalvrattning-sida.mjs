// Självrättande inlämning: sidans beteende (vecka 42 och framåt). Fälten, alternativen och hänvisningarna står i sidan
// (verktyg/inlamning/sjalvrattning.py). Här binds Rätta (tre försök, sedan låst), rutan Läs om veckan (nya försök efter
// läsning), Jag har läst texten, låsningen av första versionen och checklistan, Lämna in och PDF-filen.
// Rättning, försök, veckostatus och PDF:ens innehåll finns i sjalvrattning.mjs, PDF-skrivaren i pdf.mjs.
import { ratta, kanon, registrera, registreraText, lasForstaVersion, avkodaLista, resultat, tidText, lasLage, sparaLage,
  BESKED, MAX_FORSOK, forsokKvar, kanLasasUpp, nyOmgang, lasLasning, bekraftaLasning, listanVisas, sparadPlan, pdfBlock,
  pdfFilnamn, kontrollkod, mailtoAmne, faltNamn } from './sjalvrattning.mjs?v=20261013';
import { skapaPdf } from './pdf.mjs?v=20261013';
import { fulltNamn, sparatNamn, sparaNamn } from './elevtal.mjs?v=20260930';

const esc = (s) => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const rattas = (f) => f.typ === 'tal' || f.typ === 'val';

/** Etiketten som text, med nedsänkta index som _x (U_beröring), för PDF:en. */
function textAv(el) {
  if (!el) return '';
  const k = el.cloneNode(true);
  k.querySelectorAll('sub').forEach((s) => s.replaceWith(`_${s.textContent}`));
  k.querySelectorAll('sup').forEach((s) => s.replaceWith(`^${s.textContent}`));
  return k.textContent.replace(/\s+/g, ' ').trim();
}

function byggFalt(el) {
  const radio = [...el.querySelectorAll('input[type=radio]')], select = el.querySelector('select');
  const alternativ = radio.length ? radio.map((r, i) => ({ id: r.value, text: r.closest('label').textContent.trim(), nr: i + 1 }))
    : select ? [...select.options].filter((o) => o.value).map((o, i) => ({ id: o.value, text: o.textContent.trim(), nr: i + 1 })) : [];
  const rubrik = el.querySelector(':scope > legend, :scope > label:not(.ri-val)');
  const plats = textAv(el.closest('.ri-plats')?.querySelector('legend'));
  const heltal = el.dataset.heltal ? el.dataset.heltal.split('-').map(Number) : null;
  return { id: el.dataset.falt, typ: el.dataset.typ, enhet: el.dataset.enhet || '', kort: el.dataset.kort || '', heltal,
    etikett: plats ? `${plats}: ${textAv(rubrik)}` : textAv(rubrik), alternativ, lista: !!select, el, radio,
    input: el.querySelector('input:not([type=radio]), textarea, select'), besked: el.querySelector('.ri-besked'), pekare: el.querySelector('.ri-pekare') };
}

/** Startar sidan. nyckel = NYCKEL ur vecka-XX/aktuell/inlamning-nyckel.mjs (null om den inte gick att läsa). */
export function starta(nyckel, dok = document) {
  const rot = dok.querySelector('[data-ri-vecka]');
  if (!rot) return null;
  const LAGRING = rot.dataset.riLagring, VECKA = rot.dataset.riVecka, MAX = Number(rot.dataset.riMax) || MAX_FORSOK;
  const lmText = (() => { try { return JSON.parse(rot.dataset.riLm || '{}'); } catch { return {}; } })();
  let { lage, ok } = lasLage(LAGRING);
  const lagringsrad = rot.querySelector('.ri-lagring');
  const lagringsfel = () => { lagringsrad.hidden = false; lagringsrad.textContent = 'Din webbläsare sparar inte svaren. Gör klart och lämna in innan du stänger sidan.'; };
  const spara = () => { if (!sparaLage(LAGRING, lage)) lagringsfel(); };
  if (!ok) lagringsfel();
  if (!nyckel) {
    lagringsrad.hidden = false;
    lagringsrad.textContent = 'Rättningen fungerar inte just nu. Du kan ändå lämna in: läraren rättar dina svar.';
  }

  const plan = { vecka: VECKA, titel: rot.dataset.riTitel, epost: rot.dataset.riEpost,
    uppgifter: [...dok.querySelectorAll('.ri-svar')].map((s) => {
      const lasEl = s.querySelector('[data-lista]');
      return { nr: s.dataset.nr, ovning: s.dataset.ovning, titel: s.dataset.titel, lm: (s.dataset.lm || '').split(/\s+/).filter(Boolean), el: s, lasEl,
        checklista: lasEl ? avkodaLista(lasEl.dataset.lista) : null, checklistaEfter: lasEl?.dataset.listaEfter || null,
        falt: [...s.querySelectorAll('[data-falt]')].map(byggFalt) };
    }) };
  // Planen sparas med svaren, så att veckosidan kan visa läget (sjalvrattning.mjs: veckoStatus).
  const ny = sparadPlan(plan);
  if (JSON.stringify(lage.plan) !== JSON.stringify(ny)) { lage = { ...lage, plan: ny }; spara(); }
  const allaFalt = plan.uppgifter.flatMap((u) => u.falt);
  // Svar på fält som inte längre finns på sidan tas bort (quizen flyttade till en egen sida 12 oktober 2026),
  // så att kontrollkoden och PDF:en bara gäller sidans frågor.
  const pasidan = new Set(allaFalt.map((f) => f.id));
  const gamla = Object.keys(lage.falt || {}).filter((id) => !pasidan.has(id));
  if (gamla.length) { lage = { ...lage, falt: Object.fromEntries(Object.entries(lage.falt).filter(([id]) => pasidan.has(id))) }; spara(); }

  const varde = (f) => (f.radio.length ? (f.radio.find((r) => r.checked)?.value || '') : (f.input?.value ?? ''));
  const sattVarde = (f, v) => { if (f.radio.length) f.radio.forEach((r) => { r.checked = r.value === v; }); else if (f.input) f.input.value = v; };
  const dec = (f) => nyckel?.falt?.[f.id]?.dec ?? 0;

  /** Rätt fält är klart och låst fält väntar på ny omgång: båda går inte att ändra. */
  function las(f, stangd) {
    if (f.radio.length) f.radio.forEach((r) => { r.disabled = stangd; });
    else if (f.input?.tagName === 'SELECT') f.input.disabled = stangd;
    else if (f.input) f.input.readOnly = stangd;
    f.el.classList.toggle('ri-stangd', stangd);
  }
  function visaBesked(f, utfall) {
    if (!f.besked) return;
    const p = lage.falt[f.id] || {};
    const steg = p.klar ? 'ratt' : p.last ? 'last' : utfall;
    las(f, !!(p.klar || p.last));
    const text = { ratt: BESKED.ratt, fel: `${BESKED.fel}.`, tom: 'Inget svar än.', saknas: 'Det här svaret kan inte rättas just nu.',
      ogiltig: f.heltal ? `Skriv en hel siffra från ${f.heltal[0]} till ${f.heltal[1]}.` : `Skriv bara talet i ${f.enhet}. Komma eller punkt går bra.` }[steg];
    f.besked.className = `ri-besked${steg ? ` ${steg}` : ''}`;
    if (steg === 'last') f.besked.innerHTML = 'Låst – <a href="#ri-lasom">läs om veckan</a>.';
    else if (text) f.besked.innerHTML = `${esc(text)}${['fel', 'tom', 'ogiltig'].includes(steg) && nyckel ? ` <span class="ri-kvar">Försök kvar: ${forsokKvar(p, MAX)}</span>` : ''}`;
    else f.besked.textContent = '';
    f.pekare.hidden = !(steg === 'fel' || steg === 'last');
    if (f.typ === 'tal' && f.input) {
      if (steg === 'fel' || steg === 'ogiltig') f.input.setAttribute('aria-invalid', 'true'); else f.input.removeAttribute('aria-invalid');
    }
  }

  // Återställ sparade svar och senaste beskedet (om svaret inte har ändrats efter rättningen).
  for (const f of allaFalt) {
    const p = lage.falt[f.id];
    if (p?.nu !== undefined) sattVarde(f, p.nu);
    if (!rattas(f)) continue;
    if (p?.klar || p?.last) visaBesked(f, p.status);
    else if (p?.status && String(p.nu ?? '').trim() && kanon(f.typ, p.nu, dec(f), f.enhet) === p.senast) visaBesked(f, p.status);
  }

  const ut = rot.querySelector('#ri-resultat'), lamna = rot.querySelector('#ri-lamna');
  function inaktuellt() {
    if (ut.hidden || ut.dataset.inaktuellt) return;
    ut.dataset.inaktuellt = '1';
    ut.innerHTML = '<p><strong>Du har ändrat ett svar efter inlämningen.</strong> Tryck Lämna in igen, så att PDF:en får med ändringen.</p>';
    lamna.classList.add('primary');
  }
  for (const f of allaFalt) {
    f.el.addEventListener(f.radio.length || f.lista ? 'change' : 'input', () => {
      const p = lage.falt[f.id] || {};
      if (p.klar || p.last) return;
      lage.falt[f.id] = { ...p, nu: varde(f), status: undefined };
      if (rattas(f)) visaBesked(f, null);
      spara();
      inaktuellt();
    });
  }

  function rattaUppgift(u, tid) {
    for (const f of u.falt) {
      if (f.typ === 'text') { lage.falt[f.id] = registreraText(lage.falt[f.id], varde(f), tid); continue; }
      if (!rattas(f)) continue;
      const v = varde(f), utfall = ratta(nyckel, f.id, v, f.enhet, f.heltal);
      lage.falt[f.id] = registrera(lage.falt[f.id], v, utfall, kanon(f.typ, v, dec(f), f.enhet), tid, MAX);
      visaBesked(f, utfall);
    }
  }

  function summera(u) {
    const r = resultat(plan, lage).uppgifter.find((x) => x.ovning === u.ovning);
    const fel = r.antal - r.ratt - r.tomma - r.lasta, nasta = plan.uppgifter[plan.uppgifter.indexOf(u) + 1];
    let t = `${r.ratt} av ${r.antal} rätt. `;
    if (!nyckel) t = 'Sidan kan inte rätta just nu. Dina svar är sparade. ';
    else if (fel) t += 'Läs där det står Skiljer sig. Ändra och tryck Rätta igen.';
    else if (r.tomma) t += 'Svara på resten och tryck Rätta igen.';
    else if (r.lasta) t += `${r.lasta === 1 ? 'En fråga är låst' : `${r.lasta} frågor är låsta`}. Läs om veckan, så får du ${MAX} nya försök.`;
    else if (r.lista && !r.lista.last) t += 'Skriv a–c och tryck Jag är klar med texten.';
    else if (r.lista && r.lista.med < r.lista.antal) t += `Checklistan: ${r.lista.med} av ${r.lista.antal} finns med. Skriv till det som saknas i a–c.`;
    else t += nasta ? `Bra! Fortsätt med inlämning ${nasta.nr}.` : 'Bra! Gå till Lämna in längst ner.';
    u.el.querySelector('.ri-summa').textContent = t;
  }

  // Läs om veckan: rutan överst när en fråga är låst. När alla delar och texten är bekräftade efter låsningen får de
  // låsta frågorna en ny omgång med tre försök (omgången sparas per fråga).
  const lasom = dok.getElementById('ri-lasom');
  const delar = (lasom?.dataset.riDelar || 'del-1 del-2 del-3').split(/\s+/);
  let upplast = 0;
  function uppdateraLasom() {
    const lasning = lasLasning(VECKA), tid = new Date().toISOString();
    for (const f of allaFalt.filter(rattas)) {
      const p = lage.falt[f.id];
      if (kanLasasUpp(p, lasning, delar)) {
        lage.falt[f.id] = nyOmgang(p, tid);
        upplast++;
        visaBesked(f, null);
      }
    }
    if (upplast) spara();
    const lasta = allaFalt.filter((f) => lage.falt[f.id]?.last);
    const grans = Math.max(...lasta.map((f) => Date.parse(lage.falt[f.id].lastTid) || 0), 0);
    for (const s of dok.querySelectorAll('[data-ri-status]')) {
      const t = lasning[s.dataset.riStatus], iRutan = !!s.closest('#ri-lasom');
      const last = t && (!iRutan || Date.parse(t) > grans);
      s.textContent = last ? `Läst ${tidText(t)}` : iRutan ? 'Inte läst än' : '';
      s.classList.toggle('ri-last', !!last);
    }
    if (!lasom) return;
    const klart = lasom.querySelector('.ri-lasom-klart');
    lasom.hidden = !lasta.length && !upplast;
    klart.textContent = upplast && !lasta.length ? `Bra! Du har ${MAX} nya försök på de frågor som var låsta. Tryck Rätta när du har ändrat svaren.` : '';
    plan.uppgifter.forEach((u) => { if (u.el.querySelector('.ri-summa').textContent) summera(u); });
    for (const u of plan.uppgifter.filter((x) => x.lasEl)) visaLista(u);
  }
  // Jag har läst texten (quizens PDF): nyckeln text i sj-last:vecka-NN.
  for (const b of dok.querySelectorAll('[data-ri-last="text"]')) b.addEventListener('click', () => { bekraftaLasning(VECKA, 'text'); uppdateraLasom(); });
  addEventListener('storage', (e) => { if (!e.key || e.key.startsWith('sj-last:')) uppdateraLasom(); });
  dok.addEventListener('visibilitychange', () => { if (dok.visibilityState === 'visible') uppdateraLasom(); });
  addEventListener('pageshow', uppdateraLasom);

  for (const u of plan.uppgifter) {
    u.el.querySelector('.ri-ratta').addEventListener('click', () => {
      rattaUppgift(u, new Date().toISOString());
      spara();
      summera(u);
      uppdateraLasom();
    });
  }

  // Skriven uppgift: första versionen låses (regel 25). Checklistan visas när fråga d (checklistaEfter) är rätt eller låst,
  // så att listan inte ger svaret på den frågan.
  function visaLista(u) {
    const l = lage.las[u.ovning];
    if (!l) return;
    const lista = u.lasEl.querySelector('.ri-lista'), status = u.lasEl.querySelector('.ri-las-status');
    u.lasEl.querySelector('.ri-las-knapp').hidden = true;
    u.lasEl.querySelectorAll('.ri-las-intro').forEach((p) => { p.hidden = true; });
    const efter = u.falt.find((f) => f.id === u.checklistaEfter);
    if (!listanVisas(u, lage)) {
      status.textContent = `Din första version är sparad ${tidText(l.tid)}. Läraren ser den. Checklistan visas när du har svarat rätt på fråga ${efter ? faltNamn(u.nr, efter).slice(u.nr.length) : 'd'}, eller när den frågan är låst.`;
      lista.hidden = true;
      return;
    }
    status.textContent = `Din första version är sparad ${tidText(l.tid)}. Läraren ser den. Du kan skriva till mer i rutorna.`;
    if (lista.dataset.ritad) { lista.hidden = false; return; }
    lista.dataset.ritad = '1';
    const bock = lage.bock[u.ovning] || {};
    lista.innerHTML = '<h4 tabindex="-1">Checklista: det här finns i ett komplett svar</h4>'
      + '<p>Kryssa i det som finns med i ditt svar. Saknas något? Skriv till det i rutorna ovanför. Din första version finns kvar.</p>'
      + `<ul class="ri-bocklista">${u.checklista.map((x, i) => `<li><label class="ri-bock"><input type="checkbox" data-bock="${i + 1}"${bock[i + 1] ? ' checked' : ''}><span>${esc(x.text)}</span></label><p class="ri-bock-las">${x.las}</p></li>`).join('')}</ul>`
      + '<p class="ri-bock-summa" aria-live="polite"></p>';
    lista.hidden = false;
    const summa = () => {
      const n = Object.values(lage.bock[u.ovning] || {}).filter(Boolean).length;
      lista.querySelector('.ri-bock-summa').textContent = `${n} av ${u.checklista.length} finns med i ditt svar.`;
    };
    lista.addEventListener('change', (e) => {
      const i = e.target.dataset.bock;
      if (!i) return;
      lage.bock = { ...lage.bock, [u.ovning]: { ...(lage.bock[u.ovning] || {}), [i]: e.target.checked } };
      spara(); summa(); inaktuellt();
      if (u.el.querySelector('.ri-summa').textContent) summera(u);
    });
    summa();
  }
  for (const u of plan.uppgifter.filter((x) => x.lasEl)) {
    const status = u.lasEl.querySelector('.ri-las-status');
    u.lasEl.querySelector('.ri-las-knapp').addEventListener('click', () => {
      const skrivna = u.falt.filter((f) => f.typ === 'lastext'), tomma = skrivna.filter((f) => !varde(f).trim());
      if (tomma.length) {
        status.textContent = `Skriv något i alla rutor först. ${tomma.length === 1 ? 'Den här rutan är tom' : 'De här rutorna är tomma'}: ${tomma.map((f) => f.etikett).join(', ')}.`;
        tomma[0].input.focus();
        return;
      }
      lage = lasForstaVersion(lage, u.ovning, Object.fromEntries(skrivna.map((f) => [f.id, varde(f).trim()])), new Date().toISOString());
      spara();
      visaLista(u);
      (u.lasEl.querySelector('.ri-lista h4') || status).focus?.();
      inaktuellt();
    });
    visaLista(u);
  }
  uppdateraLasom();

  // Lämna in: rätta allt, visa resultatet och ladda ner PDF-filen som eleven lämnar in i Google Classroom.
  const namnInp = rot.querySelector('#ri-namn'), namnFel = rot.querySelector('.ri-namnfel');
  namnInp.value = lage.namn || sparatNamn();
  function laddaNer(namn, tid) {
    const kod = kontrollkod(namn, tid, lage);
    const lasning = lasLasning(VECKA);
    const block = pdfBlock(plan, lage, { namn, tid, lmText, kod, lasning: Object.fromEntries(delar.map((k) => [k, lasning[k] || null])) });
    const pdf = skapaPdf(block, { titel: `Inlämning vecka ${VECKA}: ${namn}`, forfattare: namn, amne: `Sjöskolan · ${plan.titel}`,
      sidfot: `Sjöskolan · Inlämning vecka ${VECKA} · ${namn} · ${kod}`, skapad: new Date(tid) });
    const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
    const a = dok.createElement('a');
    a.href = url;
    a.download = pdfFilnamn(VECKA, namn);
    dok.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return { pdf, filnamn: a.download, kod };
  }
  function visaResultat(namn, tid) {
    const res = resultat(plan, lage);
    delete ut.dataset.inaktuellt;
    ut.innerHTML = `<p class="ri-stort">${nyckel ? `${res.ratt} av ${res.antal} rätt` : 'Inlämnad'}</p>`
      + `<ul>${res.uppgifter.map((u) => `<li>Inlämning ${u.nr}: ${u.ratt} av ${u.antal} rätt${u.lasta ? `, ${u.lasta} låst` : ''}${u.lista ? (u.lista.last ? '' : ', texten är inte låst som första version') : ''}.</li>`).join('')}</ul>`
      + `<p class="ri-knappar"><button type="button" class="sj-btn primary" id="ri-pdf">Ladda ner PDF</button></p>`
      + `<p><strong>Lämna in PDF-filen i Google Classroom under Vecka ${esc(VECKA)}.</strong></p>`
      + `<p class="ri-reserv">Kan du inte använda Classroom? <a href="${esc(mailtoAmne(plan.epost, `Inlämning vecka ${VECKA}: ${namn}`))}">Mejla PDF-filen till ${esc(plan.epost)}</a></p>`;
    ut.hidden = false;
    lamna.classList.remove('primary');
    lamna.textContent = 'Lämna in igen';
    ut.querySelector('#ri-pdf').addEventListener('click', () => laddaNer(namn, tid));
    ut.focus();
  }
  lamna.addEventListener('click', () => {
    const namn = namnInp.value.trim().replace(/\s+/g, ' ');
    if (!fulltNamn(namn)) { namnFel.textContent = 'Skriv både förnamn och efternamn.'; namnInp.focus(); return; }
    namnFel.textContent = '';
    sparaNamn(namn);
    const tid = new Date().toISOString();
    for (const u of plan.uppgifter) { rattaUppgift(u, tid); summera(u); }
    lage = { ...lage, namn, inlamnad: [...(lage.inlamnad || []), tid] };
    spara();
    uppdateraLasom();
    visaResultat(namn, tid);
  });
  return { plan, lage: () => lage, laddaNer, uppdateraLasom };
}
