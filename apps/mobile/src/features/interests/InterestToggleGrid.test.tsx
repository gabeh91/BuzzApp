import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { ThemeProvider } from "@/theme/ThemeProvider";

import { InterestToggleGrid } from "./InterestToggleGrid";
import type { BuzzInterest } from "./interestFlow";

const interests: BuzzInterest[] = [
  {
    category: "lifestyle",
    id: "golf",
    name: "Golf",
    slug: "golf",
  },
  {
    category: "lifestyle",
    id: "language-exchange",
    name: "Language Exchange",
    slug: "language-exchange",
  },
];

const renderGrid = () =>
  render(
    <ThemeProvider>
      <InterestToggleGrid
        interests={interests}
        onSelectInterest={jest.fn()}
        selectedInterestId=""
      />
    </ThemeProvider>,
  );

describe("InterestToggleGrid", () => {
  it("uses a stable card height without measuring after render", () => {
    renderGrid();

    const longNameCard = screen.getByRole("button", {
      name: "Language Exchange",
    });
    const shortCard = screen.getByRole("button", { name: "Golf" });

    const longNameCardStyle = StyleSheet.flatten(longNameCard.props.style);
    const shortCardStyle = StyleSheet.flatten(shortCard.props.style);

    expect(longNameCard.props.onLayout).toBeUndefined();
    expect(shortCard.props.onLayout).toBeUndefined();
    expect(shortCardStyle.minHeight).toBe(longNameCardStyle.minHeight);
    expect(shortCardStyle.minHeight).toBeGreaterThan(112);
    expect(screen.getByText("Language Exchange").props.numberOfLines).toBe(
      undefined,
    );
  });
});
