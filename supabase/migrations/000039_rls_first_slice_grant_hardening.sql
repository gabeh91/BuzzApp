revoke all privileges on public.cities from anon, authenticated;
grant select on public.cities to anon, authenticated;

revoke all privileges on public.suburbs from anon, authenticated;
grant select on public.suburbs to anon, authenticated;

revoke all privileges on public.suburb_tags from anon, authenticated;
grant select on public.suburb_tags to anon, authenticated;

revoke all privileges on public.interests from anon, authenticated;
grant select on public.interests to anon, authenticated;

revoke all privileges on public.city_interests from anon, authenticated;
grant select on public.city_interests to anon, authenticated;

revoke all privileges on public.city_settings from anon, authenticated;
grant select on public.city_settings to anon, authenticated;

revoke all privileges on public.city_feature_flags from anon, authenticated;
grant select on public.city_feature_flags to anon, authenticated;

revoke all privileges on public.feature_flags from anon, authenticated;
grant select on public.feature_flags to anon, authenticated;

revoke all privileges on public.business_categories from anon, authenticated;
grant select on public.business_categories to anon, authenticated;

revoke all privileges on public.businesses from anon, authenticated;
grant select on public.businesses to anon, authenticated;

revoke all privileges on public.events from anon, authenticated;
grant select on public.events to anon, authenticated;

revoke all privileges on public.event_interests from anon, authenticated;
grant select on public.event_interests to anon, authenticated;

revoke all privileges on public.activity_groups from anon, authenticated;
grant select on public.activity_groups to anon, authenticated;

revoke all privileges on public.activity_group_members from anon, authenticated;
grant select on public.activity_group_members to anon, authenticated;

revoke all privileges on public.activity_plans from anon, authenticated;
grant select on public.activity_plans to anon, authenticated;

revoke all privileges on public.group_messages from anon, authenticated;
grant select on public.group_messages to anon, authenticated;
