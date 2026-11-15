/* The voyage aboard the Chisum (index.html, css/office-voyage.css).
 * - The chapter nearest the middle of the screen is the one shown: its picture fades in behind it, the rail marks it, and
 *   its vertical title shows. Within a chapter the picture creeps in as the reader scrolls (--progress).
 * - Below the waterline the water rises over the view (data-under), and the light comes down through it: shafts that
 *   sway, motes that drift, a bright, moving surface. Drawn only while it is seen, and not at all with reduced motion.
 * - Under the bow first, then under the stern as the chapter goes on.
 * - Past the last chapter the ship gives way to the Office's own sections (data-past). */
(function () {
  'use strict';
  var voyage = document.querySelector('.voyage');
  if (!voyage) return;
  var chapters = Array.prototype.slice.call(voyage.querySelectorAll('[data-chapter]'));
  var plates = {};
  voyage.querySelectorAll('.voyage-plate').forEach(function (img) { plates[img.dataset.plate] = img; });
  var rail = voyage.querySelectorAll('[data-chapter-link]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var current = -1, shownPlate = null, ticking = false;
  // Where each chapter's subject stands across its picture: a narrow screen's frame pans there (css: --focus).
  var FOCUS = { hero: '74%', explore: '64%', create: '52%', learn: '52%', below: '62%', bridge: '45%' };

  // The bio is the Office's own (config.js), so the two cannot drift apart.
  var bio = voyage.querySelector('[data-author-bio]');
  if (bio && window.CONFIG && CONFIG.author && CONFIG.author.bio) bio.textContent = CONFIG.author.bio;

  function show(name) {
    if (shownPlate === name) return;
    shownPlate = name;
    Object.keys(plates).forEach(function (k) {
      var on = k === name;
      // A picture is only fetched when its chapter is near (they are lazy); asking for it here starts that.
      if (on && plates[k].loading === 'lazy') plates[k].loading = 'eager';
      if (on) plates[k].setAttribute('data-on', ''); else plates[k].removeAttribute('data-on');
    });
  }

  function update() {
    ticking = false;
    var vh = window.innerHeight, mid = vh / 2, best = -1, bestDistance = Infinity;
    chapters.forEach(function (c, i) {
      var r = c.getBoundingClientRect();
      var d = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
      if (d < bestDistance) { bestDistance = d; best = i; }
    });
    var last = chapters[chapters.length - 1].getBoundingClientRect();
    var past = last.bottom < vh * .35;
    if (past) voyage.setAttribute('data-past', ''); else voyage.removeAttribute('data-past');
    if (best !== current) {
      current = best;
      chapters.forEach(function (c, i) { if (i === best) c.setAttribute('data-current', ''); else c.removeAttribute('data-current'); });
      rail.forEach(function (a) { if (+a.dataset.chapterLink === best) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
      var name = chapters[best].dataset.chapter;
      voyage.dataset.chapterOn = name;
      voyage.style.setProperty('--focus', FOCUS[name] || '50%');
      if (name === 'below') voyage.setAttribute('data-under', ''); else voyage.removeAttribute('data-under');
      sea.toggle(name === 'below');
    }
    var chapter = chapters[best], r = chapter.getBoundingClientRect();
    var progress = Math.max(0, Math.min(1, (mid - r.top) / Math.max(1, r.height)));
    voyage.style.setProperty('--progress', reduce.matches ? 0 : progress.toFixed(3));
    var name = chapter.dataset.chapter;
    // Under the bow until halfway through the chapter, then under her stern.
    show(name === 'below' ? (progress < .5 ? 'bulb' : 'screws') : name);
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);

  /* ── The light under water ────────────────────────────────────────────────────────────────────────────────── */
  var sea = (function () {
    var canvas = voyage.querySelector('[data-voyage-sea]');
    if (!canvas || !canvas.getContext) return { toggle: function () {} };
    var ctx = canvas.getContext('2d'), on = false, frame = 0, last = 0, w = 0, h = 0, motes = [], shafts = [];
    function seeded(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
    function size() {
      var r = canvas.getBoundingClientRect(), k = Math.min(1, 1280 / Math.max(1, r.width));
      w = canvas.width = Math.max(2, Math.round(r.width * k)); h = canvas.height = Math.max(2, Math.round(r.height * k));
      var rand = seeded(11);
      motes = []; for (var i = 0; i < 140; i++) motes.push({ x: rand() * w, y: rand() * h, r: .6 + rand() * 1.8, v: 4 + rand() * 12, s: rand() * 6.28, a: .25 + rand() * .55 });
      shafts = []; for (var j = 0; j < 7; j++) shafts.push({ x: w * (.08 + j * .14 + rand() * .06), wd: w * (.03 + rand() * .05), s: rand() * 6.28, a: .05 + rand() * .07 });
    }
    function draw(now) {
      if (!on) return;
      frame = requestAnimationFrame(draw);
      if (now - last < 33) return; // thirty times a second is enough for water
      var dt = Math.min(.1, (now - last) / 1000 || 0); last = now;
      var t = now / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      // Shafts of light from the surface, leaning with the sun and swaying with the swell.
      shafts.forEach(function (s) {
        var sway = Math.sin(t * .35 + s.s) * w * .015, top = s.x + sway, foot = top - h * .35;
        var g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, 'rgba(190,240,255,' + (s.a * (1 + .3 * Math.sin(t * .8 + s.s))).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(190,240,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(top - s.wd, 0); ctx.lineTo(top + s.wd, 0); ctx.lineTo(foot + s.wd * 2.2, h); ctx.lineTo(foot - s.wd * 2.2, h); ctx.closePath(); ctx.fill();
      });
      // The surface overhead, bright and never still.
      for (var y = 0; y < h * .12; y += 3) {
        var fade = 1 - y / (h * .12);
        ctx.strokeStyle = 'rgba(210,250,255,' + (.06 * fade).toFixed(3) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (var x = 0; x <= w; x += 24) {
          var yy = y + Math.sin(x * .012 + t * 1.3 + y * .2) * 3 + Math.sin(x * .031 - t * .9) * 2;
          if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
      // Motes drifting up through the light.
      motes.forEach(function (m) {
        m.y -= m.v * dt; m.x += Math.sin(t * .6 + m.s) * .15;
        if (m.y < -4) { m.y = h + 4; m.x = Math.random() * w; }
        ctx.fillStyle = 'rgba(220,250,255,' + (m.a * (.6 + .4 * Math.sin(t * 2 + m.s))).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
    }
    function toggle(want) {
      if (reduce.matches) want = false;
      if (want === on) return;
      on = want;
      if (on) { size(); last = 0; frame = requestAnimationFrame(draw); }
      else { cancelAnimationFrame(frame); ctx.clearRect(0, 0, w, h); }
    }
    window.addEventListener('resize', function () { if (on) size(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) { cancelAnimationFrame(frame); } else if (on) { last = 0; frame = requestAnimationFrame(draw); } });
    return { toggle: toggle };
  })();

  update();
})();
