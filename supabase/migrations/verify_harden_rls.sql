-- Verify migration 23 applied (run in Supabase SQL editor after harden_rls_storage_and_rpc.sql)
-- Expect: zero rows for leftover permissive policies; storage policies use is_admin.

select policyname, tablename
from pg_policies
where schemaname = 'public'
  and policyname in (
    'auth all site settings',
    'auth all offers',
    'auth read all offers',
    'auth read vyapar_settings',
    'auth read vyapar_items'
  );

select policyname
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like '%scooter images%'
     or policyname like '%accessory images%'
     or policyname like '%review photos%';
