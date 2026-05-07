insert into public.cities (id, name, country_code, timezone)
values
  ('00000000-0000-0000-0000-000000000001', 'Melbourne', 'AU', 'Australia/Melbourne')
on conflict do nothing;

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

with demo_profiles (id, display_name, quiz_traits, last_active_offset) as (
  values
    (
      '00000000-0000-0000-0000-000000000201'::uuid,
      'Sam Rivera',
      '{"energy":"high","planning":"planned","socialStyle":"small_group","availability":"weekend","activityIntent":"learn","quizCompleted":true}'::jsonb,
      interval '35 minutes'
    ),
    (
      '00000000-0000-0000-0000-000000000202'::uuid,
      'Mia Chen',
      '{"energy":"medium","planning":"planned","socialStyle":"small_group","availability":"weekday","activityIntent":"meet","quizCompleted":true}'::jsonb,
      interval '2 hours'
    ),
    (
      '00000000-0000-0000-0000-000000000203'::uuid,
      'Noah Patel',
      '{"energy":"low","planning":"spontaneous","socialStyle":"one_on_one","availability":"weekend","activityIntent":"explore","quizCompleted":true}'::jsonb,
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
