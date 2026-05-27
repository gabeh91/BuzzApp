import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { runAttendanceAction, runFeedbackAction } from "@/lib/functions";
import { secureStorage } from "@/lib/secureStorage";
import { buzzSupabase } from "@/lib/supabase";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Sheet, Text as UiText, useToast } from "@/ui";

import { useSettlingProgressState } from "./SettlingProgressProvider";
import {
  findNextPostActivityCheckIn,
  getPostActivityCheckInDelayDays,
  getPostActivityCheckInExpiryDays,
  getPostActivityCheckInSnoozeHours,
  postActivityCheckInDelayMs,
  postActivityCheckInSnoozeMs,
  type PostActivityCheckInCandidate,
} from "./postActivityCheckIn";
import {
  createPostActivityCheckInDismissalStore,
  type PostActivityCheckInDismissals,
} from "./postActivityCheckInDismissals";

type ActivityPlanRow = {
  activity_name?: string | null;
  starts_at?: string | null;
  title?: string | null;
};

type ActivityGroupRow = {
  created_at?: string | null;
  id?: string | null;
  interest?: { name?: string | null } | null;
  activity_plans?: ActivityPlanRow[] | null;
  title?: string | null;
};

type ActivityGroupMemberRow = {
  activity_group_id?: string | null;
  attendance_confirmed_at?: string | null;
  attendance_status?: string | null;
  feedback_completed_at?: string | null;
  activity_groups?: ActivityGroupRow | null;
};

const checkInSelect = `
  activity_group_id,
  attendance_confirmed_at,
  attendance_status,
  feedback_completed_at,
  activity_groups!inner(
    id,
    title,
    created_at,
    interest:interests(name),
    activity_plans(
      activity_name,
      starts_at,
      title
    )
  )
`;

const normalizeCheckInCandidates = (
  rows: ActivityGroupMemberRow[] | null,
): PostActivityCheckInCandidate[] => {
  if (!rows) return [];

  return rows.flatMap((row) => {
    const group = row.activity_groups;
    const activityGroupId = row.activity_group_id ?? group?.id;

    if (!activityGroupId || !group) return [];

    const plan = group.activity_plans?.[0] ?? null;
    const interestName =
      group.interest?.name ??
      plan?.activity_name ??
      plan?.title ??
      group.title ??
      "this activity";

    return [
      {
        activityGroupId,
        attendanceConfirmedAt: row.attendance_confirmed_at ?? null,
        attendanceStatus: row.attendance_status ?? "unknown",
        feedbackCompletedAt: row.feedback_completed_at ?? null,
        groupCreatedAt: group.created_at ?? null,
        groupTitle: group.title ?? interestName,
        interestName,
        planStartsAt: plan?.starts_at ?? null,
      },
    ];
  });
};

type CheckInStep = "attendance" | "experience";

