import { useState, useRef, useCallback } from "react";
import { QUESTIONS } from "@/lib/questions";

const MIN_ANSWER_LENGTH = 10;
const MAX_ANSWER_LENGTH = 500;

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

export function useCoachingFlow() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const answersRef = useRef<Record<string, string>>({});

  const isComplete = questionIndex >= QUESTIONS.length;
  const currentQuestion = isComplete ? null : QUESTIONS[questionIndex];
  const progress = { current: questionIndex + 1, total: QUESTIONS.length };

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

  const submitAnswer = useCallback(
    (text: string): { insight: string; nextQuestion: string | null; isLast: boolean } => {
      const sanitized = sanitizeAnswer(text);
      const qId = QUESTIONS[questionIndex].id;
      answersRef.current[qId] = sanitized;

      const insight = generateInsight(sanitized, questionIndex);
      const nextIdx = questionIndex + 1;
      const isLast = nextIdx >= QUESTIONS.length;

      setQuestionIndex(nextIdx);

      return {
        insight,
        nextQuestion: isLast ? null : QUESTIONS[nextIdx].question,
        isLast,
      };
    },
    [questionIndex, sanitizeAnswer],
  );

  const getAnswers = useCallback(() => answersRef.current, []);

  return {
    questionIndex,
    currentQuestion,
    progress,
    isComplete,
    validateAnswer,
    submitAnswer,
    getAnswers,
  };
}
