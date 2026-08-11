-- ============================================================================
-- Migration 23: Harden RLS leftovers, Storage is_admin, anon insert CHECKs, analytics meta redaction
-- Idempotent — safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1a. Drop leftover permissive policies (name mismatches from migration 22)
-- ---------------------------------------------------------------------------
drop policy if exists "auth all site settings" on public.site_settings;
drop policy if exists "auth all offers" on public.promotional_offers;
drop policy if exists "auth read all offers" on public.promotional_offers;
drop policy if exists "auth read vyapar_settings" on public.vyapar_settings;
drop policy if exists "auth read vyapar_items" on public.vyapar_items;

-- Ensure admin-only policies exist (drop-first for idempotency)
do $$
begin
  if to_regclass('public.site_settings') is not null then
    execute 'drop policy if exists "admin all site_settings" on public.site_settings';
    execute 'create policy "admin all site_settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
  if to_regclass('public.promotional_offers') is not null then
    execute 'drop policy if exists "admin all promotional_offers" on public.promotional_offers';
    execute 'create policy "admin all promotional_offers" on public.promotional_offers for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
  if to_regclass('public.vyapar_settings') is not null then
    execute 'drop policy if exists "admin all vyapar_settings" on public.vyapar_settings';
    execute 'create policy "admin all vyapar_settings" on public.vyapar_settings for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
  if to_regclass('public.vyapar_items') is not null then
    execute 'drop policy if exists "admin all vyapar_items" on public.vyapar_items';
    execute 'create policy "admin all vyapar_items" on public.vyapar_items for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 1b. Storage — catalog buckets require is_admin(); review delete → admin only
-- ---------------------------------------------------------------------------

-- scooter-images
drop policy if exists "Auth upload scooter images" on storage.objects;
drop policy if exists "Auth delete scooter images" on storage.objects;
drop policy if exists "Auth update scooter images" on storage.objects;
drop policy if exists "Admin upload scooter images" on storage.objects;
drop policy if exists "Admin update scooter images" on storage.objects;
drop policy if exists "Admin delete scooter images" on storage.objects;

create policy "Admin upload scooter images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'scooter-images' and public.is_admin());

create policy "Admin update scooter images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'scooter-images' and public.is_admin())
  with check (bucket_id = 'scooter-images' and public.is_admin());

create policy "Admin delete scooter images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'scooter-images' and public.is_admin());

-- accessory-images
drop policy if exists "Auth upload accessory images" on storage.objects;
drop policy if exists "Auth delete accessory images" on storage.objects;
drop policy if exists "Auth update accessory images" on storage.objects;
drop policy if exists "Admin upload accessory images" on storage.objects;
drop policy if exists "Admin update accessory images" on storage.objects;
drop policy if exists "Admin delete accessory images" on storage.objects;

create policy "Admin upload accessory images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'accessory-images' and public.is_admin());

create policy "Admin update accessory images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'accessory-images' and public.is_admin())
  with check (bucket_id = 'accessory-images' and public.is_admin());

create policy "Admin delete accessory images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'accessory-images' and public.is_admin());

-- review-photos: keep anon/auth insert; delete admin-only
drop policy if exists "Auth delete review photos" on storage.objects;
drop policy if exists "Admin delete review photos" on storage.objects;

create policy "Admin delete review photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'review-photos' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 1c. Tighten anon lead inserts (cannot hide rows via handled/status/is_read)
-- ---------------------------------------------------------------------------
drop policy if exists "anon insert callbacks" on public.callbacks;
create policy "anon insert callbacks" on public.callbacks
  for insert to anon
  with check (coalesce(handled, false) = false);

drop policy if exists "anon insert testrides" on public.test_rides;
create policy "anon insert testrides" on public.test_rides
  for insert to anon
  with check (coalesce(status, 'requested') = 'requested');

drop policy if exists "anon insert service_bookings" on public.service_bookings;
create policy "anon insert service_bookings" on public.service_bookings
  for insert to anon
  with check (coalesce(status, 'requested') = 'requested');

drop policy if exists "anon insert contact" on public.contact_messages;
create policy "anon insert contact" on public.contact_messages
  for insert to anon
  with check (coalesce(is_read, false) = false);

-- ---------------------------------------------------------------------------
-- 1d. Analytics RPC — redact name/phone from meta for non-admins
-- ---------------------------------------------------------------------------
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

revoke all on function public.get_analytics_events(int) from public;
grant execute on function public.get_analytics_events(int) to anon, authenticated;
