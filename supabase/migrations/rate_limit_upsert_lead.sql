-- ============================================================================
-- Migration 26: Rate-limit public upsert_lead (anon SECURITY DEFINER RPC)
-- Per-visitor 2s debounce; cap new lead rows at 40 per 5 minutes.
-- Idempotent — safe to re-run.
-- ============================================================================

create or replace function public.upsert_lead(
  p_visitor_id text,
  p_name text,
  p_phone text,
  p_last_source text,
  p_interested_scooter text,
  p_score int,
  p_classification text
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

  -- Ignore rapid repeats from the same visitor (retry / score spam).
  if exists (
    select 1 from public.leads
    where visitor_id = p_visitor_id
      and updated_at > now() - interval '2 seconds'
  ) then
    return;
  end if;

  -- Flood cap on brand-new visitor_id values (arbitrary-id spam).
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
    score, classification, updated_at
  )
  values (
    p_visitor_id, p_name, p_phone, p_last_source, p_interested_scooter,
    coalesce(p_score, 0), coalesce(p_classification, 'cold'), now()
  )
  on conflict (visitor_id) do update set
    name = coalesce(excluded.name, leads.name),
    phone = coalesce(excluded.phone, leads.phone),
    last_source = excluded.last_source,
    interested_scooter = coalesce(excluded.interested_scooter, leads.interested_scooter),
    score = greatest(coalesce(leads.score, 0), coalesce(excluded.score, 0)),
    classification = excluded.classification,
    updated_at = now();
end;
$$;

revoke all on function public.upsert_lead(text, text, text, text, text, int, text) from public;
grant execute on function public.upsert_lead(text, text, text, text, text, int, text) to anon, authenticated;
