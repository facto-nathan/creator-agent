"use client";

import { create } from "zustand";

export interface CoachingAnswers {
  [key: string]: string;
}

export interface CreatorDNACard {
  archetype_name: string;
  archetype_icon: string;
  strengths: string[];
  primary_niche: string;
  secondary_niche: string;
  recommended_platforms: string[];
  mood: string;
  color: string;
}

export interface AnalysisResult {
  talents: string[];
  emotions: string[];
  interests: string[];
  communication_style: string;
}

export interface ContentIdea {
  id: string;
  title: string;
  hook: string;
  format: string;
  platform: string;
  tags: string[];
  trend_match?: string;
}

export interface DeepenedIdea {
  outline: { section_title: string; description: string }[];
  opening_hook: string;
  thumbnail_copy: string;
  hashtags: string[];
}

export type IdeaStage = "generate" | "select" | "vary" | "deepen";

export interface CoachingState {
  answers: CoachingAnswers;
  currentQuestionIndex: number;
  analysisResult: AnalysisResult | null;
  dnaCard: CreatorDNACard | null;
  isLoading: boolean;
  error: string | null;

  // Stage 4+5
  contentIdeas: ContentIdea[] | null;
  selectedIdeaIds: string[];
  variations: ContentIdea[] | null;
  deepenedIdea: DeepenedIdea | null;
  ideaStage: IdeaStage;
  finalIdea: ContentIdea | null;

  setAnswer: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setDNACard: (card: CreatorDNACard) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setContentIdeas: (ideas: ContentIdea[]) => void;
  toggleIdeaSelection: (id: string) => void;
  setVariations: (variations: ContentIdea[]) => void;
  setDeepenedIdea: (idea: DeepenedIdea | null) => void;
  setIdeaStage: (stage: IdeaStage) => void;
  setFinalIdea: (idea: ContentIdea | null) => void;
  reset: () => void;
}

const initialAnswers: CoachingAnswers = {};

export const useCoachingStore = create<CoachingState>((set) => ({
  answers: initialAnswers,
  currentQuestionIndex: 0,
  analysisResult: null,
  dnaCard: null,
  isLoading: false,
  error: null,

  // Stage 4+5
  contentIdeas: null,
  selectedIdeaIds: [],
  variations: null,
  deepenedIdea: null,
  ideaStage: "generate",
  finalIdea: null,

  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),
  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, 4),
    })),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setDNACard: (card) => set({ dnaCard: card }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setContentIdeas: (ideas) => set({ contentIdeas: ideas }),
  toggleIdeaSelection: (id) =>
    set((state) => ({
      selectedIdeaIds: state.selectedIdeaIds.includes(id)
        ? state.selectedIdeaIds.filter((i) => i !== id)
        : [...state.selectedIdeaIds, id],
    })),
  setVariations: (variations) => set({ variations }),
  setDeepenedIdea: (idea) => set({ deepenedIdea: idea }),
  setIdeaStage: (stage) => set({ ideaStage: stage }),
  setFinalIdea: (idea) => set({ finalIdea: idea }),
  reset: () =>
    set({
      answers: initialAnswers,
      currentQuestionIndex: 0,
      analysisResult: null,
      dnaCard: null,
      isLoading: false,
      error: null,
      contentIdeas: null,
      selectedIdeaIds: [],
      variations: null,
      deepenedIdea: null,
      ideaStage: "generate",
      finalIdea: null,
    }),
}));
