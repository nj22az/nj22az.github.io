#!/usr/bin/env python3
"""Publish the static hotel register from its records; no browser build is required."""
import argparse
import datetime as dt
from decimal import Decimal
from html import escape
import json
from pathlib import Path
import re
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'blog/hotels/hotels.json'
OUTPUT = ROOT / 'blog/hotels/index.html'
PARKING = {
    'external-paid': 'External paid parking',
    'hotel-paid': 'Hotel paid parking',
    'free': 'Free parking',
}
PARKING_CATEGORIES = {
    'free': 'Free parking',
    'easy': 'Easy parking · Pay at hotel',
    'avoid': 'Paid parking · Avoid',
}


def parking_category(review):
    if review.get('freeParking') is True:
        return 'free'
    if review.get('freeParking') is False and type(review.get('parkingPaymentAtHotel')) is bool:
        return 'easy' if review['parkingPaymentAtHotel'] else 'avoid'
    raise ValueError(f'{review.get("name", "Hotel")}: confirm the parking charge and payment route before publishing')


def e(value):
    return escape(str(value), quote=True)


def hotel_chain(review):
    # Existing official property identities, not an affiliation inferred from location.
    if review['name'].startswith('Scandic '):
        return 'Scandic'
    if review['name'].startswith('Thon Hotel '):
        return 'Thon Hotels'
    return 'Other hotels'


def state(value):
    return 'unknown' if value is None else str(value).lower()


def date_label(value):
    day = dt.date.fromisoformat(value)
    return f'{day.day} {day:%B %Y}'


def money(value):
    if value is None:
        return 'Not recorded'
    amount = Decimal(str(value))
    return f'{amount:,.0f}' if amount == amount.to_integral() else f'{amount:,.2f}'


def total_paid(review):
    if review['roomPaid'] is None or review['parkingPaid'] is None:
        return None
    return Decimal(str(review['roomPaid'])) + Decimal(str(review['parkingPaid']))


def full_address(review):
    place = ' '.join(value for value in (review.get('postalCode'), review['city']) if value)
    return ', '.join((review['address'], place, review['country']))


def receipt_state(review):
    return 'not-applicable' if review['freeParking'] is True else state(review['parkingOnHotelReceipt'])


def receipt_label(review):
    if review['freeParking'] is True:
        return 'No parking charge'
    return {True: 'On hotel receipt', False: 'Not on hotel receipt', None: 'Receipt not confirmed'}[review['parkingOnHotelReceipt']]


def price_cell(value, review, include_nights=False, free=False):
    if value is None:
        return '<span class="hotel-unknown">Not recorded</span>'
    if free:
        return '0<span class="hotel-cell-note">No charge</span>'
    label = review['currency'] or review.get('currencyLabel') or ''
    if include_nights and review.get('nights'):
        nights = review['nights']
        label += f' · {nights} ' + ('night' if nights == 1 else 'nights')
    return money(value) + '<span class="hotel-cell-note">' + e(label) + '</span>'


def validate_parking_confirmation(review):
    """Require a reviewed source before any record can enter the public register."""
    label = review.get('name', review.get('id', 'Hotel'))
    free = review.get('freeParking')
    if type(free) is not bool:
        raise ValueError(f'{label}: confirm whether guest parking is free before publishing')
    verification = review.get('parkingVerification')
    expected = 'confirmed-free' if free else 'confirmed-paid'
    if not isinstance(verification, dict) or verification.get('status') != expected:
        raise ValueError(f'{label}: parking confirmation must match the recorded parking status')
    try:
        checked = dt.date.fromisoformat(verification['checkedOn'])
    except (KeyError, TypeError, ValueError):
        raise ValueError(f'{label}: parking confirmation needs an ISO check date') from None
    if checked > dt.date.today():
        raise ValueError(f'{label}: parking cannot be confirmed on a future date')
    source = verification.get('sourceUrl')
    if not isinstance(source, str) or source not in (review.get('hotelUrl'), review.get('parkingUrl')):
        raise ValueError(f'{label}: link parking confirmation to the reviewed hotel or parking source')
    url = urlparse(source)
    if url.scheme != 'https' or not url.netloc:
        raise ValueError(f'{label}: parking confirmation needs an HTTPS source')
    if free and (review.get('parkingType') != 'free' or review.get('parkingPaid') != 0):
        raise ValueError(f'{label}: confirmed free parking must have a free arrangement and zero charge')
    if free and review.get('parkingPaymentAtHotel') is not None:
        raise ValueError(f'{label}: payment at the hotel is not applicable to free parking; use null')
    if not free and (review.get('parkingType') not in ('external-paid', 'hotel-paid') or review.get('parkingPaid') == 0):
        raise ValueError(f'{label}: confirmed paid parking must have a paid arrangement')
    if not isinstance(review.get('parkingSummary'), str) or not review['parkingSummary'].strip():
        raise ValueError(f'{label}: describe the verified parking option and any known conditions')
    parking_category(review)


