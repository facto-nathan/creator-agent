import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession, updateSession } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { coaching_answers, dna_result } = body;

    if (!coaching_answers || typeof coaching_answers !== "object") {
      return NextResponse.json(
        { error: "coaching_answers is required" },
        { status: 400 },
      );
    }

    const id = await createSession(coaching_answers, dna_result || null);
    return NextResponse.json({ id });
  } catch (error) {
    console.error("Session create error:", error);
    return NextResponse.json(
      { error: "세션 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
  }

  try {
    const session = await getSession(id);

    if (!session) {
      return NextResponse.json(
        { error: "DNA 카드를 찾을 수 없어요." },
        { status: 404 },
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json(
      { error: "세션을 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await updateSession(id, updates);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Session update error:", error);
    return NextResponse.json(
      { error: "세션 업데이트에 실패했습니다." },
      { status: 500 },
    );
  }
}
