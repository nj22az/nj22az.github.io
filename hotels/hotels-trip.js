/* Trip planner: from one place to another, which green-parking hotel suits the drive?
   Drive times and distances come from OpenStreetMap routing (OSRM) on request; nothing is stored. */
(function () {
  'use strict';
  var panel = document.querySelector('[data-hotel-trip]');
  var form = document.querySelector('[data-hotel-trip-form]');
  var result = document.querySelector('[data-trip-result]');
  var mapData = document.getElementById('hotel-map-data');
  var placeData = document.getElementById('hotel-places-data');
  if (!panel || !form || !result || !mapData || !placeData || !window.fetch) return;
  var hotels, places;
  try { hotels = JSON.parse(mapData.textContent); places = JSON.parse(placeData.textContent); } catch (error) { return; }
  var greens = hotels.filter(function (hotel) { return hotel.parkingCategory === 'free'; });
  var fromInput = form.elements.namedItem('from');
  var toInput = form.elements.namedItem('to');
  var locate = form.querySelector('[data-trip-locate]');
  var clear = form.querySelector('[data-trip-clear]');
  var submit = form.querySelector('[type=submit]');
  var OSRM = 'https://router.project-osrm.org';
  var NEAR_KM = 30;          // a stay "at" the destination
  var STOP_SHARE = 0.4;      // overnight stops only from 40 % of the drive onwards
  var STOP_DETOUR_MIN = 20;  // and only when they add little time
  var LONG_TRIP_MIN = 150;   // shorter drives need no stop on the way
  var myPosition = null;
  var request = 0;

  function normalise(value) {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('en').replace(/ø/g, 'o').replace(/æ/g, 'ae').trim();
  }
  function km(a, b) {
    var rad = Math.PI / 180, dLat = (b.latitude - a.latitude) * rad, dLon = (b.longitude - a.longitude) * rad;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 12742 * Math.asin(Math.sqrt(h));
  }
  function minutes(value) {
    var m = Math.max(1, Math.round(value));
    return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '');
  }
  function distance(value) { return Math.round(value) + ' km'; }

  function decode(text) {
    // Google polyline with 6 decimals, as OSRM's polyline6.
    var points = [], index = 0, lat = 0, lng = 0;
    while (index < text.length) {
      [0, 1].forEach(function (axis) {
        var shift = 0, value = 0, byte;
        do { byte = text.charCodeAt(index++) - 63; value |= (byte & 31) << shift; shift += 5; } while (byte >= 32);
        var delta = value & 1 ? ~(value >> 1) : value >> 1;
        if (axis === 0) lat += delta; else lng += delta;
      });
      points.push([lat / 1e6, lng / 1e6]);
    }
    return points;
  }

  function resolve(text) {
    var wanted = normalise(text);
    if (!wanted) return Promise.resolve(null);
    if (/^(my location|me)$/.test(wanted) && myPosition) return Promise.resolve(myPosition);
    var exact = places.filter(function (place) { return normalise(place.name) === wanted; });
    var starts = places.filter(function (place) { return normalise(place.name).indexOf(wanted) === 0; });
    var found = exact[0] || (starts.length === 1 ? starts[0] : null);
    if (found) return Promise.resolve({ latitude: found.latitude, longitude: found.longitude, label: found.name });
    var url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=se,no,dk,fi&accept-language=en&q=' + encodeURIComponent(text.trim());
    return fetch(url).then(function (response) { return response.ok ? response.json() : []; }).then(function (rows) {
      var row = rows && rows[0];
      return row ? { latitude: +row.lat, longitude: +row.lon, label: text.trim() } : null;
    }).catch(function () { return null; });
  }

  function coords(points) {
    return points.map(function (p) { return p.longitude.toFixed(5) + ',' + p.latitude.toFixed(5); }).join(';');
  }
  function osrm(path) {
    return fetch(OSRM + path).then(function (response) { return response.json(); }).then(function (body) {
      if (body.code !== 'Ok') throw new Error(body.code || 'route');
      return body;
    });
  }

  // Straight-line fallback when routing is unavailable: no times, honest about it.
  function straight(origin, destination, candidates) {
    return candidates.map(function (hotel) {
      return { hotel: hotel, fromStart: { km: km(origin, hotel) }, toEnd: destination ? { km: km(hotel, destination) } : null };
    });
  }

  function plan(origin, destination) {
    var candidates;
    if (destination) {
      var direct = km(origin, destination);
      candidates = greens.filter(function (hotel) {
        return km(hotel, destination) <= 80 || km(origin, hotel) + km(hotel, destination) <= direct * 1.35 + 40;
      }).sort(function (a, b) { return km(a, destination) - km(b, destination); }).slice(0, 60);
      if (!candidates.length) candidates = greens.slice().sort(function (a, b) { return km(a, destination) - km(b, destination); }).slice(0, 8);
      // One table request answers everything the ranking needs, including the whole drive (row 0, column 1).
      var ends = [origin, destination].concat(candidates);
      return osrm('/table/v1/driving/' + coords(ends) + '?sources=0;1&annotations=duration,distance').then(function (table) {
        if (!isFinite(table.durations[0][1])) throw new Error('No road route');
        return {
          routed: true,
          line: null,
          total: { km: table.distances[0][1] / 1000, min: table.durations[0][1] / 60 },
          rows: candidates.map(function (hotel, i) {
            var j = i + 2;
            return {
              hotel: hotel,
              fromStart: { km: table.distances[0][j] / 1000, min: table.durations[0][j] / 60 },
              toEnd: { km: table.distances[1][j] / 1000, min: table.durations[1][j] / 60 }
            };
          }).filter(function (row) { return isFinite(row.fromStart.min) && isFinite(row.toEnd.min); })
        };
      }).catch(function () {
        return { routed: false, line: [[origin.latitude, origin.longitude], [destination.latitude, destination.longitude]], total: { km: direct }, rows: straight(origin, destination, candidates) };
      });
    }
    candidates = greens.slice().sort(function (a, b) { return km(origin, a) - km(origin, b); }).slice(0, 25);
    return osrm('/table/v1/driving/' + coords([origin].concat(candidates)) + '?sources=0&annotations=duration,distance').then(function (table) {
      return { routed: true, line: null, rows: candidates.map(function (hotel, i) {
        return { hotel: hotel, fromStart: { km: table.distances[0][i + 1] / 1000, min: table.durations[0][i + 1] / 60 } };
      }).filter(function (row) { return isFinite(row.fromStart.min); }) };
    }).catch(function () { return { routed: false, line: null, rows: straight(origin, null, candidates) }; });
  }

  function choose(trip, origin, destination) {
    var picks = [];
    var time = function (leg) { return leg.min !== undefined ? leg.min : leg.km; };
    if (!destination) {
      trip.rows.sort(function (a, b) { return time(a.fromStart) - time(b.fromStart); }).slice(0, 5).forEach(function (row) {
        picks.push({ row: row, kind: 'near', line: distance(row.fromStart.km) + (row.fromStart.min !== undefined ? ' · ' + minutes(row.fromStart.min) : ' (straight line)') + ' from ' + origin.label });
      });
      return picks;
    }
    var byEnd = trip.rows.slice().sort(function (a, b) { return time(a.toEnd) - time(b.toEnd); });
    var near = byEnd.filter(function (row) { return row.toEnd.km <= NEAR_KM; });
    (near.length ? near.slice(0, 3) : byEnd.slice(0, 1)).forEach(function (row) {
      picks.push({ row: row, kind: 'end', line: distance(row.toEnd.km) + (row.toEnd.min !== undefined ? ' · ' + minutes(row.toEnd.min) : ' (straight line)') + ' from ' + destination.label });
    });
    var chosen = new Set(picks.map(function (pick) { return pick.row; }));
    if (trip.routed && trip.total.min >= LONG_TRIP_MIN) {
      trip.rows.filter(function (row) {
        var detour = row.fromStart.min + row.toEnd.min - trip.total.min;
        row.detour = detour;
        return !chosen.has(row) && row.toEnd.km > NEAR_KM && row.fromStart.min >= trip.total.min * STOP_SHARE && detour <= STOP_DETOUR_MIN;
      }).sort(function (a, b) { return a.fromStart.min - b.fromStart.min; }).slice(0, 4).forEach(function (row) {
        picks.push({ row: row, kind: 'stop', line: minutes(row.fromStart.min) + ' (' + distance(row.fromStart.km) + ') from ' + origin.label +
          ' · ' + (row.detour < 3 ? 'on your route' : '+' + minutes(row.detour) + ' detour') + ' · ' + minutes(row.toEnd.min) + ' left' });
      });
    }
    return picks;
  }

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function render(trip, picks, origin, destination) {
    result.textContent = '';
    var head = element('p', 'hotel-trip-summary');
    head.appendChild(element('strong', '', origin.label + (destination ? ' → ' + destination.label : '')));
    if (trip.total && trip.total.min !== undefined) head.appendChild(document.createTextNode(' · ' + distance(trip.total.km) + ' · ' + minutes(trip.total.min) + ' drive'));
    else if (destination) head.appendChild(document.createTextNode(' · ' + distance(trip.total.km) + ' straight line'));
    result.appendChild(head);
    if (!trip.routed) result.appendChild(element('p', 'hotel-trip-note', 'Routing is unavailable right now, so distances are straight lines and times are missing.'));
    var groups = destination
      ? [['end', picks.some(function (p) { return p.kind === 'end' && p.row.toEnd.km <= NEAR_KM; }) ? 'Stay near ' + destination.label : 'No green hotel within ' + NEAR_KM + ' km of ' + destination.label + '. Closest:'],
         ['stop', 'Overnight stops on the way']]
      : [['near', 'Nearest green hotels']];
    groups.forEach(function (group) {
      var items = picks.filter(function (pick) { return pick.kind === group[0]; });
      if (!items.length) {
        if (group[0] === 'stop' && trip.routed && trip.total.min >= LONG_TRIP_MIN) result.appendChild(element('p', 'hotel-trip-note', 'No green hotel in the second half of the drive that adds less than ' + STOP_DETOUR_MIN + ' min.'));
        return;
      }
      result.appendChild(element('p', 'hotel-trip-group', group[1]));
      var list = element('ol', 'hotel-trip-picks');
      items.forEach(function (pick) {
        var item = element('li', pick.rank === 1 ? 'hotel-trip-pick is-best' : 'hotel-trip-pick');
        var link = element('a');
        link.href = '#' + pick.row.hotel.reviewId;
        link.setAttribute('data-hotel-open-notes', '');
        link.appendChild(element('span', 'hotel-trip-rank', String(pick.rank)));
        var text = element('span', 'hotel-trip-text');
        text.appendChild(element('strong', '', pick.row.hotel.name + (pick.rank === 1 ? ' · best match' : '')));
        text.appendChild(element('span', '', pick.line));
        link.appendChild(text);
        item.appendChild(link);
        list.appendChild(item);
      });
      result.appendChild(list);
    });
    if (!picks.length) result.appendChild(element('p', 'hotel-trip-note', 'No green hotel found for this trip.'));
    if (window.L && document.getElementById('hotel-map')) {
      var show = element('button', 'hotel-link-button', destination ? 'Show the route on the map' : 'Show on the map');
      show.type = 'button';
      show.addEventListener('click', function () {
        if (window.NJHotelView) window.NJHotelView('map', true);
        var map = document.getElementById('hotel-map');
        if (window.matchMedia('(min-width: 1001px)').matches) map.scrollIntoView({ block: 'center' });
      });
      result.appendChild(show);
    }
  }

  function announce(origin, destination, trip, picks) {
    document.dispatchEvent(new CustomEvent('hotel-trip-change', { detail: !origin ? null : {
      origin: origin, destination: destination, line: trip && trip.line,
      picks: picks.map(function (pick) { return { id: pick.row.hotel.id, rank: pick.rank, kind: pick.kind, line: pick.line }; })
    } }));
  }

  function run() {
    var current = ++request;
    var from = fromInput.value, to = toInput.value;
    if (!from.trim()) { result.textContent = 'Enter where you start, or use your location.'; return; }
    submit.disabled = true;
    result.textContent = 'Finding drive times…';
    Promise.all([resolve(from), resolve(to)]).then(function (ends) {
      if (current !== request) return null;
      if (!ends[0]) throw new Error('Could not find “' + from.trim() + '”. Try a town name.');
      if (to.trim() && !ends[1]) throw new Error('Could not find “' + to.trim() + '”. Try a town name.');
      return plan(ends[0], ends[1]).then(function (trip) {
        if (current !== request) return;
        var picks = choose(trip, ends[0], ends[1]);
        picks.forEach(function (pick, i) { pick.rank = i + 1; });
        render(trip, picks, ends[0], ends[1]);
        announce(ends[0], ends[1], trip, picks);
        clear.hidden = false;
        // The road itself is only for the map. OSRM's demo server allows one request a second.
        if (trip.routed && ends[1]) window.setTimeout(function () {
          if (current !== request) return;
          osrm('/route/v1/driving/' + coords([ends[0], ends[1]]) + '?overview=full&geometries=polyline6').then(function (body) {
            if (current !== request) return;
            trip.line = decode(body.routes[0].geometry);
            announce(ends[0], ends[1], trip, picks);
          }).catch(function () { /* the picks stand without the line */ });
        }, 1100);
        if (ends[0] !== myPosition) {
          var params = new URLSearchParams({ from: from.trim() });
          if (to.trim()) params.set('to', to.trim());
          history.replaceState(null, '', location.pathname + '?' + params + location.hash);
        }
      });
    }).catch(function (error) {
      if (current === request) result.textContent = error.message || 'Something went wrong. Please try again.';
    }).then(function () { if (current === request) submit.disabled = false; });
  }

  form.addEventListener('submit', function (event) { event.preventDefault(); run(); });
  clear.addEventListener('click', function () {
    ++request;
    form.reset();
    result.textContent = '';
    clear.hidden = true;
    submit.disabled = false;
    history.replaceState(null, '', location.pathname + location.hash);
    announce(null);
  });
  if (navigator.geolocation && window.isSecureContext) {
    locate.addEventListener('click', function () {
      result.textContent = 'Waiting for your location…';
      navigator.geolocation.getCurrentPosition(function (position) {
        myPosition = { latitude: position.coords.latitude, longitude: position.coords.longitude, label: 'My location' };
        fromInput.value = 'My location';
        run();
      }, function () { result.textContent = 'Location was not shared. Type a town instead.'; }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
    });
  } else locate.hidden = true;

  panel.hidden = false;
  var params = new URLSearchParams(location.search);
  if (params.get('from')) {
    fromInput.value = params.get('from');
    toInput.value = params.get('to') || '';
    run();
  }
})();
