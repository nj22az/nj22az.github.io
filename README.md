# The Office of Nils Johansson

A premium, Apple-inspired personal project portal hosted on GitHub Pages.

**Live site:** [nj22az.github.io](https://nj22az.github.io)

---

## What This Is

A clean digital hub that links to all of Nils Johansson's projects — engineering tools, technical writing, and downloadable resources. Built as a fast, zero-dependency static site with an Apple-inspired design language: extreme whitespace, sophisticated typography, subtle interactions, and flat icons.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | Semantic HTML5 |
| Styling | [Tailwind CSS](https://tailwindcss.com) via CDN + custom CSS |
| Scripts | Vanilla JavaScript (no frameworks) |
| Typography | [Nunito](https://fonts.google.com/specimen/Nunito) (display) + system-ui (body) |
| Icons | Inline SVG paths (Lucide / SF Symbols style) |
| Hosting | GitHub Pages (auto-deploys on push to `main`) |

**No build step.** No `npm install`. No bundler. Just open `index.html`.

## Run Locally

```bash
# Option 1: Any static server
npx serve .

# Option 2: Python
python3 -m http.server 8000

# Option 3: Just open the file
open index.html
```

Then visit `http://localhost:8000` (or whatever port your server uses).

## Folder Structure

```
.
├── index.html              # Main portal (hero, projects, journal, about)
├── config.js               # All site data, project list, icons, strings
├── styles.css              # Custom CSS (dark mode, glassmorphism, animations)
├── blog/
│   └── index.html          # Blog page (fetches from WordPress API)
├── hotel-assessment/       # React + TypeScript sub-app (own build pipeline)
├── _posts/                 # Markdown blog post archive
├── assets/
│   ├── downloads/          # Downloadable files (PDF, TXT)
│   ├── images/             # Profile photos, post images
│   ├── previews/           # Download preview thumbnails
│   └── video/              # Video assets
├── CLAUDE.md               # AI assistant instructions
├── .nojekyll               # Tells GitHub Pages to skip Jekyll
└── .gitignore
```

## How to Add a New Project

1. Open **`config.js`**
2. Add an object to the `CONFIG.projects` array:

```js
{
  title: "My New Project",
  description: "A short description of what it does.",
  url: "/path-to-project/",   // or full URL
  icon: "iconName",            // must exist in CONFIG.icons
  tags: ["Tag1", "Tag2"],
  featured: true,
}
```

3. If you need a new icon, add an SVG path to `CONFIG.icons`:

```js
iconName: "M... path data ...",  // 24x24 viewBox, stroke-based
```

4. Commit and push — the site updates automatically.

## How to Edit Content

| What | Where |
|------|-------|
| Site title, tagline, description | `config.js` → `CONFIG.site` |
| Author name, bio, social links | `config.js` → `CONFIG.author` |
| Projects list | `config.js` → `CONFIG.projects` |
| Navigation items | `config.js` → `CONFIG.navigation` |
| Icon SVG paths | `config.js` → `CONFIG.icons` |
| Colors, dark mode, animations | `styles.css` |
| Tailwind config (fonts, colors) | `index.html` → `<script>tailwind.config = {...}</script>` |
| Blog posts source | WordPress at `theofficeofnils.wordpress.com` |

## Design Principles

- **Apple-inspired**: Generous whitespace, subtle shadows, no visual noise
- **Mobile-first**: Responsive from 320px to ultrawide
- **Dark mode**: Automatic, system-preference aware
- **Accessible**: Focus rings, reduced-motion support, semantic HTML
- **Fast**: No build step, minimal dependencies, CDN-delivered assets
- **Data-driven**: Everything configurable from one `config.js` file

## Environment Variables

None required. The site is entirely static with no server-side dependencies.

## Sub-Projects

### Hotel Assessment Journal (`/hotel-assessment/`)
A separate React + Vite + TypeScript application for generating AI-powered hotel assessment reports. Has its own `package.json` and build pipeline. See `hotel-assessment/` for details.

## License

Copyright Nils Johansson. All rights reserved.
