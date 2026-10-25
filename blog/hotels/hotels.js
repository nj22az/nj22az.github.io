/* Progressive filters; the complete register remains readable without JS. */
(function () {
  'use strict';
  var form = document.querySelector('[data-hotel-filters]');
  if (!form) return;
  var rows = Array.from(document.querySelectorAll('[data-hotel-row]'));
  var reviews = Array.from(document.querySelectorAll('[data-hotel-note]'));
  var count = document.querySelector('[data-hotel-count]');
  var empty = document.querySelector('[data-hotel-empty]');
  var table = document.querySelector('[data-hotel-table]');
  var notes = document.querySelector('[data-hotel-notes]');
  var query = form.elements.namedItem('search');
  var country = form.elements.namedItem('country');
  var chain = form.elements.namedItem('chain');
  var parking = form.elements.namedItem('parking');
  var receipt = form.elements.namedItem('receipt');

  function normalise(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('en').replace(/ø/g, 'o').replace(/æ/g, 'ae');
  }

  function matchesParking(row, filter) {
    return !filter || row.dataset.parkingCategory === filter;
  }

  function filter() {
    var terms = normalise(query.value.trim()).split(/\s+/).filter(Boolean);
    var visible = new Set();
    rows.forEach(function (row) {
      var text = normalise(row.dataset.search);
      var show = terms.every(function (term) { return text.includes(term); }) &&
        (!country.value || row.dataset.country === country.value) &&
        (!chain.value || row.dataset.chain === chain.value) &&
        matchesParking(row, parking.value) &&
        (!receipt.value || row.dataset.hotelReceipt === receipt.value);
      row.hidden = !show;
      if (show) visible.add(row.dataset.hotelRow);
    });
    reviews.forEach(function (review) { review.hidden = !visible.has(review.dataset.hotelNote); });
    count.textContent = visible.size + ' of ' + rows.length + ' ' + (rows.length === 1 ? 'hotel' : 'hotels') + ' shown';
    empty.hidden = visible.size !== 0;
    table.hidden = visible.size === 0;
    notes.hidden = visible.size === 0;
    document.dispatchEvent(new CustomEvent('hotel-filter-change', { detail: { visibleIds: Array.from(visible) } }));
  }

  form.addEventListener('input', filter);
  form.addEventListener('change', filter);
  form.addEventListener('submit', function (event) { event.preventDefault(); filter(); });
  form.addEventListener('reset', function () { window.setTimeout(filter, 0); });
  form.hidden = false;
  filter();
})();
