insert into public.interests (name, slug, category)
values
  ('Running', 'running', 'fitness')
on conflict (slug) do nothing;
