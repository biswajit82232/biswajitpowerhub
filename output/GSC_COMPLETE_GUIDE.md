# Google Search Console — Complete Guide for Biswajit Power Hub

**Domain:** `https://biswajitpowerhub.in`  
**Sitemap:** `https://biswajitpowerhub.in/sitemap.xml`  
**Robots:** `https://biswajitpowerhub.in/robots.txt`  
**Last crawl-ready audit:** August 2026 (live production)

This guide tells you exactly what Google should index, what it must ignore, and how to run Search Console step by step.

---

## 1. Crawl readiness verdict (site is ready)

Live checks confirm Googlebot-friendly setup:

| Check | Status |
|--------|--------|
| HTTPS + HSTS | Pass |
| `www` → apex `biswajitpowerhub.in` (308) | Pass |
| `robots.txt` Allow `/` + Sitemap link | Pass |
| Sitemap = **59** URLs | Pass |
| Unique `<title>` + `canonical` on public pages | Pass |
| `meta robots: index, follow` on indexable pages | Pass |
| Prerendered HTML (titles, JSON-LD, text) for bots | Pass |
| True **HTTP 404** for junk URLs | Pass |
| `/reviews` → `/community` (301/308) | Pass |
| Ads / stubs / admin blocked or noindex | Pass |
| LocalBusiness / Product / FAQ schema on key pages | Pass |

**Your job in GSC is ops** (verify → submit sitemap → request indexing → monitor). The site code is already crawl-compatible.

---

## 2. What SHOULD be indexed (target list)

Google should eventually index **everything in the sitemap** (~59 URLs). Prioritize in this order when using **URL Inspection → Request indexing**.

### A. Must-index first (brand + money pages)

| # | URL | Why |
|---|-----|-----|
| 1 | `https://biswajitpowerhub.in/` | Homepage / LocalBusiness hub |
| 2 | `https://biswajitpowerhub.in/scooters` | Full catalogue |
| 3 | `https://biswajitpowerhub.in/scooters/activa` | Hero product |
| 4 | `https://biswajitpowerhub.in/scooters/zoom` | Hero product |
| 5 | `https://biswajitpowerhub.in/scooters/single-light` | Hero product |
| 6 | `https://biswajitpowerhub.in/scooters/double-light` | Hero product |
| 7 | `https://biswajitpowerhub.in/contact` | NAP + map + calls |
| 8 | `https://biswajitpowerhub.in/service` | After-sales / upgrades |
| 9 | `https://biswajitpowerhub.in/finance` | EMI intent |
| 10 | `https://biswajitpowerhub.in/about` | Trust / entity |

### B. Local SEO landings (high priority)

| # | URL |
|---|-----|
| 11 | `https://biswajitpowerhub.in/best-electric-scooters-berhampore` |
| 12 | `https://biswajitpowerhub.in/low-budget-electric-scooters-berhampore` |
| 13 | `https://biswajitpowerhub.in/no-licence-electric-scooters-west-bengal` |
| 14 | `https://biswajitpowerhub.in/battery-upgrade-berhampore` |
| 15 | `https://biswajitpowerhub.in/test-ride-berhampore` |

### C. Town / service-area pages

| # | URL |
|---|-----|
| 16 | `https://biswajitpowerhub.in/electric-scooters-kandi` |
| 17 | `https://biswajitpowerhub.in/electric-scooters-jiaganj` |
| 18 | `https://biswajitpowerhub.in/electric-scooters-beldanga` |
| 19 | `https://biswajitpowerhub.in/electric-scooters-lalbagh` |
| 20 | `https://biswajitpowerhub.in/electric-scooters-domkal` |

### D. Guides (topical SEO)

| # | URL |
|---|-----|
| 21 | `https://biswajitpowerhub.in/guides` |
| 22 | `https://biswajitpowerhub.in/guides/no-licence-electric-scooter-rules-west-bengal` |
| 23 | `https://biswajitpowerhub.in/guides/electric-vs-petrol-cost-berhampore` |
| 24 | `https://biswajitpowerhub.in/guides/battery-upgrade-guide-berhampore` |
| 25 | `https://biswajitpowerhub.in/guides/first-time-buyer-guide-murshidabad` |
| 26 | `https://biswajitpowerhub.in/guides/emi-finance-tips-electric-scooter` |

### E. Supporting indexable pages

| # | URL |
|---|-----|
| 27 | `https://biswajitpowerhub.in/community` |
| 28 | `https://biswajitpowerhub.in/offers` |
| 29 | `https://biswajitpowerhub.in/compare` |
| 30 | `https://biswajitpowerhub.in/accessories` |
| 31 | `https://biswajitpowerhub.in/terms` |
| 32 | `https://biswajitpowerhub.in/privacy` |

