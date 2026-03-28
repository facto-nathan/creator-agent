import { useState, useRef, useCallback } from "react";
import { getQuestions, QUESTIONS } from "@/lib/questions";
import type { CreatorLevel } from "@/components/OnboardingBranch";

const MIN_ANSWER_LENGTH = 10;
const MAX_ANSWER_LENGTH = 500;
const MAX_FOLLOWUPS_PER_QUESTION = 2;

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
    [/유튜브|인스타|틱톡|브이로그/, "콘텐츠 만드는 걸 즐기시는군요!"],
    [/구독자|조회수|팔로워/, "성장에 대한 열정이 느껴져요."],
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

export function useCoachingFlow() {
  const [level, setLevel] = useState<CreatorLevel | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [isInFollowUp, setIsInFollowUp] = useState(false);
  const answersRef = useRef<Record<string, string>>({});
  const followUpAnswersRef = useRef<string[]>([]);

  const questions = level ? getQuestions(level) : QUESTIONS;
  const isComplete = questionIndex >= questions.length;
  const currentQuestion = isComplete ? null : questions[questionIndex];
  const progress = { current: questionIndex + 1, total: questions.length };

  const selectLevel = useCallback((selectedLevel: CreatorLevel) => {
    setLevel(selectedLevel);
  }, []);

  const validateAnswer = useCallback((text: string): string | null => {
    const trimmed = text.trim();
    if (trimmed.length < MIN_ANSWER_LENGTH) {
      return "조금 더 자세히 이야기해주세요.";
    }
    return null;
  }, []);

  const sanitizeAnswer = useCallback((text: string): string => {
    return text.trim().slice(0, MAX_ANSWER_LENGTH);
  }, []);

  const canDoFollowUp = followUpCount < MAX_FOLLOWUPS_PER_QUESTION;

  const submitAnswer = useCallback(
    (text: string): { insight: string; nextQuestion: string | null; isLast: boolean } => {
      const sanitized = sanitizeAnswer(text);

      if (isInFollowUp) {
        // Store follow-up answer under a sub-key
        const baseKey = questions[questionIndex].id;
        const fKey = `${baseKey}_f${followUpCount}`;
        answersRef.current[fKey] = sanitized;
        followUpAnswersRef.current.push(sanitized);
        setIsInFollowUp(false);

        // After follow-up, advance to next core question
        const insight = generateInsight(sanitized, questionIndex);
        const nextIdx = questionIndex + 1;
        const isLast = nextIdx >= questions.length;
        setQuestionIndex(nextIdx);
        setFollowUpCount(0);

        return {
          insight,
          nextQuestion: isLast ? null : questions[nextIdx].question,
          isLast,
        };
      }

      // Core question answer
      const qId = questions[questionIndex].id;
      answersRef.current[qId] = sanitized;
      followUpAnswersRef.current.push(sanitized);

      const insight = generateInsight(sanitized, questionIndex);
      const nextIdx = questionIndex + 1;
      const isLast = nextIdx >= questions.length;

      // Don't advance yet — caller may trigger a follow-up
      return {
        insight,
        nextQuestion: isLast ? null : questions[nextIdx].question,
        isLast,
      };
    },
    [questionIndex, questions, sanitizeAnswer, isInFollowUp, followUpCount],
  );

  const startFollowUp = useCallback((followUpQuestion: string) => {
    setFollowUpCount((c) => c + 1);
    setIsInFollowUp(true);
    // Don't advance questionIndex — we're still on the same core Q
  }, []);

  const skipFollowUp = useCallback(() => {
    // Advance to next core question
    const nextIdx = questionIndex + 1;
    setQuestionIndex(nextIdx);
    setFollowUpCount(0);
    setIsInFollowUp(false);
  }, [questionIndex]);

  const getAnswers = useCallback(() => answersRef.current, []);
  const getPreviousAnswers = useCallback(() => followUpAnswersRef.current, []);

  return {
    level,
    selectLevel,
    questionIndex,
    currentQuestion,
    progress,
    isComplete,
    isInFollowUp,
    canDoFollowUp,
    validateAnswer,
    submitAnswer,
    startFollowUp,
    skipFollowUp,
    getAnswers,
    getPreviousAnswers,
  };
}
