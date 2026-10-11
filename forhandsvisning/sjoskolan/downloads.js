/* Datumet beskriver nedladdningen, inte när kursmaterialet skrevs. */
(function () {
  'use strict';

  const fileTypes = /\.(pptx?|pdf|docx?|xlsx?|zip|csv|txt|png|jpe?g|webp|svg)$/i;
  const currentFolder = /\/sjoskolan\/vecka-\d+\/aktuell\//i;
  const pad = value => String(value).padStart(2, '0');

  function filenameAtDownload(filename, date) {
    const dot = filename.lastIndexOf('.');
    const stem = dot > 0 ? filename.slice(0, dot) : filename;
    const extension = dot > 0 ? filename.slice(dot) : '';
    const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const time = `${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
    return `${stem}_nedladdad_${day}_${time}${extension}`;
  }

  function stamp(link) {
    if (!link || !link.href) return;
    const url = new URL(link.href, document.baseURI);
    if (url.origin !== window.location.origin || !currentFolder.test(url.pathname)) return;
    const filename = decodeURIComponent(url.pathname.split('/').pop());
    if (!fileTypes.test(filename)) return;
    link.download = filenameAtDownload(filename, new Date());
  }

  function stampActivatedLink(event) {
    const target = event.target;
    stamp(target && typeof target.closest === 'function' ? target.closest('a[href]') : null);
  }

  // Native downloads preserve the original bytes and stream large PowerPoints.
  // Capture refreshes the filename at the actual click, including keyboard clicks.
  document.querySelectorAll('a[href]').forEach(stamp);
  ['click', 'pointerdown', 'contextmenu', 'focusin'].forEach(type => {
    document.addEventListener(type, stampActivatedLink, true);
  });
})();
