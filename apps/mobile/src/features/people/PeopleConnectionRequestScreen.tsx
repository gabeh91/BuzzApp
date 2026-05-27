import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import {
  SCREEN_CONTENT_GUTTER_SPACING,
  type BuzzTheme,
} from "@/theme/tokens";
import {
  Avatar,
  BackHeader,
  Button,
  Panel,
  Screen,
  Text as UiText,
  TextInputGroup,
} from "@/ui";

import { SharedInterestRadioList } from "./SharedInterestRadioList";
import { sendConnectionRequestToSupabase } from "./peopleFeedClient";

type RawPeopleConnectParams = {
  age?: string | string[];
  displayName?: string | string[];
  firstName?: string | string[];
  profileId?: string | string[];
  profilePhotoUrl?: string | string[];
  sharedInterests?: string | string[];
};

type ConnectMode = "hi" | "activity";
type SendStatus = "idle" | "sending" | "error";

type RouteSharedInterest = {
  id: string;
  name: string;
  slug?: string;
};

type PeopleConnectionRequestScreenProps = {
  params: RawPeopleConnectParams;
};

const getParam = (value: string | string[] | undefined): string | undefined => {
  const candidate = Array.isArray(value) ? value[0] : value;

  return candidate?.trim() || undefined;
};

const parseSharedInterests = (
  value: string | string[] | undefined,
): RouteSharedInterest[] => {
  const raw = getParam(value);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const record = item as Record<string, unknown>;
        const id = typeof record.id === "string" ? record.id : undefined;
        const name =
          typeof record.name === "string" ? record.name.trim() : undefined;
        const slug =
          typeof record.slug === "string" ? record.slug.trim() : undefined;

        if (!id || !name) {
          return null;
        }

        return slug ? { id, name, slug } : { id, name };
      })
      .filter((item): item is RouteSharedInterest => Boolean(item));
  } catch {
    return [];
  }
};

const ACTIVITY_REVEAL_DURATION_MS = 280;
const ACTIVITY_REVEAL_SLIDE_PX = 8;

type ActivityInterestRevealProps = {
  expanded: boolean;
  interests: RouteSharedInterest[];
  onSelect: (interestId: string) => void;
  selectedId: string;
  title: string;
};

const ActivityInterestReveal = ({
  expanded,
  interests,
  onSelect,
  selectedId,
  title,
}: ActivityInterestRevealProps) => {
  const { theme } = useBuzzTheme();
  const styles = useMemo(() => createActivityRevealStyles(theme), [theme]);
  const [mounted, setMounted] = useState(expanded);
  const progress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    if (expanded) {
      setMounted(true);
      return;
    }

    const timer = setTimeout(() => {
      setMounted(false);
    }, ACTIVITY_REVEAL_DURATION_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [expanded]);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, {
      duration: ACTIVITY_REVEAL_DURATION_MS,
      easing: expanded ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
    });
  }, [expanded, progress]);

  const revealStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [ACTIVITY_REVEAL_SLIDE_PX, 0],
        ),
      },
    ],
  }));

  if (!mounted) {
    return null;
  }

  return (
    <Animated.View
      accessibilityElementsHidden={!expanded}
      importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}
      pointerEvents={expanded ? "auto" : "none"}
      style={[styles.wrap, revealStyle]}
    >
      <View style={styles.divider} />
      <View style={styles.body}>
        <UiText variant="panelTitle">{title}</UiText>
        <SharedInterestRadioList
          interests={interests}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      </View>
    </Animated.View>
  );
};

const createActivityRevealStyles = (theme: BuzzTheme) => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    wrap: {
      marginTop: spacing[4],
    },
    divider: {
      backgroundColor: colors.border,
      height: 1,
      marginBottom: spacing[4],
    },
    body: {
      flexDirection: "column",
      gap: spacing[3],
    },
  });
};

const createHomeSentRoute = ({
  firstName,
  profileId,
}: {
  firstName: string;
  profileId: string;
}) => {
  const query = new URLSearchParams({
    connectionSentName: firstName,
    connectionSentProfileId: profileId,
  });

  return `${routes.home}?${query.toString()}` as const;
};

