import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { Platform, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { FullWindowOverlay } from "react-native-screens";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

/** Renders the modal above React Navigation / native-stack layers on iOS (gorhom #832). */
function IosFullWindowSheetContainer({ children }: PropsWithChildren) {
  return <FullWindowOverlay>{children}</FullWindowOverlay>;
}

/** Without at least one snap detent, dynamic sizing can yield no height until layout settles. */
const DEFAULT_SNAP_POINTS: Array<number | string> = ["52%", "92%"];

type SheetProps = {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  dismissible?: boolean;
  /** Bump when presenting again so the native modal remounts (avoids gorhom stuck-after-dismiss). */
  remountKey?: number;
  onDismiss?: () => void;
  snapPoints?: Array<number | string>;
  testID?: string;
  visible: boolean;
};

export const Sheet = ({
  children,
  contentStyle,
  dismissible = true,
  remountKey = 0,
  onDismiss,
  snapPoints,
  testID,
  visible,
}: SheetProps) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const resolvedSnapPoints = snapPoints ?? DEFAULT_SNAP_POINTS;

  useEffect(() => {
    if (visible) {
      // Defer until after layout so the modal ref is ready and the first
      // `present()` reliably runs after mount (gorhom uses rAF internally too).
      const id = requestAnimationFrame(() => {
        sheetRef.current?.present();
      });
      return () => cancelAnimationFrame(id);
    }

    sheetRef.current?.dismiss();
  }, [visible]);

  const handleClose = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.34}
        pressBehavior={dismissible ? "close" : "none"}
      />
    ),
    [dismissible],
  );

  return (
    <BottomSheetModal
      key={remountKey}
      ref={sheetRef}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      enableDynamicSizing={false}
      enablePanDownToClose={dismissible}
      handleIndicatorStyle={styles.handleIndicator}
      onDismiss={handleClose}
      snapPoints={resolvedSnapPoints}
      {...(Platform.OS === "ios"
        ? { containerComponent: IosFullWindowSheetContainer }
        : {})}
    >
      <BottomSheetView style={[styles.content, contentStyle]} testID={testID}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    background: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
    },
    content: {
      paddingHorizontal: spacing[4],
      paddingBottom: spacing[6],
    },
    handleIndicator: {
      backgroundColor: colors.border,
      width: 42,
    },
  });
};
