/**
 * shop.js — Navigation, footer, theme toggle, product rendering, order form.
 * Include config.js before this file.
 */

(function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }

  /** Render an inline SVG icon from SHOP.icons */
  function icon(name) {
    var d = SHOP.icons[name];
    if (!d) return "";
    return '<svg fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">' +
      '<path d="' + d + '"/></svg>';
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

  /* ── Navigation ── */

  var navIcons = { home: "home", products: "cube", "how-it-works": "package", about: "user" };

  function buildNav() {
    var nav = $("#site-nav");
    if (!nav) return;
    nav.classList.add("site-nav");

    nav.innerHTML =
      '<div class="nav-inner">' +
        '<a href="/shop/" class="nav-brand logo-seal">' + SHOP.navLogo(34) + '</a>' +
        '<div class="nav-actions">' +
          '<button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">' +
            icon(getTheme() === "dark" ? "sun" : "moon") +
          '</button>' +
          '<button id="nav-hamburger" class="nav-hamburger" aria-label="Open menu">' +
            icon("menu") +
          '</button>' +
        '</div>' +
      '</div>';

    // Overlay menu
    var overlay = document.createElement("div");
    overlay.className = "menu-overlay";
    overlay.id = "menu-overlay";

    var menuRows = SHOP.navigation.map(function (n) {
      var href = "#" + n.id;
      var iconName = navIcons[n.id] || "arrow";
      return '<a href="' + href + '" class="menu-row">' +
        '<span class="menu-row-icon" data-icon="' + iconName + '">' + icon(iconName) + '</span>' +
        '<span class="menu-row-label">' + n.label + '</span>' +
        '<span class="menu-row-arrow">' + icon("arrow") + '</span>' +
      '</a>';
    }).join("");

    overlay.innerHTML = '<div class="menu-overlay-body">' + menuRows + '</div>';
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
    footer.innerHTML =
      '<div class="footer-inner">' +
        '<span>' + SHOP.site.copyright + '</span>' +
        '<span style="font-size:0.75rem;">Payment via Swish</span>' +
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

  /* ── Email assembly (never stored as single string in source) ── */

  function _addr() {
    return SHOP._a + String.fromCharCode(64) + SHOP._b + String.fromCharCode(46) + SHOP._c;
  }

  /* ── Product rendering ── */

  function renderProducts() {
    var grid = $("#product-grid");
    if (!grid) return;

    grid.innerHTML = SHOP.products.map(function (p) {
      var imgHtml;
      if (p.image) {
        imgHtml = '<img src="' + p.image + '" alt="' + p.title + '" loading="lazy">';
      } else {
        imgHtml = icon("cube");
      }

      var badge = p.featured ? '<span class="product-badge">Popular</span>' : '';

      var tags = p.tags.map(function (t) {
        return '<span class="tag">' + t + '</span>';
      }).join("");

      return '<div class="product-card reveal">' +
        '<div class="product-image">' + imgHtml + badge + '</div>' +
        '<div class="product-body">' +
          '<h3 class="product-title">' + p.title + '</h3>' +
          '<p class="product-desc">' + p.description + '</p>' +
          '<div class="product-tags">' + tags + '</div>' +
          '<div class="product-footer">' +
            '<span class="product-price">' + p.price + ' <span class="currency">' + SHOP.site.currency + '</span></span>' +
            '<button class="product-order-btn" data-product="' + p.id + '">' +
              icon("mail") + ' Order' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");
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
      productNameEl.textContent = product.title + " — " + product.price + " " + SHOP.site.currency;
      productInput.value = product.title;
      modal.classList.add("open");
      modalBackdrop.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.remove("open");
      modalBackdrop.classList.remove("open");
      document.body.style.overflow = "";
    }

    // Delegate clicks on order buttons
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".product-order-btn");
      if (btn) {
        e.preventDefault();
        openModal(btn.dataset.product);
      }
    });

    modal.querySelector(".modal-close").addEventListener("click", closeModal);
    modalBackdrop.addEventListener("click", closeModal);

    // ESC key closes modal
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });

    // Form submission — constructs mailto link at runtime
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.querySelector("#order-name").value.trim();
      var email = form.querySelector("#order-email").value.trim();
      var phone = form.querySelector("#order-phone").value.trim();
      var product = form.querySelector("#order-product").value;
      var qty = form.querySelector("#order-qty").value;
      var message = form.querySelector("#order-message").value.trim();

      var subject = encodeURIComponent("Order: " + product);
      var body = encodeURIComponent(
        "Hi JNJ 3D Printing!\n\n" +
        "I would like to order:\n\n" +
        "Product: " + product + "\n" +
        "Quantity: " + qty + "\n\n" +
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Phone: " + (phone || "Not provided") + "\n\n" +
        (message ? "Message:\n" + message + "\n\n" : "") +
        "Looking forward to hearing from you!"
      );

      // Assemble address at the moment of click only
      window.location.href = "mail" + "to:" + _addr() + "?subject=" + subject + "&body=" + body;

      closeModal();
      form.reset();
    });
  }

  /* ── Scroll-triggered reveals ── */

  function initReveals() {
    var items = document.querySelectorAll(".product-card, .step-card, .section-header, .shop-about-layout, .hero-photo");
    items.forEach(function (el) { el.classList.add("reveal"); });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { obs.observe(el); });
  }

  /* ── Init ── */

  function init() {
    buildNav();
    buildFooter();
    initSmoothScroll();
    renderProducts();
    initOrderModal();
    initReveals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.shopIcon = icon;

})();
