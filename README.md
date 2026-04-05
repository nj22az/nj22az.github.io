# The Office of Nils Johansson

A premium, Apple-inspired personal project portal. Dark mode by default, fully responsive, zero build dependencies.

**Live:** [nj22az.github.io](https://nj22az.github.io)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | Semantic HTML5, multi-page |
| Styling | Self-contained CSS with dark/light design tokens |
| Scripts | Vanilla JavaScript, no frameworks |
| Typography | [Nunito](https://fonts.google.com/specimen/Nunito) (display) + system-ui (body) |
| Icons | Inline SVG paths (Lucide / SF Symbols aesthetic) |
| Hosting | GitHub Pages (auto-deploys on push) |

**No build step.** No npm. No bundler. Just static files.

## Run Locally

```bash
npx serve .
# or
python3 -m http.server 8000
# or just open index.html
```

## Folder Structure

```
.
├── index.html              Main portal (hero, projects, journal, about)
├── blog/index.html         Blog page (fetches from WordPress API)
├── config.js               All site data, projects, icons, strings
├── shared.js               Shared nav, footer, theme toggle (loaded on every page)
├── styles.css              Complete stylesheet (dark-first design tokens)
├── hotel-assessment/       React + TypeScript sub-app (separate build)
├── _posts/                 Markdown blog post archive
├── assets/
│   ├── downloads/          Downloadable files (PDF, TXT)
│   ├── images/             Photos, app icons
│   ├── previews/           Download preview thumbnails
│   └── video/              Video assets
├── CLAUDE.md               AI assistant instructions
├── .nojekyll               Tells GitHub Pages to skip Jekyll
└── .gitignore
```

## How Dark Mode Works

1. `<html data-theme="dark">` is set by default on every page
2. CSS uses custom properties scoped to `[data-theme="dark"]` and `[data-theme="light"]`
3. `shared.js` reads/writes `localStorage.getItem("nj-theme")` and updates the attribute
4. A sun/moon toggle button in the top nav switches the theme
5. The preference persists across pages and sessions

## How to Add a New Project

Edit **`config.js`** → `CONFIG.projects`:

```js
{
  title: "Project Name",
  description: "Short description.",
  url: "/path-or-url/",
  icon: "iconName",           // must exist in CONFIG.icons
  tags: ["Tag1", "Tag2"],
  featured: true,
}
```

Need a new icon? Add to `CONFIG.icons`:
```js
iconName: "M... SVG path data ...",   // 24x24 viewBox, stroke-based
```

## How to Add a New Page

1. Create `new-page/index.html`
2. Use the same HTML shell as existing pages:
   - `<html lang="en" data-theme="dark">`
   - `<nav id="site-nav"></nav>` in body
   - `<footer id="site-footer" class="site-footer"></footer>`
   - Load `config.js` then `shared.js`
3. Navigation, footer, and theme toggle are automatically injected
4. Optionally add the page to `CONFIG.navigation` in config.js

## Multi-Page Consistency

All pages share:
- **`shared.js`** — injects identical nav (with theme toggle) and footer
- **`styles.css`** — single stylesheet with all component styles
- **`config.js`** — single source of truth for all data

This means every page automatically gets the same navigation, dark/light toggle, footer, typography, colors, and hover states.

## Environment Variables

None. The site is entirely static.

## Sub-Projects

### Hotel Assessment Journal (`/hotel-assessment/`)
Separate React + Vite + TypeScript app. Has its own `package.json` and build pipeline. Not affected by the main site's design system.

## License

Copyright Nils Johansson. All rights reserved.
