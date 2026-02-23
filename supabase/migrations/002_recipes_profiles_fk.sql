-- =============================================================================
-- 002_recipes_profiles_fk.sql
-- Replace the recipes.user_id → auth.users FK with one pointing to profiles so
-- PostgREST can resolve the recipes ↔ profiles relationship for embedded selects.
-- profiles.id itself cascades from auth.users, so delete behaviour is unchanged.
-- =============================================================================

alter table public.recipes
  drop constraint recipes_user_id_fkey;

alter table public.recipes
  add constraint recipes_user_id_fkey
  foreign key (user_id)
  references public.profiles (id)
  on delete cascade;
