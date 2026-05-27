import type { I18n } from "@/i18n";

import type { AuthModalIntent } from "./authNavigation";

export type AuthModalStartCopy = {
  eyebrow: string;
  title: string;
  body: string;
};

export const getAuthModalStartCopy = (
  LL: I18n,
  intent: AuthModalIntent,
): AuthModalStartCopy => {
  const intents = LL.authModal.intents;

  switch (intent) {
    case "existing_account_sign_in":
      return {
        eyebrow: intents.existing_account_sign_in.eyebrow(),
        title: intents.existing_account_sign_in.title(),
        body: intents.existing_account_sign_in.body(),
      };
    case "save_profile":
      return {
        eyebrow: intents.save_profile.eyebrow(),
        title: intents.save_profile.title(),
        body: intents.save_profile.body(),
      };
    case "activate_interest":
      return {
        eyebrow: intents.activate_interest.eyebrow(),
        title: intents.activate_interest.title(),
        body: intents.activate_interest.body(),
      };
    case "attend_activity":
      return {
        eyebrow: intents.attend_activity.eyebrow(),
        title: intents.attend_activity.title(),
        body: intents.attend_activity.body(),
      };
    case "invite_friend":
      return {
        eyebrow: intents.invite_friend.eyebrow(),
        title: intents.invite_friend.title(),
        body: intents.invite_friend.body(),
      };
    case "chat":
      return {
        eyebrow: intents.chat.eyebrow(),
        title: intents.chat.title(),
        body: intents.chat.body(),
      };
    case "safety_action":
      return {
        eyebrow: intents.safety_action.eyebrow(),
        title: intents.safety_action.title(),
        body: intents.safety_action.body(),
      };
    case "post_activity_feedback":
      return {
        eyebrow: intents.post_activity_feedback.eyebrow(),
        title: intents.post_activity_feedback.title(),
        body: intents.post_activity_feedback.body(),
      };
  }
};
