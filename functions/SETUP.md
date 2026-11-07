# Shop setup (Cloudflare Pages + Stripe + Resend)

Everything in this repo is still static HTML until you add two serverless
Functions and fill in a few env vars. Until then the "Order" button silently
falls back to a `mailto:` link, so the live site keeps working during setup.

## 1. Deploy to Cloudflare Pages

1. Sign in at https://dash.cloudflare.com → **Workers & Pages** → **Create
   application** → **Pages** → **Connect to Git**.
2. Select this repo, branch `main`, framework preset **None**, build command
   **blank**, build output directory `.`.
3. Deploy. After the first build you'll get a URL like
   `https://nj22az-github-io.pages.dev`.
4. Optional: attach a custom domain (e.g. `jonssons-anslagstavla.se`) under
   **Custom domains**.

The GitHub Pages deployment keeps running in parallel — it just doesn't run
the Functions, so orders placed via the `github.io` URL will still use the
`mailto:` fallback. Once Cloudflare is live, stop advertising the `github.io`
URL.

## 2. Stripe

1. Create an account at https://stripe.com. Sweden is supported.
2. In the dashboard, switch to **test mode** (toggle, top right).
3. Copy both keys from **Developers → API keys**:
   - Publishable key → `pk_test_...`
   - Secret key → `sk_test_...`
4. Create a webhook (**Developers → Webhooks → Add endpoint**):
   - URL: `https://YOUR-PAGES-URL/api/stripe-webhook`
   - Event: `checkout.session.completed`
   - After saving, reveal the **Signing secret** → `whsec_...`.

## 3. Resend (order-received email)

1. Sign up at https://resend.com (free tier: 3 000 emails/month).
2. Verify a sender domain (or use their `onboarding@resend.dev` during testing).
3. Copy the API key.

## 4. Cloudflare env vars

Cloudflare dashboard → your Pages project → **Settings → Environment variables
→ Production**. Add:

| Name                    | Example value                                  |
|-------------------------|------------------------------------------------|
| `STRIPE_SECRET_KEY`     | `sk_test_...` (later `sk_live_...`)            |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...`                                    |
| `RESEND_API_KEY`        | `re_...`                                       |
| `RESEND_FROM`           | `Orders <orders@yourdomain.se>`                |
| `ORDER_EMAIL`           | `your-real-email@example.com`                  |
| `SITE_URL`              | `https://nj22az-github-io.pages.dev` (no `/`)  |

Then flip the publishable key in `shop/config.js`:

```js
stripePublishableKey: "pk_test_...",
```

Commit and push. The moment Cloudflare rebuilds with a non-empty key, the
order form switches from `mailto:` to Stripe Checkout.

## 5. End-to-end test

1. Open the Cloudflare Pages URL, click any product's **Order** button.
2. Fill the form, choose a shipping method, submit.
3. You'll be redirected to Stripe Checkout. Test card:
   `4242 4242 4242 4242`, any future expiry, any CVC.
4. After paying you should land on `/shop/success/`.
5. Within ~30 seconds, `ORDER_EMAIL` should receive a summary email.

## 6. Going live

1. In Stripe, switch from test mode to live mode.
2. Swap `STRIPE_SECRET_KEY` → `sk_live_...` in Cloudflare env vars.
3. Swap `stripePublishableKey` in `shop/config.js` → `pk_live_...`.
4. Re-create the webhook endpoint against the live-mode events → copy the
   new `whsec_...` into `STRIPE_WEBHOOK_SECRET`.
5. Do a real 1 kr test purchase and verify the email arrives.

## Local development (optional)

```bash
npm i -g wrangler
wrangler pages dev . --compatibility-date=2026-04-01
```

Open http://localhost:8788/shop/. Use Stripe CLI to forward webhooks:

```bash
stripe login
stripe listen --forward-to localhost:8788/api/stripe-webhook
```

Copy the `whsec_` from `stripe listen` output into a `.dev.vars` file in
the repo root:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # the one stripe listen prints, NOT the dashboard one
RESEND_API_KEY=re_...
RESEND_FROM=Orders <onboarding@resend.dev>
ORDER_EMAIL=you@example.com
SITE_URL=http://localhost:8788
```

(The file is gitignored — see `.gitignore`.)

## Editing the catalog

Prices, titles, translations, and stock flags live in:
- `shop/products.json` — products
- `shop/shipping.json` — shipping options + prices

No code change needed. The serverless Function always re-reads these files
on every checkout, so changes go live as soon as Cloudflare rebuilds.
