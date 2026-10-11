// Quizen (vecka-XX/aktuell/Quiz.html, beslut 12 oktober 2026): flervalsfrågor med bokstäverna A–E om
// texter som eleven läser hemma. Fälten, bokstäverna och hänvisningarna står i sidan (verktyg/inlamning/quiz_mall.py
// och sjalvrattning.py dokument_falt). Här binds Rätta (tre försök per fråga, sedan låst), rutan Låsta frågor (en låst
// fråga får tre nya försök när eleven har läst om just den texten), Lämna in och PDF-filen.
// Rättning, försök, status och PDF:ens innehåll finns i sjalvrattning.mjs, PDF-skrivaren i pdf.mjs.
//
// Lagring (localStorage, try/catch i sjalvrattning.mjs; sidan fungerar utan):
//   sj-v<vecka>-quiz   svaren: {v, falt, inlamnad, namn, plan}
//   sj-omlasning:vecka-<vecka>  Jag har läst om texten: {"EL-000887": ISO, …} (rör inte delsidornas sj-last:vecka-NN)
import { ratta, kanon, registrera, resultat, tidText, lasLage, sparaLage, BESKED, MAX_FORSOK, forsokKvar, kanLasasUpp, nyOmgang,
  lasOmlasning, bekraftaOmlasning, sparadPlan, pdfBlockQuiz, pdfFilnamn, kontrollkod, mailtoAmne } from './sjalvrattning.mjs?v=20261014';
import { skapaPdf } from './pdf.mjs?v=20261014';
import { fulltNamn, sparatNamn, sparaNamn } from './elevtal.mjs?v=20260930';

const esc = (s) => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function byggFalt(el) {
  const radio = [...el.querySelectorAll('input[type=radio]')];
  // Alternativen med bokstav: {id: 'B', text: 'alternativets text'} (bokstaven står i en egen span före texten).
  const alternativ = radio.map((r) => ({ id: r.value, text: (r.closest('label').querySelector('span:last-child')?.textContent || '').trim() }));
  const rubrik = el.querySelector(':scope > legend, :scope > label:not(.ri-val)');
  const heltal = el.dataset.heltal ? el.dataset.heltal.split('-').map(Number) : null;
  return { id: el.dataset.falt, typ: el.dataset.typ, enhet: el.dataset.enhet || '', kort: el.dataset.kort || '', heltal,
    etikett: (rubrik?.textContent || '').replace(/\s+/g, ' ').trim(), alternativ, el, radio,
    input: el.querySelector('input:not([type=radio])'), besked: el.querySelector('.ri-besked'), pekare: el.querySelector('.ri-pekare') };
}

