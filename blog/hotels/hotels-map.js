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
    free: { label: 'Free parking', marker: 'Free' },
    easy: { label: 'Easy parking · Pay at hotel', marker: 'Easy' },
    avoid: { label: 'Paid parking · Avoid', marker: 'Avoid' }
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

  function popup(hotel) {
    var box = document.createElement('div');
    var heading = document.createElement('strong');
    heading.textContent = hotel.name;
    box.appendChild(heading);
    [hotel.address, [hotel.city, hotel.country].filter(Boolean).join(', ')].filter(Boolean).forEach(function (text) {
      var line = document.createElement('p');
      line.textContent = text;
      box.appendChild(line);
    });
    var parking = document.createElement('p');
    parking.className = 'hotel-map-parking hotel-map-parking-' + hotel.parkingCategory;
    parking.textContent = parkingCategories[hotel.parkingCategory].label;
    box.appendChild(parking);
    if (hotel.parkingSummary) {
      var summary = document.createElement('p');
      summary.textContent = hotel.parkingSummary;
      box.appendChild(summary);
    }
    var reviewId = hotel.reviewId || 'review-' + hotel.id;
    if (/^[a-z0-9-]+$/.test(reviewId)) {
      var link = document.createElement('a');
      link.href = '#' + reviewId;
      link.textContent = 'Read hotel notes';
      box.appendChild(link);
    }
    return box;
  }

  hotels.forEach(function (hotel) {
    var category = parkingCategories[hotel.parkingCategory];
    var label = hotel.name + ', ' + hotel.city + ' — ' + category.label;
    var marker = L.marker([hotel.latitude, hotel.longitude], {
      title: label,
      alt: label,
      icon: L.divIcon({ className: 'hotel-map-marker hotel-map-marker-' + hotel.parkingCategory, html: '<span aria-hidden="true">' + category.marker + '</span>', iconSize: [48, 28], iconAnchor: [24, 14] })
    }).bindPopup(popup(hotel), { maxWidth: 260, minWidth: 170 });
    marker.on('add', function () {
      var element = marker.getElement();
      if (element) element.setAttribute('aria-label', label);
    });
    markers.set(hotel.id, marker);
  });

  function selected() {
    return hotels.filter(function (hotel) { return visibleIds.has(hotel.id); });
  }

  function updateStatus() {
    var count = selected().length;
    var total = visibleIds.size;
    var missing = total - count;
    var message = total ? count + ' of ' + total + ' selected hotels have verified map locations.' : 'No hotels match the filters.';
    if (missing > 0) message += ' ' + missing + ' ' + (missing === 1 ? 'hotel is' : 'hotels are') + ' listed below with addresses while map coordinates await verification.';
    if (position) message += ' Your location is shown; estimated accuracy ' + Math.round(position.accuracy).toLocaleString('en-GB') + ' metres.';
    if (locationMessage) message += ' ' + locationMessage;
    if (tileError) message += ' Some map tiles could not load. Hotel markers and the register remain available.';
    status.textContent = message;
  }

  function fitSelection() {
    var points = selected().map(function (hotel) { return [hotel.latitude, hotel.longitude]; });
    if (position) points.push([position.latitude, position.longitude]);
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

  function removeLocation() {
    if (positionMarker) map.removeLayer(positionMarker);
    if (accuracyCircle) map.removeLayer(accuracyCircle);
    positionMarker = null;
    accuracyCircle = null;
    position = null;
  }

  function finishLocationRequest() {
    if (locate) { locate.disabled = false; locate.textContent = position ? 'Update my location' : 'Show my location'; }
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
    locate.textContent = 'Finding your location…';
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

  updateHotels();
})();
