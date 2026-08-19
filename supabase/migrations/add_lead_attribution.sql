-- Migration 28: first-touch marketing attribution on leads + inbox rows
-- Stores UTM / gclid / channel so Admin → Analytics can show ads vs SEO close-rate.

alter table public.leads add column if not exists attribution jsonb;
alter table public.callbacks add column if not exists attribution jsonb;
alter table public.test_rides add column if not exists attribution jsonb;
alter table public.service_bookings add column if not exists attribution jsonb;
alter table public.contact_messages add column if not exists attribution jsonb;

create index if not exists leads_attribution_channel_idx
  on public.leads ((attribution->>'channel'));

-- Replace 7-arg RPC with optional attribution (first-touch, never overwrite a paid click).
drop function if exists public.upsert_lead(text, text, text, text, text, int, text);

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
