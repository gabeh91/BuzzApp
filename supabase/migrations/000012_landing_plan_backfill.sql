create table if not exists public.landing_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete cascade,
  status text not null default 'active',
  generated_at timestamptz not null default now(),
  starts_at timestamptz,
  ends_at timestamptz,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('active', 'completed', 'paused', 'archived')),
  check (version > 0)
);

create table if not exists public.landing_plan_items (
  id uuid primary key default gen_random_uuid(),
  landing_plan_id uuid not null references public.landing_plans(id) on delete cascade,
  item_type text not null,
  title text not null,
  description text,
  target_id uuid,
  week_number integer not null,
  sort_order integer not null,
  status text not null default 'pending',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (item_type in (
    'complete_profile',
    'explore_suburb',
    'activate_interest',
    'join_plan',
    'attend_activity',
    'bring_friend',
    'meet_again',
    'save_place',
    'join_group'
  )),
  check (status in ('pending', 'active', 'completed', 'skipped', 'expired')),
  check (week_number between 1 and 4),
  check (sort_order > 0)
);

create table if not exists public.plan_recipes (
  id uuid primary key default gen_random_uuid(),
  key citext not null unique,
  title text not null,
  description text,
  risk_level text not null default 'low',
  default_group_size_min integer not null default 3,
  default_group_size_max integer not null default 5,
  default_duration_minutes integer not null default 90,
  venue_type text not null default 'public',
  safety_defaults_json jsonb not null default '{}'::jsonb,
  city_applicability_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (risk_level in ('low', 'medium', 'high')),
  check (default_group_size_min > 0),
  check (default_group_size_max >= default_group_size_min),
  check (default_duration_minutes > 0)
);

create table if not exists public.user_social_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  social_comfort_mode text not null default 'low_pressure',
  allow_nightlife boolean not null default false,
  prefer_hosted_plans boolean not null default false,
  prefer_no_chat_needed boolean not null default true,
  prefer_daytime boolean not null default true,
  prefer_small_groups boolean not null default true,
  budget_preference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (social_comfort_mode in ('low_pressure', 'balanced', 'open')),
  check (budget_preference is null or budget_preference in ('free', 'low', 'flexible'))
);

create table if not exists public.repeat_connection_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  other_user_id uuid not null references public.profiles(id) on delete cascade,
  source_plan_id uuid references public.landing_plans(id) on delete set null,
  would_meet_again boolean,
  matched_mutual_interest boolean not null default false,
  created_at timestamptz not null default now(),
  check (user_id <> other_user_id),
  unique (user_id, other_user_id, source_plan_id)
);

create index if not exists landing_plans_user_status_idx
  on public.landing_plans (user_id, status, generated_at desc);

create index if not exists landing_plan_items_plan_sort_idx
  on public.landing_plan_items (landing_plan_id, week_number, sort_order);

create index if not exists landing_plan_items_status_idx
  on public.landing_plan_items (status, item_type);

create index if not exists repeat_connection_preferences_user_idx
  on public.repeat_connection_preferences (user_id, created_at desc);
