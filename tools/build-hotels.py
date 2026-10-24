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


def e(value):
    return escape(str(value), quote=True)


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
    if not free and (review.get('parkingType') not in ('external-paid', 'hotel-paid') or review.get('parkingPaid') == 0):
        raise ValueError(f'{label}: confirmed paid parking must have a paid arrangement')
    if not isinstance(review.get('parkingSummary'), str) or not review['parkingSummary'].strip():
        raise ValueError(f'{label}: describe the verified parking option and any known conditions')


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
        for key in ('freeParking', 'easyParking', 'parkingOnHotelReceipt'):
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
    receipt = receipt_label(review)
    ease = {True: 'Easy parking reported', False: 'Parking difficulty reported', None: 'Ease not assessed'}[review['easyParking']]
    search = ' '.join(review.get(key) or '' for key in ('name', 'city', 'country', 'address', 'postalCode', 'parkingOperator', 'parkingSummary'))
    receipt_note = e(review['parkingReceipt'])
    if review['freeParking'] is not True and review['parkingUrl']:
        receipt_note = f'On this stay. <a href="{e(review["parkingUrl"])}">{receipt_note}</a>.'
    place = ', '.join((review['address'], ' '.join(value for value in (review.get('postalCode'), review['city']) if value)))
    return f'''          <tr role="row" data-hotel-row="{e(review['id'])}" data-search="{e(search)}" data-country="{e(review['countryCode'])}" data-free-parking="{state(review['freeParking'])}" data-easy-parking="{state(review['easyParking'])}" data-parking-type="{e(review['parkingType'])}" data-hotel-receipt="{receipt_state(review)}">
            <th scope="row" role="rowheader" data-label="Hotel"><a class="hotel-name" href="#review-{e(review['id'])}">{e(review['name'])}</a><span class="hotel-place">{e(place)}</span><span class="hotel-tag hotel-country">{e(review['country'])}</span><span class="hotel-recorded">Recorded <time datetime="{e(review['recordedOn'])}">{date_label(review['recordedOn'])}</time></span></th>
            <td role="cell" data-label="Room total" class="hotel-money">{price_cell(review['roomPaid'], review, include_nights=True)}</td>
            <td role="cell" data-label="Parking" class="hotel-money">{price_cell(review['parkingPaid'], review, free=review['freeParking'] is True)}</td>
            <td role="cell" data-label="Stay total" class="hotel-money hotel-total">{price_cell(total_paid(review), review, include_nights=True)}</td>
            <td role="cell" data-label="Parking arrangement" class="hotel-parking"><span class="hotel-tag">{e(review.get('parkingLabel') or PARKING[review['parkingType']])}</span><span class="hotel-cell-note">{e(review['parkingSummary'])}<br>{ease}<br><a href="{e(verification['sourceUrl'])}">Checked <time datetime="{e(verification['checkedOn'])}">{date_label(verification['checkedOn'])}</time></a></span></td>
            <td role="cell" data-label="Parking receipt" class="hotel-receipt"><span class="hotel-tag">{receipt}</span><span class="hotel-cell-note">{receipt_note}</span></td>
            <td role="cell" data-label="Short review" class="hotel-summary">{e(review['summary'])}</td>
          </tr>'''


def render_review(review):
    paragraphs = '\n'.join('        <p>' + e(paragraph) + '</p>' for paragraph in review['review'])
    tags = [review['country'], review.get('parkingLabel') or PARKING[review['parkingType']]]
    if review['freeParking'] is True:
        tags.append('No parking charge')
    elif review['parkingOnHotelReceipt'] is False:
        tags.extend(['Separate parking receipt', 'Parking not on hotel receipt'])
    tag_list = ''.join('<li class="hotel-tag">' + e(tag) + '</li>' for tag in tags)
    links = f'<a href="{e(review["hotelUrl"])}">Official hotel information</a>'
    if review['parkingUrl'] and review['parkingUrl'] != review['hotelUrl']:
        links += f'<a href="{e(review["parkingUrl"])}">Parking information</a>'
    if review['coordinates'] and review['coordinates']['sourceUrl'] not in (review['hotelUrl'], review['parkingUrl']):
        links += f'<a href="{e(review["coordinates"]["sourceUrl"])}">Hotel map location</a>'
    return f'''      <article class="hotel-review" id="review-{e(review['id'])}" data-hotel-note="{e(review['id'])}" aria-labelledby="title-{e(review['id'])}">
        <h3 id="title-{e(review['id'])}">{e(review['name'])} — {e(review['city'])}</h3>
        <p class="hotel-review-meta">{e(full_address(review))}<br>Recorded <time datetime="{e(review['recordedOn'])}">{date_label(review['recordedOn'])}</time></p>
{paragraphs}
        <ul class="hotel-review-tags" aria-label="Country and parking tags">{tag_list}</ul>
        <p class="hotel-source">{e(review['sourceNote'])}<br>{links}</p>
      </article>'''


