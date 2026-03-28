import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

const ratelimit = isConfigured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, "1 m"),
      analytics: true,
      prefix: "creator-coaching",
    })
  : null;

const DAILY_BUDGET_KEY = "daily-budget";
const DAILY_BUDGET_LIMIT = 500;

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip rate limiting for non-AI routes
  if (
    request.nextUrl.pathname === "/api/og" ||
    request.nextUrl.pathname === "/api/session"
  ) {
    return NextResponse.next();
  }

  if (!ratelimit) {
    return NextResponse.next();
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  // Per-IP rate limit
  const { success, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "잠시 후 다시 시도해주세요." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": remaining.toString() },
      },
    );
  }

  // Daily budget check
  try {
    const redis = Redis.fromEnv();
    const today = new Date().toISOString().slice(0, 10);
    const key = `${DAILY_BUDGET_KEY}:${today}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 86400);
    }

    if (count > DAILY_BUDGET_LIMIT) {
      return NextResponse.json(
        { error: "일일 사용량을 초과했습니다. 내일 다시 시도해주세요." },
        { status: 429 },
      );
    }
  } catch {
    // Redis failure should not block requests
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
