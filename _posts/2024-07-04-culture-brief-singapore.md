---
layout: post
title: "Customizing UI Text and Navigation"
date: 2024-07-04
categories: [Configuration]
tags:
  - UI
  - Customization
  - Configuration
  - Navigation
content_type: Configuration
featured: false
cover_icon: settings
thumbnail: /assets/images/posts/customizing-ui/ui-config.svg
---

Learn how to customize all user-facing text, navigation items, and interface elements through Markdown and YAML configuration files. No code editing required!

## UI Configuration Overview

All user interface text is stored in `_data/ui.yml`, making it easy to:
- Change button labels and messages
- Customize navigation items and labels
- Modify hero section content
- Update empty state messages
- Configure search and filter labels

## Navigation Customization

### Brand Information
Edit your site's branding in `_data/ui.yml`:

```yaml
navigation:
  brand_name: "Your Name"
  brand_role: "Your Professional Title"
```

### Navigation Items
Customize navigation menu items:

```yaml
navigation:
  items:
    - id: home
      label: "Home"
      icon: "home"
    - id: blog
      label: "Journal"  # Change to "Blog", "Articles", etc.
      icon: "notebook-pen"
    - id: downloads
      label: "Resources"  # Change to "Downloads", "Files", etc.
      icon: "folder"
    - id: about
      label: "About"
      icon: "user"
```

**Available Navigation Icons:**
- `home` - Homepage
- `notebook-pen` - Blog/Journal
- `folder` - Downloads/Resources
- `user` - About page
- `mail` - Contact
- `code` - Projects
- `briefcase` - Portfolio

## Hero Section Content

Customize the homepage hero section:

```yaml
hero:
  badge: "Your tagline or current role"
  headline: "Your main headline"
  subhead: "Compelling description of your content or mission"
  primary_button: "Browse Articles"    # Main CTA
  secondary_button: "View Resources"   # Secondary action
```

**Example Customizations:**
```yaml
# For a developer blog
hero:
  badge: "Full-stack developer · Open source contributor"
  headline: "Code, tutorials, and tech insights"
  subhead: "Practical programming guides and lessons learned from building modern web applications."

# For a design portfolio
hero:
  badge: "UI/UX Designer · Creative problem solver"
  headline: "Design process and case studies"
  subhead: "Deep dives into design decisions, user research, and creating delightful digital experiences."
```

## Button and Action Labels

Customize all button text and interface labels:

```yaml
buttons:
  read_more: "Continue Reading"        # Post card action
  read_full_report: "Read Full Article"  # Featured post action
  back: "← Back"                       # Navigation back
  bookmark: "Save for Later"          # Bookmark action
  bookmarked: "★ Saved"              # Bookmarked state
  download: "Download"                 # Download button
  copy_link: "Copy Link"              # Share action
  print: "Print Article"              # Print action
```

## Search and Filter Configuration

Customize search and filtering interface:

```yaml
search:
  placeholder: "Search articles and resources..."  # Search input
  sort_label: "Sort by"                           # Sort dropdown label
  content_type_label: "Content type"              # Filter label
  all_tags: "All Topics"                          # All tags option
  all_types: "All Content"                        # All types option
```

### Sort Options
Configure how users can sort content:

```yaml
sort_options:
  - id: newest
    label: "Latest First"
  - id: oldest
    label: "Oldest First"
  - id: shortest
    label: "Quick Reads"    # Short articles first
  - id: longest
    label: "Deep Dives"     # Long articles first
```

## Testing Your Changes

1. **Edit Configuration:**
   ```bash
   # Edit the UI configuration
   nano _data/ui.yml
   ```

2. **Preview Changes:**
   ```bash
   # Start development server
   jekyll serve --livereload

   # View at http://127.0.0.1:4000
   ```

3. **Deploy Updates:**
   ```bash
   git add _data/ui.yml
   git commit -m "Update UI text and navigation labels"
   git push origin main
   ```

## Next Steps

- [Managing Content and Downloads →](/2024/11/18/managing-content-downloads)
- [Writing and Publishing Posts →](/2025/09/02/how-to-write-posts)

![UI configuration example](/assets/images/posts/customizing-ui/ui-config.svg)
*Example of how UI configuration controls all interface text*
