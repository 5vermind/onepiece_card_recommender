import { type QuizQuestion } from "@/lib/types";
import questionsData from "@/data/questions.json";

const allQuestions = questionsData as QuizQuestion[];

/** Total number of quiz slots (0–6). */
export const TOTAL_SLOTS = 6;

/**
 * Given all questions and the user's current answers, resolve which question
 * should appear in each slot. For slots with multiple candidate questions
 * (conditional branching), the first candidate whose `condition` is satisfied
 * wins. If no conditional candidate matches, the one without a condition is used.
 *
 * Returns an array of exactly TOTAL_SLOTS questions, one per slot.
 */
export function resolveQuestions(answers: Record<string, string>): QuizQuestion[] {
  const resolved: QuizQuestion[] = [];

  for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
    const candidates = allQuestions.filter((q) => q.slot === slot);

    if (candidates.length === 0) {
      throw new Error(`No question found for slot ${slot}`);
    }

    if (candidates.length === 1) {
      resolved.push(candidates[0]);
      continue;
    }

    let matched: QuizQuestion | null = null;
    let fallback: QuizQuestion | null = null;

    for (const candidate of candidates) {
      if (!candidate.condition) {
        fallback = candidate;
        continue;
      }

      const conditionMet = Object.entries(candidate.condition).every(([questionId, validAnswers]) =>
        validAnswers.includes(answers[questionId]),
      );

      if (conditionMet) {
        matched = candidate;
        break;
      }
    }

    resolved.push(matched ?? fallback ?? candidates[0]);
  }

  return resolved;
}

/**
 * Get the resolved question for a specific slot.
 */
export function resolveQuestionForSlot(
  slot: number,
  answers: Record<string, string>,
): QuizQuestion {
  const candidates = allQuestions.filter((q) => q.slot === slot);

  if (candidates.length === 1) {
    return candidates[0];
  }

  for (const candidate of candidates) {
    if (!candidate.condition) continue;

    const conditionMet = Object.entries(candidate.condition).every(([questionId, validAnswers]) =>
      validAnswers.includes(answers[questionId]),
    );

    if (conditionMet) {
      return candidate;
    }
  }

  return candidates.find((c) => !c.condition) ?? candidates[0];
}
