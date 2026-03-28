import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_ids, user_id } = body;

    if (!session_ids?.length || !user_id) {
      return NextResponse.json({ error: "session_ids and user_id required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // Claim each session by setting user_id
    for (const sessionId of session_ids) {
      await fetch(`${supabaseUrl}/rest/v1/sessions?id=eq.${sessionId}`, {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ user_id }),
      });
    }

    return NextResponse.json({ claimed: session_ids.length });
  } catch (error) {
    console.error("Session claim error:", error);
    return NextResponse.json({ error: "Failed to claim sessions" }, { status: 500 });
  }
}
