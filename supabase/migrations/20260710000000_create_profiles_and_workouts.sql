create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_date date not null,
  attendance boolean not null,
  weight_kg numeric,
  waist_inches numeric,
  duration_minutes integer,
  muscles_trained text[] not null default '{}',
  cardio_minutes integer not null default 0,
  yoga_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workouts_one_per_user_per_day unique (user_id, workout_date),
  constraint workouts_weight_kg_non_negative check (weight_kg is null or weight_kg >= 0),
  constraint workouts_waist_inches_non_negative check (waist_inches is null or waist_inches >= 0),
  constraint workouts_duration_minutes_non_negative check (
    duration_minutes is null or duration_minutes >= 0
  ),
  constraint workouts_cardio_minutes_non_negative check (cardio_minutes >= 0),
  constraint workouts_yoga_minutes_non_negative check (yoga_minutes >= 0)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists workouts_set_updated_at on public.workouts;
create trigger workouts_set_updated_at
before update on public.workouts
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

alter table public.profiles enable row level security;
alter table public.workouts enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can read their own workouts" on public.workouts;
create policy "Users can read their own workouts"
on public.workouts
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own workouts" on public.workouts;
create policy "Users can insert their own workouts"
on public.workouts
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own workouts" on public.workouts;
create policy "Users can update their own workouts"
on public.workouts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own workouts" on public.workouts;
create policy "Users can delete their own workouts"
on public.workouts
for delete
to authenticated
using ((select auth.uid()) = user_id);
