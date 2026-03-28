"use client";

import { motion } from "framer-motion";

export type CreatorLevel = "beginner" | "active";

interface OnboardingBranchProps {
  onSelect: (level: CreatorLevel) => void;
}

export default function OnboardingBranch({ onSelect }: OnboardingBranchProps) {
  return (
    <div className="flex flex-col gap-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone mb-2">
        현재 상황을 알려주세요
      </p>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onSelect("beginner")}
        className="w-full text-left bg-white border border-border-subtle rounded-[10px] p-5 hover:border-border transition-colors"
      >
        <p className="text-[16px] font-medium text-primary-text mb-1">
          아직 시작 전이에요
        </p>
        <p className="text-[13px] text-secondary-text leading-[1.6]">
          채널이 없거나, 아직 콘텐츠를 만들기 전이에요.
          강점을 발견하고 방향을 잡고 싶어요.
        </p>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onSelect("active")}
        className="w-full text-left bg-white border border-border-subtle rounded-[10px] p-5 hover:border-border transition-colors"
      >
        <p className="text-[16px] font-medium text-primary-text mb-1">
          이미 활동 중이에요
        </p>
        <p className="text-[13px] text-secondary-text leading-[1.6]">
          유튜브, 인스타 등에서 이미 콘텐츠를 만들고 있어요.
          더 성장하고 싶어요.
        </p>
      </motion.button>
    </div>
  );
}
