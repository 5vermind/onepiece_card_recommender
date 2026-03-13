import {
  type AggregatedWeights,
  type BudgetTier,
  type Color,
  type Deck,
  type Difficulty,
  type Playstyle,
  type QuizQuestion,
  type Tier,
} from "@/lib/types";

const CATEGORY_MULTIPLIERS = {
  color: 1.0,
  playstyle: 1.5,
  tier: 1.3,
  difficulty: 0.8,
  budget: 0.6,
} as const;

/**
 * Merge all selected options' weights into a single AggregatedWeights object.
 */
export function aggregateWeights(
  answers: Record<string, string>,
  questions: QuizQuestion[],
): AggregatedWeights {
  const result: AggregatedWeights = {
    colors: { Red: 0, Green: 0, Blue: 0, Purple: 0, Black: 0, Yellow: 0 },
    playstyles: { aggro: 0, midrange: 0, control: 0, combo: 0 },
    tiers: { S: 0, A: 0, B: 0, C: 0 },
    difficulties: { easy: 0, medium: 0, hard: 0 },
    budgets: { budget: 0, mid: 0, expensive: 0 },
  };

  for (const question of questions) {
    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) continue;

    const option = question.options.find((o) => o.id === selectedOptionId);
    if (!option) continue;

    const w = option.weights;

    if (w.colors) {
      for (const [k, v] of Object.entries(w.colors)) {
        result.colors[k as Color] += v;
      }
    }
    if (w.playstyles) {
      for (const [k, v] of Object.entries(w.playstyles)) {
        result.playstyles[k as Playstyle] += v;
      }
    }
    if (w.tiers) {
      for (const [k, v] of Object.entries(w.tiers)) {
        result.tiers[k as Tier] += v;
      }
    }
    if (w.difficulties) {
      for (const [k, v] of Object.entries(w.difficulties)) {
        result.difficulties[k as Difficulty] += v;
      }
    }
    if (w.budgets) {
      for (const [k, v] of Object.entries(w.budgets)) {
        result.budgets[k as BudgetTier] += v;
      }
    }
  }

  return result;
}

/**
 * Calculate a weighted score for a single deck against the aggregated user preferences.
 */
export function calculateDeckScore(
  deck: Deck,
  weights: AggregatedWeights,
  answers: Record<string, string>,
): number {
  const colorScore =
    deck.colors.reduce((sum, color) => sum + (weights.colors[color] ?? 0), 0) / deck.colors.length;

  const playstyleScore =
    deck.playstyle.reduce((sum, style) => sum + (weights.playstyles[style] ?? 0), 0) /
    deck.playstyle.length;

  const tierScore = weights.tiers[deck.tier] ?? 0;
  const difficultyScore = weights.difficulties[deck.difficulty] ?? 0;
  const budgetScore = weights.budgets[deck.budgetTier] ?? 0;

  const base =
    colorScore * CATEGORY_MULTIPLIERS.color +
    playstyleScore * CATEGORY_MULTIPLIERS.playstyle +
    tierScore * CATEGORY_MULTIPLIERS.tier +
    difficultyScore * CATEGORY_MULTIPLIERS.difficulty +
    budgetScore * CATEGORY_MULTIPLIERS.budget;

  return base + calculateSynergyBonus(deck, answers);
}

interface SynergyRule {
  conditions: Record<string, string[]>;
  deckFilter: (deck: Deck) => boolean;
  bonus: number;
}

const SYNERGY_RULES: SynergyRule[] = [
  {
    conditions: { "q1-experience": ["q1-beginner"], "q2-playstyle": ["q2-aggro"] },
    deckFilter: (d) => d.playstyle.includes("aggro") && d.difficulty === "medium",
    bonus: 2.0,
  },
  {
    conditions: { "q2-playstyle": ["q2-aggro"], "q4-tempo": ["q4-fast"] },
    deckFilter: (d) => d.playstyle.includes("aggro"),
    bonus: 1.5,
  },
  {
    conditions: { "q2-playstyle": ["q2-control"], "q4-tempo": ["q4-long"] },
    deckFilter: (d) => d.playstyle.includes("control"),
    bonus: 1.5,
  },
  {
    conditions: { "q2-playstyle": ["q2-combo"], "q1-experience": ["q1-experienced"] },
    deckFilter: (d) => d.playstyle.includes("combo") && d.difficulty === "hard",
    bonus: 2.0,
  },
  {
    conditions: { "q1-experience": ["q1-experienced"], "q5-goal": ["q5-competitive"] },
    deckFilter: (d) => d.tier === "S",
    bonus: 2.5,
  },
  {
    conditions: { "q6-budget": ["q6-low"], "q5-goal": ["q5-casual"] },
    deckFilter: (d) => d.budgetTier === "budget",
    bonus: 2.0,
  },
];

function calculateSynergyBonus(deck: Deck, answers: Record<string, string>): number {
  let bonus = 0;

  for (const rule of SYNERGY_RULES) {
    const conditionsMet = Object.entries(rule.conditions).every(([questionId, validAnswers]) =>
      validAnswers.includes(answers[questionId]),
    );

    if (conditionsMet && rule.deckFilter(deck)) {
      bonus += rule.bonus;
    }
  }

  return bonus;
}
