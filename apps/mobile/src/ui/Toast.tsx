import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "@/i18n/I18nProvider";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

import { Text } from "./Text";

const DEFAULT_TOAST_MS = 4500;
const SWIPE_DISMISS_PX = 56;
/** Clearance above the bottom tab bar when placement is bottom. */
const TAB_BAR_CLEARANCE = 72;
/** Max visible toasts per edge; oldest dropped when exceeded. */
const MAX_TOAST_STACK = 5;

const SLIDE_PX = 96;
const ENTER_SPRING = { damping: 17, mass: 0.85, stiffness: 220 };
const ENTER_OPACITY_MS = 200;
const EXIT_SLIDE_MS = 240;
const EXIT_OPACITY_MS = 180;

const TOAST_FOREGROUND = "rgba(255, 255, 255, 0.96)";
const TOAST_BAR_TRACK = "rgba(255, 255, 255, 0.22)";
const TOAST_BAR_FILL = "rgba(255, 255, 255, 0.72)";
const TOAST_DISMISS_PRESSED = "rgba(255, 255, 255, 0.16)";

export type ToastVariant = "success" | "info" | "warning" | "error" | "neutral";
export type ToastPlacement = "top" | "bottom";

type ToastSemantic = "success" | "info" | "warning" | "error";

type ToastPaint = {
  background: string;
};

export type ToastState = {
  durationMs: number;
  id: number;
  message: string;
  placement: ToastPlacement;
  variant: ToastVariant;
};

type ShowToastOptions = {
  durationMs?: number;
  message: string;
  placement?: ToastPlacement;
  variant?: ToastVariant;
};

