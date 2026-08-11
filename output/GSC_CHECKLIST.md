# GOOGLE SEARCH CONSOLE — SHORT CHECKLIST

Full walkthrough: **[`GSC_COMPLETE_GUIDE.md`](./GSC_COMPLETE_GUIDE.md)**

## Crawl status (code / live site)
- [x] HTTPS, apex canonical, www → apex
- [x] robots.txt + sitemap (~47 URLs)
- [x] Prerendered titles / canonicals / index,follow
- [x] True HTTP 404 for unknown URLs
- [x] Admin / ads / stubs blocked or noindex

## Your GSC tasks
- [ ] Step 1: Verify property → Domain `biswajitpowerhub.in` (or URL-prefix `https://biswajitpowerhub.in`)
- [ ] Step 2: Optional `VITE_GOOGLE_SITE_VERIFICATION` in Vercel if using HTML tag
- [ ] Step 3: Submit sitemap `https://biswajitpowerhub.in/sitemap.xml` → Success
- [ ] Step 4: Request indexing for priority URLs (see guide §2 A–D)
- [ ] Step 5: After 3–7 days check Pages → Indexed rising
- [ ] Step 6: Monitor Performance for Berhampore / Murshidabad / no-licence queries

## Index these (priority)
Homepage, `/scooters` + 4 models, `/contact`, `/service`, `/finance`, `/about`, 5 SEO landings, 5 town pages, `/guides` + 5 articles, `/community`, `/offers`, `/compare`, `/accessories` (+ accessory URLs already in sitemap).

## Never request indexing
`/admin/*`, `/ad-landing`, `/dealership`, `/updates`, junk 404s, `www` URLs, `/reviews` (use `/community`).

## Notes
- Brand is **Biswajit Power Hub** only — not “Biswajit Enterprise”
- Full URL lists + troubleshooting → `GSC_COMPLETE_GUIDE.md`
