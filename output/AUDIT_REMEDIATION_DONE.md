# Remediation follow-up (2026-08-12)

Implemented Full Audit Remediation Waves 1–5 in code. Summary:

## Wave 1 — Security
- Added [`supabase/migrations/harden_rls_storage_and_rpc.sql`](../supabase/migrations/harden_rls_storage_and_rpc.sql) (order 23)
- Registered in `apply-migrations.mjs` + README
- Verify helper: [`verify_harden_rls.sql`](../supabase/migrations/verify_harden_rls.sql)
- **Action required:** run `npm run db:migrate` (or paste SQL in Supabase) with DB credentials — local apply blocked (no `SUPABASE_DB_PASSWORD`)

## Wave 2 — Performance
- Hero uses CDN optimize (1280×560, q78) + Home `preloadImage`
- ExploreRange min-height + skeleton while empty/loading

## Wave 3 — Product
- Hero clear syncs `saveHeroImage(null)`
- Deleted orphan `HomepageHeroEditor.jsx`
- App-level Suspense; Admin ErrorBoundary keyed by pathname
- Inbox `scooter` column; phone normalize + honeypot on lead forms
- EMI fileCharges default; `DEFAULT_REAL_RANGE_FACTOR`; low_stock badge; image onError; admin `no-store`

## Wave 4 — SEO / Privacy
- Location meta ≤155 in source; unique localNotes/FAQs
- Footer links include low-budget + no-licence
- Privacy names GA4 + Google Ads
- Near-me / best intros differentiated

## Wave 5 — Hardening
- CI: `.github/workflows/seo-smoke.yml`
- `db:check` prints RLS verify tip
- Vite/PostCSS bumped (audit highs reduced 5→3 remaining)

## Still manual
1. Apply migration 23 live + run verify SQL
2. Sync `VITE_ADMIN_EMAILS` ↔ `admin_allowlist`
3. Re-run Lighthouse mobile after deploy
4. Admin upload smoke test (Storage is_admin)
