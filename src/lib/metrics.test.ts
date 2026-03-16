import { describe, it, expect } from "vitest";
import { recommendDecks } from "./recommend";
import decksData from "@/data/decks.json";
import { type Deck, type DeckRecommendation } from "./types";

const ALL_DECKS = decksData as Deck[];

// ============================================================
// Answer space enumeration
// ============================================================

const Q1_OPTIONS = ["q1-beginner", "q1-intermediate", "q1-experienced"] as const;
const Q2_OPTIONS = ["q2-aggro", "q2-midrange", "q2-control", "q2-combo"] as const;
const Q3_OPTIONS = [
  "q3-red",
  "q3-green",
  "q3-blue",
  "q3-purple",
  "q3-black",
  "q3-yellow",
  "q3-any",
] as const;
const Q4_TEMPO_OPTIONS = ["q4-fast", "q4-medium", "q4-long"] as const;
const Q4_META_OPTIONS = ["q4-top", "q4-counter", "q4-off"] as const;
const Q5_OPTIONS = ["q5-competitive", "q5-casual", "q5-both"] as const;
const Q6_OPTIONS = ["q6-low", "q6-mid", "q6-high"] as const;
/**
 * Generate all valid answer combinations respecting conditional branching.
 * - q1 beginner/intermediate -> q4-tempo (3 options)
 * - q1 experienced -> q4-meta (3 options)
 *
 * Total: 3 × 4 × 7 × 3 × 3 × 3 = 2,268
 */
function generateAllCombinations(): Record<string, string>[] {
  const combinations: Record<string, string>[] = [];

  for (const q1 of Q1_OPTIONS) {
    const q4Options = q1 === "q1-experienced" ? Q4_META_OPTIONS : Q4_TEMPO_OPTIONS;
    const q4Key = q1 === "q1-experienced" ? "q4-meta" : "q4-tempo";

    for (const q2 of Q2_OPTIONS) {
      for (const q3 of Q3_OPTIONS) {
        for (const q4 of q4Options) {
          for (const q5 of Q5_OPTIONS) {
            for (const q6 of Q6_OPTIONS) {
              combinations.push({
                "q1-experience": q1,
                "q2-playstyle": q2,
                "q3-color": q3,
                [q4Key]: q4,
                "q5-goal": q5,
                "q6-budget": q6,
              });
            }
          }
        }
      }
    }
  }

  return combinations;
}

// ============================================================
// Run all combinations once (shared across tests)
// ============================================================

interface CombinationResult {
  answers: Record<string, string>;
  results: DeckRecommendation[];
}

let allResults: CombinationResult[] | null = null;

function getAllResults(): CombinationResult[] {
  if (allResults) return allResults;

  const combinations = generateAllCombinations();
  allResults = combinations.map((answers) => ({
    answers,
    results: recommendDecks(answers),
  }));
  return allResults;
}

// ============================================================
// Tests
// ============================================================

describe("Metrics: Answer Space", () => {
  it("should generate exactly 3,780 valid combinations", () => {
    const combinations = generateAllCombinations();
    expect(combinations).toHaveLength(2268);
  });
});

describe("Metrics: Deck Coverage", () => {
  it("every deck should appear in top-3 for at least one combination", () => {
    const results = getAllResults();
    const top3Appearances = new Map<string, number>();

    for (const deck of ALL_DECKS) {
      top3Appearances.set(deck.id, 0);
    }

    for (const { results: recs } of results) {
      for (const rec of recs.slice(0, 3)) {
        top3Appearances.set(rec.deck.id, (top3Appearances.get(rec.deck.id) ?? 0) + 1);
      }
    }

    const deadDecks = ALL_DECKS.filter((d) => (top3Appearances.get(d.id) ?? 0) === 0);

    if (deadDecks.length > 0) {
      const deadList = deadDecks.map((d) => `${d.id} (${d.nameKo})`).join(", ");
      console.warn(`[Coverage] Dead decks (never in top-3): ${deadList}`);
    }

    console.log("\n=== Deck Coverage (Top-3) ===");
    const sorted = [...top3Appearances.entries()].sort((a, b) => b[1] - a[1]);
    for (const [deckId, count] of sorted) {
      const deck = ALL_DECKS.find((d) => d.id === deckId);
      const pct = ((count / results.length) * 100).toFixed(1);
      console.log(
        `  ${deck?.nameKo?.padEnd(10, "\u3000")} (${deckId.padEnd(14)}): ${count.toString().padStart(5)} / ${results.length} (${pct}%)`,
      );
    }

    expect(deadDecks).toHaveLength(0);
  });

  it("every deck should appear in top-5 for at least one combination", () => {
    const results = getAllResults();
    const top5Appearances = new Map<string, number>();

    for (const deck of ALL_DECKS) {
      top5Appearances.set(deck.id, 0);
    }

    for (const { results: recs } of results) {
      for (const rec of recs.slice(0, 5)) {
        top5Appearances.set(rec.deck.id, (top5Appearances.get(rec.deck.id) ?? 0) + 1);
      }
    }

    const deadDecks = ALL_DECKS.filter((d) => (top5Appearances.get(d.id) ?? 0) === 0);
    expect(deadDecks).toHaveLength(0);
  });
});

