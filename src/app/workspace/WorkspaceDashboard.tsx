"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { WeeklyIdea } from "@/lib/schemas";

interface DNASession {
  id: string;
  created_at: string;
  dna_result: {
    creator_dna: {
      archetype_name: string;
      strengths: string[];
      mood: string;
      primary_niche: string;
      positioning_statement?: string;
    };
  } | null;
}

interface AnalyticsData {
  total_views: number;
  total_shares: number;
  total_returns: number;
}

export default function WorkspaceDashboard() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [sessions, setSessions] = useState<DNASession[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [weeklyIdeas, setWeeklyIdeas] = useState<WeeklyIdea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Claim anonymous sessions after login
  useEffect(() => {
    if (!user) return;

    const anonymousSessionId = localStorage.getItem("creator-session-id");
    if (anonymousSessionId && !claiming) {
      setClaiming(true);
      fetch("/api/session/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_ids: [anonymousSessionId],
          user_id: user.id,
        }),
      })
        .then(() => localStorage.removeItem("creator-session-id"))
        .catch(() => {})
        .finally(() => setClaiming(false));
    }
  }, [user, claiming]);

  // Load user's sessions
  useEffect(() => {
    if (!user) return;

    const supabase = getSupabaseBrowser();
    supabase
      .from("sessions")
      .select("id, created_at, dna_result")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setSessions(data as DNASession[]);
      });

    // Load analytics
    supabase
      .from("events")
      .select("event_type")
      .in("session_id", sessions.map((s) => s.id))
      .then(({ data }) => {
        if (data) {
          const events = data as { event_type: string }[];
          setAnalytics({
            total_views: events.filter((e) => e.event_type === "dna_page_view").length,
            total_shares: events.filter((e) => e.event_type === "share_click").length,
            total_returns: events.filter((e) => e.event_type === "return_visit").length,
          });
        }
      });
  }, [user, sessions]);

  // Load weekly ideas for latest session
  useEffect(() => {
    if (!sessions.length || !sessions[0].dna_result) return;

    setIdeasLoading(true);
    fetch("/api/ideas/weekly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessions[0].id }),
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.ideas) setWeeklyIdeas(data.ideas); })
      .catch(() => {})
      .finally(() => setIdeasLoading(false));
  }, [sessions]);

  if (loading) {
    return (
      <main className="min-h-dvh bg-background flex items-center justify-center">
        <div className="animate-pulse text-[13px] text-tertiary-text">로딩 중...</div>
      </main>
    );
  }

  // Not logged in — show login prompt
  if (!user) {
    return (
      <main className="min-h-dvh bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone mb-6">
              Creator Workspace
            </p>
            <h1 className="text-[28px] font-light tracking-[-0.02em] text-primary-text mb-3">
              나의 크리에이터 워크스페이스
            </h1>
            <p className="text-[15px] text-secondary-text leading-[1.75] mb-8">
              DNA 카드, 콘텐츠 아이디어, 분석을 한 곳에서 관리하세요.
              <br />
              로그인하면 모든 코칭 기록이 저장됩니다.
            </p>
            <button
              onClick={signInWithGoogle}
              className="w-full py-3.5 bg-primary-text text-accent-inverse rounded-full text-[14px] font-medium hover:bg-[#2C2620] transition-colors mb-3"
            >
              Google로 시작하기
            </button>
            <Link
              href="/"
              className="block text-[13px] text-tertiary-text underline mt-4"
            >
              로그인 없이 코칭받기
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  const latestDNA = sessions[0]?.dna_result?.creator_dna;

  return (
    <main className="min-h-dvh bg-background">
      <div className="max-w-[480px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone mb-1">
              Creator Workspace
            </p>
            <p className="text-[13px] text-secondary-text">
              {user.email}
            </p>
          </div>
          <button
            onClick={signOut}
            className="text-[12px] text-tertiary-text hover:text-secondary-text transition-colors"
          >
            로그아웃
          </button>
        </div>

        {/* Latest DNA Card */}
        {latestDNA ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link
              href={`/dna/${sessions[0].id}`}
              className="block bg-white border border-border-subtle rounded-[16px] p-6 hover:border-border transition-colors"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone mb-2">
                My DNA
              </p>
              <h2 className="text-[22px] font-light tracking-[-0.02em] text-primary-text mb-1">
                {latestDNA.archetype_name}
              </h2>
              <p className="text-[13px] text-tertiary-text mb-3">
                {latestDNA.positioning_statement || latestDNA.mood}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {latestDNA.strengths.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-surface rounded-full text-[11px] text-secondary-text">
                    {s}
                  </span>
                ))}
              </div>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-border-subtle rounded-[16px] p-6 mb-6 text-center"
          >
            <p className="text-[15px] text-secondary-text mb-4">
              아직 DNA 카드가 없어요
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-primary-text text-accent-inverse rounded-full text-[13px] font-medium"
            >
              코칭 시작하기
            </Link>
          </motion.div>
        )}

        {/* Analytics Summary */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <div className="bg-white border border-border-subtle rounded-[10px] p-4 text-center">
              <p className="text-[22px] font-light text-primary-text">{analytics.total_views}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-tertiary-text mt-1">조회</p>
            </div>
            <div className="bg-white border border-border-subtle rounded-[10px] p-4 text-center">
              <p className="text-[22px] font-light text-primary-text">{analytics.total_shares}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-tertiary-text mt-1">공유</p>
            </div>
            <div className="bg-white border border-border-subtle rounded-[10px] p-4 text-center">
              <p className="text-[22px] font-light text-primary-text">{analytics.total_returns}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-tertiary-text mt-1">재방문</p>
            </div>
          </motion.div>
        )}

        {/* Weekly Content Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-border-subtle rounded-[16px] p-6 mb-6"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-3">
            This Week&apos;s Content Plan
          </p>
          {ideasLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-[20px] bg-surface rounded animate-pulse" />
              ))}
            </div>
          ) : weeklyIdeas.length > 0 ? (
            <div className="space-y-3">
              {["월", "화", "수", "목", "금"].map((day, i) => (
                <div key={day} className="flex items-start gap-3">
                  <div className="w-[28px] h-[28px] flex items-center justify-center bg-surface rounded-[6px] text-[12px] font-semibold text-secondary-text shrink-0">
                    {day}
                  </div>
                  {weeklyIdeas[i] ? (
                    <div className="flex-1 pt-0.5">
                      <p className="text-[14px] text-primary-text leading-[1.5]">
                        {weeklyIdeas[i].text}
                        {weeklyIdeas[i].is_trend && (
                          <span className="ml-2 px-1.5 py-0.5 bg-surface text-[10px] font-semibold tracking-[0.06em] text-[#5A8A6A] rounded-full align-middle">
                            TREND
                          </span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[13px] text-stone pt-1">자유 주제</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-tertiary-text text-center py-4">
              DNA 카드를 만들면 주간 콘텐츠 플랜이 생성됩니다
            </p>
          )}
        </motion.div>

        {/* DNA History */}
        {sessions.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text mb-3">
              DNA History
            </p>
            <div className="space-y-2">
              {sessions.slice(1).map((session) => (
                <Link
                  key={session.id}
                  href={`/dna/${session.id}`}
                  className="block bg-white border border-border-subtle rounded-[10px] p-3 hover:border-border transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] text-primary-text">
                        {session.dna_result?.creator_dna.archetype_name || "코칭 세션"}
                      </p>
                      <p className="text-[11px] text-tertiary-text mt-0.5">
                        {new Date(session.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <span className="text-[11px] text-stone">보기 ▸</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-8">
          <Link
            href="/"
            className="w-full py-3.5 bg-primary-text text-accent-inverse rounded-full text-[14px] font-medium text-center hover:bg-[#2C2620] transition-colors block"
          >
            {latestDNA ? "다시 코칭받기" : "코칭 시작하기"}
          </Link>
          <Link
            href="/dna/explore"
            className="w-full py-2.5 text-secondary-text text-[13px] font-medium text-center underline block"
          >
            다른 크리에이터 DNA 보기
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-[12px] text-tertiary-text">
            Creator Coaching AI — 모두가 크리에이터가 되는 세상
          </p>
        </div>
      </div>
    </main>
  );
}
