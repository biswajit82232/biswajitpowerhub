# Supabase migrations

Run these in the **Supabase SQL editor** after `schema.sql` and `seed.sql` (fresh projects).

| Order | File | Purpose |
|------:|------|---------|
| 1 | `add_petrol_settings.sql` | EV simulator petrol comparison columns |
| 2 | `add_hero_image.sql` | Homepage hero image URL on finance settings |
| 3 | `create_storage_bucket.sql` | Image uploads bucket + policies |
| 4 | `add_promotional_offers.sql` | Homepage promotional offers table |
| 5 | `add_site_settings.sql` | Admin-editable contact, hours, address |

Skip any file if you already applied it. Re-running `create table if not exists` migrations is safe.
