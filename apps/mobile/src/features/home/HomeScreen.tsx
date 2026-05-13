import { useLocalSearchParams, useRouter } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { createCityContextFallback } from "@/features/city/cityContext";
import { ActivateInterestFab } from "@/features/interests/ActivateInterestFab";
import { InterestToggleGrid } from "@/features/interests/InterestToggleGrid";
import { useActivateInterestActions } from "@/features/interests/useActivateInterestActions";
import { PeopleMatchCard } from "@/features/people/PeopleMatchCard";
import type { PeopleMatch } from "@/features/people/peopleFeed";
import { loadPeopleMatchesFromSupabase } from "@/features/people/peopleFeedClient";
import { useQuiz } from "@/features/quiz/QuizProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import { spacing, type BuzzTheme } from "@/theme/tokens";
import {
  Button,
  Header,
  HeroPanel,
  List,
  Panel,
  Screen,
  Sheet,
  Text as UiText,
  type ListRenderItem,
} from "@/ui";

type PeopleFeedStatus = "loading" | "ready" | "refreshing" | "error";
type ConnectionRequestStatus = "idle" | "sending" | "sent" | "error";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getSearchParam = (
  value: string | string[] | undefined,
): string | undefined => {
  const candidate = Array.isArray(value) ? value[0] : value;

  return candidate?.trim() || undefined;
};

const createPeopleConnectRoute = (person: PeopleMatch) => {
  const query = new URLSearchParams({
    displayName: person.displayName,
    firstName: person.firstName,
    sharedInterests: JSON.stringify(
      person.sharedInterests.map((interest) => ({
        id: interest.id,
        name: interest.name,
        slug: interest.slug,
      })),
    ),
  });

  if (person.age) {
    query.set("age", String(person.age));
  }

  if (person.profilePhotoUrl) {
    query.set("profilePhotoUrl", person.profilePhotoUrl);
  }

  return `${routes.peopleConnect(person.profileId)}?${query.toString()}` as const;
};

