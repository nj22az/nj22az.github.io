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
    'unknown': 'Parking not assessed',
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


def validate(reviews):
    ids = set()
    for review in reviews:
        assert re.fullmatch(r'[a-z0-9-]+', review['id']), 'Use a stable URL-safe review id'
        assert review['id'] not in ids, 'Duplicate review id'
        ids.add(review['id'])
        dt.date.fromisoformat(review['recordedOn'])
        assert re.fullmatch(r'[A-Z]{3}', review['currency']), 'Use an ISO currency code'
        assert review['parkingType'] in PARKING, 'Unknown parking type'
        for key in ('freeParking', 'easyParking', 'parkingOnHotelReceipt'):
            assert review[key] is None or type(review[key]) is bool, f'{key} must be true, false or null'
        for key in ('roomPaid', 'parkingPaid'):
            value = review[key]
            assert value is None or (type(value) in (int, float) and Decimal(str(value)).is_finite() and value >= 0), f'Invalid {key}'
        if review['freeParking'] is True:
            assert review['parkingPaid'] in (0, None), 'Free parking must not have a positive charge'
        for key in ('hotelUrl', 'parkingUrl'):
            url = urlparse(review[key])
            assert url.scheme == 'https' and url.netloc, 'Source links must be HTTPS'
        if review['coordinates'] is not None:
            point = review['coordinates']
            assert -90 <= point['latitude'] <= 90 and -180 <= point['longitude'] <= 180
            assert urlparse(point['sourceUrl']).scheme == 'https', 'Coordinates need a source'


def render_row(review):
    receipt = {True: 'On hotel receipt', False: 'Not on hotel receipt', None: 'Receipt not confirmed'}[review['parkingOnHotelReceipt']]
    ease = {True: 'Easy parking reported', False: 'Parking difficulty reported', None: 'Ease not assessed'}[review['easyParking']]
    search = ' '.join(review[key] for key in ('name', 'city', 'country', 'address', 'parkingOperator'))
    return f'''          <tr role="row" data-hotel-row="{e(review['id'])}" data-search="{e(search)}" data-free-parking="{state(review['freeParking'])}" data-easy-parking="{state(review['easyParking'])}" data-parking-type="{e(review['parkingType'])}" data-hotel-receipt="{state(review['parkingOnHotelReceipt'])}">
            <th scope="row" role="rowheader" data-label="Hotel"><a class="hotel-name" href="#review-{e(review['id'])}">{e(review['name'])}</a><span class="hotel-place">{e(review['city'])}, {e(review['country'])}</span><span class="hotel-recorded">Recorded <time datetime="{e(review['recordedOn'])}">{date_label(review['recordedOn'])}</time></span></th>
            <td role="cell" data-label="Room paid" class="hotel-money">{money(review['roomPaid'])}<span class="hotel-cell-note">{e(review['currency'])}</span></td>
            <td role="cell" data-label="Parking paid" class="hotel-money">{money(review['parkingPaid'])}<span class="hotel-cell-note">{e(review['currency'])}</span></td>
            <td role="cell" data-label="Total paid" class="hotel-money hotel-total">{money(total_paid(review))}<span class="hotel-cell-note">{e(review['currency'])}</span></td>
            <td role="cell" data-label="Parking arrangement" class="hotel-parking"><span class="hotel-tag">{PARKING[review['parkingType']]}</span><span class="hotel-cell-note">{e(review['parkingOperator'])}<br>{ease}</span></td>
            <td role="cell" data-label="Parking receipt" class="hotel-receipt"><span class="hotel-tag">{receipt}</span><span class="hotel-cell-note">On this stay. <a href="{e(review['parkingUrl'])}">{e(review['parkingReceipt'])}</a>.</span></td>
            <td role="cell" data-label="Short review" class="hotel-summary">{e(review['summary'])}</td>
          </tr>'''


def render_review(review):
    paragraphs = '\n'.join('        <p>' + e(paragraph) + '</p>' for paragraph in review['review'])
    tags = [PARKING[review['parkingType']]]
    if review['parkingOnHotelReceipt'] is False:
        tags.extend(['Separate parking receipt', 'Parking not on hotel receipt'])
    tag_list = ''.join('<li class="hotel-tag">' + e(tag) + '</li>' for tag in tags)
    return f'''      <article class="hotel-review" id="review-{e(review['id'])}" data-hotel-note="{e(review['id'])}" aria-labelledby="title-{e(review['id'])}">
        <h3 id="title-{e(review['id'])}">{e(review['name'])} — {e(review['city'])}</h3>
        <p class="hotel-review-meta">{e(review['address'])}, {e(review['city'])}, {e(review['country'])}<br>By Nils Johansson · Recorded <time datetime="{e(review['recordedOn'])}">{date_label(review['recordedOn'])}</time></p>
{paragraphs}
        <ul class="hotel-review-tags" aria-label="Parking tags for this stay">{tag_list}</ul>
        <p class="hotel-source">{e(review['sourceNote'])}<br><a href="{e(review['hotelUrl'])}">Official hotel information</a><a href="{e(review['parkingUrl'])}">Pair parking information</a></p>
      </article>'''


