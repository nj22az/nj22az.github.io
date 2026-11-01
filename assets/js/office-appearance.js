/* Homepage appearance is independent of the other pages' colour themes. */
(function () {
  'use strict';
  var root = document.documentElement;
  var key = 'nj-office-appearance';
  var system = window.matchMedia('(prefers-color-scheme: dark)');
  var preference = null;
  var button;
  function valid(value) { return value === 'light' || value === 'dark'; }
  try { preference = localStorage.getItem(key); } catch (error) { /* Storage is optional. */ }
  if (!valid(preference)) preference = null;
  function apply() {
    var dark = (preference || (system.matches ? 'dark' : 'light')) === 'dark';
    root.setAttribute('data-office-mode', dark ? 'dark' : 'light');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#141d24' : '#f8f7f2';
    if (!button) return;
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    button.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (dark ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>' : '<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z"/>') + '</svg>';
  }
  apply();
  document.addEventListener('DOMContentLoaded', function () {
    // Shared navigation is built by another DOMContentLoaded listener.
    window.setTimeout(function () {
    var actions = document.querySelector('.office-home .nav-actions');
    if (!actions) return;
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'office-appearance-toggle';
    actions.insertBefore(button, actions.firstChild);
    button.addEventListener('click', function () {
      preference = root.getAttribute('data-office-mode') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch (error) { /* Keep the current visit usable. */ }
      apply();
    });
    apply();
    }, 0);
  });
  system.addEventListener('change', function () { if (!preference) apply(); });
  window.addEventListener('storage', function (event) {
    if (event.key !== key && event.key !== null) return;
    preference = valid(event.newValue) ? event.newValue : null;
    apply();
  });
})();
