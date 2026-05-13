import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button } from "@/ui";

import type { BuzzInterest } from "@/features/interests/interestFlow";

type InterestToggleGridProps = {
  interests: BuzzInterest[];
  onSelectInterest: (interest: BuzzInterest) => void;
  /** Empty string when nothing is selected. */
  selectedInterestId: string;
};

export const InterestToggleGrid = ({
  interests,
  onSelectInterest,
  selectedInterestId,
}: InterestToggleGridProps) => {
  const { theme } = useBuzzTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.grid}>
      {interests.map((interest) => {
        const isSelected =
          selectedInterestId.length > 0 && selectedInterestId === interest.id;

        return (
          <Button
            key={interest.id}
            label={interest.name}
            onPress={() => onSelectInterest(interest)}
            variant={isSelected ? "tonal" : "bordered"}
          />
        );
      })}
    </View>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[2],
    },
  });
};
