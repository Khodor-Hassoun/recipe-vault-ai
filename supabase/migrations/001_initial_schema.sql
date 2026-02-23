-- =============================================================================
-- 001_initial_schema.sql
-- Initial schema for the recipe app
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Custom enum types
-- ---------------------------------------------------------------------------
create type public.recipe_status as enum ('favorite', 'to_try', 'made_before');
create type public.share_permission as enum ('view', 'edit');

-- ---------------------------------------------------------------------------
-- profiles
-- Mirrors auth.users; auto-populated via trigger on signup.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  username    text        unique,
  avatar_url  text        default null,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Trigger: auto-create a profile row when a new user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    split_part(new.email, '@', 1),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- recipes
-- ---------------------------------------------------------------------------
create table public.recipes (
  id              uuid            primary key default gen_random_uuid(),
  user_id         uuid            not null references auth.users (id) on delete cascade,
  title           text            not null,
  description     text            default null,
  ingredients     jsonb           not null default '[]'::jsonb,
  instructions    jsonb           not null default '[]'::jsonb,
  cuisine_type    text            default null,
  prep_time_mins  integer         default null check (prep_time_mins >= 0),
  cook_time_mins  integer         default null check (cook_time_mins >= 0),
  servings        integer         default null check (servings > 0),
  image_url       text            default null,
  status          recipe_status   not null default 'to_try',
  is_public       boolean         not null default false,
  ai_generated    boolean         not null default false,
  tags            text[]          not null default '{}',
  created_at      timestamptz     not null default now(),
  updated_at      timestamptz     not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- shared_recipes
-- Must be created BEFORE recipes RLS policies that reference it.
-- ---------------------------------------------------------------------------
create table public.shared_recipes (
  id           uuid             primary key default gen_random_uuid(),
  recipe_id    uuid             not null references public.recipes (id) on delete cascade,
  shared_with  text             not null,
  permission   share_permission not null default 'view',
  created_at   timestamptz      not null default now(),
  unique (recipe_id, shared_with)
);

alter table public.shared_recipes enable row level security;

create policy "shared_recipes_owner_all"
  on public.shared_recipes for all
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.user_id = auth.uid()
    )
  );

create policy "shared_recipes_select_recipient"
  on public.shared_recipes for select
  using (shared_with = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- recipes RLS
-- Defined after shared_recipes so the subqueries resolve correctly.
-- ---------------------------------------------------------------------------
alter table public.recipes enable row level security;

create policy "recipes_select"
  on public.recipes for select
  using (
    user_id = auth.uid()
    or is_public = true
    or exists (
      select 1 from public.shared_recipes sr
      where sr.recipe_id = id
        and sr.shared_with = auth.uid()::text
    )
  );

create policy "recipes_insert_own"
  on public.recipes for insert
  with check (user_id = auth.uid());

create policy "recipes_update"
  on public.recipes for update
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.shared_recipes sr
      where sr.recipe_id = id
        and sr.shared_with = auth.uid()::text
        and sr.permission = 'edit'
    )
  )
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.shared_recipes sr
      where sr.recipe_id = id
        and sr.shared_with = auth.uid()::text
        and sr.permission = 'edit'
    )
  );

create policy "recipes_delete_own"
  on public.recipes for delete
  using (user_id = auth.uid());