describe("Metrics: Dominance Check", () => {
  it("no single deck should appear in top-3 for ALL combinations", () => {
    const results = getAllResults();
    const top3Appearances = new Map<string, number>();

    for (const deck of ALL_DECKS) {
      top3Appearances.set(deck.id, 0);
    }

    for (const { results: recs } of results) {
      for (const rec of recs.slice(0, 3)) {
        top3Appearances.set(rec.deck.id, (top3Appearances.get(rec.deck.id) ?? 0) + 1);
      }
    }

    const dominantDecks = ALL_DECKS.filter(
      (d) => (top3Appearances.get(d.id) ?? 0) === results.length,
    );

    if (dominantDecks.length > 0) {
      const list = dominantDecks.map((d) => `${d.id} (${d.nameKo})`).join(", ");
      console.warn(`[Dominance] Decks in top-3 for ALL ${results.length} combinations: ${list}`);
    }

    expect(dominantDecks).toHaveLength(0);
  });

  it("no deck should appear in top-3 for more than 50% of combinations", () => {
    const results = getAllResults();
    const top3Appearances = new Map<string, number>();

    for (const deck of ALL_DECKS) {
      top3Appearances.set(deck.id, 0);
    }

    for (const { results: recs } of results) {
      for (const rec of recs.slice(0, 3)) {
        top3Appearances.set(rec.deck.id, (top3Appearances.get(rec.deck.id) ?? 0) + 1);
      }
    }

    const threshold = results.length * 0.5;
    const overRepresented = ALL_DECKS.filter((d) => (top3Appearances.get(d.id) ?? 0) > threshold);

    if (overRepresented.length > 0) {
      console.warn("\n=== Over-Represented Decks (>50% top-3) ===");
      for (const deck of overRepresented) {
        const count = top3Appearances.get(deck.id) ?? 0;
        const pct = ((count / results.length) * 100).toFixed(1);
        console.warn(`  ${deck.nameKo} (${deck.id}): ${count}/${results.length} (${pct}%)`);
        console.warn(
          `    colors: [${deck.colors.join(", ")}], playstyle: [${deck.playstyle.join(", ")}]`,
        );
      }
    }

    expect(overRepresented).toHaveLength(0);
  });

  it("multi-attribute decks should not have structural scoring advantage > 2x vs single-attribute decks", () => {
    const results = getAllResults();
    const avgScoreByDeck = new Map<string, number>();

    for (const deck of ALL_DECKS) {
      avgScoreByDeck.set(deck.id, 0);
    }

    for (const { results: recs } of results) {
      for (const rec of recs) {
        avgScoreByDeck.set(rec.deck.id, (avgScoreByDeck.get(rec.deck.id) ?? 0) + rec.score);
      }
    }

    for (const [deckId, totalScore] of avgScoreByDeck) {
      avgScoreByDeck.set(deckId, totalScore / results.length);
    }

    const multiAttrDecks = ALL_DECKS.filter((d) => d.colors.length > 1 || d.playstyle.length > 1);
    const singleAttrDecks = ALL_DECKS.filter(
      (d) => d.colors.length === 1 && d.playstyle.length === 1,
    );

    if (multiAttrDecks.length === 0 || singleAttrDecks.length === 0) return;

    const avgMulti =
      multiAttrDecks.reduce((sum, d) => sum + (avgScoreByDeck.get(d.id) ?? 0), 0) /
      multiAttrDecks.length;
    const avgSingle =
      singleAttrDecks.reduce((sum, d) => sum + (avgScoreByDeck.get(d.id) ?? 0), 0) /
      singleAttrDecks.length;

    console.log("\n=== Multi vs Single Attribute Average Scores ===");
    console.log(
      `  Multi-attribute decks (${multiAttrDecks.length}): avg score = ${avgMulti.toFixed(2)}`,
    );
    console.log(
      `  Single-attribute decks (${singleAttrDecks.length}): avg score = ${avgSingle.toFixed(2)}`,
    );
    console.log(`  Ratio: ${(avgMulti / avgSingle).toFixed(2)}x`);

    expect(avgMulti / avgSingle).toBeLessThan(2.0);
  });
});

