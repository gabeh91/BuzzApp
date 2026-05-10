export const routes = {
  onboarding: "/",
  home: "/home",
  profile: "/profile",
  group: (id: string) => `/groups/${id}` as const,
} as const;

export type BuzzRoute =
  | typeof routes.onboarding
  | typeof routes.home
  | typeof routes.profile
  | ReturnType<typeof routes.group>;

export const isOnboardingRoute = (route: BuzzRoute): boolean => {
  return route === routes.onboarding;
};