def validate(reviews):
    ids = set()
    for review in reviews:
        validate_parking_confirmation(review)
        assert re.fullmatch(r'[a-z0-9-]+', review['id']), 'Use a stable URL-safe review id'
        assert review['id'] not in ids, 'Duplicate review id'
        ids.add(review['id'])
        dt.date.fromisoformat(review['recordedOn'])
        assert review['currency'] is None or re.fullmatch(r'[A-Z]{3}', review['currency']), 'Use an ISO currency code or null'
        assert re.fullmatch(r'[A-Z]{2}', review['countryCode']), 'Use an ISO country code'
        if review['roomPaid'] is not None:
            assert review['currency'] or review.get('currencyLabel'), 'A recorded price needs a currency or original receipt label'
        nights = review.get('nights')
        assert nights is None or (type(nights) is int and nights > 0), 'Nights must be a positive integer or null'
        assert review['parkingType'] in PARKING, 'Unknown parking type'
        for key in ('freeParking', 'parkingPaymentAtHotel', 'parkingOnHotelReceipt'):
            assert review[key] is None or type(review[key]) is bool, f'{key} must be true, false or null'
        for key in ('roomPaid', 'parkingPaid'):
            value = review[key]
            assert value is None or (type(value) in (int, float) and Decimal(str(value)).is_finite() and value >= 0), f'Invalid {key}'
        if review['freeParking'] is True:
            assert review['parkingPaid'] in (0, None), 'Free parking must not have a positive charge'
        for key in ('hotelUrl', 'parkingUrl'):
            if review[key] is None and key == 'parkingUrl':
                continue
            url = urlparse(review[key])
            assert url.scheme == 'https' and url.netloc, 'Source links must be HTTPS'
        if review['coordinates'] is not None:
            point = review['coordinates']
            assert -90 <= point['latitude'] <= 90 and -180 <= point['longitude'] <= 180
            assert urlparse(point['sourceUrl']).scheme == 'https', 'Coordinates need a source'


