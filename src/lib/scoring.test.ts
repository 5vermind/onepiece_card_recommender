import { describe, it, expect } from "vitest";
import { aggregateWeights, calculateDeckScore } from "./scoring";
import { type AggregatedWeights, type Deck, type QuizQuestion } from "./types";

const mockQuestions: QuizQuestion[] = [
  {
    id: "q1",
    slot: 0,
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
    slot: 1,
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
    slot: 2,
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
    budgets: { budget: 0, mid: 0, expensive: 0 },
  };
}

const EMPTY_ANSWERS: Record<string, string> = {};

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
  matchups: ["테스트 상성"],
  keyCards: ["카드1"],
  playTips: ["팁1"],
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

    expect(result.colors.Red).toBe(0);
    expect(result.playstyles.aggro).toBe(0);
  });

  it("should handle unknown option IDs gracefully", () => {
    const answers = { q1: "nonexistent-option" };
    const result = aggregateWeights(answers, mockQuestions);

    expect(result.difficulties.easy).toBe(0);
    expect(result.tiers.A).toBe(0);
  });

  it("should return all five weight categories", () => {
    const result = aggregateWeights({}, mockQuestions);

    expect(result).toHaveProperty("colors");
    expect(result).toHaveProperty("playstyles");
    expect(result).toHaveProperty("tiers");
    expect(result).toHaveProperty("difficulties");
    expect(result).toHaveProperty("budgets");
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

    expect(calculateDeckScore(redDeck, weights, EMPTY_ANSWERS)).toBeGreaterThan(
      calculateDeckScore(blueDeck, weights, EMPTY_ANSWERS),
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

    expect(calculateDeckScore(aggroDeck, weights, EMPTY_ANSWERS)).toBeGreaterThan(
      calculateDeckScore(controlDeck, weights, EMPTY_ANSWERS),
    );
  });

  it("should weight playstyle higher than other categories", () => {
    const weights = makeZeroWeights();
    weights.playstyles.aggro = 3;
    weights.colors.Blue = 3;

    const playstyleDeck = {
      ...baseDeck,
      colors: ["Green" as const],
      playstyle: ["aggro" as const],
    };
    const colorDeck = {
      ...baseDeck,
      id: "color-deck",
      colors: ["Blue" as const],
      playstyle: ["control" as const],
    };

    expect(calculateDeckScore(playstyleDeck, weights, EMPTY_ANSWERS)).toBeGreaterThan(
      calculateDeckScore(colorDeck, weights, EMPTY_ANSWERS),
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

    expect(calculateDeckScore(matchDeck, weights, EMPTY_ANSWERS)).toBeGreaterThan(
      calculateDeckScore(mismatchDeck, weights, EMPTY_ANSWERS),
    );
  });

  it("should return 0 for a deck with no matching weights", () => {
    const weights = makeZeroWeights();
    const score = calculateDeckScore(baseDeck, weights, EMPTY_ANSWERS);
    expect(score).toBe(0);
  });

  it("should give multi-attribute deck a slight advantage when all attributes match", () => {
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

    const multiScore = calculateDeckScore(multiDeck, weights, EMPTY_ANSWERS);
    const singleScore = calculateDeckScore(singleDeck, weights, EMPTY_ANSWERS);
    expect(multiScore).toBeGreaterThan(singleScore);
    expect(multiScore / singleScore).toBeLessThan(1.2);
  });

  it("should give focused single-attribute deck higher score when only one attribute matches", () => {
    const weights = makeZeroWeights();
    weights.colors.Blue = 3;
    weights.playstyles.midrange = 3;

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

    expect(calculateDeckScore(singleDeck, weights, EMPTY_ANSWERS)).toBeGreaterThan(
      calculateDeckScore(multiDeck, weights, EMPTY_ANSWERS),
    );
  });

  it("should apply synergy bonus for beginner + aggro combination", () => {
    const weights = makeZeroWeights();
    const synergyAnswers = {
      "q1-experience": "q1-beginner",
      "q2-playstyle": "q2-aggro",
    };

    const mediumAggroDeck: Deck = {
      ...baseDeck,
      playstyle: ["aggro"],
      difficulty: "medium",
    };

    const scoreWithSynergy = calculateDeckScore(mediumAggroDeck, weights, synergyAnswers);
    const scoreWithout = calculateDeckScore(mediumAggroDeck, weights, EMPTY_ANSWERS);

    expect(scoreWithSynergy).toBeGreaterThan(scoreWithout);
  });

  it("should apply synergy bonus for experienced + competitive combination", () => {
    const weights = makeZeroWeights();
    const synergyAnswers = {
      "q1-experience": "q1-experienced",
      "q5-goal": "q5-competitive",
    };

    const sTierDeck: Deck = {
      ...baseDeck,
      tier: "S",
    };

    const scoreWithSynergy = calculateDeckScore(sTierDeck, weights, synergyAnswers);
    const scoreWithout = calculateDeckScore(sTierDeck, weights, EMPTY_ANSWERS);

    expect(scoreWithSynergy - scoreWithout).toBe(2.5);
  });

  it("should apply budget scoring based on budgetTier weight", () => {
    const weights = makeZeroWeights();
    weights.budgets.budget = 3;

    const budgetDeck: Deck = { ...baseDeck, budgetTier: "budget" };
    const expensiveDeck: Deck = { ...baseDeck, id: "expensive", budgetTier: "expensive" };

    expect(calculateDeckScore(budgetDeck, weights, EMPTY_ANSWERS)).toBeGreaterThan(
      calculateDeckScore(expensiveDeck, weights, EMPTY_ANSWERS),
    );
  });
});
