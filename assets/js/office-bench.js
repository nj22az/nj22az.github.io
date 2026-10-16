/* Rendered World animation. Only one resident's media is fetched per visit. */
(function () {
  'use strict';
  var root = document.getElementById('office-bench');
  if (!root) return;
  var people = [
    {id:'fujita', name:'Fujita', drink:' with a beer'},
    {id:'johansson', name:'Johansson', drink:' with a J-Coffee can'},
    {id:'thuan', name:'Thuận', drink:''},
    {id:'tetsuo', name:'Tetsuo', drink:''}
  ];
  var person, key = 'office-bench-resident-v1';
  try { var saved = sessionStorage.getItem(key); person = people.find(function (p) { return p.id === saved; }); } catch (_) {}
  if (!person) {
    person = people[Math.floor(Math.random() * people.length)];
    try { sessionStorage.setItem(key, person.id); } catch (_) {}
  }
  var img = root.querySelector('img'), video = root.querySelector('video'), button = root.querySelector('button');
  var base = '/assets/office-bench/' + person.id;
  video.muted = true; video.playsInline = true;
  img.alt = person.name + ' sitting on the harbour park bench' + person.drink + '.';
  img.src = base + '.webp';
  root.querySelector('[data-resident]').textContent = person.name;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var visible = false, loaded = false, intent = 'auto', failed = false, blocked = false;
  function dataSaver() { return connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || '')); }
  function label(playing) {
    root.toggleAttribute('data-playing', playing);
    button.setAttribute('aria-label', playing ? 'Pause bench animation' : 'Play bench animation');
    button.title = playing ? 'Pause animation' : 'Play animation';
  }
  function reconcile() {
    var permitted = intent === 'play' || (!reduced.matches && !dataSaver());
    var play = loaded && visible && !document.hidden && permitted && intent !== 'pause' && !failed && !blocked;
    if (!play) {
      video.pause(); label(false);
      if (!permitted || failed) root.removeAttribute('data-motion');
      return;
    }
    if (!video.getAttribute('src')) video.src = base + '.mp4';
    var result = video.paused ? video.play() : null;
    if (result && result.catch) result.catch(function (error) { if (error.name !== 'AbortError') blocked = true; label(false); });
  }
  button.hidden = false;
  button.addEventListener('click', function () {
    intent = !video.paused ? 'pause' : 'play'; blocked = false; reconcile();
  });
  video.addEventListener('playing', function () { root.setAttribute('data-motion',''); label(true); });
  video.addEventListener('pause', function () { label(false); });
  video.addEventListener('error', function () { failed = true; root.removeAttribute('data-motion'); button.hidden = true; });
  function preferenceChanged() { intent = 'auto'; reconcile(); }
  if (reduced.addEventListener) reduced.addEventListener('change', preferenceChanged);
  else if (reduced.addListener) reduced.addListener(preferenceChanged);
  if (connection && connection.addEventListener) connection.addEventListener('change', preferenceChanged);
  document.addEventListener('visibilitychange', reconcile);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.15; reconcile(); }, {threshold:0.15}).observe(root);
  } else {
    // Older browsers keep the still; explicit play remains available.
    button.addEventListener('click', function () { visible = true; loaded = true; reconcile(); });
  }
  function afterLoad() {
    var start = function () { loaded = true; reconcile(); };
    if ('requestIdleCallback' in window) window.requestIdleCallback(start, {timeout:2000});
    else window.setTimeout(start, 250);
  }
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad, {once:true});
})();
