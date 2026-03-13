import { describe, it, expect } from "vitest";
import { resolveQuestions, resolveQuestionForSlot, TOTAL_SLOTS } from "./quiz-flow";

describe("resolveQuestions", () => {
  it("should return exactly TOTAL_SLOTS questions", () => {
    const resolved = resolveQuestions({});
    expect(resolved).toHaveLength(TOTAL_SLOTS);
  });

  it("should return q4-tempo for beginner users at slot 3", () => {
    const resolved = resolveQuestions({ "q1-experience": "q1-beginner" });
    const slot3 = resolved[3];
    expect(slot3.id).toBe("q4-tempo");
  });

  it("should return q4-tempo for intermediate users at slot 3", () => {
    const resolved = resolveQuestions({ "q1-experience": "q1-intermediate" });
    const slot3 = resolved[3];
    expect(slot3.id).toBe("q4-tempo");
  });

  it("should return q4-meta for experienced users at slot 3", () => {
    const resolved = resolveQuestions({ "q1-experience": "q1-experienced" });
    const slot3 = resolved[3];
    expect(slot3.id).toBe("q4-meta");
  });

  it("should return a default slot 3 question when no Q1 answer is given", () => {
    const resolved = resolveQuestions({});
    const slot3 = resolved[3];
    expect(["q4-tempo", "q4-meta"]).toContain(slot3.id);
  });

  it("should keep non-branching slots stable regardless of Q1 answer", () => {
    const beginnerResolved = resolveQuestions({ "q1-experience": "q1-beginner" });
    const experiencedResolved = resolveQuestions({ "q1-experience": "q1-experienced" });

    expect(beginnerResolved[0].id).toBe(experiencedResolved[0].id);
    expect(beginnerResolved[1].id).toBe(experiencedResolved[1].id);
    expect(beginnerResolved[2].id).toBe(experiencedResolved[2].id);
    expect(beginnerResolved[4].id).toBe(experiencedResolved[4].id);
    expect(beginnerResolved[5].id).toBe(experiencedResolved[5].id);
    expect(beginnerResolved[6].id).toBe(experiencedResolved[6].id);
  });

  it("should assign unique slots to each resolved question", () => {
    const resolved = resolveQuestions({ "q1-experience": "q1-beginner" });
    const slots = resolved.map((q) => q.slot);
    expect(new Set(slots).size).toBe(TOTAL_SLOTS);
  });
});

describe("resolveQuestionForSlot", () => {
  it("should return the correct question for a non-branching slot", () => {
    const q = resolveQuestionForSlot(0, {});
    expect(q.id).toBe("q1-experience");
  });

  it("should return q4-meta for slot 3 when experienced", () => {
    const q = resolveQuestionForSlot(3, { "q1-experience": "q1-experienced" });
    expect(q.id).toBe("q4-meta");
  });

  it("should return q4-tempo for slot 3 when beginner", () => {
    const q = resolveQuestionForSlot(3, { "q1-experience": "q1-beginner" });
    expect(q.id).toBe("q4-tempo");
  });
});
