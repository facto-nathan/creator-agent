"use client";

import { motion } from "framer-motion";

interface LandingProps {
  onStart: () => void;
}

const JOURNEY = [
  { step: "01", label: "강점 발견", desc: "5가지 질문으로 숨겨진 재능 탐색" },
  { step: "02", label: "DNA 정의", desc: "크리에이터 페르소나와 니치 도출" },
  { step: "03", label: "콘텐츠 설계", desc: "맞춤 아이디어 생성, 변형, 확장" },
];

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="flex flex-col min-h-[100dvh] py-16 justify-between">
      {/* Top — Brand */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone">
          Everyone Creators
        </p>
      </motion.div>

      {/* Center — Hero */}
      <div className="flex-1 flex flex-col justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="text-[36px] font-light tracking-[-0.03em] text-primary-text leading-[1.25] mb-5">
            시장 트렌드가 아닌,
            <br />
            <span className="font-normal">당신</span>에서 시작합니다
          </h1>

          <p className="text-[15px] text-secondary-text leading-[1.8] max-w-[320px]">
            AI 코칭으로 나만의 강점을 발견하고,
            <br />
            크리에이터 DNA를 정의하세요.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="mt-10 self-start px-10 py-3.5 bg-primary-text text-accent-inverse rounded-full text-[14px] font-medium tracking-[0.02em] hover:bg-[#2C2620] transition-colors duration-200"
        >
          시작하기
        </motion.button>
      </div>

      {/* Bottom — Journey Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="pt-8 border-t border-border"
      >
        <div className="space-y-4">
          {JOURNEY.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 + i * 0.12, duration: 0.4 }}
              className="flex items-baseline gap-4"
            >
              <span className="text-[11px] font-medium text-stone tabular-nums w-4 shrink-0">
                {item.step}
              </span>
              <span className="text-[13px] font-medium text-primary-text">
                {item.label}
              </span>
              <span className="text-[12px] text-tertiary-text">
                {item.desc}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
