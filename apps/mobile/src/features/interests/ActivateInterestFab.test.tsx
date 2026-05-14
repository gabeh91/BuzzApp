import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { I18nProvider } from "@/i18n/I18nProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";

import { ActivateInterestFab } from "./ActivateInterestFab";
import { computeMorphSpreadBlend } from "./activateFab/activateFabMorph";
import { MORPH_SPREAD_START } from "./activateFab/activateFabMorphConfig";
import type { BuzzInterest } from "./interestFlow";

const interests: BuzzInterest[] = [
  {
    category: "sport",
    id: "golf",
    name: "Golf",
    slug: "golf",
  },
  {
    category: "social",
    id: "coffee",
    name: "Coffee",
    slug: "coffee",
  },
];

const renderFab = (ui: ReactElement) =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 34, left: 0, right: 0, top: 47 },
      }}
    >
      <ThemeProvider>
        <I18nProvider>{ui}</I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  );

describe("ActivateInterestFab", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("delegates a tap to Activities empty handler when the radial picker is skipped", () => {
    const onActivitiesEmpty = jest.fn();

    renderFab(
      <ActivateInterestFab
        accessibilityLabel="Activate interest"
        bottomInset={0}
        interests={interests}
        onActivitiesEmptyActivationPress={onActivitiesEmpty}
        onActivateSelectedInterest={jest.fn()}
        onClearSelectedInterest={jest.fn()}
        onSelectInterest={jest.fn()}
        selectedInterest={null}
        skipActivityWheel
      />,
    );

    fireEvent.press(screen.getByRole("button", { name: "Activate interest" }));

    expect(onActivitiesEmpty).toHaveBeenCalledTimes(1);
  });

  it("opens a radial activity picker and selects an activity before charging", () => {
    const onSelectInterest = jest.fn();

    renderFab(
      <ActivateInterestFab
        accessibilityLabel="Activate interest"
        bottomInset={0}
        interests={interests}
        onActivateSelectedInterest={jest.fn()}
        onClearSelectedInterest={jest.fn()}
        onSelectInterest={onSelectInterest}
        selectedInterest={null}
      />,
    );

    fireEvent.press(screen.getByRole("button", { name: "Activate interest" }));
    fireEvent.press(screen.getByRole("button", { name: "Golf" }));

    expect(onSelectInterest).toHaveBeenCalledWith(interests[0]);
  });

  it("requires the hold threshold before releasing activation", async () => {
    const onActivateSelectedInterest = jest.fn(async () => undefined);
    const selectedInterest = interests[0];

    if (!selectedInterest) {
      throw new Error("Test interest missing");
    }

    renderFab(
      <ActivateInterestFab
        accessibilityLabel="Activate interest"
        bottomInset={0}
        interests={interests}
        onActivateSelectedInterest={onActivateSelectedInterest}
        onClearSelectedInterest={jest.fn()}
        onSelectInterest={jest.fn()}
        selectedInterest={selectedInterest}
      />,
    );

    const button = screen.getByRole("button", { name: "Activate interest" });

    fireEvent(button, "pressIn");
    fireEvent(button, "pressOut");

    expect(onActivateSelectedInterest).not.toHaveBeenCalled();

    fireEvent(button, "pressIn");

    act(() => {
      jest.advanceTimersByTime(1900);
    });

    expect(screen.getByText("Release to ping nearby people")).toBeTruthy();

    await act(async () => {
      fireEvent(button, "pressOut");
    });

    expect(onActivateSelectedInterest).toHaveBeenCalledTimes(1);
  });

  it("surfaces all activities in the overlay picker", () => {
    const manyInterests = Array.from({ length: 12 }, (_, index) => ({
      category: "activity",
      id: `activity-${index + 1}`,
      name: `Activity ${index + 1}`,
      slug: `activity-${index + 1}`,
    }));

    renderFab(
      <ActivateInterestFab
        accessibilityLabel="Activate interest"
        bottomInset={0}
        interests={manyInterests}
        onActivateSelectedInterest={jest.fn()}
        onClearSelectedInterest={jest.fn()}
        onSelectInterest={jest.fn()}
        selectedInterest={null}
      />,
    );

    fireEvent.press(screen.getByRole("button", { name: "Activate interest" }));

    expect(screen.getByText("Activity 10")).toBeTruthy();
    expect(screen.getByText("Activity 11")).toBeTruthy();
  });

  it("uses a stable shared height for overlay activity cards", () => {
    const overlayInterests: BuzzInterest[] = [
      {
        category: "learning",
        id: "golf",
        name: "Golf",
        slug: "golf",
      },
      {
        category: "learning",
        id: "language-exchange",
        name: "Language Exchange",
        slug: "language-exchange",
      },
    ];

    renderFab(
      <ActivateInterestFab
        accessibilityLabel="Activate interest"
        bottomInset={0}
        interests={overlayInterests}
        onActivateSelectedInterest={jest.fn()}
        onClearSelectedInterest={jest.fn()}
        onSelectInterest={jest.fn()}
        selectedInterest={null}
      />,
    );

    fireEvent.press(screen.getByRole("button", { name: "Activate interest" }));

    const resolveStyle = (style: unknown) =>
      typeof style === "function" ? style({ pressed: false }) : style;

    const shortCardStyle = StyleSheet.flatten(
      resolveStyle(screen.getByRole("button", { name: "Golf" }).props.style),
    );
    const longCardStyle = StyleSheet.flatten(
      resolveStyle(
        screen.getByRole("button", { name: "Language Exchange" }).props.style,
      ),
    );

    expect(shortCardStyle.height).toBe(longCardStyle.height);
    expect(shortCardStyle.height).toBeGreaterThan(90);
    expect(screen.getByText("Language Exchange").props.numberOfLines).toBe(
      undefined,
    );
  });

  it("lets people clear the selected activity from the expanded FAB", () => {
    const onClearSelectedInterest = jest.fn();
    const selectedInterest = interests[0];

    if (!selectedInterest) {
      throw new Error("Test interest missing");
    }

    renderFab(
      <ActivateInterestFab
        accessibilityLabel="Activate interest"
        bottomInset={0}
        interests={interests}
        onActivateSelectedInterest={jest.fn()}
        onClearSelectedInterest={onClearSelectedInterest}
        onSelectInterest={jest.fn()}
        selectedInterest={selectedInterest}
      />,
    );

    fireEvent.press(
      screen.getByRole("button", { name: "Clear selected activity" }),
    );

    expect(onClearSelectedInterest).toHaveBeenCalledTimes(1);
  });
});

describe("activateFabMorph", () => {
  it("computeMorphSpreadBlend is zero before spread starts and one at full morph", () => {
    expect(computeMorphSpreadBlend(0)).toBe(0);
    expect(computeMorphSpreadBlend(MORPH_SPREAD_START * 0.5)).toBe(0);
    expect(computeMorphSpreadBlend(1)).toBeCloseTo(1, 5);
    expect(computeMorphSpreadBlend(0.72)).toBeGreaterThan(
      computeMorphSpreadBlend(0.35),
    );
  });
});
