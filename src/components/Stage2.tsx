"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCoaching } from "@/store/CoachingContext";
import DNACard from "@/components/DNACard";

interface Stage2Props {
  onNext?: () => void;
}

const KEYWORDS = [
  "타고난 재능을 발견하고 있어요...",
  "감정적 강점을 분석하고 있어요...",
  "고유한 페르소나를 구성하고 있어요...",
  "니치 방향을 설정하고 있어요...",
];

export default function Stage2({ onNext }: Stage2Props) {
  const { answers, setAnalysisResult, setDNACard, setLoading, setError, error } = useCoaching();
  const [phase, setPhase] = useState<"analyzing" | "keywords" | "result">("analyzing");
  const [displayedKeywords, setDisplayedKeywords] = useState<string[]>([]);
  const [result, setResult] = useState<unknown>(null);

  useEffect(() => {
    async function analyze() {
      setLoading(true);
      setPhase("analyzing");

      try {
        const response = await fetch("/api/coaching", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });

        if (!response.ok) {
          throw new Error("분석에 실패했습니다");
        }

        const data = await response.json();
        setResult(data);
        setAnalysisResult(data.analysis);
        setDNACard(data.creator_dna);

        setPhase("keywords");
        let index = 0;
        const interval = setInterval(() => {
          if (index < KEYWORDS.length) {
            setDisplayedKeywords((prev) => [...prev, KEYWORDS[index]]);
            index++;
          } else {
            clearInterval(interval);
            setTimeout(() => setPhase("result"), 500);
          }
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
        setPhase("analyzing");
      } finally {
        setLoading(false);
      }
    }

    analyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "result" && result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <DNACard dnaCard={(result as { creator_dna: Parameters<typeof DNACard>[0]["dnaCard"] }).creator_dna} onNext={onNext} />
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 max-w-[320px]"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#B8AFA4] border-t-[#1A1714] rounded-full mx-auto"
        />

        <div className="space-y-4">
          {displayedKeywords.map((keyword, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-[15px] text-[#6B6560]"
            >
              {keyword}
            </motion.p>
          ))}
        </div>

        {phase === "analyzing" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[15px] text-[#6B6560]"
          >
            당신의 답변을 분석하고 있습니다...
          </motion.p>
        )}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 p-4 bg-[#A65A5A]/10 border border-[#A65A5A] rounded-lg max-w-[320px]"
        >
          <p className="text-[15px] text-[#A65A5A]">{error}</p>
        </motion.div>
      )}
    </div>
  );
}