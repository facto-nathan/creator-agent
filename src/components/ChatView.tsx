"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCoaching } from "@/store/CoachingContext";
import { QUESTIONS } from "@/lib/questions";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import DNACard from "./DNACard";
import IdeaCard from "./IdeaCard";
import DeepenView from "./DeepenView";
import type { ContentIdea, DeepenedIdea, CreatorDNACard, AnalysisResult } from "@/store/useCoachingStore";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  type?: "text" | "dna-card" | "ideas-ready" | "deepen-ready";
}

type Phase = "greeting" | "coaching" | "analyzing" | "result" | "ideas" | "varying" | "deepening";

function generateInsight(answer: string, qIndex: number): string {
  const lower = answer.toLowerCase();
  const patterns: [RegExp, string][] = [
    [/코딩|프로그래밍|개발|기술|테크/, "만들기를 즐기시는 분이시네요. 구조를 설계하고 완성하는 데서 에너지를 얻으시는 것 같아요."],
    [/그림|디자인|영상|사진|미술/, "시각적 표현에 강점이 있으시네요."],
    [/글|쓰기|일기|블로그|작문/, "글로 생각을 정리하는 걸 좋아하시는군요."],
    [/사람|상담|대화|소통|공감/, "사람과의 연결에서 힘을 얻으시네요."],
    [/요리|음식|만들/, "직접 무언가를 만드는 것을 즐기시네요."],
    [/게임|놀이|레고|조립/, "체계 안에서 자유롭게 탐색하는 걸 좋아하시네요."],
    [/분석|정리|체계|구조|설명/, "복잡한 것을 명확하게 정리하는 능력이 있으시네요."],
    [/음악|노래|악기/, "감성적 표현에 재능이 있으시네요."],
  ];
  for (const [regex, response] of patterns) {
    if (regex.test(lower)) return response;
  }
  const defaults = [
    "흥미로운 답변이에요.", "좋은 이야기네요.",
    "당신의 강점이 점점 선명해지고 있어요.", "인상적이에요.", "점점 윤곽이 잡히고 있어요.",
  ];
  return defaults[qIndex % defaults.length];
}

