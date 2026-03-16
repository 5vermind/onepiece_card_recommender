"use client";

import { Suspense, useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { parseAnswersParam } from "@/lib/answer-codec";
import { recommendDecks } from "@/lib/recommend";
import { trackEvent, SCORING_VERSION } from "@/lib/analytics";
import { DeckCard } from "@/components/DeckCard";
import { ShareButton } from "@/components/ShareButton";
import { Button } from "@/components/ui/Button";

function ResultInner() {
  const searchParams = useSearchParams();
  const [showAll, setShowAll] = useState(false);
  const tracked = useRef(false);

  const { results, error } = useMemo(() => {
    const param = searchParams.get("a");
    if (!param) {
      return { results: null, error: "답변 데이터가 없습니다." };
    }

    const answers = parseAnswersParam(param);
    if (!answers) {
      return { results: null, error: "답변 데이터를 읽을 수 없습니다." };
    }

    return { results: recommendDecks(answers), error: null };
  }, [searchParams]);

  useEffect(() => {
    if (!tracked.current && results && results.length > 0) {
      tracked.current = true;
      trackEvent({
        name: "result_viewed",
        data: {
          top_deck: results[0].deck.nameKo,
          top_score: results[0].score,
          total: results.length,
          sv: SCORING_VERSION,
        },
      });
    }
  }, [results]);

  if (error || !results) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 text-5xl">😢</div>
        <h1 className="text-xl font-bold text-gray-900">{error ?? "문제가 발생했어요"}</h1>
        <p className="mt-2 text-gray-500">퀴즈를 다시 진행해 주세요.</p>
        <Link
          href="/quiz"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-op-red px-6 font-semibold text-white transition-all hover:brightness-110"
        >
          퀴즈 다시 하기
        </Link>
      </div>
    );
  }

  const top3 = results.slice(0, 3);
  const rest = results.slice(3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-2 text-4xl">🏴‍☠️</div>
        <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">당신에게 추천하는 덱</h1>
        <p className="mt-2 text-gray-500">퀴즈 결과를 바탕으로 가장 적합한 덱을 찾았어요!</p>
      </div>

      <div className="space-y-4">
        {top3.map((recommendation, index) => (
          <DeckCard key={recommendation.deck.id} recommendation={recommendation} rank={index + 1} />
        ))}
      </div>

      {rest.length > 0 && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => {
              if (!showAll) trackEvent({ name: "show_all_clicked" });
              setShowAll((prev) => !prev);
            }}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            {showAll ? "접기 ▲" : `전체 순위 보기 (${results.length}개 덱) ▼`}
          </button>

          {showAll && (
            <div className="mt-4 space-y-3">
              {rest.map((recommendation, index) => (
                <DeckCard
                  key={recommendation.deck.id}
                  recommendation={recommendation}
                  rank={index + 4}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <ShareButton />
        <Link href="/quiz" onClick={() => trackEvent({ name: "retry_clicked" })}>
          <Button variant="primary" size="lg">
            다시 하기 🔄
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="lg">
            처음으로
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function ResultContent() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-gray-500">결과를 불러오는 중...</p>
        </div>
      }
    >
      <ResultInner />
    </Suspense>
  );
}
