/* Progressive filters; the complete register remains readable without JS. */
(function () {
  'use strict';
  var form = document.querySelector('[data-hotel-filters]');
  if (!form) return;
  var rows = Array.from(document.querySelectorAll('[data-hotel-row]'));
  var reviews = Array.from(document.querySelectorAll('[data-hotel-note]'));
  var groups = Array.from(document.querySelectorAll('[data-hotel-group]'));
  var count = document.querySelector('[data-hotel-count]');
  var empty = document.querySelector('[data-hotel-empty]');
  var table = document.querySelector('[data-hotel-table]');
  var notes = document.querySelector('[data-hotel-notes]');
  var choiceCounts = Array.from(document.querySelectorAll('[data-parking-count]'));
  var discovery = document.querySelector('[data-hotel-discovery]');
  var viewSwitch = document.querySelector('[data-hotel-view-switch]');
  var query = form.elements.namedItem('search');
  var country = form.elements.namedItem('country');
  var chain = form.elements.namedItem('chain');
  var parking = form.elements.namedItem('parking');
  var receipt = form.elements.namedItem('receipt');
  var parkingNames = { free: 'with free parking', easy: 'with easy parking', avoid: 'to avoid', '': '' };

  function normalise(value) {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('en').replace(/ø/g, 'o').replace(/æ/g, 'ae');
  }

  function plural(n) { return n === 1 ? 'hotel' : 'hotels'; }

  function filter() {
    var terms = normalise(query.value.trim()).split(/\s+/).filter(Boolean);
    var visible = new Set();
    var tally = { free: 0, easy: 0, avoid: 0, all: 0 };
    rows.forEach(function (row) {
      var text = normalise(row.dataset.search);
      // Everything except the parking choice, so each choice can show what it would find.
      var place = terms.every(function (term) { return text.includes(term); }) &&
        (!country.value || row.dataset.country === country.value) &&
        (!chain.value || row.dataset.chain === chain.value) &&
        (!receipt.value || row.dataset.hotelReceipt === receipt.value);
      if (place) { tally[row.dataset.parkingCategory] += 1; tally.all += 1; }
      var show = place && (!parking.value || row.dataset.parkingCategory === parking.value);
      row.hidden = !show;
      if (show) visible.add(row.dataset.hotelRow);
    });
    reviews.forEach(function (review) { review.hidden = !visible.has(review.dataset.hotelNote); });
    groups.forEach(function (group) {
      var shown = group.querySelectorAll('[data-hotel-note]:not([hidden])').length;
      group.hidden = shown === 0;
      group.querySelector('[data-hotel-group-count]').textContent = shown + ' ' + plural(shown);
    });
    choiceCounts.forEach(function (badge) { badge.textContent = tally[badge.dataset.parkingCount]; });
    var description = parkingNames[parking.value] || '';
    count.textContent = visible.size + ' ' + plural(visible.size) + (description ? ' ' + description : '');
    empty.hidden = visible.size !== 0;
    table.hidden = visible.size === 0;
    notes.hidden = visible.size === 0;
    document.dispatchEvent(new CustomEvent('hotel-filter-change', { detail: { visibleIds: Array.from(visible) } }));
  }

  // On narrow screens the list and the map take turns behind a floating switch;
  // wide screens show both side by side and never show the switch.
  var listScroll = null;
  function setView(view, restore) {
    if (!discovery || !viewSwitch || discovery.dataset.view === view) return;
    if (view === 'map') listScroll = window.scrollY;
    discovery.dataset.view = view;
    viewSwitch.querySelectorAll('[data-hotel-view]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.hotelView === view));
    });
    document.dispatchEvent(new CustomEvent('hotel-view-change', { detail: { view: view } }));
    if (!restore || !window.matchMedia('(max-width: 1000px)').matches) return;
    var top = view === 'list' && listScroll !== null ? listScroll : discovery.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo(0, Math.max(0, top));
  }

  if (discovery && viewSwitch) {
    discovery.dataset.view = 'list';
    viewSwitch.hidden = false;
    viewSwitch.addEventListener('click', function (event) {
      var button = event.target.closest('[data-hotel-view]');
      if (button) setView(button.dataset.hotelView, true);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        viewSwitch.hidden = !entries[0].isIntersecting;
      }).observe(discovery);
    }
    // Capture phase: the right view is showing before the map or the browser acts on the link.
    document.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('a');
      if (!link) return;
      if (link.hasAttribute('data-hotel-focus')) setView('map');
      else if (/^#review-/.test(link.getAttribute('href') || '')) setView('list');
    }, true);
  }

  form.addEventListener('input', filter);
  form.addEventListener('change', filter);
  form.addEventListener('submit', function (event) { event.preventDefault(); filter(); });
  form.addEventListener('reset', function () { window.setTimeout(filter, 0); });
  form.hidden = false;
  filter();
})();
