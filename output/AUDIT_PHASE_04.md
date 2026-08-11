# AUDIT Phase 4 — Supabase schema, migrations, storage & RLS

**Date:** 2026-08-12  
**Status:** COMPLETE (static + blocked live check)  
**Verdict:** CONDITIONAL PASS — **live RLS application not verified** (P0 gate)

## Live connectivity

```
npm run db:check → ❌ App not connected — missing VITE_SUPABASE_URL / ANON_KEY in local .env
```

Production site clearly uses Supabase (hero LCP URL `njismcewpiwjmotzwbkn.supabase.co`), but this audit **could not** query live policies from the workstation env.

## Intended RLS matrix (after migrations)

| Table | anon SELECT | anon INSERT | authenticated write |
|-------|-------------|-------------|---------------------|
| scooters / accessories | public read | no | `is_admin()` only |
| finance_settings / site_settings | public read | no | `is_admin()` |
| reviews | approved only | pending-only (+ trigger force pending) | `is_admin()` |
| callbacks / test_rides / service_bookings / contact_messages | no | yes (open) | `is_admin()` |
| lead_events | no direct | yes | `is_admin()` |
| leads | no open update | via `upsert_lead` RPC | `is_admin()` |
| admin_allowlist | self-read | no | managed |
| admin_push_subscriptions | own rows | own | own |
| vyapar_* / promotional_offers | per migration | — | `is_admin()` |

## How lock supersedes base schema

[`schema.sql`](../supabase/schema.sql) creates permissive `auth all * using (true)`.  
[`lock_admin_rls_allowlist.sql`](../supabase/migrations/lock_admin_rls_allowlist.sql):

1. Creates `admin_allowlist` + `is_admin()`
2. Seeds `biswajithowladar123@gmail.com`
3. **Drops** legacy `auth all …` policies (by expected names)
4. Creates `admin all … using (is_admin())`

[`fix_critical_rls_and_rpc.sql`](../supabase/migrations/fix_critical_rls_and_rpc.sql): pending reviews + `upsert_lead` + `get_analytics_events`.

### P0 — Lock incomplete for site + offers (policy name mismatch)

Deep static review found **drop-name mismatches**. Postgres ORs permissive policies, so leftovers defeat `admin all *`:

| Actual legacy policy name | What lock migration drops |
|---------------------------|---------------------------|
| `"auth all site settings"` (`add_site_settings.sql`) | `"auth all site_settings"` / `"auth all sitesettings"` |
| `"auth all offers"` (`add_promotional_offers.sql`) | `"auth all promotional_offers"` / `"auth all promotionaloffers"` |

**Impact:** Any authenticated Supabase JWT (not just UI allowlist) can likely **UPDATE/DELETE `site_settings` and `promotional_offers`** until those exact policy names are dropped.

Also leftover: `"auth read all offers"`, `"auth read vyapar_*"` (any auth can read inactive offers / Vyapar raw JSON).

## RPC abuse surface

| RPC | Risk | Mitigation |
|-----|------|------------|
| `upsert_lead` (SECURITY DEFINER, granted anon) | Spam / score inflation / poison classification | visitor_id required; no captcha/rate limit |
| `get_analytics_events` (SECURITY DEFINER) | **`meta` may leak callback names to anon**; visitor_id redacted post-lock | Filter/redact `meta` PII; confirm lock body live |

## Storage

Buckets: `scooter-images`, `accessory-images`, `review-photos`.  
**Writes/deletes are any `authenticated` (not `is_admin`)** — catalog/hero assets and review photo deletes are not allowlist-gated.  
`review-photos` allows **anon** insert.  
Hero/site uploads use `upsert: true` but Storage may lack UPDATE policies.

## Schema drift vs services

| Issue | Notes |
|-------|-------|
| `inboxService` selects `reviews.product` | Column is `scooter` — pending review queue may break |
| Dual allowlists | UI `VITE_ADMIN_EMAILS` ≠ DB `admin_allowlist` |
| `db:check` | Only probes table reachability — **does not assert RLS** |

## Allowlist divergence (code vs docs vs seed)

| Source | Email |
|--------|-------|
| Migration seed | `biswajithowladar123@gmail.com` |
| `DEPLOYMENT_NOTE.md` example | `biswajitpowerhub@gmail.com` |
| `VITE_ADMIN_EMAILS` (prod) | Unknown from this env — **must confirm match with DB** |

## Findings

| ID | Sev | Finding | Recommendation |
|----|-----|---------|----------------|
| **P4-01** | **P0** | Live migration/RLS state unverified | `pg_policies` dump + non-admin write probes |
| **P4-02** | **P0** | Lock drops wrong names for `site_settings` / `promotional_offers` — any auth JWT may still write | New migration: `DROP POLICY "auth all site settings"` / `"auth all offers"`; gate Storage to `is_admin()` |
| **P4-03** | **P0** | Storage INSERT/DELETE not allowlist-gated | Restrict to `is_admin()` (reviews insert path separate) |
| P4-04 | P1 | Anon inserts `WITH CHECK (true)` can set `handled=true` / hide from queues | Tighten WITH CHECK columns |
| P4-05 | P1 | Analytics RPC `meta` PII leak | Redact names from public RPC |
| P4-06 | P1 | Dual allowlist drift (env vs DB vs DEPLOYMENT_NOTE) | Sync single source of truth |
| P4-07 | P2 | `inboxService` `product` vs `scooter` column | Fix select column |
| P4-08 | P2 | `upsert_lead` abuse / no rate limit | Captcha or edge rate limit |
| P4-09 | P3 | `db:check` does not validate policies | Extend checker |

## Exit criteria

- [x] Static RLS matrix
- [x] Migration supersession explained (incl. **incomplete lock** on site/offers)
- [ ] **Live RLS proof** — BLOCKED (P0 open)
