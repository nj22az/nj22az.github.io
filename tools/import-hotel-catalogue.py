#!/usr/bin/env python3
"""Stage an offline review of authorised Expedia Rapid content; never publish it.

Accept /properties/content JSON maps or /files/properties/content JSONL, with
optional gzip compression, plus the current en-US /references/amenities export.
This is a discovery audit of the supplied files, not a complete hotel census.
See hotels/README.md for the separate, manually maintained stay register.
"""

import argparse
import datetime as dt
import gzip
import html
import json
import math
from pathlib import Path
import re
import sys
import tempfile


COUNTRIES = {"SE": "Sweden", "DK": "Denmark", "NO": "Norway", "FI": "Finland"}
FREE_SELF_LABEL = "free self parking"
# These are exact English labels, not amenity IDs or substring classifiers.
# Unrecognised parking labels stay in the review queue; only FREE_SELF_LABEL
# can establish a free-self-parking candidate.
OTHER_LABELS = {
    "free valet parking": "free_valet",
    "free parking nearby": "free_nearby",
    "free offsite parking": "free_nearby",
    "free extended parking": "conditional_free_parking",
    "free long-term parking": "conditional_free_parking",
    "free rv, bus, truck parking": "other_vehicle_free_parking",
    "free parking": "unspecified_free_parking",
    "self parking (surcharge)": "paid_self",
    "valet parking (surcharge)": "paid_valet",
    "extended parking (surcharge)": "paid_extended",
    "parking (limited spaces)": "parking_restriction",
    "parking height restrictions apply": "parking_restriction",
    "offsite parking reservations required": "parking_restriction",
    "offsite parking discounted rates available": "discounted_parking",
    "electric car charging station": "ev_charging",
    "parking": "unspecified_parking",
    "self parking": "unspecified_parking",
    "garage": "parking_detail",
    "covered parking": "parking_detail",
    "uncovered parking": "parking_detail",
    "secured parking": "parking_detail",
    "wheelchair accessible parking": "parking_detail",
}
REVIEW_KINDS = {
    "conditional_free_parking", "other_vehicle_free_parking",
    "unspecified_free_parking", "parking_restriction", "unmapped_parking",
    "unknown_reference",
}


class InputError(ValueError):
    """An incomplete or inconsistent export must not look like a clean result."""


def normalise(value):
    return " ".join(value.split()).casefold()


def identifier(value, context):
    if isinstance(value, bool) or not isinstance(value, (str, int)) or not str(value).strip():
        raise InputError(f"{context}: expected a nonempty ID")
    return str(value)


