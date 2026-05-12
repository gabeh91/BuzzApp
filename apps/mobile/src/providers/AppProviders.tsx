import { ApolloProvider } from "@apollo/client";
import { useFonts } from "expo-font";
import { useMemo, type ReactNode } from "react";

import { BuzzAuthProvider } from "@/auth/AuthProvider";
import { InterestFlowProvider } from "@/features/interests/InterestFlowProvider";
import { OnboardingProvider } from "@/features/onboarding/OnboardingProvider";
import { SettlingProgressProvider } from "@/features/progress/SettlingProgressProvider";
import { ProfileQuizOverwritePrompt } from "@/features/quiz/ProfileQuizOverwritePrompt";
import { QuizCompletionPrompt } from "@/features/quiz/QuizCompletionPrompt";
import { QuizProvider } from "@/features/quiz/QuizProvider";
import { I18nProvider } from "@/i18n/I18nProvider";
import { createBuzzApolloClient } from "@/lib/apollo";
import { buzzSupabase } from "@/lib/supabase";
import { ThemeProvider } from "@/theme/ThemeProvider";

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
    "Metropolis-Regular": require("../../assets/fonts/Metropolis-Regular.otf"),
    "Metropolis-Bold": require("../../assets/fonts/Metropolis-Bold.otf"),
    "Metropolis-ExtraBold": require("../../assets/fonts/Metropolis-ExtraBold.otf"),
    "Menlo-Regular": require("../../assets/fonts/Menlo-Regular.ttf"),
    "Menlo-Bold": require("../../assets/fonts/Menlo-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <I18nProvider>
          <BuzzAuthProvider>
            <OnboardingProvider>
              <QuizProvider>
                <QuizCompletionPrompt />
                <ProfileQuizOverwritePrompt />
                <InterestFlowProvider>
                  <SettlingProgressProvider>
                    {children}
                  </SettlingProgressProvider>
                </InterestFlowProvider>
              </QuizProvider>
            </OnboardingProvider>
          </BuzzAuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
};
