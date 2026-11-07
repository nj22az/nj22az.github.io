---
layout: post
title: "Managing Content and Downloads"
date: 2024-11-18
categories: [Content Management]
tags:
  - Downloads
  - Resources
  - Content
  - Management
content_type: Documentation
featured: false
cover_icon: folder
thumbnail: /assets/images/posts/managing-content/folder-structure.svg
---

Learn how to manage downloadable resources, organize content files, and structure your website's assets for optimal user experience and maintainability.

## Downloads Overview

The downloads system allows you to offer files, templates, guides, and other resources to your visitors. All download metadata is managed through the `downloads.json` file, while actual files are stored in organized directories.

## File Organization Structure

### Downloads Directory
Store all downloadable files in the `assets/downloads/` directory:

```
assets/downloads/
├── templates/
│   ├── project-checklist.pdf
│   ├── meeting-notes-template.docx
│   └── design-brief-template.sketch
├── guides/
│   ├── getting-started-guide.pdf
│   ├── troubleshooting-manual.pdf
│   └── best-practices.md
├── tools/
│   ├── utility-script.py
│   ├── config-generator.js
│   └── data-converter.xlsx
└── samples/
    ├── sample-dataset.csv
    ├── example-config.json
    └── demo-presentation.pptx
```

### Image Assets Structure
Organize images by content type:

```
assets/images/
├── posts/
│   ├── post-slug/
│   │   ├── hero-image.jpg
│   │   ├── diagram.svg
│   │   └── gallery/
│   │       ├── photo1.jpg
│   │       └── photo2.jpg
├── downloads/
│   ├── preview-thumbnails/
│   │   ├── guide-preview.jpg
│   │   └── template-preview.png
├── ui/
│   ├── icons/
│   └── backgrounds/
└── about/
    ├── profile.jpg
    └── team-photo.jpg
```

## Downloads Configuration

### Adding New Downloads
Edit `downloads.json` to add new downloadable resources:

```json
[
  {
    "title": "Project Planning Checklist",
    "description": "Comprehensive checklist for planning and executing projects efficiently.",
    "category": "Templates",
    "file_type": "PDF",
    "file_size": "245KB",
    "download_count": 127,
    "url": "/assets/downloads/templates/project-checklist.pdf",
    "thumbnail": "/assets/images/downloads/preview-thumbnails/checklist-preview.jpg",
    "tags": ["planning", "project-management", "checklist"],
    "related": ["Project Brief Template", "Meeting Notes Template"]
  },
  {
    "title": "API Integration Guide",
    "description": "Step-by-step guide for integrating with third-party APIs securely.",
    "category": "Guides",
    "file_type": "PDF",
    "file_size": "1.2MB",
    "download_count": 89,
    "url": "/assets/downloads/guides/api-integration-guide.pdf",
    "tags": ["development", "api", "integration", "security"]
  }
]
```

### Download Item Properties

**Required Fields:**
- `title` - Display name for the download
- `description` - Brief description of the resource
- `url` - Path to the downloadable file

**Optional Fields:**
- `category` - Grouping category (Templates, Guides, Tools, etc.)
- `file_type` - File format (PDF, DOCX, ZIP, etc.)
- `file_size` - Human-readable file size (245KB, 1.2MB)
- `download_count` - Number of downloads (update manually)
- `thumbnail` - Preview image path
- `tags` - Array of searchable tags
- `related` - Array of related download titles

### Category Organization

Organize downloads into logical categories:

**Templates:**
- Document templates
- Design templates
- Code boilerplates
- Configuration files

**Guides:**
- How-to guides
- Tutorials
- Best practices
- Documentation

**Tools:**
- Scripts and utilities
- Calculators
- Generators
- Converters

**Samples:**
- Example files
- Demo projects
- Sample datasets
- Reference implementations

## Content Management Workflow

### 1. Prepare Files
```bash
# Create category directory if needed
mkdir -p assets/downloads/guides

# Add your file
cp new-guide.pdf assets/downloads/guides/

# Optimize file size if needed
# Use tools like ImageOptim for images, or PDF compression
```

