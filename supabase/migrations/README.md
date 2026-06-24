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

All migrations are idempotent (`if not exists` / `on conflict`) — safe to re-run.
