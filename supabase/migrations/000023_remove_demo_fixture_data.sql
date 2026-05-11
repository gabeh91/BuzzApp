delete from public.profiles
where id in (
  '00000000-0000-0000-0000-000000000201'::uuid,
  '00000000-0000-0000-0000-000000000202'::uuid,
  '00000000-0000-0000-0000-000000000203'::uuid
);

delete from public.businesses
where name in (
  'Northside Tennis',
  'Laneway Coffee',
  'Ocean Club'
);

delete from public.events
where title in (
  'Welcome Picnic',
  'Climbing Night',
  'Board Game Social'
);
