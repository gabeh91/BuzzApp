import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import {
  SCREEN_CONTENT_GUTTER_SPACING,
  type BuzzTheme,
} from "@/theme/tokens";
import { Avatar, BackHeader, Button, Panel, Screen, Text as UiText } from "@/ui";

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

        <Pressable
          accessibilityRole="button"
          disabled={!canSuggestActivity}
          onPress={chooseActivityMode}
          style={[
            styles.optionCard,
            mode === "activity" ? styles.selectedOptionCard : null,
            !canSuggestActivity ? styles.disabledOptionCard : null,
          ]}
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
      </View>

      {mode === "activity" && canSuggestActivity ? (
        <Panel variant="muted" style={styles.activityPanel}>
          <UiText variant="panelTitle">
            {LL.peopleConnect.sharedInterestTitle()}
          </UiText>
          <View style={styles.interestGrid}>
            {sharedInterests.map((interest) => (
              <Button
                key={interest.id}
                label={interest.name}
                onPress={() => setSelectedInterestId(interest.id)}
                variant={
                  interest.id === selectedInterest?.id ? "tonal" : "bordered"
                }
              />
            ))}
          </View>
        </Panel>
      ) : null}

      <Panel variant="plain" style={styles.messagePanel}>
        <UiText variant="panelTitle">{LL.peopleConnect.messageTitle()}</UiText>
        <TextInput
          multiline
          onChangeText={setNote}
          placeholder={LL.peopleConnect.messagePlaceholder()}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.messageInput}
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
  const { colors, fontSizes, lineHeights, radii, spacing } = theme;

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
      gap: spacing[2],
      padding: spacing[5],
    },
    selectedOptionCard: {
      backgroundColor: colors.warningSoft,
      borderColor: colors.warning,
    },
    disabledOptionCard: {
      opacity: 0.55,
    },
    optionTitle: {
      color: colors.brand,
      fontSize: fontSizes.lg,
      fontWeight: "900",
      lineHeight: lineHeights.tight,
    },
    optionBody: {
      color: colors.textMuted,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body,
    },
    activityPanel: {
      gap: spacing[4],
    },
    interestGrid: {
      gap: spacing[3],
    },
    messagePanel: {
      gap: spacing[3],
    },
    messageInput: {
      color: colors.text,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body,
      minHeight: 92,
      padding: 0,
      textAlignVertical: "top",
    },
  });
};
