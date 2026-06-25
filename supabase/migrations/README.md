# Supabase migrations

Run **`supabase/schema.sql`** and **`supabase/seed.sql`** first on a fresh project (SQL editor or CLI).

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

All migrations are idempotent (`if not exists` / `on conflict`) — safe to re-run.

The canonical apply order matches `scripts/apply-migrations.mjs`.
