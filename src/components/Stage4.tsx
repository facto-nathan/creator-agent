"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCoaching } from "@/store/CoachingContext";
import IdeaCard from "./IdeaCard";
import VaryPanel from "./VaryPanel";
import DeepenView from "./DeepenView";
import type { ContentIdea } from "@/store/useCoachingStore";

const LOADING_MESSAGES = [
  "아이디어를 탐색하고 있어요",
  "당신의 DNA에 맞는 콘텐츠를 찾고 있어요",
  "다양한 플랫폼을 검토하고 있어요",
];

export default function Stage4() {
  const {
    dnaCard, analysisResult, contentIdeas, selectedIdeaIds,
    variations, deepenedIdea, ideaStage, finalIdea, isLoading, error,
    setContentIdeas, toggleIdeaSelection, setVariations,
    setDeepenedIdea, setIdeaStage, setFinalIdea, setLoading, setError,
  } = useCoaching();

  const [loadingMsg, setLoadingMsg] = useState(0);

  useEffect(() => {
    if (ideaStage === "generate" && !contentIdeas && dnaCard && analysisResult) {
      fetchIdeas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setInterval(() => {
      setLoadingMsg((p) => (p + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isLoading]);

  async function fetchIdeas() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dnaCard, analysis: analysisResult }),
      });
      if (!res.ok) throw new Error("아이디어 생성에 실패했습니다");
      const data = await res.json();
      setContentIdeas(data.ideas);
      setIdeaStage("select");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  async function handleVary(direction: string) {
    const idea = contentIdeas?.find((i) => selectedIdeaIds.includes(i.id));
    if (!idea || !dnaCard) return;
    setLoading(true);
    setError(null);
    setIdeaStage("vary");
    try {
      const res = await fetch("/api/vary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, direction, dnaCard }),
      });
      if (!res.ok) throw new Error("변형 생성에 실패했습니다");
      const data = await res.json();
      setVariations(data.variations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeepen(idea: ContentIdea) {
    if (!dnaCard) return;
    setFinalIdea(idea);
    setIdeaStage("deepen");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/deepen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, dnaCard }),
      });
      if (!res.ok) throw new Error("아이디어 확장에 실패했습니다");
      const data = await res.json();
      setDeepenedIdea(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  // === Loading screen (shared) ===
  if (ideaStage === "generate" || (isLoading && ideaStage !== "select")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70dvh] text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-[1.5px] border-stone border-t-primary-text rounded-full mb-6"
        />
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingMsg}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-[14px] text-secondary-text"
          >
            {LOADING_MESSAGES[loadingMsg]}
          </motion.p>
        </AnimatePresence>
        {error && (
          <div className="mt-8">
            <p className="text-[13px] text-error mb-3">{error}</p>
            <button
              onClick={fetchIdeas}
              className="px-6 py-2 border border-border text-primary-text rounded-full text-[12px] font-medium"
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    );
  }

  // === SELECT stage (with inline Variant.ai actions) ===
  if (ideaStage === "select" && contentIdeas) {
    const selectedIdea = contentIdeas.find((i) => selectedIdeaIds.includes(i.id));
    return (
      <div className="py-8">
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone mb-3">
            Generated Ideas
          </p>
          <h2 className="text-[22px] font-light tracking-[-0.02em] text-primary-text leading-[1.3]">
            콘텐츠 아이디어
          </h2>
        </div>

        <div className="space-y-2.5">
          {contentIdeas.map((idea, index) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              isSelected={selectedIdeaIds.includes(idea.id)}
              onToggle={() => {
                // Single select: clear others
                if (!selectedIdeaIds.includes(idea.id)) {
                  // Clear previous selections
                  selectedIdeaIds.forEach((id) => toggleIdeaSelection(id));
                }
                toggleIdeaSelection(idea.id);
              }}
              onVary={handleVary}
              onDeepen={() => handleDeepen(idea)}
              index={index}
              showActions={selectedIdeaIds.includes(idea.id)}
            />
          ))}
        </div>

        {/* Custom vary input (Variant.ai style) */}
        {selectedIdea && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <VaryPanel onVary={handleVary} isLoading={isLoading} />
          </motion.div>
        )}

        {error && <p className="text-[13px] text-error mt-4">{error}</p>}
      </div>
    );
  }

  // === VARY stage (show variations) ===
  if (ideaStage === "vary" && !isLoading) {
    const sourceIdea = contentIdeas?.find((i) => selectedIdeaIds.includes(i.id));
    return (
      <div className="py-8 space-y-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone mb-3">
            Variations
          </p>
          <h2 className="text-[22px] font-light tracking-[-0.02em] text-primary-text leading-[1.3]">
            변형 결과
          </h2>
        </div>

        {variations && (
          <div className="space-y-2.5">
            {variations.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleDeepen(v)}
                className="p-5 bg-white border border-border-subtle rounded-[16px] cursor-pointer hover:border-border transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary-text">{v.platform}</span>
                    <span className="text-[10px] text-stone">·</span>
                    <span className="text-[10px] text-tertiary-text">{v.format}</span>
                  </div>
                  <span className="text-[10px] text-stone opacity-0 group-hover:opacity-100 transition-opacity">
                    클릭하여 확장 →
                  </span>
                </div>
                <h3 className="text-[16px] font-medium text-primary-text mb-1">{v.title}</h3>
                <p className="text-[13px] text-secondary-text">{v.hook}</p>
              </motion.div>
            ))}
          </div>
        )}

        {sourceIdea && (
          <button
            onClick={() => handleDeepen(sourceIdea)}
            className="w-full py-3.5 bg-primary-text text-accent-inverse rounded-full text-[14px] font-medium hover:bg-[#2C2620] transition-colors"
          >
            원래 아이디어로 확장하기
          </button>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={() => { setVariations(null as never); setIdeaStage("select"); }}
            className="text-[12px] text-stone underline underline-offset-3 decoration-border"
          >
            아이디어 목록으로
          </button>
        </div>

        {error && <p className="text-[13px] text-error">{error}</p>}
      </div>
    );
  }

  // === DEEPEN stage ===
  if (ideaStage === "deepen" && !isLoading && finalIdea && deepenedIdea) {
    return (
      <DeepenView
        idea={finalIdea}
        deepened={deepenedIdea}
        onBack={() => {
          setDeepenedIdea(null as never);
          setIdeaStage("select");
        }}
      />
    );
  }

  return null;
}
