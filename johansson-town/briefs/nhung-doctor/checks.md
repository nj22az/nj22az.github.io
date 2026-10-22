# Checks: Nhung becomes the island doctor

| Requirement | Verdict | Evidence | Correction |
|---|---|---|---|
| One doctor: nobody named Dr Kakazu/Dr Ken walks, works, sleeps or is listed live; the roster retires `dr-ken` into `nhung` | unresolved | `tests/roster.test.mjs`, `tests/cast.test.mjs` | |
| Nhung looks like the clinic doctor everywhere (cast recipe = the clinic room's avatar) | unresolved | `recipeFor('Nhung')` used by `buildClinic`; still of both | |
| Nhung's day: clinic weekdays 9–12, 14–17, Saturday 9–12; the paper at Front-Row in the evening; home at 3 Kitahama | unresolved | `residentPlan` probes in tests | |
| Sakura: Nhung on Sunday; Saturday opens after surgery; Thuan's weekend unchanged | unresolved | `tests/kitano-residents.test.mjs` | |
| Front-Row's books and stationery trade is Sakura's; nobody shops for books at Front-Row by day | unresolved | `tests/sakura-merchandising.test.mjs`, `tests/bookshop-customers.test.mjs` | |
| Saves: "Dr Kakazu"/"Dr Ken" resolve to the retired record; Nhung's saves unchanged | unresolved | `tests/cast-migration.test.mjs` | |
| Clinic texts and sign name Dr Nhung; pronouns hers | unresolved | grep, `town-hall` tests | |
| Guide and portraits show the new Nhung; Dr Kakazu's article is history | unresolved | `guide/residents.json`, portraits | |
| CI guard no worse than baseline; runtime rebuilt last | unresolved | `node tools/ci-guard.mjs` log | |
| Separate review of the diff | unresolved | reviewer's report | |