export const HomeScreen = () => {
  const router = useRouter();
  const routeParams = useLocalSearchParams<{
    connectionSentName?: string | string[];
    connectionSentProfileId?: string | string[];
  }>();
  const { theme } = useBuzzTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.bottom), [theme, insets.bottom]);
  const { LL } = useI18n();
  const { requireAuth, user } = useBuzzAuth();
  const {
    activationBusy,
    confirmActivate,
    handleSelectInterest,
    interests,
    selectedInterest,
  } = useActivateInterestActions();
  const [sheet, setSheet] = useState<"confirm" | "pick" | null>(null);
  const [sheetRemountKey, setSheetRemountKey] = useState(0);
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });
  const { traits } = useQuiz();
  const [peopleFeedStatus, setPeopleFeedStatus] =
    useState<PeopleFeedStatus>("loading");
  const [peopleMatches, setPeopleMatches] = useState<PeopleMatch[]>([]);
  const [connectionStatuses, setConnectionStatuses] = useState<
    Record<string, ConnectionRequestStatus>
  >({});
  const connectionSentName = getSearchParam(routeParams.connectionSentName);
  const connectionSentProfileId = getSearchParam(
    routeParams.connectionSentProfileId,
  );
  const selectedInterestId = selectedInterest?.id;
  const selectedInterestSlug = selectedInterest?.slug;
  const selectedInterestIds = useMemo(
    () =>
      selectedInterestId && uuidPattern.test(selectedInterestId)
        ? [selectedInterestId]
        : [],
    [selectedInterestId],
  );
  const selectedInterestSlugs = useMemo(
    () => (selectedInterestSlug ? [selectedInterestSlug] : []),
    [selectedInterestSlug],
  );
  const cityTagsKey = traits.cityTags.join("|");
  const lifestyleTagsKey = traits.lifestyleTags.join("|");
  const peopleQuizTraits = useMemo(
    () => ({
      activityIntent: traits.activityIntent,
      availability: traits.availability,
      cityTags: cityTagsKey ? cityTagsKey.split("|") : [],
      energy: traits.energy,
      lifestyleTags: lifestyleTagsKey ? lifestyleTagsKey.split("|") : [],
      planning: traits.planning,
      socialStyle: traits.socialStyle,
    }),
    [
      traits.activityIntent,
      traits.availability,
      cityTagsKey,
      traits.energy,
      lifestyleTagsKey,
      traits.planning,
      traits.socialStyle,
    ],
  );

  const loadPeopleForDiscover = useCallback(async () => {
    return loadPeopleMatchesFromSupabase({
      cityId: cityContext.city.id,
      cityName: cityContext.city.name,
      interestIds: selectedInterestIds,
      interestSlugs: selectedInterestSlugs,
      limitCount: 8,
      quizTraits: peopleQuizTraits,
    });
  }, [
    cityContext.city.id,
    cityContext.city.name,
    peopleQuizTraits,
    selectedInterestIds,
    selectedInterestSlugs,
  ]);

  useEffect(() => {
    let active = true;

    const loadPeople = async () => {
      setPeopleFeedStatus("loading");

      try {
        const result = await loadPeopleForDiscover();

        if (!active) {
          return;
        }

        setPeopleMatches(result.peopleMatches);
        setPeopleFeedStatus("ready");
      } catch {
        if (active) {
          setPeopleFeedStatus("error");
        }
      }
    };

    void loadPeople();

    return () => {
      active = false;
    };
  }, [loadPeopleForDiscover]);

  useEffect(() => {
    if (!connectionSentProfileId) {
      return;
    }

    setConnectionStatuses((current) => ({
      ...current,
      [connectionSentProfileId]: "sent",
    }));
  }, [connectionSentProfileId]);

  const refreshPeopleMatches = useCallback(async () => {
    setPeopleFeedStatus("refreshing");

    try {
      const result = await loadPeopleForDiscover();
      setPeopleMatches(result.peopleMatches);
      setPeopleFeedStatus("ready");
    } catch {
      setPeopleFeedStatus("error");
    }
  }, [loadPeopleForDiscover]);

  const closeSheet = useCallback(() => setSheet(null), []);

  const openActivateFab = useCallback(async () => {
    if (activationBusy) {
      return;
    }

    if (selectedInterest) {
      await requireAuth("activate_interest", async () => {
        setSheetRemountKey((key) => key + 1);
        setSheet("confirm");
      });
    } else {
      setSheetRemountKey((key) => key + 1);
      setSheet("pick");
    }
  }, [activationBusy, requireAuth, selectedInterest]);

  const goPickToConfirm = useCallback(async () => {
    if (!selectedInterest) {
      return;
    }

    await requireAuth("activate_interest", async () => {
      setSheetRemountKey((key) => key + 1);
      setSheet("confirm");
    });
  }, [requireAuth, selectedInterest]);

  const runConfirmActivate = useCallback(async () => {
    await confirmActivate(closeSheet);
  }, [closeSheet, confirmActivate]);

  const handleSayHi = useCallback(
    async (person: PeopleMatch) => {
      await requireAuth("chat", async () => {
        router.push(createPeopleConnectRoute(person));
      });
    },
    [requireAuth, router],
  );

  const getPersonKey = useCallback((person: PeopleMatch) => person.id, []);

  const renderPeopleMatch = useCallback<ListRenderItem<PeopleMatch>>(
    ({ item: person }) => (
      <PeopleMatchCard
        connectionFailedLabel={LL.home.people.failed()}
        connectionStatus={connectionStatuses[person.profileId] ?? "idle"}
        match={person}
        onSayHi={() => {
          void handleSayHi(person);
        }}
        sayHiLabel={LL.home.people.sayHi()}
        sendingLabel={LL.home.people.sending()}
        sentLabel={LL.home.people.sent()}
      />
    ),
    [connectionStatuses, handleSayHi, LL],
  );

  const renderPeopleEmpty = useCallback(() => {
    if (peopleFeedStatus === "loading") {
      return (
        <Panel variant="muted" style={styles.panel}>
          <UiText variant="panelBody">{LL.home.people.loading()}</UiText>
        </Panel>
      );
    }

    if (peopleFeedStatus === "error") {
      return (
        <Panel variant="muted" style={styles.panel}>
          <UiText variant="panelBody">{LL.home.people.error()}</UiText>
        </Panel>
      );
    }

    return (
      <Panel variant="muted" style={styles.panel}>
        <UiText variant="panelTitle">{LL.home.people.emptyTitle()}</UiText>
        <UiText variant="panelBody">{LL.home.people.emptyBody()}</UiText>
      </Panel>
    );
  }, [LL, peopleFeedStatus, styles.panel]);

  const listHeader = useMemo(
    () => (
      <View style={styles.headerStack}>
        <Header
          left={<UiText variant="logo">{LL.brand.name()}</UiText>}
          right={<UiText variant="city">{cityContext.city.name}</UiText>}
        />

        <HeroPanel
          body={LL.home.people.body()}
          eyebrow={LL.home.people.eyebrow()}
          title={LL.home.people.title({ city: cityContext.city.name })}
        />

        {connectionSentName ? (
          <Panel variant="muted" style={styles.panel}>
            <UiText variant="panelBody">
              {LL.peopleConnect.sentToast({ name: connectionSentName })}
            </UiText>
          </Panel>
        ) : null}
      </View>
    ),
    [
      LL,
      cityContext.city.name,
      connectionSentName,
      styles.headerStack,
      styles.panel,
    ],
  );

  const discoverPeople =
    peopleFeedStatus === "loading" || peopleFeedStatus === "error"
      ? []
      : peopleMatches;

  const stickyLabel = activationBusy
    ? LL.activities.activate.activating()
    : LL.activities.activate.activate();

  return (
    <BottomSheetModalProvider>
      <Screen contentStyle={styles.screenContent} edges={["top"]} scroll={false}>
        <List
          contentContainerStyle={styles.listContent}
          data={discoverPeople}
          extraData={connectionStatuses}
          itemGap={spacing[4]}
          keyExtractor={getPersonKey}
          ListEmptyComponent={renderPeopleEmpty}
          ListHeaderComponent={listHeader}
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                void refreshPeopleMatches();
              }}
              refreshing={peopleFeedStatus === "refreshing"}
              tintColor={theme.colors.brand}
            />
          }
          renderItem={renderPeopleMatch}
          style={styles.list}
        />

        <ActivateInterestFab
          accessibilityHint={LL.common.activateInterestFab.hint()}
          accessibilityLabel={`${LL.common.activateInterestFab.label()}. ${stickyLabel}`}
          bottomInset={insets.bottom}
          disabled={activationBusy}
          label={LL.common.activateInterestFab.label()}
          onPress={() => {
            void openActivateFab();
          }}
        />

        <Sheet
          contentStyle={styles.sheetContent}
          onDismiss={closeSheet}
          remountKey={sheetRemountKey}
          visible={sheet !== null}
        >
          {sheet === "pick" ? (
            <>
              <UiText variant="panelTitle">{LL.home.activateFab.pickTitle()}</UiText>
              <UiText variant="panelBody">{LL.home.activateFab.pickBody()}</UiText>
              <InterestToggleGrid
                interests={interests}
                onSelectInterest={handleSelectInterest}
                selectedInterestId={selectedInterest?.id ?? ""}
              />
              <View style={styles.sheetActions}>
                <Button
                  label={LL.activities.activate.sheetNotNow()}
                  onPress={closeSheet}
                  style={styles.sheetActionButton}
                  variant="bordered"
                />
                <Button
                  disabled={!selectedInterest}
                  label={LL.home.activateFab.nextConfirm()}
                  onPress={() => {
                    void goPickToConfirm();
                  }}
                  style={styles.sheetPrimaryButton}
                  textStyle={styles.sheetPrimaryButtonText}
                  variant="primary"
                />
              </View>
            </>
          ) : (
            <>
              <UiText variant="panelTitle">
                {LL.activities.activate.confirmTitle({
                  interest: selectedInterest?.name ?? "",
                })}
              </UiText>
              <UiText variant="panelBody">
                {LL.activities.activate.confirmBody({
                  interest: selectedInterest?.name ?? "",
                })}
              </UiText>
              <View style={styles.sheetActions}>
                <Button
                  label={LL.activities.activate.sheetNotNow()}
                  onPress={closeSheet}
                  style={styles.sheetActionButton}
                  variant="bordered"
                />
                <Button
                  label={LL.activities.activate.confirm()}
                  onPress={() => {
                    void runConfirmActivate();
                  }}
                  style={styles.sheetPrimaryButton}
                  textStyle={styles.sheetPrimaryButtonText}
                  variant="primary"
                />
              </View>
            </>
          )}
        </Sheet>
      </Screen>
    </BottomSheetModalProvider>
  );
};

const createStyles = (theme: BuzzTheme, bottomInset: number) => {
  const { borderWidths, colors, fontSizes, lineHeights, shadows, spacing } =
    theme;

  const fabClearance = 72;

  return StyleSheet.create({
    screenContent: {
      flex: 1,
      flexGrow: 1,
      gap: 0,
      padding: 0,
    },
    list: {
      flex: 1,
    },
    listContent: {
      padding: spacing[6],
      paddingBottom: spacing[8] + fabClearance + bottomInset,
    },
    headerStack: {
      gap: spacing[5],
      marginBottom: spacing[4],
    },
    panel: {
      gap: spacing[3],
    },
    sheetContent: {
      gap: spacing[4],
      paddingBottom: spacing[6] + bottomInset,
      paddingTop: spacing[2],
    },
    sheetActions: {
      gap: spacing[3],
      marginTop: spacing[1],
    },
    sheetActionButton: {
      width: "100%",
    },
    sheetPrimaryButton: {
      backgroundColor: colors.warning,
      borderColor: colors.warning,
      minHeight: 52,
      width: "100%",
    },
    sheetPrimaryButtonText: {
      color: colors.text,
      fontSize: fontSizes.md,
      fontWeight: "900",
    },
  });
};
