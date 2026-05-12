import { cleanup } from "@testing-library/react-native";

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MockIcon = ({ style }: { style?: unknown }) =>
    React.createElement(View, { accessibilityRole: "image", style });

  return {
    FontAwesome: MockIcon,
    Ionicons: MockIcon,
  };
});

jest.mock("@shopify/flash-list", () => {
  const React = require("react");
  const { FlatList } = require("react-native");

  const FlashList = React.forwardRef(
    (
      props: {
        renderItem?: (info: {
          item: unknown;
          index: number;
          target: string;
        }) => React.ReactElement | null;
      },
      ref: unknown,
    ) => {
      const renderItem = props.renderItem
        ? (info: { item: unknown; index: number }) =>
            props.renderItem?.({ ...info, target: "Cell" })
        : undefined;

      return React.createElement(FlatList, { ...props, ref, renderItem });
    },
  );

  return {
    FlashList,
    RenderTargetOptions: {
      Cell: "Cell",
      Measurement: "Measurement",
      StickyHeader: "StickyHeader",
    },
  };
});

afterEach(cleanup);
