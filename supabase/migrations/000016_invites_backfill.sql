create table if not exists public.group_invites (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  token_preview text not null,
  activity_group_id uuid not null references public.activity_groups(id) on delete cascade,
  activity_plan_id uuid references public.activity_plans(id) on delete set null,
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  accepted_by uuid references public.profiles(id) on delete set null,
  status text not null default 'active',
  max_uses integer not null default 1,
  use_count integer not null default 0,
  expires_at timestamptz not null default now() + interval '72 hours',
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  metadata_json jsonb not null default '{}'::jsonb,
  check (status in ('active', 'accepted', 'expired', 'revoked')),
  check (max_uses > 0),
  check (use_count >= 0),
  check (use_count <= max_uses)
);

create index if not exists group_invites_group_status_idx
  on public.group_invites (activity_group_id, status, expires_at desc);

create index if not exists group_invites_inviter_created_idx
  on public.group_invites (inviter_id, created_at desc);
