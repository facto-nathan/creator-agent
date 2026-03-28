import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const archetype = searchParams.get("archetype") || "감성 스토리텔러";
    const strengths = searchParams.get("strengths")?.split(",") || ["감정 분석", "글쓰기", "공감"];
    const niche = searchParams.get("niche") || "일상/감성";
    const platforms = searchParams.get("platforms")?.split(",") || ["YouTube", "Instagram"];
    const mood = searchParams.get("mood") || "따뜻하고 친근한";
    const color = searchParams.get("color") || "#1A1714";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F0EBE3",
            padding: "48px",
            fontFamily: "Pretendard",
          }}
        >
          <div
            style={{
              width: "400px",
              height: "560px",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #E0DAD0",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "24px",
                  backgroundColor: `${color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    backgroundColor: color,
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 500,
                    color: "#1A1714",
                    letterSpacing: "-0.015em",
                  }}
                >
                  {archetype}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6B6560",
                    marginTop: "2px",
                  }}
                >
                  {mood}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#8A837C",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                강점 분석
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {strengths.map((strength, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "#E8E2D8",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      color: "#6B6560",
                    }}
                  >
                    {strength}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#8A837C",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  주요 니치
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "#1A1714",
                  }}
                >
                  {niche}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#8A837C",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  추천 플랫폼
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {platforms.map((platform, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "4px 10px",
                        backgroundColor: "#1A1714",
                        borderRadius: "9999px",
                        fontSize: "11px",
                        color: "#F0EBE3",
                      }}
                    >
                      {platform}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "auto",
                paddingTop: "16px",
                borderTop: "1px solid #E0DAD0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#8A837C",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Creator DNA Card
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#B8AFA4",
                }}
              >
                creator-coaching.ai
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 1000,
        fonts: [
          {
            name: "Pretendard",
            data: await fetch(
              "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Medium.otf"
            ).then((res) => res.arrayBuffer()),
            weight: 500,
            style: "normal",
          },
          {
            name: "Pretendard",
            data: await fetch(
              "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-SemiBold.otf"
            ).then((res) => res.arrayBuffer()),
            weight: 600,
            style: "normal",
          },
        ],
      }
    );
  } catch (error) {
    console.error("OG Image error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}