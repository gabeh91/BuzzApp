import {
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import type { ReactNode } from "react";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Text, type TextVariant } from "./Text";

type CompactIntroProps = ViewProps & {
  eyebrow: ReactNode;
  title: ReactNode;
  titleVariant?: TextVariant;
  body?: ReactNode;
  bodyVariant?: TextVariant;
  bodyStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};

export const CompactIntro = ({
  body,
  bodyStyle,
  bodyVariant = "body",
  eyebrow,
  title,
  titleVariant = "panelTitle",
  style,
  ...viewProps
}: CompactIntroProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);

  return (
    <View {...viewProps} style={[styles.container, style]}>
      <Text variant="eyebrow">{eyebrow}</Text>
      <Text variant={titleVariant}>{title}</Text>
      {body ? (
        <Text style={bodyStyle} variant={bodyVariant}>
          {body}
        </Text>
      ) : null}
    </View>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    container: {
      gap: spacing[2],
    },
  });
};
