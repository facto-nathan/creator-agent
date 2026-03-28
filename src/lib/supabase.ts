import { createClient } from "@supabase/supabase-js";
import { SCHEMA_VERSION, type CoachingResponse } from "./schemas";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function createSession(
  coachingAnswers: Record<string, string>,
  dnaResult: CoachingResponse | null = null,
): Promise<string> {
  const supabase = getClient();
  const id = crypto.randomUUID();

  const { error } = await supabase.from("sessions").insert({
    id,
    schema_version: SCHEMA_VERSION,
    coaching_answers: coachingAnswers,
    dna_result: dnaResult,
    ideas: null,
  });

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return id;
}

export async function getSession(id: string) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function updateSession(
  id: string,
  updates: {
    dna_result?: CoachingResponse;
    ideas?: unknown[];
  },
) {
  const supabase = getClient();

  const { error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(`Failed to update session: ${error.message}`);
}
