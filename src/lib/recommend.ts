import {
  type Color,
  type Deck,
  type DeckRecommendation,
  type Difficulty,
  type Leader,
  type Playstyle,
  type AggregatedWeights,
} from "@/lib/types";
import { aggregateWeights, calculateDeckScore } from "@/lib/scoring";
import { resolveQuestions } from "@/lib/quiz-flow";
import decksData from "@/data/decks.json";
import leadersData from "@/data/leaders.json";

const decks = decksData as Deck[];
const leaders = leadersData as Leader[];

export function recommendDecks(answers: Record<string, string>): DeckRecommendation[] {
  const questions = resolveQuestions(answers);
  const weights = aggregateWeights(answers, questions);

  const scored = decks
    .map((deck) => {
      const leader = leaders.find((l) => l.id === deck.leaderId);
      return {
        deck,
        leader: leader ?? {
          id: deck.leaderId,
          name: "Unknown",
          nameKo: "알 수 없음",
          colors: deck.colors,
          life: 0,
          power: 0,
          set: "",
        },
        score: calculateDeckScore(deck, weights, answers),
        matchReasons: generateMatchReasons(deck, weights),
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored;
}

/**
 * Generate human-readable Korean match reasons for a deck based on user weights.
 */
export function generateMatchReasons(deck: Deck, weights: AggregatedWeights): string[] {
  const reasons: string[] = [];

  // Playstyle match
  const topPlaystyle = getTopKey(weights.playstyles);
  if (topPlaystyle && deck.playstyle.includes(topPlaystyle)) {
    const labels: Record<Playstyle, string> = {
      aggro: "공격적인",
      midrange: "균형 잡힌",
      control: "컨트롤",
      combo: "콤보",
    };
    reasons.push(`${labels[topPlaystyle]} 플레이 스타일에 딱 맞는 덱이에요!`);
  }

  // Color match
  const topColor = getTopKey(weights.colors);
  if (topColor && deck.colors.includes(topColor)) {
    const labels: Record<Color, string> = {
      Red: "레드",
      Green: "그린",
      Blue: "블루",
      Purple: "퍼플",
      Black: "블랙",
      Yellow: "옐로",
    };
    reasons.push(`선호하시는 ${labels[topColor]} 색상의 덱이에요!`);
  }

  // Tier match
  if (deck.tier === "S") {
    reasons.push("현재 메타에서 최상위 티어 덱이에요!");
  } else if (deck.tier === "A") {
    reasons.push("메타에서 안정적으로 활약하는 덱이에요!");
  }

  // Difficulty match
  const topDiff = getTopKey(weights.difficulties);
  if (topDiff && deck.difficulty === topDiff) {
    const labels: Record<Difficulty, string> = {
      easy: "심플하고 배우기 쉬운",
      medium: "적당한 깊이의",
      hard: "마스터하면 강력한",
    };
    reasons.push(`${labels[topDiff]} 덱이에요!`);
  }

  // Fallback
  if (reasons.length === 0) {
    reasons.push("다양한 선호도를 균형 있게 충족하는 덱이에요!");
  }

  return reasons.slice(0, 3);
}

/**
 * Find the key with the highest value in a record.
 * Returns null if all values are 0.
 */
function getTopKey<T extends string>(record: Record<T, number>): T | null {
  let maxKey: T | null = null;
  let maxVal = 0;
  for (const [key, val] of Object.entries(record) as [T, number][]) {
    if (val > maxVal) {
      maxVal = val;
      maxKey = key;
    }
  }
  return maxKey;
}
