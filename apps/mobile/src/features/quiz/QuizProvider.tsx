import { createContext, useContext, useState, type ReactNode } from "react";

import { deriveProfileTraits, quizQuestions, type ProfileTraits, type QuizAnswers, type QuizQuestion } from "./quizModel";

type QuizContextValue = {
  answers: QuizAnswers;
  activeQuestion: QuizQuestion;
  activeQuestionIndex: number;
  traits: ProfileTraits;
  answerQuestion: (questionId: string, optionId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  hasAnsweredActiveQuestion: boolean;
  isLastQuestion: boolean;
  progress: {
    current: number;
    total: number;
  };
};

const QuizContext = createContext<QuizContextValue | null>(null);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const activeQuestion = quizQuestions[activeQuestionIndex] ?? quizQuestions[0];
  const traits = deriveProfileTraits(answers);

  if (!activeQuestion) {
    throw new Error("Quiz questions must include at least one question");
  }

  const value: QuizContextValue = {
    answers,
    activeQuestion,
    activeQuestionIndex,
    traits,
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
