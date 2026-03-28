import type { CreatorLevel } from "@/components/OnboardingBranch";

interface Question {
  id: string;
  question: string;
  placeholder: string;
}

// Beginner: discovering strengths from scratch
const BEGINNER_QUESTIONS: Question[] = [
  {
    id: "q1",
    question: "시간 가는 줄 모르고 빠져드는 순간은 언제인가요?",
    placeholder: "예: 혼자서 그림 그릴 때, 요리할 때, 코딩할 때...",
  },
  {
    id: "q2",
    question: "친구들이 당신에게 자주 조언을 구하는 분야는?",
    placeholder: "예: 감정 상담, 패션, 기술적 문제...",
  },
  {
    id: "q3",
    question: "어릴 때 가장 즐거웠던 활동은?",
    placeholder: "예: 레고 만들기, 일기 쓰기, 노래 부르기...",
  },
  {
    id: "q4",
    question: "다른 사람보다 쉽게 하는 일이 있다면?",
    placeholder: "예: 사람들을 편하게 하기, 글쓰기, 정리 정돈...",
  },
  {
    id: "q5",
    question: "가장 최근에 몰입했던 경험은?",
    placeholder: "예: 게임, 프로젝트, 새로운 취미...",
  },
];

// Active creators: refining what's working
const ACTIVE_QUESTIONS: Question[] = [
  {
    id: "q1",
    question: "현재 어떤 콘텐츠를 만들고 계신가요?",
    placeholder: "예: 유튜브 브이로그, 인스타 릴스, 블로그...",
  },
  {
    id: "q2",
    question: "콘텐츠를 만들 때 가장 즐거운 순간은?",
    placeholder: "예: 촬영할 때, 편집할 때, 댓글 읽을 때...",
  },
  {
    id: "q3",
    question: "시청자/팔로워에게 가장 반응이 좋았던 콘텐츠는?",
    placeholder: "예: 특정 주제, 특정 형식, 특정 분위기...",
  },
  {
    id: "q4",
    question: "지금 콘텐츠 활동에서 가장 답답한 부분은?",
    placeholder: "예: 아이디어 고갈, 조회수 정체, 방향성 고민...",
  },
  {
    id: "q5",
    question: "1년 후 어떤 크리에이터가 되고 싶으세요?",
    placeholder: "예: 구독자 만 명, 풀타임 크리에이터, 특정 분야 전문가...",
  },
];

export function getQuestions(level: CreatorLevel): Question[] {
  return level === "active" ? ACTIVE_QUESTIONS : BEGINNER_QUESTIONS;
}

// Default export for backward compatibility
export const QUESTIONS = BEGINNER_QUESTIONS;