type ToastContextValue = {
  showToast: (options: ShowToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const resolveSemantic = (variant: ToastVariant): ToastSemantic =>
  variant === "neutral" ? "info" : variant;

const getToastPaint = (theme: BuzzTheme, semantic: ToastSemantic): ToastPaint => {
  const isDark = theme.mode === "dark";

  if (isDark) {
    switch (semantic) {
      case "success":
        return { background: "#1e3330" };
      case "info":
        return { background: "#1a4a6e" };
      case "warning":
        return { background: "#6b3d1f" };
      case "error":
        return { background: "#5c1f1f" };
      default:
        return { background: "#1a4a6e" };
    }
  }

  switch (semantic) {
    case "success":
      return { background: theme.palette.moss };
    case "info":
      return { background: "#1a6fa8" };
    case "warning":
      return { background: theme.palette.clay };
    case "error":
      return { background: "#b42318" };
    default:
      return { background: "#1a6fa8" };
  }
};

const semanticIcon = (semantic: ToastSemantic): ComponentProps<typeof Ionicons>["name"] => {
  switch (semantic) {
    case "success":
      return "checkmark-circle";
    case "info":
      return "information-circle";
    case "warning":
      return "warning";
    case "error":
      return "close-circle";
    default:
      return "information-circle";
  }
};

const slideOffsetForPlacement = (placement: ToastPlacement) =>
  placement === "top" ? -SLIDE_PX : SLIDE_PX;

let toastIdSeq = 0;
const nextToastId = () => {
  toastIdSeq += 1;

  return Date.now() * 1000 + toastIdSeq;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [topQueue, setTopQueue] = useState<ToastState[]>([]);
  const [bottomQueue, setBottomQueue] = useState<ToastState[]>([]);

  const removeToast = useCallback((id: number, placement: ToastPlacement) => {
    if (placement === "top") {
      setTopQueue((q) => q.filter((t) => t.id !== id));
    } else {
      setBottomQueue((q) => q.filter((t) => t.id !== id));
    }
  }, []);

  const showToast = useCallback(
    ({
      message,
      placement = "top",
      variant = "success",
      durationMs = DEFAULT_TOAST_MS,
    }: ShowToastOptions) => {
      const resolvedDuration = Math.max(1200, durationMs);
      const item: ToastState = {
        id: nextToastId(),
        message,
        placement,
        variant,
        durationMs: resolvedDuration,
      };

      if (placement === "top") {
        setTopQueue((q) => [item, ...q].slice(0, MAX_TOAST_STACK));
      } else {
        setBottomQueue((q) => [item, ...q].slice(0, MAX_TOAST_STACK));
      }
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport
        bottomQueue={bottomQueue}
        onRemoveToast={removeToast}
        topQueue={topQueue}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return ctx;
};

function ToastViewport({
  bottomQueue,
  onRemoveToast,
  topQueue,
}: {
  bottomQueue: ToastState[];
  onRemoveToast: (id: number, placement: ToastPlacement) => void;
  topQueue: ToastState[];
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useBuzzTheme();

  const topStackStyles = useMemo(
    () => createStackRootStyles(theme, "top", insets.top, insets.bottom),
    [theme, insets.top, insets.bottom],
  );

  const bottomStackStyles = useMemo(
    () => createStackRootStyles(theme, "bottom", insets.top, insets.bottom),
    [theme, insets.top, insets.bottom],
  );

  const bannerStyles = useMemo(() => createToastBannerStyles(theme), [theme]);

  if (topQueue.length === 0 && bottomQueue.length === 0) {
    return null;
  }

  return (
    <>
      {topQueue.length > 0 ? (
        <View pointerEvents="box-none" style={topStackStyles.stackRoot}>
          {topQueue.map((toast, index) => (
            <ToastBanner
              key={toast.id}
              bannerStyles={bannerStyles}
              durationMs={toast.durationMs}
              isNewestInStack={index === 0}
              message={toast.message}
              onDismissComplete={() => onRemoveToast(toast.id, "top")}
              placement="top"
              toastId={toast.id}
              variant={toast.variant}
            />
          ))}
        </View>
      ) : null}
      {bottomQueue.length > 0 ? (
        <View pointerEvents="box-none" style={bottomStackStyles.stackRoot}>
          {bottomQueue.map((toast, index) => (
            <ToastBanner
              key={toast.id}
              bannerStyles={bannerStyles}
              durationMs={toast.durationMs}
              isNewestInStack={index === 0}
              message={toast.message}
              onDismissComplete={() => onRemoveToast(toast.id, "bottom")}
              placement="bottom"
              toastId={toast.id}
              variant={toast.variant}
            />
          ))}
        </View>
      ) : null}
    </>
  );
}

type ToastBannerStyles = ReturnType<typeof createToastBannerStyles>;

function ToastBanner({
  bannerStyles,
  durationMs,
  isNewestInStack,
  message,
  onDismissComplete,
  placement,
  toastId,
  variant,
}: {
  bannerStyles: ToastBannerStyles;
  durationMs: number;
  isNewestInStack: boolean;
  message: string;
  onDismissComplete: () => void;
  placement: ToastPlacement;
  toastId: number;
  variant: ToastVariant;
}) {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const semantic = resolveSemantic(variant);
  const paint = useMemo(() => getToastPaint(theme, semantic), [theme, semantic]);
  const iconName = semanticIcon(semantic);

  const exitingRef = useRef(false);
  const progressAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = undefined;
    }
  }, []);

  const enterOffset = slideOffsetForPlacement(placement);
  const translateY = useRef(new Animated.Value(enterOffset)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(1)).current;

  const exitThenRemove = useCallback(() => {
    if (exitingRef.current) {
      return;
    }
    exitingRef.current = true;
    clearDismissTimer();
    progressAnimRef.current?.stop();

    const exitY = slideOffsetForPlacement(placement);

    Animated.parallel([
      Animated.timing(translateY, {
        duration: EXIT_SLIDE_MS,
        toValue: exitY,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        duration: EXIT_OPACITY_MS,
        toValue: 0,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onDismissComplete();
    });
  }, [clearDismissTimer, onDismissComplete, opacity, placement, translateY]);

  const exitThenRemoveRef = useRef(exitThenRemove);
  exitThenRemoveRef.current = exitThenRemove;

  const panHandlers = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (
          _event: GestureResponderEvent,
          gesture: PanResponderGestureState,
        ) => {
          const { dx, dy } = gesture;

          return Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 0.85;
        },
        onPanResponderRelease: (
          _event: GestureResponderEvent,
          gesture: PanResponderGestureState,
        ) => {
          const { dy } = gesture;

          if (placement === "top" && dy < -SWIPE_DISMISS_PX) {
            exitThenRemove();
          } else if (placement === "bottom" && dy > SWIPE_DISMISS_PX) {
            exitThenRemove();
          }
        },
      }).panHandlers,
    [exitThenRemove, placement],
  );

  useEffect(() => {
    dismissTimerRef.current = setTimeout(() => {
      exitThenRemoveRef.current();
    }, durationMs);

    return () => {
      clearDismissTimer();
    };
  }, [clearDismissTimer, durationMs]);

  useEffect(() => {
    translateY.setValue(enterOffset);
    opacity.setValue(0);
    progress.setValue(1);

    Animated.parallel([
      Animated.spring(translateY, {
        ...ENTER_SPRING,
        toValue: 0,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        duration: ENTER_OPACITY_MS,
        toValue: 1,
        useNativeDriver: false,
      }),
    ]).start();

    const progressAnim = Animated.timing(progress, {
      duration: durationMs,
      toValue: 0,
      useNativeDriver: true,
    });
    progressAnimRef.current = progressAnim;
    progressAnim.start();

    return () => {
      progressAnim.stop();
      progressAnimRef.current = null;
    };
  }, [durationMs, enterOffset, opacity, placement, progress, translateY]);

  const dismissLabel = LL.common.dismiss();
  const dismissHint =
    placement === "top" ? LL.toast.dismissHintTop() : LL.toast.dismissHintBottom();

  const scaleStyle = {
    transform: [{ scaleX: progress }],
    transformOrigin: "left" as const,
  };

  const shellAnimatedStyle = {
    opacity,
    transform: [{ translateY }],
  };

  return (
    <Animated.View
      style={[bannerStyles.animShell, shellAnimatedStyle]}
      {...panHandlers}
    >
      <View style={[bannerStyles.chip, { backgroundColor: paint.background }]}>
        <View style={bannerStyles.bodyRow}>
          <View style={bannerStyles.lead}>
            <Ionicons
              accessibilityElementsHidden
              color={TOAST_FOREGROUND}
              importantForAccessibility="no-hide-descendants"
              name={iconName}
              size={24}
            />
          </View>
          <View style={bannerStyles.messageWrap}>
            <Text
              accessibilityLiveRegion="polite"
              numberOfLines={3}
              style={bannerStyles.message}
              variant="body"
            >
              {message}
            </Text>
          </View>
          <Pressable
            accessibilityHint={dismissHint}
            accessibilityLabel={dismissLabel}
            accessibilityRole="button"
            hitSlop={10}
            onPress={exitThenRemove}
            style={({ pressed }) => [
              bannerStyles.dismissPressable,
              pressed ? bannerStyles.dismissPressablePressed : null,
            ]}
          >
            <Ionicons color={TOAST_FOREGROUND} name="close" size={22} />
          </Pressable>
        </View>

        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={bannerStyles.timeoutShell}
          testID={
            isNewestInStack
              ? "toast-timeout-indicator"
              : `toast-timeout-indicator-${toastId}`
          }
        >
          <View style={[bannerStyles.timeoutTrack, { backgroundColor: TOAST_BAR_TRACK }]} />
          <Animated.View
            style={[
              bannerStyles.timeoutFill,
              { backgroundColor: TOAST_BAR_FILL },
              scaleStyle,
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const createStackRootStyles = (
  theme: BuzzTheme,
  placement: ToastPlacement,
  topInset: number,
  bottomInset: number,
) => {
  const { spacing } = theme;
  const isTop = placement === "top";
  const edgeInset = spacing[3];

  return StyleSheet.create({
    stackRoot: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      elevation: 28,
      gap: spacing[2],
      justifyContent: isTop ? "flex-start" : "flex-end",
      paddingBottom: isTop ? 0 : bottomInset + TAB_BAR_CLEARANCE,
      paddingHorizontal: spacing[5],
      paddingTop: isTop ? topInset + edgeInset : 0,
      zIndex: 20000,
    },
  });
};

const createToastBannerStyles = (theme: BuzzTheme) => {
  const { radii, shadows, spacing } = theme;

  return StyleSheet.create({
    animShell: {
      alignSelf: "center",
      maxWidth: 420,
      width: "100%",
    },
    chip: {
      borderRadius: radii.lg,
      overflow: "hidden",
      width: "100%",
      ...shadows.card,
    },
    bodyRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing[3],
      minHeight: 52,
      paddingBottom: spacing[3],
      paddingLeft: spacing[4],
      paddingRight: spacing[1],
      paddingTop: spacing[3],
    },
    lead: {
      justifyContent: "center",
    },
    messageWrap: {
      flexBasis: 0,
      flexGrow: 1,
      flexShrink: 1,
      justifyContent: "center",
      minWidth: 0,
    },
    message: {
      color: TOAST_FOREGROUND,
      fontSize: theme.fontSizes.md,
      fontWeight: "600",
      lineHeight: theme.lineHeights.body,
      textAlign: "left",
    },
    dismissPressable: {
      alignItems: "center",
      borderRadius: radii.full,
      height: 44,
      justifyContent: "center",
      width: 44,
    },
    dismissPressablePressed: {
      backgroundColor: TOAST_DISMISS_PRESSED,
    },
    timeoutShell: {
      height: 4,
      overflow: "hidden",
      position: "relative",
      width: "100%",
    },
    timeoutTrack: {
      ...StyleSheet.absoluteFillObject,
    },
    timeoutFill: {
      bottom: 0,
      left: 0,
      position: "absolute",
      top: 0,
      width: "100%",
    },
  });
};
