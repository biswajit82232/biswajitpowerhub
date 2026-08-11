# AUDIT Phase 11 — Integration matrix & release readiness

**Date:** 2026-08-12  
**Status:** COMPLETE  
**Verdict:** **NO-GO for “fully verified secure production”** until P0 live-RLS confirmed; **GO for public SEO shell** (prerender/domain healthy). Performance P0s should be remediated ASAP but are quality—not outage—blockers.

## E2E journey matrix

| # | Journey | Result | Evidence |
|---|---------|--------|----------|
| 1 | SEO page → PDP → lead → admin inbox + push | **PARTIAL** | Public SEO/PDP live OK; lead insert design OK; admin/push not logged-in tested; notify API rejects bad auth |
| 2 | Admin updates hero/finance → public | **PARTIAL** | Live hero from Supabase Storage; admin write path static-only |
| 3 | New scooter → sitemap/prerender | **DESIGN OK** | Build regenerates sitemap; needs rebuild for static HTML |
| 4 | Unknown URL → hard 404 | **PASS** | `404` on random path |
| 5 | www→apex + legacy redirects | **PASS** | 308 www→apex; products/reviews redirects |
| 6 | Supabase unset demo degrade | **PASS** (local) | db:check fails closed; app designed for seeds |
| 7 | Chunk failure `lazyRetry` | **DESIGN PASS** | Code review; not fault-injected |

## Phase scores

| Phase | Focus | Score | Notes |
|------:|-------|-------|-------|
| 1 | Root/config | PASS | 5 high npm audit (dev tooling) |
| 2 | Deploy/edge | PASS | Soft-404 fixed; headers OK |
| 3 | Architecture | PASS | Routes/resilience solid |
| 4 | DB/RLS | **CONDITIONAL** | Live RLS **unverified** |
| 5 | Auth/API | PASS* | *depends on RLS |
| 6 | Public UX | PASS | Orphan editor; hero optimize |
| 7 | SEO | PASS | Cannibalization/thin towns |
| 8 | Performance | **FAIL** | LCP/CLS/weight P0 |
| 9 | Admin ops | CONDITIONAL | Needs live admin QA |
| 10 | A11y/privacy | PASS* | GA disclosure gap |
| 11 | Release | — | This scorecard |

## Severity rollup

| Sev | Count (approx) | Themes |
|-----|---------------:|--------|
| P0 | 6 | Live RLS unknown; **site/offers policy-name leak**; Storage not admin-gated; LCP; CLS; weight |
| P1 | 8+ | Allowlist drift; hero clear sync; admin Suspense; anon handled=true; analytics meta PII; main-thread |
| P2 | 15+ | Phone/EMI/range drift; cannibalization; thin towns; privacy/Ads; Vyapar; price drift |
| P3 | 15+ | Footer SEO gaps; meta lengths; orphan editor; npm audit tooling |

## Deep-dive addenda (post subagent)

Findings from follow-up static passes folded into Phases 3/4/6 and this scorecard:
- Architecture: admin Suspense / ErrorBoundary remount gaps
- RLS: lock migration **does not drop** `"auth all site settings"` / `"auth all offers"`
- UX: hero clear ineffective vs finance fallback; validation/EMI/range inconsistencies

## Prioritized remediation roadmap

1. **Security hotfix:** Drop mismatched legacy policies; Storage → `is_admin()`; live policy proof; sync allowlists.
2. **Performance:** CDN hero + preload; `#models` CLS skeletons; cut weight.
3. **Product:** Hero clear sync; phone normalize; admin Suspense; inbox `scooter` column.
4. **SEO/privacy:** Location meta; GA/Ads disclosure; CI smoke.

## Re-audit cadence

| Cadence | Scope |
|---------|-------|
| After each production deploy | Phase 2 curl matrix + `qa:seo` |
| Monthly | GSC deep audit + cannibalization |
| Quarterly | Full RLS policy dump + auth allowlist sync |
| After major homepage/hero change | Lighthouse mobile home + PDP |

## GO / NO-GO

| Question | Decision |
|----------|----------|
| Is apex/www + prerender SEO healthy? | **GO** |
| Is admin/data security proven live? | **NO-GO until P4-01 closed** |
| Are mobile CWV acceptable for marketing spend? | **NO-GO / remediation required** (score 38) |
| Overall production confidence | **CONDITIONAL GO** — keep site live; block claiming “audit-cleared security/perf” until P0s closed |

## Artifacts

- `output/AUDIT_PHASE_01.md` … `output/AUDIT_PHASE_11.md`
- `output/AUDIT_MASTER_SCORECARD.md` (this file’s twin summary)
- Helpers: `output/_audit_fetch_titles.mjs`, `output/_audit_lh_details.cjs`
