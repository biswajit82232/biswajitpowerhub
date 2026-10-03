-- Percent-off sale on selected scooters (admin Offers → Sale).
-- scooter ids are catalog slugs (activa, zoom, …), not uuids.

alter table public.promotional_offers
  add column if not exists discount_percent numeric,
  add column if not exists scooter_ids text[] not null default '{}';

do $$ begin
  alter table public.promotional_offers
    drop constraint if exists promotional_offers_kind_check;
  alter table public.promotional_offers
    add constraint promotional_offers_kind_check
    check (kind = any (array['promo'::text, 'free_with_purchase'::text, 'scooter_sale'::text]));
exception when others then null;
end $$;

do $$ begin
  alter table public.promotional_offers
    drop constraint if exists promotional_offers_scooter_sale_check;
  alter table public.promotional_offers
    add constraint promotional_offers_scooter_sale_check
    check (
      kind <> 'scooter_sale'
      or (
        discount_percent >= 1
        and discount_percent <= 90
        and cardinality(scooter_ids) > 0
      )
    );
exception when others then null;
end $$;

comment on column public.promotional_offers.kind is 'promo = discount strip; free_with_purchase = free gift; scooter_sale = percent off selected scooters';
comment on column public.promotional_offers.discount_percent is 'Whole-number percent off list price for scooter_sale (1–90). Null for other kinds.';
comment on column public.promotional_offers.scooter_ids is 'Catalog scooter ids included in a scooter_sale offer.';
