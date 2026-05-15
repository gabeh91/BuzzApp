export const routes = {
  onboarding: "/",
  onboardingQuiz: "/onboarding",
  home: "/home",
  activities: "/activities",
  chats: "/chats",
  profile: "/profile",
  profileQuiz: "/profile/quiz",
  auth: "/auth",
  authCode: "/auth/code",
  group: (id: string) => `/groups/${id}` as const,
  directChat: (id: string) => `/chats/direct/${id}` as const,
  peopleConnect: (profileId: string) => `/people/${profileId}/connect` as const,
} as const;

export type BuzzRoute =
  | typeof routes.onboarding
  | typeof routes.onboardingQuiz
  | typeof routes.home
  | typeof routes.activities
  | typeof routes.chats
  | typeof routes.profile
  | typeof routes.profileQuiz
  | typeof routes.auth
  | typeof routes.authCode
  | ReturnType<typeof routes.group>
  | ReturnType<typeof routes.directChat>
  | ReturnType<typeof routes.peopleConnect>;

export const isOnboardingRoute = (route: BuzzRoute): boolean => {
  return route === routes.onboarding || route === routes.onboardingQuiz;
};
