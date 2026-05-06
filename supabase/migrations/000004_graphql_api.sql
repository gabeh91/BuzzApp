comment on schema public is e'@graphql({"inflect_names": true})';

grant usage on schema public to anon, authenticated;
grant select on public.cities to anon, authenticated;
grant select on public.interests to anon, authenticated;
grant select on public.business_categories to anon, authenticated;
grant select on public.businesses to anon, authenticated;
grant select on public.events to anon, authenticated;
grant select on public.feature_flags to anon, authenticated;

create or replace function public."activateInterest"("interestId" uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_city_id uuid;
  target_interest public.interests%rowtype;
  activation_id uuid;
begin
  select *
  into target_interest
  from public.interests
  where id = "interestId";

  if target_interest.id is null then
    raise exception 'Interest not found';
  end if;

  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select id
  into target_city_id
  from public.cities
  order by created_at
  limit 1;

  insert into public.profiles (id, city_id, display_name)
  values (current_user_id, target_city_id, 'Buzz Member')
  on conflict (id) do update
  set updated_at = now();

  insert into public.interest_activations (user_id, interest_id, city_id)
  values (current_user_id, "interestId", target_city_id)
  returning id into activation_id;

  return jsonb_build_object(
    'ok', true,
    'activationId', activation_id,
    'interestId', "interestId",
    'matchedUsers', '[]'::jsonb,
    'message', 'Interest activation recorded'
  );
end;
$$;

revoke all on function public."activateInterest"(uuid) from public;
grant execute on function public."activateInterest"(uuid) to anon, authenticated;
