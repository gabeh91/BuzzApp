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
  ('Coffee', 'coffee', 'food'),
  ('Cooking Classes', 'cooking-classes', 'food'),
  ('Gym / Fitness', 'gym-fitness', 'fitness'),
  ('Golf', 'golf', 'sport'),
  ('Knitting', 'knitting', 'creative'),
  ('Chess', 'chess', 'social'),
  ('Walking', 'walking', 'fitness'),
  ('Hackathons', 'hackathons', 'learning'),
  ('Book Clubs', 'book-clubs', 'social'),
  ('Wine Clubs', 'wine-clubs', 'food'),
  ('Pottery Classes', 'pottery-classes', 'creative'),
  ('Rock Climbing', 'rock-climbing', 'fitness'),
  ('Soccer', 'soccer', 'sport'),
  ('Archery', 'archery', 'sport'),
  ('Basketball', 'basketball', 'sport'),
  ('Netball', 'netball', 'sport'),
  ('Volleyball', 'volleyball', 'sport'),
  ('Ultimate Frisbee', 'ultimate-frisbee', 'sport'),
  ('Touch Rugby', 'touch-rugby', 'sport'),
  ('Pickleball', 'pickleball', 'sport'),
  ('Yoga', 'yoga', 'fitness'),
  ('Photography Walks', 'photography-walks', 'creative'),
  ('Trivia Nights', 'trivia-nights', 'social'),
  ('Gardening', 'gardening', 'lifestyle')
on conflict (slug) do nothing;

insert into public.business_categories (name)
values
  ('Fitness'),
  ('Food'),
  ('Social')
on conflict (name) do nothing;

insert into public.businesses (category_id, city_id, name, description)
select bc.id, c.id, seed.name, seed.description
from (
  values
    ('Fitness', 'Northside Tennis', 'Beginner-friendly tennis club for new locals.'),
    ('Food', 'Laneway Coffee', 'Neighbourhood cafe with newcomer meetups.'),
    ('Social', 'Ocean Club', 'Community events partner near the beach.')
) as seed(category_name, name, description)
join public.business_categories bc on bc.name = seed.category_name
join public.cities c on c.name = 'Melbourne'
where not exists (
  select 1 from public.businesses existing where existing.name = seed.name
);

insert into public.events (city_id, title, starts_at)
select c.id, seed.title, seed.starts_at::timestamptz
from (
  values
    ('Welcome Picnic', now() + interval '7 days'),
    ('Climbing Night', now() + interval '10 days'),
    ('Board Game Social', now() + interval '14 days')
) as seed(title, starts_at)
join public.cities c on c.name = 'Melbourne'
where not exists (
  select 1 from public.events existing where existing.title = seed.title
);
`
    },
    {
      path: "supabase/migrations/000001_initial_extensions.sql",
      contents: `create extension if not exists postgis;
