/* Filtered hotel map. Location is requested once, on demand, and kept in memory. */
(function () {
  'use strict';
  var container = document.getElementById('hotel-map');
  var data = document.getElementById('hotel-map-data');
  var status = document.getElementById('hotel-map-status');
  var controls = document.querySelector('[data-hotel-map-controls]');
  var locate = document.getElementById('hotel-locate');
  var fit = document.getElementById('hotel-fit-map');
  var clear = document.getElementById('hotel-clear-location');
  if (!container || !data || !status) return;

  function unavailable() {
    container.hidden = true;
    if (controls) controls.hidden = true;
    status.textContent = 'The map is unavailable. Hotel addresses and parking details are still listed below.';
  }

  if (!window.L) { unavailable(); return; }
  var parkingCategories = {
    free: { label: 'Free parking', size: 24 },
    registered: { label: 'Free parking · Registration required', size: 24 },
    easy: { label: 'Easy parking · One hotel receipt', size: 24 },
    avoid: { label: 'Paid parking · Avoid', size: 14 }
  };
  var hotels;
  try {
    hotels = JSON.parse(data.textContent);
    if (!Array.isArray(hotels)) throw new Error('Invalid hotel data');
  } catch (error) { unavailable(); return; }
  hotels = hotels.filter(function (hotel) {
    return hotel && typeof hotel.parkingCategory === 'string' &&
      Object.prototype.hasOwnProperty.call(parkingCategories, hotel.parkingCategory) &&
      Number.isFinite(hotel.latitude) && Math.abs(hotel.latitude) <= 90 &&
      Number.isFinite(hotel.longitude) && Math.abs(hotel.longitude) <= 180;
  });

  var L = window.L;
  var map;
  container.hidden = false;
  try {
    map = L.map(container, { scrollWheelZoom: false, minZoom: 2, maxZoom: 19 });
  } catch (error) { unavailable(); return; }
  if (controls) controls.hidden = false;
  var layer = L.layerGroup().addTo(map);
  var visibleIds = new Set(hotels.map(function (hotel) { return hotel.id; }));
  var rows = Array.from(document.querySelectorAll('[data-hotel-row]'));
  if (rows.length) visibleIds = new Set(rows.filter(function (row) { return !row.hidden; }).map(function (row) { return row.dataset.hotelRow; }));
  var position = null;
  var positionMarker = null;
  var accuracyCircle = null;
  var locationMessage = '';
  var tileError = false;
  var locationRequest = 0;
  var markers = new Map();
  var hasView = false;

  var tripLines = new Map();
  function popup(hotel) {
    var box = document.createElement('div');
    var heading = document.createElement('strong');
    heading.textContent = hotel.name;
    box.appendChild(heading);
    var place = document.createElement('p');
    place.textContent = [hotel.city, hotel.country].filter(Boolean).join(', ');
    box.appendChild(place);
    var parking = document.createElement('p');
    parking.className = 'hotel-map-parking hotel-map-parking-' + hotel.parkingCategory;
    parking.textContent = hotel.parkingLabel || parkingCategories[hotel.parkingCategory].label;
    box.appendChild(parking);
    if (tripLines.has(hotel.id)) {
      var trip = document.createElement('p');
      trip.className = 'hotel-map-trip';
      trip.textContent = tripLines.get(hotel.id);
      box.appendChild(trip);
    }
    var reviewId = hotel.reviewId || 'review-' + hotel.id;
    if (/^[a-z0-9-]+$/.test(reviewId)) {
      var link = document.createElement('a');
      link.href = '#' + reviewId;
      link.setAttribute('data-hotel-open-notes', '');
      link.textContent = 'Open the post';
      box.appendChild(link);
    }
    return box;
  }

  function hotelIcon(hotel, rank) {
    var size = rank ? 34 : parkingCategories[hotel.parkingCategory].size;
    return L.divIcon({
      className: 'hotel-map-marker hotel-map-marker-' + hotel.parkingCategory + (rank ? ' hotel-map-marker-pick' : ''),
      html: '<span aria-hidden="true">' + (rank || (size > 16 ? 'P' : '')) + '</span>',
      iconSize: [size, size], iconAnchor: [size / 2, size / 2]
    });
  }

  hotels.forEach(function (hotel) {
    var category = parkingCategories[hotel.parkingCategory];
    var label = hotel.name + ', ' + hotel.city + ' — ' + category.label;
    var marker = L.marker([hotel.latitude, hotel.longitude], {
      title: label,
      alt: label,
      icon: hotelIcon(hotel),
      zIndexOffset: hotel.parkingCategory === 'avoid' ? -100 : 0
    }).bindPopup(function () { return popup(hotel); }, { maxWidth: 260, minWidth: 170 });
    marker.on('add', function () {
      var element = marker.getElement();
      if (element) element.setAttribute('aria-label', label);
    });
    markers.set(hotel.id, marker);
  });

  document.querySelectorAll('[data-hotel-focus]').forEach(function (link) {
    var id = link.dataset.hotelFocus;
    if (!markers.has(id)) return;
    link.hidden = false;
    link.addEventListener('click', function () {
      if (!visibleIds.has(id)) return;
      var hotel = hotels.find(function (item) { return item.id === id; });
      map.invalidateSize();
      map.setView([hotel.latitude, hotel.longitude], 15, { animate: false });
      markers.get(id).openPopup();
      container.focus({ preventScroll: true });
    });
  });

  function selected() {
    return hotels.filter(function (hotel) { return visibleIds.has(hotel.id); });
  }

  function updateStatus() {
    var count = selected().length;
    var total = visibleIds.size;
    var missing = total - count;
    var message = total ? count + ' ' + (count === 1 ? 'hotel' : 'hotels') + ' on the map.' : 'No hotels match the filters.';
    if (missing > 0) message += ' ' + missing + ' without a verified location ' + (missing === 1 ? 'is' : 'are') + ' in the feed only.';
    if (position) message += ' You are shown in blue (±' + Math.round(position.accuracy).toLocaleString('en-GB') + ' m).';
    if (locationMessage) message += ' ' + locationMessage;
    if (tileError) message += ' Some map tiles could not load. Hotel markers and the register remain available.';
    status.textContent = message;
  }

  function fitSelection() {
    var points = selected().map(function (hotel) { return [hotel.latitude, hotel.longitude]; });
    if (position) points.push([position.latitude, position.longitude]);
    if (tripLayer && tripLayer.getLayers().length) points = tripBounds.concat(tripPicks.length ? [] : points);
    if (points.length) map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14, animate: false });
    else if (!hasView) map.setView([56.5, 12], 5);
    hasView = true;
  }

  function updateHotels() {
    layer.clearLayers();
    visibleIds.forEach(function (id) { if (markers.has(id)) layer.addLayer(markers.get(id)); });
    fitSelection();
    updateStatus();
  }

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).on('tileerror', function () { tileError = true; updateStatus(); }).addTo(map);

  document.addEventListener('hotel-filter-change', function (event) {
    if (!event.detail || !Array.isArray(event.detail.visibleIds)) return;
    var nextIds = new Set(event.detail.visibleIds);
    // Search blur emits change after input; retain markers while a click is in progress.
    if (nextIds.size === visibleIds.size && Array.from(nextIds).every(function (id) { return visibleIds.has(id); })) return;
    visibleIds = nextIds;
    updateHotels();
  });
  if (fit) fit.addEventListener('click', fitSelection);

  // Narrow screens hide the map behind the List/Map switch; a map drawn while hidden has no size.
  // Show on map runs after this and zooms to its hotel.
  document.addEventListener('hotel-view-change', function (event) {
    if (!event.detail || event.detail.view !== 'map') return;
    map.invalidateSize({ animate: false });
    fitSelection();
  });

  function removeLocation() {
    if (positionMarker) map.removeLayer(positionMarker);
    if (accuracyCircle) map.removeLayer(accuracyCircle);
    positionMarker = null;
    accuracyCircle = null;
    position = null;
  }

  function finishLocationRequest() {
    if (locate) { locate.disabled = false; locate.setAttribute('aria-label', position ? 'Update my location' : 'Show my location'); }
    if (clear) clear.hidden = !position;
  }

  if (locate) locate.addEventListener('click', function () {
    if (!navigator.geolocation || !window.isSecureContext) {
      locationMessage = 'Location is unavailable in this browser. You can still use the hotel map.';
      updateStatus();
      return;
    }
    var request = ++locationRequest;
    locate.disabled = true;
    if (clear) clear.hidden = false;
    locationMessage = 'Waiting for your browser to provide your location.';
    updateStatus();
    navigator.geolocation.getCurrentPosition(function (result) {
      if (request !== locationRequest) return;
      var coords = result.coords;
      if (!Number.isFinite(coords.latitude) || Math.abs(coords.latitude) > 90 || !Number.isFinite(coords.longitude) || Math.abs(coords.longitude) > 180 || !Number.isFinite(coords.accuracy)) {
        locationMessage = 'Your browser could not provide a usable location. Please try again.';
        finishLocationRequest();
        updateStatus();
        return;
      }
      removeLocation();
      position = { latitude: coords.latitude, longitude: coords.longitude, accuracy: Math.max(0, coords.accuracy) };
      accuracyCircle = L.circle([position.latitude, position.longitude], {
        radius: position.accuracy, color: '#1465b7', weight: 1, fillColor: '#1465b7', fillOpacity: 0.12, interactive: false
      }).addTo(map);
      positionMarker = L.marker([position.latitude, position.longitude], {
        title: 'Your current location', alt: 'Your current location',
        icon: L.divIcon({ className: 'hotel-location-marker', html: '<span aria-hidden="true">You</span>', iconSize: [44, 28], iconAnchor: [22, 14] })
      }).bindPopup('Your current location. Estimated accuracy: ' + Math.round(position.accuracy).toLocaleString('en-GB') + ' metres.').addTo(map);
      locationMessage = '';
      finishLocationRequest();
      fitSelection();
      updateStatus();
    }, function (error) {
      if (request !== locationRequest) return;
      locationMessage = {
        1: 'Location permission was not granted. Allow location access in your browser settings, then try again.',
        2: 'Your location could not be found. Check your device location settings, then try again.',
        3: 'Finding your location timed out. Please try again.'
      }[error.code] || 'Your location could not be found. Please try again.';
      finishLocationRequest();
      updateStatus();
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  });

  if (clear) {
    clear.hidden = true;
    clear.addEventListener('click', function () {
      ++locationRequest; // Ignore any result from a request that is still pending.
      removeLocation();
      locationMessage = '';
      finishLocationRequest();
      fitSelection();
      updateStatus();
    });
  }

  // A planned trip: the road as a line, A and B, and its picks numbered as in the trip card.
  var tripLayer = L.layerGroup().addTo(map);
  var tripBounds = [];
  var tripPicks = [];
  function endMarker(point, text, title) {
    return L.marker([point.latitude, point.longitude], {
      title: title, alt: title, zIndexOffset: 1000, keyboard: false,
      icon: L.divIcon({ className: 'hotel-map-end', html: '<span aria-hidden="true">' + text + '</span>', iconSize: [30, 30], iconAnchor: [15, 15] })
    });
  }
  document.addEventListener('hotel-trip-change', function (event) {
    var trip = event.detail;
    tripLayer.clearLayers();
    tripLines = new Map();
    tripPicks.forEach(function (id) { var hotel = hotels.find(function (h) { return h.id === id; }); if (hotel) markers.get(id).setIcon(hotelIcon(hotel)); });
    tripPicks = [];
    tripBounds = [];
    if (trip) {
      if (trip.line) {
        L.polyline(trip.line, { color: '#ffffff', weight: 8, opacity: 0.9, interactive: false }).addTo(tripLayer);
        L.polyline(trip.line, { color: '#08131a', weight: 4, opacity: 0.85, interactive: false }).addTo(tripLayer);
        tripBounds = trip.line.slice();
      }
      endMarker(trip.origin, 'A', 'Start: ' + trip.origin.label).addTo(tripLayer);
      tripBounds.push([trip.origin.latitude, trip.origin.longitude]);
      if (trip.destination) {
        endMarker(trip.destination, 'B', 'Destination: ' + trip.destination.label).addTo(tripLayer);
        tripBounds.push([trip.destination.latitude, trip.destination.longitude]);
      }
      trip.picks.forEach(function (pick) {
        var hotel = hotels.find(function (h) { return h.id === pick.id; });
        if (!hotel) return;
        tripLines.set(pick.id, pick.rank + ' · ' + pick.line);
        markers.get(pick.id).setIcon(hotelIcon(hotel, pick.rank)).setZIndexOffset(2000 - pick.rank);
        tripPicks.push(pick.id);
        tripBounds.push([hotel.latitude, hotel.longitude]);
      });
    }
    markers.forEach(function (marker, id) { if (tripPicks.indexOf(id) === -1) marker.setZIndexOffset(0); });
    hasView = false;
    fitSelection();
  });

  var legend = L.control({ position: 'bottomleft' });
  legend.onAdd = function () {
    var box = L.DomUtil.create('div', 'hotel-map-legend');
    box.innerHTML = '<span><i class="hotel-map-key hotel-map-key-free"></i>Free</span><span><i class="hotel-map-key hotel-map-key-registered"></i>Register</span><span><i class="hotel-map-key hotel-map-key-easy"></i>Easy</span><span><i class="hotel-map-key hotel-map-key-avoid"></i>Avoid</span><span><i class="hotel-map-key hotel-map-key-you"></i>You</span>';
    return box;
  };
  legend.addTo(map);

  updateHotels();
})();
