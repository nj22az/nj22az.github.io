/**
 * shop.js — Bilingual shop with automatic Sweden detection.
 * Include config.js before this file.
 */

(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function icon(name) {
    var d = SHOP.icons[name];
    if (!d) return "";
    return '<svg fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">' +
      '<path d="' + d + '"/></svg>';
  }

  /* ── Language detection ── */

  var LANG_KEY = "shop-lang";

  function isInSweden() {
    // Timezone check (most reliable non-intrusive signal)
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === "Europe/Stockholm") return true;
    } catch (e) { /* noop */ }

    // Browser language
    var langs = [];
    if (navigator.languages && navigator.languages.length) langs = navigator.languages;
    else if (navigator.language) langs = [navigator.language];

    for (var i = 0; i < langs.length; i++) {
      var l = (langs[i] || "").toLowerCase();
      if (l.indexOf("sv") === 0 || l === "sv-se" || l.indexOf("-se") > -1) return true;
    }

    return false;
  }

  function detectLang() {
    // If Sweden detected → force Swedish (overrides manual pref per request)
    if (isInSweden()) return "sv";

    // Otherwise respect stored preference, else default to English
    var stored = localStorage.getItem(LANG_KEY);
    if (stored === "sv" || stored === "en") return stored;
    return "en";
  }

  var currentLang = detectLang();

  function t(key) {
    var dict = SHOP.i18n[currentLang] || SHOP.i18n.en;
    return dict[key] != null ? dict[key] : key;
  }

  function setLang(newLang) {
    if (newLang !== "sv" && newLang !== "en") return;
    // In Sweden, stay in Swedish even if manually toggled (per request).
    // But we still allow a toggle to work once, so users can see the English version on request.
    localStorage.setItem(LANG_KEY, newLang);
    currentLang = newLang;
    applyLanguage();
  }

  /* ── Theme ── */

  var THEME_KEY = "nj-theme";

  function getTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    var btn = $("#theme-toggle");
    if (btn) {
      btn.innerHTML = theme === "dark" ? icon("sun") : icon("moon");
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  applyTheme(getTheme());

  /* ── Nav logo (text SVG, switches with language) ── */

  function navLogoSvg(h) {
    var height = h || 34;
    var width = Math.round(height * 5.6);
    var line1 = "JONSSON'S";
    var line2 = currentLang === "sv" ? "ANSLAGSTAVLA" : "BOARD";
    var fontSize2 = currentLang === "sv" ? 11 : 14;
    var letterSpacing2 = currentLang === "sv" ? 2 : 2.5;
    return '<svg viewBox="0 0 280 50" width="' + width + '" height="' + height + '" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Jonsson\'s ' + line2 + '">' +
      '<rect x="1.5" y="1.5" width="277" height="47" rx="8" stroke="currentColor" stroke-width="2"/>' +
      '<text x="140" y="21" font-family="Nunito, system-ui, sans-serif" font-weight="600" font-size="11" fill="currentColor" text-anchor="middle" letter-spacing="3.5">' + line1 + '</text>' +
      '<text x="140" y="38" font-family="Nunito, system-ui, sans-serif" font-weight="800" font-size="' + fontSize2 + '" fill="currentColor" text-anchor="middle" letter-spacing="' + letterSpacing2 + '">' + line2 + '</text>' +
    '</svg>';
  }

  /* ── Navigation ── */

  var navIcons = { home: "home", products: "cube", "how-it-works": "package", about: "user" };

  function buildNav() {
    var nav = $("#site-nav");
    if (!nav) return;
    nav.classList.add("site-nav");

    nav.innerHTML =
      '<div class="nav-inner">' +
        '<a href="/shop/" class="nav-brand logo-seal" id="nav-brand">' + navLogoSvg(34) + '</a>' +
        '<div class="nav-actions">' +
          '<button id="lang-toggle" class="lang-toggle" aria-label="' + t("langToggleLabel") + '">' +
            '<span class="lang-toggle-label">' + t("langToggle") + '</span>' +
          '</button>' +
          '<button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">' +
            icon(getTheme() === "dark" ? "sun" : "moon") +
          '</button>' +
          '<button id="nav-hamburger" class="nav-hamburger" aria-label="Open menu">' +
            icon("menu") +
          '</button>' +
        '</div>' +
      '</div>';

    var overlay = document.createElement("div");
    overlay.className = "menu-overlay";
    overlay.id = "menu-overlay";

    var navItems = [
      { id: "home", key: "navHome" },
      { id: "products", key: "navProducts" },
      { id: "how-it-works", key: "navHowItWorks" },
      { id: "about", key: "navAbout" },
    ];

    overlay.innerHTML = '<div class="menu-overlay-body">' + navItems.map(function (n) {
      var iconName = navIcons[n.id] || "arrow";
      return '<a href="#' + n.id + '" class="menu-row">' +
        '<span class="menu-row-icon" data-icon="' + iconName + '">' + icon(iconName) + '</span>' +
        '<span class="menu-row-label" data-i18n="' + n.key + '">' + t(n.key) + '</span>' +
        '<span class="menu-row-arrow">' + icon("arrow") + '</span>' +
      '</a>';
    }).join("") + '</div>';

    document.body.appendChild(overlay);

    var backdrop = document.createElement("div");
    backdrop.className = "menu-backdrop";
    backdrop.id = "menu-backdrop";
    document.body.appendChild(backdrop);

    var hamburger = $("#nav-hamburger");

    function toggleMenu() {
      var isOpen = overlay.classList.contains("open");
      if (isOpen) {
        overlay.classList.remove("open");
        backdrop.classList.remove("open");
        hamburger.innerHTML = icon("menu");
      } else {
        overlay.classList.add("open");
        backdrop.classList.add("open");
        hamburger.innerHTML = icon("close");
      }
    }
    function closeMenu() {
      overlay.classList.remove("open");
      backdrop.classList.remove("open");
      hamburger.innerHTML = icon("menu");
    }

    hamburger.addEventListener("click", toggleMenu);
    backdrop.addEventListener("click", closeMenu);
    overlay.querySelectorAll(".menu-row").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    $("#theme-toggle").addEventListener("click", function () {
      var next = getTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
    });

    $("#lang-toggle").addEventListener("click", function () {
      setLang(currentLang === "sv" ? "en" : "sv");
    });

    window.addEventListener("scroll", function () {
      nav.classList.toggle("scrolled", window.scrollY > 20);
    }, { passive: true });
  }

  /* ── Footer ── */

  function buildFooter() {
    var footer = $("#site-footer");
    if (!footer) return;
    footer.innerHTML =
      '<div class="footer-inner">' +
        '<span>\u00A9 ' + new Date().getFullYear() + ' ' + t("siteTitle") + '</span>' +
        '<span style="font-size:0.75rem;" data-i18n="footerPayment">' + t("footerPayment") + '</span>' +
      '</div>';
  }

  /* ── Smooth scroll ── */

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

  /* ── Email — assembled at runtime ── */

  function _addr() {
    return SHOP._a + String.fromCharCode(64) + SHOP._b + String.fromCharCode(46) + SHOP._c;
  }

  /* ── Product rendering ── */

  function formatPrice(amount) {
    // Swedish: "149 kr"  /  English: "149 SEK"
    var currency = currentLang === "sv" ? "kr" : "SEK";
    var grouped = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F"); // thin space
    return grouped + ' <span class="currency">' + currency + '</span>';
  }

  function renderProducts() {
    var grid = $("#product-grid");
    if (!grid) return;

    grid.innerHTML = SHOP.products.map(function (p) {
      var imgHtml = p.image
        ? '<img src="' + p.image + '" alt="' + p.title[currentLang] + '" loading="lazy">'
        : '<div class="product-image-placeholder">' + icon("cube") + '</div>';

      var badge = p.featured ? '<span class="product-badge" data-i18n="popularBadge">' + t("popularBadge") + '</span>' : '';

      return '<div class="product-card reveal" data-product="' + p.id + '" role="button" tabindex="0">' +
        '<div class="product-image">' + imgHtml + badge + '</div>' +
        '<div class="product-body">' +
          '<h3 class="product-title">' + p.title[currentLang] + '</h3>' +
          '<div class="product-footer">' +
            '<span class="product-price">' + formatPrice(p.price) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");
  }

  /* ── Steps (How to Order) ── */

  function renderSteps() {
    var grid = $("#steps-grid");
    if (!grid) return;
    var steps = [
      { icon: "cube",    titleKey: "step1Title", descKey: "step1Desc" },
      { icon: "mail",    titleKey: "step2Title", descKey: "step2Desc" },
      { icon: "swish",   titleKey: "step3Title", descKey: "step3Desc" },
      { icon: "package", titleKey: "step4Title", descKey: "step4Desc" },
    ];
    grid.innerHTML = steps.map(function (s, i) {
      return '<div class="step-card reveal">' +
        '<div class="step-number">' + (i + 1) + '</div>' +
        '<div class="step-icon">' + icon(s.icon) + '</div>' +
        '<h3 class="step-title">' + t(s.titleKey) + '</h3>' +
        '<p class="step-desc">' + t(s.descKey) + '</p>' +
      '</div>';
    }).join("");
  }

  /* ── Apply language to all static content ── */

  function applyLanguage() {
    var dict = SHOP.i18n[currentLang];
    document.documentElement.setAttribute("lang", dict.htmlLang);
    document.title = dict.siteTitle + " \u2014 " + dict.siteSubtitle;

    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", dict.metaDescription);

    // Nav brand swap
    var brand = $("#nav-brand");
    if (brand) brand.innerHTML = navLogoSvg(34);

    // Lang toggle label
    var langBtn = $("#lang-toggle");
    if (langBtn) {
      langBtn.innerHTML = '<span class="lang-toggle-label">' + dict.langToggle + '</span>';
      langBtn.setAttribute("aria-label", dict.langToggleLabel);
    }

    // Any element with data-i18n → replace textContent (except ones with data-i18n-html)
    $$("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = dict[key];
      if (val == null) return;
      if (el.hasAttribute("data-i18n-html")) el.innerHTML = val;
      else el.textContent = val;
    });

    // Placeholders
    $$("[data-i18n-ph]").forEach(function (el) {
      var val = dict[el.getAttribute("data-i18n-ph")];
      if (val != null) el.setAttribute("placeholder", val);
    });

    // Re-render dynamic grids
    renderProducts();
    renderSteps();
    buildFooter();

    // Re-bind reveal observers on new nodes
    initReveals();
  }

  /* ── Order modal ── */

  function initOrderModal() {
    var modalBackdrop = $("#modal-backdrop");
    var modal = $("#order-modal");
    if (!modal || !modalBackdrop) return;

    var productNameEl = modal.querySelector(".modal-product-name");
    var productInput = modal.querySelector("#order-product");
    var form = modal.querySelector("#order-form");

    function openModal(productId) {
      var product = SHOP.products.find(function (p) { return p.id === productId; });
      if (!product) return;
      var title = product.title[currentLang];
      var curr = currentLang === "sv" ? "kr" : "SEK";
      productNameEl.textContent = title + " \u2014 " + product.price + " " + curr;
      productInput.value = title;
      modal.classList.add("open");
      modalBackdrop.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.remove("open");
      modalBackdrop.classList.remove("open");
      document.body.style.overflow = "";
    }

    document.addEventListener("click", function (e) {
      var card = e.target.closest(".product-card[data-product]");
      if (card) {
        e.preventDefault();
        openModal(card.dataset.product);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var card = e.target.closest && e.target.closest(".product-card[data-product]");
      if (card) {
        e.preventDefault();
        openModal(card.dataset.product);
      }
    });

    modal.querySelector(".modal-close").addEventListener("click", closeModal);
    modalBackdrop.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var dict = SHOP.i18n[currentLang];

      var name = form.querySelector("#order-name").value.trim();
      var email = form.querySelector("#order-email").value.trim();
      var phone = form.querySelector("#order-phone").value.trim();
      var product = form.querySelector("#order-product").value;
      var qty = form.querySelector("#order-qty").value;
      var message = form.querySelector("#order-message").value.trim();

      var subject = encodeURIComponent(dict.mailSubject + ": " + product);
      var body = encodeURIComponent(
        dict.mailGreeting + "\n\n" +
        dict.mailIntro + "\n\n" +
        dict.mailProduct + ": " + product + "\n" +
        dict.mailQty + ": " + qty + "\n\n" +
        dict.mailName + ": " + name + "\n" +
        dict.mailEmail + ": " + email + "\n" +
        dict.mailPhone + ": " + (phone || dict.mailPhoneEmpty) + "\n\n" +
        (message ? dict.mailMessage + ":\n" + message + "\n\n" : "") +
        dict.mailClose
      );

      window.location.href = "mail" + "to:" + _addr() + "?subject=" + subject + "&body=" + body;

      closeModal();
      form.reset();
    });
  }

  /* ── Reveals ── */

  var revealObserver;
  function initReveals() {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("visible"); revealObserver.unobserve(e.target); }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    }
    $$(".product-card, .step-card, .section-header, .shop-about-layout, .hero-photo").forEach(function (el) {
      if (!el.classList.contains("reveal")) el.classList.add("reveal");
      if (!el.classList.contains("visible")) revealObserver.observe(el);
    });
  }

  /* ── Init ── */

  function init() {
    buildNav();
    buildFooter();
    initSmoothScroll();
    initOrderModal();
    applyLanguage(); // renders products, steps, translates everything
    initReveals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.shopIcon = icon;

})();
