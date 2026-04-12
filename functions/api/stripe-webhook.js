/**
 * POST /api/stripe-webhook
 *
 * Handles Stripe webhook events. On `checkout.session.completed` we email
 * the order details via Resend to ORDER_EMAIL. All other event types are
 * acknowledged and ignored.
 *
 * Env secrets:
 *   STRIPE_WEBHOOK_SECRET — whsec_... from the Stripe webhook dashboard
 *   STRIPE_SECRET_KEY     — used to fetch the session's line_items
 *   RESEND_API_KEY        — from resend.com (free tier: 3k/month)
 *   RESEND_FROM           — verified sender, e.g. "Orders <orders@yourdomain>"
 *   ORDER_EMAIL           — destination inbox (kept out of the browser)
 */

export async function onRequestPost({ request, env }) {
  const raw = await request.text();
  const sig = request.headers.get("Stripe-Signature") || "";

  try {
    await verifyStripeSignature(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Signature verify failed:", err.message);
    return new Response("Bad signature", { status: 400 });
  }

  const event = JSON.parse(raw);
  if (event.type !== "checkout.session.completed") {
    // We ack everything else so Stripe doesn't retry
    return new Response("ok", { status: 200 });
  }

  const session = event.data.object;

  // Pull line items to compose the order summary
  let lineItems = [];
  try {
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items?limit=20`,
      { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } }
    );
    if (res.ok) {
      const data = await res.json();
      lineItems = data.data || [];
    }
  } catch (err) {
    console.error("Failed to load line items:", err);
  }

  const meta = session.metadata || {};
  const langKey = meta.lang === "sv" ? "sv" : "en";

  const amountTotal = (session.amount_total || 0) / 100;
  const currency = (session.currency || "sek").toUpperCase();

  const addr = session.shipping_details?.address
    ? formatAddress(session.shipping_details)
    : session.customer_details?.address
      ? formatAddress({ name: session.customer_details.name, address: session.customer_details.address })
      : "(no address captured)";

  const subject = langKey === "sv"
    ? `Ny beställning: ${meta.product_id || session.id}`
    : `New order: ${meta.product_id || session.id}`;

  const intro = langKey === "sv"
    ? "Ny beställning mottagen via Jonsson's Anslagstavla."
    : "New order received via Jonsson's Board.";

  const lines = [
    intro,
    "",
    "--- Order ---",
    ...lineItems.map(li => `• ${li.description} × ${li.quantity} — ${(li.amount_total / 100).toFixed(2)} ${currency}`),
    "",
    `Total: ${amountTotal.toFixed(2)} ${currency}`,
    "",
    "--- Customer ---",
    `Name:  ${meta.customer_name || session.customer_details?.name || "—"}`,
    `Email: ${session.customer_details?.email || session.customer_email || "—"}`,
    `Phone: ${session.customer_details?.phone || meta.customer_phone || "—"}`,
    "",
    "--- Shipping ---",
    `Method: ${meta.shipping_label || meta.shipping_id || "—"}`,
    "Address:",
    addr,
    "",
  ];

  if (meta.message) {
    lines.push("--- Message ---", meta.message, "");
  }

  lines.push(`Stripe session: ${session.id}`);

  const text = lines.join("\n");

  try {
    await sendEmail({
      env,
      to: env.ORDER_EMAIL,
      subject,
      text,
    });
  } catch (err) {
    console.error("Email send failed:", err);
    // Still return 200 — we don't want Stripe to retry forever over email issues
  }

  return new Response("ok", { status: 200 });
}

/**
 * Verify the Stripe webhook signature header.
 * Implements the scheme described at
 * https://docs.stripe.com/webhooks#verify-manually
 */
async function verifyStripeSignature(payload, header, secret) {
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not set");
  const parts = Object.fromEntries(
    header.split(",").map(p => p.trim().split("=").map(s => s.trim()))
  );
  const timestamp = parts.t;
  const v1 = parts.v1;
  if (!timestamp || !v1) throw new Error("Malformed signature header");

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload)
  );
  const expected = Array.from(new Uint8Array(sigBuf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  if (!timingSafeEqual(expected, v1)) {
    throw new Error("Signature mismatch");
  }

  // Replay protection: reject events older than 5 minutes
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
  if (age > 300) throw new Error("Event too old");
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function formatAddress({ name, address }) {
  const lines = [];
  if (name) lines.push(name);
  if (address.line1) lines.push(address.line1);
  if (address.line2) lines.push(address.line2);
  const cityLine = [address.postal_code, address.city].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);
  if (address.country) lines.push(address.country);
  return lines.join("\n");
}

async function sendEmail({ env, to, subject, text }) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM || !to) {
    throw new Error("Email env vars not set (RESEND_API_KEY / RESEND_FROM / ORDER_EMAIL)");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM,
      to: [to],
      subject,
      text,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend error ${res.status}: ${detail}`);
  }
  return res.json();
}
