import { describe, it, expect } from "vitest";
import {
  AnalysisResultSchema,
  CreatorDNACardSchema,
  CoachingResponseSchema,
  SessionSchema,
  SCHEMA_VERSION,
} from "../schemas";

describe("AnalysisResultSchema", () => {
  it("validates a correct analysis result", () => {
    const valid = {
      talents: ["분석력", "글쓰기", "공감"],
      emotions: ["호기심", "성취감"],
      interests: ["테크", "자기계발"],
      communication_style: "논리적이면서 따뜻한",
    };
    expect(AnalysisResultSchema.parse(valid)).toEqual(valid);
  });

  it("rejects when talents has fewer than 3 items", () => {
    const invalid = {
      talents: ["하나", "둘"],
      emotions: ["호기심"],
      interests: ["테크"],
      communication_style: "test",
    };
    expect(() => AnalysisResultSchema.parse(invalid)).toThrow();
  });

  it("rejects missing fields", () => {
    expect(() => AnalysisResultSchema.parse({})).toThrow();
  });

  it("rejects null input", () => {
    expect(() => AnalysisResultSchema.parse(null)).toThrow();
  });
});

describe("CreatorDNACardSchema", () => {
  const validCard = {
    archetype_name: "감성 큐레이터",
    archetype_icon: "heart",
    strengths: ["공감력", "분석력", "스토리텔링"],
    primary_niche: "라이프스타일",
    secondary_niche: "자기계발",
    recommended_platforms: ["YouTube"],
    mood: "따뜻하고 친근한",
    color: "#1A1714",
  };

  it("validates a correct DNA card", () => {
    expect(CreatorDNACardSchema.parse(validCard)).toEqual(validCard);
  });

  it("rejects empty strengths array", () => {
    expect(() =>
      CreatorDNACardSchema.parse({ ...validCard, strengths: [] }),
    ).toThrow();
  });

  it("rejects empty platforms array", () => {
    expect(() =>
      CreatorDNACardSchema.parse({ ...validCard, recommended_platforms: [] }),
    ).toThrow();
  });
});

describe("SessionSchema", () => {
  it("validates a complete session", () => {
    const session = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      schema_version: SCHEMA_VERSION,
      coaching_answers: { q1: "test", q2: "test" },
      dna_result: null,
      ideas: null,
      created_at: "2026-03-28T12:00:00Z",
    };
    expect(SessionSchema.parse(session)).toEqual(session);
  });

  it("rejects invalid UUID", () => {
    expect(() =>
      SessionSchema.parse({
        id: "not-a-uuid",
        schema_version: 1,
        coaching_answers: {},
        dna_result: null,
        ideas: null,
        created_at: "2026-03-28T12:00:00Z",
      }),
    ).toThrow();
  });

  it("rejects zero schema version", () => {
    expect(() =>
      SessionSchema.parse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        schema_version: 0,
        coaching_answers: {},
        dna_result: null,
        ideas: null,
        created_at: "2026-03-28T12:00:00Z",
      }),
    ).toThrow();
  });
});
