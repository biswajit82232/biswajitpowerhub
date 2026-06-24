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
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX   # optional — Google Analytics 4
```

**Vercel:** set all three for **Production** (not only Development), then redeploy.

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` → `.env` and set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
3. SQL editor: run `supabase/schema.sql`, then `supabase/seed.sql`.
4. Apply migrations — either:
   - **CLI (recommended):** add `SUPABASE_DB_PASSWORD` to `.env`, then `npm run db:check` and `npm run db:migrate`
   - **Manual:** run files in order — see `supabase/migrations/README.md`
5. **Authentication → Users → Add user** for admin login at `/admin/login`.

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
- [ ] **Supabase migrations** — `npm run db:check` shows no pending items
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

## Google indexing

The site is configured for search indexing:

- `robots.txt` — allows public pages, blocks `/admin`
- `sitemap.xml` — auto-generated at build (static pages + every scooter URL)
- Per-page **title**, **description**, **canonical**, Open Graph, Twitter cards
- **JSON-LD**: `AutoDealer` (homepage), `Product` (scooter pages), `AggregateRating` (reviews)
- Admin pages use `noindex, nofollow`

### After deploy — Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (`https://your-domain.com`)
3. Verify ownership (HTML tag or DNS)
4. Submit sitemap: `https://your-domain.com/sitemap.xml`
5. Use **URL Inspection** on homepage and a scooter page to request indexing

Set `VITE_SITE_URL` in Vercel **before** build so canonical URLs and sitemap match your live domain.

---

## Google Analytics 4

Optional — enable by setting `VITE_GA_MEASUREMENT_ID` in Vercel (Production).

1. [Google Analytics](https://analytics.google.com) → Admin → **Data streams** → Web
2. Copy **Measurement ID** (format `G-XXXXXXXXXX`)
3. Add to Vercel env → redeploy

**What is tracked automatically:**
- Page views (public site only — `/admin` excluded)
- WhatsApp / call clicks
- Callback, test ride, contact form (`generate_lead`)
- Scooter views, EMI calculator, simulator, compare

Internal **Admin → Analytics** still uses Supabase `lead_events` for lead scoring — GA4 is for marketing/traffic reports.

---

## Performance

Production optimisations already in place:

| Area | Implementation |
|------|----------------|
| JS bundle | Route lazy-loading, vendor chunks (React, Motion, Supabase, icons) |
| Caching | 1-year immutable cache on `/assets/*` (Vercel) |
| Fonts | Non-blocking load with `display=swap` |
| Hero / UI | CSS animations instead of heavy infinite JS loops |
| Images | Lazy loading on maps; branded placeholders |
| GA4 | Script deferred until browser idle (~1–2s after load) |
| Admin | Separate chunk — not loaded on public pages |

**After deploy:** run [PageSpeed Insights](https://pagespeed.web.dev/) on your live URL. Target 90+ mobile where possible; real images and third-party maps will affect scores.

---

*BISWAJIT POWER HUB — Nimtala, Chunakhali, Berhampore, West Bengal*
