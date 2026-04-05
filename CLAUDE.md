# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands

### Local Development
```bash
npx serve .
# or
python3 -m http.server 8000
```
Then open `http://localhost:8000`. No build step required.

### Publishing
```bash
git add -A && git commit -m "Describe change" && git push origin main
```
GitHub Pages auto-deploys on push to main.

## Architecture

Multi-page static portfolio: **The Office of Nils Johansson**. Apple-inspired dark-first design. No frameworks, no build step.

### Core Files

| File | Purpose |
|------|---------|
| `index.html` | Main portal — hero, projects, journal feed, about |
| `blog/index.html` | Blog page — WordPress API integration |
| `config.js` | All site data: projects, author, icons, nav items |
| `shared.js` | Shared nav, footer, theme toggle — included on every page |
| `styles.css` | Complete stylesheet with dark/light tokens |

### Multi-Page Consistency

Every HTML page includes:
1. `<html data-theme="dark">` — dark by default
2. `<nav id="site-nav"></nav>` — shared.js injects navigation + theme toggle
3. `<footer id="site-footer" class="site-footer"></footer>` — shared.js injects footer
4. `<script src="/config.js"></script>` then `<script src="/shared.js"></script>`

### Theme System

- Dark mode is default (`data-theme="dark"` on `<html>`)
- Toggle button in nav switches between dark/light
- Preference persisted in `localStorage` key `nj-theme`
- All colors use CSS custom properties in `:root` / `[data-theme="light"]`
- No `@media (prefers-color-scheme)` — manual toggle only

### Adding a New Page

1. Create `new-page/index.html`
2. Copy the standard HTML shell:
   ```html
   <!DOCTYPE html>
   <html lang="en" data-theme="dark">
   <head>
     <!-- same head as other pages: meta, fonts, styles.css -->
   </head>
   <body>
     <nav id="site-nav"></nav>
     <main><!-- page content --></main>
     <footer id="site-footer" class="site-footer"></footer>
     <script src="/config.js"></script>
     <script src="/shared.js"></script>
   </body>
   </html>
   ```
3. Add to `CONFIG.navigation` in config.js if it should appear in nav

### Adding a New Project

Edit `CONFIG.projects` in `config.js`. Add icon path to `CONFIG.icons` if needed.

### Icons

All icons are SVG path strings in `CONFIG.icons` (24x24 viewBox, stroke-based). Rendered by `siteIcon()` from shared.js.

## Key Directories

```
index.html              # Main portal
blog/index.html         # Blog (WordPress API)
config.js               # Site configuration
shared.js               # Shared nav/footer/theme
styles.css              # Complete stylesheet
hotel-assessment/       # Separate React sub-app
_posts/                 # Blog post markdown archive
assets/
  downloads/            # Downloadable files
  images/               # Photos, icons
  previews/             # Download thumbnails
  video/                # Video assets
```
