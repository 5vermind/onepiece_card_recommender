import { describe, it, expect } from "vitest";
import { aggregateWeights, calculateDeckScore } from "./scoring";
import { type AggregatedWeights, type Deck, type QuizQuestion } from "./types";

// Minimal question fixtures for testing
const mockQuestions: QuizQuestion[] = [
  {
    id: "q1",
    text: "테스트 질문 1",
    description: "설명",
    options: [
      {
        id: "q1-a",
        text: "옵션 A",
        icon: "🔥",
        weights: {
          difficulties: { easy: 3, medium: 1 },
          tiers: { A: 1, B: 1 },
        },
      },
      {
        id: "q1-b",
        text: "옵션 B",
        icon: "📚",
        weights: { difficulties: { easy: 1, medium: 3, hard: 1 } },
      },
    ],
  },
  {
    id: "q2",
    text: "테스트 질문 2",
    description: "설명",
    options: [
      {
        id: "q2-aggro",
        text: "어그로",
        icon: "⚔️",
        weights: { playstyles: { aggro: 3 } },
      },
      {
        id: "q2-control",
        text: "컨트롤",
        icon: "🛡️",
        weights: { playstyles: { control: 3 } },
      },
    ],
  },
  {
    id: "q3",
    text: "테스트 질문 3",
    description: "설명",
    options: [
      {
        id: "q3-red",
        text: "레드",
        icon: "🔴",
        weights: { colors: { Red: 3 } },
      },
      {
        id: "q3-blue",
        text: "블루",
        icon: "🔵",
        weights: { colors: { Blue: 3 } },
      },
    ],
  },
];

function makeZeroWeights(): AggregatedWeights {
  return {
    colors: { Red: 0, Green: 0, Blue: 0, Purple: 0, Black: 0, Yellow: 0 },
    playstyles: { aggro: 0, midrange: 0, control: 0, combo: 0 },
    tiers: { S: 0, A: 0, B: 0, C: 0 },
    difficulties: { easy: 0, medium: 0, hard: 0 },
  };
}

const baseDeck: Deck = {
  id: "test-deck",
  name: "Test Deck",
  nameKo: "테스트 덱",
  leaderId: "OP01-001",
  colors: ["Red"],
  playstyle: ["aggro"],
  tier: "A",
  difficulty: "easy",
  budgetTier: "budget",
  keyMechanic: "테스트",
  description: "테스트 덱입니다",
  strengths: ["강점1"],
  weaknesses: ["약점1"],
  tags: ["테스트"],
};

describe("aggregateWeights", () => {
  it("should aggregate a single answer's weights correctly", () => {
    const answers = { q1: "q1-a" };
    const result = aggregateWeights(answers, mockQuestions);

    expect(result.difficulties.easy).toBe(3);
    expect(result.difficulties.medium).toBe(1);
    expect(result.tiers.A).toBe(1);
    expect(result.tiers.B).toBe(1);
    // Untouched categories should be 0
    expect(result.colors.Red).toBe(0);
    expect(result.playstyles.aggro).toBe(0);
  });

  it("should accumulate weights from multiple answers", () => {
    const answers = { q1: "q1-a", q2: "q2-aggro", q3: "q3-red" };
    const result = aggregateWeights(answers, mockQuestions);

    expect(result.difficulties.easy).toBe(3);
    expect(result.difficulties.medium).toBe(1);
    expect(result.playstyles.aggro).toBe(3);
    expect(result.colors.Red).toBe(3);
    expect(result.tiers.A).toBe(1);
  });

  it("should handle empty answers gracefully", () => {
    const result = aggregateWeights({}, mockQuestions);

    expect(result.colors.Red).toBe(0);
    expect(result.playstyles.aggro).toBe(0);
    expect(result.tiers.S).toBe(0);
    expect(result.difficulties.easy).toBe(0);
  });

  it("should handle unknown question IDs gracefully", () => {
    const answers = { "nonexistent-q": "some-option" };
    const result = aggregateWeights(answers, mockQuestions);

    // All zeroes — unknown question skipped
    expect(result.colors.Red).toBe(0);
    expect(result.playstyles.aggro).toBe(0);
  });

  it("should handle unknown option IDs gracefully", () => {
    const answers = { q1: "nonexistent-option" };
    const result = aggregateWeights(answers, mockQuestions);

    expect(result.difficulties.easy).toBe(0);
    expect(result.tiers.A).toBe(0);
  });

  it("should return all four weight categories", () => {
    const result = aggregateWeights({}, mockQuestions);

    expect(result).toHaveProperty("colors");
    expect(result).toHaveProperty("playstyles");
    expect(result).toHaveProperty("tiers");
    expect(result).toHaveProperty("difficulties");
  });
});

