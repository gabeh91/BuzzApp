drop function if exists public."getPeopleMatches"(uuid, text, jsonb, uuid[], integer, text[]);

create or replace function public."getPeopleMatchesForDiscover"(
  "cityId" uuid default null,
  "cityName" text default 'Melbourne',
  "quizTraits" jsonb default '{}'::jsonb,
  "interestIds" uuid[] default null,
  "limitCount" integer default 20,
  "interestSlugs" text[] default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  resolved_interest_ids uuid[] := '{}'::uuid[];
  effective_interest_ids uuid[] := coalesce("interestIds", '{}'::uuid[]);
begin
  if array_length(coalesce("interestSlugs", '{}'::text[]), 1) is not null then
    select coalesce(array_agg(distinct interests.id), '{}'::uuid[])
    into resolved_interest_ids
    from public.interests
    where interests.slug = any("interestSlugs");
  end if;

  if array_length(resolved_interest_ids, 1) is not null then
    select coalesce(array_agg(distinct interest_id), '{}'::uuid[])
    into effective_interest_ids
    from unnest(effective_interest_ids || resolved_interest_ids) as resolved(interest_id);
  end if;

  return public."getPeopleMatches"(
    "cityId",
    "cityName",
    "quizTraits",
    effective_interest_ids,
    "limitCount"
  );
end;
$$;

revoke all on function public."getPeopleMatchesForDiscover"(uuid, text, jsonb, uuid[], integer, text[]) from public;
grant execute on function public."getPeopleMatchesForDiscover"(uuid, text, jsonb, uuid[], integer, text[]) to anon, authenticated;
