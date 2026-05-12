create or replace function public."getBuzzProfileQuizState"()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_profile public.profiles%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into current_profile
  from public.profiles
  where id = current_user_id;

  if current_profile.id is null then
    return jsonb_build_object(
      'profileExists', false,
      'quizAnswers', '{}'::jsonb,
      'quizCompleted', false,
      'quizTraits', '{}'::jsonb,
      'userId', current_user_id
    );
  end if;

  return jsonb_build_object(
    'profileExists', true,
    'quizAnswers', coalesce(current_profile.quiz_answers, '{}'::jsonb),
    'quizCompleted', coalesce((current_profile.quiz_traits->>'quizCompleted')::boolean, false),
    'quizTraits', coalesce(current_profile.quiz_traits, '{}'::jsonb),
    'userId', current_user_id
  );
end;
$$;

revoke all on function public."getBuzzProfileQuizState"() from public;
grant execute on function public."getBuzzProfileQuizState"() to authenticated;
