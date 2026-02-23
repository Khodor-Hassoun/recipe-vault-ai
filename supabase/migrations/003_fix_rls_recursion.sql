-- =============================================================================
-- 003_fix_rls_recursion.sql
--
-- Problem: infinite recursion between recipes and shared_recipes RLS policies.
--   recipes_select  → queries shared_recipes
--   shared_recipes_owner_all → queries recipes  → triggers recipes_select → loop
--
-- Fix: replace the shared_recipes_owner_all subquery with a SECURITY DEFINER
-- function that reads recipes while bypassing RLS, breaking the cycle.
-- =============================================================================

-- A security definer function runs as its owner (postgres / superuser) and
-- therefore bypasses RLS when it reads the recipes table.
create or replace function public.is_recipe_owner(p_recipe_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.recipes
    where id = p_recipe_id
      and user_id = auth.uid()
  );
$$;

-- Recreate the shared_recipes owner policy using the function instead of a
-- direct subquery against recipes.
drop policy if exists "shared_recipes_owner_all" on public.shared_recipes;

create policy "shared_recipes_owner_all"
  on public.shared_recipes for all
  using  (public.is_recipe_owner(recipe_id))
  with check (public.is_recipe_owner(recipe_id));
