# AUDIT Phase 2 — Build, deploy & edge configuration

**Date:** 2026-08-12  
**Status:** COMPLETE  
**Verdict:** PASS with findings (no soft-404 regression on unknown URLs; apex/www correct)

## Method

Static review of `vercel.json`, build scripts, keep-alive workflow; live `curl`/`fetch` matrix against production.

## `vercel.json` review

| Control | Expected | Result |
|---------|----------|--------|
| www → apex | Permanent redirect | PASS — `www` → `308` `https://biswajitpowerhub.in/` |
| `/products` → `/scooters` | Permanent | PASS — `308` `/scooters` |
| `/reviews` → `/community` | Permanent | PASS — `308` `/community` |
| Catch-all SPA rewrite | Must NOT exist | PASS — none in config |
| Rewrites | `/admin`, `/admin/*`, `/scooters/:id`, `/accessories/:id` → `index.html` | PASS (as coded) |
| Security headers | HSTS, nosniff, XFO, Referrer, Permissions | PASS on apex |
| Non-prod host X-Robots | noindex | Config present (cannot verify preview host in this run) |
| `/admin` headers | noindex; `/admin/*` no-store | PASS — `/admin` has `X-Robots-Tag: noindex,nofollow`; `/admin/login` has `Cache-Control: no-store` + noindex |
| `/assets/*` immutable cache | Configured | Config PASS (not re-probed asset hash URL) |

## Live curl matrix

| URL | Status | Notes |
|-----|--------|-------|
| `https://www.biswajitpowerhub.in/` | 308 → apex | Correct direction (matches DEPLOYMENT_NOTE) |
| `https://biswajitpowerhub.in/` | 200 | Titles unique (see below) |
| `/products` | 308 → `/scooters` | OK |
| `/reviews` | 308 → `/community` | OK |
| `/this-page-should-404-audit-xyz` | **404** | Hard 404 — soft-404 risk mitigated |
| `/sitemap.xml` | 200 `application/xml` | OK |
| `/og-image.png` | 200 `image/png` | OK |
| `/robots.txt` | 200 | OK |
| `/admin` | 200 + noindex | SPA shell rewrite OK |

## Prerender / unique HTML (live)

| Path | Status | Unique title? | JSON-LD blocks | Canonical | Robots |
|------|--------|---------------|----------------|-----------|--------|
| `/` | 200 | Yes (Berhampore dealer) | 5 | apex `/` | index,follow |
| `/scooters/activa` | 200 | Yes (Activa) | 2 | `/scooters/activa` | index,follow |
| `/electric-scooters-berhampore` | 200 | Yes | 4 | self | index,follow |
| `/best-electric-scooters-berhampore` | 200 | Yes | 1 | self | index,follow |
| `/guides` | 200 | Yes | 1 | self | index,follow |
| `/ad-landing` | 200 | Yes | 0 | self | **noindex,nofollow** |
| Low-budget / no-licence | 200 | Yes | 1 each | self | index,follow |

**Conclusion:** Production is serving unique prerendered meta (not empty SPA shell). Domain orientation matches repo intent.

## Build pipeline (static)

```
prebuild: generate-brand-pngs
build: generate-sitemap → vite build → fallback-prerender
```

- Puppeteer `prerender.mjs` skipped on Vercel — production relies on fallback inject (acceptable; verified live).
- Local full `npm run build` recommended as regression gate; not blocking live evidence.

## Keep-alive CI

- [`.github/workflows/supabase-keep-alive.yml`](../.github/workflows/supabase-keep-alive.yml): cron every 3 days + manual dispatch; requires `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` secrets.
- Aligns with [`scripts/keep-alive.mjs`](../scripts/keep-alive.mjs).
- **Cannot verify** last successful Actions run from this workspace without `gh` auth to the repo.

## Findings

| ID | Sev | Finding | Recommendation |
|----|-----|---------|----------------|
| P2-01 | P3 | `/admin` returns `Cache-Control: public, max-age=0, must-revalidate` while `/admin/login` is `no-store` | Align `/admin` index rewrite with `no-store` like `/admin/(.*)` |
| P2-02 | P3 | Keep-alive workflow success not verified in this audit | Confirm Actions green + secrets set |
| P2-03 | INFO | Local build not re-run in Phase 2 | Run before next production deploy |

## Exit criteria

- [x] Deploy checklist / curl matrix green (www→apex, unique titles, hard 404)
- [x] Soft-404 regression absent
- [x] Security headers present on apex
- [~] Keep-alive health — config OK, live Actions unverified
