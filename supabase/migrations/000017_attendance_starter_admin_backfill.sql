alter table public.activity_group_members
  add column if not exists rsvp_status text not null default 'pending',
  add column if not exists attendance_status text not null default 'unknown',
  add column if not exists attendance_confirmed_at timestamptz,
  add column if not exists feedback_completed_at timestamptz;

alter table public.user_reliability
  add column if not exists feedback_count integer not null default 0,
  add column if not exists positive_feedback_count integer not null default 0,
  add column if not exists last_feedback_at timestamptz;

create table if not exists public.starter_plans (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id) on delete cascade,
  interest_id uuid references public.interests(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'placeholder',
  min_group_size integer not null default 3,
  max_group_size integer not null default 5,
  safety_guidance text not null default 'Use a public venue and keep exact location hidden until confirmation.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('placeholder', 'draft', 'active', 'retired')),
  check (min_group_size > 0),
  check (max_group_size >= min_group_size)
);

create table if not exists public.starter_plan_steps (
  id uuid primary key default gen_random_uuid(),
  starter_plan_id uuid not null references public.starter_plans(id) on delete cascade,
  step_order integer not null,
  title text not null,
  body text,
  created_at timestamptz not null default now(),
  unique (starter_plan_id, step_order),
  check (step_order > 0)
);

create index if not exists activity_group_members_attendance_idx
  on public.activity_group_members (activity_group_id, rsvp_status, attendance_status);

create index if not exists starter_plans_city_status_idx
  on public.starter_plans (city_id, status, created_at desc);

create or replace view public.admin_city_config as
select
  cities.id as city_id,
  cities.name as city_name,
  cities.launch_status,
  city_settings.matching_radius_km,
  city_settings.default_group_size_min,
  city_settings.default_group_size_max,
  city_settings.activation_expiry_hours
from public.cities
left join public.city_settings
  on city_settings.city_id = cities.id;

create or replace view public.admin_safety_reports as
select
  reports.id,
  reports.reporter_id,
  reports.target_user_id,
  reports.activity_group_id,
  reports.category,
  reports.status,
  reports.reason,
  reports.created_at
from public.reports;

create or replace view public.admin_attendance_reliability as
select
  profiles.id as user_id,
  profiles.display_name,
  user_reliability.attended_count,
  user_reliability.no_show_count,
  user_reliability.cancelled_late_count,
  user_reliability.feedback_count,
  user_reliability.reliability_score,
  user_reliability.updated_at
from public.profiles
left join public.user_reliability
  on user_reliability.user_id = profiles.id;

create or replace view public.admin_starter_plans as
select
  starter_plans.id,
  starter_plans.city_id,
  cities.name as city_name,
  starter_plans.interest_id,
  interests.name as interest_name,
  starter_plans.title,
  starter_plans.status,
  starter_plans.created_at
from public.starter_plans
left join public.cities
  on cities.id = starter_plans.city_id
left join public.interests
  on interests.id = starter_plans.interest_id;
