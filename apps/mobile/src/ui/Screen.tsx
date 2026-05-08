import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

type ScreenProps = ViewProps & {
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Screen = ({
  children,
  contentStyle,
  scroll = true,
  style,
  ...viewProps
}: ScreenProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={[styles.screen, style]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
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
