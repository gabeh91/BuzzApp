import {
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

type ScreenProps = ViewProps & {
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
  refreshControl?: ScrollViewProps["refreshControl"];
};

export const Screen = ({
  children,
  contentStyle,
  scroll = true,
  style,
  edges = ["top", "bottom"],
  refreshControl,
  ...viewProps
}: ScreenProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={[styles.screen, style]} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          refreshControl={refreshControl}
          {...viewProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentStyle]} {...viewProps}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      gap: spacing[5],
      padding: spacing[6],
    },
  });
};