### F. Accessories in sitemap (indexable spare-parts pages)

These are in `sitemap.xml` and return `index, follow` live:

- `/accessories/spare-battery-18`
- `/accessories/tubeless-tyre-set`
- `/accessories/brake-pad-set`
- `/accessories/motor-controller`
- `/accessories/fast-charger-48v`
- `/accessories/led-headlamp-upgrade`
- `/accessories/front-body-panel`
- `/accessories/side-panel-set`
- `/accessories/rear-mudguard`
- `/accessories/mirror-pair`
- `/accessories/seat-cover-oem`
- `/accessories/handle-grip-set`
- `/accessories/is-helmet-pro`
- `/accessories/under-seat-bag`
- `/accessories/reflective-sticker-kit`

**Tip:** Request indexing for groups A–D first. Accessories can wait for the sitemap crawl.

---

## 3. What must NOT be indexed

| URL / pattern | How we block it | Action in GSC |
|---------------|-----------------|---------------|
| `/admin` and `/admin/*` | `robots.txt` Disallow + `X-Robots-Tag: noindex` | Ignore if seen |
| `/ad-landing` | Disallow + `noindex, nofollow` | Do not request |
| `/dealership`, `/updates` | Disallow + noindex stubs | Do not request |
| Unknown junk URLs | Real **HTTP 404** | Should appear as Not found — good |
| `/reviews` | Permanent redirect → `/community` | Inspect `/community` only |
| `www.biswajitpowerhub.in/*` | 308 → apex | Use apex URLs only |
| Extra scooters without SEO pack | `noindex` until marked SEO-ready | Only 4 models in sitemap |
| Thin accessory pages (no description) | `noindex` | Not in sitemap |

**Do not** request indexing for admin, ads, or stub URLs.

---

## 4. Step-by-step: set up Google Search Console

### Step 1 — Create / open property

