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

    var marketplaces = (SHOP.marketplaces || []).map(function (m) {
      if (m.url && m.url.trim()) {
        return '<li><a href="' + m.url + '" target="_blank" rel="noopener">' + m.name + '</a></li>';
      }
      return '<li><span class="footer-coming">' + m.name + '</span> <em class="footer-coming-tag">' + t("footerComingSoon") + '</em></li>';
    }).join("");

    var main = SHOP.mainSite || { url: "https://nj22az.github.io/", label: "nj22az.github.io" };

    footer.innerHTML =
      '<div class="footer-inner">' +
        '<div class="footer-cols">' +
          '<div class="footer-col footer-col-brand">' +
            '<div class="footer-brand-title">' + t("siteTitle") + '</div>' +
            '<p class="footer-brand-tagline">' + t("footerTagline") + '</p>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4 class="footer-col-title">' + t("footerShopCol") + '</h4>' +
            '<ul class="footer-links-list">' + marketplaces + '</ul>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4 class="footer-col-title">' + t("footerMoreCol") + '</h4>' +
            '<ul class="footer-links-list">' +
              '<li><a href="/shop/privacy/">' + t("footerPrivacy") + '</a></li>' +
              '<li><a href="' + main.url + '">' + t("footerBackToMain") + ' ' + main.label + '</a></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>\u00A9 ' + new Date().getFullYear() + ' ' + t("siteTitle") + '</span>' +
          '<span>' + t("footerPayment") + '</span>' +
        '</div>' +
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

  /* ── Filter / search state ── */

  var activeCategory = "all";
  var searchQuery = "";

  function getFilteredProducts() {
    var products = SHOP.products || [];
    return products.filter(function (p) {
      if (activeCategory !== "all" && p.category !== activeCategory) return false;
      if (searchQuery) {
        var q = searchQuery.toLowerCase();
        var title = (p.title[currentLang] || "").toLowerCase();
        var desc = (p.description[currentLang] || "").toLowerCase();
        if (title.indexOf(q) === -1 && desc.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function renderCategoryPills() {
    var bar = $("#filter-pills");
    if (!bar) return;
    var cats = [{ id: "all", sv: t("filterAll"), en: t("filterAll") }].concat(SHOP.categories || []);
    bar.innerHTML = cats.map(function (c) {
      var label = c[currentLang] || c.en || c.id;
      var active = c.id === activeCategory ? " active" : "";
      return '<button class="filter-pill' + active + '" data-cat="' + c.id + '" type="button">' + label + '</button>';
    }).join("");
  }

  /* ── Product rendering ── */

  function renderProducts() {
    var grid = $("#product-grid");
    if (!grid) return;

    var products = getFilteredProducts();
    var empty = $("#product-empty");

    if (!products.length) {
      grid.innerHTML = "";
      if (empty) { empty.textContent = t("noResults"); empty.hidden = false; }
    } else {
      if (empty) empty.hidden = true;

      grid.innerHTML = products.map(function (p) {
        var imgHtml = p.image
          ? '<img src="' + p.image + '" alt="' + p.title[currentLang] + '" loading="lazy">'
          : icon("cube");

        var badge = p.featured ? '<span class="product-badge">' + t("popularBadge") + '</span>' : '';

        var tags = (p.tags[currentLang] || []).map(function (tg) {
          return '<span class="tag">' + tg + '</span>';
        }).join("");

        return '<div class="product-card reveal">' +
          '<div class="product-image">' + imgHtml + badge + '</div>' +
          '<div class="product-body">' +
            '<h3 class="product-title">' + p.title[currentLang] + '</h3>' +
            '<p class="product-desc">' + p.description[currentLang] + '</p>' +
            '<div class="product-tags">' + tags + '</div>' +
            '<div class="product-footer">' +
              '<span class="product-price">' + p.price + ' <span class="currency">' + SHOP.currency + '</span></span>' +
              '<button class="product-order-btn" data-product="' + p.id + '">' +
                icon("mail") + ' <span>' + t("orderBtn") + '</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join("");
    }

    renderCustomCard();
  }

  /* ── Custom order card — always present below the grid ── */

  function renderCustomCard() {
    var slot = $("#custom-order-slot");
    if (!slot) return;
    slot.innerHTML =
      '<div class="custom-card">' +
        '<div class="custom-card-icon">' + icon("package") + '</div>' +
        '<h3 class="custom-card-title">' + t("customTitle") + '</h3>' +
        '<p class="custom-card-desc">' + t("customDesc") + '</p>' +
        '<button class="btn-primary custom-order-btn" type="button">' +
          '<span>' + t("customBtn") + '</span>' +
          '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
        '</button>' +
      '</div>';
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
    renderCategoryPills();
    renderProducts();
    renderSteps();
    buildFooter();

    // Update search placeholder
    var searchInput = document.getElementById("product-search");
    if (searchInput) searchInput.setAttribute("placeholder", dict.searchPlaceholder || "");

    // Refresh open modal (shipping labels, total, submit copy all depend on lang)
    if (typeof window.shopRefreshModal === "function") window.shopRefreshModal();

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
    var shippingSelect = modal.querySelector("#order-shipping");
    var shippingGroup = shippingSelect ? shippingSelect.closest(".form-group") : null;
    var qtySelect = modal.querySelector("#order-qty");
    var totalRow = modal.querySelector(".order-total-row");
    var totalValueEl = modal.querySelector("#order-total-value");
    var submitBtn = modal.querySelector("#order-submit");
    var submitLabel = modal.querySelector(".form-submit-label");
    var mailtoNote = modal.querySelector(".form-note:not(.form-note-stripe)");
    var stripeNote = modal.querySelector("#order-stripe-note");
    var form = modal.querySelector("#order-form");

    var currentOrderContext = null; // { product, custom }

    function useStripe() {
      return !!(SHOP.stripePublishableKey && SHOP.stripePublishableKey.trim());
    }

    function formatAmount(amount) {
      var currency = currentLang === "sv" ? "kr" : "SEK";
      return amount + "\u00A0" + currency;
    }

    function populateShipping(product) {
      if (!shippingSelect || !shippingGroup) return;
      if (!product) {
        // Custom orders: hide shipping — quoted later by reply
        shippingGroup.style.display = "none";
        return;
      }
      shippingGroup.style.display = "";
      var options = (SHOP.shippingOptions || []).filter(function (o) {
        return !o.classes || o.classes.indexOf(product.shipping_class) !== -1;
      });
      shippingSelect.innerHTML = options.map(function (o) {
        var label = (o.label && o.label[currentLang]) || o.id;
        var price = o.price > 0 ? " \u2014 " + formatAmount(o.price) : " \u2014 " + t("shippingFree");
        var eta = (o.eta && o.eta[currentLang]) ? " (" + o.eta[currentLang] + ")" : "";
        return '<option value="' + o.id + '" data-price="' + o.price + '">' + label + price + eta + '</option>';
      }).join("");
    }

    function updateTotal() {
      if (!totalRow || !totalValueEl) return;
      if (!currentOrderContext || currentOrderContext.custom) {
        totalRow.style.display = "none";
        return;
      }
      totalRow.style.display = "";
      var product = currentOrderContext.product;
      var qty = parseInt((qtySelect && qtySelect.value) || "1", 10) || 1;
      var shipId = shippingSelect ? shippingSelect.value : null;
      var ship = (SHOP.shippingOptions || []).find(function (o) { return o.id === shipId; });
      var shipPrice = ship ? ship.price : 0;
      var total = product.price * qty + shipPrice;
      totalValueEl.textContent = formatAmount(total);
    }

    function updateSubmitCopy() {
      if (!submitLabel) return;
      var customFlow = currentOrderContext && currentOrderContext.custom;
      var stripeFlow = useStripe() && !customFlow;
      submitLabel.textContent = stripeFlow ? t("formSubmitPay") : t("formSubmit");
      if (mailtoNote) mailtoNote.hidden = stripeFlow;
      if (stripeNote) stripeNote.hidden = !stripeFlow;
    }

    function openModal(productId) {
      var title, summary;
      if (productId === "__custom__") {
        title = t("customProductName");
        summary = title + " \u2014 " + t("customPriceLabel");
        currentOrderContext = { custom: true };
      } else {
        var product = (SHOP.products || []).find(function (p) { return p.id === productId; });
        if (!product) return;
        title = product.title[currentLang];
        summary = title + " \u2014 " + formatAmount(product.price);
        currentOrderContext = { product: product, custom: false };
      }
      productNameEl.textContent = summary;
      productInput.value = title;
      populateShipping(currentOrderContext.product || null);
      updateTotal();
      updateSubmitCopy();
      modal.classList.add("open");
      modalBackdrop.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.remove("open");
      modalBackdrop.classList.remove("open");
      document.body.style.overflow = "";
      currentOrderContext = null;
    }

    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".product-order-btn");
      if (btn) {
        e.preventDefault();
        openModal(btn.dataset.product);
        return;
      }
      var customBtn = e.target.closest(".custom-order-btn");
      if (customBtn) {
        e.preventDefault();
        openModal("__custom__");
      }
    });

    modal.querySelector(".modal-close").addEventListener("click", closeModal);
    modalBackdrop.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });

    if (qtySelect) qtySelect.addEventListener("change", updateTotal);
    if (shippingSelect) shippingSelect.addEventListener("change", updateTotal);

    // Expose for applyLanguage() so copy refreshes when user toggles SV/EN
    window.shopRefreshModal = function () {
      if (!currentOrderContext) return;
      populateShipping(currentOrderContext.product || null);
      updateTotal();
      updateSubmitCopy();
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var dict = SHOP.i18n[currentLang];

      var name = form.querySelector("#order-name").value.trim();
      var email = form.querySelector("#order-email").value.trim();
      var phone = form.querySelector("#order-phone").value.trim();
      var product = form.querySelector("#order-product").value;
      var qty = form.querySelector("#order-qty").value;
      var shipping = shippingSelect ? shippingSelect.value : null;
      var message = form.querySelector("#order-message").value.trim();

      var customFlow = currentOrderContext && currentOrderContext.custom;
      var stripeFlow = useStripe() && !customFlow;

      if (stripeFlow) {
        submitBtn.disabled = true;
        fetch("/api/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: currentOrderContext.product.id,
            qty: parseInt(qty, 10) || 1,
            shippingId: shipping,
            customer: { name: name, email: email, phone: phone },
            message: message,
            lang: currentLang,
          }),
        })
          .then(function (r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
          })
          .then(function (data) {
            if (!data.url) throw new Error("No checkout URL");
            window.location.href = data.url;
          })
          .catch(function (err) {
            console.error("Checkout error:", err);
            alert(t("checkoutErrorGeneric"));
            submitBtn.disabled = false;
          });
        return;
      }

      // Fallback: mailto (used for custom orders and until Stripe is live)
      var subjectLabel = customFlow ? dict.customProductName : product;
      var subject = encodeURIComponent(dict.mailSubject + ": " + subjectLabel);

      // Build a readable shipping + total summary for the email body
      var shippingLine = "";
      var totalLine = "";
      if (!customFlow && currentOrderContext && currentOrderContext.product) {
        var ship = (SHOP.shippingOptions || []).find(function (o) { return o.id === shipping; });
        if (ship) {
          var shipLabel = (ship.label && ship.label[currentLang]) || ship.id;
          var shipPriceStr = ship.price > 0 ? formatAmount(ship.price) : t("shippingFree");
          shippingLine = dict.mailShipping + ": " + shipLabel + " (" + shipPriceStr + ")\n";
          var total = currentOrderContext.product.price * (parseInt(qty, 10) || 1) + ship.price;
          totalLine = dict.mailTotal + ": " + formatAmount(total) + "\n";
        }
      }

      var body = encodeURIComponent(
        dict.mailGreeting + "\n\n" +
        dict.mailIntro + "\n\n" +
        dict.mailProduct + ": " + product + "\n" +
        dict.mailQty + ": " + qty + "\n" +
        shippingLine +
        totalLine +
        "\n" +
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

  /* ── Filter pills & search wiring ── */

  function initFilters() {
    document.addEventListener("click", function (e) {
      var pill = e.target.closest(".filter-pill");
      if (!pill) return;
      activeCategory = pill.dataset.cat || "all";
      renderCategoryPills();
      renderProducts();
      initReveals();
    });

    var search = $("#product-search");
    if (search) {
      search.addEventListener("input", function () {
        searchQuery = search.value.trim();
        renderProducts();
        initReveals();
      });
    }
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
    $$(".product-card, .step-card, .section-header, .shop-about-layout, .hero-photo, .custom-card").forEach(function (el) {
      if (!el.classList.contains("reveal")) el.classList.add("reveal");
      if (!el.classList.contains("visible")) revealObserver.observe(el);
    });
  }

  /* ── Load products ── */

  function loadProducts() {
    var url = SHOP.productsUrl || "/shop/products.json";
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("Failed to load products");
        return r.json();
      })
      .then(function (data) {
        SHOP.products = data;
      })
      .catch(function (err) {
        console.error("Could not load products:", err);
        SHOP.products = [];
      });
  }

  function loadShipping() {
    var url = SHOP.shippingUrl || "/shop/shipping.json";
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("Failed to load shipping");
        return r.json();
      })
      .then(function (data) {
        SHOP.shippingOptions = data;
      })
      .catch(function (err) {
        console.error("Could not load shipping options:", err);
        SHOP.shippingOptions = [];
      });
  }

  /* ── Init ── */

  function init() {
    buildNav();
    buildFooter();
    initSmoothScroll();
    initOrderModal();
    initFilters();

    // Load products + shipping in parallel, then render everything translated
    Promise.all([loadProducts(), loadShipping()]).then(function () {
      applyLanguage(); // renders products, steps, custom card, filter pills
      initReveals();
    });

    // Also apply initial static translations before products arrive
    applyLanguage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.shopIcon = icon;

})();
