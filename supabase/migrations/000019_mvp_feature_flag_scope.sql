alter table public.feature_flags
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists environment text not null default 'local',
  add column if not exists city_id uuid references public.cities(id) on delete cascade,
  add column if not exists payload_json jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

alter table public.city_feature_flags
  add column if not exists environment text not null default 'local';

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'city_feature_flags_city_id_feature_key_key'
      and conrelid = 'public.city_feature_flags'::regclass
  ) then
    alter table public.city_feature_flags
      drop constraint city_feature_flags_city_id_feature_key_key;
  end if;
end $$;

create unique index if not exists city_feature_flags_city_env_feature_key_unique_idx
  on public.city_feature_flags (city_id, environment, feature_key);

create index if not exists feature_flags_environment_enabled_idx
  on public.feature_flags (environment, enabled, key);

with scope_flags (key, enabled) as (
  values
    ('bring_friend_enabled', true),
    ('basic_safety_enabled', true),
    ('city_starting_point_enabled', true),
    ('text_only_chat_enabled', true),
    ('group_first_matching_enabled', true),
    ('city_config_enabled', true),
    ('landing_plan_enabled', false),
    ('full_neighbourhood_recommender_enabled', false),
    ('ai_match_cards_enabled', false),
    ('local_knowledge_qa_enabled', false),
    ('city_starter_packs_enabled', false),
    ('starter_plans_enabled', false),
    ('business_recommendations_enabled', false),
    ('promoted_events_enabled', false),
    ('lead_attribution_enabled', false),
    ('verified_locals_enabled', false),
    ('paid_hosts_enabled', false),
    ('superhost_progression_enabled', false),
    ('subscriptions_enabled', false),
    ('multi_city_ui_enabled', false),
    ('travel_mode_enabled', false),
    ('one_to_one_meetups_enabled', false),
    ('media_chat_enabled', false)
)
insert into public.feature_flags (
  key,
  enabled,
  description,
  environment,
  payload_json
)
select
  scope_flags.key,
  scope_flags.enabled,
  'MVP scope control',
  'local',
  '{}'::jsonb
from scope_flags
on conflict (key) do update
set
  enabled = excluded.enabled,
  description = excluded.description,
  environment = excluded.environment,
  payload_json = excluded.payload_json,
  updated_at = now();
