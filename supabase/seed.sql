insert into public.cities (
  id,
  name,
  country_code,
  timezone,
  currency,
  default_latitude,
  default_longitude,
  launch_status
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'Melbourne',
    'AU',
    'Australia/Melbourne',
    'AUD',
    -37.8136,
    144.9631,
    'active'
  )
on conflict (id) do update
set
  name = excluded.name,
  country_code = excluded.country_code,
  timezone = excluded.timezone,
  currency = excluded.currency,
  default_latitude = excluded.default_latitude,
  default_longitude = excluded.default_longitude,
  launch_status = excluded.launch_status,
  updated_at = now();

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

insert into public.city_settings (
  city_id,
  matching_radius_km,
  default_group_size_min,
  default_group_size_max,
  activation_expiry_hours,
  requires_invite,
  is_waitlist_enabled,
  copy_json,
  feature_flags_json
)
select
  cities.id,
  10,
  3,
  5,
  168,
  false,
  false,
  jsonb_build_object(
    'welcome', 'Find your people in Melbourne',
    'starterPackTitle', 'Your first 30 days in Melbourne'
  ),
  jsonb_build_object(
    'bring_friend_enabled', true,
    'basic_safety_enabled', true,
    'melbourne_starting_point_enabled', true,
    'text_only_chat_enabled', true,
    'group_first_matching_enabled', true,
    'city_config_enabled', true,
    'landing_plan_enabled', false,
    'full_neighbourhood_recommender_enabled', false,
    'starter_plans_enabled', false
  )
from public.cities
where cities.name = 'Melbourne'
on conflict (city_id) do update
set
  matching_radius_km = excluded.matching_radius_km,
  default_group_size_min = excluded.default_group_size_min,
  default_group_size_max = excluded.default_group_size_max,
  activation_expiry_hours = excluded.activation_expiry_hours,
  requires_invite = excluded.requires_invite,
  is_waitlist_enabled = excluded.is_waitlist_enabled,
  copy_json = excluded.copy_json,
  feature_flags_json = excluded.feature_flags_json,
  updated_at = now();

with melbourne as (
  select id
  from public.cities
  where name = 'Melbourne'
  limit 1
),
flags (feature_key, enabled, payload_json) as (
  values
    ('bring_friend_enabled', true, '{}'::jsonb),
    ('basic_safety_enabled', true, '{}'::jsonb),
    ('melbourne_starting_point_enabled', true, '{}'::jsonb),
    ('text_only_chat_enabled', true, '{}'::jsonb),
    ('group_first_matching_enabled', true, '{}'::jsonb),
    ('city_config_enabled', true, '{}'::jsonb),
    ('landing_plan_enabled', false, '{}'::jsonb),
    ('full_neighbourhood_recommender_enabled', false, '{}'::jsonb),
    ('ai_match_cards_enabled', false, '{}'::jsonb),
    ('local_knowledge_qa_enabled', false, '{}'::jsonb),
    ('city_starter_packs_enabled', false, '{}'::jsonb),
    ('starter_plans_enabled', false, '{}'::jsonb),
    ('business_recommendations_enabled', false, '{}'::jsonb),
    ('promoted_events_enabled', false, '{}'::jsonb),
    ('lead_attribution_enabled', false, '{}'::jsonb),
    ('verified_locals_enabled', false, '{}'::jsonb),
    ('paid_hosts_enabled', false, '{}'::jsonb),
    ('superhost_progression_enabled', false, '{}'::jsonb),
    ('subscriptions_enabled', false, '{}'::jsonb),
    ('multi_city_ui_enabled', false, '{}'::jsonb),
    ('travel_mode_enabled', false, '{}'::jsonb),
    ('one_to_one_meetups_enabled', false, '{}'::jsonb),
    ('media_chat_enabled', false, '{}'::jsonb)
)
insert into public.city_feature_flags (
  city_id,
  environment,
  feature_key,
  enabled,
  payload_json
)
select
  melbourne.id,
  'local',
  flags.feature_key,
  flags.enabled,
  flags.payload_json
from melbourne
cross join flags
on conflict (city_id, environment, feature_key) do update
set
  enabled = excluded.enabled,
  payload_json = excluded.payload_json,
  updated_at = now();

