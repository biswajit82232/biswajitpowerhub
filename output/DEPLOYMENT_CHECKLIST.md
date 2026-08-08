# DEPLOYMENT CHECKLIST — Biswajit Power Hub

## Step 1: Vercel Domain Settings (Do This BEFORE Deploy)
- [ ] Go to https://vercel.com/dashboard → Select project
- [ ] Go to Settings → Domains
- [ ] Find `biswajitpowerhub.in` → Set as **Production Domain** (Primary)
- [ ] Find `www.biswajitpowerhub.in` → Click 3 dots → Edit → Set **Redirect to** → `https://biswajitpowerhub.in`
- [ ] Save changes

## Step 2: Environment Variables
- [ ] Vercel → Project Settings → Environment Variables
- [ ] Ensure `VITE_SITE_URL=https://biswajitpowerhub.in` exists
- [ ] (Optional) Add `VITE_GOOGLE_ADS_ID=AW-XXXXXXXXX` when you get your Ads ID

## Step 3: Deploy
```bash
# Option A: Git push
git add .
git commit -m "SEO overhaul: prerender, schema, redirects, ads tracking"
git push origin main

# Option B: Vercel CLI
npx vercel --prod
```

## Step 4: Live Verification (Run These Commands)
```bash
# Check apex loads with correct title
curl -s https://biswajitpowerhub.in/ | grep -o '<title>.*</title>'

# Should return:
# <title>Electric Scooter Dealer in Berhampore | Biswajit Power Hub</title>

# Check www redirects to apex
curl -I https://www.biswajitpowerhub.in/
# Should show: HTTP/2 301 + location: https://biswajitpowerhub.in/

# Check schema exists
curl -s https://biswajitpowerhub.in/ | grep -o 'LocalBusiness'
# Should return: LocalBusiness

# Check og-image loads
curl -I https://biswajitpowerhub.in/og-image.png
# Should show: HTTP/2 200 + content-type: image/png

# Check prerendered scooter page
curl -s https://biswajitpowerhub.in/scooters/activa | grep -o '<title>.*</title>'
# Should contain: Activa Electric Scooter

# Check sitemap
curl -s https://biswajitpowerhub.in/sitemap.xml | head -20

# Check robots.txt
curl -s https://biswajitpowerhub.in/robots.txt
```

## Step 5: If Any Check Fails

| Symptom | Fix |
|---------|-----|
| Still shows old title | Vercel Domains → apex is NOT set as Production Domain |
| www returns 200 instead of 301 | Vercel Domains → www is NOT set to redirect |
| og-image.png returns HTML | File didn't deploy. Check public/og-image.png is committed |
| /scooters/activa shows old title | Prerender script didn't run. Check build logs |
