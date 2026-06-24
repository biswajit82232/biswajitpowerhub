# BISWAJIT POWER HUB — *Powering Every Ride*

A premium EV dealership website **and** business-management platform for **BISWAJIT POWER HUB**, a low-speed (non-RTO) electric scooter showroom in Berhampore, West Bengal.

Built to feel like a modern EV technology brand (Apple / Stripe / Rivian) — bright, airy, mobile-first, and conversion-focused — not a generic dealership template.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | **React 18** + **Vite 5** (JavaScript, no TypeScript) |
| Styling | **Tailwind CSS 3** (custom *Electric Sky Premium* theme) |
| Animation | **Framer Motion** |
| Routing | **React Router 6** (lazy-loaded, code-split) |
| Backend | **Supabase** (Postgres + Auth + RLS) |
| Icons | **Lucide React** |
| SEO | **react-helmet-async** + JSON-LD schema |
| Deploy | **Vercel** |

> The app runs **fully in demo mode without Supabase** — it falls back to local seed data and simulates form submissions, so you can preview everything immediately.

---

## Getting Started

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build -> dist/
npm run preview      # preview the production build
```

### Connect Supabase (optional but recommended)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` then `supabase/seed.sql`.
3. Copy `.env.example` to `.env` and fill in:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. Create an admin user: **Supabase → Authentication → Users → Add user** (email + password). Log in at `/admin/login`.

---

## Design System — "Electric Sky Premium"

Tokens live in `tailwind.config.js`.

| Token | Value |
|---|---|
| Background | `#F8FBFF` (`bg`) |
| Surface | `#FFFFFF` (`surface`) |
| Alt section | `#F0F9FF` (`surface-alt`) |
| Brand | `#3B82F6` (`brand`) |
| Accent | `#14B8A6` (`accent`) |
| Heading | `#0F172A` (`heading`) |
| Body | `#475569` (`body`) |
| Muted | `#64748B` (`muted`) |
| Border | `#E2E8F0` (`line`) |
| Gradient | `bg-brand-gradient` (`#3B82F6 → #14B8A6`) |

Mobile-first (360 / 390 / 412 px), 44px+ touch targets, thumb-friendly sticky CTAs, no horizontal scroll, reduced-motion aware.

---

## Project Structure

```
src/
  config/        site.js (business config), finance.js (EMI defaults)
  lib/           supabase, utils, finance (EMI), simulator, tracking (lead scoring)
  hooks/         useCountUp, useMediaQuery, useAsync, usePageTracking
  context/       AuthContext
  components/
    ui/          Button, Card, Badge, Input, Modal, Skeleton, Toast, RangeSlider, StarRating…
    common/      SEO, Reveal, Section, AnimatedCounter, Logo, ScooterImage, ScrollToTop
    layout/      Navbar, Footer, MobileCTABar, PublicLayout
    sections/    Hero, WhyChooseUs
    admin/       Charts, StatCard, AdminHeader
  features/      scooters · reviews · leads · emi · simulator · finance · analytics
  pages/
    public/      Home, Scooters, ScooterDetails, Compare, Reviews, Contact, NotFound
    admin/       AdminLogin, AdminLayout, Dashboard, Inventory, Leads, Callbacks,
                 TestRides, AdminReviews, Finance, Analytics
  routes/        ProtectedRoute
  data/          seed scooters & reviews (Supabase fallback)
supabase/        schema.sql, seed.sql (tables + RLS policies)
```

---

## Phase Roadmap (delivered)

- **Phase 1 — Foundation:** design system, layout, responsive nav/footer, reusable UI kit, Supabase setup.
- **Phase 2 — Homepage:** hero, Why Choose Us, featured scooters, **EV Usage Simulator**, reviews carousel, callback.
- **Phase 3 — Catalog:** list + filters, product detail with gallery, **EMI calculator**, **compare**, test-ride booking, sticky WhatsApp.
- **Phase 4 — Reviews:** public submission + moderation.
- **Phase 5 — Lead intelligence:** event tracking + automatic Hot/Warm/Cold scoring (`src/lib/tracking.js`).
- **Phase 6 — Admin:** secure login, dashboard, inventory CRUD, leads, callbacks, test rides, review moderation, finance settings, analytics.

### Lead Scoring Model
High-intent actions (EMI/simulator use, callback, test ride, WhatsApp, or repeat views of the same model) → **Hot**. Multiple visits / scooter views → **Warm**. Single visit → **Cold**.

---

## Performance & SEO

- Route-level code splitting + lazy loading, vendor chunk splitting.
- Lazy images, branded placeholder fallbacks, reduced-motion support.
- Per-page meta + Open Graph + Twitter cards, `robots.txt`, `sitemap.xml`.
- JSON-LD: `AutoDealer` (local business), `Product`, `AggregateRating`.

---

## Deploying to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. `vercel.json` already rewrites all routes to `index.html` for SPA routing.

Build command `npm run build`, output `dist/`.
