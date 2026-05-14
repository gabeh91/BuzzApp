export const fireActivateFabHaptic = (effect: () => Promise<void>) => {
  void effect().catch(() => undefined);
};
