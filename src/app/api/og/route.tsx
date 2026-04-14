import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { parseAnswersParam } from "@/lib/answer-codec";
import { recommendDecks } from "@/lib/recommend";

export const runtime = "edge";

const TIER_BG: Record<string, string> = {
  S: "#ff6b6b",
  A: "#ffa502",
  B: "#7bed9f",
  C: "#70a1ff",
};

const TIER_FG: Record<string, string> = {
  S: "#ffffff",
  A: "#ffffff",
  B: "#1a1a2e",
  C: "#ffffff",
};

const COLOR_HEX: Record<string, string> = {
  Red: "#e74c3c",
  Green: "#27ae60",
  Blue: "#2980b9",
  Purple: "#8e44ad",
  Black: "#2c3e50",
  Yellow: "#f39c12",
};

const MEDALS = ["🥇", "🥈", "🥉"];

async function loadFont(): Promise<ArrayBuffer> {
  const res = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-700-normal.woff",
  );
  return res.arrayBuffer();
}

export async function GET(request: NextRequest) {
  const param = request.nextUrl.searchParams.get("a");
  if (!param) {
    return new Response("Missing param", { status: 400 });
  }

  const answers = parseAnswersParam(param);
  if (!answers) {
    return new Response("Invalid param", { status: 400 });
  }

  const results = recommendDecks(answers);
  const top3 = results.slice(0, 3).map((r) => ({
    name: r.deck.nameKo,
    tier: r.deck.tier,
    colors: r.deck.colors as string[],
  }));

  const fontData = await loadFont();

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "1200px",
        height: "630px",
        backgroundColor: "#1a1a2e",
        padding: "50px 60px",
        fontFamily: "NotoSansKR",
        color: "white",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
        <span style={{ fontSize: "44px", marginRight: "12px" }}>🏴‍☠️</span>
        <span style={{ fontSize: "34px", fontWeight: 700, color: "#e74c3c" }}>나의 추천 덱</span>
      </div>

      {top3.map((deck, i) => (
        <div
          key={deck.name}
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: i === 0 ? "#2a1520" : "#1e2640",
            border: i === 0 ? "2px solid #e74c3c" : "1px solid #2a3a5c",
            borderRadius: "14px",
            padding: "20px 28px",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "36px", marginRight: "16px" }}>{MEDALS[i]}</span>
          <span style={{ fontSize: "28px", fontWeight: 700, flexGrow: 1 }}>{deck.name}</span>
          {deck.colors.map((c) => (
            <div
              key={c}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "11px",
                backgroundColor: COLOR_HEX[c] ?? "#888",
                marginRight: "8px",
              }}
            />
          ))}
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              backgroundColor: TIER_BG[deck.tier] ?? "#888",
              color: TIER_FG[deck.tier] ?? "#fff",
              borderRadius: "6px",
              padding: "4px 10px",
              marginLeft: "4px",
            }}
          >
            Tier {deck.tier}
          </span>
        </div>
      ))}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "auto",
          fontSize: "16px",
          color: "#666",
        }}
      >
        <span>원피스 카드 게임 덱 추천</span>
        <span>OP-12 메타 기준</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "NotoSansKR",
          data: fontData,
          weight: 700 as const,
          style: "normal" as const,
        },
      ],
    },
  );
}
