-- Free-with-purchase offers: kind, image, hero sticky flag
alter table public.promotional_offers
  add column if not exists kind text not null default 'promo',
  add column if not exists image_url text default '',
  add column if not exists show_on_hero boolean default true;

do $$ begin
  alter table public.promotional_offers
    drop constraint if exists promotional_offers_kind_check;
  alter table public.promotional_offers
    add constraint promotional_offers_kind_check
    check (kind = any (array['promo'::text, 'free_with_purchase'::text]));
exception when others then null;
end $$;

comment on column public.promotional_offers.kind is 'promo = discount strip; free_with_purchase = free gift with scooter (hero sticky)';
comment on column public.promotional_offers.image_url is 'Optional product/gift photo for free-with-purchase offers';
comment on column public.promotional_offers.show_on_hero is 'When true, show on homepage hero (promo bar or sticky free badge)';
