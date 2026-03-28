"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CreatorDNACard } from "@/lib/schemas";

interface Props {
  dnaCard: CreatorDNACard;
  sessionId: string;
}

export default function DNAProfileSheet({ dnaCard, sessionId }: Props) {
  const [copied, setCopied] = useState(false);
  const [compatLoading, setCompatLoading] = useState(false);
  const [compatResult, setCompatResult] = useState<{
    compatibility_summary: string;
    collab_ideas: { title: string; hook: string; format: string; why_together: string }[];
    combined_strengths: string[];
  } | null>(null);

  async function handleCompat() {
    const mySessionId = localStorage.getItem("creator-session-id");
    if (!mySessionId) {
      // User doesn't have their own DNA card yet
      window.location.href = "/";
      return;
    }
    if (mySessionId === sessionId) return; // Can't compare with yourself

    setCompatLoading(true);
    try {
      const res = await fetch("/api/compat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id_a: mySessionId, session_id_b: sessionId }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setCompatResult(data);
    } catch {
      // Silently fail — compat is optional
    } finally {
      setCompatLoading(false);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/dna/${sessionId}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${dnaCard.archetype_name} — Creator DNA Card`, url });
        return;
      } catch {
        // User cancelled or not supported, fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-dvh bg-background">
      <div className="flex items-center justify-center min-h-dvh p-6">
        <div className="w-full max-w-[480px]">
          {/* Brand */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone mb-8"
          >
            Everyone Creators
          </motion.p>

          {/* DNA Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="bg-white border border-border-subtle rounded-[16px] p-7 mb-6"
          >
            <div className="mb-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone mb-3">
                Your Creator DNA
              </p>
              <h1 className="text-[28px] font-light tracking-[-0.02em] text-primary-text leading-[1.2]">
                {dnaCard.archetype_name}
              </h1>
              <p className="text-[13px] text-tertiary-text mt-1.5">{dnaCard.mood}</p>
            </div>

            <div className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-3">
                강점
              </p>
              <div className="flex flex-wrap gap-1.5">
                {dnaCard.strengths.map((strength, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="px-3 py-1.5 bg-surface rounded-full text-[12px] text-secondary-text"
                  >
                    {strength}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-1.5">
                  니치
                </p>
                <p className="text-[15px] font-medium text-primary-text">
                  {dnaCard.primary_niche}
                </p>
                <p className="text-[12px] text-tertiary-text mt-0.5">
                  {dnaCard.secondary_niche}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-1.5">
                  플랫폼
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {dnaCard.recommended_platforms.map((p, i) => (
                    <span key={i} className="px-3 py-1 bg-primary-text text-accent-inverse rounded-full text-[11px] font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            <Link
              href="/"
              className="w-full py-3.5 bg-primary-text text-accent-inverse rounded-full text-[14px] font-medium text-center hover:bg-[#2C2620] transition-colors duration-200 block"
            >
              나도 DNA 카드 만들기
            </Link>

            <button
              onClick={handleShare}
              className="w-full py-3.5 border border-border text-primary-text rounded-[6px] text-[14px] font-medium text-center hover:border-tertiary-text transition-colors duration-200"
            >
              {copied ? "링크가 복사되었어요!" : "DNA 카드 공유하기"}
            </button>

            <button
              onClick={handleCompat}
              disabled={compatLoading}
              className="w-full py-3.5 border border-border text-primary-text rounded-[6px] text-[14px] font-medium text-center hover:border-tertiary-text transition-colors duration-200 disabled:opacity-50"
            >
              {compatLoading ? "분석 중..." : "콜라보 아이디어 보기"}
            </button>
          </motion.div>

          {/* Compatibility results */}
          {compatResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone mb-3">
                COLLAB
              </p>
              <p className="text-[15px] text-primary-text mb-4">{compatResult.compatibility_summary}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {compatResult.combined_strengths.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-surface rounded-full text-[12px] text-secondary-text">
                    {s}
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                {compatResult.collab_ideas.map((idea, i) => (
                  <div key={i} className="bg-white border border-border-subtle rounded-[10px] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-1">
                      {idea.format}
                    </p>
                    <p className="text-[15px] font-medium text-primary-text mb-1">{idea.title}</p>
                    <p className="text-[13px] text-secondary-text leading-[1.6] mb-2">{idea.hook}</p>
                    <p className="text-[12px] text-tertiary-text">{idea.why_together}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Share toast */}
      {copied && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-border-subtle rounded-[6px] px-4 py-2.5 text-[13px] text-primary-text shadow-sm"
        >
          링크가 복사되었어요
        </motion.div>
      )}
    </main>
  );
}
