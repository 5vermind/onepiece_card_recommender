"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuizState } from "@/hooks/useQuizState";
import { encodeAnswers } from "@/lib/answer-codec";
import { trackEvent, SCORING_VERSION } from "@/lib/analytics";
import { QuizStep } from "@/components/quiz/QuizStep";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

export default function QuizPage() {
  const router = useRouter();
  const {
    currentStep,
    totalSteps,
    currentQuestion,
    answers,
    selectedOptionId,
    selectedOptionIds,
    isComplete,
    selectAnswer,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoPrevious,
  } = useQuizState();

  const isLastStep = currentStep === totalSteps - 1;
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      trackEvent({ name: "quiz_started" });
    }
  }, []);

  function handleSelectAnswer(questionId: string, optionId: string) {
    selectAnswer(questionId, optionId);

    const answer =
      questionId === "q3-color"
        ? (() => {
            const current = selectedOptionIds.filter((value) => value !== "q3-any");

            if (optionId === "q3-any") {
              return "q3-any";
            }

            if (current.includes(optionId)) {
              return current.filter((value) => value !== optionId).join("|");
            }

            if (current.length >= 2) {
              return current.join("|");
            }

            return [...current, optionId].join("|");
          })()
        : optionId;

    trackEvent({
      name: "quiz_answer",
      data: { question: questionId, answer, step: currentStep },
    });
  }

  function handleNext() {
    if (isLastStep && canGoNext) {
      trackEvent({
        name: "quiz_completed",
        data: { answers: JSON.stringify(answers), sv: SCORING_VERSION },
      });
    }
    goToNextStep();
  }

  if (isComplete) {
    const encoded = encodeAnswers(answers);
    router.push(`/result?a=${encoded}`);
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">결과를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Progress */}
      <div className="mb-8">
        <ProgressBar current={currentStep + 1} total={totalSteps} />
      </div>

      {/* Current Question */}
      <QuizStep
        question={currentQuestion}
        selectedOptionId={selectedOptionId}
        selectedOptionIds={selectedOptionIds}
        onSelectOption={(optionId) => handleSelectAnswer(currentQuestion.id, optionId)}
      />

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {canGoPrevious ? (
          <Button variant="ghost" onClick={goToPreviousStep}>
            ← 이전
          </Button>
        ) : (
          <div />
        )}

        <Button variant="primary" size="lg" onClick={handleNext} disabled={!canGoNext}>
          {isLastStep ? "결과 보기 🎯" : "다음 →"}
        </Button>
      </div>
    </div>
  );
}
