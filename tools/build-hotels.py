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
    'payment-unconfirmed': 'Paid parking · Payment route unconfirmed',
    'free': 'Free parking',
}
PARKING_CATEGORIES = {
    'free': 'Free parking',
    'easy': 'Easy parking · One hotel receipt',
    'avoid': 'Paid parking · Avoid',
}


def parking_category(review):
    if review.get('parkingAccessWarning', {}).get('status') == 'avoid':
        return 'avoid'
    if review.get('freeParking') is True:
        return 'free'
    if review.get('freeParking') is False:
        payment = review.get('parkingPaymentAtHotel')
        if payment is None or type(payment) is bool:
            return 'easy' if payment is True and review.get('parkingOnHotelReceipt') is True else 'avoid'
    raise ValueError(f'{review.get("name", "Hotel")}: confirm the parking charge and payment route before publishing')


def parking_category_label(review):
    if review.get('parkingAccessWarning', {}).get('status') == 'avoid':
        return 'Avoid · Difficult access' + (' · Free parking' if review['freeParking'] else '')
    if review['freeParking'] is False and review['parkingPaymentAtHotel'] is None:
        return 'Avoid · Payment route unconfirmed'
    if review['freeParking'] is False and review['parkingPaymentAtHotel'] is True and review['parkingOnHotelReceipt'] is not True:
        return 'Avoid · Hotel receipt unconfirmed' if review['parkingOnHotelReceipt'] is None else 'Avoid · Separate parking receipt'
    return PARKING_CATEGORIES[parking_category(review)]


def e(value):
    return escape(str(value), quote=True)


def hotel_chain(review):
    # Existing official property identities, not an affiliation inferred from location.
    if review['name'].startswith('Scandic ') or review['hotelId'] in ('haymarket-by-scandic', 'downtown-camper-by-scandic'):
        return 'Scandic'
    if review['name'].startswith('Best Western '):
        return 'Best Western'
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
    return {True: 'On hotel receipt', False: 'Not on hotel receipt', None: 'Hotel receipt: unconfirmed'}[review['parkingOnHotelReceipt']]


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
    if not free and (review.get('parkingType') not in ('external-paid', 'hotel-paid', 'payment-unconfirmed') or review.get('parkingPaid') == 0):
        raise ValueError(f'{label}: confirmed paid parking must have a paid arrangement')
    if not isinstance(review.get('parkingSummary'), str) or not review['parkingSummary'].strip():
        raise ValueError(f'{label}: describe the verified parking option and any known conditions')
    if not free:
        expected_type = {True: 'hotel-paid', False: 'external-paid', None: 'payment-unconfirmed'}.get(review.get('parkingPaymentAtHotel'))
        if review.get('parkingType') != expected_type:
            raise ValueError(f'{label}: preserve the verified or unknown payment route')
    parking_category(review)