### 2. Create Thumbnails (Optional)
```bash
# Create thumbnail directory
mkdir -p assets/images/downloads/preview-thumbnails

# Add preview image
cp guide-preview.jpg assets/images/downloads/preview-thumbnails/
```

### 3. Update Downloads Metadata
Edit `downloads.json` to add your new resource:

```json
{
  "title": "Your New Guide",
  "description": "Description of what this guide covers",
  "category": "Guides",
  "file_type": "PDF",
  "file_size": "800KB",
  "download_count": 0,
  "url": "/assets/downloads/guides/new-guide.pdf",
  "thumbnail": "/assets/images/downloads/preview-thumbnails/guide-preview.jpg",
  "tags": ["tutorial", "guide", "documentation"]
}
```

### 4. Test and Deploy
```bash
# Test locally
jekyll serve --livereload

# Verify download links work
# Check file paths are correct

# Deploy
git add assets/downloads/ downloads.json
git commit -m "Add new guide: API Integration"
git push origin main
```

## Advanced Features

### Related Resources
Link related downloads by referencing their exact titles:

```json
{
  "title": "Advanced Configuration Guide",
  "related": ["Basic Setup Guide", "Configuration Template", "Troubleshooting Manual"]
}
```

### Download Tracking
Update download counts manually or integrate analytics:

```json
{
  "title": "Popular Template",
  "download_count": 1543  // Update periodically
}
```

### External Resources
Link to external files or services:

```json
{
  "title": "External Tool",
  "description": "Link to external resource or tool",
  "url": "https://external-service.com/download/tool.zip",
  "file_type": "ZIP"
}
```

## File Naming Conventions

### Downloads
Use descriptive, URL-friendly names:
- `project-planning-checklist.pdf` ✅
- `checklist.pdf` ❌
- `api-integration-guide-v2.pdf` ✅
- `guide (1).pdf` ❌

### Images
Include context and dimensions:
- `hero-image-1200x600.jpg` ✅
- `diagram-workflow-800x400.svg` ✅
- `preview-thumbnail-300x200.jpg` ✅
- `img1.jpg` ❌

### Post Images
Organize by post slug:
- `assets/images/posts/managing-content/folder-structure.svg` ✅
- `assets/images/diagram.svg` ❌

## Best Practices

### File Optimization
- **Images:** Compress and optimize for web
- **PDFs:** Use web-optimized export settings
- **Documents:** Consider PDF format for universal compatibility

### Accessibility
- Include descriptive file names
- Add alt text for thumbnail images
- Provide file size and format information

### SEO
- Use descriptive titles and descriptions
- Include relevant tags
- Organize into logical categories

### Maintenance
- Regularly check for broken links
- Update download counts periodically
- Archive outdated resources
- Monitor file sizes and storage usage

## Troubleshooting

### Common Issues

**Download Link Not Working:**
```bash
# Check file path
ls -la assets/downloads/path/to/file.pdf

# Verify JSON syntax
python -m json.tool downloads.json
```

**Images Not Displaying:**
```bash
# Check image path
ls -la assets/images/downloads/thumbnail.jpg

# Verify image format is supported
file assets/images/downloads/thumbnail.jpg
```

**Large File Sizes:**
```bash
# Check total downloads size
du -sh assets/downloads/

# Consider GitHub's file size limits
# Individual files: 100MB max
# Repository total: 1GB recommended
```

## Next Steps

- [Writing and Publishing Posts →](/2025/09/02/how-to-write-posts)
- [Customizing UI Text and Navigation →](/2024/07/04/customizing-ui-elements)

![Content structure example](/assets/images/posts/managing-content/folder-structure.svg)
*Example of organized content and file structure*

## Quick Reference

### Adding a Simple Download
1. Add file to `assets/downloads/category/`
2. Add entry to `downloads.json`
3. Test locally with `jekyll serve`
4. Deploy with Git

### File Size Guidelines
- **Documents:** < 5MB
- **Images:** < 2MB
- **Archives:** < 10MB
- **Large files:** Consider external hosting
