import { describe, it, expect } from "vitest";
import decksData from "@/data/decks.json";
import leadersData from "@/data/leaders.json";
import { recommendDecks, generateMatchReasons } from "./recommend";
import { type AggregatedWeights, type Deck } from "./types";

const TOTAL_CURRENT_DECKS = decksData.filter((deck) => deck.availability === "current").length;

function makeAggroBeginnerAnswers(): Record<string, string> {
  return {
    "q1-experience": "q1-beginner",
    "q2-playstyle": "q2-aggro",
    "q3-color": "q3-red",
    "q4-tempo": "q4-fast",
    "q5-goal": "q5-competitive",
    "q6-budget": "q6-mid",
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
  };
}

describe("recommendDecks", () => {
  it("should return all decks in the full ranking", () => {
    const results = recommendDecks(makeAggroBeginnerAnswers());
    expect(results).toHaveLength(TOTAL_CURRENT_DECKS);
    expect(results.every((result) => result.deck.availability === "current")).toBe(true);
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

  it("should prioritize decks matching either of two selected colors", () => {
    const answers = {
      ...makeAggroBeginnerAnswers(),
      "q3-color": "q3-red|q3-green",
    };
    const results = recommendDecks(answers);
    const top3 = results.slice(0, 3);

    const matchingColorCount = top3.filter(
      (r) => r.deck.colors.includes("Red") || r.deck.colors.includes("Green"),
    ).length;
    expect(matchingColorCount).toBeGreaterThanOrEqual(2);
  });

  it("should prioritize S/A tier decks for competitive goal", () => {
    const results = recommendDecks(makeAggroBeginnerAnswers());
    const top3 = results.slice(0, 3);

    const highTierCount = top3.filter((r) => r.deck.tier === "S" || r.deck.tier === "A").length;
    expect(highTierCount).toBeGreaterThanOrEqual(1);
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

    expect(results.length).toBe(TOTAL_CURRENT_DECKS);
    expect(results[0].score).toBeGreaterThan(0);
  });
});

describe("meta deck data", () => {
  it("should include EB-03 Vivi in the current Korean card pool", () => {
    const vivi = decksData.find((deck) => deck.leaderId === "EB03-001");

    expect(vivi?.availability).toBe("current");
    expect(vivi?.format).toBe("OP-14");
  });

  it("should reflect the Blue Purple Luffy matchup guide", () => {
    const bluePurpleLuffy = decksData.find((deck) => deck.id === "bp-luffy");

    expect(bluePurpleLuffy?.matchups).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^\[미세 불리\] 흑 이무/),
        expect.stringMatching(/^\[유리\] 적흑 사보/),
        expect.stringMatching(/^\[미세 유리\] 녹 조로/),
        expect.stringMatching(/^\[불리\] 적자 로저/),
        expect.stringMatching(/^\[매우 불리\] 녹 보니/),
      ]),
    );
  });

  it("should include all seven OP-14 leaders in the current ranking", () => {
    const currentOp14LeaderIds = decksData
      .filter((deck) => deck.availability === "current" && deck.leaderId.startsWith("OP14-"))
      .map((deck) => deck.leaderId)
      .sort();

    expect(currentOp14LeaderIds).toEqual(
      ["OP14-001", "OP14-020", "OP14-040", "OP14-041", "OP14-060", "OP14-079", "OP14-080"].sort(),
    );
  });

  it("should treat the OP-14 card pool as current without a preview group", () => {
    expect(decksData.every((deck) => deck.availability === "current")).toBe(true);
    expect(decksData.every((deck) => deck.format === "OP-14")).toBe(true);
  });

  it("should include the returning Red Green Law in the OP-14 ranking", () => {
    const redGreenLaw = decksData.find((deck) => deck.id === "rg-law-op14");

    expect(redGreenLaw?.leaderId).toBe("OP01-002");
    expect(redGreenLaw?.availability).toBe("current");
    expect(redGreenLaw?.format).toBe("OP-14");
    expect(redGreenLaw?.keyCards).toEqual(
      expect.arrayContaining(["OP14-013 Monkey.D.Luffy", "OP14-016 X.Drake"]),
    );
  });

  it("should exclude decks removed from the OP-14 recommendation pool", () => {
    const removedDeckIds = [
      "ry-betty",
      "r-zoro",
      "y-bonney-op13",
      "r-rayleigh",
      "gb-zoro-sanji",
      "gp-lim",
      "py-pudding",
    ];

    expect(decksData.filter((deck) => removedDeckIds.includes(deck.id))).toEqual([]);
  });

  it("should provide leaders and practical details for every recommendable deck", () => {
    const leaderIds = new Set(leadersData.map((leader) => leader.id));
    const recommendableDecks = (decksData as Deck[]).filter((deck) => deck.tier !== "Out");

    for (const deck of recommendableDecks) {
      expect(leaderIds.has(deck.leaderId), deck.id).toBe(true);
      expect(deck.keyCards.length, deck.id).toBeGreaterThanOrEqual(3);
      expect(deck.playTips.length, deck.id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("generateMatchReasons", () => {
  const ZERO_WEIGHTS: AggregatedWeights = {
    colors: { Red: 0, Green: 0, Blue: 0, Purple: 0, Black: 0, Yellow: 0 },
    playstyles: { aggro: 0, midrange: 0, control: 0, combo: 0 },
    tiers: { S: 0, A: 0, B: 0, C: 0, Out: 0 },
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
    availability: "current" as const,
    format: "테스트 포맷",
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

  it("should mention multiple preferred colors when a deck matches tied top colors", () => {
    const weights: AggregatedWeights = {
      ...ZERO_WEIGHTS,
      colors: { Red: 3, Green: 0, Blue: 0, Purple: 0, Black: 0, Yellow: 3 },
    };
    const deck = {
      ...MOCK_DECK_BASE,
      colors: ["Red" as const, "Yellow" as const],
      playstyle: ["aggro" as const],
      tier: "B" as const,
      difficulty: "easy" as const,
    };

    const reasons = generateMatchReasons(deck, weights);
    expect(reasons.some((r) => r.includes("레드 / 옐로"))).toBe(true);
  });

  it("should return at most 3 reasons", () => {
    const weights: AggregatedWeights = {
      ...ZERO_WEIGHTS,
      colors: { Red: 3, Green: 0, Blue: 0, Purple: 0, Black: 0, Yellow: 0 },
      playstyles: { aggro: 3, midrange: 0, control: 0, combo: 0 },
      tiers: { S: 0, A: 3, B: 0, C: 0, Out: 0 },
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
