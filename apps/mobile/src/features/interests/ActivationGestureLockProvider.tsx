import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ActivationGestureLockContextValue = {
  isActivationGestureLocked: boolean;
  setActivationGestureLocked: (locked: boolean) => void;
};

const noop = () => undefined;

const ActivationGestureLockContext =
  createContext<ActivationGestureLockContextValue>({
    isActivationGestureLocked: false,
    setActivationGestureLocked: noop,
  });

export const ActivationGestureLockProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isActivationGestureLocked, setActivationGestureLocked] =
    useState(false);
  const value = useMemo(
    () => ({
      isActivationGestureLocked,
      setActivationGestureLocked,
    }),
    [isActivationGestureLocked],
  );

  return (
    <ActivationGestureLockContext.Provider value={value}>
      {children}
    </ActivationGestureLockContext.Provider>
  );
};

export const useActivationGestureLock =
  (): ActivationGestureLockContextValue => useContext(ActivationGestureLockContext);
