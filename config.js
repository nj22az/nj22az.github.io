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
    role: "Field Service Engineer",
    location: "Southeast Asia",
    bio: "Marine engineer turned field service engineer with a background in maritime operations, precision material testing systems, and industrial commissioning. Used to working independently in complex technical environments, I combine hands-on engineering experience with structured execution and strong cross-cultural awareness.",
    photo: "/assets/images/nils-profile.jpg",
    social: {
      github: "https://github.com/nj22az",
      linkedin: "https://www.linkedin.com/in/nils-johansson-86744583",
      etsy: "https://www.etsy.com/shop/Colonialclub",
      wordpress: "https://theofficeofnils.wordpress.com",
    },
  },

  navigation: [
    { id: "home", label: "Home" },
    { id: "projects", label: "Projects" },
    { id: "journal", label: "Journal" },
    { id: "guestbook", label: "Guestbook" },
    { id: "about", label: "About" },
  ],

  projects: [
    {
      title: "GitHub",
      description:
        "Open-source projects, tools, and code experiments. Browse repositories, contributions, and engineering side projects.",
      url: "https://github.com/nj22az",
      icon: "github",
      tags: ["Code", "Open Source", "Projects"],
      featured: true,
    },
    {
      title: "LinkedIn",
      description:
        "Professional profile, career history, and industry connections. Field service engineering across maritime and industrial sectors.",
      url: "https://www.linkedin.com/in/nils-johansson-86744583",
      icon: "linkedin",
      tags: ["Career", "Networking", "Engineering"],
      featured: true,
    },
    {
      title: "Etsy Shop",
      description:
        "Curated digital products and templates built from real engineering workflows and field deployments.",
      url: "https://www.etsy.com/shop/Colonialclub",
      icon: "store",
      tags: ["Templates", "Digital Products", "Shop"],
      featured: true,
    },
    {
      title: "WordPress Blog",
      description:
        "Long-form technical dispatches and cultural reflections from engineering deployments around the world.",
      url: "https://theofficeofnils.wordpress.com",
      icon: "wordpress",
      tags: ["Writing", "Engineering", "Travel"],
      featured: true,
    },
  ],

  /** Giscus configuration — powered by GitHub Discussions */
  giscus: {
    repo: "nj22az/nj22az.github.io",
    repoId: "",
    category: "General",
    categoryId: "",
    mapping: "pathname",
    reactionsEnabled: "1",
    emitMetadata: "0",
    inputPosition: "top",
    lang: "en",
    loading: "lazy",
  },

  /** WordPress API for journal feed */
  wordpressApi:
    "https://public-api.wordpress.com/wp/v2/sites/theofficeofnils.wordpress.com/posts",

  /**
   * Inline SVG logo — rubber-stamp seal style.
   * Uses currentColor for theme adaptability.
   * @param {number} size - width/height in px
   */
  logo: function (size) {
    var s = size || 40;
    return '<svg viewBox="0 0 200 200" width="' + s + '" height="' + s + '" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The Office of Nils Johansson">' +
      '<circle cx="100" cy="100" r="96" stroke="currentColor" stroke-width="3"/>' +
      '<circle cx="100" cy="100" r="84" stroke="currentColor" stroke-width="1.5"/>' +
      '<path id="arcTop" d="M 40 100 A 60 60 0 0 1 160 100" fill="none"/>' +
      '<text font-family="Nunito, system-ui, sans-serif" font-weight="700" font-size="14" fill="currentColor" letter-spacing="3">' +
        '<textPath href="#arcTop" startOffset="50%" text-anchor="middle">THE OFFICE OF</textPath>' +
      '</text>' +
      '<text x="100" y="108" font-family="Nunito, system-ui, sans-serif" font-weight="800" font-size="19" fill="currentColor" text-anchor="middle" letter-spacing="1.5">NILS</text>' +
      '<text x="100" y="130" font-family="Nunito, system-ui, sans-serif" font-weight="800" font-size="19" fill="currentColor" text-anchor="middle" letter-spacing="1.5">JOHANSSON</text>' +
      '<line x1="65" y1="137" x2="135" y2="137" stroke="currentColor" stroke-width="1" opacity="0.4"/>' +
      '<text x="100" y="155" font-family="Nunito, system-ui, sans-serif" font-weight="600" font-size="9" fill="currentColor" text-anchor="middle" letter-spacing="4" opacity="0.6">EST. MMXXIV</text>' +
    '</svg>';
  },

  // Inline SVG icon paths (SF Symbols / Lucide style, 24x24 viewBox)
  icons: {
    github:
      "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4M9 18c-4.51 2-5-2-7-2",
    linkedin:
      "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2ZM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    store:
      "M4 7V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3M2 7h20l-1.5 9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2ZM12 11v4M8 11v4M16 11v4",
    wordpress:
      "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 3.1A7 7 0 0 0 5.1 12H5l3.5 9.6A7.96 7.96 0 0 1 4 12c0-2.5 1.1-4.7 2.9-6.2L11 17.5ZM12 20a8 8 0 0 1-2.2-.3l2.3-6.7 2.4 6.5c0 .1.1.1.1.2A7.7 7.7 0 0 1 12 20Zm1-14.9c.4 0 .8-.1.8-.1.4 0 .3-.5 0-.5 0 0-1.1.1-1.8.1-.7 0-1.8-.1-1.8-.1-.4 0-.4.6 0 .5 0 0 .4.1.7.1l1 2.8-1.5 4.4L8.7 5.3c.4 0 .8-.1.8-.1.4 0 .3-.5 0-.5 0 0-1.1.1-1.8.1h-.5A8 8 0 0 1 19.9 11h-.2c-.7 0-1.2.6-1.2 1.3 0 .6.3 1.1.7 1.7.3.5.6 1.1.6 2 0 .6-.2 1.4-.6 2.3l-.7 2.5L15 12.3Z",
    etsy:
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2ZM9 16V8h5.5v1.5H10.5V11h3v1.5h-3V14.5H15V16Z",
    notebook:
      "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20M8 7h6M8 11h4",
    messageCircle:
      "M7.9 20A9 9 0 1 0 4 16.1L2 22Z",
    arrow:
      "M5 12h14M12 5l7 7-7 7",
    menu: "M4 6h16M4 12h16M4 18h16",
    close: "M18 6 6 18M6 6l12 12",
    external: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
    sun: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z",
  },
};
