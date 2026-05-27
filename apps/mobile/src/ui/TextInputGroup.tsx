import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Text } from "./Text";

const LABEL_TIMING_MS = 200;

export type TextInputGroupProps = Omit<
  TextInputProps,
  "placeholder" | "style" | "placeholderTextColor"
> & {
  label: string;
  description?: string | undefined;
  labelBehavior?: "auto" | "alwaysFloating" | undefined;
  /** Kept for existing callers; labels now float inside the field instead of masking the border. */
  labelBackdropColor?: string | undefined;
  containerStyle?: StyleProp<ViewStyle> | undefined;
  inputStyle?: StyleProp<TextStyle> | undefined;
};

export const TextInputGroup = ({
  description,
  label,
  labelBehavior = "auto",
  labelBackdropColor,
  containerStyle,
  inputStyle,
  value = "",
  onBlur,
  onFocus,
  editable = true,
  ...textInputProps
}: TextInputGroupProps) => {
  const { theme } = useBuzzTheme();
  const styles = useMemo(
    () => createStyles(theme, labelBackdropColor ?? theme.colors.background),
    [labelBackdropColor, theme],
  );
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const shouldAlwaysFloat =
    labelBehavior === "alwaysFloating" || textInputProps.multiline === true;
  const isFloating = shouldAlwaysFloat || focused || value.length > 0;
  const labelProgress = useSharedValue(
    isFloating ? 1 : 0,
  );

  const restingLabelColor = theme.colors.textMuted;
  const floatingLabelColor = theme.colors.text;

  useEffect(() => {
    labelProgress.value = withTiming(isFloating ? 1 : 0, {
      duration: LABEL_TIMING_MS,
    });
  }, [isFloating, labelProgress]);

  const labelWrapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(labelProgress.value, [0, 1], [0, -2]),
      },
      {
        translateY: interpolate(labelProgress.value, [0, 1], [21, 7]),
      },
    ],
  }));

  const labelTextAnimatedStyle = useAnimatedStyle(
    () => ({
      color: interpolateColor(
        labelProgress.value,
        [0, 1],
        [restingLabelColor, floatingLabelColor],
      ),
      fontSize: interpolate(labelProgress.value, [0, 1], [16, 13]),
      lineHeight: interpolate(labelProgress.value, [0, 1], [24, 18]),
    }),
    [floatingLabelColor, restingLabelColor],
  );

  return (
    <View style={[styles.root, containerStyle]}>
      <Pressable
        accessibilityRole="none"
        disabled={!editable}
        onPress={() => {
          inputRef.current?.focus();
        }}
        style={styles.pressable}
      >
        <View style={[styles.field, focused ? styles.fieldFocused : null]}>
          <Animated.View
            pointerEvents="none"
            style={[styles.labelWrap, labelWrapAnimatedStyle]}
          >
            <View style={styles.labelMask}>
              <Animated.Text
                allowFontScaling={false}
                maxFontSizeMultiplier={1}
                style={[styles.label, labelTextAnimatedStyle]}
              >
                {label}
              </Animated.Text>
            </View>
          </Animated.View>
          <TextInput
            {...textInputProps}
            accessibilityLabel={textInputProps.accessibilityLabel ?? label}
            editable={editable}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            placeholder=""
            ref={inputRef}
            style={[
              styles.input,
              isFloating ? styles.inputFloating : styles.inputResting,
              inputStyle,
            ]}
            textBreakStrategy="simple"
            underlineColorAndroid="transparent"
            value={value}
          />
        </View>
      </Pressable>
      {description ? (
        <Text style={styles.description} variant="body">
          {description}
        </Text>
      ) : null}
    </View>
  );
};

const createStyles = (theme: BuzzTheme, _labelBackdropColor: string) => {
  const { colors, fontSizes, lineHeights, radii, spacing, borderWidths } = theme;
  return StyleSheet.create({
    root: {
      gap: spacing[2],
    },
    pressable: {
      width: "100%",
    },
    field: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.sm,
      borderWidth: borderWidths.hairline,
      minHeight: 68,
      position: "relative",
    },
    fieldFocused: {
      borderColor: colors.textMuted,
      borderWidth: borderWidths.focus,
    },
    labelWrap: {
      left: spacing[4],
      position: "absolute",
      top: 0,
      zIndex: 2,
    },
    labelMask: {
      alignSelf: "flex-start",
    },
    label: {
      ...theme.fontStyles.body,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.body,
    },
    input: {
      ...theme.fontStyles.body,
      color: colors.text,
      flex: 1,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.body,
      minHeight: 68,
      paddingBottom: spacing[2],
      paddingHorizontal: spacing[4],
    },
    inputResting: {
      paddingTop: spacing[4],
    },
    inputFloating: {
      paddingTop: spacing[7],
    },
    description: {
      paddingHorizontal: spacing[1],
    },
  });
};
