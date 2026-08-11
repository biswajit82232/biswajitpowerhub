# AUDIT Phase 1 — Root inventory & configuration integrity

**Date:** 2026-08-12  
**Status:** COMPLETE  
**Verdict:** PASS with findings (P1–P3)

## Method

Inventory of root files/folders; script→file mapping; `.env.example` vs usage; gitignore/secret scan; `npm audit`; brand/meta consistency spot-check.

## Root inventory

| Path | Role | Notes |
|------|------|-------|
| `package.json` / `package-lock.json` | Scripts & deps | Scripts all resolve to existing `scripts/*.mjs` |
| `vite.config.js` | Build | React, SSL (non-http), `@` alias, manualChunks, GSC meta plugin |
| `tailwind.config.js` | Design tokens | Brand red/navy |
| `postcss.config.js` | CSS pipeline | OK |
| `eslint.config.js` | Lint | Ignores `dist`, `output` |
| `index.html` | SPA shell | OG/Twitter, fonts, admin SW bootstrap |
| `vercel.json` | Edge config | Redirects/rewrites/headers |
| `.env.example` | Env docs | Documents client + server secrets |
| `.env.local` | Local secrets | Gitignored; keys present: `VERCEL_OIDC_TOKEN` only |
| `.gitignore` | Ignore rules | `.env*`, `dist`, `.vercel`, `supabase/.temp/` |
| `README.md` | Docs | Stack/setup |
| `DEPLOYMENT_NOTE.md` | Deploy ops | Soft-404 + domain checklist; embeds example Production env values |
| `src/` | App | ~188 JS/JSX |
| `public/` | Static | sitemap, robots, brand, admin PWA |
| `scripts/` | Build/ops | 10 scripts — all referenced scripts exist |
| `api/` | Serverless | `admin-notify.js` only |
| `supabase/` | Schema/migrations | schema + seed + 22 migrations |
| `docs/` | Push docs | admin-push-notifications |
| `.github/` | CI | keep-alive only |
| `output/` | Ops/audit artifacts | Lighthouse JSON, guides |
| `dist/` | Build output | Gitignored |
| `.vercel/` | Local link | Gitignored |

## Script → file mapping

| Script | File(s) | Result |
|--------|---------|--------|
| `build` | `generate-sitemap.mjs`, `fallback-prerender.mjs` | OK |
| `prebuild` / `brand-pngs` | `generate-brand-pngs.mjs` | OK |
| `qa:seo` / `qa:gsc` | matching scripts | OK |
| `prerender*` | prerender + fallback | OK |
| `db:check` / `db:migrate` | check/apply | OK |
| `vapid:generate` / `keep-alive` | matching | OK |

## Env matrix

| Variable | Client? | Documented in `.env.example` | Notes |
|----------|---------|------------------------------|-------|
| `VITE_SUPABASE_URL` | Yes | Yes | Required for live data |
| `VITE_SUPABASE_ANON_KEY` | Yes | Yes | RLS-dependent |
| `VITE_ADMIN_EMAILS` | Yes | Yes | UI gate only |
| `VITE_GA_MEASUREMENT_ID` | Yes | Yes | Hardcoded fallback in code too |
| `VITE_GOOGLE_ADS_ID` | Yes | Yes (commented) | Optional |
| `VITE_GOOGLE_SITE_VERIFICATION` / `VITE_GSC_VERIFICATION` | Build | Yes | vite plugin |
| `VITE_SITE_URL` | Yes | Yes | Canonical base |
| `VITE_GOOGLE_PLACE_ID` | Yes | Yes | GBP review link |
| `VITE_VAPID_PUBLIC_KEY` | Yes | Yes | Push |
| `VAPID_PRIVATE_KEY` / `VAPID_PUBLIC_KEY` / `VAPID_SUBJECT` | Server | Yes | `api/admin-notify.js` |
| `ADMIN_NOTIFY_SECRET` | Server | Yes | Bearer check |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Yes | Notify API |
| `SUPABASE_DB_PASSWORD` / `DATABASE_URL` | Migrate scripts | Yes | Not in client |

**Local `.env.local`:** only `VERCEL_OIDC_TOKEN` — no Supabase client credentials locally → demo/fallback mode for local `npm run db:check` unless other env files exist.

## Secret / tracking safety

| Check | Result |
|-------|--------|
| `.env*` gitignored | PASS (`.env*` rule) |
| Service role / VAPID private in tracked source | PASS (only referenced as env reads) |
| `DEPLOYMENT_NOTE.md` example Production values | FAIL soft — documents real-looking GA/Ads IDs and admin email (public marketing IDs, not crypto secrets) |
| Accidental publish of `dist/` | PASS (gitignored) |
| Lighthouse JSON in `output/` | INFO — untracked/local artifacts; not secrets |

## Dependency audit (`npm audit`)

| Severity | Count |
|----------|------:|
| critical | 0 |
| high | 5 |
| moderate | 4 |
| low/info | 0 |

High packages (transitive / tooling): `brace-expansion`, `js-yaml`, `nanoid`, `postcss`, `vite` — primarily **dev/build** path (DoS/path traversal in tooling). Not direct runtime RCE on the public SPA, but should be upgraded.

## Brand / meta consistency (spot)

| Surface | Finding |
|---------|---------|
| `index.html` OG / title | Dealership / Berhampore oriented |
| `src/config/site.js` | Canonical NAP, WhatsApp, hours — source of truth for runtime |
| Risk | Hardcoded phone strings elsewhere in SEO copy must match `site.js` (checked deeper in Phase 6/7) |

## Findings

| ID | Sev | Finding | Recommendation |
|----|-----|---------|----------------|
| P1-01 | P2 | `npm audit`: 5 high (vite/postcss/nanoid/js-yaml/brace-expansion) | Bump Vite/PostCSS toolchain; re-audit |
| P1-02 | P3 | Local `.env.local` lacks Supabase keys | Add local (gitignored) keys for realistic QA |
| P1-03 | P3 | `DEPLOYMENT_NOTE.md` embeds Production env examples | Prefer placeholders; keep secrets in Vercel only |
| P1-04 | P3 | No `engines` field / no test script in package.json | Document Node version; add smoke tests later |
| P1-05 | P3 | `.gitignore` has both `.env.local` and `.env*` (redundant) | Harmless; OK |

## Exit criteria

- [x] Root inventory table
- [x] Env matrix
- [x] Dependency risk list
