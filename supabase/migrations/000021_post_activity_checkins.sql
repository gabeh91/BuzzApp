create table if not exists public.activity_group_checkins (
  id uuid primary key default gen_random_uuid(),
  activity_group_id uuid not null references public.activity_groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  did_happen boolean not null default true,
  felt_safe boolean not null,
  would_meet_again boolean not null,
  report_requested boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata_json jsonb not null default '{}'::jsonb
);

create unique index if not exists activity_group_checkins_group_user_unique
  on public.activity_group_checkins (activity_group_id, user_id);

create index if not exists activity_group_checkins_group_created_idx
  on public.activity_group_checkins (activity_group_id, created_at desc);
