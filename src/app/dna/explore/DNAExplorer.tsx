"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface DNACard {
  id: string;
  archetype_name: string;
  strengths: string[];
  mood: string;
  primary_niche: string;
  recommended_platforms: string[];
}

export default function DNAExplorer({ cards }: { cards: DNACard[] }) {
  if (cards.length === 0) {
    return (
      <main className="min-h-dvh bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-[480px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone mb-6">
            DNA Type Explorer
          </p>
          <h1 className="text-[26px] font-light tracking-[-0.015em] text-primary-text mb-3">
            아직 같은 유형의 크리에이터가 없어요
          </h1>
          <p className="text-[15px] text-secondary-text leading-[1.75] mb-6">
            첫 번째 크리에이터가 되어주세요!
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3.5 bg-primary-text text-accent-inverse rounded-full text-[14px] font-medium hover:bg-[#2C2620] transition-colors"
          >
            나만의 DNA 카드 만들기
          </Link>
        </div>
      </main>
    );
  }

  // Group by archetype
  const grouped = cards.reduce<Record<string, DNACard[]>>((acc, card) => {
    if (!acc[card.archetype_name]) acc[card.archetype_name] = [];
    acc[card.archetype_name].push(card);
    return acc;
  }, {});

  return (
    <main className="min-h-dvh bg-background">
      <div className="max-w-[480px] mx-auto px-6 py-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone mb-2">
          DNA Type Explorer
        </p>
        <h1 className="text-[26px] font-light tracking-[-0.015em] text-primary-text mb-1">
          크리에이터 DNA 유형
        </h1>
        <p className="text-[13px] text-tertiary-text mb-8">
          {cards.length}명의 크리에이터가 DNA 카드를 만들었어요
        </p>

        <div className="space-y-8">
          {Object.entries(grouped).map(([archetype, group]) => (
            <div key={archetype}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[18px] font-medium text-primary-text">{archetype}</h2>
                <span className="px-2 py-0.5 bg-surface rounded-full text-[11px] text-secondary-text">
                  {group.length}
                </span>
              </div>
              <div className="space-y-2">
                {group.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={`/dna/${card.id}`}
                      className="block bg-white border border-border-subtle rounded-[10px] p-4 hover:border-border transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[13px] text-secondary-text">{card.mood}</p>
                        <span className="text-[11px] text-tertiary-text">보기 ▸</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {card.strengths.slice(0, 3).map((s, j) => (
                          <span key={j} className="px-2 py-0.5 bg-surface rounded-full text-[10px] text-secondary-text">
                            {s}
                          </span>
                        ))}
                        <span className="px-2 py-0.5 bg-surface rounded-full text-[10px] text-secondary-text">
                          {card.primary_niche}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 pb-8">
          <Link
            href="/"
            className="inline-block px-8 py-3.5 bg-primary-text text-accent-inverse rounded-full text-[14px] font-medium hover:bg-[#2C2620] transition-colors"
          >
            나도 DNA 카드 만들기
          </Link>
        </div>
      </div>
    </main>
  );
}
