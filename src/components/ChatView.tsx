"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCoaching } from "@/store/CoachingContext";
import { getQuestions } from "@/lib/questions";
import { useCoachingFlow } from "@/hooks/useCoachingFlow";
import { useMessageQueue } from "@/hooks/useMessageQueue";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import CompactDNACard from "./CompactDNACard";
import OnboardingBranch, { type CreatorLevel } from "./OnboardingBranch";
import IdeaCard from "./IdeaCard";
import DeepenView from "./DeepenView";
import type { ContentIdea, DeepenedIdea, CreatorDNACard, AnalysisResult } from "@/store/useCoachingStore";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  type?: "text" | "dna-card" | "ideas-ready" | "deepen-ready";
}

type Phase = "greeting" | "onboarding" | "coaching" | "followup" | "analyzing" | "result" | "ideas" | "varying" | "deepening";

function parseIdeaAction(text: string): {
  action: "vary" | "deepen" | "none";
  ideaIndex?: number;
  direction?: string;
} {
  const lower = text.toLowerCase();
  const numMatch = text.match(/(\d+)\s*번/);
  const idx = numMatch ? parseInt(numMatch[1]) - 1 : undefined;

  if (/변형|바꿔|다르게|변경/.test(lower)) {
    return { action: "vary", ideaIndex: idx, direction: text };
  }
  if (/확장|확정|이걸로|상세|기획/.test(lower)) {
    return { action: "deepen", ideaIndex: idx };
  }
  return { action: "none" };
}

// Stage labels for the chrome bar
const STAGE_LABELS: Record<Phase, string> = {
  greeting: "Creator DNA",
  onboarding: "Creator DNA",
  coaching: "Coaching",
  followup: "Coaching",
  analyzing: "Analyzing",
  result: "DNA Card",
  ideas: "Ideas",
  varying: "Ideas",
  deepening: "Ideas",
};

