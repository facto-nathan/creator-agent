"use client";

import type { CreatorDNACard } from "@/store/useCoachingStore";
import { motion } from "framer-motion";

interface DNACardProps {
  dnaCard: CreatorDNACard;
  onNext?: () => void;
}

export default function DNACard({ dnaCard, onNext }: DNACardProps) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone mb-6">
          Your Creator DNA
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white border border-border-subtle rounded-[16px] p-7"
      >
        <div className="mb-7">
          <h2 className="text-[24px] font-light tracking-[-0.02em] text-primary-text leading-[1.2]">
            {dnaCard.archetype_name}
          </h2>
          <p className="text-[13px] text-tertiary-text mt-1.5">{dnaCard.mood}</p>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-3">
            강점
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dnaCard.strengths.map((strength, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="px-3 py-1.5 bg-surface rounded-full text-[12px] text-secondary-text"
              >
                {strength}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-1.5">
              니치
            </p>
            <p className="text-[15px] font-medium text-primary-text">
              {dnaCard.primary_niche}
            </p>
            <p className="text-[12px] text-tertiary-text mt-0.5">
              {dnaCard.secondary_niche}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-1.5">
              플랫폼
            </p>
            <div className="flex flex-wrap gap-1.5">
              {dnaCard.recommended_platforms.map((p, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="px-3 py-1 bg-primary-text text-accent-inverse rounded-full text-[11px] font-medium"
                >
                  {p}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col gap-3"
      >
        {onNext && (
          <button
            onClick={onNext}
            className="w-full py-3.5 bg-primary-text text-accent-inverse rounded-full text-[14px] font-medium hover:bg-[#2C2620] transition-colors duration-200"
          >
            콘텐츠 아이디어 보기
          </button>
        )}
        <a
          href={`/api/og?archetype=${encodeURIComponent(dnaCard.archetype_name)}&strengths=${encodeURIComponent(dnaCard.strengths.join(","))}&niche=${encodeURIComponent(dnaCard.primary_niche)}&platforms=${encodeURIComponent(dnaCard.recommended_platforms.join(","))}&mood=${encodeURIComponent(dnaCard.mood)}&color=${encodeURIComponent(dnaCard.color)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 border border-border text-primary-text rounded-full text-[14px] font-medium text-center hover:border-tertiary-text transition-colors duration-200"
        >
          카드 이미지 저장
        </a>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-[12px] text-stone underline underline-offset-3 decoration-border"
        >
          처음으로
        </button>
      </motion.div>
    </div>
  );
}
