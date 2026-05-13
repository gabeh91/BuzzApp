import { cleanup } from "@testing-library/react-native";
import type { ReactNode, Ref } from "react";

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

jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View } = require("react-native");

  const BottomSheetModal = React.forwardRef(
    (
      props: {
        children?: ReactNode;
        onDismiss?: () => void;
      },
      ref: Ref<{ dismiss: () => void; present: () => void }>,
    ) => {
      React.useImperativeHandle(ref, () => ({
        dismiss: () => props.onDismiss?.(),
        present: () => undefined,
      }));

      return React.createElement(View, null, props.children);
    },
  );

  return {
    BottomSheetBackdrop: (props: { children?: ReactNode }) =>
      React.createElement(View, null, props.children),
    BottomSheetModal,
    BottomSheetModalProvider: ({ children }: { children?: ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    BottomSheetView: (props: { children?: ReactNode }) =>
      React.createElement(View, null, props.children),
  };
});

afterEach(cleanup);
