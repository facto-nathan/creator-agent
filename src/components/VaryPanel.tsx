"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface VaryPanelProps {
  onVary: (direction: string) => void;
  isLoading: boolean;
}

export default function VaryPanel({ onVary, isLoading }: VaryPanelProps) {
  const [customDirection, setCustomDirection] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-border-subtle rounded-[16px] p-5"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-3">
        커스텀 변형
      </p>
      <div className="flex gap-2">
        <input
          value={customDirection}
          onChange={(e) => setCustomDirection(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && customDirection.trim()) {
              onVary(customDirection.trim());
              setCustomDirection("");
            }
          }}
          placeholder="예: MZ세대 감성으로, 더 실용적으로..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 bg-background border border-border rounded-[10px] text-[14px] text-primary-text placeholder:text-stone focus:border-tertiary-text focus:outline-none transition-colors disabled:opacity-50"
        />
        <button
          onClick={() => {
            if (customDirection.trim()) {
              onVary(customDirection.trim());
              setCustomDirection("");
            }
          }}
          disabled={isLoading || !customDirection.trim()}
          className="px-4 py-2.5 bg-primary-text text-accent-inverse rounded-full text-[12px] font-medium disabled:opacity-40 hover:bg-[#2C2620] transition-colors"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-accent-inverse border-t-transparent rounded-full animate-spin" />
          ) : (
            "Vary"
          )}
        </button>
      </div>
    </motion.div>
  );
}
