# Onsen Planner as a web app on the website: gap analysis (29 October 2026)

The owner asked: "Can Onsen planner be reworked to a web app on my website? Some parts are already there but are we
missing something?" This was research only. No code changed in either repository; nothing is planned, open or published
beyond this note.

Sources read: `nj22az/Onsen_Planner` at `1e8bd5b` (README, `DESIGN.md`, `docs/WIDGET_FIRST_V1.md`,
`Vecka/Core/ISOWeekCalendar.swift`, the models, `PlannerBackup.swift`), and this site at `77030b1` (`config.js`,
`assets/js/office-calendar.js`, `functions/`, the PWAs under `/camera/` and `/form-3d-studio/`).

## Already on the website

- The Office header calendar (`assets/js/office-calendar.js`): the ISO week number and date in the header, a month grid
  with a week-number column, today highlighted, previous/next month, Today, and public holidays per location from the
  Nager.Date API (online only, cached per country and year). It is an availability widget, not a planner.
- Patterns to reuse: installable offline PWAs (`/camera/`, `/form-3d-studio/`: manifest and service worker); browser-only
  data with backup export and restore (`/maintenance-demo/`); Cloudflare Functions for Stripe in `functions/` (run only on
  the Cloudflare Pages deployment, not on GitHub Pages).

## Missing

Week utility (the app's v1 core):
- A page of its own (none exists; Onsen Planner is not in `CONFIG.projects`): week hero with the explicit ISO week-year
  and the Monday–Sunday range, previous/next week, back to today, date → week lookup and week → dates, a month grid whose
  rows select a week, a year view with 52/53 weeks, rollover at local midnight.
- The header computes only the week number, not the week-year (29 December 2025 shows "Week 1", with no "2026").
  A shared ISO module should feed both the header and the app.
- Tests ported from `VeckaTests/ISOWeekCalendarTests.swift` (New Year boundaries, 400-year round trip, week 53, rejected
  invalid weeks, DST midnights).
- The presentations (Apple, Quiet, Clear, Neutral) with light and dark mode, if the web page is to look like the app.
- Manifest, icons and an offline service worker so it installs on the Home Screen.
- A stand-in for widgets. The web cannot make Home Screen or Lock Screen widgets, Siri Shortcuts or StoreKit purchases.
  Closest: a static week-number calendar (`.ics`) to subscribe to in Apple or Google Calendar, which then shows in their
  widgets; optionally the week number as the installed app's badge (iOS 16.4+, needs notification permission, updates
  only while the app runs).

Saved planner (the retained legacy part), only if wanted:
- Notes, trips, expenses, countdowns, contacts, world clocks, photos: IndexedDB, not `localStorage`.
- Holidays: the app computes 18 regions offline from rules (lunar ones via the Chinese calendar); the site uses an online
  API. Port the rules, or accept the API. Lunar dates work offline in browsers through `Intl` (`ca-chinese`).
- Import of the app's backup JSON: Swift's default `JSONEncoder` writes dates as seconds since 1 January 2001
  (add 978307200 for Unix time) and photos as base64.
- Storage safety: Safari can clear a website's data after seven days without a visit unless it is installed on the Home
  Screen; ask for persistent storage and keep export/restore prominent.
- Sync between devices: none without a backend. GitHub Pages is static; this is the main decision.
- Contacts: no system contact access in Safari; manual entry or vCard import.
- PDF/CSV export: print stylesheet and a CSV download.

## Decisions for the owner

1. Scope: the week utility only, or the saved planner as well.
2. Look: the site's Office style, or the app's own presentations (as Sjöskolan has its own design system).
3. Address: for example `/vecka/` or `/onsen-planner/`. The same page can serve as the App Store support page.
4. Planner data: this browser only (with backup), or synced (needs a backend and a new privacy review).

## Next concrete actions

Once the owner answers 1–3: build the week utility as a PWA on a branch, with the shared ISO module, the ported date
tests, the `.ics` subscription and a project card in `config.js`; browser checks at 1440, 390 and 320 px; then show the
owner before publishing. The planner follows only after decision 4.
