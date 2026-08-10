-- Admin-editable site content (branding, perks, FAQs, Explore Range tabs, etc.)
alter table public.site_settings
  add column if not exists content jsonb not null default '{}'::jsonb;

-- District on address (optional; stored in content or as column — use address_district)
alter table public.site_settings
  add column if not exists address_district text default 'Murshidabad';
