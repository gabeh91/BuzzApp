export const routes = {
  onboarding: "/",
  home: "/home",
  group: (id: string) => `/groups/${id}` as const
} as const;

export type BuzzRoute = typeof routes.onboarding | typeof routes.home | ReturnType<typeof routes.group>;

export const isOnboardingRoute = (route: BuzzRoute): boolean => {
  return route === routes.onboarding;
};
