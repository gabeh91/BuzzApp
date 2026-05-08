import { createContext, useContext, useState, type ReactNode } from "react";

import {
  createInitialSettlingProgressState,
  markAttendanceConfirmed as markAttendanceConfirmedState,
  markFeedbackCompleted as markFeedbackCompletedState,
  markGroupJoined as markGroupJoinedState,
  type SettlingProgressState,
} from "./settlingProgressState";

type SettlingProgressContextValue = {
  markAttendanceConfirmed: () => void;
  markFeedbackCompleted: () => void;
  markGroupJoined: () => void;
  state: SettlingProgressState;
};

const SettlingProgressContext =
  createContext<SettlingProgressContextValue | null>(null);

export const SettlingProgressProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, setState] = useState(createInitialSettlingProgressState);

  const value: SettlingProgressContextValue = {
    markAttendanceConfirmed: () => {
      setState(markAttendanceConfirmedState);
    },
    markFeedbackCompleted: () => {
      setState(markFeedbackCompletedState);
    },
    markGroupJoined: () => {
      setState(markGroupJoinedState);
    },
    state,
  };

  return (
    <SettlingProgressContext.Provider value={value}>
      {children}
    </SettlingProgressContext.Provider>
  );
};

export const useSettlingProgressState = (): SettlingProgressContextValue => {
  const value = useContext(SettlingProgressContext);

  if (!value) {
    throw new Error(
      "useSettlingProgressState must be used within SettlingProgressProvider",
    );
  }

  return value;
};
