# AUDIT MASTER SCORECARD — Biswajit Power Hub

**Audit date:** 2026-08-12  
**Scope:** Full 11-phase verification (static + live HTTP + Lighthouse artifacts + QA scripts)  
**Overall:** **CONDITIONAL GO** → **code remediation shipped 2026-08-12**; remain CONDITIONAL until migration 23 is applied live and Lighthouse re-run after deploy.

See [`AUDIT_REMEDIATION_DONE.md`](./AUDIT_REMEDIATION_DONE.md).

## Executive summary

Production **SEO shell is healthy**: www→apex, hard 404s, unique prerendered titles/JSON-LD, `qa:seo`/`qa:gsc` pass.  
**Security is not fully proven** from this workstation (no Supabase credentials → live RLS unconfirmed).  
**Mobile performance fails** CWV bar (Lighthouse 38; LCP 9.3s; CLS 0.445; ~7.7 MB).

## Phase results

| Phase | Verdict | Top issue |
|------:|---------|-----------|
| 01 Root | PASS | npm audit 5 high (tooling) |
| 02 Deploy | PASS | Align `/admin` cache with no-store |
| 03 Architecture | PASS | Stubs `/dealership` `/updates` |
| 04 Supabase/RLS | CONDITIONAL | **P0 live RLS unknown** |
| 05 Auth/API | PASS* | Dual allowlist drift |
| 06 Public UX | PASS | Hero `optimize={false}`; orphan editor |
| 07 SEO | PASS | Cannibalization + thin towns |
| 08 Performance | **FAIL** | LCP/CLS/weight |
| 09 Admin | CONDITIONAL | Needs live admin E2E |
| 10 A11y/Privacy | PASS* | GA/Ads not named in Privacy |
| 11 Release | CONDITIONAL GO | Close P0s |

## P0 blockers

1. **P4-01** — Confirm lock migration applied live (`pg_policies` + non-admin write probes).
2. **P4-02** — Lock drops **wrong policy names** for `site_settings` / `promotional_offers` → any Auth JWT may still write those tables.
3. **P4-03** — Storage INSERT/DELETE not `is_admin()`-gated (catalog/hero wipe risk).
4. **P8-01** — Mobile LCP 9.3s (hero full-res Storage URL, `optimize={false}`).
5. **P8-02** — Mobile CLS 0.445 (`#models` + footer).
6. **P8-03** — ~7.7 MB total transfer on home.

## P1 highlights

- Allowlist emails may diverge (DB seed vs DEPLOYMENT_NOTE vs `VITE_ADMIN_EMAILS`).
- Hero clear leaves finance `hero_image_url` (public still shows old hero).
- Admin lazy routes lack outer Suspense; admin ErrorBoundary no route remount.
- Anon form inserts can set `handled=true`; analytics RPC may leak names in `meta`.
- Main-thread / TTI poor on mobile.

## What passed cleanly

- Soft-404 mitigation (unknown URLs → HTTP 404)
- www → apex 308
- Unique prerender meta on sampled routes
- `/ad-landing` noindex
- Notify API rejects unauthorized (401)
- `qa:seo` ALL_CHECKS_PASSED; sitemap 59
- Lighthouse SEO 100 / a11y 97
- ErrorBoundary + lazyRetry architecture

## Recommended next actions (ordered)

1. **Security hotfix migration:** drop `"auth all site settings"` + `"auth all offers"`; gate Storage writes to `is_admin()`; tighten anon insert CHECK; redact analytics `meta` PII.
2. Ops: live `pg_policies` dump + non-allowlisted JWT write probes; sync allowlist emails.
3. Perf: CDN-optimize hero + preload; reserve space for Explore Range.
4. Product: fix hero clear → finance sync; phone normalize; admin Suspense.
5. Content/privacy: location meta; name GA/Ads in Privacy; CI smoke.

## Evidence index

| File | Phase |
|------|------:|
| [AUDIT_PHASE_01.md](./AUDIT_PHASE_01.md) | 1 |
| [AUDIT_PHASE_02.md](./AUDIT_PHASE_02.md) | 2 |
| [AUDIT_PHASE_03.md](./AUDIT_PHASE_03.md) | 3 |
| [AUDIT_PHASE_04.md](./AUDIT_PHASE_04.md) | 4 |
| [AUDIT_PHASE_05.md](./AUDIT_PHASE_05.md) | 5 |
| [AUDIT_PHASE_06.md](./AUDIT_PHASE_06.md) | 6 |
| [AUDIT_PHASE_07.md](./AUDIT_PHASE_07.md) | 7 |
| [AUDIT_PHASE_08.md](./AUDIT_PHASE_08.md) | 8 |
| [AUDIT_PHASE_09.md](./AUDIT_PHASE_09.md) | 9 |
| [AUDIT_PHASE_10.md](./AUDIT_PHASE_10.md) | 10 |
| [AUDIT_PHASE_11.md](./AUDIT_PHASE_11.md) | 11 |
