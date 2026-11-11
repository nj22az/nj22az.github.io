// Saving the ferry for a flight, and putting her on the Home Screen.
//
// The owner, 11 November 2026: "Make a install to Home Screen and download offline button so I don't need a connection to
// look at it". "Save offline" fetches every file the page needs (offline-files.js) and keeps it; from then on the page's
// service worker (sw.js) gives the saved copy whenever the network does not answer. "Install" asks the browser to put the
// page on the Home Screen; on an iPhone or iPad the browser has no such request, so it says where the command is.
(() => {
  const { cache: CACHE, files: FILES } = self.CHISUM_OFFLINE;
  const save = document.getElementById('offline'), install = document.getElementById('install'), say = document.getElementById('what');
  const tell = text => { say.textContent = text; };
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (!('serviceWorker' in navigator) || !('caches' in window)) { save.hidden = true; install.hidden = true; return; }
  navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => { save.hidden = true; });

  const saved = async () => { const cache = await caches.open(CACHE); for (const f of FILES) if (!(await cache.match(location.origin + f))) return false; return true; };
  const mark = on => { save.textContent = on ? 'Saved offline' : 'Save offline'; save.setAttribute('aria-pressed', on ? 'true' : 'false'); };
  saved().then(mark);

  save.addEventListener('click', async () => {
    save.disabled = true;
    try {
      const cache = await caches.open(CACHE);
      let done = 0, bytes = 0;
      for (const f of FILES) {
        tell(`Saving for offline: ${done + 1} of ${FILES.length}`);
        const response = await fetch(f, { cache: 'reload' });
        if (!response.ok) throw new Error(`${f}: ${response.status}`);
        const copy = response.clone();
        await cache.put(location.origin + f, response);
        bytes += (await copy.arrayBuffer()).byteLength;
        done++;
      }
      mark(true);
      tell(`Saved: ${FILES.length} files, ${(bytes / 1e6).toFixed(1)} MB. She now opens without a connection.` + (standalone ? '' : ' Install puts her on the Home Screen.'));
    } catch (error) {
      mark(await saved());
      tell('Not saved: the connection dropped. Try again while online.');
    }
    save.disabled = false;
  });

  // ---- the Home Screen
  if (standalone) { install.hidden = true; return; }
  let ask = null;
  addEventListener('beforeinstallprompt', event => { event.preventDefault(); ask = event; });
  addEventListener('appinstalled', () => { install.hidden = true; tell('Installed on the Home Screen.'); });
  install.addEventListener('click', async () => {
    if (ask) { ask.prompt(); await ask.userChoice; ask = null; return; }
    const apple = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    tell(apple ? 'On iPhone or iPad: tap Share, then Add to Home Screen.' : 'In the browser’s menu choose Install app, or Add to Home Screen.');
  });
})();
