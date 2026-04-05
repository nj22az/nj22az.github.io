/**
 * shared.js — Navigation, footer, theme toggle, smooth scrolling.
 * Include config.js before this file on every page.
 */

(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }

  /** Render an inline SVG icon from CONFIG.icons */
  function icon(name) {
    var d = CONFIG.icons[name];
    if (!d) return "";
    return '<svg fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">' +
      '<path d="' + d + '"/></svg>';
  }

  /* ── Theme ── */

  var THEME_KEY = "nj-theme";
  var DESIGN_VER = "nj-design-v2";

  // One-time migration: reset dark preference from old design
  if (!localStorage.getItem(DESIGN_VER)) {
    localStorage.removeItem(THEME_KEY);
    localStorage.setItem(DESIGN_VER, "1");
  }

  function getTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    var btn = $("#theme-toggle");
    if (!btn) return;
    btn.innerHTML = theme === "dark" ? icon("sun") : icon("moon");
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }

  applyTheme(getTheme());

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
  }

  /* ── Navigation — green circle hamburger + overlay ── */

  var navIcons = { home: "home", projects: "notebook", journal: "wordpress", about: "user", locations: "mappin" };

  function buildNav() {
    var nav = $("#site-nav");
    if (!nav) return;
    nav.classList.add("site-nav");

    var isHome = (location.pathname === "/" || location.pathname === "/index.html");

    nav.innerHTML =
      '<div class="nav-inner">' +
        '<a href="/" class="nav-brand logo-seal">' + CONFIG.navLogo(34) + '</a>' +
        '<div class="nav-actions">' +
          '<button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">' +
            icon(getTheme() === "dark" ? "sun" : "moon") +
          '</button>' +
          '<button id="nav-hamburger" class="nav-hamburger" aria-label="Open menu">' +
            icon("menu") +
          '</button>' +
        '</div>' +
      '</div>';

    // Full-screen overlay menu
    var overlay = document.createElement("div");
    overlay.className = "menu-overlay";
    overlay.id = "menu-overlay";

    var menuRows = CONFIG.navigation.map(function (n) {
      var href = isHome ? "#" + n.id : "/#" + n.id;
      var iconName = navIcons[n.id] || "arrow";
      return '<a href="' + href + '" class="menu-row">' +
        '<span class="menu-row-icon">' + icon(iconName) + '</span>' +
        '<span class="menu-row-label">' + n.label + '</span>' +
        '<span class="menu-row-arrow">' + icon("arrow") + '</span>' +
      '</a>';
    }).join("");

    var socialLinks = Object.keys(CONFIG.author.social).map(function (key) {
      return '<a href="' + CONFIG.author.social[key] + '" target="_blank" rel="noopener" class="menu-row">' +
        '<span class="menu-row-icon">' + icon(key) + '</span>' +
        '<span class="menu-row-label">' + key.charAt(0).toUpperCase() + key.slice(1) + '</span>' +
        '<span class="menu-row-arrow">' + icon("external") + '</span>' +
      '</a>';
    }).join("");

    overlay.innerHTML =
      '<div class="menu-overlay-header">' +
        '<a href="/" class="nav-brand logo-seal">' + CONFIG.navLogo(34) + '</a>' +
        '<button id="menu-close" class="nav-hamburger" aria-label="Close menu">' +
          icon("close") +
        '</button>' +
      '</div>' +
      '<div class="menu-overlay-body">' +
        menuRows +
        socialLinks +
      '</div>' +
      '<div class="menu-overlay-footer">' +
        '<a href="#projects" class="menu-cta menu-cta-primary">View Projects</a>' +
        '<a href="#about" class="menu-cta menu-cta-secondary">About Me</a>' +
      '</div>';

    document.body.appendChild(overlay);

    var hamburger = $("#nav-hamburger");
    var closeBtn = overlay.querySelector("#menu-close");

    function openMenu() {
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeMenu() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    hamburger.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);

    overlay.querySelectorAll(".menu-row, .menu-cta").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    $("#theme-toggle").addEventListener("click", function () {
      applyTheme(getTheme() === "dark" ? "light" : "dark");
    });

    window.addEventListener("scroll", function () {
      nav.classList.toggle("scrolled", window.scrollY > 20);
    }, { passive: true });
  }

  /* ── Footer ── */

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

  /* ── Smooth Scrolling ── */

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

  /* ── Init ── */

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

  window.siteIcon = icon;

})();
