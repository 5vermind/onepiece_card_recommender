"use client";

import { type QuizOption as QuizOptionType } from "@/lib/types";

interface QuizOptionProps {
  option: QuizOptionType;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function QuizOption({ option, selected, disabled = false, onClick }: QuizOptionProps) {
  const base =
    "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ease-out cursor-pointer min-h-[44px]";
  const selectedClass = selected
    ? "border-op-red bg-op-red/10 shadow-md ring-1 ring-op-red/30"
    : disabled
      ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm active:scale-[0.98]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${selectedClass}`}
    >
      <span className="text-2xl" role="img" aria-hidden="true">
        {option.icon}
      </span>
      <span className="flex-1 text-sm font-medium text-gray-800 sm:text-base">{option.text}</span>
      {selected && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-op-red text-xs text-white">
          ✓
        </span>
      )}
    </button>
  );
}
