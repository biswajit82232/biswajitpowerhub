-- Run once on existing Supabase projects that already have finance_settings
alter table public.finance_settings
  add column if not exists petrol_price_per_litre numeric default 110,
  add column if not exists petrol_mileage_km_per_litre numeric default 40;

update public.finance_settings
set
  petrol_price_per_litre = coalesce(petrol_price_per_litre, 110),
  petrol_mileage_km_per_litre = coalesce(petrol_mileage_km_per_litre, 40)
where id = 1;
