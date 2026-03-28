import { anthropic } from "@ai-sdk/anthropic";

/**
 * Shared Claude model instances.
 * Sonnet: DNA analysis, idea generation (quality-sensitive)
 * Haiku: follow-up questions, conversation (speed-sensitive) — used in PR 2
 */
export const sonnet = anthropic("claude-sonnet-4-20250514");

export const AI_CONFIG = {
  maxRetries: 3,
  maxOutputTokens: 2048,
} as const;
