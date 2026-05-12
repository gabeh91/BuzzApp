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

  it("renders accessible activities and chats icons", () => {
    render(
      <ThemeProvider>
        <BottomTabIcon color="#66736b" focused={false} name="activities" />
        <BottomTabIcon color="#66736b" focused={false} name="chats" />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Activities tab icon")).toBeTruthy();
    expect(screen.getByLabelText("Chats tab icon")).toBeTruthy();
    expect(screen.queryByLabelText("Unread chats")).toBeNull();
  });

  it("only renders the chats unread dot when unread count is present", () => {
    render(
      <ThemeProvider>
        <BottomTabIcon
          color="#66736b"
          focused={false}
          name="chats"
          unreadCount={2}
        />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Unread chats")).toBeTruthy();
  });
});
