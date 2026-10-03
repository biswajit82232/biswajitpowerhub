-- How a scooter sale turns the percent into a sticker price.
-- smart: at least the percent off, then the nearest showroom ending (…999 / …499) underneath.
-- exact: the percent only.

alter table public.promotional_offers
  add column if not exists price_technique text not null default 'smart';

do $$ begin
  alter table public.promotional_offers
    drop constraint if exists promotional_offers_price_technique_check;
  alter table public.promotional_offers
    add constraint promotional_offers_price_technique_check
    check (price_technique = any (array['smart'::text, 'exact'::text]));
exception when others then null;
end $$;

comment on column public.promotional_offers.price_technique is 'smart = showroom charm price at or below the percent; exact = percent only';
