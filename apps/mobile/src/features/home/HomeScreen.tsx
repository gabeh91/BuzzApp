import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { ActivityMatchCard } from "@/features/activities/ActivityMatchCard";
import { OutgoingActivationCancelSheet } from "@/features/activities/OutgoingActivationCancelSheet";
import { createCityContextFallback } from "@/features/city/cityContext";
import { useActivationGestureLock } from "@/features/interests/ActivationGestureLockProvider";
import { useActivateInterestActions } from "@/features/interests/useActivateInterestActions";
import {
  useOutgoingActivationSummary,
  type OutgoingActivationSummary,
} from "@/features/interests/useOutgoingActivationSummary";
import { PeopleMatchCard } from "@/features/people/PeopleMatchCard";
import type { PeopleMatch } from "@/features/people/peopleFeed";
import { loadPeopleMatchesFromSupabase } from "@/features/people/peopleFeedClient";
import { useQuiz } from "@/features/quiz/QuizProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { tabBarTotalHeight } from "@/navigation/tabBarLayout";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import {
  SCREEN_CONTENT_GUTTER_SPACING,
  spacing,
  type BuzzTheme,
} from "@/theme/tokens";
import {
  AppBrandedCityHeader,
  CompactIntro,
  List,
  Panel,
  Screen,
  StickySegmentedTabs,
  Text as UiText,
  useSegmentedTabSwipe,
  useToast,
  type ListRenderItem,
} from "@/ui";
import Animated, { Easing, FadeInUp } from "react-native-reanimated";
import { getDiscoverFeedItemMaxHeight } from "./discoverLayout";

type PeopleFeedStatus = "loading" | "ready" | "refreshing" | "error";
type ConnectionRequestStatus = "idle" | "sending" | "sent" | "error";
type DiscoverTab = "people" | "live" | "nearby";
type NearbyActivitySuggestion = {
  id: string;
  name: string;
  slug: string;
  matchedPeopleCount: number;
};
type DiscoverFeedItem =
  | { kind: "person"; person: PeopleMatch }
  | { kind: "live"; activation: OutgoingActivationSummary }
  | { kind: "nearby"; suggestion: NearbyActivitySuggestion };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DISCOVER_ITEM_ENTER_DURATION_MS = 220;
const DISCOVER_ITEM_ENTER_STAGGER_MS = 70;
const discoverTabOrder: readonly DiscoverTab[] = ["people", "live", "nearby"];

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

const getPersonKey = (person: PeopleMatch) => person.id;

