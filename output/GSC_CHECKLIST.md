# GOOGLE SEARCH CONSOLE CHECKLIST

## Step 1: Verify Property (if not already done)
- [ ] Go to https://search.google.com/search-console
- [ ] Add Property → Domain → `biswajitpowerhub.in`
- [ ] Verify via DNS record or HTML tag
- [ ] Optional: set `VITE_GOOGLE_SITE_VERIFICATION` in Vercel Production and redeploy

## Step 2: Submit Sitemap
- [ ] GSC → Sitemaps
- [ ] Enter: `https://biswajitpowerhub.in/sitemap.xml`
- [ ] Click Submit
- [ ] Wait 1–2 minutes, refresh, confirm status = Success

## Step 3: Request Indexing (priority URLs)
Go to URL Inspection → enter each URL → **Request Indexing**:

### Core
1. `https://biswajitpowerhub.in/`
2. `https://biswajitpowerhub.in/scooters`
3. `https://biswajitpowerhub.in/scooters/activa`
4. `https://biswajitpowerhub.in/scooters/single-light`
5. `https://biswajitpowerhub.in/scooters/double-light`
6. `https://biswajitpowerhub.in/scooters/zoom`
7. `https://biswajitpowerhub.in/contact`
8. `https://biswajitpowerhub.in/community`
9. `https://biswajitpowerhub.in/about`
10. `https://biswajitpowerhub.in/service`
11. `https://biswajitpowerhub.in/finance`
12. `https://biswajitpowerhub.in/guides`

### Intent landings
13. `https://biswajitpowerhub.in/best-electric-scooters-berhampore`
14. `https://biswajitpowerhub.in/low-budget-electric-scooters-berhampore`
15. `https://biswajitpowerhub.in/no-licence-electric-scooters-west-bengal`
16. `https://biswajitpowerhub.in/battery-upgrade-berhampore`
17. `https://biswajitpowerhub.in/test-ride-berhampore`

### Satellite towns
18. `https://biswajitpowerhub.in/electric-scooters-kandi`
19. `https://biswajitpowerhub.in/electric-scooters-jiaganj`
20. `https://biswajitpowerhub.in/electric-scooters-beldanga`
21. `https://biswajitpowerhub.in/electric-scooters-lalbagh`
22. `https://biswajitpowerhub.in/electric-scooters-domkal`

## Step 4: Monitor
- [ ] Coverage / Pages → Indexed should rise after 3–7 days
- [ ] Performance → local queries (Berhampore / Murshidabad / no licence)
- [ ] Confirm unknown junk URLs return **HTTP 404** (not soft 200 homepage)

## Notes
- `/reviews` permanently redirects to `/community` — request `/community`, not `/reviews`
- Preview / non-apex hosts send `X-Robots-Tag: noindex`
