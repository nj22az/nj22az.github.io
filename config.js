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
    copyright: `\u00A9 ${new Date().getFullYear()} Nils Johansson`,
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
      wordpress: "https://theofficeofnils.wordpress.com",
    },
  },

  navigation: [
    { id: "home", label: "Home" },
    { id: "projects", label: "Projects" },
    { id: "journal", label: "Journal" },
    { id: "about", label: "About" },
  ],

  projects: [
    {
      title: "Hotel Assessment Journal",
      description:
        "AI-powered hotel assessment tool that generates in-depth critical reports and builds a personal database of travel reviews.",
      url: "/hotel-assessment/",
      icon: "building",
      tags: ["React", "TypeScript", "Gemini AI"],
      featured: true,
    },
    {
      title: "Field Operations Blog",
      description:
        "Technical dispatches and cultural reflections from live engineering deployments around the world.",
      url: "/blog/",
      icon: "notebook",
      tags: ["Writing", "Engineering", "Travel"],
      featured: true,
    },
    {
      title: "CV Template",
      description:
        "A clean, professional resume template designed for engineers transitioning between industries.",
      url: "/assets/downloads/cv-template.pdf",
      icon: "document",
      tags: ["PDF", "Career", "Template"],
      featured: false,
    },
    {
      title: "Project Checklist",
      description:
        "Pre-deployment checklist for field service projects to ensure nothing critical is missed.",
      url: "/assets/downloads/project-checklist.txt",
      icon: "clipboard",
      tags: ["Operations", "Workflow", "Template"],
      featured: false,
    },
  ],

  // Inline SVG icon paths (SF Symbols / Lucide style, 24x24 viewBox)
  icons: {
    building:
      "M3 21V3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v18M3 21h10M13 21V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12M13 21h8M7 7h2M7 11h2M7 15h2M17 13h2M17 17h2",
    notebook:
      "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20M8 7h6M8 11h4",
    document:
      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M10 13h4M10 17h4M8 9h2",
    clipboard:
      "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1ZM12 11h4M12 16h4M8 11h.01M8 16h.01",
    github:
      "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4M9 18c-4.51 2-5-2-7-2",
    linkedin:
      "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2ZM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    wordpress:
      "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 3.1A7 7 0 0 0 5.1 12H5l3.5 9.6A7.96 7.96 0 0 1 4 12c0-2.5 1.1-4.7 2.9-6.2L11 17.5ZM12 20a8 8 0 0 1-2.2-.3l2.3-6.7 2.4 6.5c0 .1.1.1.1.2A7.7 7.7 0 0 1 12 20Zm1-14.9c.4 0 .8-.1.8-.1.4 0 .3-.5 0-.5 0 0-1.1.1-1.8.1-.7 0-1.8-.1-1.8-.1-.4 0-.4.6 0 .5 0 0 .4.1.7.1l1 2.8-1.5 4.4L8.7 5.3c.4 0 .8-.1.8-.1.4 0 .3-.5 0-.5 0 0-1.1.1-1.8.1h-.5A8 8 0 0 1 19.9 11h-.2c-.7 0-1.2.6-1.2 1.3 0 .6.3 1.1.7 1.7.3.5.6 1.1.6 2 0 .6-.2 1.4-.6 2.3l-.7 2.5L15 12.3Z",
    arrow:
      "M5 12h14M12 5l7 7-7 7",
    menu: "M4 6h16M4 12h16M4 18h16",
    close: "M18 6 6 18M6 6l12 12",
    external: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
    sun: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z",
  },
};
