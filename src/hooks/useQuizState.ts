"use client";

import { useState, useCallback, useMemo } from "react";
import { type QuizQuestion } from "@/lib/types";
import { resolveQuestions, TOTAL_SLOTS } from "@/lib/quiz-flow";

const COLOR_QUESTION_ID = "q3-color";
const ANY_COLOR_OPTION_ID = "q3-any";

interface UseQuizStateReturn {
  currentStep: number;
  totalSteps: number;
  currentQuestion: QuizQuestion;
  answers: Record<string, string>;
  selectedOptionId: string | null;
  selectedOptionIds: string[];
  isComplete: boolean;
  progress: number;
  selectAnswer: (questionId: string, optionId: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  reset: () => void;
}

export function useQuizState(): UseQuizStateReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const totalSteps = TOTAL_SLOTS;

  const resolvedQuestions = useMemo(() => resolveQuestions(answers), [answers]);

  const currentQuestion = useMemo(
    () => resolvedQuestions[currentStep],
    [resolvedQuestions, currentStep],
  );

  const selectedOptionId = useMemo(
    () => answers[currentQuestion.id] ?? null,
    [answers, currentQuestion.id],
  );

  const selectedOptionIds = useMemo(
    () => (selectedOptionId ? selectedOptionId.split("|") : []),
    [selectedOptionId],
  );

  const progress = useMemo(
    () => ((currentStep + (selectedOptionId !== null ? 1 : 0)) / totalSteps) * 100,
    [currentStep, selectedOptionId, totalSteps],
  );

  const canGoNext = selectedOptionId !== null;
  const canGoPrevious = currentStep > 0;

  const selectAnswer = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const next = { ...prev };

      if (questionId === COLOR_QUESTION_ID) {
        const current = prev[questionId]?.split("|").filter(Boolean) ?? [];

        if (optionId === ANY_COLOR_OPTION_ID) {
          next[questionId] = ANY_COLOR_OPTION_ID;
        } else {
          const withoutAny = current.filter((value) => value !== ANY_COLOR_OPTION_ID);

          if (withoutAny.includes(optionId)) {
            const toggled = withoutAny.filter((value) => value !== optionId);

            if (toggled.length > 0) {
              next[questionId] = toggled.join("|");
            } else {
              delete next[questionId];
            }
          } else if (withoutAny.length < 2) {
            next[questionId] = [...withoutAny, optionId].join("|");
          } else {
            next[questionId] = withoutAny.join("|");
          }
        }
      } else {
        next[questionId] = optionId;
      }

      const prevResolved = resolveQuestions(prev);
      const nextResolved = resolveQuestions(next);

      let cleared = next;
      for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
        if (prevResolved[slot].id !== nextResolved[slot].id) {
          const staleId = prevResolved[slot].id;
          if (staleId in cleared) {
            const { [staleId]: _discarded, ...rest } = cleared;
            void _discarded;
            cleared = rest;
          }
        }
      }

      return cleared;
    });
  }, []);

  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentStep, totalSteps]);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setAnswers({});
    setIsComplete(false);
  }, []);

  return {
    currentStep,
    totalSteps,
    currentQuestion,
    answers,
    selectedOptionId,
    selectedOptionIds,
    isComplete,
    progress,
    selectAnswer,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoPrevious,
    reset,
  };
}