def render_row(review):
    verification = review['parkingVerification']
    category = parking_category(review)
    receipt = receipt_label(review)
    search = ' '.join(review.get(key) or '' for key in ('name', 'city', 'country', 'address', 'postalCode', 'parkingOperator', 'parkingSummary'))
    receipt_note = e(review['parkingReceipt'])
    if review['freeParking'] is not True and review['parkingUrl']:
        receipt_note = f'On this stay. <a href="{e(review["parkingUrl"])}">{receipt_note}</a>.'
    place = ', '.join((review['address'], ' '.join(value for value in (review.get('postalCode'), review['city']) if value)))
    return f'''          <tr role="row" data-hotel-row="{e(review['id'])}" data-search="{e(search)}" data-country="{e(review['countryCode'])}" data-chain="{e(hotel_chain(review))}" data-free-parking="{state(review['freeParking'])}" data-parking-category="{category}" data-parking-type="{e(review['parkingType'])}" data-hotel-receipt="{receipt_state(review)}">
            <th scope="row" role="rowheader" data-label="Hotel"><a class="hotel-name" href="#review-{e(review['id'])}">{e(review['name'])}</a><span class="hotel-place">{e(place)}</span><span class="hotel-tag hotel-country">{e(review['country'])}</span><span class="hotel-recorded">Recorded <time datetime="{e(review['recordedOn'])}">{date_label(review['recordedOn'])}</time></span></th>
            <td role="cell" data-label="Room total" class="hotel-money">{price_cell(review['roomPaid'], review, include_nights=True)}</td>
            <td role="cell" data-label="Parking" class="hotel-money">{price_cell(review['parkingPaid'], review, free=review['freeParking'] is True)}</td>
            <td role="cell" data-label="Stay total" class="hotel-money hotel-total">{price_cell(total_paid(review), review, include_nights=True)}</td>
            <td role="cell" data-label="Parking arrangement" class="hotel-parking"><span class="hotel-tag hotel-parking-{category}">{e(PARKING_CATEGORIES[category])}</span><span class="hotel-cell-note">{e(review['parkingSummary'])}<br><a href="{e(verification['sourceUrl'])}">Checked <time datetime="{e(verification['checkedOn'])}">{date_label(verification['checkedOn'])}</time></a></span></td>
            <td role="cell" data-label="Parking receipt" class="hotel-receipt"><span class="hotel-tag">{receipt}</span><span class="hotel-cell-note">{receipt_note}</span></td>
            <td role="cell" data-label="Short review" class="hotel-summary">{e(review['summary'])}</td>
          </tr>'''