with melbourne as (
  select id
  from public.cities
  where name = 'Melbourne'
  limit 1
),
ranked_interests as (
  select
    interests.id,
    row_number() over (order by interests.category, interests.name) as sort_order
  from public.interests
)
insert into public.city_interests (
  city_id,
  interest_id,
  is_default,
  sort_order
)
select
  melbourne.id,
  ranked_interests.id,
  true,
  ranked_interests.sort_order
from melbourne
cross join ranked_interests
on conflict (city_id, interest_id) do update
set
  is_default = excluded.is_default,
  sort_order = excluded.sort_order;

with melbourne as (
  select id
  from public.cities
  where name = 'Melbourne'
  limit 1
),
seed_suburbs (name, slug, default_latitude, default_longitude, summary) as (
  values
    ('Fitzroy', 'fitzroy', -37.7984, 144.9783, 'Creative inner-north area with cafes, live music, and easy group plans.'),
    ('Brunswick', 'brunswick', -37.7667, 144.9628, 'Relaxed northside neighbourhood with music, food, and social clubs.'),
    ('South Yarra', 'south-yarra', -37.8381, 144.9916, 'Polished inner-south area close to parks, fitness studios, and food spots.'),
    ('St Kilda', 'st-kilda', -37.8679, 144.9809, 'Beachside suburb with weekend activities, walking routes, and casual nightlife.'),
    ('Collingwood', 'collingwood', -37.8021, 144.9888, 'Compact area for climbing, coffee, creative events, and after-work plans.'),
    ('Carlton', 'carlton', -37.8001, 144.9671, 'Student-friendly area with parks, food, language exchange, and low-pressure plans.'),
    ('Richmond', 'richmond', -37.8230, 144.9980, 'Active inner-east area with sport, fitness, food, and public transport access.'),
    ('North Melbourne', 'north-melbourne', -37.7982, 144.9462, 'Connected neighbourhood with markets, cafes, sport, and quieter social options.'),
    ('Prahran', 'prahran', -37.8511, 144.9936, 'Social inner-south suburb with fitness, food, and structured evening plans.'),
    ('Footscray', 'footscray', -37.8000, 144.9000, 'Food-rich westside area with creative energy and budget-friendly exploring.'),
    ('Northcote', 'northcote', -37.7739, 144.9994, 'Community-minded suburb with music, parks, cafes, and weekend rhythms.'),
    ('Docklands', 'docklands', -37.8152, 144.9468, 'Waterfront city-edge area suited to walks, easy dinners, and after-work meetups.'),
    ('Southbank', 'southbank', -37.8236, 144.9645, 'Central riverside area with arts, food, walking routes, and easy first plans.'),
    ('Elwood', 'elwood', -37.8822, 144.9822, 'Lower-pressure bayside area with walking, coffee, beach, and weekend routines.'),
    ('Melbourne CBD', 'melbourne-cbd', -37.8136, 144.9631, 'Central launchpad for newcomers who want transport, events, and variety.')
)
insert into public.suburbs (
  city_id,
  name,
  slug,
  default_latitude,
  default_longitude,
  summary
)
select
  melbourne.id,
  seed_suburbs.name,
  seed_suburbs.slug,
  seed_suburbs.default_latitude,
  seed_suburbs.default_longitude,
  seed_suburbs.summary
from melbourne
cross join seed_suburbs
on conflict (city_id, slug) do update
set
  name = excluded.name,
  default_latitude = excluded.default_latitude,
  default_longitude = excluded.default_longitude,
  summary = excluded.summary,
  updated_at = now();

