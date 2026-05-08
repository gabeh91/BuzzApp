create table if not exists public.user_safety_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  share_exact_location boolean not null default false,
  require_public_meeting boolean not null default true,
  allow_friend_invites boolean not null default true,
  prefer_daytime_plans boolean not null default true,
  show_verified_only boolean not null default false,
  emergency_contact_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  verification_type text not null,
  status text not null default 'pending',
  evidence_json jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, verification_type),
  check (verification_type in ('email', 'phone', 'identity', 'social')),
  check (status in ('pending', 'verified', 'rejected', 'expired'))
);

alter table public.reports
  add column if not exists activity_group_id uuid references public.activity_groups(id) on delete set null,
  add column if not exists category text not null default 'other',
  add column if not exists details text,
  add column if not exists status text not null default 'open',
  add column if not exists reviewed_at timestamptz,
  add column if not exists resolved_at timestamptz,
  add column if not exists source text not null default 'user_report',
  add column if not exists metadata_json jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reports_category_check'
      and conrelid = 'public.reports'::regclass
  ) then
    alter table public.reports
      add constraint reports_category_check
      check (category in ('unsafe', 'harassment', 'spam', 'no_show', 'other'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'reports_status_check'
      and conrelid = 'public.reports'::regclass
  ) then
    alter table public.reports
      add constraint reports_status_check
      check (status in ('open', 'reviewing', 'resolved', 'dismissed'));
  end if;
end $$;

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete cascade,
  action_type text not null,
  reason text,
  metadata_json jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  check (action_type in ('warn', 'limit', 'suspend', 'ban', 'dismiss'))
);

create table if not exists public.plan_safety_checks (
  id uuid primary key default gen_random_uuid(),
  activity_group_id uuid references public.activity_groups(id) on delete cascade,
  activity_plan_id uuid,
  safety_status text not null default 'pending',
  location_visibility text not null default 'area_only',
  requires_public_venue boolean not null default true,
  checklist_json jsonb not null default '{}'::jsonb,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (safety_status in ('pending', 'passed', 'needs_review', 'blocked')),
  check (location_visibility in ('area_only', 'confirmed_group', 'exact'))
);

create table if not exists public.user_reliability (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  attended_count integer not null default 0,
  no_show_count integer not null default 0,
  cancelled_late_count integer not null default 0,
  reliability_score numeric not null default 1,
  last_attended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (attended_count >= 0),
  check (no_show_count >= 0),
  check (cancelled_late_count >= 0),
  check (reliability_score >= 0 and reliability_score <= 1)
);

create table if not exists public.activity_risk_levels (
  id uuid primary key default gen_random_uuid(),
  activity_key citext not null unique,
  risk_level text not null default 'low',
  requires_public_venue boolean not null default true,
  requires_daytime boolean not null default false,
  guidance text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (risk_level in ('low', 'medium', 'high'))
);

create index if not exists reports_status_created_idx
  on public.reports (status, created_at desc);

create index if not exists user_verifications_user_status_idx
  on public.user_verifications (user_id, status, verification_type);

create index if not exists moderation_actions_target_created_idx
  on public.moderation_actions (target_user_id, created_at desc);

create index if not exists plan_safety_checks_group_idx
  on public.plan_safety_checks (activity_group_id, safety_status);

create index if not exists user_reliability_score_idx
  on public.user_reliability (reliability_score desc);

create index if not exists activity_risk_levels_risk_idx
  on public.activity_risk_levels (risk_level, activity_key);
