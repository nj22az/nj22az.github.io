// Övningssidan en del i taget: väljare överst, bara den valda delen visas, och eleven bockar av övningar som klara.
// Framstegen sparas i den här webbläsaren. Länkar med ?del=v40_02 eller #v40_02-q3 öppnar rätt del.
// Används på vecka-XX/aktuell/Formelstod_och_ovningar.html. Utskrift visar alla delar.
(() => {
  const delar = [...document.querySelectorAll('section.chapter[id]')];
  if (delar.length < 2) return;
  const NYCKEL = 'sj-ovningar:' + location.pathname;
  let klara = {};
  try { klara = JSON.parse(localStorage.getItem(NYCKEL) || '{}') || {}; } catch { klara = {}; }
  const spara = () => { try { localStorage.setItem(NYCKEL, JSON.stringify(klara)); } catch { /* privat läge */ } };
  const ovningar = (d) => [...d.querySelectorAll('article.exercise[id]')];
  const rubrik = (d) => d.querySelector('h2')?.textContent.trim() || d.id;

  const nav = document.createElement('nav');
  nav.className = 'ovning-delar';
  nav.setAttribute('aria-label', 'Välj del');
  document.querySelector('main h1')?.after(nav);

  for (const d of delar) {
    const status = document.createElement('p');
    status.className = 'ovning-status';
    status.setAttribute('aria-live', 'polite');
    d.querySelector('h2')?.after(status);
    for (const a of ovningar(d)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ovning-klar';
      a.append(b);
      b.addEventListener('click', () => { klara[a.id] = !klara[a.id]; spara(); rita(); });
    }
  }

  let vald = delar[0];
  const q = new URLSearchParams(location.search).get('del');
  const h = decodeURIComponent(location.hash.slice(1));
  vald = delar.find((d) => d.id === q) || delar.find((d) => h && (d.id === h || d.querySelector(`[id="${CSS.escape(h)}"]`))) || vald;

  function rita() {
    nav.innerHTML = delar.map((d, i) => {
      const alla = ovningar(d), n = alla.filter((a) => klara[a.id]).length;
      return `<a href="?del=${d.id}" data-del="${d.id}"${d === vald ? ' aria-current="page"' : ''}>Del ${i + 1}: ${rubrik(d)} <small>${n}/${alla.length}</small></a>`;
    }).join('');
    for (const d of delar) {
      d.hidden = d !== vald;
      const alla = ovningar(d), n = alla.filter((a) => klara[a.id]).length;
      d.querySelector('.ovning-status').textContent = n === alla.length ? `Alla ${alla.length} övningar klara. Bra jobbat!` : `${n} av ${alla.length} övningar klara. Bocka av en övning när du har kontrollerat ditt svar.`;
      for (const a of alla) {
        a.classList.toggle('klar', !!klara[a.id]);
        const b = a.querySelector('.ovning-klar');
        b.textContent = klara[a.id] ? '✓ Klar' : 'Markera som klar';
        b.setAttribute('aria-pressed', String(!!klara[a.id]));
      }
    }
  }
  nav.addEventListener('click', (e) => {
    const l = e.target.closest('[data-del]');
    if (!l) return;
    e.preventDefault();
    vald = delar.find((d) => d.id === l.dataset.del);
    history.replaceState(null, '', `?del=${vald.id}`);
    rita();
    nav.scrollIntoView({ block: 'start' });
  });
  rita();
  if (h && vald.querySelector(`[id="${CSS.escape(h)}"]`)) document.getElementById(h)?.scrollIntoView();

  const stil = document.createElement('style');
  stil.textContent = `.ovning-delar{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 20px}.ovning-delar a{display:inline-flex;gap:6px;align-items:center;min-height:44px;padding:6px 14px;border:1px solid var(--sj-line,#cad8e2);border-radius:999px;text-decoration:none;font-weight:700;background:#fff}.ovning-delar a[aria-current]{background:var(--sj-accent,#064f91);color:#fff;border-color:var(--sj-accent,#064f91)}.ovning-delar small{font-weight:400}.ovning-status{font-weight:700;color:var(--sj-muted,#4d6579)}.ovning-klar{margin-top:12px;min-height:44px;padding:6px 14px;border:1px solid var(--sj-line,#cad8e2);border-radius:8px;background:#fff;font:inherit;cursor:pointer}.exercise.klar .ovning-klar{background:var(--sj-ok,#176844);color:#fff;border-color:var(--sj-ok,#176844)}.exercise.klar>h3::after{content:" ✓";color:var(--sj-ok,#176844)}@media print{.ovning-delar,.ovning-status,.ovning-klar{display:none}section.chapter[hidden]{display:block!important}}`;
  document.head.append(stil);
})();
