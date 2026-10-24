#!/usr/bin/env python3
"""Acceptance checks for the confirmed-parking publication rule."""
import copy
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

    def test_published_register_has_dated_confirmation_without_inventing_ease(self):
        builder.validate(self.records)
        self.assertTrue(any(row['freeParking'] is False for row in self.records))
        self.assertTrue(any(row['freeParking'] is True and row['easyParking'] is None for row in self.records))

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


if __name__ == '__main__':
    unittest.main()