describe("calculateDeckScore", () => {
  it("should calculate color scores correctly for matching decks", () => {
    const weights = makeZeroWeights();
    weights.colors.Red = 3;

    const redDeck = { ...baseDeck, colors: ["Red" as const] };
    const blueDeck = {
      ...baseDeck,
      id: "blue-deck",
      colors: ["Blue" as const],
    };

    expect(calculateDeckScore(redDeck, weights)).toBeGreaterThan(
      calculateDeckScore(blueDeck, weights),
    );
  });

  it("should calculate playstyle scores correctly for matching decks", () => {
    const weights = makeZeroWeights();
    weights.playstyles.aggro = 3;

    const aggroDeck = { ...baseDeck, playstyle: ["aggro" as const] };
    const controlDeck = {
      ...baseDeck,
      id: "ctrl-deck",
      playstyle: ["control" as const],
    };

    expect(calculateDeckScore(aggroDeck, weights)).toBeGreaterThan(
      calculateDeckScore(controlDeck, weights),
    );
  });

  it("should weight playstyle higher than other categories", () => {
    // Playstyle multiplier is 1.5 vs color 1.0
    const weights = makeZeroWeights();
    weights.playstyles.aggro = 3;
    weights.colors.Blue = 3;

    // Deck matching only playstyle
    const playstyleDeck = {
      ...baseDeck,
      colors: ["Green" as const],
      playstyle: ["aggro" as const],
    };
    // Deck matching only color
    const colorDeck = {
      ...baseDeck,
      id: "color-deck",
      colors: ["Blue" as const],
      playstyle: ["control" as const],
    };

    expect(calculateDeckScore(playstyleDeck, weights)).toBeGreaterThan(
      calculateDeckScore(colorDeck, weights),
    );
  });

  it("should calculate tier and difficulty scores correctly", () => {
    const weights = makeZeroWeights();
    weights.tiers.S = 3;
    weights.difficulties.easy = 3;

    const matchDeck = {
      ...baseDeck,
      tier: "S" as const,
      difficulty: "easy" as const,
    };
    const mismatchDeck = {
      ...baseDeck,
      id: "mismatch",
      tier: "C" as const,
      difficulty: "hard" as const,
    };

    expect(calculateDeckScore(matchDeck, weights)).toBeGreaterThan(
      calculateDeckScore(mismatchDeck, weights),
    );
  });

  it("should return 0 for a deck with no matching weights", () => {
    const weights = makeZeroWeights();
    const score = calculateDeckScore(baseDeck, weights);
    expect(score).toBe(0);
  });

  it("should handle multi-color and multi-playstyle decks", () => {
    const weights = makeZeroWeights();
    weights.colors.Blue = 2;
    weights.colors.Purple = 2;
    weights.playstyles.midrange = 2;
    weights.playstyles.combo = 2;

    const multiDeck: Deck = {
      ...baseDeck,
      colors: ["Blue", "Purple"],
      playstyle: ["midrange", "combo"],
    };
    const singleDeck: Deck = {
      ...baseDeck,
      id: "single",
      colors: ["Blue"],
      playstyle: ["midrange"],
    };

    // Multi-deck should score higher because it matches more categories
    expect(calculateDeckScore(multiDeck, weights)).toBeGreaterThan(
      calculateDeckScore(singleDeck, weights),
    );
  });
});
