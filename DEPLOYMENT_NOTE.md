# Production deployment — Biswajit Power Hub

## Soft 404s

Unknown public URLs must return **HTTP 404** via `dist/404.html`. Do **not** re-add a catch-all rewrite to `/index.html` for all paths — that creates soft 404s. Only `/admin` (and `/admin/*`) rewrite to the SPA shell.

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
   - `VITE_GA_MEASUREMENT_ID` (GA4 measurement ID)
   - `VITE_GOOGLE_ADS_ID` (optional `AW-…` conversion ID)
   - `VITE_ADMIN_EMAILS` — optional extra UI gate (comma-separated). **RLS source of truth is** Supabase `admin_allowlist` via `is_admin()`. Keep the env list in sync if you set it.
   - `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (from Supabase API settings)
   - Optional: `VITE_GOOGLE_SITE_VERIFICATION` when Search Console HTML verify is ready
5. Deploy **this branch to Production** (not only a Preview deployment)

## Admin allowlist (security)

- **DB (source of truth):** `public.admin_allowlist` enforced by RLS `is_admin()`.
- **Client:** `VITE_ADMIN_EMAILS` is an optional extra UI gate (public in the JS bundle — not a secret).
- After changing emails, insert/delete rows in `admin_allowlist`. Update Vercel env only if you use the extra gate.
- Apply migration `harden_public_writes_push_and_rate_limits.sql` (order 27) for form rate limits, admin-only push subscriptions, and review-photo path prefix.

## Auth dashboard (manual)

Enable **leaked password protection** in Supabase → Authentication → Providers → Email (HaveIBeenPwned). This cannot be flipped via SQL.

## Manual checks (not claimed done in-repo)

- Mid-range Android on throttled 4G; NVDA/VoiceOver on admin; lawyer-grade ToS/DPDP registration; Search Console cannibalization; live [Rich Results Test](https://search.google.com/test/rich-results).

## Vercel rollback

If a bad production deploy ships: Vercel Dashboard → Deployments → open the last good deployment → **Promote to Production** (Instant Rollback). Then fix forward on a new commit. Do not force-push `main` unless you intend to rewrite history.

## Backups & free-tier limits

Supabase **Free** has no point-in-time recovery. Use the dashboard backup export / `pg_dump` before risky migrations, and plan **Pro** when Storage + egress grow (hero/gallery images) — row counts are tiny today. Pause is avoided by `.github/workflows/supabase-keep-alive.yml`; site uptime is `.github/workflows/site-uptime.yml`.

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
