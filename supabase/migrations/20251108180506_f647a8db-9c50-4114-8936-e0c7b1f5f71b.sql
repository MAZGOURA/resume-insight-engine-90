-- Fix profiles foreign key to reference auth.users and robust new-user trigger
-- 1) Ensure FK points to auth.users to avoid violations during signup
alter table if exists public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id)
  references auth.users(id)
  on delete cascade;

-- 2) Robust handle_new_user function to upsert profile from auth metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    avatar_url,
    phone
  )
  values (
    new.id,
    new.email,
    nullif(trim((new.raw_user_meta_data->>'email')::text), '')::text,
    nullif(trim((new.raw_user_meta_data->>'last_name')::text), '')::text,
    coalesce(
      nullif(trim((new.raw_user_meta_data->>'full_name')::text), ''),
      concat(
        coalesce(nullif(trim((new.raw_user_meta_data->>'first_name')::text), ''), ''),
        case when nullif(trim((new.raw_user_meta_data->>'last_name')::text), '') is not null then ' ' else '' end,
        coalesce(nullif(trim((new.raw_user_meta_data->>'last_name')::text), ''), '')
      )
    ),
    nullif(trim((new.raw_user_meta_data->>'avatar_url')::text), ''),
    nullif(trim((new.raw_user_meta_data->>'phone')::text), '')
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = coalesce(excluded.first_name, public.profiles.first_name),
    last_name = coalesce(excluded.last_name, public.profiles.last_name),
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    phone = coalesce(excluded.phone, public.profiles.phone),
    updated_at = now();

  return new;
end;
$$;

-- 3) Recreate trigger safely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4) Ensure RLS policies exist for profiles (view/update own profile)
-- Note: Policies may already exist; create if missing
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can view their own profile'
  ) then
    create policy "Users can view their own profile"
      on public.profiles for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can update their own profile'
  ) then
    create policy "Users can update their own profile"
      on public.profiles for update
      using (auth.uid() = id);
  end if;
end $$;