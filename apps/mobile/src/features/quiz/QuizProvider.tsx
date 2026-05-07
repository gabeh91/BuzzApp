import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { useI18n } from "@/i18n/I18nProvider";

import type { BuzzProfilePersistenceInput } from "./profilePersistence";
import { createQuizQuestions, deriveProfileTraits, type ProfileTraits, type QuizAnswers, type QuizQuestion } from "./quizModel";

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
  markProfileSaving: (input: BuzzProfilePersistenceInput) => void;
  markProfilePersisted: (input: BuzzProfilePersistenceInput) => void;
  markProfilePersistenceFailed: (input: BuzzProfilePersistenceInput, errorMessage?: string) => void;
  hasAnsweredActiveQuestion: boolean;
  isLastQuestion: boolean;
  progress: {
    current: number;
    total: number;
  };
};

const QuizContext = createContext<QuizContextValue | null>(null);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const { LL } = useI18n();
  const quizQuestions = useMemo(() => createQuizQuestions(LL), [LL]);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [profilePersistence, setProfilePersistence] = useState<QuizProfilePersistenceState>({ status: "idle" });
  const activeQuestion = quizQuestions[activeQuestionIndex] ?? quizQuestions[0];
  const traits = deriveProfileTraits(answers, quizQuestions, LL);

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
        [questionId]: optionId
      }));
    },
    nextQuestion: () => {
      setActiveQuestionIndex((current) => Math.min(current + 1, quizQuestions.length - 1));
    },
    previousQuestion: () => {
      setActiveQuestionIndex((current) => Math.max(current - 1, 0));
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
        ...(errorMessage ? { errorMessage } : {})
      });
    },
    hasAnsweredActiveQuestion: Boolean(answers[activeQuestion.id]),
    isLastQuestion: activeQuestionIndex === quizQuestions.length - 1,
    progress: {
      current: activeQuestionIndex + 1,
      total: quizQuestions.length
    }
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
