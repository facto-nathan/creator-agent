import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DNAProfileSheet from "./DNAProfileSheet";

interface Props {
  params: Promise<{ id: string }>;
}

async function getSession(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/sessions?id=eq.${id}&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const session = await getSession(id);

  if (!session?.dna_result?.creator_dna) {
    return { title: "Creator DNA Card" };
  }

  const dna = session.dna_result.creator_dna;
  const ogUrl = `/api/og?archetype=${encodeURIComponent(dna.archetype_name)}&strengths=${encodeURIComponent(dna.strengths.join(","))}&niche=${encodeURIComponent(dna.primary_niche)}&platforms=${encodeURIComponent(dna.recommended_platforms.join(","))}&mood=${encodeURIComponent(dna.mood)}&color=${encodeURIComponent(dna.color)}`;

  return {
    title: `${dna.archetype_name} — Creator DNA Card`,
    description: `${dna.mood} | ${dna.primary_niche}`,
    openGraph: {
      title: `${dna.archetype_name} — Creator DNA Card`,
      description: `${dna.mood} | 강점: ${dna.strengths.join(", ")}`,
      images: [ogUrl],
    },
  };
}

export default async function DNAPage({ params }: Props) {
  const { id } = await params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) notFound();

  const session = await getSession(id);
  if (!session?.dna_result?.creator_dna) notFound();

  return <DNAProfileSheet dnaCard={session.dna_result.creator_dna} sessionId={id} />;
}
