# AUDIT Phase 6 — Public UX, catalog & content systems

**Date:** 2026-08-12  
**Status:** COMPLETE  
**Verdict:** PASS with content/ops findings

## NAP / phone consistency

Canonical: `GBP_NAP.phoneDisplay = '096355 05436'`, digits `9635505436` in [`src/config/site.js`](../src/config/site.js).

Hardcoded `096355 05436` appears widely in:
- `locations.js`, `blogPosts.js`, `seoContent.js`
- Home / Best / LowBudget / NoLicence / LocationLanding / ScooterDetails / catalogCopy

**Result:** Display string matches GBP_NAP (PASS). Risk = future phone change requires many string edits (P3 maintainability). Prefer `formatPhoneDisplay(site)` everywhere.

## Hero / site photos

| Check | Result |
|-------|--------|
| `sitePhotosService` syncs hero → `saveHeroImage` | PASS (import + call) |
| `HomepageHeroEditor` imports elsewhere | **NONE** — orphaned component (P3) |
| Live hero | Supabase Storage public object URL (Lighthouse LCP) |

## Images

- `SiteImage` + `imageCdn.js`: transform `object/public` → `render/image/public` with width/quality
- `HeroCarousel`: first slide `loading=eager` + `fetchPriority=high` but **`optimize={false}`** → bypasses CDN resize (ties to Phase 8 LCP)

## Forms / validation

[`validation.js`](../src/features/leads/validation.js):
- Phone: `^[6-9]\d{9}$` (IN mobile)
- Name ≥ 2 chars
- Email optional but format-checked

WhatsApp helpers centralised in `site.js` (`whatsappUrl`, `telUrl`) — used by CTAs.

## Finance math

[`lib/finance.js`](../src/lib/finance.js): flat interest on **full vehicle price**, file charges added, EMI = (total − down) / n.  
Defaults from `config/finance.js` via `FinanceSettingsContext` / admin Finance page.

Example comment matches formula (₹69,999 @ 10% / 12 mo + ₹2500).

## Catalog

- 4 SEO-ready models (`seoReady.js`)
- Services fall back to seeds when Supabase unset
- Stock/featured/variants handled in scooterService + UI cards

## Findings (deep static follow-up)

| ID | Sev | Finding | Recommendation |
|----|-----|---------|----------------|
| **P6-01** | **P1** | Clearing site-photos hero does **not** clear `finance_settings.hero_image_url`; `Home`/`HeroCarousel` still fall back to finance hero | Call `saveHeroImage(null)` / clear finance hero on photo clear; one canonical source |
| P6-02 | P2 | Orphaned `HomepageHeroEditor.jsx` (and 10MB vs 20MB copy mismatch if revived) | Delete; keep `SitePhotosEditor` only |
| P6-03 | P2 | Phone hardcoding sprawl + display drift (`096355…` vs `+91 96355…`) | Use `formatPhoneDisplay` / site context everywhere |
| P6-04 | P2 | `isValidPhone` rejects pasted `+91` / spaces / leading `0` | Normalize digits before validate |
| P6-05 | P2 | EMI `fileCharges`: `emiFrom` defaults 2500; `EMICalculator` uses `settings?.fileCharges ?? 0` | Align fallbacks |
| P6-06 | P2 | `realRangeFactor` defaults diverge (0.82 / 0.83 / 0.85) across seed/service/simulator/badges | Single constant |
| P6-07 | P2 | `catalogStats` / featured helpers unused; stock badge UX differs ScooterCard vs DealerProductCard | Clean dead code or wire consistently |
| P6-08 | P2 | Hero `optimize={false}` full-res Storage URL | CDN width for mobile LCP (Phase 8) |
| P6-09 | P3 | Some thumbs (`AccessoryDetails`, `ReviewCard`) lack `onError` CDN fallback | Match SiteImage cascade |
| P6-10 | INFO | Catalog CRUD live reflection not exercised | Manual admin QA |

## Exit criteria

- [x] Public content consistency checklist
- [x] Orphan editor + hero sync gaps flagged
- [x] Validation / EMI math reviewed