def build(reviews):
    rows = '\n'.join(render_row(review) for review in reviews)
    notes = '\n'.join(render_review(review) for review in reviews)
    count = len(reviews)
    countries = sorted({(review['countryCode'], review['country']) for review in reviews}, key=lambda item: item[1])
    country_options = ''.join(f'<option value="{e(code)}">{e(name)}</option>' for code, name in countries)
    map_records = [{
        'id': review['id'], 'name': review['name'], 'city': review['city'], 'country': review['country'],
        'address': ', '.join(value for value in (review['address'], review.get('postalCode')) if value),
        'latitude': review['coordinates']['latitude'], 'longitude': review['coordinates']['longitude'],
        'parkingLabel': review.get('parkingLabel') or PARKING[review['parkingType']], 'reviewId': 'review-' + review['id']
    } for review in reviews if review['coordinates'] is not None]
    map_json = json.dumps(map_records, ensure_ascii=False).replace('<', '\\u003c')
    return f'''<!DOCTYPE html>
<!-- Generated from hotels.json by tools/build-hotels.py. -->
<html lang="en" data-theme="cobalt">
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
  <meta name="theme-color" content="#343ec9">
  <link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
  <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <script src="/theme-bootstrap.js?v=hotels-1"></script>
  <link rel="stylesheet" href="/styles.css?v=popwave-icons-2">
  <link rel="stylesheet" href="/css/hotels.css?v=2">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
  <link rel="stylesheet" href="/css/hotels-map.css?v=1">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <nav id="site-nav" class="site-nav"></nav>
  <main id="main-content" class="hotel-page">
    <nav class="blog-section-nav" aria-label="Blog sections"><a href="/blog/">Articles</a><a href="/blog/hotels/" aria-current="page">Hotels &amp; Parking</a></nav>
    <header>
      <p class="hotel-eyebrow">The travel register</p>
      <h1>Hotels &amp; Parking</h1>
      <p class="hotel-intro">Hotel reviews and confirmed parking information from Sweden, Denmark, Norway and Finland. Find free guest parking and use the map to see the hotels that match your filters.</p>
    </header>
    <section aria-labelledby="hotel-register-title">
      <div class="hotel-register-heading"><h2 id="hotel-register-title">Hotel register</h2><a class="hotel-download" href="/blog/hotels/hotel-reviews.csv" download>Download spreadsheet (CSV)</a></div>
      <form class="hotel-filters" data-hotel-filters hidden role="search" aria-label="Filter hotel reviews">
        <div class="hotel-field hotel-search"><label for="hotel-search">Hotel or place</label><input id="hotel-search" type="search" name="search" placeholder="Search hotel, city or country" autocomplete="off"></div>
        <div class="hotel-field"><label for="hotel-country">Country</label><select id="hotel-country" name="country"><option value="">All countries</option>{country_options}</select></div>
        <div class="hotel-field"><label for="hotel-parking">Parking</label><select id="hotel-parking" name="parking"><option value="">All parking</option><option value="free">Free parking</option><option value="free-easy">Free and easy parking</option><option value="external-paid">External paid parking</option><option value="paid">All paid parking</option></select></div>
        <div class="hotel-field"><label for="hotel-receipt">Parking on hotel receipt</label><select id="hotel-receipt" name="receipt"><option value="">Any arrangement</option><option value="not-applicable">No parking charge</option><option value="true">Yes</option><option value="false">No — separate receipt</option><option value="unknown">Not confirmed</option></select></div>
        <button type="reset" class="hotel-reset">Clear filters</button>
      </form>
      <p class="hotel-count" data-hotel-count role="status" aria-live="polite">{count} {'hotel' if count == 1 else 'hotels'}</p>
      <section class="hotel-map-section" aria-labelledby="hotel-map-title">
        <h3 id="hotel-map-title">Map of selected hotels</h3>
        <p class="hotel-map-intro">The map follows the filters above. Select a hotel marker to read its notes.</p>
        <div class="hotel-map-controls" data-hotel-map-controls hidden>
          <button type="button" id="hotel-locate">Show my location</button>
          <button type="button" id="hotel-fit-map">Fit selected hotels</button>
          <button type="button" id="hotel-clear-location" hidden>Clear my location</button>
        </div>
        <div id="hotel-map" class="hotel-map" role="region" aria-label="Filtered hotels and your location" hidden></div>
        <p id="hotel-map-status" class="hotel-map-status" role="status" aria-live="polite">Enable JavaScript to use the map. All hotel addresses are listed below.</p>
        <p class="hotel-map-privacy">Show my location asks your browser for permission. Your position is used for this map view and is not saved in the register. Map tiles are provided by <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>.</p>
      </section>
      <table class="hotel-table" data-hotel-table role="table">
        <caption>Room and stay totals cover the stated number of nights, not a nightly rate. Stay total = room + parking. Unknown prices remain unrecorded; these are not current advertised rates.</caption>
        <colgroup><col style="width:18%"><col style="width:8%"><col style="width:8%"><col style="width:8%"><col style="width:19%"><col style="width:23%"><col style="width:16%"></colgroup>
        <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Hotel</th><th scope="col" role="columnheader" class="hotel-money">Room total</th><th scope="col" role="columnheader" class="hotel-money">Parking</th><th scope="col" role="columnheader" class="hotel-money">Stay total</th><th scope="col" role="columnheader">Parking arrangement</th><th scope="col" role="columnheader">Parking receipt</th><th scope="col" role="columnheader">Short review</th></tr></thead>
        <tbody role="rowgroup">
{rows}
        </tbody>
      </table>
      <div class="hotel-empty" data-hotel-empty hidden><strong>No hotels match these filters.</strong><p>“Free and easy parking” includes only hotels where both have been confirmed. Use Clear filters to see every entry.</p></div>
      <p class="hotel-price-note">The spreadsheet contains every hotel in the register. Free-parking tags refer to the specified guest parking option; charging a vehicle or choosing a paid garage can cost extra.</p>
    </section>
    <section class="hotel-notes" data-hotel-notes aria-labelledby="hotel-notes-title">
      <h2 id="hotel-notes-title">Reviews &amp; parking notes</h2>
{notes}
    </section>
    <section class="hotel-method" aria-labelledby="hotel-method-title">
      <h2 id="hotel-method-title">What this register records</h2>
      <p>Hotels join the free-parking list only after their own published information confirms free guest parking. Each parking entry links to its source and check date, with known registration requirements and paid alternatives explained. Coverage grows as hotels are verified.</p>
      <p>Parking cost, ease of parking and receipt arrangements are recorded separately. “Not assessed” means there is not yet enough first-hand information to judge that point. A hotel only appears under “Free and easy parking” when both conditions have been reported.</p>
      <p>Stay reports and official hotel information are identified in each note. Personal names, booking references, card details and exact stay dates are excluded. Prices and parking arrangements can change; the recorded date keeps each entry in context.</p>
    </section>
  </main>
  <footer id="site-footer" class="site-footer"></footer>
  <script src="/config.js?v=blog-1"></script>
  <script src="/shared.js?v=blog-1"></script>
  <script id="hotel-map-data" type="application/json">{map_json}</script>
  <script src="/blog/hotels/hotels.js?v=2"></script>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script src="/blog/hotels/hotels-map.js?v=1"></script>
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
