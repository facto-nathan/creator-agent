"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface ChatBubbleProps {
  role: "ai" | "user";
  children: ReactNode;
  delay?: number;
}

export default function ChatBubble({ role, children, delay = 0 }: ChatBubbleProps) {
  const isAI = role === "ai";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={`flex ${isAI ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 text-[14px] leading-[1.7] ${
          isAI
            ? "bg-surface text-primary-text rounded-[14px] rounded-tl-[4px]"
            : "bg-white text-primary-text rounded-[14px] rounded-tr-[4px] border border-border-subtle"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}
