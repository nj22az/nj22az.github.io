# Week 43 student journey audit — 16 October 2026

Week 43 runs 19–23 October. Navigation was checked against the supplied teacher instructions, including Friday's separate Part 3 and Part 4 sessions. The four-part assignment remains due Friday 23 October.

| Lesson | Online session | Student page | Exercises |
|---|---|---|---|
| 1. Komponenter och skydd | Monday 19 October, 09.00–11.00 | `vecka-43/aktuell/Del_1.html` | 1.1–1.10 |
| 2. Transformatorer och motorer | Tuesday 20 October, 15.00–17.00 | `vecka-43/aktuell/Del_2.html` | 2.1–2.10 |
| 3. Elscheman och dokumentation | Friday 23 October, 09.00–10.00 | `vecka-43/aktuell/Del_3.html` | 3.1–3.10 |
| 4. Systematisk felsökning | Friday 23 October, 10.00–11.00 | `vecka-43/aktuell/Del_4.html` | 1.1–1.10 **in Part 4** |

## Corrections

- Added a generated Week 43 Part 4 page. The original `vecka-45/aktuell/Del_1.html`, figures, PDFs and PowerPoints remain available. The heading explains the retained exercise numbering and presentation filenames.
- Added direct lesson links beside each presentation, including Friday's Part 3. Part 3's next-lesson link and Part 4's assignment links now follow the Week 43 route.
- Added `Ovningar.html` with all four lessons and all 40 exercises. The existing formula/exercise page and its 30 exercises remain intact, with links to the complete overview and Part 4.
- Presentation viewers identify Parts 1–4 and link to their respective lesson exercises.
- Kept Part 4's `v45_01-q1`–`q10` identifiers and its original progress storage key. Week 43's overview, homework indicators, curriculum counts, old route and new route share those records. Reading confirmation remains Week 43 / `del-4`.
- Clarified that the form does not upload to Classroom: students download the PDF, open the course's school-provided Classroom link, select Week 43 and complete the upload there. A course-specific Classroom URL could not be independently verified, so none was added. The page provides the existing teacher contact route for access problems.

## Validation

- 20 Python content/navigation tests passed; generated-file consistency passed for 436 records.
- 79 focused Node checks passed, covering assessment fields, keys, attempts, progress, lab behaviour and PDF creation. Two optional tests requiring private answer files were skipped locally.
- The full existing Sjöskolan CI suite passed.
- All 12 browser journeys passed: desktop Chromium, Pixel 7 Chromium and iPad Mini WebKit emulation. Each profile covered all four lessons, presentation images and PDF responses, exercise/hint links, persistent progress across both Part 4 routes, the 40-exercise count, lab entry and unknown-fault controls, PDF download, Friday's Stockholm-time schedule and reading confirmation.
- Screenshots were visually inspected for desktop, phone and tablet layouts. No horizontal overflow occurred in the tested routes. These are browser/device emulations, not physical-device tests.
- Local link inspection covered 459 resource/navigation references across ten student pages. The film catalogue's dynamically generated `#hallkretsen` target was verified in the live browser.
- Part 4's theory, worked examples and exercise content were compared with the original and are unchanged. All four decks' slide text is unchanged. No existing PDF, PPTX, encrypted teacher material, question record or assessment key was changed.

Validated source tree: `5882b6edb613e39bdb1a9eda22086b1a219a4141` (commit `c5f7a07695606dce6f33ccb7598c7f83474d0b6d`). This evidence directory adds documentation and screenshots only.

[Browser acceptance run](https://github.com/nj22az/nj22az.github.io/actions/runs/38953476047) · [Full course checks](https://github.com/nj22az/nj22az.github.io/actions/runs/38953476335) · [Pull request](https://github.com/nj22az/nj22az.github.io/pull/180)

## Screenshots

| Profile | Part 4 | All exercises |
|---|---|---|
| Desktop Chromium | [Screenshot](desktop-chromium-part4.png) | [Screenshot](desktop-chromium-all-exercises.png) |
| Phone Chromium | [Screenshot](phone-chromium-part4.png) | [Screenshot](phone-chromium-all-exercises.png) |
| Tablet WebKit | [Screenshot](tablet-webkit-part4.png) | [Screenshot](tablet-webkit-all-exercises.png) |
