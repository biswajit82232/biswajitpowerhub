# AUDIT Phase 10 — Accessibility, privacy, compliance & analytics

**Date:** 2026-08-12  
**Status:** COMPLETE  
**Verdict:** PASS with privacy disclosure gaps

## Accessibility

| Check | Result |
|-------|--------|
| Lighthouse a11y (mobile) | **97** |
| Skip link → `#main-content` | PASS (`PublicLayout`) |
| Modal focus trap + Escape + restore focus | PASS (`Modal.jsx`) |
| Reveal reduced-motion | PASS (`useReducedMotion`) |
| FAQ `<details>` | Present on SEO layouts |
| Hero carousel a11y | Dots/labels; inactive `aria-hidden` (prior inventory) |
| Form labels | Admin login + lead forms use Field labels (spot) |

### Residual a11y risks (P3)

- Floating CTAs / FirstVisit prompt may compete with focus order
- Carousel autoplay not deeply verified for pause control
- Contrast on brand red vs white — LH 97 suggests mostly OK

## Privacy / trackers inventory

| Tracker | Mechanism | Disclosed in Privacy? |
|---------|-----------|------------------------|
| `bph_visitor_id` localStorage | First-party lead scoring | Yes (cookies & local storage §4) |
| `bph_events` / dedupe keys | First-party | Implied |
| GA4 `G-ZPSM06SEY4` (hardcoded fallback) | gtag idle-load | **Partial** — Privacy §5 lists Supabase/Vercel/Maps/WhatsApp but **does not name Google Analytics** |
| Google Ads `AW-*` (optional) | remarketing/conversions | **Not named** |
| Supabase | DB/storage | Yes |
| Admin PWA session | Yes §4 |

**Consent:** No cookie consent banner observed for Ads remarketing — risk if Ads ID enabled in India DPDP / user expectations (P2).

## Analytics integrity

- Event dedupe windows in `tracking.js` (page_view 30m, etc.) — good
- GA event mapping avoids shipping full PII by design (spot-check); forms store PII in Supabase not as GA params
- Conversion helpers for call/WhatsApp/directions/form

## UGC / reviews

- Anon insert forced `pending` + trigger — good
- Photo uploads to `review-photos` — depends on storage RLS (Phase 4 live)

## Findings

| ID | Sev | Finding | Recommendation |
|----|-----|---------|----------------|
| P10-01 | P2 | Privacy policy omits GA4 / Google Ads by name | Update §5 third parties |
| P10-02 | P2 | No consent UX if Ads remarketing active | Add notice or gate Ads load |
| P10-03 | P3 | Floating overlays focus order | Manual keyboard pass |
| P10-04 | INFO | A11y 97 — strong baseline | Keep regressions in CI |

## Exit criteria

- [x] A11y issue list
- [x] Tracker inventory vs Privacy
- [x] Analytics QA notes
