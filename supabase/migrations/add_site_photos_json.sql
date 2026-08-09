-- Persist public site photo slots (hero, gallery, models, about) on site_settings
alter table public.site_settings
  add column if not exists photos jsonb not null default '{}'::jsonb;