/** Startar sidan. nyckel = NYCKEL ur vecka-XX/aktuell/quiz-nyckel.mjs (null om den inte gick att läsa). */
export function starta(nyckel, dok = document) {
  const rot = dok.querySelector('[data-ri-quiz]');
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
    lagringsrad.textContent = 'Rättningen fungerar inte just nu. Svara ändå och lämna in: läraren rättar dina svar.';
  }

  const plan = { vecka: VECKA, titel: rot.dataset.riTitel, epost: rot.dataset.riEpost,
    uppgifter: [...dok.querySelectorAll('.ri-svar')].map((s) => ({ nr: s.dataset.nr, ovning: s.dataset.ovning, titel: s.dataset.titel,
      lm: (s.dataset.lm || '').split(/\s+/).filter(Boolean), el: s, checklista: null, falt: [...s.querySelectorAll('[data-falt]')].map(byggFalt) })) };
  // Planen sparas med svaren, så att veckosidan kan visa läget (sjalvrattning.mjs: quizStatus).
  const ny = sparadPlan(plan);
  if (JSON.stringify(lage.plan) !== JSON.stringify(ny)) { lage = { ...lage, plan: ny }; spara(); }
  const allaFalt = plan.uppgifter.flatMap((u) => u.falt);
  const dec = (f) => nyckel?.falt?.[f.id]?.dec ?? 0;
  const varde = (f) => (f.radio.length ? (f.radio.find((r) => r.checked)?.value || '') : (f.input?.value ?? ''));
  const sattVarde = (f, v) => { if (f.radio.length) f.radio.forEach((r) => { r.checked = r.value === v; }); else if (f.input) f.input.value = v; };

  /** Rätt fält är klart och låst fält väntar på en ny omgång: båda går inte att ändra. */
  function las(f, stangd) {
    if (f.radio.length) f.radio.forEach((r) => { r.disabled = stangd; });
    else if (f.input) f.input.readOnly = stangd;
    f.el.classList.toggle('ri-stangd', stangd);
  }
  function visaBesked(f, utfall) {
    const p = lage.falt[f.id] || {};
    const steg = p.klar ? 'ratt' : p.last ? 'last' : utfall;
    las(f, !!(p.klar || p.last));
    const text = { ratt: BESKED.ratt, fel: `${BESKED.fel}.`, tom: 'Inget svar än.', saknas: 'Det här svaret kan inte rättas just nu.',
      ogiltig: f.heltal ? `Skriv en hel siffra från ${f.heltal[0]} till ${f.heltal[1]}.` : 'Välj ett av alternativen.' }[steg];
    f.besked.className = `ri-besked${steg ? ` ${steg}` : ''}`;
    if (steg === 'last') f.besked.innerHTML = 'Låst – <a href="#ri-lasom">läs om texten</a>.';
    else if (text) f.besked.innerHTML = `${esc(text)}${['fel', 'tom', 'ogiltig'].includes(steg) && nyckel ? ` <span class="ri-kvar">Försök kvar: ${forsokKvar(p, MAX)}</span>` : ''}`;
    else f.besked.textContent = '';
    f.pekare.hidden = !(steg === 'fel' || steg === 'last');
    if (f.input) { if (steg === 'fel' || steg === 'ogiltig') f.input.setAttribute('aria-invalid', 'true'); else f.input.removeAttribute('aria-invalid'); }
  }

  // Återställ sparade svar och senaste beskedet (om svaret inte har ändrats efter rättningen).
  for (const f of allaFalt) {
    const p = lage.falt[f.id];
    if (p?.nu !== undefined) sattVarde(f, p.nu);
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
    f.el.addEventListener(f.radio.length ? 'change' : 'input', () => {
      const p = lage.falt[f.id] || {};
      if (p.klar || p.last) return;
      lage.falt[f.id] = { ...p, nu: varde(f), status: undefined };
      visaBesked(f, null);
      spara();
      inaktuellt();
    });
  }

  function rattaText(u, tid) {
    for (const f of u.falt) {
      const v = varde(f), utfall = ratta(nyckel, f.id, v, f.enhet, f.heltal);
      lage.falt[f.id] = registrera(lage.falt[f.id], v, utfall, kanon(f.typ, v, dec(f), f.enhet), tid, MAX);
      visaBesked(f, utfall);
    }
  }

  /** ”x av y rätt.” under texten, och efter Rätta vad eleven gör sedan. */
  function summera(u, efterRatta = false) {
    const r = resultat(plan, lage).uppgifter.find((x) => x.ovning === u.ovning);
    const fel = r.antal - r.ratt - r.tomma - r.lasta, nasta = plan.uppgifter[plan.uppgifter.indexOf(u) + 1];
    let t = `${r.ratt} av ${r.antal} rätt.`;
    if (!nyckel) t = 'Sidan kan inte rätta just nu. Dina svar är sparade.';
    else if (!efterRatta) t += r.lasta ? ` ${r.lasta === 1 ? 'En fråga är låst' : `${r.lasta} frågor är låsta`}.` : '';
    else if (fel) t += ' Läs där det står Skiljer sig. Välj ett annat svar och tryck Rätta igen.';
    else if (r.tomma) t += ' Svara på resten och tryck Rätta igen.';
    else if (r.lasta) t += ` ${r.lasta === 1 ? 'En fråga är låst' : `${r.lasta} frågor är låsta`}. Läs om texten, så får du ${MAX} nya försök.`;
    else t += nasta ? ` Bra! Fortsätt med text ${nasta.nr}.` : ' Bra! Gå till Lämna in längst ner.';
    u.el.querySelector('.ri-summa').textContent = t;
  }

  // Låsta frågor: rutan överst visar bara texterna med låsta frågor. När eleven har tryckt Jag har läst om texten efter
  // låsningen får textens låsta frågor en ny omgång med tre försök (omgången sparas per fråga).
  const lasom = dok.getElementById('ri-lasom');
  let upplast = 0;
  function uppdateraLasom() {
    const oml = lasOmlasning(VECKA), tid = new Date().toISOString();
    let nu = 0;
    for (const u of plan.uppgifter) {
      for (const f of u.falt) {
        const p = lage.falt[f.id];
        if (kanLasasUpp(p, oml, [u.ovning])) {
          lage.falt[f.id] = nyOmgang(p, tid);
          nu++;
          visaBesked(f, null);
        }
      }
    }
    if (nu) { upplast += nu; spara(); }
    let lastaTotalt = 0;
    for (const u of plan.uppgifter) {
      const lasta = u.falt.filter((f) => lage.falt[f.id]?.last);
      lastaTotalt += lasta.length;
      const rad = lasom?.querySelector(`[data-ri-dok="${u.ovning}"]`);
      if (rad) {
        rad.hidden = !lasta.length;
        const grans = Math.max(0, ...lasta.map((f) => Date.parse(lage.falt[f.id].lastTid) || 0));
        const t = oml[u.ovning], last = t && Date.parse(t) > grans;
        const status = rad.querySelector('[data-ri-omstatus]');
        status.textContent = last ? `Läst om ${tidText(t)}` : 'Inte läst om än';
        status.classList.toggle('ri-last', !!last);
      }
      if (u.el.querySelector('.ri-summa').dataset.efterRatta) summera(u, true); else summera(u);
    }
    if (!lasom) return;
    lasom.hidden = !lastaTotalt && !upplast;
    lasom.querySelector('.ri-lasom-klart').textContent = upplast && !lastaTotalt
      ? `Bra! Du har ${MAX} nya försök på de frågor som var låsta. Välj ett nytt svar och tryck Rätta.` : '';
  }
  for (const b of dok.querySelectorAll('[data-ri-omlast]')) {
    b.addEventListener('click', () => { bekraftaOmlasning(VECKA, b.dataset.riOmlast); uppdateraLasom(); });
  }
  addEventListener('storage', (e) => { if (!e.key || e.key.startsWith('sj-omlasning:') || e.key === LAGRING) uppdateraLasom(); });
  dok.addEventListener('visibilitychange', () => { if (dok.visibilityState === 'visible') uppdateraLasom(); });
  addEventListener('pageshow', uppdateraLasom);

  for (const u of plan.uppgifter) {
    u.el.querySelector('.ri-ratta').addEventListener('click', () => {
      rattaText(u, new Date().toISOString());
      spara();
      u.el.querySelector('.ri-summa').dataset.efterRatta = '1';
      uppdateraLasom();
    });
  }
  uppdateraLasom();

  // Lämna in: rätta allt, visa resultatet per text och ladda ner PDF-filen som eleven lämnar in i Google Classroom.
  const namnInp = rot.querySelector('#ri-namn'), namnFel = rot.querySelector('.ri-namnfel');
  namnInp.value = lage.namn || sparatNamn();
  function laddaNer(namn, tid) {
    const kod = kontrollkod(namn, tid, lage);
    const block = pdfBlockQuiz(plan, lage, { namn, tid, lmText, kod, omlasning: lasOmlasning(VECKA) });
    const pdf = skapaPdf(block, { titel: `Quiz vecka ${VECKA}: ${namn}`, forfattare: namn, amne: `Sjöskolan · ${plan.titel}`,
      sidfot: `Sjöskolan · Quiz vecka ${VECKA} · ${namn} · ${kod}`, skapad: new Date(tid) });
    const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
    const a = dok.createElement('a');
    a.href = url;
    a.download = pdfFilnamn(VECKA, namn, 'Quiz');
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
      + `<ul>${res.uppgifter.map((u) => `<li>Text ${esc(u.nr)}. ${esc(u.titel)}: ${u.ratt} av ${u.antal} rätt${u.lasta ? `, ${u.lasta} låst` : ''}.</li>`).join('')}</ul>`
      + '<p class="ri-knappar"><button type="button" class="sj-btn primary" id="ri-pdf">Ladda ner PDF</button></p>'
      + `<p><strong>${esc(rot.dataset.riClassroom)}</strong></p>`
      + `<p class="ri-reserv">Kan du inte använda Classroom? <a href="${esc(mailtoAmne(plan.epost, `Quiz vecka ${VECKA}: ${namn}`))}">Mejla PDF-filen till ${esc(plan.epost)}</a></p>`;
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
    for (const u of plan.uppgifter) { rattaText(u, tid); u.el.querySelector('.ri-summa').dataset.efterRatta = '1'; }
    lage = { ...lage, namn, inlamnad: [...(lage.inlamnad || []), tid] };
    spara();
    uppdateraLasom();
    visaResultat(namn, tid);
  });
  return { plan, lage: () => lage, laddaNer, uppdateraLasom };
}
