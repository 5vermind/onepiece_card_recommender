"use client";

import { useRouter } from "next/navigation";
import { useQuizState } from "@/hooks/useQuizState";
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
    isComplete,
    selectAnswer,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoPrevious,
  } = useQuizState();

  const isLastStep = currentStep === totalSteps - 1;

  function handleNext() {
    if (isLastStep && canGoNext) {
      // Mark complete and navigate to results
      goToNextStep();
    } else {
      goToNextStep();
    }
  }

  // Navigate to results when quiz is complete
  if (isComplete) {
    const encoded = encodeURIComponent(JSON.stringify(answers));
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
        onSelectOption={(optionId) =>
          selectAnswer(currentQuestion.id, optionId)
        }
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

        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={!canGoNext}
        >
          {isLastStep ? "결과 보기 🎯" : "다음 →"}
        </Button>
      </div>
    </div>
  );
}