export const PostActivityCheckInPrompt = () => {
  const { isAuthenticated, requireAuth, user } = useBuzzAuth();
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const { showToast } = useToast();
  const { markAttendanceConfirmed, markFeedbackCompleted, markGroupJoined } =
    useSettlingProgressState();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [candidates, setCandidates] = useState<PostActivityCheckInCandidate[]>(
    [],
  );
  const [snoozedUntilByGroupId, setSnoozedUntilByGroupId] =
    useState<PostActivityCheckInDismissals>({});
  const [step, setStep] = useState<CheckInStep>("attendance");
  const [submitting, setSubmitting] = useState(false);

  const delayMs = useMemo(
    () => postActivityCheckInDelayMs(getPostActivityCheckInDelayDays()),
    [],
  );
  const expiryMs = useMemo(
    () => postActivityCheckInDelayMs(getPostActivityCheckInExpiryDays()),
    [],
  );
  const snoozeMs = useMemo(
    () => postActivityCheckInSnoozeMs(getPostActivityCheckInSnoozeHours()),
    [],
  );
  const dismissalStore = useMemo(
    () => createPostActivityCheckInDismissalStore(secureStorage, user.id),
    [user.id],
  );

  const activeCandidate = useMemo(() => {
    return findNextPostActivityCheckIn(
      candidates,
      new Date(),
      delayMs,
      expiryMs,
      snoozedUntilByGroupId,
    );
  }, [candidates, delayMs, expiryMs, snoozedUntilByGroupId]);

  const loadCandidates = useCallback(async () => {
    if (!isAuthenticated) {
      setCandidates([]);
      return;
    }

    const { data, error } = await buzzSupabase
      .from("activity_group_members")
      .select(checkInSelect)
      .eq("user_id", user.id)
      .is("feedback_completed_at", null)
      .limit(20);

    if (error) {
      setCandidates([]);
      return;
    }

    setCandidates(
      normalizeCheckInCandidates((data ?? []) as ActivityGroupMemberRow[]),
    );
  }, [isAuthenticated, user.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSnoozedUntilByGroupId({});
      return;
    }

    let isMounted = true;

    const loadDismissals = async () => {
      const activeDismissals = await dismissalStore.load();

      if (isMounted) {
        setSnoozedUntilByGroupId(activeDismissals);
      }
    };

    void loadDismissals();

    return () => {
      isMounted = false;
    };
  }, [dismissalStore, isAuthenticated]);

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    setStep("attendance");
  }, [activeCandidate?.activityGroupId]);

  const snoozeActive = useCallback(async () => {
    if (!activeCandidate) return;

    const nextDismissals = await dismissalStore.snooze({
      activityGroupId: activeCandidate.activityGroupId,
      snoozedUntil: new Date(Date.now() + snoozeMs).toISOString(),
    });

    setSnoozedUntilByGroupId(nextDismissals);
  }, [activeCandidate, dismissalStore, snoozeMs]);

  const submitCheckIn = useCallback(
    async ({
      userAttended,
      feltSafe,
      wouldMeetAgain,
    }: {
      userAttended: boolean;
      feltSafe: boolean;
      wouldMeetAgain: boolean;
    }) => {
      if (!activeCandidate) return;

      setSubmitting(true);

      const handled = await requireAuth(
        "post_activity_feedback",
        async (authUser, accessToken) => {
          try {
            markGroupJoined();

            if (
              userAttended &&
              activeCandidate.attendanceStatus !== "attended"
            ) {
              await runAttendanceAction({
                accessToken,
                activityGroupId: activeCandidate.activityGroupId,
                profileId: authUser.id,
              });
              markAttendanceConfirmed();
            }

            await runFeedbackAction({
              accessToken,
              activityGroupId: activeCandidate.activityGroupId,
              feltSafe,
              profileId: authUser.id,
              userAttended,
              wouldMeetAgain,
            });
            markFeedbackCompleted();
            await snoozeActive();
            showToast({
              message: LL.postActivityCheckIn.savedToast(),
              placement: "bottom",
              variant: "success",
            });
            await loadCandidates();
          } catch {
            showToast({
              message: LL.postActivityCheckIn.failedToast(),
              placement: "bottom",
              variant: "error",
            });
          } finally {
            setSubmitting(false);
          }
        },
      );

      if (!handled) {
        setSubmitting(false);
      }
    },
    [
      LL,
      activeCandidate,
      loadCandidates,
      markAttendanceConfirmed,
      markFeedbackCompleted,
      markGroupJoined,
      requireAuth,
      showToast,
      snoozeActive,
    ],
  );

  if (!isAuthenticated || !activeCandidate) {
    return null;
  }

  const activityName = activeCandidate.interestName;

  return (
    <Sheet
      contentStyle={styles.sheetContent}
      initialSnapIndex={0}
      onDismiss={() => {
        void snoozeActive();
      }}
      snapPoints={["68%", "90%"]}
      testID="post-activity-check-in-sheet"
      visible
    >
      <View style={styles.headerRow}>
        <View style={styles.iconBubble}>
          <Ionicons
            color={theme.colors.text}
            name="sparkles"
            size={28}
          />
        </View>
        <Pressable
          accessibilityLabel={LL.common.dismiss()}
          accessibilityRole="button"
          disabled={submitting}
          hitSlop={12}
          onPress={() => {
            void snoozeActive();
          }}
          style={styles.closeButton}
        >
          <Ionicons color={theme.colors.text} name="close" size={26} />
        </Pressable>
      </View>

      <View style={styles.copyStack}>
        <UiText variant="eyebrow">{LL.postActivityCheckIn.eyebrow()}</UiText>
        <UiText style={styles.title}>
          {step === "attendance"
            ? LL.postActivityCheckIn.attendanceTitle({ activity: activityName })
            : LL.postActivityCheckIn.experienceTitle({ activity: activityName })}
        </UiText>
        <UiText style={styles.body}>
          {step === "attendance"
            ? LL.postActivityCheckIn.attendanceBody()
            : LL.postActivityCheckIn.experienceBody()}
        </UiText>
      </View>

      {step === "attendance" ? (
        <View style={styles.actionStack}>
          <Button
            disabled={submitting}
            label={LL.postActivityCheckIn.didAttend()}
            onPress={() => {
              setStep("experience");
            }}
          />
          <Button
            disabled={submitting}
            label={LL.postActivityCheckIn.didNotAttend()}
            onPress={() => {
              void submitCheckIn({
                feltSafe: false,
                userAttended: false,
                wouldMeetAgain: false,
              });
            }}
            variant="tonal"
          />
        </View>
      ) : (
        <View style={styles.actionStack}>
          <Button
            disabled={submitting}
            label={LL.postActivityCheckIn.goodMeetAgain()}
            onPress={() => {
              void submitCheckIn({
                feltSafe: true,
                userAttended: true,
                wouldMeetAgain: true,
              });
            }}
          />
          <Button
            disabled={submitting}
            label={LL.postActivityCheckIn.goodButNoRepeat()}
            onPress={() => {
              void submitCheckIn({
                feltSafe: true,
                userAttended: true,
                wouldMeetAgain: false,
              });
            }}
            variant="tonal"
          />
          <Button
            disabled={submitting}
            label={LL.postActivityCheckIn.somethingFeltOff()}
            onPress={() => {
              void submitCheckIn({
                feltSafe: false,
                userAttended: true,
                wouldMeetAgain: false,
              });
            }}
            variant="bordered"
          />
        </View>
      )}
    </Sheet>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { borderWidths, colors, fontSizes, lineHeights, radii, spacing } = theme;

  return StyleSheet.create({
    sheetContent: {
      gap: spacing[5],
      paddingHorizontal: spacing[5],
      paddingTop: spacing[2],
    },
    headerRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    iconBubble: {
      alignItems: "center",
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
      borderWidth: borderWidths.hairline,
      borderRadius: radii.full,
      height: 70,
      justifyContent: "center",
      width: 70,
    },
    closeButton: {
      alignItems: "center",
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.full,
      height: 58,
      justifyContent: "center",
      width: 58,
    },
    copyStack: {
      gap: spacing[3],
    },
    title: {
      color: colors.text,
      fontSize: fontSizes["3xl"],
      ...theme.fontStyles.display,
      lineHeight: lineHeights.title,
    },
    body: {
      color: colors.textMuted,
      fontSize: fontSizes.lg,
      lineHeight: lineHeights.body,
    },
    actionStack: {
      gap: spacing[3],
    },
  });
};