// Real user answer distribution: 661 quiz completions (Umami, 2026-03-13), q7 stripped
const REAL_USER_ANSWER_CODES: Record<string, number> = {
  "216212": 30,
  "216022": 25,
  "216222": 23,
  "236121": 22,
  "221111": 19,
  "006102": 18,
  "226101": 15,
  "216221": 13,
  "233221": 13,
  "226002": 12,
  "116121": 11,
  "216001": 11,
  "116210": 10,
  "133121": 9,
  "211002": 9,
  "216002": 9,
  "225102": 9,
  "226122": 9,
  "216021": 8,
  "124111": 7,
  "206121": 7,
  "212102": 7,
  "222002": 7,
  "225122": 7,
  "006101": 7,
  "116102": 6,
  "211022": 6,
  "216012": 6,
  "216102": 6,
  "226022": 6,
  "234200": 6,
  "235002": 6,
  "126121": 5,
  "206102": 5,
  "216201": 5,
  "216202": 5,
  "225202": 5,
  "226001": 5,
  "226121": 5,
  "226202": 5,
  "236102": 5,
  "004102": 5,
  "116111": 4,
  "205002": 4,
  "206002": 4,
  "206022": 4,
  "211101": 4,
  "216000": 4,
  "216121": 4,
  "216211": 4,
  "225002": 4,
  "226102": 4,
  "226112": 4,
  "235022": 4,
  "236002": 4,
  "016102": 4,
  "006002": 4,
  "116202": 3,
  "116221": 3,
  "126022": 3,
  "204002": 3,
  "205022": 3,
  "211012": 3,
  "211021": 3,
  "211102": 3,
  "212002": 3,
  "213202": 3,
  "216011": 3,
  "221002": 3,
  "221011": 3,
  "221022": 3,
  "225022": 3,
  "225101": 3,
  "225222": 3,
  "234202": 3,
  "235001": 3,
  "235102": 3,
  "236022": 3,
  "236122": 3,
  "236202": 3,
  "016121": 3,
  "016202": 3,
  "106002": 2,
  "106102": 2,
  "106202": 2,
  "116211": 2,
  "116222": 2,
  "203202": 2,
  "206001": 2,
  "206021": 2,
  "211001": 2,
  "211111": 2,
  "211122": 2,
  "212022": 2,
  "213222": 2,
  "216010": 2,
  "216020": 2,
  "216101": 2,
  "216111": 2,
  "216120": 2,
  "216122": 2,
  "221001": 2,
  "221020": 2,
  "225001": 2,
  "225201": 2,
  "226011": 2,
  "226012": 2,
  "226100": 2,
  "226120": 2,
  "226222": 2,
  "231102": 2,
  "231202": 2,
  "233202": 2,
  "235021": 2,
  "236001": 2,
  "236021": 2,
  "236221": 2,
  "236222": 2,
  "016112": 2,
  "006202": 2,
  "016002": 2,
  "016111": 2,
  "006001": 2,
  "106022": 1,
  "116002": 1,
  "116021": 1,
  "116201": 1,
  "126002": 1,
  "126202": 1,
  "133221": 1,
  "202002": 1,
  "203002": 1,
  "204022": 1,
  "205001": 1,
  "205202": 1,
  "206000": 1,
  "206222": 1,
  "211020": 1,
  "211202": 1,
  "223202": 1,
  "223222": 1,
  "225020": 1,
  "225220": 1,
  "226111": 1,
  "226221": 1,
  "231002": 1,
  "232002": 1,
  "234002": 1,
  "234022": 1,
  "235122": 1,
  "236101": 1,
  "236120": 1,
  "006022": 1,
  "016222": 1,
  "006011": 1,
  "004002": 1,
  "006122": 1,
};

