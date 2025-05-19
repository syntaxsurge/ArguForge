import type { Message } from "@/types";

import { cn } from "./cn";

/**
 * Format a number of seconds to a zero-padded `mm:ss` string.
 */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

/**
 * Throttle execution of a function to at most once every `delay` ms.
 */
export function throttle<T extends (...args: any[]) => unknown>(
  fn: T,
  delay: number,
): T {
  let last = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = delay - (now - last);

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      last = now;
      fn.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        last = Date.now();
        timeout = null;
        fn.apply(this, args);
      }, remaining);
    }
  } as T;
}

/**
 * Safely extract the latest OpenAI usage block from a list of messages.
 * Returns zeroes if none are found.
 */
export function extractTokenUsage(messages: Message[]): {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
} {
  const latestUsage = messages.filter((m) => m.type === "response.done").at(-1)
    ?.response?.usage;

  return {
    totalTokens: latestUsage?.total_tokens ?? 0,
    inputTokens: (latestUsage as any)?.input_tokens ?? 0,
    outputTokens: (latestUsage as any)?.output_tokens ?? 0,
  };
}

export { cn };
