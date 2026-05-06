export const routes = {
  onboarding: "/",
  home: "/home"
} as const;

export type BuzzRoute = (typeof routes)[keyof typeof routes];

export const isOnboardingRoute = (route: BuzzRoute): boolean => {
  return route === routes.onboarding;
};
