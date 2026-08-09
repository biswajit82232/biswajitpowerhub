# Google Analytics + Ads + Search Console setup

Site code is ready. Complete these steps in Google / Vercel (same Google account as GBP when possible).

**Live site:** https://biswajitpowerhub.in  
**GA4 Measurement ID (already in code):** `G-ZPSM06SEY4`  
**Sitemap:** https://biswajitpowerhub.in/sitemap.xml

---

## A) Google Analytics 4 (mostly done)

1. Open [analytics.google.com](https://analytics.google.com) → property for `G-ZPSM06SEY4`.
2. Confirm a **Web data stream** points at `https://biswajitpowerhub.in`.
3. **Realtime check:** open the live site → GA4 → Reports → Realtime → you should appear.
4. **Mark conversions** (Admin → Events → Mark as conversion):
   - `phone_click`
   - `whatsapp_click`
   - `form_submit`
   - `view_item`
   - `generate_lead` (optional)
5. **Data retention:** Admin → Data Settings → Data Retention → **14 months**.
6. **Exclude your IP** (optional): Data stream → Configure tag settings → Define internal traffic.
7. Vercel env (Production):
   - `VITE_GA_MEASUREMENT_ID=G-ZPSM06SEY4`
   - `VITE_SITE_URL=https://biswajitpowerhub.in`

Already tracked by the site: page views, call, WhatsApp, directions, forms, scooter views, EMI/simulator/compare.

---

## B) Google Search Console

1. Open [search.google.com/search-console](https://search.google.com/search-console).
2. Add property → **URL prefix** → `https://biswajitpowerhub.in`.
3. Verify with **HTML tag**:
   - Copy only the `content="..."` token.
   - Vercel → Environment Variables → Production:
     - `VITE_GOOGLE_SITE_VERIFICATION=your_token_here`
   - Redeploy (required so `index.html` embeds the meta).
   - Click **Verify** in Search Console.
4. Alternate (often easier): **DNS TXT** record at your domain registrar — no redeploy needed.
5. After verified:
   - Sitemaps → submit `https://biswajitpowerhub.in/sitemap.xml`
   - URL Inspection → homepage → **Request indexing**
   - Inspect `/scooters` and one scooter URL too
6. Link GSC ↔ GA4: GA4 Admin → Product links → Search Console → link `biswajitpowerhub.in`.

---

## C) Google Ads

1. Create / open [ads.google.com](https://ads.google.com) (same Google account as GA4 + GBP).
2. Complete billing.
3. Tools → **Conversions** → note your ID: `AW-XXXXXXXXX`.
4. Vercel → Environment Variables → Production:
   - `VITE_GOOGLE_ADS_ID=AW-XXXXXXXXX`
5. Redeploy.
6. Link Ads ↔ GA4: GA4 Admin → Product links → Google Ads → link account.
7. In Ads: Conversions → **Import** from GA4:
   - `phone_click` → Phone Call Lead
   - `whatsapp_click` → WhatsApp Lead
   - `form_submit` → Contact Form Submit
   - `view_item` → Product View (optional / secondary)
8. Create first Search campaign (see `output/GOOGLE_ADS_SETUP.md` for keywords, ads, budget, schedule **9:00 AM – 8:30 PM all days**).
9. Landing page for ads: `/ad-landing` (noindex) or `/contact` / `/test-ride-berhampore`.

Code already fires Ads conversions when `VITE_GOOGLE_ADS_ID` is set (phone, WhatsApp, directions, forms, product views). Labels in `src/lib/googleAnalytics.js` must match the conversion actions you create/import — adjust labels there if Ads uses different suffixes.

---

## D) Vercel env checklist (Production)

| Variable | Example | Required |
|---|---|---|
| `VITE_SITE_URL` | `https://biswajitpowerhub.in` | Yes |
| `VITE_GA_MEASUREMENT_ID` | `G-ZPSM06SEY4` | Yes (already defaulted in code) |
| `VITE_GOOGLE_SITE_VERIFICATION` | GSC HTML token | For HTML-tag verify |
| `VITE_GOOGLE_ADS_ID` | `AW-XXXXXXXXX` | For Ads conversions |
| `VITE_GOOGLE_PLACE_ID` | `ChIJ...` | Optional (Google review deep link) |

After any env change → **Redeploy**.

---

## E) Done when

- [ ] GA4 Realtime shows you on the live site
- [ ] GSC property verified + sitemap submitted
- [ ] Ads `AW-` ID in Vercel + redeploy
- [ ] GA4 linked to Search Console and Ads
- [ ] At least one Search campaign live (optional day-1)

When you have the **GSC token** and/or **AW- ID**, paste them here (or set them in Vercel) and we can confirm tracking end-to-end.