def build(reviews):
    rows = '\n'.join(render_row(review) for review in reviews)
    notes = '\n'.join(render_review(review) for review in reviews)
    count = len(reviews)
    return f'''<!DOCTYPE html>
<!-- Generated from hotels.json by tools/build-hotels.py. -->
<html lang="en" data-theme="cobalt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hotels &amp; Parking | Blog – The Office of Nils Johansson</title>
  <meta name="description" content="Short personal hotel reviews with the room price paid, parking costs and receipt arrangements. A growing reference for finding hotels with free, easy parking.">
  <link rel="canonical" href="https://nj22az.github.io/blog/hotels/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Hotels &amp; Parking – The Office of Nils Johansson">
  <meta property="og:description" content="A personal hotel register: short reviews, prices paid, parking costs and receipt arrangements.">
  <meta property="og:url" content="https://nj22az.github.io/blog/hotels/">
  <meta name="twitter:card" content="summary">
  <meta name="theme-color" content="#343ec9">
  <link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
  <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <script src="/theme-bootstrap.js?v=hotels-1"></script>
  <link rel="stylesheet" href="/styles.css?v=popwave-icons-2">
  <link rel="stylesheet" href="/css/hotels.css?v=1">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <nav id="site-nav" class="site-nav"></nav>
  <main id="main-content" class="hotel-page">
    <nav class="blog-section-nav" aria-label="Blog sections"><a href="/blog/">Articles</a><a href="/blog/hotels/" aria-current="page">Hotels &amp; Parking</a></nav>
    <header>
      <p class="hotel-eyebrow">The travel register</p>
      <h1>Hotels &amp; Parking</h1>
      <p class="hotel-intro">Short reviews from my own stays, with the room price paid, parking costs and receipt arrangements. A growing reference for finding hotels with free, straightforward parking.</p>
    </header>
    <section aria-labelledby="hotel-register-title">
      <div class="hotel-register-heading"><h2 id="hotel-register-title">Hotel register</h2><a class="hotel-download" href="/blog/hotels/hotel-reviews.csv" download>Download spreadsheet (CSV)</a></div>
      <form class="hotel-filters" data-hotel-filters hidden role="search" aria-label="Filter hotel reviews">
        <div class="hotel-field hotel-search"><label for="hotel-search">Hotel or place</label><input id="hotel-search" type="search" name="search" placeholder="Search hotel, city or country" autocomplete="off"></div>
        <div class="hotel-field"><label for="hotel-parking">Parking</label><select id="hotel-parking" name="parking"><option value="">All parking</option><option value="free">Free parking</option><option value="free-easy">Free and easy parking</option><option value="external-paid">External paid parking</option><option value="paid">All paid parking</option></select></div>
        <div class="hotel-field"><label for="hotel-receipt">Parking on hotel receipt</label><select id="hotel-receipt" name="receipt"><option value="">Any arrangement</option><option value="true">Yes</option><option value="false">No — separate receipt</option><option value="unknown">Not confirmed</option></select></div>
        <button type="reset" class="hotel-reset">Clear filters</button>
      </form>
      <p class="hotel-count" data-hotel-count role="status" aria-live="polite">{count} hotel {'review' if count == 1 else 'reviews'}</p>
      <table class="hotel-table" data-hotel-table role="table">
        <caption>Amounts actually paid for the recorded stay. Total = room + parking; these are not current advertised rates.</caption>
        <colgroup><col style="width:18%"><col style="width:8%"><col style="width:8%"><col style="width:8%"><col style="width:19%"><col style="width:23%"><col style="width:16%"></colgroup>
        <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Hotel</th><th scope="col" role="columnheader" class="hotel-money">Room paid</th><th scope="col" role="columnheader" class="hotel-money">Parking paid</th><th scope="col" role="columnheader" class="hotel-money">Total paid</th><th scope="col" role="columnheader">Parking arrangement</th><th scope="col" role="columnheader">Parking receipt</th><th scope="col" role="columnheader">Short review</th></tr></thead>
        <tbody role="rowgroup">
{rows}
        </tbody>
      </table>
      <div class="hotel-empty" data-hotel-empty hidden><strong>No hotel reviews match these filters.</strong><p>The register will grow as more stays are recorded. “Free and easy parking” includes only stays where both have been confirmed. Use Clear filters to see every entry.</p></div>
      <p class="hotel-price-note">The spreadsheet contains all recorded reviews. Parking tags describe the arrangements reported for each stay.</p>
    </section>
    <section class="hotel-notes" data-hotel-notes aria-labelledby="hotel-notes-title">
      <h2 id="hotel-notes-title">Stay notes</h2>
{notes}
    </section>
    <section class="hotel-method" aria-labelledby="hotel-method-title">
      <h2>What this register records</h2>
      <p>Parking cost, ease of parking and receipt arrangements are recorded separately. “Not assessed” means there is not yet enough first-hand information to judge that point. A hotel only appears under “Free and easy parking” when both conditions have been reported.</p>
      <p>The aim is to build a useful shortlist and, as the register grows, a map of hotels with free, straightforward parking. Prices and parking arrangements can change; the recorded date keeps each review in context.</p>
    </section>
  </main>
  <footer id="site-footer" class="site-footer"></footer>
  <script src="/config.js?v=blog-1"></script>
  <script src="/shared.js?v=blog-1"></script>
  <script src="/blog/hotels/hotels.js?v=1"></script>
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
