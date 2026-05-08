export type SettlingProgressState = {
  attendanceConfirmed: boolean;
  feedbackCompleted: boolean;
  groupJoined: boolean;
};

export const createInitialSettlingProgressState =
  (): SettlingProgressState => ({
    attendanceConfirmed: false,
    feedbackCompleted: false,
    groupJoined: false,
  });

export const markGroupJoined = (
  state: SettlingProgressState,
): SettlingProgressState => {
  return state.groupJoined ? state : { ...state, groupJoined: true };
};

export const markAttendanceConfirmed = (
  state: SettlingProgressState,
): SettlingProgressState => {
  return state.attendanceConfirmed
    ? state
    : markGroupJoined({ ...state, attendanceConfirmed: true });
};

export const markFeedbackCompleted = (
  state: SettlingProgressState,
): SettlingProgressState => {
  return state.feedbackCompleted
    ? state
    : markGroupJoined({ ...state, feedbackCompleted: true });
};
