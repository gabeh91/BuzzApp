import type { ReactNode, ComponentProps } from "react";
import Animated from "react-native-reanimated";
import { CompactIntro, type TextVariant } from "@/ui";

import { useOnboardingTheme } from "./OnboardingTheme";

type OnboardingMainCardProps = {
  eyebrow: string;
  title: string;
  titleVariant?: TextVariant;
  body?: string | undefined;
  children: ReactNode;
  style?: ComponentProps<typeof Animated.View>["style"];
};

export const OnboardingMainCard = ({
  body,
  children,
  eyebrow,
  title,
  titleVariant = "panelTitle",
  style,
}: OnboardingMainCardProps) => {
  const { styles } = useOnboardingTheme();

  return (
    <Animated.View style={[styles.mainCard, style]}>
      <CompactIntro
        body={body}
        eyebrow={eyebrow}
        title={title}
        titleVariant={titleVariant}
        style={styles.titleStack}
      />
      {children}
    </Animated.View>
  );
};
