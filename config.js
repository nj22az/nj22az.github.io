/**
 * Site Configuration
 * All hardcoded values, project data, and UI strings in one place.
 */

const CONFIG = {
  site: {
    title: "The Office of Nils Johansson",
    tagline: "Engineer. Builder. Explorer.",
    description:
      "A digital hub for field engineering projects, technical writing, and tools built from real-world deployments.",
    url: "https://nj22az.github.io",
    copyright: "\u00A9 " + new Date().getFullYear() + " Nils Johansson",
  },

  author: {
    name: "Nils Johansson",
    role: "Field Service Engineer (Marine Engineer)",
    location: "Southeast Asia",
    bio: "Marine engineer turned field service engineer with a background in maritime operations, precision material testing systems, and industrial commissioning. Used to working independently in complex technical environments, I combine hands-on engineering experience with structured execution and strong cross-cultural awareness.",
    photo: "/assets/images/nils-profile.jpg",
    social: {
      github: "https://github.com/nj22az",
      linkedin: "https://www.linkedin.com/in/nils-johansson-86744583",
      etsy: "https://www.etsy.com/shop/Colonialclub",
      wordpress: "https://theofficeofnils.wordpress.com",
    },
    locations: [
      {
        name: "\u00d6rebro",
        label: "Sweden",
        embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63295.76!2d15.18!3d59.27!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x465c14e0b5e1b8a1%3A0x4020b28f4020b20!2s%C3%96rebro%2C%20Sweden!5e0!3m2!1sen!2s!4v1",
      },
      {
        name: "Nam Phuoc",
        label: "Vietnam",
        embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15350.0!2d108.27!3d15.85!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142b1a8c7fbc96f%3A0x3b7e9c7f9a8c1d3e!2sNam%20Ph%C6%B0%E1%BB%9Bc%2C%20Duy%20Xuy%C3%AAn%2C%20Quang%20Nam%2C%20Vietnam!5e0!3m2!1sen!2s!4v1",
      },
    ],
    schedule: {
      title: "Availability",
      subtitle: "Schedule",
      currentLocation: { town: "Örebro", country: "Sweden" },
      note: "Times shown in local time zones. Subject to project assignments.",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      rows: [
        { time: "08:00 \u2013 12:00", slots: [true, true, true, true, true, false, false] },
        { time: "13:00 \u2013 17:00", slots: [true, true, true, true, true, false, false] },
      ],
    },
  },

  navigation: [
    { id: "home", label: "Home" },
    { id: "projects", label: "Projects" },
    { id: "journal", label: "Journal" },
    { id: "about", label: "About" },
    { id: "locations", label: "Locations" },
  ],

  projects: [
    {
      title: "GitHub",
      description:
        "Open-source projects, tools, and code experiments. Browse repositories, contributions, and engineering side projects.",
      url: "https://github.com/nj22az",
      icon: "github",
      tags: ["Code", "Open Source", "Projects"],
      bento: "wide",
      featured: true,
    },
    {
      title: "LinkedIn",
      description:
        "Professional profile, career history, and industry connections. Field service engineering across maritime and industrial sectors.",
      url: "https://www.linkedin.com/in/nils-johansson-86744583",
      icon: "linkedin",
      tags: ["Career", "Networking", "Engineering"],
      bento: "normal",
      featured: true,
    },
    {
      title: "Etsy Shop",
      description:
        "Curated digital products and templates built from real engineering workflows and field deployments.",
      url: "https://www.etsy.com/shop/Colonialclub",
      icon: "store",
      tags: ["Templates", "Digital Products", "Shop"],
      bento: "normal",
      featured: true,
    },
    {
      title: "WordPress Blog",
      description:
        "Long-form technical dispatches and cultural reflections from engineering deployments around the world.",
      url: "https://theofficeofnils.wordpress.com",
      icon: "wordpress",
      tags: ["Writing", "Engineering", "Travel"],
      bento: "wide",
      featured: true,
    },
  ],

  /** WordPress API for journal feed */
  wordpressApi:
    "https://public-api.wordpress.com/wp/v2/sites/theofficeofnils.wordpress.com/posts",

  /**
   * Inline SVG logo — rubber-stamp seal style.
   * Uses currentColor for theme adaptability.
   * @param {number} size - width/height in px
   */
  /** Rectangular nav logo — wide, readable at nav bar height */
  navLogo: function (h) {
    var height = h || 32;
    var width = Math.round(height * 5.6);
    return '<svg viewBox="0 0 280 50" width="' + width + '" height="' + height + '" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The Office of Nils Johansson">' +
      '<rect x="1.5" y="1.5" width="277" height="47" rx="8" stroke="currentColor" stroke-width="2"/>' +
      '<text x="140" y="21" font-family="Nunito, system-ui, sans-serif" font-weight="600" font-size="11" fill="currentColor" text-anchor="middle" letter-spacing="3.5">THE OFFICE OF</text>' +
      '<text x="140" y="38" font-family="Nunito, system-ui, sans-serif" font-weight="800" font-size="14" fill="currentColor" text-anchor="middle" letter-spacing="2.5">NILS JOHANSSON</text>' +
    '</svg>';
  },

  /** Circular seal logo — for hero and about sections */
  logo: (function () {
    var _id = 0;
    return function (size) {
      var s = size || 120;
      var uid = "seal" + (++_id);
      return '<svg viewBox="0 0 200 200" width="' + s + '" height="' + s + '" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The Office of Nils Johansson">' +
        '<defs><path id="' + uid + '" d="M 40 100 A 60 60 0 0 1 160 100"/></defs>' +
        '<circle cx="100" cy="100" r="96" stroke="currentColor" stroke-width="3"/>' +
        '<circle cx="100" cy="100" r="84" stroke="currentColor" stroke-width="1.5"/>' +
        '<text font-family="Nunito, system-ui, sans-serif" font-weight="700" font-size="14" fill="currentColor" letter-spacing="3">' +
          '<textPath href="#' + uid + '" startOffset="50%" text-anchor="middle">THE OFFICE OF</textPath>' +
        '</text>' +
        '<text x="100" y="108" font-family="Nunito, system-ui, sans-serif" font-weight="800" font-size="19" fill="currentColor" text-anchor="middle" letter-spacing="1.5">NILS</text>' +
        '<text x="100" y="130" font-family="Nunito, system-ui, sans-serif" font-weight="800" font-size="19" fill="currentColor" text-anchor="middle" letter-spacing="1.5">JOHANSSON</text>' +
        '<line x1="65" y1="137" x2="135" y2="137" stroke="currentColor" stroke-width="1" opacity="0.4"/>' +
        '<text x="100" y="155" font-family="Nunito, system-ui, sans-serif" font-weight="600" font-size="9" fill="currentColor" text-anchor="middle" letter-spacing="4" opacity="0.6">EST. MMXI</text>' +
      '</svg>';
    };
  })(),

  // Inline SVG icon paths (SF Symbols / Lucide style, 24x24 viewBox)
  icons: {
    github:
      "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4M9 18c-4.51 2-5-2-7-2",
    linkedin:
      "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2ZM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    store:
      "M4 7V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3M2 7h20l-1.5 9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2ZM12 11v4M8 11v4M16 11v4",
    wordpress:
      "M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5ZM15 5l4 4",
    etsy:
      "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0",
    notebook:
      "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20M8 7h6M8 11h4",
    arrow:
      "M5 12h14M12 5l7 7-7 7",
    menu: "M4 6h16M4 12h16M4 18h16",
    close: "M18 6 6 18M6 6l12 12",
    external: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
    sun: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z",
    home: "M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    leaf: "M12 22V8M12 8C12 8 7 3 2 3c0 5 4 9 10 13M12 8c0 0 5-5 10-5 0 5-4 9-10 13",
    plus: "M12 5v14M5 12h14",
    mappin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  },
};