def icon(name):
    paths = {
        'hotel': '<path d="M4 21V3h16v18M2 21h20M8 7h2m4 0h2M8 11h2m4 0h2M10 21v-6h4v6"/>',
        'pin': '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
        'parking': '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
        'note': '<path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5"/>',
        'check': '<path d="m5 12 4 4L19 6"/>',
        'arrow': '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    }
    return '<svg class="hotel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[name] + '</svg>'


def render_review(review):
    paragraphs = '\n'.join('        <p>' + e(paragraph) + '</p>' for paragraph in review['review'])
    category = parking_category(review)
    tags = [(review['country'], ''), (PARKING_CATEGORIES[category], ' hotel-parking-' + category)]
    if review['freeParking'] is not True and review['parkingOnHotelReceipt'] is False:
        tags.extend([('Separate parking receipt', ''), ('Parking not on hotel receipt', '')])
    tag_list = ''.join('<li class="hotel-tag' + css + '">' + e(tag) + '</li>' for tag, css in tags)
    links = f'<a href="{e(review["hotelUrl"])}">Official hotel information</a>'
    if review['parkingUrl'] and review['parkingUrl'] != review['hotelUrl']:
        links += f'<a href="{e(review["parkingUrl"])}">Parking information</a>'
    if review['coordinates'] and review['coordinates']['sourceUrl'] not in (review['hotelUrl'], review['parkingUrl']):
        links += f'<a href="{e(review["coordinates"]["sourceUrl"])}">Hotel map location</a>'
    verification = review['parkingVerification']
    registration = review.get('parkingDetails', {}).get('registrationAtReception')
    registration_note = ('Register at reception' if registration is True else
                         'No reception registration required' if registration is False else
                         'Registration: see notes; requirements may be unstated')
    # Older entries describe registration in their summary; retain that wording verbatim.
    if 'parkingDetails' not in review:
        registration_note = 'Check the parking instructions below'
    map_action = (f'<a href="#hotel-map" data-hotel-focus="{e(review["id"])}" hidden>{icon("pin")}Show on map</a>'
                  if review['coordinates'] else '<span class="hotel-unmapped">Map location awaiting verification</span>')
    paid_total = total_paid(review)
    nights = review.get('nights')
    duration = f'{nights} ' + ('night' if nights == 1 else 'nights') if nights else 'Nights not recorded'
    price = (f'<p class="hotel-card-price">Stay paid <strong>{e(review["currency"] or review.get("currencyLabel") or "")} {money(paid_total)}</strong> · {e(duration)}</p>'
             if paid_total is not None else '')
    return f'''      <article class="hotel-review" id="review-{e(review['id'])}" data-hotel-note="{e(review['id'])}" aria-labelledby="title-{e(review['id'])}">
        <header class="hotel-card-header"><span class="hotel-card-avatar">{icon('hotel')}</span><div><p class="hotel-card-place">{e(review['city'])} · {e(review['country'])}</p><h3 id="title-{e(review['id'])}">{e(review['name'])}</h3></div></header>
        <p class="hotel-card-parking hotel-parking-{category}">{icon('parking')}<strong>{e(PARKING_CATEGORIES[category])}</strong></p>
        <p class="hotel-card-summary">{e(review['parkingSummary'])}</p>
        <p class="hotel-card-condition">{icon('note')}{e(registration_note)}</p>
{price}
        <p class="hotel-card-checked">{icon('check')}Parking checked <time datetime="{e(verification['checkedOn'])}">{date_label(verification['checkedOn'])}</time></p>
        <div class="hotel-card-actions">{map_action}<a href="{e(review['hotelUrl'])}">{icon('arrow')}Hotel website</a></div>
        <details class="hotel-card-details"><summary>{icon('note')}Full notes, prices &amp; sources</summary>
        <p class="hotel-review-meta">{e(full_address(review))}<br>Recorded <time datetime="{e(review['recordedOn'])}">{date_label(review['recordedOn'])}</time></p>
        <p>{e(review['priceNote'])}</p>
{paragraphs}
        <ul class="hotel-review-tags" aria-label="Country and parking tags">{tag_list}</ul>
        <p class="hotel-source">{e(review['sourceNote'])}<br>{links}</p>
        </details>
      </article>'''


def build(reviews):
    rows = '\n'.join(render_row(review) for review in reviews)
    notes = '\n'.join(render_review(review) for review in reviews)
    count = len(reviews)
    countries = sorted({(review['countryCode'], review['country']) for review in reviews}, key=lambda item: item[1])
    country_options = ''.join(f'<option value="{e(code)}">{e(name)}</option>' for code, name in countries)
    chains = sorted({hotel_chain(review) for review in reviews}, key=lambda name: (name == 'Other hotels', name))
    chain_options = ''.join(f'<option value="{e(name)}">{e(name)}</option>' for name in chains)
    map_records = [{
        'id': review['id'], 'name': review['name'], 'city': review['city'], 'country': review['country'],
        'address': ', '.join(value for value in (review['address'], review.get('postalCode')) if value),
        'latitude': review['coordinates']['latitude'], 'longitude': review['coordinates']['longitude'],
        'parkingCategory': parking_category(review),
        'parkingLabel': PARKING_CATEGORIES[parking_category(review)],
        'parkingSummary': review['parkingSummary'], 'reviewId': 'review-' + review['id']
    } for review in reviews if review['coordinates'] is not None]
    map_json = json.dumps(map_records, ensure_ascii=False).replace('<', '\\u003c')
    return f'''<!DOCTYPE html>
<!-- Generated from hotels.json by tools/build-hotels.py. -->
<html lang="en" data-theme="clarity" data-theme-lock="clarity" data-hotel-design="note">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hotels &amp; Parking | Blog – The Office of Nils Johansson</title>
  <meta name="description" content="Verified free guest parking in Sweden, Denmark, Norway and Finland, with dated sources, country filters, a hotel map and personal stay notes.">
  <link rel="canonical" href="https://nj22az.github.io/blog/hotels/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Hotels &amp; Parking – The Office of Nils Johansson">
  <meta property="og:description" content="Hotels in Sweden, Denmark, Norway and Finland: confirmed parking, short notes, a filtered map and prices paid.">
  <meta property="og:url" content="https://nj22az.github.io/blog/hotels/">
  <meta name="twitter:card" content="summary">
  <meta name="theme-color" content="#333333">
  <link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
  <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <script src="/theme-bootstrap.js?v=hotel-fixed-1"></script>
  <link rel="stylesheet" href="/styles.css?v=popwave-icons-2">
  <link rel="stylesheet" href="/css/hotels.css?v=6">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
  <link rel="stylesheet" href="/css/hotels-map.css?v=2">
</head>
<body class="hotel-site">
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <nav id="site-nav" class="site-nav"></nav>
  <main id="main-content" class="hotel-page">
    <nav class="blog-section-nav" aria-label="Blog sections"><a href="/blog/">Articles</a><a href="/blog/hotels/" aria-current="page">Hotels &amp; Parking</a></nav>
    <header>
      <p class="hotel-eyebrow">Field notes · Hotels &amp; parking</p>
      <h1>Hotels &amp; Parking</h1>
      <p class="hotel-intro">A growing collection of places to stay, with parking checked before you arrive. Browse the hotel feed or find your next stop on the map.</p>
      <p class="hotel-findings-note"><strong>{count} hotels · {sum(r['freeParking'] for r in reviews)} free-parking options · {len(map_records)} verified map locations.</strong> Free applies to the specified parking area. Registration and paid alternatives remain in each entry. <a href="#hotel-method-title">How the register works</a>.</p>
    </header>
    <section aria-labelledby="hotel-register-title">
      <div class="hotel-register-heading"><h2 id="hotel-register-title">Hotel register</h2><a class="hotel-download" href="/blog/hotels/hotel-reviews.csv" download>Download spreadsheet (CSV)</a></div>
      <ul class="hotel-parking-legend" aria-label="Parking categories"><li class="hotel-tag hotel-parking-free">Green · Free parking</li><li class="hotel-tag hotel-parking-easy">Yellow · Easy parking — pay at hotel</li><li class="hotel-tag hotel-parking-avoid">Red · Paid parking — avoid</li></ul>
      <form class="hotel-filters" data-hotel-filters hidden role="search" aria-label="Filter hotel reviews">
        <div class="hotel-field hotel-search"><label for="hotel-search">Hotel or place</label><input id="hotel-search" type="search" name="search" placeholder="Search hotel, city or country" autocomplete="off"></div>
        <div class="hotel-field"><label for="hotel-country">Country</label><select id="hotel-country" name="country"><option value="">All countries</option>{country_options}</select></div>
        <div class="hotel-field"><label for="hotel-chain">Hotel chain</label><select id="hotel-chain" name="chain"><option value="">All chains</option>{chain_options}</select></div>
        <div class="hotel-field"><label for="hotel-parking">Parking</label><select id="hotel-parking" name="parking"><option value="free" selected>Green — Free parking</option><option value="easy">Yellow — Easy parking</option><option value="avoid">Red — Paid parking / avoid</option><option value="">All parking</option></select></div>
        <div class="hotel-field"><label for="hotel-receipt">Parking on hotel receipt</label><select id="hotel-receipt" name="receipt"><option value="">Any arrangement</option><option value="not-applicable">No parking charge</option><option value="true">Yes</option><option value="false">No — separate receipt</option><option value="unknown">Not confirmed</option></select></div>
        <button type="reset" class="hotel-reset">Reset filters</button>
      </form>
      <p class="hotel-count" data-hotel-count role="status" aria-live="polite">{count} {'hotel' if count == 1 else 'hotels'}</p>
      <nav class="hotel-view-links" aria-label="Hotel views"><a href="#hotel-notes-title">{icon('hotel')}Hotel feed</a><a href="#hotel-map-title">{icon('pin')}Map</a></nav>
      <div class="hotel-discovery">
      <section class="hotel-notes" data-hotel-notes aria-labelledby="hotel-notes-title">
        <h2 id="hotel-notes-title">Hotel feed</h2>
        <p class="hotel-feed-intro">Parking facts and travel notes. Open an entry for its full conditions and sources.</p>
{notes}
      </section>
      <section class="hotel-map-section" aria-labelledby="hotel-map-title">
        <h3 id="hotel-map-title">{icon('pin')}Map of selected hotels</h3>
        <p class="hotel-map-intro">{len(map_records)} of {count} hotels have verified locations. The map follows your filters. Select a marker for parking details.</p>
        <div class="hotel-map-controls" data-hotel-map-controls hidden>
          <button type="button" id="hotel-locate">Show my location</button>
          <button type="button" id="hotel-fit-map">Fit selected hotels</button>
          <button type="button" id="hotel-clear-location" hidden>Clear my location</button>
        </div>
        <div id="hotel-map" class="hotel-map" role="region" tabindex="-1" aria-label="Filtered hotels and your location" hidden></div>
        <p id="hotel-map-status" class="hotel-map-status" role="status" aria-live="polite">Enable JavaScript to use the map. All hotel addresses are listed below.</p>
        <p class="hotel-map-privacy">Show my location asks your browser for permission. Your position is used for this map view and is not saved in the register. Map tiles are provided by <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>.</p>
      </section>
      </div>
      <details class="hotel-table-details"><summary>{icon('note')}Compare the full register</summary>
      <table class="hotel-table" data-hotel-table role="table">
        <caption>Room and stay totals cover the stated number of nights, not a nightly rate. Stay total = room + parking. Unknown prices remain unrecorded; these are not current advertised rates.</caption>
        <colgroup><col style="width:18%"><col style="width:8%"><col style="width:8%"><col style="width:8%"><col style="width:19%"><col style="width:23%"><col style="width:16%"></colgroup>
        <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Hotel</th><th scope="col" role="columnheader" class="hotel-money">Room total</th><th scope="col" role="columnheader" class="hotel-money">Parking</th><th scope="col" role="columnheader" class="hotel-money">Stay total</th><th scope="col" role="columnheader">Parking arrangement</th><th scope="col" role="columnheader">Parking receipt</th><th scope="col" role="columnheader">Short review</th></tr></thead>
        <tbody role="rowgroup">
{rows}
        </tbody>
      </table>
      </details>
      <div class="hotel-empty" data-hotel-empty hidden><strong>No hotels match these filters.</strong><p>Change a filter or choose All parking to see the other options. Reset filters returns to free parking.</p></div>
      <p class="hotel-price-note">The spreadsheet contains every hotel in the register. Free-parking tags refer to the specified guest parking option; charging a vehicle or choosing a paid garage can cost extra.</p>
    </section>
    <section class="hotel-method" aria-labelledby="hotel-method-title">
      <h2 id="hotel-method-title">What this register records</h2>
      <p>Hotels join the free-parking list only after their own published information confirms free guest parking. Each parking entry links to its source and check date, with known registration requirements and paid alternatives explained. Coverage grows as hotels are verified.</p>
      <p>Green means confirmed free guest parking, the preferred option and default filter. Yellow means “Easy parking”: parking costs money, but you can pay at the hotel. Red means paid parking handled separately through an external payment route — avoid. Payment at the hotel and inclusion on the hotel receipt are recorded separately.</p>
      <p>Stay reports and official hotel information are identified in each note. Personal names, booking references, card details and exact stay dates are excluded. Prices and parking arrangements can change; the recorded date keeps each entry in context.</p>
    </section>
  </main>
  <footer id="site-footer" class="site-footer"></footer>
  <script src="/config.js?v=blog-1"></script>
  <script src="/shared.js?v=hotel-fixed-1"></script>
  <script id="hotel-map-data" type="application/json">{map_json}</script>
  <script src="/blog/hotels/hotels.js?v=4"></script>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script src="/blog/hotels/hotels-map.js?v=4"></script>
</body>
</html>
'''


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Check that the published page matches its records')
    args = parser.parse_args()
    records = json.loads(DATA.read_text(encoding='utf-8'))['reviews']
    validate(records)
    records.sort(key=lambda review: review['recordedOn'], reverse=True)
    html = build(records)
    if args.check:
        assert OUTPUT.read_text(encoding='utf-8') == html, 'Run python3 tools/build-hotels.py to refresh the page'
        print(f'PASS: {len(records)} review(s); generated page is current')
    else:
        OUTPUT.write_text(html, encoding='utf-8')
        print(f'Built {OUTPUT.relative_to(ROOT)} from {len(records)} review(s)')