def validate(reviews):
    ids = set()
    for review in reviews:
        validate_parking_confirmation(review)
        assert re.fullmatch(r'[a-z0-9-]+', review['id']), 'Use a stable URL-safe review id'
        assert review['id'] not in ids, 'Duplicate review id'
        ids.add(review['id'])
        dt.date.fromisoformat(review['recordedOn'])
        warning = review.get('parkingAccessWarning')
        if warning is not None:
            assert warning.get('status') == 'avoid' and warning.get('source') == 'owner stay report', 'Access overrides need an attributed owner report'
            assert isinstance(warning.get('reason'), str) and warning['reason'].strip(), 'Explain the access concern'
            assert dt.date.fromisoformat(warning['reportedOn']) <= dt.date.today(), 'Access report cannot be future dated'
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
    if review['freeParking'] is not True and review['parkingPaid'] is not None and review['parkingUrl']:
        receipt_note = f'On this stay. <a href="{e(review["parkingUrl"])}">{receipt_note}</a>.'
    place = ', '.join((review['address'], ' '.join(value for value in (review.get('postalCode'), review['city']) if value)))
    return f'''          <tr role="row" data-hotel-row="{e(review['id'])}" data-search="{e(search)}" data-country="{e(review['countryCode'])}" data-chain="{e(hotel_chain(review))}" data-free-parking="{state(review['freeParking'])}" data-parking-category="{category}" data-parking-type="{e(review['parkingType'])}" data-hotel-receipt="{receipt_state(review)}">
            <th scope="row" role="rowheader" data-label="Hotel"><a class="hotel-name" href="#review-{e(review['id'])}">{e(review['name'])}</a><span class="hotel-place">{e(place)}</span><span class="hotel-tag hotel-country">{e(review['country'])}</span><span class="hotel-recorded">Recorded <time datetime="{e(review['recordedOn'])}">{date_label(review['recordedOn'])}</time></span></th>
            <td role="cell" data-label="Room total" class="hotel-money">{price_cell(review['roomPaid'], review, include_nights=True)}</td>
            <td role="cell" data-label="Parking" class="hotel-money">{price_cell(review['parkingPaid'], review, free=review['freeParking'] is True)}</td>
            <td role="cell" data-label="Stay total" class="hotel-money hotel-total">{price_cell(total_paid(review), review, include_nights=True)}</td>
            <td role="cell" data-label="Parking arrangement" class="hotel-parking"><span class="hotel-tag hotel-parking-{category}">{e(parking_category_label(review))}</span><span class="hotel-cell-note">{e(review['parkingSummary'])}<br><a href="{e(verification['sourceUrl'])}">Checked <time datetime="{e(verification['checkedOn'])}">{date_label(verification['checkedOn'])}</time></a></span></td>
            <td role="cell" data-label="Parking receipt" class="hotel-receipt"><span class="hotel-tag">{receipt}</span><span class="hotel-cell-note">{receipt_note}</span></td>
            <td role="cell" data-label="Short review" class="hotel-summary">{e(review['summary'])}</td>
          </tr>'''


ICONS = {
    'pin': '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    'parking': '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
    'note': '<path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5"/>',
    'check': '<path d="m5 12 4 4L19 6"/>',
    'list': '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    'clipboard': '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM9 11h6M9 15h4"/>',
    'receipt': '<path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    'card': '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
    'car': '<path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><path d="M3 12h18"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/>',
    'wallet': '<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H3z"/><path d="M3 7l12-4v4M16 13.5h2"/>',
    'message': '<path d="M4 5h16v11H10l-5 4v-4H4z"/>',
    'bookmark': '<path d="M7 3h10v18l-5-4-5 4z"/>',
    'share': '<path d="M12 15V3m-4 4 4-4 4 4M5 12v8h14v-8"/>',
    'globe': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    'sliders': '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    'search': '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    'locate': '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    'flag': '<path d="M5 21V4h11l-2 4 2 4H5"/>',
    'start': '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/>',
    'route': '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
    'warning': '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17v.01"/>',
    'info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
    'close': '<path d="M6 6l12 12M18 6 6 18"/>',
    'fit': '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
}


def icon(name):
    return ('<svg class="hotel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>')


# Nordic cross flags, drawn to the official proportions; a flag is a country's own colour coding
# and never collides with the parking colours.
FLAGS = {
    'SE': ('16:10', '#006aa7', '#fecc02', 5, 2),
    'DK': ('37:28', '#c8102e', '#ffffff', 12, 4),
    'FI': ('18:11', '#ffffff', '#003580', 5, 3),
    'NO': ('22:16', '#ba0c2f', '#ffffff', 6, 4),
}


def flag(code, name):
    ratio, field, cross, hoist, width = FLAGS[code]
    w, h = (int(v) for v in ratio.split(':'))
    cy = h / 2
    bars = f'<rect x="{hoist}" width="{width}" height="{h}" fill="{cross}"/><rect y="{cy - width / 2}" width="{w}" height="{width}" fill="{cross}"/>'
    if code == 'NO':  # a blue cross inside the white one
        bars += f'<rect x="{hoist + 1}" width="{width - 2}" height="{h}" fill="#00205b"/><rect y="{cy - (width - 2) / 2}" width="{w}" height="{width - 2}" fill="#00205b"/>'
    return (f'<svg class="hotel-flag" viewBox="0 0 {w} {h}" role="img" aria-label="{e(name)}"><rect width="{w}" height="{h}" fill="{field}"/>{bars}'
            f'<rect width="{w}" height="{h}" fill="none" stroke="rgba(8,19,26,.25)" stroke-width=".6"/></svg>')


