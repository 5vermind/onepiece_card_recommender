// ============================================================
// Domain Value Types
// ============================================================

export type Color = "Red" | "Green" | "Blue" | "Purple" | "Black" | "Yellow";
export type Playstyle = "aggro" | "midrange" | "control" | "combo";
export type Tier = "S" | "A" | "B" | "C";
export type Difficulty = "easy" | "medium" | "hard";
export type BudgetTier = "budget" | "mid" | "expensive";

// ============================================================
// Domain Entities
// ============================================================

export interface Leader {
  id: string;
  name: string;
  nameKo: string;
  colors: Color[];
  life: number;
  power: number;
  set: string;
}

export interface Deck {
  id: string;
  name: string;
  nameKo: string;
  leaderId: string;
  colors: Color[];
  playstyle: Playstyle[];
  tier: Tier;
  difficulty: Difficulty;
  budgetTier: BudgetTier;
  keyMechanic: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  matchups: string[];      // e.g. "어그로 덱에 강함", "컨트롤에 약함"
  keyCards: string[];      // 핵심 카드 3~5장 (Korean names)
  playTips: string[];      // 플레이 팁 2~3개
  tags: string[];
}

// ============================================================
// Quiz Types
// ============================================================

export interface QuizQuestion {
  id: string;
  text: string;
  description: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
  icon: string;
  weights: ScoringWeights;
}

export interface ScoringWeights {
  colors?: Partial<Record<Color, number>>;
  playstyles?: Partial<Record<Playstyle, number>>;
  tiers?: Partial<Record<Tier, number>>;
  difficulties?: Partial<Record<Difficulty, number>>;
  budgets?: Partial<Record<BudgetTier, number>>;

// ============================================================
// Quiz State
// ============================================================

export interface QuizState {
  currentStep: number;
  answers: Record<string, string>;
  isComplete: boolean;
}

// ============================================================
// Recommendation Result
// ============================================================

export interface DeckRecommendation {
  deck: Deck;
  leader: Leader;
  score: number;
  matchReasons: string[];
}

// ============================================================
// Aggregated Weights (internal to scoring)
// ============================================================

export interface AggregatedWeights {
  colors: Record<Color, number>;
  playstyles: Record<Playstyle, number>;
  tiers: Record<Tier, number>;
  difficulties: Record<Difficulty, number>;
  budgets: Record<BudgetTier, number>;
}
