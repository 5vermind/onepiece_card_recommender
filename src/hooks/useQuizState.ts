"use client";

import { useState, useCallback, useMemo } from "react";
import { type QuizQuestion } from "@/lib/types";
import questionsData from "@/data/questions.json";

const questions = questionsData as QuizQuestion[];

interface UseQuizStateReturn {
  currentStep: number;
  totalSteps: number;
  currentQuestion: QuizQuestion;
  answers: Record<string, string>;
  selectedOptionId: string | null;
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

  const totalSteps = questions.length;

  const currentQuestion = useMemo(
    () => questions[currentStep],
    [currentStep],
  );

  const selectedOptionId = useMemo(
    () => answers[currentQuestion.id] ?? null,
    [answers, currentQuestion.id],
  );

  const progress = useMemo(
    () => ((currentStep + (selectedOptionId !== null ? 1 : 0)) / totalSteps) * 100,
    [currentStep, selectedOptionId, totalSteps],
  );

  const canGoNext = selectedOptionId !== null;
  const canGoPrevious = currentStep > 0;

  const selectAnswer = useCallback(
    (questionId: string, optionId: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    },
    [],
  );

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
