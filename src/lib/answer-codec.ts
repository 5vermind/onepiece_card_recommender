import { type QuizQuestion } from "@/lib/types";
import questionsData from "@/data/questions.json";

const questions = questionsData as QuizQuestion[];

export function encodeAnswers(answers: Record<string, string>): string {
  return questions
    .map((q) => {
      const selectedId = answers[q.id];
      const idx = q.options.findIndex((o) => o.id === selectedId);
      return idx >= 0 ? String(idx) : "0";
    })
    .join("");
}

export function decodeAnswers(compact: string): Record<string, string> | null {
  if (compact.length !== questions.length) return null;

  const result: Record<string, string> = {};

  for (let i = 0; i < questions.length; i++) {
    const idx = Number(compact[i]);
    const option = questions[i].options[idx];
    if (!option) return null;
    result[questions[i].id] = option.id;
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
    /* invalid JSON */
  }

  return null;
}