create extension if not exists vector;
create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists pg_graphql;
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
    },
    {
      path: "supabase/migrations/000004_graphql_api.sql",
      contents: `comment on schema public is e'@graphql({"inflect_names": true})';

grant usage on schema public to anon, authenticated;
grant select on public.cities to anon, authenticated;
grant select on public.interests to anon, authenticated;
grant select on public.business_categories to anon, authenticated;
grant select on public.businesses to anon, authenticated;
grant select on public.events to anon, authenticated;
grant select on public.feature_flags to anon, authenticated;

create or replace function public."activateInterest"("interestId" uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_city_id uuid;
  target_interest public.interests%rowtype;
  activation_id uuid;
begin
  select *
  into target_interest
  from public.interests
  where id = "interestId";

  if target_interest.id is null then
    raise exception 'Interest not found';
  end if;

  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select id
  into target_city_id
  from public.cities
  order by created_at
  limit 1;

  insert into public.profiles (id, city_id, display_name)
  values (current_user_id, target_city_id, 'Buzz Member')
  on conflict (id) do update
  set updated_at = now();

  insert into public.interest_activations (user_id, interest_id, city_id)
  values (current_user_id, "interestId", target_city_id)
  returning id into activation_id;

  return jsonb_build_object(
    'ok', true,
    'activationId', activation_id,
    'interestId', "interestId",
    'matchedUsers', '[]'::jsonb,
    'message', 'Interest activation recorded'
  );
end;
$$;

revoke all on function public."activateInterest"(uuid) from public;
grant execute on function public."activateInterest"(uuid) to anon, authenticated;
`
    },
    {
      path: "supabase/migrations/000005_expand_starter_interests.sql",
      contents: `insert into public.interests (name, slug, category)
values
  ('Cooking Classes', 'cooking-classes', 'food'),
  ('Gym / Fitness', 'gym-fitness', 'fitness'),
  ('Golf', 'golf', 'sport'),
  ('Knitting', 'knitting', 'creative'),
  ('Chess', 'chess', 'social'),
  ('Walking', 'walking', 'fitness'),
  ('Hackathons', 'hackathons', 'learning'),
  ('Book Clubs', 'book-clubs', 'social'),
  ('Wine Clubs', 'wine-clubs', 'food'),
  ('Pottery Classes', 'pottery-classes', 'creative'),
  ('Rock Climbing', 'rock-climbing', 'fitness'),
  ('Soccer', 'soccer', 'sport'),
  ('Archery', 'archery', 'sport'),
  ('Basketball', 'basketball', 'sport'),
  ('Netball', 'netball', 'sport'),
  ('Volleyball', 'volleyball', 'sport'),
  ('Ultimate Frisbee', 'ultimate-frisbee', 'sport'),
  ('Touch Rugby', 'touch-rugby', 'sport'),
  ('Pickleball', 'pickleball', 'sport'),
  ('Yoga', 'yoga', 'fitness'),
  ('Photography Walks', 'photography-walks', 'creative'),
  ('Trivia Nights', 'trivia-nights', 'social'),
  ('Gardening', 'gardening', 'lifestyle')
on conflict (slug) do nothing;
`
    },
    {
      path: "supabase/migrations/000006_mvp_profile_quiz_matching.sql",
      contents: `alter table public.profiles
  add column if not exists settled boolean not null default false,
  add column if not exists visible boolean not null default true,
  add column if not exists quiz_answers jsonb not null default '{}'::jsonb,
  add column if not exists quiz_traits jsonb not null default '{}'::jsonb,
  add column if not exists last_active_at timestamptz not null default now();

alter table public.match_candidates
  add column if not exists status text not null default 'pending',
  add column if not exists responded_at timestamptz,
  add column if not exists source text not null default 'deterministic',
  add column if not exists activity_group_id uuid references public.activity_groups(id) on delete set null;

alter table public.activity_groups
  add column if not exists interest_id uuid references public.interests(id),
  add column if not exists status text not null default 'forming',
  add column if not exists created_by uuid references public.profiles(id);

alter table public.group_messages
  add column if not exists message_type text not null default 'text',
  add column if not exists moderation_status text not null default 'clean';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'match_candidates_status_check'
      and conrelid = 'public.match_candidates'::regclass
  ) then
    alter table public.match_candidates
      add constraint match_candidates_status_check
      check (status in ('pending', 'accepted', 'declined', 'expired'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'match_candidates_source_check'
      and conrelid = 'public.match_candidates'::regclass
  ) then
    alter table public.match_candidates
      add constraint match_candidates_source_check
      check (source in ('deterministic', 'manual', 'ai_assisted'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'activity_groups_status_check'
      and conrelid = 'public.activity_groups'::regclass
  ) then
    alter table public.activity_groups
      add constraint activity_groups_status_check
      check (status in ('forming', 'active', 'archived'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'group_messages_message_type_check'
      and conrelid = 'public.group_messages'::regclass
  ) then
    alter table public.group_messages
      add constraint group_messages_message_type_check
      check (message_type in ('text', 'system'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'group_messages_moderation_status_check'
      and conrelid = 'public.group_messages'::regclass
  ) then
    alter table public.group_messages
      add constraint group_messages_moderation_status_check
      check (moderation_status in ('clean', 'flagged', 'blocked'));
  end if;
end $$;

create index if not exists profiles_mvp_matching_idx
  on public.profiles (city_id, visible, settled, last_active_at desc);

create index if not exists profiles_quiz_traits_gin_idx
  on public.profiles using gin (quiz_traits);

create index if not exists interest_activations_user_interest_status_idx
  on public.interest_activations (user_id, interest_id, status, created_at desc);

create index if not exists match_candidates_status_idx
  on public.match_candidates (activation_id, status, score desc);

create index if not exists match_candidates_matched_user_status_idx
  on public.match_candidates (matched_user_id, status, created_at desc);

create index if not exists activity_groups_status_idx
  on public.activity_groups (city_id, interest_id, status, created_at desc);

create index if not exists activity_group_members_user_idx
  on public.activity_group_members (user_id, activity_group_id);

create index if not exists group_messages_activity_created_idx
  on public.group_messages (activity_group_id, created_at);
`
    }
  ];
}
