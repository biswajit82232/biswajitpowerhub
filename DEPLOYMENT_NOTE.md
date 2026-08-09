# Production deployment — Biswajit Power Hub

## Why live still shows old SEO

Production was verified serving the **old SPA shell** on `www.biswajitpowerhub.in` with:

- Identical HTML for every route (empty `#root`, no unique titles / JSON-LD)
- Apex `biswajitpowerhub.in` **308 → www** (inverted vs this repo)

The SEO overhaul in this repo is correct for **non-www** (`https://biswajitpowerhub.in`). Code redirects alone cannot override Vercel Domain settings that point apex → www.

## Required Vercel Dashboard steps

1. Open **Project → Settings → Domains**
2. Set **`biswajitpowerhub.in` (apex) as the primary** production domain
3. Set **`www.biswajitpowerhub.in` to Redirect to apex** (`biswajitpowerhub.in`) — not the other way around
4. Environment variables (Production) — see `output/VERCEL_ENV.md`:
   - `VITE_SITE_URL=https://biswajitpowerhub.in`
   - `VITE_GA_MEASUREMENT_ID=G-ZPSM06SEY4`
   - `VITE_GOOGLE_ADS_ID=AW-17924759668`
   - `VITE_ADMIN_EMAILS=biswajitpowerhub@gmail.com`
   - `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (from Supabase API settings)
   - Optional: `VITE_GOOGLE_SITE_VERIFICATION` when Search Console HTML verify is ready
5. Deploy **this branch to Production** (not only a Preview deployment)

## Build / deploy commands

```bash
npm install
npm run build
# Then deploy Production (git push to production branch, or:)
# npx vercel --prod
```

Build pipeline: sitemap → `vite build` → Puppeteer prerender (best-effort) → **fallback prerender** (always injects titles/meta/JSON-LD into `dist/<route>/index.html`).

## Post-deploy checks (2 minutes)

```bash
# www must 301 to apex
curl -sI https://www.biswajitpowerhub.in/ | findstr /I "HTTP Location"

# apex homepage must be 200 with Berhampore in title
curl -s https://biswajitpowerhub.in/ | findstr /I "<title>"

# prerender / unique meta
curl -s https://biswajitpowerhub.in/scooters/activa | findstr /I "<title> application/ld+json"

# assets
curl -sI https://biswajitpowerhub.in/og-image.png | findstr /I "HTTP Content-Type"
curl -sI https://biswajitpowerhub.in/sitemap.xml | findstr /I "HTTP"
```

Expected:

| URL | Status | Notes |
|-----|--------|--------|
| `https://www.biswajitpowerhub.in/` | 301 | `Location: https://biswajitpowerhub.in/` |
| `https://biswajitpowerhub.in/` | 200 | Title contains Berhampore; JSON-LD LocalBusiness |
| `https://biswajitpowerhub.in/scooters/activa` | 200 | Title contains Activa; Product JSON-LD |
| `https://biswajitpowerhub.in/products` | 301 | → `/scooters` |
| `https://biswajitpowerhub.in/og-image.png` | 200 | `image/png` |

## If apex still redirects to www

Fix **Domains** in the dashboard again. The `vercel.json` www→apex redirect only runs when a request hits the www host; it cannot stop Vercel from redirecting apex→www at the edge if Domains are misconfigured.