with melbourne as (
  select id
  from public.cities
  where name = 'Melbourne'
  limit 1
),
seed_tags (suburb_slug, tag_key, weight, reason) as (
  values
    ('fitzroy', 'small_group', 0.9, 'Good for low-pressure small-group plans.'),
    ('fitzroy', 'weekend', 0.8, 'Works well for weekend exploring.'),
    ('fitzroy', 'learn', 0.7, 'Has beginner-friendly creative and social options.'),
    ('fitzroy', 'creative', 0.6, 'Strong creative scene.'),
    ('brunswick', 'small_group', 0.85, 'Easy to join small groups around music, food, and clubs.'),
    ('brunswick', 'weekend', 0.72, 'Good weekend rhythm for newcomers.'),
    ('brunswick', 'learn', 0.64, 'Useful for trying new skills and communities.'),
    ('brunswick', 'social', 0.5, 'Strong casual social energy.'),
    ('south-yarra', 'planned', 0.75, 'Suits organised plans and bookings.'),
    ('south-yarra', 'practice', 0.7, 'Good fit for fitness and sport routines.'),
    ('south-yarra', 'weekday', 0.56, 'Works for weekday evenings.'),
    ('st-kilda', 'spontaneous', 0.8, 'Good for flexible beachside plans.'),
    ('st-kilda', 'weekend', 0.6, 'Best for weekend activities.'),
    ('st-kilda', 'high_energy', 0.5, 'Has lively social options.'),
    ('collingwood', 'learn', 0.78, 'Good for beginner classes and activity venues.'),
    ('collingwood', 'small_group', 0.76, 'Compact area for small plan formats.'),
    ('collingwood', 'weekday', 0.62, 'Works well after work.'),
    ('carlton', 'learn', 0.82, 'Strong fit for learning and student-friendly plans.'),
    ('carlton', 'low_energy', 0.55, 'Good for calmer first meetups.'),
    ('carlton', 'small_group', 0.58, 'Easy low-pressure group formats.'),
    ('richmond', 'practice', 0.78, 'Strong fit for sport and fitness routines.'),
    ('richmond', 'high_energy', 0.66, 'Good for active users.'),
    ('richmond', 'planned', 0.52, 'Works with organised bookings.'),
    ('north-melbourne', 'low_energy', 0.68, 'Good for calmer social starts.'),
    ('north-melbourne', 'weekday', 0.6, 'Works for practical weekday plans.'),
    ('north-melbourne', 'small_group', 0.57, 'Good for small local groups.'),
    ('prahran', 'planned', 0.7, 'Good for structured evenings.'),
    ('prahran', 'social', 0.68, 'Strong social activity mix.'),
    ('prahran', 'weekday', 0.58, 'Useful after work.'),
    ('footscray', 'social', 0.74, 'Great for food-led newcomer plans.'),
    ('footscray', 'creative', 0.62, 'Strong creative and community energy.'),
    ('footscray', 'weekend', 0.56, 'Good weekend exploring.'),
    ('northcote', 'weekend', 0.74, 'Good for weekend routines.'),
    ('northcote', 'small_group', 0.69, 'Community-minded small groups fit.'),
    ('northcote', 'creative', 0.62, 'Strong music and arts fit.'),
    ('docklands', 'weekday', 0.72, 'Easy after-work meeting point.'),
    ('docklands', 'one_on_one', 0.58, 'Works for simple low-friction meetups.'),
    ('docklands', 'low_energy', 0.5, 'Good for walks and dinners.'),
    ('southbank', 'learn', 0.65, 'Good access to arts and cultural options.'),
    ('southbank', 'one_on_one', 0.55, 'Works for easy first plans.'),
    ('southbank', 'weekday', 0.54, 'Central after-work access.'),
    ('elwood', 'low_energy', 0.76, 'Good for slower social pace.'),
    ('elwood', 'weekend', 0.68, 'Strong weekend walking and coffee fit.'),
    ('elwood', 'small_group', 0.54, 'Easy bayside small groups.'),
    ('melbourne-cbd', 'weekday', 0.8, 'Most convenient central weekday option.'),
    ('melbourne-cbd', 'social', 0.72, 'Large variety of social plans.'),
    ('melbourne-cbd', 'learn', 0.58, 'Easy access to classes and events.'),
    ('fitzroy', 'music', 0.92, 'Strong live music and culture fit.'),
    ('fitzroy', 'food', 0.82, 'Good for food-led exploring.'),
    ('fitzroy', 'walkability', 0.82, 'Easy to explore on foot.'),
    ('fitzroy', 'nightlife', 0.78, 'Lively evening options.'),
    ('fitzroy', 'public_transport', 0.72, 'Practical public transport access.'),
    ('brunswick', 'music', 0.88, 'Strong music and casual culture.'),
    ('brunswick', 'food', 0.78, 'Good food-led newcomer plans.'),
    ('brunswick', 'creative', 0.82, 'Creative and community-led energy.'),
    ('brunswick', 'budget', 0.68, 'Better fit for budget-conscious exploring.'),
    ('brunswick', 'walkability', 0.76, 'Works well for local wandering.'),
    ('brunswick', 'public_transport', 0.74, 'Good tram and train access.'),
    ('south-yarra', 'fitness', 0.9, 'Strong fitness and active routine fit.'),
    ('south-yarra', 'coffee', 0.78, 'Good cafe density for easy first plans.'),
    ('south-yarra', 'parks', 0.82, 'Close to major parks and walking routes.'),
    ('south-yarra', 'public_transport', 0.86, 'Strong train and tram access.'),
    ('south-yarra', 'nightlife', 0.64, 'Useful evening options.'),
    ('south-yarra', 'walkability', 0.74, 'Easy local exploring.'),
    ('st-kilda', 'beach', 0.95, 'Best fit for beach and bayside exploring.'),
    ('st-kilda', 'nightlife', 0.82, 'Lively weekend and evening scene.'),
    ('st-kilda', 'outdoors', 0.86, 'Good for outdoor plans.'),
    ('st-kilda', 'music', 0.68, 'Live music and casual culture nearby.'),
    ('st-kilda', 'public_transport', 0.66, 'Useful tram access.'),
    ('st-kilda', 'parks', 0.62, 'Good access to outdoor space.'),
    ('collingwood', 'creative', 0.86, 'Strong creative and activity venue mix.'),
    ('collingwood', 'coffee', 0.78, 'Good for coffee-led first plans.'),
    ('collingwood', 'fitness', 0.72, 'Good for climbing and active venues.'),
    ('collingwood', 'public_transport', 0.76, 'Easy inner-city transport access.'),
    ('collingwood', 'walkability', 0.8, 'Compact and easy to explore.'),
    ('carlton', 'budget', 0.74, 'Student-friendly and budget-aware options.'),
    ('carlton', 'food', 0.82, 'Strong food-led local anchor.'),
    ('carlton', 'parks', 0.72, 'Good park access for low-pressure plans.'),
    ('carlton', 'public_transport', 0.8, 'Central tram access.'),
    ('carlton', 'walkability', 0.82, 'Easy local walking.'),
    ('richmond', 'fitness', 0.88, 'Strong sport and fitness routine fit.'),
    ('richmond', 'food', 0.78, 'Good food and casual meeting options.'),
    ('richmond', 'public_transport', 0.82, 'Strong train and tram access.'),
    ('richmond', 'parks', 0.66, 'Useful green space access.'),
    ('north-melbourne', 'quiet', 0.78, 'Calmer city-edge social pace.'),
    ('north-melbourne', 'budget', 0.66, 'Useful for budget-conscious exploring.'),
    ('north-melbourne', 'public_transport', 0.76, 'Connected without being too busy.'),
    ('north-melbourne', 'walkability', 0.72, 'Works for practical local plans.'),
    ('prahran', 'nightlife', 0.82, 'Strong evening social options.'),
    ('prahran', 'fitness', 0.74, 'Good fitness and active routine mix.'),
    ('prahran', 'food', 0.76, 'Good food-led plan options.'),
    ('prahran', 'public_transport', 0.78, 'Strong tram and train access.'),
    ('footscray', 'budget', 0.9, 'Strong fit for budget-conscious exploring.'),
    ('footscray', 'food', 0.92, 'Excellent food-led local discovery.'),
    ('footscray', 'music', 0.58, 'Growing music and culture options.'),
    ('footscray', 'public_transport', 0.8, 'Strong train access.'),
    ('northcote', 'music', 0.84, 'Strong live music and culture fit.'),
    ('northcote', 'parks', 0.72, 'Good green space access.'),
    ('northcote', 'walkability', 0.76, 'Good local walking rhythm.'),
    ('northcote', 'quiet', 0.56, 'Lower-pressure than busier inner areas.'),
    ('docklands', 'central_access', 0.86, 'Convenient city-edge access.'),
    ('docklands', 'public_transport', 0.8, 'Useful tram and central access.'),
    ('docklands', 'walkability', 0.68, 'Waterfront walking routes.'),
    ('docklands', 'quiet', 0.58, 'Lower-pressure city-edge plans.'),
    ('southbank', 'central_access', 0.88, 'Very central for simple first plans.'),
    ('southbank', 'public_transport', 0.84, 'Easy city transport access.'),
    ('southbank', 'parks', 0.62, 'Riverside walking and green space nearby.'),
    ('southbank', 'creative', 0.72, 'Good access to arts and culture.'),
    ('southbank', 'walkability', 0.82, 'Strong walkable city fit.'),
    ('elwood', 'beach', 0.9, 'Strong bayside and beach fit.'),
    ('elwood', 'quiet', 0.82, 'Lower-pressure coastal pace.'),
    ('elwood', 'outdoors', 0.78, 'Good for walking and outdoor routines.'),
    ('elwood', 'parks', 0.7, 'Good green and bay access.'),
    ('elwood', 'coffee', 0.64, 'Good coffee-led local anchors.'),
    ('melbourne-cbd', 'central_access', 0.95, 'Best central launchpad.'),
    ('melbourne-cbd', 'public_transport', 0.94, 'Strongest transport access.'),
    ('melbourne-cbd', 'nightlife', 0.84, 'High variety of evening options.'),
    ('melbourne-cbd', 'food', 0.86, 'Strong food and casual plan density.'),
    ('melbourne-cbd', 'music', 0.72, 'Good access to live culture.'),
    ('melbourne-cbd', 'coffee', 0.8, 'Easy coffee and first-meet options.')
)
insert into public.suburb_tags (
  suburb_id,
  tag_key,
  weight,
  reason
)
select
  suburbs.id,
  seed_tags.tag_key,
  seed_tags.weight,
  seed_tags.reason
