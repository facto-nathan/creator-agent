import { useCallback, useRef } from "react";

interface QueueItem {
  content: string;
  delay: number;
  type?: string;
}

/**
 * Declarative message queue that replaces nested setTimeout chains.
 * Messages are processed sequentially with configurable delays.
 * Automatically cancels on unmount.
 */
export function useMessageQueue(
  onMessage: (content: string, type?: string) => void,
  onTypingChange: (typing: boolean) => void,
) {
  const queueRef = useRef<QueueItem[]>([]);
  const processingRef = useRef(false);
  const cancelRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    while (queueRef.current.length > 0 && !cancelRef.current) {
      const item = queueRef.current.shift()!;
      onTypingChange(true);
      await new Promise((resolve) => setTimeout(resolve, item.delay));
      if (cancelRef.current) break;
      onTypingChange(false);
      onMessage(item.content, item.type);
    }

    processingRef.current = false;
  }, [onMessage, onTypingChange]);

  const enqueue = useCallback(
    (content: string, delay = 600, type?: string) => {
      queueRef.current.push({ content, delay, type });
      processQueue();
    },
    [processQueue],
  );

  const enqueueAll = useCallback(
    (items: QueueItem[]) => {
      queueRef.current.push(...items);
      processQueue();
    },
    [processQueue],
  );

  const cancel = useCallback(() => {
    cancelRef.current = true;
    queueRef.current = [];
    onTypingChange(false);
    // Reset for future use
    setTimeout(() => {
      cancelRef.current = false;
      processingRef.current = false;
    }, 0);
  }, [onTypingChange]);

  return { enqueue, enqueueAll, cancel };
}
