-- Battery warranty on scooters + per-variant values in variants JSON

alter table public.scooters
  add column if not exists battery_warranty text;

update public.scooters set battery_warranty = '6 months' where battery_warranty is null;

update public.scooters set variants = (
  select jsonb_agg(
    case
      when elem->>'id' = 'standard'
        then elem || '{"batteryWarranty":"6 months"}'::jsonb
      when elem->>'id' = 'lithium-pro'
        then elem || '{"batteryWarranty":"2 years"}'::jsonb
      else elem
    end
  )
  from jsonb_array_elements(variants) as elem
)
where jsonb_array_length(variants) > 0;
