create table if not exists public.cities (
  id uuid primary key,
  name text not null,
  country_code text not null,
  timezone text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug citext not null unique,
  category text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  city_id uuid references public.cities(id),
  display_name text,
  bio text
);

create table if not exists public.user_interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, interest_id)
);

create table if not exists public.interest_activations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  city_id uuid references public.cities(id),
  created_at timestamptz not null default now(),
  status text not null default 'active'
);

create table if not exists public.match_candidates (
  id uuid primary key default gen_random_uuid(),
  activation_id uuid not null references public.interest_activations(id) on delete cascade,
  matched_user_id uuid not null references public.profiles(id) on delete cascade,
  score numeric not null default 0,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_groups (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id),
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_group_members (
  id uuid primary key default gen_random_uuid(),
  activity_group_id uuid not null references public.activity_groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.group_messages (
  id uuid primary key default gen_random_uuid(),
  activity_group_id uuid not null references public.activity_groups(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.business_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.business_categories(id),
  city_id uuid references public.cities(id),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.business_impressions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.business_leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  source text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id),
  title text not null,
  starts_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.event_interests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid references public.profiles(id),
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_profile_summaries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  created_at timestamptz not null default now()
);