export default function ChatView() {
  const {
    setAnswer, setAnalysisResult, setDNACard, dnaCard, analysisResult,
    setLoading, setError, isLoading,
    contentIdeas, setContentIdeas, deepenedIdea, setDeepenedIdea,
    setFinalIdea, finalIdea, selectedIdeaIds, toggleIdeaSelection,
  } = useCoaching();

  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<Phase>("greeting");
  const [isTyping, setIsTyping] = useState(false);
  const [coachingResult, setCoachingResult] = useState<{
    analysis: AnalysisResult; creator_dna: CreatorDNACard;
  } | null>(null);
  const [mobileTab, setMobileTab] = useState<"chat" | "ideas">("chat");
  const [retryAvailable, setRetryAvailable] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const greetedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  const coaching = useCoachingFlow();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, []);

  const addMsg = useCallback((content: string, role: "ai" | "user" = "ai", type?: Message["type"]) => {
    setMessages((p) => [...p, {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role,
      content,
      type,
    }]);
    scrollToBottom();
  }, [scrollToBottom]);

  const queue = useMessageQueue(
    useCallback((content: string, type?: string) => {
      addMsg(content, "ai", type as Message["type"]);
    }, [addMsg]),
    setIsTyping,
  );

  // Greeting → show onboarding branch
  useEffect(() => {
    if (phase !== "greeting" || greetedRef.current) return;
    greetedRef.current = true;
    queue.enqueue("안녕하세요! 당신만의 크리에이터 DNA를 찾아볼까요?", 800);
    setPhase("onboarding");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleOnboardingSelect(level: CreatorLevel) {
    coaching.selectLevel(level);
    const questions = getQuestions(level);
    addMsg(level === "beginner" ? "아직 시작 전이에요" : "이미 활동 중이에요", "user");
    queue.enqueueAll([
      { content: level === "beginner"
        ? "좋아요! 숨겨진 강점을 함께 찾아볼게요."
        : "멋져요! 더 성장할 수 있는 방향을 함께 찾아볼게요.", delay: 600 },
      { content: questions[0].question, delay: 800 },
    ]);
    setPhase("coaching");
  }

  async function generateIdeas() {
    if (!coachingResult) return;
    setLoading(true);
    setPhase("ideas");
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dnaCard: coachingResult.creator_dna, analysis: coachingResult.analysis }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      if (!data.ideas || data.ideas.length === 0) {
        queue.enqueue("아이디어를 생성하지 못했어요. 다시 시도해볼까요?", 400);
        setPhase("result");
        return;
      }
      setContentIdeas(data.ideas);
      queue.enqueue("5가지 아이디어를 준비했어요! 오른쪽 패널에서 확인하고, 변형하고 싶은 방향을 말씀해주세요.", 600, "ideas-ready");
      setMobileTab("ideas");
    } catch {
      queue.enqueue("아이디어 생성에 실패했어요. 다시 시도해주세요.", 400);
      setPhase("result");
    } finally {
      setLoading(false);
    }
  }

  async function handleVary(idea: ContentIdea, direction: string) {
    if (!coachingResult) return;
    setLoading(true);
    setPhase("varying");
    queue.enqueue(`"${idea.title}"을 변형하고 있어요...`, 300);
    try {
      const res = await fetch("/api/vary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, direction, dnaCard: coachingResult.creator_dna }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      const others = contentIdeas?.filter((i) => i.id !== idea.id) || [];
      setContentIdeas([...data.variations, ...others]);
      queue.enqueue("변형 결과를 준비했어요. 패널에서 확인해보세요!", 600);
      setPhase("ideas");
    } catch {
      queue.enqueue("변형에 실패했어요. 다시 시도해주세요.", 400);
      setPhase("ideas");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeepen(idea: ContentIdea) {
    if (!coachingResult) return;
    setFinalIdea(idea);
    setLoading(true);
    setPhase("deepening");
    queue.enqueue(`"${idea.title}" 콘텐츠 기획을 확장하고 있어요...`, 300);
    try {
      const res = await fetch("/api/deepen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, dnaCard: coachingResult.creator_dna }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setDeepenedIdea(data);
      queue.enqueue("콘텐츠 기획이 완성됐어요! 패널에서 확인해보세요.", 600, "deepen-ready");
      setMobileTab("ideas");
    } catch {
      queue.enqueue("확장에 실패했어요. 다시 시도해주세요.", 400);
    } finally {
      setLoading(false);
      setPhase("ideas");
    }
  }

  async function retryAnalysis() {
    setRetryAvailable(false);
    setLoading(true);
    setPhase("analyzing");
    queue.enqueue("다시 분석을 시도하고 있어요...", 500);

    try {
      const res = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: coaching.getAnswers() }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setAnalysisResult(data.analysis);
      setDNACard(data.creator_dna);
      setCoachingResult(data);
      queue.enqueueAll([
        { content: "분석이 완료됐어요!", delay: 1000 },
        { content: "", delay: 600, type: "dna-card" },
      ]);
      setPhase("result");
    } catch {
      queue.enqueue("분석에 다시 실패했어요. 잠시 후 다시 시도해주세요.", 500);
      setRetryAvailable(true);
      setPhase("result");
    } finally {
      setLoading(false);
    }
  }

  const handleSend = async (text: string) => {
    addMsg(text, "user");

    // Coaching phase (core questions + follow-ups)
    if (phase === "coaching" || phase === "followup") {
      const validationError = coaching.validateAnswer(text);
      if (validationError) {
        queue.enqueue(validationError, 400);
        return;
      }

      const questions = coaching.level ? getQuestions(coaching.level) : getQuestions("beginner");
      const { insight, nextQuestion, isLast } = coaching.submitAnswer(text);
      const qId = questions[coaching.questionIndex]?.id;
      if (qId) setAnswer(qId, text);

      if (isLast) {
        // All questions answered — run analysis
        queue.enqueue("좋은 이야기 감사합니다. 분석을 시작할게요...", 800);
        setPhase("analyzing");
        setLoading(true);
        try {
          const res = await fetch("/api/coaching", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers: coaching.getAnswers() }),
          });
          if (!res.ok) throw new Error("failed");
          const data = await res.json();
          setAnalysisResult(data.analysis);
          setDNACard(data.creator_dna);
          setCoachingResult(data);

          // Save session to Supabase
          try {
            const sessionRes = await fetch("/api/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                coaching_answers: coaching.getAnswers(),
                dna_result: data,
              }),
            });
            if (sessionRes.ok) {
              const { id } = await sessionRes.json();
              sessionIdRef.current = id;
              localStorage.setItem("creator-session-id", id);
            }
          } catch {
            // Session save failure is non-blocking
          }

          queue.enqueueAll([
            { content: "분석이 완료됐어요!", delay: 1500 },
            { content: "", delay: 600, type: "dna-card" },
          ]);
          setPhase("result");
        } catch {
          setError("분석에 실패했어요.");
          queue.enqueue("분석 중 문제가 생겼어요. 아래 버튼을 눌러 다시 시도해주세요.", 500);
          setRetryAvailable(true);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Not the last question — check if follow-up is needed
      if (phase === "followup" || !coaching.canDoFollowUp) {
        // After a follow-up answer or max follow-ups reached, go to next Q
        coaching.skipFollowUp();
        queue.enqueueAll([
          { content: insight, delay: 800 },
          { content: nextQuestion!, delay: 800 },
        ]);
        setPhase("coaching");
      } else {
        // Try to get a follow-up question from Haiku
        queue.enqueue(insight, 800);
        try {
          const coreQ = questions[coaching.questionIndex]?.question || "";
          const followRes = await fetch("/api/followup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              core_question: coreQ,
              answer: text,
              previous_answers: coaching.getPreviousAnswers(),
            }),
          });
          const followData = await followRes.json();
          if (followData.needsFollowUp && followData.question) {
            coaching.startFollowUp(followData.question);
            queue.enqueue(followData.question, 800);
            setPhase("followup");
          } else {
            // Answer was deep enough, advance
            coaching.skipFollowUp();
            if (nextQuestion) {
              queue.enqueue(nextQuestion, 800);
            }
          }
        } catch {
          // Follow-up failed, just advance
          coaching.skipFollowUp();
          if (nextQuestion) {
            queue.enqueue(nextQuestion, 800);
          }
        }
      }
      return;
    }

    // Ideas phase
    if (phase === "ideas" && contentIdeas) {
      const parsed = parseIdeaAction(text);
      if (parsed.action === "vary" && parsed.ideaIndex !== undefined && contentIdeas[parsed.ideaIndex]) {
        handleVary(contentIdeas[parsed.ideaIndex], parsed.direction || text);
      } else if (parsed.action === "deepen" && parsed.ideaIndex !== undefined && contentIdeas[parsed.ideaIndex]) {
        handleDeepen(contentIdeas[parsed.ideaIndex]);
      } else {
        queue.enqueue("아이디어 번호와 함께 요청해주세요. 예: \"1번 변형해줘\", \"3번 확장해줘\"", 400);
      }
      return;
    }

    // Result phase
    if (phase === "result") {
      if (/아이디어|만들어|콘텐츠|시작/.test(text)) {
        generateIdeas();
      }
      return;
    }
  };

  const showSidePanel = ["ideas", "varying", "deepening"].includes(phase) || (phase === "result" && contentIdeas);
  const isIdeaPhase = showSidePanel;
  const stageLabel = STAGE_LABELS[phase];

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header with stage label */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border-subtle">
        <div className={`flex items-center justify-between px-6 py-4 mx-auto ${isIdeaPhase ? "max-w-[960px]" : "max-w-[480px]"}`}>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone">
              {stageLabel}
            </p>
            {phase === "coaching" && (
              <span className="text-[10px] text-tertiary-text">
                · Q{coaching.progress.current}/{coaching.progress.total}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isIdeaPhase && (
              <div className="flex md:hidden bg-surface rounded-[6px] p-0.5">
                <button
                  onClick={() => setMobileTab("chat")}
                  className={`px-3 py-1 rounded-[4px] text-[11px] font-medium transition-colors ${mobileTab === "chat" ? "bg-primary-text text-accent-inverse" : "text-tertiary-text"}`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setMobileTab("ideas")}
                  className={`px-3 py-1 rounded-[4px] text-[11px] font-medium transition-colors ${mobileTab === "ideas" ? "bg-primary-text text-accent-inverse" : "text-tertiary-text"}`}
                >
                  Ideas
                </button>
              </div>
            )}
            {phase === "coaching" && (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: coaching.progress.total }, (_, i) => (
                  <div key={i} className={`w-[5px] h-[5px] rounded-full transition-colors ${i < coaching.questionIndex ? "bg-stone" : i === coaching.questionIndex ? "bg-primary-text" : "bg-border"}`} />
                ))}
              </div>
            )}
            {(phase === "analyzing" || isLoading) && (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-[1.5px] border-stone border-t-primary-text rounded-full" />
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={`flex mx-auto w-full h-[calc(100dvh-53px)] ${isIdeaPhase ? "max-w-[960px]" : "max-w-[480px]"}`}>
        {/* Left: Chat */}
        <div className={`flex flex-col ${isIdeaPhase ? "md:w-[400px] md:shrink-0 md:border-r md:border-border-subtle" : "w-full"} ${isIdeaPhase && mobileTab !== "chat" ? "hidden md:flex" : "flex w-full md:w-auto"}`}>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-3">
              <AnimatePresence>
                {messages.map((msg) => {
                  if (msg.type === "dna-card" && coachingResult) {
                    return (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="py-2">
                        <CompactDNACard
                          dnaCard={coachingResult.creator_dna}
                          onViewFull={() => {
                            if (sessionIdRef.current) {
                              window.open(`/dna/${sessionIdRef.current}`, "_blank");
                            }
                          }}
                        />
                      </motion.div>
                    );
                  }
                  return <ChatBubble key={msg.id} role={msg.role}>{msg.content}</ChatBubble>;
                })}
              </AnimatePresence>

              {/* Onboarding branch selection */}
              {phase === "onboarding" && !isTyping && (
                <OnboardingBranch onSelect={handleOnboardingSelect} />
              )}

              {/* Retry button for analysis failure */}
              {retryAvailable && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-2">
                  <button
                    onClick={retryAnalysis}
                    className="px-6 py-2.5 bg-primary-text text-accent-inverse rounded-full text-[13px] font-medium hover:bg-[#2C2620] transition-colors"
                  >
                    다시 분석하기
                  </button>
                </motion.div>
              )}

              {/* Generate ideas button (user chooses, not auto-fire) */}
              {phase === "result" && coachingResult && !contentIdeas && !retryAvailable && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex flex-col items-center gap-2 py-2">
                  <button
                    onClick={generateIdeas}
                    className="px-6 py-2.5 bg-primary-text text-accent-inverse rounded-full text-[13px] font-medium hover:bg-[#2C2620] transition-colors"
                  >
                    콘텐츠 아이디어 보기
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-[12px] text-tertiary-text underline underline-offset-3 decoration-border"
                  >
                    다시 코칭받기
                  </button>
                </motion.div>
              )}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-surface rounded-[14px] rounded-tl-[4px] px-4 py-3 flex gap-1">
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-1.5 h-1.5 bg-stone rounded-full" />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-stone rounded-full" />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-stone rounded-full" />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          <div className="px-4 pb-2">
            <ChatInput
              onSend={handleSend}
              disabled={!["coaching", "followup", "result", "ideas"].includes(phase) || isTyping || isLoading}
              placeholder={
                phase === "coaching" ? "자유롭게 이야기해주세요..." :
                phase === "ideas" ? "예: 1번 변형해줘, 3번 확장해줘" :
                "..."
              }
            />
          </div>
        </div>

        {/* Right: Ideas Panel */}
        {isIdeaPhase && (
          <div className={`flex-1 overflow-y-auto ${mobileTab !== "ideas" ? "hidden md:block" : "block"}`}>
            <div className="p-6 space-y-4 min-h-0">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone">
                  {deepenedIdea && finalIdea ? "Content Plan" : "Generated Ideas"}
                </p>
                {contentIdeas && (
                  <button onClick={generateIdeas} className="px-3 py-1.5 border border-border text-tertiary-text rounded-[6px] text-[10px] font-medium hover:border-tertiary-text transition-colors">
                    Regenerate
                  </button>
                )}
              </div>

              {deepenedIdea && finalIdea ? (
                <DeepenView
                  idea={finalIdea}
                  deepened={deepenedIdea}
                  onBack={() => { setDeepenedIdea(null); setFinalIdea(null); }}
                />
              ) : contentIdeas ? (
                contentIdeas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <p className="text-[14px] text-secondary-text">아이디어를 생성하지 못했어요.</p>
                    <button onClick={generateIdeas} className="px-5 py-2 bg-primary-text text-accent-inverse rounded-full text-[12px] font-medium">
                      다시 생성하기
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {contentIdeas.map((idea, i) => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        isSelected={selectedIdeaIds.includes(idea.id)}
                        onToggle={() => {
                          selectedIdeaIds.forEach((id) => toggleIdeaSelection(id));
                          toggleIdeaSelection(idea.id);
                        }}
                        onVary={(dir) => handleVary(idea, dir)}
                        onDeepen={() => handleDeepen(idea)}
                        index={i}
                        showActions={selectedIdeaIds.includes(idea.id)}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-40">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-[1.5px] border-stone border-t-primary-text rounded-full" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
