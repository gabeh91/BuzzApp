import type { GeneratedFile } from "./types.js";

export function generateSupabaseFiles(): GeneratedFile[] {
  return [
    {
      path: "supabase/config.toml",
      contents: `project_id = "buzz"

[api]
enabled = true
port = 54321

[db]
port = 54322
major_version = 15

[studio]
enabled = true
port = 54323

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["exp://127.0.0.1:8081"]
`
    },
    {
      path: "supabase/seed.sql",
      contents: `insert into public.cities (id, name, country_code, timezone)
values
  ('00000000-0000-0000-0000-000000000001', 'Melbourne', 'AU', 'Australia/Melbourne')
on conflict do nothing;

insert into public.interests (name, slug, category)
values
  ('Surfing', 'surfing', 'sport'),
  ('Tennis', 'tennis', 'sport'),
  ('Singing', 'singing', 'music'),
  ('Running', 'running', 'fitness'),
  ('Climbing', 'climbing', 'fitness'),
  ('Language Exchange', 'language-exchange', 'learning'),
  ('Board Games', 'board-games', 'social'),
  ('Coffee', 'coffee', 'food')
on conflict (slug) do nothing;
`
    },
    {
      path: "supabase/migrations/000001_initial_extensions.sql",
      contents: `create extension if not exists postgis;
create extension if not exists vector;
create extension if not exists pgcrypto;
create extension if not exists citext;
`
    },
    {
      path: "supabase/migrations/000002_initial_schema.sql",
      contents: `create table if not exists public.cities (
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
`
    },
    {
      path: "supabase/migrations/000003_initial_rls.sql",
      contents: `alter table public.profiles enable row level security;
alter table public.interests enable row level security;
alter table public.user_interests enable row level security;
alter table public.interest_activations enable row level security;

create policy "Public interests are readable"
on public.interests
for select
using (true);
`
    }
  ];
}
