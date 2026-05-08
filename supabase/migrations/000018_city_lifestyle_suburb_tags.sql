with melbourne as (
  select id
  from public.cities
  where name = 'Melbourne'
  limit 1
),
seed_tags (suburb_slug, tag_key, weight, reason) as (
  values
    ('fitzroy', 'music', 0.92, 'Strong live music and culture fit.'),
    ('fitzroy', 'food', 0.82, 'Good for food-led exploring.'),
    ('fitzroy', 'creative', 0.9, 'Strong creative scene.'),
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
    ('carlton', 'learning', 0.86, 'Strong learning and student-friendly fit.'),
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
    ('footscray', 'creative', 0.72, 'Creative westside community energy.'),
    ('footscray', 'music', 0.58, 'Growing music and culture options.'),
    ('footscray', 'public_transport', 0.8, 'Strong train access.'),
    ('northcote', 'music', 0.84, 'Strong live music and culture fit.'),
    ('northcote', 'creative', 0.78, 'Creative and community-minded feel.'),
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
