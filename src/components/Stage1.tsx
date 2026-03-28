"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCoaching } from "@/store/CoachingContext";
import { QUESTIONS } from "@/lib/questions";

interface Stage1Props {
  onComplete: () => void;
}

export default function Stage1({ onComplete }: Stage1Props) {
  const { currentQuestionIndex, setAnswer, nextQuestion } = useCoaching();
  const [localAnswer, setLocalAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentQ = QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
  const isCurrentAnswered = localAnswer.trim().length >= 10;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localAnswer]);

  const handleNext = () => {
    if (localAnswer.trim().length < 10) {
      setError("조금 더 자세히 이야기해주세요 (10자 이상)");
      return;
    }
    setError(null);
    setAnswer(currentQ.id, localAnswer);

    if (isLastQuestion) {
      onComplete();
    } else {
      nextQuestion();
      setLocalAnswer("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleNext();
    }
  };

  return (
    <div className="flex flex-col min-h-[85dvh] pt-12 pb-8">
      <div className="flex items-center justify-center gap-3 mb-10">
        {QUESTIONS.map((_, index) => (
          <motion.div
            key={index}
            className={`w-[6px] h-[6px] rounded-full transition-colors duration-300 ${
              index < currentQuestionIndex
                ? "bg-[#B8AFA4]"
                : index === currentQuestionIndex
                ? "bg-[#1A1714]"
                : "bg-[#D6CFC5]"
            }`}
            layoutId={`progress-dot-${index}`}
          />
        ))}
      </div>

      <motion.p
        layoutId="question-counter"
        className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9C958E] mb-2 text-center"
      >
        {currentQuestionIndex + 1} / {QUESTIONS.length}
      </motion.p>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 flex flex-col"
        >
          <motion.h2
            layoutId="question-text"
            className="text-[24px] font-light tracking-[-0.02em] text-primary-text mb-10 leading-[1.45]"
          >
            {currentQ.question}
          </motion.h2>

          <div className="flex-1 flex flex-col">
            <textarea
              ref={textareaRef}
              value={localAnswer}
              onChange={(e) => {
                setLocalAnswer(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={currentQ.placeholder}
              className="w-full min-h-[120px] p-5 bg-white border border-[#D6CFC5] rounded-[10px] text-[15px] text-[#1A1714] placeholder:text-[#9C958E] focus:border-[#9C958E] focus:outline-none transition-colors duration-200 resize-none"
              autoFocus
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[12px] text-[#A65A5A] mt-1"
              >
                {error}
              </motion.p>
            )}

            <p className="text-[12px] text-[#9C958E] mt-3">
              {localAnswer.length}자 {localAnswer.length < 10 && "(최소 10자)"}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-end mt-8">
        <motion.button
          onClick={handleNext}
          disabled={!isCurrentAnswered}
          whileHover={{ scale: isCurrentAnswered ? 1.02 : 1 }}
          whileTap={{ scale: isCurrentAnswered ? 0.98 : 1 }}
          className={`px-8 py-3 rounded-full text-[15px] font-medium transition-all duration-200 ${
            isCurrentAnswered
              ? "bg-[#1A1714] text-[#F0EBE3] hover:bg-[#2A2522]"
              : "bg-[#D6CFC5] text-[#9C958E] cursor-not-allowed"
          }`}
        >
          {isLastQuestion ? "분석 시작하기" : "다음 질문"}
        </motion.button>
      </div>

      <p className="text-[11px] text-stone text-center mt-4 tracking-[0.02em]">
        Cmd + Enter
      </p>
    </div>
  );
}