// Vecka 40: planen dag för dag (sidan byggs av verktyg/veckosidor/bygg.py).
// Visar vad som gäller nu och nästa steg, sparar elevens avbockning i den här webbläsaren och visar framsteg från
// övningssidan (gemensamt/ovningsvy.mjs sparar avbockade övningar under 'sj-ovningar:' + sidans sökväg).
// Utan JavaScript syns hela planen ändå. ?idag=2026-09-30T10:00 visar planen som den ser ut vid en annan tidpunkt.
const plan = document.getElementById('dagplan');
const panel = document.getElementById('nu');
const NYCKEL = 'sj-v40-dagplan';
const OVNINGAR = 'sj-ovningar:/sjoskolan/vecka-40/aktuell/Formelstod_och_ovningar.html';

const las = (k) => { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch { return {}; } };
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function tidpunkt() {
  const q = new URLSearchParams(location.search).get('idag');
  const d = q ? new Date(q) : null;
  return d && !Number.isNaN(d.getTime()) ? d : new Date();
}

function ovningar(li) {
  const [del, intervall] = li.dataset.ovningar.split(':');
  const [a, b] = intervall.split('-').map(Number);
  const ov = las(OVNINGAR);
  let n = 0;
  for (let i = a; i <= b; i++) if (ov[`${del}-q${i}`]) n++;
  return { n, tot: b - a + 1 };
}

if (plan) {
  let klara = las(NYCKEL);
  const spara = () => { try { localStorage.setItem(NYCKEL, JSON.stringify(klara)); } catch { /* privat läge: avbockningen gäller bara nu */ } };
  const dagar = [...plan.querySelectorAll('.dag[data-start]')];
  const steg = (d) => [...d.querySelectorAll('li[data-steg]')];
  plan.classList.add('js');

  function aktuellDag(nu) {
    let dag = dagar[0];
    for (const d of dagar) if (new Date(d.dataset.start) <= nu) dag = d;
    return dag;
  }

  function knapp(href, text) {
    return `<p class="nu-knapp"><a class="sj-btn primary large" href="${esc(href)}">${esc(text)}</a></p>`;
  }

  function visaPanel(nu, dag) {
    if (!panel) return;
    const namn = dag.querySelector('.dag-namn').textContent;
    if (nu >= new Date(plan.dataset.slut)) {
      panel.innerHTML = '<p class="nu-etikett">Vecka 40 är slut</p><p class="nu-rubrik">Nästa: vecka 41, Trefas och laboration</p>' + knapp('../../vecka-41/aktuell/', 'Öppna vecka 41');
      return;
    }
    if (dag.classList.contains('lektion')) {
      const forst = nu < new Date(dag.dataset.start);
      const rubrik = dag.querySelector('.dag-rubrik').textContent;
      const material = dag.querySelector('.dag-material a');
      panel.innerHTML = `<p class="nu-etikett">${forst ? 'Nästa lektion' : 'I dag: lektion'}</p><p class="nu-rubrik">${esc(namn)}: ${esc(rubrik)}</p>`
        + (forst || !material ? knapp(`#${dag.id}`, `Se planen för ${namn.split(' ')[0].toLowerCase()}`)
          : knapp(material.getAttribute('href'), `Öppna ${material.textContent.charAt(0).toLowerCase()}${material.textContent.slice(1)}`) + `<p class="nu-text"><a href="#${dag.id}">Se hela planen för dagen</a></p>`);
      return;
    }
    const alla = steg(dag);
    const kvar = alla.find((li) => !klara[li.dataset.steg]);
    if (!kvar) {
      const nasta = dagar[dagar.indexOf(dag) + 1];
      panel.innerHTML = `<p class="nu-etikett">Hemma</p><p class="nu-rubrik">${esc(namn)}: allt klart</p>`
        + (nasta ? knapp(`#${nasta.id}`, `Se nästa: ${nasta.querySelector('.dag-namn').textContent}`) : '<p class="nu-text">Bra jobbat! Veckans arbete är klart.</p>');
      return;
    }
    const k = alla.indexOf(kvar) + 1;
    const a = kvar.querySelector('.steg-text a');
    const kind = kvar.querySelector('.kind').textContent;
    panel.innerHTML = `<p class="nu-etikett">Hemma · steg ${k} av ${alla.length}</p><p class="nu-rubrik">${esc(namn)}</p>`
      + knapp(a.getAttribute('href'), `${kind}: ${a.textContent}`)
      + `<p class="nu-text">${esc(kvar.querySelector('small').textContent)}. <a href="#${dag.id}">Se alla steg</a></p>`;
  }

  function rita() {
    klara = las(NYCKEL);
    for (const li of plan.querySelectorAll('li[data-steg]')) {
      const id = li.dataset.steg;
      const cb = li.querySelector('input[data-klar]');
      const info = li.querySelector('.steg-framsteg');
      if (li.dataset.ovningar) {
        const { n, tot } = ovningar(li);
        info.textContent = `${n} av ${tot} avbockade på övningssidan`;
        if (n === tot && klara[id] === undefined) { klara[id] = true; spara(); }
      }
      cb.checked = !!klara[id];
      li.classList.toggle('klar', !!klara[id]);
    }
    for (const d of dagar) {
      const alla = steg(d);
      const status = d.querySelector('.dag-status');
      if (!status || !alla.length) continue;
      const n = alla.filter((li) => klara[li.dataset.steg]).length;
      status.textContent = n === alla.length ? `Alla ${n} steg klara.` : `${n} av ${alla.length} steg klara.`;
    }
    const nu = tidpunkt();
    const dag = aktuellDag(nu);
    for (const d of dagar) {
      const aktuell = d === dag && nu < new Date(plan.dataset.slut);
      d.classList.toggle('nu', aktuell);
      d.querySelector('.dag-nu')?.remove();
      if (aktuell) d.querySelector('h3').insertAdjacentHTML('beforeend', `<span class="dag-nu">${nu < new Date(d.dataset.start) ? 'Nästa' : 'Nu'}</span>`);
    }
    visaPanel(nu, dag);
  }

  plan.addEventListener('change', (e) => {
    const cb = e.target.closest('input[data-klar]');
    if (!cb) return;
    klara = las(NYCKEL);
    klara[cb.dataset.klar] = cb.checked;
    spara();
    rita();
  });
  // Tillbaka från övningssidan eller en annan flik: visa aktuellt framsteg.
  addEventListener('pageshow', rita);
  addEventListener('storage', (e) => { if (e.key === NYCKEL || e.key === OVNINGAR) rita(); });
  rita();
}
