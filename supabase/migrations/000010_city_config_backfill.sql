alter table public.cities
  add column if not exists currency text not null default 'AUD',
  add column if not exists default_latitude numeric,
  add column if not exists default_longitude numeric,
  add column if not exists launch_status text not null default 'planned',
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cities_launch_status_check'
      and conrelid = 'public.cities'::regclass
  ) then
    alter table public.cities
      add constraint cities_launch_status_check
      check (launch_status in ('planned', 'waitlist', 'private_beta', 'active', 'paused', 'retired'));
  end if;
end $$;

create table if not exists public.city_settings (
  city_id uuid primary key references public.cities(id) on delete cascade,
  matching_radius_km numeric not null default 10,
  default_group_size_min integer not null default 3,
  default_group_size_max integer not null default 5,
  activation_expiry_hours integer not null default 168,
  requires_invite boolean not null default false,
  is_waitlist_enabled boolean not null default false,
  copy_json jsonb not null default '{}'::jsonb,
  feature_flags_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (matching_radius_km > 0),
  check (default_group_size_min > 0),
  check (default_group_size_max >= default_group_size_min),
  check (activation_expiry_hours > 0)
);

create table if not exists public.city_feature_flags (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  environment text not null default 'local',
  feature_key text not null,
  enabled boolean not null default false,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city_id, environment, feature_key)
);

create table if not exists public.city_interests (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (city_id, interest_id)
);

create index if not exists city_feature_flags_city_enabled_idx
  on public.city_feature_flags (city_id, environment, enabled, feature_key);

create index if not exists city_interests_city_sort_idx
  on public.city_interests (city_id, is_default desc, sort_order, interest_id);
