import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";
import {
  mergeQuizAnswerIntoDraft,
  shouldRestoreAnonymousOnboardingDraft,
} from "@/features/onboarding/onboardingDraft";
import { anonymousOnboardingDraftStore } from "@/features/onboarding/onboardingDraftStorage";

import type { BuzzProfilePersistenceInput } from "./profilePersistence";
import {
  createQuizQuestions,
  deriveProfileTraits,
  type ProfileTraits,
  type QuizAnswers,
  type QuizQuestion,
} from "./quizModel";

type QuizProfilePersistenceState = {
  status: "idle" | "saving" | "saved" | "failed";
  lastInput?: BuzzProfilePersistenceInput;
  errorMessage?: string;
};

type QuizContextValue = {
  answers: QuizAnswers;
  activeQuestion: QuizQuestion;
  activeQuestionIndex: number;
  traits: ProfileTraits;
  profilePersistence: QuizProfilePersistenceState;
  answerQuestion: (questionId: string, optionId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  replaceAnswers: (answers: QuizAnswers) => void;
  markProfileSaving: (input: BuzzProfilePersistenceInput) => void;
  markProfilePersisted: (input: BuzzProfilePersistenceInput) => void;
  markProfilePersistenceFailed: (
    input: BuzzProfilePersistenceInput,
    errorMessage?: string,
  ) => void;
  hasAnsweredActiveQuestion: boolean;
  isLastQuestion: boolean;
  progress: {
    current: number;
    total: number;
  };
};

const QuizContext = createContext<QuizContextValue | null>(null);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const { profileQuizOverwritePrompt, profileQuizState, status } =
    useBuzzAuth();
  const { LL } = useI18n();
  const quizQuestions = useMemo(() => createQuizQuestions(LL), [LL]);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [profilePersistence, setProfilePersistence] =
    useState<QuizProfilePersistenceState>({ status: "idle" });
  const activeQuestion = quizQuestions[activeQuestionIndex] ?? quizQuestions[0];
  const traits = deriveProfileTraits(answers, quizQuestions, LL);

  useEffect(() => {
    if (status !== "anonymous") {
      return;
    }

    let active = true;

    const restoreQuizDraft = async () => {
      const draft = await anonymousOnboardingDraftStore.load();

      if (!active) {
        return;
      }

      if (!shouldRestoreAnonymousOnboardingDraft(draft)) {
        setAnswers({});
        setActiveQuestionIndex(0);
        setProfilePersistence({ status: "idle" });
        return;
      }

      setAnswers(draft.answers);
      setActiveQuestionIndex(
        Math.min(
          Math.max(draft.activeQuestionIndex, 0),
          quizQuestions.length - 1,
        ),
      );
    };

    void restoreQuizDraft();

    return () => {
      active = false;
    };
  }, [quizQuestions.length, status]);

  useEffect(() => {
    if (status !== "authenticated" && status !== "locked") {
      return;
    }

    const savedAnswers = profileQuizState?.quizAnswers;

    if (
      profileQuizOverwritePrompt ||
      !savedAnswers ||
      Object.keys(savedAnswers).length === 0
    ) {
      return;
    }

    setAnswers(savedAnswers);
    setActiveQuestionIndex(0);
    setProfilePersistence({ status: "idle" });
  }, [profileQuizOverwritePrompt, profileQuizState, status]);

  if (!activeQuestion) {
    throw new Error("Quiz questions must include at least one question");
  }

  const value: QuizContextValue = {
    answers,
    activeQuestion,
    activeQuestionIndex,
    traits,
    profilePersistence,
    answerQuestion: (questionId, optionId) => {
      setAnswers((current) => ({
        ...current,
        [questionId]: optionId,
      }));

      if (status === "anonymous") {
        void anonymousOnboardingDraftStore.update((draft) =>
          mergeQuizAnswerIntoDraft(
            draft,
            questionId,
            optionId,
            activeQuestionIndex,
          ),
        );
      }
    },
    nextQuestion: () => {
      setActiveQuestionIndex((current) => {
        const nextIndex = Math.min(current + 1, quizQuestions.length - 1);

        if (status === "anonymous") {
          void anonymousOnboardingDraftStore.update((draft) => ({
            ...draft,
            activeQuestionIndex: nextIndex,
          }));
        }

        return nextIndex;
      });
    },
    previousQuestion: () => {
      setActiveQuestionIndex((current) => {
        const nextIndex = Math.max(current - 1, 0);

        if (status === "anonymous") {
          void anonymousOnboardingDraftStore.update((draft) => ({
            ...draft,
            activeQuestionIndex: nextIndex,
          }));
        }

        return nextIndex;
      });
    },
    replaceAnswers: (nextAnswers) => {
      setAnswers(nextAnswers);
      setActiveQuestionIndex(0);
      setProfilePersistence({ status: "idle" });
    },
    markProfileSaving: (input) => {
      setProfilePersistence({ status: "saving", lastInput: input });
    },
    markProfilePersisted: (input) => {
      setProfilePersistence({ status: "saved", lastInput: input });
    },
    markProfilePersistenceFailed: (input, errorMessage) => {
      setProfilePersistence({
        status: "failed",
        lastInput: input,
        ...(errorMessage ? { errorMessage } : {}),
      });
    },
    hasAnsweredActiveQuestion: Boolean(answers[activeQuestion.id]),
    isLastQuestion: activeQuestionIndex === quizQuestions.length - 1,
    progress: {
      current: activeQuestionIndex + 1,
      total: quizQuestions.length,
    },
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export const useQuiz = (): QuizContextValue => {
  const value = useContext(QuizContext);

  if (!value) {
    throw new Error("useQuiz must be used within QuizProvider");
  }

  return value;
};
