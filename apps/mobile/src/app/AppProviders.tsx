import { ApolloProvider } from "@apollo/client";
import { useMemo, type ReactNode } from "react";

import { BuzzAuthProvider } from "@/auth/AuthProvider";
import { InterestFlowProvider } from "@/features/interests/InterestFlowProvider";
import { OnboardingProvider } from "@/features/onboarding/OnboardingProvider";
import { QuizProvider } from "@/features/quiz/QuizProvider";
import { createBuzzApolloClient } from "@/lib/apollo";
import { ThemeProvider } from "@/theme/ThemeProvider";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  const client = useMemo(() => createBuzzApolloClient(), []);

  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <BuzzAuthProvider>
          <OnboardingProvider>
            <QuizProvider>
              <InterestFlowProvider>{children}</InterestFlowProvider>
            </QuizProvider>
          </OnboardingProvider>
        </BuzzAuthProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
};
