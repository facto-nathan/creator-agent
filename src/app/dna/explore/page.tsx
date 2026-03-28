import type { Metadata } from "next";
import DNAExplorer from "./DNAExplorer";

export const metadata: Metadata = {
  title: "DNA Type Explorer — Creator Coaching AI",
  description: "같은 유형의 크리에이터를 찾아보세요",
};

interface SessionRow {
  id: string;
  dna_result: {
    creator_dna: {
      archetype_name: string;
      strengths: string[];
      mood: string;
      primary_niche: string;
      recommended_platforms: string[];
    };
  } | null;
}

async function getRecentSessions(): Promise<SessionRow[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return [];

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/sessions?dna_result=not.is.null&select=id,dna_result&order=created_at.desc&limit=20`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function ExplorePage() {
  const sessions = await getRecentSessions();
  const cards = sessions
    .filter((s) => s.dna_result?.creator_dna)
    .map((s) => ({
      id: s.id,
      ...s.dna_result!.creator_dna,
    }));

  return <DNAExplorer cards={cards} />;
}
