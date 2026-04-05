# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Local Development
Open `index.html` directly in a browser, or use any static server:
```bash
npx serve .
# or
python3 -m http.server 8000
```

### Publishing
```bash
git add -A
git commit -m "Describe your change"
git push origin main
```
GitHub Pages rebuilds automatically on push to main branch.

## Architecture Overview

This is a static portfolio site called **The Office of Nils Johansson**. Apple-inspired flat design with Tailwind CSS and vanilla JavaScript. No build step required.

### Core Files

| File | Purpose |
|------|---------|
| `index.html` | Main portal — hero, projects grid, journal feed, about section, footer |
| `config.js` | All site data: projects, author info, icons, navigation, strings |
| `styles.css` | Custom styles extending Tailwind (dark mode, animations, glassmorphism) |
| `blog/index.html` | Standalone blog page pulling posts from WordPress API |

### Design System

- **Framework**: Tailwind CSS via CDN (no build step)
- **Typography**: Nunito (rounded gothic display) + system-ui (body)
- **Icons**: Inline SVG paths in `config.js` (Lucide/SF Symbols style, 24x24 viewBox)
- **Dark mode**: Automatic via `prefers-color-scheme` in `styles.css`
- **Animations**: Scroll-triggered fade-up via IntersectionObserver
- **Navigation**: Fixed glassmorphism bar, responsive hamburger on mobile

### Data Flow

1. `config.js` exports a `CONFIG` object with all site data
2. `index.html` inline script reads CONFIG and renders DOM
3. Journal section fetches latest 3 posts from WordPress API at runtime
4. Projects link to sub-apps (`/hotel-assessment/`) and downloadable assets

### Sub-Projects

- **`hotel-assessment/`** — Separate React + Vite + TypeScript app for hotel reviews (has own build pipeline)
- **`_posts/`** — Markdown blog post archive (content source, not actively processed)

## Key Directories

```
index.html              # Main portal page
config.js               # Centralized site configuration
styles.css              # Custom CSS (dark mode, animations)
blog/index.html         # WordPress-powered blog page
hotel-assessment/       # React sub-app (separate build)
_posts/                 # Blog post markdown archive
assets/
  downloads/            # Downloadable files (PDF, TXT)
  images/               # Profile photos, icons, post images
  previews/             # Download preview thumbnails
  video/                # Video assets for blog posts
```

## How to Add a New Project

1. Open `config.js`
2. Add an entry to the `CONFIG.projects` array:
   ```js
   {
     title: "Project Name",
     description: "One-line description.",
     url: "/path/or/url",
     icon: "iconName",       // Must exist in CONFIG.icons
     tags: ["Tag1", "Tag2"],
     featured: true,
   }
   ```
3. If the project needs a new icon, add an SVG path string to `CONFIG.icons`

## How to Add a New Icon

Add an entry to `CONFIG.icons` in `config.js`:
```js
iconName: "M... SVG path data ...",
```
Use 24x24 viewBox, stroke-based (no fill). Match Lucide/SF Symbols style.

## Development Notes

- No package.json, no build step — pure static HTML/CSS/JS
- `.nojekyll` file tells GitHub Pages to skip Jekyll processing
- Tailwind loaded via CDN (`cdn.tailwindcss.com`) — config is inline in `index.html`
- Dark mode handled entirely in CSS `@media (prefers-color-scheme: dark)`
- Reduced motion respected via `prefers-reduced-motion`
- All external links open in new tab with `rel="noopener"`
