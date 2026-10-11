// Preserve bookmarks to Monday's worksheet, now integrated with its reference cards.
(() => {
  if (new URLSearchParams(location.search).get('las') === '1') return;
  const target = new URL('/sjoskolan/vecka-40/aktuell/Genomgang.html', location.origin);
  target.searchParams.set('del', 'franskiljning');
  target.searchParams.set('uppgift', location.hash.slice(1) || 'v2-1');
  location.replace(target.href);
})();
