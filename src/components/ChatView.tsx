"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCoaching } from "@/store/CoachingContext";
import { QUESTIONS } from "@/lib/questions";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import DNACard from "./DNACard";

interface ChatViewProps {
  onComplete: () => void;
}

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  type?: "text" | "dna-card";
}

// Simple keyword-based AI reactions (no API call needed)
function generateInsight(answer: string, questionIndex: number): string {
  const lower = answer.toLowerCase();

  const patterns: [RegExp, string][] = [
    [/코딩|프로그래밍|개발|기술|테크/, "만들기를 즐기시는 분이시네요. 구조를 설계하고 완성하는 데서 에너지를 얻으시는 것 같아요."],
    [/그림|디자인|영상|사진|미술/, "시각적 표현에 강점이 있으시네요. 눈에 보이는 결과물을 만드는 것을 즐기시는군요."],
    [/글|쓰기|일기|블로그|작문/, "글로 생각을 정리하는 걸 좋아하시는군요. 스토리텔링 능력이 있으시네요."],
    [/사람|상담|대화|소통|공감/, "사람과의 연결에서 힘을 얻으시네요. 공감 능력이 뛰어나신 것 같아요."],
    [/요리|음식|만들/, "손으로 직접 무언가를 만드는 것을 즐기시네요. 창작의 기쁨을 아는 분이에요."],
    [/게임|놀이|레고|조립/, "체계 안에서 자유롭게 탐색하는 걸 좋아하시네요. 규칙과 창의성의 균형을 잘 찾으시는 분이에요."],
    [/분석|정리|체계|구조|설명/, "복잡한 것을 명확하게 정리하는 능력이 있으시네요. 사람들이 당신의 설명을 좋아할 거예요."],
    [/음악|노래|악기/, "감성적 표현에 재능이 있으시네요. 감정을 콘텐츠로 전환하는 힘이 있어요."],
  ];

  for (const [regex, response] of patterns) {
    if (regex.test(lower)) return response;
  }

  const defaults = [
    "흥미로운 답변이에요. 당신만의 독특한 시각이 느껴집니다.",
    "좋은 이야기네요. 이런 경험이 콘텐츠의 원천이 될 수 있어요.",
    "감사합니다. 당신의 강점이 점점 선명해지고 있어요.",
    "인상적이에요. 이런 특성이 크리에이터로서 큰 무기가 될 거예요.",
    "좋아요, 점점 윤곽이 잡히고 있어요.",
  ];
  return defaults[questionIndex % defaults.length];
}

export default function ChatView({ onComplete }: ChatViewProps) {
  const { setAnswer, setAnalysisResult, setDNACard, setLoading, setError } = useCoaching();
  const [messages, setMessages] = useState<Message[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<"greeting" | "coaching" | "analyzing" | "result">("greeting");
  const [isTyping, setIsTyping] = useState(false);
  const [result, setResult] = useState<{ creator_dna: Parameters<typeof DNACard>[0]["dnaCard"] } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const answersRef = useRef<Record<string, string>>({});

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, []);

  const addMessage = useCallback((msg: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: `msg-${Date.now()}-${Math.random()}` }]);
    scrollToBottom();
  }, [scrollToBottom]);

  const addAIMessage = useCallback((content: string, delay = 600) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ role: "ai", content });
    }, delay);
  }, [addMessage]);

  // Initial greeting (guard against StrictMode double-fire)
  const greetedRef = useRef(false);
  useEffect(() => {
    if (phase !== "greeting" || greetedRef.current) return;
    greetedRef.current = true;

    // Step 1: Show typing indicator, then greeting
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ role: "ai", content: "안녕하세요! 당신만의 크리에이터 DNA를 찾아볼까요?" });

      // Step 2: Pause, then show typing again, then first question
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addMessage({ role: "ai", content: QUESTIONS[0].question });
          setPhase("coaching");
        }, 800);
      }, 600);
    }, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (text: string) => {
    if (phase !== "coaching") return;

    // Add user message
    addMessage({ role: "user", content: text });

    // Save answer
    const qId = QUESTIONS[questionIndex].id;
    answersRef.current[qId] = text;
    setAnswer(qId, text);

    const nextIndex = questionIndex + 1;

    if (nextIndex < QUESTIONS.length) {
      // AI insight reaction + next question
      const insight = generateInsight(text, questionIndex);
      addAIMessage(insight, 800);
      setTimeout(() => {
        addAIMessage(QUESTIONS[nextIndex].question, 600);
        setQuestionIndex(nextIndex);
      }, 2000);
    } else {
      // All questions done — analyze
      addAIMessage("좋은 이야기 감사합니다. 지금까지의 대화를 바탕으로 분석을 시작할게요...", 800);
      setPhase("analyzing");
      setLoading(true);

      try {
        const res = await fetch("/api/coaching", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: answersRef.current }),
        });
        if (!res.ok) throw new Error("분석에 실패했습니다");
        const data = await res.json();
        setAnalysisResult(data.analysis);
        setDNACard(data.creator_dna);
        setResult(data);

        setTimeout(() => {
          addMessage({ role: "ai", content: "분석이 완료됐어요! 당신의 크리에이터 DNA를 확인해보세요." });
          setTimeout(() => {
            addMessage({ role: "ai", content: "", type: "dna-card" });
            setPhase("result");
          }, 600);
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
        addAIMessage("분석 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.", 500);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] -mx-6 -my-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm px-6 py-4 border-b border-border-subtle">
        <div className="flex items-center justify-between max-w-[480px] mx-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone">
            Creator DNA
          </p>
          {phase === "coaching" && (
            <div className="flex items-center gap-1.5">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`w-[5px] h-[5px] rounded-full transition-colors duration-300 ${
                    i < questionIndex ? "bg-stone" : i === questionIndex ? "bg-primary-text" : "bg-border"
                  }`}
                />
              ))}
            </div>
          )}
          {phase === "analyzing" && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-[1.5px] border-stone border-t-primary-text rounded-full"
            />
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-[480px] mx-auto space-y-3">
          <AnimatePresence>
            {messages.map((msg) => {
              if (msg.type === "dna-card" && result) {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="py-4"
                  >
                    <DNACard dnaCard={result.creator_dna} onNext={onComplete} />
                  </motion.div>
                );
              }
              return (
                <ChatBubble key={msg.id} role={msg.role}>
                  {msg.content}
                </ChatBubble>
              );
            })}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-surface rounded-[14px] rounded-tl-[4px] px-4 py-3 flex gap-1">
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-1.5 h-1.5 bg-stone rounded-full" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-stone rounded-full" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-stone rounded-full" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="px-6 max-w-[480px] mx-auto w-full">
        <ChatInput
          onSend={handleSend}
          disabled={phase !== "coaching" || isTyping}
          placeholder={phase === "coaching" ? "자유롭게 이야기해주세요..." : "분석 중..."}
        />
      </div>
    </div>
  );
}
