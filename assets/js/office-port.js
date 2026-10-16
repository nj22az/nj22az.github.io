/* Rendered World animation. Only one resident's media is fetched per visit. */
(function () {
  'use strict';
  var root = document.getElementById('office-port');
  if (!root) return;
  var people = [
    {id:'fujita', name:'Fujita'},
    {id:'johansson', name:'Johansson'},
    {id:'thuan', name:'Thuận'},
    {id:'tetsuo', name:'Tetsuo'}
  ];
  var person, key = 'office-port-resident-v1';
  try { var saved = sessionStorage.getItem(key); person = people.find(function (p) { return p.id === saved; }); } catch (_) {}
  if (!person) {
    person = people[Math.floor(Math.random() * people.length)];
    try { sessionStorage.setItem(key, person.id); } catch (_) {}
  }
  var img = root.querySelector('img'), video = root.querySelector('video'), button = root.querySelector('button');
  var base = '/assets/office-port/' + person.id;
  video.muted = true; video.playsInline = true;
  var caption = root.querySelector('[data-resident]'), stillCaption = caption.textContent;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var visible = false, loaded = false, intent = 'auto', failed = false, blocked = false, finished = false;
  function dataSaver() { return connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || '')); }
  function label(playing) {
    root.toggleAttribute('data-playing', playing);
    button.setAttribute('aria-label', playing ? 'Pause port arrival' : finished ? 'Replay port arrival' : 'Play port arrival');
    button.title = playing ? 'Pause animation' : finished ? 'Replay arrival' : 'Play arrival';
  }
  function reconcile() {
    var permitted = intent === 'play' || (!reduced.matches && !dataSaver());
    var play = loaded && visible && !document.hidden && permitted && intent !== 'pause' && !failed && !blocked && !finished;
    if (!play) {
      video.pause(); label(false);
      if (!permitted || failed) { root.removeAttribute('data-motion'); caption.textContent = stillCaption; }
      return;
    }
    if (!video.getAttribute('src')) video.src = base + '.mp4';
    var result = video.paused ? video.play() : null;
    if (result && result.catch) result.catch(function (error) { if (error.name !== 'AbortError') blocked = true; label(false); });
  }
  button.hidden = false;
  button.addEventListener('click', function () {
    loaded = true; visible = true;
    intent = !video.paused ? 'pause' : 'play';
    if (finished) { finished = false; video.currentTime = 0; }
    blocked = false; reconcile();
  });
  video.addEventListener('playing', function () { root.setAttribute('data-motion',''); caption.textContent = person.name + ' · Minato port'; label(true); });
  video.addEventListener('ended', function () { finished = true; label(false); });
  video.addEventListener('pause', function () { label(false); });
  video.addEventListener('error', function () { failed = true; root.removeAttribute('data-motion'); caption.textContent = stillCaption; button.hidden = true; });
  function preferenceChanged() { intent = 'auto'; reconcile(); }
  if (reduced.addEventListener) reduced.addEventListener('change', preferenceChanged);
  else if (reduced.addListener) reduced.addListener(preferenceChanged);
  if (connection && connection.addEventListener) connection.addEventListener('change', preferenceChanged);
  document.addEventListener('visibilitychange', reconcile);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.15; reconcile(); }, {threshold:0.15}).observe(root);
  }
  function afterLoad() {
    var start = function () { loaded = true; reconcile(); };
    if ('requestIdleCallback' in window) window.requestIdleCallback(start, {timeout:2000});
    else window.setTimeout(start, 250);
  }
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad, {once:true});
})();

