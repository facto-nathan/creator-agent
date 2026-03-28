"use client";

import { motion } from "framer-motion";

interface ContentIdea {
  id: string;
  title: string;
  hook: string;
  format: string;
  platform: string;
  tags: string[];
}

interface DeepenedIdea {
  outline: { section_title: string; description: string }[];
  opening_hook: string;
  thumbnail_copy: string;
  hashtags: string[];
}

interface DeepenViewProps {
  idea: ContentIdea;
  deepened: DeepenedIdea;
  onBack: () => void;
}

export default function DeepenView({ idea, deepened, onBack }: DeepenViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-8 space-y-8"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 bg-primary-text text-accent-inverse rounded-full text-[10px] font-medium">
            {idea.platform}
          </span>
          <span className="px-2.5 py-1 bg-surface rounded-full text-[10px] text-secondary-text font-medium">
            {idea.format}
          </span>
        </div>
        <h2 className="text-[22px] font-light tracking-[-0.02em] text-primary-text leading-[1.3]">
          {idea.title}
        </h2>
        <p className="text-[13px] text-secondary-text mt-2 leading-[1.6]">
          {idea.hook}
        </p>
      </div>

      {/* Structure — Variant.ai outline style */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone mb-4">
          Structure
        </p>
        <div className="space-y-1">
          {deepened.outline.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 py-3.5 border-b border-border-subtle last:border-0"
            >
              <span className="text-[11px] font-medium text-stone w-5 shrink-0 pt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="text-[14px] font-medium text-primary-text mb-0.5">
                  {section.section_title}
                </p>
                <p className="text-[12px] text-tertiary-text leading-[1.5]">
                  {section.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Opening Hook */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone mb-3">
          Opening Hook
        </p>
        <div className="bg-white border border-border-subtle rounded-[12px] p-5">
          <p className="text-[14px] text-primary-text leading-[1.75]">
            &ldquo;{deepened.opening_hook}&rdquo;
          </p>
        </div>
      </div>

      {/* Thumbnail */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone mb-3">
          Thumbnail Copy
        </p>
        <div className="bg-primary-text rounded-[12px] p-6 text-center">
          <p className="text-[18px] font-medium text-accent-inverse leading-[1.3]">
            {deepened.thumbnail_copy}
          </p>
        </div>
      </div>

      {/* Hashtags */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone mb-3">
          Hashtags
        </p>
        <div className="flex flex-wrap gap-1.5">
          {deepened.hashtags.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-surface rounded-full text-[11px] text-secondary-text"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          onClick={onBack}
          className="w-full py-3 border border-border text-primary-text rounded-full text-[13px] font-medium hover:border-tertiary-text transition-colors"
        >
          다른 아이디어 보기
        </button>
        <button
          onClick={() => window.location.reload()}
          className="text-[11px] text-stone underline underline-offset-3 decoration-border"
        >
          처음으로
        </button>
      </div>
    </motion.div>
  );
}
