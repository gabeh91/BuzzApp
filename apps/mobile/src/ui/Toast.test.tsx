import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { Pressable, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { I18nProvider } from "@/i18n/I18nProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";

import { ToastProvider, useToast } from "./Toast";

const testSafeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 34 },
};

function Trigger({ message }: { message: string }) {
  const { showToast } = useToast();

  return (
    <Pressable onPress={() => showToast({ message })}>
      <Text>tap</Text>
    </Pressable>
  );
}

function TriggerDuration({ message }: { message: string }) {
  const { showToast } = useToast();

  return (
    <Pressable onPress={() => showToast({ durationMs: 2000, message })}>
      <Text>tap</Text>
    </Pressable>
  );
}

function TriggerStack() {
  const { showToast } = useToast();

  return (
    <Pressable
      onPress={() => {
        showToast({ message: "First" });
        showToast({ message: "Second" });
      }}
    >
      <Text>tap</Text>
    </Pressable>
  );
}

const renderWithProviders = (ui: ReactElement) =>
  render(
    <SafeAreaProvider initialMetrics={testSafeAreaMetrics}>
      <ThemeProvider>
        <I18nProvider>
          <ToastProvider>{ui}</ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  );

/** Extra fake time so exit slide + opacity animations can finish (JS driver). */
const EXIT_ANIMATION_BUFFER_MS = 320;

describe("Toast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows a message and hides after the auto-dismiss delay", () => {
    renderWithProviders(<Trigger message="Ping sent" />);

    fireEvent.press(screen.getByText("tap"));

    expect(screen.getByText("Ping sent")).toBeTruthy();
    expect(
      screen.getByTestId("toast-timeout-indicator", { includeHiddenElements: true }),
    ).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(4500 + EXIT_ANIMATION_BUFFER_MS);
    });

    expect(screen.queryByText("Ping sent")).toBeNull();
  });

  it("dismisses when the dismiss control is activated", () => {
    renderWithProviders(<Trigger message="Ping sent" />);

    fireEvent.press(screen.getByText("tap"));
    fireEvent.press(screen.getByRole("button", { name: "Dismiss" }));

    act(() => {
      jest.advanceTimersByTime(EXIT_ANIMATION_BUFFER_MS);
    });

    expect(screen.queryByText("Ping sent")).toBeNull();
  });

  it("respects a shorter custom auto-dismiss duration", () => {
    renderWithProviders(<TriggerDuration message="Quick" />);

    fireEvent.press(screen.getByText("tap"));

    expect(screen.getByText("Quick")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1999);
    });

    expect(screen.getByText("Quick")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1 + EXIT_ANIMATION_BUFFER_MS);
    });

    expect(screen.queryByText("Quick")).toBeNull();
  });

  it("stacks a newer toast above an older one on the top edge", () => {
    renderWithProviders(<TriggerStack />);

    fireEvent.press(screen.getByText("tap"));

    expect(screen.getByText("First")).toBeTruthy();
    expect(screen.getByText("Second")).toBeTruthy();
  });
});
