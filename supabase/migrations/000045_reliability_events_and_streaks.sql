alter table public.user_reliability
  add column if not exists check_in_streak integer not null default 0,
  add column if not exists attended_plan_streak integer not null default 0,
  add column if not exists reliable_plan_streak integer not null default 0,
  add column if not exists last_reliability_event_at timestamptz;

create table if not exists public.user_reliability_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_group_id uuid references public.activity_groups(id) on delete set null,
  activity_plan_id uuid references public.activity_plans(id) on delete set null,
  event_type text not null,
  idempotency_key text not null,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (
    event_type in (
      'attended_plan',
      'checked_in',
      'positive_feedback',
      'missed_plan',
      'safety_concern'
    )
  )
);

create unique index if not exists user_reliability_events_idempotency_unique
  on public.user_reliability_events (idempotency_key);

create index if not exists user_reliability_events_user_created_idx
  on public.user_reliability_events (user_id, created_at desc);

create index if not exists user_reliability_events_group_created_idx
  on public.user_reliability_events (activity_group_id, created_at desc);

alter table public.user_reliability_events enable row level security;

drop policy if exists "Users can read their reliability events"
on public.user_reliability_events;

create policy "Users can read their reliability events"
on public.user_reliability_events
for select
to authenticated
using (user_id = auth.uid());

revoke all privileges on public.user_reliability_events from anon, authenticated;
grant select on public.user_reliability_events to authenticated;
