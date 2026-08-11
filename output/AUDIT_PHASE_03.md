# AUDIT Phase 3 — Architecture, routing & resilience

**Date:** 2026-08-12  
**Status:** COMPLETE  
**Verdict:** PASS with minor findings

## Route inventory (`src/App.jsx`)

All lazy routes use `lazyRetry`. Component files exist for every import.

### Public (`PublicLayout`)
| Path | Component | Exists |
|------|-----------|--------|
| `/` | Home | Yes |
| `/scooters`, `/scooters/:id` | Scooters, ScooterDetails | Yes |
| `/accessories`, `/accessories/:id` | Accessories, AccessoryDetails | Yes |
| `/compare`, `/community`, `/reviews`→community | Compare, Reviews | Yes |
| `/about`, `/service`, `/finance`, `/offers`, `/contact` | matching pages | Yes |
| SEO keyword landings (6) | seo/* | Yes |
| `/areas-we-serve`, `/electric-scooters-:slug` | AreasWeServe, locationPages | Yes |
| `/guides`, `/guides/:slug` | Guides, GuidePost | Yes |
| `/terms`, `/privacy` | Terms, Privacy | Yes |
| `/dealership`, `/updates` | InternalStub | Yes |
| `*` | NotFound | Yes |

### Ads (`BareAdsLayout`)
| `/ad-landing` | AdLanding | Yes — live robots `noindex,nofollow` |

### Admin
| `/admin/login` unprotected; `/admin/*` under `ProtectedRoute` + `AdminLayout` | All listed admin pages exist; `*` → AdminNotFound |

## Nav / Footer vs routes

| Source | Links | Dead links? |
|--------|-------|-------------|
| `NAV_LINKS` | scooters, accessories, compare, about, service, finance, contact | None |
| `FOOTER_MODEL_LINKS` | 4 SEO-ready PDPs | None |
| `FOOTER_MORE_LINKS` | finance, #simulator, service#book, community, guides, accessories | Hash anchors intentional |
| `FOOTER_QUICK_LINKS` | about, contact, privacy, offers + SEO hubs | None found in spot-check |
| Admin `NAV_GROUPS` | matches App admin routes | PASS |

## Resilience

| Control | Coverage | Notes |
|---------|----------|-------|
| Root `ErrorBoundary` | `main.jsx` wraps entire tree | PASS |
| Per-route `ErrorBoundary` | `PublicLayout` keyed by pathname | PASS |
| Admin `ErrorBoundary` | Around outlet in AdminLayout | PASS |
| Ads `ErrorBoundary` + Suspense | BareAdsLayout | PASS |
| `lazyRetry` | All App lazy imports | 2 retries + one sessionStorage-gated reload |
| Auth fail-safe | 8s timeout in AuthContext | Prevents infinite loader |

## Providers (`main.jsx` order)

```
ErrorBoundary → HelmetProvider → BrowserRouter → AuthProvider →
SiteSettingsProvider → FinanceSettingsProvider → SitePhotosProvider →
ToastProvider → App
```

Demo mode: when Supabase unset, services fall back to seeds/localStorage (verified Phase 1 — local env lacks Supabase keys).

## Findings

| ID | Sev | Finding | Recommendation |
|----|-----|---------|----------------|
| P3-01 | **P1** | Lazy `AdminLogin` / `AdminLayout` lack an outer `Suspense` (public/ads have it). First admin chunk failure is weaker. | Wrap admin routes in Suspense + RouteLoader at App level |
| P3-02 | P2 | Admin `ErrorBoundary` has no `key={pathname}` — stuck error UI across admin navigations | Match PublicLayout remount pattern |
| P3-03 | P3 | Footer Quick Links omit two indexable SEO pages (`low-budget-…`, `no-licence-…`) | Optional completeness |
| P3-04 | P3 | `/dealership`, `/updates` still routed (robots + noindex OK) | Keep stubs or remove if unused |
| P3-05 | INFO | No automated route smoke tests | Add Playwright/curl CI later |

## Exit criteria

- [x] Route map vs files (45/45)
- [x] Nav/Footer consistency (no dead primary links)
- [x] ErrorBoundary / lazyRetry coverage documented (admin Suspense gap noted)
