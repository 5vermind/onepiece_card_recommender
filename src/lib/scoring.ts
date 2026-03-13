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
  playstyle: 1.5, // Heaviest — core user preference
  tier: 1.0,
  difficulty: 0.8,
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
export function calculateDeckScore(deck: Deck, weights: AggregatedWeights): number {
  // Color score: sum of weights for each color the deck has
  const colorScore = deck.colors.reduce((sum, color) => sum + (weights.colors[color] ?? 0), 0);

  // Playstyle score: sum of weights for each playstyle the deck has
  const playstyleScore = deck.playstyle.reduce(
    (sum, style) => sum + (weights.playstyles[style] ?? 0),
    0,
  );

  // Tier score: weight for the deck's tier
  const tierScore = weights.tiers[deck.tier] ?? 0;

  // Difficulty score: weight for the deck's difficulty
  const difficultyScore = weights.difficulties[deck.difficulty] ?? 0;

  return (
    colorScore * CATEGORY_MULTIPLIERS.color +
    playstyleScore * CATEGORY_MULTIPLIERS.playstyle +
    tierScore * CATEGORY_MULTIPLIERS.tier +
    difficultyScore * CATEGORY_MULTIPLIERS.difficulty
  );
}
