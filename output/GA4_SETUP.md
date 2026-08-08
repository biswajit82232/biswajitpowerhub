# GOOGLE ANALYTICS 4 SETUP CHECKLIST
## Property: G-2971LBJ2NV

## Step 1: Mark Events as Conversions
- [ ] Go to https://analytics.google.com
- [ ] Admin → Events
- [ ] Find each event below → Toggle "Mark as conversion"

Events to mark:
- [ ] `phone_click`
- [ ] `whatsapp_click`
- [ ] `form_submit`
- [ ] `view_item`

## Step 2: Link Search Console
- [ ] Admin → Product Links → Search Console
- [ ] Link → Select `biswajitpowerhub.in`
- [ ] Confirm

## Step 3: Link Google Ads (after creating Ads account)
- [ ] Admin → Product Links → Google Ads
- [ ] Link → Select your Ads account

## Step 4: Data Retention
- [ ] Admin → Data Settings → Data Retention
- [ ] Change from 2 months → **14 months**
- [ ] Save

## Step 5: Exclude Internal Traffic
- [ ] Admin → Data Streams → Web → Configure tag settings
- [ ] Show all → Define internal traffic
- [ ] Add your IP address (and staff IPs)

## Step 6: Verify Live
- [ ] Open your website in a browser
- [ ] GA4 → Realtime → should show 1 active user
- [ ] Click a phone number → Realtime → Events → should show `phone_click`
