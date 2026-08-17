/**
 * shared.js — Navigation, footer, theme switcher, smooth scrolling.
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
  var THEMES = [
    {
      id: "popeye",
      label: "POPEYE",
      description: "Cobalt editorial",
      colors: ["#343ec9", "#ffffff", "#3affff"],
      browserColor: "#343ec9"
    },
    {
      id: "line",
      label: "LINE",
      description: "Friendly messenger",
      colors: ["#06c755", "#ffffff", "#000000"],
      browserColor: "#06c755"
    },
    {
      id: "sanrio",
      label: "Sanrio",
      description: "Pastel friendship",
      colors: ["#8bd0dd", "#e383a8", "#cda1dc"],
      browserColor: "#8bd0dd"
    },
    {
      id: "kokuyo",
      label: "KOKUYO",
      description: "Modular curiosity",
      colors: ["#5dadd1", "#3eb088", "#e76654"],
      browserColor: "#5dadd1"
    }
  ];

  // One-time migration: reset dark preference from old design
  if (!localStorage.getItem(DESIGN_VER)) {
    localStorage.removeItem(THEME_KEY);
    localStorage.setItem(DESIGN_VER, "1");
  }

  function getTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (THEMES.some(function (theme) { return theme.id === stored; })) return stored;
    return THEMES[0].id;
  }

  function applyTheme(theme) {
    var selectedTheme = THEMES.find(function (item) { return item.id === theme; }) || THEMES[0];
    document.documentElement.setAttribute("data-theme", selectedTheme.id);
    localStorage.setItem(THEME_KEY, selectedTheme.id);
    var themeColor = $('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", selectedTheme.browserColor);
    updateThemeControls(selectedTheme);
  }

  function updateThemeControls(selectedTheme) {
    var currentLabel = $("#theme-current");
    if (currentLabel) currentLabel.textContent = selectedTheme.label;

    document.querySelectorAll(".theme-option").forEach(function (button) {
      var isActive = button.getAttribute("data-theme-value") === selectedTheme.id;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-checked", isActive ? "true" : "false");
    });
  }

  applyTheme(getTheme());

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
          '<button id="nav-hamburger" class="nav-hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="menu-overlay">' +
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
        '<span class="menu-row-icon" data-icon="' + iconName + '">' + icon(iconName) + '</span>' +
        '<span class="menu-row-label">' + n.label + '</span>' +
        '<span class="menu-row-arrow">' + icon("arrow") + '</span>' +
      '</a>';
    }).join("");

    var themeOptions = THEMES.map(function (theme, index) {
      var swatches = theme.colors.map(function (color) {
        return '<span class="theme-swatch" style="background:' + color + '"></span>';
      }).join("");

      return '<button class="theme-option" type="button" role="radio" aria-checked="false" data-theme-value="' + theme.id + '">' +
        '<span class="theme-option-number">' + String(index + 1).padStart(2, "0") + '</span>' +
        '<span class="theme-option-copy">' +
          '<span class="theme-option-name">' + theme.label + '</span>' +
          '<span class="theme-option-description">' + theme.description + '</span>' +
        '</span>' +
        '<span class="theme-swatches" aria-hidden="true">' + swatches + '</span>' +
        '<span class="theme-option-check" aria-hidden="true"></span>' +
      '</button>';
    }).join("");

    overlay.innerHTML =
      '<div class="menu-overlay-body">' +
        menuRows +
        '<div class="menu-theme">' +
          '<button id="theme-disclosure" class="theme-disclosure" type="button" aria-expanded="false" aria-controls="theme-options">' +
            '<span class="theme-disclosure-main">' +
              '<span class="theme-disclosure-mark" aria-hidden="true"><i></i><i></i><i></i></span>' +
              '<span class="theme-disclosure-copy">' +
                '<span class="theme-disclosure-label">Theme</span>' +
                '<span id="theme-current" class="theme-disclosure-value"></span>' +
              '</span>' +
            '</span>' +
            '<span class="theme-chevron" aria-hidden="true"></span>' +
          '</button>' +
          '<div id="theme-options" class="theme-options">' +
            '<div class="theme-options-inner" role="radiogroup" aria-label="Theme">' + themeOptions + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    // Backdrop for click-outside-to-close
    var backdrop = document.createElement("div");
    backdrop.className = "menu-backdrop";
    backdrop.id = "menu-backdrop";
    document.body.appendChild(backdrop);

    var hamburger = $("#nav-hamburger");
    var themeDisclosure = $("#theme-disclosure");
    var themeOptionsPanel = $("#theme-options");

    function closeThemeSwitcher() {
      themeOptionsPanel.classList.remove("open");
      themeDisclosure.setAttribute("aria-expanded", "false");
    }

    function toggleMenu() {
      var isOpen = overlay.classList.contains("open");
      if (isOpen) {
        overlay.classList.remove("open");
        backdrop.classList.remove("open");
        hamburger.innerHTML = icon("menu");
        hamburger.setAttribute("aria-label", "Open menu");
        hamburger.setAttribute("aria-expanded", "false");
        closeThemeSwitcher();
      } else {
        overlay.classList.add("open");
        backdrop.classList.add("open");
        hamburger.innerHTML = icon("close");
        hamburger.setAttribute("aria-label", "Close menu");
        hamburger.setAttribute("aria-expanded", "true");
      }
    }
    function closeMenu() {
      overlay.classList.remove("open");
      backdrop.classList.remove("open");
      hamburger.innerHTML = icon("menu");
      hamburger.setAttribute("aria-label", "Open menu");
      hamburger.setAttribute("aria-expanded", "false");
      closeThemeSwitcher();
    }

    hamburger.addEventListener("click", toggleMenu);
    backdrop.addEventListener("click", closeMenu);

    overlay.querySelectorAll(".menu-row, .menu-cta").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    themeDisclosure.addEventListener("click", function () {
      var isOpen = themeOptionsPanel.classList.toggle("open");
      themeDisclosure.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    themeOptionsPanel.querySelectorAll(".theme-option").forEach(function (button) {
      button.addEventListener("click", function () {
        applyTheme(button.getAttribute("data-theme-value"));
      });
    });

    updateThemeControls(THEMES.find(function (theme) { return theme.id === getTheme(); }) || THEMES[0]);

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
