// Sjöskolan · maskinöversättning (Chrome, Edge, översättningstillägg i Safari).
// Formler, storhetssymboler med index (U_L, X_C) och tal med enhet (12 V, 30 var, 50 Hz) markeras translate="no",
// så att en översatt sida behåller dem oförändrade. Sidorna är lang="sv". Innehåll som labbarna ritar senare markeras också.
(() => {
  const FORMLER = '.formula:not(table), .formel:not(table), .rad-samband, .lesson-formula, code, kbd, samp, math';
  const SYMBOL = /[A-Za-zΔΦφωûî]{1,2}$/;
  // Tal följt av enhet. ”var” (reaktiv effekt) och ”rad” är också vanliga ord och får bara stå direkt efter ett tal.
  const ENHET = /\d(?:[\d\u00a0\u202f ]*\d)?(?:[,.]\d+)?[\u00a0\u202f ]?(?:[kMmµu]?(?:V|A|W|Ω|Hz|VA|var|Wh|H|F|s)|kvar|kVA|kWh|°C?|%)(?![\wÅÄÖåäö])/g;
  const las = (el) => el.setAttribute('translate', 'no');
  const skyddad = (n) => (n.nodeType === 1 ? n : n.parentElement)?.closest('[translate="no"], script, style, textarea, input, svg, canvas');

  function markera(rot) {
    if (!rot.querySelectorAll) return;
    rot.querySelectorAll(FORMLER).forEach(las);
    // Kolumnen ”Formel” i formeltabellerna
    rot.querySelectorAll('table').forEach((t) => {
      const i = [...t.querySelectorAll('thead th')].findIndex((th) => /^formel/i.test(th.textContent.trim()));
      if (i >= 0) t.querySelectorAll('tbody tr').forEach((tr) => tr.children[i] && las(tr.children[i]));
    });
    // Storhet med index: bokstaven före <sub>/<sup> och indexet hålls ihop.
    rot.querySelectorAll('sub, sup').forEach((s) => {
      if (skyddad(s)) return;
      const f = s.previousSibling;
      if (f && f.nodeType === 3 && SYMBOL.test(f.data)) {
        const m = f.data.match(SYMBOL)[0], span = document.createElement('span');
        las(span);
        f.data = f.data.slice(0, -m.length);
        s.before(span);
        span.append(m, s);
      } else if (f && f.nodeType === 1) { las(f); las(s); }
      else las(s);
    });
    // Tal med enhet i löptext
    const gang = document.createTreeWalker(rot, NodeFilter.SHOW_TEXT);
    const noder = [];
    for (let n = gang.nextNode(); n; n = gang.nextNode()) if (/\d/.test(n.data) && !skyddad(n)) noder.push(n);
    for (const n of noder) {
      ENHET.lastIndex = 0;
      if (!ENHET.test(n.data)) continue;
      const frag = document.createDocumentFragment();
      let pos = 0;
      n.data.replace(ENHET, (m, i) => {
        frag.append(n.data.slice(pos, i));
        const span = document.createElement('span');
        las(span); span.textContent = m; frag.append(span);
        pos = i + m.length;
      });
      frag.append(n.data.slice(pos));
      n.replaceWith(frag);
    }
  }

  let vantar = false;
  const kor = () => { vantar = false; obs.disconnect(); markera(document.body); obs.observe(document.body, { childList: true, subtree: true }); };
  const obs = new MutationObserver(() => { if (!vantar) { vantar = true; requestAnimationFrame(kor); } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kor); else kor();
})();
