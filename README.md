# Nils Johansson — Site Playbook

A quick reference for running, extending, and publishing the React-driven Jekyll blog that powers [nj22az.github.io](https://nj22az.github.io).

## Tech Overview

- **Static generator:** Jekyll builds the Markdown posts into HTML and also emits the JSON feed consumed by React (`posts.json`).
- **Front-end:** `index.html` loads the custom React app in `main.js` for the full browsing experience.
- **Styling:** Global design system lives in `styles.css` (Apple HIG-inspired) and a few Jekyll overrides in `assets/main.scss`.
- **Data:**
  - Blog content lives in `_posts/` as Markdown files with front matter.
  - Download metadata lives in `downloads.json`.

## Local Development

1. Ensure Ruby 3.4+ is on your `PATH` (already configured in `~/.zshrc`). If you open a new terminal the exported PATH is applied automatically.
2. From the project root run:

   ```bash
   jekyll serve --livereload
   ```

   Jekyll builds the site into `_site/` and serves it at `http://127.0.0.1:4000`.

3. Stop the local server with `Ctrl+C` (or `pkill -f jekyll` if it is detached).

> **Tip:** Jekyll’s output is ignored by Git (`_site/`, `.jekyll-cache/`), so you can freely rebuild without affecting version control.

## Publishing Changes

1. Commit your edits:

   ```bash
   git add -A
   git commit -m "Describe your change"
   git push origin main
   ```

2. GitHub Pages rebuilds automatically after each push. The deployment usually appears within a couple of minutes. You can verify it by refreshing `https://nj22az.github.io/` or hitting `https://nj22az.github.io/posts.json`.

## Writing a New Blog Post

1. Create a Markdown file in `_posts/` using the `YYYY-MM-DD-title.md` convention. Example:

   ```markdown
   ---
   layout: post
   title: "Working Between Shipyards"
   date: 2025-01-15
   ---

   Start with a short intro paragraph. The React UI uses this to build the excerpt and estimate reading time.
   ```

2. Use standard Markdown for headings, lists, code blocks, and images. Everything between the front matter and the end of the file becomes the post body.
3. (Optional) Add custom metadata such as `tags` if you need it for future enhancements; Jekyll will pass it through to the JSON feed.
4. Save, preview locally with `jekyll serve`, then commit/push when ready.

## Managing Downloads

Downloads are driven by the `downloads.json` file and any binary assets you add.

1. Place downloadable files inside `assets/downloads/` (create subfolders if you prefer). A `.gitkeep` file is already present to keep the directory in Git.
2. Update `downloads.json` with an entry per document:

   ```json
   {
     "title": "Engine Room Checklist",
     "description": "Quick reference before boarding night shift.",
     "file_type": "PDF",
     "file_size": "140KB",
     "download_count": 0,
     "url": "/assets/downloads/engine-room-checklist.pdf"
   }
   ```

   - `title`, `description`, `file_type`, and `file_size` show up on the Downloads page.
   - `download_count` is informational only—update it manually if you want to display real numbers.
   - `url` is optional; if provided the UI will render a **Download** button pointing to that path. Use either a site-relative path (recommended) or a full external URL.

3. Commit both the updated JSON and any new files in `assets/downloads/`.
4. After the GitHub Pages build completes, confirm the links resolve (e.g., `https://nj22az.github.io/assets/downloads/engine-room-checklist.pdf`).

## Troubleshooting

- **`jekyll` command not found:** run `source ~/.zshrc` in the current terminal or start a new shell so the PATH updates apply.
- **Feed serving raw Liquid:** make sure `.nojekyll` does not exist in the repo (already handled). GitHub must process the site with Jekyll for `posts.json` to render.
- **Stale styles/scripts:** Bust your cache with a hard refresh (`Cmd+Shift+R`) or by appending `?v=timestamp` to the URL while testing.

## Directory Highlights

```
_posts/                 Markdown sources for the blog
assets/downloads/       Bucket for downloadable files (add your assets here)
assets/main.scss        Sass entry point for the Jekyll theme overrides
index.html              Entry page that loads the React app
main.js                 React application logic
styles.css              Apple-inspired global styling for the SPA experience
downloads.json          Metadata for the Downloads page cards
posts.json              Auto-generated JSON feed (no manual edits needed)
```

Happy writing and shipping!
