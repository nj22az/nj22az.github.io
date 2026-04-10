/**
 * JNJ 3D Printing — Shop Configuration
 * Products, branding, and site data.
 */

var SHOP = {
  site: {
    title: "JNJ 3D Printing",
    tagline: "Custom 3D Printed Products",
    description:
      "Quality 3D printed products made in Sweden. From practical everyday items to custom designs — printed with care by JNJ 3D Printing.",
    copyright: "\u00A9 " + new Date().getFullYear() + " JNJ 3D Printing",
    currency: "SEK",
    payment: "Swish",
  },

  about: {
    name: "JNJ 3D Printing",
    location: "\u00d6rebro, Sweden",
    bio: "We are neighbours who share a passion for 3D printing. From our workshop in \u00d6rebro, Sweden, we design and print practical, beautiful products for everyday life. Every item is printed to order with care and attention to detail. Got a custom idea? We\u2019d love to hear it.",
  },

  navigation: [
    { id: "home", label: "Home" },
    { id: "products", label: "Products" },
    { id: "how-it-works", label: "How to Order" },
    { id: "about", label: "About" },
  ],

  /**
   * Email protection — assembled at runtime, never in plain text.
   * Change these values to your real email parts:
   *   _a = username, _b = domain, _c = tld
   *   Result: _a@_b._c
   */
  _a: "order",
  _b: "jnj3dprinting",
  _c: "se",

  products: [
    {
      id: "phone-stand",
      title: "Phone Stand",
      description: "Elegant angled stand for any smartphone. Perfect for your desk, kitchen counter, or bedside table.",
      price: 149,
      image: null,
      tags: ["Desk", "Practical"],
      featured: true,
    },
    {
      id: "desk-organizer",
      title: "Desk Organizer",
      description: "Multi-compartment organizer for pens, cables, and small items. Keep your workspace tidy.",
      price: 249,
      image: null,
      tags: ["Desk", "Storage"],
      featured: true,
    },
    {
      id: "cable-clips",
      title: "Cable Management Clips",
      description: "Set of 6 adhesive cable clips. Route and organize your charging cables neatly.",
      price: 89,
      image: null,
      tags: ["Practical", "Set of 6"],
      featured: false,
    },
    {
      id: "headphone-stand",
      title: "Headphone Stand",
      description: "Minimalist headphone holder that looks great on any desk. Sturdy and stable design.",
      price: 179,
      image: null,
      tags: ["Desk", "Audio"],
      featured: true,
    },
    {
      id: "geometric-planter",
      title: "Geometric Planter",
      description: "Modern geometric planter with integrated drip tray. Perfect for succulents and small plants.",
      price: 169,
      image: null,
      tags: ["Home", "Plants"],
      featured: true,
    },
    {
      id: "wall-hooks",
      title: "Wall Hook Set",
      description: "Set of 3 decorative wall hooks. Strong, lightweight, and easy to mount. Great for keys, bags, or coats.",
      price: 99,
      image: null,
      tags: ["Home", "Set of 3"],
      featured: false,
    },
    {
      id: "custom-keychain",
      title: "Custom Keychain",
      description: "Personalized keychain with your name or short text. A unique gift or everyday carry item.",
      price: 59,
      image: null,
      tags: ["Gift", "Custom"],
      featured: false,
    },
    {
      id: "business-card-holder",
      title: "Business Card Holder",
      description: "Clean, professional card holder for your desk. Holds a full stack of standard business cards.",
      price: 79,
      image: null,
      tags: ["Desk", "Professional"],
      featured: false,
    },
    {
      id: "plant-pot",
      title: "Ribbed Plant Pot",
      description: "Ribbed cylindrical pot with drainage hole and matching saucer. Available in multiple sizes.",
      price: 129,
      image: null,
      tags: ["Home", "Plants"],
      featured: true,
    },
    {
      id: "custom-nameplate",
      title: "Custom Name Plate",
      description: "Desktop or door name plate with your text. Perfect for home offices or as a personalized gift.",
      price: 119,
      image: null,
      tags: ["Custom", "Gift"],
      featured: true,
    },
    {
      id: "soap-dish",
      title: "Soap Dish",
      description: "Draining soap dish with raised ridges. Keeps your soap dry and your bathroom tidy.",
      price: 69,
      image: null,
      tags: ["Home", "Bathroom"],
      featured: false,
    },
    {
      id: "bookend-set",
      title: "Bookend Set",
      description: "Pair of modern bookends with a geometric design. Heavy enough to support a full shelf.",
      price: 199,
      image: null,
      tags: ["Home", "Set of 2"],
      featured: false,
    },
  ],

  /** Rectangular nav logo */
  navLogo: function (h) {
    var height = h || 32;
    var width = Math.round(height * 5.6);
    return '<svg viewBox="0 0 280 50" width="' + width + '" height="' + height + '" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="JNJ 3D Printing">' +
      '<rect x="1.5" y="1.5" width="277" height="47" rx="8" stroke="currentColor" stroke-width="2"/>' +
      '<text x="140" y="21" font-family="Nunito, system-ui, sans-serif" font-weight="600" font-size="11" fill="currentColor" text-anchor="middle" letter-spacing="3.5">JNJ</text>' +
      '<text x="140" y="38" font-family="Nunito, system-ui, sans-serif" font-weight="800" font-size="14" fill="currentColor" text-anchor="middle" letter-spacing="2.5">3D PRINTING</text>' +
    '</svg>';
  },

  /** Circular seal logo */
  logo: (function () {
    var _id = 0;
    return function (size) {
      var s = size || 120;
      var uid = "seal" + (++_id);
      return '<svg viewBox="0 0 200 200" width="' + s + '" height="' + s + '" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="JNJ 3D Printing">' +
        '<defs><path id="' + uid + '" d="M 40 100 A 60 60 0 0 1 160 100"/></defs>' +
        '<circle cx="100" cy="100" r="96" stroke="currentColor" stroke-width="3"/>' +
        '<circle cx="100" cy="100" r="84" stroke="currentColor" stroke-width="1.5"/>' +
        '<text font-family="Nunito, system-ui, sans-serif" font-weight="700" font-size="14" fill="currentColor" letter-spacing="3">' +
          '<textPath href="#' + uid + '" startOffset="50%" text-anchor="middle">JNJ</textPath>' +
        '</text>' +
        '<text x="100" y="108" font-family="Nunito, system-ui, sans-serif" font-weight="800" font-size="19" fill="currentColor" text-anchor="middle" letter-spacing="1.5">3D</text>' +
        '<text x="100" y="130" font-family="Nunito, system-ui, sans-serif" font-weight="800" font-size="19" fill="currentColor" text-anchor="middle" letter-spacing="1.5">PRINTING</text>' +
        '<line x1="65" y1="137" x2="135" y2="137" stroke="currentColor" stroke-width="1" opacity="0.4"/>' +
        '<text x="100" y="155" font-family="Nunito, system-ui, sans-serif" font-weight="600" font-size="9" fill="currentColor" text-anchor="middle" letter-spacing="4" opacity="0.6">\u00d6REBRO \u2022 SWEDEN</text>' +
      '</svg>';
    };
  })(),

  icons: {
    printer3d:
      "M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6Z",
    cart:
      "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
    package:
      "M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
    swish:
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2ZM8 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm8-4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Z",
    check:
      "M20 6 9 17l-5-5",
    mail:
      "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Zm16 2-8 5-8-5",
    phone:
      "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z",
    home: "M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    arrow: "M5 12h14M12 5l7 7-7 7",
    menu: "M4 6h16M4 12h16M4 18h16",
    close: "M18 6 6 18M6 6l12 12",
    sun: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z",
    leaf: "M12 22V8M12 8C12 8 7 3 2 3c0 5 4 9 10 13M12 8c0 0 5-5 10-5 0 5-4 9-10 13",
    mappin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    external: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
    cube: "M21 16.5V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8.5a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73ZM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z",
  },
};