from melbourne
join public.suburbs
  on suburbs.city_id = melbourne.id
join seed_tags
  on seed_tags.suburb_slug = suburbs.slug
on conflict (suburb_id, tag_key) do update
set
  weight = excluded.weight,
  reason = excluded.reason;

with demo_profiles (id, display_name, quiz_traits, last_active_offset) as (
  values
    (
      '00000000-0000-0000-0000-000000000201'::uuid,
      'Sam Rivera',
      '{"energy":"high","planning":"planned","socialStyle":"small_group","availability":"weekend","activityIntent":"learn","cityTags":["beach","public_transport"],"lifestyleTags":["outdoors","learning","fitness"],"quizCompleted":true}'::jsonb,
      interval '35 minutes'
    ),
    (
      '00000000-0000-0000-0000-000000000202'::uuid,
      'Mia Chen',
      '{"energy":"medium","planning":"planned","socialStyle":"small_group","availability":"weekday","activityIntent":"social","cityTags":["walkability","public_transport"],"lifestyleTags":["coffee","food","social"],"quizCompleted":true}'::jsonb,
      interval '2 hours'
    ),
    (
      '00000000-0000-0000-0000-000000000203'::uuid,
      'Noah Patel',
      '{"energy":"low","planning":"spontaneous","socialStyle":"one_on_one","availability":"weekend","activityIntent":"social","cityTags":["quiet","budget"],"lifestyleTags":["coffee","outdoors"],"quizCompleted":true}'::jsonb,
      interval '3 hours'
    )
),
melbourne as (
  select id
  from public.cities
  where name = 'Melbourne'
  limit 1
)
insert into public.profiles (
  id,
  city_id,
  display_name,
  visible,
  settled,
  quiz_answers,
  quiz_traits,
  last_active_at
)
select
  demo_profiles.id,
  melbourne.id,
  demo_profiles.display_name,
  true,
  false,
  '{}'::jsonb,
  demo_profiles.quiz_traits,
  now() - demo_profiles.last_active_offset
