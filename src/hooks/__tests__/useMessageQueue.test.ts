import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMessageQueue } from "../useMessageQueue";

describe("useMessageQueue", () => {
  it("delivers messages in order with delays", async () => {
    const messages: string[] = [];
    const onMessage = vi.fn((content: string) => messages.push(content));
    const onTyping = vi.fn();

    const { result } = renderHook(() => useMessageQueue(onMessage, onTyping));

    act(() => {
      result.current.enqueueAll([
        { content: "first", delay: 10 },
        { content: "second", delay: 10 },
      ]);
    });

    // Wait for both messages to process
    await vi.waitFor(() => expect(messages).toEqual(["first", "second"]), { timeout: 500 });

    expect(onTyping).toHaveBeenCalled();
  });

  it("enqueues single message", async () => {
    const onMessage = vi.fn();
    const onTyping = vi.fn();

    const { result } = renderHook(() => useMessageQueue(onMessage, onTyping));

    act(() => {
      result.current.enqueue("hello", 10);
    });

    await vi.waitFor(() => expect(onMessage).toHaveBeenCalledWith("hello", undefined), { timeout: 500 });
  });

  it("passes type through to onMessage", async () => {
    const onMessage = vi.fn();
    const onTyping = vi.fn();

    const { result } = renderHook(() => useMessageQueue(onMessage, onTyping));

    act(() => {
      result.current.enqueue("card", 10, "dna-card");
    });

    await vi.waitFor(() => expect(onMessage).toHaveBeenCalledWith("card", "dna-card"), { timeout: 500 });
  });

  it("cancel stops processing", async () => {
    const onMessage = vi.fn();
    const onTyping = vi.fn();

    const { result } = renderHook(() => useMessageQueue(onMessage, onTyping));

    act(() => {
      result.current.enqueueAll([
        { content: "first", delay: 50 },
        { content: "second", delay: 50 },
        { content: "third", delay: 50 },
      ]);
    });

    // Cancel immediately
    act(() => {
      result.current.cancel();
    });

    // Wait a bit and verify not all messages were delivered
    await new Promise((r) => setTimeout(r, 200));
    expect(onMessage.mock.calls.length).toBeLessThan(3);
  });
});
