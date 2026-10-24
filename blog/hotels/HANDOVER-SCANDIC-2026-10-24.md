# Swedish Scandic parking findings — 24 October 2026

## Owner decision
Publish the verified Swedish findings. Fee confirmation comes first: explicit free
weekday and weekend tariffs for the named outdoor guest-parking area. Registration
instructions and paid alternatives remain visible; do not invent no-registration,
guaranteed availability, free EV charging, or full-chain coverage. Detailed colour
refinement is deferred at the owner's request.

## Implemented
- Eighteen Swedish Scandic hotels reviewed individually against official property
  Amenities > Parking sections. 16 added; existing Swedish records refreshed.
- Register now has 32 hotels and 31 confirmed free options.
- Scandic Skellefteå: outdoor parking free on weekdays/weekends, with unknown
  outdoor capacity. Separate 40-space garage: SEK 100 day (08:30–16:30), SEK 220
  night (17:00–08:00), or SEK 270 per 24 hours, weekdays and weekends.
- Scandic Västerås: reception registration explicitly required. Unknown registration
  at other hotels is not asserted to be unnecessary and does not hide confirmed fees.
- JSON, generated table, notes, map popup summaries and 37-column CSV share the facts.
- Existing prices, reviews and map positions are preserved; no private uploads published.
- Source manifest: [reviewed findings](scandic-sweden-findings-2026-10-24.json).
- Checks: [publication data checks](SCANDIC-PUBLICATION-CHECKS-2026-10-24.json).

## Release state and verification
Prepared by `tools/apply-scandic-findings.py` on the current main checkout.
The publication job runs the existing admission tests, generated-page check,
JavaScript syntax checks and Blog feed test before committing derived files.
Confirm the job result and Pages deployment before calling this live.
Map points are accepted only from matching property structured data, with a source.
Missing verified coordinates remain null, not fabricated. 16 of
32 register hotels have verified map points; see the checks file for any omissions.
No physical-device, live GPS or Safari acceptance is claimed by this migration.
The separate ChatGPT Sites deployment is not modified by this GitHub Pages update.

## Next actions
Verify the publication commit and Pages result, then complete the release sign-off.
Any wider Nordic/other-chain research remains a separate audit; no bulk unverified
171-hotel list is imported. The existing earlier hotel handover remains historical.
