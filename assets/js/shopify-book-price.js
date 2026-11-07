(function () {
  "use strict";

  var selector = "[data-shopify-book-price]";
  var targets = Array.prototype.slice.call(document.querySelectorAll(selector));
  if (!targets.length) return;

  var fallbackProductUrl = "https://3va6hr-fw.myshopify.com/products/elteknik-och-ellara.js";
  var productUrl = targets[0].getAttribute("data-shopify-product-url") || fallbackProductUrl;
  var loadingText = targets[0].getAttribute("data-loading-text") || "Checking Shopify price…";
  var errorText = targets[0].getAttribute("data-price-error") || "Check current price on Shopify";
  targets.forEach(function (target) {
    target.textContent = target.getAttribute("data-loading-text") || loadingText;
  });

  fetch(productUrl, { cache: "no-store", headers: { Accept: "application/json" } })
    .then(function (response) {
      if (!response.ok) throw new Error("Shopify product request failed");
      return response.json();
    })
    .then(function (product) {
      var variant = (product.variants || []).find(function (item) { return item.available; }) ||
        (product.variants || [])[0];
      if (!variant || !Number.isFinite(Number(variant.price))) {
        throw new Error("Shopify returned no usable variant price");
      }

      // Shopify's Ajax Product API returns variant prices in the currency's minor unit.
      var amount = Number(variant.price) / 100;
      var formatted = new Intl.NumberFormat("sv-SE", {
        style: "currency",
        currency: "SEK",
        maximumFractionDigits: amount % 1 === 0 ? 0 : 2
      }).format(amount);
      targets.forEach(function (target) {
        target.textContent = formatted;
      });

      var schema = document.querySelector('script[type="application/ld+json"]');
      if (schema) {
        try {
          var book = JSON.parse(schema.textContent);
          if (book.offers) {
            book.offers.price = amount.toFixed(2);
            book.offers.priceCurrency = "SEK";
            schema.textContent = JSON.stringify(book);
          }
        } catch (error) {
          // The visible price remains correct if structured data cannot be updated.
        }
      }
    })
    .catch(function () {
      targets.forEach(function (target) {
        target.textContent = target.getAttribute("data-price-error") || errorText;
      });
    });
})();
