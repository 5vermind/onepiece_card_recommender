"use client";

import { type QuizQuestion } from "@/lib/types";
import { QuizOption } from "./QuizOption";

interface QuizStepProps {
  question: QuizQuestion;
  selectedOptionId: string | null;
  selectedOptionIds: string[];
  onSelectOption: (optionId: string) => void;
}

export function QuizStep({
  question,
  selectedOptionId,
  selectedOptionIds,
  onSelectOption,
}: QuizStepProps) {
  const isColorQuestion = question.id === "q3-color";
  const maxReached = Boolean(question.maxSelect && selectedOptionIds.length >= question.maxSelect);

  return (
    <div className="animate-[fadeIn_0.3s_ease-out] space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{question.text}</h2>
        <p className="text-sm text-gray-500">{question.description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => (
          <QuizOption
            key={option.id}
            option={option}
            selected={
              isColorQuestion
                ? selectedOptionIds.includes(option.id)
                : option.id === selectedOptionId
            }
            disabled={
              isColorQuestion &&
              maxReached &&
              option.id !== "q3-any" &&
              !selectedOptionIds.includes(option.id)
            }
            onClick={() => onSelectOption(option.id)}
          />
        ))}
      </div>
    </div>
  );
}
