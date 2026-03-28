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

interface IdeaCardProps {
  idea: ContentIdea;
  isSelected: boolean;
  onToggle: () => void;
  onDeepen?: () => void;
  onVary?: (direction: string) => void;
  index: number;
  showActions?: boolean;
}

const VARY_ACTIONS = [
  { label: "강하게 변형", icon: "↑", direction: "더 대담하고 자극적으로" },
  { label: "부드럽게 변형", icon: "~", direction: "더 부드럽고 접근하기 쉽게" },
  { label: "다른 포맷", icon: "⇄", direction: "다른 플랫폼과 포맷으로" },
];

export default function IdeaCard({
  idea, isSelected, onToggle, onDeepen, onVary, index, showActions,
}: IdeaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className={`rounded-[16px] cursor-pointer transition-all duration-200 overflow-hidden ${
        isSelected
          ? "bg-white border-2 border-primary-text"
          : "bg-white border border-border-subtle hover:border-border"
      }`}
    >
      <div onClick={onToggle} className="p-5">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text">
            {idea.platform}
          </span>
          <span className="text-[10px] text-stone">·</span>
          <span className="text-[10px] font-medium text-tertiary-text">
            {idea.format}
          </span>
          {isSelected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto text-[10px] font-semibold text-primary-text"
            >
              ✓
            </motion.span>
          )}
        </div>

        <h3 className="text-[16px] font-medium text-primary-text leading-[1.4] mb-1.5">
          {idea.title}
        </h3>

        <p className="text-[13px] text-secondary-text leading-[1.6]">
          {idea.hook}
        </p>

        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {idea.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-surface rounded-full text-[10px] text-tertiary-text">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Variant.ai style inline actions */}
      {isSelected && showActions && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="border-t border-border-subtle bg-[#F7F3ED] px-4 py-3"
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            {VARY_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={(e) => {
                  e.stopPropagation();
                  onVary?.(action.direction);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border rounded-full text-[11px] font-medium text-primary-text hover:border-tertiary-text transition-colors"
              >
                <span className="text-[10px]">{action.icon}</span>
                {action.label}
              </button>
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeepen?.();
              }}
              className="ml-auto px-4 py-1.5 bg-primary-text text-accent-inverse rounded-full text-[11px] font-medium hover:bg-[#2C2620] transition-colors"
            >
              확장하기
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
