-- ============================================================================
-- BISWAJIT POWER HUB — Supabase schema (hardened)
--
-- Run in the Supabase SQL editor. Safe to re-run (IF NOT EXISTS / DROP POLICY).
--
-- THIS FILE IS PRODUCTION-SAFE for the tables it creates: authenticated writes
-- require public.is_admin() (JWT email on admin_allowlist), not "any signed-in
-- user". Stopping after this file + seed.sql will NOT leave CRM tables open.
--
-- It is NOT a complete dump of production. You MUST still apply
-- supabase/migrations/ (site_settings, offers, vyapar, storage buckets, etc.).
--
-- After first run, insert your admin email (do not commit it here):
--   insert into public.admin_allowlist (email) values ('you@example.com');
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- SCOOTERS (catalog / inventory)
-- ---------------------------------------------------------------------------
create table if not exists public.scooters (
  id                text primary key,
  name              text not null,
  brand             text default 'PowerHub',
  tagline           text,
  price             numeric not null default 0,
  hue               text default 'blue',
  images            jsonb default '[]'::jsonb,
  battery_type      text,
  battery_capacity  text,
  range_km          numeric default 0,
  real_range_factor numeric default 0.83,
  top_speed         numeric default 25,
  charging_time     text,
  warranty          text,
  battery_warranty  text,
  motor             text,
  weight            text,
  load_capacity     text,
  colors            jsonb default '[]'::jsonb,
  no_licence        boolean default true,
  no_registration   boolean default true,
  is_budget         boolean default false,
  is_premium        boolean default false,
  stock_status      text default 'in_stock',
  featured          boolean default false,
  description       text,
  features          jsonb default '[]'::jsonb,
  benefits          jsonb default '[]'::jsonb,
  variants          jsonb default '[]'::jsonb,
  created_at        timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- ACCESSORIES (parts & add-ons catalog)
-- ---------------------------------------------------------------------------
create table if not exists public.accessories (
  id              text primary key,
  name            text not null,
  category        text not null default 'Other',
  price           numeric not null default 0,
  hue             text default 'teal',
  images          jsonb default '[]'::jsonb,
  description     text,
  compatibility   text,
  stock_status    text default 'in_stock',
  featured        boolean default false,
  created_at      timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  rating      int not null check (rating between 1 and 5),
  review      text not null,
  scooter     text,
  photo_url   text,
  status      text not null default 'pending', -- pending | approved | rejected | hidden
  featured    boolean default false,
  created_at  timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- CALLBACK REQUESTS
-- ---------------------------------------------------------------------------
create table if not exists public.callbacks (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  visitor_id  text,
  handled     boolean default false,
  created_at  timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- TEST RIDE REQUESTS
-- ---------------------------------------------------------------------------
create table if not exists public.test_rides (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  phone           text not null,
  preferred_date  date,
  preferred_time  text,
  scooter         text,
  scooter_id      text,
  visitor_id      text,
  status          text default 'requested',
  created_at      timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- SERVICE BOOKINGS (free 1st/2nd/3rd + paid)
-- ---------------------------------------------------------------------------
create table if not exists public.service_bookings (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  phone           text not null,
  service_kind    text not null check (service_kind in ('free_1', 'free_2', 'free_3', 'paid')),
  details         text,
  scooter         text,
  scooter_id      text,
  preferred_date  date,
  preferred_time  text,
  visitor_id      text,
  status          text default 'requested',
  created_at      timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- CONTACT MESSAGES
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  email       text,
  message     text not null,
  visitor_id  text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- LEAD EVENTS (raw interaction stream)
-- ---------------------------------------------------------------------------
create table if not exists public.lead_events (
  id          bigint generated by default as identity primary key,
  visitor_id  text,
  event_type  text not null,
  meta        jsonb default '{}'::jsonb,
  created_at  timestamptz default now()
);
create index if not exists lead_events_visitor_idx on public.lead_events (visitor_id);
create index if not exists lead_events_type_idx on public.lead_events (event_type);

-- ---------------------------------------------------------------------------
-- LEADS (aggregated, scored — keyed by visitor_id)
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id                  uuid primary key default gen_random_uuid(),
  visitor_id          text unique,
  name                text,
  phone               text,
  last_source         text,
  interested_scooter  text,
  score               int default 0,
  classification      text default 'cold', -- hot | warm | cold
  status              text default 'new',  -- new | contacted | follow_up | converted | lost
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  attribution         jsonb
);

alter table public.callbacks add column if not exists attribution jsonb;
alter table public.test_rides add column if not exists attribution jsonb;
alter table public.service_bookings add column if not exists attribution jsonb;
alter table public.contact_messages add column if not exists attribution jsonb;

-- ---------------------------------------------------------------------------
-- FINANCE SETTINGS (single row)
-- ---------------------------------------------------------------------------
create table if not exists public.finance_settings (
  id                    int primary key default 1,
  interest_rate         numeric default 12,
  down_payment_pct      numeric default 20,
  tenure_options        jsonb default '[6,12,18,24,36]'::jsonb,
  default_tenure        int default 12,
  min_down_payment_pct  numeric default 10,
  max_down_payment_pct  numeric default 60,
  file_charges          numeric default 2500,
  petrol_price_per_litre numeric default 110,
  petrol_mileage_km_per_litre numeric default 40,
  electricity_rate_per_unit numeric default 7,
  promo                 jsonb default '{"active":false,"label":""}'::jsonb,
  updated_at            timestamptz default now()
);
insert into public.finance_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- ADMIN ALLOWLIST (RLS gate — insert your email after first run)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_allowlist (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_allowlist enable row level security;

drop policy if exists "admins read allowlist" on public.admin_allowlist;
create policy "admins read allowlist"
  on public.admin_allowlist for select to authenticated
  using (
    lower(auth.jwt() ->> 'email') = lower(email)
    or exists (
      select 1 from public.admin_allowlist a
      where lower(a.email) = lower(auth.jwt() ->> 'email')
    )
  );

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_allowlist a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated, service_role;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.scooters         enable row level security;
alter table public.accessories      enable row level security;
alter table public.reviews          enable row level security;
alter table public.callbacks        enable row level security;
alter table public.test_rides       enable row level security;
alter table public.service_bookings enable row level security;
alter table public.contact_messages enable row level security;
alter table public.lead_events      enable row level security;
alter table public.leads            enable row level security;
alter table public.finance_settings enable row level security;

-- Drop legacy permissive names so re-running this file upgrades an old install
drop policy if exists "auth all scooters" on public.scooters;
drop policy if exists "auth all accessories" on public.accessories;
drop policy if exists "auth all reviews" on public.reviews;
drop policy if exists "auth all callbacks" on public.callbacks;
drop policy if exists "auth all testrides" on public.test_rides;
drop policy if exists "auth all service_bookings" on public.service_bookings;
drop policy if exists "auth all contact" on public.contact_messages;
drop policy if exists "auth all events" on public.lead_events;
drop policy if exists "auth all leads" on public.leads;
drop policy if exists "auth all finance" on public.finance_settings;
drop policy if exists "public read scooters" on public.scooters;
drop policy if exists "public read accessories" on public.accessories;
drop policy if exists "public read finance" on public.finance_settings;
drop policy if exists "public read approved reviews" on public.reviews;
drop policy if exists "anon insert reviews" on public.reviews;
drop policy if exists "anon insert callbacks" on public.callbacks;
drop policy if exists "anon insert testrides" on public.test_rides;
drop policy if exists "anon insert service_bookings" on public.service_bookings;
drop policy if exists "anon insert contact" on public.contact_messages;
drop policy if exists "anon insert events" on public.lead_events;
drop policy if exists "admin all scooters" on public.scooters;
drop policy if exists "admin all accessories" on public.accessories;
drop policy if exists "admin all reviews" on public.reviews;
drop policy if exists "admin all callbacks" on public.callbacks;
drop policy if exists "admin all testrides" on public.test_rides;
drop policy if exists "admin all service_bookings" on public.service_bookings;
drop policy if exists "admin all contact" on public.contact_messages;
drop policy if exists "admin all events" on public.lead_events;
drop policy if exists "admin all leads" on public.leads;
drop policy if exists "admin all finance" on public.finance_settings;

-- Public READ: scooters, finance settings, and approved reviews
create policy "public read scooters" on public.scooters
  for select using (true);

create policy "public read accessories" on public.accessories
  for select using (true);

create policy "public read finance" on public.finance_settings
  for select using (true);

create policy "public read approved reviews" on public.reviews
  for select using (status = 'approved');

-- Public INSERT: lead capture forms + events (anon can submit, not read).
-- WITH CHECK forces the default unhandled state so a client cannot hide a row.
create policy "anon insert reviews" on public.reviews
  for insert to anon
  with check (status = 'pending' and featured = false and rating between 1 and 5);
create policy "anon insert callbacks" on public.callbacks
  for insert to anon
  with check (coalesce(handled, false) = false);
create policy "anon insert testrides" on public.test_rides
  for insert to anon
  with check (coalesce(status, 'requested') = 'requested');
create policy "anon insert service_bookings" on public.service_bookings
  for insert to anon
  with check (coalesce(status, 'requested') = 'requested');
create policy "anon insert contact" on public.contact_messages
  for insert to anon
  with check (coalesce(is_read, false) = false);
create policy "anon insert events" on public.lead_events
  for insert
  with check (true);
-- Leads: anon upsert via upsert_lead() RPC only (see functions below)

-- Authenticated writes: allowlisted admins only (not every signed-in user)
create policy "admin all scooters" on public.scooters
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all accessories" on public.accessories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all reviews" on public.reviews
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all callbacks" on public.callbacks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all testrides" on public.test_rides
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all service_bookings" on public.service_bookings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all contact" on public.contact_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all events" on public.lead_events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all leads" on public.leads
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all finance" on public.finance_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- SECURITY DEFINER RPCs (public lead upsert + analytics read)
-- ============================================================================

create or replace function public.enforce_review_pending()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.featured := false;
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_force_pending on public.reviews;
create trigger reviews_force_pending
  before insert on public.reviews
  for each row execute function public.enforce_review_pending();

create or replace function public.upsert_lead(
  p_visitor_id text,
  p_name text,
  p_phone text,
  p_last_source text,
  p_interested_scooter text,
  p_score int,
  p_classification text,
  p_attribution jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  new_leads_recent int;
begin
  if p_visitor_id is null or length(trim(p_visitor_id)) = 0 then
    raise exception 'visitor_id required';
  end if;

  if exists (
    select 1 from public.leads
    where visitor_id = p_visitor_id
      and updated_at > now() - interval '2 seconds'
  ) then
    return;
  end if;

  if not exists (select 1 from public.leads where visitor_id = p_visitor_id) then
    select count(*) into new_leads_recent
    from public.leads
    where created_at > now() - interval '5 minutes';
    if coalesce(new_leads_recent, 0) >= 40 then
      raise exception 'rate limited';
    end if;
  end if;

  insert into public.leads (
    visitor_id, name, phone, last_source, interested_scooter,
    score, classification, attribution, updated_at
  )
  values (
    p_visitor_id, p_name, p_phone, p_last_source, p_interested_scooter,
    coalesce(p_score, 0), coalesce(p_classification, 'cold'), p_attribution, now()
  )
  on conflict (visitor_id) do update set
    name = coalesce(excluded.name, leads.name),
    phone = coalesce(excluded.phone, leads.phone),
    last_source = excluded.last_source,
    interested_scooter = coalesce(excluded.interested_scooter, leads.interested_scooter),
    score = greatest(coalesce(leads.score, 0), coalesce(excluded.score, 0)),
    classification = case
      when leads.classification = 'hot' or excluded.classification = 'hot' then 'hot'
      when leads.classification = 'warm' or excluded.classification = 'warm' then 'warm'
      else coalesce(excluded.classification, leads.classification, 'cold')
    end,
    attribution = case
      when leads.attribution is null then excluded.attribution
      when coalesce(leads.attribution->>'channel', 'direct') = 'direct'
           and coalesce(excluded.attribution->>'channel', 'direct') is distinct from 'direct'
        then excluded.attribution
      else leads.attribution
    end,
    updated_at = now();
end;
$$;

revoke all on function public.upsert_lead(text, text, text, text, text, int, text, jsonb) from public;
grant execute on function public.upsert_lead(text, text, text, text, text, int, text, jsonb) to anon, authenticated;

create or replace function public.get_analytics_events(p_limit int default 8000)
returns table (
  event_type text,
  meta jsonb,
  created_at timestamptz,
  visitor_id text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    e.event_type,
    case
      when public.is_admin() then e.meta
      else coalesce(e.meta, '{}'::jsonb)
        - 'name' - 'phone' - 'email' - 'message' - 'details'
    end as meta,
    e.created_at,
    case when public.is_admin() then e.visitor_id else null end as visitor_id
  from public.lead_events e
  where e.event_type in (
    'scooter_view',
    'emi_calculator_used',
    'simulator_used',
    'test_ride_booked',
    'callback_request',
    'compare_used',
    'whatsapp_click',
    'call_click',
    'service_booked',
    'contact_form',
    'page_view'
  )
  and (
    public.is_admin()
    or e.event_type in (
      'scooter_view',
      'emi_calculator_used',
      'simulator_used',
      'test_ride_booked',
      'callback_request',
      'compare_used'
    )
  )
  order by e.created_at desc
  limit greatest(1, least(coalesce(p_limit, 8000), 8000));
$$;

revoke all on function public.get_analytics_events(int) from public, anon;
grant execute on function public.get_analytics_events(int) to authenticated;

-- ---------------------------------------------------------------------------
-- Public write rate limits (forms, reviews, analytics events)
-- ---------------------------------------------------------------------------
create index if not exists callbacks_visitor_created_idx
  on public.callbacks (visitor_id, created_at desc);
create index if not exists callbacks_created_at_idx
  on public.callbacks (created_at desc);
create index if not exists test_rides_visitor_created_idx
  on public.test_rides (visitor_id, created_at desc);
create index if not exists test_rides_created_at_idx
  on public.test_rides (created_at desc);
create index if not exists service_bookings_visitor_created_idx
  on public.service_bookings (visitor_id, created_at desc);
create index if not exists service_bookings_created_at_idx
  on public.service_bookings (created_at desc);
create index if not exists contact_messages_visitor_created_idx
  on public.contact_messages (visitor_id, created_at desc);
create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);
create index if not exists reviews_created_at_idx
  on public.reviews (created_at desc);
create index if not exists lead_events_visitor_created_idx
  on public.lead_events (visitor_id, created_at desc);
create index if not exists lead_events_created_at_idx
  on public.lead_events (created_at desc);

create or replace function public.assert_public_write_rate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  vid text;
  recent_visitor int;
  recent_global int;
  visitor_window interval;
  global_cap int;
  global_window interval := interval '5 minutes';
begin
  vid := nullif(trim(coalesce(to_jsonb(NEW) ->> 'visitor_id', '')), '');

  if TG_TABLE_NAME = 'lead_events' then
    visitor_window := interval '10 seconds';
    global_cap := 200;
  elsif TG_TABLE_NAME = 'reviews' then
    visitor_window := interval '30 seconds';
    global_cap := 20;
  else
    visitor_window := interval '2 seconds';
    global_cap := 40;
  end if;

  if vid is not null and TG_TABLE_NAME <> 'reviews' then
    execute format(
      'select count(*) from public.%I where visitor_id = $1 and created_at > now() - $2',
      TG_TABLE_NAME
    )
    into recent_visitor
    using vid, visitor_window;

    if TG_TABLE_NAME = 'lead_events' then
      if coalesce(recent_visitor, 0) >= 15 then
        raise exception 'rate limited';
      end if;
    elsif coalesce(recent_visitor, 0) > 0 then
      raise exception 'rate limited';
    end if;
  end if;

  execute format(
    'select count(*) from public.%I where created_at > now() - $1',
    TG_TABLE_NAME
  )
  into recent_global
  using global_window;

  if coalesce(recent_global, 0) >= global_cap then
    raise exception 'rate limited';
  end if;

  return NEW;
end;
$$;

drop trigger if exists callbacks_write_rate on public.callbacks;
create trigger callbacks_write_rate
  before insert on public.callbacks
  for each row execute function public.assert_public_write_rate();

drop trigger if exists test_rides_write_rate on public.test_rides;
create trigger test_rides_write_rate
  before insert on public.test_rides
  for each row execute function public.assert_public_write_rate();

drop trigger if exists service_bookings_write_rate on public.service_bookings;
create trigger service_bookings_write_rate
  before insert on public.service_bookings
  for each row execute function public.assert_public_write_rate();

drop trigger if exists contact_messages_write_rate on public.contact_messages;
create trigger contact_messages_write_rate
  before insert on public.contact_messages
  for each row execute function public.assert_public_write_rate();

drop trigger if exists reviews_write_rate on public.reviews;
create trigger reviews_write_rate
  before insert on public.reviews
  for each row execute function public.assert_public_write_rate();

drop trigger if exists lead_events_write_rate on public.lead_events;
create trigger lead_events_write_rate
  before insert on public.lead_events
  for each row execute function public.assert_public_write_rate();

revoke all on function public.assert_public_write_rate() from public, anon, authenticated;

create or replace function public.get_public_popularity_events(p_limit int default 8000)
returns table (event_type text, created_at timestamptz, scooter_key text)
language sql
security definer
set search_path = public
stable
as $$
  select
    e.event_type,
    e.created_at,
    coalesce(e.meta->>'scooterId', e.meta->>'name', e.meta->>'interest') as scooter_key
  from public.lead_events e
  where e.event_type in (
    'scooter_view',
    'emi_calculator_used',
    'simulator_used',
    'test_ride_booked',
    'callback_request'
  )
  order by e.created_at desc
  limit greatest(1, least(coalesce(p_limit, 8000), 8000));
$$;

revoke all on function public.get_public_popularity_events(int) from public;
grant execute on function public.get_public_popularity_events(int) to anon, authenticated;


