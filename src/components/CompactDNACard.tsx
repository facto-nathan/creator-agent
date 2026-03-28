"use client";

import { motion } from "framer-motion";
import type { CreatorDNACard } from "@/lib/schemas";

interface CompactDNACardProps {
  dnaCard: CreatorDNACard;
  onViewFull?: () => void;
}

export default function CompactDNACard({ dnaCard, onViewFull }: CompactDNACardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onViewFull}
      className="bg-white border border-border-subtle rounded-[10px] p-4 cursor-pointer hover:border-border transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone mb-1">
            Your Creator DNA
          </p>
          <p className="text-[18px] font-light tracking-[-0.02em] text-primary-text">
            {dnaCard.archetype_name}
          </p>
          <p className="text-[12px] text-tertiary-text mt-0.5">{dnaCard.mood}</p>
        </div>
        <span className="text-[12px] text-tertiary-text">자세히 보기 ▸</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {dnaCard.strengths.slice(0, 3).map((s, i) => (
          <span key={i} className="px-2 py-0.5 bg-surface rounded-full text-[10px] text-secondary-text">
            {s}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
