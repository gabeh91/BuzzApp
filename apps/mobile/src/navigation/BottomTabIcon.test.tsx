import { render, screen } from "@testing-library/react-native";

import { ThemeProvider } from "@/theme/ThemeProvider";
import { BottomTabIcon } from "./BottomTabIcon";

describe("BottomTabIcon", () => {
  it("renders an accessible discover icon", () => {
    render(
      <ThemeProvider>
        <BottomTabIcon color="#15251f" focused name="discover" />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Discover tab icon")).toBeTruthy();
  });

  it("renders an accessible profile icon", () => {
    render(
      <ThemeProvider>
        <BottomTabIcon color="#66736b" focused={false} name="profile" />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Profile tab icon")).toBeTruthy();
  });
});