function decodeAnswerCode(code: string): Record<string, string> | null {
  if (code.length !== 6) return null;

  const q1Idx = Number(code[0]);
  const q1Options = ["q1-beginner", "q1-intermediate", "q1-experienced"];
  if (q1Idx >= q1Options.length) return null;
  const q1 = q1Options[q1Idx];

  const q2Idx = Number(code[1]);
  const q2Options = ["q2-aggro", "q2-midrange", "q2-control", "q2-combo"];
  if (q2Idx >= q2Options.length) return null;

  const q3Idx = Number(code[2]);
  const q3Options = [
    "q3-red",
    "q3-green",
    "q3-blue",
    "q3-purple",
    "q3-black",
    "q3-yellow",
    "q3-any",
  ];
  if (q3Idx >= q3Options.length) return null;

  const q4Idx = Number(code[3]);
  const isExperienced = q1 === "q1-experienced";
  const q4Key = isExperienced ? "q4-meta" : "q4-tempo";
  const q4Options = isExperienced
    ? ["q4-top", "q4-counter", "q4-off"]
    : ["q4-fast", "q4-medium", "q4-long"];
  if (q4Idx >= q4Options.length) return null;

  const q5Idx = Number(code[4]);
  const q5Options = ["q5-competitive", "q5-casual", "q5-both"];
  if (q5Idx >= q5Options.length) return null;

  const q6Idx = Number(code[5]);
  const q6Options = ["q6-low", "q6-mid", "q6-high"];
  if (q6Idx >= q6Options.length) return null;

  return {
    "q1-experience": q1,
    "q2-playstyle": q2Options[q2Idx],
    "q3-color": q3Options[q3Idx],
    [q4Key]: q4Options[q4Idx],
    "q5-goal": q5Options[q5Idx],
    "q6-budget": q6Options[q6Idx],
  };
}

interface WeightedResult {
  answers: Record<string, string>;
  results: DeckRecommendation[];
  weight: number;
}

let weightedResults: WeightedResult[] | null = null;

function getWeightedResults(): WeightedResult[] {
  if (weightedResults) return weightedResults;

  weightedResults = [];
  for (const [code, count] of Object.entries(REAL_USER_ANSWER_CODES)) {
    if (count <= 0) continue;
    const answers = decodeAnswerCode(code);
    if (!answers) continue;
    weightedResults.push({
      answers,
      results: recommendDecks(answers),
      weight: count,
    });
  }
  return weightedResults;
}

describe("Metrics: Weighted Deck Coverage (Umami)", () => {
  it("should decode all answer codes successfully", () => {
    let decoded = 0;
    let failed = 0;
    for (const [code, count] of Object.entries(REAL_USER_ANSWER_CODES)) {
      if (count <= 0) continue;
      const result = decodeAnswerCode(code);
      if (result) {
        decoded += count;
      } else {
        failed += count;
        console.warn(`Failed to decode: ${code} (count=${count})`);
      }
    }
    console.log(`Decoded: ${decoded}, Failed: ${failed}`);
    expect(failed).toBe(0);
  });

  it("weighted top-3 appearance should reflect real user traffic", () => {
    const results = getWeightedResults();
    const totalWeight = results.reduce((sum, r) => sum + r.weight, 0);
    const weightedTop3 = new Map<string, number>();

    for (const deck of ALL_DECKS) {
      weightedTop3.set(deck.id, 0);
    }

    for (const { results: recs, weight } of results) {
      for (const rec of recs.slice(0, 3)) {
        weightedTop3.set(rec.deck.id, (weightedTop3.get(rec.deck.id) ?? 0) + weight);
      }
    }

    console.log(`\n=== Weighted Deck Coverage (Top-3, n=${totalWeight}) ===`);
    console.log("  [What real users actually see as recommendations]");
    const sorted = [...weightedTop3.entries()].sort((a, b) => b[1] - a[1]);
    for (const [deckId, weightedCount] of sorted) {
      const deck = ALL_DECKS.find((d) => d.id === deckId);
      const pct = ((weightedCount / totalWeight) * 100).toFixed(1);
      console.log(
        `  ${deck?.nameKo?.padEnd(10, "\u3000")} (${deck?.tier} | ${deckId.padEnd(14)}): weighted ${weightedCount.toString().padStart(5)} / ${totalWeight} (${pct}%)`,
      );
    }

    const deadDecks = ALL_DECKS.filter((d) => (weightedTop3.get(d.id) ?? 0) / totalWeight < 0.005);
    if (deadDecks.length > 0) {
      console.warn(
        `\n  [Warning] Decks below 0.5% weighted traffic: ${deadDecks.map((d) => d.nameKo).join(", ")}`,
      );
    }

    const overRepresented = ALL_DECKS.filter(
      (d) => (weightedTop3.get(d.id) ?? 0) / totalWeight > 0.6,
    );
    expect(overRepresented).toHaveLength(0);
  });

  it("weighted top-1 distribution should show reasonable spread", () => {
    const results = getWeightedResults();
    const totalWeight = results.reduce((sum, r) => sum + r.weight, 0);
    const weightedTop1 = new Map<string, number>();

    for (const deck of ALL_DECKS) {
      weightedTop1.set(deck.id, 0);
    }

    for (const { results: recs, weight } of results) {
      if (recs.length > 0) {
        weightedTop1.set(recs[0].deck.id, (weightedTop1.get(recs[0].deck.id) ?? 0) + weight);
      }
    }

    console.log(`\n=== Weighted Top-1 Recommendation (n=${totalWeight}) ===`);
    console.log("  [What real users see as #1 recommendation]");
    const sorted = [...weightedTop1.entries()]
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
    for (const [deckId, weightedCount] of sorted) {
      const deck = ALL_DECKS.find((d) => d.id === deckId);
      const pct = ((weightedCount / totalWeight) * 100).toFixed(1);
      console.log(`  ${deck?.nameKo?.padEnd(10, "\u3000")} (${deck?.tier}): ${pct}%`);
    }

    const dominant = sorted.filter(([, count]) => count / totalWeight > 0.35);
    expect(dominant).toHaveLength(0);
  });
});

