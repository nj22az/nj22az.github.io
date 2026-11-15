/* The homepage painting.
 * - The street is a painted still (assets/office-painting/street-<look>-<width>.webp) until the film can be painted live
 *   (office-painting-live.js: the game's own street, through Pocket Camera's engine). Reduced motion keeps the still.
 * - A Look is changed with the brush: the old painting is scrubbed away in strokes and the new one is under it.
 * - With a mouse, the pointer wipes the paint off and shows the town as the game draws it; the paint flows back.
 * - The section scenes further down follow the chosen Look and are brushed in as they come into view.
 * - The chosen Look is kept in this browser (a convenience only). */
(function () {
  'use strict';
  var figure = document.getElementById('office-painting');
  if (!figure) return;
  var LOOKS = ['print', 'watercolour', 'sketchbook', 'manga', 'cyanotype', 'natural'];
  var KEY = 'office-painting-look';
  var DIR = '/assets/office-painting/';
  var stage = figure.querySelector('[data-painting-stage]');
  var still = figure.querySelector('[data-painting-still]');
  var liveCanvas = figure.querySelector('[data-painting-live]');
  var brushwork = figure.querySelector('[data-painting-brushwork]');
  var buttons = Array.prototype.slice.call(figure.querySelectorAll('.office-palette [data-look]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var scene = 'The harbour road in Johansson World at half past six in the morning: Sakura Shōten under its striped awning, a small white car at the kerb and the blue quay warehouse beyond, as ';
  var look = 'print';
  var live = null;          // the live painter, once it runs
  var pictures = {};        // painted stills, loaded on demand

  function width(el) { return (el.clientWidth || 800) * Math.min(window.devicePixelRatio || 1, 2) > 900 ? 1600 : 800; }
  function stillUrl(name, w) { return DIR + 'street-' + name + '-' + w + '.webp'; }
  function picture(url) {
    if (pictures[url]) return pictures[url];
    var img = new Image();
    img.decoding = 'async';
    img.src = url;
    pictures[url] = img.decode ? img.decode().then(function () { return img; }) : new Promise(function (ok, no) { img.onload = function () { ok(img); }; img.onerror = no; });
    return pictures[url];
  }
  function remember(name) { try { localStorage.setItem(KEY, name); } catch (_) {} }
  function remembered() { try { var v = localStorage.getItem(KEY); return LOOKS.indexOf(v) >= 0 ? v : null; } catch (_) { return null; } }

  /* ── Brushwork: broad strokes, laid one under another, each with a ragged edge and bristle lines ───────────── */
  function seeded(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function strokes(w, h, seed) {
    var rand = seeded(seed || 7), n = 6, list = [], band = h / n;
    for (var i = 0; i < n; i++) {
      var y = band * (i + .5) + (rand() - .5) * band * .25, tilt = (rand() - .5) * band * .5, ltr = i % 2 === 0;
      list.push({ x0: ltr ? -w * .05 : w * 1.05, x1: ltr ? w * 1.05 : -w * .05, y0: y - tilt, y1: y + tilt, r: band * (.78 + rand() * .12),
        start: i * .085, end: i * .085 + .5, done: 0, seed: rand() * 1000 });
    }
    return list;
  }
  // Draws each stroke from where it had reached to where it now reaches (t from 0 to 1). A stroke is a band of bristle
  // tracks drawn as continuous lines: the middle ones take everything off, the outer ones only part, as a drying brush
  // does, so its edges are soft and streaked rather than cut.
  var TRACKS = 18;
  function brush(ctx, list, t) {
    ctx.lineCap = 'round';
    for (var i = 0; i < list.length; i++) {
      var s = list[i], p = Math.max(0, Math.min(1, (t - s.start) / (s.end - s.start)));
      p = 1 - Math.pow(1 - p, 2.2);
      if (p <= s.done) continue;
      var dx = s.x1 - s.x0, dy = s.y1 - s.y0, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
      if (!s.tracks) s.tracks = [];
      for (var k = 0; k < TRACKS; k++) {
        var off = k / (TRACKS - 1) * 2 - 1, edge = Math.abs(off);
        // Each bristle trails the middle of the brush a little, the outer ones most: the stroke's head is round and ragged.
        var lag = s.r * (.9 * off * off + .3 * Math.abs(Math.sin(k * 7.3 + s.seed))) / len;
        var from = s.tracks[k] || 0, to = Math.max(0, p - lag);
        if (p >= 1) to = 1;
        if (to <= from) continue;
        var steps = Math.max(1, Math.ceil((to - from) * len / 8));
        // Faint bristles are butt-ended: round ends would overlap from frame to frame and leave beads.
        ctx.lineCap = edge > .78 ? 'butt' : 'round';
        ctx.globalAlpha = edge > .78 ? .35 + .4 * Math.abs(Math.sin(k * 12.9898 + s.seed)) : 1;
        ctx.lineWidth = s.r * 2 / TRACKS * (edge > .78 ? 1.1 : 2.2);
        ctx.beginPath();
        for (var j = 0; j <= steps; j++) {
          var q = from + (to - from) * j / steps;
          // The band breathes along its length, as pressure on a brush does.
          var w = s.r * (1 + .07 * Math.sin(q * 8 + s.seed) + .04 * Math.sin(q * 21 + k + s.seed)) * off;
          var x = s.x0 + dx * q + nx * w, y = s.y0 + dy * q + ny * w;
          if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        s.tracks[k] = to;
      }
      ctx.globalAlpha = 1;
      s.done = p;
    }
  }
  // A layer that hides `target` and is scrubbed away. `cover(ctx,w,h)` paints what is being taken off.
  function scrub(canvas, cover, done) {
    var ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
    ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, w, h); cover(ctx, w, h);
    if (reduce.matches) { ctx.clearRect(0, 0, w, h); if (done) done(); return { cancel: function () {} }; }
    var list = strokes(w, h, 1 + Math.floor(Math.random() * 9999)), t0 = performance.now(), duration = 1300, frame = 0;
    ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.strokeStyle = '#000';
    function tick(now) {
      var t = Math.min(1, (now - t0) / duration);
      brush(ctx, list, t);
      if (t > .82) { ctx.globalAlpha = .3; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
      if (t < 1) frame = requestAnimationFrame(tick);
      else { ctx.clearRect(0, 0, w, h); ctx.globalCompositeOperation = 'source-over'; if (done) done(); }
    }
    frame = requestAnimationFrame(tick);
    return { cancel: function () { cancelAnimationFrame(frame); ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, w, h); } };
  }
  function fit(canvas, el, max) {
    var r = el.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2), k = Math.min(1, (max || 1600) / Math.max(1, r.width * dpr));
    var w = Math.max(2, Math.round(r.width * dpr * k)), h = Math.max(2, Math.round(r.height * dpr * k));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  /* ── The street ───────────────────────────────────────────────────────────────────────────────────────────── */
  var stroke = null, request = 0, busy = false;
  function showStill(name, w) {
    var url = stillUrl(name, w);
    still.removeAttribute('srcset');
    still.src = url;
    still.alt = scene + (buttons.filter(function (b) { return b.dataset.look === name; })[0] || {}).dataset.name;
  }
  function paint(name, button) {
    if (LOOKS.indexOf(name) < 0) return;
    var mine = ++request, w = width(stage);
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.look === name)); });
    remember(name);
    var ready = live ? live.prepare(name) : picture(stillUrl(name, w));
    Promise.resolve(ready).then(function () {
      if (mine !== request) return;
      fit(brushwork, stage);
      if (stroke) stroke.cancel();
      busy = false;
      // What is on the canvas now becomes the layer that is scrubbed away.
      var old = live && figure.hasAttribute('data-live') ? live.snapshot() : still;
      busy = true;
      stroke = scrub(brushwork, function (ctx, cw, ch) { try { ctx.drawImage(old, 0, 0, cw, ch); } catch (_) {} }, function () { busy = false; });
      look = name;
      figure.dataset.look = name;
      if (live) live.use(name);
      showStill(name, w);
      scenes.forEach(function (s) { s.use(name); });
    }).catch(function () {});
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { paint(b.dataset.look, b); }); });

  /* ── The pointer wipes the paint and shows the game's colours; the paint flows back in ────────────────────── */
  var wipe = { canvas: document.createElement('canvas'), active: false, last: null, until: 0, frame: 0, natural: null };
  function wipeFrame() {
    var ctx = brushwork.getContext('2d'), w = brushwork.width, h = brushwork.height, m = wipe.canvas.getContext('2d');
    // The paint flows back.
    m.globalCompositeOperation = 'destination-out'; m.fillStyle = 'rgba(0,0,0,.045)'; m.fillRect(0, 0, wipe.canvas.width, wipe.canvas.height);
    m.globalCompositeOperation = 'source-over';
    if (!busy) {
      ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, w, h);
      var source = live && figure.hasAttribute('data-live') ? live.video : wipe.natural;
      if (source) { ctx.drawImage(source, 0, 0, w, h); ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(wipe.canvas, 0, 0, w, h); ctx.globalCompositeOperation = 'source-over'; }
    }
    if (performance.now() < wipe.until) wipe.frame = requestAnimationFrame(wipeFrame);
    else { wipe.active = false; if (!busy) ctx.clearRect(0, 0, w, h); }
  }
  function dab(x, y) {
    var m = wipe.canvas.getContext('2d'), r = wipe.canvas.width * .045, g = m.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(.6, 'rgba(0,0,0,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    m.fillStyle = g; m.beginPath(); m.arc(x, y, r, 0, Math.PI * 2); m.fill();
  }
  function onMove(e) {
    if (look === 'natural' || !wipe.natural && !live) return;
    if (e.target.closest && e.target.closest('.office-signs a,.office-slip,.office-palette')) { wipe.last = null; return; }
    var r = stage.getBoundingClientRect(), k = wipe.canvas.width / r.width, x = (e.clientX - r.left) * k, y = (e.clientY - r.top) * k;
    if (wipe.last) { var dx = x - wipe.last[0], dy = y - wipe.last[1], n = Math.ceil(Math.hypot(dx, dy) / 6); for (var i = 1; i <= n; i++) dab(wipe.last[0] + dx * i / n, wipe.last[1] + dy * i / n); }
    else dab(x, y);
    wipe.last = [x, y];
    wipe.until = performance.now() + 2600;
    if (!wipe.active) { wipe.active = true; fit(brushwork, stage); wipe.frame = requestAnimationFrame(wipeFrame); }
  }
  if (finePointer.matches) {
    var hero = figure.querySelector('.office-canvas');
    hero.addEventListener('pointerenter', function () {
      var r = stage.getBoundingClientRect();
      wipe.canvas.width = Math.max(2, Math.round(r.width / 4)); wipe.canvas.height = Math.max(2, Math.round(r.height / 4));
      if (!wipe.natural && !live) picture(stillUrl('natural', width(stage))).then(function (img) { wipe.natural = img; });
    });
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', function () { wipe.last = null; });
  }

  /* ── Signs stay inside the frame: where the street is cropped (narrow or tall screens), a sign near the cut is
     moved along its wall just enough to be read whole. */
  var frame = figure.querySelector('.office-canvas');
  function keepSignsInFrame() {
    var box = frame.getBoundingClientRect(), margin = 12;
    figure.querySelectorAll('.office-signs a').forEach(function (sign) {
      sign.style.translate = '';
      if (getComputedStyle(sign).position !== 'absolute') return;
      var r = sign.getBoundingClientRect(), dx = 0;
      if (r.right > box.right - margin) dx = box.right - margin - r.right;
      if (r.left + dx < box.left + margin) dx = box.left + margin - r.left;
      if (dx) sign.style.translate = Math.round(dx) + 'px 0';
    });
  }
  keepSignsInFrame();
  if (window.ResizeObserver) new ResizeObserver(keepSignsInFrame).observe(frame);
  else window.addEventListener('resize', keepSignsInFrame);

  /* ── Signs: Create and Learn share the workshop, so they open it on their own shelf ───────────────────────── */
  figure.querySelectorAll('[data-room]').forEach(function (link) {
    link.addEventListener('click', function () {
      var filter = document.querySelector('[data-project-filter="' + link.dataset.room + '"]');
      if (filter) filter.click();
    });
  });

  /* ── Section scenes ───────────────────────────────────────────────────────────────────────────────────────── */
  var scenes = Array.prototype.slice.call(document.querySelectorAll('.office-scene')).map(function (el) {
    var img = el.querySelector('[data-scene-still]'), canvas = el.querySelector('[data-scene-brushwork]'), key = el.dataset.scene, shown = false, current = 'print';
    function url(name) { return DIR + key + '-' + name + '-' + width(el) + '.webp'; }
    function paper(ctx, w, h) { ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#f8f7f2'; ctx.fillRect(0, 0, w, h); }
    // Until it is seen, the scene is blank paper; the first look at it brushes it in.
    if (!reduce.matches) { fit(canvas, el, 1200); paper(canvas.getContext('2d'), canvas.width, canvas.height); }
    var seen = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      seen.disconnect();
      (img.complete && img.naturalWidth ? Promise.resolve() : new Promise(function (ok) { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ok, { once: true }); })).then(function () {
        shown = true; fit(canvas, el, 1200); scrub(canvas, paper);
      });
    }, { threshold: .35 });
    seen.observe(el);
    return {
      use: function (name) {
        if (name === current) return;
        current = name;
        var next = url(name);
        picture(next).then(function () {
          if (current !== name) return;
          if (shown) { fit(canvas, el, 1200); scrub(canvas, function (ctx, w, h) { try { ctx.drawImage(img, 0, 0, w, h); } catch (_) {} }); }
          img.removeAttribute('srcset'); img.src = next;
        });
      }
    };
  });

  /* ── The remembered Look ──────────────────────────────────────────────────────────────────────────────────── */
  var first = remembered();
  if (first && first !== look) {
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.look === first)); });
    look = first; figure.dataset.look = first; showStill(first, width(stage));
    scenes.forEach(function (s) { s.use(first); });
  }

  /* ── The film, painted live: only with motion allowed, WebGL2, no data saving, and once the page has settled ─ */
  var connection = navigator.connection || {};
  var canGL = (function () { try { return !!document.createElement('canvas').getContext('webgl2'); } catch (_) { return false; } })();
  function startLive() {
    if (live || reduce.matches || !canGL || connection.saveData || /(^|-)2g$/.test(connection.effectiveType || '')) return;
    import('/assets/js/office-painting-live.js?v=20261115').then(function (m) {
      return m.start({ figure: figure, stage: stage, canvas: liveCanvas, look: function () { return look; } });
    }).then(function (painter) { live = painter; }).catch(function () { /* The still stays: it is the same street. */ });
  }
  if (document.readyState === 'complete') setTimeout(startLive, 600);
  else window.addEventListener('load', function () { setTimeout(startLive, 600); }, { once: true });
})();
