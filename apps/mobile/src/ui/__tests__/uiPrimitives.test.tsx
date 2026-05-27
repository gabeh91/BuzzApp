import { fireEvent, render, screen } from "@testing-library/react-native";
import { readFileSync } from "node:fs";
import type { ReactElement } from "react";

import { I18nProvider } from "@/i18n/I18nProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import {
  AppBrandedCityHeader,
  BackHeader,
  Button,
  Header,
  HeroPanel,
  List,
  Panel,
  Screen,
  SegmentedTwoTabs,
  Text,
  TextInputGroup,
} from "@/ui";

const renderWithTheme = (ui: ReactElement) =>
  render(
    <ThemeProvider>
      <I18nProvider>{ui}</I18nProvider>
    </ThemeProvider>,
  );

describe("UI primitives", () => {
  it("renders AppBrandedCityHeader with brand and city", () => {
    renderWithTheme(<AppBrandedCityHeader cityName="Melbourne" />);

    expect(screen.getByText("Buzz")).toBeTruthy();
    expect(screen.getByText("Melbourne")).toBeTruthy();
  });

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

  it("renders BackHeader with caret and dispatches onBack", () => {
    const onBack = jest.fn();

    renderWithTheme(
      <BackHeader
        backLabel="Back"
        onBack={onBack}
        right={<Text variant="city">Context</Text>}
      />,
    );

    fireEvent.press(screen.getByRole("button", { name: "Back" }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Context")).toBeTruthy();
  });

  it("renders SegmentedTwoTabs and reports tab changes", () => {
    const onChange = jest.fn();

    renderWithTheme(
      <SegmentedTwoTabs
        left={{ label: "Left" }}
        right={{ label: "Right" }}
        value="left"
        onChange={onChange}
      />,
    );

    fireEvent.press(screen.getByText("Right"));

    expect(onChange).toHaveBeenCalledWith("right");
  });

  it("renders accessible buttons and dispatches presses through props", () => {
    const onPress = jest.fn();

    renderWithTheme(<Button label="Accept plan" onPress={onPress} />);

    fireEvent.press(screen.getByRole("button", { name: "Accept plan" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders TextInputGroup with label and optional description", () => {
    renderWithTheme(
      <TextInputGroup
        description="Shown on your profile when you connect."
        label="First name"
        onChangeText={jest.fn()}
        value=""
      />,
    );

    expect(screen.getByText("First name")).toBeTruthy();
    expect(
      screen.getByText("Shown on your profile when you connect."),
    ).toBeTruthy();
  });

  it("TextInputGroup uses button-matched field radius and floating label animation", () => {
    const source = readFileSync("src/ui/TextInputGroup.tsx", "utf8");

    expect(source).toMatch(/borderRadius: radii\.sm/);
    expect(source).toMatch(/withTiming/);
    expect(source).toMatch(/labelMask/);
    expect(source).toMatch(/colors\.border/);
    expect(source).toMatch(/colors\.textMuted/);
    expect(source).toMatch(/fontStyles\.body/);
    expect(source).not.toMatch(/colors\.brand/);
    expect(source).not.toMatch(/fieldAnimatedStyle/);
    expect(source).toMatch(/labelBackdropColor/);
    expect(source).toMatch(/labelBehavior/);
    expect(source).toMatch(/textInputProps\.multiline === true/);
  });

  it("uses TextInputGroup for standard form text areas", () => {
    const peopleConnectionSource = readFileSync(
      "src/features/people/PeopleConnectionRequestScreen.tsx",
      "utf8",
    );
    const directChatSource = readFileSync(
      "src/features/chat/DirectChatScreen.tsx",
      "utf8",
    );

    expect(peopleConnectionSource).toMatch(/TextInputGroup/);
    expect(peopleConnectionSource).not.toMatch(/<TextInput(?=[\s>])/);
    expect(directChatSource).toMatch(/TextInputGroup/);
    expect(directChatSource).not.toMatch(/<TextInput(?=[\s>])/);
  });

  it("centers button label text when labels wrap to multiple lines", () => {
    const source = readFileSync("src/ui/Button.tsx", "utf8");

    expect(source).toMatch(/textAlign:\s*"center"/);
    expect(source).toMatch(/alignSelf:\s*"stretch"/);
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

  it("locks shared text primitive font scaling across platforms", () => {
    const source = readFileSync("src/ui/Text.tsx", "utf8");

    expect(source).toMatch(/allowFontScaling=\{false\}/);
    expect(source).toMatch(/maxFontSizeMultiplier=\{1\}/);
  });

  it("keeps disabled buttons inert", () => {
    const onPress = jest.fn();

    renderWithTheme(<Button disabled label="Accept plan" onPress={onPress} />);

    fireEvent.press(screen.getByRole("button", { name: "Accept plan" }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders data-driven rows through the shared virtualized list primitive", () => {
    renderWithTheme(
      <List
        data={[
          { id: "fitzroy", label: "Fitzroy" },
          { id: "brunswick", label: "Brunswick" },
        ]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.label}</Text>}
      />,
    );

    expect(screen.getByText("Fitzroy")).toBeTruthy();
    expect(screen.getByText("Brunswick")).toBeTruthy();
  });

  it("keeps app screens on shared text primitives instead of direct native Text", () => {
    [
      "src/features/home/HomeScreen.tsx",
      "src/features/profile/ProfileScreen.tsx",
      "src/features/groups/GroupScreen.tsx",
      "app/join/group/[token].tsx",
    ].forEach((path) => {
      const source = readFileSync(path, "utf8");

      expect(source).not.toMatch(
        /import \{[^}]*\bText\b[^}]*\} from "react-native"/,
      );
      expect(source).toMatch(
        /Text as UiText|import \{[^}]*Text[^}]*\} from "@\/ui"/,
      );
    });
  });

  it("uses the shared bottom sheet primitive instead of direct native modals", () => {
    [
      "src/features/quiz/QuizCompletionPrompt.tsx",
      "src/features/quiz/ProfileQuizOverwritePrompt.tsx",
    ].forEach((path) => {
      const source = readFileSync(path, "utf8");

      expect(source).not.toMatch(
        /import \{[^}]*\bModal\b[^}]*\} from "react-native"/,
      );
      expect(source).toMatch(/Sheet/);
    });
  });
});
