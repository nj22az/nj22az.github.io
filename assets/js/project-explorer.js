/* Lightweight homepage previews. Full applications open only when requested. */
(function () {
  'use strict';
  var root = document.querySelector('#project-grid');
  if (!root) return;
  var cards = Array.from(root.querySelectorAll('[data-project-category]'));
  var toolbar = document.querySelector('#projects .px-toolbar');
  var filters = document.querySelectorAll('[data-project-filter]');
  filters.forEach(function(button) {
    button.addEventListener('click', function() {
      var selected = button.dataset.projectFilter;
      var count = 0;
      root.dataset.filter = selected;
      cards.forEach(function(card) {
        var show = selected === 'all' || card.dataset.projectCategory === selected;
        card.hidden = !show;
        if (show) count++;
      });
      filters.forEach(function(other) { other.setAttribute('aria-pressed', String(other === button)); });
      document.querySelector('#project-count').textContent = count+' '+(count === 1?'project':'projects')+' to explore';
    });
  });
  filters.forEach(function (button) {
    var filter = button.dataset.projectFilter;
    button.querySelector('span').textContent = filter === 'all' ? cards.length :
      cards.filter(function (card) { return card.dataset.projectCategory === filter; }).length;
  });
  document.querySelector('#project-count').textContent = cards.length + ' projects to explore';
  toolbar.hidden = false;

  var complete = document.querySelector('#px-complete-preview');
  if (complete) complete.addEventListener('click', function() {
    var done = complete.getAttribute('aria-pressed') === 'true';
    complete.setAttribute('aria-pressed',String(!done));
    complete.textContent = done ? 'Mark complete' : '✓ Completed';
    complete.setAttribute('aria-label',done?'Try the preview: mark the power pack’s weekly round complete':'Reset the preview of the power pack’s weekly round');
    document.querySelector('#px-preview-due').textContent = done ? '02' : '01';
    document.querySelector('#px-preview-feedback').textContent = done ? 'Try one check here. This preview does not save a record.' : 'One check complete. Open Maintenance Desk for the full checklist.';
  });
  if (complete) {
    complete.setAttribute('aria-pressed', 'false');
    complete.hidden = false;
  }
})();
