-- Local/demo fixtures only. Do not run this seed against production.

with demo_profiles (
  id,
  display_name,
  first_name,
  date_of_birth,
  profile_photo_url,
  city_arrived_at,
  quiz_traits,
  last_active_offset
) as (
  values
    (
      '00000000-0000-0000-0000-000000000201'::uuid,
      'Sam Rivera',
      'Sam',
      date '1992-04-16',
      null::text,
      (current_date - interval '8 months')::date,
      '{"energy":"high","planning":"planned","socialStyle":"small_group","availability":"weekend","activityIntent":"learn","cityTags":["beach","public_transport"],"lifestyleTags":["outdoors","learning","fitness"],"quizCompleted":true}'::jsonb,
      interval '35 minutes'
    ),
    (
      '00000000-0000-0000-0000-000000000202'::uuid,
      'Mia Chen',
      'Mia',
      date '1995-09-04',
      null::text,
      (current_date - interval '4 months')::date,
      '{"energy":"medium","planning":"planned","socialStyle":"small_group","availability":"weekday","activityIntent":"social","cityTags":["walkability","public_transport"],"lifestyleTags":["coffee","food","social"],"quizCompleted":true}'::jsonb,
      interval '2 hours'
    ),
    (
      '00000000-0000-0000-0000-000000000203'::uuid,
      'Noah Patel',
      'Noah',
      date '1990-11-19',
      null::text,
      (current_date - interval '14 months')::date,
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
  first_name,
  date_of_birth,
  profile_photo_url,
  city_arrived_at,
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
  demo_profiles.first_name,
  demo_profiles.date_of_birth,
  demo_profiles.profile_photo_url,
  demo_profiles.city_arrived_at,
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
  first_name = excluded.first_name,
  date_of_birth = excluded.date_of_birth,
  profile_photo_url = excluded.profile_photo_url,
  city_arrived_at = excluded.city_arrived_at,
  visible = true,
  settled = false,
  quiz_traits = excluded.quiz_traits,
  last_active_at = excluded.last_active_at,
  updated_at = now();

delete from public.user_interests
where user_id in (
  '00000000-0000-0000-0000-000000000201'::uuid,
  '00000000-0000-0000-0000-000000000202'::uuid,
  '00000000-0000-0000-0000-000000000203'::uuid
);

with demo_user_interests (profile_id, interest_slug) as (
  values
    ('00000000-0000-0000-0000-000000000201'::uuid, 'surfing'),
    ('00000000-0000-0000-0000-000000000201'::uuid, 'golf'),
    ('00000000-0000-0000-0000-000000000201'::uuid, 'hackathons'),
    ('00000000-0000-0000-0000-000000000201'::uuid, 'rock-climbing'),
    ('00000000-0000-0000-0000-000000000201'::uuid, 'walking'),
    ('00000000-0000-0000-0000-000000000202'::uuid, 'golf'),
    ('00000000-0000-0000-0000-000000000202'::uuid, 'coffee'),
    ('00000000-0000-0000-0000-000000000202'::uuid, 'book-clubs'),
    ('00000000-0000-0000-0000-000000000202'::uuid, 'trivia-nights'),
    ('00000000-0000-0000-0000-000000000203'::uuid, 'board-games'),
    ('00000000-0000-0000-0000-000000000203'::uuid, 'walking'),
    ('00000000-0000-0000-0000-000000000203'::uuid, 'chess'),
    ('00000000-0000-0000-0000-000000000203'::uuid, 'gardening')
)
insert into public.user_interests (
  user_id,
  interest_id
)
select
  demo_user_interests.profile_id,
  interests.id
from demo_user_interests
join public.interests
  on interests.slug = demo_user_interests.interest_slug
on conflict (user_id, interest_id) do nothing;

delete from public.interest_activations
where user_id in (
  '00000000-0000-0000-0000-000000000201'::uuid,
  '00000000-0000-0000-0000-000000000202'::uuid,
  '00000000-0000-0000-0000-000000000203'::uuid
);

with demo_interest_activations (profile_id, interest_slug) as (
  values
    ('00000000-0000-0000-0000-000000000201'::uuid, 'surfing'),
    ('00000000-0000-0000-0000-000000000201'::uuid, 'golf'),
    ('00000000-0000-0000-0000-000000000201'::uuid, 'hackathons'),
    ('00000000-0000-0000-0000-000000000201'::uuid, 'rock-climbing'),
    ('00000000-0000-0000-0000-000000000201'::uuid, 'walking'),
    ('00000000-0000-0000-0000-000000000202'::uuid, 'golf'),
    ('00000000-0000-0000-0000-000000000202'::uuid, 'coffee'),
    ('00000000-0000-0000-0000-000000000202'::uuid, 'book-clubs'),
    ('00000000-0000-0000-0000-000000000202'::uuid, 'trivia-nights'),
    ('00000000-0000-0000-0000-000000000203'::uuid, 'board-games'),
    ('00000000-0000-0000-0000-000000000203'::uuid, 'walking'),
    ('00000000-0000-0000-0000-000000000203'::uuid, 'chess'),
    ('00000000-0000-0000-0000-000000000203'::uuid, 'gardening')
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
