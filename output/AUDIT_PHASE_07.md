# AUDIT Phase 7 — SEO, prerender, local SEO & GSC readiness

**Date:** 2026-08-12  
**Status:** COMPLETE  
**Verdict:** PASS with content-quality warnings

## Automated QA

| Command | Result |
|---------|--------|
| `npm run qa:seo` | **ALL_CHECKS_PASSED** (59 sitemap URLs; 404.html; WhatsApp; maps; geo) |
| `npm run qa:gsc` | **GSC_DEEP_AUDIT_PASSED** — 0 errors, **9 warnings** (meta description length > ~160–170 on satellite towns) |

## Live prerender uniqueness

Confirmed unique titles/canonicals/JSON-LD on home, Activa PDP, Berhampore location, best-scooters, guides; `/ad-landing` noindex (Phase 2).

## Cannibalization map (Berhampore cluster)

| URL | Intent |
|-----|--------|
| `/` | Brand + dealer home |
| `/electric-scooter-near-me-berhampore` | Near-me |
| `/electric-scooters-berhampore` | Location hub |
| `/best-electric-scooters-berhampore` | Best-of |
| `/low-budget-electric-scooters-berhampore` | Budget |
| `/test-ride-berhampore` | Test ride |

**Risk P2:** Overlap is intentional for local SEO but needs differentiated H1/body and internal linking discipline (already partially present via related links).

## Thin / doorway risk

15 satellite towns via `buildLocation()` — many share FAQ/intro patterns; GSC warnings on long descriptions correlate with templated copy.

Guides ↔ landings topical overlap (no-licence, battery, EMI) — related links help.

Shared `SITE_FAQS` reused across FAQPage schemas → duplicate FAQ entities sitewide (P3).

## Redirects

Live: `/products`→`/scooters`, `/reviews`→`/community` (308). Robots disallow admin/dealership/updates/ad-landing.

## Build-time vs live catalog

Fallback prerender may embed prices at build time; runtime pages fetch Supabase — **price drift risk** if inventory changes without rebuild (P2).

## Findings

| ID | Sev | Finding | Recommendation |
|----|-----|---------|----------------|
| P7-01 | P2 | Berhampore URL cluster cannibalization | Differentiate copy; consolidate weaker pages if GSC shows cannibalization |
| P7-02 | P2 | Satellite towns thin/templated | Unique local notes per town; trim meta desc to ≤155 |
| P7-03 | P2 | Prerender price/stock drift | Rebuild on catalog change or inject fewer price claims in static HTML |
| P7-04 | P3 | 9 GSC meta-desc length warnings | Shorten location descriptions |
| P7-05 | P3 | Shared FAQ schema repetition | Vary FAQs per page type |

## Exit criteria

- [x] Sitemap/robots/prerender coverage
- [x] qa:seo + qa:gsc run
- [x] Cannibalization map documented
