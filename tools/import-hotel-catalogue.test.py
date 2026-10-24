#!/usr/bin/env python3
"""Focused, entirely offline acceptance checks for the catalogue staging tool."""

import copy
from contextlib import redirect_stderr
import gzip
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch


SCRIPT = Path(__file__).with_name("import-hotel-catalogue.py")
SPEC = importlib.util.spec_from_file_location("hotel_catalogue", SCRIPT)
IMPORTER = importlib.util.module_from_spec(SPEC)
sys.dont_write_bytecode = True
SPEC.loader.exec_module(IMPORTER)
DATE = "2026-10-24"
# Synthetic IDs deliberately have no relationship to Expedia's live IDs.
LABELS = {
    "900001": "Free self parking",
    "900002": "Self parking (surcharge)",
    "900003": "Parking",
    "900004": "Electric car charging station",
    "900005": "Free valet parking",
    "900006": "Free parking nearby",
    "900007": "Free extended parking",
    "900008": "Parking (limited spaces)",
    "900009": "Free WiFi",
    "900010": "Free parking for selected packages",
}


def hotel(property_id, amenities=("900001",), country="SE", category="1"):
    return {
        "property_id": str(property_id), "name": f"Synthetic hotel {property_id}",
        "category": {"id": category, "name": "Hotel"},
        "address": {"line_1": "Example Street 1", "line_2": "Building A", "city": "Example city",
                    "postal_code": "12345", "country_code": country, "obfuscation_required": False},
        "location": {"coordinates": {"latitude": 57.1, "longitude": 12.2}, "obfuscation_required": False},
        "amenities": {key: {"id": key, "name": LABELS[key]} for key in amenities},
        "fees": {}, "policies": {}, "checkin": {},
        "dates": {"updated": "2026-10-23T08:00:00Z"},
    }


class CatalogueTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.references = self.directory / "amenities.json"
        self.write_json(self.references, {key: {"id": key, "name": name, "has_value": False} for key, name in LABELS.items()})

    def write_json(self, path, value):
        path.write_text(json.dumps(value), encoding="utf-8")

    def import_records(self, records):
        content = self.directory / "content.json"
        self.write_json(content, {entry["property_id"]: entry for entry in records})
        return IMPORTER.build_catalogue([content], self.references, DATE, DATE)

    def test_exact_reference_match_only_and_unknown_observations(self):
        records = [hotel(1), hotel(2, ("900002",)), hotel(3, ("900003",)), hotel(4, ("900004",))]
        room_only = hotel(5, ())
        room_only["rooms"] = {"1": {"amenities": {"900001": {"id": "900001", "name": "Free self parking"}}}}
        room_only["rates"] = copy.deepcopy(room_only["rooms"])
        records.append(room_only)
        records.append(hotel(6, ("900009",)))
        result = self.import_records(records)
        self.assertEqual([row["sourceId"] for row in result["records"] if row["parking"]["status"] == "candidate"], ["1"])
        for row in result["records"]:
            for field in ("roomPrice", "parkingPrice", "currency", "parkingEase", "parkingOnHotelReceipt"):
                self.assertIsNone(row[field])
            self.assertNotIn("review", row)
            self.assertNotIn("stayDate", row)
        self.assertEqual(result["coverage"], "input catalogue only")
        self.assertFalse(result["fullCountryCoverageVerified"])
        self.assertFalse(result["publicationReady"])

    def test_reference_ids_are_resolved_not_hardcoded_or_inferred_from_content(self):
        references = {"445566": {"id": 445566, "name": "Free self parking", "has_value": False},
                      "778899": {"id": "778899", "name": "Parking", "has_value": False}}
        self.write_json(self.references, references)
        genuine = hotel(1, ())
        genuine["amenities"] = {"445566": {"id": "445566", "name": "Free self parking"}}
        incorrect_label = hotel(2, ())
        incorrect_label["amenities"] = {"778899": {"id": "778899", "name": "Free self parking"}}
        missing_reference = hotel(3, ())
        missing_reference["amenities"] = {"123456": {"id": "123456", "name": "Free self parking"}}
        result = self.import_records([genuine, incorrect_label, missing_reference])
        self.assertEqual(result["freeSelfParkingReferenceIds"], ["445566"])
        self.assertEqual(result["counts"]["candidate"], 1)
        self.assertNotEqual(result["records"][1]["parking"]["classification"], "free_self_parking_candidate")
        self.assertEqual(result["records"][2]["parking"]["status"], "needs_review")
        self.write_json(self.references, {"1": {"id": "1", "name": "Gratis parkering"}})
        with self.assertRaisesRegex(IMPORTER.InputError, "current en-US"):
            self.import_records([genuine])

    def test_nearby_valet_and_conditional_remain_distinct(self):
        result = self.import_records([hotel(1, ("900005",)), hotel(2, ("900006",)),
                                      hotel(3, ("900007",)), hotel(4, ("900010",))])
        parking = [row["parking"] for row in result["records"]]
        self.assertEqual([(row["classification"], row["status"]) for row in parking], [
            ("free_valet_only", "excluded"), ("free_nearby_only", "needs_review"),
            ("conditional_free_parking", "needs_review"), ("unresolved_parking", "needs_review"),
        ])
        self.assertEqual(result["counts"]["candidate"], 0)

    def test_fees_policies_and_restrictions_require_review_without_inventing_a_fee(self):
        with_fee = hotel(1)
        with_fee["fees"] = {"optional": "<p>Covered parking costs SEK 100.</p>"}
        with_policy = hotel(2)
        with_policy["policies"] = {"know_before_you_go": "Guests must register a vehicle."}
        with_checkin = hotel(3)
        with_checkin["checkin"] = {"special_instructions": "Use the reception tablet."}
        result = self.import_records([with_fee, with_policy, with_checkin, hotel(4, ("900001", "900002")),
                                      hotel(5, ("900001", "900008"))])
        for row in result["records"]:
            self.assertEqual(row["parking"]["classification"], "free_self_parking_candidate")
            self.assertEqual(row["parking"]["status"], "needs_review")
            self.assertIsNone(row["parkingPrice"])
        flags = [row["parking"]["qualificationFlags"] for row in result["records"]]
        self.assertIn("review_fees.optional", flags[0])
        self.assertIn("review_policies.know_before_you_go", flags[1])
        self.assertIn("review_checkin.special_instructions", flags[2])
        self.assertIn("paid_parking_alternative_or_conflict", flags[3])
        self.assertIn("review_amenity:900008", flags[4])

    def test_obfuscation_never_falls_back_to_precise_location_or_street(self):
        protected = hotel(1)
        protected["address"]["obfuscation_required"] = True
        protected["location"].update({"obfuscation_required": True,
                                      "obfuscated_coordinates": {"latitude": 57.0, "longitude": 12.0}})
        missing_approximate = copy.deepcopy(protected)
        missing_approximate["property_id"] = "2"
        del missing_approximate["location"]["obfuscated_coordinates"]
        zero = hotel(3)
        zero["location"]["coordinates"] = {"latitude": 0, "longitude": 0}
        result = self.import_records([protected, missing_approximate, zero])
        self.assertEqual(result["records"][0]["coordinates"], {"latitude": 57.0, "longitude": 12.0, "approximate": True})
        self.assertIsNone(result["records"][1]["coordinates"])
        self.assertEqual(result["records"][2]["coordinates"]["latitude"], 0)
        for row in result["records"][:2]:
            for field in ("line1", "line2", "postalCode"):
                self.assertNotIn(field, row["address"])
            encoded = json.dumps(row)
            self.assertNotIn("57.1", encoded)
            self.assertNotIn("Example Street", encoded)

    def test_parking_conditions_in_description_and_checkout_require_review(self):
        package_only = hotel(1)
        package_only["descriptions"] = {"business_amenities": "Free parking is available only with a meeting package."}
        closure = hotel(2)
        closure["descriptions"] = {"renovations": "<p>The car park is closed until next spring.</p>"}
        limited = hotel(3)
        limited["checkout"] = {"instructions": "Vehicles in the garage must leave by noon or pay a fee."}
        unrelated = hotel(4)
        unrelated["descriptions"] = {"amenities": "A swimming pool and a gym are available."}
        result = self.import_records([package_only, closure, limited, unrelated])
        for row in result["records"][:3]:
            self.assertEqual(row["parking"]["status"], "needs_review")
            self.assertIsNone(row["parkingPrice"])
            self.assertNotIn("descriptions", row)
            self.assertNotIn("checkout", row)
        flags = [row["parking"]["qualificationFlags"] for row in result["records"]]
        self.assertIn("review_descriptions.business_amenities", flags[0])
        self.assertIn("review_descriptions.renovations", flags[1])
        self.assertIn("review_checkout.instructions", flags[2])
        self.assertEqual(result["records"][3]["parking"]["status"], "candidate")
        self.assertNotIn("meeting package", json.dumps(result))

    def test_every_jsonl_gzip_record_and_page_is_traversed_with_country_and_hotel_filters(self):
        first = self.directory / "page1.json"
        self.write_json(first, {"1": hotel(1, country="SE"), "2": hotel(2, country="DK")})
        second = self.directory / "content.jsonl.gz"
        rest = [hotel(3, country="NO"), hotel(4, country="FI"), hotel(5, country="DE"),
                hotel(6, country="FI", category="22"), hotel(7, country="SE", category="2")]
        with gzip.open(second, "wt", encoding="utf-8") as stream:
            stream.write("\n")
            for record in rest:
                stream.write(json.dumps(record) + "\n")
        zipped_references = self.directory / "amenities.json.gz"
        with gzip.open(zipped_references, "wt", encoding="utf-8") as stream:
            stream.write(self.references.read_text())
        result = IMPORTER.build_catalogue([first, second], zipped_references, DATE, DATE)
        self.assertEqual(result["counts"], {"inputRecords": 7, "outOfScope": 3, "inScopeHotels": 4,
                                          "candidate": 4, "needs_review": 0, "excluded": 0})
        self.assertEqual({row["countryCode"] for row in result["records"]}, {"SE", "DK", "NO", "FI"})
        self.assertTrue(all(count["hotels"] == 1 for count in result["countsByCountry"].values()))

    def test_basic_catalogue_and_duplicate_records_cannot_look_complete(self):
        basic = hotel(1)
        del basic["amenities"]
        with self.assertRaisesRegex(IMPORTER.InputError, "supply full property content"):
            self.import_records([basic])
        first = self.directory / "first.jsonl"
        first.write_text(json.dumps(hotel(1)) + "\n" + json.dumps(hotel(1)) + "\n")
        with self.assertRaisesRegex(IMPORTER.InputError, "Duplicate property ID"):
            IMPORTER.build_catalogue([first], self.references, DATE, DATE)
        first.write_text('{"property_id":"1","property_id":"2"}\n')
        with self.assertRaisesRegex(IMPORTER.InputError, "Duplicate JSON key"):
            IMPORTER.build_catalogue([first], self.references, DATE, DATE)

    def test_cli_writes_only_an_explicit_new_staging_file_and_failure_is_atomic(self):
        content = self.directory / "content.jsonl"
        content.write_text(json.dumps(hotel(1)) + "\n")
        output = self.directory / "review.json"
        args = [sys.executable, str(SCRIPT), "--content", str(content), "--amenities", str(self.references),
                "--source-date", DATE, "--reference-date", DATE, "--output", str(output)]
        success = subprocess.run(args, capture_output=True, text=True)
        self.assertEqual(success.returncode, 0, success.stderr)
        self.assertEqual(json.loads(output.read_text())["counts"]["candidate"], 1)
        original = output.read_bytes()
        repeated = subprocess.run(args, capture_output=True, text=True)
        self.assertNotEqual(repeated.returncode, 0)
        self.assertEqual(output.read_bytes(), original)
        public_path = SCRIPT.parent.parent / "blog" / "hotels" / "hotels.json"
        blocked = subprocess.run(args[:-1] + [str(public_path)], capture_output=True, text=True)
        self.assertNotEqual(blocked.returncode, 0)
        self.assertIn("outside the public website repository", blocked.stderr)
        output.unlink()
        content.write_text(json.dumps(hotel(1)) + '\n{"invalid":\n')
        malformed = subprocess.run(args, capture_output=True, text=True)
        self.assertNotEqual(malformed.returncode, 0)
        self.assertFalse(output.exists())

    def test_concurrent_output_creation_is_not_overwritten(self):
        content = self.directory / "content.json"
        self.write_json(content, {"1": hotel(1)})
        output = self.directory / "review.json"
        original_builder = IMPORTER.build_catalogue

        def concurrent_writer(*args):
            result = original_builder(*args)
            output.write_text("Existing concurrent result", encoding="utf-8")
            return result

        args = ["--content", str(content), "--amenities", str(self.references),
                "--source-date", DATE, "--reference-date", DATE, "--output", str(output)]
        errors = io.StringIO()
        with patch.object(IMPORTER, "build_catalogue", side_effect=concurrent_writer), redirect_stderr(errors):
            self.assertEqual(IMPORTER.main(args), 1)
        self.assertEqual(output.read_text(), "Existing concurrent result")
        self.assertIn("Import failed", errors.getvalue())
        self.assertEqual({path.name for path in self.directory.iterdir()},
                         {"amenities.json", "content.json", "review.json"})


if __name__ == "__main__":
    unittest.main(verbosity=2)
