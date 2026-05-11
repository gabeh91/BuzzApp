create unique index if not exists activity_group_members_group_user_unique
  on public.activity_group_members (activity_group_id, user_id);

create table if not exists public.group_invite_events (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.group_invites(id) on delete cascade,
  activity_group_id uuid not null references public.activity_groups(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  created_at timestamptz not null default now(),
  metadata_json jsonb not null default '{}'::jsonb,
  check (event_type in ('created', 'resolved', 'accepted', 'rejected_full'))
);

create index if not exists group_invite_events_invite_created_idx
  on public.group_invite_events (invite_id, created_at desc);

create index if not exists group_invite_events_group_type_idx
  on public.group_invite_events (activity_group_id, event_type, created_at desc);
