import { NextResponse } from "next/server";

const VALID_EVENT_TYPES = [
  "coaching_complete",
  "dna_page_view",
  "ideas_refresh",
  "share_click",
  "cta_click",
  "return_visit",
] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, event_type, metadata } = body;

    if (!session_id || !event_type) {
      return NextResponse.json({ error: "session_id and event_type required" }, { status: 400 });
    }

    if (!VALID_EVENT_TYPES.includes(event_type)) {
      return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Graceful degradation: no tracking if Supabase not configured
      return NextResponse.json({ ok: true });
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/events`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        session_id,
        event_type,
        metadata: metadata || {},
      }),
    });

    if (!res.ok) {
      // Silent fail for tracking — don't break user experience
      console.error("Event tracking failed:", res.status);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Event tracking error:", error);
    // Always return success — tracking should never break UX
    return NextResponse.json({ ok: true });
  }
}
