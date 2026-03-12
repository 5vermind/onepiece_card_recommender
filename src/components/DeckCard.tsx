import { type DeckRecommendation } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface DeckCardProps {
  recommendation: DeckRecommendation;
  rank: number;
}

const rankMedals: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function DeckCard({ recommendation, rank }: DeckCardProps) {
  const { deck, leader, score, matchReasons } = recommendation;
  const medal = rankMedals[rank];
  const isTopRank = rank === 1;

  return (
    <Card
      className={`relative overflow-hidden ${isTopRank ? "border-op-red/40 shadow-lg ring-1 ring-op-red/20" : ""}`}
    >
      {/* Rank indicator */}
      <div className="mb-3 flex items-center gap-2">
        <span className={`text-2xl ${isTopRank ? "text-3xl" : ""}`}>
          {medal ?? `#${rank}`}
        </span>
        <div className="flex-1">
          <h3
            className={`font-bold text-gray-900 ${isTopRank ? "text-lg" : "text-base"}`}
          >
            {deck.nameKo}
          </h3>
          <p className="text-sm text-gray-500">{leader.nameKo}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">매칭</span>
          <p className="text-sm font-bold text-op-red">{score}점</p>
        </div>
      </div>

      {/* Color badges */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {deck.colors.map((color) => (
          <Badge key={color} variant="color" value={color} />
        ))}
        <Badge variant="tier" value={deck.tier} />
        <Badge variant="difficulty" value={deck.difficulty} />
      </div>

      {/* Playstyle badges */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {deck.playstyle.map((style) => (
          <Badge key={style} variant="playstyle" value={style} />
        ))}
      </div>

      {/* Key mechanic */}
      <p className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
        <span className="font-medium text-gray-800">핵심 전략: </span>
        {deck.keyMechanic}
      </p>

      {/* Match reasons */}
      {matchReasons.length > 0 && (
        <ul className="space-y-1">
          {matchReasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-1.5 text-sm text-gray-600">
              <span className="mt-0.5 text-op-red">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
