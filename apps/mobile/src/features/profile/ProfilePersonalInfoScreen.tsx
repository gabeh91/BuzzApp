import { Redirect, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { createCityContextFallback } from "@/features/city/cityContext";
import { ShortProfileFields } from "@/features/onboarding/ShortProfileFields";
import {
  createBuzzProfilePersistenceInput,
  shouldPersistProfileToSupabase,
} from "@/features/quiz/profilePersistence";
import { persistBuzzProfileToSupabase } from "@/features/quiz/profilePersistenceClient";
import { useQuiz } from "@/features/quiz/QuizProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { buzzSupabase } from "@/lib/supabase";
import { routes } from "@/navigation/routes";
import { tabBarTotalHeight } from "@/navigation/tabBarLayout";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import {
  BackHeader,
  Button,
  HeroPanel,
  Panel,
  Screen,
  Text as UiText,
} from "@/ui";

export const ProfilePersonalInfoScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useBuzzTheme();
  const styles = useMemo(
    () => createStyles(theme, insets.bottom),
    [theme, insets.bottom],
  );
  const { LL } = useI18n();
  const {
    applyLocalProfileUpdate,
    isAuthenticated,
    requireAuth,
    user,
  } = useBuzzAuth();
  const quiz = useQuiz();
  const [phase, setPhase] = useState(0);
  const [nameValue, setNameValue] = useState(user.displayName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNameValue(user.displayName);
  }, [user.displayName, user.id]);

  const cityContext = useMemo(
    () =>
      createCityContextFallback({
        cityId: user.cityId,
        cityName: user.cityName,
      }),
    [user.cityId, user.cityName],
  );

  if (!isAuthenticated) {
    return <Redirect href={routes.onboarding} />;
  }

  const close = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.profile);
  };

  const handleContinue = () => {
    setError(null);

    if (!nameValue.trim()) {
      setError(LL.profile.personalInfo.nameRequired());
      return;
    }

    setPhase(1);
  };

  const handleSave = async () => {
    await requireAuth("save_profile", async () => {
      const trimmed = nameValue.trim();

      if (!trimmed) {
        setError(LL.profile.personalInfo.nameRequired());
        return;
      }

      setSaving(true);
      setError(null);

      try {
        const input = createBuzzProfilePersistenceInput({
          answers: quiz.answers,
          traits: quiz.traits,
          user,
          overrides: { displayName: trimmed },
        });

        if (shouldPersistProfileToSupabase(user)) {
          await persistBuzzProfileToSupabase(input);
          const { error: metaError } = await buzzSupabase.auth.updateUser({
            data: { name: trimmed },
          });

          if (metaError) {
            throw metaError;
          }
        }

        applyLocalProfileUpdate({ displayName: trimmed });
        close();
      } catch {
        setError(LL.profile.personalInfo.saveFailed());
      } finally {
        setSaving(false);
      }
    });
  };

  return (
    <Screen
      contentStyle={styles.content}
      edges={["top"]}
      scroll
      stickyHeader={
        <View style={styles.stickyChrome}>
          <BackHeader
            backLabel={LL.common.back()}
            onBack={close}
            right={<UiText variant="city">{cityContext.city.name}</UiText>}
          />
        </View>
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 8, default: 0 })}
        style={styles.keyboardRoot}
      >
        <View style={styles.stack}>
          <HeroPanel
            body={LL.profile.personalInfo.body()}
            eyebrow={cityContext.city.name}
            title={LL.profile.personalInfo.title()}
          />

          <Panel style={styles.panel}>
            <ShortProfileFields
              cityHint={LL.onboarding.shortProfile.location.cityHint()}
              cityName={cityContext.city.name}
              nameValue={nameValue}
              onNameChange={setNameValue}
            />
          </Panel>

          {error ? <UiText variant="feedback">{error}</UiText> : null}

          <View style={styles.buttonStack}>
            {phase === 0 ? (
              <Button
                label={LL.common.continue()}
                onPress={handleContinue}
                style={styles.primaryNav}
              />
            ) : (
              <Button
                disabled={saving}
                label={
                  saving
                    ? LL.profile.personalInfo.saving()
                    : LL.profile.personalInfo.save()
                }
                onPress={() => {
                  void handleSave();
                }}
                style={styles.primaryNav}
              />
            )}
            {phase === 1 ? (
              <Button
                disabled={saving}
                label={LL.common.back()}
                onPress={() => {
                  setPhase(0);
                  setError(null);
                }}
                style={styles.secondaryNav}
                textStyle={styles.backNavText}
                variant="plain"
              />
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const createStyles = (theme: BuzzTheme, bottomInset: number) => {
  const { fontSizes, radii, spacing } = theme;
  const bottomPad = tabBarTotalHeight(theme, bottomInset) + spacing[4];

  return StyleSheet.create({
    backNavText: {
      fontSize: fontSizes.base,
      ...theme.fontStyles.display,
    },
    buttonStack: {
      gap: spacing[1],
      width: "100%",
    },
    content: {
      flexGrow: 1,
      gap: spacing[5],
      paddingBottom: bottomPad,
      paddingHorizontal: 0,
      paddingTop: spacing[5],
    },
    keyboardRoot: {
      flexGrow: 1,
    },
    panel: {
      gap: spacing[4],
    },
    primaryNav: {
      borderRadius: radii.lg,
    },
    secondaryNav: {
      borderRadius: radii.lg,
      marginTop: spacing[2],
    },
    stack: {
      gap: spacing[5],
    },
    stickyChrome: {
      gap: spacing[4],
      paddingBottom: spacing[3],
      width: "100%",
    },
  });
};
