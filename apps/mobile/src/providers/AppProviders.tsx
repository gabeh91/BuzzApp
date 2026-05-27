import { ApolloProvider } from "@apollo/client";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { useMemo, type ComponentProps, type ReactNode } from "react";
import { Text as NativeText, TextInput as NativeTextInput } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { BuzzAuthProvider } from "@/auth/AuthProvider";
import { ConnectionRequestInboxSingleton } from "@/features/chat/ConnectionRequestInboxSingleton";
import { ActivationGestureLockProvider } from "@/features/interests/ActivationGestureLockProvider";
import { ActivationPingInboxSingleton } from "@/features/interests/ActivationPingInboxSingleton";
import { InterestFlowProvider } from "@/features/interests/InterestFlowProvider";
import { OnboardingProvider } from "@/features/onboarding/OnboardingProvider";
import { PostActivityCheckInPrompt } from "@/features/progress/PostActivityCheckInPrompt";
import { SettlingProgressProvider } from "@/features/progress/SettlingProgressProvider";
import { ProfileQuizOverwritePrompt } from "@/features/quiz/ProfileQuizOverwritePrompt";
import { QuizCompletionPrompt } from "@/features/quiz/QuizCompletionPrompt";
import { QuizProvider } from "@/features/quiz/QuizProvider";
import { I18nProvider } from "@/i18n/I18nProvider";
import { createBuzzApolloClient } from "@/lib/apollo";
import { buzzSupabase } from "@/lib/supabase";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { ToastProvider } from "@/ui/Toast";

type NativeTextWithDefaults = typeof NativeText & {
  defaultProps?: Partial<ComponentProps<typeof NativeText>>;
};
type NativeTextInputWithDefaults = typeof NativeTextInput & {
  defaultProps?: Partial<ComponentProps<typeof NativeTextInput>>;
};

const configureGlobalFontScaling = () => {
  const textComponent = NativeText as NativeTextWithDefaults;
  const textInputComponent = NativeTextInput as NativeTextInputWithDefaults;

  textComponent.defaultProps = {
    ...textComponent.defaultProps,
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
  };
  textInputComponent.defaultProps = {
    ...textInputComponent.defaultProps,
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
  };
};
configureGlobalFontScaling();

export const AppProviders = ({ children }: { children: ReactNode }) => {
  const client = useMemo(
    () =>
      createBuzzApolloClient({
        getAccessToken: async () => {
          const { data } = await buzzSupabase.auth.getSession();

          return data.session?.access_token;
        },
      }),
    [],
  );
  const [fontsLoaded] = useFonts({
    "NunitoSans-Regular": require("../../assets/fonts/NunitoSans-Regular.ttf"),
    "NunitoSans-Medium": require("../../assets/fonts/NunitoSans-Medium.ttf"),
    "NunitoSans-SemiBold": require("../../assets/fonts/NunitoSans-SemiBold.ttf"),
    "NunitoSans-Bold": require("../../assets/fonts/NunitoSans-Bold.ttf"),
    "NunitoSans-ExtraBold": require("../../assets/fonts/NunitoSans-ExtraBold.ttf"),
    "NunitoSans-Black": require("../../assets/fonts/NunitoSans-Black.ttf"),
    "Menlo-Regular": require("../../assets/fonts/Menlo-Regular.ttf"),
    "Menlo-Bold": require("../../assets/fonts/Menlo-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ApolloProvider client={client}>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <I18nProvider>
              <ToastProvider>
                <BuzzAuthProvider>
                  <OnboardingProvider>
                    <QuizProvider>
                      <QuizCompletionPrompt />
                      <ProfileQuizOverwritePrompt />
                      <InterestFlowProvider>
                        <ActivationGestureLockProvider>
                          <SettlingProgressProvider>
                            <PostActivityCheckInPrompt />
                            <ConnectionRequestInboxSingleton>
                              <ActivationPingInboxSingleton>
                                {children}
                              </ActivationPingInboxSingleton>
                            </ConnectionRequestInboxSingleton>
                          </SettlingProgressProvider>
                        </ActivationGestureLockProvider>
                      </InterestFlowProvider>
                    </QuizProvider>
                  </OnboardingProvider>
                </BuzzAuthProvider>
              </ToastProvider>
            </I18nProvider>
          </BottomSheetModalProvider>
        </ThemeProvider>
      </ApolloProvider>
    </SafeAreaProvider>
  );
};
