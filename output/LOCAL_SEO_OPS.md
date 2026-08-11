# Local SEO + Near Me — Ops after deploy

Website changes alone do **not** win Maps “near me”. Finish these off-site steps for solid results.

## 1. Deploy

Push `main` and wait for Vercel production to finish.

New URLs to confirm live:

- `https://biswajitpowerhub.in/electric-scooter-near-me-berhampore`
- `https://biswajitpowerhub.in/areas-we-serve`
- All 15 `/electric-scooters-{town}` pages
- Updated sitemap: `https://biswajitpowerhub.in/sitemap.xml`

## 2. Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console) for `biswajitpowerhub.in`.
2. Confirm property verification (HTML meta via `VITE_GOOGLE_SITE_VERIFICATION` on Vercel, or DNS).
3. **Sitemaps** → submit `https://biswajitpowerhub.in/sitemap.xml`.
4. **URL inspection** → Request indexing for (priority order):
   - `/electric-scooter-near-me-berhampore`
   - `/areas-we-serve`
   - `/electric-scooters-berhampore`
   - `/best-electric-scooters-berhampore`
   - `/contact`
   - A few satellite towns (Kandi, Jiaganj, Beldanga, Domkal, Cossimbazar)

See also: `output/GSC_COMPLETE_GUIDE.md`.

## 3. Google Business Profile (Maps / near me)

Match NAP exactly to the site:

| Field | Value |
|-------|--------|
| Name | BISWAJIT POWER HUB |
| Phone | 096355 05436 |
| Address | Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal 742149 |
| Website | https://biswajitpowerhub.in |
| Hours | Open all days 9:00 AM – 8:30 PM |

Then:

1. Primary category: Electric vehicle dealer / Scooter dealer (best fit available).
2. Add services: sales, test ride, battery upgrade, servicing, EMI guidance.
3. Upload showroom + product photos weekly.
4. Answer Q&A (licence, EMI, location).
5. Reply to every Google review.
6. Post weekly (offer, test ride, new stock).

See also: `output/GBP_CHECKLIST.md`.

## 4. Vercel env

Ensure production has:

- `VITE_SITE_URL=https://biswajitpowerhub.in`
- `VITE_GOOGLE_SITE_VERIFICATION=…` (if using meta verification)

Redeploy after changing env.

## Success signals (2–6 weeks)

- GSC: new URLs discovered / indexed (not “Crawled – currently not indexed” forever).
- Queries like “electric scooter Berhampore”, “near me”, town names appear in Performance.
- GBP insights: calls, direction requests, website clicks rising.
