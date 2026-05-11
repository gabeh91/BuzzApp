insert into public.feature_flags (
  key,
  enabled,
  description,
  environment,
  city_id,
  payload_json
)
select
  'city_starting_point_enabled',
  enabled,
  description,
  environment,
  city_id,
  payload_json
from public.feature_flags
where key = 'melbourne_starting_point_enabled'
on conflict (key) do update
set
  enabled = excluded.enabled,
  description = excluded.description,
  environment = excluded.environment,
  city_id = excluded.city_id,
  payload_json = excluded.payload_json,
  updated_at = now();

delete from public.feature_flags
where key = 'melbourne_starting_point_enabled';

insert into public.city_feature_flags (
  city_id,
  environment,
  feature_key,
  enabled,
  payload_json
)
select
  city_id,
  environment,
  'city_starting_point_enabled',
  enabled,
  payload_json
from public.city_feature_flags
where feature_key = 'melbourne_starting_point_enabled'
on conflict (city_id, environment, feature_key) do update
set
  enabled = excluded.enabled,
  payload_json = excluded.payload_json,
  updated_at = now();

delete from public.city_feature_flags
where feature_key = 'melbourne_starting_point_enabled';

update public.city_settings
set
  feature_flags_json =
    (feature_flags_json - 'melbourne_starting_point_enabled') ||
    jsonb_build_object(
      'city_starting_point_enabled',
      coalesce(
        feature_flags_json -> 'city_starting_point_enabled',
        feature_flags_json -> 'melbourne_starting_point_enabled',
        'true'::jsonb
      )
    ),
  updated_at = now()
where feature_flags_json ? 'melbourne_starting_point_enabled';
