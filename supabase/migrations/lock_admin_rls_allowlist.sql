-- Admin allowlist + RLS lock: only allowlisted emails can manage CRM/catalog.
-- Public anon inserts/selects for the website stay intact.

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

-- Seed known owner (idempotent)
insert into public.admin_allowlist (email)
values ('biswajithowladar123@gmail.com')
on conflict (email) do nothing;

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
grant execute on function public.is_admin() to authenticated, anon, service_role;

-- Replace broad "auth all …" policies with is_admin() checks
do $$
declare
  t text;
begin
  foreach t in array array[
    'leads',
    'callbacks',
    'test_rides',
    'service_bookings',
    'contact_messages',
    'lead_events',
    'reviews',
    'scooters',
    'accessories',
    'finance_settings',
    'site_settings',
    'promotional_offers',
    'vyapar_settings',
    'vyapar_items'
  ]
  loop
    if to_regclass('public.' || t) is null then
      continue;
    end if;
    execute format('drop policy if exists %I on public.%I', 'auth all ' || t, t);
    -- legacy policy names from schema.sql
    execute format('drop policy if exists %I on public.%I', 'auth all ' || replace(t, '_', ''), t);
  end loop;
end $$;

-- Explicit drops for known legacy names
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
drop policy if exists "auth all site_settings" on public.site_settings;
drop policy if exists "auth all promotional_offers" on public.promotional_offers;
drop policy if exists "auth all vyapar_settings" on public.vyapar_settings;
drop policy if exists "auth all vyapar_items" on public.vyapar_items;

create policy "admin all scooters" on public.scooters for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all accessories" on public.accessories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all reviews" on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all callbacks" on public.callbacks for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all testrides" on public.test_rides for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all service_bookings" on public.service_bookings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all contact" on public.contact_messages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all events" on public.lead_events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all leads" on public.leads for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all finance" on public.finance_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

do $$
begin
  if to_regclass('public.site_settings') is not null then
    execute 'create policy "admin all site_settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
  if to_regclass('public.promotional_offers') is not null then
    execute 'create policy "admin all promotional_offers" on public.promotional_offers for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
  if to_regclass('public.vyapar_settings') is not null then
    execute 'create policy "admin all vyapar_settings" on public.vyapar_settings for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
  if to_regclass('public.vyapar_items') is not null then
    execute 'create policy "admin all vyapar_items" on public.vyapar_items for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
end $$;

-- Public analytics RPC: visitor_id only for admins; anon gets popularity signals only
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
    e.meta,
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

revoke all on function public.get_analytics_events(int) from public;
grant execute on function public.get_analytics_events(int) to anon, authenticated;