def unique_keys(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise InputError(f"Duplicate JSON key {key!r}; export cannot be audited safely")
        result[key] = value
    return result


def objects(document, id_field, context):
    """Flatten the documented object map, a single JSONL record, or an array."""
    if isinstance(document, list):
        for entry in document:
            yield from objects(entry, id_field, context)
    elif isinstance(document, dict) and id_field in document:
        yield document
    elif isinstance(document, dict):
        for key, entry in document.items():
            if not isinstance(entry, dict) or identifier(entry.get(id_field), context) != key:
                raise InputError(f"{context}: map key must match each record's {id_field}")
            yield entry
    else:
        raise InputError(f"{context}: expected an object map, record, or array")


def read_records(path, id_field):
    path = Path(path)
    suffixes = path.suffixes
    compressed = bool(suffixes and suffixes[-1] == ".gz")
    format_suffix = suffixes[-2] if compressed and len(suffixes) > 1 else path.suffix
    if format_suffix not in {".json", ".jsonl", ".ndjson"}:
        raise InputError(f"{path}: use .json, .jsonl or .ndjson, optionally followed by .gz")
    opener = gzip.open if compressed else open
    with opener(path, "rt", encoding="utf-8-sig") as stream:
        if format_suffix == ".json":
            yield from objects(json.load(stream, object_pairs_hook=unique_keys), id_field, str(path))
        else:
            for line_number, line in enumerate(stream, 1):
                if line.strip():
                    document = json.loads(line, object_pairs_hook=unique_keys)
                    yield from objects(document, id_field, f"{path}:{line_number}")


def load_references(path):
    references = {}
    for entry in read_records(path, "id"):
        amenity_id = identifier(entry.get("id"), "Amenity reference")
        if amenity_id in references:
            raise InputError(f"Duplicate reference ID {amenity_id}")
        if not isinstance(entry.get("name"), str) or not entry["name"].strip():
            raise InputError(f"Reference {amenity_id}: missing name")
        if "has_value" in entry and not isinstance(entry["has_value"], bool):
            raise InputError(f"Reference {amenity_id}: has_value must be boolean")
        references[amenity_id] = entry
    if not any(normalise(entry["name"]) == FREE_SELF_LABEL for entry in references.values()):
        raise InputError("The reference export must be current en-US property amenities and contain 'Free self parking'; no ID is guessed")
    return references


def mapping(value, context):
    if not isinstance(value, dict):
        raise InputError(f"{context}: expected an object")
    return value


def boolean_flag(value, context):
    if not isinstance(value, bool):
        raise InputError(f"{context}: expected a boolean")
    return value


def public_location(record, flags):
    address = record["address"]
    protected = boolean_flag(address.get("obfuscation_required", False), "address.obfuscation_required")
    public_address = {
        "city": address.get("city"),
        "province": address.get("state_province_name"),
        "countryCode": address["country_code"].upper(),
        "obfuscated": protected,
    }
    if protected:
        flags.append("address_obfuscated")
    else:
        public_address.update({
            "line1": address.get("line_1"), "line2": address.get("line_2"),
            "postalCode": address.get("postal_code"),
        })
    location = mapping(record.get("location", {}), "location")
    approximate = boolean_flag(location.get("obfuscation_required", False), "location.obfuscation_required")
    chosen = location.get("obfuscated_coordinates" if approximate else "coordinates")
    if approximate:
        flags.append("location_obfuscated")
    valid = isinstance(chosen, dict)
    for field, limit in (("latitude", 90), ("longitude", 180)):
        value = chosen.get(field) if valid else None
        valid = valid and type(value) in (int, float) and math.isfinite(value) and -limit <= value <= limit
    if not valid:
        flags.append("obfuscated_coordinates_missing_or_invalid" if approximate else "coordinates_missing_or_invalid")
        return public_address, None
    return public_address, {"latitude": chosen["latitude"], "longitude": chosen["longitude"], "approximate": approximate}


def qualification_flags(record):
    flags = []
    # Presence of meaningful prose prompts review of the original export. It
    # never establishes free parking or treats unrelated charges as parking fees.
    for group, fields in {
        "fees": ("mandatory", "optional"),
        "policies": ("know_before_you_go",),
        "checkin": ("instructions", "special_instructions"),
    }.items():
        if group not in record:
            flags.append(f"{group}_not_supplied")
        section = mapping(record.get(group, {}), group)
        for field in fields:
            value = section.get(field, "")
            if not isinstance(value, str):
                raise InputError(f"{group}.{field}: expected text")
            text = normalise(html.unescape(re.sub(r"<[^>]*>", " ", value))).strip(" .")
            if text not in {"", "none", "n/a", "not applicable"} and any(c.isalnum() for c in text):
                flags.append(f"review_{group}.{field}")
    # Parking conditions also occur outside the dedicated policy sections, such
    # as a closure in renovations or a checkout-time parking limit. Retain the
    # source field for review without copying prose or interpreting it as proof
    # of free parking. These optional sections need not exist in every export.
    for group, fields in {
        "checkout": ("instructions",),
        "descriptions": ("amenities", "business_amenities", "renovations", "location", "general"),
    }.items():
        if group not in record:
            continue
        section = mapping(record[group], group)
        for field in fields:
            value = section.get(field, "")
            if not isinstance(value, str):
                raise InputError(f"{group}.{field}: expected text")
            text = normalise(html.unescape(re.sub(r"<[^>]*>", " ", value)))
            if re.search(r"\b(?:parking|car[\s-]*park|garage)\b", text):
                flags.append(f"review_{group}.{field}")
    return flags


def parking_evidence(record, references, flags):
    if "amenities" not in record:
        flags.append("property_amenities_not_supplied")
    amenities = mapping(record.get("amenities", {}), "amenities")
    evidence = []
    for key, amenity in amenities.items():
        mapping(amenity, f"amenities.{key}")
        amenity_id = identifier(amenity.get("id"), f"amenities.{key}")
        if amenity_id != key:
            raise InputError(f"Amenity map key {key} differs from its ID {amenity_id}")
        content_name = amenity.get("name", "")
        if not isinstance(content_name, str):
            raise InputError(f"Amenity {key}: expected a text name")
        reference = references.get(amenity_id)
        label = normalise(reference["name"]) if reference else ""
        kind = "free_self_parking" if label == FREE_SELF_LABEL else OTHER_LABELS.get(label)
        categories = amenity.get("categories", [])
        if not isinstance(categories, list) or any(not isinstance(item, str) for item in categories):
            raise InputError(f"Amenity {key}: categories must be an array of strings")
        if reference is None:
            kind = "unknown_reference"
            flags.append(f"unknown_reference_amenity:{amenity_id}")
        elif kind is None and ("parking" in label or "parking" in categories or "electric_charging_station" in categories):
            kind = "unmapped_parking"
        if kind is None:
            continue
        value = amenity.get("value")
        if value is not None and not isinstance(value, str):
            raise InputError(f"Amenity {key}: value must be text")
        if reference and normalise(content_name) != label:
            flags.append(f"amenity_label_mismatch:{amenity_id}")
        if kind in REVIEW_KINDS:
            flags.append(f"review_amenity:{amenity_id}")
        if kind == "free_self_parking" and (value not in (None, "") or reference.get("has_value")):
            flags.append(f"valued_free_self_amenity:{amenity_id}")
        evidence.append({
            "id": amenity_id, "referenceName": reference["name"] if reference else None,
            "contentName": content_name, "value": value, "kind": kind,
        })
    return sorted(evidence, key=lambda entry: entry["id"])


def classify(evidence, flags):
    kinds = {entry["kind"] for entry in evidence}
    if "free_self_parking" in kinds:
        if any(kind.startswith("paid_") or kind == "discounted_parking" for kind in kinds):
            flags.append("paid_parking_alternative_or_conflict")
        return "free_self_parking_candidate", "needs_review" if flags else "candidate"
    if "conditional_free_parking" in kinds:
        return "conditional_free_parking", "needs_review"
    if "free_nearby" in kinds:
        return "free_nearby_only", "needs_review"
    if "free_valet" in kinds:
        return "free_valet_only", "excluded"
    if kinds & REVIEW_KINDS or "property_amenities_not_supplied" in flags:
        return "unresolved_parking", "needs_review"
    return "free_self_parking_not_established", "excluded"


def build_catalogue(content_paths, reference_path, source_date, reference_date):
    references = load_references(reference_path)
    counts = {"inputRecords": 0, "outOfScope": 0, "inScopeHotels": 0, "candidate": 0, "needs_review": 0, "excluded": 0}
    by_country = {code: {"hotels": 0, "candidate": 0, "needs_review": 0, "excluded": 0} for code in COUNTRIES}
    records, seen = [], set()
    with_amenities = 0
    for path in content_paths:
        for record in read_records(path, "property_id"):
            counts["inputRecords"] += 1
            property_id = identifier(record.get("property_id"), "Property")
            if property_id in seen:
                raise InputError(f"Duplicate property ID {property_id}; supply non-overlapping pages/files")
            seen.add(property_id)
            address = mapping(record.get("address"), f"Property {property_id} address")
            country = address.get("country_code")
            if not isinstance(country, str) or len(country) != 2:
                raise InputError(f"Property {property_id}: missing two-letter country code")
            country = country.upper()
            category = mapping(record.get("category"), f"Property {property_id} category")
            category_id = identifier(category.get("id"), f"Property {property_id} category")
            if country not in COUNTRIES or category_id != "1":
                counts["outOfScope"] += 1
                continue
            if not isinstance(record.get("name"), str) or not record["name"].strip():
                raise InputError(f"Property {property_id}: missing name")
            counts["inScopeHotels"] += 1
            with_amenities += "amenities" in record
            flags = qualification_flags(record)
            evidence = parking_evidence(record, references, flags)
            public_address, coordinates = public_location(record, flags)
            classification, status = classify(evidence, flags)
            counts[status] += 1
            by_country[country]["hotels"] += 1
            by_country[country][status] += 1
            dates = mapping(record.get("dates", {}), "dates")
            records.append({
                "source": "Expedia Rapid", "sourceId": property_id,
                "sourceDate": source_date, "referenceDate": reference_date,
                "providerUpdatedAt": dates.get("updated"),
                "name": record["name"], "countryCode": country, "country": COUNTRIES[country],
                "categoryId": "1", "address": public_address, "coordinates": coordinates,
                "parking": {"classification": classification, "status": status,
                            "amenityEvidence": evidence, "qualificationFlags": sorted(set(flags))},
                "roomPrice": None, "parkingPrice": None, "currency": None,
                "parkingPaymentAtHotel": None, "parkingOnHotelReceipt": None,
            })
    if not counts["inputRecords"]:
        raise InputError("No property records were supplied")
    if counts["inScopeHotels"] and not with_amenities:
        raise InputError("No in-scope property has an amenities map; supply full property content, not the basic /files/properties/catalog export")
    return {
        "schemaVersion": 1, "source": "Expedia Rapid", "sourceDate": source_date,
        "referenceDate": reference_date, "coverage": "input catalogue only",
        "fullCountryCoverageVerified": False, "publicationReady": False,
        "filters": {"countryCodes": list(COUNTRIES), "categoryId": "1"},
        "freeSelfParkingReferenceIds": sorted(key for key, value in references.items() if normalise(value["name"]) == FREE_SELF_LABEL),
        "counts": counts, "countsByCountry": by_country,
        "records": sorted(records, key=lambda record: (record["countryCode"], record["sourceId"])),
    }


def iso_date(value):
    try:
        if dt.date.fromisoformat(value).isoformat() == value:
            return value
    except ValueError:
        pass
    raise argparse.ArgumentTypeError("Use an explicit YYYY-MM-DD export date")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--content", type=Path, action="append", required=True, help="Authorised content file; repeat for every non-overlapping page/file")
    parser.add_argument("--amenities", type=Path, required=True, help="Current en-US property amenity reference export")
    parser.add_argument("--source-date", type=iso_date, required=True)
    parser.add_argument("--reference-date", type=iso_date, required=True)
    parser.add_argument("--output", type=Path, required=True, help="New review JSON path outside the website repository")
    args = parser.parse_args(argv)
    output = args.output.resolve()
    repo = Path(__file__).resolve().parent.parent
    try:
        if output.is_relative_to(repo):
            raise InputError("Review output must be outside the public website repository")
        if output in {path.resolve() for path in [*args.content, args.amenities]}:
            raise InputError("Output must not overwrite an input file")
        if output.exists():
            raise InputError("Output already exists; choose a new review filename")
        result = build_catalogue(args.content, args.amenities, args.source_date, args.reference_date)
        # Validate everything before creating an output. No input paths, raw
        # policies, precise protected coordinates, contacts or stay details leak.
        payload = json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=output.parent, delete=False) as stream:
                temporary = Path(stream.name)
                stream.write(payload)
            # A hard link publishes the complete temporary file atomically and
            # fails if another process created the destination in the meantime.
            # replace()/rename() would overwrite that new file after our check.
            output.hardlink_to(temporary)
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)
    except (InputError, OSError, UnicodeError, json.JSONDecodeError, ValueError) as error:
        print(f"Import failed: {error}", file=sys.stderr)
        return 1
    print(json.dumps({"output": str(output), "coverage": result["coverage"], "counts": result["counts"]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
