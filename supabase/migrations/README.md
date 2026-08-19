# Supabase migrations

Run **`supabase/schema.sql`** (hardened `is_admin()` RLS) and **`supabase/seed.sql`** first on a fresh project (SQL editor or CLI). Then insert your admin email into `public.admin_allowlist`. Schema.sql alone is not a full production dump — later tables live in this folder.

**Do not replay migrations 1–23 on a database that already used `schema.sql`.** Those files create then later drop permissive policies; `schema.sql` already encodes the hardened end state. Apply only migrations **after** the last change inlined in `schema.sql` (currently 24+). Production tracks applied files in `public.schema_migrations` — `npm run db:migrate` skips those.

**Denormalization notes (intentional, not a rewrite target):**
- `scooters.price` is a display/fallback; variant prices in `scooters.variants` JSON win when present.
- Local `stock_status` is coarse (`in_stock` / `low_stock` / `out_of_stock`); exact qty lives in `vyapar_items`.
- `site_settings` JSON columns (`photos`, `content`) store CMS blobs, not 3NF tables.

Then apply migrations locally:

```bash
# Add SUPABASE_DB_PASSWORD to .env (Project Settings → Database in Supabase dashboard)
npm run db:check      # see what's missing
npm run db:migrate    # apply pending migrations
```

Or run each file manually in the **Supabase SQL editor** (skip any already applied).

| Order | File | Purpose |
|------:|------|---------|
| 1 | `add_petrol_settings.sql` | EV simulator petrol comparison columns |
| 2 | `add_hero_image.sql` | Homepage hero image URL on finance settings |
| 3 | `create_storage_bucket.sql` | Scooter image uploads bucket + policies |
| 4 | `add_promotional_offers.sql` | Homepage promotional offers table |
| 5 | `add_site_settings.sql` | Admin-editable contact, hours, address |
| 5b | `add_site_photos_json.sql` | Cloud-persist homepage/about photo slots |
| 6 | `add_file_charges.sql` | Loan file charges for EMI calculator |
| 7 | `add_accessories.sql` | Accessories & parts catalog table |
| 8 | `create_accessory_images_bucket.sql` | Accessory image uploads bucket + policies |
| 9 | `update_reviews_product_names.sql` | Align review product names with catalog |
| 10 | `create_review_photos_bucket.sql` | Customer review photo uploads bucket |
| 11 | `add_scooter_variants.sql` | 4-model catalog with Standard / Lithium Pro variants |
| 12 | `add_battery_warranty.sql` | Battery warranty field on scooters |
| 13 | `fix_critical_rls_and_rpc.sql` | Review RLS, upsert_lead + get_analytics_events RPCs |
| 14 | `update_reviews_catalog.sql` | Seed reviews for current scooter lineup |
| 15 | `update_zoom_max_range.sql` | Zoom Lithium Pro 120 km max range |
| 16 | `add_scooter_range_tags.sql` | Budget / Premium Explore Range tags on scooters |
| 17 | `add_site_content_json.sql` | Admin content JSON (brand, perks, FAQs, tabs) |
| 18 | `add_ops_inbox_fields.sql` | Electricity rate + contact message is_read |
| 19 | `add_vyapar_sync.sql` | Vyapar online-store sync settings + item cache/mapping |
| 20 | `add_service_bookings.sql` | Service booking requests inbox |
| 21 | `add_admin_push_subscriptions.sql` | Admin PWA Web Push subscriptions (Android background alerts) |
| 22 | `lock_admin_rls_allowlist.sql` | Admin email allowlist + RLS lock; tighten analytics RPC |
| 23 | `harden_rls_storage_and_rpc.sql` | Drop leftover site/offers policies; Storage `is_admin`; anon insert CHECKs; redact analytics meta PII |
| 24 | `add_offer_kind_image_hero.sql` | Offer kind (promo / free-with-purchase), image URL, show-on-hero flag |
| 25 | `revoke_is_admin_anon.sql` | Revoke anon EXECUTE on `is_admin()` (RLS still works; PostgREST RPC closed) |
| 26 | `rate_limit_upsert_lead.sql` | Debounce + flood cap on public `upsert_lead` RPC |
| 27 | `harden_public_writes_push_and_rate_limits.sql` | Rate-limit form/review/`lead_events` inserts; admin-only push subs; review-photo path prefix; never-downgrade lead classification; revoke anon analytics RPC |
| 28 | `add_lead_attribution.sql` | UTM / gclid / channel JSON on leads + inbox rows; `upsert_lead` first-touch attribution |
| 29 | `repair_rls_after_replay.sql` | Drop leftover `USING (true)` policies recreated by replaying 19–21 after hardening; require `visitor_id` on public form inserts |

All migrations are idempotent (`if not exists` / `on conflict`) — safe to re-run.

The canonical apply order matches `scripts/apply-migrations.mjs`.
