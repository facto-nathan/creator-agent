import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCoachingFlow } from "../useCoachingFlow";

describe("useCoachingFlow", () => {
  it("starts at question 0", () => {
    const { result } = renderHook(() => useCoachingFlow());
    expect(result.current.questionIndex).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.progress.current).toBe(1);
    expect(result.current.progress.total).toBe(5);
  });

  it("validates answer minimum length", () => {
    const { result } = renderHook(() => useCoachingFlow());
    expect(result.current.validateAnswer("짧은")).toBe("조금 더 자세히 이야기해주세요.");
    expect(result.current.validateAnswer("이것은 충분히 긴 답변입니다")).toBeNull();
  });

  it("advances to next question on submit", () => {
    const { result } = renderHook(() => useCoachingFlow());

    let response: ReturnType<typeof result.current.submitAnswer>;
    act(() => {
      response = result.current.submitAnswer("코딩을 할 때 시간이 가는 줄 모릅니다");
    });

    expect(response!.insight).toBeTruthy();
    expect(response!.nextQuestion).toBeTruthy();
    expect(response!.isLast).toBe(false);
    expect(result.current.questionIndex).toBe(1);
  });

  it("returns isLast=true on final question", () => {
    const { result } = renderHook(() => useCoachingFlow());

    // Submit 5 answers
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.submitAnswer(`충분히 긴 답변 번호 ${i + 1} 입니다`);
      });
    }

    expect(result.current.isComplete).toBe(true);
  });

  it("stores answers accessible via getAnswers", () => {
    const { result } = renderHook(() => useCoachingFlow());

    act(() => {
      result.current.submitAnswer("코딩을 정말 좋아합니다");
    });

    const answers = result.current.getAnswers();
    expect(Object.keys(answers)).toHaveLength(1);
    expect(Object.values(answers)[0]).toBe("코딩을 정말 좋아합니다");
  });

  it("truncates answers longer than 500 chars", () => {
    const { result } = renderHook(() => useCoachingFlow());
    const longAnswer = "가".repeat(600);

    act(() => {
      result.current.submitAnswer(longAnswer);
    });

    const answers = result.current.getAnswers();
    expect(Object.values(answers)[0]).toHaveLength(500);
  });

  it("generates keyword-matched insights", () => {
    const { result } = renderHook(() => useCoachingFlow());

    let response: ReturnType<typeof result.current.submitAnswer>;
    act(() => {
      response = result.current.submitAnswer("코딩하고 프로그래밍하는 게 좋아요");
    });

    expect(response!.insight).toContain("만들기를 즐기시는");
  });
});
