/* Progressive feed: filters, saved hotels, notes and trip order. Every post stays readable without JS. */
(function () {
  'use strict';
  var form = document.querySelector('[data-hotel-filters]');
  if (!form) return;
  var rows = Array.from(document.querySelectorAll('[data-hotel-row]'));
  var posts = Array.from(document.querySelectorAll('[data-hotel-note]'));
  var feed = document.querySelector('[data-hotel-notes]');
  var count = document.querySelector('[data-hotel-count]');
  var empty = document.querySelector('[data-hotel-empty]');
  var table = document.querySelector('[data-hotel-table]');
  var choiceCounts = Array.from(document.querySelectorAll('[data-parking-count]'));
  var countryCounts = Array.from(document.querySelectorAll('[data-country-count]'));
  var countryTags = Array.from(document.querySelectorAll('[data-hotel-country]'));
  var savedOption = document.querySelector('[data-hotel-saved-option]');
  var filterCount = document.querySelector('[data-hotel-filter-count]');
  var discovery = document.querySelector('[data-hotel-discovery]');
  var viewSwitch = document.querySelector('[data-hotel-view-switch]');
  var query = form.elements.namedItem('search');
  var country = form.elements.namedItem('country');
  var chain = form.elements.namedItem('chain');
  var parking = form.elements.namedItem('parking');
  var receipt = form.elements.namedItem('receipt');
  var cardHold = form.elements.namedItem('cardhold');
  var parkingNames = { free: 'with free parking', easy: 'with easy parking', avoid: 'to avoid', saved: 'saved', '': '' };
  var categoryOf = {};
  rows.forEach(function (row) { categoryOf[row.dataset.hotelRow] = row.dataset.parkingCategory; });

  // Saved hotels are a per-browser convenience; the page works the same without storage.
  var STORE = 'nj-hotel-saved';
  var saved = new Set();
  try { saved = new Set(JSON.parse(localStorage.getItem(STORE) || '[]')); } catch (error) { saved = new Set(); }
  function keepSaved() { try { localStorage.setItem(STORE, JSON.stringify(Array.from(saved))); } catch (error) { /* not stored */ } }

  function normalise(value) {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('en').replace(/ø/g, 'o').replace(/æ/g, 'ae');
  }

  function plural(n) { return n === 1 ? 'hotel' : 'hotels'; }

  function filter() {
    var terms = normalise(query.value.trim()).split(/\s+/).filter(Boolean);
    var visible = new Set();
    var tally = { free: 0, easy: 0, avoid: 0, all: 0, saved: 0 };
    var byCountry = {};
    rows.forEach(function (row) {
      var id = row.dataset.hotelRow;
      var text = normalise(row.dataset.search);
      // Everything except the parking choice, so each choice can show what it would find.
      var anywhere = terms.every(function (term) { return text.includes(term); }) &&
        (!chain.value || row.dataset.chain === chain.value) &&
        (!receipt.value || row.dataset.hotelReceipt === receipt.value) &&
        (!cardHold.value || row.dataset.cardHold === cardHold.value) &&
        (parking.value === 'saved' ? saved.has(id) : !parking.value || row.dataset.parkingCategory === parking.value);
      if (anywhere) byCountry[row.dataset.country] = (byCountry[row.dataset.country] || 0) + 1;
      var place = terms.every(function (term) { return text.includes(term); }) &&
        (!country.value || row.dataset.country === country.value) &&
        (!chain.value || row.dataset.chain === chain.value) &&
        (!receipt.value || row.dataset.hotelReceipt === receipt.value) &&
        (!cardHold.value || row.dataset.cardHold === cardHold.value);
      if (place) { tally[row.dataset.parkingCategory] += 1; tally.all += 1; if (saved.has(id)) tally.saved += 1; }
      var show = place && (parking.value === 'saved' ? saved.has(id) : !parking.value || row.dataset.parkingCategory === parking.value);
      row.hidden = !show;
      if (show) visible.add(id);
    });
    posts.forEach(function (post) { post.hidden = !visible.has(post.dataset.hotelNote); });
    choiceCounts.forEach(function (badge) { badge.textContent = tally[badge.dataset.parkingCount]; });
    countryCounts.forEach(function (badge) { badge.textContent = byCountry[badge.dataset.countryCount] || 0; });
    countryTags.forEach(function (tag) { tag.setAttribute('aria-pressed', String(!!country.value && tag.dataset.hotelCountry === country.value)); });
    if (savedOption) savedOption.hidden = saved.size === 0 && parking.value !== 'saved';
    var active = [country.value, chain.value, receipt.value, cardHold.value].filter(Boolean).length;
    if (filterCount) { filterCount.hidden = active === 0; filterCount.textContent = active; }
    var description = parkingNames[parking.value] || '';
    count.textContent = visible.size + ' ' + plural(visible.size) + (description ? ' ' + description : '');
    empty.hidden = visible.size !== 0;
    table.hidden = visible.size === 0;
    feed.hidden = visible.size === 0;
    document.dispatchEvent(new CustomEvent('hotel-filter-change', { detail: { visibleIds: Array.from(visible) } }));
  }

  // A country tag on a post or in the toolbar filters to that country; pressing it again clears it.
  countryTags.forEach(function (tag) {
    tag.addEventListener('click', function () {
      country.value = country.value === tag.dataset.hotelCountry ? '' : tag.dataset.hotelCountry;
      filter();
    });
  });

  // A post is a closed card: name, verdict and facts. Tapping it, or Notes or Photos, folds out its photos and notes.
  function setOpen(post, open) {
    var more = post.querySelector('.hotel-post-more');
    post.classList.toggle('is-open', open);
    if (more) more.inert = !open;
    post.querySelectorAll('[data-hotel-thread]').forEach(function (button) { button.setAttribute('aria-expanded', String(open)); });
  }
  posts.forEach(function (post) {
    var toggles = post.querySelectorAll('[data-hotel-thread]');
    if (toggles.length && post.querySelector('.hotel-post-more')) {
      post.classList.add('is-card');
      setOpen(post, false);
      toggles.forEach(function (toggle) {
        toggle.hidden = false;
        toggle.addEventListener('click', function () { setOpen(post, !post.classList.contains('is-open')); });
      });
      post.addEventListener('click', function (event) {
        if (event.target.closest('a,button,input,select,label,.hotel-post-more')) return;
        if (window.getSelection && String(window.getSelection())) return;
        setOpen(post, !post.classList.contains('is-open'));
      });
    }
    var save = post.querySelector('[data-hotel-save]');
    if (save) {
      var id = save.dataset.hotelSave;
      save.hidden = false;
      save.setAttribute('aria-pressed', String(saved.has(id)));
      save.addEventListener('click', function () {
        if (saved.has(id)) saved.delete(id); else saved.add(id);
        save.setAttribute('aria-pressed', String(saved.has(id)));
        keepSaved();
        filter();
      });
    }
    var share = post.querySelector('[data-hotel-share]');
    if (share && (navigator.share || (navigator.clipboard && window.isSecureContext))) {
      share.hidden = false;
      share.addEventListener('click', function () {
        var url = location.origin + location.pathname + '#' + post.id;
        var title = post.querySelector('h4').textContent;
        if (navigator.share) { navigator.share({ title: title, url: url }).catch(function () {}); return; }
        navigator.clipboard.writeText(url).then(function () {
          share.lastChild.textContent = 'Link copied';
          window.setTimeout(function () { share.lastChild.textContent = 'Share'; }, 2000);
        });
      });
    }
  });

  // Opening a post from a link (a map popup, the trip card, the table) opens its notes too.
  function openNotes(id) {
    var post = document.getElementById(id);
    if (post && post.classList.contains('is-card')) setOpen(post, true);
  }

  // A planned trip orders the feed by suitability and says why on each post; clearing restores place order.
  var placeOrder = posts.slice();
  document.addEventListener('hotel-trip-change', function (event) {
    var picks = (event.detail && event.detail.picks) || [];
    var lines = new Map(picks.map(function (pick) { return [pick.id, pick]; }));
    var ordered = picks.map(function (pick) { return document.getElementById('review-' + pick.id); }).filter(Boolean);
    placeOrder.forEach(function (post) { if (!lines.has(post.dataset.hotelNote)) ordered.push(post); });
    ordered.forEach(function (post) {
      feed.appendChild(post);
      var line = post.querySelector('[data-hotel-trip-line]');
      var pick = lines.get(post.dataset.hotelNote);
      line.hidden = !pick;
      line.textContent = pick ? pick.rank + ' · ' + pick.line : '';
    });
    if (picks.length && parking.value !== 'free' && parking.value !== '') {
      form.querySelector('input[name=parking][value=free]').checked = true;
    }
    filter();
  });

  // On narrow screens the feed and the map take turns behind a floating switch;
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
  window.NJHotelView = setView;

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
  }
  // Capture phase: the right view is showing before the map or the browser acts on the link.
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (link.hasAttribute('data-hotel-focus')) setView('map');
    else if (/^#review-/.test(href)) { setView('list'); if (link.hasAttribute('data-hotel-open-notes')) openNotes(href.slice(1)); }
  }, true);

  form.addEventListener('input', filter);
  form.addEventListener('change', filter);
  form.addEventListener('submit', function (event) { event.preventDefault(); filter(); });
  form.addEventListener('reset', function () { window.setTimeout(filter, 0); });
  form.hidden = false;
  filter();

  // A link to one hotel (Share, a blog post) shows it whatever the parking choice, with its notes open.
  function showLinked() {
    var match = /^#review-(.+)$/.exec(location.hash);
    var post = match && document.getElementById('review-' + match[1]);
    if (!post) return;
    if (post.hidden) {
      query.value = ''; country.value = ''; chain.value = ''; receipt.value = ''; cardHold.value = '';
      var option = form.querySelector('input[name=parking][value="' + categoryOf[match[1]] + '"]');
      if (option) option.checked = true;
      filter();
    }
    setView('list');
    openNotes(post.id);
    post.scrollIntoView();
  }
  window.addEventListener('hashchange', showLinked);
  showLinked();
})();
