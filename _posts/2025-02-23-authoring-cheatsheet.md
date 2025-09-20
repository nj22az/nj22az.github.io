---
layout: post
title: "Authoring Cheat Sheet"
date: 2025-02-23
categories: [Reference]
tags:
  - Markdown
  - Workflow
  - Icons
content_type: Checklist
cover_icon: checklist
featured: false
thumbnail: /assets/images/dummy-deployment-map.svg
---

Quick checklist so you never have to hunt for where things live when adding content.

## Where the words live

- Blog entries: `_posts/` with the `YYYY-MM-DD-title.md` naming pattern.
- Drafts (optional): create `_drafts/` and drop unfinished Markdown there; Jekyll ignores it until you publish.
- About page: `about.md` at the project root. Update that Markdown and Jekyll feeds the React layer through `about.json` automatically.

## Front matter you should keep handy

```yaml
---
layout: post
title: "Post title"
date: 2025-02-23
categories: [Reference]
tags:
  - Example
content_type: Technical Dispatch
cover_icon: toolkit
thumbnail: /assets/images/posts/example/cover.jpg
featured: false
---
```

- `cover_icon` must match an id in `_data/icons.yml` (`toolkit`, `compass`, `antenna`, etc.).
- `thumbnail` is optional but helps the downloads and post cards stand out.

## Useful commands

```bash
jekyll serve --livereload   # Preview everything locally
rg "About Nils" main.js    # Jump to the AboutPage copy
rg "cover_icon" -g"*.md"   # See which posts use which icons
```

## Before you publish

1. Run through the homepage filters to confirm the new post appears with the right icon and category.
2. Open the detail view, test the share buttons, and make sure bookmarking works.
3. Push to `main`; GitHub Pages rebuilds automatically within a couple of minutes.

That’s it—drop this cheat sheet next to your README so you can get back to writing instead of spelunking through folders.
