#!/usr/bin/env python3
"""Acceptance checks for the confirmed-parking publication rule."""
import copy
import csv
import datetime as dt
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('hotel_builder', ROOT / 'tools/build-hotels.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class ParkingAdmissionTests(unittest.TestCase):
    def setUp(self):
        self.records = json.loads((ROOT / 'blog/hotels/hotels.json').read_text(encoding='utf-8'))['reviews']
        self.free = copy.deepcopy(next(row for row in self.records if row['freeParking'] is True))

    def test_published_register_has_dated_confirmation_and_correct_categories(self):
        builder.validate(self.records)
        for row in self.records:
            category = builder.parking_category(row)
            if row.get('parkingAccessWarning'):
                self.assertEqual(category, 'avoid')
            elif row['freeParking']:
                self.assertEqual(category, 'free')
            else:
                self.assertEqual(category, 'easy' if row['parkingPaymentAtHotel'] is True and row['parkingOnHotelReceipt'] is True else 'avoid')
            self.assertNotIn('easyParking', row)

    def test_easy_requires_hotel_payment_and_confirmed_hotel_receipt(self):
        row = copy.deepcopy(next(row for row in self.records if row['freeParking'] is False))
        row['name'] = 'Synthetic hotel-payment test fixture'
        row['parkingPaymentAtHotel'] = True
        row['parkingType'] = 'hotel-paid'
        row['parkingOnHotelReceipt'] = None
        row['parkingSummary'] = 'Paid parking can be settled at hotel reception.'
        builder.validate([row])
        self.assertEqual(builder.parking_category(row), 'avoid')
        self.assertIn('Hotel receipt unconfirmed', builder.render_review(row))
        row['parkingOnHotelReceipt'] = True
        self.assertEqual(builder.parking_category(row), 'easy')
        self.assertIn('hotel-parking-easy', builder.render_row(row))
        self.assertIn('Easy parking · One hotel receipt', builder.render_row(row))
        row['parkingPaymentAtHotel'] = False
        self.assertEqual(builder.parking_category(row), 'avoid')

    def test_unknown_paid_route_is_avoid_without_inventing_external_payment(self):
        row = copy.deepcopy(next(row for row in self.records if row['freeParking'] is False))
        row['parkingPaymentAtHotel'] = None
        row['parkingType'] = 'payment-unconfirmed'
        builder.validate([row])
        self.assertEqual(builder.parking_category(row), 'avoid')
        self.assertIn('Avoid · Payment route unconfirmed', builder.render_review(row))
        self.assertIn('data-parking-type="payment-unconfirmed"', builder.render_row(row))
        for value in ('true', 1):
            row['parkingPaymentAtHotel'] = value
            with self.assertRaises((ValueError, AssertionError)):
                builder.validate([row])

    def test_owner_access_warning_can_override_free_without_inventing_a_charge(self):
        row = next(r for r in self.records if r['hotelId'] == 'best-western-plus-hotel-odense')
        self.assertTrue(row['freeParking'])
        self.assertEqual(row['parkingPaid'], 0)
        self.assertIsNone(row['parkingPaymentAtHotel'])
        self.assertEqual(builder.parking_category(row), 'avoid')
        html = builder.render_review(row)
        self.assertIn('Avoid · Difficult access · Free parking', html)
        self.assertIn('owner', html.lower())
        invalid = copy.deepcopy(row)
        invalid['parkingAccessWarning']['reason'] = ''
        with self.assertRaises(AssertionError):
            builder.validate([invalid])

    def test_free_parking_has_no_payment_route(self):
        for value in (True, False):
            with self.subTest(paymentAtHotel=value):
                self.free['parkingPaymentAtHotel'] = value
                with self.assertRaises(ValueError):
                    builder.validate([self.free])

    def test_discovery_candidate_cannot_enter_register(self):
        for value in (None, 'true', 1):
            with self.subTest(freeParking=value):
                row = copy.deepcopy(self.free)
                row['freeParking'] = value
                with self.assertRaises(ValueError):
                    builder.validate([row])
        del self.free['parkingVerification']
        with self.assertRaises(ValueError):
            builder.validate([self.free])

    def test_unresolved_or_contradictory_parking_is_rejected(self):
        for status in ('candidate', 'needs_review', 'confirmed-paid'):
            with self.subTest(status=status):
                row = copy.deepcopy(self.free)
                row['parkingVerification']['status'] = status
                with self.assertRaises(ValueError):
                    builder.validate([row])
        self.free['parkingPaid'] = 100
        with self.assertRaises(ValueError):
            builder.validate([self.free])

    def test_confirmation_requires_a_real_check_date_and_reviewed_source(self):
        cases = [
            ('checkedOn', None),
            ('checkedOn', (dt.date.today() + dt.timedelta(days=1)).isoformat()),
            ('sourceUrl', None),
            ('sourceUrl', 'https://example.org/unreviewed-search-result'),
        ]
        for field, value in cases:
            with self.subTest(field=field, value=value):
                row = copy.deepcopy(self.free)
                row['parkingVerification'][field] = value
                with self.assertRaises(ValueError):
                    builder.validate([row])

    def test_reader_can_follow_the_parking_source_and_date(self):
        html = builder.render_row(self.free)
        verification = self.free['parkingVerification']
        self.assertIn('href="' + builder.e(verification['sourceUrl']) + '">Checked', html)
        self.assertIn('datetime="' + verification['checkedOn'] + '"', html)
        self.assertIn(builder.e(self.free['parkingSummary']), html)

    def test_verified_locations_match_official_marker_evidence_and_csv(self):
        evidence = json.loads((ROOT / 'blog/hotels/LOCATION-EVIDENCE-2026-10-25.json').read_text())['properties']
        self.assertEqual(len(evidence), 16)
        by_id = {row['hotelId']: row for row in self.records}
        for item in evidence:
            row = by_id[item['hotelId']]
            self.assertEqual(row['coordinates'], item['coordinates'])
            marker = json.loads('{' + item['markerEvidence'] + '}')
            self.assertEqual(marker['hotelName'], row['name'])
            self.assertEqual(marker['markerInfo']['hotelId'], item['officialPropertyId'])
            self.assertEqual(marker['coordinates']['lat'], row['coordinates']['latitude'])
            self.assertEqual(marker['coordinates']['lng'], row['coordinates']['longitude'])
        with (ROOT / 'blog/hotels/hotel-reviews.csv').open(encoding='utf-8-sig', newline='') as stream:
            exported = list(csv.DictReader(stream))
        self.assertEqual(len(exported), len(self.records))
        for item in exported:
            row = next(r for r in self.records if r['name'] == item['Hotel'])
            self.assertEqual(float(item['Latitude']), row['coordinates']['latitude'])
            self.assertEqual(float(item['Longitude']), row['coordinates']['longitude'])
            self.assertEqual(item['Coordinate source'], row['coordinates']['sourceUrl'])

    def test_new_scandic_evidence_preserves_payment_receipt_and_named_coordinates(self):
        evidence = json.loads((ROOT / 'blog/hotels/SCANDIC-PAID-EVIDENCE-2026-10-25.json').read_text())
        self.assertEqual(len(evidence['properties']), 25)
        for item in evidence['properties'] + [evidence['additionalFreeProperty']]:
            row = next(r for r in self.records if r['hotelId'] == item['hotelId'])
            marker = json.loads('{' + item['markerEvidence'] + '}')
            self.assertEqual(marker['hotelName'], row['name'])
            self.assertEqual(row['coordinates'], item['coordinates'])
            self.assertEqual(marker['coordinates'], {'lat': row['coordinates']['latitude'], 'lng': row['coordinates']['longitude']})
            self.assertEqual(builder.parking_category(row), item['parkingCategory'])
            if not row['freeParking']:
                self.assertEqual(row['parkingPaymentAtHotel'], item['paymentAtHotel'])
                self.assertIsNone(row['parkingOnHotelReceipt'])
                self.assertIsNone(row['parkingPaid'])
                self.assertIsNone(row['roomPaid'])

    def test_havanna_nearby_street_parking_is_free_without_claiming_hotel_ownership(self):
        row = next(r for r in self.records if r['hotelId'] == 'hotell-havanna')
        self.assertEqual(builder.parking_category(row), 'free')
        self.assertEqual(row['parkingPaid'], 0)
        self.assertIn('street', row['parkingSummary'])
        self.assertIsNone(row['parkingDetails']['registrationAtReception'])
        evidence = json.loads((ROOT / 'blog/hotels/HAVANNA-PARKING-EVIDENCE-2026-10-25.json').read_text())
        self.assertEqual(row['coordinates'], evidence['coordinates'])
        self.assertIn('Hotell Havanna, Krabbes väg 4', evidence['selectedPlaceEvidence'])

    def test_unmapped_hotel_keeps_card_and_address_without_a_marker(self):
        row = copy.deepcopy(self.free)
        row['coordinates'] = None
        html = builder.build([row])
        self.assertIn('Map location awaiting verification', html)
        self.assertIn(builder.e(row['address']), html)
        self.assertIn('id="hotel-map-data" type="application/json">[]', html)
        self.assertIn('0 of 1 hotels have verified locations', html)

    def test_feed_preserves_unknown_registration_and_paid_garage(self):
        row = next(r for r in self.records if r['hotelId'] == 'scandic-skelleftea')
        html = builder.render_review(row)
        self.assertIn('requirements may be unstated', html)
        self.assertIn(builder.e(row['parkingSummary']), html)
        self.assertIn('<details', html)
        row = next(r for r in self.records if r['hotelId'] == 'scandic-vasteras')
        self.assertIn('Register at reception', builder.render_review(row))

    def test_chain_filter_contains_only_groups_in_the_register(self):
        html = builder.build(self.records)
        self.assertIn('id="hotel-chain" name="chain"', html)
        self.assertEqual({builder.hotel_chain(r) for r in self.records}, {'Scandic', 'Thon Hotels', 'Best Western', 'Other hotels'})
        self.assertEqual(sum(builder.hotel_chain(r) == 'Scandic' for r in self.records), 53)
        for row in self.records:
            self.assertIn('data-chain="' + builder.hotel_chain(row) + '"', builder.render_row(row))
        self.assertIn('data-theme="clarity" data-theme-lock="clarity"', html)


if __name__ == '__main__':
    unittest.main()
