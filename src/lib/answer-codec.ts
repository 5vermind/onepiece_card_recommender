import { resolveQuestions, resolveQuestionForSlot, TOTAL_SLOTS } from "@/lib/quiz-flow";

export function encodeAnswers(answers: Record<string, string>): string {
  return encodeURIComponent(JSON.stringify(answers));
}

export function decodeAnswers(compact: string): Record<string, string> | null {
  if (compact.length !== TOTAL_SLOTS) return null;

  const result: Record<string, string> = {};

  const slot0Question = resolveQuestionForSlot(0, {});
  const slot0Idx = Number(compact[0]);
  const slot0Option = slot0Question.options[slot0Idx];
  if (!slot0Option) return null;
  result[slot0Question.id] = slot0Option.id;

  const resolved = resolveQuestions(result);

  for (let slot = 1; slot < TOTAL_SLOTS; slot++) {
    const question = resolved[slot];
    const idx = Number(compact[slot]);
    const option = question.options[idx];
    if (!option) return null;
    result[question.id] = option.id;
  }

  return result;
}

export function parseAnswersParam(param: string): Record<string, string> | null {
  if (/^\d+$/.test(param)) {
    return decodeAnswers(param);
  }

  try {
    const decoded = JSON.parse(decodeURIComponent(param));
    if (typeof decoded === "object" && decoded !== null) {
      return decoded as Record<string, string>;
    }
  } catch {
    /* invalid JSON — fall through */
  }

  return null;
}
