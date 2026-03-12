import { describe, it, expect } from "vitest";
import { recommendDecks, generateMatchReasons } from "./recommend";
import { type AggregatedWeights } from "./types";

// Helper: create full answer sets for common scenarios
function makeAggroBeginnerAnswers(): Record<string, string> {
  return {
    "q1-experience": "q1-beginner",
    "q2-playstyle": "q2-aggro",
    "q3-color": "q3-red",
    "q4-goal": "q4-competitive",
    "q5-complexity": "q5-simple",
  };
}

function makeControlExperiencedAnswers(): Record<string, string> {
  return {
    "q1-experience": "q1-experienced",
    "q2-playstyle": "q2-control",
    "q3-color": "q3-black",
    "q4-goal": "q4-competitive",
    "q5-complexity": "q5-complex",
  };
}

function makeCasualMidrangeAnswers(): Record<string, string> {
  return {
    "q1-experience": "q1-intermediate",
    "q2-playstyle": "q2-midrange",
    "q3-color": "q3-green",
    "q4-goal": "q4-casual",
    "q5-complexity": "q5-moderate",
  };
}

describe("recommendDecks", () => {
  it("should return all 18 decks in the full ranking", () => {
    const results = recommendDecks(makeAggroBeginnerAnswers());
    expect(results).toHaveLength(18);
  });

  it("should rank aggro decks highest for aggro preference", () => {
    const results = recommendDecks(makeAggroBeginnerAnswers());
    const top3 = results.slice(0, 3);

    // At least 2 of top 3 should include aggro playstyle
    const aggroCount = top3.filter((r) =>
      r.deck.playstyle.includes("aggro"),
    ).length;
    expect(aggroCount).toBeGreaterThanOrEqual(2);
  });

  it("should prioritize easy decks for beginners wanting simple decks", () => {
    const results = recommendDecks(makeAggroBeginnerAnswers());
    const top3 = results.slice(0, 3);

    // At least one of top 3 should be easy difficulty
    const easyCount = top3.filter(
      (r) => r.deck.difficulty === "easy",
    ).length;
    expect(easyCount).toBeGreaterThanOrEqual(1);
  });

  it("should prioritize matching color decks for specific color preference", () => {
    const results = recommendDecks(makeAggroBeginnerAnswers());
    const top3 = results.slice(0, 3);

    // At least one of top 3 should include Red
    const redCount = top3.filter((r) =>
      r.deck.colors.includes("Red"),
    ).length;
    expect(redCount).toBeGreaterThanOrEqual(1);
  });

  it("should prioritize S/A tier decks for competitive goal", () => {
    const results = recommendDecks(makeAggroBeginnerAnswers());
    const top3 = results.slice(0, 3);

    // All top 3 should be S or A tier for competitive answers
    const highTierCount = top3.filter(
      (r) => r.deck.tier === "S" || r.deck.tier === "A",
    ).length;
    expect(highTierCount).toBeGreaterThanOrEqual(2);
  });

  it("should return results sorted by score descending", () => {
    const results = recommendDecks(makeCasualMidrangeAnswers());

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it("should include non-empty matchReasons for all results", () => {
    const results = recommendDecks(makeControlExperiencedAnswers());

    for (const result of results) {
      expect(result.matchReasons.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("should be deterministic — same input produces same output", () => {
    const answers = makeAggroBeginnerAnswers();
    const result1 = recommendDecks(answers);
    const result2 = recommendDecks(answers);

    expect(result1.map((r) => r.deck.id)).toEqual(
      result2.map((r) => r.deck.id),
    );
    expect(result1.map((r) => r.score)).toEqual(result2.map((r) => r.score));
  });

  it("should include valid leader data for each recommendation", () => {
    const results = recommendDecks(makeAggroBeginnerAnswers());

    for (const result of results) {
      expect(result.leader).toBeDefined();
      expect(result.leader.id).toBe(result.deck.leaderId);
    }
  });

  it("should rank control decks highest for control preference", () => {
    const results = recommendDecks(makeControlExperiencedAnswers());
    const top3 = results.slice(0, 3);

    const controlCount = top3.filter((r) =>
      r.deck.playstyle.includes("control"),
    ).length;
    expect(controlCount).toBeGreaterThanOrEqual(2);
  });
});

describe("generateMatchReasons", () => {
  it("should return playstyle match reason when playstyle matches", () => {
    const weights: AggregatedWeights = {
      colors: { Red: 0, Green: 0, Blue: 0, Purple: 0, Black: 0, Yellow: 0 },
      playstyles: { aggro: 3, midrange: 0, control: 0, combo: 0 },
      tiers: { S: 0, A: 0, B: 0, C: 0 },
      difficulties: { easy: 0, medium: 0, hard: 0 },
    };
    const deck = {
      id: "test",
      name: "Test",
      nameKo: "테스트",
      leaderId: "OP01-001",
      colors: ["Red" as const],
      playstyle: ["aggro" as const],
      tier: "A" as const,
      difficulty: "easy" as const,
      budgetTier: "budget" as const,
      keyMechanic: "테스트",
      description: "테스트",
      strengths: ["강점"],
      weaknesses: ["약점"],
      tags: ["태그"],
    };

    const reasons = generateMatchReasons(deck, weights);
    expect(reasons.some((r) => r.includes("공격적인"))).toBe(true);
  });

  it("should return color match reason when color matches", () => {
    const weights: AggregatedWeights = {
      colors: { Red: 3, Green: 0, Blue: 0, Purple: 0, Black: 0, Yellow: 0 },
      playstyles: { aggro: 0, midrange: 0, control: 0, combo: 0 },
      tiers: { S: 0, A: 0, B: 0, C: 0 },
      difficulties: { easy: 0, medium: 0, hard: 0 },
    };
    const deck = {
      id: "test",
      name: "Test",
      nameKo: "테스트",
      leaderId: "OP01-001",
      colors: ["Red" as const],
      playstyle: ["aggro" as const],
      tier: "B" as const,
      difficulty: "easy" as const,
      budgetTier: "budget" as const,
      keyMechanic: "테스트",
      description: "테스트",
      strengths: ["강점"],
      weaknesses: ["약점"],
      tags: ["태그"],
    };

    const reasons = generateMatchReasons(deck, weights);
    expect(reasons.some((r) => r.includes("레드"))).toBe(true);
  });

  it("should return at most 3 reasons", () => {
    const weights: AggregatedWeights = {
      colors: { Red: 3, Green: 0, Blue: 0, Purple: 0, Black: 0, Yellow: 0 },
      playstyles: { aggro: 3, midrange: 0, control: 0, combo: 0 },
      tiers: { S: 0, A: 3, B: 0, C: 0 },
      difficulties: { easy: 3, medium: 0, hard: 0 },
    };
    const deck = {
      id: "test",
      name: "Test",
      nameKo: "테스트",
      leaderId: "OP01-001",
      colors: ["Red" as const],
      playstyle: ["aggro" as const],
      tier: "A" as const,
      difficulty: "easy" as const,
      budgetTier: "budget" as const,
      keyMechanic: "테스트",
      description: "테스트",
      strengths: ["강점"],
      weaknesses: ["약점"],
      tags: ["태그"],
    };

    const reasons = generateMatchReasons(deck, weights);
    expect(reasons.length).toBeLessThanOrEqual(3);
  });

  it("should return fallback reason when no specific match", () => {
    const weights: AggregatedWeights = {
      colors: { Red: 3, Green: 0, Blue: 0, Purple: 0, Black: 0, Yellow: 0 },
      playstyles: { aggro: 3, midrange: 0, control: 0, combo: 0 },
      tiers: { S: 0, A: 0, B: 0, C: 0 },
      difficulties: { easy: 0, medium: 0, hard: 3 },
    };
    // Deck that doesn't match any preference
    const deck = {
      id: "test",
      name: "Test",
      nameKo: "테스트",
      leaderId: "OP01-001",
      colors: ["Blue" as const],
      playstyle: ["control" as const],
      tier: "C" as const,
      difficulty: "medium" as const,
      budgetTier: "mid" as const,
      keyMechanic: "테스트",
      description: "테스트",
      strengths: ["강점"],
      weaknesses: ["약점"],
      tags: ["태그"],
    };

    const reasons = generateMatchReasons(deck, weights);
    expect(reasons.length).toBeGreaterThanOrEqual(1);
    expect(reasons.some((r) => r.includes("균형"))).toBe(true);
  });
});
