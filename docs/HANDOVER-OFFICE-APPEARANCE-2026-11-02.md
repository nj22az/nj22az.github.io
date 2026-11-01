# Office light and dark appearance — 2 November 2026

The owner requested dark mode after the published homepage redesign. Scope is the Office homepage; project applications, course styling and the shared random-theme engine are unchanged. The shared script receives one guarded storage-migration read/write so a blocked preference store cannot prevent the homepage header from loading.

## Behaviour

- Visible 44 × 44 px sun/moon button in the homepage header, with keyboard activation, an accessible action label and pressed state.
- First visit follows the device light/dark preference, including changes while the page is open. An explicit choice persists in `nj-office-appearance` and overrides the device preference. Cross-tab changes synchronise. Storage failures still allow switching for the current visit.
- The appearance bootstrap runs in the head before styles render. The existing clarity identity remains locked; `nj-theme` preferences used elsewhere are preserved.
- Cream light palette retained; dark slate surfaces, pale text and teal links added throughout the hero, project cards, blog, About, locations, footer, menu and calendar. Product artwork retains its own colours. Calendar today stays yellow and prominent.
- No new frameworks or third-party runtime dependencies. Homepage CSS/script cache keys advanced.

## Verification and publication

Candidate on development: `0561f483d7e6eef47507362225c17ecb66198ff3`. Production promotion is selective, excluding unrelated World prototypes. Changed runtime files: `index.html`, `css/office-home.css`, `css/project-explorer.css`, `assets/js/office-appearance.js`, plus the guarded marker in `shared.js`. Dedicated review workflow and browser suite updated.

Local syntax checks pass. Local supported browser: both modes, saved dark choice after reload, project presentation and dark calendar inspected. The review corrected yellow-menu text and a caption in the product illustration. Initial hosted probes checked heading colours before the system appearance transition settled; the test now waits for the computed colours to settle. The hotel-theme fixture also passes: all 11 saved themes and empty storage, fixed hotel identity, homepage randomisation and other-page inheritance. The expanded browser suite exposed and verified the blocked-storage header dependency. Final hosted and publication results follow below.

Physical iPhone/iPad Safari remains unverified. The hosted suite uses Chromium with desktop/iPad-sized/phone/320 px/enlarged viewport geometry; this does not imply physical-device acceptance.

### Accepted candidate

[Office appearance review 41361025170](https://github.com/nj22az/nj22az.github.io/actions/runs/41361025170) passed all six profiles in both appearances, explicit persistence, device following and override, keyboard activation, core text contrast ≥4.5:1, header/control bounds, calendar/menu controls, all project actions, and blocked-storage switching. All 24 viewport screenshots were captured. [Harbour regression 41361025172](https://github.com/nj22az/nj22az.github.io/actions/runs/41361025172) passed. Publication checks will be recorded after deployment.