export const PeopleConnectionRequestScreen = ({
  params,
}: PeopleConnectionRequestScreenProps) => {
  const router = useRouter();
  const { requireAuth } = useBuzzAuth();
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, insets.bottom),
    [theme, insets.bottom],
  );
  const profileId = getParam(params.profileId);
  const firstName = getParam(params.firstName) ?? LL.peopleConnect.fallbackName();
  const displayName = getParam(params.displayName) ?? firstName;
  const age = getParam(params.age);
  const profilePhotoUrl = getParam(params.profilePhotoUrl);
  const sharedInterests = useMemo(
    () => parseSharedInterests(params.sharedInterests),
    [params.sharedInterests],
  );
  const [mode, setMode] = useState<ConnectMode>("hi");
  const [selectedInterestId, setSelectedInterestId] = useState(
    sharedInterests[0]?.id ?? "",
  );
  const [note, setNote] = useState("");
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const selectedInterest =
    sharedInterests.find((interest) => interest.id === selectedInterestId) ??
    sharedInterests[0];
  const avatarInitial = firstName.slice(0, 1).toUpperCase();
  const metaLabel = age ? `${displayName}, ${age}` : displayName;
  const canSuggestActivity = sharedInterests.length > 0;

  const buildMessage = () => {
    const trimmedNote = note.trim();

    if (mode === "activity" && selectedInterest) {
      const suggestion = LL.peopleConnect.defaultActivityMessage({
        interest: selectedInterest.name,
      });

      return trimmedNote ? `${suggestion} ${trimmedNote}` : suggestion;
    }

    return trimmedNote || undefined;
  };

  const sendRequest = async () => {
    if (!profileId || sendStatus === "sending") {
      return;
    }

    await requireAuth("chat", async () => {
      setSendStatus("sending");

      try {
        const message = buildMessage();

        await sendConnectionRequestToSupabase(
          message
            ? { message, recipientId: profileId }
            : { recipientId: profileId },
        );
        router.replace(createHomeSentRoute({ firstName, profileId }));
      } catch {
        setSendStatus("error");
      }
    });
  };

  const chooseActivityMode = () => {
    setMode("activity");

    if (!selectedInterestId && sharedInterests[0]) {
      setSelectedInterestId(sharedInterests[0].id);
    }
  };

  return (
    <Screen
      contentStyle={styles.content}
      edges={["top"]}
      stickyHeader={
        <BackHeader
          backLabel={LL.common.back()}
          onBack={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }

            router.replace(routes.home);
          }}
          right={<UiText variant="eyebrow">{LL.peopleConnect.eyebrow()}</UiText>}
        />
      }
    >
      <Panel variant="surface" style={styles.profilePanel}>
        <View style={styles.profileHeader}>
          <Avatar
            accessibilityLabel={`${displayName} avatar`}
            fallbackInitial={avatarInitial}
            size={64}
            uri={profilePhotoUrl}
          />
          <View style={styles.profileCopy}>
            <UiText variant="eyebrow">{LL.peopleConnect.profileLabel()}</UiText>
            <UiText variant="panelTitle">{metaLabel}</UiText>
          </View>
        </View>

        <UiText variant="title">
          {LL.peopleConnect.title({ name: firstName })}
        </UiText>
        <UiText variant="body">{LL.peopleConnect.body()}</UiText>
      </Panel>

      <View style={styles.optionGrid}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setMode("hi")}
          style={[
            styles.optionCard,
            mode === "hi" ? styles.selectedOptionCard : null,
          ]}
        >
          <UiText style={styles.optionTitle}>
            {LL.peopleConnect.justHi.title()}
          </UiText>
          <UiText style={styles.optionBody}>
            {LL.peopleConnect.justHi.body()}
          </UiText>
        </Pressable>

        <View
          style={[
            styles.optionCard,
            mode === "activity" ? styles.selectedOptionCard : null,
            !canSuggestActivity ? styles.disabledOptionCard : null,
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: mode === "activity" }}
            disabled={!canSuggestActivity}
            onPress={chooseActivityMode}
            style={styles.optionHeader}
          >
            <UiText style={styles.optionTitle}>
              {LL.peopleConnect.activity.title()}
            </UiText>
            <UiText style={styles.optionBody}>
              {canSuggestActivity
                ? LL.peopleConnect.activity.body()
                : LL.peopleConnect.noSharedInterests()}
            </UiText>
          </Pressable>

          {canSuggestActivity ? (
            <ActivityInterestReveal
              expanded={mode === "activity"}
              interests={sharedInterests}
              onSelect={setSelectedInterestId}
              selectedId={selectedInterest?.id ?? ""}
              title={LL.peopleConnect.sharedInterestTitle()}
            />
          ) : null}
        </View>
      </View>

      <Panel variant="plain" style={styles.messagePanel}>
        <TextInputGroup
          description={LL.peopleConnect.messagePlaceholder()}
          inputStyle={styles.messageInput}
          label={LL.peopleConnect.messageTitle()}
          multiline
          onChangeText={setNote}
          textAlignVertical="top"
          value={note}
        />
      </Panel>

      {sendStatus === "error" ? (
        <UiText variant="feedback">{LL.peopleConnect.failed()}</UiText>
      ) : null}

      <Button
        disabled={!profileId || sendStatus === "sending"}
        label={
          sendStatus === "sending"
            ? LL.peopleConnect.sending()
            : LL.peopleConnect.send()
        }
        onPress={() => {
          void sendRequest();
        }}
      />
    </Screen>
  );
};

const createStyles = (theme: BuzzTheme, bottomInset: number) => {
  const { borderWidths, colors, fontSizes, lineHeights, radii, spacing } = theme;

  return StyleSheet.create({
    content: {
      flexGrow: 1,
      gap: spacing[5],
      paddingBottom: bottomInset + spacing[8],
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
      paddingTop: spacing[SCREEN_CONTENT_GUTTER_SPACING],
    },
    profilePanel: {
      gap: spacing[4],
    },
    profileHeader: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing[3],
    },
    profileCopy: {
      flex: 1,
      gap: spacing[1],
    },
    optionGrid: {
      gap: spacing[3],
    },
    optionCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: 1,
      padding: spacing[5],
    },
    optionHeader: {
      gap: spacing[2],
    },
    selectedOptionCard: {
      backgroundColor: colors.surface,
      borderColor: colors.brand,
      borderWidth: borderWidths.focus,
    },
    disabledOptionCard: {
      opacity: 0.55,
    },
    optionTitle: {
      color: colors.brand,
      fontSize: fontSizes.lg,
      ...theme.fontStyles.display,
      lineHeight: lineHeights.tight,
    },
    optionBody: {
      color: colors.textMuted,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body,
    },
    messagePanel: {
      gap: spacing[3],
    },
    messageInput: {
      minHeight: 92,
      textAlignVertical: "top",
    },
  });
};
