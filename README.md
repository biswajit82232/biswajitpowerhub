# BISWAJIT POWER HUB — *Powering Every Ride*

A premium EV dealership website **and** business-management platform for **BISWAJIT POWER HUB**, a low-speed (non-RTO) electric scooter showroom in Berhampore, West Bengal.

Built to feel like a modern EV technology brand — bright, airy, mobile-first, and conversion-focused.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | **React 18** + **Vite 5** (JavaScript) |
| Styling | **Tailwind CSS 3** |
| Animation | **Framer Motion** |
| Routing | **React Router 6** (lazy-loaded) |
| Backend | **Supabase** (Postgres + Auth + RLS + Storage) |
| Deploy | **Vercel** |

> Runs in **demo mode** without Supabase — local seed data and simulated forms.

---

## Getting Started

```bash
npm install
npm run dev          # https://localhost:5173 (HTTPS for admin PWA on phone)
npm run build        # production build -> dist/
npm run preview      # preview production build
```

### Environment variables

Copy `.env.example` to `.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SITE_URL=https://your-production-domain.com
```

**Vercel:** set all three for **Production** (not only Development), then redeploy.

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. SQL editor: run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Run migrations in order — see `supabase/migrations/README.md`:
   - `add_petrol_settings.sql`
   - `add_hero_image.sql`
   - `create_storage_bucket.sql`
   - `add_promotional_offers.sql`
   - `add_site_settings.sql`
4. **Authentication → Users → Add user** for admin login at `/admin/login`.

---

## Admin features

| Route | Purpose |
|---|---|
| `/admin` | Dashboard — call queue, popularity, best-value badges |
| `/admin/inventory` | Scooter CRUD + images |
| `/admin/leads` | Purchase intent % + follow-up priority |
| `/admin/offers` | Homepage promotional offers |
| `/admin/settings` | Phone, address, opening hours |
| `/admin/finance` | EMI defaults, hero image, petrol simulator |
| `/admin/callbacks` | Callback requests |
| `/admin/test-rides` | Test ride bookings |
| `/admin/reviews` | Review moderation |
| `/admin/analytics` | Event aggregates |

### Intelligence features

- **Purchase readiness score** — tracks views, EMI, simulator, WhatsApp, callbacks (0–100%).
- **Follow-up prioritization** — Call immediately / Call today / Follow up later.
- **Popularity engine** — most viewed this week, top intent this month.
- **Best value badges** — Best Value, Longest Range, Lowest Running Cost, Best City Scooter.

---

## Production checklist

Before go-live, confirm:

- [ ] **Vercel env vars** — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL` on Production
- [ ] **Supabase migrations** — all five migration files applied
- [ ] **Admin user** — created in Supabase Auth
- [ ] **Admin → Settings** — phones, address, hours saved
- [ ] **Admin → Offers** — at least one active offer (optional)
- [ ] **Admin → Finance** — hero image uploaded if desired
- [ ] **Inventory** — real scooter photos and prices
- [ ] **Custom domain** — update `VITE_SITE_URL`, `public/sitemap.xml`, and `public/robots.txt` if not using `biswajitpowerhub.vercel.app`
- [ ] **Smoke test** — homepage, contact form, callback, test ride, admin login, lead appears in dashboard

---

## Project structure

```
src/
  config/           site.js, finance.js
  context/          AuthContext, SiteSettingsContext
  lib/              supabase, tracking, purchaseReadiness, valueBadges
  features/         scooters, leads, offers, analytics, site settings
  pages/public/     Home, Scooters, Contact, Terms, Privacy…
  pages/admin/      Dashboard, Leads, Settings, Offers…
supabase/
  schema.sql        base tables + RLS
  seed.sql          demo scooters
  migrations/       incremental SQL (run after schema)
public/             logos, sitemap.xml, robots.txt, admin PWA
```

---

## Deploying to Vercel

1. Push to GitHub and import in Vercel.
2. Add environment variables (see above).
3. Build: `npm run build`, output: `dist/`.
4. `vercel.json` handles SPA rewrites and asset caching.

---

## Performance & SEO

- Route-level code splitting, vendor chunks
- Per-page meta + Open Graph + JSON-LD (`AutoDealer`, `Product`)
- `robots.txt` blocks `/admin`, `sitemap.xml` for public pages

---

*BISWAJIT POWER HUB — Nimtala, Chunakhali, Berhampore, West Bengal*
