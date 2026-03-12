import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "원피스 카드 게임 덱 추천",
  description: "5개 질문에 답하면 당신에게 딱 맞는 원피스 카드 게임 덱을 추천해 드려요!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
