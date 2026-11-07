/**
 * POST /api/create-checkout
 *
 * Receives { productId, qty, shippingId, customer, message, lang } from
 * the browser. Re-reads products.json and the shipping-options config on
 * the server so the final price can't be tampered with by the client.
 * Creates a Stripe Checkout Session and returns { url }.
 *
 * Runs on Cloudflare Pages Functions. Secrets live in env:
 *   STRIPE_SECRET_KEY   — sk_test_... / sk_live_...
 *   ORDER_EMAIL         — destination inbox (used later by the webhook)
 *   SITE_URL            — e.g. https://jonssons-anslagstavla.se or the
 *                         Cloudflare Pages preview URL. No trailing slash.
 */

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: "Stripe not configured" }, 500);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Invalid JSON" }, 400); }

  const { productId, qty, shippingId, customer, message, lang } = body || {};
  const quantity = clampQty(qty);
  const langKey = lang === "sv" ? "sv" : "en";

  if (!productId || !shippingId || !customer?.name || !customer?.email) {
    return json({ error: "Missing required fields" }, 400);
  }

  // Load canonical product + shipping data server-side. Never trust prices
  // sent from the browser.
  const origin = new URL(request.url).origin;
  const [products, shipping] = await Promise.all([
    fetch(origin + "/shop/products.json").then(r => r.json()),
    fetch(origin + "/shop/shipping.json").then(r => r.json()),
  ]);

  const product = products.find(p => p.id === productId);
  if (!product) return json({ error: "Unknown product" }, 400);

  const shippingOpt = shipping.find(s => s.id === shippingId);
  if (!shippingOpt) return json({ error: "Unknown shipping option" }, 400);

  // Shipping class must be compatible with the product's class
  if (
    Array.isArray(shippingOpt.classes) &&
    !shippingOpt.classes.includes(product.shipping_class)
  ) {
    return json({ error: "Shipping option not valid for this product" }, 400);
  }

  const productName = product.title[langKey] || product.title.en;
  const productDesc = product.description[langKey] || product.description.en;
  const shippingLabel =
    (shippingOpt.label && shippingOpt.label[langKey]) || shippingOpt.id;

  // Build line items in öre (Stripe charges in the smallest currency unit)
  const lineItems = [
    {
      quantity,
      price_data: {
        currency: "sek",
        unit_amount: product.price * 100,
        product_data: {
          name: productName,
          description: productDesc?.slice(0, 500),
        },
      },
    },
  ];
  if (shippingOpt.price > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "sek",
        unit_amount: shippingOpt.price * 100,
        product_data: { name: shippingLabel },
      },
    });
  }

  const siteUrl = (env.SITE_URL || origin).replace(/\/$/, "");

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${siteUrl}/shop/success/?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url",  `${siteUrl}/shop/cancel/`);
  params.set("customer_email", customer.email);
  params.set("locale", langKey === "sv" ? "sv" : "en");
  params.set("phone_number_collection[enabled]", "true");
  params.set("shipping_address_collection[allowed_countries][0]", "SE");
  params.set("payment_method_types[0]", "card");
  params.set("allow_promotion_codes", "false");
  params.set("billing_address_collection", "auto");

  // Attach custom fields / metadata so we can reconstruct the order later
  params.set("metadata[product_id]", product.id);
  params.set("metadata[qty]", String(quantity));
  params.set("metadata[shipping_id]", shippingOpt.id);
  params.set("metadata[shipping_label]", shippingLabel);
  params.set("metadata[customer_name]", customer.name.slice(0, 200));
  params.set("metadata[customer_phone]", (customer.phone || "").slice(0, 50));
  params.set("metadata[lang]", langKey);
  if (message) params.set("metadata[message]", message.slice(0, 500));

  lineItems.forEach((li, i) => {
    params.set(`line_items[${i}][quantity]`, String(li.quantity));
    params.set(`line_items[${i}][price_data][currency]`, li.price_data.currency);
    params.set(`line_items[${i}][price_data][unit_amount]`, String(li.price_data.unit_amount));
    params.set(`line_items[${i}][price_data][product_data][name]`, li.price_data.product_data.name);
    if (li.price_data.product_data.description) {
      params.set(
        `line_items[${i}][price_data][product_data][description]`,
        li.price_data.product_data.description
      );
    }
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Stripe error:", res.status, detail);
    return json({ error: "Stripe session failed" }, 502);
  }

  const session = await res.json();
  return json({ url: session.url, id: session.id });
}

function clampQty(n) {
  const x = parseInt(n, 10);
  if (!Number.isFinite(x) || x < 1) return 1;
  if (x > 100) return 100;
  return x;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
