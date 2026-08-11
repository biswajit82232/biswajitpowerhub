# AUDIT Phase 9 — Admin CRM, finance, Vyapar & ops workflows

**Date:** 2026-08-12  
**Status:** COMPLETE (static + API probe; interactive admin session not available)  
**Verdict:** PASS design / CONDITIONAL ops (live E2E needs credentials)

## Admin surface inventory

| Area | Routes | Service |
|------|--------|---------|
| Dashboard | `/admin` | inbox badges via `getInboxBadges` (60s poll) |
| Catalog | inventory, accessories, vyapar | scooter/accessory/vyapar services |
| Leads | leads, callbacks, test-rides, service-bookings, messages | leadService + inboxService |
| Marketing | reviews, offers, homepage photos | review/offer/sitePhotos |
| Site | finance, settings, analytics | finance/site/analytics |

## Workflow matrix (static design review)

| Journey | Design | Live verified? |
|---------|--------|----------------|
| Form → table insert → inbox badge | Yes (`leadService`, badges) | No (no admin login) |
| Review pending → approve → public | Yes (RLS + trigger pending) | No |
| Site photos → hero sync finance | Yes (`saveHeroImage`) | Partial (live hero URL exists) |
| Finance settings → public EMI | Yes (context + `emiFrom`) | No |
| Push subscribe → webhook notify | API 401 without secret (secure) | End-to-end push not fired |
| Vyapar scrape | Client fetch + mapping | Timeout 15s AbortController |
| Reset popularity counters | Admin control exists | Safety = admin-only UI; RLS must enforce |

## Dead / confusing UI

- `HomepageHeroEditor.jsx` orphaned (Phase 6) — Homepage uses `SitePhotosEditor`
- Dual hero paths historically (finance `hero_image_url` vs site photos) — sync code mitigates

## Pull-to-refresh / PWA

- `usePullToRefresh` present for admin mobile UX
- Admin SW network-first shell (Phase 5)

## Findings

| ID | Sev | Finding | Recommendation |
|----|-----|---------|----------------|
| P9-01 | P2 | Admin E2E (lead→push→inbox) not executed in this audit | Manual QA with production admin |
| P9-02 | P3 | Orphan hero editor | Remove |
| P9-03 | P2 | Vyapar client-side scrape brittle (CORS/HTML changes) | Monitor failures; document |
| P9-04 | P3 | Analytics reset buttons powerful | Confirm RLS + confirm dialog |

## Exit criteria

- [x] Admin workflow matrix
- [x] Dead UI listed
- [~] Live push/inbox E2E — deferred (credentials)
