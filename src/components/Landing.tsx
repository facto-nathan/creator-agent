"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface LandingProps {
  onStart: () => void;
}

// Sample DNA Card specimen data for the landing visual anchor
const SPECIMEN = {
  archetype_name: "감성 큐레이터",
  mood: "Curiosity × Empathy",
  strengths: ["공감력", "분석력", "스토리텔링"],
  primary_niche: "라이프스타일 × 자기계발",
  platforms: ["YouTube", "Instagram"],
};

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="flex flex-col min-h-dvh py-16 justify-between">
      {/* Brand */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone"
      >
        Everyone Creators
      </motion.p>

      {/* Hero: DNA Card specimen as visual anchor */}
      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="bg-white border border-border-subtle rounded-[16px] p-6 mb-8"
          whileHover={{ rotateY: 2, rotateX: -1 }}
        >
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone mb-3">
              Your Creator DNA
            </p>
            <h2 className="text-[26px] font-light tracking-[-0.02em] text-primary-text leading-[1.2]">
              {SPECIMEN.archetype_name}
            </h2>
            <p className="text-[13px] text-tertiary-text mt-1">{SPECIMEN.mood}</p>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {SPECIMEN.strengths.map((s) => (
              <span key={s} className="px-3 py-1 bg-surface rounded-full text-[12px] text-secondary-text">
                {s}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-1">
                니치
              </p>
              <p className="text-[14px] font-medium text-primary-text">{SPECIMEN.primary_niche}</p>
            </div>
            <div className="flex gap-1.5">
              {SPECIMEN.platforms.map((p) => (
                <span key={p} className="px-2.5 py-1 bg-primary-text text-accent-inverse rounded-full text-[10px] font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="self-stretch py-3.5 bg-primary-text text-accent-inverse rounded-full text-[14px] font-medium tracking-[0.02em] hover:bg-[#2C2620] transition-colors duration-200"
        >
          나만의 DNA 카드 만들기
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="text-[13px] text-secondary-text leading-[1.7] mt-4 text-center"
        >
          AI 코칭으로 크리에이터 강점을 발견하고
          <br />
          나만의 콘텐츠 전략을 설계하세요
        </motion.p>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="flex flex-col items-center gap-3"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">
          약 8분 소요
        </p>
        <Link
          href="/workspace"
          className="text-[12px] text-tertiary-text underline hover:text-secondary-text transition-colors"
        >
          이미 계정이 있으신가요? 워크스페이스로 이동
        </Link>
      </motion.div>
    </div>
  );
}