def country_tag(review):
    return (f'<button type="button" class="hotel-country-tag" data-hotel-country="{e(review["countryCode"])}" aria-pressed="false" '
            f'title="Show only {e(review["country"])}">{flag(review["countryCode"], review["country"])}{e(review["countryCode"])}</button>')


def place_key(review):
    """Feed order without a trip: country, then city, then hotel, so a place can be found by eye."""
    return (review['country'].casefold(), review['city'].casefold(), review['name'].casefold())


def post_chips(review):
    """Short icon facts from the record itself; unknown stays visibly unknown."""
    chips = []
    details = review.get('parkingDetails') or {}
    if review['freeParking'] is True and details.get('freeArea'):
        chips.append(('pin', details['freeArea']))
    if details.get('spaces'):
        chips.append(('car', f'{details["spaces"]} spaces'))
    if review['freeParking'] is not True:
        operator = review.get('parkingOperator')
        chips.append(('card', {True: 'Pay at the hotel', False: 'Pay separately' + (f' ({operator})' if operator else ''),
                               None: 'Payment not confirmed'}[review['parkingPaymentAtHotel']]))
        chips.append(('receipt', {True: 'On the hotel receipt', False: 'Separate receipt',
                                  None: 'Receipt not confirmed'}[review['parkingOnHotelReceipt']]))
    # Older entries give registration in their parking instructions, shown as the caption.
    if 'parkingDetails' in review:
        registration = details.get('registrationAtReception')
        chips.append(('clipboard', 'Register at reception' if registration is True else
                      'No registration needed' if registration is False else 'Registration not stated'))
    paid_total = total_paid(review)
    if paid_total is not None:
        nights = review.get('nights')
        duration = f'{nights} ' + ('night' if nights == 1 else 'nights') if nights else 'nights not recorded'
        chips.append(('wallet', f'Paid {review["currency"] or review.get("currencyLabel") or ""} {money(paid_total)} · {duration}'))
    return ''.join(f'<li>{icon(name)}{e(text)}</li>' for name, text in chips)


def comment(kind, who, body):
    return (f'<li class="hotel-comment hotel-comment-{kind}"><span class="hotel-comment-icon">{icon(kind)}</span>'
            f'<div class="hotel-comment-body"><p class="hotel-comment-who">{who}</p>{body}</div></li>')


def post_thread(review):
    """Comments are the record's own notes: an owner report, the price paid, the register notes and its sources."""
    items = []
    warning = review.get('parkingAccessWarning')
    if warning:
        items.append(comment('warning', f'Owner’s report · <time datetime="{e(warning["reportedOn"])}">{date_label(warning["reportedOn"])}</time>',
                             f'<p>{e(warning["reason"])}</p>'))
    items.append(comment('wallet', 'Price paid' if review['roomPaid'] is not None else 'Price', f'<p>{e(review["priceNote"])}</p>'))
    items.append(comment('note', 'Register notes', ''.join(f'<p>{e(paragraph)}</p>' for paragraph in review['review'])))
    links = f'<a href="{e(review["hotelUrl"])}">Official hotel information</a>'
    if review['parkingUrl'] and review['parkingUrl'] != review['hotelUrl']:
        links += f'<a href="{e(review["parkingUrl"])}">Parking information</a>'
    if review['coordinates'] and review['coordinates']['sourceUrl'] not in (review['hotelUrl'], review['parkingUrl']):
        links += f'<a href="{e(review["coordinates"]["sourceUrl"])}">Hotel map location</a>'
    verification = review['parkingVerification']
    items.append(comment('check', f'Sources · parking checked <a href="{e(verification["sourceUrl"])}"><time datetime="{e(verification["checkedOn"])}">{date_label(verification["checkedOn"])}</time></a>',
                         f'<p>{e(review["sourceNote"])}</p><p class="hotel-comment-meta">{e(full_address(review))} · recorded '
                         f'<time datetime="{e(review["recordedOn"])}">{date_label(review["recordedOn"])}</time></p><p class="hotel-source">{links}</p>'))
    return items


