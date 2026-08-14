"use client";

import { useState } from "react";
import Image from "next/image";
import { type DeckRecommendation } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { trackEvent } from "@/lib/analytics";

function getLeaderImageUrl(leaderId: string): string {
  return `https://en.onepiece-cardgame.com/images/cardlist/card/${leaderId}.png`;
}

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
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <Card
      className={`relative overflow-hidden cursor-pointer transition-shadow hover:shadow-md ${isTopRank ? "border-op-red/40 shadow-lg ring-1 ring-op-red/20" : ""}`}
      onClick={() => {
        if (!expanded) {
          trackEvent({ name: "deck_expanded", data: { deck: deck.nameKo, rank } });
        }
        setExpanded((prev) => !prev);
      }}
    >
      <div className="mb-3 flex items-start gap-3">
        {!imgError ? (
          <div
            className={`relative shrink-0 overflow-hidden rounded-lg border border-gray-200 shadow-sm ${isTopRank ? "h-[100px] w-[72px]" : "h-[84px] w-[60px]"}`}
          >
            <Image
              src={getLeaderImageUrl(leader.id)}
              alt={`${leader.nameKo} 리더 카드`}
              fill
              sizes={isTopRank ? "72px" : "60px"}
              className="object-cover object-top"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div
            className={`flex shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-2xl ${isTopRank ? "h-[100px] w-[72px]" : "h-[84px] w-[60px]"}`}
          >
            🏴‍☠️
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`text-2xl ${isTopRank ? "text-3xl" : ""}`}>{medal ?? `#${rank}`}</span>
            <div className="min-w-0 flex-1">
              <h3
                className={`truncate font-bold text-gray-900 ${isTopRank ? "text-lg" : "text-base"}`}
              >
                {deck.nameKo}
              </h3>
              <p className="truncate text-sm text-gray-500">{leader.nameKo}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-gray-400">매칭</span>
                <p className="text-sm font-bold text-op-red">{score.toFixed(2)}점</p>
              </div>
              <span
                className={`text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {deck.colors.map((color) => (
          <Badge key={color} variant="color" value={color} />
        ))}
        <Badge variant="tier" value={deck.tier} />
        <Badge variant="difficulty" value={deck.difficulty} />
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {deck.playstyle.map((style) => (
          <Badge key={style} variant="playstyle" value={style} />
        ))}
      </div>

      <p className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
        <span className="font-medium text-gray-800">핵심 전략: </span>
        {deck.keyMechanic}
      </p>

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

      {expanded && <DeckDetail deck={deck} />}
    </Card>
  );
}

function DeckDetail({ deck }: { deck: DeckRecommendation["deck"] }) {
  return (
    <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
      <p className="text-sm leading-relaxed text-gray-700">{deck.description}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-emerald-50 px-3 py-2.5">
          <h4 className="mb-1.5 text-xs font-semibold text-emerald-700">강점</h4>
          <ul className="space-y-1">
            {deck.strengths.map((s, i) => (
              <li key={i} className="text-sm text-emerald-800">
                + {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-red-50 px-3 py-2.5">
          <h4 className="mb-1.5 text-xs font-semibold text-red-700">약점</h4>
          <ul className="space-y-1">
            {deck.weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-red-800">
                - {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {deck.matchups.length > 0 && (
        <div className="rounded-lg bg-gray-50 px-3 py-2.5">
          <h4 className="mb-1.5 text-xs font-semibold text-gray-700">주요 상성</h4>
          <ul className="space-y-1">
            {deck.matchups.map((m, i) => (
              <li key={i} className="text-sm text-gray-700">
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
