-- =============================================================================
-- 004_backfill_profiles.sql
--
-- Backfill a profile row for any auth.users account that was created before
-- the handle_new_user trigger existed. Safe to re-run (ON CONFLICT DO NOTHING).
-- =============================================================================

insert into public.profiles (id, username, avatar_url, created_at)
select
  u.id,
  split_part(u.email, '@', 1) as username,
  u.raw_user_meta_data ->> 'avatar_url' as avatar_url,
  u.created_at
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
on conflict (id) do nothing;
