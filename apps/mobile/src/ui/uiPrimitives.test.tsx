import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactElement } from "react";

import { ThemeProvider } from "@/theme/ThemeProvider";
import { Button, Header, HeroPanel, Panel, Screen, Text } from "@/ui";

const renderWithTheme = (ui: ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe("UI primitives", () => {
  it("renders shared screen chrome and text variants", () => {
    renderWithTheme(
      <Screen>
        <Header
          left={<Text variant="logo">Buzz</Text>}
          right={<Text variant="city">Melbourne</Text>}
        />
        <Panel>
          <Text variant="title">Reusable componentry</Text>
          <Text variant="body">
            Feature screens compose the same primitives.
          </Text>
        </Panel>
      </Screen>,
    );

    expect(screen.getByText("Buzz")).toBeTruthy();
    expect(screen.getByText("Melbourne")).toBeTruthy();
    expect(screen.getByText("Reusable componentry")).toBeTruthy();
    expect(
      screen.getByText("Feature screens compose the same primitives."),
    ).toBeTruthy();
  });

  it("renders accessible buttons and dispatches presses through props", () => {
    const onPress = jest.fn();

    renderWithTheme(<Button label="Accept plan" onPress={onPress} />);

    fireEvent.press(screen.getByRole("button", { name: "Accept plan" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders the shared hero panel with consistent content slots", () => {
    renderWithTheme(
      <HeroPanel
        body="One reusable card defines the hero spacing."
        eyebrow="Melbourne"
        title="Your profile"
      />,
    );

    expect(screen.getByText("Melbourne")).toBeTruthy();
    expect(screen.getByText("Your profile")).toBeTruthy();
    expect(
      screen.getByText("One reusable card defines the hero spacing."),
    ).toBeTruthy();
  });

  it("keeps disabled buttons inert", () => {
    const onPress = jest.fn();

    renderWithTheme(<Button disabled label="Accept plan" onPress={onPress} />);

    fireEvent.press(screen.getByRole("button", { name: "Accept plan" }));

    expect(onPress).not.toHaveBeenCalled();
  });
});
