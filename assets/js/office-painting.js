/* The homepage painting: brushes that repaint the street, section labels, and a pointer that shows the town beneath. */
(function () {
  'use strict';
  var figure = document.getElementById('office-painting');
  if (!figure) return;
  var canvas = figure.querySelector('[data-painting-canvas]');
  var top = figure.querySelector('[data-painting-top]');
  var under = figure.querySelector('[data-painting-under]');
  var brushes = figure.querySelectorAll('.office-brushes button');
  var scene = 'The harbour road in Johansson World: Sakura Shōten under its striped awning, a small white car at the kerb and the blue quay warehouse beyond, painted in ';
  var request = 0;

  function file(look) {
    var wide = canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2) > 800;
    return '/assets/office-painting/street-' + look + '-' + (wide ? 1600 : 800) + '.webp';
  }
  // What the pointer uncovers: the game's own picture, or the watercolour when the game's picture is on top.
  function beneath() { return figure.dataset.look === 'natural' ? 'watercolour' : 'natural'; }

  function paint(button) {
    var look = button.dataset.look, mine = ++request, picture = new Image();
    brushes.forEach(function (other) { other.setAttribute('aria-pressed', String(other === button)); });
    picture.onload = function () {
      if (mine !== request) return;
      figure.dataset.changing = '';
      setTimeout(function () {
        if (mine !== request) return;
        top.removeAttribute('srcset');
        top.src = picture.src;
        top.alt = scene + button.dataset.name;
        figure.dataset.look = look;
        if (!under.hidden) under.src = file(beneath());
        delete figure.dataset.changing;
      }, 160);
    };
    picture.src = file(look);
  }
  brushes.forEach(function (button) { button.addEventListener('click', function () { paint(button); }); });

  // Create and Learn share the workshop: open it on the chosen shelf.
  figure.querySelectorAll('[data-room]').forEach(function (link) {
    link.addEventListener('click', function () {
      var filter = document.querySelector('[data-project-filter="' + link.dataset.room + '"]');
      if (filter) filter.click();
    });
  });

  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  canvas.addEventListener('pointerenter', function () {
    if (under.hidden) { under.src = file(beneath()); under.hidden = false; }
  });
  canvas.addEventListener('pointermove', function (event) {
    var box = top.getBoundingClientRect();
    figure.style.setProperty('--lens-x', (event.clientX - box.left) + 'px');
    figure.style.setProperty('--lens-y', (event.clientY - box.top) + 'px');
    // Over a label the picture stays whole, so the label is read against paint.
    if (event.target.closest('.office-rooms a') || !under.complete || !under.naturalWidth) delete figure.dataset.lens;
    else figure.dataset.lens = '';
  });
  canvas.addEventListener('pointerleave', function () { delete figure.dataset.lens; });
})();