1. Open [https://search.google.com/search-console](https://search.google.com/search-console)
2. Sign in with the Google account that owns the domain (same as Workspace / GBP if possible)
3. Click **Add property**
4. Prefer **Domain** property: `biswajitpowerhub.in`  
   - Covers `https://`, `http://`, `www`, and apex automatically  
5. Or use **URL prefix**: `https://biswajitpowerhub.in` (apex only — also fine)

### Step 2 — Verify ownership

**Best (Domain property):** DNS TXT record at your domain registrar.

1. Copy the TXT record Google shows  
2. Add it at your DNS host (where `biswajitpowerhub.in` is managed)  
3. Wait a few minutes → click **Verify**

**Alternative (URL-prefix):** HTML meta tag.

1. Google gives a code like `google-site-verification=XXXX`  
2. In Vercel → Project → Settings → Environment Variables (Production):  
   - `VITE_GOOGLE_SITE_VERIFICATION` = `XXXX` (the token only)  
3. Redeploy Production  
4. Confirm homepage HTML contains:  
   `<meta name="google-site-verification" content="XXXX" />`  
5. Click **Verify** in GSC

### Step 3 — Set preferred settings

1. Confirm property is the **apex** domain (not www-only)  
2. Optional: link **Google Analytics** (GA4 `G-ZPSM06SEY4` is already on site)  
3. Optional later: link **Merchant / Business Profile** if Google offers it

### Step 4 — Submit the sitemap

1. Left menu → **Sitemaps**  
2. Enter: `sitemap.xml`  
   (full URL becomes `https://biswajitpowerhub.in/sitemap.xml`)  
3. Click **Submit**  
4. Refresh after 1–5 minutes  
5. Status should become **Success**  
6. “Discovered URLs” should approach **~59**

If it fails:

- Open `https://biswajitpowerhub.in/sitemap.xml` in a browser — must be XML, not HTML  
- Open `https://biswajitpowerhub.in/robots.txt` — must list the Sitemap line  
- Wait and resubmit once

### Step 5 — URL Inspection (force crawl of priorities)

For each URL in **Section 2A–2D**:

1. Paste the full `https://biswajitpowerhub.in/...` URL into the top search bar  
2. Wait for the report  
3. Confirm:  
   - **URL is on Google** = already indexed, or  
   - **URL is not on Google** → click **Request indexing**  
4. Expect “Indexing requested” (Google may queue for days)

**Daily limit:** Google caps how many “Request indexing” actions you can do per day. Do the must-index list first; finish the rest over 2–3 days.

### Step 6 — Check a few reports for health

| Report | What you want |
|--------|----------------|
| **Pages** (Indexing) | Indexed count rising; few “Crawled – currently not indexed” is normal at first |
| **Sitemaps** | Success, ~59 discovered |
| **Page indexing → Excluded** | Admin/ads should be excluded / blocked by robots — good |
| **Experience / Core Web Vitals** | Improve over time; not a blocker for first indexing |
| **Performance** | Impressions for Berhampore / Murshidabad / no licence queries |

### Step 7 — After 3–7 days

- [ ] Homepage + 4 scooters show as **Indexed**  
- [ ] Contact + best-Berhampore landing indexed  
- [ ] No mass soft-404 / duplicate title warnings  
- [ ] Performance → queries start appearing (even 0 clicks is fine early)

### Step 8 — Ongoing (weekly)

- Resubmit sitemap only after big URL additions (new guides/towns)  
- Request indexing for **new** pages only  
- Fix any GSC “Failed” pages (404s that should exist, or blocked by noindex by mistake)  
- Never request `/admin`, `/ad-landing`, or random 404s

---

## 5. How Googlebot sees your pages (technical)

1. Fetches `robots.txt` → allowed to crawl public site  
2. Reads `sitemap.xml` → discovers the 59 URLs  
3. Requests each URL over HTTPS  
4. Receives **prerendered HTML** with unique title, description, canonical, robots, and JSON-LD (not an empty SPA shell)  
5. Indexes if quality/signals are enough (not every submitted URL is indexed instantly)

Canonical rule everywhere:

- Homepage: `https://biswajitpowerhub.in/`  
- Others: `https://biswajitpowerhub.in/path` (**no** trailing slash)

---

## 6. Quick self-test before blaming GSC

Paste these in a browser (or use curl):

```text
https://biswajitpowerhub.in/robots.txt
https://biswajitpowerhub.in/sitemap.xml
https://biswajitpowerhub.in/
https://biswajitpowerhub.in/scooters/activa
https://biswajitpowerhub.in/this-page-does-not-exist-xyz   → must be 404
https://www.biswajitpowerhub.in/   → must redirect to apex
```

View source (Ctrl+U) on homepage and Activa:

- Unique `<title>`  
- `rel="canonical"`  
- `name="robots" content="index, follow..."`  
- `application/ld+json` present  

---

## 7. Common GSC messages (what they mean)

| Message | Meaning | What to do |
|---------|---------|------------|
| Discovered – currently not indexed | Found but not chosen yet | Wait; improve links; request again later |
| Crawled – currently not indexed | Visited but not indexed | Normal for thin pages; strengthen content |
| Blocked by robots.txt | Intentional for admin/ads | OK |
| Excluded by ‘noindex’ | Intentional for stubs/ads | OK |
| Not found (404) | Page missing | Fix URL or remove from sitemap |
| Redirect | e.g. `/reviews` → `/community` | Inspect destination |
| Duplicate without user-selected canonical | Duplicate signals | Stick to apex + sitemap only |

---

## 8. Do / Don’t checklist

**Do**

- Use **Domain** or apex URL-prefix property  
- Submit `sitemap.xml` once  
- Request indexing for priority URLs (Sections 2A–2D)  
- Always share/inspect **`https://biswajitpowerhub.in/...`** (not www)  
- Keep GBP name **BISWAJIT POWER HUB** consistent with the site  

**Don’t**

- Don’t request indexing for `/admin`, `/ad-landing`, `/dealership`, `/updates`  
- Don’t use `/reviews` (use `/community`)  
- Don’t submit a second sitemap with www URLs  
- Don’t expect all 59 URLs indexed overnight  
- Don’t confuse Justdial “Biswajit Enterprise” with your brand  

---

## 9. One-page cheat sheet

1. GSC → Add **Domain** `biswajitpowerhub.in` → Verify DNS  
2. Sitemaps → submit `sitemap.xml` → Success  
3. URL Inspection → request indexing for homepage, 4 scooters, contact, 5 landings, 5 towns, guides  
4. Wait 3–7 days → Pages report → Indexed rising  
5. Weekly → Performance + fix real errors only  

**Expected indexable set:** all **59** sitemap URLs.  
**Expected excluded:** admin, ads, stubs, junk 404s, non-SEO scooters.

---

## 10. Related files in this repo

| File | Purpose |
|------|---------|
| `public/robots.txt` | Crawl rules (regenerated on build) |
| `public/sitemap.xml` | Indexable URL list (regenerated on build) |
| `scripts/generate-sitemap.mjs` | Builds sitemap + robots |
| `scripts/fallback-prerender.mjs` | Bot-readable HTML per route |
| `scripts/qa-seo-check.mjs` | Post-build SEO assertions (`npm run qa:seo`) |
| `output/GBP_CHECKLIST.md` | Google Business Profile (local pack) |
| `output/GSC_CHECKLIST.md` | Short tick-list (companion to this guide) |

When you finish Step 1–5 above, tick the boxes in `output/GSC_CHECKLIST.md`.
