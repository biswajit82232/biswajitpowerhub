-- Add hero image URL to finance_settings
alter table public.finance_settings
  add column if not exists hero_image_url text default null;
