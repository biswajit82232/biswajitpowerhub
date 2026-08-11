# AUDIT Phase 5 — Auth, admin gating, secrets & API security

**Date:** 2026-08-12  
**Status:** COMPLETE  
**Verdict:** PASS with P1 dual-allowlist / live-RLS dependency

## Auth flow

1. `AuthContext` → Supabase `getSession` + `onAuthStateChange` (8s fail-safe)
2. `signIn` → password auth → `isAdminEmail` → else force `signOut`
3. `ProtectedRoute` → no session → `/admin/login`; non-allowlisted → denied UI

### `adminAccess.js` behavior

| Condition | Result |
|-----------|--------|
| Email in `VITE_ADMIN_EMAILS` | Allow |
| List empty + DEV | Allow any authenticated user |
| List empty + PROD | Deny all |

**Important:** Client allowlist is UX only. Real data protection = Supabase RLS `is_admin()`.

## Notify API (`/api/admin-notify`) — live probes

| Request | Status | Expected |
|---------|--------|----------|
| POST no auth | **401** | PASS |
| POST Bearer `wrong` | **401** | PASS |
| GET | **405** | PASS |

Secrets referenced server-side only: `ADMIN_NOTIFY_SECRET`, `VAPID_PRIVATE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

OPTIONS CORS `Access-Control-Allow-Origin: *` — acceptable for webhook POST with Bearer; not a browser cookie session.

## Admin PWA SW (`public/admin/sw.js`)

- Scope `/admin`
- Precache: manifest + icons only (not CRM JSON)
- Navigations: **network-first**, caches `/admin` shell fallback
- Does not intentionally cache Supabase REST responses
- Risk: offline shell may show stale SPA HTML (not private rows) — acceptable P3

## Bundle secret scan (static)

- No `SUPABASE_SERVICE_ROLE_KEY` / `VAPID_PRIVATE_KEY` literals in `src/`
- Client may contain anon key + VAPID public + admin emails (expected)

## Threat model (tested / reasoned)

| Attack | UI | Data |
|--------|----|------|
| Random user signs up + hits `/admin` | Denied if allowlist set in PROD | RLS must deny writes |
| Authenticated non-allowlisted | Denied | **Depends on lock migration (P4-01)** |
| Forged webhook | 401 without secret | PASS |
| Steal anon key | Can insert leads/reviews as designed | Spam P2 |

## Findings

| ID | Sev | Finding | Recommendation |
|----|-----|---------|----------------|
| P5-01 | P1 | Client `VITE_ADMIN_EMAILS` ≠ DB `admin_allowlist` can diverge | Ops checklist: sync both; document owner emails |
| P5-02 | P2 | DEV empty allowlist allows any Supabase user into UI | Never ship unset allowlist to preview-as-prod |
| P5-03 | P3 | Notify API OPTIONS allows `*` | Fine for secret Bearer; keep secret strong |
| P5-04 | INFO | Live non-admin write test not executed (no credentials) | Pair with Phase 4 live RLS |

## Exit criteria

- [x] Auth threat model documented
- [x] Notify API unauthorized rejected
- [x] Secret classification
- [~] Non-admin write failure — deferred to live RLS (P0)