def render_review(review):
    category = parking_category(review)
    rid = e(review['id'])
    thread = post_thread(review)
    map_action = (f'<a href="#hotel-map" data-hotel-focus="{rid}" hidden>{icon("pin")}Map</a>' if review['coordinates']
                  else '<span class="hotel-unmapped">Map location awaiting verification</span>')
    checked = review['parkingVerification']['checkedOn']
    return f'''      <article class="hotel-review hotel-post" id="review-{rid}" data-hotel-note="{rid}" data-checked="{e(checked)}" aria-labelledby="title-{rid}">
        <header class="hotel-post-head"><span class="hotel-avatar hotel-avatar-{category}" aria-hidden="true">P</span><div class="hotel-post-who"><h4 id="title-{rid}">{e(review['name'])}</h4><p class="hotel-post-meta"><strong class="hotel-verdict hotel-verdict-{category}">{e(parking_category_label(review))}</strong> · {e(review['city'])}</p></div>{country_tag(review)}<button type="button" class="hotel-save" data-hotel-save="{rid}" aria-pressed="false" aria-label="Save {e(review['name'])}" hidden>{icon('bookmark')}</button></header>
        <p class="hotel-trip-line" data-hotel-trip-line hidden></p>
        <p class="hotel-post-caption">{e(review['parkingSummary'])}</p>
        <ul class="hotel-chips" aria-label="Parking facts">{post_chips(review)}</ul>
        <div class="hotel-post-actions"><button type="button" data-hotel-thread="{rid}" aria-expanded="false" aria-controls="notes-{rid}" hidden>{icon('message')}Notes <span class="hotel-action-count">{len(thread)}</span></button>{map_action}<a href="{e(review['hotelUrl'])}">{icon('globe')}Website</a><button type="button" data-hotel-share="{rid}" hidden>{icon('share')}Share</button></div>
        <ol class="hotel-thread" id="notes-{rid}" aria-label="Notes on {e(review['name'])}">{''.join(thread)}</ol>
      </article>'''


def render_parking_choice(reviews):
    counts = {key: sum(parking_category(review) == key for review in reviews) for key in PARKING_CATEGORIES}
    options = (('free', 'Free parking'), ('easy', 'Easy'), ('avoid', 'Avoid'), ('', 'All'), ('saved', 'Saved'))
    labels = ''.join(
        f'<label class="hotel-option hotel-option-{value or "all"}"{" data-hotel-saved-option hidden" if value == "saved" else ""}>'
        f'<input type="radio" name="parking" value="{value}"{" checked" if value == "free" else ""}><span>'
        f'{icon("bookmark") if value == "saved" else ""}{text} <span class="hotel-option-count" data-parking-count="{value or "all"}">'
        f'{0 if value == "saved" else counts[value] if value else len(reviews)}</span><span class="hotel-sr"> hotels</span></span></label>'
        for value, text in options)
    return f'''<fieldset class="hotel-choice"><legend class="hotel-sr">Show</legend><div class="hotel-choice-options">{labels}</div></fieldset>'''


def gazetteer(reviews):
    """Places a trip can start or end at: the register's own towns, at the centre of their hotels."""
    towns = {}
    for review in reviews:
        if review['coordinates'] is None:
            continue
        town = re.sub(r'\s+(?:[A-ZÆØÅÄÖ]{1,2}|SØ|NV|NØ|SV)$', '', review['city'])
        towns.setdefault((town, review['countryCode']), []).append(review['coordinates'])
    return [{'name': town, 'country': code,
             'latitude': round(sum(p['latitude'] for p in points) / len(points), 5),
             'longitude': round(sum(p['longitude'] for p in points) / len(points), 5)}
            for (town, code), points in sorted(towns.items(), key=lambda item: item[0][0].casefold())]


