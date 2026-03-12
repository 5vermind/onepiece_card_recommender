import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "원피스 카드 게임 덱 추천",
  description:
    "5개 질문에 답하면 당신에게 딱 맞는 원피스 카드 게임 덱을 추천해 드려요! OP-11 최신 메타 반영.",
  openGraph: {
    title: "원피스 카드 게임 덱 추천",
    description:
      "5개 질문에 답하면 당신에게 딱 맞는 원피스 카드 게임 덱을 추천해 드려요!",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col bg-gray-50 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center px-4 py-3">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-gray-900"
            >
              <span className="text-op-red">🏴‍☠️</span> OP 덱 추천
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
          <p>원피스 카드 게임 덱 추천 · OP-11 메타 기준</p>
          <p className="mt-1">
            비공식 팬 프로젝트 · 반다이 남코와 무관합니다
          </p>
        </footer>
      </body>
    </html>
  );
}
