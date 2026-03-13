import type { Metadata } from "next";
import { parseAnswersParam } from "@/lib/answer-codec";
import { recommendDecks } from "@/lib/recommend";
import { ResultContent } from "./ResultContent";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const param = typeof params.a === "string" ? params.a : undefined;

  if (!param) {
    return {
      title: "덱 추천 결과 | 원피스 카드 게임 덱 추천",
    };
  }

  let title = "나의 덱 추천 결과 | 원피스 카드 게임 덱 추천";
  let description = "퀴즈로 찾은 나만의 추천 덱! 당신에게 맞는 덱은 무엇일까요?";

  const answers = parseAnswersParam(param);
  if (answers) {
    const results = recommendDecks(answers);
    const top3 = results.slice(0, 3);
    const names = top3.map((r) => r.deck.nameKo).join(", ");
    title = `추천 덱: ${names} | 원피스 카드 게임`;
    description = `나의 원피스 카드 게임 추천 덱: ${names}. 퀴즈를 풀고 나에게 맞는 덱을 찾아보세요!`;
  }

  const ogImageUrl = `/api/og?a=${param}`;

  return {
    title,
    description,
    openGraph: {
      title: `🏴‍☠️ ${title}`,
      description,
      locale: "ko_KR",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "원피스 카드 게임 덱 추천 결과",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function ResultPage() {
  return <ResultContent />;
}
