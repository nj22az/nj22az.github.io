# The Office of Nils Johansson

My personal website, where I share about my life.

**Live:** [nj22az.github.io](https://nj22az.github.io)

## Ownership and reuse

**My original work is not generally open source. Copyright © Nils Johansson.
All rights reserved, except for explicitly separately licensed material.**

Commercial sale and licensing of my original teaching materials, writing,
applications and media are reserved to me. No one else may sell, repackage,
republish or use that material in paid products or courses without my prior
written permission. Giving credit alone does not grant permission.

This is a public portfolio repository. Visitors may use the published site as
provided, and students may use supplied course materials for their own study.
GitHub's public-repository viewing and forking rights remain unaffected.

Third-party components and previously licensed material retain their own terms,
including the existing MIT open-model recipes, CC0 audio and GPL-covered
vectorizer code. I do not claim exclusive rights over those components.

Read the [copyright and permissions notice](LICENSE.md) and
[third-party credits and licences](THIRD_PARTY_NOTICES.md) for the precise scope,
upstream repositories, authors and reuse details.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | Semantic HTML5, multi-page |
| Styling | Shared CSS, plus Office homepage styles locked to Clarity |
| Scripts | Vanilla JavaScript, no frameworks |
| Typography | Nunito, Montserrat and Noto Sans JP, with system fallbacks |
| Icons | Inline SVG |
| Mark | Wordmark in the header; rubber-stamp seal in About |
| Hosting | GitHub Pages (`.nojekyll`; auto-deploys on push to `main`) |

**No build step.** The published site is the files in this repository.

## Run Locally

```bash
npx serve .
# or
python3 -m http.server 8000
```

## The homepage

`index.html` is the Office homepage. It is locked to the Clarity theme (`data-theme="clarity"` and `data-theme-lock="clarity"`) and does not pick a random palette on each visit. A sun/moon control in the header switches light and dark; the choice is stored as `nj-office-appearance` and follows the device until someone chooses. Dark surfaces are black.

The page is, in order:

1. **Hero** — introduction and the Minato harbour arrival
2. **Projects** — the project explorer (`Explore`, `Create`, `Learn`)
3. **Blog** — the same English-first feed as `/blog/`
4. **About** — short biography and social links
5. **Locations** — Sweden and Vietnam

The header also has quick links and an availability calendar. Project cards are drawn by `assets/js/project-explorer.js` from `CONFIG.projectExplorer` in `config.js`. The blog list comes from `assets/js/blog-posts.js`. Navigation and the footer come from `shared.js`.

## Folder Structure

```
.
├── index.html                         Office homepage
├── config.js                          Site data: author, navigation, projects, project explorer, icons, logo
├── shared.js                          Shared navigation, footer and theme switcher
├── assets/js/project-explorer.js      Homepage project cards
├── assets/js/blog-posts.js            Public article catalogue
├── assets/js/office-appearance.js     Homepage light/dark control
├── assets/js/office-calendar.js       Header calendar
├── css/office-home.css                Homepage layout
├── css/project-explorer.css           Project cards
├── styles.css                         Shared stylesheet (imports css/)
├── blog/                              Articles
├── hotels/                            Hotels & Parking register
├── sitemap.xml                        Public pages
├── .nojekyll                          Tells GitHub Pages to skip Jekyll
└── .gitignore
```

Project pages (Pocket Camera, the ferry, Sjöskolan, the book, the maintenance demo and others) live in their own folders. Johansson World’s pages are served from the separate `nj22az/johansson-world` repository at `/johansson-world/`. Johansson Town, the game, is `nj22az/johansson-town` at `/johansson-town/`.

## How appearance works

**Homepage.** Clarity stays put. `assets/js/office-appearance.js` sets `data-office-mode` to `light` or `dark` before the page paints.

**Shared pages.** The blog, the Linux pages and Johansson World take the palette saved by the header switcher in `shared.js`. `theme-bootstrap.js` stores it as `nj-theme`. The palettes are Cobalt, Mossy, Cute, Colorgrid, Crimson, Inkcraft, Clarity, Horizon, Swift, Botanical and Popwave. A page with `data-theme-lock` keeps the theme named there. Hotels & Parking is locked to Clarity, the same way the homepage is. Pocket Camera has its own light and dark setting.

## How the mark works

- The header uses `CONFIG.navLogo()`, a wordmark, at 34px tall.
- About uses the rubber-stamp seal from `CONFIG.logo()`, drawn at 140px. Strokes and lettering use `currentColor`, so they follow the page colour. Hover uses `.logo-seal`.

## How to Add a Project

The homepage grid is `CONFIG.projectExplorer` in `config.js`, not a bento of `CONFIG.projects`:

```js
{
  id: "example",
  category: "create", // "explore", "create" or "learn"
  title: "Project name",
  eyebrow: "SHORT LABEL",
  summary: "One or two sentences.",
  url: "/example/",
  action: "Open the project",
  format: "Browser tool",
  language: "English",
  status: "Browser tool",
  firstTry: "What to try first.",
  features: ["One thing you can do", "Another"],
  preview: "maintenance" // world, camera, ferry, studio, maintenance, course, book
}
```

`preview` selects the card’s picture. Links in `CONFIG.projects` whose address is on another site are listed under “Beyond the projects”. To take a project off that list without deleting the record, move it to `CONFIG.archivedProjects`.

A new icon used by the shared chrome goes in `CONFIG.icons` as an SVG path for a 24×24 view.

## How to Add a Page

1. Create `new-page/index.html`.
2. Use the shared shell: `<nav id="site-nav" class="site-nav"></nav>`, `<footer id="site-footer" class="site-footer"></footer>`, then `config.js` and `shared.js`.
3. Set `lang`. Lock the theme with `data-theme-lock` when the page should not follow the shared palette; otherwise `theme-bootstrap.js` applies the saved one.
4. Add a `CONFIG.navigation` entry in `config.js` if the page belongs in the menu, and a `sitemap.xml` entry if it is a public page.

## Environment Variables

None. The site is entirely static.

## Rights and credits

[Copyright and permissions](LICENSE.md) ·
[Third-party credits and notices](THIRD_PARTY_NOTICES.md)