export const HomeScreen = () => {
  const router = useRouter();
  const routeParams = useLocalSearchParams<{
    connectionSentName?: string | string[];
    connectionSentProfileId?: string | string[];
  }>();
  const { theme } = useBuzzTheme();
  const insets = useSafeAreaInsets();
  const windowDimensions = useWindowDimensions();
  const discoverFeedItemMaxHeight = useMemo(
    () =>
      getDiscoverFeedItemMaxHeight({
        bottomChromeHeight: tabBarTotalHeight(theme, insets.bottom),
        theme,
        topInset: insets.top,
        windowHeight: windowDimensions.height,
      }),
    [insets.bottom, insets.top, theme, windowDimensions.height],
  );
  const styles = useMemo(
    () => createStyles(theme, insets.bottom, discoverFeedItemMaxHeight),
    [discoverFeedItemMaxHeight, theme, insets.bottom],
  );
  const { LL } = useI18n();
  const { showToast } = useToast();
  const { isAuthenticated, requireAuth, user } = useBuzzAuth();
  const { isActivationGestureLocked } = useActivationGestureLock();
  const { selectedInterest } = useActivateInterestActions();
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });
  const { traits } = useQuiz();
  const [peopleFeedStatus, setPeopleFeedStatus] =
    useState<PeopleFeedStatus>("loading");
  const [peopleMatches, setPeopleMatches] = useState<PeopleMatch[]>([]);
  const [discoverTab, setDiscoverTab] = useState<DiscoverTab>("people");
  const [cancellingActivationId, setCancellingActivationId] = useState<
    string | null
  >(null);
  const [cancelSheetActivation, setCancelSheetActivation] =
    useState<OutgoingActivationSummary | null>(null);
  const [cancelSheetRemountKey, setCancelSheetRemountKey] = useState(0);
  const [connectionStatuses, setConnectionStatuses] = useState<
    Record<string, ConnectionRequestStatus>
  >({});
  const {
    contentDragStyle,
    contentPanHandlers,
    onContentLayout,
    tabDragProgress,
  } = useSegmentedTabSwipe<DiscoverTab>({
    activeTab: discoverTab,
    setActiveTab: setDiscoverTab,
    tabOrder: discoverTabOrder,
  });
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
  const outgoingSummary = useOutgoingActivationSummary({
    enabled: isAuthenticated,
    userId: user.id,
  });
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

    if (!connectionSentName) {
      return;
    }

    const name = connectionSentName;

    showToast({
      message: LL.peopleConnect.sentToast({ name }),
      placement: "top",
      variant: "success",
    });

    router.replace(routes.home);
  }, [LL, connectionSentName, connectionSentProfileId, router, showToast]);

  const refreshDiscover = useCallback(async () => {
    setPeopleFeedStatus("refreshing");

    try {
      const [result] = await Promise.all([
        loadPeopleForDiscover(),
        outgoingSummary.refetch(),
      ]);
      setPeopleMatches(result.peopleMatches);
      setPeopleFeedStatus("ready");
    } catch {
      setPeopleFeedStatus("error");
    }
  }, [loadPeopleForDiscover, outgoingSummary]);

  const handleSayHi = useCallback(
    async (person: PeopleMatch) => {
      await requireAuth("chat", async () => {
        router.push(createPeopleConnectRoute(person));
      });
    },
    [requireAuth, router],
  );

  const cancelOutgoingActivation = useCallback(
    async (activation: OutgoingActivationSummary) => {
      setCancellingActivationId(activation.activationId);

      try {
        await outgoingSummary.cancelActivation(activation.activationId);
        setCancelSheetActivation(null);
        showToast({
          message: LL.activities.outgoing.cancelled(),
          placement: "bottom",
          variant: "success",
        });
      } catch {
        showToast({
          message: LL.activities.outgoing.cancelFailed(),
          placement: "bottom",
          variant: "error",
        });
      } finally {
        setCancellingActivationId(null);
      }
    },
    [LL.activities.outgoing, outgoingSummary, showToast],
  );

  const openCancelSheet = useCallback(
    (activation: OutgoingActivationSummary) => {
      setCancelSheetActivation(activation);
      setCancelSheetRemountKey((current) => current + 1);
    },
    [],
  );

  const handleCloseCancelSheet = useCallback(() => {
    setCancelSheetActivation(null);
  }, []);

  const nearbySuggestions = useMemo<NearbyActivitySuggestion[]>(() => {
    const interestCountById = new Map<string, NearbyActivitySuggestion>();

    for (const person of peopleMatches) {
      for (const interest of person.sharedInterests) {
        const current = interestCountById.get(interest.id);
        if (current) {
          current.matchedPeopleCount += 1;
        } else {
          interestCountById.set(interest.id, {
            id: interest.id,
            matchedPeopleCount: 1,
            name: interest.name,
            slug: interest.slug,
          });
        }
      }
    }

    return [...interestCountById.values()]
      .sort((a, b) => b.matchedPeopleCount - a.matchedPeopleCount)
      .slice(0, 8);
  }, [peopleMatches]);

  const renderDiscoverEmpty = useCallback(() => {
    if (discoverTab === "people") {
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
    }

    if (discoverTab === "live" && outgoingSummary.loading) {
      return (
        <Panel variant="muted" style={styles.panel}>
          <UiText variant="panelBody">{LL.home.people.loading()}</UiText>
        </Panel>
      );
    }

    if (discoverTab === "nearby") {
      return (
        <Panel variant="muted" style={styles.panel}>
          <UiText variant="panelTitle">{LL.home.tabs.nearby()}</UiText>
          <UiText variant="panelBody">{LL.home.nearby.empty()}</UiText>
        </Panel>
      );
    }

    return (
      <Panel variant="muted" style={styles.panel}>
        <UiText variant="panelTitle">{LL.activities.outgoing.title()}</UiText>
        <UiText variant="panelBody">{LL.activities.outgoing.empty()}</UiText>
      </Panel>
    );
  }, [
    LL,
    discoverTab,
    outgoingSummary.loading,
    peopleFeedStatus,
    styles.panel,
  ]);

  const tabItems = useMemo(
    () => [
      {
        icon: (
          <Ionicons
            color={
              discoverTab === "people"
                ? theme.colors.text
                : theme.colors.textMuted
            }
            name="people-outline"
            size={16}
          />
        ),
        label: LL.home.tabs.people(),
        value: "people" as const,
      },
      {
        icon: (
          <Ionicons
            color={
              discoverTab === "live"
                ? theme.colors.text
                : theme.colors.textMuted
            }
            name="flash-outline"
            size={16}
          />
        ),
        label: LL.home.tabs.live(),
        value: "live" as const,
      },
      {
        icon: (
          <Ionicons
            color={
              discoverTab === "nearby"
                ? theme.colors.text
                : theme.colors.textMuted
            }
            name="compass-outline"
            size={16}
          />
        ),
        label: LL.home.tabs.nearby(),
        value: "nearby" as const,
      },
    ],
    [
      LL.home.tabs.live,
      LL.home.tabs.nearby,
      LL.home.tabs.people,
      discoverTab,
      theme.colors.text,
      theme.colors.textMuted,
    ],
  );

  const preTabsContent = useMemo(
    () => (
      <View style={styles.headerIntro}>
        <CompactIntro
          body={
            discoverTab === "people"
              ? LL.home.people.body()
              : discoverTab === "live"
                ? LL.activities.subtitle()
                : LL.home.nearby.body()
          }
          eyebrow={LL.home.people.eyebrow()}
          style={styles.headerIntroCopy}
          title={
            discoverTab === "people"
              ? LL.home.people.title({ city: cityContext.city.name })
              : discoverTab === "live"
                ? LL.home.tabs.live()
                : LL.home.tabs.nearby()
          }
        />
      </View>
    ),
    [LL, cityContext.city.name, discoverTab, styles.headerIntro],
  );

  const discoverPeople = peopleFeedStatus === "error" ? [] : peopleMatches;
  const discoverActivities = outgoingSummary.activations;
  const discoverData = useMemo<DiscoverFeedItem[]>(() => {
    if (discoverTab === "people") {
      return discoverPeople.map((person) => ({
        kind: "person" as const,
        person,
      }));
    }

    if (discoverTab === "live") {
      return discoverActivities.map((activation) => ({
        kind: "live" as const,
        activation,
      }));
    }

    return nearbySuggestions.map((suggestion) => ({
      kind: "nearby" as const,
      suggestion,
    }));
  }, [discoverActivities, discoverPeople, discoverTab, nearbySuggestions]);

  const renderDiscoverItem = useCallback<ListRenderItem<DiscoverFeedItem>>(
    ({ item, index }) => {
      if (item.kind === "person") {
        const person = item.person;

        return (
          <Animated.View
            entering={FadeInUp.duration(DISCOVER_ITEM_ENTER_DURATION_MS)
              .easing(Easing.out(Easing.cubic))
              .delay(index * DISCOVER_ITEM_ENTER_STAGGER_MS)}
            style={styles.peopleMatchItem}
          >
            <PeopleMatchCard
              connectionFailedLabel={LL.home.people.failed()}
              connectionStatus={connectionStatuses[person.profileId] ?? "idle"}
              match={person}
              onSayHi={() => {
                void handleSayHi(person);
              }}
              sayHiLabel={LL.home.people.sayHi()}
              sharedMetaLabel={LL.home.people.sharedMeta({
                count: person.sharedInterests.length,
              })}
              sendingLabel={LL.home.people.sending()}
              sentLabel={LL.home.people.sent()}
              notesMetaLabel={LL.home.people.notesMeta({
                count: person.compatibilityHighlights.length,
              })}
              style={styles.discoverFeedItem}
            />
          </Animated.View>
        );
      }

      if (item.kind === "live") {
        const activation = item.activation;

        return (
          <ActivityMatchCard
            interest={{
              name: activation.interestName,
              slug: activation.interestSlug ?? undefined,
            }}
            socialMeta={[
              {
                icon: "checkmark-circle-outline",
                label: LL.home.activityMeta.going({
                  count: activation.responseSummary.yes,
                }),
              },
              {
                icon: "help-circle-outline",
                label: LL.home.activityMeta.maybe({
                  count: activation.responseSummary.maybe,
                }),
              },
              {
                icon: "chatbubble-ellipses-outline",
                label: LL.home.activityMeta.pending({
                  count: activation.responseSummary.pending,
                }),
              },
            ]}
            statusLabel={
              activation.activityGroupId
                ? LL.activities.outgoing.groupReady()
                : activation.status
            }
            statusAccessibilityLabel={LL.activities.outgoing.manage()}
            statusDisabled={cancellingActivationId === activation.activationId}
            onStatusPress={
              activation.activityGroupId
                ? undefined
                : () => {
                    openCancelSheet(activation);
                  }
            }
            style={styles.discoverFeedItem}
            title={activation.interestName}
            tone={activation.activityGroupId ? "ready" : "live"}
          />
        );
      }

      const suggestion = item.suggestion;

      return (
        <ActivityMatchCard
          interest={{ name: suggestion.name, slug: suggestion.slug }}
          socialMeta={[
            {
              icon: "people-outline",
              label: LL.home.activityMeta.people({
                count: suggestion.matchedPeopleCount,
              }),
            },
            {
              icon: "heart-outline",
              label: LL.home.activityMeta.sharedInterest(),
            },
            {
              icon: "chatbubble-ellipses-outline",
              label: LL.home.activityMeta.replies(),
            },
          ]}
          style={styles.discoverFeedItem}
          title={suggestion.name}
          tone="nearby"
        />
      );
    },
    [
      LL,
      cancellingActivationId,
      connectionStatuses,
      handleSayHi,
      openCancelSheet,
      styles.discoverFeedItem,
      styles.peopleMatchItem,
    ],
  );

  return (
    <Screen
      contentStyle={styles.screenContent}
      edges={["top"]}
      scroll={false}
      stickyHeader={<AppBrandedCityHeader cityName={cityContext.city.name} />}
    >
      <Animated.View
        onLayout={onContentLayout}
        style={[styles.contentSwipeZone, contentDragStyle]}
        {...contentPanHandlers}
      >
        <StickySegmentedTabs
          items={tabItems}
          preTabsContent={preTabsContent}
          tabsContainerStyle={styles.discoverTabsContainer}
          tabsStyle={styles.discoverTabs}
          value={discoverTab}
          onChange={setDiscoverTab}
          {...(tabDragProgress == null
            ? {}
            : { dragProgress: tabDragProgress })}
        >
          {({ header, onScroll, overlay }) => (
            <>
              {overlay}
              <List
                key={`discover-${discoverTab}`}
                contentContainerStyle={styles.listContent}
                data={discoverData}
                extraData={{
                  connectionStatuses,
                  discoverTab,
                  outgoingCount: discoverActivities.length,
                }}
                itemGap={0}
                keyExtractor={(item) =>
                  item.kind === "person"
                    ? getPersonKey(item.person)
                    : item.kind === "live"
                      ? item.activation.activationId
                      : `nearby:${item.suggestion.id}`
                }
                ListEmptyComponent={renderDiscoverEmpty}
                ListHeaderComponent={header}
                onScroll={onScroll}
                refreshControl={
                  <RefreshControl
                    onRefresh={() => {
                      void refreshDiscover();
                    }}
                    refreshing={peopleFeedStatus === "refreshing"}
                    tintColor={theme.colors.brand}
                  />
                }
                renderItem={renderDiscoverItem}
                scrollEnabled={!isActivationGestureLocked}
                scrollEventThrottle={16}
                snapToClosestItemOnScrollSettled={true}
                style={styles.list}
              />
            </>
          )}
        </StickySegmentedTabs>
      </Animated.View>
      <OutgoingActivationCancelSheet
        activation={cancelSheetActivation}
        cancelling={cancellingActivationId !== null}
        onCancel={handleCloseCancelSheet}
        onConfirm={(activation) => {
          void cancelOutgoingActivation(activation);
        }}
        remountKey={cancelSheetRemountKey}
      />
    </Screen>
  );
};

const createStyles = (
  theme: BuzzTheme,
  bottomInset: number,
  discoverFeedItemMaxHeight: number,
) => {
  const { spacing } = theme;

  const fabClearance = 72;

  return StyleSheet.create({
    screenContent: {
      flex: 1,
      flexGrow: 1,
      gap: 0,
      paddingHorizontal: 0,
      paddingTop: 0,
    },
    list: {
      flex: 1,
    },
    contentSwipeZone: {
      flex: 1,
    },
    listContent: {
      paddingBottom: Math.max(
        spacing[8] + fabClearance + bottomInset,
        tabBarTotalHeight(theme, bottomInset) + spacing[4],
      ),
      paddingHorizontal: 0,
      paddingTop: spacing[5],
    },
    headerIntro: {
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
    },
    headerIntroCopy: {
      maxWidth: "92%",
    },
    peopleMatchItem: {
      width: "100%",
    },
    discoverFeedItem: {
      maxHeight: discoverFeedItemMaxHeight,
    },
    discoverTabsContainer: {
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
    },
    discoverTabs: {
      justifyContent: "flex-start",
      width: "100%",
    },
    panel: {
      gap: spacing[3],
      marginHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
    },
  });
};
