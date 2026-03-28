"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minLength?: number;
}

export default function ChatInput({
  onSend, placeholder = "이야기해주세요...", disabled = false, minLength = 10,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length >= minLength && !disabled;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleSend = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="sticky bottom-0 bg-background pt-3 pb-6">
      <div className="flex items-end gap-2 bg-white border border-border rounded-[14px] p-1.5 pl-4">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 py-2 text-[14px] text-primary-text placeholder:text-stone bg-transparent resize-none focus:outline-none disabled:opacity-50 leading-[1.6]"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            canSend
              ? "bg-primary-text text-accent-inverse"
              : "bg-border text-tertiary-text"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {value.length > 0 && value.trim().length < minLength && (
        <p className="text-[11px] text-stone mt-1.5 pl-1">
          {value.trim().length}자 (최소 {minLength}자)
        </p>
      )}
    </div>
  );
}