from demo_profiles
cross join melbourne
on conflict (id) do update
set
  city_id = excluded.city_id,
  display_name = excluded.display_name,
  visible = true,
  settled = false,
  quiz_traits = excluded.quiz_traits,
  last_active_at = excluded.last_active_at,
  updated_at = now();

with demo_interest_activations (profile_id, interest_slug) as (
  values
    ('00000000-0000-0000-0000-000000000201'::uuid, 'surfing'),
    ('00000000-0000-0000-0000-000000000201'::uuid, 'climbing'),
    ('00000000-0000-0000-0000-000000000202'::uuid, 'surfing'),
    ('00000000-0000-0000-0000-000000000202'::uuid, 'coffee'),
    ('00000000-0000-0000-0000-000000000203'::uuid, 'board-games'),
    ('00000000-0000-0000-0000-000000000203'::uuid, 'walking')
),
melbourne as (
  select id
  from public.cities
  where name = 'Melbourne'
  limit 1
)
insert into public.interest_activations (
  user_id,
  interest_id,
  city_id,
  status
)
select
  demo_interest_activations.profile_id,
  interests.id,
  melbourne.id,
  'active'
from demo_interest_activations
join public.interests
  on interests.slug = demo_interest_activations.interest_slug
cross join melbourne
on conflict (user_id, interest_id) where status = 'active'
do update
set
  city_id = excluded.city_id,
  status = 'active';

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
