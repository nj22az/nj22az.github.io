# Website Rework Plan: Custom Space Rings & Lamp Inserts

## Business Summary
Professional website for a business specialising in **custom 3D-printed space rings and inserts** for lamps and roof lights. Key selling points:
- **Custom dimensions** — made to order, any size
- **Multiple PLA colour options** — wide palette to match any interior
- **Expert craftsmanship** — precision-engineered for perfect fit

---

## Phase 1: Foundation & Branding (Core Structure)

### 1.1 Update Site Configuration
- Rename site title, description, and branding in `_config.yml`
- Update `_data/ui.yml` with new navigation labels (Home, Products, Custom Orders, About, Contact)
- Choose a business name or use existing one
- Update favicon and logo

### 1.2 Rework Home Page (Hero Section)
- **Hero banner**: Bold headline like "Precision Space Rings & Inserts — Made to Your Exact Dimensions"
- Sub-headline emphasising custom sizing and colour options
- Call-to-action buttons: "Browse Products" and "Request a Custom Quote"
- Trust indicators: "Custom Dimensions", "Multiple PLA Colours", "Fast Turnaround"
- Clean product photography showcase (carousel or grid of hero images)

### 1.3 Update Navigation
- **Desktop sidebar** → convert to: Home | Products | Custom Orders | About | Contact
- **Mobile bottom nav** → same pages, with appropriate icons
- Remove blog-specific navigation (Journal, Bookmarks, Downloads)

---

## Phase 2: Product Pages

### 2.1 Product Catalogue Page
Create a product listing page with filterable categories:

**Product Categories:**
- **Lamp Space Rings** — rings that fit between lamp holders and shades
- **Roof Light Inserts** — custom inserts for ceiling/roof light fittings
- **Adapter Rings** — spacers and adapters for non-standard fittings

**Each product card shows:**
- Product image/render
- Name and brief description
- Available colours (colour swatches)
- Size range / "Custom dimensions available"
- "Request Quote" button

### 2.2 Product Detail View
- Larger product images (multiple angles)
- Full description and use cases
- Dimensions specification table
- Colour options displayed as visual swatches with PLA colour names
- Material info (PLA, quality, durability notes)
- "Request Custom Size" CTA
- Related products section

### 2.3 Product Data Structure
Replace `posts.json` / `downloads.json` with `products.json`:
```json
{
  "products": [
    {
      "id": "lamp-ring-standard",
      "name": "Standard Lamp Space Ring",
      "category": "lamp-rings",
      "description": "Precision-fitted space ring for standard lamp holders",
      "dimensions": { "inner_min": 28, "inner_max": 45, "outer_min": 40, "outer_max": 70, "unit": "mm" },
      "colours": ["white", "black", "grey", "cream", "blue", "red", "green"],
      "images": ["lamp-ring-1.jpg", "lamp-ring-2.jpg"],
      "features": ["Custom dimensions available", "Multiple PLA colours", "Precision tolerance ±0.2mm"],
      "price_note": "From £5 — exact price depends on dimensions"
    }
  ]
}
```

---

## Phase 3: Custom Orders & Colour Showcase

### 3.1 Custom Orders Page
Dedicated page highlighting the bespoke service:
- **"We Make It To Your Exact Size"** — headline
- Step-by-step ordering process:
  1. Measure your fitting (with a simple guide/diagram)
  2. Choose your colour from our PLA palette
  3. Submit dimensions via the contact form
  4. Receive a quote within 24 hours
  5. We print and ship your custom ring
- Measurement guide with diagrams (inner diameter, outer diameter, height)
- FAQ section (tolerances, material durability, lead times)

### 3.2 PLA Colour Showcase
A visual colour palette section (reusable across pages):
- Grid of colour swatches with names
- Each swatch: circular sample + colour name + notes (e.g., "UV resistant", "matte finish")
- Example colours: White, Black, Light Grey, Dark Grey, Cream, Warm White, Sky Blue, Navy, Red, Forest Green, Orange, Yellow, etc.
- Note that custom colour matching is available on request

---

## Phase 4: Contact Form & Communication

