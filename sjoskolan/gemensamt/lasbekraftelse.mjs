// Delsidorna i en vecka med självrättande inlämning: rutan "Har du läst hela del N?" sist på sidan
// (innehall/export/delsidor_veckor.py, verktyg/inlamning/sjalvrattning.py lasbekraftelse_html).
// Knappen öppnas när slutet av sidan har varit i bild OCH sidan har varit synlig (document.visibilityState) minst
// 3 minuter sammanlagt under besöket. Bekräftelsen sparas i localStorage sj-last:vecka-NN som {"del-1": ISO, …};
// den senaste tiden per del behålls (sjalvrattning.mjs: bekraftaLasning). Inlämningssidan ger låsta frågor nya försök
// när alla delar och texten är bekräftade efter låsningen.
import { lasklocka, bekraftaLasning, lasLasning, tidText, LASTID_MS } from './sjalvrattning.mjs?v=20261014';

const minSek = (ms) => {
  const s = Math.ceil(ms / 1000), m = Math.floor(s / 60);
  return m ? `${m} min${s % 60 ? ` ${s % 60} s` : ''}` : `${s} s`;
};

/** Startar rutan på delsidan. kravMs och nu (klocka) kan bytas i tester. */
export function startaLasning(dok = document, { kravMs = LASTID_MS, nu } = {}) {
  const ruta = dok.querySelector('[data-ri-las-vecka]');
  if (!ruta) return null;
  const vecka = ruta.dataset.riLasVecka, del = ruta.dataset.riLasDel, n = del.replace('del-', '');
  const knapp = ruta.querySelector('.ri-lasdel-knapp'), status = ruta.querySelector('.ri-lasdel-status');
  const klocka = lasklocka(nu);
  const synlig = () => klocka.synlig(dok.visibilityState === 'visible');
  synlig();
  dok.addEventListener('visibilitychange', () => { synlig(); kolla(); });
  let slutet = false, klar = false;
  const tidigare = () => {
    const t = lasLasning(vecka)[del];
    return t ? `Senast bekräftad ${tidText(t)}.` : '';
  };
  function kolla() {
    if (klar) return;
    const kvar = Math.max(0, kravMs - klocka.ms());
    knapp.disabled = !(slutet && kvar === 0);
    status.textContent = slutet && kvar > 0 ? `Knappen öppnas om ${minSek(kvar)}. ${tidigare()}`.trim() : tidigare();
  }
  const sett = () => { if (!slutet) { slutet = true; kolla(); } };
  // Slutet är nått när rutan har varit i bild: IntersectionObserver, och rullningens läge som reserv.
  if (typeof IntersectionObserver === 'function') new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) sett(); }).observe(ruta);
  const rull = () => { if (ruta.getBoundingClientRect().top < (innerHeight || dok.documentElement.clientHeight)) sett(); };
  addEventListener('scroll', rull, { passive: true });
  rull();
  const timer = setInterval(kolla, 1000);
  knapp.addEventListener('click', () => {
    if (knapp.disabled) return;
    const t = bekraftaLasning(vecka, del)[del];
    klar = true;
    clearInterval(timer);
    // En del som ligger i en annan veckas mapp länkar till den veckans inlämning (data-ri-las-inlamning).
    const inl = (ruta.dataset.riLasInlamning || 'Inlamning.html').replace(/["<>]/g, '');
    status.innerHTML = `Bra! Del ${n} är bekräftad ${tidText(t)}. <a href="${inl}">Tillbaka till inlämningen</a>`;
  });
  kolla();
  return { kolla, klocka, sett };
}