def build(reviews):
    reviews = sorted(reviews, key=place_key)
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
        'parkingLabel': parking_category_label(review),
        'parkingSummary': review['parkingSummary'], 'reviewId': 'review-' + review['id']
    } for review in reviews if review['coordinates'] is not None]
    map_json = json.dumps(map_records, ensure_ascii=False).replace('<', '\\u003c')
    places = gazetteer(reviews)
    places_json = json.dumps(places, ensure_ascii=False).replace('<', '\\u003c')
    place_options = ''.join(f'<option value="{e(place["name"])}"></option>' for place in places)
    codes = ' · '.join(code for code, _ in countries)
    return f'''<!DOCTYPE html>
<!-- Generated from hotels.json by tools/build-hotels.py. -->
<html lang="en" data-theme="clarity" data-theme-lock="clarity" data-hotel-design="note">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hotels &amp; Parking | Blog – The Office of Nils Johansson</title>
  <meta name="description" content="Hotels for field service engineers: verified free parking, a trip planner with drive times, payment and receipt facts, and a map across Denmark, Sweden, Norway and Finland.">
  <link rel="canonical" href="https://nj22az.github.io/blog/hotels/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Hotels &amp; Parking – The Office of Nils Johansson">
  <meta property="og:description" content="Hotels in Sweden, Denmark, Norway and Finland: confirmed parking, a trip planner, a filtered map and prices paid.">
  <meta property="og:url" content="https://nj22az.github.io/blog/hotels/">
  <meta property="og:image" content="https://nj22az.github.io/blog/hotels/banner/banner-desktop.jpg">
  <meta property="og:image:width" content="2400">
  <meta property="og:image:height" content="800">
  <meta property="og:image:alt" content="Tetsuo drives his kei truck past Sakura Shōten, printed as a rubber stamp.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#333333">
  <link rel="icon" type="image/svg+xml" href="/assets/images/favicon-hotels.svg">
  <link rel="icon" type="image/png" href="/assets/images/apple-touch-icon-hotels.png">
  <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon-hotels.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <script src="/theme-bootstrap.js?v=hotel-fixed-1"></script>
  <link rel="stylesheet" href="/styles.css?v=popwave-icons-2">
  <link rel="stylesheet" href="/css/hotels.css?v=10">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
  <link rel="stylesheet" href="/css/hotels-map.css?v=3">
</head>
<body class="hotel-site">
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <nav id="site-nav" class="site-nav"></nav>
  <main id="main-content" class="hotel-page">
    <nav class="blog-section-nav" aria-label="Blog sections"><a href="/blog/">Articles</a><a href="/blog/hotels/" aria-current="page">Hotels &amp; Parking</a></nav>
    <header class="hotel-page-head">
      <h1 class="hotel-sr">Hotels &amp; Parking: free parking for field service trips</h1>
      <picture class="hotel-banner">
        <source media="(max-width: 600px)" type="image/webp" srcset="/blog/hotels/banner/banner-phone.webp" width="1200" height="900">
        <source media="(max-width: 600px)" srcset="/blog/hotels/banner/banner-phone.jpg" width="1200" height="900">
        <source type="image/webp" srcset="/blog/hotels/banner/banner-desktop.webp">
        <img src="/blog/hotels/banner/banner-desktop.jpg" width="2400" height="800" fetchpriority="high" alt="Hotels &amp; Parking, free parking for field service trips: Tetsuo drives his kei truck past Sakura Shōten in Johansson World, printed as a rubber stamp.">
      </picture>
      <p class="hotel-intro">{count} {'hotel' if count == 1 else 'hotels'} checked · {codes}</p>
    </header>
    <section class="hotel-trip" aria-labelledby="hotel-trip-title" data-hotel-trip hidden>
      <h2 id="hotel-trip-title" class="hotel-sr">Plan a stop</h2>
      <form class="hotel-trip-form" data-hotel-trip-form>
        <div class="hotel-trip-field">{icon('start')}<label for="trip-from">From</label><input id="trip-from" name="from" list="hotel-places" placeholder="Örebro" autocomplete="off" enterkeyhint="next"><button type="button" class="hotel-icon-button" data-trip-locate aria-label="Start from my location">{icon('locate')}</button></div>
        <div class="hotel-trip-field">{icon('flag')}<label for="trip-to">To</label><input id="trip-to" name="to" list="hotel-places" placeholder="Malmö" autocomplete="off" enterkeyhint="go"></div>
        <div class="hotel-trip-buttons"><button type="submit" class="hotel-primary">{icon('route')}Find a hotel</button><button type="button" class="hotel-icon-button" data-trip-clear aria-label="Clear trip" hidden>{icon('close')}</button></div>
        <datalist id="hotel-places">{place_options}</datalist>
      </form>
      <div class="hotel-trip-result" data-trip-result role="status" aria-live="polite"></div>
      <p class="hotel-fine">Green (free) parking only. Drive times come from OpenStreetMap routing (OSRM); your places are sent there, never saved.</p>
    </section>
    <section class="hotel-feed" aria-labelledby="hotel-register-title">
      <h2 id="hotel-register-title" class="hotel-sr">Hotels</h2>
      <form class="hotel-filters" data-hotel-filters hidden role="search" aria-label="Filter hotels">
        <div class="hotel-toolbar">
          <div class="hotel-search">{icon('search')}<label for="hotel-search" class="hotel-sr">Search hotels</label><input id="hotel-search" type="search" name="search" placeholder="Search hotels" autocomplete="off"></div>
          <details class="hotel-more" data-hotel-more><summary>{icon('sliders')}Filters <span class="hotel-filter-count" data-hotel-filter-count hidden></span></summary>
            <div class="hotel-more-panel">
              <div class="hotel-field"><label for="hotel-country">Country</label><select id="hotel-country" name="country"><option value="">All countries</option>{country_options}</select></div>
              <div class="hotel-field"><label for="hotel-chain">Hotel chain</label><select id="hotel-chain" name="chain"><option value="">All chains</option>{chain_options}</select></div>
              <div class="hotel-field"><label for="hotel-receipt">Parking receipt</label><select id="hotel-receipt" name="receipt"><option value="">Any arrangement</option><option value="not-applicable">No parking charge</option><option value="true">On the hotel receipt</option><option value="false">Separate receipt</option><option value="unknown">Not confirmed</option></select></div>
              <button type="reset" class="hotel-reset">Reset filters</button>
            </div>
          </details>
        </div>
        {render_parking_choice(reviews)}
        <div class="hotel-country-row" role="group" aria-label="Country">{''.join(f'<button type="button" class="hotel-country-tag" data-hotel-country="{e(code)}" aria-pressed="false">{flag(code, name)}{e(name)} <span class="hotel-option-count" data-country-count="{e(code)}">{sum(r["countryCode"] == code for r in reviews)}</span></button>' for code, name in countries)}</div>
        <details class="hotel-legend"><summary>{icon('info')}What the colours mean</summary><ul><li><span class="hotel-avatar hotel-avatar-free" aria-hidden="true">P</span><strong>Free</strong> confirmed free guest parking</li><li><span class="hotel-avatar hotel-avatar-easy" aria-hidden="true">P</span><strong>Easy</strong> paid, but paid at the hotel and on the hotel receipt</li><li><span class="hotel-avatar hotel-avatar-avoid" aria-hidden="true">P</span><strong>Avoid</strong> paid parking not confirmed as easy, or difficult access</li></ul></details>
      </form>
      <div class="hotel-results-bar">
        <p class="hotel-count" data-hotel-count role="status" aria-live="polite">{count} {'hotel' if count == 1 else 'hotels'}</p>
        <div class="hotel-view-switch" role="group" aria-label="Show hotels as" data-hotel-view-switch hidden><button type="button" data-hotel-view="list" aria-pressed="true">{icon('list')}Feed</button><button type="button" data-hotel-view="map" aria-pressed="false">{icon('pin')}Map</button></div>
      </div>
      <div class="hotel-discovery" data-hotel-discovery>
      <section class="hotel-notes" data-hotel-notes aria-label="Hotel feed">
{notes}
      </section>
      <section class="hotel-map-section" aria-labelledby="hotel-map-title">
        <div class="hotel-map-head"><h3 id="hotel-map-title">{icon('pin')}Map</h3>
        <div class="hotel-map-controls" data-hotel-map-controls hidden>
          <button type="button" id="hotel-locate" class="hotel-icon-button" aria-label="Show my location">{icon('locate')}</button>
          <button type="button" id="hotel-fit-map" class="hotel-icon-button" aria-label="Fit the hotels shown">{icon('fit')}</button>
          <button type="button" id="hotel-clear-location" class="hotel-icon-button" aria-label="Clear my location" hidden>{icon('close')}</button>
        </div></div>
        <div id="hotel-map" class="hotel-map" role="region" tabindex="-1" aria-label="Map of the hotels shown" hidden></div>
        <p id="hotel-map-status" class="hotel-map-status" role="status" aria-live="polite">Enable JavaScript to use the map. {len(map_records)} of {count} hotels have verified locations.</p>
        <p class="hotel-fine">Your location is only used on this map and never saved. Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>.</p>
      </section>
      </div>
      <div class="hotel-empty" data-hotel-empty hidden><strong>No hotels match.</strong><p>Choose All, or reset the filters.</p></div>
      <details class="hotel-table-details"><summary>{icon('note')}Compare the full register</summary>
      <table class="hotel-table" data-hotel-table role="table">
        <caption>Room and stay totals cover the stated number of nights, not a nightly rate. Stay total = room + parking. Unknown prices remain unrecorded; these are not current advertised rates.</caption>
        <colgroup><col style="width:18%"><col style="width:8%"><col style="width:8%"><col style="width:8%"><col style="width:19%"><col style="width:23%"><col style="width:16%"></colgroup>
        <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Hotel</th><th scope="col" role="columnheader" class="hotel-money">Room total</th><th scope="col" role="columnheader" class="hotel-money">Parking</th><th scope="col" role="columnheader" class="hotel-money">Stay total</th><th scope="col" role="columnheader">Parking arrangement</th><th scope="col" role="columnheader">Parking receipt</th><th scope="col" role="columnheader">Short review</th></tr></thead>
        <tbody role="rowgroup">
{rows}
        </tbody>
      </table>
      <p class="hotel-price-note"><a class="hotel-download" href="/blog/hotels/hotel-reviews.csv" download>Download the spreadsheet (CSV)</a>. Free parking refers to the stated guest parking; charging or a paid garage can cost extra.</p>
      </details>
    </section>
    <details class="hotel-method">
      <summary><h2 id="hotel-method-title">How the register works</h2></summary>
      <p>Hotels join the free-parking list only after their own published information confirms free guest parking. Each parking entry links to its source and check date, with known registration requirements and paid alternatives explained. Coverage grows as hotels are verified. The Swedish Scandic audit covers 91 catalogue-linked properties; the other countries remain partial batches. <a href="/blog/hotels/SCANDIC-SWEDEN-AUDIT-2026-10-25.md">Swedish Scandic audit</a> · <a href="/blog/hotels/SCANDIC-PAID-AUDIT-2026-10-25.md">Other Nordic checks</a>.</p>
      <p>Green means confirmed free guest parking, the preferred option and default filter. Yellow means “Easy parking”: parking costs money, but both payment at the hotel and inclusion on the hotel receipt are confirmed. Red means Avoid: paid parking with external payment, separate receipts or either fact unconfirmed, or a documented difficult-access report even when parking is free. An unconfirmed route stays labelled unknown; it is not a claim that hotel payment is impossible. Avoid is a parking preference, not a judgement of hotel quality. Payment at the hotel and inclusion on the hotel receipt are recorded separately.</p>
      <p>The trip planner only suggests green hotels. It asks OpenStreetMap routing for driving times, suggests the closest green hotel to where you are going, and lists overnight stops only where they fall in the second half of the drive and add little time. Notes under each hotel are the register’s own records: owner reports, prices paid, notes and sources.</p>
      <p>Stay reports and official hotel information are identified in each note. Personal names, booking references, card details and exact stay dates are excluded. Prices and parking arrangements can change; the recorded date keeps each entry in context.</p>
    </details>
  </main>
  <footer id="site-footer" class="site-footer"></footer>
  <script src="/config.js?v=blog-1"></script>
  <script src="/shared.js?v=hotel-fixed-1"></script>
  <script id="hotel-map-data" type="application/json">{map_json}</script>
  <script id="hotel-places-data" type="application/json">{places_json}</script>
  <script src="/blog/hotels/hotels.js?v=7"></script>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script src="/blog/hotels/hotels-map.js?v=6"></script>
  <script src="/blog/hotels/hotels-trip.js?v=1"></script>
</body>
</html>
'''

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Check that the published page matches its records')
    args = parser.parse_args()
    records = json.loads(DATA.read_text(encoding='utf-8'))['reviews']
    validate(records)
    html = build(records)
    if args.check:
        assert OUTPUT.read_text(encoding='utf-8') == html, 'Run python3 tools/build-hotels.py to refresh the page'
        print(f'PASS: {len(records)} review(s); generated page is current')
    else:
        OUTPUT.write_text(html, encoding='utf-8')
        print(f'Built {OUTPUT.relative_to(ROOT)} from {len(records)} review(s)')