// Parse user input for idea actions
function parseIdeaAction(text: string, ideas: ContentIdea[] | null): {
  action: "vary" | "deepen" | "none";
  ideaIndex?: number;
  direction?: string;
} {
  const lower = text.toLowerCase();
  // "N번 변형" / "N번 확장"
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

export default function ChatView() {
  const {
    setAnswer, setAnalysisResult, setDNACard, dnaCard, analysisResult,
    setLoading, setError, isLoading,
    contentIdeas, setContentIdeas, deepenedIdea, setDeepenedIdea,
    setFinalIdea, finalIdea, selectedIdeaIds, toggleIdeaSelection,
  } = useCoaching();

  const [messages, setMessages] = useState<Message[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("greeting");
  const [isTyping, setIsTyping] = useState(false);
  const [coachingResult, setCoachingResult] = useState<{
    analysis: AnalysisResult; creator_dna: CreatorDNACard;
  } | null>(null);
  const [mobileTab, setMobileTab] = useState<"chat" | "ideas">("chat");

  const scrollRef = useRef<HTMLDivElement>(null);
  const answersRef = useRef<Record<string, string>>({});
  const greetedRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, []);

  const addMsg = useCallback((msg: Omit<Message, "id">) => {
    setMessages((p) => [...p, { ...msg, id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }]);
    scrollToBottom();
  }, [scrollToBottom]);

  const typeAI = useCallback((content: string, delay = 600, type?: Message["type"]) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMsg({ role: "ai", content, type });
    }, delay);
  }, [addMsg]);

  // Greeting
  useEffect(() => {
    if (phase !== "greeting" || greetedRef.current) return;
    greetedRef.current = true;
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMsg({ role: "ai", content: "안녕하세요! 당신만의 크리에이터 DNA를 찾아볼까요?" });
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addMsg({ role: "ai", content: QUESTIONS[0].question });
          setPhase("coaching");
        }, 800);
      }, 600);
    }, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-generate ideas after DNA card
  useEffect(() => {
    if (phase === "result" && coachingResult && !contentIdeas) {
      const timer = setTimeout(() => {
        typeAI("콘텐츠 아이디어를 만들어볼게요...", 1000);
        setTimeout(() => generateIdeas(), 1500);
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, coachingResult]);

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
      setContentIdeas(data.ideas);
      typeAI("5가지 아이디어를 준비했어요! 오른쪽 패널에서 확인하고, 변형하고 싶은 방향을 말씀해주세요.", 600, "ideas-ready");
      setMobileTab("ideas");
    } catch {
      typeAI("아이디어 생성에 실패했어요. 다시 시도해주세요.", 400);
      setPhase("result");
    } finally {
      setLoading(false);
    }
  }

  async function handleVary(idea: ContentIdea, direction: string) {
    if (!coachingResult) return;
    setLoading(true);
    setPhase("varying");
    typeAI(`"${idea.title}"을 변형하고 있어요...`, 300);
    try {
      const res = await fetch("/api/vary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, direction, dnaCard: coachingResult.creator_dna }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      // Replace ideas with variations + keep others
      const others = contentIdeas?.filter((i) => i.id !== idea.id) || [];
      setContentIdeas([...data.variations, ...others]);
      typeAI("변형 결과를 준비했어요. 패널에서 확인해보세요!", 600);
      setPhase("ideas");
    } catch {
      typeAI("변형에 실패했어요. 다시 시도해주세요.", 400);
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
    typeAI(`"${idea.title}" 콘텐츠 기획을 확장하고 있어요...`, 300);
    try {
      const res = await fetch("/api/deepen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, dnaCard: coachingResult.creator_dna }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setDeepenedIdea(data);
      typeAI("콘텐츠 기획이 완성됐어요! 패널에서 확인해보세요.", 600, "deepen-ready");
      setMobileTab("ideas");
    } catch {
      typeAI("확장에 실패했어요. 다시 시도해주세요.", 400);
    } finally {
      setLoading(false);
      setPhase("ideas");
    }
  }

  function handleSave() {
    const session = {
      dnaCard: coachingResult?.creator_dna,
      analysis: coachingResult?.analysis,
      ideas: contentIdeas,
      deepened: deepenedIdea,
      finalIdea,
      savedAt: new Date().toISOString(),
    };
    const saved = JSON.parse(localStorage.getItem("creator-sessions") || "[]");
    saved.push(session);
    localStorage.setItem("creator-sessions", JSON.stringify(saved));
    typeAI("저장 완료! 다음에 다시 방문하면 이전 세션을 확인할 수 있어요.", 400);
  }

  const handleSend = async (text: string) => {
    addMsg({ role: "user", content: text });

    // Coaching phase
    if (phase === "coaching") {
      const qId = QUESTIONS[questionIndex].id;
      answersRef.current[qId] = text;
      setAnswer(qId, text);

      const nextIdx = questionIndex + 1;
      if (nextIdx < QUESTIONS.length) {
        typeAI(generateInsight(text, questionIndex), 800);
        setTimeout(() => {
          typeAI(QUESTIONS[nextIdx].question, 600);
          setQuestionIndex(nextIdx);
        }, 2000);
      } else {
        typeAI("좋은 이야기 감사합니다. 분석을 시작할게요...", 800);
        setPhase("analyzing");
        setLoading(true);
        try {
          const res = await fetch("/api/coaching", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers: answersRef.current }),
          });
          if (!res.ok) throw new Error("failed");
          const data = await res.json();
          setAnalysisResult(data.analysis);
          setDNACard(data.creator_dna);
          setCoachingResult(data);
          setTimeout(() => {
            addMsg({ role: "ai", content: "분석이 완료됐어요!" });
            setTimeout(() => {
              addMsg({ role: "ai", content: "", type: "dna-card" });
              setPhase("result");
            }, 600);
          }, 1500);
        } catch (err) {
          setError(err instanceof Error ? err.message : "오류");
          typeAI("분석 중 문제가 생겼어요. 다시 시도해주세요.", 500);
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    // Ideas phase — parse natural language
    if (phase === "ideas" && contentIdeas) {
      const parsed = parseIdeaAction(text, contentIdeas);
      if (parsed.action === "vary" && parsed.ideaIndex !== undefined && contentIdeas[parsed.ideaIndex]) {
        handleVary(contentIdeas[parsed.ideaIndex], parsed.direction || text);
      } else if (parsed.action === "deepen" && parsed.ideaIndex !== undefined && contentIdeas[parsed.ideaIndex]) {
        handleDeepen(contentIdeas[parsed.ideaIndex]);
      } else if (/저장/.test(text)) {
        handleSave();
      } else {
        typeAI("아이디어 번호와 함께 요청해주세요. 예: \"1번 변형해줘\", \"3번 확장해줘\"", 400);
      }
      return;
    }

    // Result phase — waiting for ideas
    if (phase === "result") {
      if (/아이디어|만들어|콘텐츠|시작/.test(text)) {
        generateIdeas();
      }
      return;
    }
  };

  const showSidePanel = ["ideas", "varying", "deepening"].includes(phase) || (phase === "result" && contentIdeas);
  const isIdeaPhase = showSidePanel;

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border-subtle">
        <div className={`flex items-center justify-between px-6 py-4 mx-auto ${isIdeaPhase ? "max-w-[960px]" : "max-w-[480px]"}`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone">
            Creator DNA
          </p>
          <div className="flex items-center gap-3">
            {/* Mobile tab toggle */}
            {isIdeaPhase && (
              <div className="flex md:hidden bg-surface rounded-full p-0.5">
                <button
                  onClick={() => setMobileTab("chat")}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${mobileTab === "chat" ? "bg-primary-text text-accent-inverse" : "text-tertiary-text"}`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setMobileTab("ideas")}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${mobileTab === "ideas" ? "bg-primary-text text-accent-inverse" : "text-tertiary-text"}`}
                >
                  Ideas
                </button>
              </div>
            )}
            {phase === "coaching" && (
              <div className="flex items-center gap-1.5">
                {QUESTIONS.map((_, i) => (
                  <div key={i} className={`w-[5px] h-[5px] rounded-full transition-colors ${i < questionIndex ? "bg-stone" : i === questionIndex ? "bg-primary-text" : "bg-border"}`} />
                ))}
              </div>
            )}
            {(phase === "analyzing" || isLoading) && (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-[1.5px] border-stone border-t-primary-text rounded-full" />
            )}
          </div>
        </div>
      </div>

      {/* Body — fixed height, independent scroll per panel */}
      <div className={`flex mx-auto w-full h-[calc(100dvh-53px)] ${isIdeaPhase ? "max-w-[960px]" : "max-w-[480px]"}`}>
        {/* Left: Chat */}
        <div className={`flex flex-col ${isIdeaPhase ? "md:w-[400px] md:shrink-0 md:border-r md:border-border-subtle" : "w-full"} ${isIdeaPhase && mobileTab !== "chat" ? "hidden md:flex" : "flex w-full md:w-auto"}`}>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-3">
              <AnimatePresence>
                {messages.map((msg) => {
                  if (msg.type === "dna-card" && coachingResult) {
                    return (
                      <motion.div key={msg.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="py-4">
                        <DNACard dnaCard={coachingResult.creator_dna} />
                      </motion.div>
                    );
                  }
                  return <ChatBubble key={msg.id} role={msg.role}>{msg.content}</ChatBubble>;
                })}
              </AnimatePresence>
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
              disabled={!["coaching", "result", "ideas"].includes(phase) || isTyping}
              placeholder={
                phase === "coaching" ? "자유롭게 이야기해주세요..." :
                phase === "ideas" ? "예: 1번 변형해줘, 3번 확장해줘" :
                "..."
              }
            />
          </div>
        </div>

        {/* Right: Ideas Panel — independent scroll */}
        {isIdeaPhase && (
          <div className={`flex-1 overflow-y-auto ${mobileTab !== "ideas" ? "hidden md:block" : "block"}`}>
            <div className="p-6 space-y-4 min-h-0">
              {/* Panel header */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone">
                  {deepenedIdea && finalIdea ? "Content Plan" : "Generated Ideas"}
                </p>
                {contentIdeas && (
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="px-3 py-1.5 border border-border text-tertiary-text rounded-full text-[10px] font-medium hover:border-tertiary-text transition-colors">
                      Save
                    </button>
                    <button onClick={generateIdeas} className="px-3 py-1.5 border border-border text-tertiary-text rounded-full text-[10px] font-medium hover:border-tertiary-text transition-colors">
                      Regenerate
                    </button>
                  </div>
                )}
              </div>

              {/* Deepen result */}
              {deepenedIdea && finalIdea ? (
                <DeepenView
                  idea={finalIdea}
                  deepened={deepenedIdea}
                  onBack={() => { setDeepenedIdea(null as never); setFinalIdea(null as never); }}
                />
              ) : contentIdeas ? (
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
