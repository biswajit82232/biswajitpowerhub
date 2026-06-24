-- Site settings (contact, hours, address) — run in Supabase SQL editor
create table if not exists public.site_settings (
  id              int primary key default 1,
  phones          jsonb not null default '["9635505436", "9775441797"]'::jsonb,
  whatsapp        text not null default '919635505436',
  address_line    text not null default 'Nimtala, Chunakhali, Berhampore',
  address_city    text not null default 'Berhampore',
  address_state   text not null default 'West Bengal',
  address_pincode text not null default '742149',
  address_country text not null default 'India',
  maps_link       text default 'https://maps.app.goo.gl/jRPDFP7DyfPocFEj8?g_st=ac',
  maps_embed      text default 'https://www.google.com/maps?q=Nimtala%2C%20Chunakhali%2C%20Berhampore%2C%20West%20Bengal%20742149&output=embed',
  hours           jsonb not null default '{
    "mon": {"open": "10:00", "close": "20:00", "closed": false},
    "tue": {"open": "10:00", "close": "20:00", "closed": false},
    "wed": {"open": "10:00", "close": "20:00", "closed": false},
    "thu": {"open": "10:00", "close": "20:00", "closed": false},
    "fri": {"open": "10:00", "close": "20:00", "closed": false},
    "sat": {"open": "10:00", "close": "20:00", "closed": false},
    "sun": {"open": "11:00", "close": "18:00", "closed": false}
  }'::jsonb,
  updated_at      timestamptz default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "public read site settings" on public.site_settings;
create policy "public read site settings" on public.site_settings
  for select using (true);

drop policy if exists "auth all site settings" on public.site_settings;
create policy "auth all site settings" on public.site_settings
  for all to authenticated using (true) with check (true);
