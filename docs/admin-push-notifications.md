# Admin background notifications (Android / Chrome PWA)

Web Push alerts for new **callbacks**, **test rides**, **service bookings**, **contact messages**, and **reviews** — including when the admin app is closed on Android.

## One-time setup

1. **Migrate**
   ```bash
   npm run db:migrate
   ```
   Or run `supabase/migrations/add_admin_push_subscriptions.sql` in the Supabase SQL editor.

2. **Generate keys**
   ```bash
   npm run vapid:generate
   ```
   Add the printed values to local `.env` and **Vercel → Settings → Environment Variables** (Production + Preview).

   Required on Vercel:
   - `VITE_VAPID_PUBLIC_KEY`
   - `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT`
   - `ADMIN_NOTIFY_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Settings → API → `service_role`)
   - `SUPABASE_URL` or existing `VITE_SUPABASE_URL`

3. **Redeploy** so the browser bundle includes `VITE_VAPID_PUBLIC_KEY`.

4. **Supabase Database Webhooks** (Dashboard → Database → Webhooks)

   Create one webhook per table (or one webhook with multiple tables if your plan allows):

   | Setting | Value |
   |---|---|
   | Events | `INSERT` |
   | Tables | `callbacks`, `test_rides`, `service_bookings`, `contact_messages`, `reviews` |
   | URL | `https://biswajitpowerhub.in/api/admin-notify` |
   | HTTP Headers | `Authorization: Bearer <ADMIN_NOTIFY_SECRET>` |
   | Timeout | 5000+ ms |

## Using on Android

1. Open `/admin` in Chrome, sign in, **Install** the admin app.
2. Tap **Enable alerts** on the notifications banner and allow permission.
3. Submit a test callback from the public site — you should get a system notification even with the admin app closed.

## Notes

- Works best as an installed PWA on Android Chrome (HTTPS required).
- iOS Safari has limited Web Push support (needs recent iOS + installed Home Screen app).
- Expired device subscriptions are pruned automatically when push delivery returns 404/410.
