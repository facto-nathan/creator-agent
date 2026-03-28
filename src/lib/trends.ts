export interface TrendItem {
  title: string;
  source: string;
}

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

async function fetchYouTubeTrends(): Promise<TrendItem[]> {
  try {
    const res = await fetch(
      "https://www.youtube.com/feed/trending?gl=KR",
      { next: { revalidate: 21600 } },
    );
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

export async function getTrends(): Promise<{ trends: TrendItem[]; source: string }> {
  try {
    const ytTrends = await fetchYouTubeTrends();
    const trends = ytTrends.length > 0 ? ytTrends : CURATED_TRENDS;
    return {
      trends,
      source: ytTrends.length > 0 ? "youtube" : "curated",
    };
  } catch {
    return { trends: CURATED_TRENDS, source: "curated" };
  }
}
