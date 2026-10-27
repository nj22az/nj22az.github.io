# Nordic free-parking catalogue — 24 October 2026

## Scope and admission rule

The owner requested hotels with free parking in Sweden, Denmark, Norway and
Finland, and then clarified: **we must know whether parking is free before adding
a hotel.** Public entries therefore require current, property-specific
confirmation. Research leads with incomplete, conflicting or stale information
are excluded from the register, spreadsheet and map.

The current register contains 15 confirmed free guest-parking options: Denmark
6, Sweden 3, Norway 3 and Finland 3. The separate existing Scandic Elmia stay
retains its confirmed external paid-parking status. These are verified examples,
not an exhaustive national inventory. New researched entries have no invented
room prices, personal stay reviews or billing experience. The owner's corrected
categories are green for free parking, yellow for paid parking settled at the
hotel, and red/Avoid for paid parking settled separately. “Easy parking” means
the yellow payment arrangement; it is not a physical-ease assessment.

Confirmation is recorded in `parkingVerification` with a status, source URL and
check date. The static-page generator rejects unknown or inconsistent parking
status and missing confirmation. The generator validates the recorded evidence;
it cannot establish whether a source is true or still current. Review the hotel
information again when maintaining an entry, and remove uncertain free-parking
claims until they are resolved.

## What the supplied GitHub repositories provide

- [Expedia API topic](https://github.com/topics/expedia-api): code/project links,
  not an authorised country-wide hotel catalogue. The reviewed Omkar project
  documents a vendor service, principally flights; hotel scraping requires
  contacting the provider. The other Python example is a client for a hosted
  Apify actor requiring its own account/token. Destination search results cannot
  establish complete national coverage.
- [api-evangelist/expedia-group](https://github.com/api-evangelist/expedia-group):
  an independent catalogue of API descriptions. Its README states that it is not
  affiliated with or endorsed by Expedia. Its content and geography OpenAPI
  files describe endpoints and signed authentication; they contain neither live
  hotel records nor credentials. The content schema uses a test server. Verify
  implementation details against Expedia's current official specification.

The relevant official product is [Expedia Rapid Lodging Content](https://developers.expediagroup.com/rapid/lodging/content/about-content-api).
[Approved partnership and API credentials](https://developers.expediagroup.com/docs/products/rapid/setup/getting-started)
are required. No configured Rapid credentials or authorised content export was
available in this task. No authenticated request, paid scraping service or live
Expedia import was run.

Even a complete authorised export covers the properties available in that
catalogue; it does not prove that every physical hotel in the four countries has
been found. The partner agreement must permit the intended public display/export.

## Retrieval once authorised access is available

1. Obtain current `/v3/properties/content` records for `SE`, `DK`, `NO` and `FI`.
   This first import definition uses category `1` (Hotel). Other accommodation
   categories need a separate, explicit scope decision.
2. Resolve property amenities from the current English
   `/v3/references/amenities` response. Use the exact `Free self parking` label;
   do not guess an amenity ID. Room/rate-level packages and generic parking or
   EV charging do not establish free guest self-parking.
3. Follow every [next-page Link](https://developers.expediagroup.com/rapid/lodging/content/content-pagination).
   A bulk content file can also provide amenities; the smaller catalogue file
   lacks them. Preserve source IDs, retrieval dates, addresses and permitted
   coordinates.
4. Keep nearby free parking, valet-only parking, limited free hours, paid options
   and registration requirements distinct. Check current hotel information and
   resolve conflicts before promoting any property into the public register.
5. Honour required location/address obfuscation. Never substitute precise hotel
   coordinates when only an approximate point is permitted.
6. Maintain content in line with Expedia's [daily refresh guidance](https://developers.expediagroup.com/rapid/lodging).
   Updates must also handle inactive hotels and properties that lose free
   parking. Fetching only properties that still match a free-parking filter
   cannot remove stale matches by itself.

Official references:
[filters](https://developers.expediagroup.com/rapid/lodging/content/content-filtering),
[reference lists](https://developers.expediagroup.com/rapid/lodging/content/content-reference-lists),
[current OpenAPI schema](https://a.travel-assets.com/documentation-hubs/prod/rapid/latest/en-US/assets/rapid-3-specs.yaml).

## Offline importer

`tools/import-hotel-catalogue.py` is an offline audit tool using only Python's
standard library. It accepts authorised local content/reference exports; it
does not make network calls, handle credentials or publish hotel records.

```bash
python3 tools/import-hotel-catalogue.py \
  --content /path/to/rapid-content.jsonl.gz \
  --amenities /path/to/rapid-amenities-en-US.json \
  --source-date 2026-10-24 \
  --reference-date 2026-10-24 \
  --output /tmp/nordic-parking-audit.json

python3 tools/import-hotel-catalogue.test.py
```

Use actual export dates. Repeat `--content` for every non-overlapping downloaded
page/file. JSON maps, arrays, JSONL/NDJSON and gzip are supported. The output
must be a new file outside the website repository, in an existing directory.
The tool rejects existing outputs and duplicates, and never overwrites inputs.
It completes validation before making an output available, with atomic
no-overwrite creation.

All results are research candidates, items needing review or excluded records.
Every audit says `publicationReady: false`, `fullCountryCoverageVerified: false`
and `coverage: "input catalogue only"`. A matching amenity is a lead for
verification, never automatic publication approval. Fees, policies, check-in
text and parking-related descriptive/checkout text create review flags. Raw
descriptions and contact information are not copied into the audit. Unknown
prices and receipt/payment arrangements remain unknown. The audit does not
assign public green/yellow/red categories; these require the verified facts
described in the register README.

Ten focused offline tests cover reference resolution, false positives,
conditional/nearby/valet parking, qualifications, protected coordinates and
addresses, complete supplied-input traversal, malformed/duplicate inputs,
output isolation and concurrent output-file creation. These use synthetic
fixtures and are not evidence of live Expedia access or national completeness.

## Open-source discovery performed

Visit Sweden's [public tourism API](https://docs.visitsweden.com/en/api/) can
provide research leads without Expedia access. Its [reuse guidance](https://corporate.visitsweden.com/nationellt-api/)
supports public/private digital services. The retrieved accommodation feed
contained 4,368 records; 1,365 were explicitly typed Hotel/Hotell/Motel. Text
matching found 45 free-parking claims, including duplicates, room products,
time limits and nearby-only parking. **These 45 records were not published as
confirmed hotels.** Only three were admitted after checks against their own
hotel websites. No blanket CC licence or complete hotel census is claimed.

Current hotel-owned information also confirmed the three Norwegian and three
Finnish additions. Other chain-list and map candidates remain outside the public
register. In particular, ambiguous free/paid options and property pages that
redirect away from the named hotel were not admitted. Raw discovery records and
source-page caches were not committed to this public repository.

## Next concrete step for wider coverage

Supply approved Rapid access through the intended secure configuration, or an
authorised content export plus its current amenity references. Then run the
offline audit and verify candidates property by property under the admission
rule. Do not paste API secrets into the blog, public repository or spreadsheet.
