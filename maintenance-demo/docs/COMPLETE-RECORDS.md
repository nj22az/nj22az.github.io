# Full equipment records and retained test results

Open an inventory item's **Full record**, or select its registered record from the Object library. The page combines the complete asset data with all available tests, documents, maintenance procedures/completions, risks, defects, classification inputs and decisions, pressure controls/evidence, operational journals, required equipment and preparation records. Historical and superseded entries stay visible. The final section and JSON export expose every included field without shortening observations or readings.

## Add results and further information

- **Add test result:** choose a test category, record the actual date, person, procedure/report reference, method, conditions, instruments/calibration references, conclusion and declared outcome. Add structured readings, units, limits, uncertainty and remarks as needed. Limits are entered by the assessor from the applicable procedure; the app does not prescribe a test pressure or acceptance criterion. Numeric comparisons are independent of the declared outcome. Out-of-limit readings and Fail/Conditional outcomes create a corrective-action entry; a later retest never automatically closes it.
- **Add correction / retest:** appends a linked result and preserves the earlier version and reason. The UI does not overwrite results. Records and reviewer names are browser-local user entries, not authenticated signatures.
- **Add document / file:** register manuals, drawings, original data files, certificates, photos and reports. Retain a file copy and/or an HTTPS controlled location, plus document number/revision, issuer, language, validity, custody and review notes. A Reviewed entry requires a named reviewer, date and notes on the identity/issuer/scope/language/validity checks. A retained copy can link an existing pressure-evidence reference for the same item. It does not authenticate the document or satisfy a pressure evidence requirement automatically.
- **Add specification / note:** retains additional component, material, spare, supplier, warranty, installation and other information, with a source, author and date. This accommodates information beyond the original standard asset fields.

General test records are separate from statutory inspection/control-body decisions. Use the **Pressure dossier** to register those decisions and their evidence. Test forms cannot clear statutory holds, change inspection windows or advance maintenance schedules. Missing results remain missing; no fictional results are seeded for real equipment.

## Files, backup and restoration

Files are stored in IndexedDB on this device, while workspace records stay under the original browser-local programme key. Files use SHA-256 content IDs. This detects a changed retained copy; it does not authenticate an original report. Keep your organisation's controlled originals.

The workspace allows **10 MB per retained file and 50 MB of retained files in total**. Larger records can be linked through a controlled HTTPS document location. Browser quotas may be lower; a failed file transaction does not commit its document metadata. A failed workspace save preserves the previous metadata, with at most an unused content-addressed blob left in the file vault.

**Export backup** creates a complete JSON programme archive including all referenced retained files. It stops with an error if a required file is missing or fails its digest check; it never silently produces a partial backup. **Export item with files** creates a full per-item review package including retained files. Item exports are for review, not whole-programme restoration.

Restore a complete programme archive under **Workspace & backup**. File size/encoding/digests and all metadata are validated first. Immutable file copies are added before workspace replacement; failed validation or file storage leaves the current workspace intact. The app reloads after restoration to clear cached form drafts. Earlier programme backups without the new extension remain supported. Browser data is not a server archive and is not shared automatically between devices or users. Export copies routinely and retain originals independently.

Complete programme archives use outer version 2 while the restored workspace keeps its original version-1 schema. Older app versions reject the new outer version, preventing them from silently accepting records without restoring the attachment vault. Earlier version-1 programme backups remain importable in the current app.
