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
  ('Coffee', 'coffee', 'food')
on conflict (slug) do nothing;
