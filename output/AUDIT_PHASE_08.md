# AUDIT Phase 8 — Performance, images & Core Web Vitals

**Date:** 2026-08-12  
**Status:** COMPLETE  
**Verdict:** **FAIL mobile CWV targets** (SEO/a11y strong)

## Baseline (existing Lighthouse JSON, home)

| Category | Mobile | Desktop |
|----------|-------:|--------:|
| Performance | **38** | **71** |
| Accessibility | 97 | — |
| Best-practices | 77 | — |
| SEO | 100 | — |

### Mobile CWV

| Metric | Value | Assessment |
|--------|------:|------------|
| FCP | 2.0 s | OK-ish |
| LCP | **9.3 s** | **P0** |
| CLS | **0.445** | **P0** |
| TBT | 340 ms | Fair |
| TTI | 16.6 s | Poor |
| Speed Index | 7.8 s | Poor |
| Total bytes | ~7.7 MB | **P0** |
| Main-thread | 3.9 s | P1 |
| Unused JS | ~151 KiB | P2 |

## LCP element (identified)

Hero carousel `<img>`:
- URL: Supabase **`/storage/v1/object/public/scooter-…`** (full object, not render CDN)
- `loading=eager` `fetchpriority=high` `width=1920` `height=840`
- Code: `HeroCarousel.jsx` sets **`optimize={false}`**

LCP breakdown:
- TTFB ~249 ms (OK)
- **Resource load delay ~1612 ms** (late discovery / dependency)
- Resource load duration ~351 ms
- Render delay ~84 ms

**Root cause hypothesis:** Full-bleed uncompressed hero + JS/CSS delay before image request; skipping CDN resize keeps mobile download heavy.

## CLS culprits

1. `#models` / Explore Our Range section (~0.338) — likely async popularity/catalog content shifting layout
2. `footer` (~0.107)

## Ranked remediation

| Priority | Fix | Expected impact |
|----------|-----|-----------------|
| P0 | Serve hero via `imageCdn` with width≈800–1200 WebP/AVIF; keep eager+high | LCP + bytes |
| P0 | Preload LCP image URL in prerender/`index.html` once known | Cut resource load delay |
| P0 | Reserve height for `#models` grid / skeletons to stop CLS | CLS |
| P1 | Audit 7.7 MB payload — gallery images, fonts, motion | Bytes |
| P1 | Ensure first hero not competing with motion/fonts | LCP |
| P2 | Trim unused JS; review Framer Motion on first paint | TBT/TTI |
| P2 | Third-party: GA idle-load already present — verify Ads not eager | Best practices |

## Findings

| ID | Sev | Finding |
|----|-----|---------|
| **P8-01** | **P0** | Mobile LCP 9.3s — hero full-res Storage URL with `optimize={false}` |
| **P8-02** | **P0** | Mobile CLS 0.445 — models section + footer |
| **P8-03** | **P0** | ~7.7 MB total page weight |
| P8-04 | P1 | Main-thread 3.9s / TTI 16.6s |
| P8-05 | P2 | Unused JS ~151 KiB |
| P8-06 | P3 | Best-practices 77 (third-party cookies / issues panel) |

## Exit criteria

- [x] CWV scorecard
- [x] Ranked perf fix list (LCP/CLS first)
