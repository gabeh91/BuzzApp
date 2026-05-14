import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";

type FocusHandler = () => void;

type ActivitiesPickerFocusContextValue = {
  focusActivitiesInterestPicker: () => void;
  registerFocusHandler: (handler: FocusHandler | null) => void;
};

const ActivitiesPickerFocusContext =
  createContext<ActivitiesPickerFocusContextValue | null>(null);

export const ActivitiesPickerFocusProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const handlerRef = useRef<FocusHandler | null>(null);

  const registerFocusHandler = useCallback((handler: FocusHandler | null) => {
    handlerRef.current = handler;
  }, []);

  const focusActivitiesInterestPicker = useCallback(() => {
    handlerRef.current?.();
  }, []);

  return (
    <ActivitiesPickerFocusContext.Provider
      value={{
        focusActivitiesInterestPicker,
        registerFocusHandler,
      }}
    >
      {children}
    </ActivitiesPickerFocusContext.Provider>
  );
};

export const useActivitiesPickerFocus = (): ActivitiesPickerFocusContextValue => {
  const context = useContext(ActivitiesPickerFocusContext);

  if (!context) {
    return {
      focusActivitiesInterestPicker: () => undefined,
      registerFocusHandler: (_handler: FocusHandler | null) => undefined,
    };
  }

  return context;
};
