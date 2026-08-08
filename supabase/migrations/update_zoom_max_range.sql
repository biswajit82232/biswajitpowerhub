-- Zoom Lithium Pro: flagship 120 km range (hero / catalog max)
update public.scooters
set variants = (
  select jsonb_agg(
    case
      when elem->>'id' = 'lithium-pro' then jsonb_set(elem, '{range}', '120')
      else elem
    end
    order by ord
  )
  from jsonb_array_elements(variants) with ordinality as t(elem, ord)
)
where id = 'zoom';
