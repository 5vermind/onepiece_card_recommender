import { describe, it, expect } from "vitest";
import { recommendDecks, generateMatchReasons } from "./recommend";
import { type AggregatedWeights } from "./types";

function makeAggroBeginnerAnswers(): Record<string, string> {
  return {
    "q1-experience": "q1-beginner",
    "q2-playstyle": "q2-aggro",
    "q3-color": "q3-red",
    "q4-tempo": "q4-fast",
    "q5-goal": "q5-competitive",
    "q6-budget": "q6-mid",
    "q7-character": "q7-luffy",
  };
}

function makeControlExperiencedAnswers(): Record<string, string> {
  return {
    "q1-experience": "q1-experienced",
    "q2-playstyle": "q2-control",
    "q3-color": "q3-black",
    "q4-meta": "q4-counter",
    "q5-goal": "q5-competitive",
    "q6-budget": "q6-high",
    "q7-character": "q7-villain",
  };
}

function makeCasualMidrangeAnswers(): Record<string, string> {
  return {
    "q1-experience": "q1-intermediate",
    "q2-playstyle": "q2-midrange",
    "q3-color": "q3-green",
    "q4-tempo": "q4-medium",
    "q5-goal": "q5-casual",
    "q6-budget": "q6-mid",
    "q7-character": "q7-supernova",
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

    const aggroCount = top3.filter((r) => r.deck.playstyle.includes("aggro")).length;
    expect(aggroCount).toBeGreaterThanOrEqual(2);
  });

  it("should prioritize medium difficulty decks for beginners wanting simple decks", () => {
    const results = recommendDecks(makeAggroBeginnerAnswers());
    const top3 = results.slice(0, 3);

    const mediumCount = top3.filter((r) => r.deck.difficulty === "medium").length;
    expect(mediumCount).toBeGreaterThanOrEqual(1);
  });

  it("should prioritize matching color decks for specific color preference", () => {
    const results = recommendDecks(makeAggroBeginnerAnswers());
    const top3 = results.slice(0, 3);

    const redCount = top3.filter((r) => r.deck.colors.includes("Red")).length;
    expect(redCount).toBeGreaterThanOrEqual(1);
  });

  it("should prioritize S/A tier decks for competitive goal", () => {
    const results = recommendDecks(makeAggroBeginnerAnswers());
    const top3 = results.slice(0, 3);

    const highTierCount = top3.filter((r) => r.deck.tier === "S" || r.deck.tier === "A").length;
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

    expect(result1.map((r) => r.deck.id)).toEqual(result2.map((r) => r.deck.id));
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

    const controlCount = top3.filter((r) => r.deck.playstyle.includes("control")).length;
    expect(controlCount).toBeGreaterThanOrEqual(2);
  });

  it("should use q4-meta for experienced users instead of q4-tempo", () => {
    const experiencedAnswers = makeControlExperiencedAnswers();
    const results = recommendDecks(experiencedAnswers);

    expect(results.length).toBe(18);
    expect(results[0].score).toBeGreaterThan(0);
  });
});

describe("generateMatchReasons", () => {
  const ZERO_WEIGHTS: AggregatedWeights = {
    colors: { Red: 0, Green: 0, Blue: 0, Purple: 0, Black: 0, Yellow: 0 },
    playstyles: { aggro: 0, midrange: 0, control: 0, combo: 0 },
    tiers: { S: 0, A: 0, B: 0, C: 0 },
    difficulties: { easy: 0, medium: 0, hard: 0 },
    budgets: { budget: 0, mid: 0, expensive: 0 },
  };

  const MOCK_DECK_BASE = {
    id: "test",
    name: "Test",
    nameKo: "테스트",
    leaderId: "OP01-001",
    budgetTier: "budget" as const,
    keyMechanic: "테스트",
    description: "테스트",
    strengths: ["강점"],
    weaknesses: ["약점"],
    matchups: ["테스트 상성"],
    keyCards: ["카드1"],
    playTips: ["팁1"],
    tags: ["태그"],
  };

  it("should return playstyle match reason when playstyle matches", () => {
    const weights: AggregatedWeights = {
      ...ZERO_WEIGHTS,
      playstyles: { aggro: 3, midrange: 0, control: 0, combo: 0 },
    };
    const deck = {
      ...MOCK_DECK_BASE,
      colors: ["Red" as const],
      playstyle: ["aggro" as const],
      tier: "A" as const,
      difficulty: "easy" as const,
    };

    const reasons = generateMatchReasons(deck, weights);
    expect(reasons.some((r) => r.includes("공격적인"))).toBe(true);
  });

  it("should return color match reason when color matches", () => {
    const weights: AggregatedWeights = {
      ...ZERO_WEIGHTS,
      colors: { Red: 3, Green: 0, Blue: 0, Purple: 0, Black: 0, Yellow: 0 },
    };
    const deck = {
      ...MOCK_DECK_BASE,
      colors: ["Red" as const],
      playstyle: ["aggro" as const],
      tier: "B" as const,
      difficulty: "easy" as const,
    };

    const reasons = generateMatchReasons(deck, weights);
    expect(reasons.some((r) => r.includes("레드"))).toBe(true);
  });

  it("should return at most 3 reasons", () => {
    const weights: AggregatedWeights = {
      ...ZERO_WEIGHTS,
      colors: { Red: 3, Green: 0, Blue: 0, Purple: 0, Black: 0, Yellow: 0 },
      playstyles: { aggro: 3, midrange: 0, control: 0, combo: 0 },
      tiers: { S: 0, A: 3, B: 0, C: 0 },
      difficulties: { easy: 3, medium: 0, hard: 0 },
    };
    const deck = {
      ...MOCK_DECK_BASE,
      colors: ["Red" as const],
      playstyle: ["aggro" as const],
      tier: "A" as const,
      difficulty: "easy" as const,
    };

    const reasons = generateMatchReasons(deck, weights);
    expect(reasons.length).toBeLessThanOrEqual(3);
  });

  it("should return fallback reason when no specific match", () => {
    const weights: AggregatedWeights = {
      ...ZERO_WEIGHTS,
      colors: { Red: 3, Green: 0, Blue: 0, Purple: 0, Black: 0, Yellow: 0 },
      playstyles: { aggro: 3, midrange: 0, control: 0, combo: 0 },
      difficulties: { easy: 0, medium: 0, hard: 3 },
    };
    const deck = {
      ...MOCK_DECK_BASE,
      colors: ["Blue" as const],
      playstyle: ["control" as const],
      tier: "C" as const,
      difficulty: "medium" as const,
      budgetTier: "mid" as const,
    };

    const reasons = generateMatchReasons(deck, weights);
    expect(reasons.length).toBeGreaterThanOrEqual(1);
    expect(reasons.some((r) => r.includes("균형"))).toBe(true);
  });
});
