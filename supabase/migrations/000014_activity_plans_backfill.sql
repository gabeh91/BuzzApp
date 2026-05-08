create table if not exists public.activity_plans (
  id uuid primary key default gen_random_uuid(),
  activity_group_id uuid not null references public.activity_groups(id) on delete cascade,
  interest_id uuid references public.interests(id) on delete set null,
  city_id uuid references public.cities(id) on delete set null,
  activity_name text not null,
  title text not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  public_location_name text not null,
  location_visibility text not null default 'area_only',
  venue_type text not null default 'public',
  capacity_min integer not null default 3,
  capacity_max integer not null default 5,
  min_group_size integer not null default 3,
  status text not null default 'proposed',
  confirmation_status text not null default 'pending',
  safety_guidance text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (location_visibility in ('area_only', 'confirmed_group', 'exact')),
  check (venue_type in ('public', 'hosted', 'private')),
  check (capacity_min > 0),
  check (capacity_max >= capacity_min),
  check (min_group_size > 0),
  check (status in ('proposed', 'confirmed', 'active', 'completed', 'cancelled')),
  check (confirmation_status in ('pending', 'confirmed', 'needs_changes', 'cancelled'))
);

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'plan_safety_checks'
  ) and not exists (
    select 1
    from pg_constraint
    where conname = 'plan_safety_checks_activity_plan_id_fkey'
      and conrelid = 'public.plan_safety_checks'::regclass
  ) then
    alter table public.plan_safety_checks
      add constraint plan_safety_checks_activity_plan_id_fkey
      foreign key (activity_plan_id) references public.activity_plans(id) on delete cascade;
  end if;
end $$;

create index if not exists activity_plans_group_status_idx
  on public.activity_plans (activity_group_id, status, confirmation_status);

create index if not exists activity_plans_city_starts_idx
  on public.activity_plans (city_id, starts_at);

create index if not exists activity_plans_interest_status_idx
  on public.activity_plans (interest_id, status);
