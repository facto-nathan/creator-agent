"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CreatorDNACard, WeeklyIdea } from "@/lib/schemas";

interface Props {
  dnaCard: CreatorDNACard;
  sessionId: string;
}

function trackEvent(sessionId: string, eventType: string, metadata?: Record<string, unknown>) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, event_type: eventType, metadata }),
  }).catch(() => {});
}

export default function DNAProfileSheet({ dnaCard, sessionId }: Props) {
  const [copied, setCopied] = useState(false);
  const [weeklyIdeas, setWeeklyIdeas] = useState<WeeklyIdea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [compatLoading, setCompatLoading] = useState(false);
  const [compatResult, setCompatResult] = useState<{
    compatibility_summary: string;
    collab_ideas: { title: string; hook: string; format: string; why_together: string }[];
    combined_strengths: string[];
  } | null>(null);

  const isOwner = typeof window !== "undefined" && localStorage.getItem("creator-session-id") === sessionId;

  const loadWeeklyIdeas = useCallback(async () => {
    setIdeasLoading(true);
    setIdeasError(false);
    try {
      const res = await fetch("/api/ideas/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setWeeklyIdeas(data.ideas);
      setRefreshCount((c) => c + 1);
    } catch {
      setIdeasError(true);
    } finally {
      setIdeasLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    trackEvent(sessionId, "dna_page_view");

    // Check for return visit
    if (isOwner) {
      const lastVisit = localStorage.getItem(`dna-last-visit-${sessionId}`);
      if (lastVisit) {
        const hoursSinceLastVisit = (Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60);
        if (hoursSinceLastVisit >= 24) {
          trackEvent(sessionId, "return_visit");
        }
      }
      localStorage.setItem(`dna-last-visit-${sessionId}`, Date.now().toString());
    }

    // Auto-load weekly ideas
    loadWeeklyIdeas();
  }, [sessionId, isOwner, loadWeeklyIdeas]);

  async function handleRefresh() {
    if (refreshCount >= 3) return;
    trackEvent(sessionId, "ideas_refresh");
    await loadWeeklyIdeas();
  }

  async function handleCompat() {
    const mySessionId = localStorage.getItem("creator-session-id");
    if (!mySessionId) {
      window.location.href = "/";
      return;
    }
    if (mySessionId === sessionId) return;

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
      // Compat is optional
    } finally {
      setCompatLoading(false);
    }
  }

  async function handleShare() {
    trackEvent(sessionId, "share_click");
    const url = `${window.location.origin}/dna/${sessionId}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${dnaCard.archetype_name} — Creator DNA Card`, url });
        return;
      } catch {
        // Fall through to clipboard
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
            Creator DNA
          </motion.p>

          {/* DNA Card — Identity Core */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="bg-white border border-border-subtle rounded-[16px] p-7 mb-4"
          >
            <div className="mb-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone mb-3">
                Archetype
              </p>
              <h1 className="text-[28px] font-light tracking-[-0.02em] text-primary-text leading-[1.2]">
                {dnaCard.archetype_name}
              </h1>
              <p className="text-[13px] text-tertiary-text mt-1.5">{dnaCard.mood}</p>
            </div>

            {/* Positioning Statement */}
            {dnaCard.positioning_statement && (
              <div className="bg-background rounded-[10px] p-4 mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-2">
                  Positioning
                </p>
                <p className="text-[15px] text-primary-text leading-[1.75]">
                  &ldquo;{dnaCard.positioning_statement}&rdquo;
                </p>
              </div>
            )}

            {/* Strengths */}
            <div className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-3">
                Strengths
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

            {/* Content Pillars */}
            {dnaCard.content_pillars && dnaCard.content_pillars.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-3">
                  Content Pillars
                </p>
                <div className="divide-y divide-border-subtle">
                  {dnaCard.content_pillars.map((pillar, i) => (
                    <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="text-[12px] font-semibold text-stone min-w-[20px]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-[15px] font-medium text-primary-text">{pillar.title}</p>
                        <p className="text-[12px] text-secondary-text mt-0.5">{pillar.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Niche + Platforms */}
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-1.5">
                  니치
                </p>
                <p className="text-[15px] font-medium text-primary-text">{dnaCard.primary_niche}</p>
                <p className="text-[12px] text-tertiary-text mt-0.5">{dnaCard.secondary_niche}</p>
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

          {/* Brand Card — Why Work With Me */}
          {dnaCard.why_work_with_me && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white border border-border-subtle rounded-[16px] p-6 mb-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-3">
                Why Work With Me
              </p>
              <p className="text-[15px] text-primary-text leading-[1.75] mb-4">
                {dnaCard.why_work_with_me}
              </p>
              {dnaCard.ideal_sponsors && dnaCard.ideal_sponsors.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-2">
                    Ideal Sponsors
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {dnaCard.ideal_sponsors.map((sponsor, i) => (
                      <span key={i} className="px-3 py-1 bg-background border border-border rounded-full text-[11px] text-secondary-text">
                        {sponsor}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Weekly Ideas — Retention Hook */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white border border-border-subtle rounded-[16px] p-6 mb-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-3">
              This Week&apos;s Ideas
            </p>

            {ideasLoading && !weeklyIdeas.length ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-[20px] bg-surface rounded animate-pulse" />
                ))}
              </div>
            ) : ideasError && !weeklyIdeas.length ? (
              <div className="text-center py-4">
                <p className="text-[13px] text-tertiary-text mb-3">아이디어를 불러오지 못했어요</p>
                <button
                  onClick={loadWeeklyIdeas}
                  className="text-[13px] text-primary-text underline"
                >
                  다시 시도하기
                </button>
              </div>
            ) : (
              <>
                <div className="divide-y divide-border-subtle">
                  {weeklyIdeas.map((idea, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                      <span className="text-[14px] text-stone min-w-[16px] mt-0.5">{i + 1}</span>
                      <p className="text-[14px] text-primary-text leading-[1.5] flex-1">
                        {idea.text}
                        {idea.is_trend && (
                          <span className="ml-2 px-1.5 py-0.5 bg-surface text-[10px] font-semibold tracking-[0.06em] text-[#5A8A6A] rounded-full align-middle">
                            TREND
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={ideasLoading || refreshCount >= 3}
                  className="w-full mt-3 py-2.5 border border-dashed border-border rounded-[6px] text-[13px] text-secondary-text hover:border-tertiary-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {refreshCount >= 3
                    ? "오늘 횟수를 모두 사용했어요"
                    : ideasLoading
                      ? "새 아이디어 생성 중..."
                      : "이번 주 아이디어 새로 받기 ↻"}
                </button>
              </>
            )}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            <button
              onClick={handleShare}
              className="w-full py-3.5 bg-primary-text text-accent-inverse rounded-full text-[14px] font-medium text-center hover:bg-[#2C2620] transition-colors duration-200"
            >
              {copied ? "링크가 복사되었어요!" : "링크 공유하기"}
            </button>

            <button
              onClick={() => {
                trackEvent(sessionId, "share_click", { platform: "kakao" });
                const url = `${window.location.origin}/dna/${sessionId}`;
                const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(url)}`;
                window.open(kakaoUrl, "_blank", "width=600,height=400");
              }}
              className="w-full py-3.5 border border-border text-primary-text rounded-full text-[14px] font-medium text-center hover:border-tertiary-text transition-colors duration-200"
            >
              카카오톡으로 공유하기
            </button>

            <button
              onClick={handleCompat}
              disabled={compatLoading}
              className="w-full py-3.5 border border-border text-primary-text rounded-full text-[14px] font-medium text-center hover:border-tertiary-text transition-colors duration-200 disabled:opacity-50"
            >
              {compatLoading ? "분석 중..." : "콜라보 아이디어 보기"}
            </button>

            <Link
              href="/"
              onClick={() => trackEvent(sessionId, "cta_click")}
              className="w-full py-2.5 text-secondary-text text-[13px] font-medium text-center underline block"
            >
              나도 DNA 카드 만들기
            </Link>
          </motion.div>

          {/* Compatibility Results */}
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

          {/* Footer */}
          <div className="text-center mt-8 pb-8">
            <p className="text-[12px] text-tertiary-text">
              Creator Coaching AI — 모두가 크리에이터가 되는 세상
            </p>
          </div>
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
