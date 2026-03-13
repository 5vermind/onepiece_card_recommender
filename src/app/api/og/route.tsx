import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { recommendDecks } from "@/lib/recommend";

export const runtime = "edge";

const TIER_COLORS: Record<string, string> = {
  S: "#ff6b6b",
  A: "#ffa502",
  B: "#7bed9f",
  C: "#70a1ff",
};

const COLOR_HEX: Record<string, string> = {
  Red: "#e74c3c",
  Green: "#27ae60",
  Blue: "#2980b9",
  Purple: "#8e44ad",
  Black: "#2c3e50",
  Yellow: "#f39c12",
};

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

const fontPromise = fetch(
  "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-700-normal.woff",
).then((res) => res.arrayBuffer());

export async function GET(request: NextRequest) {
  const param = request.nextUrl.searchParams.get("a");

  if (!param) {
    return new Response("Missing answers param", { status: 400 });
  }

  let deckNames: { nameKo: string; tier: string; colors: string[] }[];

  try {
    const decoded = JSON.parse(decodeURIComponent(param)) as Record<string, string>;
    const results = recommendDecks(decoded);
    deckNames = results.slice(0, 3).map((r) => ({
      nameKo: r.deck.nameKo,
      tier: r.deck.tier,
      colors: r.deck.colors,
    }));
  } catch {
    return new Response("Invalid answers param", { status: 400 });
  }

  const fontData = await fontPromise;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "60px",
        fontFamily: "NotoSansKR",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "48px",
        }}
      >
        <span style={{ fontSize: "48px" }}>🏴‍☠️</span>
        <span
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "#e74c3c",
          }}
        >
          나의 추천 덱
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          flex: 1,
        }}
      >
        {deckNames.map((deck, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              background: i === 0 ? "rgba(231,76,60,0.15)" : "rgba(255,255,255,0.06)",
              border: i === 0 ? "2px solid rgba(231,76,60,0.4)" : "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "24px 32px",
            }}
          >
            <span style={{ fontSize: "40px" }}>{RANK_MEDALS[i]}</span>
            <span
              style={{
                fontSize: "32px",
                fontWeight: 700,
                flex: 1,
              }}
            >
              {deck.nameKo}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {deck.colors.map((c, ci) => (
                <div
                  key={ci}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: COLOR_HEX[c] ?? "#888",
                    border: "2px solid rgba(255,255,255,0.3)",
                  }}
                />
              ))}
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  background: TIER_COLORS[deck.tier] ?? "#888",
                  color: deck.tier === "B" ? "#1a1a2e" : "#fff",
                  borderRadius: "8px",
                  padding: "4px 12px",
                }}
              >
                Tier {deck.tier}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "32px",
          opacity: 0.5,
          fontSize: "18px",
        }}
      >
        <span>원피스 카드 게임 덱 추천</span>
        <span>OP-11 메타 기준</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "NotoSansKR",
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