### 4.1 Contact Form
Since this is a static site (GitHub Pages), use one of these approaches:
- **Formspree** (free tier: 50 submissions/month) — easiest, no backend needed
- **Netlify Forms** — if migrating hosting later
- **EmailJS** — sends email directly from browser

**Form fields:**
- Name (required)
- Email (required)
- Phone (optional)
- Order type: dropdown (Standard Product / Custom Dimensions / General Enquiry)
- Product interest: dropdown (Lamp Rings / Roof Light Inserts / Adapters / Other)
- Dimensions: text field for inner diameter, outer diameter, height
- Preferred colour(s)
- Quantity
- Message / additional details
- Submit button

### 4.2 Contact Information Section
- Business email address
- Response time commitment ("We reply within 24 hours")
- Location/service area
- Social media links (if applicable)

---

## Phase 5: About Page & Trust Building

### 5.1 Rework About Page
- Business story and expertise
- Emphasise precision engineering background
- 3D printing process explanation (brief, visual)
- Quality assurance — tolerances, material quality
- Photo of workspace/printer (adds authenticity)

### 5.2 Trust Elements (Throughout Site)
- Customer testimonials section (can start with placeholder, add real ones later)
- "Why Choose Us" section with icons:
  - Precision: ±0.2mm tolerance
  - Choice: 15+ PLA colours
  - Custom: Any dimension, made to order
  - Fast: Quick turnaround times
  - Quality: Durable PLA material

---

## Phase 6: Polish & Professional Touches

### 6.1 Visual Rebrand
- Update colour scheme to match business brand (suggest: clean white + accent colour)
- Professional product photography style (consistent backgrounds)
- Update typography if needed (keep clean sans-serif)
- Add subtle product-themed decorative elements

### 6.2 SEO & Metadata
- Update page titles and meta descriptions for each page
- Add structured data (Product schema) for Google rich results
- Optimise image alt tags
- Create sitemap entries for product pages

### 6.3 Responsive Polish
- Ensure product grid looks great on mobile
- Touch-friendly colour swatch selection
- Mobile-optimised contact form
- Fast loading (optimise images)

---

## Technical Approach

### What We Keep
- Jekyll static site generation (free GitHub Pages hosting)
- React SPA architecture (dynamic, smooth navigation)
- Responsive layout system (sidebar + mobile nav)
- CSS styling system (adapt the glass aesthetic)
- Icon system (Lucide icons — has relevant icons like `ruler`, `settings`, `wrench`)

### What We Replace
- Blog posts → Product listings
- Journal archive → Product catalogue with filters
- Downloads page → Custom orders page
- Blog filtering → Product category filtering
- Post detail view → Product detail view

### What We Add
- `products.json` — product data
- `colours.json` — PLA colour palette data
- Contact form (via Formspree or similar)
- Colour swatch components
- Measurement guide content
- Product image assets

### New File Structure
```
_data/
  colours.yml          # PLA colour palette
  products.yml         # Product definitions (Jekyll processes → products.json)
  ui.yml               # Updated navigation and UI text
assets/
  images/
    products/          # Product photography
    colours/           # Colour swatch images (optional)
    guides/            # Measurement diagrams
products.json          # Generated product feed
main.js               # Reworked React app
styles.css            # Updated styling
index.html            # Updated SPA shell
```

---

## Implementation Priority

| Priority | Task | Effort |
|----------|------|--------|
| 1 | Home page with hero + branding | Medium |
| 2 | Product catalogue page with sample products | Medium |
| 3 | Product detail view | Medium |
| 4 | Contact form (Formspree) | Low |
| 5 | Custom orders page | Medium |
| 6 | PLA colour showcase | Low |
| 7 | About page rework | Low |
| 8 | Mobile polish | Low |
| 9 | SEO + metadata | Low |

---

## Notes
- All hosting remains **free** via GitHub Pages
- No database needed — all product data in JSON/YAML files
- Contact form via free Formspree tier (50 submissions/month)
- Can add e-commerce later (Stripe, Snipcart) if needed
- Product images can be real photos or clean 3D renders
