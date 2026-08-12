-- ============================================================================
-- Migration 25: Revoke PostgREST EXECUTE on is_admin() from anon
-- RLS policies still call is_admin() as the table owner / SECURITY DEFINER.
-- Anon must not probe /rest/v1/rpc/is_admin.
-- Idempotent — safe to re-run.
-- ============================================================================

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated, service_role;
