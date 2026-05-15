create or replace function public."getIncomingActivationPings"()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', activation_pings.id,
        'activationId', activation_pings.activation_id,
        'interestId', activation_pings.interest_id,
        'interestName', coalesce(interests.name, 'this activity'),
        'existingDirectConversationId', (
          select direct_conversations.id
          from public.direct_conversations
          where direct_conversations.status = 'active'
            and (
              (
                direct_conversations.user_low_id = least(auth.uid(), activation_pings.sender_id)
                and direct_conversations.user_high_id = greatest(auth.uid(), activation_pings.sender_id)
              )
            )
          limit 1
        ),
        'senderId', activation_pings.sender_id,
        'senderName', coalesce(
          nullif(profiles.first_name, ''),
          nullif(split_part(profiles.display_name, ' ', 1), ''),
          nullif(profiles.display_name, ''),
          'Someone nearby'
        ),
        'senderPhotoUrl', profiles.profile_photo_url,
        'cityId', activation_pings.city_id,
        'status', activation_pings.status,
        'expiresAt', activation_pings.expires_at,
        'createdAt', activation_pings.created_at
      )
      order by activation_pings.created_at desc
    ),
    '[]'::jsonb
  )
  from public.activation_pings
  left join public.interests
    on interests.id = activation_pings.interest_id
  join public.profiles
    on profiles.id = activation_pings.sender_id
  where activation_pings.recipient_id = auth.uid()
    and activation_pings.status = 'pending'
    and activation_pings.expires_at > now();
$$;

revoke all on function public."getIncomingActivationPings"() from public;
revoke execute on function public."getIncomingActivationPings"() from anon;
grant execute on function public."getIncomingActivationPings"() to authenticated;
