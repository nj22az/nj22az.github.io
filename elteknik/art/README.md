# Front cover

`cover.svg` is the editable source for the 7 × 10 inch front cover. It uses Swedish type and a simple three-phase contactor/motor illustration. The author, first-edition year and exercise/chapter counts follow the existing book page.

Run `node scripts/render-book-cover.cjs` with Playwright installed and the website served at `WORLD_PREVIEW` (default `http://127.0.0.1:5191`). It exports the existing `elteknik/files/omslag.jpg` path at 2100 × 3000 pixels. The website and book page use that cover. Encrypted PDF/EPUB contents and Shopify product files are separate artifacts and are not modified by this website cover update.
