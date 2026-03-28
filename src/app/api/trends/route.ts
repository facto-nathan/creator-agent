import { NextResponse } from "next/server";

interface TrendItem {
  title: string;
  source: string;
}

// YouTube Trending Korea RSS (free, reliable)
async function fetchYouTubeTrends(): Promise<TrendItem[]> {
  try {
    const res = await fetch(
      "https://www.youtube.com/feed/trending?gl=KR",
      { next: { revalidate: 21600 } }, // 6h cache
    );
    // YouTube trending doesn't have a clean RSS, so we extract from the page
    // Fallback: return empty if parsing fails
    if (!res.ok) return [];

    const html = await res.text();
    const titleMatches = html.match(/"title":\{"runs":\[\{"text":"([^"]+)"\}/g);
    if (!titleMatches) return [];

    return titleMatches
      .slice(0, 10)
      .map((match) => {
        const text = match.match(/"text":"([^"]+)"/)?.[1] || "";
        return { title: text, source: "YouTube" };
      })
      .filter((t) => t.title.length > 0);
  } catch {
    return [];
  }
}

// Simple trending topics (curated fallback when APIs fail)
const CURATED_TRENDS: TrendItem[] = [
  { title: "미니멀 라이프", source: "curated" },
  { title: "AI 활용법", source: "curated" },
  { title: "홈카페", source: "curated" },
  { title: "자기계발 루틴", source: "curated" },
  { title: "브이로그", source: "curated" },
  { title: "디지털 노마드", source: "curated" },
  { title: "독서 리뷰", source: "curated" },
  { title: "운동 루틴", source: "curated" },
];

export async function GET() {
  try {
    const ytTrends = await fetchYouTubeTrends();

    // Use YouTube trends if available, fall back to curated
    const trends = ytTrends.length > 0 ? ytTrends : CURATED_TRENDS;

    return NextResponse.json({
      trends,
      source: ytTrends.length > 0 ? "youtube" : "curated",
      cached_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      trends: CURATED_TRENDS,
      source: "curated",
      cached_at: new Date().toISOString(),
    });
  }
}
