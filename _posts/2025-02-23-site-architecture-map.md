---
layout: post
title: "Site Architecture Map"
date: 2025-02-23
categories: [Reference]
tags:
  - Architecture
  - React
  - Jekyll
content_type: Technical Dispatch
cover_icon: toolkit
featured: false
---

Use this post as the quick brief on how the site is wired together when you need to tweak code or unblock a deployment.

## High-level flow

- **Jekyll** reads everything in `_posts/`, `_layouts/`, `_includes/`, `about.md`, and `assets/` and outputs static pages plus JSON feeds (`posts.json`, `about.json`, and `downloads.json`).
- `index.html` is the single published HTML page. It boots the React app by loading `main.js`.
- **React (`main.js`)** fetches `posts.json` and `downloads.json`, decorates each entry (reading time, excerpts, icons), and renders the navigation, filters, post cards, and detail views.
- Global visuals live in `styles.css`. It supplies the icon masks, layout grid, timeline cards, filter bar, downloads grid, etc.

## Key directories

- `_posts/` → Markdown content (one file per entry, `YYYY-MM-DD-title.md`).
- `_layouts/` → Liquid templates. `_layouts/home.html` still powers the classic Jekyll home experience if JavaScript is disabled.
- `_includes/` → Reusable Liquid partials like `post-card.html` and `sidebar.html`.
- `assets/images/` → Any custom images or thumbnails referenced from Markdown.
- `_data/icons.yml` → Human-readable catalog of every `cover_icon` id you can reference from your posts.
- `about.md` → Markdown source for the About page (React consumes it via `about.json`).

## Data handoff

When you add metadata (tags, categories, thumbnails, `cover_icon`) to a Markdown file, Jekyll writes those fields into `posts.json`. The React layer reads them and automatically:

1. Picks the right icon mask (`MonoIcon`) using `cover_icon` or your `content_type`.
2. Renders the tags and categories inside the card footers.
3. Generates the reading time and excerpt so the UI stays consistent without manual editing.

Keep this post handy when you dive back into the project after a break—it points you directly at the files that matter.
