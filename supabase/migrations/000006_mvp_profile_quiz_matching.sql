alter table public.profiles
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
