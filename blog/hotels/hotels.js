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
  var parking = form.elements.namedItem('parking');
  var receipt = form.elements.namedItem('receipt');

  function normalise(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('en');
  }

  function matchesParking(row, filter) {
    if (filter === 'free') return row.dataset.freeParking === 'true';
    if (filter === 'free-easy') return row.dataset.freeParking === 'true' && row.dataset.easyParking === 'true';
    if (filter === 'external-paid') return row.dataset.parkingType === 'external-paid';
    if (filter === 'paid') return row.dataset.freeParking === 'false';
    return true;
  }

  function filter() {
    var terms = normalise(query.value.trim()).split(/\s+/).filter(Boolean);
    var visible = new Set();
    rows.forEach(function (row) {
      var text = normalise(row.dataset.search);
      var show = terms.every(function (term) { return text.includes(term); }) &&
        matchesParking(row, parking.value) &&
        (!receipt.value || row.dataset.hotelReceipt === receipt.value);
      row.hidden = !show;
      if (show) visible.add(row.dataset.hotelRow);
    });
    reviews.forEach(function (review) { review.hidden = !visible.has(review.dataset.hotelNote); });
    count.textContent = visible.size + ' of ' + rows.length + ' hotel ' + (rows.length === 1 ? 'review' : 'reviews') + ' shown';
    empty.hidden = visible.size !== 0;
    table.hidden = visible.size === 0;
    notes.hidden = visible.size === 0;
  }

  form.addEventListener('input', filter);
  form.addEventListener('change', filter);
  form.addEventListener('submit', function (event) { event.preventDefault(); filter(); });
  form.addEventListener('reset', function () { window.setTimeout(filter, 0); });
  form.hidden = false;
  filter();
})();
