/**
 * shared.js — Shared navigation, footer, and theme toggle.
 * Include config.js before this file on every page.
 *
 * Usage:
 *   <script src="/config.js"></script>
 *   <script src="/shared.js"></script>
 *
 * Expects these elements in the page:
 *   <nav id="site-nav"></nav>
 *   <footer id="site-footer"></footer>
 */

(function () {
  "use strict";

  /* ── Helpers ── */

  function $(sel) { return document.querySelector(sel); }

  /** Render an inline SVG icon from CONFIG.icons */
  function icon(name) {
    var d = CONFIG.icons[name];
    if (!d) return "";
    return '<svg fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">' +
      '<path d="' + d + '"/></svg>';
  }

  /* ══════════════════════════════════════════
     THEME: dark by default, toggle persisted
     ══════════════════════════════════════════ */

  var THEME_KEY = "nj-theme";

  /** Read stored preference or default to "dark" */
  function getTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return "dark";
  }

  /** Apply theme to <html> */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    updateToggleIcon(theme);
  }

  /** Swap the sun/moon icon inside the toggle button */
  function updateToggleIcon(theme) {
    var btn = $("#theme-toggle");
    if (!btn) return;
    // Sun icon for dark mode (click to go light), moon for light mode (click to go dark)
    btn.innerHTML = theme === "dark" ? icon("sun") : icon("moon");
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }

  // Apply immediately to prevent flash
  applyTheme(getTheme());

  /* ══════════════════════════════════════════
     NAVIGATION (injected into #site-nav)
     ══════════════════════════════════════════ */

  function buildNav() {
    var nav = $("#site-nav");
    if (!nav) return;
    nav.classList.add("site-nav");

    // Determine which nav links to show based on current page
    var isHome = (location.pathname === "/" || location.pathname === "/index.html");
    var navIcons = { home: "home", projects: "notebook", journal: "wordpress", about: "user" };
    var links = CONFIG.navigation.map(function (n) {
      var href = isHome ? "#" + n.id : "/#" + n.id;
      return '<a href="' + href + '" class="nav-link">' +
        icon(navIcons[n.id] || "") +
        '<span>' + n.label + '</span></a>';
    });

    nav.innerHTML =
      '<div class="nav-inner">' +
        '<a href="/" class="nav-brand logo-seal">' + CONFIG.navLogo(34) + '</a>' +
        '<div class="nav-links">' + links.join("") + '</div>' +
        '<div class="nav-actions">' +
          '<button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">' +
            icon(getTheme() === "dark" ? "sun" : "moon") +
          '</button>' +
          '<button id="mobile-menu-btn" class="mobile-menu-btn" aria-label="Menu">' +
            '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">' +
              '<path id="menu-icon-path" d="' + CONFIG.icons.menu + '"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
      '</div>';

    // Mobile dropdown (appended after nav)
    var mobileMenu = document.createElement("div");
    mobileMenu.className = "mobile-menu";
    mobileMenu.id = "mobile-menu";
    mobileMenu.innerHTML = CONFIG.navigation.map(function (n) {
      var href = isHome ? "#" + n.id : "/#" + n.id;
      return '<a href="' + href + '" class="mobile-nav-link">' +
        icon(navIcons[n.id] || "") +
        '<span>' + n.label + '</span></a>';
    }).join("");
    nav.parentNode.insertBefore(mobileMenu, nav.nextSibling);

    /* ── Theme toggle ── */
    $("#theme-toggle").addEventListener("click", function () {
      var next = getTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
    });

    /* ── Mobile menu toggle ── */
    var menuBtn = $("#mobile-menu-btn");
    var menuPath = $("#menu-icon-path");
    var menuOpen = false;

    menuBtn.addEventListener("click", function () {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle("open", menuOpen);
      menuPath.setAttribute("d", menuOpen ? CONFIG.icons.close : CONFIG.icons.menu);
    });

    mobileMenu.querySelectorAll(".mobile-nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        menuOpen = false;
        mobileMenu.classList.remove("open");
        menuPath.setAttribute("d", CONFIG.icons.menu);
      });
    });

    /* ── Scroll border effect ── */
    window.addEventListener("scroll", function () {
      nav.classList.toggle("scrolled", window.scrollY > 20);
    }, { passive: true });

    /* ── Active section highlighting (homepage only) ── */
    var isHomePage = (location.pathname === "/" || location.pathname === "/index.html");
    if (isHomePage) {
      var sections = CONFIG.navigation.map(function (n) {
        return document.getElementById(n.id);
      }).filter(Boolean);

      var navLinks = nav.querySelectorAll(".nav-link");
      var mobileLinks = document.querySelectorAll(".mobile-nav-link");

      var sectionObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + id);
          });
          mobileLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + id);
          });
        });
      }, { threshold: 0.3, rootMargin: "-56px 0px 0px 0px" });

      sections.forEach(function (s) { sectionObs.observe(s); });
    }
  }

  /* ══════════════════════════════════════════
     FOOTER (injected into #site-footer)
     ══════════════════════════════════════════ */

  function buildFooter() {
    var footer = $("#site-footer");
    if (!footer) return;

    var socialLinks = Object.keys(CONFIG.author.social).map(function (key) {
      return '<a href="' + CONFIG.author.social[key] + '" target="_blank" rel="noopener">' + key + '</a>';
    }).join("");

    footer.innerHTML =
      '<div class="footer-inner">' +
        '<span>' + CONFIG.site.copyright + '</span>' +
        '<div class="footer-links">' + socialLinks + '</div>' +
      '</div>';
  }

  /* ══════════════════════════════════════════
     SMOOTH SCROLLING (for anchor links)
     ══════════════════════════════════════════ */

  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", link.getAttribute("href"));
      }
    });
  }

  /* ══════════════════════════════════════════
     INIT — run when DOM is ready
     ══════════════════════════════════════════ */

  function init() {
    buildNav();
    buildFooter();
    initSmoothScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ── Expose icon helper for page-specific scripts ── */
  window.siteIcon = icon;

})();
