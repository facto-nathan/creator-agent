"use client";

import { motion } from "framer-motion";

interface LandingProps {
  onStart: () => void;
}

const FEATURES = [
  { label: "Strength", desc: "숨겨진 강점을 발견합니다" },
  { label: "Niche", desc: "나만의 포지셔닝을 정의합니다" },
  { label: "Content", desc: "맞춤 콘텐츠 전략을 설계합니다" },
];

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

      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-[42px] font-Bold tracking-[-0.035em] text-primary-text leading-[1.15] mb-6">
            Build
            <br />
            your channel.
          </h1>

          <p className="text-[15px] text-secondary-text leading-[1.8] max-w-[340px]">
            Find your strength, niche, and content ideas
            <br />
            with AI coaching agent.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="mt-10 self-start px-10 py-3.5 bg-primary-text text-accent-inverse rounded-full text-[14px] font-medium tracking-[0.02em] hover:bg-[#2C2620] transition-colors duration-200"
        >
          Start your journey
        </motion.button>
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="pt-8 border-t border-border"
      >
        <div className="flex gap-8">
          {FEATURES.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
            >
              <p className="text-[12px] font-medium text-primary-text mb-1">
                {item.label}
              </p>
              <p className="text-[11px] text-tertiary-text leading-[1.5]">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
