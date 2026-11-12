# Books in progress, and StepWise inside Maintenance Desk · 12 November 2026

The owner's decision for this change: neither book is finished, and StepWise is not its own project. It is a tool of the maintenance programme. The work is commit `f789566` on branch `cursor/books-wip-stepwise-0210`, opened as a pull request against `main`. It is not merged and was not pushed to `main`. Nothing under `ferry/` was changed.

## What changed

- **Elteknik och ellära** (`/elteknik/`, the homepage card, the harbour link, the noscript list, and the Swedish and English blog series that pointed at a purchase): the page is a book in progress. The buy button, the Shopify price, the first-edition line and the finished page count are gone. The free sample stays, as a preview. Schema.org Book data has no edition, no `datePublished` and no offer. The cover (`elteknik/art/cover.svg`, re-exported to `elteknik/files/omslag.jpg`) says the book is still being written.
- **The Front-Row Seat** (`/the-front-row-seat/`): the title, description, social tags, fallback text and the cover line say it is a novel in progress. Chapters stay free to read. Book rows say "words so far". Schema.org Book data is a draft, with no edition and no publication date. A chapter's own title is unchanged.
- **StepWise** is no longer a card in `CONFIG.projects` or `CONFIG.projectExplorer`, and it is not its own line in the homepage noscript list. Maintenance Desk names it and links to `/stepbuddy/` from the homepage card, the maintenance overview and the maintenance footer. The StepWise app itself is not in this repository, so its own page title was not changed.
- Homepage filter counts are written from `CONFIG.projectExplorer` when the page loads. With StepWise removed they are 6, Explore 2, Create 2, Learn 2. `tools/office-home/review.browser.mjs` expects those counts.

## Checks actually run

- `node --check` on `config.js`, `assets/js/project-explorer.js`, `the-front-row-seat/omnibus.js` and `elteknik/unlock.js`: passed.
- Pages served from this checkout with `python3 -m http.server` and opened in headless Chrome: homepage (1440 and 390), `/elteknik/`, `/the-front-row-seat/` (contents and one chapter) and `/maintenance-demo/`.
- Filter chips showed 6 / 2 / 2 / 2. Create showed Pocket Camera and Maintenance Desk only. Elteknik had no "Köp". Front-Row kicker read "A novel in progress". Maintenance overview and footer linked to `/stepbuddy/` (the link was trial-clicked, not followed off the site).
- Console: `/elteknik/` and `/the-front-row-seat/` raised none. The homepage 404 is `/johansson-town/assets/images/title/title-day-portrait.webp`, because the Town repository is not checked out here; it was already a 404 before this change. `/maintenance-demo/` 404 is `/favicon.ico`, also already there. No new page errors.
- The office-home Playwright review (`tools/office-home/review.browser.mjs`) was not run. It needs the Town checkout and a full Chromium install. Its expected counts were updated to match the six projects.

## Left for the owner

- The Shopify product for the textbook was not changed. If it is still published and for sale, that is outside this repository.
- `stepbuddy/` is not in this repository. Its own title still reads as a standalone app until that app is updated.
- The encrypted textbook files and the sample PDF were not rebuilt. The public pages no longer call them a finished edition. A rebuild of the manuscript is separate work.
- `tools/office-home/baseline-0f13c23b/` is the frozen homepage CI compares against. It still contains the old StepWise card and the old Shopify script tag. It was left as it was.
