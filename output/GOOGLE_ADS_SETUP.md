# GOOGLE ADS SETUP CHECKLIST

## Step 1: Create Account
- [ ] https://ads.google.com
- [ ] Use same Google account as GBP + GA4
- [ ] Complete billing setup

## Step 2: Get Conversion ID
- [ ] Tools → Conversions
- [ ] Your ID format: `AW-XXXXXXXXX`
- [ ] Copy this ID

## Step 3: Add to Website (Code Already Ready)
- [ ] Vercel → Environment Variables
- [ ] Add: `VITE_GOOGLE_ADS_ID=AW-XXXXXXXXX`
- [ ] Redeploy

**Conversion labels in code are placeholders.** `src/lib/googleAnalytics.js` (`ADS_CONVERSION_LABELS`) uses suffixes such as `phone_call_lead` and `whatsapp_lead`. Google Ads will only count conversions when those suffixes **exactly match** the labels you create in Ads (the part after `AW-XXXX/`). Do not assume the placeholders work until you paste the real labels.

## Step 4: Import GA4 Conversions
- [ ] Tools → Conversions → Import from GA4
- [ ] Import these events:
  - `phone_click` → Name: "Phone Call Lead"
  - `whatsapp_click` → Name: "WhatsApp Lead"
  - `form_submit` → Name: "Contact Form Submit"
  - `view_item` → Name: "Product View"

## Step 5: Create First Search Campaign

| Setting | Value |
|---|---|
| Campaign type | Search |
| Goal | Leads |
| Networks | Search only (uncheck Display partners) |
| Locations | 15 km radius around Berhampore, Murshidabad |
| Languages | Bengali, English, Hindi |
| Budget | ₹300/day |
| Ad schedule | 9:00 AM – 8:30 PM (all days, including Sunday) |

## Step 6: Keywords
Add these keyword groups:

**Exact Match:**
- [electric scooter dealer berhampore]
- [biswajit power hub]
- [no licence scooter west bengal]

**Phrase Match:**
- "electric scooter berhampore"
- "e scooter murshidabad"
- "activa electric scooter price"

**Broad Match Modified:**
- +electric +scooter +berhampore
- +low +speed +scooter +murshidabad

## Step 7: Write Ads
**Ad 1:**
- Headline 1: Electric Scooters in Berhampore
- Headline 2: No Licence Required
- Headline 3: 1 Year Warranty
- Description: Buy premium low-speed e-scooters at Biswajit Power Hub. Test rides available. Call 096355 05436. Home charging, low running cost.

**Ad 2:**
- Headline 1: Activa Electric Scooter
- Headline 2: 120 KM Range
- Headline 3: Visit Our Showroom
- Description: No registration needed for eligible models. Custom battery upgrades available. Chunakhali Bus Stand, Berhampore. WhatsApp us today.

## Step 8: Ad Extensions
**Sitelinks:**
- Our Scooters → /scooters
- Contact Us → /contact
- Customer Reviews → /reviews
- About Us → /about

**Callouts:**
- 3 Free Servicing
- 1 Year Warranty
- Home Charging
- Low Running Cost
- No Licence Needed

**Call Extension:**
- 096355 05436

**Location Extension:**
- Link to GBP

## Step 9: Negative Keywords
Add these:
- job
- career
- free
- second hand
- rent
- repair (unless you offer repairs)

## Step 10: Launch
- [ ] Review all settings
- [ ] Publish
- [ ] Check back in 24 hours for impressions/clicks
