create or replace function public."upsertBuzzProfile"(
  "userId" uuid,
  "displayName" text,
  "cityId" uuid,
  "quizAnswers" jsonb,
  "quizTraits" jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  saved_profile public.profiles%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if current_user_id <> "userId" then
    raise exception 'Cannot update another profile';
  end if;

  insert into public.profiles (
    id,
    city_id,
    display_name,
    quiz_answers,
    quiz_traits,
    last_active_at
  )
  values (
    "userId",
    "cityId",
    coalesce(nullif(trim("displayName"), ''), 'Buzz Member'),
    coalesce("quizAnswers", '{}'::jsonb),
    coalesce("quizTraits", '{}'::jsonb),
    now()
  )
  on conflict (id) do update
  set
    city_id = excluded.city_id,
    display_name = excluded.display_name,
    quiz_answers = excluded.quiz_answers,
    quiz_traits = excluded.quiz_traits,
    last_active_at = now(),
    updated_at = now()
  returning * into saved_profile;

  return jsonb_build_object(
    'ok', true,
    'profileId', saved_profile.id,
    'quizCompleted', coalesce((saved_profile.quiz_traits->>'quizCompleted')::boolean, false)
  );
end;
$$;

revoke all on function public."upsertBuzzProfile"(uuid, text, uuid, jsonb, jsonb) from public;
grant execute on function public."upsertBuzzProfile"(uuid, text, uuid, jsonb, jsonb) to authenticated;
