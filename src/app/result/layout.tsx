import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "나의 덱 추천 결과 | 원피스 카드 게임 덱 추천",
  description:
    "원피스 카드 게임 덱 추천 결과를 확인하세요! 나에게 맞는 덱을 찾아보고 친구에게 공유해 보세요.",
  openGraph: {
    title: "🏴‍☠️ 나의 원피스 카드 게임 추천 덱은?",
    description: "퀴즈로 찾은 나만의 추천 덱! 당신에게 맞는 덱은 무엇일까요?",
    locale: "ko_KR",
    type: "website",
  },
};

export default function ResultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
