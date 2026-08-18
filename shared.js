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
  var DESIGN_VER = "nj-design-v3";
  var THEMES = [
    {
      id: "cobalt",
      label: "Cobalt",
      description: "Cobalt editorial",
      colors: ["#343ec9", "#ffffff", "#3affff"],
      browserColor: "#343ec9"
    },
    {
      id: "mossy",
      label: "Mossy",
      description: "Friendly green",
      colors: ["#06c755", "#ffffff", "#000000"],
      browserColor: "#06c755"
    },
    {
      id: "cute",
      label: "Cute",
      description: "Pastel friendship",
      colors: ["#8bd0dd", "#e383a8", "#cda1dc"],
      browserColor: "#8bd0dd"
    },
    {
      id: "colorgrid",
      label: "Colorgrid",
      description: "Modular curiosity",
      colors: ["#5dadd1", "#3eb088", "#e76654"],
      browserColor: "#5dadd1"
    },
    {
      id: "crimson",
      label: "Crimson",
      description: "Confident red",
      colors: ["#f00000", "#faf9f5", "#e6001e"],
      browserColor: "#f00000"
    },
    {
      id: "inkcraft",
      label: "Inkcraft",
      description: "Precise stationery",
      colors: ["#002f9e", "#e9edf1", "#ffffff"],
      browserColor: "#002f9e"
    },
    {
      id: "clarity",
      label: "Clarity",
      description: "Quiet precision",
      colors: ["#333333", "#f2f2f2", "#ffffff"],
      browserColor: "#333333"
    },
    {
      id: "horizon",
      label: "Horizon",
      description: "Editorial blue",
      colors: ["#0065bd", "#f3f5fa", "#37b1de"],
      browserColor: "#0065bd"
    },
    {
      id: "swift",
      label: "Swift",
      description: "Energetic yellow",
      colors: ["#ffd700", "#007aff", "#212121"],
      browserColor: "#ffd700"
    },
    {
      id: "botanical",
      label: "Botanical",
      description: "Warm and vivid",
      colors: ["#ffd500", "#fafaef", "#272727"],
      browserColor: "#ffd500"
    },
    {
      id: "popwave",
      label: "Popwave",
      description: "Vivid magenta",
      colors: ["#f2157f", "#ffffff", "#f3f3f3"],
      browserColor: "#f2157f"
    }
  ];

  // One-time migration marker retained for earlier collections.
  if (!localStorage.getItem(DESIGN_VER)) {
    localStorage.setItem(DESIGN_VER, "1");
  }

  function getTheme() {
    if (window.NJThemeVisit) return window.NJThemeVisit.get();

    var storedTheme = localStorage.getItem(THEME_KEY);
    if (THEMES.some(function (theme) { return theme.id === storedTheme; })) return storedTheme;
    return THEMES[Math.floor(Math.random() * THEMES.length)].id;
  }

  function applyTheme(theme) {
    var selectedTheme = THEMES.find(function (item) { return item.id === theme; }) || THEMES[0];
    document.documentElement.setAttribute("data-theme", selectedTheme.id);
    if (window.NJThemeVisit) {
      window.NJThemeVisit.remember(selectedTheme.id);
    } else {
      localStorage.setItem(THEME_KEY, selectedTheme.id);
    }
    var themeColor = $('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", selectedTheme.browserColor);
    updateThemeControls(selectedTheme);
  }

  function updateThemeControls(selectedTheme) {
    var currentLabel = $("#theme-current");
    if (currentLabel) currentLabel.textContent = selectedTheme.label;

    document.querySelectorAll(".theme-disclosure-mark i").forEach(function (bar, index) {
      bar.style.background = selectedTheme.colors[index] || selectedTheme.colors[0];
    });

    document.querySelectorAll(".theme-option").forEach(function (button) {
      var isActive = button.getAttribute("data-theme-value") === selectedTheme.id;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-checked", isActive ? "true" : "false");
    });
  }

  applyTheme(getTheme());

  /* ── Navigation — theme-aware hamburger + overlay ── */

  var navIcons = { home: "home", projects: "notebook", journal: "wordpress", about: "user", locations: "mappin" };

  function buildNav() {
    var nav = $("#site-nav");
    if (!nav) return;
    nav.classList.add("site-nav");
    nav.setAttribute("aria-label", "Primary navigation");

    var isHome = (location.pathname === "/" || location.pathname === "/index.html");
    var navLinks = CONFIG.navigation.filter(function (item) { return item.id !== "home"; }).map(function (item) {
      var href = isHome ? "#" + item.id : "/#" + item.id;
      return '<a class="nav-link" href="' + href + '">' + item.label + '</a>';
    }).join("");

    nav.innerHTML =
      '<div class="nav-inner">' +
        '<a href="/" class="nav-brand logo-seal">' + CONFIG.navLogo(34) + '</a>' +
        '<div class="nav-links">' + navLinks + '</div>' +
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
    overlay.setAttribute("aria-hidden", "true");

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
                '<span class="theme-disclosure-label">Appearance</span>' +
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
        overlay.setAttribute("aria-hidden", "true");
        backdrop.classList.remove("open");
        document.body.classList.remove("menu-open");
        hamburger.innerHTML = icon("menu");
        hamburger.setAttribute("aria-label", "Open menu");
        hamburger.setAttribute("aria-expanded", "false");
        closeThemeSwitcher();
      } else {
        overlay.classList.add("open");
        overlay.setAttribute("aria-hidden", "false");
        backdrop.classList.add("open");
        document.body.classList.add("menu-open");
        hamburger.innerHTML = icon("close");
        hamburger.setAttribute("aria-label", "Close menu");
        hamburger.setAttribute("aria-expanded", "true");
      }
    }
    function closeMenu() {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
      backdrop.classList.remove("open");
      document.body.classList.remove("menu-open");
      hamburger.innerHTML = icon("menu");
      hamburger.setAttribute("aria-label", "Open menu");
      hamburger.setAttribute("aria-expanded", "false");
      closeThemeSwitcher();
    }

    hamburger.addEventListener("click", toggleMenu);
    backdrop.addEventListener("click", closeMenu);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && overlay.classList.contains("open")) {
        closeMenu();
        hamburger.focus();
      }
    });

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
      var label = key.charAt(0).toUpperCase() + key.slice(1);
      return '<a href="' + CONFIG.author.social[key] + '" target="_blank" rel="noopener">' + label + '</a>';
    }).join("");

    var footerNav = CONFIG.navigation.filter(function (item) { return item.id !== "home"; }).map(function (item) {
      return '<a href="/#' + item.id + '">' + item.label + '</a>';
    }).join("");

    footer.innerHTML =
      '<div class="footer-inner">' +
        '<div class="footer-identity">' +
          '<strong>' + CONFIG.site.title + '</strong>' +
          '<span>' + CONFIG.site.footerTagline + '</span>' +
        '</div>' +
        '<div class="footer-columns">' +
          '<nav class="footer-nav" aria-label="Footer navigation">' + footerNav + '</nav>' +
          '<nav class="footer-links" aria-label="Social links">' + socialLinks + '</nav>' +
        '</div>' +
        '<div class="footer-bottom"><span>' + CONFIG.site.copyright + '</span><a href="#main-content">Back to top &uarr;</a></div>' +
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
