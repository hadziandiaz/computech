# COMPUTECH

**Build Your Setup. Define Your Performance.**

COMPUTECH is a complete full-stack technology e-commerce platform for laptops, desktop PCs, PC components, networking equipment, networking tools and accessories. It includes a public storefront, customer account area, an operations dashboard for staff and administrators, a compatibility-aware PC Builder, database-backed cart and checkout, Indonesian payment adapters and shipping quotes.

All business data is read from and written to Supabase. There are no mock dashboards: discounts, stock, orders, vouchers, reviews, reports and inventory movements come from Postgres tables and security-definer RPCs.

---

## Contents

- [Feature overview](#feature-overview)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Database migrations and seed data](#database-migrations-and-seed-data)
- [First administrator](#first-administrator)
- [Authentication configuration](#authentication-configuration)
- [Payments](#payments)
- [Shipping](#shipping)
- [PC Builder compatibility engine](#pc-builder-compatibility-engine)
- [Roles and access control](#roles-and-access-control)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deployment to Firebase App Hosting](#deployment-to-firebase-app-hosting)
- [Production checklist](#production-checklist)
- [Troubleshooting](#troubleshooting)

---

## Feature overview

### Storefront

- Home page with featured products, new arrivals, best sellers, categories and active promotions.
- Full catalog with keyword search, category and brand filters, price range, in-stock filter, sorting and pagination.
- Dedicated laptop and networking landing pages.
- Product detail pages with gallery, specifications, stock state, warranty, promotions, reviews and related products.
- Product comparison (up to four products, stored in the browser) with a comparison API.
- Promotion listing and promotion detail pages.
- Brands and categories indexes with detail pages.
- PC Builder with live pricing, budget tracking, compatibility checks, recommendations, save/share/print and add-all-to-cart.
- Public saved-build pages at `/builds/[slug]`.
- Cart, checkout, voucher validation, shipping selection and order placement.
- Order tracking by order number and email.
- About, contact/support, FAQ, warranty, shipping, privacy and terms pages.
- SEO metadata, dynamic sitemap, robots rules, web manifest and SVG icon.

### Customer account

- Overview dashboard.
- Order list and order detail with payment, shipment, tracking and cancellation.
- Wishlist.
- Saved PC builds.
- Voucher wallet.
- Address book.
- Notifications.
- Profile and account settings.
- Product reviews.

### Staff and administrator dashboard

- KPI overview with revenue, orders, customers, low stock and support messages.
- Product CRUD with images, specifications, PC component specs and inventory.
- Category, brand, promotion and voucher management.
- Inventory adjustment with movement ledger and low-stock thresholds.
- Order management, status transitions, tracking numbers, shipments and manual payment confirmation.
- Customer list and customer detail.
- PC component catalog and compatibility data.
- Review moderation.
- Reports: sales series, top products, order status mix, category revenue and newsletter subscribers.
- Support inbox and site settings.

### Business logic

- Server-authoritative checkout pricing and voucher validation through Postgres RPCs.
- Atomic stock reservation/decrement and order creation.
- Order cancellation and stock restoration.
- Inventory adjustments with an audit ledger.
- Payment webhooks with signature/token verification and idempotent payment application.
- In-app notifications for payment confirmation, shipping and support replies.
- Role-based access control enforced in the app and by row-level security in Postgres.
- Storage buckets for product images, category images, promotion banners and customer avatars.

---

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 15 App Router, React 19, TypeScript 5.9 |
| Styling | Tailwind CSS 4, custom design tokens, Lucide icons |
| Animation | Framer Motion |
| Backend | Supabase Postgres, Auth, Storage, RLS and RPC |
| Validation | Zod |
| Notifications | Sonner |
| Testing | Vitest |
| Deployment | Firebase App Hosting |

The Supabase client is intentionally untyped. Domain types live in `types/domain.ts`, and raw database rows are normalised in `lib/data/mappers.ts`.

---

## Project structure

```text
app/
  (auth)/                 Login, register, password reset, suspended account
  (store)/                Public storefront, cart, checkout and customer account
  admin/                  Staff and administrator dashboard
  api/products/compare/   Product comparison endpoint
  api/shipping/quote/     Manual / RajaOngkir shipping quotes
  api/webhooks/midtrans/  Midtrans notification handler
  api/webhooks/xendit/    Xendit invoice callback handler
  auth/callback/          Supabase email-confirmation code exchange
components/
  admin/                  Dashboard-specific UI
  layout/                 Site header, footer, account and admin navigation
  pc-builder/             Builder experience
  store/                  Catalog, product, cart and checkout UI
  ui/                     Shared primitives
lib/
  actions/                Customer and shared server actions
  actions/admin/          Staff and administrator server actions
  cart/                   Guest-cart cookie helpers
  data/                   Supabase read/write layer
  payments/               Payment adapters and webhook helper
  pc-builder/             Compatibility and recommendation engine
  shipping/               RajaOngkir adapter
  supabase/               Browser, server and service-role clients
supabase/migrations/      Schema, RPCs, RLS, storage policies and demo seed
types/domain.ts           Domain model
```

---

## Prerequisites

- Node.js 20 or newer (developed on Node 24).
- npm 10 or newer.
- A Supabase project (cloud or self-hosted).
- Optional: Supabase CLI and Docker for local database development.
- Optional: Firebase project with App Hosting enabled for deployment.

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in at least:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Keep `PAYMENT_PROVIDER=manual` and `SHIPPING_PROVIDER=manual` until provider keys are ready. The application renders empty states instead of crashing when Supabase is not configured, but cart, checkout, authentication and admin pages require a real project.

**Security:** `SUPABASE_SERVICE_ROLE_KEY`, payment server keys and callback tokens are server-only. Never prefix them with `NEXT_PUBLIC_`, never import `lib/supabase/admin.ts` into a client component, and never commit `.env.local`.

### 3. Apply the database migrations

Use one of the following methods.

#### Option A: Supabase dashboard SQL editor

Run the files in `supabase/migrations/` in filename order:

1. `0001_init.sql` — enums, 33 tables, indexes, triggers, RPCs, RLS policies and storage buckets.
2. `0002_seed_categories_brands.sql` — demo categories and brands.
3. `0003_seed_products_computers.sql` — laptops, desktops and monitors.
4. `0004_seed_products_components.sql` — CPUs, motherboards, GPUs, RAM, storage, PSUs and cases.
5. `0005_seed_products_networking.sql` — routers, switches, access points, tools and cabling.
6. `0006_seed_products_accessories.sql` — keyboards, mice, connectors and accessories.
7. `0007_seed_images_inventory.sql` — product images and inventory rows.
8. `0008_seed_specifications.sql` — product specifications.
9. `0009_seed_pc_components.sql` — PC component specs and compatibility rules.
10. `0010_seed_merchandising.sql` — promotions, vouchers, shipping methods, settings and demo reviews.

Each seed statement is idempotent (`on conflict do update` or `on conflict do nothing`) and demo rows are marked with `is_demo = true`.

#### Option B: Supabase CLI

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

To start from a clean local database with Docker:

```bash
supabase start
supabase db reset
```

> The seed migrations are optional for production. If you remove them, create categories, brands, products, shipping methods and settings through the admin dashboard or your own SQL.

### 4. Configure Auth URLs

In **Supabase Dashboard > Authentication > URL Configuration**:

- Site URL: `http://localhost:3000` for local development, or your production origin.
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://YOUR_DOMAIN/auth/callback`

Email confirmation is enabled by default. For smoother local testing you may disable **Confirm email** under **Authentication > Providers > Email**, or keep it and confirm through the email link.

### 5. Start the application

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Database migrations and seed data

The schema creates 33 tables, including:

`profiles`, `user_roles`, `categories`, `brands`, `products`, `product_images`, `product_specifications`, `product_inventory`, `inventory_movements`, `pc_component_specs`, `pc_component_compatibility`, `pc_builds`, `pc_build_items`, `wishlists`, `wishlist_items`, `carts`, `cart_items`, `addresses`, `promotions`, `promotion_products`, `vouchers`, `shipping_methods`, `orders`, `order_items`, `payments`, `shipments`, `voucher_redemptions`, `product_reviews`, `notifications`, `warranties`, `support_messages`, `site_settings` and `newsletter_subscribers`.

All primary keys are UUIDs. Foreign keys, check constraints, unique constraints, timestamps and supporting indexes are defined in `0001_init.sql`.

### Demo data

The seed migrations create:

- 78 demo products across laptops, desktops, monitors, CPUs, motherboards, GPUs, RAM, SSDs, power supplies, cases, coolers, routers, switches, access points, networking tools, cables, connectors, keyboards and mice.
- Demo categories, brands, images, specifications, inventory and PC component compatibility data.
- Promotions, vouchers, shipping methods, site settings and reviews.

Demo records have deterministic UUIDs for testing, for example products `10000000-0000-4000-8000-000000000001` through `...078`. Low-stock and out-of-stock scenarios are included (for example `CT-GPU-002` has stock 2 and `CT-GPU-004` has stock 0).

### Storage buckets

`0001_init.sql` creates four public buckets with MIME and size limits and RLS policies:

| Bucket | Public | Limit | Write access |
| --- | --- | --- | --- |
| `product-images` | Yes | 5 MB | Staff and administrators |
| `category-images` | Yes | 5 MB | Staff and administrators |
| `promotion-banners` | Yes | 8 MB | Staff and administrators |
| `avatars` | Yes | 2 MB | Owner only, files under `avatars/<user-id>/` |

---

## First administrator

Public registration always creates a customer. There is no automatic admin assignment.

1. Register an account through `/register` and confirm the email if confirmation is enabled.
2. Run the following SQL in the Supabase SQL editor:

```sql
select public.bootstrap_admin('you@example.com');
```

3. Sign out and sign in again. The account now has the `admin` role and can access `/admin`.

The `bootstrap_admin(text)` function updates `public.user_roles` and is executable only by the `service_role`. To promote staff later, update the same table from the SQL editor:

```sql
-- Replace with the target auth user's email.
insert into public.user_roles (user_id, role)
select id, 'staff' from auth.users where lower(email) = lower('staff@example.com')
on conflict (user_id) do update set role = 'staff', updated_at = now();
```

---

## Authentication configuration

- Email/password authentication is used. OAuth providers are not required.
- `middleware.ts` refreshes sessions and redirects unauthenticated visitors away from `/account` and `/admin`.
- Server-side guards (`requireUser`, `requireStaff`, `requireAdmin`) enforce access again in layouts and actions. Middleware alone is not treated as authorization.
- Suspended profiles are redirected to `/suspended`.
- Password recovery uses Supabase reset emails and `/auth/callback` to exchange the code for a session.
- Guest carts live in the httpOnly cookie `ct_guest_cart`. On sign-in the cookie cart is merged into the customer's database cart.

---

## Payments

Set `PAYMENT_PROVIDER` to one of:

### `manual` (default)

Checkout creates a pending order and a pending payment. Customers see bank-transfer instructions. Staff mark the order as `processing` after verifying the transfer; the `staff_update_order_status` RPC marks the manual payment as paid and notifies the customer.

### `midtrans`

1. Set:
   ```dotenv
   PAYMENT_PROVIDER=midtrans
   MIDTRANS_SERVER_KEY=...
   MIDTRANS_CLIENT_KEY=...
   MIDTRANS_IS_PRODUCTION=false
   ```
2. Configure the notification URL in Midtrans:
   - Sandbox: `https://YOUR_DOMAIN/api/webhooks/midtrans`
   - Production: `https://YOUR_DOMAIN/api/webhooks/midtrans`
3. The handler verifies `signature_key` using SHA-512 of `order_id + status_code + gross_amount + server_key` before applying any change.
4. Accepted outcomes:
   - `settlement` / `capture` (not `challenge`) confirm the order and notify the customer.
   - `expire` cancels a pending order and restores stock.
   - `cancel`, `deny` and `failure` mark the payment failed and cancel a pending order.

The Snap transaction is created after order placement. If Midtrans is temporarily unavailable the checkout falls back to manual instructions instead of losing the order.

### `xendit`

1. Set:
   ```dotenv
   PAYMENT_PROVIDER=xendit
   XENDIT_SECRET_KEY=...
   XENDIT_CALLBACK_TOKEN=...
   XENDIT_IS_PRODUCTION=false
   ```
2. Configure the invoice callback URL:
   - `https://YOUR_DOMAIN/api/webhooks/xendit`
3. The handler requires the `x-callback-token` header to match `XENDIT_CALLBACK_TOKEN`.
4. `PAID` / `SETTLED` confirms the order, `EXPIRED` cancels it, and `FAILED` marks the payment failed.

Webhook handling is idempotent through `lib/payments/webhooks.ts`: duplicate paid callbacks do not create duplicate notifications or move an order twice. Webhooks require `SUPABASE_SERVICE_ROLE_KEY` because they run without a user session.

---

## Shipping

`SHIPPING_PROVIDER=manual` uses the `shipping_methods` table, editable in **Admin > Settings**. This is the recommended default and requires no third-party account.

`SHIPPING_PROVIDER=rajaongkir` enables live quotes through `lib/shipping/rajaongkir.ts`:

```dotenv
SHIPPING_PROVIDER=rajaongkir
RAJAONGKIR_API_KEY=...
RAJAONGKIR_ORIGIN_CITY_ID=...
```

`POST /api/shipping/quote` accepts `destination_city_id`, `weight_grams` and an optional `courier`. When live quotes are unavailable it falls back to the manual shipping methods, so checkout remains usable.

---

## PC Builder compatibility engine

The builder is implemented in `lib/pc-builder/compatibility.ts` and is driven by `public.pc_component_specs` rows. It performs checks for:

- CPU socket versus motherboard socket.
- Motherboard memory type (DDR4/DDR5) versus RAM.
- Memory kit capacity versus board maximum.
- GPU length versus case clearance.
- Estimated system wattage versus PSU capacity and recommended headroom.
- GPU power connector requirements versus PSU connectors.
- Cooler socket support and cooler height versus case clearance.
- Case form factor versus motherboard form factor.
- Storage interface notes.
- Missing or incomplete specifications, reported as `unknown` instead of falsely compatible.

The builder supports:

- Live totals using campaign/effective prices.
- Budget tracking with safe, warning and over-budget states.
- Component recommendations within a budget and usage profile.
- Compatibility summary and per-check details.
- Save to account, generate a public share slug, print, and add every selected component to the cart.

The `pc_component_compatibility` table also stores explicit rule rows for administration and auditing.

---

## Roles and access control

| Role | Access |
| --- | --- |
| `customer` | Storefront, own account, orders, wishlist, addresses, builds, reviews and vouchers |
| `staff` | Customer permissions plus catalog, inventory, orders, promotions, vouchers, review moderation, PC components and reports |
| `admin` | All staff permissions plus customer writes, role management and site settings |

Authorization is enforced at three levels:

1. `middleware.ts` redirects unauthenticated users from `/account` and `/admin`.
2. Server layouts and actions call `requireUser`, `requireStaff` or `requireAdmin` and check `lib/permissions.ts`.
3. Postgres row-level security and security-definer RPCs constrain what an authenticated user can read or write. Staff-only writes also check `public.is_staff()`.

Never disable RLS to fix an application error. Grant the missing policy or use a server action with an explicit permission check.

---

## Scripts

```bash
npm run dev         # Start the development server
npm run build       # Production build
npm run start       # Start the production server
npm run lint        # ESLint
npm run typecheck   # TypeScript, no emit
npm run test        # Vitest, single run
npm run test:watch  # Vitest, watch mode
npm run check       # lint + typecheck + test
```

---

## Testing

The Vitest suites cover:

- Pricing, discounts, voucher evaluation, shipping thresholds and budget states (`lib/pricing.test.ts`).
- PC compatibility checks, wattage estimation and budget-constrained recommendations (`lib/pc-builder/compatibility.test.ts`).
- Role permissions and shared utilities (`lib/permissions.test.ts`).

Run:

```bash
npm run check
```

The test suites are pure TypeScript and do not require Supabase credentials. Live database, auth, RLS and payment-sandbox tests require a configured Supabase project and provider accounts.

---

## Deployment to Firebase App Hosting

### 1. Create the Firebase project and backend

```bash
firebase login
firebase projects:list
firebase init apphosting
```

Select the project and connect the GitHub repository and branch that App Hosting should deploy. App Hosting builds with the repository's `apphosting.yaml`.

### 2. Create secrets

Store sensitive values in Cloud Secret Manager through App Hosting:

```bash
firebase apphosting:secrets:set NEXT_PUBLIC_SUPABASE_URL
firebase apphosting:secrets:set NEXT_PUBLIC_SUPABASE_ANON_KEY
firebase apphosting:secrets:set SUPABASE_SERVICE_ROLE_KEY
firebase apphosting:secrets:set MIDTRANS_SERVER_KEY
firebase apphosting:secrets:set MIDTRANS_CLIENT_KEY
firebase apphosting:secrets:set XENDIT_SECRET_KEY
firebase apphosting:secrets:set XENDIT_CALLBACK_TOKEN
firebase apphosting:secrets:set RAJAONGKIR_API_KEY
```

Grant the App Hosting backend service account access to each secret when prompted. The name in `apphosting.yaml` must match the Secret Manager secret name.

### 3. Update `apphosting.yaml`

Replace placeholders:

- `NEXT_PUBLIC_SITE_URL` with the final custom domain or App Hosting domain.
- `NEXT_PUBLIC_STORE_EMAIL` and `NEXT_PUBLIC_STORE_WHATSAPP`.
- `PAYMENT_PROVIDER` and `SHIPPING_PROVIDER` when provider keys are ready.
- `MIDTRANS_IS_PRODUCTION`, `XENDIT_IS_PRODUCTION` and `RAJAONGKIR_ORIGIN_CITY_ID`.

`NEXT_PUBLIC_*` values must keep `BUILD` availability; server secrets should remain `RUNTIME` only.

### 4. Deploy

```bash
git add .
git commit -m "Deploy COMPUTECH"
git push origin main
```

App Hosting builds and rolls out automatically. You can also trigger a rollout from the Firebase console.

### 5. Post-deployment

- Add the production origin to Supabase **Site URL** and **Redirect URLs**.
- Add `https://YOUR_DOMAIN/auth/callback`.
- Point Midtrans/Xendit callbacks at the production `/api/webhooks/...` URLs.
- Run `select public.bootstrap_admin('you@example.com');` for the production administrator account.
- Verify the sitemap at `/sitemap.xml` and the manifest at `/manifest.webmanifest`.
- Confirm storage bucket policies and upload a product image through the admin UI.

---

## Production checklist

- [ ] Supabase migrations `0001`–`0010` applied in order.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set only in server environments.
- [ ] Public `NEXT_PUBLIC_*` values rebuilt after changes.
- [ ] Production origin and `/auth/callback` added to Supabase Auth URLs.
- [ ] At least one administrator bootstrapped with `bootstrap_admin`.
- [ ] Store contact details and bank-transfer instructions updated in Admin > Settings.
- [ ] Shipping methods and costs reviewed.
- [ ] Payment provider chosen and callbacks verified in sandbox before switching to production.
- [ ] Webhook signature/token checks confirmed with a test notification.
- [ ] RLS enabled on all public tables and storage policies verified.
- [ ] Demo data reviewed or replaced; `is_demo` flags cleared for retained real catalog rows.
- [ ] `npm run check` and `npm run build` pass.
- [ ] Custom domain, HTTPS and email sender configured.
- [ ] Backups and Supabase project spend limits configured.

---

## Troubleshooting

**The storefront looks empty after setup.**
Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then verify that the seed migrations ran and that `products.status = 'active'`.

**`permission denied for table ...`**
RLS is working. Sign in with the expected role, or add a policy/RPC for the intended operation. Do not use the service-role key in client code.

**Admin pages redirect to `/account`.**
The signed-in account is still a customer. Run `bootstrap_admin` and sign in again.

**Image uploads fail.**
Check that storage buckets exist and that the user has staff/admin membership. Product images are written to `product-images`; avatars must be under `avatars/<user-id>/`.

**Payment webhook returns 401 or 503.**
A 401 means the signature/token is invalid. A 503 means the provider key, callback token or `SUPABASE_SERVICE_ROLE_KEY` is missing in that environment.

**Voucher rejected at checkout.**
Voucher rules are evaluated in Postgres. Check the active window, minimum purchase, usage limit and per-user limit.

**Windows / OneDrive filename suffixes.**
This repository may live inside a OneDrive folder. Files renamed with a `-DESKTOP-XXXXXXX` suffix (including inside `node_modules`) break package resolution and imports. Rename them back or reinstall dependencies with `npm ci` after excluding `node_modules` from sync.

---

## License

Private project. All product names and brands referenced in the demo seed are trademarks of their respective owners and are used for demonstration only.
