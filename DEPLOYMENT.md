# Deployment (Vercel)

## Prerequisites

- This project is a Next.js App Router app.
- API routes call Anthropic via Vercel AI SDK.

## Environment Variables (Vercel Project Settings)

- `ANTHROPIC_API_KEY`

Do not commit any `.env*` files. Local development uses `.env.local`.

## Deploy via GitHub → Vercel

1. Push this repository to GitHub.
2. In Vercel Dashboard → **Add New** → **Project** → Import the GitHub repo.
3. Framework preset: **Next.js** (auto-detected).
4. Set the environment variable `ANTHROPIC_API_KEY` for Production (and Preview if needed).
5. Deploy.

## Notes

- If API routes fail at runtime, double-check `ANTHROPIC_API_KEY` is set in Vercel.
- Recommended: keep Next.js on the latest patched 15.x release.
