import { z } from "zod";

export const SCHEMA_VERSION = 1;

export const AnalysisResultSchema = z.object({
  talents: z.array(z.string()).min(3).max(5),
  emotions: z.array(z.string()).min(2).max(4),
  interests: z.array(z.string()).min(2).max(4),
  communication_style: z.string(),
});

export const CreatorDNACardSchema = z.object({
  archetype_name: z.string(),
  archetype_icon: z.string(),
  strengths: z.array(z.string()).min(3).max(5),
  primary_niche: z.string(),
  secondary_niche: z.string(),
  recommended_platforms: z.array(z.string()).min(1).max(3),
  mood: z.string(),
  color: z.string(),
});

export const CoachingResponseSchema = z.object({
  analysis: AnalysisResultSchema,
  creator_dna: CreatorDNACardSchema,
});

export const SessionSchema = z.object({
  id: z.string().uuid(),
  schema_version: z.number().int().positive(),
  coaching_answers: z.record(z.string()),
  dna_result: CoachingResponseSchema.nullable(),
  ideas: z.array(z.object({
    id: z.string(),
    title: z.string(),
    hook: z.string(),
    format: z.string(),
    platform: z.string(),
    tags: z.array(z.string()),
  })).nullable(),
  created_at: z.string(),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type CreatorDNACard = z.infer<typeof CreatorDNACardSchema>;
export type CoachingResponse = z.infer<typeof CoachingResponseSchema>;
export type Session = z.infer<typeof SessionSchema>;
