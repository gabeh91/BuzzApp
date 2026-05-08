import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text, Pressable } from "react-native";

import {
  SettlingProgressProvider,
  useSettlingProgressState,
} from "./SettlingProgressProvider";

const ProgressHarness = () => {
  const {
    markAttendanceConfirmed,
    markFeedbackCompleted,
    markGroupJoined,
    state,
  } = useSettlingProgressState();

  return (
    <>
      <Text>{state.groupJoined ? "group joined" : "group pending"}</Text>
      <Text>
        {state.attendanceConfirmed
          ? "attendance confirmed"
          : "attendance pending"}
      </Text>
      <Text>
        {state.feedbackCompleted ? "feedback completed" : "feedback pending"}
      </Text>
      <Pressable accessibilityRole="button" onPress={markGroupJoined}>
        <Text>Join group</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={markAttendanceConfirmed}>
        <Text>Confirm attendance</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={markFeedbackCompleted}>
        <Text>Complete feedback</Text>
      </Pressable>
    </>
  );
};

describe("SettlingProgressProvider", () => {
  it("shares group, attendance, and feedback progress across component state", () => {
    render(
      <SettlingProgressProvider>
        <ProgressHarness />
      </SettlingProgressProvider>,
    );

    expect(screen.getByText("group pending")).toBeTruthy();
    expect(screen.getByText("attendance pending")).toBeTruthy();
    expect(screen.getByText("feedback pending")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: "Join group" }));
    fireEvent.press(screen.getByRole("button", { name: "Confirm attendance" }));
    fireEvent.press(screen.getByRole("button", { name: "Complete feedback" }));

    expect(screen.getByText("group joined")).toBeTruthy();
    expect(screen.getByText("attendance confirmed")).toBeTruthy();
    expect(screen.getByText("feedback completed")).toBeTruthy();
  });
});