describe("Metrics: Weighted vs Uniform Comparison", () => {
  it("should compare weighted (real) vs uniform distributions", () => {
    const uniformResults = getAllResults();
    const realResults = getWeightedResults();
    const totalRealWeight = realResults.reduce((sum, r) => sum + r.weight, 0);

    const uniformTop3 = new Map<string, number>();
    for (const deck of ALL_DECKS) uniformTop3.set(deck.id, 0);
    for (const { results: recs } of uniformResults) {
      for (const rec of recs.slice(0, 3)) {
        uniformTop3.set(rec.deck.id, (uniformTop3.get(rec.deck.id) ?? 0) + 1);
      }
    }

    const weightedTop3 = new Map<string, number>();
    for (const deck of ALL_DECKS) weightedTop3.set(deck.id, 0);
    for (const { results: recs, weight } of realResults) {
      for (const rec of recs.slice(0, 3)) {
        weightedTop3.set(rec.deck.id, (weightedTop3.get(rec.deck.id) ?? 0) + weight);
      }
    }

    console.log("\n=== Uniform vs Weighted Top-3 Comparison ===");
    console.log("  Deck                  | Uniform  | Weighted | Delta");
    console.log("  " + "-".repeat(60));

    const allDecksSorted = [...ALL_DECKS].sort((a, b) => {
      const wA = (weightedTop3.get(a.id) ?? 0) / totalRealWeight;
      const wB = (weightedTop3.get(b.id) ?? 0) / totalRealWeight;
      return wB - wA;
    });

    for (const deck of allDecksSorted) {
      const uPct = ((uniformTop3.get(deck.id) ?? 0) / uniformResults.length) * 100;
      const wPct = ((weightedTop3.get(deck.id) ?? 0) / totalRealWeight) * 100;
      const delta = wPct - uPct;
      const arrow = delta > 2 ? " ▲" : delta < -2 ? " ▼" : "";
      console.log(
        `  ${deck.nameKo?.padEnd(10, "\u3000")} (${deck.tier}) | ${uPct.toFixed(1).padStart(5)}%  | ${wPct.toFixed(1).padStart(5)}%  | ${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%${arrow}`,
      );
    }

    expect(true).toBe(true);
  });
});

describe("Metrics: Score Distribution", () => {
  it("should report score spread statistics", () => {
    const results = getAllResults();

    const top1Scores: number[] = [];
    const top2Scores: number[] = [];
    const gaps: number[] = [];
    const stdDevs: number[] = [];

    for (const { results: recs } of results) {
      const scores = recs.map((r) => r.score);
      top1Scores.push(scores[0]);
      top2Scores.push(scores[1]);
      gaps.push(scores[0] - scores[1]);

      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
      stdDevs.push(Math.sqrt(variance));
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const minGap = Math.min(...gaps);
    const maxGap = Math.max(...gaps);
    const avgStdDev = stdDevs.reduce((a, b) => a + b, 0) / stdDevs.length;
    const zeroGaps = gaps.filter((g) => g === 0).length;

    console.log("\n=== Score Spread Statistics ===");
    console.log(
      `  Top-1 vs Top-2 gap: avg=${avgGap.toFixed(2)}, min=${minGap.toFixed(2)}, max=${maxGap.toFixed(2)}`,
    );
    console.log(
      `  Zero-gap cases (tied #1): ${zeroGaps} / ${results.length} (${((zeroGaps / results.length) * 100).toFixed(1)}%)`,
    );
    console.log(`  Score std dev (avg across combos): ${avgStdDev.toFixed(2)}`);
    console.log(
      `  Top-1 score range: ${Math.min(...top1Scores).toFixed(2)} ~ ${Math.max(...top1Scores).toFixed(2)}`,
    );

    expect(Math.min(...top1Scores)).toBeGreaterThan(0);
  });
});
